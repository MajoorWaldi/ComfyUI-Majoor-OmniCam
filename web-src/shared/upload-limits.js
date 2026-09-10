// Client-side mirror of the byte ceilings in omnicam/routes.py. Enforced here
// so the browser refuses an oversized file *before* it is read into memory --
// file.arrayBuffer(), AudioContext.decodeAudioData(), a blob: URL or an upload
// each buffer the whole file, and a multi-hundred-megabyte FBX can freeze the
// tab long before the backend's own HTTPRequestEntityTooLarge would fire.
//
// These match routes.py's fixed MAX_* constants. The backend stays
// authoritative; this is a fast, friendly pre-check, not the source of truth.

const MB = 1024 * 1024;

export const UPLOAD_LIMITS = Object.freeze({
  card: 128 * MB, // MAX_CARD_BYTES
  model: 256 * MB, // MAX_MODEL_BYTES
  fbx: 64 * MB, // MAX_FBX_MODEL_BYTES
  image: 128 * MB, // background stills go through the card/asset route
  audio: 128 * MB, // no upload, but decodeAudioData still buffers it all
});

// A background image sequence is still a frame dump; cap it the way the
// backend caps an APNG/GIF (MAX_IMAGE_FRAMES).
export const MAX_BACKGROUND_SEQUENCE_FRAMES = 2000;

function megabytes(bytes) {
  return `${(bytes / MB).toFixed(bytes >= 10 * MB ? 0 : 1)} MB`;
}

/**
 * Returns a human-readable error string when `file` is over the limit for
 * `kind`, or `null` when it is acceptable (or unmeasurable). Never throws.
 */
export function fileSizeError(file, kind) {
  const limit = UPLOAD_LIMITS[kind];
  if (!file || !limit) return null;
  const size = Number(file.size);
  if (!Number.isFinite(size) || size <= limit) return null;
  return `${file.name || "File"} is ${megabytes(size)}; the maximum is ${megabytes(limit)}.`;
}

/** Returns an error string when a background sequence has too many frames. */
export function sequenceLengthError(count) {
  if (Number(count) <= MAX_BACKGROUND_SEQUENCE_FRAMES) return null;
  return `${count} frames selected; a background sequence is limited to ${MAX_BACKGROUND_SEQUENCE_FRAMES}.`;
}
