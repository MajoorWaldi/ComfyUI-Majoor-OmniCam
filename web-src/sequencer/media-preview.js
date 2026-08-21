const MEDIA_WIDGET_NAMES = new Set(["image", "image_path", "upload", "file", "filename", "video", "video_path"]);

function annotatedValue(value) {
  const match = String(value || "").match(/^(.*?)(?:\s+\[(input|output|temp)\])?$/);
  return { path: match?.[1] || "", type: match?.[2] || "input" };
}

function managedViewUrl(api, value, subfolder = "") {
  const annotated = annotatedValue(value);
  const normalized = annotated.path.replaceAll("\\", "/");
  const slash = normalized.lastIndexOf("/");
  const filename = slash >= 0 ? normalized.slice(slash + 1) : normalized;
  const folder = slash >= 0 ? normalized.slice(0, slash) : subfolder;
  if (!filename) return "";
  const query = new URLSearchParams({ filename, subfolder: folder, type: annotated.type });
  return api?.apiURL ? api.apiURL(`/view?${query}`) : `/view?${query}`;
}

export function upstreamPreviewDescriptor(origin, api) {
  const direct = origin?.imgs?.[0];
  if (direct && (direct.complete || direct.readyState >= 2)) return { element: direct, key: direct.currentSrc || direct.src || "direct" };
  const widget = origin?.widgets?.find((item) => MEDIA_WIDGET_NAMES.has(String(item?.name || "").toLowerCase()));
  if (!widget?.value) return null;
  const value = String(widget.value);
  const subfolder = origin.widgets?.find((item) => String(item?.name || "").toLowerCase() === "subfolder")?.value || "";
  const url = managedViewUrl(api, value, subfolder);
  if (!url) return null;
  return { url, video: /\.(mp4|webm|mov|mkv)(?:\s|$)/i.test(value), key: url };
}

export function managedPreviewDescriptor(api, value, subfolder = "") {
  const url = managedViewUrl(api, value, subfolder);
  if (!url) return null;
  return { url, video: /\.(mp4|webm|mov|mkv)(?:\s|$)/i.test(String(value)), key: url };
}

export function createPreviewMedia(descriptor, onReady) {
  if (!descriptor) return null;
  if (descriptor.element) return descriptor.element;
  const media = descriptor.video ? document.createElement("video") : new Image();
  media.muted = true;
  media.preload = "metadata";
  media.addEventListener(descriptor.video ? "loadeddata" : "load", onReady, { once: true });
  media.src = descriptor.url;
  if (descriptor.video) media.load();
  return media;
}
