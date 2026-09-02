// WebGL viewport methods extracted from the public facade.

import { DEFAULT_BG_COLOR, applyQuality, qualityPreset, setStudioEnabled } from "./studio.js";
import { createQualityMonitor, recordFrame, resetMonitor } from "./adaptive-quality.js";

export function createRenderMethods(dependencies) {
  const { THREE, FBXLoader, GLTFLoader, OBJLoader, PLYLoader, STLLoader, neutral, wire, checkerMaterial, objectMaterial, applyModelMaterial, disposeObject, textureFor, cardMesh, generatePointField, sampleCamera, sampleObjectTransform, hasOutlineMesh, SelectionOutlineRenderer } = dependencies;
  return {
  render(state, cameraState, mediaById, width, height, modelUrlsById = new Map(), frame = 0, cleanCapture = false, selectedEntity = "camera", selectedObjectId = "subject", subSelection = null, selectedFrame = null) {
    // The studio look stays on while editing. During a capture it survives only
    // for the explicit "beauty" mode; every other proxy mode records flat.
    const wantStudio = !cleanCapture || (state.render_mode || "") === "beauty";
    if (wantStudio !== this.studioEnabled) {
      this.studioEnabled = wantStudio;
      setStudioEnabled(THREE, this.scene, this.renderer, this.studio, wantStudio);
      for (const light of this.flatLights || []) light.visible = !wantStudio;
    }
    if (this.disposed) return;
    if (this.canvas.width !== width || this.canvas.height !== height) this.renderer.setSize(width, height, false);

    // Viewport background color / image / image sequence
    const activeBgUrl = (state.viewport_bg_sequence && state.viewport_bg_sequence.length)
      ? state.viewport_bg_sequence[frame % state.viewport_bg_sequence.length]
      : (state.viewport_bg_image || "");

    if (activeBgUrl) {
      this.bgImageUrl = activeBgUrl;
      const cached = this.bgTextureCache.get(activeBgUrl);
      if (cached) {
        this.bgTextureCache.delete(activeBgUrl);
        this.bgTextureCache.set(activeBgUrl, cached);
        this.bgTexture = cached;
        this.scene.background = cached;
      } else if (!this.bgTextureLoads.has(activeBgUrl)) {
        const generation = this.bgLoadGeneration;
        this.bgTextureLoads.set(activeBgUrl, generation);
        const loader = new THREE.TextureLoader();
        loader.load(activeBgUrl, (tex) => {
          this.bgTextureLoads.delete(activeBgUrl);
          if (this.disposed || generation !== this.bgLoadGeneration) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          this.bgTextureCache.set(activeBgUrl, tex);
          while (this.bgTextureCache.size > 8) {
            const oldestUrl = [...this.bgTextureCache.keys()].find((url) => url !== this.bgImageUrl);
            if (!oldestUrl) break;
            const oldest = this.bgTextureCache.get(oldestUrl);
            this.bgTextureCache.delete(oldestUrl);
            oldest?.dispose?.();
          }
          if (this.bgImageUrl === activeBgUrl) {
            this.bgTexture = tex;
            this.scene.background = tex;
          }
          this.invalidate();
        }, undefined, () => {
          this.bgTextureLoads.delete(activeBgUrl);
        });
      }
    } else {
      this.bgImageUrl = "";
      this.bgLoadGeneration += 1;
      this.bgTextureLoads.clear();
      for (const texture of new Set(this.bgTextureCache.values())) texture.dispose();
      this.bgTextureCache.clear();
      this.bgTexture = null;
      // The default colour means "no preference", so the studio sky wins there;
      // any colour the user actually picked is respected.
      const chosen = state.viewport_bg_color && state.viewport_bg_color !== DEFAULT_BG_COLOR;
      this.scene.background = this.studioEnabled && !chosen
        ? this.studio.sky
        : new THREE.Color(state.viewport_bg_color || DEFAULT_BG_COLOR);
    }

    const sceneKey = JSON.stringify([
      state.render_mode,
      state.card_fit,
      state.point_density,
      state.point_spread,
      Boolean(state.show_wireframe),
      Boolean(state.show_vertices),
      state.objects.map((object) => {
        const { position, rotation, keyframes, size, ...shape } = object;
        if (object.type === "card") shape.size = size;
        return shape;
      }),
    ]);
    const mediaSignature = [...mediaById.entries()].map(([id, media]) => `${id}:${media?.src || ""}`).join("|");
    const modelSignature = [...modelUrlsById.entries()].map(([id, url]) => `${id}:${url}`).join("|");
    if (sceneKey !== this.sceneKey || mediaSignature !== this.mediaSignature || modelSignature !== this.modelSignature) {
      this.sceneKey = sceneKey; this.mediaSignature = mediaSignature; this.modelSignature = modelSignature; this.rebuild(state, mediaById, modelUrlsById);
    }
    for (const model of this.models.values()) {
      if (model.mixer && model.duration > 0) model.mixer.setTime((frame / Math.max(1, state.fps || 24)) % model.duration);
    }
    for (const object of state.objects) {
      const node = this.objectNodes.get(object.id); if (!node) continue;
      const transform = object.keyframes?.length ? sampleObjectTransform(object, frame) : object;
      node.position.fromArray(transform.position || [0, 0, 0]);
      node.rotation.set(...(transform.rotation || [0, 0, 0]).map(THREE.MathUtils.degToRad));
      if (object.type !== "card" && object.type !== "null") node.scale.fromArray(transform.size || [1, 1, 1]);
      // A "null" node is just an AxesHelper, so the Show > Helper axes toggle
      // owns its visibility outside of a clean capture.
      if (object.type === "null") node.visible = cleanCapture ? true : state.show_helper_axes !== false;
    }
    this.path.visible = !cleanCapture;
    // The editor grid follows an explicit toggle. It used to be derived from the
    // render mode, so the "Floor Grid" checkbox appeared to do nothing while
    // editing -- it only ever affected the capture. point_field is the one mode
    // that is meant to read without a grid.
    const editorGrid = state.show_grid !== false && state.render_mode !== "point_field";
    this.content.traverse((object) => { if (object.userData.omnicamCaptureGuide) object.visible = cleanCapture ? Boolean(state.playblast_grid) : editorGrid; });

    // Looking through the active camera, its own path and frustum are just
    // clutter drawn over the shot -- the look-at target still shows so it can
    // be aimed (updateLiveCameras keeps that). Every other camera is untouched.
    const viewMode = state.view_mode || "camera";
    const pathKey = `${viewMode}:${selectedEntity}:${selectedFrame ?? ""}:${state.__omnicamRevision ?? JSON.stringify([
      state.active_camera_id,
      (state.cameras || []).map((c) => [c.id, c.keyframes?.length, c.keyframes?.map((k) => [k.frame, k.camera?.position, k.camera?.target])]),
      (state.objects || []).map((o) => [o.id, o.keyframes?.length, o.keyframes?.map((k) => [k.frame, k.transform?.position])]),
    ])}`;
    if (pathKey !== this.pathKey) { this.pathKey = pathKey; this.rebuildPath(state, selectedEntity, selectedFrame, viewMode); }

    this.updateLiveCameras(state, frame, cleanCapture, viewMode, selectedEntity, selectedFrame);
    this.liveCameras.visible = !cleanCapture;

    // Per-widget visibility, evaluated every frame so the "Show" checkboxes react
    // without a geometry rebuild. Tags are stamped in rebuildPath / updateLiveCameras.
    if (!cleanCapture) {
      const showPaths = state.show_camera_paths !== false;
      const showGizmos = state.show_camera_gizmos !== false;
      const showLookAt = state.show_look_at !== false;
      for (const root of [this.path, this.liveCameras]) {
        root.traverse((object) => {
          const widget = object.userData.omnicamWidget;
          if (widget === "path") object.visible = showPaths;
          else if (widget === "gizmo") object.visible = showGizmos;
          else if (widget === "lookat") object.visible = showLookAt;
        });
      }
    }

    if (!cleanCapture) {
      this.updateSelection(state, selectedEntity, selectedObjectId, subSelection, `${state.__omnicamRevision ?? "legacy"}:${frame}`);
      this.selectionGroup.visible = true;
    } else {
      this.selectionGroup.visible = false;
    }

    // Shadow flags are cheap to set and only meaningful while the studio is on.
    if (this.studioEnabled && this.contentShadowKey !== this.sceneKey) {
      this.contentShadowKey = this.sceneKey;
      const shadowBox = new THREE.Box3();
      this.content.traverse((object) => {
        if (!object.isMesh || object.userData.omnicamCaptureGuide) return;
        object.castShadow = true;
        object.receiveShadow = true;
        object.updateWorldMatrix(true, false);
        const box = new THREE.Box3().setFromObject(object);
        if (!box.isEmpty() && Number.isFinite(box.min.x)) shadowBox.union(box);
      });
      // Fit the key light's shadow camera to what actually casts. The authored
      // +-12 frustum spread a 1k/2k map across ground the scene never touches;
      // a lone 2.5-unit character then got a few hundred texels of penumbra.
      // Same light *direction*, just re-aimed and tightened around the content.
      const key = this.studio?.key;
      if (key) {
        const center = shadowBox.isEmpty() ? new THREE.Vector3() : shadowBox.getCenter(new THREE.Vector3());
        const size = shadowBox.isEmpty() ? new THREE.Vector3(12, 12, 12) : shadowBox.getSize(new THREE.Vector3());
        const radius = Math.max(1, 0.5 * Math.max(size.x, size.y, size.z) * Math.SQRT2);
        const span = radius * 1.15 + 0.5;
        const direction = new THREE.Vector3(4.5, 7.5, 3.5).normalize();
        const distance = Math.max(12, radius * 4);
        key.position.copy(center).addScaledVector(direction, distance);
        key.target.position.copy(center);
        key.target.updateMatrixWorld(true);
        const shadowCamera = key.shadow.camera;
        shadowCamera.left = -span; shadowCamera.right = span;
        shadowCamera.top = span; shadowCamera.bottom = -span;
        shadowCamera.near = Math.max(0.1, distance - radius - 1);
        shadowCamera.far = distance + radius + 1;
        shadowCamera.updateProjectionMatrix();
        key.shadow.map?.dispose();
        key.shadow.map = null;
      }
    }

    this.content.visible = true;
    const aspect = width / Math.max(1, height);
    const camera = this.configureCamera(cameraState, aspect); this.activeCamera = camera;
    // Billboards (the look-at crosshair) face the viewer so they never collapse
    // into a line when the view is edge-on to them.
    this.path.traverse((object) => {
      if (object.userData.omnicamBillboard) object.quaternion.copy(camera.quaternion);
    });
    this.renderer.setScissorTest(false); this.renderer.setViewport(0, 0, width, height);
    const startedAt = performance.now();

    let outlined = false;
    if (!cleanCapture && selectedEntity === "object" && selectedObjectId && !subSelection) {
      const node = this.objectNodes.get(selectedObjectId);
      if (node && hasOutlineMesh(node)) {
        if (!this.outlineRenderer) {
          this.outlineRenderer = new SelectionOutlineRenderer(this.renderer, this.scene, undefined, camera);
        }
        // The outline pass modifies the object material temporarily, so we need to pass an array of the selected objects.
        // OutlinePass expects a flat array of meshes, but we can pass the root node and it might handle it or we pass the meshes.
        // Wait, OutlinePass handles traversing Object3D. We just pass `[node]`.
        this.outlineRenderer.render(camera, width, height, [node]);
        outlined = true;
      }
    }
    if (!outlined) {
      this.renderer.render(this.scene, camera);
    }

    // Only judge the interactive viewport; a capture pass is allowed to be slow.
    if (!cleanCapture && this.adaptiveQuality !== false) {
      this.qualityMonitor ||= createQualityMonitor(this.studio?.quality);
      const downgraded = recordFrame(this.qualityMonitor, performance.now() - startedAt);
      if (downgraded) {
        applyQuality(this.studio, this.renderer, downgraded);
        this.onQualityDowngrade?.(downgraded);
      }
    }
  },

  setViewportQuality(quality) {
    applyQuality(this.studio, this.renderer, quality);
    this.qualityMonitor = resetMonitor(this.qualityMonitor || createQualityMonitor(quality), quality);
  },

  // Supersample multiple the host blit renders the interactive viewport at
  // before scaling it back down -- the cheapest edge antialiasing there is.
  // 1 while the studio look is off (a neutral capture), and 1 at "low" so a
  // struggling GPU is never asked to draw more pixels.
  supersampleFactor() {
    if (!this.studioEnabled) return 1;
    return qualityPreset(this.studio?.quality).renderScale || 1;
  },

  dispose() {
    if (this.disposed) return; this.disposed = true;
    this.bgLoadGeneration += 1;
    this.bgTextureLoads.clear();
    disposeObject(this.content); disposeObject(this.path); disposeObject(this.liveCameras); disposeObject(this.selectionGroup);
    for (const texture of new Set(this.bgTextureCache.values())) texture.dispose();
    this.bgTextureCache.clear(); this.bgTexture = null;
    for (const model of this.models.values()) disposeObject(model.scene, true);
    this.models.clear(); this.modelLoads.clear();
    this.studio?.dispose();
    this.outlineRenderer?.dispose();
    this.renderer.dispose(); this.renderer.forceContextLoss(); this.canvas.width = 1; this.canvas.height = 1;
  }
  };
}
