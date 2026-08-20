// WebGL viewport methods extracted from the public facade.

export function createSceneMethods(dependencies) {
  const { THREE, FBXLoader, GLTFLoader, OBJLoader, PLYLoader, STLLoader, neutral, wire, checkerMaterial, objectMaterial, applyModelMaterial, disposeObject, textureFor, cardMesh, generatePointField, sampleCamera, sampleObjectTransform } = dependencies;
  return {
  updateLiveCameras(state, frame, cleanCapture, viewMode, selectedEntity = "camera") {
    disposeObject(this.liveCameras);
    this.liveCameras.clear();
    if (cleanCapture) return;

    const cameraColors = [
      { line: 0x4aa3ef, marker: 0x8ab4f8, frustum: 0x5fa8f5, body: 0x24364e },
      { line: 0xf2a93b, marker: 0xfde047, frustum: 0xf5b74f, body: 0x4e3e24 },
      { line: 0x48c774, marker: 0x86efac, frustum: 0x5cd687, body: 0x244e32 },
      { line: 0xb565d8, marker: 0xe879f9, frustum: 0xc87fe8, body: 0x46244e },
      { line: 0xec4899, marker: 0xf472b6, frustum: 0xf56cb0, body: 0x4e2439 },
    ];

    const cameras = state.cameras || [{ id: "camera_1", name: "Camera 1", keyframes: state.keyframes || [] }];
    cameras.forEach((camera, camIdx) => {
      const palette = camera.color
        ? { line: new THREE.Color(camera.color), marker: new THREE.Color(camera.color), frustum: new THREE.Color(camera.color), body: new THREE.Color(camera.color).multiplyScalar(0.35) }
        : cameraColors[camIdx % cameraColors.length];
      const isActive = camera.id === state.active_camera_id;
      if (viewMode === "camera" && isActive) return;

      const camData = sampleCamera(camera, frame, state.objects);
      const pos = new THREE.Vector3().fromArray(camData.position || [0, 0, 0]);
      const tgt = new THREE.Vector3().fromArray(camData.target || [0, 0, 0]);
      const forward = tgt.clone().sub(pos);
      const targetDist = forward.length();
      if (targetDist < 1e-4) forward.set(0, 0, -1);
      else forward.normalize();

      let upSeed = new THREE.Vector3(0, 1, 0);
      let right = new THREE.Vector3().crossVectors(forward, upSeed);
      if (right.lengthSq() < 1e-6) {
        upSeed = new THREE.Vector3(0, 0, 1);
        right = new THREE.Vector3().crossVectors(forward, upSeed);
      }
      right.normalize();
      let up = new THREE.Vector3().crossVectors(right, forward).normalize();
      if (camData.roll) {
        const rollRad = THREE.MathUtils.degToRad(camData.roll);
        right.applyAxisAngle(forward, rollRad);
        up.applyAxisAngle(forward, rollRad);
      }

      // Camera Body
      const bodyGroup = new THREE.Group();
      const bodyMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.12, 0.22),
        new THREE.MeshStandardMaterial({ color: palette.body, roughness: 0.4, metalness: 0.8 })
      );
      bodyMesh.position.set(0, 0, -0.11);
      bodyGroup.add(bodyMesh);

      // Lens
      const lensGeo = new THREE.CylinderGeometry(0.05, 0.055, 0.12, 16);
      lensGeo.rotateX(Math.PI / 2);
      const lensMesh = new THREE.Mesh(
        lensGeo,
        new THREE.MeshStandardMaterial({ color: palette.marker, roughness: 0.2, metalness: 0.9 })
      );
      lensMesh.position.set(0, 0, 0.05);
      bodyGroup.add(lensMesh);

      // Tally light
      const tallyMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.03, 0.08),
        new THREE.MeshBasicMaterial({ color: isActive ? 0xff4444 : palette.marker })
      );
      tallyMesh.position.set(0, 0.07, -0.08);
      bodyGroup.add(tallyMesh);

      const rotMatrix = new THREE.Matrix4().makeBasis(right, up, forward.clone().negate());
      bodyGroup.quaternion.setFromRotationMatrix(rotMatrix);
      bodyGroup.position.copy(pos);
      this.liveCameras.add(bodyGroup);

      // Pickable hit sphere for camera body
      const camPickGeo = new THREE.SphereGeometry(0.35, 8, 6);
      const pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      const camPickMesh = new THREE.Mesh(camPickGeo, pickMat);
      camPickMesh.position.copy(pos);
      camPickMesh.userData = { omnicamType: "camera", omnicamId: camera.id };
      this.liveCameras.add(camPickMesh);

      // Live Frustum
      const frustumDist = THREE.MathUtils.clamp(targetDist * 0.25, 0.5, 2.5);
      const halfHeight = camData.camera_type === "orthographic"
        ? (5 / Math.max(0.01, camData.zoom || 1)) * 0.35
        : frustumDist * Math.tan(THREE.MathUtils.degToRad(camData.fov || 35) * 0.5);
      const halfWidth = (halfHeight * (state.width || 16)) / Math.max(1, state.height || 9);
      const center = pos.clone().addScaledVector(forward, frustumDist);

      const corners = [
        center.clone().addScaledVector(right, -halfWidth).addScaledVector(up, -halfHeight),
        center.clone().addScaledVector(right, halfWidth).addScaledVector(up, -halfHeight),
        center.clone().addScaledVector(right, halfWidth).addScaledVector(up, halfHeight),
        center.clone().addScaledVector(right, -halfWidth).addScaledVector(up, halfHeight),
      ];

      const frustumSegments = [];
      for (const corner of corners) frustumSegments.push(pos, corner);
      for (let i = 0; i < 4; i++) frustumSegments.push(corners[i], corners[(i + 1) % 4]);
      const topMid = corners[2].clone().add(corners[3]).multiplyScalar(0.5);
      const topPeak = topMid.clone().addScaledVector(up, halfHeight * 0.25);
      frustumSegments.push(corners[2], topPeak, topPeak, corners[3]);

      const frustumGeo = new THREE.BufferGeometry().setFromPoints(frustumSegments);
      this.liveCameras.add(new THREE.LineSegments(frustumGeo, new THREE.LineBasicMaterial({
        color: palette.frustum,
        linewidth: isActive ? 2 : 1,
        transparent: true,
        opacity: isActive ? 1.0 : 0.6,
      })));

      // Target sightline & target picking
      if (targetDist > 0.01) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([pos, tgt]);
        this.liveCameras.add(new THREE.Line(lineGeo, new THREE.LineDashedMaterial({
          color: palette.marker,
          dashSize: 0.15,
          gapSize: 0.1,
          transparent: true,
          opacity: isActive ? 0.75 : 0.4,
        })));

        const isTargetSelected = isActive && selectedEntity === "camera_target";
        const tgtSize = isTargetSelected ? 0.12 : 0.08;
        const tgtPoints = [
          tgt.clone().add(new THREE.Vector3(-tgtSize, 0, 0)), tgt.clone().add(new THREE.Vector3(tgtSize, 0, 0)),
          tgt.clone().add(new THREE.Vector3(0, -tgtSize, 0)), tgt.clone().add(new THREE.Vector3(0, tgtSize, 0)),
          tgt.clone().add(new THREE.Vector3(0, 0, -tgtSize)), tgt.clone().add(new THREE.Vector3(0, 0, tgtSize)),
        ];
        const tgtGeo = new THREE.BufferGeometry().setFromPoints(tgtPoints);
        this.liveCameras.add(new THREE.LineSegments(tgtGeo, new THREE.LineBasicMaterial({
          color: isTargetSelected ? 0x38bdf8 : palette.marker,
          linewidth: isTargetSelected ? 3 : 1,
          transparent: true,
          opacity: isTargetSelected ? 1.0 : (isActive ? 0.9 : 0.5),
        })));

        // Pickable hit sphere for camera target point
        const tgtPickGeo = new THREE.SphereGeometry(0.28, 8, 6);
        const tgtPickMesh = new THREE.Mesh(tgtPickGeo, pickMat);
        tgtPickMesh.position.copy(tgt);
        tgtPickMesh.userData = { omnicamType: "camera_target", omnicamId: camera.id };
        this.liveCameras.add(tgtPickMesh);

        // Highlight ring on target if target is selected
        if (isTargetSelected && viewMode !== "camera") {
          const tgtRingGeo = new THREE.RingGeometry(0.14, 0.18, 24);
          tgtRingGeo.rotateX(Math.PI / 2);
          const tgtRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
          const tgtRingMesh = new THREE.Mesh(tgtRingGeo, tgtRingMat);
          tgtRingMesh.position.copy(tgt);
          this.liveCameras.add(tgtRingMesh);
        }
      }

      // Selection beacon ring for active/selected camera (only when camera is selected, not when an object is selected)
      if (isActive && viewMode !== "camera" && selectedEntity === "camera") {
        const ringGeo = new THREE.RingGeometry(0.18, 0.22, 32);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xf2d06b, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos);
        this.liveCameras.add(ringMesh);
      }
    });
  },

  updateSelection(state, selectedEntity, selectedObjectId, subSelection = null, selectionToken = "") {
    const subToken = subSelection ? `${subSelection.mode || ""}:${subSelection.objectId || ""}:${(subSelection.point || []).join(",")}` : "";
    const nextSelectionKey = `${selectedEntity}:${selectedObjectId || ""}:${selectionToken}:${subToken}`;
    if (nextSelectionKey === this.selectionKey) return;
    this.selectionKey = nextSelectionKey;
    disposeObject(this.selectionGroup);
    this.selectionGroup.clear();
    if (selectedEntity === "object" && selectedObjectId) {
      const node = this.objectNodes.get(selectedObjectId);
      if (node) {
        node.updateMatrixWorld(true);

        // Always render prominent bounding box around selected object
        try {
          const box = new THREE.Box3();
          const bones = [];
          node.traverse((child) => {
            if (child.isBone) bones.push(child);
          });
          if (bones.length > 0) {
            const tempPos = new THREE.Vector3();
            for (const bone of bones) {
              bone.getWorldPosition(tempPos);
              box.expandByPoint(tempPos);
            }
            box.expandByScalar(0.2);
          } else {
            box.setFromObject(node);
          }
          if (!box.isEmpty() && Number.isFinite(box.min.x) && Number.isFinite(box.max.x) && Number.isFinite(box.min.y) && Number.isFinite(box.max.y) && Number.isFinite(box.min.z) && Number.isFinite(box.max.z)) {
            box.expandByScalar(0.04);
            const boxHelper = new THREE.Box3Helper(box, new THREE.Color(0x38bdf8));
            boxHelper.material.transparent = true;
            boxHelper.material.opacity = 0.95;
            boxHelper.material.depthTest = false;
            boxHelper.renderOrder = 9999;
            this.selectionGroup.add(boxHelper);
          }
        } catch (_) {}

        if (state.show_wireframe) {
          let highlightedMeshes = 0;
          node.traverse((child) => {
            if (!child.isMesh || !child.geometry || highlightedMeshes >= 64) return;
          const overlay = new THREE.Mesh(child.geometry.clone(), new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.2,
            depthTest: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -1,
          }));
            overlay.matrixAutoUpdate = false;
            overlay.matrix.copy(child.matrixWorld);
            overlay.frustumCulled = false;
            overlay.renderOrder = 9998;
            this.selectionGroup.add(overlay);
            highlightedMeshes += 1;
          });
        }

        // If a sub-element (vertex, edge, face) is selected on this object, render its specific marker on top:
        if (subSelection && subSelection.objectId === selectedObjectId && subSelection.point) {
          if (subSelection.mode === "vertex") {
            const markerGeo = new THREE.SphereGeometry(0.08, 16, 12);
            const markerMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, depthTest: false });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.fromArray(subSelection.point);
            marker.renderOrder = 10000;
            this.selectionGroup.add(marker);

            const ringGeo = new THREE.RingGeometry(0.1, 0.15, 24);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, depthTest: false });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.fromArray(subSelection.point);
            if (this.activeCamera) ring.quaternion.copy(this.activeCamera.quaternion);
            ring.renderOrder = 10000;
            this.selectionGroup.add(ring);
          } else if (subSelection.mode === "edge" && subSelection.edge) {
            const [p1, p2] = subSelection.edge;
            const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p1), new THREE.Vector3(...p2)]);
            const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 5, depthTest: false });
            const line = new THREE.Line(lineGeo, lineMat);
            line.renderOrder = 10000;
            this.selectionGroup.add(line);
          } else if (subSelection.mode === "face" && subSelection.vertices) {
            const [vA, vB, vC] = subSelection.vertices;
            const faceGeo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(...vA), new THREE.Vector3(...vB), new THREE.Vector3(...vC)
            ]);
            faceGeo.setIndex([0, 1, 2]);
            faceGeo.computeVertexNormals();
            const faceMat = new THREE.MeshBasicMaterial({
              color: 0x38bdf8,
              opacity: 0.75,
              transparent: true,
              side: THREE.DoubleSide,
              depthTest: false
            });
            const faceMesh = new THREE.Mesh(faceGeo, faceMat);
            faceMesh.renderOrder = 10000;
            this.selectionGroup.add(faceMesh);

            const outlineGeo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(...vA), new THREE.Vector3(...vB), new THREE.Vector3(...vC), new THREE.Vector3(...vA)
            ]);
            const outline = new THREE.Line(outlineGeo, new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3, depthTest: false }));
            outline.renderOrder = 10001;
            this.selectionGroup.add(outline);
          }
        }
      }
    }
  },

  getObjectWorldCenter(objectId) {
    const node = this.objectNodes.get(objectId);
    if (!node) return null;
    node.updateMatrixWorld(true);

    const bones = [];
    node.traverse((child) => {
      if (child.isBone) bones.push(child);
    });

    if (bones.length > 0) {
      const center = new THREE.Vector3();
      const tempPos = new THREE.Vector3();
      for (const bone of bones) {
        bone.getWorldPosition(tempPos);
        center.add(tempPos);
      }
      center.divideScalar(bones.length);
      return [center.x, center.y, center.z];
    }

    const box = new THREE.Box3().setFromObject(node);
    if (!box.isEmpty() && Number.isFinite(box.min.x)) {
      const center = box.getCenter(new THREE.Vector3());
      return [center.x, center.y, center.z];
    }

    const pos = new THREE.Vector3();
    node.getWorldPosition(pos);
    return [pos.x, pos.y, pos.z];
  }

  };
}

