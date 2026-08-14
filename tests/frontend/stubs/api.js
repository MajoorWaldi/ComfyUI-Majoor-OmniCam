// Minimal ComfyUI api stub for Director mount tests.
export const api = {
  apiURL: (path) => path,
  fetchApi: async () => ({ ok: true, json: async () => ({ capabilities: [], diagnostic: { issues: [] } }) }),
  addEventListener() {},
  removeEventListener() {},
};
