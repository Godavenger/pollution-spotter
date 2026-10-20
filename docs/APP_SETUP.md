# Application setup — Member 2, hour one

These are future build instructions. The planning pack does not contain an implemented application. Use the [shared pipeline](../PIPELINE.md) for contracts, ownership and acceptance criteria, and [GitHub setup](GITHUB_SETUP.md) to create the team repository first.

## 1. Prepare the workstation

1. Install a currently supported Node.js LTS release and Git. Open a new terminal after installation.
2. Verify your tools with `node --version`, `npm --version` and `git --version`.
3. Clone the repository containing this planning pack. Open a terminal in its **parent directory**, so the new starter folder will be a sibling of the clone.
4. M2 owns dependency and lockfile changes. Other members should wait for M2's starter commit before installing extra packages.

## 2. Create and run a separate starter

Run one command at a time. If `pollution-spotter-starter` already exists, choose a different unused folder name and use that name in the `cd` command.

```powershell
npx create-next-app@latest pollution-spotter-starter
cd pollution-spotter-starter
npm install @supabase/supabase-js @google/genai sharp zod
npm install react-leaflet leaflet
npm install -D @types/leaflet
npm run dev
```

In the setup prompts, choose **TypeScript**, **Tailwind CSS**, **ESLint** and **App Router**. Choose **no `src/` directory** so the plan's `app/`, `components/` and `lib/` paths match. Keep the default `@/*` import alias. Prompt wording may change; select the equivalent options in the version you actually install.

Open the local URL printed by Next.js. A starter screen is sufficient at this point. Stop the development server with **Ctrl+C** before copying the files.

## 3. Merge application files into the cloned repository

Use File Explorer or your editor to copy the starter's application files into the existing clone deliberately:

- Copy `app/`, `public/`, `package.json`, the one generated `package-lock.json`, `tsconfig.json`, `next-env.d.ts` if generated, and the generated Next.js, ESLint and PostCSS configuration files.
- Merge the starter's `.gitignore` entries into the repository's `.gitignore`. Ignore `node_modules/`, `.next/`, real `.env*` files and local caches. If you ignore `.env*`, add `!.env.example` so the names-only example can be committed.
- Keep the planning pack's `README.md`, `PIPELINE.md`, PDF, `.github/`, `docs/`, `planning/`, `github-issues/` and `scripts/` files.
- Preserve the clone's existing `.git` directory and history. Do not copy the starter's `.git`, `node_modules`, `.next`, private photos or environment secrets.

Open a terminal **inside the clone**, then run:

```powershell
npm install
npm run dev
```

Confirm the starter page still opens. Stop the server, inspect `git status`, and commit the intended scaffold files on your assigned branch. Follow the reviewed PR workflow before merging. All four members should then update their clones and run `npm ci` against the committed lockfile.

## 4. Configure the agreed services

Create `.env.example` with names only:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=
VISION_MODE=live
```

M2 puts real local values in ignored `.env.local` and adds hosting values in Vercel's environment settings. The browser helper at `lib/supabase/browser.ts` may use only the two public Supabase values. A supported legacy anonymous key may be used in the public-key setting if that is what the project exposes. Keep the service-role and Gemini keys server-only.

In Supabase, enable anonymous authentication, apply the planned schema/RLS and create the private **`report-photos`** bucket. M3 must smoke-test a currently available Flash-family model with an actual image before setting the exact `GEMINI_MODEL`. Use clearly labeled mock/manual contingency if access fails.

The image-processing route uses the **Node.js runtime**, because it needs `sharp`. Keep the Leaflet map in a client-only component with SSR disabled as the role plan specifies.

## 5. Deploy the starter and record the checks

Run the project's build check:

```powershell
npm run build
```

Connect the cloned repository to Vercel, configure the agreed environment values, deploy the merged starter and open its HTTPS URL on a phone. Record the URL and commit in the M2 workstream Issue. This proves setup only; the full photo → review → map → complaint journey is a later H12 acceptance gate.

The commands above have been provided as instructions. No application build, deployment or application test has been run by generating this planning pack.
