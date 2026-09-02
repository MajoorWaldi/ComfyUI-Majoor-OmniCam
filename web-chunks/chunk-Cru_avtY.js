import { aa as b, e as C, a1 as u, Q as _ } from "./chunk-BNTXm8ZY.js";
import { api as l } from "../../scripts/api.js";
import { o as k } from "./chunk-Dm2POnXp.js";
import { a as c } from "./chunk-BQnPMAhF.js";
import { e as g } from "./chunk-C7_nujGC.js";
function S(e) {
  const a = g(e);
  return {
    schema_version: 1,
    fps: e.state.fps,
    duration_frames: e.state.duration_frames,
    width: e.state.width,
    height: e.state.height,
    render_mode: e.state.render_mode,
    keyframes: a?.keyframes || [],
    objects: e.state.objects || [],
    metadata: { camera_name: a?.name || "Camera" }
  };
}
async function N(e) {
  const a = e.root.querySelector('[data-role="export-format"]');
  if (!(!a || a.dataset.ready === "1"))
    try {
      const r = await l.fetchApi("/majoor/omnicam/exchange_formats");
      if (!r.ok) return;
      const t = await r.json();
      a.replaceChildren();
      for (const [o, n] of Object.entries(t.export || {})) {
        const s = document.createElement("option");
        s.value = o, s.textContent = n.label || o, s.title = n.reads ? `${c("Read by")}: ${n.reads}` : "", a.appendChild(s);
      }
      a.dataset.ready = "1", e.exchangeFormats = t.export || {}, w(e), a.addEventListener("change", () => w(e));
    } catch {
    }
}
function w(e) {
  const a = e.root.querySelector('[data-role="export-note"]'), r = e.root.querySelector('[data-role="export-format"]');
  if (!a || !r) return;
  const t = (e.exchangeFormats || {})[r.value];
  a.textContent = t?.reads ? `${c("Read by")}: ${t.reads}` : "";
}
async function O(e) {
  const r = e.root.querySelector('[data-role="export-format"]')?.value || "glb", t = g(e);
  e.setStatus(c("Exporting camera…"));
  try {
    const o = await l.fetchApi("/majoor/omnicam/export_camera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: r, name: t?.name || "omnicam_camera", track: S(e) })
    });
    if (!o.ok) throw new Error(await o.text());
    const n = await o.json();
    e.setStatus(c("Camera exported to {path}").replace("{path}", n.relative));
  } catch (o) {
    console.error("[OmniCam] camera export failed", o), e.setStatus(c("Camera export failed: {error}").replace("{error}", String(o?.message || o).slice(0, 120)));
  }
}
function M(e) {
  e.root.querySelector('[data-role="camera-file"]')?.click();
}
async function $(e, a) {
  if (!a) return;
  const r = `.${(a.name.split(".").pop() || "").toLowerCase()}`;
  e.setStatus(c("Reading camera from {name}…").replace("{name}", a.name));
  try {
    const t = r === ".fbx" ? await j(e, a) : await v(a);
    k(e, t, { label: a.name, source: "camera_import", adoptFps: !1 });
  } catch (t) {
    console.error("[OmniCam] camera import failed", t), e.setStatus(c("Camera import failed: {error}").replace("{error}", String(t?.message || t).slice(0, 120)));
  }
}
async function v(e) {
  const a = new FormData();
  a.append("file", e, e.name);
  const r = await l.fetchApi("/majoor/omnicam/import_camera", { method: "POST", body: a });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()).track;
}
async function j(e, a) {
  const r = await a.arrayBuffer(), t = new b().parse(r, ""), o = [];
  if (t.traverse((i) => {
    i.isCamera && o.push(i);
  }), !o.length) throw new Error(c("this FBX contains no camera"));
  const n = o[0], s = Math.max(1, Number(e.state.fps) || 24), d = t.animations?.[0], h = d ? Math.max(1, Math.round(d.duration * s) + 1) : 1, x = [], p = d ? new C(t) : null;
  p && p.clipAction(d).play();
  const m = new u(), y = new _(), f = new u();
  for (let i = 0; i < h; i++)
    p && (p.setTime(i / s), t.updateMatrixWorld(!0)), n.getWorldPosition(m), n.getWorldQuaternion(y), f.set(0, 0, -1).applyQuaternion(y), x.push({
      frame: i,
      interpolation: "linear",
      camera: {
        position: [m.x, m.y, m.z],
        target: [m.x + f.x, m.y + f.y, m.z + f.z],
        fov: Number(n.fov) || 35,
        roll: 0,
        camera_type: "perspective",
        zoom: 1,
        near: Number(n.near) || 0.01,
        far: Number(n.far) || 1e4
      }
    });
  return p && p.stopAllAction(), {
    schema_version: 1,
    fps: s,
    duration_frames: h,
    width: e.state.width,
    height: e.state.height,
    render_mode: e.state.render_mode,
    keyframes: x,
    objects: [],
    metadata: { imported_from: "fbx" }
  };
}
export {
  O as exportCamera,
  $ as importCameraFile,
  N as loadExchangeFormats,
  M as pickCameraFile
};
