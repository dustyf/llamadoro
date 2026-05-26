# Aesthetic Spike — Decision

**Winning direction: Style 3 — Cute Soft 3D.**

**Date:** 2026-05-25
**Decided by:** Dusty
**Spike scope:** 3 candidate styles × 2 llamas (Pedro, Beatrix) × 3 states (focus, break, idle) = 18 sample images
**Generation:** OpenAI Codex CLI `image_generation` tool via gpt-5.5 agentic exec
**Cost:** 134K tokens, ~21 minutes wall time

---

## Candidate Styles Tested

1. **`01-watercolor-cartoon/`** — Soft watercolor strokes + cartoonish proportions, warm earthy + pastel palette, children's-book-illustration vibe
2. **`02-flat-vector/`** — Clean flat vector with minimal cel-shading, saturated-but-soft palette, modern app-store-friendly look
3. **`03-soft-3d/`** — Stylized 3D render in the Pixar/DreamWorks vein, big expressive eyes, soft pastel materials, premium polished look ✅ **WINNER**

---

## Rubric Evaluation

The 4-question rubric from the design doc — all four must be honest yeses.

| Question | Style 1 Watercolor | Style 2 Flat | Style 3 Soft 3D |
|---|---|---|---|
| 1. Would you post one to your personal feed? | yes | weak yes | **yes (strong)** |
| 2. Would you pay $2.99 for an app of these, as a stranger? | yes | barely | **yes (premium feel)** |
| 3. Do two llamas in this style look like one set? | yes (low character distinctness) | yes | **yes (and distinct chars)** |
| 4. Does one llama across states look like one character? | mostly | **no (break inconsistent)** | **yes (stable)** |
| **Pass rubric?** | yes | **no — fails q4** | **yes** |

Style 2 fails rubric q4 (the break-state head shape is notably different from focus/idle for both llamas). Styles 1 and 3 both pass. Style 3 is stronger on character differentiation (Pedro vs Beatrix read as two distinct llamas in Style 3; in Style 1 they read as closely-related cousins) and on identity stability across states.

---

## Why Style 3

- **Character differentiation at volume.** With 45 llamas planned, each one must feel like its own individual, not a color swap of the same template. The Soft 3D style produced visibly distinct characters (Pedro: cream coat, shorter floppy fringe, broad friendly face; Beatrix: peach-tan coat, longer wavy fringe, eyelashes, more refined features). This scales to 45.
- **Identity stability across states.** A single llama's focus / break / idle poses are clearly the same character. This is the hardest thing to get right with AI-gen, and the Soft 3D approach handled it best in the spike.
- **Premium feel justifies the $2.99 IAP.** The Soft 3D render reads as "polished, considered product" — exactly what the moat (aesthetic identity) requires.
- **Distinctive in the App Store.** Flat-vector cute-animal apps are commodity. Watercolor children's-book apps exist. Soft-3D cute character apps are less crowded — Llamadoro can own this space visually.

---

## What this commits us to

- Style guide for the winning direction is captured in `docs/style-guide.md` (sibling to this file).
- All future llama generation uses the prompt template + palette + crop spec in that style guide.
- The 4 winning sample images (Pedro and Beatrix across all 3 states from `03-soft-3d/`) become MVP llamas in Phase 3 — they're the "first 10 llamas with real art" until that 10-set is complete.
- Asset pipeline production spec (task 1.3b) builds on this aesthetic decision with concrete canvas dimensions, naming convention, accessory anchor coordinates, etc.

---

## Open questions left for production phase

- Final canvas dimensions (spike used ~1024×1024; production may want 1024×1024 master + smaller variants for widget extension)
- Background treatment in production — keep solid pale lavender (spike), or transition to transparent for layout flexibility
- Accessory anchor points need to be locked once the production canvas is finalized
- Name spelling: confirmed "Pedro" and "Beatrix" feel right (the chosen names from the spike) — consider whether real names or pun names (e.g., "Llamonardo") fit the Soft 3D vibe better. Soft 3D = leans more "real names with personality"

Decisions on the above belong to task 1.3b (asset pipeline spec) and the larger naming exercise.
