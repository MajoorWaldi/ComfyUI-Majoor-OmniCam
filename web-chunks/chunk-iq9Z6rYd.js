import { a as s, e as u, a2 as C } from "./chunk-DXtw26Dt.js";
import { g as N, l as I } from "./chunk-CYXHK_as.js";
const J = `
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
`, y = 24, k = 5, j = 150, _ = Math.PI / 180;
function S(o, e, a) {
  return Math.min(a, Math.max(e, o));
}
function T(o, e = y) {
  const a = S(Number(o) || 0, k, j);
  return e / (2 * Math.tan(a * _ / 2));
}
function A(o, e = y) {
  const a = Math.max(1e-6, Number(o) || 0), r = 2 * Math.atan(e / (2 * a)) / _;
  return S(r, k, j);
}
function z(o) {
  const e = T(o);
  return e >= 100 ? e.toFixed(0) : e.toFixed(1);
}
const B = [14, 24, 35, 50, 85, 135], w = [
  "#4aa3ef",
  // Camera 1 - Blue/Cyan
  "#f2a93b",
  // Camera 2 - Amber/Gold
  "#48c774",
  // Camera 3 - Emerald/Green
  "#b565d8",
  // Camera 4 - Purple
  "#ec4899",
  // Camera 5 - Pink
  "#06b6d4",
  // Camera 6 - Cyan
  "#f97316",
  // Camera 7 - Orange
  "#8b5cf6"
  // Camera 8 - Violet
];
function M(o) {
  const e = `camera_${Date.now().toString(36)}`;
  let a = e, r = 2;
  for (; o.cameras.some((t) => t.id === a); ) a = `${e}_${r++}`;
  return a;
}
function F(o, e) {
  if (!o.cameras.some((r) => r.name === e)) return e;
  let a = 2;
  for (; o.cameras.some((r) => r.name === `${e} ${a}`); ) a += 1;
  return `${e} ${a}`;
}
function q(o, e, { label: a = "Extracted Camera" } = {}) {
  const r = Array.isArray(e?.keyframes) ? e.keyframes : [];
  if (!r.length) throw new Error(s("no camera keys in this solve"));
  const t = Number(o.state.fps) || 24, n = Number(e.fps) || t, p = n > 0 ? t / n : 1, i = M(o.state), m = o.state.cameras.length, c = F(o.state, a || "Extracted Camera"), d = w[m % w.length], v = r.map((h) => ({
    ...h,
    frame: Math.round((Number(h.frame) || 0) * p),
    camera: u(h.camera)
  }));
  if (o.state.cameras.push({ id: i, name: c, color: d, camera: u(v[0].camera), keyframes: v }), Number.isFinite(Number(e.duration_frames))) {
    const h = Math.round(Number(e.duration_frames) * p);
    o.state.duration_frames = Math.max(o.state.duration_frames || 1, h);
  }
  return o.cameraPreviewSignature = "", o.activateCamera(i), i;
}
function Y(o, e) {
  const a = A(e);
  o.activeCameraTrack()?.keyframes?.length && o.activeKeyframe() ? (o.activeKeyframe().camera.fov = a, o.scheduleSerialize(), o.render(), o.refreshKeyEditor()) : (o.camera.fov = a, o.render());
  for (const t of o.root.querySelectorAll('[data-role="camera-fov"]')) t.value = String(a.toFixed(1));
  for (const t of o.root.querySelectorAll('[data-role="camera-focal"]')) t.value = z(a);
  o.setStatus(`Lens: ${e}mm (FOV ${a.toFixed(1)}°)`);
}
function O(o) {
  return o?.state?.cameras?.length || (o.state.cameras = [{ id: "camera_1", name: "Camera 1", color: "#4aa3ef", camera: u(o?.camera), keyframes: o?.state?.keyframes || [] }]), o.state.cameras.find((e) => e.id === o.state.active_camera_id) || o.state.cameras[0];
}
const g = "upstream_camera_track";
function Q(o, e, {
  label: a = "Import camera",
  source: r = "camera_import",
  fingerprint: t = "",
  originNodeId: n = null,
  adoptFps: p = !0,
  checkpoint: i = !0,
  status: m = !0
} = {}) {
  const c = e?.keyframes;
  if (!Array.isArray(c) || !c.length)
    throw new Error(s("no camera keys in this file"));
  i && o.checkpoint(a);
  const d = O(o);
  return d.keyframes = c, o.state.keyframes = c, p && Number.isFinite(Number(e.fps)) && (o.state.fps = Math.max(1, Math.round(Number(e.fps))), o.fpsWidget && (o.fpsWidget.value = o.state.fps)), Number.isFinite(Number(e.duration_frames)) && (o.state.duration_frames = Math.max(1, Math.round(Number(e.duration_frames)))), o.durationWidget && (o.durationWidget.value = o.state.duration_frames / Math.max(1, o.state.fps)), t && (o.state.metadata = {
    ...o.state.metadata,
    [g]: {
      fingerprint: t,
      source: r,
      ...n == null ? {} : { origin_node_id: String(n) }
    }
  }), o.syncActiveCameraTrack(), o.setFrame(0), o.refreshKeys(), o.render(), o.scheduleSerialize(), m && o.setStatus(s("Imported {count} camera keys from {name}").replace("{count}", String(c.length)).replace("{name}", a)), c.length;
}
const R = "omnicam_extractor_result_v2", f = "omnicam_extracted_motion_scene_json", x = "omnicam_extracted_track_fingerprint", D = "omnicam_extractor_source";
function E(o) {
  if (!o || o.version !== 1 || !Array.isArray(o.cameras)) return null;
  const e = String(o.playblast_camera_id || o.active_camera_id || ""), r = o.cameras.find((t) => String(t?.id || "") === e)?.track;
  return r && Array.isArray(r.keyframes) && r.keyframes.length ? r : null;
}
function Z(o) {
  if (!o || !Array.isArray(o.keyframes) || !o.keyframes.length) return null;
  const e = Number(o.fps), a = Number(o.duration_frames);
  if (!(e > 0) || !(a > 0)) return null;
  const r = String(o.metadata?.extractor_fingerprint || "");
  return {
    version: 1,
    timeline: { duration_seconds: a / e, authoring_fps: e },
    canvas: { width: Number(o.width), height: Number(o.height) },
    cameras: [{ id: "extracted_camera", label: "Extracted Camera", enabled: !0, track: o }],
    active_camera_id: "extracted_camera",
    playblast_camera_id: "extracted_camera",
    objects: Array.isArray(o.objects) ? o.objects : [],
    motion_layers: [],
    cuts: [],
    metadata: { ...o.metadata || {}, source: "omnicam_extractor", extractor_fingerprint: r }
  };
}
function oo(o) {
  const e = o?.text, a = Array.isArray(e) ? e[0] : e;
  if (typeof a != "string" || !a) return null;
  let r;
  try {
    r = JSON.parse(a);
  } catch {
    return null;
  }
  if (!r || r.kind !== R) return null;
  const t = r.motion_scene, n = E(t);
  return n ? {
    motionScene: t,
    track: n,
    fingerprint: String(r.fingerprint || ""),
    solver_coverage: Number(r.solver_coverage) || 0,
    report: String(r.report || ""),
    source: String(r.source || "")
  } : null;
}
function L(o) {
  return o.computeSize = () => [0, -4], o.draw = () => {
  }, o.hidden = !0, o.options = { ...o.options || {}, hideInVueNodes: !0 }, o;
}
function l(o, e) {
  return o.widgets?.find((a) => a.name === e) || null;
}
function W(o) {
  const e = [];
  for (const a of [f, x]) {
    let r = l(o, a);
    if (!r) {
      if (r = o.addWidget?.("text", a, "", () => {
      }, { serialize: !0 }), !r) continue;
      L(r);
    }
    e.push(r);
  }
  return e;
}
function eo(o, e) {
  W(o);
  const a = l(o, f), r = l(o, x), t = String(r?.value || "") !== e.fingerprint;
  return a && (a.value = JSON.stringify(e.motionScene)), r && (r.value = e.fingerprint), t;
}
function ao(o, e) {
  const a = l(o, D);
  if (!a || !e) return !1;
  const r = String(e), t = String(a.value || "") !== r;
  return a.value = r, t;
}
function $(o) {
  const e = String(l(o, x)?.value || ""), a = String(l(o, f)?.value || "");
  if (!e || !a) return null;
  let r;
  try {
    r = JSON.parse(a);
  } catch {
    return null;
  }
  const t = E(r);
  return t ? { motionScene: r, track: t, fingerprint: e } : null;
}
function ro(o) {
  const e = o?.track?.metadata || {}, a = String(e.backend || "solver").toUpperCase(), r = Number(o?.track?.duration_frames) || 0, t = Array.isArray(o?.track?.keyframes) ? o.track.keyframes.length : 0, n = Math.round((Number(o?.solver_coverage ?? o?.confidence) || 0) * 100);
  return `${a} · ${r} f · ${t} keys · Solver Coverage ${n}%`;
}
const P = "solved_scene";
function K(o) {
  return String(o?.comfyClass || o?.type || o?.constructor?.type || "");
}
function G(o) {
  const e = o?.node, a = e?.graph;
  if (!a) return null;
  for (const r of e.inputs || []) {
    if (String(r?.name || "").toLowerCase() !== P || r.link == null) continue;
    const t = I(a, r.link);
    if (t && K(t) === C) return t;
  }
  return null;
}
function U(o) {
  return String(o?.state?.metadata?.[g]?.fingerprint || "");
}
function V(o, e, a) {
  o.state.metadata = {
    ...o.state.metadata,
    [g]: {
      fingerprint: e,
      source: "omnicam_extractor",
      origin_node_id: String(a.id)
    }
  };
}
function b(o) {
  const e = o.root?.querySelector('[data-role="extractor-import-banner"]');
  if (!e) return;
  const a = o.pendingExtractorImport;
  if (e.hidden = !a, !a) return;
  const r = e.querySelector('[data-role="extractor-import-text"]');
  r && (r.textContent = s("{count} camera keys ready from {name} — import as a new camera?").replace("{count}", String(a.keyCount)).replace("{name}", a.label));
}
function to(o) {
  const e = G(o), a = e ? $(e) : null;
  let r = !1;
  return a ? a.fingerprint !== U(o) && o.pendingExtractorImport?.fingerprint !== a.fingerprint && (o.pendingExtractorImport = {
    track: a.track,
    fingerprint: a.fingerprint,
    originNodeId: e.id,
    label: String(e.title || s("OmniCam Extractor")),
    keyCount: a.track.keyframes?.length || 0
  }, V(o, a.fingerprint, e), r = !0) : o.pendingExtractorImport && (o.pendingExtractorImport = null, r = !0), b(o), r;
}
function no(o) {
  const e = o.pendingExtractorImport;
  return e ? (o.checkpoint("Import extracted camera"), q(o, e.track, { label: e.label }), o.pendingExtractorImport = null, b(o), o.setStatus?.(s("Imported {count} camera keys from {name}").replace("{count}", String(e.keyCount)).replace("{name}", e.label)), o.scheduleSerialize(), o.render(), !0) : !1;
}
function io(o) {
  return o.pendingExtractorImport ? (o.pendingExtractorImport = null, b(o), o.render(), o.setStatus?.(s("Extracted camera preview dismissed")), !0) : !1;
}
function co(o) {
  const e = o?.graph;
  if (!e) return 0;
  const a = o.outputs || [], r = /* @__PURE__ */ new Set();
  let t = 0;
  for (const n of a)
    for (const p of n?.links || []) {
      const i = N(e, p), m = i?.target_id ?? i?.targetId;
      if (!i || m == null || r.has(m)) continue;
      r.add(m);
      const d = e.getNodeById?.(m)?.__majoorOmniCam;
      d?.syncUpstreamInputs && (d.syncUpstreamInputs(), t += 1);
    }
  return t;
}
export {
  x as F,
  J as L,
  D as S,
  B as a,
  z as b,
  no as c,
  io as d,
  Y as e,
  A as f,
  eo as g,
  W as h,
  ao as i,
  ro as j,
  f as k,
  Q as l,
  Z as m,
  co as n,
  oo as p,
  $ as r,
  to as s
};
