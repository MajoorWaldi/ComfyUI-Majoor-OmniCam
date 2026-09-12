import { app as Z } from "../../scripts/app.js";
import { api as C } from "../../scripts/api.js";
import { d as $e, u as Pe, l as Le, S as Fe, b as Oe, p as De } from "./chunk-BOI_2OKd.js";
import { M as qe, E as je } from "./chunk-CbqXtcpr.js";
import { a as f, z as fe, bm as Ve, b0 as Ue } from "./chunk-BS4DKobr.js";
import { h as me, N as ge, O as be, P as L, Q as z, R as K, T as Ge, L as Be, U as We, V as He, w as Qe, W as ze, X as Ke, Y as Ye, Z as Xe, _ as Je } from "./chunk-CIaplyLQ.js";
function Ze(t) {
  return t?.name === "AbortError" || t?.code === 20;
}
class et {
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
      if (this.aborted || Ze(r)) return;
      throw r;
    }
  }
  dispose() {
    this.disposed || (this.disposed = !0, tt(), this.controller?.abort());
  }
}
function tt() {
  const t = typeof globalThis == "object" ? globalThis : null;
  if (!t) return;
  const e = t.__majoorOmniCamIntentionalAborts, r = { at: Date.now() };
  if (Array.isArray(e)) {
    e.length >= 64 && e.shift(), e.push(r);
    return;
  }
  t.__majoorOmniCamIntentionalAborts = [r];
}
function rt(t, e) {
  const r = !!t.upstreamPreviewActive, o = t.sourceViewer?.mode || "native", a = e ? r ? "upstream" : o === "fallback" ? "fallback" : "native" : "none", n = (i, s) => {
    const c = t.$(i);
    c && (c.hidden = !s);
  };
  return n("source-video", a === "native"), n("fallback-preview", a === "fallback"), n("upstream-preview", a === "upstream"), a;
}
function ot(t, e) {
  const r = t.$("tracking-overlay"), o = Math.round(Number(e?.width) || 0), a = Math.round(Number(e?.height) || 0);
  return !r || o < 1 || a < 1 || r.width === o && r.height === a ? !1 : (r.width = o, r.height = a, t.overlay.draw(), !0);
}
async function at(t, e) {
  const r = t.$("upstream-preview");
  if (!r) return;
  const o = e.available ? null : e.previewMedia;
  t.upstreamPreviewActive = o ? await $e(o, r, 960) : !1, t.disposed || t.render();
}
const nt = /* @__PURE__ */ new Set(["COMPLETED", "FAILED", "CANCELLED"]);
function it(t) {
  return nt.has(String(t || ""));
}
function st(t, e) {
  return !e || it(t) ? t : e;
}
const ct = /* @__PURE__ */ new Set([
  "QUEUED",
  "PREPARING",
  "TRACKING",
  "SOLVING",
  "RECONSTRUCTING",
  "FINALIZING",
  "REFINING",
  "STOPPING",
  "CANCELLING"
]), lt = /* @__PURE__ */ new Set(["COMPLETED", "FAILED", "CANCELLED", "STOPPED"]), R = (t, e) => t == null || Number.isNaN(Number(t)) ? e : Number(t), ut = {
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
function ve() {
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
function q(t, e) {
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
      const r = st(t.solveState, e.state), o = lt.has(t.solveState);
      return {
        ...t,
        solveState: r,
        progress: o || e.progress === void 0 ? t.progress : R(e.progress, t.progress),
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
        progress: R(r.progress, t.progress),
        backend: r.backend || t.backend,
        poseCount: R(r.pose_count, t.poseCount),
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
        poseCount: R(e.result?.pose_count, t.poseCount)
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
function dt(t) {
  const e = t.solveState, r = ct.has(e), o = e === "COMPLETED";
  return {
    track: !r && t.source.available,
    stop: r,
    // A partial solve is reviewable, never shippable.
    apply: o && !!t.refinedFingerprint,
    refine: o,
    retry: e === "STOPPED" || e === "FAILED" || e === "CANCELLED"
  };
}
function ht(t) {
  return ut[t] || "neutral";
}
function pt(t) {
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
function ft(t) {
  return t.frameCount ? `${t.frame} / ${t.frameCount} frames` : t.solveState === "IDLE" ? "Ready to track" : t.solveState;
}
function mt(t) {
  return t.applied.fingerprint ? t.applied.outdated ? "OUTDATED" : "APPLIED" : "NOT APPLIED";
}
function gt(t, e) {
  return t?.widgets?.find((r) => r.name === e) || null;
}
async function bt(t) {
  if (!await me(
    t.app,
    f("Clear Cache"),
    f("Deletes every cached reconstruction (GLBs, manifests, source images) from disk, and forgets this node's cached track and reconstruction results. This cannot be undone.")
  )) return !1;
  t.queuePromptId && t.cancelQueuedRun();
  try {
    await t.reconstruction.client.clearCache();
  } catch (r) {
    return t.dispatch({ type: "FAILED", error: String(r?.message || r) }), !1;
  }
  for (const r of [ge, be, L]) {
    const o = gt(t.node, r);
    o && (o.value = "");
  }
  return t.node.setDirtyCanvas?.(!0, !0), t.overlay.clear(), t.diagnostics.clear(), t.result = { raw: null, refined: null }, t.sourceKey = "", t.state = ve(), t.reconstruction?.dispatch({ type: "RESET" }), t.render(), t.refreshSource(), !0;
}
function vt(t, e) {
  const r = [], o = (c, l) => {
    const d = (p) => l(p?.detail ?? p ?? {});
    e?.addEventListener?.(c, d), r.push([c, d]);
  }, a = () => String(t.node?.id ?? ""), n = (c) => {
    const l = String(t.queuePromptId || "");
    return l !== "" && String(c ?? "") === l;
  }, i = (c, l = {}) => t.dispatch({ type: "QUEUE_LIFECYCLE", state: c, ...l }), s = () => {
    t.queuePromptId = "";
  };
  return o("execution_start", (c) => {
    n(c.prompt_id) && i("PREPARING");
  }), o("executing", (c) => {
    if (!n(c.prompt_id)) return;
    const l = c.node ?? c.display_node ?? null;
    l != null && String(l) === a() && i(t.extractMode === "scene_reconstruct" ? "RECONSTRUCTING" : "TRACKING");
  }), o("progress", (c) => {
    if (!n(c.prompt_id) || c.node != null && String(c.node) !== a()) return;
    const l = Number(c.max) || 0;
    l > 0 && i(null, { progress: (Number(c.value) || 0) / l });
  }), o("executed", (c) => {
    String(c.node ?? c.display_node ?? "") === a() && (!n(c.prompt_id) && t.queuePromptId || (s(), t.executed(c.output ?? c)));
  }), o("execution_error", (c) => {
    n(c.prompt_id) && (i("FAILED", {
      error: String(c.exception_message || c.error || "The queued solve failed")
    }), s());
  }), o("execution_interrupted", (c) => {
    n(c.prompt_id) && (i("CANCELLED"), s());
  }), o("execution_success", (c) => {
    n(c.prompt_id) && (i("FINALIZING"), s());
  }), () => {
    for (const [c, l] of r.splice(0))
      e?.removeEventListener?.(c, l);
  };
}
const yt = "1.49.1";
function xt(t = globalThis) {
  const e = t?.__COMFYUI_FRONTEND_VERSION__;
  return typeof e == "string" ? e : "";
}
function ee(t) {
  const e = String(t ?? "").match(/^(\d+)\.(\d+)\.(\d+)/);
  return e ? e.slice(1, 4).map(Number) : null;
}
function wt(t, e) {
  const r = ee(t), o = ee(e);
  if (!r || !o)
    throw new Error(`Unsupported ComfyUI frontend version: ${t || "(none)"}`);
  for (let a = 0; a < 3; a += 1)
    if (r[a] !== o[a]) return r[a] < o[a] ? -1 : 1;
  return 0;
}
async function kt(t, e, { frontendVersion: r = xt(), intent: o } = {}) {
  if (!Array.isArray(e) || e.length === 0)
    throw new Error("OmniCam partial execution requires at least one target");
  if (!r)
    throw new Error(
      "Cannot select a queuePrompt signature without a ComfyUI frontend version"
    );
  return wt(r, yt) >= 0 ? t.queuePrompt(0, 1, { queueNodeIds: e, intent: o }) : t.queuePrompt(0, 1, e);
}
const St = {
  camera_track: "omnicam_track",
  scene_reconstruct: "omnicam_reconstruct"
};
function Et(t) {
  const e = t?.id;
  return e == null || e === "" || ye(t) ? null : String(e);
}
function ye(t) {
  if (t == null) return !1;
  if (String(t.id ?? "").includes(":")) return !0;
  const e = t.graph;
  return e ? !!(e.isRootGraph === !1 || e._is_subgraph || e.is_subgraph || e._subgraph_node || e.rootGraph && e.rootGraph !== e) : !1;
}
async function Ct(t, {
  timeoutMs: e = 4e3,
  intervalMs: r = 16,
  now: o = () => Date.now(),
  sleep: a = (n) => new Promise((i) => setTimeout(i, n))
} = {}) {
  if (!t || typeof t != "object" || !t.processingQueue) return !0;
  const n = o();
  for (; t.processingQueue; ) {
    if (o() - n >= e) return !1;
    await a(r);
  }
  return !0;
}
async function _t(t, e = "camera_track", { idle: r } = {}) {
  if (!t.refreshSource()?.available) return { accepted: !1, reason: "no-source" };
  if (ye(t.node))
    return { accepted: !1, reason: "subgraph-not-supported" };
  const a = Et(t.node);
  if (!a) return { accepted: !1, reason: "no-execution-id" };
  if (!await Ct(t.app, r))
    return { accepted: !1, reason: "submission-busy" };
  t.setExtractMode(e), t.syncPanelToNodeWidgets?.(), t.prepareForQueuedRun?.();
  const { accepted: n, promptId: i } = await Nt(
    t.app,
    t.api,
    [a],
    { intent: { trigger_source: St[e] || "omnicam_track" } }
  );
  return t.queuePromptId = n ? String(i || "") : "", { accepted: n, promptId: t.queuePromptId };
}
async function Nt(t, e, r, o) {
  const a = r.map(String).sort(), n = e.fetchApi;
  let i = "";
  e.fetchApi = async (s, c = {}) => {
    const l = await n.call(e, s, c);
    try {
      const d = String(s).split("?")[0];
      if (String(c.method || "GET").toUpperCase() === "POST" && (d === "/prompt" || d.endsWith("/prompt")) && l.ok && !i) {
        let u = {};
        try {
          u = JSON.parse(c.body || "{}");
        } catch {
          u = {};
        }
        const m = Array.isArray(u.partial_execution_targets) ? u.partial_execution_targets.map(String).sort() : null;
        if (m && m.length === a.length && m.every((g, b) => g === a[b])) {
          const g = await l.clone().json().catch(() => ({}));
          typeof g?.prompt_id == "string" && (i = g.prompt_id);
        }
      }
    } catch {
    }
    return l;
  };
  try {
    return { accepted: !!await kt(t, r, o), promptId: i };
  } finally {
    e.fetchApi = n;
  }
}
async function Y(t, e) {
  if (!e) return !1;
  const r = await t.fetchApi(
    `/api/jobs/${encodeURIComponent(e)}/cancel`,
    { method: "POST" }
  );
  if (!r.ok)
    throw new Error(`Comfy job cancellation failed (${r.status})`);
  return !!(await r.json().catch(() => ({})))?.cancelled;
}
async function Tt(t, e, r) {
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
async function Mt(t, { selectElement: e = null, statusElement: r = null, checkpointSelectElement: o = null } = {}) {
  const a = await t.capabilities(), n = Array.isArray(a?.providers) ? a.providers : [], i = a?.recommended_provider || (n[0]?.provider_id ?? "");
  if (e) {
    typeof e.replaceChildren == "function" ? e.replaceChildren() : Array.isArray(e.options) && (e.options.length = 0);
    for (const l of n) {
      let d;
      typeof document < "u" && typeof document.createElement == "function" ? d = document.createElement("option") : d = { value: "", textContent: "", disabled: !1 }, d.value = l.provider_id, d.textContent = l.available ? l.name || l.provider_id : `${l.name || l.provider_id} (Unavailable)`, d.disabled = !l.available, typeof e.appendChild == "function" ? e.appendChild(d) : Array.isArray(e.options) && e.options.push(d);
    }
    i && (e.value = i);
  }
  const s = e?.value || i, c = n.find((l) => l.provider_id === s);
  if (o) {
    typeof o.replaceChildren == "function" ? o.replaceChildren() : Array.isArray(o.options) && (o.options.length = 0);
    const l = (u, m) => {
      let h;
      return typeof document < "u" && typeof document.createElement == "function" ? h = document.createElement("option") : h = { value: "", textContent: "" }, h.value = u, h.textContent = m, h;
    }, d = (u) => {
      typeof o.appendChild == "function" ? o.appendChild(u) : Array.isArray(o.options) && o.options.push(u);
    };
    d(l("auto", "Auto"));
    const p = Array.isArray(c?.metadata?.checkpoints) ? c.metadata.checkpoints : [];
    for (const u of p)
      d(l(u, u));
    o.value = "auto";
  }
  return r && (c && !c.available ? (r.textContent = c.reason || "Provider unavailable", r.hidden = !1) : (r.textContent = "", r.hidden = !0)), {
    capabilities: a,
    recommended: i,
    providers: n
  };
}
const At = {
  fast: { triangle_budget: 4e4, discontinuity_threshold: 0.06 },
  balanced: { triangle_budget: 12e4, discontinuity_threshold: 0.04 },
  high: { triangle_budget: 25e4, discontinuity_threshold: 0.03 }
};
function te(t, e) {
  if (!t) return;
  const r = t.querySelector('[data-role="reconstruction-triangle-budget"]'), o = t.querySelector('[data-role="reconstruction-edge-threshold"]'), a = At[e];
  r && (r.disabled = !!a, a && (r.value = String(a.triangle_budget))), o && (o.disabled = !!a, a && (o.value = String(a.discontinuity_threshold)));
}
const Rt = { geometry: "depth_mesh", layout: "depth_mesh" }, xe = /* @__PURE__ */ new Set(["blockout", "hybrid", "scan"]), It = /* @__PURE__ */ new Set(["vggt", "vggt_omega_research"]);
function we(t) {
  if (!t) return {};
  const e = (d) => t.querySelector(`[data-role="${d}"]`)?.value, r = (d) => !!t.querySelector(`[data-role="${d}"]`)?.checked, o = e("reconstruction-mode") || "depth_mesh";
  let a = Rt[o] || o;
  const n = e("reconstruction-provider") || "";
  It.has(n) && (a = "scan");
  const i = n || (a === "scan" ? "vggt" : "comfy_moge"), s = String(e("reconstruction-semantic-labels") || "").split(/[\n,]/).map((d) => d.trim()).filter(Boolean), c = e("reconstruction-checkpoint") || "auto", l = {
    provider: i,
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
  return xe.has(a) && (l.segmentation_provider = e("reconstruction-segmentation") || "comfy_sam3", l.completion_policy = e("reconstruction-completion-policy") || "off", l.completion_provider = l.completion_policy === "off" ? "none" : "sam3d_objects", l.max_blockout_objects = Number(e("reconstruction-max-objects")) || 24, l.blockout_assets = e("reconstruction-blockout-assets") || "off", s.length && (l.semantic_labels = s)), l;
}
function F(t) {
  if (!t) return;
  const e = we(t).mode, r = xe.has(e);
  for (const o of ["reconstruction-semantic-row", "reconstruction-labels-row"]) {
    const a = t.querySelector(`[data-role="${o}"]`);
    a && (a.hidden = !r);
  }
}
function $t(t, {
  onRun: e = () => {
  },
  onStop: r = () => {
  },
  onOpenDirector: o = () => {
  },
  onSettingsChange: a = () => {
  },
  on: n = (i, s, c) => i?.addEventListener?.(s, c)
} = {}) {
  if (!t) return () => {
  };
  const i = [], s = (h, g, b) => {
    n(h, g, b), i.push(() => h?.removeEventListener?.(g, b));
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
    F(t);
    const h = we(t);
    a(h);
  };
  for (const h of c) {
    const g = t.querySelector(`[data-role="${h}"]`);
    if (!g) continue;
    const b = g.tagName === "SELECT" || g.type === "checkbox" ? "change" : "input";
    s(g, b, l);
  }
  const d = t.querySelector('[data-role="reconstruction-quality"]');
  d && s(d, "change", () => {
    te(t, d.value), l();
  }), te(t, d?.value), F(t);
  const p = t.querySelector('[data-role="reconstruction-run"]');
  p && s(p, "click", e);
  const u = t.querySelector('[data-role="reconstruction-stop"]');
  u && s(u, "click", r);
  const m = t.querySelector('[data-role="reconstruction-open-director"]');
  return m && s(m, "click", o), () => {
    for (const h of i.splice(0)) h();
  };
}
async function Pt(t) {
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
class Lt {
  constructor(e) {
    this.api = e;
  }
  async _request(e, { method: r = "GET", signal: o } = {}) {
    const a = { method: r };
    o && (a.signal = o);
    const n = await this.api.fetchApi(e, a);
    if (!n.ok) throw new Error(await Pt(n));
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
const Ft = /* @__PURE__ */ new Set([
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
function Ot() {
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
function ke() {
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
    settings: Ot()
  };
}
function Dt(t) {
  const e = t?.jobState || "IDLE", r = Ft.has(e), o = t?.source, a = !!(o && (typeof o == "string" || o.available || o.value || o.ref || o.info || o.kind)), n = !r && e !== "STOPPING" && a, i = r, s = !!(t?.result && (t.result.motion_scene || t.result.objects || t.result.version));
  return {
    canStart: n,
    canStop: i,
    canOpenDirector: e === "DONE" && s,
    canPreview: s,
    // Discard a result you don't want (deletes its cached files so a re-run
    // recomputes). Never mid-job.
    canDiscard: s && !r && e !== "STOPPING"
  };
}
function qt(t, e) {
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
        ...ke(),
        source: t.source,
        settings: t.settings
      };
    default:
      return t;
  }
}
const Se = [
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
function Ee(t, e, r) {
  const o = t?.widgets?.find((a) => a.name === e);
  return o ? o.value : r;
}
function j(t, e, r) {
  const o = t?.widgets?.find((a) => a.name === e);
  return !o || o.value === r ? !1 : (o.value = r, t.setDirtyCanvas?.(!0, !0), !0);
}
function Ce(t, e) {
  return t?.querySelector?.(`[data-role="${e}"]`) || null;
}
function re(t, e) {
  if (!(!t || !e))
    for (const r of Se) {
      const o = Ce(e, r.role);
      if (!o) continue;
      const a = Ee(t, r.widget, void 0);
      a != null && (r.kind === "boolean" ? o.checked = !!a : o.value = String(a));
    }
}
function P(t, e) {
  if (!t || !e) return !1;
  let r = !1;
  for (const a of Se) {
    const n = Ce(e, a.role);
    if (!n) continue;
    if (a.kind === "boolean") {
      r = j(t, a.widget, !!n.checked) || r;
      continue;
    }
    const i = n.value;
    i === "" || i == null || (r = j(t, a.widget, a.kind === "number" ? Number(i) : i) || r);
  }
  const o = Ee(t, "recon_completion_policy", "off");
  return r = j(t, "recon_completion_provider", o === "off" ? "none" : "sam3d_objects") || r, r;
}
function V(t) {
  return Math.round(Math.min(1, Math.max(0, t?.progress || 0)) * 100);
}
function jt(t, e) {
  if (!t) return;
  const r = Dt(e), o = t.querySelector('[data-role="reconstruction-run"]');
  o && (o.disabled = !r.canStart);
  const a = t.querySelector('[data-role="reconstruction-stop"]');
  a && (a.disabled = !r.canStop);
  const n = t.querySelector('[data-role="reconstruction-open-director"]');
  n && (n.disabled = !r.canOpenDirector);
  const i = t.querySelector('[data-role="reconstruction-preview-toggle"]');
  i && (i.disabled = !r.canPreview);
  const s = t.querySelector('[data-role="reconstruction-discard"]');
  s && (s.disabled = !r.canDiscard);
  const c = t.querySelector('[data-role="reconstruction-progress"]');
  c && (c.style.width = `${V(e)}%`);
  const l = t.querySelector('[data-role="reconstruction-stage"]');
  if (l)
    if (e?.error) {
      const u = e.error?.message || e.error?.code || String(e.error);
      l.textContent = u, l.dataset.state = "error";
    } else e?.stage ? (l.textContent = `${e.stage} (${V(e)}%)`, l.dataset.state = "active") : e?.jobState && e.jobState !== "IDLE" ? (l.textContent = `${e.jobState} (${V(e)}%)`, l.dataset.state = e.jobState === "DONE" ? "ok" : "active") : (l.textContent = f("Ready to reconstruct"), l.dataset.state = "idle");
  const d = t.querySelector('[data-role="reconstruction-summary"]');
  if (d)
    if (e?.summary) {
      d.hidden = !1;
      const u = e.summary, m = u.triangle_count != null ? u.triangle_count : u.mesh_triangles, h = m != null ? Number(m).toLocaleString() : null, g = u.camera_fov_x != null ? u.camera_fov_x : u.camera_fov, b = g != null ? Number(g).toFixed(1) : null, w = Number(u.ground_confidence) > 0 ? f("ground plane detected") : null, x = [];
      h && x.push(`${h} ${f("triangles")}`), b && x.push(`FOV ${b}°`), w && x.push(w), d.textContent = x.join(" • ");
    } else
      d.hidden = !0, d.textContent = "";
  const p = t.querySelector('[data-role="reconstruction-warnings"]');
  if (p) {
    const u = e?.warnings || [];
    if (u.length > 0) {
      p.hidden = !1, p.replaceChildren();
      for (const m of u) {
        const h = document.createElement("div");
        h.className = "oc-warning-item", h.textContent = `⚠ ${m}`, p.appendChild(h);
      }
    } else
      p.hidden = !0, p.replaceChildren();
  }
}
class Vt {
  constructor({
    root: e,
    node: r,
    api: o,
    app: a = null,
    getSource: n = () => null,
    onAdopt: i = () => {
    },
    onQueue: s = () => {
    },
    onCancel: c = () => {
    },
    on: l = (d, p, u) => d?.addEventListener?.(p, u)
  }) {
    this.root = e, this.node = r, this.api = o, this.app = a, this.getSource = n, this.onAdopt = i, this.onQueue = s, this.onCancel = c, this.on = l, this.client = new Lt(o), this.runGeneration = 0, this.state = ke();
    const d = this.getSource();
    d && (this.state.source = d), this.unbindControls = $t(this.root, {
      onRun: () => this.run(),
      onStop: () => this.stop(),
      onOpenDirector: () => this.openDirector(),
      onSettingsChange: (h) => {
        P(this.node, this.root), this.dispatch({ type: "SETTINGS", settings: h });
      },
      on: this.on
    }), this.syncFromWidgets(), P(this.node, this.root), this.preview = null, this.previewLoad = null, this.previewOpen = !1;
    const p = this.root?.querySelector?.('[data-role="reconstruction-preview-toggle"]');
    p && this.on(p, "click", () => this.togglePreview());
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
    return this.preview || this.disposed ? this.preview : (this.previewLoad ||= import("./chunk-GsNOpGlX.js").then(({ TrackViewer: e }) => {
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
      resolveAssetUrl: (r) => fe(this.api, r)
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
    re(this.node, this.root), F(this.root), this.render();
  }
  async initCapabilities() {
    try {
      const e = this.root.querySelector('[data-role="reconstruction-provider"]'), r = this.root.querySelector('[data-role="reconstruction-stage"]'), o = this.root.querySelector('[data-role="reconstruction-checkpoint"]');
      if (await Mt(this.client, {
        selectElement: e,
        statusElement: r,
        checkpointSelectElement: o
      }), this.disposed) return;
      re(this.node, this.root), F(this.root), this.render();
    } catch {
    }
  }
  setSource(e) {
    this.dispatch({ type: "SOURCE", source: e });
  }
  dispatch(e) {
    if (this.disposed) return;
    const r = this.state.result;
    this.state = qt(this.state, e), this.render(), this.previewOpen && this.preview && this.state.result && this.state.result !== r && this.pushSceneToPreview();
  }
  render() {
    jt(this.root, this.state);
  }
  async run() {
    !(this.state.source || this.getSource()) || this.disposed || (this.runGeneration += 1, P(this.node, this.root), this.dispatch({ type: "STATE", jobState: "PREPARING" }), await this.onQueue());
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
    if (!this.state.result || !await me(
      this,
      f("Discard reconstruction"),
      f("Removes this reconstruction and its cached files so the next run recomputes it. The camera track and other reconstructions are left untouched.")
    ) || this.disposed) return !1;
    const r = String(this.state.fingerprint || "");
    if (r)
      try {
        if (await this.client.deleteCacheEntry(r), this.disposed) return !1;
      } catch (o) {
        return this.dispatch({ type: "ERROR", error: { message: o.message } }), !1;
      }
    return this.previewOpen && await this.togglePreview(), this.dispatch({ type: "RESET" }), !0;
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.runGeneration += 1, this.unbindControls?.(), this.unbindControls = null, this.preview?.dispose(), this.preview = null);
  }
}
const Ut = [
  "normalize_origin",
  "motion_scale",
  "position_smoothing",
  "rotation_smoothing",
  "simplify_keys",
  "position_tolerance",
  "rotation_tolerance_deg"
];
function Gt(t, e) {
  return t?.widgets?.find((r) => r.name === e) || null;
}
function oe(t, e, r) {
  const o = Gt(t, e);
  return !o || o.value === r ? !1 : (o.value = r, t?.setDirtyCanvas?.(!0, !0), !0);
}
function Bt({ node: t, root: e, mode: r, refineSettings: o }) {
  let a = oe(t, "extract_mode", r);
  if (r === "scene_reconstruct")
    return P(t, e) || a;
  for (const n of Ut)
    o?.[n] !== void 0 && (a = oe(t, n, o[n]) || a);
  return a;
}
const Wt = {
  "subgraph-not-supported": "OmniCam TRACK does not support an Extractor inside a subgraph yet. Move it to the root graph, or run the whole workflow with Queue Prompt.",
  "no-execution-id": "This Extractor has no resolvable node id and cannot be queued.",
  "submission-busy": "ComfyUI is still sending another prompt. Press TRACK again in a moment."
};
async function Ht(t, e = "camera_track") {
  try {
    const r = await _t(t, e), o = Wt[r?.reason];
    o && t.dispatch({ type: "FAILED", error: o });
  } catch (r) {
    t.dispatch({ type: "FAILED", error: String(r?.message || r) });
  }
}
function Qt(t) {
  Bt({
    node: t.node,
    root: t.root,
    mode: t.extractMode,
    refineSettings: t.refine.settings
  });
}
function zt(t) {
  t.sourceViewer.setFollow(!0), t.overlay.clear(), t.diagnostics.clear(), t.queuePromptId = "", t.dispatch({ type: "JOB_STARTED", status: { job_id: "", state: "QUEUED" } }), t.coordinator.seek(0, "backend");
}
async function Kt(t) {
  const e = String(t.queuePromptId || "");
  if (e) {
    t.dispatch({ type: "QUEUE_LIFECYCLE", state: "CANCELLING" });
    try {
      await Y(t.api, e);
    } catch (r) {
      t.dispatch({
        type: "QUEUE_LIFECYCLE",
        state: "FAILED",
        error: String(r?.message || r)
      });
    }
  }
}
const Yt = 200, ae = {
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
function U() {
  return { pitch: 0, yaw: 0, roll: 0 };
}
class Xt {
  constructor({ onRefine: e, delay: r = Yt, setTimer: o, clearTimer: a } = {}) {
    this.settings = { ...ae }, this.alignment = U(), this.onRefine = e || (() => {
    }), this.delay = r, this.setTimer = o || ((n, i) => setTimeout(n, i)), this.clearTimer = a || ((n) => clearTimeout(n)), this.timer = null, this.lastSent = "";
  }
  /** Merge a change and schedule a refine. Returns the merged settings. */
  update(e) {
    return this.settings = { ...this.settings, ...e }, this.schedule(), this.settings;
  }
  setAlignment(e) {
    return this.alignment = { ...this.alignment, ...e }, this.update({
      global_rotation_xyzw: Jt(this.alignment),
      estimate_up: !1
    });
  }
  /** Ask the server to derive the levelling rotation from the solve itself. */
  requestEstimatedUp() {
    return this.alignment = U(), this.update({ global_rotation_xyzw: null, estimate_up: !0 });
  }
  setSpikeAction(e, r) {
    const o = { ...this.settings.spike_actions };
    return r === "ignore" ? delete o[String(e)] : o[String(e)] = r, this.update({ spike_actions: o });
  }
  reset() {
    return this.settings = { ...ae }, this.alignment = U(), this.schedule(), this.settings;
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
function Jt({ pitch: t = 0, yaw: e = 0, roll: r = 0 } = {}) {
  if (!t && !e && !r) return null;
  const [o, a, n] = [t, e, r].map((u) => (Number(u) || 0) * (Math.PI / 180) * 0.5), [i, s, c, l, d, p] = [
    Math.cos(o),
    Math.sin(o),
    Math.cos(a),
    Math.sin(a),
    Math.cos(n),
    Math.sin(n)
  ];
  return [
    s * c * d + i * l * p,
    i * l * d - s * c * p,
    i * c * p + s * l * d,
    i * c * d - s * l * p
  ];
}
class Zt {
  constructor({ maxFrames: e = 180 } = {}) {
    this.maxFrames = Math.max(1, Math.floor(Number(e) || 180)), this.frames = /* @__PURE__ */ new Map();
  }
  set(e, { points: r = [], vectors: o = [], state: a = "unknown" } = {}) {
    const n = Math.max(0, Math.floor(Number(e) || 0)), i = {
      frame: n,
      points: Array.isArray(r) ? r : [],
      vectors: Array.isArray(o) ? o : [],
      state: String(a || "unknown")
    };
    for (this.frames.delete(n), this.frames.set(n, i); this.frames.size > this.maxFrames; ) this.frames.delete(this.frames.keys().next().value);
    return i;
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
function er(t, e) {
  const r = Math.max(0, Math.floor(Number(e) || 0) - 1);
  return Math.max(0, Math.min(r, Math.round(Number(t) || 0)));
}
function tr(t) {
  return ["manual", "transport", "timeline", "quality", "input"].includes(t);
}
class rr {
  constructor({
    media: e = null,
    getViewer: r = () => null,
    showDiagnostics: o = () => {
    },
    dispatch: a = () => {
    },
    setFollow: n = () => {
    },
    onPlaybackState: i = () => {
    },
    frameCount: s = 0,
    fps: c = 24,
    loop: l = !1,
    // Closures, not .bind(globalThis): the receiver is what matters here and a
    // closure states it directly instead of through a partial application.
    requestAnimationFrame: d = (u) => globalThis.requestAnimationFrame?.(u),
    cancelAnimationFrame: p = (u) => globalThis.cancelAnimationFrame?.(u)
  } = {}) {
    this.media = e, this.getViewer = r, this.showDiagnostics = o, this.dispatch = a, this.setFollow = n, this.onPlaybackState = i, this.frameCount = Math.max(0, Math.floor(Number(s) || 0)), this.fps = Math.max(1, Number(c) || 24), this.loop = !!l, this.frame = 0, this.playing = !1, this.disposed = !1, this.animationFrame = null, this.playbackStartFrame = 0, this.playbackStartTime = null, this.requestAnimationFrame = d || (() => null), this.cancelAnimationFrame = p || (() => {
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
    const o = er(e, this.frameCount);
    return tr(r) && this.setFollow(!1), r !== "media" && this.media?.seekFrame?.(o), this.getViewer?.()?.setFrame?.(o), this.showDiagnostics(o), this.frame = o, this.dispatch({ type: "FRAME", frame: o }), r !== "playback" && (this.playbackStartFrame = o, this.playbackStartTime = null), o;
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
    const i = Math.max(0, n - 1);
    let s = this.playbackStartFrame + a;
    if (s > i)
      if (this.loop && n > 0) s %= n;
      else {
        i !== this.frame && this.seek(i, "playback"), this.pause();
        return;
      }
    s !== this.frame && this.seek(s, "playback"), this.schedule();
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.pause(), this.media = null, this.getViewer = null, this.showDiagnostics = null, this.dispatch = null, this.setFollow = null, this.onPlaybackState = null);
  }
}
class M extends Error {
}
function or(t, { track: e, state: r } = {}) {
  if (r !== "COMPLETED")
    throw new M("Only a completed solve can be applied to the Director.");
  const o = e?.keyframes;
  if (!Array.isArray(o) || !o.length)
    throw new M("This solve produced no camera keys to apply.");
  const a = String(e?.metadata?.extractor_fingerprint || "");
  if (!a)
    throw new M("This track carries no extractor fingerprint.");
  const n = z(e);
  if (!n)
    throw new M("This solve cannot be wrapped in a canonical motion scene.");
  K(t, {
    motionScene: n,
    fingerprint: a,
    solver_coverage: Number(e?.metadata?.solver_coverage ?? e?.metadata?.confidence) || 0
  });
  const i = Ge(t);
  return { fingerprint: a, notified: i };
}
function ar(t, e = "") {
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
class nr extends qe {
  constructor(e, {
    fps: r = 24,
    onFrame: o = () => {
    },
    onMetadata: a = () => {
    },
    onError: n = () => {
    },
    onMode: i = () => {
    },
    fallbackViewer: s = null
  } = {}) {
    super(e, {
      fps: r,
      durationFrames: 1,
      onFrame: (c) => this.reportFrame(c),
      onMetadata: a,
      onError: (c) => this.handleMediaError(c),
      errorMessage: ar,
      loop: !0,
      muted: !0
    }), this.frameCount = 0, this.onExternalFrame = o, this.ignoredFrame = null, this.follow = !0, this.mode = "native", this.source = null, this.onMode = i, this.fallbackViewer = s, this.onPlaybackError = n;
  }
  setSource(e, { source: r, ...o } = {}) {
    const a = r || null, n = this.source?.kind !== a?.kind || this.source?.value !== a?.value, i = super.setSource(e, o);
    return i || n ? (this.source = a, this.fallbackViewer?.clear?.(), this.setMode("native")) : a && (this.source = a), i;
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
function ne(t, e) {
  const r = Math.max(1, Number(e) || 24), o = Math.max(0, Number(t) || 0), a = Math.floor(o / r), n = (i, s = 2) => String(i).padStart(s, "0");
  return `${n(Math.floor(a / 60))}:${n(a % 60)}:${n(o % r)}`;
}
const ir = "/majoor/omnicam/extractor/frame";
function sr(t) {
  return Math.max(0, Math.round(Number(t) || 0));
}
function I(t, e, r = 0) {
  const o = Number(t?.get?.(e));
  return Number.isFinite(o) && o > 0 ? Math.round(o) : r;
}
async function cr(t) {
  try {
    return await t?.text?.() || `Preview frame request failed (${t?.status || "unknown"})`;
  } catch {
    return `Preview frame request failed (${t?.status || "unknown"})`;
  }
}
function lr(t) {
  return t?.name === "AbortError";
}
function ur(t, e, r = e?.width, o = e?.height) {
  const a = t?.getContext?.("2d"), n = Math.max(1, Number(e?.width) || 1), i = Math.max(1, Number(e?.height) || 1), s = Math.max(1, Math.round(Number(r) || n)), c = Math.max(1, Math.round(Number(o) || i));
  if (!a) return !1;
  t.width !== s && (t.width = s), t.height !== c && (t.height = c);
  const l = Math.min(s / n, c / i), d = Math.round(n * l), p = Math.round(i * l);
  return a.clearRect(0, 0, s, c), a.drawImage(e, Math.round((s - d) / 2), Math.round((c - p) / 2), d, p), !0;
}
class dr {
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
    const i = sr(r);
    try {
      const s = await this.api?.fetchApi?.(ir, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: e, frame: i, max_dimension: o }),
        signal: n.signal
      });
      if (!s?.ok) throw new Error(await cr(s));
      const c = await s.blob(), l = await this.decodeImage(c);
      if (a !== this.generation || n.signal.aborted)
        return l?.close?.(), !1;
      const d = I(s.headers, "X-OmniCam-Width", l?.width), p = I(s.headers, "X-OmniCam-Height", l?.height);
      let u = !1;
      try {
        u = ur(this.canvas, l, d, p);
      } finally {
        l?.close?.();
      }
      if (!u) throw new Error("The fallback preview canvas is unavailable.");
      return this.frame = I(s.headers, "X-OmniCam-Frame", i), this.frameCount = I(s.headers, "X-OmniCam-Frame-Count", this.frameCount), this.error = "", !0;
    } catch (s) {
      if (a !== this.generation || n.signal.aborted || lr(s)) return !1;
      throw this.error = String(s?.message || s), s;
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
const hr = {
  LoadVideo: ["file", "video"],
  VHS_LoadVideo: ["video"],
  VHS_LoadVideoPath: ["video"],
  LoadVideoFFmpeg: ["file", "video"]
}, pr = {
  LoadImage: ["image"]
}, fr = /\.(mp4|mov|webm|mkv|m4v|avi)(\s|$)/i, mr = /\.(png|jpe?g|webp)(\s|$)/i;
function gr(t) {
  return {
    available: !1,
    ref: null,
    label: "",
    reason: t ? "Scene Reconstruct requires a file-backed still image. Connect Load Image or choose an Extractor source file. This source exists only during workflow execution." : "Interactive Track requires a file-backed video source. Connect Load Video or choose an Extractor source file. This source exists only during workflow execution."
  };
}
function ie(t) {
  return String(t?.comfyClass || t?.type || t?.constructor?.type || "");
}
function br(t, e) {
  for (const r of e) {
    const o = t?.widgets?.find((a) => String(a.name).toLowerCase() === r);
    if (o && o.value) return String(o.value);
  }
  return "";
}
function vr(t, e) {
  const r = (t?.inputs || []).find((o) => String(o?.name).toLowerCase() === "video");
  return !r || r.link == null || !e ? null : Le(e, r.link);
}
function se(t) {
  const e = String(
    t?.widgets?.find((o) => o.name === "omnicam_extractor_source")?.value || ""
  );
  return e ? { kind: /\s\[(input|output|temp)\]$/.test(e) ? "annotated_input" : "managed", value: e } : null;
}
function yr(t, e = t?.graph, r = "camera_track") {
  const o = r === "scene_reconstruct", a = o ? pr : hr, n = o ? mr : fr, i = o ? "Load Image" : "Load Video", s = o ? "an image" : "a video", c = o ? "reconstruct" : "track", l = gr(o), d = vr(t, e);
  if (d) {
    const u = a[ie(d)];
    if (!u) {
      const h = se(t);
      return h ? {
        available: !0,
        reason: "",
        label: h.value.replace(/\s\[(input|output|temp)\]$/, "").split("/").pop(),
        ref: h,
        originNodeId: d.id ?? null,
        runtimeMaterialized: !0
      } : {
        ...l,
        reason: `${ie(d) || "This node"} produces its footage only while the workflow runs. Connect ${i}, or choose an Extractor source file, to ${c} without running.`,
        // Cannot be solved without a real file, but the origin may already
        // have rendered something (a previous run, an upload thumbnail) --
        // showing it at least confirms what is actually connected.
        previewMedia: Pe(d)
      };
    }
    const m = br(d, u);
    return m ? n.test(m) ? {
      available: !0,
      reason: "",
      label: m,
      ref: { kind: "annotated_input", value: m },
      originNodeId: d.id ?? null
    } : { ...l, reason: `${m} does not look like ${s} file.` } : { ...l, reason: `The connected ${i} node has no file selected yet.` };
  }
  const p = se(t);
  return p ? {
    available: !0,
    reason: "",
    label: p.value.split("/").pop(),
    ref: p,
    originNodeId: null
  } : { ...l, reason: `Connect ${i}, or choose a source file, to ${c}.` };
}
function xr(t) {
  if (!t?.available) return t?.reason || "No source";
  const e = t.info;
  if (!e) return t.label;
  const r = [t.label];
  return e.width && e.height && r.push(`${e.width}x${e.height}`), e.fps && r.push(`${Number(e.fps).toFixed(2).replace(/\.?0+$/, "")}fps`), e.frame_count && r.push(`${e.frame_count} frames`), r.join(" · ");
}
async function wr(t) {
  const e = await C.fetchApi("/majoor/omnicam/extractor/source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: t })
  });
  if (!e.ok)
    throw new Error(`OmniCam: could not describe the source (${e.status})`);
  return e.json();
}
function kr(t) {
  const e = t.extractMode || "camera_track", r = yr(t.node, t.node.graph, e), o = r.ref ? `${r.ref.kind}:${r.ref.value}` : "", a = o !== (t.sourceKey || "");
  a && (t.sourceKey = o, t.describing = "", t.queuePromptId && Y(t.api, t.queuePromptId).catch(() => {
  }), t.dispatch({ type: "SOURCE_RESET", source: { ...r, playbackError: "" } }), t.coordinator.setRate(24), t.coordinator.setFrameCount(0));
  const n = t.sourceViewer.setSource(
    r.available && r.ref ? fe(C, r.ref.value) : "",
    { source: r.available ? r.ref : null }
  );
  return a && t.coordinator.seek(0, "source"), t.dispatch({ type: "SOURCE", source: n ? { ...r, playbackError: "" } : r }), e !== "scene_reconstruct" && (r.available && r.ref ? _e(t, r) : X(t, 0)), at(t, r), r;
}
async function _e(t, e) {
  if (t.describing === e.ref?.value) return null;
  t.describing = e.ref?.value;
  try {
    const r = await wr(e.ref);
    if (t.disposed || t.sourceKey !== `${e.ref.kind}:${e.ref.value}`) return null;
    const o = r?.info || null;
    return t.dispatch({ type: "SOURCE", source: { info: o } }), o && (t.coordinator.setRate(Number(o.fps) || t.sourceViewer.fps), X(t, Number(o.frame_count) || 0), ot(t, o)), o;
  } catch (r) {
    return console.warn("[OmniCam] could not describe the extractor source", r), null;
  }
}
function X(t, e) {
  const r = Math.max(0, Math.round(Number(e) || 0));
  t.coordinator.setFrameCount(r), r !== t.state.frameCount && (t.dispatch({ type: "FRAME_COUNT", frameCount: r }), t.coordinator.seek(t.coordinator.frame, "source"));
}
const Sr = `${Fe}${Be}
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
function E(t, e, { min: r = 0, max: o = 1, step: a = 0.01, value: n = 0 } = {}) {
  return `<label for="oc-${t}">${e}</label>
    <input id="oc-${t}" data-role="${t}" type="range" min="${r}" max="${o}" step="${a}" value="${n}">
    <output data-role="${t}-out"></output>`;
}
function Er() {
  return `<div class="majoor-omnicam oc-extractor">
    <style>${Sr}</style>
    <header class="oc-header">
      ${Oe("OmniCam Extractor")}
      <span class="oc-status-pill" data-role="solve-status" data-tone="neutral"><i class="oc-status-dot"></i><span data-role="solve-status-text">IDLE</span></span>
    </header>

    <div class="oc-mode-bar" aria-label="Extractor mode">
      <button type="button" class="oc-tab" data-role="extract-mode-camera" aria-selected="true">${f("Camera Track")}</button>
      <button type="button" class="oc-tab" data-role="extract-mode-reconstruct" aria-selected="false">${f("Scene Reconstruct")}</button>
      <button type="button" class="icon-button oc-clear-cache" data-role="clear-cache" title="${f("Clear cached tracks and reconstructions, and reset this node")}"><i class="pi pi-trash"></i></button>
    </div>

    <div class="oc-source" data-role="source-strip" data-available="false">
      <span class="oc-source-label" data-role="source-label">Connect a VIDEO input to track.</span>
    </div>

    <div class="oc-card oc-reconstruction-panel" data-role="reconstruction-panel" hidden>
      <div class="oc-section">${f("Scene Reconstruction")}</div>
      <div class="oc-rows">
        <div class="oc-inline">
          <label for="oc-recon-provider">${f("Provider")}</label>
          <select id="oc-recon-provider" data-role="reconstruction-provider"></select>
          <label for="oc-recon-mode">${f("Result")}</label>
          <select id="oc-recon-mode" data-role="reconstruction-mode">
            <option value="depth_mesh">${f("Depth Mesh")}</option>
            <option value="blockout">${f("Blockout")}</option>
            <option value="hybrid">${f("Hybrid")}</option>
            <option value="scan">${f("Scan")}</option>
          </select>
          <label for="oc-recon-quality">${f("Quality")}</label>
          <select id="oc-recon-quality" data-role="reconstruction-quality">
            <option value="fast">${f("Fast")}</option>
            <option value="balanced" selected>${f("Balanced")}</option>
            <option value="high">${f("High")}</option>
            <option value="custom">${f("Custom")}</option>
          </select>
        </div>
        <div class="oc-inline">
          <label for="oc-recon-checkpoint">${f("Geometry Model")}</label>
          <select id="oc-recon-checkpoint" data-role="reconstruction-checkpoint">
            <option value="auto" selected>${f("Auto")}</option>
          </select>
        </div>
        <div class="oc-inline" data-role="reconstruction-semantic-row">
          <label for="oc-recon-segmentation">${f("Objects")}</label>
          <select id="oc-recon-segmentation" data-role="reconstruction-segmentation">
            <option value="comfy_sam3" selected>${f("SAM3")}</option>
            <option value="none">${f("None")}</option>
          </select>
          <label for="oc-recon-max-objects">${f("Max objects")}</label>
          <input id="oc-recon-max-objects" data-role="reconstruction-max-objects" type="number" min="1" max="128" step="1" value="24">
          <label for="oc-recon-completion">${f("Completion")}</label>
          <select id="oc-recon-completion" data-role="reconstruction-completion-policy">
            <option value="off" selected>${f("Off")}</option>
            <option value="low_depth_confidence">${f("Low confidence")}</option>
            <option value="selected">${f("Selected")}</option>
            <option value="all_bounded">${f("All bounded")}</option>
          </select>
        </div>
        <div class="oc-inline" data-role="reconstruction-labels-row">
          <label for="oc-recon-labels">${f("Labels")}</label>
          <input id="oc-recon-labels" data-role="reconstruction-semantic-labels" type="text" placeholder="${f("Default interior taxonomy")}" />
          <label for="oc-recon-assets">${f("3D assets")}</label>
          <select id="oc-recon-assets" data-role="reconstruction-blockout-assets" title="${f("Swap fitted boxes for GLB props from the asset library")}">
            <option value="off" selected>${f("Boxes only")}</option>
            <option value="proxy">${f("Add props")}</option>
            <option value="replace">${f("Replace boxes")}</option>
          </select>
        </div>
        <div class="oc-inline">
          <label class="oc-inline"><input data-role="reconstruction-recover-fov" type="checkbox" checked> ${f("Recover FOV")}</label>
          <label class="oc-inline"><input data-role="reconstruction-source-texture" type="checkbox" checked> ${f("Source Texture")}</label>
          <label class="oc-inline"><input data-role="reconstruction-detect-ground" type="checkbox" checked> ${f("Detect Ground")}</label>
          <label class="oc-inline"><input data-role="reconstruction-detect-walls" type="checkbox"> ${f("Detect Walls")}</label>
        </div>
        <div class="oc-inline">
          <label for="oc-recon-triangle-budget">${f("Triangle Budget")}</label>
          <input id="oc-recon-triangle-budget" data-role="reconstruction-triangle-budget" type="number" min="1000" max="500000" step="5000" value="120000">
          <label for="oc-recon-edge-threshold">${f("Edge Threshold")}</label>
          <input id="oc-recon-edge-threshold" data-role="reconstruction-edge-threshold" type="number" min="0.01" max="1" step="0.01" value="0.04">
          <label for="oc-recon-scene-scale">${f("Scene Scale")}</label>
          <input id="oc-recon-scene-scale" data-role="reconstruction-scene-scale" type="number" min="0.01" max="100" step="0.1" value="1.0">
        </div>
        <div class="oc-progress"><i data-role="reconstruction-progress" style="width:0%"></i></div>
        <div data-role="reconstruction-stage" class="oc-stage-label"></div>
        <div data-role="reconstruction-summary" class="oc-summary-box" hidden></div>
        <div data-role="reconstruction-warnings" class="oc-warnings-box" hidden></div>
        <div class="oc-recon-preview" data-role="reconstruction-preview" hidden>
          <div class="oc-recon-preview-bar">
            <button type="button" data-role="reconstruction-preview-fit" title="${f("Frame the reconstructed scene")}"><i class="pi pi-search"></i> ${f("Fit")}</button>
          </div>
          <canvas data-role="reconstruction-3d" width="960" height="540" aria-label="${f("3D preview of the reconstructed scene")}"></canvas>
        </div>
        <div class="oc-actions">
          <button type="button" class="oc-primary" data-role="reconstruction-run">${f("▶ RECONSTRUCT")}</button>
          <button type="button" data-role="reconstruction-stop" disabled>${f("■ STOP")}</button>
          <button type="button" data-role="reconstruction-discard" title="${f("Discard this reconstruction and its cached files so the next run recomputes it")}" disabled>${f("✕ DISCARD")}</button>
          <button type="button" data-role="reconstruction-preview-toggle" disabled>${f("3D PREVIEW")}</button>
          <button type="button" class="oc-primary" data-role="reconstruction-open-director" disabled>${f("OPEN IN DIRECTOR")}</button>
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
            ${E("position-smoothing", "Position smooth", { value: 0.15 })}
            ${E("motion-scale", "Motion scale", { min: 0.01, max: 10, step: 0.01, value: 1 })}
          </div>
          <div class="oc-inline">
            <button type="button" data-act="estimate-up">Level Horizon</button>
          </div>
          <details class="oc-details"><summary>Advanced cleanup</summary>
            <div class="oc-sliders">
              ${E("rotation-smoothing", "Rotation smooth", { value: 0.1 })}
              ${E("position-tolerance", "Key reduction", { min: 0, max: 0.5, step: 1e-3, value: 0.01 })}
              ${E("align-pitch", "Pitch", { min: -180, max: 180, step: 0.5, value: 0 })}
              ${E("align-yaw", "Yaw", { min: -180, max: 180, step: 0.5, value: 0 })}
              ${E("align-roll", "Roll", { min: -180, max: 180, step: 0.5, value: 0 })}
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
function Cr(t = document) {
  const e = t.createElement("div");
  return e.innerHTML = Er(), e.firstElementChild;
}
const Ne = {
  good: "#46a758",
  weak: "#e5a23c",
  bad: "#e5484d",
  unknown: "#3a3a48"
};
function J(t) {
  if (!t) return "unknown";
  const e = String(t.state || "").toLowerCase();
  if (Ne[e]) return e;
  const r = Number(t.coverage);
  return Number.isFinite(r) ? r >= 0.7 ? "good" : r >= 0.35 ? "weak" : "bad" : "unknown";
}
function _r(t, e) {
  const r = (t || []).find((a) => Number(a.frame) === Number(e)), o = [["Frame", String(e)]];
  return r ? (o.push(["Tracking state", J(r).toUpperCase()]), Number.isFinite(Number(r.coverage)) && o.push(["Coverage", `${Math.round(Number(r.coverage) * 100)}%`]), r.inliers != null && o.push(["Inliers", String(r.inliers)]), o) : (o.push(["Tracking state", "UNKNOWN"]), o);
}
const Nr = {
  position: "#8b7bd8",
  target: "#e5a23c",
  roll: "#e2649a"
}, D = [
  { key: "position", label: "Camera" },
  { key: "target", label: "Look At" },
  { key: "roll", label: "Roll" }
], Tr = 18, Mr = 9, ce = 2, Te = 78, Ar = { solve: "SOLVE HEALTH" }, O = {
  bands: ["solve"],
  labels: !0,
  labelWidth: Te,
  bandHeight: Mr,
  bandGap: ce,
  laneTopGap: ce + 2,
  laneHeight: Tr,
  laneGap: 0,
  rowChrome: !1,
  ruler: !0,
  playhead: !0,
  topPad: 1,
  bottomPad: 12
}, le = {
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
function Me(t = D, e = O) {
  const r = { ...O, ...e }, o = [];
  let a = r.topPad;
  for (const n of r.bands || [])
    o.length && (a += r.bandGap), o.push({
      kind: "band",
      key: n,
      label: Ar[n] || String(n).toUpperCase(),
      top: a,
      height: r.bandHeight
    }), a += r.bandHeight;
  for (const n of t)
    o.length && (a += o[o.length - 1].kind === "band" ? r.laneTopGap : r.laneGap), o.push({ kind: "lane", key: n.key, label: n.label, top: a, height: r.laneHeight }), a += r.laneHeight;
  return { rows: o, style: r, height: a + r.bottomPad };
}
function Rr(t = D, e = O) {
  return Me(t, e).height;
}
function Ir(t, e) {
  if (!t) return null;
  if (e === "position" || e === "target") {
    const o = t[e];
    return Array.isArray(o) ? o.map(Number) : null;
  }
  const r = Number(t.roll);
  return Number.isFinite(r) ? [r] : null;
}
function $r(t, e, r = 1e-4) {
  return !t || !e || t.length !== e.length ? !1 : t.every((o, a) => Math.abs(o - e[a]) <= r);
}
function Ae(t, e = D) {
  const r = Array.isArray(t?.keyframes) ? t.keyframes : [], o = {};
  for (const { key: a } of e) {
    const n = [];
    let i = null;
    for (const s of r) {
      const c = Ir(s?.camera, a);
      c && ((i === null || !$r(c, i)) && n.push(Number(s.frame) || 0), i = c);
    }
    o[a] = n;
  }
  return o;
}
function Pr(t, e = null, r = "generic") {
  if (!t?.keyframes?.length || !e) return null;
  try {
    const a = Array.isArray(t.objects) && t.objects.some((n) => n?.id === "subject" && Array.isArray(n.position)) ? e : { ...e, allow_framing_loss: !0 };
    return Ve(t, a, null, r);
  } catch {
    return null;
  }
}
function Lr(t, e, r, o = Te) {
  const a = Math.max(1, Number(r) || 0), n = Math.max(1, (Number(e) || 1) - o), i = Math.max(0, Math.min(1, (Number(t) - o) / n));
  return Math.max(0, Math.min(a - 1, Math.round(i * (a - 1))));
}
function Re(t, e) {
  return Math.max(1, (Number(t) || 1) - e.labelWidth - (e.labelWidth ? 4 : 0));
}
function _(t, e, r, o) {
  const a = Math.max(1, (Number(r) || 1) - 1), n = Re(e, o);
  return o.labelWidth + Math.max(0, Math.min(a, t)) / a * n;
}
function Fr(t, e) {
  const r = Math.max(0, Number(e) - 1);
  return (t || []).map((o) => {
    const a = Math.max(0, Math.min(r, Number(o?.start_frame ?? o?.frame) || 0)), n = Math.max(a, Math.min(r, Number(o?.end_frame ?? o?.frame) || a));
    return { start: a, end: n, level: o?.level === "error" ? "error" : "warn" };
  });
}
function Or(t, e, r, o, a, n) {
  for (const i of e) {
    const s = _(i.start, o, a, n), c = _(i.end, o, a, n), l = Math.max(2, c - s + 2);
    t.fillStyle = "#101014", t.fillRect(Math.round(s - 1), r.top + 2, Math.ceil(l + 2), r.height - 4), t.fillStyle = i.level === "error" ? "#ffffff" : "#f2c66d", t.fillRect(Math.round(s), r.top + 3, Math.ceil(l), r.height - 6);
  }
}
function Dr(t, { y: e, height: r, width: o, frameCount: a, colorAt: n, style: i }) {
  const s = Math.max(1, Number(a) || 0), c = Re(o, i), l = Math.max(1, Math.ceil(s / c)), d = Math.max(1, c / Math.ceil(s / l));
  for (let p = 0; p < s; p += l) {
    const u = n(p, Math.min(s, p + l));
    u && (t.fillStyle = u, t.fillRect(i.labelWidth + p / s * c, e, d, r));
  }
}
function qr(t, e, r, o) {
  const a = new Map((t || []).map((i) => [Number(i.frame), i]));
  let n = "unknown";
  for (let i = Math.max(0, Number(r) || 0); i < Math.max(0, Number(o) || 0); i += 1) {
    const s = J(a.get(i)), c = String((e || [])[i] || "").toLowerCase(), l = c === "over" ? "bad" : c === "warn" ? "weak" : c === "ok" ? "good" : "unknown";
    $(s) > $(n) && (n = s), $(l) > $(n) && (n = l);
  }
  return n;
}
function jr(t, e, r) {
  const o = Number(r) || 0, a = (t || []).find((s) => Number(s.frame) === o), n = String(e?.frame_grades?.[o] || "unknown").toUpperCase(), i = [["Solve state", J(a).toUpperCase()], ["Motion grade", n]];
  a && Number.isFinite(Number(a.coverage)) && i.push(["Coverage", `${Math.round(Number(a.coverage) * 100)}%`]), a?.inliers != null && i.push(["Inliers", String(a.inliers)]);
  for (const s of ["speed", "angular_speed", "acceleration", "jerk"]) {
    const c = Number(e?.series?.[s]?.[o]), l = Number(e?.limits?.[`max_${s}`]);
    Number.isFinite(c) && i.push([s.replace("_", " "), Number.isFinite(l) ? `${c.toFixed(2)} / ${l}` : c.toFixed(2)]);
  }
  return e?.framing?.[o] === !1 && !e?.limits?.allow_framing_loss && i.push(["Framing", "LOSS"]), i;
}
function Vr(t, e, r, o) {
  t.fillStyle = o, t.font = "9px system-ui, sans-serif", t.textBaseline = "middle", t.fillText(e, 2, r);
}
function Ur(t, e, r, o, a, n) {
  const i = Math.max(0, Math.min(n, o / 2, a / 2));
  t.beginPath(), t.moveTo(e + i, r), t.arcTo(e + o, r, e + o, r + a, i), t.arcTo(e + o, r + a, e, r + a, i), t.arcTo(e, r + a, e, r, i), t.arcTo(e, r, e + o, r, i), t.closePath();
}
function Gr(t, { row: e, width: r, style: o }) {
  const a = o.labelWidth, n = Math.max(2, r - a);
  Ur(t, a + 0.5, e.top + 0.5, n - 1, e.height - 1, 6), t.fillStyle = "#20202a", t.fill(), t.strokeStyle = "#26262f", t.lineWidth = 1, t.stroke(), e.kind === "lane" && (t.fillStyle = "#2c2c38", t.fillRect(a + 1, Math.round(e.top + e.height / 2), n - 2, 1));
}
function Br(t, {
  track: e = null,
  health: r = null,
  quality: o = [],
  anomalies: a = [],
  frame: n = 0,
  frameCount: i = 0,
  channels: s = D,
  layout: c = O
} = {}) {
  const l = Math.max(1, Number(i) || Number(e?.duration_frames) || 1), d = Ae(e, s), { rows: p, style: u } = Me(s, c), m = {
    total: l,
    labelWidth: u.labelWidth,
    lanes: p.filter((v) => v.kind === "lane").map((v) => ({
      key: v.key,
      top: v.top,
      bottom: v.top + v.height,
      keys: d[v.key] || []
    })),
    anomalies: Fr(a, l)
  }, h = t?.getContext?.("2d"), g = t?.width || 0, b = t?.height || 0;
  if (!h || !g || !b) return { ...m, keys: d };
  h.clearRect(0, 0, g, b);
  const w = Array.isArray(r?.frame_grades) ? r.frame_grades : [], x = {
    solve: (v, y) => Ne[qr(o, w, v, y)]
  };
  for (const v of p) {
    u.rowChrome && Gr(h, { row: v, width: g, style: u });
    const y = v.top + v.height / 2;
    if (u.labels && Vr(h, v.label, y, "#9a9aad"), v.kind === "band") {
      const A = x[v.key];
      if (!A) continue;
      const S = u.rowChrome ? 2 : 0;
      Dr(h, {
        y: v.top + S,
        height: v.height - S * 2,
        width: g,
        frameCount: l,
        colorAt: A,
        style: u
      }), v.key === "solve" && Or(h, m.anomalies, v, g, l, u);
      continue;
    }
    const k = d[v.key] || [];
    k.length > 1 && !u.rowChrome && (h.strokeStyle = "#2c2c38", h.lineWidth = 1, h.beginPath(), h.moveTo(_(k[0], g, l, u), y), h.lineTo(_(k[k.length - 1], g, l, u), y), h.stroke()), h.fillStyle = Nr[v.key] || "#8b7bd8";
    const N = u.rowChrome ? 5.5 : 3.5;
    for (const A of k) {
      const S = Math.max(
        u.labelWidth + N,
        Math.min(g - N, _(A, g, l, u))
      );
      h.beginPath(), h.moveTo(S, y - N), h.lineTo(S + N, y), h.lineTo(S, y + N), h.lineTo(S - N, y), h.closePath(), h.fill();
    }
  }
  if (u.ruler) {
    h.fillStyle = "#3a3a48";
    const v = Math.min(12, l);
    for (let y = 0; y <= v; y += 1) {
      const k = Math.round(y / Math.max(1, v) * (l - 1));
      h.fillRect(_(k, g, l, u), b - 6, 1, 5);
    }
  }
  if (u.playhead) {
    const v = _(Math.max(0, Math.min(l - 1, Number(n) || 0)), g, l, u);
    h.fillStyle = "#e6e6f0", h.fillRect(Math.round(v), 0, 1, b);
  }
  return { ...m, keys: d };
}
function $(t) {
  return { unknown: 0, good: 1, weak: 2, bad: 3 }[t] ?? 0;
}
class Wr {
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
  render({ track: e = null, health: r = null, quality: o = [], anomalies: a = [], frame: n = 0, frameCount: i = 0 } = {}) {
    const s = this.$("track-timeline");
    if (!s) return null;
    const c = Rr(void 0, le);
    return s.height !== c && (s.height = c), Br(s, {
      track: e,
      health: r,
      quality: o,
      anomalies: a,
      frame: n,
      layout: le,
      frameCount: Math.max(Number(i) || 0, Number(e?.duration_frames) || 0)
    });
  }
  /** Which frame a pointer event over the strip refers to, or null. */
  frameAt(e, r) {
    const o = this.$("extractor-dope-tracks");
    if (!o?.getBoundingClientRect) return null;
    const a = o.getBoundingClientRect();
    return Lr(e.clientX - a.left, a.width, r, 0);
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
const Hr = [
  "first-frame",
  "previous-key",
  "previous-frame",
  "play",
  "next-frame",
  "next-key",
  "last-frame",
  "toggle-loop"
], Qr = {
  "first-frame": '[data-act="first-frame"]',
  "previous-key": '[data-act="previous-key"]',
  "previous-frame": '[data-act="previous-frame"]',
  play: '[data-act="play"]',
  "next-frame": '[data-act="next-frame"]',
  "next-key": '[data-act="next-key"]',
  "last-frame": '[data-act="last-frame"]',
  "toggle-loop": '[data-act="toggle-loop"]'
};
function G(t) {
  return [...new Set((t || []).map((e) => Number(typeof e == "object" ? e?.frame : e)).filter(Number.isFinite).map((e) => Math.max(0, Math.round(e))))].sort((e, r) => e - r);
}
function zr(t, e) {
  const r = G(t?.anomalies), o = G(Object.values(Ae(e)).flat()), a = o.length ? o : G(e?.keyframes);
  return { anomalies: r, solved: a };
}
function B(t, e, { anomalies: r, solved: o }) {
  const a = e > 0 ? (i) => i > t : (i) => i < t, n = (i) => {
    const s = i.filter(a);
    return e > 0 ? s[0] : s.at(-1);
  };
  return n(r) ?? n(o) ?? null;
}
function Kr(t) {
  const e = String(t?.tagName || "").toLowerCase();
  return t?.isContentEditable || e === "textarea" || e === "select" ? !0 : e === "input" && ["text", "number"].includes(String(t.type || "text").toLowerCase());
}
function W(t) {
  return Math.max(0, Math.round(Number(t?.frameCount) || 0));
}
function Yr(t, {
  coordinator: e,
  getState: r = () => ({}),
  getTrack: o = () => null,
  on: a = (n, i, s) => n?.addEventListener?.(i, s)
} = {}) {
  const n = (u) => t?.querySelector?.(Qr[u]) || null, i = () => r() || {}, s = () => zr(i(), o()), c = (u) => W(i()) < 1 ? !1 : (e?.seek?.(u, "transport"), !0), l = (u) => {
    const m = B(Number(i().frame) || 0, u, s());
    return m === null ? !1 : c(m);
  }, d = {
    "first-frame": () => c(0),
    "previous-key": () => l(-1),
    "previous-frame": () => c((Number(i().frame) || 0) - 1),
    play: () => W(i()) > 0 && !!e?.toggle?.(),
    "next-frame": () => c((Number(i().frame) || 0) + 1),
    "next-key": () => l(1),
    "last-frame": () => c(W(i()) - 1),
    "toggle-loop": () => (e?.setLoop?.(!e?.loop), p(), !0)
  };
  for (const u of Hr) {
    const m = n(u);
    m && a(m, "click", () => d[u]());
  }
  a(t, "keydown", (u) => {
    if (Kr(u.target)) return;
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
  function p() {
    const u = Number(i().frame) || 0, m = s(), h = n("previous-key");
    h && (h.disabled = B(u, -1, m) === null);
    const g = n("next-key");
    g && (g.disabled = B(u, 1, m) === null);
    const b = n("toggle-loop");
    b && b.setAttribute("aria-pressed", String(!!e?.loop));
    const w = n("play");
    if (w) {
      w.classList?.toggle?.("playing", !!e?.playing);
      const x = w.querySelector?.("i");
      x && (x.className = e?.playing ? "pi pi-pause" : "pi pi-play"), w.setAttribute("aria-label", e?.playing ? "Pause playback" : "Play playback");
    }
  }
  return { render: p };
}
const Xr = 300, Jr = 300, T = {
  accepted: "#46a758",
  weak: "#e5a23c",
  rejected: "#e5484d",
  current: "#8b7bd8"
};
function ue(t, e) {
  const r = Array.isArray(t) ? t : [];
  if (r.length <= e) return r.slice();
  const o = r.length / e, a = [];
  for (let n = 0; n < e; n += 1) a.push(r[Math.floor(n * o)]);
  return a;
}
function H(t, { sourceWidth: e, sourceHeight: r, width: o, height: a }) {
  const n = Number(t?.x ?? t?.[0]) || 0, i = Number(t?.y ?? t?.[1]) || 0, s = n <= 1 && i <= 1 && n >= 0 && i >= 0, c = s ? o : o / Math.max(1, e || o), l = s ? a : a / Math.max(1, r || a);
  return [n * c, i * l];
}
class Zr {
  constructor(e) {
    this.canvas = e, this.points = [], this.vectors = [], this.frame = 0, this.state = "unknown";
  }
  setDiagnostics({ points: e = [], vectors: r = [], frame: o = 0, state: a = "unknown" } = {}) {
    this.points = ue(e, Xr), this.vectors = ue(r, Jr), this.frame = Number(o) || 0, this.state = String(a || "unknown"), this.draw();
  }
  clear() {
    this.points = [], this.vectors = [];
    const e = this.canvas?.getContext?.("2d");
    e && e.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  draw({ sourceWidth: e = 0, sourceHeight: r = 0 } = {}) {
    const o = this.canvas?.getContext?.("2d"), a = this.canvas?.width || 0, n = this.canvas?.height || 0;
    if (!o || !a || !n) return { points: this.points.length, vectors: this.vectors.length };
    const i = { sourceWidth: e, sourceHeight: r, width: a, height: n };
    o.clearRect(0, 0, a, n), o.lineWidth = 1;
    for (const s of this.vectors) {
      const [c, l] = H(s.from ?? s, i), [d, p] = H(s.to ?? s, i);
      o.strokeStyle = T[s.state] || T.accepted, o.beginPath(), o.moveTo(c, l), o.lineTo(d, p), o.stroke();
    }
    for (const s of this.points) {
      const [c, l] = H(s, i);
      o.fillStyle = T[s.state] || T.accepted, o.fillRect(c - 1.5, l - 1.5, 3, 3);
    }
    return (this.state === "weak" || this.state === "bad") && (o.strokeStyle = this.state === "bad" ? T.rejected : T.weak, o.lineWidth = 2, o.strokeRect(1, 1, a - 2, n - 2)), { points: this.points.length, vectors: this.vectors.length };
  }
  dispose() {
    this.clear(), this.canvas = null;
  }
}
function eo(t, e, r) {
  const o = t.createElement("div");
  o.className = "oc-row";
  const a = t.createElement("span");
  a.textContent = e;
  const n = t.createElement("span");
  return n.textContent = r, o.append(a, n), o;
}
function to(t, e, r = "Nothing to show") {
  if (!t) return 0;
  const o = t.ownerDocument;
  if (t.replaceChildren(), !e.length) {
    const a = o.createElement("div");
    return a.className = "oc-empty", a.textContent = r, t.append(a), 0;
  }
  for (const [a, n] of e) t.append(eo(o, a, n));
  return e.length;
}
function ro(t, e, { onAction: r = () => {
}, onFrame: o = () => {
}, actions: a = {} } = {}) {
  if (!t) return 0;
  const n = t.ownerDocument;
  if (t.replaceChildren(), !e?.length) {
    const i = n.createElement("div");
    return i.className = "oc-empty", i.textContent = "No anomalies detected", t.append(i), 0;
  }
  for (const i of e) {
    const s = n.createElement("div");
    s.className = "oc-anomaly", s.dataset.level = String(i.level || "warn");
    const c = n.createElement("div");
    c.className = "oc-anomaly-text";
    const l = n.createElement("strong"), d = Number(i.start_frame ?? i.frame), p = Number(i.end_frame ?? i.frame);
    l.textContent = d === p ? `Frame ${d}` : `Frames ${d}-${p}`, l.tabIndex = 0, l.setAttribute("role", "button"), l.addEventListener("click", () => o(i.frame)), l.addEventListener("keydown", (h) => {
      (h.key === "Enter" || h.key === " ") && (h.preventDefault(), o(i.frame));
    });
    const u = n.createElement("small");
    u.textContent = `${String(i.level || "warn").toUpperCase()} · ${i.detail || i.kind || ""}`, c.append(l, u), s.append(c);
    const m = a[String(i.frame)] || i.suggested_action || "ignore";
    for (const h of ["interpolate", "ignore", "exclude"]) {
      const g = n.createElement("button");
      g.type = "button", g.textContent = h.toUpperCase(), g.dataset.action = h, g.dataset.frame = String(i.frame), h === m && g.setAttribute("aria-selected", "true"), g.addEventListener("click", () => r(i, h)), s.append(g);
    }
    t.append(s);
  }
  return e.length;
}
function oo(t) {
  return (t || []).map((e, r) => [`Note ${r + 1}`, String(e)]);
}
function ao(t) {
  return import("./chunk-GsNOpGlX.js").then(({ TrackViewer: e }) => (t.viewerLoad = null, t.disposed || t.viewer || (t.viewer = new e(t.$("track-canvas")), t.pushTracksToViewer()), t.viewer)).catch((e) => (t.viewerLoad = null, console.warn("OmniCam track viewer unavailable", e), null));
}
function de(t) {
  const e = t.$("frame");
  e && (e.value = String(t.state.frame));
  const r = t.$("time");
  r && (r.textContent = ne(t.state.frame, t.sourceViewer.fps));
  const o = t.$("frame-readout");
  o && (o.textContent = `${t.state.frame} / ${Math.max(0, t.state.frameCount - 1)} · ${ne(t.state.frame, t.sourceViewer.fps)}`);
  const a = _r(t.state.quality, t.state.frame), n = jr(t.state.quality, t.currentHealth, t.state.frame);
  to(t.$("quality-details"), [...a, ...n, ...oo(t.state.warnings)], "No solve yet");
}
function he(t) {
  const e = t.$("extractor-ruler"), r = t.$("extractor-playhead"), o = Math.max(1, t.state.frameCount);
  if (!e || !r) return;
  const a = Math.min(12, o - 1 || 1);
  e.replaceChildren();
  for (let n = 0; n <= a; n += 1) {
    const i = Math.round(n / a * (o - 1)), s = `${n / a * 100}%`, c = e.ownerDocument.createElement("i");
    if (c.className = `oc-tick${n % 2 === 0 ? " major" : ""}`, c.style.left = s, e.append(c), n % 2 === 0) {
      const l = e.ownerDocument.createElement("span");
      l.className = "timeline-tick", l.style.left = s, l.textContent = String(i), e.append(l);
    }
  }
  r.style.left = `${Math.max(0, Math.min(o - 1, t.state.frame)) / Math.max(1, o - 1) * 100}%`;
}
const no = [ge, be, L];
function Ie(t, e) {
  return t?.widgets?.find((r) => r.name === e) || null;
}
function Q(t) {
  for (const e of no) {
    const r = Ie(t, e);
    r && (r.computeSize = () => [0, -4], r.draw = () => {
    }, r.hidden = !0, r.type = "hidden", r.options = { ...r.options || {}, hideInVueNodes: !0, serialize: !0 });
  }
  t.setDirtyCanvas?.(!0, !0);
}
function io(t) {
  Q(t), globalThis.requestAnimationFrame?.(() => Q(t)), setTimeout(() => Q(t), 250);
}
function mo(t) {
  if (t.__majoorOmniCamExtractor) return;
  if (We(t), !Ie(t, L)) {
    const s = t.addWidget?.("text", L, "", () => {
    }, { serialize: !0 });
    s && (s.computeSize = () => [0, -4], s.draw = () => {
    }, s.hidden = !0);
  }
  io(t), He(t);
  const e = new so(t);
  t.__majoorOmniCamExtractor = e;
  const r = () => Math.max(700, e.root.scrollHeight || 0);
  t.addDOMWidget("majoor_omnicam_extractor", "omnicam", e.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 700,
    getHeight: r,
    getMaxHeight: r
  });
  const o = t.onRemoved;
  t.onRemoved = function() {
    e.unwatchGraphConnections?.(), e.dispose(), o?.apply(this, arguments);
  };
  const a = () => {
    e.disposed || (e.refreshSource(), t.setDirtyCanvas?.(!0, !0));
  }, n = t.onConnectionsChange;
  t.onConnectionsChange = function() {
    n?.apply(this, arguments), a(), setTimeout(a, 60), setTimeout(a, 400);
  }, e.unwatchGraphConnections = Qe(t, () => setTimeout(a, 0));
  const i = t.onAfterGraphConfigured;
  t.onAfterGraphConfigured = function() {
    i?.apply(this, arguments), e.refreshSource(), e.reconstruction?.syncFromWidgets?.();
  };
}
function pe(t, e) {
  return t?.widgets?.find((r) => r.name === e) || null;
}
class so {
  constructor(e) {
    this.node = e, this.app = Z, this.api = C, this.root = Cr(), this.state = ve(), this.disposed = !1, this.events = new je(), this.requests = new et(), this.result = { raw: null, refined: null }, this.landmarks = [], this.diagnostics = new Zt(), this.upstreamPreviewActive = !1, this.motionLimits = null, this.rawSolve = null, this.refine = new Xt({ onRefine: (n) => this.requestRefine(n) }), this.fallbackViewer = new dr(this.$("fallback-preview"), { api: C }), this.sourceViewer = new nr(this.$("source-video"), {
      onFrame: (n) => this.coordinator.seek(n, "media"),
      onMetadata: ({ frameCount: n }) => this.adoptSourceLength(n),
      onError: (n) => this.dispatch({ type: "SOURCE", source: { playbackError: n } }),
      onMode: () => this.render(),
      fallbackViewer: this.fallbackViewer
    }), this.coordinator = new rr({
      media: this.sourceViewer,
      getViewer: () => this.viewer,
      showDiagnostics: (n) => this.showDiagnostics(n),
      dispatch: (n) => this.dispatch(n),
      setFollow: (n) => this.sourceViewer.setFollow(n),
      frameCount: this.state.frameCount,
      fps: this.sourceViewer.fps,
      loop: !0,
      onPlaybackState: () => this.transport?.render()
    }), this.timeline = new Wr(this.root, {
      onSeek: (n) => this.coordinator.seek(n, "timeline")
    }), this.transport = Yr(this.root, {
      coordinator: this.coordinator,
      getState: () => this.state,
      getTrack: () => this.state.trackMode === "raw" ? this.result.raw : this.result.refined,
      on: (n, i, s) => this.events.on(n, i, s)
    }), this.overlay = new Zr(this.$("tracking-overlay")), this.viewer = null, this.viewerLoad = null, this.queuePromptId = "", this.unbindQueueEvents = vt(this, C), this.extractMode = String(pe(this.node, "extract_mode")?.value || "camera_track"), this.reconstruction = new Vt({
      root: this.root,
      node: this.node,
      api: C,
      app: Z,
      getSource: () => this.state.source?.ref || null,
      onAdopt: (n) => ze(this.node, n),
      // Scene Reconstruction Start / Stop run through the same partial queue as
      // Camera TRACK; the panel no longer owns a job manager.
      onQueue: () => this.startSolve("scene_reconstruct"),
      onCancel: () => this.cancelQueuedRun(),
      on: (n, i, s) => this.events.on(n, i, s)
    });
    const r = this.$("extract-mode-camera"), o = this.$("extract-mode-reconstruct");
    r && this.events.on(r, "click", () => this.setExtractMode("camera_track")), o && this.events.on(o, "click", () => this.setExtractMode("scene_reconstruct")), this.setExtractMode(this.extractMode);
    const a = this.$("clear-cache");
    a && this.events.on(a, "click", () => {
      a.disabled = !0, Promise.resolve().then(() => this.clearCache()).catch((n) => this.dispatch({ type: "FAILED", error: String(n?.message || n) })).finally(() => {
        a.disabled = !1;
      });
    }), this.bindControls(), this.loadMotionLimits(), this.refreshSource(), this.restoreCachedResult(), this.render();
  }
  // -- plumbing ----------------------------------------------------------
  $(e) {
    return this.root.querySelector(`[data-role="${e}"]`);
  }
  dispatch(e) {
    return this.state = q(this.state, e), this.disposed || this.render(), this.state;
  }
  async loadMotionLimits() {
    try {
      const e = await this.requests.run(async (r) => {
        const o = await C.fetchApi?.("/majoor/omnicam/motion_profiles", { signal: r });
        return o?.ok ? o.json() : void 0;
      });
      if (e === void 0) return;
      this.motionLimits = e?.profiles?.find((r) => r.id === "generic")?.limits || null, this.disposed || this.render();
    } catch {
    }
  }
  bindControls() {
    this.events.on(this.root, "wheel", De(this.root));
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
    const e = kr(this);
    return this.reconstruction && e && this.reconstruction.setSource(e.ref || e), e;
  }
  /**
   * Ask the server what this footage is, before anything is solved.
   *
   * Without it the panel knows a filename and nothing else: no rate, no frame
   * count, so the scrubber has no range and the strip has nothing to say.
   */
  async describeSource(e) {
    return _e(this, e);
  }
  /** Give the transport a real range, from the footage rather than a solve. */
  adoptSourceLength(e) {
    return X(this, e);
  }
  // -- solve control -----------------------------------------------------
  /**
   * Delete every cached reconstruction from disk and forget this node's own
   * cached results, in both modes: the camera-track scene/fingerprint/source
   * widgets (result-cache.js) and the reconstruction panel's job state.
   */
  async clearCache() {
    return bt(this);
  }
  /** TRACK / Reconstruct Start -> a partial ComfyUI execution. See queue/ui-bridge.js. */
  startSolve(e = "camera_track") {
    return Ht(this, e);
  }
  /** STOP -> cancel this panel's ComfyUI job. Idempotent. */
  cancelQueuedRun() {
    return Kt(this);
  }
  syncPanelToNodeWidgets() {
    return Qt(this);
  }
  prepareForQueuedRun() {
    return zt(this);
  }
  /**
   * Adopt a solved track that arrived through the Extractor's queued
   * executed() -> parseExtractorMessage() envelope. This is the only way a
   * camera-track result reaches the panel now.
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
    }), this.dispatch({ type: "REFINED", fingerprint: a }), this.pushTracksToViewer();
    const n = Number(e?.confidence ?? o?.metadata?.confidence) || 0, i = e?.motionScene || z(o);
    return K(this.node, { motionScene: i, fingerprint: a }), e?.source && Ke(this.node, e.source), this.node.__majoorOmniCamStatus = Ye({ track: o, confidence: n }), this.dispatch({ type: "APPLIED", fingerprint: a }), e?.source && this.refreshSource(), !0;
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
      const r = await Tt(this.api, this.rawSolve, e), o = r?.refined_track;
      if (!o?.keyframes?.length) return null;
      this.result = { ...this.result, refined: o };
      const a = String(r.fingerprint || "");
      return this.dispatch({ type: "REFINED", fingerprint: a }), this.pushTracksToViewer(), K(this.node, { motionScene: z(o), fingerprint: a }), r;
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
    const [o, a, n, i] = r.map(Number), s = (d) => Math.round(d * (180 / Math.PI) * 10) / 10, c = s(Math.atan2(2 * (i * o + a * n), 1 - 2 * (o * o + a * a))), l = s(Math.atan2(2 * (i * n + o * a), 1 - 2 * (a * a + n * n)));
    for (const [d, p] of [["pitch", c], ["yaw", 0], ["roll", l]]) {
      const u = this.$(`align-${d}`);
      u && (u.value = String(p));
    }
    return this.refine.alignment = { pitch: c, yaw: 0, roll: l }, this.renderRefineValues(), e;
  }
  resetRefine() {
    this.refine.reset();
    for (const [e, r] of [
      ["position-smoothing", 0.15],
      ["rotation-smoothing", 0.1],
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
      const { fingerprint: e } = or(this.node, {
        track: this.result.refined,
        state: this.state.solveState
      });
      this.dispatch({ type: "APPLIED", fingerprint: e });
    } catch (e) {
      const r = e instanceof M ? e.message : String(e?.message || e);
      this.dispatch({ type: "FAILED", error: r });
    }
  }
  // -- viewer ------------------------------------------------------------
  ensureViewer() {
    return this.viewer || this.disposed ? Promise.resolve(this.viewer) : (this.viewerLoad ||= ao(this), this.viewerLoad);
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
    e && (e.dataset.tone = ht(this.state.solveState), this.$("solve-status-text").textContent = pt(this.state));
    const r = this.$("source-strip");
    r && (r.dataset.available = String(!!this.state.source.available), this.$("source-label").textContent = xr(this.state.source));
    const o = dt(this.state);
    for (const [b, w] of Object.entries({
      track: o.track,
      stop: o.stop,
      apply: o.apply
    })) {
      const x = this.root.querySelector(`[data-act="${b}"]`);
      x && (x.disabled = !w);
    }
    this.$("solve-detail").textContent = ft(this.state), this.$("solve-percent").textContent = `${Math.round(this.state.progress * 100)}%`, this.$("progress-bar").style.width = `${Math.round(this.state.progress * 100)}%`;
    const a = this.$("solve-error");
    a.hidden = !this.state.error, a.textContent = this.state.error || "";
    const n = mt(this.state), i = this.$("applied-state");
    i.dataset.state = n, i.textContent = n;
    for (const b of this.root.querySelectorAll("[data-tab]"))
      b.setAttribute("aria-selected", String(b.dataset.tab === this.state.viewerMode));
    for (const b of this.root.querySelectorAll("[data-track-mode]"))
      b.setAttribute("aria-selected", String(b.dataset.trackMode === this.state.trackMode));
    const s = this.state.viewerMode, c = s === "source", l = s === "track3d", d = this.$("stage");
    d && (d.dataset.mode = s), rt(this, c), this.$("tracking-overlay").hidden = !0, this.$("track-canvas").hidden = !l, this.root.querySelector('[data-role="views"]').hidden = !l;
    const p = this.$("scrubber");
    p && (p.max = String(Math.max(0, this.state.frameCount - 1)));
    const u = this.$("frame");
    u && (u.max = String(Math.max(0, this.state.frameCount - 1)));
    const m = this.$("frame-total");
    m && (m.textContent = `/ ${Math.max(0, this.state.frameCount - 1)}`);
    const h = this.$("extractor-fps");
    h && (h.textContent = String(this.sourceViewer.fps || 24)), ro(this.$("anomalies"), this.state.anomalies, {
      actions: this.refine.settings.spike_actions,
      onFrame: (b) => this.coordinator.seek(b, "anomaly"),
      onAction: (b, w) => {
        const x = Number(b.start_frame ?? b.frame) || 0, v = Math.max(x, Number(b.end_frame ?? b.frame) || x);
        for (let y = x; y <= v; y += 1) this.refine.setSpikeAction(y, w);
        this.render();
      }
    }), this.renderTimeline(), this.transport.render(), de(this), he(this);
    const g = this.$("stage-notice");
    if (g) {
      const b = this.state.source.playbackError || (this.upstreamPreviewActive ? "Preview only -- connect Load Video, or run the graph once, to track this source." : "");
      g.hidden = !b || !c, g.textContent = b;
    }
  }
  /**
   * The read-only solved camera channels, aligned to the source frame clock.
   */
  renderTimeline() {
    const e = this.state.trackMode === "raw" ? this.result.raw : this.result.refined;
    return this.currentHealth = Pr(e, this.motionLimits), this.timeline.render({
      track: e,
      health: this.currentHealth,
      quality: this.state.quality,
      anomalies: this.state.anomalies,
      frame: this.state.frame,
      frameCount: this.state.frameCount
    });
  }
  renderFrameReadouts() {
    return de(this);
  }
  /** Keep the read-only solve sheet on the exact same frame axis as playback. */
  renderExtractorRuler() {
    he(this);
  }
  renderRefineValues() {
    for (const e of [
      "position-smoothing",
      "rotation-smoothing",
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
  restoreCachedResult() {
    const e = Xe(this.node);
    e && (this.result = { raw: e.track, refined: e.track }, this.state = q(this.state, { type: "APPLIED", fingerprint: e.fingerprint }), this.state = q(this.state, { type: "REFINED", fingerprint: e.fingerprint }));
  }
  executed(e) {
    const r = Je(e);
    if (r) {
      if (r.mode === "scene_reconstruct") {
        this.reconstruction?.acceptQueuedResult(r);
        return;
      }
      this.acceptSolvedResult(r);
    }
  }
  setExtractMode(e) {
    this.extractMode = e;
    const r = e === "scene_reconstruct", o = this.$("reconstruction-panel"), a = this.$("camera-track-body");
    o && o.toggleAttribute("hidden", !r), a && a.toggleAttribute("hidden", r);
    const n = this.$("extract-mode-camera");
    n && (n.setAttribute("aria-selected", r ? "false" : "true"), n.classList.toggle("active", !r));
    const i = this.$("extract-mode-reconstruct");
    if (i && (i.setAttribute("aria-selected", r ? "true" : "false"), i.classList.toggle("active", r)), r && this.reconstruction) {
      const c = this.state.source?.ref || this.state.source;
      c && this.reconstruction.setSource(c);
    }
    const s = pe(this.node, "extract_mode");
    s && s.value !== e && (s.value = e, this.node.setDirtyCanvas?.(!0, !0));
  }
  dispose() {
    this.queuePromptId && Y(this.api, this.queuePromptId).catch(() => {
    }), this.unbindQueueEvents?.(), this.reconstruction?.dispose(), this.disposed = !0, Ue(), this.requests.dispose(), this.refine.dispose(), this.coordinator.dispose(), this.sourceViewer.dispose(), this.overlay.dispose(), this.diagnostics.dispose(), this.viewer?.dispose(), this.viewer = null, this.viewerLoad = null, this.events.dispose(), this.result = { raw: null, refined: null };
  }
}
export {
  so as ExtractorUI,
  mo as attachExtractor
};
