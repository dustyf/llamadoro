# Llamadoro TODOS

Deferred work captured during planning. Each entry is intentionally *not* in v1 scope but worth keeping visible so it doesn't get forgotten.

---

## Per-llama progression / collection mechanic redesign

- **What:** Replace the current "session count milestones unlock arbitrary llamas" mechanic with per-llama progression. Each individual llama accumulates its own session count and time-spent. Accessories or color tints unlock *per llama* based on focus done with that llama specifically. The gallery becomes a *log of your focus history*, not a generic reward feed.
- **Why:** Forest's mechanic works because the artifact (tree) represents the focus. Llamadoro's current mechanic unlocks arbitrary llamas disconnected from the focusing you did. Tighter integration between effort and reward could meaningfully deepen attachment.
- **Pros:** Stronger product loop. The llama you focus *with* becomes "yours" in a real way. Higher emotional stakes drive longer retention.
- **Cons:** Significant design work — new data schema (per-llama stats), new gallery UX (showing each llama's individual progress), new accessory unlock rules per-llama, new milestone modal copy. May fragment the unlock celebrations to feel small/per-llama instead of big/cross-app.
- **Context:** Surfaced in CEO review (D5) on 2026-05-25. Discussed in the dustyf-llamadoro-planning-docs-design doc as alternative to the current "session-count → arbitrary llama" model. v1 ships the current mechanic so we don't redesign in pre-build. Revisit post-launch once usage data exists.
- **Effort estimate:** L (human team) → with CC+gstack: M
- **Priority:** P3
- **Depends on / blocked by:** v1 ship + at least 4 weeks of post-launch usage to inform the redesign.
