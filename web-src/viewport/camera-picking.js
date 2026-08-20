// WebGL viewport methods extracted from the public facade.

export function createCameraPickingMethods(dependencies) {
  const { THREE, FBXLoader, GLTFLoader, OBJLoader, PLYLoader, STLLoader, neutral, wire, checkerMaterial, objectMaterial, applyModelMaterial, disposeObject, textureFor, cardMesh, generatePointField, sampleCamera, sampleObjectTransform } = dependencies;
  return {
  configureCamera(cameraState, aspect) {
    const cam = cameraState || defaultCamera();
    const safeNear = Math.max(0.005, Number(cam.near) || 0.01);
    const safeFar = Math.max(safeNear + 1, Number(cam.far) || 10000);
    let camera;
    if (cam.camera_type === "orthographic") {
      camera = this.orthographic;
      const halfHeight = 5 / Math.max(0.01, cam.zoom || 1);
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.near = safeNear;
      camera.far = safeFar;
      camera.updateProjectionMatrix();
    } else {
      camera = this.perspective;
      camera.fov = THREE.MathUtils.clamp(Number(cam.fov) || 35, 1, 175);
      camera.aspect = aspect;
      camera.near = safeNear;
      camera.far = safeFar;
      camera.updateProjectionMatrix();
    }

    const pos = new THREE.Vector3().fromArray(cam.position || [6, 4, 6]);
    const tgt = new THREE.Vector3().fromArray(cam.target || [0, 1.5, 0]);
    const forward = tgt.clone().sub(pos);
    if (forward.lengthSq() < 1e-6) forward.set(0, 0, -1);
    else forward.normalize();

    let up = cam.up ? new THREE.Vector3().fromArray(cam.up) : new THREE.Vector3(0, 1, 0);
    let right = new THREE.Vector3().crossVectors(forward, up);
    if (right.lengthSq() < 1e-6) {
      up = Math.abs(forward.y) > 0.9 ? new THREE.Vector3(0, 0, forward.y > 0 ? -1 : 1) : new THREE.Vector3(0, 1, 0);
      right.crossVectors(forward, up);
    }
    right.normalize();
    up.crossVectors(right, forward).normalize();

    if (cam.roll) {
      const rollRad = THREE.MathUtils.degToRad(cam.roll);
      right.applyAxisAngle(forward, rollRad);
      up.applyAxisAngle(forward, rollRad);
    }

    camera.position.copy(pos);
    camera.up.copy(up);
    camera.lookAt(tgt);
    camera.updateMatrixWorld();
    return camera;
  },

  pick(x, y, width, height) {
    if (!this.activeCamera) return null;
    this.pointer.set((x / Math.max(1, width)) * 2 - 1, 1 - (y / Math.max(1, height)) * 2);
    this.raycaster.setFromCamera(this.pointer, this.activeCamera);
    
    // Check camera bodies and camera target points first
    if (this.liveCameras && this.liveCameras.visible) {
      for (const hit of this.raycaster.intersectObjects(this.liveCameras.children, true)) {
        if (hit.object?.userData?.omnicamType) {
          return { type: hit.object.userData.omnicamType, id: hit.object.userData.omnicamId };
        }
      }
    }

    // Check scene objects (cards, cubes, meshes, models)
    for (const hit of this.raycaster.intersectObjects(this.content.children, true)) {
      let object = hit.object;
      while (object && !object.userData.omnicamId) object = object.parent;
      if (object?.userData.omnicamId) return { type: "object", id: object.userData.omnicamId };
    }
    return null;
  },

  pickSubElement(x, y, width, height, mode = "vertex") {
    if (!this.activeCamera) return null;
    this.pointer.set((x / Math.max(1, width)) * 2 - 1, 1 - (y / Math.max(1, height)) * 2);
    this.raycaster.setFromCamera(this.pointer, this.activeCamera);
    const hits = this.raycaster.intersectObjects(this.content.children, true);
    for (const hit of hits) {
      let object = hit.object;
      let mesh = hit.object;
      while (object && !object.userData.omnicamId) object = object.parent;
      if (!object?.userData.omnicamId || !mesh.geometry) continue;
      const objectId = object.userData.omnicamId;
      const geom = mesh.geometry;
      const posAttr = geom.getAttribute("position");
      if (!posAttr) continue;

      mesh.updateMatrixWorld(true);
      const matrixWorld = mesh.matrixWorld;

      if (mode === "vertex") {
        let bestIndex = -1;
        let bestDist = Infinity;
        let bestWorldPos = null;

        if (hit.face) {
          const indices = [hit.face.a, hit.face.b, hit.face.c];
          for (const idx of indices) {
            const v = new THREE.Vector3(posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx)).applyMatrix4(matrixWorld);
            const dist = v.distanceTo(hit.point);
            if (dist < bestDist) {
              bestDist = dist;
              bestIndex = idx;
              bestWorldPos = [v.x, v.y, v.z];
            }
          }
        } else {
          for (let idx = 0; idx < posAttr.count; idx++) {
            const v = new THREE.Vector3(posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx)).applyMatrix4(matrixWorld);
            const dist = v.distanceTo(hit.point);
            if (dist < bestDist) {
              bestDist = dist;
              bestIndex = idx;
              bestWorldPos = [v.x, v.y, v.z];
            }
          }
        }

        if (bestWorldPos) {
          return {
            type: "vertex",
            mode: "vertex",
            objectId,
            index: bestIndex,
            point: bestWorldPos,
          };
        }
      }

      if (mode === "edge" && hit.face) {
        const vA = new THREE.Vector3(posAttr.getX(hit.face.a), posAttr.getY(hit.face.a), posAttr.getZ(hit.face.a)).applyMatrix4(matrixWorld);
        const vB = new THREE.Vector3(posAttr.getX(hit.face.b), posAttr.getY(hit.face.b), posAttr.getZ(hit.face.b)).applyMatrix4(matrixWorld);
        const vC = new THREE.Vector3(posAttr.getX(hit.face.c), posAttr.getY(hit.face.c), posAttr.getZ(hit.face.c)).applyMatrix4(matrixWorld);

        const lineDist = (p, l1, l2) => {
          const line = new THREE.Line3(l1, l2);
          const closest = new THREE.Vector3();
          line.closestPointToPoint(p, true, closest);
          return { dist: p.distanceTo(closest), point: closest, segment: [l1, l2] };
        };

        const dAB = lineDist(hit.point, vA, vB);
        const dBC = lineDist(hit.point, vB, vC);
        const dCA = lineDist(hit.point, vC, vA);

        const best = [dAB, dBC, dCA].reduce((min, cur) => (cur.dist < min.dist ? cur : min));
        return {
          type: "edge",
          mode: "edge",
          objectId,
          point: [best.point.x, best.point.y, best.point.z],
          edge: [
            [best.segment[0].x, best.segment[0].y, best.segment[0].z],
            [best.segment[1].x, best.segment[1].y, best.segment[1].z],
          ],
        };
      }

      if (mode === "face" && hit.face) {
        const vA = new THREE.Vector3(posAttr.getX(hit.face.a), posAttr.getY(hit.face.a), posAttr.getZ(hit.face.a)).applyMatrix4(matrixWorld);
        const vB = new THREE.Vector3(posAttr.getX(hit.face.b), posAttr.getY(hit.face.b), posAttr.getZ(hit.face.b)).applyMatrix4(matrixWorld);
        const vC = new THREE.Vector3(posAttr.getX(hit.face.c), posAttr.getY(hit.face.c), posAttr.getZ(hit.face.c)).applyMatrix4(matrixWorld);
        const center = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3);
        const normal = hit.face.normal.clone().transformDirection(matrixWorld);

        return {
          type: "face",
          mode: "face",
          objectId,
          faceIndex: hit.faceIndex,
          point: [center.x, center.y, center.z],
          normal: [normal.x, normal.y, normal.z],
          vertices: [
            [vA.x, vA.y, vA.z],
            [vB.x, vB.y, vB.z],
            [vC.x, vC.y, vC.z],
          ],
        };
      }
    }
    return null;
  },

  intersectScenePoint(x, y, width, height) {
    if (!this.activeCamera) return null;
    this.pointer.set((x / Math.max(1, width)) * 2 - 1, 1 - (y / Math.max(1, height)) * 2);
    this.raycaster.setFromCamera(this.pointer, this.activeCamera);
    const hits = this.raycaster.intersectObjects(this.content.children, true);
    if (hits.length > 0) {
      return [hits[0].point.x, hits[0].point.y, hits[0].point.z];
    }
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(plane, target)) {
      return [target.x, target.y, target.z];
    }
    return null;
  }

  };
}

