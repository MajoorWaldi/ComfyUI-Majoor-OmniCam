export class MonitorRefreshController {
  constructor(api, { delay = 250, onSnapshot = () => {}, onError = () => {} } = {}) {
    this.api = api; this.delay = delay; this.onSnapshot = onSnapshot; this.onError = onError; this.timer = null; this.abort = null; this.scheduledKey = "";
  }
  schedule(payload) { const key = JSON.stringify(payload); if (key === this.scheduledKey) return; this.scheduledKey = key; clearTimeout(this.timer); this.timer = setTimeout(() => this.refresh(payload), this.delay); }
  async refresh(payload) {
    this.abort?.abort(); this.abort = new AbortController();
    try {
      const response = await this.api.fetchApi("/majoor/omnicam/monitor/snapshot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: this.abort.signal });
      if (!response.ok) throw new Error((await response.text?.()) || `Monitor request failed (${response.status})`);
      const snapshot = await response.json(); this.onSnapshot(snapshot); return snapshot;
    } catch (error) {
      if (error?.name !== "AbortError") this.onError(error);
      return null;
    }
  }
  dispose() { clearTimeout(this.timer); this.timer = null; this.abort?.abort(); this.abort = null; this.scheduledKey = ""; }
}
