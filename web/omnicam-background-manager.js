import { annotatedAssetUrl as i } from "./omnicam-core.js";
import { uploadManagedFile as l } from "./omnicam-media.js";
let s = null;
function w({ api: e }) {
  s = e;
}
async function p(e) {
  if (!s) throw new Error("ComfyUI API is unavailable");
  return l(s, { route: "/majoor/omnicam/upload_asset", field: "asset", file: e });
}
async function c(e) {
  const t = e.map((o) => String(o.relative || "").replace(/^omnicam\//, "")).filter(Boolean);
  if (!(!t.length || !s))
    try {
      await s.fetchApi("/majoor/omnicam/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: t })
      });
    } catch {
    }
}
function g(e) {
  return e.backgroundRequestId = (e.backgroundRequestId || 0) + 1, e.backgroundRequestId;
}
async function f(e, t) {
  if (!t) return;
  const o = g(e);
  let n = null;
  try {
    if (e.setStatus(`Uploading background: ${t.name}`), n = await p(t), o !== e.backgroundRequestId || e.disposed) {
      await c([n]);
      return;
    }
    const a = i(n.path);
    e.state.viewport_bg_image = n.path, e.state.viewport_bg_sequence = [];
    const r = new Image();
    r.src = a, await r.decode().catch(() => {
    }), e.viewportBgImage = r, e.serialize(), e.render(), e.setStatus(`Background image set: ${t.name}`);
  } catch (a) {
    if (n && await c([n]), o !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG image: ${a.message || a}`);
  }
}
async function b(e, t) {
  if (!t || !t.length) return;
  const o = g(e);
  t.sort((a, r) => a.name.localeCompare(r.name, void 0, { numeric: !0, sensitivity: "base" }));
  const n = [];
  try {
    e.setStatus(`Uploading background sequence: ${t.length} frames`);
    for (const r of t)
      if (n.push(await p(r)), o !== e.backgroundRequestId || e.disposed) {
        await c(n);
        return;
      }
    const a = n.map((r) => r.path);
    e.state.viewport_bg_sequence = a, e.state.viewport_bg_image = "", e.viewportBgImage = null, e.viewportBgSequenceImages = a.map((r) => {
      const d = new Image();
      return d.src = i(r), d.decode().catch(() => {
      }), d;
    }), e.serialize(), e.render(), e.setStatus(`Background sequence loaded: ${t.length} frames`);
  } catch (a) {
    if (await c(n), o !== e.backgroundRequestId || e.disposed) return;
    e.setStatus(`Failed to load BG sequence: ${a.message || a}`);
  }
}
function q(e) {
  g(e), e.state.viewport_bg_image = "", e.state.viewport_bg_sequence = [], e.viewportBgImage = null, e.viewportBgSequenceImages = [], e.serialize(), e.render(), e.setStatus("Background cleared");
}
export {
  q as clearViewportBgImage,
  w as configureBackgroundManager,
  f as loadViewportBgFile,
  b as loadViewportBgSequence
};
