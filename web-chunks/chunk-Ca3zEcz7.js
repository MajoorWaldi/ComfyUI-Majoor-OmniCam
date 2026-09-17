import { y as f, bJ as l, b6 as S, bK as A, c as v, bL as q, s as k, a as W } from "./chunk--JO3cX__.js";
import { a as x } from "./chunk-CTXwjaoT.js";
function w(e) {
  if (!e?.root?.style?.setProperty) return;
  const a = f(
    Number(e.state.outliner_height) || l.outlinerHeight.default,
    l.outlinerHeight.min,
    l.outlinerHeight.max
  ), n = f(
    Number(e.state.preview_width) || l.previewWidth.default,
    l.previewWidth.min,
    l.previewWidth.max
  ), r = f(
    Number(e.state.side_width) || l.sideWidth.default,
    l.sideWidth.min,
    l.sideWidth.max
  ), s = f(
    Number(e.state.left_width) || l.leftWidth.default,
    l.leftWidth.min,
    l.leftWidth.max
  ), d = f(
    Number(e.state.graph_height) || l.graphHeight.default,
    l.graphHeight.min,
    l.graphHeight.max
  ), g = f(
    Number(e.state.assets_height) || l.assetsHeight.default,
    l.assetsHeight.min,
    l.assetsHeight.max
  ), m = f(
    Number(e.state.agent_height) || l.agentHeight.default,
    l.agentHeight.min,
    l.agentHeight.max
  );
  e.root.style.setProperty("--oc-outliner-h", `${Math.round(a)}px`), e.root.style.setProperty("--oc-preview-w", `${Math.round(n)}px`), e.root.style.setProperty("--oc-side-w", `${Math.round(r)}px`), e.root.style.setProperty("--oc-left-w", `${Math.round(s)}px`), e.root.style.setProperty("--oc-graph-h", `${Math.round(d)}px`), e.root.style.setProperty("--oc-assets-h", `${Math.round(g)}px`), e.root.style.setProperty("--oc-agent-h", `${Math.round(m)}px`);
}
const K = {
  "outliner-resize": { axis: "y", direction: 1, stateKey: "outliner_height", bounds: l.outlinerHeight, cssVar: "--oc-outliner-h" },
  "preview-resize": { axis: "x", direction: 1, stateKey: "preview_width", bounds: l.previewWidth, cssVar: "--oc-preview-w" },
  "side-resize": { axis: "x", direction: -1, stateKey: "side_width", bounds: l.sideWidth, cssVar: "--oc-side-w" },
  "left-resize": { axis: "x", direction: 1, stateKey: "left_width", bounds: l.leftWidth, cssVar: "--oc-left-w" },
  "graph-resize": { axis: "y", direction: 1, stateKey: "graph_height", bounds: l.graphHeight, cssVar: "--oc-graph-h" },
  "assets-resize": { axis: "y", direction: 1, stateKey: "assets_height", bounds: l.assetsHeight, cssVar: "--oc-assets-h" },
  "agent-resize": { axis: "y", direction: 1, stateKey: "agent_height", bounds: l.agentHeight, cssVar: "--oc-agent-h" }
};
function u(e, a) {
  w(e);
  for (const [n, r] of Object.entries(K)) {
    const s = e.root.querySelector(`[data-role="${n}"]`);
    if (!s) continue;
    const d = r.direction ?? 1, g = typeof globalThis.requestAnimationFrame == "function" ? (t) => globalThis.requestAnimationFrame(t) : (t) => t();
    let m = !1;
    const y = (t) => {
      e.root.style.setProperty(r.cssVar, `${Math.round(f(t, r.bounds.min, r.bounds.max))}px`), !m && (m = !0, g(() => {
        m = !1, e.refitNode?.();
      }));
    }, p = (t) => {
      const o = Math.round(f(t, r.bounds.min, r.bounds.max));
      e.state[r.stateKey] = o, y(o), r.stateKey === "preview_width" ? (e.refreshCameraPreviews?.(), e.requestRender?.("layout")) : r.stateKey === "side_width" || r.stateKey === "left_width" ? e.scheduleResizeAndRender?.() : r.stateKey === "graph_height" && (e.refreshGraph?.(), e.drawCurveEditor?.()), e.refitNode?.(), e.scheduleSerialize?.();
    }, h = (t) => r.axis === "y" ? t.clientY : t.clientX;
    let c = null;
    s.addEventListener("pointerdown", (t) => {
      t.button === 0 && (t.preventDefault(), s.setPointerCapture?.(t.pointerId), c = { pointerId: t.pointerId, origin: h(t), start: Number(e.state[r.stateKey]) || r.bounds.default });
    }, { signal: a }), s.addEventListener("pointermove", (t) => {
      !c || t.pointerId !== c.pointerId || y(c.start + (h(t) - c.origin) * d);
    }, { signal: a });
    const _ = (t) => {
      !c || t.pointerId !== c.pointerId || (s.releasePointerCapture?.(t.pointerId), p(c.start + (h(t) - c.origin) * d), c = null);
    };
    s.addEventListener("pointerup", _, { signal: a }), s.addEventListener("pointercancel", _, { signal: a }), s.addEventListener("dblclick", (t) => {
      t.preventDefault(), p(r.bounds.default);
    }, { signal: a }), s.addEventListener("keydown", (t) => {
      const o = (t.shiftKey ? 48 : 16) * d, i = Number(e.state[r.stateKey]) || r.bounds.default;
      t.key === "ArrowDown" || t.key === "ArrowRight" ? (t.preventDefault(), p(i + o)) : t.key === "ArrowUp" || t.key === "ArrowLeft" ? (t.preventDefault(), p(i - o)) : t.key === "Home" && (t.preventDefault(), p(r.bounds.default));
    }, { signal: a });
  }
}
function b(e) {
  return e?.state?.cameras?.length || (e.state.cameras = [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: v(e?.camera), keyframes: e?.state?.keyframes || [] }]), e.state.cameras.find((a) => a.id === e.state.active_camera_id) || e.state.cameras[0];
}
function M(e) {
  if (!e?.state?.cameras?.length)
    return b(e);
  if (e.state.playblast_camera_id === S) {
    const a = q(e.state, e.frame), n = a && e.state.cameras.find((r) => r.id === a.camera_id);
    if (n) return n;
  }
  return e.state.cameras.find((a) => a.id === e.state.playblast_camera_id) || b(e);
}
function L(e) {
  const a = b(e);
  a && (a.camera = v(e.camera), a.keyframes = e.state.keyframes, e.state.camera = v(e.camera));
}
function H(e) {
  if (e.disposed) return;
  e.directorRevision = (Number.isInteger(e.directorRevision) ? Math.max(0, e.directorRevision) : 0) + 1, e.renderRevision = (e.renderRevision || 0) + 1, L(e);
  const a = e.state.playblast_camera_id === S && A(e.state), n = M(e);
  e.recordingWidget && (a ? e.recordingWidget.value = e.state.sequence.recording_path || "" : (!e.state.cameras.some((d) => !!d.recording_path) && !n.recording_path && e.recordingWidget.value && (n.recording_path = String(e.recordingWidget.value)), e.recordingWidget.value = n.recording_path || "")), e.state.metadata = {
    ...e.state.metadata,
    playblast_camera_id: a ? S : n.id,
    playblast_camera_name: a ? "Sequence" : n.name
  };
  const r = { ...e.state, camera: v(n.camera), keyframes: n.keyframes };
  r.metadata = { ...r.metadata, motion_scene_fingerprint_live: x(e.state) }, e.stateWidget && (e.stateWidget.value = JSON.stringify(r)), e.widthWidget && (e.widthWidget.value = e.state.width), e.heightWidget && (e.heightWidget.value = e.state.height), e.fpsWidget && (e.fpsWidget.value = e.state.fps), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / e.state.fps), e.modeWidget && (e.modeWidget.value = e.state.render_mode), e.cardWidget && (e.cardWidget.value = e.state.card_asset || ""), e.node.graph?.setDirtyCanvas?.(!0, !0);
}
function C(e) {
  for (const a of [e.widthWidget, e.heightWidget, e.fpsWidget, e.durationWidget, e.modeWidget]) {
    if (!a || a.__omnicamCallback) continue;
    const n = a.callback;
    a.callback = (...r) => {
      const s = n?.apply(a, r);
      return e.syncFromWidgets(), s;
    }, a.__omnicamCallback = !0;
  }
}
function B(e, a = !0) {
  const n = e.state.duration_frames, r = e.state.fps;
  e.state.width = Number(e.widthWidget?.value || e.state.width), e.state.height = Number(e.heightWidget?.value || e.state.height), e.state.fps = Number(e.fpsWidget?.value || e.state.fps), e.state.duration_frames = Math.max(1, Math.round(Number(e.durationWidget?.value || 5) * e.state.fps));
  for (const t of e.state.cameras) {
    for (const o of t.keyframes) o.frame = Math.max(0, Math.round(o.frame));
    t.keyframes = [...new Map(t.keyframes.map((o) => [o.frame, o])).values()].sort((o, i) => o.frame - i.frame);
  }
  e.state.keyframes = b(e).keyframes;
  for (const t of e.state.objects)
    t.keyframes = [...new Map((t.keyframes || []).map((o) => {
      const i = Math.max(0, Math.round(o.frame));
      return [i, { ...o, frame: i }];
    })).values()].sort((o, i) => o.frame - i.frame);
  e.timelineKeyframes().some((t) => t.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.state.render_mode = e.modeWidget?.value || e.state.render_mode;
  const s = (t) => e.root.querySelector(t);
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
    const o = e.selectedEntity === "camera_target";
    t.classList.toggle("active", o), t.setAttribute("aria-pressed", String(o));
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
  const d = e.state.view_mode || "perspective";
  for (const t of e.root.querySelectorAll('[data-role="view-mode"]')) t.value = d;
  for (const t of e.root.querySelectorAll("[data-view]")) {
    const o = t.dataset.view === d;
    t.classList.toggle("active", o), t.setAttribute("aria-pressed", String(o));
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
  for (const t of e.root.querySelectorAll('[data-role="proxy-preset"]')) t.value = e.state.proxy_preset || "balanced";
  for (const t of e.root.querySelectorAll('[data-role="snap-frames"]')) t.value = String(e.state.snap_frames || 1);
  for (const t of e.root.querySelectorAll('[data-act="auto-key"]'))
    t.classList.toggle("active", !!e.state.auto_key), t.setAttribute("aria-pressed", String(!!e.state.auto_key));
  for (const t of e.root.querySelectorAll("[data-select-mode]")) {
    const o = t.dataset.selectMode === (e.state.select_mode || "object");
    t.classList.toggle("active", o), t.setAttribute("aria-pressed", String(o));
  }
  for (const t of e.root.querySelectorAll("[data-transform-mode]")) {
    const o = t.dataset.transformMode === (e.state.gizmo_mode || "translate");
    t.classList.toggle("active", o), t.setAttribute("aria-pressed", String(o));
  }
  const g = e.root.querySelector('[data-role="viewport-inspector"]'), m = g && g.dataset.collapsed !== "true";
  for (const t of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    t.classList.toggle("active", !!m), t.setAttribute("aria-pressed", String(!!m));
  e.refreshCameraSelectors();
  const y = s('[data-role="scrub"]');
  y && (y.max = String(e.state.duration_frames - 1));
  const p = s('[data-role="frame"]');
  p && (p.max = String(e.state.duration_frames - 1));
  const h = s('[data-role="key-frame"]');
  h && (h.max = String(e.state.duration_frames - 1));
  const c = s('[data-role="duration-seconds"]');
  c && (c.value = String(e.state.duration_frames / e.state.fps));
  const _ = s('[data-role="timeline-fps"]');
  _ && (_.value = String(e.state.fps)), e.frame = f(e.frame, 0, e.state.duration_frames - 1), a && e.serialize(), (n !== e.state.duration_frames || r !== e.state.fps) && (e.computeAudioPeaks?.(), e.setFrame(e.frame, !1, !0), e.setStatus(`Timeline: ${e.state.duration_frames} frames · ${(e.state.duration_frames / e.state.fps).toFixed(2)} s`));
}
function E(e) {
  let a = null;
  try {
    a = JSON.parse(e.stateWidget?.value || "{}");
  } catch {
  }
  const n = new Set(e.state.objects.map((s) => s.id));
  e.state = k(a);
  const r = new Set(e.state.objects.map((s) => s.id));
  for (const s of n) r.has(s) || e.removeObjectResources(s);
  e.timelineKeyframes().some((s) => s.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.camera = W(e.state, Math.min(e.frame, e.state.duration_frames - 1)), e.syncFromWidgets(!1), e.root.querySelector('[data-role="gizmo-space"]').value = e.state.gizmo_space, e.restoreAssets(), e.refreshKeys(), e.refreshObjects(), e.render(), e.history?.clear(), e.sceneBaseline = e.stateWidget?.value ?? e.sceneBaseline, e.sceneName = e.state.metadata?.scene_name || "";
}
export {
  b as a,
  u as b,
  L as c,
  C as d,
  B as e,
  M as p,
  E as r,
  H as s
};
