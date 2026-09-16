# Anatomical SVG — third-party attribution

`female-front.svg` and `female-back.svg` are derived from **body-muscles**
by Ivan Vulović.

- Source: https://github.com/vulovix/body-muscles
- License: Apache-2.0 (full text: `scripts/anatomy-src/LICENSE`)
- Copyright 2024 Ivan Vulović (`scripts/anatomy-src/NOTICE`)

## Modifications

- Extracted the `FRONT_MUSCLES` / `BACK_MUSCLES` path data from the source
  TypeScript modules into two standalone SVG files.
- Renamed every muscle `id` to this project's `MuscleId` vocabulary
  (see `scripts/build-anatomy-svg.mjs`, `ID_MAP`).
- Moved non-muscle regions (head, hands, feet, knees, spine) into a
  non-interactive `<g id="scaffold">`.
- Shifted the back view onto a shared `0 0 35 93` viewBox and rounded all
  path coordinates to 3 decimals.

Regenerate with: `node scripts/build-anatomy-svg.mjs`
