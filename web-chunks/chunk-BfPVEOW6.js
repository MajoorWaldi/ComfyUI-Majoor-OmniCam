import "../../scripts/app.js";
import { api as I } from "../../scripts/api.js";
import { d as K, u as B, l as H, S as Q } from "./chunk-B0ZcW-l0.js";
import { M as Y, t as X, d as J, f as Z, D as S, q as tt, a as et, b as rt } from "./chunk-BOOWUhms.js";
import { g as G, n as ot, L as at, h as st, S as R, i as it, j as nt, r as ct, p as lt, T as dt, F as ut } from "./chunk-Bmyaq-AJ.js";
import { Z as ht } from "./chunk-DMJgQTTA.js";
function pt(e, t) {
  const r = e.$("tracking-overlay"), o = Math.round(Number(t?.width) || 0), a = Math.round(Number(t?.height) || 0);
  return !r || o < 1 || a < 1 || r.width === o && r.height === a ? !1 : (r.width = o, r.height = a, e.overlay.draw(), !0);
}
async function mt(e, t) {
  const r = e.$("upstream-preview");
  if (!r) return;
  const o = t.available ? null : t.previewMedia;
  e.upstreamPreviewActive = o ? await K(o, r, 960) : !1, e.disposed || e.render();
}
function ft(e, t, { fromVideo: r = !1 } = {}) {
  const o = Math.max(0, Number(t) || 0), a = e.state.frame !== o;
  if (e.state.frame = o, a && e.overlay.frame !== o) {
    const i = e.diagnostics.get(o);
    i ? e.overlay.setDiagnostics(i) : e.overlay.clear();
  }
  const s = e.$("scrubber");
  s && r && (s.value = String(o)), e.viewer?.setFrame(o), e.renderFrameReadouts();
}
const gt = {
  job: "majoor.omnicam.extractor.job",
  progress: "majoor.omnicam.extractor.progress",
  pose: "majoor.omnicam.extractor.pose",
  quality: "majoor.omnicam.extractor.quality",
  features: "majoor.omnicam.extractor.features",
  completed: "majoor.omnicam.extractor.completed",
  failed: "majoor.omnicam.extractor.failed"
};
class vt {
  /**
   * @param api ComfyUI api object
   * @param handlers one callback per SOLVE_EVENTS key
   * @param match ({job_id, node_id}) => boolean, deciding what belongs here
   */
  constructor(t, r = {}, o = () => !0) {
    this.api = t, this.match = o, this.bound = [];
    for (const [a, s] of Object.entries(gt)) {
      const i = r[a];
      if (typeof i != "function") continue;
      const n = (l) => {
        const c = l?.detail ?? l;
        !c || !this.match(c) || i(c);
      };
      t.addEventListener?.(s, n), this.bound.push([s, n]);
    }
  }
  dispose() {
    for (const [t, r] of this.bound.splice(0))
      this.api?.removeEventListener?.(t, r);
  }
}
function bt(e) {
  return (t) => {
    const r = e() || {};
    return !(r.jobId && t.job_id && t.job_id !== r.jobId || t.node_id != null && String(t.node_id) !== String(r.nodeId));
  };
}
const g = "/majoor/omnicam/extractor/jobs", xt = /* @__PURE__ */ new Set([
  "IDLE",
  "PREPARING",
  "TRACKING",
  "SOLVING",
  "REFINING",
  "STOPPING"
]);
function yt(e, t = {}) {
  const r = String(t.jobId || "");
  return !r || !xt.has(String(t.solveState || "")) ? !1 : (e.stopSolve(r).catch(() => {
  }), !0);
}
async function L(e) {
  try {
    return await e.text() || `Request failed (${e.status})`;
  } catch {
    return `Request failed (${e.status})`;
  }
}
class wt {
  constructor(t, { clientId: r = "" } = {}) {
    this.api = t, this.clientId = r, this.abort = null;
  }
  /** Session identity, so the server can refuse another tab's job. */
  identity() {
    return this.clientId || this.api?.clientId || this.api?.initialClientId || "";
  }
  _url(t) {
    const r = this.identity();
    return r ? `${t}?clientId=${encodeURIComponent(r)}` : t;
  }
  async _request(t, { method: r = "GET", body: o } = {}) {
    const a = { method: r };
    o !== void 0 && (a.headers = { "Content-Type": "application/json" }, a.body = JSON.stringify(o));
    const s = await this.api.fetchApi(this._url(t), a);
    if (!s.ok) throw new Error(await L(s));
    return s.json();
  }
  /** Measure a source before solving, so the transport has a real range. */
  describeSource(t) {
    return this._request("/majoor/omnicam/extractor/source", { method: "POST", body: { source: t } });
  }
  startSolve({ nodeId: t, source: r, settings: o }) {
    return this._request(g, {
      method: "POST",
      body: { node_id: String(t), client_id: this.identity(), source: r, settings: o }
    });
  }
  getSolveStatus(t) {
    return this._request(`${g}/${encodeURIComponent(t)}`);
  }
  stopSolve(t) {
    return this._request(`${g}/${encodeURIComponent(t)}/stop`, { method: "POST" });
  }
  refineSolve(t, r) {
    return this._request(`${g}/${encodeURIComponent(t)}/refine`, {
      method: "POST",
      body: { settings: r }
    });
  }
  getSolveResult(t) {
    return this._request(`${g}/${encodeURIComponent(t)}/result`);
  }
  deleteSolve(t) {
    return this._request(`${g}/${encodeURIComponent(t)}`, { method: "DELETE" });
  }
  /** Upload a video into the managed Extractor source folder. */
  async uploadSource(t) {
    const r = new FormData();
    r.append("file", t, t.name);
    const o = await this.api.fetchApi("/majoor/omnicam/upload_extractor_source", {
      method: "POST",
      body: r
    });
    if (!o.ok) throw new Error(await L(o));
    return o.json();
  }
}
const kt = 200, P = {
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
function E() {
  return { pitch: 0, yaw: 0, roll: 0 };
}
class St {
  constructor({ onRefine: t, delay: r = kt, setTimer: o, clearTimer: a } = {}) {
    this.settings = { ...P }, this.alignment = E(), this.onRefine = t || (() => {
    }), this.delay = r, this.setTimer = o || ((s, i) => setTimeout(s, i)), this.clearTimer = a || ((s) => clearTimeout(s)), this.timer = null, this.lastSent = "";
  }
  /** Merge a change and schedule a refine. Returns the merged settings. */
  update(t) {
    return this.settings = { ...this.settings, ...t }, this.schedule(), this.settings;
  }
  setAlignment(t) {
    return this.alignment = { ...this.alignment, ...t }, this.update({
      global_rotation_xyzw: Et(this.alignment),
      estimate_up: !1
    });
  }
  /** Ask the server to derive the levelling rotation from the solve itself. */
  requestEstimatedUp() {
    return this.alignment = E(), this.update({ global_rotation_xyzw: null, estimate_up: !0 });
  }
  setSpikeAction(t, r) {
    const o = { ...this.settings.spike_actions };
    return r === "ignore" ? delete o[String(t)] : o[String(t)] = r, this.update({ spike_actions: o });
  }
  reset() {
    return this.settings = { ...P }, this.alignment = E(), this.schedule(), this.settings;
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
function Et({ pitch: e = 0, yaw: t = 0, roll: r = 0 } = {}) {
  if (!e && !t && !r) return null;
  const [o, a, s] = [e, t, r].map((h) => (Number(h) || 0) * (Math.PI / 180) * 0.5), [i, n, l, c, u, d] = [
    Math.cos(o),
    Math.sin(o),
    Math.cos(a),
    Math.sin(a),
    Math.cos(s),
    Math.sin(s)
  ];
  return [
    n * l * u + i * c * d,
    i * c * u - n * l * d,
    i * l * d + n * c * u,
    i * l * u - n * c * d
  ];
}
class Tt {
  constructor({ maxFrames: t = 180 } = {}) {
    this.maxFrames = Math.max(1, Math.floor(Number(t) || 180)), this.frames = /* @__PURE__ */ new Map();
  }
  set(t, { points: r = [], vectors: o = [], state: a = "unknown" } = {}) {
    const s = Math.max(0, Math.floor(Number(t) || 0)), i = {
      frame: s,
      points: Array.isArray(r) ? r : [],
      vectors: Array.isArray(o) ? o : [],
      state: String(a || "unknown")
    };
    for (this.frames.delete(s), this.frames.set(s, i); this.frames.size > this.maxFrames; ) this.frames.delete(this.frames.keys().next().value);
    return i;
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
class y extends Error {
}
function _t(e, { track: t, state: r } = {}) {
  if (r !== "COMPLETED")
    throw new y("Only a completed solve can be applied to the Director.");
  const o = t?.keyframes;
  if (!Array.isArray(o) || !o.length)
    throw new y("This solve produced no camera keys to apply.");
  const a = String(t?.metadata?.extractor_fingerprint || "");
  if (!a)
    throw new y("This track carries no extractor fingerprint.");
  G(e, { track: t, fingerprint: a, confidence: Number(t?.metadata?.confidence) || 0 });
  const s = ot(e);
  return { fingerprint: a, notified: s };
}
function Ct(e, t = "") {
  const r = Number(e?.code) || 0, o = t ? "" : " (no source URL was set)";
  switch (r) {
    case 1:
      return `Loading the footage was aborted${o}.`;
    case 2:
      return "The footage could not be fetched from ComfyUI. Is the file still in the input folder?";
    case 3:
      return "The browser could not decode this file. The solve can still read it -- this only affects the preview. Re-encode to H.264 MP4 to preview it here.";
    case 4:
      return "The browser cannot play this container or codec (H.265, ProRes and most AVI variants are common causes). The solve can still read it; only the preview is affected.";
    default:
      return `The footage could not be played${o}.`;
  }
}
class It extends Y {
  constructor(t, {
    fps: r = 24,
    onFrame: o = () => {
    },
    onMetadata: a = () => {
    },
    onError: s = () => {
    }
  } = {}) {
    super(t, {
      fps: r,
      durationFrames: 1,
      onFrame: o,
      onMetadata: a,
      onError: s,
      errorMessage: Ct,
      loop: !0,
      muted: !0
    }), this.frameCount = 0, this.follow = !0;
  }
  /** A user gesture: seek, and stop following the solver until re-enabled. */
  scrubTo(t) {
    this.setFollow(!1), this.seekFrame(t), this.onFrame(Math.max(0, Number(t) || 0));
  }
  /** The solver moved: follow it only if the user has not taken over. */
  followSolveFrame(t) {
    return this.follow ? (this.seekFrame(t), !0) : !1;
  }
  setFollow(t) {
    return this.follow = !!t, this.follow;
  }
  setLoop(t) {
    super.setLoop(t);
  }
}
function O(e, t) {
  const r = Math.max(1, Number(t) || 24), o = Math.max(0, Number(e) || 0), a = Math.floor(o / r), s = (i, n = 2) => String(i).padStart(n, "0");
  return `${s(Math.floor(a / 60))}:${s(a % 60)}:${s(o % r)}`;
}
const Rt = {
  LoadVideo: ["file", "video"],
  VHS_LoadVideo: ["video"],
  VHS_LoadVideoPath: ["video"],
  LoadVideoFFmpeg: ["file", "video"]
}, $t = /\.(mp4|mov|webm|mkv|m4v|avi)(\s|$)/i, x = {
  available: !1,
  ref: null,
  label: "",
  reason: "Interactive Track requires a file-backed video source. Connect Load Video or choose an Extractor source file. This source exists only during workflow execution."
};
function D(e) {
  return String(e?.comfyClass || e?.type || e?.constructor?.type || "");
}
function Nt(e, t) {
  for (const r of t) {
    const o = e?.widgets?.find((a) => String(a.name).toLowerCase() === r);
    if (o && o.value) return String(o.value);
  }
  return "";
}
function Mt(e, t) {
  const r = (e?.inputs || []).find((o) => String(o?.name).toLowerCase() === "video");
  return !r || r.link == null || !t ? null : H(t, r.link);
}
function F(e) {
  const t = String(
    e?.widgets?.find((o) => o.name === "omnicam_extractor_source")?.value || ""
  );
  return t ? { kind: /\s\[(input|output|temp)\]$/.test(t) ? "annotated_input" : "managed", value: t } : null;
}
function At(e, t = e?.graph) {
  const r = Mt(e, t);
  if (r) {
    const a = Rt[D(r)];
    if (!a) {
      const i = F(e);
      return i ? {
        available: !0,
        reason: "",
        label: i.value.replace(/\s\[(input|output|temp)\]$/, "").split("/").pop(),
        ref: i,
        originNodeId: r.id ?? null,
        runtimeMaterialized: !0
      } : {
        ...x,
        reason: `${D(r) || "This node"} produces its footage only while the workflow runs. Connect Load Video, or choose an Extractor source file, to track without running.`,
        // Cannot be solved without a real file, but the origin may already
        // have rendered something (a previous run, an upload thumbnail) --
        // showing it at least confirms what is actually connected.
        previewMedia: B(r)
      };
    }
    const s = Nt(r, a);
    return s ? $t.test(s) ? {
      available: !0,
      reason: "",
      label: s,
      ref: { kind: "annotated_input", value: s },
      originNodeId: r.id ?? null
    } : { ...x, reason: `${s} does not look like a video file.` } : { ...x, reason: "The connected Load Video node has no file selected yet." };
  }
  const o = F(e);
  return o ? {
    available: !0,
    reason: "",
    label: o.value.split("/").pop(),
    ref: o,
    originNodeId: null
  } : { ...x, reason: "Connect Load Video, or choose a source file, to track." };
}
function Lt(e) {
  if (!e?.available) return e?.reason || "No source";
  const t = e.info;
  if (!t) return e.label;
  const r = [e.label];
  return t.width && t.height && r.push(`${t.width}x${t.height}`), t.fps && r.push(`${Number(t.fps).toFixed(2).replace(/\.?0+$/, "")}fps`), t.frame_count && r.push(`${t.frame_count} frames`), r.join(" · ");
}
function Pt(e) {
  const t = At(e.node, e.node.graph), r = t.ref ? `${t.ref.kind}:${t.ref.value}` : "";
  if (r !== (e.sourceKey || "")) {
    const a = e.state.jobId;
    e.sourceKey = r, e.describing = "", e.sourceViewer.fps = 24, e.sourceViewer.frameCount = 0, a && e.client.stopSolve(a).catch(() => {
    }), e.dispatch({ type: "SOURCE_RESET", source: { ...t, playbackError: "" } });
  }
  const o = e.sourceViewer.setSource(
    t.available && t.ref ? ht(I, t.ref.value) : ""
  );
  return e.dispatch({ type: "SOURCE", source: o ? { ...t, playbackError: "" } : t }), t.available && t.ref ? z(e, t) : $(e, 0), mt(e, t), t;
}
async function z(e, t) {
  if (e.describing === t.ref?.value) return null;
  e.describing = t.ref?.value;
  try {
    const r = await e.client.describeSource(t.ref);
    if (e.disposed || e.sourceKey !== `${t.ref.kind}:${t.ref.value}`) return null;
    const o = r?.info || null;
    return e.dispatch({ type: "SOURCE", source: { info: o } }), o && (e.sourceViewer.fps = Number(o.fps) || e.sourceViewer.fps, $(e, Number(o.frame_count) || 0), pt(e, o)), o;
  } catch (r) {
    return console.warn("[OmniCam] could not describe the extractor source", r), null;
  }
}
function $(e, t) {
  const r = Math.max(0, Math.round(Number(t) || 0));
  r !== e.state.frameCount && (e.sourceViewer.frameCount = r, e.state.frameCount = r, e.disposed || e.render());
}
const Ot = /* @__PURE__ */ new Set(["PREPARING", "TRACKING", "SOLVING", "REFINING", "STOPPING"]), Dt = {
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
function Ft() {
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
function T(e, t) {
  switch (t.type) {
    case "SOURCE":
      return { ...e, source: { ...e.source, ...t.source } };
    case "SOURCE_RESET":
      return {
        ...e,
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
        refinedFingerprint: "",
        source: { ...e.source, ...t.source, info: null }
      };
    case "QUEUED_RESULT":
      return { ...e, jobId: "", solveState: "COMPLETED" };
    case "JOB_STARTED":
      return {
        ...e,
        jobId: t.status.job_id,
        solveState: t.status.state,
        progress: 0,
        stageProgress: 0,
        frame: 0,
        frameCount: Number(t.status.frame_count) || 0,
        error: "",
        warnings: [],
        anomalies: [],
        quality: [],
        poseCount: 0,
        refinedFingerprint: ""
      };
    case "JOB_STATE":
      return { ...e, solveState: t.state, error: t.state === "FAILED" ? e.error : "" };
    case "PROGRESS":
      return {
        ...e,
        solveState: t.progress.state || e.solveState,
        progress: Number(t.progress.progress) || 0,
        stageProgress: Number(t.progress.stage_progress) || 0,
        frame: Number(t.progress.frame) || 0,
        frameCount: Number(t.progress.frame_count) || e.frameCount,
        backend: t.progress.backend || e.backend
      };
    case "QUALITY":
      return { ...e, quality: [...e.quality, ...t.samples || []] };
    case "POSE":
      return { ...e, poseCount: e.poseCount + 1, frame: Number(t.pose.frame) || e.frame };
    case "STATUS": {
      const r = t.status || {}, o = (a, s) => a == null || Number.isNaN(Number(a)) ? s : Number(a);
      return {
        ...e,
        solveState: r.state || e.solveState,
        jobId: r.job_id || e.jobId,
        progress: o(r.progress, e.progress),
        frame: o(r.frame, e.frame),
        frameCount: o(r.frame_count, e.frameCount),
        backend: r.backend || e.backend,
        poseCount: o(r.pose_count, e.poseCount),
        warnings: Array.isArray(r.warnings) ? r.warnings : e.warnings,
        anomalies: Array.isArray(r.anomalies) ? r.anomalies : e.anomalies,
        error: r.error === void 0 ? e.error : String(r.error || "")
      };
    }
    case "COMPLETED":
      return {
        ...e,
        solveState: "COMPLETED",
        progress: 1,
        refinedFingerprint: String(t.result?.fingerprint || ""),
        backend: t.result?.backend || e.backend
      };
    case "FAILED":
      return { ...e, solveState: "FAILED", error: String(t.error || "The solve failed") };
    case "REFINED":
      return {
        ...e,
        refinedFingerprint: String(t.fingerprint || ""),
        // Changing the cleanup after applying does not push anything to the
        // Director; it marks the applied result stale until Apply is pressed.
        applied: e.applied.fingerprint ? { ...e.applied, outdated: e.applied.fingerprint !== t.fingerprint } : e.applied
      };
    case "APPLIED":
      return { ...e, applied: { fingerprint: String(t.fingerprint || ""), outdated: !1 } };
    case "VIEWER_MODE":
      return { ...e, viewerMode: t.mode };
    case "TRACK_MODE":
      return { ...e, trackMode: t.mode };
    default:
      return e;
  }
}
function Vt(e) {
  const t = e.solveState, r = Ot.has(t), o = t === "COMPLETED";
  return {
    track: !r && e.source.available,
    stop: r,
    // A partial solve is reviewable, never shippable.
    apply: o && !!e.refinedFingerprint,
    refine: o,
    retry: t === "STOPPED" || t === "FAILED"
  };
}
function qt(e) {
  return Dt[e] || "neutral";
}
function jt(e) {
  const t = Math.round(Math.max(0, Math.min(1, e.progress)) * 100);
  switch (e.solveState) {
    case "TRACKING":
    case "SOLVING":
      return `${e.solveState} ${t}%`;
    case "STOPPING":
      return "STOPPING…";
    default:
      return e.solveState;
  }
}
function Ut(e) {
  return e.frameCount ? `${e.frame} / ${e.frameCount} frames` : e.solveState === "IDLE" ? "Ready to track" : e.solveState;
}
function Gt(e) {
  return e.applied.fingerprint ? e.applied.outdated ? "OUTDATED" : "APPLIED" : "NOT APPLIED";
}
const zt = `${Q}${at}
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
  .oc-extractor .oc-stage canvas[data-role="upstream-preview"]{object-fit:contain;background:#08080b;filter:saturate(.7) brightness(.85)}
  .oc-extractor .oc-stage [hidden]{display:none}
  .oc-extractor .oc-stage[data-mode="source"] .oc-track-pane,.oc-extractor .oc-stage[data-mode="track3d"] .oc-diagnostic-pane{display:none}
  .oc-extractor .oc-stage[data-mode="track3d"] .oc-track-pane,.oc-extractor .oc-stage[data-mode="source"] .oc-diagnostic-pane{display:block}
  .oc-extractor .oc-extractor-timeline{gap:8px;padding:8px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);min-width:0}
  /* Wrapping rather than nowrap: an Extractor node is often narrower than a
     Director, and a squeezed transport crushed the TRACK group against the FPS
     readout instead of taking the second line it had room for. */
  .oc-extractor .oc-transport{display:flex;align-items:center;gap:7px;flex-wrap:wrap;row-gap:6px;min-width:0}
  .oc-extractor .oc-transport-spacer{flex:1 1 12px;min-width:0}
  /* Same 2px inset and 28px controls as the playback group, so the two groups
     are the same height and sit on one line. */
  .oc-extractor .oc-track-tools{gap:4px}
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
  .oc-extractor .oc-extractor-lanes{display:flex;flex-direction:column;gap:var(--oc-dope-gap);min-width:0}
  .oc-extractor .oc-extractor-lanes canvas{width:100%;border-radius:6px;background:var(--oc-panel-2);border:1px solid var(--oc-line-soft);cursor:pointer}
  /* One dope-sheet row, so it lines up with the SOLVE label beside it. Scoped
     past the generic .oc-quality rule further down, which is 26px. */
  .oc-extractor .oc-extractor-lanes .oc-extractor-quality{height:var(--oc-dope-row-h)}
  /* The lane stack paints its own row plates, one per label in the gutter, so
     the element itself must not add a seventh box around them. */
  .oc-extractor .oc-extractor-lanes .oc-track-timeline{height:calc(4 * var(--oc-dope-row-h) + 3 * var(--oc-dope-gap));background:none;border:0;border-radius:0}
  .oc-extractor .oc-extractor-timeline-meta{padding:0 2px}
  .oc-extractor .oc-extractor-frame-readout{margin-left:auto;color:var(--oc-text-dim);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
  .oc-extractor .oc-extractor-quality-details{max-height:64px;overflow:auto}
  .oc-extractor .oc-views{display:flex;gap:4px;flex-wrap:wrap}
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
`, Wt = '<svg class="oc-mark" viewBox="0 0 24 24" aria-hidden="true"><circle class="oc-mark-ring" cx="12" cy="12" r="8"/><circle class="oc-mark-core" cx="12" cy="12" r="3"/></svg>';
function m(e, t, { min: r = 0, max: o = 1, step: a = 0.01, value: s = 0 } = {}) {
  return `<label for="oc-${e}">${t}</label>
    <input id="oc-${e}" data-role="${e}" type="range" min="${r}" max="${o}" step="${a}" value="${s}">
    <output data-role="${e}-out"></output>`;
}
function Kt() {
  return `<div class="majoor-omnicam oc-extractor">
    <style>${zt}</style>
    <header class="oc-header">
      <div class="oc-heading"><span class="oc-brand">${Wt}</span>
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
          <canvas data-role="upstream-preview" width="960" height="540" hidden aria-label="Connected source, not yet a trackable file"></canvas>
          <canvas data-role="tracking-overlay" width="960" height="540"></canvas>
          <div class="oc-stage-notice" data-role="stage-notice" hidden></div>
        </section>
        <section class="oc-pane oc-track-pane">
          <canvas data-role="track-canvas" width="960" height="540" hidden></canvas>
        </section>
      </div>

      <section class="oc-timeline oc-extractor-timeline" aria-label="Extractor timeline">
        <div class="row timeline-toolbar oc-transport">
          <div class="timeline-group" title="Playback transport">
            <button type="button" class="icon-button" data-act="first-frame" title="First frame" aria-label="First frame"><i class="pi pi-step-backward-alt"></i></button>
            <button type="button" class="icon-button" data-act="previous-frame" title="Previous frame" aria-label="Previous frame"><i class="pi pi-step-backward"></i></button>
            <button type="button" class="icon-button primary-play oc-play" data-act="play" title="Play or pause" aria-label="Play or pause"><i class="pi pi-play"></i></button>
            <button type="button" class="icon-button" data-act="next-frame" title="Next frame" aria-label="Next frame"><i class="pi pi-step-forward"></i></button>
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
              <label class="oc-dope-label" style="--channel-color:var(--oc-accent)"><input type="checkbox" checked aria-label="Show camera lane"><span>Camera</span></label>
              <label class="oc-dope-label" style="--channel-color:var(--oc-warn)"><input type="checkbox" checked aria-label="Show look at lane"><span>Look At</span></label>
              <label class="oc-dope-label" style="--channel-color:var(--oc-info)"><input type="checkbox" checked aria-label="Show focal length lane"><span>Focal Length</span></label>
              <label class="oc-dope-label" style="--channel-color:var(--oc-danger)"><input type="checkbox" checked aria-label="Show roll lane"><span>Roll</span></label>
            </div>
            <div class="oc-dope-tracks" data-role="extractor-dope-tracks">
              <div class="oc-ruler" data-role="extractor-ruler" title="Drag to scrub the source"></div>
              <div class="oc-extractor-lanes">
                <canvas class="oc-quality oc-extractor-quality" data-role="quality-timeline" width="900" height="28" aria-label="Solve quality per frame"></canvas>
                <canvas class="oc-track-timeline" data-role="track-timeline" width="900" height="156" aria-label="Solved camera channels and motion health per frame"></canvas>
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

      <div class="oc-views" data-role="views" hidden>
        <button type="button" data-view="perspective">Perspective</button>
        <button type="button" data-view="top">Top</button>
        <button type="button" data-view="front">Front</button>
        <button type="button" data-view="side">Side</button>
        <button type="button" data-act="fit">Fit Track</button>
      </div>

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
            ${m("position-smoothing", "Position smooth", { value: 0.15 })}
            ${m("motion-scale", "Motion scale", { min: 0.01, max: 10, step: 0.01, value: 1 })}
          </div>
          <div class="oc-inline">
            <button type="button" data-act="estimate-up">Level Horizon</button>
          </div>
          <details class="oc-details"><summary>Advanced cleanup</summary>
            <div class="oc-sliders">
              ${m("rotation-smoothing", "Rotation smooth", { value: 0.1 })}
              ${m("position-tolerance", "Key reduction", { min: 0, max: 0.5, step: 1e-3, value: 0.01 })}
              ${m("align-pitch", "Pitch", { min: -180, max: 180, step: 0.5, value: 0 })}
              ${m("align-yaw", "Yaw", { min: -180, max: 180, step: 0.5, value: 0 })}
              ${m("align-roll", "Roll", { min: -180, max: 180, step: 0.5, value: 0 })}
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
          <div class="oc-section">Current frame</div>
          <div class="oc-rows" data-role="extractor-camera"><div class="oc-empty">No solve yet</div></div>
          <div class="oc-section">Anomalies</div>
          <div class="oc-anomalies" data-role="anomalies"><div class="oc-empty">No anomalies detected</div></div>
        </aside>
      </div>
    </main>
  </div>`;
}
function Bt(e = document) {
  const t = e.createElement("div");
  return t.innerHTML = Kt(), t.firstElementChild;
}
class Ht {
  /**
   * @param root the panel root, queried for its own `data-role` elements
   * @param onSeek called with a frame when the user scrubs the strip
   */
  constructor(t, { onSeek: r = () => {
  } } = {}) {
    this.root = t, this.onSeek = r, this.scrubbing = !1;
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
  render({ track: t = null, quality: r = [], frame: o = 0, frameCount: a = 0 } = {}) {
    const s = this.$("track-timeline");
    if (!s) return null;
    const i = X(void 0, S);
    return s.height !== i && (s.height = i), J(s, {
      track: t,
      quality: r,
      frame: o,
      layout: S,
      frameCount: Math.max(Number(a) || 0, Number(t?.duration_frames) || 0)
    });
  }
  /** Which frame a pointer event over the strip refers to, or null. */
  frameAt(t, r) {
    const o = this.$("track-timeline");
    if (!o?.getBoundingClientRect) return null;
    const a = o.getBoundingClientRect(), s = (t.clientX - a.left) * o.width / Math.max(1, a.width);
    return Z(s, o.width, r, S.labelWidth);
  }
  /** Wire scrubbing. `listen` is the panel's own disposal-tracked binder. */
  bind(t, r) {
    const o = this.$("track-timeline");
    t(o, "pointerdown", (a) => {
      o.setPointerCapture?.(a.pointerId), this.scrubbing = !0, this.seek(a, r());
    }), t(o, "pointermove", (a) => {
      this.scrubbing && this.seek(a, r());
    });
    for (const a of ["pointerup", "pointercancel"])
      t(o, a, () => {
        this.scrubbing = !1;
      });
  }
  seek(t, r) {
    const o = this.frameAt(t, r);
    return o !== null && this.onSeek(o), o;
  }
}
const Qt = 300, Yt = 300, v = {
  accepted: "#46a758",
  weak: "#e5a23c",
  rejected: "#e5484d",
  current: "#8b7bd8"
};
function V(e, t) {
  const r = Array.isArray(e) ? e : [];
  if (r.length <= t) return r.slice();
  const o = r.length / t, a = [];
  for (let s = 0; s < t; s += 1) a.push(r[Math.floor(s * o)]);
  return a;
}
function _(e, { sourceWidth: t, sourceHeight: r, width: o, height: a }) {
  const s = Number(e?.x ?? e?.[0]) || 0, i = Number(e?.y ?? e?.[1]) || 0, n = s <= 1 && i <= 1 && s >= 0 && i >= 0, l = n ? o : o / Math.max(1, t || o), c = n ? a : a / Math.max(1, r || a);
  return [s * l, i * c];
}
class Xt {
  constructor(t) {
    this.canvas = t, this.points = [], this.vectors = [], this.frame = 0, this.state = "unknown";
  }
  setDiagnostics({ points: t = [], vectors: r = [], frame: o = 0, state: a = "unknown" } = {}) {
    this.points = V(t, Qt), this.vectors = V(r, Yt), this.frame = Number(o) || 0, this.state = String(a || "unknown"), this.draw();
  }
  clear() {
    this.points = [], this.vectors = [];
    const t = this.canvas?.getContext?.("2d");
    t && t.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  draw({ sourceWidth: t = 0, sourceHeight: r = 0 } = {}) {
    const o = this.canvas?.getContext?.("2d"), a = this.canvas?.width || 0, s = this.canvas?.height || 0;
    if (!o || !a || !s) return { points: this.points.length, vectors: this.vectors.length };
    const i = { sourceWidth: t, sourceHeight: r, width: a, height: s };
    o.clearRect(0, 0, a, s), o.lineWidth = 1;
    for (const n of this.vectors) {
      const [l, c] = _(n.from ?? n, i), [u, d] = _(n.to ?? n, i);
      o.strokeStyle = v[n.state] || v.accepted, o.beginPath(), o.moveTo(l, c), o.lineTo(u, d), o.stroke();
    }
    for (const n of this.points) {
      const [l, c] = _(n, i);
      o.fillStyle = v[n.state] || v.accepted, o.fillRect(l - 1.5, c - 1.5, 3, 3);
    }
    return (this.state === "weak" || this.state === "bad") && (o.strokeStyle = this.state === "bad" ? v.rejected : v.weak, o.lineWidth = 2, o.strokeRect(1, 1, a - 2, s - 2)), { points: this.points.length, vectors: this.vectors.length };
  }
  dispose() {
    this.clear(), this.canvas = null;
  }
}
const f = (e, t = 3) => Number.isFinite(Number(e)) ? Number(e).toFixed(t) : "--";
function Jt(e, t, r) {
  const o = e.createElement("div");
  o.className = "oc-row";
  const a = e.createElement("span");
  a.textContent = t;
  const s = e.createElement("span");
  return s.textContent = r, o.append(a, s), o;
}
function W(e, t, r = "Nothing to show") {
  if (!e) return 0;
  const o = e.ownerDocument;
  if (e.replaceChildren(), !t.length) {
    const a = o.createElement("div");
    return a.className = "oc-empty", a.textContent = r, e.append(a), 0;
  }
  for (const [a, s] of t) e.append(Jt(o, a, s));
  return t.length;
}
function Zt(e, t) {
  if (!e) return [];
  const [r, o, a] = (e.position || [0, 0, 0]).map(Number), [s, i, n] = (e.target || [0, 0, -1]).map(Number), l = [s - r, i - o, n - a], c = Math.hypot(...l) || 1, u = Math.atan2(-l[0] / c, -l[2] / c) * (180 / Math.PI), d = Math.asin(Math.max(-1, Math.min(1, l[1] / c))) * (180 / Math.PI);
  return [
    ["Frame", String(t)],
    ["X", f(r)],
    ["Y", f(o)],
    ["Z", f(a)],
    ["Pan", `${f(u, 1)}°`],
    ["Tilt", `${f(d, 1)}°`],
    ["Roll", `${f(e.roll || 0, 1)}°`],
    ["FOV", `${f(e.fov, 1)}°`]
  ];
}
function te(e, t, { onAction: r = () => {
}, actions: o = {} } = {}) {
  if (!e) return 0;
  const a = e.ownerDocument;
  if (e.replaceChildren(), !t?.length) {
    const s = a.createElement("div");
    return s.className = "oc-empty", s.textContent = "No anomalies detected", e.append(s), 0;
  }
  for (const s of t) {
    const i = a.createElement("div");
    i.className = "oc-anomaly";
    const n = a.createElement("div");
    n.className = "oc-anomaly-text";
    const l = a.createElement("strong");
    l.textContent = `⚠ Frame ${s.frame}`;
    const c = a.createElement("small");
    c.textContent = s.detail || s.kind || "", n.append(l, c), i.append(n);
    const u = o[String(s.frame)] || "ignore";
    for (const d of ["interpolate", "ignore", "exclude"]) {
      const h = a.createElement("button");
      h.type = "button", h.textContent = d.toUpperCase(), h.dataset.action = d, h.dataset.frame = String(s.frame), d === u && h.setAttribute("aria-selected", "true"), h.addEventListener("click", () => r(s.frame, d)), i.append(h);
    }
    e.append(i);
  }
  return t.length;
}
function ee(e) {
  return (e || []).map((t, r) => [`Note ${r + 1}`, String(t)]);
}
function re(e) {
  return import("./chunk-B-aZafzR.js").then(({ TrackViewer: t }) => (e.viewerLoad = null, e.disposed || e.viewer || (e.viewer = new t(e.$("track-canvas"), {
    onFrameCamera: (r) => W(e.$("extractor-camera"), Zt(r, e.state.frame))
  }), e.pushTracksToViewer()), e.viewer)).catch((t) => (e.viewerLoad = null, console.warn("OmniCam track viewer unavailable", t), null));
}
function q(e) {
  const t = e.$("frame");
  t && (t.value = String(e.state.frame));
  const r = e.$("time");
  r && (r.textContent = O(e.state.frame, e.sourceViewer.fps));
  const o = e.$("frame-readout");
  o && (o.textContent = `${e.state.frame} / ${Math.max(0, e.state.frameCount - 1)} · ${O(e.state.frame, e.sourceViewer.fps)}`);
  const a = tt(e.state.quality, e.state.frame);
  W(e.$("quality-details"), [...a, ...ee(e.state.warnings)], "No solve yet");
}
function j(e) {
  const t = e.$("extractor-ruler"), r = e.$("extractor-playhead"), o = Math.max(1, e.state.frameCount);
  if (!t || !r) return;
  const a = Math.min(12, o - 1 || 1);
  t.replaceChildren();
  for (let s = 0; s <= a; s += 1) {
    const i = Math.round(s / a * (o - 1)), n = `${s / a * 100}%`, l = t.ownerDocument.createElement("i");
    if (l.className = `oc-tick${s % 2 === 0 ? " major" : ""}`, l.style.left = n, t.append(l), s % 2 === 0) {
      const c = t.ownerDocument.createElement("span");
      c.className = "timeline-tick", c.style.left = n, c.textContent = String(i), t.append(c);
    }
  }
  r.style.left = `${Math.max(0, Math.min(o - 1, e.state.frame)) / Math.max(1, o - 1) * 100}%`;
}
const oe = [
  "method",
  "lens_mode",
  "fov_degrees",
  "focal_length_mm",
  "sensor_width_mm",
  "max_dimension",
  "frame_step"
], U = [
  "normalize_origin",
  "motion_scale",
  "position_smoothing",
  "rotation_smoothing",
  "simplify_keys",
  "position_tolerance",
  "rotation_tolerance_deg"
];
function b(e, t) {
  return e?.widgets?.find((r) => r.name === t) || null;
}
const ae = [dt, ut, R];
function C(e) {
  for (const t of ae) {
    const r = b(e, t);
    r && (r.computeSize = () => [0, -4], r.draw = () => {
    }, r.hidden = !0, r.type = "hidden", r.options = { ...r.options || {}, hideInVueNodes: !0, serialize: !0 });
  }
  e.setDirtyCanvas?.(!0, !0);
}
function se(e) {
  C(e), globalThis.requestAnimationFrame?.(() => C(e)), setTimeout(() => C(e), 250);
}
class ie {
  constructor(t) {
    this.node = t, this.root = Bt(), this.state = Ft(), this.disposed = !1, this.disposers = [], this.result = { raw: null, refined: null }, this.diagnostics = new Tt(), this.upstreamPreviewActive = !1, this.client = new wt(I), this.refine = new St({ onRefine: (r) => this.requestRefine(r) }), this.sourceViewer = new It(this.$("source-video"), {
      onFrame: (r) => this.showFrame(r, { fromVideo: !0 }),
      onMetadata: ({ frameCount: r }) => this.adoptSourceLength(r),
      onError: (r) => this.dispatch({ type: "SOURCE", source: { playbackError: r } })
    }), this.timeline = new Ht(this.root, {
      onSeek: (r) => this.sourceViewer.scrubTo(r)
    }), this.overlay = new Xt(this.$("tracking-overlay")), this.viewer = null, this.viewerLoad = null, this.events = new vt(I, {
      job: (r) => this.dispatch({ type: "JOB_STATE", state: r.state }),
      progress: (r) => this.onProgress(r),
      pose: (r) => this.onPose(r),
      quality: (r) => this.onQuality(r),
      features: (r) => this.onFeatures(r),
      completed: (r) => this.onCompleted(r),
      failed: (r) => this.dispatch({ type: "FAILED", error: r.error })
    }, bt(() => ({ jobId: this.state.jobId, nodeId: this.node.id }))), this.bind(), this.refreshSource(), this.restoreCachedResult(), this.render();
  }
  // -- plumbing ----------------------------------------------------------
  $(t) {
    return this.root.querySelector(`[data-role="${t}"]`);
  }
  listen(t, r, o, a) {
    t && (t.addEventListener(r, o, a), this.disposers.push(() => t.removeEventListener(r, o, a)));
  }
  dispatch(t) {
    return this.state = T(this.state, t), this.disposed || this.render(), this.state;
  }
  bind() {
    for (const t of this.root.querySelectorAll("[data-tab]"))
      this.listen(t, "click", () => this.setViewerMode(t.dataset.tab));
    for (const t of this.root.querySelectorAll("[data-track-mode]"))
      this.listen(t, "click", () => this.setTrackMode(t.dataset.trackMode));
    for (const t of this.root.querySelectorAll("[data-view]"))
      this.listen(t, "click", () => this.viewer?.setView(t.dataset.view));
    this.listen(this.root.querySelector('[data-act="track"]'), "click", () => this.startSolve()), this.listen(this.root.querySelector('[data-act="stop"]'), "click", () => this.control("stopSolve")), this.listen(this.root.querySelector('[data-act="fit"]'), "click", () => this.viewer?.fit()), this.listen(this.root.querySelector('[data-act="apply"]'), "click", () => this.applyRefined()), this.listen(this.root.querySelector('[data-act="reset-refine"]'), "click", () => this.resetRefine()), this.listen(this.root.querySelector('[data-act="play"]'), "click", () => this.sourceViewer.toggle()), this.listen(this.root.querySelector('[data-act="first-frame"]'), "click", () => this.sourceViewer.scrubTo(0)), this.listen(this.root.querySelector('[data-act="previous-frame"]'), "click", () => this.sourceViewer.scrubTo(this.state.frame - 1)), this.listen(this.root.querySelector('[data-act="next-frame"]'), "click", () => this.sourceViewer.scrubTo(this.state.frame + 1)), this.listen(
      this.root.querySelector('[data-act="last-frame"]'),
      "click",
      () => this.sourceViewer.scrubTo(Math.max(0, this.state.frameCount - 1))
    ), this.listen(this.root.querySelector('[data-act="toggle-loop"]'), "click", () => {
      const t = this.$("loop");
      t && (t.checked = !t.checked, this.sourceViewer.setLoop(t.checked), this.root.querySelector('[data-act="toggle-loop"]')?.setAttribute("aria-pressed", String(t.checked)));
    }), this.listen(this.$("scrubber"), "input", (t) => this.sourceViewer.scrubTo(Number(t.target.value))), this.listen(this.$("frame"), "change", (t) => this.sourceViewer.scrubTo(Number(t.target.value))), this.listen(this.$("follow-solve"), "change", (t) => this.sourceViewer.setFollow(t.target.checked)), this.listen(this.$("loop"), "change", (t) => this.sourceViewer.setLoop(t.target.checked)), this.listen(this.$("quality-timeline"), "click", (t) => this.seekFromTimeline(t)), this.timeline.bind(
      (t, r, o) => this.listen(t, r, o),
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
    for (const [r, o] of Object.entries(t)) {
      const a = this.$(r);
      this.listen(a, "input", () => {
        this.refine.update({ [o]: Number(a.value) }), this.renderRefineValues();
      });
    }
    for (const r of ["pitch", "yaw", "roll"]) {
      const o = this.$(`align-${r}`);
      this.listen(o, "input", () => {
        this.refine.setAlignment({ [r]: Number(o.value) }), this.renderRefineValues();
      });
    }
    this.listen(this.root.querySelector('[data-act="reset-alignment"]'), "click", () => {
      for (const r of ["pitch", "yaw", "roll"]) {
        const o = this.$(`align-${r}`);
        o && (o.value = "0");
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
      for (const r of ["trim-start", "trim-end"]) {
        const o = this.$(r);
        o && (o.value = "0");
      }
      this.refine.update({ trim_start_frame: 0, trim_end_frame: 0 });
    });
    for (const [r, o] of [["trim-start", "trim_start_frame"], ["trim-end", "trim_end_frame"]]) {
      const a = this.$(r);
      this.listen(a, "change", () => this.refine.update({ [o]: Math.max(0, Number(a.value) || 0) }));
    }
    for (const [r, o] of [["normalize-origin", "normalize_origin"], ["simplify-keys", "simplify_keys"]]) {
      const a = this.$(r);
      this.listen(a, "change", () => this.refine.update({ [o]: !!a.checked }));
    }
  }
  // -- source ------------------------------------------------------------
  refreshSource() {
    return Pt(this);
  }
  /**
   * Ask the server what this footage is, before anything is solved.
   *
   * Without it the panel knows a filename and nothing else: no rate, no frame
   * count, so the scrubber has no range and the strip has nothing to say.
   */
  async describeSource(t) {
    return z(this, t);
  }
  /** Give the transport a real range, from the footage rather than a solve. */
  adoptSourceLength(t) {
    return $(this, t);
  }
  solveSettings() {
    const t = {};
    for (const o of oe) {
      const a = b(this.node, o);
      if (!a) continue;
      const s = ["fov_degrees", "focal_length_mm", "sensor_width_mm", "max_dimension", "frame_step"];
      t[o] = s.includes(o) ? Number(a.value) : String(a.value);
    }
    const r = {};
    for (const o of U) {
      const a = b(this.node, o);
      a && (r[o] = typeof a.value == "boolean" ? a.value : Number(a.value));
    }
    return t.refine = r, t;
  }
  // -- solve control -----------------------------------------------------
  async startSolve() {
    const t = this.refreshSource();
    if (t.available)
      try {
        this.sourceViewer.setFollow(!0);
        const r = await this.client.startSolve({
          nodeId: this.node.id,
          source: t.ref,
          settings: this.solveSettings()
        });
        this.overlay.clear(), this.diagnostics.clear(), this.dispatch({ type: "JOB_STARTED", status: r });
      } catch (r) {
        this.dispatch({ type: "FAILED", error: String(r?.message || r) });
      }
  }
  async control(t) {
    if (this.state.jobId)
      try {
        const r = await this.client[t](this.state.jobId);
        this.dispatch({ type: "STATUS", status: r });
      } catch (r) {
        this.dispatch({ type: "FAILED", error: String(r?.message || r) });
      }
  }
  /** The socket is transport; the server is the truth. Re-read after a gap. */
  async recoverStatus() {
    if (!this.state.jobId) return null;
    try {
      const t = await this.client.getSolveStatus(this.state.jobId);
      return this.dispatch({ type: "STATUS", status: t }), t.state === "COMPLETED" && await this.loadResult(), t;
    } catch {
      return null;
    }
  }
  onProgress(t) {
    this.dispatch({ type: "PROGRESS", progress: t }), this.sourceViewer.followSolveFrame(Number(t.frame) || 0);
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
    const r = this.diagnostics.set(Number(t.frame) || 0, {
      points: t.points || [],
      frame: Number(t.frame) || 0,
      state: String(t.state || "unknown")
    });
    r.frame === this.state.frame && this.overlay.setDiagnostics(r);
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
  acceptSolvedResult(t, r = "interactive") {
    const o = t?.raw_track || t?.raw || t?.track || null, a = t?.refined_track || t?.refined || t?.track || o;
    if (!a?.keyframes?.length) return !1;
    const s = String(
      t?.fingerprint || a?.metadata?.extractor_fingerprint || ""
    );
    return this.result = { raw: o || a, refined: a }, r === "queued" && this.dispatch({ type: "QUEUED_RESULT" }), this.dispatch({
      type: "STATUS",
      status: {
        anomalies: t?.anomalies || [],
        state: "COMPLETED",
        job_id: this.state.jobId,
        backend: a?.metadata?.backend
      }
    }), this.dispatch({ type: "REFINED", fingerprint: s }), this.pushTracksToViewer(), r === "queued" && (G(this.node, {
      track: a,
      fingerprint: s,
      confidence: Number(t?.confidence ?? a?.metadata?.confidence) || 0
    }), t?.source && it(this.node, t.source), this.node.__majoorOmniCamStatus = nt({
      track: a,
      confidence: Number(t?.confidence ?? a?.metadata?.confidence) || 0
    }), this.dispatch({ type: "APPLIED", fingerprint: s }), t?.source && this.refreshSource()), !0;
  }
  async requestRefine(t) {
    if (!this.state.jobId || this.state.solveState !== "COMPLETED") return null;
    try {
      this.syncRefineWidgets(t);
      const r = await this.client.refineSolve(this.state.jobId, t);
      return this.result = { ...this.result, refined: r.refined_track }, this.dispatch({ type: "REFINED", fingerprint: r.fingerprint }), this.pushTracksToViewer(), r;
    } catch (r) {
      return this.dispatch({ type: "FAILED", error: String(r?.message || r) }), null;
    }
  }
  /** Keep queued execution and interactive cleanup on the same widget values. */
  syncRefineWidgets(t) {
    for (const r of U) {
      if (t[r] === void 0) continue;
      const o = b(this.node, r);
      o && (o.value = t[r]);
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
    const t = await this.refine.flush(), r = t?.resolved_alignment;
    if (!r) return null;
    const [o, a, s, i] = r.map(Number), n = (u) => Math.round(u * (180 / Math.PI) * 10) / 10, l = n(Math.atan2(2 * (i * o + a * s), 1 - 2 * (o * o + a * a))), c = n(Math.atan2(2 * (i * s + o * a), 1 - 2 * (a * a + s * s)));
    for (const [u, d] of [["pitch", l], ["yaw", 0], ["roll", c]]) {
      const h = this.$(`align-${u}`);
      h && (h.value = String(d));
    }
    return this.refine.alignment = { pitch: l, yaw: 0, roll: c }, this.renderRefineValues(), t;
  }
  resetRefine() {
    this.refine.reset();
    for (const [t, r] of [
      ["position-smoothing", 0.15],
      ["rotation-smoothing", 0.1],
      ["motion-scale", 1],
      ["position-tolerance", 0.01],
      ["align-pitch", 0],
      ["align-yaw", 0],
      ["align-roll", 0]
    ]) {
      const o = this.$(t);
      o && (o.value = String(r));
    }
    this.renderRefineValues();
  }
  setTrim(t, r) {
    const o = this.$(t);
    o && (o.value = String(this.state.frame)), this.refine.update({ [r]: this.state.frame });
  }
  applyRefined() {
    try {
      const { fingerprint: t } = _t(this.node, {
        track: this.result.refined,
        state: this.state.solveState
      });
      this.dispatch({ type: "APPLIED", fingerprint: t });
    } catch (t) {
      const r = t instanceof y ? t.message : String(t?.message || t);
      this.dispatch({ type: "FAILED", error: r });
    }
  }
  // -- viewer ------------------------------------------------------------
  ensureViewer() {
    return this.viewer || this.disposed ? Promise.resolve(this.viewer) : (this.viewerLoad ||= re(this), this.viewerLoad);
  }
  pushTracksToViewer() {
    this.viewer && (this.viewer.setRawTrack(this.result.raw), this.viewer.setRefinedTrack(this.result.refined), this.viewer.setMode(this.state.trackMode), this.viewer.setFrame(this.state.frame));
  }
  async setViewerMode(t) {
    this.dispatch({ type: "VIEWER_MODE", mode: t }), t !== "source" && (await this.ensureViewer(), !this.disposed && (this.viewer?.resize(), this.viewer?.fit()));
  }
  setTrackMode(t) {
    this.dispatch({ type: "TRACK_MODE", mode: t }), this.viewer?.setMode(t);
  }
  seekFromTimeline(t) {
    const o = this.$("quality-timeline").getBoundingClientRect(), a = et(t.clientX - o.left, o.width, this.state.frameCount);
    this.sourceViewer.scrubTo(a);
  }
  showFrame(t, { fromVideo: r = !1 } = {}) {
    return ft(this, t, { fromVideo: r });
  }
  // -- rendering ---------------------------------------------------------
  render() {
    const t = this.$("solve-status");
    t && (t.dataset.tone = qt(this.state.solveState), this.$("solve-status-text").textContent = jt(this.state));
    const r = this.$("source-strip");
    r && (r.dataset.available = String(!!this.state.source.available), this.$("source-label").textContent = Lt(this.state.source));
    const o = Vt(this.state);
    for (const [p, k] of Object.entries({
      track: o.track,
      stop: o.stop,
      apply: o.apply
    })) {
      const A = this.root.querySelector(`[data-act="${p}"]`);
      A && (A.disabled = !k);
    }
    this.$("solve-detail").textContent = Ut(this.state), this.$("solve-percent").textContent = `${Math.round(this.state.progress * 100)}%`, this.$("progress-bar").style.width = `${Math.round(this.state.progress * 100)}%`;
    const a = this.$("solve-error");
    a.hidden = !this.state.error, a.textContent = this.state.error || "";
    const s = Gt(this.state), i = this.$("applied-state");
    i.dataset.state = s, i.textContent = s;
    for (const p of this.root.querySelectorAll("[data-tab]"))
      p.setAttribute("aria-selected", String(p.dataset.tab === this.state.viewerMode));
    for (const p of this.root.querySelectorAll("[data-track-mode]"))
      p.setAttribute("aria-selected", String(p.dataset.trackMode === this.state.trackMode));
    const n = this.state.viewerMode, l = n === "source", c = n === "track3d", u = this.$("stage");
    u && (u.dataset.mode = n), this.$("source-video").hidden = c && !0, this.$("upstream-preview").hidden = !this.upstreamPreviewActive || !l, this.$("tracking-overlay").hidden = !0, this.$("track-canvas").hidden = !c, this.root.querySelector('[data-role="views"]').hidden = !c;
    const d = this.$("scrubber");
    d && (d.max = String(Math.max(0, this.state.frameCount - 1)));
    const h = this.$("frame");
    h && (h.max = String(Math.max(0, this.state.frameCount - 1)));
    const N = this.$("frame-total");
    N && (N.textContent = `/ ${Math.max(0, this.state.frameCount - 1)}`);
    const M = this.$("extractor-fps");
    M && (M.textContent = String(this.sourceViewer.fps || 24)), te(this.$("anomalies"), this.state.anomalies, {
      actions: this.refine.settings.spike_actions,
      onAction: (p, k) => {
        this.refine.setSpikeAction(p, k), this.render();
      }
    }), this.renderQuality(), this.renderTimeline(), q(this), j(this);
    const w = this.$("stage-notice");
    if (w) {
      const p = this.state.source.playbackError || (this.upstreamPreviewActive ? "Preview only -- connect Load Video, or run the graph once, to track this source." : "");
      w.hidden = !p || !l, w.textContent = p;
    }
  }
  /**
   * The read-only solved camera channels, aligned to the source frame clock.
   */
  renderTimeline() {
    return this.timeline.render({
      track: this.state.trackMode === "raw" ? this.result.raw : this.result.refined,
      quality: this.state.quality,
      frame: this.state.frame,
      frameCount: this.state.frameCount
    });
  }
  renderQuality() {
    rt(this.$("quality-timeline"), this.state.quality, this.state.frameCount, {
      currentFrame: this.state.frame
    });
  }
  renderFrameReadouts() {
    return q(this);
  }
  /** Keep the read-only solve sheet on the exact same frame axis as playback. */
  renderExtractorRuler() {
    j(this);
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
      const r = this.$(t), o = this.$(`${t}-out`);
      r && o && (o.textContent = r.value);
    }
  }
  // -- lifecycle ---------------------------------------------------------
  restoreCachedResult() {
    const t = ct(this.node);
    t && (this.result = { raw: t.track, refined: t.track }, this.state = T(this.state, { type: "APPLIED", fingerprint: t.fingerprint }), this.state = T(this.state, { type: "REFINED", fingerprint: t.fingerprint }));
  }
  executed(t) {
    const r = lt(t);
    r && this.acceptSolvedResult(r, "queued");
  }
  dispose() {
    yt(this.client, this.state), this.disposed = !0, this.events.dispose(), this.refine.dispose(), this.sourceViewer.dispose(), this.overlay.dispose(), this.diagnostics.dispose(), this.viewer?.dispose(), this.viewer = null, this.viewerLoad = null;
    for (const t of this.disposers.splice(0)) t();
    this.result = { raw: null, refined: null };
  }
}
function pe(e) {
  if (e.__majoorOmniCamExtractor) return;
  if (st(e), !b(e, R)) {
    const n = e.addWidget?.("text", R, "", () => {
    }, { serialize: !0 });
    n && (n.computeSize = () => [0, -4], n.draw = () => {
    }, n.hidden = !0);
  }
  se(e);
  const t = new ie(e);
  e.__majoorOmniCamExtractor = t;
  const r = () => Math.max(700, t.root.scrollHeight || 0);
  e.addDOMWidget("majoor_omnicam_extractor", "omnicam", t.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 700,
    getHeight: r,
    getMaxHeight: r
  }), e.setSize([Math.max(e.size?.[0] || 0, 800), Math.max(e.size?.[1] || 0, 780)]);
  const o = e.onRemoved;
  e.onRemoved = function() {
    t.dispose(), o?.apply(this, arguments);
  };
  const a = e.onExecuted;
  e.onExecuted = function(n) {
    a?.apply(this, arguments), t.executed(n);
  };
  const s = e.onConnectionsChange;
  e.onConnectionsChange = function() {
    s?.apply(this, arguments), t.refreshSource(), setTimeout(() => {
      t.disposed || t.refreshSource();
    }, 400);
  };
  const i = e.onAfterGraphConfigured;
  e.onAfterGraphConfigured = function() {
    i?.apply(this, arguments), t.refreshSource(), t.recoverStatus();
  };
}
export {
  pe as attachExtractor
};
