// Bounded, transient canonical preview assembled from live OpenCV poses.

function finiteVector(value, length) {
  return Array.isArray(value) && value.length === length && value.every((item) => Number.isFinite(Number(item)));
}

function normalizedQuaternion(value) {
  if (!finiteVector(value, 4)) return null;
  const values = value.map(Number);
  const length = Math.hypot(...values);
  if (!Number.isFinite(length) || length < 1e-9) return null;
  return values.map((item) => item / length);
}

function rotate(vector, quaternion) {
  const [x, y, z, w] = quaternion;
  const [vx, vy, vz] = vector;
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  return [
    vx + w * tx + (y * tz - z * ty),
    vy + w * ty + (z * tx - x * tz),
    vz + w * tz + (x * ty - y * tx),
  ];
}

export class LiveTrackAccumulator {
  constructor({ maxPoses = 240, fps = 24, fov = 53, width = 1280, height = 720 } = {}) {
    this.maxPoses = Math.max(2, Number(maxPoses) || 240);
    this.fps = Math.max(1, Number(fps) || 24);
    this.fov = Number(fov) || 53;
    this.width = Math.max(1, Number(width) || 1280);
    this.height = Math.max(1, Number(height) || 720);
    this.poses = new Map();
  }

  reset(options = {}) {
    this.poses.clear();
    if (Number(options.fps) > 0) this.fps = Number(options.fps);
    if (Number(options.fov) > 0) this.fov = Number(options.fov);
    if (Number(options.width) > 0) this.width = Number(options.width);
    if (Number(options.height) > 0) this.height = Number(options.height);
  }

  add(sample) {
    const frame = Math.max(0, Math.round(Number(sample?.frame)));
    const position = finiteVector(sample?.position, 3) ? sample.position.map(Number) : null;
    const quaternion = normalizedQuaternion(sample?.quaternion_xyzw);
    if (!Number.isFinite(frame) || !position || !quaternion || sample?.valid === false) return false;
    this.poses.set(frame, { frame, position, quaternion });
    const ordered = [...this.poses.keys()].sort((a, b) => a - b);
    while (ordered.length > this.maxPoses) {
      // Preserve the first anchor and the most recent path samples.
      const removed = ordered.splice(1, 1)[0];
      this.poses.delete(removed);
    }
    return true;
  }

  track() {
    const samples = [...this.poses.values()].sort((a, b) => a.frame - b.frame);
    if (!samples.length) return null;
    const keyframes = samples.map((sample) => {
      const forward = rotate([0, 0, -1], sample.quaternion);
      return {
        frame: sample.frame,
        interpolation: "linear",
        camera: {
          position: [...sample.position],
          target: sample.position.map((value, axis) => value + forward[axis]),
          fov: this.fov, roll: 0, camera_type: "perspective",
          zoom: 1, near: 0.01, far: 10000,
        },
      };
    });
    return {
      schema_version: 1,
      fps: this.fps,
      duration_frames: Math.max(1, keyframes.at(-1).frame + 1),
      width: this.width,
      height: this.height,
      render_mode: "omni_ref",
      keyframes,
      objects: [],
      metadata: { transient: true, source: "opencv_live" },
    };
  }
}

