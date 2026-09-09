// Character motion clips: the pure layer (design spec section 27). A motion is
//   { clip_id, start_frame, end_frame, speed, loop, offset_seconds }
// It formalises the clip playback the runtime already does -- the viewport
// render loop turns a Director frame into a mixer time through motionClipTime().
// Pose editing and an active motion are mutually exclusive (enforced in
// director-api/apply.js and the editor). No DOM, no three.js.

export const MOTION_SPEED_RANGE = Object.freeze([0.05, 8]);
export const MAX_CLIP_ID_CHARS = 80;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** A clean motion object, or null when the input cannot be a motion. */
export function sanitizeMotion(raw) {
  if (!raw || typeof raw !== "object") return null;
  const clipId = String(raw.clip_id ?? "").trim();
  if (!clipId || clipId.length > MAX_CLIP_ID_CHARS) return null;
  const start = Math.max(0, Math.round(Number(raw.start_frame) || 0));
  const rawEnd = Math.round(Number(raw.end_frame) || 0);
  // end_frame <= start_frame means "play to the natural clip end".
  const end = rawEnd > start ? rawEnd : 0;
  const speedIn = Number(raw.speed);
  const speed = clamp(Number.isFinite(speedIn) && speedIn > 0 ? speedIn : 1, MOTION_SPEED_RANGE[0], MOTION_SPEED_RANGE[1]);
  const offsetIn = Number(raw.offset_seconds);
  return {
    clip_id: clipId,
    start_frame: start,
    end_frame: end,
    speed,
    loop: raw.loop !== false,
    offset_seconds: Number.isFinite(offsetIn) ? offsetIn : 0,
  };
}

export function motionRangeIsValid(raw) {
  const start = Math.round(Number(raw?.start_frame) || 0);
  const end = Math.round(Number(raw?.end_frame) || 0);
  return !(end > 0 && end <= start);
}

/** True while `frame` is inside the motion's active Director-frame window. */
export function isMotionActive(motion, frame) {
  const m = sanitizeMotion(motion);
  if (!m) return false;
  if (frame < m.start_frame) return false;
  return m.end_frame > m.start_frame ? frame <= m.end_frame : true;
}

/**
 * The mixer time (seconds into the clip) for a Director `frame`.
 *  - before start_frame: the clip's first frame (offset)
 *  - inside the window: offset + (frame - start) * speed / fps, looped or clamped
 *  - past end_frame (non-loop): held on the last played frame
 */
export function motionClipTime(motion, frame, fps, clipDuration) {
  const m = sanitizeMotion(motion);
  const duration = Number(clipDuration) || 0;
  const rate = Math.max(1, Number(fps) || 24);
  if (!m || duration <= 0) return 0;

  const wrap = (t) => (m.loop ? ((t % duration) + duration) % duration : clamp(t, 0, duration));
  if (frame <= m.start_frame) return wrap(m.offset_seconds);

  const windowEnd = m.end_frame > m.start_frame ? m.end_frame : null;
  const activeFrame = windowEnd !== null && !m.loop ? Math.min(frame, windowEnd) : frame;
  const seconds = m.offset_seconds + ((activeFrame - m.start_frame) * m.speed) / rate;
  return wrap(seconds);
}

/** Merge a partial edit onto an existing motion (or start from defaults). */
export function withMotionPatch(motion, patch) {
  return sanitizeMotion({ ...(sanitizeMotion(motion) || { clip_id: patch?.clip_id, speed: 1, loop: true }), ...patch });
}
