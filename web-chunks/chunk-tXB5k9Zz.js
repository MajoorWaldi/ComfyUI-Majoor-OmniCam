import { c as i, bJ as s, v as A, b6 as S, bK as q, e as v, bL as k, s as W, a as x } from "./chunk-CP16H5xA.js";
import { a as K } from "./chunk-CTXwjaoT.js";
const M = 360;
function u({ containerWidth: e, otherColumnWidth: a = 0, resizeGutterWidth: c = 18, staticMax: r }) {
  if (!Number.isFinite(e) || e <= 0) return r;
  const l = e - a - c - M;
  return Math.max(0, Math.min(r, l));
}
function w(e) {
  if (!e?.root?.style?.setProperty) return;
  const a = i(
    Number(e.state.outliner_height) || s.outlinerHeight.default,
    s.outlinerHeight.min,
    s.outlinerHeight.max
  ), c = i(
    Number(e.state.preview_width) || s.previewWidth.default,
    s.previewWidth.min,
    s.previewWidth.max
  ), r = i(
    Number(e.state.side_width) || s.sideWidth.default,
    s.sideWidth.min,
    s.sideWidth.max
  ), l = i(
    Number(e.state.left_width) || s.leftWidth.default,
    s.leftWidth.min,
    s.leftWidth.max
  ), f = i(
    Number(e.state.graph_height) || s.graphHeight.default,
    s.graphHeight.min,
    s.graphHeight.max
  ), h = i(
    Number(e.state.assets_height) || s.assetsHeight.default,
    s.assetsHeight.min,
    s.assetsHeight.max
  ), p = i(
    Number(e.state.agent_height) || s.agentHeight.default,
    s.agentHeight.min,
    s.agentHeight.max
  );
  e.root.style.setProperty("--oc-outliner-h", `${Math.round(a)}px`), e.root.style.setProperty("--oc-preview-w", `${Math.round(c)}px`), e.root.style.setProperty("--oc-side-w", `${Math.round(r)}px`), e.root.style.setProperty("--oc-left-w", `${Math.round(l)}px`), e.root.style.setProperty("--oc-graph-h", `${Math.round(f)}px`), e.root.style.setProperty("--oc-assets-h", `${Math.round(h)}px`), e.root.style.setProperty("--oc-agent-h", `${Math.round(p)}px`);
}
function L(e) {
  e.state.outliner_height = s.outlinerHeight.default, e.state.preview_width = s.previewWidth.default, e.state.side_width = s.sideWidth.default, e.state.left_width = s.leftWidth.default, e.state.graph_height = s.graphHeight.default, e.state.assets_height = s.assetsHeight.default, e.state.agent_height = s.agentHeight.default, w(e), e.refreshCameraPreviews?.(), e.refreshGraph?.(), e.drawCurveEditor?.(), e.scheduleResizeAndRender?.(), e.refitNode?.(), e.scheduleSerialize?.(), e.setStatus?.(A("Layout reset to defaults"));
}
const H = {
  "outliner-resize": { axis: "y", direction: 1, stateKey: "outliner_height", bounds: s.outlinerHeight, cssVar: "--oc-outliner-h" },
  "preview-resize": { axis: "x", direction: 1, stateKey: "preview_width", bounds: s.previewWidth, cssVar: "--oc-preview-w" },
  "side-resize": { axis: "x", direction: -1, stateKey: "side_width", bounds: s.sideWidth, cssVar: "--oc-side-w", neighborStateKey: "left_width" },
  "left-resize": { axis: "x", direction: 1, stateKey: "left_width", bounds: s.leftWidth, cssVar: "--oc-left-w", neighborStateKey: "side_width" },
  "graph-resize": { axis: "y", direction: 1, stateKey: "graph_height", bounds: s.graphHeight, cssVar: "--oc-graph-h" },
  "assets-resize": { axis: "y", direction: 1, stateKey: "assets_height", bounds: s.assetsHeight, cssVar: "--oc-assets-h" },
  "agent-resize": { axis: "y", direction: 1, stateKey: "agent_height", bounds: s.agentHeight, cssVar: "--oc-agent-h" }
};
function P(e, a) {
  w(e);
  for (const c of e.root.querySelectorAll('[data-act="reset-layout"]'))
    c.addEventListener("click", () => L(e), { signal: a });
  for (const [c, r] of Object.entries(H)) {
    const l = e.root.querySelector(`[data-role="${c}"]`);
    if (!l) continue;
    const f = r.direction ?? 1, h = () => {
      if (!r.neighborStateKey) return r.bounds.max;
      const o = e.root.querySelector(".oc-body")?.clientWidth, t = Number(e.state[r.neighborStateKey]) || 0;
      return Math.max(r.bounds.min, u({ containerWidth: o, otherColumnWidth: t, staticMax: r.bounds.max }));
    }, p = (o) => {
      e.root.style.setProperty(r.cssVar, `${Math.round(i(o, r.bounds.min, h()))}px`);
    }, m = (o) => {
      const t = Math.round(i(o, r.bounds.min, h()));
      e.state[r.stateKey] = t, p(t), r.stateKey === "preview_width" ? (e.refreshCameraPreviews?.(), e.requestRender?.("layout")) : r.stateKey === "side_width" || r.stateKey === "left_width" ? e.scheduleResizeAndRender?.() : r.stateKey === "graph_height" && (e.refreshGraph?.(), e.drawCurveEditor?.()), e.refitNode?.(), e.scheduleSerialize?.();
    }, g = (o) => r.axis === "y" ? o.clientY : o.clientX;
    let d = null;
    l.addEventListener("pointerdown", (o) => {
      o.button === 0 && (o.preventDefault(), l.setPointerCapture?.(o.pointerId), d = { pointerId: o.pointerId, origin: g(o), start: Number(e.state[r.stateKey]) || r.bounds.default });
    }, { signal: a }), l.addEventListener("pointermove", (o) => {
      !d || o.pointerId !== d.pointerId || p(d.start + (g(o) - d.origin) * f);
    }, { signal: a });
    const _ = (o) => {
      !d || o.pointerId !== d.pointerId || (l.releasePointerCapture?.(o.pointerId), m(d.start + (g(o) - d.origin) * f), d = null);
    };
    l.addEventListener("pointerup", _, { signal: a }), l.addEventListener("pointercancel", _, { signal: a }), l.addEventListener("dblclick", (o) => {
      o.preventDefault(), m(r.bounds.default);
    }, { signal: a }), l.addEventListener("keydown", (o) => {
      const t = (o.shiftKey ? 48 : 16) * f, n = Number(e.state[r.stateKey]) || r.bounds.default;
      o.key === "ArrowDown" || o.key === "ArrowRight" ? (o.preventDefault(), m(n + t)) : o.key === "ArrowUp" || o.key === "ArrowLeft" ? (o.preventDefault(), m(n - t)) : o.key === "Home" && (o.preventDefault(), m(r.bounds.default));
    }, { signal: a });
  }
}
function b(e) {
  return e?.state?.cameras?.length || (e.state.cameras = [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: v(e?.camera), keyframes: e?.state?.keyframes || [] }]), e.state.cameras.find((a) => a.id === e.state.active_camera_id) || e.state.cameras[0];
}
function N(e) {
  if (!e?.state?.cameras?.length)
    return b(e);
  if (e.state.playblast_camera_id === S) {
    const a = k(e.state, e.frame), c = a && e.state.cameras.find((r) => r.id === a.camera_id);
    if (c) return c;
  }
  return e.state.cameras.find((a) => a.id === e.state.playblast_camera_id) || b(e);
}
function C(e) {
  const a = b(e);
  a && (a.camera = v(e.camera), a.keyframes = e.state.keyframes, e.state.camera = v(e.camera));
}
function B(e) {
  if (e.disposed) return;
  e.directorRevision = (Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0) + 1, e.renderRevision = (e.renderRevision || 0) + 1, C(e);
  const a = e.state.playblast_camera_id === S && q(e.state), c = N(e);
  e.recordingWidget && (a ? e.recordingWidget.value = e.state.sequence.recording_path || "" : (!e.state.cameras.some((f) => !!f.recording_path) && !c.recording_path && e.recordingWidget.value && (c.recording_path = String(e.recordingWidget.value)), e.recordingWidget.value = c.recording_path || "")), e.state.metadata = {
    ...e.state.metadata,
    playblast_camera_id: a ? S : c.id,
    playblast_camera_name: a ? "Sequence" : c.name
  };
  const r = { ...e.state, camera: v(c.camera), keyframes: c.keyframes };
  r.metadata = { ...r.metadata, motion_scene_fingerprint_live: K(e.state) }, e.stateWidget && (e.stateWidget.value = JSON.stringify(r)), e.widthWidget && (e.widthWidget.value = e.state.width), e.heightWidget && (e.heightWidget.value = e.state.height), e.fpsWidget && (e.fpsWidget.value = e.state.fps), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / e.state.fps), e.modeWidget && (e.modeWidget.value = e.state.render_mode), e.cardWidget && (e.cardWidget.value = e.state.card_asset || ""), e.node.graph?.setDirtyCanvas?.(!0, !0);
}
function R(e) {
  for (const a of [e.widthWidget, e.heightWidget, e.fpsWidget, e.durationWidget, e.modeWidget]) {
    if (!a || a.__omnicamCallback) continue;
    const c = a.callback;
    a.callback = (...r) => {
      const l = c?.apply(a, r);
      return e.syncFromWidgets(), l;
    }, a.__omnicamCallback = !0;
  }
}
function F(e, a = !0) {
  const c = e.state.duration_frames, r = e.state.fps;
  e.state.width = Number(e.widthWidget?.value || e.state.width), e.state.height = Number(e.heightWidget?.value || e.state.height), e.state.fps = Number(e.fpsWidget?.value || e.state.fps), e.state.duration_frames = Math.max(1, Math.round(Number(e.durationWidget?.value || 5) * e.state.fps));
  for (const t of e.state.cameras) {
    for (const n of t.keyframes) n.frame = Math.max(0, Math.round(n.frame));
    t.keyframes = [...new Map(t.keyframes.map((n) => [n.frame, n])).values()].sort((n, y) => n.frame - y.frame);
  }
  e.state.keyframes = b(e).keyframes;
  for (const t of e.state.objects)
    t.keyframes = [...new Map((t.keyframes || []).map((n) => {
      const y = Math.max(0, Math.round(n.frame));
      return [y, { ...n, frame: y }];
    })).values()].sort((n, y) => n.frame - y.frame);
  e.timelineKeyframes().some((t) => t.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.state.render_mode = e.modeWidget?.value || e.state.render_mode;
  const l = (t) => e.root.querySelector(t);
  for (const t of e.root.querySelectorAll('[data-role="mode"]')) t.value = e.state.render_mode;
  for (const t of e.root.querySelectorAll('[data-role="guides"]')) t.checked = e.state.guides !== !1;
  for (const t of e.root.querySelectorAll('[data-role="playblast-grid"]')) t.checked = !!e.state.playblast_grid;
  for (const t of e.root.querySelectorAll('[data-role="playblast-labels"]')) t.checked = !!e.state.playblast_labels;
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
  const f = e.state.view_mode || "perspective";
  for (const t of e.root.querySelectorAll('[data-role="view-mode"]')) t.value = f;
  for (const t of e.root.querySelectorAll("[data-view]")) {
    const n = t.dataset.view === f;
    t.classList.toggle("active", n), t.setAttribute("aria-pressed", String(n));
  }
  for (const t of e.root.querySelectorAll('[data-role="ui-density"]')) t.value = e.state.ui_density || "animation";
  e.root.dataset.density = e.state.ui_density || "animation", w(e);
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
  const h = e.root.querySelector('[data-role="viewport-inspector"]'), p = h && h.dataset.collapsed !== "true";
  for (const t of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    t.classList.toggle("active", !!p), t.setAttribute("aria-pressed", String(!!p));
  e.refreshCameraSelectors();
  const m = l('[data-role="scrub"]');
  m && (m.max = String(e.state.duration_frames - 1));
  const g = l('[data-role="frame"]');
  g && (g.max = String(e.state.duration_frames - 1));
  const d = l('[data-role="key-frame"]');
  d && (d.max = String(e.state.duration_frames - 1));
  const _ = l('[data-role="duration-seconds"]');
  _ && (_.value = String(e.state.duration_frames / e.state.fps));
  const o = l('[data-role="timeline-fps"]');
  o && (o.value = String(e.state.fps)), e.frame = i(e.frame, 0, e.state.duration_frames - 1), a && e.serialize(), (c !== e.state.duration_frames || r !== e.state.fps) && (e.computeAudioPeaks?.(), e.setFrame(e.frame, !1, !0), e.setStatus(`Timeline: ${e.state.duration_frames} frames · ${(e.state.duration_frames / e.state.fps).toFixed(2)} s`));
}
function I(e) {
  let a = null;
  try {
    a = JSON.parse(e.stateWidget?.value || "{}");
  } catch {
  }
  const c = new Set(e.state.objects.map((l) => l.id));
  e.state = W(a);
  const r = new Set(e.state.objects.map((l) => l.id));
  for (const l of c) r.has(l) || e.removeObjectResources(l);
  e.timelineKeyframes().some((l) => l.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.camera = x(e.state, Math.min(e.frame, e.state.duration_frames - 1)), e.syncFromWidgets(!1), e.root.querySelector('[data-role="gizmo-space"]').value = e.state.gizmo_space, e.restoreAssets(), e.refreshKeys(), e.refreshObjects(), e.render(), e.history?.clear(), e.sceneBaseline = e.stateWidget?.value ?? e.sceneBaseline, e.sceneName = e.state.metadata?.scene_name || "";
}
export {
  b as a,
  P as b,
  C as c,
  R as d,
  F as e,
  N as p,
  I as r,
  B as s
};
