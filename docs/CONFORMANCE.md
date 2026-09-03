# OmniCam Motion Conformance

A Monitor profile passing its socket/schema contract (`Contract` in
[COMPATIBILITY.md](COMPATIBILITY.md)) only proves representation compatibility.
It does not prove that a real downstream model, fed OmniCam's output, produces a
video whose camera actually moves the way the scene described.

This document defines how that second claim — **Model Certification** — is
earned, and records where each profile stands.

## Status

The Monitor node itself is `is_experimental=True`.

**No profile is certified.** Every Monitor profile is `PENDING` /
`EXPERIMENTAL` for real-model motion until evidence lands in
`tests/conformance/results/` and its row here moves to `CERTIFIED`.

| Profile | Model Certification | Evidence |
|---|---|---|
| external_reference_video | PENDING | none |
| wan_camera_native | PENDING | none |
| wan_move_native | PENDING | none |
| wan_track_native | PENDING | none |
| wanvideo_ati | PENDING | none |
| ltx25_motion_track | PENDING | none |
| h3_native | PENDING | none |
| h3_api | PENDING | none |

## Cases

`tests/conformance/cases.json` (`majoor.omnicam.conformance.cases.v1`) lists the
camera cases and the profiles under test. Cases cover the primitive moves
(static, dolly, truck, pan, tilt, crane, orbit, roll), dynamics (accelerate,
decelerate), `parallax`, and `multi_shot_cut`.

## Result format

One JSON file per `(profile, case, seed)` run, under
`tests/conformance/results/`, shaped as
`majoor.omnicam.conformance.result.v1`:

```json
{
  "format": "majoor.omnicam.conformance.result.v1",
  "profile": "wan_camera_native",
  "omnicam_commit": "REAL_TESTED_COMMIT",
  "comfyui_version": "0.34.0",
  "downstream_node": "WanCameraImageToVideo",
  "model": "REAL_MODEL_AND_REVISION",
  "case": "truck_left",
  "input": { "duration_seconds": 3.0, "fps": 24.0, "width": 832, "height": 480 },
  "observed": {
    "runtime_error": false,
    "direction": "left",
    "timing": "pass",
    "framing": "pass",
    "parallax": "pass",
    "appearance_leakage": "not_applicable"
  },
  "status": "PASS"
}
```

`REAL_TESTED_COMMIT` and `REAL_MODEL_AND_REVISION` are placeholders in this
template only. A committed result file must carry real values. No agent may
fabricate a conformance result.

## PASS criteria

A single run is `PASS` only when:

- `runtime_error` is `false`;
- `direction` is correct;
- the sign of the move is correct;
- `timing` is acceptable (the move happens across the shot, not all in frame 1);
- `framing` is not inverted;
- the produced frame count is accepted by the downstream node;
- the produced dimensions are accepted.

For reference-video profiles additionally:

- proxy appearance leakage is `none` or `acceptable` (the generated result
  copies camera motion, not the neutral proxy's look).

## Stochasticity

When one run is ambiguous, run three seeds (A, B, C) and keep all three result
files. Directional certification needs at least **2 of 3** correct.

## Minimum certification set

A profile moves to `CERTIFIED` only after passing at least these cases.

### external_reference_video, h3_native, h3_api

```text
static
dolly_in
truck_left
orbit_right
multi_shot_cut
```

### wan_camera_native

```text
static
dolly_in
truck_left      truck_right
pan_left        pan_right
tilt_up         tilt_down
roll_cw         roll_ccw
```

### wan_move_native, wan_track_native, wanvideo_ati, ltx25_motion_track

```text
static
truck_left      truck_right
parallax
accelerate      decelerate
```

## Definition of done for this gate

Each profile is presented as exactly one of:

- `CERTIFIED` — minimum set passed, result files committed, row above updated;
- `PENDING` / `EXPERIMENTAL` — shown as such everywhere it is listed.

A profile with no evidence must never be presented as `CERTIFIED`.
