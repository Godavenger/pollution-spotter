# Pollution Spotter - current planning contract

This is the source contract for the AKI HACKS planning pack. It supersedes the earlier 24-36-hour plan in Git history. Sources describe proposed implementation work, not an existing application.

## Event and current status

AKI HACKS is on 31 October 2026 at IEM, GN Block, Sector V, Kolkata. Official hacking is 10:00-18:00 IST (eight hours). Detailed registration is 08:00-10:00; judging/closing is 18:00-20:00. The header/calendar says 09:00 start; confirm arrival with organizers. Pre-event code permissions are not published in the checked material; do not assume coding time before the event.

The private repository is https://github.com/Godavenger/pollution-spotter. Godavenger has admin access; Sangeeta2006451 has accepted write access; invitations for Shivi3123 and deeparkai32109-alt are pending. M1-M4 are unassigned planning roles. The repository had no workstream Issues at the current check. The app and deployment have not been built. The six-slide PPT is a selection proposal based on the official template, not a successful application demonstration. See docs/AKI_HACKS_EVENT_BRIEF.md for sources and exact template requirements.

## Four unassigned roles

- M1: upload, location, review, complaint Copy; owns app/page.tsx, components/report/*, components/complaint/*.
- M2: server routes, Supabase auth/database/private storage, contracts, deployment and config; owns app/api/*, lib/server/*, lib/contracts.ts, lib/supabase/browser.ts, database/* and root config.
- M3: server-only vision adapter, prompt/schema, fixtures and six focused smoke cases; owns lib/vision/*, evaluation/*, tests/vision/*.
- M4: public pins-only map, integration checks, GitHub workstream tracking and demo; owns components/map/*, integration-checks/* and docs/demo.md. M1 reserves a client-only map slot.

## Narrow stack and scope

Next.js App Router + TypeScript + Tailwind; Supabase Postgres, private report-photos bucket and anonymous auth; server-side Gemini through @google/genai; React Leaflet/Leaflet with OpenStreetMap attribution; Vercel HTTPS deployment. M3 chooses an available vision-capable Flash-family model and records the exact successful GEMINI_MODEL. Service/Gemini keys stay server-only.

Required flow: one supported photo + confirmed location -> persisted private needs_review draft -> conservative vision suggestion or explicit manual fallback -> mandatory human review -> publish the same row -> refreshed public map -> locally generated editable complaint Copy.

Deferred beyond the eight-hour event: hotspot/density aggregation, polling, client image compression, galleries/public photos, notes, complaint persistence/download, automated sending, large evaluation sets, resumable upload/retry orchestration, broader auth UI and production hardening. No model training. No invented app results.

## API and data boundary

POST /api/reports takes a bearer anonymous-session token and multipart image, latitude, longitude. Accept JPEG/PNG/WebP <=3 MB; decode and normalize server-side with sharp, removing metadata. Store at reports/{id}.jpg in the private bucket. Create one owner-scoped needs_review row before analysis. Storage/database failure is an error, never a publishable success. UI disables duplicate submits; no automatic POST retry/resume is promised.

M3 exports analyzeImage({bytes:Buffer,mimeType:string}): Promise<VisionResult>. Apply a 12-second application deadline. Provider failure, timeout or invalid output returns an editable unclear/manual_fallback draft. Ignore late results and guard updates so published rows cannot change.

PATCH /api/reports/{id} accepts action=publish, labels, evidence and coordinates. Verify the bearer token server-side and match owner_id. Require a stored image and validated reviewed fields; update the existing draft row. Repeated publish preserves the first published_at and does not insert another row.

GET /api/reports exposes published records only, with real reports as default and samples in a separate view. Exact allowlist: id, published_at, latitude, longitude, labels, evidence, analysis_source, is_demo. Never expose owner_id, storage path, photo URLs, notes or credentials. Private photos remain private after publication. Deny direct table/storage access for both anon and authenticated client roles; server writes are authoritative.

Private report fields: id, owner_id, created_at, published_at, latitude, longitude, image_path, labels, evidence, analysis_source, status, is_demo. status = needs_review | published. Evidence is the short description that the user reviews and may edit. Latitude must be finite in [-90,90] and longitude in [-180,180].

## Vision and provenance

Label = algal_bloom | oil_sheen | garbage | no_visible_pollution | unclear. Nonempty unique allowed labels are required; pollution labels can co-occur, while either neutral label must stand alone. VisionResult = {labels, evidence, review_needed:boolean}; evidence <=240 characters and describes visible cues only.

Never claim toxin identity, chemistry, drinking safety or a confidence percentage. Every output requires human confirmation. The public wording must explain that a visual observation is not a water-quality test.

VISION_MODE = live | manual | mock. live calls Gemini; manual skips the provider and uses analysis_source=manual_fallback; mock returns deterministic sample suggestions. analysis_source = vision | manual_fallback | mock. Only the server selects source/is_demo. Mock mode sets is_demo=true from draft creation and all later updates preserve it.

M3 runs six sourced smoke cases: litter, green surface, sheen-like surface, clean/glare, blur and mixed/ambiguous. Record actual source, output/failure, provenance and expected visible cues. These cases demonstrate functional behavior; they are not an accuracy benchmark.

## Map and complaint

The public map shows published pins with confirmed description, labels, time, selected coordinates and source. Real is default; samples are a separate visibly labeled view. Refresh on load, after publish and on a manual Refresh action. Keep attribution visible, provide empty/error states and avoid hotspot claims.

Generate complaint text locally from confirmed fields and let the user edit/copy it; if clipboard access fails, keep text selectable. Do not save edits publicly. Do not send complaints or claim municipal integration. User verifies wording and recipient before sending independently.

## Eight-hour gates

H0 = 10:00 IST; all role windows run in parallel.

- H1 / 11:00: contracts, fixtures, role ownership, HTTPS preview and service-access outcomes.
- H3 / 13:00: integrated persisted manual/sample slice through publication and map; label any simulated parts.
- H5 / 15:00: full persisted core with live vision if reliable, otherwise deliberate manual mode; no new features.
- H7 / 17:00: required phone/privacy checks recorded; freeze commit, URL and demo script.
- H8 / 18:00: rehearsed, honest demo and labeled backup ready for announced submission rules.

If safe persistence/auth fails, disable publishing and disclose an incomplete prototype or recorded backup. Do not fabricate completion. Post-event improvements are not extra hacking hours.

## Source format and generated assets

Each role has exactly six tasks, IDs M1-01 through M4-06, with id,title,window,steps (2-4 strings),done,handoff. Role keys are id,name,mission,owns,reviewer,tasks. Window format is H0-1 through H7-8, bounded to eight elapsed hours. Keep tasks compact and verifiable; three tasks occupy one A4 page.

guide.json contains four before_roles pages and five after_roles pages. The generator produces an 18-page PDF, PIPELINE.md, GITHUB_TRACKER.md, README.md, four Issue bodies and the handoff ZIP. The ZIP includes setup/event docs and the presentation/template. Exclude previews, credentials, caches, the Git repository and the ZIP itself.

The generator validates all task text on intended PDF pages, PDF bounds and links, 24 unchecked tracker boxes and six unchecked boxes per Issue. These checks validate documents, not app behavior. All implementation tasks begin unchecked. Issue boxes, Markdown and PDF boxes never synchronize automatically.
