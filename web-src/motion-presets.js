// Motion presets, procedural camera shakes, and proxy presets for OmniCam Director.

import { applyCameraShake as coreApplyCameraShake, cloneCamera, generateCameraPreset } from "./director/core.js";

export function applyCameraPreset(ui, presetName) {
  ui.checkpoint(`Apply preset: ${presetName}`);
  const cam = ui.activeCameraTrack();
  const newKeys = generateCameraPreset(presetName, {
    duration_frames: ui.state.duration_frames,
    target: ui.camera.target || [0, 1.5, 0],
  });
  cam.keyframes = newKeys;
  if (cam.id === ui.state.active_camera_id) {
    ui.state.keyframes = newKeys;
  }
  ui.serialize();
  ui.refreshKeys();
  ui.setFrame(0, true);
  ui.render();
  ui.setStatus(`Preset applied: ${presetName}`);
}

export function applyCameraShake(ui, shakeType) {
  ui.checkpoint(`Apply camera shake: ${shakeType}`);
  const cam = ui.activeCameraTrack();
  if (!cam.keyframes || cam.keyframes.length === 0) {
    cam.keyframes = [
      { frame: 0, camera: cloneCamera(ui.camera), interpolation: "smooth" },
      { frame: ui.state.duration_frames - 1, camera: cloneCamera(ui.camera), interpolation: "smooth" },
    ];
  }
  const shaken = coreApplyCameraShake(cam, { type: shakeType, intensity: 1.0, duration_frames: ui.state.duration_frames });
  cam.keyframes = shaken;
  if (cam.id === ui.state.active_camera_id) {
    ui.state.keyframes = shaken;
  }
  ui.serialize();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(`Camera shake applied: ${shakeType}`);
}

export function applyProxyPreset(ui, preset) {
  const presets = {
    clean_proxy: { render_mode: "omni_ref", playblast_grid: true, burn_in: false, speed_heatmap: false, guides: false, safe_areas: false },
    debug_motion: { render_mode: "wireframe", playblast_grid: true, burn_in: true, speed_heatmap: true, guides: true, safe_areas: false },
    cinematic_view: { render_mode: "graybox", playblast_grid: false, burn_in: false, speed_heatmap: false, guides: true, safe_areas: true },
  };
  const cfg = presets[preset];
  if (!cfg) return;
  ui.checkpoint(`Apply proxy preset: ${preset}`);
  Object.assign(ui.state, cfg);
  ui.serialize();
  ui.render();
  ui.setStatus(`Proxy preset applied: ${preset}`);
}

export function applyBlockingScenePreset(ui, sceneType) {
  ui.checkpoint(`Apply blocking scene: ${sceneType}`);
  const duration = ui.state.duration_frames || 120;
  const cam = ui.activeCameraTrack();

  if (sceneType === "foreground_reveal") {
    ui.state.objects = [
      { id: "fg_pillar", name: "Foreground Pillar", type: "cube", transform: { position: [-1.4, 1.5, 2.2], rotation: [0, 0, 0], scale: [0.4, 3.2, 0.4] }, material_mode: "neutral", enabled: true },
      { id: "subject_card", name: "Subject Card", type: "card", transform: { position: [0.2, 1.5, 0], rotation: [0, 0, 0], scale: [2.0, 2.0, 1.0] }, material_mode: "original", enabled: true },
      { id: "bg_wall", name: "Background Wall", type: "cube", transform: { position: [0, 2.0, -5.0], rotation: [0, 0, 0], scale: [10.0, 4.0, 0.2] }, material_mode: "neutral", enabled: true },
    ];
    cam.keyframes = [
      { frame: 0, camera: { position: [-3.2, 1.5, 4.2], target: [0.2, 1.5, 0], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
      { frame: duration - 1, camera: { position: [1.8, 1.5, 3.8], target: [0.2, 1.5, 0], fov: 32, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
    ];
  } else if (sceneType === "doorway_pass") {
    ui.state.objects = [
      { id: "wall_left", name: "Wall Left", type: "cube", transform: { position: [-2.2, 1.5, 2.0], rotation: [0, 0, 0], scale: [2.8, 3.2, 0.3] }, material_mode: "neutral", enabled: true },
      { id: "wall_right", name: "Wall Right", type: "cube", transform: { position: [2.2, 1.5, 2.0], rotation: [0, 0, 0], scale: [2.8, 3.2, 0.3] }, material_mode: "neutral", enabled: true },
      { id: "door_lintel", name: "Door Lintel", type: "cube", transform: { position: [0, 2.9, 2.0], rotation: [0, 0, 0], scale: [1.6, 0.5, 0.3] }, material_mode: "neutral", enabled: true },
      { id: "room_subject", name: "Subject", type: "sphere", transform: { position: [0, 1.2, -2.5], rotation: [0, 0, 0], scale: [1.0, 1.0, 1.0] }, material_mode: "original", enabled: true },
    ];
    cam.keyframes = [
      { frame: 0, camera: { position: [0, 1.6, 6.5], target: [0, 1.2, -2.5], fov: 40, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
      { frame: duration - 1, camera: { position: [0, 1.4, -0.5], target: [0, 1.2, -2.5], fov: 40, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
    ];
  } else if (sceneType === "over_the_shoulder") {
    ui.state.objects = [
      { id: "fg_human", name: "Foreground OTS", type: "human", transform: { position: [-0.6, 0, 1.4], rotation: [0, 25, 0], scale: [1, 1, 1] }, material_mode: "wireframe", enabled: true },
      { id: "main_subject", name: "Primary Subject", type: "cube", transform: { position: [0.6, 1.2, -1.2], rotation: [0, -15, 0], scale: [1, 1.5, 0.8] }, material_mode: "original", enabled: true },
    ];
    cam.keyframes = [
      { frame: 0, camera: { position: [-1.1, 1.7, 2.6], target: [0.6, 1.4, -1.2], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
      { frame: duration - 1, camera: { position: [-0.9, 1.65, 2.2], target: [0.6, 1.4, -1.2], fov: 30, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
    ];
  } else if (sceneType === "perspective_corridor") {
    ui.state.objects = [
      { id: "col_l1", name: "Column L1", type: "cube", transform: { position: [-1.8, 1.5, 4.0], rotation: [0, 0, 0], scale: [0.4, 3.0, 0.4] }, material_mode: "neutral", enabled: true },
      { id: "col_r1", name: "Column R1", type: "cube", transform: { position: [1.8, 1.5, 4.0], rotation: [0, 0, 0], scale: [0.4, 3.0, 0.4] }, material_mode: "neutral", enabled: true },
      { id: "col_l2", name: "Column L2", type: "cube", transform: { position: [-1.8, 1.5, 1.5], rotation: [0, 0, 0], scale: [0.4, 3.0, 0.4] }, material_mode: "neutral", enabled: true },
      { id: "col_r2", name: "Column R2", type: "cube", transform: { position: [1.8, 1.5, 1.5], rotation: [0, 0, 0], scale: [0.4, 3.0, 0.4] }, material_mode: "neutral", enabled: true },
      { id: "col_l3", name: "Column L3", type: "cube", transform: { position: [-1.8, 1.5, -1.0], rotation: [0, 0, 0], scale: [0.4, 3.0, 0.4] }, material_mode: "neutral", enabled: true },
      { id: "col_r3", name: "Column R3", type: "cube", transform: { position: [1.8, 1.5, -1.0], rotation: [0, 0, 0], scale: [0.4, 3.0, 0.4] }, material_mode: "neutral", enabled: true },
      { id: "center_focus", name: "Corridor Target", type: "sphere", transform: { position: [0, 1.5, -4.0], rotation: [0, 0, 0], scale: [0.8, 0.8, 0.8] }, material_mode: "original", enabled: true },
    ];
    cam.keyframes = [
      { frame: 0, camera: { position: [0, 1.6, 6.0], target: [0, 1.5, -4.0], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
      { frame: duration - 1, camera: { position: [0, 1.6, 0.5], target: [0, 1.5, -4.0], fov: 45, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
    ];
  } else if (sceneType === "tabletop_orbit") {
    ui.state.objects = [
      { id: "pedestal", name: "Pedestal Table", type: "cube", transform: { position: [0, 0.4, 0], rotation: [0, 0, 0], scale: [2.0, 0.8, 2.0] }, material_mode: "neutral", enabled: true },
      { id: "product", name: "Product Hero", type: "sphere", transform: { position: [0, 1.2, 0], rotation: [0, 0, 0], scale: [0.7, 0.7, 0.7] }, material_mode: "original", enabled: true },
    ];
    cam.keyframes = [
      { frame: 0, camera: { position: [0, 1.4, 3.2], target: [0, 1.0, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
      { frame: Math.round(duration * 0.25), camera: { position: [3.2, 1.4, 0], target: [0, 1.0, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
      { frame: Math.round(duration * 0.5), camera: { position: [0, 1.4, -3.2], target: [0, 1.0, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
      { frame: Math.round(duration * 0.75), camera: { position: [-3.2, 1.4, 0], target: [0, 1.0, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
      { frame: duration - 1, camera: { position: [0, 1.4, 3.2], target: [0, 1.0, 0], fov: 35, roll: 0, camera_type: "perspective", zoom: 1, near: 0.01, far: 10000 }, interpolation: "smooth" },
    ];
  }

  if (cam.id === ui.state.active_camera_id) {
    ui.state.keyframes = cam.keyframes;
  }
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.setFrame(0, true);
  ui.render();
  ui.setStatus(`Blocking scene set: ${sceneType.replace('_', ' ')}`);
}
