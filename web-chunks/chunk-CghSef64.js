import { u as f, c as C, a as M, bk as q, K as O, S as L, s as Z, bb as I, bM as U } from "./chunk-Cgt_u7Uc.js";
import { a as ee } from "./chunk-BvpYpyx-.js";
import { g as D, l as te } from "./chunk-CUiAG3lm.js";
function Me(e, t) {
  const o = { "add-camera": "Create a new animated camera from the current view", record: "Record the primary camera preview as a proxy playblast", "h3-setup": "Create and connect the H3 camera-motion reference nodes", "load-card": "Replace the subject card with an image or video", "add-card": "Create another image or video card", "load-model": "Import a local GLB, OBJ, FBX, STL, or PLY scene", "reset-camera": "Reset the active camera transform and lens", play: "Play or stop the timeline (Space)", key: "Insert or replace a key at the playhead (I)", "auto-key": "Record camera or object edits at the playhead", "delete-key": "Delete the selected keyframe (Delete)", "copy-key": "Copy the selected keyframe (Ctrl/Cmd+C)", "paste-key": "Paste a keyframe at the playhead (Ctrl/Cmd+V)", "previous-key": "Jump to the previous keyframe (,)", "next-key": "Jump to the next keyframe (.)", "previous-frame": "Move one frame backward (Left Arrow)", "next-frame": "Move one frame forward (Right Arrow)", "toggle-camera-view": "Show or hide the camera preview strip", "update-key": "Store the current camera view in the selected key", "view-key": "Load the selected key's camera view" };
  for (const a of e.querySelectorAll("button,select,input,summary")) {
    if (a.title) continue;
    const r = a.getAttribute("aria-label") || o[a.dataset?.act] || a.closest("label")?.querySelector("span")?.textContent?.trim() || a.closest("label")?.childNodes?.[0]?.textContent?.trim() || a.textContent?.trim();
    r && (a.title = r);
  }
  t.title = "Viewport: drag to orbit, Shift+drag to pan, wheel to dolly, WASD/QE to fly. Right-click for scene actions.", e.querySelector('[data-role="keys"]').title = "Timeline: click or drag to scrub. Drag a key to retime it. Right-click for key actions.";
}
class Te {
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
        const i = document.createElement("div");
        i.className = "context-menu-separator", t.appendChild(i);
        continue;
      }
      const n = document.createElement("button");
      if (n.type = "button", n.setAttribute("role", "menuitem"), n.disabled = !!r.disabled, n.classList.toggle("danger", !!r.danger), n.title = r.help || r.label, r.checked !== void 0) {
        const i = document.createElement("i");
        i.className = `pi ${r.checked ? "pi-check" : ""} oc-menu-check`, i.style.width = "14px", i.style.fontSize = "10px", i.style.color = r.checked ? "var(--oc-accent, #38bdf8)" : "transparent", n.appendChild(i);
      }
      if (r.icon) {
        const i = document.createElement("i");
        i.className = `pi ${r.icon}`, n.appendChild(i);
      } else if (r.iconSvg) {
        const i = document.createElement("span");
        i.className = "oc-menu-icon-svg", i.innerHTML = r.iconSvg, n.appendChild(i);
      }
      const c = document.createElement("span");
      c.className = "oc-menu-label", c.textContent = r.label, n.appendChild(c);
      const m = r.items || r.submenu;
      if (Array.isArray(m) && m.length) {
        n.classList.add("oc-has-submenu");
        const i = document.createElement("i");
        i.className = "pi pi-chevron-right oc-submenu-chevron", i.style.marginLeft = "auto", i.style.fontSize = "9px", i.style.opacity = "0.7", n.appendChild(i);
        const s = document.createElement("div");
        s.className = "context-menu context-submenu majoor-omnicam", s.hidden = !0, document.body.appendChild(s), this.submenus.push(s), this.renderActions(s, m, null);
        let l = null, d = null;
        const x = () => {
          clearTimeout(d), s.parentElement !== document.body && document.body.appendChild(s), s.hidden = !1, n.classList.add("active");
          const g = n.getBoundingClientRect(), b = s.getBoundingClientRect(), p = 8;
          let v = g.right + 2;
          v + b.width > window.innerWidth - p && (v = Math.max(p, g.left - b.width - 2));
          let u = g.top - 4;
          u + b.height > window.innerHeight - p && (u = Math.max(p, window.innerHeight - b.height - p)), s.style.left = `${v}px`, s.style.top = `${u}px`;
        }, h = () => {
          clearTimeout(l), d = setTimeout(() => {
            s.hidden = !0, n.classList.remove("active");
          }, 160);
        };
        n.addEventListener("pointerenter", () => {
          clearTimeout(d), l = setTimeout(x, 60);
        }), n.addEventListener("pointerleave", h), s.addEventListener("pointerenter", () => clearTimeout(d)), s.addEventListener("pointerleave", h), s.addEventListener("keydown", (g) => this.onKey(g)), n._submenuEl = s, n.addEventListener("click", (g) => {
          g.preventDefault(), g.stopPropagation(), s.hidden ? x() : h();
        });
      } else {
        if (r.shortcut) {
          const i = document.createElement("kbd");
          i.className = "shortcut", i.textContent = r.shortcut, n.appendChild(i);
        }
        n.addEventListener("click", (i) => {
          i.preventDefault(), i.stopPropagation(), this.hide();
          try {
            r.run?.();
          } catch (s) {
            console.error("Context menu action failed:", s);
          }
        });
      }
      n.addEventListener("pointerdown", (i) => i.stopPropagation()), n.addEventListener("mousedown", (i) => i.stopPropagation()), t.appendChild(n);
    }
  }
  show(t, o, a) {
    if (!this.menu || this.disposed) return;
    this.dismissTimer !== null && (clearTimeout(this.dismissTimer), this.dismissTimer = null), t.preventDefault(), t.stopPropagation(), t.stopImmediatePropagation?.(), this.returnFocus = document.activeElement, this.menu.parentElement !== document.body && document.body.appendChild(this.menu), this.menu.classList.add("majoor-omnicam");
    for (const i of this.submenus) i.remove();
    this.submenus = [], this.renderActions(this.menu, a, o), this.menu.hidden = !1;
    const r = 8, n = this.menu.getBoundingClientRect(), c = Math.max(r, Math.min(t.clientX, window.innerWidth - n.width - r)), m = Math.max(r, Math.min(t.clientY, window.innerHeight - n.height - r));
    this.menu.style.left = `${c}px`, this.menu.style.top = `${m}px`, this.menu.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 }), this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0)), this.dismissHandler = (i) => {
      i.target && (this.menu.contains(i.target) || this.submenus.some((s) => s.contains(i.target))) || this.hide();
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
function Re(e) {
  const t = w.get(e);
  if (t) {
    for (const o of [...t]) o();
    w.delete(e);
  }
}
function $({ title: e, message: t, withInput: o = !1, defaultValue: a = "", owner: r = null }) {
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
    const i = document.createElement("h3");
    i.textContent = e || "", Object.assign(i.style, { margin: "0 0 8px", fontSize: "14px" });
    const s = document.createElement("p");
    s.textContent = t || "", Object.assign(s.style, { margin: "0 0 14px", opacity: "0.85" });
    let l = null;
    o && (l = document.createElement("input"), l.type = "text", l.value = a == null ? "" : String(a), Object.assign(l.style, {
      width: "100%",
      boxSizing: "border-box",
      marginBottom: "14px",
      padding: "6px 8px",
      background: "var(--oc-sunken, #16171c)",
      color: "inherit",
      border: "1px solid var(--oc-line, #34363f)",
      borderRadius: "6px"
    }));
    const d = document.createElement("div");
    Object.assign(d.style, { display: "flex", gap: "8px", justifyContent: "flex-end" });
    const x = document.createElement("button");
    x.type = "button", x.textContent = "Cancel";
    const h = document.createElement("button");
    h.type = "button", h.textContent = "OK";
    for (const u of [x, h])
      Object.assign(u.style, {
        padding: "6px 14px",
        borderRadius: "6px",
        cursor: "pointer",
        border: "1px solid var(--oc-line, #34363f)",
        background: "transparent",
        color: "inherit"
      });
    h.style.background = "var(--oc-accent, #4c6ef5)", h.style.borderColor = "transparent", h.style.color = "#fff", d.append(x, h), m.append(i, s), l && m.append(l), m.append(d), c.append(m);
    let g = !1;
    const b = (u) => {
      g || (g = !0, document.removeEventListener("keydown", v, !0), r && typeof r == "object" && w.get(r)?.delete(p), c.remove(), n(u));
    }, p = () => b(o ? null : !1);
    if (r && typeof r == "object") {
      let u = w.get(r);
      u || w.set(r, u = /* @__PURE__ */ new Set()), u.add(p);
    }
    const v = (u) => {
      u.key === "Escape" ? (u.stopPropagation(), b(o ? null : !1)) : u.key === "Enter" && (u.stopPropagation(), b(o ? l.value : !0));
    };
    x.addEventListener("click", () => b(o ? null : !1)), h.addEventListener("click", () => b(o ? l.value : !0)), c.addEventListener("mousedown", (u) => {
      u.target === c && b(o ? null : !1);
    }), document.addEventListener("keydown", v, !0), document.body.appendChild(c), (l || h).focus();
  });
}
function ze({ title: e, items: t = [], onDelete: o = null, owner: a = null }) {
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
    const i = document.createElement("div");
    Object.assign(i.style, {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      maxHeight: "min(52vh, 420px)",
      overflowY: "auto",
      marginBottom: "14px"
    });
    let s = !1;
    const l = (p) => {
      s || (s = !0, document.removeEventListener("keydown", b, !0), a && typeof a == "object" && w.get(a)?.delete(d), n.remove(), r(p));
    }, d = () => l(null), x = (p) => {
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
      j.textContent = p.label || p.id;
      const S = document.createElement("div");
      if (S.textContent = p.sublabel || "", Object.assign(S.style, { opacity: "0.6", fontSize: "11px" }), u.append(j, S), u.addEventListener("click", () => l(p.id)), v.appendChild(u), o) {
        const y = document.createElement("button");
        y.type = "button", y.title = "Delete", y.textContent = "✕", Object.assign(y.style, {
          width: "34px",
          borderRadius: "6px",
          cursor: "pointer",
          border: "1px solid var(--oc-line, #34363f)",
          background: "transparent",
          color: "inherit"
        }), y.addEventListener("click", async (Q) => {
          Q.stopPropagation(), y.disabled = !0;
          try {
            await o(p.id), v.remove(), i.children.length || l(null);
          } catch (N) {
            y.disabled = !1, console.warn("[OmniCam] delete failed", N), a?.setStatus?.(String(N?.message || N).slice(0, 120));
          }
        }), v.appendChild(y);
      }
      return v;
    };
    for (const p of t) i.appendChild(x(p));
    const h = document.createElement("div");
    Object.assign(h.style, { display: "flex", justifyContent: "flex-end" });
    const g = document.createElement("button");
    if (g.type = "button", g.textContent = "Cancel", Object.assign(g.style, {
      padding: "6px 14px",
      borderRadius: "6px",
      cursor: "pointer",
      border: "1px solid var(--oc-line, #34363f)",
      background: "transparent",
      color: "inherit"
    }), g.addEventListener("click", () => l(null)), h.appendChild(g), c.append(m, i, h), n.appendChild(c), a && typeof a == "object") {
      let p = w.get(a);
      p || w.set(a, p = /* @__PURE__ */ new Set()), p.add(d);
    }
    const b = (p) => {
      p.key === "Escape" && (p.stopPropagation(), l(null));
    };
    n.addEventListener("mousedown", (p) => {
      p.target === n && l(null);
    }), document.addEventListener("keydown", b, !0), document.body.appendChild(n), i.querySelector("button")?.focus({ preventScroll: !0 });
  });
}
async function oe(e, t, o, a) {
  let r, n, c, m, i;
  typeof e == "object" && e !== null ? (n = e, r = e.extensionManager ? e : e.app, c = t, m = o, i = a) : (r = typeof window < "u" ? window.app : null, c = e, m = t, i = o);
  const s = r?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return s?.prompt ? s.prompt({ title: c, message: m, defaultValue: i }) : $({ title: c, message: m, withInput: !0, defaultValue: i, owner: n });
}
async function ae(e, t, o) {
  let a, r, n, c;
  typeof e == "object" && e !== null ? (r = e, a = e.extensionManager ? e : e.app, n = t, c = o) : (a = typeof window < "u" ? window.app : null, n = e, c = t);
  const m = a?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return m?.confirm ? m.confirm({ title: n, message: c }) : $({ title: n, message: c, withInput: !1, owner: r });
}
const re = "omnicam_extractor_result_v2", E = "omnicam_extracted_motion_scene_json", A = "omnicam_extracted_track_fingerprint", H = "omnicam_extractor_source";
function B(e) {
  if (!e || e.version !== 1 || !Array.isArray(e.cameras)) return null;
  const t = String(e.playblast_camera_id || e.active_camera_id || ""), a = e.cameras.find((r) => String(r?.id || "") === t)?.track;
  return a && Array.isArray(a.keyframes) && a.keyframes.length ? a : null;
}
function Ie(e) {
  if (!e || !Array.isArray(e.keyframes) || !e.keyframes.length) return null;
  const t = Number(e.fps), o = Number(e.duration_frames);
  if (!(t > 0) || !(o > 0)) return null;
  const a = String(e.metadata?.extractor_fingerprint || "");
  return {
    version: 1,
    timeline: { duration_seconds: o / t, authoring_fps: t },
    canvas: { width: Number(e.width), height: Number(e.height) },
    cameras: [{ id: "extracted_camera", label: "Extracted Camera", enabled: !0, track: e }],
    active_camera_id: "extracted_camera",
    playblast_camera_id: "extracted_camera",
    objects: Array.isArray(e.objects) ? e.objects : [],
    motion_layers: [],
    cuts: [],
    metadata: { ...e.metadata || {}, source: "omnicam_extractor", extractor_fingerprint: a }
  };
}
function Pe(e) {
  const t = e?.text, o = Array.isArray(t) ? t[0] : t;
  if (typeof o != "string" || !o) return null;
  let a;
  try {
    a = JSON.parse(o);
  } catch {
    return null;
  }
  if (!a || a.kind !== re) return null;
  const r = a.mode === "scene_reconstruct" ? "scene_reconstruct" : "camera_track", n = a.motion_scene, c = {
    mode: r,
    motionScene: n,
    fingerprint: String(a.fingerprint || ""),
    solver_coverage: Number(a.solver_coverage) || 0,
    report: String(a.report || "")
  };
  if (r === "scene_reconstruct")
    return n ? {
      ...c,
      reconstruction: a.reconstruction || {},
      // The reconstruct source annotation is an object; keep it whole.
      source: a.source ?? ""
    } : null;
  const m = B(n);
  return m ? {
    ...c,
    track: m,
    source: String(a.source || ""),
    // The immutable raw solve, for live post-solve refinement without a
    // re-TRACK (POST /majoor/omnicam/extractor/refine). Held in session only.
    rawSolve: a.raw_solve && typeof a.raw_solve == "object" ? a.raw_solve : null
  } : null;
}
function ne(e) {
  return e.computeSize = () => [0, -4], e.draw = () => {
  }, e.hidden = !0, e.options = { ...e.options || {}, hideInVueNodes: !0 }, e;
}
function _(e, t) {
  return e.widgets?.find((o) => o.name === t) || null;
}
function ie(e) {
  const t = [];
  for (const o of [E, A]) {
    let a = _(e, o);
    if (!a) {
      if (a = e.addWidget?.("text", o, "", () => {
      }, { serialize: !0 }), !a) continue;
      ne(a);
    }
    t.push(a);
  }
  return t;
}
function Fe(e) {
  const t = e?.widgets_values, o = e?.widgets;
  if (!Array.isArray(t) || !Array.isArray(o)) return 0;
  let a = 0;
  for (const r of [E, A, H]) {
    const n = o.findIndex((m) => m?.name === r);
    if (n < 0 || n >= t.length) continue;
    const c = t[n];
    typeof c != "string" || !c || o[n].value || (o[n].value = c, a += 1);
  }
  return a;
}
function qe(e, t) {
  ie(e);
  const o = _(e, E), a = _(e, A), r = String(a?.value || "") !== t.fingerprint;
  return o && (o.value = JSON.stringify(t.motionScene)), a && (a.value = t.fingerprint), r;
}
function Oe(e, t) {
  const o = _(e, H);
  if (!o || !t) return !1;
  const a = String(t), r = String(o.value || "") !== a;
  return o.value = a, r;
}
function se(e) {
  const t = String(_(e, A)?.value || ""), o = String(_(e, E)?.value || "");
  if (!t || !o) return null;
  let a;
  try {
    a = JSON.parse(o);
  } catch {
    return null;
  }
  const r = B(a);
  return r ? { motionScene: a, track: r, fingerprint: t } : null;
}
function De(e) {
  const t = e?.track?.metadata || {}, o = String(t.backend || "solver").toUpperCase(), a = Number(e?.track?.duration_frames) || 0, r = Array.isArray(e?.track?.keyframes) ? e.track.keyframes.length : 0, n = Math.round((Number(e?.solver_coverage ?? e?.confidence) || 0) * 100);
  return `${o} · ${a} f · ${r} keys · Solver Coverage ${n}%`;
}
const T = "upstream_camera_track";
function $e(e, t, {
  label: o = "Import camera",
  source: a = "camera_import",
  fingerprint: r = "",
  originNodeId: n = null,
  adoptFps: c = !0,
  checkpoint: m = !0,
  status: i = !0
} = {}) {
  const s = t?.keyframes;
  if (!Array.isArray(s) || !s.length)
    throw new Error(f("no camera keys in this file"));
  m && e.checkpoint(o);
  const l = ee(e);
  return l.keyframes = s, e.state.keyframes = s, c && Number.isFinite(Number(t.fps)) && (e.state.fps = Math.max(1, Math.round(Number(t.fps))), e.fpsWidget && (e.fpsWidget.value = e.state.fps)), Number.isFinite(Number(t.duration_frames)) && (e.state.duration_frames = Math.max(1, Math.round(Number(t.duration_frames)))), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / Math.max(1, e.state.fps)), r && (e.state.metadata = {
    ...e.state.metadata,
    [T]: {
      fingerprint: r,
      source: a,
      ...n == null ? {} : { origin_node_id: String(n) }
    }
  }), e.syncActiveCameraTrack(), e.setFrame(0), e.refreshKeys(), e.render(), e.scheduleSerialize(), i && e.setStatus(f("Imported {count} camera keys from {name}").replace("{count}", String(s.length)).replace("{name}", o)), s.length;
}
const K = 24, W = 5, V = 150, J = Math.PI / 180;
function G(e, t, o) {
  return Math.min(o, Math.max(t, e));
}
function ce(e, t = K) {
  const o = G(Number(e) || 0, W, V);
  return t / (2 * Math.tan(o * J / 2));
}
function me(e, t = K) {
  const o = Math.max(1e-6, Number(e) || 0), a = 2 * Math.atan(t / (2 * o)) / J;
  return G(a, W, V);
}
function le(e) {
  const t = ce(e);
  return t >= 100 ? t.toFixed(0) : t.toFixed(1);
}
function He(e) {
  return `${(Number(e) || 0).toFixed(1)}°`;
}
const Be = [14, 18, 24, 35, 50, 85, 135], Ke = {
  full_frame: { name: "Full Frame 35mm", width: 36, height: 24 },
  super_35: { name: "Super 35", width: 24.89, height: 18.66 },
  m43: { name: "Micro 4/3", width: 17.3, height: 13 },
  cinema_16_9: { name: "16:9 Digital Cinema", width: 23.76, height: 13.37 },
  mobile_9_16: { name: "Mobile 9:16 Vertical", width: 13.37, height: 23.76 }
}, de = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "9:16": 9 / 16, "2.39:1": 2.39 };
function pe(e) {
  if (!e) return null;
  const t = de[e.aspect_ratio];
  if (t) return t;
  if (!e.resolution_gate) return null;
  const o = Number(e.width) || 0, a = Number(e.height) || 0;
  return o > 0 && a > 0 ? o / a : null;
}
function ue(e, t, o, a) {
  const r = pe(t);
  if (!r || !(o > 0) || !(a > 0)) return;
  const n = o / a;
  if (Math.abs(n - r) < 1e-3) return;
  const c = !!t.resolution_gate;
  if (e.save(), e.fillStyle = "#000000b3", n > r) {
    const m = a * r, i = (o - m) / 2;
    e.fillRect(0, 0, i, a), e.fillRect(o - i, 0, i, a), c && (e.strokeStyle = "#ffffff88", e.strokeRect(i, 0, m, a));
  } else {
    const m = o / r, i = (a - m) / 2;
    e.fillRect(0, 0, o, i), e.fillRect(0, a - i, o, i), c && (e.strokeStyle = "#ffffff88", e.strokeRect(0, i, o, m));
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
function R(e) {
  const t = `camera_${Date.now().toString(36)}`;
  let o = t, a = 2;
  for (; e.cameras.some((r) => r.id === o); ) o = `${t}_${a++}`;
  return o;
}
function fe(e, t) {
  if (!e.cameras.some((a) => a.name === t)) return t;
  let o = 2;
  for (; e.cameras.some((a) => a.name === `${t} ${o}`); ) o += 1;
  return `${t} ${o}`;
}
function he(e, t, { label: o = "Extracted Camera" } = {}) {
  const a = Array.isArray(t?.keyframes) ? t.keyframes : [];
  if (!a.length) throw new Error(f("no camera keys in this solve"));
  const r = Number(e.state.fps) || 24, n = Number(t.fps) || r, c = n > 0 ? r / n : 1, m = R(e.state), i = e.state.cameras.length, s = fe(e.state, o || "Extracted Camera"), l = k[i % k.length], d = a.map((x) => ({
    ...x,
    frame: Math.round((Number(x.frame) || 0) * c),
    camera: C(x.camera)
  }));
  if (e.state.cameras.push({ id: m, name: s, color: l, camera: C(d[0].camera), keyframes: d }), Number.isFinite(Number(t.duration_frames))) {
    const x = Math.round(Number(t.duration_frames) * c);
    e.state.duration_frames = Math.max(e.state.duration_frames || 1, x);
  }
  return t?.metadata?.solve_health_v1 && (e.state.metadata = { ...e.state.metadata, solve_health_v1: t.metadata.solve_health_v1 }), e.cameraPreviewSignature = "", e.activateCamera(m), m;
}
function We(e) {
  const t = O(e.state);
  for (const o of e.root.querySelectorAll('[data-role="playblast-camera"]')) {
    o.innerHTML = "";
    for (const r of e.state.cameras) {
      const n = document.createElement("option");
      n.value = r.id, n.textContent = r.name, o.appendChild(n);
    }
    const a = document.createElement("option");
    a.value = L, a.textContent = t.length ? f("Sequence ({count} shots)").replace("{count}", String(t.length)) : f("Sequence (no shots yet)"), a.disabled = t.length === 0, o.appendChild(a), o.value = e.state.playblast_camera_id;
  }
  for (const o of e.root.querySelectorAll('[data-role="active-camera-select"]')) {
    o.innerHTML = "";
    for (const a of e.state.cameras) {
      const r = document.createElement("option");
      r.value = a.id, r.textContent = a.name, o.appendChild(r);
    }
    o.value = e.state.active_camera_id;
  }
  X(e);
}
function ge(e) {
  const t = e.state.cameras, o = t.filter((r) => r.solo), a = o.length ? o : t.filter((r) => !r.muted);
  return a.length ? a : t;
}
function X(e) {
  const t = e.root.querySelector('[data-role="camera-previews"]');
  if (!t) return;
  const o = e.state.preview_layout || "auto";
  t.dataset.layout !== (o === "auto" ? "" : o) && (t.dataset.layout = o === "auto" ? "" : o);
  const a = `${Math.max(1, e.state.width || 16)} / ${Math.max(1, e.state.height || 9)}`, r = t.style.getPropertyValue("--shot-aspect") !== a;
  r && t.style.setProperty("--shot-aspect", a);
  const n = e.root.querySelector('[data-role="camera-view-row"]');
  n && n.classList.toggle("maximized", !!e.state.maximized_camera_id);
  const c = ge(e), m = c.map((s) => `${s.id}:${s.name}:${s.muted ? 1 : 0}:${s.solo ? 1 : 0}:${s.color || ""}`).join("|");
  let i = !1;
  m !== e.cameraPreviewSignature && (i = !0, e.cameraPreviewSignature = m, t.innerHTML = "", e.cameraPreviewCanvases.clear(), e.cameraPreviewContexts.clear(), c.forEach((s, l) => {
    const d = document.createElement("div");
    d.className = "camera-preview-tile", d.dataset.cameraId = s.id;
    const x = s.color || k[l % k.length];
    d.style.setProperty("--camera-color", x), d.title = f(`Click: set ${s.name} as primary · Double-click: edit · Right-click: preview actions`);
    const h = document.createElement("div");
    h.className = "camera-preview-head";
    const g = document.createElement("i");
    g.className = "pi pi-video";
    const b = document.createElement("span");
    b.textContent = s.name;
    const p = document.createElement("span");
    p.dataset.cameraFrame = s.id, p.textContent = `F${e.frame}`;
    const v = document.createElement("i");
    v.className = "pi pi-circle-fill output-mark", v.title = f("Playblast camera");
    const u = document.createElement("canvas");
    u.dataset.cameraPreview = s.id;
    const j = document.createElement("span");
    j.className = "camera-view-badge", j.textContent = f("CAMERA PREVIEW"), h.append(g, b, p, v), d.append(u, h, j), t.appendChild(d), d.addEventListener("click", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = setTimeout(() => e.setPlayblastCamera(s.id), 220);
    }), d.addEventListener("dblclick", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = null, e.activateCamera(s.id);
    }), d.addEventListener("auxclick", (S) => {
      S.button === 1 && (S.preventDefault(), xe(e, s.id));
    }), e.cameraPreviewCanvases.set(s.id, u), e.cameraPreviewContexts.set(s.id, u.getContext("2d", { alpha: !1 }));
  }));
  for (const s of t.querySelectorAll(".camera-preview-tile"))
    s.classList.toggle("playblast", s.dataset.cameraId === e.state.playblast_camera_id), s.classList.toggle("active", s.dataset.cameraId === e.state.active_camera_id), s.classList.toggle("maximized", s.dataset.cameraId === e.state.maximized_camera_id);
  for (const s of t.querySelectorAll(".output-mark")) s.hidden = s.closest(".camera-preview-tile")?.dataset.cameraId !== e.state.playblast_camera_id;
  (i || r) && requestAnimationFrame(() => {
    e.root.isConnected && (e.resizeCanvas(), e.renderCameraView());
  });
}
function Ve(e) {
  e.checkpoint("Add camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const t = R(e.state), o = e.state.cameras.length, a = `Camera ${o + 1}`, r = C(e.camera), n = [
    (r.target?.[0] ?? 0) - (r.position?.[0] ?? 0),
    (r.target?.[1] ?? 0) - (r.position?.[1] ?? 0),
    (r.target?.[2] ?? -1) - (r.position?.[2] ?? 0)
  ], c = Math.hypot(...n) || 1;
  r.position = [0, 0, 0], r.target = n.map((s) => s / c);
  const m = k[o % k.length], i = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease";
  e.state.cameras.push({
    id: t,
    name: a,
    color: m,
    camera: r,
    keyframes: [{ frame: 0, camera: C(r), interpolation: i }]
  }), e.cameraPreviewSignature = "", e.activateCamera(t), e.setStatus(f(`${a} added`));
}
async function Je(e, t) {
  const o = e.state.cameras.find((r) => r.id === t);
  if (!o) return;
  const a = (await oe(e.app, f("Rename camera"), f("Camera name"), o.name))?.trim();
  !a || a === o.name || (e.checkpoint("Rename camera"), o.name = a.slice(0, 80), e.cameraPreviewSignature = "", e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(f(`Camera renamed: ${o.name}`)));
}
function Ge(e, t) {
  const o = e.state.cameras.find((n) => n.id === t);
  if (!o) return;
  e.checkpoint("Duplicate camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const a = JSON.parse(JSON.stringify(o));
  a.id = R(e.state), a.name = `${o.name} Copy`;
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
  e.state.cameras.push(a), e.cameraPreviewSignature = "", e.activateCamera(a.id), e.setStatus(f(`${a.name} added`));
}
async function Xe(e, t) {
  if (e.state.cameras.length <= 1) return e.setStatus(f("At least one camera is required"));
  const o = e.state.cameras.find((r) => r.id === t);
  if (!o || !await ae(e.app, f("Delete camera"), f(`Delete ${o.name} and its ${o.keyframes.length} keyframe(s)?`))) return;
  e.checkpoint("Delete camera"), e.finishCameraEdit();
  const a = t === e.state.active_camera_id;
  if (e.state.cameras = e.state.cameras.filter((r) => r.id !== t), t === e.state.playblast_camera_id && (e.state.playblast_camera_id = e.state.cameras[0].id), e.cameraPreviewSignature = "", a) {
    const r = e.state.cameras[0];
    e.state.active_camera_id = r.id, e.state.keyframes = r.keyframes, e.state.camera = C(r.camera), e.camera = M(r, e.frame, e.state.objects), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = r.keyframes.find((n) => n.frame === e.frame)?.frame ?? null, e.selectedKeyFrames = e.selectedKeyFrame != null ? /* @__PURE__ */ new Set([e.selectedKeyFrame]) : /* @__PURE__ */ new Set(), e.editingKeyFrame = null;
  }
  e.pathSelection = q(e.pathSelection, e.activeCameraTrack()), e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(f(`${o.name} deleted`));
}
function Ye(e, t) {
  const o = e.state.cameras.find((a) => a.id === t);
  o && (e.finishCameraEdit(), e.syncActiveCameraTrack(), e.state.active_camera_id = o.id, e.state.keyframes = o.keyframes, e.state.camera = C(o.camera), e.camera = M(o, e.frame, e.state.objects), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = o.keyframes.find((a) => a.frame === e.frame)?.frame ?? null, e.selectedKeyFrames = e.selectedKeyFrame != null ? /* @__PURE__ */ new Set([e.selectedKeyFrame]) : /* @__PURE__ */ new Set(), e.pathSelection = q(e.pathSelection, o), e.editingKeyFrame = null, e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(f(`Camera: ${o.name}`)));
}
function Qe(e, t) {
  const o = O(e.state), a = t === L && o.length > 0, r = a ? null : e.state.cameras.find((n) => n.id === t);
  !a && !r || (e.state.playblast_camera_id = a ? L : r.id, e.refreshCameraSelectors(), e.serialize(), e.refreshObjects(), e.renderCameraView(), e.setStatus(a ? f("Playblast: sequence ({count} shots)").replace("{count}", String(o.length)) : f(`Playblast: ${r.name}`)));
}
function Ze(e) {
  e.state.camera_view_visible = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-role="camera-view-row"]')) t.hidden = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    t.classList.toggle("active", e.state.camera_view_visible), t.setAttribute("aria-pressed", String(e.state.camera_view_visible));
  e.serialize(), e.state.camera_view_visible && requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(f(`Camera previews ${e.state.camera_view_visible ? "shown" : "hidden"}`));
}
function xe(e, t) {
  e.state.maximized_camera_id = e.state.maximized_camera_id === t ? null : t, e.serialize(), X(e), requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(e.state.maximized_camera_id ? f("Preview maximized") : f("Preview restored"));
}
function Ue(e, t, o, a) {
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
  ue(t, e.state, o, a);
}
function et(e, t) {
  const o = me(t);
  e.checkpoint(`Lens: ${t}mm`), e.beginCameraEdit(), e.camera.fov = o, e.commitCameraEdit(), e.finishCameraEdit();
  for (const a of e.root.querySelectorAll('[data-role="camera-fov"]')) a.value = String(o.toFixed(1));
  for (const a of e.root.querySelectorAll('[data-role="camera-focal"]')) a.value = le(o);
  e.setStatus(`Lens: ${t}mm (FOV ${o.toFixed(1)}°)`);
}
function tt(e) {
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
function be(e, t) {
  const o = e?.reconstruction?.role || "";
  return o === "blockout_object" ? { locked: !1, visible: !0 } : o === "asset_proxy" ? { locked: !1, visible: !0 } : o === "room" || o === "reference" ? { locked: !0, visible: !(o === "reference" && String(t) === "blockout") } : { locked: !0, visible: !0 };
}
function ve(e) {
  return e?.reconstruction?.recon_mode || e?.motion_scene?.metadata?.reconstruction?.mode || e?.metadata?.reconstruction?.mode || "";
}
function P(e, t) {
  const o = e?.reconstruction?.role;
  if (!o) return e;
  const a = be(e, t);
  return (e.locked === void 0 || o === "room" || o === "reference") && (e.locked = a.locked), o === "reference" && (e.enabled = a.visible), e;
}
function Y(e) {
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
function ye(e) {
  const t = e?.canvas || {}, o = e?.timeline || {}, a = Math.max(1, Math.round(Number(o.authoring_fps || e?.fps || 24))), r = Number(o.duration_seconds || 0);
  return {
    ...e,
    width: Number(t.width || e?.width || 1280),
    height: Number(t.height || e?.height || 720),
    fps: a,
    duration_frames: r > 0 ? Math.max(1, Math.round(r * a)) : Number(e?.duration_frames || a * 5),
    cameras: Y(e)
  };
}
function F(e, t) {
  if (!e || !e.has(t)) return t;
  let o = 2;
  for (; e.has(`${t}_${o}`); )
    o += 1;
  return `${t}_${o}`;
}
function we(e) {
  const t = e?.state;
  if (!t) return !0;
  if ((t.objects || []).length > 0) return !1;
  const a = t.cameras || [];
  return a.length <= 1 ? (a[0]?.keyframes || []).length <= 1 : !1;
}
function ke(e, t, o = {}) {
  const a = t?.motion_scene || t;
  if (!a || !Array.isArray(a.objects))
    throw new Error("Reconstruction result has no objects array");
  const r = o.mode || (we(e) ? "replace" : "merge"), n = o.reconMode || ve(t);
  if (r === "replace") {
    e.checkpoint?.("Adopt reconstructed scene (replace)"), e.state = Z(
      ye(JSON.parse(JSON.stringify(a)))
    ), e.camera = M(e.state, e.frame || 0);
    for (const c of e.state.objects || [])
      P(c, n), (c.type === "glb" || c.type === "model") && c.asset && e.modelUrlsById?.set(c.id, I(c.asset));
  } else {
    e.checkpoint?.("Merge reconstructed environment");
    const c = new Set((e.state.objects || []).map((l) => l.id)), m = new Set((e.state.cameras || []).map((l) => l.id)), i = /* @__PURE__ */ new Map(), s = a.objects.map((l) => JSON.parse(JSON.stringify(l)));
    for (const l of s) {
      const d = F(c, l.id);
      c.add(d), i.set(l.id, d), l.id = d;
    }
    for (const l of s)
      l.parent_id && i.has(l.parent_id) && (l.parent_id = i.get(l.parent_id)), P(l, n), e.state.objects.push(l), (l.type === "glb" || l.type === "model") && l.asset && e.modelUrlsById?.set(l.id, I(l.asset));
    for (const l of Y(a)) {
      const d = F(m, l.id);
      m.add(d), l.id = d, l.enabled = !1, e.state.cameras.push(l);
    }
  }
  e.serialize?.(), e.refreshObjects?.(), e.render?.(), e.setStatus?.("Adopted reconstructed scene into Director");
}
const je = "solved_scene";
function Se(e) {
  return String(e?.comfyClass || e?.type || e?.constructor?.type || "");
}
function Ce(e) {
  const t = e?.node, o = t?.graph;
  if (!o) return null;
  for (const a of t.inputs || []) {
    if (String(a?.name || "").toLowerCase() !== je || a.link == null) continue;
    const r = te(o, a.link);
    if (r && Se(r) === U) return r;
  }
  return null;
}
function _e(e) {
  return String(e?.state?.metadata?.[T]?.fingerprint || "");
}
function Ee(e, t, o) {
  e.state.metadata = {
    ...e.state.metadata,
    [T]: {
      fingerprint: t,
      source: "omnicam_extractor",
      origin_node_id: String(o.id)
    }
  };
}
function z(e) {
  const t = e.root?.querySelector('[data-role="extractor-import-banner"]');
  if (!t) return;
  const o = e.pendingExtractorImport;
  if (t.hidden = !o, !o) return;
  const a = t.querySelector('[data-role="extractor-import-text"]');
  a && (a.textContent = f("{count} camera keys ready from {name} — import as a new camera?").replace("{count}", String(o.keyCount)).replace("{name}", o.label));
}
function ot(e) {
  const t = Ce(e), o = t ? se(t) : null;
  let a = !1;
  return o ? o.fingerprint !== _e(e) && e.pendingExtractorImport?.fingerprint !== o.fingerprint && (e.pendingExtractorImport = {
    track: o.track,
    fingerprint: o.fingerprint,
    originNodeId: t.id,
    label: String(t.title || f("OmniCam Extractor")),
    keyCount: o.track.keyframes?.length || 0
  }, Ee(e, o.fingerprint, t), a = !0) : e.pendingExtractorImport && (e.pendingExtractorImport = null, a = !0), z(e), a;
}
function at(e) {
  const t = e.pendingExtractorImport;
  return t ? (e.checkpoint("Import extracted camera"), he(e, t.track, { label: t.label }), e.pendingExtractorImport = null, z(e), e.setStatus?.(f("Imported {count} camera keys from {name}").replace("{count}", String(t.keyCount)).replace("{name}", t.label)), e.scheduleSerialize(), e.render(), !0) : !1;
}
function rt(e) {
  return e.pendingExtractorImport ? (e.pendingExtractorImport = null, z(e), e.render(), e.setStatus?.(f("Extracted camera preview dismissed")), !0) : !1;
}
function nt(e) {
  const t = e?.graph;
  if (!t) return 0;
  const o = e.outputs || [], a = /* @__PURE__ */ new Set();
  let r = 0;
  for (const n of o)
    for (const c of n?.links || []) {
      const m = D(t, c), i = m?.target_id ?? m?.targetId;
      if (!m || i == null || a.has(i)) continue;
      a.add(i);
      const s = t.getNodeById?.(i), l = s?.__majoorOmniCamDirectorRuntime?.workbench ?? s?.__majoorOmniCam;
      l?.syncUpstreamInputs && (l.syncUpstreamInputs(), r += 1);
    }
  return r;
}
function it(e, t) {
  const o = e?.graph;
  if (!o) return 0;
  const a = e.outputs || [], r = /* @__PURE__ */ new Set();
  let n = 0;
  for (const c of a)
    for (const m of c?.links || []) {
      const i = D(o, m), s = i?.target_id ?? i?.targetId;
      if (!i || s == null || r.has(s)) continue;
      r.add(s);
      const l = o.getNodeById?.(s), d = l?.__majoorOmniCamDirectorRuntime ?? l?.__majoorOmniCam;
      d && (ke(d, t), n += 1);
    }
  return n;
}
const st = `
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
`;
export {
  Re as A,
  Te as B,
  k as C,
  Me as D,
  Ye as E,
  A as F,
  Ve as G,
  Xe as H,
  Ue as I,
  Ge as J,
  xe as K,
  st as L,
  X as M,
  We as N,
  Je as O,
  Qe as P,
  Ze as Q,
  $e as R,
  E as S,
  H as a,
  qe as b,
  ae as c,
  it as d,
  ie as e,
  Oe as f,
  se as g,
  Be as h,
  oe as i,
  le as j,
  He as k,
  Ke as l,
  Ie as m,
  nt as n,
  me as o,
  Pe as p,
  at as q,
  Fe as r,
  De as s,
  rt as t,
  tt as u,
  et as v,
  R as w,
  ze as x,
  ot as y,
  ue as z
};
