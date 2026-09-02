// Debounced, cancellable live preflight requests.
//
// A live preview runs on every Director keystroke -- moving a key, changing
// fps -- so two things matter more here than in an ordinary fetch: never fire
// faster than the user can meaningfully see a result (the debounce), and
// never let a stale in-flight request's answer land after a newer one's (the
// AbortController). Both existed in the pre-MotionScene Monitor and were
// dropped in the profiles refactor along with the adapter-era snapshot
// endpoint they called; this rebuilds the same idea against the endpoint that
// replaced it.

export class MonitorRefreshController {
  constructor(api, {
    delay = 250,
    endpoint = "/majoor/omnicam/monitor/live_preflight",
    onSnapshot = () => {},
    onError = () => {},
  } = {}) {
    this.api = api;
    this.delay = delay;
    this.endpoint = endpoint;
    this.onSnapshot = onSnapshot;
    this.onError = onError;
    this.timer = null;
    this.abort = null;
    this.scheduledKey = "";
  }

  /** No-ops when this exact payload is already scheduled or was just sent. */
  schedule(payload) {
    const key = JSON.stringify(payload);
    if (key === this.scheduledKey) return;
    this.scheduledKey = key;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.refresh(payload), this.delay);
  }

  async refresh(payload) {
    this.abort?.abort();
    this.abort = new AbortController();
    try {
      const response = await this.api.fetchApi(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: this.abort.signal,
      });
      if (!response.ok) {
        throw new Error((await response.text?.()) || `Monitor live preflight failed (${response.status})`);
      }
      const snapshot = await response.json();
      this.onSnapshot(snapshot);
      return snapshot;
    } catch (error) {
      if (error?.name !== "AbortError") this.onError(error);
      return null;
    }
  }

  dispose() {
    clearTimeout(this.timer);
    this.timer = null;
    this.abort?.abort();
    this.abort = null;
    this.scheduledKey = "";
  }
}
