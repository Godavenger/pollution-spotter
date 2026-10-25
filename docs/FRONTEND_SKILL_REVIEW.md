# Frontend skill review

Reviewed on 25 October 2026 for the Pollution Spotter Next.js app. The catalog was divided across collaborating agents; the records below distinguish implemented choices from reviewed guidance and workflows that were not run.

The app's job is to help a person select a private photo and location, review visible conditions, publish confirmed observations, and prepare complaint text. The public map is a working surface, so motion supports those actions and preserves accurate data.

## Design and interaction decisions

| Skill | Use in this app |
| --- | --- |
| `design-taste-frontend` | Applied the app-screen workflow. Editorial greeting, seed `1991900520`: Instrument Sans, a pale water-green surface, restrained teal, a 12-column canvas, and the private-photo-to-public-pin journey as the product's identifying element. The form and map replace an invented KPI row. Baseline desktop and mobile screenshots were inspected. See [build decisions](BUILD_PROGRESS.md). |
| `impeccable` | Read and used for a scoped UX review of hierarchy, phone layout, text wrapping, focus, contrast, and edge states. Its context tool was run on `app/page.tsx`; existing visual direction permitted narrow refinements without a new product brief. Recommendations included a more compact phone capture view, more visible location actions, and clear focus after state changes. Final detector and browser outcomes belong in the verification record, not in the fact that the skill was read. |
| `emil-design-eng` | Applied the frequency and feedback principles: persistent local status for errors and Copy, immediate ordinary controls, and short transitions for occasional changes of context. The review identified mobile action visibility, long-text wrapping, singular counts, and focus restoration as concrete improvements. |
| `apple-design` | Used for immediate press feedback, stable spatial relationships, interruption behavior, legible hierarchy, and an equivalent reduced-motion experience. No glass effect, artificial depth, or spring was added solely to imitate a platform. |
| `mobile-native` | Applied 16px inputs, 44px targets, safe-area padding, dynamic viewport sizing, capability-gated hover, and unrestricted zoom. Geographic coordinates retain a text-entry alternative to map gestures. Real-device keyboard, touch, and safe-area behavior remains a separate verification step. |
| `break-ui` | Read and used to identify a 240-character unbroken description, Bengali text, singular/empty report counts, narrow screens, and large result sets as relevant cases. Wrapping and singular grammar were addressed in the map. The skill's complete interactive Demo data/Worst case harness was not built; no production stress-test toggle is claimed. |

## Motion decisions

| Skill | Use in this app |
| --- | --- |
| `animate` | Used to choose purpose before properties. Context changes such as opening report details warrant a short enter/exit; ordinary typing, map report refreshes, and data counts stay immediate. The selected treatment uses transform and opacity, strong ease-out, and reduced-motion handling. |
| `animation-performance` | Used to keep animation on transform/opacity and avoid per-frame React state, animated map layout, blur, and speculative `will-change`. The Public/Samples track moves with a CSS transform. No frame-time benchmark is implied by these source choices. |
| `find-animation-opportunities` | Applied as a scoped read-only frequency/purpose review. The useful candidates were report-stage changes, a small navigation/selection indicator, and press feedback. Scroll reveals, animated pins, changing counters, and staggered report rows were rejected. |
| `improve-animations` | Read with its audit reference and used for scoped motion reconnaissance. The baseline was largely instantaneous; the work adds a small, coherent motion layer rather than replacing an existing animation system. A full repository of implementation-plan files was not produced. |
| `review-animations` | Read with its standards for the final diff review. Review targets include exiting content becoming inert, heading focus after mounting, interruption, and Leaflet's own animation defaults. The review is distinct from real-browser verification. |
| `animation-vocabulary` | Used to name the effects precisely: enter/exit, selection indicator, and press/tap feedback. This naming skill does not itself add animation. |
| `framer-motion-core` | Framer Motion is the chosen React motion library. Shared primitives centralize the short transition and preference handling instead of adding separate animation implementations to every control. |
| `framer-motion-react` | Used for Client Component boundaries and keyed conditional content inside `AnimatePresence`. Leaflet still loads through a module-level client-only dynamic import. Next.js guidance was checked in the installed package before related edits. |
| `framer-motion-layout` | Used for coordinated detail mount/unmount and exit handling. The map, its tiles, report pins, and data rows do not receive layout animations. |
| `framer-motion-variants` | Reviewed for consistent state transitions and sequencing. Occasional report states share motion values; no entrance choreography is applied to the whole app. |
| `framer-motion-gestures` | Reviewed for press feedback and input modality. The map keeps Leaflet's interaction model; a second drag engine is not added. Keyboard interaction avoids decorative movement. |
| `framer-motion-scroll` | Read and deliberately not implemented. Forms and maps do not need parallax, scroll-linked movement, or reveal gates to perform their job. Content remains available immediately. |

The [map explorer](../components/map/map-explorer.tsx) places selected details directly below the map, focuses the detail heading, and restores focus to the corresponding report row on close. The Public/Samples track uses a 180ms transform transition, disabled for reduced motion and keyboard input. [Leaflet configuration](../components/map/map-canvas.tsx) disables zoom, marker, tile-fade, and inertia animation for the OS reduced-motion preference. Preference changes remount only the map instance; report data remains in the parent.

## Dependency and exploration decisions

| Skill | Use in this app |
| --- | --- |
| `pick-ui-library` | Read after checking `package.json`. Its motion recommendation fits the required React enter/exit behavior. Existing Leaflet, local React state, native form controls, and Tailwind remain sufficient for the other current jobs. No chart, number-animation, command-menu, virtualization, or global-store package was added merely because it appears in the catalog. |
| `ask-sonner` | Read and evaluated. Sonner is not installed: field errors, publication status, and clipboard failure need nearby persistent feedback, which the app already provides. If a future task requires actual toast notifications, the skill calls for one root Toaster and client-side event calls. This review does not claim Sonner integration. |
| `prototype` | Read and evaluated. The current work follows one established direction, so a separate variant experiment was not opened. The skill's full workflow would require an isolated picker, genuinely different working variants, and the user's choice before promotion. No variant was silently selected or promoted, and no consumer-facing design picker was added. |

## Catalog entries outside this task

These descriptions were checked for scope; their dedicated workflows were not run for this frontend refinement.

| Skill | Reason |
| --- | --- |
| `animate-expo` | This is a Next.js web app, not React Native or Expo. Reanimated and native gesture/haptic dependencies do not apply. |
| `write-swift` | No Swift source or native iOS implementation is being changed. |
| `imagegen` | The current interface uses the user's actual private photo, real map tiles, and existing vector marks. It needs no generated raster assets or fictional evidence photos. |
| `pptx` | The pre-existing presentation files are outside this UI change and are not being read, rebuilt, or edited by it. |
| `openai-docs` | The task changes a general web application, not an OpenAI product integration, Codex configuration, or OpenAI model choice. |
| `skill-creator` | No new Codex skill or skill package is requested. |
| `skill-installer` | The requested frontend skills are already available; no skill installation is required. |

## Verification boundaries

Reading a skill is not equivalent to executing its full workflow or passing its checks. The baseline screenshot review and scoped source audits informed the changes. The map/complaint foundation previously passed five complaint unit tests, scoped ESLint, and the project typecheck. Those earlier results do not stand in for checks of the subsequent motion changes.

The build's final lint, typecheck, unit tests, browser interaction checks, and design detector results should be recorded with the implementation in [build progress](BUILD_PROGRESS.md). A local or mocked browser run does not establish successful live Supabase/Gemini behavior, production deployment, or real-phone performance.
