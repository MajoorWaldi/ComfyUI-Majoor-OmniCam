// Lower deck: camera preview, transport bar, dope sheet, graph editor.

export const LOWER_DECK_STYLES = `
      .majoor-omnicam .oc-lower{display:grid;grid-template-columns:236px minmax(0,1fr);gap:8px;padding:0 8px 8px}
      .majoor-omnicam .oc-preview{display:flex;flex-direction:column;gap:6px;padding:8px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);position:static;width:auto}
      .majoor-omnicam .oc-preview-head{display:flex;align-items:center;gap:6px;color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .oc-preview-head>span:first-child{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .oc-preview .camera-strip-close{position:static;width:24px;height:24px;min-width:24px;padding:0;flex:none}
      /* The strip moved from a full-width row under the viewport into a 236px
         sidebar column, but kept the row rules: grid-auto-flow:column with a
         220px minimum per tile and overflow-x:auto. Four cameras then needed
         898px of horizontal scroll inside a 216px box, so none of them was
         fully visible. In the sidebar the tiles stack downward instead. */
      .majoor-omnicam .oc-preview .camera-preview-strip{grid-auto-flow:row;grid-auto-columns:auto;grid-template-columns:minmax(0,1fr);grid-auto-rows:auto;gap:6px;max-height:min(46vh,420px);overflow-x:hidden;overflow-y:auto;padding:0;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-preview .camera-preview-strip:empty{min-height:120px}
      /* A preview whose box is not the shot's shape shows a framing the render
         will not produce. The tile takes the shot aspect; --shot-aspect is set
         from state.width/height in refreshCameraPreviews(). */
      .majoor-omnicam .oc-preview .camera-preview-tile{height:auto;min-height:0;aspect-ratio:var(--shot-aspect,16/9)}
      .majoor-omnicam .oc-preview .camera-preview-head{min-height:0;padding:2px 5px;font-size:9.5px}
      /* The sidebar tile is ~120px tall; the badge repeats what the header
         already says and only collides with the tile edge at this size. */
      .majoor-omnicam .oc-preview .camera-view-badge{display:none}
      .majoor-omnicam .oc-preview .camera-preview-strip[data-layout="2"],
      .majoor-omnicam .oc-preview .camera-preview-strip[data-layout="4"]{grid-template-columns:repeat(2,minmax(0,1fr))}
      .majoor-omnicam .oc-preview .camera-preview-strip[data-layout="1"]{grid-template-columns:minmax(0,1fr)}

      /* Hiding the preview sets [hidden] on it, which takes it out of the grid
         entirely -- so the timeline became the first item and landed in the
         236px column, with 902px sitting empty beside it. */
      .majoor-omnicam .oc-lower:has(>.oc-preview[hidden]){grid-template-columns:minmax(0,1fr)}

      .majoor-omnicam .oc-timeline{display:flex;flex-direction:column;gap:8px;padding:8px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);min-width:0}
      .majoor-omnicam .oc-transport{display:flex;align-items:center;gap:7px;flex-wrap:nowrap;min-width:0}
      .majoor-omnicam .timeline-group{display:flex;align-items:center;gap:3px;padding:2px;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:var(--oc-radius-sm)}
      .majoor-omnicam .oc-transport .icon-button{width:28px !important;height:28px !important;min-width:28px !important;background:transparent;border-color:transparent;border-radius:6px}
      .majoor-omnicam .oc-transport .icon-button:hover{background:var(--oc-panel-2);border-color:var(--oc-line)}
      .majoor-omnicam .oc-play{background:var(--oc-accent) !important;border-color:var(--oc-accent) !important;color:#fff !important}
      .majoor-omnicam .oc-key{display:inline-flex !important;align-items:center;width:auto !important;min-width:0 !important;gap:6px;padding:0 12px !important;font-size:11.5px;line-height:1;white-space:nowrap;color:var(--oc-text) !important}
      .majoor-omnicam .oc-diamond{width:9px;height:9px;background:var(--oc-accent);transform:rotate(45deg);flex:none}
      .majoor-omnicam .oc-frame-counter{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-frame-counter input{width:48px;padding:4px 2px;text-align:right;background:transparent;border:0;font-weight:650}
      .majoor-omnicam .oc-frame-total{color:var(--oc-text-faint);font-size:11px}
      .majoor-omnicam .oc-timecode{padding:5px 11px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft);color:var(--oc-text-dim);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
      .majoor-omnicam .oc-fps{display:inline-flex;align-items:center;gap:5px;padding:2px 4px 2px 9px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft);color:var(--oc-text-dim);font-size:11px;white-space:nowrap}
      .majoor-omnicam .oc-fps input{width:46px;padding:3px 4px;background:transparent;border:0;color:var(--oc-text);font-weight:600}

      /* ---- dope sheet ------------------------------------------------
         Layout mirrors a DCC dope sheet: a fixed label gutter, then one grid
         column of equal-height lanes. The ruler is the first lane, so its
         ticks line up with the keys underneath by construction rather than by
         matching two paddings by hand. */
      .majoor-omnicam .oc-dope{display:flex;flex-direction:column;min-width:0;--oc-ruler-h:36px;--oc-dope-row-h:32px;--oc-dope-gap:6px}
      .majoor-omnicam .oc-sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
      .majoor-omnicam .oc-dope-body{display:grid;grid-template-columns:var(--oc-dope-gutter,124px) minmax(0,1fr);gap:0 10px;min-width:0;background:var(--oc-sunken);border:1px solid var(--oc-line-soft);border-radius:var(--oc-radius-sm);padding:0 12px 9px 9px}
      .majoor-omnicam .oc-dope-labels{display:flex;flex-direction:column;gap:var(--oc-dope-gap,4px);padding-top:calc(var(--oc-ruler-h,30px) + var(--oc-dope-gap,4px))}
      .majoor-omnicam .oc-dope-label{display:flex;align-items:center;gap:7px;height:var(--oc-dope-row-h,26px);color:var(--oc-text-dim);font-size:11.5px;cursor:pointer;user-select:none}
      .majoor-omnicam .oc-dope-label:hover{color:var(--oc-text)}
      .majoor-omnicam .oc-dope-label>input[type=checkbox]{width:14px;height:14px;min-width:14px;padding:0;accent-color:var(--channel-color,var(--oc-accent));cursor:pointer}
      .majoor-omnicam .oc-dope-label span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      /* Margin, not padding: a lane's diamonds are absolutely positioned, so
         left:0% resolves against the padding box and padding would not inset
         them. The margin insets the ruler and every lane together, which keeps
         them aligned while giving the first and last diamond room to sit fully
         inside the panel. */
      .majoor-omnicam .oc-dope-tracks{position:relative;min-width:0;margin:0 9px;display:flex;flex-direction:column;gap:var(--oc-dope-gap,4px)}

      .majoor-omnicam .oc-ruler{position:relative;height:var(--oc-ruler-h,30px);min-width:0;cursor:ew-resize;touch-action:none}
      /* The legacy .timeline-tick is a full-height rule with a left border and
         left padding, drawn inside the old key lane. On the ruler it is just a
         number, so height, border and padding are all reset -- otherwise every
         label trails a vertical line down the ruler and sits 4px off-centre. */
      .majoor-omnicam .oc-ruler .timeline-tick{position:absolute;top:2px;height:auto;border:0;padding:0;transform:translateX(-50%);font-size:10px;color:var(--oc-text-faint);pointer-events:none;line-height:1}
      .majoor-omnicam .oc-tick{position:absolute;bottom:0;width:1px;height:5px;background:var(--oc-line);pointer-events:none}
      .majoor-omnicam .oc-tick.major{height:9px;background:var(--oc-text-faint)}
      .majoor-omnicam .oc-playhead-head{position:absolute;bottom:-2px;width:0;height:0;margin-left:-6px;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid var(--oc-accent);pointer-events:none;z-index:6}

      .majoor-omnicam .oc-dope-tracks .keys{position:relative;height:var(--oc-dope-row-h,26px);border-radius:6px;background:var(--oc-panel-2);border:1px solid var(--oc-line-soft);overflow:visible}
      /* Every lane carries the same dim baseline; the channel-coloured rail on
         top of it marks the span where that channel is actually animated. */
      .majoor-omnicam .oc-dope-tracks .keys::before,
      .majoor-omnicam .oc-dope-row::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;margin-top:-.5px;background:var(--oc-line);opacity:.7}
      /* Scoped to the master lane: the ruler is also inside .oc-dope-tracks,
         and an unscoped rule here hid its frame numbers. */
      .majoor-omnicam .oc-dope-tracks .keys .timeline-tick{display:none}
      .majoor-omnicam .oc-dope-tracks .keys .playhead{display:none}
      .majoor-omnicam .oc-dope-rows{display:flex;flex-direction:column;gap:var(--oc-dope-gap,4px);min-width:0}
      .majoor-omnicam .oc-dope-row{position:relative;height:var(--oc-dope-row-h,26px);border-radius:6px;background:var(--oc-panel-2);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-dormant-keys{color:var(--oc-warn,#f2a93b);cursor:help}
      .majoor-omnicam .oc-gsequence{display:flex;flex-direction:column;gap:8px;min-height:190px;padding:9px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-sequence-toolbar{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
      .majoor-omnicam .oc-sequence-summary{margin-left:auto;font-size:10px;opacity:.6;flex-basis:100%;text-align:right}
      .majoor-omnicam .oc-sequence-tracks{position:relative;display:flex;flex-direction:column;gap:4px}
      .majoor-omnicam .oc-sequence-lane{position:relative;height:52px;overflow:hidden;border-radius:4px;background:rgba(255,255,255,.04)}
      .majoor-omnicam .oc-sequence-audio{position:relative;height:34px;overflow:hidden;border-radius:4px;background:rgba(255,255,255,.03)}
      .majoor-omnicam .oc-sequence-waveform{position:absolute;inset:0;width:100%;height:100%;opacity:.5}
      .majoor-omnicam .oc-sequence-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;opacity:.55;text-align:center;padding:0 8px}
      .majoor-omnicam .oc-sequence-shot{position:absolute;top:3px;bottom:3px;display:flex;align-items:center;overflow:hidden;border-radius:3px;border:1px solid var(--shot-color);background:color-mix(in srgb,var(--shot-color) 30%,transparent);cursor:context-menu}
      .majoor-omnicam .oc-sequence-shot.no-proxy{border-style:dashed;opacity:.55}
      .majoor-omnicam .oc-sequence-name{padding:0 12px;font-size:11px;line-height:1;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;pointer-events:none}
      .majoor-omnicam .oc-sequence-handle{position:absolute;left:-6px;top:0;bottom:0;width:13px;cursor:ew-resize;background:var(--shot-color);border-radius:2px;opacity:.85;touch-action:none}
      .majoor-omnicam .oc-sequence-handle::after{content:"";position:absolute;left:5px;top:35%;bottom:35%;width:3px;background:#fff;opacity:.7;border-radius:2px}
      .majoor-omnicam .oc-sequence-handle:hover{opacity:1}
      .majoor-omnicam .oc-sequence-playhead{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:var(--oc-accent);opacity:.9;pointer-events:none}
      .majoor-omnicam .oc-dope-rail{position:absolute;top:50%;height:1px;margin-top:-.5px;background:var(--channel-color,var(--oc-accent));opacity:.5;pointer-events:none}

      /* The master lane keeps the legacy .key element -- it owns drag, retime,
         duplicate and multi-select -- but that element is a 32x48 chip with a
         diamond drawn inside it as ::before. Rather than fight its wall of
         !important declarations, the chip becomes an invisible hit target and
         its own ::before becomes the diamond. The interpolation glyphs
         (circle = smooth, square = linear, thick edge = hold) survive, and so
         do the selected / at-playhead ::before colours. */
      .majoor-omnicam .oc-dope-tracks .key{top:50% !important;width:20px !important;height:20px !important;min-width:0 !important;margin-top:-10px !important;border:0 !important;border-radius:0 !important;background:none !important;box-shadow:none !important;opacity:1 !important;transform:translateX(-50%) !important;animation:none !important}
      .majoor-omnicam .oc-dope-tracks .key::before{left:50%;top:50%;width:13px;height:13px;margin:-7px 0 0 -7px;border-color:#c4b5fd;background:#a78bfa;box-shadow:none;transform:rotate(45deg)}
      .majoor-omnicam .oc-dope-tracks .key[data-interp="smooth"]::before{transform:none}
      .majoor-omnicam .oc-dope-tracks .key[data-interp="linear"]::before{transform:none}
      .majoor-omnicam .oc-dope-tracks .key[data-interp="hold"]::before{transform:none}
      .majoor-omnicam .oc-dope-tracks .key:hover::before{filter:brightness(1.25)}
      .majoor-omnicam .oc-dope-tracks .key .key-label{display:none}
      .majoor-omnicam .oc-dope-key{position:absolute;top:50%;width:11px;height:11px;margin:-6px 0 0 -6px;padding:0;background:var(--channel-color,var(--oc-accent));border:1px solid rgba(0,0,0,.5);border-radius:2px;transform:rotate(45deg);cursor:pointer;z-index:3}
      .majoor-omnicam .oc-dope-key:hover{filter:brightness(1.25)}
      .majoor-omnicam .oc-dope-key.selected{outline:2px solid #fff;outline-offset:1px}
      .majoor-omnicam .oc-dope-key.at-playhead{box-shadow:0 0 0 3px rgba(255,255,255,.22)}

      .majoor-omnicam .oc-playhead-line{position:absolute;top:calc(var(--oc-ruler-h,30px) - 9px);bottom:0;width:2px;margin-left:-1px;background:var(--oc-accent);opacity:.85;pointer-events:none;z-index:5}

      /* ---- graph editor ---------------------------------------------- */
      .majoor-omnicam .oc-graph{margin:0 8px 8px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius);overflow:hidden}
      .majoor-omnicam .oc-graph>summary{display:flex;align-items:center;gap:9px;padding:7px 10px;cursor:pointer;border-bottom:1px solid var(--oc-line)}
      .majoor-omnicam .oc-graph-tabs{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-graph-tab{padding:4px 12px;border:0;border-radius:5px;background:transparent;color:var(--oc-text-dim);font-size:11.5px;cursor:pointer}
      .majoor-omnicam .oc-graph-tab strong{font-weight:600}
      .majoor-omnicam .oc-graph-tab:hover{color:var(--oc-text)}
      .majoor-omnicam .oc-graph-tab.active{background:var(--oc-panel-2);color:var(--oc-text);box-shadow:inset 0 0 0 1px var(--oc-line)}
      .majoor-omnicam .oc-graph>summary .hint{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10.5px;color:var(--oc-text-faint)}
      /* overflow-x:auto here used to clip the overflow popover, leaving its
         interpolation and tangent buttons unreachable. It wraps instead. */
      .majoor-omnicam .oc-graph-toolbar{display:flex;align-items:center;gap:4px;padding:6px 10px;border-bottom:1px solid var(--oc-line-soft);flex-wrap:wrap}
      .majoor-omnicam .oc-graph-modes{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-graph-modes .curve-mode{border-color:transparent !important;background:transparent !important}
      .majoor-omnicam .oc-graph-toolbar .curve-mode{padding:4px 11px;border-radius:5px;background:var(--oc-sunken);border-color:var(--oc-line);color:var(--oc-text-dim);font-size:11px}
      .majoor-omnicam .oc-graph-toolbar .curve-mode.active{background:var(--oc-accent) !important;border-color:var(--oc-accent) !important;color:#fff !important;box-shadow:none !important}
      .majoor-omnicam .oc-graph-spacer{flex:1;min-width:0}
      .majoor-omnicam .oc-graph-body{display:grid;grid-template-columns:150px minmax(0,1fr);gap:10px;padding:8px 10px 10px;min-width:0}
      .majoor-omnicam .oc-graph-legend{display:flex;flex-direction:column;gap:3px}
      .majoor-omnicam .oc-graph-legend-title{padding:2px 4px 4px;color:var(--oc-text);font-size:11.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .oc-graph-legend .curve-mode{justify-content:flex-start;gap:8px;padding:5px 9px;border-radius:6px;background:var(--oc-sunken);border-color:var(--oc-line);color:var(--oc-text-dim);font-size:11px;text-align:left}
      .majoor-omnicam .oc-graph-legend .curve-mode.active{background:var(--oc-panel-2) !important;border-color:var(--oc-accent) !important;color:var(--oc-text) !important;box-shadow:none !important}
      .majoor-omnicam .oc-graph-legend .ch-dot{width:10px;height:10px;border-radius:2px;flex:none}
      .majoor-omnicam .oc-graph-stage{min-width:0}
      .majoor-omnicam .oc-graph .curve-canvas{width:100%;min-height:190px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}

      /* Dope Sheet tab of the graph panel: one lane per graphed component. */
      .majoor-omnicam .oc-gdope{display:flex;flex-direction:column;gap:4px;min-height:190px;padding:9px;border-radius:var(--oc-radius-sm);background:var(--oc-sunken);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-gdope-row{display:grid;grid-template-columns:104px minmax(0,1fr);align-items:center;gap:8px}
      .majoor-omnicam .oc-gdope-label{color:var(--channel-color,var(--oc-text-dim));font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .majoor-omnicam .oc-gdope-track{position:relative;height:26px;border-radius:6px;background:var(--oc-panel-2);border:1px solid var(--oc-line-soft)}
      .majoor-omnicam .oc-gdope-track::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:var(--channel-color,var(--oc-line));opacity:.4}
      .majoor-omnicam .oc-gdope-playhead{position:absolute;top:-2px;bottom:-2px;width:2px;margin-left:-1px;background:var(--oc-accent);opacity:.85;pointer-events:none}

      @container (max-width:820px){
        .majoor-omnicam .oc-body{grid-template-columns:minmax(0,1fr)}
        .majoor-omnicam .oc-lower{grid-template-columns:minmax(0,1fr)}
        .majoor-omnicam .oc-side-body{max-height:340px}
        .majoor-omnicam .vp-hint{display:none}
      }
      @container (max-width:560px){
        .majoor-omnicam .oc-dope-body{--oc-dope-gutter:86px}
        .majoor-omnicam .oc-gdope-row{grid-template-columns:74px minmax(0,1fr)}
        .majoor-omnicam .oc-graph-body{grid-template-columns:minmax(0,1fr)}
        .majoor-omnicam .oc-graph-legend{flex-direction:row;flex-wrap:wrap}
        .majoor-omnicam .oc-transport{flex-wrap:wrap}
      }
`;
