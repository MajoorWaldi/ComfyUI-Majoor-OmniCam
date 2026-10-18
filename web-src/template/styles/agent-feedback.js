export const AGENT_FEEDBACK_STYLES = `
.majoor-omnicam .oc-agent-feedback[data-tone="info"]{color:#93c5fd}
.majoor-omnicam .oc-agent-feedback[data-tone="success"]{color:#86efac}
.majoor-omnicam .oc-agent-feedback[data-tone="warning"]{color:#fcd34d}
.majoor-omnicam .oc-agent-feedback[data-tone="error"]{color:#fca5a5}
.majoor-omnicam .oc-agent-progress{flex:0 0 6px;height:6px;width:100%;overflow:hidden;border-radius:4px;background:var(--oc-sunken);margin:4px 0 8px}
.majoor-omnicam .oc-agent-progress[hidden]{display:none!important}
.majoor-omnicam .oc-agent-progress-fill{height:100%;width:100%;background:#86efac;border-radius:inherit}
.majoor-omnicam .oc-agent-progress[data-busy="true"] .oc-agent-progress-fill{width:35%;background:#93c5fd;animation:oc-agent-working 1.4s ease-in-out infinite}
@keyframes oc-agent-working{from{transform:translateX(-100%)}to{transform:translateX(386%)}}
@media(prefers-reduced-motion:reduce){.majoor-omnicam .oc-agent-progress[data-busy="true"] .oc-agent-progress-fill{animation:none;width:100%;background:repeating-linear-gradient(90deg,#93c5fd 0 8px,transparent 8px 16px)}}
`;
