/**
 * What is actually wired into the Monitor's two sockets.
 *
 * This used to answer the wrong question twice. It asked "is the upstream node
 * a MajoorOmniCamDirector?" -- so an Extractor, or any other node producing a
 * MAJOOR_OMNICAM_TRACK the backend accepts perfectly well, showed OFFLINE. And
 * it derived "is a proxy available?" from the Director's `recording_path`,
 * so a VIDEO node wired straight into `proxy_video` reported "no proxy" on a
 * graph that would have executed fine.
 *
 * The socket is the truth. A Director additionally exposes its authored track
 * in a widget, which is what makes live preview possible before execution; any
 * other producer is connected-but-unresolved until the graph runs, which is a
 * third state, not an offline one.
 */

import { linkedOrigin } from "../graph-links.js";
import { upstreamPreviewMedia } from "../shared/upstream-preview.js";

const TRACK_STATE_WIDGETS = ["state_json", "track_json"];

function widgetValue(node, name) {
  return node?.widgets?.find((widget) => widget.name === name)?.value;
}

function nodeClassOf(node) {
  return String(node?.comfyClass || node?.constructor?.type || "");
}

function upstreamNode(node, inputName) {
  const input = node?.inputs?.find((item) => item.name === inputName);
  if (input?.link == null || !node?.graph) return null;
  return linkedOrigin(node.graph, input.link);
}

function readTrackWidget(origin) {
  for (const name of TRACK_STATE_WIDGETS) {
    const value = widgetValue(origin, name);
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

/** Media facts the H3 nodes are going to be judged on, when observable. */
function proxyFacts(node) {
  const origin = upstreamNode(node, "proxy_video");
  if (!origin) return { available: false, source: "none" };
  const facts = { available: true, source: nodeClassOf(origin) || "upstream" };
  // A decoded <video> knows its own duration; nothing in the browser reliably
  // reports frame rate, so it stays unknown here and the preflight says so
  // rather than guessing. Execution reads both from the real VIDEO object.
  const media = upstreamPreviewMedia(origin);
  if (media && Number.isFinite(media.duration) && media.duration > 0) {
    facts.duration_seconds = media.duration;
  }
  return facts;
}

function canonicalTrack(state) {
  if (!state || typeof state !== "object") return null;
  return {
    schema_version: Number(state.schema_version || 1), fps: Number(state.fps || 24),
    duration_frames: Number(state.duration_frames || 1), width: Number(state.width || 1280),
    height: Number(state.height || 720), render_mode: state.render_mode || "omni_ref",
    keyframes: Array.isArray(state.keyframes) ? state.keyframes : [],
    objects: Array.isArray(state.objects) ? state.objects : [],
    metadata: state.metadata && typeof state.metadata === "object" ? state.metadata : {},
  };
}

function sourceWidgetSnapshot(node) {
  const origin = upstreamNode(node, "camera_track");
  if (!origin) {
    return { origin: null, nodeClass: "", stateJson: "", recordingPath: "", proxy: proxyFacts(node) };
  }
  return {
    origin,
    nodeClass: nodeClassOf(origin),
    stateJson: readTrackWidget(origin),
    recordingPath: String(widgetValue(origin, "recording_path") || ""),
    proxy: proxyFacts(node),
  };
}

export function readTrackSource(node) {
  const snapshot = sourceWidgetSnapshot(node);
  const base = {
    connected: false, resolved: false, track: null, recordingPath: "",
    director: null, origin: snapshot.origin, nodeClass: snapshot.nodeClass,
    proxy: snapshot.proxy,
  };
  if (!snapshot.origin) return base;
  if (!snapshot.stateJson) {
    // Connected to a producer that only materialises its track at execution
    // time (Extractor, or any third-party node). The graph is valid; the
    // Monitor simply cannot preview it until the prompt runs.
    return { ...base, connected: true, resolved: false };
  }
  try {
    const track = canonicalTrack(JSON.parse(snapshot.stateJson));
    if (!track?.keyframes?.length) throw new Error("The connected track has no keyframes");
    return {
      ...base, connected: true, resolved: true, track,
      recordingPath: snapshot.recordingPath, director: snapshot.origin,
    };
  } catch (error) {
    return { ...base, connected: true, resolved: false, error: String(error?.message || error) };
  }
}

// Kept under its historical name so older callers keep working.
export const readDirectorSource = readTrackSource;

export class TrackSourceWatcher {
  constructor(node, onChange, interval = 250) {
    this.node = node; this.onChange = onChange; this.initialized = false;
    this.last = null;
    this.timer = setInterval(() => this.poll(), interval); this.poll();
  }

  key(snapshot) {
    return JSON.stringify([
      snapshot.nodeClass, snapshot.stateJson, snapshot.recordingPath, snapshot.proxy,
    ]);
  }

  poll() {
    const snapshot = sourceWidgetSnapshot(this.node);
    const key = this.key(snapshot);
    if (this.initialized && snapshot.origin === this.lastOrigin && key === this.last) return false;
    this.initialized = true;
    this.lastOrigin = snapshot.origin;
    this.last = key;
    this.onChange(readTrackSource(this.node));
    return true;
  }

  dispose() { clearInterval(this.timer); this.timer = null; }
}

export const DirectorSourceWatcher = TrackSourceWatcher;
