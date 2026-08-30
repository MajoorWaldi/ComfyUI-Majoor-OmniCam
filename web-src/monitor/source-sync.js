function widgetValue(node, name) {
  return node?.widgets?.find((widget) => widget.name === name)?.value;
}

function upstreamNode(node) {
  const input = node?.inputs?.find((item) => item.name === "camera_track");
  if (input?.link == null || !node?.graph) return null;
  const link = node.graph.links?.[input.link] ?? node.graph.links?.get?.(input.link);
  return link ? node.graph.getNodeById?.(link.origin_id) : null;
}

function sourceWidgetSnapshot(node) {
  const director = upstreamNode(node);
  const nodeClass = director?.comfyClass || director?.constructor?.type;
  if (nodeClass !== "MajoorOmniCamDirector") {
    return { director: null, stateJson: "", recordingPath: "" };
  }
  const stateJson = String(widgetValue(director, "state_json") || "");
  const recordingPath = String(widgetValue(director, "recording_path") || "");
  return { director, stateJson, recordingPath };
}

function canonicalTrack(state) {
  if (!state || typeof state !== "object") return null;
  return {
    schema_version: Number(state.schema_version || 1), fps: Number(state.fps || 24),
    duration_frames: Number(state.duration_frames || 1), width: Number(state.width || 1280),
    height: Number(state.height || 720), render_mode: state.render_mode || "omni_ref",
    keyframes: Array.isArray(state.keyframes) ? state.keyframes : [],
    objects: Array.isArray(state.objects) ? state.objects : [], metadata: state.metadata && typeof state.metadata === "object" ? state.metadata : {},
  };
}

export function readDirectorSource(node) {
  const { director, stateJson, recordingPath } = sourceWidgetSnapshot(node);
  if (!director) return { connected: false, track: null, recordingPath: "", director: null };
  try {
    const track = canonicalTrack(JSON.parse(stateJson || "{}"));
    if (!track?.keyframes?.length) throw new Error("Director track has no keyframes");
    return { connected: true, track, recordingPath, director };
  } catch (error) {
    return { connected: false, track: null, recordingPath: "", director, error: String(error?.message || error) };
  }
}

export class DirectorSourceWatcher {
  constructor(node, onChange, interval = 250) {
    this.node = node; this.onChange = onChange; this.initialized = false;
    this.lastDirector = null; this.lastStateJson = ""; this.lastRecordingPath = "";
    this.timer = setInterval(() => this.poll(), interval); this.poll();
  }
  poll() {
    const snapshot = sourceWidgetSnapshot(this.node);
    if (this.initialized
      && snapshot.director === this.lastDirector
      && snapshot.stateJson === this.lastStateJson
      && snapshot.recordingPath === this.lastRecordingPath) return false;
    this.initialized = true;
    this.lastDirector = snapshot.director;
    this.lastStateJson = snapshot.stateJson;
    this.lastRecordingPath = snapshot.recordingPath;
    this.onChange(readDirectorSource(this.node));
    return true;
  }
  dispose() { clearInterval(this.timer); this.timer = null; }
}
