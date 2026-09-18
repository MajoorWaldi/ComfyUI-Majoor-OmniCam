import { app as Q } from "../../scripts/app.js";
import { api as $ } from "../../scripts/api.js";
import { S as Et, b as Ct, p as _t } from "./chunk-jTZyfNz4.js";
import { M as Mt, E as Tt } from "./chunk-CbqXtcpr.js";
import { v as h, O as st, T as _, bL as Rt, bn as Nt } from "./chunk-d8qZJB0s.js";
import { d as $t } from "./chunk-eq1tqQ9i.js";
import { h as it, D as At, L as Ft, E as Pt } from "./chunk-Cg2s8Bh1.js";
import { a as Lt, F as It, S as Ot, m as ct, c as lt } from "./chunk-sVL03mTG.js";
import { c as Dt, q as qt, a as dt, r as jt, s as Vt, b as Ut, d as Bt, e as Wt, p as Gt, f as Ht } from "./chunk-8DWlRDM4.js";
function zt(e) {
  return e?.name === "AbortError" || e?.code === 20;
}
class Kt {
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
      if (this.aborted || zt(o)) return;
      throw o;
    }
  }
  dispose() {
    this.disposed || (this.disposed = !0, Qt(), this.controller?.abort());
  }
}
function Qt() {
  const e = typeof globalThis == "object" ? globalThis : null;
  if (!e) return;
  const t = e.__majoorOmniCamIntentionalAborts, o = { at: Date.now() };
  if (Array.isArray(t)) {
    t.length >= 64 && t.shift(), t.push(o);
    return;
  }
  e.__majoorOmniCamIntentionalAborts = [o];
}
function Yt(e, t) {
  const o = !!e.upstreamPreviewActive, r = e.sourceViewer?.mode || "native", a = t ? o ? "upstream" : r === "fallback" ? "fallback" : "native" : "none", n = (s, i) => {
    const l = e.$(s);
    l && (l.hidden = !i);
  };
  return n("source-video", a === "native"), n("fallback-preview", a === "fallback"), n("upstream-preview", a === "upstream"), a;
}
function Xt(e, t) {
  const o = e.$("tracking-overlay"), r = Math.round(Number(t?.width) || 0), a = Math.round(Number(t?.height) || 0);
  return !o || r < 1 || a < 1 || o.width === r && o.height === a ? !1 : (o.width = r, o.height = a, e.overlay.draw(), !0);
}
async function Jt(e, t) {
  const o = e.$("upstream-preview");
  if (!o) return;
  const r = t.available ? null : t.previewMedia;
  e.upstreamPreviewActive = r ? await $t(r, o, 960) : !1, e.disposed || e.render();
}
function Zt(e, t) {
  return e?.widgets?.find((o) => o.name === t) || null;
}
async function te(e) {
  if (!await it(
    e.app,
    h("Clear Cache"),
    h("Deletes every cached reconstruction (GLBs, manifests, source images) from disk, and forgets this node's cached track and reconstruction results. This cannot be undone.")
  )) return !1;
  e.queuePromptId && await e.cancelQueuedRun();
  try {
    await e.reconstruction.client.clearCache();
  } catch (o) {
    return e.dispatch({ type: "FAILED", error: String(o?.message || o) }), !1;
  }
  for (const o of [Lt, It, Ot]) {
    const r = Zt(e.node, o);
    r && (r.value = "");
  }
  return e.node.setDirtyCanvas?.(!0, !0), e.overlay.clear(), e.diagnostics.clear(), e.result = { raw: null, refined: null }, e.sourceKey = "", e.state = Dt(), e.reconstruction?.dispatch({ type: "RESET" }), e.render(), e.refreshSource(), !0;
}
async function ee(e, t, o) {
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
async function oe(e, { selectElement: t = null, statusElement: o = null, checkpointSelectElement: r = null } = {}) {
  const a = await e.capabilities(), n = Array.isArray(a?.providers) ? a.providers : [], s = a?.recommended_provider || (n[0]?.provider_id ?? "");
  if (t) {
    typeof t.replaceChildren == "function" ? t.replaceChildren() : Array.isArray(t.options) && (t.options.length = 0);
    for (const c of n) {
      let u;
      typeof document < "u" && typeof document.createElement == "function" ? u = document.createElement("option") : u = { value: "", textContent: "", disabled: !1 }, u.value = c.provider_id, u.textContent = c.available ? c.name || c.provider_id : `${c.name || c.provider_id} (Unavailable)`, u.disabled = !c.available, typeof t.appendChild == "function" ? t.appendChild(u) : Array.isArray(t.options) && t.options.push(u);
    }
    s && (t.value = s);
  }
  const i = t?.value || s, l = n.find((c) => c.provider_id === i);
  if (r) {
    typeof r.replaceChildren == "function" ? r.replaceChildren() : Array.isArray(r.options) && (r.options.length = 0);
    const c = (d, b) => {
      let p;
      return typeof document < "u" && typeof document.createElement == "function" ? p = document.createElement("option") : p = { value: "", textContent: "" }, p.value = d, p.textContent = b, p;
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
    recommended: s,
    providers: n
  };
}
const re = {
  fast: { triangle_budget: 4e4, discontinuity_threshold: 0.06 },
  balanced: { triangle_budget: 12e4, discontinuity_threshold: 0.04 },
  high: { triangle_budget: 25e4, discontinuity_threshold: 0.03 }
};
function Y(e, t) {
  if (!e) return;
  const o = e.querySelector('[data-role="reconstruction-triangle-budget"]'), r = e.querySelector('[data-role="reconstruction-edge-threshold"]'), a = re[t];
  o && (o.disabled = !!a, a && (o.value = String(a.triangle_budget))), r && (r.disabled = !!a, a && (r.value = String(a.discontinuity_threshold)));
}
const ae = { geometry: "depth_mesh", layout: "depth_mesh" }, ut = /* @__PURE__ */ new Set(["blockout", "hybrid", "scan"]), ne = /* @__PURE__ */ new Set(["vggt", "vggt_omega_research"]);
function pt(e) {
  if (!e) return {};
  const t = (u) => e.querySelector(`[data-role="${u}"]`)?.value, o = (u) => !!e.querySelector(`[data-role="${u}"]`)?.checked, r = t("reconstruction-mode") || "depth_mesh";
  let a = ae[r] || r;
  const n = t("reconstruction-provider") || "";
  ne.has(n) && (a = "scan");
  const s = n || (a === "scan" ? "vggt" : "comfy_moge"), i = String(t("reconstruction-semantic-labels") || "").split(/[\n,]/).map((u) => u.trim()).filter(Boolean), l = t("reconstruction-checkpoint") || "auto", c = {
    provider: s,
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
  return ut.has(a) && (c.segmentation_provider = t("reconstruction-segmentation") || "comfy_sam3", c.completion_policy = t("reconstruction-completion-policy") || "off", c.completion_provider = c.completion_policy === "off" ? "none" : "sam3d_objects", c.max_blockout_objects = Number(t("reconstruction-max-objects")) || 24, c.blockout_assets = t("reconstruction-blockout-assets") || "off", i.length && (c.semantic_labels = i)), c;
}
function I(e) {
  if (!e) return;
  const t = pt(e).mode, o = ut.has(t);
  for (const r of ["reconstruction-semantic-row", "reconstruction-labels-row"]) {
    const a = e.querySelector(`[data-role="${r}"]`);
    a && (a.hidden = !o);
  }
}
function se(e, {
  onRun: t = () => {
  },
  onStop: o = () => {
  },
  onOpenDirector: r = () => {
  },
  onSettingsChange: a = () => {
  },
  on: n = (s, i, l) => s?.addEventListener?.(i, l)
} = {}) {
  if (!e) return () => {
  };
  const s = [], i = (p, f, y) => {
    n(p, f, y), s.push(() => p?.removeEventListener?.(f, y));
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
    I(e);
    const p = pt(e);
    a(p);
  };
  for (const p of l) {
    const f = e.querySelector(`[data-role="${p}"]`);
    if (!f) continue;
    const y = f.tagName === "SELECT" || f.type === "checkbox" ? "change" : "input";
    i(f, y, c);
  }
  const u = e.querySelector('[data-role="reconstruction-quality"]');
  u && i(u, "change", () => {
    Y(e, u.value), c();
  }), Y(e, u?.value), I(e);
  const m = e.querySelector('[data-role="reconstruction-run"]');
  m && i(m, "click", t);
  const d = e.querySelector('[data-role="reconstruction-stop"]');
  d && i(d, "click", o);
  const b = e.querySelector('[data-role="reconstruction-open-director"]');
  return b && i(b, "click", r), () => {
    for (const p of s.splice(0)) p();
  };
}
async function ie(e) {
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
class ce {
  constructor(t) {
    this.api = t;
  }
  async _request(t, { method: o = "GET", signal: r } = {}) {
    const a = { method: o };
    r && (a.signal = r);
    const n = await this.api.fetchApi(t, a);
    if (!n.ok) throw new Error(await ie(n));
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
const le = /* @__PURE__ */ new Set([
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
function de() {
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
function ht() {
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
    settings: de()
  };
}
function ue(e) {
  const t = e?.jobState || "IDLE", o = le.has(t), r = e?.source, a = !!(r && (typeof r == "string" || r.available || r.value || r.ref || r.info || r.kind)), n = !o && t !== "STOPPING" && a, s = o, i = !!(e?.result && (e.result.motion_scene || e.result.objects || e.result.version));
  return {
    canStart: n,
    canStop: s,
    canOpenDirector: t === "DONE" && i,
    canPreview: i,
    // Discard a result you don't want (deletes its cached files so a re-run
    // recomputes). Never mid-job.
    canDiscard: i && !o && t !== "STOPPING"
  };
}
function pe(e, t) {
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
        ...ht(),
        source: e.source,
        settings: e.settings
      };
    default:
      return e;
  }
}
const mt = [
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
function ft(e, t, o) {
  const r = e?.widgets?.find((a) => a.name === t);
  return r ? r.value : o;
}
function q(e, t, o) {
  const r = e?.widgets?.find((a) => a.name === t);
  return !r || r.value === o ? !1 : (r.value = o, e.setDirtyCanvas?.(!0, !0), !0);
}
function bt(e, t) {
  return e?.querySelector?.(`[data-role="${t}"]`) || null;
}
function X(e, t) {
  if (!(!e || !t))
    for (const o of mt) {
      const r = bt(t, o.role);
      if (!r) continue;
      const a = ft(e, o.widget, void 0);
      a != null && (o.kind === "boolean" ? r.checked = !!a : r.value = String(a));
    }
}
function L(e, t) {
  if (!e || !t) return !1;
  let o = !1;
  for (const a of mt) {
    const n = bt(t, a.role);
    if (!n) continue;
    if (a.kind === "boolean") {
      o = q(e, a.widget, !!n.checked) || o;
      continue;
    }
    const s = n.value;
    s === "" || s == null || (o = q(e, a.widget, a.kind === "number" ? Number(s) : s) || o);
  }
  const r = ft(e, "recon_completion_policy", "off");
  return o = q(e, "recon_completion_provider", r === "off" ? "none" : "sam3d_objects") || o, o;
}
function j(e) {
  return Math.round(Math.min(1, Math.max(0, e?.progress || 0)) * 100);
}
function he(e, t) {
  if (!e) return;
  const o = ue(t), r = e.querySelector('[data-role="reconstruction-run"]');
  r && (r.disabled = !o.canStart);
  const a = e.querySelector('[data-role="reconstruction-stop"]');
  a && (a.disabled = !o.canStop);
  const n = e.querySelector('[data-role="reconstruction-open-director"]');
  n && (n.disabled = !o.canOpenDirector);
  const s = e.querySelector('[data-role="reconstruction-preview-toggle"]');
  s && (s.disabled = !o.canPreview);
  const i = e.querySelector('[data-role="reconstruction-discard"]');
  i && (i.disabled = !o.canDiscard);
  const l = e.querySelector('[data-role="reconstruction-progress"]');
  l && (l.style.width = `${j(t)}%`);
  const c = e.querySelector('[data-role="reconstruction-stage"]');
  if (c)
    if (t?.error) {
      const d = t.error?.message || t.error?.code || String(t.error);
      c.textContent = d, c.dataset.state = "error";
    } else t?.stage ? (c.textContent = `${t.stage} (${j(t)}%)`, c.dataset.state = "active") : t?.jobState && t.jobState !== "IDLE" ? (c.textContent = `${t.jobState} (${j(t)}%)`, c.dataset.state = t.jobState === "DONE" ? "ok" : "active") : (c.textContent = h("Ready to reconstruct"), c.dataset.state = "idle");
  const u = e.querySelector('[data-role="reconstruction-summary"]');
  if (u)
    if (t?.summary) {
      u.hidden = !1;
      const d = t.summary, b = d.triangle_count != null ? d.triangle_count : d.mesh_triangles, p = b != null ? Number(b).toLocaleString() : null, f = d.camera_fov_x != null ? d.camera_fov_x : d.camera_fov, y = f != null ? Number(f).toFixed(1) : null, k = Number(d.ground_confidence) > 0 ? h("ground plane detected") : null, S = [];
      p && S.push(`${p} ${h("triangles")}`), y && S.push(`FOV ${y}°`), k && S.push(k), u.textContent = S.join(" • ");
    } else
      u.hidden = !0, u.textContent = "";
  const m = e.querySelector('[data-role="reconstruction-warnings"]');
  if (m) {
    const d = t?.warnings || [];
    if (d.length > 0) {
      m.hidden = !1, m.replaceChildren();
      for (const b of d) {
        const p = document.createElement("div");
        p.className = "oc-warning-item", p.textContent = `⚠ ${b}`, m.appendChild(p);
      }
    } else
      m.hidden = !0, m.replaceChildren();
  }
}
class me {
  constructor({
    root: t,
    node: o,
    api: r,
    app: a = null,
    getSource: n = () => null,
    onAdopt: s = () => {
    },
    onQueue: i = () => {
    },
    onCancel: l = () => {
    },
    on: c = (u, m, d) => u?.addEventListener?.(m, d)
  }) {
    this.root = t, this.node = o, this.api = r, this.app = a, this.getSource = n, this.onAdopt = s, this.onQueue = i, this.onCancel = l, this.on = c, this.client = new ce(r), this.runGeneration = 0, this.state = ht();
    const u = this.getSource();
    u && (this.state.source = u), this.unbindControls = se(this.root, {
      onRun: () => this.run(),
      onStop: () => this.stop(),
      onOpenDirector: () => this.openDirector(),
      onSettingsChange: (p) => {
        L(this.node, this.root), this.dispatch({ type: "SETTINGS", settings: p });
      },
      on: this.on
    }), this.syncFromWidgets(), L(this.node, this.root), this.preview = null, this.previewLoad = null, this.previewOpen = !1;
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
    return this.preview || this.disposed ? this.preview : (this.previewLoad ||= import("./chunk-BerJaPhu.js").then(({ TrackViewer: t }) => {
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
      resolveAssetUrl: (o) => st(this.api, o)
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
    X(this.node, this.root), I(this.root), this.render();
  }
  async initCapabilities() {
    try {
      const t = this.root.querySelector('[data-role="reconstruction-provider"]'), o = this.root.querySelector('[data-role="reconstruction-stage"]'), r = this.root.querySelector('[data-role="reconstruction-checkpoint"]');
      if (await oe(this.client, {
        selectElement: t,
        statusElement: o,
        checkpointSelectElement: r
      }), this.disposed) return;
      X(this.node, this.root), I(this.root), this.render();
    } catch {
    }
  }
  setSource(t) {
    this.dispatch({ type: "SOURCE", source: t });
  }
  dispatch(t) {
    if (this.disposed) return;
    const o = this.state.result;
    this.state = pe(this.state, t), this.render(), this.previewOpen && this.preview && this.state.result && this.state.result !== o && this.pushSceneToPreview();
  }
  render() {
    he(this.root, this.state);
  }
  async run() {
    !(this.state.source || this.getSource()) || this.disposed || (this.runGeneration += 1, L(this.node, this.root), this.dispatch({ type: "STATE", jobState: "PREPARING" }), await this.onQueue());
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
    if (!this.state.result || !await it(
      this,
      h("Discard reconstruction"),
      h("Removes this reconstruction and its cached files so the next run recomputes it. The camera track and other reconstructions are left untouched.")
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
const fe = [
  "normalize_origin",
  "motion_scale",
  "position_smoothing",
  "rotation_smoothing",
  "simplify_keys",
  "position_tolerance",
  "rotation_tolerance_deg"
];
function be(e, t) {
  return e?.widgets?.find((o) => o.name === t) || null;
}
function J(e, t, o) {
  const r = be(e, t);
  return !r || r.value === o ? !1 : (r.value = o, e?.setDirtyCanvas?.(!0, !0), !0);
}
function ge({ node: e, root: t, mode: o, refineSettings: r }) {
  let a = J(e, "extract_mode", o);
  if (o === "scene_reconstruct")
    return L(e, t) || a;
  for (const n of fe)
    r?.[n] !== void 0 && (a = J(e, n, r[n]) || a);
  return a;
}
const ve = {
  "subgraph-not-supported": "OmniCam TRACK does not support an Extractor inside a subgraph yet. Move it to the root graph, or run the whole workflow with Queue Prompt.",
  "no-execution-id": "This Extractor has no resolvable node id and cannot be queued.",
  "submission-busy": "ComfyUI is still sending another prompt. Press TRACK again in a moment."
};
async function ye(e, t = "camera_track") {
  try {
    const o = await qt(e, t), r = ve[o?.reason];
    r && e.dispatch({ type: "FAILED", error: r });
  } catch (o) {
    e.dispatch({ type: "FAILED", error: String(o?.message || o) });
  }
}
function xe(e) {
  ge({
    node: e.node,
    root: e.root,
    mode: e.extractMode,
    refineSettings: e.refine.settings
  });
}
function we(e) {
  e.sourceViewer.setFollow(!0), e.overlay.clear(), e.diagnostics.clear(), e.queuePromptId = "", e.dispatch({ type: "JOB_STARTED", status: { job_id: "", state: "QUEUED" } }), e.coordinator.seek(0, "backend");
}
async function ke(e) {
  const t = String(e.queuePromptId || "");
  if (t) {
    e.dispatch({ type: "QUEUE_LIFECYCLE", state: "CANCELLING" });
    try {
      await dt(e.api, t);
    } catch (o) {
      e.dispatch({
        type: "QUEUE_LIFECYCLE",
        state: "FAILED",
        error: String(o?.message || o)
      });
    }
  }
}
const Se = 200, Z = {
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
function V() {
  return { pitch: 0, yaw: 0, roll: 0 };
}
class Ee {
  constructor({ onRefine: t, delay: o = Se, setTimer: r, clearTimer: a } = {}) {
    this.settings = { ...Z }, this.alignment = V(), this.onRefine = t || (() => {
    }), this.delay = o, this.setTimer = r || ((n, s) => setTimeout(n, s)), this.clearTimer = a || ((n) => clearTimeout(n)), this.timer = null, this.lastSent = "";
  }
  /** Merge a change and schedule a refine. Returns the merged settings. */
  update(t) {
    return this.settings = { ...this.settings, ...t }, this.schedule(), this.settings;
  }
  setAlignment(t) {
    return this.alignment = { ...this.alignment, ...t }, this.update({
      global_rotation_xyzw: Ce(this.alignment),
      estimate_up: !1
    });
  }
  /** Ask the server to derive the levelling rotation from the solve itself. */
  requestEstimatedUp() {
    return this.alignment = V(), this.update({ global_rotation_xyzw: null, estimate_up: !0 });
  }
  setSpikeAction(t, o) {
    const r = { ...this.settings.spike_actions };
    return o === "ignore" ? delete r[String(t)] : r[String(t)] = o, this.update({ spike_actions: r });
  }
  reset() {
    return this.settings = { ...Z }, this.alignment = V(), this.schedule(), this.settings;
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
function Ce({ pitch: e = 0, yaw: t = 0, roll: o = 0 } = {}) {
  if (!e && !t && !o) return null;
  const [r, a, n] = [e, t, o].map((d) => (Number(d) || 0) * (Math.PI / 180) * 0.5), [s, i, l, c, u, m] = [
    Math.cos(r),
    Math.sin(r),
    Math.cos(a),
    Math.sin(a),
    Math.cos(n),
    Math.sin(n)
  ];
  return [
    i * l * u + s * c * m,
    s * c * u - i * l * m,
    s * l * m + i * c * u,
    s * l * u - i * c * m
  ];
}
class _e {
  constructor({ maxFrames: t = 180 } = {}) {
    this.maxFrames = Math.max(1, Math.floor(Number(t) || 180)), this.frames = /* @__PURE__ */ new Map();
  }
  set(t, { points: o = [], vectors: r = [], state: a = "unknown" } = {}) {
    const n = Math.max(0, Math.floor(Number(t) || 0)), s = {
      frame: n,
      points: Array.isArray(o) ? o : [],
      vectors: Array.isArray(r) ? r : [],
      state: String(a || "unknown")
    };
    for (this.frames.delete(n), this.frames.set(n, s); this.frames.size > this.maxFrames; ) this.frames.delete(this.frames.keys().next().value);
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
function Me(e, t) {
  const o = Math.max(0, Math.floor(Number(t) || 0) - 1);
  return Math.max(0, Math.min(o, Math.round(Number(e) || 0)));
}
function Te(e) {
  return ["manual", "transport", "timeline", "quality", "input"].includes(e);
}
class Re {
  constructor({
    media: t = null,
    getViewer: o = () => null,
    showDiagnostics: r = () => {
    },
    dispatch: a = () => {
    },
    setFollow: n = () => {
    },
    onPlaybackState: s = () => {
    },
    frameCount: i = 0,
    fps: l = 24,
    loop: c = !1,
    // Closures, not .bind(globalThis): the receiver is what matters here and a
    // closure states it directly instead of through a partial application.
    requestAnimationFrame: u = (d) => globalThis.requestAnimationFrame?.(d),
    cancelAnimationFrame: m = (d) => globalThis.cancelAnimationFrame?.(d)
  } = {}) {
    this.media = t, this.getViewer = o, this.showDiagnostics = r, this.dispatch = a, this.setFollow = n, this.onPlaybackState = s, this.frameCount = Math.max(0, Math.floor(Number(i) || 0)), this.fps = Math.max(1, Number(l) || 24), this.loop = !!c, this.frame = 0, this.playing = !1, this.disposed = !1, this.animationFrame = null, this.playbackStartFrame = 0, this.playbackStartTime = null, this.requestAnimationFrame = u || (() => null), this.cancelAnimationFrame = m || (() => {
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
    const r = Me(t, this.frameCount);
    return Te(o) && this.setFollow(!1), o !== "media" && this.media?.seekFrame?.(r), this.getViewer?.()?.setFrame?.(r), this.showDiagnostics(r), this.frame = r, this.dispatch({ type: "FRAME", frame: r }), o !== "playback" && (this.playbackStartFrame = r, this.playbackStartTime = null), r;
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
class A extends Error {
}
function Ne(e, { track: t, state: o } = {}) {
  if (o !== "COMPLETED")
    throw new A("Only a completed solve can be applied to the Director.");
  const r = t?.keyframes;
  if (!Array.isArray(r) || !r.length)
    throw new A("This solve produced no camera keys to apply.");
  const a = String(t?.metadata?.extractor_fingerprint || "");
  if (!a)
    throw new A("This track carries no extractor fingerprint.");
  const n = ct(t);
  if (!n)
    throw new A("This solve cannot be wrapped in a canonical motion scene.");
  lt(e, {
    motionScene: n,
    fingerprint: a,
    solver_coverage: Number(t?.metadata?.solver_coverage ?? t?.metadata?.confidence) || 0
  });
  const s = At(e);
  return { fingerprint: a, notified: s };
}
function $e(e, t = "") {
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
class Ae extends Mt {
  constructor(t, {
    fps: o = 24,
    onFrame: r = () => {
    },
    onMetadata: a = () => {
    },
    onError: n = () => {
    },
    onMode: s = () => {
    },
    fallbackViewer: i = null
  } = {}) {
    super(t, {
      fps: o,
      durationFrames: 1,
      onFrame: (l) => this.reportFrame(l),
      onMetadata: a,
      onError: (l) => this.handleMediaError(l),
      errorMessage: $e,
      loop: !0,
      muted: !0
    }), this.frameCount = 0, this.onExternalFrame = r, this.ignoredFrame = null, this.follow = !0, this.mode = "native", this.source = null, this.onMode = s, this.fallbackViewer = i, this.onPlaybackError = n;
  }
  setSource(t, { source: o, ...r } = {}) {
    const a = o || null, n = this.source?.kind !== a?.kind || this.source?.value !== a?.value, s = super.setSource(t, r);
    return s || n ? (this.source = a, this.fallbackViewer?.clear?.(), this.setMode("native")) : a && (this.source = a), s;
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
function tt(e, t) {
  const o = Math.max(1, Number(t) || 24), r = Math.max(0, Number(e) || 0), a = Math.floor(r / o), n = (s, i = 2) => String(s).padStart(i, "0");
  return `${n(Math.floor(a / 60))}:${n(a % 60)}:${n(r % o)}`;
}
const Fe = "/majoor/omnicam/extractor/frame";
function Pe(e) {
  return Math.max(0, Math.round(Number(e) || 0));
}
function F(e, t, o = 0) {
  const r = Number(e?.get?.(t));
  return Number.isFinite(r) && r > 0 ? Math.round(r) : o;
}
async function Le(e) {
  try {
    return await e?.text?.() || `Preview frame request failed (${e?.status || "unknown"})`;
  } catch {
    return `Preview frame request failed (${e?.status || "unknown"})`;
  }
}
function Ie(e) {
  return e?.name === "AbortError";
}
function Oe(e, t, o = t?.width, r = t?.height) {
  const a = e?.getContext?.("2d"), n = Math.max(1, Number(t?.width) || 1), s = Math.max(1, Number(t?.height) || 1), i = Math.max(1, Math.round(Number(o) || n)), l = Math.max(1, Math.round(Number(r) || s));
  if (!a) return !1;
  e.width !== i && (e.width = i), e.height !== l && (e.height = l);
  const c = Math.min(i / n, l / s), u = Math.round(n * c), m = Math.round(s * c);
  return a.clearRect(0, 0, i, l), a.drawImage(t, Math.round((i - u) / 2), Math.round((l - m) / 2), u, m), !0;
}
class De {
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
    const s = Pe(o);
    try {
      const i = await this.api?.fetchApi?.(Fe, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: t, frame: s, max_dimension: r }),
        signal: n.signal
      });
      if (!i?.ok) throw new Error(await Le(i));
      const l = await i.blob(), c = await this.decodeImage(l);
      if (a !== this.generation || n.signal.aborted)
        return c?.close?.(), !1;
      const u = F(i.headers, "X-OmniCam-Width", c?.width), m = F(i.headers, "X-OmniCam-Height", c?.height);
      let d = !1;
      try {
        d = Oe(this.canvas, c, u, m);
      } finally {
        c?.close?.();
      }
      if (!d) throw new Error("The fallback preview canvas is unavailable.");
      return this.frame = F(i.headers, "X-OmniCam-Frame", s), this.frameCount = F(i.headers, "X-OmniCam-Frame-Count", this.frameCount), this.error = "", !0;
    } catch (i) {
      if (a !== this.generation || n.signal.aborted || Ie(i)) return !1;
      throw this.error = String(i?.message || i), i;
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
async function qe(e) {
  const t = await $.fetchApi("/majoor/omnicam/extractor/source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: e })
  });
  if (!t.ok)
    throw new Error(`OmniCam: could not describe the source (${t.status})`);
  return t.json();
}
function je(e) {
  const t = e.extractMode || "camera_track", o = jt(e.node, e.node.graph, t), r = o.ref ? `${o.ref.kind}:${o.ref.value}` : "", a = r !== (e.sourceKey || "");
  a && (e.sourceKey = r, e.describing = "", e.queuePromptId && dt(e.api, e.queuePromptId).catch(() => {
  }), e.dispatch({ type: "SOURCE_RESET", source: { ...o, playbackError: "" } }), e.coordinator.setRate(24), e.coordinator.setFrameCount(0));
  const n = e.sourceViewer.setSource(
    o.available && o.ref ? st($, o.ref.value) : "",
    { source: o.available ? o.ref : null }
  );
  return a && e.coordinator.seek(0, "source"), e.dispatch({ type: "SOURCE", source: n ? { ...o, playbackError: "" } : o }), t !== "scene_reconstruct" && (o.available && o.ref ? gt(e, o) : H(e, 0)), Jt(e, o), o;
}
async function gt(e, t) {
  if (e.describing === t.ref?.value) return null;
  e.describing = t.ref?.value;
  try {
    const o = await qe(t.ref);
    if (e.disposed || e.sourceKey !== `${t.ref.kind}:${t.ref.value}`) return null;
    const r = o?.info || null;
    return e.dispatch({ type: "SOURCE", source: { info: r } }), r && (e.coordinator.setRate(Number(r.fps) || e.sourceViewer.fps), H(e, Number(r.frame_count) || 0), Xt(e, r)), r;
  } catch (o) {
    return console.warn("[OmniCam] could not describe the extractor source", o), null;
  }
}
function H(e, t) {
  const o = Math.max(0, Math.round(Number(t) || 0));
  e.coordinator.setFrameCount(o), o !== e.state.frameCount && (e.dispatch({ type: "FRAME_COUNT", frameCount: o }), e.coordinator.seek(e.coordinator.frame, "source"));
}
const Ve = `${Et}${Ft}
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
function T(e, t, { min: o = 0, max: r = 1, step: a = 0.01, value: n = 0 } = {}) {
  return `<label for="oc-${e}">${t}</label>
    <input id="oc-${e}" data-role="${e}" type="range" min="${o}" max="${r}" step="${a}" value="${n}">
    <output data-role="${e}-out"></output>`;
}
function Ue() {
  return `<div class="majoor-omnicam oc-extractor">
    <style>${Ve}</style>
    <header class="oc-header">
      ${Ct("OmniCam Extractor")}
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
function Be(e = document) {
  const t = e.createElement("div");
  return t.innerHTML = Ue(), t.firstElementChild;
}
const vt = {
  good: _.success,
  weak: _.warning,
  bad: _.error,
  unknown: _.borderDefault
};
function z(e) {
  if (!e) return "unknown";
  const t = String(e.state || "").toLowerCase();
  if (vt[t]) return t;
  const o = Number(e.coverage);
  return Number.isFinite(o) ? o >= 0.7 ? "good" : o >= 0.35 ? "weak" : "bad" : "unknown";
}
function We(e, t) {
  const o = (e || []).find((a) => Number(a.frame) === Number(t)), r = [["Frame", String(t)]];
  return o ? (r.push(["Tracking state", z(o).toUpperCase()]), Number.isFinite(Number(o.coverage)) && r.push(["Coverage", `${Math.round(Number(o.coverage) * 100)}%`]), o.inliers != null && r.push(["Inliers", String(o.inliers)]), r) : (r.push(["Tracking state", "UNKNOWN"]), r);
}
_.success, _.warning, _.error;
const Ge = {
  position: _.typeCamera,
  target: _.typeLookAt,
  roll: _.typeRoll
}, D = [
  { key: "position", label: "Camera" },
  { key: "target", label: "Look At" },
  { key: "roll", label: "Roll" }
], He = 18, ze = 9, et = 2, yt = 78, Ke = { solve: "SOLVE HEALTH" }, O = {
  bands: ["solve"],
  labels: !0,
  labelWidth: yt,
  bandHeight: ze,
  bandGap: et,
  laneTopGap: et + 2,
  laneHeight: He,
  laneGap: 0,
  rowChrome: !1,
  ruler: !0,
  playhead: !0,
  topPad: 1,
  bottomPad: 12
}, ot = {
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
function xt(e = D, t = O) {
  const o = { ...O, ...t }, r = [];
  let a = o.topPad;
  for (const n of o.bands || [])
    r.length && (a += o.bandGap), r.push({
      kind: "band",
      key: n,
      label: Ke[n] || String(n).toUpperCase(),
      top: a,
      height: o.bandHeight
    }), a += o.bandHeight;
  for (const n of e)
    r.length && (a += r[r.length - 1].kind === "band" ? o.laneTopGap : o.laneGap), r.push({ kind: "lane", key: n.key, label: n.label, top: a, height: o.laneHeight }), a += o.laneHeight;
  return { rows: r, style: o, height: a + o.bottomPad };
}
function Qe(e = D, t = O) {
  return xt(e, t).height;
}
function Ye(e, t) {
  if (!e) return null;
  if (t === "position" || t === "target") {
    const r = e[t];
    return Array.isArray(r) ? r.map(Number) : null;
  }
  const o = Number(e.roll);
  return Number.isFinite(o) ? [o] : null;
}
function Xe(e, t, o = 1e-4) {
  return !e || !t || e.length !== t.length ? !1 : e.every((r, a) => Math.abs(r - t[a]) <= o);
}
function wt(e, t = D) {
  const o = Array.isArray(e?.keyframes) ? e.keyframes : [], r = {};
  for (const { key: a } of t) {
    const n = [];
    let s = null;
    for (const i of o) {
      const l = Ye(i?.camera, a);
      l && ((s === null || !Xe(l, s)) && n.push(Number(i.frame) || 0), s = l);
    }
    r[a] = n;
  }
  return r;
}
function Je(e, t = null, o = "generic") {
  if (!e?.keyframes?.length || !t) return null;
  try {
    const a = Array.isArray(e.objects) && e.objects.some((n) => n?.id === "subject" && Array.isArray(n.position)) ? t : { ...t, allow_framing_loss: !0 };
    return Rt(e, a, null, o);
  } catch {
    return null;
  }
}
function Ze(e, t, o, r = yt) {
  const a = Math.max(1, Number(o) || 0), n = Math.max(1, (Number(t) || 1) - r), s = Math.max(0, Math.min(1, (Number(e) - r) / n));
  return Math.max(0, Math.min(a - 1, Math.round(s * (a - 1))));
}
function kt(e, t) {
  return Math.max(1, (Number(e) || 1) - t.labelWidth - (t.labelWidth ? 4 : 0));
}
function R(e, t, o, r) {
  const a = Math.max(1, (Number(o) || 1) - 1), n = kt(t, r);
  return r.labelWidth + Math.max(0, Math.min(a, e)) / a * n;
}
function to(e, t) {
  const o = Math.max(0, Number(t) - 1);
  return (e || []).map((r) => {
    const a = Math.max(0, Math.min(o, Number(r?.start_frame ?? r?.frame) || 0)), n = Math.max(a, Math.min(o, Number(r?.end_frame ?? r?.frame) || a));
    return { start: a, end: n, level: r?.level === "error" ? "error" : "warn" };
  });
}
function eo(e, t, o, r, a, n) {
  for (const s of t) {
    const i = R(s.start, r, a, n), l = R(s.end, r, a, n), c = Math.max(2, l - i + 2);
    e.fillStyle = "#101014", e.fillRect(Math.round(i - 1), o.top + 2, Math.ceil(c + 2), o.height - 4), e.fillStyle = s.level === "error" ? "#ffffff" : "#f2c66d", e.fillRect(Math.round(i), o.top + 3, Math.ceil(c), o.height - 6);
  }
}
function oo(e, { y: t, height: o, width: r, frameCount: a, colorAt: n, style: s }) {
  const i = Math.max(1, Number(a) || 0), l = kt(r, s), c = Math.max(1, Math.ceil(i / l)), u = Math.max(1, l / Math.ceil(i / c));
  for (let m = 0; m < i; m += c) {
    const d = n(m, Math.min(i, m + c));
    d && (e.fillStyle = d, e.fillRect(s.labelWidth + m / i * l, t, u, o));
  }
}
function ro(e, t, o, r) {
  const a = new Map((e || []).map((s) => [Number(s.frame), s]));
  let n = "unknown";
  for (let s = Math.max(0, Number(o) || 0); s < Math.max(0, Number(r) || 0); s += 1) {
    const i = z(a.get(s)), l = String((t || [])[s] || "").toLowerCase(), c = l === "over" ? "bad" : l === "warn" ? "weak" : l === "ok" ? "good" : "unknown";
    P(i) > P(n) && (n = i), P(c) > P(n) && (n = c);
  }
  return n;
}
function ao(e, t, o) {
  const r = Number(o) || 0, a = (e || []).find((i) => Number(i.frame) === r), n = String(t?.frame_grades?.[r] || "unknown").toUpperCase(), s = [["Solve state", z(a).toUpperCase()], ["Motion grade", n]];
  a && Number.isFinite(Number(a.coverage)) && s.push(["Coverage", `${Math.round(Number(a.coverage) * 100)}%`]), a?.inliers != null && s.push(["Inliers", String(a.inliers)]);
  for (const i of ["speed", "angular_speed", "acceleration", "jerk"]) {
    const l = Number(t?.series?.[i]?.[r]), c = Number(t?.limits?.[`max_${i}`]);
    Number.isFinite(l) && s.push([i.replace("_", " "), Number.isFinite(c) ? `${l.toFixed(2)} / ${c}` : l.toFixed(2)]);
  }
  return t?.framing?.[r] === !1 && !t?.limits?.allow_framing_loss && s.push(["Framing", "LOSS"]), s;
}
function no(e, t, o, r) {
  e.fillStyle = r, e.font = "9px system-ui, sans-serif", e.textBaseline = "middle", e.fillText(t, 2, o);
}
function so(e, t, o, r, a, n) {
  const s = Math.max(0, Math.min(n, r / 2, a / 2));
  e.beginPath(), e.moveTo(t + s, o), e.arcTo(t + r, o, t + r, o + a, s), e.arcTo(t + r, o + a, t, o + a, s), e.arcTo(t, o + a, t, o, s), e.arcTo(t, o, t + r, o, s), e.closePath();
}
function io(e, { row: t, width: o, style: r }) {
  const a = r.labelWidth, n = Math.max(2, o - a);
  so(e, a + 0.5, t.top + 0.5, n - 1, t.height - 1, 6), e.fillStyle = "#20202a", e.fill(), e.strokeStyle = "#26262f", e.lineWidth = 1, e.stroke(), t.kind === "lane" && (e.fillStyle = "#2c2c38", e.fillRect(a + 1, Math.round(t.top + t.height / 2), n - 2, 1));
}
function co(e, {
  track: t = null,
  health: o = null,
  quality: r = [],
  anomalies: a = [],
  frame: n = 0,
  frameCount: s = 0,
  channels: i = D,
  layout: l = O
} = {}) {
  const c = Math.max(1, Number(s) || Number(t?.duration_frames) || 1), u = wt(t, i), { rows: m, style: d } = xt(i, l), b = {
    total: c,
    labelWidth: d.labelWidth,
    lanes: m.filter((g) => g.kind === "lane").map((g) => ({
      key: g.key,
      top: g.top,
      bottom: g.top + g.height,
      keys: u[g.key] || []
    })),
    anomalies: to(a, c)
  }, p = e?.getContext?.("2d"), f = e?.width || 0, y = e?.height || 0;
  if (!p || !f || !y) return { ...b, keys: u };
  p.clearRect(0, 0, f, y);
  const k = Array.isArray(o?.frame_grades) ? o.frame_grades : [], S = {
    solve: (g, x) => vt[ro(r, k, g, x)]
  };
  for (const g of m) {
    d.rowChrome && io(p, { row: g, width: f, style: d });
    const x = g.top + g.height / 2;
    if (d.labels && no(p, g.label, x, "#9a9aad"), g.kind === "band") {
      const w = S[g.key];
      if (!w) continue;
      const C = d.rowChrome ? 2 : 0;
      oo(p, {
        y: g.top + C,
        height: g.height - C * 2,
        width: f,
        frameCount: c,
        colorAt: w,
        style: d
      }), g.key === "solve" && eo(p, b.anomalies, g, f, c, d);
      continue;
    }
    const v = u[g.key] || [];
    v.length > 1 && !d.rowChrome && (p.strokeStyle = "#2c2c38", p.lineWidth = 1, p.beginPath(), p.moveTo(R(v[0], f, c, d), x), p.lineTo(R(v[v.length - 1], f, c, d), x), p.stroke()), p.fillStyle = Ge[g.key] || "#8b7bd8";
    const E = d.rowChrome ? 5.5 : 3.5;
    for (const w of v) {
      const C = Math.max(
        d.labelWidth + E,
        Math.min(f - E, R(w, f, c, d))
      );
      p.beginPath(), p.moveTo(C, x - E), p.lineTo(C + E, x), p.lineTo(C, x + E), p.lineTo(C - E, x), p.closePath(), p.fill();
    }
  }
  if (d.ruler) {
    p.fillStyle = "#3a3a48";
    const g = Math.min(12, c);
    for (let x = 0; x <= g; x += 1) {
      const v = Math.round(x / Math.max(1, g) * (c - 1));
      p.fillRect(R(v, f, c, d), y - 6, 1, 5);
    }
  }
  if (d.playhead) {
    const g = R(Math.max(0, Math.min(c - 1, Number(n) || 0)), f, c, d);
    p.fillStyle = "#e6e6f0", p.fillRect(Math.round(g), 0, 1, y);
  }
  return { ...b, keys: u };
}
function P(e) {
  return { unknown: 0, good: 1, weak: 2, bad: 3 }[e] ?? 0;
}
class lo {
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
  render({ track: t = null, health: o = null, quality: r = [], anomalies: a = [], frame: n = 0, frameCount: s = 0 } = {}) {
    const i = this.$("track-timeline");
    if (!i) return null;
    const l = Qe(void 0, ot);
    return i.height !== l && (i.height = l), co(i, {
      track: t,
      health: o,
      quality: r,
      anomalies: a,
      frame: n,
      layout: ot,
      frameCount: Math.max(Number(s) || 0, Number(t?.duration_frames) || 0)
    });
  }
  /** Which frame a pointer event over the strip refers to, or null. */
  frameAt(t, o) {
    const r = this.$("extractor-dope-tracks");
    if (!r?.getBoundingClientRect) return null;
    const a = r.getBoundingClientRect();
    return Ze(t.clientX - a.left, a.width, o, 0);
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
const uo = [
  "first-frame",
  "previous-key",
  "previous-frame",
  "play",
  "next-frame",
  "next-key",
  "last-frame",
  "toggle-loop"
], po = {
  "first-frame": '[data-act="first-frame"]',
  "previous-key": '[data-act="previous-key"]',
  "previous-frame": '[data-act="previous-frame"]',
  play: '[data-act="play"]',
  "next-frame": '[data-act="next-frame"]',
  "next-key": '[data-act="next-key"]',
  "last-frame": '[data-act="last-frame"]',
  "toggle-loop": '[data-act="toggle-loop"]'
};
function U(e) {
  return [...new Set((e || []).map((t) => Number(typeof t == "object" ? t?.frame : t)).filter(Number.isFinite).map((t) => Math.max(0, Math.round(t))))].sort((t, o) => t - o);
}
function ho(e, t) {
  const o = U(e?.anomalies), r = U(Object.values(wt(t)).flat()), a = r.length ? r : U(t?.keyframes);
  return { anomalies: o, solved: a };
}
function B(e, t, { anomalies: o, solved: r }) {
  const a = t > 0 ? (s) => s > e : (s) => s < e, n = (s) => {
    const i = s.filter(a);
    return t > 0 ? i[0] : i.at(-1);
  };
  return n(o) ?? n(r) ?? null;
}
function mo(e) {
  const t = String(e?.tagName || "").toLowerCase();
  return e?.isContentEditable || t === "textarea" || t === "select" ? !0 : t === "input" && ["text", "number"].includes(String(e.type || "text").toLowerCase());
}
function W(e) {
  return Math.max(0, Math.round(Number(e?.frameCount) || 0));
}
function fo(e, {
  coordinator: t,
  getState: o = () => ({}),
  getTrack: r = () => null,
  on: a = (n, s, i) => n?.addEventListener?.(s, i)
} = {}) {
  const n = (d) => e?.querySelector?.(po[d]) || null, s = () => o() || {}, i = () => ho(s(), r()), l = (d) => W(s()) < 1 ? !1 : (t?.seek?.(d, "transport"), !0), c = (d) => {
    const b = B(Number(s().frame) || 0, d, i());
    return b === null ? !1 : l(b);
  }, u = {
    "first-frame": () => l(0),
    "previous-key": () => c(-1),
    "previous-frame": () => l((Number(s().frame) || 0) - 1),
    play: () => W(s()) > 0 && !!t?.toggle?.(),
    "next-frame": () => l((Number(s().frame) || 0) + 1),
    "next-key": () => c(1),
    "last-frame": () => l(W(s()) - 1),
    "toggle-loop": () => (t?.setLoop?.(!t?.loop), m(), !0)
  };
  for (const d of uo) {
    const b = n(d);
    b && a(b, "click", () => u[d]());
  }
  a(e, "keydown", (d) => {
    if (mo(d.target)) return;
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
    const d = Number(s().frame) || 0, b = i(), p = n("previous-key");
    p && (p.disabled = B(d, -1, b) === null);
    const f = n("next-key");
    f && (f.disabled = B(d, 1, b) === null);
    const y = n("toggle-loop");
    y && y.setAttribute("aria-pressed", String(!!t?.loop));
    const k = n("play");
    if (k) {
      k.classList?.toggle?.("playing", !!t?.playing);
      const S = k.querySelector?.("i");
      S && (S.className = t?.playing ? "pi pi-pause" : "pi pi-play"), k.setAttribute("aria-label", t?.playing ? "Pause playback" : "Play playback");
    }
  }
  return { render: m };
}
const bo = 300, go = 300, N = {
  accepted: "#46a758",
  weak: "#e5a23c",
  rejected: "#e5484d",
  current: "#8b7bd8"
};
function rt(e, t) {
  const o = Array.isArray(e) ? e : [];
  if (o.length <= t) return o.slice();
  const r = o.length / t, a = [];
  for (let n = 0; n < t; n += 1) a.push(o[Math.floor(n * r)]);
  return a;
}
function G(e, { sourceWidth: t, sourceHeight: o, width: r, height: a }) {
  const n = Number(e?.x ?? e?.[0]) || 0, s = Number(e?.y ?? e?.[1]) || 0, i = n <= 1 && s <= 1 && n >= 0 && s >= 0, l = i ? r : r / Math.max(1, t || r), c = i ? a : a / Math.max(1, o || a);
  return [n * l, s * c];
}
class vo {
  constructor(t) {
    this.canvas = t, this.points = [], this.vectors = [], this.frame = 0, this.state = "unknown";
  }
  setDiagnostics({ points: t = [], vectors: o = [], frame: r = 0, state: a = "unknown" } = {}) {
    this.points = rt(t, bo), this.vectors = rt(o, go), this.frame = Number(r) || 0, this.state = String(a || "unknown"), this.draw();
  }
  clear() {
    this.points = [], this.vectors = [];
    const t = this.canvas?.getContext?.("2d");
    t && t.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  draw({ sourceWidth: t = 0, sourceHeight: o = 0 } = {}) {
    const r = this.canvas?.getContext?.("2d"), a = this.canvas?.width || 0, n = this.canvas?.height || 0;
    if (!r || !a || !n) return { points: this.points.length, vectors: this.vectors.length };
    const s = { sourceWidth: t, sourceHeight: o, width: a, height: n };
    r.clearRect(0, 0, a, n), r.lineWidth = 1;
    for (const i of this.vectors) {
      const [l, c] = G(i.from ?? i, s), [u, m] = G(i.to ?? i, s);
      r.strokeStyle = N[i.state] || N.accepted, r.beginPath(), r.moveTo(l, c), r.lineTo(u, m), r.stroke();
    }
    for (const i of this.points) {
      const [l, c] = G(i, s);
      r.fillStyle = N[i.state] || N.accepted, r.fillRect(l - 1.5, c - 1.5, 3, 3);
    }
    return (this.state === "weak" || this.state === "bad") && (r.strokeStyle = this.state === "bad" ? N.rejected : N.weak, r.lineWidth = 2, r.strokeRect(1, 1, a - 2, n - 2)), { points: this.points.length, vectors: this.vectors.length };
  }
  dispose() {
    this.clear(), this.canvas = null;
  }
}
function yo(e, t, o) {
  const r = e.createElement("div");
  r.className = "oc-row";
  const a = e.createElement("span");
  a.textContent = t;
  const n = e.createElement("span");
  return n.textContent = o, r.append(a, n), r;
}
function xo(e, t, o = "Nothing to show") {
  if (!e) return 0;
  const r = e.ownerDocument;
  if (e.replaceChildren(), !t.length) {
    const a = r.createElement("div");
    return a.className = "oc-empty", a.textContent = o, e.append(a), 0;
  }
  for (const [a, n] of t) e.append(yo(r, a, n));
  return t.length;
}
function wo(e, t, { onAction: o = () => {
}, onFrame: r = () => {
}, actions: a = {} } = {}) {
  if (!e) return 0;
  const n = e.ownerDocument;
  if (e.replaceChildren(), !t?.length) {
    const s = n.createElement("div");
    return s.className = "oc-empty", s.textContent = "No anomalies detected", e.append(s), 0;
  }
  for (const s of t) {
    const i = n.createElement("div");
    i.className = "oc-anomaly", i.dataset.level = String(s.level || "warn");
    const l = n.createElement("div");
    l.className = "oc-anomaly-text";
    const c = n.createElement("strong"), u = Number(s.start_frame ?? s.frame), m = Number(s.end_frame ?? s.frame);
    c.textContent = u === m ? `Frame ${u}` : `Frames ${u}-${m}`, c.tabIndex = 0, c.setAttribute("role", "button"), c.addEventListener("click", () => r(s.frame)), c.addEventListener("keydown", (p) => {
      (p.key === "Enter" || p.key === " ") && (p.preventDefault(), r(s.frame));
    });
    const d = n.createElement("small");
    d.textContent = `${String(s.level || "warn").toUpperCase()} · ${s.detail || s.kind || ""}`, l.append(c, d), i.append(l);
    const b = a[String(s.frame)] || s.suggested_action || "ignore";
    for (const p of ["interpolate", "ignore", "exclude"]) {
      const f = n.createElement("button");
      f.type = "button", f.textContent = p.toUpperCase(), f.dataset.action = p, f.dataset.frame = String(s.frame), p === b && f.setAttribute("aria-selected", "true"), f.addEventListener("click", () => o(s, p)), i.append(f);
    }
    e.append(i);
  }
  return t.length;
}
function ko(e) {
  return (e || []).map((t, o) => [`Note ${o + 1}`, String(t)]);
}
function So(e) {
  return import("./chunk-BerJaPhu.js").then(({ TrackViewer: t }) => (e.viewerLoad = null, e.disposed || e.viewer || (e.viewer = new t(e.$("track-canvas")), e.pushTracksToViewer()), e.viewer)).catch((t) => (e.viewerLoad = null, console.warn("OmniCam track viewer unavailable", t), null));
}
function at(e) {
  const t = e.$("frame");
  t && (t.value = String(e.state.frame));
  const o = e.$("time");
  o && (o.textContent = tt(e.state.frame, e.sourceViewer.fps));
  const r = e.$("frame-readout");
  r && (r.textContent = `${e.state.frame} / ${Math.max(0, e.state.frameCount - 1)} · ${tt(e.state.frame, e.sourceViewer.fps)}`);
  const a = We(e.state.quality, e.state.frame), n = ao(e.state.quality, e.currentHealth, e.state.frame);
  xo(e.$("quality-details"), [...a, ...n, ...ko(e.state.warnings)], "No solve yet");
}
function nt(e) {
  const t = e.$("extractor-ruler"), o = e.$("extractor-playhead"), r = Math.max(1, e.state.frameCount);
  if (!t || !o) return;
  const a = Math.min(12, r - 1 || 1);
  t.replaceChildren();
  for (let n = 0; n <= a; n += 1) {
    const s = Math.round(n / a * (r - 1)), i = `${n / a * 100}%`, l = t.ownerDocument.createElement("i");
    if (l.className = `oc-tick${n % 2 === 0 ? " major" : ""}`, l.style.left = i, t.append(l), n % 2 === 0) {
      const c = t.ownerDocument.createElement("span");
      c.className = "timeline-tick", c.style.left = i, c.textContent = String(s), t.append(c);
    }
  }
  o.style.left = `${Math.max(0, Math.min(r - 1, e.state.frame)) / Math.max(1, r - 1) * 100}%`;
}
function Eo(e, t) {
  return e?.widgets?.find((o) => o.name === t) || null;
}
const Co = [
  "state",
  "extractMode",
  "queuePromptId",
  "result",
  "rawSolve",
  "landmarks",
  "sourceKey"
];
class St {
  // `runtime` is the persistent ExtractorRuntime this workbench renders.
  constructor(t) {
    this.runtime = t;
    const o = t.node;
    this.node = o, this.app = Q, this.api = $, this.root = Be(), this.disposed = !1, this.events = new Tt(), this.requests = new Kt(), this.diagnostics = new _e(), this.upstreamPreviewActive = !1, this.motionLimits = null, this.refine = new Ee({ onRefine: (s) => this.requestRefine(s) }), this.fallbackViewer = new De(this.$("fallback-preview"), { api: $ }), this.sourceViewer = new Ae(this.$("source-video"), {
      onFrame: (s) => this.coordinator.seek(s, "media"),
      onMetadata: ({ frameCount: s }) => this.adoptSourceLength(s),
      onError: (s) => this.dispatch({ type: "SOURCE", source: { playbackError: s } }),
      onMode: () => this.render(),
      fallbackViewer: this.fallbackViewer
    }), this.coordinator = new Re({
      media: this.sourceViewer,
      getViewer: () => this.viewer,
      showDiagnostics: (s) => this.showDiagnostics(s),
      dispatch: (s) => this.dispatch(s),
      setFollow: (s) => this.sourceViewer.setFollow(s),
      frameCount: this.state.frameCount,
      fps: this.sourceViewer.fps,
      loop: !0,
      onPlaybackState: () => this.transport?.render()
    }), this.timeline = new lo(this.root, {
      onSeek: (s) => this.coordinator.seek(s, "timeline")
    }), this.transport = fo(this.root, {
      coordinator: this.coordinator,
      getState: () => this.state,
      getTrack: () => this.state.trackMode === "raw" ? this.result.raw : this.result.refined,
      on: (s, i, l) => this.events.on(s, i, l)
    }), this.overlay = new vo(this.$("tracking-overlay")), this.viewer = null, this.viewerLoad = null, this.reconstruction = new me({
      root: this.root,
      node: this.node,
      api: $,
      app: Q,
      getSource: () => this.state.source?.ref || null,
      onAdopt: (s) => Pt(this.node, s),
      // Scene Reconstruction Start / Stop run through the same partial queue as
      // Camera TRACK; the panel no longer owns a job manager.
      onQueue: () => this.startSolve("scene_reconstruct"),
      onCancel: () => this.cancelQueuedRun(),
      on: (s, i, l) => this.events.on(s, i, l)
    });
    const r = this.$("extract-mode-camera"), a = this.$("extract-mode-reconstruct");
    r && this.events.on(r, "click", () => this.setExtractMode("camera_track")), a && this.events.on(a, "click", () => this.setExtractMode("scene_reconstruct")), this.setExtractMode(this.extractMode);
    const n = this.$("clear-cache");
    n && this.events.on(n, "click", () => {
      n.disabled = !0, Promise.resolve().then(() => this.clearCache()).catch((s) => this.dispatch({ type: "FAILED", error: String(s?.message || s) })).finally(() => {
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
        const r = await $.fetchApi?.("/majoor/omnicam/motion_profiles", { signal: o });
        return r?.ok ? r.json() : void 0;
      });
      if (t === void 0) return;
      this.motionLimits = t?.profiles?.find((o) => o.id === "generic")?.limits || null, this.disposed || this.render();
    } catch {
    }
  }
  bindControls() {
    this.events.on(this.root, "wheel", _t(this.root));
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
    const t = je(this);
    return this.reconstruction && t && this.reconstruction.setSource(t.ref || t), t;
  }
  /**
   * Ask the server what this footage is, before anything is solved.
   *
   * Without it the panel knows a filename and nothing else: no rate, no frame
   * count, so the scrubber has no range and the strip has nothing to say.
   */
  async describeSource(t) {
    return gt(this, t);
  }
  /** Give the transport a real range, from the footage rather than a solve. */
  adoptSourceLength(t) {
    return H(this, t);
  }
  // -- solve control -----------------------------------------------------
  /**
   * Delete every cached reconstruction from disk and forget this node's own
   * cached results, in both modes: the camera-track scene/fingerprint/source
   * widgets (result-cache.js) and the reconstruction panel's job state.
   */
  async clearCache() {
    return te(this);
  }
  /** TRACK / Reconstruct Start -> a partial ComfyUI execution. See queue/ui-bridge.js. */
  startSolve(t = "camera_track") {
    return ye(this, t);
  }
  /** STOP -> cancel this panel's ComfyUI job. Idempotent. */
  cancelQueuedRun() {
    return ke(this);
  }
  syncPanelToNodeWidgets() {
    return xe(this);
  }
  prepareForQueuedRun() {
    return we(this);
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
      const o = await ee(this.api, this.rawSolve, t), r = o?.refined_track;
      if (!r?.keyframes?.length) return null;
      this.result = { ...this.result, refined: r };
      const a = String(o.fingerprint || "");
      return this.dispatch({ type: "REFINED", fingerprint: a }), this.pushTracksToViewer(), lt(this.node, { motionScene: ct(r), fingerprint: a }), o;
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
    const [r, a, n, s] = o.map(Number), i = (u) => Math.round(u * (180 / Math.PI) * 10) / 10, l = i(Math.atan2(2 * (s * r + a * n), 1 - 2 * (r * r + a * a))), c = i(Math.atan2(2 * (s * n + r * a), 1 - 2 * (a * a + n * n)));
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
      const { fingerprint: t } = Ne(this.node, {
        track: this.result.refined,
        state: this.state.solveState
      });
      this.dispatch({ type: "APPLIED", fingerprint: t });
    } catch (t) {
      const o = t instanceof A ? t.message : String(t?.message || t);
      this.dispatch({ type: "FAILED", error: o });
    }
  }
  // -- viewer ------------------------------------------------------------
  ensureViewer() {
    return this.viewer || this.disposed ? Promise.resolve(this.viewer) : (this.viewerLoad ||= So(this), this.viewerLoad);
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
    t && (t.dataset.tone = Vt(this.state.solveState), this.$("solve-status-text").textContent = Ut(this.state));
    const o = this.$("source-strip");
    o && (o.dataset.available = String(!!this.state.source.available), this.$("source-label").textContent = Bt(this.state.source));
    const r = Wt(this.state);
    for (const [v, E] of Object.entries({
      track: r.track,
      stop: r.stop,
      apply: r.apply
    })) {
      const w = this.root.querySelector(`[data-act="${v}"]`);
      w && (w.disabled = !E);
    }
    this.$("solve-detail").textContent = Gt(this.state), this.$("solve-percent").textContent = `${Math.round(this.state.progress * 100)}%`, this.$("progress-bar").style.width = `${Math.round(this.state.progress * 100)}%`;
    const a = this.$("solve-error");
    a.hidden = !this.state.error, a.textContent = this.state.error || "";
    const n = Ht(this.state), s = this.$("applied-state");
    s.dataset.state = n, s.textContent = n;
    const i = this.root.querySelector('[data-step="source"]'), l = this.root.querySelector('[data-step="track"]'), c = this.root.querySelector('[data-step="solve"]'), u = this.root.querySelector('[data-step="refine"]'), m = this.root.querySelector('[data-step="output"]');
    if (i && l && c && u && m) {
      const v = !!this.state.source?.available;
      i.dataset.state = v ? "completed" : "active";
      const E = this.state.solveState === "TRACKING", w = this.state.solveState === "SOLVING", C = this.state.solveState === "FAILED", M = this.state.solveState === "COMPLETED";
      l.dataset.state = E ? "active" : M || w || this.rawSolve ? "completed" : C && !this.rawSolve ? "error" : "pending", c.dataset.state = w ? "active" : M ? "completed" : C && this.rawSolve ? "error" : "pending";
      const K = n === "APPLIED";
      u.dataset.state = K ? "completed" : M ? "active" : "pending", m.dataset.state = K ? "completed" : "pending";
    }
    for (const v of this.root.querySelectorAll("[data-tab]"))
      v.setAttribute("aria-selected", String(v.dataset.tab === this.state.viewerMode));
    for (const v of this.root.querySelectorAll("[data-track-mode]"))
      v.setAttribute("aria-selected", String(v.dataset.trackMode === this.state.trackMode));
    const d = this.state.viewerMode, b = d === "source", p = d === "track3d", f = this.$("stage");
    f && (f.dataset.mode = d), Yt(this, b), this.$("tracking-overlay").hidden = !0, this.$("track-canvas").hidden = !p, this.root.querySelector('[data-role="views"]').hidden = !p;
    const y = this.$("scrubber");
    y && (y.max = String(Math.max(0, this.state.frameCount - 1)));
    const k = this.$("frame");
    k && (k.max = String(Math.max(0, this.state.frameCount - 1)));
    const S = this.$("frame-total");
    S && (S.textContent = `/ ${Math.max(0, this.state.frameCount - 1)}`);
    const g = this.$("extractor-fps");
    g && (g.textContent = String(this.sourceViewer.fps || 24)), wo(this.$("anomalies"), this.state.anomalies, {
      actions: this.refine.settings.spike_actions,
      onFrame: (v) => this.coordinator.seek(v, "anomaly"),
      onAction: (v, E) => {
        const w = Number(v.start_frame ?? v.frame) || 0, C = Math.max(w, Number(v.end_frame ?? v.frame) || w);
        for (let M = w; M <= C; M += 1) this.refine.setSpikeAction(M, E);
        this.render();
      }
    }), this.renderTimeline(), this.transport.render(), at(this), nt(this);
    const x = this.$("stage-notice");
    if (x) {
      const v = this.state.source.playbackError || (this.upstreamPreviewActive ? "Preview only -- connect Load Video, or run the graph once, to track this source." : "");
      x.hidden = !v || !b, x.textContent = v;
    }
  }
  /**
   * The read-only solved camera channels, aligned to the source frame clock.
   */
  renderTimeline() {
    const t = this.state.trackMode === "raw" ? this.result.raw : this.result.refined;
    return this.currentHealth = Je(t, this.motionLimits), this.timeline.render({
      track: t,
      health: this.currentHealth,
      quality: this.state.quality,
      anomalies: this.state.anomalies,
      frame: this.state.frame,
      frameCount: this.state.frameCount
    });
  }
  renderFrameReadouts() {
    return at(this);
  }
  /** Keep the read-only solve sheet on the exact same frame axis as playback. */
  renderExtractorRuler() {
    nt(this);
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
    const s = this.$("extract-mode-reconstruct");
    if (s && (s.setAttribute("aria-selected", o ? "true" : "false"), s.classList.toggle("active", o)), o && this.reconstruction) {
      const l = this.state.source?.ref || this.state.source;
      l && this.reconstruction.setSource(l);
    }
    const i = Eo(this.node, "extract_mode");
    i && i.value !== t && (i.value = t, this.node.setDirtyCanvas?.(!0, !0));
  }
  // Visual/media disposal only. A queued solve outlives this workbench --
  // closing it must not cancel the job (migration plan Task 13); only true
  // node removal (ExtractorRuntime.dispose()) does that.
  dispose() {
    this.reconstruction?.dispose(), this.disposed = !0, Nt(), this.requests.dispose(), this.refine.dispose(), this.coordinator.dispose(), this.sourceViewer.dispose(), this.overlay.dispose(), this.diagnostics.dispose(), this.viewer?.dispose(), this.viewer = null, this.viewerLoad = null, this.events.dispose();
  }
}
for (const e of Co)
  Object.defineProperty(St.prototype, e, {
    configurable: !0,
    enumerable: !0,
    get() {
      return this.runtime[e];
    },
    set(t) {
      this.runtime[e] = t;
    }
  });
function Lo(e) {
  const t = new St(e);
  return e.attachWorkbench(t), e.node.__majoorOmniCamExtractor = t, e.pendingSourceResync && (e.pendingSourceResync = !1, t.refreshSource()), e.reconstructionResult && t.reconstruction?.acceptQueuedResult(e.reconstructionResult), t;
}
function Io(e) {
  e.dispose(), e.runtime.detachWorkbench(e), e.node.__majoorOmniCamExtractor === e && delete e.node.__majoorOmniCamExtractor;
}
export {
  St as ExtractorUI,
  Io as closeExtractorWorkbench,
  Lo as openExtractorWorkbench
};
