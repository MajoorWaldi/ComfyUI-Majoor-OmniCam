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
    this.dismissTimer = null;
    this.disposed = false;
    if (this.menu) {
      this.menu.classList.add("majoor-omnicam");
      this.menu.addEventListener("pointerdown", (e) => e.stopPropagation());
      this.menu.addEventListener("mousedown", (e) => e.stopPropagation());
      this.menu.addEventListener("click", (e) => e.stopPropagation());
      this.menu.addEventListener("contextmenu", (e) => { e.preventDefault(); e.stopPropagation(); });
      this.menu.addEventListener("keydown", (e) => this.onKey(e));
    }
  }
  hide({ restoreFocus = false } = {}) {
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
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
    if (!this.menu || this.disposed) return;
    // A re-show before the previous deferred attach has fired would otherwise
    // leave that setTimeout live, re-adding the dismiss handler after hide().
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
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
    this.dismissTimer = setTimeout(() => {
      this.dismissTimer = null;
      if (this.disposed) return;
      document.addEventListener("pointerdown", this.dismissHandler, true);
      document.addEventListener("contextmenu", this.dismissHandler, true);
    }, 0);
  }
  dispose() {
    if (this.disposed) return;
    this.hide();
    this.disposed = true;
    this.menu?.remove();
    this.menu = null;
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


// -- self-contained modal ------------------------------------------------- //
// ComfyUI's dialog manager (app.extensionManager.dialog) is the preferred
// surface, but which build exposes it -- and under what shape -- has moved
// around, and behind our bundle `window.app` can resolve to the wrong
// instance. When the manager cannot be reached the confirm/prompt helpers used
// to just return "no", which is exactly what made the Extractor "Clear Cache"
// button look dead. This modal is our own DOM -- not a blocked browser modal
// API -- so the buttons always do something.

const ownedModals = new WeakMap();

export function closeOwnedModals(owner) {
  const items = ownedModals.get(owner);
  if (!items) return;
  for (const close of [...items]) close();
  ownedModals.delete(owner);
}

function omnicamModal({ title, message, withInput = false, defaultValue = "", owner = null }) {
  if (typeof document === "undefined" || !document.body) {
    return Promise.resolve(withInput ? null : false);
  }
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "majoor-omnicam oc-modal-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    Object.assign(backdrop.style, {
      position: "fixed", inset: "0", zIndex: "100000",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.55)",
    });

    const panel = document.createElement("div");
    panel.className = "oc-modal";
    Object.assign(panel.style, {
      maxWidth: "min(440px, 92vw)", padding: "18px 20px", borderRadius: "10px",
      background: "var(--oc-panel, #1e1f26)", color: "var(--oc-text, #e8e8ec)",
      border: "1px solid var(--oc-line, #34363f)",
      boxShadow: "0 12px 48px rgba(0,0,0,0.5)", font: "13px/1.5 system-ui, sans-serif",
    });

    const heading = document.createElement("h3");
    heading.textContent = title || "";
    Object.assign(heading.style, { margin: "0 0 8px", fontSize: "14px" });

    const body = document.createElement("p");
    body.textContent = message || "";
    Object.assign(body.style, { margin: "0 0 14px", opacity: "0.85" });

    let input = null;
    if (withInput) {
      input = document.createElement("input");
      input.type = "text";
      input.value = defaultValue == null ? "" : String(defaultValue);
      Object.assign(input.style, {
        width: "100%", boxSizing: "border-box", marginBottom: "14px", padding: "6px 8px",
        background: "var(--oc-sunken, #16171c)", color: "inherit",
        border: "1px solid var(--oc-line, #34363f)", borderRadius: "6px",
      });
    }

    const row = document.createElement("div");
    Object.assign(row.style, { display: "flex", gap: "8px", justifyContent: "flex-end" });
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    const okBtn = document.createElement("button");
    okBtn.type = "button";
    okBtn.textContent = "OK";
    for (const b of [cancelBtn, okBtn]) {
      Object.assign(b.style, {
        padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
        border: "1px solid var(--oc-line, #34363f)", background: "transparent", color: "inherit",
      });
    }
    okBtn.style.background = "var(--oc-accent, #4c6ef5)";
    okBtn.style.borderColor = "transparent";
    okBtn.style.color = "#fff";
    row.append(cancelBtn, okBtn);

    panel.append(heading, body);
    if (input) panel.append(input);
    panel.append(row);
    backdrop.append(panel);

    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      document.removeEventListener("keydown", onKey, true);
      if (owner && typeof owner === "object") ownedModals.get(owner)?.delete(finishCancel);
      backdrop.remove();
      resolve(value);
    };
    const finishCancel = () => finish(withInput ? null : false);
    if (owner && typeof owner === "object") {
      let items = ownedModals.get(owner);
      if (!items) ownedModals.set(owner, items = new Set());
      items.add(finishCancel);
    }
    const onKey = (event) => {
      if (event.key === "Escape") { event.stopPropagation(); finish(withInput ? null : false); }
      else if (event.key === "Enter") { event.stopPropagation(); finish(withInput ? input.value : true); }
    };

    cancelBtn.addEventListener("click", () => finish(withInput ? null : false));
    okBtn.addEventListener("click", () => finish(withInput ? input.value : true));
    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) finish(withInput ? null : false);
    });
    document.addEventListener("keydown", onKey, true);

    document.body.appendChild(backdrop);
    (input || okBtn).focus();
  });
}

export async function promptText(appOrTitle, titleOrMessage, messageOrValue, initialValue) {
  let app, owner, title, message, defaultValue;
  if (typeof appOrTitle === "object" && appOrTitle !== null) {
    owner = appOrTitle;
    app = appOrTitle.extensionManager ? appOrTitle : appOrTitle.app;
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
  // ComfyUI's dialog manager could not be reached (wrong app instance behind
  // the bundle, or a build that does not expose it). Fall back to our own DOM
  // modal -- never a blocked browser modal API -- so the control still works.
  return omnicamModal({ title, message, withInput: true, defaultValue, owner });
}

export async function confirmAction(appOrTitle, titleOrMessage, messageText) {
  let app, owner, title, message;
  if (typeof appOrTitle === "object" && appOrTitle !== null) {
    owner = appOrTitle;
    app = appOrTitle.extensionManager ? appOrTitle : appOrTitle.app;
    title = titleOrMessage;
    message = messageText;
  } else {
    app = typeof window !== "undefined" ? window.app : null;
    title = appOrTitle;
    message = titleOrMessage;
  }
  const dialog = app?.extensionManager?.dialog || (typeof window !== "undefined" ? window.app?.extensionManager?.dialog : null);
  if (dialog?.confirm) return dialog.confirm({ title, message });
  // ComfyUI's dialog manager could not be reached (wrong app instance behind
  // the bundle, or a build that does not expose it). Fall back to our own DOM
  // modal -- never a blocked browser modal API -- so the button still works
  // instead of silently resolving "no" (this is what made "Clear Cache" look
  // dead).
  return omnicamModal({ title, message, withInput: false, owner });
}
