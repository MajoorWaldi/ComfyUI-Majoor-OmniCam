# MiniMax H3 camera-transfer benchmark

This protocol is ready to run but has not been executed because it requires MiniMax H3 access and billable generations. Do not convert these planned tests into claimed results.

## Fixed conditions

- Same source subject/card, text prompt, seed policy, resolution, duration and H3 settings.
- One variable per comparison: proxy mode or movement.
- Prompt fragment from the H3 adapter with appearance-copy prohibition enabled.
- At least three generations per condition.

## Proxy variants

1. Grid only.
2. Card + grid.
3. Card + floor grid + sparse point depth cues (`omni_ref`).
4. Graybox.

## Motions

- Orbit: 45°, 90°, 180° and 360° product orbit.
- Dolly in/out; crane up/down; truck left/right.
- Pan, tilt, roll.
- Dolly + pan, dolly zoom, and deterministic handheld shake.

## Scores

Rate each 1–5:

- direction fidelity;
- framing/scale fidelity;
- velocity and easing fidelity;
- parallax/depth readability;
- subject identity preservation;
- proxy-appearance leakage.

Record failures, model/version/date, generation IDs, prompt, seed, proxy file hash and reviewer notes. The preferred default may change only after the completed table shows a repeatable improvement over `omni_ref`.
