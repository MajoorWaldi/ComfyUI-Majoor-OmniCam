# Transform interaction audit ? 2026-10-17

Scope: viewport object translate/rotate/scale, modal transforms, inspector numeric scrubbing, selection pivots, snap, cancellation and undo. Official ComfyUI frontend sources and the installed, pinned Three.js 0.180.0 TransformControls implementation were consulted. No upstream files are patched.

## Confirmed defects and fixes

| Defect | Evidence | Correction |
| --- | --- | --- |
| Center scale singularity | Actual browser: grabbing the exact pivot and moving 0.25 CSS pixel multiplied size by about 146,000; 8 diagonal pixels reached about 4,672,848. | The adapter replaces only uniform-center scale with a positive screen-space factor from a frozen gesture baseline. Native axis/plane controls remain in use. |
| Snap depended on object dimensions | The proxy anchor inherited absolute object dimensions; native 0.1 snap could jump a 0.01 dimension by an order of magnitude. | A unit-scale anchor measures relative factors. Tiny-object browser regression verifies the first snapped move preserves dimensions. |
| Precision toggle jumps | Failing unit regressions for modal translation, rotation, scale and axis scrubbing: toggling Shift at an unchanged pointer changed the transform. | Integrate pointer segments using the sensitivity active for each segment, preserving the accumulated value. |
| Group pivot mismatch | Failing target regression: the gizmo attached to the primary object's position while edits used the selection centroid. | Attach the group gizmo at the same centroid, with neutral orientation and scale. |
| Group orientation composition | Failing quaternion regression on a member already rotated 45 degrees. | Compose orientations and rotate relative positions with the same quaternion. Modal object rotation uses the same helper. |

## Regression coverage

`transform-stability.spec.js` drives the real gizmo: subpixel center motion, proportional size changes, mouse release, undo, Escape cancellation, and tiny-object grid snapping. Unit coverage exercises repeated stationary updates, fresh baselines for successive gestures, proportional snapping, native-handle delegation, disposal, modifiers, group pivots and group orientation composition. Existing transform suites cover translation, rotation, local/world mode, camera/path edits, locked targets and history.

No document schema, saved transform values, model-specific semantics or camera interpolation code is changed. This is an interaction audit; it does not establish correctness of every imported model's intrinsic bounds or every possible hierarchy configuration.

## Validation

- Final build and all 1,481 frontend unit tests pass, including startup dependency boundaries.
- Full headless browser suite: 189 passed. After the final dependency-isolation adjustment, all 21 transform/camera interaction browser tests pass again.
- Live Vue suite: 6 passed, including Director serialization reload and duplication.
- Classic live suite remains blocked on the pre-existing Monitor attachment timeout; seven later tests did not run after stopping at the first failure.
- `npm run check` passes.
