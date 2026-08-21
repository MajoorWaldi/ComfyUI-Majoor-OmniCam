import { DIRECTOR_STYLES } from "../template/styles.js";

export const SEQUENCER_STYLES = `${DIRECTOR_STYLES}
  .majoor-omnicam.omnicam-sequencer-root{
    display:flex;flex-direction:column;width:100%;height:560px;min-height:460px;
    background:#161618;border:1px solid #383842;border-radius:10px;overflow:hidden;
  }
  .majoor-omnicam .omnicam-sequencer-toolbar{
    flex-wrap:wrap !important;gap:5px;min-height:42px;padding:5px 8px;
  }
  .majoor-omnicam .omnicam-sequencer-toolbar button{
    height:28px;padding:0 8px;font-size:11px;white-space:nowrap;
  }
  .majoor-omnicam .omnicam-sequencer-toolbar button[data-seq-action="play"]{
    color:#4ade80;border-color:#2e7d32;
  }
  .majoor-omnicam .omnicam-sequencer-toolbar button[data-seq-action="split"]{
    background:linear-gradient(180deg,#d97706,#b45309);border-color:#f59e0b;color:#fff;font-weight:700;
  }
  .majoor-omnicam .omnicam-sequencer-toolbar button[data-seq-action="disable"]{color:#fca5a5}
  .majoor-omnicam .omnicam-sequencer-toolbar select{height:28px;min-width:130px;padding:0 7px;font-size:11px}
  .majoor-omnicam .omnicam-seq-time-display{
    margin-left:auto;padding:4px 8px;border:1px solid #363644;border-radius:6px;background:#141418;
    color:#f2d06b;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:700;
  }
  .majoor-omnicam .sequencer-section{
    position:relative;background:#191920;border-top:1px solid #333340;overflow:hidden;
  }
  .majoor-omnicam .sequencer-section-title{
    position:absolute;z-index:2;left:8px;top:5px;padding:2px 6px;border:1px solid #3c3c4a;border-radius:4px;
    background:#1e1e26;color:#9494a8;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
    pointer-events:none;
  }
  .majoor-omnicam .sequencer-timeline-section{height:270px;flex:0 0 270px}
  .majoor-omnicam .sequencer-graph-section{flex:1;min-height:165px}
  .majoor-omnicam .omnicam-sequencer-canvas,
  .majoor-omnicam .omnicam-sequencer-speed-graph{display:block;width:100%;height:100%;cursor:default}
  .majoor-omnicam .omnicam-sequencer-canvas{touch-action:none;overscroll-behavior:contain}
  @container (max-width:720px){
    .majoor-omnicam .omnicam-seq-time-display{width:100%;margin-left:0;text-align:center}
  }
`;
