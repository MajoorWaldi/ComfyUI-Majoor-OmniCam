// The reconstruction HTTP surface the panel still needs after the out-of-queue
// job scheduler was retired: provider capabilities and the disk cache. Scene
// reconstruction execution goes through the Extractor's partial queue now.
//
// Every call here is read-only or cache-only. It never queues a prompt and
// never talks to the retired reconstruction job routes.

async function readError(response) {
  try {
    const text = await response.text();
    if (!text) return `Request failed (${response.status})`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.error?.message) {
        return parsed.error.code
          ? `[${parsed.error.code}] ${parsed.error.message}`
          : parsed.error.message;
      }
      if (parsed?.message) return parsed.message;
    } catch {
      // not JSON
    }
    return text;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export class ReconstructionClient {
  constructor(api) {
    this.api = api;
  }

  async _request(path, { method = "GET", signal } = {}) {
    const options = { method };
    if (signal) options.signal = signal;
    const response = await this.api.fetchApi(path, options);
    if (!response.ok) throw new Error(await readError(response));
    return response.json();
  }

  /** Aggregated provider capabilities (which geometry / segmentation backends exist). */
  capabilities(options = {}) {
    return this._request("/majoor/omnicam/reconstruction/capabilities", options);
  }

  /** Delete every cached reconstruction (manifests, GLBs, source images) from disk. */
  clearCache() {
    return this._request("/majoor/omnicam/reconstruction/cache", { method: "DELETE" });
  }

  /** Delete one reconstruction's cache folder by fingerprint so a re-run recomputes it. */
  deleteCacheEntry(fingerprint) {
    const fp = encodeURIComponent(String(fingerprint || ""));
    return this._request(`/majoor/omnicam/reconstruction/cache/${fp}`, { method: "DELETE" });
  }
}
