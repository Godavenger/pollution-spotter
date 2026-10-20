# M4: Map, integration & demo

**Assignee:** Unassigned role slot. Choose the teammate only after the team agrees; collaborator invitations are not role assignments.

**Mission:** Join the workstreams into a credible map demonstration and keep the eight-hour gates visible.

**Owned files:** components/map/*; integration-checks/*; docs/demo.md; GitHub workstream tracking

**Reviewer:** M1 checks map usability; M2 checks public fields. Role slots are unassigned.

Follow six tasks in order. H0 is 10:00 IST on 31 October 2026; H8 is 18:00. Roles run in parallel. Gates: H1 setup, H3 integrated slice, H5 core or manual fallback, H7 freeze, H8 demo ready. Post-event work is deferred.

Check each box only when its Done condition passes. Add a comment with task ID, PR/commit, screenshot/test evidence and reviewer confirmation. A checkbox does not run a test. Leave blocked/incomplete work unchecked and name the blocker.

The application has not been built by this planning pack; the paths below describe future implementation work.

- [ ] **M4-01 — Set the eight-hour gates and map boundary** · H0-1

  1. Record who fills M1-M4 after the team agrees; prepare four workstream Issues without inventing assignments.
  2. Agree public map props with M1/M2, prepare small visibly labeled fixtures and display H1/H3/H5/H7/H8 gates.

  **Done:** Each role slot is assigned by the team or clearly unassigned; shared map/report types and gate times are visible.

  **Handoff:** All roles get Issue links and the next integration time.

- [ ] **M4-02 — Build a pins-only public map** · H1-2

  1. Render React Leaflet client-side with OpenStreetMap attribution; show published pins with confirmed description, labels, time and source.
  2. Make real reports the default; put is_demo fixtures in a separate Sample view. Provide empty/error state and a Refresh action.

  **Done:** Fixtures render without SSR errors, sample badges are visible, and private fields/photos are not required.

  **Handoff:** M1 receives the map component; M2 receives public GET expectations.

- [ ] **M4-03 — Run the H3 integration gate** · H2-3

  1. Connect M1's map slot to M2's public GET and refresh after publication; do not add background polling or hotspots.
  2. Run upload -> manual/sample review -> publish -> reload -> map with all roles and record the first failing boundary.

  **Done:** A persisted manual flow reaches the map, or the exact missing boundary is documented as prototype-only progress.

  **Handoff:** Send each blocker to its role owner; pause polish until the slice works.

- [ ] **M4-04 — Accept the H5 core or lock the fallback** · H3-5

  1. Run the complete flow including complaint Copy; record whether analysis was live, manual_fallback or sample/mock.
  2. Check with M2 that another session cannot publish the draft and a private draft is absent from public GET.

  **Done:** The end-to-end persisted flow passes, with live AI or a truthful manual fallback; unresolved core gaps are named.

  **Handoff:** Tell all roles the frozen demo mode and only the blockers remaining before H7.

- [ ] **M4-05 — Freeze after phone and privacy checks** · H5-7

  1. Run the small QA matrix on the deployed URL, including phone upload, denied GPS, AI failure, repeat publish and sample separation.
  2. Draft a three-minute rehearsal script around one report; keep the six-slide selection deck framed as a proposal until implementation is verified.

  **Done:** Evidence and limitations are attached; the team freezes at 17:00 with an honest script and no new features.

  **Handoff:** M1/M2/M3 receive the final blocker list and judging order.

- [ ] **M4-06 — Rehearse and package the demo** · H7-8

  1. Rehearse once on the frozen deployment and prepare a labeled recording/screenshots if the network fails.
  2. Record actual implementation status, URL/commit and uncompleted tasks; follow the announced submission rules at 18:00.

  **Done:** The team is ready at 18:00 and can clearly separate working software, fallback behavior, samples and future plans.

  **Handoff:** All four members receive the demo script, backup and known limitations.

## Final workstream acceptance

All six Done conditions are verified with evidence; reviewed work is merged; the downstream role has received the handoff. Close this Issue only after that check. Leave incomplete tasks open at the deadline. PDF/repository checklist copies do not sync automatically.
