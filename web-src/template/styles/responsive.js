// Responsive shell rules, layered last so they win over the fixed 5-column
// grid in shell.js. Driven by the .majoor-omnicam container (inline-size),
// not the viewport, so an embedded Director node reflows on its own width.
//
//   >= 1180px : Scene | Viewport | Inspector  (full three-column shell)
//   850-1179  : Viewport | Inspector, Scene collapses to an overlay drawer
//   < 850px   : single column, Scene and Inspector both become drawers
//
// The drawers stay reachable: toolbar buttons toggle .oc-scene-open /
// .oc-inspector-open on the root (see event-bindings/director-chrome.js).

export const RESPONSIVE_STYLES = `
      .majoor-omnicam .oc-drawer-toggle{display:none !important}

      @container (max-width:1120px){
        .majoor-omnicam .oc-body{grid-template-columns:minmax(0,1fr) 9px var(--oc-side-w,280px);position:relative}
        .majoor-omnicam .oc-left,.majoor-omnicam .oc-left-resize{
          position:absolute;z-index:40;top:0;left:0;bottom:0;width:min(300px,80%);
          box-shadow:0 12px 40px rgba(0,0,0,.6);transform:translateX(-104%);
          transition:transform .18s ease;pointer-events:none;opacity:0;
          overflow:hidden;
        }
        /* the drawer is a bounded box (top:0;bottom:0 of the relative oc-body)
           -- let the ASSETS grid and AGENT plan list flex to fill it and
           scroll, no arbitrary cap */
        .majoor-omnicam .oc-left .oc-asset-grid,
        .majoor-omnicam .oc-left .oc-agent-plan-list{max-height:none}
        .majoor-omnicam .oc-left .oc-asset-panel,
        .majoor-omnicam .oc-left>.oc-left-body{min-height:0}
        .majoor-omnicam .oc-left-resize{display:none}
        .majoor-omnicam.oc-scene-open .oc-left{transform:none;pointer-events:auto;opacity:1}
        .majoor-omnicam .oc-drawer-toggle[data-act="toggle-scene-panel"]{display:inline-grid !important}
      }

      @container (max-width:760px){
        .majoor-omnicam .oc-body{display:block;position:relative}
        .majoor-omnicam .oc-side,.majoor-omnicam .oc-side-resize{
          position:absolute;z-index:40;top:0;right:0;bottom:0;width:min(320px,86%);
          background:var(--oc-panel);box-shadow:0 12px 40px rgba(0,0,0,.6);
          transform:translateX(104%);transition:transform .18s ease;
          pointer-events:none;opacity:0;padding:8px;overflow-y:auto;
        }
        .majoor-omnicam .oc-side-resize{display:none}
        .majoor-omnicam.oc-inspector-open .oc-side{transform:none;pointer-events:auto;opacity:1}
        .majoor-omnicam .oc-drawer-toggle[data-act="toggle-inspector-panel"]{display:inline-grid !important}
        .majoor-omnicam .oc-stage{padding:0}
      }
`;
