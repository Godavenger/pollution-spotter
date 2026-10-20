# Application setup — Member 2, hour one

These are future build instructions for the **eight-hour AKI HACKS MVP**. The repository contains planning and presentation materials, not an implemented application. Use the [shared pipeline](../PIPELINE.md) for contracts and acceptance criteria. The private team repository already exists at [Godavenger/pollution-spotter](https://github.com/Godavenger/pollution-spotter); see [GitHub setup](GITHUB_SETUP.md) for access and unassigned roles.

The event hacking window is **10:00 AM–6:00 PM IST on 31 October 2026**. By H1 (11:00 AM), agree on contracts, check credentials/model access and have the scaffold ready. Do not spend the first hour adding optional features.

## 1. Prepare the workstation

1. Install a currently supported Node.js LTS release and Git. Open a new terminal after installation.
2. Check `node --version`, `npm --version` and `git --version`.
3. Accept the repository invitation if pending, then clone the existing repository. Open a terminal in its **parent directory**, so the starter below becomes a sibling of the clone.
4. M2 owns dependencies, root configuration and the lockfile. Other members wait for the scaffold commit before adding packages or creating dependent branches.

## 2. Create a separate starter

Run one command at a time. If `pollution-spotter-starter` already exists, choose an unused folder name and use that name throughout.

```powershell
npx create-next-app@latest pollution-spotter-starter
Set-Location pollution-spotter-starter
npm install @supabase/supabase-js @google/genai sharp zod
npm install react-leaflet leaflet
npm install -D @types/leaflet
npm run dev
```

Choose **TypeScript**, **Tailwind CSS**, **ESLint** and **App Router** in the setup prompts. Choose **no `src/` directory** so the plan's `app/`, `components/` and `lib/` paths match. Keep the `@/*` import alias. Prompt wording may change; choose equivalent settings for the installed version.

Open the URL printed by Next.js. A working starter screen is enough for this check. Stop the server with **Ctrl+C** before copying files.

## 3. Merge the scaffold into the existing clone

Copy the starter's application files deliberately with File Explorer or an editor:

- Copy `app/`, `public/`, `package.json`, the generated `package-lock.json`, `tsconfig.json`, `next-env.d.ts` if present, and Next.js, ESLint and PostCSS configuration.
- Merge `.gitignore` entries. Ignore `node_modules/`, `.next/`, real `.env*` files and local caches; add `!.env.example` if `.env*` is ignored.
- Preserve `README.md`, `PIPELINE.md`, the PDF, `.github/`, `docs/`, `planning/`, `github-issues/`, `presentations/` and `scripts/`.
- Preserve the clone's `.git` directory and history. Do not copy the starter's `.git`, `node_modules`, `.next`, private photos or secrets.

Inside the clone, run:

```powershell
npm install
npm run dev
```

Confirm the starter still opens, stop the server, inspect `git status`, and commit only the intended scaffold files on the assigned branch. Merge through the reviewed PR workflow. Everyone then updates their clone and runs `npm ci` against the committed lockfile.

## 4. Configure the services

Create a names-only `.env.example`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=
VISION_MODE=live
```

M2 stores local values in ignored `.env.local` and hosting values in Vercel's environment settings. Only the Supabase URL and public publishable key belong in the browser helper at `lib/supabase/browser.ts`. If the Supabase project exposes a supported legacy anonymous key, use it in the public-key setting. Keep service-role and Gemini keys on the server.

In Supabase, enable anonymous authentication, apply the agreed database schema/RLS, and create the private **`report-photos`** Storage bucket. Each write route verifies the anonymous session and report ownership. Anonymous authentication is a behind-the-scenes session, not a signup screen. Deny direct client access to report rows and stored photos for both the `anon` and `authenticated` roles: Supabase anonymous sign-ins use the `authenticated` role. Database and Storage operations go through server routes with the server-only service key after session/ownership checks where required; the public read route exposes only the agreed published-report fields.

M3 smoke-tests an available Flash-family model using an actual image, then records its exact ID in `GEMINI_MODEL`. Use `VISION_MODE=live|manual|mock`:

| Mode | Behavior |
| --- | --- |
| `live` | Call vision with a 12-second application timeout. Failure or invalid output returns `unclear` with `analysis_source=manual_fallback`. |
| `manual` | Skip the model call and open manual review, labeled `manual_fallback`. Lock this mode by H5 if live access remains unreliable. |
| `mock` | Use explicit fixtures with `analysis_source=mock`; the server marks the draft `is_demo=true` from creation and preserves that status on publication. |

The browser must not choose analysis provenance or submit an arbitrary `is_demo` value. If draft creation or storage fails, return an error; never fabricate a successful submission.

## 5. Build only the agreed core

| Area | Eight-hour requirement |
| --- | --- |
| Photo/location | Accept one JPEG, PNG or WebP up to 3 MB. The server validates and normalizes it with `sharp`, stripping EXIF metadata. Support a manual pin or coordinates; geolocation is optional. |
| Review/publish | Create an owner-scoped `needs_review` draft. Require the owner to review/edit labels, the visible-description text and location before publishing. Disable repeated create submissions and do not automatically retry creates. Publish updates the same row and preserves the first `published_at`. |
| Public map | Return only `id`, `published_at`, `latitude`, `longitude`, `labels`, `evidence`, `analysis_source` and `is_demo` for published reports. Photos, owner IDs and storage paths stay private. Load reports initially, after publication and through **Refresh**; use a separate sample view. |
| Complaint | Generate an editable client-side template from the reviewed report and offer **Copy**. The user verifies and sends it separately. |
| Checks | M3 covers six focused vision smoke cases; the team checks the deployed phone journey, fallback, ownership and public-field boundaries. |

Use the **Node.js runtime** for image routes because `sharp` requires it. Render Leaflet in a client-only component with SSR disabled and visible OpenStreetMap attribution. M2 owns the shared contract; agree on it before separate implementation diverges.

Defer hotspots, map polling, client image compression, private notes, complaint download/persistence, a 20-case evaluation and extra features. A photograph suggests visible conditions; it does not establish pollutant chemistry, toxicity or water safety.

## 6. Deploy and record evidence

Run the build check provided by the scaffold:

```powershell
npm run build
```

Connect the existing repository to Vercel, add the agreed environment values, deploy the merged starter and open the HTTPS URL on a phone. Record the URL and commit in the M2 workstream Issue once that Issue exists. A starter deployment proves setup only; record later core-flow evidence separately.

The shared gates are **H1/11:00 AM** setup, **H3/1:00 PM** persisted manual or mocked slice, **H5/3:00 PM** live core or locked manual fallback, **H7/5:00 PM** feature freeze and **H8/6:00 PM** demo ready. Keep the final hour for blocking fixes, rehearsal and backup capture. See [GitHub setup](GITHUB_SETUP.md) for the gate checklist.

These commands are instructions. Generating this planning pack does not run an application build, deploy a site or complete application tests.
