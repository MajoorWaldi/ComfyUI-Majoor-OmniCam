import { SEQUENCE_TARGET, sequenceCuts } from "./director/sequence.js";
import { motionFingerprint } from "./shared/motion-fingerprint.js";

export function attachPlayblastMetrics(blob, metrics) {
  Object.defineProperty(blob, "omnicamMetrics", { value: Object.freeze({ ...metrics }), enumerable: true });
  return blob;
}

export function playblastManifest(ui, blob) {
  const metrics = blob?.omnicamMetrics || {};
  const fps = Number(metrics.fps) || Number(ui.state.fps);
  const frameCount = Number(metrics.requestedFrames) || Number(ui.state.duration_frames);
  const width = Number(metrics.width) || Number(ui.canvas.width);
  const height = Number(metrics.height) || Number(ui.canvas.height);
  const cuts = ui.state.playblast_camera_id === SEQUENCE_TARGET
    ? sequenceCuts(ui.state).map((cut) => ({ camera_id: cut.camera_id, start_frame: cut.start, end_frame: cut.end }))
    : [];
  return {
    format: "majoor.omnicam.playblast.v1",
    encoder: String(metrics.encoder || "unknown"),
    mime_type: String(blob?.type || "video/webm"),
    fps,
    frame_count: frameCount,
    duration_seconds: frameCount / fps,
    width,
    height,
    aspect_ratio: width / height,
    clean_capture: true,
    drift_ms: Number(metrics.driftMs) || 0,
    cuts,
    // What Monitor compares its own live recompute against to warn when the
    // edit has moved on since this file was recorded. Computed from `ui.state`
    // as it stands right now -- recording holds the panel locked, so this is
    // the state that produced the pixels above.
    motion_scene_fingerprint: motionFingerprint(ui.state),
  };
}

export function storePlayblastManifest(ui, blob) {
  const manifest = playblastManifest(ui, blob);
  ui.state.metadata = { ...(ui.state.metadata || {}), playblast: manifest };
  return manifest;
}