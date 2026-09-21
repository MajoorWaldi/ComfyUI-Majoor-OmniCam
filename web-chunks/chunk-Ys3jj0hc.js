import { v as p, e as _, a as L, bn as D, N as O, S as T, s as ee, bg as z, bP as te } from "./chunk-Cg3_Iw1A.js";
import { a as ae } from "./chunk-C_hMby-H.js";
import { g as $, l as oe } from "./chunk-DbDvB9Ll.js";
function Ie(e, t) {
  const a = { "add-camera": "Create a new animated camera from the current view", record: "Record the primary camera preview as a proxy playblast", "load-card": "Replace the subject card with an image or video", "add-card": "Create another image or video card", "load-model": "Import a local GLB, OBJ, FBX, STL, or PLY scene", "reset-camera": "Reset the active camera transform and lens", play: "Play or stop the timeline (Space)", key: "Insert or replace a key at the playhead (I)", "auto-key": "Record camera or object edits at the playhead", "delete-key": "Delete the selected keyframe (Delete)", "copy-key": "Copy the selected keyframe (Ctrl/Cmd+C)", "paste-key": "Paste a keyframe at the playhead (Ctrl/Cmd+V)", "previous-key": "Jump to the previous keyframe (,)", "next-key": "Jump to the next keyframe (.)", "previous-frame": "Move one frame backward (Left Arrow)", "next-frame": "Move one frame forward (Right Arrow)", "toggle-camera-view": "Show or hide the camera preview strip", "update-key": "Store the current camera view in the selected key", "view-key": "Load the selected key's camera view" };
  for (const o of e.querySelectorAll("button,select,input,summary")) {
    if (o.title) continue;
    const r = o.getAttribute("aria-label") || a[o.dataset?.act] || o.closest("label")?.querySelector("span")?.textContent?.trim() || o.closest("label")?.childNodes?.[0]?.textContent?.trim() || o.textContent?.trim();
    r && (o.title = r);
  }
  t.title = "Viewport: drag to orbit, Shift+drag to pan, wheel to dolly, WASD/QE to fly. Right-click for scene actions.", e.querySelector('[data-role="keys"]').title = "Timeline: click or drag to scrub. Drag a key to retime it. Right-click for key actions.";
}
class ze {
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
      const l = r.items || r.submenu;
      if (Array.isArray(l) && l.length) {
        n.classList.add("oc-has-submenu");
        const s = document.createElement("i");
        s.className = "pi pi-chevron-right oc-submenu-chevron", s.style.marginLeft = "auto", s.style.fontSize = "9px", s.style.opacity = "0.7", n.appendChild(s);
        const m = document.createElement("div");
        m.className = "context-menu context-submenu majoor-omnicam", m.hidden = !0, document.body.appendChild(m), this.submenus.push(m), this.renderActions(m, l, null);
        let i = null, h = null;
        const f = () => {
          clearTimeout(h), m.parentElement !== document.body && document.body.appendChild(m), m.hidden = !1, n.classList.add("active");
          const g = n.getBoundingClientRect(), v = m.getBoundingClientRect(), d = 8;
          let b = g.right + 2;
          b + v.width > window.innerWidth - d && (b = Math.max(d, g.left - v.width - 2));
          let u = g.top - 4;
          u + v.height > window.innerHeight - d && (u = Math.max(d, window.innerHeight - v.height - d)), m.style.left = `${b}px`, m.style.top = `${u}px`;
        }, x = () => {
          clearTimeout(i), h = setTimeout(() => {
            m.hidden = !0, n.classList.remove("active");
          }, 160);
        };
        n.addEventListener("pointerenter", () => {
          clearTimeout(h), i = setTimeout(f, 60);
        }), n.addEventListener("pointerleave", x), m.addEventListener("pointerenter", () => clearTimeout(h)), m.addEventListener("pointerleave", x), m.addEventListener("keydown", (g) => this.onKey(g)), n._submenuEl = m, n.addEventListener("click", (g) => {
          g.preventDefault(), g.stopPropagation(), m.hidden ? f() : x();
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
          } catch (m) {
            console.error("Context menu action failed:", m);
          }
        });
      }
      n.addEventListener("pointerdown", (s) => s.stopPropagation()), n.addEventListener("mousedown", (s) => s.stopPropagation()), t.appendChild(n);
    }
  }
  show(t, a, o) {
    if (!this.menu || this.disposed) return;
    this.dismissTimer !== null && (clearTimeout(this.dismissTimer), this.dismissTimer = null), t.preventDefault(), t.stopPropagation(), t.stopImmediatePropagation?.(), this.returnFocus = document.activeElement, this.menu.parentElement !== document.body && document.body.appendChild(this.menu), this.menu.classList.add("majoor-omnicam");
    for (const s of this.submenus) s.remove();
    this.submenus = [], this.renderActions(this.menu, o, a), this.menu.hidden = !1;
    const r = 8, n = this.menu.getBoundingClientRect(), c = Math.max(r, Math.min(t.clientX, window.innerWidth - n.width - r)), l = Math.max(r, Math.min(t.clientY, window.innerHeight - n.height - r));
    this.menu.style.left = `${c}px`, this.menu.style.top = `${l}px`, this.menu.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 }), this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0)), this.dismissHandler = (s) => {
      s.target && (this.menu.contains(s.target) || this.submenus.some((m) => m.contains(s.target))) || this.hide();
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
    const r = [...o.querySelectorAll("button:not(:disabled)")], n = r.indexOf(a);
    if (t.key === "Escape")
      return t.preventDefault(), o !== this.menu ? (o.hidden = !0, [...document.querySelectorAll(".oc-has-submenu")].find((l) => l._submenuEl === o)?.focus()) : this.hide({ restoreFocus: !0 }), !0;
    if (["ArrowDown", "ArrowUp"].includes(t.key)) {
      t.preventDefault();
      const c = t.key === "ArrowDown" ? 1 : -1;
      return r[(n + c + r.length) % r.length]?.focus(), !0;
    }
    return t.key === "ArrowRight" && a?._submenuEl ? (t.preventDefault(), a._submenuEl.hidden = !1, a.classList.add("active"), a._submenuEl.querySelector("button:not(:disabled)")?.focus(), !0) : t.key === "ArrowLeft" && o !== this.menu ? (t.preventDefault(), o.hidden = !0, [...document.querySelectorAll(".oc-has-submenu")].find((l) => l._submenuEl === o)?.focus(), !0) : !1;
  }
}
const w = /* @__PURE__ */ new WeakMap();
function Pe(e) {
  const t = w.get(e);
  if (t) {
    for (const a of [...t]) a();
    w.delete(e);
  }
}
function W({ title: e, message: t, withInput: a = !1, defaultValue: o = "", owner: r = null }) {
  return typeof document > "u" || !document.body ? Promise.resolve(a ? null : !1) : new Promise((n) => {
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
    const l = document.createElement("div");
    l.className = "oc-modal", Object.assign(l.style, {
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
    const m = document.createElement("p");
    m.textContent = t || "", Object.assign(m.style, { margin: "0 0 14px", opacity: "0.85" });
    let i = null;
    a && (i = document.createElement("input"), i.type = "text", i.value = o == null ? "" : String(o), Object.assign(i.style, {
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
    x.style.background = "var(--oc-accent, #4c6ef5)", x.style.borderColor = "transparent", x.style.color = "#fff", h.append(f, x), l.append(s, m), i && l.append(i), l.append(h), c.append(l);
    let g = !1;
    const v = (u) => {
      g || (g = !0, document.removeEventListener("keydown", b, !0), r && typeof r == "object" && w.get(r)?.delete(d), c.remove(), n(u));
    }, d = () => v(a ? null : !1);
    if (r && typeof r == "object") {
      let u = w.get(r);
      u || w.set(r, u = /* @__PURE__ */ new Set()), u.add(d);
    }
    const b = (u) => {
      u.key === "Escape" ? (u.stopPropagation(), v(a ? null : !1)) : u.key === "Enter" && (u.stopPropagation(), v(a ? i.value : !0));
    };
    f.addEventListener("click", () => v(a ? null : !1)), x.addEventListener("click", () => v(a ? i.value : !0)), c.addEventListener("mousedown", (u) => {
      u.target === c && v(a ? null : !1);
    }), document.addEventListener("keydown", b, !0), document.body.appendChild(c), (i || x).focus();
  });
}
function qe({ title: e, items: t = [], onDelete: a = null, owner: o = null }) {
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
    const l = document.createElement("h3");
    l.textContent = e || "", Object.assign(l.style, { margin: "0 0 12px", fontSize: "14px" });
    const s = document.createElement("div");
    Object.assign(s.style, {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      maxHeight: "min(52vh, 420px)",
      overflowY: "auto",
      marginBottom: "14px"
    });
    let m = !1;
    const i = (d) => {
      m || (m = !0, document.removeEventListener("keydown", v, !0), o && typeof o == "object" && w.get(o)?.delete(h), n.remove(), r(d));
    }, h = () => i(null), f = (d) => {
      const b = document.createElement("div");
      Object.assign(b.style, { display: "flex", alignItems: "stretch", gap: "4px" });
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
      const S = document.createElement("div");
      if (S.textContent = d.sublabel || "", Object.assign(S.style, { opacity: "0.6", fontSize: "11px" }), u.append(j, S), u.addEventListener("click", () => i(d.id)), b.appendChild(u), a) {
        const y = document.createElement("button");
        y.type = "button", y.title = "Delete", y.textContent = "✕", Object.assign(y.style, {
          width: "34px",
          borderRadius: "6px",
          cursor: "pointer",
          border: "1px solid var(--oc-line, #34363f)",
          background: "transparent",
          color: "inherit"
        }), y.addEventListener("click", async (U) => {
          U.stopPropagation(), y.disabled = !0;
          try {
            await a(d.id), b.remove(), s.children.length || i(null);
          } catch (N) {
            y.disabled = !1, console.warn("[OmniCam] delete failed", N), o?.setStatus?.(String(N?.message || N).slice(0, 120));
          }
        }), b.appendChild(y);
      }
      return b;
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
    }), g.addEventListener("click", () => i(null)), x.appendChild(g), c.append(l, s, x), n.appendChild(c), o && typeof o == "object") {
      let d = w.get(o);
      d || w.set(o, d = /* @__PURE__ */ new Set()), d.add(h);
    }
    const v = (d) => {
      d.key === "Escape" && (d.stopPropagation(), i(null));
    };
    n.addEventListener("mousedown", (d) => {
      d.target === n && i(null);
    }), document.addEventListener("keydown", v, !0), document.body.appendChild(n), s.querySelector("button")?.focus({ preventScroll: !0 });
  });
}
function B() {
  return typeof document < "u" && !!document.querySelector(".oc-workbench-backdrop");
}
async function re(e, t, a, o) {
  let r, n, c, l, s;
  typeof e == "object" && e !== null ? (n = e, r = e.extensionManager ? e : e.app, c = t, l = a, s = o) : (r = typeof window < "u" ? window.app : null, c = e, l = t, s = a);
  const m = r?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return m?.prompt && !B() ? m.prompt({ title: c, message: l, defaultValue: s }) : W({ title: c, message: l, withInput: !0, defaultValue: s, owner: n });
}
async function ne(e, t, a) {
  let o, r, n, c;
  typeof e == "object" && e !== null ? (r = e, o = e.extensionManager ? e : e.app, n = t, c = a) : (o = typeof window < "u" ? window.app : null, n = e, c = t);
  const l = o?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return l?.confirm && !B() ? l.confirm({ title: n, message: c }) : W({ title: n, message: c, withInput: !1, owner: r });
}
const ie = "omnicam_extractor_result_v2", E = "omnicam_extracted_motion_scene_json", A = "omnicam_extracted_track_fingerprint", H = "omnicam_extractor_source";
function K(e) {
  if (!e || e.version !== 1 || !Array.isArray(e.cameras)) return null;
  const t = String(e.playblast_camera_id || e.active_camera_id || ""), o = e.cameras.find((r) => String(r?.id || "") === t)?.track;
  return o && Array.isArray(o.keyframes) && o.keyframes.length ? o : null;
}
function Fe(e) {
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
function De(e) {
  const t = e?.text, a = Array.isArray(t) ? t[0] : t;
  if (typeof a != "string" || !a) return null;
  let o;
  try {
    o = JSON.parse(a);
  } catch {
    return null;
  }
  if (!o || o.kind !== ie) return null;
  const r = o.mode === "scene_reconstruct" ? "scene_reconstruct" : "camera_track", n = o.motion_scene, c = {
    mode: r,
    motionScene: n,
    fingerprint: String(o.fingerprint || ""),
    solver_coverage: Number(o.solver_coverage) || 0,
    report: String(o.report || "")
  };
  if (r === "scene_reconstruct")
    return n ? {
      ...c,
      reconstruction: o.reconstruction || {},
      // The reconstruct source annotation is an object; keep it whole.
      source: o.source ?? ""
    } : null;
  const l = K(n);
  return l ? {
    ...c,
    track: l,
    source: String(o.source || ""),
    // The immutable raw solve, for live post-solve refinement without a
    // re-TRACK (POST /majoor/omnicam/extractor/refine). Held in session only.
    rawSolve: o.raw_solve && typeof o.raw_solve == "object" ? o.raw_solve : null
  } : null;
}
function se(e) {
  return e.computeSize = () => [0, -4], e.draw = () => {
  }, e.hidden = !0, e.options = { ...e.options || {}, hideInVueNodes: !0 }, e;
}
function C(e, t) {
  return e.widgets?.find((a) => a.name === t) || null;
}
function ce(e) {
  const t = [];
  for (const a of [E, A]) {
    let o = C(e, a);
    if (!o) {
      if (o = e.addWidget?.("text", a, "", () => {
      }, { serialize: !0 }), !o) continue;
      se(o);
    }
    t.push(o);
  }
  return t;
}
function Oe(e) {
  const t = e?.widgets_values, a = e?.widgets;
  if (!Array.isArray(t) || !Array.isArray(a)) return 0;
  let o = 0;
  for (const r of [E, A, H]) {
    const n = a.findIndex((l) => l?.name === r);
    if (n < 0 || n >= t.length) continue;
    const c = t[n];
    typeof c != "string" || !c || a[n].value || (a[n].value = c, o += 1);
  }
  return o;
}
function $e(e, t) {
  ce(e);
  const a = C(e, E), o = C(e, A), r = String(o?.value || "") !== t.fingerprint;
  return a && (a.value = JSON.stringify(t.motionScene)), o && (o.value = t.fingerprint), r;
}
function We(e, t) {
  const a = C(e, H);
  if (!a || !t) return !1;
  const o = String(t), r = String(a.value || "") !== o;
  return a.value = o, r;
}
function le(e) {
  const t = String(C(e, A)?.value || ""), a = String(C(e, E)?.value || "");
  if (!t || !a) return null;
  let o;
  try {
    o = JSON.parse(a);
  } catch {
    return null;
  }
  const r = K(o);
  return r ? { motionScene: o, track: r, fingerprint: t } : null;
}
function Be(e) {
  const t = e?.track?.metadata || {}, a = String(t.backend || "solver").toUpperCase(), o = Number(e?.track?.duration_frames) || 0, r = Array.isArray(e?.track?.keyframes) ? e.track.keyframes.length : 0, n = Math.round((Number(e?.solver_coverage ?? e?.confidence) || 0) * 100);
  return `${a} · ${o} f · ${r} keys · Solver Coverage ${n}%`;
}
const M = "upstream_camera_track";
function He(e, t, {
  label: a = "Import camera",
  source: o = "camera_import",
  fingerprint: r = "",
  originNodeId: n = null,
  adoptFps: c = !0,
  checkpoint: l = !0,
  status: s = !0
} = {}) {
  const m = t?.keyframes;
  if (!Array.isArray(m) || !m.length)
    throw new Error(p("no camera keys in this file"));
  l && e.checkpoint(a);
  const i = ae(e);
  return i.keyframes = m, e.state.keyframes = m, c && Number.isFinite(Number(t.fps)) && (e.state.fps = Math.max(1, Math.round(Number(t.fps))), e.fpsWidget && (e.fpsWidget.value = e.state.fps)), Number.isFinite(Number(t.duration_frames)) && (e.state.duration_frames = Math.max(1, Math.round(Number(t.duration_frames)))), e.durationWidget && (e.durationWidget.value = e.state.duration_frames / Math.max(1, e.state.fps)), r && (e.state.metadata = {
    ...e.state.metadata,
    [M]: {
      fingerprint: r,
      source: o,
      ...n == null ? {} : { origin_node_id: String(n) }
    }
  }), e.syncActiveCameraTrack(), e.setFrame(0), e.refreshKeys(), e.render(), e.scheduleSerialize(), s && e.setStatus(p("Imported {count} camera keys from {name}").replace("{count}", String(m.length)).replace("{name}", a)), m.length;
}
const V = 24, G = 5, J = 150, X = Math.PI / 180;
function Y(e, t, a) {
  return Math.min(a, Math.max(t, e));
}
function me(e, t = V) {
  const a = Y(Number(e) || 0, G, J);
  return t / (2 * Math.tan(a * X / 2));
}
function de(e, t = V) {
  const a = Math.max(1e-6, Number(e) || 0), o = 2 * Math.atan(t / (2 * a)) / X;
  return Y(o, G, J);
}
function pe(e) {
  const t = me(e);
  return t >= 100 ? t.toFixed(0) : t.toFixed(1);
}
function Ke(e) {
  return `${(Number(e) || 0).toFixed(1)}°`;
}
const Ve = [14, 18, 24, 35, 50, 85, 135], Ge = {
  full_frame: { name: "Full Frame 35mm", width: 36, height: 24 },
  super_35: { name: "Super 35", width: 24.89, height: 18.66 },
  m43: { name: "Micro 4/3", width: 17.3, height: 13 },
  cinema_16_9: { name: "16:9 Digital Cinema", width: 23.76, height: 13.37 },
  mobile_9_16: { name: "Mobile 9:16 Vertical", width: 13.37, height: 23.76 }
}, ue = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "9:16": 9 / 16, "2.39:1": 2.39 };
function he(e) {
  if (!e) return null;
  const t = ue[e.aspect_ratio];
  if (t) return t;
  if (!e.resolution_gate) return null;
  const a = Number(e.width) || 0, o = Number(e.height) || 0;
  return a > 0 && o > 0 ? a / o : null;
}
function fe(e, t, a, o) {
  const r = he(t);
  if (!r || !(a > 0) || !(o > 0)) return;
  const n = a / o;
  if (Math.abs(n - r) < 1e-3) return;
  const c = !!t.resolution_gate;
  if (e.save(), e.fillStyle = "#000000b3", n > r) {
    const l = o * r, s = (a - l) / 2;
    e.fillRect(0, 0, s, o), e.fillRect(a - s, 0, s, o), c && (e.strokeStyle = "#ffffff88", e.strokeRect(s, 0, l, o));
  } else {
    const l = a / r, s = (o - l) / 2;
    e.fillRect(0, 0, a, s), e.fillRect(0, o - s, a, s), c && (e.strokeStyle = "#ffffff88", e.strokeRect(0, s, a, l));
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
  let a = t, o = 2;
  for (; e.cameras.some((r) => r.id === a); ) a = `${t}_${o++}`;
  return a;
}
function ge(e, t) {
  if (!e.cameras.some((o) => o.name === t)) return t;
  let a = 2;
  for (; e.cameras.some((o) => o.name === `${t} ${a}`); ) a += 1;
  return `${t} ${a}`;
}
function xe(e, t, { label: a = "Extracted Camera" } = {}) {
  const o = Array.isArray(t?.keyframes) ? t.keyframes : [];
  if (!o.length) throw new Error(p("no camera keys in this solve"));
  const r = Number(e.state.fps) || 24, n = Number(t.fps) || r, c = n > 0 ? r / n : 1, l = R(e.state), s = e.state.cameras.length, m = ge(e.state, a || "Extracted Camera"), i = k[s % k.length], h = o.map((f) => ({
    ...f,
    frame: Math.round((Number(f.frame) || 0) * c),
    camera: _(f.camera)
  }));
  if (e.state.cameras.push({ id: l, name: m, color: i, camera: _(h[0].camera), keyframes: h }), Number.isFinite(Number(t.duration_frames))) {
    const f = Math.round(Number(t.duration_frames) * c);
    e.state.duration_frames = Math.max(e.state.duration_frames || 1, f);
  }
  return t?.metadata?.solve_health_v1 && (e.state.metadata = { ...e.state.metadata, solve_health_v1: t.metadata.solve_health_v1 }), e.cameraPreviewSignature = "", e.activateCamera(l), l;
}
function Je(e) {
  const t = O(e.state);
  for (const a of e.root.querySelectorAll('[data-role="playblast-camera"]')) {
    a.innerHTML = "";
    for (const r of e.state.cameras) {
      const n = document.createElement("option");
      n.value = r.id, n.textContent = r.name, a.appendChild(n);
    }
    const o = document.createElement("option");
    o.value = T, o.textContent = t.length ? p("Sequence ({count} shots)").replace("{count}", String(t.length)) : p("Sequence (no shots yet)"), o.disabled = t.length === 0, a.appendChild(o), a.value = e.state.playblast_camera_id;
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
function ve(e) {
  const t = e.state.cameras, a = t.filter((r) => r.solo), o = a.length ? a : t.filter((r) => !r.muted);
  return o.length ? o : t;
}
const P = 6;
function be(e) {
  const t = ve(e);
  if (t.length <= P) return { tracks: t, overflow: 0 };
  const a = new Set([e.state.playblast_camera_id, e.state.active_camera_id].filter(Boolean)), o = t.filter((c) => a.has(c.id)), r = t.filter((c) => !a.has(c.id)), n = [...o, ...r].slice(0, P);
  return { tracks: n, overflow: t.length - n.length };
}
function Q(e) {
  const t = e.root.querySelector('[data-role="camera-previews"]');
  if (!t) return;
  const a = e.state.preview_layout || "auto";
  t.dataset.layout !== (a === "auto" ? "" : a) && (t.dataset.layout = a === "auto" ? "" : a);
  const o = `${Math.max(1, e.state.width || 16)} / ${Math.max(1, e.state.height || 9)}`, r = t.style.getPropertyValue("--shot-aspect") !== o;
  r && t.style.setProperty("--shot-aspect", o);
  const n = e.root.querySelector('[data-role="camera-view-row"]');
  n && n.classList.toggle("maximized", !!e.state.maximized_camera_id);
  const { tracks: c, overflow: l } = be(e), s = `${c.map((i) => `${i.id}:${i.name}:${i.muted ? 1 : 0}:${i.solo ? 1 : 0}:${i.color || ""}`).join("|")}#${l}`;
  let m = !1;
  if (s !== e.cameraPreviewSignature && (m = !0, e.cameraPreviewSignature = s, t.innerHTML = "", e.cameraPreviewCanvases.clear(), e.cameraPreviewContexts.clear(), c.forEach((i, h) => {
    const f = document.createElement("div");
    f.className = "camera-preview-tile", f.dataset.cameraId = i.id;
    const x = i.color || k[h % k.length];
    f.style.setProperty("--camera-color", x), f.title = p("Click: set {value1} as primary · Double-click: edit · Right-click: preview actions", { value1: i.name });
    const g = document.createElement("div");
    g.className = "camera-preview-head";
    const v = document.createElement("i");
    v.className = "pi pi-video";
    const d = document.createElement("span");
    d.textContent = i.name;
    const b = document.createElement("span");
    b.dataset.cameraFrame = i.id, b.textContent = `F${e.frame}`;
    const u = document.createElement("i");
    u.className = "pi pi-circle-fill output-mark", u.title = p("Playblast camera");
    const j = document.createElement("canvas");
    j.dataset.cameraPreview = i.id;
    const S = document.createElement("span");
    S.className = "camera-view-badge", S.textContent = p("CAMERA PREVIEW"), g.append(v, d, b, u), f.append(j, g, S), t.appendChild(f), f.addEventListener("click", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = setTimeout(() => e.setPlayblastCamera(i.id), 220);
    }), f.addEventListener("dblclick", () => {
      clearTimeout(e.previewClickTimer), e.previewClickTimer = null, e.activateCamera(i.id);
    }), f.addEventListener("auxclick", (y) => {
      y.button === 1 && (y.preventDefault(), ye(e, i.id));
    }), e.cameraPreviewCanvases.set(i.id, j), e.cameraPreviewContexts.set(i.id, j.getContext("2d", { alpha: !1 }));
  }), l > 0)) {
    const i = document.createElement("div");
    i.className = "camera-preview-tile camera-preview-overflow", i.textContent = p("+{count} more").replace("{count}", String(l)), i.title = p("Mute or solo cameras to change which previews show here"), t.appendChild(i);
  }
  for (const i of t.querySelectorAll(".camera-preview-tile"))
    i.classList.toggle("playblast", i.dataset.cameraId === e.state.playblast_camera_id), i.classList.toggle("active", i.dataset.cameraId === e.state.active_camera_id), i.classList.toggle("maximized", i.dataset.cameraId === e.state.maximized_camera_id);
  for (const i of t.querySelectorAll(".output-mark")) i.hidden = i.closest(".camera-preview-tile")?.dataset.cameraId !== e.state.playblast_camera_id;
  (m || r) && requestAnimationFrame(() => {
    e.root.isConnected && (e.resizeCanvas(), e.renderCameraView());
  });
}
function Xe(e) {
  e.checkpoint("Add camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const t = R(e.state), a = e.state.cameras.length, o = `Camera ${a + 1}`, r = _(e.camera), n = [
    (r.target?.[0] ?? 0) - (r.position?.[0] ?? 0),
    (r.target?.[1] ?? 0) - (r.position?.[1] ?? 0),
    (r.target?.[2] ?? -1) - (r.position?.[2] ?? 0)
  ], c = Math.hypot(...n) || 1;
  r.position = [0, 0, 0], r.target = n.map((m) => m / c);
  const l = k[a % k.length], s = e.root.querySelector('[data-role="key-interp"]')?.value || e.root.querySelector('[data-role="interp"]')?.value || "ease";
  e.state.cameras.push({
    id: t,
    name: o,
    color: l,
    camera: r,
    keyframes: [{ frame: 0, camera: _(r), interpolation: s }]
  }), e.cameraPreviewSignature = "", e.activateCamera(t), e.setStatus(p("{value1} added", { value1: o }));
}
async function Ye(e, t) {
  const a = e.state.cameras.find((r) => r.id === t);
  if (!a) return;
  const o = (await re(e.app, p("Rename camera"), p("Camera name"), a.name))?.trim();
  !o || o === a.name || (e.checkpoint("Rename camera"), a.name = o.slice(0, 80), e.cameraPreviewSignature = "", e.serialize(), e.refreshObjects(), e.refreshKeys(), e.setStatus(p("Camera renamed: {value1}", { value1: a.name })));
}
function Qe(e, t) {
  const a = e.state.cameras.find((n) => n.id === t);
  if (!a) return;
  e.checkpoint("Duplicate camera"), e.finishCameraEdit(), e.syncActiveCameraTrack();
  const o = JSON.parse(JSON.stringify(a));
  o.id = R(e.state), o.name = `${a.name} Copy`;
  const r = e.state.cameras.length;
  if (o.color = k[r % k.length], o.camera?.position && (o.camera.position = [
    Math.round((o.camera.position[0] + 0.8) * 100) / 100,
    o.camera.position[1],
    Math.round((o.camera.position[2] + 0.8) * 100) / 100
  ]), o.keyframes)
    for (const n of o.keyframes)
      n.camera?.position && (n.camera.position = [
        Math.round((n.camera.position[0] + 0.8) * 100) / 100,
        n.camera.position[1],
        Math.round((n.camera.position[2] + 0.8) * 100) / 100
      ]);
  e.state.cameras.push(o), e.cameraPreviewSignature = "", e.activateCamera(o.id), e.setStatus(p("{value1} added", { value1: o.name }));
}
async function Ze(e, t) {
  if (e.state.cameras.length <= 1) return e.setStatus(p("At least one camera is required"));
  const a = e.state.cameras.find((r) => r.id === t);
  if (!a || !await ne(e.app, p("Delete camera"), p("Delete {value1} and its {value2} keyframe(s)?", { value1: a.name, value2: a.keyframes.length }))) return;
  e.checkpoint("Delete camera"), e.finishCameraEdit();
  const o = t === e.state.active_camera_id;
  if (e.state.cameras = e.state.cameras.filter((r) => r.id !== t), t === e.state.playblast_camera_id && (e.state.playblast_camera_id = e.state.cameras[0].id), e.cameraPreviewSignature = "", o) {
    const r = e.state.cameras[0];
    e.state.active_camera_id = r.id, e.state.keyframes = r.keyframes, e.state.camera = _(r.camera), e.camera = L(r, e.frame, e.state.objects), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = r.keyframes.find((n) => n.frame === e.frame)?.frame ?? null, e.selectedKeyFrames = e.selectedKeyFrame != null ? /* @__PURE__ */ new Set([e.selectedKeyFrame]) : /* @__PURE__ */ new Set(), e.editingKeyFrame = null;
  }
  e.pathSelection = D(e.pathSelection, e.activeCameraTrack()), e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(p("{value1} deleted", { value1: a.name }));
}
function Ue(e, t) {
  const a = e.state.cameras.find((o) => o.id === t);
  a && (e.finishCameraEdit(), e.syncActiveCameraTrack(), e.state.active_camera_id = a.id, e.state.keyframes = a.keyframes, e.state.camera = _(a.camera), e.camera = L(a, e.frame, e.state.objects), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedObjectIds = /* @__PURE__ */ new Set(), e.selectedKeyFrame = a.keyframes.find((o) => o.frame === e.frame)?.frame ?? null, e.selectedKeyFrames = e.selectedKeyFrame != null ? /* @__PURE__ */ new Set([e.selectedKeyFrame]) : /* @__PURE__ */ new Set(), e.pathSelection = D(e.pathSelection, a), e.editingKeyFrame = null, e.serialize(), e.refreshCameraSelectors(), e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(p("Camera: {value1}", { value1: a.name })));
}
function et(e, t) {
  const a = O(e.state), o = t === T && a.length > 0, r = o ? null : e.state.cameras.find((n) => n.id === t);
  !o && !r || (e.state.playblast_camera_id = o ? T : r.id, e.refreshCameraSelectors(), e.serialize(), e.refreshObjects(), e.renderCameraView(), e.setStatus(o ? p("Playblast: sequence ({count} shots)").replace("{count}", String(a.length)) : p("Playblast: {value1}", { value1: r.name })));
}
function tt(e) {
  e.state.camera_view_visible = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-role="camera-view-row"]')) t.hidden = !e.state.camera_view_visible;
  for (const t of e.root.querySelectorAll('[data-act="toggle-camera-view"]'))
    t.classList.toggle("active", e.state.camera_view_visible), t.setAttribute("aria-pressed", String(e.state.camera_view_visible));
  e.serialize(), e.state.camera_view_visible && requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(p("Camera previews {value1}", { value1: e.state.camera_view_visible ? "shown" : "hidden" }));
}
function ye(e, t) {
  e.state.maximized_camera_id = e.state.maximized_camera_id === t ? null : t, e.serialize(), Q(e), requestAnimationFrame(() => {
    e.resizeCanvas(), e.renderCameraView();
  }), e.setStatus(e.state.maximized_camera_id ? p("Preview maximized") : p("Preview restored"));
}
function at(e, t, a, o) {
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
  fe(t, e.state, a, o);
}
function ot(e, t) {
  const a = de(t);
  e.checkpoint(`Lens: ${t}mm`), e.beginCameraEdit(), e.camera.fov = a, e.commitCameraEdit(), e.finishCameraEdit();
  for (const o of e.root.querySelectorAll('[data-role="camera-fov"]')) o.value = String(a.toFixed(1));
  for (const o of e.root.querySelectorAll('[data-role="camera-focal"]')) o.value = pe(a);
  e.setStatus(`Lens: ${t}mm (FOV ${a.toFixed(1)}°)`);
}
function rt(e) {
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
function we(e, t) {
  const a = e?.reconstruction?.role || "";
  return a === "blockout_object" ? { locked: !1, visible: !0 } : a === "asset_proxy" ? { locked: !1, visible: !0 } : a === "room" || a === "reference" ? { locked: !0, visible: !(a === "reference" && String(t) === "blockout") } : { locked: !0, visible: !0 };
}
function ke(e) {
  return e?.reconstruction?.recon_mode || e?.motion_scene?.metadata?.reconstruction?.mode || e?.metadata?.reconstruction?.mode || "";
}
function q(e, t) {
  const a = e?.reconstruction?.role;
  if (!a) return e;
  const o = we(e, t);
  return (e.locked === void 0 || a === "room" || a === "reference") && (e.locked = o.locked), a === "reference" && (e.enabled = o.visible), e;
}
function Z(e) {
  return (e?.cameras || []).map((t, a) => {
    const o = (t?.track?.keyframes || t?.keyframes || []).map((n) => ({
      frame: Math.max(0, Math.round(Number(n?.frame || 0))),
      camera: n?.camera || n,
      interpolation: n?.interpolation || "hold"
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
function je(e) {
  const t = e?.canvas || {}, a = e?.timeline || {}, o = Math.max(1, Math.round(Number(a.authoring_fps || e?.fps || 24))), r = Number(a.duration_seconds || 0);
  return {
    ...e,
    width: Number(t.width || e?.width || 1280),
    height: Number(t.height || e?.height || 720),
    fps: o,
    duration_frames: r > 0 ? Math.max(1, Math.round(r * o)) : Number(e?.duration_frames || o * 5),
    cameras: Z(e)
  };
}
function F(e, t) {
  if (!e || !e.has(t)) return t;
  let a = 2;
  for (; e.has(`${t}_${a}`); )
    a += 1;
  return `${t}_${a}`;
}
function Se(e) {
  const t = e?.state;
  if (!t) return !0;
  if ((t.objects || []).length > 0) return !1;
  const o = t.cameras || [];
  return o.length <= 1 ? (o[0]?.keyframes || []).length <= 1 : !1;
}
function _e(e, t, a = {}) {
  const o = t?.motion_scene || t;
  if (!o || !Array.isArray(o.objects))
    throw new Error("Reconstruction result has no objects array");
  const r = a.mode || (Se(e) ? "replace" : "merge"), n = a.reconMode || ke(t);
  if (r === "replace") {
    e.checkpoint?.("Adopt reconstructed scene (replace)"), e.state = ee(
      je(JSON.parse(JSON.stringify(o)))
    ), e.camera = L(e.state, e.frame || 0);
    for (const c of e.state.objects || [])
      q(c, n), (c.type === "glb" || c.type === "model") && c.asset && e.modelUrlsById?.set(c.id, z(c.asset));
  } else {
    e.checkpoint?.("Merge reconstructed environment");
    const c = new Set((e.state.objects || []).map((i) => i.id)), l = new Set((e.state.cameras || []).map((i) => i.id)), s = /* @__PURE__ */ new Map(), m = o.objects.map((i) => JSON.parse(JSON.stringify(i)));
    for (const i of m) {
      const h = F(c, i.id);
      c.add(h), s.set(i.id, h), i.id = h;
    }
    for (const i of m)
      i.parent_id && s.has(i.parent_id) && (i.parent_id = s.get(i.parent_id)), q(i, n), e.state.objects.push(i), (i.type === "glb" || i.type === "model") && i.asset && e.modelUrlsById?.set(i.id, z(i.asset));
    for (const i of Z(o)) {
      const h = F(l, i.id);
      l.add(h), i.id = h, i.enabled = !1, e.state.cameras.push(i);
    }
  }
  e.serialize?.(), e.refreshObjects?.(), e.render?.(), e.setStatus?.("Adopted reconstructed scene into Director");
}
const Ce = "solved_scene";
function Ee(e) {
  return String(e?.comfyClass || e?.type || e?.constructor?.type || "");
}
function Ae(e) {
  const t = e?.node, a = t?.graph;
  if (!a) return null;
  for (const o of t.inputs || []) {
    if (String(o?.name || "").toLowerCase() !== Ce || o.link == null) continue;
    const r = oe(a, o.link);
    if (r && Ee(r) === te) return r;
  }
  return null;
}
function Ne(e) {
  return String(e?.state?.metadata?.[M]?.fingerprint || "");
}
function Te(e, t, a) {
  e.state.metadata = {
    ...e.state.metadata,
    [M]: {
      fingerprint: t,
      source: "omnicam_extractor",
      origin_node_id: String(a.id)
    }
  };
}
function I(e) {
  const t = e.root?.querySelector('[data-role="extractor-import-banner"]');
  if (!t) return;
  const a = e.pendingExtractorImport;
  if (t.hidden = !a, !a) return;
  const o = t.querySelector('[data-role="extractor-import-text"]');
  o && (o.textContent = p("{count} camera keys ready from {name} — import as a new camera?").replace("{count}", String(a.keyCount)).replace("{name}", a.label));
}
function nt(e) {
  const t = Ae(e), a = t ? le(t) : null;
  let o = !1;
  return a ? a.fingerprint !== Ne(e) && e.pendingExtractorImport?.fingerprint !== a.fingerprint && (e.pendingExtractorImport = {
    track: a.track,
    fingerprint: a.fingerprint,
    originNodeId: t.id,
    label: String(t.title || p("OmniCam Extractor")),
    keyCount: a.track.keyframes?.length || 0
  }, Te(e, a.fingerprint, t), o = !0) : e.pendingExtractorImport && (e.pendingExtractorImport = null, o = !0), I(e), o;
}
function it(e) {
  const t = e.pendingExtractorImport;
  return t ? (e.checkpoint("Import extracted camera"), xe(e, t.track, { label: t.label }), e.pendingExtractorImport = null, I(e), e.setStatus?.(p("Imported {count} camera keys from {name}").replace("{count}", String(t.keyCount)).replace("{name}", t.label)), e.scheduleSerialize(), e.render(), !0) : !1;
}
function st(e) {
  return e.pendingExtractorImport ? (e.pendingExtractorImport = null, I(e), e.render(), e.setStatus?.(p("Extracted camera preview dismissed")), !0) : !1;
}
function ct(e) {
  const t = e?.graph;
  if (!t) return 0;
  const a = e.outputs || [], o = /* @__PURE__ */ new Set();
  let r = 0;
  for (const n of a)
    for (const c of n?.links || []) {
      const l = $(t, c), s = l?.target_id ?? l?.targetId;
      if (!l || s == null || o.has(s)) continue;
      o.add(s);
      const m = t.getNodeById?.(s), i = m?.__majoorOmniCamDirectorRuntime?.workbench ?? m?.__majoorOmniCam;
      i?.syncUpstreamInputs && (i.syncUpstreamInputs(), r += 1);
    }
  return r;
}
function lt(e, t) {
  const a = e?.graph;
  if (!a) return 0;
  const o = e.outputs || [], r = /* @__PURE__ */ new Set();
  let n = 0;
  for (const c of o)
    for (const l of c?.links || []) {
      const s = $(a, l), m = s?.target_id ?? s?.targetId;
      if (!s || m == null || r.has(m)) continue;
      r.add(m);
      const i = a.getNodeById?.(m), h = i?.__majoorOmniCamDirectorRuntime ?? i?.__majoorOmniCam;
      h && (_e(h, t), n += 1);
    }
  return n;
}
const mt = `
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
`;
export {
  Pe as A,
  ze as B,
  k as C,
  Ie as D,
  Ue as E,
  A as F,
  Xe as G,
  Ze as H,
  at as I,
  Qe as J,
  ye as K,
  mt as L,
  Q as M,
  Je as N,
  Ye as O,
  et as P,
  tt as Q,
  He as R,
  E as S,
  H as a,
  le as b,
  ne as c,
  $e as d,
  ce as e,
  We as f,
  lt as g,
  Ve as h,
  re as i,
  pe as j,
  Ke as k,
  Ge as l,
  Fe as m,
  ct as n,
  de as o,
  De as p,
  it as q,
  Oe as r,
  Be as s,
  st as t,
  rt as u,
  ot as v,
  R as w,
  qe as x,
  nt as y,
  fe as z
};
