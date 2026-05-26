# Asset Pipeline Spec

Production spec for llama and accessory assets. Locked after the aesthetic spike winner (Cute Soft 3D) was selected. See `style-guide.md` for the generation prompt template and palette.

**Status:** v1 spec — validate against one full llama (3 states + 1 accessory) before scaling to volume.

---

## Canvas dimensions

| Use | Dimensions | Format | Max size |
|---|---|---|---|
| Master generation | 1024×1024 | PNG | — (intermediate only) |
| App runtime (llama) | 512×512 | WebP | 100 KB |
| Widget thumbnail | 120×120 | PNG | 20 KB |
| Accessory overlay | 512×512 | WebP (transparent) | 50 KB |

**Why 512×512 for runtime:** The `LlamaStage` component renders the llama at approximately 280–320pt on a 3× iPhone — that's ~960 physical pixels. 512×512 gives a 1.5× safety margin while keeping file size reasonable. Upscaling from 512 on a 3× display is acceptable for a stylized art style; the soft-3D aesthetic doesn't rely on fine line detail that would expose compression artifacts.

**Why PNG for widget thumbnails:** iOS widget extension can't use WebP reliably across all supported OS versions; PNG is the safe choice.

---

## Background treatment

Runtime assets use the **solid lavender background** (`#E8E6F5`) baked into the image. Do NOT request transparent PNGs for llama bodies — the lavender is part of the visual identity and provides consistent backdrop across light and dark app themes.

Accessory overlays ARE transparent PNGs (then WebP-converted). They compose on top of the llama art.

---

## Naming convention

```
{llama-id}-{state}.webp          # llama runtime art
{llama-id}-{state}-thumb.png     # widget thumbnails
{accessory-id}.webp              # accessory overlay (transparent)
```

**Llama IDs:** kebab-case names. Examples: `pedro`, `beatrix`, `llamonardo`. IDs are stable — never rename after Phase 3 ships.

**States:** exactly `focus`, `break`, `idle`. Three files per llama.

**Accessory IDs:** kebab-case. Examples: `sombrero`, `flower-crown`, `graduation-cap`.

---

## File locations

```
src/assets/
├── llamas/
│   ├── pedro-focus.webp
│   ├── pedro-break.webp
│   ├── pedro-idle.webp
│   ├── beatrix-focus.webp
│   ├── beatrix-break.webp
│   ├── beatrix-idle.webp
│   └── placeholder.webp         # used for locked/ungenerated llamas in Phase 3.3
├── accessories/
│   └── {accessory-id}.webp
└── sounds/
    └── session-end.mp3

ios/LlamadoroWidget/Assets.xcassets/
└── {llama-id}-{state}-thumb.imageset/   # one per llama × state

android/app/src/main/res/drawable/
└── llama_{llama_id}_{state}_thumb.png   # snake_case for Android resource IDs
```

Widget thumbnail assets live inside the native extension targets, not in `src/assets/`, because widget extensions can't access the main app bundle at render time.

---

## Color space

**sRGB** for all assets. Do not use Display P3 — assets must render consistently on both SDR and wide-gamut displays without color profile surprises. The lavender background hex `#E8E6F5` is specified in sRGB.

---

## Accessory anchor coordinates

Anchors are specified as percentage offsets from the top-left of the 512×512 canvas. These are locked once the first batch of accessories is composed against real llama art and confirmed to look correct.

| Slot | Anchor point (top-left of accessory) | Notes |
|---|---|---|
| Head | TBD — lock after first test composition | Hat/crown sits above the fringe |
| Neck | TBD | Scarf/collar sits below the chin |
| Prop | TBD | Held item, positioned in front of the lower body |

**Protocol for locking anchors:** Generate one accessory per slot. Compose it against Pedro (light-colored, standard proportions). Verify visually. Then verify against Beatrix (to confirm anchors generalize across different face shapes). Record the final x/y percentages in this table.

---

## Generation → production pipeline

1. **Generate master** at 1024×1024 using the style-guide prompt template.
2. **Curate** — reject any image that fails the 4 character-consistency rules (pelt, fringe, eyes, ears stable across states). Re-roll as needed.
3. **Resize to 512×512** using a high-quality downscaler (Lanczos or equivalent). Do not upscale.
4. **Convert to WebP** at quality 85 using `cwebp` or equivalent. Verify output is < 100 KB.
5. **Widget thumbnail:** from the 512×512 PNG (pre-WebP), resize to 120×120 and save as PNG.
6. **Verify** by running a sample import in the app and confirming the image renders at correct dimensions on-device.

For accessories:
1. Generate at 1024×1024 with transparent background.
2. Crop tight to the accessory bounds (minimal transparent margin — 5% padding).
3. Resize to 512×512.
4. Convert to WebP with lossless mode (`cwebp -lossless`) to preserve sharp edges. Verify alpha channel is clean.

---

## Review checklist (one-time, per new llama)

Before marking a llama as "production-ready" in `src/data/llamas.ts`:

- [ ] Focus / break / idle states read as the same character (same pelt, fringe, eye color)
- [ ] File sizes within budget (< 100 KB each)
- [ ] Lavender background (`#E8E6F5`) matches the reference hex
- [ ] No clipping at canvas edges (ears fully inside frame with ≥ 5% margin)
- [ ] Renders correctly in the app (not blurry, not pixelated, no color shift)
- [ ] Widget thumbnail generated and verified in extension (or marked for Phase 8)

---

## Dark/light mode compatibility

The lavender background (`#E8E6F5`) is intentionally the same in both modes. The app's UI chrome (tab bar, card backgrounds) adapts to dark mode, but the llama art itself does not — the lavender reads as a "stage" background. Verify that the lavender doesn't clash with the dark-mode UI chrome in a final visual review at Phase 3.5.

---

## Validation: one full llama before volume

Before generating the full 10-llama MVP set (Phase 3.2), confirm this pipeline works end-to-end with Pedro:

1. Pedro's 3 spike images (from `docs/aesthetic-spike/03-soft-3d/`) → run through the resize + WebP convert steps above.
2. Add to `src/assets/llamas/` as `pedro-focus.webp`, `pedro-break.webp`, `pedro-idle.webp`.
3. Import in `LlamaStage` stub and verify they render on a real device.
4. Confirm file sizes, check visual quality, sign off.

This validation confirms the pipeline before the Phase 3.2 10-llama generation run.
