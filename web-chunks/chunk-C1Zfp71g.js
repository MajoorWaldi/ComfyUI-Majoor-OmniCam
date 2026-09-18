import { v as s } from "./chunk-d8qZJB0s.js";
import "../../scripts/app.js";
import { api as M } from "../../scripts/api.js";
import { e as c, d as b, c as y, w as d, W as C } from "./chunk-DsoefGi0.js";
function m(t) {
  return Array.isArray(t) && t.length === 1 ? t[0] : t;
}
function O(t) {
  const e = t?.ui && typeof t.ui == "object" ? t.ui : t || {}, i = Array.isArray(e.preflight) && e.preflight.length === 1 && Array.isArray(e.preflight[0]) ? e.preflight[0] : e.preflight, r = m(e.capabilities), n = m(e.target_profile);
  return {
    targetProfile: typeof n == "string" ? n : "",
    preflight: Array.isArray(i) ? i : [],
    capabilities: r && typeof r == "object" ? r : { capabilities: [] }
  };
}
function v(t) {
  const e = b(t.state), i = t.message ? `<br><small>${c(t.message)}</small>` : "";
  return `<div class="oc-row"><span><strong>${c(t.label || t.id)}</strong>${i}</span><span class="oc-state" data-state="${e}">${c(t.state || "UNKNOWN")}</span></div>`;
}
function S(t, e, i = !1) {
  const r = i ? t ? s("LIVE — WOULD BLOCK") : s("LIVE PREVIEW") : t ? s("NO OUTPUT") : s("OUTPUT GENERATED");
  return e ? `${r} · ${e}` : r;
}
function A(t, e, { live: i = !1 } = {}) {
  const r = O(e), n = t.querySelector('[data-role="profile-preflight"]');
  n.innerHTML = r.preflight.length ? r.preflight.map(v).join("") : `<div class="oc-empty">${c(s("No preflight checks returned."))}</div>`;
  const o = Array.isArray(r.capabilities.capabilities) ? r.capabilities.capabilities : [], l = t.querySelector('[data-role="profile-capabilities"]');
  l.innerHTML = o.length ? o.map((u) => `<div class="oc-row"><span>${c(u.display || u.adapter)}</span><span class="oc-state" data-state="${b(u.state)}">${c(u.state)}</span></div>`).join("") : `<div class="oc-empty">${c(s("No optional downstream capability detected."))}</div>`;
  const a = r.preflight.some((u) => String(u.state).toUpperCase() === s("BLOCKED")), h = t.querySelector('[data-role="monitor-status"]');
  return h.dataset.state = a ? s("BLOCKED") : s("READY"), h.lastChild.textContent = a ? " " + s("BLOCKED") : " " + s("READY"), t.querySelector('[data-role="output-status"]').textContent = S(a, r.targetProfile, i), r;
}
const g = "majoor.omnicam.monitor.preflight", R = 1;
function T(t, e, i) {
  const r = (n) => {
    const o = n?.detail;
    !o || Number(o.schema_version) !== R || o.kind === "blocked_preflight" && String(o.node) === String(e.id) && (!o.output || i.disposed || i.blockedPreflight(o.output));
  };
  return t.addEventListener(g, r), () => {
    t.removeEventListener?.(g, r);
  };
}
class w extends EventTarget {
  constructor(e, i) {
    super(), this.node = e, this.disposed = !1, this.result = null, this.executed = !1, this.status = s("Ready"), this.unsubscribe = T(i, e, this);
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
const f = [
  "base_prompt",
  "target_profile",
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps"
];
function N(t) {
  for (const e of t.widgets || [])
    f.includes(e.name) && (e.computeSize = () => [0, -4], e.draw = () => {
    }, e.hidden = !0, e.options = { ...e.options || {}, hideInVueNodes: !0 });
}
const P = /* @__PURE__ */ new Set([
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps"
]);
function E(t, e) {
  return t?.widgets?.find((i) => i.name === e);
}
function j(t) {
  return Object.fromEntries(f.map((e) => [e, E(t, e)?.value]));
}
function D(t, e, i) {
  if (!f.includes(e)) return !1;
  const r = E(t, e);
  return r ? (r.value = P.has(e) ? Number(i) : i, r.callback?.(r.value), !0) : !1;
}
function H(t) {
  return String(t || "").startsWith("h3_");
}
function p(t, e) {
  const n = (j(t).target_profile || "external_reference_video").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  e.setTitle(s("OmniCam Monitor")), e.setMeta(`${s("Target")}: ${n}`);
  const o = t.__majoorOmniCamMonitorRuntime?.status || s("Ready");
  e.setStatus(o);
}
function I(t) {
  return `monitor:${t.id}`;
}
async function _(t, e) {
  const i = I(t);
  return d.open({
    key: i,
    nodeId: t.id,
    opener: e,
    createSession: async () => {
      const { openMonitorWorkbench: r, closeMonitorWorkbench: n } = await import("./chunk-DYRzFivo.js");
      if (t.__majoorOmniCamMonitorRuntime?.disposed) return null;
      const o = r(t), l = new C({
        kind: "monitor",
        nodeId: t.id,
        title: s("OmniCam Monitor"),
        onRequestClose: (a) => d.close(i, a),
        onResize: () => o.refreshPlayblastPreview?.()
      });
      return l.mount(o.root), {
        key: i,
        nodeId: t.id,
        host: l,
        close: async () => (n(o), l.dispose(), !0),
        dispose: () => {
          n(o), l.dispose();
        }
      };
    }
  });
}
function x(t) {
  if (t.__majoorOmniCamMonitorShell) return t.__majoorOmniCamMonitorShell;
  N(t);
  const e = new w(t, M);
  t.__majoorOmniCamMonitorRuntime = e;
  const i = y({
    kind: "monitor",
    title: s("OmniCam Monitor"),
    buttonLabel: s("OPEN MONITOR"),
    onOpen: (a) => {
      _(t, a.currentTarget);
    }
  });
  t.__majoorOmniCamMonitorShell = i, t.__majoorOmniCamMonitor = i, e.shell = i, e.addEventListener("change", () => p(t, i)), t.openMonitorWorkbench = (a) => _(t, a), p(t, i), t.addDOMWidget("majoor_omnicam_monitor_shell", "omnicam", i.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 124,
    getHeight: () => 124,
    getMaxHeight: () => 124
  });
  const r = t.onRemoved;
  t.onRemoved = function(...a) {
    d.disposeForNode(t.id), e.dispose(), i.dispose?.(), r?.apply(this, a);
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
const U = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attachMonitorShell: x
}, Symbol.toStringTag, { value: "Module" }));
export {
  f as M,
  T as b,
  N as h,
  H as i,
  j as m,
  A as r,
  U as s,
  D as w
};
