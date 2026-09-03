// A fingerprint of everything in a Director's editor state that can change
// what a recorded playblast looks like -- cameras, objects, cuts, render
// settings -- computed identically at record time (stored in the playblast
// manifest) and at preview time (recomputed from the Director's live
// `state_json`), so the two can be compared to tell a stale recording apart
// from a fresh one without re-encoding anything.
//
// Deliberately a subtractive list: only fields that provably never touch a
// recorded pixel -- which camera you happen to be *editing*, gizmo/snap
// preferences, viewport layout -- are named and excluded. A field nobody has
// classified yet defaults to being hashed. That is the safe direction to be
// wrong in: an extra "playblast outdated" warning costs a re-record, a missed
// one costs trusting footage that no longer matches the scene.

const EDITOR_CHROME_KEYS = new Set([
  // Which camera the outliner has selected for editing, not which one the
  // playblast recorded (that is `playblast_camera_id`, always hashed).
  "active_camera_id",
  // Tool state: gizmo mode/space, snapping, navigation feel, selection mode.
  "select_mode", "gizmo_mode", "gizmo_space", "navigation_profile",
  "spatial_snap_mode", "spatial_grid_size", "snap_enabled", "snap_frames",
  // Viewport chrome: which panel layout, which view is showing, panel density.
  "ui_density", "editor_views", "view_mode", "camera_view_visible",
  "timecode_mode", "loop_playback", "playback_range",
  // Bookkeeping that carries no scene geometry.
  "schema_version", "reference_index", "markers",
]);

//: Metadata keys removed before hashing: the manifest of the *previous*
//: playblast (and the two display-only fields mirrored from it) would make
//: every fingerprint depend on the fingerprint before it, which is circular.
//: `motion_scene_fingerprint_live` is this very hash, mirrored into the
//: serialized state so a headless compile can compare it against the recorded
//: playblast's fingerprint without re-deriving FNV in Python. Hashing it would
//: make the fingerprint depend on itself.
const METADATA_CHROME_KEYS = new Set([
  "playblast", "playblast_camera_id", "playblast_camera_name", "motion_scene_fingerprint_live",
]);

//: `recording_path` names where a file was uploaded, not anything that
//: touches a rendered pixel -- so it is excluded per-camera and on the
//: sequence, the two places it lives. This is not optional: `record.js`
//: writes it onto the camera/sequence object *after* the manifest snapshot
//: (`storePlayblastManifest`) is taken, so a fingerprint that hashed it would
//: read every playblast as outdated the instant it finished recording.
function stripRecordingPath(value) {
  if (!value || typeof value !== "object") return value;
  const { recording_path, ...rest } = value;
  return rest;
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = stableClone(value[key]);
    return out;
  }
  return value;
}

/** The subset of an editor state that actually determines recorded pixels. */
export function motionFingerprintInput(state) {
  const source = state && typeof state === "object" ? state : {};
  const picked = {};
  for (const key of Object.keys(source)) {
    if (!EDITOR_CHROME_KEYS.has(key)) picked[key] = source[key];
  }
  const metadata = { ...(picked.metadata && typeof picked.metadata === "object" ? picked.metadata : {}) };
  for (const key of METADATA_CHROME_KEYS) delete metadata[key];
  picked.metadata = metadata;
  if (Array.isArray(picked.cameras)) picked.cameras = picked.cameras.map(stripRecordingPath);
  if (picked.sequence) picked.sequence = stripRecordingPath(picked.sequence);
  return picked;
}

// FNV-1a: not cryptographic, and does not need to be -- this only has to
// disagree whenever the input does, for input the Director itself produced.
function fnv1a(text) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function motionFingerprint(state) {
  return fnv1a(JSON.stringify(stableClone(motionFingerprintInput(state))));
}
