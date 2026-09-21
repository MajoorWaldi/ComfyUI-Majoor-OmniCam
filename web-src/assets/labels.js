// Semantic tags + visible viewport annotations: the pure layer.
//
// `name` / `tags` / `annotation` are three separate things (design spec
// section 13): `name` is the Outliner identity, `tags` are machine semantics a
// future Agent resolves against, `annotation` is the visible viewport label.
// These validators mirror omnicam/assets/validation.py so the client rejects
// exactly what the server would; nothing here touches the DOM or three.js.

export const MAX_TAGS_PER_OBJECT = 32;
export const MAX_TAG_CHARS = 64;
export const MAX_ANNOTATION_CHARS = 128;

export const LABEL_MODES = Object.freeze(["off", "selected", "all"]);
export const LABEL_CONTENTS = Object.freeze(["annotation", "name", "tag"]);
export const DEFAULT_LABEL_SETTINGS = Object.freeze({ mode: "selected", content: "annotation" });
export const LABEL_ANCHORS = Object.freeze(["top", "center", "bottom"]);

const SLUG = /^[a-z0-9][a-z0-9_-]*$/;
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const UNSAFE_ANNOTATION = /[<>]|:\/\/|javascript:|expression\(|&#/i;

export function sanitizeTags(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const tag = item.trim().toLowerCase();
    if (!tag || tag.length > MAX_TAG_CHARS || !SLUG.test(tag) || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= MAX_TAGS_PER_OBJECT) break;
  }
  return out;
}

/** `"hero, subject"` / `["hero","subject"]` -> a clean tag array. */
export function parseTagInput(value) {
  if (Array.isArray(value)) return sanitizeTags(value);
  return sanitizeTags(String(value || "").split(/[,\n]/));
}

export function sanitizeAnnotation(raw) {
  if (!raw || typeof raw !== "object") return null;
  const text = typeof raw.text === "string" ? raw.text.trim() : "";
  if (!text || text.length > MAX_ANNOTATION_CHARS || UNSAFE_ANNOTATION.test(text)) return null;
  const rawColor = typeof raw.color === "string" ? raw.color.trim() : "";
  const color = HEX_COLOR.test(rawColor) ? rawColor.toLowerCase() : "#8d7ee8";
  const anchor = LABEL_ANCHORS.includes(raw.anchor) ? raw.anchor : "top";
  return { text, visible: raw.visible !== false, color, anchor };
}

export function sanitizeLabelSettings(raw) {
  return {
    mode: LABEL_MODES.includes(raw?.mode) ? raw.mode : DEFAULT_LABEL_SETTINGS.mode,
    content: LABEL_CONTENTS.includes(raw?.content) ? raw.content : DEFAULT_LABEL_SETTINGS.content,
  };
}

export function primaryTag(object) {
  return (Array.isArray(object?.tags) && object.tags[0]) || "";
}

/** The string a label shows for one object under the chosen content mode. */
export function labelText(object, content) {
  if (!object) return "";
  if (content === "name") return String(object.name || object.type || "");
  if (content === "tag") return primaryTag(object);
  const annotation = object.annotation;
  return annotation && annotation.visible !== false ? String(annotation.text || "") : "";
}

export function shouldShowLabel(object, { mode, selectedIds } = {}) {
  if (!object || object.enabled === false || mode === "off") return false;
  if (mode === "all") return true;
  const ids = selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);
  return ids.has(object.id);
}

const ORPHAN_TYPES = new Set(["camera", "null", "sun_light", "point_light", "spot_light"]);

/**
 * World-space anchor for an object's label (design spec section 14): the head
 * of a rigged Character (Phase 5), otherwise the top-centre of its bounds, with
 * a small lift for camera / light / null helpers.
 *
 * @param transform  a sampled world transform `{ position, size }`
 * @param type       the object's `type`
 * @param anchor     "top" | "center" | "bottom"
 *
 * **Origin conventions**
 * - `human`: feet at `position.y`, top at `position.y + size[1]`.
 * - All other meshes (box, sphere, card, camera helpers, etc.): centre at
 *   `position.y`, so top is at `position.y + halfH` and bottom at `position.y - halfH`.
 */
export function labelAnchorWorld(transform, type, anchor = "top") {
  const position = Array.isArray(transform?.position) ? transform.position : [0, 0, 0];
  const size = Array.isArray(transform?.size) ? transform.size : [1, 1, 1];
  const py = Number(position[1]) || 0;
  const h = Number(size[1]) || 1;

  let offsetY;
  if (type === "human") {
    // Human mesh: origin is at the feet. Full height is `h`.
    if (anchor === "top")    offsetY = h + 0.25;
    else if (anchor === "center") offsetY = h * 0.5;
    else /* bottom */        offsetY = 0;
  } else if (ORPHAN_TYPES.has(type)) {
    // Camera / light / null helpers: small lift above their icon.
    if (anchor === "top")    offsetY = 0.35;
    else if (anchor === "center") offsetY = 0;
    else /* bottom */        offsetY = -0.35;
  } else {
    // Center-origin meshes (box, sphere, card, ground, cylinder, torus…).
    const halfH = h * 0.5;
    if (anchor === "top")    offsetY = halfH + 0.2;
    else if (anchor === "center") offsetY = 0;
    else /* bottom */        offsetY = -(halfH + 0.2);
  }

  return [Number(position[0]) || 0, py + offsetY, Number(position[2]) || 0];
}
