# M3: Vision & smoke checks

**Assignee:** Unassigned role slot. Choose the teammate only after the team agrees; collaborator invitations are not role assignments.

**Mission:** Offer conservative visual suggestions with a bounded server call, honest provenance and a reliable manual fallback.

**Owned files:** lib/vision/*; evaluation/*; tests/vision/*

**Reviewer:** M2 checks server integration and secrets; M1 checks review wording. Role slots are unassigned.

Follow six tasks in order. H0 is 10:00 IST on 31 October 2026; H8 is 18:00. Roles run in parallel. Gates: H1 setup, H3 integrated slice, H5 core or manual fallback, H7 freeze, H8 demo ready. Post-event work is deferred.

Check each box only when its Done condition passes. Add a comment with task ID, PR/commit, screenshot/test evidence and reviewer confirmation. A checkbox does not run a test. Leave blocked/incomplete work unchecked and name the blocker.

The application has not been built by this planning pack; the paths below describe future implementation work.

- [ ] **M3-01 — Smoke-test model access and supply fixtures** · H0-1

  1. Check a currently available Gemini Flash-family vision model using @google/genai on the server; record the exact passing GEMINI_MODEL.
  2. Give M1/M2 one conservative result fixture and one manual_fallback fixture even if live access is blocked.

  **Done:** Live access has a recorded outcome and teammates can build without it; no key or image content is logged.

  **Handoff:** M2 gets model/configuration names; M4 knows whether live AI is available.

- [ ] **M3-02 — Write the conservative adapter and schema** · H1-2

  1. Implement analyzeImage({bytes,mimeType}) returning allowed unique labels, evidence <=240 characters and boolean review_needed.
  2. Prompt for visible clues only; reject unsupported labels, conflicting neutrals and invalid output, and apply M2's 12-second deadline.

  **Done:** One valid result parses; malformed output and provider failure raise a typed failure for manual review.

  **Handoff:** M2 imports the server-only adapter and validator; M1 gets plain-language labels.

- [ ] **M3-03 — Verify truthfulness at the H3 slice** · H2-3

  1. Run valid, unclear, malformed and unavailable-provider fixtures through M2's route.
  2. Check failure uses unclear/manual_fallback; deliberate mock mode must mark is_demo=true from draft creation and remain a sample after review.

  **Done:** M1/M4 can distinguish live suggestions, manual review and simulated samples; no fallback is presented as successful AI.

  **Handoff:** Record H3 fixture outcomes and send any metadata/schema fix to M2.

- [ ] **M3-04 — Run six focused visual smoke cases** · H3-5

  1. Use six consented/licensed small images: visible litter, green surface, sheen-like surface, clean/glare, blur and mixed/ambiguous content.
  2. Record provenance, expected visible cues, actual labels, source and failure; choose live or manual contingency with M2 at H5.

  **Done:** Six case outcomes or explicit access failures are recorded; selected examples are not described as model accuracy.

  **Handoff:** M4 gets honest examples and limitations; M1 gets any confusing wording.

- [ ] **M3-05 — Fix one material error and verify the fallback** · H5-7

  1. Make at most one focused prompt/schema correction for a demonstrated error; rerun affected smoke cases and preserve outcomes.
  2. Check the final deployment's live request, provider failure and mock/sample labels; confirm every result still requires human review.

  **Done:** The final model/prompt version and tested behavior are recorded; no unsupported water-safety or toxin claim appears.

  **Handoff:** M2 freezes the prompt/model; M4 gets the verified AI explanation.

- [ ] **M3-06 — Prepare evidence and freeze vision** · H7-8

  1. Freeze the adapter and prompt; add smoke results, model ID and known limits to evaluation/README.md.
  2. Give M4 one live example if available and a clearly labeled fallback example; rehearse without changing models late.

  **Done:** Rehearsal names the active mode and uses real recorded evidence; missing live access is disclosed plainly.

  **Handoff:** M4 receives demo images with provenance and a brief limitations statement.

## Final workstream acceptance

All six Done conditions are verified with evidence; reviewed work is merged; the downstream role has received the handoff. Close this Issue only after that check. Leave incomplete tasks open at the deadline. PDF/repository checklist copies do not sync automatically.
