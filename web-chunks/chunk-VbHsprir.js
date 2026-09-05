import { aa as b, e as C, a1 as u, Q as _ } from "./chunk-BNTXm8ZY.js";
import { api as l } from "../../scripts/api.js";
import { o as k } from "./chunk-Cqp6tGff.js";
import { a as c } from "./chunk-COnft398.js";
import { e as g } from "./chunk-D1Oq610x.js";
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
async function N(e, a) {
  const t = e.root.querySelector('[data-role="export-format"]');
  if (!(!t || t.dataset.ready === "1"))
    try {
      const r = await l.fetchApi("/majoor/omnicam/exchange_formats");
      if (!r.ok) return;
      const o = await r.json();
      t.replaceChildren();
      for (const [n, m] of Object.entries(o.export || {})) {
        const s = document.createElement("option");
        s.value = n, s.textContent = m.label || n, s.title = m.reads ? `${c("Read by")}: ${m.reads}` : "", t.appendChild(s);
      }
      t.dataset.ready = "1", e.exchangeFormats = o.export || {}, w(e), t.addEventListener("change", () => w(e), a ? { signal: a } : void 0);
    } catch {
    }
}
function w(e) {
  const a = e.root.querySelector('[data-role="export-note"]'), t = e.root.querySelector('[data-role="export-format"]');
  if (!a || !t) return;
  const r = (e.exchangeFormats || {})[t.value];
  a.textContent = r?.reads ? `${c("Read by")}: ${r.reads}` : "";
}
async function O(e) {
  const t = e.root.querySelector('[data-role="export-format"]')?.value || "glb", r = g(e);
  e.setStatus(c("Exporting camera…"));
  try {
    const o = await l.fetchApi("/majoor/omnicam/export_camera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: t, name: r?.name || "omnicam_camera", track: S(e) })
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
  const t = `.${(a.name.split(".").pop() || "").toLowerCase()}`;
  e.setStatus(c("Reading camera from {name}…").replace("{name}", a.name));
  try {
    const r = t === ".fbx" ? await j(e, a) : await v(a);
    k(e, r, { label: a.name, source: "camera_import", adoptFps: !1 });
  } catch (r) {
    console.error("[OmniCam] camera import failed", r), e.setStatus(c("Camera import failed: {error}").replace("{error}", String(r?.message || r).slice(0, 120)));
  }
}
async function v(e) {
  const a = new FormData();
  a.append("file", e, e.name);
  const t = await l.fetchApi("/majoor/omnicam/import_camera", { method: "POST", body: a });
  if (!t.ok) throw new Error(await t.text());
  return (await t.json()).track;
}
async function j(e, a) {
  const t = await a.arrayBuffer(), r = new b().parse(t, ""), o = [];
  if (r.traverse((p) => {
    p.isCamera && o.push(p);
  }), !o.length) throw new Error(c("this FBX contains no camera"));
  const n = o[0], m = Math.max(1, Number(e.state.fps) || 24), s = r.animations?.[0], h = s ? Math.max(1, Math.round(s.duration * m) + 1) : 1, x = [], d = s ? new C(r) : null;
  d && d.clipAction(s).play();
  const i = new u(), y = new _(), f = new u();
  for (let p = 0; p < h; p++)
    d && (d.setTime(p / m), r.updateMatrixWorld(!0)), n.getWorldPosition(i), n.getWorldQuaternion(y), f.set(0, 0, -1).applyQuaternion(y), x.push({
      frame: p,
      interpolation: "linear",
      camera: {
        position: [i.x, i.y, i.z],
        target: [i.x + f.x, i.y + f.y, i.z + f.z],
        fov: Number(n.fov) || 35,
        roll: 0,
        camera_type: "perspective",
        zoom: 1,
        near: Number(n.near) || 0.01,
        far: Number(n.far) || 1e4
      }
    });
  return d && d.stopAllAction(), {
    schema_version: 1,
    fps: m,
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
