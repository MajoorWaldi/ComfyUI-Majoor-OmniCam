import { sanitizeState as S, sampleCamera as b, cloneCamera as n, clamp as c } from "./omnicam-core.js";
function f(e) {
  return e.state.cameras.find((a) => a.id === e.state.active_camera_id) || e.state.cameras[0];
}
function h(e) {
  return e.state.cameras.find((a) => a.id === e.state.playblast_camera_id) || f(e);
}
function A(e) {
  const a = f(e);
  a.camera = n(e.camera), a.keyframes = e.state.keyframes, e.state.camera = n(e.camera);
}
function k(e) {
  A(e);
  const a = h(e);
  e.state.metadata = { ...e.state.metadata, playblast_camera_id: a.id, playblast_camera_name: a.name };
  const s = { ...e.state, camera: n(a.camera), keyframes: a.keyframes };
  e.stateWidget && (e.stateWidget.value = JSON.stringify(s)), e.widthWidget && (e.widthWidget.value = e.state.width), e.heightWidget && (e.heightWidget.value = e.state.height), e.fpsWidget && (e.fpsWidget.value = e.state.fps), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / e.state.fps), e.modeWidget && (e.modeWidget.value = e.state.render_mode), e.cardWidget && (e.cardWidget.value = e.state.card_asset || ""), e.node.graph?.setDirtyCanvas?.(!0, !0);
}
function w(e) {
  for (const a of [e.widthWidget, e.heightWidget, e.fpsWidget, e.durationWidget, e.modeWidget]) {
    if (!a || a.__omnicamCallback) continue;
    const s = a.callback;
    a.callback = (...l) => {
      const r = s?.apply(a, l);
      return e.syncFromWidgets(), r;
    }, a.__omnicamCallback = !0;
  }
}
function W(e, a = !0) {
  const s = e.state.duration_frames, l = e.state.fps;
  e.state.width = Number(e.widthWidget?.value || e.state.width), e.state.height = Number(e.heightWidget?.value || e.state.height), e.state.fps = Number(e.fpsWidget?.value || e.state.fps), e.state.duration_frames = Math.max(1, Math.round(Number(e.durationWidget?.value || 5) * e.state.fps));
  for (const t of e.state.cameras) {
    for (const o of t.keyframes) o.frame = c(Math.round(o.frame), 0, e.state.duration_frames - 1);
    t.keyframes = [...new Map(t.keyframes.map((o) => [o.frame, o])).values()].sort((o, d) => o.frame - d.frame);
  }
  e.state.keyframes = f(e).keyframes;
  for (const t of e.state.objects)
    t.keyframes = [...new Map((t.keyframes || []).map((o) => [c(Math.round(o.frame), 0, e.state.duration_frames - 1), { ...o, frame: c(Math.round(o.frame), 0, e.state.duration_frames - 1) }])).values()].sort((o, d) => o.frame - d.frame);
  e.timelineKeyframes().some((t) => t.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.state.render_mode = e.modeWidget?.value || e.state.render_mode;
  const r = (t) => e.root.querySelector(t);
  for (const t of e.root.querySelectorAll('[data-role="mode"]')) t.value = e.state.render_mode;
  for (const t of e.root.querySelectorAll('[data-role="guides"]')) t.checked = e.state.guides !== !1;
  for (const t of e.root.querySelectorAll('[data-role="playblast-grid"]')) t.checked = !!e.state.playblast_grid;
  for (const t of e.root.querySelectorAll('[data-role="show-wireframe"]')) t.checked = !!e.state.show_wireframe;
  for (const t of e.root.querySelectorAll('[data-role="show-vertices"]')) t.checked = !!e.state.show_vertices;
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
  for (const t of e.root.querySelectorAll('[data-role="view-mode"]')) t.value = e.state.view_mode || "camera";
  for (const t of e.root.querySelectorAll('[data-role="ui-density"]')) t.value = e.state.ui_density || "advanced";
  e.root.dataset.density = e.state.ui_density || "advanced";
  for (const t of e.root.querySelectorAll('[data-role="camera-view-row"]')) t.hidden = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    t.classList.toggle("active", e.state.camera_view_visible);
  for (const t of e.root.querySelectorAll('[data-role="camera-type"]')) t.value = e.camera.camera_type || "perspective";
  for (const t of e.root.querySelectorAll('[data-role="speed"]')) t.value = String(e.cameraSpeed || 1);
  for (const t of e.root.querySelectorAll('[data-act="loop"]'))
    t.classList.toggle("active", !!e.state.loop_playback), t.setAttribute("aria-pressed", String(!!e.state.loop_playback));
  for (const t of e.root.querySelectorAll('[data-act="toggle-snap"]'))
    t.classList.toggle("active", e.state.snap_enabled !== !1), t.setAttribute("aria-pressed", String(e.state.snap_enabled !== !1));
  for (const t of e.root.querySelectorAll('[data-act="toggle-timecode"]'))
    t.classList.toggle("active", e.state.timecode_mode === "timecode"), t.setAttribute("aria-pressed", String(e.state.timecode_mode === "timecode"));
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
  const m = e.root.querySelector('[data-role="viewport-inspector"]'), p = m && m.dataset.collapsed !== "true";
  for (const t of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    t.classList.toggle("active", !!p), t.setAttribute("aria-pressed", String(!!p));
  e.refreshCameraSelectors();
  const g = r('[data-role="scrub"]');
  g && (g.max = String(e.state.duration_frames - 1));
  const y = r('[data-role="frame"]');
  y && (y.max = String(e.state.duration_frames - 1));
  const i = r('[data-role="key-frame"]');
  i && (i.max = String(e.state.duration_frames - 1));
  const v = r('[data-role="duration-seconds"]');
  v && (v.value = String(e.state.duration_frames / e.state.fps));
  const _ = r('[data-role="timeline-fps"]');
  _ && (_.value = String(e.state.fps)), e.frame = c(e.frame, 0, e.state.duration_frames - 1), a && e.serialize(), (s !== e.state.duration_frames || l !== e.state.fps) && (e.computeAudioPeaks?.(), e.setFrame(e.frame, !1, !0), e.setStatus(`Timeline: ${e.state.duration_frames} frames · ${(e.state.duration_frames / e.state.fps).toFixed(2)} s`));
}
function B(e) {
  let a = null;
  try {
    a = JSON.parse(e.stateWidget?.value || "{}");
  } catch {
  }
  const s = new Set(e.state.objects.map((r) => r.id));
  e.state = S(a);
  const l = new Set(e.state.objects.map((r) => r.id));
  for (const r of s) l.has(r) || e.removeObjectResources(r);
  e.timelineKeyframes().some((r) => r.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.camera = b(e.state, Math.min(e.frame, e.state.duration_frames - 1)), e.syncFromWidgets(!1), e.root.querySelector('[data-role="gizmo-space"]').value = e.state.gizmo_space, e.restoreAssets(), e.refreshKeys(), e.refreshObjects(), e.render(), e.history?.clear();
}
export {
  f as activeCameraTrack,
  w as bindWidgetCallbacks,
  h as playblastCameraTrack,
  B as restoreFromWidgets,
  k as serializeEditorState,
  A as syncActiveCameraTrack,
  W as syncFromWidgets
};
