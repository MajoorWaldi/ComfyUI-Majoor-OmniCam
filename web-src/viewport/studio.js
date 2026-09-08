// Studio look for the viewport: image-based lighting, a three-point rig, soft
// shadows on a catcher plane, and a graded sky.
//
// This is the "Tripo / Meshy / Mixamo" presentation layer. It is deliberately
// separate from the proxy render so the two can disagree: while the editor is
// being driven the viewport can be beautiful, and the playblast still falls
// back to the neutral motion reference the conditioning models expect
// (AGENTS.md §7). The only render mode that keeps the studio look during a
// capture is "beauty", which the user has to pick explicitly.

import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// `renderScale` is a supersample factor the host blit reads: the WebGL canvas
// is drawn at this multiple of the viewport's backing size and scaled back
// down, which is the cheapest antialiasing that also sharpens shadow and
// silhouette edges. It only applies to the interactive viewport, never a
// capture. Shadow maps went up a stop across the board -- a 1024 map over a
// 24-unit frustum was the coarse-penumbra "video game" tell.
export const QUALITY_PRESETS = {
  low: { shadows: true, shadowSize: 1024, toneExposure: 0.9, renderScale: 1 },
  balanced: { shadows: true, shadowSize: 2048, toneExposure: 0.95, renderScale: 1.25 },
  high: { shadows: true, shadowSize: 4096, toneExposure: 1.0, renderScale: 1.5 },
};

export const DEFAULT_QUALITY = "balanced";

// The colour the editor state carries when the user has not picked one. Seeing
// it means "no preference", which is when the studio sky is allowed to show.
export const DEFAULT_BG_COLOR = "#121212";

/** Resolve a quality name coming from settings or a workflow into a preset. */
export function qualityPreset(name) {
  return QUALITY_PRESETS[name] || QUALITY_PRESETS[DEFAULT_QUALITY];
}

/**
 * A vertical gradient used both as the visible sky and as cheap ambient light.
 * Drawn to a canvas so it costs one small texture instead of a shader.
 * Produces an elegant dark cyclorama studio backdrop with subtle horizon glow.
 */
export function skyTexture(
  THREE,
  top = "#1b1f2b",
  upper = "#151822",
  horizon = "#1e2330",
  ground = "#161922",
  bottom = "#111319"
) {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, top);          // Zenith (+Y)
  gradient.addColorStop(0.35, upper);     // Upper atmosphere
  gradient.addColorStop(0.48, horizon);   // Horizon glow
  gradient.addColorStop(0.52, horizon);   // Horizon line
  gradient.addColorStop(0.72, ground);    // Ground cyclorama falloff
  gradient.addColorStop(1, bottom);       // Nadir (-Y)
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * A large floor that fades out radially with smooth falloff, so the ground
 * reads as an expansive studio sweep instead of a plane with a visible edge.
 */
export function floorTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255,255,255,0.22)");
  gradient.addColorStop(0.30, "rgba(255,255,255,0.13)");
  gradient.addColorStop(0.65, "rgba(255,255,255,0.035)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Build the studio rig once. Everything lives in a single group so the whole
 * look can be switched off for a neutral capture with one `visible` flag.
 */
export function createStudio(THREE, renderer, quality = DEFAULT_QUALITY) {
  const preset = qualityPreset(quality);
  const group = new THREE.Group();
  group.name = "omnicam-studio";

  // Key light: warm studio light modeling the subject with soft contact shadows.
  const key = new THREE.DirectionalLight(0xfff6ec, 2.2);
  key.position.set(5.0, 8.5, 4.0);
  key.castShadow = true;
  key.shadow.mapSize.set(preset.shadowSize, preset.shadowSize);
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 2.4;
  const shadowCamera = key.shadow.camera;
  shadowCamera.near = 0.5;
  shadowCamera.far = 70;
  shadowCamera.left = shadowCamera.bottom = -14;
  shadowCamera.right = shadowCamera.top = 14;
  group.add(key, key.target);

  // Fill: cool ambient fill lifting the shadow side with cinematic contrast.
  const fill = new THREE.DirectionalLight(0xa0b8f8, 0.75);
  fill.position.set(-6, 4, 3);
  group.add(fill);

  // Rim: separates silhouettes cleanly from the dark backdrop.
  const rim = new THREE.DirectionalLight(0xdce8ff, 1.35);
  rim.position.set(-3, 6, -8);
  group.add(rim);

  // Subtle ambient bounce to lift deep cavities
  const bounce = new THREE.HemisphereLight(0x283040, 0x12141a, 0.55);
  group.add(bounce);

  // Studio floor: wide expansive sweep that fades out radially into the horizon.
  const floorMap = floorTexture(THREE);
  const catcher = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 180),
    new THREE.MeshStandardMaterial({
      color: 0x161822, roughness: 0.98, metalness: 0,
      alphaMap: floorMap, transparent: true, depthWrite: false,
    }),
  );
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = -0.003;
  catcher.name = "omnicam-studio-floor";
  group.add(catcher);

  // Contact shadow catcher: receives the key light's soft contact shadow.
  const shadowCatcher = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 180),
    new THREE.ShadowMaterial({ opacity: 0.38, transparent: true, depthWrite: false }),
  );
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.001;
  shadowCatcher.receiveShadow = true;
  shadowCatcher.name = "omnicam-shadow-catcher";
  group.add(shadowCatcher);

  // Atmospheric distance fog to blend grid and distant geometry smoothly into the horizon
  const fog = new THREE.FogExp2(0x13151c, 0.008);

  // Lighting environment: Room IBL for directional specular and cavity occlusion.
  const sky = skyTexture(THREE);
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const roomScene = new RoomEnvironment();
  const environment = pmrem.fromScene(roomScene, 0.04).texture;
  roomScene.traverse((object) => {
    object.geometry?.dispose?.();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) material?.dispose?.();
  });

  return {
    group, key, fill, rim, bounce, catcher, shadowCatcher, floorMap, sky, environment, pmrem, fog,
    quality,
    dispose() {
      catcher.geometry.dispose();
      catcher.material.dispose();
      shadowCatcher.geometry.dispose();
      shadowCatcher.material.dispose();
      floorMap.dispose();
      sky.dispose();
      environment.dispose();
      pmrem.dispose();
      for (const light of [key, fill, rim, bounce]) light.dispose?.();
    },
  };
}

/** Re-apply a quality preset to an existing rig without rebuilding it. */
export function applyQuality(studio, renderer, quality) {
  const preset = qualityPreset(quality);
  studio.quality = quality;
  studio.key.shadow.mapSize.set(preset.shadowSize, preset.shadowSize);
  studio.key.shadow.map?.dispose();
  studio.key.shadow.map = null;
  renderer.toneMappingExposure = preset.toneExposure;
  return preset;
}

/**
 * Turn the look on or off. `false` restores the flat, unlit presentation the
 * proxy playblast depends on.
 */
export function setStudioEnabled(THREE, scene, renderer, studio, enabled) {
  studio.group.visible = enabled;
  scene.environment = enabled ? studio.environment : null;
  scene.background = enabled ? studio.sky : new THREE.Color(0x121212);
  scene.fog = enabled ? studio.fog : null;
  renderer.toneMapping = enabled ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
  renderer.toneMappingExposure = enabled ? qualityPreset(studio.quality).toneExposure : 1;
  scene.traverse((object) => {
    if (object.material) object.material.needsUpdate = true;
  });
}
