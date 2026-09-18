import { T as u, v as b } from "./chunk-d8qZJB0s.js";
const x = `
  --oc-bg-app: var(--bg-color, #0B1018);
  --oc-bg-panel: var(--comfy-menu-bg, #111827);
  --oc-bg-control: var(--comfy-input-bg, #151D2A);
  --oc-bg-sunken: var(--comfy-input-bg, #080C14);
  --oc-border-default: var(--border-color, #263143);
  --oc-border-subtle: var(--border-color, #1B2433);
  --oc-text-primary: var(--input-text, #E9EDF5);
  --oc-text-secondary: var(--input-text, #8F9AAF);
  --oc-text-muted: var(--input-text, #98A3B8);
`, f = "majoor-omnicam-workbench-styles", k = `
  .oc-workbench-backdrop,.oc-node-shell{${x}}
  .oc-workbench-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,12,0.82);backdrop-filter:blur(3px)}
  .oc-workbench-window{display:flex;flex-direction:column;width:min(96vw,1920px);height:92dvh;min-width:0;min-height:0;max-width:100vw;max-height:100dvh;background:var(--oc-bg-app);border:1px solid var(--oc-border-default);border-radius:8px;box-shadow:0 24px 64px rgba(0,0,0,0.7);overflow:hidden;outline:none}
  .oc-workbench-window.is-maximized{width:100vw;height:100vh;min-width:0;min-height:0;border-radius:0;border:none}
  .oc-workbench-header{display:flex;align-items:center;gap:10px;min-height:40px;padding:6px 12px;background:var(--oc-bg-panel);border-bottom:1px solid var(--oc-border-default);flex:none}
  .oc-workbench-title{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--oc-text-primary);font:600 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .oc-workbench-actions{display:flex;align-items:center;gap:6px;flex:none}
  .oc-workbench-actions button{display:inline-grid;place-items:center;width:28px;height:28px;padding:0;color:var(--oc-text-secondary);background:var(--oc-bg-control);border:1px solid var(--oc-border-default);border-radius:6px;cursor:pointer;transition:all .15s ease}
  .oc-workbench-actions button:hover{background:var(--oc-bg-control);border-color:${u.accent};color:var(--oc-text-primary)}
  .oc-workbench-actions button:focus-visible{outline:2px solid ${u.accent};outline-offset:2px}
  /* auto, not hidden: the embedded editor's natural content height (built for
     a graph node that grows to fit it) can exceed a modest 92vh window on a
     short viewport. Clipping it with overflow:hidden would silently strand
     bottom controls (e.g. the sequence lane) outside the hit-testable area
     instead of just requiring a scroll to reach them. */
  .oc-workbench-content{position:relative;flex:1 1 auto;min-height:0;overflow:auto}
  .oc-workbench-content>*{width:100%;height:100%}
  /* Director's own root (.majoor-omnicam.oc-director, template.js/shell.js)
     is now a bounded flex column that fits this box on its own -- .oc-dock
     scrolls internally instead. Scoped by the host's own data-kind attribute
     (host.js) so Extractor/Monitor keep the overflow:auto fallback above,
     since their content still grows to fit the old always-mounted-node way. */
  .oc-workbench-backdrop[data-kind="director"] .oc-workbench-content{overflow:hidden}
  .oc-workbench-backdrop[data-kind="extractor"] .oc-workbench-content{overflow:hidden}
  .oc-workbench-backdrop[data-kind="monitor"] .oc-workbench-content{overflow:auto}

  .oc-node-shell{display:flex;flex-direction:column;gap:6px;width:100%;height:100%;padding:8px 10px;box-sizing:border-box;font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--oc-text-secondary);background:var(--oc-bg-panel);border:1px solid var(--oc-border-default);border-radius:8px}
  .oc-node-shell-title{font-weight:700;color:var(--oc-text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-meta{color:var(--oc-text-secondary);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-status{color:var(--oc-text-secondary);font-size:11px}
  .oc-node-shell-progress{position:relative;height:5px;border-radius:3px;background:var(--oc-bg-control);border:1px solid var(--oc-border-default);overflow:hidden;display:none}
  .oc-node-shell-progress[data-active="true"]{display:block}
  .oc-node-shell-progress>span{display:block;height:100%;background:${u.accent};width:0%;transition:width .15s ease}
  .oc-node-shell-open{margin-top:auto;padding:6px 10px;border-radius:6px;background:${u.accent};border:1px solid ${u.accent};color:#fff;font-weight:600;cursor:pointer;transition:filter .15s ease}
  .oc-node-shell-open:hover{filter:brightness(1.12)}
  .oc-node-shell-open:focus-visible{outline:2px solid ${u.accent};outline-offset:2px}
`;
function v(n = document) {
  if (n.getElementById(f)) return;
  const e = n.createElement("style");
  e.id = f, e.textContent = k, n.head.append(e);
}
function q({ kind: n, title: e, buttonLabel: t, onOpen: s }) {
  v(document);
  const i = document.createElement("div");
  i.className = "oc-node-shell", i.dataset.shellKind = n;
  const o = document.createElement("div");
  o.className = "oc-node-shell-title", o.textContent = e ?? "";
  const r = document.createElement("div");
  r.className = "oc-node-shell-meta";
  const d = document.createElement("div");
  d.className = "oc-node-shell-status";
  const c = document.createElement("div");
  c.className = "oc-node-shell-progress";
  const l = document.createElement("span");
  c.append(l);
  const h = document.createElement("button");
  h.type = "button", h.className = "oc-node-shell-open", h.textContent = t ?? "Open", i.append(o, r, d, c, h);
  const p = new AbortController();
  return h.addEventListener("click", (a) => s?.(a), { signal: p.signal }), {
    root: i,
    openButton: h,
    setTitle(a) {
      o.textContent = a ?? "";
    },
    setMeta(a) {
      r.textContent = a ?? "";
    },
    setStatus(a) {
      d.textContent = a ?? "";
    },
    setProgress(a) {
      if (a == null) {
        c.dataset.active = "false";
        return;
      }
      c.dataset.active = "true";
      const g = Math.max(0, Math.min(1, a));
      l.style.width = `${(g * 100).toFixed(1)}%`;
    },
    dispose() {
      p.abort();
    }
  };
}
function w(n) {
  return String(n ?? "").replace(/[&<>"']/g, (e) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[e]);
}
const m = {
  verified: "pass",
  detected_unverified: "warning",
  incompatible: "blocked",
  missing: "blocked"
};
function T(n) {
  const e = String(n || "").toLowerCase();
  return e in m ? m[e] : ["ready", "warning", "blocked", "risk", "pass", "connected", "unknown"].includes(e) ? e : "unknown";
}
const y = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function _(n) {
  return !!(n.offsetWidth || n.offsetHeight || n.getClientRects?.().length);
}
function S(n) {
  return [...n.querySelectorAll(y)].filter(_);
}
function E(n) {
  let e = !1, t = null, s = null;
  function i(o) {
    if (o.key !== "Tab") return;
    const r = S(n);
    if (!r.length) {
      o.preventDefault(), n.focus();
      return;
    }
    const d = r[0], c = r[r.length - 1], l = n.ownerDocument?.activeElement ?? document.activeElement;
    o.shiftKey ? (l === d || !r.includes(l)) && (o.preventDefault(), c.focus()) : (l === c || !r.includes(l)) && (o.preventDefault(), d.focus());
  }
  return {
    activate() {
      e || (e = !0, t = document.activeElement, s = new AbortController(), n.addEventListener("keydown", i, { signal: s.signal }));
    },
    deactivate() {
      if (!e) return;
      e = !1, s?.abort(), s = null;
      const o = t;
      t = null, o && typeof o.focus == "function" && o.isConnected && o.focus();
    },
    get active() {
      return e;
    }
  };
}
class A {
  constructor({ kind: e, nodeId: t, title: s, onRequestClose: i, onResize: o }) {
    this.kind = e, this.nodeId = String(t), this.title = s, this.onRequestClose = i, this.onResize = o, this.backdrop = null, this.window = null, this.content = null, this.disposed = !1, this._maximized = !1, this.abort = null, this.focusTrap = null;
  }
  mount(e) {
    if (this.disposed) throw new Error("WorkbenchHost is disposed");
    if (this.backdrop) return;
    v(document);
    const t = document.createElement("div");
    t.className = "oc-workbench-backdrop", t.dataset.kind = this.kind, t.dataset.nodeId = this.nodeId, t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true");
    const s = `oc-workbench-title-${this.kind}-${this.nodeId}`;
    t.setAttribute("aria-labelledby", s), t.innerHTML = `
      <section class="oc-workbench-window" tabindex="-1">
        <header class="oc-workbench-header">
          <div id="${s}" class="oc-workbench-title"></div>
          <div class="oc-workbench-actions">
            <button type="button" data-workbench-act="maximize" aria-label="${w(b("Maximize workbench"))}">[ ]</button>
            <button type="button" data-workbench-act="close" aria-label="${w(b("Close workbench"))}">x</button>
          </div>
        </header>
        <div class="oc-workbench-content"></div>
      </section>`, this.backdrop = t, this.window = t.querySelector(".oc-workbench-window"), this.content = t.querySelector(".oc-workbench-content"), this.setTitle(this.title), this.content.append(e), document.body.append(t), this.abort = new AbortController();
    const { signal: i } = this.abort;
    t.querySelector('[data-workbench-act="close"]')?.addEventListener("click", () => {
      this.requestClose("button");
    }, { signal: i }), t.querySelector('[data-workbench-act="maximize"]')?.addEventListener("click", () => this.setMaximized(!this._maximized), { signal: i }), t.addEventListener("keydown", (o) => {
      o.key === "Escape" && (o.stopPropagation(), this.requestClose("escape"));
    }, { signal: i, capture: !0 }), window.addEventListener("resize", () => this.onResize?.(), { signal: i }), this.focusTrap = E(this.window), this.focusTrap.activate(), this.window.focus(), requestAnimationFrame(() => this.onResize?.());
  }
  async requestClose(e = "user") {
    return !this.backdrop || this.disposed ? !0 : await this.onRequestClose?.(e) === !1 ? !1 : (this.dispose(), !0);
  }
  setTitle(e) {
    this.title = String(e || "OmniCam");
    const t = this.backdrop?.querySelector(".oc-workbench-title");
    t && (t.textContent = this.title);
  }
  setBusy(e) {
    this.backdrop && (this.backdrop.dataset.busy = e ? "true" : "false");
  }
  setMaximized(e) {
    this._maximized = !!e, this.window?.classList.toggle("is-maximized", this._maximized), requestAnimationFrame(() => this.onResize?.());
  }
  focus() {
    this.window?.focus();
  }
  dispose() {
    this.disposed || (this.disposed = !0, this.focusTrap?.deactivate(), this.abort?.abort(), this.backdrop?.remove(), this.backdrop = this.window = this.content = null);
  }
  get mounted() {
    return !!this.backdrop;
  }
  get maximized() {
    return this._maximized;
  }
  get contentElement() {
    return this.content;
  }
}
class C {
  constructor() {
    this._active = null, this._tail = Promise.resolve(), this._pending = /* @__PURE__ */ new Set();
  }
  get activeKey() {
    return this._active?.key ?? null;
  }
  get activeSession() {
    return this._active;
  }
  _enqueue(e) {
    const t = this._tail.then(e);
    return this._tail = t.catch(() => {
    }), t;
  }
  open({ key: e, nodeId: t = e, opener: s, createSession: i }) {
    const o = { nodeId: String(t), cancelled: !1 };
    return this._pending.add(o), this._enqueue(() => this._open(o, { key: e, opener: s, createSession: i })).finally(() => this._pending.delete(o));
  }
  async _open(e, { key: t, opener: s, createSession: i }) {
    if (e.cancelled) return null;
    if (this._active?.key === t)
      return this._active.host?.focus?.(), this._active;
    if (this._active && !await this._closeSession(this._active, "switch") || e.cancelled) return null;
    const o = await i();
    return o ? e.cancelled ? (o.dispose?.(), null) : (o.opener = s ?? null, this._active = o, o) : null;
  }
  close(e, t = "programmatic") {
    return this._enqueue(() => !this._active || this._active.key !== e ? !0 : this._closeSession(this._active, t));
  }
  closeActive(e = "switch") {
    return this._enqueue(() => this._active ? this._closeSession(this._active, e) : !0);
  }
  disposeForNode(e) {
    for (const t of this._pending)
      t.nodeId === String(e) && (t.cancelled = !0);
    this._active && String(this._active.nodeId) === String(e) && (this._active.dispose?.(), this._active = null);
  }
  async _closeSession(e, t) {
    return await e.close?.(t) === !1 ? !1 : (this._active === e && (this._active = null), e.opener?.focus?.(), !0);
  }
}
const B = new C();
export {
  x as H,
  A as W,
  q as c,
  T as d,
  w as e,
  B as w
};
