// OmniCam Director component styles.
//
// Layered on purpose: this file holds the component and state styling that
// predates the panelled layout, then styles/shell.js and styles/lower-deck.js
// are appended so the newer layout rules win where the two overlap.

import { SHELL_STYLES } from "./styles/shell.js";
import { LOWER_DECK_STYLES } from "./styles/lower-deck.js";
import { SHARED_STYLES } from "./styles/shared.js";
import { DENSITY_STYLES } from "./styles/density.js";
import { RESPONSIVE_STYLES } from "./styles/responsive.js";

const COMPONENT_STYLES = `
      .majoor-omnicam{font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--fg-color,var(--oc-text));background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:10px;overflow:visible;user-select:none;container-type:inline-size}
      .majoor-omnicam *{box-sizing:border-box}
      .majoor-omnicam *::-webkit-scrollbar{width:6px;height:6px}
      .majoor-omnicam *::-webkit-scrollbar-track{background:rgba(0,0,0,0.3);border-radius:3px}
      .majoor-omnicam *::-webkit-scrollbar-thumb{background:#444456;border-radius:3px}
      .majoor-omnicam *::-webkit-scrollbar-thumb:hover{background:#65657e}
      .majoor-omnicam .top{position:relative;z-index:10;display:flex !important;flex-direction:row !important;flex-wrap:nowrap !important;gap:8px;align-items:center;min-height:38px;padding:4px 8px;background:var(--oc-panel);border-bottom:1px solid var(--oc-line)}
      .majoor-omnicam .top > *{flex-shrink:0}
      .majoor-omnicam button,.majoor-omnicam select,.majoor-omnicam input{font:inherit;color:var(--oc-text-dim);background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:6px;padding:4px 8px;transition:background .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease}
      .majoor-omnicam button{display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
      .majoor-omnicam select,.majoor-omnicam input{display:inline-block;vertical-align:middle}
      .majoor-omnicam [hidden],.majoor-omnicam input[hidden],.majoor-omnicam input[type="file"]{display:none !important}
      .majoor-omnicam select,.majoor-omnicam select option,.majoor-omnicam select optgroup{background-color:var(--oc-panel-2) !important;color:#ffffff !important;color-scheme:dark}
      .majoor-omnicam select:focus{border-color:var(--oc-accent);box-shadow:0 0 0 1px var(--oc-accent)}
      .majoor-omnicam select option:hover,.majoor-omnicam select option:focus,.majoor-omnicam select option:checked{background-color:var(--oc-accent-soft) !important;color:#ffffff !important}
      .majoor-omnicam button:hover{background:var(--oc-panel-2);border-color:var(--oc-line);color:#fff}
      .majoor-omnicam button:active{background:var(--oc-sunken);border-color:var(--oc-line)}
      .majoor-omnicam button.primary{background:var(--oc-ok-bg);border-color:var(--oc-ok-line);color:var(--oc-ok-text);box-shadow:none}
      .majoor-omnicam button.primary:hover{background:var(--oc-ok-line);border-color:var(--oc-ok);color:#fff;box-shadow:none}
      .majoor-omnicam button.active,.majoor-omnicam button[aria-pressed="true"],.majoor-omnicam .icon-button.active,.majoor-omnicam .icon-button[aria-pressed="true"]{background:var(--oc-accent-soft) !important;border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line)) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam .icon-button{display:inline-grid !important;place-items:center !important;width:28px !important;height:28px !important;min-width:28px !important;padding:0 !important;cursor:pointer;color:var(--oc-text-dim)}
      .majoor-omnicam .icon-button .pi{font-size:13px;line-height:1;display:block;margin:0 auto}
      .majoor-omnicam .icon-button:hover{color:#fff;border-color:var(--oc-line)}
      
      /* Button Specific Active Themes */
      .majoor-omnicam [data-act="play"]{color:var(--oc-ok);border-color:var(--oc-ok-line)}
      .majoor-omnicam [data-act="play"]:hover{border-color:var(--oc-ok);color:var(--oc-ok-text)}
      .majoor-omnicam [data-act="play"].playing,.majoor-omnicam [data-act="play"].active{background:var(--oc-ok-bg) !important;border-color:var(--oc-ok-line) !important;color:var(--oc-ok-text) !important;box-shadow:none !important}

      .majoor-omnicam [data-act="auto-key"]{color:var(--oc-text-faint)}
      .majoor-omnicam [data-act="auto-key"].active,.majoor-omnicam [data-act="auto-key"][aria-pressed="true"]{background:var(--oc-danger-bg) !important;border-color:var(--oc-danger) !important;color:var(--oc-danger-text) !important;box-shadow:none !important}

      .majoor-omnicam [data-act="toggle-snap"].active,.majoor-omnicam [data-act="toggle-snap"][aria-pressed="true"]{background:var(--oc-warn-bg) !important;border-color:var(--oc-warn-line) !important;color:var(--oc-warn-text) !important;box-shadow:none !important}
      .majoor-omnicam [data-act="loop"].active,.majoor-omnicam [data-act="loop"][aria-pressed="true"]{background:var(--oc-accent-soft) !important;border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line)) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam [data-act="toggle-camera-view"].active,.majoor-omnicam [data-act="toggle-inspector"].active{background:var(--oc-accent-soft) !important;border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line)) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam [data-select-mode].active,.majoor-omnicam [data-select-mode][aria-pressed="true"]{background:var(--oc-accent-soft) !important;border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line)) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam [data-transform-mode].active,.majoor-omnicam [data-transform-mode][aria-pressed="true"]{background:var(--oc-accent-soft) !important;border-color:color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line)) !important;color:var(--oc-text) !important;box-shadow:none !important}
      
      .majoor-omnicam .toolbar-menu{position:relative}.majoor-omnicam .toolbar-menu>summary{display:flex;align-items:center;gap:6px;min-height:28px;padding:4px 9px;border:1px solid transparent;border-radius:6px;cursor:pointer;white-space:nowrap;list-style:none}.majoor-omnicam .toolbar-menu>summary::-webkit-details-marker{display:none}.majoor-omnicam .toolbar-menu[open]>summary,.majoor-omnicam .toolbar-menu>summary:hover{background:var(--oc-panel-2);border-color:var(--oc-line)}
      .majoor-omnicam .menu-panel{position:absolute;z-index:50;top:calc(100% + 5px);left:0;display:flex;flex-direction:column;gap:5px;width:240px;padding:8px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:8px;box-shadow:0 10px 24px #000c}.majoor-omnicam .menu-panel.right{right:0;left:auto}.majoor-omnicam .menu-panel button{display:flex;align-items:center;gap:7px;text-align:left}.majoor-omnicam .menu-panel label{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--oc-text-dim)}.majoor-omnicam .menu-panel label>select,.majoor-omnicam .menu-panel label>input[type=number]{width:126px}.majoor-omnicam .menu-panel label>input[type=checkbox]{width:auto}.majoor-omnicam .menu-title{color:var(--oc-text-faint);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.majoor-omnicam .menu-divider{height:1px;margin:4px 0;background:var(--oc-line)}.majoor-omnicam .camera-menu-list{display:flex;max-height:180px;flex-direction:column;gap:4px;overflow-y:auto}.majoor-omnicam .camera-menu-list button.selected{border-color:var(--oc-warn-line);color:var(--oc-warn)}
      
      /* Viewport Wrapper & Prominent Highlights */
      /* No forced aspect-ratio: the true output framing is already drawn at
         render time (viewport/resolution-gate.js's drawResolutionGate/
         gateAspect letterboxes the canvas to the real output ratio
         regardless of the container's shape), so the wrap is free to fill
         whatever space .oc-stage's bounded layout gives it. */
      .majoor-omnicam .viewport-wrap{position:relative;width:100%;height:100%;min-height:280px;background:var(--oc-sunken);touch-action:none;overscroll-behavior:contain;pointer-events:auto;outline:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.06);transition:box-shadow .15s ease}
      .majoor-omnicam .viewport-wrap.auto-key{box-shadow:inset 0 0 0 2px var(--oc-danger)}
      .majoor-omnicam .viewport-wrap.edit-mode{box-shadow:inset 0 0 0 2px var(--oc-accent) !important}
      
      /* Prominent Tally / Live Recording Status Banner */
      .majoor-omnicam .viewport-tally-banner{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:8;display:inline-flex;align-items:center;gap:7px;padding:4px 14px;border-radius:20px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,0.6);transition:all .2s ease}
      .majoor-omnicam .viewport-tally-banner[hidden]{display:none}
      .majoor-omnicam .viewport-tally-banner .tally-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
      .majoor-omnicam .viewport-wrap.auto-key .viewport-tally-banner{display:inline-flex;background:var(--oc-danger-bg);border:1px solid var(--oc-danger-line);color:var(--oc-danger-text)}
      .majoor-omnicam .viewport-wrap.auto-key .viewport-tally-banner .tally-dot{background:var(--oc-danger);animation:tallyBlink 1.6s infinite}
      .majoor-omnicam .viewport-wrap.edit-mode .viewport-tally-banner{display:inline-flex;background:var(--oc-accent-soft);border:1px solid color-mix(in srgb,var(--oc-accent) 70%,var(--oc-line));color:var(--oc-text)}
      .majoor-omnicam .viewport-wrap.edit-mode .viewport-tally-banner .tally-dot{background:var(--oc-accent)}
      @keyframes tallyBlink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.75)}}

      /* Extracted-camera preview banner: staged, not applied -- see director-link.js */
      .majoor-omnicam .extractor-import-banner{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:8;display:flex;align-items:center;gap:10px;padding:7px 10px 7px 14px;border-radius:10px;font-size:12px;background:rgba(17,24,39,0.96);border:1px solid var(--oc-line);color:var(--oc-text);box-shadow:0 6px 20px rgba(0,0,0,0.5)}
      .majoor-omnicam .extractor-import-banner[hidden]{display:none}
      .majoor-omnicam .extractor-import-banner i.pi-video{color:var(--oc-text-dim)}
      .majoor-omnicam .extractor-import-banner .ei-import{background:var(--oc-accent);color:#0b1220;border:none;border-radius:6px;padding:5px 12px;font-weight:600;cursor:pointer}
      .majoor-omnicam .extractor-import-banner .ei-import:hover{background:var(--oc-accent-hover)}
      .majoor-omnicam .extractor-import-banner .ei-dismiss{background:transparent;border:none;color:var(--oc-text-dim);cursor:pointer;padding:4px;line-height:0}
      .majoor-omnicam .extractor-import-banner .ei-dismiss:hover{color:var(--oc-text)}
      
      .majoor-omnicam canvas{display:block;width:100%;height:100%;pointer-events:auto;outline:none;cursor:grab}.majoor-omnicam canvas.dragging{cursor:grabbing}
      
      /* Floating Quick Bar in Viewport */
      .majoor-omnicam .viewport-quick-bar{position:absolute;z-index:6;left:10px;right:270px;top:10px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:4px 8px;background:rgba(17,24,39,0.96);border:1px solid rgba(255, 255, 255, 0.12);border-radius:7px;box-shadow:0 4px 12px rgba(0,0,0,0.4)}
      .majoor-omnicam .viewport-quick-bar select{height:25px;min-width:105px;font-size:11px}
      .majoor-omnicam .viewport-quick-bar button{height:25px;padding:0 7px;display:inline-flex;align-items:center;gap:4px;font-size:11px}
      .majoor-omnicam .quick-divider{width:1px;height:16px;background:rgba(255,255,255,0.15);margin:0 2px}
      .majoor-omnicam .selection-mode-group{display:inline-flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--oc-line);border-radius:6px;background:var(--oc-sunken)}
      .majoor-omnicam .selection-mode-group button{height:23px;padding:0 6px;font-size:10px;border-color:transparent;background:transparent;border-radius:4px;white-space:nowrap}
      .majoor-omnicam .selection-mode-group .pi{font-size:9px}
      
      /* HUD */
      .majoor-omnicam .hud{position:absolute;left:10px;top:48px;z-index:4;color:var(--oc-text);background:rgba(17,24,39,0.94);border:1px solid rgba(255, 255, 255, 0.1);border-radius:7px;padding:6px 10px;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.35);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;line-height:1.45}
      .majoor-omnicam .hud .hud-badge{display:inline-block;padding:1px 5px;border-radius:4px;font-weight:700;font-size:9px;background:var(--oc-accent);color:#fff;margin-right:4px}
      .majoor-omnicam .hud .hud-badge.active{background:var(--oc-warn);color:#fff}
      .majoor-omnicam .hud .hud-hl{color:var(--oc-warn);font-weight:600}

      /* Right Inspector Panel */
      .majoor-omnicam .viewport-inspector{position:absolute;z-index:6;right:10px;top:10px;width:250px;max-height:calc(100% - 20px);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:10px;background:rgba(17,24,39,0.97);border:1px solid rgba(255, 255, 255, 0.15);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.5);transition:transform .2s ease,opacity .2s ease}
      .majoor-omnicam .viewport-inspector[data-collapsed="true"]{transform:translateX(calc(100% + 15px));opacity:0;pointer-events:none}
      .majoor-omnicam .inspector-tabs{display:flex;gap:5px;margin-bottom:8px;background:var(--oc-sunken);padding:3px;border-radius:6px;border:1px solid var(--oc-line)}
      .majoor-omnicam .inspector-tab{flex:1;text-align:center;padding:5px 3px;font-size:10px;font-weight:600;background:transparent;border:1px solid transparent;border-radius:4px;cursor:pointer;color:var(--oc-text-faint);transition:all .15s ease}
      .majoor-omnicam .inspector-tab:hover{color:var(--oc-text-dim);background:rgba(255,255,255,0.05)}
      .majoor-omnicam .inspector-tab.active{background:var(--oc-accent-soft) !important;border-color:var(--oc-accent) !important;color:#fff !important;box-shadow:none !important}
      
      /* Outliner & Items */
      .majoor-omnicam .outliner-quick-bar{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin-bottom:6px}
      .majoor-omnicam .outliner-quick-bar button{font-size:10px;padding:3px 2px;height:24px;display:inline-flex;align-items:center;justify-content:center;gap:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .majoor-omnicam .outliner-quick-bar button i{font-size:9px;flex-shrink:0}
      /* Explicit height (not max-height) driven by the drag handle: dragging
         down enlarges the visible list box itself -- the node grows to match
         (see refitNode) -- instead of just moving a cramped inner scrollbar.
         The inner scroll only kicks in when the list is longer than the height
         the user has chosen. */
      .majoor-omnicam .scene-tree{display:flex;flex-direction:column;flex:0 0 auto;gap:3px;height:var(--oc-outliner-h,220px);min-height:80px;overflow-y:auto;overscroll-behavior:contain;margin-bottom:0;background:var(--oc-sunken);padding:4px;border-radius:5px;border:1px solid var(--oc-line-soft)}
      /* Drag handle under the object list -- taller list, more objects visible. */
      .majoor-omnicam .oc-resize-v{height:9px;margin:2px 0 8px;flex:none;cursor:ns-resize;border-radius:5px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);touch-action:none;position:relative}
      .majoor-omnicam .oc-resize-v::before{content:"";position:absolute;left:50%;top:50%;width:34px;height:3px;transform:translate(-50%,-50%);border-radius:2px;background:var(--oc-line)}
      .majoor-omnicam .oc-resize-v:hover::before,.majoor-omnicam .oc-resize-v:focus-visible::before{background:var(--oc-accent)}
      .majoor-omnicam .oc-resize-v:focus-visible{outline:2px solid var(--oc-accent);outline-offset:1px}
      /* Vertical splitter between the camera-preview column and the timeline. */
      .majoor-omnicam .oc-resize-h{align-self:stretch;cursor:ew-resize;border-radius:5px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);touch-action:none;position:relative}
      .majoor-omnicam .oc-resize-h::before{content:"";position:absolute;left:50%;top:50%;width:3px;height:34px;transform:translate(-50%,-50%);border-radius:2px;background:var(--oc-line)}
      .majoor-omnicam .oc-resize-h:hover::before,.majoor-omnicam .oc-resize-h:focus-visible::before{background:var(--oc-accent)}
      .majoor-omnicam .oc-resize-h:focus-visible{outline:2px solid var(--oc-accent);outline-offset:1px}
      .majoor-omnicam .scene-item{display:flex;align-items:center;gap:6px;width:100%;min-height:26px;padding:3px 6px;text-align:left;border:1px solid transparent;background:transparent;border-radius:4px;font-size:11px;cursor:pointer;user-select:none;box-sizing:border-box}
      .majoor-omnicam .scene-item:hover{background:rgba(255,255,255,0.05)}
      .majoor-omnicam .scene-item.selected{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#fff}
      .majoor-omnicam .scene-item.selected.primary{background:var(--oc-accent-soft);border-color:var(--oc-accent);box-shadow:inset 2px 0 0 var(--oc-accent)}
      .majoor-omnicam .scene-item.active-view{border-color:var(--oc-ok);background:var(--oc-ok-bg)}
      .majoor-omnicam .scene-item-label{flex:1;min-width:0;display:inline-flex;align-items:center;gap:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .scene-item-actions{display:inline-flex;align-items:center;justify-content:flex-end;gap:2px;flex-shrink:0;margin-left:auto}
      .majoor-omnicam .scene-action-btn{width:20px !important;height:20px !important;min-width:20px !important;padding:0 !important;display:inline-flex !important;align-items:center;justify-content:center;border-radius:4px;border:1px solid transparent;background:transparent;color:var(--oc-text-dim);cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .scene-action-btn:hover{background:var(--oc-panel-2);border-color:var(--oc-line);color:#fff}
      .majoor-omnicam .scene-item .pi{width:14px;text-align:center;flex-shrink:0}
      .majoor-omnicam .motion-tools{position:absolute;z-index:7;left:50%;top:50px;display:none;gap:3px;padding:4px;transform:translateX(-50%);background:rgba(17,24,39,.96);border:1px solid var(--oc-line);border-radius:6px}
      .majoor-omnicam.oc-motion-mode .motion-tools{display:flex}
      .majoor-omnicam .motion-tools button{width:28px;height:28px;min-width:28px;padding:0}
      .majoor-omnicam .motion-tools button.active{background:var(--oc-ok-bg) !important;border-color:var(--oc-ok) !important;box-shadow:none !important}
      .majoor-omnicam canvas[data-motion-tool="track"],.majoor-omnicam canvas[data-motion-tool="anchor"],.majoor-omnicam canvas[data-motion-tool="project"],.majoor-omnicam canvas[data-motion-tool="erase"]{cursor:crosshair}
      .majoor-omnicam .motion-section-title{margin-top:8px}.majoor-omnicam .motion-preset-bar{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;margin:4px 0}.majoor-omnicam .motion-preset-bar button{min-width:0;padding:3px 1px;font-size:9px;overflow:hidden}
      .majoor-omnicam .motion-empty{padding:8px;color:var(--oc-text-faint);text-align:center;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:5px}.majoor-omnicam .motion-layer-list{display:flex;max-height:110px;flex-direction:column;gap:3px;overflow:auto}.majoor-omnicam .motion-layer-row{display:grid;grid-template-columns:16px minmax(0,1fr) auto;width:100%;gap:5px;padding:4px 6px;text-align:left;background:var(--oc-sunken)}.majoor-omnicam .motion-layer-row span{overflow:hidden;text-overflow:ellipsis}.majoor-omnicam .motion-layer-row small{color:var(--oc-text-dim);font-size:9px}.majoor-omnicam .motion-layer-row.active{border-color:var(--oc-ok) !important;background:var(--oc-ok-bg) !important}.majoor-omnicam .motion-layer-controls{display:grid;grid-template-columns:minmax(0,1fr) auto 28px 28px 28px;gap:3px;align-items:center;margin:4px 0 8px}.majoor-omnicam .motion-layer-controls label{display:flex;align-items:center;gap:3px;font-size:9px}.majoor-omnicam .motion-layer-controls input{width:14px}
      .majoor-omnicam .motion-panel{gap:6px}
      .majoor-omnicam .motion-panel > *{flex:none}
      .majoor-omnicam .motion-panel .oc-field-value{color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .motion-create-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:4px 0 6px}
      .majoor-omnicam .motion-create-btn{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:7px 8px;text-align:left;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:5px;cursor:pointer;color:var(--oc-text-dim)}
      .majoor-omnicam .motion-create-btn:hover{border-color:var(--oc-ok);background:var(--oc-ok-bg)}
      .majoor-omnicam .motion-create-btn .pi{font-size:13px;color:var(--oc-ok)}
      .majoor-omnicam .motion-create-btn b{font-size:11px;color:#fff}
      .majoor-omnicam .motion-create-btn small{color:var(--oc-text-dim);font-size:9px;line-height:1.2}
      .majoor-omnicam .motion-creating{display:flex;align-items:center;justify-content:space-between;gap:6px;margin:0 0 6px;padding:5px 8px;background:var(--oc-ok-bg);border:1px solid var(--oc-ok);border-radius:5px;font-size:10px;color:var(--oc-ok-text)}
      .majoor-omnicam .motion-badge{display:inline-block;padding:1px 5px;border-radius:3px;background:var(--oc-panel-2);color:var(--oc-ok-text);font-size:8.5px;font-weight:700;letter-spacing:.4px}
      .majoor-omnicam .motion-badge.experimental{background:var(--oc-warn-bg);color:var(--oc-warn-text)}
      .majoor-omnicam .oc-recon-badge{display:inline-block;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;letter-spacing:.3px}
      .majoor-omnicam .oc-recon-badge.oc-badge-high{background:var(--oc-ok-bg);color:var(--oc-ok-text);border:1px solid var(--oc-ok-line)}
      .majoor-omnicam .oc-recon-badge.oc-badge-medium{background:var(--oc-warn-bg);color:var(--oc-warn-text);border:1px solid var(--oc-warn-line)}
      .majoor-omnicam .oc-recon-badge.oc-badge-low{background:var(--oc-danger-bg);color:var(--oc-danger-text);border:1px solid var(--oc-danger-line)}
      .majoor-omnicam .oc-lock-btn.locked{color:var(--oc-danger);border-color:var(--oc-danger-line);background:var(--oc-danger-bg)}
      .majoor-omnicam .motion-experimental-note{margin:2px 0 8px;color:var(--oc-warn-text);font-size:9px;line-height:1.35}
      .majoor-omnicam .motion-preview-wrap{position:relative;height:132px;margin:4px 0 2px;border:1px solid var(--oc-line-soft);border-radius:5px;overflow:hidden;background:var(--oc-sunken)}
      .majoor-omnicam .motion-preview{display:block;width:100%;height:100%;cursor:pointer}
      .majoor-omnicam .motion-preview-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:8px;text-align:center;font-size:9px;color:var(--oc-text-faint);pointer-events:none}
      .majoor-omnicam .motion-selected{margin-top:6px}
      .majoor-omnicam .motion-selected.motion-invalid{border-color:var(--oc-danger) !important}
      .majoor-omnicam .motion-selected.motion-warn{border-color:var(--oc-warn-text) !important}
      .majoor-omnicam .motion-sel-warn{margin:0 0 5px;padding:5px 7px;border-radius:4px;background:var(--oc-warn-bg);border:1px solid var(--oc-warn-text);color:var(--oc-warn-text);font-size:9.5px;line-height:1.35}
      .majoor-omnicam .motion-fit-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:5px;padding:5px;margin-top:2px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:4px;cursor:pointer;color:var(--oc-text-dim);font-size:10px}
      .majoor-omnicam .motion-fit-btn:hover{border-color:var(--oc-ok)}
      .majoor-omnicam .motion-advanced{margin-top:8px}
      .majoor-omnicam .motion-compat{font-size:10px;color:var(--oc-ok-text);display:grid;grid-template-columns:1fr 1fr;gap:2px 10px;margin-top:4px}
      .majoor-omnicam .motion-compat .pi{color:var(--oc-ok);font-size:9px;margin-right:3px}
      .majoor-omnicam .motion-compat p{grid-column:1/-1;color:var(--oc-text-dim);margin:4px 0 0;line-height:1.3}
      .majoor-omnicam .motion-timeline{display:flex;flex-direction:column;gap:3px;margin-top:6px}.majoor-omnicam .motion-timeline-rail{display:grid;grid-template-columns:124px minmax(0,1fr);gap:10px;min-height:24px}.majoor-omnicam .motion-timeline-label{justify-content:flex-start;overflow:hidden;padding:2px 6px;text-overflow:ellipsis;white-space:nowrap}.majoor-omnicam .motion-timeline-track{position:relative;border:1px solid var(--oc-line);border-radius:4px;background:var(--oc-sunken)}.majoor-omnicam .motion-key{position:absolute;top:50%;width:11px;height:11px;min-width:11px;margin:-6px 0 0 -6px;padding:0;border:1px solid #111;border-radius:2px;background:var(--oc-ok);transform:rotate(45deg)}
      
      /* Transform & Inputs Grid with Colored Axis Badges */
      .majoor-omnicam .transform-tools{display:flex;gap:6px;margin:6px 0}.majoor-omnicam .transform-tools button{width:28px;height:25px;padding:0;font-weight:600}.majoor-omnicam .transform-tools button.active{background:var(--oc-accent) !important;border-color:var(--oc-accent-hover) !important;color:#fff !important;box-shadow:none !important}.majoor-omnicam .transform-tools select{min-width:0;flex:1;padding:2px 4px}
      .majoor-omnicam .viewport-grid{display:grid;grid-template-columns:1fr 70px;gap:5px 8px}
      .majoor-omnicam .viewport-grid label{display:contents}
      .majoor-omnicam .viewport-grid span{align-self:center;color:var(--oc-text-dim);display:inline-flex;align-items:center;gap:4px;font-size:11px}
      .majoor-omnicam .viewport-grid input{width:70px;padding:2px 4px;font-size:11px}
      .majoor-omnicam .axis-badge{display:inline-block;width:12px;height:12px;line-height:12px;text-align:center;font-size:9px;font-weight:700;border-radius:3px;color:#fff}
      .majoor-omnicam .axis-x{background:#ef5350}.majoor-omnicam .axis-y{background:#53d86a;color:#111}.majoor-omnicam .axis-z{background:#4aa3ef}
      .majoor-omnicam .entity-panel[hidden]{display:none}
      .majoor-omnicam .animation-row{display:flex;gap:6px;align-items:center;margin-top:6px}.majoor-omnicam .animation-row select{min-width:0;flex:1;font-size:11px}
      
      /* Camera Multi-Preview Strip */
      .majoor-omnicam .camera-view-row{position:relative;display:flex;width:100%;padding:5px 30px 5px 5px;background:var(--oc-panel);border-top:1px solid var(--oc-line)}.majoor-omnicam .camera-view-row[hidden]{display:none}.majoor-omnicam .camera-preview-strip{display:grid;width:100%;grid-auto-flow:column;grid-auto-columns:minmax(220px,calc((100% - 10px)/3));gap:6px;overflow-x:auto}.majoor-omnicam .camera-preview-tile{position:relative;min-width:0;height:clamp(150px,18vw,230px);overflow:hidden;background:var(--oc-sunken);border:1px solid var(--oc-line);border-top:4px solid var(--camera-color);border-radius:4px;cursor:pointer}.majoor-omnicam .camera-preview-tile.playblast{border-color:var(--oc-warn);border-top-color:var(--oc-warn);box-shadow:inset 0 0 0 1px var(--oc-warn)}.majoor-omnicam .camera-preview-head{position:absolute;z-index:2;left:0;right:0;top:0;display:flex;align-items:center;gap:5px;min-height:25px;padding:3px 6px;background:#17171fe8;color:var(--oc-text-dim);font-size:10px;font-weight:700;letter-spacing:.04em;pointer-events:none}.majoor-omnicam .camera-preview-head .output-mark{margin-left:auto;color:var(--oc-warn)}.majoor-omnicam .camera-preview-tile canvas{width:100%;height:100%;cursor:pointer}.majoor-omnicam .camera-view-badge{position:absolute;left:6px;bottom:5px;padding:2px 5px;border-radius:3px;background:#000b;color:var(--oc-text-dim);font-size:9px;pointer-events:none}.majoor-omnicam .camera-strip-close{position:absolute;right:4px;top:5px;width:23px;height:23px;padding:0}
      .majoor-omnicam .camera-preview-strip[data-layout="1"]{grid-auto-columns:100%}.majoor-omnicam .camera-preview-strip[data-layout="2"]{grid-auto-columns:calc((100% - 5px)/2)}.majoor-omnicam .camera-preview-strip[data-layout="4"]{grid-auto-flow:row;grid-template-columns:1fr 1fr;grid-auto-rows:minmax(140px,1fr)}
      
      /* Timeline & Keys */
      .majoor-omnicam .timeline{padding:8px 10px;background:var(--oc-panel);border-top:1px solid var(--oc-line)}
      .majoor-omnicam .row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.majoor-omnicam .row + .row{margin-top:6px}
      .majoor-omnicam input[type=range]{padding:0;flex:1;min-width:140px}.majoor-omnicam input[type=number]{width:68px}
      .majoor-omnicam .timeline-toolbar{justify-content:flex-start;gap:8px;align-items:center}.majoor-omnicam .timeline-summary{margin-left:auto;color:var(--oc-text-dim);font-size:11px}.majoor-omnicam .toolbar-divider{width:1px;height:20px;margin:0 4px;background:var(--oc-line)}
      .majoor-omnicam .timeline-group{display:flex;align-items:center;gap:5px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:6px;padding:3px 6px}
      .majoor-omnicam .primary-play.playing{background:var(--oc-ok);border-color:var(--oc-ok);color:#fff}
      .majoor-omnicam .primary-key{background:var(--oc-warn);border-color:var(--oc-warn);color:#fff;font-weight:700;display:inline-flex;align-items:center;gap:4px}
      .majoor-omnicam .primary-key:hover{background:var(--oc-warn-text);border-color:var(--oc-warn);box-shadow:none}
      .majoor-omnicam .primary-key.key-pulse{animation:keyPulseAnim 0.35s ease-out}
      @keyframes keyPulseAnim{0%{transform:scale(1)}50%{transform:scale(1.14)}100%{transform:scale(1)}}
      .majoor-omnicam .auto-key-btn.active{background:var(--oc-danger-bg);border-color:var(--oc-danger);color:var(--oc-danger-text);animation:autoKeyBlink 1.8s infinite}
      @keyframes autoKeyBlink{0%,100%{opacity:1}50%{opacity:.6}}
      .majoor-omnicam .key-interp-buttons{display:flex;gap:3px;flex-wrap:wrap;margin:4px 0 6px}
      .majoor-omnicam .key-interp-btn{font-size:10px;padding:2px 7px;border-radius:4px;border:1px solid var(--oc-line);background:var(--oc-panel-2);color:var(--oc-text-dim);cursor:pointer;transition:all .15s ease}
      .majoor-omnicam .key-interp-btn:hover{border-color:var(--oc-accent-hover);color:#fff}
      .majoor-omnicam .key-interp-btn.active{background:var(--oc-warn);border-color:var(--oc-warn);color:#fff;font-weight:700;box-shadow:none}
      .majoor-omnicam .floating-retime-badge{position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:#101018ee;color:var(--oc-warn);border:1px solid var(--oc-warn);border-radius:3px;font-size:9px;font-weight:700;padding:1px 5px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px #000a}

      .majoor-omnicam .keys{position:relative;width:100%;height:68px;margin-top:7px;overflow:hidden;background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:6px;cursor:crosshair;outline:none;touch-action:none}
      .majoor-omnicam .keys:focus-visible{border-color:var(--oc-accent-hover);box-shadow:0 0 0 1px var(--oc-accent-hover)}
      .majoor-omnicam .timeline-tick{position:absolute;top:0;height:100%;border-left:1px solid var(--oc-line);color:var(--oc-text-dim);font-size:10px;padding:2px 0 0 4px;pointer-events:none}
      .majoor-omnicam .timeline-marker{position:absolute;z-index:2;top:0;bottom:0;width:1px;background:var(--marker-color,var(--oc-warn));pointer-events:none}.majoor-omnicam .timeline-marker::before{content:"";position:absolute;left:-4px;top:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid var(--marker-color,var(--oc-warn))}
      .majoor-omnicam .playback-range{position:absolute;top:0;bottom:0;background:var(--oc-warn-bg);border-left:1px solid var(--oc-warn-line);border-right:1px solid var(--oc-warn-line);pointer-events:none}
      .majoor-omnicam .box-select{position:absolute;z-index:4;border:1px dashed var(--oc-accent);background:var(--oc-accent-soft);pointer-events:none}
      .majoor-omnicam .playhead{position:absolute;z-index:2;top:0;bottom:0;width:2px;background:var(--oc-warn);pointer-events:none}.majoor-omnicam .playhead::before{content:"";position:absolute;left:-5px;top:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid var(--oc-warn)}
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
        border: 1px solid var(--oc-line) !important;
        border-radius: 6px !important;
        background: var(--oc-panel-2) !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6) !important;
        cursor: ew-resize !important;
        color: var(--oc-text) !important;
        outline: none !important;
        opacity: 0.95 !important;
        transition: opacity 0.15s ease, transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease !important;
      }
      .majoor-omnicam .key:hover {
        opacity: 1 !important;
        border-color: var(--oc-accent-hover) !important;
        background: var(--oc-panel-2) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7) !important;
      }
      .majoor-omnicam .key.at-playhead {
        opacity: 1 !important;
        border-color: var(--oc-warn) !important;
        box-shadow: none !important;
      }
      .majoor-omnicam .key.selected {
        opacity: 1 !important;
        z-index: 5 !important;
        background: var(--oc-warn) !important;
        border-color: #fff !important;
        color: #ffffff !important;
        box-shadow: 0 0 0 2px #fff, 0 2px 6px rgba(0, 0, 0, 0.6) !important;
        transform: translateX(-50%) scale(1.08) !important;
      }
      .majoor-omnicam .key.editing {
        opacity: 1 !important;
        z-index: 6 !important;
        background: var(--oc-danger) !important;
        border-color: #fff !important;
        color: #ffffff !important;
        box-shadow: 0 0 0 2px #fff, 0 2px 6px rgba(0, 0, 0, 0.6) !important;
        animation: keyEditGlow 1.2s infinite alternate !important;
      }
      @keyframes keyEditGlow {
        0% { opacity: 0.85; }
        100% { opacity: 1; }
      }
      
      .majoor-omnicam .key::before {
        content: "";
        position: absolute;
        left: 10px;
        top: 5px;
        width: 10px;
        height: 10px;
        transform: rotate(45deg);
        border: 1.5px solid rgba(255, 255, 255, 0.45);
        background: var(--oc-type-camera, #5B7CFF);
        border-radius: 2px;
        transition: transform 0.12s ease, filter 0.12s ease, border-color 0.12s ease, outline 0.12s ease;
      }
      .majoor-omnicam .key[data-interp="smooth"]::before { border-radius: 50%; transform: none; }
      .majoor-omnicam .key[data-interp="linear"]::before { border-radius: 0; transform: none; }
      .majoor-omnicam .key[data-interp="hold"]::before { border-radius: 0; transform: none; border-left-width: 3.5px; }
      
      .majoor-omnicam .key:hover::before { border-color: #ffffff; filter: brightness(1.2); }
      .majoor-omnicam .key.at-playhead::before { outline: 2px solid rgba(255, 255, 255, 0.6); outline-offset: 1px; }
      .majoor-omnicam .key.selected::before { border-color: #ffffff; outline: 2px solid #ffffff; outline-offset: 1.5px; filter: brightness(1.3); }
      .majoor-omnicam .key.editing::before { border-color: #ffffff; outline: 2px solid var(--oc-accent, #5B7CFF); outline-offset: 1.5px; filter: brightness(1.25); }
      
      .majoor-omnicam .key-label {
        position: absolute;
        top: 24px;
        left: 0;
        width: 32px;
        text-align: center;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 10px;
        font-weight: 700;
        color: var(--oc-text);
        line-height: 1;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
        pointer-events: none;
      }
      .majoor-omnicam .key.selected .key-label { font-weight: 700; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
      .majoor-omnicam .key.editing .key-label { font-weight: 700; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
      
      /* Curve Editor: superseded by the Director modal audit Lot 3 unified
         mode block (template/styles/lower-deck.js) -- kept the channel-filter
         highlight colors below since curve-editor/channel-list.js still uses
         them, dropped the rest (a stale pre-"plain section" .curve-editor,
         once a <details>, plus duplicate .curve-toolbar/.curve-mode/
         .curve-canvas rules long overridden by lower-deck.js's newer ones). */
      .majoor-omnicam [data-tangent-mode].active{background:var(--oc-accent-soft);border-color:var(--oc-accent)}.majoor-omnicam [data-channel-filter="0"].active{background:#4d1d1d;border-color:#ef5350;color:#ffc7c7}.majoor-omnicam [data-channel-filter="1"].active{background:#1a4223;border-color:#53d86a;color:#c7ffd2}.majoor-omnicam [data-channel-filter="2"].active{background:#1d354d;border-color:#4aa3ef;color:#c7e6ff}.majoor-omnicam .ch-dot{display:inline-block;width:7px;height:7px;border-radius:50%}

      /* Context Menu & Panels */
      .majoor-omnicam .context-menu, .context-menu.majoor-omnicam{position:fixed;z-index:100000;display:flex;min-width:210px;max-width:320px;flex-direction:column;gap:2px;padding:6px;background:rgba(11,16,24,0.98);border:1px solid rgba(255,255,255,0.12);border-radius:8px;box-shadow:0 16px 36px rgba(0,0,0,0.6),0 0 0 1px rgba(0,0,0,0.4);color:var(--oc-text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;user-select:none}.majoor-omnicam .context-menu[hidden],.context-menu.majoor-omnicam[hidden]{display:none}.majoor-omnicam .context-menu button,.context-menu.majoor-omnicam button{display:flex;align-items:center;gap:8px;width:100%;min-height:28px;text-align:left;border-color:transparent;background:transparent;color:var(--oc-text);font-size:12px;cursor:pointer;border-radius:5px;padding:4px 8px;border:1px solid transparent;transition:background .1s ease,color .1s ease}.majoor-omnicam .context-menu button:hover,.majoor-omnicam .context-menu button:focus-visible,.majoor-omnicam .context-menu button.active,.context-menu.majoor-omnicam button:hover,.context-menu.majoor-omnicam button:focus-visible,.context-menu.majoor-omnicam button.active{background:rgba(255,255,255,0.09);border-color:rgba(255,255,255,0.08);color:#fff}.majoor-omnicam .context-menu button:disabled,.context-menu.majoor-omnicam button:disabled{opacity:.35;cursor:not-allowed;background:transparent}.majoor-omnicam .context-menu .danger,.context-menu.majoor-omnicam .danger{color:var(--oc-danger)}.majoor-omnicam .context-menu .danger:hover,.context-menu.majoor-omnicam .danger:hover{background:var(--oc-danger-bg);border-color:var(--oc-danger-line);color:var(--oc-danger-text)}.majoor-omnicam .context-menu kbd.shortcut,.context-menu.majoor-omnicam kbd.shortcut,.majoor-omnicam .context-menu .shortcut,.context-menu.majoor-omnicam .shortcut{margin-left:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;padding:1px 5px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:var(--oc-text-dim)}.majoor-omnicam .context-menu-separator,.context-menu.majoor-omnicam .context-menu-separator{height:1px;margin:4px 2px;background:rgba(255,255,255,0.09)}.majoor-omnicam .context-menu-title,.context-menu.majoor-omnicam .context-menu-title{padding:4px 8px;color:var(--oc-text-dim);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.majoor-omnicam .oc-menu-icon-svg{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;flex-shrink:0}
      .majoor-omnicam .compact-panel{margin-top:6px;border:1px solid var(--oc-line);border-radius:6px;background:var(--oc-panel-2)}.majoor-omnicam .compact-panel>summary{display:flex;align-items:center;gap:6px;min-height:28px;padding:4px 7px;cursor:pointer;color:var(--oc-text-dim);list-style:none}.majoor-omnicam .compact-panel>summary::-webkit-details-marker{display:none}.majoor-omnicam .compact-panel>summary::after{content:"›";margin-left:auto;transform:rotate(90deg);color:var(--oc-text-faint)}.majoor-omnicam .compact-panel[open]>summary::after{transform:rotate(-90deg)}.majoor-omnicam .panel-body{padding:0 7px 7px}
      .majoor-omnicam .key-editor-header{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:6px}.majoor-omnicam .key-editor-grid,.majoor-omnicam .inspector-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:5px}.majoor-omnicam .key-editor-grid label,.majoor-omnicam .inspector-grid label{display:flex;align-items:center;justify-content:space-between;gap:4px;color:var(--oc-text-dim)}.majoor-omnicam .key-editor-grid input,.majoor-omnicam .key-editor-grid select,.majoor-omnicam .inspector-grid input,.majoor-omnicam .inspector-grid select{min-width:0;width:70px}.majoor-omnicam .key-editor[data-empty="true"] .key-editor-grid{opacity:.45}
      .majoor-omnicam .status{margin-left:auto;color:var(--oc-text-dim)}.majoor-omnicam .hint{color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam details.help{padding:7px 10px;background:var(--oc-panel);color:var(--oc-text-dim)}.majoor-omnicam details.help summary{cursor:pointer;color:var(--oc-warn)}.majoor-omnicam details.help p{margin:6px 0}
      /* Left panel Scene/Assets tabs + Asset Browser grid */
      .majoor-omnicam .oc-left-tabs{display:flex;gap:2px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:6px;padding:2px}
      .majoor-omnicam .oc-left-tab{flex:1;min-height:24px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--oc-text-dim);background:transparent;border:1px solid transparent;border-radius:4px;cursor:pointer}
      .majoor-omnicam .oc-left-tab.active{color:#fff;background:var(--oc-panel-2);border-color:var(--oc-line)}
      /* AGENT gets its own violet identity (flat, no gradient/glow per the
         design-system guardrail) so it reads as a distinct, AI-flavoured
         surface next to the neutral Scene/Assets tabs. */
      .majoor-omnicam .oc-left-tab[data-asset-view="agent"]{color:var(--oc-type-lens)}
      .majoor-omnicam .oc-left-tab[data-asset-view="agent"]:hover{color:#e2d4ff}
      /* !important: the generic button.active rule above (shared by every
         toolbar toggle, also !important) otherwise wins regardless of this
         selector's higher specificity -- !important vs !important then
         falls back to specificity, where this rule is higher. */
      .majoor-omnicam .oc-left-tab[data-asset-view="agent"].active{color:#fff !important;background:var(--oc-type-lens) !important;border-color:transparent !important;box-shadow:none !important}
      .majoor-omnicam .oc-left-body{display:flex;flex-direction:column;gap:7px;flex:1 1 auto;min-height:0}
      .majoor-omnicam .oc-asset-panel{display:flex;flex-direction:column;gap:6px;flex:1 1 auto;min-height:0}
      .majoor-omnicam .oc-asset-toolbar{display:flex;gap:4px;align-items:center}
      .majoor-omnicam .oc-asset-local{display:flex;flex-direction:column;gap:4px;padding:6px;background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:6px}
      .majoor-omnicam .oc-asset-local input{font-size:10px}
      .majoor-omnicam .oc-asset-local-actions{display:flex;gap:4px}
      .majoor-omnicam .oc-asset-local-actions .oc-btn{flex:1;font-size:10px;padding:4px 6px}
      .majoor-omnicam .oc-btn--primary{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#dbe9ff}
      .majoor-omnicam .oc-asset-kinds{display:flex;flex-wrap:wrap;gap:3px}
      .majoor-omnicam .oc-asset-kind{font-size:10px;padding:3px 7px;height:22px;color:var(--oc-text-dim);background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:11px;cursor:pointer;display:inline-flex;align-items:center;gap:4px}
      .majoor-omnicam .oc-asset-kind.active{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#dbe9ff}
      .majoor-omnicam .oc-asset-kind-n{opacity:.6;font-size:9px}
      .majoor-omnicam .oc-asset-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px;overflow-y:auto;overscroll-behavior:contain;flex:1 1 auto;min-height:120px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:5px;padding:6px;align-content:start}
      .majoor-omnicam .oc-asset-card{position:relative;display:flex;flex-direction:column;gap:3px;padding:5px;background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:6px;cursor:pointer;text-align:left}
      .majoor-omnicam .oc-asset-card:hover{border-color:var(--oc-text-faint)}
      .majoor-omnicam .oc-asset-card.selected{border-color:var(--oc-accent);box-shadow:0 0 0 1px var(--oc-accent)}
      .majoor-omnicam .oc-asset-thumb{width:100%;aspect-ratio:1;object-fit:cover;border-radius:4px;background:var(--oc-sunken);display:flex;align-items:center;justify-content:center}
      .majoor-omnicam .oc-asset-thumb--glyph i{font-size:22px;color:var(--oc-text-faint)}
      .majoor-omnicam .oc-asset-name{font-size:10px;color:var(--oc-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .majoor-omnicam .oc-asset-kind-tag{font-size:8px;letter-spacing:.06em;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-asset-badge{position:absolute;top:4px;right:4px;font-size:7px;font-weight:700;letter-spacing:.05em;padding:1px 4px;background:var(--oc-ok-bg);border:1px solid var(--oc-ok-line);border-radius:3px;color:var(--oc-ok-text)}
      .majoor-omnicam .oc-asset-empty{grid-column:1/-1;color:var(--oc-text-dim);font-size:11px;text-align:center;padding:16px 4px}
      .majoor-omnicam .oc-asset-foot{display:flex;align-items:center;gap:6px}
      .majoor-omnicam .oc-asset-foot .oc-btn{font-size:11px;padding:4px 10px}
      /* Agent panel accent: a violet->magenta top stripe plus matching
         primary-button/select-focus colour, scoped to the Agent tab only so
         Scene/Assets keep the neutral palette. Styled via the dedicated
         .oc-agent-panel CSS class, deliberately not the data-role attribute
         that DOM code uses to look this element up -- that attribute is
         checked for uniqueness across every template and style source by
         scripts/check_template_contract.mjs, so repeating it as a raw CSS
         attribute selector here would misread as duplicate declarations. */
      .majoor-omnicam .oc-agent-panel{border-top:2px solid var(--oc-type-lens);padding-top:6px}
      .majoor-omnicam .oc-agent-panel select.oc-search:focus-visible,
      .majoor-omnicam .oc-agent-panel .oc-agent-describe:focus-visible{outline:none;border-color:var(--oc-type-lens);box-shadow:0 0 0 2px rgba(167,139,250,.28)}
      .majoor-omnicam .oc-agent-panel .oc-btn--primary{background:var(--oc-type-lens);border-color:transparent;color:#fff}
      .majoor-omnicam .oc-agent-panel .oc-btn--primary:not(:disabled):hover{filter:brightness(1.1)}
      .majoor-omnicam .oc-agent-panel .oc-btn--primary:disabled{background:var(--oc-panel-2);border-color:var(--oc-line);color:var(--oc-text-faint)}
      .majoor-omnicam .oc-asset-status{flex:1;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      /* Viewport label overlay (pooled DOM above the WebGL canvas) */
      .majoor-omnicam .oc-label-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:6}
      .majoor-omnicam .oc-label{position:absolute;top:0;left:0;will-change:transform;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.04em;line-height:1.5;color:#f4f4f6;background:rgba(11,16,24,0.85);border:1px solid rgba(255,255,255,0.14);white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,0.8)}
      .majoor-omnicam .oc-label.is-annotation{border-color:var(--oc-label-accent,var(--oc-type-lens));box-shadow:0 0 0 1px var(--oc-label-accent,var(--oc-type-lens)) inset}
      /* Outliner tag chips + inspector label rows */
      .majoor-omnicam .scene-item-tags{display:inline-flex;gap:3px;margin-left:5px;flex-shrink:1;overflow:hidden}
      .majoor-omnicam .scene-item-tag{font-size:8px;font-weight:700;letter-spacing:.03em;padding:0 4px;border-radius:8px;background:var(--oc-panel-2);border:1px solid var(--oc-line);color:var(--oc-text-dim);white-space:nowrap;text-transform:uppercase}
      .majoor-omnicam .scene-item-tag-more{background:transparent;border-color:transparent;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-labels-row select{height:24px;font-size:10px}
      /* Rig Mapper */
      .majoor-omnicam .oc-rig-status{margin-left:auto;font-size:9px;font-weight:700;letter-spacing:.03em}
      .majoor-omnicam .oc-rig-status[data-state="ok"]{color:var(--oc-ok-text)}
      .majoor-omnicam .oc-rig-status[data-state="warn"]{color:var(--oc-warn-text)}
      .majoor-omnicam .oc-rig-actions{display:flex;gap:4px;margin-bottom:6px}
      .majoor-omnicam .oc-rig-actions .oc-btn{font-size:10px;padding:3px 8px}
      .majoor-omnicam .oc-rig-grid{display:flex;flex-direction:column;gap:2px;max-height:220px;overflow-y:auto;overscroll-behavior:contain}
      .majoor-omnicam .oc-rig-row{display:grid;grid-template-columns:78px 1fr 12px;align-items:center;gap:5px;font-size:10px}
      .majoor-omnicam .oc-rig-joint{color:var(--oc-text-dim)}
      .majoor-omnicam .oc-rig-row select{height:22px;font-size:10px;min-width:0}
      .majoor-omnicam .oc-rig-row.ok .oc-rig-joint{color:var(--oc-text)}
      .majoor-omnicam .oc-rig-tick{color:var(--oc-ok-text);font-weight:700;text-align:center}
      /* FK Pose editor + canonical-joint overlay */
      .majoor-omnicam .oc-pose-editor{margin-top:6px;padding-top:6px;border-top:1px solid var(--oc-line-soft)}
      .majoor-omnicam [data-pose-act="edit"].active{background:var(--oc-accent-soft);border-color:var(--oc-accent);color:#dbe9ff}
      .majoor-omnicam .oc-pose-joint .oc-field-label{font-size:9px;letter-spacing:.03em;color:var(--oc-accent-hover);text-transform:uppercase}
      .majoor-omnicam .oc-rig-overlay{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:7}
      .majoor-omnicam .oc-rig-dot{position:absolute;top:0;left:0;width:11px;height:11px;padding:0;border-radius:50%;background:var(--oc-accent-soft);border:1.5px solid var(--oc-accent-hover);cursor:pointer;pointer-events:auto;will-change:transform}
      .majoor-omnicam .oc-rig-dot:hover{background:rgba(91,124,255,0.5)}
      .majoor-omnicam .oc-rig-dot.selected{background:var(--oc-warn);border-color:#fff;box-shadow:0 0 0 2px #fff}
      /* Character motion clip */
      .majoor-omnicam .oc-motion-editor{margin-top:6px;padding-top:6px;border-top:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-motion-timing{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
      .majoor-omnicam .oc-motion-num{display:flex;flex-direction:column;font-size:9px;color:var(--oc-text-dim);gap:2px}
      .majoor-omnicam .oc-motion-num input{width:52px}
      .majoor-omnicam .oc-motion-check{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--oc-text-dim)}
      .majoor-omnicam .oc-motion-editor .oc-btn{font-size:10px;padding:3px 8px}
      @container (max-width:700px){.majoor-omnicam .top{overflow-x:auto;overflow-y:hidden}.majoor-omnicam .viewport-quick-bar{right:10px;max-width:calc(100% - 20px)}.majoor-omnicam .selection-mode-group button span{display:none}.majoor-omnicam .viewport-tally-banner{top:82px;max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.majoor-omnicam .hud{top:108px;right:10px;max-width:calc(100% - 20px);overflow:hidden;text-overflow:ellipsis}.majoor-omnicam .viewport-inspector{top:auto;bottom:10px;width:min(250px,calc(100% - 20px));max-height:42%}.majoor-omnicam .timeline-toolbar{overflow-x:auto;flex-wrap:nowrap}.majoor-omnicam .timeline-summary{display:none}}
      @container (max-width:460px){.majoor-omnicam .viewport-wrap{min-height:360px}.majoor-omnicam .camera-preview-strip[data-layout="2"],.majoor-omnicam .camera-preview-strip[data-layout="4"]{grid-auto-flow:row;grid-template-columns:1fr;grid-auto-columns:100%}.majoor-omnicam .menu-panel{width:min(240px,calc(100cqw - 24px))}}
`;

export const DIRECTOR_STYLES = SHARED_STYLES + COMPONENT_STYLES + SHELL_STYLES + LOWER_DECK_STYLES + DENSITY_STYLES + RESPONSIVE_STYLES;
