import { expect, test } from "@playwright/test";

test("Director serializes and remains interactive in Nodes 2.0", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto("/");
  await page.addStyleTag({ content: ".pysssss-image-feed-menu{display:none!important}" });
  await page.waitForFunction(() => window.comfyAPI?.app?.app?.graph && window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector, null, { timeout: 30_000 });
  await page.waitForTimeout(2_000);
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    await app.extensionManager.setting.set("Comfy.VueNodes.Enabled", true);
    app.graph.clear();
    const node = window.LiteGraph.createNode("MajoorOmniCamDirector");
    node.pos = [0, 0]; app.graph.add(node);
    if (typeof app.canvas.setZoom === "function") app.canvas.setZoom(0.65);
    else app.canvas.ds.scale = 0.65;
    app.canvas.centerOnNode(node); app.graph.setDirtyCanvas(true, true);
    window.omnicamLiveNode = node;
  });
  await page.waitForFunction(() => window.LiteGraph.vueNodesMode && window.omnicamLiveNode?.__majoorOmniCam?.root?.isConnected, null, { timeout: 30_000 });

  const mounted = await page.evaluate(() => {
    const node = window.omnicamLiveNode, ui = node.__majoorOmniCam;
    return { height: ui.root.getBoundingClientRect().height, widgetNames: node.widgets.map((widget) => widget.name), minHeight: ui.domWidget.options.getMinHeight(), graphScale: window.comfyAPI.app.app.canvas.ds.scale };
  });
  expect(mounted.height).toBeGreaterThan(500);
  expect(mounted.minHeight).toBe(700);
  expect(mounted.widgetNames).toContain("majoor_omnicam_viewport");
  expect(mounted.graphScale).toBeCloseTo(0.65, 2);
  expect(await page.locator('.majoor-omnicam .top .toolbar-menu').count()).toBe(4);
  expect(await page.locator('.majoor-omnicam .top [data-act="play"]').count()).toBe(0);
  expect(await page.locator('.majoor-omnicam .timeline-toolbar .icon-button').count()).toBe(10);
  await expect(page.locator('.majoor-omnicam [data-role="curve-canvas"]')).toBeVisible();
  await expect(page.locator('.majoor-omnicam .viewport-inspector')).toBeVisible();
  await expect(page.locator('.majoor-omnicam .viewport-actions [data-act="record"]')).toBeVisible();
  await expect(page.locator('.majoor-omnicam .viewport-actions [data-act="h3-setup"]')).toBeVisible();
  await page.locator('.majoor-omnicam [data-menu="scene"] summary').click();
  await expect(page.locator('.majoor-omnicam [data-object-type="cube"]')).toBeVisible();
  await page.locator('.majoor-omnicam .viewport-wrap').click({ position: { x: 300, y: 150 } });
  await expect(page.locator('.majoor-omnicam [data-menu="scene"]')).not.toHaveAttribute("open", "");
  await page.locator('.majoor-omnicam [data-menu="camera"] summary').click();
  await expect(page.locator('.majoor-omnicam [data-role="camera-menu-list"] button')).toHaveCount(1);
  await page.locator('.majoor-omnicam [data-menu="camera"] summary').click();
  await page.locator('.majoor-omnicam .scene-item', { hasText: "Camera" }).click();
  await expect(page.locator('.majoor-omnicam [data-role="camera-near"]')).toBeVisible();
  await page.evaluate(() => {
    const root = window.omnicamLiveNode.__majoorOmniCam.root;
    root.querySelector('[data-role="camera-near"]').value = "0.001";
    const far = root.querySelector('[data-role="camera-far"]'); far.value = "5000"; far.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const clipping = await page.evaluate(() => {
    const ui = window.omnicamLiveNode.__majoorOmniCam; ui.render();
    return { near: ui.camera.near, far: ui.camera.far, webglNear: ui.webgl.perspective.near, webglFar: ui.webgl.perspective.far };
  });
  expect(clipping).toEqual({ near: 0.001, far: 5000, webglNear: 0.001, webglFar: 5000 });
  await page.locator('.majoor-omnicam .scene-item', { hasText: "Subject" }).click();

  const pointerStart = await page.evaluate(() => {
    const node = window.omnicamLiveNode, ui = node.__majoorOmniCam, rect = ui.interactionElement.getBoundingClientRect();
    window.omnicamPointerBaseline = { camera: [...ui.camera.position], node: [...node.pos] };
    return { x: rect.left + rect.width * 0.18, y: rect.top + rect.height * 0.22, right: rect.right, bottom: rect.bottom };
  });
  await page.mouse.move(pointerStart.x, pointerStart.y); await page.mouse.down(); await page.mouse.move(pointerStart.x + 90, pointerStart.y + 35, { steps: 5 }); await page.mouse.up();
  const insideDrag = await page.evaluate(() => {
    const node = window.omnicamLiveNode, ui = node.__majoorOmniCam, baseline = window.omnicamPointerBaseline;
    return { cameraDelta: ui.camera.position.reduce((sum, value, index) => sum + Math.abs(value - baseline.camera[index]), 0), nodeDelta: node.pos.reduce((sum, value, index) => sum + Math.abs(value - baseline.node[index]), 0), capturedBy: ui.interactionElement.dataset.captureWheel };
  });
  expect(insideDrag.cameraDelta).toBeGreaterThan(0.01);
  expect(insideDrag.nodeDelta).toBe(0);
  expect(insideDrag.capturedBy).toBe("true");

  const beforeWheel = await page.evaluate(() => {
    const ui = window.omnicamLiveNode.__majoorOmniCam, difference = ui.camera.position.map((value, index) => value - ui.camera.target[index]);
    return Math.hypot(...difference);
  });
  await page.mouse.move(pointerStart.x, pointerStart.y); await page.mouse.wheel(0, 180);
  const afterWheel = await page.evaluate(() => {
    const ui = window.omnicamLiveNode.__majoorOmniCam, difference = ui.camera.position.map((value, index) => value - ui.camera.target[index]);
    return Math.hypot(...difference);
  });
  expect(afterWheel).toBeGreaterThan(beforeWheel);

  const beforeOutside = await page.evaluate(() => [...window.omnicamLiveNode.__majoorOmniCam.camera.position]);
  await page.mouse.move(30, 1100); await page.mouse.down(); await page.mouse.move(130, 1050, { steps: 4 }); await page.mouse.up();
  const afterOutside = await page.evaluate(() => [...window.omnicamLiveNode.__majoorOmniCam.camera.position]);
  expect(afterOutside).toEqual(beforeOutside);

  await page.evaluate(() => {
    const ui = window.omnicamLiveNode.__majoorOmniCam;
    ui.setFrame(12); ui.camera.fov = 52; ui.selectedEntity = "camera"; ui.refreshObjects(); ui.root.focus();
  });
  await page.keyboard.press("i");
  await expect(page.locator('.majoor-omnicam [data-key-frame="12"]')).toBeVisible();
  expect(await page.locator('.majoor-omnicam .timeline-tick').count()).toBeGreaterThan(2);
  await page.locator('.majoor-omnicam [data-key-frame="12"]').click();
  await expect(page.locator('.majoor-omnicam [data-key-frame="12"]')).toHaveClass(/selected/);
  await expect(page.locator('.majoor-omnicam [data-key-frame="12"]')).not.toHaveClass(/editing/);
  await page.locator('.majoor-omnicam [data-curve-mode="bezier"]').click({ force: true });
  expect(await page.evaluate(() => window.omnicamLiveNode.__majoorOmniCam.state.keyframes.find((key) => key.frame === 12).interpolation)).toBe("bezier");
  const curvePoint = await page.evaluate(() => {
    const ui = window.omnicamLiveNode.__majoorOmniCam, canvas = ui.root.querySelector('[data-role="curve-canvas"]'), rect = canvas.getBoundingClientRect();
    ui.drawCurveEditor(); const point = ui.curveHitPoints.find((item) => item.key.frame === 12 && item.channel.name === "Position X");
    return { x: rect.left + point.x * rect.width / canvas.clientWidth, y: rect.top + point.y * rect.height / canvas.clientHeight, before: point.key.camera.position[0] };
  });
  await page.mouse.move(curvePoint.x, curvePoint.y); await page.mouse.down();
  expect(await page.evaluate(({ x, y }) => { const element = document.elementFromPoint(x, y); return { dragging: Boolean(window.omnicamLiveNode.__majoorOmniCam.curveDrag), entity: window.omnicamLiveNode.__majoorOmniCam.selectedEntity, role: element?.dataset?.role || "", tag: element?.tagName || "" }; }, curvePoint)).toEqual({ dragging: true, entity: "camera", role: "curve-canvas", tag: "CANVAS" });
  await page.mouse.move(curvePoint.x, curvePoint.y - 20, { steps: 3 }); await page.mouse.up();
  expect(await page.evaluate(() => window.omnicamLiveNode.__majoorOmniCam.state.keyframes.find((key) => key.frame === 12).camera.position[0])).not.toBe(curvePoint.before);
  const selectedCameraBefore = await page.evaluate(() => [...window.omnicamLiveNode.__majoorOmniCam.state.keyframes.find((key) => key.frame === 12).camera.position]);
  await page.mouse.move(pointerStart.x, pointerStart.y); await page.mouse.down(); await page.mouse.move(pointerStart.x + 45, pointerStart.y + 20, { steps: 3 }); await page.mouse.up();
  await expect(page.locator('.majoor-omnicam [data-key-frame="12"]')).not.toHaveClass(/selected|editing/);
  const selectedCameraAfter = await page.evaluate(() => [...window.omnicamLiveNode.__majoorOmniCam.state.keyframes.find((key) => key.frame === 12).camera.position]);
  expect(selectedCameraAfter).not.toEqual(selectedCameraBefore);
  await page.locator('.majoor-omnicam [data-act="auto-key"]').click();
  await expect(page.locator('.majoor-omnicam .viewport-wrap')).toHaveClass(/auto-key/);
  await page.mouse.move(pointerStart.x, pointerStart.y); await page.mouse.wheel(0, 80);
  await expect(page.locator('.majoor-omnicam [data-key-frame="12"]')).not.toHaveClass(/selected|editing/);
  await page.locator('.majoor-omnicam [data-act="auto-key"]').click();
  await expect(page.locator('.majoor-omnicam .viewport-wrap')).not.toHaveClass(/auto-key/);
  await page.locator('.majoor-omnicam [data-key-frame="12"]').click();
  await page.locator('.majoor-omnicam [data-role="key-frame"]').evaluate((input) => { input.value = "18"; input.dispatchEvent(new Event("change", { bubbles: true })); });
  const timeline = await page.locator('.majoor-omnicam [data-role="keys"]').boundingBox();
  const marker = await page.locator('.majoor-omnicam [data-key-frame="18"]').boundingBox();
  await page.mouse.move(marker.x + marker.width / 2, marker.y + marker.height / 2); await page.mouse.down();
  expect(await page.evaluate(() => Boolean(window.omnicamLiveNode.__majoorOmniCam.keyDrag))).toBe(true);
  await page.mouse.move(timeline.x + timeline.width * 24 / 119, marker.y + marker.height / 2, { steps: 5 });
  expect(await page.evaluate(() => window.omnicamLiveNode.__majoorOmniCam.state.keyframes.map((key) => key.frame))).toEqual([0, 24]);
  await page.mouse.up();
  await expect(page.locator('.majoor-omnicam [data-key-frame="24"]')).toBeVisible();
  await page.locator('.majoor-omnicam [data-role="key-fov"]').evaluate((input) => { input.value = "61"; input.dispatchEvent(new Event("change", { bubbles: true })); });
  await page.locator('.majoor-omnicam [data-role="key-px"]').evaluate((input) => { input.value = "7.5"; input.dispatchEvent(new Event("change", { bubbles: true })); });
  await page.locator('.majoor-omnicam [data-role="key-interp"]').selectOption("linear");
  await page.locator('.majoor-omnicam [data-role="key-fov"]').focus();
  await page.keyboard.press("i"); await page.keyboard.press("ArrowRight");
  expect(await page.evaluate(() => ({ frame: window.omnicamLiveNode.__majoorOmniCam.frame, keys: window.omnicamLiveNode.__majoorOmniCam.state.keyframes.length }))).toEqual({ frame: 24, keys: 2 });
  await page.evaluate(() => {
    window.omnicamEscapedKeydowns = 0;
    window.addEventListener("keydown", (event) => { if (["ArrowRight", "c", "v", "Delete", " "].includes(event.key)) window.omnicamEscapedKeydowns += 1; });
    window.omnicamLiveNode.__majoorOmniCam.root.focus();
  });
  await page.keyboard.press("ArrowRight");
  expect(await page.evaluate(() => window.omnicamLiveNode.__majoorOmniCam.frame)).toBe(25);
  await page.keyboard.press("Control+c");
  await page.evaluate(() => { const ui = window.omnicamLiveNode.__majoorOmniCam; ui.setFrame(36); ui.root.focus(); });
  await page.keyboard.press("Control+v");
  await expect(page.locator('.majoor-omnicam [data-key-frame="36"]')).toBeVisible();
  await page.keyboard.press("Delete");
  await expect(page.locator('.majoor-omnicam [data-key-frame="36"]')).toHaveCount(0);
  expect(await page.evaluate(() => window.comfyAPI.app.app.graph.nodes.includes(window.omnicamLiveNode))).toBe(true);
  await page.keyboard.press("Space"); await page.keyboard.press("Space");
  expect(await page.evaluate(() => window.omnicamLiveNode.__majoorOmniCam.playing)).toBe(false);
  expect(await page.evaluate(() => window.omnicamEscapedKeydowns)).toBe(0);

  await page.evaluate(() => {
    const ui = window.omnicamLiveNode.__majoorOmniCam;
    ui.loadExecutionPreview({ images: [{ filename: "one.png", subfolder: "", type: "input" }, { filename: "two.png", subfolder: "", type: "input" }] });
    const select = ui.root.querySelector('[data-role="reference-select"]'); select.value = "1"; select.dispatchEvent(new Event("change"));
  });
  await page.locator('.majoor-omnicam .scene-item', { hasText: "Subject" }).click();
  const interaction = await page.evaluate(() => {
    const node = window.omnicamLiveNode, ui = node.__majoorOmniCam, handle = ui.gizmoGeometry(ui.selectedObject()).handles[0], [center, end] = handle.points, rect = ui.interactionElement.getBoundingClientRect();
    const scaleX = rect.width / ui.canvas.width, scaleY = rect.height / ui.canvas.height, dx = end[0] - center[0], dy = end[1] - center[1], magnitude = Math.hypot(dx, dy);
    ui.interactionElement.setPointerCapture = () => {};
    ui.onPointerDown({ clientX: rect.left + end[0] * scaleX, clientY: rect.top + end[1] * scaleY, pointerId: 1, button: 0, shiftKey: false, altKey: false });
    ui.onPointerMove({ clientX: rect.left + (end[0] + dx / magnitude * 45) * scaleX, clientY: rect.top + (end[1] + dy / magnitude * 45) * scaleY }); ui.onPointerUp();
    const dragMode = (mode, handleIndex) => {
      ui.state.gizmo_mode = mode; const points = ui.gizmoGeometry(ui.selectedObject()).handles[handleIndex].points;
      const index = mode === "rotate" ? Math.floor(points.length / 4) : points.length - 1, start = points[index], previous = points[Math.max(0, index - 1)];
      const vx = start[0] - previous[0], vy = start[1] - previous[1], distance = Math.max(1, Math.hypot(vx, vy));
      ui.onPointerDown({ clientX: rect.left + start[0] * scaleX, clientY: rect.top + start[1] * scaleY, pointerId: 2, button: 0, shiftKey: false, altKey: false });
      ui.onPointerMove({ clientX: rect.left + (start[0] + vx / distance * 35) * scaleX, clientY: rect.top + (start[1] + vy / distance * 35) * scaleY }); ui.onPointerUp();
    };
    dragMode("scale", 1); dragMode("rotate", 2);
    const state = JSON.parse(ui.stateWidget.value);
    const serialized = node.serialize();
    const restored = window.LiteGraph.createNode("MajoorOmniCamDirector"); restored.pos = [900, 0]; node.graph.add(restored); restored.configure(serialized);
    window.omnicamRestoredNode = restored;
    const editedKey = state.keyframes.find((key) => key.frame === 24);
    return { keyframes: state.keyframes.length, fov: editedKey?.camera.fov, keyPositionX: editedKey?.camera.position[0], interpolation: editedKey?.interpolation, referenceIndex: state.reference_index, referenceOptions: ui.root.querySelector('[data-role="reference-select"]').options.length, movedX: state.objects[0].position[0], scaled: state.objects[0].size.some((value, index) => Math.abs(value - [2, 3, 3][index]) > 0.01), rotated: state.objects[0].rotation.some((value) => Math.abs(value) > 0.01) };
  });
  expect(interaction.keyframes).toBe(2);
  expect(interaction.fov).toBe(61);
  expect(interaction.keyPositionX).toBe(7.5);
  expect(interaction.interpolation).toBe("linear");
  expect(interaction.referenceIndex).toBe(1);
  expect(interaction.referenceOptions).toBe(2);
  expect(Math.abs(interaction.movedX)).toBeGreaterThan(0.01);
  expect(interaction.scaled).toBe(true);
  expect(interaction.rotated).toBe(true);
  await page.evaluate(() => window.omnicamLiveNode.__majoorOmniCam.root.focus());
  await page.keyboard.press("t"); expect(await page.evaluate(() => window.omnicamLiveNode.__majoorOmniCam.state.gizmo_mode)).toBe("translate");
  await page.keyboard.press("r"); expect(await page.evaluate(() => window.omnicamLiveNode.__majoorOmniCam.state.gizmo_mode)).toBe("rotate");
  await page.keyboard.press("s"); expect(await page.evaluate(() => window.omnicamLiveNode.__majoorOmniCam.state.gizmo_mode)).toBe("scale");
  const objectAnimation = await page.evaluate(() => {
    const ui = window.omnicamLiveNode.__majoorOmniCam, object = ui.selectedObject();
    ui.setFrame(0); ui.insertKeyframe(); const start = object.position[0];
    ui.setFrame(24); object.position[0] = start + 4; ui.insertKeyframe(); ui.setFrame(12); ui.drawCurveEditor();
    const material = ui.root.querySelector('[data-role="object-material"]'); material.value = "checker"; material.dispatchEvent(new Event("change", { bubbles: true })); ui.render();
    const canvas = ui.root.querySelector('[data-role="curve-canvas"]'), rect = canvas.getBoundingClientRect(), point = ui.curveHitPoints.find((item) => item.key.frame === 24 && item.channel.name === "Position X"), beforeCurveEdit = point.key.transform.position[0];
    canvas.setPointerCapture = () => {}; canvas.releasePointerCapture = () => {}; canvas.hasPointerCapture = () => false;
    const event = (y) => ({ preventDefault() {}, stopPropagation() {}, currentTarget: canvas, clientX: rect.left + point.x * rect.width / canvas.clientWidth, clientY: rect.top + y * rect.height / canvas.clientHeight, pointerId: 91 });
    ui.onCurvePointerDown(event(point.y)); ui.onCurvePointerMove(event(point.y - 15)); ui.onCurvePointerUp(event(point.y - 15));
    const node = ui.webgl.objectNodes.get(object.id);
    return { keys: object.keyframes.length, midpoint: start + 2, sampledMidpoint: sampleObjectMidpoint(object), editedCurve: object.keyframes.find((key) => key.frame === 24).transform.position[0] !== beforeCurveEdit, curvePoints: ui.curveHitPoints.length, curveTitle: ui.root.querySelector('[data-role="curve-title"]').textContent, checker: Boolean(node.material?.map), serializedKeys: JSON.parse(ui.stateWidget.value).objects.find((item) => item.id === object.id).keyframes.length };
    function sampleObjectMidpoint(target) { ui.setFrame(12); return target.position[0]; }
  });
  expect(objectAnimation.keys).toBe(2); expect(objectAnimation.sampledMidpoint).not.toBe(objectAnimation.midpoint); expect(objectAnimation.editedCurve).toBe(true); expect(objectAnimation.curvePoints).toBe(6); expect(objectAnimation.curveTitle).toContain("Subject"); expect(objectAnimation.checker).toBe(true); expect(objectAnimation.serializedKeys).toBe(2);
  const editorViews = await page.evaluate(() => {
    const ui = window.omnicamLiveNode.__majoorOmniCam, shot = [...ui.camera.position];
    ui.setViewMode("perspective"); const editorBefore = [...ui.viewportCamera().position]; ui.onWheel({ preventDefault() {}, stopPropagation() {}, deltaY: 120 }); const editorAfter = [...ui.viewportCamera().position];
    ui.setViewMode("top"); ui.render();
    const cube = ui.webgl.objectNodes.get("proxy_cube"), point = cube.position.clone().project(ui.webgl.activeCamera), x = (point.x + 1) * ui.canvas.width / 2, y = (1 - point.y) * ui.canvas.height / 2;
    const mainRect = ui.interactionElement.getBoundingClientRect(), cameraRect = ui.root.querySelector('[data-role="camera-view-row"]').getBoundingClientRect();
    return { shotUnchanged: ui.camera.position.every((value, index) => value === shot[index]), editorMoved: editorAfter.some((value, index) => Math.abs(value - editorBefore[index]) > 1e-4), orthographic: ui.webgl.activeCamera.isOrthographicCamera, cameraViewVisible: !ui.root.querySelector('[data-role="camera-view-row"]').hidden, independentRenderer: ui.cameraWebgl !== ui.webgl, separateLayout: cameraRect.top >= mainRect.bottom, cameraFrames: [...ui.root.querySelectorAll('[data-camera-frame]')].map((item) => item.textContent), raycastId: ui.webgl.pick(x, y, ui.canvas.width, ui.canvas.height) };
  });
  expect(editorViews).toEqual({ shotUnchanged: true, editorMoved: true, orthographic: true, cameraViewVisible: true, independentRenderer: true, separateLayout: true, cameraFrames: ["F12"], raycastId: "proxy_cube" });
  const cameraViewToggle = await page.evaluate(() => { const ui = window.omnicamLiveNode.__majoorOmniCam; ui.toggleCameraView(); const hidden = ui.root.querySelector('[data-role="camera-view-row"]').hidden; const serialized = JSON.parse(ui.stateWidget.value).camera_view_visible; ui.toggleCameraView(); return { hidden, serialized }; });
  expect(cameraViewToggle).toEqual({ hidden: true, serialized: false });
  const multiCamera = await page.evaluate(() => {
    const ui = window.omnicamLiveNode.__majoorOmniCam;
    ui.resizeCanvas();
    const rootRect = ui.root.getBoundingClientRect(), editorRect = ui.interactionElement.getBoundingClientRect(), rowRect = ui.root.querySelector('[data-role="camera-view-row"]').getBoundingClientRect(), stripRect = ui.root.querySelector('[data-role="camera-previews"]').getBoundingClientRect();
    const firstId = ui.activeCameraTrack().id;
    ui.addCamera();
    ui.addCamera();
    const thirdId = ui.activeCameraTrack().id;
    ui.setFrame(24); ui.camera.position[0] += 9; ui.insertKeyframe();
    const thirdPosition = [...ui.camera.position];
    ui.setPlayblastCamera(thirdId); ui.activateCamera(firstId); ui.setFrame(24); ui.resizeCanvas(); ui.renderCameraView();
    const payload = JSON.parse(ui.stateWidget.value), previewCamera = ui.playblastCameraAtFrame();
    return {
      cameraCount: payload.cameras.length,
      cameraIds: payload.cameras.map((camera) => camera.id),
      previewCount: ui.root.querySelectorAll('.camera-preview-tile').length,
      activeId: ui.state.active_camera_id,
      playblastId: payload.playblast_camera_id,
      canonicalMatchesPlayblast: payload.keyframes.some((key) => key.frame === 24 && key.camera.position[0] === thirdPosition[0]),
      previewMatchesPlayblast: previewCamera.position[0] === thirdPosition[0],
      selectedPreview: ui.root.querySelector('.camera-preview-tile.playblast')?.dataset.cameraId,
      outputSelect: ui.root.querySelector('[data-role="playblast-camera"]').value,
      editorFill: editorRect.width / rootRect.width,
      previewStripFill: stripRect.width / rowRect.width,
      previewFrames: [...ui.root.querySelectorAll('[data-camera-frame]')].map((item) => item.textContent),
      previewBackingSizes: [...ui.cameraPreviewCanvases.values()].map((canvas) => [canvas.width, canvas.height]),
      editorBackingHeight: ui.canvas.height,
      editorExpectedHeight: Math.round(ui.interactionElement.clientHeight * Math.min(2, window.devicePixelRatio || 1)),
    };
  });
  expect(multiCamera.cameraCount).toBe(3);
  expect(multiCamera.previewCount).toBe(3);
  expect(multiCamera.activeId).not.toBe(multiCamera.playblastId);
  expect(multiCamera.selectedPreview).toBe(multiCamera.playblastId);
  expect(multiCamera.outputSelect).toBe(multiCamera.playblastId);
  expect(multiCamera.canonicalMatchesPlayblast).toBe(true);
  expect(multiCamera.previewMatchesPlayblast).toBe(true);
  expect(multiCamera.editorFill).toBeGreaterThan(0.99);
  expect(multiCamera.previewStripFill).toBeGreaterThan(0.9);
  expect(multiCamera.previewFrames).toEqual(["F24", "F24", "F24"]);
  expect(multiCamera.previewBackingSizes.every(([width, height]) => width >= 220 && height >= 140)).toBe(true);
  expect(Math.abs(multiCamera.editorBackingHeight - multiCamera.editorExpectedHeight)).toBeLessThanOrEqual(1);
  await page.locator(`.camera-preview-tile[data-camera-id="${multiCamera.cameraIds[1]}"]`).dblclick({ force: true });
  expect(await page.evaluate(() => ({ active: window.omnicamLiveNode.__majoorOmniCam.state.active_camera_id, playblast: window.omnicamLiveNode.__majoorOmniCam.state.playblast_camera_id }))).toEqual({ active: multiCamera.cameraIds[1], playblast: multiCamera.playblastId });
  await page.evaluate(() => { const input = window.omnicamLiveNode.__majoorOmniCam.root.querySelector('[data-role="duration-seconds"]'); input.value = "6"; input.dispatchEvent(new Event("change", { bubbles: true })); });
  expect(await page.evaluate(() => ({ duration: window.omnicamLiveNode.__majoorOmniCam.state.duration_frames, scrubMax: window.omnicamLiveNode.__majoorOmniCam.root.querySelector('[data-role="scrub"]').max, lastTick: [...window.omnicamLiveNode.__majoorOmniCam.root.querySelectorAll('.timeline-tick')].at(-1)?.textContent }))).toEqual({ duration: 144, scrubMax: "143", lastTick: "143" });
  await page.evaluate(() => { const input = window.omnicamLiveNode.__majoorOmniCam.root.querySelector('[data-role="duration-seconds"]'); input.value = "5"; input.dispatchEvent(new Event("change", { bubbles: true })); });
  const cleanCapture = await page.evaluate(() => {
    const ui = window.omnicamLiveNode.__majoorOmniCam; ui.recording = true; ui.render();
    const grids = []; ui.webgl.content.traverse((object) => { if (object.userData.omnicamCaptureGuide) grids.push(object.visible); });
    const result = { grids, pathVisible: ui.webgl.path.visible }; ui.recording = false; ui.render(); return result;
  });
  expect(cleanCapture.grids.every((visible) => !visible)).toBe(true); expect(cleanCapture.pathVisible).toBe(false);
  const optionalGridAndGround = await page.evaluate(() => {
    const ui = window.omnicamLiveNode.__majoorOmniCam;
    const toggle = ui.root.querySelector('[data-role="playblast-grid"]'); toggle.checked = true; toggle.dispatchEvent(new Event("change", { bubbles: true }));
    ui.recording = true; ui.render();
    const grids = []; ui.webgl.content.traverse((object) => { if (object.userData.omnicamCaptureGuide) grids.push(object.visible); });
    ui.recording = false; ui.addPrimitive("ground"); ui.render();
    const ground = ui.state.objects.find((object) => object.type === "ground");
    let renderedGround = false; ui.webgl.content.traverse((object) => { if (object.userData.omnicamId === ground.id) renderedGround = true; });
    return { grids, ground: { position: ground.position, size: ground.size }, renderedGround, serializedGrid: JSON.parse(ui.stateWidget.value).playblast_grid };
  });
  expect(optionalGridAndGround.grids.every(Boolean)).toBe(true);
  expect(optionalGridAndGround.ground).toEqual({ position: [0, -0.05, 0], size: [12, 0.1, 12] });
  expect(optionalGridAndGround.renderedGround).toBe(true);
  expect(optionalGridAndGround.serializedGrid).toBe(true);
  await page.waitForFunction(() => window.omnicamRestoredNode?.__majoorOmniCam?.state?.keyframes?.some((key) => key.frame === 24 && key.camera.fov === 61));

  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    await app.extensionManager.setting.set("Comfy.VueNodes.Enabled", false);
    await app.extensionManager.setting.set("Comfy.VueNodes.Enabled", true);
    app.canvas.centerOnNode(window.omnicamLiveNode); app.graph.setDirtyCanvas(true, true);
  });
  await page.waitForFunction(() => window.LiteGraph.vueNodesMode && window.omnicamLiveNode.__majoorOmniCam.root.isConnected);
  expect(errors).toEqual([]);
});

test("loads an optional FBX animation-only fixture as a normalized skeleton", async ({ page }) => {
  test.skip(!process.env.OMNICAM_FBX_PATH, "Set OMNICAM_FBX_PATH to validate a local FBX fixture");
  await page.goto("/");
  await page.waitForFunction(() => window.comfyAPI?.app?.app?.graph && window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector, null, { timeout: 30_000 });
  await page.waitForTimeout(2_000);
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    await app.extensionManager.setting.set("Comfy.VueNodes.Enabled", true);
    app.graph.clear();
    const node = window.LiteGraph.createNode("MajoorOmniCamDirector");
    node.pos = [0, 0]; app.graph.add(node);
    if (typeof app.canvas.setZoom === "function") app.canvas.setZoom(0.65);
    app.canvas.centerOnNode(node); app.graph.setDirtyCanvas(true, true);
    window.omnicamFbxNode = node;
  });
  await page.waitForFunction(() => window.LiteGraph.vueNodesMode && window.omnicamFbxNode?.__majoorOmniCam?.root?.isConnected, null, { timeout: 30_000 });
  await page.locator('.majoor-omnicam [data-role="model-file"]').setInputFiles(process.env.OMNICAM_FBX_PATH);
  await page.waitForFunction(() => window.omnicamFbxNode.__majoorOmniCam.modelInfoById.size > 0, null, { timeout: 30_000 });
  const result = await page.evaluate(() => {
    const ui = window.omnicamFbxNode.__majoorOmniCam;
    const info = [...ui.modelInfoById.values()][0];
    const model = [...ui.webgl.models.values()][0];
    let skeletonHelpers = 0;
    model.scene.traverse((object) => { if (object.isSkeletonHelper) skeletonHelpers += 1; });
    const bonePositions = () => {
      const positions = [];
      model.scene.updateMatrixWorld(true);
      model.scene.traverse((object) => { if (object.isBone) positions.push(...object.matrixWorld.elements.slice(12, 15)); });
      return positions;
    };
    ui.setFrame(0); const firstPose = bonePositions();
    ui.setFrame(ui.state.fps); const secondPose = bonePositions();
    const poseDelta = firstPose.reduce((sum, value, index) => sum + Math.abs(value - secondPose[index]), 0);
    return { ...info, skeletonHelpers, poseDelta, status: ui.root.querySelector('[data-role="status"]').textContent };
  });
  expect(result.meshes).toBe(0);
  expect(result.bones).toBeGreaterThan(0);
  expect(result.animations).toBeGreaterThan(0);
  expect(result.skeletonHelpers).toBe(1);
  expect(result.poseDelta).toBeGreaterThan(0.01);
  expect(result.normalizationScale).toBeLessThan(1);
  expect(result.status).toContain("animation only");
});
