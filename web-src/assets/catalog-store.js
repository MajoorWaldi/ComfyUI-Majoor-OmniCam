// In-memory Asset Browser state: one loaded, filtered, paginated page of the
// catalog plus a tiny observer so the panel can re-render on change. Frame-
// work-free; the panel calls `subscribe`. All network goes through the injected
// api client (web-src/assets/api.js) so this is node-testable with a fake.

import { normalizeFilter } from "./filters.js";

const DEFAULT_LIMIT = 60;

export function createCatalogStore(apiClient) {
  const listeners = new Set();
  const state = {
    items: [],
    byId: new Map(),
    kinds: {},
    total: 0,
    offset: 0,
    limit: DEFAULT_LIMIT,
    filter: normalizeFilter({}),
    loading: false,
    error: null,
    loaded: false,
  };

  const notify = () => {
    for (const fn of listeners) fn(state);
  };

  const indexItems = () => {
    state.byId = new Map(state.items.map((item) => [item.id, item]));
  };

  async function run(work) {
    state.loading = true;
    state.error = null;
    notify();
    try {
      await work();
    } catch (error) {
      state.error = { code: error.code || "REQUEST_FAILED", message: error.message || String(error) };
    } finally {
      state.loading = false;
      notify();
    }
  }

  return {
    get state() {
      return state;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    get(id) {
      return state.byId.get(id) || null;
    },
    setFilter(partial) {
      state.filter = normalizeFilter({ ...state.filter, ...partial });
      state.offset = 0;
      return this.refresh();
    },
    refresh() {
      return run(async () => {
        const page = await apiClient.list({ ...state.filter, offset: 0, limit: state.limit });
        state.items = Array.isArray(page.items) ? page.items : [];
        state.total = Number(page.total) || state.items.length;
        state.kinds = page.kinds || {};
        state.offset = state.items.length;
        state.loaded = true;
        indexItems();
      });
    },
    loadMore() {
      if (state.loading || state.items.length >= state.total) return Promise.resolve();
      return run(async () => {
        const page = await apiClient.list({ ...state.filter, offset: state.offset, limit: state.limit });
        const more = Array.isArray(page.items) ? page.items : [];
        state.items = [...state.items, ...more];
        state.total = Number(page.total) || state.items.length;
        state.offset = state.items.length;
        indexItems();
      });
    },
    /** Reflect a register/patch result locally without a full refetch. */
    upsert(definition) {
      if (!definition || !definition.id) return;
      const index = state.items.findIndex((item) => item.id === definition.id);
      if (index >= 0) state.items[index] = definition;
      else state.items = [definition, ...state.items];
      state.total = Math.max(state.total, state.items.length);
      indexItems();
      notify();
    },
    removeLocal(assetId) {
      const before = state.items.length;
      state.items = state.items.filter((item) => item.id !== assetId);
      if (state.items.length !== before) {
        state.total = Math.max(0, state.total - 1);
        state.offset = Math.max(0, state.offset - 1);
        indexItems();
        notify();
      }
    },
  };
}

export { DEFAULT_LIMIT };
