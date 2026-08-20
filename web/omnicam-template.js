import { t as e } from "./omnicam-i18n.js";
const o = `
      .majoor-omnicam{font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--fg-color,#ddd);background:#161618;border:1px solid #383842;border-radius:10px;overflow:visible;user-select:none;container-type:inline-size}
      .majoor-omnicam *{box-sizing:border-box}
      .majoor-omnicam *::-webkit-scrollbar{width:6px;height:6px}
      .majoor-omnicam *::-webkit-scrollbar-track{background:rgba(0,0,0,0.3);border-radius:3px}
      .majoor-omnicam *::-webkit-scrollbar-thumb{background:#444456;border-radius:3px}
      .majoor-omnicam *::-webkit-scrollbar-thumb:hover{background:#65657e}
      .majoor-omnicam .top{position:relative;z-index:10;display:flex !important;flex-direction:row !important;flex-wrap:nowrap !important;gap:8px;align-items:center;min-height:38px;padding:4px 8px;background:#1e1e24;border-bottom:1px solid #32323c}
      .majoor-omnicam .top > *{flex-shrink:0}
      .majoor-omnicam button,.majoor-omnicam select,.majoor-omnicam input{font:inherit;color:#cfcfe0;background:#23232c;border:1px solid #3c3c4a;border-radius:6px;padding:4px 8px;transition:background .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease}
      .majoor-omnicam button{display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
      .majoor-omnicam select,.majoor-omnicam input{display:inline-block;vertical-align:middle}
      .majoor-omnicam [hidden],.majoor-omnicam input[hidden],.majoor-omnicam input[type="file"]{display:none !important}
      .majoor-omnicam select,.majoor-omnicam select option,.majoor-omnicam select optgroup{background-color:#202028 !important;color:#ffffff !important;color-scheme:dark}
      .majoor-omnicam select:focus{border-color:#6f9bca;box-shadow:0 0 0 1px #6f9bca}
      .majoor-omnicam select option:hover,.majoor-omnicam select option:focus,.majoor-omnicam select option:checked{background-color:#35506c !important;color:#ffffff !important}
      .majoor-omnicam button:hover{background:#31313e;border-color:#58586c;color:#fff}
      .majoor-omnicam button:active{background:#1a1a22;border-color:#30303c}
      .majoor-omnicam button.primary{background:linear-gradient(180deg,#2e7d32,#1b5e20);border-color:#4caf50;color:#fff;box-shadow:0 0 10px #2e7d3266,inset 0 1px 0 #ffffff33}
      .majoor-omnicam button.primary:hover{background:linear-gradient(180deg,#388e3c,#256e29);border-color:#81c784;box-shadow:0 0 14px #4caf5088}
      .majoor-omnicam button.active,.majoor-omnicam button[aria-pressed="true"],.majoor-omnicam .icon-button.active,.majoor-omnicam .icon-button[aria-pressed="true"]{background:linear-gradient(180deg,#2563eb,#1d4ed8) !important;border-color:#60a5fa !important;color:#ffffff !important;box-shadow:0 0 10px rgba(59,130,246,0.5),inset 0 1px 0 rgba(255,255,255,0.3) !important}
      .majoor-omnicam .icon-button{display:inline-grid !important;place-items:center !important;width:28px !important;height:28px !important;min-width:28px !important;padding:0 !important;cursor:pointer;color:#9494a8}
      .majoor-omnicam .icon-button .pi{font-size:13px;line-height:1;display:block;margin:0 auto}
      .majoor-omnicam .icon-button:hover{color:#fff;border-color:#5d5d74}
      
      /* Button Specific Active Themes */
      .majoor-omnicam [data-act="play"]{color:#4ade80;border-color:#2e7d32}
      .majoor-omnicam [data-act="play"]:hover{border-color:#4ade80;color:#86efac}
      .majoor-omnicam [data-act="play"].playing,.majoor-omnicam [data-act="play"].active{background:linear-gradient(180deg,#16a34a,#15803d) !important;border-color:#4ade80 !important;color:#fff !important;box-shadow:0 0 12px rgba(34,197,94,0.6),inset 0 1px 0 rgba(255,255,255,0.3) !important}
      
      .majoor-omnicam [data-act="auto-key"]{color:#888}
      .majoor-omnicam [data-act="auto-key"].active,.majoor-omnicam [data-act="auto-key"][aria-pressed="true"]{background:linear-gradient(180deg,#dc2626,#991b1b) !important;border-color:#f87171 !important;color:#fff !important;box-shadow:0 0 12px rgba(239,68,68,0.7),inset 0 1px 0 rgba(255,255,255,0.3) !important;animation:autoKeyBlink 1.6s infinite}
      
      .majoor-omnicam [data-act="toggle-snap"].active,.majoor-omnicam [data-act="toggle-snap"][aria-pressed="true"]{background:linear-gradient(180deg,#d97706,#b45309) !important;border-color:#fbbf24 !important;color:#fff !important;box-shadow:0 0 10px rgba(245,158,11,0.5) !important}
      .majoor-omnicam [data-act="loop"].active,.majoor-omnicam [data-act="loop"][aria-pressed="true"]{background:linear-gradient(180deg,#2563eb,#1d4ed8) !important;border-color:#60a5fa !important;color:#fff !important;box-shadow:0 0 10px rgba(59,130,246,0.5) !important}
      .majoor-omnicam [data-act="toggle-timecode"].active,.majoor-omnicam [data-act="toggle-timecode"][aria-pressed="true"]{background:linear-gradient(180deg,#7c3aed,#6d28d9) !important;border-color:#a78bfa !important;color:#fff !important;box-shadow:0 0 10px rgba(139,92,246,0.5) !important}
      .majoor-omnicam [data-act="toggle-camera-view"].active,.majoor-omnicam [data-act="toggle-inspector"].active{background:linear-gradient(180deg,#0284c7,#0369a1) !important;border-color:#38bdf8 !important;color:#fff !important;box-shadow:0 0 10px rgba(14,165,233,0.5) !important}
      
      .majoor-omnicam .toolbar-menu{position:relative}.majoor-omnicam .toolbar-menu>summary{display:flex;align-items:center;gap:6px;min-height:28px;padding:4px 9px;border:1px solid transparent;border-radius:6px;cursor:pointer;white-space:nowrap;list-style:none}.majoor-omnicam .toolbar-menu>summary::-webkit-details-marker{display:none}.majoor-omnicam .toolbar-menu[open]>summary,.majoor-omnicam .toolbar-menu>summary:hover{background:#30303c;border-color:#484858}
      .majoor-omnicam .menu-panel{position:absolute;z-index:50;top:calc(100% + 5px);left:0;display:flex;flex-direction:column;gap:5px;width:240px;padding:8px;background:#202028;border:1px solid #4a4a5a;border-radius:8px;box-shadow:0 10px 24px #000c}.majoor-omnicam .menu-panel.right{right:0;left:auto}.majoor-omnicam .menu-panel button{display:flex;align-items:center;gap:7px;text-align:left}.majoor-omnicam .menu-panel label{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#bbb}.majoor-omnicam .menu-panel label>select,.majoor-omnicam .menu-panel label>input[type=number]{width:126px}.majoor-omnicam .menu-panel label>input[type=checkbox]{width:auto}.majoor-omnicam .menu-title{color:#888;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.majoor-omnicam .menu-divider{height:1px;margin:4px 0;background:#3a3a48}.majoor-omnicam .camera-menu-list{display:flex;max-height:180px;flex-direction:column;gap:4px;overflow-y:auto}.majoor-omnicam .camera-menu-list button.selected{border-color:#e3c35d;color:#f2d06b}
      
      /* Viewport Wrapper & Prominent Highlights */
      .majoor-omnicam .viewport-wrap{position:relative;width:100%;min-height:280px;aspect-ratio:16/9;background:#0d0d10;touch-action:none;overscroll-behavior:contain;pointer-events:auto;outline:none;box-shadow:inset 0 0 0 2px rgba(255,255,255,0.08);transition:box-shadow .2s ease,border-color .2s ease}
      .majoor-omnicam .viewport-wrap.auto-key{box-shadow:inset 0 0 0 4px #f59e0b,inset 0 0 24px rgba(245,158,11,0.35),0 0 16px rgba(245,158,11,0.45);animation:autoKeyWrapGlow 2s ease-in-out infinite alternate}
      @keyframes autoKeyWrapGlow{0%{box-shadow:inset 0 0 0 3px #f59e0b,inset 0 0 16px rgba(245,158,11,0.25),0 0 10px rgba(245,158,11,0.3)}100%{box-shadow:inset 0 0 0 4px #fbbf24,inset 0 0 28px rgba(245,158,11,0.45),0 0 20px rgba(245,158,11,0.6)}}
      .majoor-omnicam .viewport-wrap.edit-mode{box-shadow:inset 0 0 0 4px #ef4444,inset 0 0 30px rgba(239,68,68,0.45),0 0 22px rgba(239,68,68,0.6) !important;animation:editModeWrapGlow 1s ease-in-out infinite alternate !important}
      @keyframes editModeWrapGlow{0%{box-shadow:inset 0 0 0 4px #ef4444,inset 0 0 20px rgba(239,68,68,0.3),0 0 14px rgba(239,68,68,0.45)}100%{box-shadow:inset 0 0 0 5px #f87171,inset 0 0 36px rgba(239,68,68,0.6),0 0 28px rgba(239,68,68,0.75)}}
      
      /* Prominent Tally / Live Recording Status Banner */
      .majoor-omnicam .viewport-tally-banner{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:8;display:inline-flex;align-items:center;gap:7px;padding:4px 14px;border-radius:20px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;pointer-events:none;backdrop-filter:blur(8px);box-shadow:0 4px 16px rgba(0,0,0,0.6);transition:all .2s ease}
      .majoor-omnicam .viewport-tally-banner[hidden]{display:none}
      .majoor-omnicam .viewport-tally-banner .tally-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
      .majoor-omnicam .viewport-wrap.auto-key .viewport-tally-banner{display:inline-flex;background:rgba(40,25,5,0.92);border:1px solid #f59e0b;color:#fef3c7;box-shadow:0 0 14px rgba(245,158,11,0.5)}
      .majoor-omnicam .viewport-wrap.auto-key .viewport-tally-banner .tally-dot{background:#f59e0b;box-shadow:0 0 8px #f59e0b;animation:tallyBlink 1.4s infinite}
      .majoor-omnicam .viewport-wrap.edit-mode .viewport-tally-banner{display:inline-flex;background:rgba(50,10,10,0.94);border:1px solid #ef4444;color:#fee2e2;box-shadow:0 0 16px rgba(239,68,68,0.6)}
      .majoor-omnicam .viewport-wrap.edit-mode .viewport-tally-banner .tally-dot{background:#ef4444;box-shadow:0 0 10px #ef4444;animation:tallyBlink .8s infinite}
      @keyframes tallyBlink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.75)}}
      
      .majoor-omnicam canvas{display:block;width:100%;height:100%;pointer-events:auto;outline:none;cursor:grab}.majoor-omnicam canvas.dragging{cursor:grabbing}
      
      /* Floating Quick Bar in Viewport */
      .majoor-omnicam .viewport-quick-bar{position:absolute;z-index:6;left:10px;top:10px;display:flex;align-items:center;gap:6px;padding:4px 8px;background:rgba(20, 20, 26, 0.88);border:1px solid rgba(255, 255, 255, 0.12);border-radius:7px;backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,0.4)}
      .majoor-omnicam .viewport-quick-bar select{height:25px;min-width:105px;font-size:11px}
      .majoor-omnicam .viewport-quick-bar button{height:25px;padding:0 7px;display:inline-flex;align-items:center;gap:4px;font-size:11px}
      .majoor-omnicam .quick-divider{width:1px;height:16px;background:rgba(255,255,255,0.15);margin:0 2px}
      
      /* Sleek Glassmorphic HUD */
      .majoor-omnicam .hud{position:absolute;left:10px;top:48px;z-index:4;color:#eee;background:rgba(16, 16, 22, 0.85);border:1px solid rgba(255, 255, 255, 0.1);border-radius:7px;padding:6px 10px;pointer-events:none;backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,0.35);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;line-height:1.45}
      .majoor-omnicam .hud .hud-badge{display:inline-block;padding:1px 5px;border-radius:4px;font-weight:700;font-size:9px;background:#35506c;color:#fff;margin-right:4px}
      .majoor-omnicam .hud .hud-badge.active{background:#c67c13;color:#fff}
      .majoor-omnicam .hud .hud-hl{color:#f2d06b;font-weight:600}
      
      /* Right Inspector Panel */
      .majoor-omnicam .viewport-inspector{position:absolute;z-index:6;right:10px;top:10px;width:250px;max-height:calc(100% - 20px);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:10px;background:rgba(22, 22, 28, 0.94);border:1px solid rgba(255, 255, 255, 0.15);border-radius:8px;backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,0.5);transition:transform .2s ease,opacity .2s ease}
      .majoor-omnicam .viewport-inspector[data-collapsed="true"]{transform:translateX(calc(100% + 15px));opacity:0;pointer-events:none}
      .majoor-omnicam .inspector-tabs{display:flex;gap:5px;margin-bottom:8px;background:#141418;padding:3px;border-radius:6px;border:1px solid #333340}
      .majoor-omnicam .inspector-tab{flex:1;text-align:center;padding:5px 3px;font-size:10px;font-weight:600;background:transparent;border:1px solid transparent;border-radius:4px;cursor:pointer;color:#888;transition:all .15s ease}
      .majoor-omnicam .inspector-tab:hover{color:#ccc;background:rgba(255,255,255,0.05)}
      .majoor-omnicam .inspector-tab.active{background:linear-gradient(180deg,#35506c,#243b52) !important;border-color:#6f9bca !important;color:#fff !important;box-shadow:0 0 8px rgba(111,155,202,0.5) !important}
      
      /* Outliner & Items */
      .majoor-omnicam .scene-tree{display:flex;flex-direction:column;gap:3px;max-height:150px;overflow-y:auto;overscroll-behavior:contain;margin-bottom:8px;background:#141418;padding:4px;border-radius:5px;border:1px solid #2e2e38}
      .majoor-omnicam .scene-item{display:flex;align-items:center;gap:6px;width:100%;min-height:24px;padding:3px 6px;text-align:left;border-color:transparent;background:transparent;border-radius:4px;font-size:11px}
      .majoor-omnicam .scene-item.selected{background:#35506c;border-color:#6f9bca;color:#fff}
      .majoor-omnicam .scene-item .pi{width:14px;text-align:center}
      
      /* Transform & Inputs Grid with Colored Axis Badges */
      .majoor-omnicam .transform-tools{display:flex;gap:6px;margin:6px 0}.majoor-omnicam .transform-tools button{width:28px;height:25px;padding:0;font-weight:600}.majoor-omnicam .transform-tools button.active{background:linear-gradient(180deg,#2563eb,#1d4ed8) !important;border-color:#60a5fa !important;color:#fff !important;box-shadow:0 0 10px rgba(59,130,246,0.6) !important}.majoor-omnicam .transform-tools select{min-width:0;flex:1;padding:2px 4px}
      .majoor-omnicam .viewport-grid{display:grid;grid-template-columns:1fr 70px;gap:5px 8px}
      .majoor-omnicam .viewport-grid label{display:contents}
      .majoor-omnicam .viewport-grid span{align-self:center;color:#bbb;display:inline-flex;align-items:center;gap:4px;font-size:11px}
      .majoor-omnicam .viewport-grid input{width:70px;padding:2px 4px;font-size:11px}
      .majoor-omnicam .axis-badge{display:inline-block;width:12px;height:12px;line-height:12px;text-align:center;font-size:9px;font-weight:700;border-radius:3px;color:#fff}
      .majoor-omnicam .axis-x{background:#ef5350}.majoor-omnicam .axis-y{background:#53d86a;color:#111}.majoor-omnicam .axis-z{background:#4aa3ef}
      .majoor-omnicam .entity-panel[hidden]{display:none}
      .majoor-omnicam .animation-row{display:flex;gap:6px;align-items:center;margin-top:6px}.majoor-omnicam .animation-row select{min-width:0;flex:1;font-size:11px}
      
      /* Camera Multi-Preview Strip */
      .majoor-omnicam .camera-view-row{position:relative;display:flex;width:100%;padding:5px 30px 5px 5px;background:#18181e;border-top:1px solid #333340}.majoor-omnicam .camera-view-row[hidden]{display:none}.majoor-omnicam .camera-preview-strip{display:grid;width:100%;grid-auto-flow:column;grid-auto-columns:minmax(220px,calc((100% - 10px)/3));gap:6px;overflow-x:auto}.majoor-omnicam .camera-preview-tile{position:relative;min-width:0;height:clamp(150px,18vw,230px);overflow:hidden;background:#101014;border:1px solid #4c4c5a;border-top:4px solid var(--camera-color);border-radius:4px;cursor:pointer}.majoor-omnicam .camera-preview-tile.playblast{border-color:#f2d06b;border-top-color:#f2d06b;box-shadow:inset 0 0 0 1px #f2d06b}.majoor-omnicam .camera-preview-head{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;align-items:center;gap:5px;min-height:25px;padding:3px 6px;background:#17171fe8;color:#ddd;font-size:10px;font-weight:700;letter-spacing:.04em;pointer-events:none}.majoor-omnicam .camera-preview-head .output-mark{margin-left:auto;color:#f2d06b}.majoor-omnicam .camera-preview-tile canvas{width:100%;height:100%;cursor:pointer}.majoor-omnicam .camera-view-badge{position:absolute;left:6px;bottom:5px;padding:2px 5px;border-radius:3px;background:#000b;color:#ddd;font-size:9px;pointer-events:none}.majoor-omnicam .camera-strip-close{position:absolute;right:4px;top:5px;width:23px;height:23px;padding:0}
      .majoor-omnicam .camera-preview-strip[data-layout="1"]{grid-auto-columns:100%}.majoor-omnicam .camera-preview-strip[data-layout="2"]{grid-auto-columns:calc((100% - 5px)/2)}.majoor-omnicam .camera-preview-strip[data-layout="4"]{grid-auto-flow:row;grid-template-columns:1fr 1fr;grid-auto-rows:minmax(140px,1fr)}
      
      /* Timeline & Keys */
      .majoor-omnicam .timeline{padding:8px 10px;background:#191920;border-top:1px solid #333340}
      .majoor-omnicam .row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.majoor-omnicam .row + .row{margin-top:6px}
      .majoor-omnicam input[type=range]{padding:0;flex:1;min-width:140px}.majoor-omnicam input[type=number]{width:68px}
      .majoor-omnicam .timeline-toolbar{justify-content:flex-start;gap:8px;align-items:center}.majoor-omnicam .timeline-summary{margin-left:auto;color:#aaa;font-size:11px}.majoor-omnicam .toolbar-divider{width:1px;height:20px;margin:0 4px;background:#3c3c4a}
      .majoor-omnicam .timeline-group{display:flex;align-items:center;gap:5px;background:#1e1e26;border:1px solid #363644;border-radius:6px;padding:3px 6px}
      .majoor-omnicam .primary-play.playing{background:#059669;border-color:#34d399;color:#fff}
      .majoor-omnicam .primary-key{background:linear-gradient(180deg,#d97706,#b45309);border-color:#f59e0b;color:#fff;font-weight:700;display:inline-flex;align-items:center;gap:4px}
      .majoor-omnicam .primary-key:hover{background:linear-gradient(180deg,#f59e0b,#d97706);border-color:#fde68a;box-shadow:0 0 8px #f59e0b88}
      .majoor-omnicam .primary-key.key-pulse{animation:keyPulseAnim 0.35s ease-out}
      @keyframes keyPulseAnim{0%{transform:scale(1);box-shadow:0 0 0px #f59e0b}50%{transform:scale(1.14);box-shadow:0 0 16px #f59e0b}100%{transform:scale(1);box-shadow:0 0 0px #f59e0b}}
      .majoor-omnicam .auto-key-btn.active{background:#7f1d1d;border-color:#ef4444;color:#fee2e2;animation:autoKeyBlink 1.8s infinite}
      @keyframes autoKeyBlink{0%,100%{box-shadow:0 0 4px #ef444466}50%{box-shadow:0 0 12px #ef4444aa}}
      .majoor-omnicam .key-interp-buttons{display:flex;gap:3px;flex-wrap:wrap;margin:4px 0 6px}
      .majoor-omnicam .key-interp-btn{font-size:10px;padding:2px 7px;border-radius:4px;border:1px solid #444455;background:#20202a;color:#ccc;cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .key-interp-btn:hover{border-color:#88a8e8;color:#fff}
      .majoor-omnicam .key-interp-btn.active{background:#d97706;border-color:#f59e0b;color:#fff;font-weight:700;box-shadow:0 0 6px #f59e0b66}
      .majoor-omnicam .floating-retime-badge{position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:#101018ee;color:#f59e0b;border:1px solid #f59e0b;border-radius:3px;font-size:9px;font-weight:700;padding:1px 5px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px #000a}
      
      .majoor-omnicam .keys{position:relative;width:100%;height:68px;margin-top:7px;overflow:hidden;background:linear-gradient(#202028,#181820);border:1px solid #414152;border-radius:6px;cursor:crosshair;outline:none;touch-action:none}
      .majoor-omnicam .keys:focus-visible{border-color:#88a8e8;box-shadow:0 0 0 1px #88a8e8}
      .majoor-omnicam .timeline-tick{position:absolute;top:0;height:100%;border-left:1px solid #3c3c4a;color:#8d8d9d;font-size:10px;padding:2px 0 0 4px;pointer-events:none}
      .majoor-omnicam .timeline-marker{position:absolute;z-index:2;top:0;bottom:0;width:1px;background:var(--marker-color,#f2d06b);pointer-events:none}.majoor-omnicam .timeline-marker::before{content:"";position:absolute;left:-4px;top:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid var(--marker-color,#f2d06b)}
      .majoor-omnicam .playback-range{position:absolute;top:0;bottom:0;background:#f2d06b14;border-left:1px solid #f2d06b88;border-right:1px solid #f2d06b88;pointer-events:none}
      .majoor-omnicam .box-select{position:absolute;z-index:4;border:1px dashed #8ab4f8;background:#8ab4f822;pointer-events:none}
      .majoor-omnicam .playhead{position:absolute;z-index:2;top:0;bottom:0;width:2px;background:#f2d06b;pointer-events:none;box-shadow:0 0 6px #f2d06b88}.majoor-omnicam .playhead::before{content:"";position:absolute;left:-5px;top:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid #f2d06b}
      /* Timeline Keyframes Visual Gradient Hierarchy */
      .majoor-omnicam .key {
        appearance: none !important;
        position: absolute !important;
        z-index: 3 !important;
        top: 14px !important;
        width: 32px !important;
        height: 48px !important;
        transform: translateX(-50%) !important;
        padding: 0 !important;
        border: 1px solid #526182 !important;
        border-radius: 6px !important;
        background: linear-gradient(180deg, #2b354f, #1a2030) !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
        cursor: ew-resize !important;
        color: #e2e8f0 !important;
        outline: none !important;
        opacity: 0.95 !important;
        transition: opacity 0.15s ease, transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease !important;
      }
      .majoor-omnicam .key:hover {
        opacity: 1 !important;
        border-color: #818cf8 !important;
        background: linear-gradient(180deg, #3d4a6e, #262e44) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7), 0 0 8px rgba(129, 140, 248, 0.4) !important;
      }
      .majoor-omnicam .key.at-playhead {
        opacity: 1 !important;
        border-color: #facc15 !important;
        box-shadow: 0 0 10px rgba(250, 204, 21, 0.5) !important;
      }
      .majoor-omnicam .key.selected {
        opacity: 1 !important;
        z-index: 5 !important;
        background: linear-gradient(180deg, #f59e0b, #b45309) !important;
        border-color: #fef08a !important;
        color: #ffffff !important;
        box-shadow: 0 0 16px rgba(245, 158, 11, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
        transform: translateX(-50%) scale(1.08) !important;
      }
      .majoor-omnicam .key.editing {
        opacity: 1 !important;
        z-index: 6 !important;
        background: linear-gradient(180deg, #ef4444, #b91c1c) !important;
        border-color: #fecaca !important;
        color: #ffffff !important;
        box-shadow: 0 0 18px rgba(239, 68, 68, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
        animation: keyEditGlow 1.2s infinite alternate !important;
      }
      @keyframes keyEditGlow {
        0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.6); }
        100% { box-shadow: 0 0 22px rgba(239, 68, 68, 1.0); }
      }
      
      .majoor-omnicam .key::before {
        content: "";
        position: absolute;
        left: 10px;
        top: 5px;
        width: 10px;
        height: 10px;
        transform: rotate(45deg);
        border: 1.5px solid #7dd3fc;
        background: #38bdf8;
        box-shadow: 0 0 6px rgba(56, 189, 248, 0.8);
        border-radius: 2px;
        transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .majoor-omnicam .key[data-interp="smooth"]::before { border-radius: 50%; transform: none; }
      .majoor-omnicam .key[data-interp="linear"]::before { border-radius: 0; transform: none; }
      .majoor-omnicam .key[data-interp="hold"]::before { border-radius: 0; transform: none; border-left-width: 3.5px; }
      
      .majoor-omnicam .key:hover::before { border-color: #ffffff; background: #60a5fa; box-shadow: 0 0 8px rgba(96, 165, 250, 0.9); }
      .majoor-omnicam .key.at-playhead::before { border-color: #ffffff; background: #fbbf24; box-shadow: 0 0 8px rgba(251, 191, 36, 0.9); }
      .majoor-omnicam .key.selected::before { border-color: #ffffff; background: #fef08a; box-shadow: 0 0 10px #fde047; }
      .majoor-omnicam .key.editing::before { border-color: #ffffff; background: #fee2e2; box-shadow: 0 0 12px #f87171; }
      
      .majoor-omnicam .key-label {
        position: absolute;
        top: 24px;
        left: 0;
        width: 32px;
        text-align: center;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 10px;
        font-weight: 700;
        color: #e2e8f0;
        line-height: 1;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
        pointer-events: none;
      }
      .majoor-omnicam .key.selected .key-label { font-weight: 700; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
      .majoor-omnicam .key.editing .key-label { font-weight: 700; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
      
      /* Curve Editor */
      .majoor-omnicam .curve-editor{margin-top:6px;border:1px solid #393946;border-radius:6px;background:#15151a}.majoor-omnicam .curve-editor>summary{display:flex;align-items:center;gap:6px;min-height:29px;padding:4px 7px;cursor:pointer;list-style:none}.majoor-omnicam .curve-editor>summary::-webkit-details-marker{display:none}.majoor-omnicam .curve-toolbar{display:flex;align-items:center;gap:4px;padding:0 6px 5px;flex-wrap:wrap}.majoor-omnicam .curve-toolbar select{height:27px;padding:2px 5px}.majoor-omnicam .curve-mode{display:inline-flex;align-items:center;gap:4px;height:27px;padding:2px 6px}.majoor-omnicam .curve-mode.active{background:#644536;border-color:#d18a57}.majoor-omnicam [data-tangent-mode].active{background:#2e4a64;border-color:#6f9bca}.majoor-omnicam [data-channel-filter="0"].active{background:#4d1d1d;border-color:#ef5350;color:#ffc7c7}.majoor-omnicam [data-channel-filter="1"].active{background:#1a4223;border-color:#53d86a;color:#c7ffd2}.majoor-omnicam [data-channel-filter="2"].active{background:#1d354d;border-color:#4aa3ef;color:#c7e6ff}.majoor-omnicam .ch-dot{display:inline-block;width:7px;height:7px;border-radius:50%}.majoor-omnicam .curve-canvas{display:block;width:100%;height:180px;border-top:1px solid #333340;background:#111114;cursor:crosshair;touch-action:none}
      
      /* Context Menu & Panels */
      .majoor-omnicam .context-menu, .context-menu.majoor-omnicam{position:fixed;z-index:100000;display:flex;min-width:220px;max-width:290px;flex-direction:column;gap:2px;padding:6px;background:#202028;border:1px solid #555566;border-radius:8px;box-shadow:0 12px 30px #000e;color:#e2e8f0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}.majoor-omnicam .context-menu[hidden],.context-menu.majoor-omnicam[hidden]{display:none}.majoor-omnicam .context-menu button,.context-menu.majoor-omnicam button{display:flex;align-items:center;gap:8px;width:100%;min-height:28px;text-align:left;border-color:transparent;background:transparent;color:#e2e8f0;font-size:12px;cursor:pointer;border-radius:4px;padding:4px 8px;border:1px solid transparent}.majoor-omnicam .context-menu button:hover,.majoor-omnicam .context-menu button:focus-visible,.context-menu.majoor-omnicam button:hover,.context-menu.majoor-omnicam button:focus-visible{background:#373744;border-color:#555566;color:#fff}.majoor-omnicam .context-menu button:disabled,.context-menu.majoor-omnicam button:disabled{opacity:.4;cursor:not-allowed}.majoor-omnicam .context-menu .danger,.context-menu.majoor-omnicam .danger{color:#ff9995}.majoor-omnicam .context-menu .shortcut,.context-menu.majoor-omnicam .shortcut{margin-left:auto;color:#888;font-size:10px}.majoor-omnicam .context-menu-separator,.context-menu.majoor-omnicam .context-menu-separator{height:1px;margin:3px;background:#414150}.majoor-omnicam .context-menu-title,.context-menu.majoor-omnicam .context-menu-title{padding:3px 7px;color:#999;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
      .majoor-omnicam .compact-panel{margin-top:6px;border:1px solid #353544;border-radius:6px;background:#202028}.majoor-omnicam .compact-panel>summary{display:flex;align-items:center;gap:6px;min-height:28px;padding:4px 7px;cursor:pointer;color:#ccc;list-style:none}.majoor-omnicam .compact-panel>summary::-webkit-details-marker{display:none}.majoor-omnicam .compact-panel>summary::after{content:"›";margin-left:auto;transform:rotate(90deg);color:#777}.majoor-omnicam .compact-panel[open]>summary::after{transform:rotate(-90deg)}.majoor-omnicam .panel-body{padding:0 7px 7px}
      .majoor-omnicam .key-editor-header{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:6px}.majoor-omnicam .key-editor-grid,.majoor-omnicam .inspector-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:5px}.majoor-omnicam .key-editor-grid label,.majoor-omnicam .inspector-grid label{display:flex;align-items:center;justify-content:space-between;gap:4px;color:#bbb}.majoor-omnicam .key-editor-grid input,.majoor-omnicam .key-editor-grid select,.majoor-omnicam .inspector-grid input,.majoor-omnicam .inspector-grid select{min-width:0;width:70px}.majoor-omnicam .key-editor[data-empty="true"] .key-editor-grid{opacity:.45}
      .majoor-omnicam .status{margin-left:auto;color:#aaa}.majoor-omnicam .hint{color:#aaa;font-size:11px}
      .majoor-omnicam details.help{padding:7px 10px;background:#181820;color:#c8c8c8}.majoor-omnicam details.help summary{cursor:pointer;color:#f2d06b}.majoor-omnicam details.help p{margin:6px 0}
      @container (max-width:700px){.majoor-omnicam .top{overflow-x:auto;overflow-y:hidden}.majoor-omnicam .viewport-quick-bar{right:10px;max-width:calc(100% - 20px);overflow-x:auto}.majoor-omnicam .viewport-tally-banner{top:48px;max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.majoor-omnicam .hud{top:78px;right:10px;max-width:calc(100% - 20px);overflow:hidden;text-overflow:ellipsis}.majoor-omnicam .viewport-inspector{top:auto;bottom:10px;width:min(250px,calc(100% - 20px));max-height:42%}.majoor-omnicam .timeline-toolbar{overflow-x:auto;flex-wrap:nowrap}.majoor-omnicam .timeline-summary{display:none}}
      @container (max-width:460px){.majoor-omnicam .viewport-wrap{min-height:360px;aspect-ratio:auto}.majoor-omnicam .camera-preview-strip[data-layout="2"],.majoor-omnicam .camera-preview-strip[data-layout="4"]{grid-auto-flow:row;grid-template-columns:1fr;grid-auto-columns:100%}.majoor-omnicam .menu-panel{width:min(240px,calc(100cqw - 24px))}}
`;
function n() {
  const t = document.createElement("div");
  t.className = "majoor-omnicam", t.innerHTML = `
    <style>${o}</style>
    <div class="top">
      <details class="toolbar-menu" data-menu="scene"><summary><i class="pi pi-box"></i> ${e("Scene")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
        <div class="menu-title">${e("Upstream Sync & Imports")}</div>
        <button data-act="sync-inputs" class="primary" style="margin-bottom:4px"><i class="pi pi-sync"></i> ${e("Sync Upstream Inputs")}</button>
        <button data-act="load-card"><i class="pi pi-image"></i> ${e("Set Subject Card")}</button>
        <button data-act="add-card"><i class="pi pi-images"></i> ${e("Add Media Card")}</button>
        <button data-act="load-model"><i class="pi pi-box"></i> ${e("Import 3D Scene")}</button>
        <button data-act="load-audio"><i class="pi pi-volume-up"></i> ${e("Load Audio Track")}</button>
        <span class="hint">${e("GLB, OBJ, FBX, STL, PLY. Audio WAV/MP3/OGG.")}</span>
        <div class="menu-divider"></div><div class="menu-title">${e("Objects & Primitives")}</div>
        <button data-object-type="ground"><i class="pi pi-minus"></i> ${e("Ground Plane")}</button>
        <button data-object-type="cube"><i class="pi pi-stop"></i> ${e("Cube")}</button>
        <button data-object-type="sphere"><i class="pi pi-circle"></i> ${e("Sphere")}</button>
        <button data-object-type="human"><i class="pi pi-user"></i> ${e("Human Proxy")}</button>
        <button data-object-type="null"><i class="pi pi-plus"></i> ${e("Null Locator")}</button>
        <div class="menu-divider"></div>
        <button data-act="clear-caches" class="primary" style="margin-top:2px"><i class="pi pi-trash"></i> ${e("Clear Caches & Clean")}</button>
      </div></details>
      <input data-role="file" type="file" accept="image/*,video/*" style="display:none !important" hidden><input data-role="model-file" type="file" accept=".glb,.obj,.fbx,.stl,.ply" style="display:none !important" hidden><input data-role="audio-file" type="file" accept="audio/*,.wav,.mp3,.ogg,.flac" style="display:none !important" hidden><input data-role="viewport-bg-file" type="file" accept="image/*" style="display:none !important" hidden><input data-role="viewport-bg-seq-file" type="file" accept="image/*" multiple style="display:none !important" hidden>
      <details class="toolbar-menu" data-menu="camera"><summary><i class="pi pi-video"></i> <span data-role="camera-summary">${e("Camera 1 · Key F0")}</span> <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
        <div class="menu-title">${e("Animated cameras")}</div><div class="camera-menu-list" data-role="camera-menu-list"></div><button data-act="add-camera"><i class="pi pi-plus"></i> ${e("Add Camera")}</button><div class="menu-divider"></div>
        <div class="menu-title">${e("Targeting")}</div>
        <button data-act="aim-at-object" class="primary"><i class="pi pi-compass"></i> ${e("Aim at Target Subject")}</button>
        <button data-act="focus-target"><i class="pi pi-crosshairs"></i> ${e("Frame Camera Target")}</button>
        <div class="menu-divider"></div>
        <label>${e("FOV")} <input data-role="fov" type="number" min="5" max="150" step="1" value="35"></label><label>${e("Roll")} <input data-role="roll" type="number" min="-180" max="180" step="1" value="0"></label><label>${e("Move speed")} <input data-role="speed" type="number" min="0.05" max="5" step="0.05" value="1"></label>
        <label>${e("Projection")} <select data-role="camera-type"><option value="perspective">${e("Perspective")}</option><option value="orthographic">${e("Orthographic")}</option></select></label><label>${e("New key interpolation")} <select data-role="interp"><option value="ease">${e("Ease")}</option><option value="smooth">${e("Smooth")}</option><option value="bezier">${e("Bezier")}</option><option value="linear">${e("Linear")}</option><option value="ease_in">${e("Ease In")}</option><option value="ease_out">${e("Ease Out")}</option></select></label>
        <div class="menu-divider"></div><div class="menu-title">${e("Motion Presets & Shake")}</div>
        <button data-preset="orbit_360"><i class="pi pi-compass"></i> ${e("Orbit 360°")}</button><button data-preset="push_in"><i class="pi pi-arrow-down-left"></i> ${e("Push In")}</button><button data-preset="pull_out"><i class="pi pi-arrow-up-right"></i> ${e("Pull Out")}</button><button data-preset="dolly_zoom"><i class="pi pi-sync"></i> ${e("Dolly Zoom (Vertigo)")}</button><button data-shake="handheld_subtle"><i class="pi pi-sliders-h"></i> ${e("Handheld Shake")}</button><button data-shake="turbulence"><i class="pi pi-bolt"></i> ${e("Turbulence Shake")}</button>
        <div class="menu-divider"></div><button data-act="reset-camera"><i class="pi pi-refresh"></i> ${e("Reset Camera")}</button>
      </div></details>
      <details class="toolbar-menu" data-menu="show"><summary><i class="pi pi-eye"></i> ${e("Show")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
        <label><span><i class="pi pi-th-large"></i> ${e("Guides")}</span><input data-role="guides" type="checkbox" checked></label>
        <label><span><i class="pi pi-table"></i> ${e("Playblast Grid")}</span><input data-role="playblast-grid" type="checkbox"></label>
        <label><span><i class="pi pi-share-alt"></i> ${e("Wireframe / Edges")}</span><input data-role="show-wireframe" type="checkbox"></label>
        <label><span><i class="pi pi-circle"></i> ${e("Mesh Vertices")}</span><input data-role="show-vertices" type="checkbox"></label>
        <label><span><i class="pi pi-tag"></i> ${e("Burn-in")}</span><input data-role="burn-in" type="checkbox"></label>
        <label><span><i class="pi pi-chart-line"></i> ${e("Speed map")}</span><input data-role="speed-heatmap" type="checkbox"></label>
        <div class="menu-divider"></div>
        <label>${e("Select mode")} <select data-role="select-mode"><option value="object" selected>${e("Object (4)")}</option><option value="vertex">${e("Vertex (1)")}</option><option value="edge">${e("Edge (2)")}</option><option value="face">${e("Face (3)")}</option></select></label>
        <label>${e("Proxy mode")} <select data-role="mode"><option value="omni_ref">${e("Omni Ref")}</option><option value="card_grid">${e("Card + Grid")}</option><option value="graybox">${e("Graybox")}</option><option value="grid">${e("Grid")}</option><option value="point_field">${e("Point Field")}</option><option value="wireframe">${e("Wireframe")}</option></select></label>
        <label>${e("Point density")} <select data-role="point-density"><option value="none">${e("None (0)")}</option><option value="sparse">${e("Sparse (300)")}</option><option value="balanced" selected>${e("Balanced (800)")}</option><option value="dense">${e("Dense (1800)")}</option><option value="ultra">${e("Ultra (3500)")}</option></select></label>
        <label>${e("Point color")} <input data-role="point-color" type="color" value="#cbd5e1" style="width:48px;height:24px;padding:0;cursor:pointer;background:transparent;border:1px solid #555"></label>
        <label>${e("Point spread")} <select data-role="point-spread"><option value="all_views" selected>${e("All Views (Full 3D)")}</option><option value="ground_focus">${e("Ground + Low Angle")}</option><option value="dome">${e("Spherical Dome")}</option></select></label>
        <label>${e("Card fit")} <select data-role="card-fit"><option value="contain">${e("Fit")}</option><option value="cover">${e("Fill")}</option><option value="stretch">${e("Stretch")}</option></select></label>
        <div class="menu-divider"></div><div class="menu-title">${e("Environment & Background")}</div>
        <label>${e("BG Color")} <input data-role="viewport-bg-color" type="color" value="#121212" style="width:48px;height:24px;padding:0;cursor:pointer;background:transparent;border:1px solid #555"></label>
        <div style="display:flex;gap:4px">
          <button data-act="upload-viewport-bg" style="flex:1"><i class="pi pi-image"></i> ${e("BG Image")}</button>
          <button data-act="upload-viewport-bg-seq" style="flex:1"><i class="pi pi-images"></i> ${e("BG Sequence")}</button>
          <button data-act="clear-viewport-bg" style="width:28px;padding:0" title="${e("Clear Background")}"><i class="pi pi-trash"></i></button>
        </div>
        <div class="menu-divider"></div><div class="menu-title">${e("Previews")}</div><label>${e("Layout")} <select data-role="preview-layout"><option value="auto">${e("Auto strip")}</option><option value="1">${e("Single")}</option><option value="2">${e("Side by side")}</option><option value="4">${e("Quad")}</option></select></label><label><span><i class="pi pi-shield"></i> ${e("Safe areas")}</span><input data-role="safe-areas" type="checkbox"></label><label><span><i class="pi pi-frame"></i> ${e("Resolution gate")}</span><input data-role="resolution-gate" type="checkbox"></label><label>${e("Aspect")} <select data-role="aspect-ratio"><option value="auto">${e("Auto")}</option><option value="16:9">16:9</option><option value="4:3">4:3</option><option value="1:1">1:1</option><option value="9:16">9:16</option><option value="2.39:1">2.39:1</option></select></label>
        <label>${e("Interface")} <select data-role="ui-density"><option value="basic">${e("Basic")}</option><option value="animation">${e("Animation")}</option><option value="advanced" selected>${e("Advanced")}</option></select></label>
      </div></details>
      <details class="toolbar-menu" data-menu="output"><summary><i class="pi pi-send"></i> ${e("Output")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel right">
        <label>${e("Playblast camera")} <select data-role="playblast-camera"></select></label><label>${e("H3 preset")} <select data-role="proxy-preset"><option value="balanced">${e("Balanced")}</option><option value="parallax">${e("Parallax")}</option><option value="subject">${e("Subject")}</option><option value="debug">${e("Debug")}</option></select></label><label>${e("Encoder")} <select data-role="encoder"><option value="auto">${e("WebCodecs")}</option><option value="realtime">${e("Realtime fallback")}</option></select></label>
        <button data-act="h3-setup" class="primary" style="margin-top:4px" title="${e("Create the H3 reference nodes")}"><i class="pi pi-bolt"></i> ${e("H3 Setup")}</button>
        <div class="menu-divider"></div><div class="setup-badge" data-role="setup-badge" hidden></div><div data-role="setup-issues"></div>
      </div></details>
      <button data-act="clear-caches" title="${e("Clear WebGL textures, temporary files and memory caches")}" style="display:inline-flex;align-items:center;gap:4px;padding:3px 7px;font-size:11px"><i class="pi pi-trash"></i> ${e("Clean")}</button>
      <span class="status" data-role="status">${e("Ready")}</span>
    </div>
    <div class="viewport-wrap">
      <canvas tabindex="0"></canvas>
      
      <!-- Prominent Tally / Live Recording Status Banner -->
      <div class="viewport-tally-banner" data-role="tally-banner" hidden>
        <span class="tally-dot"></span>
        <span class="tally-text" data-role="tally-text">REC KEY @ F0</span>
      </div>
      
      <!-- Ergonomic Viewport Quick Bar -->
      <div class="viewport-quick-bar">
        <select data-role="view-mode" title="${e("View mode: Camera (Numpad 0), Perspective (Numpad 1), Top (7), Side (3)")}">
          <option value="camera">${e("Camera View")}</option>
          <option value="perspective">${e("Perspective")}</option>
          <option value="top">${e("Top View")}</option>
          <option value="right">${e("Right Side")}</option>
          <option value="left">${e("Left Side")}</option>
          <option value="bottom">${e("Bottom View")}</option>
        </select>
        <span class="quick-divider"></span>
        <button class="icon-button" data-act="focus-target" title="${e("Frame Subject Target (F)")}"><i class="pi pi-search"></i></button>
        <button class="icon-button" data-act="toggle-camera-view" title="${e("Toggle Camera Previews Strip")}"><i class="pi pi-video"></i></button>
        <span class="quick-divider"></span>
        <button class="icon-button active" data-select-mode="object" title="${e("Object Select Mode (4)")}"><i class="pi pi-box" style="font-size:10px"></i></button>
        <button class="icon-button" data-select-mode="vertex" title="${e("Vertex Select Mode (1)")}"><i class="pi pi-circle" style="font-size:10px"></i></button>
        <button class="icon-button" data-select-mode="edge" title="${e("Edge Select Mode (2)")}"><i class="pi pi-minus" style="font-size:10px"></i></button>
        <button class="icon-button" data-select-mode="face" title="${e("Face / Polygon Select Mode (3)")}"><i class="pi pi-stop" style="font-size:10px"></i></button>
        <span class="quick-divider"></span>
        <button class="icon-button active" data-transform-mode="translate" title="${e("Translate / Move (W)")}">W</button>
        <button class="icon-button" data-transform-mode="rotate" title="${e("Rotate (E)")}">E</button>
        <button class="icon-button" data-transform-mode="scale" title="${e("Scale (R)")}">R</button>
        <button class="icon-button" data-act="clear-selection" title="${e("Select Tool (Q)")}">Q</button>
        <span class="quick-divider"></span>
        <button class="primary" data-act="record" title="${e("Record proxy playblast")}"><i class="pi pi-video"></i> ${e("Playblast")}</button>
        <button class="icon-button" data-act="toggle-inspector" title="${e("Toggle Inspector Panel (N)")}"><i class="pi pi-sliders-h"></i></button>
      </div>

      <!-- Modern Glassmorphic HUD -->
      <div class="hud" data-role="hud"></div>

      <!-- Tabbed 3D Inspector Drawer -->
      <div class="viewport-inspector" data-role="viewport-inspector">
        <div class="inspector-tabs">
          <button class="inspector-tab active" data-tab="scene"><i class="pi pi-box"></i> ${e("Scene")}</button>
          <button class="inspector-tab" data-tab="camera"><i class="pi pi-video"></i> ${e("Camera")}</button>
          <button class="inspector-tab" data-tab="display"><i class="pi pi-eye"></i> ${e("Display")}</button>
        </div>

        <!-- TAB 1: Scene & Objects -->
        <div class="inspector-tab-content" data-tab-panel="scene">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <div class="menu-title" style="margin:0">${e("Outliner")}</div>
            <button data-act="load-model" class="icon-button" style="width:20px;height:20px;min-width:20px;border-radius:4px" title="${e("Import 3D Model (+)")}"><i class="pi pi-plus" style="font-size:10px"></i></button>
          </div>
          <div style="display:flex;gap:3px;margin-bottom:6px;overflow-x:auto">
            <button data-object-type="ground" style="font-size:10px;padding:2px 5px" title="${e("Add Ground (+)")}"><i class="pi pi-minus"></i> ${e("Ground")}</button>
            <button data-object-type="cube" style="font-size:10px;padding:2px 5px" title="${e("Add Cube (+)")}"><i class="pi pi-stop"></i> ${e("Cube")}</button>
            <button data-object-type="sphere" style="font-size:10px;padding:2px 5px" title="${e("Add Sphere (+)")}"><i class="pi pi-circle"></i> ${e("Sphere")}</button>
            <button data-object-type="human" style="font-size:10px;padding:2px 5px" title="${e("Add Human (+)")}"><i class="pi pi-user"></i> ${e("Human")}</button>
            <button data-object-type="null" style="font-size:10px;padding:2px 5px" title="${e("Add Null (+)")}"><i class="pi pi-plus"></i> ${e("Null")}</button>
          </div>
          <div class="scene-tree" data-role="objects"></div>
          
          <div class="entity-panel" data-role="object-panel">
            <div class="menu-title" data-role="selected-name">${e("Object Transform")}</div>
            <div class="transform-tools">
              <button data-transform-mode="translate" title="${e("Translate (W)")}">W</button>
              <button data-transform-mode="rotate" title="${e("Rotate (E)")}">E</button>
              <button data-transform-mode="scale" title="${e("Scale (R)")}">R</button>
              <select data-role="gizmo-space" title="${e("Transform space")}"><option value="world">${e("World")}</option><option value="local">${e("Local")}</option></select>
            </div>
            <div class="animation-row" style="display:flex;align-items:center;gap:6px"><i class="pi pi-palette"></i><select data-role="object-material" style="flex:1" title="${e("Viewport material")}"><option value="textured">${e("Textures")}</option><option value="checker">${e("Checker")}</option><option value="neutral">${e("Neutral")}</option><option value="wireframe">${e("Wireframe")}</option></select><input data-role="object-color" type="color" value="#8c929b" title="${e("Object Color")}" style="width:28px;height:24px;padding:0;cursor:pointer;background:transparent;border:1px solid #555;border-radius:4px"></div>
            <div class="animation-row"><i class="pi pi-sitemap"></i><select data-role="object-parent" title="${e("Parent object")}"><option value="">${e("No parent")}</option></select></div>
            <div class="viewport-grid" style="margin-top:6px">
              <label><span><strong class="axis-badge axis-x">X</strong> ${e("Pos")}</span><input data-role="object-x" type="number" step="0.1"></label>
              <label><span><strong class="axis-badge axis-y">Y</strong> ${e("Pos")}</span><input data-role="object-y" type="number" step="0.1"></label>
              <label><span><strong class="axis-badge axis-z">Z</strong> ${e("Pos")}</span><input data-role="object-z" type="number" step="0.1"></label>
              <label><span><strong class="axis-badge axis-x">X</strong> ${e("Rot")}</span><input data-role="object-rx" type="number" step="1"></label>
              <label><span><strong class="axis-badge axis-y">Y</strong> ${e("Rot")}</span><input data-role="object-ry" type="number" step="1"></label>
              <label><span><strong class="axis-badge axis-z">Z</strong> ${e("Rot")}</span><input data-role="object-rz" type="number" step="1"></label>
              <label><span><strong class="axis-badge axis-x">X</strong> ${e("Scale")}</span><input data-role="object-sx" type="number" min="0.01" step="0.1"></label>
              <label><span><strong class="axis-badge axis-y">Y</strong> ${e("Scale")}</span><input data-role="object-sy" type="number" min="0.01" step="0.1"></label>
              <label><span><strong class="axis-badge axis-z">Z</strong> ${e("Scale")}</span><input data-role="object-sz" type="number" min="0.01" step="0.1"></label>
            </div>
            <div class="animation-row" data-role="animation-row" hidden><i class="pi pi-play-circle"></i><select data-role="animation-select" title="${e("Animation clip")}"></select></div>
          </div>
          <div class="animation-row" style="margin-top:8px"><i class="pi pi-images"></i><select data-role="reference-select" title="${e("Upstream reference")}"><option value="0">${e("Upstream 1")}</option></select></div>
        </div>

        <!-- TAB 2: Camera & Optic -->
        <div class="inspector-tab-content" data-tab-panel="camera" hidden>
          <div class="menu-title">${e("Active Camera")}</div>
          <div class="animation-row" style="margin-bottom:5px;display:flex;align-items:center;gap:6px">
            <i class="pi pi-video"></i>
            <select data-role="active-camera-select" style="flex:1" title="${e("Switch Active Camera")}"></select>
            <input data-role="camera-color" type="color" value="#4aa3ef" title="${e("Camera Color")}" style="width:28px;height:24px;padding:0;cursor:pointer;background:transparent;border:1px solid #555;border-radius:4px">
          </div>
          <div style="display:flex;gap:4px;margin-bottom:8px">
            <button data-act="add-camera" class="icon-button" style="flex:1;font-size:11px" title="${e("Create camera from current view")}"><i class="pi pi-plus"></i> ${e("Add Camera")}</button>
            <button data-act="reset-camera" class="icon-button" style="font-size:11px;padding:0 6px" title="${e("Reset active camera")}"><i class="pi pi-refresh"></i></button>
          </div>

          <div class="menu-title">${e("Look-At Tracking Constraint")}</div>
          <div class="animation-row" style="margin-bottom:5px">
            <i class="pi pi-crosshairs"></i>
            <select data-role="camera-target-object" title="${e("Track / Follow Moving Target Object")}">
              <option value="">${e("Manual Target (No Tracking)")}</option>
            </select>
          </div>
          <div style="display:flex;gap:4px;margin-bottom:8px">
            <button data-act="aim-at-object" class="primary" style="flex:1" title="${e("Aim & Follow object along timeline")}"><i class="pi pi-compass"></i> ${e("Aim & Follow")}</button>
            <button data-act="bake-aim-keys" style="padding:0 6px" title="${e("Bake live target tracking to camera keyframes")}"><i class="pi pi-check-square"></i> ${e("Bake")}</button>
          </div>

          <div class="menu-title">${e("Camera Transform & Lens")}</div>
          <div style="display:flex;gap:4px;margin-bottom:6px">
            <label style="flex:1;font-size:11px">${e("Type")} <select data-role="camera-type"><option value="perspective">${e("Perspective")}</option><option value="orthographic">${e("Orthographic")}</option></select></label>
            <label style="flex:1;font-size:11px">${e("Speed")} <input data-role="speed" type="number" min="0.05" max="5" step="0.05" value="1"></label>
          </div>
          <div class="viewport-grid">
            <label><span><strong class="axis-badge axis-x">X</strong> ${e("Pos")}</span><input data-role="camera-px" type="number" step="0.1"></label>
            <label><span><strong class="axis-badge axis-y">Y</strong> ${e("Pos")}</span><input data-role="camera-py" type="number" step="0.1"></label>
            <label><span><strong class="axis-badge axis-z">Z</strong> ${e("Pos")}</span><input data-role="camera-pz" type="number" step="0.1"></label>
            <label><span><strong class="axis-badge axis-x">X</strong> ${e("Tgt")}</span><input data-role="camera-tx" type="number" step="0.1"></label>
            <label><span><strong class="axis-badge axis-y">Y</strong> ${e("Tgt")}</span><input data-role="camera-ty" type="number" step="0.1"></label>
            <label><span><strong class="axis-badge axis-z">Z</strong> ${e("Tgt")}</span><input data-role="camera-tz" type="number" step="0.1"></label>
            <label><span>${e("FOV")}</span><input data-role="camera-fov" type="number" min="5" max="150" step="0.1"></label>
            <label><span>${e("Roll")}</span><input data-role="camera-roll" type="number" min="-180" max="180" step="0.1"></label>
            <label><span>${e("Near")}</span><input data-role="camera-near" type="number" min="0.0001" step="0.001"></label>
            <label><span>${e("Far")}</span><input data-role="camera-far" type="number" min="0.0002" step="1"></label>
          </div>
          
          <div class="menu-title" style="margin-top:8px">${e("Cinema Lens (35mm Equiv.)")}</div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:3px;margin-top:4px">
            <button data-lens="14" style="font-size:10px;padding:2px" title="${e("14mm Ultra-Wide")}"><i class="pi pi-eye"></i> 14mm</button>
            <button data-lens="24" style="font-size:10px;padding:2px" title="${e("24mm Cinematic Wide")}"><i class="pi pi-eye"></i> 24mm</button>
            <button data-lens="35" style="font-size:10px;padding:2px" title="${e("35mm Normal Wide")}"><i class="pi pi-eye"></i> 35mm</button>
            <button data-lens="50" style="font-size:10px;padding:2px" title="${e("50mm Standard Human Eye")}"><i class="pi pi-eye"></i> 50mm</button>
            <button data-lens="85" style="font-size:10px;padding:2px" title="${e("85mm Portrait Compression")}"><i class="pi pi-eye"></i> 85mm</button>
            <button data-lens="135" style="font-size:10px;padding:2px" title="${e("135mm Telephoto")}"><i class="pi pi-eye"></i> 135mm</button>
          </div>

          <div class="menu-title" style="margin-top:8px">${e("Blocking Scene Sets (Parallax / Occlusion)")}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:4px">
            <button data-blocking-scene="foreground_reveal" style="font-size:10px;padding:3px" title="${e("Foreground pillar sweep reveal")}"><i class="pi pi-objects-column"></i> ${e("FG Reveal")}</button>
            <button data-blocking-scene="doorway_pass" style="font-size:10px;padding:3px" title="${e("Push-in through doorway opening")}"><i class="pi pi-sign-in"></i> ${e("Doorway Pass")}</button>
            <button data-blocking-scene="over_the_shoulder" style="font-size:10px;padding:3px" title="${e("Over the shoulder frame")}"><i class="pi pi-user"></i> ${e("OTS Frame")}</button>
            <button data-blocking-scene="perspective_corridor" style="font-size:10px;padding:3px" title="${e("Perspective depth colonnade")}"><i class="pi pi-arrows-v"></i> ${e("Corridor")}</button>
            <button data-blocking-scene="tabletop_orbit" style="font-size:10px;padding:3px;grid-column:span 2" title="${e("Product pedestal 360 orbit")}"><i class="pi pi-sync"></i> ${e("Tabletop 360° Orbit")}</button>
          </div>

          <div class="menu-title" style="margin-top:8px">${e("Motion Presets")}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:4px">
            <button data-preset="orbit_360" style="font-size:10px;padding:3px"><i class="pi pi-compass"></i> ${e("Orbit 360°")}</button>
            <button data-preset="push_in" style="font-size:10px;padding:3px"><i class="pi pi-arrow-down-left"></i> ${e("Push In")}</button>
            <button data-preset="pull_out" style="font-size:10px;padding:3px"><i class="pi pi-arrow-up-right"></i> ${e("Pull Out")}</button>
            <button data-preset="dolly_zoom" style="font-size:10px;padding:3px"><i class="pi pi-sync"></i> ${e("Dolly Zoom")}</button>
          </div>

          <div class="menu-title" style="margin-top:8px">${e("Camera Shakes")}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:4px">
            <button data-shake="handheld" style="font-size:10px;padding:3px"><i class="pi pi-wave-pulse"></i> ${e("Handheld")}</button>
            <button data-shake="subtle" style="font-size:10px;padding:3px"><i class="pi pi-circle"></i> ${e("Subtle")}</button>
            <button data-shake="turbulence" style="font-size:10px;padding:3px"><i class="pi pi-bolt"></i> ${e("Turbulence")}</button>
            <button data-shake="crash" style="font-size:10px;padding:3px"><i class="pi pi-exclamation-triangle"></i> ${e("Crash")}</button>
          </div>
        </div>

        <!-- TAB 3: Display & Guides -->
        <div class="inspector-tab-content" data-tab-panel="display" hidden>
          <div class="menu-title">${e("Composition Guides & Mini-Map")}</div>
          <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px">
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-compass"></i> ${e("2D Radar Mini-Map")}</span><input data-role="show-radar" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-th-large"></i> ${e("Rule of Thirds")}</span><input data-role="guides" type="checkbox" checked></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-share-alt"></i> ${e("Wireframe / Edges")}</span><input data-role="show-wireframe" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-circle"></i> ${e("Mesh Vertices")}</span><input data-role="show-vertices" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span>${e("Selection Mode")}</span><select data-role="select-mode" style="font-size:11px"><option value="object">${e("Object (4)")}</option><option value="vertex">${e("Vertex (1)")}</option><option value="edge">${e("Edge (2)")}</option><option value="face">${e("Face (3)")}</option></select></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-shield"></i> ${e("Safe Areas (90%/80%)")}</span><input data-role="safe-areas" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-frame"></i> ${e("Resolution Gate")}</span><input data-role="resolution-gate" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span>${e("Aspect Ratio")}</span><select data-role="aspect-ratio" style="font-size:11px"><option value="auto">${e("Auto")}</option><option value="16:9">16:9</option><option value="4:3">4:3</option><option value="1:1">1:1</option><option value="9:16">9:16</option><option value="2.39:1">2.39:1</option></select></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-table"></i> ${e("Floor Grid")}</span><input data-role="playblast-grid" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-tag"></i> ${e("Burn-in Data")}</span><input data-role="burn-in" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-chart-line"></i> ${e("Speed Map")}</span><input data-role="speed-heatmap" type="checkbox"></label>
          </div>
          <div class="menu-divider" style="margin:8px 0"></div>
          <div class="menu-title">${e("Environment & Background")}</div>
          <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb;margin-top:4px">
            <span>${e("BG Color")}</span>
            <input data-role="viewport-bg-color" type="color" value="#121212" style="width:44px;height:22px;padding:0;cursor:pointer;background:transparent;border:1px solid #555">
          </label>
          <div style="display:flex;gap:3px;margin-top:6px">
            <button data-act="upload-viewport-bg" style="flex:1;font-size:10px"><i class="pi pi-image"></i> ${e("Image")}</button>
            <button data-act="upload-viewport-bg-seq" style="flex:1;font-size:10px"><i class="pi pi-images"></i> ${e("Sequence")}</button>
            <button data-act="clear-viewport-bg" style="width:24px;padding:0" title="${e("Clear Background")}"><i class="pi pi-trash"></i></button>
          </div>
        </div>
      </div>
    </div>
    <div class="camera-view-row" data-role="camera-view-row"><div class="camera-preview-strip" data-role="camera-previews"></div><button class="camera-strip-close" data-act="toggle-camera-view" title="${e("Hide camera previews")}"><i class="pi pi-times"></i></button></div>
    <div class="timeline">
      <div class="row timeline-toolbar">
        <!-- Transport Cluster -->
        <div class="timeline-group" title="${e("Playback Transport")}">
          <button class="icon-button" data-act="key-first" title="${e("First Frame (Home)")}" aria-label="${e("Go to first frame")}"><i class="pi pi-step-backward-alt"></i></button>
          <button class="icon-button" data-act="previous-key" title="${e("Previous Keyframe (, / Up Arrow)")}" aria-label="${e("Previous keyframe")}"><i class="pi pi-fast-backward"></i></button>
          <button class="icon-button" data-act="previous-frame" title="${e("Previous Frame (Left Arrow)")}" aria-label="${e("Previous frame")}"><i class="pi pi-step-backward"></i></button>
          <button class="icon-button primary-play" data-act="play" title="${e("Play / Stop (Space)")}" aria-label="${e("Play timeline")}"><i class="pi pi-play"></i></button>
          <button class="icon-button" data-act="next-frame" title="${e("Next Frame (Right Arrow)")}" aria-label="${e("Next frame")}"><i class="pi pi-step-forward"></i></button>
          <button class="icon-button" data-act="next-key" title="${e("Next Keyframe (. / Down Arrow)")}" aria-label="${e("Next keyframe")}"><i class="pi pi-fast-forward"></i></button>
          <button class="icon-button" data-act="key-last" title="${e("Last Frame (End)")}" aria-label="${e("Go to last frame")}"><i class="pi pi-step-forward-alt"></i></button>
          <button class="icon-button" data-act="loop" title="${e("Toggle Loop Playback")}" aria-label="${e("Loop playback")}" aria-pressed="false"><i class="pi pi-replay"></i></button>
        </div>

        <!-- Keyframing Cluster -->
        <div class="timeline-group" title="${e("Keyframe Tools")}">
          <button class="icon-button primary-key" data-act="key" title="${e("Insert / Update Keyframe at Playhead (I)")}" aria-label="${e("Insert or update key")}"><i class="pi pi-key"></i></button>
          <button class="icon-button auto-key-btn" data-act="auto-key" title="${e("Auto-Key: Records moves live while scrubbing/navigating")}" aria-label="${e("Toggle Auto Key")}" aria-pressed="false"><i class="pi pi-circle-fill" style="color:#ef4444;font-size:11px"></i></button>
          <button class="icon-button" data-act="delete-key" title="${e("Delete Selected Keyframe (Del / Backspace)")}" aria-label="${e("Delete selected key")}"><i class="pi pi-trash"></i></button>
          <button class="icon-button" data-act="copy-key" title="${e("Copy Keyframe (Ctrl+C)")}" aria-label="${e("Copy selected key")}"><i class="pi pi-copy"></i></button>
          <button class="icon-button" data-act="paste-key" title="${e("Paste Keyframe at Playhead (Ctrl+V)")}" aria-label="${e("Paste key at playhead")}"><i class="pi pi-clipboard"></i></button>
        </div>

        <!-- Time & Scrub Cluster -->
        <div class="timeline-group" style="flex:1;min-width:240px">
          <span class="timeline-badge" style="font-weight:700;color:#f2d06b">F</span>
          <input data-role="frame" type="number" min="0" value="0" style="width:52px;text-align:center;font-weight:700">
          <input data-role="scrub" type="range" min="0" max="119" value="0" style="flex:1">
          <span data-role="time" class="time-display" title="${e("Click to toggle Time / Timecode")}" style="cursor:pointer;font-family:monospace;font-size:11px;padding:2px 4px;background:#131318;border-radius:3px">00:00.000</span>
        </div>

        <!-- Range, Snapping & Settings Cluster -->
        <div class="timeline-group">
          <label style="font-size:10px">${e("Dur")} <input data-role="duration-seconds" type="number" min="0.25" max="120" step="0.25" value="5" style="width:42px"></label>
          <label style="font-size:10px">${e("FPS")} <input data-role="timeline-fps" type="number" min="1" max="120" step="1" value="24" style="width:38px"></label>
          <button class="icon-button" data-act="range-start" title="${e("Set In Point at Playhead ([)")}" style="font-weight:700;font-size:11px">[</button>
          <button class="icon-button" data-act="range-end" title="${e("Set Out Point at Playhead (])")}" style="font-weight:700;font-size:11px">]</button>
          <button class="icon-button" data-act="range-clear" title="${e("Clear Playback Range")}" style="font-size:10px"><i class="pi pi-times"></i></button>
          <button class="icon-button" data-act="toggle-snap" title="${e("Toggle Snapping")}" aria-pressed="true"><i class="pi pi-thumbtack"></i></button>
          <label style="font-size:10px">${e("Snap")} <input data-role="snap-frames" type="number" min="1" max="24" step="1" value="1" style="width:34px"></label>
          <button class="icon-button" data-act="fit-timeline" title="${e("Fit Timeline to View (F)")}"><i class="pi pi-arrows-alt"></i></button>
        </div>
        <span class="timeline-summary" data-role="timeline-summary">${e("1 key")}</span>
      </div>
      <div class="keys" data-role="keys" tabindex="0" aria-label="${e("Camera keyframe timeline")}"></div>
      <details class="curve-editor" open><summary title="${e("Open or close the animation curve editor")}"><i class="pi pi-chart-line"></i><strong data-role="curve-title">${e("Camera Curve Editor")}</strong><span class="hint">${e("MMB/Alt-drag: Pan · Scroll: Zoom · Box Select: Drag · Drag Point: Retime/Value · Right-click: Menu")}</span></summary><div class="curve-toolbar"><select data-role="curve-group" title="${e("Choose the animated channels displayed in the graph")}"><option value="position">${e("Position XYZ")}</option><option value="target">${e("Target XYZ")}</option><option value="lens">${e("FOV / Roll / Zoom")}</option></select><button class="curve-mode active" data-channel-filter="all" title="${e("Show all curves in group")}">${e("All")}</button><button class="curve-mode" data-channel-filter="0" title="${e("Solo channel 1")}"><span class="ch-dot" style="background:#ef5350"></span>${e("X")}</button><button class="curve-mode" data-channel-filter="1" title="${e("Solo channel 2")}"><span class="ch-dot" style="background:#53d86a"></span>${e("Y")}</button><button class="curve-mode" data-channel-filter="2" title="${e("Solo channel 3")}"><span class="ch-dot" style="background:#4aa3ef"></span>${e("Z")}</button><span class="toolbar-divider"></span><button class="curve-mode" data-curve-mode="linear" title="${e("Straight interpolation after the selected key")}">${e("Linear")}</button><button class="curve-mode" data-curve-mode="smooth" title="${e("Smooth interpolation after the selected key")}">${e("Smooth")}</button><button class="curve-mode" data-curve-mode="bezier" title="${e("Bézier easing after the selected key")}">${e("Bezier")}</button><button class="curve-mode" data-curve-mode="ease_in" title="${e("Ease into motion after the selected key")}">${e("Ease In")}</button><button class="curve-mode" data-curve-mode="ease_out" title="${e("Ease out of motion after the selected key")}">${e("Ease Out")}</button><button class="curve-mode" data-curve-mode="ease" title="${e("Ease in and out after the selected key")}">${e("Ease In/Out")}</button><button class="curve-mode active" data-act="curve-handles" title="${e("Show or hide Bézier tangent handles")}" aria-pressed="true"><i class="pi pi-share-alt"></i> ${e("Handles")}</button><span class="toolbar-divider"></span><span class="hint">${e("Tangents")}</span><button class="curve-mode" data-tangent-mode="auto" title="${e("Automatic smooth tangents")}">${e("Auto")}</button><button class="curve-mode" data-tangent-mode="vector" title="${e("Straight (vector) tangents")}">${e("Vector")}</button><button class="curve-mode" data-tangent-mode="free" title="${e("Independent broken tangent handles")}">${e("Free")}</button><button class="curve-mode" data-tangent-mode="aligned" title="${e("Mirrored collinear tangent handles")}">${e("Aligned")}</button><button class="curve-mode" data-tangent-mode="flat" title="${e("Horizontal flat tangent handles")}">${e("Flat")}</button><span class="toolbar-divider"></span><button class="curve-mode" data-act="curve-zoom-in" title="${e("Zoom in curve editor (Mouse wheel)")}"><i class="pi pi-search-plus"></i></button><button class="curve-mode" data-act="curve-zoom-out" title="${e("Zoom out curve editor")}"><i class="pi pi-search-minus"></i></button><button class="curve-mode" data-act="curve-fit" title="${e("Fit curves to view")}"><i class="pi pi-arrows-alt"></i> ${e("Fit")}</button></div><canvas class="curve-canvas" data-role="curve-canvas" title="${e("Drag a key point vertically or drag tangent handles on either side. Scroll to zoom. Right-click for curve actions.")}"></canvas></details>
      <details class="compact-panel key-editor" data-role="key-editor" data-empty="false" open><summary><i class="pi pi-key"></i><strong data-role="selected-key-label">${e("Key @ 0")}</strong><span class="hint">${e("yellow selected · red editing")}</span></summary><div class="panel-body">
        <div class="key-editor-header">
          <button class="icon-button" data-act="update-key" title="${e("Update key from current 3D view")}" aria-label="${e("Update key from current view")}"><i class="pi pi-refresh"></i></button>
          <button class="icon-button" data-act="view-key" title="${e("Jump Playhead & View to Key")}" aria-label="${e("Load selected key view")}"><i class="pi pi-eye"></i></button>
          <div class="key-interp-buttons" style="margin-left:auto">
            <button type="button" class="key-interp-btn active" data-interp="ease" title="${e("Ease In & Out (Default smooth transition)")}">Ease</button>
            <button type="button" class="key-interp-btn" data-interp="smooth" title="${e("Smooth Catmull-Rom spline")}">Smooth</button>
            <button type="button" class="key-interp-btn" data-interp="bezier" title="${e("Bézier curve with editable handles")}">Bezier</button>
            <button type="button" class="key-interp-btn" data-interp="linear" title="${e("Linear constant-velocity line")}">Linear</button>
            <button type="button" class="key-interp-btn" data-interp="ease_in" title="${e("Ease In (Slow start)")}">Ease In</button>
            <button type="button" class="key-interp-btn" data-interp="ease_out" title="${e("Ease Out (Slow stop)")}">Ease Out</button>
            <button type="button" class="key-interp-btn" data-interp="hold" title="${e("Hold / Step (Freeze until next key)")}">Hold</button>
          </div>
        </div>
        <div class="key-editor-grid">
          <label>${e("Frame")} <input data-role="key-frame" type="number" min="0" value="0"></label>
          <label>${e("Interpolation")} <select data-role="key-interp"><option value="ease">${e("Ease")}</option><option value="smooth">${e("Smooth")}</option><option value="bezier">${e("Bezier")}</option><option value="linear">${e("Linear")}</option><option value="ease_in">${e("Ease In")}</option><option value="ease_out">${e("Ease Out")}</option><option value="hold">${e("Hold")}</option></select></label>
          <label>${e("Pos X")} <input data-role="key-px" type="number" step="0.1"></label><label>${e("Pos Y")} <input data-role="key-py" type="number" step="0.1"></label><label>${e("Pos Z")} <input data-role="key-pz" type="number" step="0.1"></label>
          <label>${e("Target X")} <input data-role="key-tx" type="number" step="0.1"></label><label>${e("Target Y")} <input data-role="key-ty" type="number" step="0.1"></label><label>${e("Target Z")} <input data-role="key-tz" type="number" step="0.1"></label>
          <label>${e("FOV")} <input data-role="key-fov" type="number" min="5" max="150" step="0.1"></label><label>${e("Roll")} <input data-role="key-roll" type="number" min="-180" max="180" step="0.1"></label><label>${e("Zoom")} <input data-role="key-zoom" type="number" min="0.01" step="0.05"></label><label>${e("Near Clip")} <input data-role="key-near" type="number" min="0.0001" step="0.001"></label><label>${e("Far Clip")} <input data-role="key-far" type="number" min="0.0002" step="1"></label>
          <label>${e("Camera")} <select data-role="key-camera-type"><option value="perspective">${e("Perspective")}</option><option value="orthographic">${e("Orthographic")}</option></select></label>
        </div></div></details>
    </div>
    <details class="help"><summary>${e("OmniCam help")}</summary><p>${e("Compose a frame, press I, scrub, move the camera and press I again. Space previews the move; Playblast records the neutral motion reference.")}</p><p>${e("The proxy communicates camera motion, not final appearance. Use H3 Setup for Omni Reference, Wan Native Camera for core Plücker conditioning, or the pinned ATI/LTX adapters for their supported workflows.")}</p></details>`;
  const a = document.createElement("div");
  return a.className = "context-menu", a.dataset.role = "context-menu", a.setAttribute("role", "menu"), a.hidden = !0, t.appendChild(a), t;
}
export {
  o as DIRECTOR_STYLES,
  n as buildRoot
};
