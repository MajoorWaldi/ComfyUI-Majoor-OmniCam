import { l as v, S as x, u as w, d as C } from "./chunk-CYXHK_as.js";
import "../../scripts/app.js";
import { api as k } from "../../scripts/api.js";
import { M as S } from "./chunk-Jm0vAvYx.js";
import { b as M } from "./chunk-D2Hci8OZ.js";
function n(o) {
  return String(o ?? "").replace(/[&<>"']/g, (t) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[t]);
}
const p = {
  verified: "pass",
  detected_unverified: "warning",
  incompatible: "blocked",
  missing: "blocked"
};
function b(o) {
  const t = String(o || "").toLowerCase();
  return t in p ? p[t] : ["ready", "warning", "blocked", "risk", "pass", "connected", "unknown"].includes(t) ? t : "unknown";
}
function u(o) {
  return Array.isArray(o) && o.length === 1 ? o[0] : o;
}
function _(o) {
  const t = o?.ui && typeof o.ui == "object" ? o.ui : o || {}, e = Array.isArray(t.preflight) && t.preflight.length === 1 && Array.isArray(t.preflight[0]) ? t.preflight[0] : t.preflight, a = u(t.capabilities), i = u(t.target_profile);
  return {
    targetProfile: typeof i == "string" ? i : "",
    preflight: Array.isArray(e) ? e : [],
    capabilities: a && typeof a == "object" ? a : { capabilities: [] }
  };
}
function O(o) {
  const t = b(o.state), e = o.message ? `<br><small>${n(o.message)}</small>` : "";
  return `<div class="oc-row"><span><strong>${n(o.label || o.id)}</strong>${e}</span><span class="oc-state" data-state="${t}">${n(o.state || "UNKNOWN")}</span></div>`;
}
function E(o, t) {
  const e = o ? "NO OUTPUT" : "OUTPUT GENERATED";
  return t ? `${e} · ${t}` : e;
}
function T(o, t) {
  const e = _(t), a = o.querySelector('[data-role="profile-preflight"]');
  a.innerHTML = e.preflight.length ? e.preflight.map(O).join("") : '<div class="oc-empty">No preflight checks returned.</div>';
  const i = Array.isArray(e.capabilities.capabilities) ? e.capabilities.capabilities : [], c = o.querySelector('[data-role="profile-capabilities"]');
  c.innerHTML = i.length ? i.map((s) => `<div class="oc-row"><span>${n(s.display || s.adapter)}</span><span class="oc-state" data-state="${b(s.state)}">${n(s.state)}</span></div>`).join("") : '<div class="oc-empty">No optional downstream capability detected.</div>';
  const r = e.preflight.some((s) => String(s.state).toUpperCase() === "BLOCKED"), l = o.querySelector('[data-role="monitor-status"]');
  return l.dataset.state = r ? "BLOCKED" : "READY", l.lastChild.textContent = r ? " BLOCKED" : " READY", o.querySelector('[data-role="output-status"]').textContent = E(r, e.targetProfile), e;
}
class N extends S {
  constructor(t, { fps: e = 24, durationFrames: a = 1, onFrame: i = () => {
  } } = {}) {
    super(t, { fps: e, durationFrames: a, onFrame: i, loop: !0, muted: !0 });
  }
}
function m(o) {
  return String(o?.comfyClass || o?.constructor?.type || "");
}
function h(o, t) {
  const e = o?.inputs?.find((a) => a.name === t);
  return e?.link == null || !o?.graph ? null : v(o.graph, e.link);
}
function P(o) {
  const t = h(o, "motion_scene"), e = h(o, "playblast_video");
  return {
    sceneConnected: !!t,
    sceneOrigin: t,
    sceneNodeClass: m(t),
    playblastConnected: !!e,
    playblastOrigin: e,
    playblastNodeClass: m(e)
  };
}
class A {
  constructor(t, e, a = 250) {
    this.node = t, this.onChange = e, this.initialized = !1, this.last = "", this.timer = setInterval(() => this.poll(), a), this.poll();
  }
  poll() {
    const t = P(this.node), e = JSON.stringify([
      t.sceneOrigin?.id ?? null,
      t.playblastOrigin?.id ?? null,
      t.playblastOrigin?.imageIndex ?? null
    ]);
    return this.initialized && e === this.last ? !1 : (this.initialized = !0, this.last = e, this.onChange(t), !0);
  }
  dispose() {
    clearInterval(this.timer), this.timer = null;
  }
}
async function I(o) {
  const t = await o.fetchApi("/majoor/omnicam/monitor/profiles");
  if (!t.ok) throw new Error(`Monitor profile catalog failed (${t.status})`);
  return t.json();
}
function $(o, t) {
  const e = o.querySelector('[data-role="profile-catalogue"]');
  if (!e) return;
  const a = Array.isArray(t?.profiles) ? t.profiles : [], i = Array.isArray(t?.capabilities?.capabilities) ? t.capabilities.capabilities : [], c = new Map(i.map((r) => [String(r.adapter), r]));
  e.innerHTML = a.length ? a.map((r) => {
    const s = (r.capability || c.get(String(r.id)))?.state || "missing";
    return `<div class="oc-row"><span><strong>${n(r.display_name)}</strong><br><small>${n(r.semantic)} · ${n(r.frame_policy)}</small></span><span class="oc-state" data-state="${n(s)}">${n(s)}</span></div>`;
  }).join("") : '<div class="oc-empty">No Monitor profile is available.</div>';
}
const q = `${x}
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
`, L = [
  ["h3_api", "MiniMax H3 · Comfy API"],
  ["h3_native", "MiniMax H3 · Native"],
  ["ltx25_motion_track", "LTX 2.5 Motion Track"],
  ["wan_camera_native", "Wan Camera Native"],
  ["wan_move_native", "Wan Move Native"],
  ["wan_track_native", "Wan Track Native"],
  ["wanvideo_ati", "WanVideo ATI"]
];
function D() {
  return L.map(([o, t]) => `<option value="${o}">${t}</option>`).join("");
}
function W() {
  return `<div class="majoor-omnicam oc-monitor">
    <style>${q}</style>
    <header class="oc-header">${M("OmniCam Monitor")}
      <div class="oc-header-actions"><span class="oc-status-pill" data-role="monitor-status" data-state="OFFLINE"><i class="oc-status-dot"></i> WAITING</span></div>
    </header>
    <div class="oc-source" data-role="source-status">Connect a MotionScene and queue the workflow.</div>
    <main class="oc-layout">
      <section class="oc-column">
        <div class="oc-card" data-role="proxy-card"><div class="oc-section">Playblast</div><div class="oc-player"><video data-role="proxy-player" playsinline muted aria-label="OmniCam playblast playback"></video><div class="oc-player-empty">No playblast preview</div><canvas data-role="proxy-upstream-preview" hidden aria-label="Connected playblast preview"></canvas></div><div class="oc-player-controls"><button type="button" data-act="proxy-play" aria-label="Play or pause playblast">Play</button><input data-role="proxy-scrubber" type="range" min="0" max="0" value="0" aria-label="Playblast frame"><output data-role="proxy-frame">0 / 0</output><label><input data-role="proxy-loop" type="checkbox" checked> Loop</label><label><input data-role="proxy-mute" type="checkbox" checked> Mute</label></div></div>
        <div class="oc-card"><div class="oc-section">Profile preflight</div><div data-role="profile-preflight" class="oc-empty">Queue the workflow to validate the selected profile.</div></div>
      </section>
      <aside class="oc-column">
        <div class="oc-card"><div class="oc-section">Compilation target</div><div class="oc-adapter-controls">
          <label class="wide">Profile<select data-role="profile-select">${D()}</select></label>
          <label class="wide">Base prompt<textarea data-setting="base_prompt" rows="3"></textarea></label>
          <label>Width<input data-setting="target_width" type="number" min="64" max="4096" step="8"></label>
          <label>Height<input data-setting="target_height" type="number" min="64" max="4096" step="8"></label>
          <label>Duration (seconds)<input data-setting="duration_seconds" type="number" min="0.1" max="600" step="0.1"></label>
          <label>FPS<input data-setting="target_fps" type="number" min="1" max="120" step="1"></label>
        </div></div>
        <div class="oc-card"><div class="oc-section">Profiles</div><div data-role="profile-catalogue" class="oc-empty">Loading the Monitor profile catalogue.</div></div>
        <div class="oc-card"><div class="oc-section">Installed capabilities</div><div data-role="profile-capabilities" class="oc-empty">Capability report available after execution.</div></div>
        <div class="oc-card"><div class="oc-section">Execution output</div><div data-role="output-status" class="oc-empty">OUTPUT NOT EXECUTED</div></div>
      </aside>
    </main>
  </div>`;
}
function j(o = document) {
  const t = o.createElement("div");
  return t.innerHTML = W(), t.firstElementChild;
}
const d = [
  "base_prompt",
  "target_profile",
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps"
], F = /* @__PURE__ */ new Set([
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps"
]);
function y(o, t) {
  return o?.widgets?.find((e) => e.name === t);
}
function g(o) {
  return Object.fromEntries(d.map((t) => [t, y(o, t)?.value]));
}
function f(o, t, e) {
  if (!d.includes(t)) return !1;
  const a = y(o, t);
  return a ? (a.value = F.has(t) ? Number(e) : e, a.callback?.(a.value), !0) : !1;
}
function H(o) {
  for (const t of o.widgets || [])
    t.computeSize = () => [0, -4], t.draw = () => {
    }, t.hidden = !0, t.options = { ...t.options || {}, hideInVueNodes: !0 };
}
class U {
  constructor(t) {
    this.node = t, this.root = j(), this.disposers = [], this.source = null, this.player = new N(
      this.root.querySelector('[data-role="proxy-player"]'),
      {
        onFrame: (e) => this.showFrame(e),
        onMetadata: ({ frameCount: e }) => this.setFrameCount(e)
      }
    ), this.bindControls(), this.syncControlsFromWidgets(), this.loadProfileInfo(), this.watcher = new A(t, (e) => this.sourceChanged(e));
  }
  async loadProfileInfo() {
    const t = this.root.querySelector('[data-role="profile-catalogue"]');
    try {
      const e = await I(k);
      $(this.root, e);
    } catch (e) {
      t && (t.textContent = "Monitor profile information unavailable."), console.warn("OmniCam: Monitor profile catalog unavailable", e);
    }
  }
  listen(t, e, a) {
    t && (t.addEventListener(e, a), this.disposers.push(() => t.removeEventListener(e, a)));
  }
  bindControls() {
    this.listen(this.root.querySelector('[data-act="proxy-play"]'), "click", () => this.player.toggle()), this.listen(this.root.querySelector('[data-role="proxy-scrubber"]'), "input", (t) => this.player.scrub(t.target.value)), this.listen(this.root.querySelector('[data-role="proxy-loop"]'), "change", (t) => this.player.setLoop(t.target.checked)), this.listen(this.root.querySelector('[data-role="proxy-mute"]'), "change", (t) => this.player.setMuted(t.target.checked)), this.listen(this.root.querySelector('[data-role="profile-select"]'), "change", (t) => {
      f(this.node, "target_profile", t.target.value), this.markOutdated();
    });
    for (const t of this.root.querySelectorAll("[data-setting]"))
      this.listen(t, "change", () => {
        f(this.node, t.dataset.setting, t.value), this.markOutdated();
      });
  }
  syncControlsFromWidgets() {
    const t = g(this.node), e = this.root.querySelector('[data-role="profile-select"]');
    t.target_profile != null && (e.value = String(t.target_profile));
    for (const a of d) {
      if (a === "target_profile") continue;
      const i = this.root.querySelector(`[data-setting="${a}"]`);
      i && t[a] != null && (i.value = t[a]);
    }
  }
  markOutdated() {
    this.root.querySelector('[data-role="output-status"]').textContent = "OUTPUT OUTDATED";
  }
  sourceChanged(t) {
    this.source = t;
    const e = this.root.querySelector('[data-role="source-status"]');
    e.textContent = t.sceneConnected ? `${t.sceneNodeClass || "MotionScene"} connected${t.playblastConnected ? ` · playblast: ${t.playblastNodeClass || "connected"}` : " · no playblast"}` : "Connect a MotionScene and queue the workflow.";
    const a = this.root.querySelector('[data-role="monitor-status"]');
    a.dataset.state = t.sceneConnected ? "CONNECTED" : "OFFLINE", a.lastChild.textContent = t.sceneConnected ? " CONNECTED" : " WAITING", this.refreshPlayblastPreview();
  }
  refreshPlayblastPreview() {
    const t = this.root.querySelector('[data-role="proxy-upstream-preview"]'), e = this.root.querySelector(".oc-player-empty"), a = w(this.source?.playblastOrigin);
    if (!a) {
      t.hidden = !0, e.hidden = !1, this.player.setSource("");
      return;
    }
    const c = typeof HTMLVideoElement < "u" && a instanceof HTMLVideoElement ? String(a.currentSrc || a.src || "") : "";
    if (c) {
      t.hidden = !0, e.hidden = !0, this.player.setSource(c);
      return;
    }
    this.player.setSource(""), C(a, t, 640).then((r) => {
      t.hidden = !r, e.hidden = r;
    });
  }
  setFrameCount(t) {
    const e = this.root.querySelector('[data-role="proxy-scrubber"]');
    e.max = Math.max(0, Number(t || 1) - 1);
  }
  showFrame(t) {
    const e = Math.max(0, Number(this.player.frameCount || 1) - 1);
    this.root.querySelector('[data-role="proxy-scrubber"]').value = t, this.root.querySelector('[data-role="proxy-frame"]').textContent = `${t} / ${e}`;
  }
  executed(t) {
    const e = T(this.root, t);
    e.targetProfile && g(this.node).target_profile !== e.targetProfile && this.markOutdated();
  }
  dispose() {
    this.watcher?.dispose(), this.player.dispose();
    for (const t of this.disposers.splice(0)) t();
  }
}
function K(o) {
  if (o.__majoorOmniCamMonitor) return;
  H(o);
  const t = new U(o);
  o.__majoorOmniCamMonitor = t;
  const e = () => Math.max(620, t.root.scrollHeight || 0);
  o.addDOMWidget("majoor_omnicam_monitor", "omnicam", t.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 620,
    getHeight: e,
    getMaxHeight: e
  }), o.setSize([Math.max(o.size?.[0] || 0, 720), Math.max(o.size?.[1] || 0, 700)]);
  const a = o.onRemoved;
  o.onRemoved = function() {
    t.dispose(), a?.apply(this, arguments);
  };
  const i = o.onExecuted;
  o.onExecuted = function(l) {
    i?.apply(this, arguments), t.executed(l);
  };
  const c = o.onConfigure;
  o.onConfigure = function() {
    c?.apply(this, arguments), t.syncControlsFromWidgets();
  };
  const r = o.onConnectionsChange;
  o.onConnectionsChange = function() {
    r?.apply(this, arguments), t.watcher?.poll(), t.refreshPlayblastPreview(), setTimeout(() => t.refreshPlayblastPreview(), 400);
  };
}
export {
  K as attachMonitor
};
