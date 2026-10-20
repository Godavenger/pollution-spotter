# M2: Backend & deployment

**Assignee:** @member2 — placeholder; choose the actual teammate in GitHub's Assignees sidebar.

**Mission:** Turn a private photo draft into one reviewed, published report through secure, predictable server routes.

**Owned files:** app/api/*; lib/server/*; lib/contracts.ts; lib/supabase/browser.ts (public anonymous auth only); database/*; root configuration

**Reviewer:** Member 3 reviews image/model boundaries; Member 4 verifies deployed integration.

Follow tasks in order. Hours are elapsed from kickoff; tasks sharing a window are parallel work, not additive durations. Complete the 24-hour demo before optional hardening.

Check each box only when its Done condition passes. Add a comment with task ID, PR/commit, screenshot/test evidence and reviewer confirmation. A checkbox does not run a test. Leave blocked/incomplete work unchecked and name the blocker.

The application has not been built by this planning pack; the paths below describe future implementation work.

- [ ] **M2-01 — Create the shared development foundation** · H0–1

  1. Scaffold Next.js App Router with TypeScript and Tailwind; verify supported Node LTS and commit one lockfile.
  2. Create Supabase/Vercel projects; deploy the starter; share repository and preview URL.
  3. Create .env.example with names only; keep real .env.local ignored. Coordinate dependency changes through M2.

  **Done:** All four members can run the starter; the Vercel HTTPS preview opens on a phone; no real secrets are committed.

  **Handoff:** M1/M4 start UI work; give M3 server environment variable names.

- [ ] **M2-02 — Freeze request, response and ownership contracts** · H1–2

  1. Define report types, label rules and schemas in lib/contracts.ts; agree POST/PATCH/GET examples with all members.
  2. Require a client_request_id UUID reused for retries; agree Bearer anonymous-session JWTs and stable error codes.
  3. Record GEMINI_MODEL, VISION_MODE and server-only key names in .env.example; only the Supabase URL/public key may use NEXT_PUBLIC.

  **Done:** All owners accept sample JSON and field names; no frontend component needs a service-role or Gemini key.

  **Handoff:** M1 sends request IDs/tokens; M3 matches VisionResult; M4 consumes PublicReport.

- [ ] **M2-03 — Build the private database and photo store** · H2–3

  1. Add database/schema.sql for reports, UTC timestamps, status/source enums and UNIQUE(owner_id, client_request_id).
  2. Create a private report-photos bucket with image MIME/size restrictions; enable anonymous sign-in.
  3. Enable report/storage RLS denying direct browser access; server routes use the service key and explicit ownership checks.

  **Done:** Schema applies cleanly; an anonymous browser client cannot read or write rows/photos directly; the server can store one test image.

  **Handoff:** Share table fields and bucket name with M3; give M1 anonymous-session setup instructions.

- [ ] **M2-04 — Implement authenticated server route boundaries** · H3–4

  1. Create server-only helpers in lib/server; verify write tokens with getUser(token) and use the verified user ID.
  2. Validate UUIDs, finite latitude/longitude ranges, note length ≤500 and allowed multipart fields; ignore client ownership/source/demo claims.
  3. Return consistent JSON errors for missing authentication, invalid inputs, unavailable services and missing/foreign drafts.

  **Done:** Missing/invalid tokens fail; two anonymous sessions cannot access each other's draft; errors give M1 an actionable retry or correction state.

  **Handoff:** M1 wires error rendering; M4 records ownership test cases.

- [ ] **M2-05 — Create one recoverable private draft** · H4–6

  1. POST /api/reports in Node: decode JPEG/PNG/WebP with sharp; reject >8 MB or >40 megapixels. Reserve is_demo=true immediately in mock mode.
  2. Reserve owner/request-ID row; store normalized ≤1600 px metadata-free photo, then image_path. M1 sends ≤3 MB.
  3. Retries reuse/resume the same row; only INSERT winner invokes AI. Storage/DB errors remain retryable.

  **Done:** One private draft survives retries; publish stays blocked until image_path exists; failed storage never reports success.

  **Handoff:** M1 renders drafts; M3 gets bytes; M4 verifies.

- [ ] **M2-06 — Connect vision with a bounded fallback** · H6–8

  1. Call M3's server-only analyzeImage({bytes,mimeType}) within a 12-second application timeout; revalidate its result.
  2. Save valid output as draft/vision; retain needs_review, unclear and manual_fallback on provider, schema or timeout failures.
  3. Guard delayed updates against published rows. Preserve explicit mock source and demo status; never log keys, photo bytes or base64.

  **Done:** Live, timeout, invalid-output and mock cases return truthful drafts; late model results cannot overwrite publication.

  **Handoff:** M1 shows review/source states; M3 verifies provider failures with M2.

- [ ] **M2-07 — Publish the reviewed report in place** · H8–10

  1. PATCH /api/reports/{id}, action=publish: authenticate owner, require stored image, validate edited location/labels.
  2. Enforce neutral exclusivity; generate complaints from reviewed labels, coordinates and UTC time, excluding private notes/contact information.
  3. Update the same row; preserve first published_at on repeat confirmation. Preserve reserved is_demo=true; mock source also forces it.

  **Done:** Only owners publish; repeated confirmation creates no duplicate; reviewed fallback publishes; mock data cannot enter the real layer.

  **Handoff:** M1 unlocks Copy/Download; M4 refreshes the map with the returned published ID.

- [ ] **M2-08 — Expose a safe public map response** · H10–12

  1. Implement GET /api/reports with published-only selection and an explicit PublicReport field allowlist.
  2. Exclude owner IDs, raw image_path fields and raw notes; add short-lived signed photo URLs and retain source/demo labels.
  3. Bound query size; document ordering/retention; verify map refresh fetches fresh results after publication.

  **Done:** H12 live upload/review/publish/map/complaint works; public JSON excludes drafts; every route preserves real/sample distinctions.

  **Handoff:** M4 uses production-shaped data for polling, hotspots and image-expiry recovery.

- [ ] **M2-09 — Test the boundaries that can break the demo** · H12–15

  1. Check cross-owner reads/publishes, invalid coordinates, oversized/corrupt images, unsupported MIME and exclusive-label violations.
  2. Retry the same request and confirmation; simulate model timeout and a delayed model response after publication.
  3. Inspect public JSON, signed-link expiry and built client assets for private fields/secrets; document failures for immediate fixes.

  **Done:** M4 reproduces ownership/privacy/retry checks; failures have truthful UI responses; no service secret reaches the browser.

  **Handoff:** Send verified cases and remaining limitations to M4.

- [ ] **M2-10 — Prepare controlled sample data and deployment** · H15–18

  1. Create local-only database/seed.ts using server credentials; mark sample rows is_demo=true and keep photos licensed/consented.
  2. Set Vercel environment values; verify Node runtime, model ID, storage and anonymous-auth configuration.
  3. Confirm provider quota/host request limits; use a small controlled dataset and bounded image/model requests.

  **Done:** Sample hotspots appear only in sample view; clients cannot set is_demo; deployment completes one real submission.

  **Handoff:** M4 receives the exact seed/reset command and dataset scope; M3 verifies live quota.

- [ ] **M2-11 — Verify the deployed phone workflow** · H18–22

  1. Join M4's phone run over HTTPS: camera/file image, location correction, live analysis, review, publish and signed-photo display.
  2. Recheck compressed upload size against Vercel limits; fix actionable errors for offline/retry and expired anonymous sessions.
  3. Run repository build/type checks; confirm preview and final deployment use the intended VISION_MODE.

  **Done:** The final URL passes the core phone journey twice; quota/network fallback remains clearly labeled; build/type checks pass.

  **Handoff:** M4 freezes the demo URL; M1 receives final error/response behavior.

- [ ] **M2-12 — Freeze the backend and hand over recovery steps** · H22–24

  1. Merge reviewed changes; record deployed commit, environment names and setup/seed commands.
  2. Give M4 recovery steps for quota failure, manual fallback and deliberate mock/sample mode; mode changes must preserve labels.
  3. Check completed GitHub Issue tasks with evidence; leave optional hardening open.

  **Done:** M4 can recover the demo from written instructions; deployment/configuration are recorded; no core backend task remains unresolved.

  **Handoff:** M4 incorporates operations notes into docs/demo.md and the judging rehearsal.

## Final workstream acceptance

All twelve Done conditions are verified with evidence; reviewed work is merged; the downstream member has received the handoff. Close this Issue only after that check. PDF/repository checklist copies do not sync automatically.
