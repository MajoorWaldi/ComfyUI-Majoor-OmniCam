// Studio look for the viewport: image-based lighting, a three-point rig, soft
// shadows on a catcher plane, and a graded sky.
//
// This is the "Tripo / Meshy / Mixamo" presentation layer. It is deliberately
// separate from the proxy render so the two can disagree: while the editor is
// being driven the viewport can be beautiful, and the playblast still falls
// back to the neutral motion reference the conditioning models expect
// (AGENTS.md §7). The only render mode that keeps the studio look during a
// capture is "beauty", which the user has to pick explicitly.

export const QUALITY_PRESETS = {
  low: { shadows: true, shadowSize: 512, toneExposure: 0.9 },
  balanced: { shadows: true, shadowSize: 1024, toneExposure: 0.95 },
  high: { shadows: true, shadowSize: 2048, toneExposure: 1.0 },
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
 */
export function skyTexture(THREE, top = "#2a2d38", middle = "#16171d", bottom = "#0b0c10") {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.55, middle);
  gradient.addColorStop(1, bottom);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * A large floor that fades out radially, so the ground reads as a studio sweep
 * instead of a plane with a visible edge. This is what catches the shadow.
 */
export function floorTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(128, 128, 10, 128, 128, 128);
  gradient.addColorStop(0, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.28, "rgba(255,255,255,0.42)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.08)");
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

  // Key light: the one that actually models the subject and casts the shadow.
  const key = new THREE.DirectionalLight(0xfff4e6, 1.9);
  key.position.set(4.5, 7.5, 3.5);
  // Always a shadow caster. Toggling castShadow (or shadowMap.enabled) after the
  // first frame changes the shader defines, and three.js will not recompile the
  // already-built materials -- the shadow then silently never appears.
  key.castShadow = true;
  key.shadow.mapSize.set(preset.shadowSize, preset.shadowSize);
  key.shadow.bias = -0.0009;
  key.shadow.normalBias = 0.02;
  const shadowCamera = key.shadow.camera;
  shadowCamera.near = 0.5;
  shadowCamera.far = 60;
  shadowCamera.left = shadowCamera.bottom = -12;
  shadowCamera.right = shadowCamera.top = 12;
  group.add(key, key.target);

  // Fill: lifts the shadow side without flattening the form.
  const fill = new THREE.DirectionalLight(0xc8d4ff, 0.5);
  fill.position.set(-6, 3.5, 4);
  group.add(fill);

  // Rim: separates the silhouette from the background, the trick that makes
  // Meshy/Tripo previews read instantly.
  const rim = new THREE.DirectionalLight(0xdce6ff, 1.1);
  rim.position.set(-3, 5, -7);
  group.add(rim);

  // Studio floor: fades out radially and catches the key light's shadow.
  // Sits a hair below y=0 so it never z-fights the grid helper drawn there.
  const floorMap = floorTexture(THREE);
  const catcher = new THREE.Mesh(
    new THREE.PlaneGeometry(56, 56),
    new THREE.MeshStandardMaterial({
      color: 0x3a4049, roughness: 0.96, metalness: 0,
      alphaMap: floorMap, transparent: true, depthWrite: false,
    }),
  );
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = -0.003;
  catcher.name = "omnicam-studio-floor";
  group.add(catcher);

  // The decorative floor above is mostly transparent, so a shadow falling on it
  // is invisible. ShadowMaterial draws nothing *but* the shadow, which reads
  // against both the floor and the sky -- this is the contact shadow.
  const shadowCatcher = new THREE.Mesh(
    new THREE.PlaneGeometry(56, 56),
    new THREE.ShadowMaterial({ opacity: 0.42, transparent: true, depthWrite: false }),
  );
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.001;
  shadowCatcher.receiveShadow = true;
  shadowCatcher.name = "omnicam-shadow-catcher";
  group.add(shadowCatcher);

  const sky = skyTexture(THREE);
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const environment = pmrem.fromEquirectangular(sky).texture;

  return {
    group, key, fill, rim, catcher, shadowCatcher, floorMap, sky, environment, pmrem,
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
      for (const light of [key, fill, rim]) light.dispose?.();
    },
  };
}

/** Re-apply a quality preset to an existing rig without rebuilding it. */
export function applyQuality(studio, renderer, quality) {
  const preset = qualityPreset(quality);
  studio.quality = quality;
  // Only the resolution moves: see the note in createStudio about recompiles.
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
  renderer.toneMapping = enabled ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
  renderer.toneMappingExposure = enabled ? qualityPreset(studio.quality).toneExposure : 1;
  // Hiding the group takes the key light out of the scene, which is what removes
  // the shadow for a neutral capture. Materials compiled for the lit rig have to
  // be refreshed for the new light set.
  scene.traverse((object) => {
    if (object.material) object.material.needsUpdate = true;
  });
}
