import "../../scripts/app.js";
import { cloneCamera as v, cloneTransform as F, sampleCamera as T, clamp as _ } from "./omnicam-core.js";
import "./omnicam-ui.js";
import { t as b } from "./omnicam-i18n.js";
import { playblastCameraTrack as N } from "./omnicam-state-sync.js";
import { cloneTransform as u, add as M, clamp as w } from "./omnicam-core.js";
import { confirmAction as L, promptText as D } from "./omnicam-ui.js";
import { t as i } from "./omnicam-i18n.js";
function I(e, t, a = null, r = null) {
  const o = Array.isArray(e) ? e : [];
  return o.find((n) => n.frame === t) || (a !== null ? o.find((n) => n.frame === a) : null) || (r !== null ? o.find((n) => n.frame === r) : null) || null;
}
function G(e) {
  const t = e.root.querySelector('[data-role="objects"]');
  if (!t) return;
  t.innerHTML = "";
  const a = (r, o, n, s, m = "") => {
    const l = document.createElement("button");
    return l.type = "button", l.className = "scene-action-btn", n && (l.style.cssText = m || "color:#f59e0b;border-color:#78350f;background:rgba(245,158,11,0.15)"), l.title = i(o), l.innerHTML = `<i class="pi ${r}" style="font-size:10px"></i>`, l.addEventListener("click", (c) => {
      c.stopPropagation(), s(c);
    }), l;
  };
  for (const r of e.state.cameras) {
    const o = document.createElement("div");
    o.role = "button", o.tabIndex = 0, o.dataset.cameraId = r.id;
    const n = r.id === e.state.active_camera_id, s = r.id === e.state.playblast_camera_id, m = e.selectedEntity === "camera" && n;
    o.setAttribute("aria-selected", String(m)), o.className = `scene-item${m ? " selected" : ""}${n && !m ? " active-view" : ""}`;
    const l = document.createElement("i");
    l.className = "pi pi-video";
    const c = document.createElement("span");
    if (c.className = "scene-item-label", m || n) {
      const f = document.createElement("span");
      f.style.cssText = `color:${m ? "#f59e0b" : "#58cc6b"};font-weight:700`, f.textContent = m ? "● " : "○ ", c.appendChild(f);
    }
    if (c.appendChild(document.createTextNode(r.name)), s) {
      const f = document.createElement("span");
      f.style.cssText = "color:#f2d06b;font-size:10px", f.title = "Playblast Output", f.textContent = " ★", c.appendChild(f);
    }
    if (r.muted) {
      const f = document.createElement("span");
      f.style.opacity = ".6", f.textContent = " (muted)", c.appendChild(f);
    }
    const y = document.createElement("div");
    y.className = "scene-item-actions", y.appendChild(a("pi-star", "Solo track", r.solo, () => {
      e.checkpoint("Solo track"), r.solo = !r.solo, e.serialize(), e.refreshObjects(), e.renderCameraView();
    }, "color:#fbbf24;border-color:#78350f;background:rgba(245,158,11,0.2)")), y.appendChild(a("pi-volume-off", "Mute track", r.muted, () => {
      e.checkpoint("Mute track"), r.muted = !r.muted, e.serialize(), e.refreshObjects(), e.renderCameraView();
    }, "color:#f87171;border-color:#7f1d1d;background:rgba(239,68,68,0.15)")), y.appendChild(a("pi-lock", "Lock track", r.locked, () => {
      e.checkpoint("Lock track"), r.locked = !r.locked, e.serialize(), e.refreshObjects(), e.renderCameraView();
    })), y.appendChild(a("pi-ellipsis-v", "Camera actions", !1, (f) => e.openCameraContext(f, r.id, !1))), o.append(l, c, y), o.title = m ? i("Currently selected for editing") : s ? i("Active playblast camera") : i("Click to select & activate this camera");
    const j = () => {
      e.finishCameraEdit(), e.selectedEntity = "camera", e.selectedObjectId = null, e.editingKeyFrame = null, e.activateCamera(r.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(i(`Camera: ${r.name}`));
    };
    o.addEventListener("contextmenu", (f) => {
      f.preventDefault(), f.stopPropagation(), e.openCameraContext(f, r.id, !1);
    }), o.addEventListener("keydown", (f) => {
      (f.key === "Enter" || f.key === " ") && (f.preventDefault(), j());
    }), t.appendChild(o);
  }
  for (const r of e.state.objects) {
    const o = document.createElement("div");
    o.role = "button", o.tabIndex = 0, o.dataset.objectId = r.id;
    const n = e.selectedEntity === "object" && r.id === e.selectedObjectId;
    o.setAttribute("aria-selected", String(n)), o.className = `scene-item${n ? " selected" : ""}`;
    const s = r.type === "card" ? "pi-image" : r.type === "model" || r.type === "glb" ? "pi-box" : r.type === "ground" ? "pi-minus" : r.type === "cube" ? "pi-stop" : r.type === "sphere" ? "pi-circle" : r.type === "human" ? "pi-user" : "pi-plus", m = r.enabled !== !1, l = !!r.load_error, c = document.createElement("i");
    c.className = `pi ${l ? "pi-exclamation-triangle" : s}`, c.style.cssText = l ? "color:#f87171" : m ? "" : "opacity:.4";
    const y = document.createElement("span");
    y.className = "scene-item-label";
    const j = document.createElement("span");
    if (j.style.cssText = l ? "color:#fca5a5" : m ? "" : "opacity:.5;text-decoration:line-through", j.textContent = r.name || r.type, y.appendChild(j), l) {
      const k = document.createElement("span");
      k.style.cssText = "color:#ef4444;font-size:9px;font-weight:700", k.textContent = " [Format!]", y.appendChild(k);
    }
    const f = document.createElement("div");
    f.className = "scene-item-actions", f.appendChild(a(m ? "pi-eye" : "pi-eye-slash", m ? "Hide object" : "Show object", !m, () => e.toggleObject(r.id), "color:#ef4444;opacity:.7")), f.appendChild(a("pi-lock", "Lock object", r.locked, () => {
      e.checkpoint("Lock object"), r.locked = !r.locked, e.serialize(), e.refreshObjects();
    })), f.appendChild(a("pi-ellipsis-v", "Object actions", !1, (k) => e.openObjectContext(k, r.id))), o.append(c, y, f), o.title = i("Click to select · Double-click to toggle visibility · Right-click for actions");
    const z = (k = {}) => {
      if (k.altKey && r.id !== "subject") return void e.deleteObject(r.id);
      e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectId = r.id, e.selectedKeyFrame = r.keyframes?.find((g) => g.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null;
      for (const g of t.querySelectorAll(".scene-item")) {
        const S = g.dataset.objectId === r.id;
        g.classList.toggle("selected", S), g.dataset.objectId && g.setAttribute("aria-selected", String(S));
      }
      e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(i(`Selected: ${r.name || r.type}`));
    };
    o.addEventListener("dblclick", () => e.toggleObject(r.id)), o.addEventListener("contextmenu", (k) => {
      k.preventDefault(), k.stopPropagation(), e.openObjectContext(k, r.id);
    }), o.addEventListener("keydown", (k) => {
      (k.key === "Enter" || k.key === " ") && (k.preventDefault(), z(k));
    }), t.appendChild(o);
  }
  e.refreshInspector();
}
function J(e, t) {
  e.checkpoint("Create object");
  const a = `${t}_${Date.now().toString(36)}`, r = t === "ground", o = {
    id: a,
    type: t,
    name: t === "human" ? i("Human Proxy") : t[0].toUpperCase() + t.slice(1),
    position: r ? [0, -0.05, 0] : [0, t === "human" ? 0 : 0.75, -2],
    rotation: [0, 0, 0],
    size: r ? [12, 0.1, 12] : t === "human" ? [0.7, 1.8, 0.4] : [1.5, 1.5, 1.5],
    material_mode: r ? "checker" : "textured",
    keyframes: [],
    enabled: !0
  };
  e.state.objects.push(o), e.selectedEntity = "object", e.selectedObjectId = a, e.selectedKeyFrame = null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render();
}
async function W(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  if (!a) return;
  const r = (await D(e.app, i("Rename object"), i("Object name"), a.name || a.type))?.trim();
  !r || r === a.name || (e.checkpoint("Rename object"), a.name = r.slice(0, 80), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(i(`Object renamed: ${a.name}`)));
}
function Q(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  if (!a) return;
  e.checkpoint("Duplicate object");
  const r = JSON.parse(JSON.stringify(a));
  r.id = `${a.type}_${Date.now().toString(36)}`, r.name = `${a.name || a.type} Copy`, r.position = M(r.position || [0, 0, 0], [0.35, 0, 0.35]), r.asset && delete r.asset, e.state.objects.push(r), e.selectedEntity = "object", e.selectedObjectId = r.id, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(i(`${r.name} added`));
}
function ee(e, t) {
  const a = e.state.objects.find((r) => r.id === t);
  a && (e.checkpoint(a.enabled === !1 ? "Show object" : "Hide object"), a.enabled = a.enabled === !1, e.serialize(), e.refreshObjects(), e.render(), e.setStatus(i(`${a.name || a.type} ${a.enabled ? "shown" : "hidden"}`)));
}
async function te(e, t) {
  if (t === "subject") return e.setStatus(i("The subject card cannot be deleted"));
  const a = e.state.objects.find((r) => r.id === t);
  if (a && await L(e.app, i("Delete object"), i(`Delete ${a.name || a.type} and its ${(a.keyframes || []).length} keyframe(s)?`))) {
    e.checkpoint("Delete object");
    for (const r of e.state.objects) r.parent_id === t && (r.parent_id = null);
    e.state.objects = e.state.objects.filter((r) => r.id !== t), e.removeObjectResources(t), e.selectedObjectId === t && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = e.state.keyframes.find((r) => r.frame === e.frame)?.frame ?? null), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(i(`${a.name || a.type} deleted`));
  }
}
function ae(e) {
  const t = `card_${Date.now().toString(36)}`;
  e.state.objects.push({
    id: t,
    type: "card",
    name: `Media Card ${e.state.objects.filter((a) => a.type === "card").length + 1}`,
    position: [0, 1.5, -2],
    rotation: [0, 0, 0],
    size: [2, 3],
    material_mode: "textured",
    keyframes: [],
    enabled: !0,
    asset: ""
  }), e.selectedEntity = "object", e.selectedObjectId = t, e.selectedKeyFrame = null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.root.querySelector('[data-role="file"]').click();
}
function O(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function re(e) {
  const t = O(e), a = e.root.querySelector('[data-role="object-panel"]');
  a && (a.hidden = !t);
  const r = (d) => e.root.querySelector(d), o = e.activeCameraTrack(), n = r('[data-role="camera-target-object"]');
  if (n) {
    const d = o.target_object_id || e.state.target_object_id || "";
    n.innerHTML = "";
    const h = document.createElement("option");
    h.value = "", h.textContent = i("Manual Target (No Tracking)"), n.appendChild(h);
    for (const p of e.state.objects) {
      const $ = document.createElement("option");
      $.value = p.id, $.textContent = `${i("Track:")} ${p.name || p.type}`, n.appendChild($);
    }
    n.value = d;
  }
  const s = [...e.camera.position, ...e.camera.target, e.camera.fov, e.camera.roll || 0, e.camera.near, e.camera.far];
  ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"].forEach((d, h) => {
    for (const p of e.root.querySelectorAll(`[data-role="${d}"]`))
      document.activeElement !== p && (p.value = String(Math.round(s[h] * 1e4) / 1e4));
  });
  for (const d of e.root.querySelectorAll('[data-role="camera-type"]'))
    document.activeElement !== d && (d.value = e.camera.camera_type || "perspective");
  for (const d of e.root.querySelectorAll('[data-role="speed"]'))
    document.activeElement !== d && (d.value = String(e.cameraSpeed || 1));
  for (const d of e.root.querySelectorAll('[data-role="active-camera-select"]'))
    document.activeElement !== d && (d.value = e.state.active_camera_id);
  for (const d of e.root.querySelectorAll('[data-role="camera-color"]'))
    document.activeElement !== d && (d.value = o?.color || "#4aa3ef");
  if (!t) {
    const d = r('[data-role="selected-name"]');
    d && (d.textContent = `${o.name} · F${e.frame}`);
    const h = r('[data-role="curve-title"]');
    h && (h.textContent = i(`${o.name} Curve Editor`));
    const p = r('[data-role="curve-group"]');
    p && p.options.length >= 3 && (p.options[0].textContent = i("Position XYZ"), p.options[1].textContent = i("Target XYZ"), p.options[2].textContent = i("FOV / Roll / Zoom"));
    return;
  }
  const m = t.position || [0, 0, 0], l = r('[data-role="selected-name"]');
  l && (l.textContent = t.name || t.type);
  const c = r('[data-role="curve-title"]');
  c && (c.textContent = i(`${t.name || t.type} Curve Editor`));
  const y = r('[data-role="curve-group"]');
  y && y.options.length >= 3 && (y.options[0].textContent = i("Position XYZ"), y.options[1].textContent = i("Rotation XYZ"), y.options[2].textContent = i("Scale XYZ"));
  const j = t.rotation || [0, 0, 0], f = t.size || [1, 1, 1], z = {
    "object-x": m[0],
    "object-y": m[1],
    "object-z": m[2],
    "object-rx": j[0],
    "object-ry": j[1],
    "object-rz": j[2],
    "object-sx": f[0] ?? 1,
    "object-sy": f[1] ?? 1,
    "object-sz": f[2] ?? 1
  };
  for (const [d, h] of Object.entries(z))
    for (const p of e.root.querySelectorAll(`[data-role="${d}"]`))
      document.activeElement !== p && (p.value = String(Math.round(h * 1e4) / 1e4));
  for (const d of e.root.querySelectorAll('[data-role="object-material"]'))
    document.activeElement !== d && (d.value = t.material_mode || "textured");
  for (const d of e.root.querySelectorAll('[data-role="object-color"]'))
    document.activeElement !== d && (d.value = t.color || "#8c929b");
  for (const d of e.root.querySelectorAll("[data-transform-mode]")) d.classList.toggle("active", d.dataset.transformMode === (e.state.gizmo_mode || "translate"));
  const k = r('[data-role="animation-row"]'), g = r('[data-role="animation-select"]'), S = r('[data-role="object-parent"]');
  if (S) {
    const d = t.id;
    S.innerHTML = "";
    const h = document.createElement("option");
    h.value = "", h.textContent = i("No parent"), S.appendChild(h);
    const p = /* @__PURE__ */ new Set([d]);
    let $ = !0;
    for (; $; ) {
      $ = !1;
      for (const K of e.state.objects)
        !p.has(K.id) && K.parent_id && p.has(K.parent_id) && (p.add(K.id), $ = !0);
    }
    for (const K of e.state.objects) {
      if (p.has(K.id)) continue;
      const A = document.createElement("option");
      A.value = K.id, A.textContent = K.name || K.type, S.appendChild(A);
    }
    S.value = t.parent_id || "";
  }
  const q = e.modelInfoById.get(t.id);
  if (k && (k.hidden = !q?.animations), g) {
    g.innerHTML = "";
    for (const [d, h] of (q?.animationNames || []).entries()) {
      const p = document.createElement("option");
      p.value = String(d), p.textContent = h, g.appendChild(p);
    }
    g.value = String(t.animation_index || 0);
  }
}
function oe(e) {
  const t = O(e);
  if (!t) return;
  const a = (s, m) => {
    const l = e.root.querySelector(`[data-role="${s}"]`);
    if (!l || l.value === "") return m;
    const c = Number(l.value);
    return Number.isFinite(c) ? c : m;
  }, r = t.position || [0, 0, 0], o = t.rotation || [0, 0, 0], n = t.size || [1, 1, 1];
  t.position = [a("object-x", r[0]), a("object-y", r[1]), a("object-z", r[2])], t.rotation = [a("object-rx", o[0]), a("object-ry", o[1]), a("object-rz", o[2])], t.size = [Math.max(0.01, a("object-sx", n[0])), Math.max(0.01, a("object-sy", n[1])), Math.max(0.01, a("object-sz", n[2]))], e.commitObjectEdit(t), e.refreshObjects(), e.render();
}
function V(e, t) {
  if (!t) return null;
  if (t.locked)
    return e.setStatus(i(`${t.name || t.type} is locked`)), null;
  t.keyframes ||= [];
  let a = I(
    t.keyframes,
    e.frame,
    e.state.auto_key ? null : e.selectedKeyFrame,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, transform: u(t), interpolation: e.root.querySelector('[data-role="interp"]')?.value || "ease" }, t.keyframes.push(a), t.keyframes.sort((r, o) => r.frame - o.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame, e.updateKeyVisualState()) : a && (e.selectedKeyFrame = a.frame, e.updateKeyVisualState()), a;
}
function ne(e, t) {
  const a = V(e, t);
  a && (a.transform = u(t)), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor();
}
function ce(e) {
  const t = (a, r) => {
    const o = e.root.querySelector(`[data-role="${a}"]`);
    if (!o || o.value === "") return r;
    const n = Number(o.value);
    return Number.isFinite(n) ? n : r;
  };
  e.camera.position = [t("camera-px", e.camera.position[0]), t("camera-py", e.camera.position[1]), t("camera-pz", e.camera.position[2])], e.camera.target = [t("camera-tx", e.camera.target[0]), t("camera-ty", e.camera.target[1]), t("camera-tz", e.camera.target[2])], e.camera.fov = w(t("camera-fov", e.camera.fov), 5, 150), e.camera.roll = w(t("camera-roll", e.camera.roll || 0), -180, 180), e.camera.near = Math.max(1e-4, t("camera-near", e.camera.near)), e.camera.far = Math.max(e.camera.near + 1e-4, t("camera-far", e.camera.far)), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.render();
}
function se(e, t) {
  const a = O(e);
  if (!a) return;
  e.checkpoint("Set parent"), a.parent_id = t || null, e.serialize(), e.refreshObjects(), e.render();
  const r = e.state.objects.find((o) => o.id === t);
  e.setStatus(r ? i(`${a.name || a.type} parented to ${r.name || r.type}`) : i(`${a.name || a.type} unparented`));
}
function le(e, t) {
  const a = O(e);
  a && (a.animation_index = Math.max(0, t || 0), e.serialize(), e.webgl?.selectAnimation(a.id, t), e.setStatus(i(`Animation: ${e.modelInfoById.get(a.id)?.animationNames?.[t] || t + 1}`)));
}
function me(e, t) {
  e.objectUrls.revoke(t), e.cardMediaById.delete(t), e.modelUrlsById.delete(t), e.modelInfoById.delete(t), e.webgl?.removeModel(t);
}
function de(e, t) {
  return t(N(e), e.frame);
}
function E(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function C(e) {
  return E(e)?.keyframes || e.state.keyframes;
}
function fe(e, t) {
  for (const a of e.state.objects) {
    if (!a.keyframes?.length) continue;
    const r = t(a, e.frame);
    a.position = r.position, a.rotation = r.rotation, a.size = r.size;
  }
}
function ie(e) {
  e.checkpoint("Set keyframe");
  const t = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease", a = E(e), r = C(e), o = a ? { frame: e.frame, transform: F(a), interpolation: t } : { frame: e.frame, camera: v(e.camera), interpolation: t }, n = r.findIndex((s) => s.frame === e.frame);
  n >= 0 ? r[n] = o : r.push(o), r.sort((s, m) => s.frame - m.frame), e.selectedKeyFrame = e.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([e.frame]), e.editingKeyFrame = null, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor(), e.setStatus(b(`${a?.name || "Camera"} ${n >= 0 ? "key updated" : "key inserted"} @ ${e.frame}`));
}
function ye(e, t) {
  const a = x(e);
  if (!a) return;
  e.checkpoint("Change key interpolation"), a.interpolation = t;
  const r = e.root.querySelector('[data-role="key-interp"]');
  r && (r.value = t);
  for (const o of e.root.querySelectorAll("[data-interp]"))
    o.classList.toggle("active", o.dataset.interp === t);
  e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.drawCurveEditor(), e.setStatus(b(`Key @ ${a.frame} interpolation set to ${t}`));
}
function pe(e) {
  const t = E(e), a = C(e);
  if (!t && a.length <= 1) return e.setStatus(b("Keep at least one camera keyframe"));
  const r = x(e) || a.find((s) => s.frame === e.frame);
  if (!r) return e.setStatus(b("Select a keyframe to delete"));
  e.checkpoint("Delete keyframe"), t ? t.keyframes = a.filter((s) => s !== r) : e.state.keyframes = a.filter((s) => s !== r);
  const o = C(e), n = r.frame;
  e.editingKeyFrame === n && (e.editingKeyFrame = null), e.selectedKeyFrame = o.length ? o.reduce((s, m) => Math.abs(m.frame - n) < Math.abs(s.frame - n) ? m : s).frame : null, e.camera = T(e.state, e.frame), e.applyObjectAnimationFrame(), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(b(`${t?.name || "Camera"} key deleted @ ${n}`));
}
function be(e) {
  const t = E(e), a = x(e) || C(e).find((r) => r.frame === e.frame);
  e.copiedKeyframe = t ? { kind: "object", transform: F(a?.transform || t), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" } : { kind: "camera", camera: v(a?.camera || e.camera), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" }, e.setStatus(b(`Keyframe copied @ ${a?.frame ?? e.frame}`));
}
function ke(e) {
  if (!e.copiedKeyframe) return e.setStatus(b("Copy a keyframe first"));
  const t = E(e), a = t ? "object" : "camera";
  if (e.copiedKeyframe.kind !== a) return e.setStatus(b(`Copy a ${a} keyframe first`));
  e.checkpoint("Paste keyframe");
  const r = t ? { frame: e.frame, transform: F(e.copiedKeyframe.transform), interpolation: e.copiedKeyframe.interpolation } : { frame: e.frame, camera: v(e.copiedKeyframe.camera), interpolation: e.copiedKeyframe.interpolation }, o = C(e), n = o.findIndex((s) => s.frame === e.frame);
  n >= 0 ? o[n] = r : o.push(r), o.sort((s, m) => s.frame - m.frame), e.selectedKeyFrame = r.frame, e.editingKeyFrame = null, t ? (t.position = [...r.transform.position], t.rotation = [...r.transform.rotation], t.size = [...r.transform.size]) : e.camera = v(r.camera), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(b(`Keyframe pasted @ ${r.frame}`));
}
function x(e) {
  return C(e).find((t) => t.frame === e.selectedKeyFrame) || null;
}
function he(e, t) {
  t && (e.selectedKeyFrame = t.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([t.frame]), e.editingKeyFrame = null, e.setFrame(t.frame));
}
function je(e) {
  const t = e.activeCameraTrack();
  if (t?.locked)
    return e.setStatus(b(`${t.name} is locked`)), null;
  let a = I(
    e.state.keyframes,
    e.frame,
    !e.state.auto_key && e.selectedEntity === "camera" ? e.selectedKeyFrame : null,
    e.state.auto_key ? null : e.editingKeyFrame
  );
  return e.state.auto_key ? (a || (a = { frame: e.frame, camera: v(e.camera), interpolation: e.root.querySelector('[data-role="key-interp"]')?.value || "ease" }, e.state.keyframes.push(a), e.state.keyframes.sort((r, o) => r.frame - o.frame), e.refreshKeys()), e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame) : a && (e.selectedKeyFrame = a.frame), e.cameraEditKey = a || null, e.cameraEditActive = !0, e.updateKeyVisualState(), a;
}
function ge(e) {
  const t = e.cameraEditKey;
  t && (t.camera = v(e.camera), e.frame = t.frame, e.selectedKeyFrame = t.frame), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.render();
}
function Ke(e) {
  if (e.cameraEditActive) {
    if (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, e.selectedKeyFrame === null) {
      const t = e.state.keyframes.find((a) => a.frame === e.frame);
      t && (e.selectedKeyFrame = t.frame);
    }
    e.refreshKeys();
  }
}
function Se(e, t = !1) {
  e.editingKeyFrame === null && (!t || e.selectedKeyFrame === null) || (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, t && (e.selectedKeyFrame = null), e.refreshKeys());
}
function ve(e) {
  e.state.auto_key = !e.state.auto_key, e.state.auto_key || e.exitKeyEdit(!1), e.serialize(), e.updateEditState(), e.setStatus(b(`Auto Key ${e.state.auto_key ? "on" : "off"}`));
}
function Ee(e) {
  const t = e.root.querySelector(".viewport-wrap"), a = e.editingKeyFrame !== null, r = !!e.state.auto_key;
  t && (t.classList.toggle("edit-mode", a), t.classList.toggle("auto-key", r));
  for (const c of e.root.querySelectorAll('[data-act="auto-key"]'))
    c.classList.toggle("active", r), c.setAttribute("aria-pressed", String(r)), c.title = b(`Auto Key ${r ? "on" : "off"}`);
  const o = e.activeCameraTrack(), n = e.selectedObject(), s = e.root.querySelector('[data-role="tally-banner"]'), m = e.root.querySelector('[data-role="tally-text"]');
  if (s && m)
    if (a) {
      s.hidden = !1;
      const c = n ? n.name || n.type : o.name;
      m.textContent = `REC KEY @ F${e.editingKeyFrame} (${c})`;
    } else r ? (s.hidden = !1, m.textContent = `● AUTO-KEY ON (F${e.frame})`) : s.hidden = !0;
  const l = e.root.querySelector('[data-role="viewport-state"]');
  l && (a ? l.textContent = n ? `● EDITING ${n.name || n.type} @ F${e.editingKeyFrame}${r ? " · AUTO KEY" : ""}` : `● EDITING ${o.name} @ F${e.editingKeyFrame}${r ? " · AUTO KEY" : ""}` : r ? l.textContent = n ? `● AUTO KEY · ${n.name || n.type}` : `● AUTO KEY · ${o.name}` : n ? l.textContent = `SELECTED: ${n.name || n.type}` : l.textContent = e.state.view_mode === "camera" ? `CAMERA: ${o.name}` : `VIEW: ${e.state.view_mode.toUpperCase()}`);
}
function Ce(e) {
  const t = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const a of e.root.querySelectorAll("[data-key-frame]")) {
    const r = Number(a.dataset.keyFrame);
    a.classList.toggle("selected", t.has(r)), a.classList.toggle("editing", r === e.editingKeyFrame), a.classList.toggle("at-playhead", r === e.frame);
  }
  e.updateEditState();
}
function xe(e) {
  const t = E(e), a = x(e), r = e.root.querySelector('[data-role="key-editor"]');
  r && (r.dataset.empty = String(!a));
  const o = e.root.querySelector('[data-role="selected-key-label"]');
  o && (o.textContent = a ? b(`${t?.name || "Camera"} Key @ ${a.frame}`) : b(`No ${t ? "object" : "camera"} key selected`));
  const n = ["key-frame", "key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"];
  for (const c of n) {
    const y = e.root.querySelector(`[data-role="${c}"]`);
    y && (y.disabled = !a || !!(t && !["key-frame", "key-interp"].includes(c)));
  }
  const s = e.root.querySelector('[data-act="update-key"]');
  s && (s.disabled = !a || !!t);
  const m = e.root.querySelector('[data-act="view-key"]');
  m && (m.disabled = !a || !!t);
  for (const c of e.root.querySelectorAll("[data-interp]"))
    c.classList.toggle("active", !!(a && c.dataset.interp === a.interpolation));
  if (!a) return;
  if (t) {
    const c = e.root.querySelector('[data-role="key-frame"]');
    c && document.activeElement !== c && (c.value = String(a.frame));
    const y = e.root.querySelector('[data-role="key-interp"]');
    y && document.activeElement !== y && (y.value = a.interpolation);
    return;
  }
  const l = {
    "key-frame": a.frame,
    "key-interp": a.interpolation,
    "key-px": a.camera.position[0],
    "key-py": a.camera.position[1],
    "key-pz": a.camera.position[2],
    "key-tx": a.camera.target[0],
    "key-ty": a.camera.target[1],
    "key-tz": a.camera.target[2],
    "key-fov": a.camera.fov,
    "key-roll": a.camera.roll || 0,
    "key-zoom": a.camera.zoom || 1,
    "key-near": a.camera.near,
    "key-far": a.camera.far,
    "key-camera-type": a.camera.camera_type
  };
  for (const [c, y] of Object.entries(l)) {
    const j = e.root.querySelector(`[data-role="${c}"]`);
    j && document.activeElement !== j && (j.value = String(y));
  }
}
function $e(e, t, a = !1) {
  const r = x(e);
  if (!r) return;
  const o = C(e);
  let n = _(Math.round(t), 0, e.state.duration_frames - 1);
  const s = (l) => o.some((c) => c !== r && c.frame === l);
  if (s(n) && a)
    for (let l = 1; l < e.state.duration_frames; l++) {
      const c = [n - l, n + l].filter((y) => y >= 0 && y < e.state.duration_frames).find((y) => !s(y));
      if (c !== void 0) {
        n = c;
        break;
      }
    }
  if (s(n))
    return e.refreshKeyEditor(), e.setStatus(b(`Frame ${n} already has a keyframe`));
  if (n === r.frame) return;
  const m = e.editingKeyFrame === r.frame;
  r.frame = n, e.selectedKeyFrame = n, e.editingKeyFrame = m ? n : null, e.frame = n, o.sort((l, c) => l.frame - c.frame), e.serialize(), e.setFrame(n), e.setStatus(b(`Keyframe moved to ${n}`));
}
function Fe(e) {
  const t = x(e);
  if (!t) return;
  if (e.editingKeyFrame = t.frame, E(e)) {
    t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.transform = F(E(e)), e.serialize(), e.setFrame(t.frame), e.setStatus(b(`Object keyframe updated @ ${t.frame}`));
    return;
  }
  const a = (r, o) => {
    const n = Number(e.root.querySelector(`[data-role="${r}"]`).value);
    return Number.isFinite(n) ? n : o;
  };
  t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.camera.position = [a("key-px", t.camera.position[0]), a("key-py", t.camera.position[1]), a("key-pz", t.camera.position[2])], t.camera.target = [a("key-tx", t.camera.target[0]), a("key-ty", t.camera.target[1]), a("key-tz", t.camera.target[2])], t.camera.fov = _(a("key-fov", t.camera.fov), 5, 150), t.camera.roll = _(a("key-roll", t.camera.roll || 0), -180, 180), t.camera.zoom = Math.max(0.01, a("key-zoom", t.camera.zoom || 1)), t.camera.near = Math.max(1e-4, a("key-near", t.camera.near)), t.camera.far = Math.max(t.camera.near + 1e-4, a("key-far", t.camera.far)), t.camera.camera_type = e.root.querySelector('[data-role="key-camera-type"]').value, e.camera = v(t.camera), e.frame = t.frame, e.serialize(), e.setFrame(t.frame), e.setStatus(b(`Keyframe updated @ ${t.frame}`));
}
function Oe(e) {
  const t = x(e);
  t && (e.editingKeyFrame = t.frame, t.camera = v(e.camera), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(b(`View stored in keyframe @ ${t.frame}`)));
}
function ze(e) {
  const t = x(e);
  t && (e.setFrame(t.frame), e.setStatus(b(`Loaded keyframe @ ${t.frame}`)));
}
function Ae(e, t) {
  const a = C(e);
  if (!a.length) return;
  const r = t < 0 ? [...a].reverse().find((o) => o.frame < e.frame) || a[a.length - 1] : a.find((o) => o.frame > e.frame) || a[0];
  e.selectKeyframe(r);
}
export {
  ae as addMediaCard,
  J as addPrimitive,
  fe as applyObjectAnimationFrame,
  je as beginCameraEdit,
  V as beginObjectEdit,
  ge as commitCameraEdit,
  ne as commitObjectEdit,
  be as copyKeyframe,
  pe as deleteKeyframe,
  te as deleteObject,
  Q as duplicateObject,
  Se as exitKeyEdit,
  Ke as finishCameraEdit,
  Ae as goToAdjacentKey,
  ie as insertKeyframe,
  ze as loadSelectedKeyView,
  ke as pasteKeyframe,
  de as playblastCameraAtFrame,
  re as refreshInspector,
  xe as refreshKeyEditor,
  G as refreshObjects,
  me as removeObjectResources,
  W as renameObject,
  $e as retimeSelectedKey,
  he as selectKeyframe,
  le as selectObjectAnimation,
  x as selectedKeyframe,
  O as selectedObject,
  ye as setKeyInterpolation,
  se as setObjectParent,
  C as timelineKeyframes,
  E as timelineObject,
  ve as toggleAutoKey,
  ee as toggleObject,
  ce as updateCameraFromHud,
  Ee as updateEditState,
  Oe as updateKeyFromView,
  Ce as updateKeyVisualState,
  Fe as updateSelectedKey,
  oe as updateSelectedObject
};
