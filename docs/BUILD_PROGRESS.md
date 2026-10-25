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

The original design-taste-frontend app draw selected Editorial greeting, seed `1991900520`, using the open-plane shell, Instrument Sans and a 12-column 1100px canvas. The current visual pass keeps that structure and gives it clearer panel edges, a stronger green accent, a 30px desktop title and a 24px phone title. Light mode uses a `#f6f8f6` ground with white panels; dark mode uses a `#101312` ground with `#191e1b` panels and a lighter green accent. Panel radii are 18px, and the light-mode control border is `#7b9183`. The signature remains the private-photo → reviewed-public-pin journey.

The working form and observation map occupy the first row. The home answers “How can I record what I can see?”; the map answers “Which observations have been published?”; the guide explains what a photo can and cannot establish. The three navigation destinations fold to labeled bottom navigation on phones. A more visible sample-map action gives the unavailable-report state a useful next step. Example pins are explicitly fictional and live only in Samples; they are not evidence of live reports.

The phone baseline uses safe-area padding, 16px inputs, 44px touch controls, capability-gated hover, and unrestricted browser zoom. The phone photo area is 120px tall and the report progress group has a 20px bottom gap so the continuation action fits above the fixed navigation. Browser viewport checks cannot confirm hardware keyboard, notch, or touch behavior.

## Theme behavior

The [theme provider](../components/theme/theme-provider.tsx) uses `next-themes` with `data-theme`, system preference as the default, and the `pollution-spotter-theme` storage key. The app follows OS light/dark changes until the person chooses a mode. That choice persists through navigation and reloads. The 44px [theme toggle](../components/theme/theme-toggle.tsx) has a stable accessible label and pressed state, with a 160ms Sun/Moon change for pointer input. Browser theme-color metadata follows the active palette.

Changing appearance preserves the current photo, coordinates, labels, description and review confirmation. It does not save or submit the observation. The server-rendered toggle has stable markup and only the document's theme attribute needs hydration-warning suppression. Theme colors change without a whole-page transition.

Map controls, popups, attribution, loading and error surfaces use the same palette tokens. A static tone adjustment applies only to geographic tiles in each theme; report pins, controls and private photo previews keep their intended colors.

## Motion and interaction refinement

The [full frontend skill review](FRONTEND_SKILL_REVIEW.md) records all 28 catalog entries and distinguishes implemented guidance from inapplicable workflows. Impeccable, the design and motion reviews, and the edge-case checks informed a compact phone capture screen, larger supporting text, primary location actions, wrapped report descriptions, singular counts, and reliable focus restoration.

Framer Motion coordinates keyed form stages and the shared navigation selection. Stages enter in 180ms and exit in 100ms using opacity and a 6px transform with `[0.23, 1, 0.32, 1]`. Exiting controls become inert. The report progress line advances with a 180ms transform; chosen photos cross-fade in 160ms and the upload target responds to file dragging. Busy controls show ongoing activity only while a request is pending. Successful publication receives a one-shot 220ms check stroke on a 32px SVG; a local preview never triggers it. Complaint copying uses a 140ms icon change while its button width and editable text remain stable.

CSS provides 120ms press feedback, a 180ms Public/Samples selection track, and small hover cues on actionable arrows. Keyboard interactions switch immediately; reduced-motion pointer interactions retain only short opacity feedback where useful. Reduced motion removes the theme-icon movement, progress/drag transitions, publication stroke animation, busy spinner rotation and Leaflet zoom/tile/inertia motion. The dominant motion properties are transform and opacity; the small publication stroke is a bounded paint exception. Report counts, map pins and scrolling content remain stable.

## Verification actually performed

- **The 67-test core unit suite passed:** validation, image decoding/metadata removal, ownership, persistence failures, public-field boundaries, repeat-safe publish service behavior, vision fallback/deadlines/provenance, and complaint text.
- **10 Edge browser tests passed for the updated interface:** the seven existing report-flow cases plus three theme cases. Coverage includes local preview, stage/detail/reset focus, 240-character unbroken text, public/sample races, clipboard denial, mocked create/publish retries, OS preference, theme persistence through routes/reloads, and preserved photo/review values including Bengali text. Tests assert a 44px phone theme target, immediate keyboard theme changes, reduced-motion behavior, and no uncaught page or hydration errors.
- **ESLint, TypeScript and the current production build passed,** including route generation. The production preview is available locally on port 3000.
- **The final Impeccable detector returned no findings** on `app` and `components` after the theme and mobile-spacing changes.
- **The production design inspector reported 0 failures and 1 warning** at 1440, 768 and 390px. The warning concerns different panel heights on tablet; these independently changing form/map panels deliberately align at the top instead of stretching the shorter content.
- **Both themes were visually reviewed at 1440, 768 and 390px,** including the dark sample detail and complaint editor. No page overflow or browser runtime/hydration errors appeared. Light control borders exceed 3:1 contrast on the light surfaces. At 390 × 844, the primary button ends at 763.4px, leaving 15.6px before the fixed navigation.
- **The guide and standalone map were checked in both themes at 1440 and 390px.** Their surfaces, layout and map-detail focus behavior passed. A separate browser run denied external tile requests; the themed failure notice kept the report list, pins and details available. Geographic tiles loaded in the main workspace capture.
- Local screenshot and inspector artifacts are in ignored `.verification/themes/` and `.taste-skill/theme-final/`; no user photo was included in a commit.

These checks do not verify a real Supabase project, its deployed RLS/storage/RPC behavior, a live Gemini model, or a physical phone. Follow [APP_SETUP.md](APP_SETUP.md) for those next steps. There is no deployed public application URL yet.
