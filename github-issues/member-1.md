# M1: Frontend & reporting

**Assignee:** @member1 — placeholder; choose the actual teammate in GitHub's Assignees sidebar.

**Mission:** Build a clear phone-friendly journey from photo and location to human review, publication and an editable complaint.

**Owned files:** app/page.tsx; components/report/*; components/complaint/*

**Reviewer:** Member 4 reviews usability; Member 2 reviews API integration.

Follow tasks in order. Hours are elapsed from kickoff; tasks sharing a window are parallel work, not additive durations. Complete the 24-hour demo before optional hardening.

Check each box only when its Done condition passes. Add a comment with task ID, PR/commit, screenshot/test evidence and reviewer confirmation. A checkbox does not run a test. Leave blocked/incomplete work unchecked and name the blocker.

The application has not been built by this planning pack; the paths below describe future implementation work.

- [ ] **M1-01 — Agree on screens and API contracts** · H0-1

  1. Read lib/contracts.ts with M2; agree on upload, analyzing, review, publishing, success and error states.
  2. Sketch these states for app/page.tsx; agree with M4 on selected-location and after-publish callbacks.

  **Done:** Team agrees on payloads, labels, mandatory human confirmation and map callbacks before coding.

  **Handoff:** M2 provides contracts/session helper; M4 confirms map props.

- [ ] **M1-02 — Build the reporting page shell** · H1-2

  1. In app/page.tsx and components/report/ReportWorkspace.tsx, create a phone-first page with labeled steps and visible progress.
  2. Keep browser APIs in the client workspace; reserve a client-only dynamic map slot for M4 with SSR disabled.

  **Done:** Page opens locally and on the initial HTTPS deployment without hydration or window errors.

  **Handoff:** M4 receives the map slot; M2 deploys the shared branch.

- [ ] **M1-03 — Add camera, file selection and preview** · H2-3

  1. Create components/report/PhotoInput.tsx with camera/file inputs, preview, replacement and clear supported-format guidance.
  2. Accept JPEG/PNG/WebP, reject sources over 8 MB, and resize/compress to at most 1600 px and 3 MB before submission; show a useful error if this fails.

  **Done:** Phone photo and file uploads preview correctly; unsupported and oversized files cannot proceed.

  **Handoff:** M2 receives the compressed image; server still validates and strips metadata.

- [ ] **M1-04 — Let users confirm the location** · H3-4

  1. In components/report/LocationStep.tsx, request browser location only after the user taps the location button.
  2. Connect M4's picker; allow tap/drag correction and manual pin selection when permission is denied or location is unavailable.

  **Done:** Confirmed valid coordinates are visible; denying GPS permission still allows completing a report.

  **Handoff:** Depends on M4-04; pass confirmed latitude/longitude to M2's draft route.

- [ ] **M1-05 — Submit a private draft reliably** · H4-6

  1. In ReportWorkspace.tsx, obtain M2's anonymous session and POST multipart image, coordinates, optional note and client_request_id with the bearer token.
  2. Disable repeat clicks; retain the same UUID and values for timeout retries. A new-report action creates a new UUID.

  **Done:** H6 mocked slice receives a draft; errors preserve inputs and never display false submission success.

  **Handoff:** M2 supplies idempotent draft route; M3's mock responses remain visibly sample data.

- [ ] **M1-06 — Build mandatory human review** · H6-8

  1. Create components/report/ReviewPanel.tsx showing the photo, visible-cue evidence, analysis source and editable labels/location.
  2. Allow multiple pollution labels; make unclear/no_visible_pollution exclusive. Require explicit confirmation before publishing; manual fallback starts as unclear.

  **Done:** User can correct AI output; unchecked confirmation blocks publication and no confidence or safety claim is shown.

  **Handoff:** M3 checks label/evidence wording; M2 validates the same rules server-side.

- [ ] **M1-07 — Publish the reviewed draft** · H8-10

  1. Wire ReviewPanel.tsx to PATCH /api/reports/{id} with action=publish, edited labels/location and the bearer token.
  2. Show success only after the response; pass the published report to the workspace and trigger M4's immediate map refresh.

  **Done:** One reviewed draft becomes one published report; failed publication retains edits; mock reports enter only the sample view.

  **Handoff:** M2 updates the existing row; M4 verifies the new marker and count.

- [ ] **M1-08 — Add editable complaint copy and download** · H10-12

  1. Create components/complaint/ComplaintDraft.tsx using the server's safe complaint_text after publication.
  2. Allow local editing, Copy and Download .txt; explain that the user verifies the recipient and sends the complaint separately.

  **Done:** Both export actions work; private notes/contact details are absent from the public template and local edits stay local.

  **Handoff:** M2 supplies deterministic wording; M4 includes this screen in the H12 complete-flow gate.

- [ ] **M1-09 — Make recovery paths understandable** · H12-15

  1. Check report components for denied GPS, canceled selection, invalid images, draft failure, vision timeout and failed publication.
  2. Add concise recovery instructions, retained inputs and safe Retry/New report actions; distinguish AI fallback from failed draft creation.

  **Done:** Each failure has a usable next action; retries cannot silently create duplicate submissions.

  **Handoff:** M4 records failures; M2/M3 resolve backend or adapter problems.

- [ ] **M1-10 — Check phone layout and accessibility** · H15-18

  1. Check report/complaint components at 360 px width and with keyboard navigation; fix clipped controls and misplaced focus.
  2. Use text labels, readable contrast and status announcements; keep sample badges and the visual-suggestion explanation visible.

  **Done:** All required actions work without hover, color-only meaning or horizontal scrolling on a phone.

  **Handoff:** M4 reviews the complete phone journey; M2 merges the verified frontend changes.

- [ ] **M1-11 — Run the deployed photo-to-complaint journey** · H18-22

  1. On the deployed HTTPS URL, capture/select a real photo, confirm a pin, review labels, publish and copy/download the complaint.
  2. Repeat a denied-location or AI-fallback path; fix frontend defects and send screenshots/results to M4 for docs/demo.md.

  **Done:** M4 witnesses a successful phone flow and a recoverable failure; published data appears on a second browser.

  **Handoff:** M2 checks deployed API/session behavior; M4 collects final acceptance evidence.

- [ ] **M1-12 — Freeze the frontend and hand off the demo** · H22-24

  1. Merge reviewed frontend fixes; verify the final deployment and rehearse the photo, review and complaint steps with M4.
  2. Update the M1 GitHub Issue checkboxes with evidence links; record any remaining limitation instead of marking it complete.

  **Done:** M1's required tasks are verified, demo controls are stable, and M4 has usable screenshots plus a backup recording.

  **Handoff:** M2 freezes the release; M4 runs the judging demonstration.

## Final workstream acceptance

All twelve Done conditions are verified with evidence; reviewed work is merged; the downstream member has received the handoff. Close this Issue only after that check. PDF/repository checklist copies do not sync automatically.
