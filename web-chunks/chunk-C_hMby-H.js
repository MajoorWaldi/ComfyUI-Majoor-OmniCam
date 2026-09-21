import { P as d, c as _, v as u, S as w, A as W, e as v, B as x, s as C, a as K } from "./chunk-Cg3_Iw1A.js";
import { m as M } from "./chunk-Bu3EGLOJ.js";
const L = 360;
function E({ containerWidth: e, otherColumnWidth: a = 0, resizeGutterWidth: o = 18, staticMax: r }) {
  if (!Number.isFinite(e) || e <= 0) return r;
  const s = e - a - o - L;
  return Math.max(0, Math.min(r, s));
}
const z = 24;
function N({ containerClientHeight: e, othersHeight: a, staticMax: o }) {
  if (!Number.isFinite(e) || e <= 0) return o;
  const r = e - a - z;
  return Math.max(0, Math.min(o, r));
}
const k = {
  "outliner-resize": { axis: "y", direction: 1, stateKey: "outliner_height", bounds: d.outlinerHeight, cssVar: "--oc-outliner-h", panelSelector: ".scene-tree" },
  "preview-resize": { axis: "x", direction: 1, stateKey: "preview_width", bounds: d.previewWidth, cssVar: "--oc-preview-w" },
  "side-resize": { axis: "x", direction: -1, stateKey: "side_width", bounds: d.sideWidth, cssVar: "--oc-side-w", neighborStateKey: "left_width" },
  "left-resize": { axis: "x", direction: 1, stateKey: "left_width", bounds: d.leftWidth, cssVar: "--oc-left-w", neighborStateKey: "side_width" },
  "graph-resize": { axis: "y", direction: 1, stateKey: "graph_height", bounds: d.graphHeight, cssVar: "--oc-graph-h" },
  "assets-resize": { axis: "y", direction: 1, stateKey: "assets_height", bounds: d.assetsHeight, cssVar: "--oc-assets-h", panelSelector: ".oc-asset-grid" },
  "agent-resize": { axis: "y", direction: 1, stateKey: "agent_height", bounds: d.agentHeight, cssVar: "--oc-agent-h", panelSelector: ".oc-agent-plan-list" }
};
function A(e, a) {
  if (a.neighborStateKey) {
    const o = e.root.querySelector(".oc-body")?.clientWidth, r = Number(e.state[a.neighborStateKey]) || 0;
    return Math.max(a.bounds.min, E({ containerWidth: o, otherColumnWidth: r, staticMax: a.bounds.max }));
  }
  if (a.panelSelector) {
    const o = e.root.querySelector(a.panelSelector), r = o?.closest(".oc-left-body");
    if (!r || !o) return a.bounds.max;
    const s = [...r.children].filter((c) => !c.hidden && c.offsetHeight > 0), i = parseFloat(getComputedStyle(r).rowGap) || 0, m = s.reduce((c, p) => p === o ? c : c + p.offsetHeight, 0) + Math.max(0, s.length - 1) * i;
    return Math.max(a.bounds.min, N({
      containerClientHeight: r.clientHeight,
      othersHeight: m,
      staticMax: a.bounds.max
    }));
  }
  return a.bounds.max;
}
function S(e) {
  if (e?.root?.style?.setProperty)
    for (const a of Object.values(k)) {
      const o = _(
        Number(e.state[a.stateKey]) || a.bounds.default,
        a.bounds.min,
        A(e, a)
      );
      e.root.style.setProperty(a.cssVar, `${Math.round(o)}px`);
    }
}
function F(e) {
  e.state.outliner_height = d.outlinerHeight.default, e.state.preview_width = d.previewWidth.default, e.state.side_width = d.sideWidth.default, e.state.left_width = d.leftWidth.default, e.state.graph_height = d.graphHeight.default, e.state.assets_height = d.assetsHeight.default, e.state.agent_height = d.agentHeight.default, S(e), e.refreshCameraPreviews?.(), e.refreshGraph?.(), e.drawCurveEditor?.(), e.scheduleResizeAndRender?.(), e.refitNode?.(), e.scheduleSerialize?.(), e.setStatus?.(u("Layout reset to defaults"));
}
function T(e, a) {
  S(e), typeof requestAnimationFrame == "function" && requestAnimationFrame(() => S(e));
  for (const o of e.root.querySelectorAll('[data-act="reset-layout"]'))
    o.addEventListener("click", () => F(e), { signal: a });
  for (const [o, r] of Object.entries(k)) {
    const s = e.root.querySelector(`[data-role="${o}"]`);
    if (!s) continue;
    const i = r.direction ?? 1, m = (l) => {
      e.root.style.setProperty(r.cssVar, `${Math.round(_(l, r.bounds.min, A(e, r)))}px`);
    }, c = (l) => {
      const h = Math.round(_(l, r.bounds.min, A(e, r)));
      e.state[r.stateKey] = h, m(h), r.stateKey === "preview_width" ? (e.refreshCameraPreviews?.(), e.requestRender?.("layout")) : r.stateKey === "side_width" || r.stateKey === "left_width" ? e.scheduleResizeAndRender?.() : r.stateKey === "graph_height" && (e.refreshGraph?.(), e.drawCurveEditor?.()), e.refitNode?.(), e.scheduleSerialize?.();
    }, p = (l) => r.axis === "y" ? l.clientY : l.clientX;
    let f = null;
    s.addEventListener("pointerdown", (l) => {
      l.button === 0 && (l.preventDefault(), s.setPointerCapture?.(l.pointerId), f = { pointerId: l.pointerId, origin: p(l), start: Number(e.state[r.stateKey]) || r.bounds.default });
    }, { signal: a }), s.addEventListener("pointermove", (l) => {
      !f || l.pointerId !== f.pointerId || m(f.start + (p(l) - f.origin) * i);
    }, { signal: a });
    const y = (l) => {
      !f || l.pointerId !== f.pointerId || (s.releasePointerCapture?.(l.pointerId), c(f.start + (p(l) - f.origin) * i), f = null);
    };
    s.addEventListener("pointerup", y, { signal: a }), s.addEventListener("pointercancel", y, { signal: a }), s.addEventListener("dblclick", (l) => {
      l.preventDefault(), c(r.bounds.default);
    }, { signal: a }), s.addEventListener("keydown", (l) => {
      const h = (l.shiftKey ? 48 : 16) * i, t = Number(e.state[r.stateKey]) || r.bounds.default;
      l.key === "ArrowDown" || l.key === "ArrowRight" ? (l.preventDefault(), c(t + h)) : l.key === "ArrowUp" || l.key === "ArrowLeft" ? (l.preventDefault(), c(t - h)) : l.key === "Home" && (l.preventDefault(), c(r.bounds.default));
    }, { signal: a });
  }
}
function b(e) {
  return e?.state?.cameras?.length || (e.state.cameras = [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: v(e?.camera), keyframes: e?.state?.keyframes || [] }]), e.state.cameras.find((a) => a.id === e.state.active_camera_id) || e.state.cameras[0];
}
function B(e) {
  if (!e?.state?.cameras?.length)
    return b(e);
  if (e.state.playblast_camera_id === w) {
    const a = x(e.state, e.frame), o = a && e.state.cameras.find((r) => r.id === a.camera_id);
    if (o) return o;
  }
  return e.state.cameras.find((a) => a.id === e.state.playblast_camera_id) || b(e);
}
function R(e) {
  const a = b(e);
  a && (a.camera = v(e.camera), a.keyframes = e.state.keyframes, e.state.camera = v(e.camera));
}
function V(e) {
  if (e.disposed) return;
  e.directorRevision = (Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0) + 1, e.renderRevision = (e.renderRevision || 0) + 1, R(e);
  const a = e.state.playblast_camera_id === w && W(e.state), o = B(e);
  e.recordingWidget && (a ? e.recordingWidget.value = e.state.sequence.recording_path || "" : (!e.state.cameras.some((i) => !!i.recording_path) && !o.recording_path && e.recordingWidget.value && (o.recording_path = String(e.recordingWidget.value)), e.recordingWidget.value = o.recording_path || "")), e.state.metadata = {
    ...e.state.metadata,
    playblast_camera_id: a ? w : o.id,
    playblast_camera_name: a ? "Sequence" : o.name
  };
  const r = { ...e.state, camera: v(o.camera), keyframes: o.keyframes };
  r.metadata = { ...r.metadata, motion_scene_fingerprint_live: M(e.state) }, e.stateWidget && (e.stateWidget.value = JSON.stringify(r)), e.widthWidget && (e.widthWidget.value = e.state.width), e.heightWidget && (e.heightWidget.value = e.state.height), e.fpsWidget && (e.fpsWidget.value = e.state.fps), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / e.state.fps), e.modeWidget && (e.modeWidget.value = e.state.render_mode), e.cardWidget && (e.cardWidget.value = e.state.card_asset || ""), e.node.graph?.setDirtyCanvas?.(!0, !0);
}
function j(e) {
  for (const a of [e.widthWidget, e.heightWidget, e.fpsWidget, e.durationWidget, e.modeWidget]) {
    if (!a || a.__omnicamCallback) continue;
    const o = a.callback;
    a.callback = (...r) => {
      const s = o?.apply(a, r);
      return e.syncFromWidgets(), s;
    }, a.__omnicamCallback = !0;
  }
}
function D(e, a = !0) {
  const o = e.state.duration_frames, r = e.state.fps;
  e.state.width = Number(e.widthWidget?.value || e.state.width), e.state.height = Number(e.heightWidget?.value || e.state.height), e.state.fps = Number(e.fpsWidget?.value || e.state.fps), e.state.duration_frames = Math.max(1, Math.round(Number(e.durationWidget?.value || 5) * e.state.fps));
  for (const t of e.state.cameras) {
    for (const n of t.keyframes) n.frame = Math.max(0, Math.round(n.frame));
    t.keyframes = [...new Map(t.keyframes.map((n) => [n.frame, n])).values()].sort((n, g) => n.frame - g.frame);
  }
  e.state.keyframes = b(e).keyframes;
  for (const t of e.state.objects)
    t.keyframes = [...new Map((t.keyframes || []).map((n) => {
      const g = Math.max(0, Math.round(n.frame));
      return [g, { ...n, frame: g }];
    })).values()].sort((n, g) => n.frame - g.frame);
  e.timelineKeyframes().some((t) => t.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.state.render_mode = e.modeWidget?.value || e.state.render_mode;
  const s = (t) => e.root.querySelector(t);
  for (const t of e.root.querySelectorAll('[data-role="mode"]')) t.value = e.state.render_mode;
  for (const t of e.root.querySelectorAll('[data-role="guides"]')) t.checked = e.state.guides !== !1;
  for (const t of e.root.querySelectorAll('[data-role="playblast-grid"]')) t.checked = !!e.state.playblast_grid;
  for (const t of e.root.querySelectorAll('[data-role="playblast-labels"]')) t.checked = !!e.state.playblast_labels;
  for (const t of e.root.querySelectorAll('[data-role="guide-capture-style"]')) t.value = e.state.guide_capture_style || "auto";
  for (const t of e.root.querySelectorAll('[data-role="reconstruction-appearance"]')) t.value = e.state.reconstruction_appearance || "neutral";
  for (const t of e.root.querySelectorAll('[data-role="playblast-resolution"]')) t.value = e.state.playblast_resolution || "output";
  for (const t of e.root.querySelectorAll('[data-role="show-wireframe"]')) t.checked = !!e.state.show_wireframe;
  for (const t of e.root.querySelectorAll('[data-role="show-vertices"]')) t.checked = !!e.state.show_vertices;
  for (const t of e.root.querySelectorAll('[data-role="backface-culling"]')) t.checked = !!e.state.backface_culling;
  for (const t of e.root.querySelectorAll('[data-role="show-grid"]')) t.checked = e.state.show_grid !== !1;
  for (const t of e.root.querySelectorAll('[data-role="show-camera-paths"]')) t.checked = e.state.show_camera_paths !== !1;
  for (const t of e.root.querySelectorAll('[data-role="show-camera-gizmos"]')) t.checked = e.state.show_camera_gizmos !== !1;
  for (const t of e.root.querySelectorAll('[data-role="show-look-at"]')) t.checked = e.state.show_look_at !== !1;
  for (const t of e.root.querySelectorAll('[data-role="show-helper-axes"]')) t.checked = e.state.show_helper_axes !== !1;
  for (const t of e.root.querySelectorAll('[data-act="select-look-at"]')) {
    const n = e.selectedEntity === "camera_target";
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
  for (const t of e.root.querySelectorAll('[data-role="select-mode"]')) t.value = e.state.select_mode || "object";
  for (const t of e.root.querySelectorAll('[data-role="burn-in"]')) t.checked = !!e.state.burn_in;
  for (const t of e.root.querySelectorAll('[data-role="speed-heatmap"]')) t.checked = !!e.state.speed_heatmap;
  for (const t of e.root.querySelectorAll('[data-role="point-density"]')) t.value = e.state.point_density || "balanced";
  for (const t of e.root.querySelectorAll('[data-role="point-color"]')) t.value = e.state.point_color || "#cbd5e1";
  for (const t of e.root.querySelectorAll('[data-role="point-spread"]')) t.value = e.state.point_spread || "all_views";
  for (const t of e.root.querySelectorAll('[data-role="card-fit"]')) t.value = e.state.card_fit || "contain";
  for (const t of e.root.querySelectorAll('[data-role="preview-layout"]')) t.value = e.state.preview_layout || "auto";
  for (const t of e.root.querySelectorAll('[data-role="safe-areas"]')) t.checked = !!e.state.safe_areas;
  for (const t of e.root.querySelectorAll('[data-role="resolution-gate"]')) t.checked = !!e.state.resolution_gate;
  for (const t of e.root.querySelectorAll('[data-role="aspect-ratio"]')) t.value = e.state.aspect_ratio || "auto";
  for (const t of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) t.value = e.state.viewport_bg_color || "#121212";
  for (const t of e.root.querySelectorAll('[data-role="gizmo-space"]')) t.value = e.state.gizmo_space || "world";
  for (const t of e.root.querySelectorAll('[data-role="navigation-profile"]')) t.value = e.state.navigation_profile || "maya";
  for (const t of e.root.querySelectorAll('[data-role="spatial-snap-mode"]')) t.value = e.state.spatial_snap_mode || "none";
  for (const t of e.root.querySelectorAll('[data-role="spatial-grid-size"]')) t.value = String(e.state.spatial_grid_size || 0.5);
  const i = e.state.view_mode || "perspective";
  for (const t of e.root.querySelectorAll('[data-role="view-mode"]')) t.value = i;
  for (const t of e.root.querySelectorAll("[data-view]")) {
    const n = t.dataset.view === i;
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
  for (const t of e.root.querySelectorAll('[data-role="ui-density"]')) t.value = e.state.ui_density || "animation";
  e.root.dataset.density = e.state.ui_density || "animation", S(e);
  for (const t of e.root.querySelectorAll('[data-role="camera-view-row"]')) t.hidden = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    t.classList.toggle("active", e.state.camera_view_visible);
  for (const t of e.root.querySelectorAll('[data-role="camera-type"]')) t.value = e.camera.camera_type || "perspective";
  for (const t of e.root.querySelectorAll('[data-role="camera-near"]')) t.value = String(e.camera.near ?? 0.01);
  for (const t of e.root.querySelectorAll('[data-role="camera-far"]')) t.value = String(e.camera.far ?? 1e4);
  for (const t of e.root.querySelectorAll('[data-role="speed"]')) t.value = String(e.cameraSpeed || 1);
  for (const t of e.root.querySelectorAll('[data-act="loop"]'))
    t.classList.toggle("active", !!e.state.loop_playback), t.setAttribute("aria-pressed", String(!!e.state.loop_playback));
  for (const t of e.root.querySelectorAll('[data-act="toggle-snap"]'))
    t.classList.toggle("active", e.state.snap_enabled !== !1), t.setAttribute("aria-pressed", String(e.state.snap_enabled !== !1));
  for (const t of e.root.querySelectorAll('[data-act="toggle-timecode"]'))
    t.classList.toggle("active", e.state.timecode_mode === "timecode"), t.setAttribute("aria-pressed", String(e.state.timecode_mode === "timecode"));
  for (const t of e.root.querySelectorAll('[data-role="show-radar"]')) t.checked = !!e.state.show_radar;
  for (const t of e.root.querySelectorAll('[data-role="encoder"]')) t.value = e.state.encoder || "auto";
  for (const t of e.root.querySelectorAll('[data-role="proxy-preset"]')) t.value = e.state.proxy_preset || "clean_proxy";
  for (const t of e.root.querySelectorAll('[data-role="snap-frames"]')) t.value = String(e.state.snap_frames || 1);
  for (const t of e.root.querySelectorAll('[data-act="auto-key"]'))
    t.classList.toggle("active", !!e.state.auto_key), t.setAttribute("aria-pressed", String(!!e.state.auto_key));
  for (const t of e.root.querySelectorAll("[data-select-mode]")) {
    const n = t.dataset.selectMode === (e.state.select_mode || "object");
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
  for (const t of e.root.querySelectorAll("[data-transform-mode]")) {
    const n = t.dataset.transformMode === (e.state.gizmo_mode || "translate");
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
  const m = e.root.querySelector('[data-role="viewport-inspector"]'), c = m && m.dataset.collapsed !== "true";
  for (const t of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    t.classList.toggle("active", !!c), t.setAttribute("aria-pressed", String(!!c));
  e.refreshCameraSelectors();
  const p = s('[data-role="scrub"]');
  p && (p.max = String(e.state.duration_frames - 1));
  const f = s('[data-role="frame"]');
  f && (f.max = String(e.state.duration_frames - 1));
  const y = s('[data-role="key-frame"]');
  y && (y.max = String(e.state.duration_frames - 1));
  const l = s('[data-role="duration-seconds"]');
  l && (l.value = String(e.state.duration_frames / e.state.fps));
  const h = s('[data-role="timeline-fps"]');
  h && (h.value = String(e.state.fps)), e.frame = _(e.frame, 0, e.state.duration_frames - 1), a && e.serialize(), (o !== e.state.duration_frames || r !== e.state.fps) && (e.computeAudioPeaks?.(), e.setFrame(e.frame, !1, !0), e.setStatus(`Timeline: ${e.state.duration_frames} frames · ${(e.state.duration_frames / e.state.fps).toFixed(2)} s`));
}
function O(e) {
  let a = null;
  try {
    a = JSON.parse(e.stateWidget?.value || "{}");
  } catch {
  }
  const o = new Set(e.state.objects.map((s) => s.id));
  e.state = C(a);
  const r = new Set(e.state.objects.map((s) => s.id));
  for (const s of o) r.has(s) || e.removeObjectResources(s);
  e.timelineKeyframes().some((s) => s.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.camera = K(e.state, Math.min(e.frame, e.state.duration_frames - 1)), e.syncFromWidgets(!1), e.root.querySelector('[data-role="gizmo-space"]').value = e.state.gizmo_space, e.restoreAssets(), e.refreshKeys(), e.refreshObjects(), e.render(), e.history?.clear(), e.sceneBaseline = e.stateWidget?.value ?? e.sceneBaseline, e.sceneName = e.state.metadata?.scene_name || "";
}
const q = /* @__PURE__ */ new WeakMap();
function H(e) {
  let a = q.get(e);
  if (a) return a;
  a = /* @__PURE__ */ new Set(), q.set(e, a);
  const o = e.onConnectionChange;
  return e.onConnectionChange = function(r) {
    const s = o?.apply(this, arguments);
    for (const i of [...a])
      try {
        i(r);
      } catch (m) {
        console.warn("[OmniCam] graph connection watcher failed", m);
      }
    return s;
  }, a;
}
function G(e, a) {
  const o = e?.graph;
  if (!o || typeof a != "function") return () => {
  };
  const r = H(o);
  return r.add(a), () => r.delete(a);
}
export {
  b as a,
  T as b,
  R as c,
  j as d,
  D as e,
  B as p,
  O as r,
  V as s,
  G as w
};
