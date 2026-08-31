import "../../scripts/app.js";
import { api as h } from "../../scripts/api.js";
import { Z as T, s as C } from "./chunk-BClSJcr9.js";
import { l as b, u as x, S as E, d as $ } from "./chunk-B0ZcW-l0.js";
import { f as N, d as O, M as P } from "./chunk-BOOWUhms.js";
import { b as A } from "./chunk-D2Hci8OZ.js";
function M(e, t = {}) {
  return O(e, t);
}
class L {
  constructor(t, { onSeek: r = () => {
  } } = {}) {
    this.canvas = t, this.onSeek = r, this.options = {}, this.listener = (o) => {
      const a = this.canvas?.getBoundingClientRect?.();
      if (!a) return;
      const n = (o.clientX - a.left) * this.canvas.width / Math.max(1, a.width), i = N(n, this.canvas.width, this.options.frameCount);
      this.onSeek(i);
    }, this.canvas?.addEventListener?.("pointerdown", this.listener);
  }
  render(t = {}) {
    return this.options = {
      ...t,
      frameCount: Math.max(
        Number(t.frameCount) || 0,
        Number(t.track?.duration_frames) || 0,
        1
      )
    }, M(this.canvas, this.options);
  }
  dispose() {
    this.canvas?.removeEventListener?.("pointerdown", this.listener), this.canvas = null;
  }
}
function c(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[t]);
}
function m(e) {
  const t = String(e || "").toLowerCase();
  return ["ready", "warning", "blocked", "risk", "pass", "connected", "unknown"].includes(t) ? t : "unknown";
}
const q = {
  h3: "MiniMax H3 · Comfy API",
  h3_native: "MiniMax H3 · Native",
  wan_native: "Wan Camera",
  wan_ati: "Wan 2.1 ATI · WanVideoWrapper",
  wan_tracks_native: "Wan Motion Tracks",
  ltx_motion_track: "LTX 2.5 Motion Track",
  ltx: "LTX Proxy Guide (legacy)"
}, F = {
  numeric_camera: "numeric camera conditioning",
  motion_transfer: "motion transfer from a reference clip",
  trajectory_approximation: "2D trajectory approximation",
  proxy_passthrough: "sampled proxy frames"
};
function D(e, t) {
  const r = t?.preflight;
  if (!e || !r) return;
  const o = t?.adapter || {}, a = o.display_name || q[r.adapter] || r.adapter, n = F[o.fidelity], i = n ? `<div class="oc-row"><span>Control path</span><strong>${c(n)}</strong></div>` : "", s = o.length_rule ? `<div class="oc-row"><span>Frame count</span><strong>${c(o.length_rule)}</strong></div>` : "";
  e.innerHTML = `<div class="oc-row"><span>Capability</span><strong>${c(r.capability_state || "unknown")}</strong></div><div class="oc-row"><span>Selected route</span><strong>${c(a)}</strong></div>${i}${s}`;
}
function j(e, t) {
  if (!t) {
    e.innerHTML = '<div class="oc-empty">No health data</div>';
    return;
  }
  const r = (t.metrics || []).map((s) => {
    const l = m(s.state), u = s.recommended_max == null ? "" : `<br><small>over the ${c(s.recommended_max)} heuristic guide</small>`;
    return `<div class="oc-row"><span><strong>${c(s.label)}</strong>${u}</span><span><span>${c(s.value)}${s.unit ? ` ${c(s.unit)}` : ""}</span><br><span class="oc-state" data-state="${l}">${l.toUpperCase()}</span></span></div>`;
  }).join(""), o = m(t.state), a = String(t.risk || "LOW"), n = (t.risk_reasons || []).join(", "), i = `<div class="oc-row"><span><strong>Motion risk</strong><br><small>Experimental OmniCam estimate for the ${c(t.profile || "generic")} profile${n ? `: ${c(n)}` : ""}. Not a published model limit.</small></span><span class="oc-state" data-state="risk">${c(a)}</span></div>`;
  e.innerHTML = `<div class="oc-row"><strong>Track validity</strong><span class="oc-state" data-state="${o}">${c(t.state)}</span></div>${i}${r || '<div class="oc-empty">No metrics</div>'}`;
}
function R(e, t) {
  return t ? e === t ? "OUTPUT GENERATED" : "OUTPUT OUTDATED" : "OUTPUT NOT EXECUTED";
}
function I(e) {
  return (Array.isArray(e?.monitor) ? e.monitor[0] : e?.monitor)?.fingerprint || e?.ui?.monitor?.fingerprint || "";
}
class U extends P {
  constructor(t, { fps: r = 24, durationFrames: o = 1, onFrame: a = () => {
  } } = {}) {
    super(t, { fps: r, durationFrames: o, onFrame: a, loop: !0, muted: !0 });
  }
}
function H(e, t) {
  if (!t) {
    e.innerHTML = '<div class="oc-empty">No preflight data</div>';
    return;
  }
  const r = (t.checks || []).map((i) => {
    const s = m(i.state);
    return `<div class="oc-row"><span><strong>${s === "pass" ? "&#10003;" : s === "risk" || s === "warning" ? "&#9651;" : "&#10007;"} ${c(i.label || i.id)}</strong>${i.message ? `<br><small>${c(i.message)}</small>` : ""}</span><span class="oc-state" data-state="${s}">${s.toUpperCase()}</span></div>`;
  }).join(""), o = new Set((t.checks || []).map((i) => String(i.message || ""))), a = (t.issues || []).filter((i) => !o.has(String(i.message || ""))).map((i) => {
    const s = i.severity === "error" ? "blocked" : "warning";
    return `<div class="oc-row"><small>${c(i.message)}</small><span class="oc-state" data-state="${s}">${c(i.severity).toUpperCase()}</span></div>`;
  }).join(""), n = m(t.state);
  e.innerHTML = `<div class="oc-row"><strong>${c(t.adapter)}</strong><span class="oc-state" data-state="${n}">${c(t.state)}</span></div>${r}${a}`;
}
function W(e) {
  return e?.exact_output_representation ? "OUTPUT PREVIEW" : "DIAGNOSTIC";
}
function G(e, t = {}) {
  const r = W(t), o = t.payload || {};
  if (t.kind === "proxy_video")
    e.innerHTML = `<div class="oc-preview-label"><span>${r}</span> ${c(t.label)}</div><div class="oc-empty">Proxy Monitor above is the H3 Omni Reference output preview.</div>`;
  else if (t.kind === "trajectory_overlay") {
    const a = Array.isArray(o.tracks) ? o.tracks.length : 0;
    e.innerHTML = `<div class="oc-preview-label"><span>${r}</span> ${c(t.label)}</div><canvas class="oc-trajectory-canvas" width="${Number(o.width || 832)}" height="${Number(o.height || 480)}" aria-label="Projected trajectory preview"></canvas><small>${a} trajectory samples</small>`, z(e.querySelector?.(".oc-trajectory-canvas"), o.tracks || []);
  } else t.kind === "camera_path" ? e.innerHTML = `<div class="oc-preview-label"><span>${r}</span> ${c(t.label)}</div><div class="oc-path-summary">${(o.points || []).length} camera samples · ${o.valid_4n_plus_1 ? "4n+1 valid" : "length requires 4n+1"}</div>` : t.kind === "frame_sequence" ? e.innerHTML = `<div class="oc-preview-label"><span>${r}</span> ${c(t.label)}</div><div class="oc-frame-strip">${(o.indices || []).slice(0, 24).map((a) => `<span>${a}</span>`).join("")}</div>` : e.innerHTML = '<div class="oc-empty">No adapter preview available.</div>';
}
function z(e, t) {
  const r = e?.getContext?.("2d");
  if (r) {
    r.clearRect(0, 0, e.width, e.height), r.strokeStyle = "#8b7bd8", r.lineWidth = 2;
    for (const o of t) {
      const a = Array.isArray(o) ? o : o?.points;
      !Array.isArray(a) || !a.length || (r.beginPath(), a.forEach((n, i) => {
        const s = Number(n[0] ?? n.x), l = Number(n[1] ?? n.y);
        i ? r.lineTo(s, l) : r.moveTo(s, l);
      }), r.stroke());
    }
  }
}
class B {
  constructor(t, { delay: r = 250, onSnapshot: o = () => {
  }, onError: a = () => {
  } } = {}) {
    this.api = t, this.delay = r, this.onSnapshot = o, this.onError = a, this.timer = null, this.abort = null, this.scheduledKey = "";
  }
  schedule(t) {
    const r = JSON.stringify(t);
    r !== this.scheduledKey && (this.scheduledKey = r, clearTimeout(this.timer), this.timer = setTimeout(() => this.refresh(t), this.delay));
  }
  async refresh(t) {
    this.abort?.abort(), this.abort = new AbortController();
    try {
      const r = await this.api.fetchApi("/majoor/omnicam/monitor/snapshot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t), signal: this.abort.signal });
      if (!r.ok) throw new Error(await r.text?.() || `Monitor request failed (${r.status})`);
      const o = await r.json();
      return this.onSnapshot(o), o;
    } catch (r) {
      return r?.name !== "AbortError" && this.onError(r), null;
    }
  }
  dispose() {
    clearTimeout(this.timer), this.timer = null, this.abort?.abort(), this.abort = null, this.scheduledKey = "";
  }
}
const J = ["state_json", "track_json"];
function k(e, t) {
  return e?.widgets?.find((r) => r.name === t)?.value;
}
function w(e) {
  return String(e?.comfyClass || e?.constructor?.type || "");
}
function S(e, t) {
  const r = e?.inputs?.find((o) => o.name === t);
  return r?.link == null || !e?.graph ? null : b(e.graph, r.link);
}
function X(e) {
  for (const t of J) {
    const r = k(e, t);
    if (typeof r == "string" && r.trim()) return r;
  }
  return "";
}
function f(e) {
  const t = S(e, "proxy_video");
  if (!t) return { available: !1, source: "none" };
  const r = { available: !0, source: w(t) || "upstream" }, o = x(t);
  return o && Number.isFinite(o.duration) && o.duration > 0 && (r.duration_seconds = o.duration), r;
}
function K(e) {
  return !e || typeof e != "object" ? null : {
    schema_version: Number(e.schema_version || 1),
    fps: Number(e.fps || 24),
    duration_frames: Number(e.duration_frames || 1),
    width: Number(e.width || 1280),
    height: Number(e.height || 720),
    render_mode: e.render_mode || "omni_ref",
    keyframes: Array.isArray(e.keyframes) ? e.keyframes : [],
    objects: Array.isArray(e.objects) ? e.objects : [],
    metadata: e.metadata && typeof e.metadata == "object" ? e.metadata : {}
  };
}
function _(e) {
  const t = S(e, "camera_track");
  return t ? {
    origin: t,
    nodeClass: w(t),
    stateJson: X(t),
    recordingPath: String(k(t, "recording_path") || ""),
    proxy: f(e)
  } : { origin: null, nodeClass: "", stateJson: "", recordingPath: "", proxy: f(e) };
}
function V(e) {
  const t = _(e), r = {
    connected: !1,
    resolved: !1,
    track: null,
    recordingPath: "",
    director: null,
    origin: t.origin,
    nodeClass: t.nodeClass,
    proxy: t.proxy
  };
  if (!t.origin) return r;
  if (!t.stateJson)
    return { ...r, connected: !0, resolved: !1 };
  try {
    const o = K(JSON.parse(t.stateJson));
    if (!o?.keyframes?.length) throw new Error("The connected track has no keyframes");
    return {
      ...r,
      connected: !0,
      resolved: !0,
      track: o,
      recordingPath: t.recordingPath,
      director: t.origin
    };
  } catch (o) {
    return { ...r, connected: !0, resolved: !1, error: String(o?.message || o) };
  }
}
class Y {
  constructor(t, r, o = 250) {
    this.node = t, this.onChange = r, this.initialized = !1, this.last = null, this.timer = setInterval(() => this.poll(), o), this.poll();
  }
  key(t) {
    return JSON.stringify([
      t.nodeClass,
      t.stateJson,
      t.recordingPath,
      t.proxy
    ]);
  }
  poll() {
    const t = _(this.node), r = this.key(t);
    return this.initialized && t.origin === this.lastOrigin && r === this.last ? !1 : (this.initialized = !0, this.lastOrigin = t.origin, this.last = r, this.onChange(V(this.node)), !0);
  }
  dispose() {
    clearInterval(this.timer), this.timer = null;
  }
}
const Z = /* @__PURE__ */ new Set(["READY", "WARNING", "BLOCKED", "OUTDATED", "CONNECTED", "OFFLINE"]);
function Q() {
  return { status: "OFFLINE", snapshot: null, fingerprint: "", error: "", connected: !1, risk: "LOW" };
}
function d(e, t) {
  switch (t.type) {
    case "OFFLINE":
      return { ...e, status: "OFFLINE", connected: !1, error: "" };
    // Wired to a producer whose track only materialises at execution time.
    // Valid graph, nothing to preview: not the same thing as OFFLINE.
    case "CONNECTED":
      return { ...e, status: "CONNECTED", connected: !0, snapshot: null, error: "" };
    case "SOURCE_CHANGED":
      return { ...e, status: "OUTDATED", connected: !0, error: "" };
    case "REFRESHING":
      return { ...e, status: "OUTDATED", error: "" };
    case "ERROR":
      return { ...e, status: "BLOCKED", error: String(t.error || "Monitor refresh failed") };
    case "SNAPSHOT": {
      const r = t.snapshot || {}, o = String(r.preflight?.state || "READY").toUpperCase(), a = Z.has(o) ? o : "BLOCKED";
      return {
        ...e,
        status: a,
        snapshot: r,
        fingerprint: r.fingerprint || "",
        connected: !0,
        error: "",
        risk: String(r.preflight?.risk || "LOW")
      };
    }
    default:
      return e;
  }
}
const tt = `${E}
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
`, et = [
  ["h3", "MiniMax H3 · Comfy API"],
  ["h3_native", "MiniMax H3 · Native"],
  ["wan_native", "Wan Camera"],
  ["wan_tracks_native", "Wan Motion Tracks"],
  ["wan_ati", "Wan 2.1 ATI · WanVideoWrapper"],
  ["ltx_motion_track", "LTX 2.5 Motion Track"],
  ["ltx", "LTX Proxy Guide (legacy)"]
];
function rt() {
  return et.map(([e, t]) => `<option value="${e}">${t}</option>`).join("");
}
function ot() {
  return `<div class="majoor-omnicam oc-monitor">
    <style>${tt}</style>
    <header class="oc-header">${A("OmniCam Monitor")}
      <div class="oc-header-actions"><label class="oc-live"><input data-role="live-sync" type="checkbox" checked> Live</label><button type="button" data-act="monitor-refresh">Refresh</button><span class="oc-status-pill" data-role="monitor-status" data-state="OFFLINE"><i class="oc-status-dot"></i> OFFLINE</span></div>
    </header>
    <div class="oc-source" data-role="source-status">Connect an OmniCam camera track.</div>
    <main class="oc-layout">
      <section class="oc-column">
        <div class="oc-card" data-role="proxy-card"><div class="oc-section">Proxy monitor</div><div class="oc-player"><video data-role="proxy-player" playsinline muted aria-label="OmniCam proxy playback"></video><div class="oc-player-empty">No proxy connected</div><canvas data-role="proxy-upstream-preview" hidden aria-label="Connected proxy source, not yet a managed file"></canvas></div><div class="oc-player-controls"><button type="button" data-act="proxy-play" aria-label="Play or pause proxy">Play</button><input data-role="proxy-scrubber" type="range" min="0" max="0" value="0" aria-label="Proxy frame"><output data-role="proxy-frame">0 / 0</output><label><input data-role="proxy-loop" type="checkbox" checked> Loop</label><label><input data-role="proxy-mute" type="checkbox" checked> Mute</label></div></div>
        <div class="oc-card"><div class="oc-section">Adapter preflight</div><div data-role="adapter-preflight" class="oc-empty">Waiting for source</div></div>
        <div class="oc-card"><div class="oc-section">Adapter preview</div><div data-role="adapter-preview" class="oc-empty">Waiting for snapshot</div></div>
        <details class="oc-card oc-advanced"><summary class="oc-section">Camera track ▸</summary><canvas data-role="monitor-track-timeline" width="760" height="106" aria-label="Read-only camera track timeline"></canvas><div data-role="camera-readout" class="oc-source">Camera data unavailable</div><div class="oc-section">Track health &amp; motion risk</div><div data-role="camera-health" class="oc-empty">Waiting for source</div></details>
      </section>
      <aside class="oc-column">
        <div class="oc-card"><div class="oc-section">Adapter</div><div class="oc-adapter-controls">
          <label class="wide">Profile<select data-role="adapter-select">${rt()}</select></label>
          <label class="wide" data-field="base_prompt">Base prompt<textarea data-setting="base_prompt" rows="3"></textarea></label>
          <label data-field="width">Width<input data-setting="width" type="number" min="64" max="4096" step="8"></label><label data-field="height">Height<input data-setting="height" type="number" min="64" max="4096" step="8"></label>
          <label data-field="length">Length<input data-setting="length" type="number" min="1" max="10000"></label><label data-field="point_count">Points<input data-setting="point_count" type="number" min="4" max="128"></label>
          <label class="wide" data-field="distribution">Distribution<select data-setting="distribution"><option value="balanced">Balanced</option><option value="subject_focus">Subject focus</option><option value="ground_parallax">Ground parallax</option></select></label>
          <label data-field="ltx_max_frames">LTX max frames<input data-setting="ltx_max_frames" type="number" min="1" max="1000"></label><label data-field="ltx_sampling_mode">LTX sampling<select data-setting="ltx_sampling_mode"><option value="contiguous">Contiguous</option><option value="uniform">Uniform</option></select></label>
        </div><div data-role="adapter-details"></div></div>
        <div class="oc-card"><div class="oc-section">Prompt</div><div class="oc-copy-row"><span data-role="prompt-note" class="oc-source"></span><button type="button" data-act="copy-text">COPY</button></div><pre data-role="final-prompt"></pre>
          <details class="oc-advanced"><summary class="oc-section">Diagnostics ▸</summary><div class="oc-tabs" role="tablist"><button class="oc-tab" data-tab="camera-prompt" aria-selected="true">Camera instruction</button><button class="oc-tab" data-tab="cinematography" aria-selected="false">Camera analysis</button><button class="oc-tab" data-tab="camera-data" aria-selected="false">Adapter data</button></div><pre data-role="camera-prompt"></pre><pre data-role="cinematography" hidden></pre><pre data-role="camera-data" hidden></pre></details>
        </div>
        <div class="oc-card"><div class="oc-section">Execution output</div><div data-role="output-status" class="oc-empty">OUTPUT NOT EXECUTED</div></div>
      </aside>
    </main>
  </div>`;
}
function at(e = document) {
  const t = e.createElement("div");
  return t.innerHTML = ot(), t.firstElementChild;
}
const y = ["camera-prompt", "cinematography", "camera-data"];
function g(e, t) {
  const r = e?.text || {};
  return t === "camera-data" ? JSON.stringify({ contract: r.contract || {}, ...r.camera_data || {} }, null, 2) : String(r[t.replaceAll("-", "_")] || "");
}
function it(e) {
  const t = e?.text || {}, r = t.contract?.max_prompt_characters, o = String(t.final_prompt || "").length;
  return r ? `${o} / ${r} chars` : `${o} chars`;
}
async function st(e) {
  try {
    if (globalThis.navigator?.clipboard?.writeText) return await globalThis.navigator.clipboard.writeText(e);
    const t = document.createElement("textarea");
    t.value = e, t.style.position = "fixed", t.style.opacity = "0", document.body.appendChild(t), t.select(), document.execCommand?.("copy"), t.remove();
  } catch (t) {
    console.warn("OmniCam clipboard copy failed:", t);
  }
}
function nt(e) {
  let t = null, r = null;
  const o = (i) => {
    for (const s of y) {
      const l = e.querySelector(`[data-role="${s}"]`);
      l && (l.hidden = s !== i);
    }
    for (const s of e.querySelectorAll("[data-tab]"))
      s.setAttribute("aria-selected", String(s.dataset.tab === i));
  };
  for (const i of e.querySelectorAll("[data-tab]"))
    i.addEventListener("click", () => o(i.dataset.tab));
  const a = e.querySelector('[data-act="copy-text"]'), n = async () => {
    await st(String(t?.text?.final_prompt || "")), a.textContent = "COPIED", clearTimeout(r), r = setTimeout(() => {
      a.textContent = "COPY";
    }, 1200);
  };
  return a.addEventListener("click", n), {
    render(i) {
      t = i, e.querySelector('[data-role="final-prompt"]').textContent = g(t, "final-prompt");
      const s = e.querySelector('[data-role="prompt-note"]');
      s && (s.textContent = it(t));
      for (const l of y) {
        const u = e.querySelector(`[data-role="${l}"]`);
        u && (u.textContent = g(t, l));
      }
    },
    dispose() {
      clearTimeout(r), a.removeEventListener("click", n);
    }
  };
}
const ct = /* @__PURE__ */ new Set(["width", "height", "length", "point_count", "ltx_max_frames"]), v = [
  "base_prompt",
  "video_ref_token",
  "width",
  "height",
  "length",
  "point_count",
  "distribution",
  "ltx_max_frames",
  "ltx_sampling_mode"
], lt = ["base_prompt", "width", "height", "length"];
function p(e, t) {
  return e.widgets?.find((r) => r.name === t);
}
function dt(e) {
  for (const t of e.widgets || [])
    t.computeSize = () => [0, -4], t.draw = () => {
    }, t.hidden = !0, t.options = { ...t.options || {}, hideInVueNodes: !0 };
}
class pt {
  constructor(t) {
    this.node = t, this.root = at(), this.state = Q(), this.source = null, this.executedFingerprint = "", this.disposers = [], this.textPanels = nt(this.root), this.player = new U(
      this.root.querySelector('[data-role="proxy-player"]'),
      { onFrame: (r) => this.showFrame(r) }
    ), this.timeline = new L(
      this.root.querySelector('[data-role="monitor-track-timeline"]'),
      { onSeek: (r) => {
        this.player.scrub(r), this.showFrame(r);
      } }
    ), this.refreshController = new B(h, {
      onSnapshot: (r) => this.acceptSnapshot(r),
      onError: (r) => this.setError(r)
    }), this.bindControls(), this.syncControlsFromWidgets(), this.watcher = new Y(t, (r) => this.sourceChanged(r));
  }
  listen(t, r, o) {
    t && (t.addEventListener(r, o), this.disposers.push(() => t.removeEventListener(r, o)));
  }
  bindControls() {
    this.listen(this.root.querySelector('[data-act="monitor-refresh"]'), "click", () => this.requestSnapshot(!0)), this.listen(this.root.querySelector('[data-act="proxy-play"]'), "click", () => this.player.toggle()), this.listen(this.root.querySelector('[data-role="proxy-scrubber"]'), "input", (t) => this.player.scrub(t.target.value)), this.listen(this.root.querySelector('[data-role="proxy-loop"]'), "change", (t) => this.player.setLoop(t.target.checked)), this.listen(this.root.querySelector('[data-role="proxy-mute"]'), "change", (t) => this.player.setMuted(t.target.checked)), this.listen(this.root.querySelector('[data-role="adapter-select"]'), "change", (t) => {
      this.writeWidget("adapter", t.target.value), this.markChanged();
    });
    for (const t of this.root.querySelectorAll("[data-setting]"))
      this.listen(t, "change", () => {
        this.writeWidget(t.dataset.setting, t.value), this.markChanged();
      });
    this.listen(this.root.querySelector('[data-role="live-sync"]'), "change", () => {
      this.liveSync() && this.requestSnapshot();
    });
  }
  syncControlsFromWidgets() {
    const t = p(this.node, "adapter");
    t && (this.root.querySelector('[data-role="adapter-select"]').value = t.value);
    for (const r of v) {
      const o = p(this.node, r), a = this.root.querySelector(`[data-setting="${r}"]`);
      o && a && (a.value = o.value ?? "");
    }
  }
  writeWidget(t, r) {
    const o = p(this.node, t);
    o && (o.value = ct.has(t) ? Number(r) : r, o.callback?.(o.value));
  }
  liveSync() {
    return this.root.querySelector('[data-role="live-sync"]').checked;
  }
  settings() {
    return Object.fromEntries(v.map((t) => [t, p(this.node, t)?.value]));
  }
  adapter() {
    const t = this.root.querySelector('[data-role="adapter-select"]').value;
    return String(p(this.node, "adapter")?.value || t || "h3");
  }
  sourceChanged(t) {
    if (this.source = t, !t.connected) {
      this.state = d(this.state, { type: "OFFLINE" }), this.player.setSource(""), this.timeline.render({ track: null, frame: 0, frameCount: 1 }), this.renderStatus(), this.refreshProxyUpstreamPreview();
      return;
    }
    if (!t.resolved) {
      this.state = d(this.state, { type: "CONNECTED" }), this.player.setSource(""), this.timeline.render({ track: null, frame: 0, frameCount: 1 }), this.renderStatus(), this.refreshProxyUpstreamPreview();
      return;
    }
    const r = this.root.querySelector('[data-role="proxy-player"]');
    this.player.fps = t.track.fps, this.player.durationFrames = t.track.duration_frames, this.player.setSource(T(h, t.recordingPath)), r.nextElementSibling.hidden = !!t.recordingPath;
    const o = this.root.querySelector('[data-role="proxy-scrubber"]');
    o.max = Math.max(0, t.track.duration_frames - 1), o.value = 0, this.showFrame(0), this.markChanged(), this.refreshProxyUpstreamPreview();
  }
  /**
   * Monitor's proxy player only ever shows a managed file reached through a
   * connected Director's recording_path. When that path is empty -- no
   * playblast recorded yet -- fall back to whatever the node actually wired
   * to `proxy_video` has already rendered into its own DOM: the same
   * client-only trick Extractor and Director use for a source that is not a
   * managed file yet.
   */
  refreshProxyUpstreamPreview() {
    const t = this.root.querySelector('[data-role="proxy-upstream-preview"]');
    if (!t) return;
    if (this.source?.recordingPath) {
      t.hidden = !0;
      return;
    }
    const r = (this.node.inputs || []).find((i) => i.name === "proxy_video"), o = this.node.graph, a = r?.link != null ? b(o, r.link) : null, n = a ? x(a) : null;
    if (!n) {
      t.hidden = !0;
      return;
    }
    $(n, t, 640).then((i) => {
      t.hidden = !i, i && (this.root.querySelector('[data-role="proxy-player"]').nextElementSibling.hidden = !0);
    });
  }
  markChanged() {
    this.state = d(this.state, { type: "SOURCE_CHANGED" }), this.renderStatus(), this.liveSync() && this.requestSnapshot();
  }
  /**
   * What the queue will actually be judged on.
   *
   * `proxy_available` used to be `Boolean(recordingPath)` -- the Director's
   * playblast path -- so a VIDEO node wired straight into `proxy_video` was
   * reported as "no proxy" on a graph that executes fine. Four different
   * things were being conflated: the socket being connected, a preview being
   * drawable, a managed file existing, and a Director playblast existing.
   */
  proxyPayload() {
    const t = { ...this.source?.proxy || { available: !1 } };
    return this.source?.recordingPath && (t.available = !0, t.source = "director_playblast", this.source?.track?.fps && (t.fps = Number(this.source.track.fps)), this.source?.track?.duration_frames && this.source?.track?.fps && (t.frame_count = Number(this.source.track.duration_frames), t.duration_seconds = Number(this.source.track.duration_frames) / Number(this.source.track.fps))), t;
  }
  payload() {
    return {
      track: this.source?.track,
      adapter: this.adapter(),
      proxy: this.proxyPayload(),
      settings: this.settings()
    };
  }
  requestSnapshot(t = !1) {
    this.source?.resolved && (this.state = d(this.state, { type: "REFRESHING" }), this.renderStatus(), t ? this.refreshController.refresh(this.payload()) : this.refreshController.schedule(this.payload()));
  }
  acceptSnapshot(t) {
    this.state = d(this.state, { type: "SNAPSHOT", snapshot: t }), this.renderSnapshot(t), this.renderStatus();
  }
  setError(t) {
    this.state = d(this.state, { type: "ERROR", error: t }), this.renderStatus();
  }
  renderStatus() {
    const t = this.root.querySelector('[data-role="monitor-status"]');
    t.dataset.state = this.state.status, t.lastChild.textContent = ` ${this.state.status}`, this.root.querySelector('[data-role="source-status"]').textContent = this.sourceSummary(), this.root.querySelector('[data-role="output-status"]').textContent = R(
      this.state.fingerprint,
      this.executedFingerprint
    );
  }
  sourceSummary() {
    if (!this.source?.connected) return "Connect an OmniCam camera track.";
    const t = this.source.proxy || {}, r = t.available ? `proxy: ${this.source.recordingPath ? "Director playblast" : t.source || "connected"}` : "no proxy connected";
    if (!this.source.resolved)
      return `${this.source.nodeClass || "upstream node"} connected · track resolves at execution · ${r}`;
    const { duration_frames: o, fps: a } = this.source.track;
    return `${this.source.nodeClass || "Track"} connected · ${o} frames · ${a} fps · ${r}`;
  }
  /** Show only the controls this adapter actually consumes. */
  applyAdapterFields(t) {
    const r = new Set(t && t.length ? t : lt);
    for (const o of this.root.querySelectorAll("[data-field]"))
      o.hidden = !r.has(o.dataset.field);
  }
  renderSnapshot(t) {
    this.applyAdapterFields(t?.adapter?.settings);
    const r = this.root.querySelector('[data-role="proxy-card"]');
    r && (r.hidden = !t?.adapter?.requires_proxy), j(this.root.querySelector('[data-role="camera-health"]'), t.health), H(this.root.querySelector('[data-role="adapter-preflight"]'), t.preflight), G(this.root.querySelector('[data-role="adapter-preview"]'), t.preview), D(this.root.querySelector('[data-role="adapter-details"]'), t), this.textPanels.render(t);
  }
  showFrame(t) {
    const r = Math.max(0, (this.source?.track?.duration_frames || 1) - 1);
    this.root.querySelector('[data-role="proxy-scrubber"]').value = t, this.root.querySelector('[data-role="proxy-frame"]').textContent = `${t} / ${r}`;
    const o = this.source?.track ? C(this.source.track, t) : null;
    this.timeline.render({
      track: this.source?.track || null,
      frame: t,
      frameCount: this.source?.track?.duration_frames || 1
    }), this.root.querySelector('[data-role="camera-readout"]').textContent = o ? `Position ${o.position.map((a) => Number(a).toFixed(2)).join(", ")} · Target ${o.target.map((a) => Number(a).toFixed(2)).join(", ")} · FOV ${Number(o.fov).toFixed(1)}° · Roll ${Number(o.roll || 0).toFixed(1)}°` : "Camera data unavailable";
  }
  executed(t) {
    this.executedFingerprint = I(t), this.renderStatus();
  }
  dispose() {
    this.watcher?.dispose(), this.refreshController.dispose(), this.player.dispose(), this.timeline.dispose(), this.textPanels.dispose();
    for (const t of this.disposers.splice(0)) t();
  }
}
function vt(e) {
  if (e.__majoorOmniCamMonitor) return;
  dt(e);
  const t = new pt(e);
  e.__majoorOmniCamMonitor = t;
  const r = () => Math.max(680, t.root.scrollHeight || 0);
  e.addDOMWidget("majoor_omnicam_monitor", "omnicam", t.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 680,
    getHeight: r,
    getMaxHeight: r
  }), e.setSize([Math.max(e.size?.[0] || 0, 760), Math.max(e.size?.[1] || 0, 760)]);
  const o = e.onRemoved;
  e.onRemoved = function() {
    t.dispose(), o?.apply(this, arguments);
  };
  const a = e.onExecuted;
  e.onExecuted = function(i) {
    a?.apply(this, arguments), t.executed(i);
  };
  const n = e.onConnectionsChange;
  e.onConnectionsChange = function() {
    n?.apply(this, arguments), t.watcher?.poll(), t.refreshProxyUpstreamPreview(), setTimeout(() => t.refreshProxyUpstreamPreview(), 400);
  };
}
export {
  vt as attachMonitor
};
