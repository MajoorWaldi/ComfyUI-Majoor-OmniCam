import { cloneCamera as d, sampleCamera as w } from "./omnicam-core.js";
import { confirmAction as P, promptText as T } from "./omnicam-ui.js";
import { t as c } from "./omnicam-i18n.js";
function b(e) {
  const a = `camera_${Date.now().toString(36)}`;
  let t = a, r = 2;
  for (; e.cameras.some((s) => s.id === t); ) t = `${a}_${r++}`;
  return t;
}
function L(e) {
  for (const a of e.root.querySelectorAll('[data-role="playblast-camera"]')) {
    a.innerHTML = "";
    for (const t of e.state.cameras) {
      const r = document.createElement("option");
      r.value = t.id, r.textContent = t.name, a.appendChild(r);
    }
    a.value = e.state.playblast_camera_id;
  }
  for (const a of e.root.querySelectorAll('[data-role="active-camera-select"]')) {
    a.innerHTML = "";
    for (const t of e.state.cameras) {
      const r = document.createElement("option");
      r.value = t.id, r.textContent = t.name, a.appendChild(r);
    }
    a.value = e.state.active_camera_id;
  }
  k(e);
}
function A(e) {
  const a = e.state.cameras, t = a.filter((s) => s.solo), r = t.length ? t : a.filter((s) => !s.muted);
  return r.length ? r : a;
}
function k(e) {
  const a = e.root.querySelector('[data-role="camera-previews"]');
  if (!a) return;
  const t = e.state.preview_layout || "auto";
  a.dataset.layout !== (t === "auto" ? "" : t) && (a.dataset.layout = t === "auto" ? "" : t), e.root.querySelector('[data-role="camera-view-row"]').classList.toggle("maximized", !!e.state.maximized_camera_id);
  const s = A(e), l = s.map((m) => `${m.id}:${m.name}:${m.muted ? 1 : 0}:${m.solo ? 1 : 0}`).join("|");
  let o = !1;
  l !== e.cameraPreviewSignature && (o = !0, e.cameraPreviewSignature = l, a.innerHTML = "", e.cameraPreviewCanvases.clear(), e.cameraPreviewContexts.clear(), s.forEach((m, g) => {
    const n = document.createElement("div");
    n.className = "camera-preview-tile", n.dataset.cameraId = m.id, n.style.setProperty("--camera-color", `hsl(${g * 115 % 360} 75% 52%)`), n.title = c(`Click: set ${m.name} as primary · Double-click: edit · Right-click: preview actions`);
    const f = document.createElement("div");
    f.className = "camera-preview-head";
    const C = document.createElement("i");
    C.className = "pi pi-video";
    const _ = document.createElement("span");
    _.textContent = m.name;
    const v = document.createElement("span");
    v.dataset.cameraFrame = m.id, v.textContent = `F${e.frame}`;
    const p = document.createElement("i");
    p.className = "pi pi-circle-fill output-mark", p.title = c("Playblast camera");
    const i = document.createElement("canvas");
    i.dataset.cameraPreview = m.id;
    const y = document.createElement("span");
    y.className = "camera-view-badge", y.textContent = c("CAMERA PREVIEW"), f.append(C, _, v, p), n.append(i, f, y), a.appendChild(n), n.addEventListener("click", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = setTimeout(() => e.setPlayblastCamera(m.id), 220);
    }), n.addEventListener("dblclick", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = null, e.activateCamera(m.id);
    }), n.addEventListener("auxclick", (S) => {
      S.button === 1 && (S.preventDefault(), E(e, m.id));
    }), e.cameraPreviewCanvases.set(m.id, i), e.cameraPreviewContexts.set(m.id, i.getContext("2d", { alpha: !1 }));
  }));
  for (const m of a.querySelectorAll(".camera-preview-tile"))
    m.classList.toggle("playblast", m.dataset.cameraId === e.state.playblast_camera_id), m.classList.toggle("maximized", m.dataset.cameraId === e.state.maximized_camera_id);
  for (const m of a.querySelectorAll(".output-mark")) m.hidden = m.closest(".camera-preview-tile")?.dataset.cameraId !== e.state.playblast_camera_id;
  o && requestAnimationFrame(() => {
    e.root.isConnected && (e.resizeCanvas(), e.renderCameraView());
  });
}
function F(e) {
  e.checkpoint("Add camera"), e.syncActiveCameraTrack();
  const a = b(e.state), t = `Camera ${e.state.cameras.length + 1}`, r = d(e.camera), s = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease";
  e.state.cameras.push({ id: a, name: t, camera: r, keyframes: [{ frame: 0, camera: d(r), interpolation: s }] }), e.activateCamera(a), e.setStatus(c(`${t} added`));
}
async function R(e, a) {
  const t = e.state.cameras.find((s) => s.id === a);
  if (!t) return;
  const r = (await T(c("Rename camera"), c("Camera name"), t.name))?.trim();
  !r || r === t.name || (e.checkpoint("Rename camera"), t.name = r.slice(0, 80), e.cameraPreviewSignature = "", e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(c(`Camera renamed: ${t.name}`)));
}
function N(e, a) {
  const t = e.state.cameras.find((s) => s.id === a);
  if (!t) return;
  e.checkpoint("Duplicate camera"), e.syncActiveCameraTrack();
  const r = JSON.parse(JSON.stringify(t));
  r.id = b(e.state), r.name = `${t.name} Copy`, e.state.cameras.push(r), e.cameraPreviewSignature = "", e.activateCamera(r.id), e.setStatus(c(`${r.name} added`));
}
async function I(e, a) {
  if (e.state.cameras.length <= 1) return e.setStatus(c("At least one camera is required"));
  const t = e.state.cameras.find((s) => s.id === a);
  if (!t || !await P(c("Delete camera"), c(`Delete ${t.name} and its ${t.keyframes.length} keyframe(s)?`))) return;
  e.checkpoint("Delete camera");
  const r = a === e.state.active_camera_id;
  if (e.state.cameras = e.state.cameras.filter((s) => s.id !== a), a === e.state.playblast_camera_id && (e.state.playblast_camera_id = e.state.cameras[0].id), e.cameraPreviewSignature = "", r) {
    const s = e.state.cameras[0];
    e.state.active_camera_id = s.id, e.state.keyframes = s.keyframes, e.state.camera = d(s.camera), e.camera = w(s, e.frame), e.selectedEntity = "camera", e.selectedKeyFrame = s.keyframes.find((l) => l.frame === e.frame)?.frame ?? null;
  }
  e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(c(`${t.name} deleted`));
}
function K(e, a) {
  const t = e.state.cameras.find((r) => r.id === a);
  t && (e.syncActiveCameraTrack(), e.state.active_camera_id = t.id, e.state.keyframes = t.keyframes, e.state.camera = d(t.camera), e.camera = w(t, e.frame), e.selectedEntity = "camera", e.selectedKeyFrame = t.keyframes.find((r) => r.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(c(`Editing ${t.name}`)));
}
function O(e, a) {
  const t = e.state.cameras.find((r) => r.id === a);
  t && (e.state.playblast_camera_id = t.id, e.refreshCameraSelectors(), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.renderCameraView(), e.setStatus(c(`Playblast: ${t.name}`)));
}
function x(e) {
  e.state.camera_view_visible = !e.state.camera_view_visible;
  for (const a of e.root.querySelectorAll('[data-role="camera-view-row"]')) a.hidden = !e.state.camera_view_visible;
  for (const a of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    a.classList.toggle("active", e.state.camera_view_visible), a.setAttribute("aria-pressed", String(e.state.camera_view_visible));
  e.serialize(), e.state.camera_view_visible && requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(c(`Camera previews ${e.state.camera_view_visible ? "shown" : "hidden"}`));
}
function E(e, a) {
  e.state.maximized_camera_id = e.state.maximized_camera_id === a ? null : a, e.serialize(), k(e), requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(e.state.maximized_camera_id ? c("Preview maximized") : c("Preview restored"));
}
const h = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "9:16": 9 / 16, "2.39:1": 2.39 };
function D(e, a, t, r) {
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
    const s = h[e.state.aspect_ratio] || e.state.width / Math.max(1, e.state.height), l = t / Math.max(1, r);
    if (a.save(), a.fillStyle = "#00000088", l > s) {
      const o = r * s, m = (t - o) / 2;
      a.fillRect(0, 0, m, r), a.fillRect(t - m, 0, m, r), e.state.resolution_gate && (a.strokeStyle = "#ffffff88", a.strokeRect(m, 0, o, r));
    } else if (l < s) {
      const o = t / s, m = (r - o) / 2;
      a.fillRect(0, 0, t, m), a.fillRect(0, r - m, t, m), e.state.resolution_gate && (a.strokeStyle = "#ffffff88", a.strokeRect(0, m, t, o));
    }
    a.restore();
  }
}
const V = [
  { mm: 14, name: "14mm Ultra-Wide" },
  { mm: 18, name: "18mm Super-Wide" },
  { mm: 24, name: "24mm Wide" },
  { mm: 35, name: "35mm Normal-Wide" },
  { mm: 50, name: "50mm Standard" },
  { mm: 85, name: "85mm Portrait" },
  { mm: 105, name: "105mm Medium Tele" },
  { mm: 135, name: "135mm Telephoto" }
];
function W(e, a = 36) {
  const r = Math.max(1, Math.min(179, Number(e) || 35)) * Math.PI / 360;
  return a / 2 / Math.max(1e-9, Math.tan(r));
}
function $(e, a = 36) {
  const t = Math.max(1, Number(e) || 50);
  return 2 * Math.atan(a / 2 / t) * 180 / Math.PI;
}
function j(e, a) {
  const t = $(a);
  e.activeCameraTrack()?.keyframes?.length && e.activeKeyframe() ? (e.activeKeyframe().camera.fov = t, e.scheduleSerialize(), e.render(), e.refreshKeyEditor()) : (e.camera.fov = t, e.render());
  for (const s of e.root.querySelectorAll('[data-role="fov"], [data-role="camera-fov"]'))
    s.value = String(t.toFixed(1));
  e.setStatus(`Lens: ${a}mm (FOV ${t.toFixed(1)}°)`);
}
export {
  V as CINEMA_LENSES,
  K as activateCamera,
  F as addCamera,
  j as applyCinemaLens,
  I as deleteCamera,
  D as drawPreviewOverlays,
  N as duplicateCamera,
  $ as focalLengthToFov,
  W as fovToFocalLength,
  E as maximizeCameraPreview,
  k as refreshCameraPreviews,
  L as refreshCameraSelectors,
  R as renameCamera,
  O as setPlayblastCamera,
  x as toggleCameraView,
  A as visibleCameraTracks
};
