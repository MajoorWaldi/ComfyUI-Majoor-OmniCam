import { expect, test } from "@playwright/test";

test("scene reconstruction end-to-end: run, adopt into director, unlock, and track regression", async ({ page }) => {
  await page.goto("/tests/frontend/scene-reconstruction-mount.html");
  await expect(page.locator("#status")).toHaveText("ready", { timeout: 20_000 });

  const extractorHost = page.locator("#extractor-host");
  const directorHost = page.locator("#director-host");

  // 1. Check Extractor defaults to Camera Track mode
  const camModeBtn = extractorHost.locator('[data-role="extract-mode-camera"]');
  const reconModeBtn = extractorHost.locator('[data-role="extract-mode-reconstruct"]');
  await expect(camModeBtn).toHaveClass(/active/);
  await expect(reconModeBtn).not.toHaveClass(/active/);

  const reconPanel = extractorHost.locator('[data-role="reconstruction-panel"]');
  await expect(reconPanel).toHaveAttribute("hidden", "");

  // 2. Switch Extractor to Scene Reconstruct mode
  await reconModeBtn.click();
  await expect(reconModeBtn).toHaveClass(/active/);
  await expect(camModeBtn).not.toHaveClass(/active/);
  await expect(reconPanel).not.toHaveAttribute("hidden");

  // Check provider select is populated from capabilities
  const providerSelect = extractorHost.locator('[data-role="reconstruction-provider"]');
  await expect(providerSelect).toHaveValue("fake_provider");

  // Check open in Director is initially disabled
  const openDirectorBtn = extractorHost.locator('[data-role="reconstruction-open-director"]');
  await expect(openDirectorBtn).toBeDisabled();

  // 3. Press Run Reconstruction -- it enqueues a partial ComfyUI execution
  //    (no job scheduler). The solved scene comes back through the Extractor's
  //    executed() envelope, which we inject here the way ComfyUI would.
  const runBtn = extractorHost.locator('[data-role="reconstruction-run"]');
  await runBtn.click();

  await page.evaluate(() => {
    const ui = window.omnicamExtractor.__majoorOmniCamExtractor;
    const motionScene = {
      version: 1,
      timeline: { duration_seconds: 5.0, authoring_fps: 24.0 },
      canvas: { width: 1280, height: 720 },
      cameras: [{
        id: "camera_1", name: "Camera 1",
        camera: { position: [0, 1.5, 3], target: [0, 1.5, 0], fov: 53.0 },
        keyframes: [{ frame: 0, camera: { position: [0, 1.5, 3], target: [0, 1.5, 0], fov: 53.0 } }],
      }],
      active_camera_id: "camera_1",
      playblast_camera_id: "camera_1",
      objects: [
        {
          id: "recon_environment", type: "glb", name: "Environment Proxy",
          position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1],
          material_mode: "textured", keyframes: [], enabled: true, locked: true,
          asset: "majoor_omnicam/reconstruction/abc123/environment.glb [input]",
          reconstruction: {
            version: 1, role: "environment", provider: "fake_provider",
            source_kind: "single_image", confidence: 0.85,
            geometry: { kind: "depth_mesh", triangle_count: 5000, textured: true },
          },
        },
        {
          id: "recon_ground", type: "ground", name: "Ground",
          position: [0, 0, 0], rotation: [0, 0, 0], size: [10, 0.1, 10],
          material_mode: "checker", keyframes: [], enabled: true, locked: true,
          reconstruction: {
            version: 1, role: "ground", provider: "fake_provider",
            source_kind: "single_image", confidence: 0.9,
            plane: { normal: [0, 1, 0], offset: 0, inlier_ratio: 0.95 },
          },
        },
      ],
      motion_layers: [], cuts: [],
      metadata: { reconstruction: { provider: "fake_provider", mode: "geometry", warnings: ["Low texture contrast detected in corner."] } },
    };
    ui.executed({
      text: [JSON.stringify({
        kind: "omnicam_extractor_result_v2",
        mode: "scene_reconstruct",
        fingerprint: "recon-fp-1",
        motion_scene: motionScene,
        solver_coverage: 0.88,
        report: "OmniCam Reconstruction [depth_mesh]",
        source: { kind: "annotated_input", value: "test_room.png [input]" },
        reconstruction: {
          provider: "fake_provider",
          recon_mode: "depth_mesh",
          triangle_count: 5000,
          warnings: ["Low texture contrast detected in corner."],
          summary: {
            provider: "fake_provider", triangle_count: 5000,
            camera_fov_x: 53.0, confidence: 0.85, has_ground: true,
          },
        },
      })],
    });
  });

  // 4. The summary box shows the solved scene's detail.
  const summaryBox = extractorHost.locator('[data-role="reconstruction-summary"]');
  await expect(summaryBox).not.toHaveAttribute("hidden", { timeout: 10_000 });

  // Summary content assertions
  await expect(summaryBox).toContainText(/5[\s\u202f,.]?000/);
  await expect(summaryBox).toContainText("53");

  // Warnings content assertions
  const warningsBox = extractorHost.locator('[data-role="reconstruction-warnings"]');
  await expect(warningsBox).not.toHaveAttribute("hidden");
  await expect(warningsBox).toContainText("Low texture contrast detected in corner.");

  // Open in Director should now be enabled
  await expect(openDirectorBtn).toBeEnabled();

  // 5. Click OPEN IN DIRECTOR
  await openDirectorBtn.click();

  // 6. Verify Director receives Environment Proxy and Ground, both locked
  const directorObjects = directorHost.locator('[data-role="objects"]');
  const envRow = directorObjects.locator('[data-object-id="recon_environment"]');
  const groundRow = directorObjects.locator('[data-object-id="recon_ground"]');

  await expect(envRow).toBeVisible();
  await expect(groundRow).toBeVisible();

  // Check lock icons in outliner rows
  await expect(envRow.locator(".pi-lock")).toBeAttached();
  await expect(groundRow.locator(".pi-lock")).toBeAttached();

  // 7. Select Environment Proxy and inspect badges
  await envRow.click();

  const inspector = directorHost.locator('[data-role="object-panel"]');
  await expect(inspector).toBeVisible();

  const badge = inspector.locator('[data-role="object-recon-badge"]');
  await expect(badge).toBeVisible();
  await expect(badge).toContainText("High");
  await expect(badge).toContainText("85%");

  // Check lock toggle button in inspector
  const lockToggleBtn = inspector.locator('[data-role="object-lock-toggle"]');
  await expect(lockToggleBtn).toHaveClass(/locked/);
  await expect(lockToggleBtn.locator(".pi-lock")).toBeAttached();

  // 8. Unlock object and transform it
  await lockToggleBtn.click();
  await expect(lockToggleBtn).not.toHaveClass(/locked/);
  await expect(lockToggleBtn.locator(".pi-lock-open")).toBeAttached();

  // Object can now be edited
  const posXInput = inspector.locator('[data-role="object-x"]');
  await posXInput.fill("4.5");
  await posXInput.dispatchEvent("change");

  const posAfter = await page.evaluate(() => {
    const dir = window.omnicamDirector.__majoorOmniCam;
    const obj = dir.state.objects.find((o) => o.id === "recon_environment");
    return obj?.position?.[0];
  });
  expect(posAfter).toBe(4.5);

  // 9. Workflow reload asset registration check
  const assetUrl = await page.evaluate(() => {
    const dir = window.omnicamDirector.__majoorOmniCam;
    return dir.modelUrlsById.get("recon_environment");
  });
  expect(decodeURIComponent(assetUrl)).toContain("majoor_omnicam/reconstruction/abc123");
  expect(assetUrl).toContain("environment.glb");

  // 10. Regression: switch back to camera_track mode
  await camModeBtn.click();
  await expect(camModeBtn).toHaveClass(/active/);
  await expect(reconModeBtn).not.toHaveClass(/active/);
  await expect(reconPanel).toHaveAttribute("hidden", "");

  // Camera track panel stage is visible and unharmed
  const stage = extractorHost.locator('[data-role="stage"]');
  await expect(stage).toBeVisible();
});

test("Scene Reconstruct mode restores correctly after a workflow reload", async ({ page }) => {
  // The extract_mode widget was saved as scene_reconstruct in a previous
  // session; the node must come up showing that, not silently reset the
  // visible UI to Camera Track while the backend widget stays
  // scene_reconstruct underneath it.
  await page.goto("/tests/frontend/scene-reconstruction-mount.html?mode=scene_reconstruct");
  await expect(page.locator("#status")).toHaveText("ready", { timeout: 20_000 });

  const extractorHost = page.locator("#extractor-host");
  const camModeBtn = extractorHost.locator('[data-role="extract-mode-camera"]');
  const reconModeBtn = extractorHost.locator('[data-role="extract-mode-reconstruct"]');
  const reconPanel = extractorHost.locator('[data-role="reconstruction-panel"]');

  // No click happened -- this is what the node shows on its own at load.
  await expect(reconModeBtn).toHaveClass(/active/);
  await expect(camModeBtn).not.toHaveClass(/active/);
  await expect(reconPanel).not.toHaveAttribute("hidden");

  // The widget itself was never rewritten (no unnecessary dirtying).
  const widgetValue = await page.evaluate(() => window.omnicamExtractor.widgets.find((w) => w.name === "extract_mode").value);
  expect(widgetValue).toBe("scene_reconstruct");
});

test("Result modes: Blockout reveals the semantic controls, Depth Mesh hides them", async ({ page }) => {
  await page.goto("/tests/frontend/scene-reconstruction-mount.html?mode=scene_reconstruct");
  await expect(page.locator("#status")).toHaveText("ready", { timeout: 20_000 });

  const host = page.locator("#extractor-host");
  const resultSelect = host.locator('[data-role="reconstruction-mode"]');
  // The four current Result modes are present (legacy geometry/layout gone).
  await expect(resultSelect.locator("option")).toHaveText([
    "Depth Mesh",
    "Blockout",
    "Hybrid",
    "Scan",
  ]);

  const semanticRow = host.locator('[data-role="reconstruction-semantic-row"]');
  const labelsRow = host.locator('[data-role="reconstruction-labels-row"]');

  // Depth Mesh: no object/label controls.
  await resultSelect.selectOption("depth_mesh");
  await resultSelect.dispatchEvent("change");
  await expect(semanticRow).toBeHidden();
  await expect(labelsRow).toBeHidden();

  // Blockout: segmentation provider + max objects + completion + labels appear.
  await resultSelect.selectOption("blockout");
  await resultSelect.dispatchEvent("change");
  await expect(semanticRow).toBeVisible();
  await expect(labelsRow).toBeVisible();
  await expect(host.locator('[data-role="reconstruction-segmentation"]')).toBeVisible();
  await expect(host.locator('[data-role="reconstruction-completion-policy"]')).toBeVisible();
  await expect(host.locator('[data-role="reconstruction-max-objects"]')).toBeVisible();
});

test("capabilities endpoint exposes segmentation + completion so SAM3D reads as unavailable", async ({ page }) => {
  await page.goto("/tests/frontend/scene-reconstruction-mount.html?mode=scene_reconstruct");
  await expect(page.locator("#status")).toHaveText("ready", { timeout: 20_000 });

  const caps = await page.evaluate(async () => {
    const { api } = await import("/tests/frontend/stubs/api.js");
    const resp = await api.fetchApi("/majoor/omnicam/reconstruction/capabilities");
    return resp.json ? resp.json() : resp;
  });
  expect(caps.version).toBe(2);
  const sam3d = caps.completion.find((c) => c.provider_id === "sam3d_objects");
  expect(sam3d.available).toBe(false);
  expect(sam3d.reason).toMatch(/32\s*GB/i);
  expect(caps.segmentation.some((s) => s.provider_id === "comfy_sam3" && s.available)).toBe(true);
});
