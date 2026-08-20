import "./omnicam-core.js";
import "./omnicam-ui.js";
import "./omnicam-i18n.js";
import { onCurveWheel as S } from "./omnicam-curve-editor.js";
import { onTimelineWheel as L } from "./omnicam-timeline-interaction.js";
import { t as b } from "./omnicam-i18n.js";
import { clamp as p } from "./omnicam-core.js";
import { applyCinemaLens as h } from "./omnicam-cameras.js";
import { applyBlockingScenePreset as k } from "./omnicam-motion-presets.js";
function A(e, c, r) {
  for (const o of ["object-x", "object-y", "object-z", "object-px", "object-py", "object-pz", "object-rx", "object-ry", "object-rz", "object-sx", "object-sy", "object-sz"])
    for (const d of e.root.querySelectorAll(`[data-role="${o}"]`))
      d.addEventListener("input", () => e.updateSelectedObject(), { signal: r }), d.addEventListener("change", () => e.updateSelectedObject(), { signal: r });
  for (const o of ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-near", "camera-far"])
    for (const d of e.root.querySelectorAll(`[data-role="${o}"]`))
      d.addEventListener("input", () => e.updateCameraFromHud(), { signal: r }), d.addEventListener("change", () => e.updateCameraFromHud(), { signal: r });
  c('[data-role="animation-select"]')?.addEventListener("change", (o) => e.selectObjectAnimation(Number(o.target.value)), { signal: r }), c('[data-role="object-parent"]')?.addEventListener("change", (o) => e.setObjectParent(o.target.value || null), { signal: r }), c('[data-role="duration-seconds"]')?.addEventListener("change", (o) => {
    e.durationWidget && (e.durationWidget.value = Number(o.target.value)), e.syncFromWidgets();
  }, { signal: r }), c('[data-role="timeline-fps"]')?.addEventListener("change", (o) => {
    e.fpsWidget && (e.fpsWidget.value = Number(o.target.value)), e.syncFromWidgets();
  }, { signal: r }), c('[data-role="curve-group"]')?.addEventListener("change", () => e.drawCurveEditor(), { signal: r }), c('[data-act="curve-handles"]')?.addEventListener("click", () => e.toggleCurveHandles(), { signal: r });
  for (const o of e.root.querySelectorAll("[data-curve-mode]"))
    o.addEventListener("click", () => e.setCurveInterpolation(o.dataset.curveMode), { signal: r });
  for (const o of e.root.querySelectorAll("[data-tangent-mode]"))
    o.addEventListener("click", () => e.setTangentMode(o.dataset.tangentMode), { signal: r });
  for (const o of e.root.querySelectorAll("[data-channel-filter]"))
    o.addEventListener("click", () => e.setChannelFilter(o.dataset.channelFilter), { signal: r });
  const t = c('[data-role="curve-canvas"]');
  t && (t.addEventListener("pointerdown", (o) => e.onCurvePointerDown(o), { signal: r }), t.addEventListener("pointermove", (o) => e.onCurvePointerMove(o), { signal: r }), t.addEventListener("pointerup", (o) => e.onCurvePointerUp(o), { signal: r }), t.addEventListener("pointercancel", (o) => e.onCurvePointerUp(o), { signal: r }), t.addEventListener("wheel", (o) => S(e, o), { passive: !1, signal: r })), c('[data-act="curve-zoom-in"]')?.addEventListener("click", () => e.zoomCurve(1.25), { signal: r }), c('[data-act="curve-zoom-out"]')?.addEventListener("click", () => e.zoomCurve(0.8), { signal: r }), c('[data-act="curve-fit"]')?.addEventListener("click", () => e.resetCurveZoom(), { signal: r }), c('[data-role="key-frame"]')?.addEventListener("change", (o) => e.retimeSelectedKey(Number(o.target.value)), { signal: r });
  for (const o of ["key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"])
    c(`[data-role="${o}"]`)?.addEventListener("change", () => e.updateSelectedKey(), { signal: r });
  for (const o of e.root.querySelectorAll('[data-role="ui-density"]'))
    o.addEventListener("change", (d) => e.setDensity(d.target.value), { signal: r });
  for (const o of e.root.querySelectorAll('[data-role="preview-layout"]'))
    o.addEventListener("change", (d) => {
      e.state.preview_layout = d.target.value, e.scheduleSerialize(), e.refreshCameraPreviews(), e.renderCameraView(), e.setStatus(`Preview layout: ${d.target.value}`);
    }, { signal: r });
  for (const o of e.root.querySelectorAll('[data-act="aim-at-object"]'))
    o.addEventListener("click", () => {
      e.aimAtSelectedObject(), e.closeMenus();
    }, { signal: r });
  for (const o of e.root.querySelectorAll('[data-act="bake-aim-keys"]'))
    o.addEventListener("click", () => {
      e.bakeAimToKeyframes(), e.closeMenus();
    }, { signal: r });
  for (const o of e.root.querySelectorAll('[data-role="camera-target-object"]'))
    o.addEventListener("change", (d) => {
      e.setCameraTrackingTarget(d.target.value);
    }, { signal: r });
  for (const o of e.root.querySelectorAll('[data-act="focus-target"]'))
    o.addEventListener("click", () => {
      e.focusCameraTarget(), e.closeMenus();
    }, { signal: r });
  for (const o of e.root.querySelectorAll('[data-role="gizmo-space"]'))
    o.addEventListener("change", (d) => {
      e.state.gizmo_space = d.target.value;
      for (const v of e.root.querySelectorAll('[data-role="gizmo-space"]')) v.value = d.target.value;
      e.scheduleSerialize(), e.render();
    }, { signal: r });
  for (const o of e.root.querySelectorAll('[data-role="view-mode"]'))
    o.addEventListener("change", (d) => e.setViewMode(d.target.value), { signal: r });
  for (const o of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    o.addEventListener("click", () => e.toggleInspector(), { signal: r });
  for (const o of e.root.querySelectorAll('[data-act="clear-selection"]'))
    o.addEventListener("click", () => {
      e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render();
    }, { signal: r });
  for (const o of e.root.querySelectorAll('[data-role="timeline-summary"]'))
    o.addEventListener("click", () => {
      e.selectedEntity === "object" && (e.selectedEntity = "camera", e.selectedObjectId = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(b(`Editing: ${e.activeCameraTrack().name}`)));
    }, { signal: r });
  for (const o of e.root.querySelectorAll(".toolbar-menu"))
    o.addEventListener("toggle", () => {
      o.open && e.closeMenus(o);
    }, { signal: r });
  const a = (o, d) => {
    const v = o instanceof HTMLElement ? o.closest(".scene-item") : null;
    if (!(!v || d.button === 2 || o.closest(".scene-action-btn")))
      if (v.dataset.objectId) {
        const y = e.state.objects.find((m) => m.id === v.dataset.objectId);
        if (!y) return;
        e.finishCameraEdit(), e.selectedEntity = "object", e.selectedObjectId = y.id, e.selectedKeyFrame = y.keyframes?.find((m) => m.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null;
        for (const m of e.root.querySelectorAll(".scene-item")) {
          const E = m.dataset.objectId === y.id;
          m.classList.toggle("selected", E), m.setAttribute("aria-selected", String(E));
        }
        e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(b(`Selected: ${y.name || y.type}`));
      } else v.dataset.cameraId && e.activateCamera(v.dataset.cameraId);
  };
  e.root.addEventListener("pointerdown", (o) => {
    a(o.composedPath?.()[0] || o.target, o);
  }, { capture: !0, signal: r }), e.root.addEventListener("pointerdown", (o) => {
    const d = o.composedPath?.()[0] || o.target;
    d instanceof HTMLElement && d.closest(".context-menu, [data-role='context-menu']") || (o.stopPropagation(), d instanceof HTMLElement && !d.closest(".toolbar-menu") && e.closeMenus(), d instanceof HTMLElement && !d.closest(".key,.key-editor,canvas") && e.exitKeyEdit(!0), (!(d instanceof HTMLElement) || !d.closest("input,select,textarea,button,[contenteditable=true]")) && e.root.focus({ preventScroll: !0 }));
  }, { signal: r }), document.addEventListener("pointerdown", (o) => {
    const d = o.composedPath?.()[0] || o.target;
    d instanceof HTMLElement && d.closest(".context-menu, [data-role='context-menu']") || (!(d instanceof Node) || !e.root.contains(d)) && (e.closeMenus(), e.exitKeyEdit(!0));
  }, { capture: !0, signal: r }), e.root.addEventListener("mousedown", (o) => o.stopPropagation(), { signal: r }), e.root.addEventListener("contextmenu", (o) => e.onContextMenu(o), { signal: r }), e.interactionElement?.addEventListener("pointerdown", (o) => e.onPointerDown(o), { signal: r }), e.interactionElement?.addEventListener("pointermove", (o) => e.onPointerMove(o), { signal: r }), e.interactionElement?.addEventListener("pointerup", (o) => e.onPointerUp(o), { signal: r }), e.interactionElement?.addEventListener("pointercancel", (o) => e.onPointerUp(o), { signal: r }), e.interactionElement?.addEventListener("dblclick", (o) => e.setTargetAtCursor(o), { signal: r }), e.interactionElement?.addEventListener("wheel", (o) => e.onWheel(o), { passive: !1, signal: r }), window.addEventListener("pointermove", (o) => {
    e.keyDrag && e.onPointerMove(o);
  }, { capture: !0, signal: r }), window.addEventListener("pointerup", (o) => {
    e.keyDrag && e.onPointerUp(o);
  }, { capture: !0, signal: r });
  const n = c('[data-role="keys"]');
  n && (n.addEventListener("pointerdown", (o) => e.onTimelinePointerDown(o), { signal: r }), n.addEventListener("pointermove", (o) => e.onTimelinePointerMove(o), { signal: r }), n.addEventListener("pointerup", (o) => e.onTimelinePointerUp(o), { signal: r }), n.addEventListener("pointercancel", (o) => e.onTimelinePointerUp(o), { signal: r }), n.addEventListener("wheel", (o) => L(e, o), { passive: !1, signal: r })), e.root.addEventListener("keydown", (o) => e.onKey(o), { signal: r });
  const l = new ResizeObserver(() => {
    e.scheduleResizeAndRender();
  }), f = e.root.querySelector(".viewport-wrap");
  f && l.observe(f), e.resizeObserver = l, e.updateEditState();
}
function i(e, c, r) {
  for (const t of e.root.querySelectorAll('[data-act="play"]'))
    t.addEventListener("click", () => e.togglePlay(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="key"]'))
    t.addEventListener("click", () => e.insertKeyframe(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="auto-key"]'))
    t.addEventListener("click", () => e.toggleAutoKey(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="delete-key"]'))
    t.addEventListener("click", () => e.deleteKeyframe(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="copy-key"]'))
    t.addEventListener("click", () => e.copyKeyframe(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="paste-key"]'))
    t.addEventListener("click", () => e.pasteKeyframe(), { signal: r });
  c('[data-act="key-first"]')?.addEventListener("click", () => e.setFrame(0), { signal: r }), c('[data-act="key-last"]')?.addEventListener("click", () => e.setFrame(e.state.duration_frames - 1), { signal: r }), c('[data-act="previous-key"]')?.addEventListener("click", () => e.goToAdjacentKey(-1), { signal: r }), c('[data-act="next-key"]')?.addEventListener("click", () => e.goToAdjacentKey(1), { signal: r }), c('[data-act="previous-frame"]')?.addEventListener("click", () => e.setFrame(e.frame - 1), { signal: r }), c('[data-act="next-frame"]')?.addEventListener("click", () => e.setFrame(e.frame + 1), { signal: r }), c('[data-act="update-key"]')?.addEventListener("click", () => e.updateKeyFromView(), { signal: r }), c('[data-act="view-key"]')?.addEventListener("click", () => e.loadSelectedKeyView(), { signal: r });
  for (const t of e.root.querySelectorAll('select[data-role="encoder"]'))
    t.addEventListener("change", (a) => {
      e.state.encoder = a.target.value, e.serialize(), e.setStatus(`Encoder: ${a.target.value}`);
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="fit-timeline"]'))
    t.addEventListener("click", () => e.resetTimelineZoom(), { signal: r });
  for (const t of e.root.querySelectorAll("[data-interp]"))
    t.addEventListener("click", () => e.setKeyInterpolation(t.dataset.interp), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="reset-camera"]'))
    t.addEventListener("click", () => e.resetCamera(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="loop"]'))
    t.addEventListener("click", () => e.toggleLoop(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="range-start"]'))
    t.addEventListener("click", () => e.setPlaybackRange("start"), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="range-end"]'))
    t.addEventListener("click", () => e.setPlaybackRange("end"), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="range-clear"]'))
    t.addEventListener("click", () => e.clearPlaybackRange(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="toggle-timecode"]'))
    t.addEventListener("click", () => e.toggleTimecode(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="time"]'))
    t.addEventListener("click", () => e.toggleTimecode(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="toggle-snap"]'))
    t.addEventListener("click", () => e.toggleSnap(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="snap-frames"]'))
    t.addEventListener("change", (a) => {
      e.state.snap_frames = Math.max(1, Math.round(Number(a.target.value) || 1)), e.serialize(), e.setStatus(`Snap: ${e.state.snap_frames} frame${e.state.snap_frames === 1 ? "" : "s"}`);
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="add-camera"]'))
    t.addEventListener("click", () => {
      e.addCamera(), e.closeMenus();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="record"]'))
    t.addEventListener("click", () => e.makePlayblast(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="h3-setup"]'))
    t.addEventListener("click", () => e.createH3Setup(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="sync-inputs"]'))
    t.addEventListener("click", () => {
      e.syncUpstreamInputs(), e.closeMenus();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="load-card"]'))
    t.addEventListener("click", () => c('[data-role="file"]')?.click(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="add-card"]'))
    t.addEventListener("click", () => e.addMediaCard(), { signal: r });
  c('[data-role="file"]')?.addEventListener("change", (t) => e.loadCardFile(t.target.files?.[0]), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="load-model"]'))
    t.addEventListener("click", () => {
      e.closeMenus(), c('[data-role="model-file"]')?.click();
    }, { signal: r });
  c('[data-role="model-file"]')?.addEventListener("change", (t) => {
    e.loadModelFile(t.target.files?.[0]), t.target.value = "";
  }, { signal: r }), c('[data-act="load-audio"]')?.addEventListener("click", () => {
    e.closeMenus(), c('[data-role="audio-file"]')?.click();
  }, { signal: r }), c('[data-role="audio-file"]')?.addEventListener("change", (t) => {
    e.loadAudioFile(t.target.files?.[0]), t.target.value = "";
  }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="clear-caches"]'))
    t.addEventListener("click", () => {
      e.clearCaches(), e.closeMenus();
    }, { signal: r });
  for (const t of e.root.querySelectorAll("[data-object-type]"))
    t.addEventListener("click", () => {
      e.addPrimitive(t.dataset.objectType), e.closeMenus();
    }, { signal: r });
  for (const t of e.root.querySelectorAll("[data-preset]"))
    t.addEventListener("click", () => {
      e.applyCameraPreset(t.dataset.preset), e.closeMenus();
    }, { signal: r });
  for (const t of e.root.querySelectorAll("[data-shake]"))
    t.addEventListener("click", () => {
      e.applyCameraShake(t.dataset.shake), e.closeMenus();
    }, { signal: r });
}
function g(e, c, r) {
  for (const t of e.root.querySelectorAll('[data-role="mode"]'))
    t.addEventListener("change", (a) => {
      e.state.render_mode = a.target.value, e.modeWidget && (e.modeWidget.value = a.target.value);
      for (const n of e.root.querySelectorAll('[data-role="mode"]')) n.value = a.target.value;
      e.serialize(), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="frame"]'))
    t.addEventListener("change", (a) => e.setFrame(Number(a.target.value)), { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="scrub"]'))
    t.addEventListener("input", (a) => e.setFrame(Number(a.target.value)), { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="fov"], [data-role="camera-fov"]')) {
    const a = (n) => {
      const l = p(Number(n.target.value), 5, 150);
      e.activeCameraTrack().keyframes.length && e.activeKeyframe() ? (e.activeKeyframe().camera.fov = l, e.scheduleSerialize(), e.render(), e.refreshKeyEditor()) : (e.camera.fov = l, e.render());
      for (const f of e.root.querySelectorAll('[data-role="fov"], [data-role="camera-fov"]')) f.value = String(l);
    };
    t.addEventListener("input", a, { signal: r }), t.addEventListener("change", a, { signal: r });
  }
  for (const t of e.root.querySelectorAll('[data-role="camera-roll"]')) {
    const a = (n) => {
      const l = p(Number(n.target.value), -180, 180);
      e.activeCameraTrack().keyframes.length && e.activeKeyframe() ? (e.activeKeyframe().camera.roll = l, e.scheduleSerialize(), e.render(), e.refreshKeyEditor()) : (e.camera.roll = l, e.render());
      for (const f of e.root.querySelectorAll('[data-role="camera-roll"]')) f.value = String(l);
    };
    t.addEventListener("input", a, { signal: r }), t.addEventListener("change", a, { signal: r });
  }
  for (const t of e.root.querySelectorAll("[data-view]"))
    t.addEventListener("click", () => e.setViewMode(t.dataset.view), { signal: r });
  for (const t of e.root.querySelectorAll("[data-select-mode]"))
    t.addEventListener("click", () => e.setSelectMode(t.dataset.selectMode), { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="select-mode"]'))
    t.addEventListener("change", (a) => e.setSelectMode(a.target.value), { signal: r });
  for (const t of e.root.querySelectorAll("[data-transform-mode]"))
    t.addEventListener("click", () => e.setTransformMode(t.dataset.transformMode), { signal: r });
  c('[data-act="frame-target"]')?.addEventListener("click", () => e.frameTarget(), { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    t.addEventListener("click", () => e.toggleCameraView(), { signal: r });
  for (const t of e.root.querySelectorAll(".inspector-tab, [data-tab]"))
    t.addEventListener("click", () => {
      const a = t.dataset.tab;
      for (const n of e.root.querySelectorAll(".inspector-tab, [data-tab]")) n.classList.toggle("active", n === t);
      for (const n of e.root.querySelectorAll(".inspector-tab-content, [data-tab-panel]"))
        n.hidden = n.dataset.tabPanel !== a;
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="active-camera-select"]'))
    t.addEventListener("change", (a) => e.activateCamera(a.target.value), { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="camera-color"]'))
    t.addEventListener("input", (a) => {
      const n = e.activeCameraTrack();
      n && (n.color = a.target.value, e.scheduleSerialize(), e.render());
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="playblast-camera"]'))
    t.addEventListener("change", (a) => e.setPlayblastCamera(a.target.value), { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="camera-type"]'))
    t.addEventListener("change", (a) => {
      e.camera.camera_type = a.target.value, s(e.root, "camera-type", a.target), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="speed"]')) {
    const a = (n) => {
      const l = p(Number(n.target.value), 0.05, 5);
      if (Number.isFinite(l)) {
        e.cameraSpeed = l;
        for (const f of e.root.querySelectorAll('[data-role="speed"]'))
          f !== n.target && (f.value = String(l));
      }
    };
    t.addEventListener("input", a, { signal: r }), t.addEventListener("change", a, { signal: r });
  }
  for (const t of e.root.querySelectorAll('[data-role="interp"]'))
    t.addEventListener("change", (a) => {
      e.activeKeyframe() && (e.activeKeyframe().interpolation = a.target.value, e.scheduleSerialize(), e.render());
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="point-density"]'))
    t.addEventListener("change", (a) => {
      e.state.point_density = a.target.value, e.scheduleSerialize(), e.render(), e.setStatus(`Point density: ${a.target.value}`);
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="point-color"]'))
    t.addEventListener("input", (a) => {
      e.state.point_color = a.target.value, e.scheduleSerialize(), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="point-spread"]'))
    t.addEventListener("change", (a) => {
      e.state.point_spread = a.target.value, e.scheduleSerialize(), e.render(), e.setStatus(`Point spread: ${a.target.value}`);
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="card-fit"]'))
    t.addEventListener("change", (a) => {
      e.state.card_fit = a.target.value, e.scheduleSerialize(), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="speed-heatmap"]'))
    t.addEventListener("change", (a) => {
      e.state.speed_heatmap = a.target.checked, s(e.root, "speed-heatmap", a.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="playblast-grid"]'))
    t.addEventListener("change", (a) => {
      e.state.playblast_grid = a.target.checked, s(e.root, "playblast-grid", a.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="show-wireframe"]'))
    t.addEventListener("change", (a) => {
      e.state.show_wireframe = a.target.checked, s(e.root, "show-wireframe", a.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="show-vertices"]'))
    t.addEventListener("change", (a) => {
      e.state.show_vertices = a.target.checked, s(e.root, "show-vertices", a.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="burn-in"]'))
    t.addEventListener("change", (a) => {
      e.state.burn_in = a.target.checked, s(e.root, "burn-in", a.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="guides"]'))
    t.addEventListener("change", (a) => {
      e.state.guides = a.target.checked, s(e.root, "guides", a.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="safe-areas"]'))
    t.addEventListener("change", (a) => {
      e.state.safe_areas = a.target.checked, s(e.root, "safe-areas", a.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="resolution-gate"]'))
    t.addEventListener("change", (a) => {
      e.state.resolution_gate = a.target.checked, s(e.root, "resolution-gate", a.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="aspect-ratio"]'))
    t.addEventListener("change", (a) => {
      e.state.aspect_ratio = a.target.value, s(e.root, "aspect-ratio", a.target), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) {
    const a = (n) => {
      e.state.viewport_bg_color = n.target.value, s(e.root, "viewport-bg-color", n.target), e.scheduleSerialize(), e.render();
    };
    t.addEventListener("input", a, { signal: r }), t.addEventListener("change", a, { signal: r });
  }
  for (const t of e.root.querySelectorAll('[data-act="upload-viewport-bg"]'))
    t.addEventListener("click", () => {
      e.closeMenus(), c('[data-role="viewport-bg-file"]')?.click();
    }, { signal: r });
  c('[data-role="viewport-bg-file"]')?.addEventListener("change", (t) => {
    e.loadViewportBgFile(t.target.files?.[0]), t.target.value = "";
  }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="upload-viewport-bg-seq"]'))
    t.addEventListener("click", () => {
      e.closeMenus(), c('[data-role="viewport-bg-seq-file"]')?.click();
    }, { signal: r });
  c('[data-role="viewport-bg-seq-file"]')?.addEventListener("change", (t) => {
    e.loadViewportBgSequence(Array.from(t.target.files || [])), t.target.value = "";
  }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-act="clear-viewport-bg"]'))
    t.addEventListener("click", () => {
      e.clearViewportBgImage(), e.closeMenus();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="object-material"]'))
    t.addEventListener("change", (a) => {
      const n = e.selectedObject();
      n && (n.material_mode = a.target.value, e.serialize(), e.render());
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="object-color"]'))
    t.addEventListener("input", (a) => {
      const n = e.selectedObject();
      n && (n.color = a.target.value, e.scheduleSerialize(), e.render());
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="reference-select"]'))
    t.addEventListener("change", (a) => {
      e.state.reference_index = Number(a.target.value), e.serialize(), e.loadSelectedReference();
    }, { signal: r });
  for (const t of e.root.querySelectorAll("[data-proxy-preset]"))
    t.addEventListener("click", () => {
      e.applyProxyPreset(t.dataset.proxyPreset), e.closeMenus();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('select[data-role="proxy-preset"]'))
    t.addEventListener("change", (a) => {
      e.applyProxyPreset(a.target.value);
    }, { signal: r });
  for (const t of e.root.querySelectorAll("[data-lens]"))
    t.addEventListener("click", () => {
      h(e, Number(t.dataset.lens));
    }, { signal: r });
  for (const t of e.root.querySelectorAll("[data-blocking-scene]"))
    t.addEventListener("click", () => {
      k(e, t.dataset.blockingScene), e.closeMenus();
    }, { signal: r });
  for (const t of e.root.querySelectorAll('[data-role="show-radar"]'))
    t.addEventListener("change", (a) => {
      e.state.show_radar = a.target.checked, e.scheduleSerialize(), e.render(), e.setStatus(`Radar Mini-Map: ${a.target.checked ? "ON" : "OFF"}`);
    }, { signal: r });
}
function s(e, c, r, t = "value") {
  for (const a of e.querySelectorAll(`[data-role="${c}"]`))
    a !== r && (a[t] = r[t]);
}
function T(e) {
  e.abortController = new AbortController();
  const c = e.abortController.signal, r = (t) => e.root.querySelector(t);
  i(e, r, c), g(e, r, c), A(e, r, c);
}
export {
  T as bind,
  s as syncMirroredControl
};
