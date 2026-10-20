# Pollution Spotter — GitHub progress tracker

All 48 tasks start unchecked. Copy each member's full checklist into a GitHub Issue and make those four Issues the source of truth. Replace placeholders and paste actual Issue URLs below.

You can click checkboxes in a GitHub Issue when you have permission to edit it. In this repository Markdown file, progress changes require editing and committing the file. These copies and the PDF do not update each other automatically.

| Member | GitHub account (replace) | Issue URL (replace) | Full Issue body |
| --- | --- | --- | --- |
| M1 | @member1 | PASTE_ISSUE_URL | [member-1.md](github-issues/member-1.md) |
| M2 | @member2 | PASTE_ISSUE_URL | [member-2.md](github-issues/member-2.md) |
| M3 | @member3 | PASTE_ISSUE_URL | [member-3.md](github-issues/member-3.md) |
| M4 | @member4 | PASTE_ISSUE_URL | [member-4.md](github-issues/member-4.md) |

**Completion rule:** check a task only after its Done condition is verified and the Issue has a PR/commit link, screenshot, test result or other evidence. Ask the named reviewer to verify integration tasks. Hours are elapsed from kickoff, not additional estimates.

Read [the full pipeline](PIPELINE.md) for step-by-step instructions and [GitHub setup](docs/GITHUB_SETUP.md) for labels, assignments, branches and Project views.

## Member 1 - Frontend and reporting experience

**Owner:** @member1 (replace). **Issue:** PASTE_ISSUE_URL

- [ ] **M1-01 — Agree on screens and API contracts** · H0-1
  **Verify:** Team agrees on payloads, labels, mandatory human confirmation and map callbacks before coding.

- [ ] **M1-02 — Build the reporting page shell** · H1-2
  **Verify:** Page opens locally and on the initial HTTPS deployment without hydration or window errors.

- [ ] **M1-03 — Add camera, file selection and preview** · H2-3
  **Verify:** Phone photo and file uploads preview correctly; unsupported and oversized files cannot proceed.

- [ ] **M1-04 — Let users confirm the location** · H3-4
  **Verify:** Confirmed valid coordinates are visible; denying GPS permission still allows completing a report.

- [ ] **M1-05 — Submit a private draft reliably** · H4-6
  **Verify:** H6 mocked slice receives a draft; errors preserve inputs and never display false submission success.

- [ ] **M1-06 — Build mandatory human review** · H6-8
  **Verify:** User can correct AI output; unchecked confirmation blocks publication and no confidence or safety claim is shown.

- [ ] **M1-07 — Publish the reviewed draft** · H8-10
  **Verify:** One reviewed draft becomes one published report; failed publication retains edits; mock reports enter only the sample view.

- [ ] **M1-08 — Add editable complaint copy and download** · H10-12
  **Verify:** Both export actions work; private notes/contact details are absent from the public template and local edits stay local.

- [ ] **M1-09 — Make recovery paths understandable** · H12-15
  **Verify:** Each failure has a usable next action; retries cannot silently create duplicate submissions.

- [ ] **M1-10 — Check phone layout and accessibility** · H15-18
  **Verify:** All required actions work without hover, color-only meaning or horizontal scrolling on a phone.

- [ ] **M1-11 — Run the deployed photo-to-complaint journey** · H18-22
  **Verify:** M4 witnesses a successful phone flow and a recoverable failure; published data appears on a second browser.

- [ ] **M1-12 — Freeze the frontend and hand off the demo** · H22-24
  **Verify:** M1's required tasks are verified, demo controls are stable, and M4 has usable screenshots plus a backup recording.

## Member 2 — Backend, database and deployment

**Owner:** @member2 (replace). **Issue:** PASTE_ISSUE_URL

- [ ] **M2-01 — Create the shared development foundation** · H0–1
  **Verify:** All four members can run the starter; the Vercel HTTPS preview opens on a phone; no real secrets are committed.

- [ ] **M2-02 — Freeze request, response and ownership contracts** · H1–2
  **Verify:** All owners accept sample JSON and field names; no frontend component needs a service-role or Gemini key.

- [ ] **M2-03 — Build the private database and photo store** · H2–3
  **Verify:** Schema applies cleanly; an anonymous browser client cannot read or write rows/photos directly; the server can store one test image.

- [ ] **M2-04 — Implement authenticated server route boundaries** · H3–4
  **Verify:** Missing/invalid tokens fail; two anonymous sessions cannot access each other's draft; errors give M1 an actionable retry or correction state.

- [ ] **M2-05 — Create one recoverable private draft** · H4–6
  **Verify:** One private draft survives retries; publish stays blocked until image_path exists; failed storage never reports success.

- [ ] **M2-06 — Connect vision with a bounded fallback** · H6–8
  **Verify:** Live, timeout, invalid-output and mock cases return truthful drafts; late model results cannot overwrite publication.

- [ ] **M2-07 — Publish the reviewed report in place** · H8–10
  **Verify:** Only owners publish; repeated confirmation creates no duplicate; reviewed fallback publishes; mock data cannot enter the real layer.

- [ ] **M2-08 — Expose a safe public map response** · H10–12
  **Verify:** H12 live upload/review/publish/map/complaint works; public JSON excludes drafts; every route preserves real/sample distinctions.

- [ ] **M2-09 — Test the boundaries that can break the demo** · H12–15
  **Verify:** M4 reproduces ownership/privacy/retry checks; failures have truthful UI responses; no service secret reaches the browser.

- [ ] **M2-10 — Prepare controlled sample data and deployment** · H15–18
  **Verify:** Sample hotspots appear only in sample view; clients cannot set is_demo; deployment completes one real submission.

- [ ] **M2-11 — Verify the deployed phone workflow** · H18–22
  **Verify:** The final URL passes the core phone journey twice; quota/network fallback remains clearly labeled; build/type checks pass.

- [ ] **M2-12 — Freeze the backend and hand over recovery steps** · H22–24
  **Verify:** M4 can recover the demo from written instructions; deployment/configuration are recorded; no core backend task remains unresolved.

## Member 3 — Vision integration and evaluation

**Owner:** @member3 (replace). **Issue:** PASTE_ISSUE_URL

- [ ] **M3-01 — Prove the chosen model works immediately** · H0–1
  **Verify:** One real image returns successfully, or the team explicitly activates and documents manual/mock contingency.

- [ ] **M3-02 — Agree the vision boundary and display language** · H1–2
  **Verify:** M1/M2 accept the sample payload and renderable fixture; types and label meanings agree before the review screen is built.

- [ ] **M3-03 — Assemble an honest visual evaluation set** · H2–3
  **Verify:** All 20 cases have provenance, expected labels and ambiguity notes; expectations describe visible appearance only.

- [ ] **M3-04 — Write a conservative prompt and output schema** · H3–4
  **Verify:** Valid single/multiple pollution labels pass; empty labels, mixed neutrals, invented enums and oversized evidence fail.

- [ ] **M3-05 — Build the server-only live vision adapter** · H4–6
  **Verify:** A sample produces valid VisionResult; malformed/provider-failed responses produce typed failures; logs contain no keys/images.

- [ ] **M3-06 — Supply explicit mocks for the H6 thin slice** · H4–6
  **Verify:** The thin slice works without model access; all participants can identify live, manual fallback and mock results correctly.

- [ ] **M3-07 — Harden validation and failure handling** · H6–9
  **Verify:** Boundary tests pass and each invalid provider case produces a reviewable truthful fallback; delayed output cannot change a confirmed report.

- [ ] **M3-08 — Complete the live H12 integration gate** · H9–12
  **Verify:** A live image completes the journey; neutral/unclear results never become hotspots; failures remain usable through review.

- [ ] **M3-09 — Measure model mistakes on the sample set** · H12–15
  **Verify:** All 20 cases have results/false-positive notes; counts include denominators and describe this small sample only.

- [ ] **M3-10 — Fix the clearest errors and verify the change** · H15–18
  **Verify:** Final prompt is versioned; regressions/limits are recorded; false positives have mitigation or documented limitations.

- [ ] **M3-11 — Rehearse live and contingency demonstrations** · H18–22
  **Verify:** Live/contingency paths are rehearsed; the presenter names the active mode and explains limits without unsupported claims.

- [ ] **M3-12 — Freeze vision and attach evidence to GitHub** · H22–24
  **Verify:** Frozen model/prompt matches deployment; teammates can open evidence links; fallback never appears as live AI success.

## Member 4 - Map, integration QA and demo coordination

**Owner:** @member4 (replace). **Issue:** PASTE_ISSUE_URL

- [ ] **M4-01 — Set up the team's GitHub tracker** · H0-1
  **Verify:** Every member has an assigned Issue and can tick its tasks; the team knows repository Markdown requires editing/committing.

- [ ] **M4-02 — Agree on map inputs and hotspot rules** · H1-2
  **Verify:** Team agrees that three published pollution report records form a hotspot; records are not verified independent observations.

- [ ] **M4-03 — Render the client-only Leaflet map** · H2-3
  **Verify:** Map loads in M1's workspace without SSR errors, and attribution stays readable on a phone.

- [ ] **M4-04 — Build the location picker** · H3-4
  **Verify:** M1 can select and correct a location without GPS; selecting a pin alone never creates a public report.

- [ ] **M4-05 — Fetch and refresh published reports** · H4-5
  **Verify:** Production-shaped fixtures verify refresh and stale/error states; M4-08 verifies live second-browser updates after M2 delivers GET.

- [ ] **M4-06 — Calculate report-density hotspots** · H5-6
  **Verify:** Three recent pollution records in one bin trigger a hotspot; unclear/no_visible_pollution, old or cross-layer records cannot inflate it.

- [ ] **M4-07 — Make sample data unmistakable** · H6-8
  **Verify:** Switching views never combines counts; sample activity cannot be mistaken for real public reports.

- [ ] **M4-08 — Pass the complete-flow integration gate** · H8-12
  **Verify:** H12 deployed flow works with real vision. Record labeled manual/mock contingency if needed, but leave the live gate unmet.

- [ ] **M4-09 — Verify ownership and public-data boundaries** · H12-15
  **Verify:** Record passing checks in docs/demo.md and useful regressions in tests/e2e/report-flow.spec.ts; no credentials appear in evidence.

- [ ] **M4-10 — Test failures and phone map behavior** · H15-18
  **Verify:** Required failure paths recover without fabricated success or duplicate counts; unresolved demo blockers have owners.

- [ ] **M4-11 — Rehearse the map-fill demonstration** · H18-22
  **Verify:** Everyone knows their speaking/action cue; live behavior and sample scenes are distinguishable, with a recorded backup available.

- [ ] **M4-12 — Close verified tasks and freeze the demo** · H22-24
  **Verify:** The judging URL, release version, checked task evidence and honest backup demo are accessible to all four teammates.

## Evidence comment to paste into the workstream Issue

```text
Task ID: M?-??
What changed:
Evidence (PR/commit/screenshot/test output):
Done condition verified by:
Handoff sent to:
Remaining blocker (if any):
```
