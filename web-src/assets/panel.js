// The Director Asset Browser panel: the ASSETS half of the left panel
// (design spec section 16). Renders a filtered thumbnail grid over the unified
// catalog; a double-click / Add resolves the catalog row here (no HTTP) and
// then instantiates it through the Semantic Director API -- the same surface
// the future Agent uses (design spec sections 2 and 28).
//
// Pure markup + intent helpers are exported for node tests; the imperative
// wiring (`createAssetBrowserPanel`) is exercised by tests/frontend's Playwright
// asset-browser spec.

import { t } from "../i18n.js";
import { annotatedAssetUrl } from "../shared/managed-assets.js";
import { createAssetLibraryApi } from "./api.js";
import { createCatalogStore } from "./catalog-store.js";
import { KIND_TABS } from "./filters.js";
import { rigStatus } from "./character/rig-profile.js";
import { assetReference, placementPoint } from "./instantiate.js";
import { createPreviewCache, createPreviewQueue } from "./preview-cache.js";
import { createThumbnailRenderer } from "./thumbnail-renderer.js";

// three.js + the model loaders are pulled in only when the ASSETS tab is first
// shown, so panel.js stays importable under node (markup/intent unit tests) and
// out of the eager chunk. Mirrors viewport.js's own imports.
async function loadThumbnailDeps() {
  const [THREE, gltf, fbx] = await Promise.all([
    import("../three-runtime.js"),
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/loaders/FBXLoader.js"),
  ]);
  return { THREE, GLTFLoader: gltf.GLTFLoader, FBXLoader: fbx.FBXLoader };
}

function dataUrlToBlob(dataUrl) {
  const [head, body] = String(dataUrl).split(",");
  const mime = /:(.*?);/.exec(head)?.[1] || "image/webp";
  const bytes = atob(body || "");
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) buffer[i] = bytes.charCodeAt(i);
  return new Blob([buffer], { type: mime });
}

export const ASSET_KIND_GLYPH = Object.freeze({
  character: "pi-user",
  prop: "pi-box",
  environment: "pi-building",
  vehicle: "pi-car",
  helper: "pi-compass",
});

const KIND_LABEL = {
  all: "All",
  character: "Characters",
  prop: "Props",
  environment: "Env",
  vehicle: "Vehicles",
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function kindTabsMarkup(activeKind, counts = {}) {
  return KIND_TABS.map((kind) => {
    const label = t(KIND_LABEL[kind] || kind);
    const count = kind === "all" ? "" : ` <span class="oc-asset-kind-n">${Number(counts[kind] || 0)}</span>`;
    const active = kind === (activeKind || "all") ? " active" : "";
    return `<button type="button" class="oc-asset-kind${active}" data-asset-kind="${kind}">${escapeHtml(label)}${count}</button>`;
  }).join("");
}

export function assetCardMarkup(definition, { selected = false, thumbUrl = "" } = {}) {
  const glyph = ASSET_KIND_GLYPH[definition.kind] || "pi-box";
  // A RIGGED badge means a COMPLETE OMNICAM_HUMANOID_V1 map, never a partial
  // one (design spec section 22).
  const rigged = definition.kind === "character" && rigStatus(definition.rig) === "rigged"
    ? `<span class="oc-asset-badge">${t("RIGGED")}</span>` : "";
  const media = thumbUrl
    ? `<img class="oc-asset-thumb" src="${escapeHtml(thumbUrl)}" alt="" loading="lazy">`
    : `<span class="oc-asset-thumb oc-asset-thumb--glyph"><i class="pi ${glyph}"></i></span>`;
  return `<button type="button" class="oc-asset-card${selected ? " selected" : ""}" data-asset-id="${escapeHtml(definition.id)}" title="${escapeHtml(definition.name)}">
    ${media}
    <span class="oc-asset-name">${escapeHtml(definition.name)}</span>
    <span class="oc-asset-kind-tag">${escapeHtml((definition.kind || "").toUpperCase())}</span>
    ${rigged}
  </button>`;
}

export function assetGridMarkup(definitions, { selectedId = "", thumbUrls = {} } = {}) {
  if (!definitions || !definitions.length) {
    return `<p class="oc-asset-empty">${t("No assets match this filter.")}</p>`;
  }
  return definitions
    .map((definition) => assetCardMarkup(definition, {
      selected: definition.id === selectedId,
      thumbUrl: thumbUrls[definition.id] || "",
    }))
    .join("");
}

/** Walk up from a click target to the asset-browser action it represents. */
export function resolveCardIntent(target) {
  if (!target || !target.closest) return null;
  const kindBtn = target.closest("[data-asset-kind]");
  if (kindBtn) return { action: "filter-kind", kind: kindBtn.dataset.assetKind };
  const viewBtn = target.closest("[data-asset-view]");
  if (viewBtn) return { action: "switch-view", view: viewBtn.dataset.assetView };
  const actBtn = target.closest("[data-asset-act]");
  if (actBtn) return { action: actBtn.dataset.assetAct };
  const card = target.closest("[data-asset-id]");
  if (card) return { action: "card", assetId: card.dataset.assetId };
  return null;
}

export function createAssetBrowserPanel(ui, options = {}) {
  const root = ui.root;
  const fetchApi = options.fetchApi
    || ((path, init) => (ui.api || ui.app?.api).fetchApi(path, init));
  const apiClient = options.apiClient || createAssetLibraryApi({ fetchApi });
  const store = options.store || createCatalogStore(apiClient);
  const previews = createPreviewCache();
  const previewQueue = options.previewQueue || createPreviewQueue();
  const api = ui.api || ui.app?.api || null;
  let thumbnailRenderer = options.thumbnailRenderer || null;
  let thumbnailRendererPromise = null;
  //: asset ids whose thumbnail render already failed -- do not retry every grid paint.
  const thumbFailed = new Set();

  function ensureThumbnailRenderer() {
    if (thumbnailRenderer) return Promise.resolve(thumbnailRenderer);
    if (!thumbnailRendererPromise) {
      thumbnailRendererPromise = loadThumbnailDeps()
        .then((deps) => (thumbnailRenderer = createThumbnailRenderer(deps)))
        .catch(() => (thumbnailRenderer = createThumbnailRenderer({})));
    }
    return thumbnailRendererPromise;
  }

  function assetModelUrl(item) {
    return annotatedAssetUrl(api, assetReference(item));
  }

  function persistedThumbUrl(item) {
    return item.thumbnail ? annotatedAssetUrl(api, `omnicam/library/${item.thumbnail} [input]`) : "";
  }

  /**
   * Lazily render a studio thumbnail for every catalog row that has neither a
   * cached preview nor a server-persisted one, one at a time, and POST the
   * result back so it survives a reload (design spec section 19 / plan §22).
   */
  function hydrateThumbnails() {
    for (const item of store.state.items) {
      if (item.kind === "helper" || !item.file) continue;
      if (previews.get(item.id) || item.thumbnail || thumbFailed.has(item.id)) continue;
      const url = assetModelUrl(item);
      if (!url) continue;
      previewQueue.enqueue(item.id, async () => {
        const renderer = await ensureThumbnailRenderer();
        const dataUrl = await renderer.render(url, item.format || "glb");
        if (!dataUrl) {
          thumbFailed.add(item.id);
          return;
        }
        previews.set(item.id, dataUrl);
        renderGrid();
        try {
          const saved = await apiClient.uploadThumbnail(item.id, dataUrlToBlob(dataUrl));
          if (saved?.asset) store.upsert(saved.asset);
        } catch {
          /* a persisted copy is a bonus; the in-memory preview already shows */
        }
      });
    }
  }

  const el = (role) => root.querySelector(`[data-role="${role}"]`);
  const panel = el("assets-panel");
  const grid = el("asset-grid");
  const kinds = el("asset-kinds");
  const search = el("asset-search");
  const status = el("asset-status");
  const fileInput = el("asset-import-file");
  const sceneTab = el("scene-tab");
  const assetsTab = el("assets-tab");

  let selectedId = "";
  let searchTimer = null;
  let firstOpen = true;

  function setStatus(message) {
    if (status) status.textContent = message || "";
  }

  function markSelected(id) {
    selectedId = id;
    if (!grid) return;
    for (const card of grid.querySelectorAll(".oc-asset-card")) {
      card.classList.toggle("selected", card.dataset.assetId === id);
    }
  }

  let rendering = false;

  function renderGrid() {
    if (kinds) kinds.innerHTML = kindTabsMarkup(store.state.filter.kind, store.state.kinds);
    if (grid) {
      const thumbUrls = {};
      for (const item of store.state.items) {
        const cached = previews.get(item.id) || persistedThumbUrl(item);
        if (cached) thumbUrls[item.id] = cached;
      }
      grid.innerHTML = assetGridMarkup(store.state.items, { selectedId, thumbUrls });
    }
    // Kick lazy thumbnail rendering once the grid markup exists. Guarded so the
    // re-render each finished job triggers does not recurse.
    if (!rendering) {
      rendering = true;
      try { hydrateThumbnails(); } finally { rendering = false; }
    }
    if (store.state.error) setStatus(store.state.error.message);
    else if (store.state.loading) setStatus(t("Loading assets..."));
    else setStatus(t("{n} of {total} assets")
      .replace("{n}", store.state.items.length)
      .replace("{total}", store.state.total));
  }

  function instantiate(definition) {
    if (!definition) return;
    const point = placementPoint({
      groundHit: ui.webgl?.orbitGroundHit?.(),
      orbitTarget: ui.webgl?.getOrbitTarget?.() || ui.camera?.target,
    });
    // The catalog row is already resolved (in the store) -- hand it straight to
    // the Semantic API, which compiles a deterministic object with no HTTP.
    const result = ui.directorApi?.execute({
      version: 1,
      id: `tx_instantiate_${Date.now().toString(36)}`,
      description: t("Add asset"),
      operations: [{ type: "asset.instantiate", asset: definition, point }],
    });
    if (!result?.ok) {
      ui.setStatus?.(result?.error?.message || t("Could not add the asset"));
      return;
    }
    const objectId = result.outcomes?.[0]?.objectId;
    if (objectId) {
      ui.selectedEntity = "object";
      ui.selectedObjectId = objectId;
      ui.selectedObjectIds = new Set([objectId]);
      ui.selectedKeyFrame = null;
    }
    ui.restoreAssets?.();
    ui.refreshObjects?.();
    ui.refreshInspector?.();
    ui.render?.();
    ui.setStatus?.(t("{name} added").replace("{name}", definition.name));
  }

  async function importModel(file) {
    if (!file) return;
    setStatus(t("Importing {name}...").replace("{name}", file.name));
    try {
      const result = await apiClient.importModel(file, { kind: "prop", name: file.name.replace(/\.[^.]+$/, "") });
      if (result.asset) store.upsert(result.asset);
      setStatus(t("Imported {name}").replace("{name}", result.asset?.name || file.name));
    } catch (error) {
      setStatus(error.message || t("Import failed"));
    }
  }

  function switchView(view) {
    const showAssets = view === "assets";
    if (sceneTab) sceneTab.hidden = showAssets;
    if (assetsTab) assetsTab.hidden = !showAssets;
    for (const tab of root.querySelectorAll("[data-asset-view]")) {
      tab.classList.toggle("active", tab.dataset.assetView === view);
    }
    if (showAssets && firstOpen) {
      firstOpen = false;
      store.refresh();
    }
  }

  function onClick(event) {
    const intent = resolveCardIntent(event.target);
    if (!intent) return;
    if (intent.action === "switch-view") return switchView(intent.view);
    if (intent.action === "filter-kind") return void store.setFilter({ kind: intent.kind });
    if (intent.action === "asset-add") {
      return instantiate(store.get(selectedId));
    }
    if (intent.action === "asset-import") {
      return fileInput?.click();
    }
    if (intent.action === "card") {
      markSelected(intent.assetId);
    }
  }

  function onDblClick(event) {
    const intent = resolveCardIntent(event.target);
    if (intent?.action === "card") instantiate(store.get(intent.assetId));
  }

  function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => store.setFilter({ search: search.value }), 200);
  }

  function onFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    importModel(file);
  }

  const unsubscribe = store.subscribe(renderGrid);
  panel?.addEventListener("click", onClick);
  panel?.addEventListener("dblclick", onDblClick);
  root.querySelector('[data-role="left-tabs"]')?.addEventListener("click", onClick);
  search?.addEventListener("input", onSearchInput);
  fileInput?.addEventListener("change", onFileChange);
  renderGrid();

  return {
    store,
    switchView,
    refresh: () => store.refresh(),
    dispose() {
      unsubscribe();
      clearTimeout(searchTimer);
      panel?.removeEventListener("click", onClick);
      panel?.removeEventListener("dblclick", onDblClick);
      root.querySelector('[data-role="left-tabs"]')?.removeEventListener("click", onClick);
      search?.removeEventListener("input", onSearchInput);
      fileInput?.removeEventListener("change", onFileChange);
      previewQueue.clear();
      thumbnailRenderer?.dispose?.();
      previews.clear();
    },
  };
}
