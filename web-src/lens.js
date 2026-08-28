// Focal length <-> field-of-view conversion for the Lens inspector card.
//
// Cinematographers think in millimetres; the track stores degrees. Both
// readouts edit the same value, so the conversion round-trips exactly.
//
// The canonical track stores a VERTICAL field of view: THREE.PerspectiveCamera
// takes a vertical fov, and omnicam/core/projection.py derives focal length as
// `0.5 * height / tan(fov/2)`. The matching 35mm-equivalent reference is
// therefore the 24 mm gate *height*, not the 36 mm width.

export const SENSOR_HEIGHT_MM = 24;
export const MIN_FOV_DEGREES = 5;
export const MAX_FOV_DEGREES = 150;

const RAD = Math.PI / 180;

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Vertical FOV in degrees -> 35mm-equivalent focal length in millimetres. */
export function fovToFocalLength(fovDegrees, sensorHeight = SENSOR_HEIGHT_MM) {
  const fov = clampNumber(Number(fovDegrees) || 0, MIN_FOV_DEGREES, MAX_FOV_DEGREES);
  return sensorHeight / (2 * Math.tan((fov * RAD) / 2));
}

/** 35mm-equivalent focal length in millimetres -> vertical FOV in degrees. */
export function focalLengthToFov(focalMm, sensorHeight = SENSOR_HEIGHT_MM) {
  const focal = Math.max(1e-6, Number(focalMm) || 0);
  const fov = 2 * Math.atan(sensorHeight / (2 * focal)) / RAD;
  return clampNumber(fov, MIN_FOV_DEGREES, MAX_FOV_DEGREES);
}

/** The mm value shown in the Lens card: one decimal, never a bare integer lie. */
export function formatFocalLength(fovDegrees) {
  const focal = fovToFocalLength(fovDegrees);
  return focal >= 100 ? focal.toFixed(0) : focal.toFixed(1);
}

/** The FOV value shown next to it. */
export function formatFov(fovDegrees) {
  return `${(Number(fovDegrees) || 0).toFixed(1)}°`;
}

/** Focal lengths offered as one-click presets, in millimetres. */
export const LENS_PRESETS = [14, 24, 35, 50, 85, 135];
