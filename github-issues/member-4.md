# M4: Map, integration & demo

**Assignee:** @member4 — placeholder; choose the actual teammate in GitHub's Assignees sidebar.

**Mission:** Make published reports visible on a clear map, verify the end-to-end flow and keep GitHub progress and the demo accurate.

**Owned files:** components/map/*; lib/hotspots.ts; tests/e2e/*; docs/demo.md; planning trackers

**Reviewer:** Member 1 reviews map usability; Member 2 reviews data handling and integration.

Follow tasks in order. Hours are elapsed from kickoff; tasks sharing a window are parallel work, not additive durations. Complete the 24-hour demo before optional hardening.

Check each box only when its Done condition passes. Add a comment with task ID, PR/commit, screenshot/test evidence and reviewer confirmation. A checkbox does not run a test. Leave blocked/incomplete work unchecked and name the blocker.

The application has not been built by this planning pack; the paths below describe future implementation work.

- [ ] **M4-01 — Set up the team's GitHub tracker** · H0-1

  1. After the team creates its repository, copy the supplied role checklists into four GitHub Issues; replace @member1-4 placeholders with real teammates.
  2. Assign owners and add Todo, In progress, Blocked, Review and Done project statuses; link blockers and pull requests.

  **Done:** Every member has an assigned Issue and can tick its tasks; the team knows repository Markdown requires editing/committing.

  **Handoff:** All members use Issues as the task record; PDF boxes do not synchronize.

- [ ] **M4-02 — Agree on map inputs and hotspot rules** · H1-2

  1. Review public report fields with M2 and picker/refresh callbacks with M1; record agreements in docs/demo.md.
  2. Fix the demo center/reference latitude and agree on approximate 100 m projected bins, trailing 24-hour timestamps and separate real/sample counts.

  **Done:** Team agrees that three published pollution report records form a hotspot; records are not verified independent observations.

  **Handoff:** M2 supplies public report fixtures; M1 supplies the client-only map mount.

- [ ] **M4-03 — Render the client-only Leaflet map** · H2-3

  1. Build components/map/MapView.tsx with React Leaflet, Leaflet CSS and OpenStreetMap tiles; keep attribution visible.
  2. Show the chosen demo area, clear marker colors/labels and an honest empty state; default to real reports.

  **Done:** Map loads in M1's workspace without SSR errors, and attribution stays readable on a phone.

  **Handoff:** M1 imports MapView through the agreed client-only wrapper.

- [ ] **M4-04 — Build the location picker** · H3-4

  1. Create components/map/LocationPicker.tsx with tap-to-place and draggable pin behavior; emit validated latitude/longitude through the agreed callback.
  2. Accept M1's browser-location result for recentering and keep the selected pin visibly distinct from published markers.

  **Done:** M1 can select and correct a location without GPS; selecting a pin alone never creates a public report.

  **Handoff:** Unblocks M1-04; M1 stores the confirmed coordinates.

- [ ] **M4-05 — Fetch and refresh published reports** · H4-5

  1. In components/map/useReports.ts, use production-shaped fixtures until M2 provides GET /api/reports; fetch on load and after M1's publish callback.
  2. Poll every 10 seconds while visible, refresh on return, and clean up timers; show loading, error and last-successful-update states.

  **Done:** Production-shaped fixtures verify refresh and stale/error states; M4-08 verifies live second-browser updates after M2 delivers GET.

  **Handoff:** M2 guarantees published-only safe fields and fresh signed image URLs; describe this as polling.

- [ ] **M4-06 — Calculate report-density hotspots** · H5-6

  1. Implement the frozen projected-bin formula in lib/hotspots.ts; count each eligible published record once and split real/sample datasets.
  2. Check threshold, multilabel, time-boundary and neutral-label cases in tests/e2e/hotspots.spec.ts; show the H6 mocked map slice.

  **Done:** Three recent pollution records in one bin trigger a hotspot; unclear/no_visible_pollution, old or cross-layer records cannot inflate it.

  **Handoff:** M2 reviews timestamp/filter logic; M1 reviews the report-density wording.

- [ ] **M4-07 — Make sample data unmistakable** · H6-8

  1. Add separate real and Sample demo views in MapView.tsx; label sample markers, popup details and hotspot counts clearly.
  2. Use only M2's server seed flow for demonstration fixtures; verify mock analysis reports appear exclusively in the sample view.

  **Done:** Switching views never combines counts; sample activity cannot be mistaken for real public reports.

  **Handoff:** M2 controls demo insertion; M3 provides labeled mock fixtures; M1 displays matching source badges.

- [ ] **M4-08 — Pass the complete-flow integration gate** · H8-12

  1. Exercise photo to draft to human review to publish to map to complaint; record the result in docs/demo.md.
  2. Verify drafts stay hidden, publication keeps one report ID, immediate refresh works, and a second browser receives the report through polling.

  **Done:** H12 deployed flow works with real vision. Record labeled manual/mock contingency if needed, but leave the live gate unmet.

  **Handoff:** Route blockers to M1/M2/M3 immediately; defer visual polish until this gate passes.

- [ ] **M4-09 — Verify ownership and public-data boundaries** · H12-15

  1. With M2, use two anonymous sessions to verify one owner cannot edit/publish the other's draft and unauthenticated writes fail.
  2. Check public JSON excludes owner IDs, raw image_path fields and private notes; confirm private storage cannot be listed/read directly.

  **Done:** Record passing checks in docs/demo.md and useful regressions in tests/e2e/report-flow.spec.ts; no credentials appear in evidence.

  **Handoff:** M2 fixes authorization/storage issues before the release gate.

- [ ] **M4-10 — Test failures and phone map behavior** · H15-18

  1. Check slow/failed vision, duplicate retries, denied location, empty results, network loss and signed-photo URL refresh; log defects in GitHub Issues.
  2. Test map controls/popups at phone width, attribution, sample badges and polling cleanup when hidden or unmounted.

  **Done:** Required failure paths recover without fabricated success or duplicate counts; unresolved demo blockers have owners.

  **Handoff:** M1 fixes UX, M2 fixes requests/data, M3 fixes adapter failures; M4 retests the fixes.

- [ ] **M4-11 — Rehearse the map-fill demonstration** · H18-22

  1. Write docs/demo.md with a three-minute script: photo, reviewed visual suggestion, new marker, report-density hotspot and copied complaint.
  2. Rehearse with all members; use a clearly labeled sample view for staged map filling and explain that refresh uses 10-second polling.

  **Done:** Everyone knows their speaking/action cue; live behavior and sample scenes are distinguishable, with a recorded backup available.

  **Handoff:** M1 operates reporting screens; M2 monitors deployment; M3 explains vision limits; M4 narrates the map.

- [ ] **M4-12 — Close verified tasks and freeze the demo** · H22-24

  1. Run final phone and second-browser checks on M2's release URL; save commit hash, screenshots, video and known limitations in docs/demo.md.
  2. Tick verified Issue tasks, link evidence and move reviewed work to Done; leave unfinished items open and rehearse the backup switch.

  **Done:** The judging URL, release version, checked task evidence and honest backup demo are accessible to all four teammates.

  **Handoff:** All members stop feature work; optional H24-36 improvements start only after acceptance passes.

## Final workstream acceptance

All twelve Done conditions are verified with evidence; reviewed work is merged; the downstream member has received the handoff. Close this Issue only after that check. PDF/repository checklist copies do not sync automatically.
