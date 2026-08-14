function m(i, e) {
  const n = { "add-camera": "Create a new animated camera from the current view", record: "Record the primary camera preview as a proxy playblast", "h3-setup": "Create and connect the H3 camera-motion reference nodes", "load-card": "Replace the subject card with an image or video", "add-card": "Create another image or video card", "load-model": "Import a local GLB, OBJ, FBX, STL, or PLY scene", "reset-camera": "Reset the active camera transform and lens", play: "Play or stop the timeline (Space)", key: "Insert or replace a key at the playhead (I)", "auto-key": "Record camera or object edits at the playhead", "delete-key": "Delete the selected keyframe (Delete)", "copy-key": "Copy the selected keyframe (Ctrl/Cmd+C)", "paste-key": "Paste a keyframe at the playhead (Ctrl/Cmd+V)", "previous-key": "Jump to the previous keyframe (,)", "next-key": "Jump to the next keyframe (.)", "previous-frame": "Move one frame backward (Left Arrow)", "next-frame": "Move one frame forward (Right Arrow)", "toggle-camera-view": "Show or hide the camera preview strip", "update-key": "Store the current camera view in the selected key", "view-key": "Load the selected key's camera view" };
  for (const t of i.querySelectorAll("button,select,input,summary")) {
    if (t.title) continue;
    const o = t.getAttribute("aria-label") || n[t.dataset?.act] || t.closest("label")?.querySelector("span")?.textContent?.trim() || t.closest("label")?.childNodes?.[0]?.textContent?.trim() || t.textContent?.trim();
    o && (t.title = o);
  }
  e.title = "Viewport: drag to orbit, Shift+drag to pan, wheel to dolly, WASD/QE to fly. Right-click for scene actions.", i.querySelector('[data-role="keys"]').title = "Timeline: click or drag to scrub. Drag a key to retime it. Right-click for key actions.";
}
class h {
  constructor(e) {
    this.root = e, this.menu = e.querySelector('[data-role="context-menu"]'), this.returnFocus = null;
  }
  hide({ restoreFocus: e = !1 } = {}) {
    this.menu.hidden = !0, e && this.returnFocus?.focus?.({ preventScroll: !0 });
  }
  show(e, n, t) {
    e.preventDefault(), e.stopPropagation(), this.returnFocus = document.activeElement, this.menu.innerHTML = "";
    const o = document.createElement("div");
    o.className = "context-menu-title", o.textContent = n, this.menu.appendChild(o);
    for (const r of t) {
      if (r === null) {
        const c = document.createElement("div");
        c.className = "context-menu-separator", this.menu.appendChild(c);
        continue;
      }
      const a = document.createElement("button");
      a.type = "button", a.setAttribute("role", "menuitem"), a.disabled = !!r.disabled, a.classList.toggle("danger", !!r.danger), a.title = r.help || r.label;
      const d = document.createElement("i");
      d.className = `pi ${r.icon || "pi-angle-right"}`;
      const u = document.createElement("span");
      if (u.textContent = r.label, a.append(d, u), r.shortcut) {
        const c = document.createElement("span");
        c.className = "shortcut", c.textContent = r.shortcut, a.appendChild(c);
      }
      a.addEventListener("click", () => {
        this.hide(), r.run?.();
      }, { once: !0 }), this.menu.appendChild(a);
    }
    this.menu.hidden = !1;
    const l = 8, s = this.menu.getBoundingClientRect();
    this.menu.style.left = `${Math.max(l, Math.min(e.clientX, window.innerWidth - s.width - l))}px`, this.menu.style.top = `${Math.max(l, Math.min(e.clientY, window.innerHeight - s.height - l))}px`, this.menu.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
  }
  onKey(e) {
    if (this.menu.hidden) return !1;
    const n = [...this.menu.querySelectorAll("button:not(:disabled)")], t = n.indexOf(document.activeElement);
    if (e.key === "Escape")
      return e.preventDefault(), this.hide({ restoreFocus: !0 }), !0;
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const o = e.key === "ArrowDown" ? 1 : -1;
      return n[(t + o + n.length) % n.length]?.focus(), !0;
    }
    return !1;
  }
}
async function p(i, e, n, t) {
  const o = i?.extensionManager?.dialog || window.app?.extensionManager?.dialog;
  return o?.prompt ? o.prompt({ title: e, message: n, defaultValue: t }) : window.prompt(n, t);
}
async function f(i, e, n) {
  const t = i?.extensionManager?.dialog || window.app?.extensionManager?.dialog;
  return t?.confirm ? t.confirm({ title: e, message: n }) : window.confirm(n);
}
export {
  h as ContextMenuController,
  f as confirmAction,
  m as initializeTooltips,
  p as promptText
};
