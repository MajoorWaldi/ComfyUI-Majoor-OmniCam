import "../../scripts/app.js";
import { api as N } from "../../scripts/api.js";
import { d as ut, u as ht, l as pt, S as mt } from "./chunk-CYXHK_as.js";
import { m as ft, g as ot, n as bt, L as gt, h as vt, S as H, r as yt, i as xt, j as wt, k as kt, p as St, l as Et, F as Ct } from "./chunk-D8bk9N8J.js";
import { M as Mt } from "./chunk-Jm0vAvYx.js";
import { a0 as Tt, a1 as Nt } from "./chunk-BRMs2FDi.js";
function _t(r) {
  return r?.name === "AbortError" || r?.code === 20;
}
class At {
  constructor() {
    this.controller = typeof AbortController == "function" ? new AbortController() : null, this.disposed = !1;
  }
  /** The signal to pass to fetch, or undefined where AbortController is absent. */
  get signal() {
    return this.controller?.signal;
  }
  get aborted() {
    return !!this.controller?.signal?.aborted;
  }
  /** Merge the signal into fetch options without clobbering what the caller set. */
  options(t = {}) {
    return this.signal ? { ...t, signal: this.signal } : { ...t };
  }
  /**
   * Run a request, returning `undefined` when it was cancelled rather than throwing.
   *
   * Real failures still propagate: a dead network while the panel is alive is a
   * genuine error the caller has to see.
   */
  async run(t) {
    try {
      const e = await t(this.signal);
      return this.aborted ? void 0 : e;
    } catch (e) {
      if (this.aborted || _t(e)) return;
      throw e;
    }
  }
  dispose() {
    this.disposed || (this.disposed = !0, Rt(), this.controller?.abort());
  }
}
function Rt() {
  const r = typeof globalThis == "object" ? globalThis : null;
  if (!r) return;
  const t = r.__majoorOmniCamIntentionalAborts, e = { at: Date.now() };
  if (Array.isArray(t)) {
    t.length >= 64 && t.shift(), t.push(e);
    return;
  }
  r.__majoorOmniCamIntentionalAborts = [e];
}
function It(r, t) {
  const e = !!r.upstreamPreviewActive, a = r.sourceViewer?.mode || "native", o = t ? e ? "upstream" : a === "fallback" ? "fallback" : "native" : "none", i = (s, n) => {
    const c = r.$(s);
    c && (c.hidden = !n);
  };
  return i("source-video", o === "native"), i("fallback-preview", o === "fallback"), i("upstream-preview", o === "upstream"), o;
}
function Ft(r, t) {
  const e = r.$("tracking-overlay"), a = Math.round(Number(t?.width) || 0), o = Math.round(Number(t?.height) || 0);
  return !e || a < 1 || o < 1 || e.width === a && e.height === o ? !1 : (e.width = a, e.height = o, r.overlay.draw(), !0);
}
async function $t(r, t) {
  const e = r.$("upstream-preview");
  if (!e) return;
  const a = t.available ? null : t.previewMedia;
  r.upstreamPreviewActive = a ? await ut(a, e, 960) : !1, r.disposed || r.render();
}
const Lt = {
  job: "majoor.omnicam.extractor.job",
  progress: "majoor.omnicam.extractor.progress",
  pose: "majoor.omnicam.extractor.pose",
  quality: "majoor.omnicam.extractor.quality",
  features: "majoor.omnicam.extractor.features",
  completed: "majoor.omnicam.extractor.completed",
  failed: "majoor.omnicam.extractor.failed"
};
class Pt {
  /**
   * @param api ComfyUI api object
   * @param handlers one callback per SOLVE_EVENTS key
   * @param match ({job_id, node_id}) => boolean, deciding what belongs here
   */
  constructor(t, e = {}, a = () => !0) {
    this.api = t, this.match = a, this.bound = [];
    for (const [o, i] of Object.entries(Lt)) {
      const s = e[o];
      if (typeof s != "function") continue;
      const n = (c) => {
        const l = c?.detail ?? c;
        !l || !this.match(l) || s(l);
      };
      t.addEventListener?.(i, n), this.bound.push([i, n]);
    }
  }
  dispose() {
    for (const [t, e] of this.bound.splice(0))
      this.api?.removeEventListener?.(t, e);
  }
}
function Ot(r) {
  return (t) => {
    const e = r() || {};
    return !(e.jobId && t.job_id && t.job_id !== e.jobId || t.node_id != null && String(t.node_id) !== String(e.nodeId));
  };
}
const M = "/majoor/omnicam/extractor/jobs", Dt = /* @__PURE__ */ new Set([
  "IDLE",
  "PREPARING",
  "TRACKING",
  "SOLVING",
  "REFINING",
  "STOPPING"
]);
function Vt(r, t = {}) {
  const e = String(t.jobId || "");
  return !e || !Dt.has(String(t.solveState || "")) ? !1 : (r.stopSolve(e).catch(() => {
  }), !0);
}
async function B(r) {
  try {
    return await r.text() || `Request failed (${r.status})`;
  } catch {
    return `Request failed (${r.status})`;
  }
}
class jt {
  constructor(t, { clientId: e = "" } = {}) {
    this.api = t, this.clientId = e, this.abort = null;
  }
  /** Session identity, so the server can refuse another tab's job. */
  identity() {
    return this.clientId || this.api?.clientId || this.api?.initialClientId || "";
  }
  _url(t) {
    const e = this.identity();
    return e ? `${t}?clientId=${encodeURIComponent(e)}` : t;
  }
  async _request(t, { method: e = "GET", body: a } = {}) {
    const o = { method: e };
    a !== void 0 && (o.headers = { "Content-Type": "application/json" }, o.body = JSON.stringify(a));
    const i = await this.api.fetchApi(this._url(t), o);
    if (!i.ok) throw new Error(await B(i));
    return i.json();
  }
  /** Measure a source before solving, so the transport has a real range. */
  describeSource(t) {
    return this._request("/majoor/omnicam/extractor/source", { method: "POST", body: { source: t } });
  }
  startSolve({ nodeId: t, source: e, settings: a }) {
    return this._request(M, {
      method: "POST",
      body: { node_id: String(t), client_id: this.identity(), source: e, settings: a }
    });
  }
  getSolveStatus(t) {
    return this._request(`${M}/${encodeURIComponent(t)}`);
  }
  stopSolve(t) {
    return this._request(`${M}/${encodeURIComponent(t)}/stop`, { method: "POST" });
  }
  refineSolve(t, e) {
    return this._request(`${M}/${encodeURIComponent(t)}/refine`, {
      method: "POST",
      body: { settings: e }
    });
  }
  getSolveResult(t) {
    return this._request(`${M}/${encodeURIComponent(t)}/result`);
  }
  deleteSolve(t) {
    return this._request(`${M}/${encodeURIComponent(t)}`, { method: "DELETE" });
  }
  /** Upload a video into the managed Extractor source folder. */
  async uploadSource(t) {
    const e = new FormData();
    e.append("file", t, t.name);
    const a = await this.api.fetchApi("/majoor/omnicam/upload_extractor_source", {
      method: "POST",
      body: e
    });
    if (!a.ok) throw new Error(await B(a));
    return a.json();
  }
}
const qt = 200, K = {
  position_smoothing: 0.15,
  rotation_smoothing: 0.1,
  motion_scale: 1,
  normalize_origin: !0,
  trim_start_frame: 0,
  trim_end_frame: 0,
  global_rotation_xyzw: null,
  estimate_up: !1,
  spike_actions: {},
  simplify_keys: !0,
  position_tolerance: 0.01,
  rotation_tolerance_deg: 0.25
};
function O() {
  return { pitch: 0, yaw: 0, roll: 0 };
}
class Ut {
  constructor({ onRefine: t, delay: e = qt, setTimer: a, clearTimer: o } = {}) {
    this.settings = { ...K }, this.alignment = O(), this.onRefine = t || (() => {
    }), this.delay = e, this.setTimer = a || ((i, s) => setTimeout(i, s)), this.clearTimer = o || ((i) => clearTimeout(i)), this.timer = null, this.lastSent = "";
  }
  /** Merge a change and schedule a refine. Returns the merged settings. */
  update(t) {
    return this.settings = { ...this.settings, ...t }, this.schedule(), this.settings;
  }
  setAlignment(t) {
    return this.alignment = { ...this.alignment, ...t }, this.update({
      global_rotation_xyzw: Gt(this.alignment),
      estimate_up: !1
    });
  }
  /** Ask the server to derive the levelling rotation from the solve itself. */
  requestEstimatedUp() {
    return this.alignment = O(), this.update({ global_rotation_xyzw: null, estimate_up: !0 });
  }
  setSpikeAction(t, e) {
    const a = { ...this.settings.spike_actions };
    return e === "ignore" ? delete a[String(t)] : a[String(t)] = e, this.update({ spike_actions: a });
  }
  reset() {
    return this.settings = { ...K }, this.alignment = O(), this.schedule(), this.settings;
  }
  payload() {
    return { ...this.settings };
  }
  schedule() {
    this.clearTimer(this.timer), this.timer = this.setTimer(() => this.flush(), this.delay);
  }
  /** Send now, unless these exact settings were the last thing sent. */
  flush() {
    this.clearTimer(this.timer), this.timer = null;
    const t = JSON.stringify(this.settings);
    return t === this.lastSent ? null : (this.lastSent = t, this.onRefine(this.payload()));
  }
  dispose() {
    this.clearTimer(this.timer), this.timer = null;
  }
}
function Gt({ pitch: r = 0, yaw: t = 0, roll: e = 0 } = {}) {
  if (!r && !t && !e) return null;
  const [a, o, i] = [r, t, e].map((d) => (Number(d) || 0) * (Math.PI / 180) * 0.5), [s, n, c, l, h, p] = [
    Math.cos(a),
    Math.sin(a),
    Math.cos(o),
    Math.sin(o),
    Math.cos(i),
    Math.sin(i)
  ];
  return [
    n * c * h + s * l * p,
    s * l * h - n * c * p,
    s * c * p + n * l * h,
    s * c * h - n * l * p
  ];
}
class Ht {
  constructor({ maxFrames: t = 180 } = {}) {
    this.maxFrames = Math.max(1, Math.floor(Number(t) || 180)), this.frames = /* @__PURE__ */ new Map();
  }
  set(t, { points: e = [], vectors: a = [], state: o = "unknown" } = {}) {
    const i = Math.max(0, Math.floor(Number(t) || 0)), s = {
      frame: i,
      points: Array.isArray(e) ? e : [],
      vectors: Array.isArray(a) ? a : [],
      state: String(o || "unknown")
    };
    for (this.frames.delete(i), this.frames.set(i, s); this.frames.size > this.maxFrames; ) this.frames.delete(this.frames.keys().next().value);
    return s;
  }
  get(t) {
    return this.frames.get(Math.max(0, Math.floor(Number(t) || 0))) || null;
  }
  clear() {
    this.frames.clear();
  }
  dispose() {
    this.clear();
  }
}
function Wt(r, t) {
  const e = Math.max(0, Math.floor(Number(t) || 0) - 1);
  return Math.max(0, Math.min(e, Math.round(Number(r) || 0)));
}
function zt(r) {
  return ["manual", "transport", "timeline", "quality", "input"].includes(r);
}
class Bt {
  constructor({
    media: t = null,
    getViewer: e = () => null,
    showDiagnostics: a = () => {
    },
    dispatch: o = () => {
    },
    setFollow: i = () => {
    },
    onPlaybackState: s = () => {
    },
    frameCount: n = 0,
    fps: c = 24,
    loop: l = !1,
    requestAnimationFrame: h = globalThis.requestAnimationFrame?.bind(globalThis),
    cancelAnimationFrame: p = globalThis.cancelAnimationFrame?.bind(globalThis)
  } = {}) {
    this.media = t, this.getViewer = e, this.showDiagnostics = a, this.dispatch = o, this.setFollow = i, this.onPlaybackState = s, this.frameCount = Math.max(0, Math.floor(Number(n) || 0)), this.fps = Math.max(1, Number(c) || 24), this.loop = !!l, this.frame = 0, this.playing = !1, this.disposed = !1, this.animationFrame = null, this.playbackStartFrame = 0, this.playbackStartTime = null, this.requestAnimationFrame = h || (() => null), this.cancelAnimationFrame = p || (() => {
    });
  }
  setFrameCount(t) {
    const e = Math.max(0, Math.floor(Number(t) || 0));
    return e === this.frameCount ? this.frameCount : (this.frameCount = e, this.media?.setFrameCount?.(this.frameCount), this.dispatch({ type: "FRAME_COUNT", frameCount: this.frameCount }), this.frameCount || this.pause(), this.frameCount);
  }
  reconcileFrameCount(t) {
    const e = Number(t?.frame_count);
    return this.setFrameCount(Number.isFinite(e) ? e : this.frameCount);
  }
  setRate(t) {
    return this.fps = Math.max(1, Number(t) || 24), this.media?.setRate?.(this.fps), this.fps;
  }
  setLoop(t) {
    return this.loop = !!t, this.media?.setLoop?.(this.loop), this.loop;
  }
  seek(t, e = "manual") {
    if (this.disposed) return this.frame;
    const a = Wt(t, this.frameCount);
    return zt(e) && this.setFollow(!1), e !== "media" && this.media?.seekFrame?.(a), this.getViewer?.()?.setFrame?.(a), this.showDiagnostics(a), this.frame = a, this.dispatch({ type: "FRAME", frame: a }), e !== "playback" && (this.playbackStartFrame = a, this.playbackStartTime = null), a;
  }
  play() {
    return this.disposed || this.playing || this.frameCount < 1 ? !1 : (this.playing = !0, this.onPlaybackState(this.playing), this.playbackStartFrame = this.frame, this.playbackStartTime = null, this.schedule(), !0);
  }
  pause() {
    return this.playing ? (this.playing = !1, this.onPlaybackState(this.playing), this.playbackStartTime = null, this.animationFrame !== null && this.cancelAnimationFrame(this.animationFrame), this.animationFrame = null, this.media?.pause?.(), !0) : !1;
  }
  toggle() {
    return this.playing ? this.pause() : this.play();
  }
  schedule() {
    !this.playing || this.disposed || this.animationFrame !== null || (this.animationFrame = this.requestAnimationFrame((t) => this.tick(t)));
  }
  tick(t) {
    if (this.animationFrame = null, !this.playing || this.disposed) return;
    const e = Number(t) || 0;
    this.playbackStartTime === null && (this.playbackStartTime = e);
    const a = Math.max(0, e - this.playbackStartTime), o = Math.floor(a * this.fps / 1e3), i = this.frameCount;
    if (i < 1) {
      this.pause();
      return;
    }
    const s = Math.max(0, i - 1);
    let n = this.playbackStartFrame + o;
    if (n > s)
      if (this.loop && i > 0) n %= i;
      else {
        s !== this.frame && this.seek(s, "playback"), this.pause();
        return;
      }
    n !== this.frame && this.seek(n, "playback"), this.schedule();
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.pause(), this.media = null, this.getViewer = null, this.showDiagnostics = null, this.dispatch = null, this.setFollow = null, this.onPlaybackState = null);
  }
}
class _ extends Error {
}
function Kt(r, { track: t, state: e } = {}) {
  if (e !== "COMPLETED")
    throw new _("Only a completed solve can be applied to the Director.");
  const a = t?.keyframes;
  if (!Array.isArray(a) || !a.length)
    throw new _("This solve produced no camera keys to apply.");
  const o = String(t?.metadata?.extractor_fingerprint || "");
  if (!o)
    throw new _("This track carries no extractor fingerprint.");
  const i = ft(t);
  if (!i)
    throw new _("This solve cannot be wrapped in a canonical motion scene.");
  ot(r, {
    motionScene: i,
    fingerprint: o,
    solver_coverage: Number(t?.metadata?.solver_coverage ?? t?.metadata?.confidence) || 0
  });
  const s = bt(r);
  return { fingerprint: o, notified: s };
}
function Xt(r, t = "") {
  const e = Number(r?.code) || 0, a = t ? "" : " (no source URL was set)";
  switch (e) {
    case 1:
      return `Loading the footage was aborted${a}.`;
    case 2:
      return "The footage could not be fetched from ComfyUI. Is the file still in the input folder?";
    case 3:
      return "The browser could not decode this file. The solve can still read it -- this only affects the preview. Re-encode to H.264 MP4 to preview it here.";
    case 4:
      return "The browser cannot play this container or codec (H.265, ProRes and most AVI variants are common causes). The solve can still read it; only the preview is affected.";
    default:
      return `The footage could not be played${a}.`;
  }
}
class Yt extends Mt {
  constructor(t, {
    fps: e = 24,
    onFrame: a = () => {
    },
    onMetadata: o = () => {
    },
    onError: i = () => {
    },
    onMode: s = () => {
    },
    fallbackViewer: n = null
  } = {}) {
    super(t, {
      fps: e,
      durationFrames: 1,
      onFrame: (c) => this.reportFrame(c),
      onMetadata: o,
      onError: (c) => this.handleMediaError(c),
      errorMessage: Xt,
      loop: !0,
      muted: !0
    }), this.frameCount = 0, this.onExternalFrame = a, this.ignoredFrame = null, this.follow = !0, this.mode = "native", this.source = null, this.onMode = s, this.fallbackViewer = n, this.onPlaybackError = i;
  }
  setSource(t, { source: e, ...a } = {}) {
    const o = e || null, i = this.source?.kind !== o?.kind || this.source?.value !== o?.value, s = super.setSource(t, a);
    return s || i ? (this.source = o, this.fallbackViewer?.clear?.(), this.setMode("native")) : o && (this.source = o), s;
  }
  setMode(t) {
    const e = ["native", "fallback", "error"].includes(t) ? t : "error";
    return this.mode === e ? !1 : (this.mode = e, this.onMode(e), !0);
  }
  setRate(t) {
    return this.fps = Math.max(1, Number(t) || 24), this.fps;
  }
  setFrameCount(t) {
    return this.frameCount = Math.max(0, Math.round(Number(t) || 0)), this.durationFrames = Math.max(1, this.frameCount), this.frameCount;
  }
  handleMediaError(t) {
    const e = Number(this.video?.error?.code) || 0;
    if ((e === 2 || e === 3 || e === 4) && this.fallbackViewer && this.source) {
      this.setMode("fallback"), this.loadFallback(this.currentFrame(), t);
      return;
    }
    this.setMode("error"), this.onPlaybackError(t);
  }
  async loadFallback(t, e = "") {
    try {
      return await this.fallbackViewer.load(this.source, t) ? (this.error = "", this.setMode("fallback"), !0) : !1;
    } catch (a) {
      return this.setMode("error"), this.onPlaybackError(`${e} Fallback preview failed: ${String(a?.message || a)}`), !1;
    }
  }
  /** Apply the coordinator's frame to whichever preview mode is active. */
  seekFrame(t) {
    const e = Math.max(0, Number(t) || 0);
    return this.mode === "fallback" ? (this.loadFallback(e), !0) : (this.ignoredFrame = e, super.seekFrame(e));
  }
  reportFrame(t) {
    const e = Math.max(0, Number(t) || 0);
    if (this.ignoredFrame === e) {
      this.ignoredFrame = null;
      return;
    }
    this.onExternalFrame(e);
  }
  /** A user gesture: seek, and stop following the solver until re-enabled. */
  scrubTo(t) {
    this.setFollow(!1);
    const e = Math.max(0, Number(t) || 0);
    this.seekFrame(e), this.onExternalFrame(e);
  }
  /** The solver moved: follow it only if the user has not taken over. */
  followSolveFrame(t) {
    return this.follow ? (this.mode === "fallback" ? this.loadFallback(t) : this.seekFrame(t), !0) : !1;
  }
  setFollow(t) {
    return this.follow = !!t, this.follow;
  }
  setLoop(t) {
    super.setLoop(t);
  }
  dispose() {
    this.fallbackViewer?.dispose?.(), this.fallbackViewer = null, super.dispose();
  }
}
function X(r, t) {
  const e = Math.max(1, Number(t) || 24), a = Math.max(0, Number(r) || 0), o = Math.floor(a / e), i = (s, n = 2) => String(s).padStart(n, "0");
  return `${i(Math.floor(o / 60))}:${i(o % 60)}:${i(a % e)}`;
}
const Jt = "/majoor/omnicam/extractor/frame";
function Qt(r) {
  return Math.max(0, Math.round(Number(r) || 0));
}
function I(r, t, e = 0) {
  const a = Number(r?.get?.(t));
  return Number.isFinite(a) && a > 0 ? Math.round(a) : e;
}
async function Zt(r) {
  try {
    return await r?.text?.() || `Preview frame request failed (${r?.status || "unknown"})`;
  } catch {
    return `Preview frame request failed (${r?.status || "unknown"})`;
  }
}
function te(r) {
  return r?.name === "AbortError";
}
function ee(r, t, e = t?.width, a = t?.height) {
  const o = r?.getContext?.("2d"), i = Math.max(1, Number(t?.width) || 1), s = Math.max(1, Number(t?.height) || 1), n = Math.max(1, Math.round(Number(e) || i)), c = Math.max(1, Math.round(Number(a) || s));
  if (!o) return !1;
  r.width !== n && (r.width = n), r.height !== c && (r.height = c);
  const l = Math.min(n / i, c / s), h = Math.round(i * l), p = Math.round(s * l);
  return o.clearRect(0, 0, n, c), o.drawImage(t, Math.round((n - h) / 2), Math.round((c - p) / 2), h, p), !0;
}
class re {
  constructor(t, { api: e, decodeImage: a = (o) => globalThis.createImageBitmap(o) } = {}) {
    this.canvas = t, this.api = e, this.decodeImage = a, this.abortController = null, this.generation = 0, this.frame = 0, this.frameCount = 0, this.error = "";
  }
  abort() {
    this.abortController?.abort(), this.abortController = null;
  }
  /** Fetch, decode, and paint a single managed video frame. */
  async load(t, e, { maxDimension: a = 960 } = {}) {
    this.abort();
    const o = ++this.generation, i = new AbortController();
    this.abortController = i;
    const s = Qt(e);
    try {
      const n = await this.api?.fetchApi?.(Jt, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: t, frame: s, max_dimension: a }),
        signal: i.signal
      });
      if (!n?.ok) throw new Error(await Zt(n));
      const c = await n.blob(), l = await this.decodeImage(c);
      if (o !== this.generation || i.signal.aborted)
        return l?.close?.(), !1;
      const h = I(n.headers, "X-OmniCam-Width", l?.width), p = I(n.headers, "X-OmniCam-Height", l?.height);
      let d = !1;
      try {
        d = ee(this.canvas, l, h, p);
      } finally {
        l?.close?.();
      }
      if (!d) throw new Error("The fallback preview canvas is unavailable.");
      return this.frame = I(n.headers, "X-OmniCam-Frame", s), this.frameCount = I(n.headers, "X-OmniCam-Frame-Count", this.frameCount), this.error = "", !0;
    } catch (n) {
      if (o !== this.generation || i.signal.aborted || te(n)) return !1;
      throw this.error = String(n?.message || n), n;
    } finally {
      o === this.generation && (this.abortController = null);
    }
  }
  clear() {
    this.abort(), this.generation += 1, this.error = "";
    const t = this.canvas;
    t?.getContext?.("2d")?.clearRect(0, 0, t?.width || 0, t?.height || 0);
  }
  dispose() {
    this.clear(), this.canvas = null, this.api = null;
  }
}
const ae = {
  LoadVideo: ["file", "video"],
  VHS_LoadVideo: ["video"],
  VHS_LoadVideoPath: ["video"],
  LoadVideoFFmpeg: ["file", "video"]
}, oe = /\.(mp4|mov|webm|mkv|m4v|avi)(\s|$)/i, F = {
  available: !1,
  ref: null,
  label: "",
  reason: "Interactive Track requires a file-backed video source. Connect Load Video or choose an Extractor source file. This source exists only during workflow execution."
};
function Y(r) {
  return String(r?.comfyClass || r?.type || r?.constructor?.type || "");
}
function ie(r, t) {
  for (const e of t) {
    const a = r?.widgets?.find((o) => String(o.name).toLowerCase() === e);
    if (a && a.value) return String(a.value);
  }
  return "";
}
function se(r, t) {
  const e = (r?.inputs || []).find((a) => String(a?.name).toLowerCase() === "video");
  return !e || e.link == null || !t ? null : pt(t, e.link);
}
function J(r) {
  const t = String(
    r?.widgets?.find((a) => a.name === "omnicam_extractor_source")?.value || ""
  );
  return t ? { kind: /\s\[(input|output|temp)\]$/.test(t) ? "annotated_input" : "managed", value: t } : null;
}
function ne(r, t = r?.graph) {
  const e = se(r, t);
  if (e) {
    const o = ae[Y(e)];
    if (!o) {
      const s = J(r);
      return s ? {
        available: !0,
        reason: "",
        label: s.value.replace(/\s\[(input|output|temp)\]$/, "").split("/").pop(),
        ref: s,
        originNodeId: e.id ?? null,
        runtimeMaterialized: !0
      } : {
        ...F,
        reason: `${Y(e) || "This node"} produces its footage only while the workflow runs. Connect Load Video, or choose an Extractor source file, to track without running.`,
        // Cannot be solved without a real file, but the origin may already
        // have rendered something (a previous run, an upload thumbnail) --
        // showing it at least confirms what is actually connected.
        previewMedia: ht(e)
      };
    }
    const i = ie(e, o);
    return i ? oe.test(i) ? {
      available: !0,
      reason: "",
      label: i,
      ref: { kind: "annotated_input", value: i },
      originNodeId: e.id ?? null
    } : { ...F, reason: `${i} does not look like a video file.` } : { ...F, reason: "The connected Load Video node has no file selected yet." };
  }
  const a = J(r);
  return a ? {
    available: !0,
    reason: "",
    label: a.value.split("/").pop(),
    ref: a,
    originNodeId: null
  } : { ...F, reason: "Connect Load Video, or choose a source file, to track." };
}
function ce(r) {
  if (!r?.available) return r?.reason || "No source";
  const t = r.info;
  if (!t) return r.label;
  const e = [r.label];
  return t.width && t.height && e.push(`${t.width}x${t.height}`), t.fps && e.push(`${Number(t.fps).toFixed(2).replace(/\.?0+$/, "")}fps`), t.frame_count && e.push(`${t.frame_count} frames`), e.join(" · ");
}
function le(r) {
  const t = ne(r.node, r.node.graph), e = t.ref ? `${t.ref.kind}:${t.ref.value}` : "", a = e !== (r.sourceKey || "");
  if (a) {
    const i = r.state.jobId;
    r.sourceKey = e, r.describing = "", i && r.client.stopSolve(i).catch(() => {
    }), r.dispatch({ type: "SOURCE_RESET", source: { ...t, playbackError: "" } }), r.coordinator.setRate(24), r.coordinator.setFrameCount(0);
  }
  const o = r.sourceViewer.setSource(
    t.available && t.ref ? Tt(N, t.ref.value) : "",
    { source: t.available ? t.ref : null }
  );
  return a && r.coordinator.seek(0, "source"), r.dispatch({ type: "SOURCE", source: o ? { ...t, playbackError: "" } : t }), t.available && t.ref ? it(r, t) : W(r, 0), $t(r, t), t;
}
async function it(r, t) {
  if (r.describing === t.ref?.value) return null;
  r.describing = t.ref?.value;
  try {
    const e = await r.client.describeSource(t.ref);
    if (r.disposed || r.sourceKey !== `${t.ref.kind}:${t.ref.value}`) return null;
    const a = e?.info || null;
    return r.dispatch({ type: "SOURCE", source: { info: a } }), a && (r.coordinator.setRate(Number(a.fps) || r.sourceViewer.fps), W(r, Number(a.frame_count) || 0), Ft(r, a)), a;
  } catch (e) {
    return console.warn("[OmniCam] could not describe the extractor source", e), null;
  }
}
function W(r, t) {
  const e = Math.max(0, Math.round(Number(t) || 0));
  r.coordinator.setFrameCount(e), e !== r.state.frameCount && (r.dispatch({ type: "FRAME_COUNT", frameCount: e }), r.coordinator.seek(r.coordinator.frame, "source"));
}
const de = /* @__PURE__ */ new Set(["PREPARING", "TRACKING", "SOLVING", "REFINING", "STOPPING"]), ue = {
  IDLE: "neutral",
  PREPARING: "info",
  TRACKING: "active",
  SOLVING: "active",
  REFINING: "active",
  STOPPING: "warn",
  STOPPED: "neutral",
  COMPLETED: "ok",
  FAILED: "danger"
};
function he() {
  return {
    solveState: "IDLE",
    jobId: "",
    progress: 0,
    stageProgress: 0,
    frame: 0,
    frameCount: 0,
    backend: "",
    poseCount: 0,
    error: "",
    warnings: [],
    anomalies: [],
    quality: [],
    source: { available: !1, reason: "", label: "", ref: null, info: null },
    viewerMode: "source",
    trackMode: "refined",
    applied: { fingerprint: "", outdated: !1 },
    refinedFingerprint: ""
  };
}
function D(r, t) {
  switch (t.type) {
    case "SOURCE":
      return { ...r, source: { ...r.source, ...t.source } };
    case "SOURCE_RESET":
      return {
        ...r,
        solveState: "IDLE",
        jobId: "",
        progress: 0,
        stageProgress: 0,
        backend: "",
        poseCount: 0,
        error: "",
        warnings: [],
        anomalies: [],
        quality: [],
        refinedFingerprint: "",
        source: { ...r.source, ...t.source, info: null }
      };
    case "QUEUED_RESULT":
      return { ...r, jobId: "", solveState: "COMPLETED" };
    case "JOB_STARTED":
      return {
        ...r,
        jobId: t.status.job_id,
        solveState: t.status.state,
        progress: 0,
        stageProgress: 0,
        error: "",
        warnings: [],
        anomalies: [],
        quality: [],
        poseCount: 0,
        refinedFingerprint: ""
      };
    case "JOB_STATE":
      return { ...r, solveState: t.state, error: t.state === "FAILED" ? r.error : "" };
    case "PROGRESS":
      return {
        ...r,
        solveState: t.progress.state || r.solveState,
        progress: Number(t.progress.progress) || 0,
        stageProgress: Number(t.progress.stage_progress) || 0,
        backend: t.progress.backend || r.backend
      };
    case "QUALITY":
      return { ...r, quality: [...r.quality, ...t.samples || []] };
    case "POSE":
      return { ...r, poseCount: r.poseCount + 1 };
    case "FRAME":
      return { ...r, frame: Math.max(0, Math.round(Number(t.frame) || 0)) };
    case "FRAME_COUNT":
      return { ...r, frameCount: Math.max(0, Math.round(Number(t.frameCount) || 0)) };
    case "STATUS": {
      const e = t.status || {}, a = (o, i) => o == null || Number.isNaN(Number(o)) ? i : Number(o);
      return {
        ...r,
        solveState: e.state || r.solveState,
        jobId: e.job_id || r.jobId,
        progress: a(e.progress, r.progress),
        backend: e.backend || r.backend,
        poseCount: a(e.pose_count, r.poseCount),
        warnings: Array.isArray(e.warnings) ? e.warnings : r.warnings,
        anomalies: Array.isArray(e.anomalies) ? e.anomalies : r.anomalies,
        error: e.error === void 0 ? r.error : String(e.error || "")
      };
    }
    case "COMPLETED":
      return {
        ...r,
        solveState: "COMPLETED",
        progress: 1,
        refinedFingerprint: String(t.result?.fingerprint || ""),
        backend: t.result?.backend || r.backend
      };
    case "FAILED":
      return { ...r, solveState: "FAILED", error: String(t.error || "The solve failed") };
    case "REFINED":
      return {
        ...r,
        refinedFingerprint: String(t.fingerprint || ""),
        // Changing the cleanup after applying does not push anything to the
        // Director; it marks the applied result stale until Apply is pressed.
        applied: r.applied.fingerprint ? { ...r.applied, outdated: r.applied.fingerprint !== t.fingerprint } : r.applied
      };
    case "APPLIED":
      return { ...r, applied: { fingerprint: String(t.fingerprint || ""), outdated: !1 } };
    case "VIEWER_MODE":
      return { ...r, viewerMode: t.mode };
    case "TRACK_MODE":
      return { ...r, trackMode: t.mode };
    default:
      return r;
  }
}
function pe(r) {
  const t = r.solveState, e = de.has(t), a = t === "COMPLETED";
  return {
    track: !e && r.source.available,
    stop: e,
    // A partial solve is reviewable, never shippable.
    apply: a && !!r.refinedFingerprint,
    refine: a,
    retry: t === "STOPPED" || t === "FAILED"
  };
}
function me(r) {
  return ue[r] || "neutral";
}
function fe(r) {
  const t = Math.round(Math.max(0, Math.min(1, r.progress)) * 100);
  switch (r.solveState) {
    case "TRACKING":
    case "SOLVING":
      return `${r.solveState} ${t}%`;
    case "STOPPING":
      return "STOPPING…";
    default:
      return r.solveState;
  }
}
function be(r) {
  return r.frameCount ? `${r.frame} / ${r.frameCount} frames` : r.solveState === "IDLE" ? "Ready to track" : r.solveState;
}
function ge(r) {
  return r.applied.fingerprint ? r.applied.outdated ? "OUTDATED" : "APPLIED" : "NOT APPLIED";
}
const ve = `${mt}${gt}
  .oc-extractor{width:100%;min-height:700px;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--oc-line);border-radius:var(--oc-radius);background:var(--oc-bg)}
  .oc-extractor .oc-header{justify-content:space-between}.oc-extractor .oc-heading{display:flex;align-items:center;gap:9px}
  .oc-extractor button,.oc-extractor select,.oc-extractor input{font:inherit;color:var(--oc-text);background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:6px}
  .oc-extractor button{padding:5px 10px;cursor:pointer}.oc-extractor button:hover:not(:disabled){border-color:var(--oc-accent)}
  .oc-extractor button:disabled{opacity:.4;cursor:not-allowed}
  .oc-extractor button.oc-primary{background:var(--oc-accent);border-color:var(--oc-accent);color:var(--oc-accent-ink);font-weight:650}
  .oc-extractor .oc-status-pill[data-tone="active"]{background:#1d1a2e;border-color:#463a78;color:#c3b6ff}
  .oc-extractor .oc-status-pill[data-tone="warn"]{background:var(--oc-warn-bg);border-color:var(--oc-warn-line);color:var(--oc-warn-text)}
  .oc-extractor .oc-status-pill[data-tone="danger"]{background:var(--oc-danger-bg);border-color:var(--oc-danger-line);color:var(--oc-danger-text)}
  .oc-extractor .oc-status-pill[data-tone="neutral"]{background:var(--oc-sunken);border-color:var(--oc-line);color:var(--oc-text-dim)}
  .oc-extractor .oc-status-pill[data-tone="info"]{background:#191f2d;border-color:#35486b;color:#86b6f2}
  .oc-extractor .oc-source{display:flex;align-items:center;gap:8px;padding:6px 12px;border-bottom:1px solid var(--oc-line);color:var(--oc-text-dim)}
  .oc-extractor .oc-source[data-available="false"]{color:var(--oc-warn-text)}
  .oc-extractor .oc-source .oc-source-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-extractor .oc-body{display:flex;flex-direction:column;gap:9px;padding:9px;min-height:0}
  .oc-extractor .oc-solve-card{order:-1;width:100%;box-sizing:border-box}
  .oc-extractor .oc-tabs{display:flex;gap:4px}
  .oc-extractor .oc-tab[aria-selected="true"]{background:var(--oc-accent);border-color:var(--oc-accent);color:var(--oc-accent-ink)}
  .oc-extractor .oc-stage{display:grid;grid-template-columns:minmax(0,1fr);position:relative;min-height:300px;background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:8px;overflow:hidden}
  .oc-extractor .oc-stage .oc-pane{position:relative;min-width:0;overflow:hidden;background:var(--oc-sunken)}
  .oc-extractor .oc-stage .oc-pane > *{position:absolute;inset:0;width:100%;height:100%}
  .oc-extractor .oc-stage video{object-fit:contain;background:#08080b}
  /* The overlay letterboxes exactly like the video it sits on. Without this the
     canvas is stretched to the stage while the footage is contained inside it,
     and every tracked point on non-16:9 footage lands off the feature it marks. */
  .oc-extractor .oc-stage canvas{display:block}
  .oc-extractor .oc-stage canvas[data-role="tracking-overlay"]{object-fit:contain}
  .oc-extractor .oc-stage canvas[data-role="fallback-preview"]{object-fit:contain;background:#08080b}
  .oc-extractor .oc-stage canvas[data-role="upstream-preview"]{object-fit:contain;background:#08080b;filter:saturate(.7) brightness(.85)}
  .oc-extractor .oc-stage [hidden]{display:none}
  .oc-extractor .oc-stage[data-mode="source"] .oc-track-pane,.oc-extractor .oc-stage[data-mode="track3d"] .oc-diagnostic-pane{display:none}
  .oc-extractor .oc-stage[data-mode="track3d"] .oc-track-pane,.oc-extractor .oc-stage[data-mode="source"] .oc-diagnostic-pane{display:block}
   .oc-extractor .oc-track-pane .oc-views{position:absolute;z-index:4;inset:10px auto auto 10px;width:auto;height:auto;display:flex;align-items:center;gap:4px;max-width:calc(100% - 20px);padding:4px;background:rgba(20,20,26,.88);border:1px solid rgba(255,255,255,.12);border-radius:7px;backdrop-filter:blur(8px)}
   .oc-extractor .oc-track-pane .oc-views button{height:26px;padding:0 8px;white-space:nowrap;background:transparent;border-color:transparent;color:var(--oc-text-dim)}
   .oc-extractor .oc-track-pane .oc-views button:hover:not(:disabled){background:var(--oc-panel-2);border-color:var(--oc-line);color:var(--oc-text)}
   .oc-extractor .oc-track-pane .oc-views button:disabled{opacity:.35}
   .oc-extractor .oc-track-pane .oc-view-divider{width:1px;height:18px;background:var(--oc-line);margin:0 2px}
  .oc-extractor .oc-extractor-timeline{gap:8px;padding:8px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);min-width:0}
  /* Wrapping rather than nowrap: an Extractor node is often narrower than a
     Director, and a squeezed transport crushed the TRACK group against the FPS
     readout instead of taking the second line it had room for. */
  .oc-extractor .oc-transport{display:flex;align-items:center;gap:7px;flex-wrap:wrap;row-gap:6px;min-width:0}
  .oc-extractor .oc-transport-spacer{flex:1 1 12px;min-width:0}
  /* Same 2px inset and 28px controls as the playback group, so the two groups
     are the same height and sit on one line. */
  .oc-extractor .oc-track-tools{gap:4px}
   .oc-extractor .oc-transport .icon-button{display:inline-flex;align-items:center;justify-content:center;padding:0;line-height:1}
   .oc-extractor .oc-transport .icon-button i{line-height:1}
   .oc-extractor .oc-transport [data-act="toggle-loop"][aria-pressed="true"]{background:var(--oc-ok-bg);border-color:var(--oc-ok-line);color:var(--oc-ok-text)}
   .oc-extractor .oc-transport .primary-play.playing{background:var(--oc-ok)!important;border-color:var(--oc-ok-line)!important;color:var(--oc-accent-ink)!important}
  /* TRACK is a square green key, not a word: the group is a row of 28px icon
     buttons, and a text button among them stretched the row and read as a
     label rather than as the thing you press to start a solve. Green because
     it is the go action -- the icons beside it steer a solve already running. */
  .oc-extractor .oc-track-tools .oc-track-go{background:var(--oc-ok)!important;border-color:var(--oc-ok)!important;color:var(--oc-accent-ink)!important}
  .oc-extractor .oc-track-tools .oc-track-go:hover:not(:disabled){filter:brightness(1.12)}
  .oc-extractor .oc-track-mark{font:800 14px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  /* The divider keeps starting a solve distinct from cancelling one in flight. */
  .oc-extractor .oc-tool-divider{width:1px;align-self:stretch;margin:2px 2px;background:var(--oc-line)}
  .oc-extractor .oc-fps{padding:2px 10px}
  .oc-extractor .oc-fps output{min-width:20px;text-align:right;color:var(--oc-text);font-weight:600}
  .oc-extractor .oc-extractor-dope{--oc-ruler-h:28px;--oc-dope-row-h:28px;--oc-dope-gap:4px}
  .oc-extractor .oc-dope-tracks{cursor:crosshair;touch-action:none}
  .oc-extractor .oc-extractor-lanes{display:flex;flex-direction:column;gap:var(--oc-dope-gap);min-width:0}
  .oc-extractor .oc-extractor-lanes canvas{width:100%;border-radius:6px;background:var(--oc-panel-2);border:1px solid var(--oc-line-soft);cursor:pointer}
  /* The lane stack paints one health band and three channel row plates. */
  .oc-extractor .oc-extractor-lanes .oc-track-timeline{height:calc(4 * var(--oc-dope-row-h) + 3 * var(--oc-dope-gap));background:none;border:0;border-radius:0}
  .oc-extractor .oc-extractor-timeline-meta{padding:0 2px}
  .oc-extractor .oc-extractor-frame-readout{margin-left:auto;color:var(--oc-text-dim);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
   .oc-extractor .oc-extractor-quality-details{overflow:visible}
   .oc-extractor .oc-views [data-inspection-view][aria-selected="true"]{background:var(--oc-accent)!important;border-color:var(--oc-accent)!important;color:var(--oc-accent-ink)!important}
  .oc-extractor .oc-progress{height:7px;border-radius:4px;background:var(--oc-sunken);overflow:hidden}
  .oc-extractor .oc-progress i{display:block;height:100%;width:0;background:var(--oc-accent);transition:width .12s linear}
  .oc-extractor .oc-solve-line{display:flex;justify-content:space-between;gap:8px;color:var(--oc-text-dim)}
  .oc-extractor .oc-actions{display:flex;gap:6px;flex-wrap:wrap}
  .oc-extractor .oc-solve-actions{display:none}
  .oc-extractor .oc-stage-notice{display:flex;align-items:flex-end;justify-content:center;padding:10px 14px;pointer-events:none;background:linear-gradient(transparent 55%,rgba(10,10,14,.92));color:var(--oc-warn-text);text-align:center}
  .oc-extractor .oc-timeline-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .oc-extractor .oc-timeline-head .oc-section{margin:0}
  .oc-extractor .oc-timeline-summary{flex:1;min-width:0;text-align:right;color:var(--oc-text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-extractor .oc-track-timeline{width:100%;height:100px;border-radius:5px;background:var(--oc-sunken);cursor:pointer}
  .oc-extractor .oc-hint{color:var(--oc-text-faint)}
  .oc-extractor .oc-quality{width:100%;height:26px;border-radius:5px;background:var(--oc-sunken);cursor:pointer}
  .oc-extractor .oc-columns{display:grid;grid-template-columns:minmax(0,1fr) minmax(230px,.62fr);gap:9px}
  .oc-extractor .oc-sliders{display:grid;grid-template-columns:auto 1fr auto;gap:5px 8px;align-items:center}
  .oc-extractor .oc-sliders label{color:var(--oc-text-dim)}
  .oc-extractor .oc-sliders output{min-width:44px;text-align:right;color:var(--oc-text-dim)}
  .oc-extractor .oc-sliders input[type="range"]{width:100%}
  .oc-extractor .oc-inline{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .oc-extractor .oc-details{display:flex;flex-direction:column;gap:8px;margin-top:8px}
  .oc-extractor .oc-details summary{cursor:pointer;color:var(--oc-text-dim)}
  .oc-extractor .oc-inline input[type="number"]{width:74px;padding:4px 5px}
  .oc-extractor .oc-rows{display:flex;flex-direction:column;gap:2px}
  .oc-extractor .oc-row{display:flex;justify-content:space-between;gap:8px;padding:3px 0;border-bottom:1px solid var(--oc-line-soft)}
  .oc-extractor .oc-row:last-child{border-bottom:0}.oc-extractor .oc-row span:last-child{color:var(--oc-text)}
  .oc-extractor .oc-row span:first-child{color:var(--oc-text-dim)}
  .oc-extractor .oc-anomalies{display:flex;flex-direction:column;gap:5px;max-height:150px;overflow:auto}
  .oc-extractor .oc-anomaly{display:flex;align-items:center;gap:6px;padding:5px 6px;background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:6px}
   .oc-extractor .oc-anomaly[data-level="warn"]{border-left:3px solid var(--oc-warn)}
   .oc-extractor .oc-anomaly[data-level="error"]{border-left:3px solid var(--oc-danger)}
  .oc-extractor .oc-anomaly .oc-anomaly-text{flex:1;min-width:0}
  .oc-extractor .oc-anomaly strong{color:var(--oc-warn-text)}
  .oc-extractor .oc-anomaly small{display:block;color:var(--oc-text-faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-extractor .oc-anomaly button{padding:3px 6px;font-size:10px}
  .oc-extractor .oc-error{padding:7px 9px;border-radius:6px;background:var(--oc-danger-bg);border:1px solid var(--oc-danger-line);color:var(--oc-danger-text);white-space:pre-wrap}
  .oc-extractor .oc-applied[data-state="APPLIED"]{color:var(--oc-ok-text)}
  .oc-extractor .oc-applied[data-state="OUTDATED"]{color:var(--oc-warn-text)}
  /* Layout rules set a display value, which outranks the user-agent [hidden]
     rule. Without these the view buttons stayed on screen in SOURCE mode
     however often the panel set hidden=true. */
  .oc-extractor [hidden]{display:none}
  .oc-extractor .oc-views[hidden]{display:none}
  @media(max-width:720px){.oc-extractor .oc-columns{grid-template-columns:1fr}}
`, ye = '<svg class="oc-mark" viewBox="0 0 24 24" aria-hidden="true"><circle class="oc-mark-ring" cx="12" cy="12" r="8"/><circle class="oc-mark-core" cx="12" cy="12" r="3"/></svg>';
function S(r, t, { min: e = 0, max: a = 1, step: o = 0.01, value: i = 0 } = {}) {
  return `<label for="oc-${r}">${t}</label>
    <input id="oc-${r}" data-role="${r}" type="range" min="${e}" max="${a}" step="${o}" value="${i}">
    <output data-role="${r}-out"></output>`;
}
function xe() {
  return `<div class="majoor-omnicam oc-extractor">
    <style>${ve}</style>
    <header class="oc-header">
      <div class="oc-heading"><span class="oc-brand">${ye}</span>
        <div><div class="oc-title">OmniCam Extractor</div><small>Solve · inspect · clean</small></div>
      </div>
      <span class="oc-status-pill" data-role="solve-status" data-tone="neutral"><i class="oc-status-dot"></i><span data-role="solve-status-text">IDLE</span></span>
    </header>

    <div class="oc-source" data-role="source-strip" data-available="false">
      <span class="oc-source-label" data-role="source-label">Connect a VIDEO input to track.</span>
    </div>

    <main class="oc-body">
      <div class="oc-tabs" role="tablist">
        <button type="button" class="oc-tab" data-tab="source" aria-selected="true">VIDEO</button>
        <button type="button" class="oc-tab" data-tab="track3d" aria-selected="false">TRACK 3D</button>
      </div>

      <div class="oc-stage" data-role="stage">
        <section class="oc-pane oc-diagnostic-pane">
          <video data-role="source-video" playsinline muted preload="auto" aria-label="Extractor source footage"></video>
          <canvas data-role="fallback-preview" width="960" height="540" hidden aria-label="Browser-safe decoded source frame"></canvas>
          <canvas data-role="upstream-preview" width="960" height="540" hidden aria-label="Connected source, not yet a trackable file"></canvas>
          <canvas data-role="tracking-overlay" width="960" height="540"></canvas>
          <div class="oc-stage-notice" data-role="stage-notice" hidden></div>
        </section>
        <section class="oc-pane oc-track-pane">
          <canvas data-role="track-canvas" width="960" height="540" hidden></canvas>
          <div class="oc-views" data-role="views" hidden role="toolbar" aria-label="Track inspection views">
            <button type="button" data-inspection-view="scene" aria-selected="true">SCENE</button>
            <button type="button" data-inspection-view="camera" aria-selected="false">CAMERA</button>
            <span class="oc-view-divider" aria-hidden="true"></span>
            <button type="button" data-view="perspective">Perspective</button>
            <button type="button" data-view="top">Top</button>
            <button type="button" data-view="front">Front</button>
            <button type="button" data-view="side">Side</button>
            <button type="button" data-act="fit">Fit Track</button>
          </div>
        </section>
      </div>

      <section class="oc-timeline oc-extractor-timeline" aria-label="Extractor timeline" tabindex="0">
        <div class="row timeline-toolbar oc-transport">
          <div class="timeline-group" title="Playback transport">
            <button type="button" class="icon-button" data-act="first-frame" title="First frame" aria-label="First frame"><i class="pi pi-step-backward-alt"></i></button>
            <button type="button" class="icon-button" data-act="previous-key" title="Previous keyframe" aria-label="Previous keyframe"><i class="pi pi-fast-backward"></i></button>
            <button type="button" class="icon-button" data-act="previous-frame" title="Previous frame" aria-label="Previous frame"><i class="pi pi-step-backward"></i></button>
            <button type="button" class="icon-button primary-play oc-play" data-act="play" title="Play or pause" aria-label="Play or pause"><i class="pi pi-play"></i></button>
            <button type="button" class="icon-button" data-act="next-frame" title="Next frame" aria-label="Next frame"><i class="pi pi-step-forward"></i></button>
            <button type="button" class="icon-button" data-act="next-key" title="Next keyframe" aria-label="Next keyframe"><i class="pi pi-fast-forward"></i></button>
            <button type="button" class="icon-button" data-act="last-frame" title="Last frame" aria-label="Last frame"><i class="pi pi-step-forward-alt"></i></button>
            <button type="button" class="icon-button" data-act="toggle-loop" title="Loop playback" aria-label="Loop playback" aria-pressed="true"><i class="pi pi-replay"></i></button>
          </div>
          <span class="oc-frame-counter"><input data-role="frame" type="number" min="0" value="0" aria-label="Frame"><span class="oc-frame-total" data-role="frame-total">/ 0</span></span>
          <output class="oc-timecode" data-role="time">00:00.000</output>
          <span class="oc-transport-spacer"></span>
          <div class="timeline-group oc-track-tools" title="Tracking tools">
            <button type="button" class="icon-button oc-track-go" data-act="track" title="Track" aria-label="Track"><span class="oc-track-mark">T</span></button>
            <span class="oc-tool-divider" aria-hidden="true"></span>
            <button type="button" class="icon-button" data-act="stop" title="Stop tracking" disabled><i class="pi pi-stop"></i></button>
          </div>
          <label class="oc-fps">FPS <output data-role="extractor-fps">24</output></label>
          <input class="oc-sr-only" data-role="scrubber" type="range" min="0" max="0" value="0" aria-label="Source frame">
          <input class="oc-sr-only" data-role="follow-solve" type="checkbox" checked>
          <input class="oc-sr-only" data-role="loop" type="checkbox" checked>
        </div>
        <div class="oc-dope oc-extractor-dope">
          <div class="oc-dope-body">
            <div class="oc-dope-labels">
              <span class="oc-dope-label oc-dope-health-label">Solve Health</span>
              <label class="oc-dope-label" style="--channel-color:var(--oc-accent)"><input type="checkbox" checked aria-label="Show camera lane"><span>Camera</span></label>
              <label class="oc-dope-label" style="--channel-color:var(--oc-warn)"><input type="checkbox" checked aria-label="Show look at lane"><span>Look At</span></label>
              <label class="oc-dope-label" style="--channel-color:var(--oc-danger)"><input type="checkbox" checked aria-label="Show roll lane"><span>Roll</span></label>
            </div>
            <div class="oc-dope-tracks" data-role="extractor-dope-tracks">
              <div class="oc-ruler" data-role="extractor-ruler" title="Drag to scrub the source"></div>
              <div class="oc-extractor-lanes">
                <canvas class="oc-track-timeline" data-role="track-timeline" width="900" height="124" aria-label="Solve health and solved camera channels per frame"></canvas>
              </div>
              <span class="oc-playhead-line" data-role="extractor-playhead"></span>
            </div>
          </div>
          <input class="oc-sr-only" data-role="extractor-scrub" type="range" min="0" max="0" value="0" aria-label="Scrub the timeline">
        </div>
        <div class="oc-timeline-head oc-extractor-timeline-meta">
          <span class="oc-section">Solve diagnostics</span>
          <output class="oc-extractor-frame-readout" data-role="frame-readout">0 / 0</output>
        </div>
        <div class="oc-rows oc-extractor-quality-details" data-role="quality-details"></div>
      </section>

      <div class="oc-card oc-solve-card">
        <div class="oc-section">Solve</div>
        <div class="oc-solve-line"><span data-role="solve-detail">Ready to track</span><span data-role="solve-percent">0%</span></div>
        <div class="oc-progress"><i data-role="progress-bar"></i></div>
        <div class="oc-actions oc-solve-actions">
          <button type="button" class="oc-primary" data-act="track">▶ TRACK</button>
          <button type="button" data-act="stop" disabled>■ STOP</button>
        </div>
        <div class="oc-error" data-role="solve-error" hidden></div>
      </div>

      <div class="oc-columns">
        <div class="oc-card">
          <div class="oc-section">Cleanup</div>
          <div class="oc-sliders">
            ${S("position-smoothing", "Position smooth", { value: 0.15 })}
            ${S("motion-scale", "Motion scale", { min: 0.01, max: 10, step: 0.01, value: 1 })}
          </div>
          <div class="oc-inline">
            <button type="button" data-act="estimate-up">Level Horizon</button>
          </div>
          <details class="oc-details"><summary>Advanced cleanup</summary>
            <div class="oc-sliders">
              ${S("rotation-smoothing", "Rotation smooth", { value: 0.1 })}
              ${S("position-tolerance", "Key reduction", { min: 0, max: 0.5, step: 1e-3, value: 0.01 })}
              ${S("align-pitch", "Pitch", { min: -180, max: 180, step: 0.5, value: 0 })}
              ${S("align-yaw", "Yaw", { min: -180, max: 180, step: 0.5, value: 0 })}
              ${S("align-roll", "Roll", { min: -180, max: 180, step: 0.5, value: 0 })}
            </div>
            <div class="oc-inline">
              <button type="button" data-act="reset-alignment">Reset alignment</button>
              <button type="button" data-act="set-in">Set In</button>
              <input data-role="trim-start" type="number" min="0" step="1" value="0" aria-label="Trim in frame">
              <button type="button" data-act="set-out">Set Out</button>
              <input data-role="trim-end" type="number" min="0" step="1" value="0" aria-label="Trim out frame">
              <button type="button" data-act="reset-trim">Reset trim</button>
            </div>
            <div class="oc-inline">
              <label class="oc-inline"><input data-role="normalize-origin" type="checkbox" checked> Normalize origin</label>
              <label class="oc-inline"><input data-role="simplify-keys" type="checkbox" checked> Simplify keys</label>
            </div>
          </details>
          <div class="oc-actions">
            <button type="button" data-track-mode="raw">RAW</button>
            <button type="button" data-track-mode="refined" aria-selected="true">REFINED</button>
            <button type="button" data-act="reset-refine">RESET</button>
            <button type="button" class="oc-primary" data-act="apply" disabled>APPLY REFINED</button>
            <span class="oc-applied" data-role="applied-state" data-state="NOT APPLIED">NOT APPLIED</span>
          </div>
        </div>

        <aside class="oc-card">
          <div class="oc-section">Anomalies</div>
          <div class="oc-anomalies" data-role="anomalies"><div class="oc-empty">No anomalies detected</div></div>
        </aside>
      </div>
    </main>
  </div>`;
}
function we(r = document) {
  const t = r.createElement("div");
  return t.innerHTML = xe(), t.firstElementChild;
}
const st = {
  good: "#46a758",
  weak: "#e5a23c",
  bad: "#e5484d",
  unknown: "#3a3a48"
};
function z(r) {
  if (!r) return "unknown";
  const t = String(r.state || "").toLowerCase();
  if (st[t]) return t;
  const e = Number(r.coverage);
  return Number.isFinite(e) ? e >= 0.7 ? "good" : e >= 0.35 ? "weak" : "bad" : "unknown";
}
function ke(r, t) {
  const e = (r || []).find((o) => Number(o.frame) === Number(t)), a = [["Frame", String(t)]];
  return e ? (a.push(["Tracking state", z(e).toUpperCase()]), Number.isFinite(Number(e.coverage)) && a.push(["Coverage", `${Math.round(Number(e.coverage) * 100)}%`]), e.inliers != null && a.push(["Inliers", String(e.inliers)]), a) : (a.push(["Tracking state", "UNKNOWN"]), a);
}
const Se = {
  position: "#8b7bd8",
  target: "#e5a23c",
  roll: "#e2649a"
}, P = [
  { key: "position", label: "Camera" },
  { key: "target", label: "Look At" },
  { key: "roll", label: "Roll" }
], Ee = 18, Ce = 9, Q = 2, nt = 78, Me = { solve: "SOLVE HEALTH" }, L = {
  bands: ["solve"],
  labels: !0,
  labelWidth: nt,
  bandHeight: Ce,
  bandGap: Q,
  laneTopGap: Q + 2,
  laneHeight: Ee,
  laneGap: 0,
  rowChrome: !1,
  ruler: !0,
  playhead: !0,
  topPad: 1,
  bottomPad: 12
}, Z = {
  bands: ["solve"],
  labels: !1,
  labelWidth: 0,
  bandHeight: 28,
  bandGap: 4,
  laneTopGap: 4,
  laneHeight: 28,
  laneGap: 4,
  rowChrome: !0,
  ruler: !1,
  playhead: !1,
  topPad: 0,
  bottomPad: 0
};
function ct(r = P, t = L) {
  const e = { ...L, ...t }, a = [];
  let o = e.topPad;
  for (const i of e.bands || [])
    a.length && (o += e.bandGap), a.push({
      kind: "band",
      key: i,
      label: Me[i] || String(i).toUpperCase(),
      top: o,
      height: e.bandHeight
    }), o += e.bandHeight;
  for (const i of r)
    a.length && (o += a[a.length - 1].kind === "band" ? e.laneTopGap : e.laneGap), a.push({ kind: "lane", key: i.key, label: i.label, top: o, height: e.laneHeight }), o += e.laneHeight;
  return { rows: a, style: e, height: o + e.bottomPad };
}
function Te(r = P, t = L) {
  return ct(r, t).height;
}
function Ne(r, t) {
  if (!r) return null;
  if (t === "position" || t === "target") {
    const a = r[t];
    return Array.isArray(a) ? a.map(Number) : null;
  }
  const e = Number(r.roll);
  return Number.isFinite(e) ? [e] : null;
}
function _e(r, t, e = 1e-4) {
  return !r || !t || r.length !== t.length ? !1 : r.every((a, o) => Math.abs(a - t[o]) <= e);
}
function lt(r, t = P) {
  const e = Array.isArray(r?.keyframes) ? r.keyframes : [], a = {};
  for (const { key: o } of t) {
    const i = [];
    let s = null;
    for (const n of e) {
      const c = Ne(n?.camera, o);
      c && ((s === null || !_e(c, s)) && i.push(Number(n.frame) || 0), s = c);
    }
    a[o] = i;
  }
  return a;
}
function Ae(r, t = null, e = "generic") {
  if (!r?.keyframes?.length || !t) return null;
  try {
    const o = Array.isArray(r.objects) && r.objects.some((i) => i?.id === "subject" && Array.isArray(i.position)) ? t : { ...t, allow_framing_loss: !0 };
    return Nt(r, o, null, e);
  } catch {
    return null;
  }
}
function Re(r, t, e, a = nt) {
  const o = Math.max(1, Number(e) || 0), i = Math.max(1, (Number(t) || 1) - a), s = Math.max(0, Math.min(1, (Number(r) - a) / i));
  return Math.max(0, Math.min(o - 1, Math.round(s * (o - 1))));
}
function dt(r, t) {
  return Math.max(1, (Number(r) || 1) - t.labelWidth - (t.labelWidth ? 4 : 0));
}
function E(r, t, e, a) {
  const o = Math.max(1, (Number(e) || 1) - 1), i = dt(t, a);
  return a.labelWidth + Math.max(0, Math.min(o, r)) / o * i;
}
function Ie(r, t) {
  const e = Math.max(0, Number(t) - 1);
  return (r || []).map((a) => {
    const o = Math.max(0, Math.min(e, Number(a?.start_frame ?? a?.frame) || 0)), i = Math.max(o, Math.min(e, Number(a?.end_frame ?? a?.frame) || o));
    return { start: o, end: i, level: a?.level === "error" ? "error" : "warn" };
  });
}
function Fe(r, t, e, a, o, i) {
  for (const s of t) {
    const n = E(s.start, a, o, i), c = E(s.end, a, o, i), l = Math.max(2, c - n + 2);
    r.fillStyle = "#101014", r.fillRect(Math.round(n - 1), e.top + 2, Math.ceil(l + 2), e.height - 4), r.fillStyle = s.level === "error" ? "#ffffff" : "#f2c66d", r.fillRect(Math.round(n), e.top + 3, Math.ceil(l), e.height - 6);
  }
}
function $e(r, { y: t, height: e, width: a, frameCount: o, colorAt: i, style: s }) {
  const n = Math.max(1, Number(o) || 0), c = dt(a, s), l = Math.max(1, Math.ceil(n / c)), h = Math.max(1, c / Math.ceil(n / l));
  for (let p = 0; p < n; p += l) {
    const d = i(p, Math.min(n, p + l));
    d && (r.fillStyle = d, r.fillRect(s.labelWidth + p / n * c, t, h, e));
  }
}
function Le(r, t, e, a) {
  const o = new Map((r || []).map((s) => [Number(s.frame), s]));
  let i = "unknown";
  for (let s = Math.max(0, Number(e) || 0); s < Math.max(0, Number(a) || 0); s += 1) {
    const n = z(o.get(s)), c = String((t || [])[s] || "").toLowerCase(), l = c === "over" ? "bad" : c === "warn" ? "weak" : c === "ok" ? "good" : "unknown";
    $(n) > $(i) && (i = n), $(l) > $(i) && (i = l);
  }
  return i;
}
function Pe(r, t, e) {
  const a = Number(e) || 0, o = (r || []).find((n) => Number(n.frame) === a), i = String(t?.frame_grades?.[a] || "unknown").toUpperCase(), s = [["Solve state", z(o).toUpperCase()], ["Motion grade", i]];
  o && Number.isFinite(Number(o.coverage)) && s.push(["Coverage", `${Math.round(Number(o.coverage) * 100)}%`]), o?.inliers != null && s.push(["Inliers", String(o.inliers)]);
  for (const n of ["speed", "angular_speed", "acceleration", "jerk"]) {
    const c = Number(t?.series?.[n]?.[a]), l = Number(t?.limits?.[`max_${n}`]);
    Number.isFinite(c) && s.push([n.replace("_", " "), Number.isFinite(l) ? `${c.toFixed(2)} / ${l}` : c.toFixed(2)]);
  }
  return t?.framing?.[a] === !1 && !t?.limits?.allow_framing_loss && s.push(["Framing", "LOSS"]), s;
}
function Oe(r, t, e, a) {
  r.fillStyle = a, r.font = "9px system-ui, sans-serif", r.textBaseline = "middle", r.fillText(t, 2, e);
}
function De(r, t, e, a, o, i) {
  const s = Math.max(0, Math.min(i, a / 2, o / 2));
  r.beginPath(), r.moveTo(t + s, e), r.arcTo(t + a, e, t + a, e + o, s), r.arcTo(t + a, e + o, t, e + o, s), r.arcTo(t, e + o, t, e, s), r.arcTo(t, e, t + a, e, s), r.closePath();
}
function Ve(r, { row: t, width: e, style: a }) {
  const o = a.labelWidth, i = Math.max(2, e - o);
  De(r, o + 0.5, t.top + 0.5, i - 1, t.height - 1, 6), r.fillStyle = "#20202a", r.fill(), r.strokeStyle = "#26262f", r.lineWidth = 1, r.stroke(), t.kind === "lane" && (r.fillStyle = "#2c2c38", r.fillRect(o + 1, Math.round(t.top + t.height / 2), i - 2, 1));
}
function je(r, {
  track: t = null,
  health: e = null,
  quality: a = [],
  anomalies: o = [],
  frame: i = 0,
  frameCount: s = 0,
  channels: n = P,
  layout: c = L
} = {}) {
  const l = Math.max(1, Number(s) || Number(t?.duration_frames) || 1), h = lt(t, n), { rows: p, style: d } = ct(n, c), g = {
    total: l,
    labelWidth: d.labelWidth,
    lanes: p.filter((m) => m.kind === "lane").map((m) => ({
      key: m.key,
      top: m.top,
      bottom: m.top + m.height,
      keys: h[m.key] || []
    })),
    anomalies: Ie(o, l)
  }, u = r?.getContext?.("2d"), f = r?.width || 0, b = r?.height || 0;
  if (!u || !f || !b) return { ...g, keys: h };
  u.clearRect(0, 0, f, b);
  const x = Array.isArray(e?.frame_grades) ? e.frame_grades : [], y = {
    solve: (m, v) => st[Le(a, x, m, v)]
  };
  for (const m of p) {
    d.rowChrome && Ve(u, { row: m, width: f, style: d });
    const v = m.top + m.height / 2;
    if (d.labels && Oe(u, m.label, v, "#9a9aad"), m.kind === "band") {
      const R = y[m.key];
      if (!R) continue;
      const k = d.rowChrome ? 2 : 0;
      $e(u, {
        y: m.top + k,
        height: m.height - k * 2,
        width: f,
        frameCount: l,
        colorAt: R,
        style: d
      }), m.key === "solve" && Fe(u, g.anomalies, m, f, l, d);
      continue;
    }
    const w = h[m.key] || [];
    w.length > 1 && !d.rowChrome && (u.strokeStyle = "#2c2c38", u.lineWidth = 1, u.beginPath(), u.moveTo(E(w[0], f, l, d), v), u.lineTo(E(w[w.length - 1], f, l, d), v), u.stroke()), u.fillStyle = Se[m.key] || "#8b7bd8";
    const C = d.rowChrome ? 5.5 : 3.5;
    for (const R of w) {
      const k = Math.max(
        d.labelWidth + C,
        Math.min(f - C, E(R, f, l, d))
      );
      u.beginPath(), u.moveTo(k, v - C), u.lineTo(k + C, v), u.lineTo(k, v + C), u.lineTo(k - C, v), u.closePath(), u.fill();
    }
  }
  if (d.ruler) {
    u.fillStyle = "#3a3a48";
    const m = Math.min(12, l);
    for (let v = 0; v <= m; v += 1) {
      const w = Math.round(v / Math.max(1, m) * (l - 1));
      u.fillRect(E(w, f, l, d), b - 6, 1, 5);
    }
  }
  if (d.playhead) {
    const m = E(Math.max(0, Math.min(l - 1, Number(i) || 0)), f, l, d);
    u.fillStyle = "#e6e6f0", u.fillRect(Math.round(m), 0, 1, b);
  }
  return { ...g, keys: h };
}
function $(r) {
  return { unknown: 0, good: 1, weak: 2, bad: 3 }[r] ?? 0;
}
class qe {
  /**
   * @param root the panel root, queried for its own `data-role` elements
   * @param onSeek called with a frame when the user scrubs the strip
   */
  constructor(t, { onSeek: e = () => {
  } } = {}) {
    this.root = t, this.onSeek = e, this.scrubbing = !1;
  }
  $(t) {
    return this.root?.querySelector(`[data-role="${t}"]`) || null;
  }
  /**
   * Draw the strip for one track.
   *
   * The track passed in is whichever the viewer is showing, so switching
   * RAW/REFINED therefore moves the displayed keys with it.
   */
  render({ track: t = null, health: e = null, quality: a = [], anomalies: o = [], frame: i = 0, frameCount: s = 0 } = {}) {
    const n = this.$("track-timeline");
    if (!n) return null;
    const c = Te(void 0, Z);
    return n.height !== c && (n.height = c), je(n, {
      track: t,
      health: e,
      quality: a,
      anomalies: o,
      frame: i,
      layout: Z,
      frameCount: Math.max(Number(s) || 0, Number(t?.duration_frames) || 0)
    });
  }
  /** Which frame a pointer event over the strip refers to, or null. */
  frameAt(t, e) {
    const a = this.$("extractor-dope-tracks");
    if (!a?.getBoundingClientRect) return null;
    const o = a.getBoundingClientRect();
    return Re(t.clientX - o.left, o.width, e, 0);
  }
  /** Wire scrubbing. `listen` is the panel's own disposal-tracked binder. */
  bind(t, e) {
    const a = this.$("extractor-dope-tracks");
    t(a, "pointerdown", (o) => {
      a.setPointerCapture?.(o.pointerId), this.scrubbing = !0, this.pointerId = o.pointerId, this.seek(o, e());
    }), t(a, "pointermove", (o) => {
      this.scrubbing && o.pointerId === this.pointerId && this.seek(o, e());
    });
    for (const o of ["pointerup", "pointercancel"])
      t(a, o, (i) => {
        i.pointerId === this.pointerId && (a.releasePointerCapture?.(i.pointerId), this.scrubbing = !1, this.pointerId = null);
      });
  }
  seek(t, e) {
    const a = this.frameAt(t, e);
    return a !== null && this.onSeek(a), a;
  }
}
const Ue = [
  "first-frame",
  "previous-key",
  "previous-frame",
  "play",
  "next-frame",
  "next-key",
  "last-frame",
  "toggle-loop"
], Ge = {
  "first-frame": '[data-act="first-frame"]',
  "previous-key": '[data-act="previous-key"]',
  "previous-frame": '[data-act="previous-frame"]',
  play: '[data-act="play"]',
  "next-frame": '[data-act="next-frame"]',
  "next-key": '[data-act="next-key"]',
  "last-frame": '[data-act="last-frame"]',
  "toggle-loop": '[data-act="toggle-loop"]'
};
function V(r) {
  return [...new Set((r || []).map((t) => Number(typeof t == "object" ? t?.frame : t)).filter(Number.isFinite).map((t) => Math.max(0, Math.round(t))))].sort((t, e) => t - e);
}
function He(r, t) {
  const e = V(r?.anomalies), a = V(Object.values(lt(t)).flat()), o = a.length ? a : V(t?.keyframes);
  return { anomalies: e, solved: o };
}
function j(r, t, { anomalies: e, solved: a }) {
  const o = t > 0 ? (s) => s > r : (s) => s < r, i = (s) => {
    const n = s.filter(o);
    return t > 0 ? n[0] : n.at(-1);
  };
  return i(e) ?? i(a) ?? null;
}
function We(r) {
  const t = String(r?.tagName || "").toLowerCase();
  return r?.isContentEditable || t === "textarea" || t === "select" ? !0 : t === "input" && ["text", "number"].includes(String(r.type || "text").toLowerCase());
}
function q(r) {
  return Math.max(0, Math.round(Number(r?.frameCount) || 0));
}
function ze(r, {
  coordinator: t,
  getState: e = () => ({}),
  getTrack: a = () => null,
  listen: o = (i, s, n) => i?.addEventListener?.(s, n)
} = {}) {
  const i = (d) => r?.querySelector?.(Ge[d]) || null, s = () => e() || {}, n = () => He(s(), a()), c = (d) => q(s()) < 1 ? !1 : (t?.seek?.(d, "transport"), !0), l = (d) => {
    const g = j(Number(s().frame) || 0, d, n());
    return g === null ? !1 : c(g);
  }, h = {
    "first-frame": () => c(0),
    "previous-key": () => l(-1),
    "previous-frame": () => c((Number(s().frame) || 0) - 1),
    play: () => q(s()) > 0 && !!t?.toggle?.(),
    "next-frame": () => c((Number(s().frame) || 0) + 1),
    "next-key": () => l(1),
    "last-frame": () => c(q(s()) - 1),
    "toggle-loop": () => (t?.setLoop?.(!t?.loop), p(), !0)
  };
  for (const d of Ue) {
    const g = i(d);
    g && o(g, "click", () => h[d]());
  }
  o(r, "keydown", (d) => {
    if (We(d.target)) return;
    const g = {
      " ": "play",
      Spacebar: "play",
      Space: "play",
      ArrowLeft: "previous-frame",
      ArrowRight: "next-frame",
      Home: "first-frame",
      End: "last-frame"
    }[d.key];
    !g || !h[g]() || (d.preventDefault(), d.stopPropagation());
  });
  function p() {
    const d = Number(s().frame) || 0, g = n(), u = i("previous-key");
    u && (u.disabled = j(d, -1, g) === null);
    const f = i("next-key");
    f && (f.disabled = j(d, 1, g) === null);
    const b = i("toggle-loop");
    b && b.setAttribute("aria-pressed", String(!!t?.loop));
    const x = i("play");
    if (x) {
      x.classList?.toggle?.("playing", !!t?.playing);
      const y = x.querySelector?.("i");
      y && (y.className = t?.playing ? "pi pi-pause" : "pi pi-play"), x.setAttribute("aria-label", t?.playing ? "Pause playback" : "Play playback");
    }
  }
  return { render: p };
}
const Be = 300, Ke = 300, T = {
  accepted: "#46a758",
  weak: "#e5a23c",
  rejected: "#e5484d",
  current: "#8b7bd8"
};
function tt(r, t) {
  const e = Array.isArray(r) ? r : [];
  if (e.length <= t) return e.slice();
  const a = e.length / t, o = [];
  for (let i = 0; i < t; i += 1) o.push(e[Math.floor(i * a)]);
  return o;
}
function U(r, { sourceWidth: t, sourceHeight: e, width: a, height: o }) {
  const i = Number(r?.x ?? r?.[0]) || 0, s = Number(r?.y ?? r?.[1]) || 0, n = i <= 1 && s <= 1 && i >= 0 && s >= 0, c = n ? a : a / Math.max(1, t || a), l = n ? o : o / Math.max(1, e || o);
  return [i * c, s * l];
}
class Xe {
  constructor(t) {
    this.canvas = t, this.points = [], this.vectors = [], this.frame = 0, this.state = "unknown";
  }
  setDiagnostics({ points: t = [], vectors: e = [], frame: a = 0, state: o = "unknown" } = {}) {
    this.points = tt(t, Be), this.vectors = tt(e, Ke), this.frame = Number(a) || 0, this.state = String(o || "unknown"), this.draw();
  }
  clear() {
    this.points = [], this.vectors = [];
    const t = this.canvas?.getContext?.("2d");
    t && t.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  draw({ sourceWidth: t = 0, sourceHeight: e = 0 } = {}) {
    const a = this.canvas?.getContext?.("2d"), o = this.canvas?.width || 0, i = this.canvas?.height || 0;
    if (!a || !o || !i) return { points: this.points.length, vectors: this.vectors.length };
    const s = { sourceWidth: t, sourceHeight: e, width: o, height: i };
    a.clearRect(0, 0, o, i), a.lineWidth = 1;
    for (const n of this.vectors) {
      const [c, l] = U(n.from ?? n, s), [h, p] = U(n.to ?? n, s);
      a.strokeStyle = T[n.state] || T.accepted, a.beginPath(), a.moveTo(c, l), a.lineTo(h, p), a.stroke();
    }
    for (const n of this.points) {
      const [c, l] = U(n, s);
      a.fillStyle = T[n.state] || T.accepted, a.fillRect(c - 1.5, l - 1.5, 3, 3);
    }
    return (this.state === "weak" || this.state === "bad") && (a.strokeStyle = this.state === "bad" ? T.rejected : T.weak, a.lineWidth = 2, a.strokeRect(1, 1, o - 2, i - 2)), { points: this.points.length, vectors: this.vectors.length };
  }
  dispose() {
    this.clear(), this.canvas = null;
  }
}
function Ye(r, t, e) {
  const a = r.createElement("div");
  a.className = "oc-row";
  const o = r.createElement("span");
  o.textContent = t;
  const i = r.createElement("span");
  return i.textContent = e, a.append(o, i), a;
}
function Je(r, t, e = "Nothing to show") {
  if (!r) return 0;
  const a = r.ownerDocument;
  if (r.replaceChildren(), !t.length) {
    const o = a.createElement("div");
    return o.className = "oc-empty", o.textContent = e, r.append(o), 0;
  }
  for (const [o, i] of t) r.append(Ye(a, o, i));
  return t.length;
}
function Qe(r, t, { onAction: e = () => {
}, onFrame: a = () => {
}, actions: o = {} } = {}) {
  if (!r) return 0;
  const i = r.ownerDocument;
  if (r.replaceChildren(), !t?.length) {
    const s = i.createElement("div");
    return s.className = "oc-empty", s.textContent = "No anomalies detected", r.append(s), 0;
  }
  for (const s of t) {
    const n = i.createElement("div");
    n.className = "oc-anomaly", n.dataset.level = String(s.level || "warn");
    const c = i.createElement("div");
    c.className = "oc-anomaly-text";
    const l = i.createElement("strong"), h = Number(s.start_frame ?? s.frame), p = Number(s.end_frame ?? s.frame);
    l.textContent = h === p ? `Frame ${h}` : `Frames ${h}-${p}`, l.tabIndex = 0, l.setAttribute("role", "button"), l.addEventListener("click", () => a(s.frame)), l.addEventListener("keydown", (u) => {
      (u.key === "Enter" || u.key === " ") && (u.preventDefault(), a(s.frame));
    });
    const d = i.createElement("small");
    d.textContent = `${String(s.level || "warn").toUpperCase()} · ${s.detail || s.kind || ""}`, c.append(l, d), n.append(c);
    const g = o[String(s.frame)] || s.suggested_action || "ignore";
    for (const u of ["interpolate", "ignore", "exclude"]) {
      const f = i.createElement("button");
      f.type = "button", f.textContent = u.toUpperCase(), f.dataset.action = u, f.dataset.frame = String(s.frame), u === g && f.setAttribute("aria-selected", "true"), f.addEventListener("click", () => e(s, u)), n.append(f);
    }
    r.append(n);
  }
  return t.length;
}
function Ze(r) {
  return (r || []).map((t, e) => [`Note ${e + 1}`, String(t)]);
}
function tr(r) {
  return import("./chunk-BfLOanS0.js").then(({ TrackViewer: t }) => (r.viewerLoad = null, r.disposed || r.viewer || (r.viewer = new t(r.$("track-canvas")), r.pushTracksToViewer()), r.viewer)).catch((t) => (r.viewerLoad = null, console.warn("OmniCam track viewer unavailable", t), null));
}
function et(r) {
  const t = r.$("frame");
  t && (t.value = String(r.state.frame));
  const e = r.$("time");
  e && (e.textContent = X(r.state.frame, r.sourceViewer.fps));
  const a = r.$("frame-readout");
  a && (a.textContent = `${r.state.frame} / ${Math.max(0, r.state.frameCount - 1)} · ${X(r.state.frame, r.sourceViewer.fps)}`);
  const o = ke(r.state.quality, r.state.frame), i = Pe(r.state.quality, r.currentHealth, r.state.frame);
  Je(r.$("quality-details"), [...o, ...i, ...Ze(r.state.warnings)], "No solve yet");
}
function rt(r) {
  const t = r.$("extractor-ruler"), e = r.$("extractor-playhead"), a = Math.max(1, r.state.frameCount);
  if (!t || !e) return;
  const o = Math.min(12, a - 1 || 1);
  t.replaceChildren();
  for (let i = 0; i <= o; i += 1) {
    const s = Math.round(i / o * (a - 1)), n = `${i / o * 100}%`, c = t.ownerDocument.createElement("i");
    if (c.className = `oc-tick${i % 2 === 0 ? " major" : ""}`, c.style.left = n, t.append(c), i % 2 === 0) {
      const l = t.ownerDocument.createElement("span");
      l.className = "timeline-tick", l.style.left = n, l.textContent = String(s), t.append(l);
    }
  }
  e.style.left = `${Math.max(0, Math.min(a - 1, r.state.frame)) / Math.max(1, a - 1) * 100}%`;
}
const er = [
  "method",
  "lens_mode",
  "fov_degrees",
  "focal_length_mm",
  "sensor_width_mm",
  "max_dimension",
  "frame_step"
], at = [
  "normalize_origin",
  "motion_scale",
  "position_smoothing",
  "rotation_smoothing",
  "simplify_keys",
  "position_tolerance",
  "rotation_tolerance_deg"
];
function A(r, t) {
  return r?.widgets?.find((e) => e.name === t) || null;
}
const rr = [Et, Ct, H];
function G(r) {
  for (const t of rr) {
    const e = A(r, t);
    e && (e.computeSize = () => [0, -4], e.draw = () => {
    }, e.hidden = !0, e.type = "hidden", e.options = { ...e.options || {}, hideInVueNodes: !0, serialize: !0 });
  }
  r.setDirtyCanvas?.(!0, !0);
}
function ar(r) {
  G(r), globalThis.requestAnimationFrame?.(() => G(r)), setTimeout(() => G(r), 250);
}
class or {
  constructor(t) {
    this.node = t, this.root = we(), this.state = he(), this.disposed = !1, this.disposers = [], this.requests = new At(), this.result = { raw: null, refined: null }, this.landmarks = [], this.diagnostics = new Ht(), this.upstreamPreviewActive = !1, this.motionLimits = null, this.client = new jt(N), this.refine = new Ut({ onRefine: (e) => this.requestRefine(e) }), this.fallbackViewer = new re(this.$("fallback-preview"), { api: N }), this.sourceViewer = new Yt(this.$("source-video"), {
      onFrame: (e) => this.coordinator.seek(e, "media"),
      onMetadata: ({ frameCount: e }) => this.adoptSourceLength(e),
      onError: (e) => this.dispatch({ type: "SOURCE", source: { playbackError: e } }),
      onMode: () => this.render(),
      fallbackViewer: this.fallbackViewer
    }), this.coordinator = new Bt({
      media: this.sourceViewer,
      getViewer: () => this.viewer,
      showDiagnostics: (e) => this.showDiagnostics(e),
      dispatch: (e) => this.dispatch(e),
      setFollow: (e) => this.sourceViewer.setFollow(e),
      frameCount: this.state.frameCount,
      fps: this.sourceViewer.fps,
      loop: !0,
      onPlaybackState: () => this.transport?.render()
    }), this.timeline = new qe(this.root, {
      onSeek: (e) => this.coordinator.seek(e, "timeline")
    }), this.transport = ze(this.root, {
      coordinator: this.coordinator,
      getState: () => this.state,
      getTrack: () => this.state.trackMode === "raw" ? this.result.raw : this.result.refined,
      listen: (e, a, o) => this.listen(e, a, o)
    }), this.overlay = new Xe(this.$("tracking-overlay")), this.viewer = null, this.viewerLoad = null, this.events = new Pt(N, {
      job: (e) => this.dispatch({ type: "JOB_STATE", state: e.state }),
      progress: (e) => this.onProgress(e),
      pose: (e) => this.onPose(e),
      quality: (e) => this.onQuality(e),
      features: (e) => this.onFeatures(e),
      completed: (e) => this.onCompleted(e),
      failed: (e) => this.dispatch({ type: "FAILED", error: e.error })
    }, Ot(() => ({ jobId: this.state.jobId, nodeId: this.node.id }))), this.bind(), this.loadMotionLimits(), this.refreshSource(), this.restoreCachedResult(), this.render();
  }
  // -- plumbing ----------------------------------------------------------
  $(t) {
    return this.root.querySelector(`[data-role="${t}"]`);
  }
  listen(t, e, a, o) {
    t && (t.addEventListener(e, a, o), this.disposers.push(() => t.removeEventListener(e, a, o)));
  }
  dispatch(t) {
    return this.state = D(this.state, t), this.disposed || this.render(), this.state;
  }
  async loadMotionLimits() {
    try {
      const t = await this.requests.run(async (e) => {
        const a = await N.fetchApi?.("/majoor/omnicam/motion_profiles", { signal: e });
        return a?.ok ? a.json() : void 0;
      });
      if (t === void 0) return;
      this.motionLimits = t?.profiles?.find((e) => e.id === "generic")?.limits || null, this.disposed || this.render();
    } catch {
    }
  }
  bind() {
    for (const t of this.root.querySelectorAll("[data-tab]"))
      this.listen(t, "click", () => this.setViewerMode(t.dataset.tab));
    for (const t of this.root.querySelectorAll("[data-track-mode]"))
      this.listen(t, "click", () => this.setTrackMode(t.dataset.trackMode));
    for (const t of this.root.querySelectorAll("[data-view]"))
      this.listen(t, "click", () => this.viewer?.setView(t.dataset.view));
    for (const t of this.root.querySelectorAll("[data-inspection-view]"))
      this.listen(t, "click", () => {
        const e = this.viewer?.setInspectionView(t.dataset.inspectionView) || "scene";
        for (const a of this.root.querySelectorAll("[data-inspection-view]"))
          a.setAttribute("aria-selected", String(a.dataset.inspectionView === e));
        for (const a of this.root.querySelectorAll("[data-view], [data-act='fit']"))
          a.disabled = e === "camera";
      });
    this.listen(this.root.querySelector('[data-act="track"]'), "click", () => this.startSolve()), this.listen(this.root.querySelector('[data-act="stop"]'), "click", () => this.control("stopSolve")), this.listen(this.root.querySelector('[data-act="fit"]'), "click", () => this.viewer?.fit()), this.listen(this.root.querySelector('[data-act="apply"]'), "click", () => this.applyRefined()), this.listen(this.root.querySelector('[data-act="reset-refine"]'), "click", () => this.resetRefine()), this.listen(this.$("scrubber"), "input", (t) => this.coordinator.seek(Number(t.target.value), "input")), this.listen(this.$("frame"), "change", (t) => this.coordinator.seek(Number(t.target.value), "input")), this.listen(this.$("follow-solve"), "change", (t) => this.sourceViewer.setFollow(t.target.checked)), this.timeline.bind(
      (t, e, a) => this.listen(t, e, a),
      () => this.state.frameCount
    ), this.bindRefineControls();
  }
  bindRefineControls() {
    const t = {
      "position-smoothing": "position_smoothing",
      "rotation-smoothing": "rotation_smoothing",
      "motion-scale": "motion_scale",
      "position-tolerance": "position_tolerance"
    };
    for (const [e, a] of Object.entries(t)) {
      const o = this.$(e);
      this.listen(o, "input", () => {
        this.refine.update({ [a]: Number(o.value) }), this.renderRefineValues();
      });
    }
    for (const e of ["pitch", "yaw", "roll"]) {
      const a = this.$(`align-${e}`);
      this.listen(a, "input", () => {
        this.refine.setAlignment({ [e]: Number(a.value) }), this.renderRefineValues();
      });
    }
    this.listen(this.root.querySelector('[data-act="reset-alignment"]'), "click", () => {
      for (const e of ["pitch", "yaw", "roll"]) {
        const a = this.$(`align-${e}`);
        a && (a.value = "0");
      }
      this.refine.setAlignment({ pitch: 0, yaw: 0, roll: 0 }), this.renderRefineValues();
    }), this.listen(this.root.querySelector('[data-act="estimate-up"]'), "click", () => this.estimateUp()), this.listen(
      this.root.querySelector('[data-act="set-in"]'),
      "click",
      () => this.setTrim("trim-start", "trim_start_frame")
    ), this.listen(
      this.root.querySelector('[data-act="set-out"]'),
      "click",
      () => this.setTrim("trim-end", "trim_end_frame")
    ), this.listen(this.root.querySelector('[data-act="reset-trim"]'), "click", () => {
      for (const e of ["trim-start", "trim-end"]) {
        const a = this.$(e);
        a && (a.value = "0");
      }
      this.refine.update({ trim_start_frame: 0, trim_end_frame: 0 });
    });
    for (const [e, a] of [["trim-start", "trim_start_frame"], ["trim-end", "trim_end_frame"]]) {
      const o = this.$(e);
      this.listen(o, "change", () => this.refine.update({ [a]: Math.max(0, Number(o.value) || 0) }));
    }
    for (const [e, a] of [["normalize-origin", "normalize_origin"], ["simplify-keys", "simplify_keys"]]) {
      const o = this.$(e);
      this.listen(o, "change", () => this.refine.update({ [a]: !!o.checked }));
    }
  }
  // -- source ------------------------------------------------------------
  refreshSource() {
    return le(this);
  }
  /**
   * Ask the server what this footage is, before anything is solved.
   *
   * Without it the panel knows a filename and nothing else: no rate, no frame
   * count, so the scrubber has no range and the strip has nothing to say.
   */
  async describeSource(t) {
    return it(this, t);
  }
  /** Give the transport a real range, from the footage rather than a solve. */
  adoptSourceLength(t) {
    return W(this, t);
  }
  solveSettings() {
    const t = {};
    for (const a of er) {
      const o = A(this.node, a);
      if (!o) continue;
      const i = ["fov_degrees", "focal_length_mm", "sensor_width_mm", "max_dimension", "frame_step"];
      t[a] = i.includes(a) ? Number(o.value) : String(o.value);
    }
    const e = {};
    for (const a of at) {
      const o = A(this.node, a);
      o && (e[a] = typeof o.value == "boolean" ? o.value : Number(o.value));
    }
    return t.refine = e, t;
  }
  // -- solve control -----------------------------------------------------
  async startSolve() {
    const t = this.refreshSource();
    if (t.available)
      try {
        this.sourceViewer.setFollow(!0);
        const e = await this.client.startSolve({
          nodeId: this.node.id,
          source: t.ref,
          settings: this.solveSettings()
        });
        this.overlay.clear(), this.diagnostics.clear(), this.dispatch({ type: "JOB_STARTED", status: e }), this.coordinator.reconcileFrameCount(e), this.coordinator.seek(0, "backend");
      } catch (e) {
        this.dispatch({ type: "FAILED", error: String(e?.message || e) });
      }
  }
  async control(t) {
    if (this.state.jobId)
      try {
        const e = await this.client[t](this.state.jobId);
        this.dispatch({ type: "STATUS", status: e }), this.coordinator.reconcileFrameCount(e);
      } catch (e) {
        this.dispatch({ type: "FAILED", error: String(e?.message || e) });
      }
  }
  /** The socket is transport; the server is the truth. Re-read after a gap. */
  async recoverStatus() {
    if (!this.state.jobId) return null;
    try {
      const t = await this.client.getSolveStatus(this.state.jobId);
      return this.dispatch({ type: "STATUS", status: t }), this.coordinator.reconcileFrameCount(t), t.state === "COMPLETED" && await this.loadResult(), t;
    } catch {
      return null;
    }
  }
  onProgress(t) {
    this.dispatch({ type: "PROGRESS", progress: t }), this.coordinator.reconcileFrameCount(t), this.sourceViewer.follow && this.coordinator.seek(Number(t.frame) || 0, "backend");
  }
  onPose(t) {
    this.dispatch({ type: "POSE", pose: t });
  }
  onQuality(t) {
    this.dispatch({ type: "QUALITY", samples: t.samples || [] });
  }
  /**
   * Paint the features the solver matched on this frame.
   *
   * Live telemetry, so it is drawn straight onto the overlay rather than routed
   * through the reducer: keeping every frame's points in panel state would grow
   * without bound over a long clip, and none of it is needed once the frame has
   * moved on.
   */
  onFeatures(t) {
    const e = this.diagnostics.set(Number(t.frame) || 0, {
      points: t.points || [],
      frame: Number(t.frame) || 0,
      state: String(t.state || "unknown")
    });
    e.frame === this.state.frame && this.overlay.setDiagnostics(e);
  }
  async onCompleted(t) {
    this.dispatch({ type: "COMPLETED", result: t }), await this.loadResult();
  }
  async loadResult() {
    if (!this.state.jobId) return null;
    try {
      const t = await this.client.getSolveResult(this.state.jobId);
      return this.acceptSolvedResult(t, "interactive"), t;
    } catch (t) {
      return this.dispatch({ type: "FAILED", error: String(t?.message || t) }), null;
    }
  }
  acceptSolvedResult(t, e = "interactive") {
    const a = t?.raw_track || t?.raw || t?.track || null, o = t?.refined_track || t?.refined || t?.track || a;
    if (!o?.keyframes?.length) return !1;
    const i = String(
      t?.fingerprint || o?.metadata?.extractor_fingerprint || ""
    );
    return this.result = { raw: a || o, refined: o }, this.landmarks = Array.isArray(t?.landmarks_3d) ? t.landmarks_3d : [], e === "queued" && this.dispatch({ type: "QUEUED_RESULT" }), this.dispatch({
      type: "STATUS",
      status: {
        anomalies: t?.anomalies || [],
        state: "COMPLETED",
        job_id: this.state.jobId,
        backend: o?.metadata?.backend
      }
    }), this.dispatch({ type: "REFINED", fingerprint: i }), this.pushTracksToViewer(), e === "queued" && (ot(this.node, {
      fingerprint: i,
      confidence: Number(t?.confidence ?? o?.metadata?.confidence) || 0
    }), t?.source && xt(this.node, t.source), this.node.__majoorOmniCamStatus = wt({
      track: o,
      confidence: Number(t?.confidence ?? o?.metadata?.confidence) || 0
    }), this.dispatch({ type: "APPLIED", fingerprint: i }), t?.source && this.refreshSource()), !0;
  }
  async requestRefine(t) {
    if (!this.state.jobId || this.state.solveState !== "COMPLETED") return null;
    try {
      this.syncRefineWidgets(t);
      const e = await this.client.refineSolve(this.state.jobId, t);
      return this.result = { ...this.result, refined: e.refined_track }, this.dispatch({ type: "REFINED", fingerprint: e.fingerprint }), this.pushTracksToViewer(), e;
    } catch (e) {
      return this.dispatch({ type: "FAILED", error: String(e?.message || e) }), null;
    }
  }
  /** Keep queued execution and interactive cleanup on the same widget values. */
  syncRefineWidgets(t) {
    for (const e of at) {
      if (t[e] === void 0) continue;
      const a = A(this.node, e);
      a && (a.value = t[e]);
    }
  }
  /**
   * Level the world from the solve's own average up vector.
   *
   * Deliberately a button rather than something applied silently: a shot that
   * was genuinely filmed tilted is indistinguishable from a tilted
   * reconstruction, and only the user knows which they shot.
   */
  async estimateUp() {
    this.refine.requestEstimatedUp();
    const t = await this.refine.flush(), e = t?.resolved_alignment;
    if (!e) return null;
    const [a, o, i, s] = e.map(Number), n = (h) => Math.round(h * (180 / Math.PI) * 10) / 10, c = n(Math.atan2(2 * (s * a + o * i), 1 - 2 * (a * a + o * o))), l = n(Math.atan2(2 * (s * i + a * o), 1 - 2 * (o * o + i * i)));
    for (const [h, p] of [["pitch", c], ["yaw", 0], ["roll", l]]) {
      const d = this.$(`align-${h}`);
      d && (d.value = String(p));
    }
    return this.refine.alignment = { pitch: c, yaw: 0, roll: l }, this.renderRefineValues(), t;
  }
  resetRefine() {
    this.refine.reset();
    for (const [t, e] of [
      ["position-smoothing", 0.15],
      ["rotation-smoothing", 0.1],
      ["motion-scale", 1],
      ["position-tolerance", 0.01],
      ["align-pitch", 0],
      ["align-yaw", 0],
      ["align-roll", 0]
    ]) {
      const a = this.$(t);
      a && (a.value = String(e));
    }
    this.renderRefineValues();
  }
  setTrim(t, e) {
    const a = this.$(t);
    a && (a.value = String(this.state.frame)), this.refine.update({ [e]: this.state.frame });
  }
  applyRefined() {
    try {
      const { fingerprint: t } = Kt(this.node, {
        track: this.result.refined,
        state: this.state.solveState
      });
      this.dispatch({ type: "APPLIED", fingerprint: t });
    } catch (t) {
      const e = t instanceof _ ? t.message : String(t?.message || t);
      this.dispatch({ type: "FAILED", error: e });
    }
  }
  // -- viewer ------------------------------------------------------------
  ensureViewer() {
    return this.viewer || this.disposed ? Promise.resolve(this.viewer) : (this.viewerLoad ||= tr(this), this.viewerLoad);
  }
  pushTracksToViewer() {
    this.viewer && (this.viewer.setRawTrack(this.result.raw), this.viewer.setRefinedTrack(this.result.refined), this.viewer.setLandmarks(this.landmarks), this.viewer.setMode(this.state.trackMode), this.coordinator.seek(this.state.frame, "sync"));
  }
  async setViewerMode(t) {
    this.dispatch({ type: "VIEWER_MODE", mode: t }), t !== "source" && (await this.ensureViewer(), !this.disposed && (this.viewer?.resize(), this.viewer?.fit()));
  }
  setTrackMode(t) {
    this.dispatch({ type: "TRACK_MODE", mode: t }), this.viewer?.setMode(t);
  }
  showDiagnostics(t) {
    const e = this.diagnostics.get(t);
    e ? this.overlay.setDiagnostics(e) : this.overlay.clear();
  }
  // -- rendering ---------------------------------------------------------
  render() {
    const t = this.$("solve-status");
    t && (t.dataset.tone = me(this.state.solveState), this.$("solve-status-text").textContent = fe(this.state));
    const e = this.$("source-strip");
    e && (e.dataset.available = String(!!this.state.source.available), this.$("source-label").textContent = ce(this.state.source));
    const a = pe(this.state);
    for (const [b, x] of Object.entries({
      track: a.track,
      stop: a.stop,
      apply: a.apply
    })) {
      const y = this.root.querySelector(`[data-act="${b}"]`);
      y && (y.disabled = !x);
    }
    this.$("solve-detail").textContent = be(this.state), this.$("solve-percent").textContent = `${Math.round(this.state.progress * 100)}%`, this.$("progress-bar").style.width = `${Math.round(this.state.progress * 100)}%`;
    const o = this.$("solve-error");
    o.hidden = !this.state.error, o.textContent = this.state.error || "";
    const i = ge(this.state), s = this.$("applied-state");
    s.dataset.state = i, s.textContent = i;
    for (const b of this.root.querySelectorAll("[data-tab]"))
      b.setAttribute("aria-selected", String(b.dataset.tab === this.state.viewerMode));
    for (const b of this.root.querySelectorAll("[data-track-mode]"))
      b.setAttribute("aria-selected", String(b.dataset.trackMode === this.state.trackMode));
    const n = this.state.viewerMode, c = n === "source", l = n === "track3d", h = this.$("stage");
    h && (h.dataset.mode = n), It(this, c), this.$("tracking-overlay").hidden = !0, this.$("track-canvas").hidden = !l, this.root.querySelector('[data-role="views"]').hidden = !l;
    const p = this.$("scrubber");
    p && (p.max = String(Math.max(0, this.state.frameCount - 1)));
    const d = this.$("frame");
    d && (d.max = String(Math.max(0, this.state.frameCount - 1)));
    const g = this.$("frame-total");
    g && (g.textContent = `/ ${Math.max(0, this.state.frameCount - 1)}`);
    const u = this.$("extractor-fps");
    u && (u.textContent = String(this.sourceViewer.fps || 24)), Qe(this.$("anomalies"), this.state.anomalies, {
      actions: this.refine.settings.spike_actions,
      onFrame: (b) => this.coordinator.seek(b, "anomaly"),
      onAction: (b, x) => {
        const y = Number(b.start_frame ?? b.frame) || 0, m = Math.max(y, Number(b.end_frame ?? b.frame) || y);
        for (let v = y; v <= m; v += 1) this.refine.setSpikeAction(v, x);
        this.render();
      }
    }), this.renderTimeline(), this.transport.render(), et(this), rt(this);
    const f = this.$("stage-notice");
    if (f) {
      const b = this.state.source.playbackError || (this.upstreamPreviewActive ? "Preview only -- connect Load Video, or run the graph once, to track this source." : "");
      f.hidden = !b || !c, f.textContent = b;
    }
  }
  /**
   * The read-only solved camera channels, aligned to the source frame clock.
   */
  renderTimeline() {
    const t = this.state.trackMode === "raw" ? this.result.raw : this.result.refined;
    return this.currentHealth = Ae(t, this.motionLimits), this.timeline.render({
      track: t,
      health: this.currentHealth,
      quality: this.state.quality,
      anomalies: this.state.anomalies,
      frame: this.state.frame,
      frameCount: this.state.frameCount
    });
  }
  renderFrameReadouts() {
    return et(this);
  }
  /** Keep the read-only solve sheet on the exact same frame axis as playback. */
  renderExtractorRuler() {
    rt(this);
  }
  renderRefineValues() {
    for (const t of [
      "position-smoothing",
      "rotation-smoothing",
      "motion-scale",
      "position-tolerance",
      "align-pitch",
      "align-yaw",
      "align-roll"
    ]) {
      const e = this.$(t), a = this.$(`${t}-out`);
      e && a && (a.textContent = e.value);
    }
  }
  // -- lifecycle ---------------------------------------------------------
  restoreCachedResult() {
    const t = kt(this.node);
    t && (this.result = { raw: t.track, refined: t.track }, this.state = D(this.state, { type: "APPLIED", fingerprint: t.fingerprint }), this.state = D(this.state, { type: "REFINED", fingerprint: t.fingerprint }));
  }
  executed(t) {
    const e = St(t);
    e && this.acceptSolvedResult(e, "queued");
  }
  dispose() {
    Vt(this.client, this.state), this.disposed = !0, this.requests.dispose(), this.events.dispose(), this.refine.dispose(), this.coordinator.dispose(), this.sourceViewer.dispose(), this.overlay.dispose(), this.diagnostics.dispose(), this.viewer?.dispose(), this.viewer = null, this.viewerLoad = null;
    for (const t of this.disposers.splice(0)) t();
    this.result = { raw: null, refined: null };
  }
}
function ur(r) {
  if (r.__majoorOmniCamExtractor) return;
  if (vt(r), !A(r, H)) {
    const n = r.addWidget?.("text", H, "", () => {
    }, { serialize: !0 });
    n && (n.computeSize = () => [0, -4], n.draw = () => {
    }, n.hidden = !0);
  }
  ar(r), yt(r);
  const t = new or(r);
  r.__majoorOmniCamExtractor = t;
  const e = () => Math.max(700, t.root.scrollHeight || 0);
  r.addDOMWidget("majoor_omnicam_extractor", "omnicam", t.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 700,
    getHeight: e,
    getMaxHeight: e
  }), r.setSize([Math.max(r.size?.[0] || 0, 800), Math.max(r.size?.[1] || 0, 780)]);
  const a = r.onRemoved;
  r.onRemoved = function() {
    t.dispose(), a?.apply(this, arguments);
  };
  const o = r.onExecuted;
  r.onExecuted = function(n) {
    o?.apply(this, arguments), t.executed(n);
  };
  const i = r.onConnectionsChange;
  r.onConnectionsChange = function() {
    i?.apply(this, arguments), t.refreshSource(), setTimeout(() => {
      t.disposed || t.refreshSource();
    }, 400);
  };
  const s = r.onAfterGraphConfigured;
  r.onAfterGraphConfigured = function() {
    s?.apply(this, arguments), t.refreshSource(), t.recoverStatus();
  };
}
export {
  ur as attachExtractor
};
