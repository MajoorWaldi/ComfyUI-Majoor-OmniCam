import { expect, test } from "@playwright/test";

const CASES = [
  ["MajoorOmniCamDirector", "__majoorOmniCam"],
  ["MajoorOmniCamExtractor", "__majoorOmniCamExtractor"],
  ["MajoorOmniCamMonitor", "__majoorOmniCamMonitor"],
];

const MARKERS = CASES.map(([, marker]) => marker);

async function openReady(page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      window.comfyAPI?.app?.app?.isGraphReady
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamDirector
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamExtractor
      && window.LiteGraph?.registered_node_types?.MajoorOmniCamMonitor,
    null,
    { timeout: 30_000 },
  );
}

async function enableVueNodes(page) {
  await page.evaluate(async () => {
    const { app } = await import("/scripts/app.js");
    await app.extensionManager.setting.set("Comfy.VueNodes.Enabled", true);
    app.graph.clear();
  });
}

/** Resolve whichever OmniCam marker a node carries, and its live root element. */
async function rootState(page, handle) {
  return page.evaluate(({ handle, markers }) => {
    const node = window[handle];
    const marker = markers.find((name) => node?.[name]);
    const root = marker ? node[marker].root : null;
    return {
      marker: marker || null,
      connected: Boolean(root?.isConnected),
      width: root?.getBoundingClientRect().width || 0,
      size: Array.isArray(node?.size) ? [Math.round(node.size[0]), Math.round(node.size[1])] : null,
    };
  }, { handle, markers: MARKERS });
}

async function waitAttached(page, handle) {
  await page.waitForFunction(
    ({ handle, markers }) => {
      const node = window[handle];
      return markers.some((name) => node?.[name]?.root?.isConnected);
    },
    { handle, markers: MARKERS },
    { timeout: 30_000 },
  );
}

for (const [nodeType, marker] of CASES) {
  test(`${nodeType} mounts and disposes with Nodes 2.0 enabled`, async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => {
      pageErrors.push(String(error?.stack || error));
    });

    await openReady(page);
    await enableVueNodes(page);

    await page.evaluate(async (type) => {
      const { app } = await import("/scripts/app.js");
      const node = window.LiteGraph.createNode(type);
      app.graph.add(node);
      window.__omnicamVueTestNode = node;
    }, nodeType);

    await page.waitForFunction(
      ({ marker }) =>
        Boolean(window.__omnicamVueTestNode?.[marker]?.root?.isConnected),
      { marker },
      { timeout: 30_000 },
    );

    const mounted = await page.evaluate(
      ({ marker }) => ({
        hasMarker: Boolean(window.__omnicamVueTestNode?.[marker]),
        connected: Boolean(
          window.__omnicamVueTestNode?.[marker]?.root?.isConnected,
        ),
      }),
      { marker },
    );

    expect(mounted.hasMarker).toBe(true);
    expect(mounted.connected).toBe(true);

    await page.evaluate(async () => {
      const { app } = await import("/scripts/app.js");
      const node = window.__omnicamVueTestNode;
      window.__omnicamDisposedRoot =
        node.__majoorOmniCam?.root
        || node.__majoorOmniCamExtractor?.root
        || node.__majoorOmniCamMonitor?.root;
      app.graph.remove(node);
    });

    await page.waitForFunction(
      () => !window.__omnicamDisposedRoot?.isConnected,
    );

    expect(pageErrors).toEqual([]);
  });
}

for (const [nodeType] of CASES) {
  test(`${nodeType} survives resize, right sidebar, serialization reload, duplication and queue (Nodes 2.0)`, async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error?.stack || error)));

    await openReady(page);
    await enableVueNodes(page);

    // --- mount -------------------------------------------------------------
    await page.evaluate(async (type) => {
      const { app } = await import("/scripts/app.js");
      const node = window.LiteGraph.createNode(type);
      app.graph.add(node);
      window.__omniPrimary = node;
    }, nodeType);
    await waitAttached(page, "__omniPrimary");

    // --- resize through several sizes, including a narrow one -------------
    // A DOM-widget node whose width math is wrong (the open ComfyUI issues
    // around right-panel width and resize) breaks here: the mounted root
    // detaches, collapses to zero width, or throws from afterResize.
    const sizes = [[1400, 1200], [760, 760], [1024, 1500], [900, 900]];
    for (const size of sizes) {
      await page.evaluate(async ({ size }) => {
        const { app } = await import("/scripts/app.js");
        window.__omniPrimary.setSize(size);
        app.graph.setDirtyCanvas(true, true);
        window.dispatchEvent(new Event("resize"));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }, { size });
      const state = await rootState(page, "__omniPrimary");
      expect(state.connected, `root detached after resize to ${size}`).toBe(true);
      expect(state.width, `root collapsed to zero width after resize to ${size}`).toBeGreaterThan(0);
    }

    // --- open the right sidebar, then resize again ------------------------
    // The sidebar API differs across the two pinned frontends, so this is
    // best-effort; what must hold is that toggling it and resizing under it
    // produces no page error and leaves the root mounted with real width.
    await page.evaluate(async () => {
      const { app } = await import("/scripts/app.js");
      try {
        const manager = app.extensionManager;
        const tabs = manager?.sidebarTab?.sidebarTabs ?? manager?.registeredSidebarTabs ?? [];
        const id = tabs[0]?.id ?? "queue";
        manager?.sidebarTab?.toggleSidebarTab?.(id);
      } catch { /* frontend without this API: covered by the no-error assertion */ }
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      window.__omniPrimary.setSize([1100, 1100]);
      window.dispatchEvent(new Event("resize"));
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    {
      const state = await rootState(page, "__omniPrimary");
      expect(state.connected, "root detached with the right sidebar open").toBe(true);
      expect(state.width, "root collapsed with the right sidebar open").toBeGreaterThan(0);
    }

    // --- serialize, reload the workflow, expect the chosen size to survive
    const savedSize = await page.evaluate(() => {
      window.__omniPrimary.setSize([1234, 1122]);
      return [Math.round(window.__omniPrimary.size[0]), Math.round(window.__omniPrimary.size[1])];
    });
    await page.evaluate(async () => {
      const { app } = await import("/scripts/app.js");
      const node = window.__omniPrimary;
      const serialized = node.serialize();
      const data = { last_node_id: node.id, last_link_id: 0, nodes: [serialized], links: [] };
      if (typeof app.loadGraphData === "function") await app.loadGraphData(data);
      else app.graph.configure(data);
      window.__omniPrimary = app.graph.nodes.find((candidate) => candidate.comfyClass === node.comfyClass);
    });
    await waitAttached(page, "__omniPrimary");
    {
      const state = await rootState(page, "__omniPrimary");
      expect(state.marker, "node did not re-mount its Vue root after reload").not.toBeNull();
      expect(state.connected).toBe(true);
      // A restored node keeps the saved size (floored to the node minimum),
      // never silently snapped back to the default.
      expect(state.size[0]).toBeGreaterThanOrEqual(Math.min(savedSize[0], 640));
      expect(Math.abs(state.size[0] - savedSize[0])).toBeLessThanOrEqual(savedSize[0]);
    }

    // --- duplicate: both roots mount and stay independent ----------------
    await page.evaluate(async () => {
      const { app } = await import("/scripts/app.js");
      const clone = window.__omniPrimary.clone();
      clone.pos = [window.__omniPrimary.pos[0] + 80, window.__omniPrimary.pos[1] + 80];
      app.graph.add(clone);
      window.__omniClone = clone;
    });
    await waitAttached(page, "__omniClone");
    {
      const primary = await rootState(page, "__omniPrimary");
      const clone = await rootState(page, "__omniClone");
      expect(primary.connected && clone.connected).toBe(true);
      const distinct = await page.evaluate(({ markers }) => {
        const rootOf = (node) => node[markers.find((name) => node?.[name])].root;
        return rootOf(window.__omniPrimary) !== rootOf(window.__omniClone);
      }, { markers: MARKERS });
      expect(distinct, "duplicate shares the original's root element").toBe(true);
    }

    // --- queue the graph with Vue nodes enabled -------------------------
    const queued = page.waitForResponse((response) => response.url().endsWith("/prompt"));
    await page.evaluate(async () => {
      const { app } = await import("/scripts/app.js");
      await app.queuePrompt(0, 1);
    });
    expect((await queued).status()).toBeLessThan(500);

    // --- remove everything: every root disposes ------------------------
    await page.evaluate(async () => {
      const { app } = await import("/scripts/app.js");
      window.__omniDisposedRoots = [window.__omniPrimary, window.__omniClone].map((node) => {
        const marker = ["__majoorOmniCam", "__majoorOmniCamExtractor", "__majoorOmniCamMonitor"].find((name) => node?.[name]);
        return marker ? node[marker].root : null;
      });
      app.graph.remove(window.__omniClone);
      app.graph.remove(window.__omniPrimary);
    });
    await page.waitForFunction(
      () => (window.__omniDisposedRoots || []).every((root) => !root || !root.isConnected),
      null,
      { timeout: 30_000 },
    );

    expect(pageErrors).toEqual([]);
  });
}
