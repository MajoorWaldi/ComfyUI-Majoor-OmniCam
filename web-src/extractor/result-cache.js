// The Extractor's browser-side result cache.
//
// A solved track lives in the executing Python process; the Director lives in
// the browser. The bridge is the node's PreviewText envelope, cached into two
// serialized widgets so the result survives a workflow save/reload without
// re-running the solve.
//
// The widgets are frontend-only on purpose. They are not backend schema
// inputs, so they never touch the node's execution cache key -- adding them
// there would make every reload look like a changed prompt.

export { EXTRACTOR_NODE_CLASS } from "../node-classes.js";
export const RESULT_ENVELOPE_KIND = "omnicam_extractor_result_v2";
export const SCENE_WIDGET = "omnicam_extracted_motion_scene_json";
export const FINGERPRINT_WIDGET = "omnicam_extracted_track_fingerprint";
export const SOURCE_WIDGET = "omnicam_extractor_source";

export function motionSceneCameraTrack(motionScene) {
  if (!motionScene || motionScene.version !== 1 || !Array.isArray(motionScene.cameras)) return null;
  const cameraId = String(motionScene.playblast_camera_id || motionScene.active_camera_id || "");
  const camera = motionScene.cameras.find((item) => String(item?.id || "") === cameraId);
  const track = camera?.track;
  return track && Array.isArray(track.keyframes) && track.keyframes.length ? track : null;
}

export function motionSceneFromTrack(track) {
  if (!track || !Array.isArray(track.keyframes) || !track.keyframes.length) return null;
  const fps = Number(track.fps);
  const durationFrames = Number(track.duration_frames);
  if (!(fps > 0) || !(durationFrames > 0)) return null;
  const fingerprint = String(track.metadata?.extractor_fingerprint || "");
  return {
    version: 1,
    timeline: { duration_seconds: durationFrames / fps, authoring_fps: fps },
    canvas: { width: Number(track.width), height: Number(track.height) },
    cameras: [{ id: "extracted_camera", label: "Extracted Camera", enabled: true, track }],
    active_camera_id: "extracted_camera",
    playblast_camera_id: "extracted_camera",
    objects: Array.isArray(track.objects) ? track.objects : [],
    motion_layers: [],
    cuts: [],
    metadata: { ...(track.metadata || {}), source: "omnicam_extractor", extractor_fingerprint: fingerprint },
  };
}

/** Parse an onExecuted message into a result, or null if it is not ours. */
export function parseExtractorMessage(message) {
  const text = message?.text;
  const raw = Array.isArray(text) ? text[0] : text;
  if (typeof raw !== "string" || !raw) return null;
  let envelope;
  try {
    envelope = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!envelope || envelope.kind !== RESULT_ENVELOPE_KIND) return null;
  const motionScene = envelope.motion_scene;
  const track = motionSceneCameraTrack(motionScene);
  if (!track) return null;
  return {
    motionScene,
    track,
    fingerprint: String(envelope.fingerprint || ""),
    solver_coverage: Number(envelope.solver_coverage) || 0,
    report: String(envelope.report || ""),
    source: String(envelope.source || ""),
  };
}

function hide(widget) {
  widget.computeSize = () => [0, -4];
  widget.draw = () => {};
  widget.hidden = true;
  widget.options = { ...(widget.options || {}), hideInVueNodes: true };
  return widget;
}

function findWidget(node, name) {
  return node.widgets?.find((widget) => widget.name === name) || null;
}

/** Create the two cache widgets once, hidden but serialized with the workflow. */
export function ensureCacheWidgets(node) {
  const widgets = [];
  for (const name of [SCENE_WIDGET, FINGERPRINT_WIDGET]) {
    let widget = findWidget(node, name);
    if (!widget) {
      widget = node.addWidget?.("text", name, "", () => {}, { serialize: true });
      if (!widget) continue;
      hide(widget);
    }
    widgets.push(widget);
  }
  return widgets;
}

/**
 * Re-apply saved values to the cache widgets, which are created too late to get them.
 *
 * ComfyUI writes `widgets_values` positionally into the widgets a node has at
 * `configure()` time. Ours are frontend-only and are added when the lazily
 * imported panel attaches, which is *after* that -- so the saved solve was
 * serialized correctly and then dropped on the way back in, and the panel came
 * up empty after every browser refresh.
 *
 * ComfyUI's own PrimitiveNode recovers the same way, from the same array, for
 * the same reason: widgets it builds only once a connection exists.
 *
 * @returns {number} how many widgets took a value back.
 */
export function restoreLateWidgetValues(node) {
  const saved = node?.widgets_values;
  const widgets = node?.widgets;
  if (!Array.isArray(saved) || !Array.isArray(widgets)) return 0;
  let restored = 0;
  for (const name of [SCENE_WIDGET, FINGERPRINT_WIDGET, SOURCE_WIDGET]) {
    const index = widgets.findIndex((widget) => widget?.name === name);
    if (index < 0 || index >= saved.length) continue;
    const value = saved[index];
    if (typeof value !== "string" || !value) continue;
    // Never clobber a live value: a solve that finished while the workflow was
    // loading is newer than anything the file carried.
    if (widgets[index].value) continue;
    widgets[index].value = value;
    restored += 1;
  }
  return restored;
}

/** Store a parsed result on the node. Returns true when the fingerprint changed. */
export function cacheExtractorResult(node, result) {
  ensureCacheWidgets(node);
  const sceneWidget = findWidget(node, SCENE_WIDGET);
  const fingerprintWidget = findWidget(node, FINGERPRINT_WIDGET);
  const changed = String(fingerprintWidget?.value || "") !== result.fingerprint;
  if (sceneWidget) sceneWidget.value = JSON.stringify(result.motionScene);
  if (fingerprintWidget) fingerprintWidget.value = result.fingerprint;
  return changed;
}

export function cacheExtractorSource(node, source) {
  const sourceWidget = findWidget(node, SOURCE_WIDGET);
  if (!sourceWidget || !source) return false;
  const next = String(source);
  const changed = String(sourceWidget.value || "") !== next;
  sourceWidget.value = next;
  return changed;
}

/** Read back what an Extractor node has cached, or null when it has nothing. */
export function readCachedResult(node) {
  const fingerprint = String(findWidget(node, FINGERPRINT_WIDGET)?.value || "");
  const raw = String(findWidget(node, SCENE_WIDGET)?.value || "");
  if (!fingerprint || !raw) return null;
  let motionScene;
  try {
    motionScene = JSON.parse(raw);
  } catch {
    return null;
  }
  const track = motionSceneCameraTrack(motionScene);
  if (!track) return null;
  return { motionScene, track, fingerprint };
}

/** A compact one-line summary for the node body -- never the whole JSON. */
export function statusLine(result) {
  const metadata = result?.track?.metadata || {};
  const backend = String(metadata.backend || "solver").toUpperCase();
  const frames = Number(result?.track?.duration_frames) || 0;
  const keys = Array.isArray(result?.track?.keyframes) ? result.track.keyframes.length : 0;
  const coverage = Math.round((Number(result?.solver_coverage ?? result?.confidence) || 0) * 100);
  return `${backend} · ${frames} f · ${keys} keys · Solver Coverage ${coverage}%`;
}
