// Safe translation between ComfyUI's annotated filenames and /view URLs.

export function parseAnnotatedAsset(value) {
  const text = String(value || "").trim().replaceAll("\\", "/");
  if (!text || text.length > 1024 || text.includes("\0") || text.includes("://")) return null;
  const match = text.match(/^(.*?)(?:\s+\[(input|output|temp)\])?$/);
  if (!match) return null;
  const path = String(match[1] || "").replace(/^\/+/, "");
  if (!path || /^[A-Za-z]:/.test(path) || path.split("/").some((part) => part === "..")) return null;
  const slash = path.lastIndexOf("/");
  const filename = slash >= 0 ? path.slice(slash + 1) : path;
  const subfolder = slash >= 0 ? path.slice(0, slash) : "";
  if (!filename || filename === ".") return null;
  return { filename, subfolder, type: match[2] || "input" };
}

export function annotatedAssetUrl(api, value) {
  const asset = parseAnnotatedAsset(value);
  if (!asset) return "";
  const path = `/view?filename=${encodeURIComponent(asset.filename)}`
    + `&subfolder=${encodeURIComponent(asset.subfolder)}&type=${encodeURIComponent(asset.type)}`;
  return api?.apiURL ? api.apiURL(path) : path;
}

