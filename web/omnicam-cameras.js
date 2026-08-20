import { cloneCamera as y, sampleCamera as w } from "./omnicam-core.js";
import { confirmAction as A, promptText as P } from "./omnicam-ui.js";
import { t as c } from "./omnicam-i18n.js";
const i = [
  "#4aa3ef",
  // Camera 1 - Blue/Cyan
  "#f2a93b",
  // Camera 2 - Amber/Gold
  "#48c774",
  // Camera 3 - Emerald/Green
  "#b565d8",
  // Camera 4 - Purple
  "#ec4899",
  // Camera 5 - Pink
  "#06b6d4",
  // Camera 6 - Cyan
  "#f97316",
  // Camera 7 - Orange
  "#8b5cf6"
  // Camera 8 - Violet
];
function g(e) {
  const a = `camera_${Date.now().toString(36)}`;
  let t = a, r = 2;
  for (; e.cameras.some((s) => s.id === t); ) t = `${a}_${r++}`;
  return t;
}
function F(e) {
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
  E(e);
}
function T(e) {
  const a = e.state.cameras, t = a.filter((s) => s.solo), r = t.length ? t : a.filter((s) => !s.muted);
  return r.length ? r : a;
}
function E(e) {
  const a = e.root.querySelector('[data-role="camera-previews"]');
  if (!a) return;
  const t = e.state.preview_layout || "auto";
  a.dataset.layout !== (t === "auto" ? "" : t) && (a.dataset.layout = t === "auto" ? "" : t);
  const r = e.root.querySelector('[data-role="camera-view-row"]');
  r && r.classList.toggle("maximized", !!e.state.maximized_camera_id);
  const s = T(e), m = s.map((o) => `${o.id}:${o.name}:${o.muted ? 1 : 0}:${o.solo ? 1 : 0}:${o.color || ""}`).join("|");
  let n = !1;
  m !== e.cameraPreviewSignature && (n = !0, e.cameraPreviewSignature = m, a.innerHTML = "", e.cameraPreviewCanvases.clear(), e.cameraPreviewContexts.clear(), s.forEach((o, f) => {
    const l = document.createElement("div");
    l.className = "camera-preview-tile", l.dataset.cameraId = o.id;
    const _ = o.color || i[f % i.length];
    l.style.setProperty("--camera-color", _), l.title = c(`Click: set ${o.name} as primary · Double-click: edit · Right-click: preview actions`);
    const d = document.createElement("div");
    d.className = "camera-preview-head";
    const v = document.createElement("i");
    v.className = "pi pi-video";
    const p = document.createElement("span");
    p.textContent = o.name;
    const b = document.createElement("span");
    b.dataset.cameraFrame = o.id, b.textContent = `F${e.frame}`;
    const S = document.createElement("i");
    S.className = "pi pi-circle-fill output-mark", S.title = c("Playblast camera");
    const C = document.createElement("canvas");
    C.dataset.cameraPreview = o.id;
    const h = document.createElement("span");
    h.className = "camera-view-badge", h.textContent = c("CAMERA PREVIEW"), d.append(v, p, b, S), l.append(C, d, h), a.appendChild(l), l.addEventListener("click", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = setTimeout(() => e.setPlayblastCamera(o.id), 220);
    }), l.addEventListener("dblclick", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = null, e.activateCamera(o.id);
    }), l.addEventListener("auxclick", (k) => {
      k.button === 1 && (k.preventDefault(), M(e, o.id));
    }), e.cameraPreviewCanvases.set(o.id, C), e.cameraPreviewContexts.set(o.id, C.getContext("2d", { alpha: !1 }));
  }));
  for (const o of a.querySelectorAll(".camera-preview-tile"))
    o.classList.toggle("playblast", o.dataset.cameraId === e.state.playblast_camera_id), o.classList.toggle("active", o.dataset.cameraId === e.state.active_camera_id), o.classList.toggle("maximized", o.dataset.cameraId === e.state.maximized_camera_id);
  for (const o of a.querySelectorAll(".output-mark")) o.hidden = o.closest(".camera-preview-tile")?.dataset.cameraId !== e.state.playblast_camera_id;
  n && requestAnimationFrame(() => {
    e.root.isConnected && (e.resizeCanvas(), e.renderCameraView());
  });
}
function R(e) {
  e.checkpoint("Add camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const a = g(e.state), t = e.state.cameras.length, r = `Camera ${t + 1}`, s = y(e.camera), m = s.target || [0, 1.5, 0], n = [s.position[0] - m[0], s.position[1] - m[1], s.position[2] - m[2]], o = (t * 45 + 30) * Math.PI / 180, f = Math.cos(o), l = Math.sin(o), _ = n[0] * f - n[2] * l, d = n[0] * l + n[2] * f;
  s.position = [
    Math.round((m[0] + _) * 100) / 100,
    Math.round(s.position[1] * 100) / 100,
    Math.round((m[2] + d) * 100) / 100
  ];
  const v = i[t % i.length], p = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease";
  e.state.cameras.push({
    id: a,
    name: r,
    color: v,
    camera: s,
    keyframes: [{ frame: 0, camera: y(s), interpolation: p }]
  }), e.cameraPreviewSignature = "", e.activateCamera(a), e.setStatus(c(`${r} added`));
}
async function N(e, a) {
  const t = e.state.cameras.find((s) => s.id === a);
  if (!t) return;
  const r = (await P(c("Rename camera"), c("Camera name"), t.name))?.trim();
  !r || r === t.name || (e.checkpoint("Rename camera"), t.name = r.slice(0, 80), e.cameraPreviewSignature = "", e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(c(`Camera renamed: ${t.name}`)));
}
function O(e, a) {
  const t = e.state.cameras.find((m) => m.id === a);
  if (!t) return;
  e.checkpoint("Duplicate camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const r = JSON.parse(JSON.stringify(t));
  r.id = g(e.state), r.name = `${t.name} Copy`;
  const s = e.state.cameras.length;
  if (r.color = i[s % i.length], r.camera?.position && (r.camera.position = [
    Math.round((r.camera.position[0] + 0.8) * 100) / 100,
    r.camera.position[1],
    Math.round((r.camera.position[2] + 0.8) * 100) / 100
  ]), r.keyframes)
    for (const m of r.keyframes)
      m.camera?.position && (m.camera.position = [
        Math.round((m.camera.position[0] + 0.8) * 100) / 100,
        m.camera.position[1],
        Math.round((m.camera.position[2] + 0.8) * 100) / 100
      ]);
  e.state.cameras.push(r), e.cameraPreviewSignature = "", e.activateCamera(r.id), e.setStatus(c(`${r.name} added`));
}
async function K(e, a) {
  if (e.state.cameras.length <= 1) return e.setStatus(c("At least one camera is required"));
  const t = e.state.cameras.find((s) => s.id === a);
  if (!t || !await A(c("Delete camera"), c(`Delete ${t.name} and its ${t.keyframes.length} keyframe(s)?`))) return;
  e.checkpoint("Delete camera"), e.finishCameraEdit();
  const r = a === e.state.active_camera_id;
  if (e.state.cameras = e.state.cameras.filter((s) => s.id !== a), a === e.state.playblast_camera_id && (e.state.playblast_camera_id = e.state.cameras[0].id), e.cameraPreviewSignature = "", r) {
    const s = e.state.cameras[0];
    e.state.active_camera_id = s.id, e.state.keyframes = s.keyframes, e.state.camera = y(s.camera), e.camera = w(s, e.frame), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = s.keyframes.find((m) => m.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null;
  }
  e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(c(`${t.name} deleted`));
}
function x(e, a) {
  const t = e.state.cameras.find((r) => r.id === a);
  t && (e.finishCameraEdit(), e.syncActiveCameraTrack(), e.state.active_camera_id = t.id, e.state.keyframes = t.keyframes, e.state.camera = y(t.camera), e.camera = w(t, e.frame), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = t.keyframes.find((r) => r.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(c(`Camera: ${t.name}`)));
}
function j(e, a) {
  const t = e.state.cameras.find((r) => r.id === a);
  t && (e.state.playblast_camera_id = t.id, e.refreshCameraSelectors(), e.serialize(), e.refreshObjects(), e.renderCameraView(), e.setStatus(c(`Playblast: ${t.name}`)));
}
function D(e) {
  e.state.camera_view_visible = !e.state.camera_view_visible;
  for (const a of e.root.querySelectorAll('[data-role="camera-view-row"]')) a.hidden = !e.state.camera_view_visible;
  for (const a of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    a.classList.toggle("active", e.state.camera_view_visible), a.setAttribute("aria-pressed", String(e.state.camera_view_visible));
  e.serialize(), e.state.camera_view_visible && requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(c(`Camera previews ${e.state.camera_view_visible ? "shown" : "hidden"}`));
}
function M(e, a) {
  e.state.maximized_camera_id = e.state.maximized_camera_id === a ? null : a, e.serialize(), E(e), requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(e.state.maximized_camera_id ? c("Preview maximized") : c("Preview restored"));
}
const $ = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "9:16": 9 / 16, "2.39:1": 2.39 };
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
    const s = $[e.state.aspect_ratio] || e.state.width / Math.max(1, e.state.height), m = t / Math.max(1, r);
    if (a.save(), a.fillStyle = "#00000088", m > s) {
      const n = r * s, o = (t - n) / 2;
      a.fillRect(0, 0, o, r), a.fillRect(t - o, 0, o, r), e.state.resolution_gate && (a.strokeStyle = "#ffffff88", a.strokeRect(o, 0, n, r));
    } else if (m < s) {
      const n = t / s, o = (r - n) / 2;
      a.fillRect(0, 0, t, o), a.fillRect(0, r - o, t, o), e.state.resolution_gate && (a.strokeStyle = "#ffffff88", a.strokeRect(0, o, t, n));
    }
    a.restore();
  }
}
const W = [
  { mm: 14, name: "14mm Ultra-Wide" },
  { mm: 18, name: "18mm Super-Wide" },
  { mm: 24, name: "24mm Wide" },
  { mm: 35, name: "35mm Normal-Wide" },
  { mm: 50, name: "50mm Standard" },
  { mm: 85, name: "85mm Portrait" },
  { mm: 105, name: "105mm Medium Tele" },
  { mm: 135, name: "135mm Telephoto" }
];
function H(e, a = 36) {
  const r = Math.max(1, Math.min(179, Number(e) || 35)) * Math.PI / 360;
  return a / 2 / Math.max(1e-9, Math.tan(r));
}
function z(e, a = 36) {
  const t = Math.max(1, Number(e) || 50);
  return 2 * Math.atan(a / 2 / t) * 180 / Math.PI;
}
function J(e, a) {
  const t = z(a);
  e.activeCameraTrack()?.keyframes?.length && e.activeKeyframe() ? (e.activeKeyframe().camera.fov = t, e.scheduleSerialize(), e.render(), e.refreshKeyEditor()) : (e.camera.fov = t, e.render());
  for (const s of e.root.querySelectorAll('[data-role="fov"], [data-role="camera-fov"]'))
    s.value = String(t.toFixed(1));
  e.setStatus(`Lens: ${a}mm (FOV ${t.toFixed(1)}°)`);
}
export {
  i as CAMERA_PALETTE,
  W as CINEMA_LENSES,
  x as activateCamera,
  R as addCamera,
  J as applyCinemaLens,
  K as deleteCamera,
  V as drawPreviewOverlays,
  O as duplicateCamera,
  z as focalLengthToFov,
  H as fovToFocalLength,
  M as maximizeCameraPreview,
  E as refreshCameraPreviews,
  F as refreshCameraSelectors,
  N as renameCamera,
  j as setPlayblastCamera,
  D as toggleCameraView,
  T as visibleCameraTracks
};
