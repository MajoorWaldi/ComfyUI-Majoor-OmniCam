import { DIRECTOR_STYLES } from "./template/styles.js";
import { footerMarkup, headerMarkup } from "./template/header.js";
import { leftPanelMarkup } from "./template/left-panel.js";
import { sidePanelMarkup } from "./template/side-panel.js";
import { timelinePanelMarkup } from "./template/timeline-panel.js";
import { toolbarMarkup } from "./template/toolbar.js";
import { viewportMarkup } from "./template/viewport.js";
import { t } from "./i18n.js";

export { DIRECTOR_STYLES } from "./template/styles.js";

export function buildRoot() {
  const root = document.createElement("div");
  // "oc-director" scopes the bounded-modal layout rules (shell.js/lower-deck.js)
  // to Director specifically -- ".majoor-omnicam" alone is shared with
  // Extractor/Monitor's own templates, which must keep their current sizing.
  root.className = "majoor-omnicam oc-director";
  root.innerHTML = `
    <style>${DIRECTOR_STYLES}</style>
    ${headerMarkup()}
    ${toolbarMarkup()}
    <div class="oc-body">
      ${leftPanelMarkup()}
      <div class="oc-resize-h oc-left-resize" data-role="left-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${t("Drag to resize the scene panel — double-click to reset")}" aria-label="${t("Resize scene panel")}"></div>
      <div class="oc-stage">${viewportMarkup()}</div>
      <div class="oc-resize-h oc-side-resize" data-role="side-resize" role="separator" aria-orientation="vertical" tabindex="0"
           title="${t("Drag to resize the side panel — double-click to reset")}" aria-label="${t("Resize side panel")}"></div>
      ${sidePanelMarkup()}
    </div>
    <div class="oc-dock">
      ${timelinePanelMarkup()}
    </div>
    ${footerMarkup()}`;
  const contextMenu = document.createElement("div");
  contextMenu.className = "context-menu";
  contextMenu.dataset.role = "context-menu";
  contextMenu.setAttribute("role", "menu");
  contextMenu.hidden = true;
  root.appendChild(contextMenu);
  return root;
}
