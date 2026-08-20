import "../../scripts/app.js";
import { cloneCamera as v, cloneTransform as O, sampleCamera as u, clamp as w } from "./omnicam-core.js";
import "./omnicam-ui.js";
import { t as p } from "./omnicam-i18n.js";
import { playblastCameraTrack as I } from "./omnicam-state-sync.js";
import { cloneTransform as _, add as M, clamp as A } from "./omnicam-core.js";
import { confirmAction as N, promptText as L } from "./omnicam-ui.js";
import { t as i } from "./omnicam-i18n.js";
function X(e, t) {
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
async function G(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  if (!a) return;
  const r = (await L(e.app, i("Rename object"), i("Object name"), a.name || a.type))?.trim();
  !r || r === a.name || (e.checkpoint("Rename object"), a.name = r.slice(0, 80), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(i(`Object renamed: ${a.name}`)));
}
function J(e, t) {
  const a = e.state.objects.find((o) => o.id === t);
  if (!a) return;
  e.checkpoint("Duplicate object");
  const r = JSON.parse(JSON.stringify(a));
  r.id = `${a.type}_${Date.now().toString(36)}`, r.name = `${a.name || a.type} Copy`, r.position = M(r.position || [0, 0, 0], [0.35, 0, 0.35]), r.asset && delete r.asset, e.state.objects.push(r), e.selectedEntity = "object", e.selectedObjectId = r.id, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(i(`${r.name} added`));
}
function W(e, t) {
  const a = e.state.objects.find((r) => r.id === t);
  a && (e.checkpoint(a.enabled === !1 ? "Show object" : "Hide object"), a.enabled = a.enabled === !1, e.serialize(), e.refreshObjects(), e.render(), e.setStatus(i(`${a.name || a.type} ${a.enabled ? "shown" : "hidden"}`)));
}
async function Q(e, t) {
  if (t === "subject") return e.setStatus(i("The subject card cannot be deleted"));
  const a = e.state.objects.find((r) => r.id === t);
  if (a && await N(e.app, i("Delete object"), i(`Delete ${a.name || a.type} and its ${(a.keyframes || []).length} keyframe(s)?`))) {
    e.checkpoint("Delete object");
    for (const r of e.state.objects) r.parent_id === t && (r.parent_id = null);
    e.state.objects = e.state.objects.filter((r) => r.id !== t), e.removeObjectResources(t), e.selectedObjectId === t && (e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = e.state.keyframes.find((r) => r.frame === e.frame)?.frame ?? null), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(i(`${a.name || a.type} deleted`));
  }
}
function ee(e) {
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
function z(e) {
  return e.selectedEntity === "object" && e.state.objects.find((t) => t.id === e.selectedObjectId) || null;
}
function te(e) {
  const t = z(e), a = e.root.querySelector('[data-role="object-panel"]');
  a && (a.hidden = !t);
  const r = (f) => e.root.querySelector(f), o = e.activeCameraTrack(), n = r('[data-role="camera-target-object"]');
  if (n) {
    const f = o.target_object_id || e.state.target_object_id || "";
    n.innerHTML = "";
    const k = document.createElement("option");
    k.value = "", k.textContent = i("Manual Target (No Tracking)"), n.appendChild(k);
    for (const y of e.state.objects) {
      const x = document.createElement("option");
      x.value = y.id, x.textContent = `${i("Track:")} ${y.name || y.type}`, n.appendChild(x);
    }
    n.value = f;
  }
  const s = [...e.camera.position, ...e.camera.target, e.camera.fov, e.camera.roll || 0, e.camera.near, e.camera.far];
  ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"].forEach((f, k) => {
    for (const y of e.root.querySelectorAll(`[data-role="${f}"]`))
      document.activeElement !== y && (y.value = String(Math.round(s[k] * 1e4) / 1e4));
  });
  for (const f of e.root.querySelectorAll('[data-role="camera-type"]'))
    document.activeElement !== f && (f.value = e.camera.camera_type || "perspective");
  for (const f of e.root.querySelectorAll('[data-role="speed"]'))
    document.activeElement !== f && (f.value = String(e.cameraSpeed || 1));
  for (const f of e.root.querySelectorAll('[data-role="active-camera-select"]'))
    document.activeElement !== f && (f.value = e.state.active_camera_id);
  for (const f of e.root.querySelectorAll('[data-role="camera-color"]'))
    document.activeElement !== f && (f.value = o?.color || "#4aa3ef");
  if (!t) {
    const f = r('[data-role="selected-name"]');
    f && (f.textContent = `${o.name} · F${e.frame}`);
    const k = r('[data-role="curve-title"]');
    k && (k.textContent = i(`${o.name} Curve Editor`));
    const y = r('[data-role="curve-group"]');
    y && y.options.length >= 3 && (y.options[0].textContent = i("Position XYZ"), y.options[1].textContent = i("Target XYZ"), y.options[2].textContent = i("FOV / Roll / Zoom"));
    return;
  }
  const m = t.position || [0, 0, 0], d = r('[data-role="selected-name"]');
  d && (d.textContent = t.name || t.type);
  const c = r('[data-role="curve-title"]');
  c && (c.textContent = i(`${t.name || t.type} Curve Editor`));
  const l = r('[data-role="curve-group"]');
  l && l.options.length >= 3 && (l.options[0].textContent = i("Position XYZ"), l.options[1].textContent = i("Rotation XYZ"), l.options[2].textContent = i("Scale XYZ"));
  const b = t.rotation || [0, 0, 0], h = t.size || [1, 1, 1], j = {
    "object-x": m[0],
    "object-y": m[1],
    "object-z": m[2],
    "object-rx": b[0],
    "object-ry": b[1],
    "object-rz": b[2],
    "object-sx": h[0] ?? 1,
    "object-sy": h[1] ?? 1,
    "object-sz": h[2] ?? 1
  };
  for (const [f, k] of Object.entries(j))
    for (const y of e.root.querySelectorAll(`[data-role="${f}"]`))
      document.activeElement !== y && (y.value = String(Math.round(k * 1e4) / 1e4));
  for (const f of e.root.querySelectorAll('[data-role="object-material"]'))
    document.activeElement !== f && (f.value = t.material_mode || "textured");
  for (const f of e.root.querySelectorAll('[data-role="object-color"]'))
    document.activeElement !== f && (f.value = t.color || "#8c929b");
  for (const f of e.root.querySelectorAll("[data-transform-mode]")) f.classList.toggle("active", f.dataset.transformMode === (e.state.gizmo_mode || "translate"));
  const C = r('[data-role="animation-row"]'), F = r('[data-role="animation-select"]'), $ = r('[data-role="object-parent"]');
  if ($) {
    const f = t.id;
    $.innerHTML = "";
    const k = document.createElement("option");
    k.value = "", k.textContent = i("No parent"), $.appendChild(k);
    const y = /* @__PURE__ */ new Set([f]);
    let x = !0;
    for (; x; ) {
      x = !1;
      for (const g of e.state.objects)
        !y.has(g.id) && g.parent_id && y.has(g.parent_id) && (y.add(g.id), x = !0);
    }
    for (const g of e.state.objects) {
      if (y.has(g.id)) continue;
      const q = document.createElement("option");
      q.value = g.id, q.textContent = g.name || g.type, $.appendChild(q);
    }
    $.value = t.parent_id || "";
  }
  const T = e.modelInfoById.get(t.id);
  if (C && (C.hidden = !T?.animations), F) {
    F.innerHTML = "";
    for (const [f, k] of (T?.animationNames || []).entries()) {
      const y = document.createElement("option");
      y.value = String(f), y.textContent = k, F.appendChild(y);
    }
    F.value = String(t.animation_index || 0);
  }
}
function ae(e) {
  const t = z(e);
  if (!t) return;
  const a = (s, m) => {
    const d = e.root.querySelector(`[data-role="${s}"]`);
    if (!d || d.value === "") return m;
    const c = Number(d.value);
    return Number.isFinite(c) ? c : m;
  }, r = t.position || [0, 0, 0], o = t.rotation || [0, 0, 0], n = t.size || [1, 1, 1];
  t.position = [a("object-x", r[0]), a("object-y", r[1]), a("object-z", r[2])], t.rotation = [a("object-rx", o[0]), a("object-ry", o[1]), a("object-rz", o[2])], t.size = [Math.max(0.01, a("object-sx", n[0])), Math.max(0.01, a("object-sy", n[1])), Math.max(0.01, a("object-sz", n[2]))], e.commitObjectEdit(t), e.refreshObjects(), e.render();
}
function B(e, t) {
  if (!t) return null;
  if (t.locked)
    return e.setStatus(i(`${t.name || t.type} is locked`)), null;
  t.keyframes ||= [];
  let a = t.keyframes?.find((r) => r.frame === (e.state.auto_key ? e.frame : e.selectedKeyFrame));
  return !a && e.state.auto_key && (a = { frame: e.frame, transform: _(t), interpolation: e.root.querySelector('[data-role="interp"]')?.value || "ease" }, t.keyframes.push(a), t.keyframes.sort((r, o) => r.frame - o.frame)), a && (e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame, e.updateKeyVisualState()), a;
}
function re(e, t) {
  const a = B(e, t);
  a && (a.transform = _(t)), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor();
}
function oe(e) {
  const t = (a, r) => {
    const o = e.root.querySelector(`[data-role="${a}"]`);
    if (!o || o.value === "") return r;
    const n = Number(o.value);
    return Number.isFinite(n) ? n : r;
  };
  e.camera.position = [t("camera-px", e.camera.position[0]), t("camera-py", e.camera.position[1]), t("camera-pz", e.camera.position[2])], e.camera.target = [t("camera-tx", e.camera.target[0]), t("camera-ty", e.camera.target[1]), t("camera-tz", e.camera.target[2])], e.camera.fov = A(t("camera-fov", e.camera.fov), 5, 150), e.camera.roll = A(t("camera-roll", e.camera.roll || 0), -180, 180), e.camera.near = Math.max(1e-4, t("camera-near", e.camera.near)), e.camera.far = Math.max(e.camera.near + 1e-4, t("camera-far", e.camera.far)), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.render();
}
function ne(e, t) {
  const a = z(e);
  if (!a) return;
  e.checkpoint("Set parent"), a.parent_id = t || null, e.serialize(), e.refreshObjects(), e.render();
  const r = e.state.objects.find((o) => o.id === t);
  e.setStatus(r ? i(`${a.name || a.type} parented to ${r.name || r.type}`) : i(`${a.name || a.type} unparented`));
}
function ce(e, t) {
  const a = z(e);
  a && (a.animation_index = Math.max(0, t || 0), e.serialize(), e.webgl?.selectAnimation(a.id, t), e.setStatus(i(`Animation: ${e.modelInfoById.get(a.id)?.animationNames?.[t] || t + 1}`)));
}
function se(e) {
  const t = e.root.querySelector('[data-role="objects"]');
  t.innerHTML = "";
  const a = (r, o, n) => {
    const s = document.createElement("span");
    s.style.cssText = "margin-left:auto;display:flex;gap:2px";
    const m = n === "camera" ? [["locked", "pi-lock", "Lock track"], ["muted", "pi-volume-off", "Mute track"], ["solo", "pi-star", "Solo track"]] : [["locked", "pi-lock", "Lock object"]];
    for (const [d, c, l] of m) {
      const b = document.createElement("button");
      b.type = "button", b.className = "icon-button", b.style.cssText = `width:18px;height:18px;min-width:18px;padding:0;${o[d] ? "color:#f2d06b;border-color:#6b5a2e" : "opacity:.45"}`, b.title = i(l), b.innerHTML = `<i class="pi ${c}" style="font-size:10px"></i>`, b.addEventListener("click", (h) => {
        h.stopPropagation(), r.checkpoint(`${l}`), o[d] = !o[d], r.serialize(), r.refreshObjects(), r.renderCameraView();
      }), s.appendChild(b);
    }
    return s;
  };
  for (const r of e.state.cameras) {
    const o = document.createElement("button");
    o.type = "button", o.dataset.cameraId = r.id;
    const n = r.id === e.state.active_camera_id, s = r.id === e.state.playblast_camera_id, m = e.selectedEntity === "camera" && n;
    o.className = `scene-item${m ? " selected" : ""}${n && !m ? " active-view" : ""}`;
    const d = document.createElement("i");
    d.className = "pi pi-video";
    const c = document.createElement("span");
    if (m || n) {
      const l = document.createElement("span");
      l.style.cssText = `color:${m ? "#f59e0b" : "#58cc6b"};font-weight:700`, l.textContent = m ? "● " : "○ ", c.appendChild(l);
    }
    if (c.appendChild(document.createTextNode(r.name)), s) {
      const l = document.createElement("span");
      l.style.cssText = "color:#f2d06b;font-size:10px", l.title = "Playblast Output", l.textContent = " ★", c.appendChild(l);
    }
    if (r.muted) {
      const l = document.createElement("span");
      l.style.opacity = ".6", l.textContent = " (muted)", c.appendChild(l);
    }
    o.append(d, c, a(e, r, "camera")), o.title = m ? i("Currently selected for editing") : s ? i("Active playblast camera") : i("Click to select & activate this camera"), o.addEventListener("click", () => {
      e.selectedEntity = "camera", e.selectedObjectId = null, e.activateCamera(r.id), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(i(`Editing: ${r.name}`));
    }), t.appendChild(o);
  }
  for (const r of e.state.objects) {
    const o = document.createElement("button");
    o.type = "button", o.dataset.objectId = r.id;
    const n = e.selectedEntity === "object" && r.id === e.selectedObjectId;
    o.className = `scene-item${n ? " selected" : ""}`;
    const s = r.type === "card" ? "pi-image" : r.type === "model" || r.type === "glb" ? "pi-box" : r.type === "ground" ? "pi-minus" : r.type === "cube" ? "pi-stop" : r.type === "sphere" ? "pi-circle" : r.type === "human" ? "pi-user" : "pi-plus", m = r.enabled !== !1, d = !!r.load_error, c = document.createElement("span"), l = document.createElement("i");
    l.className = `pi ${d ? "pi-exclamation-triangle" : s}`, l.style.cssText = d ? "color:#f87171" : m ? "" : "opacity:.4";
    const b = document.createElement("span");
    if (b.style.cssText = d ? "color:#fca5a5" : m ? "" : "opacity:.5;text-decoration:line-through", b.textContent = r.name || r.type, c.append(l, document.createTextNode(" "), b), d) {
      const j = document.createElement("span");
      j.style.cssText = "color:#ef4444;font-size:9px;font-weight:700", j.textContent = " [Format!]", c.appendChild(j);
    }
    const h = document.createElement("button");
    h.type = "button", h.className = "icon-button", h.style.cssText = "width:18px;height:18px;min-width:18px;padding:0;margin-left:auto;opacity:.65", h.title = m ? i("Hide object") : i("Show object"), h.innerHTML = `<i class="pi ${m ? "pi-eye" : "pi-eye-slash"}" style="font-size:10px"></i>`, h.addEventListener("click", (j) => {
      j.stopPropagation(), e.toggleObject(r.id);
    }), o.append(c, h, a(e, r, "object")), o.title = i("Click to select · Double-click to toggle visibility · Right-click for actions"), o.addEventListener("click", (j) => {
      if (j.altKey && r.id !== "subject") return void e.deleteObject(r.id);
      e.selectedEntity = "object", e.selectedObjectId = r.id, e.selectedKeyFrame = r.keyframes?.find((C) => C.frame === e.frame)?.frame ?? null, e.serialize(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(i(`Editing: ${r.name || r.type}`));
    }), o.addEventListener("dblclick", () => e.toggleObject(r.id)), t.appendChild(o);
  }
  e.refreshInspector();
}
function le(e, t) {
  e.objectUrls.revoke(t), e.cardMediaById.delete(t), e.modelUrlsById.delete(t), e.modelInfoById.delete(t), e.webgl?.removeModel(t);
}
function me(e, t) {
  return t(I(e), e.frame);
}
function K(e) {
  return e.selectedEntity === "object" ? selectedObject(e) : null;
}
function S(e) {
  return K(e)?.keyframes || e.state.keyframes;
}
function de(e, t) {
  for (const a of e.state.objects) {
    if (!a.keyframes?.length) continue;
    const r = t(a, e.frame);
    a.position = r.position, a.rotation = r.rotation, a.size = r.size;
  }
}
function fe(e) {
  e.checkpoint("Set keyframe");
  const t = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease", a = K(e), r = S(e), o = a ? { frame: e.frame, transform: O(a), interpolation: t } : { frame: e.frame, camera: v(e.camera), interpolation: t }, n = r.findIndex((s) => s.frame === e.frame);
  n >= 0 ? r[n] = o : r.push(o), r.sort((s, m) => s.frame - m.frame), e.selectedKeyFrame = e.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([e.frame]), e.editingKeyFrame = null, e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.drawCurveEditor(), e.setStatus(p(`${a?.name || "Camera"} ${n >= 0 ? "key updated" : "key inserted"} @ ${e.frame}`));
}
function ie(e, t) {
  const a = E(e);
  if (!a) return;
  e.checkpoint("Change key interpolation"), a.interpolation = t;
  const r = e.root.querySelector('[data-role="key-interp"]');
  r && (r.value = t);
  for (const o of e.root.querySelectorAll("[data-interp]"))
    o.classList.toggle("active", o.dataset.interp === t);
  e.serialize(), e.refreshKeys(), e.refreshKeyEditor(), e.drawCurveEditor(), e.setStatus(p(`Key @ ${a.frame} interpolation set to ${t}`));
}
function ye(e) {
  const t = K(e), a = S(e);
  if (!t && a.length <= 1) return e.setStatus(p("Keep at least one camera keyframe"));
  const r = E(e) || a.find((s) => s.frame === e.frame);
  if (!r) return e.setStatus(p("Select a keyframe to delete"));
  e.checkpoint("Delete keyframe"), t ? t.keyframes = a.filter((s) => s !== r) : e.state.keyframes = a.filter((s) => s !== r);
  const o = S(e), n = r.frame;
  e.editingKeyFrame === n && (e.editingKeyFrame = null), e.selectedKeyFrame = o.length ? o.reduce((s, m) => Math.abs(m.frame - n) < Math.abs(s.frame - n) ? m : s).frame : null, e.camera = u(e.state, e.frame), e.applyObjectAnimationFrame(), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(p(`${t?.name || "Camera"} key deleted @ ${n}`));
}
function pe(e) {
  const t = K(e), a = E(e) || S(e).find((r) => r.frame === e.frame);
  e.copiedKeyframe = t ? { kind: "object", transform: O(a?.transform || t), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" } : { kind: "camera", camera: v(a?.camera || e.camera), interpolation: a?.interpolation || e.root.querySelector('[data-role="interp"]')?.value || "ease" }, e.setStatus(p(`Keyframe copied @ ${a?.frame ?? e.frame}`));
}
function be(e) {
  if (!e.copiedKeyframe) return e.setStatus(p("Copy a keyframe first"));
  const t = K(e), a = t ? "object" : "camera";
  if (e.copiedKeyframe.kind !== a) return e.setStatus(p(`Copy a ${a} keyframe first`));
  e.checkpoint("Paste keyframe");
  const r = t ? { frame: e.frame, transform: O(e.copiedKeyframe.transform), interpolation: e.copiedKeyframe.interpolation } : { frame: e.frame, camera: v(e.copiedKeyframe.camera), interpolation: e.copiedKeyframe.interpolation }, o = S(e), n = o.findIndex((s) => s.frame === e.frame);
  n >= 0 ? o[n] = r : o.push(r), o.sort((s, m) => s.frame - m.frame), e.selectedKeyFrame = r.frame, e.editingKeyFrame = null, t ? (t.position = [...r.transform.position], t.rotation = [...r.transform.rotation], t.size = [...r.transform.size]) : e.camera = v(r.camera), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(p(`Keyframe pasted @ ${r.frame}`));
}
function E(e) {
  return S(e).find((t) => t.frame === e.selectedKeyFrame) || null;
}
function ke(e, t) {
  t && (e.selectedKeyFrame = t.frame, e.selectedKeyFrames = /* @__PURE__ */ new Set([t.frame]), e.editingKeyFrame = null, e.setFrame(t.frame));
}
function he(e) {
  const t = e.activeCameraTrack();
  if (t?.locked)
    return e.setStatus(p(`${t.name} is locked`)), null;
  let a = e.state.keyframes.find((r) => r.frame === e.frame);
  return !a && e.selectedEntity === "camera" && e.selectedKeyFrame !== null && (a = e.state.keyframes.find((r) => r.frame === e.selectedKeyFrame)), !a && e.state.auto_key && (a = { frame: e.frame, camera: v(e.camera), interpolation: e.root.querySelector('[data-role="key-interp"]')?.value || "ease" }, e.state.keyframes.push(a), e.state.keyframes.sort((r, o) => r.frame - o.frame), e.refreshKeys()), e.cameraEditKey = a || null, a && (e.selectedKeyFrame = a.frame, e.editingKeyFrame = a.frame), e.cameraEditActive = !0, e.updateKeyVisualState(), a;
}
function je(e) {
  const t = e.cameraEditKey;
  t && (t.camera = v(e.camera), e.frame = t.frame, e.selectedKeyFrame = t.frame), e.scheduleSerialize(), e.refreshKeyEditor(), e.updateKeyVisualState(), e.render();
}
function ge(e) {
  if (e.cameraEditActive) {
    if (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, e.selectedKeyFrame === null) {
      const t = e.state.keyframes.find((a) => a.frame === e.frame);
      t && (e.selectedKeyFrame = t.frame);
    }
    e.refreshKeys();
  }
}
function ve(e, t = !1) {
  e.editingKeyFrame === null && (!t || e.selectedKeyFrame === null) || (e.cameraEditActive = !1, e.cameraEditKey = null, e.editingKeyFrame = null, t && (e.selectedKeyFrame = null), e.refreshKeys());
}
function Ke(e) {
  e.state.auto_key = !e.state.auto_key, e.state.auto_key || e.exitKeyEdit(!1), e.serialize(), e.updateEditState(), e.setStatus(p(`Auto Key ${e.state.auto_key ? "on" : "off"}`));
}
function Se(e) {
  const t = e.root.querySelector(".viewport-wrap"), a = e.editingKeyFrame !== null, r = !!e.state.auto_key;
  t && (t.classList.toggle("edit-mode", a), t.classList.toggle("auto-key", r));
  for (const c of e.root.querySelectorAll('[data-act="auto-key"]'))
    c.classList.toggle("active", r), c.setAttribute("aria-pressed", String(r)), c.title = p(`Auto Key ${r ? "on" : "off"}`);
  const o = e.activeCameraTrack(), n = e.selectedObject(), s = e.root.querySelector('[data-role="tally-banner"]'), m = e.root.querySelector('[data-role="tally-text"]');
  if (s && m)
    if (a) {
      s.hidden = !1;
      const c = n ? n.name || n.type : o.name;
      m.textContent = `REC KEY @ F${e.editingKeyFrame} (${c})`;
    } else r ? (s.hidden = !1, m.textContent = `● AUTO-KEY ON (F${e.frame})`) : s.hidden = !0;
  const d = e.root.querySelector('[data-role="viewport-state"]');
  d && (a ? d.textContent = n ? `● EDITING ${n.name || n.type} @ F${e.editingKeyFrame}${r ? " · AUTO KEY" : ""}` : `● EDITING ${o.name} @ F${e.editingKeyFrame}${r ? " · AUTO KEY" : ""}` : r ? d.textContent = n ? `● AUTO KEY · ${n.name || n.type}` : `● AUTO KEY · ${o.name}` : n ? d.textContent = `SELECTED: ${n.name || n.type}` : d.textContent = e.state.view_mode === "camera" ? `CAMERA: ${o.name}` : `VIEW: ${e.state.view_mode.toUpperCase()}`);
}
function Ee(e) {
  const t = e.selectedKeyFrames || (e.selectedKeyFrame === null ? /* @__PURE__ */ new Set() : /* @__PURE__ */ new Set([e.selectedKeyFrame]));
  for (const a of e.root.querySelectorAll("[data-key-frame]")) {
    const r = Number(a.dataset.keyFrame);
    a.classList.toggle("selected", t.has(r)), a.classList.toggle("editing", r === e.editingKeyFrame), a.classList.toggle("at-playhead", r === e.frame);
  }
  e.updateEditState();
}
function xe(e) {
  const t = K(e), a = E(e), r = e.root.querySelector('[data-role="key-editor"]');
  r && (r.dataset.empty = String(!a));
  const o = e.root.querySelector('[data-role="selected-key-label"]');
  o && (o.textContent = a ? p(`${t?.name || "Camera"} Key @ ${a.frame}`) : p(`No ${t ? "object" : "camera"} key selected`));
  const n = ["key-frame", "key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"];
  for (const c of n) {
    const l = e.root.querySelector(`[data-role="${c}"]`);
    l && (l.disabled = !a || !!(t && !["key-frame", "key-interp"].includes(c)));
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
    const l = e.root.querySelector('[data-role="key-interp"]');
    l && document.activeElement !== l && (l.value = a.interpolation);
    return;
  }
  const d = {
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
  for (const [c, l] of Object.entries(d)) {
    const b = e.root.querySelector(`[data-role="${c}"]`);
    b && document.activeElement !== b && (b.value = String(l));
  }
}
function $e(e, t, a = !1) {
  const r = E(e);
  if (!r) return;
  const o = S(e);
  let n = w(Math.round(t), 0, e.state.duration_frames - 1);
  const s = (d) => o.some((c) => c !== r && c.frame === d);
  if (s(n) && a)
    for (let d = 1; d < e.state.duration_frames; d++) {
      const c = [n - d, n + d].filter((l) => l >= 0 && l < e.state.duration_frames).find((l) => !s(l));
      if (c !== void 0) {
        n = c;
        break;
      }
    }
  if (s(n))
    return e.refreshKeyEditor(), e.setStatus(p(`Frame ${n} already has a keyframe`));
  if (n === r.frame) return;
  const m = e.editingKeyFrame === r.frame;
  r.frame = n, e.selectedKeyFrame = n, e.editingKeyFrame = m ? n : null, e.frame = n, o.sort((d, c) => d.frame - c.frame), e.serialize(), e.setFrame(n), e.setStatus(p(`Keyframe moved to ${n}`));
}
function Ce(e) {
  const t = E(e);
  if (!t) return;
  if (e.editingKeyFrame = t.frame, K(e)) {
    t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.transform = O(K(e)), e.serialize(), e.setFrame(t.frame), e.setStatus(p(`Object keyframe updated @ ${t.frame}`));
    return;
  }
  const a = (r, o) => {
    const n = Number(e.root.querySelector(`[data-role="${r}"]`).value);
    return Number.isFinite(n) ? n : o;
  };
  t.interpolation = e.root.querySelector('[data-role="key-interp"]').value, t.camera.position = [a("key-px", t.camera.position[0]), a("key-py", t.camera.position[1]), a("key-pz", t.camera.position[2])], t.camera.target = [a("key-tx", t.camera.target[0]), a("key-ty", t.camera.target[1]), a("key-tz", t.camera.target[2])], t.camera.fov = w(a("key-fov", t.camera.fov), 5, 150), t.camera.roll = w(a("key-roll", t.camera.roll || 0), -180, 180), t.camera.zoom = Math.max(0.01, a("key-zoom", t.camera.zoom || 1)), t.camera.near = Math.max(1e-4, a("key-near", t.camera.near)), t.camera.far = Math.max(t.camera.near + 1e-4, a("key-far", t.camera.far)), t.camera.camera_type = e.root.querySelector('[data-role="key-camera-type"]').value, e.camera = v(t.camera), e.frame = t.frame, e.serialize(), e.setFrame(t.frame), e.setStatus(p(`Keyframe updated @ ${t.frame}`));
}
function Fe(e) {
  const t = E(e);
  t && (e.editingKeyFrame = t.frame, t.camera = v(e.camera), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(p(`View stored in keyframe @ ${t.frame}`)));
}
function Oe(e) {
  const t = E(e);
  t && (e.setFrame(t.frame), e.setStatus(p(`Loaded keyframe @ ${t.frame}`)));
}
function ze(e, t) {
  const a = S(e);
  if (!a.length) return;
  const r = t < 0 ? [...a].reverse().find((o) => o.frame < e.frame) || a[a.length - 1] : a.find((o) => o.frame > e.frame) || a[0];
  e.selectKeyframe(r);
}
export {
  ee as addMediaCard,
  X as addPrimitive,
  de as applyObjectAnimationFrame,
  he as beginCameraEdit,
  B as beginObjectEdit,
  je as commitCameraEdit,
  re as commitObjectEdit,
  pe as copyKeyframe,
  ye as deleteKeyframe,
  Q as deleteObject,
  J as duplicateObject,
  ve as exitKeyEdit,
  ge as finishCameraEdit,
  ze as goToAdjacentKey,
  fe as insertKeyframe,
  Oe as loadSelectedKeyView,
  be as pasteKeyframe,
  me as playblastCameraAtFrame,
  te as refreshInspector,
  xe as refreshKeyEditor,
  se as refreshObjects,
  le as removeObjectResources,
  G as renameObject,
  $e as retimeSelectedKey,
  ke as selectKeyframe,
  ce as selectObjectAnimation,
  E as selectedKeyframe,
  z as selectedObject,
  ie as setKeyInterpolation,
  ne as setObjectParent,
  S as timelineKeyframes,
  K as timelineObject,
  Ke as toggleAutoKey,
  W as toggleObject,
  oe as updateCameraFromHud,
  Se as updateEditState,
  Fe as updateKeyFromView,
  Ee as updateKeyVisualState,
  Ce as updateSelectedKey,
  ae as updateSelectedObject
};
