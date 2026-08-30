// Reusable visual primitives shared by the Director and Monitor surfaces.
export const SHARED_STYLES = `
  .majoor-omnicam{
    --oc-bg:#141419;--oc-panel:#1a1a21;--oc-panel-2:#20202a;--oc-sunken:#101014;
    --oc-line:#2c2c38;--oc-line-soft:#26262f;
    --oc-text:#e6e6f0;--oc-text-dim:#9a9aad;--oc-text-faint:#6f6f82;
    --oc-accent:#8b7bd8;--oc-accent-soft:#6d5fb0;--oc-accent-ink:#ffffff;
    --oc-ok:#46a758;--oc-ok-bg:#16281d;--oc-ok-line:#2f6b45;--oc-ok-text:#7ee2a8;
    --oc-warn:#e5a23c;--oc-warn-bg:#2a2112;--oc-warn-line:#6f5020;--oc-warn-text:#f2c66d;
    --oc-danger:#e5484d;--oc-danger-bg:#2b1719;--oc-danger-line:#74363a;--oc-danger-text:#ff8f92;
    --oc-info:#4a8fe7;--oc-radius:10px;--oc-radius-sm:7px;
    font:12px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    background:var(--oc-bg);border-color:var(--oc-line);color:var(--oc-text);
  }
  .majoor-omnicam *{box-sizing:border-box}
  .majoor-omnicam *::-webkit-scrollbar{width:6px;height:6px}
  .majoor-omnicam *::-webkit-scrollbar-track{background:rgba(0,0,0,.3);border-radius:3px}
  .majoor-omnicam *::-webkit-scrollbar-thumb{background:#444456;border-radius:3px}
  .majoor-omnicam button:focus-visible,.majoor-omnicam input:focus-visible,
  .majoor-omnicam select:focus-visible,.majoor-omnicam [tabindex]:focus-visible{
    outline:2px solid var(--oc-accent);outline-offset:2px;
  }
  .majoor-omnicam .oc-header{display:flex;align-items:center;gap:9px;padding:9px 12px;background:var(--oc-panel);border-bottom:1px solid var(--oc-line)}
  .majoor-omnicam .oc-heading{display:flex;align-items:center;gap:9px;min-width:0}
  .majoor-omnicam .oc-brand{display:flex;align-items:center;justify-content:center;flex:none;width:26px;height:26px;border-radius:8px;background:var(--oc-panel-2);border:1px solid var(--oc-line);color:var(--oc-text);line-height:0}
  .majoor-omnicam .oc-title{font-size:14px;font-weight:650;letter-spacing:.01em}
  .majoor-omnicam .oc-mark{display:block;width:20px;height:20px}.majoor-omnicam .oc-mark-ring{fill:none;stroke:var(--oc-text-dim);stroke-width:2.5}.majoor-omnicam .oc-mark-core{fill:var(--oc-danger)}
  .majoor-omnicam .oc-status-pill{display:inline-flex;align-items:center;gap:6px;padding:3px 11px;border-radius:999px;background:var(--oc-ok-bg);border:1px solid var(--oc-ok-line);color:var(--oc-ok-text);font-size:11px;font-weight:600;white-space:nowrap}
  .majoor-omnicam .oc-status-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}
  .majoor-omnicam .oc-card{display:flex;flex-direction:column;gap:6px;padding:9px;background:var(--oc-panel);border:1px solid var(--oc-line);border-radius:var(--oc-radius)}
  .majoor-omnicam .oc-section{color:var(--oc-text-faint);font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase}
  .majoor-omnicam .oc-field-row{display:flex;align-items:center;gap:6px}
  .majoor-omnicam .oc-empty{padding:12px;border:1px dashed var(--oc-line);border-radius:var(--oc-radius-sm);color:var(--oc-text-dim);text-align:center}
`;
