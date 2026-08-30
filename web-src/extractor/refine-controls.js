// The cleanup desk: sliders in, a refine request out.
//
// Refining is cheap on the server (no decode, no solver), but it is still a
// round trip, and a slider drag fires dozens of input events a second. So the
// requests are debounced and de-duplicated: dragging produces one refine at the
// end of the gesture, not forty in flight.

export const REFINE_DEBOUNCE_MS = 200;

export const REFINE_DEFAULTS = {
  position_smoothing: 0.15,
  rotation_smoothing: 0.1,
  motion_scale: 1.0,
  normalize_origin: true,
  trim_start_frame: 0,
  trim_end_frame: 0,
  global_rotation_xyzw: null,
  estimate_up: false,
  spike_actions: {},
  simplify_keys: true,
  position_tolerance: 0.01,
  rotation_tolerance_deg: 0.25,
};

/** The three alignment offsets the panel exposes, in degrees. */
export function createAlignment() {
  return { pitch: 0, yaw: 0, roll: 0 };
}

export class RefineController {
  constructor({ onRefine, delay = REFINE_DEBOUNCE_MS, setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
    this.settings = { ...REFINE_DEFAULTS };
    this.alignment = createAlignment();
    this.onRefine = onRefine || (() => {});
    this.delay = delay;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.timer = null;
    this.lastSent = "";
  }

  /** Merge a change and schedule a refine. Returns the merged settings. */
  update(patch) {
    this.settings = { ...this.settings, ...patch };
    this.schedule();
    return this.settings;
  }

  setAlignment(patch) {
    this.alignment = { ...this.alignment, ...patch };
    // Dialling an angle overrules a previous estimate: the server prefers an
    // explicit rotation, and leaving the flag set would be misleading here.
    return this.update({
      global_rotation_xyzw: alignmentQuaternion(this.alignment), estimate_up: false,
    });
  }

  /** Ask the server to derive the levelling rotation from the solve itself. */
  requestEstimatedUp() {
    this.alignment = createAlignment();
    return this.update({ global_rotation_xyzw: null, estimate_up: true });
  }

  setSpikeAction(frame, action) {
    const actions = { ...this.settings.spike_actions };
    if (action === "ignore") delete actions[String(frame)];
    else actions[String(frame)] = action;
    return this.update({ spike_actions: actions });
  }

  reset() {
    this.settings = { ...REFINE_DEFAULTS };
    this.alignment = createAlignment();
    this.schedule();
    return this.settings;
  }

  payload() {
    return { ...this.settings };
  }

  schedule() {
    this.clearTimer(this.timer);
    this.timer = this.setTimer(() => this.flush(), this.delay);
  }

  /** Send now, unless these exact settings were the last thing sent. */
  flush() {
    this.clearTimer(this.timer);
    this.timer = null;
    const key = JSON.stringify(this.settings);
    if (key === this.lastSent) return null;
    this.lastSent = key;
    return this.onRefine(this.payload());
  }

  dispose() {
    this.clearTimer(this.timer);
    this.timer = null;
  }
}

/**
 * One world rotation from pitch/yaw/roll degrees, in XYZ order.
 *
 * Mirrors omnicam.core.camera_math.quaternion_from_euler so the panel's preview
 * and the server's refinement agree on what "20 degrees of roll" means.
 */
export function alignmentQuaternion({ pitch = 0, yaw = 0, roll = 0 } = {}) {
  if (!pitch && !yaw && !roll) return null;
  const [x, y, z] = [pitch, yaw, roll].map((value) => (Number(value) || 0) * (Math.PI / 180) * 0.5);
  const [cx, sx, cy, sy, cz, sz] = [
    Math.cos(x), Math.sin(x), Math.cos(y), Math.sin(y), Math.cos(z), Math.sin(z),
  ];
  return [
    sx * cy * cz + cx * sy * sz,
    cx * sy * cz - sx * cy * sz,
    cx * cy * sz + sx * sy * cz,
    cx * cy * cz - sx * sy * sz,
  ];
}
