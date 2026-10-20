# Pollution Spotter — Hackathon planning pack

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
