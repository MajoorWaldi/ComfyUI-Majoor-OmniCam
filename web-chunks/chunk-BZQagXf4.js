import { F as g, A as C, p as u, Q as S } from "./vendor-three-AeKB2-k3.js";
import { api as l } from "../../scripts/api.js";
import { m as b, $ as _ } from "./chunk-DL-eaNf3.js";
import { a as c } from "./chunk-Dhr3gGCU.js";
import { f as k } from "./chunk-CQ1uTZsD.js";
function v(e) {
  const t = b(e);
  return {
    schema_version: 1,
    fps: e.state.fps,
    duration_frames: e.state.duration_frames,
    width: e.state.width,
    height: e.state.height,
    render_mode: e.state.render_mode,
    keyframes: t?.keyframes || [],
    objects: e.state.objects || [],
    metadata: { camera_name: t?.name || "Camera" }
  };
}
async function O(e, t) {
  const a = e.root.querySelector('[data-role="export-format"]');
  if (!(!a || a.dataset.ready === "1"))
    try {
      const o = await l.fetchApi("/majoor/omnicam/exchange_formats");
      if (!o.ok) return;
      const r = await o.json();
      a.replaceChildren();
      for (const [n, m] of Object.entries(r.export || {})) {
        const s = document.createElement("option");
        s.value = n, s.textContent = m.label || n, s.title = m.reads ? `${c("Read by")}: ${m.reads}` : "", a.appendChild(s);
      }
      a.dataset.ready = "1", e.exchangeFormats = r.export || {}, w(e), a.addEventListener("change", () => w(e), t ? { signal: t } : void 0);
    } catch {
    }
}
function w(e) {
  const t = e.root.querySelector('[data-role="export-note"]'), a = e.root.querySelector('[data-role="export-format"]');
  if (!t || !a) return;
  const o = (e.exchangeFormats || {})[a.value];
  t.textContent = o?.reads ? `${c("Read by")}: ${o.reads}` : "";
}
async function $(e) {
  const a = e.root.querySelector('[data-role="export-format"]')?.value || "glb", o = b(e);
  e.setStatus(c("Exporting camera…"));
  try {
    const r = await l.fetchApi("/majoor/omnicam/export_camera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: a, name: o?.name || "omnicam_camera", track: v(e) })
    });
    if (!r.ok) throw new Error(await r.text());
    const n = await r.json();
    e.setStatus(c("Camera exported to {path}").replace("{path}", n.relative));
  } catch (r) {
    console.error("[OmniCam] camera export failed", r), e.setStatus(c("Camera export failed: {error}").replace("{error}", String(r?.message || r).slice(0, 120)));
  }
}
function z(e) {
  e.root.querySelector('[data-role="camera-file"]')?.click();
}
async function B(e, t) {
  if (!t) return;
  const a = `.${(t.name.split(".").pop() || "").toLowerCase()}`, o = a === ".fbx" ? k(t, "fbx") : null;
  if (o) {
    e.setStatus(o);
    return;
  }
  e.setStatus(c("Reading camera from {name}…").replace("{name}", t.name));
  try {
    const r = a === ".fbx" ? await j(e, t) : await F(t);
    _(e, r, { label: t.name, source: "camera_import", adoptFps: !1 });
  } catch (r) {
    console.error("[OmniCam] camera import failed", r), e.setStatus(c("Camera import failed: {error}").replace("{error}", String(r?.message || r).slice(0, 120)));
  }
}
async function F(e) {
  const t = new FormData();
  t.append("file", e, e.name);
  const a = await l.fetchApi("/majoor/omnicam/import_camera", { method: "POST", body: t });
  if (!a.ok) throw new Error(await a.text());
  return (await a.json()).track;
}
async function j(e, t) {
  const a = await t.arrayBuffer(), o = new g().parse(a, ""), r = [];
  if (o.traverse((p) => {
    p.isCamera && r.push(p);
  }), !r.length) throw new Error(c("this FBX contains no camera"));
  const n = r[0], m = Math.max(1, Number(e.state.fps) || 24), s = o.animations?.[0], h = s ? Math.max(1, Math.round(s.duration * m) + 1) : 1, x = [], d = s ? new C(o) : null;
  d && d.clipAction(s).play();
  const i = new u(), y = new S(), f = new u();
  for (let p = 0; p < h; p++)
    d && (d.setTime(p / m), o.updateMatrixWorld(!0)), n.getWorldPosition(i), n.getWorldQuaternion(y), f.set(0, 0, -1).applyQuaternion(y), x.push({
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
  $ as exportCamera,
  B as importCameraFile,
  O as loadExchangeFormats,
  z as pickCameraFile
};
