// Building a live-preflight request from a connected Director's own widgets,
// without touching the network. Kept separate from MonitorRefreshController
// so the payload shape is testable without a fetch.
//
// Only a Director can be answered live: it is the only upstream that keeps
// its state in widgets (`state_json`, `recording_path`, ...) readable without
// ComfyUI having executed anything. A third-party MotionScene source has no
// such state client-side -- the panel has to say so honestly rather than
// invent a preview.

const DIRECTOR_CLASS = "MajoorOmniCamDirector";

function nodeClassOf(node) {
  return String(node?.comfyClass || node?.constructor?.type || "");
}

function widgetValue(node, name, fallback) {
  const widget = node?.widgets?.find((item) => item.name === name);
  return widget && widget.value !== undefined ? widget.value : fallback;
}

/** True only when the scene comes straight from a Director. */
export function canPreviewLive(sceneOrigin) {
  return nodeClassOf(sceneOrigin) === DIRECTOR_CLASS;
}

/** The Director half of a live preflight request: its queue widgets, as-is. */
export function directorLivePayload(originNode) {
  return {
    state_json: String(widgetValue(originNode, "state_json", "{}")),
    recording_path: String(widgetValue(originNode, "recording_path", "")),
    card_asset: String(widgetValue(originNode, "card_asset", "")),
    width: Number(widgetValue(originNode, "width", 1280)),
    height: Number(widgetValue(originNode, "height", 720)),
    fps: Number(widgetValue(originNode, "fps", 24)),
    duration_seconds: Number(widgetValue(originNode, "duration_seconds", 5)),
    render_mode: String(widgetValue(originNode, "render_mode", "omni_ref")),
  };
}

/** The Monitor half: its own settings, already shaped by monitorWidgetValues(). */
export function monitorLivePayload(values) {
  return {
    target_profile: String(values?.target_profile ?? ""),
    base_prompt: String(values?.base_prompt ?? ""),
    target_width: Number(values?.target_width ?? 832),
    target_height: Number(values?.target_height ?? 480),
    duration_seconds: Number(values?.duration_seconds ?? 2.0),
    target_fps: Number(values?.target_fps ?? 24.0),
  };
}

/** The full request body /majoor/omnicam/monitor/live_preflight expects. */
export function liveRequestPayload(originNode, monitorValues) {
  return {
    director: directorLivePayload(originNode),
    monitor: monitorLivePayload(monitorValues),
  };
}
