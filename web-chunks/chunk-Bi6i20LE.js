import { e as S, a as A, bi as q, v as p, F as I, b8 as _, s as J, b9 as N, bP as X } from "./chunk-mvRZEinl.js";
import { a as Y } from "./chunk-BNHAVa-V.js";
import { b as Q } from "./chunk-sVL03mTG.js";
import { g as F, l as Z } from "./chunk-eq1tqQ9i.js";
function Ee(e, t) {
  const o = { "add-camera": "Create a new animated camera from the current view", record: "Record the primary camera preview as a proxy playblast", "load-card": "Replace the subject card with an image or video", "add-card": "Create another image or video card", "load-model": "Import a local GLB, OBJ, FBX, STL, or PLY scene", "reset-camera": "Reset the active camera transform and lens", play: "Play or stop the timeline (Space)", key: "Insert or replace a key at the playhead (I)", "auto-key": "Record camera or object edits at the playhead", "delete-key": "Delete the selected keyframe (Delete)", "copy-key": "Copy the selected keyframe (Ctrl/Cmd+C)", "paste-key": "Paste a keyframe at the playhead (Ctrl/Cmd+V)", "previous-key": "Jump to the previous keyframe (,)", "next-key": "Jump to the next keyframe (.)", "previous-frame": "Move one frame backward (Left Arrow)", "next-frame": "Move one frame forward (Right Arrow)", "toggle-camera-view": "Show or hide the camera preview strip", "update-key": "Store the current camera view in the selected key", "view-key": "Load the selected key's camera view" };
  for (const a of e.querySelectorAll("button,select,input,summary")) {
    if (a.title) continue;
    const r = a.getAttribute("aria-label") || o[a.dataset?.act] || a.closest("label")?.querySelector("span")?.textContent?.trim() || a.closest("label")?.childNodes?.[0]?.textContent?.trim() || a.textContent?.trim();
    r && (a.title = r);
  }
  t.title = "Viewport: drag to orbit, Shift+drag to pan, wheel to dolly, WASD/QE to fly. Right-click for scene actions.", e.querySelector('[data-role="keys"]').title = "Timeline: click or drag to scrub. Drag a key to retime it. Right-click for key actions.";
}
class _e {
  constructor(t) {
    this.root = t, this.menu = t.querySelector('[data-role="context-menu"]'), this.submenus = [], this.returnFocus = null, this.dismissHandler = null, this.dismissTimer = null, this.disposed = !1, this.menu && (this.menu.classList.add("majoor-omnicam"), this.menu.addEventListener("pointerdown", (o) => o.stopPropagation()), this.menu.addEventListener("mousedown", (o) => o.stopPropagation()), this.menu.addEventListener("click", (o) => o.stopPropagation()), this.menu.addEventListener("contextmenu", (o) => {
      o.preventDefault(), o.stopPropagation();
    }), this.menu.addEventListener("keydown", (o) => this.onKey(o)));
  }
  hide({ restoreFocus: t = !1 } = {}) {
    this.dismissTimer !== null && (clearTimeout(this.dismissTimer), this.dismissTimer = null), this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0), this.dismissHandler = null);
    for (const o of this.submenus)
      o.hidden = !0, o.remove();
    this.submenus = [], this.menu && (this.menu.hidden = !0, t && this.returnFocus?.focus?.({ preventScroll: !0 }));
  }
  closeSubmenusFrom(t) {
    for (const o of t.querySelectorAll(".oc-has-submenu.active"))
      o.classList.remove("active");
  }
  renderActions(t, o, a = null) {
    if (t.innerHTML = "", a) {
      const r = document.createElement("div");
      r.className = "context-menu-title", r.textContent = a, t.appendChild(r);
    }
    for (const r of o) {
      if (r === null) {
        const s = document.createElement("div");
        s.className = "context-menu-separator", t.appendChild(s);
        continue;
      }
      const n = document.createElement("button");
      if (n.type = "button", n.setAttribute("role", "menuitem"), n.disabled = !!r.disabled, n.classList.toggle("danger", !!r.danger), n.title = r.help || r.label, r.checked !== void 0) {
        const s = document.createElement("i");
        s.className = `pi ${r.checked ? "pi-check" : ""} oc-menu-check`, s.style.width = "14px", s.style.fontSize = "10px", s.style.color = r.checked ? "var(--oc-accent, #38bdf8)" : "transparent", n.appendChild(s);
      }
      if (r.icon) {
        const s = document.createElement("i");
        s.className = `pi ${r.icon}`, n.appendChild(s);
      } else if (r.iconSvg) {
        const s = document.createElement("span");
        s.className = "oc-menu-icon-svg", s.innerHTML = r.iconSvg, n.appendChild(s);
      }
      const c = document.createElement("span");
      c.className = "oc-menu-label", c.textContent = r.label, n.appendChild(c);
      const m = r.items || r.submenu;
      if (Array.isArray(m) && m.length) {
        n.classList.add("oc-has-submenu");
        const s = document.createElement("i");
        s.className = "pi pi-chevron-right oc-submenu-chevron", s.style.marginLeft = "auto", s.style.fontSize = "9px", s.style.opacity = "0.7", n.appendChild(s);
        const l = document.createElement("div");
        l.className = "context-menu context-submenu majoor-omnicam", l.hidden = !0, document.body.appendChild(l), this.submenus.push(l), this.renderActions(l, m, null);
        let i = null, h = null;
        const f = () => {
          clearTimeout(h), l.parentElement !== document.body && document.body.appendChild(l), l.hidden = !1, n.classList.add("active");
          const g = n.getBoundingClientRect(), b = l.getBoundingClientRect(), d = 8;
          let v = g.right + 2;
          v + b.width > window.innerWidth - d && (v = Math.max(d, g.left - b.width - 2));
          let u = g.top - 4;
          u + b.height > window.innerHeight - d && (u = Math.max(d, window.innerHeight - b.height - d)), l.style.left = `${v}px`, l.style.top = `${u}px`;
        }, x = () => {
          clearTimeout(i), h = setTimeout(() => {
            l.hidden = !0, n.classList.remove("active");
          }, 160);
        };
        n.addEventListener("pointerenter", () => {
          clearTimeout(h), i = setTimeout(f, 60);
        }), n.addEventListener("pointerleave", x), l.addEventListener("pointerenter", () => clearTimeout(h)), l.addEventListener("pointerleave", x), l.addEventListener("keydown", (g) => this.onKey(g)), n._submenuEl = l, n.addEventListener("click", (g) => {
          g.preventDefault(), g.stopPropagation(), l.hidden ? f() : x();
        });
      } else {
        if (r.shortcut) {
          const s = document.createElement("kbd");
          s.className = "shortcut", s.textContent = r.shortcut, n.appendChild(s);
        }
        n.addEventListener("click", (s) => {
          s.preventDefault(), s.stopPropagation(), this.hide();
          try {
            r.run?.();
          } catch (l) {
            console.error("Context menu action failed:", l);
          }
        });
      }
      n.addEventListener("pointerdown", (s) => s.stopPropagation()), n.addEventListener("mousedown", (s) => s.stopPropagation()), t.appendChild(n);
    }
  }
  show(t, o, a) {
    if (!this.menu || this.disposed) return;
    this.dismissTimer !== null && (clearTimeout(this.dismissTimer), this.dismissTimer = null), t.preventDefault(), t.stopPropagation(), t.stopImmediatePropagation?.(), this.returnFocus = document.activeElement, this.menu.parentElement !== document.body && document.body.appendChild(this.menu), this.menu.classList.add("majoor-omnicam");
    for (const s of this.submenus) s.remove();
    this.submenus = [], this.renderActions(this.menu, a, o), this.menu.hidden = !1;
    const r = 8, n = this.menu.getBoundingClientRect(), c = Math.max(r, Math.min(t.clientX, window.innerWidth - n.width - r)), m = Math.max(r, Math.min(t.clientY, window.innerHeight - n.height - r));
    this.menu.style.left = `${c}px`, this.menu.style.top = `${m}px`, this.menu.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 }), this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0)), this.dismissHandler = (s) => {
      s.target && (this.menu.contains(s.target) || this.submenus.some((l) => l.contains(s.target))) || this.hide();
    }, this.dismissTimer = setTimeout(() => {
      this.dismissTimer = null, !this.disposed && (document.addEventListener("pointerdown", this.dismissHandler, !0), document.addEventListener("contextmenu", this.dismissHandler, !0));
    }, 0);
  }
  dispose() {
    if (!this.disposed) {
      this.hide(), this.disposed = !0;
      for (const t of this.submenus) t.remove();
      this.submenus = [], this.menu?.remove(), this.menu = null;
    }
  }
  onKey(t) {
    if (!this.menu || this.menu.hidden) return !1;
    const o = document.activeElement, a = o?.closest?.(".context-menu");
    if (!a)
      return t.key === "Escape" ? (t.preventDefault(), this.hide({ restoreFocus: !0 }), !0) : !1;
    const r = [...a.querySelectorAll("button:not(:disabled)")], n = r.indexOf(o);
    if (t.key === "Escape")
      return t.preventDefault(), a !== this.menu ? (a.hidden = !0, [...document.querySelectorAll(".oc-has-submenu")].find((m) => m._submenuEl === a)?.focus()) : this.hide({ restoreFocus: !0 }), !0;
    if (["ArrowDown", "ArrowUp"].includes(t.key)) {
      t.preventDefault();
      const c = t.key === "ArrowDown" ? 1 : -1;
      return r[(n + c + r.length) % r.length]?.focus(), !0;
    }
    return t.key === "ArrowRight" && o?._submenuEl ? (t.preventDefault(), o._submenuEl.hidden = !1, o.classList.add("active"), o._submenuEl.querySelector("button:not(:disabled)")?.focus(), !0) : t.key === "ArrowLeft" && a !== this.menu ? (t.preventDefault(), a.hidden = !0, [...document.querySelectorAll(".oc-has-submenu")].find((m) => m._submenuEl === a)?.focus(), !0) : !1;
  }
}
const w = /* @__PURE__ */ new WeakMap();
function Ae(e) {
  const t = w.get(e);
  if (t) {
    for (const o of [...t]) o();
    w.delete(e);
  }
}
function D({ title: e, message: t, withInput: o = !1, defaultValue: a = "", owner: r = null }) {
  return typeof document > "u" || !document.body ? Promise.resolve(o ? null : !1) : new Promise((n) => {
    const c = document.createElement("div");
    c.className = "majoor-omnicam oc-modal-backdrop", c.setAttribute("role", "dialog"), c.setAttribute("aria-modal", "true"), Object.assign(c.style, {
      position: "fixed",
      inset: "0",
      zIndex: "100000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.55)"
    });
    const m = document.createElement("div");
    m.className = "oc-modal", Object.assign(m.style, {
      maxWidth: "min(440px, 92vw)",
      padding: "18px 20px",
      borderRadius: "10px",
      background: "var(--oc-panel, #1e1f26)",
      color: "var(--oc-text, #e8e8ec)",
      border: "1px solid var(--oc-line, #34363f)",
      boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
      font: "13px/1.5 system-ui, sans-serif"
    });
    const s = document.createElement("h3");
    s.textContent = e || "", Object.assign(s.style, { margin: "0 0 8px", fontSize: "14px" });
    const l = document.createElement("p");
    l.textContent = t || "", Object.assign(l.style, { margin: "0 0 14px", opacity: "0.85" });
    let i = null;
    o && (i = document.createElement("input"), i.type = "text", i.value = a == null ? "" : String(a), Object.assign(i.style, {
      width: "100%",
      boxSizing: "border-box",
      marginBottom: "14px",
      padding: "6px 8px",
      background: "var(--oc-sunken, #16171c)",
      color: "inherit",
      border: "1px solid var(--oc-line, #34363f)",
      borderRadius: "6px"
    }));
    const h = document.createElement("div");
    Object.assign(h.style, { display: "flex", gap: "8px", justifyContent: "flex-end" });
    const f = document.createElement("button");
    f.type = "button", f.textContent = "Cancel";
    const x = document.createElement("button");
    x.type = "button", x.textContent = "OK";
    for (const u of [f, x])
      Object.assign(u.style, {
        padding: "6px 14px",
        borderRadius: "6px",
        cursor: "pointer",
        border: "1px solid var(--oc-line, #34363f)",
        background: "transparent",
        color: "inherit"
      });
    x.style.background = "var(--oc-accent, #4c6ef5)", x.style.borderColor = "transparent", x.style.color = "#fff", h.append(f, x), m.append(s, l), i && m.append(i), m.append(h), c.append(m);
    let g = !1;
    const b = (u) => {
      g || (g = !0, document.removeEventListener("keydown", v, !0), r && typeof r == "object" && w.get(r)?.delete(d), c.remove(), n(u));
    }, d = () => b(o ? null : !1);
    if (r && typeof r == "object") {
      let u = w.get(r);
      u || w.set(r, u = /* @__PURE__ */ new Set()), u.add(d);
    }
    const v = (u) => {
      u.key === "Escape" ? (u.stopPropagation(), b(o ? null : !1)) : u.key === "Enter" && (u.stopPropagation(), b(o ? i.value : !0));
    };
    f.addEventListener("click", () => b(o ? null : !1)), x.addEventListener("click", () => b(o ? i.value : !0)), c.addEventListener("mousedown", (u) => {
      u.target === c && b(o ? null : !1);
    }), document.addEventListener("keydown", v, !0), document.body.appendChild(c), (i || x).focus();
  });
}
function Le({ title: e, items: t = [], onDelete: o = null, owner: a = null }) {
  return typeof document > "u" || !document.body ? Promise.resolve(null) : new Promise((r) => {
    const n = document.createElement("div");
    n.className = "majoor-omnicam oc-modal-backdrop", n.setAttribute("role", "dialog"), n.setAttribute("aria-modal", "true"), Object.assign(n.style, {
      position: "fixed",
      inset: "0",
      zIndex: "100000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.55)"
    });
    const c = document.createElement("div");
    c.className = "oc-modal", Object.assign(c.style, {
      maxWidth: "min(460px, 92vw)",
      width: "460px",
      padding: "18px 20px",
      borderRadius: "10px",
      background: "var(--oc-panel, #1e1f26)",
      color: "var(--oc-text, #e8e8ec)",
      border: "1px solid var(--oc-line, #34363f)",
      boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
      font: "13px/1.5 system-ui, sans-serif"
    });
    const m = document.createElement("h3");
    m.textContent = e || "", Object.assign(m.style, { margin: "0 0 12px", fontSize: "14px" });
    const s = document.createElement("div");
    Object.assign(s.style, {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      maxHeight: "min(52vh, 420px)",
      overflowY: "auto",
      marginBottom: "14px"
    });
    let l = !1;
    const i = (d) => {
      l || (l = !0, document.removeEventListener("keydown", b, !0), a && typeof a == "object" && w.get(a)?.delete(h), n.remove(), r(d));
    }, h = () => i(null), f = (d) => {
      const v = document.createElement("div");
      Object.assign(v.style, { display: "flex", alignItems: "stretch", gap: "4px" });
      const u = document.createElement("button");
      u.type = "button", Object.assign(u.style, {
        flex: "1",
        textAlign: "left",
        padding: "7px 10px",
        borderRadius: "6px",
        cursor: "pointer",
        border: "1px solid var(--oc-line, #34363f)",
        background: "var(--oc-sunken, #16171c)",
        color: "inherit"
      });
      const j = document.createElement("div");
      j.textContent = d.label || d.id;
      const C = document.createElement("div");
      if (C.textContent = d.sublabel || "", Object.assign(C.style, { opacity: "0.6", fontSize: "11px" }), u.append(j, C), u.addEventListener("click", () => i(d.id)), v.appendChild(u), o) {
        const y = document.createElement("button");
        y.type = "button", y.title = "Delete", y.textContent = "✕", Object.assign(y.style, {
          width: "34px",
          borderRadius: "6px",
          cursor: "pointer",
          border: "1px solid var(--oc-line, #34363f)",
          background: "transparent",
          color: "inherit"
        }), y.addEventListener("click", async (G) => {
          G.stopPropagation(), y.disabled = !0;
          try {
            await o(d.id), v.remove(), s.children.length || i(null);
          } catch (E) {
            y.disabled = !1, console.warn("[OmniCam] delete failed", E), a?.setStatus?.(String(E?.message || E).slice(0, 120));
          }
        }), v.appendChild(y);
      }
      return v;
    };
    for (const d of t) s.appendChild(f(d));
    const x = document.createElement("div");
    Object.assign(x.style, { display: "flex", justifyContent: "flex-end" });
    const g = document.createElement("button");
    if (g.type = "button", g.textContent = "Cancel", Object.assign(g.style, {
      padding: "6px 14px",
      borderRadius: "6px",
      cursor: "pointer",
      border: "1px solid var(--oc-line, #34363f)",
      background: "transparent",
      color: "inherit"
    }), g.addEventListener("click", () => i(null)), x.appendChild(g), c.append(m, s, x), n.appendChild(c), a && typeof a == "object") {
      let d = w.get(a);
      d || w.set(a, d = /* @__PURE__ */ new Set()), d.add(h);
    }
    const b = (d) => {
      d.key === "Escape" && (d.stopPropagation(), i(null));
    };
    n.addEventListener("mousedown", (d) => {
      d.target === n && i(null);
    }), document.addEventListener("keydown", b, !0), document.body.appendChild(n), s.querySelector("button")?.focus({ preventScroll: !0 });
  });
}
async function U(e, t, o, a) {
  let r, n, c, m, s;
  typeof e == "object" && e !== null ? (n = e, r = e.extensionManager ? e : e.app, c = t, m = o, s = a) : (r = typeof window < "u" ? window.app : null, c = e, m = t, s = o);
  const l = r?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return l?.prompt ? l.prompt({ title: c, message: m, defaultValue: s }) : D({ title: c, message: m, withInput: !0, defaultValue: s, owner: n });
}
async function ee(e, t, o) {
  let a, r, n, c;
  typeof e == "object" && e !== null ? (r = e, a = e.extensionManager ? e : e.app, n = t, c = o) : (a = typeof window < "u" ? window.app : null, n = e, c = t);
  const m = a?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return m?.confirm ? m.confirm({ title: n, message: c }) : D({ title: n, message: c, withInput: !1, owner: r });
}
const Me = `
      .majoor-omnicam .oc-lower{display:grid;grid-template-columns:var(--oc-preview-w,236px) 9px minmax(0,1fr);gap:8px;padding:0 8px 8px}
      .majoor-omnicam .oc-preview{display:flex;flex-direction:column;gap:6px;padding:8px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);position:static;width:auto}
      .majoor-omnicam .oc-preview-head{display:flex;align-items:center;gap:6px;color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .oc-preview-head>span:first-child{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .oc-preview .camera-strip-close{position:static;width:24px;height:24px;min-width:24px;padding:0;flex:none}
      /* Flex column, not grid: an aspect-ratio grid item inside a max-height,
         overflow:auto grid track gets its row shrunk below its own computed
         height in Chromium/Edge, so consecutive tiles drew on top of each
         other and no camera framed correctly. A flex column with flex:0 0 auto
         tiles simply stacks -- each tile keeps its full aspect height. Widening
         the column via the splitter is meant to enlarge the previews. The tile
         *count* is capped instead (boundedPreviewTracks in cameras.js, Director
         modal audit Lot 3): a scene with many cameras folds the rest behind a
         "+N more" tile rather than growing the strip's own content further --
         the shared .oc-dock (Lot 1) still scrolls the overall column either way. */
      .majoor-omnicam .oc-preview .camera-preview-strip{display:flex;flex-direction:column;flex-wrap:nowrap;gap:6px;max-height:none;overflow:visible;padding:0;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-preview .camera-preview-strip:empty{min-height:120px}
      /* A preview whose box is not the shot's shape shows a framing the render
         will not produce. The tile takes the shot aspect; --shot-aspect is set
         from state.width/height in refreshCameraPreviews(). */
      .majoor-omnicam .oc-preview .camera-preview-tile{flex:0 0 auto;width:100%;height:auto;min-height:0;aspect-ratio:var(--shot-aspect,16/9)}
      .majoor-omnicam .oc-preview .camera-preview-tile.camera-preview-overflow{display:grid;place-items:center;aspect-ratio:auto;min-height:32px;color:var(--oc-text-dim);font-size:11px;background:var(--oc-panel-2);border:1px dashed var(--oc-line)}
      .majoor-omnicam .oc-preview .camera-preview-head{min-height:0;padding:2px 5px;font-size:9.5px}
      /* The sidebar tile is ~120px tall; the badge repeats what the header
         already says and only collides with the tile edge at this size. */
      .majoor-omnicam .oc-preview .camera-view-badge{display:none}
      /* preview_layout 2 / 4: two tiles per row instead of one tall column. */
      .majoor-omnicam .oc-preview .camera-preview-strip[data-layout="2"],
      .majoor-omnicam .oc-preview .camera-preview-strip[data-layout="4"]{flex-flow:row wrap}
      .majoor-omnicam .oc-preview .camera-preview-strip[data-layout="2"] .camera-preview-tile,
      .majoor-omnicam .oc-preview .camera-preview-strip[data-layout="4"] .camera-preview-tile{flex:1 1 calc(50% - 3px);width:calc(50% - 3px)}

      /* Hiding the preview sets [hidden] on it, which takes it out of the grid
         entirely -- so the timeline became the first item and landed in the
         236px column, with 902px sitting empty beside it. The splitter has
         nothing to split then, so it collapses too. */
      .majoor-omnicam .oc-lower:has(>.oc-preview[hidden]){grid-template-columns:minmax(0,1fr)}
      .majoor-omnicam .oc-lower:has(>.oc-preview[hidden])>.oc-resize-h{display:none}

      .majoor-omnicam .oc-timeline{display:flex;flex-direction:column;gap:8px;padding:8px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);min-width:0}
      .majoor-omnicam .oc-transport{display:flex;align-items:center;gap:7px;flex-wrap:nowrap;min-width:0}
      .majoor-omnicam .timeline-group{display:flex;align-items:center;gap:3px;padding:2px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:var(--oc-radius-sm)}
      .majoor-omnicam .oc-transport .icon-button{width:28px !important;height:28px !important;min-width:28px !important;background:transparent;border-color:transparent;border-radius:6px}
      .majoor-omnicam .oc-transport .icon-button:hover{background:var(--oc-panel-2);border-color:var(--oc-line)}
      .majoor-omnicam .oc-play{background:var(--oc-accent) !important;border-color:var(--oc-accent) !important;color:#fff !important}
      .majoor-omnicam .oc-key{display:inline-flex !important;align-items:center;width:auto !important;min-width:0 !important;gap:6px;padding:0 12px !important;font-size:11.5px;line-height:1;white-space:nowrap;color:var(--oc-text) !important}
      .majoor-omnicam .oc-diamond{width:9px;height:9px;background:var(--oc-accent);transform:rotate(45deg);flex:none}
      .majoor-omnicam .oc-frame-counter{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-frame-counter input{width:48px;padding:4px 2px;text-align:right;background:transparent;border:0;font-weight:650}
      .majoor-omnicam .oc-frame-total{color:var(--oc-text-faint);font-size:11px}
      .majoor-omnicam .oc-timecode{padding:5px 11px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft);color:var(--oc-text-dim);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .oc-fps{display:inline-flex;align-items:center;gap:5px;padding:2px 4px 2px 9px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft);color:var(--oc-text-dim);font-size:11px;white-space:nowrap}
      .majoor-omnicam .oc-fps input{width:46px;padding:3px 4px;background:transparent;border:0;color:var(--oc-text);font-weight:600}

      /* ---- dope sheet ------------------------------------------------
         Layout mirrors a DCC dope sheet: a fixed label gutter, then one grid
         column of equal-height lanes. The ruler is the first lane, so its
         ticks line up with the keys underneath by construction rather than by
         matching two paddings by hand. */
      .majoor-omnicam .oc-dope{display:flex;flex-direction:column;min-width:0;--oc-ruler-h:36px;--oc-dope-row-h:32px;--oc-dope-gap:6px}
      .majoor-omnicam .oc-sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
      .majoor-omnicam .oc-dope-body{display:grid;grid-template-columns:var(--oc-dope-gutter,124px) minmax(0,1fr);gap:0 10px;min-width:0;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:var(--oc-radius-sm);padding:0 12px 9px 9px}
      .majoor-omnicam .oc-dope-labels{display:flex;flex-direction:column;gap:var(--oc-dope-gap,4px);padding-top:calc(var(--oc-ruler-h,30px) + var(--oc-dope-gap,4px))}
      .majoor-omnicam .oc-dope-label{display:flex;align-items:center;gap:7px;height:var(--oc-dope-row-h,26px);color:var(--oc-text-dim);font-size:11.5px;cursor:pointer;user-select:none}
      .majoor-omnicam .oc-dope-label:hover{color:var(--oc-text)}
      .majoor-omnicam .oc-dope-label>input[type=checkbox]{width:14px;height:14px;min-width:14px;padding:0;accent-color:var(--channel-color,var(--oc-accent));cursor:pointer}
      .majoor-omnicam .oc-dope-label span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      /* Margin, not padding: a lane's diamonds are absolutely positioned, so
         left:0% resolves against the padding box and padding would not inset
         them. The margin insets the ruler and every lane together, which keeps
         them aligned while giving the first and last diamond room to sit fully
         inside the panel. */
      .majoor-omnicam .oc-dope-tracks{position:relative;min-width:0;margin:0 9px;display:flex;flex-direction:column;gap:var(--oc-dope-gap,4px)}

      .majoor-omnicam .oc-ruler{position:relative;height:var(--oc-ruler-h,30px);min-width:0;cursor:ew-resize;touch-action:none}
      /* The legacy .timeline-tick is a full-height rule with a left border and
         left padding, drawn inside the old key lane. On the ruler it is just a
         number, so height, border and padding are all reset -- otherwise every
         label trails a vertical line down the ruler and sits 4px off-centre. */
      .majoor-omnicam .oc-ruler .timeline-tick{position:absolute;top:2px;height:auto;border:0;padding:0;transform:translateX(-50%);font-size:10px;color:var(--oc-text-faint);pointer-events:none;line-height:1}
      .majoor-omnicam .oc-tick{position:absolute;bottom:0;width:1px;height:5px;background:var(--oc-line);pointer-events:none}
      .majoor-omnicam .oc-tick.major{height:9px;background:var(--oc-text-faint)}
      .majoor-omnicam .oc-playhead-head{position:absolute;bottom:-2px;width:0;height:0;margin-left:-6px;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid var(--oc-accent);pointer-events:none;z-index:6}

      .majoor-omnicam .oc-dope-tracks .keys{position:relative;height:var(--oc-dope-row-h,26px);border-radius:6px;background:var(--oc-panel-2);border:1px solid var(--oc-line-soft);overflow:visible}
      /* Every lane carries the same dim baseline; the channel-coloured rail on
         top of it marks the span where that channel is actually animated. */
      .majoor-omnicam .oc-dope-tracks .keys::before,
      .majoor-omnicam .oc-dope-row::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;margin-top:-.5px;background:var(--oc-line);opacity:.7}
      /* Scoped to the master lane: the ruler is also inside .oc-dope-tracks,
         and an unscoped rule here hid its frame numbers. */
      .majoor-omnicam .oc-dope-tracks .keys .timeline-tick{display:none}
      .majoor-omnicam .oc-dope-tracks .keys .playhead{display:none}
      .majoor-omnicam .oc-dope-rows{display:flex;flex-direction:column;gap:var(--oc-dope-gap,4px);min-width:0}
      .majoor-omnicam .oc-dope-row{position:relative;height:var(--oc-dope-row-h,26px);border-radius:6px;background:var(--oc-panel-2);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-dormant-keys{color:var(--oc-warn,#f2a93b);cursor:help}
      .majoor-omnicam .oc-gsequence{display:flex;flex-direction:column;gap:8px;height:var(--oc-graph-h,220px);min-height:140px;padding:9px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft);overflow-y:auto;overscroll-behavior:contain}
      .majoor-omnicam .oc-sequence-toolbar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
      .majoor-omnicam .oc-sequence-summary{margin-left:auto;font-size:10px;opacity:.6;flex-basis:100%;text-align:right}
      .majoor-omnicam .oc-sequence-tracks{position:relative;display:flex;flex-direction:column;gap:4px}
      .majoor-omnicam .oc-sequence-lane{position:relative;height:52px;overflow:hidden;border-radius:4px;background:rgba(255,255,255,.04)}
      .majoor-omnicam .oc-sequence-audio{position:relative;height:34px;overflow:hidden;border-radius:4px;background:rgba(255,255,255,.03)}
      .majoor-omnicam .oc-sequence-waveform{position:absolute;inset:0;width:100%;height:100%;opacity:.5}
      .majoor-omnicam .oc-sequence-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;opacity:.55;text-align:center;padding:0 8px}
      .majoor-omnicam .oc-sequence-shot{position:absolute;top:3px;bottom:3px;display:flex;align-items:center;overflow:hidden;border-radius:3px;border:1px solid var(--shot-color);background:color-mix(in srgb,var(--shot-color) 30%,transparent);cursor:context-menu}
      .majoor-omnicam .oc-sequence-shot.no-proxy{border-style:dashed;opacity:.55}
      .majoor-omnicam .oc-sequence-name{padding:0 12px;font-size:11px;line-height:1;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;pointer-events:none}
      /* Cut boundaries use the dedicated Cuts/Shot-marker color (spec 04),
         distinct from the shot block's own camera-identity color, so a
         cut point reads as its own semantic type at a glance. */
      .majoor-omnicam .oc-sequence-handle{position:absolute;left:-6px;top:0;bottom:0;width:13px;cursor:ew-resize;background:var(--oc-type-cuts);border-radius:2px;opacity:.85;touch-action:none}
      .majoor-omnicam .oc-sequence-handle::after{content:"";position:absolute;left:5px;top:35%;bottom:35%;width:3px;background:#fff;opacity:.7;border-radius:2px}
      .majoor-omnicam .oc-sequence-handle:hover{opacity:1}
      .majoor-omnicam .oc-sequence-playhead{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:var(--oc-accent);opacity:.9;pointer-events:none}
      .majoor-omnicam .oc-dope-rail{position:absolute;top:50%;height:1px;margin-top:-.5px;background:var(--channel-color,var(--oc-accent));opacity:.5;pointer-events:none}

      /* The master lane keeps the legacy .key element -- it owns drag, retime,
         duplicate and multi-select -- but that element is a 32x48 chip with a
         diamond drawn inside it as ::before. Rather than fight its wall of
         !important declarations, the chip becomes an invisible hit target and
         its own ::before becomes the diamond. The interpolation glyphs
         (circle = smooth, square = linear, thick edge = hold) survive, and so
         do the selected / at-playhead ::before colours. */
      .majoor-omnicam .oc-dope-tracks .key{top:50% !important;width:20px !important;height:20px !important;min-width:0 !important;margin-top:-10px !important;border:0 !important;border-radius:0 !important;background:none !important;box-shadow:none !important;opacity:1 !important;transform:translateX(-50%) !important;animation:none !important}
      .majoor-omnicam .oc-dope-tracks .key::before{left:50%;top:50%;width:13px;height:13px;margin:-7px 0 0 -7px;border-color:#c4b5fd;background:#a78bfa;box-shadow:none;transform:rotate(45deg)}
      .majoor-omnicam .oc-dope-tracks .key[data-interp="smooth"]::before{transform:none}
      .majoor-omnicam .oc-dope-tracks .key[data-interp="linear"]::before{transform:none}
      .majoor-omnicam .oc-dope-tracks .key[data-interp="hold"]::before{transform:none}
      .majoor-omnicam .oc-dope-tracks .key:hover::before{filter:brightness(1.25)}
      .majoor-omnicam .oc-dope-tracks .key .key-label{display:none}
      .majoor-omnicam .oc-dope-key{position:absolute;top:50%;width:11px;height:11px;margin:-6px 0 0 -6px;padding:0;background:var(--channel-color,var(--oc-accent));border:1px solid rgba(0,0,0,.5);border-radius:2px;transform:rotate(45deg);cursor:pointer;z-index:3}
      .majoor-omnicam .oc-dope-key:hover{filter:brightness(1.25)}
      .majoor-omnicam .oc-dope-key.selected{outline:2px solid #fff;outline-offset:1px}
      .majoor-omnicam .oc-dope-key.at-playhead{box-shadow:0 0 0 3px rgba(255,255,255,.22)}

      .majoor-omnicam .oc-playhead-line{position:absolute;top:calc(var(--oc-ruler-h,30px) - 9px);bottom:0;width:2px;margin-left:-1px;background:var(--oc-accent);opacity:.85;pointer-events:none;z-index:5}

      /* ---- Timeline/Graph/Sequence mode block (Director modal audit Lot 3) --
         Timeline (the dope sheet), Graph (the curve editor) and Sequence used
         to be two stacked sections (.oc-lower always visible, a separate
         .oc-graph below it with its own inner tabs re-deriving a second,
         click-only dope view). They now share this one block -- and this same
         DOM region -- with the camera preview, switching via .oc-graph-tabs;
         .curve-editor replaces .oc-graph as the scoping class below (kept
         distinct from transport/solve-health, which stay outside it and
         visible no matter which mode tab is active) so a right-click inside
         it still reaches editor.js's .curve-editor context-menu routing. */
      .majoor-omnicam .curve-editor>.oc-graph-head{display:flex;align-items:center;gap:9px;padding:7px 10px;border-bottom:1px solid var(--oc-line)}
      .majoor-omnicam .oc-graph-tabs{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-graph-tab{padding:4px 12px;border:0;border-radius:5px;background:transparent;color:var(--oc-text-dim);font-size:11.5px;cursor:pointer}
      .majoor-omnicam .oc-graph-tab strong{font-weight:600}
      .majoor-omnicam .oc-graph-tab:hover{color:var(--oc-text)}
      .majoor-omnicam .oc-graph-tab.active{background:var(--oc-panel-2);color:var(--oc-text);box-shadow:inset 0 0 0 1px var(--oc-line)}
      .majoor-omnicam .curve-editor>.oc-graph-head .hint{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10.5px;color:var(--oc-text-faint)}
      /* overflow-x:auto here used to clip the overflow popover, leaving its
         interpolation and tangent buttons unreachable. It wraps instead. */
      .majoor-omnicam .oc-graph-toolbar{display:flex;align-items:center;gap:4px;padding:6px 10px;border-bottom:1px solid var(--oc-line-soft);flex-wrap:wrap}
      .majoor-omnicam .oc-graph-modes{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-graph-modes .curve-mode{border-color:transparent !important;background:transparent !important}
      .majoor-omnicam .oc-graph-toolbar .curve-mode{padding:4px 11px;border-radius:5px;background:var(--oc-sunken);border-color:var(--oc-line);color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .oc-graph-toolbar .curve-mode.active{background:var(--oc-accent) !important;border-color:var(--oc-accent) !important;color:#fff !important;box-shadow:none !important}
      .majoor-omnicam .oc-graph-spacer{flex:1;min-width:0}
      .majoor-omnicam .oc-graph-body{display:grid;grid-template-columns:150px minmax(0,1fr);gap:10px;padding:8px 10px 10px;min-width:0}
      /* The legend is only relevant to the Graph tab (hidden the rest of the
         time, see setGraphTab) -- grid-template-columns reserves its 150px
         track regardless of whether anything occupies it, so a plain
         grid-column assignment on the stage is not enough to reclaim that
         width once the legend is hidden; the track itself has to collapse. */
      .majoor-omnicam .oc-graph-body:has(>.oc-graph-legend[hidden]){grid-template-columns:minmax(0,1fr)}
      .majoor-omnicam .oc-graph-body:has(>.oc-graph-legend[hidden])>.oc-graph-stage{grid-column:1}
      .majoor-omnicam .oc-graph-legend{grid-column:1;display:flex;flex-direction:column;gap:3px}
      .majoor-omnicam .oc-graph-stage{grid-column:2;min-width:0}
      .majoor-omnicam .oc-graph-legend-title{padding:2px 4px 4px;color:var(--oc-text);font-size:11.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .oc-graph-legend .curve-mode{justify-content:flex-start;gap:8px;padding:5px 9px;border-radius:6px;background:var(--oc-sunken);border-color:var(--oc-line);color:var(--oc-text-dim);font-size:11px;text-align:left}
      .majoor-omnicam .oc-graph-legend .curve-mode.active{background:var(--oc-panel-2) !important;border-color:var(--oc-accent) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam .oc-graph-legend .ch-dot{width:10px;height:10px;border-radius:2px;flex:none}
      .majoor-omnicam .curve-canvas{width:100%;height:var(--oc-graph-h,220px);min-height:140px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-graph-resize{margin:2px 10px 8px;cursor:ns-resize}
      /* The Timeline tab's stage: the real dope sheet (.oc-dope, styled above)
         plus the motion-timeline row, sized to the same shared budget as the
         Graph/Sequence stages so switching tabs does not change the block's
         own height. */
      .majoor-omnicam .oc-dope-stage{display:flex;flex-direction:column;gap:8px;height:var(--oc-graph-h,220px);min-height:140px;overflow-y:auto;overscroll-behavior:contain}

      /* ---- solve-health strip ------------------------------------------ */
      /* One traffic-light row above the dope sheet. Muted, semantic, and grey
         (not green) when the solve carries no per-frame diagnostics. */
      .majoor-omnicam .oc-health-strip{display:flex;align-items:center;gap:8px;padding:3px 6px 4px;min-height:16px}
      .majoor-omnicam .oc-health-strip-label{flex:0 0 auto;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--oc-text-faint)}
      .majoor-omnicam .oc-health-cells{flex:1 1 auto;display:flex;gap:1px;height:8px;min-width:0}
      .majoor-omnicam .oc-health-cell{flex:1 1 0;min-width:0;border-radius:1px;background:var(--oc-line);cursor:pointer}
      .majoor-omnicam .oc-health-cell[data-state="good"]{background:color-mix(in srgb,var(--oc-ok) 78%,transparent)}
      .majoor-omnicam .oc-health-cell[data-state="warning"]{background:color-mix(in srgb,var(--oc-warn) 82%,transparent)}
      .majoor-omnicam .oc-health-cell[data-state="bad"]{background:color-mix(in srgb,var(--oc-danger) 85%,transparent)}
      .majoor-omnicam .oc-health-cell[data-state="unknown"]{background:var(--oc-line)}
      .majoor-omnicam .oc-health-cell.at-playhead{outline:1px solid var(--oc-accent);outline-offset:0}
      .majoor-omnicam .oc-health-cell:hover{filter:brightness(1.25)}
      .majoor-omnicam .oc-health-strip-readout{flex:0 0 auto;font:10px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-text-dim);min-width:96px;text-align:right}
      .majoor-omnicam .oc-health-strip-empty .oc-health-strip-label{opacity:.55}

      @container (max-width:820px){
        .majoor-omnicam .oc-body{grid-template-columns:minmax(0,1fr)}
        .majoor-omnicam .oc-side-resize{display:none}
        .majoor-omnicam .oc-side{width:100%}
        .majoor-omnicam .oc-lower{grid-template-columns:minmax(0,1fr)}
        .majoor-omnicam .oc-lower>.oc-resize-h{display:none}
        .majoor-omnicam .vp-hint{display:none}
      }
      @container (max-width:560px){
        .majoor-omnicam .oc-dope-body{--oc-dope-gutter:86px}
        .majoor-omnicam .oc-graph-body{grid-template-columns:minmax(0,1fr)}
        .majoor-omnicam .oc-graph-legend{flex-direction:row;flex-wrap:wrap}
        .majoor-omnicam .oc-transport{flex-wrap:wrap}
      }
`, O = 24, $ = 5, B = 150, H = Math.PI / 180;
function K(e, t, o) {
  return Math.min(o, Math.max(t, e));
}
function te(e, t = O) {
  const o = K(Number(e) || 0, $, B);
  return t / (2 * Math.tan(o * H / 2));
}
function oe(e, t = O) {
  const o = Math.max(1e-6, Number(e) || 0), a = 2 * Math.atan(t / (2 * o)) / H;
  return K(a, $, B);
}
function ae(e) {
  const t = te(e);
  return t >= 100 ? t.toFixed(0) : t.toFixed(1);
}
function Te(e) {
  return `${(Number(e) || 0).toFixed(1)}°`;
}
const Ne = [14, 18, 24, 35, 50, 85, 135], ze = {
  full_frame: { name: "Full Frame 35mm", width: 36, height: 24 },
  super_35: { name: "Super 35", width: 24.89, height: 18.66 },
  m43: { name: "Micro 4/3", width: 17.3, height: 13 },
  cinema_16_9: { name: "16:9 Digital Cinema", width: 23.76, height: 13.37 },
  mobile_9_16: { name: "Mobile 9:16 Vertical", width: 13.37, height: 23.76 }
}, re = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "9:16": 9 / 16, "2.39:1": 2.39 };
function ne(e) {
  if (!e) return null;
  const t = re[e.aspect_ratio];
  if (t) return t;
  if (!e.resolution_gate) return null;
  const o = Number(e.width) || 0, a = Number(e.height) || 0;
  return o > 0 && a > 0 ? o / a : null;
}
function ie(e, t, o, a) {
  const r = ne(t);
  if (!r || !(o > 0) || !(a > 0)) return;
  const n = o / a;
  if (Math.abs(n - r) < 1e-3) return;
  const c = !!t.resolution_gate;
  if (e.save(), e.fillStyle = "#000000b3", n > r) {
    const m = a * r, s = (o - m) / 2;
    e.fillRect(0, 0, s, a), e.fillRect(o - s, 0, s, a), c && (e.strokeStyle = "#ffffff88", e.strokeRect(s, 0, m, a));
  } else {
    const m = o / r, s = (a - m) / 2;
    e.fillRect(0, 0, o, s), e.fillRect(0, a - s, o, s), c && (e.strokeStyle = "#ffffff88", e.strokeRect(0, s, o, m));
  }
  e.restore();
}
const k = [
  "#4aa3ef",
  // Camera 1 - Blue/Cyan
  "#f2a93b",
  // Camera 2 - Amber/Gold
  "#48c774",
  // Camera 3 - Emerald/Green
  "#b565d8",
  // Camera 4 - Purple
  "#ec4899",
  // Camera 5 - Pink
  "#06b6d4",
  // Camera 6 - Cyan
  "#f97316",
  // Camera 7 - Orange
  "#8b5cf6"
  // Camera 8 - Violet
];
function L(e) {
  const t = `camera_${Date.now().toString(36)}`;
  let o = t, a = 2;
  for (; e.cameras.some((r) => r.id === o); ) o = `${t}_${a++}`;
  return o;
}
function se(e, t) {
  if (!e.cameras.some((a) => a.name === t)) return t;
  let o = 2;
  for (; e.cameras.some((a) => a.name === `${t} ${o}`); ) o += 1;
  return `${t} ${o}`;
}
function ce(e, t, { label: o = "Extracted Camera" } = {}) {
  const a = Array.isArray(t?.keyframes) ? t.keyframes : [];
  if (!a.length) throw new Error(p("no camera keys in this solve"));
  const r = Number(e.state.fps) || 24, n = Number(t.fps) || r, c = n > 0 ? r / n : 1, m = L(e.state), s = e.state.cameras.length, l = se(e.state, o || "Extracted Camera"), i = k[s % k.length], h = a.map((f) => ({
    ...f,
    frame: Math.round((Number(f.frame) || 0) * c),
    camera: S(f.camera)
  }));
  if (e.state.cameras.push({ id: m, name: l, color: i, camera: S(h[0].camera), keyframes: h }), Number.isFinite(Number(t.duration_frames))) {
    const f = Math.round(Number(t.duration_frames) * c);
    e.state.duration_frames = Math.max(e.state.duration_frames || 1, f);
  }
  return t?.metadata?.solve_health_v1 && (e.state.metadata = { ...e.state.metadata, solve_health_v1: t.metadata.solve_health_v1 }), e.cameraPreviewSignature = "", e.activateCamera(m), m;
}
function Re(e) {
  const t = I(e.state);
  for (const o of e.root.querySelectorAll('[data-role="playblast-camera"]')) {
    o.innerHTML = "";
    for (const r of e.state.cameras) {
      const n = document.createElement("option");
      n.value = r.id, n.textContent = r.name, o.appendChild(n);
    }
    const a = document.createElement("option");
    a.value = _, a.textContent = t.length ? p("Sequence ({count} shots)").replace("{count}", String(t.length)) : p("Sequence (no shots yet)"), a.disabled = t.length === 0, o.appendChild(a), o.value = e.state.playblast_camera_id;
  }
  for (const o of e.root.querySelectorAll('[data-role="active-camera-select"]')) {
    o.innerHTML = "";
    for (const a of e.state.cameras) {
      const r = document.createElement("option");
      r.value = a.id, r.textContent = a.name, o.appendChild(r);
    }
    o.value = e.state.active_camera_id;
  }
  W(e);
}
function le(e) {
  const t = e.state.cameras, o = t.filter((r) => r.solo), a = o.length ? o : t.filter((r) => !r.muted);
  return a.length ? a : t;
}
const z = 6;
function me(e) {
  const t = le(e);
  if (t.length <= z) return { tracks: t, overflow: 0 };
  const o = new Set([e.state.playblast_camera_id, e.state.active_camera_id].filter(Boolean)), a = t.filter((c) => o.has(c.id)), r = t.filter((c) => !o.has(c.id)), n = [...a, ...r].slice(0, z);
  return { tracks: n, overflow: t.length - n.length };
}
function W(e) {
  const t = e.root.querySelector('[data-role="camera-previews"]');
  if (!t) return;
  const o = e.state.preview_layout || "auto";
  t.dataset.layout !== (o === "auto" ? "" : o) && (t.dataset.layout = o === "auto" ? "" : o);
  const a = `${Math.max(1, e.state.width || 16)} / ${Math.max(1, e.state.height || 9)}`, r = t.style.getPropertyValue("--shot-aspect") !== a;
  r && t.style.setProperty("--shot-aspect", a);
  const n = e.root.querySelector('[data-role="camera-view-row"]');
  n && n.classList.toggle("maximized", !!e.state.maximized_camera_id);
  const { tracks: c, overflow: m } = me(e), s = `${c.map((i) => `${i.id}:${i.name}:${i.muted ? 1 : 0}:${i.solo ? 1 : 0}:${i.color || ""}`).join("|")}#${m}`;
  let l = !1;
  if (s !== e.cameraPreviewSignature && (l = !0, e.cameraPreviewSignature = s, t.innerHTML = "", e.cameraPreviewCanvases.clear(), e.cameraPreviewContexts.clear(), c.forEach((i, h) => {
    const f = document.createElement("div");
    f.className = "camera-preview-tile", f.dataset.cameraId = i.id;
    const x = i.color || k[h % k.length];
    f.style.setProperty("--camera-color", x), f.title = p("Click: set {value1} as primary · Double-click: edit · Right-click: preview actions", { value1: i.name });
    const g = document.createElement("div");
    g.className = "camera-preview-head";
    const b = document.createElement("i");
    b.className = "pi pi-video";
    const d = document.createElement("span");
    d.textContent = i.name;
    const v = document.createElement("span");
    v.dataset.cameraFrame = i.id, v.textContent = `F${e.frame}`;
    const u = document.createElement("i");
    u.className = "pi pi-circle-fill output-mark", u.title = p("Playblast camera");
    const j = document.createElement("canvas");
    j.dataset.cameraPreview = i.id;
    const C = document.createElement("span");
    C.className = "camera-view-badge", C.textContent = p("CAMERA PREVIEW"), g.append(b, d, v, u), f.append(j, g, C), t.appendChild(f), f.addEventListener("click", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = setTimeout(() => e.setPlayblastCamera(i.id), 220);
    }), f.addEventListener("dblclick", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = null, e.activateCamera(i.id);
    }), f.addEventListener("auxclick", (y) => {
      y.button === 1 && (y.preventDefault(), de(e, i.id));
    }), e.cameraPreviewCanvases.set(i.id, j), e.cameraPreviewContexts.set(i.id, j.getContext("2d", { alpha: !1 }));
  }), m > 0)) {
    const i = document.createElement("div");
    i.className = "camera-preview-tile camera-preview-overflow", i.textContent = p("+{count} more").replace("{count}", String(m)), i.title = p("Mute or solo cameras to change which previews show here"), t.appendChild(i);
  }
  for (const i of t.querySelectorAll(".camera-preview-tile"))
    i.classList.toggle("playblast", i.dataset.cameraId === e.state.playblast_camera_id), i.classList.toggle("active", i.dataset.cameraId === e.state.active_camera_id), i.classList.toggle("maximized", i.dataset.cameraId === e.state.maximized_camera_id);
  for (const i of t.querySelectorAll(".output-mark")) i.hidden = i.closest(".camera-preview-tile")?.dataset.cameraId !== e.state.playblast_camera_id;
  (l || r) && requestAnimationFrame(() => {
    e.root.isConnected && (e.resizeCanvas(), e.renderCameraView());
  });
}
function Pe(e) {
  e.checkpoint("Add camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const t = L(e.state), o = e.state.cameras.length, a = `Camera ${o + 1}`, r = S(e.camera), n = [
    (r.target?.[0] ?? 0) - (r.position?.[0] ?? 0),
    (r.target?.[1] ?? 0) - (r.position?.[1] ?? 0),
    (r.target?.[2] ?? -1) - (r.position?.[2] ?? 0)
  ], c = Math.hypot(...n) || 1;
  r.position = [0, 0, 0], r.target = n.map((l) => l / c);
  const m = k[o % k.length], s = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease";
  e.state.cameras.push({
    id: t,
    name: a,
    color: m,
    camera: r,
    keyframes: [{ frame: 0, camera: S(r), interpolation: s }]
  }), e.cameraPreviewSignature = "", e.activateCamera(t), e.setStatus(p("{value1} added", { value1: a }));
}
async function qe(e, t) {
  const o = e.state.cameras.find((r) => r.id === t);
  if (!o) return;
  const a = (await U(e.app, p("Rename camera"), p("Camera name"), o.name))?.trim();
  !a || a === o.name || (e.checkpoint("Rename camera"), o.name = a.slice(0, 80), e.cameraPreviewSignature = "", e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(p("Camera renamed: {value1}", { value1: o.name })));
}
function Ie(e, t) {
  const o = e.state.cameras.find((n) => n.id === t);
  if (!o) return;
  e.checkpoint("Duplicate camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const a = JSON.parse(JSON.stringify(o));
  a.id = L(e.state), a.name = `${o.name} Copy`;
  const r = e.state.cameras.length;
  if (a.color = k[r % k.length], a.camera?.position && (a.camera.position = [
    Math.round((a.camera.position[0] + 0.8) * 100) / 100,
    a.camera.position[1],
    Math.round((a.camera.position[2] + 0.8) * 100) / 100
  ]), a.keyframes)
    for (const n of a.keyframes)
      n.camera?.position && (n.camera.position = [
        Math.round((n.camera.position[0] + 0.8) * 100) / 100,
        n.camera.position[1],
        Math.round((n.camera.position[2] + 0.8) * 100) / 100
      ]);
  e.state.cameras.push(a), e.cameraPreviewSignature = "", e.activateCamera(a.id), e.setStatus(p("{value1} added", { value1: a.name }));
}
async function Fe(e, t) {
  if (e.state.cameras.length <= 1) return e.setStatus(p("At least one camera is required"));
  const o = e.state.cameras.find((r) => r.id === t);
  if (!o || !await ee(e.app, p("Delete camera"), p("Delete {value1} and its {value2} keyframe(s)?", { value1: o.name, value2: o.keyframes.length }))) return;
  e.checkpoint("Delete camera"), e.finishCameraEdit();
  const a = t === e.state.active_camera_id;
  if (e.state.cameras = e.state.cameras.filter((r) => r.id !== t), t === e.state.playblast_camera_id && (e.state.playblast_camera_id = e.state.cameras[0].id), e.cameraPreviewSignature = "", a) {
    const r = e.state.cameras[0];
    e.state.active_camera_id = r.id, e.state.keyframes = r.keyframes, e.state.camera = S(r.camera), e.camera = A(r, e.frame, e.state.objects), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = r.keyframes.find((n) => n.frame === e.frame)?.frame ?? null, e.selectedKeyFrames = e.selectedKeyFrame != null ? /* @__PURE__ */ new Set([e.selectedKeyFrame]) : /* @__PURE__ */ new Set(), e.editingKeyFrame = null;
  }
  e.pathSelection = q(e.pathSelection, e.activeCameraTrack()), e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(p("{value1} deleted", { value1: o.name }));
}
function De(e, t) {
  const o = e.state.cameras.find((a) => a.id === t);
  o && (e.finishCameraEdit(), e.syncActiveCameraTrack(), e.state.active_camera_id = o.id, e.state.keyframes = o.keyframes, e.state.camera = S(o.camera), e.camera = A(o, e.frame, e.state.objects), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = o.keyframes.find((a) => a.frame === e.frame)?.frame ?? null, e.selectedKeyFrames = e.selectedKeyFrame != null ? /* @__PURE__ */ new Set([e.selectedKeyFrame]) : /* @__PURE__ */ new Set(), e.pathSelection = q(e.pathSelection, o), e.editingKeyFrame = null, e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(p("Camera: {value1}", { value1: o.name })));
}
function Oe(e, t) {
  const o = I(e.state), a = t === _ && o.length > 0, r = a ? null : e.state.cameras.find((n) => n.id === t);
  !a && !r || (e.state.playblast_camera_id = a ? _ : r.id, e.refreshCameraSelectors(), e.serialize(), e.refreshObjects(), e.renderCameraView(), e.setStatus(a ? p("Playblast: sequence ({count} shots)").replace("{count}", String(o.length)) : p("Playblast: {value1}", { value1: r.name })));
}
function $e(e) {
  e.state.camera_view_visible = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-role="camera-view-row"]')) t.hidden = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    t.classList.toggle("active", e.state.camera_view_visible), t.setAttribute("aria-pressed", String(e.state.camera_view_visible));
  e.serialize(), e.state.camera_view_visible && requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(p("Camera previews {value1}", { value1: e.state.camera_view_visible ? "shown" : "hidden" }));
}
function de(e, t) {
  e.state.maximized_camera_id = e.state.maximized_camera_id === t ? null : t, e.serialize(), W(e), requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(e.state.maximized_camera_id ? p("Preview maximized") : p("Preview restored"));
}
function Be(e, t, o, a) {
  if (e.state.guides !== !1) {
    t.save(), t.strokeStyle = "#ffffff55", t.lineWidth = Math.max(1, o / 640), t.beginPath();
    for (const r of [o / 3, 2 * o / 3])
      t.moveTo(r, 0), t.lineTo(r, a);
    for (const r of [a / 3, 2 * a / 3])
      t.moveTo(0, r), t.lineTo(o, r);
    t.stroke(), t.restore();
  }
  if (e.state.safe_areas) {
    t.save(), t.strokeStyle = "#f2d06b99", t.lineWidth = 1;
    for (const r of [0.05, 0.1])
      t.strokeRect(o * r, a * r, o * (1 - 2 * r), a * (1 - 2 * r));
    t.restore();
  }
  ie(t, e.state, o, a);
}
function He(e, t) {
  const o = oe(t);
  e.checkpoint(`Lens: ${t}mm`), e.beginCameraEdit(), e.camera.fov = o, e.commitCameraEdit(), e.finishCameraEdit();
  for (const a of e.root.querySelectorAll('[data-role="camera-fov"]')) a.value = String(o.toFixed(1));
  for (const a of e.root.querySelectorAll('[data-role="camera-focal"]')) a.value = ae(o);
  e.setStatus(`Lens: ${t}mm (FOV ${o.toFixed(1)}°)`);
}
const M = "upstream_camera_track";
function Ke(e, t, {
  label: o = "Import camera",
  source: a = "camera_import",
  fingerprint: r = "",
  originNodeId: n = null,
  adoptFps: c = !0,
  checkpoint: m = !0,
  status: s = !0
} = {}) {
  const l = t?.keyframes;
  if (!Array.isArray(l) || !l.length)
    throw new Error(p("no camera keys in this file"));
  m && e.checkpoint(o);
  const i = Y(e);
  return i.keyframes = l, e.state.keyframes = l, c && Number.isFinite(Number(t.fps)) && (e.state.fps = Math.max(1, Math.round(Number(t.fps))), e.fpsWidget && (e.fpsWidget.value = e.state.fps)), Number.isFinite(Number(t.duration_frames)) && (e.state.duration_frames = Math.max(1, Math.round(Number(t.duration_frames)))), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / Math.max(1, e.state.fps)), r && (e.state.metadata = {
    ...e.state.metadata,
    [M]: {
      fingerprint: r,
      source: a,
      ...n == null ? {} : { origin_node_id: String(n) }
    }
  }), e.syncActiveCameraTrack(), e.setFrame(0), e.refreshKeys(), e.render(), e.scheduleSerialize(), s && e.setStatus(p("Imported {count} camera keys from {name}").replace("{count}", String(l.length)).replace("{name}", o)), l.length;
}
function We(e) {
  const t = e?.reconstruction;
  if (!t) return [];
  const o = t.axis_confidence || {};
  return [
    ["Role", String(t.role || "")],
    ["Semantic", String(t.semantic || "")],
    ["Confidence", Number(t.confidence ?? 0).toFixed(2)],
    ["Width", Number(o.width ?? 0).toFixed(2)],
    ["Height", Number(o.height ?? 0).toFixed(2)],
    ["Depth", Number(o.depth ?? 0).toFixed(2)],
    ["Yaw", Number(o.yaw ?? 0).toFixed(2)],
    ["Completion", String(t.completion_provider || "none")]
  ];
}
function pe(e, t) {
  const o = e?.reconstruction?.role || "";
  return o === "blockout_object" ? { locked: !1, visible: !0 } : o === "asset_proxy" ? { locked: !1, visible: !0 } : o === "room" || o === "reference" ? { locked: !0, visible: !(o === "reference" && String(t) === "blockout") } : { locked: !0, visible: !0 };
}
function ue(e) {
  return e?.reconstruction?.recon_mode || e?.motion_scene?.metadata?.reconstruction?.mode || e?.metadata?.reconstruction?.mode || "";
}
function R(e, t) {
  const o = e?.reconstruction?.role;
  if (!o) return e;
  const a = pe(e, t);
  return (e.locked === void 0 || o === "room" || o === "reference") && (e.locked = a.locked), o === "reference" && (e.enabled = a.visible), e;
}
function V(e) {
  return (e?.cameras || []).map((t, o) => {
    const a = (t?.track?.keyframes || t?.keyframes || []).map((n) => ({
      frame: Math.max(0, Math.round(Number(n?.frame || 0))),
      camera: n?.camera || n,
      interpolation: n?.interpolation || "hold"
    })), r = a[0]?.camera || t?.camera || null;
    return {
      id: String(t?.id || `camera_${o + 1}`),
      name: String(t?.label || t?.name || "Source Camera"),
      enabled: t?.enabled !== !1,
      locked: !!t?.locked,
      color: t?.color,
      camera: r,
      keyframes: a.length ? a : r ? [{ frame: 0, camera: r, interpolation: "hold" }] : []
    };
  });
}
function he(e) {
  const t = e?.canvas || {}, o = e?.timeline || {}, a = Math.max(1, Math.round(Number(o.authoring_fps || e?.fps || 24))), r = Number(o.duration_seconds || 0);
  return {
    ...e,
    width: Number(t.width || e?.width || 1280),
    height: Number(t.height || e?.height || 720),
    fps: a,
    duration_frames: r > 0 ? Math.max(1, Math.round(r * a)) : Number(e?.duration_frames || a * 5),
    cameras: V(e)
  };
}
function P(e, t) {
  if (!e || !e.has(t)) return t;
  let o = 2;
  for (; e.has(`${t}_${o}`); )
    o += 1;
  return `${t}_${o}`;
}
function fe(e) {
  const t = e?.state;
  if (!t) return !0;
  if ((t.objects || []).length > 0) return !1;
  const a = t.cameras || [];
  return a.length <= 1 ? (a[0]?.keyframes || []).length <= 1 : !1;
}
function ge(e, t, o = {}) {
  const a = t?.motion_scene || t;
  if (!a || !Array.isArray(a.objects))
    throw new Error("Reconstruction result has no objects array");
  const r = o.mode || (fe(e) ? "replace" : "merge"), n = o.reconMode || ue(t);
  if (r === "replace") {
    e.checkpoint?.("Adopt reconstructed scene (replace)"), e.state = J(
      he(JSON.parse(JSON.stringify(a)))
    ), e.camera = A(e.state, e.frame || 0);
    for (const c of e.state.objects || [])
      R(c, n), (c.type === "glb" || c.type === "model") && c.asset && e.modelUrlsById?.set(c.id, N(c.asset));
  } else {
    e.checkpoint?.("Merge reconstructed environment");
    const c = new Set((e.state.objects || []).map((i) => i.id)), m = new Set((e.state.cameras || []).map((i) => i.id)), s = /* @__PURE__ */ new Map(), l = a.objects.map((i) => JSON.parse(JSON.stringify(i)));
    for (const i of l) {
      const h = P(c, i.id);
      c.add(h), s.set(i.id, h), i.id = h;
    }
    for (const i of l)
      i.parent_id && s.has(i.parent_id) && (i.parent_id = s.get(i.parent_id)), R(i, n), e.state.objects.push(i), (i.type === "glb" || i.type === "model") && i.asset && e.modelUrlsById?.set(i.id, N(i.asset));
    for (const i of V(a)) {
      const h = P(m, i.id);
      m.add(h), i.id = h, i.enabled = !1, e.state.cameras.push(i);
    }
  }
  e.serialize?.(), e.refreshObjects?.(), e.render?.(), e.setStatus?.("Adopted reconstructed scene into Director");
}
const xe = "solved_scene";
function be(e) {
  return String(e?.comfyClass || e?.type || e?.constructor?.type || "");
}
function ve(e) {
  const t = e?.node, o = t?.graph;
  if (!o) return null;
  for (const a of t.inputs || []) {
    if (String(a?.name || "").toLowerCase() !== xe || a.link == null) continue;
    const r = Z(o, a.link);
    if (r && be(r) === X) return r;
  }
  return null;
}
function ye(e) {
  return String(e?.state?.metadata?.[M]?.fingerprint || "");
}
function we(e, t, o) {
  e.state.metadata = {
    ...e.state.metadata,
    [M]: {
      fingerprint: t,
      source: "omnicam_extractor",
      origin_node_id: String(o.id)
    }
  };
}
function T(e) {
  const t = e.root?.querySelector('[data-role="extractor-import-banner"]');
  if (!t) return;
  const o = e.pendingExtractorImport;
  if (t.hidden = !o, !o) return;
  const a = t.querySelector('[data-role="extractor-import-text"]');
  a && (a.textContent = p("{count} camera keys ready from {name} — import as a new camera?").replace("{count}", String(o.keyCount)).replace("{name}", o.label));
}
function Ve(e) {
  const t = ve(e), o = t ? Q(t) : null;
  let a = !1;
  return o ? o.fingerprint !== ye(e) && e.pendingExtractorImport?.fingerprint !== o.fingerprint && (e.pendingExtractorImport = {
    track: o.track,
    fingerprint: o.fingerprint,
    originNodeId: t.id,
    label: String(t.title || p("OmniCam Extractor")),
    keyCount: o.track.keyframes?.length || 0
  }, we(e, o.fingerprint, t), a = !0) : e.pendingExtractorImport && (e.pendingExtractorImport = null, a = !0), T(e), a;
}
function Ge(e) {
  const t = e.pendingExtractorImport;
  return t ? (e.checkpoint("Import extracted camera"), ce(e, t.track, { label: t.label }), e.pendingExtractorImport = null, T(e), e.setStatus?.(p("Imported {count} camera keys from {name}").replace("{count}", String(t.keyCount)).replace("{name}", t.label)), e.scheduleSerialize(), e.render(), !0) : !1;
}
function Je(e) {
  return e.pendingExtractorImport ? (e.pendingExtractorImport = null, T(e), e.render(), e.setStatus?.(p("Extracted camera preview dismissed")), !0) : !1;
}
function Xe(e) {
  const t = e?.graph;
  if (!t) return 0;
  const o = e.outputs || [], a = /* @__PURE__ */ new Set();
  let r = 0;
  for (const n of o)
    for (const c of n?.links || []) {
      const m = F(t, c), s = m?.target_id ?? m?.targetId;
      if (!m || s == null || a.has(s)) continue;
      a.add(s);
      const l = t.getNodeById?.(s), i = l?.__majoorOmniCamDirectorRuntime?.workbench ?? l?.__majoorOmniCam;
      i?.syncUpstreamInputs && (i.syncUpstreamInputs(), r += 1);
    }
  return r;
}
function Ye(e, t) {
  const o = e?.graph;
  if (!o) return 0;
  const a = e.outputs || [], r = /* @__PURE__ */ new Set();
  let n = 0;
  for (const c of a)
    for (const m of c?.links || []) {
      const s = F(o, m), l = s?.target_id ?? s?.targetId;
      if (!s || l == null || r.has(l)) continue;
      r.add(l);
      const i = o.getNodeById?.(l), h = i?.__majoorOmniCamDirectorRuntime ?? i?.__majoorOmniCam;
      h && (ge(h, t), n += 1);
    }
  return n;
}
export {
  Oe as A,
  $e as B,
  k as C,
  Xe as D,
  Ye as E,
  Ke as F,
  Me as L,
  ze as S,
  Ne as a,
  Te as b,
  oe as c,
  Ge as d,
  Je as e,
  ae as f,
  He as g,
  ee as h,
  ie as i,
  Ae as j,
  _e as k,
  Ee as l,
  De as m,
  L as n,
  Le as o,
  U as p,
  Pe as q,
  We as r,
  Ve as s,
  Fe as t,
  Be as u,
  Ie as v,
  de as w,
  W as x,
  Re as y,
  qe as z
};
