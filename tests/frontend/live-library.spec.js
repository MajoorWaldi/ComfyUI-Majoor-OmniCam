// Live check against a running ComfyUI with the bootstrap starter library
// installed under <input>/omnicam/library/: every catalog asset must load,
// render a real mesh/skeleton in the viewport, and get a lazily-generated
// thumbnail persisted through POST /majoor/omnicam/library/thumbnail/{id}.
//
//   OMNICAM_LIVE_URL=http://127.0.0.1:8188 \
//   OMNICAM_LIVE_MATCH=live-library.spec.js \
//   npx playwright test --config playwright.live.config.mjs

import { expect, test } from "@playwright/test";

test.setTimeout(240_000);

async function mountDirector(page) {
  await page.goto("/");
  await page.waitForFunction(
    () => window.comfyAPI?.app?.app?.graph
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector,
    null,
    { timeout: 45_000 },
  );
  await page.waitForTimeout(1_500);
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    await app.extensionManager.setting.set("Comfy.VueNodes.Enabled", true);
    app.graph.clear();
    const node = window.LiteGraph.createNode("MajoorOmniCamDirector");
    node.pos = [0, 0];
    app.graph.add(node);
    window.omnicamLiveNode = node;
  });
  await page.waitForFunction(
    () => window.omnicamLiveNode?.__majoorOmniCam?.root?.isConnected
      && window.omnicamLiveNode.__majoorOmniCam.assetBrowser,
    null,
    { timeout: 45_000 },
  );
}

test("every starter-library asset loads in the viewport and gets a thumbnail", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  await mountDirector(page);

  // 1. open ASSETS and let the catalog load
  await page.locator('.majoor-omnicam [data-asset-view="assets"]').click();
  await page.waitForFunction(
    () => (window.omnicamLiveNode.__majoorOmniCam.assetBrowser.store.state.items || []).length > 0,
    null,
    { timeout: 20_000 },
  );

  const catalog = await page.evaluate(async () => {
    const api = window.comfyAPI.app.app.api;
    const res = await api.fetchApi("/majoor/omnicam/library?limit=500");
    const body = await res.json();
    return { items: body.items, total: body.total };
  });
  // the bootstrap-installed starter set: CC0, real file on disk. (Pre-existing
  // orphan `omnicam.legacy.*` rows whose files were never installed are not
  // part of this check -- they are reported, not asserted.)
  const userAssets = catalog.items.filter((a) => a.source === "user" && a.license?.spdx === "CC0-1.0" && a.file);
  const orphanLegacy = catalog.items.filter(
    (a) => a.id.startsWith("omnicam.legacy.") && a.source === "user",
  );
  if (orphanLegacy.length) {
    console.log(`note: ${orphanLegacy.length} orphan omnicam.legacy.* rows in the user catalog (files not installed)`);
  }
  expect(userAssets.length).toBeGreaterThanOrEqual(30);

  // 2. the grid renders one card per row on the current page
  const shown = await page.evaluate(
    () => window.omnicamLiveNode.__majoorOmniCam.assetBrowser.store.state.items.length,
  );
  const cardCount = await page.locator('.majoor-omnicam [data-role="asset-grid"] .oc-asset-card').count();
  expect(cardCount).toBe(shown);
  expect(catalog.total).toBeGreaterThanOrEqual(userAssets.length);

  // 3. instantiate every user asset and wait for the viewport to load it
  const loadResults = await page.evaluate(async (assets) => {
    const ui = window.omnicamLiveNode.__majoorOmniCam;
    const results = [];
    for (const def of assets) {
      const assetId = def.id;
      const out = ui.directorApi.execute({
        version: 1,
        id: `tx_${assetId}`,
        description: "live test instantiate",
        operations: [{ type: "asset.instantiate", asset: def, point: [0, 0, 0] }],
      });
      const objectId = out?.outcomes?.[0]?.objectId;
      if (!objectId) {
        results.push({ assetId, ok: false, reason: out?.error?.message || "compile failed" });
        continue;
      }
      ui.restoreAssets();
      const started = performance.now();
      let info = null;
      while (performance.now() - started < 12_000) {
        ui.render();
        info = ui.modelInfoById.get(objectId);
        const obj = ui.state.objects.find((o) => o.id === objectId);
        if (obj?.load_error) { info = { error: obj.load_error }; break; }
        if (info && !info.error) break;
        await new Promise((r) => setTimeout(r, 150));
      }
      const obj = ui.state.objects.find((o) => o.id === objectId);
      results.push({
        assetId,
        format: obj?.format,
        assetKind: obj?.asset_kind,
        ok: Boolean(info) && !info.error && (info.meshes > 0 || info.points > 0 || info.bones > 0),
        meshes: info?.meshes ?? 0,
        points: info?.points ?? 0,
        bones: info?.bones ?? 0,
        vertices: info?.vertices ?? 0,
        error: info?.error || obj?.load_error || null,
      });
      // keep the scene small: drop it before the next asset
      ui.state.objects = ui.state.objects.filter((o) => o.id !== objectId);
      ui.modelUrlsById.delete(objectId);
      ui.modelInfoById.delete(objectId);
      ui.restoreAssets();
    }
    return results;
  }, userAssets);

  const failures = loadResults.filter((r) => !r.ok);
  console.log(`viewport load: ${loadResults.length - failures.length}/${loadResults.length} ok`);
  for (const r of loadResults) {
    console.log(`  ${r.ok ? "OK " : "XX "} ${r.assetId} [${r.format}] meshes=${r.meshes} bones=${r.bones} verts=${r.vertices}${r.error ? " :: " + r.error : ""}`);
  }
  expect(failures, `assets that failed to load: ${JSON.stringify(failures, null, 2)}`).toEqual([]);

  // characters must carry a skeleton
  const chars = loadResults.filter((r) => r.assetKind === "character");
  expect(chars.length).toBeGreaterThanOrEqual(1);
  for (const c of chars) expect(c.bones, `${c.assetId} has no bones`).toBeGreaterThan(0);

  // 4. thumbnails: the panel renders them lazily and POSTs them back
  await page.waitForFunction(
    async () => {
      const api = window.comfyAPI.app.app.api;
      const res = await api.fetchApi("/majoor/omnicam/library?limit=500");
      const body = await res.json();
      const user = body.items.filter((a) => a.source === "user" && a.license?.spdx === "CC0-1.0" && a.file);
      window.__omnicamThumbs = user.filter((a) => a.thumbnail).length;
      return window.__omnicamThumbs >= Math.ceil(user.length * 0.9);
    },
    null,
    { timeout: 180_000, polling: 2_000 },
  );

  const thumbState = await page.evaluate(async () => {
    const api = window.comfyAPI.app.app.api;
    const res = await api.fetchApi("/majoor/omnicam/library?limit=500");
    const body = await res.json();
    const user = body.items.filter((a) => a.source === "user" && a.license?.spdx === "CC0-1.0" && a.file);
    const withThumb = user.filter((a) => a.thumbnail);
    // fetch one thumbnail image and confirm it is a real non-empty file
    let sample = null;
    if (withThumb[0]) {
      const t = withThumb[0];
      const url = api.apiURL(`/view?filename=${encodeURIComponent(t.thumbnail.split("/").pop())}&subfolder=omnicam/library/thumbnails&type=input`);
      const r = await fetch(url);
      sample = { id: t.id, status: r.status, bytes: Number(r.headers.get("content-length") || 0), type: r.headers.get("content-type") };
    }
    return { total: user.length, withThumb: withThumb.length, sample };
  });
  console.log(`thumbnails: ${thumbState.withThumb}/${thumbState.total} persisted; sample=${JSON.stringify(thumbState.sample)}`);
  expect(thumbState.withThumb).toBeGreaterThanOrEqual(Math.ceil(thumbState.total * 0.9));
  expect(thumbState.sample?.status).toBe(200);
  expect(thumbState.sample?.bytes).toBeGreaterThan(200);

  // the grid now shows <img> thumbs, not just glyphs
  const imgThumbs = await page.locator('.majoor-omnicam [data-role="asset-grid"] img.oc-asset-thumb').count();
  expect(imgThumbs).toBeGreaterThanOrEqual(Math.ceil(thumbState.total * 0.8));

  expect(pageErrors, `page errors:\n${pageErrors.join("\n")}`).toEqual([]);
});
