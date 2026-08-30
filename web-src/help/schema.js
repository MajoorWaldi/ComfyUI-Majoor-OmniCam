// Shared render engine for OmniCam's per-node help popup.
//
// A node registers one plain-object "help def" (registerNodeHelp) and gets a
// themed, scrollable popup for free. Mirrors the OmniCam palette (see
// web-src/template/styles/shared.js) but is self-contained: the popup is
// appended to document.body, outside the .majoor-omnicam DOM widget scope, so
// its colours are inlined rather than read from the widget's CSS variables.
//
// help def shape:
//   {
//     title:   "OmniCam Director",
//     tagline: "One line: what it is.",
//     sections: [
//       { heading: "What it does", body: "A paragraph.\n\nBlank line = new paragraph." },
//       { heading: "How to use",   bullets: ["do this", "then this"] },
//       { heading: "Inputs",       defs: [["name", "what it means"], ...] },
//     ],
//     footer: "Optional tip line shown at the bottom.",
//   }
//
// Any string may contain inline `code` (backticks), rendered as a monospace
// chip. All text is HTML-escaped first.

const CSS_ID = "oc-help-css";
const BRAND = "#8b7bd8";

const _nodeHelp = new Map();

export function registerNodeHelp(comfyClass, helpDef) {
  if (comfyClass && helpDef) _nodeHelp.set(comfyClass, helpDef);
}

export function getNodeHelp(comfyClass) {
  return comfyClass ? _nodeHelp.get(comfyClass) || null : null;
}

const CSS = `
.oc-help-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;
  align-items:center;justify-content:center;z-index:10000;font:12px/1.35 system-ui,
  -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.oc-help-card{background:#1a1a21;border:1px solid #2c2c38;border-radius:10px;
  width:min(680px,92vw);max-height:82vh;display:flex;flex-direction:column;
  box-shadow:0 14px 52px rgba(0,0,0,.6);overflow:hidden;color:#e6e6f0;
  animation:oc-help-in .14s ease}
@keyframes oc-help-in{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
.oc-help-header{display:flex;align-items:center;gap:10px;padding:12px 14px;
  border-bottom:1px solid #2c2c38;flex:none}
.oc-help-h-icon{width:18px;height:18px;flex:none;border-radius:50%;background:${BRAND};
  display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px}
.oc-help-h-title{flex:1;font-size:14px;font-weight:650;color:#fff;line-height:1.2}
.oc-help-close{flex:none;width:24px;height:24px;border-radius:6px;border:none;
  background:rgba(255,255,255,.06);color:#9a9aad;cursor:pointer;font-size:14px;
  line-height:1;display:flex;align-items:center;justify-content:center;transition:background .12s,color .12s}
.oc-help-close:hover{background:${BRAND};color:#fff}
.oc-help-body{padding:13px 15px 15px;overflow-y:auto;font-size:12px;line-height:1.55}
.oc-help-section{margin-bottom:14px}
.oc-help-section:last-child{margin-bottom:0}
.oc-help-h{margin:0 0 6px;font-size:10px;font-weight:700;color:${BRAND};
  text-transform:uppercase;letter-spacing:.06em}
.oc-help-p{margin:0 0 6px;white-space:pre-wrap;color:#cfcfd6}
.oc-help-p:last-child{margin-bottom:0}
.oc-help-ul{margin:0;padding-left:18px}
.oc-help-ul li{margin:0 0 4px}
.oc-help-defs{display:grid;grid-template-columns:auto 1fr;gap:5px 12px;align-items:baseline}
.oc-help-defs dt{color:#fff;font-weight:600;white-space:nowrap}
.oc-help-defs dd{margin:0;color:#b8b8c4}
.oc-help code{background:rgba(255,255,255,.08);border-radius:3px;padding:1px 5px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#d4cdfa}
.oc-help-tip{margin-top:2px;padding:8px 10px;background:rgba(139,123,216,.12);
  border-left:2px solid ${BRAND};border-radius:3px;color:#ddd;font-size:11.5px}
`;

function injectHelpCSS() {
  if (document.getElementById(CSS_ID)) return;
  const el = document.createElement("style");
  el.id = CSS_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

function fmt(s) {
  const esc = String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return esc.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`);
}

function buildSection(section) {
  const sec = document.createElement("div");
  sec.className = "oc-help-section";

  if (section.heading) {
    const h = document.createElement("div");
    h.className = "oc-help-h";
    h.textContent = section.heading;
    sec.appendChild(h);
  }

  if (section.body) {
    for (const para of String(section.body).split(/\n\s*\n/)) {
      const p = document.createElement("p");
      p.className = "oc-help-p";
      p.innerHTML = fmt(para);
      sec.appendChild(p);
    }
  }

  if (Array.isArray(section.bullets) && section.bullets.length) {
    const ul = document.createElement("ul");
    ul.className = "oc-help-ul";
    for (const item of section.bullets) {
      const li = document.createElement("li");
      li.innerHTML = fmt(item);
      ul.appendChild(li);
    }
    sec.appendChild(ul);
  }

  if (Array.isArray(section.defs) && section.defs.length) {
    const dl = document.createElement("dl");
    dl.className = "oc-help-defs";
    for (const entry of section.defs) {
      const [term, desc] = Array.isArray(entry) ? entry : [entry, ""];
      const dt = document.createElement("dt");
      dt.innerHTML = fmt(term);
      const dd = document.createElement("dd");
      dd.innerHTML = fmt(desc);
      dl.appendChild(dt);
      dl.appendChild(dd);
    }
    sec.appendChild(dl);
  }

  return sec;
}

let _openCleanup = null;

export function closeHelpPopup() {
  if (_openCleanup) _openCleanup();
}

export function openHelpPopup(helpDef) {
  helpDef = helpDef || {};
  injectHelpCSS();
  closeHelpPopup();

  const backdrop = document.createElement("div");
  backdrop.className = "oc-help-backdrop";

  const card = document.createElement("div");
  card.className = "oc-help-card oc-help";
  backdrop.appendChild(card);

  const header = document.createElement("div");
  header.className = "oc-help-header";
  const icon = document.createElement("span");
  icon.className = "oc-help-h-icon";
  icon.textContent = "?";
  const title = document.createElement("div");
  title.className = "oc-help-h-title";
  title.textContent = helpDef.title || "Help";
  const close = document.createElement("button");
  close.className = "oc-help-close";
  close.type = "button";
  close.textContent = "✕";
  close.title = "Close (Esc)";
  header.appendChild(icon);
  header.appendChild(title);
  header.appendChild(close);
  card.appendChild(header);

  const body = document.createElement("div");
  body.className = "oc-help-body";
  if (helpDef.tagline) {
    const tag = document.createElement("p");
    tag.className = "oc-help-p";
    tag.style.color = "#e6e6e6";
    tag.innerHTML = fmt(helpDef.tagline);
    body.appendChild(tag);
  }
  const sections = Array.isArray(helpDef.sections) ? helpDef.sections : [];
  for (const section of sections) {
    try {
      body.appendChild(buildSection(section));
    } catch (e) {
      console.warn("[OmniCam] help: skipped a malformed section", e);
    }
  }
  if (helpDef.footer) {
    const tip = document.createElement("div");
    tip.className = "oc-help-tip";
    tip.innerHTML = fmt(helpDef.footer);
    body.appendChild(tip);
  }
  card.appendChild(body);

  let mouseDownOnBackdrop = false;
  const cleanup = () => {
    document.removeEventListener("keydown", onKey, true);
    backdrop.remove();
    if (_openCleanup === cleanup) _openCleanup = null;
  };
  _openCleanup = cleanup;

  const onKey = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      cleanup();
    }
  };
  document.addEventListener("keydown", onKey, true);

  close.addEventListener("click", (e) => { e.stopPropagation(); cleanup(); });
  backdrop.addEventListener("mousedown", (e) => { mouseDownOnBackdrop = e.target === backdrop; });
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop && mouseDownOnBackdrop) cleanup();
    mouseDownOnBackdrop = false;
  });
  card.addEventListener("mousedown", (e) => e.stopPropagation());

  document.body.appendChild(backdrop);
  return cleanup;
}
