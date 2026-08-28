// OmniCam Director component styles.
//
// Layered on purpose: this file holds the component and state styling that
// predates the panelled layout, then styles/shell.js and styles/lower-deck.js
// are appended so the newer layout rules win where the two overlap.

import { SHELL_STYLES } from "./styles/shell.js";
import { LOWER_DECK_STYLES } from "./styles/lower-deck.js";

const COMPONENT_STYLES = `
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
      .majoor-omnicam [data-act="toggle-camera-view"].active,.majoor-omnicam [data-act="toggle-inspector"].active{background:linear-gradient(180deg,#0284c7,#0369a1) !important;border-color:#38bdf8 !important;color:#fff !important;box-shadow:0 0 10px rgba(14,165,233,0.5) !important}
      .majoor-omnicam [data-select-mode].active,.majoor-omnicam [data-select-mode][aria-pressed="true"]{background:linear-gradient(180deg,#0284c7,#0369a1) !important;border-color:#38bdf8 !important;color:#fff !important;box-shadow:0 0 10px rgba(56,189,248,0.6),inset 0 1px 0 rgba(255,255,255,0.3) !important}
      .majoor-omnicam [data-transform-mode].active,.majoor-omnicam [data-transform-mode][aria-pressed="true"]{background:linear-gradient(180deg,#2563eb,#1d4ed8) !important;border-color:#60a5fa !important;color:#fff !important;box-shadow:0 0 10px rgba(59,130,246,0.6),inset 0 1px 0 rgba(255,255,255,0.3) !important}
      
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
      .majoor-omnicam .viewport-quick-bar{position:absolute;z-index:6;left:10px;right:270px;top:10px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:4px 8px;background:rgba(20, 20, 26, 0.88);border:1px solid rgba(255, 255, 255, 0.12);border-radius:7px;backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,0.4)}
      .majoor-omnicam .viewport-quick-bar select{height:25px;min-width:105px;font-size:11px}
      .majoor-omnicam .viewport-quick-bar button{height:25px;padding:0 7px;display:inline-flex;align-items:center;gap:4px;font-size:11px}
      .majoor-omnicam .quick-divider{width:1px;height:16px;background:rgba(255,255,255,0.15);margin:0 2px}
      .majoor-omnicam .selection-mode-group{display:inline-flex;align-items:center;gap:2px;padding:2px;border:1px solid #3c3c4a;border-radius:6px;background:#17171d}
      .majoor-omnicam .selection-mode-group button{height:23px;padding:0 6px;font-size:10px;border-color:transparent;background:transparent;border-radius:4px;white-space:nowrap}
      .majoor-omnicam .selection-mode-group .pi{font-size:9px}
      
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
      .majoor-omnicam .outliner-quick-bar{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin-bottom:6px}
      .majoor-omnicam .outliner-quick-bar button{font-size:10px;padding:3px 2px;height:24px;display:inline-flex;align-items:center;justify-content:center;gap:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .majoor-omnicam .outliner-quick-bar button i{font-size:9px;flex-shrink:0}
      .majoor-omnicam .scene-tree{display:flex;flex-direction:column;gap:3px;max-height:150px;overflow-y:auto;overscroll-behavior:contain;margin-bottom:8px;background:#141418;padding:4px;border-radius:5px;border:1px solid #2e2e38}
      .majoor-omnicam .scene-item{display:flex;align-items:center;gap:6px;width:100%;min-height:26px;padding:3px 6px;text-align:left;border:1px solid transparent;background:transparent;border-radius:4px;font-size:11px;cursor:pointer;user-select:none;box-sizing:border-box}
      .majoor-omnicam .scene-item:hover{background:rgba(255,255,255,0.05)}
      .majoor-omnicam .scene-item.selected{background:#263c54;border-color:#4a76a8;color:#fff}
      .majoor-omnicam .scene-item.active-view{border-color:#38603c;background:rgba(56,96,60,0.25)}
      .majoor-omnicam .scene-item-label{flex:1;min-width:0;display:inline-flex;align-items:center;gap:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .scene-item-actions{display:inline-flex;align-items:center;justify-content:flex-end;gap:2px;flex-shrink:0;margin-left:auto}
      .majoor-omnicam .scene-action-btn{width:20px !important;height:20px !important;min-width:20px !important;padding:0 !important;display:inline-flex !important;align-items:center;justify-content:center;border-radius:4px;border:1px solid transparent;background:transparent;color:#9494a8;cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .scene-action-btn:hover{background:#31313e;border-color:#58586c;color:#fff}
      .majoor-omnicam .scene-item .pi{width:14px;text-align:center;flex-shrink:0}
      
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
      @container (max-width:700px){.majoor-omnicam .top{overflow-x:auto;overflow-y:hidden}.majoor-omnicam .viewport-quick-bar{right:10px;max-width:calc(100% - 20px)}.majoor-omnicam .selection-mode-group button span{display:none}.majoor-omnicam .viewport-tally-banner{top:82px;max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.majoor-omnicam .hud{top:108px;right:10px;max-width:calc(100% - 20px);overflow:hidden;text-overflow:ellipsis}.majoor-omnicam .viewport-inspector{top:auto;bottom:10px;width:min(250px,calc(100% - 20px));max-height:42%}.majoor-omnicam .timeline-toolbar{overflow-x:auto;flex-wrap:nowrap}.majoor-omnicam .timeline-summary{display:none}}
      @container (max-width:460px){.majoor-omnicam .viewport-wrap{min-height:360px;aspect-ratio:auto}.majoor-omnicam .camera-preview-strip[data-layout="2"],.majoor-omnicam .camera-preview-strip[data-layout="4"]{grid-auto-flow:row;grid-template-columns:1fr;grid-auto-columns:100%}.majoor-omnicam .menu-panel{width:min(240px,calc(100cqw - 24px))}}
`;

export const DIRECTOR_STYLES = COMPONENT_STYLES + SHELL_STYLES + LOWER_DECK_STYLES;
