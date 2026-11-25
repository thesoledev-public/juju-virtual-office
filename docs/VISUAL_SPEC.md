# Visual Specification — Approved 2.5D Office

Status: **binding reference for design development**.

## Approved appearance

The user-approved `JUJU OFFICE` concept image is the sole visual target for the initial scene. It shows a polished stylized-realistic 2.5D isometric office and expressive, dimensional game characters. **Do not replace this with flat illustrations, pixel art, generic avatars, minimal cubicles or a simplified SaaS dashboard.**

### Composition to retain

- Navy chrome/header and left navigation with project cards.
- Large central isometric cutaway office occupying most horizontal space.
- Glass conference room and project planning board, creative desks, developer row, QA lab, server/DevOps room, planters, soft light and warm floor surfaces.
- Right-side selected employee inspector with avatar, task, state, source and pipeline progress.
- Bottom activity feed; selection glow and restrained speech bubbles over actual characters.
- Detailed furniture and monitors integrated into the isometric perspective.

### New department

Add a **Content & Social** working area as a coherent office extension/adjacent room. It houses a Content Writer with editorial workstation and a Social Media Specialist with campaign/calendar display. Preserve all five original core areas and the visual hierarchy of the approved image. If the whole floor exceeds the central viewport, enable gentle pan/zoom instead of shrinking the people into unreadable figures.

## Art asset strategy

The reference is a flattened image, so rebuild its scene as production assets:

1. Stable orthographic isometric camera and lighting/palette guide.
2. Separate floor, walls, windows, background, furniture and occluding foreground layers.
3. Consistent character models and wardrobes rendered into sprite atlases from the same camera and lighting set.
4. Directional walking/turning, sitting/standing, typing, reviewing, speaking, creative/writing, QA and idle animation sequences.
5. Independent speech/status effects and interaction hit regions.

Generated one-off frames are reference material until checked for identity consistency. A character changing face, body proportions, outfit or perspective between frames fails acceptance.

## Interaction principles

- Clicking the person selects them and updates the real inspector; selection halo stays attached to that character.
- Walking follows office paths and respects furniture and rooms; actors render in front of/behind furniture correctly.
- Role changes map to validated task-state transitions. Decorative ambient animation must remain distinguishable from verified work.
- Status bubbles are brief, readable, accessible via the inspector and never cover critical interface controls.
- Simulated activity is marked **DEMO** everywhere it can be confused for live operations.

## Fidelity gates

- Visual comparison at 1920×1080 and 1366×768 against the approved composition.
- Review of two fully animated developers (walk → sit → type → stand) **before** scaling to all roles.
- Review of one complete office area with real occlusion and lighting; flat cutout overlays fail.
- No final approval based solely on a static screenshot. Test actual movement and click interactions in the browser.
- Do not describe intermediate assets as complete if they are still placeholders.

## Accessibility and responsiveness

Provide keyboard selection/focus for employees, readable panels, colour-independent status cues, reduced-motion preference, and a purposeful small-screen view that keeps task details accessible even when the full floor cannot fit.
