// HTTP client for interactive solves.
//
// Every method here talks to /majoor/omnicam/extractor/jobs and nothing else.
// In particular there is no reference to queuePrompt, /prompt, or any graph
// execution API: pressing TRACK must never enqueue a render, and the surest way
// to guarantee that is for this file to have no way to do it.

const BASE = "/majoor/omnicam/extractor/jobs";
const ACTIVE_STATES = new Set([
  "IDLE", "PREPARING", "TRACKING", "SOLVING", "REFINING", "STOPPING",
]);

/** Best-effort cooperative cancellation when the panel can no longer own a job. */
export function stopActiveSolveOnDispose(client, state = {}) {
  const jobId = String(state.jobId || "");
  if (!jobId || !ACTIVE_STATES.has(String(state.solveState || ""))) return false;
  void client.stopSolve(jobId).catch(() => {});
  return true;
}

async function readError(response) {
  try {
    const text = await response.text();
    return text || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export class SolveJobClient {
  constructor(api, { clientId = "" } = {}) {
    this.api = api;
    this.clientId = clientId;
    this.abort = null;
  }

  /** Session identity, so the server can refuse another tab's job. */
  identity() {
    return this.clientId || this.api?.clientId || this.api?.initialClientId || "";
  }

  _url(path) {
    const identity = this.identity();
    return identity ? `${path}?clientId=${encodeURIComponent(identity)}` : path;
  }

  async _request(path, { method = "GET", body } = {}) {
    const options = { method };
    if (body !== undefined) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }
    const response = await this.api.fetchApi(this._url(path), options);
    if (!response.ok) throw new Error(await readError(response));
    return response.json();
  }

  /** Measure a source before solving, so the transport has a real range. */
  describeSource(source) {
    return this._request("/majoor/omnicam/extractor/source", { method: "POST", body: { source } });
  }

  startSolve({ nodeId, source, settings }) {
    return this._request(BASE, {
      method: "POST",
      body: { node_id: String(nodeId), client_id: this.identity(), source, settings },
    });
  }

  getSolveStatus(jobId) {
    return this._request(`${BASE}/${encodeURIComponent(jobId)}`);
  }

  stopSolve(jobId) {
    return this._request(`${BASE}/${encodeURIComponent(jobId)}/stop`, { method: "POST" });
  }

  refineSolve(jobId, settings) {
    return this._request(`${BASE}/${encodeURIComponent(jobId)}/refine`, {
      method: "POST",
      body: { settings },
    });
  }

  getSolveResult(jobId) {
    return this._request(`${BASE}/${encodeURIComponent(jobId)}/result`);
  }

  deleteSolve(jobId) {
    return this._request(`${BASE}/${encodeURIComponent(jobId)}`, { method: "DELETE" });
  }

  /** Upload a video into the managed Extractor source folder. */
  async uploadSource(file) {
    const body = new FormData();
    body.append("file", file, file.name);
    const response = await this.api.fetchApi("/majoor/omnicam/upload_extractor_source", {
      method: "POST",
      body,
    });
    if (!response.ok) throw new Error(await readError(response));
    return response.json();
  }
}
