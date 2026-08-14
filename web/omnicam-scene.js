import { app as z } from "../../scripts/app.js";
import { cloneCamera as j, cloneTransform as S, sampleCamera as C, add as O, clamp as $ } from "./omnicam-core.js";
import { confirmAction as _, promptText as q } from "./omnicam-ui.js";
import { t as n } from "./omnicam-i18n.js";
import { playblastCameraTrack as w } from "./omnicam-state-sync.js";
function D(e, t) {
  return t(w(e), e.frame);
}
function h(e) {
  return e.selectedEntity === "object" ? x(e) : null;
}
function g(e) {
  return h(e)?.keyframes || e.state.keyframes;
}
function V(e, t) {
  for (const a of e.state.objects) {
    if (!a.keyframes?.length) continue;
    const r = t(a, e.frame);
    a.position = r.position, a.rotation = r.rotation, a.size = r.size;
  }
}
function B(e) {
  e.checkpoint("Set keyframe");
  const t = e.root.querySelector('[data-role="interp"]').value, a = h(e), r = g(e), o = a ? { frame: e.frame, transform: S(a), interpolation: t } : { frame: e.frame, camera: j(e.camera), interpolation: t }, c = r.findIndex((s) => s.frame === e.frame);
  c >= 0 ? r[c] = o : r.push(o), r.sort((s, l) => s.frame - l.frame), e.selectedKeyFrame = e.frame, e.editingKeyFrame = null, e.serialize(), e.refreshKeys(), e.setStatus(n(`${a?.name || "Camera"} ${c >= 0 ? "key updated" : "key inserted"} @ ${e.frame}`));
}
function P(e) {
  const t = h(e), a = g(e);
  if (!t && a.length <= 1) return e.setStatus(n("Keep at least one camera keyframe"));
  const r = K(e) || a.find((s) => s.frame === e.frame);
  if (!r) return e.setStatus(n("Select a keyframe to delete"));
  e.checkpoint("Delete keyframe"), t ? t.keyframes = a.filter((s) => s !== r) : e.state.keyframes = a.filter((s) => s !== r);
  const o = g(e), c = r.frame;
  e.editingKeyFrame === c && (e.editingKeyFrame = null), e.selectedKeyFrame = o.length ? o.reduce((s, l) => Math.abs(l.frame - c) < Math.abs(s.frame - c) ? l : s).frame : null, e.camera = C(e.state, e.frame), e.applyObjectAnimationFrame(), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(n(`${t?.name || "Camera"} key deleted @ ${c}`));
}
function H(e) {
  const t = h(e), a = K(e) || g(e).find((r) => r.frame === e.frame);
  e.copiedKeyframe = t ? { kind: "object", transform: S(a?.transform || t), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]').value } : { kind: "camera", camera: j(a?.camera || e.camera), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]').value }, e.setStatus(n(`Keyframe copied @ ${a?.frame ?? e.frame}`));
}
function R(e) {
  if (!e.copiedKeyframe) return e.setStatus(n("Copy a keyframe first"));
  const t = h(e), a = t ? "object" : "camera";
  if (e.copiedKeyframe.kind !== a) return e.setStatus(n(`Copy a ${a} keyframe first`));
  e.checkpoint("Paste keyframe");
  const r = t ? { frame: e.frame, transform: S(e.copiedKeyframe.transform), interpolation: e.copiedKeyframe.interpolation } : { frame: e.frame, camera: j(e.copiedKeyframe.camera), interpolation: e.copiedKeyframe.interpolation }, o = g(e), c = o.findIndex((s) => s.frame === e.frame);
  c >= 0 ? o[c] = r : o.push(r), o.sort((s, l) => s.frame - l.frame), e.selectedKeyFrame = r.frame, e.editingKeyFrame = null, t ? (t.position = [...r.transform.position], t.rotation = [...r.transform.rotation], t.size = [...r.transform.size]) : e.camera = j(r.camera), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(n(`Keyframe pasted @ ${e.frame}`));
}
function K(e) {
  return g(e).find((t) => t.frame === e.selectedKeyFrame) || null;
}
function Y(e, t) {
  t && (e.selectedKeyFrame = t.frame, e.editingKeyFrame = null, e.setFrame(t.frame));
}
function u(e) {
  const t = e.activeCameraTrack();
  if (t?.locked)
    return e.setStatus(n(`${t.name} is locked`)), null;
  let a = e.state.auto_key ? e.state.keyframes.find((r) => r.frame === e.frame) : e.selectedEntity === "camera" ? e.state.keyframes.find((r) => r.frame === e.selectedKeyFrame) : null;
  return !a && e.state.auto_key && (a = { frame: e.frame, camera: j(e.camera), interpolation: e.root.querySelector('[data-role="interp"]').value }, e.state.keyframes.push(a), e.state.keyframes.sort((r, o) => r.frame - o.frame), e.refreshKeys()), e.cameraEditKey = a || null, a ? (e.selectedEntity === "camera" && (e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame), e.cameraEditActive = !0, e.updateKeyVisualState(), a) : null;
}
function Z(e) {
  const t = e.cameraEditKey;
  t && (t.camera = j(e.camera), e.frame = t.frame), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.render();
}
function U(e) {
  e.cameraEditActive && (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, e.selectedKeyFrame = null, e.refreshKeys());
}
function X(e, t = !1) {
  e.editingKeyFrame === null && (!t || e.selectedKeyFrame === null) || (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, t && (e.selectedKeyFrame = null), e.refreshKeys());
}
function J(e) {
  e.state.auto_key = !e.state.auto_key, e.state.auto_key || e.exitKeyEdit(!1), e.serialize(), e.updateEditState(), e.setStatus(n(`Auto Key ${e.state.auto_key ? "on" : "off"}`));
}
function G(e) {
  const t = e.root.querySelector(".viewport-wrap"), a = e.editingKeyFrame !== null;
  t.classList.toggle("edit-mode", a), t.classList.toggle("auto-key", e.state.auto_key);
  const r = e.root.querySelector('[data-act="auto-key"]');
  r.classList.toggle("active", e.state.auto_key), r.setAttribute("aria-pressed", String(e.state.auto_key)), r.title = n(`Auto Key ${e.state.auto_key ? "on" : "off"}`), e.root.querySelector('[data-role="viewport-state"]').textContent = a ? `EDIT KEY F${e.editingKeyFrame}${e.state.auto_key ? " · AUTO KEY" : ""}` : e.state.auto_key ? "AUTO KEY" : "";
}
function Q(e) {
  for (const t of e.root.querySelectorAll("[data-key-frame]")) {
    const a = Number(t.dataset.keyFrame);
    t.classList.toggle("selected", a === e.selectedKeyFrame), t.classList.toggle("editing", a === e.editingKeyFrame), t.classList.toggle("at-playhead", a === e.frame);
  }
  e.updateEditState();
}
function W(e) {
  const t = h(e), a = K(e), r = e.root.querySelector('[data-role="key-editor"]');
  r.dataset.empty = String(!a), e.root.querySelector('[data-role="selected-key-label"]').textContent = a ? n(`${t?.name || "Camera"} Key @ ${a.frame}`) : n(`No ${t ? "object" : "camera"} key selected`);
  const o = ["key-frame", "key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"];
  for (const s of o) e.root.querySelector(`[data-role="${s}"]`).disabled = !a || !!(t && !["key-frame", "key-interp"].includes(s));
  if (e.root.querySelector('[data-act="update-key"]').disabled = !a || !!t, e.root.querySelector('[data-act="view-key"]').disabled = !a || !!t, !a) return;
  if (t) {
    e.root.querySelector('[data-role="key-frame"]').value = String(a.frame), e.root.querySelector('[data-role="key-interp"]').value = a.interpolation;
    return;
  }
  const c = {
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
  for (const [s, l] of Object.entries(c)) e.root.querySelector(`[data-role="${s}"]`).value = String(l);
}
function ee(e, t, a = !1) {
  const r = K(e);
  if (!r) return;
  const o = g(e);
  let c = $(Math.round(t), 0, e.state.duration_frames - 1);
  const s = (d) => o.some((i) => i !== r && i.frame === d);
  if (s(c) && a)
    for (let d = 1; d < e.state.duration_frames; d++) {
      const i = [c - d, c + d].filter((y) => y >= 0 && y < e.state.duration_frames).find((y) => !s(y));
      if (i !== void 0) {
        c = i;
        break;
      }
    }
  if (s(c))
    return e.refreshKeyEditor(), e.setStatus(n(`Frame ${c} already has a keyframe`));
  if (c === r.frame) return;
  const l = e.editingKeyFrame === r.frame;
  r.frame = c, e.selectedKeyFrame = c, e.editingKeyFrame = l ? c : null, e.frame = c, o.sort((d, i) => d.frame - i.frame), e.serialize(), e.setFrame(c), e.setStatus(n(`Keyframe moved to ${c}`));
}
function te(e) {
  const t = K(e);
  if (!t) return;
  if (e.editingKeyFrame = t.frame, h(e)) {
    t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.transform = S(h(e)), e.serialize(), e.setFrame(t.frame), e.setStatus(n(`Object keyframe updated @ ${t.frame}`));
    return;
  }
  const a = (r, o) => {
    const c = Number(e.root.querySelector(`[data-role="${r}"]`).value);
    return Number.isFinite(c) ? c : o;
  };
  t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.camera.position = [a("key-px", t.camera.position[0]), a("key-py", t.camera.position[1]), a("key-pz", t.camera.position[2])], t.camera.target = [a("key-tx", t.camera.target[0]), a("key-ty", t.camera.target[1]), a("key-tz", t.camera.target[2])], t.camera.fov = $(a("key-fov", t.camera.fov), 5, 150), t.camera.roll = $(a("key-roll", t.camera.roll || 0), -180, 180), t.camera.zoom = Math.max(0.01, a("key-zoom", t.camera.zoom || 1)), t.camera.near = Math.max(1e-4, a("key-near", t.camera.near)), t.camera.far = Math.max(t.camera.near + 1e-4, a("key-far", t.camera.far)), t.camera.camera_type = e.root.querySelector('[data-role="key-camera-type"]').value, e.camera = j(t.camera), e.frame = t.frame, e.serialize(), e.setFrame(t.frame), e.setStatus(n(`Keyframe updated @ ${t.frame}`));
}
function ae(e) {
  const t = K(e);
  t && (e.editingKeyFrame = t.frame, t.camera = j(e.camera), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(n(`View stored in keyframe @ ${t.frame}`)));
}
function re(e) {
  const t = K(e);
  t && (e.setFrame(t.frame), e.setStatus(n(`Loaded keyframe @ ${t.frame}`)));
}
function oe(e, t) {
  const a = g(e);
  if (!a.length) return;
  const r = t < 0 ? [...a].reverse().find((o) => o.frame < e.frame) || a[a.length - 1] : a.find((o) => o.frame > e.frame) || a[0];
  e.selectKeyframe(r);
}
function ne(e, t) {
  e.checkpoint("Create object");
  const a = `${t}_${Date.now().toString(36)}`, r = t === "ground", o = {
    id: a,
    type: t,
    name: t === "human" ? n("Human Proxy") : t[0].toUpperCase() + t.slice(1),
    position: r ? [0, -0.05, 0] : [0, t === "human" ? 0 : 0.75, -2],
    rotation: [0, 0, 0],
    size: r ? [12, 0.1, 12] : t === "human" ? [0.7, 1.8, 0.4] : [1.5, 1.5, 1.5],
    material_mode: r ? "checker" : "textured",
    keyframes: [],
    enabled: !0
  };
  e.state.objects.push(o), e.selectedEntity = "object", e.selectedObjectId = a, e.selectedKeyFrame = null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render();
}
async function ce(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  if (!a) return;
  const r = (await q(z, n("Rename object"), n("Object name"), a.name || a.type))?.trim();
  !r || r === a.name || (e.checkpoint("Rename object"), a.name = r.slice(0, 80), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(n(`Object renamed: ${a.name}`)));
}
function se(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  if (!a) return;
  e.checkpoint("Duplicate object");
  const r = JSON.parse(JSON.stringify(a));
  r.id = `${a.type}_${Date.now().toString(36)}`, r.name = `${a.name || a.type} Copy`, r.position = O(r.position || [0, 0, 0], [0.35, 0, 0.35]), r.asset && delete r.asset, e.state.objects.push(r), e.selectedEntity = "object", e.selectedObjectId = r.id, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(n(`${r.name} added`));
}
function me(e, t) {
  const a = e.state.objects.find((r) => r.id === t);
  a && (e.checkpoint(a.enabled === !1 ? "Show object" : "Hide object"), a.enabled = a.enabled === !1, e.serialize(), e.refreshObjects(), e.render(), e.setStatus(n(`${a.name || a.type} ${a.enabled ? "shown" : "hidden"}`)));
}
async function le(e, t) {
  if (t === "subject") return e.setStatus(n("The subject card cannot be deleted"));
  const a = e.state.objects.find((r) => r.id === t);
  if (a && await _(z, n("Delete object"), n(`Delete ${a.name || a.type} and its ${(a.keyframes || []).length} keyframe(s)?`))) {
    e.checkpoint("Delete object");
    for (const r of e.state.objects) r.parent_id === t && (r.parent_id = null);
    e.state.objects = e.state.objects.filter((r) => r.id !== t), e.removeObjectResources(t), e.selectedObjectId === t && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = e.state.keyframes.find((r) => r.frame === e.frame)?.frame ?? null), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(n(`${a.name || a.type} deleted`));
  }
}
function de(e) {
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
function x(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function fe(e) {
  const t = x(e), a = e.root.querySelector('[data-role="object-panel"]'), r = e.root.querySelector('[data-role="camera-panel"]');
  a.hidden = !t, r.hidden = !!t;
  const o = (m) => e.root.querySelector(m);
  if (!t) {
    const m = e.activeCameraTrack();
    o('[data-role="selected-name"]').textContent = `${m.name} · F${e.frame}`, o('[data-role="curve-title"]').textContent = n(`${m.name} Curve Editor`);
    const k = o('[data-role="curve-group"]').options;
    k[0].textContent = n("Position XYZ"), k[1].textContent = n("Target XYZ"), k[2].textContent = n("FOV / Roll / Zoom");
    const b = [...e.camera.position, ...e.camera.target, e.camera.fov, e.camera.roll || 0, e.camera.near, e.camera.far];
    ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"].forEach((v, p) => {
      o(`[data-role="${v}"]`).value = String(Math.round(b[p] * 1e4) / 1e4);
    });
    return;
  }
  const c = t.position || [0, 0, 0];
  o('[data-role="selected-name"]').textContent = t.name || t.type, o('[data-role="curve-title"]').textContent = n(`${t.name || t.type} Curve Editor`);
  const s = o('[data-role="curve-group"]').options;
  s[0].textContent = n("Position XYZ"), s[1].textContent = n("Rotation XYZ"), s[2].textContent = n("Scale XYZ"), o('[data-role="object-material"]').value = t.material_mode || "textured", o('[data-role="object-x"]').value = String(c[0]), o('[data-role="object-y"]').value = String(c[1]), o('[data-role="object-z"]').value = String(c[2]);
  const l = t.rotation || [0, 0, 0], d = t.size || [1, 1, 1];
  for (let m = 0; m < 3; m++)
    o(`[data-role="object-r${"xyz"[m]}"]`).value = String(l[m]), o(`[data-role="object-s${"xyz"[m]}"]`).value = String(d[m] ?? d[0] ?? 1);
  for (const m of e.root.querySelectorAll("[data-transform-mode]")) m.classList.toggle("active", m.dataset.transformMode === (e.state.gizmo_mode || "translate"));
  const i = o('[data-role="animation-row"]'), y = o('[data-role="animation-select"]'), f = o('[data-role="object-parent"]');
  if (f) {
    const m = t.id;
    f.innerHTML = "";
    const k = document.createElement("option");
    k.value = "", k.textContent = n("No parent"), f.appendChild(k);
    const b = /* @__PURE__ */ new Set([m]);
    let v = !0;
    for (; v; ) {
      v = !1;
      for (const p of e.state.objects)
        !b.has(p.id) && p.parent_id && b.has(p.parent_id) && (b.add(p.id), v = !0);
    }
    for (const p of e.state.objects) {
      if (b.has(p.id)) continue;
      const F = document.createElement("option");
      F.value = p.id, F.textContent = p.name || p.type, f.appendChild(F);
    }
    f.value = t.parent_id || "";
  }
  const E = e.modelInfoById.get(t.id);
  i.hidden = !E?.animations, y.innerHTML = "";
  for (const [m, k] of (E?.animationNames || []).entries()) {
    const b = document.createElement("option");
    b.value = String(m), b.textContent = k, y.appendChild(b);
  }
  y.value = String(t.animation_index || 0);
}
function ie(e) {
  const t = x(e);
  if (!t) return;
  const a = (r) => e.root.querySelector(r);
  t.position = ["object-x", "object-y", "object-z"].map((r) => Number(a(`[data-role="${r}"]`).value)), t.rotation = ["object-rx", "object-ry", "object-rz"].map((r) => Number(a(`[data-role="${r}"]`).value)), t.size = ["object-sx", "object-sy", "object-sz"].map((r) => Math.max(0.01, Number(a(`[data-role="${r}"]`).value))), e.commitObjectEdit(t), e.refreshObjects(), e.render();
}
function I(e, t) {
  if (!t) return null;
  if (t.locked)
    return e.setStatus(n(`${t.name || t.type} is locked`)), null;
  t.keyframes ||= [];
  let a = t.keyframes?.find((r) => r.frame === (e.state.auto_key ? e.frame : e.selectedKeyFrame));
  return !a && e.state.auto_key && (a = { frame: e.frame, transform: S(t), interpolation: e.root.querySelector('[data-role="interp"]').value }, t.keyframes.push(a), t.keyframes.sort((r, o) => r.frame - o.frame)), a && (e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame, e.updateKeyVisualState()), a;
}
function ye(e, t) {
  const a = I(e, t);
  a && (a.transform = S(t)), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor();
}
function pe(e) {
  const t = (a, r) => {
    const o = Number(e.root.querySelector(`[data-role="${a}"]`).value);
    return Number.isFinite(o) ? o : r;
  };
  e.camera.position = [t("camera-px", e.camera.position[0]), t("camera-py", e.camera.position[1]), t("camera-pz", e.camera.position[2])], e.camera.target = [t("camera-tx", e.camera.target[0]), t("camera-ty", e.camera.target[1]), t("camera-tz", e.camera.target[2])], e.camera.fov = $(t("camera-fov", e.camera.fov), 5, 150), e.camera.roll = $(t("camera-roll", e.camera.roll || 0), -180, 180), e.camera.near = Math.max(1e-4, t("camera-near", e.camera.near)), e.camera.far = Math.max(e.camera.near + 1e-4, t("camera-far", e.camera.far)), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.refreshInspector();
}
function be(e, t) {
  const a = x(e);
  if (!a) return;
  e.checkpoint("Set parent"), a.parent_id = t || null, e.serialize(), e.refreshObjects(), e.render();
  const r = e.state.objects.find((o) => o.id === t);
  e.setStatus(r ? n(`${a.name || a.type} parented to ${r.name || r.type}`) : n(`${a.name || a.type} unparented`));
}
function ke(e, t) {
  const a = x(e);
  a && (a.animation_index = Math.max(0, t || 0), e.serialize(), e.webgl?.selectAnimation(a.id, t), e.setStatus(n(`Animation: ${e.modelInfoById.get(a.id)?.animationNames?.[t] || t + 1}`)));
}
function je(e) {
  const t = e.root.querySelector('[data-role="objects"]');
  t.innerHTML = "";
  const a = (r, o, c) => {
    const s = document.createElement("span");
    s.style.cssText = "margin-left:auto;display:flex;gap:2px";
    const l = c === "camera" ? [["locked", "pi-lock", "Lock track"], ["muted", "pi-volume-off", "Mute track"], ["solo", "pi-star", "Solo track"]] : [["locked", "pi-lock", "Lock object"]];
    for (const [d, i, y] of l) {
      const f = document.createElement("button");
      f.type = "button", f.className = "icon-button", f.style.cssText = `width:18px;height:18px;min-width:18px;padding:0;${o[d] ? "color:#f2d06b;border-color:#6b5a2e" : "opacity:.45"}`, f.title = n(y), f.innerHTML = `<i class="pi ${i}" style="font-size:10px"></i>`, f.addEventListener("click", (E) => {
        E.stopPropagation(), r.checkpoint(`${y}`), o[d] = !o[d], r.serialize(), r.refreshObjects(), r.renderCameraView();
      }), s.appendChild(f);
    }
    return s;
  };
  for (const r of e.state.cameras) {
    const o = document.createElement("button");
    o.type = "button", o.dataset.cameraId = r.id, o.className = `scene-item${e.selectedEntity === "camera" && r.id === e.state.active_camera_id ? " selected" : ""}`;
    const c = document.createElement("i");
    c.className = "pi pi-video";
    const s = document.createElement("span");
    s.textContent = `${r.id === e.state.playblast_camera_id ? "● " : ""}${r.name}${r.muted ? " (muted)" : ""}`, o.append(c, s, a(e, r, "camera")), o.title = r.id === e.state.playblast_camera_id ? n("Active playblast camera") : n("Click to edit this camera"), o.addEventListener("click", () => e.activateCamera(r.id)), t.appendChild(o);
  }
  for (const r of e.state.objects) {
    const o = document.createElement("button");
    o.type = "button", o.dataset.objectId = r.id, o.className = `scene-item${e.selectedEntity === "object" && r.id === e.selectedObjectId ? " selected" : ""}`;
    const c = document.createElement("span");
    c.innerHTML = `<i class="pi ${r.type === "card" ? "pi-image" : r.type === "model" || r.type === "glb" ? "pi-box" : "pi-circle"}"></i> ${r.enabled === !1 ? "○" : "●"} ${r.name || r.type}`, o.append(c, a(e, r, "object")), o.title = n("Click to select · Double-click to show/hide · Right-click for object actions"), o.addEventListener("click", (s) => {
      if (s.altKey && r.id !== "subject") return void e.deleteObject(r.id);
      e.selectedEntity = "object", e.selectedObjectId = r.id, e.selectedKeyFrame = r.keyframes?.find((l) => l.frame === e.frame)?.frame ?? null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render();
    }), o.addEventListener("dblclick", () => e.toggleObject(r.id)), t.appendChild(o);
  }
  e.refreshInspector();
}
function he(e, t) {
  e.objectUrls.revoke(t), e.cardMediaById.delete(t), e.modelUrlsById.delete(t), e.modelInfoById.delete(t), e.webgl?.removeModel(t);
}
export {
  de as addMediaCard,
  ne as addPrimitive,
  V as applyObjectAnimationFrame,
  u as beginCameraEdit,
  I as beginObjectEdit,
  Z as commitCameraEdit,
  ye as commitObjectEdit,
  H as copyKeyframe,
  P as deleteKeyframe,
  le as deleteObject,
  se as duplicateObject,
  X as exitKeyEdit,
  U as finishCameraEdit,
  oe as goToAdjacentKey,
  B as insertKeyframe,
  re as loadSelectedKeyView,
  R as pasteKeyframe,
  D as playblastCameraAtFrame,
  fe as refreshInspector,
  W as refreshKeyEditor,
  je as refreshObjects,
  he as removeObjectResources,
  ce as renameObject,
  ee as retimeSelectedKey,
  Y as selectKeyframe,
  ke as selectObjectAnimation,
  K as selectedKeyframe,
  x as selectedObject,
  be as setObjectParent,
  g as timelineKeyframes,
  h as timelineObject,
  J as toggleAutoKey,
  me as toggleObject,
  pe as updateCameraFromHud,
  G as updateEditState,
  ae as updateKeyFromView,
  Q as updateKeyVisualState,
  te as updateSelectedKey,
  ie as updateSelectedObject
};
