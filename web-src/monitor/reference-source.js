// What the Monitor's Playblast player should actually show.
//
// `upstream-preview.js` reads whatever media element an upstream node has
// already rendered into its own DOM -- for the Director, that is its 3D
// viewport canvas, because the Director never keeps a `<video>` element
// around for the clip it just recorded. That fallback is honest for a
// third-party node whose output only exists once the graph runs; pointed at
// the Director it silently substitutes edit-time helpers, gizmos and the
// working camera for the clean, recorded proxy the compiled profile actually
// sends downstream.
//
// The Director already resolves this correctly for itself: `recording_path`
// is a widget kept in sync with the exact managed file `director.py` reads
// for its `playblast_video` output (see `serializeEditorState` in
// `state-sync.js`, mirrored here rather than re-derived, so the two can only
// drift by one of them being edited without the other). Reading it directly
// is both simpler and more honest than reconstructing the same answer from
// rendered pixels.

import { annotatedAssetUrl } from "../shared/managed-assets.js";
import { motionFingerprint } from "../shared/motion-fingerprint.js";

const DIRECTOR_CLASS = "MajoorOmniCamDirector";

function nodeClassOf(node) {
  return String(node?.comfyClass || node?.constructor?.type || "");
}

function widgetValue(node, name) {
  return node?.widgets?.find((item) => item.name === name)?.value;
}

function parsedStateOf(node) {
  try {
    const state = JSON.parse(String(widgetValue(node, "state_json") ?? "{}"));
    return state && typeof state === "object" ? state : {};
  } catch {
    return {};
  }
}

/**
 * True when the scene has visibly moved on since this playblast was
 * recorded. `undefined` fingerprints -- a playblast recorded before this
 * check existed -- compare as "unknown", not "outdated": there is no
 * evidence either way, and a permanent false warning on every pre-existing
 * recording would train users to ignore the real ones.
 */
function isOutdated(manifest, state) {
  const recorded = manifest?.motion_scene_fingerprint;
  if (!recorded) return false;
  return recorded !== motionFingerprint(state);
}

/**
 * The Director's own recorded playblast, if this origin is a Director and it
 * has recorded one. `null` for every other case -- no origin, a non-Director
 * origin, or a Director with nothing recorded yet -- so the caller's fallback
 * decides what to show instead.
 */
export function directorPlayblastSource(api, originNode) {
  if (nodeClassOf(originNode) !== DIRECTOR_CLASS) return null;
  const recordingPath = String(widgetValue(originNode, "recording_path") || "");
  if (!recordingPath) return null;
  const url = annotatedAssetUrl(api, recordingPath);
  if (!url) return null;
  const state = parsedStateOf(originNode);
  const manifest = state?.metadata?.playblast && typeof state.metadata.playblast === "object"
    ? state.metadata.playblast
    : {};
  return {
    kind: "director_playblast",
    url,
    fps: Number(manifest.fps) || undefined,
    frameCount: Number(manifest.frame_count) || undefined,
    width: Number(manifest.width) || undefined,
    height: Number(manifest.height) || undefined,
    durationSeconds: Number(manifest.duration_seconds) || undefined,
    encoder: typeof manifest.encoder === "string" ? manifest.encoder : undefined,
    outdated: isOutdated(manifest, state),
  };
}

/** True when a Director is connected but has not recorded a playblast yet. */
export function isUnrecordedDirector(originNode) {
  return nodeClassOf(originNode) === DIRECTOR_CLASS && !widgetValue(originNode, "recording_path");
}

/** One line for the "REFERENCE SOURCE" label, or "" when there is nothing to say. */
export function describeReferenceSource(source, originNode) {
  if (source) {
    const parts = [source.outdated ? "⚠ Playblast outdated (re-record before compiling)" : "● Director playblast"];
    if (source.width && source.height) parts.push(`${source.width}x${source.height}`);
    if (source.fps) parts.push(`${source.fps}fps`);
    if (source.frameCount) parts.push(`${source.frameCount} frames`);
    if (source.durationSeconds) parts.push(`${source.durationSeconds.toFixed(2)}s`);
    return parts.join(" · ");
  }
  if (isUnrecordedDirector(originNode)) {
    return "⚠ Director connected, no playblast recorded yet — showing the live viewport.";
  }
  return "";
}

/** "" fresh, "1" advisory (no playblast yet), "2" a real mismatch to act on. */
export function referenceSourceWarnLevel(source, originNode) {
  if (source?.outdated) return "2";
  if (source) return "";
  if (isUnrecordedDirector(originNode)) return "1";
  return "";
}
