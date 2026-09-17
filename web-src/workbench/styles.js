// Shared CSS for the body-level OmniCam workbench overlay and the compact
// node shells. Kept independent of web-src/template/styles.js: those rules
// are scoped under .majoor-omnicam (the editor root), while these style the
// backdrop/window chrome that lives outside it, plus the tiny always-mounted
// shell shown on a closed node.

const WORKBENCH_STYLE_ID = "majoor-omnicam-workbench-styles";

export const WORKBENCH_STYLES = `
  .oc-workbench-backdrop{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(8,8,11,0.72);backdrop-filter:blur(2px)}
  .oc-workbench-window{display:flex;flex-direction:column;width:min(96vw,1920px);height:92vh;min-width:960px;min-height:640px;background:#161618;border:1px solid #383842;border-radius:10px;box-shadow:0 24px 64px rgba(0,0,0,0.6);overflow:hidden;outline:none}
  .oc-workbench-window.is-maximized{width:100vw;height:100vh;min-width:0;min-height:0;border-radius:0;border:none}
  .oc-workbench-header{display:flex;align-items:center;gap:10px;min-height:40px;padding:6px 10px;background:#1e1e24;border-bottom:1px solid #32323c;flex:none}
  .oc-workbench-title{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e2e2e8;font:600 13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  .oc-workbench-actions{display:flex;align-items:center;gap:4px;flex:none}
  .oc-workbench-actions button{display:inline-grid;place-items:center;width:28px;height:28px;padding:0;color:#9494a8;background:#23232c;border:1px solid #3c3c4a;border-radius:6px;cursor:pointer}
  .oc-workbench-actions button:hover{background:#31313e;border-color:#58586c;color:#fff}
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

  .oc-node-shell{display:flex;flex-direction:column;gap:6px;width:100%;height:100%;padding:8px 10px;box-sizing:border-box;font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#ddd;background:#161618;border-radius:8px}
  .oc-node-shell-title{font-weight:700;color:#e2e2e8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-meta{color:#9494a8;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .oc-node-shell-status{color:#c7ccd4;font-size:11px}
  .oc-node-shell-progress{position:relative;height:5px;border-radius:3px;background:#23232c;overflow:hidden;display:none}
  .oc-node-shell-progress[data-active="true"]{display:block}
  .oc-node-shell-progress>span{display:block;height:100%;background:var(--oc-accent,#7c8bf0);width:0%;transition:width .15s ease}
  .oc-node-shell-open{margin-top:auto;padding:6px 10px;border-radius:6px;background:var(--oc-accent,#7c8bf0);border:1px solid var(--oc-accent,#7c8bf0);color:#0b0d1a;font-weight:600;cursor:pointer}
  .oc-node-shell-open:hover{filter:brightness(1.08)}
`;

export function injectWorkbenchStyles(doc = document) {
  if (doc.getElementById(WORKBENCH_STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = WORKBENCH_STYLE_ID;
  style.textContent = WORKBENCH_STYLES;
  doc.head.append(style);
}
