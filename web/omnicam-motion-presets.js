import { generateCameraPreset as n, cloneCamera as o, applyCameraShake as s } from "./omnicam-core.js";
function m(e, a) {
  e.checkpoint(`Apply preset: ${a}`);
  const r = e.activeCameraTrack(), t = n(a, {
    duration_frames: e.state.duration_frames,
    target: e.camera.target || [0, 1.5, 0]
  });
  r.keyframes = t, r.id === e.state.active_camera_id && (e.state.keyframes = t), e.serialize(), e.refreshKeys(), e.setFrame(0, !0), e.render(), e.setStatus(`Preset applied: ${a}`);
}
function l(e, a) {
  e.checkpoint(`Apply camera shake: ${a}`);
  const r = e.activeCameraTrack();
  (!r.keyframes || r.keyframes.length === 0) && (r.keyframes = [
    { frame: 0, camera: o(e.camera), interpolation: "smooth" },
    { frame: e.state.duration_frames - 1, camera: o(e.camera), interpolation: "smooth" }
  ]);
  const t = s(r, { type: a, intensity: 1, duration_frames: e.state.duration_frames });
  r.keyframes = t, r.id === e.state.active_camera_id && (e.state.keyframes = t), e.serialize(), e.refreshKeys(), e.render(), e.setStatus(`Camera shake applied: ${a}`);
}
function p(e, a) {
  const t = {
    clean_proxy: { render_mode: "omni_ref", playblast_grid: !0, burn_in: !1, speed_heatmap: !1, guides: !1, safe_areas: !1 },
    debug_motion: { render_mode: "wireframe", playblast_grid: !0, burn_in: !0, speed_heatmap: !0, guides: !0, safe_areas: !1 },
    cinematic_view: { render_mode: "graybox", playblast_grid: !1, burn_in: !1, speed_heatmap: !1, guides: !0, safe_areas: !0 }
  }[a];
  t && (e.checkpoint(`Apply proxy preset: ${a}`), Object.assign(e.state, t), e.serialize(), e.render(), e.setStatus(`Proxy preset applied: ${a}`));
}
function c(e, a) {
  e.checkpoint(`Apply blocking scene: ${a}`);
  const r = e.state.duration_frames || 120, t = e.activeCameraTrack();
  a === "foreground_reveal" ? (e.state.objects = [
    { id: "fg_pillar", name: "Foreground Pillar", type: "cube", transform: { position: [-1.4, 1.5, 2.2], rotation: [0, 0, 0], scale: [0.4, 3.2, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "subject_card", name: "Subject Card", type: "card", transform: { position: [0.2, 1.5, 0], rotation: [0, 0, 0], scale: [2, 2, 1] }, material_mode: "original", enabled: !0 },
    { id: "bg_wall", name: "Background Wall", type: "cube", transform: { position: [0, 2, -5], rotation: [0, 0, 0], scale: [10, 4, 0.2] }, material_mode: "neutral", enabled: !0 }
  ], t.keyframes = [
    { frame: 0, camera: { position: [-3.2, 1.5, 4.2], target: [0.2, 1.5, 0], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: r - 1, camera: { position: [1.8, 1.5, 3.8], target: [0.2, 1.5, 0], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" }
  ]) : a === "doorway_pass" ? (e.state.objects = [
    { id: "wall_left", name: "Wall Left", type: "cube", transform: { position: [-2.2, 1.5, 2], rotation: [0, 0, 0], scale: [2.8, 3.2, 0.3] }, material_mode: "neutral", enabled: !0 },
    { id: "wall_right", name: "Wall Right", type: "cube", transform: { position: [2.2, 1.5, 2], rotation: [0, 0, 0], scale: [2.8, 3.2, 0.3] }, material_mode: "neutral", enabled: !0 },
    { id: "door_lintel", name: "Door Lintel", type: "cube", transform: { position: [0, 2.9, 2], rotation: [0, 0, 0], scale: [1.6, 0.5, 0.3] }, material_mode: "neutral", enabled: !0 },
    { id: "room_subject", name: "Subject", type: "sphere", transform: { position: [0, 1.2, -2.5], rotation: [0, 0, 0], scale: [1, 1, 1] }, material_mode: "original", enabled: !0 }
  ], t.keyframes = [
    { frame: 0, camera: { position: [0, 1.6, 6.5], target: [0, 1.2, -2.5], fov: 40, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: r - 1, camera: { position: [0, 1.4, -0.5], target: [0, 1.2, -2.5], fov: 40, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" }
  ]) : a === "over_the_shoulder" ? (e.state.objects = [
    { id: "fg_human", name: "Foreground OTS", type: "human", transform: { position: [-0.6, 0, 1.4], rotation: [0, 25, 0], scale: [1, 1, 1] }, material_mode: "wireframe", enabled: !0 },
    { id: "main_subject", name: "Primary Subject", type: "cube", transform: { position: [0.6, 1.2, -1.2], rotation: [0, -15, 0], scale: [1, 1.5, 0.8] }, material_mode: "original", enabled: !0 }
  ], t.keyframes = [
    { frame: 0, camera: { position: [-1.1, 1.7, 2.6], target: [0.6, 1.4, -1.2], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: r - 1, camera: { position: [-0.9, 1.65, 2.2], target: [0.6, 1.4, -1.2], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" }
  ]) : a === "perspective_corridor" ? (e.state.objects = [
    { id: "col_l1", name: "Column L1", type: "cube", transform: { position: [-1.8, 1.5, 4], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "col_r1", name: "Column R1", type: "cube", transform: { position: [1.8, 1.5, 4], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "col_l2", name: "Column L2", type: "cube", transform: { position: [-1.8, 1.5, 1.5], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "col_r2", name: "Column R2", type: "cube", transform: { position: [1.8, 1.5, 1.5], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "col_l3", name: "Column L3", type: "cube", transform: { position: [-1.8, 1.5, -1], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "col_r3", name: "Column R3", type: "cube", transform: { position: [1.8, 1.5, -1], rotation: [0, 0, 0], scale: [0.4, 3, 0.4] }, material_mode: "neutral", enabled: !0 },
    { id: "center_focus", name: "Corridor Target", type: "sphere", transform: { position: [0, 1.5, -4], rotation: [0, 0, 0], scale: [0.8, 0.8, 0.8] }, material_mode: "original", enabled: !0 }
  ], t.keyframes = [
    { frame: 0, camera: { position: [0, 1.6, 6], target: [0, 1.5, -4], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: r - 1, camera: { position: [0, 1.6, 0.5], target: [0, 1.5, -4], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" }
  ]) : a === "tabletop_orbit" && (e.state.objects = [
    { id: "pedestal", name: "Pedestal Table", type: "cube", transform: { position: [0, 0.4, 0], rotation: [0, 0, 0], scale: [2, 0.8, 2] }, material_mode: "neutral", enabled: !0 },
    { id: "product", name: "Product Hero", type: "sphere", transform: { position: [0, 1.2, 0], rotation: [0, 0, 0], scale: [0.7, 0.7, 0.7] }, material_mode: "original", enabled: !0 }
  ], t.keyframes = [
    { frame: 0, camera: { position: [0, 1.4, 3.2], target: [0, 1, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: Math.round(r * 0.25), camera: { position: [3.2, 1.4, 0], target: [0, 1, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: Math.round(r * 0.5), camera: { position: [0, 1.4, -3.2], target: [0, 1, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: Math.round(r * 0.75), camera: { position: [-3.2, 1.4, 0], target: [0, 1, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" },
    { frame: r - 1, camera: { position: [0, 1.4, 3.2], target: [0, 1, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 1e4 }, interpolation: "smooth" }
  ]), t.id === e.state.active_camera_id && (e.state.keyframes = t.keyframes), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setFrame(0, !0), e.render(), e.setStatus(`Blocking scene set: ${a.replace("_", " ")}`);
}
export {
  c as applyBlockingScenePreset,
  m as applyCameraPreset,
  l as applyCameraShake,
  p as applyProxyPreset
};
