import { app as A } from "../../scripts/app.js";
import { api as D } from "../../scripts/api.js";
import { v as h } from "./chunk-D3iZD33H.js";
import { S as b, a as O, F as x, e as F, r as G, b as M, m as U, c as $, d as q, s as W, p as j } from "./chunk-sVL03mTG.js";
import { u as V, l as Q } from "./chunk-eq1tqQ9i.js";
import { c as K, w as z, a as v, W as B } from "./chunk-C7qk9Qm9.js";
const H = /* @__PURE__ */ new Set(["COMPLETED", "FAILED", "CANCELLED"]);
function Y(e) {
  return H.has(String(e || ""));
}
function Z(e, t) {
  return !t || Y(e) ? e : t;
}
const J = /* @__PURE__ */ new Set([
  "QUEUED",
  "PREPARING",
  "TRACKING",
  "SOLVING",
  "RECONSTRUCTING",
  "FINALIZING",
  "REFINING",
  "STOPPING",
  "CANCELLING"
]), X = /* @__PURE__ */ new Set(["COMPLETED", "FAILED", "CANCELLED", "STOPPED"]), E = (e, t) => e == null || Number.isNaN(Number(e)) ? t : Number(e), ee = {
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
function te() {
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
function S(e, t) {
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
      return { ...e, jobId: "", solveState: "COMPLETED", progress: 1 };
    case "QUEUE_LIFECYCLE": {
      const r = Z(e.solveState, t.state), n = X.has(e.solveState);
      return {
        ...e,
        solveState: r,
        progress: n || t.progress === void 0 ? e.progress : E(t.progress, e.progress),
        error: t.error ? String(t.error) : r === "FAILED" ? e.error : ""
      };
    }
    case "JOB_STARTED":
      return {
        ...e,
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
      return { ...e, solveState: t.state, error: t.state === "FAILED" ? e.error : "" };
    case "PROGRESS":
      return {
        ...e,
        solveState: t.progress.state || e.solveState,
        progress: Number(t.progress.progress) || 0,
        stageProgress: Number(t.progress.stage_progress) || 0,
        backend: t.progress.backend || e.backend
      };
    case "QUALITY":
      return { ...e, quality: [...e.quality, ...t.samples || []] };
    case "POSE":
      return { ...e, poseCount: e.poseCount + 1 };
    case "FRAME":
      return { ...e, frame: Math.max(0, Math.round(Number(t.frame) || 0)) };
    case "FRAME_COUNT":
      return { ...e, frameCount: Math.max(0, Math.round(Number(t.frameCount) || 0)) };
    case "STATUS": {
      const r = t.status || {};
      return {
        ...e,
        solveState: r.state || e.solveState,
        jobId: r.job_id || e.jobId,
        progress: E(r.progress, e.progress),
        backend: r.backend || e.backend,
        poseCount: E(r.pose_count, e.poseCount),
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
        backend: t.result?.backend || e.backend,
        // The live counter increments once per POSE event, and those are
        // throttled to at most one per THROTTLE_SECONDS -- every backend
        // hands its poses over in one tight loop once the solve itself is
        // done, so a fast solve (or a lot of frames) throttles most of them
        // away. completion_payload's own pose_count is the server's real
        // count of what it kept, not of what the socket let through.
        poseCount: E(t.result?.pose_count, e.poseCount)
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
function Re(e) {
  const t = e.solveState, r = J.has(t), n = t === "COMPLETED";
  return {
    track: !r && e.source.available,
    stop: r,
    // A partial solve is reviewable, never shippable.
    apply: n && !!e.refinedFingerprint,
    refine: n,
    retry: t === "STOPPED" || t === "FAILED" || t === "CANCELLED"
  };
}
function Ae(e) {
  return ee[e] || "neutral";
}
function De(e) {
  const t = Math.round(Math.max(0, Math.min(1, e.progress)) * 100);
  switch (e.solveState) {
    case "TRACKING":
    case "SOLVING":
    case "RECONSTRUCTING":
    case "FINALIZING":
      return `${e.solveState} ${t}%`;
    case "STOPPING":
    case "CANCELLING":
      return `${e.solveState}…`;
    default:
      return e.solveState;
  }
}
function Oe(e) {
  return e.frameCount ? `${e.frame} / ${e.frameCount} frames` : e.solveState === "IDLE" ? "Ready to track" : e.solveState;
}
function xe(e) {
  return e.applied.fingerprint ? e.applied.outdated ? "OUTDATED" : "APPLIED" : "NOT APPLIED";
}
function re(e, t) {
  const r = [], n = (o, c) => {
    const l = (p) => c(p?.detail ?? p ?? {});
    t?.addEventListener?.(o, l), r.push([o, l]);
  }, s = () => String(e.node?.id ?? ""), a = (o) => {
    const c = String(e.queuePromptId || "");
    return c !== "" && String(o ?? "") === c;
  }, i = (o, c = {}) => e.dispatch({ type: "QUEUE_LIFECYCLE", state: o, ...c }), u = () => {
    e.queuePromptId = "";
  };
  return n("execution_start", (o) => {
    a(o.prompt_id) && i("PREPARING");
  }), n("executing", (o) => {
    if (!a(o.prompt_id)) return;
    const c = o.node ?? o.display_node ?? null;
    c != null && String(c) === s() && i(e.extractMode === "scene_reconstruct" ? "RECONSTRUCTING" : "TRACKING");
  }), n("progress", (o) => {
    if (!a(o.prompt_id) || o.node != null && String(o.node) !== s()) return;
    const c = Number(o.max) || 0;
    c > 0 && i(null, { progress: (Number(o.value) || 0) / c });
  }), n("executed", (o) => {
    String(o.node ?? o.display_node ?? "") === s() && (!a(o.prompt_id) && e.queuePromptId || (u(), e.executed(o.output ?? o)));
  }), n("execution_error", (o) => {
    a(o.prompt_id) && (i("FAILED", {
      error: String(o.exception_message || o.error || "The queued solve failed")
    }), u());
  }), n("execution_interrupted", (o) => {
    a(o.prompt_id) && (i("CANCELLED"), u());
  }), n("execution_success", (o) => {
    a(o.prompt_id) && (i("FINALIZING"), u());
  }), () => {
    for (const [o, c] of r.splice(0))
      t?.removeEventListener?.(o, c);
  };
}
const ne = "1.49.1";
function oe(e = globalThis) {
  const t = e?.__COMFYUI_FRONTEND_VERSION__;
  return typeof t == "string" ? t : "";
}
function w(e) {
  const t = String(e ?? "").match(/^(\d+)\.(\d+)\.(\d+)/);
  return t ? t.slice(1, 4).map(Number) : null;
}
function se(e, t) {
  const r = w(e), n = w(t);
  if (!r || !n)
    throw new Error(`Unsupported ComfyUI frontend version: ${e || "(none)"}`);
  for (let s = 0; s < 3; s += 1)
    if (r[s] !== n[s]) return r[s] < n[s] ? -1 : 1;
  return 0;
}
async function ae(e, t, { frontendVersion: r = oe(), intent: n } = {}) {
  if (!Array.isArray(t) || t.length === 0)
    throw new Error("OmniCam partial execution requires at least one target");
  if (!r)
    throw new Error(
      "Cannot select a queuePrompt signature without a ComfyUI frontend version"
    );
  return se(r, ne) >= 0 ? e.queuePrompt(0, 1, { queueNodeIds: t, intent: n }) : e.queuePrompt(0, 1, t);
}
const ie = {
  camera_track: "omnicam_track",
  scene_reconstruct: "omnicam_reconstruct"
};
function ce(e) {
  const t = e?.id;
  return t == null || t === "" || k(e) ? null : String(t);
}
function k(e) {
  if (e == null) return !1;
  if (String(e.id ?? "").includes(":")) return !0;
  const t = e.graph;
  return t ? !!(t.isRootGraph === !1 || t._is_subgraph || t.is_subgraph || t._subgraph_node || t.rootGraph && t.rootGraph !== t) : !1;
}
async function ue(e, {
  timeoutMs: t = 4e3,
  intervalMs: r = 16,
  now: n = () => Date.now(),
  sleep: s = (a) => new Promise((i) => setTimeout(i, a))
} = {}) {
  if (!e || typeof e != "object" || !e.processingQueue) return !0;
  const a = n();
  for (; e.processingQueue; ) {
    if (n() - a >= t) return !1;
    await s(r);
  }
  return !0;
}
async function Fe(e, t = "camera_track", { idle: r } = {}) {
  if (!e.refreshSource()?.available) return { accepted: !1, reason: "no-source" };
  if (k(e.node))
    return { accepted: !1, reason: "subgraph-not-supported" };
  const s = ce(e.node);
  if (!s) return { accepted: !1, reason: "no-execution-id" };
  if (!await ue(e.app, r))
    return { accepted: !1, reason: "submission-busy" };
  e.setExtractMode(t), e.syncPanelToNodeWidgets?.(), e.prepareForQueuedRun?.();
  const { accepted: a, promptId: i } = await le(
    e.app,
    e.api,
    [s],
    { intent: { trigger_source: ie[t] || "omnicam_track" } }
  );
  return e.queuePromptId = a ? String(i || "") : "", { accepted: a, promptId: e.queuePromptId };
}
async function le(e, t, r, n) {
  const s = r.map(String).sort(), a = t.fetchApi;
  let i = "";
  t.fetchApi = async (u, o = {}) => {
    const c = await a.call(t, u, o);
    try {
      const l = String(u).split("?")[0];
      if (String(o.method || "GET").toUpperCase() === "POST" && (l === "/prompt" || l.endsWith("/prompt")) && c.ok && !i) {
        let f = {};
        try {
          f = JSON.parse(o.body || "{}");
        } catch {
          f = {};
        }
        const d = Array.isArray(f.partial_execution_targets) ? f.partial_execution_targets.map(String).sort() : null;
        if (d && d.length === s.length && d.every((g, R) => g === s[R])) {
          const g = await c.clone().json().catch(() => ({}));
          typeof g?.prompt_id == "string" && (i = g.prompt_id);
        }
      }
    } catch {
    }
    return c;
  };
  try {
    return { accepted: !!await ae(e, r, n), promptId: i };
  } finally {
    t.fetchApi = a;
  }
}
async function I(e, t) {
  if (!t) return !1;
  const r = await e.fetchApi(
    `/api/jobs/${encodeURIComponent(t)}/cancel`,
    { method: "POST" }
  );
  if (!r.ok)
    throw new Error(`Comfy job cancellation failed (${r.status})`);
  return !!(await r.json().catch(() => ({})))?.cancelled;
}
const de = {
  LoadVideo: ["file", "video"],
  VHS_LoadVideo: ["video"],
  VHS_LoadVideoPath: ["video"],
  LoadVideoFFmpeg: ["file", "video"]
}, pe = {
  LoadImage: ["image"]
}, fe = /\.(mp4|mov|webm|mkv|m4v|avi)(\s|$)/i, he = /\.(png|jpe?g|webp)(\s|$)/i;
function me(e) {
  return {
    available: !1,
    ref: null,
    label: "",
    reason: e ? "Scene Reconstruct requires a file-backed still image. Connect Load Image or choose an Extractor source file. This source exists only during workflow execution." : "Interactive Track requires a file-backed video source. Connect Load Video or choose an Extractor source file. This source exists only during workflow execution."
  };
}
function _(e) {
  return String(e?.comfyClass || e?.type || e?.constructor?.type || "");
}
function ge(e, t) {
  for (const r of t) {
    const n = e?.widgets?.find((s) => String(s.name).toLowerCase() === r);
    if (n && n.value) return String(n.value);
  }
  return "";
}
function Ee(e, t) {
  const r = (e?.inputs || []).find((n) => String(n?.name).toLowerCase() === "video");
  return !r || r.link == null || !t ? null : Q(t, r.link);
}
function N(e) {
  const t = String(
    e?.widgets?.find((n) => n.name === "omnicam_extractor_source")?.value || ""
  );
  return t ? { kind: /\s\[(input|output|temp)\]$/.test(t) ? "annotated_input" : "managed", value: t } : null;
}
function Se(e, t = e?.graph, r = "camera_track") {
  const n = r === "scene_reconstruct", s = n ? pe : de, a = n ? he : fe, i = n ? "Load Image" : "Load Video", u = n ? "an image" : "a video", o = n ? "reconstruct" : "track", c = me(n), l = Ee(e, t);
  if (l) {
    const f = s[_(l)];
    if (!f) {
      const m = N(e);
      return m ? {
        available: !0,
        reason: "",
        label: m.value.replace(/\s\[(input|output|temp)\]$/, "").split("/").pop(),
        ref: m,
        originNodeId: l.id ?? null,
        runtimeMaterialized: !0
      } : {
        ...c,
        reason: `${_(l) || "This node"} produces its footage only while the workflow runs. Connect ${i}, or choose an Extractor source file, to ${o} without running.`,
        // Cannot be solved without a real file, but the origin may already
        // have rendered something (a previous run, an upload thumbnail) --
        // showing it at least confirms what is actually connected.
        previewMedia: V(l)
      };
    }
    const d = ge(l, f);
    return d ? a.test(d) ? {
      available: !0,
      reason: "",
      label: d,
      ref: { kind: "annotated_input", value: d },
      originNodeId: l.id ?? null
    } : { ...c, reason: `${d} does not look like ${u} file.` } : { ...c, reason: `The connected ${i} node has no file selected yet.` };
  }
  const p = N(e);
  return p ? {
    available: !0,
    reason: "",
    label: p.value.split("/").pop(),
    ref: p,
    originNodeId: null
  } : { ...c, reason: `Connect ${i}, or choose a source file, to ${o}.` };
}
function Ge(e) {
  if (!e?.available) return e?.reason || "No source";
  const t = e.info;
  if (!t) return e.label;
  const r = [e.label];
  return t.width && t.height && r.push(`${t.width}x${t.height}`), t.fps && r.push(`${Number(t.fps).toFixed(2).replace(/\.?0+$/, "")}fps`), t.frame_count && r.push(`${t.frame_count} frames`), r.join(" · ");
}
const Ie = [O, x, b];
function P(e, t) {
  return e?.widgets?.find((r) => r.name === t) || null;
}
function C(e) {
  for (const t of Ie) {
    const r = P(e, t);
    r && (r.computeSize = () => [0, -4], r.draw = () => {
    }, r.hidden = !0, r.type = "hidden", r.options = { ...r.options || {}, hideInVueNodes: !0, serialize: !0 });
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Ce(e) {
  C(e), globalThis.requestAnimationFrame?.(() => C(e)), setTimeout(() => C(e), 250);
}
function be(e) {
  if (P(e, b)) return;
  const t = e.addWidget?.("text", b, "", () => {
  }, { serialize: !0 });
  t && (t.computeSize = () => [0, -4], t.draw = () => {
  }, t.hidden = !0);
}
function L(e, t) {
  return e?.widgets?.find((r) => r.name === t) || null;
}
class ve extends EventTarget {
  constructor(t, { api: r, app: n } = {}) {
    super(), this.node = t, this.api = r, this.app = n, this.disposed = !1, this.workbench = null, this.shell = null, F(t), be(t), G(t), this.extractMode = String(L(t, "extract_mode")?.value || "camera_track"), this.state = te(), this.result = { raw: null, refined: null }, this.rawSolve = null, this.landmarks = [], this.sourceKey = "", this.queuePromptId = "", this.pendingSourceResync = !1, this.reconstructionResult = null;
    const s = M(t);
    s && (this.result = { raw: s.track, refined: s.track }, this.state = S(this.state, { type: "APPLIED", fingerprint: s.fingerprint }), this.state = S(this.state, { type: "REFINED", fingerprint: s.fingerprint })), this.unbindQueueEvents = re(this, r);
  }
  dispatch(t) {
    return this.state = S(this.state, t), this.disposed || (this.dispatchEvent(new CustomEvent("statechange", { detail: { action: t } })), this.workbench?.render()), this.state;
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
      error: this.state.error || ""
    };
  }
  setExtractMode(t) {
    this.extractMode = t;
    const r = L(this.node, "extract_mode");
    r && r.value !== t && (r.value = t, this.node.setDirtyCanvas?.(!0, !0));
  }
  /**
   * Adopt a solved camera-track result headlessly: state + persistent cache.
   * The workbench's own pushTracksToViewer() (3D viewer, coordinator seek) is
   * separate and only runs when it is attached.
   */
  acceptSolvedResult(t) {
    const r = t?.raw_track || t?.raw || t?.track || null, n = t?.refined_track || t?.refined || t?.track || r;
    if (!n?.keyframes?.length) return !1;
    const s = String(
      t?.fingerprint || n?.metadata?.extractor_fingerprint || ""
    );
    this.result = { raw: r || n, refined: n }, this.landmarks = Array.isArray(t?.landmarks_3d) ? t.landmarks_3d : [], this.rawSolve = t?.rawSolve || null, this.dispatch({ type: "QUEUED_RESULT" }), this.dispatch({
      type: "STATUS",
      status: {
        anomalies: t?.anomalies || [],
        state: "COMPLETED",
        backend: n?.metadata?.backend
      }
    }), this.dispatch({ type: "REFINED", fingerprint: s });
    const a = Number(t?.confidence ?? n?.metadata?.confidence) || 0, i = t?.motionScene || U(n);
    return $(this.node, { motionScene: i, fingerprint: s }), t?.source && q(this.node, t.source), this.node.__majoorOmniCamStatus = W({ track: n, confidence: a }), this.dispatch({ type: "APPLIED", fingerprint: s }), this.workbench?.pushTracksToViewer?.(), t?.source && (this.workbench ? this.workbench.refreshSource() : this.pendingSourceResync = !0), !0;
  }
  /** Adopt an `onExecuted` envelope, whichever mode it came from. */
  executed(t) {
    const r = j(t);
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
  acceptReconstructionResult(t) {
    this.reconstructionResult = t, this.dispatch({
      type: "STATUS",
      status: { state: "COMPLETED", anomalies: t?.reconstruction?.warnings || [] }
    }), this.workbench?.reconstruction?.acceptQueuedResult(t);
  }
  /**
   * STOP: cancel the actual ComfyUI job for this node's queued run.
   * Idempotent, and safe to call whether or not a workbench is attached.
   */
  async cancelQueuedRun() {
    const t = String(this.queuePromptId || "");
    if (t) {
      this.dispatch({ type: "QUEUE_LIFECYCLE", state: "CANCELLING" });
      try {
        await I(this.api, t);
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
    const t = this.extractMode || "camera_track", r = Se(this.node, this.node.graph, t), n = r.ref ? `${r.ref.kind}:${r.ref.value}` : "", s = n !== (this.sourceKey || "");
    return s && (this.sourceKey = n, this.queuePromptId && I(this.api, this.queuePromptId).catch(() => {
    }), this.pendingSourceResync = !0), s;
  }
  attachWorkbench(t) {
    this.workbench = t, this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: !0 } }));
  }
  detachWorkbench(t) {
    this.workbench === t && (this.workbench = null, this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: !1 } })));
  }
  /** Node removal only: a queued solve outlives a closed workbench, but not a deleted node. */
  dispose() {
    this.disposed || (this.disposed = !0, this.queuePromptId && I(this.api, this.queuePromptId).catch(() => {
    }), this.unbindQueueEvents?.(), this.workbench = null);
  }
}
function y(e) {
  const t = e.getSnapshot();
  e.shell?.setTitle(h("OmniCam Extractor")), e.shell?.setMeta(t.sourceLabel || h("No source connected"));
  const r = t.solveState || "IDLE";
  e.shell?.setStatus(t.error || `${r}${t.anomalyCount ? ` · ${t.anomalyCount} ${h("anomalies")}` : ""}`);
  const n = !["IDLE", "COMPLETED", "FAILED", "CANCELLED", "STOPPED"].includes(r);
  e.shell?.setProgress(n ? t.progress : null);
}
function T(e) {
  return `extractor:${e.id}`;
}
async function we(e, t) {
  return v.open({
    key: T(e.node),
    opener: t,
    createSession: async () => {
      const r = ++e.workbenchGeneration, { openExtractorWorkbench: n, closeExtractorWorkbench: s } = await import("./chunk-n83TeHJH.js");
      if (e.disposed || r !== e.workbenchGeneration) return null;
      const a = n(e), i = T(e.node), u = new B({
        kind: "extractor",
        nodeId: e.node.id,
        title: h("OmniCam Extractor"),
        // Closing never cancels the solve, so there is no reason to refuse
        // (unlike Director's future realtime-capture guard).
        onRequestClose: (o) => v.close(i, o),
        onResize: () => a.viewer?.resize?.()
      });
      return u.mount(a.root), {
        key: i,
        nodeId: e.node.id,
        host: u,
        close: async () => (s(a), u.dispose(), !0),
        dispose: () => {
          s(a), u.dispose();
        }
      };
    }
  });
}
function _e(e) {
  if (e.__majoorOmniCamExtractorRuntime) return e.__majoorOmniCamExtractorRuntime;
  const t = new ve(e, { api: D, app: A });
  t.workbenchGeneration = 0, Ce(e);
  const r = K({
    kind: "extractor",
    title: h("OmniCam Extractor"),
    buttonLabel: h("OPEN EXTRACTOR"),
    onOpen: (o) => {
      we(t, o.currentTarget);
    }
  });
  t.shell = r, y(t), t.addEventListener("statechange", () => y(t)), e.__majoorOmniCamExtractorRuntime = t, e.addDOMWidget("majoor_omnicam_extractor_shell", "omnicam", r.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 124,
    getHeight: () => 124,
    getMaxHeight: () => 124
  });
  const n = () => {
    t.disposed || (t.checkSourceChanged(), t.workbench && (t.workbench.refreshSource(), e.setDirtyCanvas?.(!0, !0)));
  }, s = e.onConnectionsChange;
  e.onConnectionsChange = function(...o) {
    s?.apply(this, o), n(), setTimeout(n, 60), setTimeout(n, 400);
  };
  const a = z(e, () => setTimeout(n, 0)), i = e.onAfterGraphConfigured;
  e.onAfterGraphConfigured = function(...o) {
    i?.apply(this, o), n(), t.workbench?.reconstruction?.syncFromWidgets?.();
  };
  const u = e.onRemoved;
  return e.onRemoved = function(...o) {
    v.disposeForNode(e.id), a(), t.dispose(), u?.apply(this, o);
  }, t;
}
const Me = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachExtractorShell: _e
}, Symbol.toStringTag, { value: "Module" }));
export {
  I as a,
  De as b,
  te as c,
  Ge as d,
  Re as e,
  xe as f,
  Me as g,
  Oe as p,
  Fe as q,
  Se as r,
  Ae as s
};
