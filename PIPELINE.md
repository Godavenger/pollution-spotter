# Pollution Spotter — Four-member hackathon pipeline

**AKI HACKS · 31 October 2026 · 10:00-18:00 IST · 24 tasks across four unassigned role slots**

Photo + location → vision suggestion → human review → published map report → editable complaint.

This is a planning pack, not an implemented application. The private [GitHub repository](https://github.com/Godavenger/pollution-spotter) exists. Sangeeta2006451 has write access; Shivi3123 and deeparkai32109-alt have pending write invitations. Godavenger is admin; M1-M4 roles are unassigned. No workstream Issues or application deployment exist. Application paths below are files the team will create.

Read the [designed PDF](Pollution_Spotter_4_Member_Pipeline.pdf), use the [GitHub tracker](GITHUB_TRACKER.md), and follow [GitHub setup](docs/GITHUB_SETUP.md). GitHub Issue checkboxes are the shared live checklist; PDF boxes and repository Markdown do not sync with them.

## One useful journey in eight hours

*01 / AKI HACKS / 31 OCTOBER 2026*

Build Pollution Spotter as a four-person MVP during the official 10:00-18:00 IST hacking window at IEM, GN Block, Sector V, Kolkata. This pack describes future work; the application has not been built.

### Start with the verified event brief

Read [docs/AKI_HACKS_EVENT_BRIEF.md](docs/AKI_HACKS_EVENT_BRIEF.md) and the [official event page](https://events.mlh.com/events/15462-hacktoberfest-hack-day-kolkata-x-aki-hacks). Detailed registration is 08:00-10:00 and judging is 18:00-20:00. The header/calendar says 09:00 start; confirm arrival with the organizers.

### Four role slots; people choose their roles

| Role | Owns | Main handoff |
| --- | --- | --- |
| M1 / Frontend | Upload, review, complaint Copy | M2 request fields; M4 map slot |
| M2 / Backend | Auth, private drafts, publish, deployment | Shared contracts and API for all |
| M3 / Vision | Conservative adapter, six smoke cases | M2 adapter; M4 honest evidence |
| M4 / Integration | Public map, gates, phone QA, demo | Full journey and final script |

### Required MVP acceptance

- A user uploads one supported photo and confirms a location; a private draft is persisted.
- Gemini suggests visible labels, or the draft clearly uses manual review. A person edits and explicitly confirms before publication.
- Published data survives refresh, appears on a public map and generates an editable complaint the user can copy.
- Private photos remain private; source/sample labels are visible; failed saving is never presented as success.

### Existing repository; no assumed assignments

The private repository is https://github.com/Godavenger/pollution-spotter. Sangeeta2006451 has write access; Shivi3123 and deeparkai32109-alt have pending write invitations. Godavenger is the admin. M1-M4 mappings are unassigned. There are 24 unchecked implementation tasks.

## Build only the path to one report

*02 / SCOPE & STACK*

Keep the familiar stack, but reduce what it must do. Create the scaffold during the permitted coding window; pre-event coding permission is not established.

### Proposed components

| Component | Purpose and boundary |
| --- | --- |
| Next.js + TypeScript + Tailwind | One phone-friendly upload/review/map page; Next.js server routes own writes. |
| Supabase | Postgres reports, private report-photos bucket, anonymous session ownership; no signup UI. |
| Gemini through @google/genai | Server-only visual suggestion; exact available model ID verified at H1. |
| React Leaflet + OpenStreetMap | Client-only pins and visible attribution; no density or hotspot computation. |
| Vercel | HTTPS preview at H1, deployed core by H5 and frozen URL at H7. |

### One end-to-end sequence

- 1. M1 gets an anonymous session, accepts a JPEG/PNG/WebP <=3 MB and collects editable coordinates or a pin.
- 2. M2 verifies the token, decodes and strips image metadata, stores the photo privately and persists a needs_review draft.
- 3. M3 returns a validated visual suggestion within 12 seconds; failure leaves an editable unclear/manual_fallback result.
- 4. M1 requires review of labels, short description and location; M2 publishes the same row after owner and input checks.
- 5. M4 refreshes published pins after confirmation; M1 builds a local complaint draft with Copy and manual text selection.

### Deliberately deferred

No hotspots, background polling, 20-image evaluation, photo gallery, client compression, private notes, complaint download/persistence, resumable uploads, automatic sending, elaborate accounts or broad production hardening. Larger photos get a clear size error. Post-event work has no assumed event-time extension.

## Small contracts protect integration

*03 / SHARED CONTRACT / FREEZE BY H1*

M2 owns lib/contracts.ts. All roles agree the payload examples by 11:00. The following are proposed implementation contracts, not existing endpoints.

### Three routes

| Route | Request / required behavior |
| --- | --- |
| POST /api/reports | Bearer session token; multipart image, latitude, longitude. Save a private needs_review draft and return its id, labels, evidence, source and is_demo. A storage/database failure is an error. |
| PATCH /api/reports/{id} | Bearer token; action=publish, labels, evidence, latitude, longitude. Verify owner, stored image and explicit review; update the same row; preserve first published_at. |
| GET /api/reports | Public read of published rows only. Default real view; a separate sample view selects is_demo=true. Return only the allowlist below. |

### Labels and vision boundary

Label = algal_bloom | oil_sheen | garbage | no_visible_pollution | unclear. Pollution labels may co-occur; either neutral label must stand alone. Validate nonempty unique allowed labels, evidence <=240 characters, finite latitude [-90,90] and longitude [-180,180]. VisionResult = {labels, evidence, review_needed:boolean}; analyzeImage({bytes:Buffer,mimeType:string}): Promise<VisionResult>. Every result needs human review.

### Private record

id, owner_id, created_at, published_at, latitude, longitude, image_path, labels, evidence, analysis_source, status, is_demo. Status is needs_review or published. analysis_source is vision, manual_fallback or mock; the browser cannot set it or is_demo. Mock mode sets is_demo=true at draft creation. Store normalized images at reports/{id}.jpg in the private bucket.

### Exact public field allowlist

```text
id, published_at, latitude, longitude,
labels, evidence, analysis_source, is_demo
```

### Minimum integrity and privacy

Verify the token server-side and match owner_id on every write. Deny direct report/storage access for both anon and authenticated client roles; keep service keys server-only. Public photos are out of scope. Disable double submission and do not auto-retry draft creation; publish is repeat-safe on the same row. A late analysis result must never edit a published report.

## Five gates, one eight-hour build

*04 / EVENT CLOCK / ALL TIMES IST*

H0 is 10:00 on Saturday 31 October 2026. These are elapsed event hours, not extra estimates per task. Workstreams run in parallel and integrate early.

### Required gate schedule

| Gate | Clock | Observable outcome |
| --- | --- | --- |
| H1 / Setup | 11:00 | Contracts, fixtures and file ownership agreed; HTTPS preview, auth/storage and model access have recorded outcomes. |
| H3 / First slice | 13:00 | Upload -> persisted private draft -> manual/sample review -> publish -> refreshed map. Identify simulated parts explicitly. |
| H5 / Core decision | 15:00 | Full persisted journey plus complaint Copy; use live vision if working, otherwise lock clearly labeled manual mode. |
| H7 / Freeze | 17:00 | Phone/privacy checks recorded, release commit fixed, demo script and backup prepared. |
| H8 / Ready | 18:00 | Rehearsed truthful demonstration ready for the announced submission and judging process. |

### Use the deadline to cut scope

- If an interface drifts, pause polish and fix that boundary together. M4 records one next action and owner for each blocker.
- If vision access fails, continue the complete manual-review workflow. Do not spend the day switching providers.
- If auth/storage cannot be made safe, disable publishing and show a labeled prototype or recorded backup; disclose that the full MVP is incomplete.
- After H5, add no features. H5-H7 is for core failures and required checks; H7-H8 is for freeze, evidence and rehearsal.

### Before the event

Use the time for planning, registration, learning and confirming organizer instructions. Rules for code prepared before the event are unknown. The selection PPT is a proposal; update claims only when the application and its results have actually been verified.

## Member 1 - Frontend and reporting

Make one clear phone-friendly journey from image selection to a reviewed report and copied complaint.

**Owner:** Unassigned role slot; choose the teammate explicitly.

**Owns:** app/page.tsx; components/report/*; components/complaint/*

**Reviewer:** M4 checks the full journey; M2 checks request contracts. Role slots are unassigned.

### M1-01 — Agree the screens and shared inputs (H0-1)

1. Agree the draft, review and public-report types with M2; use M3's labeled fixtures.
2. Sketch upload -> review -> published screens; reserve a client-only map slot for M4.

**Done:** M2 and M4 accept the component props and sample payload; role ownership is recorded.

**Handoff:** Send screen props and needed API fields to M2/M4.

### M1-02 — Build photo and location input (H1-2)

1. Add one JPEG/PNG/WebP file input, preview and a clear 3 MB size limit; reject an unsupported or oversized file.
2. Collect latitude/longitude with a map pin or editable coordinates. Offer geolocation only with manual fallback.

**Done:** A supported photo and corrected location can be submitted; denied GPS and invalid files show useful messages.

**Handoff:** M2 receives the agreed multipart payload; M4 receives the selected-location props.

### M1-03 — Complete mandatory review at the H3 gate (H2-3)

1. Submit with the anonymous session token; show loading and failure without claiming a draft was saved on error.
2. Render editable labels, description and location with live/manual/sample labels; wire a separate explicit Publish confirmation to M2's route.

**Done:** The H3 slice persists a reviewed report and refreshes M4's map; failed saving and unconfirmed drafts never appear as published success.

**Handoff:** Run the H3 slice with M2/M4 and record the remaining blocker, if any.

### M1-04 — Publish once and create complaint text (H3-5)

1. Call M2's publish route for the same draft ID; disable repeated clicks and show success only after persistence succeeds.
2. Explain that confirmed description and selected coordinates become public while the photo stays private; add editable complaint text and Copy.

**Done:** A reviewed report survives reload and appears on M4's map; copying uses confirmed fields and never sends a complaint.

**Handoff:** M4 runs the complete H5 journey; M2 gets exact error cases.

### M1-05 — Check the deployed phone journey (H5-7)

1. Run the final HTTPS URL on a phone with one supported photo, manual coordinates, review, publish and complaint copy.
2. Fix only blockers: unreadable controls, denied GPS, failed upload, unavailable AI, publish error and sample labeling.

**Done:** A teammate completes the phone flow; a failed operation never shows false success and public-data wording is visible.

**Handoff:** Give M4 the verified phone/browser and any limitations before H7 freeze.

### M1-06 — Freeze screens and support rehearsal (H7-8)

1. Merge reviewed UI work, record the deployed commit and avoid new features after H7.
2. Help capture a backup and rehearse the active live/manual/sample mode; attach actual evidence to the workstream Issue.

**Done:** The UI used in rehearsal matches the frozen deployment; incomplete work stays unchecked and every shown mode is labeled.

**Handoff:** M4 receives the final URL, known limits and backup assets.

## Member 2 - Backend and deployment

Persist owner-scoped private drafts and publish only confirmed safe fields through a working HTTPS deployment.

**Owner:** Unassigned role slot; choose the teammate explicitly.

**Owns:** app/api/*; lib/server/*; lib/contracts.ts; lib/supabase/browser.ts; database/*; root config

**Reviewer:** M3 checks the vision boundary; M4 checks privacy and persistence. Role slots are unassigned.

### M2-01 — Prove setup and freeze the small contract (H0-1)

1. Scaffold Next.js once, publish a hello-world HTTPS preview, and check Supabase database, private bucket and anonymous sign-in.
2. Own shared types and environment names; agree the three routes with M1/M3/M4 before parallel implementation.

**Done:** The preview loads and service access is verified, or the team explicitly records a prototype-only contingency.

**Handoff:** Share the preview, public configuration names and contracts; keep keys private.

### M2-02 — Implement private storage and owner checks (H1-2)

1. Create the reports schema and private report-photos bucket; deny direct table/storage access for both anon and authenticated client roles.
2. Verify the bearer token server-side for writes, check owner_id, and allow only JPEG/PNG/WebP <=3 MB decoded and normalized with metadata stripped.

**Done:** One session can create its private report data; another session and unauthenticated requests cannot edit it or read private storage.

**Handoff:** M1 gets the auth helper and upload errors; M4 gets the privacy-check procedure.

### M2-03 — Deliver the persisted H3 manual slice (H2-3)

1. POST one upload and location into a private needs_review draft; allocate one report ID and store the normalized image privately.
2. Return editable unclear/manual_fallback when analysis is unavailable; wire owner-only publish of that same row and a published-only public GET.

**Done:** A manual draft can be reviewed, published and fetched after reload; failed storage never produces a publishable report.

**Handoff:** M1/M4 run H3 against real persistence; fixture-only progress is explicitly marked.

### M2-04 — Connect vision without blocking publication review (H3-5)

1. Import M3's server-only adapter with a 12-second deadline; validate output and retain manual_fallback on failure.
2. Guard analysis updates against published rows; preserve server-set analysis_source/is_demo, require valid reviewed fields and keep the first published_at on repeat publish.

**Done:** The H5 core runs with live vision or documented manual fallback; mocks stay samples and repeat publish updates the same report.

**Handoff:** M4 records the selected H5 mode; M1 gets final response behavior.

### M2-05 — Verify the release boundaries (H5-7)

1. Run build/type checks and the privacy matrix: wrong owner, private draft, private photo, missing upload and secret exposure.
2. Run the deployed phone flow with M4; fix persistence, source-label or publication blockers before H7.

**Done:** Required checks have recorded outcomes; the public response omits private fields and only reviewed published rows are visible.

**Handoff:** Give M4 the final URL, commit, environment names and unresolved limits.

### M2-06 — Freeze deployment and record recovery (H7-8)

1. Freeze the reviewed deployment; write exact setup and recovery commands without credentials.
2. Rehearse provider failure and explicit sample mode; if storage/auth fails, keep publishing disabled and present a labeled backup/prototype.

**Done:** M4 can explain and run the chosen contingency; no demo claims a successful save when persistence failed.

**Handoff:** Send the operations note and evidence links to M4; leave future hardening open.

## Member 3 - Vision and smoke checks

Offer conservative visual suggestions with a bounded server call, honest provenance and a reliable manual fallback.

**Owner:** Unassigned role slot; choose the teammate explicitly.

**Owns:** lib/vision/*; evaluation/*; tests/vision/*

**Reviewer:** M2 checks server integration and secrets; M1 checks review wording. Role slots are unassigned.

### M3-01 — Smoke-test model access and supply fixtures (H0-1)

1. Check a currently available Gemini Flash-family vision model using @google/genai on the server; record the exact passing GEMINI_MODEL.
2. Give M1/M2 one conservative result fixture and one manual_fallback fixture even if live access is blocked.

**Done:** Live access has a recorded outcome and teammates can build without it; no key or image content is logged.

**Handoff:** M2 gets model/configuration names; M4 knows whether live AI is available.

### M3-02 — Write the conservative adapter and schema (H1-2)

1. Implement analyzeImage({bytes,mimeType}) returning allowed unique labels, evidence <=240 characters and boolean review_needed.
2. Prompt for visible clues only; reject unsupported labels, conflicting neutrals and invalid output, and apply M2's 12-second deadline.

**Done:** One valid result parses; malformed output and provider failure raise a typed failure for manual review.

**Handoff:** M2 imports the server-only adapter and validator; M1 gets plain-language labels.

### M3-03 — Verify truthfulness at the H3 slice (H2-3)

1. Run valid, unclear, malformed and unavailable-provider fixtures through M2's route.
2. Check failure uses unclear/manual_fallback; deliberate mock mode must mark is_demo=true from draft creation and remain a sample after review.

**Done:** M1/M4 can distinguish live suggestions, manual review and simulated samples; no fallback is presented as successful AI.

**Handoff:** Record H3 fixture outcomes and send any metadata/schema fix to M2.

### M3-04 — Run six focused visual smoke cases (H3-5)

1. Use six consented/licensed small images: visible litter, green surface, sheen-like surface, clean/glare, blur and mixed/ambiguous content.
2. Record provenance, expected visible cues, actual labels, source and failure; choose live or manual contingency with M2 at H5.

**Done:** Six case outcomes or explicit access failures are recorded; selected examples are not described as model accuracy.

**Handoff:** M4 gets honest examples and limitations; M1 gets any confusing wording.

### M3-05 — Fix one material error and verify the fallback (H5-7)

1. Make at most one focused prompt/schema correction for a demonstrated error; rerun affected smoke cases and preserve outcomes.
2. Check the final deployment's live request, provider failure and mock/sample labels; confirm every result still requires human review.

**Done:** The final model/prompt version and tested behavior are recorded; no unsupported water-safety or toxin claim appears.

**Handoff:** M2 freezes the prompt/model; M4 gets the verified AI explanation.

### M3-06 — Prepare evidence and freeze vision (H7-8)

1. Freeze the adapter and prompt; add smoke results, model ID and known limits to evaluation/README.md.
2. Give M4 one live example if available and a clearly labeled fallback example; rehearse without changing models late.

**Done:** Rehearsal names the active mode and uses real recorded evidence; missing live access is disclosed plainly.

**Handoff:** M4 receives demo images with provenance and a brief limitations statement.

## Member 4 - Map, integration and demo

Join the workstreams into a credible map demonstration and keep the eight-hour gates visible.

**Owner:** Unassigned role slot; choose the teammate explicitly.

**Owns:** components/map/*; integration-checks/*; docs/demo.md; GitHub workstream tracking

**Reviewer:** M1 checks map usability; M2 checks public fields. Role slots are unassigned.

### M4-01 — Set the eight-hour gates and map boundary (H0-1)

1. Record who fills M1-M4 after the team agrees; prepare four workstream Issues without inventing assignments.
2. Agree public map props with M1/M2, prepare small visibly labeled fixtures and display H1/H3/H5/H7/H8 gates.

**Done:** Each role slot is assigned by the team or clearly unassigned; shared map/report types and gate times are visible.

**Handoff:** All roles get Issue links and the next integration time.

### M4-02 — Build a pins-only public map (H1-2)

1. Render React Leaflet client-side with OpenStreetMap attribution; show published pins with confirmed description, labels, time and source.
2. Make real reports the default; put is_demo fixtures in a separate Sample view. Provide empty/error state and a Refresh action.

**Done:** Fixtures render without SSR errors, sample badges are visible, and private fields/photos are not required.

**Handoff:** M1 receives the map component; M2 receives public GET expectations.

### M4-03 — Run the H3 integration gate (H2-3)

1. Connect M1's map slot to M2's public GET and refresh after publication; do not add background polling or hotspots.
2. Run upload -> manual/sample review -> publish -> reload -> map with all roles and record the first failing boundary.

**Done:** A persisted manual flow reaches the map, or the exact missing boundary is documented as prototype-only progress.

**Handoff:** Send each blocker to its role owner; pause polish until the slice works.

### M4-04 — Accept the H5 core or lock the fallback (H3-5)

1. Run the complete flow including complaint Copy; record whether analysis was live, manual_fallback or sample/mock.
2. Check with M2 that another session cannot publish the draft and a private draft is absent from public GET.

**Done:** The end-to-end persisted flow passes, with live AI or a truthful manual fallback; unresolved core gaps are named.

**Handoff:** Tell all roles the frozen demo mode and only the blockers remaining before H7.

### M4-05 — Freeze after phone and privacy checks (H5-7)

1. Run the small QA matrix on the deployed URL, including phone upload, denied GPS, AI failure, repeat publish and sample separation.
2. Draft a three-minute rehearsal script around one report; keep the six-slide selection deck framed as a proposal until implementation is verified.

**Done:** Evidence and limitations are attached; the team freezes at 17:00 with an honest script and no new features.

**Handoff:** M1/M2/M3 receive the final blocker list and judging order.

### M4-06 — Rehearse and package the demo (H7-8)

1. Rehearse once on the frozen deployment and prepare a labeled recording/screenshots if the network fails.
2. Record actual implementation status, URL/commit and uncompleted tasks; follow the announced submission rules at 18:00.

**Done:** The team is ready at 18:00 and can clearly separate working software, fallback behavior, samples and future plans.

**Handoff:** All four members receive the demo script, backup and known limitations.

## Track work in four GitHub Issues

*05 / TEAM WORKFLOW*

The repository exists. The workstream Issue bodies in this pack are ready to use; the repository currently has no Issues, and role assignments are unconfirmed. Follow docs/GITHUB_SETUP.md for the current setup steps.

### Set up without adding ceremony

- Agree who fills M1-M4. Invitations alone do not assign a workstream; leave the role clearly unassigned until the person confirms.
- Create one Issue per file in github-issues/member-1.md through member-4.md, then paste actual Issue URLs into GITHUB_TRACKER.md.
- Each role follows six tasks in order. Use small branches and reviewed PRs; M2 owns shared contracts and dependency changes.
- Use Refs #issue for partial work. Close a workstream only after every required Done condition is verified; do not close it merely because the clock ran out.

### Evidence comment to copy

```text
Task ID: M?-??
Change and PR/commit:
Check performed and observed result:
Mode: live / manual_fallback / sample/mock
Reviewer and downstream handoff:
Remaining blocker or limitation:
```

### Where truth lives

| Artifact | How progress changes |
| --- | --- |
| GitHub Issue | An authorized editor checks a box after evidence; use this as the live record. |
| Repository Markdown | Requires editing and committing the file; it does not sync with Issue boxes. |
| Printable PDF | Boxes are for manual use; they do not update GitHub. |
| Selection PPT | Describes a proposed project. A concept flow is not a completed demo. |

### Six tasks per role, 24 total

Unchecked tasks are future work. The planning pack's PDF/layout validation does not test the application, and collaborator invitations do not prove acceptance or role assignment.

## Conservative suggestions, useful output

*06 / VISION, MAP & COMPLAINT*

Keep visible evidence separate from environmental measurement. A photo can support a visual observation; it cannot establish pollutant chemistry or whether water is safe.

### Starter vision prompt

```text
Inspect visible water-surface clues only.
Allowed labels: algal_bloom, oil_sheen, garbage,
no_visible_pollution, unclear.
Use unclear when the image does not support a label.
Neutral labels must be exclusive; avoid duplicate labels.
Return labels, brief evidence and review_needed.
No toxin, drinking-safety or confidence-percentage claims.
Human confirmation is required before publication.
```

### Six smoke cases; no accuracy claim

M3 uses consented/licensed images for litter, green surface, sheen-like surface, clean/glare, blur and mixed/ambiguous content. Record provenance, expected cues, actual output and analysis_source. Record timeouts and invalid outputs as failures; manual/mock results are not successful AI predictions. This is a functional smoke check, not a model benchmark.

### Pins-only public view

Show confirmed labels, reviewed description, time, coordinates and source. Refresh on load, after publish and on Refresh. Real reports are the default; samples appear only in a separate visibly labeled view. Show OpenStreetMap attribution. Do not infer hotspots, independent observations or environmental danger from report counts.

### Editable complaint template; Copy only

```text
Subject: Request to inspect a reported water-surface issue
Observed at: {latitude}, {longitude}
Reported at: {published_at}
Human-confirmed observation: {labels}; {description}
Please inspect this location and advise on next steps.
This is a visual observation, not a water-quality test.
```

### User controls the complaint

The user edits and copies the text, checks the recipient and sends it separately. Do not claim a municipal integration, automatic delivery or resolution. If clipboard access fails, keep the text selectable for manual copying.

## Verify the core, then freeze

*07 / REQUIRED CHECKS BEFORE H7*

Run a compact set of meaningful integration checks on the deployed URL. Record observed results; leave a failed or unrun check explicit. This matrix is a plan, not evidence that the checks have passed.

### Small acceptance matrix

| Check | Pass condition | Lead |
| --- | --- | --- |
| Core persistence | Supported photo -> review -> publish -> refresh -> one visible map report -> complaint Copy. | M1 + M4 |
| Ownership | A second anonymous session cannot publish/edit the first session's draft. | M2 + M4 |
| Privacy | Private drafts and photos are inaccessible publicly; GET contains only the published-field allowlist. | M2 + M4 |
| Failed upload/save | Unsupported/large image, missing stored image or database failure cannot create a false published success. | M2 + M1 |
| AI unavailable | Timeout/invalid output becomes unclear/manual_fallback; human review can finish the saved draft. | M3 + M2 |
| Review + repeats | Nothing publishes automatically; repeated publish uses the same row and first publication time. | M1 + M2 |
| Sample provenance | Mock starts as is_demo=true and remains so; real and sample map views are visibly separate. | M3 + M4 |
| Phone + build | Final HTTPS phone journey is usable with denied GPS/manual coordinates; build/type checks pass. | All roles |

### Release evidence

- At H3, record the first integrated persisted flow and any mocked pieces. At H5, record the chosen live/manual mode.
- At H7, save the deployed commit, URL, phone/browser, actual checks and known limitations in docs/demo.md.
- Use consented or licensed demo photos and avoid personal information in the public description or selected location.

### Minimum protections remain required

A private controlled hackathon demo still needs ownership checks, private storage and honest status. Rate limiting, abuse handling, retention/deletion workflows and wider operational hardening are post-event work before a public service launch.

## Make failure a clear state

*08 / DEPENDENCIES & FALLBACKS*

M2 owns environment configuration. Never commit keys or paste private image data into logs. M3 selects the exact model ID that is available in the team's account.

### Names-only .env.example

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=
VISION_MODE=live
```

### Three deliberate vision modes

VISION_MODE=live calls Gemini; manual skips the provider and uses analysis_source=manual_fallback; mock uses deterministic suggestions and analysis_source=mock with is_demo=true from the start. Keep service and Gemini keys server-only. Next.js server routes use the Node runtime for image normalization.

### Recovery that fits the event

| Failure | Action and honest presentation |
| --- | --- |
| Model/quota/timeout | Use manual mode at H5 if needed. Explain that the person classified the visible issue; no live AI success claim. |
| Auth/storage unavailable | Stop public writes; fix access if possible. Otherwise show a labeled prototype/backup and name the missing persistence. |
| Photo too large / GPS denied | Ask for a supported photo <=3 MB; allow coordinates or pin correction without GPS. |
| Map tiles unavailable | Keep report details and coordinates visible; show the map failure and a labeled backup if needed. |
| Network failure during demo | Use a recorded run or screenshots labeled as recorded; do not describe it as a live submission. |
| Repeated submit / uncertain save | Disable duplicate actions, avoid automatic POST retries and do not guess success; publish only the returned saved draft ID. |

### Setup is part of the eight hours

Follow [docs/APP_SETUP.md](docs/APP_SETUP.md) for starter commands and ownership. At H1, record service access and the preview outcome. A failing hello-world deploy or private-storage check is a core blocker, not a reason to claim a mock is complete software.

## Show one report clearly

*09 / DEMO & HANDOFF*

The official template is a six-slide selection presentation. The following three-minute script is a team rehearsal target, not a published organizer time limit. Adapt to the final instructions.

### Suggested rehearsal

| Time | Show | Say accurately |
| --- | --- | --- |
| 0:00-0:25 | Problem and proposed user | People need a clear way to document a visible water-surface issue; usefulness remains to be tested. |
| 0:25-1:00 | Upload and confirm location | Use one consented photo. State whether this run is live, manual or sample. |
| 1:00-1:40 | Review labels and description | The suggestion can be wrong. A person confirms the public fields; the photo remains private. |
| 1:40-2:15 | Publish and refresh map | Show persistence and the pin. Samples stay separate; no hotspot or water-safety claim. |
| 2:15-2:40 | Copy complaint | The user checks wording and recipient, then sends separately. |
| 2:40-3:00 | Evidence and limits | Name actual checks, what is still incomplete and the next useful improvement. |

### Final readiness at 18:00

- Freeze the commit and final URL by H7; rehearse once with every presenter clear about their part.
- Keep a labeled recording/screenshots and sourced images ready. Do not conceal manual review or mock results.
- Use the official PPT template and fill verified team details before submission; roles remain planning slots until agreed.
- Follow organizer submission rules. The pack does not register the team, submit the PPT or prove selection.

### After the event, if the core works

Consider user feedback, a larger independent evaluation, careful report-density visualization, access/abuse controls and photo sharing only after privacy review. Gemini usage alone does not establish Gemma 4 or open-weight challenge eligibility.
