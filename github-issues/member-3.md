# M3: Vision & evaluation

**Assignee:** @member3 — placeholder; choose the actual teammate in GitHub's Assignees sidebar.

**Mission:** Produce conservative visual suggestions with measurable limitations and an honest, reliable fallback.

**Owned files:** lib/vision/*; evaluation/*; tests/vision/*; vision prompt, fixtures and evaluation evidence

**Reviewer:** Member 2 reviews server integration and secret handling; Member 1 reviews understandable labels.

Follow tasks in order. Hours are elapsed from kickoff; tasks sharing a window are parallel work, not additive durations. Complete the 24-hour demo before optional hardening.

Check each box only when its Done condition passes. Add a comment with task ID, PR/commit, screenshot/test evidence and reviewer confirmation. A checkbox does not run a test. Leave blocked/incomplete work unchecked and name the blocker.

The application has not been built by this planning pack; the paths below describe future implementation work.

- [ ] **M3-01 — Prove the chosen model works immediately** · H0–1

  1. In Google AI Studio, select a currently available Flash-family vision model; verify access instead of copying an old model ID.
  2. Coordinate @google/genai installation with M2; run a server-side image request using an environment key.
  3. Save the passing exact GEMINI_MODEL; record latency/quota errors without keys/images.

  **Done:** One real image returns successfully, or the team explicitly activates and documents manual/mock contingency.

  **Handoff:** M2 gets settings; M4 knows live availability.

- [ ] **M3-02 — Agree the vision boundary and display language** · H1–2

  1. Agree analyzeImage({bytes:Buffer,mimeType:string}): Promise<VisionResult> with M2 and import shared types from lib/contracts.ts.
  2. Use only algal_bloom, oil_sheen, garbage, no_visible_pollution and unclear; neutral labels exclude all other labels.
  3. Return labels, evidence ≤240 characters and review_needed. Tell M1 every result still requires human confirmation.

  **Done:** M1/M2 accept the sample payload and renderable fixture; types and label meanings agree before the review screen is built.

  **Handoff:** M1 uses plain-language label captions; M2 can build the adapter call before live integration.

- [ ] **M3-03 — Assemble an honest visual evaluation set** · H2–3

  1. Collect 20 consented/licensed images in evaluation/ with provenance; avoid faces, number plates and private metadata.
  2. Assign four primary examples per label, including glare mistaken for oil, reflections/vegetation, blur and mixed visible pollution.
  3. Record expected visible-label sets in evaluation/cases.csv; two teammates flag ambiguous examples without forcing certainty.

  **Done:** All 20 cases have provenance, expected labels and ambiguity notes; expectations describe visible appearance only.

  **Handoff:** M1/M4 receive a small clearly marked demo subset; preserve separate evaluation cases.

- [ ] **M3-04 — Write a conservative prompt and output schema** · H3–4

  1. Create lib/vision/prompt.ts: inspect visible water-surface cues; choose unclear when the photo cannot support a label.
  2. Prohibit toxin, chemistry, drinking-safety and confidence-percentage claims; require brief evidence tied to visible features.
  3. Define structured JSON and strict validation: nonempty allowed labels, uniqueness, neutral exclusivity, evidence length and boolean review_needed.

  **Done:** Valid single/multiple pollution labels pass; empty labels, mixed neutrals, invented enums and oversized evidence fail.

  **Handoff:** M2 imports the validator; M1 confirms the wording is understandable and editable.

- [ ] **M3-05 — Build the server-only live vision adapter** · H4–6

  1. Implement server-only lib/vision/analyze.ts using @google/genai, GEMINI_MODEL and normalized image bytes.
  2. Request structured JSON and validate the returned data; throw typed errors for empty, invalid, blocked or failed responses.
  3. Configure provider timeout/retries to fit M2's 12-second deadline; avoid uncontrolled automatic retries and log only safe diagnostics.

  **Done:** A sample produces valid VisionResult; malformed/provider-failed responses produce typed failures; logs contain no keys/images.

  **Handoff:** M2 imports the adapter for the draft route; coordinate dependency changes through M2.

- [ ] **M3-06 — Supply explicit mocks for the H6 thin slice** · H4–6

  1. Provide deterministic fixtures for successful labels, unclear, malformed output, timeout and provider error in tests/vision/fixtures.
  2. Implement deliberate VISION_MODE=mock behavior; require server metadata analysis_source=mock and is_demo=true for publication.
  3. Run the H6 upload/review contract check with M1/M2/M4; verify manual_fallback differs visibly from successful live vision.

  **Done:** The thin slice works without model access; all participants can identify live, manual fallback and mock results correctly.

  **Handoff:** M4 receives repeatable failure fixtures; M2 preserves source/demo metadata outside VisionResult.

- [ ] **M3-07 — Harden validation and failure handling** · H6–9

  1. Add meaningful tests for wrong types/enums, duplicate labels, neutral conflicts, overly long evidence, missing fields and provider failures.
  2. Verify rejected output becomes needs_review/unclear/manual_fallback through M2's route instead of invented AI success.
  3. Check a delayed provider response cannot overwrite a published row; confirm mock metadata survives review/publish.

  **Done:** Boundary tests pass and each invalid provider case produces a reviewable truthful fallback; delayed output cannot change a confirmed report.

  **Handoff:** M2 owns route/update fixes; M1 owns clear fallback explanations.

- [ ] **M3-08 — Complete the live H12 integration gate** · H9–12

  1. Run deployed uploads for garbage, surface-green water, sheen-like appearance and an unclear/clean image.
  2. Confirm normalization preserves detail and model evidence stays brief and tied to visible features.
  3. Review/edit labels before publish; verify source metadata, complaint wording and map behavior for neutral results.

  **Done:** A live image completes the journey; neutral/unclear results never become hotspots; failures remain usable through review.

  **Handoff:** M4 records H12 acceptance; M1/M2 fix any integration issue before presentation polish.

- [ ] **M3-09 — Measure model mistakes on the sample set** · H12–15

  1. Run 20 annotated images with the frozen model/prompt; save expected/predicted labels, latency and failure/source in evaluation/results.csv.
  2. Count exact label-set matches, per-label misses and false positives; inspect clean/glare examples for overcalling.
  3. Record invalid outputs and timeouts separately; do not count manual/mock results as successful AI predictions.

  **Done:** All 20 cases have results/false-positive notes; counts include denominators and describe this small sample only.

  **Handoff:** M4 gets honest judging evidence; M1 gets examples that need clearer review guidance.

- [ ] **M3-10 — Fix the clearest errors and verify the change** · H15–18

  1. Make one focused prompt revision for recurring glare/vegetation/ambiguity errors; preserve original results.
  2. Rerun affected cases and five newly sourced unseen checks; record versions and changed outcomes separately.
  3. Document persistent errors and strengthen review/unclear guidance; never present selected examples as broad accuracy.

  **Done:** Final prompt is versioned; regressions/limits are recorded; false positives have mitigation or documented limitations.

  **Handoff:** M2 deploys the final prompt; M4 uses only verified claims in the demo script.

- [ ] **M3-11 — Rehearse live and contingency demonstrations** · H18–22

  1. Check model access/quota; run a real phone photo on the final deployment with M4.
  2. Rehearse unavailable-provider manual review and deliberate mock mode; mock output enters only the sample layer.
  3. Prepare three sourced demo photos; explain why visual labels cannot establish water safety.

  **Done:** Live/contingency paths are rehearsed; the presenter names the active mode and explains limits without unsupported claims.

  **Handoff:** M4 gets photos, provenance, expected behavior and a short vision explanation.

- [ ] **M3-12 — Freeze vision and attach evidence to GitHub** · H22–24

  1. Merge reviewed changes; record exact model ID, prompt version, test command and limitations in evaluation/README.md.
  2. Link schema-test output/evaluation counts in the assigned Issue; check completed items; leave optional improvements open.
  3. Help M4 capture a backup identifying sample/manual/mock content; avoid late model/prompt changes.

  **Done:** Frozen model/prompt matches deployment; teammates can open evidence links; fallback never appears as live AI success.

  **Handoff:** M4 incorporates evaluation and contingency evidence into docs/demo.md and the judging presentation.

## Final workstream acceptance

All twelve Done conditions are verified with evidence; reviewed work is merged; the downstream member has received the handoff. Close this Issue only after that check. PDF/repository checklist copies do not sync automatically.
