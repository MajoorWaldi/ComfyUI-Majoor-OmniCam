// Shared CSS for the body-level OmniCam workbench overlay and the compact
// node shells. Kept independent of web-src/template/styles.js: those rules
// are scoped under .majoor-omnicam (the editor root), while these style the
// backdrop/window chrome that lives outside it, plus the tiny always-mounted
// shell shown on a closed node.

import { TOKENS } from "../shared/tokens.js";
import { HOST_THEME_VARS } from "../shared/host-theme.js";

const WORKBENCH_STYLE_ID = "majoor-omnicam-workbench-styles";

export const WORKBENCH_STYLES = `
  .oc-workbench-backdrop,.oc-node-shell{${HOST_THEME_VARS}}
  .oc-workbench-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,12,0.92)}
  .oc-workbench-window{display:flex;flex-direction:column;width:min(96vw,1920px);height:92dvh;min-width:0;min-height:0;max-width:100vw;max-height:100dvh;background:var(--oc-bg-app);border:1px solid var(--oc-border-default);border-radius:8px;box-shadow:0 24px 64px rgba(0,0,0,0.7);overflow:hidden;outline:none}
  .oc-workbench-window.is-maximized{width:100vw;height:100vh;min-width:0;min-height:0;border-radius:0;border:none}
  .oc-workbench-header{display:flex;align-items:center;gap:10px;min-height:40px;padding:6px 12px;background:var(--oc-bg-panel);border-bottom:1px solid var(--oc-border-default);flex:none}
  .oc-workbench-title{display:flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0;overflow:hidden;color:var(--oc-text-primary);font:600 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .oc-workbench-title-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-workbench-dirty-dot{flex:none;width:7px;height:7px;border-radius:50%;background:${TOKENS.warning}}
  .oc-workbench-actions{display:flex;align-items:center;gap:6px;flex:none}
  .oc-workbench-actions button{display:inline-grid;place-items:center;width:28px;height:28px;padding:0;color:var(--oc-text-secondary);background:var(--oc-bg-control);border:1px solid var(--oc-border-default);border-radius:6px;cursor:pointer;transition:all .15s ease}
  .oc-workbench-actions button:hover{background:var(--oc-bg-control);border-color:${TOKENS.accent};color:var(--oc-text-primary)}
  .oc-workbench-actions button:focus-visible{outline:2px solid ${TOKENS.accent};outline-offset:2px}
  /* auto, not hidden: the embedded editor's natural content height (built for
     a graph node that grows to fit it) can exceed a modest 92vh window on a
     short viewport. Clipping it with overflow:hidden would silently strand
     bottom controls (e.g. the sequence lane) outside the hit-testable area
     instead of just requiring a scroll to reach them. */
  .oc-workbench-content{position:relative;flex:1 1 auto;min-height:0;overflow:auto}
  .oc-workbench-content>*{width:100%;height:100%}
  /* Director's own root (.majoor-omnicam.oc-director, template.js/shell.js)
     is now a bounded flex column that fits this box on its own -- .oc-dock
     scrolls internally instead. Scoped by the host's own data-kind attribute
     (host.js) so Extractor/Monitor keep the overflow:auto fallback above,
     since their content still grows to fit the old always-mounted-node way. */
  .oc-workbench-backdrop[data-kind="director"] .oc-workbench-content{overflow:hidden}
  .oc-workbench-backdrop[data-kind="extractor"] .oc-workbench-content{overflow:hidden}
  .oc-workbench-backdrop[data-kind="monitor"] .oc-workbench-content{overflow:auto}

  .oc-node-shell{position:relative;display:flex;flex-direction:column;gap:6px;width:100%;height:100%;padding:8px 10px;box-sizing:border-box;font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--oc-text-secondary);background:var(--oc-bg-panel);border:1px solid var(--oc-border-default);border-radius:8px;overflow:hidden}
  .oc-node-shell-preview{display:none;position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;border-radius:7px;pointer-events:none}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-preview{display:block}
  /* Dark scrim behind the text/controls only when a preview image is showing
     underneath them -- a flat rgba(0,0,0,..) gradient, not a semantic token,
     since it exists purely to keep white text legible over an arbitrary
     photo and has no light/dark-theme variant of its own. Explicit z-index
     stack (image 0, scrim 1, text/controls 2) rather than relying on DOM
     order, since ::before would otherwise paint before -- i.e. under -- the
     real <img> sibling that follows it. */
  .oc-node-shell[data-has-preview="true"]::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.35) 55%,rgba(0,0,0,0.72) 100%);border-radius:7px;pointer-events:none}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-title,
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-meta,
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-status{position:relative;z-index:2;color:#fff}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-open{position:relative;z-index:2}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-progress{z-index:2}
  .oc-node-shell-version{position:absolute;top:6px;right:8px;z-index:2;font-size:9px;color:var(--oc-text-muted);pointer-events:none}
  .oc-node-shell[data-has-preview="true"] .oc-node-shell-version{color:rgba(255,255,255,.65)}
  .oc-node-shell-title{display:flex;align-items:center;gap:5px;font-weight:700;color:var(--oc-text-primary);overflow:hidden}
  .oc-node-shell-title-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-dirty-dot{flex:none;width:6px;height:6px;border-radius:50%;background:${TOKENS.warning}}
  .oc-node-shell-meta{color:var(--oc-text-secondary);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-status{color:var(--oc-text-secondary);font-size:11px}
  .oc-node-shell-progress{position:relative;height:5px;border-radius:3px;background:var(--oc-bg-control);border:1px solid var(--oc-border-default);overflow:hidden;display:none}
  .oc-node-shell-progress[data-active="true"]{display:block}
  .oc-node-shell-progress>span{display:block;height:100%;background:${TOKENS.accent};width:0%;transition:width .15s ease}
  .oc-node-shell-open{margin-top:auto;padding:6px 10px;border-radius:6px;background:${TOKENS.accent};border:1px solid ${TOKENS.accent};color:#fff;font-weight:600;cursor:pointer;transition:filter .15s ease}
  .oc-node-shell-open:hover{filter:brightness(1.12)}
  .oc-node-shell-open:focus-visible{outline:2px solid ${TOKENS.accent};outline-offset:2px}
`;

export function injectWorkbenchStyles(doc = document) {
  if (doc.getElementById(WORKBENCH_STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = WORKBENCH_STYLE_ID;
  style.textContent = WORKBENCH_STYLES;
  doc.head.append(style);
}
