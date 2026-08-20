import "./omnicam-core.js";
import "./omnicam-ui.js";
import "./omnicam-i18n.js";
import { onCurveWheel as p } from "./omnicam-curve-editor.js";
import { onTimelineWheel as E } from "./omnicam-timeline-interaction.js";
import { clamp as m } from "./omnicam-core.js";
import { applyCinemaLens as b } from "./omnicam-cameras.js";
import { applyBlockingScenePreset as S } from "./omnicam-motion-presets.js";
function L(e, n, o) {
  for (const a of ["object-x", "object-y", "object-z", "object-px", "object-py", "object-pz", "object-rx", "object-ry", "object-rz", "object-sx", "object-sy", "object-sz"])
    for (const d of e.root.querySelectorAll(`[data-role="${a}"]`))
      d.addEventListener("input", () => e.updateSelectedObject(), { signal: o }), d.addEventListener("change", () => e.updateSelectedObject(), { signal: o });
  for (const a of ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-near", "camera-far"])
    for (const d of e.root.querySelectorAll(`[data-role="${a}"]`))
      d.addEventListener("input", () => e.updateCameraFromHud(), { signal: o }), d.addEventListener("change", () => e.updateCameraFromHud(), { signal: o });
  n('[data-role="animation-select"]')?.addEventListener("change", (a) => e.selectObjectAnimation(Number(a.target.value)), { signal: o }), n('[data-role="object-parent"]')?.addEventListener("change", (a) => e.setObjectParent(a.target.value || null), { signal: o }), n('[data-role="duration-seconds"]')?.addEventListener("change", (a) => {
    e.durationWidget && (e.durationWidget.value = Number(a.target.value)), e.syncFromWidgets();
  }, { signal: o }), n('[data-role="timeline-fps"]')?.addEventListener("change", (a) => {
    e.fpsWidget && (e.fpsWidget.value = Number(a.target.value)), e.syncFromWidgets();
  }, { signal: o }), n('[data-role="curve-group"]')?.addEventListener("change", () => e.drawCurveEditor(), { signal: o }), n('[data-act="curve-handles"]')?.addEventListener("click", () => e.toggleCurveHandles(), { signal: o });
  for (const a of e.root.querySelectorAll("[data-curve-mode]"))
    a.addEventListener("click", () => e.setCurveInterpolation(a.dataset.curveMode), { signal: o });
  for (const a of e.root.querySelectorAll("[data-tangent-mode]"))
    a.addEventListener("click", () => e.setTangentMode(a.dataset.tangentMode), { signal: o });
  for (const a of e.root.querySelectorAll("[data-channel-filter]"))
    a.addEventListener("click", () => e.setChannelFilter(a.dataset.channelFilter), { signal: o });
  const r = n('[data-role="curve-canvas"]');
  r && (r.addEventListener("pointerdown", (a) => e.onCurvePointerDown(a), { signal: o }), r.addEventListener("pointermove", (a) => e.onCurvePointerMove(a), { signal: o }), r.addEventListener("pointerup", (a) => e.onCurvePointerUp(a), { signal: o }), r.addEventListener("pointercancel", (a) => e.onCurvePointerUp(a), { signal: o }), r.addEventListener("wheel", (a) => p(e, a), { passive: !1, signal: o })), n('[data-act="curve-zoom-in"]')?.addEventListener("click", () => e.zoomCurve(1.25), { signal: o }), n('[data-act="curve-zoom-out"]')?.addEventListener("click", () => e.zoomCurve(0.8), { signal: o }), n('[data-act="curve-fit"]')?.addEventListener("click", () => e.resetCurveZoom(), { signal: o }), n('[data-role="key-frame"]')?.addEventListener("change", (a) => e.retimeSelectedKey(Number(a.target.value)), { signal: o });
  for (const a of ["key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"])
    n(`[data-role="${a}"]`)?.addEventListener("change", () => e.updateSelectedKey(), { signal: o });
  for (const a of e.root.querySelectorAll('[data-role="ui-density"]'))
    a.addEventListener("change", (d) => e.setDensity(d.target.value), { signal: o });
  for (const a of e.root.querySelectorAll('[data-role="preview-layout"]'))
    a.addEventListener("change", (d) => {
      e.state.preview_layout = d.target.value, e.scheduleSerialize(), e.refreshCameraPreviews(), e.renderCameraView(), e.setStatus(`Preview layout: ${d.target.value}`);
    }, { signal: o });
  for (const a of e.root.querySelectorAll('[data-act="aim-at-object"]'))
    a.addEventListener("click", () => {
      e.aimAtSelectedObject(), e.closeMenus();
    }, { signal: o });
  for (const a of e.root.querySelectorAll('[data-act="bake-aim-keys"]'))
    a.addEventListener("click", () => {
      e.bakeAimToKeyframes(), e.closeMenus();
    }, { signal: o });
  for (const a of e.root.querySelectorAll('[data-role="camera-target-object"]'))
    a.addEventListener("change", (d) => {
      e.setCameraTrackingTarget(d.target.value);
    }, { signal: o });
  for (const a of e.root.querySelectorAll('[data-act="focus-target"]'))
    a.addEventListener("click", () => {
      e.focusCameraTarget(), e.closeMenus();
    }, { signal: o });
  for (const a of e.root.querySelectorAll('[data-role="gizmo-space"]'))
    a.addEventListener("change", (d) => {
      e.state.gizmo_space = d.target.value;
      for (const y of e.root.querySelectorAll('[data-role="gizmo-space"]')) y.value = d.target.value;
      e.scheduleSerialize(), e.render();
    }, { signal: o });
  for (const a of e.root.querySelectorAll('[data-role="view-mode"]'))
    a.addEventListener("change", (d) => e.setViewMode(d.target.value), { signal: o });
  for (const a of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    a.addEventListener("click", () => e.toggleInspector(), { signal: o });
  for (const a of e.root.querySelectorAll('[data-act="clear-selection"]'))
    a.addEventListener("click", () => {
      e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render();
    }, { signal: o });
  for (const a of e.root.querySelectorAll('[data-role="timeline-summary"]'))
    a.addEventListener("click", () => {
      e.selectedEntity === "object" && (e.selectedEntity = "camera", e.selectedObjectId = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(t(`Editing: ${e.activeCameraTrack().name}`)));
    }, { signal: o });
  for (const a of e.root.querySelectorAll(".toolbar-menu"))
    a.addEventListener("toggle", () => {
      a.open && e.closeMenus(a);
    }, { signal: o });
  e.root.addEventListener("pointerdown", (a) => {
    const d = a.composedPath?.()[0] || a.target;
    d instanceof HTMLElement && d.closest(".context-menu, [data-role='context-menu']") || (a.stopPropagation(), d instanceof HTMLElement && !d.closest(".toolbar-menu") && e.closeMenus(), d instanceof HTMLElement && !d.closest(".key,.key-editor,canvas") && e.exitKeyEdit(!0), (!(d instanceof HTMLElement) || !d.closest("input,select,textarea,button,[contenteditable=true]")) && e.root.focus({ preventScroll: !0 }));
  }, { signal: o }), document.addEventListener("pointerdown", (a) => {
    const d = a.composedPath?.()[0] || a.target;
    d instanceof HTMLElement && d.closest(".context-menu, [data-role='context-menu']") || (!(d instanceof Node) || !e.root.contains(d)) && (e.closeMenus(), e.exitKeyEdit(!0));
  }, { capture: !0, signal: o }), e.root.addEventListener("mousedown", (a) => a.stopPropagation(), { signal: o }), e.root.addEventListener("contextmenu", (a) => e.onContextMenu(a), { signal: o }), e.interactionElement?.addEventListener("pointerdown", (a) => e.onPointerDown(a), { signal: o }), e.interactionElement?.addEventListener("pointermove", (a) => e.onPointerMove(a), { signal: o }), e.interactionElement?.addEventListener("pointerup", (a) => e.onPointerUp(a), { signal: o }), e.interactionElement?.addEventListener("pointercancel", (a) => e.onPointerUp(a), { signal: o }), e.interactionElement?.addEventListener("dblclick", (a) => e.setTargetAtCursor(a), { signal: o }), e.interactionElement?.addEventListener("wheel", (a) => e.onWheel(a), { passive: !1, signal: o }), window.addEventListener("pointermove", (a) => {
    e.keyDrag && e.onPointerMove(a);
  }, { capture: !0, signal: o }), window.addEventListener("pointerup", (a) => {
    e.keyDrag && e.onPointerUp(a);
  }, { capture: !0, signal: o });
  const c = n('[data-role="keys"]');
  c && (c.addEventListener("pointerdown", (a) => e.onTimelinePointerDown(a), { signal: o }), c.addEventListener("pointermove", (a) => e.onTimelinePointerMove(a), { signal: o }), c.addEventListener("pointerup", (a) => e.onTimelinePointerUp(a), { signal: o }), c.addEventListener("pointercancel", (a) => e.onTimelinePointerUp(a), { signal: o }), c.addEventListener("wheel", (a) => E(e, a), { passive: !1, signal: o })), e.root.addEventListener("keydown", (a) => e.onKey(a), { signal: o });
  const l = new ResizeObserver(() => {
    e.resizeCanvas(), e.render();
  }), s = e.root.querySelector(".viewport-wrap");
  s && l.observe(s);
  const v = e.root.querySelector('[data-role="camera-previews"]');
  v && l.observe(v), e.resizeObserver = l, e.updateEditState();
}
function h(e, n, o) {
  for (const r of e.root.querySelectorAll('[data-act="play"]'))
    r.addEventListener("click", () => e.togglePlay(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="key"]'))
    r.addEventListener("click", () => e.insertKeyframe(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="auto-key"]'))
    r.addEventListener("click", () => e.toggleAutoKey(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="delete-key"]'))
    r.addEventListener("click", () => e.deleteKeyframe(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="copy-key"]'))
    r.addEventListener("click", () => e.copyKeyframe(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="paste-key"]'))
    r.addEventListener("click", () => e.pasteKeyframe(), { signal: o });
  n('[data-act="key-first"]')?.addEventListener("click", () => e.setFrame(0), { signal: o }), n('[data-act="key-last"]')?.addEventListener("click", () => e.setFrame(e.state.duration_frames - 1), { signal: o }), n('[data-act="previous-key"]')?.addEventListener("click", () => e.goToAdjacentKey(-1), { signal: o }), n('[data-act="next-key"]')?.addEventListener("click", () => e.goToAdjacentKey(1), { signal: o }), n('[data-act="previous-frame"]')?.addEventListener("click", () => e.setFrame(e.frame - 1), { signal: o }), n('[data-act="next-frame"]')?.addEventListener("click", () => e.setFrame(e.frame + 1), { signal: o }), n('[data-act="update-key"]')?.addEventListener("click", () => e.updateKeyFromView(), { signal: o }), n('[data-act="view-key"]')?.addEventListener("click", () => e.loadSelectedKeyView(), { signal: o });
  for (const r of e.root.querySelectorAll('select[data-role="encoder"]'))
    r.addEventListener("change", (c) => {
      e.state.encoder = c.target.value, e.serialize(), e.setStatus(`Encoder: ${c.target.value}`);
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="fit-timeline"]'))
    r.addEventListener("click", () => e.resetTimelineZoom(), { signal: o });
  for (const r of e.root.querySelectorAll("[data-interp]"))
    r.addEventListener("click", () => e.setKeyInterpolation(r.dataset.interp), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="reset-camera"]'))
    r.addEventListener("click", () => e.resetCamera(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="loop"]'))
    r.addEventListener("click", () => e.toggleLoop(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="range-start"]'))
    r.addEventListener("click", () => e.setPlaybackRange("start"), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="range-end"]'))
    r.addEventListener("click", () => e.setPlaybackRange("end"), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="range-clear"]'))
    r.addEventListener("click", () => e.clearPlaybackRange(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="toggle-timecode"]'))
    r.addEventListener("click", () => e.toggleTimecode(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="time"]'))
    r.addEventListener("click", () => e.toggleTimecode(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="toggle-snap"]'))
    r.addEventListener("click", () => e.toggleSnap(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="snap-frames"]'))
    r.addEventListener("change", (c) => {
      e.state.snap_frames = Math.max(1, Math.round(Number(c.target.value) || 1)), e.serialize(), e.setStatus(`Snap: ${e.state.snap_frames} frame${e.state.snap_frames === 1 ? "" : "s"}`);
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="add-camera"]'))
    r.addEventListener("click", () => {
      e.addCamera(), e.closeMenus();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="record"]'))
    r.addEventListener("click", () => e.makePlayblast(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="h3-setup"]'))
    r.addEventListener("click", () => e.createH3Setup(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="sync-inputs"]'))
    r.addEventListener("click", () => {
      e.syncUpstreamInputs(), e.closeMenus();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="load-card"]'))
    r.addEventListener("click", () => n('[data-role="file"]')?.click(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="add-card"]'))
    r.addEventListener("click", () => e.addMediaCard(), { signal: o });
  n('[data-role="file"]')?.addEventListener("change", (r) => e.loadCardFile(r.target.files?.[0]), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="load-model"]'))
    r.addEventListener("click", () => {
      e.closeMenus(), n('[data-role="model-file"]')?.click();
    }, { signal: o });
  n('[data-role="model-file"]')?.addEventListener("change", (r) => {
    e.loadModelFile(r.target.files?.[0]), r.target.value = "";
  }, { signal: o }), n('[data-act="load-audio"]')?.addEventListener("click", () => {
    e.closeMenus(), n('[data-role="audio-file"]')?.click();
  }, { signal: o }), n('[data-role="audio-file"]')?.addEventListener("change", (r) => {
    e.loadAudioFile(r.target.files?.[0]), r.target.value = "";
  }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="clear-caches"]'))
    r.addEventListener("click", () => {
      e.clearCaches(), e.closeMenus();
    }, { signal: o });
  for (const r of e.root.querySelectorAll("[data-object-type]"))
    r.addEventListener("click", () => {
      e.addPrimitive(r.dataset.objectType), e.closeMenus();
    }, { signal: o });
  for (const r of e.root.querySelectorAll("[data-preset]"))
    r.addEventListener("click", () => {
      e.applyCameraPreset(r.dataset.preset), e.closeMenus();
    }, { signal: o });
  for (const r of e.root.querySelectorAll("[data-shake]"))
    r.addEventListener("click", () => {
      e.applyCameraShake(r.dataset.shake), e.closeMenus();
    }, { signal: o });
}
function k(e, n, o) {
  for (const r of e.root.querySelectorAll('[data-role="mode"]'))
    r.addEventListener("change", (c) => {
      e.state.render_mode = c.target.value, e.modeWidget && (e.modeWidget.value = c.target.value);
      for (const l of e.root.querySelectorAll('[data-role="mode"]')) l.value = c.target.value;
      e.serialize(), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="frame"]'))
    r.addEventListener("change", (c) => e.setFrame(Number(c.target.value)), { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="scrub"]'))
    r.addEventListener("input", (c) => e.setFrame(Number(c.target.value)), { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="fov"], [data-role="camera-fov"]')) {
    const c = (l) => {
      const s = m(Number(l.target.value), 5, 150);
      e.activeCameraTrack().keyframes.length && e.activeKeyframe() ? (e.activeKeyframe().camera.fov = s, e.scheduleSerialize(), e.render(), e.refreshKeyEditor()) : (e.camera.fov = s, e.render());
      for (const v of e.root.querySelectorAll('[data-role="fov"], [data-role="camera-fov"]')) v.value = String(s);
    };
    r.addEventListener("input", c, { signal: o }), r.addEventListener("change", c, { signal: o });
  }
  for (const r of e.root.querySelectorAll('[data-role="camera-roll"]')) {
    const c = (l) => {
      const s = m(Number(l.target.value), -180, 180);
      e.activeCameraTrack().keyframes.length && e.activeKeyframe() ? (e.activeKeyframe().camera.roll = s, e.scheduleSerialize(), e.render(), e.refreshKeyEditor()) : (e.camera.roll = s, e.render());
      for (const v of e.root.querySelectorAll('[data-role="camera-roll"]')) v.value = String(s);
    };
    r.addEventListener("input", c, { signal: o }), r.addEventListener("change", c, { signal: o });
  }
  for (const r of e.root.querySelectorAll("[data-view]"))
    r.addEventListener("click", () => e.setViewMode(r.dataset.view), { signal: o });
  for (const r of e.root.querySelectorAll("[data-select-mode]"))
    r.addEventListener("click", () => e.setSelectMode(r.dataset.selectMode), { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="select-mode"]'))
    r.addEventListener("change", (c) => e.setSelectMode(c.target.value), { signal: o });
  for (const r of e.root.querySelectorAll("[data-transform-mode]"))
    r.addEventListener("click", () => e.setTransformMode(r.dataset.transformMode), { signal: o });
  n('[data-act="frame-target"]')?.addEventListener("click", () => e.frameTarget(), { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    r.addEventListener("click", () => e.toggleCameraView(), { signal: o });
  for (const r of e.root.querySelectorAll(".inspector-tab, [data-tab]"))
    r.addEventListener("click", () => {
      const c = r.dataset.tab;
      for (const l of e.root.querySelectorAll(".inspector-tab, [data-tab]")) l.classList.toggle("active", l === r);
      for (const l of e.root.querySelectorAll(".inspector-tab-content, [data-tab-panel]"))
        l.hidden = l.dataset.tabPanel !== c;
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="active-camera-select"]'))
    r.addEventListener("change", (c) => e.activateCamera(c.target.value), { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="camera-color"]'))
    r.addEventListener("input", (c) => {
      const l = e.activeCamera();
      l && (l.color = c.target.value, e.scheduleSerialize(), e.render());
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="playblast-camera"]'))
    r.addEventListener("change", (c) => e.setPlayblastCamera(c.target.value), { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="camera-type"]'))
    r.addEventListener("change", (c) => {
      e.camera.camera_type = c.target.value, f(e.root, "camera-type", c.target), e.beginCameraEdit(), e.commitCameraEdit(), e.finishCameraEdit(), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="speed"]')) {
    const c = (l) => {
      const s = m(Number(l.target.value), 0.05, 5);
      if (Number.isFinite(s)) {
        e.cameraSpeed = s;
        for (const v of e.root.querySelectorAll('[data-role="speed"]'))
          v !== l.target && (v.value = String(s));
      }
    };
    r.addEventListener("input", c, { signal: o }), r.addEventListener("change", c, { signal: o });
  }
  for (const r of e.root.querySelectorAll('[data-role="interp"]'))
    r.addEventListener("change", (c) => {
      e.activeKeyframe() && (e.activeKeyframe().interpolation = c.target.value, e.scheduleSerialize(), e.render());
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="point-density"]'))
    r.addEventListener("change", (c) => {
      e.state.point_density = c.target.value, e.scheduleSerialize(), e.render(), e.setStatus(`Point density: ${c.target.value}`);
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="point-color"]'))
    r.addEventListener("input", (c) => {
      e.state.point_color = c.target.value, e.scheduleSerialize(), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="point-spread"]'))
    r.addEventListener("change", (c) => {
      e.state.point_spread = c.target.value, e.scheduleSerialize(), e.render(), e.setStatus(`Point spread: ${c.target.value}`);
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="card-fit"]'))
    r.addEventListener("change", (c) => {
      e.state.card_fit = c.target.value, e.scheduleSerialize(), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="speed-heatmap"]'))
    r.addEventListener("change", (c) => {
      e.state.speed_heatmap = c.target.checked, f(e.root, "speed-heatmap", c.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="playblast-grid"]'))
    r.addEventListener("change", (c) => {
      e.state.playblast_grid = c.target.checked, f(e.root, "playblast-grid", c.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="show-wireframe"]'))
    r.addEventListener("change", (c) => {
      e.state.show_wireframe = c.target.checked, f(e.root, "show-wireframe", c.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="show-vertices"]'))
    r.addEventListener("change", (c) => {
      e.state.show_vertices = c.target.checked, f(e.root, "show-vertices", c.target, "checked"), e.scheduleSerialize(), e.webgl && (e.webgl.sceneKey = ""), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="burn-in"]'))
    r.addEventListener("change", (c) => {
      e.state.burn_in = c.target.checked, f(e.root, "burn-in", c.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="guides"]'))
    r.addEventListener("change", (c) => {
      e.state.guides = c.target.checked, f(e.root, "guides", c.target, "checked"), e.scheduleSerialize(), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="safe-areas"]'))
    r.addEventListener("change", (c) => {
      e.state.safe_areas = c.target.checked, f(e.root, "safe-areas", c.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="resolution-gate"]'))
    r.addEventListener("change", (c) => {
      e.state.resolution_gate = c.target.checked, f(e.root, "resolution-gate", c.target, "checked"), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="aspect-ratio"]'))
    r.addEventListener("change", (c) => {
      e.state.aspect_ratio = c.target.value, f(e.root, "aspect-ratio", c.target), e.scheduleSerialize(), e.renderCameraView(), e.render();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) {
    const c = (l) => {
      e.state.viewport_bg_color = l.target.value, f(e.root, "viewport-bg-color", l.target), e.scheduleSerialize(), e.render();
    };
    r.addEventListener("input", c, { signal: o }), r.addEventListener("change", c, { signal: o });
  }
  for (const r of e.root.querySelectorAll('[data-act="upload-viewport-bg"]'))
    r.addEventListener("click", () => {
      e.closeMenus(), n('[data-role="viewport-bg-file"]')?.click();
    }, { signal: o });
  n('[data-role="viewport-bg-file"]')?.addEventListener("change", (r) => {
    e.loadViewportBgFile(r.target.files?.[0]), r.target.value = "";
  }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="upload-viewport-bg-seq"]'))
    r.addEventListener("click", () => {
      e.closeMenus(), n('[data-role="viewport-bg-seq-file"]')?.click();
    }, { signal: o });
  n('[data-role="viewport-bg-seq-file"]')?.addEventListener("change", (r) => {
    e.loadViewportBgSequence(Array.from(r.target.files || [])), r.target.value = "";
  }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-act="clear-viewport-bg"]'))
    r.addEventListener("click", () => {
      e.clearViewportBgImage(), e.closeMenus();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="object-material"]'))
    r.addEventListener("change", (c) => {
      const l = e.selectedObject();
      l && (l.material_mode = c.target.value, e.serialize(), e.render());
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="object-color"]'))
    r.addEventListener("input", (c) => {
      const l = e.selectedObject();
      l && (l.color = c.target.value, e.scheduleSerialize(), e.render());
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="reference-select"]'))
    r.addEventListener("change", (c) => {
      e.state.reference_index = Number(c.target.value), e.serialize(), e.loadSelectedReference();
    }, { signal: o });
  for (const r of e.root.querySelectorAll("[data-proxy-preset]"))
    r.addEventListener("click", () => {
      e.applyProxyPreset(r.dataset.proxyPreset), e.closeMenus();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('select[data-role="proxy-preset"]'))
    r.addEventListener("change", (c) => {
      e.applyProxyPreset(c.target.value);
    }, { signal: o });
  for (const r of e.root.querySelectorAll("[data-lens]"))
    r.addEventListener("click", () => {
      b(e, Number(r.dataset.lens));
    }, { signal: o });
  for (const r of e.root.querySelectorAll("[data-blocking-scene]"))
    r.addEventListener("click", () => {
      S(e, r.dataset.blockingScene), e.closeMenus();
    }, { signal: o });
  for (const r of e.root.querySelectorAll('[data-role="show-radar"]'))
    r.addEventListener("change", (c) => {
      e.state.show_radar = c.target.checked, e.scheduleSerialize(), e.render(), e.setStatus(`Radar Mini-Map: ${c.target.checked ? "ON" : "OFF"}`);
    }, { signal: o });
}
function f(e, n, o, r = "value") {
  for (const c of e.querySelectorAll(`[data-role="${n}"]`))
    c !== o && (c[r] = o[r]);
}
function x(e) {
  e.abortController = new AbortController();
  const n = e.abortController.signal, o = (r) => e.root.querySelector(r);
  h(e, o, n), k(e, o, n), L(e, o, n);
}
export {
  x as bind,
  f as syncMirroredControl
};
