# M2: Backend & deployment

**Assignee:** Unassigned role slot. Choose the teammate only after the team agrees; collaborator invitations are not role assignments.

**Mission:** Persist owner-scoped private drafts and publish only confirmed safe fields through a working HTTPS deployment.

**Owned files:** app/api/*; lib/server/*; lib/contracts.ts; lib/supabase/browser.ts; database/*; root config

**Reviewer:** M3 checks the vision boundary; M4 checks privacy and persistence. Role slots are unassigned.

Follow six tasks in order. H0 is 10:00 IST on 31 October 2026; H8 is 18:00. Roles run in parallel. Gates: H1 setup, H3 integrated slice, H5 core or manual fallback, H7 freeze, H8 demo ready. Post-event work is deferred.

Check each box only when its Done condition passes. Add a comment with task ID, PR/commit, screenshot/test evidence and reviewer confirmation. A checkbox does not run a test. Leave blocked/incomplete work unchecked and name the blocker.

The application has not been built by this planning pack; the paths below describe future implementation work.

- [ ] **M2-01 — Prove setup and freeze the small contract** · H0-1

  1. Scaffold Next.js once, publish a hello-world HTTPS preview, and check Supabase database, private bucket and anonymous sign-in.
  2. Own shared types and environment names; agree the three routes with M1/M3/M4 before parallel implementation.

  **Done:** The preview loads and service access is verified, or the team explicitly records a prototype-only contingency.

  **Handoff:** Share the preview, public configuration names and contracts; keep keys private.

- [ ] **M2-02 — Implement private storage and owner checks** · H1-2

  1. Create the reports schema and private report-photos bucket; deny direct table/storage access for both anon and authenticated client roles.
  2. Verify the bearer token server-side for writes, check owner_id, and allow only JPEG/PNG/WebP <=3 MB decoded and normalized with metadata stripped.

  **Done:** One session can create its private report data; another session and unauthenticated requests cannot edit it or read private storage.

  **Handoff:** M1 gets the auth helper and upload errors; M4 gets the privacy-check procedure.

- [ ] **M2-03 — Deliver the persisted H3 manual slice** · H2-3

  1. POST one upload and location into a private needs_review draft; allocate one report ID and store the normalized image privately.
  2. Return editable unclear/manual_fallback when analysis is unavailable; wire owner-only publish of that same row and a published-only public GET.

  **Done:** A manual draft can be reviewed, published and fetched after reload; failed storage never produces a publishable report.

  **Handoff:** M1/M4 run H3 against real persistence; fixture-only progress is explicitly marked.

- [ ] **M2-04 — Connect vision without blocking publication review** · H3-5

  1. Import M3's server-only adapter with a 12-second deadline; validate output and retain manual_fallback on failure.
  2. Guard analysis updates against published rows; preserve server-set analysis_source/is_demo, require valid reviewed fields and keep the first published_at on repeat publish.

  **Done:** The H5 core runs with live vision or documented manual fallback; mocks stay samples and repeat publish updates the same report.

  **Handoff:** M4 records the selected H5 mode; M1 gets final response behavior.

- [ ] **M2-05 — Verify the release boundaries** · H5-7

  1. Run build/type checks and the privacy matrix: wrong owner, private draft, private photo, missing upload and secret exposure.
  2. Run the deployed phone flow with M4; fix persistence, source-label or publication blockers before H7.

  **Done:** Required checks have recorded outcomes; the public response omits private fields and only reviewed published rows are visible.

  **Handoff:** Give M4 the final URL, commit, environment names and unresolved limits.

- [ ] **M2-06 — Freeze deployment and record recovery** · H7-8

  1. Freeze the reviewed deployment; write exact setup and recovery commands without credentials.
  2. Rehearse provider failure and explicit sample mode; if storage/auth fails, keep publishing disabled and present a labeled backup/prototype.

  **Done:** M4 can explain and run the chosen contingency; no demo claims a successful save when persistence failed.

  **Handoff:** Send the operations note and evidence links to M4; leave future hardening open.

## Final workstream acceptance

All six Done conditions are verified with evidence; reviewed work is merged; the downstream role has received the handoff. Close this Issue only after that check. Leave incomplete tasks open at the deadline. PDF/repository checklist copies do not sync automatically.
