# Application build — 25 October 2026

The planning pack is preserved as the original event plan. Application implementation now lives in `app/`, `components/`, `lib/`, and `database/`.

## Build sequence

1. Next.js, TypeScript, Tailwind, local fonts, responsive shell, and input contracts.
2. Photo/location capture and explicit human review, with an unsaved local preview when services are not connected.
3. Anonymous session ownership, private photo storage, server validation, and repeat-safe publication.
4. Optional Gemini visual suggestions with a manual fallback and separately labeled mock mode.
5. Public map, distinct sample view, and editable complaint Copy.
6. Automated checks and browser verification; real Supabase/Gemini and phone checks remain deployment prerequisites.

No application deployment, GitHub task completion, or live model evaluation is claimed by this file. The planning pack and its generated presentation/PDF/ZIP have not been rebuilt.

## Interface decisions

The design-taste-frontend app draw selected Editorial greeting, seed `1991900520`, using the open-plane shell, Instrument Sans, a 12-column 1100px canvas and tonal panels. The face is a pale water-green surface with a deep teal mark. The signature is the private-photo → reviewed-public-pin journey. The home answers “How can I record what I can see?”; the map answers “Which observations have been published?”; the guide explains what a photo can and cannot establish.

There is no account activity or invented KPI row to display, so the working form and observation map occupy the first row. The sans title uses the sheet's 24–26px alternative. The three navigation destinations fold to labeled bottom navigation on phones. Example pins are explicitly fictional and live only in the Samples view. No live report is inferred from those pins.

The phone baseline uses safe-area padding, 16px inputs, 44px touch controls, capability-gated hover, and unrestricted browser zoom. Browser viewport checks cannot confirm hardware keyboard, notch, or touch behavior.

## Motion and interaction refinement

The [full frontend skill review](FRONTEND_SKILL_REVIEW.md) records all 28 catalog entries and distinguishes implemented guidance from inapplicable workflows. Impeccable, the design and motion reviews, and the edge-case checks informed a compact phone capture screen, larger supporting text, primary location actions, wrapped report descriptions, singular counts, and reliable focus restoration.

Framer Motion coordinates keyed form stages and the shared navigation selection. Stages enter in 180ms and exit in 100ms using opacity and a 6px transform with `[0.23, 1, 0.32, 1]`. Exiting controls become inert. Keyboard interactions switch immediately; reduced-motion pointer interactions retain a short opacity fade. CSS provides 120ms press feedback and a 180ms Public/Samples selection track. Leaflet disables animated zoom, tile fades and inertia when reduced motion is requested. No data counts, map pins, or scrolling content receive decorative animation.

## Verification actually performed

- **67 unit tests passed:** validation, image decoding/metadata removal, ownership, persistence failures, public-field boundaries, repeat-safe publish service behavior, vision fallback/deadlines/provenance, and complaint text.
- **7 Edge browser tests passed:** local preview, ordinary and reduced-motion stage focus, reset focus, report-detail focus/return, 240-character unbroken text, public/sample races, clipboard denial, and mocked create/review/publish failures and retries. Uncaught page errors and hydration warnings are regression assertions.
- **ESLint, TypeScript and the production build passed.**
- **Impeccable's final detector returned no findings** on `app` and `components`.
- **Visual checks at 1440, 768 and 390px** found no page overflow or low-contrast text. The phone's primary action is visible above the bottom navigation. The initial small-text warning was resolved; the Leaflet zoom-control font was explicitly set to the app font.
- Local screenshot and inspector artifacts are in ignored `.verification/screenshots/` and `.taste-skill/`; no user photo was included in a commit.

These checks do not verify a real Supabase project, its deployed RLS/storage/RPC behavior, a live Gemini model, or a physical phone. Follow [APP_SETUP.md](APP_SETUP.md) for those next steps. There is no deployed public application URL yet.
