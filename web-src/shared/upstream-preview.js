// A client-only fallback preview for an upstream node's image/video, the way
// ComfyUI-Majoor-ImageOps previews every one of its own nodes: read whatever
// pixels the connected node has already rendered into its own DOM -- a
// `node.imgs` thumbnail ComfyUI populated after a previous run, or a widget's
// own `<img>`/`<video>`/`<canvas>` element -- instead of asking the backend to
// resolve a managed file.
//
// This exists for exactly the gap a managed-file preview cannot cover: a
// generator connected to a VIDEO/IMAGE socket that has not produced a file on
// disk yet. It never proves the source is *solvable* (Extractor still needs a
// real file for that); it only proves something is actually connected.

function isMediaElement(value) {
  return value instanceof HTMLImageElement || value instanceof HTMLVideoElement || value instanceof HTMLCanvasElement;
}

/** The media element a widget already displays, if any. */
export function widgetPreviewMedia(widget) {
  const element = widget?.element;
  if (!element) return null;
  if (isMediaElement(element)) return element;
  return element.querySelector?.("img, video, canvas") ?? null;
}

/**
 * The best already-rendered media element an upstream node can offer right
 * now: its own `node.imgs` (from ComfyUI's native post-execution thumbnail),
 * falling back to the first widget that already shows one.
 */
export function upstreamPreviewMedia(originNode) {
  if (!originNode) return null;
  const imgs = originNode.imgs;
  if (Array.isArray(imgs) && imgs.length) {
    const index = typeof originNode.imageIndex === "number" ? originNode.imageIndex : imgs.length - 1;
    const media = imgs[Math.max(0, Math.min(imgs.length - 1, index))] ?? imgs[imgs.length - 1] ?? null;
    if (isMediaElement(media)) return media;
  }
  for (const widget of originNode.widgets || []) {
    const media = widgetPreviewMedia(widget);
    if (media) return media;
  }
  return null;
}

function readyDimensions(media) {
  if (media instanceof HTMLVideoElement) return [media.videoWidth, media.videoHeight];
  if (media instanceof HTMLImageElement) return [media.naturalWidth, media.naturalHeight];
  return [media.width, media.height];
}

/**
 * Draw a media element into a canvas, scaled to fit within `maxSize`.
 * Resolves `false` rather than throwing when the media has no usable frame
 * yet (an image mid-decode, a video with no data): the caller keeps whatever
 * it already had rather than blanking the preview.
 */
export async function drawUpstreamPreview(media, canvas, maxSize = 512) {
  if (!media || !canvas) return false;
  if (media instanceof HTMLImageElement && !media.complete) {
    try { await media.decode?.(); } catch { /* fall through to the readiness check below */ }
  }
  if (media instanceof HTMLVideoElement && media.readyState < 2) return false;
  const [sourceWidth, sourceHeight] = readyDimensions(media);
  if (!sourceWidth || !sourceHeight) return false;
  const scale = Math.min(1, maxSize / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(media, 0, 0, width, height);
  return true;
}
