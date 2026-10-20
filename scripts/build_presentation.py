"""Fill the six-slide AKI HACKS template while preserving its artwork and package.

Usage: python scripts/build_presentation.py [--template PATH]
Only slide/notes text and native content shapes are changed. The official template
is retained separately. PowerPoint can edit every added text box and diagram.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
from html import escape
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from defusedxml.minidom import parseString

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "presentations"
EMU = 914400
NS = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
INK, MUTED, GREEN, PALE, ORANGE = "182C2A", "52635F", "23665B", "EDF5F1", "F57243"


def color_xml(color: str, alpha: int | None = None) -> str:
    alpha_xml = f'<a:alpha val="{alpha}"/>' if alpha is not None else ""
    return f'<a:solidFill><a:srgbClr val="{color}">{alpha_xml}</a:srgbClr></a:solidFill>'


def paragraph(text: str, size: float = 16, bold: bool = False, color: str = INK,
              align: str = "l", after: float = 4) -> str:
    return (f'<a:p><a:pPr algn="{align}" marL="0" indent="0">'
            '<a:lnSpc><a:spcPct val="110000"/></a:lnSpc>'
            f'<a:spcAft><a:spcPts val="{int(after * 100)}"/></a:spcAft><a:buNone/></a:pPr>'
            f'<a:r><a:rPr lang="en-US" sz="{int(size * 100)}" b="{int(bold)}">'
            f'{color_xml(color)}<a:latin typeface="Arial"/><a:ea typeface="Arial"/>'
            f'<a:cs typeface="Arial"/></a:rPr><a:t xml:space="preserve">{escape(text)}</a:t></a:r>'
            f'<a:endParaRPr sz="{int(size * 100)}"/></a:p>')


def body(texts: list[dict], anchor: str = "t") -> str:
    return ('<p:txBody><a:bodyPr wrap="square" lIns="0" rIns="0" tIns="0" bIns="0" '
            f'anchor="{anchor}"><a:noAutofit/></a:bodyPr><a:lstStyle/>'
            + "".join(paragraph(**p) for p in texts) + '</p:txBody>')


def fragment(doc, xml):
    parsed = parseString(f'<root {NS}>{xml}</root>')
    return doc.importNode(parsed.documentElement.firstChild, True)


class Slide:
    def __init__(self, raw: bytes, number: int):
        self.doc = parseString(raw)
        self.tree = self.doc.getElementsByTagName('p:spTree')[0]
        self.number, self.next_id = number, 1000
        self.bounds = []

    def add(self, x, y, w, h, texts=None, fill=None, alpha=None, geom="rect", name="content"):
        shape_id = self.next_id
        self.next_id += 1
        assert x >= 0 and y >= 0 and x + w <= 10.001 and y + h <= 5.626, (name, x, y, w, h)
        self.bounds.append(dict(name=name, x=x, y=y, w=w, h=h))
        fill_xml = color_xml(fill, alpha) if fill else '<a:noFill/>'
        xml = (f'<p:sp><p:nvSpPr><p:cNvPr id="{shape_id}" name="{escape(name)}"/>'
               '<p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm>'
               f'<a:off x="{round(x*EMU)}" y="{round(y*EMU)}"/>'
               f'<a:ext cx="{round(w*EMU)}" cy="{round(h*EMU)}"/></a:xfrm>'
               f'<a:prstGeom prst="{geom}"><a:avLst/></a:prstGeom>{fill_xml}'
               '<a:ln><a:noFill/></a:ln></p:spPr>'
               + body(texts or [dict(text="", size=1)]) + '</p:sp>')
        self.tree.appendChild(fragment(self.doc, xml))

    def text(self, x, y, w, h, text, size=16, bold=False, color=INK, align="l", name="text"):
        self.add(x, y, w, h, [dict(text=line, size=size, bold=bold, color=color, align=align, after=0)
                             for line in text.split('\n')], name=name)

    def prepare(self, heading: str | None):
        # Keep original artwork, sponsor logos and header. Replace only content boxes.
        for shape in list(self.tree.childNodes):
            if getattr(shape, 'tagName', None) != 'p:sp':
                continue
            ids = shape.getElementsByTagName('p:cNvPr')
            sid = int(ids[0].getAttribute('id')) if ids else -1
            if self.number == 1 or sid in {66,67,76,77,86,87,96,97,106,107}:
                self.tree.removeChild(shape)
        if heading:
            self.text(.5, .96, 9, .52, heading, 24, True, "111111", "ctr", name="official section title")
            self.text(.6, 5.13, 7.9, .22, f'POLLUTION SPOTTER  |  AKI HACKS 2026  |  PROPOSED MVP     {self.number}/6',
                      8.5, color=MUTED, name="project footer")

    def xml(self):
        return self.doc.toxml(encoding='UTF-8')


def add_notes(raw: bytes, text: str) -> bytes:
    doc = parseString(raw)
    for sp in doc.getElementsByTagName('p:sp'):
        ph = sp.getElementsByTagName('p:ph')
        if ph and ph[0].getAttribute('type') == 'body':
            existing = sp.getElementsByTagName('p:txBody')[0]
            sp.replaceChild(fragment(doc, body([dict(text=p, size=12) for p in text.split('\n\n')])), existing)
            break
    return doc.toxml(encoding='UTF-8')


def make_slide(slide: Slide):
    n = slide.number
    headings = [None, 'PROPOSED SOLUTION', 'USER FLOW / WORKING', 'TECHNICAL APPROACH',
                'INNOVATION & DIFFERENTIATION', 'FEASIBILITY, IMPACT & FUTURE']
    slide.prepare(headings[n-1])
    if n == 1:
        # Preserve the cover panel adjustment in the team's saved PowerPoint copy.
        slide.add(2889504/EMU, 2474309/EMU, 6.2, 2.03, fill='FFFFFF', alpha=39000, geom='roundRect', name='cover information panel')
        slide.text(3.42, 2.84, 5.68, .4, 'Team Name: Pollution Spotter', 20, True)
        slide.text(3.42, 3.34, 5.68, .32, 'Team Leader Name: Sharanya Mondal', 16, True)
        slide.text(3.42, 3.84, 5.68, .22, 'PROBLEM STATEMENT', 10.5, True, GREEN)
        slide.text(3.42, 4.1, 5.58, .51, 'Make visible pond and canal pollution easier to document and report.', 14.5)
    elif n == 2:
        slide.text(.6, 1.77, 3.95, .4, 'The reporting gap', 21, True)
        slide.text(.6, 2.35, 3.92, .91, 'Residents can see floating waste or discoloured water, but a photo alone lacks a clear reporting path.', 17)
        slide.text(.6, 3.47, 3.92, .7, 'Location, reviewed observations and a usable complaint need to stay together.', 15, color=MUTED)
        slide.text(.6, 4.41, 3.92, .5, 'For residents, student volunteers and local community groups.', 12.5, True, GREEN)
        slide.add(4.95, 1.78, 4.43, 2.94, fill=PALE, geom='roundRect', name='proposed solution panel')
        slide.text(5.2, 1.99, 3.94, .43, 'One guided reporting flow', 19, True)
        steps = [('01', 'Capture', 'Add a photo and confirm its location.'),
                 ('02', 'Review', 'Correct the suggested labels and description.'),
                 ('03', 'Act', 'Publish a map report; copy a complaint draft.')]
        for idx, (num, title, desc) in enumerate(steps):
            y = 2.61 + idx*.63
            slide.text(5.21, y, .42, .3, num, 15, True, GREEN)
            slide.text(5.76, y-.02, 3.32, .29, title, 15, True)
            slide.text(5.76, y+.28, 3.29, .34, desc, 11.5, color=MUTED)
    elif n == 3:
        steps = [(1,.6,1.89,'Add a photo','JPEG, PNG or WebP\nUp to 3 MB'),
                 (2,3.73,1.89,'Confirm location','Use a map pin or\noptional GPS'),
                 (3,6.86,1.89,'Get suggestions','Gemini, or a clearly\nlabeled manual path'),
                 (4,6.86,3.54,'Review & publish','Edit labels and text;\nexplicitly confirm'),
                 (5,3.73,3.54,'View the map','Reviewed details only;\nphotos stay private'),
                 (6,.6,3.54,'Copy complaint','An editable draft;\nthe user sends it')]
        for num,x,y,title,desc in steps:
            slide.add(x,y,2.54,1.13,fill=PALE if num != 4 else 'FDECE4',geom='roundRect',name=f'step {num} panel')
            slide.text(x+.14,y+.12,.25,.27,str(num),14,True,GREEN)
            slide.text(x+.48,y+.11,1.95,.28,title,13.5,True)
            slide.text(x+.16,y+.52,2.22,.53,desc,12,color=MUTED)
        for x in (3.29,6.42):
            slide.add(x,2.33,.27,.18,fill=GREEN,geom='rightArrow',name='flow arrow')
            slide.add(x,3.98,.27,.18,fill=GREEN,geom='leftArrow',name='flow arrow')
        slide.add(8.02,3.14,.2,.27,fill=GREEN,geom='downArrow',name='review gate arrow')
        slide.text(.6,4.83,8.1,.22,'Human confirmation is required before publication. Manual fallback remains visibly labeled.',10.5,color=MUTED)
    elif n == 4:
        slide.text(.6,1.71,8.4,.33,'Proposed deployment: one TypeScript app on Vercel',16,True,GREEN)
        blocks = [(.6,2.73,2.4,1.22,'Browser','Next.js · TypeScript · Tailwind\nReact Leaflet + OpenStreetMap'),
                  (3.72,2.73,2.4,1.22,'Server routes','Validate · review · publish\nAuthenticated owner writes'),
                  (6.86,2.1,2.54,1.05,'Gemini vision','Server-side @google/genai\n12-second deadline; fallback'),
                  (6.86,3.58,2.54,1.05,'Supabase','Postgres + private Storage\nAnonymous auth; owned drafts')]
        for x,y,w,h,title,desc in blocks:
            slide.add(x,y,w,h,fill=PALE,geom='roundRect',name=f'{title} architecture node')
            slide.text(x+.15,y+.14,w-.3,.34,title,16,True)
            slide.text(x+.15,y+.57,w-.3,.53,desc,10.5,color=MUTED)
        slide.add(3.21,3.18,.3,.18,fill=GREEN,geom='rightArrow',name='browser to server')
        slide.add(6.33,2.87,.3,.18,fill=GREEN,geom='rightArrow',name='server to vision')
        slide.add(6.33,3.79,.3,.18,fill=GREEN,geom='rightArrow',name='server to database')
        slide.text(.6,4.34,5.55,.55,'Public map: reviewed fields only.\nPhotos, owner IDs and API keys remain private.',12,True,GREEN)
    elif n == 5:
        items=[(.6,1.81,'Human-reviewed by design','AI proposes visible labels. The reporter corrects them before anything is published.'),
               (5.12,1.81,'Privacy at the public map','Photos and owner IDs stay private. Only approved report details appear on the map.'),
               (.6,3.35,'Works when AI does not','A clearly labeled manual path keeps reporting usable if model access fails.'),
               (5.12,3.35,'Observation to action','Location, reviewed observations and complaint copy remain connected.')]
        for idx,(x,y,title,desc) in enumerate(items,1):
            slide.add(x,y,4.25,1.28,fill=PALE,geom='roundRect',name=f'differentiator {idx}')
            slide.text(x+.18,y+.15,3.9,.32,title,16,True)
            slide.text(x+.18,y+.61,3.85,.61,desc,12.5,color=MUTED)
        slide.text(.6,4.84,8.05,.22,'Visible observations do not establish chemical contamination or water safety.',10.5,color=MUTED)
    elif n == 6:
        slide.text(.6,1.73,8.6,.4,'Eight hours. One complete reporting journey.',21,True,GREEN)
        milestones=[('H1','Contracts'),('H3','Manual slice'),('H5','Core flow'),('H7','Freeze'),('H8','Demo')]
        for idx,(hour,label) in enumerate(milestones):
            x=.6+idx*1.77
            slide.add(x,2.35,1.49,.73,fill=PALE,geom='roundRect',name=f'{hour} milestone')
            slide.text(x+.1,2.45,1.29,.24,hour,14,True,GREEN,'ctr')
            slide.text(x+.08,2.77,1.33,.23,label,11.5,color=INK,align='ctr')
            if idx<4: slide.add(x+1.55,2.63,.16,.14,fill=GREEN,geom='rightArrow',name='milestone arrow')
        columns=[(.6,'Build','Four parallel roles:\nfrontend, backend,\nvision, map & QA.'),
                 (3.57,'Impact to validate','Can a resident create a\nclear reviewed report and\ncopy a useful complaint?'),
                 (6.54,'After the event','Density hotspots,\nmoderation and broader\nfield evaluation.')]
        for x,title,desc in columns:
            slide.text(x,3.51,2.65,.33,title,16,True)
            slide.text(x,4.01,2.65,.72,desc,13,color=MUTED)
        slide.text(.6,4.86,8.05,.21,'Current status: proposal and planning pack. Implementation follows the event rules.',10.2,color=MUTED)


NOTES = [
    'Pollution Spotter is our proposed hackathon project, led by Sharanya Mondal. The team name and leader were confirmed by the user. This is an idea-selection presentation, not evidence of an implemented product.\n\nWe want to make visible pollution observations around ponds and canals easier to document, review and turn into a structured report. The project does not determine water safety. Event: AKI HACKS, Kolkata, 31 October 2026. Official hacking time is 10:00 AM to 6:00 PM IST.',
    'Problem hypothesis: community observations often lack a consistent combination of photo, location, reviewed description and a usable reporting next step. This is a proposed problem/solution, not a measured market claim.\n\nThe MVP uses a private image upload, conservative model suggestions when available, mandatory human review, a public map of safe reviewed fields, and local complaint text that the user copies and sends. No automatic authority contact, toxicity detection or claim of official integration.',
    'The reporter selects a JPEG, PNG or WebP image up to 3 MB. They confirm location through a map pin or coordinates; GPS is optional. The server normalizes the image and strips EXIF.\n\nA private owned draft is created. Gemini attempts visible-label suggestions; a 12-second deadline or invalid output activates an explicitly labeled manual fallback. The reporter can correct labels, description and location, then explicitly publish. Publication updates the same draft row to avoid duplication.\n\nOnly safe published details reach the map. Photos, owner identifiers and storage paths remain private. The map loads and refreshes after publication, with a manual refresh control. The complaint is generated locally from confirmed fields and copied. Samples stay in a distinct sample view.',
    'Proposed stack: Next.js App Router with TypeScript and Tailwind, React Leaflet with attributed OpenStreetMap tiles, Supabase Postgres/private Storage/anonymous auth, server-side Gemini via @google/genai, and Vercel.\n\nNext.js server routes validate the session and draft owner on writes. Client code does not receive service-role or Gemini keys. Database/private-photo access is restricted. Only reviewed public fields are returned by the public reports route. The exact available Gemini model ID is chosen after the event-hour smoke test. Gemini Flash is not Gemma 4; this deck does not claim eligibility for the Gemma or open-source AI challenge.\n\nPrivacy checks and the live/manual distinction are minimum acceptance criteria, not optional polish. The diagrams describe the proposed architecture; they do not claim it has been deployed.',
    'These are design choices that distinguish the proposed workflow, not claims that no competing tool has them. Mandatory human review limits uncritical use of model labels. Private images and owner data reduce unnecessary public exposure. Manual fallback avoids pretending a provider failure succeeded. A coherent report-to-complaint flow gives the observation a next action.\n\nImage labels describe visible appearance only. Discoloured water does not prove chemical contamination, and neutral labels do not prove safety. Hotspot analysis, public photos, moderation and production-scale reliability are outside the eight-hour core.',
    'The official hacking window is eight hours, 10:00 AM to 6:00 PM IST. H1 is 11 AM, H3 is 1 PM, H5 is 3 PM, H7 is 5 PM and H8 is 6 PM. H1 establishes contracts and setup. H3 demonstrates an integrated manual or clearly mocked slice. H5 targets the live core; if model access fails, record a labeled manual fallback and leave the live-AI gate unmet. H7 freezes features. H8 is a rehearsed, honestly labeled demonstration.\n\nFour workstreams cover frontend, backend/deployment, vision, and map/integration QA. Six focused smoke cases replace a broad evaluation campaign; no accuracy percentage is claimed. The impact question is whether a person can create a clear reviewed report and copy a useful complaint. Hotspots, moderation and broader evaluation are future work.\n\nThe repository contains plans and presentation assets, not an implemented application. Pre-event coding permission and presentation submission deadlines are not specified on the public event page. Follow organizer instructions. Event source: https://events.mlh.com/events/15462-hacktoberfest-hack-day-kolkata-x-aki-hacks',
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--template', type=Path, default=DEST/'AKI_HACKS_Official_PPT_Template.pptx')
    args = parser.parse_args()
    DEST.mkdir(exist_ok=True)
    template = DEST/'AKI_HACKS_Official_PPT_Template.pptx'
    if args.template.resolve() != template.resolve():
        shutil.copy2(args.template, template)
    output = DEST/'Pollution_Spotter_AKI_HACKS.pptx'
    bounds = {}
    with ZipFile(template) as src, ZipFile(output, 'w', ZIP_DEFLATED) as dst:
        slides = [n for n in src.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml', n)]
        assert len(slides) == 6, 'Expected the official six-slide template.'
        for info in src.infolist():
            data = src.read(info.filename)
            match = re.fullmatch(r'ppt/slides/slide(\d+)\.xml', info.filename)
            note = re.fullmatch(r'ppt/notesSlides/notesSlide(\d+)\.xml', info.filename)
            if match:
                number = int(match[1])
                slide = Slide(data, number)
                make_slide(slide)
                data = slide.xml()
                bounds[str(number)] = slide.bounds
            elif note:
                data = add_notes(data, NOTES[int(note[1])-1])
            elif info.filename == 'docProps/core.xml':
                doc = parseString(data)
                for tag, value in [('dc:title', 'Pollution Spotter - AKI HACKS'),
                                   ('dc:creator', 'Pollution Spotter team'),
                                   ('cp:lastModifiedBy', 'Pollution Spotter team')]:
                    elements = doc.getElementsByTagName(tag)
                    if elements:
                        while elements[0].firstChild: elements[0].removeChild(elements[0].firstChild)
                        elements[0].appendChild(doc.createTextNode(value))
                data = doc.toxml(encoding='UTF-8')
            dst.writestr(info, data)
    qa = ROOT/'planning'/'qa'/'presentation'
    qa.mkdir(parents=True, exist_ok=True)
    (qa/'shape_bounds.json').write_text(json.dumps(bounds, indent=2), encoding='utf-8')
    print(f'Created {output} from six original template slides.')


if __name__ == '__main__':
    main()
