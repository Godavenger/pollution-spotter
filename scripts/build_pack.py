"""Build the Pollution Spotter planning pack from its reviewed JSON sources.

This generates planning documents only; it does not implement or test the app.
Run: python scripts/build_pack.py
Dependencies: reportlab, pypdf, Pillow, PyMuPDF.
"""
from __future__ import annotations

import html
import json
import re
import zipfile
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Flowable, Paragraph, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
PLANNING = ROOT / "planning"
QA = PLANNING / "qa"
PDF_PATH = ROOT / "Pollution_Spotter_4_Member_Pipeline.pdf"
ZIP_PATH = ROOT / "Pollution_Spotter_GitHub_Pack.zip"
PAGE_W, PAGE_H = A4
MARGIN = 42
WIDTH = PAGE_W - 2 * MARGIN
TOP = PAGE_H - 65
BOTTOM = 51
AVAILABLE = TOP - BOTTOM
TOTAL_PAGES = 22
NAVY = colors.HexColor("#102D3E")
TEAL = colors.HexColor("#007E78")
TEAL_LIGHT = colors.HexColor("#EAF6F3")
INK = colors.HexColor("#203B48")
MUTED = colors.HexColor("#526B76")
RULE = colors.HexColor("#D6E4E6")
CREAM = colors.HexColor("#F8FBFA")
WHITE = colors.white
FONT = "PS-Segoe"
BOLD = "PS-Segoe-Bold"
ITALIC = "PS-Segoe-Italic"
MONO = "PS-Mono"
ROLE_SHORT = {
    "M1": "Frontend & reporting",
    "M2": "Backend & deployment",
    "M3": "Vision & evaluation",
    "M4": "Map, integration & demo",
}


def load_sources():
    roles = []
    for path in sorted(PLANNING.glob("roles_*.json")):
        roles.extend(json.loads(path.read_text(encoding="utf-8-sig"))["roles"])
    roles.sort(key=lambda role: role["id"])
    assert [r["id"] for r in roles] == ["M1", "M2", "M3", "M4"]
    for role in roles:
        assert len(role["tasks"]) == 12, role["id"]
        assert set(role) == {"id", "name", "mission", "owns", "reviewer", "tasks"}
        for index, task in enumerate(role["tasks"], 1):
            assert task["id"] == f"{role['id']}-{index:02d}"
            assert set(task) == {"id", "title", "window", "steps", "done", "handoff"}
            assert 2 <= len(task["steps"]) <= 4
    guide = json.loads((PLANNING / "guide.json").read_text(encoding="utf-8-sig"))
    assert len(guide["before_roles"]) == 4
    assert len(guide["after_roles"]) == 9
    for page in guide["before_roles"] + guide["after_roles"]:
        assert set(page) == {"kicker", "title", "intro", "blocks"}
        for block in page["blocks"]:
            assert block["type"] in {"text", "bullets", "table", "code", "callout"}
    return roles, guide


def register_fonts():
    fonts = Path("C:/Windows/Fonts")
    candidates = [
        (fonts / "segoeui.ttf", fonts / "segoeuib.ttf", fonts / "segoeuii.ttf"),
        (fonts / "arial.ttf", fonts / "arialbd.ttf", fonts / "ariali.ttf"),
        (Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
         Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
         Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf")),
    ]
    chosen = next((group for group in candidates if all(p.exists() for p in group)), None)
    if chosen is None:
        raise RuntimeError("Install Segoe UI, Arial or DejaVu Sans before rebuilding.")
    for name, path in zip((FONT, BOLD, ITALIC), chosen):
        pdfmetrics.registerFont(TTFont(name, str(path)))
    pdfmetrics.registerFontFamily(FONT, normal=FONT, bold=BOLD, italic=ITALIC, boldItalic=BOLD)
    mono_path = fonts / "consola.ttf"
    pdfmetrics.registerFont(TTFont(MONO, str(mono_path if mono_path.exists() else chosen[0])))
    return [str(p) for p in chosen]


def rich(text: str) -> str:
    """Escape arbitrary source text, then allow basic Markdown emphasis/links."""
    value = html.escape(str(text))
    value = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"`([^`]+)`", r'<font color="#007E78">\1</font>', value)
    value = re.sub(
        r"\[([^\]]+)\]\(([^\s)]+)\)",
        r'<link href="\2" color="#007E78"><u>\1</u></link>', value,
    )
    return value.replace("\n", "<br/>")


def styles(size=10.0, compact=False):
    leading = size * (1.22 if compact else 1.30)
    return {
        "body": ParagraphStyle("body", fontName=FONT, fontSize=size, leading=leading,
                               textColor=INK, spaceAfter=0, splitLongWords=True),
        "small": ParagraphStyle("small", fontName=FONT, fontSize=max(9, size - .4),
                                leading=max(11.0, leading - .5), textColor=MUTED),
        "table": ParagraphStyle("table", fontName=FONT, fontSize=max(9, size - .4),
                                leading=max(11, leading - .5), textColor=INK),
        "table_head": ParagraphStyle("table_head", fontName=BOLD, fontSize=max(9, size - .4),
                                     leading=max(11, leading - .5), textColor=WHITE),
        "kicker": ParagraphStyle("kicker", fontName=BOLD, fontSize=9, leading=12,
                                 textColor=TEAL, spaceAfter=0),
        "title": ParagraphStyle("title", fontName=BOLD, fontSize=25 if compact else 27,
                                leading=30 if compact else 33, textColor=NAVY),
        "heading": ParagraphStyle("heading", fontName=BOLD, fontSize=max(10.5, size + 1),
                                  leading=max(13, leading + 1), textColor=NAVY),
        "task_title": ParagraphStyle("task_title", fontName=BOLD, fontSize=max(10, size + .4),
                                     leading=max(12, leading + .3), textColor=NAVY),
        "time": ParagraphStyle("time", fontName=BOLD, fontSize=9, leading=11,
                               textColor=TEAL, alignment=TA_RIGHT),
        "code": ParagraphStyle("code", fontName=MONO, fontSize=9, leading=11.5,
                               textColor=INK, splitLongWords=True),
    }


def para(text, style):
    return Paragraph(rich(text), style)


def owns_text(role):
    return "; ".join(role["owns"]) if isinstance(role["owns"], list) else role["owns"]


class Rule(Flowable):
    def __init__(self, color=RULE, after=9):
        super().__init__()
        self.color = color
        self.height = after + 1

    def wrap(self, width, height):
        self.width = width
        return width, self.height

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(.55)
        self.canv.line(0, self.height - 1, self.width, self.height - 1)


class TaskCard(Flowable):
    def __init__(self, task, style_set, compact=False):
        super().__init__()
        self.task = task
        self.s = style_set
        self.compact = compact
        self.items = []

    def wrap(self, width, height):
        self.width = width
        self.items = []
        title = para(f"{self.task['id']}  {self.task['title']}", self.s["task_title"])
        time = para(self.task["window"], self.s["time"])
        title_w = width - 93
        _, th = title.wrap(title_w, 1000)
        _, rh = time.wrap(72, 1000)
        header_h = max(th, rh, 12)
        self.items.append((title, 15, title_w, header_h))
        self.time_item = (time, width - 72, 72, rh)
        cursor = header_h + (3 if self.compact else 4)
        for index, step in enumerate(self.task["steps"], 1):
            p = para(f"{index}. {step}", self.s["body"])
            _, ph = p.wrap(width - 15, 1000)
            self.items.append((p, 15, width - 15, ph, cursor))
            cursor += ph + (.5 if self.compact else 1.3)
        for label, key in (("Done", "done"), ("Handoff", "handoff")):
            p = para(f"**{label}:** {self.task[key]}", self.s["small"])
            _, ph = p.wrap(width - 15, 1000)
            self.items.append((p, 15, width - 15, ph, cursor))
            cursor += ph + (1 if self.compact else 1.8)
        self.height = cursor + (6 if self.compact else 9)
        return width, self.height

    def draw(self):
        c = self.canv
        c.setStrokeColor(TEAL)
        c.setLineWidth(.85)
        c.roundRect(0, self.height - 10.2, 8, 8, 1.2, stroke=1, fill=0)
        title, x, w, ph = self.items[0]
        title.drawOn(c, x, self.height - ph)
        time, tx, tw, rh = self.time_item
        time.drawOn(c, tx, self.height - rh)
        for p, x, w, ph, offset in self.items[1:]:
            p.drawOn(c, x, self.height - offset - ph)
        c.setStrokeColor(RULE)
        c.setLineWidth(.45)
        c.line(15, 2, self.width, 2)


def page_heading(page, s):
    return [para(page["kicker"].upper(), s["kicker"]), Spacer(1, 5),
            para(page["title"], s["title"]), Spacer(1, 8),
            para(page["intro"], s["body"]), Spacer(1, 12)]


def table_widths(headers, rows):
    # Avoid giant free-text columns squeezing identifiers to single characters.
    n = len(headers)
    weights = []
    for col in range(n):
        values = [str(headers[col])] + [str(row[col]) for row in rows]
        average = sum(min(90, len(value)) for value in values) / len(values)
        weights.append(max(12, min(42, average)) ** .65)
    total = sum(weights)
    return [WIDTH * value / total for value in weights]


def guide_flow(page, size=10, compact=False):
    s = styles(size, compact)
    flow = page_heading(page, s)
    gap = 7 if compact else 10
    for block in page["blocks"]:
        if block.get("heading"):
            flow.extend([para(block["heading"], s["heading"]), Spacer(1, 4)])
        kind = block["type"]
        if kind == "text":
            flow.append(para(block["text"], s["body"]))
        elif kind == "bullets":
            for item in block["items"]:
                marker = "" if re.match(r"^\d+[.)]\s", item) else "•"
                item_table = Table([[para(marker, s["body"]), para(item, s["body"])]],
                                   colWidths=[12, WIDTH - 12])
                item_table.setStyle(TableStyle([
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
                ]))
                flow.append(item_table)
        elif kind == "table":
            headers, rows = block["headers"], block["rows"]
            assert all(len(row) == len(headers) for row in rows)
            data = [[para(cell, s["table_head"]) for cell in headers]]
            data += [[para(str(cell), s["table"]) for cell in row] for row in rows]
            t = Table(data, colWidths=table_widths(headers, rows), hAlign="LEFT")
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, WHITE]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 4 if compact else 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4 if compact else 5),
                ("LINEBELOW", (0, 0), (-1, 0), .5, NAVY),
                ("LINEBELOW", (0, 1), (-1, -1), .4, RULE),
            ]))
            flow.append(t)
        elif kind in {"code", "callout"}:
            if kind == "code":
                code = html.escape(block["text"]).replace(" ", "&#160;").replace("\n", "<br/>")
                p = Paragraph(code, s["code"])
            else:
                p = para(block["text"], s["body"])
            t = Table([[p]], colWidths=[WIDTH])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), TEAL_LIGHT if kind == "callout" else CREAM),
                ("LINEBEFORE", (0, 0), (0, 0), 2.4, TEAL),
                ("LEFTPADDING", (0, 0), (-1, -1), 11),
                ("RIGHTPADDING", (0, 0), (-1, -1), 11),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]))
            flow.append(t)
        flow.append(Spacer(1, gap))
    return flow


def role_flow(role, half, size=9.6, compact=False):
    s = styles(size, compact)
    start = half * 6
    tasks = role["tasks"][start:start + 6]
    page = {
        "kicker": f"{role['id']} / TASKS {start + 1:02d}–{start + 6:02d} / {'BUILD' if half == 0 else 'INTEGRATE & VERIFY'}",
        "title": ROLE_SHORT[role["id"]],
        "intro": role["mission"],
    }
    flow = page_heading(page, s)
    flow.append(para(f"**Owner:** @member{role['id'][-1]} (replace)  |  **Reviewer:** {role['reviewer']}", s["small"]))
    if half == 0:
        flow.extend([Spacer(1, 3), para(f"**Owns:** {owns_text(role)}", s["small"])])
    flow.extend([Spacer(1, 8), Rule(after=6)])
    flow.extend(TaskCard(task, s, compact) for task in tasks)
    return flow


def measure(flow, c):
    heights = []
    for item in flow:
        _, height = item.wrapOn(c, WIDTH, AVAILABLE)
        heights.append(height)
    return sum(heights), heights


def choose_layout(builder, c, role=False):
    choices = ([(9.6, False), (9.4, False), (9.2, True), (9.0, True)] if role else
               [(10.2, False), (10.0, False), (9.7, False), (9.4, True), (9.2, True), (9.0, True)])
    attempts = []
    for size, compact in choices:
        flow = builder(size, compact)
        used, heights = measure(flow, c)
        attempts.append({"font": size, "compact": compact, "height": round(used, 2)})
        if used <= AVAILABLE:
            return flow, heights, size, used, compact
    raise ValueError(f"Page cannot fit at 9pt; edit/restructure source instead of clipping. Attempts: {attempts}")


def footer(c, page):
    c.setStrokeColor(RULE)
    c.setLineWidth(.6)
    c.line(MARGIN, 40, PAGE_W - MARGIN, 40)
    c.setFont(FONT, 9)
    c.setFillColor(MUTED)
    c.drawString(MARGIN, 25, "POLLUTION SPOTTER  /  TEAM PIPELINE")
    c.setFont(BOLD, 9)
    c.setFillColor(TEAL)
    c.drawRightString(PAGE_W - MARGIN, 25, f"{page:02d} / {TOTAL_PAGES}")


def chrome(c, page, title):
    c.setFillColor(WHITE)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setFillColor(TEAL)
    c.roundRect(MARGIN, PAGE_H - 36, 13, 13, 3, stroke=0, fill=1)
    c.setFont(BOLD, 9)
    c.setFillColor(NAVY)
    c.drawString(MARGIN + 20, PAGE_H - 32, "POLLUTION SPOTTER")
    c.setFont(FONT, 9)
    c.setFillColor(MUTED)
    c.drawRightString(PAGE_W - MARGIN, PAGE_H - 32, "24H CORE  /  36H OPTIONAL")
    c.bookmarkPage(f"page-{page}")
    c.addOutlineEntry(title, f"page-{page}", level=0, closed=False)
    footer(c, page)


def draw_flow(c, flow, heights):
    cursor = TOP
    for item, height in zip(flow, heights):
        cursor -= height
        assert cursor >= BOTTOM - .1, f"Overflow by {BOTTOM - cursor:.1f}pt"
        item.drawOn(c, MARGIN, cursor)
    return cursor


def draw_paragraph(c, text, x, top, width, size, color=INK, bold=False, leading=None):
    style = ParagraphStyle("cover", fontName=BOLD if bold else FONT, fontSize=size,
                           leading=leading or size * 1.25, textColor=color)
    p = para(text, style)
    _, height = p.wrap(width, PAGE_H)
    p.drawOn(c, x, top - height)
    return height


def cover(c):
    c.setFillColor(WHITE)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, 435, PAGE_W, PAGE_H - 435, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.roundRect(MARGIN, PAGE_H - 72, 38, 7, 3.5, fill=1, stroke=0)
    draw_paragraph(c, "HACKATHON EXECUTION PLAYBOOK", MARGIN, PAGE_H - 88, WIDTH, 10, colors.HexColor("#91DDD0"), True)
    draw_paragraph(c, "Pollution\nSpotter", MARGIN, PAGE_H - 126, WIDTH, 49, WHITE, True, 53)
    draw_paragraph(c, "A four-member pipeline from photo to public report.", MARGIN, 585, WIDTH - 30, 18, WHITE, False, 24)
    draw_paragraph(c, "Build a live map of visual pollution reports, then prepare a complaint the user can review and send.", MARGIN, 523, WIDTH - 35, 11.3, colors.HexColor("#D4E7E8"))
    c.setStrokeColor(colors.HexColor("#446172"))
    c.line(MARGIN, 466, PAGE_W - MARGIN, 466)
    draw_paragraph(c, "24-hour core demo  ·  Optional improvement to 36 hours  ·  48 tracked tasks", MARGIN, 452, WIDTH, 9.6, colors.HexColor("#D4E7E8"))

    draw_paragraph(c, "THE DEMO JOURNEY", MARGIN, 411, WIDTH, 9, TEAL, True)
    labels = [("01", "PHOTO", "Capture + pin"), ("02", "VISION", "Visible clues"),
              ("03", "REVIEW", "Human confirms"), ("04", "MAP", "Report density"),
              ("05", "COMPLAINT", "Copy / download")]
    node_w, gap, base_y = 92, (WIDTH - 5 * 92) / 4, 318
    for index, (num, label, caption) in enumerate(labels):
        x = MARGIN + index * (node_w + gap)
        c.setFillColor(TEAL_LIGHT)
        c.roundRect(x, base_y, node_w, 72, 6, fill=1, stroke=0)
        c.setFillColor(TEAL)
        c.circle(x + 15, base_y + 55, 8, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont(BOLD, 9)
        c.drawCentredString(x + 15, base_y + 51.8, num)
        c.setFillColor(NAVY)
        c.setFont(BOLD, 9)
        c.drawString(x + 9, base_y + 32, label)
        c.setFillColor(MUTED)
        c.setFont(FONT, 9)
        c.drawString(x + 9, base_y + 15, caption)
        if index < 4:
            arrow_x = x + node_w + 1
            c.setStrokeColor(TEAL)
            c.setLineWidth(1)
            c.line(arrow_x, base_y + 35, arrow_x + gap - 2, base_y + 35)
            c.line(arrow_x + gap - 5, base_y + 38, arrow_x + gap - 2, base_y + 35)
            c.line(arrow_x + gap - 5, base_y + 32, arrow_x + gap - 2, base_y + 35)

    draw_paragraph(c, "START WITH THE TEAM, THEN FOLLOW YOUR TASK IDs", MARGIN, 291, WIDTH, 9, TEAL, True)
    cards = [("01  ALIGN", "Pages 2–5", "Scope, stack and shared contracts", 2),
             ("02  BUILD", "Pages 6–13", "Twelve tasks for each member", 6),
             ("03  SHIP", "Pages 14–22", "Integration, GitHub and demo", 14)]
    card_gap, card_w = 10, (WIDTH - 20) / 3
    for index, (name, pages, body, target) in enumerate(cards):
        x = MARGIN + index * (card_w + card_gap)
        c.setFillColor(CREAM)
        c.setStrokeColor(RULE)
        c.roundRect(x, 184, card_w, 90, 5, fill=1, stroke=1)
        draw_paragraph(c, name, x + 11, 261, card_w - 22, 10, NAVY, True)
        draw_paragraph(c, pages, x + 11, 241, card_w - 22, 9.5, TEAL, True)
        draw_paragraph(c, body, x + 11, 222, card_w - 22, 9.5, MUTED)
        c.linkRect(f"Open {pages}", f"page-{target}", (x, 184, x + card_w, 274), relative=0, thickness=0)
    draw_paragraph(c, "M1  Frontend     M2  Backend     M3  Vision     M4  Map + demo", MARGIN, 157, WIDTH, 10, NAVY, True)
    draw_paragraph(c, "A planning pack, ready to put on GitHub. All tasks start unchecked. Replace member placeholders with your team's names; no repository or app has been created.", MARGIN, 131, WIDTH, 10, MUTED)
    c.bookmarkPage("page-1")
    c.addOutlineEntry("Start: Pollution Spotter", "page-1", level=0, closed=False)
    footer(c, 1)
    c.showPage()


def build_pdf(roles, guide):
    font_paths = register_fonts()
    c = canvas.Canvas(str(PDF_PATH), pagesize=A4, pageCompression=1)
    c.setTitle("Pollution Spotter — Four-Member Hackathon Pipeline")
    c.setAuthor("Pollution Spotter planning team")
    c.setSubject("24–36 hour execution plan, role tasks, contracts, GitHub tracking and demo acceptance")
    c.setViewerPreference("DisplayDocTitle", "true")
    cover(c)
    report = [{"page": 1, "title": "Cover", "body_font_pt": 9.5, "task_ids": []}]
    pages = [("guide", p) for p in guide["before_roles"]]
    for role in roles:
        pages += [("role", (role, 0)), ("role", (role, 1))]
    pages += [("guide", p) for p in guide["after_roles"]]
    for page_num, (kind, source) in enumerate(pages, 2):
        if kind == "guide":
            title = source["title"]
            builder = lambda size, compact, src=source: guide_flow(src, size, compact)
            ids = []
        else:
            role, half = source
            title = f"{role['id']} {ROLE_SHORT[role['id']]} — tasks {half * 6 + 1:02d}–{half * 6 + 6:02d}"
            builder = lambda size, compact, r=role, h=half: role_flow(r, h, size, compact)
            ids = [task["id"] for task in role["tasks"][half * 6:half * 6 + 6]]
        try:
            flow, heights, size, used, compact = choose_layout(builder, c, role=kind == "role")
        except Exception as exc:
            raise RuntimeError(f"Layout failed on page {page_num}: {title}: {exc}") from exc
        chrome(c, page_num, title)
        bottom = draw_flow(c, flow, heights)
        report.append({"page": page_num, "title": title, "body_font_pt": size,
                       "compact": compact, "content_height_pt": round(used, 2),
                       "available_height_pt": round(AVAILABLE, 2),
                       "bottom_y_pt": round(bottom, 2), "task_ids": ids})
        c.showPage()
    c.save()
    assert len(report) == TOTAL_PAGES
    return report, font_paths


def md_table(headers, rows):
    def cell(value):
        return str(value).replace("|", "\\|").replace("\n", "<br>")
    lines = ["| " + " | ".join(map(cell, headers)) + " |",
             "| " + " | ".join("---" for _ in headers) + " |"]
    lines.extend("| " + " | ".join(map(cell, row)) + " |" for row in rows)
    return "\n".join(lines)


def guide_markdown(page):
    lines = [f"## {page['title']}", "", f"*{page['kicker']}*", "", page["intro"], ""]
    for block in page["blocks"]:
        if block.get("heading"):
            lines += [f"### {block['heading']}", ""]
        if block["type"] in {"text", "callout"}:
            lines += [block["text"], ""]
        elif block["type"] == "bullets":
            lines += ["\n".join(f"- {item}" for item in block["items"]), ""]
        elif block["type"] == "table":
            lines += [md_table(block["headers"], block["rows"]), ""]
        elif block["type"] == "code":
            lines += ["```text", block["text"], "```", ""]
    return "\n".join(lines)


def task_markdown(task, checkbox=True):
    head = f"- [ ] **{task['id']} — {task['title']}** · {task['window']}" if checkbox else f"### {task['id']} — {task['title']} ({task['window']})"
    indent = "  " if checkbox else ""
    lines = [head, ""]
    lines += [f"{indent}{i}. {step}" for i, step in enumerate(task["steps"], 1)]
    lines += ["", f"{indent}**Done:** {task['done']}", "", f"{indent}**Handoff:** {task['handoff']}", ""]
    return "\n".join(lines)


def role_markdown(role, checkboxes=False):
    lines = [f"## {role['name']}", "", role["mission"], "",
             f"**Owner:** @member{role['id'][-1]} (placeholder; replace with actual account)", "",
             f"**Owns:** {owns_text(role)}", "", f"**Reviewer:** {role['reviewer']}", ""]
    lines += [task_markdown(task, checkboxes) for task in role["tasks"]]
    return "\n".join(lines)


def write_markdown(roles, guide):
    lines = ["# Pollution Spotter — Four-member hackathon pipeline", "",
             "**24-hour core demo · Optional improvements to 36 hours · 48 sequential member tasks**", "",
             "Photo + location → vision suggestion → human review → published map report → editable complaint.", "",
             "This is a planning pack, not an implemented application. All application paths below are files the team will create. No remote repository, Issues or deployment has been created. Replace Member 1–4 and @member1–4 placeholders.", "",
             "Read the [designed PDF](Pollution_Spotter_4_Member_Pipeline.pdf), use the [GitHub tracker](GITHUB_TRACKER.md), and follow [GitHub setup](docs/GITHUB_SETUP.md). GitHub Issue checkboxes are the shared live checklist; PDF boxes and repository Markdown do not sync with them.", ""]
    lines += [guide_markdown(page) for page in guide["before_roles"]]
    lines += [role_markdown(role) for role in roles]
    lines += [guide_markdown(page) for page in guide["after_roles"]]
    (ROOT / "PIPELINE.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")

    tracker = ["# Pollution Spotter — GitHub progress tracker", "",
               "All 48 tasks start unchecked. Copy each member's full checklist into a GitHub Issue and make those four Issues the source of truth. Replace placeholders and paste actual Issue URLs below.", "",
               "You can click checkboxes in a GitHub Issue when you have permission to edit it. In this repository Markdown file, progress changes require editing and committing the file. These copies and the PDF do not update each other automatically.", "",
               md_table(["Member", "GitHub account (replace)", "Issue URL (replace)", "Full Issue body"],
                        [[r["id"], f"@member{r['id'][-1]}", "PASTE_ISSUE_URL", f"[member-{r['id'][-1]}.md](github-issues/member-{r['id'][-1]}.md)"] for r in roles]), "",
               "**Completion rule:** check a task only after its Done condition is verified and the Issue has a PR/commit link, screenshot, test result or other evidence. Ask the named reviewer to verify integration tasks. Hours are elapsed from kickoff, not additional estimates.", "",
               "Read [the full pipeline](PIPELINE.md) for step-by-step instructions and [GitHub setup](docs/GITHUB_SETUP.md) for labels, assignments, branches and Project views.", ""]
    for role in roles:
        tracker += [f"## {role['name']}", "", f"**Owner:** @member{role['id'][-1]} (replace). **Issue:** PASTE_ISSUE_URL", ""]
        for task in role["tasks"]:
            tracker += [f"- [ ] **{task['id']} — {task['title']}** · {task['window']}",
                        f"  **Verify:** {task['done']}", ""]
    tracker += ["## Evidence comment to paste into the workstream Issue", "", "```text",
                "Task ID: M?-??", "What changed:", "Evidence (PR/commit/screenshot/test output):",
                "Done condition verified by:", "Handoff sent to:", "Remaining blocker (if any):", "```", ""]
    (ROOT / "GITHUB_TRACKER.md").write_text("\n".join(tracker), encoding="utf-8")

    issues_dir = ROOT / "github-issues"
    issues_dir.mkdir(exist_ok=True)
    for role in roles:
        member = role["id"][-1]
        body = [f"# {role['id']}: {ROLE_SHORT[role['id']]}", "",
                f"**Assignee:** @member{member} — placeholder; choose the actual teammate in GitHub's Assignees sidebar.", "",
                f"**Mission:** {role['mission']}", "", f"**Owned files:** {owns_text(role)}", "",
                f"**Reviewer:** {role['reviewer']}", "",
                "Follow tasks in order. Hours are elapsed from kickoff; tasks sharing a window are parallel work, not additive durations. Complete the 24-hour demo before optional hardening.", "",
                "Check each box only when its Done condition passes. Add a comment with task ID, PR/commit, screenshot/test evidence and reviewer confirmation. A checkbox does not run a test. Leave blocked/incomplete work unchecked and name the blocker.", "",
                "The application has not been built by this planning pack; the paths below describe future implementation work.", ""]
        body += [task_markdown(task) for task in role["tasks"]]
        body += ["## Final workstream acceptance", "",
                 "All twelve Done conditions are verified with evidence; reviewed work is merged; the downstream member has received the handoff. Close this Issue only after that check. PDF/repository checklist copies do not sync automatically.", ""]
        (issues_dir / f"member-{member}.md").write_text("\n".join(body), encoding="utf-8")

    readme = """# Pollution Spotter — Hackathon planning pack

A beginner-friendly, four-member build plan for a **24-hour demo**, with optional improvements up to **36 hours**. Capture a pond/canal photo, suggest visible pollution labels, require human review, publish to a live map, and prepare a complaint for the user to copy or download.

**This is a planning pack, not an application scaffold.** No app, remote repository, GitHub Issues or deployment has been created. Application paths in the plan describe what your team will build. All task boxes are initially unchecked.

## Start here

1. Read [the 22-page pipeline PDF](Pollution_Spotter_4_Member_Pipeline.pdf) together. The PDF cover links to the main sections.
2. Assign Member 1–4 and replace every `@member1`–`@member4` placeholder with an actual teammate's GitHub account.
3. Follow [GitHub setup](docs/GITHUB_SETUP.md): create your repository, upload the extracted pack and create four workstream Issues using the supplied bodies.
4. Follow each member's twelve tasks; check Issue boxes only when their acceptance criteria pass and attach evidence.

## Contents

| File | Purpose |
| --- | --- |
| [Pollution_Spotter_4_Member_Pipeline.pdf](Pollution_Spotter_4_Member_Pipeline.pdf) | Designed A4 playbook: scope, contracts, role tasks, integration, tracking and demo. |
| [PIPELINE.md](PIPELINE.md) | Complete editable text of the playbook. |
| [GITHUB_TRACKER.md](GITHUB_TRACKER.md) | Forty-eight task checkboxes, grouped by owner, with Issue placeholders. |
| [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) | Step-by-step repository, Issue, label, branch and Project setup. |
| [docs/APP_SETUP.md](docs/APP_SETUP.md) | Copyable starter/dependency commands and safe scaffold merging. |
| [github-issues/member-1.md](github-issues/member-1.md) | M1: frontend and reporting. |
| [github-issues/member-2.md](github-issues/member-2.md) | M2: backend, database and deployment. |
| [github-issues/member-3.md](github-issues/member-3.md) | M3: vision and evaluation. |
| [github-issues/member-4.md](github-issues/member-4.md) | M4: map, integration QA and demo. |
| [.github/ISSUE_TEMPLATE/member-workstream.md](.github/ISSUE_TEMPLATE/member-workstream.md) | Workstream Issue template. |
| [.github/ISSUE_TEMPLATE/bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md) | Reproducible integration bug template. |
| [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) | Review and evidence template. |
| [.github/labels.json](.github/labels.json) | Label definitions to create manually; uploading this file does not create labels. |
| [planning/](planning/) | Reviewed JSON content and shared planning contract. |
| [scripts/build_pack.py](scripts/build_pack.py) | Rebuilds and validates the planning documents and ZIP. |

The downloadable `Pollution_Spotter_GitHub_Pack.zip` bundles the PDF, Markdown, templates and build source. Extract its contents before uploading them to GitHub. The ZIP intentionally does not contain itself, preview renders, caches or installation records.

## How completion works

Use the four GitHub Issues as the live progress record. A person who can edit an Issue can click its task boxes. Checking boxes in a repository Markdown file requires editing and committing that file. PDF boxes are printable. **These copies do not synchronize.** A task is done only when its stated Done condition is verified and evidence is attached to the Issue.

## Proposed application stack

Next.js App Router, TypeScript and Tailwind; Supabase Postgres/private Storage/anonymous auth; server-side Gemini through `@google/genai`; React Leaflet with attributed OpenStreetMap tiles; Vercel. M3 selects an available Flash-family model and records the exact model ID after the hour-1 smoke test. There is no model training or automatic complaint sending.

The team must create the application separately and preserve these planning files. Follow the reviewed shared contracts before coding. Manual fallback and mock/sample results must remain visibly labeled.

## Rebuild this pack

Use Python 3.10+ and install the document-generation dependencies:

```powershell
python -m pip install reportlab pypdf Pillow PyMuPDF
python scripts/build_pack.py
```

The builder uses Segoe UI on Windows, Arial if available, or DejaVu Sans on Linux. It validates the 22-page PDF, all 48 task IDs, unchecked tracker/Issue boxes, links and layout bounds. It also writes preview contact sheets and a layout report under `planning/qa/`, which is excluded from the ZIP. These checks validate the planning artifacts; they do not run or claim application tests.
"""
    (ROOT / "README.md").write_text(readme, encoding="utf-8")


def plain_normalize(text):
    # Compare content independently of PDF wraps, Markdown emphasis and Unicode typography.
    text = html.unescape(text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def validate_outputs(roles, guide, layout):
    reader = PdfReader(str(PDF_PATH))
    assert len(reader.pages) == TOTAL_PAGES, f"PDF has {len(reader.pages)} pages"
    extracted = [page.extract_text() or "" for page in reader.pages]
    all_text = "\n".join(extracted)
    role_text = "\n".join(extracted[5:13])
    all_ids = [task["id"] for role in roles for task in role["tasks"]]
    for task_id in all_ids:
        assert len(re.findall(rf"^{re.escape(task_id)}\s", role_text, re.M)) == 1, task_id
    for info in layout:
        page_text = plain_normalize(extracted[info["page"] - 1])
        for task_id in info["task_ids"]:
            task = next(t for r in roles for t in r["tasks"] if t["id"] == task_id)
            for value in [task["title"], *task["steps"], task["done"], task["handoff"]]:
                assert plain_normalize(value) in page_text, f"Missing PDF content: {task_id}: {value[:55]}"
    guide_positions = list(range(2, 6)) + list(range(14, 23))
    for number, page in zip(guide_positions, guide["before_roles"] + guide["after_roles"]):
        page_text = plain_normalize(extracted[number - 1])
        values = [page["title"], page["intro"]]
        for block in page["blocks"]:
            if block.get("heading"):
                values.append(block["heading"])
            if block["type"] == "bullets":
                values += block["items"]
            elif block["type"] == "table":
                values += block["headers"]
                values += [str(cell) for row in block["rows"] for cell in row]
            else:
                values.append(block["text"])
        for value in values:
            assert plain_normalize(value) in page_text, f"Missing PDF content on page {number}: {value[:70]}"
    assert "\ufffd" not in all_text, "PDF contains Unicode replacement characters"
    assert "<br/>" not in all_text, "Unrendered line-break markup in PDF"
    for name, count in [("GITHUB_TRACKER.md", 48)] + [(f"github-issues/member-{i}.md", 12) for i in range(1, 5)]:
        content = (ROOT / name).read_text(encoding="utf-8")
        assert len(re.findall(r"^- \[ \] ", content, re.M)) == count, name
        assert not re.search(r"^- \[[xX]\] ", content, re.M), name
    document = fitz.open(str(PDF_PATH))
    link_count = 0
    outside = []
    for index, page in enumerate(document):
        for link in page.get_links():
            link_count += 1
            if link["kind"] == fitz.LINK_GOTO:
                assert 0 <= link["page"] < TOTAL_PAGES
            assert page.rect.contains(link["from"])
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                for span in line["spans"]:
                    rect = fitz.Rect(span["bbox"])
                    if not page.rect.contains(rect):
                        outside.append({"page": index + 1, "text": span["text"], "bbox": list(rect)})
    assert not outside, f"Text outside PDF page: {outside[:3]}"
    assert link_count >= 3, "Cover navigation links missing"
    # Resolve repository-relative Markdown file links; Issue URLs remain explicit placeholders.
    missing_links = []
    for path in [ROOT / "README.md", ROOT / "PIPELINE.md", ROOT / "GITHUB_TRACKER.md", ROOT / "docs/GITHUB_SETUP.md", ROOT / "docs/APP_SETUP.md"]:
        content = path.read_text(encoding="utf-8")
        for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", content):
            if re.match(r"https?://|mailto:|#", target):
                continue
            target_path = target.split("#", 1)[0]
            if target_path and not (path.parent / target_path).exists():
                missing_links.append(f"{path.name}: {target}")
    assert not missing_links, f"Broken local links: {missing_links}"
    return {"pdf_pages": TOTAL_PAGES, "task_ids": len(all_ids), "tracker_unchecked_boxes": 48,
            "issue_unchecked_boxes": 48, "pdf_links": link_count,
            "content_checks": "All task steps/acceptance/handoffs and guide blocks found on intended pages",
            "bounds_checks": "No clipped flowables or text outside page bounds",
            "local_markdown_links": "All resolved", "application_tests": "Not run; planning pack only"}


def render_previews():
    document = fitz.open(str(PDF_PATH))
    thumb_w, thumb_h = 390, round(390 * PAGE_H / PAGE_W)
    pad, caption = 18, 25
    try:
        pil_font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 13)
    except OSError:
        pil_font = ImageFont.load_default()
    for start in range(0, TOTAL_PAGES, 6):
        sheet = Image.new("RGB", (2 * thumb_w + 3 * pad, 3 * (thumb_h + caption) + 4 * pad), "#e6eeef")
        d = ImageDraw.Draw(sheet)
        for offset in range(min(6, TOTAL_PAGES - start)):
            page = document[start + offset]
            pix = page.get_pixmap(matrix=fitz.Matrix(thumb_w / PAGE_W, thumb_w / PAGE_W), alpha=False)
            thumb = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            x = pad + (offset % 2) * (thumb_w + pad)
            y = pad + (offset // 2) * (thumb_h + caption + pad)
            sheet.paste(thumb, (x, y))
            d.text((x, y + thumb_h + 4), f"Page {start + offset + 1:02d}", font=pil_font, fill="#203b48")
        sheet.save(QA / f"contact-sheet-{start // 6 + 1}.png")
    for index in [0, 5, 7, 9, 11]:
        document[index].get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False).save(str(QA / f"page-{index + 1:02d}.png"))


def build_zip():
    files = [PDF_PATH, ROOT / "README.md", ROOT / "PIPELINE.md", ROOT / "GITHUB_TRACKER.md",
             ROOT / "docs/GITHUB_SETUP.md", ROOT / "docs/APP_SETUP.md", ROOT / "scripts/build_pack.py", PLANNING / "blueprint.md",
             PLANNING / "guide.json", *sorted(PLANNING.glob("roles_*.json"))]
    files += sorted((ROOT / "github-issues").glob("*.md"))
    files += sorted(path for path in (ROOT / ".github").rglob("*") if path.is_file())
    files = sorted(set(files))
    assert all(path.is_file() for path in files)
    with zipfile.ZipFile(ZIP_PATH, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in files:
            relative = path.relative_to(ROOT)
            assert "qa" not in relative.parts and "__pycache__" not in relative.parts
            archive.write(path, relative.as_posix())
    with zipfile.ZipFile(ZIP_PATH) as archive:
        assert archive.testzip() is None
        return archive.namelist()


def main():
    QA.mkdir(parents=True, exist_ok=True)
    roles, guide = load_sources()
    write_markdown(roles, guide)
    layout, fonts = build_pdf(roles, guide)
    checks = validate_outputs(roles, guide, layout)
    render_previews()
    archive_files = build_zip()
    report = {"checks": checks, "font_files": fonts, "layout": layout,
              "archive_files": archive_files, "pdf_bytes": PDF_PATH.stat().st_size,
              "zip_bytes": ZIP_PATH.stat().st_size}
    (QA / "layout_report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({**checks, "minimum_body_font_pt": min(row["body_font_pt"] for row in layout),
                      "pdf_bytes": report["pdf_bytes"], "zip_bytes": report["zip_bytes"],
                      "archive_entries": len(archive_files)}, indent=2))


if __name__ == "__main__":
    main()
