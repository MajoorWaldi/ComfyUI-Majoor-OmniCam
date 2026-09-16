import { app as H } from "../../scripts/app.js";
import { api as T } from "../../scripts/api.js";
import { S as wt, b as kt, p as St } from "./chunk-DiX7WiXt.js";
import { M as Et, E as _t } from "./chunk-CbqXtcpr.js";
import { u as p, v as rt, bI as Ct, x as Mt } from "./chunk-KSpmkRWt.js";
import { d as Tt } from "./chunk-eq1tqQ9i.js";
import { h as at, D as Rt, L as Nt, E as $t } from "./chunk-DwSnp0oD.js";
import { a as At, F as Ft, S as Pt, m as nt, c as it } from "./chunk-sVL03mTG.js";
import { c as Lt, q as It, a as st, r as Ot, s as Dt, b as qt, d as jt, e as Vt, p as Ut, f as Bt } from "./chunk-DT67NmZM.js";
function Wt(e) {
  return e?.name === "AbortError" || e?.code === 20;
}
class Gt {
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
      const o = await t(this.signal);
      return this.aborted ? void 0 : o;
    } catch (o) {
      if (this.aborted || Wt(o)) return;
      throw o;
    }
  }
  dispose() {
    this.disposed || (this.disposed = !0, Ht(), this.controller?.abort());
  }
}
function Ht() {
  const e = typeof globalThis == "object" ? globalThis : null;
  if (!e) return;
  const t = e.__majoorOmniCamIntentionalAborts, o = { at: Date.now() };
  if (Array.isArray(t)) {
    t.length >= 64 && t.shift(), t.push(o);
    return;
  }
  e.__majoorOmniCamIntentionalAborts = [o];
}
function zt(e, t) {
  const o = !!e.upstreamPreviewActive, r = e.sourceViewer?.mode || "native", a = t ? o ? "upstream" : r === "fallback" ? "fallback" : "native" : "none", n = (i, s) => {
    const l = e.$(i);
    l && (l.hidden = !s);
  };
  return n("source-video", a === "native"), n("fallback-preview", a === "fallback"), n("upstream-preview", a === "upstream"), a;
}
function Qt(e, t) {
  const o = e.$("tracking-overlay"), r = Math.round(Number(t?.width) || 0), a = Math.round(Number(t?.height) || 0);
  return !o || r < 1 || a < 1 || o.width === r && o.height === a ? !1 : (o.width = r, o.height = a, e.overlay.draw(), !0);
}
async function Kt(e, t) {
  const o = e.$("upstream-preview");
  if (!o) return;
  const r = t.available ? null : t.previewMedia;
  e.upstreamPreviewActive = r ? await Tt(r, o, 960) : !1, e.disposed || e.render();
}
function Yt(e, t) {
  return e?.widgets?.find((o) => o.name === t) || null;
}
async function Xt(e) {
  if (!await at(
    e.app,
    p("Clear Cache"),
    p("Deletes every cached reconstruction (GLBs, manifests, source images) from disk, and forgets this node's cached track and reconstruction results. This cannot be undone.")
  )) return !1;
  e.queuePromptId && await e.cancelQueuedRun();
  try {
    await e.reconstruction.client.clearCache();
  } catch (o) {
    return e.dispatch({ type: "FAILED", error: String(o?.message || o) }), !1;
  }
  for (const o of [At, Ft, Pt]) {
    const r = Yt(e.node, o);
    r && (r.value = "");
  }
  return e.node.setDirtyCanvas?.(!0, !0), e.overlay.clear(), e.diagnostics.clear(), e.result = { raw: null, refined: null }, e.sourceKey = "", e.state = Lt(), e.reconstruction?.dispatch({ type: "RESET" }), e.render(), e.refreshSource(), !0;
}
async function Jt(e, t, o) {
  const r = await e.fetchApi("/majoor/omnicam/extractor/refine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_solve: t, settings: o })
  });
  if (!r.ok) {
    let a = `refine failed (${r.status})`;
    try {
      a = await r.text() || a;
    } catch {
    }
    throw new Error(a);
  }
  return r.json();
}
async function Zt(e, { selectElement: t = null, statusElement: o = null, checkpointSelectElement: r = null } = {}) {
  const a = await e.capabilities(), n = Array.isArray(a?.providers) ? a.providers : [], i = a?.recommended_provider || (n[0]?.provider_id ?? "");
  if (t) {
    typeof t.replaceChildren == "function" ? t.replaceChildren() : Array.isArray(t.options) && (t.options.length = 0);
    for (const c of n) {
      let u;
      typeof document < "u" && typeof document.createElement == "function" ? u = document.createElement("option") : u = { value: "", textContent: "", disabled: !1 }, u.value = c.provider_id, u.textContent = c.available ? c.name || c.provider_id : `${c.name || c.provider_id} (Unavailable)`, u.disabled = !c.available, typeof t.appendChild == "function" ? t.appendChild(u) : Array.isArray(t.options) && t.options.push(u);
    }
    i && (t.value = i);
  }
  const s = t?.value || i, l = n.find((c) => c.provider_id === s);
  if (r) {
    typeof r.replaceChildren == "function" ? r.replaceChildren() : Array.isArray(r.options) && (r.options.length = 0);
    const c = (d, b) => {
      let h;
      return typeof document < "u" && typeof document.createElement == "function" ? h = document.createElement("option") : h = { value: "", textContent: "" }, h.value = d, h.textContent = b, h;
    }, u = (d) => {
      typeof r.appendChild == "function" ? r.appendChild(d) : Array.isArray(r.options) && r.options.push(d);
    };
    u(c("auto", "Auto"));
    const m = Array.isArray(l?.metadata?.checkpoints) ? l.metadata.checkpoints : [];
    for (const d of m)
      u(c(d, d));
    r.value = "auto";
  }
  return o && (l && !l.available ? (o.textContent = l.reason || "Provider unavailable", o.hidden = !1) : (o.textContent = "", o.hidden = !0)), {
    capabilities: a,
    recommended: i,
    providers: n
  };
}
const te = {
  fast: { triangle_budget: 4e4, discontinuity_threshold: 0.06 },
  balanced: { triangle_budget: 12e4, discontinuity_threshold: 0.04 },
  high: { triangle_budget: 25e4, discontinuity_threshold: 0.03 }
};
function z(e, t) {
  if (!e) return;
  const o = e.querySelector('[data-role="reconstruction-triangle-budget"]'), r = e.querySelector('[data-role="reconstruction-edge-threshold"]'), a = te[t];
  o && (o.disabled = !!a, a && (o.value = String(a.triangle_budget))), r && (r.disabled = !!a, a && (r.value = String(a.discontinuity_threshold)));
}
const ee = { geometry: "depth_mesh", layout: "depth_mesh" }, ct = /* @__PURE__ */ new Set(["blockout", "hybrid", "scan"]), oe = /* @__PURE__ */ new Set(["vggt", "vggt_omega_research"]);
function lt(e) {
  if (!e) return {};
  const t = (u) => e.querySelector(`[data-role="${u}"]`)?.value, o = (u) => !!e.querySelector(`[data-role="${u}"]`)?.checked, r = t("reconstruction-mode") || "depth_mesh";
  let a = ee[r] || r;
  const n = t("reconstruction-provider") || "";
  oe.has(n) && (a = "scan");
  const i = n || (a === "scan" ? "vggt" : "comfy_moge"), s = String(t("reconstruction-semantic-labels") || "").split(/[\n,]/).map((u) => u.trim()).filter(Boolean), l = t("reconstruction-checkpoint") || "auto", c = {
    provider: i,
    mode: a,
    quality: t("reconstruction-quality") || "balanced",
    checkpoint: l,
    // Scan geometry (VGGT) reads vggt_checkpoint, not the generic `checkpoint`
    // field; forward the same value so a chosen VGGT weight is actually used.
    ...a === "scan" ? { vggt_checkpoint: l } : {},
    recover_fov: o("reconstruction-recover-fov"),
    source_texture: o("reconstruction-source-texture"),
    detect_ground: o("reconstruction-detect-ground"),
    detect_walls: o("reconstruction-detect-walls"),
    triangle_budget: Number(t("reconstruction-triangle-budget")) || 12e4,
    // The backend field is discontinuity_threshold (ReconstructionSettings);
    // "edge_threshold" is only the DOM role name.
    discontinuity_threshold: Number(t("reconstruction-edge-threshold")) || 0.04,
    scene_scale: Number(t("reconstruction-scene-scale")) || 1
  };
  return ct.has(a) && (c.segmentation_provider = t("reconstruction-segmentation") || "comfy_sam3", c.completion_policy = t("reconstruction-completion-policy") || "off", c.completion_provider = c.completion_policy === "off" ? "none" : "sam3d_objects", c.max_blockout_objects = Number(t("reconstruction-max-objects")) || 24, c.blockout_assets = t("reconstruction-blockout-assets") || "off", s.length && (c.semantic_labels = s)), c;
}
function P(e) {
  if (!e) return;
  const t = lt(e).mode, o = ct.has(t);
  for (const r of ["reconstruction-semantic-row", "reconstruction-labels-row"]) {
    const a = e.querySelector(`[data-role="${r}"]`);
    a && (a.hidden = !o);
  }
}
function re(e, {
  onRun: t = () => {
  },
  onStop: o = () => {
  },
  onOpenDirector: r = () => {
  },
  onSettingsChange: a = () => {
  },
  on: n = (i, s, l) => i?.addEventListener?.(s, l)
} = {}) {
  if (!e) return () => {
  };
  const i = [], s = (h, f, g) => {
    n(h, f, g), i.push(() => h?.removeEventListener?.(f, g));
  }, l = [
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
  ], c = () => {
    P(e);
    const h = lt(e);
    a(h);
  };
  for (const h of l) {
    const f = e.querySelector(`[data-role="${h}"]`);
    if (!f) continue;
    const g = f.tagName === "SELECT" || f.type === "checkbox" ? "change" : "input";
    s(f, g, c);
  }
  const u = e.querySelector('[data-role="reconstruction-quality"]');
  u && s(u, "change", () => {
    z(e, u.value), c();
  }), z(e, u?.value), P(e);
  const m = e.querySelector('[data-role="reconstruction-run"]');
  m && s(m, "click", t);
  const d = e.querySelector('[data-role="reconstruction-stop"]');
  d && s(d, "click", o);
  const b = e.querySelector('[data-role="reconstruction-open-director"]');
  return b && s(b, "click", r), () => {
    for (const h of i.splice(0)) h();
  };
}
async function ae(e) {
  try {
    const t = await e.text();
    if (!t) return `Request failed (${e.status})`;
    try {
      const o = JSON.parse(t);
      if (o?.error?.message)
        return o.error.code ? `[${o.error.code}] ${o.error.message}` : o.error.message;
      if (o?.message) return o.message;
    } catch {
    }
    return t;
  } catch {
    return `Request failed (${e.status})`;
  }
}
class ne {
  constructor(t) {
    this.api = t;
  }
  async _request(t, { method: o = "GET", signal: r } = {}) {
    const a = { method: o };
    r && (a.signal = r);
    const n = await this.api.fetchApi(t, a);
    if (!n.ok) throw new Error(await ae(n));
    return n.json();
  }
  /** Aggregated provider capabilities (which geometry / segmentation backends exist). */
  capabilities(t = {}) {
    return this._request("/majoor/omnicam/reconstruction/capabilities", t);
  }
  /** Delete every cached reconstruction (manifests, GLBs, source images) from disk. */
  clearCache() {
    return this._request("/majoor/omnicam/reconstruction/cache", { method: "DELETE" });
  }
  /** Delete one reconstruction's cache folder by fingerprint so a re-run recomputes it. */
  deleteCacheEntry(t) {
    const o = encodeURIComponent(String(t || ""));
    return this._request(`/majoor/omnicam/reconstruction/cache/${o}`, { method: "DELETE" });
  }
}
const ie = /* @__PURE__ */ new Set([
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
function se() {
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
function dt() {
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
    settings: se()
  };
}
function ce(e) {
  const t = e?.jobState || "IDLE", o = ie.has(t), r = e?.source, a = !!(r && (typeof r == "string" || r.available || r.value || r.ref || r.info || r.kind)), n = !o && t !== "STOPPING" && a, i = o, s = !!(e?.result && (e.result.motion_scene || e.result.objects || e.result.version));
  return {
    canStart: n,
    canStop: i,
    canOpenDirector: t === "DONE" && s,
    canPreview: s,
    // Discard a result you don't want (deletes its cached files so a re-run
    // recomputes). Never mid-job.
    canDiscard: s && !o && t !== "STOPPING"
  };
}
function le(e, t) {
  switch (t.type) {
    case "SOURCE":
      return { ...e, source: t.source };
    case "SETTINGS":
      return {
        ...e,
        settings: { ...e.settings, ...t.settings }
      };
    case "STATE":
      return {
        ...e,
        jobState: t.jobState,
        jobId: t.jobId ?? e.jobId,
        progress: t.progress ?? e.progress,
        stage: t.stage ?? e.stage,
        stageProgress: t.stageProgress ?? e.stageProgress,
        error: t.jobState === "PREPARING" ? null : e.error
      };
    case "PROGRESS":
      return {
        ...e,
        progress: t.progress ?? e.progress,
        stage: t.stage ?? e.stage,
        stageProgress: t.stageProgress ?? e.stageProgress
      };
    case "PREVIEW":
      return {
        ...e,
        previewUrl: t.previewUrl ?? ""
      };
    case "DONE":
      return {
        ...e,
        jobState: "DONE",
        jobId: t.jobId ?? e.jobId,
        // Progress is a 0..1 fraction throughout, matching the server.
        progress: 1,
        result: t.result,
        summary: t.summary ?? t.result?.summary ?? null,
        warnings: t.warnings ?? t.result?.warnings ?? [],
        // Kept so "Discard" can delete exactly this reconstruction's cache
        // folder. The envelope carries it at the top level; a bare MotionScene
        // carries it under metadata.reconstruction.
        fingerprint: t.fingerprint || t.result?.fingerprint || t.result?.motion_scene?.metadata?.reconstruction?.fingerprint || t.result?.metadata?.reconstruction?.fingerprint || e.fingerprint || ""
      };
    case "ERROR":
      return {
        ...e,
        jobState: "FAILED",
        error: t.error
      };
    case "RESET":
      return {
        ...dt(),
        source: e.source,
        settings: e.settings
      };
    default:
      return e;
  }
}
const ut = [
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
function ht(e, t, o) {
  const r = e?.widgets?.find((a) => a.name === t);
  return r ? r.value : o;
}
function O(e, t, o) {
  const r = e?.widgets?.find((a) => a.name === t);
  return !r || r.value === o ? !1 : (r.value = o, e.setDirtyCanvas?.(!0, !0), !0);
}
function pt(e, t) {
  return e?.querySelector?.(`[data-role="${t}"]`) || null;
}
function Q(e, t) {
  if (!(!e || !t))
    for (const o of ut) {
      const r = pt(t, o.role);
      if (!r) continue;
      const a = ht(e, o.widget, void 0);
      a != null && (o.kind === "boolean" ? r.checked = !!a : r.value = String(a));
    }
}
function F(e, t) {
  if (!e || !t) return !1;
  let o = !1;
  for (const a of ut) {
    const n = pt(t, a.role);
    if (!n) continue;
    if (a.kind === "boolean") {
      o = O(e, a.widget, !!n.checked) || o;
      continue;
    }
    const i = n.value;
    i === "" || i == null || (o = O(e, a.widget, a.kind === "number" ? Number(i) : i) || o);
  }
  const r = ht(e, "recon_completion_policy", "off");
  return o = O(e, "recon_completion_provider", r === "off" ? "none" : "sam3d_objects") || o, o;
}
function D(e) {
  return Math.round(Math.min(1, Math.max(0, e?.progress || 0)) * 100);
}
function de(e, t) {
  if (!e) return;
  const o = ce(t), r = e.querySelector('[data-role="reconstruction-run"]');
  r && (r.disabled = !o.canStart);
  const a = e.querySelector('[data-role="reconstruction-stop"]');
  a && (a.disabled = !o.canStop);
  const n = e.querySelector('[data-role="reconstruction-open-director"]');
  n && (n.disabled = !o.canOpenDirector);
  const i = e.querySelector('[data-role="reconstruction-preview-toggle"]');
  i && (i.disabled = !o.canPreview);
  const s = e.querySelector('[data-role="reconstruction-discard"]');
  s && (s.disabled = !o.canDiscard);
  const l = e.querySelector('[data-role="reconstruction-progress"]');
  l && (l.style.width = `${D(t)}%`);
  const c = e.querySelector('[data-role="reconstruction-stage"]');
  if (c)
    if (t?.error) {
      const d = t.error?.message || t.error?.code || String(t.error);
      c.textContent = d, c.dataset.state = "error";
    } else t?.stage ? (c.textContent = `${t.stage} (${D(t)}%)`, c.dataset.state = "active") : t?.jobState && t.jobState !== "IDLE" ? (c.textContent = `${t.jobState} (${D(t)}%)`, c.dataset.state = t.jobState === "DONE" ? "ok" : "active") : (c.textContent = p("Ready to reconstruct"), c.dataset.state = "idle");
  const u = e.querySelector('[data-role="reconstruction-summary"]');
  if (u)
    if (t?.summary) {
      u.hidden = !1;
      const d = t.summary, b = d.triangle_count != null ? d.triangle_count : d.mesh_triangles, h = b != null ? Number(b).toLocaleString() : null, f = d.camera_fov_x != null ? d.camera_fov_x : d.camera_fov, g = f != null ? Number(f).toFixed(1) : null, w = Number(d.ground_confidence) > 0 ? p("ground plane detected") : null, x = [];
      h && x.push(`${h} ${p("triangles")}`), g && x.push(`FOV ${g}°`), w && x.push(w), u.textContent = x.join(" • ");
    } else
      u.hidden = !0, u.textContent = "";
  const m = e.querySelector('[data-role="reconstruction-warnings"]');
  if (m) {
    const d = t?.warnings || [];
    if (d.length > 0) {
      m.hidden = !1, m.replaceChildren();
      for (const b of d) {
        const h = document.createElement("div");
        h.className = "oc-warning-item", h.textContent = `⚠ ${b}`, m.appendChild(h);
      }
    } else
      m.hidden = !0, m.replaceChildren();
  }
}
class ue {
  constructor({
    root: t,
    node: o,
    api: r,
    app: a = null,
    getSource: n = () => null,
    onAdopt: i = () => {
    },
    onQueue: s = () => {
    },
    onCancel: l = () => {
    },
    on: c = (u, m, d) => u?.addEventListener?.(m, d)
  }) {
    this.root = t, this.node = o, this.api = r, this.app = a, this.getSource = n, this.onAdopt = i, this.onQueue = s, this.onCancel = l, this.on = c, this.client = new ne(r), this.runGeneration = 0, this.state = dt();
    const u = this.getSource();
    u && (this.state.source = u), this.unbindControls = re(this.root, {
      onRun: () => this.run(),
      onStop: () => this.stop(),
      onOpenDirector: () => this.openDirector(),
      onSettingsChange: (h) => {
        F(this.node, this.root), this.dispatch({ type: "SETTINGS", settings: h });
      },
      on: this.on
    }), this.syncFromWidgets(), F(this.node, this.root), this.preview = null, this.previewLoad = null, this.previewOpen = !1;
    const m = this.root?.querySelector?.('[data-role="reconstruction-preview-toggle"]');
    m && this.on(m, "click", () => this.togglePreview());
    const d = this.root?.querySelector?.('[data-role="reconstruction-preview-fit"]');
    d && this.on(d, "click", () => this.preview?.fit());
    const b = this.root?.querySelector?.('[data-role="reconstruction-discard"]');
    b && this.on(b, "click", () => {
      b.disabled = !0, Promise.resolve(this.discard()).finally(() => this.render());
    }), this.initCapabilities(), this.render();
  }
  /** The reconstructed MotionScene currently in `state.result`, or null. */
  currentScene() {
    const t = this.state.result;
    return t ? t.motion_scene || t : null;
  }
  async ensurePreview() {
    return this.preview || this.disposed ? this.preview : (this.previewLoad ||= import("./chunk-CbkV1cb8.js").then(({ TrackViewer: t }) => {
      if (this.disposed || this.preview) return this.preview;
      const o = this.root.querySelector('[data-role="reconstruction-3d"]');
      return this.preview = o ? new t(o) : null, this.preview;
    }).catch((t) => (console.warn("OmniCam reconstruction 3D preview unavailable", t), null)).finally(() => {
      this.previewLoad = null;
    }), this.previewLoad);
  }
  pushSceneToPreview() {
    const t = this.currentScene();
    !this.preview || !t || (this.preview.setReconstructedScene(t, {
      resolveAssetUrl: (o) => rt(this.api, o)
    }), this.preview.resize(), this.preview.fit());
  }
  async togglePreview() {
    this.previewOpen = !this.previewOpen;
    const t = this.root.querySelector('[data-role="reconstruction-preview"]');
    t && (t.hidden = !this.previewOpen);
    const o = this.root.querySelector('[data-role="reconstruction-preview-toggle"]');
    o && o.setAttribute("aria-pressed", String(this.previewOpen)), this.previewOpen && (await this.ensurePreview(), !this.disposed && this.pushSceneToPreview());
  }
  /** Re-read the node widgets into the panel DOM (mount + workflow reload). */
  syncFromWidgets() {
    Q(this.node, this.root), P(this.root), this.render();
  }
  async initCapabilities() {
    try {
      const t = this.root.querySelector('[data-role="reconstruction-provider"]'), o = this.root.querySelector('[data-role="reconstruction-stage"]'), r = this.root.querySelector('[data-role="reconstruction-checkpoint"]');
      if (await Zt(this.client, {
        selectElement: t,
        statusElement: o,
        checkpointSelectElement: r
      }), this.disposed) return;
      Q(this.node, this.root), P(this.root), this.render();
    } catch {
    }
  }
  setSource(t) {
    this.dispatch({ type: "SOURCE", source: t });
  }
  dispatch(t) {
    if (this.disposed) return;
    const o = this.state.result;
    this.state = le(this.state, t), this.render(), this.previewOpen && this.preview && this.state.result && this.state.result !== o && this.pushSceneToPreview();
  }
  render() {
    de(this.root, this.state);
  }
  async run() {
    !(this.state.source || this.getSource()) || this.disposed || (this.runGeneration += 1, F(this.node, this.root), this.dispatch({ type: "STATE", jobState: "PREPARING" }), await this.onQueue());
  }
  /**
   * Adopt a scene_reconstruct result that arrived through the Extractor's
   * queued executed() envelope (parseExtractorMessage). The
   * reconstruction-specific detail rides in `reconstruction`.
   */
  acceptQueuedResult(t) {
    if (this.disposed) return;
    this.runGeneration += 1;
    const o = t.reconstruction || {};
    this.dispatch({
      type: "DONE",
      jobId: "",
      result: t.motionScene,
      // The panel renders triangle_count / camera_fov_x etc. off the pipeline
      // summary; fall back to the flatter reconstruction block if absent.
      summary: o.summary || o,
      warnings: o.warnings || [],
      fingerprint: t.fingerprint
    });
  }
  async stop() {
    this.runGeneration += 1, this.dispatch({ type: "STATE", jobState: "STOPPING" }), await this.onCancel();
  }
  openDirector() {
    if (!this.disposed && this.state.result) {
      const t = this.state.result.motion_scene || this.state.result;
      this.onAdopt(t);
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
    if (!this.state.result || !await at(
      this,
      p("Discard reconstruction"),
      p("Removes this reconstruction and its cached files so the next run recomputes it. The camera track and other reconstructions are left untouched.")
    ) || this.disposed) return !1;
    const o = String(this.state.fingerprint || "");
    if (o)
      try {
        if (await this.client.deleteCacheEntry(o), this.disposed) return !1;
      } catch (a) {
        return this.dispatch({ type: "ERROR", error: { message: a.message } }), !1;
      }
    this.previewOpen && await this.togglePreview(), this.dispatch({ type: "RESET" });
    const r = this.node.__majoorOmniCamExtractorRuntime;
    return r && (r.reconstructionResult = null), !0;
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.runGeneration += 1, this.unbindControls?.(), this.unbindControls = null, this.preview?.dispose(), this.preview = null);
  }
}
const he = [
  "normalize_origin",
  "motion_scale",
  "position_smoothing",
  "rotation_smoothing",
  "simplify_keys",
  "position_tolerance",
  "rotation_tolerance_deg"
];
function pe(e, t) {
  return e?.widgets?.find((o) => o.name === t) || null;
}
function K(e, t, o) {
  const r = pe(e, t);
  return !r || r.value === o ? !1 : (r.value = o, e?.setDirtyCanvas?.(!0, !0), !0);
}
function me({ node: e, root: t, mode: o, refineSettings: r }) {
  let a = K(e, "extract_mode", o);
  if (o === "scene_reconstruct")
    return F(e, t) || a;
  for (const n of he)
    r?.[n] !== void 0 && (a = K(e, n, r[n]) || a);
  return a;
}
const fe = {
  "subgraph-not-supported": "OmniCam TRACK does not support an Extractor inside a subgraph yet. Move it to the root graph, or run the whole workflow with Queue Prompt.",
  "no-execution-id": "This Extractor has no resolvable node id and cannot be queued.",
  "submission-busy": "ComfyUI is still sending another prompt. Press TRACK again in a moment."
};
async function be(e, t = "camera_track") {
  try {
    const o = await It(e, t), r = fe[o?.reason];
    r && e.dispatch({ type: "FAILED", error: r });
  } catch (o) {
    e.dispatch({ type: "FAILED", error: String(o?.message || o) });
  }
}
function ge(e) {
  me({
    node: e.node,
    root: e.root,
    mode: e.extractMode,
    refineSettings: e.refine.settings
  });
}
function ve(e) {
  e.sourceViewer.setFollow(!0), e.overlay.clear(), e.diagnostics.clear(), e.queuePromptId = "", e.dispatch({ type: "JOB_STARTED", status: { job_id: "", state: "QUEUED" } }), e.coordinator.seek(0, "backend");
}
async function ye(e) {
  const t = String(e.queuePromptId || "");
  if (t) {
    e.dispatch({ type: "QUEUE_LIFECYCLE", state: "CANCELLING" });
    try {
      await st(e.api, t);
    } catch (o) {
      e.dispatch({
        type: "QUEUE_LIFECYCLE",
        state: "FAILED",
        error: String(o?.message || o)
      });
    }
  }
}
const xe = 200, Y = {
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
function q() {
  return { pitch: 0, yaw: 0, roll: 0 };
}
class we {
  constructor({ onRefine: t, delay: o = xe, setTimer: r, clearTimer: a } = {}) {
    this.settings = { ...Y }, this.alignment = q(), this.onRefine = t || (() => {
    }), this.delay = o, this.setTimer = r || ((n, i) => setTimeout(n, i)), this.clearTimer = a || ((n) => clearTimeout(n)), this.timer = null, this.lastSent = "";
  }
  /** Merge a change and schedule a refine. Returns the merged settings. */
  update(t) {
    return this.settings = { ...this.settings, ...t }, this.schedule(), this.settings;
  }
  setAlignment(t) {
    return this.alignment = { ...this.alignment, ...t }, this.update({
      global_rotation_xyzw: ke(this.alignment),
      estimate_up: !1
    });
  }
  /** Ask the server to derive the levelling rotation from the solve itself. */
  requestEstimatedUp() {
    return this.alignment = q(), this.update({ global_rotation_xyzw: null, estimate_up: !0 });
  }
  setSpikeAction(t, o) {
    const r = { ...this.settings.spike_actions };
    return o === "ignore" ? delete r[String(t)] : r[String(t)] = o, this.update({ spike_actions: r });
  }
  reset() {
    return this.settings = { ...Y }, this.alignment = q(), this.schedule(), this.settings;
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
function ke({ pitch: e = 0, yaw: t = 0, roll: o = 0 } = {}) {
  if (!e && !t && !o) return null;
  const [r, a, n] = [e, t, o].map((d) => (Number(d) || 0) * (Math.PI / 180) * 0.5), [i, s, l, c, u, m] = [
    Math.cos(r),
    Math.sin(r),
    Math.cos(a),
    Math.sin(a),
    Math.cos(n),
    Math.sin(n)
  ];
  return [
    s * l * u + i * c * m,
    i * c * u - s * l * m,
    i * l * m + s * c * u,
    i * l * u - s * c * m
  ];
}
class Se {
  constructor({ maxFrames: t = 180 } = {}) {
    this.maxFrames = Math.max(1, Math.floor(Number(t) || 180)), this.frames = /* @__PURE__ */ new Map();
  }
  set(t, { points: o = [], vectors: r = [], state: a = "unknown" } = {}) {
    const n = Math.max(0, Math.floor(Number(t) || 0)), i = {
      frame: n,
      points: Array.isArray(o) ? o : [],
      vectors: Array.isArray(r) ? r : [],
      state: String(a || "unknown")
    };
    for (this.frames.delete(n), this.frames.set(n, i); this.frames.size > this.maxFrames; ) this.frames.delete(this.frames.keys().next().value);
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
function Ee(e, t) {
  const o = Math.max(0, Math.floor(Number(t) || 0) - 1);
  return Math.max(0, Math.min(o, Math.round(Number(e) || 0)));
}
function _e(e) {
  return ["manual", "transport", "timeline", "quality", "input"].includes(e);
}
class Ce {
  constructor({
    media: t = null,
    getViewer: o = () => null,
    showDiagnostics: r = () => {
    },
    dispatch: a = () => {
    },
    setFollow: n = () => {
    },
    onPlaybackState: i = () => {
    },
    frameCount: s = 0,
    fps: l = 24,
    loop: c = !1,
    // Closures, not .bind(globalThis): the receiver is what matters here and a
    // closure states it directly instead of through a partial application.
    requestAnimationFrame: u = (d) => globalThis.requestAnimationFrame?.(d),
    cancelAnimationFrame: m = (d) => globalThis.cancelAnimationFrame?.(d)
  } = {}) {
    this.media = t, this.getViewer = o, this.showDiagnostics = r, this.dispatch = a, this.setFollow = n, this.onPlaybackState = i, this.frameCount = Math.max(0, Math.floor(Number(s) || 0)), this.fps = Math.max(1, Number(l) || 24), this.loop = !!c, this.frame = 0, this.playing = !1, this.disposed = !1, this.animationFrame = null, this.playbackStartFrame = 0, this.playbackStartTime = null, this.requestAnimationFrame = u || (() => null), this.cancelAnimationFrame = m || (() => {
    });
  }
  setFrameCount(t) {
    const o = Math.max(0, Math.floor(Number(t) || 0));
    return o === this.frameCount ? this.frameCount : (this.frameCount = o, this.media?.setFrameCount?.(this.frameCount), this.dispatch({ type: "FRAME_COUNT", frameCount: this.frameCount }), this.frameCount || this.pause(), this.frameCount);
  }
  reconcileFrameCount(t) {
    const o = Number(t?.frame_count);
    return this.setFrameCount(Number.isFinite(o) ? o : this.frameCount);
  }
  setRate(t) {
    return this.fps = Math.max(1, Number(t) || 24), this.media?.setRate?.(this.fps), this.fps;
  }
  setLoop(t) {
    return this.loop = !!t, this.media?.setLoop?.(this.loop), this.loop;
  }
  seek(t, o = "manual") {
    if (this.disposed) return this.frame;
    const r = Ee(t, this.frameCount);
    return _e(o) && this.setFollow(!1), o !== "media" && this.media?.seekFrame?.(r), this.getViewer?.()?.setFrame?.(r), this.showDiagnostics(r), this.frame = r, this.dispatch({ type: "FRAME", frame: r }), o !== "playback" && (this.playbackStartFrame = r, this.playbackStartTime = null), r;
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
    const o = Number(t) || 0;
    this.playbackStartTime === null && (this.playbackStartTime = o);
    const r = Math.max(0, o - this.playbackStartTime), a = Math.floor(r * this.fps / 1e3), n = this.frameCount;
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
class R extends Error {
}
function Me(e, { track: t, state: o } = {}) {
  if (o !== "COMPLETED")
    throw new R("Only a completed solve can be applied to the Director.");
  const r = t?.keyframes;
  if (!Array.isArray(r) || !r.length)
    throw new R("This solve produced no camera keys to apply.");
  const a = String(t?.metadata?.extractor_fingerprint || "");
  if (!a)
    throw new R("This track carries no extractor fingerprint.");
  const n = nt(t);
  if (!n)
    throw new R("This solve cannot be wrapped in a canonical motion scene.");
  it(e, {
    motionScene: n,
    fingerprint: a,
    solver_coverage: Number(t?.metadata?.solver_coverage ?? t?.metadata?.confidence) || 0
  });
  const i = Rt(e);
  return { fingerprint: a, notified: i };
}
function Te(e, t = "") {
  const o = Number(e?.code) || 0, r = t ? "" : " (no source URL was set)";
  switch (o) {
    case 1:
      return `Loading the footage was aborted${r}.`;
    case 2:
      return "The footage could not be fetched from ComfyUI. Is the file still in the input folder?";
    case 3:
      return "The browser could not decode this file. The solve can still read it -- this only affects the preview. Re-encode to H.264 MP4 to preview it here.";
    case 4:
      return "The browser cannot play this container or codec (H.265, ProRes and most AVI variants are common causes). The solve can still read it; only the preview is affected.";
    default:
      return `The footage could not be played${r}.`;
  }
}
class Re extends Et {
  constructor(t, {
    fps: o = 24,
    onFrame: r = () => {
    },
    onMetadata: a = () => {
    },
    onError: n = () => {
    },
    onMode: i = () => {
    },
    fallbackViewer: s = null
  } = {}) {
    super(t, {
      fps: o,
      durationFrames: 1,
      onFrame: (l) => this.reportFrame(l),
      onMetadata: a,
      onError: (l) => this.handleMediaError(l),
      errorMessage: Te,
      loop: !0,
      muted: !0
    }), this.frameCount = 0, this.onExternalFrame = r, this.ignoredFrame = null, this.follow = !0, this.mode = "native", this.source = null, this.onMode = i, this.fallbackViewer = s, this.onPlaybackError = n;
  }
  setSource(t, { source: o, ...r } = {}) {
    const a = o || null, n = this.source?.kind !== a?.kind || this.source?.value !== a?.value, i = super.setSource(t, r);
    return i || n ? (this.source = a, this.fallbackViewer?.clear?.(), this.setMode("native")) : a && (this.source = a), i;
  }
  setMode(t) {
    const o = ["native", "fallback", "error"].includes(t) ? t : "error";
    return this.mode === o ? !1 : (this.mode = o, this.onMode(o), !0);
  }
  setRate(t) {
    return this.fps = Math.max(1, Number(t) || 24), this.fps;
  }
  setFrameCount(t) {
    return this.frameCount = Math.max(0, Math.round(Number(t) || 0)), this.durationFrames = Math.max(1, this.frameCount), this.frameCount;
  }
  handleMediaError(t) {
    const o = Number(this.video?.error?.code) || 0;
    if ((o === 2 || o === 3 || o === 4) && this.fallbackViewer && this.source) {
      this.setMode("fallback"), this.loadFallback(this.currentFrame(), t);
      return;
    }
    this.setMode("error"), this.onPlaybackError(t);
  }
  async loadFallback(t, o = "") {
    try {
      return await this.fallbackViewer.load(this.source, t) ? (this.error = "", this.setMode("fallback"), !0) : !1;
    } catch (r) {
      return this.setMode("error"), this.onPlaybackError(`${o} Fallback preview failed: ${String(r?.message || r)}`), !1;
    }
  }
  /** Apply the coordinator's frame to whichever preview mode is active. */
  seekFrame(t) {
    const o = Math.max(0, Number(t) || 0);
    return this.mode === "fallback" ? (this.loadFallback(o), !0) : (this.ignoredFrame = o, super.seekFrame(o));
  }
  reportFrame(t) {
    const o = Math.max(0, Number(t) || 0);
    if (this.ignoredFrame === o) {
      this.ignoredFrame = null;
      return;
    }
    this.onExternalFrame(o);
  }
  /** A user gesture: seek, and stop following the solver until re-enabled. */
  scrubTo(t) {
    this.setFollow(!1);
    const o = Math.max(0, Number(t) || 0);
    this.seekFrame(o), this.onExternalFrame(o);
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
function X(e, t) {
  const o = Math.max(1, Number(t) || 24), r = Math.max(0, Number(e) || 0), a = Math.floor(r / o), n = (i, s = 2) => String(i).padStart(s, "0");
  return `${n(Math.floor(a / 60))}:${n(a % 60)}:${n(r % o)}`;
}
const Ne = "/majoor/omnicam/extractor/frame";
function $e(e) {
  return Math.max(0, Math.round(Number(e) || 0));
}
function $(e, t, o = 0) {
  const r = Number(e?.get?.(t));
  return Number.isFinite(r) && r > 0 ? Math.round(r) : o;
}
async function Ae(e) {
  try {
    return await e?.text?.() || `Preview frame request failed (${e?.status || "unknown"})`;
  } catch {
    return `Preview frame request failed (${e?.status || "unknown"})`;
  }
}
function Fe(e) {
  return e?.name === "AbortError";
}
function Pe(e, t, o = t?.width, r = t?.height) {
  const a = e?.getContext?.("2d"), n = Math.max(1, Number(t?.width) || 1), i = Math.max(1, Number(t?.height) || 1), s = Math.max(1, Math.round(Number(o) || n)), l = Math.max(1, Math.round(Number(r) || i));
  if (!a) return !1;
  e.width !== s && (e.width = s), e.height !== l && (e.height = l);
  const c = Math.min(s / n, l / i), u = Math.round(n * c), m = Math.round(i * c);
  return a.clearRect(0, 0, s, l), a.drawImage(t, Math.round((s - u) / 2), Math.round((l - m) / 2), u, m), !0;
}
class Le {
  constructor(t, { api: o, decodeImage: r = (a) => globalThis.createImageBitmap(a) } = {}) {
    this.canvas = t, this.api = o, this.decodeImage = r, this.abortController = null, this.generation = 0, this.frame = 0, this.frameCount = 0, this.error = "";
  }
  abort() {
    this.abortController?.abort(), this.abortController = null;
  }
  /** Fetch, decode, and paint a single managed video frame. */
  async load(t, o, { maxDimension: r = 960 } = {}) {
    this.abort();
    const a = ++this.generation, n = new AbortController();
    this.abortController = n;
    const i = $e(o);
    try {
      const s = await this.api?.fetchApi?.(Ne, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: t, frame: i, max_dimension: r }),
        signal: n.signal
      });
      if (!s?.ok) throw new Error(await Ae(s));
      const l = await s.blob(), c = await this.decodeImage(l);
      if (a !== this.generation || n.signal.aborted)
        return c?.close?.(), !1;
      const u = $(s.headers, "X-OmniCam-Width", c?.width), m = $(s.headers, "X-OmniCam-Height", c?.height);
      let d = !1;
      try {
        d = Pe(this.canvas, c, u, m);
      } finally {
        c?.close?.();
      }
      if (!d) throw new Error("The fallback preview canvas is unavailable.");
      return this.frame = $(s.headers, "X-OmniCam-Frame", i), this.frameCount = $(s.headers, "X-OmniCam-Frame-Count", this.frameCount), this.error = "", !0;
    } catch (s) {
      if (a !== this.generation || n.signal.aborted || Fe(s)) return !1;
      throw this.error = String(s?.message || s), s;
    } finally {
      a === this.generation && (this.abortController = null);
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
async function Ie(e) {
  const t = await T.fetchApi("/majoor/omnicam/extractor/source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: e })
  });
  if (!t.ok)
    throw new Error(`OmniCam: could not describe the source (${t.status})`);
  return t.json();
}
function Oe(e) {
  const t = e.extractMode || "camera_track", o = Ot(e.node, e.node.graph, t), r = o.ref ? `${o.ref.kind}:${o.ref.value}` : "", a = r !== (e.sourceKey || "");
  a && (e.sourceKey = r, e.describing = "", e.queuePromptId && st(e.api, e.queuePromptId).catch(() => {
  }), e.dispatch({ type: "SOURCE_RESET", source: { ...o, playbackError: "" } }), e.coordinator.setRate(24), e.coordinator.setFrameCount(0));
  const n = e.sourceViewer.setSource(
    o.available && o.ref ? rt(T, o.ref.value) : "",
    { source: o.available ? o.ref : null }
  );
  return a && e.coordinator.seek(0, "source"), e.dispatch({ type: "SOURCE", source: n ? { ...o, playbackError: "" } : o }), t !== "scene_reconstruct" && (o.available && o.ref ? mt(e, o) : W(e, 0)), Kt(e, o), o;
}
async function mt(e, t) {
  if (e.describing === t.ref?.value) return null;
  e.describing = t.ref?.value;
  try {
    const o = await Ie(t.ref);
    if (e.disposed || e.sourceKey !== `${t.ref.kind}:${t.ref.value}`) return null;
    const r = o?.info || null;
    return e.dispatch({ type: "SOURCE", source: { info: r } }), r && (e.coordinator.setRate(Number(r.fps) || e.sourceViewer.fps), W(e, Number(r.frame_count) || 0), Qt(e, r)), r;
  } catch (o) {
    return console.warn("[OmniCam] could not describe the extractor source", o), null;
  }
}
function W(e, t) {
  const o = Math.max(0, Math.round(Number(t) || 0));
  e.coordinator.setFrameCount(o), o !== e.state.frameCount && (e.dispatch({ type: "FRAME_COUNT", frameCount: o }), e.coordinator.seek(e.coordinator.frame, "source"));
}
const De = `${wt}${Nt}
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
function E(e, t, { min: o = 0, max: r = 1, step: a = 0.01, value: n = 0 } = {}) {
  return `<label for="oc-${e}">${t}</label>
    <input id="oc-${e}" data-role="${e}" type="range" min="${o}" max="${r}" step="${a}" value="${n}">
    <output data-role="${e}-out"></output>`;
}
function qe() {
  return `<div class="majoor-omnicam oc-extractor">
    <style>${De}</style>
    <header class="oc-header">
      ${kt("OmniCam Extractor")}
      <span class="oc-status-pill" data-role="solve-status" data-tone="neutral"><i class="oc-status-dot"></i><span data-role="solve-status-text">IDLE</span></span>
    </header>

    <div class="oc-mode-bar" aria-label="Extractor mode">
      <button type="button" class="oc-tab" data-role="extract-mode-camera" aria-selected="true">${p("Camera Track")}</button>
      <button type="button" class="oc-tab" data-role="extract-mode-reconstruct" aria-selected="false">${p("Scene Reconstruct")}</button>
      <button type="button" class="icon-button oc-clear-cache" data-role="clear-cache" title="${p("Clear cached tracks and reconstructions, and reset this node")}"><i class="pi pi-trash"></i></button>
    </div>

    <div class="oc-source" data-role="source-strip" data-available="false">
      <span class="oc-source-label" data-role="source-label">Connect a VIDEO input to track.</span>
    </div>

    <div class="oc-card oc-reconstruction-panel" data-role="reconstruction-panel" hidden>
      <div class="oc-section">${p("Scene Reconstruction")}</div>
      <div class="oc-rows">
        <div class="oc-inline">
          <label for="oc-recon-provider">${p("Provider")}</label>
          <select id="oc-recon-provider" data-role="reconstruction-provider"></select>
          <label for="oc-recon-mode">${p("Result")}</label>
          <select id="oc-recon-mode" data-role="reconstruction-mode">
            <option value="depth_mesh">${p("Depth Mesh")}</option>
            <option value="blockout">${p("Blockout")}</option>
            <option value="hybrid">${p("Hybrid")}</option>
            <option value="scan">${p("Scan")}</option>
          </select>
          <label for="oc-recon-quality">${p("Quality")}</label>
          <select id="oc-recon-quality" data-role="reconstruction-quality">
            <option value="fast">${p("Fast")}</option>
            <option value="balanced" selected>${p("Balanced")}</option>
            <option value="high">${p("High")}</option>
            <option value="custom">${p("Custom")}</option>
          </select>
        </div>
        <div class="oc-inline">
          <label for="oc-recon-checkpoint">${p("Geometry Model")}</label>
          <select id="oc-recon-checkpoint" data-role="reconstruction-checkpoint">
            <option value="auto" selected>${p("Auto")}</option>
          </select>
        </div>
        <div class="oc-inline" data-role="reconstruction-semantic-row">
          <label for="oc-recon-segmentation">${p("Objects")}</label>
          <select id="oc-recon-segmentation" data-role="reconstruction-segmentation">
            <option value="comfy_sam3" selected>${p("SAM3")}</option>
            <option value="none">${p("None")}</option>
          </select>
          <label for="oc-recon-max-objects">${p("Max objects")}</label>
          <input id="oc-recon-max-objects" data-role="reconstruction-max-objects" type="number" min="1" max="128" step="1" value="24">
          <label for="oc-recon-completion">${p("Completion")}</label>
          <select id="oc-recon-completion" data-role="reconstruction-completion-policy">
            <option value="off" selected>${p("Off")}</option>
            <option value="low_depth_confidence">${p("Low confidence")}</option>
            <option value="selected">${p("Selected")}</option>
            <option value="all_bounded">${p("All bounded")}</option>
          </select>
        </div>
        <div class="oc-inline" data-role="reconstruction-labels-row">
          <label for="oc-recon-labels">${p("Labels")}</label>
          <input id="oc-recon-labels" data-role="reconstruction-semantic-labels" type="text" placeholder="${p("Default interior taxonomy")}" />
          <label for="oc-recon-assets">${p("3D assets")}</label>
          <select id="oc-recon-assets" data-role="reconstruction-blockout-assets" title="${p("Swap fitted boxes for GLB props from the asset library")}">
            <option value="off" selected>${p("Boxes only")}</option>
            <option value="proxy">${p("Add props")}</option>
            <option value="replace">${p("Replace boxes")}</option>
          </select>
        </div>
        <div class="oc-inline">
          <label class="oc-inline"><input data-role="reconstruction-recover-fov" type="checkbox" checked> ${p("Recover FOV")}</label>
          <label class="oc-inline"><input data-role="reconstruction-source-texture" type="checkbox" checked> ${p("Source Texture")}</label>
          <label class="oc-inline"><input data-role="reconstruction-detect-ground" type="checkbox" checked> ${p("Detect Ground")}</label>
          <label class="oc-inline"><input data-role="reconstruction-detect-walls" type="checkbox"> ${p("Detect Walls")}</label>
        </div>
        <div class="oc-inline">
          <label for="oc-recon-triangle-budget">${p("Triangle Budget")}</label>
          <input id="oc-recon-triangle-budget" data-role="reconstruction-triangle-budget" type="number" min="1000" max="500000" step="5000" value="120000">
          <label for="oc-recon-edge-threshold">${p("Edge Threshold")}</label>
          <input id="oc-recon-edge-threshold" data-role="reconstruction-edge-threshold" type="number" min="0.01" max="1" step="0.01" value="0.04">
          <label for="oc-recon-scene-scale">${p("Scene Scale")}</label>
          <input id="oc-recon-scene-scale" data-role="reconstruction-scene-scale" type="number" min="0.01" max="100" step="0.1" value="1.0">
        </div>
        <div class="oc-progress"><i data-role="reconstruction-progress" style="width:0%"></i></div>
        <div data-role="reconstruction-stage" class="oc-stage-label"></div>
        <div data-role="reconstruction-summary" class="oc-summary-box" hidden></div>
        <div data-role="reconstruction-warnings" class="oc-warnings-box" hidden></div>
        <div class="oc-recon-preview" data-role="reconstruction-preview" hidden>
          <div class="oc-recon-preview-bar">
            <button type="button" data-role="reconstruction-preview-fit" title="${p("Frame the reconstructed scene")}"><i class="pi pi-search"></i> ${p("Fit")}</button>
          </div>
          <canvas data-role="reconstruction-3d" width="960" height="540" aria-label="${p("3D preview of the reconstructed scene")}"></canvas>
        </div>
        <div class="oc-actions">
          <button type="button" class="oc-primary" data-role="reconstruction-run">${p("▶ RECONSTRUCT")}</button>
          <button type="button" data-role="reconstruction-stop" disabled>${p("■ STOP")}</button>
          <button type="button" data-role="reconstruction-discard" title="${p("Discard this reconstruction and its cached files so the next run recomputes it")}" disabled>${p("✕ DISCARD")}</button>
          <button type="button" data-role="reconstruction-preview-toggle" disabled>${p("3D PREVIEW")}</button>
          <button type="button" class="oc-primary" data-role="reconstruction-open-director" disabled>${p("OPEN IN DIRECTOR")}</button>
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
function je(e = document) {
  const t = e.createElement("div");
  return t.innerHTML = qe(), t.firstElementChild;
}
const ft = {
  good: "#46a758",
  weak: "#e5a23c",
  bad: "#e5484d",
  unknown: "#3a3a48"
};
function G(e) {
  if (!e) return "unknown";
  const t = String(e.state || "").toLowerCase();
  if (ft[t]) return t;
  const o = Number(e.coverage);
  return Number.isFinite(o) ? o >= 0.7 ? "good" : o >= 0.35 ? "weak" : "bad" : "unknown";
}
function Ve(e, t) {
  const o = (e || []).find((a) => Number(a.frame) === Number(t)), r = [["Frame", String(t)]];
  return o ? (r.push(["Tracking state", G(o).toUpperCase()]), Number.isFinite(Number(o.coverage)) && r.push(["Coverage", `${Math.round(Number(o.coverage) * 100)}%`]), o.inliers != null && r.push(["Inliers", String(o.inliers)]), r) : (r.push(["Tracking state", "UNKNOWN"]), r);
}
const Ue = {
  position: "#8b7bd8",
  target: "#e5a23c",
  roll: "#e2649a"
}, I = [
  { key: "position", label: "Camera" },
  { key: "target", label: "Look At" },
  { key: "roll", label: "Roll" }
], Be = 18, We = 9, J = 2, bt = 78, Ge = { solve: "SOLVE HEALTH" }, L = {
  bands: ["solve"],
  labels: !0,
  labelWidth: bt,
  bandHeight: We,
  bandGap: J,
  laneTopGap: J + 2,
  laneHeight: Be,
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
function gt(e = I, t = L) {
  const o = { ...L, ...t }, r = [];
  let a = o.topPad;
  for (const n of o.bands || [])
    r.length && (a += o.bandGap), r.push({
      kind: "band",
      key: n,
      label: Ge[n] || String(n).toUpperCase(),
      top: a,
      height: o.bandHeight
    }), a += o.bandHeight;
  for (const n of e)
    r.length && (a += r[r.length - 1].kind === "band" ? o.laneTopGap : o.laneGap), r.push({ kind: "lane", key: n.key, label: n.label, top: a, height: o.laneHeight }), a += o.laneHeight;
  return { rows: r, style: o, height: a + o.bottomPad };
}
function He(e = I, t = L) {
  return gt(e, t).height;
}
function ze(e, t) {
  if (!e) return null;
  if (t === "position" || t === "target") {
    const r = e[t];
    return Array.isArray(r) ? r.map(Number) : null;
  }
  const o = Number(e.roll);
  return Number.isFinite(o) ? [o] : null;
}
function Qe(e, t, o = 1e-4) {
  return !e || !t || e.length !== t.length ? !1 : e.every((r, a) => Math.abs(r - t[a]) <= o);
}
function vt(e, t = I) {
  const o = Array.isArray(e?.keyframes) ? e.keyframes : [], r = {};
  for (const { key: a } of t) {
    const n = [];
    let i = null;
    for (const s of o) {
      const l = ze(s?.camera, a);
      l && ((i === null || !Qe(l, i)) && n.push(Number(s.frame) || 0), i = l);
    }
    r[a] = n;
  }
  return r;
}
function Ke(e, t = null, o = "generic") {
  if (!e?.keyframes?.length || !t) return null;
  try {
    const a = Array.isArray(e.objects) && e.objects.some((n) => n?.id === "subject" && Array.isArray(n.position)) ? t : { ...t, allow_framing_loss: !0 };
    return Ct(e, a, null, o);
  } catch {
    return null;
  }
}
function Ye(e, t, o, r = bt) {
  const a = Math.max(1, Number(o) || 0), n = Math.max(1, (Number(t) || 1) - r), i = Math.max(0, Math.min(1, (Number(e) - r) / n));
  return Math.max(0, Math.min(a - 1, Math.round(i * (a - 1))));
}
function yt(e, t) {
  return Math.max(1, (Number(e) || 1) - t.labelWidth - (t.labelWidth ? 4 : 0));
}
function _(e, t, o, r) {
  const a = Math.max(1, (Number(o) || 1) - 1), n = yt(t, r);
  return r.labelWidth + Math.max(0, Math.min(a, e)) / a * n;
}
function Xe(e, t) {
  const o = Math.max(0, Number(t) - 1);
  return (e || []).map((r) => {
    const a = Math.max(0, Math.min(o, Number(r?.start_frame ?? r?.frame) || 0)), n = Math.max(a, Math.min(o, Number(r?.end_frame ?? r?.frame) || a));
    return { start: a, end: n, level: r?.level === "error" ? "error" : "warn" };
  });
}
function Je(e, t, o, r, a, n) {
  for (const i of t) {
    const s = _(i.start, r, a, n), l = _(i.end, r, a, n), c = Math.max(2, l - s + 2);
    e.fillStyle = "#101014", e.fillRect(Math.round(s - 1), o.top + 2, Math.ceil(c + 2), o.height - 4), e.fillStyle = i.level === "error" ? "#ffffff" : "#f2c66d", e.fillRect(Math.round(s), o.top + 3, Math.ceil(c), o.height - 6);
  }
}
function Ze(e, { y: t, height: o, width: r, frameCount: a, colorAt: n, style: i }) {
  const s = Math.max(1, Number(a) || 0), l = yt(r, i), c = Math.max(1, Math.ceil(s / l)), u = Math.max(1, l / Math.ceil(s / c));
  for (let m = 0; m < s; m += c) {
    const d = n(m, Math.min(s, m + c));
    d && (e.fillStyle = d, e.fillRect(i.labelWidth + m / s * l, t, u, o));
  }
}
function to(e, t, o, r) {
  const a = new Map((e || []).map((i) => [Number(i.frame), i]));
  let n = "unknown";
  for (let i = Math.max(0, Number(o) || 0); i < Math.max(0, Number(r) || 0); i += 1) {
    const s = G(a.get(i)), l = String((t || [])[i] || "").toLowerCase(), c = l === "over" ? "bad" : l === "warn" ? "weak" : l === "ok" ? "good" : "unknown";
    A(s) > A(n) && (n = s), A(c) > A(n) && (n = c);
  }
  return n;
}
function eo(e, t, o) {
  const r = Number(o) || 0, a = (e || []).find((s) => Number(s.frame) === r), n = String(t?.frame_grades?.[r] || "unknown").toUpperCase(), i = [["Solve state", G(a).toUpperCase()], ["Motion grade", n]];
  a && Number.isFinite(Number(a.coverage)) && i.push(["Coverage", `${Math.round(Number(a.coverage) * 100)}%`]), a?.inliers != null && i.push(["Inliers", String(a.inliers)]);
  for (const s of ["speed", "angular_speed", "acceleration", "jerk"]) {
    const l = Number(t?.series?.[s]?.[r]), c = Number(t?.limits?.[`max_${s}`]);
    Number.isFinite(l) && i.push([s.replace("_", " "), Number.isFinite(c) ? `${l.toFixed(2)} / ${c}` : l.toFixed(2)]);
  }
  return t?.framing?.[r] === !1 && !t?.limits?.allow_framing_loss && i.push(["Framing", "LOSS"]), i;
}
function oo(e, t, o, r) {
  e.fillStyle = r, e.font = "9px system-ui, sans-serif", e.textBaseline = "middle", e.fillText(t, 2, o);
}
function ro(e, t, o, r, a, n) {
  const i = Math.max(0, Math.min(n, r / 2, a / 2));
  e.beginPath(), e.moveTo(t + i, o), e.arcTo(t + r, o, t + r, o + a, i), e.arcTo(t + r, o + a, t, o + a, i), e.arcTo(t, o + a, t, o, i), e.arcTo(t, o, t + r, o, i), e.closePath();
}
function ao(e, { row: t, width: o, style: r }) {
  const a = r.labelWidth, n = Math.max(2, o - a);
  ro(e, a + 0.5, t.top + 0.5, n - 1, t.height - 1, 6), e.fillStyle = "#20202a", e.fill(), e.strokeStyle = "#26262f", e.lineWidth = 1, e.stroke(), t.kind === "lane" && (e.fillStyle = "#2c2c38", e.fillRect(a + 1, Math.round(t.top + t.height / 2), n - 2, 1));
}
function no(e, {
  track: t = null,
  health: o = null,
  quality: r = [],
  anomalies: a = [],
  frame: n = 0,
  frameCount: i = 0,
  channels: s = I,
  layout: l = L
} = {}) {
  const c = Math.max(1, Number(i) || Number(t?.duration_frames) || 1), u = vt(t, s), { rows: m, style: d } = gt(s, l), b = {
    total: c,
    labelWidth: d.labelWidth,
    lanes: m.filter((v) => v.kind === "lane").map((v) => ({
      key: v.key,
      top: v.top,
      bottom: v.top + v.height,
      keys: u[v.key] || []
    })),
    anomalies: Xe(a, c)
  }, h = e?.getContext?.("2d"), f = e?.width || 0, g = e?.height || 0;
  if (!h || !f || !g) return { ...b, keys: u };
  h.clearRect(0, 0, f, g);
  const w = Array.isArray(o?.frame_grades) ? o.frame_grades : [], x = {
    solve: (v, y) => ft[to(r, w, v, y)]
  };
  for (const v of m) {
    d.rowChrome && ao(h, { row: v, width: f, style: d });
    const y = v.top + v.height / 2;
    if (d.labels && oo(h, v.label, y, "#9a9aad"), v.kind === "band") {
      const N = x[v.key];
      if (!N) continue;
      const S = d.rowChrome ? 2 : 0;
      Ze(h, {
        y: v.top + S,
        height: v.height - S * 2,
        width: f,
        frameCount: c,
        colorAt: N,
        style: d
      }), v.key === "solve" && Je(h, b.anomalies, v, f, c, d);
      continue;
    }
    const k = u[v.key] || [];
    k.length > 1 && !d.rowChrome && (h.strokeStyle = "#2c2c38", h.lineWidth = 1, h.beginPath(), h.moveTo(_(k[0], f, c, d), y), h.lineTo(_(k[k.length - 1], f, c, d), y), h.stroke()), h.fillStyle = Ue[v.key] || "#8b7bd8";
    const C = d.rowChrome ? 5.5 : 3.5;
    for (const N of k) {
      const S = Math.max(
        d.labelWidth + C,
        Math.min(f - C, _(N, f, c, d))
      );
      h.beginPath(), h.moveTo(S, y - C), h.lineTo(S + C, y), h.lineTo(S, y + C), h.lineTo(S - C, y), h.closePath(), h.fill();
    }
  }
  if (d.ruler) {
    h.fillStyle = "#3a3a48";
    const v = Math.min(12, c);
    for (let y = 0; y <= v; y += 1) {
      const k = Math.round(y / Math.max(1, v) * (c - 1));
      h.fillRect(_(k, f, c, d), g - 6, 1, 5);
    }
  }
  if (d.playhead) {
    const v = _(Math.max(0, Math.min(c - 1, Number(n) || 0)), f, c, d);
    h.fillStyle = "#e6e6f0", h.fillRect(Math.round(v), 0, 1, g);
  }
  return { ...b, keys: u };
}
function A(e) {
  return { unknown: 0, good: 1, weak: 2, bad: 3 }[e] ?? 0;
}
class io {
  /**
   * @param root the panel root, queried for its own `data-role` elements
   * @param onSeek called with a frame when the user scrubs the strip
   */
  constructor(t, { onSeek: o = () => {
  } } = {}) {
    this.root = t, this.onSeek = o, this.scrubbing = !1;
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
  render({ track: t = null, health: o = null, quality: r = [], anomalies: a = [], frame: n = 0, frameCount: i = 0 } = {}) {
    const s = this.$("track-timeline");
    if (!s) return null;
    const l = He(void 0, Z);
    return s.height !== l && (s.height = l), no(s, {
      track: t,
      health: o,
      quality: r,
      anomalies: a,
      frame: n,
      layout: Z,
      frameCount: Math.max(Number(i) || 0, Number(t?.duration_frames) || 0)
    });
  }
  /** Which frame a pointer event over the strip refers to, or null. */
  frameAt(t, o) {
    const r = this.$("extractor-dope-tracks");
    if (!r?.getBoundingClientRect) return null;
    const a = r.getBoundingClientRect();
    return Ye(t.clientX - a.left, a.width, o, 0);
  }
  /** Wire scrubbing. `on` is the panel's own EventScope binder. */
  bind(t, o) {
    const r = this.$("extractor-dope-tracks");
    t(r, "pointerdown", (a) => {
      r.setPointerCapture?.(a.pointerId), this.scrubbing = !0, this.pointerId = a.pointerId, this.seek(a, o());
    }), t(r, "pointermove", (a) => {
      this.scrubbing && a.pointerId === this.pointerId && this.seek(a, o());
    });
    for (const a of ["pointerup", "pointercancel"])
      t(r, a, (n) => {
        n.pointerId === this.pointerId && (r.releasePointerCapture?.(n.pointerId), this.scrubbing = !1, this.pointerId = null);
      });
  }
  seek(t, o) {
    const r = this.frameAt(t, o);
    return r !== null && this.onSeek(r), r;
  }
}
const so = [
  "first-frame",
  "previous-key",
  "previous-frame",
  "play",
  "next-frame",
  "next-key",
  "last-frame",
  "toggle-loop"
], co = {
  "first-frame": '[data-act="first-frame"]',
  "previous-key": '[data-act="previous-key"]',
  "previous-frame": '[data-act="previous-frame"]',
  play: '[data-act="play"]',
  "next-frame": '[data-act="next-frame"]',
  "next-key": '[data-act="next-key"]',
  "last-frame": '[data-act="last-frame"]',
  "toggle-loop": '[data-act="toggle-loop"]'
};
function j(e) {
  return [...new Set((e || []).map((t) => Number(typeof t == "object" ? t?.frame : t)).filter(Number.isFinite).map((t) => Math.max(0, Math.round(t))))].sort((t, o) => t - o);
}
function lo(e, t) {
  const o = j(e?.anomalies), r = j(Object.values(vt(t)).flat()), a = r.length ? r : j(t?.keyframes);
  return { anomalies: o, solved: a };
}
function V(e, t, { anomalies: o, solved: r }) {
  const a = t > 0 ? (i) => i > e : (i) => i < e, n = (i) => {
    const s = i.filter(a);
    return t > 0 ? s[0] : s.at(-1);
  };
  return n(o) ?? n(r) ?? null;
}
function uo(e) {
  const t = String(e?.tagName || "").toLowerCase();
  return e?.isContentEditable || t === "textarea" || t === "select" ? !0 : t === "input" && ["text", "number"].includes(String(e.type || "text").toLowerCase());
}
function U(e) {
  return Math.max(0, Math.round(Number(e?.frameCount) || 0));
}
function ho(e, {
  coordinator: t,
  getState: o = () => ({}),
  getTrack: r = () => null,
  on: a = (n, i, s) => n?.addEventListener?.(i, s)
} = {}) {
  const n = (d) => e?.querySelector?.(co[d]) || null, i = () => o() || {}, s = () => lo(i(), r()), l = (d) => U(i()) < 1 ? !1 : (t?.seek?.(d, "transport"), !0), c = (d) => {
    const b = V(Number(i().frame) || 0, d, s());
    return b === null ? !1 : l(b);
  }, u = {
    "first-frame": () => l(0),
    "previous-key": () => c(-1),
    "previous-frame": () => l((Number(i().frame) || 0) - 1),
    play: () => U(i()) > 0 && !!t?.toggle?.(),
    "next-frame": () => l((Number(i().frame) || 0) + 1),
    "next-key": () => c(1),
    "last-frame": () => l(U(i()) - 1),
    "toggle-loop": () => (t?.setLoop?.(!t?.loop), m(), !0)
  };
  for (const d of so) {
    const b = n(d);
    b && a(b, "click", () => u[d]());
  }
  a(e, "keydown", (d) => {
    if (uo(d.target)) return;
    const b = {
      " ": "play",
      Spacebar: "play",
      Space: "play",
      ArrowLeft: "previous-frame",
      ArrowRight: "next-frame",
      Home: "first-frame",
      End: "last-frame"
    }[d.key];
    !b || !u[b]() || (d.preventDefault(), d.stopPropagation());
  });
  function m() {
    const d = Number(i().frame) || 0, b = s(), h = n("previous-key");
    h && (h.disabled = V(d, -1, b) === null);
    const f = n("next-key");
    f && (f.disabled = V(d, 1, b) === null);
    const g = n("toggle-loop");
    g && g.setAttribute("aria-pressed", String(!!t?.loop));
    const w = n("play");
    if (w) {
      w.classList?.toggle?.("playing", !!t?.playing);
      const x = w.querySelector?.("i");
      x && (x.className = t?.playing ? "pi pi-pause" : "pi pi-play"), w.setAttribute("aria-label", t?.playing ? "Pause playback" : "Play playback");
    }
  }
  return { render: m };
}
const po = 300, mo = 300, M = {
  accepted: "#46a758",
  weak: "#e5a23c",
  rejected: "#e5484d",
  current: "#8b7bd8"
};
function tt(e, t) {
  const o = Array.isArray(e) ? e : [];
  if (o.length <= t) return o.slice();
  const r = o.length / t, a = [];
  for (let n = 0; n < t; n += 1) a.push(o[Math.floor(n * r)]);
  return a;
}
function B(e, { sourceWidth: t, sourceHeight: o, width: r, height: a }) {
  const n = Number(e?.x ?? e?.[0]) || 0, i = Number(e?.y ?? e?.[1]) || 0, s = n <= 1 && i <= 1 && n >= 0 && i >= 0, l = s ? r : r / Math.max(1, t || r), c = s ? a : a / Math.max(1, o || a);
  return [n * l, i * c];
}
class fo {
  constructor(t) {
    this.canvas = t, this.points = [], this.vectors = [], this.frame = 0, this.state = "unknown";
  }
  setDiagnostics({ points: t = [], vectors: o = [], frame: r = 0, state: a = "unknown" } = {}) {
    this.points = tt(t, po), this.vectors = tt(o, mo), this.frame = Number(r) || 0, this.state = String(a || "unknown"), this.draw();
  }
  clear() {
    this.points = [], this.vectors = [];
    const t = this.canvas?.getContext?.("2d");
    t && t.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  draw({ sourceWidth: t = 0, sourceHeight: o = 0 } = {}) {
    const r = this.canvas?.getContext?.("2d"), a = this.canvas?.width || 0, n = this.canvas?.height || 0;
    if (!r || !a || !n) return { points: this.points.length, vectors: this.vectors.length };
    const i = { sourceWidth: t, sourceHeight: o, width: a, height: n };
    r.clearRect(0, 0, a, n), r.lineWidth = 1;
    for (const s of this.vectors) {
      const [l, c] = B(s.from ?? s, i), [u, m] = B(s.to ?? s, i);
      r.strokeStyle = M[s.state] || M.accepted, r.beginPath(), r.moveTo(l, c), r.lineTo(u, m), r.stroke();
    }
    for (const s of this.points) {
      const [l, c] = B(s, i);
      r.fillStyle = M[s.state] || M.accepted, r.fillRect(l - 1.5, c - 1.5, 3, 3);
    }
    return (this.state === "weak" || this.state === "bad") && (r.strokeStyle = this.state === "bad" ? M.rejected : M.weak, r.lineWidth = 2, r.strokeRect(1, 1, a - 2, n - 2)), { points: this.points.length, vectors: this.vectors.length };
  }
  dispose() {
    this.clear(), this.canvas = null;
  }
}
function bo(e, t, o) {
  const r = e.createElement("div");
  r.className = "oc-row";
  const a = e.createElement("span");
  a.textContent = t;
  const n = e.createElement("span");
  return n.textContent = o, r.append(a, n), r;
}
function go(e, t, o = "Nothing to show") {
  if (!e) return 0;
  const r = e.ownerDocument;
  if (e.replaceChildren(), !t.length) {
    const a = r.createElement("div");
    return a.className = "oc-empty", a.textContent = o, e.append(a), 0;
  }
  for (const [a, n] of t) e.append(bo(r, a, n));
  return t.length;
}
function vo(e, t, { onAction: o = () => {
}, onFrame: r = () => {
}, actions: a = {} } = {}) {
  if (!e) return 0;
  const n = e.ownerDocument;
  if (e.replaceChildren(), !t?.length) {
    const i = n.createElement("div");
    return i.className = "oc-empty", i.textContent = "No anomalies detected", e.append(i), 0;
  }
  for (const i of t) {
    const s = n.createElement("div");
    s.className = "oc-anomaly", s.dataset.level = String(i.level || "warn");
    const l = n.createElement("div");
    l.className = "oc-anomaly-text";
    const c = n.createElement("strong"), u = Number(i.start_frame ?? i.frame), m = Number(i.end_frame ?? i.frame);
    c.textContent = u === m ? `Frame ${u}` : `Frames ${u}-${m}`, c.tabIndex = 0, c.setAttribute("role", "button"), c.addEventListener("click", () => r(i.frame)), c.addEventListener("keydown", (h) => {
      (h.key === "Enter" || h.key === " ") && (h.preventDefault(), r(i.frame));
    });
    const d = n.createElement("small");
    d.textContent = `${String(i.level || "warn").toUpperCase()} · ${i.detail || i.kind || ""}`, l.append(c, d), s.append(l);
    const b = a[String(i.frame)] || i.suggested_action || "ignore";
    for (const h of ["interpolate", "ignore", "exclude"]) {
      const f = n.createElement("button");
      f.type = "button", f.textContent = h.toUpperCase(), f.dataset.action = h, f.dataset.frame = String(i.frame), h === b && f.setAttribute("aria-selected", "true"), f.addEventListener("click", () => o(i, h)), s.append(f);
    }
    e.append(s);
  }
  return t.length;
}
function yo(e) {
  return (e || []).map((t, o) => [`Note ${o + 1}`, String(t)]);
}
function xo(e) {
  return import("./chunk-CbkV1cb8.js").then(({ TrackViewer: t }) => (e.viewerLoad = null, e.disposed || e.viewer || (e.viewer = new t(e.$("track-canvas")), e.pushTracksToViewer()), e.viewer)).catch((t) => (e.viewerLoad = null, console.warn("OmniCam track viewer unavailable", t), null));
}
function et(e) {
  const t = e.$("frame");
  t && (t.value = String(e.state.frame));
  const o = e.$("time");
  o && (o.textContent = X(e.state.frame, e.sourceViewer.fps));
  const r = e.$("frame-readout");
  r && (r.textContent = `${e.state.frame} / ${Math.max(0, e.state.frameCount - 1)} · ${X(e.state.frame, e.sourceViewer.fps)}`);
  const a = Ve(e.state.quality, e.state.frame), n = eo(e.state.quality, e.currentHealth, e.state.frame);
  go(e.$("quality-details"), [...a, ...n, ...yo(e.state.warnings)], "No solve yet");
}
function ot(e) {
  const t = e.$("extractor-ruler"), o = e.$("extractor-playhead"), r = Math.max(1, e.state.frameCount);
  if (!t || !o) return;
  const a = Math.min(12, r - 1 || 1);
  t.replaceChildren();
  for (let n = 0; n <= a; n += 1) {
    const i = Math.round(n / a * (r - 1)), s = `${n / a * 100}%`, l = t.ownerDocument.createElement("i");
    if (l.className = `oc-tick${n % 2 === 0 ? " major" : ""}`, l.style.left = s, t.append(l), n % 2 === 0) {
      const c = t.ownerDocument.createElement("span");
      c.className = "timeline-tick", c.style.left = s, c.textContent = String(i), t.append(c);
    }
  }
  o.style.left = `${Math.max(0, Math.min(r - 1, e.state.frame)) / Math.max(1, r - 1) * 100}%`;
}
function wo(e, t) {
  return e?.widgets?.find((o) => o.name === t) || null;
}
const ko = [
  "state",
  "extractMode",
  "queuePromptId",
  "result",
  "rawSolve",
  "landmarks",
  "sourceKey"
];
class xt {
  // `runtime` is the persistent ExtractorRuntime this workbench renders.
  constructor(t) {
    this.runtime = t;
    const o = t.node;
    this.node = o, this.app = H, this.api = T, this.root = je(), this.disposed = !1, this.events = new _t(), this.requests = new Gt(), this.diagnostics = new Se(), this.upstreamPreviewActive = !1, this.motionLimits = null, this.refine = new we({ onRefine: (i) => this.requestRefine(i) }), this.fallbackViewer = new Le(this.$("fallback-preview"), { api: T }), this.sourceViewer = new Re(this.$("source-video"), {
      onFrame: (i) => this.coordinator.seek(i, "media"),
      onMetadata: ({ frameCount: i }) => this.adoptSourceLength(i),
      onError: (i) => this.dispatch({ type: "SOURCE", source: { playbackError: i } }),
      onMode: () => this.render(),
      fallbackViewer: this.fallbackViewer
    }), this.coordinator = new Ce({
      media: this.sourceViewer,
      getViewer: () => this.viewer,
      showDiagnostics: (i) => this.showDiagnostics(i),
      dispatch: (i) => this.dispatch(i),
      setFollow: (i) => this.sourceViewer.setFollow(i),
      frameCount: this.state.frameCount,
      fps: this.sourceViewer.fps,
      loop: !0,
      onPlaybackState: () => this.transport?.render()
    }), this.timeline = new io(this.root, {
      onSeek: (i) => this.coordinator.seek(i, "timeline")
    }), this.transport = ho(this.root, {
      coordinator: this.coordinator,
      getState: () => this.state,
      getTrack: () => this.state.trackMode === "raw" ? this.result.raw : this.result.refined,
      on: (i, s, l) => this.events.on(i, s, l)
    }), this.overlay = new fo(this.$("tracking-overlay")), this.viewer = null, this.viewerLoad = null, this.reconstruction = new ue({
      root: this.root,
      node: this.node,
      api: T,
      app: H,
      getSource: () => this.state.source?.ref || null,
      onAdopt: (i) => $t(this.node, i),
      // Scene Reconstruction Start / Stop run through the same partial queue as
      // Camera TRACK; the panel no longer owns a job manager.
      onQueue: () => this.startSolve("scene_reconstruct"),
      onCancel: () => this.cancelQueuedRun(),
      on: (i, s, l) => this.events.on(i, s, l)
    });
    const r = this.$("extract-mode-camera"), a = this.$("extract-mode-reconstruct");
    r && this.events.on(r, "click", () => this.setExtractMode("camera_track")), a && this.events.on(a, "click", () => this.setExtractMode("scene_reconstruct")), this.setExtractMode(this.extractMode);
    const n = this.$("clear-cache");
    n && this.events.on(n, "click", () => {
      n.disabled = !0, Promise.resolve().then(() => this.clearCache()).catch((i) => this.dispatch({ type: "FAILED", error: String(i?.message || i) })).finally(() => {
        n.disabled = !1;
      });
    }), this.bindControls(), this.loadMotionLimits(), this.refreshSource(), this.render();
  }
  // -- plumbing ----------------------------------------------------------
  $(t) {
    return this.root.querySelector(`[data-role="${t}"]`);
  }
  // Delegates to the runtime so a headless observer (the compact shell's
  // statechange listener) is notified the same way whether the mutation came
  // from an interactive control here or from a queue event while closed.
  // ExtractorRuntime.dispatch() calls this.render() back via workbench?.render().
  dispatch(t) {
    return this.runtime.dispatch(t);
  }
  async loadMotionLimits() {
    try {
      const t = await this.requests.run(async (o) => {
        const r = await T.fetchApi?.("/majoor/omnicam/motion_profiles", { signal: o });
        return r?.ok ? r.json() : void 0;
      });
      if (t === void 0) return;
      this.motionLimits = t?.profiles?.find((o) => o.id === "generic")?.limits || null, this.disposed || this.render();
    } catch {
    }
  }
  bindControls() {
    this.events.on(this.root, "wheel", St(this.root));
    for (const t of this.root.querySelectorAll("[data-tab]"))
      this.events.on(t, "click", () => this.setViewerMode(t.dataset.tab));
    for (const t of this.root.querySelectorAll("[data-track-mode]"))
      this.events.on(t, "click", () => this.setTrackMode(t.dataset.trackMode));
    for (const t of this.root.querySelectorAll("[data-view]"))
      this.events.on(t, "click", () => this.viewer?.setView(t.dataset.view));
    for (const t of this.root.querySelectorAll("[data-inspection-view]"))
      this.events.on(t, "click", () => {
        const o = this.viewer?.setInspectionView(t.dataset.inspectionView) || "scene";
        for (const r of this.root.querySelectorAll("[data-inspection-view]"))
          r.setAttribute("aria-selected", String(r.dataset.inspectionView === o));
        for (const r of this.root.querySelectorAll("[data-view], [data-act='fit']"))
          r.disabled = o === "camera";
      });
    this.events.on(this.root.querySelector('[data-act="track"]'), "click", () => this.startSolve()), this.events.on(this.root.querySelector('[data-act="stop"]'), "click", () => this.cancelQueuedRun()), this.events.on(this.root.querySelector('[data-act="fit"]'), "click", () => this.viewer?.fit()), this.events.on(this.root.querySelector('[data-act="apply"]'), "click", () => this.applyRefined()), this.events.on(this.root.querySelector('[data-act="reset-refine"]'), "click", () => this.resetRefine()), this.events.on(this.$("scrubber"), "input", (t) => this.coordinator.seek(Number(t.target.value), "input")), this.events.on(this.$("frame"), "change", (t) => this.coordinator.seek(Number(t.target.value), "input")), this.events.on(this.$("follow-solve"), "change", (t) => this.sourceViewer.setFollow(t.target.checked)), this.timeline.bind(
      (t, o, r) => this.events.on(t, o, r),
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
    for (const [o, r] of Object.entries(t)) {
      const a = this.$(o);
      this.events.on(a, "input", () => {
        this.refine.update({ [r]: Number(a.value) }), this.renderRefineValues();
      });
    }
    for (const o of ["pitch", "yaw", "roll"]) {
      const r = this.$(`align-${o}`);
      this.events.on(r, "input", () => {
        this.refine.setAlignment({ [o]: Number(r.value) }), this.renderRefineValues();
      });
    }
    this.events.on(this.root.querySelector('[data-act="reset-alignment"]'), "click", () => {
      for (const o of ["pitch", "yaw", "roll"]) {
        const r = this.$(`align-${o}`);
        r && (r.value = "0");
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
      for (const o of ["trim-start", "trim-end"]) {
        const r = this.$(o);
        r && (r.value = "0");
      }
      this.refine.update({ trim_start_frame: 0, trim_end_frame: 0 });
    });
    for (const [o, r] of [["trim-start", "trim_start_frame"], ["trim-end", "trim_end_frame"]]) {
      const a = this.$(o);
      this.events.on(a, "change", () => this.refine.update({ [r]: Math.max(0, Number(a.value) || 0) }));
    }
    for (const [o, r] of [["normalize-origin", "normalize_origin"], ["simplify-keys", "simplify_keys"]]) {
      const a = this.$(o);
      this.events.on(a, "change", () => this.refine.update({ [r]: !!a.checked }));
    }
  }
  // -- source ------------------------------------------------------------
  refreshSource() {
    const t = Oe(this);
    return this.reconstruction && t && this.reconstruction.setSource(t.ref || t), t;
  }
  /**
   * Ask the server what this footage is, before anything is solved.
   *
   * Without it the panel knows a filename and nothing else: no rate, no frame
   * count, so the scrubber has no range and the strip has nothing to say.
   */
  async describeSource(t) {
    return mt(this, t);
  }
  /** Give the transport a real range, from the footage rather than a solve. */
  adoptSourceLength(t) {
    return W(this, t);
  }
  // -- solve control -----------------------------------------------------
  /**
   * Delete every cached reconstruction from disk and forget this node's own
   * cached results, in both modes: the camera-track scene/fingerprint/source
   * widgets (result-cache.js) and the reconstruction panel's job state.
   */
  async clearCache() {
    return Xt(this);
  }
  /** TRACK / Reconstruct Start -> a partial ComfyUI execution. See queue/ui-bridge.js. */
  startSolve(t = "camera_track") {
    return be(this, t);
  }
  /** STOP -> cancel this panel's ComfyUI job. Idempotent. */
  cancelQueuedRun() {
    return ye(this);
  }
  syncPanelToNodeWidgets() {
    return ge(this);
  }
  prepareForQueuedRun() {
    return ve(this);
  }
  /**
   * Adopt a solved track. Canonical state/cache handling lives on
   * ExtractorRuntime now (so it survives this workbench closing); the
   * runtime pushes the result into this workbench's 3D viewer itself when
   * one is attached (attachWorkbench/pushTracksToViewer), so this is a plain
   * delegation kept for existing call sites (e.g. clear-cache tests).
   */
  acceptSolvedResult(t) {
    return this.runtime.acceptSolvedResult(t);
  }
  /**
   * Re-derive the refined track from the raw solve when a cleanup slider moves.
   *
   * No queue, no re-solve: POST the raw solve + settings to the bounded refine
   * route and swap the result in. A no-op until a solve has produced a raw
   * solve this session (after a reload, press TRACK to refine again).
   */
  async requestRefine(t) {
    if (!this.rawSolve || this.state.solveState !== "COMPLETED") return null;
    try {
      const o = await Jt(this.api, this.rawSolve, t), r = o?.refined_track;
      if (!r?.keyframes?.length) return null;
      this.result = { ...this.result, refined: r };
      const a = String(o.fingerprint || "");
      return this.dispatch({ type: "REFINED", fingerprint: a }), this.pushTracksToViewer(), it(this.node, { motionScene: nt(r), fingerprint: a }), o;
    } catch (o) {
      return console.warn("[OmniCam] live refine failed", o), this.setStatus?.(String(o?.message || o)), null;
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
    const t = await this.refine.flush(), o = t?.resolved_alignment;
    if (!o) return null;
    const [r, a, n, i] = o.map(Number), s = (u) => Math.round(u * (180 / Math.PI) * 10) / 10, l = s(Math.atan2(2 * (i * r + a * n), 1 - 2 * (r * r + a * a))), c = s(Math.atan2(2 * (i * n + r * a), 1 - 2 * (a * a + n * n)));
    for (const [u, m] of [["pitch", l], ["yaw", 0], ["roll", c]]) {
      const d = this.$(`align-${u}`);
      d && (d.value = String(m));
    }
    return this.refine.alignment = { pitch: l, yaw: 0, roll: c }, this.renderRefineValues(), t;
  }
  resetRefine() {
    this.refine.reset();
    for (const [t, o] of [
      ["position-smoothing", 0.15],
      ["rotation-smoothing", 0.1],
      ["motion-scale", 1],
      ["position-tolerance", 0.01],
      ["align-pitch", 0],
      ["align-yaw", 0],
      ["align-roll", 0]
    ]) {
      const r = this.$(t);
      r && (r.value = String(o));
    }
    this.renderRefineValues();
  }
  setTrim(t, o) {
    const r = this.$(t);
    r && (r.value = String(this.state.frame)), this.refine.update({ [o]: this.state.frame });
  }
  applyRefined() {
    try {
      const { fingerprint: t } = Me(this.node, {
        track: this.result.refined,
        state: this.state.solveState
      });
      this.dispatch({ type: "APPLIED", fingerprint: t });
    } catch (t) {
      const o = t instanceof R ? t.message : String(t?.message || t);
      this.dispatch({ type: "FAILED", error: o });
    }
  }
  // -- viewer ------------------------------------------------------------
  ensureViewer() {
    return this.viewer || this.disposed ? Promise.resolve(this.viewer) : (this.viewerLoad ||= xo(this), this.viewerLoad);
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
    const o = this.diagnostics.get(t);
    o ? this.overlay.setDiagnostics(o) : this.overlay.clear();
  }
  // -- rendering ---------------------------------------------------------
  render() {
    const t = this.$("solve-status");
    t && (t.dataset.tone = Dt(this.state.solveState), this.$("solve-status-text").textContent = qt(this.state));
    const o = this.$("source-strip");
    o && (o.dataset.available = String(!!this.state.source.available), this.$("source-label").textContent = jt(this.state.source));
    const r = Vt(this.state);
    for (const [g, w] of Object.entries({
      track: r.track,
      stop: r.stop,
      apply: r.apply
    })) {
      const x = this.root.querySelector(`[data-act="${g}"]`);
      x && (x.disabled = !w);
    }
    this.$("solve-detail").textContent = Ut(this.state), this.$("solve-percent").textContent = `${Math.round(this.state.progress * 100)}%`, this.$("progress-bar").style.width = `${Math.round(this.state.progress * 100)}%`;
    const a = this.$("solve-error");
    a.hidden = !this.state.error, a.textContent = this.state.error || "";
    const n = Bt(this.state), i = this.$("applied-state");
    i.dataset.state = n, i.textContent = n;
    for (const g of this.root.querySelectorAll("[data-tab]"))
      g.setAttribute("aria-selected", String(g.dataset.tab === this.state.viewerMode));
    for (const g of this.root.querySelectorAll("[data-track-mode]"))
      g.setAttribute("aria-selected", String(g.dataset.trackMode === this.state.trackMode));
    const s = this.state.viewerMode, l = s === "source", c = s === "track3d", u = this.$("stage");
    u && (u.dataset.mode = s), zt(this, l), this.$("tracking-overlay").hidden = !0, this.$("track-canvas").hidden = !c, this.root.querySelector('[data-role="views"]').hidden = !c;
    const m = this.$("scrubber");
    m && (m.max = String(Math.max(0, this.state.frameCount - 1)));
    const d = this.$("frame");
    d && (d.max = String(Math.max(0, this.state.frameCount - 1)));
    const b = this.$("frame-total");
    b && (b.textContent = `/ ${Math.max(0, this.state.frameCount - 1)}`);
    const h = this.$("extractor-fps");
    h && (h.textContent = String(this.sourceViewer.fps || 24)), vo(this.$("anomalies"), this.state.anomalies, {
      actions: this.refine.settings.spike_actions,
      onFrame: (g) => this.coordinator.seek(g, "anomaly"),
      onAction: (g, w) => {
        const x = Number(g.start_frame ?? g.frame) || 0, v = Math.max(x, Number(g.end_frame ?? g.frame) || x);
        for (let y = x; y <= v; y += 1) this.refine.setSpikeAction(y, w);
        this.render();
      }
    }), this.renderTimeline(), this.transport.render(), et(this), ot(this);
    const f = this.$("stage-notice");
    if (f) {
      const g = this.state.source.playbackError || (this.upstreamPreviewActive ? "Preview only -- connect Load Video, or run the graph once, to track this source." : "");
      f.hidden = !g || !l, f.textContent = g;
    }
  }
  /**
   * The read-only solved camera channels, aligned to the source frame clock.
   */
  renderTimeline() {
    const t = this.state.trackMode === "raw" ? this.result.raw : this.result.refined;
    return this.currentHealth = Ke(t, this.motionLimits), this.timeline.render({
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
    ot(this);
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
      const o = this.$(t), r = this.$(`${t}-out`);
      o && r && (r.textContent = o.value);
    }
  }
  // -- lifecycle ---------------------------------------------------------
  // The runtime already restored the cache at construction; kept as a thin
  // delegation for any external caller (tests) still simulating an execution
  // through the workbench directly.
  executed(t) {
    return this.runtime.executed(t);
  }
  setExtractMode(t) {
    this.extractMode = t;
    const o = t === "scene_reconstruct", r = this.$("reconstruction-panel"), a = this.$("camera-track-body");
    r && r.toggleAttribute("hidden", !o), a && a.toggleAttribute("hidden", o);
    const n = this.$("extract-mode-camera");
    n && (n.setAttribute("aria-selected", o ? "false" : "true"), n.classList.toggle("active", !o));
    const i = this.$("extract-mode-reconstruct");
    if (i && (i.setAttribute("aria-selected", o ? "true" : "false"), i.classList.toggle("active", o)), o && this.reconstruction) {
      const l = this.state.source?.ref || this.state.source;
      l && this.reconstruction.setSource(l);
    }
    const s = wo(this.node, "extract_mode");
    s && s.value !== t && (s.value = t, this.node.setDirtyCanvas?.(!0, !0));
  }
  // Visual/media disposal only. A queued solve outlives this workbench --
  // closing it must not cancel the job (migration plan Task 13); only true
  // node removal (ExtractorRuntime.dispose()) does that.
  dispose() {
    this.reconstruction?.dispose(), this.disposed = !0, Mt(), this.requests.dispose(), this.refine.dispose(), this.coordinator.dispose(), this.sourceViewer.dispose(), this.overlay.dispose(), this.diagnostics.dispose(), this.viewer?.dispose(), this.viewer = null, this.viewerLoad = null, this.events.dispose();
  }
}
for (const e of ko)
  Object.defineProperty(xt.prototype, e, {
    configurable: !0,
    enumerable: !0,
    get() {
      return this.runtime[e];
    },
    set(t) {
      this.runtime[e] = t;
    }
  });
function Ao(e) {
  const t = new xt(e);
  return e.attachWorkbench(t), e.node.__majoorOmniCamExtractor = t, e.pendingSourceResync && (e.pendingSourceResync = !1, t.refreshSource()), e.reconstructionResult && t.reconstruction?.acceptQueuedResult(e.reconstructionResult), t;
}
function Fo(e) {
  e.dispose(), e.runtime.detachWorkbench(e), e.node.__majoorOmniCamExtractor === e && delete e.node.__majoorOmniCamExtractor;
}
export {
  xt as ExtractorUI,
  Fo as closeExtractorWorkbench,
  Ao as openExtractorWorkbench
};
