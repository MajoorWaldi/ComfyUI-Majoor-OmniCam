export function initializeTooltips(root, interactionElement) {
  const actionHelp = { "add-camera": "Create a new animated camera from the current view", record: "Record the primary camera preview as a proxy playblast", "h3-setup": "Create and connect the H3 camera-motion reference nodes", "load-card": "Replace the subject card with an image or video", "add-card": "Create another image or video card", "load-model": "Import a local GLB, OBJ, FBX, STL, or PLY scene", "reset-camera": "Reset the active camera transform and lens", play: "Play or stop the timeline (Space)", key: "Insert or replace a key at the playhead (I)", "auto-key": "Record camera or object edits at the playhead", "delete-key": "Delete the selected keyframe (Delete)", "copy-key": "Copy the selected keyframe (Ctrl/Cmd+C)", "paste-key": "Paste a keyframe at the playhead (Ctrl/Cmd+V)", "previous-key": "Jump to the previous keyframe (,)", "next-key": "Jump to the next keyframe (.)", "previous-frame": "Move one frame backward (Left Arrow)", "next-frame": "Move one frame forward (Right Arrow)", "toggle-camera-view": "Show or hide the camera preview strip", "update-key": "Store the current camera view in the selected key", "view-key": "Load the selected key's camera view" };
  for (const element of root.querySelectorAll("button,select,input,summary")) { if (element.title) continue; const label = element.getAttribute("aria-label") || actionHelp[element.dataset?.act] || element.closest("label")?.querySelector("span")?.textContent?.trim() || element.closest("label")?.childNodes?.[0]?.textContent?.trim() || element.textContent?.trim(); if (label) element.title = label; }
  interactionElement.title = "Viewport: drag to orbit, Shift+drag to pan, wheel to dolly, WASD/QE to fly. Right-click for scene actions.";
  root.querySelector('[data-role="keys"]').title = "Timeline: click or drag to scrub. Drag a key to retime it. Right-click for key actions.";
}

export class ContextMenuController {
  constructor(root) {
    this.root = root;
    this.menu = root.querySelector('[data-role="context-menu"]');
    this.returnFocus = null;
    this.dismissHandler = null;
    if (this.menu) {
      this.menu.classList.add("majoor-omnicam");
      this.menu.addEventListener("pointerdown", (e) => e.stopPropagation());
      this.menu.addEventListener("mousedown", (e) => e.stopPropagation());
      this.menu.addEventListener("click", (e) => e.stopPropagation());
      this.menu.addEventListener("contextmenu", (e) => { e.preventDefault(); e.stopPropagation(); });
    }
  }
  hide({ restoreFocus = false } = {}) {
    if (this.dismissHandler) {
      document.removeEventListener("pointerdown", this.dismissHandler, true);
      document.removeEventListener("contextmenu", this.dismissHandler, true);
      this.dismissHandler = null;
    }
    if (!this.menu) return;
    this.menu.hidden = true;
    if (restoreFocus) this.returnFocus?.focus?.({ preventScroll: true });
  }
  show(event, title, actions) {
    if (!this.menu) return;
    event.preventDefault();
    event.stopPropagation();
    this.returnFocus = document.activeElement;

    // Ensure menu is attached directly to document.body so that ComfyUI canvas transforms don't distort coordinates
    if (this.menu.parentElement !== document.body) {
      document.body.appendChild(this.menu);
    }
    this.menu.classList.add("majoor-omnicam");
    this.menu.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "context-menu-title";
    heading.textContent = title;
    this.menu.appendChild(heading);

    for (const action of actions) {
      if (action === null) {
        const separator = document.createElement("div");
        separator.className = "context-menu-separator";
        this.menu.appendChild(separator);
        continue;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "menuitem");
      button.disabled = Boolean(action.disabled);
      button.classList.toggle("danger", Boolean(action.danger));
      button.title = action.help || action.label;
      const icon = document.createElement("i");
      icon.className = `pi ${action.icon || "pi-angle-right"}`;
      const label = document.createElement("span");
      label.textContent = action.label;
      button.append(icon, label);
      if (action.shortcut) {
        const shortcut = document.createElement("span");
        shortcut.className = "shortcut";
        shortcut.textContent = action.shortcut;
        button.appendChild(shortcut);
      }
      button.addEventListener("pointerdown", (e) => e.stopPropagation());
      button.addEventListener("mousedown", (e) => e.stopPropagation());
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hide();
        try {
          action.run?.();
        } catch (err) {
          console.error("Context menu action failed:", err);
        }
      });
      this.menu.appendChild(button);
    }

    this.menu.hidden = false;
    const margin = 8;
    const rect = this.menu.getBoundingClientRect();
    const x = Math.max(margin, Math.min(event.clientX, window.innerWidth - rect.width - margin));
    const y = Math.max(margin, Math.min(event.clientY, window.innerHeight - rect.height - margin));
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
    this.menu.querySelector("button:not(:disabled)")?.focus({ preventScroll: true });

    if (this.dismissHandler) {
      document.removeEventListener("pointerdown", this.dismissHandler, true);
      document.removeEventListener("contextmenu", this.dismissHandler, true);
    }
    this.dismissHandler = (e) => {
      if (e.target && this.menu.contains(e.target)) return;
      this.hide();
    };
    setTimeout(() => {
      document.addEventListener("pointerdown", this.dismissHandler, true);
      document.addEventListener("contextmenu", this.dismissHandler, true);
    }, 0);
  }
  onKey(event) {
    if (!this.menu || this.menu.hidden) return false;
    const buttons = [...this.menu.querySelectorAll("button:not(:disabled)")];
    const index = buttons.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      this.hide({ restoreFocus: true });
      return true;
    }
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      buttons[(index + delta + buttons.length) % buttons.length]?.focus();
      return true;
    }
    return false;
  }
}


export async function promptText(appOrTitle, titleOrMessage, messageOrValue, initialValue) {
  let app, title, message, defaultValue;
  if (typeof appOrTitle === "object" && appOrTitle !== null) {
    app = appOrTitle;
    title = titleOrMessage;
    message = messageOrValue;
    defaultValue = initialValue;
  } else {
    app = typeof window !== "undefined" ? window.app : null;
    title = appOrTitle;
    message = titleOrMessage;
    defaultValue = messageOrValue;
  }
  const dialog = app?.extensionManager?.dialog || (typeof window !== "undefined" ? window.app?.extensionManager?.dialog : null);
  if (dialog?.prompt) return dialog.prompt({ title, message, defaultValue });
  return typeof window !== "undefined" ? window.prompt(message || title, defaultValue) : defaultValue;
}

export async function confirmAction(appOrTitle, titleOrMessage, messageText) {
  let app, title, message;
  if (typeof appOrTitle === "object" && appOrTitle !== null) {
    app = appOrTitle;
    title = titleOrMessage;
    message = messageText;
  } else {
    app = typeof window !== "undefined" ? window.app : null;
    title = appOrTitle;
    message = titleOrMessage;
  }
  const dialog = app?.extensionManager?.dialog || (typeof window !== "undefined" ? window.app?.extensionManager?.dialog : null);
  if (dialog?.confirm) return dialog.confirm({ title, message });
  return typeof window !== "undefined" ? window.confirm(message || title) : true;
}

