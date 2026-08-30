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
export const RESULT_ENVELOPE_KIND = "omnicam_extractor_result_v1";
export const TRACK_WIDGET = "omnicam_extracted_track_json";
export const FINGERPRINT_WIDGET = "omnicam_extracted_track_fingerprint";
export const SOURCE_WIDGET = "omnicam_extractor_source";

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
  const track = envelope.track;
  if (!track || !Array.isArray(track.keyframes)) return null;
  return {
    track,
    fingerprint: String(envelope.fingerprint || ""),
    confidence: Number(envelope.confidence) || 0,
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
  for (const name of [TRACK_WIDGET, FINGERPRINT_WIDGET]) {
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

/** Store a parsed result on the node. Returns true when the fingerprint changed. */
export function cacheExtractorResult(node, result) {
  ensureCacheWidgets(node);
  const trackWidget = findWidget(node, TRACK_WIDGET);
  const fingerprintWidget = findWidget(node, FINGERPRINT_WIDGET);
  const changed = String(fingerprintWidget?.value || "") !== result.fingerprint;
  if (trackWidget) trackWidget.value = JSON.stringify(result.track);
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
  const raw = String(findWidget(node, TRACK_WIDGET)?.value || "");
  if (!fingerprint || !raw) return null;
  let track;
  try {
    track = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!track || !Array.isArray(track.keyframes) || !track.keyframes.length) return null;
  return { track, fingerprint };
}

/** A compact one-line summary for the node body -- never the whole JSON. */
export function statusLine(result) {
  const metadata = result?.track?.metadata || {};
  const backend = String(metadata.backend || "solver").toUpperCase();
  const frames = Number(result?.track?.duration_frames) || 0;
  const keys = Array.isArray(result?.track?.keyframes) ? result.track.keyframes.length : 0;
  const coverage = Math.round((Number(result?.confidence) || 0) * 100);
  return `${backend} · ${frames} f · ${keys} keys · ${coverage}%`;
}
