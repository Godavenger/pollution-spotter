# Application setup

The local Pollution Spotter application now exists in this repository. These instructions replace the original scaffold-only setup. The [original pipeline](../PIPELINE.md) remains the event plan; [build progress](BUILD_PROGRESS.md) records current implementation and verification. Live Supabase behavior, a live Gemini model, physical-phone checks and deployment still need evidence.

## 1. Run the local app

Install Node.js 24 LTS and Git, then open a terminal in the repository root. Use the committed lockfile:

```powershell
npm ci
npm run dev
```

Open the URL printed by Next.js, normally `http://localhost:3000`. In PowerShell, use `npm.cmd` in place of `npm` if execution policy blocks `npm.ps1`.

The app runs without service credentials. Select one JPEG, PNG or WebP up to 3 MB, enter coordinates or choose a map point, and select **Try a local preview**. The review is explicitly unsaved: the photo stays in the browser, refresh clears it, and publishing is disabled. The Samples map shows fictional examples in its own view. OpenStreetMap tiles need an internet connection.

A failed connection check or failed real save remains an error. The application does not silently switch a failed save into a successful local preview.

## 2. Prepare Supabase

Create or select the team's Supabase project, then:

1. In **Authentication → Sign In / Providers**, enable **anonymous sign-ins**. These are behind-the-scenes sessions, so users do not need a signup screen.
2. Open the SQL editor and run the complete [database/001_reports.sql](../database/001_reports.sql). It creates the reports table, constraints and indexes, the private `report-photos` bucket, restrictive photo-access policies, and the row-locked `publish_report` function.
3. Confirm the `report-photos` bucket is private. The migration permits normalized JPEGs up to 3 MB in that bucket.
4. Copy the project URL, public publishable key and service-role key from the project settings into the local environment file described below.

The migration denies direct report-table access to both `anon` and `authenticated` clients. Supabase anonymous sign-ins use the `authenticated` role. Restrictive Storage policies block direct client access to report photos even if another permissive bucket policy exists. The publication function is executable only by `service_role`.

Do not weaken those rules to fix a browser error. Browser writes must go through the authenticated Next.js API, which verifies the bearer token with Supabase and checks report ownership before using its server-only service key.

## 3. Configure the local environment

If `.env.local` does not already exist, copy the provided template:

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

Fill the ignored `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

VISION_MODE=manual
GEMINI_API_KEY=
GEMINI_MODEL=
```

Only the Supabase URL and publishable key belong in browser code. A supported legacy Supabase anonymous key may be used in the public-key setting. **The service-role key and Gemini key stay server-only:** never give them a `NEXT_PUBLIC_` prefix or put their values in commits, screenshots or test evidence.

Keep `VISION_MODE=manual` for the first real persistence check. Gemini credentials can remain empty. Stop and restart `npm run dev` after editing environment values, and reload the browser. `NEXT_PUBLIC_*` values are embedded in production browser bundles: after changing them, run a new production build and restart or redeploy it.

`GET /api/status` returns only `configured` and `visionMode`. `configured: true` means the required Supabase values are present in a valid form; it does not prove the database migration, anonymous authentication or Storage is working.

## 4. Verify the persisted manual flow

With manual mode configured:

1. Create an observation with a supported photo and confirmed location. **Save & review** should return a saved private draft.
2. Edit the visible-condition labels and short description, review the coordinates, and explicitly confirm the review.
3. Publish the same report. Confirm its pin appears in the real map and remains after a browser refresh. Copy and edit the generated complaint text.
4. Confirm that the public API exposes only `id`, `published_at`, `latitude`, `longitude`, `labels`, `evidence`, `analysis_source` and `is_demo`. Photos, owner IDs and storage paths must remain private.

The server accepts JPEG/PNG/WebP uploads up to 3 MB, checks decoded content, rejects animation or excessively large dimensions, normalizes to JPEG, and strips metadata before storage. Every real draft has an owner. Publishing requires validated fields and explicit review; a retry returns the original published report and preserves its first timestamp.

These are checks to perform against Supabase, not results claimed by this document.

## 5. Add optional vision suggestions

After the persisted manual flow works, set an API key and an image-capable model available to the team's account. Record the exact model ID successfully tested in `GEMINI_MODEL`, then set `VISION_MODE=live` and restart the server.

| Mode | Behavior |
| --- | --- |
| `manual` (default) | Skip Gemini and open manual review with `analysis_source=manual_fallback`. |
| `live` | Request conservative visible labels within a 12-second application deadline. Missing credentials, provider failures, invalid output or timeout fall back to editable `unclear`/manual review. |
| `mock` | Use a deterministic sample suggestion. The server sets `is_demo=true` when creating the draft and keeps it in the separate sample feed after publication. Supabase is still required to persist it. |

The server chooses provenance; the browser cannot set `analysis_source` or `is_demo`. Late provider results cannot modify a published row.

Run and record the [six sourced-image smoke checks](../lib/vision/SMOKE_CHECKS.md). They have not been run against a live model yet. They check functional behavior, not accuracy. Every result still needs human review, and none establishes pollutant chemistry, toxicity or drinking-water safety.

## 6. Run automated checks

```powershell
npm test
npm run lint
npm run typecheck
npm run build
npm run test:ui
```

Unit tests cover contracts, server ownership/persistence behavior, input decoding, privacy boundaries, vision deadlines and fallback behavior. The browser suite uses Playwright and Microsoft Edge (`channel: msedge` in [playwright.config.ts](../playwright.config.ts)); it starts a local dev server automatically. Install Microsoft Edge if it is unavailable, or deliberately configure another installed Playwright browser before running the suite.

Browser tests can simulate API responses to exercise success and failure states. These tests do not connect to a real Supabase project or establish a working deployed backend. See [BUILD_PROGRESS.md](BUILD_PROGRESS.md) for actual results.

## 7. Complete the remaining live checks

Before calling the MVP deployed and ready, record evidence for:

- **Authentication and ownership:** unauthenticated writes fail, and a second browser session cannot publish the first session's draft.
- **Private persistence:** a real upload and draft survive the request; published reports survive reload; public API, direct table access and direct Storage requests do not expose photos or owner information.
- **Publication integrity:** explicit review is required; repeated and concurrent publication preserve one row and its first timestamp; a missing photo or failed save cannot produce success.
- **Provenance and fallback:** manual mode works, live provider failure leaves a reviewable draft, and mock reports stay exclusively in Samples.
- **Phone behavior:** test the complete HTTPS journey on physical iOS/Android hardware, including the keyboard, file picker, map selection, geolocation denied/unavailable, and complaint copying. Browser viewport emulation cannot verify those platform behaviors.
- **Live vision:** record the sourced-image outcomes and exact model ID, without an unsupported accuracy claim.

Geolocation usually requires HTTPS outside localhost. For a local phone layout check, the dev server listens on the network; open the computer's LAN address on the same network. Use an HTTPS deployment for the complete geolocation and clipboard journey.

## 8. Prepare a deployment

A local production run uses:

```powershell
npm run build
npm start
```

Vercel is the planned host. When deploying, connect the repository, set the same environment variables for the intended environment before building, and use the Node.js runtime already set on the image routes. Open the resulting HTTPS URL on a phone and repeat the real-service checks. Record the URL, commit and actual outcomes in the workstream Issue and [build progress](BUILD_PROGRESS.md). No deployment is claimed here.

The original event gates remain **H1/11:00 setup, H3/13:00 persisted slice, H5/15:00 core or manual fallback, H7/17:00 freeze, H8/18:00 ready** on 31 October 2026. See [GitHub setup](GITHUB_SETUP.md) for the historical collaboration plan. Creating code does not complete those acceptance gates or update their checkboxes automatically.

The original PDF, ZIP and presentation remain planning artifacts. Hold off on `python scripts/build_pack.py` until its templates are updated: it would regenerate README.md with the original scaffold-era status and overwrite the new runtime notes.
