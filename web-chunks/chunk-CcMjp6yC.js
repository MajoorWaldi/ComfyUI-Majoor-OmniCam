import { T as p, v as m } from "./chunk-GvJ-GQpX.js";
const _ = `
  --oc-bg-app: var(--bg-color, #0B1018);
  --oc-bg-panel: var(--comfy-menu-bg, #111827);
  --oc-bg-control: var(--comfy-input-bg, #151D2A);
  --oc-bg-sunken: var(--comfy-input-bg, #080C14);
  --oc-border-default: var(--border-color, #263143);
  --oc-border-subtle: var(--border-color, #1B2433);
  --oc-text-primary: var(--input-text, #E9EDF5);
  --oc-text-secondary: var(--input-text, #8F9AAF);
  --oc-text-muted: var(--input-text, #98A3B8);
`, v = "majoor-omnicam-workbench-styles", E = `
  .oc-workbench-backdrop,.oc-node-shell{${_}}
  .oc-workbench-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,12,0.82);backdrop-filter:blur(3px)}
  .oc-workbench-window{display:flex;flex-direction:column;width:min(96vw,1920px);height:92dvh;min-width:0;min-height:0;max-width:100vw;max-height:100dvh;background:var(--oc-bg-app);border:1px solid var(--oc-border-default);border-radius:8px;box-shadow:0 24px 64px rgba(0,0,0,0.7);overflow:hidden;outline:none}
  .oc-workbench-window.is-maximized{width:100vw;height:100vh;min-width:0;min-height:0;border-radius:0;border:none}
  .oc-workbench-header{display:flex;align-items:center;gap:10px;min-height:40px;padding:6px 12px;background:var(--oc-bg-panel);border-bottom:1px solid var(--oc-border-default);flex:none}
  .oc-workbench-title{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--oc-text-primary);font:600 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .oc-workbench-actions{display:flex;align-items:center;gap:6px;flex:none}
  .oc-workbench-actions button{display:inline-grid;place-items:center;width:28px;height:28px;padding:0;color:var(--oc-text-secondary);background:var(--oc-bg-control);border:1px solid var(--oc-border-default);border-radius:6px;cursor:pointer;transition:all .15s ease}
  .oc-workbench-actions button:hover{background:var(--oc-bg-control);border-color:${p.accent};color:var(--oc-text-primary)}
  .oc-workbench-actions button:focus-visible{outline:2px solid ${p.accent};outline-offset:2px}
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

  .oc-node-shell{position:relative;display:flex;flex-direction:column;gap:6px;width:100%;height:100%;padding:8px 10px;box-sizing:border-box;font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--oc-text-secondary);background:var(--oc-bg-panel);border:1px solid var(--oc-border-default);border-radius:8px;overflow:hidden}
  .oc-node-shell-preview{display:none;position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;border-radius:7px;pointer-events:none}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-preview{display:block}
  /* Dark scrim behind the text/controls only when a preview image is showing
     underneath them -- a flat rgba(0,0,0,..) gradient, not a semantic token,
     since it exists purely to keep white text legible over an arbitrary
     photo and has no light/dark-theme variant of its own. Explicit z-index
     stack (image 0, scrim 1, text/controls 2) rather than relying on DOM
     order, since ::before would otherwise paint before -- i.e. under -- the
     real <img> sibling that follows it. */
  .oc-node-shell[data-has-preview="true"]::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.35) 55%,rgba(0,0,0,0.72) 100%);border-radius:7px;pointer-events:none}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-title,
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-meta,
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-status{position:relative;z-index:2;color:#fff}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-open{position:relative;z-index:2}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-progress{z-index:2}
  .oc-node-shell-title{font-weight:700;color:var(--oc-text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-meta{color:var(--oc-text-secondary);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-status{color:var(--oc-text-secondary);font-size:11px}
  .oc-node-shell-progress{position:relative;height:5px;border-radius:3px;background:var(--oc-bg-control);border:1px solid var(--oc-border-default);overflow:hidden;display:none}
  .oc-node-shell-progress[data-active="true"]{display:block}
  .oc-node-shell-progress>span{display:block;height:100%;background:${p.accent};width:0%;transition:width .15s ease}
  .oc-node-shell-open{margin-top:auto;padding:6px 10px;border-radius:6px;background:${p.accent};border:1px solid ${p.accent};color:#fff;font-weight:600;cursor:pointer;transition:filter .15s ease}
  .oc-node-shell-open:hover{filter:brightness(1.12)}
  .oc-node-shell-open:focus-visible{outline:2px solid ${p.accent};outline-offset:2px}
`;
function k(i = document) {
  if (i.getElementById(v)) return;
  const e = i.createElement("style");
  e.id = v, e.textContent = E, i.head.append(e);
}
const S = /* @__PURE__ */ new Set(["director", "monitor"]);
function B({ kind: i, title: e, buttonLabel: t, onOpen: a }) {
  k(document);
  const s = document.createElement("div");
  s.className = "oc-node-shell", s.dataset.shellKind = i;
  const o = document.createElement("img");
  o.className = "oc-node-shell-preview", o.alt = "", o.draggable = !1;
  let n = null;
  S.has(i) && (n = document.createElement("video"), n.className = "oc-node-shell-preview", n.muted = !0, n.loop = !0, n.playsInline = !0, n.disablePictureInPicture = !0, n.disableRemotePlayback = !0, n.style.display = "none");
  const l = document.createElement("div");
  l.className = "oc-node-shell-title", l.textContent = e ?? "";
  const d = document.createElement("div");
  d.className = "oc-node-shell-meta";
  const c = document.createElement("div");
  c.className = "oc-node-shell-status";
  const u = document.createElement("div");
  u.className = "oc-node-shell-progress";
  const f = document.createElement("span");
  u.append(f);
  const h = document.createElement("button");
  h.type = "button", h.className = "oc-node-shell-open", h.textContent = t ?? "Open", n ? s.append(o, n, l, d, c, u, h) : s.append(o, l, d, c, u, h);
  const w = new AbortController();
  h.addEventListener("click", (r) => a?.(r), { signal: w.signal });
  function b() {
    n && (n.pause(), n.removeAttribute("src"), n.load(), n.style.display = "none");
  }
  return {
    root: s,
    openButton: h,
    setTitle(r) {
      l.textContent = r ?? "";
    },
    setMeta(r) {
      d.textContent = r ?? "";
    },
    setStatus(r) {
      c.textContent = r ?? "";
    },
    // Still-frame path. Composes with setPreviewVideo(): setting one with a
    // value hides+stops the other, and clearing one only drops
    // data-has-preview when the other has nothing showing either.
    setPreview(r) {
      r ? (o.src = r, o.style.display = "block", b(), s.dataset.hasPreview = "true") : (o.removeAttribute("src"), o.style.display = "none", n?.getAttribute("src") || delete s.dataset.hasPreview);
    },
    // Live-looping playblast preview, Director/Monitor shells only -- a
    // no-op on an Extractor shell (no <video> was mounted). See setPreview()
    // for the composition rule between the two.
    setPreviewVideo(r) {
      n && (r ? (o.style.display = "none", n.autoplay = !0, n.src = r, n.style.display = "block", s.dataset.hasPreview = "true", n.play().catch(() => {
      })) : (b(), o.getAttribute("src") || delete s.dataset.hasPreview));
    },
    setProgress(r) {
      if (r == null) {
        u.dataset.active = "false";
        return;
      }
      u.dataset.active = "true";
      const y = Math.max(0, Math.min(1, r));
      f.style.width = `${(y * 100).toFixed(1)}%`;
    },
    dispose() {
      w.abort(), b();
    }
  };
}
function g(i) {
  return String(i ?? "").replace(/[&<>"']/g, (e) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[e]);
}
const x = {
  verified: "pass",
  detected_unverified: "warning",
  incompatible: "blocked",
  missing: "blocked"
};
function N(i) {
  const e = String(i || "").toLowerCase();
  return e in x ? x[e] : ["ready", "warning", "blocked", "risk", "pass", "connected", "unknown"].includes(e) ? e : "unknown";
}
const z = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");
function C(i) {
  return !!(i.offsetWidth || i.offsetHeight || i.getClientRects?.().length);
}
function A(i) {
  return [...i.querySelectorAll(z)].filter(C);
}
function q(i) {
  let e = !1, t = null, a = null;
  function s(o) {
    if (o.key !== "Tab") return;
    const n = A(i);
    if (!n.length) {
      o.preventDefault(), i.focus();
      return;
    }
    const l = n[0], d = n[n.length - 1], c = i.ownerDocument?.activeElement ?? document.activeElement;
    o.shiftKey ? (c === l || !n.includes(c)) && (o.preventDefault(), d.focus()) : (c === d || !n.includes(c)) && (o.preventDefault(), l.focus());
  }
  return {
    activate() {
      e || (e = !0, t = document.activeElement, a = new AbortController(), i.addEventListener("keydown", s, { signal: a.signal }));
    },
    deactivate() {
      if (!e) return;
      e = !1, a?.abort(), a = null;
      const o = t;
      t = null, o && typeof o.focus == "function" && o.isConnected && o.focus();
    },
    get active() {
      return e;
    }
  };
}
class R {
  constructor({ kind: e, nodeId: t, title: a, onRequestClose: s, onResize: o }) {
    this.kind = e, this.nodeId = String(t), this.title = a, this.onRequestClose = s, this.onResize = o, this.backdrop = null, this.window = null, this.content = null, this.disposed = !1, this._maximized = !1, this.abort = null, this.focusTrap = null;
  }
  mount(e) {
    if (this.disposed) throw new Error("WorkbenchHost is disposed");
    if (this.backdrop) return;
    k(document);
    const t = document.createElement("div");
    t.className = "oc-workbench-backdrop", t.dataset.kind = this.kind, t.dataset.nodeId = this.nodeId, t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true");
    const a = `oc-workbench-title-${this.kind}-${this.nodeId}`;
    t.setAttribute("aria-labelledby", a), t.innerHTML = `
      <section class="oc-workbench-window" tabindex="-1">
        <header class="oc-workbench-header">
          <div id="${a}" class="oc-workbench-title"></div>
          <div class="oc-workbench-actions">
            <button type="button" data-workbench-act="maximize" aria-label="${g(m("Maximize workbench"))}">[ ]</button>
            <button type="button" data-workbench-act="close" aria-label="${g(m("Close workbench"))}">x</button>
          </div>
        </header>
        <div class="oc-workbench-content"></div>
      </section>`, this.backdrop = t, this.window = t.querySelector(".oc-workbench-window"), this.content = t.querySelector(".oc-workbench-content"), this.setTitle(this.title), this.content.append(e), document.body.append(t), this.abort = new AbortController();
    const { signal: s } = this.abort;
    t.querySelector('[data-workbench-act="close"]')?.addEventListener("click", () => {
      this.requestClose("button");
    }, { signal: s }), t.querySelector('[data-workbench-act="maximize"]')?.addEventListener("click", () => this.setMaximized(!this._maximized), { signal: s }), t.addEventListener("keydown", (o) => {
      o.key === "Escape" && (o.stopPropagation(), this.requestClose("escape"));
    }, { signal: s, capture: !0 }), window.addEventListener("resize", () => this.onResize?.(), { signal: s }), this.focusTrap = q(this.window), this.focusTrap.activate(), this.window.focus(), requestAnimationFrame(() => this.onResize?.());
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
class T {
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
  open({ key: e, nodeId: t = e, opener: a, createSession: s }) {
    const o = { nodeId: String(t), cancelled: !1 };
    return this._pending.add(o), this._enqueue(() => this._open(o, { key: e, opener: a, createSession: s })).finally(() => this._pending.delete(o));
  }
  async _open(e, { key: t, opener: a, createSession: s }) {
    if (e.cancelled) return null;
    if (this._active?.key === t)
      return this._active.host?.focus?.(), this._active;
    if (this._active && !await this._closeSession(this._active, "switch") || e.cancelled) return null;
    const o = await s();
    return o ? e.cancelled ? (o.dispose?.(), null) : (o.opener = a ?? null, this._active = o, o) : null;
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
const L = new T();
export {
  _ as H,
  R as W,
  B as c,
  N as d,
  g as e,
  L as w
};
