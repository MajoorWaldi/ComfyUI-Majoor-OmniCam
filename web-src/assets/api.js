// HTTP client for the unified asset catalog (omnicam/assets/routes.py).
//
// Every method takes plain data and returns parsed JSON. `fetchApi` is
// injectable so the catalog store can be unit-tested under node with a fake --
// the default lazily resolves ComfyUI's `api.fetchApi` and never imports the
// DOM at module load.

const LIBRARY_ROUTE = "/majoor/omnicam/library";

function defaultFetchApi(path, options) {
  const api =
    (typeof window !== "undefined" && (window.app?.api || window.__omnicamApi)) || null;
  if (!api?.fetchApi) throw new Error("ComfyUI API is unavailable");
  return api.fetchApi(path, options);
}

async function readJson(response) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (response.ok === false) {
    const code = body?.error?.code || `HTTP_${response.status || 0}`;
    const message = body?.error?.message || response.statusText || code;
    const error = new Error(message);
    error.code = code;
    error.status = response.status || 0;
    throw error;
  }
  return body ?? {};
}

function queryString(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const rendered = search.toString();
  return rendered ? `?${rendered}` : "";
}

export function createAssetLibraryApi({ fetchApi = defaultFetchApi } = {}) {
  const call = (path, options) => Promise.resolve(fetchApi(path, options)).then(readJson);

  return {
    list(filter = {}) {
      const { kind, tag, search, offset, limit } = filter;
      const params = { tag, search, offset, limit };
      if (kind && kind !== "all") params.kind = kind;
      return call(`${LIBRARY_ROUTE}${queryString(params)}`);
    },
    get(assetId) {
      return call(`${LIBRARY_ROUTE}/${encodeURIComponent(assetId)}`);
    },
    register(definition) {
      return call(`${LIBRARY_ROUTE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(definition),
      });
    },
    patch(assetId, patch) {
      return call(`${LIBRARY_ROUTE}/${encodeURIComponent(assetId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    },
    remove(assetId) {
      return call(`${LIBRARY_ROUTE}/${encodeURIComponent(assetId)}`, { method: "DELETE" });
    },
    importModel(file, meta = {}) {
      const form = new FormData();
      form.append("file", file, meta.filename || file.name || "model.glb");
      return call(`${LIBRARY_ROUTE}/import${queryString(meta)}`, { method: "POST", body: form });
    },
    uploadThumbnail(assetId, blob, filename = "thumb.webp") {
      const form = new FormData();
      form.append("file", blob, filename);
      return call(`${LIBRARY_ROUTE}/thumbnail/${encodeURIComponent(assetId)}`, {
        method: "POST",
        body: form,
      });
    },
    listPoses() {
      return call(`${LIBRARY_ROUTE}/poses`);
    },
    savePose(pose) {
      return call(`${LIBRARY_ROUTE}/poses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pose),
      });
    },
    deletePose(poseId) {
      return call(`${LIBRARY_ROUTE}/poses/${encodeURIComponent(poseId)}`, { method: "DELETE" });
    },
  };
}

export { LIBRARY_ROUTE };
