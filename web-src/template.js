import { DIRECTOR_STYLES } from "./template/styles.js";
import { footerMarkup, headerMarkup } from "./template/header.js";
import { sidePanelMarkup } from "./template/side-panel.js";
import { timelinePanelMarkup } from "./template/timeline-panel.js";
import { toolbarMarkup } from "./template/toolbar.js";
import { viewportMarkup } from "./template/viewport.js";

export { DIRECTOR_STYLES } from "./template/styles.js";

export function buildRoot() {
  const root = document.createElement("div");
  root.className = "majoor-omnicam";
  root.innerHTML = `
    <style>${DIRECTOR_STYLES}</style>
    ${headerMarkup()}
    ${toolbarMarkup()}
    <div class="oc-body">
      <div class="oc-stage">${viewportMarkup()}</div>
      ${sidePanelMarkup()}
    </div>
    ${timelinePanelMarkup()}
    ${footerMarkup()}`;
  const contextMenu = document.createElement("div");
  contextMenu.className = "context-menu";
  contextMenu.dataset.role = "context-menu";
  contextMenu.setAttribute("role", "menu");
  contextMenu.hidden = true;
  root.appendChild(contextMenu);
  return root;
}
