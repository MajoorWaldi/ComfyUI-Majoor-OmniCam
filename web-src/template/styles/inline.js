// Compact layout of the Director while it is mounted inline in its node
// (`data-inline="true"` on the root, director/inline-view.js). Same editor,
// same DOM: this only hides the chrome a mini view does not need -- menus,
// side panels, camera preview strip, graph editor, dope-sheet channels --
// and keeps the viewport (navigation, path drawing, Look At, path display,
// Quick Camera angles) plus transport, key and auto-key over a single key row.
// OPEN DIRECTOR removes the attribute and the full layout returns as-is.

const I = '.majoor-omnicam.oc-director[data-inline="true"]';

export const INLINE_STYLES = `
      .majoor-omnicam .oc-inline-bar{display:none}
      ${I}>.oc-header,${I}>.top,${I}>.oc-footer,
      ${I} .oc-left,${I} .oc-side,${I} .oc-left-resize,${I} .oc-side-resize,
      ${I} .camera-view-row,${I} .oc-lower>.oc-resize-h,
      ${I} .oc-graph-head,${I} .oc-graph-toolbar,${I} .oc-graph-resize,${I} .oc-graph-legend,
      ${I} .oc-dope-labels,${I} .oc-dope-rows,${I} .motion-timeline,${I} .curve-canvas,${I} .oc-gsequence,
      ${I} .motion-tools,${I} .vp-floating-transport,${I} .vp-hint,${I} .viewport-quick-bar,${I} .viewport-inspector,
      ${I} .vp-corner,${I} [data-role=view-mode],
      ${I} .vp-tool[data-transform-mode=scale],${I} .vp-tool[data-act=toggle-gizmo-space],
      ${I} .vp-tool[data-act=toggle-spatial-snap],${I} .vp-tool[data-select-mode],${I} .vp-tool[data-act=toggle-inspector],
      ${I} .vp-rail-divider,
      ${I} [data-act=key-first],${I} [data-act=key-last],${I} [data-act=loop],${I} .oc-fps{display:none !important}
      ${I}{border-radius:8px}
      ${I}>.oc-body{display:flex;padding:0;gap:0}
      ${I} .oc-stage{flex:1 1 auto;min-width:0;min-height:0;padding:0}
      ${I} .viewport-wrap{min-height:0}
      ${I}>.oc-dock{flex:0 0 auto;max-height:none;overflow:visible}
      ${I} .oc-lower{display:block;padding:0 6px 6px}
      ${I} .oc-timeline{border:none}
      ${I} .oc-transport{gap:6px;padding:4px 0;min-height:0}
      ${I} .oc-graph-body{display:block;padding:0}
      ${I} .oc-dope-stage{height:auto;min-height:0;overflow:visible}
      ${I} .oc-dope{--oc-ruler-h:20px;--oc-dope-row-h:22px;--oc-dope-gap:2px}
      ${I} .oc-dope-body{grid-template-columns:minmax(0,1fr);padding:2px 0}
      ${I} .oc-inline-bar{display:flex;position:absolute;z-index:6;left:50%;bottom:8px;transform:translateX(-50%);align-items:center;gap:6px;max-width:calc(100% - 16px);padding:4px 6px;border-radius:8px;background:rgba(10,12,16,.82);border:1px solid var(--oc-line)}
      ${I} .oc-inline-bar select{max-width:150px;font-size:11px}
      ${I} .oc-inline-bar label{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;font-size:11px;color:var(--oc-text)}
      ${I} .oc-inline-angles{position:relative}
      ${I} .oc-inline-angles>summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:6px;border:1px solid var(--oc-line);font-size:11px}
      ${I} .oc-inline-angles>summary::-webkit-details-marker{display:none}
      ${I} .oc-inline-angle-grid{position:absolute;bottom:calc(100% + 6px);left:0;display:grid;grid-template-columns:repeat(2,minmax(84px,1fr));gap:4px;padding:6px;border-radius:8px;background:var(--oc-panel);border:1px solid var(--oc-line);box-shadow:0 8px 24px rgba(0,0,0,.45)}
      ${I} .oc-inline-angle-grid>button{font-size:11px;padding:4px 6px;white-space:nowrap}
      ${I} .oc-transport{flex-wrap:nowrap}
      /* Narrow hosts (App Mode's side panel, a slim node): one row of view
         pills and one transport row. */
      @container (max-width:520px){
        ${I} .vp-view[data-view=front],${I} .vp-view[data-view=right],${I} .vp-view[data-view=iso],
        ${I} .oc-timecode,${I} [data-act=previous-frame],${I} [data-act=next-frame]{display:none !important}
        ${I} .oc-inline-bar select{max-width:110px}
        ${I} .oc-inline-bar{left:auto;right:6px;transform:none;max-width:calc(100% - 52px)}
        ${I} .oc-transport{gap:3px}
        ${I} .oc-transport .timeline-group{gap:2px}
      }
      ${I} .oc-frame-counter{white-space:nowrap}
`;
