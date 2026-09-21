// Layout shell: header, toolbar, body grid, side panel, lower deck, footer.
//
// Loaded after the legacy component styles so these rules win where the two
// overlap. Everything is scoped under .majoor-omnicam and driven by the tokens
// declared here, so retheming means editing this block only.

export const SHELL_STYLES = `
      /* ---- bounded modal shell (Director only) ----------------------- */
      /* .majoor-omnicam alone is shared with Extractor/Monitor's own
         templates, so the bounded-height layout is scoped to the extra
         "oc-director" class template.js stamps on the root. Everything below
         becomes a fixed-height row except .oc-body (the grid) and .oc-dock
         (the lower deck), which share the remaining height 1fr/flex:0 0 auto. */
      /* box-sizing:border-box: COMPONENT_STYLES' ".majoor-omnicam *" reset
         doesn't reach the root itself, so its own 1px border (COMPONENT_STYLES)
         would otherwise add 2px on top of a height:100% that already exactly
         matches .oc-workbench-content -- a small but real overflow. */
      .majoor-omnicam.oc-director{
        --oc-bg-app: var(--bg-color, #121214);
        --oc-bg-panel: var(--comfy-menu-bg, #18181b);
        --oc-bg-control: var(--comfy-input-bg, #222226);
        --oc-bg-sunken: var(--comfy-input-bg, #0d0d0f);
        --oc-border-default: var(--border-color, #2e2e34);
        --oc-border-subtle: var(--border-color, #232328);
        --oc-text-primary: var(--input-text, #f4f4f6);
        --oc-text-secondary: var(--input-text, #a1a1aa);
        --oc-text-muted: var(--input-text, #a1a1aa);
        --oc-accent: #2563eb;
        --oc-accent-hover: #3b82f6;
        --oc-radius: 4px;
        --oc-radius-sm: 3px;
        box-sizing:border-box;display:flex;flex-direction:column;height:100%;overflow:hidden
      }
      .majoor-omnicam.oc-director>.oc-header,
      .majoor-omnicam.oc-director>.top,
      .majoor-omnicam.oc-director>.oc-footer{flex:0 0 auto}
      .majoor-omnicam.oc-director>.oc-body{flex:1 1 auto;min-height:0}
      /* .oc-dock now holds a single child, .oc-lower: the camera preview and
         Timeline/Graph/Sequence (unified as tabs of one block, Director modal
         audit Lot 3) share this one bounded region instead of stacking as two
         independent blocks. */
      .majoor-omnicam.oc-director>.oc-dock{flex:0 1 auto;max-height:clamp(160px,30%,320px);display:flex;flex-direction:column;min-height:0;overflow-y:auto}
      .majoor-omnicam.oc-director>.oc-dock>.oc-lower{flex:0 0 auto}

      /* ---- header --------------------------------------------------- */
      .majoor-omnicam .oc-header-spacer,.majoor-omnicam .oc-toolbar-spacer,.majoor-omnicam .oc-transport-spacer,.majoor-omnicam .oc-footer-spacer,.majoor-omnicam .oc-graph-spacer{flex:1 1 auto;min-width:0}
      .majoor-omnicam .oc-status-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:var(--oc-radius-sm);background:var(--oc-ok-bg);border:1px solid var(--oc-ok-line);color:var(--oc-ok-text);font-size:11px;font-weight:600;white-space:nowrap}
      .majoor-omnicam .oc-status-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}
      .majoor-omnicam .oc-overflow>summary{width:28px;height:28px;justify-content:center;padding:0;color:var(--oc-text-dim)}

      /* ---- toolbar & DCC menubar ------------------------------------ */
      .majoor-omnicam .top{gap:8px;padding:4px 10px;background:linear-gradient(180deg,#161b24 0%,#11151c 100%);border-bottom:1px solid var(--oc-line);min-height:38px}
      .majoor-omnicam .oc-dcc-menubar{display:flex;align-items:center;gap:6px}
      .majoor-omnicam .toolbar-menu{position:relative}
      .majoor-omnicam .toolbar-menu>summary{display:inline-flex;align-items:center;gap:6px;min-height:28px;padding:3px 10px;border-radius:6px;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.07);color:var(--oc-text-dim,#94a3b8);font-weight:600;font-size:11.5px;letter-spacing:0.01em;cursor:pointer;user-select:none;list-style:none;box-shadow:0 1px 2px rgba(0,0,0,0.2);transition:all .18s cubic-bezier(0.16,1,0.3,1)}
      .majoor-omnicam .toolbar-menu>summary::-webkit-details-marker{display:none}
      .majoor-omnicam .toolbar-menu>summary>i:first-child{font-size:11.5px;color:#818cf8;transition:color .18s ease,transform .18s ease}
      .majoor-omnicam .toolbar-menu[data-menu="file"]>summary>i:first-child{color:#f59e0b}
      .majoor-omnicam .toolbar-menu[data-menu="scene"]>summary>i:first-child{color:#38bdf8}
      .majoor-omnicam .toolbar-menu[data-menu="camera"]>summary>i:first-child{color:#c084fc}
      .majoor-omnicam .toolbar-menu[data-menu="view"]>summary>i:first-child{color:#34d399}
      .majoor-omnicam .toolbar-menu[data-menu="display"]>summary>i:first-child{color:#60a5fa}
      .majoor-omnicam .toolbar-menu>summary>i.pi-chevron-down{font-size:8.5px;margin-left:3px;opacity:.45;transition:transform .2s cubic-bezier(0.16,1,0.3,1),opacity .18s ease}
      .majoor-omnicam .toolbar-menu>summary:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.16);color:#f8fafc;box-shadow:0 2px 6px rgba(0,0,0,0.35)}
      .majoor-omnicam .toolbar-menu>summary:hover>i:first-child{transform:scale(1.08)}
      .majoor-omnicam .toolbar-menu>summary:hover>i.pi-chevron-down{opacity:.85}
      .majoor-omnicam .toolbar-menu[open]>summary{background:rgba(99,102,241,0.18) !important;border-color:rgba(129,140,248,0.55) !important;color:#ffffff !important;box-shadow:0 0 12px rgba(99,102,241,0.25),0 2px 8px rgba(0,0,0,0.4) !important}
      .majoor-omnicam .toolbar-menu[open]>summary>i:first-child{color:#c7d2fe !important;text-shadow:0 0 8px rgba(129,140,248,0.6)}
      .majoor-omnicam .toolbar-menu[open]>summary>i.pi-chevron-down{transform:rotate(180deg);opacity:1;color:#c7d2fe !important}
      .majoor-omnicam .menu-panel{width:275px;max-height:min(600px,calc(100vh - 80px));overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--oc-line) transparent;background:rgba(20,25,34,0.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.11);border-radius:8px;box-shadow:0 18px 40px rgba(0,0,0,0.72),inset 0 1px 0 rgba(255,255,255,0.08);animation:ocMenuSlideDown .15s cubic-bezier(0.16,1,0.3,1)}
      @keyframes ocMenuSlideDown{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
      .majoor-omnicam .menu-pack{display:flex;flex-direction:column;gap:5px;background:rgba(255,255,255,.02);border:1px solid var(--oc-line);border-radius:var(--oc-radius-sm);padding:6px}
      .majoor-omnicam .menu-pack-header{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--oc-text-dim);padding:0 2px 2px}
      .majoor-omnicam .menu-pack-badge{font-size:9px;padding:1px 5px;border-radius:10px;background:rgba(255,255,255,.06);color:var(--oc-text-faint);font-weight:600;letter-spacing:0}
      .majoor-omnicam .menu-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
      .majoor-omnicam .menu-grid .span-2{grid-column:span 2}
      .majoor-omnicam .menu-grid button{display:inline-flex;align-items:center;justify-content:center;text-align:center;min-height:28px;padding:4px 6px;font-size:11px;gap:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .majoor-omnicam .menu-grid button i{font-size:11px;flex-shrink:0}
      .majoor-omnicam .menu-panel>button{display:flex;align-items:center;justify-content:center;gap:7px;text-align:center;min-height:28px;padding:5px 8px;font-size:11.5px}
      .majoor-omnicam .menu-panel .hint,.majoor-omnicam .hint{font-size:9.5px;font-style:italic;color:var(--oc-text-dim);opacity:.85;line-height:1.35;padding:1px 2px;display:block}
      .majoor-omnicam .menu-panel label>select{width:116px;padding:2px 4px;font-size:11px}
      .majoor-omnicam .menu-row{display:flex;gap:4px;align-items:center}
      .majoor-omnicam .menu-row>button{flex:1;justify-content:center;text-align:center}
      .majoor-omnicam .menu-row>.icon-button{flex:none}
      .majoor-omnicam .menu-panel input[type=color]{width:46px;height:24px;padding:0;background:transparent;cursor:pointer}
      .majoor-omnicam .menu-panel label>input[type=checkbox]{width:16px;height:16px;padding:0;cursor:pointer}
      .majoor-omnicam .oc-shelf-modes{display:flex;align-items:center;gap:5px;margin-right:4px}
      .majoor-omnicam .oc-render-mode{min-width:146px;height:26px;padding:2px 8px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:var(--oc-radius-sm);color:var(--oc-text);font-size:11.5px;font-weight:600;cursor:pointer;transition:border-color .15s ease,box-shadow .15s ease}
      .majoor-omnicam .oc-render-mode:hover{border-color:var(--oc-accent);box-shadow:0 0 0 1px var(--oc-accent-soft)}
      .majoor-omnicam .oc-render-mode:focus-visible{outline:none;border-color:var(--oc-accent);box-shadow:0 0 0 2px var(--oc-accent-soft)}
      .majoor-omnicam .oc-render-mode optgroup,.majoor-omnicam .vp-shading-select optgroup{background:#161a24;color:var(--oc-text-dim);font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
      .majoor-omnicam .oc-render-mode option,.majoor-omnicam .vp-shading-select option{background:#1a1f2c;color:var(--oc-text);font-size:11px;font-weight:500}
      .majoor-omnicam .oc-playblast{gap:6px;padding:4px 12px;border-radius:var(--oc-radius-sm);background:var(--oc-accent);border-color:var(--oc-accent);color:var(--oc-accent-ink);font-weight:600;font-size:12px}
      .majoor-omnicam .oc-playblast:hover{background:var(--oc-accent-hover);border-color:var(--oc-accent-hover);color:#fff}
      .majoor-omnicam .oc-playblast-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}

      /* ---- Channel Box, Axis & Key Indicators ----------------------- */
      .majoor-omnicam .oc-channel-key{display:inline-flex;align-items:center;justify-content:center;width:12px;font-size:9px;color:var(--oc-key-none,#52525b);cursor:pointer;user-select:none;margin-right:2px}
      .majoor-omnicam .oc-channel-key:hover{color:var(--oc-key-active,#eab308)}
      .majoor-omnicam .oc-axis.x .oc-axis-tag{color:#ef4444;font-weight:700}
      .majoor-omnicam .oc-axis.y .oc-axis-tag{color:#22c55e;font-weight:700}
      .majoor-omnicam .oc-axis.z .oc-axis-tag{color:#3b82f6;font-weight:700}
      .majoor-omnicam .oc-axis:hover{border-color:var(--oc-accent);cursor:ew-resize}
      .majoor-omnicam .oc-axis input{cursor:ew-resize}

      /* ---- DCC Studio Status Bar ------------------------------------ */
      .majoor-omnicam .oc-footer{display:flex;align-items:center;gap:8px;padding:4px 10px;background:var(--oc-panel);border-top:1px solid var(--oc-line);min-height:26px;font-size:11px}
      .majoor-omnicam .oc-status-badge{display:inline-flex;align-items:center;gap:5px;font-weight:700;color:var(--oc-ok);letter-spacing:.05em}
      .majoor-omnicam .oc-footer-sep{color:var(--oc-line);font-weight:300}
      .majoor-omnicam .oc-footer-hints{color:var(--oc-text-dim);font-family:inherit}
      .majoor-omnicam .oc-key-hint{display:inline-block;padding:1px 4px;border:1px solid var(--oc-line);border-radius:2px;background:var(--oc-panel-2);color:var(--oc-text);font-family:monospace;font-size:10px}


      /* ---- body grid ------------------------------------------------ */
      .majoor-omnicam .oc-body{display:grid;grid-template-columns:var(--oc-left-w,264px) 7px minmax(0,1fr) 9px var(--oc-side-w,280px);gap:8px;padding:8px;background:var(--oc-bg);align-items:start}
      .majoor-omnicam .oc-stage{min-width:0;min-height:0;align-self:stretch}
      /* min-height:0 on every .oc-body grid item, not just on .oc-body
         itself: a grid item's default min-height:auto resolves to its own
         content size and blocks align-self:stretch from ever shrinking it
         below that -- so once .oc-director's flex column constrains .oc-body
         to less than its natural content height, each item needs this too or
         the tallest one (usually .oc-left) keeps rendering past the row and
         gets painted over by .oc-dock underneath. */
      .majoor-omnicam .oc-side{align-self:stretch;min-height:0}
      /* align-self:stretch (not the old content-height "start"): once
         .oc-body's own row is bounded (Director bounded-layout block above),
         .oc-left needs the same full-row-height + internal-scroll treatment
         as .oc-side, or its content (the fixed-height .scene-tree plus its
         search/add-object/filter chrome) can overflow past the row and get
         painted over by .oc-dock below it, stealing its clicks. */
      .majoor-omnicam .oc-left{min-width:0;min-height:0;align-self:stretch;display:flex;flex-direction:column;gap:7px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);padding:8px}
      .majoor-omnicam .oc-panel-head{display:flex;align-items:center;gap:6px}
      .majoor-omnicam .oc-panel-head>strong{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-panel-spacer{flex:1 1 auto}
      /* .oc-left-body (styles.js) is already flex:1 1 auto;min-height:0 --
         it only needed a real row height (above) and this overflow to become
         the scrolling region a bounded .oc-left now needs. */
      .majoor-omnicam .oc-left-body{overflow-y:auto}
      .majoor-omnicam .oc-left .scene-tree{height:var(--oc-outliner-h,220px);min-height:80px}
      /* ASSETS tab: kept as an extra safety cap alongside the new
         .oc-left-body scroll region above -- harmless belt-and-braces, not
         load-bearing for containment anymore. */
      .majoor-omnicam .oc-left .oc-asset-grid{max-height:var(--oc-assets-h,340px)}
      .majoor-omnicam .oc-left .oc-agent-plan-list{max-height:var(--oc-agent-h,220px);min-height:40px;overflow-y:auto;text-align:left;white-space:normal}
      .majoor-omnicam .oc-left .oc-agent-plan-list:empty{min-height:0;margin:0;padding:0}
      .majoor-omnicam .oc-body .viewport-wrap{border-radius:var(--oc-radius);overflow:hidden;box-shadow:none;border:1px solid var(--oc-line)}
      /* Fullscreen keeps the full DCC shell: Scene | Viewport | Inspector + deck. */
      .majoor-omnicam.oc-fullscreen .oc-lower{display:block}

      /* ---- viewport chrome ------------------------------------------ */
      /* Reserve the right-hand strip for .vp-corner so the pills never slide
         under the overlay toggles when the stage narrows (the left Scene panel
         takes width from the viewport). */
      /* The Scene panel takes width from the viewport, so on a narrow stage the
         quick-view pills and the top-right overlay toggles can overlap. The
         pills keep the higher z-index (they gate primary navigation) and never
         wrap onto the tool rail below (top:52px); the redundant view <select>
         yields width first and the row scrolls if it is truly cramped. */
      .majoor-omnicam .vp-pills{position:absolute;top:9px;left:9px;z-index:8;display:flex;flex-wrap:wrap;gap:5px;max-width:calc(100% - 18px)}
      .majoor-omnicam .vp-quick-views{display:flex;flex:0 1 auto;flex-wrap:nowrap;gap:4px;max-width:100%;overflow-x:auto;scrollbar-width:none}
      .majoor-omnicam .vp-quick-views::-webkit-scrollbar{display:none}
      .majoor-omnicam .vp-pills .vp-pill-select{flex:0 1 auto;min-width:88px}
      .majoor-omnicam .vp-pill{padding:4px 11px;border-radius:999px;background:rgba(17,24,39,.94);border:1px solid var(--oc-line);color:var(--oc-text);font-size:11px}
      .majoor-omnicam .vp-pill-select{appearance:none;padding-right:20px;cursor:pointer}
      .majoor-omnicam .vp-pills .vp-pill:first-child{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#fff}
      .majoor-omnicam .vp-corner{position:absolute;top:9px;right:9px;z-index:6;display:flex;align-items:center;gap:5px}
      .majoor-omnicam .vp-zoom{padding:4px 9px;border-radius:var(--oc-radius-sm);background:rgba(17,24,39,.94);border:1px solid var(--oc-line);color:var(--oc-text-dim);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .vp-rail{position:absolute;top:52px;left:9px;z-index:6;display:flex;flex-direction:column;gap:3px;padding:4px;border-radius:var(--oc-radius);background:rgba(17,24,39,.94);border:1px solid var(--oc-line)}
      .majoor-omnicam .vp-tool{display:grid;place-items:center;width:26px;height:26px;padding:0;border-radius:6px;background:transparent;border:1px solid transparent;color:var(--oc-text-dim)}
      .majoor-omnicam .vp-tool:hover{background:var(--oc-panel-2);border-color:var(--oc-line);color:var(--oc-text)}
      .majoor-omnicam .vp-tool.active,.majoor-omnicam .vp-tool[aria-pressed="true"]{background:var(--oc-accent-soft) !important;border-color:var(--oc-accent) !important;color:#fff !important;box-shadow:none !important}
      .majoor-omnicam .vp-rail-divider{height:1px;margin:2px 3px;background:var(--oc-line)}
      /* Transform tools carry the gizmo's own colour coding, so the rail reads at
         a glance instead of being three identical grey squares. */
      .majoor-omnicam [data-transform-mode="translate"]{--tool-color:#4a8fe7}
      .majoor-omnicam [data-transform-mode="rotate"]{--tool-color:#46a758}
      .majoor-omnicam [data-transform-mode="scale"]{--tool-color:#e5a23c}
      .majoor-omnicam .vp-tool[data-transform-mode]{color:var(--tool-color)}
      .majoor-omnicam .vp-tool[data-transform-mode]:hover{border-color:var(--tool-color);color:var(--tool-color)}
      .majoor-omnicam .vp-tool[data-transform-mode].active,
      .majoor-omnicam .vp-tool[data-transform-mode][aria-pressed="true"]{
        background:color-mix(in srgb, var(--tool-color) 32%, transparent) !important;
        border-color:var(--tool-color) !important;color:#fff !important;
        box-shadow:0 0 0 1px color-mix(in srgb, var(--tool-color) 55%, transparent) !important}
      .majoor-omnicam .transform-tools [data-transform-mode]{color:var(--tool-color);border-color:color-mix(in srgb, var(--tool-color) 40%, var(--oc-line))}
      .majoor-omnicam .transform-tools [data-transform-mode].active{
        background:color-mix(in srgb, var(--tool-color) 30%, transparent) !important;
        border-color:var(--tool-color) !important;color:#fff !important}
      .majoor-omnicam .vp-axis{position:absolute;top:44px;right:9px;z-index:6;pointer-events:none;overflow:visible;border-radius:50%;background:rgba(11,16,24,.85);border:1px solid rgba(255,255,255,.08);box-shadow:0 4px 14px rgba(0,0,0,.45);filter:drop-shadow(0 1px 3px rgba(0,0,0,.65))}
      .majoor-omnicam .vp-hint{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);z-index:5;color:var(--oc-text-faint);font-size:10.5px;white-space:nowrap;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.9)}
      .majoor-omnicam .vp-state{position:absolute;bottom:8px;left:9px;z-index:5;color:var(--oc-text-dim);font:10.5px ui-monospace,SFMono-Regular,Menlo,monospace;pointer-events:none}
      .majoor-omnicam .vp-state:empty{display:none}
      /* The legacy HUD anchored top-left, which is now the pills + rail corner.
         It moves to the right edge, clearing the zoom readout and the axis gizmo. */
      .majoor-omnicam .oc-body .hud{left:auto;right:9px;top:104px;max-width:52%;text-align:right}
      .majoor-omnicam .oc-body .viewport-tally-banner{top:44px}

      /* Tool rail space badge and snapping */
      .majoor-omnicam .vp-space-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;font-size:12px;font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-accent)}
      .majoor-omnicam .vp-tool.active .vp-space-badge{color:#fff}

      /* Camera HUD & OSD */
      .majoor-omnicam .vp-camera-hud{position:absolute;top:9px;left:50%;transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:7px;padding:3px 12px;border-radius:999px;background:rgba(17,24,39,.96);border:1px solid var(--oc-line);color:var(--oc-text);font-size:11px;box-shadow:0 4px 16px rgba(0,0,0,.45);pointer-events:auto}
      .majoor-omnicam .vp-camera-hud .hud-cam-lock{background:none;border:none;padding:0 2px;color:var(--oc-text-dim);cursor:pointer;display:inline-flex;align-items:center}
      .majoor-omnicam .vp-camera-hud .hud-cam-lock:hover{color:var(--oc-text)}
      .majoor-omnicam .vp-camera-hud .hud-cam-lock.locked{color:var(--oc-danger)}
      .majoor-omnicam .vp-camera-hud .hud-cam-name{font-weight:600;color:var(--oc-text)}
      .majoor-omnicam .vp-camera-hud .hud-cam-lens{font-weight:600;color:var(--oc-accent-hover)}
      .majoor-omnicam .vp-camera-hud .hud-cam-fov{color:var(--oc-text-dim)}
      .majoor-omnicam .vp-camera-hud .hud-cam-dist{color:var(--oc-text-dim);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .vp-camera-hud .hud-divider{color:var(--oc-text-faint);opacity:.5}
      .majoor-omnicam .vp-camera-hud .hud-roll-reset{background:var(--oc-danger-bg);border:1px solid var(--oc-danger-line);border-radius:999px;padding:1px 6px;color:var(--oc-danger-text);font-size:10px;cursor:pointer;display:inline-flex;align-items:center;gap:3px}
      .majoor-omnicam .vp-camera-hud .hud-roll-reset:hover{background:rgba(237,107,115,.3)}

      /* Viewport Corner Overlays & Shading */
      .majoor-omnicam .vp-overlay-group{display:flex;align-items:center;gap:1px;padding:2px;border-radius:var(--oc-radius-sm);background:rgba(17,24,39,.94);border:1px solid var(--oc-line)}
      .majoor-omnicam .vp-overlay-btn{width:22px;height:22px;display:grid;place-items:center;border-radius:4px;border:none;background:transparent;color:var(--oc-text-dim);padding:0;cursor:pointer}
      .majoor-omnicam .vp-overlay-btn:hover{color:var(--oc-text);background:rgba(255,255,255,0.06)}
      .majoor-omnicam .vp-overlay-btn.active{color:var(--oc-accent);background:var(--oc-accent-soft)}
      .majoor-omnicam .vp-shading-select{font-size:11px;padding:3px 8px;border-radius:var(--oc-radius-sm);background:rgba(17,24,39,.94);border:1px solid var(--oc-line);color:var(--oc-text);cursor:pointer}

      /* Floating Mini-Transport in Fullscreen */
      .majoor-omnicam .vp-floating-transport{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);z-index:7;display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:rgba(11,16,24,.97);border:1px solid var(--oc-line);box-shadow:0 8px 24px rgba(0,0,0,.65)}
      .majoor-omnicam .vp-floating-transport .ft-btn{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:transparent;border:1px solid transparent;color:var(--oc-text-dim);cursor:pointer;padding:0}
      .majoor-omnicam .vp-floating-transport .ft-btn:hover{background:rgba(255,255,255,0.08);color:var(--oc-text)}
      .majoor-omnicam .vp-floating-transport .ft-play{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#fff}
      .majoor-omnicam .vp-floating-transport .ft-time{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-text);padding:0 4px}
      .majoor-omnicam .vp-floating-transport .ft-frame{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-accent);padding:0 4px}

      /* ---- side panel ------------------------------------------------ */
      .majoor-omnicam .oc-side{position:static;width:var(--oc-side-w,280px);min-width:0;max-width:100%;height:100%;display:flex;flex-direction:column;gap:8px;background:transparent;border:0;padding:0;box-shadow:none;backdrop-filter:none}
      .majoor-omnicam .oc-side-tabs{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;padding:3px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);position:sticky;top:0;z-index:12}
      /* Selection-driven Inspector head: contextual title + the three secondary
         mode buttons, not a five-tab nav. */
      .majoor-omnicam .oc-inspector-head{display:flex;align-items:center;gap:4px}
      .majoor-omnicam .oc-inspector-title{flex:0 0 auto;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--oc-text);padding-left:4px}
      .majoor-omnicam .oc-inspector-head .oc-panel-spacer{flex:1 1 auto}
      .majoor-omnicam .oc-mode-btn{flex:0 0 auto;padding:4px 9px;border-radius:var(--oc-radius-sm);background:transparent;border:1px solid transparent;color:var(--oc-text-dim);font-size:11px;font-weight:550;cursor:pointer}
      .majoor-omnicam .oc-mode-btn:hover{color:var(--oc-text);background:rgba(255,255,255,.05)}
      .majoor-omnicam .oc-mode-btn.active,.majoor-omnicam .oc-mode-btn[aria-pressed="true"]{background:var(--oc-accent-soft);border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line));color:var(--oc-text)}
      .majoor-omnicam .oc-side-tabs .inspector-tab{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:5px 4px;border-radius:var(--oc-radius-sm);background:transparent;border:1px solid transparent;color:var(--oc-text-dim);font-size:11.5px;font-weight:550;cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .oc-side-tabs .inspector-tab:hover{color:var(--oc-text);background:rgba(255,255,255,0.05)}
      .majoor-omnicam .oc-side-tabs .inspector-tab.active{background:var(--oc-panel-2) !important;border-color:var(--oc-line) !important;color:var(--oc-text) !important;box-shadow:none !important}
      /* .oc-side already carries height:100% (below) inside a now-bounded
         .oc-body row, so this flex child's own min-height:0 is what clamps
         it -- no need for a max-height formula (the previous
         "calc(100vh - 360px)" measured the real browser window, which is
         wrong inside the workbench's 92vh modal). */
      .majoor-omnicam .oc-side-body{display:flex;flex-direction:column;gap:7px;flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding-right:4px;scroll-behavior:smooth}
      .majoor-omnicam .oc-outliner-add-bar{position:sticky;top:32px;z-index:9;background:var(--oc-bg);padding:2px 0}
      .majoor-omnicam .oc-add-menu{width:100%}
      .majoor-omnicam .oc-add-summary-btn{display:flex;align-items:center;gap:6px;width:100%;height:27px;padding:3px 8px;border-radius:var(--oc-radius-sm);background:var(--oc-panel-2);border:1px solid var(--oc-line);color:var(--oc-text);font-size:11.5px;font-weight:600;cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .oc-add-summary-btn:hover,.majoor-omnicam .oc-add-menu[open] .oc-add-summary-btn{background:var(--oc-panel-2);border-color:var(--oc-line)}
      .majoor-omnicam .oc-add-menu-panel{width:210px;padding:5px 0;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,0.65);display:flex;flex-direction:column;gap:1px}
      .majoor-omnicam .oc-add-header{color:var(--oc-text-dim);font-size:11px;font-weight:600;padding:4px 12px 4px;user-select:none}
      .majoor-omnicam .oc-add-menu-item{display:flex;align-items:center;gap:10px;width:100%;padding:6px 12px;border:none;background:transparent;color:var(--oc-text);font-size:12.5px;font-weight:600;cursor:pointer;text-align:left;transition:background .12s ease;position:relative}
      .majoor-omnicam .oc-add-menu-item:hover{background:rgba(255,255,255,0.08);color:#ffffff}
      .majoor-omnicam .oc-add-svg{width:16px;height:16px;flex-shrink:0;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-add-menu-item:hover .oc-add-svg{color:#ffffff}
      .majoor-omnicam .oc-submenu-arrow{margin-left:auto;font-size:9px;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-has-submenu{user-select:none}
      .majoor-omnicam .oc-add-submenu{position:absolute;left:calc(100% - 2px);top:-4px;min-width:165px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,0.7);display:none;flex-direction:column;gap:1px;padding:4px 0;z-index:70}
      .majoor-omnicam .oc-has-submenu:hover .oc-add-submenu,.majoor-omnicam .oc-has-submenu:focus-within .oc-add-submenu{display:flex}
      .majoor-omnicam .outliner-quick-bar{display:none}
      .majoor-omnicam .outliner-filter-chips{position:sticky;top:62px;z-index:9;background:var(--oc-bg);padding-bottom:3px;border-bottom:1px solid var(--oc-line-soft)}
      .majoor-omnicam .shot-key-nav{position:sticky;top:0;z-index:10;background:var(--oc-bg);padding:2px 0 4px;border-bottom:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-search{flex:1;min-width:0;padding:4px 9px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border-color:var(--oc-line)}
      /* .oc-search's flex:1 above is meant for a ROW toolbar (.oc-asset-toolbar,
         .oc-agent-provider-row: the search/select fills leftover WIDTH next to
         an icon button). The Outliner's search input, uniquely, is a direct
         child of .oc-left-body -- a COLUMN flex -- so the same flex:1 instead
         grows it to fill leftover COLUMN HEIGHT, ballooning it into a tall
         empty box (worse the less the Outliner list itself takes up, so it
         looked tied to resizing the list, but the list was never the cause).
         flex:0 0 auto hands its height back to its own content, like every
         other fixed-size row in that column. */
      .majoor-omnicam .oc-left-body>input.oc-search{flex:0 0 auto}
      /* Prevent hint/status paragraphs in column flex panels from ballooning in height */
      .majoor-omnicam .oc-asset-panel>p,
      .majoor-omnicam .oc-agent-panel>p{flex:0 0 auto !important;text-align:left;white-space:normal;overflow:visible;text-overflow:clip;margin:2px 0 4px}
      .majoor-omnicam .oc-agent-privacy{font-size:9.5px;font-style:italic;color:var(--oc-text-dim);opacity:.85;margin:2px 0 6px}
      .majoor-omnicam .oc-agent-describe{display:block;flex:0 0 auto;width:100%;min-height:110px;max-height:260px;resize:vertical;overflow-y:auto;font:inherit;font-size:11.5px;line-height:1.45;padding:8px 10px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line);color:var(--oc-text);box-sizing:border-box}
      .majoor-omnicam .oc-agent-panel .oc-asset-foot{margin-top:auto;padding-top:8px;border-top:1px solid var(--oc-line-soft);display:flex;gap:6px}
      .majoor-omnicam .oc-agent-panel .oc-asset-foot .oc-btn{flex:1;text-align:center;justify-content:center;min-height:28px;font-size:11px}
      .majoor-omnicam .oc-asset-thumb{width:100%;min-height:76px;aspect-ratio:1;object-fit:cover;border-radius:4px;background:var(--oc-sunken);display:flex;align-items:center;justify-content:center}
      .majoor-omnicam .oc-asset-card{position:relative;display:flex;flex-direction:column;gap:4px;padding:6px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:6px;cursor:pointer;text-align:left}
      .majoor-omnicam .oc-asset-card:hover{border-color:var(--oc-text-faint)}
      .majoor-omnicam .oc-asset-card.selected{border-color:var(--oc-accent);box-shadow:0 0 0 1px var(--oc-accent)}
      .majoor-omnicam .oc-asset-name{font-size:10px;font-weight:600;color:var(--oc-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
      .majoor-omnicam .oc-asset-kind-tag{font-size:8px;font-weight:600;letter-spacing:.06em;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-asset-badge{position:absolute;top:6px;right:6px;font-size:7.5px;font-weight:700;letter-spacing:.05em;padding:1px 4px;background:var(--oc-ok-bg);border:1px solid var(--oc-ok-line);border-radius:3px;color:var(--oc-ok-text);z-index:2}
      .majoor-omnicam .oc-asset-kinds{display:flex;flex-wrap:wrap;gap:4px;margin:2px 0 6px}
      .majoor-omnicam .oc-asset-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:4px;margin-top:auto}
      .majoor-omnicam .oc-asset-foot .oc-btn{font-size:11px;padding:4px 10px;min-height:26px}
      .majoor-omnicam .oc-card{display:flex;flex-direction:column;gap:6px;padding:9px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius)}
      .majoor-omnicam .oc-card-title{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:600;color:var(--oc-text)}
      .majoor-omnicam .oc-card-title input[type=color]{margin-left:auto;width:28px;height:22px;padding:0;background:transparent;cursor:pointer}
      .majoor-omnicam .oc-section{margin-top:3px;color:var(--oc-text-faint);font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase}
      .majoor-omnicam .oc-field-row{display:flex;align-items:center;gap:6px}
      .majoor-omnicam .oc-field-label{flex:0 0 88px;color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .oc-field-row>input,.majoor-omnicam .oc-field-row>select{flex:1;min-width:0;background:var(--oc-sunken);border-color:var(--oc-line);padding:3px 7px}
      .majoor-omnicam .oc-field-row>input[type=color]{flex:0 0 26px;padding:0;background:transparent}
      .majoor-omnicam .oc-unit{flex:none;color:var(--oc-text-faint);font-size:10.5px;width:16px}
      .majoor-omnicam .oc-vec-row{display:flex;align-items:center;gap:4px}
      .majoor-omnicam .oc-vec-row .oc-field-label{flex:0 0 88px}
      .majoor-omnicam .oc-axis{flex:1;min-width:0;display:flex;align-items:center;gap:3px;padding:2px 5px;border-radius:6px;background:var(--oc-sunken);border:1px solid var(--oc-line);font-size:10px;color:var(--oc-text-faint)}
      .majoor-omnicam .oc-axis.x{border-left:2px solid #e5484d}
      .majoor-omnicam .oc-axis.y{border-left:2px solid #46a758}
      .majoor-omnicam .oc-axis.z{border-left:2px solid #4a8fe7}
      .majoor-omnicam .oc-axis{min-height:22px}
      .majoor-omnicam .oc-axis input{width:100%;min-width:0;padding:4px 2px;background:transparent;border:0;color:var(--oc-text);font-size:11px}
      .majoor-omnicam .oc-axis-tag{flex:0 0 auto;font-size:10px;font-weight:700;cursor:ew-resize;user-select:none;padding:0 2px}
      .majoor-omnicam .oc-axis.x .oc-axis-tag{color:#f87171}
      .majoor-omnicam .oc-axis.y .oc-axis-tag{color:#4ade80}
      .majoor-omnicam .oc-axis.z .oc-axis-tag{color:#60a5fa}
      .majoor-omnicam .oc-axis.scrubbing{border-color:var(--oc-accent)!important;background:rgba(154,138,228,0.15)!important}
      .majoor-omnicam .oc-axis-reset{flex:0 0 20px;height:22px;padding:0;border:1px solid var(--oc-line);border-radius:4px;background:var(--oc-sunken);color:var(--oc-text-faint);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s ease}
      .majoor-omnicam .oc-axis-reset:hover{color:var(--oc-text);border-color:var(--oc-text-dim);background:rgba(255,255,255,0.08)}
      .majoor-omnicam .outliner-filter-chips{display:flex;gap:3px;padding:2px 0;margin:3px 0}
      .majoor-omnicam .outliner-filter-chips .oc-chip{flex:1;padding:2px 4px;font-size:10px;border-radius:4px;border:1px solid var(--oc-line);background:var(--oc-sunken);color:var(--oc-text-dim);cursor:pointer;text-align:center}
      .majoor-omnicam .outliner-filter-chips .oc-chip:hover{color:var(--oc-text);border-color:var(--oc-accent)}
      .majoor-omnicam .outliner-filter-chips .oc-chip.active{background:var(--oc-accent);color:#fff;border-color:var(--oc-accent);font-weight:600}
      .majoor-omnicam .oc-chip-group{display:flex;gap:3px;flex:1}
      .majoor-omnicam .oc-chip-group .oc-chip-btn{flex:1;padding:2px 4px;font-size:10px;border-radius:4px;border:1px solid var(--oc-line);background:var(--oc-sunken);color:var(--oc-text-dim);cursor:pointer;text-align:center}
      .majoor-omnicam .oc-chip-group .oc-chip-btn:hover{color:var(--oc-text);border-color:var(--oc-accent)}
      .majoor-omnicam .oc-batch-toolbar{display:flex;align-items:center;justify-content:space-between;padding:4px 8px;margin:3px 6px;background:var(--oc-accent-soft);border:1px solid color-mix(in srgb,var(--oc-accent) 40%,transparent);border-radius:6px;gap:6px}
      .majoor-omnicam .oc-batch-badge{font-size:10px;font-weight:600;color:var(--oc-text);background:color-mix(in srgb,var(--oc-accent) 35%,transparent);padding:2px 6px;border-radius:4px}
      .majoor-omnicam .oc-batch-actions{display:flex;align-items:center;gap:3px}
      .majoor-omnicam .oc-batch-actions .icon-button{width:22px;height:22px;font-size:11px}
      .majoor-omnicam .oc-batch-actions .icon-button.danger:hover{color:var(--oc-danger)}
      .majoor-omnicam .scene-section-header{display:flex;align-items:center;gap:6px;padding:4px 6px;cursor:pointer;user-select:none;font-size:10px;font-weight:700;color:var(--oc-text-dim);text-transform:uppercase;letter-spacing:.05em;margin-top:4px;border-radius:3px}
      .majoor-omnicam .scene-section-header:hover{background:rgba(255,255,255,0.04);color:var(--oc-text)}
      .majoor-omnicam .scene-section-title{flex:0 0 auto}
      .majoor-omnicam .scene-section-count{font-size:9.5px;color:var(--oc-text-faint);font-weight:400}
      .majoor-omnicam .scene-item.scene-item-child{position:relative}
      .majoor-omnicam .scene-item.scene-item-child::before{content:"";position:absolute;left:8px;top:0;bottom:0;width:1px;background:var(--oc-line);opacity:.5}
      .majoor-omnicam .key-tangent-btn{font-size:10px;padding:2px 7px;border-radius:4px;border:1px solid var(--oc-line);background:var(--oc-sunken);color:var(--oc-text-dim);cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .key-tangent-btn:hover{border-color:var(--oc-accent);color:#fff}
      .majoor-omnicam .key-tangent-btn.active{background:var(--oc-accent);border-color:var(--oc-accent-hover);color:#fff;font-weight:700;box-shadow:none}
      .majoor-omnicam .oc-lens-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:3px}
      .majoor-omnicam .oc-lens-presets button{padding:3px 2px;font-size:10.5px;background:var(--oc-sunken);border-color:var(--oc-line);color:var(--oc-text-dim)}
      .majoor-omnicam .oc-slider-row input[type=range]{flex:1;min-width:0;height:22px;accent-color:var(--oc-accent);padding:0;background:transparent;border:0;cursor:pointer}
      .majoor-omnicam .oc-slider-value{flex:0 0 38px;text-align:right;color:var(--oc-text-dim);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .oc-card-actions{display:flex;gap:5px;margin-top:3px}
      .majoor-omnicam .oc-card-actions>button{flex:1;padding:5px 8px;font-size:11px}
      .majoor-omnicam .oc-card-actions>button.primary{background:var(--oc-accent);border-color:var(--oc-accent);box-shadow:none}
      .majoor-omnicam .oc-card-actions>button.primary:hover{background:var(--oc-accent-hover);border-color:var(--oc-accent-hover)}
      .majoor-omnicam .oc-key-actions>button{flex:0 0 auto}
      .majoor-omnicam .oc-side .key-interp-buttons{display:flex;flex-wrap:wrap;gap:3px}
      .majoor-omnicam .oc-side .key-interp-btn{min-height:22px;padding:3px 8px;font-size:10.5px}
      .majoor-omnicam .oc-more{padding:7px 9px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius)}
      .majoor-omnicam .oc-more>summary{cursor:pointer;color:var(--oc-text-dim);font-size:11px;font-weight:600}
      .majoor-omnicam .oc-more[open]>summary{margin-bottom:6px}
      .majoor-omnicam .oc-more .oc-field-row{margin-top:4px}

      /* ---- camera health --------------------------------------------- */
      /* One traffic-light palette, shared by the panel rows, the zone list and
         the timeline bands, so the same colour always means the same verdict. */
      .majoor-omnicam .oc-health{--oc-health-ok:var(--oc-ok);--oc-health-warn:var(--oc-warn);--oc-health-over:var(--oc-danger)}
      .majoor-omnicam .oc-health-badge{margin-left:auto;padding:2px 7px;border-radius:9px;background:var(--oc-sunken);color:var(--oc-text-dim);font-size:10px;font-weight:600;letter-spacing:.02em}
      .majoor-omnicam .oc-health-badge.ok{background:var(--oc-ok-bg);color:var(--oc-ok-text)}
      .majoor-omnicam .oc-health-badge.warn{background:var(--oc-warn-bg);color:var(--oc-warn-text)}
      .majoor-omnicam .oc-health-badge.over{background:var(--oc-danger-bg);color:var(--oc-danger-text)}
      .majoor-omnicam .oc-health-score-badge{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;padding:2px 6px;border-radius:9px}
      .majoor-omnicam .oc-health-score-badge.grade-a{background:var(--oc-ok-bg);color:var(--oc-ok-text);border:1px solid var(--oc-ok-line)}
      .majoor-omnicam .oc-health-score-badge.grade-b{background:var(--oc-accent-soft);color:var(--oc-accent-hover);border:1px solid var(--oc-accent)}
      .majoor-omnicam .oc-health-score-badge.grade-c{background:var(--oc-warn-bg);color:var(--oc-warn-text);border:1px solid var(--oc-warn-line)}
      .majoor-omnicam .oc-health-score-badge.grade-d{background:var(--oc-danger-bg);color:var(--oc-danger-text);border:1px solid var(--oc-danger-line)}
      .majoor-omnicam .oc-health-metrics{display:flex;flex-direction:column;gap:3px;margin-top:5px}
      .majoor-omnicam .oc-health-metric{display:flex;flex-direction:column;gap:3px;padding:4px 6px;border-radius:4px;background:var(--oc-sunken);font-size:11px}
      .majoor-omnicam .oc-health-metric-row{display:flex;align-items:center;gap:6px;width:100%}
      .majoor-omnicam .oc-health-metric-name{flex:1;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-health-metric-value{font:10.5px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-text)}
      .majoor-omnicam .oc-health-bar-track{width:100%;height:3px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden}
      .majoor-omnicam .oc-health-bar-fill{height:100%;border-radius:2px;transition:width .2s ease}
      .majoor-omnicam .oc-health-dot{flex:0 0 7px;width:7px;height:7px;border-radius:50%;background:var(--oc-health-ok)}
      .majoor-omnicam [data-grade=warn] .oc-health-dot{background:var(--oc-health-warn)}
      .majoor-omnicam [data-grade=over] .oc-health-dot{background:var(--oc-health-over)}
      .majoor-omnicam .oc-health-zones{display:flex;flex-direction:column;gap:2px}
      .majoor-omnicam .oc-health-zone-row{display:flex;align-items:center;gap:4px;width:100%}
      .majoor-omnicam .oc-health-zone{flex:1;min-width:0;display:flex;align-items:center;gap:6px;padding:3px 5px;background:var(--oc-sunken);border:1px solid transparent;border-radius:4px;color:var(--oc-text);font-size:11px;text-align:left;cursor:pointer}
      .majoor-omnicam .oc-health-zone:hover{border-color:var(--oc-line)}
      .majoor-omnicam .oc-health-zone-range{flex:0 0 auto;font:10.5px ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .oc-health-zone-reason{flex:1;overflow:hidden;color:var(--oc-text-dim);text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .oc-zone-smooth-btn{opacity:.7}
      .majoor-omnicam .oc-zone-smooth-btn:hover{opacity:1;color:var(--oc-accent)}
      .majoor-omnicam .oc-health-empty{padding:6px 5px;color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .oc-health-note{margin:6px 0 0;color:var(--oc-text-dim);font-size:10.5px;line-height:1.45}
      /* Bands sit behind the keyframe diamonds and must never eat their clicks. */
      .majoor-omnicam .oc-health-band{position:absolute;z-index:1;top:0;bottom:0;pointer-events:none}
      .majoor-omnicam .oc-health-band[data-grade=warn]{background:var(--oc-warn-bg);border-top:2px solid var(--oc-warn)}
      .majoor-omnicam .oc-health-band[data-grade=over]{background:var(--oc-danger-bg);border-top:2px solid var(--oc-danger)}

      /* ---- footer ---------------------------------------------------- */
      .majoor-omnicam .oc-footer{display:flex;align-items:center;gap:9px;padding:8px 12px;background:var(--oc-panel);border-top:1px solid var(--oc-line)}
      .majoor-omnicam .oc-footer .oc-help{flex:0 1 auto;padding:0;background:transparent}
      .majoor-omnicam .oc-footer .oc-help>summary{color:var(--oc-text-dim);font-size:11.5px}
      .majoor-omnicam .oc-help-body{position:absolute;z-index:40;max-width:520px;margin-top:7px;padding:10px 12px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:var(--oc-radius);box-shadow:0 16px 34px rgba(0,0,0,.62)}
      .majoor-omnicam label.oc-disabled{opacity:.45;cursor:not-allowed}

      /* ---- preferences modal ------------------------------------------ */
      .majoor-omnicam .oc-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.82);z-index:900;display:flex;align-items:center;justify-content:center;padding:16px}
      .majoor-omnicam .oc-pref-dialog{width:560px;max-width:100%;max-height:85vh;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);box-shadow:0 24px 64px rgba(0,0,0,.75);display:flex;flex-direction:column;overflow:hidden;outline:none}
      .majoor-omnicam .oc-pref-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--oc-line);background:var(--oc-panel-2)}
      .majoor-omnicam .oc-pref-title{font-size:13.5px;font-weight:650;color:var(--oc-text);display:flex;align-items:center;gap:8px}
      .majoor-omnicam .oc-pref-tabs{display:flex;gap:4px;padding:8px 16px;background:var(--oc-sunken);border-bottom:1px solid var(--oc-line);overflow-x:auto}
      .majoor-omnicam .oc-pref-tab{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:var(--oc-radius-sm);background:transparent;border:1px solid transparent;color:var(--oc-text-dim);font-size:11.5px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s ease}
      .majoor-omnicam .oc-pref-tab:hover{color:var(--oc-text);background:rgba(255,255,255,.05)}
      .majoor-omnicam .oc-pref-tab.active{background:var(--oc-panel-2);border-color:var(--oc-line);color:var(--oc-text)}
      .majoor-omnicam .oc-pref-content{flex:1;min-height:0;overflow-y:auto;padding:14px 18px}
      .majoor-omnicam .oc-pref-pane{display:none;flex-direction:column;gap:10px}
      .majoor-omnicam .oc-pref-pane.active{display:flex}
      .majoor-omnicam .oc-pref-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 10px;border-radius:var(--oc-radius-sm);background:rgba(0,0,0,.15);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-pref-row:hover{border-color:var(--oc-line)}
      .majoor-omnicam .oc-pref-label{font-size:12px;color:var(--oc-text);flex:1;user-select:none;cursor:pointer}
      .majoor-omnicam .oc-pref-slider-group{display:flex;align-items:center;gap:8px;width:180px}
      .majoor-omnicam .oc-pref-slider-group input[type=range]{flex:1;accent-color:var(--oc-accent)}
      .majoor-omnicam .oc-pref-val{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--oc-text-dim);min-width:32px;text-align:right}
      .majoor-omnicam .oc-pref-row select{width:180px;padding:4px 8px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line);color:var(--oc-text);font-size:11.5px}
      .majoor-omnicam .oc-pref-footer{display:flex;align-items:center;gap:10px;padding:12px 16px;border-top:1px solid var(--oc-line);background:var(--oc-panel-2)}
      .majoor-omnicam .oc-pref-spacer{flex:1}
`;
