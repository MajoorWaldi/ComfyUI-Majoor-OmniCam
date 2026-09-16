import { app as R } from "../../scripts/app.js";
import { api as D } from "../../scripts/api.js";
import { u as h } from "./chunk-C3_sdQC-.js";
import { S as b, a as O, F as x, e as F, r as G, b as M, m as U, c as $, d as q, s as W, p as j } from "./chunk-sVL03mTG.js";
import { u as V, l as Q } from "./chunk-eq1tqQ9i.js";
import { c as K, w as z, a as v, W as B } from "./chunk-B8M65iay.js";
const H = /* @__PURE__ */ new Set(["COMPLETED", "FAILED", "CANCELLED"]);
function Y(e) {
  return H.has(String(e || ""));
}
function Z(e, r) {
  return !r || Y(e) ? e : r;
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
]), X = /* @__PURE__ */ new Set(["COMPLETED", "FAILED", "CANCELLED", "STOPPED"]), E = (e, r) => e == null || Number.isNaN(Number(e)) ? r : Number(e), ee = {
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
function re() {
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
function S(e, r) {
  switch (r.type) {
    case "SOURCE":
      return { ...e, source: { ...e.source, ...r.source } };
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
        source: { ...e.source, ...r.source, info: null }
      };
    case "QUEUED_RESULT":
      return { ...e, jobId: "", solveState: "COMPLETED", progress: 1 };
    case "QUEUE_LIFECYCLE": {
      const t = Z(e.solveState, r.state), n = X.has(e.solveState);
      return {
        ...e,
        solveState: t,
        progress: n || r.progress === void 0 ? e.progress : E(r.progress, e.progress),
        error: r.error ? String(r.error) : t === "FAILED" ? e.error : ""
      };
    }
    case "JOB_STARTED":
      return {
        ...e,
        jobId: r.status.job_id,
        solveState: r.status.state,
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
      return { ...e, solveState: r.state, error: r.state === "FAILED" ? e.error : "" };
    case "PROGRESS":
      return {
        ...e,
        solveState: r.progress.state || e.solveState,
        progress: Number(r.progress.progress) || 0,
        stageProgress: Number(r.progress.stage_progress) || 0,
        backend: r.progress.backend || e.backend
      };
    case "QUALITY":
      return { ...e, quality: [...e.quality, ...r.samples || []] };
    case "POSE":
      return { ...e, poseCount: e.poseCount + 1 };
    case "FRAME":
      return { ...e, frame: Math.max(0, Math.round(Number(r.frame) || 0)) };
    case "FRAME_COUNT":
      return { ...e, frameCount: Math.max(0, Math.round(Number(r.frameCount) || 0)) };
    case "STATUS": {
      const t = r.status || {};
      return {
        ...e,
        solveState: t.state || e.solveState,
        jobId: t.job_id || e.jobId,
        progress: E(t.progress, e.progress),
        backend: t.backend || e.backend,
        poseCount: E(t.pose_count, e.poseCount),
        warnings: Array.isArray(t.warnings) ? t.warnings : e.warnings,
        anomalies: Array.isArray(t.anomalies) ? t.anomalies : e.anomalies,
        error: t.error === void 0 ? e.error : String(t.error || "")
      };
    }
    case "COMPLETED":
      return {
        ...e,
        solveState: "COMPLETED",
        progress: 1,
        refinedFingerprint: String(r.result?.fingerprint || ""),
        backend: r.result?.backend || e.backend,
        // The live counter increments once per POSE event, and those are
        // throttled to at most one per THROTTLE_SECONDS -- every backend
        // hands its poses over in one tight loop once the solve itself is
        // done, so a fast solve (or a lot of frames) throttles most of them
        // away. completion_payload's own pose_count is the server's real
        // count of what it kept, not of what the socket let through.
        poseCount: E(r.result?.pose_count, e.poseCount)
      };
    case "FAILED":
      return { ...e, solveState: "FAILED", error: String(r.error || "The solve failed") };
    case "REFINED":
      return {
        ...e,
        refinedFingerprint: String(r.fingerprint || ""),
        // Changing the cleanup after applying does not push anything to the
        // Director; it marks the applied result stale until Apply is pressed.
        applied: e.applied.fingerprint ? { ...e.applied, outdated: e.applied.fingerprint !== r.fingerprint } : e.applied
      };
    case "APPLIED":
      return { ...e, applied: { fingerprint: String(r.fingerprint || ""), outdated: !1 } };
    case "VIEWER_MODE":
      return { ...e, viewerMode: r.mode };
    case "TRACK_MODE":
      return { ...e, trackMode: r.mode };
    default:
      return e;
  }
}
function Ae(e) {
  const r = e.solveState, t = J.has(r), n = r === "COMPLETED";
  return {
    track: !t && e.source.available,
    stop: t,
    // A partial solve is reviewable, never shippable.
    apply: n && !!e.refinedFingerprint,
    refine: n,
    retry: r === "STOPPED" || r === "FAILED" || r === "CANCELLED"
  };
}
function Re(e) {
  return ee[e] || "neutral";
}
function De(e) {
  const r = Math.round(Math.max(0, Math.min(1, e.progress)) * 100);
  switch (e.solveState) {
    case "TRACKING":
    case "SOLVING":
    case "RECONSTRUCTING":
    case "FINALIZING":
      return `${e.solveState} ${r}%`;
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
function te(e, r) {
  const t = [], n = (o, c) => {
    const l = (p) => c(p?.detail ?? p ?? {});
    r?.addEventListener?.(o, l), t.push([o, l]);
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
    for (const [o, c] of t.splice(0))
      r?.removeEventListener?.(o, c);
  };
}
const ne = "1.49.1";
function oe(e = globalThis) {
  const r = e?.__COMFYUI_FRONTEND_VERSION__;
  return typeof r == "string" ? r : "";
}
function w(e) {
  const r = String(e ?? "").match(/^(\d+)\.(\d+)\.(\d+)/);
  return r ? r.slice(1, 4).map(Number) : null;
}
function se(e, r) {
  const t = w(e), n = w(r);
  if (!t || !n)
    throw new Error(`Unsupported ComfyUI frontend version: ${e || "(none)"}`);
  for (let s = 0; s < 3; s += 1)
    if (t[s] !== n[s]) return t[s] < n[s] ? -1 : 1;
  return 0;
}
async function ae(e, r, { frontendVersion: t = oe(), intent: n } = {}) {
  if (!Array.isArray(r) || r.length === 0)
    throw new Error("OmniCam partial execution requires at least one target");
  if (!t)
    throw new Error(
      "Cannot select a queuePrompt signature without a ComfyUI frontend version"
    );
  return se(t, ne) >= 0 ? e.queuePrompt(0, 1, { queueNodeIds: r, intent: n }) : e.queuePrompt(0, 1, r);
}
const ie = {
  camera_track: "omnicam_track",
  scene_reconstruct: "omnicam_reconstruct"
};
function ce(e) {
  const r = e?.id;
  return r == null || r === "" || k(e) ? null : String(r);
}
function k(e) {
  if (e == null) return !1;
  if (String(e.id ?? "").includes(":")) return !0;
  const r = e.graph;
  return r ? !!(r.isRootGraph === !1 || r._is_subgraph || r.is_subgraph || r._subgraph_node || r.rootGraph && r.rootGraph !== r) : !1;
}
async function ue(e, {
  timeoutMs: r = 4e3,
  intervalMs: t = 16,
  now: n = () => Date.now(),
  sleep: s = (a) => new Promise((i) => setTimeout(i, a))
} = {}) {
  if (!e || typeof e != "object" || !e.processingQueue) return !0;
  const a = n();
  for (; e.processingQueue; ) {
    if (n() - a >= r) return !1;
    await s(t);
  }
  return !0;
}
async function Fe(e, r = "camera_track", { idle: t } = {}) {
  if (!e.refreshSource()?.available) return { accepted: !1, reason: "no-source" };
  if (k(e.node))
    return { accepted: !1, reason: "subgraph-not-supported" };
  const s = ce(e.node);
  if (!s) return { accepted: !1, reason: "no-execution-id" };
  if (!await ue(e.app, t))
    return { accepted: !1, reason: "submission-busy" };
  e.setExtractMode(r), e.syncPanelToNodeWidgets?.(), e.prepareForQueuedRun?.();
  const { accepted: a, promptId: i } = await le(
    e.app,
    e.api,
    [s],
    { intent: { trigger_source: ie[r] || "omnicam_track" } }
  );
  return e.queuePromptId = a ? String(i || "") : "", { accepted: a, promptId: e.queuePromptId };
}
async function le(e, r, t, n) {
  const s = t.map(String).sort(), a = r.fetchApi;
  let i = "";
  r.fetchApi = async (u, o = {}) => {
    const c = await a.call(r, u, o);
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
        if (d && d.length === s.length && d.every((g, A) => g === s[A])) {
          const g = await c.clone().json().catch(() => ({}));
          typeof g?.prompt_id == "string" && (i = g.prompt_id);
        }
      }
    } catch {
    }
    return c;
  };
  try {
    return { accepted: !!await ae(e, t, n), promptId: i };
  } finally {
    r.fetchApi = a;
  }
}
async function I(e, r) {
  if (!r) return !1;
  const t = await e.fetchApi(
    `/api/jobs/${encodeURIComponent(r)}/cancel`,
    { method: "POST" }
  );
  if (!t.ok)
    throw new Error(`Comfy job cancellation failed (${t.status})`);
  return !!(await t.json().catch(() => ({})))?.cancelled;
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
function ge(e, r) {
  for (const t of r) {
    const n = e?.widgets?.find((s) => String(s.name).toLowerCase() === t);
    if (n && n.value) return String(n.value);
  }
  return "";
}
function Ee(e, r) {
  const t = (e?.inputs || []).find((n) => String(n?.name).toLowerCase() === "video");
  return !t || t.link == null || !r ? null : Q(r, t.link);
}
function N(e) {
  const r = String(
    e?.widgets?.find((n) => n.name === "omnicam_extractor_source")?.value || ""
  );
  return r ? { kind: /\s\[(input|output|temp)\]$/.test(r) ? "annotated_input" : "managed", value: r } : null;
}
function Se(e, r = e?.graph, t = "camera_track") {
  const n = t === "scene_reconstruct", s = n ? pe : de, a = n ? he : fe, i = n ? "Load Image" : "Load Video", u = n ? "an image" : "a video", o = n ? "reconstruct" : "track", c = me(n), l = Ee(e, r);
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
  const r = e.info;
  if (!r) return e.label;
  const t = [e.label];
  return r.width && r.height && t.push(`${r.width}x${r.height}`), r.fps && t.push(`${Number(r.fps).toFixed(2).replace(/\.?0+$/, "")}fps`), r.frame_count && t.push(`${r.frame_count} frames`), t.join(" · ");
}
const Ie = [O, x, b];
function P(e, r) {
  return e?.widgets?.find((t) => t.name === r) || null;
}
function C(e) {
  for (const r of Ie) {
    const t = P(e, r);
    t && (t.computeSize = () => [0, -4], t.draw = () => {
    }, t.hidden = !0, t.type = "hidden", t.options = { ...t.options || {}, hideInVueNodes: !0, serialize: !0 });
  }
  e.setDirtyCanvas?.(!0, !0);
}
function Ce(e) {
  C(e), globalThis.requestAnimationFrame?.(() => C(e)), setTimeout(() => C(e), 250);
}
function be(e) {
  if (P(e, b)) return;
  const r = e.addWidget?.("text", b, "", () => {
  }, { serialize: !0 });
  r && (r.computeSize = () => [0, -4], r.draw = () => {
  }, r.hidden = !0);
}
function L(e, r) {
  return e?.widgets?.find((t) => t.name === r) || null;
}
class ve extends EventTarget {
  constructor(r, { api: t, app: n } = {}) {
    super(), this.node = r, this.api = t, this.app = n, this.disposed = !1, this.workbench = null, this.shell = null, F(r), be(r), G(r), this.extractMode = String(L(r, "extract_mode")?.value || "camera_track"), this.state = re(), this.result = { raw: null, refined: null }, this.rawSolve = null, this.landmarks = [], this.sourceKey = "", this.queuePromptId = "", this.pendingSourceResync = !1;
    const s = M(r);
    s && (this.result = { raw: s.track, refined: s.track }, this.state = S(this.state, { type: "APPLIED", fingerprint: s.fingerprint }), this.state = S(this.state, { type: "REFINED", fingerprint: s.fingerprint })), this.unbindQueueEvents = te(this, t);
  }
  dispatch(r) {
    return this.state = S(this.state, r), this.disposed || (this.dispatchEvent(new CustomEvent("statechange", { detail: { action: r } })), this.workbench?.render()), this.state;
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
  setExtractMode(r) {
    this.extractMode = r;
    const t = L(this.node, "extract_mode");
    t && t.value !== r && (t.value = r, this.node.setDirtyCanvas?.(!0, !0));
  }
  /**
   * Adopt a solved camera-track result headlessly: state + persistent cache.
   * The workbench's own pushTracksToViewer() (3D viewer, coordinator seek) is
   * separate and only runs when it is attached.
   */
  acceptSolvedResult(r) {
    const t = r?.raw_track || r?.raw || r?.track || null, n = r?.refined_track || r?.refined || r?.track || t;
    if (!n?.keyframes?.length) return !1;
    const s = String(
      r?.fingerprint || n?.metadata?.extractor_fingerprint || ""
    );
    this.result = { raw: t || n, refined: n }, this.landmarks = Array.isArray(r?.landmarks_3d) ? r.landmarks_3d : [], this.rawSolve = r?.rawSolve || null, this.dispatch({ type: "QUEUED_RESULT" }), this.dispatch({
      type: "STATUS",
      status: {
        anomalies: r?.anomalies || [],
        state: "COMPLETED",
        backend: n?.metadata?.backend
      }
    }), this.dispatch({ type: "REFINED", fingerprint: s });
    const a = Number(r?.confidence ?? n?.metadata?.confidence) || 0, i = r?.motionScene || U(n);
    return $(this.node, { motionScene: i, fingerprint: s }), r?.source && q(this.node, r.source), this.node.__majoorOmniCamStatus = W({ track: n, confidence: a }), this.dispatch({ type: "APPLIED", fingerprint: s }), this.workbench?.pushTracksToViewer?.(), r?.source && (this.workbench ? this.workbench.refreshSource() : this.pendingSourceResync = !0), !0;
  }
  /**
   * Adopt an `onExecuted` envelope. Camera-track results are fully headless
   * (see acceptSolvedResult); a Scene Reconstruct result's visual/job-state
   * bookkeeping currently still lives on ReconstructionPanelController, so it
   * is only processed while the workbench is open -- a closed Extractor
   * running Scene Reconstruct will show the finished result on next open via
   * ComfyUI's own execution history, not live.
   */
  executed(r) {
    const t = j(r);
    if (t) {
      if (t.mode === "scene_reconstruct") {
        this.workbench?.reconstruction?.acceptQueuedResult(t);
        return;
      }
      this.acceptSolvedResult(t);
    }
  }
  /**
   * STOP: cancel the actual ComfyUI job for this node's queued run.
   * Idempotent, and safe to call whether or not a workbench is attached.
   */
  async cancelQueuedRun() {
    const r = String(this.queuePromptId || "");
    if (r) {
      this.dispatch({ type: "QUEUE_LIFECYCLE", state: "CANCELLING" });
      try {
        await I(this.api, r);
      } catch (t) {
        this.dispatch({ type: "QUEUE_LIFECYCLE", state: "FAILED", error: String(t?.message || t) });
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
    const r = this.extractMode || "camera_track", t = Se(this.node, this.node.graph, r), n = t.ref ? `${t.ref.kind}:${t.ref.value}` : "", s = n !== (this.sourceKey || "");
    return s && (this.sourceKey = n, this.queuePromptId && I(this.api, this.queuePromptId).catch(() => {
    }), this.pendingSourceResync = !0), s;
  }
  attachWorkbench(r) {
    this.workbench = r, this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: !0 } }));
  }
  detachWorkbench(r) {
    this.workbench === r && (this.workbench = null, this.dispatchEvent(new CustomEvent("workbenchchange", { detail: { attached: !1 } })));
  }
  /** Node removal only: a queued solve outlives a closed workbench, but not a deleted node. */
  dispose() {
    this.disposed || (this.disposed = !0, this.queuePromptId && I(this.api, this.queuePromptId).catch(() => {
    }), this.unbindQueueEvents?.(), this.workbench = null);
  }
}
function y(e) {
  const r = e.getSnapshot();
  e.shell?.setTitle(h("OmniCam Extractor")), e.shell?.setMeta(r.sourceLabel || h("No source connected"));
  const t = r.solveState || "IDLE";
  e.shell?.setStatus(r.error || `${t}${r.anomalyCount ? ` · ${r.anomalyCount} ${h("anomalies")}` : ""}`);
  const n = !["IDLE", "COMPLETED", "FAILED", "CANCELLED", "STOPPED"].includes(t);
  e.shell?.setProgress(n ? r.progress : null);
}
function T(e) {
  return `extractor:${e.id}`;
}
async function we(e, r) {
  return v.open({
    key: T(e.node),
    opener: r,
    createSession: async () => {
      const t = ++e.workbenchGeneration, { openExtractorWorkbench: n, closeExtractorWorkbench: s } = await import("./chunk-CMQwe18E.js");
      if (e.disposed || t !== e.workbenchGeneration) return null;
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
  const r = new ve(e, { api: D, app: R });
  r.workbenchGeneration = 0, Ce(e);
  const t = K({
    kind: "extractor",
    title: h("OmniCam Extractor"),
    buttonLabel: h("OPEN EXTRACTOR"),
    onOpen: (o) => {
      we(r, o.currentTarget);
    }
  });
  r.shell = t, y(r), r.addEventListener("statechange", () => y(r)), e.__majoorOmniCamExtractorRuntime = r, e.addDOMWidget("majoor_omnicam_extractor_shell", "omnicam", t.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 124,
    getHeight: () => 124,
    getMaxHeight: () => 124
  });
  const n = () => {
    r.disposed || (r.checkSourceChanged(), r.workbench && (r.workbench.refreshSource(), e.setDirtyCanvas?.(!0, !0)));
  }, s = e.onConnectionsChange;
  e.onConnectionsChange = function(...o) {
    s?.apply(this, o), n(), setTimeout(n, 60), setTimeout(n, 400);
  };
  const a = z(e, () => setTimeout(n, 0)), i = e.onAfterGraphConfigured;
  e.onAfterGraphConfigured = function(...o) {
    i?.apply(this, o), n(), r.workbench?.reconstruction?.syncFromWidgets?.();
  };
  const u = e.onRemoved;
  return e.onRemoved = function(...o) {
    v.disposeForNode(e.id), a(), r.dispose(), u?.apply(this, o);
  }, r;
}
const Me = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachExtractorShell: _e
}, Symbol.toStringTag, { value: "Module" }));
export {
  I as a,
  De as b,
  re as c,
  Ge as d,
  Ae as e,
  xe as f,
  Me as g,
  Oe as p,
  Fe as q,
  Se as r,
  Re as s
};
