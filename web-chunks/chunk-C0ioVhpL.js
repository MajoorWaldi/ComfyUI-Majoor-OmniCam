import { v as s } from "./chunk-GvJ-GQpX.js";
import "../../scripts/app.js";
import { api as C } from "../../scripts/api.js";
import { e as c, d as v, c as w, w as m, W as y } from "./chunk-CcMjp6yC.js";
function h(t) {
  return Array.isArray(t) && t.length === 1 ? t[0] : t;
}
function O(t) {
  const e = t?.ui && typeof t.ui == "object" ? t.ui : t || {}, i = Array.isArray(e.preflight) && e.preflight.length === 1 && Array.isArray(e.preflight[0]) ? e.preflight[0] : e.preflight, r = h(e.capabilities), n = h(e.target_profile);
  return {
    targetProfile: typeof n == "string" ? n : "",
    preflight: Array.isArray(i) ? i : [],
    capabilities: r && typeof r == "object" ? r : { capabilities: [] }
  };
}
function E(t) {
  const e = v(t.state), i = t.message ? `<br><small>${c(t.message)}</small>` : "";
  return `<div class="oc-row"><span><strong>${c(t.label || t.id)}</strong>${i}</span><span class="oc-state" data-state="${e}">${c(t.state || "UNKNOWN")}</span></div>`;
}
function S(t, e, i = !1) {
  const r = i ? t ? s("LIVE — WOULD BLOCK") : s("LIVE PREVIEW") : t ? s("NO OUTPUT") : s("OUTPUT GENERATED");
  return e ? `${r} · ${e}` : r;
}
function V(t, e, { live: i = !1 } = {}) {
  const r = O(e), n = t.querySelector('[data-role="profile-preflight"]');
  n.innerHTML = r.preflight.length ? r.preflight.map(E).join("") : `<div class="oc-empty">${c(s("No preflight checks returned."))}</div>`;
  const o = Array.isArray(r.capabilities.capabilities) ? r.capabilities.capabilities : [], l = t.querySelector('[data-role="profile-capabilities"]');
  l.innerHTML = o.length ? o.map((u) => `<div class="oc-row"><span>${c(u.display || u.adapter)}</span><span class="oc-state" data-state="${v(u.state)}">${c(u.state)}</span></div>`).join("") : `<div class="oc-empty">${c(s("No optional downstream capability detected."))}</div>`;
  const a = r.preflight.some((u) => String(u.state).toUpperCase() === s("BLOCKED")), f = t.querySelector('[data-role="monitor-status"]');
  return f.dataset.state = a ? s("BLOCKED") : s("READY"), f.lastChild.textContent = a ? " " + s("BLOCKED") : " " + s("READY"), t.querySelector('[data-role="output-status"]').textContent = S(a, r.targetProfile, i), r;
}
const g = "majoor.omnicam.monitor.preflight", P = 1;
function R(t, e, i) {
  const r = (n) => {
    const o = n?.detail;
    !o || Number(o.schema_version) !== P || o.kind === "blocked_preflight" && String(o.node) === String(e.id) && (!o.output || i.disposed || i.blockedPreflight(o.output));
  };
  return t.addEventListener(g, r), () => {
    t.removeEventListener?.(g, r);
  };
}
class T extends EventTarget {
  constructor(e, i) {
    super(), this.node = e, this.disposed = !1, this.result = null, this.executed = !1, this.status = s("Ready"), this.previewDataUrl = null, this.previewVideoUrl = null, this.unsubscribe = R(i, e, this);
  }
  receive(e, i = !0) {
    if (this.disposed) return;
    this.result = structuredClone(e), this.executed = i;
    const r = O(e);
    this.status = r.preflight.some((o) => o.state === "BLOCKED") ? s("Blocked") : s("Output generated");
    const n = this.node.__majoorOmniCamMonitorWorkbench;
    n && !n.disposed && this.restore(n), this.dispatchEvent(new Event("change"));
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
const d = [
  "base_prompt",
  "target_profile",
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps"
];
function j(t) {
  for (const e of t.widgets || [])
    d.includes(e.name) && (e.computeSize = () => [0, -4], e.draw = () => {
    }, e.hidden = !0, e.options = { ...e.options || {}, hideInVueNodes: !0 });
}
const N = /* @__PURE__ */ new Set([
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps"
]);
function M(t, e) {
  return t?.widgets?.find((i) => i.name === e);
}
function U(t) {
  return Object.fromEntries(d.map((e) => [e, M(t, e)?.value]));
}
function $(t, e, i) {
  if (!d.includes(e)) return !1;
  const r = M(t, e);
  return r ? (r.value = N.has(e) ? Number(i) : i, r.callback?.(r.value), !0) : !1;
}
function A(t) {
  return String(t || "").startsWith("h3_");
}
function p(t, e) {
  const n = (U(t).target_profile || "external_reference_video").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  e.setTitle(s("OmniCam Monitor")), e.setMeta(`${s("Target")}: ${n}`);
  const o = t.__majoorOmniCamMonitorRuntime;
  e.setStatus(o?.status || s("Ready")), o?.previewVideoUrl ? e.setPreviewVideo(o.previewVideoUrl) : (e.setPreviewVideo(null), e.setPreview(o?.previewDataUrl ?? null));
}
async function _(t, e) {
  try {
    const i = t.__majoorOmniCamMonitorRuntime, r = t.__majoorOmniCamMonitorWorkbench, n = r?.currentPlayblastVideoUrl?.() || "";
    if (i && (i.previewVideoUrl = n || null), !n) {
      const o = await r?.capturePreviewDataUrl?.();
      i && o && (i.previewDataUrl = o);
    }
    p(t, e);
  } catch (i) {
    console.warn("[OmniCam] Monitor preview capture failed", i);
  }
}
function I(t) {
  return `monitor:${t.id}`;
}
async function b(t, e) {
  const i = I(t);
  return m.open({
    key: i,
    nodeId: t.id,
    opener: e,
    createSession: async () => {
      const { openMonitorWorkbench: r, closeMonitorWorkbench: n } = await import("./chunk-D8mqz2fD.js");
      if (t.__majoorOmniCamMonitorRuntime?.disposed) return null;
      const o = r(t), l = new y({
        kind: "monitor",
        nodeId: t.id,
        title: s("OmniCam Monitor"),
        onRequestClose: (a) => m.close(i, a),
        onResize: () => o.refreshPlayblastPreview?.()
      });
      return l.mount(o.root), {
        key: i,
        nodeId: t.id,
        host: l,
        close: async () => (await _(t, t.__majoorOmniCamMonitorShell), n(o), l.dispose(), !0),
        dispose: () => {
          _(t, t.__majoorOmniCamMonitorShell), n(o), l.dispose();
        }
      };
    }
  });
}
function W(t) {
  if (t.__majoorOmniCamMonitorShell) return t.__majoorOmniCamMonitorShell;
  j(t);
  const e = new T(t, C);
  t.__majoorOmniCamMonitorRuntime = e;
  const i = w({
    kind: "monitor",
    title: s("OmniCam Monitor"),
    buttonLabel: s("OPEN MONITOR"),
    onOpen: (a) => {
      b(t, a.currentTarget);
    }
  });
  t.__majoorOmniCamMonitorShell = i, t.__majoorOmniCamMonitor = i, e.shell = i, e.addEventListener("change", () => p(t, i)), t.openMonitorWorkbench = (a) => b(t, a), p(t, i), t.addDOMWidget("majoor_omnicam_monitor_shell", "omnicam", i.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 124,
    getHeight: () => 124,
    getMaxHeight: () => 124
  });
  const r = t.onRemoved;
  t.onRemoved = function(...a) {
    m.disposeForNode(t.id), e.dispose(), i.dispose?.(), r?.apply(this, a);
  };
  const n = t.onExecuted;
  t.onExecuted = function(a) {
    n?.apply(this, arguments), e.receive(a), p(t, i);
  };
  const o = t.onConfigure;
  t.onConfigure = function(...a) {
    o?.apply(this, a), p(t, i);
  };
  const l = t.onConnectionsChange;
  return t.onConnectionsChange = function(...a) {
    l?.apply(this, a), p(t, i);
  }, i;
}
const H = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachMonitorShell: W
}, Symbol.toStringTag, { value: "Module" }));
export {
  d as M,
  R as b,
  j as h,
  A as i,
  U as m,
  V as r,
  H as s,
  $ as w
};
