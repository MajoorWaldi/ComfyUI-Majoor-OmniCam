import { bM as d, c as _, v as k, b8 as A, bN as W, e as b, bO as x, s as u, a as K } from "./chunk-mvRZEinl.js";
import { m as M } from "./chunk-QPu3m5tU.js";
const C = 360;
function L({ containerWidth: e, otherColumnWidth: a = 0, resizeGutterWidth: s = 18, staticMax: r }) {
  if (!Number.isFinite(e) || e <= 0) return r;
  const l = e - a - s - C;
  return Math.max(0, Math.min(r, l));
}
const z = 24;
function E({ containerClientHeight: e, othersHeight: a, staticMax: s }) {
  if (!Number.isFinite(e) || e <= 0) return s;
  const r = e - a - z;
  return Math.max(0, Math.min(s, r));
}
const q = {
  "outliner-resize": { axis: "y", direction: 1, stateKey: "outliner_height", bounds: d.outlinerHeight, cssVar: "--oc-outliner-h", panelSelector: ".scene-tree" },
  "preview-resize": { axis: "x", direction: 1, stateKey: "preview_width", bounds: d.previewWidth, cssVar: "--oc-preview-w" },
  "side-resize": { axis: "x", direction: -1, stateKey: "side_width", bounds: d.sideWidth, cssVar: "--oc-side-w", neighborStateKey: "left_width" },
  "left-resize": { axis: "x", direction: 1, stateKey: "left_width", bounds: d.leftWidth, cssVar: "--oc-left-w", neighborStateKey: "side_width" },
  "graph-resize": { axis: "y", direction: 1, stateKey: "graph_height", bounds: d.graphHeight, cssVar: "--oc-graph-h" },
  "assets-resize": { axis: "y", direction: 1, stateKey: "assets_height", bounds: d.assetsHeight, cssVar: "--oc-assets-h", panelSelector: ".oc-asset-grid" },
  "agent-resize": { axis: "y", direction: 1, stateKey: "agent_height", bounds: d.agentHeight, cssVar: "--oc-agent-h", panelSelector: ".oc-agent-plan-list" }
};
function w(e, a) {
  if (a.neighborStateKey) {
    const s = e.root.querySelector(".oc-body")?.clientWidth, r = Number(e.state[a.neighborStateKey]) || 0;
    return Math.max(a.bounds.min, L({ containerWidth: s, otherColumnWidth: r, staticMax: a.bounds.max }));
  }
  if (a.panelSelector) {
    const s = e.root.querySelector(a.panelSelector), r = s?.closest(".oc-left-body");
    if (!r || !s) return a.bounds.max;
    const l = [...r.children].filter((c) => !c.hidden && c.offsetHeight > 0), i = parseFloat(getComputedStyle(r).rowGap) || 0, h = l.reduce((c, m) => m === s ? c : c + m.offsetHeight, 0) + Math.max(0, l.length - 1) * i;
    return Math.max(a.bounds.min, E({
      containerClientHeight: r.clientHeight,
      othersHeight: h,
      staticMax: a.bounds.max
    }));
  }
  return a.bounds.max;
}
function v(e) {
  if (e?.root?.style?.setProperty)
    for (const a of Object.values(q)) {
      const s = _(
        Number(e.state[a.stateKey]) || a.bounds.default,
        a.bounds.min,
        w(e, a)
      );
      e.root.style.setProperty(a.cssVar, `${Math.round(s)}px`);
    }
}
function N(e) {
  e.state.outliner_height = d.outlinerHeight.default, e.state.preview_width = d.previewWidth.default, e.state.side_width = d.sideWidth.default, e.state.left_width = d.leftWidth.default, e.state.graph_height = d.graphHeight.default, e.state.assets_height = d.assetsHeight.default, e.state.agent_height = d.agentHeight.default, v(e), e.refreshCameraPreviews?.(), e.refreshGraph?.(), e.drawCurveEditor?.(), e.scheduleResizeAndRender?.(), e.refitNode?.(), e.scheduleSerialize?.(), e.setStatus?.(k("Layout reset to defaults"));
}
function H(e, a) {
  v(e), typeof requestAnimationFrame == "function" && requestAnimationFrame(() => v(e));
  for (const s of e.root.querySelectorAll('[data-act="reset-layout"]'))
    s.addEventListener("click", () => N(e), { signal: a });
  for (const [s, r] of Object.entries(q)) {
    const l = e.root.querySelector(`[data-role="${s}"]`);
    if (!l) continue;
    const i = r.direction ?? 1, h = (o) => {
      e.root.style.setProperty(r.cssVar, `${Math.round(_(o, r.bounds.min, w(e, r)))}px`);
    }, c = (o) => {
      const p = Math.round(_(o, r.bounds.min, w(e, r)));
      e.state[r.stateKey] = p, h(p), r.stateKey === "preview_width" ? (e.refreshCameraPreviews?.(), e.requestRender?.("layout")) : r.stateKey === "side_width" || r.stateKey === "left_width" ? e.scheduleResizeAndRender?.() : r.stateKey === "graph_height" && (e.refreshGraph?.(), e.drawCurveEditor?.()), e.refitNode?.(), e.scheduleSerialize?.();
    }, m = (o) => r.axis === "y" ? o.clientY : o.clientX;
    let f = null;
    l.addEventListener("pointerdown", (o) => {
      o.button === 0 && (o.preventDefault(), l.setPointerCapture?.(o.pointerId), f = { pointerId: o.pointerId, origin: m(o), start: Number(e.state[r.stateKey]) || r.bounds.default });
    }, { signal: a }), l.addEventListener("pointermove", (o) => {
      !f || o.pointerId !== f.pointerId || h(f.start + (m(o) - f.origin) * i);
    }, { signal: a });
    const y = (o) => {
      !f || o.pointerId !== f.pointerId || (l.releasePointerCapture?.(o.pointerId), c(f.start + (m(o) - f.origin) * i), f = null);
    };
    l.addEventListener("pointerup", y, { signal: a }), l.addEventListener("pointercancel", y, { signal: a }), l.addEventListener("dblclick", (o) => {
      o.preventDefault(), c(r.bounds.default);
    }, { signal: a }), l.addEventListener("keydown", (o) => {
      const p = (o.shiftKey ? 48 : 16) * i, t = Number(e.state[r.stateKey]) || r.bounds.default;
      o.key === "ArrowDown" || o.key === "ArrowRight" ? (o.preventDefault(), c(t + p)) : o.key === "ArrowUp" || o.key === "ArrowLeft" ? (o.preventDefault(), c(t - p)) : o.key === "Home" && (o.preventDefault(), c(r.bounds.default));
    }, { signal: a });
  }
}
function S(e) {
  return e?.state?.cameras?.length || (e.state.cameras = [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: b(e?.camera), keyframes: e?.state?.keyframes || [] }]), e.state.cameras.find((a) => a.id === e.state.active_camera_id) || e.state.cameras[0];
}
function F(e) {
  if (!e?.state?.cameras?.length)
    return S(e);
  if (e.state.playblast_camera_id === A) {
    const a = x(e.state, e.frame), s = a && e.state.cameras.find((r) => r.id === a.camera_id);
    if (s) return s;
  }
  return e.state.cameras.find((a) => a.id === e.state.playblast_camera_id) || S(e);
}
function B(e) {
  const a = S(e);
  a && (a.camera = b(e.camera), a.keyframes = e.state.keyframes, e.state.camera = b(e.camera));
}
function I(e) {
  if (e.disposed) return;
  e.directorRevision = (Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0) + 1, e.renderRevision = (e.renderRevision || 0) + 1, B(e);
  const a = e.state.playblast_camera_id === A && W(e.state), s = F(e);
  e.recordingWidget && (a ? e.recordingWidget.value = e.state.sequence.recording_path || "" : (!e.state.cameras.some((i) => !!i.recording_path) && !s.recording_path && e.recordingWidget.value && (s.recording_path = String(e.recordingWidget.value)), e.recordingWidget.value = s.recording_path || "")), e.state.metadata = {
    ...e.state.metadata,
    playblast_camera_id: a ? A : s.id,
    playblast_camera_name: a ? "Sequence" : s.name
  };
  const r = { ...e.state, camera: b(s.camera), keyframes: s.keyframes };
  r.metadata = { ...r.metadata, motion_scene_fingerprint_live: M(e.state) }, e.stateWidget && (e.stateWidget.value = JSON.stringify(r)), e.widthWidget && (e.widthWidget.value = e.state.width), e.heightWidget && (e.heightWidget.value = e.state.height), e.fpsWidget && (e.fpsWidget.value = e.state.fps), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / e.state.fps), e.modeWidget && (e.modeWidget.value = e.state.render_mode), e.cardWidget && (e.cardWidget.value = e.state.card_asset || ""), e.node.graph?.setDirtyCanvas?.(!0, !0);
}
function T(e) {
  for (const a of [e.widthWidget, e.heightWidget, e.fpsWidget, e.durationWidget, e.modeWidget]) {
    if (!a || a.__omnicamCallback) continue;
    const s = a.callback;
    a.callback = (...r) => {
      const l = s?.apply(a, r);
      return e.syncFromWidgets(), l;
    }, a.__omnicamCallback = !0;
  }
}
function V(e, a = !0) {
  const s = e.state.duration_frames, r = e.state.fps;
  e.state.width = Number(e.widthWidget?.value || e.state.width), e.state.height = Number(e.heightWidget?.value || e.state.height), e.state.fps = Number(e.fpsWidget?.value || e.state.fps), e.state.duration_frames = Math.max(1, Math.round(Number(e.durationWidget?.value || 5) * e.state.fps));
  for (const t of e.state.cameras) {
    for (const n of t.keyframes) n.frame = Math.max(0, Math.round(n.frame));
    t.keyframes = [...new Map(t.keyframes.map((n) => [n.frame, n])).values()].sort((n, g) => n.frame - g.frame);
  }
  e.state.keyframes = S(e).keyframes;
  for (const t of e.state.objects)
    t.keyframes = [...new Map((t.keyframes || []).map((n) => {
      const g = Math.max(0, Math.round(n.frame));
      return [g, { ...n, frame: g }];
    })).values()].sort((n, g) => n.frame - g.frame);
  e.timelineKeyframes().some((t) => t.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.state.render_mode = e.modeWidget?.value || e.state.render_mode;
  const l = (t) => e.root.querySelector(t);
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
  e.root.dataset.density = e.state.ui_density || "animation", v(e);
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
  const h = e.root.querySelector('[data-role="viewport-inspector"]'), c = h && h.dataset.collapsed !== "true";
  for (const t of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    t.classList.toggle("active", !!c), t.setAttribute("aria-pressed", String(!!c));
  e.refreshCameraSelectors();
  const m = l('[data-role="scrub"]');
  m && (m.max = String(e.state.duration_frames - 1));
  const f = l('[data-role="frame"]');
  f && (f.max = String(e.state.duration_frames - 1));
  const y = l('[data-role="key-frame"]');
  y && (y.max = String(e.state.duration_frames - 1));
  const o = l('[data-role="duration-seconds"]');
  o && (o.value = String(e.state.duration_frames / e.state.fps));
  const p = l('[data-role="timeline-fps"]');
  p && (p.value = String(e.state.fps)), e.frame = _(e.frame, 0, e.state.duration_frames - 1), a && e.serialize(), (s !== e.state.duration_frames || r !== e.state.fps) && (e.computeAudioPeaks?.(), e.setFrame(e.frame, !1, !0), e.setStatus(`Timeline: ${e.state.duration_frames} frames · ${(e.state.duration_frames / e.state.fps).toFixed(2)} s`));
}
function j(e) {
  let a = null;
  try {
    a = JSON.parse(e.stateWidget?.value || "{}");
  } catch {
  }
  const s = new Set(e.state.objects.map((l) => l.id));
  e.state = u(a);
  const r = new Set(e.state.objects.map((l) => l.id));
  for (const l of s) r.has(l) || e.removeObjectResources(l);
  e.timelineKeyframes().some((l) => l.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.camera = K(e.state, Math.min(e.frame, e.state.duration_frames - 1)), e.syncFromWidgets(!1), e.root.querySelector('[data-role="gizmo-space"]').value = e.state.gizmo_space, e.restoreAssets(), e.refreshKeys(), e.refreshObjects(), e.render(), e.history?.clear(), e.sceneBaseline = e.stateWidget?.value ?? e.sceneBaseline, e.sceneName = e.state.metadata?.scene_name || "";
}
export {
  S as a,
  H as b,
  B as c,
  T as d,
  V as e,
  F as p,
  j as r,
  I as s
};
