function f(r, e) {
  const t = { "add-camera": "Create a new animated camera from the current view", record: "Record the primary camera preview as a proxy playblast", "h3-setup": "Create and connect the H3 camera-motion reference nodes", "load-card": "Replace the subject card with an image or video", "add-card": "Create another image or video card", "load-model": "Import a local GLB, OBJ, FBX, STL, or PLY scene", "reset-camera": "Reset the active camera transform and lens", play: "Play or stop the timeline (Space)", key: "Insert or replace a key at the playhead (I)", "auto-key": "Record camera or object edits at the playhead", "delete-key": "Delete the selected keyframe (Delete)", "copy-key": "Copy the selected keyframe (Ctrl/Cmd+C)", "paste-key": "Paste a keyframe at the playhead (Ctrl/Cmd+V)", "previous-key": "Jump to the previous keyframe (,)", "next-key": "Jump to the next keyframe (.)", "previous-frame": "Move one frame backward (Left Arrow)", "next-frame": "Move one frame forward (Right Arrow)", "toggle-camera-view": "Show or hide the camera preview strip", "update-key": "Store the current camera view in the selected key", "view-key": "Load the selected key's camera view" };
  for (const n of r.querySelectorAll("button,select,input,summary")) {
    if (n.title) continue;
    const o = n.getAttribute("aria-label") || t[n.dataset?.act] || n.closest("label")?.querySelector("span")?.textContent?.trim() || n.closest("label")?.childNodes?.[0]?.textContent?.trim() || n.textContent?.trim();
    o && (n.title = o);
  }
  e.title = "Viewport: drag to orbit, Shift+drag to pan, wheel to dolly, WASD/QE to fly. Right-click for scene actions.", r.querySelector('[data-role="keys"]').title = "Timeline: click or drag to scrub. Drag a key to retime it. Right-click for key actions.";
}
class y {
  constructor(e) {
    this.root = e, this.menu = e.querySelector('[data-role="context-menu"]'), this.returnFocus = null, this.dismissHandler = null, this.menu && (this.menu.classList.add("majoor-omnicam"), this.menu.addEventListener("pointerdown", (t) => t.stopPropagation()), this.menu.addEventListener("mousedown", (t) => t.stopPropagation()), this.menu.addEventListener("click", (t) => t.stopPropagation()), this.menu.addEventListener("contextmenu", (t) => {
      t.preventDefault(), t.stopPropagation();
    }));
  }
  hide({ restoreFocus: e = !1 } = {}) {
    this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0), this.dismissHandler = null), this.menu && (this.menu.hidden = !0, e && this.returnFocus?.focus?.({ preventScroll: !0 }));
  }
  show(e, t, n) {
    if (!this.menu) return;
    e.preventDefault(), e.stopPropagation(), this.returnFocus = document.activeElement, this.menu.parentElement !== document.body && document.body.appendChild(this.menu), this.menu.classList.add("majoor-omnicam"), this.menu.innerHTML = "";
    const o = document.createElement("div");
    o.className = "context-menu-title", o.textContent = t, this.menu.appendChild(o);
    for (const a of n) {
      if (a === null) {
        const s = document.createElement("div");
        s.className = "context-menu-separator", this.menu.appendChild(s);
        continue;
      }
      const d = document.createElement("button");
      d.type = "button", d.setAttribute("role", "menuitem"), d.disabled = !!a.disabled, d.classList.toggle("danger", !!a.danger), d.title = a.help || a.label;
      const m = document.createElement("i");
      m.className = `pi ${a.icon || "pi-angle-right"}`;
      const h = document.createElement("span");
      if (h.textContent = a.label, d.append(m, h), a.shortcut) {
        const s = document.createElement("span");
        s.className = "shortcut", s.textContent = a.shortcut, d.appendChild(s);
      }
      d.addEventListener("pointerdown", (s) => s.stopPropagation()), d.addEventListener("mousedown", (s) => s.stopPropagation()), d.addEventListener("click", (s) => {
        s.preventDefault(), s.stopPropagation(), this.hide();
        try {
          a.run?.();
        } catch (p) {
          console.error("Context menu action failed:", p);
        }
      }), this.menu.appendChild(d);
    }
    this.menu.hidden = !1;
    const i = 8, l = this.menu.getBoundingClientRect(), c = Math.max(i, Math.min(e.clientX, window.innerWidth - l.width - i)), u = Math.max(i, Math.min(e.clientY, window.innerHeight - l.height - i));
    this.menu.style.left = `${c}px`, this.menu.style.top = `${u}px`, this.menu.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 }), this.dismissHandler && (document.removeEventListener("pointerdown", this.dismissHandler, !0), document.removeEventListener("contextmenu", this.dismissHandler, !0)), this.dismissHandler = (a) => {
      a.target && this.menu.contains(a.target) || this.hide();
    }, setTimeout(() => {
      document.addEventListener("pointerdown", this.dismissHandler, !0), document.addEventListener("contextmenu", this.dismissHandler, !0);
    }, 0);
  }
  onKey(e) {
    if (!this.menu || this.menu.hidden) return !1;
    const t = [...this.menu.querySelectorAll("button:not(:disabled)")], n = t.indexOf(document.activeElement);
    if (e.key === "Escape")
      return e.preventDefault(), this.hide({ restoreFocus: !0 }), !0;
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const o = e.key === "ArrowDown" ? 1 : -1;
      return t[(n + o + t.length) % t.length]?.focus(), !0;
    }
    return !1;
  }
}
async function w(r, e, t, n) {
  let o, i, l, c;
  typeof r == "object" && r !== null ? (o = r, i = e, l = t, c = n) : (o = typeof window < "u" ? window.app : null, i = r, l = e, c = t);
  const u = o?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return u?.prompt ? u.prompt({ title: i, message: l, defaultValue: c }) : typeof window < "u" ? window.prompt(l || i, c) : c;
}
async function g(r, e, t) {
  let n, o, i;
  typeof r == "object" && r !== null ? (n = r, o = e, i = t) : (n = typeof window < "u" ? window.app : null, o = r, i = e);
  const l = n?.extensionManager?.dialog || (typeof window < "u" ? window.app?.extensionManager?.dialog : null);
  return l?.confirm ? l.confirm({ title: o, message: i }) : typeof window < "u" ? window.confirm(i || o) : !0;
}
export {
  y as ContextMenuController,
  g as confirmAction,
  f as initializeTooltips,
  w as promptText
};
