# Pollution Spotter - AKI HACKS planning pack

A four-person, **eight-hour MVP plan** for AKI HACKS on **31 October 2026, 10:00-18:00 IST**, at IEM, GN Block, Sector V, Kolkata. Upload a photo and location, review a conservative visual suggestion or manual fallback, publish a map report, and copy an editable complaint.

**Current status:** the private [GitHub repository](https://github.com/Godavenger/pollution-spotter) exists. `Sangeeta2006451` has accepted write access; `Shivi3123` and `deeparkai32109-alt` have pending write invitations. `Godavenger` is admin; M1-M4 role assignments are unconfirmed. **The application has not been built.** The repository has no workstream Issues or application deployment. The presentation describes a proposed project; no app results or successful submission are claimed.

## Start here

1. Read the [event brief](docs/AKI_HACKS_EVENT_BRIEF.md) and the [18-page pipeline PDF](Pollution_Spotter_4_Member_Pipeline.pdf).
2. Agree who fills the four unassigned role slots. Follow [GitHub setup](docs/GITHUB_SETUP.md) to use the supplied Issue bodies.
3. Follow six tasks per role and the shared gates: **H1 setup; H3 integrated slice; H5 core or manual fallback; H7 freeze; H8 ready**.
4. Review the [six-slide selection PPT](presentations/Pollution_Spotter_AKI_HACKS.pptx) and [PDF preview](presentations/Pollution_Spotter_AKI_HACKS.pdf), built from the [official template](presentations/AKI_HACKS_Official_PPT_Template.pptx). The confirmed team name is **Pollution Spotter** and team leader is **Sharanya Mondal**. Follow the announced submission instructions.

The detailed schedule lists registration at 08:00-10:00 and judging at 18:00-20:00; the header/calendar has a 09:00 start discrepancy. Confirm arrival with organizers. Permission to use code prepared before the event is unknown; this pack does not assume it.

## The eight-hour scope

The core is one persisted end-to-end flow: **photo + location -> private draft -> AI/manual suggestion -> mandatory human review -> publish -> public map -> complaint Copy**.

Photos stay private. Only confirmed labels, a reviewed short description, selected coordinates, publication time and source metadata appear publicly. Samples stay in a clearly labeled separate view. Failed uploads, analysis or saves must not produce invented success.

Hotspots, polling, photo galleries, client compression, complaint downloads/persistence, large model evaluations and broad production hardening are deferred. Six focused visual smoke cases check behavior; they do not establish model accuracy. If Gemini is unavailable, the manual-review flow remains useful. If safe persistence fails, the team must describe the demo as an incomplete prototype.

## Contents

| File | Purpose |
| --- | --- |
| [Pollution_Spotter_4_Member_Pipeline.pdf](Pollution_Spotter_4_Member_Pipeline.pdf) | Printable A4 playbook with contracts, role tasks, checks and demo guidance. |
| [PIPELINE.md](PIPELINE.md) | Complete editable text of the playbook. |
| [GITHUB_TRACKER.md](GITHUB_TRACKER.md) | 24 unchecked implementation tasks across four unassigned roles. |
| [docs/AKI_HACKS_EVENT_BRIEF.md](docs/AKI_HACKS_EVENT_BRIEF.md) | Verified event details, schedule, template requirements and open questions. |
| [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) | Existing repository, invitations, Issues and collaboration setup. |
| [docs/APP_SETUP.md](docs/APP_SETUP.md) | Proposed scaffold, dependencies and minimum service setup. |
| [docs/PRESENTATION_GUIDE.md](docs/PRESENTATION_GUIDE.md) | Slide narrative, source/template context and presentation rebuild instructions. |
| [github-issues/](github-issues/) | Six-task Issue bodies for each role. |
| [.github/](.github/) | Workstream, bug and PR templates plus label definitions. |
| [presentations/Pollution_Spotter_AKI_HACKS.pptx](presentations/Pollution_Spotter_AKI_HACKS.pptx) | Six-slide selection proposal using the official structure. |
| [presentations/Pollution_Spotter_AKI_HACKS.pdf](presentations/Pollution_Spotter_AKI_HACKS.pdf) | Shareable presentation preview. |
| [presentations/AKI_HACKS_Official_PPT_Template.pptx](presentations/AKI_HACKS_Official_PPT_Template.pptx) | Original official template for reference. |
| [planning/](planning/) | Reviewed JSON sources and the current planning contract. |
| [scripts/build_pack.py](scripts/build_pack.py) | Rebuilds and validates the planning PDF, Markdown and handoff ZIP. |
| [scripts/build_presentation.py](scripts/build_presentation.py) | Rebuilds the proposal PPTX from the preserved official template. |

The [handoff ZIP](Pollution_Spotter_GitHub_Pack.zip) bundles the plan, presentation, official template, setup documents and build sources. Extract it before uploading files. It excludes preview renders, caches, credentials and the ZIP itself.

## Completion and implementation

Use the four GitHub Issues as the live progress record once created. A task is done only after its Done condition passes and evidence is attached. Repository Markdown requires edits/commits; PDF boxes are printable. **These copies do not synchronize.** Leave unfinished work unchecked at the event deadline.

The proposed stack is Next.js App Router, TypeScript and Tailwind; Supabase Postgres/private Storage/anonymous auth; server-side Gemini through `@google/genai`; React Leaflet with attributed OpenStreetMap tiles; Vercel. M3 verifies an available model and records the exact ID. There is no model training or automatic complaint sending. Follow the shared contracts before coding.

## Rebuild this pack

Use Python 3.10+:

```powershell
python -m pip install reportlab pypdf Pillow PyMuPDF
python scripts/build_pack.py
```

The builder uses Segoe UI, Arial or DejaVu Sans. It validates all 18 PDF pages, 24 task IDs, eight-hour task windows, unchecked tracker/Issue boxes, local links and layout bounds. Preview contact sheets and a layout report go to `planning/qa/`, excluded from Git and the ZIP. These checks validate planning artifacts; **application tests have not been run**.

To rebuild the editable presentation:

```powershell
python -m pip install defusedxml
python scripts/build_presentation.py
```

Export the rebuilt PPTX to PDF through PowerPoint or a compatible renderer, then rerun `python scripts/build_pack.py` to refresh the ZIP. See the [presentation guide](docs/PRESENTATION_GUIDE.md) for details.
