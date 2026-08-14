import { app as k } from "../../scripts/app.js";
import { cloneCamera as d, sampleCamera as b } from "./omnicam-core.js";
import { promptText as P, confirmAction as $ } from "./omnicam-ui.js";
import { t as m } from "./omnicam-i18n.js";
function L(e) {
  for (const a of ["playblast-camera"]) {
    const t = e.root.querySelector(`[data-role="${a}"]`);
    if (t) {
      t.innerHTML = "";
      for (const r of e.state.cameras) {
        const s = document.createElement("option");
        s.value = r.id, s.textContent = r.name, t.appendChild(s);
      }
      t.value = e.state.playblast_camera_id;
    }
  }
  S(e);
}
function E(e) {
  const a = e.state.cameras, t = a.filter((s) => s.solo), r = t.length ? t : a.filter((s) => !s.muted);
  return r.length ? r : a;
}
function S(e) {
  const a = e.root.querySelector('[data-role="camera-previews"]');
  if (!a) return;
  const t = e.state.preview_layout || "auto";
  a.dataset.layout !== (t === "auto" ? "" : t) && (a.dataset.layout = t === "auto" ? "" : t), e.root.querySelector('[data-role="camera-view-row"]').classList.toggle("maximized", !!e.state.maximized_camera_id);
  const s = E(e), l = s.map((c) => `${c.id}:${c.name}:${c.muted ? 1 : 0}:${c.solo ? 1 : 0}`).join("|");
  let o = !1;
  l !== e.cameraPreviewSignature && (o = !0, e.cameraPreviewSignature = l, a.innerHTML = "", e.cameraPreviewCanvases.clear(), e.cameraPreviewContexts.clear(), s.forEach((c, g) => {
    const n = document.createElement("div");
    n.className = "camera-preview-tile", n.dataset.cameraId = c.id, n.style.setProperty("--camera-color", `hsl(${g * 115 % 360} 75% 52%)`), n.title = m(`Click: set ${c.name} as primary · Double-click: edit · Right-click: preview actions`);
    const f = document.createElement("div");
    f.className = "camera-preview-head";
    const C = document.createElement("i");
    C.className = "pi pi-video";
    const _ = document.createElement("span");
    _.textContent = c.name;
    const v = document.createElement("span");
    v.dataset.cameraFrame = c.id, v.textContent = `F${e.frame}`;
    const p = document.createElement("i");
    p.className = "pi pi-circle-fill output-mark", p.title = m("Playblast camera");
    const i = document.createElement("canvas");
    i.dataset.cameraPreview = c.id;
    const y = document.createElement("span");
    y.className = "camera-view-badge", y.textContent = m("CAMERA PREVIEW"), f.append(C, _, v, p), n.append(i, f, y), a.appendChild(n), n.addEventListener("click", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = setTimeout(() => e.setPlayblastCamera(c.id), 220);
    }), n.addEventListener("dblclick", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = null, e.activateCamera(c.id);
    }), n.addEventListener("auxclick", (w) => {
      w.button === 1 && (w.preventDefault(), T(e, c.id));
    }), e.cameraPreviewCanvases.set(c.id, i), e.cameraPreviewContexts.set(c.id, i.getContext("2d", { alpha: !1 }));
  }));
  for (const c of a.querySelectorAll(".camera-preview-tile"))
    c.classList.toggle("playblast", c.dataset.cameraId === e.state.playblast_camera_id), c.classList.toggle("maximized", c.dataset.cameraId === e.state.maximized_camera_id);
  for (const c of a.querySelectorAll(".output-mark")) c.hidden = c.closest(".camera-preview-tile")?.dataset.cameraId !== e.state.playblast_camera_id;
  o && requestAnimationFrame(() => {
    e.root.isConnected && (e.resizeCanvas(), e.renderCameraView());
  });
}
function D(e) {
  e.checkpoint("Add camera"), e.syncActiveCameraTrack();
  const a = `camera_${Date.now().toString(36)}`, t = `Camera ${e.state.cameras.length + 1}`, r = d(e.camera);
  e.state.cameras.push({ id: a, name: t, camera: r, keyframes: [{ frame: 0, camera: d(r), interpolation: e.root.querySelector('[data-role="interp"]').value }] }), e.activateCamera(a), e.setStatus(m(`${t} added`));
}
async function F(e, a) {
  const t = e.state.cameras.find((s) => s.id === a);
  if (!t) return;
  const r = (await P(k, m("Rename camera"), m("Camera name"), t.name))?.trim();
  !r || r === t.name || (e.checkpoint("Rename camera"), t.name = r.slice(0, 80), e.cameraPreviewSignature = "", e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(m(`Camera renamed: ${t.name}`)));
}
function O(e, a) {
  const t = e.state.cameras.find((s) => s.id === a);
  if (!t) return;
  e.checkpoint("Duplicate camera"), e.syncActiveCameraTrack();
  const r = JSON.parse(JSON.stringify(t));
  r.id = `camera_${Date.now().toString(36)}`, r.name = `${t.name} Copy`, e.state.cameras.push(r), e.cameraPreviewSignature = "", e.activateCamera(r.id), e.setStatus(m(`${r.name} added`));
}
async function K(e, a) {
  if (e.state.cameras.length <= 1) return e.setStatus(m("At least one camera is required"));
  const t = e.state.cameras.find((s) => s.id === a);
  if (!t || !await $(k, m("Delete camera"), m(`Delete ${t.name} and its ${t.keyframes.length} keyframe(s)?`))) return;
  e.checkpoint("Delete camera");
  const r = a === e.state.active_camera_id;
  if (e.state.cameras = e.state.cameras.filter((s) => s.id !== a), a === e.state.playblast_camera_id && (e.state.playblast_camera_id = e.state.cameras[0].id), e.cameraPreviewSignature = "", r) {
    const s = e.state.cameras[0];
    e.state.active_camera_id = s.id, e.state.keyframes = s.keyframes, e.state.camera = d(s.camera), e.camera = b(s, e.frame), e.selectedEntity = "camera", e.selectedKeyFrame = s.keyframes.find((l) => l.frame === e.frame)?.frame ?? null;
  }
  e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(m(`${t.name} deleted`));
}
function N(e, a) {
  const t = e.state.cameras.find((r) => r.id === a);
  t && (e.syncActiveCameraTrack(), e.state.active_camera_id = t.id, e.state.keyframes = t.keyframes, e.state.camera = d(t.camera), e.camera = b(t, e.frame), e.selectedEntity = "camera", e.selectedKeyFrame = t.keyframes.find((r) => r.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(m(`Editing ${t.name}`)));
}
function I(e, a) {
  const t = e.state.cameras.find((r) => r.id === a);
  t && (e.state.playblast_camera_id = t.id, e.refreshCameraSelectors(), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.renderCameraView(), e.setStatus(m(`Playblast: ${t.name}`)));
}
function M(e) {
  e.state.camera_view_visible = !e.state.camera_view_visible, e.root.querySelector('[data-role="camera-view-row"]').hidden = !e.state.camera_view_visible, e.root.querySelector('.view-nav [data-act="toggle-camera-view"]')?.classList.toggle("active", e.state.camera_view_visible), e.serialize(), e.state.camera_view_visible && requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(m(`Camera previews ${e.state.camera_view_visible ? "shown" : "hidden"}`));
}
function T(e, a) {
  e.state.maximized_camera_id = e.state.maximized_camera_id === a ? null : a, e.serialize(), S(e), requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(e.state.maximized_camera_id ? m("Preview maximized") : m("Preview restored"));
}
const z = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "9:16": 9 / 16, "2.39:1": 2.39 };
function V(e, a, t, r) {
  if (e.state.guides !== !1) {
    a.save(), a.strokeStyle = "#ffffff55", a.lineWidth = Math.max(1, t / 640), a.beginPath();
    for (const s of [t / 3, 2 * t / 3])
      a.moveTo(s, 0), a.lineTo(s, r);
    for (const s of [r / 3, 2 * r / 3])
      a.moveTo(0, s), a.lineTo(t, s);
    a.stroke(), a.restore();
  }
  if (e.state.safe_areas) {
    a.save(), a.strokeStyle = "#f2d06b99", a.lineWidth = 1;
    for (const s of [0.05, 0.1])
      a.strokeRect(t * s, r * s, t * (1 - 2 * s), r * (1 - 2 * s));
    a.restore();
  }
  if (e.state.resolution_gate || e.state.aspect_ratio !== "auto") {
    const s = z[e.state.aspect_ratio] || e.state.width / Math.max(1, e.state.height), l = t / Math.max(1, r);
    if (a.save(), a.fillStyle = "#00000088", l > s) {
      const o = r * s, c = (t - o) / 2;
      a.fillRect(0, 0, c, r), a.fillRect(t - c, 0, c, r), e.state.resolution_gate && (a.strokeStyle = "#ffffff88", a.strokeRect(c, 0, o, r));
    } else if (l < s) {
      const o = t / s, c = (r - o) / 2;
      a.fillRect(0, 0, t, c), a.fillRect(0, r - c, t, c), e.state.resolution_gate && (a.strokeStyle = "#ffffff88", a.strokeRect(0, c, t, o));
    }
    a.restore();
  }
}
export {
  N as activateCamera,
  D as addCamera,
  K as deleteCamera,
  V as drawPreviewOverlays,
  O as duplicateCamera,
  T as maximizeCameraPreview,
  S as refreshCameraPreviews,
  L as refreshCameraSelectors,
  F as renameCamera,
  I as setPlayblastCamera,
  M as toggleCameraView,
  E as visibleCameraTracks
};
