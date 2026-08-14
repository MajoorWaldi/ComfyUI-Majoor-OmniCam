export function initializeTooltips(root, interactionElement) {
  const actionHelp = { "add-camera": "Create a new animated camera from the current view", record: "Record the primary camera preview as a proxy playblast", "h3-setup": "Create and connect the H3 camera-motion reference nodes", "load-card": "Replace the subject card with an image or video", "add-card": "Create another image or video card", "load-model": "Import a local GLB, OBJ, FBX, STL, or PLY scene", "reset-camera": "Reset the active camera transform and lens", play: "Play or stop the timeline (Space)", key: "Insert or replace a key at the playhead (I)", "auto-key": "Record camera or object edits at the playhead", "delete-key": "Delete the selected keyframe (Delete)", "copy-key": "Copy the selected keyframe (Ctrl/Cmd+C)", "paste-key": "Paste a keyframe at the playhead (Ctrl/Cmd+V)", "previous-key": "Jump to the previous keyframe (,)", "next-key": "Jump to the next keyframe (.)", "previous-frame": "Move one frame backward (Left Arrow)", "next-frame": "Move one frame forward (Right Arrow)", "toggle-camera-view": "Show or hide the camera preview strip", "update-key": "Store the current camera view in the selected key", "view-key": "Load the selected key's camera view" };
  for (const element of root.querySelectorAll("button,select,input,summary")) { if (element.title) continue; const label = element.getAttribute("aria-label") || actionHelp[element.dataset?.act] || element.closest("label")?.querySelector("span")?.textContent?.trim() || element.closest("label")?.childNodes?.[0]?.textContent?.trim() || element.textContent?.trim(); if (label) element.title = label; }
  interactionElement.title = "Viewport: drag to orbit, Shift+drag to pan, wheel to dolly, WASD/QE to fly. Right-click for scene actions.";
  root.querySelector('[data-role="keys"]').title = "Timeline: click or drag to scrub. Drag a key to retime it. Right-click for key actions.";
}

export class ContextMenuController {
  constructor(root) { this.root = root; this.menu = root.querySelector('[data-role="context-menu"]'); this.returnFocus = null; }
  hide({ restoreFocus = false } = {}) { this.menu.hidden = true; if (restoreFocus) this.returnFocus?.focus?.({ preventScroll: true }); }
  show(event, title, actions) {
    event.preventDefault(); event.stopPropagation(); this.returnFocus = document.activeElement; this.menu.innerHTML = "";
    const heading = document.createElement("div"); heading.className = "context-menu-title"; heading.textContent = title; this.menu.appendChild(heading);
    for (const action of actions) { if (action === null) { const separator = document.createElement("div"); separator.className = "context-menu-separator"; this.menu.appendChild(separator); continue; } const button = document.createElement("button"); button.type = "button"; button.setAttribute("role", "menuitem"); button.disabled = Boolean(action.disabled); button.classList.toggle("danger", Boolean(action.danger)); button.title = action.help || action.label; const icon = document.createElement("i"); icon.className = `pi ${action.icon || "pi-angle-right"}`; const label = document.createElement("span"); label.textContent = action.label; button.append(icon, label); if (action.shortcut) { const shortcut = document.createElement("span"); shortcut.className = "shortcut"; shortcut.textContent = action.shortcut; button.appendChild(shortcut); } button.addEventListener("click", () => { this.hide(); action.run?.(); }, { once: true }); this.menu.appendChild(button); }
    this.menu.hidden = false; const margin = 8, rect = this.menu.getBoundingClientRect(); this.menu.style.left = `${Math.max(margin, Math.min(event.clientX, window.innerWidth - rect.width - margin))}px`; this.menu.style.top = `${Math.max(margin, Math.min(event.clientY, window.innerHeight - rect.height - margin))}px`; this.menu.querySelector("button:not(:disabled)")?.focus({ preventScroll: true });
  }
  onKey(event) { if (this.menu.hidden) return false; const buttons = [...this.menu.querySelectorAll("button:not(:disabled)")]; const index = buttons.indexOf(document.activeElement); if (event.key === "Escape") { event.preventDefault(); this.hide({ restoreFocus: true }); return true; } if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); const delta = event.key === "ArrowDown" ? 1 : -1; buttons[(index + delta + buttons.length) % buttons.length]?.focus(); return true; } return false; }
}

export async function promptText(app, title, message, initialValue) {
  const dialog = app?.extensionManager?.dialog || window.app?.extensionManager?.dialog;
  if (dialog?.prompt) return dialog.prompt({ title, message, defaultValue: initialValue });
  return window.prompt(message, initialValue);
}

export async function confirmAction(app, title, message) {
  const dialog = app?.extensionManager?.dialog || window.app?.extensionManager?.dialog;
  if (dialog?.confirm) return dialog.confirm({ title, message });
  return window.confirm(message);
}
