import { sanitizeState as _, sampleCamera as y, cloneCamera as c, clamp as m } from "./omnicam-core.js";
function l(e) {
  return e.state.cameras.find((t) => t.id === e.state.active_camera_id) || e.state.cameras[0];
}
function h(e) {
  return e.state.cameras.find((t) => t.id === e.state.playblast_camera_id) || l(e);
}
function W(e) {
  const t = l(e);
  t.camera = c(e.camera), t.keyframes = e.state.keyframes, e.state.camera = c(e.camera);
}
function k(e) {
  W(e);
  const t = h(e);
  e.state.metadata = { ...e.state.metadata, playblast_camera_id: t.id, playblast_camera_name: t.name };
  const o = { ...e.state, camera: c(t.camera), keyframes: t.keyframes };
  e.stateWidget && (e.stateWidget.value = JSON.stringify(o)), e.widthWidget && (e.widthWidget.value = e.state.width), e.heightWidget && (e.heightWidget.value = e.state.height), e.fpsWidget && (e.fpsWidget.value = e.state.fps), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / e.state.fps), e.modeWidget && (e.modeWidget.value = e.state.render_mode), e.cardWidget && (e.cardWidget.value = e.state.card_asset || ""), e.node.graph?.setDirtyCanvas?.(!0, !0);
}
function w(e) {
  for (const t of [e.widthWidget, e.heightWidget, e.fpsWidget, e.durationWidget, e.modeWidget]) {
    if (!t || t.__omnicamCallback) continue;
    const o = t.callback;
    t.callback = (...d) => {
      const a = o?.apply(t, d);
      return e.syncFromWidgets(), a;
    }, t.__omnicamCallback = !0;
  }
}
function S(e, t = !0) {
  const o = e.state.duration_frames, d = e.state.fps;
  e.state.width = Number(e.widthWidget?.value || e.state.width), e.state.height = Number(e.heightWidget?.value || e.state.height), e.state.fps = Number(e.fpsWidget?.value || e.state.fps), e.state.duration_frames = Math.max(1, Math.round(Number(e.durationWidget?.value || 5) * e.state.fps));
  for (const r of e.state.cameras) {
    for (const s of r.keyframes) s.frame = m(Math.round(s.frame), 0, e.state.duration_frames - 1);
    r.keyframes = [...new Map(r.keyframes.map((s) => [s.frame, s])).values()].sort((s, n) => s.frame - n.frame);
  }
  e.state.keyframes = l(e).keyframes;
  for (const r of e.state.objects)
    r.keyframes = [...new Map((r.keyframes || []).map((s) => [m(Math.round(s.frame), 0, e.state.duration_frames - 1), { ...s, frame: m(Math.round(s.frame), 0, e.state.duration_frames - 1) }])).values()].sort((s, n) => s.frame - n.frame);
  e.timelineKeyframes().some((r) => r.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.state.render_mode = e.modeWidget?.value || e.state.render_mode;
  const a = (r) => e.root.querySelector(r);
  a('[data-role="mode"]').value = e.state.render_mode, a('[data-role="guides"]').checked = e.state.guides !== !1, a('[data-role="playblast-grid"]').checked = !!e.state.playblast_grid, a('[data-role="burn-in"]').checked = !!e.state.burn_in, a('[data-role="speed-heatmap"]').checked = !!e.state.speed_heatmap, a('[data-role="card-fit"]').value = e.state.card_fit || "contain";
  const f = a('[data-role="preview-layout"]');
  f && (f.value = e.state.preview_layout || "auto");
  const i = a('[data-role="safe-areas"]');
  i && (i.checked = !!e.state.safe_areas);
  const g = a('[data-role="resolution-gate"]');
  g && (g.checked = !!e.state.resolution_gate);
  const p = a('[data-role="aspect-ratio"]');
  p && (p.value = e.state.aspect_ratio || "auto"), a('[data-role="gizmo-space"]').value = e.state.gizmo_space || "world", a('[data-role="view-mode"]').value = e.state.view_mode || "camera", a('[data-role="ui-density"]').value = e.state.ui_density || "advanced", e.root.dataset.density = e.state.ui_density || "advanced", a('[data-role="camera-view-row"]').hidden = !e.state.camera_view_visible, e.root.querySelector('.view-nav [data-act="toggle-camera-view"]')?.classList.toggle("active", e.state.camera_view_visible), e.refreshCameraSelectors();
  const v = a('[data-role="scrub"]');
  v.max = String(e.state.duration_frames - 1), a('[data-role="frame"]').max = String(e.state.duration_frames - 1), a('[data-role="key-frame"]').max = String(e.state.duration_frames - 1), a('[data-role="duration-seconds"]').value = String(e.state.duration_frames / e.state.fps), a('[data-role="timeline-fps"]').value = String(e.state.fps), e.frame = m(e.frame, 0, e.state.duration_frames - 1), t && e.serialize(), (o !== e.state.duration_frames || d !== e.state.fps) && (e.setFrame(e.frame, !1, !0), e.setStatus(`Timeline: ${e.state.duration_frames} frames · ${(e.state.duration_frames / e.state.fps).toFixed(2)} s`));
}
function C(e) {
  let t = null;
  try {
    t = JSON.parse(e.stateWidget?.value || "{}");
  } catch {
  }
  const o = new Set(e.state.objects.map((a) => a.id));
  e.state = _(t);
  const d = new Set(e.state.objects.map((a) => a.id));
  for (const a of o) d.has(a) || e.removeObjectResources(a);
  e.timelineKeyframes().some((a) => a.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.camera = y(e.state, Math.min(e.frame, e.state.duration_frames - 1)), e.syncFromWidgets(!1), e.root.querySelector('[data-role="gizmo-space"]').value = e.state.gizmo_space, e.restoreAssets(), e.refreshKeys(), e.refreshObjects(), e.render(), e.history?.clear();
}
export {
  l as activeCameraTrack,
  w as bindWidgetCallbacks,
  h as playblastCameraTrack,
  C as restoreFromWidgets,
  k as serializeEditorState,
  W as syncActiveCameraTrack,
  S as syncFromWidgets
};
