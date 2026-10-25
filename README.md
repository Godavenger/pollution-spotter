# Pollution Spotter

A photo, a reviewed observation, and a public map pin. Pollution Spotter now has a local application implementation alongside the original four-person **AKI HACKS planning pack** for **31 October 2026, 10:00–18:00 IST**, at IEM, GN Block, Sector V, Kolkata.

**Current status:** the Next.js app, report/review interface, server API, private-storage migration, optional Gemini adapter, map, and complaint editor are implemented locally. Supabase and live Gemini integration, physical-phone checks, and an application deployment still need verification. See [build progress](docs/BUILD_PROGRESS.md) for the checks actually run. Local previews and sample pins are not published reports or evidence of a working deployment.

## Run the app

Use Node.js 24 LTS and npm from this repository's root:

```powershell
npm ci
npm run dev
```

Open the local URL printed by Next.js, normally [http://localhost:3000](http://localhost:3000). Without service credentials, choose a photo and location to try an **unsaved local review preview**. Publishing stays disabled, the photo stays in the browser, and a separate Samples view contains fictional examples. Map tiles require internet access.

To enable real persistence, follow [application setup](docs/APP_SETUP.md): configure Supabase, run [database/001_reports.sql](database/001_reports.sql), enable anonymous sign-ins, and fill the ignored `.env.local` using [.env.example](.env.example). Start with `VISION_MODE=manual`. Restart the dev server after changing environment values; production changes to `NEXT_PUBLIC_*` values require a new build.

## The implemented flow

**Photo + location → private draft → AI/manual suggestion → mandatory human review → publish → public map → editable complaint Copy.**

The app accepts one JPEG, PNG or WebP up to 3 MB. Server routes verify session ownership, normalize the photo and remove metadata, and store it in a private bucket. Only confirmed labels, a reviewed short description, selected coordinates, publication time and source metadata appear publicly. Retrying publication keeps the same report and its first publication time. Save failures remain errors; they do not become successful previews.

Gemini is optional. Manual review works without an AI key once Supabase is configured. A 12-second deadline or invalid model output falls back to manual review. Mock mode remains separately labeled from real reports. A photo cannot establish chemistry, toxicity or water safety. Complaint text is editable and copied locally; the app does not send it.

The stack is Next.js App Router, TypeScript and Tailwind; Supabase Postgres, private Storage and anonymous auth; server-side Gemini through `@google/genai`; React Leaflet with attributed OpenStreetMap tiles. Vercel remains the planned deployment target.

## Check changes

```powershell
npm test
npm run lint
npm run typecheck
npm run build
npm run test:ui
```

The browser suite starts a local server and uses Microsoft Edge through Playwright. [Application setup](docs/APP_SETUP.md) explains browser prerequisites and the remaining live-service checks. Automated tests, simulated API responses and browser viewport checks do not establish deployed persistence, model accuracy or physical-phone behavior.

## Project files

| Path | Purpose |
| --- | --- |
| [app/](app/) and [components/](components/) | Working report, review, map, guide and complaint interface; API routes. |
| [lib/contracts.ts](lib/contracts.ts) | Shared validation, labels and public report fields. |
| [lib/server/](lib/server/) | Ownership checks, image normalization, persistence and publication. |
| [lib/vision/](lib/vision/) | Optional Gemini adapter, manual fallback and [live smoke checklist](lib/vision/SMOKE_CHECKS.md). |
| [database/001_reports.sql](database/001_reports.sql) | Supabase reports table, private bucket rules and atomic publication function. |
| [tests/](tests/) | Application unit and browser tests. |
| [docs/APP_SETUP.md](docs/APP_SETUP.md) | Local setup, service configuration and deployment prerequisites. |
| [docs/BUILD_PROGRESS.md](docs/BUILD_PROGRESS.md) | Implementation stages and recorded verification. |
| [Pollution_Spotter_4_Member_Pipeline.pdf](Pollution_Spotter_4_Member_Pipeline.pdf) | Original 18-page event planning playbook; historical implementation status. |
| [PIPELINE.md](PIPELINE.md) and [planning/](planning/) | Original editable plan, reviewed JSON sources and planning contract. |
| [GITHUB_TRACKER.md](GITHUB_TRACKER.md) and [github-issues/](github-issues/) | Original 24-task tracker and proposed workstream Issue bodies. |
| [docs/AKI_HACKS_EVENT_BRIEF.md](docs/AKI_HACKS_EVENT_BRIEF.md) | Event details, schedule, template requirements and open questions. |
| [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) and [.github/](.github/) | Collaboration guidance, Issue/PR templates and labels. |
| [docs/PRESENTATION_GUIDE.md](docs/PRESENTATION_GUIDE.md) | Presentation narrative and rebuild guidance. |
| [Selection PPT](presentations/Pollution_Spotter_AKI_HACKS.pptx) and [PDF preview](presentations/Pollution_Spotter_AKI_HACKS.pdf) | Selection proposal; application results are not implied. |
| [Official template](presentations/AKI_HACKS_Official_PPT_Template.pptx) | Preserved original presentation template. |
| [scripts/](scripts/) | Original planning-pack and presentation generators. |

## Event plan and historical status

The original planning snapshot recorded the private [Godavenger/pollution-spotter](https://github.com/Godavenger/pollution-spotter) repository with `Godavenger` as admin, `Sangeeta2006451` having accepted write access, and invitations for `Shivi3123` and `deeparkai32109-alt` pending. M1–M4 were unassigned, and no workstream Issues or deployment existed at that check. These are historical access/tracking statements, not a fresh verification. The confirmed team name is **Pollution Spotter** and team leader is **Sharanya Mondal**.

The shared event gates remain **H1 setup; H3 integrated slice; H5 core or manual fallback; H7 freeze; H8 ready**. Original checkboxes have not been marked complete by creating source files. Record acceptance evidence in the workstream Issues once available; Markdown, PDF and Issue boxes do not synchronize.

Registration is listed as 08:00–10:00 and judging as 18:00–20:00; the event header/calendar has a 09:00 start discrepancy. The original brief did not establish permission to use pre-event code. Refer to the [event brief](docs/AKI_HACKS_EVENT_BRIEF.md) and organizers for the applicable event rules.

Hotspots, polling, photo galleries, client compression, complaint downloads/persistence and broader production hardening remain deferred. Six focused vision smoke cases check behavior; they are not an accuracy benchmark.

## Original generated pack

The [handoff ZIP](Pollution_Spotter_GitHub_Pack.zip), pipeline PDF and generated planning documents remain the original planning artifacts; they have not been refreshed to package this application.

**Hold off on `python scripts/build_pack.py` until its templates are updated:** it regenerates this README and would overwrite the application setup/status notes with the original planning text. The original builder requires Python 3.10+, ReportLab, pypdf, Pillow and PyMuPDF and validates the 18-page planning PDF, task IDs, links and layout. Those checks validate documents, not the app.

The presentation builder requires `defusedxml` and uses the preserved official template. See the [presentation guide](docs/PRESENTATION_GUIDE.md) before rebuilding presentation assets.
