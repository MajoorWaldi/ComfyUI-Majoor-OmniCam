import { c as k, bm as x, e as w, aP as A, bn as ae, v as O, s as N, bo as oe, a as b, g as $, aQ as R, bp as re } from "./chunk-Rl7mD9y2.js";
import { m as ne, g as B, l as se } from "./chunk-BOI_2OKd.js";
function Fe(e, t) {
  const a = { "add-camera": "Create a new animated camera from the current view", record: "Record the primary camera preview as a proxy playblast", "h3-setup": "Create and connect the H3 camera-motion reference nodes", "load-card": "Replace the subject card with an image or video", "add-card": "Create another image or video card", "load-model": "Import a local GLB, OBJ, FBX, STL, or PLY scene", "reset-camera": "Reset the active camera transform and lens", play: "Play or stop the timeline (Space)", key: "Insert or replace a key at the playhead (I)", "auto-key": "Record camera or object edits at the playhead", "delete-key": "Delete the selected keyframe (Delete)", "copy-key": "Copy the selected keyframe (Ctrl/Cmd+C)", "paste-key": "Paste a keyframe at the playhead (Ctrl/Cmd+V)", "previous-key": "Jump to the previous keyframe (,)", "next-key": "Jump to the next keyframe (.)", "previous-frame": "Move one frame backward (Left Arrow)", "next-frame": "Move one frame forward (Right Arrow)", "toggle-camera-view": "Show or hide the camera preview strip", "update-key": "Store the current camera view in the selected key", "view-key": "Load the selected key's camera view" };
  for (const o of e.querySelectorAll("button,select,input,summary")) {
    if (o.title) continue;
    const r = o.getAttribute("aria-label") || a[o.dataset?.act] || o.closest("label")?.querySelector("span")?.textContent?.trim() || o.closest("label")?.childNodes?.[0]?.textContent?.trim() || o.textContent?.trim();
    r && (o.title = r);
  }
  t.title = "Viewport: drag to orbit, Shift+drag to pan, wheel to dolly, WASD/QE to fly. Right-click for scene actions.", e.querySelector('[data-role="keys"]').title = "Timeline: click or drag to scrub. Drag a key to retime it. Right-click for key actions.";
}
class De {
  constructor(t) {
    this.root = t, this.menu = t.querySelector('[data-role="context-menu"]'), this.submenus = [], this.returnFocus = null, this.dismissHandler = null, this.dismissTimer = null, this.disposed = !1, this.menu && (this.menu.classList.add("majoor-omnicam"), this.menu.addEventListener("pointerdown", (a) => a.stopPropagation()), this.menu.addEventListener("mousedown", (a) => a.stopPropagation()), this.menu.addEventListener("click", (a) => a.stopPropagation()), this.menu.addEventListener("contextmenu", (a) => {
      a.preventDefault(), a.stopPropagation();
    }), this.menu.addEventListener("keydown", (a) => this.onKey(a)));
  }
  hide({ restoreFocus: t = !1 } = {}) {
    this.dismissTimer !== null && (clearTimeout(this.dismissTimer), this.dismissTimer = null), this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0), this.dismissHandler = null);
    for (const a of this.submenus)
      a.hidden = !0, a.remove();
    this.submenus = [], this.menu && (this.menu.hidden = !0, t && this.returnFocus?.focus?.({ preventScroll: !0 }));
  }
  closeSubmenusFrom(t) {
    for (const a of t.querySelectorAll(".oc-has-submenu.active"))
      a.classList.remove("active");
  }
  renderActions(t, a, o = null) {
    if (t.innerHTML = "", o) {
      const r = document.createElement("div");
      r.className = "context-menu-title", r.textContent = o, t.appendChild(r);
    }
    for (const r of a) {
      if (r === null) {
        const i = document.createElement("div");
        i.className = "context-menu-separator", t.appendChild(i);
        continue;
      }
      const s = document.createElement("button");
      if (s.type = "button", s.setAttribute("role", "menuitem"), s.disabled = !!r.disabled, s.classList.toggle("danger", !!r.danger), s.title = r.help || r.label, r.checked !== void 0) {
        const i = document.createElement("i");
        i.className = `pi ${r.checked ? "pi-check" : ""} oc-menu-check`, i.style.width = "14px", i.style.fontSize = "10px", i.style.color = r.checked ? "var(--oc-accent, #38bdf8)" : "transparent", s.appendChild(i);
      }
      if (r.icon) {
        const i = document.createElement("i");
        i.className = `pi ${r.icon}`, s.appendChild(i);
      } else if (r.iconSvg) {
        const i = document.createElement("span");
        i.className = "oc-menu-icon-svg", i.innerHTML = r.iconSvg, s.appendChild(i);
      }
      const l = document.createElement("span");
      l.className = "oc-menu-label", l.textContent = r.label, s.appendChild(l);
      const d = r.items || r.submenu;
      if (Array.isArray(d) && d.length) {
        s.classList.add("oc-has-submenu");
        const i = document.createElement("i");
        i.className = "pi pi-chevron-right oc-submenu-chevron", i.style.marginLeft = "auto", i.style.fontSize = "9px", i.style.opacity = "0.7", s.appendChild(i);
        const c = document.createElement("div");
        c.className = "context-menu context-submenu majoor-omnicam", c.hidden = !0, document.body.appendChild(c), this.submenus.push(c), this.renderActions(c, d, null);
        let m = null, f = null;
        const v = () => {
          clearTimeout(f), c.parentElement !== document.body && document.body.appendChild(c), c.hidden = !1, s.classList.add("active");
          const p = s.getBoundingClientRect(), g = c.getBoundingClientRect(), h = 8;
          let y = p.right + 2;
          y + g.width > window.innerWidth - h && (y = Math.max(h, p.left - g.width - 2));
          let u = p.top - 4;
          u + g.height > window.innerHeight - h && (u = Math.max(h, window.innerHeight - g.height - h)), c.style.left = `${y}px`, c.style.top = `${u}px`;
        }, n = () => {
          clearTimeout(m), f = setTimeout(() => {
            c.hidden = !0, s.classList.remove("active");
          }, 160);
        };
        s.addEventListener("pointerenter", () => {
          clearTimeout(f), m = setTimeout(v, 60);
        }), s.addEventListener("pointerleave", n), c.addEventListener("pointerenter", () => clearTimeout(f)), c.addEventListener("pointerleave", n), c.addEventListener("keydown", (p) => this.onKey(p)), s._submenuEl = c, s.addEventListener("click", (p) => {
          p.preventDefault(), p.stopPropagation(), c.hidden ? v() : n();
        });
      } else {
        if (r.shortcut) {
          const i = document.createElement("kbd");
          i.className = "shortcut", i.textContent = r.shortcut, s.appendChild(i);
        }
        s.addEventListener("click", (i) => {
          i.preventDefault(), i.stopPropagation(), this.hide();
          try {
            r.run?.();
          } catch (c) {
            console.error("Context menu action failed:", c);
          }
        });
      }
      s.addEventListener("pointerdown", (i) => i.stopPropagation()), s.addEventListener("mousedown", (i) => i.stopPropagation()), t.appendChild(s);
    }
  }
  show(t, a, o) {
    if (!this.menu || this.disposed) return;
    this.dismissTimer !== null && (clearTimeout(this.dismissTimer), this.dismissTimer = null), t.preventDefault(), t.stopPropagation(), t.stopImmediatePropagation?.(), this.returnFocus = document.activeElement, this.menu.parentElement !== document.body && document.body.appendChild(this.menu), this.menu.classList.add("majoor-omnicam");
    for (const i of this.submenus) i.remove();
    this.submenus = [], this.renderActions(this.menu, o, a), this.menu.hidden = !1;
    const r = 8, s = this.menu.getBoundingClientRect(), l = Math.max(r, Math.min(t.clientX, window.innerWidth - s.width - r)), d = Math.max(r, Math.min(t.clientY, window.innerHeight - s.height - r));
    this.menu.style.left = `${l}px`, this.menu.style.top = `${d}px`, this.menu.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 }), this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0)), this.dismissHandler = (i) => {
      i.target && (this.menu.contains(i.target) || this.submenus.some((c) => c.contains(i.target))) || this.hide();
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
    const a = document.activeElement, o = a?.closest?.(".context-menu");
    if (!o)
      return t.key === "Escape" ? (t.preventDefault(), this.hide({ restoreFocus: !0 }), !0) : !1;
    const r = [...o.querySelectorAll("button:not(:disabled)")], s = r.indexOf(a);
    if (t.key === "Escape")
      return t.preventDefault(), o !== this.menu ? (o.hidden = !0, [...document.querySelectorAll(".oc-has-submenu")].find((d) => d._submenuEl === o)?.focus()) : this.hide({ restoreFocus: !0 }), !0;
    if (["ArrowDown", "ArrowUp"].includes(t.key)) {
      t.preventDefault();
      const l = t.key === "ArrowDown" ? 1 : -1;
      return r[(s + l + r.length) % r.length]?.focus(), !0;
    }
    return t.key === "ArrowRight" && a?._submenuEl ? (t.preventDefault(), a._submenuEl.hidden = !1, a.classList.add("active"), a._submenuEl.querySelector("button:not(:disabled)")?.focus(), !0) : t.key === "ArrowLeft" && o !== this.menu ? (t.preventDefault(), o.hidden = !0, [...document.querySelectorAll(".oc-has-submenu")].find((d) => d._submenuEl === o)?.focus(), !0) : !1;
  }
}
const _ = /* @__PURE__ */ new WeakMap();
function Oe(e) {
  const t = _.get(e);
  if (t) {
    for (const a of [...t]) a();
    _.delete(e);
  }
}
function H({ title: e, message: t, withInput: a = !1, defaultValue: o = "", owner: r = null }) {
  return typeof document > "u" || !document.body ? Promise.resolve(a ? null : !1) : new Promise((s) => {
    const l = document.createElement("div");
    l.className = "majoor-omnicam oc-modal-backdrop", l.setAttribute("role", "dialog"), l.setAttribute("aria-modal", "true"), Object.assign(l.style, {
      position: "fixed",
      inset: "0",
      zIndex: "100000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.55)"
    });
    const d = document.createElement("div");
    d.className = "oc-modal", Object.assign(d.style, {
      maxWidth: "min(440px, 92vw)",
      padding: "18px 20px",
      borderRadius: "10px",
      background: "var(--oc-panel, #1e1f26)",
      color: "var(--oc-text, #e8e8ec)",
      border: "1px solid var(--oc-line, #34363f)",
      boxShadow: "0 12px 48px rgba(0,0,0,0.5)",
      font: "13px/1.5 system-ui, sans-serif"
    });
    const i = document.createElement("h3");
    i.textContent = e || "", Object.assign(i.style, { margin: "0 0 8px", fontSize: "14px" });
    const c = document.createElement("p");
    c.textContent = t || "", Object.assign(c.style, { margin: "0 0 14px", opacity: "0.85" });
    let m = null;
    a && (m = document.createElement("input"), m.type = "text", m.value = o == null ? "" : String(o), Object.assign(m.style, {
      width: "100%",
      boxSizing: "border-box",
      marginBottom: "14px",
      padding: "6px 8px",
      background: "var(--oc-sunken, #16171c)",
      color: "inherit",
      border: "1px solid var(--oc-line, #34363f)",
      borderRadius: "6px"
    }));
    const f = document.createElement("div");
    Object.assign(f.style, { display: "flex", gap: "8px", justifyContent: "flex-end" });
    const v = document.createElement("button");
    v.type = "button", v.textContent = "Cancel";
    const n = document.createElement("button");
    n.type = "button", n.textContent = "OK";
    for (const u of [v, n])
      Object.assign(u.style, {
        padding: "6px 14px",
        borderRadius: "6px",
        cursor: "pointer",
        border: "1px solid var(--oc-line, #34363f)",
        background: "transparent",
        color: "inherit"
      });
    n.style.background = "var(--oc-accent, #4c6ef5)", n.style.borderColor = "transparent", n.style.color = "#fff", f.append(v, n), d.append(i, c), m && d.append(m), d.append(f), l.append(d);
    let p = !1;
    const g = (u) => {
      p || (p = !0, document.removeEventListener("keydown", y, !0), r && typeof r == "object" && _.get(r)?.delete(h), l.remove(), s(u));
    }, h = () => g(a ? null : !1);
    if (r && typeof r == "object") {
      let u = _.get(r);
      u || _.set(r, u = /* @__PURE__ */ new Set()), u.add(h);
    }
    const y = (u) => {
      u.key === "Escape" ? (u.stopPropagation(), g(a ? null : !1)) : u.key === "Enter" && (u.stopPropagation(), g(a ? m.value : !0));
    };
    v.addEventListener("click", () => g(a ? null : !1)), n.addEventListener("click", () => g(a ? m.value : !0)), l.addEventListener("mousedown", (u) => {
      u.target === l && g(a ? null : !1);
    }), document.addEventListener("keydown", y, !0), document.body.appendChild(l), (m || n).focus();
  });
}
function $e({ title: e, items: t = [], onDelete: a = null, owner: o = null }) {
  return typeof document > "u" || !document.body ? Promise.resolve(null) : new Promise((r) => {
    const s = document.createElement("div");
    s.className = "majoor-omnicam oc-modal-backdrop", s.setAttribute("role", "dialog"), s.setAttribute("aria-modal", "true"), Object.assign(s.style, {
      position: "fixed",
      inset: "0",
      zIndex: "100000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.55)"
    });
    const l = document.createElement("div");
    l.className = "oc-modal", Object.assign(l.style, {
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
    const d = document.createElement("h3");
    d.textContent = e || "", Object.assign(d.style, { margin: "0 0 12px", fontSize: "14px" });
    const i = document.createElement("div");
    Object.assign(i.style, {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      maxHeight: "min(52vh, 420px)",
      overflowY: "auto",
      marginBottom: "14px"
    });
    let c = !1;
    const m = (h) => {
      c || (c = !0, document.removeEventListener("keydown", g, !0), o && typeof o == "object" && _.get(o)?.delete(f), s.remove(), r(h));
    }, f = () => m(null), v = (h) => {
      const y = document.createElement("div");
      Object.assign(y.style, { display: "flex", alignItems: "stretch", gap: "4px" });
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
      j.textContent = h.label || h.id;
      const C = document.createElement("div");
      if (C.textContent = h.sublabel || "", Object.assign(C.style, { opacity: "0.6", fontSize: "11px" }), u.append(j, C), u.addEventListener("click", () => m(h.id)), y.appendChild(u), a) {
        const E = document.createElement("button");
        E.type = "button", E.title = "Delete", E.textContent = "✕", Object.assign(E.style, {
          width: "34px",
          borderRadius: "6px",
          cursor: "pointer",
          border: "1px solid var(--oc-line, #34363f)",
          background: "transparent",
          color: "inherit"
        }), E.addEventListener("click", (te) => {
          te.stopPropagation(), y.remove(), i.children.length || m(null);
          try {
            a(h.id);
          } catch {
          }
        }), y.appendChild(E);
      }
      return y;
    };
    for (const h of t) i.appendChild(v(h));
    const n = document.createElement("div");
    Object.assign(n.style, { display: "flex", justifyContent: "flex-end" });
    const p = document.createElement("button");
    if (p.type = "button", p.textContent = "Cancel", Object.assign(p.style, {
      padding: "6px 14px",
      borderRadius: "6px",
      cursor: "pointer",
      border: "1px solid var(--oc-line, #34363f)",
      background: "transparent",
      color: "inherit"
    }), p.addEventListener("click", () => m(null)), n.appendChild(p), l.append(d, i, n), s.appendChild(l), o && typeof o == "object") {
      let h = _.get(o);
      h || _.set(o, h = /* @__PURE__ */ new Set()), h.add(f);
    }
    const g = (h) => {
      h.key === "Escape" && (h.stopPropagation(), m(null));
    };
    s.addEventListener("mousedown", (h) => {
      h.target === s && m(null);
    }), document.addEventListener("keydown", g, !0), document.body.appendChild(s), i.querySelector("button")?.focus({ preventScroll: !0 });
  });
}
async function ie(e, t, a, o) {
  let r, s, l, d, i;
  typeof e == "object" && e !== null ? (s = e, r = e.extensionManager ? e : e.app, l = t, d = a, i = o) : (r = typeof window < "u" ? window.app : null, l = e, d = t, i = a);
  const c = r?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return c?.prompt ? c.prompt({ title: l, message: d, defaultValue: i }) : H({ title: l, message: d, withInput: !0, defaultValue: i, owner: s });
}
async function ce(e, t, a) {
  let o, r, s, l;
  typeof e == "object" && e !== null ? (r = e, o = e.extensionManager ? e : e.app, s = t, l = a) : (o = typeof window < "u" ? window.app : null, s = e, l = t);
  const d = o?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return d?.confirm ? d.confirm({ title: s, message: l }) : H({ title: s, message: l, withInput: !1, owner: r });
}
const Be = `
      /* The Outliner tab escapes the shared 520px side-panel scroll box: its
         list has an explicit, drag-controlled height (see .scene-tree) and the
         node grows to fit, so a nested max-height here would just re-introduce
         the cramped inner scrollbar the resize handle exists to avoid. The
         other tabs (Inspector, Shot, Health) keep the shared cap. */
      .majoor-omnicam .oc-side-body[data-tab-panel="scene"]{max-height:none;overflow:visible}
      .majoor-omnicam .oc-lower{display:grid;grid-template-columns:var(--oc-preview-w,236px) 9px minmax(0,1fr);gap:8px;padding:0 8px 8px}
      .majoor-omnicam .oc-preview{display:flex;flex-direction:column;gap:6px;padding:8px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);position:static;width:auto}
      .majoor-omnicam .oc-preview-head{display:flex;align-items:center;gap:6px;color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .oc-preview-head>span:first-child{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .oc-preview .camera-strip-close{position:static;width:24px;height:24px;min-width:24px;padding:0;flex:none}
      /* Flex column, not grid: an aspect-ratio grid item inside a max-height,
         overflow:auto grid track gets its row shrunk below its own computed
         height in Chromium/Edge, so consecutive tiles drew on top of each
         other and no camera framed correctly. A flex column with flex:0 0 auto
         tiles simply stacks -- each tile keeps its full aspect height and the
         strip grows to fit (the node grows with it), so every camera view is
         whole. The strip is no longer capped: widening the column via the
         splitter is meant to enlarge the previews. */
      .majoor-omnicam .oc-preview .camera-preview-strip{display:flex;flex-direction:column;flex-wrap:nowrap;gap:6px;max-height:none;overflow:visible;padding:0;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-preview .camera-preview-strip:empty{min-height:120px}
      /* A preview whose box is not the shot's shape shows a framing the render
         will not produce. The tile takes the shot aspect; --shot-aspect is set
         from state.width/height in refreshCameraPreviews(). */
      .majoor-omnicam .oc-preview .camera-preview-tile{flex:0 0 auto;width:100%;height:auto;min-height:0;aspect-ratio:var(--shot-aspect,16/9)}
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
      .majoor-omnicam .oc-sequence-handle{position:absolute;left:-6px;top:0;bottom:0;width:13px;cursor:ew-resize;background:var(--shot-color);border-radius:2px;opacity:.85;touch-action:none}
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

      /* ---- graph editor ---------------------------------------------- */
      .majoor-omnicam .oc-graph{margin:0 8px 8px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);overflow:hidden}
      .majoor-omnicam .oc-graph>.oc-graph-head{display:flex;align-items:center;gap:9px;padding:7px 10px;border-bottom:1px solid var(--oc-line)}
      /* Collapsed by the transport's graph toggle: keep the mode row, drop the rest. */
      .majoor-omnicam .oc-graph.oc-graph-collapsed>.oc-graph-head{border-bottom:0}
      .majoor-omnicam .oc-graph.oc-graph-collapsed .oc-graph-toolbar,
      .majoor-omnicam .oc-graph.oc-graph-collapsed .oc-graph-body,
      .majoor-omnicam .oc-graph.oc-graph-collapsed .oc-graph-resize{display:none}
      .majoor-omnicam .oc-graph-tabs{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-graph-tab{padding:4px 12px;border:0;border-radius:5px;background:transparent;color:var(--oc-text-dim);font-size:11.5px;cursor:pointer}
      .majoor-omnicam .oc-graph-tab strong{font-weight:600}
      .majoor-omnicam .oc-graph-tab:hover{color:var(--oc-text)}
      .majoor-omnicam .oc-graph-tab.active{background:var(--oc-panel-2);color:var(--oc-text);box-shadow:inset 0 0 0 1px var(--oc-line)}
      .majoor-omnicam .oc-graph>.oc-graph-head .hint{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10.5px;color:var(--oc-text-faint)}
      /* overflow-x:auto here used to clip the overflow popover, leaving its
         interpolation and tangent buttons unreachable. It wraps instead. */
      .majoor-omnicam .oc-graph-toolbar{display:flex;align-items:center;gap:4px;padding:6px 10px;border-bottom:1px solid var(--oc-line-soft);flex-wrap:wrap}
      .majoor-omnicam .oc-graph-modes{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-graph-modes .curve-mode{border-color:transparent !important;background:transparent !important}
      .majoor-omnicam .oc-graph-toolbar .curve-mode{padding:4px 11px;border-radius:5px;background:var(--oc-sunken);border-color:var(--oc-line);color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .oc-graph-toolbar .curve-mode.active{background:var(--oc-accent) !important;border-color:var(--oc-accent) !important;color:#fff !important;box-shadow:none !important}
      .majoor-omnicam .oc-graph-spacer{flex:1;min-width:0}
      .majoor-omnicam .oc-graph-body{display:grid;grid-template-columns:150px minmax(0,1fr);gap:10px;padding:8px 10px 10px;min-width:0}
      .majoor-omnicam .oc-graph-legend{display:flex;flex-direction:column;gap:3px}
      .majoor-omnicam .oc-graph-legend-title{padding:2px 4px 4px;color:var(--oc-text);font-size:11.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .oc-graph-legend .curve-mode{justify-content:flex-start;gap:8px;padding:5px 9px;border-radius:6px;background:var(--oc-sunken);border-color:var(--oc-line);color:var(--oc-text-dim);font-size:11px;text-align:left}
      .majoor-omnicam .oc-graph-legend .curve-mode.active{background:var(--oc-panel-2) !important;border-color:var(--oc-accent) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam .oc-graph-legend .ch-dot{width:10px;height:10px;border-radius:2px;flex:none}
      .majoor-omnicam .oc-graph-stage{min-width:0}
      .majoor-omnicam .oc-graph .curve-canvas{width:100%;height:var(--oc-graph-h,220px);min-height:140px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-graph-resize{margin:2px 10px 8px;cursor:ns-resize}

      /* Dope Sheet tab of the graph panel: one lane per graphed component. */
      .majoor-omnicam .oc-gdope{display:flex;flex-direction:column;gap:4px;height:var(--oc-graph-h,220px);min-height:140px;padding:9px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft);overflow-y:auto;overscroll-behavior:contain}
      .majoor-omnicam .oc-gdope-row{display:grid;grid-template-columns:104px minmax(0,1fr);align-items:center;gap:8px}
      .majoor-omnicam .oc-gdope-label{color:var(--channel-color,var(--oc-text-dim));font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .oc-gdope-track{position:relative;height:26px;border-radius:6px;background:var(--oc-panel-2);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-gdope-track::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:var(--channel-color,var(--oc-line));opacity:.4}
      .majoor-omnicam .oc-gdope-playhead{position:absolute;top:-2px;bottom:-2px;width:2px;margin-left:-1px;background:var(--oc-accent);opacity:.85;pointer-events:none}

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
        .majoor-omnicam .oc-side-body{max-height:380px}
        .majoor-omnicam .vp-hint{display:none}
      }
      @container (max-width:560px){
        .majoor-omnicam .oc-dope-body{--oc-dope-gutter:86px}
        .majoor-omnicam .oc-gdope-row{grid-template-columns:74px minmax(0,1fr)}
        .majoor-omnicam .oc-graph-body{grid-template-columns:minmax(0,1fr)}
        .majoor-omnicam .oc-graph-legend{flex-direction:row;flex-wrap:wrap}
        .majoor-omnicam .oc-transport{flex-wrap:wrap}
      }
`, K = 24, V = 5, J = 150, G = Math.PI / 180;
function Y(e, t, a) {
  return Math.min(a, Math.max(t, e));
}
function le(e, t = K) {
  const a = Y(Number(e) || 0, V, J);
  return t / (2 * Math.tan(a * G / 2));
}
function de(e, t = K) {
  const a = Math.max(1e-6, Number(e) || 0), o = 2 * Math.atan(t / (2 * a)) / G;
  return Y(o, V, J);
}
function me(e) {
  const t = le(e);
  return t >= 100 ? t.toFixed(0) : t.toFixed(1);
}
function He(e) {
  return `${(Number(e) || 0).toFixed(1)}°`;
}
const Ke = [14, 18, 24, 35, 50, 85, 135], Ve = {
  full_frame: { name: "Full Frame 35mm", width: 36, height: 24 },
  super_35: { name: "Super 35", width: 24.89, height: 18.66 },
  m43: { name: "Micro 4/3", width: 17.3, height: 13 },
  cinema_16_9: { name: "16:9 Digital Cinema", width: 23.76, height: 13.37 },
  mobile_9_16: { name: "Mobile 9:16 Vertical", width: 13.37, height: 23.76 }
}, I = /* @__PURE__ */ new WeakMap();
function pe(e) {
  let t = I.get(e);
  if (t) return t;
  t = /* @__PURE__ */ new Set(), I.set(e, t);
  const a = e.onConnectionChange;
  return e.onConnectionChange = function(o) {
    const r = a?.apply(this, arguments);
    for (const s of [...t])
      try {
        s(o);
      } catch (l) {
        console.warn("[OmniCam] graph connection watcher failed", l);
      }
    return r;
  }, t;
}
function Je(e, t) {
  const a = e?.graph;
  if (!a || typeof t != "function") return () => {
  };
  const o = pe(a);
  return o.add(t), () => o.delete(t);
}
function X(e) {
  if (!e?.root?.style?.setProperty) return;
  const t = k(
    Number(e.state.outliner_height) || x.outlinerHeight.default,
    x.outlinerHeight.min,
    x.outlinerHeight.max
  ), a = k(
    Number(e.state.preview_width) || x.previewWidth.default,
    x.previewWidth.min,
    x.previewWidth.max
  ), o = k(
    Number(e.state.side_width) || x.sideWidth.default,
    x.sideWidth.min,
    x.sideWidth.max
  ), r = k(
    Number(e.state.left_width) || x.leftWidth.default,
    x.leftWidth.min,
    x.leftWidth.max
  ), s = k(
    Number(e.state.graph_height) || x.graphHeight.default,
    x.graphHeight.min,
    x.graphHeight.max
  );
  e.root.style.setProperty("--oc-outliner-h", `${Math.round(t)}px`), e.root.style.setProperty("--oc-preview-w", `${Math.round(a)}px`), e.root.style.setProperty("--oc-side-w", `${Math.round(o)}px`), e.root.style.setProperty("--oc-left-w", `${Math.round(r)}px`), e.root.style.setProperty("--oc-graph-h", `${Math.round(s)}px`);
}
const fe = {
  "outliner-resize": { axis: "y", direction: 1, stateKey: "outliner_height", bounds: x.outlinerHeight, cssVar: "--oc-outliner-h" },
  "preview-resize": { axis: "x", direction: 1, stateKey: "preview_width", bounds: x.previewWidth, cssVar: "--oc-preview-w" },
  "side-resize": { axis: "x", direction: -1, stateKey: "side_width", bounds: x.sideWidth, cssVar: "--oc-side-w" },
  "left-resize": { axis: "x", direction: 1, stateKey: "left_width", bounds: x.leftWidth, cssVar: "--oc-left-w" },
  "graph-resize": { axis: "y", direction: 1, stateKey: "graph_height", bounds: x.graphHeight, cssVar: "--oc-graph-h" }
};
function Ge(e, t) {
  X(e);
  for (const [a, o] of Object.entries(fe)) {
    const r = e.root.querySelector(`[data-role="${a}"]`);
    if (!r) continue;
    const s = o.direction ?? 1, l = typeof globalThis.requestAnimationFrame == "function" ? (n) => globalThis.requestAnimationFrame(n) : (n) => n();
    let d = !1;
    const i = (n) => {
      e.root.style.setProperty(o.cssVar, `${Math.round(k(n, o.bounds.min, o.bounds.max))}px`), !d && (d = !0, l(() => {
        d = !1, e.refitNode?.();
      }));
    }, c = (n) => {
      const p = Math.round(k(n, o.bounds.min, o.bounds.max));
      e.state[o.stateKey] = p, i(p), o.stateKey === "preview_width" ? (e.refreshCameraPreviews?.(), e.requestRender?.("layout")) : o.stateKey === "side_width" || o.stateKey === "left_width" ? e.scheduleResizeAndRender?.() : o.stateKey === "graph_height" && (e.refreshGraph?.(), e.drawCurveEditor?.()), e.refitNode?.(), e.scheduleSerialize?.();
    }, m = (n) => o.axis === "y" ? n.clientY : n.clientX;
    let f = null;
    r.addEventListener("pointerdown", (n) => {
      n.button === 0 && (n.preventDefault(), r.setPointerCapture?.(n.pointerId), f = { pointerId: n.pointerId, origin: m(n), start: Number(e.state[o.stateKey]) || o.bounds.default });
    }, { signal: t }), r.addEventListener("pointermove", (n) => {
      !f || n.pointerId !== f.pointerId || i(f.start + (m(n) - f.origin) * s);
    }, { signal: t });
    const v = (n) => {
      !f || n.pointerId !== f.pointerId || (r.releasePointerCapture?.(n.pointerId), c(f.start + (m(n) - f.origin) * s), f = null);
    };
    r.addEventListener("pointerup", v, { signal: t }), r.addEventListener("pointercancel", v, { signal: t }), r.addEventListener("dblclick", (n) => {
      n.preventDefault(), c(o.bounds.default);
    }, { signal: t }), r.addEventListener("keydown", (n) => {
      const p = (n.shiftKey ? 48 : 16) * s, g = Number(e.state[o.stateKey]) || o.bounds.default;
      n.key === "ArrowDown" || n.key === "ArrowRight" ? (n.preventDefault(), c(g + p)) : n.key === "ArrowUp" || n.key === "ArrowLeft" ? (n.preventDefault(), c(g - p)) : n.key === "Home" && (n.preventDefault(), c(o.bounds.default));
    }, { signal: t });
  }
}
function L(e) {
  return e?.state?.cameras?.length || (e.state.cameras = [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: w(e?.camera), keyframes: e?.state?.keyframes || [] }]), e.state.cameras.find((t) => t.id === e.state.active_camera_id) || e.state.cameras[0];
}
function he(e) {
  if (!e?.state?.cameras?.length)
    return L(e);
  if (e.state.playblast_camera_id === A) {
    const t = ae(e.state, e.frame), a = t && e.state.cameras.find((o) => o.id === t.camera_id);
    if (a) return a;
  }
  return e.state.cameras.find((t) => t.id === e.state.playblast_camera_id) || L(e);
}
function ue(e) {
  const t = L(e);
  t && (t.camera = w(e.camera), t.keyframes = e.state.keyframes, e.state.camera = w(e.camera));
}
function Ye(e) {
  if (e.disposed) return;
  e.renderRevision = (e.renderRevision || 0) + 1, ue(e);
  const t = e.state.playblast_camera_id === A && oe(e.state), a = he(e);
  e.recordingWidget && (t ? e.recordingWidget.value = e.state.sequence.recording_path || "" : (!e.state.cameras.some((s) => !!s.recording_path) && !a.recording_path && e.recordingWidget.value && (a.recording_path = String(e.recordingWidget.value)), e.recordingWidget.value = a.recording_path || "")), e.state.metadata = {
    ...e.state.metadata,
    playblast_camera_id: t ? A : a.id,
    playblast_camera_name: t ? "Sequence" : a.name
  };
  const o = { ...e.state, camera: w(a.camera), keyframes: a.keyframes };
  o.metadata = { ...o.metadata, motion_scene_fingerprint_live: ne(e.state) }, e.stateWidget && (e.stateWidget.value = JSON.stringify(o)), e.widthWidget && (e.widthWidget.value = e.state.width), e.heightWidget && (e.heightWidget.value = e.state.height), e.fpsWidget && (e.fpsWidget.value = e.state.fps), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / e.state.fps), e.modeWidget && (e.modeWidget.value = e.state.render_mode), e.cardWidget && (e.cardWidget.value = e.state.card_asset || ""), e.node.graph?.setDirtyCanvas?.(!0, !0);
}
function Xe(e) {
  for (const t of [e.widthWidget, e.heightWidget, e.fpsWidget, e.durationWidget, e.modeWidget]) {
    if (!t || t.__omnicamCallback) continue;
    const a = t.callback;
    t.callback = (...o) => {
      const r = a?.apply(t, o);
      return e.syncFromWidgets(), r;
    }, t.__omnicamCallback = !0;
  }
}
function Qe(e, t = !0) {
  const a = e.state.duration_frames, o = e.state.fps;
  e.state.width = Number(e.widthWidget?.value || e.state.width), e.state.height = Number(e.heightWidget?.value || e.state.height), e.state.fps = Number(e.fpsWidget?.value || e.state.fps), e.state.duration_frames = Math.max(1, Math.round(Number(e.durationWidget?.value || 5) * e.state.fps));
  for (const n of e.state.cameras) {
    for (const p of n.keyframes) p.frame = Math.max(0, Math.round(p.frame));
    n.keyframes = [...new Map(n.keyframes.map((p) => [p.frame, p])).values()].sort((p, g) => p.frame - g.frame);
  }
  e.state.keyframes = L(e).keyframes;
  for (const n of e.state.objects)
    n.keyframes = [...new Map((n.keyframes || []).map((p) => {
      const g = Math.max(0, Math.round(p.frame));
      return [g, { ...p, frame: g }];
    })).values()].sort((p, g) => p.frame - g.frame);
  e.timelineKeyframes().some((n) => n.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.state.render_mode = e.modeWidget?.value || e.state.render_mode;
  const r = (n) => e.root.querySelector(n);
  for (const n of e.root.querySelectorAll('[data-role="mode"]')) n.value = e.state.render_mode;
  for (const n of e.root.querySelectorAll('[data-role="guides"]')) n.checked = e.state.guides !== !1;
  for (const n of e.root.querySelectorAll('[data-role="playblast-grid"]')) n.checked = !!e.state.playblast_grid;
  for (const n of e.root.querySelectorAll('[data-role="playblast-labels"]')) n.checked = !!e.state.playblast_labels;
  for (const n of e.root.querySelectorAll('[data-role="reconstruction-appearance"]')) n.value = e.state.reconstruction_appearance || "neutral";
  for (const n of e.root.querySelectorAll('[data-role="playblast-resolution"]')) n.value = e.state.playblast_resolution || "output";
  for (const n of e.root.querySelectorAll('[data-role="show-wireframe"]')) n.checked = !!e.state.show_wireframe;
  for (const n of e.root.querySelectorAll('[data-role="show-vertices"]')) n.checked = !!e.state.show_vertices;
  for (const n of e.root.querySelectorAll('[data-role="backface-culling"]')) n.checked = !!e.state.backface_culling;
  for (const n of e.root.querySelectorAll('[data-role="show-grid"]')) n.checked = e.state.show_grid !== !1;
  for (const n of e.root.querySelectorAll('[data-role="show-camera-paths"]')) n.checked = e.state.show_camera_paths !== !1;
  for (const n of e.root.querySelectorAll('[data-role="show-camera-gizmos"]')) n.checked = e.state.show_camera_gizmos !== !1;
  for (const n of e.root.querySelectorAll('[data-role="show-look-at"]')) n.checked = e.state.show_look_at !== !1;
  for (const n of e.root.querySelectorAll('[data-role="show-helper-axes"]')) n.checked = e.state.show_helper_axes !== !1;
  for (const n of e.root.querySelectorAll('[data-act="select-look-at"]')) {
    const p = e.selectedEntity === "camera_target";
    n.classList.toggle("active", p), n.setAttribute("aria-pressed", String(p));
  }
  for (const n of e.root.querySelectorAll('[data-role="select-mode"]')) n.value = e.state.select_mode || "object";
  for (const n of e.root.querySelectorAll('[data-role="burn-in"]')) n.checked = !!e.state.burn_in;
  for (const n of e.root.querySelectorAll('[data-role="speed-heatmap"]')) n.checked = !!e.state.speed_heatmap;
  for (const n of e.root.querySelectorAll('[data-role="point-density"]')) n.value = e.state.point_density || "balanced";
  for (const n of e.root.querySelectorAll('[data-role="point-color"]')) n.value = e.state.point_color || "#cbd5e1";
  for (const n of e.root.querySelectorAll('[data-role="point-spread"]')) n.value = e.state.point_spread || "all_views";
  for (const n of e.root.querySelectorAll('[data-role="card-fit"]')) n.value = e.state.card_fit || "contain";
  for (const n of e.root.querySelectorAll('[data-role="preview-layout"]')) n.value = e.state.preview_layout || "auto";
  for (const n of e.root.querySelectorAll('[data-role="safe-areas"]')) n.checked = !!e.state.safe_areas;
  for (const n of e.root.querySelectorAll('[data-role="resolution-gate"]')) n.checked = !!e.state.resolution_gate;
  for (const n of e.root.querySelectorAll('[data-role="aspect-ratio"]')) n.value = e.state.aspect_ratio || "auto";
  for (const n of e.root.querySelectorAll('[data-role="viewport-bg-color"]')) n.value = e.state.viewport_bg_color || "#121212";
  for (const n of e.root.querySelectorAll('[data-role="gizmo-space"]')) n.value = e.state.gizmo_space || "world";
  for (const n of e.root.querySelectorAll('[data-role="navigation-profile"]')) n.value = e.state.navigation_profile || "maya";
  for (const n of e.root.querySelectorAll('[data-role="spatial-snap-mode"]')) n.value = e.state.spatial_snap_mode || "none";
  for (const n of e.root.querySelectorAll('[data-role="spatial-grid-size"]')) n.value = String(e.state.spatial_grid_size || 0.5);
  const s = e.state.view_mode || "perspective";
  for (const n of e.root.querySelectorAll('[data-role="view-mode"]')) n.value = s;
  for (const n of e.root.querySelectorAll("[data-view]")) {
    const p = n.dataset.view === s;
    n.classList.toggle("active", p), n.setAttribute("aria-pressed", String(p));
  }
  for (const n of e.root.querySelectorAll('[data-role="ui-density"]')) n.value = e.state.ui_density || "animation";
  e.root.dataset.density = e.state.ui_density || "animation", X(e);
  for (const n of e.root.querySelectorAll('[data-role="camera-view-row"]')) n.hidden = !e.state.camera_view_visible;
  for (const n of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    n.classList.toggle("active", e.state.camera_view_visible);
  for (const n of e.root.querySelectorAll('[data-role="camera-type"]')) n.value = e.camera.camera_type || "perspective";
  for (const n of e.root.querySelectorAll('[data-role="camera-near"]')) n.value = String(e.camera.near ?? 0.01);
  for (const n of e.root.querySelectorAll('[data-role="camera-far"]')) n.value = String(e.camera.far ?? 1e4);
  for (const n of e.root.querySelectorAll('[data-role="speed"]')) n.value = String(e.cameraSpeed || 1);
  for (const n of e.root.querySelectorAll('[data-act="loop"]'))
    n.classList.toggle("active", !!e.state.loop_playback), n.setAttribute("aria-pressed", String(!!e.state.loop_playback));
  for (const n of e.root.querySelectorAll('[data-act="toggle-snap"]'))
    n.classList.toggle("active", e.state.snap_enabled !== !1), n.setAttribute("aria-pressed", String(e.state.snap_enabled !== !1));
  for (const n of e.root.querySelectorAll('[data-act="toggle-timecode"]'))
    n.classList.toggle("active", e.state.timecode_mode === "timecode"), n.setAttribute("aria-pressed", String(e.state.timecode_mode === "timecode"));
  for (const n of e.root.querySelectorAll('[data-role="show-radar"]')) n.checked = !!e.state.show_radar;
  for (const n of e.root.querySelectorAll('[data-role="encoder"]')) n.value = e.state.encoder || "auto";
  for (const n of e.root.querySelectorAll('[data-role="proxy-preset"]')) n.value = e.state.proxy_preset || "balanced";
  for (const n of e.root.querySelectorAll('[data-role="snap-frames"]')) n.value = String(e.state.snap_frames || 1);
  for (const n of e.root.querySelectorAll('[data-act="auto-key"]'))
    n.classList.toggle("active", !!e.state.auto_key), n.setAttribute("aria-pressed", String(!!e.state.auto_key));
  for (const n of e.root.querySelectorAll("[data-select-mode]")) {
    const p = n.dataset.selectMode === (e.state.select_mode || "object");
    n.classList.toggle("active", p), n.setAttribute("aria-pressed", String(p));
  }
  for (const n of e.root.querySelectorAll("[data-transform-mode]")) {
    const p = n.dataset.transformMode === (e.state.gizmo_mode || "translate");
    n.classList.toggle("active", p), n.setAttribute("aria-pressed", String(p));
  }
  const l = e.root.querySelector('[data-role="viewport-inspector"]'), d = l && l.dataset.collapsed !== "true";
  for (const n of e.root.querySelectorAll('[data-act="toggle-inspector"]'))
    n.classList.toggle("active", !!d), n.setAttribute("aria-pressed", String(!!d));
  e.refreshCameraSelectors();
  const i = r('[data-role="scrub"]');
  i && (i.max = String(e.state.duration_frames - 1));
  const c = r('[data-role="frame"]');
  c && (c.max = String(e.state.duration_frames - 1));
  const m = r('[data-role="key-frame"]');
  m && (m.max = String(e.state.duration_frames - 1));
  const f = r('[data-role="duration-seconds"]');
  f && (f.value = String(e.state.duration_frames / e.state.fps));
  const v = r('[data-role="timeline-fps"]');
  v && (v.value = String(e.state.fps)), e.frame = k(e.frame, 0, e.state.duration_frames - 1), t && e.serialize(), (a !== e.state.duration_frames || o !== e.state.fps) && (e.computeAudioPeaks?.(), e.setFrame(e.frame, !1, !0), e.setStatus(`Timeline: ${e.state.duration_frames} frames · ${(e.state.duration_frames / e.state.fps).toFixed(2)} s`));
}
function Ze(e) {
  let t = null;
  try {
    t = JSON.parse(e.stateWidget?.value || "{}");
  } catch {
  }
  const a = new Set(e.state.objects.map((r) => r.id));
  e.state = O(t);
  const o = new Set(e.state.objects.map((r) => r.id));
  for (const r of a) o.has(r) || e.removeObjectResources(r);
  e.timelineKeyframes().some((r) => r.frame === e.selectedKeyFrame) || (e.selectedKeyFrame = e.timelineKeyframes()[0]?.frame ?? null), e.camera = N(e.state, Math.min(e.frame, e.state.duration_frames - 1)), e.syncFromWidgets(!1), e.root.querySelector('[data-role="gizmo-space"]').value = e.state.gizmo_space, e.restoreAssets(), e.refreshKeys(), e.refreshObjects(), e.render(), e.history?.clear(), e.sceneBaseline = e.stateWidget?.value ?? e.sceneBaseline, e.sceneName = e.state.metadata?.scene_name || "";
}
const ge = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "9:16": 9 / 16, "2.39:1": 2.39 };
function be(e) {
  if (!e) return null;
  const t = ge[e.aspect_ratio];
  if (t) return t;
  if (!e.resolution_gate) return null;
  const a = Number(e.width) || 0, o = Number(e.height) || 0;
  return a > 0 && o > 0 ? a / o : null;
}
function ve(e, t, a, o) {
  const r = be(t);
  if (!r || !(a > 0) || !(o > 0)) return;
  const s = a / o;
  if (Math.abs(s - r) < 1e-3) return;
  const l = !!t.resolution_gate;
  if (e.save(), e.fillStyle = "#000000b3", s > r) {
    const d = o * r, i = (a - d) / 2;
    e.fillRect(0, 0, i, o), e.fillRect(a - i, 0, i, o), l && (e.strokeStyle = "#ffffff88", e.strokeRect(i, 0, d, o));
  } else {
    const d = a / r, i = (o - d) / 2;
    e.fillRect(0, 0, a, i), e.fillRect(0, o - i, a, i), l && (e.strokeStyle = "#ffffff88", e.strokeRect(0, i, a, d));
  }
  e.restore();
}
const S = [
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
function T(e) {
  const t = `camera_${Date.now().toString(36)}`;
  let a = t, o = 2;
  for (; e.cameras.some((r) => r.id === a); ) a = `${t}_${o++}`;
  return a;
}
function xe(e, t) {
  if (!e.cameras.some((o) => o.name === t)) return t;
  let a = 2;
  for (; e.cameras.some((o) => o.name === `${t} ${a}`); ) a += 1;
  return `${t} ${a}`;
}
function ye(e, t, { label: a = "Extracted Camera" } = {}) {
  const o = Array.isArray(t?.keyframes) ? t.keyframes : [];
  if (!o.length) throw new Error(b("no camera keys in this solve"));
  const r = Number(e.state.fps) || 24, s = Number(t.fps) || r, l = s > 0 ? r / s : 1, d = T(e.state), i = e.state.cameras.length, c = xe(e.state, a || "Extracted Camera"), m = S[i % S.length], f = o.map((v) => ({
    ...v,
    frame: Math.round((Number(v.frame) || 0) * l),
    camera: w(v.camera)
  }));
  if (e.state.cameras.push({ id: d, name: c, color: m, camera: w(f[0].camera), keyframes: f }), Number.isFinite(Number(t.duration_frames))) {
    const v = Math.round(Number(t.duration_frames) * l);
    e.state.duration_frames = Math.max(e.state.duration_frames || 1, v);
  }
  return t?.metadata?.solve_health_v1 && (e.state.metadata = { ...e.state.metadata, solve_health_v1: t.metadata.solve_health_v1 }), e.cameraPreviewSignature = "", e.activateCamera(d), d;
}
function Ue(e) {
  const t = $(e.state);
  for (const a of e.root.querySelectorAll('[data-role="playblast-camera"]')) {
    a.innerHTML = "";
    for (const r of e.state.cameras) {
      const s = document.createElement("option");
      s.value = r.id, s.textContent = r.name, a.appendChild(s);
    }
    const o = document.createElement("option");
    o.value = A, o.textContent = t.length ? b("Sequence ({count} shots)").replace("{count}", String(t.length)) : b("Sequence (no shots yet)"), o.disabled = t.length === 0, a.appendChild(o), a.value = e.state.playblast_camera_id;
  }
  for (const a of e.root.querySelectorAll('[data-role="active-camera-select"]')) {
    a.innerHTML = "";
    for (const o of e.state.cameras) {
      const r = document.createElement("option");
      r.value = o.id, r.textContent = o.name, a.appendChild(r);
    }
    a.value = e.state.active_camera_id;
  }
  Q(e);
}
function we(e) {
  const t = e.state.cameras, a = t.filter((r) => r.solo), o = a.length ? a : t.filter((r) => !r.muted);
  return o.length ? o : t;
}
function Q(e) {
  const t = e.root.querySelector('[data-role="camera-previews"]');
  if (!t) return;
  const a = e.state.preview_layout || "auto";
  t.dataset.layout !== (a === "auto" ? "" : a) && (t.dataset.layout = a === "auto" ? "" : a);
  const o = `${Math.max(1, e.state.width || 16)} / ${Math.max(1, e.state.height || 9)}`, r = t.style.getPropertyValue("--shot-aspect") !== o;
  r && t.style.setProperty("--shot-aspect", o);
  const s = e.root.querySelector('[data-role="camera-view-row"]');
  s && s.classList.toggle("maximized", !!e.state.maximized_camera_id);
  const l = we(e), d = l.map((c) => `${c.id}:${c.name}:${c.muted ? 1 : 0}:${c.solo ? 1 : 0}:${c.color || ""}`).join("|");
  let i = !1;
  d !== e.cameraPreviewSignature && (i = !0, e.cameraPreviewSignature = d, t.innerHTML = "", e.cameraPreviewCanvases.clear(), e.cameraPreviewContexts.clear(), l.forEach((c, m) => {
    const f = document.createElement("div");
    f.className = "camera-preview-tile", f.dataset.cameraId = c.id;
    const v = c.color || S[m % S.length];
    f.style.setProperty("--camera-color", v), f.title = b(`Click: set ${c.name} as primary · Double-click: edit · Right-click: preview actions`);
    const n = document.createElement("div");
    n.className = "camera-preview-head";
    const p = document.createElement("i");
    p.className = "pi pi-video";
    const g = document.createElement("span");
    g.textContent = c.name;
    const h = document.createElement("span");
    h.dataset.cameraFrame = c.id, h.textContent = `F${e.frame}`;
    const y = document.createElement("i");
    y.className = "pi pi-circle-fill output-mark", y.title = b("Playblast camera");
    const u = document.createElement("canvas");
    u.dataset.cameraPreview = c.id;
    const j = document.createElement("span");
    j.className = "camera-view-badge", j.textContent = b("CAMERA PREVIEW"), n.append(p, g, h, y), f.append(u, n, j), t.appendChild(f), f.addEventListener("click", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = setTimeout(() => e.setPlayblastCamera(c.id), 220);
    }), f.addEventListener("dblclick", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = null, e.activateCamera(c.id);
    }), f.addEventListener("auxclick", (C) => {
      C.button === 1 && (C.preventDefault(), ke(e, c.id));
    }), e.cameraPreviewCanvases.set(c.id, u), e.cameraPreviewContexts.set(c.id, u.getContext("2d", { alpha: !1 }));
  }));
  for (const c of t.querySelectorAll(".camera-preview-tile"))
    c.classList.toggle("playblast", c.dataset.cameraId === e.state.playblast_camera_id), c.classList.toggle("active", c.dataset.cameraId === e.state.active_camera_id), c.classList.toggle("maximized", c.dataset.cameraId === e.state.maximized_camera_id);
  for (const c of t.querySelectorAll(".output-mark")) c.hidden = c.closest(".camera-preview-tile")?.dataset.cameraId !== e.state.playblast_camera_id;
  (i || r) && requestAnimationFrame(() => {
    e.root.isConnected && (e.resizeCanvas(), e.renderCameraView());
  });
}
function et(e) {
  e.checkpoint("Add camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const t = T(e.state), a = e.state.cameras.length, o = `Camera ${a + 1}`, r = w(e.camera), s = [
    (r.target?.[0] ?? 0) - (r.position?.[0] ?? 0),
    (r.target?.[1] ?? 0) - (r.position?.[1] ?? 0),
    (r.target?.[2] ?? -1) - (r.position?.[2] ?? 0)
  ], l = Math.hypot(...s) || 1;
  r.position = [0, 0, 0], r.target = s.map((c) => c / l);
  const d = S[a % S.length], i = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease";
  e.state.cameras.push({
    id: t,
    name: o,
    color: d,
    camera: r,
    keyframes: [{ frame: 0, camera: w(r), interpolation: i }]
  }), e.cameraPreviewSignature = "", e.activateCamera(t), e.setStatus(b(`${o} added`));
}
async function tt(e, t) {
  const a = e.state.cameras.find((r) => r.id === t);
  if (!a) return;
  const o = (await ie(e.app, b("Rename camera"), b("Camera name"), a.name))?.trim();
  !o || o === a.name || (e.checkpoint("Rename camera"), a.name = o.slice(0, 80), e.cameraPreviewSignature = "", e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(b(`Camera renamed: ${a.name}`)));
}
function at(e, t) {
  const a = e.state.cameras.find((s) => s.id === t);
  if (!a) return;
  e.checkpoint("Duplicate camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const o = JSON.parse(JSON.stringify(a));
  o.id = T(e.state), o.name = `${a.name} Copy`;
  const r = e.state.cameras.length;
  if (o.color = S[r % S.length], o.camera?.position && (o.camera.position = [
    Math.round((o.camera.position[0] + 0.8) * 100) / 100,
    o.camera.position[1],
    Math.round((o.camera.position[2] + 0.8) * 100) / 100
  ]), o.keyframes)
    for (const s of o.keyframes)
      s.camera?.position && (s.camera.position = [
        Math.round((s.camera.position[0] + 0.8) * 100) / 100,
        s.camera.position[1],
        Math.round((s.camera.position[2] + 0.8) * 100) / 100
      ]);
  e.state.cameras.push(o), e.cameraPreviewSignature = "", e.activateCamera(o.id), e.setStatus(b(`${o.name} added`));
}
async function ot(e, t) {
  if (e.state.cameras.length <= 1) return e.setStatus(b("At least one camera is required"));
  const a = e.state.cameras.find((r) => r.id === t);
  if (!a || !await ce(e.app, b("Delete camera"), b(`Delete ${a.name} and its ${a.keyframes.length} keyframe(s)?`))) return;
  e.checkpoint("Delete camera"), e.finishCameraEdit();
  const o = t === e.state.active_camera_id;
  if (e.state.cameras = e.state.cameras.filter((r) => r.id !== t), t === e.state.playblast_camera_id && (e.state.playblast_camera_id = e.state.cameras[0].id), e.cameraPreviewSignature = "", o) {
    const r = e.state.cameras[0];
    e.state.active_camera_id = r.id, e.state.keyframes = r.keyframes, e.state.camera = w(r.camera), e.camera = N(r, e.frame, e.state.objects), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = r.keyframes.find((s) => s.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null;
  }
  e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(b(`${a.name} deleted`));
}
function rt(e, t) {
  const a = e.state.cameras.find((o) => o.id === t);
  a && (e.finishCameraEdit(), e.syncActiveCameraTrack(), e.state.active_camera_id = a.id, e.state.keyframes = a.keyframes, e.state.camera = w(a.camera), e.camera = N(a, e.frame, e.state.objects), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = a.keyframes.find((o) => o.frame === e.frame)?.frame ?? null, e.editingKeyFrame = null, e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(b(`Camera: ${a.name}`)));
}
function nt(e, t) {
  const a = $(e.state), o = t === A && a.length > 0, r = o ? null : e.state.cameras.find((s) => s.id === t);
  !o && !r || (e.state.playblast_camera_id = o ? A : r.id, e.refreshCameraSelectors(), e.serialize(), e.refreshObjects(), e.renderCameraView(), e.setStatus(o ? b("Playblast: sequence ({count} shots)").replace("{count}", String(a.length)) : b(`Playblast: ${r.name}`)));
}
function st(e) {
  e.state.camera_view_visible = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-role="camera-view-row"]')) t.hidden = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    t.classList.toggle("active", e.state.camera_view_visible), t.setAttribute("aria-pressed", String(e.state.camera_view_visible));
  e.serialize(), e.state.camera_view_visible && requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(b(`Camera previews ${e.state.camera_view_visible ? "shown" : "hidden"}`));
}
function ke(e, t) {
  e.state.maximized_camera_id = e.state.maximized_camera_id === t ? null : t, e.serialize(), Q(e), requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(e.state.maximized_camera_id ? b("Preview maximized") : b("Preview restored"));
}
function it(e, t, a, o) {
  if (e.state.guides !== !1) {
    t.save(), t.strokeStyle = "#ffffff55", t.lineWidth = Math.max(1, a / 640), t.beginPath();
    for (const r of [a / 3, 2 * a / 3])
      t.moveTo(r, 0), t.lineTo(r, o);
    for (const r of [o / 3, 2 * o / 3])
      t.moveTo(0, r), t.lineTo(a, r);
    t.stroke(), t.restore();
  }
  if (e.state.safe_areas) {
    t.save(), t.strokeStyle = "#f2d06b99", t.lineWidth = 1;
    for (const r of [0.05, 0.1])
      t.strokeRect(a * r, o * r, a * (1 - 2 * r), o * (1 - 2 * r));
    t.restore();
  }
  ve(t, e.state, a, o);
}
function ct(e, t) {
  const a = de(t);
  e.checkpoint(`Lens: ${t}mm`), e.beginCameraEdit(), e.camera.fov = a, e.commitCameraEdit(), e.finishCameraEdit();
  for (const o of e.root.querySelectorAll('[data-role="camera-fov"]')) o.value = String(a.toFixed(1));
  for (const o of e.root.querySelectorAll('[data-role="camera-focal"]')) o.value = me(a);
  e.setStatus(`Lens: ${t}mm (FOV ${a.toFixed(1)}°)`);
}
const W = "upstream_camera_track";
function lt(e, t, {
  label: a = "Import camera",
  source: o = "camera_import",
  fingerprint: r = "",
  originNodeId: s = null,
  adoptFps: l = !0,
  checkpoint: d = !0,
  status: i = !0
} = {}) {
  const c = t?.keyframes;
  if (!Array.isArray(c) || !c.length)
    throw new Error(b("no camera keys in this file"));
  d && e.checkpoint(a);
  const m = L(e);
  return m.keyframes = c, e.state.keyframes = c, l && Number.isFinite(Number(t.fps)) && (e.state.fps = Math.max(1, Math.round(Number(t.fps))), e.fpsWidget && (e.fpsWidget.value = e.state.fps)), Number.isFinite(Number(t.duration_frames)) && (e.state.duration_frames = Math.max(1, Math.round(Number(t.duration_frames)))), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / Math.max(1, e.state.fps)), r && (e.state.metadata = {
    ...e.state.metadata,
    [W]: {
      fingerprint: r,
      source: o,
      ...s == null ? {} : { origin_node_id: String(s) }
    }
  }), e.syncActiveCameraTrack(), e.setFrame(0), e.refreshKeys(), e.render(), e.scheduleSerialize(), i && e.setStatus(b("Imported {count} camera keys from {name}").replace("{count}", String(c.length)).replace("{name}", a)), c.length;
}
const _e = "omnicam_extractor_result_v2", M = "omnicam_extracted_motion_scene_json", z = "omnicam_extracted_track_fingerprint", Z = "omnicam_extractor_source";
function U(e) {
  if (!e || e.version !== 1 || !Array.isArray(e.cameras)) return null;
  const t = String(e.playblast_camera_id || e.active_camera_id || ""), o = e.cameras.find((r) => String(r?.id || "") === t)?.track;
  return o && Array.isArray(o.keyframes) && o.keyframes.length ? o : null;
}
function dt(e) {
  if (!e || !Array.isArray(e.keyframes) || !e.keyframes.length) return null;
  const t = Number(e.fps), a = Number(e.duration_frames);
  if (!(t > 0) || !(a > 0)) return null;
  const o = String(e.metadata?.extractor_fingerprint || "");
  return {
    version: 1,
    timeline: { duration_seconds: a / t, authoring_fps: t },
    canvas: { width: Number(e.width), height: Number(e.height) },
    cameras: [{ id: "extracted_camera", label: "Extracted Camera", enabled: !0, track: e }],
    active_camera_id: "extracted_camera",
    playblast_camera_id: "extracted_camera",
    objects: Array.isArray(e.objects) ? e.objects : [],
    motion_layers: [],
    cuts: [],
    metadata: { ...e.metadata || {}, source: "omnicam_extractor", extractor_fingerprint: o }
  };
}
function mt(e) {
  const t = e?.text, a = Array.isArray(t) ? t[0] : t;
  if (typeof a != "string" || !a) return null;
  let o;
  try {
    o = JSON.parse(a);
  } catch {
    return null;
  }
  if (!o || o.kind !== _e) return null;
  const r = o.mode === "scene_reconstruct" ? "scene_reconstruct" : "camera_track", s = o.motion_scene, l = {
    mode: r,
    motionScene: s,
    fingerprint: String(o.fingerprint || ""),
    solver_coverage: Number(o.solver_coverage) || 0,
    report: String(o.report || "")
  };
  if (r === "scene_reconstruct")
    return s ? {
      ...l,
      reconstruction: o.reconstruction || {},
      // The reconstruct source annotation is an object; keep it whole.
      source: o.source ?? ""
    } : null;
  const d = U(s);
  return d ? {
    ...l,
    track: d,
    source: String(o.source || ""),
    // The immutable raw solve, for live post-solve refinement without a
    // re-TRACK (POST /majoor/omnicam/extractor/refine). Held in session only.
    rawSolve: o.raw_solve && typeof o.raw_solve == "object" ? o.raw_solve : null
  } : null;
}
function Se(e) {
  return e.computeSize = () => [0, -4], e.draw = () => {
  }, e.hidden = !0, e.options = { ...e.options || {}, hideInVueNodes: !0 }, e;
}
function q(e, t) {
  return e.widgets?.find((a) => a.name === t) || null;
}
function je(e) {
  const t = [];
  for (const a of [M, z]) {
    let o = q(e, a);
    if (!o) {
      if (o = e.addWidget?.("text", a, "", () => {
      }, { serialize: !0 }), !o) continue;
      Se(o);
    }
    t.push(o);
  }
  return t;
}
function pt(e) {
  const t = e?.widgets_values, a = e?.widgets;
  if (!Array.isArray(t) || !Array.isArray(a)) return 0;
  let o = 0;
  for (const r of [M, z, Z]) {
    const s = a.findIndex((d) => d?.name === r);
    if (s < 0 || s >= t.length) continue;
    const l = t[s];
    typeof l != "string" || !l || a[s].value || (a[s].value = l, o += 1);
  }
  return o;
}
function ft(e, t) {
  je(e);
  const a = q(e, M), o = q(e, z), r = String(o?.value || "") !== t.fingerprint;
  return a && (a.value = JSON.stringify(t.motionScene)), o && (o.value = t.fingerprint), r;
}
function ht(e, t) {
  const a = q(e, Z);
  if (!a || !t) return !1;
  const o = String(t), r = String(a.value || "") !== o;
  return a.value = o, r;
}
function Ce(e) {
  const t = String(q(e, z)?.value || ""), a = String(q(e, M)?.value || "");
  if (!t || !a) return null;
  let o;
  try {
    o = JSON.parse(a);
  } catch {
    return null;
  }
  const r = U(o);
  return r ? { motionScene: o, track: r, fingerprint: t } : null;
}
function ut(e) {
  const t = e?.track?.metadata || {}, a = String(t.backend || "solver").toUpperCase(), o = Number(e?.track?.duration_frames) || 0, r = Array.isArray(e?.track?.keyframes) ? e.track.keyframes.length : 0, s = Math.round((Number(e?.solver_coverage ?? e?.confidence) || 0) * 100);
  return `${a} · ${o} f · ${r} keys · Solver Coverage ${s}%`;
}
function gt(e) {
  const t = e?.reconstruction;
  if (!t) return [];
  const a = t.axis_confidence || {};
  return [
    ["Role", String(t.role || "")],
    ["Semantic", String(t.semantic || "")],
    ["Confidence", Number(t.confidence ?? 0).toFixed(2)],
    ["Width", Number(a.width ?? 0).toFixed(2)],
    ["Height", Number(a.height ?? 0).toFixed(2)],
    ["Depth", Number(a.depth ?? 0).toFixed(2)],
    ["Yaw", Number(a.yaw ?? 0).toFixed(2)],
    ["Completion", String(t.completion_provider || "none")]
  ];
}
function Ee(e, t) {
  const a = e?.reconstruction?.role || "";
  return a === "blockout_object" ? { locked: !1, visible: !0 } : a === "asset_proxy" ? { locked: !1, visible: !0 } : a === "room" || a === "reference" ? { locked: !0, visible: !(a === "reference" && String(t) === "blockout") } : { locked: !0, visible: !0 };
}
function Ae(e) {
  return e?.reconstruction?.recon_mode || e?.motion_scene?.metadata?.reconstruction?.mode || e?.metadata?.reconstruction?.mode || "";
}
function F(e, t) {
  const a = e?.reconstruction?.role;
  if (!a) return e;
  const o = Ee(e, t);
  return (e.locked === void 0 || a === "room" || a === "reference") && (e.locked = o.locked), a === "reference" && (e.enabled = o.visible), e;
}
function ee(e) {
  return (e?.cameras || []).map((t, a) => {
    const o = (t?.track?.keyframes || t?.keyframes || []).map((s) => ({
      frame: Math.max(0, Math.round(Number(s?.frame || 0))),
      camera: s?.camera || s,
      interpolation: s?.interpolation || "hold"
    })), r = o[0]?.camera || t?.camera || null;
    return {
      id: String(t?.id || `camera_${a + 1}`),
      name: String(t?.label || t?.name || "Source Camera"),
      enabled: t?.enabled !== !1,
      locked: !!t?.locked,
      color: t?.color,
      camera: r,
      keyframes: o.length ? o : r ? [{ frame: 0, camera: r, interpolation: "hold" }] : []
    };
  });
}
function qe(e) {
  const t = e?.canvas || {}, a = e?.timeline || {}, o = Math.max(1, Math.round(Number(a.authoring_fps || e?.fps || 24))), r = Number(a.duration_seconds || 0);
  return {
    ...e,
    width: Number(t.width || e?.width || 1280),
    height: Number(t.height || e?.height || 720),
    fps: o,
    duration_frames: r > 0 ? Math.max(1, Math.round(r * o)) : Number(e?.duration_frames || o * 5),
    cameras: ee(e)
  };
}
function D(e, t) {
  if (!e || !e.has(t)) return t;
  let a = 2;
  for (; e.has(`${t}_${a}`); )
    a += 1;
  return `${t}_${a}`;
}
function Le(e) {
  const t = e?.state;
  if (!t) return !0;
  if ((t.objects || []).length > 0) return !1;
  const o = t.cameras || [];
  return o.length <= 1 ? (o[0]?.keyframes || []).length <= 1 : !1;
}
function Ne(e, t, a = {}) {
  const o = t?.motion_scene || t;
  if (!o || !Array.isArray(o.objects))
    throw new Error("Reconstruction result has no objects array");
  const r = a.mode || (Le(e) ? "replace" : "merge"), s = a.reconMode || Ae(t);
  if (r === "replace") {
    e.checkpoint?.("Adopt reconstructed scene (replace)"), e.state = O(
      qe(JSON.parse(JSON.stringify(o)))
    ), e.camera = N(e.state, e.frame || 0);
    for (const l of e.state.objects || [])
      F(l, s), (l.type === "glb" || l.type === "model") && l.asset && e.modelUrlsById?.set(l.id, R(l.asset));
  } else {
    e.checkpoint?.("Merge reconstructed environment");
    const l = new Set((e.state.objects || []).map((m) => m.id)), d = new Set((e.state.cameras || []).map((m) => m.id)), i = /* @__PURE__ */ new Map(), c = o.objects.map((m) => JSON.parse(JSON.stringify(m)));
    for (const m of c) {
      const f = D(l, m.id);
      l.add(f), i.set(m.id, f), m.id = f;
    }
    for (const m of c)
      m.parent_id && i.has(m.parent_id) && (m.parent_id = i.get(m.parent_id)), F(m, s), e.state.objects.push(m), (m.type === "glb" || m.type === "model") && m.asset && e.modelUrlsById?.set(m.id, R(m.asset));
    for (const m of ee(o)) {
      const f = D(d, m.id);
      d.add(f), m.id = f, m.enabled = !1, e.state.cameras.push(m);
    }
  }
  e.serialize?.(), e.refreshObjects?.(), e.render?.(), e.setStatus?.("Adopted reconstructed scene into Director");
}
const Me = "solved_scene";
function ze(e) {
  return String(e?.comfyClass || e?.type || e?.constructor?.type || "");
}
function Te(e) {
  const t = e?.node, a = t?.graph;
  if (!a) return null;
  for (const o of t.inputs || []) {
    if (String(o?.name || "").toLowerCase() !== Me || o.link == null) continue;
    const r = se(a, o.link);
    if (r && ze(r) === re) return r;
  }
  return null;
}
function We(e) {
  return String(e?.state?.metadata?.[W]?.fingerprint || "");
}
function Pe(e, t, a) {
  e.state.metadata = {
    ...e.state.metadata,
    [W]: {
      fingerprint: t,
      source: "omnicam_extractor",
      origin_node_id: String(a.id)
    }
  };
}
function P(e) {
  const t = e.root?.querySelector('[data-role="extractor-import-banner"]');
  if (!t) return;
  const a = e.pendingExtractorImport;
  if (t.hidden = !a, !a) return;
  const o = t.querySelector('[data-role="extractor-import-text"]');
  o && (o.textContent = b("{count} camera keys ready from {name} — import as a new camera?").replace("{count}", String(a.keyCount)).replace("{name}", a.label));
}
function bt(e) {
  const t = Te(e), a = t ? Ce(t) : null;
  let o = !1;
  return a ? a.fingerprint !== We(e) && e.pendingExtractorImport?.fingerprint !== a.fingerprint && (e.pendingExtractorImport = {
    track: a.track,
    fingerprint: a.fingerprint,
    originNodeId: t.id,
    label: String(t.title || b("OmniCam Extractor")),
    keyCount: a.track.keyframes?.length || 0
  }, Pe(e, a.fingerprint, t), o = !0) : e.pendingExtractorImport && (e.pendingExtractorImport = null, o = !0), P(e), o;
}
function vt(e) {
  const t = e.pendingExtractorImport;
  return t ? (e.checkpoint("Import extracted camera"), ye(e, t.track, { label: t.label }), e.pendingExtractorImport = null, P(e), e.setStatus?.(b("Imported {count} camera keys from {name}").replace("{count}", String(t.keyCount)).replace("{name}", t.label)), e.scheduleSerialize(), e.render(), !0) : !1;
}
function xt(e) {
  return e.pendingExtractorImport ? (e.pendingExtractorImport = null, P(e), e.render(), e.setStatus?.(b("Extracted camera preview dismissed")), !0) : !1;
}
function yt(e) {
  const t = e?.graph;
  if (!t) return 0;
  const a = e.outputs || [], o = /* @__PURE__ */ new Set();
  let r = 0;
  for (const s of a)
    for (const l of s?.links || []) {
      const d = B(t, l), i = d?.target_id ?? d?.targetId;
      if (!d || i == null || o.has(i)) continue;
      o.add(i);
      const m = t.getNodeById?.(i)?.__majoorOmniCam;
      m?.syncUpstreamInputs && (m.syncUpstreamInputs(), r += 1);
    }
  return r;
}
function wt(e, t) {
  const a = e?.graph;
  if (!a) return 0;
  const o = e.outputs || [], r = /* @__PURE__ */ new Set();
  let s = 0;
  for (const l of o)
    for (const d of l?.links || []) {
      const i = B(a, d), c = i?.target_id ?? i?.targetId;
      if (!i || c == null || r.has(c)) continue;
      r.add(c);
      const f = a.getNodeById?.(c)?.__majoorOmniCam;
      f && (Ne(f, t), s += 1);
    }
  return s;
}
export {
  lt as $,
  rt as A,
  et as B,
  S as C,
  ot as D,
  it as E,
  at as F,
  ke as G,
  Q as H,
  Ue as I,
  tt as J,
  nt as K,
  Be as L,
  st as M,
  M as N,
  z as O,
  Z as P,
  dt as Q,
  ft as R,
  Ve as S,
  yt as T,
  je as U,
  pt as V,
  wt as W,
  ht as X,
  ut as Y,
  Ce as Z,
  mt as _,
  Ke as a,
  He as b,
  de as c,
  vt as d,
  xt as e,
  me as f,
  ct as g,
  ce as h,
  Ge as i,
  ve as j,
  he as k,
  Oe as l,
  L as m,
  T as n,
  $e as o,
  ie as p,
  ue as q,
  gt as r,
  bt as s,
  De as t,
  Fe as u,
  Xe as v,
  Je as w,
  Ze as x,
  Ye as y,
  Qe as z
};
