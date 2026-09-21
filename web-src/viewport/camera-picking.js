// WebGL viewport methods extracted from the public facade.

import { curveHandleFromHit, pathKeyFromHit } from "./path-editing.js";

export function createCameraPickingMethods(dependencies) {
  const { THREE, FBXLoader, GLTFLoader, OBJLoader, PLYLoader, STLLoader, neutral, wire, checkerMaterial, objectMaterial, applyModelMaterial, disposeObject, textureFor, cardMesh, generatePointField, sampleCamera, sampleObjectTransform } = dependencies;
  // Pointer coords arrive in interaction-canvas (logical) pixels, but the WebGL
  // canvas is drawn supersampled (renderScale). NDC must be taken against the
  // logical size or every pick lands renderScale-x off centre.
  function logicalSize(ctx) {
    const factor = ctx.supersampleFactor?.() || 1;
    return { w: ctx.canvas.width / factor, h: ctx.canvas.height / factor };
  }

  return {
    /** The camera-path handle under the pointer, with its world position. */
    pickPathKey(pointer) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: logicalW, h: logicalH } = logicalSize(this);
      this.pointer.set((pointer[0] / logicalW) * 2 - 1, -(pointer[1] / logicalH) * 2 + 1);
      this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const hit of this.raycaster.intersectObjects(this.path.children, true)) {
        const key = pathKeyFromHit(hit);
        if (key) return { ...key, position: hit.object.position.toArray() };
      }
      // The marker sphere has a fixed world-space radius, so it shrinks to a
      // few screen pixels (or less) once the camera is far away or the view
      // is zoomed out -- an exact geometric raycast alone makes it
      // effectively unclickable at distance. Every other viewport handle
      // (the transform gizmo, the camera/target icons in pickSceneObject)
      // picks with a fixed pixel radius instead; fall back to the same idea
      // here, still preferring the closest marker on screen.
      const threshold = 16 * Math.min(2, window.devicePixelRatio || 1);
      let best = null;
      const projected = new THREE.Vector3();
      for (const child of this.path.children) {
        const key = child.userData?.omnicamPathKey;
        if (!key) continue;
        projected.copy(child.position).project(this.activeCamera);
        if (projected.z < -1 || projected.z > 1) continue;
        const screenX = (projected.x * 0.5 + 0.5) * logicalW;
        const screenY = (1 - (projected.y * 0.5 + 0.5)) * logicalH;
        const distance = Math.hypot(pointer[0] - screenX, pointer[1] - screenY);
        if (distance <= threshold && (!best || distance < best.distance)) best = { key, position: child.position.toArray(), distance };
      }
      return best ? { ...best.key, position: best.position } : null;
    },

    /** The spatial-curve tangent handle knob under the pointer, with its world position. */
    pickCurveHandle(pointer) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: logicalW, h: logicalH } = logicalSize(this);
      this.pointer.set((pointer[0] / logicalW) * 2 - 1, -(pointer[1] / logicalH) * 2 + 1);
      this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      for (const hit of this.raycaster.intersectObjects(this.path.children, true)) {
        const handle = curveHandleFromHit(hit);
        if (handle) return { ...handle, position: hit.object.position.toArray() };
      }
      // Same fixed-pixel fallback as pickPathKey: the knob is a small fixed
      // world-space sphere and becomes an unclickable dot at distance.
      const threshold = 14 * Math.min(2, window.devicePixelRatio || 1);
      let best = null;
      const projected = new THREE.Vector3();
      for (const child of this.path.children) {
        const handle = child.userData?.omnicamCurveHandle;
        if (!handle) continue;
        projected.copy(child.position).project(this.activeCamera);
        if (projected.z < -1 || projected.z > 1) continue;
        const screenX = (projected.x * 0.5 + 0.5) * logicalW;
        const screenY = (1 - (projected.y * 0.5 + 0.5)) * logicalH;
        const distance = Math.hypot(pointer[0] - screenX, pointer[1] - screenY);
        if (distance <= threshold && (!best || distance < best.distance)) best = { handle, position: child.position.toArray(), distance };
      }
      return best ? { ...best.handle, position: best.position } : null;
    },

    /**
     * The active camera-path segment (two neighbouring real keyframes, plus
     * a `t` 0..1 between them) nearest the pointer, for double-click-to-
     * insert (Task 8). `null` when the pointer isn't over the path tube.
     */
    pickPathSegment(pointer) {
      if (!this.path.visible || !this.activeCamera) return null;
      const { w: logicalW, h: logicalH } = logicalSize(this);
      this.pointer.set((pointer[0] / logicalW) * 2 - 1, -(pointer[1] / logicalH) * 2 + 1);
      this.raycaster.setFromCamera(this.pointer, this.activeCamera);
      const hit = this.raycaster.intersectObjects(this.path.children, true)
        .find((entry) => entry.object.userData?.omnicamPathSegments);
      if (!hit) return null;

      const { cameraId, firstFrame, lastFrame, frames, points } = hit.object.userData.omnicamPathSegments;
      if (!points?.length || frames.length < 2) return null;

      // Nearest sampled point on the tube's centreline -> its frame.
      let nearestIndex = 0;
      let nearestDistSq = Infinity;
      for (let index = 0; index < points.length; index += 1) {
        const [px, py, pz] = points[index];
        const dx = px - hit.point.x, dy = py - hit.point.y, dz = pz - hit.point.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < nearestDistSq) { nearestDistSq = distSq; nearestIndex = index; }
      }
      const hitFrame = firstFrame + ((lastFrame - firstFrame) * nearestIndex) / Math.max(1, points.length - 1);

      // Enclosing pair of *real* keyframes (not sample points).
      let leftFrame = frames[0];
      let rightFrame = frames[frames.length - 1];
      for (let i = 0; i < frames.length - 1; i += 1) {
        if (frames[i] <= hitFrame && hitFrame <= frames[i + 1]) {
          leftFrame = frames[i];
          rightFrame = frames[i + 1];
          break;
        }
      }
      if (leftFrame === rightFrame) return null;
      const t = Math.min(1, Math.max(0, (hitFrame - leftFrame) / (rightFrame - leftFrame)));
      return { cameraId, leftFrame, rightFrame, t };
    },

  configureCamera(cameraState, aspect) {
    const cam = cameraState || defaultCamera();
    const safeNear = Math.max(0.0005, Number(cam.near) || 0.01);
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

    const candidates = [];

    // Check camera bodies and camera target points
    if (this.liveCameras && this.liveCameras.visible) {
      for (const hit of this.raycaster.intersectObjects(this.liveCameras.children, true)) {
        if (hit.object?.userData?.omnicamType) {
          candidates.push({
            distance: hit.distance,
            type: hit.object.userData.omnicamType,
            id: hit.object.userData.omnicamId,
          });
        }
      }
    }

    // Check scene objects (cards, cubes, meshes, models)
    if (this.content && this.content.visible) {
      for (const hit of this.raycaster.intersectObjects(this.content.children, true)) {
        if (hit.object?.userData?.omnicamCaptureGuide || hit.object?.userData?.omnicamHelper) continue;
        let object = hit.object;
        while (object && !object.userData?.omnicamId) object = object.parent;
        if (object?.userData?.omnicamId) {
          candidates.push({
            distance: hit.distance,
            type: "object",
            id: object.userData.omnicamId,
          });
        }
      }
    }

    if (!candidates.length) return null;
    candidates.sort((a, b) => a.distance - b.distance);
    return { type: candidates[0].type, id: candidates[0].id };
  },

  /**
   * World point -> screen pixels, for the DOM label overlay and playblast
   * canvas (design spec section 14). `behind` is true when the point is
   * outside the near/far clip and the caller should hide its label.
   *
   * @param world   - [x, y, z] world-space position
   * @param width   - Optional explicit output width in the caller's pixel
   *                  space. When omitted, logicalSize(this) is used.
   * @param height  - Optional explicit output height in the caller's pixel
   *                  space. When omitted, logicalSize(this) is used.
   *
   * Pass the canvas' CSS clientWidth/clientHeight for DOM overlays so that
   * the returned coordinates are in CSS pixels and can be used directly for
   * element.style.transform positioning.  Pass the 2D canvas buffer width/
   * height for playblast canvas draws so that coordinates match the buffer.
   */
  projectWorldToScreen(world, width = null, height = null) {
    if (!this.activeCamera || !Array.isArray(world) || world.length < 3) return null;
    const { w: lw, h: lh } = logicalSize(this);
    const w = (width != null && height != null) ? width : lw;
    const h = (width != null && height != null) ? height : lh;
    const v = new THREE.Vector3(Number(world[0]) || 0, Number(world[1]) || 0, Number(world[2]) || 0);
    v.project(this.activeCamera);
    return {
      x: (v.x * 0.5 + 0.5) * w,
      y: (1 - (v.y * 0.5 + 0.5)) * h,
      behind: v.z < -1 || v.z > 1,
      width: w,
      height: h,
    };
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

