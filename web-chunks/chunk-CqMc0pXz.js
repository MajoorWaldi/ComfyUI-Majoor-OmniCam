import { v as n } from "./chunk-1zyvhFxD.js";
import "../../scripts/app.js";
import { api as P } from "../../scripts/api.js";
import { e as a, d as E, c as R, w as m, W as N } from "./chunk-hCbwK_eG.js";
function b(t) {
  return Array.isArray(t) && t.length === 1 ? t[0] : t;
}
function S(t) {
  const e = t?.ui && typeof t.ui == "object" ? t.ui : t || {}, i = Array.isArray(e.preflight) && e.preflight.length === 1 && Array.isArray(e.preflight[0]) ? e.preflight[0] : e.preflight, r = b(e.capabilities), s = b(e.target_profile);
  return {
    targetProfile: typeof s == "string" ? s : "",
    preflight: Array.isArray(i) ? i : [],
    capabilities: r && typeof r == "object" ? r : { capabilities: [] }
  };
}
function $(t) {
  return !Array.isArray(t.suggestions) || !t.suggestions.length ? "" : `<ul class="oc-suggestions">${t.suggestions.map((e) => `<li>${a(e)}</li>`).join("")}</ul>`;
}
function y(t) {
  const e = E(t.state), i = t.message ? `<br><small>${a(t.message)}</small>` : "", r = t.recoverable ? ` <span class="oc-recoverable">${a(n("recoverable"))}</span>` : "";
  return `<div class="oc-row"${t.code ? ` data-code="${a(t.code)}"` : ""}><span><strong>${a(t.label || t.id)}</strong>${r}${i}${$(t)}</span><span class="oc-state" data-state="${e}">${a(t.state || "UNKNOWN")}</span></div>`;
}
function U(t) {
  const e = t.message ? `<br><small>${a(t.message)}</small>` : "";
  return `<div class="oc-row"><span><strong>${a(t.label || t.id)}</strong>${e}${$(t)}</span><span class="oc-mapping-quality" data-quality="${a(t.mapping_quality)}">${a(t.mapping_quality)}</span></div>`;
}
function M(t) {
  return String(t.id || "").startsWith("guide_health_");
}
function x(t, e, i = !1) {
  const r = i ? t ? n("LIVE — WOULD BLOCK") : n("LIVE PREVIEW") : t ? n("NO OUTPUT") : n("OUTPUT GENERATED");
  return e ? `${r} · ${e}` : r;
}
function z(t, e, { live: i = !1 } = {}) {
  const r = S(e), s = r.preflight.filter((c) => c.mapping_quality), o = r.preflight.filter(M), u = r.preflight.filter((c) => !c.mapping_quality && !M(c)), l = t.querySelector('[data-role="profile-preflight"]');
  l.innerHTML = u.length ? u.map(y).join("") : `<div class="oc-empty">${a(n("No preflight checks returned."))}</div>`;
  const g = t.querySelector('[data-role="profile-diff"]');
  g && (g.innerHTML = s.length ? s.map(U).join("") : `<div class="oc-empty">${a(n("No mapping-quality diagnostics for this compile."))}</div>`);
  const h = t.querySelector('[data-role="profile-health"]');
  h && (h.innerHTML = o.length ? o.map(y).join("") : `<div class="oc-empty">${a(n("No guide-health warnings."))}</div>`);
  const _ = Array.isArray(r.capabilities.capabilities) ? r.capabilities.capabilities : [], T = t.querySelector('[data-role="profile-capabilities"]');
  T.innerHTML = _.length ? _.map((c) => `<div class="oc-row"><span>${a(c.display || c.adapter)}</span><span class="oc-state" data-state="${E(c.state)}">${a(c.state)}</span></div>`).join("") : `<div class="oc-empty">${a(n("No optional downstream capability detected."))}</div>`;
  const d = r.preflight.some((c) => String(c.state).toUpperCase() === n("BLOCKED")), v = t.querySelector('[data-role="monitor-status"]');
  return v.dataset.state = d ? n("BLOCKED") : n("READY"), v.lastChild.textContent = d ? " " + n("BLOCKED") : " " + n("READY"), t.querySelector('[data-role="output-status"]').textContent = x(d, r.targetProfile, i), r;
}
const O = "majoor.omnicam.monitor.preflight", L = 1;
function W(t, e, i) {
  const r = (s) => {
    const o = s?.detail;
    !o || Number(o.schema_version) !== L || o.kind === "blocked_preflight" && String(o.node) === String(e.id) && (!o.output || i.disposed || i.blockedPreflight(o.output));
  };
  return t.addEventListener(O, r), () => {
    t.removeEventListener?.(O, r);
  };
}
class I extends EventTarget {
  constructor(e, i) {
    super(), this.node = e, this.disposed = !1, this.result = null, this.executed = !1, this.status = n("Ready"), this.previewDataUrl = null, this.previewVideoUrl = null, this.unsubscribe = W(i, e, this);
  }
  receive(e, i = !0) {
    if (this.disposed) return;
    this.result = structuredClone(e), this.executed = i;
    const r = S(e);
    this.status = r.preflight.some((o) => o.state === "BLOCKED") ? n("Blocked") : n("Output generated");
    const s = this.node.__majoorOmniCamMonitorWorkbench;
    s && !s.disposed && this.restore(s), this.dispatchEvent(new Event("change"));
  }
  blockedPreflight(e) {
    this.receive(e, !1);
  }
  restore(e) {
    this.result && (this.executed ? e.executed(this.result) : e.blockedPreflight(this.result));
  }
  dispose() {
    this.disposed = !0, this.unsubscribe?.(), this.result = null;
  }
}
const f = [
  "base_prompt",
  "target_profile",
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps",
  "guide_reference_index",
  "guide_style",
  "reference_plan_json"
];
function A(t) {
  for (const e of t.widgets || [])
    f.includes(e.name) && (e.computeSize = () => [0, -4], e.draw = () => {
    }, e.hidden = !0, e.options = { ...e.options || {}, hideInVueNodes: !0 });
}
const D = /* @__PURE__ */ new Set([
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps",
  "guide_reference_index"
]);
function j(t, e) {
  return t?.widgets?.find((i) => i.name === e);
}
function V(t) {
  return Object.fromEntries(f.map((e) => [e, j(t, e)?.value]));
}
function F(t, e, i) {
  if (!f.includes(e)) return !1;
  const r = j(t, e);
  return r ? (r.value = D.has(e) ? Number(i) : i, r.callback?.(r.value), !0) : !1;
}
function Y(t) {
  return String(t || "").startsWith("h3_");
}
function p(t, e) {
  const s = (V(t).target_profile || "external_reference_video").replace(/_/g, " ").replace(/\b\w/g, (u) => u.toUpperCase());
  e.setTitle(n("OmniCam Monitor")), e.setMeta(`${n("Target")}: ${s}`);
  const o = t.__majoorOmniCamMonitorRuntime;
  e.setStatus(o?.status || n("Ready")), o?.previewVideoUrl ? e.setPreviewVideo(o.previewVideoUrl) : (e.setPreviewVideo(null), e.setPreview(o?.previewDataUrl ?? null));
}
async function C(t, e) {
  try {
    const i = t.__majoorOmniCamMonitorRuntime, r = t.__majoorOmniCamMonitorWorkbench, s = r?.currentPlayblastVideoUrl?.() || "";
    if (i && (i.previewVideoUrl = s || null), !s) {
      const o = await r?.capturePreviewDataUrl?.();
      i && o && (i.previewDataUrl = o);
    }
    p(t, e);
  } catch (i) {
    console.warn("[OmniCam] Monitor preview capture failed", i);
  }
}
function q(t) {
  return `monitor:${t.id}`;
}
async function w(t, e) {
  const i = q(t);
  return m.open({
    key: i,
    nodeId: t.id,
    opener: e,
    createSession: async () => {
      const { openMonitorWorkbench: r, closeMonitorWorkbench: s } = await import("./chunk-3qUJOI_x.js");
      if (t.__majoorOmniCamMonitorRuntime?.disposed) return null;
      const o = r(t), u = new N({
        kind: "monitor",
        nodeId: t.id,
        title: n("OmniCam Monitor"),
        onRequestClose: (l) => m.close(i, l),
        onResize: () => o.refreshPlayblastPreview?.()
      });
      return u.mount(o.root), {
        key: i,
        nodeId: t.id,
        host: u,
        close: async () => (await C(t, t.__majoorOmniCamMonitorShell), s(o), u.dispose(), !0),
        dispose: () => {
          C(t, t.__majoorOmniCamMonitorShell), s(o), u.dispose();
        }
      };
    }
  });
}
function H(t) {
  if (t.__majoorOmniCamMonitorShell) return t.__majoorOmniCamMonitorShell;
  A(t);
  const e = new I(t, P);
  t.__majoorOmniCamMonitorRuntime = e;
  const i = R({
    kind: "monitor",
    title: n("OmniCam Monitor"),
    buttonLabel: n("OPEN MONITOR"),
    onOpen: (l) => {
      w(t, l.currentTarget);
    }
  });
  t.__majoorOmniCamMonitorShell = i, t.__majoorOmniCamMonitor = i, e.shell = i, e.addEventListener("change", () => p(t, i)), t.openMonitorWorkbench = (l) => w(t, l), p(t, i), t.addDOMWidget("majoor_omnicam_monitor_shell", "omnicam", i.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 124,
    getHeight: () => 124,
    getMaxHeight: () => 124
  });
  const r = t.onRemoved;
  t.onRemoved = function(...l) {
    m.disposeForNode(t.id), e.dispose(), i.dispose?.(), r?.apply(this, l);
  };
  const s = t.onExecuted;
  t.onExecuted = function(l) {
    s?.apply(this, arguments), e.receive(l), p(t, i);
  };
  const o = t.onConfigure;
  t.onConfigure = function(...l) {
    o?.apply(this, l), p(t, i);
  };
  const u = t.onConnectionsChange;
  return t.onConnectionsChange = function(...l) {
    u?.apply(this, l), p(t, i);
  }, i;
}
const Q = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachMonitorShell: H
}, Symbol.toStringTag, { value: "Module" }));
export {
  f as M,
  W as b,
  A as h,
  Y as i,
  V as m,
  z as r,
  Q as s,
  F as w
};
