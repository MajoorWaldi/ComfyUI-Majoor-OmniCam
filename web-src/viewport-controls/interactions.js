// Pointer, drag and wheel interaction handlers.

import { add, cameraBasis, clamp, cloneCamera, cross, defaultEditorViews, length, mul, norm, rotateEuler, sampleCamera, sampleObjectTransform, sub, project } from "../director/core.js";
import { onKeyDragMove } from "../timeline.js";
import { activeGizmoEntity, gizmoAxes, gizmoGeometry, pickGizmo, pickSceneObject, viewportCamera } from "../viewport-controls.js";
import { t } from "../i18n.js";

export function onPointerDown(ui, e) {
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
  // Plain left-drag is always viewport navigation, including over the selected
  // object. Requiring Ctrl/Cmd for a gizmo drag removes the ambiguous capture
  // that otherwise makes the camera appear locked after object selection.
  const canEditGizmo = canPick && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey;
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
    };

    if (picked.entity.type === "camera_target") {
      ui.beginCameraEdit();
      ui.gizmoDrag = {
        ...baseDrag,
        type: "camera_target",
        target: [...(picked.entity.position || ui.camera.target)],
      };
      return;
    }
    if (picked.entity.type === "camera") {
      ui.beginCameraEdit();
      ui.gizmoDrag = {
        ...baseDrag,
        type: "camera",
        position: [...(picked.entity.position || ui.camera.position)],
        target: [...ui.camera.target],
      };
      return;
    }
    if (picked.entity.type === "object") {
      const selected = picked.entity.object;
      ui.beginObjectEdit(selected);
      ui.gizmoDrag = {
        ...baseDrag,
        type: "object",
        object: selected,
        position: [...picked.entity.position],
        rotation: [...picked.entity.rotation],
        size: [...picked.entity.size],
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
      ui.editingKeyFrame = null;
      ui.activateCamera(hit.camera.id);
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
      ui.selectedObjectId = hit.object.id;
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

  // Standard 3D Software Viewport Navigation:
  // - Middle Click (or Alt+Middle, or Shift+Left/Middle): Pan
  // - Right Click (or Alt+Right): Dolly / Zoom
  // - Left Click (or Alt+Left): Orbit
  // - Fly Navigation: First-person gaze look
  const isPan = e.button === 1 || (e.altKey && e.button === 1) || (e.shiftKey && (e.button === 0 || e.button === 1)) || viewCamera.camera_type === "orthographic";
  const isDolly = (e.altKey && e.button === 2) || (e.button === 2 && !ui.isNavigatingFly);
  const isFly = Boolean(ui.isNavigatingFly);

  if (!editorView) ui.beginCameraEdit();
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
  };
}

export function onPointerMove(ui, e) {
  if (ui.keyDrag) {
    onKeyDragMove(ui, e);
    return;
  }

  if (ui.targetFreeDrag) {
    const rect = ui.interactionElement.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width);
    const currentY = ((e.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height);
    const dx = currentX - ui.targetFreeDrag.pointer[0];
    const dy = currentY - ui.targetFreeDrag.pointer[1];
    const delta = add(mul(ui.targetFreeDrag.right, dx * ui.targetFreeDrag.scale), mul(ui.targetFreeDrag.up, -dy * ui.targetFreeDrag.scale));
    ui.camera.target = add(ui.targetFreeDrag.target, delta);
    ui.commitCameraEdit();
    ui.refreshInspector();
    ui.render();
    return;
  }

  if (ui.gizmoDrag) {
    const rect = ui.interactionElement.getBoundingClientRect();
    const pointer = [
      ((e.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width),
      ((e.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height),
    ];
    const deltaPixels = (pointer[0] - ui.gizmoDrag.pointer[0]) * ui.gizmoDrag.screen[0] + (pointer[1] - ui.gizmoDrag.pointer[1]) * ui.gizmoDrag.screen[1];

    if (ui.gizmoDrag.type === "camera_target") {
      ui.camera.target = add(ui.gizmoDrag.target, mul(ui.gizmoDrag.axis, (deltaPixels * ui.gizmoDrag.worldLength) / ui.gizmoDrag.screenLength));
      ui.commitCameraEdit();
      ui.refreshInspector();
      ui.render();
      return;
    }

    if (ui.gizmoDrag.type === "camera") {
      if (ui.state.gizmo_mode === "translate") {
        ui.camera.position = add(ui.gizmoDrag.position, mul(ui.gizmoDrag.axis, (deltaPixels * ui.gizmoDrag.worldLength) / ui.gizmoDrag.screenLength));
      } else {
        const angle = deltaPixels * 0.015;
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
      ui.gizmoDrag.object.position = add(ui.gizmoDrag.position, mul(ui.gizmoDrag.axis, (deltaPixels * ui.gizmoDrag.worldLength) / ui.gizmoDrag.screenLength));
    } else if (ui.state.gizmo_mode === "scale") {
      const size = [...ui.gizmoDrag.size];
      size[ui.gizmoDrag.axisIndex] = Math.max(0.01, size[ui.gizmoDrag.axisIndex] + (deltaPixels * ui.gizmoDrag.worldLength) / ui.gizmoDrag.screenLength);
      ui.gizmoDrag.object.size = size;
    } else {
      const rotation = [...ui.gizmoDrag.rotation];
      rotation[ui.gizmoDrag.axisIndex] += deltaPixels * 0.75;
      ui.gizmoDrag.object.rotation = rotation;
    }
    ui.commitObjectEdit(ui.gizmoDrag.object);
    ui.refreshInspector();
    ui.render();
    return;
  }
  if (ui.objectDrag) {
    const dx = e.clientX - ui.objectDrag.x;
    const dy = e.clientY - ui.objectDrag.y;
    const { right, up } = cameraBasis(ui.objectDrag.camera);
    const scale = length(sub(ui.objectDrag.camera.position, ui.objectDrag.position)) * 25e-4;
    ui.objectDrag.object.position = add(ui.objectDrag.position, add(mul(right, dx * scale), mul(up, -dy * scale)));
    ui.commitObjectEdit(ui.objectDrag.object);
    ui.refreshInspector();
    ui.render();
    return;
  }
  if (!ui.drag) return;
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
    const scale = length(sub(base.position, base.target)) * 25e-4;
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

export function onPointerUp(ui, event) {
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
