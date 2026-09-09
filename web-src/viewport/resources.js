// WebGL viewport methods extracted from the public facade.

import { cameraBodyGizmo, targetCrosshair } from "./camera-gizmo.js";
import { attachMeshOverlays } from "./mesh-overlays.js";
import { createLowPolyHumanGeometry } from "./human-geometry.js";
import { reconstructionMaterialMode } from "../scene/reconstruction-badges.js";
import { spatialHandlePoints } from "../camera-path-curve.js";

// Spatial-curve handle styling. The keyframe control point is deliberately a
// different colour from its camera's path line and larger than a plain marker;
// the tangent handles get their own accent so in/out reads at a glance.
const CURVE_POINT_COLOR = 0xffffff;
const CURVE_POINT_RADIUS = 0.17;
const CURVE_HANDLE_COLOR = 0x36d6c3;
const CURVE_HANDLE_RADIUS = 0.06;

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

  rebuild(state, mediaById, modelUrlsById, cleanCapture = false) {
    this.content.traverse((parent) => {
      for (const child of [...parent.children]) {
        if (!child.userData.omnicamHelper) continue;
        parent.remove(child);
        disposeObject(child, true);
      }
    });
    disposeObject(this.content); this.content.clear();
    this.objectNodes.clear();
    this.selectionKey = "";
    const mode = state.render_mode;
    // Dual-tier 3D grid: major 5-unit grid + fine 1-unit subdivisions + ground axes
    const gridGroup = new THREE.Group();
    gridGroup.userData.omnicamCaptureGuide = true;

    const majorGrid = new THREE.GridHelper(120, 24, 0x3e4758, 0x323947);
    majorGrid.userData.omnicamCaptureGuide = true;
    majorGrid.frustumCulled = false;
    majorGrid.position.y = 0.0005;
    gridGroup.add(majorGrid);

    const minorGrid = new THREE.GridHelper(120, 120, 0x222631, 0x1d212b);
    minorGrid.userData.omnicamCaptureGuide = true;
    minorGrid.frustumCulled = false;
    gridGroup.add(minorGrid);

    const axisMatX = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2, transparent: true, opacity: 0.85 });
    const axisGeoX = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-60, 0.001, 0), new THREE.Vector3(60, 0.001, 0)]);
    const axisLineX = new THREE.Line(axisGeoX, axisMatX);
    axisLineX.userData.omnicamCaptureGuide = true;
    gridGroup.add(axisLineX);

    const axisMatZ = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2, transparent: true, opacity: 0.85 });
    const axisGeoZ = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.001, -60), new THREE.Vector3(0, 0.001, 60)]);
    const axisLineZ = new THREE.Line(axisGeoZ, axisMatZ);
    axisLineZ.userData.omnicamCaptureGuide = true;
    gridGroup.add(axisLineZ);

    this.content.add(gridGroup);
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
        const cull = Boolean(state.backface_culling);
        const effectiveAppearance = reconstructionMaterialMode(object, state, cleanCapture) ?? (object.material_mode || "textured");
        if (model?.url === url) { mesh = model.scene; applyModelMaterial(mesh, effectiveAppearance, object, cull); }
      } else if (object.type === "sphere") {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), objectMaterial(object, mode, Boolean(state.backface_culling)));
      } else if (object.type === "cylinder") {
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 24), objectMaterial(object, mode, Boolean(state.backface_culling)));
      } else if (object.type === "torus") {
        const torusGeom = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
        torusGeom.rotateX(Math.PI / 2);
        mesh = new THREE.Mesh(torusGeom, objectMaterial(object, mode, Boolean(state.backface_culling)));
      } else if (object.type === "pyramid") {
        const pyrGeom = new THREE.ConeGeometry(0.7, 1, 4);
        pyrGeom.rotateY(Math.PI / 4);
        mesh = new THREE.Mesh(pyrGeom, objectMaterial(object, mode, Boolean(state.backface_culling)));
      } else if (object.type === "sun_light") {
        const lightGroup = new THREE.Group();
        const dirLight = new THREE.DirectionalLight(object.color || 0xfff6ec, object.intensity ?? 2.2);
        dirLight.castShadow = object.cast_shadow !== false;
        if (dirLight.castShadow) {
          dirLight.shadow.mapSize.set(1024, 1024);
          dirLight.shadow.bias = -0.0008;
          dirLight.shadow.normalBias = 0.02;
          dirLight.shadow.radius = 2.4;
          dirLight.shadow.camera.near = 0.5;
          dirLight.shadow.camera.far = 70;
          dirLight.shadow.camera.left = dirLight.shadow.camera.bottom = -14;
          dirLight.shadow.camera.right = dirLight.shadow.camera.top = 14;
        }
        const rot = (object.rotation || [0, 0, 0]).map(THREE.MathUtils.degToRad);
        const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(rot[0], rot[1], rot[2], "YXZ"));
        dirLight.target.position.copy(dirLight.position).add(dir.multiplyScalar(10));
        lightGroup.add(dirLight, dirLight.target);
        const sunHelper = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 12, 8),
          new THREE.MeshBasicMaterial({ color: object.color || 0xf59e0b, wireframe: true })
        );
        sunHelper.userData.omnicamLightHelper = true;
        sunHelper.visible = !cleanCapture;
        lightGroup.add(sunHelper);
        mesh = lightGroup;
      } else if (object.type === "point_light") {
        const lightGroup = new THREE.Group();
        const pLight = new THREE.PointLight(object.color || 0xffffff, object.intensity ?? 2.0, 0, 2);
        lightGroup.add(pLight);
        const pointHelper = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 12, 8),
          new THREE.MeshBasicMaterial({ color: object.color || 0xfbbf24, wireframe: true })
        );
        pointHelper.userData.omnicamLightHelper = true;
        pointHelper.visible = !cleanCapture;
        lightGroup.add(pointHelper);
        mesh = lightGroup;
      } else if (object.type === "spot_light") {
        const lightGroup = new THREE.Group();
        const coneAngle = ((object.cone_angle ?? 45) * Math.PI) / 180;
        const penumbra = object.penumbra ?? 0.25;
        const sLight = new THREE.SpotLight(object.color || 0xffffff, object.intensity ?? 3.0, 0, coneAngle, penumbra, 2);
        const rot = (object.rotation || [0, 0, 0]).map(THREE.MathUtils.degToRad);
        const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(rot[0], rot[1], rot[2], "YXZ"));
        sLight.target.position.copy(sLight.position).add(dir.multiplyScalar(10));
        lightGroup.add(sLight, sLight.target);
        const spotHelper = new THREE.Mesh(
          new THREE.ConeGeometry(0.25, 0.5, 8),
          new THREE.MeshBasicMaterial({ color: object.color || 0x38bdf8, wireframe: true })
        );
        spotHelper.userData.omnicamLightHelper = true;
        spotHelper.visible = !cleanCapture;
        lightGroup.add(spotHelper);
        mesh = lightGroup;
      } else if (object.type === "human") {
        mesh = new THREE.Mesh(createLowPolyHumanGeometry(THREE), objectMaterial(object, mode, Boolean(state.backface_culling)));
      } else if (object.type === "ground") mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), objectMaterial(object, mode, Boolean(state.backface_culling)));
      else if (object.type === "card") {
        const isCardTextured = !object.material_mode || ["textured", "wireframe_texture"].includes(object.material_mode);
        mesh = !isCardTextured ? new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), objectMaterial(object, mode, Boolean(state.backface_culling))) : cardMesh(object, mediaById.get(object.id), state.card_fit || "contain");
      } else if (object.type === "null") {
        const axes = new THREE.AxesHelper(0.5); axes.position.fromArray(object.position || [0, 0, 0]); axes.userData.omnicamId = object.id; axes.frustumCulled = false; this.objectNodes.set(object.id, axes); this.content.add(axes); continue;
      } else {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), objectMaterial(object, mode, Boolean(state.backface_culling)));
      }
      if (!mesh) continue;
      mesh.position.fromArray(object.position || [0, 0, 0]);
      mesh.rotation.set(...(object.rotation || [0, 0, 0]).map(THREE.MathUtils.degToRad));
      const isLight = ["sun_light", "point_light", "spot_light"].includes(object.type);
      if (object.type !== "card" && !isLight) mesh.scale.fromArray(size);
      mesh.userData.omnicamId = object.id;
      mesh.frustumCulled = false;
      mesh.traverse((c) => {
        c.frustumCulled = false;
        c.userData.omnicamId = object.id;
      });

      if (!isLight) {
        const isWireframeActive = Boolean(
          state.show_wireframe ||
          state.render_mode === "wireframe_texture" ||
          object.material_mode === "wireframe_texture" ||
          object.material_mode === "wireframe_neutral"
        );
        attachMeshOverlays(THREE, mesh, { wireframe: isWireframeActive, vertices: state.show_vertices });
      }

      this.objectNodes.set(object.id, mesh);
      this.content.add(mesh);
    }
  },

  rebuildPath(state, selectedEntity = "camera", selectedFrame = null, viewMode = "") {
    disposeObject(this.path); this.path.clear();
    // Through the active camera's own lens its trajectory and keyframe frustums
    // are drawn straight across the shot. Skip them there; the live look-at
    // target from updateLiveCameras still shows so the aim stays editable.
    const povCameraId = viewMode === "camera" ? state.active_camera_id : null;
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
      if (camera.id === povCameraId) return;
      const palette = camera.color
        ? { line: new THREE.Color(camera.color), marker: new THREE.Color(camera.color), frustum: new THREE.Color(camera.color) }
        : cameraColors[camIdx % cameraColors.length];
      const isActive = camera.id === state.active_camera_id;
      // The active camera is "selected" only while the editor selection is on the
      // camera itself (not an object, not the look-at target).
      const isSelected = isActive && selectedEntity === "camera";

      if (keys.length >= 2) {
        const firstFrame = keys[0].frame;
        const lastFrame = keys[keys.length - 1].frame;
        const samples = Math.max(32, Math.min(256, lastFrame - firstFrame + 1));
        const trackState = { ...camera, keyframes: keys, objects: state.objects };
        const points = Array.from({ length: samples }, (_, index) => {
          const frame = firstFrame + ((lastFrame - firstFrame) * index) / Math.max(1, samples - 1);
          return new THREE.Vector3().fromArray(sampleCamera(trackState, frame, state.objects).position);
        });
        const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
        const radius = isSelected ? 0.06 : isActive ? 0.045 : 0.025;
        const material = new THREE.MeshBasicMaterial({
          color: palette.line,
          transparent: true,
          opacity: isActive ? 1.0 : 0.55,
          depthTest: false,
        });
        const pathMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(48, samples), radius, 8, false), material);
        pathMesh.renderOrder = 900;
        pathMesh.userData.omnicamWidget = "path";
        this.path.add(pathMesh);
        if (isActive) {
          const glow = new THREE.Mesh(
            new THREE.TubeGeometry(curve, Math.max(48, samples), radius * (isSelected ? 3 : 2.4), 8, false),
            new THREE.MeshBasicMaterial({ color: palette.line, transparent: true, opacity: isSelected ? 0.3 : 0.18, depthTest: false }),
          );
          glow.renderOrder = 899;
          glow.userData.omnicamWidget = "path";
          this.path.add(glow);

          // Directional flow: subtle chevron cones along the spline indicating camera flight direction
          if (points.length >= 8) {
            const step = Math.max(6, Math.floor(samples / 8));
            for (let i = Math.floor(step / 2); i < samples - 1; i += step) {
              const p = points[i];
              const tangent = points[i + 1].clone().sub(p).normalize();
              const arrow = new THREE.ConeGeometry(radius * 1.5, radius * 3.0, 8);
              arrow.rotateX(Math.PI / 2);
              const rot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
              const arrowMesh = new THREE.Mesh(arrow, new THREE.MeshBasicMaterial({ color: palette.marker, transparent: true, opacity: 0.85, depthTest: false }));
              arrowMesh.quaternion.copy(rot);
              arrowMesh.position.copy(p);
              arrowMesh.renderOrder = 901;
              arrowMesh.userData.omnicamWidget = "path";
              this.path.add(arrowMesh);
            }
          }
        }
      }

      for (const key of keys) {
        const keyIndex = keys.indexOf(key);
        // The active track's keyframes are editable spatial-curve control
        // points: draw them larger and in a fixed colour so they never blend
        // into their own camera's path line.
        const controlPoint = isActive;
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(controlPoint ? CURVE_POINT_RADIUS : 0.085, 16, 12),
          new THREE.MeshBasicMaterial({ color: controlPoint ? CURVE_POINT_COLOR : palette.marker, depthTest: false })
        );
        marker.position.fromArray(key.camera.position);
        marker.renderOrder = 910;
        // Identifies the marker as a draggable handle for this exact keyframe.
        marker.userData.omnicamPathKey = { cameraId: camera.id, frame: key.frame };
        marker.userData.omnicamWidget = "path";
        this.path.add(marker);

        // Sleek outer waypoint halo ring
        const outerRing = new THREE.Mesh(
          new THREE.RingGeometry((controlPoint ? CURVE_POINT_RADIUS : 0.085) * 1.3, (controlPoint ? CURVE_POINT_RADIUS : 0.085) * 1.7, 24),
          new THREE.MeshBasicMaterial({ color: controlPoint ? 0xffffff : palette.marker, side: THREE.DoubleSide, transparent: true, opacity: 0.65, depthTest: false })
        );
        outerRing.position.fromArray(key.camera.position);
        outerRing.renderOrder = 909;
        outerRing.userData.omnicamBillboard = true;
        outerRing.userData.omnicamWidget = "path";
        this.path.add(outerRing);

        const position = new THREE.Vector3().fromArray(key.camera.position);
        const target = new THREE.Vector3().fromArray(key.camera.target || [0, 0, 0]);
        const selectedKeyHere = isActive && selectedFrame != null && key.frame === selectedFrame;

        // Radiant beacon halo on the selected keyframe control point
        if (selectedKeyHere) {
          const beacon = new THREE.Mesh(
            new THREE.RingGeometry(CURVE_POINT_RADIUS * 2.1, CURVE_POINT_RADIUS * 2.6, 24),
            new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthTest: false })
          );
          beacon.position.fromArray(key.camera.position);
          beacon.renderOrder = 911;
          beacon.userData.omnicamBillboard = true;
          beacon.userData.omnicamWidget = "path";
          this.path.add(beacon);
        }

        // Every other keyframe is just its path point above: the frustum and
        // camera body only draw for the one keyframe actually selected. The
        // live (scrubbed) position gets its own camera from updateLiveCameras,
        // so a path full of keyframes never reads as a wall of cameras.
        if (selectedKeyHere) {
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
          const frustumLines = new THREE.LineSegments(frustum, new THREE.LineBasicMaterial({
            color: palette.marker,
            transparent: true,
            opacity: 1.0,
            depthTest: false,
          }));
          frustumLines.userData.omnicamWidget = "gizmo";
          this.path.add(frustumLines);

          // Translucent near-plane film gate quad
          const gateGeo = new THREE.BufferGeometry();
          gateGeo.setIndex([0, 1, 2, 0, 2, 3]);
          gateGeo.setAttribute("position", new THREE.Float32BufferAttribute([
            corners[0].x, corners[0].y, corners[0].z,
            corners[1].x, corners[1].y, corners[1].z,
            corners[2].x, corners[2].y, corners[2].z,
            corners[3].x, corners[3].y, corners[3].z,
          ], 3));
          const gateMesh = new THREE.Mesh(gateGeo, new THREE.MeshBasicMaterial({
            color: palette.marker,
            transparent: true,
            opacity: 0.12,
            depthTest: false,
            side: THREE.DoubleSide,
          }));
          gateMesh.userData.omnicamWidget = "gizmo";
          this.path.add(gateMesh);

          // A shaded body with a lens cone reads as a camera at a glance, where
          // the frustum lines alone read as an abstract shape.
          const body = cameraBodyGizmo(THREE, {
            position, forward, up,
            color: palette.marker,
            scale: THREE.MathUtils.clamp(distance * 1.15, 0.35, 1.6),
            active: isActive,
          });
          body.userData.omnicamWidget = "gizmo";
          this.path.add(body);
        }

        // Same rule as the frustum above: a look-at crosshair per keyframe was
        // just as much clutter as a camera per keyframe. Only the selected key
        // gets one here; the live (scrubbed) look-at comes from
        // updateLiveCameras, same as the live camera body.
        if (selectedKeyHere) {
          const crosshair = targetCrosshair(THREE, {
            position: target,
            radius: THREE.MathUtils.clamp(position.distanceTo(target) * 0.05, 0.16, 0.5) * 1.4,
            bold: true,
          });
          crosshair.userData.omnicamWidget = "lookat";
          this.path.add(crosshair);

          // Highlight the selected keyframe's line of sight so the look-at reads
          // as a direction, not just a point in space.
          const sight = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([position.clone(), target.clone()]),
            new THREE.LineBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.9, depthTest: false }),
          );
          sight.renderOrder = 914;
          sight.userData.omnicamWidget = "lookat";
          this.path.add(sight);
        }

        // In/out Bézier tangent handles for the selected control point. Drawn
        // for every mode (auto shows a live preview) so the artist can always
        // grab one; dragging a knob reshapes the path via key.tangents.
        if (selectedKeyHere) {
          const handles = spatialHandlePoints(key, keys[keyIndex - 1] || null, keys[keyIndex + 1] || null);
          for (const side of ["in", "out"]) {
            const tip = new THREE.Vector3().fromArray(handles[side]);
            const stem = new THREE.Line(
              new THREE.BufferGeometry().setFromPoints([position.clone(), tip.clone()]),
              new THREE.LineBasicMaterial({ color: CURVE_HANDLE_COLOR, transparent: true, opacity: 0.95, depthTest: false }),
            );
            stem.renderOrder = 912;
            stem.userData.omnicamWidget = "gizmo";
            this.path.add(stem);

            const knob = new THREE.Mesh(
              new THREE.SphereGeometry(CURVE_HANDLE_RADIUS, 12, 8),
              new THREE.MeshBasicMaterial({ color: CURVE_HANDLE_COLOR, depthTest: false }),
            );
            knob.position.copy(tip);
            knob.renderOrder = 913;
            knob.userData.omnicamCurveHandle = { cameraId: camera.id, frame: key.frame, side };
            knob.userData.omnicamWidget = "gizmo";
            this.path.add(knob);
          }
        }
      }
    });

    // Object motion tracks
    const objectColors = [0xff7675, 0x00cec9, 0xfdcb6e, 0x6c5ce7, 0xe17055];
    (state.objects || []).forEach((object, objIdx) => {
      const keys = object.keyframes || [];
      if (keys.length < 2) return;
      const color = object.color ? new THREE.Color(object.color) : objectColors[objIdx % objectColors.length];
      const points = keys.map((k) => new THREE.Vector3().fromArray(k.transform?.position || [0, 0, 0]));
      const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
      const objectPath = new THREE.Mesh(
        new THREE.TubeGeometry(curve, Math.max(32, keys.length * 16), 0.035, 8, false),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthTest: false }),
      );
      objectPath.renderOrder = 900;
      objectPath.userData.omnicamWidget = "path";
      this.path.add(objectPath);

      for (const key of keys) {
        const objMarker = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.14, 0.14),
          new THREE.MeshBasicMaterial({ color, depthTest: false })
        );
        objMarker.position.fromArray(key.transform?.position || [0, 0, 0]);
        objMarker.renderOrder = 910;
        objMarker.userData.omnicamWidget = "path";
        this.path.add(objMarker);
      }
    });
  }

  };
}

