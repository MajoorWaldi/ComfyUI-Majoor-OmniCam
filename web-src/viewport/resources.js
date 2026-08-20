// WebGL viewport methods extracted from the public facade.

export function createResourceMethods(dependencies) {
  const { THREE, FBXLoader, GLTFLoader, OBJLoader, PLYLoader, STLLoader, neutral, wire, checkerMaterial, objectMaterial, applyModelMaterial, disposeObject, textureFor, cardMesh, generatePointField, sampleCamera, sampleObjectTransform } = dependencies;
  return {
  removeModel(id) {
    const model = this.models.get(id);
    if (model) disposeObject(model.scene, true);
    this.models.delete(id); this.modelLoads.delete(id); this.sceneKey = "";
  },

  selectAnimation(id, index) {
    const model = this.models.get(id);
    if (!model?.mixer || !model.clips.length) return;
    model.selectedClip = Math.max(0, Math.min(model.clips.length - 1, Number(index) || 0));
    model.duration = model.clips[model.selectedClip].duration || 0;
    model.mixer.stopAllAction();
    model.mixer.clipAction(model.clips[model.selectedClip]).play();
    this.invalidate();
  },

  rebuild(state, mediaById, modelUrlsById) {
    disposeObject(this.content); this.content.clear();
    this.objectNodes.clear();
    this.selectionKey = "";
    const mode = state.render_mode;
    const grid = new THREE.GridHelper(120, 120, 0x777777, 0x3b3b3b);
    grid.userData.omnicamCaptureGuide = true;
    grid.frustumCulled = false;
    this.content.add(grid);
    if (["omni_ref", "point_field"].includes(mode)) {
      const { points, colors } = generatePointField(state.point_density || "balanced", state.point_spread || "all_views", state.point_color || null);
      if (points.length > 0) {
        const pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
        pointGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        const pointMaterial = new THREE.PointsMaterial({
          vertexColors: true,
          size: 0.065,
          sizeAttenuation: true,
        });
        const ptMesh = new THREE.Points(pointGeometry, pointMaterial);
        ptMesh.frustumCulled = false;
        this.content.add(ptMesh);
      }
    }
    if (["grid", "point_field"].includes(mode)) return;
    for (const object of state.objects) {
      if (object.enabled === false) continue;
      const size = object.size || [1, 1, 1]; let mesh;
      if (object.type === "glb" || object.type === "model") {
        const url = modelUrlsById.get(object.id);
        const model = this.models.get(object.id);
        const format = object.format || (object.type === "glb" ? "glb" : "");
        if (url && (model?.url !== url || model?.format !== format)) this.loadModel(object.id, url, format);
        if (model?.url === url) { mesh = model.scene; applyModelMaterial(mesh, object.material_mode || "textured"); }
        else mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2] || 1), wire.clone());
      } else if (object.type === "sphere") mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), objectMaterial(object, mode));
      else if (object.type === "ground") mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), objectMaterial(object, mode));
      else if (object.type === "card") {
        mesh = object.material_mode && object.material_mode !== "textured" ? new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), objectMaterial(object, mode)) : cardMesh(object, mediaById.get(object.id), state.card_fit || "contain");
      } else if (object.type === "null") {
        const axes = new THREE.AxesHelper(0.5); axes.position.fromArray(object.position || [0, 0, 0]); axes.userData.omnicamId = object.id; axes.frustumCulled = false; this.objectNodes.set(object.id, axes); this.content.add(axes); continue;
      } else {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), objectMaterial(object, mode));
      }
      mesh.position.fromArray(object.position || [0, 0, 0]);
      mesh.rotation.set(...(object.rotation || [0, 0, 0]).map(THREE.MathUtils.degToRad));
      if (object.type !== "card") mesh.scale.fromArray(size);
      mesh.userData.omnicamId = object.id;
      mesh.frustumCulled = false;
      mesh.traverse((c) => {
        c.frustumCulled = false;
        c.userData.omnicamId = object.id;
      });

      if (state.show_wireframe) {
        mesh.traverse((child) => {
          if (child.isMesh && child.geometry) {
            const wireGeo = new THREE.WireframeGeometry(child.geometry);
            const wireLine = new THREE.LineSegments(wireGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, opacity: 0.45, transparent: true }));
            wireLine.userData.omnicamHelper = true;
            child.add(wireLine);
          }
        });
      }
      if (state.show_vertices) {
        mesh.traverse((child) => {
          if (child.isMesh && child.geometry) {
            const ptMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.05, sizeAttenuation: true });
            const pts = new THREE.Points(child.geometry, ptMat);
            pts.userData.omnicamHelper = true;
            child.add(pts);
          }
        });
      }

      this.objectNodes.set(object.id, mesh);
      this.content.add(mesh);
    }
  },

  rebuildPath(state) {
    disposeObject(this.path); this.path.clear();
    const cameraColors = [
      { line: 0x4aa3ef, marker: 0x8ab4f8, frustum: 0x3d6b9e }, // Camera 1 - Blue/Cyan
      { line: 0xf2a93b, marker: 0xfde047, frustum: 0x8c621e }, // Camera 2 - Amber/Gold
      { line: 0x48c774, marker: 0x86efac, frustum: 0x226b3c }, // Camera 3 - Emerald
      { line: 0xb565d8, marker: 0xe879f9, frustum: 0x6e2f8c }, // Camera 4 - Purple
      { line: 0xec4899, marker: 0xf472b6, frustum: 0x8c215b }, // Camera 5 - Pink
    ];

    const cameras = state.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: state.keyframes || [] }];
    cameras.forEach((camera, camIdx) => {
      const keys = camera.keyframes || [];
      if (keys.length === 0) return;
      const palette = camera.color
        ? { line: new THREE.Color(camera.color), marker: new THREE.Color(camera.color), frustum: new THREE.Color(camera.color) }
        : cameraColors[camIdx % cameraColors.length];
      const isActive = camera.id === state.active_camera_id;

      if (keys.length >= 2) {
        const points = keys.map((key) => new THREE.Vector3().fromArray(key.camera.position));
        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(Math.max(24, keys.length * 16)));
        this.path.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({
          color: palette.line,
          transparent: true,
          opacity: isActive ? 1.0 : 0.55,
          linewidth: isActive ? 2 : 1,
        })));
      }

      for (const key of keys) {
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(isActive ? 0.07 : 0.05, 10, 8),
          new THREE.MeshBasicMaterial({ color: palette.marker })
        );
        marker.position.fromArray(key.camera.position);
        this.path.add(marker);

        const position = new THREE.Vector3().fromArray(key.camera.position);
        const target = new THREE.Vector3().fromArray(key.camera.target || [0, 0, 0]);
        const forward = target.clone().sub(position).normalize();
        let right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
        if (right.lengthSq() < 1e-8) right.set(1, 0, 0); else right.normalize();
        const up = new THREE.Vector3().crossVectors(right, forward).normalize();
        const distance = THREE.MathUtils.clamp(position.distanceTo(target) * 0.08, 0.25, 0.8);
        const halfHeight = key.camera.camera_type === "orthographic" ? distance * 0.55 : distance * Math.tan(THREE.MathUtils.degToRad(key.camera.fov || 35) * 0.5);
        const halfWidth = (halfHeight * (state.width || 16)) / Math.max(1, state.height || 9);
        const center = position.clone().addScaledVector(forward, distance);
        const corners = [
          center.clone().addScaledVector(right, -halfWidth).addScaledVector(up, -halfHeight),
          center.clone().addScaledVector(right, halfWidth).addScaledVector(up, -halfHeight),
          center.clone().addScaledVector(right, halfWidth).addScaledVector(up, halfHeight),
          center.clone().addScaledVector(right, -halfWidth).addScaledVector(up, halfHeight),
        ];
        const segments = [];
        for (const corner of corners) segments.push(position, corner);
        for (let index = 0; index < 4; index++) segments.push(corners[index], corners[(index + 1) % 4]);
        const frustum = new THREE.BufferGeometry().setFromPoints(segments);
        this.path.add(new THREE.LineSegments(frustum, new THREE.LineBasicMaterial({
          color: palette.frustum,
          transparent: true,
          opacity: isActive ? 0.9 : 0.45,
        })));
      }
    });

    // Object motion tracks
    const objectColors = [0xff7675, 0x00cec9, 0xfdcb6e, 0x6c5ce7, 0xe17055];
    (state.objects || []).forEach((object, objIdx) => {
      const keys = object.keyframes || [];
      if (keys.length < 2) return;
      const color = object.color ? new THREE.Color(object.color) : objectColors[objIdx % objectColors.length];
      const points = keys.map((k) => new THREE.Vector3().fromArray(k.transform?.position || [0, 0, 0]));
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(Math.max(16, keys.length * 12)));
      this.path.add(new THREE.Line(geometry, new THREE.LineDashedMaterial({
        color,
        dashSize: 0.15,
        gapSize: 0.08,
      })));

      for (const key of keys) {
        const objMarker = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.06, 0.06),
          new THREE.MeshBasicMaterial({ color })
        );
        objMarker.position.fromArray(key.transform?.position || [0, 0, 0]);
        this.path.add(objMarker);
      }
    });
  }

  };
}

