# Llamadoro Style Guide

Aesthetic direction locked: **Cute Soft 3D**. All llama art and accessory art for v1 follows this guide. See `aesthetic-spike/decision.md` for why this direction was picked.

---

## Visual identity in one sentence

Stylized 3D-rendered llamas in the Pixar/DreamWorks vein but cuter and more cartoonish — big expressive eyes, soft pastel materials, gentle subsurface-y feel, premium polished look.

---

## Prompt template (use verbatim, fill the bracketed slots)

```
A stylized 3D rendered cute cartoon llama portrait, [character description], [pose/expression description].

Visual style: Pixar/DreamWorks-adjacent but more cartoonish and cuter — big expressive eyes with highlights, soft pastel pelt materials, gentle subsurface-y feel, smooth gradient lighting from above-left. Head-and-shoulders composition, centered, square canvas. Premium polished look, NOT photoreal — clearly stylized and cute.

Background: solid pale lavender (#E8E6F5), no gradient, no texture, baked into the image (NOT chroma-key, NOT transparent).

Llama features: tall fluffy llama ears (NOT pony ears), woolly textured neck, distinct llama face shape (long muzzle but cartoonishly shortened for cuteness), cartoonish proportions (big head relative to body).
```

**Slot 1: `[character description]`** — specific to each llama. Examples:
- *Pedro*: "cream/white pelt, shorter floppy fringe of hair on top of head, broad friendly face, medium brown eyes"
- *Beatrix*: "peach-tan pelt, longer wavy fringe, refined facial features with subtle eyelashes, deeper warm-brown eyes"

**Slot 2: `[pose/expression description]`** — specific to each state:
- *focus*: "alert eyes wide open, attentive expression, ears up and forward, slight upright posture"
- *break*: "eyes closed, peaceful relaxed expression, gentle closed-mouth smile, ears slightly back/down"
- *idle*: "neutral content expression, eyes open looking gently forward, mild smile, relaxed default pose"

**Critical:** the same llama across the 3 states must read as the SAME CHARACTER. Use the exact same `[character description]` for that llama's focus / break / idle. Only the `[pose/expression description]` slot changes.

---

## Palette

| Role | Color | Hex | Use |
|---|---|---|---|
| Background | Pale lavender | `#E8E6F5` | Solid background for all llama art |
| Pelt — light llamas | Cream / off-white | `#F5EBD8` family | Pedro, light-coat characters |
| Pelt — warm llamas | Peach-tan | `#E8C8A8` family | Beatrix, warm-coat characters |
| Pelt — darker llamas | Caramel / cocoa | `#B68A60` family | Reserved for darker characters in the full 45 set |
| Eyes — medium brown | Warm brown | `#7A4F2A` | Standard llama eye color |
| Eyes — deeper brown | Dark warm brown | `#5C3818` | For introspective/older characters |
| Highlight on eyes | Off-white | `#FAFAFA` | Specular catchlights in eyes |
| Inner ears | Dusty pink | `#E8B5A8` | Inner-ear blush |
| Shadow on pelt | Muted version of base pelt | derived per character | Subtle subsurface-y shadow |

Palette can be extended for individual character distinctness, but the *background* must stay `#E8E6F5` so the gallery feels cohesive.

---

## Composition spec

- **Aspect ratio:** square (1:1)
- **Canvas dimensions:** 1024×1024 master; production downscale per task 1.3b
- **Subject placement:** centered, head-and-shoulders crop, llama's eyes at roughly 1/3 from the top of the canvas
- **Crop:** top of ears stays inside the canvas with ~5-10% margin; bottom of crop at upper chest / collarbone area
- **Background:** solid `#E8E6F5`, baked into the generated image (NOT chroma-key, NOT transparent)
- **No outlines** on the subject (the soft-3D look does not use line art)
- **No drop shadow** on the background (the subject sits flat against the lavender)

---

## Character consistency rules

For the same llama across all 3 states (focus / break / idle):

1. **Identity must be visually stable.** A friend looking at all 3 states should immediately read "this is the same llama."
2. **Pelt color and pattern stay constant.** No pelt-color variation between states.
3. **Fringe / hair shape stays constant.** Don't change the hair from focus to break.
4. **Eye color and shape stay constant** (eyelid position / openness changes for break state — that's it).
5. **Ear shape and size stay constant** (ear angle changes per state — focus = up, break = slightly back/down — but the ears themselves are the same).

For two different llamas in the same style set:

1. **Characters must be visibly distinct.** Different fringe / hair shape, different pelt color, different facial proportions or features (e.g., eyelashes, ear length).
2. **Stylistic signature stays constant.** Same lighting, same background, same rendering treatment, same eye treatment.

---

## What's locked vs. open

**Locked for v1:**
- Aesthetic direction (Cute Soft 3D)
- Background color (`#E8E6F5`)
- Composition (head-and-shoulders, centered, square)
- The 4 winning sample images (Pedro and Beatrix across focus/break/idle from `aesthetic-spike/03-soft-3d/`) become provisional MVP llamas

**Still to decide (task 1.3b):**
- Final production canvas dimensions and downscale sizes
- Final file format (PNG vs WebP, target size budget)
- Accessory anchor point coordinates (head, neck, prop)
- Naming convention for the full 45-llama set
- Whether to transition off the solid lavender background for production (e.g., transparent variants for flexibility)

**Still to decide (broader product):**
- Llama naming convention — real names (Pedro, Beatrix), pun names (Llamonardo, Daa-vinci), or both?
- Personality voice mapping per llama
- Accessory aesthetic guide (this guide covers llamas only; accessories need their own style addendum)
