import { app as X } from "../../scripts/app.js";
import { api as A } from "../../scripts/api.js";
import { d as De, u as qe, l as je, S as Ue, b as Ve, p as Ge } from "./chunk-CQClJogI.js";
import { M as We, E as Be } from "./chunk-CbqXtcpr.js";
import { v as h, x as be, T as _, y as ze, z as He } from "./chunk-D2kY8xX0.js";
import { c as ve, S as ye, F as xe, a as D, e as Qe, r as Ke, b as Ye, m as J, d as Z, f as Xe, s as Je, p as Ze, n as et, L as tt, g as rt } from "./chunk-XTt0Js3E.js";
import { w as ot } from "./chunk-BH5DWXNI.js";
function at(t) {
  return t?.name === "AbortError" || t?.code === 20;
}
class nt {
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
  options(e = {}) {
    return this.signal ? { ...e, signal: this.signal } : { ...e };
  }
  /**
   * Run a request, returning `undefined` when it was cancelled rather than throwing.
   *
   * Real failures still propagate: a dead network while the panel is alive is a
   * genuine error the caller has to see.
   */
  async run(e) {
    try {
      const r = await e(this.signal);
      return this.aborted ? void 0 : r;
    } catch (r) {
      if (this.aborted || at(r)) return;
      throw r;
    }
  }
  dispose() {
    this.disposed || (this.disposed = !0, st(), this.controller?.abort());
  }
}
function st() {
  const t = typeof globalThis == "object" ? globalThis : null;
  if (!t) return;
  const e = t.__majoorOmniCamIntentionalAborts, r = { at: Date.now() };
  if (Array.isArray(e)) {
    e.length >= 64 && e.shift(), e.push(r);
    return;
  }
  t.__majoorOmniCamIntentionalAborts = [r];
}
function it(t, e) {
  const r = !!t.upstreamPreviewActive, o = t.sourceViewer?.mode || "native", a = e ? r ? "upstream" : o === "fallback" ? "fallback" : "native" : "none", n = (s, i) => {
    const c = t.$(s);
    c && (c.hidden = !i);
  };
  return n("source-video", a === "native"), n("fallback-preview", a === "fallback"), n("upstream-preview", a === "upstream"), a;
}
function ct(t, e) {
  const r = t.$("tracking-overlay"), o = Math.round(Number(e?.width) || 0), a = Math.round(Number(e?.height) || 0);
  return !r || o < 1 || a < 1 || r.width === o && r.height === a ? !1 : (r.width = o, r.height = a, t.overlay.draw(), !0);
}
async function lt(t, e) {
  const r = t.$("upstream-preview");
  if (!r) return;
  const o = e.available ? null : e.previewMedia;
  t.upstreamPreviewActive = o ? await De(o, r, 960) : !1, t.disposed || t.render();
}
const ut = /* @__PURE__ */ new Set(["COMPLETED", "FAILED", "CANCELLED"]);
function dt(t) {
  return ut.has(String(t || ""));
}
function pt(t, e) {
  return !e || dt(t) ? t : e;
}
const ht = /* @__PURE__ */ new Set([
  "QUEUED",
  "PREPARING",
  "TRACKING",
  "SOLVING",
  "RECONSTRUCTING",
  "FINALIZING",
  "REFINING",
  "STOPPING",
  "CANCELLING"
]), ft = /* @__PURE__ */ new Set(["COMPLETED", "FAILED", "CANCELLED", "STOPPED"]), L = (t, e) => t == null || Number.isNaN(Number(t)) ? e : Number(t), mt = {
  IDLE: "neutral",
  QUEUED: "info",
  PREPARING: "info",
  TRACKING: "active",
  SOLVING: "active",
  RECONSTRUCTING: "active",
  FINALIZING: "active",
  REFINING: "active",
  STOPPING: "warn",
  CANCELLING: "warn",
  STOPPED: "neutral",
  CANCELLED: "neutral",
  COMPLETED: "ok",
  FAILED: "danger"
};
function we() {
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
function V(t, e) {
  switch (e.type) {
    case "SOURCE":
      return { ...t, source: { ...t.source, ...e.source } };
    case "SOURCE_RESET":
      return {
        ...t,
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
        source: { ...t.source, ...e.source, info: null }
      };
    case "QUEUED_RESULT":
      return { ...t, jobId: "", solveState: "COMPLETED", progress: 1 };
    case "QUEUE_LIFECYCLE": {
      const r = pt(t.solveState, e.state), o = ft.has(t.solveState);
      return {
        ...t,
        solveState: r,
        progress: o || e.progress === void 0 ? t.progress : L(e.progress, t.progress),
        error: e.error ? String(e.error) : r === "FAILED" ? t.error : ""
      };
    }
    case "JOB_STARTED":
      return {
        ...t,
        jobId: e.status.job_id,
        solveState: e.status.state,
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
      return { ...t, solveState: e.state, error: e.state === "FAILED" ? t.error : "" };
    case "PROGRESS":
      return {
        ...t,
        solveState: e.progress.state || t.solveState,
        progress: Number(e.progress.progress) || 0,
        stageProgress: Number(e.progress.stage_progress) || 0,
        backend: e.progress.backend || t.backend
      };
    case "QUALITY":
      return { ...t, quality: [...t.quality, ...e.samples || []] };
    case "POSE":
      return { ...t, poseCount: t.poseCount + 1 };
    case "FRAME":
      return { ...t, frame: Math.max(0, Math.round(Number(e.frame) || 0)) };
    case "FRAME_COUNT":
      return { ...t, frameCount: Math.max(0, Math.round(Number(e.frameCount) || 0)) };
    case "STATUS": {
      const r = e.status || {};
      return {
        ...t,
        solveState: r.state || t.solveState,
        jobId: r.job_id || t.jobId,
        progress: L(r.progress, t.progress),
        backend: r.backend || t.backend,
        poseCount: L(r.pose_count, t.poseCount),
        warnings: Array.isArray(r.warnings) ? r.warnings : t.warnings,
        anomalies: Array.isArray(r.anomalies) ? r.anomalies : t.anomalies,
        error: r.error === void 0 ? t.error : String(r.error || "")
      };
    }
    case "COMPLETED":
      return {
        ...t,
        solveState: "COMPLETED",
        progress: 1,
        refinedFingerprint: String(e.result?.fingerprint || ""),
        backend: e.result?.backend || t.backend,
        // The live counter increments once per POSE event, and those are
        // throttled to at most one per THROTTLE_SECONDS -- every backend
        // hands its poses over in one tight loop once the solve itself is
        // done, so a fast solve (or a lot of frames) throttles most of them
        // away. completion_payload's own pose_count is the server's real
        // count of what it kept, not of what the socket let through.
        poseCount: L(e.result?.pose_count, t.poseCount)
      };
    case "FAILED":
      return { ...t, solveState: "FAILED", error: String(e.error || "The solve failed") };
    case "REFINED":
      return {
        ...t,
        refinedFingerprint: String(e.fingerprint || ""),
        // Changing the cleanup after applying does not push anything to the
        // Director; it marks the applied result stale until Apply is pressed.
        applied: t.applied.fingerprint ? { ...t.applied, outdated: t.applied.fingerprint !== e.fingerprint } : t.applied
      };
    case "APPLIED":
      return { ...t, applied: { fingerprint: String(e.fingerprint || ""), outdated: !1 } };
    case "VIEWER_MODE":
      return { ...t, viewerMode: e.mode };
    case "TRACK_MODE":
      return { ...t, trackMode: e.mode };
    default:
      return t;
  }
}
function gt(t) {
  const e = t.solveState, r = ht.has(e), o = e === "COMPLETED";
  return {
    track: !r && t.source.available,
    stop: r,
    // A partial solve is reviewable, never shippable.
    apply: o && !!t.refinedFingerprint,
    refine: o,
    retry: e === "STOPPED" || e === "FAILED" || e === "CANCELLED"
  };
}
function bt(t) {
  return mt[t] || "neutral";
}
function vt(t) {
  const e = Math.round(Math.max(0, Math.min(1, t.progress)) * 100);
  switch (t.solveState) {
    case "TRACKING":
    case "SOLVING":
    case "RECONSTRUCTING":
    case "FINALIZING":
      return `${t.solveState} ${e}%`;
    case "STOPPING":
    case "CANCELLING":
      return `${t.solveState}…`;
    default:
      return t.solveState;
  }
}
function yt(t) {
  return t.frameCount ? `${t.frame} / ${t.frameCount} frames` : t.solveState === "IDLE" ? "Ready to track" : t.solveState;
}
function xt(t) {
  return t.applied.fingerprint ? t.applied.outdated ? "OUTDATED" : "APPLIED" : "NOT APPLIED";
}
function wt(t, e) {
  return t?.widgets?.find((r) => r.name === e) || null;
}
async function kt(t) {
  if (!await ve(
    t.app,
    h("Clear Cache"),
    h("Deletes every cached reconstruction (GLBs, manifests, source images) from disk, and forgets this node's cached track and reconstruction results. This cannot be undone.")
  )) return !1;
  t.queuePromptId && await t.cancelQueuedRun();
  try {
    await t.reconstruction.client.clearCache();
  } catch (r) {
    return t.dispatch({ type: "FAILED", error: String(r?.message || r) }), !1;
  }
  for (const r of [ye, xe, D]) {
    const o = wt(t.node, r);
    o && (o.value = "");
  }
  return t.node.setDirtyCanvas?.(!0, !0), t.overlay.clear(), t.diagnostics.clear(), t.result = { raw: null, refined: null }, t.sourceKey = "", t.state = we(), t.reconstruction?.dispatch({ type: "RESET" }), t.render(), t.refreshSource(), !0;
}
function St(t, e) {
  const r = [], o = (c, l) => {
    const d = (f) => l(f?.detail ?? f ?? {});
    e?.addEventListener?.(c, d), r.push([c, d]);
  }, a = () => String(t.node?.id ?? ""), n = (c) => {
    const l = String(t.queuePromptId || "");
    return l !== "" && String(c ?? "") === l;
  }, s = (c, l = {}) => t.dispatch({ type: "QUEUE_LIFECYCLE", state: c, ...l }), i = () => {
    t.queuePromptId = "";
  };
  return o("execution_start", (c) => {
    n(c.prompt_id) && s("PREPARING");
  }), o("executing", (c) => {
    if (!n(c.prompt_id)) return;
    const l = c.node ?? c.display_node ?? null;
    l != null && String(l) === a() && s(t.extractMode === "scene_reconstruct" ? "RECONSTRUCTING" : "TRACKING");
  }), o("progress", (c) => {
    if (!n(c.prompt_id) || c.node != null && String(c.node) !== a()) return;
    const l = Number(c.max) || 0;
    l > 0 && s(null, { progress: (Number(c.value) || 0) / l });
  }), o("executed", (c) => {
    String(c.node ?? c.display_node ?? "") === a() && (!n(c.prompt_id) && t.queuePromptId || (i(), t.executed(c.output ?? c)));
  }), o("execution_error", (c) => {
    n(c.prompt_id) && (s("FAILED", {
      error: String(c.exception_message || c.error || "The queued solve failed")
    }), i());
  }), o("execution_interrupted", (c) => {
    n(c.prompt_id) && (s("CANCELLED"), i());
  }), o("execution_success", (c) => {
    n(c.prompt_id) && (s("FINALIZING"), i());
  }), () => {
    for (const [c, l] of r.splice(0))
      e?.removeEventListener?.(c, l);
  };
}
const Et = "1.49.1";
function Ct(t = globalThis) {
  const e = t?.__COMFYUI_FRONTEND_VERSION__;
  return typeof e == "string" ? e : "";
}
function oe(t) {
  const e = String(t ?? "").match(/^(\d+)\.(\d+)\.(\d+)/);
  return e ? e.slice(1, 4).map(Number) : null;
}
function _t(t, e) {
  const r = oe(t), o = oe(e);
  if (!r || !o)
    throw new Error(`Unsupported ComfyUI frontend version: ${t || "(none)"}`);
  for (let a = 0; a < 3; a += 1)
    if (r[a] !== o[a]) return r[a] < o[a] ? -1 : 1;
  return 0;
}
async function Tt(t, e, { frontendVersion: r = Ct(), intent: o } = {}) {
  if (!Array.isArray(e) || e.length === 0)
    throw new Error("OmniCam partial execution requires at least one target");
  if (!r)
    throw new Error(
      "Cannot select a queuePrompt signature without a ComfyUI frontend version"
    );
  return _t(r, Et) >= 0 ? t.queuePrompt(0, 1, { queueNodeIds: e, intent: o }) : t.queuePrompt(0, 1, e);
}
const Nt = {
  camera_track: "omnicam_track",
  scene_reconstruct: "omnicam_reconstruct"
};
function Rt(t) {
  const e = t?.id;
  return e == null || e === "" || ke(t) ? null : String(e);
}
function ke(t) {
  if (t == null) return !1;
  if (String(t.id ?? "").includes(":")) return !0;
  const e = t.graph;
  return e ? !!(e.isRootGraph === !1 || e._is_subgraph || e.is_subgraph || e._subgraph_node || e.rootGraph && e.rootGraph !== e) : !1;
}
async function At(t, {
  timeoutMs: e = 4e3,
  intervalMs: r = 16,
  now: o = () => Date.now(),
  sleep: a = (n) => new Promise((s) => setTimeout(s, n))
} = {}) {
  if (!t || typeof t != "object" || !t.processingQueue) return !0;
  const n = o();
  for (; t.processingQueue; ) {
    if (o() - n >= e) return !1;
    await a(r);
  }
  return !0;
}
async function Mt(t, e = "camera_track", { idle: r } = {}) {
  if (!t.refreshSource()?.available) return { accepted: !1, reason: "no-source" };
  if (ke(t.node))
    return { accepted: !1, reason: "subgraph-not-supported" };
  const a = Rt(t.node);
  if (!a) return { accepted: !1, reason: "no-execution-id" };
  if (!await At(t.app, r))
    return { accepted: !1, reason: "submission-busy" };
  t.setExtractMode(e), t.syncPanelToNodeWidgets?.(), t.prepareForQueuedRun?.();
  const { accepted: n, promptId: s } = await It(
    t.app,
    t.api,
    [a],
    { intent: { trigger_source: Nt[e] || "omnicam_track" } }
  );
  return t.queuePromptId = n ? String(s || "") : "", { accepted: n, promptId: t.queuePromptId };
}
async function It(t, e, r, o) {
  const a = r.map(String).sort(), n = e.fetchApi;
  let s = "";
  e.fetchApi = async (i, c = {}) => {
    const l = await n.call(e, i, c);
    try {
      const d = String(i).split("?")[0];
      if (String(c.method || "GET").toUpperCase() === "POST" && (d === "/prompt" || d.endsWith("/prompt")) && l.ok && !s) {
        let u = {};
        try {
          u = JSON.parse(c.body || "{}");
        } catch {
          u = {};
        }
        const m = Array.isArray(u.partial_execution_targets) ? u.partial_execution_targets.map(String).sort() : null;
        if (m && m.length === a.length && m.every((g, y) => g === a[y])) {
          const g = await l.clone().json().catch(() => ({}));
          typeof g?.prompt_id == "string" && (s = g.prompt_id);
        }
      }
    } catch {
    }
    return l;
  };
  try {
    return { accepted: !!await Tt(t, r, o), promptId: s };
  } finally {
    e.fetchApi = n;
  }
}
async function $(t, e) {
  if (!e) return !1;
  const r = await t.fetchApi(
    `/api/jobs/${encodeURIComponent(e)}/cancel`,
    { method: "POST" }
  );
  if (!r.ok)
    throw new Error(`Comfy job cancellation failed (${r.status})`);
  return !!(await r.json().catch(() => ({})))?.cancelled;
}
const $t = {
  LoadVideo: ["file", "video"],
  VHS_LoadVideo: ["video"],
  VHS_LoadVideoPath: ["video"],
  LoadVideoFFmpeg: ["file", "video"]
}, Lt = {
  LoadImage: ["image"]
}, Pt = /\.(mp4|mov|webm|mkv|m4v|avi)(\s|$)/i, Ft = /\.(png|jpe?g|webp)(\s|$)/i;
function Ot(t) {
  return {
    available: !1,
    ref: null,
    label: "",
    reason: t ? "Scene Reconstruct requires a file-backed still image. Connect Load Image or choose an Extractor source file. This source exists only during workflow execution." : "Interactive Track requires a file-backed video source. Connect Load Video or choose an Extractor source file. This source exists only during workflow execution."
  };
}
function ae(t) {
  return String(t?.comfyClass || t?.type || t?.constructor?.type || "");
}
function Dt(t, e) {
  for (const r of e) {
    const o = t?.widgets?.find((a) => String(a.name).toLowerCase() === r);
    if (o && o.value) return String(o.value);
  }
  return "";
}
function qt(t, e) {
  const r = (t?.inputs || []).find((o) => String(o?.name).toLowerCase() === "video");
  return !r || r.link == null || !e ? null : je(e, r.link);
}
function ne(t) {
  const e = String(
    t?.widgets?.find((o) => o.name === "omnicam_extractor_source")?.value || ""
  );
  return e ? { kind: /\s\[(input|output|temp)\]$/.test(e) ? "annotated_input" : "managed", value: e } : null;
}
function Se(t, e = t?.graph, r = "camera_track") {
  const o = r === "scene_reconstruct", a = o ? Lt : $t, n = o ? Ft : Pt, s = o ? "Load Image" : "Load Video", i = o ? "an image" : "a video", c = o ? "reconstruct" : "track", l = Ot(o), d = qt(t, e);
  if (d) {
    const u = a[ae(d)];
    if (!u) {
      const p = ne(t);
      return p ? {
        available: !0,
        reason: "",
        label: p.value.replace(/\s\[(input|output|temp)\]$/, "").split("/").pop(),
        ref: p,
        originNodeId: d.id ?? null,
        runtimeMaterialized: !0
      } : {
        ...l,
        reason: `${ae(d) || "This node"} produces its footage only while the workflow runs. Connect ${s}, or choose an Extractor source file, to ${c} without running.`,
        // Cannot be solved without a real file, but the origin may already
        // have rendered something (a previous run, an upload thumbnail) --
        // showing it at least confirms what is actually connected.
        previewMedia: qe(d)
      };
    }
    const m = Dt(d, u);
    return m ? n.test(m) ? {
      available: !0,
      reason: "",
      label: m,
      ref: { kind: "annotated_input", value: m },
      originNodeId: d.id ?? null
    } : { ...l, reason: `${m} does not look like ${i} file.` } : { ...l, reason: `The connected ${s} node has no file selected yet.` };
  }
  const f = ne(t);
  return f ? {
    available: !0,
    reason: "",
    label: f.value.split("/").pop(),
    ref: f,
    originNodeId: null
  } : { ...l, reason: `Connect ${s}, or choose a source file, to ${c}.` };
}
function jt(t) {
  if (!t?.available) return t?.reason || "No source";
  const e = t.info;
  if (!e) return t.label;
  const r = [t.label];
  return e.width && e.height && r.push(`${e.width}x${e.height}`), e.fps && r.push(`${Number(e.fps).toFixed(2).replace(/\.?0+$/, "")}fps`), e.frame_count && r.push(`${e.frame_count} frames`), r.join(" · ");
}
const Ut = [ye, xe, D];
function Ee(t, e) {
  return t?.widgets?.find((r) => r.name === e) || null;
}
function G(t) {
  for (const e of Ut) {
    const r = Ee(t, e);
    r && (r.computeSize = () => [0, -4], r.draw = () => {
    }, r.hidden = !0, r.type = "hidden", r.options = { ...r.options || {}, hideInVueNodes: !0, serialize: !0 });
  }
  t.setDirtyCanvas?.(!0, !0);
}
function Vt(t) {
  G(t), globalThis.requestAnimationFrame?.(() => G(t)), setTimeout(() => G(t), 250);
}
function Gt(t) {
  if (Ee(t, D)) return;
  const e = t.addWidget?.("text", D, "", () => {
  }, { serialize: !0 });
  e && (e.computeSize = () => [0, -4], e.draw = () => {
  }, e.hidden = !0);
}
function se(t, e) {
  return t?.widgets?.find((r) => r.name === e) || null;
}
class Wt extends EventTarget {
  constructor(e, { api: r, app: o } = {}) {
    super(), this.node = e, this.api = r, this.app = o, this.disposed = !1, this.workbench = null, this.shell = null, Qe(e), Gt(e), Ke(e), this.extractMode = String(se(e, "extract_mode")?.value || "camera_track"), this.state = we(), this.result = { raw: null, refined: null }, this.rawSolve = null, this.landmarks = [], this.sourceKey = "", this.queuePromptId = "", this.pendingSourceResync = !1, this.reconstructionResult = null, this.previewDataUrl = null;
    const a = Ye(e);
    a && (this.result = { raw: a.track, refined: a.track }, this.state = V(this.state, { type: "APPLIED", fingerprint: a.fingerprint }), this.state = V(this.state, { type: "REFINED", fingerprint: a.fingerprint })), this.unbindQueueEvents = St(this, r);
  }
  dispatch(e) {
    return this.state = V(this.state, e), this.disposed || (this.dispatchEvent(new CustomEvent("statechange", { detail: { action: e } })), this.workbench?.render()), this.state;
  }
  getSnapshot() {
    return {
      solveState: this.state.solveState,
      progress: this.state.progress,
      frame: this.state.frame,
      frameCount: this.state.frameCount,
      sourceLabel: this.state.source?.label || "",
      extractMode: this.extractMode,
      anomalyCount: this.state.anomalies?.length || 0,
      error: this.state.error || "",
      previewDataUrl: this.previewDataUrl
    };
  }
  setExtractMode(e) {
    this.extractMode = e;
    const r = se(this.node, "extract_mode");
    r && r.value !== e && (r.value = e, this.node.setDirtyCanvas?.(!0, !0));
  }
  /**
   * Adopt a solved camera-track result headlessly: state + persistent cache.
   * The workbench's own pushTracksToViewer() (3D viewer, coordinator seek) is
   * separate and only runs when it is attached.
   */
  acceptSolvedResult(e) {
    const r = e?.raw_track || e?.raw || e?.track || null, o = e?.refined_track || e?.refined || e?.track || r;
    if (!o?.keyframes?.length) return !1;
    const a = String(
      e?.fingerprint || o?.metadata?.extractor_fingerprint || ""
    );
    this.result = { raw: r || o, refined: o }, this.landmarks = Array.isArray(e?.landmarks_3d) ? e.landmarks_3d : [], this.rawSolve = e?.rawSolve || null, this.dispatch({ type: "QUEUED_RESULT" }), this.dispatch({
      type: "STATUS",
      status: {
        anomalies: e?.anomalies || [],
        state: "COMPLETED",
        backend: o?.metadata?.backend
      }
    }), this.dispatch({ type: "REFINED", fingerprint: a });
    const n = Number(e?.confidence ?? o?.metadata?.confidence) || 0, s = e?.motionScene || J(o);
    return Z(this.node, { motionScene: s, fingerprint: a }), e?.source && Xe(this.node, e.source), this.node.__majoorOmniCamStatus = Je({ track: o, confidence: n }), this.dispatch({ type: "APPLIED", fingerprint: a }), this.workbench?.pushTracksToViewer?.(), e?.source && (this.workbench ? this.workbench.refreshSource() : this.pendingSourceResync = !0), !0;
  }
  /** Adopt an `onExecuted` envelope, whichever mode it came from. */
  executed(e) {
    const r = Ze(e);
    if (r) {
      if (r.mode === "scene_reconstruct") {
        this.acceptReconstructionResult(r);
        return;
      }
      this.acceptSolvedResult(r);
    }
  }
  /**
   * Adopt a Scene Reconstruct result headlessly: held on the runtime so a
   * solve that finishes while the workbench is closed is not lost (replayed
   * into ReconstructionPanelController on the next open -- see
   * web-src/extractor/index.js's openExtractorWorkbench()), and reflected in
   * the shared solve-state machine so the compact shell's status/progress
   * reaches a terminal COMPLETED instead of sitting on FINALIZING forever.
   * The panel's own richer job-state/visual bookkeeping still lives on
   * ReconstructionPanelController and only runs while attached.
   */
  acceptReconstructionResult(e) {
    this.reconstructionResult = e, this.dispatch({
      type: "STATUS",
      status: { state: "COMPLETED", anomalies: e?.reconstruction?.warnings || [] }
    }), this.workbench?.reconstruction?.acceptQueuedResult(e);
  }
  /**
   * STOP: cancel the actual ComfyUI job for this node's queued run.
   * Idempotent, and safe to call whether or not a workbench is attached.
   */
  async cancelQueuedRun() {
    const e = String(this.queuePromptId || "");
    if (e) {
      this.dispatch({ type: "QUEUE_LIFECYCLE", state: "CANCELLING" });
      try {
        await $(this.api, e);
      } catch (r) {
        this.dispatch({ type: "QUEUE_LIFECYCLE", state: "FAILED", error: String(r?.message || r) });
      }
    }
  }
  /**
   * Headless half of source-lifecycle.js's refreshExtractorSource(): decide
   * whether the upstream source identity changed, and if a solve is running
   * against stale footage, cancel it -- regardless of whether a workbench is
   * open to show the change. The DOM-aware half (media element, viewer,
   * frame-count probe) runs only when the workbench is open; otherwise this
   * marks pendingSourceResync so the next open catches up.
   */
  checkSourceChanged() {
    const e = this.extractMode || "camera_track", r = Se(this.node, this.node.graph, e), o = r.ref ? `${r.ref.kind}:${r.ref.value}` : "", a = o !== (this.sourceKey || "");
    return a && (this.sourceKey = o, this.queuePromptId && $(this.api, this.queuePromptId).catch(() => {
    }), this.pendingSourceResync = !0), a;
  }
  attachWorkbench(e) {
    this.workbench = e, this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: !0 } }));
  }
  detachWorkbench(e) {
    this.workbench === e && (this.workbench = null, this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: !1 } })));
  }
  /** Node removal only: a queued solve outlives a closed workbench, but not a deleted node. */
  dispose() {
    this.disposed || (this.disposed = !0, this.queuePromptId && $(this.api, this.queuePromptId).catch(() => {
    }), this.unbindQueueEvents?.(), this.workbench = null);
  }
}
async function Bt(t, e, r) {
  const o = await t.fetchApi("/majoor/omnicam/extractor/refine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_solve: e, settings: r })
  });
  if (!o.ok) {
    let a = `refine failed (${o.status})`;
    try {
      a = await o.text() || a;
    } catch {
    }
    throw new Error(a);
  }
  return o.json();
}
async function zt(t, { selectElement: e = null, statusElement: r = null, checkpointSelectElement: o = null } = {}) {
  const a = await t.capabilities(), n = Array.isArray(a?.providers) ? a.providers : [], s = a?.recommended_provider || (n[0]?.provider_id ?? "");
  if (e) {
    typeof e.replaceChildren == "function" ? e.replaceChildren() : Array.isArray(e.options) && (e.options.length = 0);
    for (const l of n) {
      let d;
      typeof document < "u" && typeof document.createElement == "function" ? d = document.createElement("option") : d = { value: "", textContent: "", disabled: !1 }, d.value = l.provider_id, d.textContent = l.available ? l.name || l.provider_id : `${l.name || l.provider_id} (Unavailable)`, d.disabled = !l.available, typeof e.appendChild == "function" ? e.appendChild(d) : Array.isArray(e.options) && e.options.push(d);
    }
    s && (e.value = s);
  }
  const i = e?.value || s, c = n.find((l) => l.provider_id === i);
  if (o) {
    typeof o.replaceChildren == "function" ? o.replaceChildren() : Array.isArray(o.options) && (o.options.length = 0);
    const l = (u, m) => {
      let p;
      return typeof document < "u" && typeof document.createElement == "function" ? p = document.createElement("option") : p = { value: "", textContent: "" }, p.value = u, p.textContent = m, p;
    }, d = (u) => {
      typeof o.appendChild == "function" ? o.appendChild(u) : Array.isArray(o.options) && o.options.push(u);
    };
    d(l("auto", "Auto"));
    const f = Array.isArray(c?.metadata?.checkpoints) ? c.metadata.checkpoints : [];
    for (const u of f)
      d(l(u, u));
    o.value = "auto";
  }
  return r && (c && !c.available ? (r.textContent = c.reason || "Provider unavailable", r.hidden = !1) : (r.textContent = "", r.hidden = !0)), {
    capabilities: a,
    recommended: s,
    providers: n
  };
}
const Ht = {
  fast: { triangle_budget: 4e4, discontinuity_threshold: 0.06 },
  balanced: { triangle_budget: 12e4, discontinuity_threshold: 0.04 },
  high: { triangle_budget: 25e4, discontinuity_threshold: 0.03 }
};
function ie(t, e) {
  if (!t) return;
  const r = t.querySelector('[data-role="reconstruction-triangle-budget"]'), o = t.querySelector('[data-role="reconstruction-edge-threshold"]'), a = Ht[e];
  r && (r.disabled = !!a, a && (r.value = String(a.triangle_budget))), o && (o.disabled = !!a, a && (o.value = String(a.discontinuity_threshold)));
}
const Qt = { geometry: "depth_mesh", layout: "depth_mesh" }, Ce = /* @__PURE__ */ new Set(["blockout", "hybrid", "scan"]), Kt = /* @__PURE__ */ new Set(["vggt", "vggt_omega_research"]);
function _e(t) {
  if (!t) return {};
  const e = (d) => t.querySelector(`[data-role="${d}"]`)?.value, r = (d) => !!t.querySelector(`[data-role="${d}"]`)?.checked, o = e("reconstruction-mode") || "depth_mesh";
  let a = Qt[o] || o;
  const n = e("reconstruction-provider") || "";
  Kt.has(n) && (a = "scan");
  const s = n || (a === "scan" ? "vggt" : "comfy_moge"), i = String(e("reconstruction-semantic-labels") || "").split(/[\n,]/).map((d) => d.trim()).filter(Boolean), c = e("reconstruction-checkpoint") || "auto", l = {
    provider: s,
    mode: a,
    quality: e("reconstruction-quality") || "balanced",
    checkpoint: c,
    // Scan geometry (VGGT) reads vggt_checkpoint, not the generic `checkpoint`
    // field; forward the same value so a chosen VGGT weight is actually used.
    ...a === "scan" ? { vggt_checkpoint: c } : {},
    recover_fov: r("reconstruction-recover-fov"),
    source_texture: r("reconstruction-source-texture"),
    detect_ground: r("reconstruction-detect-ground"),
    detect_walls: r("reconstruction-detect-walls"),
    triangle_budget: Number(e("reconstruction-triangle-budget")) || 12e4,
    // The backend field is discontinuity_threshold (ReconstructionSettings);
    // "edge_threshold" is only the DOM role name.
    discontinuity_threshold: Number(e("reconstruction-edge-threshold")) || 0.04,
    scene_scale: Number(e("reconstruction-scene-scale")) || 1
  };
  return Ce.has(a) && (l.segmentation_provider = e("reconstruction-segmentation") || "comfy_sam3", l.completion_policy = e("reconstruction-completion-policy") || "off", l.completion_provider = l.completion_policy === "off" ? "none" : "sam3d_objects", l.max_blockout_objects = Number(e("reconstruction-max-objects")) || 24, l.blockout_assets = e("reconstruction-blockout-assets") || "off", i.length && (l.semantic_labels = i)), l;
}
function q(t) {
  if (!t) return;
  const e = _e(t).mode, r = Ce.has(e);
  for (const o of ["reconstruction-semantic-row", "reconstruction-labels-row"]) {
    const a = t.querySelector(`[data-role="${o}"]`);
    a && (a.hidden = !r);
  }
}
function Yt(t, {
  onRun: e = () => {
  },
  onStop: r = () => {
  },
  onOpenDirector: o = () => {
  },
  onSettingsChange: a = () => {
  },
  on: n = (s, i, c) => s?.addEventListener?.(i, c)
} = {}) {
  if (!t) return () => {
  };
  const s = [], i = (p, g, y) => {
    n(p, g, y), s.push(() => p?.removeEventListener?.(g, y));
  }, c = [
    "reconstruction-provider",
    "reconstruction-mode",
    "reconstruction-quality",
    "reconstruction-checkpoint",
    "reconstruction-recover-fov",
    "reconstruction-source-texture",
    "reconstruction-detect-ground",
    "reconstruction-detect-walls",
    "reconstruction-triangle-budget",
    "reconstruction-edge-threshold",
    "reconstruction-scene-scale",
    "reconstruction-segmentation",
    "reconstruction-completion-policy",
    "reconstruction-max-objects",
    "reconstruction-semantic-labels"
  ], l = () => {
    q(t);
    const p = _e(t);
    a(p);
  };
  for (const p of c) {
    const g = t.querySelector(`[data-role="${p}"]`);
    if (!g) continue;
    const y = g.tagName === "SELECT" || g.type === "checkbox" ? "change" : "input";
    i(g, y, l);
  }
  const d = t.querySelector('[data-role="reconstruction-quality"]');
  d && i(d, "change", () => {
    ie(t, d.value), l();
  }), ie(t, d?.value), q(t);
  const f = t.querySelector('[data-role="reconstruction-run"]');
  f && i(f, "click", e);
  const u = t.querySelector('[data-role="reconstruction-stop"]');
  u && i(u, "click", r);
  const m = t.querySelector('[data-role="reconstruction-open-director"]');
  return m && i(m, "click", o), () => {
    for (const p of s.splice(0)) p();
  };
}
async function Xt(t) {
  try {
    const e = await t.text();
    if (!e) return `Request failed (${t.status})`;
    try {
      const r = JSON.parse(e);
      if (r?.error?.message)
        return r.error.code ? `[${r.error.code}] ${r.error.message}` : r.error.message;
      if (r?.message) return r.message;
    } catch {
    }
    return e;
  } catch {
    return `Request failed (${t.status})`;
  }
}
class Jt {
  constructor(e) {
    this.api = e;
  }
  async _request(e, { method: r = "GET", signal: o } = {}) {
    const a = { method: r };
    o && (a.signal = o);
    const n = await this.api.fetchApi(e, a);
    if (!n.ok) throw new Error(await Xt(n));
    return n.json();
  }
  /** Aggregated provider capabilities (which geometry / segmentation backends exist). */
  capabilities(e = {}) {
    return this._request("/majoor/omnicam/reconstruction/capabilities", e);
  }
  /** Delete every cached reconstruction (manifests, GLBs, source images) from disk. */
  clearCache() {
    return this._request("/majoor/omnicam/reconstruction/cache", { method: "DELETE" });
  }
  /** Delete one reconstruction's cache folder by fingerprint so a re-run recomputes it. */
  deleteCacheEntry(e) {
    const r = encodeURIComponent(String(e || ""));
    return this._request(`/majoor/omnicam/reconstruction/cache/${r}`, { method: "DELETE" });
  }
}
const Zt = /* @__PURE__ */ new Set([
  "PREPARING",
  "REGISTER_VIEWS",
  "INFER_GEOMETRY",
  "BUILD_MESH",
  "SEGMENT_SCENE",
  "FUSE_VIEWS",
  "ANALYZE_LAYOUT",
  "FIT_BLOCKOUT",
  "COMPLETE_OBJECTS",
  "BUILD_REFERENCE",
  "SAVE_ASSETS",
  "FINALIZING"
]);
function er() {
  return {
    provider: "comfy_moge",
    mode: "geometry",
    quality: "balanced",
    checkpoint: "auto",
    triangle_budget: 12e4,
    discontinuity_threshold: 0.04,
    scene_scale: 1,
    detect_ground: !0,
    detect_walls: !1,
    source_texture: !0,
    recover_fov: !0
  };
}
function Te() {
  return {
    jobState: "IDLE",
    jobId: "",
    progress: 0,
    stage: "",
    stageProgress: 0,
    error: null,
    warnings: [],
    result: null,
    summary: null,
    fingerprint: "",
    previewUrl: "",
    source: null,
    settings: er()
  };
}
function tr(t) {
  const e = t?.jobState || "IDLE", r = Zt.has(e), o = t?.source, a = !!(o && (typeof o == "string" || o.available || o.value || o.ref || o.info || o.kind)), n = !r && e !== "STOPPING" && a, s = r, i = !!(t?.result && (t.result.motion_scene || t.result.objects || t.result.version));
  return {
    canStart: n,
    canStop: s,
    canOpenDirector: e === "DONE" && i,
    canPreview: i,
    // Discard a result you don't want (deletes its cached files so a re-run
    // recomputes). Never mid-job.
    canDiscard: i && !r && e !== "STOPPING"
  };
}
function rr(t, e) {
  switch (e.type) {
    case "SOURCE":
      return { ...t, source: e.source };
    case "SETTINGS":
      return {
        ...t,
        settings: { ...t.settings, ...e.settings }
      };
    case "STATE":
      return {
        ...t,
        jobState: e.jobState,
        jobId: e.jobId ?? t.jobId,
        progress: e.progress ?? t.progress,
        stage: e.stage ?? t.stage,
        stageProgress: e.stageProgress ?? t.stageProgress,
        error: e.jobState === "PREPARING" ? null : t.error
      };
    case "PROGRESS":
      return {
        ...t,
        progress: e.progress ?? t.progress,
        stage: e.stage ?? t.stage,
        stageProgress: e.stageProgress ?? t.stageProgress
      };
    case "PREVIEW":
      return {
        ...t,
        previewUrl: e.previewUrl ?? ""
      };
    case "DONE":
      return {
        ...t,
        jobState: "DONE",
        jobId: e.jobId ?? t.jobId,
        // Progress is a 0..1 fraction throughout, matching the server.
        progress: 1,
        result: e.result,
        summary: e.summary ?? e.result?.summary ?? null,
        warnings: e.warnings ?? e.result?.warnings ?? [],
        // Kept so "Discard" can delete exactly this reconstruction's cache
        // folder. The envelope carries it at the top level; a bare MotionScene
        // carries it under metadata.reconstruction.
        fingerprint: e.fingerprint || e.result?.fingerprint || e.result?.motion_scene?.metadata?.reconstruction?.fingerprint || e.result?.metadata?.reconstruction?.fingerprint || t.fingerprint || ""
      };
    case "ERROR":
      return {
        ...t,
        jobState: "FAILED",
        error: e.error
      };
    case "RESET":
      return {
        ...Te(),
        source: t.source,
        settings: t.settings
      };
    default:
      return t;
  }
}
const Ne = [
  { widget: "recon_mode", role: "reconstruction-mode", kind: "string" },
  { widget: "recon_geometry_provider", role: "reconstruction-provider", kind: "string" },
  { widget: "recon_vggt_checkpoint", role: "reconstruction-checkpoint", kind: "string" },
  { widget: "recon_quality", role: "reconstruction-quality", kind: "string" },
  { widget: "recon_segmentation_provider", role: "reconstruction-segmentation", kind: "string" },
  { widget: "recon_completion_policy", role: "reconstruction-completion-policy", kind: "string" },
  { widget: "recon_max_objects", role: "reconstruction-max-objects", kind: "number" },
  { widget: "recon_semantic_labels", role: "reconstruction-semantic-labels", kind: "string" },
  { widget: "recon_blockout_assets", role: "reconstruction-blockout-assets", kind: "string" },
  { widget: "recon_scene_scale", role: "reconstruction-scene-scale", kind: "number" },
  { widget: "recon_source_texture", role: "reconstruction-source-texture", kind: "boolean" },
  { widget: "recon_detect_ground", role: "reconstruction-detect-ground", kind: "boolean" },
  { widget: "recon_detect_walls", role: "reconstruction-detect-walls", kind: "boolean" }
];
function Re(t, e, r) {
  const o = t?.widgets?.find((a) => a.name === e);
  return o ? o.value : r;
}
function W(t, e, r) {
  const o = t?.widgets?.find((a) => a.name === e);
  return !o || o.value === r ? !1 : (o.value = r, t.setDirtyCanvas?.(!0, !0), !0);
}
function Ae(t, e) {
  return t?.querySelector?.(`[data-role="${e}"]`) || null;
}
function ce(t, e) {
  if (!(!t || !e))
    for (const r of Ne) {
      const o = Ae(e, r.role);
      if (!o) continue;
      const a = Re(t, r.widget, void 0);
      a != null && (r.kind === "boolean" ? o.checked = !!a : o.value = String(a));
    }
}
function O(t, e) {
  if (!t || !e) return !1;
  let r = !1;
  for (const a of Ne) {
    const n = Ae(e, a.role);
    if (!n) continue;
    if (a.kind === "boolean") {
      r = W(t, a.widget, !!n.checked) || r;
      continue;
    }
    const s = n.value;
    s === "" || s == null || (r = W(t, a.widget, a.kind === "number" ? Number(s) : s) || r);
  }
  const o = Re(t, "recon_completion_policy", "off");
  return r = W(t, "recon_completion_provider", o === "off" ? "none" : "sam3d_objects") || r, r;
}
function B(t) {
  return Math.round(Math.min(1, Math.max(0, t?.progress || 0)) * 100);
}
function or(t, e) {
  if (!t) return;
  const r = tr(e), o = t.querySelector('[data-role="reconstruction-run"]');
  o && (o.disabled = !r.canStart);
  const a = t.querySelector('[data-role="reconstruction-stop"]');
  a && (a.disabled = !r.canStop);
  const n = t.querySelector('[data-role="reconstruction-open-director"]');
  n && (n.disabled = !r.canOpenDirector);
  const s = t.querySelector('[data-role="reconstruction-preview-toggle"]');
  s && (s.disabled = !r.canPreview);
  const i = t.querySelector('[data-role="reconstruction-discard"]');
  i && (i.disabled = !r.canDiscard);
  const c = t.querySelector('[data-role="reconstruction-progress"]');
  c && (c.style.width = `${B(e)}%`);
  const l = t.querySelector('[data-role="reconstruction-stage"]');
  if (l)
    if (e?.error) {
      const u = e.error?.message || e.error?.code || String(e.error);
      l.textContent = u, l.dataset.state = "error";
    } else e?.stage ? (l.textContent = `${e.stage} (${B(e)}%)`, l.dataset.state = "active") : e?.jobState && e.jobState !== "IDLE" ? (l.textContent = `${e.jobState} (${B(e)}%)`, l.dataset.state = e.jobState === "DONE" ? "ok" : "active") : (l.textContent = h("Ready to reconstruct"), l.dataset.state = "idle");
  const d = t.querySelector('[data-role="reconstruction-summary"]');
  if (d)
    if (e?.summary) {
      d.hidden = !1;
      const u = e.summary, m = u.triangle_count != null ? u.triangle_count : u.mesh_triangles, p = m != null ? Number(m).toLocaleString() : null, g = u.camera_fov_x != null ? u.camera_fov_x : u.camera_fov, y = g != null ? Number(g).toFixed(1) : null, k = Number(u.ground_confidence) > 0 ? h("ground plane detected") : null, S = [];
      p && S.push(`${p} ${h("triangles")}`), y && S.push(`FOV ${y}°`), k && S.push(k), d.textContent = S.join(" • ");
    } else
      d.hidden = !0, d.textContent = "";
  const f = t.querySelector('[data-role="reconstruction-warnings"]');
  if (f) {
    const u = e?.warnings || [];
    if (u.length > 0) {
      f.hidden = !1, f.replaceChildren();
      for (const m of u) {
        const p = document.createElement("div");
        p.className = "oc-warning-item", p.textContent = `⚠ ${m}`, f.appendChild(p);
      }
    } else
      f.hidden = !0, f.replaceChildren();
  }
}
class ar {
  constructor({
    root: e,
    node: r,
    api: o,
    app: a = null,
    getSource: n = () => null,
    onAdopt: s = () => {
    },
    onQueue: i = () => {
    },
    onCancel: c = () => {
    },
    on: l = (d, f, u) => d?.addEventListener?.(f, u)
  }) {
    this.root = e, this.node = r, this.api = o, this.app = a, this.getSource = n, this.onAdopt = s, this.onQueue = i, this.onCancel = c, this.on = l, this.client = new Jt(o), this.runGeneration = 0, this.state = Te();
    const d = this.getSource();
    d && (this.state.source = d), this.unbindControls = Yt(this.root, {
      onRun: () => this.run(),
      onStop: () => this.stop(),
      onOpenDirector: () => this.openDirector(),
      onSettingsChange: (p) => {
        O(this.node, this.root), this.dispatch({ type: "SETTINGS", settings: p });
      },
      on: this.on
    }), this.syncFromWidgets(), O(this.node, this.root), this.preview = null, this.previewLoad = null, this.previewOpen = !1;
    const f = this.root?.querySelector?.('[data-role="reconstruction-preview-toggle"]');
    f && this.on(f, "click", () => this.togglePreview());
    const u = this.root?.querySelector?.('[data-role="reconstruction-preview-fit"]');
    u && this.on(u, "click", () => this.preview?.fit());
    const m = this.root?.querySelector?.('[data-role="reconstruction-discard"]');
    m && this.on(m, "click", () => {
      m.disabled = !0, Promise.resolve(this.discard()).finally(() => this.render());
    }), this.initCapabilities(), this.render();
  }
  /** The reconstructed MotionScene currently in `state.result`, or null. */
  currentScene() {
    const e = this.state.result;
    return e ? e.motion_scene || e : null;
  }
  async ensurePreview() {
    return this.preview || this.disposed ? this.preview : (this.previewLoad ||= import("./chunk-Biv4MROn.js").then(({ TrackViewer: e }) => {
      if (this.disposed || this.preview) return this.preview;
      const r = this.root.querySelector('[data-role="reconstruction-3d"]');
      return this.preview = r ? new e(r) : null, this.preview;
    }).catch((e) => (console.warn("OmniCam reconstruction 3D preview unavailable", e), null)).finally(() => {
      this.previewLoad = null;
    }), this.previewLoad);
  }
  pushSceneToPreview() {
    const e = this.currentScene();
    !this.preview || !e || (this.preview.setReconstructedScene(e, {
      resolveAssetUrl: (r) => be(this.api, r)
    }), this.preview.resize(), this.preview.fit());
  }
  async togglePreview() {
    this.previewOpen = !this.previewOpen;
    const e = this.root.querySelector('[data-role="reconstruction-preview"]');
    e && (e.hidden = !this.previewOpen);
    const r = this.root.querySelector('[data-role="reconstruction-preview-toggle"]');
    r && r.setAttribute("aria-pressed", String(this.previewOpen)), this.previewOpen && (await this.ensurePreview(), !this.disposed && this.pushSceneToPreview());
  }
  /** Re-read the node widgets into the panel DOM (mount + workflow reload). */
  syncFromWidgets() {
    ce(this.node, this.root), q(this.root), this.render();
  }
  async initCapabilities() {
    try {
      const e = this.root.querySelector('[data-role="reconstruction-provider"]'), r = this.root.querySelector('[data-role="reconstruction-stage"]'), o = this.root.querySelector('[data-role="reconstruction-checkpoint"]');
      if (await zt(this.client, {
        selectElement: e,
        statusElement: r,
        checkpointSelectElement: o
      }), this.disposed) return;
      ce(this.node, this.root), q(this.root), this.render();
    } catch {
    }
  }
  setSource(e) {
    this.dispatch({ type: "SOURCE", source: e });
  }
  dispatch(e) {
    if (this.disposed) return;
    const r = this.state.result;
    this.state = rr(this.state, e), this.render(), this.previewOpen && this.preview && this.state.result && this.state.result !== r && this.pushSceneToPreview();
  }
  render() {
    or(this.root, this.state);
  }
  async run() {
    !(this.state.source || this.getSource()) || this.disposed || (this.runGeneration += 1, O(this.node, this.root), this.dispatch({ type: "STATE", jobState: "PREPARING" }), await this.onQueue());
  }
  /**
   * Adopt a scene_reconstruct result that arrived through the Extractor's
   * queued executed() envelope (parseExtractorMessage). The
   * reconstruction-specific detail rides in `reconstruction`.
   */
  acceptQueuedResult(e) {
    if (this.disposed) return;
    this.runGeneration += 1;
    const r = e.reconstruction || {};
    this.dispatch({
      type: "DONE",
      jobId: "",
      result: e.motionScene,
      // The panel renders triangle_count / camera_fov_x etc. off the pipeline
      // summary; fall back to the flatter reconstruction block if absent.
      summary: r.summary || r,
      warnings: r.warnings || [],
      fingerprint: e.fingerprint
    });
  }
  async stop() {
    this.runGeneration += 1, this.dispatch({ type: "STATE", jobState: "STOPPING" }), await this.onCancel();
  }
  openDirector() {
    if (!this.disposed && this.state.result) {
      const e = this.state.result.motion_scene || this.state.result;
      this.onAdopt(e);
    }
  }
  /**
   * Throw away the current reconstruction the user is unhappy with: delete its
   * cache folder on disk (so the next identical run recomputes instead of
   * serving this one back), close the 3D preview, and return the panel to
   * IDLE. The camera track and every other cached reconstruction are left
   * alone -- this is the narrow counterpart to the header's "Clear Cache".
   */
  async discard() {
    if (!this.state.result || !await ve(
      this,
      h("Discard reconstruction"),
      h("Removes this reconstruction and its cached files so the next run recomputes it. The camera track and other reconstructions are left untouched.")
    ) || this.disposed) return !1;
    const r = String(this.state.fingerprint || "");
    if (r)
      try {
        if (await this.client.deleteCacheEntry(r), this.disposed) return !1;
      } catch (a) {
        return this.dispatch({ type: "ERROR", error: { message: a.message } }), !1;
      }
    this.previewOpen && await this.togglePreview(), this.dispatch({ type: "RESET" });
    const o = this.node.__majoorOmniCamExtractorRuntime;
    return o && (o.reconstructionResult = null), !0;
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.runGeneration += 1, this.unbindControls?.(), this.unbindControls = null, this.preview?.dispose(), this.preview = null);
  }
}
const nr = [
  "normalize_origin",
  "motion_scale",
  "position_smoothing",
  "rotation_smoothing",
  "horizon_stabilization",
  "simplify_keys",
  "position_tolerance",
  "rotation_tolerance_deg"
];
function sr(t, e) {
  return t?.widgets?.find((r) => r.name === e) || null;
}
function le(t, e, r) {
  const o = sr(t, e);
  return !o || o.value === r ? !1 : (o.value = r, t?.setDirtyCanvas?.(!0, !0), !0);
}
function ir({ node: t, root: e, mode: r, refineSettings: o }) {
  let a = le(t, "extract_mode", r);
  if (r === "scene_reconstruct")
    return O(t, e) || a;
  for (const n of nr)
    o?.[n] !== void 0 && (a = le(t, n, o[n]) || a);
  return a;
}
const cr = {
  "subgraph-not-supported": "OmniCam TRACK does not support an Extractor inside a subgraph yet. Move it to the root graph, or run the whole workflow with Queue Prompt.",
  "no-execution-id": "This Extractor has no resolvable node id and cannot be queued.",
  "submission-busy": "ComfyUI is still sending another prompt. Press TRACK again in a moment."
};
async function lr(t, e = "camera_track") {
  try {
    const r = await Mt(t, e), o = cr[r?.reason];
    o && t.dispatch({ type: "FAILED", error: o });
  } catch (r) {
    t.dispatch({ type: "FAILED", error: String(r?.message || r) });
  }
}
function ur(t) {
  ir({
    node: t.node,
    root: t.root,
    mode: t.extractMode,
    refineSettings: t.refine.settings
  });
}
function dr(t) {
  t.sourceViewer.setFollow(!0), t.overlay.clear(), t.diagnostics.clear(), t.queuePromptId = "", t.dispatch({ type: "JOB_STARTED", status: { job_id: "", state: "QUEUED" } }), t.coordinator.seek(0, "backend");
}
async function pr(t) {
  const e = String(t.queuePromptId || "");
  if (e) {
    t.dispatch({ type: "QUEUE_LIFECYCLE", state: "CANCELLING" });
    try {
      await $(t.api, e);
    } catch (r) {
      t.dispatch({
        type: "QUEUE_LIFECYCLE",
        state: "FAILED",
        error: String(r?.message || r)
      });
    }
  }
}
const hr = 200, ue = {
  position_smoothing: 0.15,
  rotation_smoothing: 0.1,
  horizon_stabilization: 0,
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
function z() {
  return { pitch: 0, yaw: 0, roll: 0 };
}
class fr {
  constructor({ onRefine: e, delay: r = hr, setTimer: o, clearTimer: a } = {}) {
    this.settings = { ...ue }, this.alignment = z(), this.onRefine = e || (() => {
    }), this.delay = r, this.setTimer = o || ((n, s) => setTimeout(n, s)), this.clearTimer = a || ((n) => clearTimeout(n)), this.timer = null, this.lastSent = "";
  }
  /** Merge a change and schedule a refine. Returns the merged settings. */
  update(e) {
    return this.settings = { ...this.settings, ...e }, this.schedule(), this.settings;
  }
  setAlignment(e) {
    return this.alignment = { ...this.alignment, ...e }, this.update({
      global_rotation_xyzw: mr(this.alignment),
      estimate_up: !1
    });
  }
  /** Ask the server to derive the levelling rotation from the solve itself. */
  requestEstimatedUp() {
    return this.alignment = z(), this.update({ global_rotation_xyzw: null, estimate_up: !0 });
  }
  setSpikeAction(e, r) {
    const o = { ...this.settings.spike_actions };
    return r === "ignore" ? delete o[String(e)] : o[String(e)] = r, this.update({ spike_actions: o });
  }
  reset() {
    return this.settings = { ...ue }, this.alignment = z(), this.schedule(), this.settings;
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
    const e = JSON.stringify(this.settings);
    return e === this.lastSent ? null : (this.lastSent = e, this.onRefine(this.payload()));
  }
  dispose() {
    this.clearTimer(this.timer), this.timer = null;
  }
}
function mr({ pitch: t = 0, yaw: e = 0, roll: r = 0 } = {}) {
  if (!t && !e && !r) return null;
  const [o, a, n] = [t, e, r].map((u) => (Number(u) || 0) * (Math.PI / 180) * 0.5), [s, i, c, l, d, f] = [
    Math.cos(o),
    Math.sin(o),
    Math.cos(a),
    Math.sin(a),
    Math.cos(n),
    Math.sin(n)
  ];
  return [
    i * c * d + s * l * f,
    s * l * d - i * c * f,
    s * c * f + i * l * d,
    s * c * d - i * l * f
  ];
}
class gr {
  constructor({ maxFrames: e = 180 } = {}) {
    this.maxFrames = Math.max(1, Math.floor(Number(e) || 180)), this.frames = /* @__PURE__ */ new Map();
  }
  set(e, { points: r = [], vectors: o = [], state: a = "unknown" } = {}) {
    const n = Math.max(0, Math.floor(Number(e) || 0)), s = {
      frame: n,
      points: Array.isArray(r) ? r : [],
      vectors: Array.isArray(o) ? o : [],
      state: String(a || "unknown")
    };
    for (this.frames.delete(n), this.frames.set(n, s); this.frames.size > this.maxFrames; ) this.frames.delete(this.frames.keys().next().value);
    return s;
  }
  get(e) {
    return this.frames.get(Math.max(0, Math.floor(Number(e) || 0))) || null;
  }
  clear() {
    this.frames.clear();
  }
  dispose() {
    this.clear();
  }
}
function br(t, e) {
  const r = Math.max(0, Math.floor(Number(e) || 0) - 1);
  return Math.max(0, Math.min(r, Math.round(Number(t) || 0)));
}
function vr(t) {
  return ["manual", "transport", "timeline", "quality", "input"].includes(t);
}
class yr {
  constructor({
    media: e = null,
    getViewer: r = () => null,
    showDiagnostics: o = () => {
    },
    dispatch: a = () => {
    },
    setFollow: n = () => {
    },
    onPlaybackState: s = () => {
    },
    frameCount: i = 0,
    fps: c = 24,
    loop: l = !1,
    // Closures, not .bind(globalThis): the receiver is what matters here and a
    // closure states it directly instead of through a partial application.
    requestAnimationFrame: d = (u) => globalThis.requestAnimationFrame?.(u),
    cancelAnimationFrame: f = (u) => globalThis.cancelAnimationFrame?.(u)
  } = {}) {
    this.media = e, this.getViewer = r, this.showDiagnostics = o, this.dispatch = a, this.setFollow = n, this.onPlaybackState = s, this.frameCount = Math.max(0, Math.floor(Number(i) || 0)), this.fps = Math.max(1, Number(c) || 24), this.loop = !!l, this.frame = 0, this.playing = !1, this.disposed = !1, this.animationFrame = null, this.playbackStartFrame = 0, this.playbackStartTime = null, this.requestAnimationFrame = d || (() => null), this.cancelAnimationFrame = f || (() => {
    });
  }
  setFrameCount(e) {
    const r = Math.max(0, Math.floor(Number(e) || 0));
    return r === this.frameCount ? this.frameCount : (this.frameCount = r, this.media?.setFrameCount?.(this.frameCount), this.dispatch({ type: "FRAME_COUNT", frameCount: this.frameCount }), this.frameCount || this.pause(), this.frameCount);
  }
  reconcileFrameCount(e) {
    const r = Number(e?.frame_count);
    return this.setFrameCount(Number.isFinite(r) ? r : this.frameCount);
  }
  setRate(e) {
    return this.fps = Math.max(1, Number(e) || 24), this.media?.setRate?.(this.fps), this.fps;
  }
  setLoop(e) {
    return this.loop = !!e, this.media?.setLoop?.(this.loop), this.loop;
  }
  seek(e, r = "manual") {
    if (this.disposed) return this.frame;
    const o = br(e, this.frameCount);
    return vr(r) && this.setFollow(!1), r !== "media" && this.media?.seekFrame?.(o), this.getViewer?.()?.setFrame?.(o), this.showDiagnostics(o), this.frame = o, this.dispatch({ type: "FRAME", frame: o }), r !== "playback" && (this.playbackStartFrame = o, this.playbackStartTime = null), o;
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
    !this.playing || this.disposed || this.animationFrame !== null || (this.animationFrame = this.requestAnimationFrame((e) => this.tick(e)));
  }
  tick(e) {
    if (this.animationFrame = null, !this.playing || this.disposed) return;
    const r = Number(e) || 0;
    this.playbackStartTime === null && (this.playbackStartTime = r);
    const o = Math.max(0, r - this.playbackStartTime), a = Math.floor(o * this.fps / 1e3), n = this.frameCount;
    if (n < 1) {
      this.pause();
      return;
    }
    const s = Math.max(0, n - 1);
    let i = this.playbackStartFrame + a;
    if (i > s)
      if (this.loop && n > 0) i %= n;
      else {
        s !== this.frame && this.seek(s, "playback"), this.pause();
        return;
      }
    i !== this.frame && this.seek(i, "playback"), this.schedule();
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.pause(), this.media = null, this.getViewer = null, this.showDiagnostics = null, this.dispatch = null, this.setFollow = null, this.onPlaybackState = null);
  }
}
class I extends Error {
}
function xr(t, { track: e, state: r } = {}) {
  if (r !== "COMPLETED")
    throw new I("Only a completed solve can be applied to the Director.");
  const o = e?.keyframes;
  if (!Array.isArray(o) || !o.length)
    throw new I("This solve produced no camera keys to apply.");
  const a = String(e?.metadata?.extractor_fingerprint || "");
  if (!a)
    throw new I("This track carries no extractor fingerprint.");
  const n = J(e);
  if (!n)
    throw new I("This solve cannot be wrapped in a canonical motion scene.");
  Z(t, {
    motionScene: n,
    fingerprint: a,
    solver_coverage: Number(e?.metadata?.solver_coverage ?? e?.metadata?.confidence) || 0
  });
  const s = et(t);
  return { fingerprint: a, notified: s };
}
function wr(t, e = "") {
  const r = Number(t?.code) || 0, o = e ? "" : " (no source URL was set)";
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
class kr extends We {
  constructor(e, {
    fps: r = 24,
    onFrame: o = () => {
    },
    onMetadata: a = () => {
    },
    onError: n = () => {
    },
    onMode: s = () => {
    },
    fallbackViewer: i = null
  } = {}) {
    super(e, {
      fps: r,
      durationFrames: 1,
      onFrame: (c) => this.reportFrame(c),
      onMetadata: a,
      onError: (c) => this.handleMediaError(c),
      errorMessage: wr,
      loop: !0,
      muted: !0
    }), this.frameCount = 0, this.onExternalFrame = o, this.ignoredFrame = null, this.follow = !0, this.mode = "native", this.source = null, this.onMode = s, this.fallbackViewer = i, this.onPlaybackError = n;
  }
  setSource(e, { source: r, ...o } = {}) {
    const a = r || null, n = this.source?.kind !== a?.kind || this.source?.value !== a?.value, s = super.setSource(e, o);
    return s || n ? (this.source = a, this.fallbackViewer?.clear?.(), this.setMode("native")) : a && (this.source = a), s;
  }
  setMode(e) {
    const r = ["native", "fallback", "error"].includes(e) ? e : "error";
    return this.mode === r ? !1 : (this.mode = r, this.onMode(r), !0);
  }
  setRate(e) {
    return this.fps = Math.max(1, Number(e) || 24), this.fps;
  }
  setFrameCount(e) {
    return this.frameCount = Math.max(0, Math.round(Number(e) || 0)), this.durationFrames = Math.max(1, this.frameCount), this.frameCount;
  }
  handleMediaError(e) {
    const r = Number(this.video?.error?.code) || 0;
    if ((r === 2 || r === 3 || r === 4) && this.fallbackViewer && this.source) {
      this.setMode("fallback"), this.loadFallback(this.currentFrame(), e);
      return;
    }
    this.setMode("error"), this.onPlaybackError(e);
  }
  async loadFallback(e, r = "") {
    try {
      return await this.fallbackViewer.load(this.source, e) ? (this.error = "", this.setMode("fallback"), !0) : !1;
    } catch (o) {
      return this.setMode("error"), this.onPlaybackError(`${r} Fallback preview failed: ${String(o?.message || o)}`), !1;
    }
  }
  /** Apply the coordinator's frame to whichever preview mode is active. */
  seekFrame(e) {
    const r = Math.max(0, Number(e) || 0);
    return this.mode === "fallback" ? (this.loadFallback(r), !0) : (this.ignoredFrame = r, super.seekFrame(r));
  }
  reportFrame(e) {
    const r = Math.max(0, Number(e) || 0);
    if (this.ignoredFrame === r) {
      this.ignoredFrame = null;
      return;
    }
    this.onExternalFrame(r);
  }
  /** A user gesture: seek, and stop following the solver until re-enabled. */
  scrubTo(e) {
    this.setFollow(!1);
    const r = Math.max(0, Number(e) || 0);
    this.seekFrame(r), this.onExternalFrame(r);
  }
  /** The solver moved: follow it only if the user has not taken over. */
  followSolveFrame(e) {
    return this.follow ? (this.mode === "fallback" ? this.loadFallback(e) : this.seekFrame(e), !0) : !1;
  }
  setFollow(e) {
    return this.follow = !!e, this.follow;
  }
  setLoop(e) {
    super.setLoop(e);
  }
  dispose() {
    this.fallbackViewer?.dispose?.(), this.fallbackViewer = null, super.dispose();
  }
}
function de(t, e) {
  const r = Math.max(1, Number(e) || 24), o = Math.max(0, Number(t) || 0), a = Math.floor(o / r), n = (s, i = 2) => String(s).padStart(i, "0");
  return `${n(Math.floor(a / 60))}:${n(a % 60)}:${n(o % r)}`;
}
const Sr = "/majoor/omnicam/extractor/frame";
function Er(t) {
  return Math.max(0, Math.round(Number(t) || 0));
}
function P(t, e, r = 0) {
  const o = Number(t?.get?.(e));
  return Number.isFinite(o) && o > 0 ? Math.round(o) : r;
}
async function Cr(t) {
  try {
    return await t?.text?.() || `Preview frame request failed (${t?.status || "unknown"})`;
  } catch {
    return `Preview frame request failed (${t?.status || "unknown"})`;
  }
}
function _r(t) {
  return t?.name === "AbortError";
}
function Tr(t, e, r = e?.width, o = e?.height) {
  const a = t?.getContext?.("2d"), n = Math.max(1, Number(e?.width) || 1), s = Math.max(1, Number(e?.height) || 1), i = Math.max(1, Math.round(Number(r) || n)), c = Math.max(1, Math.round(Number(o) || s));
  if (!a) return !1;
  t.width !== i && (t.width = i), t.height !== c && (t.height = c);
  const l = Math.min(i / n, c / s), d = Math.round(n * l), f = Math.round(s * l);
  return a.clearRect(0, 0, i, c), a.drawImage(e, Math.round((i - d) / 2), Math.round((c - f) / 2), d, f), !0;
}
class Nr {
  constructor(e, { api: r, decodeImage: o = (a) => globalThis.createImageBitmap(a) } = {}) {
    this.canvas = e, this.api = r, this.decodeImage = o, this.abortController = null, this.generation = 0, this.frame = 0, this.frameCount = 0, this.error = "";
  }
  abort() {
    this.abortController?.abort(), this.abortController = null;
  }
  /** Fetch, decode, and paint a single managed video frame. */
  async load(e, r, { maxDimension: o = 960 } = {}) {
    this.abort();
    const a = ++this.generation, n = new AbortController();
    this.abortController = n;
    const s = Er(r);
    try {
      const i = await this.api?.fetchApi?.(Sr, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: e, frame: s, max_dimension: o }),
        signal: n.signal
      });
      if (!i?.ok) throw new Error(await Cr(i));
      const c = await i.blob(), l = await this.decodeImage(c);
      if (a !== this.generation || n.signal.aborted)
        return l?.close?.(), !1;
      const d = P(i.headers, "X-OmniCam-Width", l?.width), f = P(i.headers, "X-OmniCam-Height", l?.height);
      let u = !1;
      try {
        u = Tr(this.canvas, l, d, f);
      } finally {
        l?.close?.();
      }
      if (!u) throw new Error("The fallback preview canvas is unavailable.");
      return this.frame = P(i.headers, "X-OmniCam-Frame", s), this.frameCount = P(i.headers, "X-OmniCam-Frame-Count", this.frameCount), this.error = "", !0;
    } catch (i) {
      if (a !== this.generation || n.signal.aborted || _r(i)) return !1;
      throw this.error = String(i?.message || i), i;
    } finally {
      a === this.generation && (this.abortController = null);
    }
  }
  clear() {
    this.abort(), this.generation += 1, this.error = "";
    const e = this.canvas;
    e?.getContext?.("2d")?.clearRect(0, 0, e?.width || 0, e?.height || 0);
  }
  dispose() {
    this.clear(), this.canvas = null, this.api = null;
  }
}
async function Rr(t) {
  const e = await A.fetchApi("/majoor/omnicam/extractor/source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: t })
  });
  if (!e.ok)
    throw new Error(`OmniCam: could not describe the source (${e.status})`);
  return e.json();
}
function Ar(t) {
  const e = t.extractMode || "camera_track", r = Se(t.node, t.node.graph, e), o = r.ref ? `${r.ref.kind}:${r.ref.value}` : "", a = o !== (t.sourceKey || "");
  a && (t.sourceKey = o, t.describing = "", t.queuePromptId && $(t.api, t.queuePromptId).catch(() => {
  }), t.dispatch({ type: "SOURCE_RESET", source: { ...r, playbackError: "" } }), t.coordinator.setRate(24), t.coordinator.setFrameCount(0));
  const n = t.sourceViewer.setSource(
    r.available && r.ref ? be(A, r.ref.value) : "",
    { source: r.available ? r.ref : null }
  );
  return a && t.coordinator.seek(0, "source"), t.dispatch({ type: "SOURCE", source: n ? { ...r, playbackError: "" } : r }), e !== "scene_reconstruct" && (r.available && r.ref ? Me(t, r) : ee(t, 0)), lt(t, r), r;
}
async function Me(t, e) {
  if (t.describing === e.ref?.value) return null;
  t.describing = e.ref?.value;
  try {
    const r = await Rr(e.ref);
    if (t.disposed || t.sourceKey !== `${e.ref.kind}:${e.ref.value}`) return null;
    const o = r?.info || null;
    return t.dispatch({ type: "SOURCE", source: { info: o } }), o && (t.coordinator.setRate(Number(o.fps) || t.sourceViewer.fps), ee(t, Number(o.frame_count) || 0), ct(t, o)), o;
  } catch (r) {
    return console.warn("[OmniCam] could not describe the extractor source", r), null;
  }
}
function ee(t, e) {
  const r = Math.max(0, Math.round(Number(e) || 0));
  t.coordinator.setFrameCount(r), r !== t.state.frameCount && (t.dispatch({ type: "FRAME_COUNT", frameCount: r }), t.coordinator.seek(t.coordinator.frame, "source"));
}
const Mr = `${Ue}${tt}
  .oc-extractor{width:100%;min-height:700px;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--oc-line);border-radius:var(--oc-radius);background:var(--oc-bg);isolation:isolate}
  /* Node 2.0's DOM-widget layer can drop a clip-path / z-index notch over the
     widget's extreme top edge, so no interactive control lives in row 1 -- the
     header carries only the brand + status; Clear Cache sits in the mode bar. */
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
  .oc-extractor .oc-stepper{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:6px 12px;background:var(--oc-sunken);border-bottom:1px solid var(--oc-line);font-size:11px}
  .oc-extractor .oc-step{display:flex;align-items:center;gap:5px;color:var(--oc-text-dim);font-weight:500}
  .oc-extractor .oc-step[data-state="active"]{color:var(--oc-accent);font-weight:700}
  .oc-extractor .oc-step[data-state="completed"]{color:var(--oc-ok-text);font-weight:600}
  .oc-extractor .oc-step[data-state="error"]{color:var(--oc-danger-text);font-weight:600}
  .oc-extractor .oc-step-num{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:50%;background:var(--oc-panel-2);border:1px solid var(--oc-line);font-size:10px}
  .oc-extractor .oc-step[data-state="active"] .oc-step-num{background:var(--oc-accent);color:var(--oc-accent-ink);border-color:var(--oc-accent)}
  .oc-extractor .oc-step[data-state="completed"] .oc-step-num{background:var(--oc-ok-bg);color:var(--oc-ok-text);border-color:var(--oc-ok-line)}
  .oc-extractor .oc-step[data-state="error"] .oc-step-num{background:var(--oc-danger-bg);color:var(--oc-danger-text);border-color:var(--oc-danger-line)}
  .oc-extractor .oc-step-divider{color:var(--oc-text-faint);font-size:10px}
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
   .oc-extractor .oc-track-pane .oc-views{position:absolute;z-index:4;inset:10px auto auto 10px;width:auto;height:auto;display:flex;align-items:center;gap:4px;max-width:calc(100% - 20px);padding:4px;background:var(--oc-bg-panel);border:1px solid var(--oc-border-default);border-radius:7px}
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
  .oc-extractor .oc-mode-bar{display:flex;align-items:center;gap:6px;padding:6px 12px;background:var(--oc-panel);border-bottom:1px solid var(--oc-line)}
  .oc-extractor .oc-mode-bar .oc-clear-cache{margin-left:auto;flex:none}
  .oc-extractor .oc-mode-btn{padding:4px 10px;font-size:12px;font-weight:600;background:var(--oc-sunken);border:1px solid var(--oc-line);color:var(--oc-text-dim);cursor:pointer;border-radius:5px}
  .oc-extractor .oc-mode-btn[aria-selected="true"]{background:var(--oc-accent);border-color:var(--oc-accent);color:var(--oc-accent-ink)}
  .oc-extractor .oc-reconstruction-panel{display:flex;flex-direction:column;gap:9px;margin:9px;box-sizing:border-box}
  .oc-extractor .oc-stage-label{font-size:12px;color:var(--oc-text-dim);min-height:18px}
  .oc-extractor .oc-stage-label[data-state="active"]{color:var(--oc-accent)}
  .oc-extractor .oc-stage-label[data-state="error"]{color:var(--oc-danger-text)}
  .oc-extractor .oc-stage-label[data-state="ok"]{color:var(--oc-ok-text)}
  .oc-extractor .oc-summary-box{padding:6px 10px;background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:6px;font-size:12px;color:var(--oc-text)}
  .oc-extractor .oc-warnings-box{display:flex;flex-direction:column;gap:4px;padding:6px 10px;background:var(--oc-warn-bg);border:1px solid var(--oc-warn-line);border-radius:6px;font-size:12px;color:var(--oc-warn-text)}
  .oc-extractor .oc-recon-preview{display:flex;flex-direction:column;gap:4px;border:1px solid var(--oc-line);border-radius:6px;overflow:hidden;background:var(--oc-sunken)}
  .oc-extractor .oc-recon-preview-bar{display:flex;gap:6px;padding:4px 6px;background:var(--oc-panel);border-bottom:1px solid var(--oc-line)}
  .oc-extractor .oc-recon-preview canvas{width:100%;height:320px;display:block;touch-action:none;background:var(--oc-sunken)}
  .oc-extractor [hidden]{display:none!important}
  .oc-extractor .oc-views[hidden]{display:none!important}
  @media(max-width:720px){.oc-extractor .oc-columns{grid-template-columns:1fr}}
`;
function T(t, e, { min: r = 0, max: o = 1, step: a = 0.01, value: n = 0 } = {}) {
  return `<label for="oc-${t}">${e}</label>
    <input id="oc-${t}" data-role="${t}" type="range" min="${r}" max="${o}" step="${a}" value="${n}">
    <output data-role="${t}-out"></output>`;
}
function Ir() {
  return `<div class="majoor-omnicam oc-extractor">
    <style>${Mr}</style>
    <header class="oc-header">
      ${Ve("OmniCam Extractor")}
      <span class="oc-status-pill" data-role="solve-status" data-tone="neutral"><i class="oc-status-dot"></i><span data-role="solve-status-text">IDLE</span></span>
    </header>

    <div class="oc-mode-bar" aria-label="Extractor mode">
      <button type="button" class="oc-tab" data-role="extract-mode-camera" aria-selected="true">${h("Camera Track")}</button>
      <button type="button" class="oc-tab" data-role="extract-mode-reconstruct" aria-selected="false">${h("Scene Reconstruct")}</button>
      <button type="button" class="icon-button oc-clear-cache" data-role="clear-cache" title="${h("Clear cached tracks and reconstructions, and reset this node")}"><i class="pi pi-trash"></i></button>
    </div>

    <div class="oc-source" data-role="source-strip" data-available="false">
      <span class="oc-source-label" data-role="source-label">Connect a VIDEO input to track.</span>
    </div>

    <div class="oc-stepper" aria-label="Workflow progress">
      <div class="oc-step" data-step="source"><span class="oc-step-num">1</span> <span class="oc-step-label">${h("Source")}</span></div>
      <span class="oc-step-divider">→</span>
      <div class="oc-step" data-step="track"><span class="oc-step-num">2</span> <span class="oc-step-label">${h("Track")}</span></div>
      <span class="oc-step-divider">→</span>
      <div class="oc-step" data-step="solve"><span class="oc-step-num">3</span> <span class="oc-step-label">${h("Solve")}</span></div>
      <span class="oc-step-divider">→</span>
      <div class="oc-step" data-step="refine"><span class="oc-step-num">4</span> <span class="oc-step-label">${h("Refine")}</span></div>
      <span class="oc-step-divider">→</span>
      <div class="oc-step" data-step="output"><span class="oc-step-num">5</span> <span class="oc-step-label">${h("Output")}</span></div>
    </div>

    <div class="oc-card oc-reconstruction-panel" data-role="reconstruction-panel" hidden>
      <div class="oc-section">${h("Scene Reconstruction")}</div>
      <div class="oc-rows">
        <div class="oc-inline">
          <label for="oc-recon-provider">${h("Provider")}</label>
          <select id="oc-recon-provider" data-role="reconstruction-provider"></select>
          <label for="oc-recon-mode">${h("Result")}</label>
          <select id="oc-recon-mode" data-role="reconstruction-mode">
            <option value="depth_mesh">${h("Depth Mesh")}</option>
            <option value="blockout">${h("Blockout")}</option>
            <option value="hybrid">${h("Hybrid")}</option>
            <option value="scan">${h("Scan")}</option>
          </select>
          <label for="oc-recon-quality">${h("Quality")}</label>
          <select id="oc-recon-quality" data-role="reconstruction-quality">
            <option value="fast">${h("Fast")}</option>
            <option value="balanced" selected>${h("Balanced")}</option>
            <option value="high">${h("High")}</option>
            <option value="custom">${h("Custom")}</option>
          </select>
        </div>
        <div class="oc-inline">
          <label for="oc-recon-checkpoint">${h("Geometry Model")}</label>
          <select id="oc-recon-checkpoint" data-role="reconstruction-checkpoint">
            <option value="auto" selected>${h("Auto")}</option>
          </select>
        </div>
        <div class="oc-inline" data-role="reconstruction-semantic-row">
          <label for="oc-recon-segmentation">${h("Objects")}</label>
          <select id="oc-recon-segmentation" data-role="reconstruction-segmentation">
            <option value="comfy_sam3" selected>${h("SAM3")}</option>
            <option value="none">${h("None")}</option>
          </select>
          <label for="oc-recon-max-objects">${h("Max objects")}</label>
          <input id="oc-recon-max-objects" data-role="reconstruction-max-objects" type="number" min="1" max="128" step="1" value="24">
          <label for="oc-recon-completion">${h("Completion")}</label>
          <select id="oc-recon-completion" data-role="reconstruction-completion-policy">
            <option value="off" selected>${h("Off")}</option>
            <option value="low_depth_confidence">${h("Low confidence")}</option>
            <option value="selected">${h("Selected")}</option>
            <option value="all_bounded">${h("All bounded")}</option>
          </select>
        </div>
        <div class="oc-inline" data-role="reconstruction-labels-row">
          <label for="oc-recon-labels">${h("Labels")}</label>
          <input id="oc-recon-labels" data-role="reconstruction-semantic-labels" type="text" placeholder="${h("Default interior taxonomy")}" />
          <label for="oc-recon-assets">${h("3D assets")}</label>
          <select id="oc-recon-assets" data-role="reconstruction-blockout-assets" title="${h("Swap fitted boxes for GLB props from the asset library")}">
            <option value="off" selected>${h("Boxes only")}</option>
            <option value="proxy">${h("Add props")}</option>
            <option value="replace">${h("Replace boxes")}</option>
          </select>
        </div>
        <div class="oc-inline">
          <label class="oc-inline"><input data-role="reconstruction-recover-fov" type="checkbox" checked> ${h("Recover FOV")}</label>
          <label class="oc-inline"><input data-role="reconstruction-source-texture" type="checkbox" checked> ${h("Source Texture")}</label>
          <label class="oc-inline"><input data-role="reconstruction-detect-ground" type="checkbox" checked> ${h("Detect Ground")}</label>
          <label class="oc-inline"><input data-role="reconstruction-detect-walls" type="checkbox"> ${h("Detect Walls")}</label>
        </div>
        <div class="oc-inline">
          <label for="oc-recon-triangle-budget">${h("Triangle Budget")}</label>
          <input id="oc-recon-triangle-budget" data-role="reconstruction-triangle-budget" type="number" min="1000" max="500000" step="5000" value="120000">
          <label for="oc-recon-edge-threshold">${h("Edge Threshold")}</label>
          <input id="oc-recon-edge-threshold" data-role="reconstruction-edge-threshold" type="number" min="0.01" max="1" step="0.01" value="0.04">
          <label for="oc-recon-scene-scale">${h("Scene Scale")}</label>
          <input id="oc-recon-scene-scale" data-role="reconstruction-scene-scale" type="number" min="0.01" max="100" step="0.1" value="1.0">
        </div>
        <div class="oc-progress"><i data-role="reconstruction-progress" style="width:0%"></i></div>
        <div data-role="reconstruction-stage" class="oc-stage-label"></div>
        <div data-role="reconstruction-summary" class="oc-summary-box" hidden></div>
        <div data-role="reconstruction-warnings" class="oc-warnings-box" hidden></div>
        <div class="oc-recon-preview" data-role="reconstruction-preview" hidden>
          <div class="oc-recon-preview-bar">
            <button type="button" data-role="reconstruction-preview-fit" title="${h("Frame the reconstructed scene")}"><i class="pi pi-search"></i> ${h("Fit")}</button>
          </div>
          <canvas data-role="reconstruction-3d" width="960" height="540" aria-label="${h("3D preview of the reconstructed scene")}"></canvas>
        </div>
        <div class="oc-actions">
          <button type="button" class="oc-primary" data-role="reconstruction-run">${h("▶ RECONSTRUCT")}</button>
          <button type="button" data-role="reconstruction-stop" disabled>${h("■ STOP")}</button>
          <button type="button" data-role="reconstruction-discard" title="${h("Discard this reconstruction and its cached files so the next run recomputes it")}" disabled>${h("✕ DISCARD")}</button>
          <button type="button" data-role="reconstruction-preview-toggle" disabled>${h("3D PREVIEW")}</button>
          <button type="button" class="oc-primary" data-role="reconstruction-open-director" disabled>${h("OPEN IN DIRECTOR")}</button>
        </div>
      </div>
    </div>

    <main class="oc-body" data-role="camera-track-body">
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
            ${T("position-smoothing", "Position smooth", { value: 0.15 })}
            ${T("motion-scale", "Motion scale", { min: 0.01, max: 10, step: 0.01, value: 1 })}
          </div>
          <div class="oc-inline">
            <button type="button" data-act="estimate-up">Level Horizon</button>
          </div>
          <details class="oc-details"><summary>Advanced cleanup</summary>
            <div class="oc-sliders">
              ${T("rotation-smoothing", "Rotation smooth", { value: 0.1 })}
              ${T("horizon-stabilization", "Horizon stabilize", { value: 0 })}
              ${T("position-tolerance", "Key reduction", { min: 0, max: 0.5, step: 1e-3, value: 0.01 })}
              ${T("align-pitch", "Pitch", { min: -180, max: 180, step: 0.5, value: 0 })}
              ${T("align-yaw", "Yaw", { min: -180, max: 180, step: 0.5, value: 0 })}
              ${T("align-roll", "Roll", { min: -180, max: 180, step: 0.5, value: 0 })}
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
function $r(t = document) {
  const e = t.createElement("div");
  return e.innerHTML = Ir(), e.firstElementChild;
}
const Ie = {
  good: _.success,
  weak: _.warning,
  bad: _.error,
  unknown: _.borderDefault
};
function te(t) {
  if (!t) return "unknown";
  const e = String(t.state || "").toLowerCase();
  if (Ie[e]) return e;
  const r = Number(t.coverage);
  return Number.isFinite(r) ? r >= 0.7 ? "good" : r >= 0.35 ? "weak" : "bad" : "unknown";
}
function Lr(t, e) {
  const r = (t || []).find((a) => Number(a.frame) === Number(e)), o = [["Frame", String(e)]];
  return r ? (o.push(["Tracking state", te(r).toUpperCase()]), Number.isFinite(Number(r.coverage)) && o.push(["Coverage", `${Math.round(Number(r.coverage) * 100)}%`]), r.inliers != null && o.push(["Inliers", String(r.inliers)]), o) : (o.push(["Tracking state", "UNKNOWN"]), o);
}
_.success, _.warning, _.error;
const Pr = {
  position: _.typeCamera,
  target: _.typeLookAt,
  roll: _.typeRoll
}, U = [
  { key: "position", label: "Camera" },
  { key: "target", label: "Look At" },
  { key: "roll", label: "Roll" }
], Fr = 18, Or = 9, pe = 2, $e = 78, Dr = { solve: "SOLVE HEALTH" }, j = {
  bands: ["solve"],
  labels: !0,
  labelWidth: $e,
  bandHeight: Or,
  bandGap: pe,
  laneTopGap: pe + 2,
  laneHeight: Fr,
  laneGap: 0,
  rowChrome: !1,
  ruler: !0,
  playhead: !0,
  topPad: 1,
  bottomPad: 12
}, he = {
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
function Le(t = U, e = j) {
  const r = { ...j, ...e }, o = [];
  let a = r.topPad;
  for (const n of r.bands || [])
    o.length && (a += r.bandGap), o.push({
      kind: "band",
      key: n,
      label: Dr[n] || String(n).toUpperCase(),
      top: a,
      height: r.bandHeight
    }), a += r.bandHeight;
  for (const n of t)
    o.length && (a += o[o.length - 1].kind === "band" ? r.laneTopGap : r.laneGap), o.push({ kind: "lane", key: n.key, label: n.label, top: a, height: r.laneHeight }), a += r.laneHeight;
  return { rows: o, style: r, height: a + r.bottomPad };
}
function qr(t = U, e = j) {
  return Le(t, e).height;
}
function jr(t, e) {
  if (!t) return null;
  if (e === "position" || e === "target") {
    const o = t[e];
    return Array.isArray(o) ? o.map(Number) : null;
  }
  const r = Number(t.roll);
  return Number.isFinite(r) ? [r] : null;
}
function Ur(t, e, r = 1e-4) {
  return !t || !e || t.length !== e.length ? !1 : t.every((o, a) => Math.abs(o - e[a]) <= r);
}
function Pe(t, e = U) {
  const r = Array.isArray(t?.keyframes) ? t.keyframes : [], o = {};
  for (const { key: a } of e) {
    const n = [];
    let s = null;
    for (const i of r) {
      const c = jr(i?.camera, a);
      c && ((s === null || !Ur(c, s)) && n.push(Number(i.frame) || 0), s = c);
    }
    o[a] = n;
  }
  return o;
}
function Vr(t, e = null, r = "generic") {
  if (!t?.keyframes?.length || !e) return null;
  try {
    const a = Array.isArray(t.objects) && t.objects.some((n) => n?.id === "subject" && Array.isArray(n.position)) ? e : { ...e, allow_framing_loss: !0 };
    return ze(t, a, null, r);
  } catch {
    return null;
  }
}
function Gr(t, e, r, o = $e) {
  const a = Math.max(1, Number(r) || 0), n = Math.max(1, (Number(e) || 1) - o), s = Math.max(0, Math.min(1, (Number(t) - o) / n));
  return Math.max(0, Math.min(a - 1, Math.round(s * (a - 1))));
}
function Fe(t, e) {
  return Math.max(1, (Number(t) || 1) - e.labelWidth - (e.labelWidth ? 4 : 0));
}
function R(t, e, r, o) {
  const a = Math.max(1, (Number(r) || 1) - 1), n = Fe(e, o);
  return o.labelWidth + Math.max(0, Math.min(a, t)) / a * n;
}
function Wr(t, e) {
  const r = Math.max(0, Number(e) - 1);
  return (t || []).map((o) => {
    const a = Math.max(0, Math.min(r, Number(o?.start_frame ?? o?.frame) || 0)), n = Math.max(a, Math.min(r, Number(o?.end_frame ?? o?.frame) || a));
    return { start: a, end: n, level: o?.level === "error" ? "error" : "warn" };
  });
}
function Br(t, e, r, o, a, n) {
  for (const s of e) {
    const i = R(s.start, o, a, n), c = R(s.end, o, a, n), l = Math.max(2, c - i + 2);
    t.fillStyle = "#101014", t.fillRect(Math.round(i - 1), r.top + 2, Math.ceil(l + 2), r.height - 4), t.fillStyle = s.level === "error" ? "#ffffff" : "#f2c66d", t.fillRect(Math.round(i), r.top + 3, Math.ceil(l), r.height - 6);
  }
}
function zr(t, { y: e, height: r, width: o, frameCount: a, colorAt: n, style: s }) {
  const i = Math.max(1, Number(a) || 0), c = Fe(o, s), l = Math.max(1, Math.ceil(i / c)), d = Math.max(1, c / Math.ceil(i / l));
  for (let f = 0; f < i; f += l) {
    const u = n(f, Math.min(i, f + l));
    u && (t.fillStyle = u, t.fillRect(s.labelWidth + f / i * c, e, d, r));
  }
}
function Hr(t, e, r, o) {
  const a = new Map((t || []).map((s) => [Number(s.frame), s]));
  let n = "unknown";
  for (let s = Math.max(0, Number(r) || 0); s < Math.max(0, Number(o) || 0); s += 1) {
    const i = te(a.get(s)), c = String((e || [])[s] || "").toLowerCase(), l = c === "over" ? "bad" : c === "warn" ? "weak" : c === "ok" ? "good" : "unknown";
    F(i) > F(n) && (n = i), F(l) > F(n) && (n = l);
  }
  return n;
}
function Qr(t, e, r) {
  const o = Number(r) || 0, a = (t || []).find((i) => Number(i.frame) === o), n = String(e?.frame_grades?.[o] || "unknown").toUpperCase(), s = [["Solve state", te(a).toUpperCase()], ["Motion grade", n]];
  a && Number.isFinite(Number(a.coverage)) && s.push(["Coverage", `${Math.round(Number(a.coverage) * 100)}%`]), a?.inliers != null && s.push(["Inliers", String(a.inliers)]);
  for (const i of ["speed", "angular_speed", "acceleration", "jerk"]) {
    const c = Number(e?.series?.[i]?.[o]), l = Number(e?.limits?.[`max_${i}`]);
    Number.isFinite(c) && s.push([i.replace("_", " "), Number.isFinite(l) ? `${c.toFixed(2)} / ${l}` : c.toFixed(2)]);
  }
  return e?.framing?.[o] === !1 && !e?.limits?.allow_framing_loss && s.push(["Framing", "LOSS"]), s;
}
function Kr(t, e, r, o) {
  t.fillStyle = o, t.font = "9px system-ui, sans-serif", t.textBaseline = "middle", t.fillText(e, 2, r);
}
function Yr(t, e, r, o, a, n) {
  const s = Math.max(0, Math.min(n, o / 2, a / 2));
  t.beginPath(), t.moveTo(e + s, r), t.arcTo(e + o, r, e + o, r + a, s), t.arcTo(e + o, r + a, e, r + a, s), t.arcTo(e, r + a, e, r, s), t.arcTo(e, r, e + o, r, s), t.closePath();
}
function Xr(t, { row: e, width: r, style: o }) {
  const a = o.labelWidth, n = Math.max(2, r - a);
  Yr(t, a + 0.5, e.top + 0.5, n - 1, e.height - 1, 6), t.fillStyle = "#20202a", t.fill(), t.strokeStyle = "#26262f", t.lineWidth = 1, t.stroke(), e.kind === "lane" && (t.fillStyle = "#2c2c38", t.fillRect(a + 1, Math.round(e.top + e.height / 2), n - 2, 1));
}
function Jr(t, {
  track: e = null,
  health: r = null,
  quality: o = [],
  anomalies: a = [],
  frame: n = 0,
  frameCount: s = 0,
  channels: i = U,
  layout: c = j
} = {}) {
  const l = Math.max(1, Number(s) || Number(e?.duration_frames) || 1), d = Pe(e, i), { rows: f, style: u } = Le(i, c), m = {
    total: l,
    labelWidth: u.labelWidth,
    lanes: f.filter((b) => b.kind === "lane").map((b) => ({
      key: b.key,
      top: b.top,
      bottom: b.top + b.height,
      keys: d[b.key] || []
    })),
    anomalies: Wr(a, l)
  }, p = t?.getContext?.("2d"), g = t?.width || 0, y = t?.height || 0;
  if (!p || !g || !y) return { ...m, keys: d };
  p.clearRect(0, 0, g, y);
  const k = Array.isArray(r?.frame_grades) ? r.frame_grades : [], S = {
    solve: (b, x) => Ie[Hr(o, k, b, x)]
  };
  for (const b of f) {
    u.rowChrome && Xr(p, { row: b, width: g, style: u });
    const x = b.top + b.height / 2;
    if (u.labels && Kr(p, b.label, x, "#9a9aad"), b.kind === "band") {
      const w = S[b.key];
      if (!w) continue;
      const C = u.rowChrome ? 2 : 0;
      zr(p, {
        y: b.top + C,
        height: b.height - C * 2,
        width: g,
        frameCount: l,
        colorAt: w,
        style: u
      }), b.key === "solve" && Br(p, m.anomalies, b, g, l, u);
      continue;
    }
    const v = d[b.key] || [];
    v.length > 1 && !u.rowChrome && (p.strokeStyle = "#2c2c38", p.lineWidth = 1, p.beginPath(), p.moveTo(R(v[0], g, l, u), x), p.lineTo(R(v[v.length - 1], g, l, u), x), p.stroke()), p.fillStyle = Pr[b.key] || "#8b7bd8";
    const E = u.rowChrome ? 5.5 : 3.5;
    for (const w of v) {
      const C = Math.max(
        u.labelWidth + E,
        Math.min(g - E, R(w, g, l, u))
      );
      p.beginPath(), p.moveTo(C, x - E), p.lineTo(C + E, x), p.lineTo(C, x + E), p.lineTo(C - E, x), p.closePath(), p.fill();
    }
  }
  if (u.ruler) {
    p.fillStyle = "#3a3a48";
    const b = Math.min(12, l);
    for (let x = 0; x <= b; x += 1) {
      const v = Math.round(x / Math.max(1, b) * (l - 1));
      p.fillRect(R(v, g, l, u), y - 6, 1, 5);
    }
  }
  if (u.playhead) {
    const b = R(Math.max(0, Math.min(l - 1, Number(n) || 0)), g, l, u);
    p.fillStyle = "#e6e6f0", p.fillRect(Math.round(b), 0, 1, y);
  }
  return { ...m, keys: d };
}
function F(t) {
  return { unknown: 0, good: 1, weak: 2, bad: 3 }[t] ?? 0;
}
class Zr {
  /**
   * @param root the panel root, queried for its own `data-role` elements
   * @param onSeek called with a frame when the user scrubs the strip
   */
  constructor(e, { onSeek: r = () => {
  } } = {}) {
    this.root = e, this.onSeek = r, this.scrubbing = !1;
  }
  $(e) {
    return this.root?.querySelector(`[data-role="${e}"]`) || null;
  }
  /**
   * Draw the strip for one track.
   *
   * The track passed in is whichever the viewer is showing, so switching
   * RAW/REFINED therefore moves the displayed keys with it.
   */
  render({ track: e = null, health: r = null, quality: o = [], anomalies: a = [], frame: n = 0, frameCount: s = 0 } = {}) {
    const i = this.$("track-timeline");
    if (!i) return null;
    const c = qr(void 0, he);
    return i.height !== c && (i.height = c), Jr(i, {
      track: e,
      health: r,
      quality: o,
      anomalies: a,
      frame: n,
      layout: he,
      frameCount: Math.max(Number(s) || 0, Number(e?.duration_frames) || 0)
    });
  }
  /** Which frame a pointer event over the strip refers to, or null. */
  frameAt(e, r) {
    const o = this.$("extractor-dope-tracks");
    if (!o?.getBoundingClientRect) return null;
    const a = o.getBoundingClientRect();
    return Gr(e.clientX - a.left, a.width, r, 0);
  }
  /** Wire scrubbing. `on` is the panel's own EventScope binder. */
  bind(e, r) {
    const o = this.$("extractor-dope-tracks");
    e(o, "pointerdown", (a) => {
      o.setPointerCapture?.(a.pointerId), this.scrubbing = !0, this.pointerId = a.pointerId, this.seek(a, r());
    }), e(o, "pointermove", (a) => {
      this.scrubbing && a.pointerId === this.pointerId && this.seek(a, r());
    });
    for (const a of ["pointerup", "pointercancel"])
      e(o, a, (n) => {
        n.pointerId === this.pointerId && (o.releasePointerCapture?.(n.pointerId), this.scrubbing = !1, this.pointerId = null);
      });
  }
  seek(e, r) {
    const o = this.frameAt(e, r);
    return o !== null && this.onSeek(o), o;
  }
}
const eo = [
  "first-frame",
  "previous-key",
  "previous-frame",
  "play",
  "next-frame",
  "next-key",
  "last-frame",
  "toggle-loop"
], to = {
  "first-frame": '[data-act="first-frame"]',
  "previous-key": '[data-act="previous-key"]',
  "previous-frame": '[data-act="previous-frame"]',
  play: '[data-act="play"]',
  "next-frame": '[data-act="next-frame"]',
  "next-key": '[data-act="next-key"]',
  "last-frame": '[data-act="last-frame"]',
  "toggle-loop": '[data-act="toggle-loop"]'
};
function H(t) {
  return [...new Set((t || []).map((e) => Number(typeof e == "object" ? e?.frame : e)).filter(Number.isFinite).map((e) => Math.max(0, Math.round(e))))].sort((e, r) => e - r);
}
function ro(t, e) {
  const r = H(t?.anomalies), o = H(Object.values(Pe(e)).flat()), a = o.length ? o : H(e?.keyframes);
  return { anomalies: r, solved: a };
}
function Q(t, e, { anomalies: r, solved: o }) {
  const a = e > 0 ? (s) => s > t : (s) => s < t, n = (s) => {
    const i = s.filter(a);
    return e > 0 ? i[0] : i.at(-1);
  };
  return n(r) ?? n(o) ?? null;
}
function oo(t) {
  const e = String(t?.tagName || "").toLowerCase();
  return t?.isContentEditable || e === "textarea" || e === "select" ? !0 : e === "input" && ["text", "number"].includes(String(t.type || "text").toLowerCase());
}
function K(t) {
  return Math.max(0, Math.round(Number(t?.frameCount) || 0));
}
function ao(t, {
  coordinator: e,
  getState: r = () => ({}),
  getTrack: o = () => null,
  on: a = (n, s, i) => n?.addEventListener?.(s, i)
} = {}) {
  const n = (u) => t?.querySelector?.(to[u]) || null, s = () => r() || {}, i = () => ro(s(), o()), c = (u) => K(s()) < 1 ? !1 : (e?.seek?.(u, "transport"), !0), l = (u) => {
    const m = Q(Number(s().frame) || 0, u, i());
    return m === null ? !1 : c(m);
  }, d = {
    "first-frame": () => c(0),
    "previous-key": () => l(-1),
    "previous-frame": () => c((Number(s().frame) || 0) - 1),
    play: () => K(s()) > 0 && !!e?.toggle?.(),
    "next-frame": () => c((Number(s().frame) || 0) + 1),
    "next-key": () => l(1),
    "last-frame": () => c(K(s()) - 1),
    "toggle-loop": () => (e?.setLoop?.(!e?.loop), f(), !0)
  };
  for (const u of eo) {
    const m = n(u);
    m && a(m, "click", () => d[u]());
  }
  a(t, "keydown", (u) => {
    if (oo(u.target)) return;
    const m = {
      " ": "play",
      Spacebar: "play",
      Space: "play",
      ArrowLeft: "previous-frame",
      ArrowRight: "next-frame",
      Home: "first-frame",
      End: "last-frame"
    }[u.key];
    !m || !d[m]() || (u.preventDefault(), u.stopPropagation());
  });
  function f() {
    const u = Number(s().frame) || 0, m = i(), p = n("previous-key");
    p && (p.disabled = Q(u, -1, m) === null);
    const g = n("next-key");
    g && (g.disabled = Q(u, 1, m) === null);
    const y = n("toggle-loop");
    y && y.setAttribute("aria-pressed", String(!!e?.loop));
    const k = n("play");
    if (k) {
      k.classList?.toggle?.("playing", !!e?.playing);
      const S = k.querySelector?.("i");
      S && (S.className = e?.playing ? "pi pi-pause" : "pi pi-play"), k.setAttribute("aria-label", e?.playing ? "Pause playback" : "Play playback");
    }
  }
  return { render: f };
}
const no = 300, so = 300, M = {
  accepted: "#46a758",
  weak: "#e5a23c",
  rejected: "#e5484d",
  current: "#8b7bd8"
};
function fe(t, e) {
  const r = Array.isArray(t) ? t : [];
  if (r.length <= e) return r.slice();
  const o = r.length / e, a = [];
  for (let n = 0; n < e; n += 1) a.push(r[Math.floor(n * o)]);
  return a;
}
function Y(t, { sourceWidth: e, sourceHeight: r, width: o, height: a }) {
  const n = Number(t?.x ?? t?.[0]) || 0, s = Number(t?.y ?? t?.[1]) || 0, i = n <= 1 && s <= 1 && n >= 0 && s >= 0, c = i ? o : o / Math.max(1, e || o), l = i ? a : a / Math.max(1, r || a);
  return [n * c, s * l];
}
class io {
  constructor(e) {
    this.canvas = e, this.points = [], this.vectors = [], this.frame = 0, this.state = "unknown";
  }
  setDiagnostics({ points: e = [], vectors: r = [], frame: o = 0, state: a = "unknown" } = {}) {
    this.points = fe(e, no), this.vectors = fe(r, so), this.frame = Number(o) || 0, this.state = String(a || "unknown"), this.draw();
  }
  clear() {
    this.points = [], this.vectors = [];
    const e = this.canvas?.getContext?.("2d");
    e && e.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  draw({ sourceWidth: e = 0, sourceHeight: r = 0 } = {}) {
    const o = this.canvas?.getContext?.("2d"), a = this.canvas?.width || 0, n = this.canvas?.height || 0;
    if (!o || !a || !n) return { points: this.points.length, vectors: this.vectors.length };
    const s = { sourceWidth: e, sourceHeight: r, width: a, height: n };
    o.clearRect(0, 0, a, n), o.lineWidth = 1;
    for (const i of this.vectors) {
      const [c, l] = Y(i.from ?? i, s), [d, f] = Y(i.to ?? i, s);
      o.strokeStyle = M[i.state] || M.accepted, o.beginPath(), o.moveTo(c, l), o.lineTo(d, f), o.stroke();
    }
    for (const i of this.points) {
      const [c, l] = Y(i, s);
      o.fillStyle = M[i.state] || M.accepted, o.fillRect(c - 1.5, l - 1.5, 3, 3);
    }
    return (this.state === "weak" || this.state === "bad") && (o.strokeStyle = this.state === "bad" ? M.rejected : M.weak, o.lineWidth = 2, o.strokeRect(1, 1, a - 2, n - 2)), { points: this.points.length, vectors: this.vectors.length };
  }
  dispose() {
    this.clear(), this.canvas = null;
  }
}
function co(t, e, r) {
  const o = t.createElement("div");
  o.className = "oc-row";
  const a = t.createElement("span");
  a.textContent = e;
  const n = t.createElement("span");
  return n.textContent = r, o.append(a, n), o;
}
function lo(t, e, r = "Nothing to show") {
  if (!t) return 0;
  const o = t.ownerDocument;
  if (t.replaceChildren(), !e.length) {
    const a = o.createElement("div");
    return a.className = "oc-empty", a.textContent = r, t.append(a), 0;
  }
  for (const [a, n] of e) t.append(co(o, a, n));
  return e.length;
}
function uo(t, e, { onAction: r = () => {
}, onFrame: o = () => {
}, actions: a = {} } = {}) {
  if (!t) return 0;
  const n = t.ownerDocument;
  if (t.replaceChildren(), !e?.length) {
    const s = n.createElement("div");
    return s.className = "oc-empty", s.textContent = "No anomalies detected", t.append(s), 0;
  }
  for (const s of e) {
    const i = n.createElement("div");
    i.className = "oc-anomaly", i.dataset.level = String(s.level || "warn");
    const c = n.createElement("div");
    c.className = "oc-anomaly-text";
    const l = n.createElement("strong"), d = Number(s.start_frame ?? s.frame), f = Number(s.end_frame ?? s.frame);
    l.textContent = d === f ? `Frame ${d}` : `Frames ${d}-${f}`, l.tabIndex = 0, l.setAttribute("role", "button"), l.addEventListener("click", () => o(s.frame)), l.addEventListener("keydown", (p) => {
      (p.key === "Enter" || p.key === " ") && (p.preventDefault(), o(s.frame));
    });
    const u = n.createElement("small");
    u.textContent = `${String(s.level || "warn").toUpperCase()} · ${s.detail || s.kind || ""}`, c.append(l, u), i.append(c);
    const m = a[String(s.frame)] || s.suggested_action || "ignore";
    for (const p of ["interpolate", "ignore", "exclude"]) {
      const g = n.createElement("button");
      g.type = "button", g.textContent = p.toUpperCase(), g.dataset.action = p, g.dataset.frame = String(s.frame), p === m && g.setAttribute("aria-selected", "true"), g.addEventListener("click", () => r(s, p)), i.append(g);
    }
    t.append(i);
  }
  return e.length;
}
function po(t) {
  return (t || []).map((e, r) => [`Note ${r + 1}`, String(e)]);
}
function ho(t) {
  return import("./chunk-Biv4MROn.js").then(({ TrackViewer: e }) => (t.viewerLoad = null, t.disposed || t.viewer || (t.viewer = new e(t.$("track-canvas")), t.pushTracksToViewer()), t.viewer)).catch((e) => (t.viewerLoad = null, console.warn("OmniCam track viewer unavailable", e), null));
}
function me(t) {
  const e = t.$("frame");
  e && (e.value = String(t.state.frame));
  const r = t.$("time");
  r && (r.textContent = de(t.state.frame, t.sourceViewer.fps));
  const o = t.$("frame-readout");
  o && (o.textContent = `${t.state.frame} / ${Math.max(0, t.state.frameCount - 1)} · ${de(t.state.frame, t.sourceViewer.fps)}`);
  const a = Lr(t.state.quality, t.state.frame), n = Qr(t.state.quality, t.currentHealth, t.state.frame);
  lo(t.$("quality-details"), [...a, ...n, ...po(t.state.warnings)], "No solve yet");
}
function ge(t) {
  const e = t.$("extractor-ruler"), r = t.$("extractor-playhead"), o = Math.max(1, t.state.frameCount);
  if (!e || !r) return;
  const a = Math.min(12, o - 1 || 1);
  e.replaceChildren();
  for (let n = 0; n <= a; n += 1) {
    const s = Math.round(n / a * (o - 1)), i = `${n / a * 100}%`, c = e.ownerDocument.createElement("i");
    if (c.className = `oc-tick${n % 2 === 0 ? " major" : ""}`, c.style.left = i, e.append(c), n % 2 === 0) {
      const l = e.ownerDocument.createElement("span");
      l.className = "timeline-tick", l.style.left = i, l.textContent = String(s), e.append(l);
    }
  }
  r.style.left = `${Math.max(0, Math.min(o - 1, t.state.frame)) / Math.max(1, o - 1) * 100}%`;
}
function fo(t) {
  const e = new Oe(t);
  return t.attachWorkbench(e), t.node.__majoorOmniCamExtractor = e, t.pendingSourceResync && (t.pendingSourceResync = !1, e.refreshSource()), t.reconstructionResult && e.reconstruction?.acceptQueuedResult(t.reconstructionResult), e;
}
function mo(t) {
  t.dispose(), t.runtime.detachWorkbench(t), t.node.__majoorOmniCamExtractor === t && delete t.node.__majoorOmniCamExtractor;
}
function Co(t) {
  if (t.__majoorOmniCamExtractorRuntime) return t.__majoorOmniCamExtractorRuntime;
  const e = new Wt(t, { api: A, app: X });
  Vt(t);
  const r = fo(e);
  t.__majoorOmniCamExtractorRuntime = e;
  const o = () => Math.max(620, r.root.scrollHeight || 0);
  t.addDOMWidget("majoor_omnicam_extractor", "omnicam", r.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 620,
    getHeight: o,
    getMaxHeight: o
  });
  const a = () => {
    e.disposed || (e.checkSourceChanged(), r.refreshSource(), t.setDirtyCanvas?.(!0, !0));
  }, n = t.onConnectionsChange;
  t.onConnectionsChange = function(...l) {
    n?.apply(this, l), a(), setTimeout(a, 60), setTimeout(a, 400);
  };
  const s = ot(t, () => setTimeout(a, 0)), i = t.onAfterGraphConfigured;
  t.onAfterGraphConfigured = function(...l) {
    i?.apply(this, l), a(), r.reconstruction?.syncFromWidgets?.();
  };
  const c = t.onRemoved;
  return t.onRemoved = function(...l) {
    s(), mo(r), e.dispose(), c?.apply(this, l);
  }, e;
}
function go(t, e) {
  return t?.widgets?.find((r) => r.name === e) || null;
}
const bo = [
  "state",
  "extractMode",
  "queuePromptId",
  "result",
  "rawSolve",
  "landmarks",
  "sourceKey"
];
class Oe {
  // `runtime` is the persistent ExtractorRuntime this workbench renders.
  constructor(e) {
    this.runtime = e;
    const r = e.node;
    this.node = r, this.app = X, this.api = A, this.root = $r(), this.disposed = !1, this.events = new Be(), this.requests = new nt(), this.diagnostics = new gr(), this.upstreamPreviewActive = !1, this.motionLimits = null, this.refine = new fr({ onRefine: (s) => this.requestRefine(s) }), this.fallbackViewer = new Nr(this.$("fallback-preview"), { api: A }), this.sourceViewer = new kr(this.$("source-video"), {
      onFrame: (s) => this.coordinator.seek(s, "media"),
      onMetadata: ({ frameCount: s }) => this.adoptSourceLength(s),
      onError: (s) => this.dispatch({ type: "SOURCE", source: { playbackError: s } }),
      onMode: () => this.render(),
      fallbackViewer: this.fallbackViewer
    }), this.coordinator = new yr({
      media: this.sourceViewer,
      getViewer: () => this.viewer,
      showDiagnostics: (s) => this.showDiagnostics(s),
      dispatch: (s) => this.dispatch(s),
      setFollow: (s) => this.sourceViewer.setFollow(s),
      frameCount: this.state.frameCount,
      fps: this.sourceViewer.fps,
      loop: !0,
      onPlaybackState: () => this.transport?.render()
    }), this.timeline = new Zr(this.root, {
      onSeek: (s) => this.coordinator.seek(s, "timeline")
    }), this.transport = ao(this.root, {
      coordinator: this.coordinator,
      getState: () => this.state,
      getTrack: () => this.state.trackMode === "raw" ? this.result.raw : this.result.refined,
      on: (s, i, c) => this.events.on(s, i, c)
    }), this.overlay = new io(this.$("tracking-overlay")), this.viewer = null, this.viewerLoad = null, this.reconstruction = new ar({
      root: this.root,
      node: this.node,
      api: A,
      app: X,
      getSource: () => this.state.source?.ref || null,
      onAdopt: (s) => rt(this.node, s),
      // Scene Reconstruction Start / Stop run through the same partial queue as
      // Camera TRACK; the panel no longer owns a job manager.
      onQueue: () => this.startSolve("scene_reconstruct"),
      onCancel: () => this.cancelQueuedRun(),
      on: (s, i, c) => this.events.on(s, i, c)
    });
    const o = this.$("extract-mode-camera"), a = this.$("extract-mode-reconstruct");
    o && this.events.on(o, "click", () => this.setExtractMode("camera_track")), a && this.events.on(a, "click", () => this.setExtractMode("scene_reconstruct")), this.setExtractMode(this.extractMode);
    const n = this.$("clear-cache");
    n && this.events.on(n, "click", () => {
      n.disabled = !0, Promise.resolve().then(() => this.clearCache()).catch((s) => this.dispatch({ type: "FAILED", error: String(s?.message || s) })).finally(() => {
        n.disabled = !1;
      });
    }), this.bindControls(), this.loadMotionLimits(), this.refreshSource(), this.render();
  }
  // -- plumbing ----------------------------------------------------------
  $(e) {
    return this.root.querySelector(`[data-role="${e}"]`);
  }
  // Delegates to the runtime so a headless observer (the compact shell's
  // statechange listener) is notified the same way whether the mutation came
  // from an interactive control here or from a queue event while closed.
  // ExtractorRuntime.dispatch() calls this.render() back via workbench?.render().
  dispatch(e) {
    return this.runtime.dispatch(e);
  }
  async loadMotionLimits() {
    try {
      const e = await this.requests.run(async (r) => {
        const o = await A.fetchApi?.("/majoor/omnicam/motion_profiles", { signal: r });
        return o?.ok ? o.json() : void 0;
      });
      if (e === void 0) return;
      this.motionLimits = e?.profiles?.find((r) => r.id === "generic")?.limits || null, this.disposed || this.render();
    } catch {
    }
  }
  bindControls() {
    this.events.on(this.root, "wheel", Ge(this.root));
    for (const e of this.root.querySelectorAll("[data-tab]"))
      this.events.on(e, "click", () => this.setViewerMode(e.dataset.tab));
    for (const e of this.root.querySelectorAll("[data-track-mode]"))
      this.events.on(e, "click", () => this.setTrackMode(e.dataset.trackMode));
    for (const e of this.root.querySelectorAll("[data-view]"))
      this.events.on(e, "click", () => this.viewer?.setView(e.dataset.view));
    for (const e of this.root.querySelectorAll("[data-inspection-view]"))
      this.events.on(e, "click", () => {
        const r = this.viewer?.setInspectionView(e.dataset.inspectionView) || "scene";
        for (const o of this.root.querySelectorAll("[data-inspection-view]"))
          o.setAttribute("aria-selected", String(o.dataset.inspectionView === r));
        for (const o of this.root.querySelectorAll("[data-view], [data-act='fit']"))
          o.disabled = r === "camera";
      });
    this.events.on(this.root.querySelector('[data-act="track"]'), "click", () => this.startSolve()), this.events.on(this.root.querySelector('[data-act="stop"]'), "click", () => this.cancelQueuedRun()), this.events.on(this.root.querySelector('[data-act="fit"]'), "click", () => this.viewer?.fit()), this.events.on(this.root.querySelector('[data-act="apply"]'), "click", () => this.applyRefined()), this.events.on(this.root.querySelector('[data-act="reset-refine"]'), "click", () => this.resetRefine()), this.events.on(this.$("scrubber"), "input", (e) => this.coordinator.seek(Number(e.target.value), "input")), this.events.on(this.$("frame"), "change", (e) => this.coordinator.seek(Number(e.target.value), "input")), this.events.on(this.$("follow-solve"), "change", (e) => this.sourceViewer.setFollow(e.target.checked)), this.timeline.bind(
      (e, r, o) => this.events.on(e, r, o),
      () => this.state.frameCount
    ), this.bindRefineControls();
  }
  bindRefineControls() {
    const e = {
      "position-smoothing": "position_smoothing",
      "rotation-smoothing": "rotation_smoothing",
      "horizon-stabilization": "horizon_stabilization",
      "motion-scale": "motion_scale",
      "position-tolerance": "position_tolerance"
    };
    for (const [r, o] of Object.entries(e)) {
      const a = this.$(r);
      this.events.on(a, "input", () => {
        this.refine.update({ [o]: Number(a.value) }), this.renderRefineValues();
      });
    }
    for (const r of ["pitch", "yaw", "roll"]) {
      const o = this.$(`align-${r}`);
      this.events.on(o, "input", () => {
        this.refine.setAlignment({ [r]: Number(o.value) }), this.renderRefineValues();
      });
    }
    this.events.on(this.root.querySelector('[data-act="reset-alignment"]'), "click", () => {
      for (const r of ["pitch", "yaw", "roll"]) {
        const o = this.$(`align-${r}`);
        o && (o.value = "0");
      }
      this.refine.setAlignment({ pitch: 0, yaw: 0, roll: 0 }), this.renderRefineValues();
    }), this.events.on(this.root.querySelector('[data-act="estimate-up"]'), "click", () => this.estimateUp()), this.events.on(
      this.root.querySelector('[data-act="set-in"]'),
      "click",
      () => this.setTrim("trim-start", "trim_start_frame")
    ), this.events.on(
      this.root.querySelector('[data-act="set-out"]'),
      "click",
      () => this.setTrim("trim-end", "trim_end_frame")
    ), this.events.on(this.root.querySelector('[data-act="reset-trim"]'), "click", () => {
      for (const r of ["trim-start", "trim-end"]) {
        const o = this.$(r);
        o && (o.value = "0");
      }
      this.refine.update({ trim_start_frame: 0, trim_end_frame: 0 });
    });
    for (const [r, o] of [["trim-start", "trim_start_frame"], ["trim-end", "trim_end_frame"]]) {
      const a = this.$(r);
      this.events.on(a, "change", () => this.refine.update({ [o]: Math.max(0, Number(a.value) || 0) }));
    }
    for (const [r, o] of [["normalize-origin", "normalize_origin"], ["simplify-keys", "simplify_keys"]]) {
      const a = this.$(r);
      this.events.on(a, "change", () => this.refine.update({ [o]: !!a.checked }));
    }
  }
  // -- source ------------------------------------------------------------
  refreshSource() {
    const e = Ar(this);
    return this.reconstruction && e && this.reconstruction.setSource(e.ref || e), e;
  }
  /**
   * Ask the server what this footage is, before anything is solved.
   *
   * Without it the panel knows a filename and nothing else: no rate, no frame
   * count, so the scrubber has no range and the strip has nothing to say.
   */
  async describeSource(e) {
    return Me(this, e);
  }
  /** Give the transport a real range, from the footage rather than a solve. */
  adoptSourceLength(e) {
    return ee(this, e);
  }
  // -- solve control -----------------------------------------------------
  /**
   * Delete every cached reconstruction from disk and forget this node's own
   * cached results, in both modes: the camera-track scene/fingerprint/source
   * widgets (result-cache.js) and the reconstruction panel's job state.
   */
  async clearCache() {
    return kt(this);
  }
  /** TRACK / Reconstruct Start -> a partial ComfyUI execution. See queue/ui-bridge.js. */
  startSolve(e = "camera_track") {
    return lr(this, e);
  }
  /** STOP -> cancel this panel's ComfyUI job. Idempotent. */
  cancelQueuedRun() {
    return pr(this);
  }
  syncPanelToNodeWidgets() {
    return ur(this);
  }
  prepareForQueuedRun() {
    return dr(this);
  }
  /**
   * Adopt a solved track. Canonical state/cache handling lives on
   * ExtractorRuntime now (so it survives this workbench closing); the
   * runtime pushes the result into this workbench's 3D viewer itself when
   * one is attached (attachWorkbench/pushTracksToViewer), so this is a plain
   * delegation kept for existing call sites (e.g. clear-cache tests).
   */
  acceptSolvedResult(e) {
    return this.runtime.acceptSolvedResult(e);
  }
  /**
   * Re-derive the refined track from the raw solve when a cleanup slider moves.
   *
   * No queue, no re-solve: POST the raw solve + settings to the bounded refine
   * route and swap the result in. A no-op until a solve has produced a raw
   * solve this session (after a reload, press TRACK to refine again).
   */
  async requestRefine(e) {
    if (!this.rawSolve || this.state.solveState !== "COMPLETED") return null;
    try {
      const r = await Bt(this.api, this.rawSolve, e), o = r?.refined_track;
      if (!o?.keyframes?.length) return null;
      this.result = { ...this.result, refined: o };
      const a = String(r.fingerprint || "");
      return this.dispatch({ type: "REFINED", fingerprint: a }), this.pushTracksToViewer(), Z(this.node, { motionScene: J(o), fingerprint: a }), r;
    } catch (r) {
      return console.warn("[OmniCam] live refine failed", r), this.setStatus?.(String(r?.message || r)), null;
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
    const e = await this.refine.flush(), r = e?.resolved_alignment;
    if (!r) return null;
    const [o, a, n, s] = r.map(Number), i = (d) => Math.round(d * (180 / Math.PI) * 10) / 10, c = i(Math.atan2(2 * (s * o + a * n), 1 - 2 * (o * o + a * a))), l = i(Math.atan2(2 * (s * n + o * a), 1 - 2 * (a * a + n * n)));
    for (const [d, f] of [["pitch", c], ["yaw", 0], ["roll", l]]) {
      const u = this.$(`align-${d}`);
      u && (u.value = String(f));
    }
    return this.refine.alignment = { pitch: c, yaw: 0, roll: l }, this.renderRefineValues(), e;
  }
  resetRefine() {
    this.refine.reset();
    for (const [e, r] of [
      ["position-smoothing", 0.15],
      ["rotation-smoothing", 0.1],
      ["horizon-stabilization", 0],
      ["motion-scale", 1],
      ["position-tolerance", 0.01],
      ["align-pitch", 0],
      ["align-yaw", 0],
      ["align-roll", 0]
    ]) {
      const o = this.$(e);
      o && (o.value = String(r));
    }
    this.renderRefineValues();
  }
  setTrim(e, r) {
    const o = this.$(e);
    o && (o.value = String(this.state.frame)), this.refine.update({ [r]: this.state.frame });
  }
  applyRefined() {
    try {
      const { fingerprint: e } = xr(this.node, {
        track: this.result.refined,
        state: this.state.solveState
      });
      this.dispatch({ type: "APPLIED", fingerprint: e });
    } catch (e) {
      const r = e instanceof I ? e.message : String(e?.message || e);
      this.dispatch({ type: "FAILED", error: r });
    }
  }
  // -- viewer ------------------------------------------------------------
  ensureViewer() {
    return this.viewer || this.disposed ? Promise.resolve(this.viewer) : (this.viewerLoad ||= ho(this), this.viewerLoad);
  }
  pushTracksToViewer() {
    this.viewer && (this.viewer.setRawTrack(this.result.raw), this.viewer.setRefinedTrack(this.result.refined), this.viewer.setLandmarks(this.landmarks), this.viewer.setMode(this.state.trackMode), this.coordinator.seek(this.state.frame, "sync"));
  }
  async setViewerMode(e) {
    this.dispatch({ type: "VIEWER_MODE", mode: e }), e !== "source" && (await this.ensureViewer(), !this.disposed && (this.viewer?.resize(), this.viewer?.fit()));
  }
  setTrackMode(e) {
    this.dispatch({ type: "TRACK_MODE", mode: e }), this.viewer?.setMode(e);
  }
  showDiagnostics(e) {
    const r = this.diagnostics.get(e);
    r ? this.overlay.setDiagnostics(r) : this.overlay.clear();
  }
  // -- rendering ---------------------------------------------------------
  render() {
    const e = this.$("solve-status");
    e && (e.dataset.tone = bt(this.state.solveState), this.$("solve-status-text").textContent = vt(this.state));
    const r = this.$("source-strip");
    r && (r.dataset.available = String(!!this.state.source.available), this.$("source-label").textContent = jt(this.state.source));
    const o = gt(this.state);
    for (const [v, E] of Object.entries({
      track: o.track,
      stop: o.stop,
      apply: o.apply
    })) {
      const w = this.root.querySelector(`[data-act="${v}"]`);
      w && (w.disabled = !E);
    }
    this.$("solve-detail").textContent = yt(this.state), this.$("solve-percent").textContent = `${Math.round(this.state.progress * 100)}%`, this.$("progress-bar").style.width = `${Math.round(this.state.progress * 100)}%`;
    const a = this.$("solve-error");
    a.hidden = !this.state.error, a.textContent = this.state.error || "";
    const n = xt(this.state), s = this.$("applied-state");
    s.dataset.state = n, s.textContent = n;
    const i = this.root.querySelector('[data-step="source"]'), c = this.root.querySelector('[data-step="track"]'), l = this.root.querySelector('[data-step="solve"]'), d = this.root.querySelector('[data-step="refine"]'), f = this.root.querySelector('[data-step="output"]');
    if (i && c && l && d && f) {
      const v = !!this.state.source?.available;
      i.dataset.state = v ? "completed" : "active";
      const E = this.state.solveState === "TRACKING", w = this.state.solveState === "SOLVING", C = this.state.solveState === "FAILED", N = this.state.solveState === "COMPLETED";
      c.dataset.state = E ? "active" : N || w || this.rawSolve ? "completed" : C && !this.rawSolve ? "error" : "pending", l.dataset.state = w ? "active" : N ? "completed" : C && this.rawSolve ? "error" : "pending";
      const re = n === "APPLIED";
      d.dataset.state = re ? "completed" : N ? "active" : "pending", f.dataset.state = re ? "completed" : "pending";
    }
    for (const v of this.root.querySelectorAll("[data-tab]"))
      v.setAttribute("aria-selected", String(v.dataset.tab === this.state.viewerMode));
    for (const v of this.root.querySelectorAll("[data-track-mode]"))
      v.setAttribute("aria-selected", String(v.dataset.trackMode === this.state.trackMode));
    const u = this.state.viewerMode, m = u === "source", p = u === "track3d", g = this.$("stage");
    g && (g.dataset.mode = u), it(this, m), this.$("tracking-overlay").hidden = !0, this.$("track-canvas").hidden = !p, this.root.querySelector('[data-role="views"]').hidden = !p;
    const y = this.$("scrubber");
    y && (y.max = String(Math.max(0, this.state.frameCount - 1)));
    const k = this.$("frame");
    k && (k.max = String(Math.max(0, this.state.frameCount - 1)));
    const S = this.$("frame-total");
    S && (S.textContent = `/ ${Math.max(0, this.state.frameCount - 1)}`);
    const b = this.$("extractor-fps");
    b && (b.textContent = String(this.sourceViewer.fps || 24)), uo(this.$("anomalies"), this.state.anomalies, {
      actions: this.refine.settings.spike_actions,
      onFrame: (v) => this.coordinator.seek(v, "anomaly"),
      onAction: (v, E) => {
        const w = Number(v.start_frame ?? v.frame) || 0, C = Math.max(w, Number(v.end_frame ?? v.frame) || w);
        for (let N = w; N <= C; N += 1) this.refine.setSpikeAction(N, E);
        this.render();
      }
    }), this.renderTimeline(), this.transport.render(), me(this), ge(this);
    const x = this.$("stage-notice");
    if (x) {
      const v = this.state.source.playbackError || (this.upstreamPreviewActive ? "Preview only -- connect Load Video, or run the graph once, to track this source." : "");
      x.hidden = !v || !m, x.textContent = v;
    }
  }
  /**
   * The read-only solved camera channels, aligned to the source frame clock.
   */
  renderTimeline() {
    const e = this.state.trackMode === "raw" ? this.result.raw : this.result.refined;
    return this.currentHealth = Vr(e, this.motionLimits), this.timeline.render({
      track: e,
      health: this.currentHealth,
      quality: this.state.quality,
      anomalies: this.state.anomalies,
      frame: this.state.frame,
      frameCount: this.state.frameCount
    });
  }
  renderFrameReadouts() {
    return me(this);
  }
  /** Keep the read-only solve sheet on the exact same frame axis as playback. */
  renderExtractorRuler() {
    ge(this);
  }
  renderRefineValues() {
    for (const e of [
      "position-smoothing",
      "rotation-smoothing",
      "horizon-stabilization",
      "motion-scale",
      "position-tolerance",
      "align-pitch",
      "align-yaw",
      "align-roll"
    ]) {
      const r = this.$(e), o = this.$(`${e}-out`);
      r && o && (o.textContent = r.value);
    }
  }
  // -- lifecycle ---------------------------------------------------------
  // The runtime already restored the cache at construction; kept as a thin
  // delegation for any external caller (tests) still simulating an execution
  // through the workbench directly.
  executed(e) {
    return this.runtime.executed(e);
  }
  setExtractMode(e) {
    this.extractMode = e;
    const r = e === "scene_reconstruct", o = this.$("reconstruction-panel"), a = this.$("camera-track-body");
    o && o.toggleAttribute("hidden", !r), a && a.toggleAttribute("hidden", r);
    const n = this.$("extract-mode-camera");
    n && (n.setAttribute("aria-selected", r ? "false" : "true"), n.classList.toggle("active", !r));
    const s = this.$("extract-mode-reconstruct");
    if (s && (s.setAttribute("aria-selected", r ? "true" : "false"), s.classList.toggle("active", r)), r && this.reconstruction) {
      const c = this.state.source?.ref || this.state.source;
      c && this.reconstruction.setSource(c);
    }
    const i = go(this.node, "extract_mode");
    i && i.value !== e && (i.value = e, this.node.setDirtyCanvas?.(!0, !0));
  }
  // Visual/media disposal only. A queued solve outlives this workbench --
  // closing it must not cancel the job (migration plan Task 13); only true
  // node removal (ExtractorRuntime.dispose()) does that.
  dispose() {
    this.reconstruction?.dispose(), this.disposed = !0, He(), this.requests.dispose(), this.refine.dispose(), this.coordinator.dispose(), this.sourceViewer.dispose(), this.overlay.dispose(), this.diagnostics.dispose(), this.viewer?.dispose(), this.viewer = null, this.viewerLoad = null, this.events.dispose();
  }
}
for (const t of bo)
  Object.defineProperty(Oe.prototype, t, {
    configurable: !0,
    enumerable: !0,
    get() {
      return this.runtime[t];
    },
    set(e) {
      this.runtime[t] = e;
    }
  });
export {
  Oe as ExtractorUI,
  Co as attachExtractor,
  mo as closeExtractorWorkbench,
  fo as openExtractorWorkbench
};
