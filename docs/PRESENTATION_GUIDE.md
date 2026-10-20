# Pollution Spotter presentation guide

The presentation uses the **six-slide official template supplied by the user**. Team name: **Pollution Spotter**. Team leader: **Sharanya Mondal**. The four technical workstream owners remain unassigned.

| File | Use |
| --- | --- |
| [Pollution_Spotter_AKI_HACKS.pptx](../presentations/Pollution_Spotter_AKI_HACKS.pptx) | Editable presentation for the proposed hackathon idea |
| [Pollution_Spotter_AKI_HACKS.pdf](../presentations/Pollution_Spotter_AKI_HACKS.pdf) | Portable copy for reading and review |
| [AKI_HACKS_Official_PPT_Template.pptx](../presentations/AKI_HACKS_Official_PPT_Template.pptx) | Preserved supplied template and its original six-slide structure |

The deck presents a proposed MVP. The repository currently holds planning and presentation materials; application implementation, deployed results and measured impact are not yet established.

## Six-slide narrative

| Slide | Presentation focus |
| --- | --- |
| **1 — Team Name / Team Leader Name / Problem Statement** | Introduce Pollution Spotter and Sharanya Mondal. State the need for a structured way to report visible pollution in local ponds and canals. |
| **2 — PROPOSED SOLUTION** | Describe photo-based reporting with suggested visible labels, human review, a shared report map and a complaint draft the user can copy. |
| **3 — USER FLOW/WORKING** | Walk through photo and location → private draft and suggested labels/manual fallback → owner review → public map report → complaint copy. Photos remain private. |
| **4 — TECHNICAL APPROACH** | Explain Next.js/TypeScript/Tailwind, server routes, Supabase anonymous ownership and private storage, server-side Gemini, Leaflet/OpenStreetMap and Vercel. Use the diagram to show the boundary between private images and safe public report fields. |
| **5 — INNOVATION & DIFFERENTIATION** | Explain the combination of local visual evidence, mandatory review, honest analysis provenance, private photos and an actionable complaint draft. Avoid unsupported claims that no competing product exists. |
| **6 — FEASIBILITY, IMPACT & FUTURE** | Show the eight-hour build plan, four workstreams, expected usefulness and deferred improvements. Treat impact as intended, not measured. |

## Keep the pitch consistent with the build

The committed MVP is one JPEG/PNG/WebP up to 3 MB, manually confirmed location, private photo storage, suggested visible labels with a 12-second model timeout and explicit manual fallback, mandatory owner review, publication of the same report row, map refresh on load/after publication/on demand, and editable complaint text with **Copy**.

Public reports contain confirmed location, labels, visible-description text, publication time and analysis/sample provenance. They exclude photos, owner identifiers and storage paths. Sample reports have a separate view. Complaints are drafts for the user to check and send; the product does not contact authorities automatically.

There are **24 tasks, six per workstream**. The event's hacking window is **10:00 AM–6:00 PM IST on 31 October 2026**:

| Gate | Target |
| --- | --- |
| H1 / 11:00 AM | Contracts, credentials and scaffold |
| H3 / 1:00 PM | Persisted manual or mocked slice |
| H5 / 3:00 PM | Live core or locked manual fallback |
| H7 / 5:00 PM | Feature freeze |
| H8 / 6:00 PM | Rehearsed demo and backups ready |

Hotspots, map polling, client image compression, notes, complaint downloads/persistence and a 20-case evaluation are deferred. The MVP uses six focused vision smoke cases. Do not claim chemical detection, verified contamination, toxicity, safe water or validated model accuracy from photographs.

## Rebuild the presentation

From the repository root, install the XML dependency and run the presentation builder:

```powershell
python -m pip install defusedxml
python scripts/build_presentation.py
```

The [builder](../scripts/build_presentation.py) uses `presentations/AKI_HACKS_Official_PPT_Template.pptx` by default and regenerates `presentations/Pollution_Spotter_AKI_HACKS.pptx`. Edit the builder's content when revising the generated deck; rebuilding replaces that PPTX.

PDF export is separate: open the rebuilt PPTX in PowerPoint or a compatible presentation renderer and export it to `presentations/Pollution_Spotter_AKI_HACKS.pdf`. Inspect all six slides after changes, then run `python scripts/build_pack.py` to refresh the planning documents and ZIP with the current presentation files. The pack builder's dependencies are listed in the [README](../README.md).

## Rehearsal and submission

Practice explaining the problem, walking the user flow and tracing the technical diagram without reading every line. Once the app exists, use a real working flow or clearly label any manual/sample demonstration. Capture screenshots or a short video for a connectivity backup.

The supplied template is six slides on a 16:9 canvas. The checked sources do not establish a submission deadline, upload link, filename rule, file-size limit or speaking duration. Follow the latest organizer instructions in the official group; the PDF is a review copy and is not independently confirmed as an accepted submission format.

The [repository](https://github.com/Godavenger/pollution-spotter) is private, so its URL is not a public demo. Reviewer access must match the organizer's submission requirements. See the [event brief](AKI_HACKS_EVENT_BRIEF.md) for source links and the published schedule discrepancy, and [GitHub setup](GITHUB_SETUP.md) for current access status.
