# M1: Frontend & reporting

**Assignee:** Unassigned role slot. Choose the teammate only after the team agrees; collaborator invitations are not role assignments.

**Mission:** Make one clear phone-friendly journey from image selection to a reviewed report and copied complaint.

**Owned files:** app/page.tsx; components/report/*; components/complaint/*

**Reviewer:** M4 checks the full journey; M2 checks request contracts. Role slots are unassigned.

Follow six tasks in order. H0 is 10:00 IST on 31 October 2026; H8 is 18:00. Roles run in parallel. Gates: H1 setup, H3 integrated slice, H5 core or manual fallback, H7 freeze, H8 demo ready. Post-event work is deferred.

Check each box only when its Done condition passes. Add a comment with task ID, PR/commit, screenshot/test evidence and reviewer confirmation. A checkbox does not run a test. Leave blocked/incomplete work unchecked and name the blocker.

The application has not been built by this planning pack; the paths below describe future implementation work.

- [ ] **M1-01 — Agree the screens and shared inputs** · H0-1

  1. Agree the draft, review and public-report types with M2; use M3's labeled fixtures.
  2. Sketch upload -> review -> published screens; reserve a client-only map slot for M4.

  **Done:** M2 and M4 accept the component props and sample payload; role ownership is recorded.

  **Handoff:** Send screen props and needed API fields to M2/M4.

- [ ] **M1-02 — Build photo and location input** · H1-2

  1. Add one JPEG/PNG/WebP file input, preview and a clear 3 MB size limit; reject an unsupported or oversized file.
  2. Collect latitude/longitude with a map pin or editable coordinates. Offer geolocation only with manual fallback.

  **Done:** A supported photo and corrected location can be submitted; denied GPS and invalid files show useful messages.

  **Handoff:** M2 receives the agreed multipart payload; M4 receives the selected-location props.

- [ ] **M1-03 — Complete mandatory review at the H3 gate** · H2-3

  1. Submit with the anonymous session token; show loading and failure without claiming a draft was saved on error.
  2. Render editable labels, description and location with live/manual/sample labels; wire a separate explicit Publish confirmation to M2's route.

  **Done:** The H3 slice persists a reviewed report and refreshes M4's map; failed saving and unconfirmed drafts never appear as published success.

  **Handoff:** Run the H3 slice with M2/M4 and record the remaining blocker, if any.

- [ ] **M1-04 — Publish once and create complaint text** · H3-5

  1. Call M2's publish route for the same draft ID; disable repeated clicks and show success only after persistence succeeds.
  2. Explain that confirmed description and selected coordinates become public while the photo stays private; add editable complaint text and Copy.

  **Done:** A reviewed report survives reload and appears on M4's map; copying uses confirmed fields and never sends a complaint.

  **Handoff:** M4 runs the complete H5 journey; M2 gets exact error cases.

- [ ] **M1-05 — Check the deployed phone journey** · H5-7

  1. Run the final HTTPS URL on a phone with one supported photo, manual coordinates, review, publish and complaint copy.
  2. Fix only blockers: unreadable controls, denied GPS, failed upload, unavailable AI, publish error and sample labeling.

  **Done:** A teammate completes the phone flow; a failed operation never shows false success and public-data wording is visible.

  **Handoff:** Give M4 the verified phone/browser and any limitations before H7 freeze.

- [ ] **M1-06 — Freeze screens and support rehearsal** · H7-8

  1. Merge reviewed UI work, record the deployed commit and avoid new features after H7.
  2. Help capture a backup and rehearse the active live/manual/sample mode; attach actual evidence to the workstream Issue.

  **Done:** The UI used in rehearsal matches the frozen deployment; incomplete work stays unchecked and every shown mode is labeled.

  **Handoff:** M4 receives the final URL, known limits and backup assets.

## Final workstream acceptance

All six Done conditions are verified with evidence; reviewed work is merged; the downstream role has received the handoff. Close this Issue only after that check. Leave incomplete tasks open at the deadline. PDF/repository checklist copies do not sync automatically.
