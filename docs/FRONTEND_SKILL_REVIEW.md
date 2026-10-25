# Frontend skill review

Reviewed on 25 October 2026 for the Pollution Spotter Next.js app. The catalog was divided across collaborating agents; the records below distinguish implemented choices from reviewed guidance and workflows that were not run.

The app's job is to help a person select a private photo and location, review visible conditions, publish confirmed observations, and prepare complaint text. The public map is a working surface, so motion supports those actions and preserves accurate data.

## Design and interaction decisions

| Skill | Use in this app |
| --- | --- |
| `design-taste-frontend` | Applied the app-screen workflow. The original Editorial greeting draw, seed `1991900520`, supplies Instrument Sans, the 12-column canvas and the private-photo-to-public-pin journey. The current pass uses white panels on a pale green ground in light mode, distinct dark surfaces, 18px panel radii and 30px desktop/24px phone titles. Desktop, tablet and phone views were checked at 1440/768/390px. See [build decisions](BUILD_PROGRESS.md). |
| `impeccable` | Read and used for a scoped UX review of hierarchy, phone layout, text wrapping, focus, contrast, and edge states. Its context tool was run on `app/page.tsx`; existing visual direction permitted narrow refinements without a new product brief. Recommendations included a more compact phone capture view, more visible location actions, and clear focus after state changes. Final detector and browser outcomes belong in the verification record, not in the fact that the skill was read. |
| `emil-design-eng` | Applied the frequency and feedback principles: persistent local status for errors and Copy, immediate ordinary controls, and short transitions for occasional changes of context. The review led to clearer phone action visibility, long-text wrapping, singular counts and focus restoration. The current pass adds stable-width Copy feedback, local photo cross-fades, progress feedback, a small publish-completion mark and a restrained theme-icon change. |
| `apple-design` | Used for immediate press feedback, stable spatial relationships, interruption behavior, legible hierarchy, and an equivalent reduced-motion experience. Light/dark surfaces and browser chrome follow the chosen appearance; changing it preserves the active review. No glass effect, artificial depth, or spring was added solely to imitate a platform. |
| `mobile-native` | Applied 16px inputs, 44px targets, safe-area padding, dynamic viewport sizing, capability-gated hover, and unrestricted zoom. The phone photo area is now 120px tall with a 20px progress-group gap; the theme control moves into the phone header. Browser theme-color metadata follows the actual selected theme. Geographic coordinates retain a text-entry alternative to map gestures. Real-device keyboard, touch, and safe-area behavior remains a separate verification step. |
| `break-ui` | Read and used to identify a 240-character unbroken description, Bengali text, singular/empty report counts, narrow screens, and large result sets as relevant cases. Wrapping and singular grammar were addressed in the map. The skill's complete interactive Demo data/Worst case harness was not built; no production stress-test toggle is claimed. |

## Motion decisions

| Skill | Use in this app |
| --- | --- |
| `animate` | Used to choose purpose before properties. Report stages and details use short enter/exit transitions; photo replacement, workflow progress, clipboard success, completed publication and theme choice each receive brief action-specific feedback. Ordinary typing, map report refreshes and data counts stay immediate. Strong ease-out and reduced-motion handling are shared. |
| `animation-performance` | Used to keep most animation on transform/opacity and avoid per-frame React state, animated map layout, blur, and speculative `will-change`. Public/Samples and progress tracks use transforms. The one-shot publication stroke paints a bounded 32px SVG; tile-theme filters are static and do not animate. No frame-time benchmark is implied by these source choices. |
| `find-animation-opportunities` | Applied as a scoped read-only frequency/purpose review. The useful candidates were report-stage changes, a small navigation/selection indicator, and press feedback. Scroll reveals, animated pins, changing counters, and staggered report rows were rejected. |
| `improve-animations` | Read with its audit reference and used for scoped motion reconnaissance. The baseline was largely instantaneous; the work adds a small, coherent motion layer rather than replacing an existing animation system. A full repository of implementation-plan files was not produced. |
| `review-animations` | Read with its standards for the final diff review. Review targets include exiting content becoming inert, heading focus after mounting, interruption, and Leaflet's own animation defaults. The review is distinct from real-browser verification. |
| `animation-vocabulary` | Used to name the effects precisely: enter/exit, cross-fade, selection/progress indicator, stroke reveal and press/tap feedback. This naming skill does not itself add animation. |
| `framer-motion-core` | Framer Motion is the chosen React motion library. Shared primitives centralize the short transition and preference handling instead of adding separate animation implementations to every control. |
| `framer-motion-react` | Used for Client Component boundaries and keyed conditional content inside `AnimatePresence`. Leaflet still loads through a module-level client-only dynamic import. Next.js guidance was checked in the installed package before related edits. |
| `framer-motion-layout` | Used for coordinated detail mount/unmount and exit handling. The map, its tiles, report pins, and data rows do not receive layout animations. |
| `framer-motion-variants` | Reviewed for consistent state transitions and sequencing. Occasional report states share motion values; no entrance choreography is applied to the whole app. |
| `framer-motion-gestures` | Reviewed for press feedback and input modality. The map keeps Leaflet's interaction model; a second drag engine is not added. Keyboard interaction avoids decorative movement. |
| `framer-motion-scroll` | Read and deliberately not implemented. Forms and maps do not need parallax, scroll-linked movement, or reveal gates to perform their job. Content remains available immediately. |

The [map explorer](../components/map/map-explorer.tsx) places selected details directly below the map, focuses the detail heading, and restores focus to the corresponding report row on close. The Public/Samples track uses a 180ms transform transition, disabled for reduced motion and keyboard input. [Leaflet configuration](../components/map/map-canvas.tsx) disables zoom, marker, tile-fade, and inertia animation for the OS reduced-motion preference. Preference changes remount only the map instance; report data remains in the parent.

The current theme pass also styles Leaflet controls, popups, attribution and error/loading surfaces through the shared palette. Only the geographic tile pane receives a static light/dark tone adjustment; pins and private photo previews are not filtered. Report and complaint feedback uses the same input-modality and reduced-motion rules as navigation.

## Dependency and exploration decisions

| Skill | Use in this app |
| --- | --- |
| `pick-ui-library` | Read after checking `package.json`. Its Framer Motion recommendation supports the React transitions, and its `next-themes` recommendation now provides persisted system-default light/dark appearance. The provider uses `data-theme`, a stable storage key and transition suppression during palette changes. Existing Leaflet, local React state, native controls and Tailwind remain sufficient for the other jobs. No chart, number-animation, command-menu, virtualization or global-store package was added merely because it appears in the catalog. |
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

Reading a skill is not equivalent to executing its full workflow or passing its checks. The baseline screenshot review and scoped source audits informed the changes; the complete Break UI harness and variant-picking workflows remain unrun.

The updated interface passed **10 Edge browser tests**, including three theme cases covering OS preference until explicit selection, persistence through routes/reloads, synchronized browser colors, preserved in-progress review values, a 44px phone target, keyboard use and reduced motion. Runtime and hydration errors are asserted absent. **ESLint, TypeScript and the current production build passed,** including route generation. Both themes were visually reviewed at 1440, 768 and 390px. The final Impeccable detector returned no findings; the production design inspector reported zero failures and one tablet panel-height warning. Independently changing form and map panels retain their natural heights and common top edge.

### Final visual review

ROUND 2

Seen in one second: a photo observation form beside a real geographic map, with a clear next action.

Idea (one sentence): a private photo becomes a reviewed observation on a shared map.

Live thing: photo selection, editable review, location picking and explicitly fictional sample details.

Layout words by section: shell = quiet navigation / report = focused sequence / map = geographic context / detail = editable follow-through.

Scores (subjective): design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.7.

Caps applied: creativity limited to 7 because the interaction follows a familiar civic-reporting pattern. Marketing-page imagery and decorative-motion counts do not apply to an operational form.

Top three findings from the screenshot review, with resolution:

1. Phone continuation button touched the fixed navigation (`light-390.png`): reduced the photo area to 120px; final clearance is 15.6px at 390 × 844.
2. Light control outlines were too faint (`light-1440.png`): darkened the shared border token to `#7b9183`, exceeding 3:1 on light surfaces.
3. Tablet form and map end at different heights (`tablet-fold.jpg`): retained natural content heights because both panels expand independently during review and report selection. This is the remaining inspector warning.

Detailed outcomes belong in [build progress](BUILD_PROGRESS.md). A local or mocked browser run does not establish successful live Supabase/Gemini behavior, production deployment, physical-phone behavior or a frame-time benchmark.
