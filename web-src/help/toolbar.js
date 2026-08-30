// The node selection-toolbar "?" button: shown for any OmniCam node that
// registered help (web-src/help/defs.js), next to LiteGraph's native node-info
// button, via ComfyUI's official getSelectionToolboxCommands hook. Also adds a
// right-click "Help" menu entry as a fallback path on the same nodes.

import { app } from "../comfy-runtime.js";
import { getNodeHelp, openHelpPopup } from "./schema.js";
import "./defs.js";

const HELP_CMD = "MajoorOmniCam.ShowHelp";
const HELP_ICON = "oc-help-toolbar-icon";
const CSS_ID = "oc-help-toolbar-css";
const BRAND = "#8b7bd8";

function injectIconCSS() {
  if (document.getElementById(CSS_ID)) return;
  const el = document.createElement("style");
  el.id = CSS_ID;
  el.textContent = `
    .${HELP_ICON}{display:inline-flex;align-items:center;justify-content:center;
      width:16px;height:16px;border-radius:50%;background:${BRAND};color:#fff;
      font-weight:700;font-size:11px;line-height:1}
    .${HELP_ICON}::before{content:"?"}
  `;
  document.head.appendChild(el);
}

function selectedNodes() {
  const canvas = app.canvas;
  if (!canvas) return [];
  const nodes = [];
  if (canvas.selected_nodes) nodes.push(...Object.values(canvas.selected_nodes));
  if (canvas.selectedItems) {
    for (const item of canvas.selectedItems) {
      if (item && item.comfyClass) nodes.push(item);
    }
  }
  return nodes;
}

function firstHelp() {
  for (const node of selectedNodes()) {
    const help = getNodeHelp(node.comfyClass);
    if (help) return help;
  }
  return null;
}

app.registerExtension({
  name: "MajoorOmniCam.HelpToolbar",

  commands: [
    {
      id: HELP_CMD,
      label: "Help",
      icon: HELP_ICON,
      function: () => {
        const help = firstHelp();
        if (help) openHelpPopup(help);
      },
    },
  ],

  // ComfyUI calls this for every extension with the selected canvas item and
  // unions the returned command ids to render in the floating selection
  // toolbar. Never called on older frontends -> the command is registered but
  // simply never shown (harmless).
  getSelectionToolboxCommands(item) {
    const cls = item && item.comfyClass;
    return cls && getNodeHelp(cls) ? [HELP_CMD] : [];
  },

  // Right-click fallback so help is reachable even without the selection
  // toolbar hook.
  getNodeMenuItems(node) {
    const help = getNodeHelp(node?.comfyClass);
    return help ? [null, { content: "? Help", callback: () => openHelpPopup(help) }] : [];
  },

  setup() {
    injectIconCSS();
  },
});
