// HTTP client for scene reconstruction jobs.
//
// Every method here talks strictly to /majoor/omnicam/reconstruction
// It never touches queuePrompt or /prompt.

import { ACTIVE_STATES } from "./state.js";

const BASE = "/majoor/omnicam/reconstruction/jobs";

/** Best-effort cooperative cancellation when the panel is disposed. */
export function stopActiveReconstructionOnDispose(client, state = {}) {
  const jobId = String(state?.jobId || "");
  const jobState = String(state?.jobState || "");
  if (!jobId || !ACTIVE_STATES.has(jobState)) return false;
  void client.stopJob(jobId).catch(() => {});
  return true;
}

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
      // Not JSON, return text directly
    }
    return text;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export class ReconstructionJobClient {
  constructor(api, { clientId = "" } = {}) {
    this.api = api;
    this.clientId = clientId;
  }

  /** Session identity, so the server can verify client ownership. */
  identity() {
    return this.clientId || this.api?.clientId || this.api?.initialClientId || "";
  }

  _url(path) {
    const identity = this.identity();
    if (!identity) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}clientId=${encodeURIComponent(identity)}`;
  }

  async _request(path, { method = "GET", body, signal } = {}) {
    const options = { method };
    if (signal) options.signal = signal;
    if (body !== undefined) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }
    const response = await this.api.fetchApi(this._url(path), options);
    if (!response.ok) throw new Error(await readError(response));
    return response.json();
  }

  /** Query aggregated provider capabilities. */
  capabilities(options = {}) {
    return this._request("/majoor/omnicam/reconstruction/capabilities", options);
  }

  /** Delete every cached reconstruction (manifests, GLBs, source images) from disk. */
  clearCache() {
    return this._request("/majoor/omnicam/reconstruction/cache", { method: "DELETE" });
  }

  /** Delete just one reconstruction's cache folder, by fingerprint, so a
   *  re-run with the same settings recomputes it. Other results are untouched. */
  deleteCacheEntry(fingerprint) {
    const fp = encodeURIComponent(String(fingerprint || ""));
    return this._request(`/majoor/omnicam/reconstruction/cache/${fp}`, { method: "DELETE" });
  }

  startJob({ nodeId, source, settings, signal }) {
    return this._request(BASE, {
      method: "POST",
      signal,
      body: {
        node_id: String(nodeId),
        client_id: this.identity(),
        source,
        settings,
      },
    });
  }

  getJobStatus(jobId, options = {}) {
    return this._request(`${BASE}/${encodeURIComponent(jobId)}`, options);
  }

  stopJob(jobId, options = {}) {
    return this._request(`${BASE}/${encodeURIComponent(jobId)}/stop`, { method: "POST", ...options });
  }

  getJobResult(jobId, options = {}) {
    return this._request(`${BASE}/${encodeURIComponent(jobId)}/result`, options);
  }

  deleteJob(jobId) {
    return this._request(`${BASE}/${encodeURIComponent(jobId)}`, { method: "DELETE" });
  }

  // Aliases matching plan Section 28
  start(args) {
    return this.startJob(args);
  }

  status(jobId, options = {}) {
    return this.getJobStatus(jobId, options);
  }

  stop(jobId, options = {}) {
    return this.stopJob(jobId, options);
  }

  result(jobId, options = {}) {
    return this.getJobResult(jobId, options);
  }

  remove(jobId) {
    return this.deleteJob(jobId);
  }
}
