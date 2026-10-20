# Pollution Spotter — planning contract

Deliver a planning pack, not an implemented app. Audience: four beginner/intermediate hackathon teammates; 24-hour required demo, optional hardening to 36 hours. No member names or GitHub repository supplied. Use Member 1–4 and @member1–4 placeholders clearly labeled for replacement. No remote actions.

## Owners
- Member 1 (M1): frontend UX, upload/preview, location, review and complaint screens; owns app/page.tsx, components/report/*, components/complaint/*.
- Member 2 (M2): Next.js server routes, Supabase database/storage/auth, shared contracts, deployment/secrets; owns app/api/*, lib/server/*, lib/contracts.ts, lib/supabase/browser.ts (public anonymous auth only), database/* and root config.
- Member 3 (M3): Gemini vision adapter, prompt/schema, fixtures, evaluation and honest fallback; owns lib/vision/*, evaluation/*, tests/vision/*. Server-only adapter is imported by M2.
- Member 4 (M4): Leaflet map, hotspot aggregation, integration QA, GitHub project and demo; owns components/map/*, lib/hotspots.ts, tests/e2e/*, docs/demo.md and planning trackers. M1 reserves a client-only map slot for M4.

## Stack and constraints
Next.js App Router + TypeScript + Tailwind; Node supported LTS verified at setup. Supabase Postgres, private Storage bucket and anonymous auth; React Leaflet/Leaflet + OpenStreetMap tiles with visible attribution; Gemini Flash-family vision model selected from currently available models in the team's Google AI Studio account using @google/genai. Set GEMINI_MODEL to the exact model ID that passed an hour-1 smoke test. Vercel deployment. No training a vision model, no real authority integration, no automated email, no chatbot, payments, elaborate auth UI or production scaling. Need working camera/file flow on HTTPS and explicit sample data badges.

## Frozen flow
Browser gets an anonymous Supabase session, no signup UI. User selects image and location pin. POST /api/reports (multipart image, latitude, longitude, client_request_id UUID, optional note) creates an owner-scoped private draft, normalizes JPEG/PNG/WebP image with sharp (reject invalid or >8 MB; send <=3 MB client-compressed image to stay below hosting request limit; image target <=1600 px; strip metadata), stores it privately, calls vision adapter with a 12-second app timeout, and returns a non-public draft. Provider error/schema failure/timeout yields needs_review draft with labels=[unclear] and analysis_source=manual_fallback; never fabricates successful AI analysis. Draft creation itself can fail: return retryable error; no fake successful submission.

Owner reviews/edits labels and location; PATCH /api/reports/{id} with action=publish checks ownership, validates values, regenerates deterministic editable complaint draft and publishes the report. Only published reports appear on GET /api/reports; public response includes safe fields and short-lived signed photo URLs, excludes owner_id, a separate raw image_path field, and private notes. An anonymous session JWT is sent as Authorization: Bearer token for write routes. Server verifies getUser(token) and checks owner_id. Supabase RLS denies direct report/storage access from public/anon clients; server-only service key is never NEXT_PUBLIC. Member 2 provides these protections. This is a controlled hackathon demo, not a production reporting service; production abuse controls remain later work.

Map fetches public published reports on load, after publish and every 10 seconds while visible, with error/last-updated state. Demo sample fixtures are explicitly is_demo=true, separate layer/view; real layer default. API accepts demo insertion only via local seed script (server credentials), not arbitrary client is_demo. Published no_visible_pollution/unclear reports may be neutral markers but never count as hotspots. Hotspots: e.g. >=3 report records with pollution labels in the same approximate 100 m grid cell with published_at in the last 24 h; use fixed-reference equirectangular bins as defined in guide.json. Count each report once even if multilabel; calculate real and sample separately; choose one exact formula in final doc. Call it report density, not verified environmental danger. Duplicate photo prevention is optional; never claim all records are independent observations.

## Contracts
Label enum: algal_bloom, oil_sheen, garbage, no_visible_pollution, unclear. Pollution labels can co-occur; neutral labels are exclusive. Vision output { labels: Label[], evidence: string, review_needed: boolean }; evidence <=240 chars, describes visible cues only. No confidence percentage, pollutant chemistry, toxin or safety claims. Output is a visual suggestion; mandatory human confirmation before publication.
Vision adapter signature analyzeImage({bytes: Buffer,mimeType:string}): Promise<VisionResult>. No API keys or image/base64 in logs. ENV VISION_MODE=live|mock; mock server output must mark analysis_source=mock and force is_demo=true on publish so it cannot contaminate real data.
Report: id UUID; owner_id UUID; created_at timestamptz UTC; published_at timestamptz nullable; latitude/longitude double precision; image_path text nullable until storage succeeds; client_request_id UUID; labels text[]; evidence text; analysis_source enum vision|manual_fallback|mock; status enum draft|needs_review|published; complaint_text text; is_demo boolean default false. Optional note <=500 chars owner-only, omitted from public JSON. Update report in-place on publish; never insert duplicate report on each confirm. Require UNIQUE(owner_id, client_request_id); reserve a needs_review/unclear row before analysis. Retries reuse or resume the same row. Only the INSERT winner calls vision. If a reserved image is missing, retry resumes storage with the same payload and remains manual_fallback; publish requires image_path. Guard late model updates so published rows cannot change. Repeated publish preserves the first published_at timestamp.
Public report includes id,created_at,published_at,latitude,longitude,labels,evidence,analysis_source,is_demo,image_url,complaint_text. Public complaint must not include private note or contact info. Server regenerates safe template; local edited complaint text need not be saved to public report. Copy/download only; user sends separately after verifying recipient.

## Gates / timing
H0–2: repository, credentials/model smoke test, contracts, mock fixtures, hello-world deployment.
H2–6: parallel upload UI, DB/API draft route, vision adapter, map fixtures.
H6: fixture-driven thin slice contract test (live publication comes in H8-12); fix interface drift before adding polish.
H6–12: real upload + AI + review + publish + map + complaint; hard gate at H12.
H12–18: edge cases, privacy/ownership, vision sample evaluation, map empty/error states.
H18–22: deployed phone test, explicit sample markers, demo rehearsal.
H22–24: freeze, backup video/screenshots and judging demo.
H24–36 optional: improve only after 24h acceptance; label evaluation, hotspot clarity, usability and documentation. No extra features required to complete demo.

## Task data shape
Each role has exactly 12 tasks, IDs M1-01..M4-12, with keys id,title,window,steps (2–4 strings),done (specific verifiable criteria),handoff (dependency/recipient). Role object keys id,name,mission,owns,reviewer,tasks. Required JSON is UTF-8 with {roles:[...]}. All core tasks done by H24; tasks within same window are parallel work, not additive durations. Keep per-task prose compact enough for 6 tasks per A4 page. H0–2 tasks include interface agreements. Include practical beginner steps and explicit output paths.

## Artifacts
Root creates polished PDF, full plan Markdown, full tracker, build source and ZIP. Child agents contribute role JSON and GitHub templates as assigned. Root reconciles dependencies. Planning document must distinguish generated planning assets from future application files. GitHub checkboxes work in Issue bodies/comments. Repository Markdown renders boxes, but checking them requires editing/committing Markdown; they do not sync with Issue or PDF boxes. User does not have a remote yet; never claim files have been published or Issues created.

## Signed-photo URL boundary
Use report-photos bucket and deterministic object path reports/{reportId}.jpg without owner IDs. Signed URLs necessarily include the bucket/object path and grant temporary read access to that published photo. The public field allowlist omits a separate image_path field; it does not conceal a signed URL's safe object path.

Mock-mode reservations set is_demo=true immediately and every subsequent write preserves it, even if an early retry publishes before the adapter completes. This closes the pending-request provenance race.
