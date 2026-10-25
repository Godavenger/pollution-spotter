# Live vision smoke checks

The adapter and its failure behavior have automated tests. The six real-image checks below
have **not been run**. There is no accuracy benchmark and no verified live model ID yet.

After Supabase works in manual mode, set `VISION_MODE=live`, `GEMINI_API_KEY`, and an image-capable
`GEMINI_MODEL` available to the team's account. Keep credentials in `.env.local`, never in evidence
or source control. Test the full draft-to-review flow with each sourced image. Record the exact
model ID actually used; model availability must be checked rather than assumed.

| Case | Visible cues to inspect | Acceptable behavior | Status |
| --- | --- | --- | --- |
| Litter | Discarded solid objects beside or on water | `garbage` only when the objects are visible | Not run |
| Green surface | Green surface material or algae-like growth | Conservative `algal_bloom`; no toxin claim | Not run |
| Sheen-like surface | Iridescent or reflective film-like appearance | `oil_sheen` as a visual suggestion; no substance identity | Not run |
| Clean / glare | Clear view versus bright reflections hiding detail | `no_visible_pollution` or `unclear`; no water-safety claim | Not run |
| Blur | Insufficient detail, low light, or unusable framing | `unclear`, with mandatory review | Not run |
| Mixed / ambiguous | Multiple visible cues or objects hard to identify | Allowed pollution labels together, or `unclear` alone | Not run |

For each case record the image source URL or provenance, licence/permission, expected visible cues,
exact model ID, run time, response or failure, elapsed milliseconds, `analysis_source`, and whether
the person edited the suggestion. Do not put private photos or identifiable people in the repository.
These six observations check functional behavior; they do not measure model accuracy.

Force a provider failure and confirm that the same saved draft opens with `unclear` and
`manual_fallback`. Confirm that a deadline expires after 12 seconds without a late provider result
changing the draft. In `mock` mode, verify that `is_demo=true` is set when the draft is first created
and that publication stays in the separate sample view.
