# Pollution Spotter — GitHub progress tracker

All 24 tasks start unchecked. Copy each role's six-task checklist into a GitHub Issue and use those four Issues as the live record. This is the eight-hour AKI HACKS plan for 31 October 2026, 10:00-18:00 IST. Roles are unassigned until the team agrees; invitations do not establish assignments.

You can click checkboxes in a GitHub Issue when you have permission to edit it. In this repository Markdown file, progress changes require editing and committing the file. These copies and the PDF do not update each other automatically.

| Role | GitHub account | Issue URL (replace) | Full Issue body |
| --- | --- | --- | --- |
| M1 | Unassigned | PASTE_ISSUE_URL | [member-1.md](github-issues/member-1.md) |
| M2 | Unassigned | PASTE_ISSUE_URL | [member-2.md](github-issues/member-2.md) |
| M3 | Unassigned | PASTE_ISSUE_URL | [member-3.md](github-issues/member-3.md) |
| M4 | Unassigned | PASTE_ISSUE_URL | [member-4.md](github-issues/member-4.md) |

**Completion rule:** check a task only after its Done condition is verified and the Issue has a PR/commit link, screenshot, test result or other evidence. Ask the named reviewer to verify integration tasks. Hours are elapsed from kickoff, not additional estimates.

Read [the full pipeline](PIPELINE.md) for step-by-step instructions and [GitHub setup](docs/GITHUB_SETUP.md) for labels, assignments, branches and Project views.

## Member 1 - Frontend and reporting

**Owner:** Unassigned. **Issue:** PASTE_ISSUE_URL

- [ ] **M1-01 — Agree the screens and shared inputs** · H0-1
  **Verify:** M2 and M4 accept the component props and sample payload; role ownership is recorded.

- [ ] **M1-02 — Build photo and location input** · H1-2
  **Verify:** A supported photo and corrected location can be submitted; denied GPS and invalid files show useful messages.

- [ ] **M1-03 — Complete mandatory review at the H3 gate** · H2-3
  **Verify:** The H3 slice persists a reviewed report and refreshes M4's map; failed saving and unconfirmed drafts never appear as published success.

- [ ] **M1-04 — Publish once and create complaint text** · H3-5
  **Verify:** A reviewed report survives reload and appears on M4's map; copying uses confirmed fields and never sends a complaint.

- [ ] **M1-05 — Check the deployed phone journey** · H5-7
  **Verify:** A teammate completes the phone flow; a failed operation never shows false success and public-data wording is visible.

- [ ] **M1-06 — Freeze screens and support rehearsal** · H7-8
  **Verify:** The UI used in rehearsal matches the frozen deployment; incomplete work stays unchecked and every shown mode is labeled.

## Member 2 - Backend and deployment

**Owner:** Unassigned. **Issue:** PASTE_ISSUE_URL

- [ ] **M2-01 — Prove setup and freeze the small contract** · H0-1
  **Verify:** The preview loads and service access is verified, or the team explicitly records a prototype-only contingency.

- [ ] **M2-02 — Implement private storage and owner checks** · H1-2
  **Verify:** One session can create its private report data; another session and unauthenticated requests cannot edit it or read private storage.

- [ ] **M2-03 — Deliver the persisted H3 manual slice** · H2-3
  **Verify:** A manual draft can be reviewed, published and fetched after reload; failed storage never produces a publishable report.

- [ ] **M2-04 — Connect vision without blocking publication review** · H3-5
  **Verify:** The H5 core runs with live vision or documented manual fallback; mocks stay samples and repeat publish updates the same report.

- [ ] **M2-05 — Verify the release boundaries** · H5-7
  **Verify:** Required checks have recorded outcomes; the public response omits private fields and only reviewed published rows are visible.

- [ ] **M2-06 — Freeze deployment and record recovery** · H7-8
  **Verify:** M4 can explain and run the chosen contingency; no demo claims a successful save when persistence failed.

## Member 3 - Vision and smoke checks

**Owner:** Unassigned. **Issue:** PASTE_ISSUE_URL

- [ ] **M3-01 — Smoke-test model access and supply fixtures** · H0-1
  **Verify:** Live access has a recorded outcome and teammates can build without it; no key or image content is logged.

- [ ] **M3-02 — Write the conservative adapter and schema** · H1-2
  **Verify:** One valid result parses; malformed output and provider failure raise a typed failure for manual review.

- [ ] **M3-03 — Verify truthfulness at the H3 slice** · H2-3
  **Verify:** M1/M4 can distinguish live suggestions, manual review and simulated samples; no fallback is presented as successful AI.

- [ ] **M3-04 — Run six focused visual smoke cases** · H3-5
  **Verify:** Six case outcomes or explicit access failures are recorded; selected examples are not described as model accuracy.

- [ ] **M3-05 — Fix one material error and verify the fallback** · H5-7
  **Verify:** The final model/prompt version and tested behavior are recorded; no unsupported water-safety or toxin claim appears.

- [ ] **M3-06 — Prepare evidence and freeze vision** · H7-8
  **Verify:** Rehearsal names the active mode and uses real recorded evidence; missing live access is disclosed plainly.

## Member 4 - Map, integration and demo

**Owner:** Unassigned. **Issue:** PASTE_ISSUE_URL

- [ ] **M4-01 — Set the eight-hour gates and map boundary** · H0-1
  **Verify:** Each role slot is assigned by the team or clearly unassigned; shared map/report types and gate times are visible.

- [ ] **M4-02 — Build a pins-only public map** · H1-2
  **Verify:** Fixtures render without SSR errors, sample badges are visible, and private fields/photos are not required.

- [ ] **M4-03 — Run the H3 integration gate** · H2-3
  **Verify:** A persisted manual flow reaches the map, or the exact missing boundary is documented as prototype-only progress.

- [ ] **M4-04 — Accept the H5 core or lock the fallback** · H3-5
  **Verify:** The end-to-end persisted flow passes, with live AI or a truthful manual fallback; unresolved core gaps are named.

- [ ] **M4-05 — Freeze after phone and privacy checks** · H5-7
  **Verify:** Evidence and limitations are attached; the team freezes at 17:00 with an honest script and no new features.

- [ ] **M4-06 — Rehearse and package the demo** · H7-8
  **Verify:** The team is ready at 18:00 and can clearly separate working software, fallback behavior, samples and future plans.

## Evidence comment to paste into the workstream Issue

```text
Task ID: M?-??
What changed:
Evidence (PR/commit/screenshot/test output):
Done condition verified by:
Handoff sent to:
Remaining blocker (if any):
```
