function f(o, e) {
  const t = { "add-camera": "Create a new animated camera from the current view", record: "Record the primary camera preview as a proxy playblast", "h3-setup": "Create and connect the H3 camera-motion reference nodes", "load-card": "Replace the subject card with an image or video", "add-card": "Create another image or video card", "load-model": "Import a local GLB, OBJ, FBX, STL, or PLY scene", "reset-camera": "Reset the active camera transform and lens", play: "Play or stop the timeline (Space)", key: "Insert or replace a key at the playhead (I)", "auto-key": "Record camera or object edits at the playhead", "delete-key": "Delete the selected keyframe (Delete)", "copy-key": "Copy the selected keyframe (Ctrl/Cmd+C)", "paste-key": "Paste a keyframe at the playhead (Ctrl/Cmd+V)", "previous-key": "Jump to the previous keyframe (,)", "next-key": "Jump to the next keyframe (.)", "previous-frame": "Move one frame backward (Left Arrow)", "next-frame": "Move one frame forward (Right Arrow)", "toggle-camera-view": "Show or hide the camera preview strip", "update-key": "Store the current camera view in the selected key", "view-key": "Load the selected key's camera view" };
  for (const n of o.querySelectorAll("button,select,input,summary")) {
    if (n.title) continue;
    const i = n.getAttribute("aria-label") || t[n.dataset?.act] || n.closest("label")?.querySelector("span")?.textContent?.trim() || n.closest("label")?.childNodes?.[0]?.textContent?.trim() || n.textContent?.trim();
    i && (n.title = i);
  }
  e.title = "Viewport: drag to orbit, Shift+drag to pan, wheel to dolly, WASD/QE to fly. Right-click for scene actions.", o.querySelector('[data-role="keys"]').title = "Timeline: click or drag to scrub. Drag a key to retime it. Right-click for key actions.";
}
class y {
  constructor(e) {
    this.root = e, this.menu = e.querySelector('[data-role="context-menu"]'), this.returnFocus = null, this.dismissHandler = null, this.dismissTimer = null, this.disposed = !1, this.menu && (this.menu.classList.add("majoor-omnicam"), this.menu.addEventListener("pointerdown", (t) => t.stopPropagation()), this.menu.addEventListener("mousedown", (t) => t.stopPropagation()), this.menu.addEventListener("click", (t) => t.stopPropagation()), this.menu.addEventListener("contextmenu", (t) => {
      t.preventDefault(), t.stopPropagation();
    }), this.menu.addEventListener("keydown", (t) => this.onKey(t)));
  }
  hide({ restoreFocus: e = !1 } = {}) {
    this.dismissTimer !== null && (clearTimeout(this.dismissTimer), this.dismissTimer = null), this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0), this.dismissHandler = null), this.menu && (this.menu.hidden = !0, e && this.returnFocus?.focus?.({ preventScroll: !0 }));
  }
  show(e, t, n) {
    if (!this.menu || this.disposed) return;
    e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.(), this.returnFocus = document.activeElement, this.menu.parentElement !== document.body && document.body.appendChild(this.menu), this.menu.classList.add("majoor-omnicam"), this.menu.innerHTML = "";
    const i = document.createElement("div");
    i.className = "context-menu-title", i.textContent = t, this.menu.appendChild(i);
    for (const s of n) {
      if (s === null) {
        const r = document.createElement("div");
        r.className = "context-menu-separator", this.menu.appendChild(r);
        continue;
      }
      const d = document.createElement("button");
      d.type = "button", d.setAttribute("role", "menuitem"), d.disabled = !!s.disabled, d.classList.toggle("danger", !!s.danger), d.title = s.help || s.label;
      const u = document.createElement("i");
      u.className = `pi ${s.icon || "pi-angle-right"}`;
      const h = document.createElement("span");
      if (h.textContent = s.label, d.append(u, h), s.shortcut) {
        const r = document.createElement("span");
        r.className = "shortcut", r.textContent = s.shortcut, d.appendChild(r);
      }
      d.addEventListener("pointerdown", (r) => r.stopPropagation()), d.addEventListener("mousedown", (r) => r.stopPropagation()), d.addEventListener("click", (r) => {
        r.preventDefault(), r.stopPropagation(), this.hide();
        try {
          s.run?.();
        } catch (p) {
          console.error("Context menu action failed:", p);
        }
      }), this.menu.appendChild(d);
    }
    this.menu.hidden = !1;
    const a = 8, l = this.menu.getBoundingClientRect(), m = Math.max(a, Math.min(e.clientX, window.innerWidth - l.width - a)), c = Math.max(a, Math.min(e.clientY, window.innerHeight - l.height - a));
    this.menu.style.left = `${m}px`, this.menu.style.top = `${c}px`, this.menu.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 }), this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0)), this.dismissHandler = (s) => {
      s.target && this.menu.contains(s.target) || this.hide();
    }, this.dismissTimer = setTimeout(() => {
      this.dismissTimer = null, !this.disposed && (document.addEventListener("pointerdown", this.dismissHandler, !0), document.addEventListener("contextmenu", this.dismissHandler, !0));
    }, 0);
  }
  dispose() {
    this.disposed || (this.hide(), this.disposed = !0, this.menu?.remove(), this.menu = null);
  }
  onKey(e) {
    if (!this.menu || this.menu.hidden) return !1;
    const t = [...this.menu.querySelectorAll("button:not(:disabled)")], n = t.indexOf(document.activeElement);
    if (e.key === "Escape")
      return e.preventDefault(), this.hide({ restoreFocus: !0 }), !0;
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const i = e.key === "ArrowDown" ? 1 : -1;
      return t[(n + i + t.length) % t.length]?.focus(), !0;
    }
    return !1;
  }
}
async function w(o, e, t, n) {
  let i, a, l, m;
  typeof o == "object" && o !== null ? (i = o, a = e, l = t, m = n) : (i = typeof window < "u" ? window.app : null, a = o, l = e, m = t);
  const c = i?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return c?.prompt ? c.prompt({ title: a, message: l, defaultValue: m }) : (console.warn("OmniCam prompt unavailable: ComfyUI dialog API is not present"), null);
}
async function g(o, e, t) {
  let n, i, a;
  typeof o == "object" && o !== null ? (n = o, i = e, a = t) : (n = typeof window < "u" ? window.app : null, i = o, a = e);
  const l = n?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return l?.confirm ? l.confirm({ title: i, message: a }) : (console.warn("OmniCam confirmation unavailable: ComfyUI dialog API is not present"), !1);
}
export {
  y as ContextMenuController,
  g as confirmAction,
  f as initializeTooltips,
  w as promptText
};
