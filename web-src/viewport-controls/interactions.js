// Pointer, drag and wheel interaction handlers.

import { add, cameraBasis, clamp, cloneCamera, cloneTransform, cross, defaultEditorViews, length, mul, norm, rotateEuler, sampleCamera, sampleObjectTransform, sub, project } from "../director/core.js";
import { interpolationAfterDrag, screenToPlane } from "../viewport/path-editing.js";
import { onKeyDragMove } from "../timeline.js";
import { activeGizmoEntity, gizmoAxes, gizmoGeometry, pickGizmo, pickSceneObject, viewportCamera } from "../viewport-controls.js";
import { t } from "../i18n.js";
import { cancelModalTransform, confirmModalTransform, selectedTransformObjects, updateModalTransform } from "./modal-transform.js";

function checkpointDrag(ui, drag, label) {
  if (!drag || drag.historyCheckpointed) return;
  ui.checkpoint(label);
  drag.historyCheckpointed = true;
}

function checkpointWheelGesture(ui) {
  const now = globalThis.performance?.now?.() ?? Date.now();
  if (!Number.isFinite(ui.lastViewportWheelAt) || now - ui.lastViewportWheelAt > 300) {
    ui.checkpoint("Dolly viewport");
  }
  ui.lastViewportWheelAt = now;
}

const snapValue = (value, step) => Math.round(value / step) * step;
const snapVector = (value, step) => value.map((component) => snapValue(component, step));
const worldPerPixel = (camera, height) => camera.camera_type === "orthographic"
  ? 10 / (Math.max(0.01, camera.zoom || 1) * Math.max(1, height))
  : length(sub(camera.position, camera.target)) * 25e-4;

function spatiallySnap(ui, position, pointer, excludedIds = []) {
  const temporaryGrid = ui.currentTransformEvent?.ctrlKey || ui.currentTransformEvent?.metaKey;
  const mode = temporaryGrid ? "grid" : ui.state.spatial_snap_mode;
  if (mode === "grid") return snapVector(position, ui.state.spatial_grid_size || 0.5);
  if (mode === "vertex" && pointer) {
    const hit = ui.webgl?.pickSubElement?.(pointer[0], pointer[1], ui.canvas.width, ui.canvas.height, "vertex");
    if (hit?.point && !excludedIds.includes(hit.objectId)) return [...hit.point];
  }
  return position;
}

export function onPointerDown(ui, e) {
  if (ui.modalTransform) {
    e.preventDefault?.(); e.stopPropagation?.();
    if (e.button === 0) confirmModalTransform(ui);
    else if (e.button === 2) cancelModalTransform(ui);
    return;
  }
  if (e.target?.closest?.("button,input,select")) return;
  if (e.button === 2 && !e.altKey) {
    // The unmodified secondary button belongs to the OmniCam context menu.
    // Swallow its pointer event before ComfyUI's graph canvas can see it;
    // the following `contextmenu` event will open the local menu.
    e.preventDefault?.();
    e.stopPropagation?.();
    e.stopImmediatePropagation?.();
    return;
  }
  e.preventDefault?.();
  e.stopPropagation?.();
  ui.closeMenus();
  ui.interactionElement.focus({ preventScroll: true });
  ui.interactionElement.setPointerCapture?.(e.pointerId);
  ui.activePointerId = e.pointerId;
  ui.canvas.classList.add("dragging");

  const rect = ui.interactionElement.getBoundingClientRect();
  const pointerX = ((e.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width);
  const pointerY = ((e.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height);
  const viewCamera = viewportCamera(ui);
  const editorView = ui.state.view_mode !== "camera";

  // Only the primary button selects or edits scene entities. In particular,
  // middle-button navigation must never be captured by a selected gizmo.
  const canPick = e.button === 0;
  // A visible gizmo handle owns an unmodified primary drag, as in standard 3D
  // editors. Navigation still starts normally everywhere outside the handles.
  const canEditGizmo = canPick && !e.altKey && !e.shiftKey;
  // A camera-path handle behaves like a gizmo: an unmodified primary drag on it
  // reshapes the move instead of orbiting the view.
  if (canEditGizmo && ui.webgl?.pickPathKey) {
    const handle = ui.webgl.pickPathKey([pointerX, pointerY]);
    if (handle) {
      const track = (ui.state.cameras || []).find((camera) => camera.id === handle.cameraId);
      const key = (track?.keyframes || []).find((item) => item.frame === handle.frame);
      if (key) {
        ui.checkpoint("Move path key");
        ui.pathDrag = { cameraId: handle.cameraId, frame: handle.frame, anchor: [...key.camera.position] };
        if (ui.interactionElement.style) ui.interactionElement.style.cursor = "grabbing";
        ui.selectKeyframe?.(key);
        return;
      }
    }
  }

  const picked = canEditGizmo ? pickGizmo(ui, [pointerX, pointerY]) : null;
  if (picked) {
    const [a, b] = picked.segment;
    const screenLength = Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]));
    const baseDrag = {
      pointer: [pointerX, pointerY],
      axis: picked.axis,
      axisIndex: picked.index,
      screen: [(b[0] - a[0]) / screenLength, (b[1] - a[1]) / screenLength],
      worldLength: picked.worldLength,
      screenLength,
      free: Boolean(picked.free),
    };
    if (ui.interactionElement.style) ui.interactionElement.style.cursor = "grabbing";

    if (picked.entity.type === "camera_target") {
      ui.checkpoint("Move camera target");
      ui.beginCameraEdit();
      ui.gizmoDrag = {
        ...baseDrag,
        type: "camera_target",
        historyCheckpointed: true,
        target: [...(picked.entity.position || ui.camera.target)],
      };
      return;
    }
    if (picked.entity.type === "camera") {
      ui.checkpoint("Transform camera");
      ui.beginCameraEdit();
      ui.gizmoDrag = {
        ...baseDrag,
        type: "camera",
        historyCheckpointed: true,
        position: [...(picked.entity.position || ui.camera.position)],
        target: [...ui.camera.target],
      };
      return;
    }
    if (picked.entity.type === "object") {
      const selected = picked.entity.object;
      ui.checkpoint("Transform object");
      const groupObjects = selectedTransformObjects(ui);
      const group = (groupObjects.length ? groupObjects : [selected]).map((object) => ({ object, transform: cloneTransform(object) }));
      for (const item of group) ui.beginObjectEdit(item.object);
      const groupPivot = group.reduce((sum, item) => add(sum, item.transform.position), [0, 0, 0]).map((value) => value / group.length);
      ui.gizmoDrag = {
        ...baseDrag,
        type: "object",
        historyCheckpointed: true,
        object: selected,
        group,
        groupPivot,
        position: [...picked.entity.position],
        rotation: [...picked.entity.rotation],
        size: [...picked.entity.size],
        viewRight: cameraBasis(viewCamera).right,
        viewUp: cameraBasis(viewCamera).up,
        freeScale: viewCamera.camera_type === "orthographic"
          ? worldPerPixel(viewCamera, ui.canvas.height)
          : length(sub(viewCamera.position, picked.entity.position)) * (2 * Math.tan(((viewCamera.fov || 35) * Math.PI) / 360)) / ui.canvas.height,
      };
      return;
    }
  }

  // Check scene objects, camera bodies, target aim diamonds, and 3D path keyframes
  const hit = canPick ? pickSceneObject(ui, [pointerX, pointerY]) : null;
  ui.pointerHit = Boolean(picked || hit);
  if (hit) {
    if (hit.type === "camera_keyframe") {
      ui.finishCameraEdit();
      ui.selectedEntity = "camera";
      ui.selectedObjectId = null;
      ui.editingKeyFrame = null;
      ui.activateCamera(hit.camera.id);
      ui.setFrame(hit.keyframe.frame);
      ui.selectKeyframe(hit.keyframe);
      ui.refreshObjects();
      ui.refreshKeys();
      ui.refreshInspector();
      ui.render();
      ui.setStatus(t(`${hit.camera.name} · Keyframe @ F${hit.keyframe.frame} selected`));
      return;
    }

    if (hit.type === "object_keyframe") {
      ui.finishCameraEdit();
      ui.selectedEntity = "object";
      ui.selectedObjectId = hit.object.id;
      ui.editingKeyFrame = null;
      ui.setFrame(hit.keyframe.frame);
      ui.selectKeyframe(hit.keyframe);
      ui.refreshObjects();
      ui.refreshKeys();
      ui.refreshInspector();
      ui.render();
      ui.setStatus(t(`${hit.object.name || hit.object.type} · Keyframe @ F${hit.keyframe.frame} selected`));
      return;
    }

    if (hit.type === "camera_target") {
      ui.finishCameraEdit();
      ui.selectedEntity = "camera_target";
      ui.selectedObjectId = null;
      ui.selectedObjectIds = new Set();
      ui.editingKeyFrame = null;
      ui.activateCamera(hit.camera.id);
      ui.checkpoint("Move camera target");
      ui.beginCameraEdit();
      const { right, up } = cameraBasis(viewCamera);
      const initialTarget = [...ui.camera.target];
      const dist = length(sub(viewCamera.position, initialTarget));
      const fovRad = ((viewCamera.fov || 35) * Math.PI) / 360;
      ui.targetFreeDrag = {
        pointer: [pointerX, pointerY],
        target: initialTarget,
        right,
        up,
        scale: dist * (viewCamera.camera_type === "orthographic" ? 25e-4 : (2 * Math.tan(fovRad)) / ui.canvas.height),
        historyCheckpointed: true,
      };
      ui.refreshObjects();
      ui.refreshKeys();
      ui.refreshInspector();
      ui.render();
      ui.setStatus(t(`${hit.camera.name} · Target aim selected`));
      return;
    }

    if (hit.type === "camera") {
      ui.finishCameraEdit();
      ui.selectedEntity = "camera";
      ui.selectedObjectId = null;
      ui.selectedObjectIds = new Set();
      ui.editingKeyFrame = null;
      ui.activateCamera(hit.camera.id);
      ui.refreshObjects();
      ui.refreshKeys();
      ui.refreshInspector();
      ui.render();
      ui.setStatus(t(`${hit.camera.name} selected`));
    }

    if (hit.type === "object" && hit.object) {
      ui.finishCameraEdit();
      ui.selectedEntity = "object";
      ui.selectedObjectIds ||= new Set();
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        if (ui.selectedObjectIds.has(hit.object.id)) ui.selectedObjectIds.delete(hit.object.id);
        else ui.selectedObjectIds.add(hit.object.id);
      } else {
        ui.selectedObjectIds = new Set([hit.object.id]);
      }
      ui.selectedObjectId = ui.selectedObjectIds.has(hit.object.id) ? hit.object.id : [...ui.selectedObjectIds].at(-1) || null;
      ui.selectedKeyFrame = hit.object.keyframes?.find((key) => key.frame === ui.frame)?.frame ?? null;
      ui.editingKeyFrame = null;
      
      // If sub-element selection mode (vertex, edge, face) is active:
      if (ui.state.select_mode && ui.state.select_mode !== "object") {
        const subHit = ui.webgl?.pickSubElement?.(pointerX, pointerY, ui.canvas.width, ui.canvas.height, ui.state.select_mode);
        if (subHit) {
          ui.subSelection = subHit;
          const posStr = subHit.point.map((v) => Math.round(v * 100) / 100).join(", ");
          const modeName = subHit.mode === "vertex" ? "Vertex" : (subHit.mode === "edge" ? "Edge" : "Face");
          ui.setStatus(t(`${modeName} selected at [${posStr}] · Press F to focus`));
        } else {
          ui.subSelection = null;
        }
      } else {
        ui.subSelection = null;
        ui.setStatus(t(`${hit.object.name || hit.object.type} selected`));
      }

      ui.refreshObjects();
      ui.refreshKeys();
      ui.refreshInspector();
      ui.render();
    }
  }

  if (!hit && canPick && (e.ctrlKey || e.metaKey || ui.state.navigation_profile === "blender")) {
    ui.boxSelection = {
      start: [pointerX, pointerY], current: [pointerX, pointerY],
      additive: e.shiftKey, initial: new Set(ui.selectedObjectIds || []),
    };
    ui.drag = null;
    ui.interactionElement.style && (ui.interactionElement.style.cursor = "crosshair");
    ui.render();
    return;
  }

  // Standard 3D Software Viewport Navigation:
  // - Middle Click (or Alt+Middle, or Shift+Left/Middle): Pan
  // - Right Click (or Alt+Right): Dolly / Zoom
  // - Left Click (or Alt+Left): Orbit
  // - Fly Navigation: First-person gaze look
  const blenderNavigation = ui.state.navigation_profile === "blender";
  const isPan = blenderNavigation
    ? (e.button === 1 && e.shiftKey) || viewCamera.camera_type === "orthographic"
    : e.button === 1 || (e.altKey && e.button === 1) || (e.shiftKey && (e.button === 0 || e.button === 1)) || viewCamera.camera_type === "orthographic";
  const isDolly = blenderNavigation
    ? e.button === 1 && (e.ctrlKey || e.metaKey)
    : (e.altKey && e.button === 2) || (e.button === 2 && !ui.isNavigatingFly);
  const isFly = Boolean(ui.isNavigatingFly);

  if (!editorView) {
    ui.checkpoint("Move camera");
    ui.beginCameraEdit();
  }
  if (editorView && !ui.state.editor_views) ui.state.editor_views = defaultEditorViews();

  ui.drag = {
    x: e.clientX,
    y: e.clientY,
    shift: isPan,
    dolly: isDolly,
    fly: isFly,
    camera: cloneCamera(viewCamera),
    target: editorView ? (ui.state.editor_views[ui.state.view_mode] || (ui.state.editor_views[ui.state.view_mode] = defaultEditorViews()[ui.state.view_mode])) : ui.camera,
    editorView,
    historyCheckpointed: !editorView,
  };
  if (ui.interactionElement.style) ui.interactionElement.style.cursor = isDolly ? "ns-resize" : isPan ? "move" : "grabbing";
}

export function onPointerMove(ui, e) {
  ui.lastPointerEvent = e;
  if (ui.modalTransform) {
    updateModalTransform(ui, e);
    return;
  }
  if (ui.pathDrag) {
    const rect = ui.interactionElement.getBoundingClientRect();
    const pointerX = ((e.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width);
    const pointerY = ((e.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height);
    const track = (ui.state.cameras || []).find((camera) => camera.id === ui.pathDrag.cameraId);
    const key = (track?.keyframes || []).find((item) => item.frame === ui.pathDrag.frame);
    if (key) {
      key.camera.position = screenToPlane(
        [pointerX, pointerY], viewportCamera(ui), ui.pathDrag.anchor, ui.canvas.width, ui.canvas.height);
      // A hand-placed waypoint should join the move as a curve, not a corner.
      key.interpolation = interpolationAfterDrag(key.interpolation);
      if (ui.webgl) ui.webgl.pathKey = "";
      ui.setFrame(ui.frame, false, false);
      ui.render();
    }
    return;
  }
  if (ui.boxSelection) {
    const rect = ui.interactionElement.getBoundingClientRect();
    ui.boxSelection.current = [
      ((e.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width),
      ((e.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height),
    ];
    ui.render();
    return;
  }
  ui.currentTransformEvent = e;
  if (ui.keyDrag) {
    onKeyDragMove(ui, e);
    return;
  }

  if (ui.targetFreeDrag) {
    checkpointDrag(ui, ui.targetFreeDrag, "Move camera target");
    const rect = ui.interactionElement.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width);
    const currentY = ((e.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height);
    const dx = currentX - ui.targetFreeDrag.pointer[0];
    const dy = currentY - ui.targetFreeDrag.pointer[1];
    const precision = e.shiftKey ? 0.1 : 1;
    const delta = add(mul(ui.targetFreeDrag.right, dx * ui.targetFreeDrag.scale * precision), mul(ui.targetFreeDrag.up, -dy * ui.targetFreeDrag.scale * precision));
    const target = add(ui.targetFreeDrag.target, delta);
    ui.camera.target = spatiallySnap(ui, target, [currentX, currentY]);
    ui.commitCameraEdit();
    ui.refreshInspector();
    ui.render();
    return;
  }

  if (ui.gizmoDrag) {
    checkpointDrag(ui, ui.gizmoDrag, ui.gizmoDrag.type === "object" ? "Transform object" : "Transform camera");
    const rect = ui.interactionElement.getBoundingClientRect();
    const pointer = [
      ((e.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width),
      ((e.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height),
    ];
    const precision = e.shiftKey ? 0.1 : 1;
    const deltaPixels = ((pointer[0] - ui.gizmoDrag.pointer[0]) * ui.gizmoDrag.screen[0] + (pointer[1] - ui.gizmoDrag.pointer[1]) * ui.gizmoDrag.screen[1]) * precision;
    const snapping = e.ctrlKey || e.metaKey || ui.state.spatial_snap_mode === "grid";

    if (ui.gizmoDrag.type === "camera_target") {
      const target = add(ui.gizmoDrag.target, mul(ui.gizmoDrag.axis, (deltaPixels * ui.gizmoDrag.worldLength) / ui.gizmoDrag.screenLength));
      ui.camera.target = spatiallySnap(ui, target, pointer);
      ui.commitCameraEdit();
      ui.refreshInspector();
      ui.render();
      return;
    }

    if (ui.gizmoDrag.type === "camera") {
      if (ui.state.gizmo_mode === "translate") {
        const position = add(ui.gizmoDrag.position, mul(ui.gizmoDrag.axis, (deltaPixels * ui.gizmoDrag.worldLength) / ui.gizmoDrag.screenLength));
        ui.camera.position = spatiallySnap(ui, position, pointer);
      } else {
        const angle = snapping ? snapValue(deltaPixels * 0.015, Math.PI / 12) : deltaPixels * 0.015;
        const rel = sub(ui.gizmoDrag.target, ui.gizmoDrag.position);
        const rotated = rotateEuler(rel, mul(ui.gizmoDrag.axis, angle * (180 / Math.PI)));
        ui.camera.target = add(ui.gizmoDrag.position, rotated);
      }
      ui.commitCameraEdit();
      ui.refreshInspector();
      ui.render();
      return;
    }

    if (ui.state.gizmo_mode === "translate") {
      if (ui.gizmoDrag.free) {
        const dx = (pointer[0] - ui.gizmoDrag.pointer[0]) * precision;
        const dy = (pointer[1] - ui.gizmoDrag.pointer[1]) * precision;
        const position = add(
          ui.gizmoDrag.position,
          add(mul(ui.gizmoDrag.viewRight, dx * ui.gizmoDrag.freeScale), mul(ui.gizmoDrag.viewUp, -dy * ui.gizmoDrag.freeScale)),
        );
        ui.gizmoDrag.object.position = spatiallySnap(ui, position, pointer, [ui.gizmoDrag.object.id]);
      } else {
        const position = add(ui.gizmoDrag.position, mul(ui.gizmoDrag.axis, (deltaPixels * ui.gizmoDrag.worldLength) / ui.gizmoDrag.screenLength));
        ui.gizmoDrag.object.position = spatiallySnap(ui, position, pointer, [ui.gizmoDrag.object.id]);
      }
    } else if (ui.state.gizmo_mode === "scale") {
      const size = [...ui.gizmoDrag.size];
      const value = size[ui.gizmoDrag.axisIndex] + (deltaPixels * ui.gizmoDrag.worldLength) / ui.gizmoDrag.screenLength;
      size[ui.gizmoDrag.axisIndex] = Math.max(0.01, snapping ? snapValue(value, 0.1) : value);
      ui.gizmoDrag.object.size = size;
    } else {
      const rotation = [...ui.gizmoDrag.rotation];
      const value = rotation[ui.gizmoDrag.axisIndex] + deltaPixels * 0.75;
      rotation[ui.gizmoDrag.axisIndex] = snapping ? snapValue(value, 15) : value;
      ui.gizmoDrag.object.rotation = rotation;
    }
    const group = ui.gizmoDrag.group || [];
    const activeBase = group.find((item) => item.object === ui.gizmoDrag.object)?.transform;
    if (group.length > 1 && activeBase) {
      if (ui.state.gizmo_mode === "translate") {
        const delta = sub(ui.gizmoDrag.object.position, activeBase.position);
        for (const item of group) item.object.position = add(item.transform.position, delta);
      } else if (ui.state.gizmo_mode === "rotate") {
        const deltaRotation = sub(ui.gizmoDrag.object.rotation, activeBase.rotation);
        for (const item of group) {
          item.object.position = add(ui.gizmoDrag.groupPivot, rotateEuler(sub(item.transform.position, ui.gizmoDrag.groupPivot), deltaRotation));
          item.object.rotation = add(item.transform.rotation, deltaRotation);
        }
      } else {
        const factors = ui.gizmoDrag.object.size.map((value, index) => value / Math.max(0.01, activeBase.size[index]));
        for (const item of group) {
          const relative = sub(item.transform.position, ui.gizmoDrag.groupPivot);
          item.object.position = add(ui.gizmoDrag.groupPivot, relative.map((value, index) => value * factors[index]));
          item.object.size = item.transform.size.map((value, index) => Math.max(0.01, value * factors[index]));
        }
      }
    }
    for (const item of group.length ? group : [{ object: ui.gizmoDrag.object }]) ui.commitObjectEdit(item.object);
    ui.refreshInspector();
    ui.render();
    return;
  }
  if (ui.objectDrag) {
    checkpointDrag(ui, ui.objectDrag, "Move object");
    const dx = e.clientX - ui.objectDrag.x;
    const dy = e.clientY - ui.objectDrag.y;
    const { right, up } = cameraBasis(ui.objectDrag.camera);
    const scale = worldPerPixel(ui.objectDrag.camera, ui.canvas.height) * (e.shiftKey ? 0.1 : 1);
    const position = add(ui.objectDrag.position, add(mul(right, dx * scale), mul(up, -dy * scale)));
    ui.objectDrag.object.position = spatiallySnap(ui, position, null, [ui.objectDrag.object.id]);
    ui.commitObjectEdit(ui.objectDrag.object);
    ui.refreshInspector();
    ui.render();
    return;
  }
  if (!ui.drag) {
    const rect = ui.interactionElement.getBoundingClientRect();
    const hovered = pickGizmo(ui, [
      ((e.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width),
      ((e.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height),
    ]);
    const nextHover = hovered ? (hovered.free ? "free" : hovered.index) : null;
    if (nextHover !== ui.hoveredGizmoHandle) {
      ui.hoveredGizmoHandle = nextHover;
      if (ui.interactionElement.style) ui.interactionElement.style.cursor = hovered ? "grab" : "default";
      ui.render();
    }
    return;
  }
  checkpointDrag(ui, ui.drag, ui.drag.editorView ? "Navigate viewport" : "Move camera");
  const dx = e.clientX - ui.drag.x;
  const dy = e.clientY - ui.drag.y;
  const base = ui.drag.camera;

  if (ui.drag.dolly) {
    const factor = Math.exp(dy * 5e-3);
    const offset = sub(base.position, base.target);
    ui.drag.target.position = add(base.target, mul(offset, factor));
    if (ui.drag.target.camera_type === "orthographic") {
      ui.drag.target.zoom = Math.max(0.01, (base.zoom || 1) / factor);
    }
  } else if (ui.drag.fly) {
    const offset = sub(base.target, base.position);
    const r = length(offset);
    let yaw = Math.atan2(offset[0], offset[2]);
    let pitch = Math.asin(clamp(offset[1] / r, -0.999, 0.999));
    yaw -= dx * 8e-3;
    pitch = clamp(pitch - dy * 8e-3, -1.45, 1.45);
    ui.drag.target.target = [
      base.position[0] + r * Math.sin(yaw) * Math.cos(pitch),
      base.position[1] + r * Math.sin(pitch),
      base.position[2] + r * Math.cos(yaw) * Math.cos(pitch),
    ];
  } else if (ui.drag.shift) {
    const { right, up } = cameraBasis(base);
    const scale = worldPerPixel(base, ui.canvas.height);
    const delta = add(mul(right, -dx * scale), mul(up, dy * scale));
    ui.drag.target.position = add(base.position, delta);
    ui.drag.target.target = add(base.target, delta);
  } else {
    const offset = sub(base.position, base.target);
    const r = length(offset);
    let yaw = Math.atan2(offset[0], offset[2]);
    let pitch = Math.asin(clamp(offset[1] / r, -0.999, 0.999));
    yaw -= dx * 8e-3;
    pitch = clamp(pitch + dy * 8e-3, -1.45, 1.45);
    ui.drag.target.position = [
      base.target[0] + r * Math.sin(yaw) * Math.cos(pitch),
      base.target[1] + r * Math.sin(pitch),
      base.target[2] + r * Math.cos(yaw) * Math.cos(pitch),
    ];
  }
  if (ui.drag.editorView) {
    ui.serialize();
    ui.render();
  } else ui.commitCameraEdit();
}

export function cancelViewportInteraction(ui) {
  if (!ui.drag && !ui.gizmoDrag && !ui.objectDrag && !ui.targetFreeDrag) return false;
  ui.undo();
  if (ui.activePointerId !== null && ui.interactionElement.hasPointerCapture?.(ui.activePointerId)) {
    ui.interactionElement.releasePointerCapture(ui.activePointerId);
  }
  ui.activePointerId = null; ui.drag = null; ui.objectDrag = null; ui.gizmoDrag = null; ui.targetFreeDrag = null;
  ui.pointerHit = false; ui.canvas.classList.remove("dragging");
  if (ui.interactionElement.style) ui.interactionElement.style.cursor = "default";
  ui.finishCameraEdit(); ui.refreshInspector(); ui.render(); ui.setStatus(t("Interaction cancelled"));
  return true;
}

export function onPointerUp(ui, event) {
  if (ui.pathDrag) {
    ui.pathDrag = null;
    if (ui.interactionElement.style) ui.interactionElement.style.cursor = "";
    ui.interactionElement.releasePointerCapture?.(event.pointerId);
    ui.activePointerId = null;
    ui.canvas.classList.remove("dragging");
    ui.scheduleSerialize();
    ui.refreshKeys();
    ui.setStatus(t("Path key moved"));
    return;
  }
  if (ui.boxSelection) {
    const selection = ui.boxSelection;
    const camera = viewportCamera(ui);
    const minX = Math.min(selection.start[0], selection.current[0]), maxX = Math.max(selection.start[0], selection.current[0]);
    const minY = Math.min(selection.start[1], selection.current[1]), maxY = Math.max(selection.start[1], selection.current[1]);
    const ids = selection.additive ? new Set(selection.initial) : new Set();
    for (const object of ui.state.objects) {
      if (object.enabled === false) continue;
      const transform = object.keyframes?.length ? sampleObjectTransform(object, ui.frame) : object;
      const point = project(transform.position || [0, 0, 0], camera, ui.canvas.width, ui.canvas.height);
      if (point && point[0] >= minX && point[0] <= maxX && point[1] >= minY && point[1] <= maxY) ids.add(object.id);
    }
    ui.selectedObjectIds = ids; ui.selectedObjectId = [...ids].at(-1) || null;
    ui.selectedEntity = ids.size ? "object" : "camera"; ui.boxSelection = null;
    ui.interactionElement.style && (ui.interactionElement.style.cursor = "default");
    ui.refreshObjects(); ui.refreshInspector(); ui.render(); ui.setStatus(t(`${ids.size} object(s) selected`));
    return;
  }
  const finishedKeyDrag = ui.keyDrag;
  const finishedCameraDrag = Boolean((ui.drag && !ui.drag.editorView) || ui.targetFreeDrag);
  const finishedObjectEdit = Boolean(ui.gizmoDrag || ui.objectDrag);

  // Deselect when user clicked in an empty area without dragging
  if (!ui.pointerHit && !ui.gizmoDrag && !ui.objectDrag && !ui.targetFreeDrag && ui.drag && event) {
    const moved = Math.hypot(event.clientX - ui.drag.x, event.clientY - ui.drag.y);
    if (moved < 5 && (event.button === 0 || event.button === undefined)) {
      if (ui.selectedEntity === "object" || ui.selectedObjectId !== null || ui.selectedEntity === "camera_target") {
        ui.selectedEntity = "camera";
        ui.selectedObjectId = null;
        ui.selectedObjectIds = new Set();
        ui.selectedKeyFrame = null;
        ui.subSelection = null;
        ui.refreshObjects();
        ui.refreshKeys();
        ui.refreshInspector();
        ui.render();
        ui.setStatus(t("Deselected"));
      }
    }
  }

  if (event?.pointerId === ui.activePointerId && ui.interactionElement.hasPointerCapture?.(event.pointerId)) ui.interactionElement.releasePointerCapture(event.pointerId);
  ui.activePointerId = null;
  ui.drag = null;
  ui.objectDrag = null;
  ui.gizmoDrag = null;
  ui.targetFreeDrag = null;
  ui.keyDrag = null;
  ui.pointerHit = false;
  ui.canvas.classList.remove("dragging");
  if (ui.interactionElement.style) ui.interactionElement.style.cursor = "default";
  if (finishedKeyDrag) {
    finishedKeyDrag.badge?.remove();
    ui.editingKeyFrame = null;
    ui.updateKeyVisualState();
    ui.root.focus({ preventScroll: true });
  }
  if (finishedCameraDrag) ui.finishCameraEdit();
  if (finishedObjectEdit) {
    ui.editingKeyFrame = null;
    ui.updateKeyVisualState();
    ui.drawCurveEditor();
  }
}

export function onWheel(ui, e) {
  if (e.target.closest?.(".viewport-inspector, .scene-tree, .menu-panel, .context-menu, .viewport-quick-bar")) {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  ui.closeMenus();
  if (ui.isNavigatingFly) {
    ui.cameraSpeed = clamp(ui.cameraSpeed * Math.exp(-e.deltaY * 1e-3), 0.05, 20);
    ui.setStatus(t(`Fly speed: ${ui.cameraSpeed.toFixed(2)}x`));
    return;
  }
  checkpointWheelGesture(ui);
  const editorView = ui.state.view_mode !== "camera";
  const camera = viewportCamera(ui);
  if (!editorView) ui.beginCameraEdit();
  const delta = clamp(e.deltaY * 1e-3, -0.4, 0.4);
  const offset = sub(camera.position, camera.target);
  camera.position = add(camera.target, mul(offset, Math.exp(delta)));
  if (camera.camera_type === "orthographic") camera.zoom = Math.max(0.01, (camera.zoom || 1) * Math.exp(-delta));
  if (editorView) {
    ui.serialize();
    ui.render();
  } else {
    ui.commitCameraEdit();
    ui.finishCameraEdit();
  }
}
