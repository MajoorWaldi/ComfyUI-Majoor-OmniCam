// Multi-camera edit over the shared timeline.
//
// Every camera is animated on the same timeline, and the edit partitions it:
// F0-50 goes to cam 1, F51-90 to cam 2, and so on. A cut therefore only needs
// to store where it *starts* -- its end is the next cut's start, or the last
// frame. That representation makes a gap or an overlap unrepresentable, and
// turns trimming into moving a single boundary.
//
// Playing the edit back is one function: cutAtFrame(). playblastCameraTrack()
// consults it, and because that is the single choke point every recording goes
// through, the playblast records the finished edit in one pass.

// Deliberately dependency-free: core.js imports this for sanitizeState, so
// importing core.js back would make the pair circular.

/** Sentinel stored in state.playblast_camera_id when the target is the edit. */
export const SEQUENCE_TARGET = "__sequence__";

export function defaultSequence() {
  return { enabled: false, cuts: [], recording_path: "" };
}

/**
 * Cut starts are only floored at 0, never clamped to the end of the timeline.
 * Clamping would fold every cut past a shortened end onto the last frame, where
 * the dedupe below would keep just one of them -- the same way shortening a
 * shot used to eat keyframes. Cuts beyond the end go dormant instead, and
 * sequenceCuts() simply stops reporting them until the shot is lengthened.
 */
export function sanitizeSequence(value, cameraIds = []) {
  const source = value && typeof value === "object" ? value : {};
  const known = new Set(cameraIds);
  const seen = new Set();
  const cuts = (Array.isArray(source.cuts) ? source.cuts : [])
    .filter((cut) => cut && typeof cut === "object" && known.has(String(cut.camera_id)))
    .map((cut) => ({
      camera_id: String(cut.camera_id),
      start: Math.max(0, Math.round(Number(cut.start) || 0)),
    }))
    .sort((a, b) => a.start - b.start)
    .filter((cut) => {
      if (seen.has(cut.start)) return false;
      seen.add(cut.start);
      return true;
    });
  // Frame 0 has to belong to someone, so the earliest cut owns it.
  if (cuts.length) cuts[0].start = 0;
  return {
    enabled: Boolean(source.enabled) && cuts.length > 0,
    cuts,
    recording_path: typeof source.recording_path === "string" ? source.recording_path : "",
  };
}

/** The cuts that actually fall inside the timeline, with their ends resolved. */
export function sequenceCuts(state) {
  const lastFrame = Math.max(0, (state?.duration_frames || 1) - 1);
  const visible = (state?.sequence?.cuts || []).filter((cut) => cut.start <= lastFrame);
  return visible.map((cut, index) => ({
    camera_id: cut.camera_id,
    start: cut.start,
    end: index + 1 < visible.length ? visible[index + 1].start - 1 : lastFrame,
  }));
}

/** True when the edit is on and has something to play. */
export function sequenceActive(state) {
  return Boolean(state?.sequence?.enabled) && sequenceCuts(state).length > 0;
}

/** The cut covering `frame`, or null. */
export function cutAtFrame(state, frame) {
  const cuts = sequenceCuts(state);
  if (!cuts.length) return null;
  const target = Math.max(0, Math.round(Number(frame) || 0));
  for (let index = cuts.length - 1; index >= 0; index--) {
    if (target >= cuts[index].start) return cuts[index];
  }
  return cuts[0];
}

/** Cameras the edit actually uses, in cut order, without repeats. */
export function sequenceCameraIds(state) {
  return [...new Set(sequenceCuts(state).map((cut) => cut.camera_id))];
}

/** One cut per camera, split evenly: a usable starting point rather than a blank lane. */
export function autoSequenceCuts(state) {
  const cameras = state?.cameras || [];
  const lastFrame = Math.max(0, (state?.duration_frames || 1) - 1);
  if (!cameras.length) return [];
  const span = (lastFrame + 1) / cameras.length;
  const cuts = cameras.map((camera, index) => ({
    camera_id: camera.id,
    start: index === 0 ? 0 : Math.round(index * span),
  }));
  // A timeline shorter than the camera count cannot give every camera a frame;
  // drop the ones that would start on top of another rather than overlap.
  const seen = new Set();
  return cuts.filter((cut) => {
    if (cut.start > lastFrame || seen.has(cut.start)) return false;
    seen.add(cut.start);
    return true;
  });
}

/** Move the boundary that opens `index`, kept strictly between its neighbours. */
export function trimCutStart(state, index, frame) {
  const cuts = state?.sequence?.cuts || [];
  if (index <= 0 || index >= cuts.length) return false;
  const lowest = cuts[index - 1].start + 1;
  const highest = (index + 1 < cuts.length ? cuts[index + 1].start : (state.duration_frames || 1)) - 1;
  if (highest < lowest) return false;
  const next = Math.max(lowest, Math.min(highest, Math.round(Number(frame) || 0)));
  if (next === cuts[index].start) return false;
  cuts[index].start = next;
  return true;
}

/** The camera after `cameraId` in the project list, wrapping around. */
export function nextCameraId(state, cameraId) {
  const cameras = state?.cameras || [];
  if (!cameras.length) return cameraId;
  const at = cameras.findIndex((camera) => camera.id === cameraId);
  return cameras[(at + 1) % cameras.length].id;
}

/**
 * Split the cut covering `frame` at that frame.
 *
 * `cameraId` null means "the next camera": a split that keeps the same camera on
 * both halves is invisible, so it would read as broken. The caller can still
 * pass an explicit camera.
 */
export function splitCutAtFrame(state, frame, cameraId = null) {
  const cuts = state?.sequence?.cuts || [];
  const target = Math.max(0, Math.round(Number(frame) || 0));
  if (!cuts.length || target <= 0 || cuts.some((cut) => cut.start === target)) return false;
  const covering = cutAtFrame(state, target);
  const base = covering?.camera_id || cuts[0].camera_id;
  cuts.push({ camera_id: cameraId || nextCameraId(state, base), start: target });
  cuts.sort((a, b) => a.start - b.start);
  return true;
}

/** Remove a cut; the previous one absorbs its range. The first cut cannot go alone. */
export function removeCut(state, index) {
  const cuts = state?.sequence?.cuts || [];
  if (index < 0 || index >= cuts.length) return false;
  if (cuts.length === 1) return false;
  cuts.splice(index, 1);
  if (cuts.length) cuts[0].start = 0;
  return true;
}
