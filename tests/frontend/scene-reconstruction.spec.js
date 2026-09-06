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

  // 3. Click Run Reconstruction
  const runBtn = extractorHost.locator('[data-role="reconstruction-run"]');
  await runBtn.click();

  // 4. Progress advances and finishes
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
