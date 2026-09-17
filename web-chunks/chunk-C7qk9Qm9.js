const p = /* @__PURE__ */ new WeakMap();
function m(o) {
  let e = p.get(o);
  if (e) return e;
  e = /* @__PURE__ */ new Set(), p.set(o, e);
  const t = o.onConnectionChange;
  return o.onConnectionChange = function(s) {
    const i = t?.apply(this, arguments);
    for (const n of [...e])
      try {
        n(s);
      } catch (r) {
        console.warn("[OmniCam] graph connection watcher failed", r);
      }
    return i;
  }, e;
}
function _(o, e) {
  const t = o?.graph;
  if (!t || typeof e != "function") return () => {
  };
  const s = m(t);
  return s.add(e), () => s.delete(e);
}
const b = "majoor-omnicam-workbench-styles", g = `
  .oc-workbench-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(8,8,11,0.72);backdrop-filter:blur(2px)}
  .oc-workbench-window{display:flex;flex-direction:column;width:min(96vw,1920px);height:92vh;min-width:960px;min-height:640px;background:#161618;border:1px solid #383842;border-radius:10px;box-shadow:0 24px 64px rgba(0,0,0,0.6);overflow:hidden;outline:none}
  .oc-workbench-window.is-maximized{width:100vw;height:100vh;min-width:0;min-height:0;border-radius:0;border:none}
  .oc-workbench-header{display:flex;align-items:center;gap:10px;min-height:40px;padding:6px 10px;background:#1e1e24;border-bottom:1px solid #32323c;flex:none}
  .oc-workbench-title{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e2e2e8;font:600 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .oc-workbench-actions{display:flex;align-items:center;gap:4px;flex:none}
  .oc-workbench-actions button{display:inline-grid;place-items:center;width:28px;height:28px;padding:0;color:#9494a8;background:#23232c;border:1px solid #3c3c4a;border-radius:6px;cursor:pointer}
  .oc-workbench-actions button:hover{background:#31313e;border-color:#58586c;color:#fff}
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

  .oc-node-shell{display:flex;flex-direction:column;gap:6px;width:100%;height:100%;padding:8px 10px;box-sizing:border-box;font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#ddd;background:#161618;border-radius:8px}
  .oc-node-shell-title{font-weight:700;color:#e2e2e8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-meta{color:#9494a8;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-status{color:#c7ccd4;font-size:11px}
  .oc-node-shell-progress{position:relative;height:5px;border-radius:3px;background:#23232c;overflow:hidden;display:none}
  .oc-node-shell-progress[data-active="true"]{display:block}
  .oc-node-shell-progress>span{display:block;height:100%;background:var(--oc-accent,#7c8bf0);width:0%;transition:width .15s ease}
  .oc-node-shell-open{margin-top:auto;padding:6px 10px;border-radius:6px;background:var(--oc-accent,#7c8bf0);border:1px solid var(--oc-accent,#7c8bf0);color:#0b0d1a;font-weight:600;cursor:pointer}
  .oc-node-shell-open:hover{filter:brightness(1.08)}
`;
function f(o = document) {
  if (o.getElementById(b)) return;
  const e = o.createElement("style");
  e.id = b, e.textContent = g, o.head.append(e);
}
function S({ kind: o, title: e, buttonLabel: t, onOpen: s }) {
  f(document);
  const i = document.createElement("div");
  i.className = "oc-node-shell", i.dataset.shellKind = o;
  const n = document.createElement("div");
  n.className = "oc-node-shell-title", n.textContent = e ?? "";
  const r = document.createElement("div");
  r.className = "oc-node-shell-meta";
  const d = document.createElement("div");
  d.className = "oc-node-shell-status";
  const a = document.createElement("div");
  a.className = "oc-node-shell-progress";
  const l = document.createElement("span");
  a.append(l);
  const h = document.createElement("button");
  h.type = "button", h.className = "oc-node-shell-open", h.textContent = t ?? "Open", i.append(n, r, d, a, h);
  const u = new AbortController();
  return h.addEventListener("click", (c) => s?.(c), { signal: u.signal }), {
    root: i,
    openButton: h,
    setTitle(c) {
      n.textContent = c ?? "";
    },
    setMeta(c) {
      r.textContent = c ?? "";
    },
    setStatus(c) {
      d.textContent = c ?? "";
    },
    setProgress(c) {
      if (c == null) {
        a.dataset.active = "false";
        return;
      }
      a.dataset.active = "true";
      const w = Math.max(0, Math.min(1, c));
      l.style.width = `${(w * 100).toFixed(1)}%`;
    },
    dispose() {
      u.abort();
    }
  };
}
const x = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function k(o) {
  return !!(o.offsetWidth || o.offsetHeight || o.getClientRects?.().length);
}
function v(o) {
  return [...o.querySelectorAll(x)].filter(k);
}
function y(o) {
  let e = !1, t = null, s = null;
  function i(n) {
    if (n.key !== "Tab") return;
    const r = v(o);
    if (!r.length) {
      n.preventDefault(), o.focus();
      return;
    }
    const d = r[0], a = r[r.length - 1], l = o.ownerDocument?.activeElement ?? document.activeElement;
    n.shiftKey ? (l === d || !r.includes(l)) && (n.preventDefault(), a.focus()) : (l === a || !r.includes(l)) && (n.preventDefault(), d.focus());
  }
  return {
    activate() {
      e || (e = !0, t = document.activeElement, s = new AbortController(), o.addEventListener("keydown", i, { signal: s.signal }));
    },
    deactivate() {
      if (!e) return;
      e = !1, s?.abort(), s = null;
      const n = t;
      t = null, n && typeof n.focus == "function" && n.isConnected && n.focus();
    },
    get active() {
      return e;
    }
  };
}
class C {
  constructor({ kind: e, nodeId: t, title: s, onRequestClose: i, onResize: n }) {
    this.kind = e, this.nodeId = String(t), this.title = s, this.onRequestClose = i, this.onResize = n, this.backdrop = null, this.window = null, this.content = null, this.disposed = !1, this._maximized = !1, this.abort = null, this.focusTrap = null;
  }
  mount(e) {
    if (this.disposed) throw new Error("WorkbenchHost is disposed");
    if (this.backdrop) return;
    f(document);
    const t = document.createElement("div");
    t.className = "oc-workbench-backdrop", t.dataset.kind = this.kind, t.dataset.nodeId = this.nodeId, t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true");
    const s = `oc-workbench-title-${this.kind}-${this.nodeId}`;
    t.setAttribute("aria-labelledby", s), t.innerHTML = `
      <section class="oc-workbench-window" tabindex="-1">
        <header class="oc-workbench-header">
          <div id="${s}" class="oc-workbench-title"></div>
          <div class="oc-workbench-actions">
            <button type="button" data-workbench-act="maximize" aria-label="Maximize workbench">[ ]</button>
            <button type="button" data-workbench-act="close" aria-label="Close workbench">x</button>
          </div>
        </header>
        <div class="oc-workbench-content"></div>
      </section>`, this.backdrop = t, this.window = t.querySelector(".oc-workbench-window"), this.content = t.querySelector(".oc-workbench-content"), this.setTitle(this.title), this.content.append(e), document.body.append(t), this.abort = new AbortController();
    const { signal: i } = this.abort;
    t.querySelector('[data-workbench-act="close"]')?.addEventListener("click", () => {
      this.requestClose("button");
    }, { signal: i }), t.querySelector('[data-workbench-act="maximize"]')?.addEventListener("click", () => this.setMaximized(!this._maximized), { signal: i }), t.addEventListener("keydown", (n) => {
      n.key === "Escape" && (n.stopPropagation(), this.requestClose("escape"));
    }, { signal: i, capture: !0 }), window.addEventListener("resize", () => this.onResize?.(), { signal: i }), this.focusTrap = y(this.window), this.focusTrap.activate(), this.window.focus(), requestAnimationFrame(() => this.onResize?.());
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
class E {
  constructor() {
    this._active = null;
  }
  get activeKey() {
    return this._active?.key ?? null;
  }
  get activeSession() {
    return this._active;
  }
  async open({ key: e, opener: t, createSession: s }) {
    if (this._active?.key === e)
      return this._active.host?.focus?.(), this._active;
    if (this._active && !await this._closeSession(this._active, "switch"))
      return null;
    const i = await s();
    return i ? (i.opener = t ?? null, this._active = i, i) : null;
  }
  async close(e, t = "programmatic") {
    return !this._active || this._active.key !== e ? !0 : this._closeSession(this._active, t);
  }
  async closeActive(e = "switch") {
    return this._active ? this._closeSession(this._active, e) : !0;
  }
  disposeForNode(e) {
    this._active && String(this._active.nodeId) === String(e) && (this._active.dispose?.(), this._active = null);
  }
  async _closeSession(e, t) {
    return await e.close?.(t) === !1 ? !1 : (this._active === e && (this._active = null), e.opener?.focus?.(), !0);
  }
}
const z = new E();
export {
  C as W,
  z as a,
  S as c,
  _ as w
};
