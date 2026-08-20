// WebGL viewport methods extracted from the public facade.

export function createRenderMethods(dependencies) {
  const { THREE, FBXLoader, GLTFLoader, OBJLoader, PLYLoader, STLLoader, neutral, wire, checkerMaterial, objectMaterial, applyModelMaterial, disposeObject, textureFor, cardMesh, generatePointField, sampleCamera, sampleObjectTransform } = dependencies;
  return {
  render(state, cameraState, mediaById, width, height, modelUrlsById = new Map(), frame = 0, cleanCapture = false, selectedEntity = "camera", selectedObjectId = "subject", subSelection = null) {
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
      this.scene.background = new THREE.Color(state.viewport_bg_color || "#121212");
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
    }
    this.path.visible = !cleanCapture;
    const editorGrid = ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(state.render_mode);
    this.content.traverse((object) => { if (object.userData.omnicamCaptureGuide) object.visible = cleanCapture ? Boolean(state.playblast_grid) : editorGrid; });
    
    const pathKey = state.__omnicamRevision ?? JSON.stringify([
      state.active_camera_id,
      (state.cameras || []).map((c) => [c.id, c.keyframes?.length, c.keyframes?.map((k) => [k.frame, k.camera?.position, k.camera?.target])]),
      (state.objects || []).map((o) => [o.id, o.keyframes?.length, o.keyframes?.map((k) => [k.frame, k.transform?.position])]),
    ]);
    if (pathKey !== this.pathKey) { this.pathKey = pathKey; this.rebuildPath(state); }

    this.updateLiveCameras(state, frame, cleanCapture, state.view_mode || "camera", selectedEntity);
    this.liveCameras.visible = !cleanCapture;

    if (!cleanCapture) {
      this.updateSelection(state, selectedEntity, selectedObjectId, subSelection, `${state.__omnicamRevision ?? "legacy"}:${frame}`);
      this.selectionGroup.visible = true;
    } else {
      this.selectionGroup.visible = false;
    }

    this.content.visible = true;
    const aspect = width / Math.max(1, height);
    const camera = this.configureCamera(cameraState, aspect); this.activeCamera = camera;
    this.renderer.setScissorTest(false); this.renderer.setViewport(0, 0, width, height); this.renderer.render(this.scene, camera);
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
    this.renderer.dispose(); this.renderer.forceContextLoss(); this.canvas.width = 1; this.canvas.height = 1;
  }
  };
}

