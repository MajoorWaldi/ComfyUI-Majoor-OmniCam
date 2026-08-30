import { SHARED_STYLES } from "../template/styles/shared.js";

export const MONITOR_STYLES = `${SHARED_STYLES}
  .oc-monitor{width:100%;min-height:680px;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--oc-line);border-radius:var(--oc-radius);background:var(--oc-bg)}
  .oc-monitor .oc-header{justify-content:space-between}.oc-monitor .oc-header-actions{display:flex;align-items:center;gap:7px}
  .oc-monitor button,.oc-monitor select,.oc-monitor input,.oc-monitor textarea{font:inherit;color:var(--oc-text);background:var(--oc-panel-2);border:1px solid var(--oc-line);border-radius:6px}
  .oc-monitor button{padding:5px 9px;cursor:pointer}.oc-monitor button:hover{border-color:var(--oc-accent)}
  .oc-monitor .oc-live{display:flex;align-items:center;gap:4px;color:var(--oc-text-dim)}
  .oc-monitor .oc-status-pill[data-state="WARNING"]{background:var(--oc-warn-bg);border-color:var(--oc-warn-line);color:var(--oc-warn-text)}
  .oc-monitor .oc-status-pill[data-state="BLOCKED"]{background:var(--oc-danger-bg);border-color:var(--oc-danger-line);color:var(--oc-danger-text)}
  .oc-monitor .oc-status-pill[data-state="OUTDATED"]{background:#191f2d;border-color:#35486b;color:#86b6f2}
  .oc-monitor .oc-status-pill[data-state="OFFLINE"]{background:var(--oc-sunken);border-color:var(--oc-line);color:var(--oc-text-dim)}
  .oc-monitor .oc-status-pill[data-state="CONNECTED"]{background:#191f2d;border-color:#35486b;color:#9fb6d8}
  .oc-monitor .oc-source{padding:6px 12px;border-bottom:1px solid var(--oc-line);color:var(--oc-text-dim)}
  .oc-monitor .oc-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);gap:9px;padding:9px;min-height:0}
  .oc-monitor .oc-column{display:flex;flex-direction:column;gap:9px;min-width:0}.oc-monitor .oc-player{position:relative;min-height:270px;background:#09090c;border-radius:8px;overflow:hidden}
  .oc-monitor video{display:block;width:100%;height:270px;object-fit:contain;background:#08080b}.oc-monitor .oc-player-empty{position:absolute;inset:0;display:grid;place-items:center;color:var(--oc-text-faint);pointer-events:none}
  .oc-monitor canvas[data-role="proxy-upstream-preview"]{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#08080b;filter:saturate(.7) brightness(.85)}
  .oc-monitor .oc-player-controls{display:flex;gap:6px;align-items:center;padding-top:7px}.oc-monitor .oc-player-controls input{flex:1}.oc-monitor .oc-player-controls output{min-width:62px;color:var(--oc-text-dim)}
  .oc-monitor [data-role="monitor-track-timeline"]{height:106px;cursor:crosshair}
  .oc-monitor .oc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.oc-monitor .oc-row{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid var(--oc-line-soft)}
  .oc-monitor .oc-row:last-child{border-bottom:0}.oc-monitor .oc-row strong{font-weight:600}.oc-monitor .oc-row small{color:var(--oc-text-dim)}
  .oc-monitor .oc-state{font-size:10px;font-weight:750}.oc-monitor .oc-state[data-state="ready"]{color:var(--oc-ok-text)}.oc-monitor .oc-state[data-state="warning"]{color:var(--oc-warn-text)}.oc-monitor .oc-state[data-state="blocked"]{color:var(--oc-danger-text)}.oc-monitor .oc-state[data-state="pass"]{color:var(--oc-ok-text)}.oc-monitor .oc-state[data-state="risk"]{color:var(--oc-text-dim)}
  .oc-monitor .oc-advanced>summary{cursor:pointer;list-style:none}.oc-monitor .oc-advanced>summary::-webkit-details-marker{display:none}
  .oc-monitor .oc-adapter-controls{display:grid;grid-template-columns:1fr 1fr;gap:6px}.oc-monitor .oc-adapter-controls label{display:flex;flex-direction:column;gap:3px;color:var(--oc-text-dim)}
  .oc-monitor .oc-adapter-controls .wide{grid-column:1/-1}.oc-monitor .oc-adapter-controls input,.oc-monitor .oc-adapter-controls select{width:100%;padding:5px}
  .oc-monitor .oc-preview-label{display:flex;gap:7px;align-items:center;margin-bottom:7px}.oc-monitor .oc-preview-label span{font-size:9px;font-weight:750;color:var(--oc-accent)}
  .oc-monitor canvas{display:block;width:100%;height:auto;max-height:260px;background:var(--oc-sunken);border-radius:6px}.oc-monitor .oc-frame-strip{display:flex;gap:4px;overflow:auto}.oc-monitor .oc-frame-strip span{min-width:32px;padding:6px 3px;text-align:center;background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:4px;color:var(--oc-text-dim)}
  .oc-monitor .oc-tabs{display:flex;gap:4px;overflow:auto}.oc-monitor .oc-tab[aria-selected="true"]{background:var(--oc-accent);border-color:var(--oc-accent);color:var(--oc-accent-ink)}
  .oc-monitor .oc-copy-row{display:flex;justify-content:flex-end}.oc-monitor pre{min-height:95px;max-height:190px;overflow:auto;margin:0;padding:8px;white-space:pre-wrap;word-break:break-word;background:var(--oc-sunken);border-radius:6px;color:var(--oc-text-dim)}
  @media(max-width:700px){.oc-monitor .oc-layout{grid-template-columns:1fr}.oc-monitor .oc-grid{grid-template-columns:1fr}}
`;
