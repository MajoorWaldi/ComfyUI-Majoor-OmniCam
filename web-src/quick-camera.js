const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

export function cameraToSpherical(camera) {
  const [px, py, pz] = camera.position;
  const [tx, ty, tz] = camera.target;
  const dx = px - tx;
  const dy = py - ty;
  const dz = pz - tz;
  const distance = Math.max(1e-6, Math.hypot(dx, dy, dz));
  return {
    azimuth: Math.atan2(dx, dz) * DEG,
    elevation: Math.asin(dy / distance) * DEG,
    distance,
  };
}

export function sphericalToCamera(camera, values) {
  const azimuth = Number(values.azimuth) * RAD;
  const elevation = Number(values.elevation) * RAD;
  const distance = Math.max(0.001, Number(values.distance));
  const target = [...camera.target];
  const cosElevation = Math.cos(elevation);
  return {
    ...camera,
    target,
    position: [
      target[0] + distance * Math.sin(azimuth) * cosElevation,
      target[1] + distance * Math.sin(elevation),
      target[2] + distance * Math.cos(azimuth) * cosElevation,
    ],
  };
}

export const QUICK_CAMERA_PRESETS = Object.freeze({
  front: { azimuth: 0 },
  front_right_three_quarter: { azimuth: 45 },
  right_profile: { azimuth: 90 },
  rear_right_three_quarter: { azimuth: 135 },
  back: { azimuth: 180 },
  rear_left_three_quarter: { azimuth: -135 },
  left_profile: { azimuth: -90 },
  front_left_three_quarter: { azimuth: -45 },
  top: { elevation: 75 },
  low: { elevation: -20 },
});