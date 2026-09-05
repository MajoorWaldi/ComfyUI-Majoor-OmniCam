import { l as M, S as N, b as P, p as I, u as L, d as $ } from "./chunk-Dy7UfHJT.js";
import "../../scripts/app.js";
import { api as u } from "../../scripts/api.js";
import { M as A } from "./chunk-Jm0vAvYx.js";
import { aa as D, _ as j } from "./chunk-COnft398.js";
import { m as q } from "./chunk-COqBWNqK.js";
function s(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[t]);
}
const b = {
  verified: "pass",
  detected_unverified: "warning",
  incompatible: "blocked",
  missing: "blocked"
};
function _(e) {
  const t = String(e || "").toLowerCase();
  return t in b ? b[t] : ["ready", "warning", "blocked", "risk", "pass", "connected", "unknown"].includes(t) ? t : "unknown";
}
function y(e) {
  return Array.isArray(e) && e.length === 1 ? e[0] : e;
}
function R(e) {
  const t = e?.ui && typeof e.ui == "object" ? e.ui : e || {}, o = Array.isArray(t.preflight) && t.preflight.length === 1 && Array.isArray(t.preflight[0]) ? t.preflight[0] : t.preflight, r = y(t.capabilities), i = y(t.target_profile);
  return {
    targetProfile: typeof i == "string" ? i : "",
    preflight: Array.isArray(o) ? o : [],
    capabilities: r && typeof r == "object" ? r : { capabilities: [] }
  };
}
function U(e) {
  const t = _(e.state), o = e.message ? `<br><small>${s(e.message)}</small>` : "";
  return `<div class="oc-row"><span><strong>${s(e.label || e.id)}</strong>${o}</span><span class="oc-state" data-state="${t}">${s(e.state || "UNKNOWN")}</span></div>`;
}
function W(e, t, o = !1) {
  const r = o ? e ? "LIVE — WOULD BLOCK" : "LIVE PREVIEW" : e ? "NO OUTPUT" : "OUTPUT GENERATED";
  return t ? `${r} · ${t}` : r;
}
function v(e, t, { live: o = !1 } = {}) {
  const r = R(t), i = e.querySelector('[data-role="profile-preflight"]');
  i.innerHTML = r.preflight.length ? r.preflight.map(U).join("") : '<div class="oc-empty">No preflight checks returned.</div>';
  const a = Array.isArray(r.capabilities.capabilities) ? r.capabilities.capabilities : [], n = e.querySelector('[data-role="profile-capabilities"]');
  n.innerHTML = a.length ? a.map((p) => `<div class="oc-row"><span>${s(p.display || p.adapter)}</span><span class="oc-state" data-state="${_(p.state)}">${s(p.state)}</span></div>`).join("") : '<div class="oc-empty">No optional downstream capability detected.</div>';
  const c = r.preflight.some((p) => String(p.state).toUpperCase() === "BLOCKED"), l = e.querySelector('[data-role="monitor-status"]');
  return l.dataset.state = c ? "BLOCKED" : "READY", l.lastChild.textContent = c ? " BLOCKED" : " READY", e.querySelector('[data-role="output-status"]').textContent = W(c, r.targetProfile, o), r;
}
const F = "MajoorOmniCamDirector";
function H(e) {
  return String(e?.comfyClass || e?.constructor?.type || "");
}
function d(e, t, o) {
  const r = e?.widgets?.find((i) => i.name === t);
  return r && r.value !== void 0 ? r.value : o;
}
function h(e) {
  return H(e) === F;
}
function C(e) {
  return {
    state_json: String(d(e, "state_json", "{}")),
    recording_path: String(d(e, "recording_path", "")),
    card_asset: String(d(e, "card_asset", "")),
    width: Number(d(e, "width", 1280)),
    height: Number(d(e, "height", 720)),
    fps: Number(d(e, "fps", 24)),
    duration_seconds: Number(d(e, "duration_seconds", 5)),
    render_mode: String(d(e, "render_mode", "omni_ref"))
  };
}
function V(e) {
  return {
    target_profile: String(e?.target_profile ?? ""),
    base_prompt: String(e?.base_prompt ?? ""),
    target_width: Number(e?.target_width ?? 832),
    target_height: Number(e?.target_height ?? 480),
    // 0 tells the backend to inherit the connected shot's duration / fps.
    duration_seconds: Number(e?.duration_seconds ?? 0),
    target_fps: Number(e?.target_fps ?? 0)
  };
}
function B(e, t) {
  return {
    director: C(e),
    monitor: V(t)
  };
}
class z extends A {
  constructor(t, { fps: o = 24, durationFrames: r = 1, onFrame: i = () => {
  } } = {}) {
    super(t, { fps: o, durationFrames: r, onFrame: i, loop: !0, muted: !0 });
  }
}
const O = "MajoorOmniCamDirector";
function k(e) {
  return String(e?.comfyClass || e?.constructor?.type || "");
}
function f(e, t) {
  return e?.widgets?.find((o) => o.name === t)?.value;
}
function K(e) {
  try {
    const t = JSON.parse(String(f(e, "state_json") ?? "{}"));
    return t && typeof t == "object" ? t : {};
  } catch {
    return {};
  }
}
function G(e, t) {
  const o = e?.motion_scene_fingerprint;
  return o ? o !== q(t) : !1;
}
function Y(e, t) {
  if (k(t) !== O) return null;
  const o = String(f(t, "recording_path") || "");
  if (!o) return null;
  const r = D(e, o);
  if (!r) return null;
  const i = K(t), a = i?.metadata?.playblast && typeof i.metadata.playblast == "object" ? i.metadata.playblast : {};
  return {
    kind: "director_playblast",
    url: r,
    fps: Number(a.fps) || void 0,
    frameCount: Number(a.frame_count) || void 0,
    width: Number(a.width) || void 0,
    height: Number(a.height) || void 0,
    durationSeconds: Number(a.duration_seconds) || void 0,
    encoder: typeof a.encoder == "string" ? a.encoder : void 0,
    outdated: G(a, i)
  };
}
function E(e) {
  return k(e) === O && !f(e, "recording_path");
}
function J(e, t) {
  if (e) {
    const o = [e.outdated ? "⚠ Playblast outdated (re-record before compiling)" : "● Director playblast"];
    return e.width && e.height && o.push(`${e.width}x${e.height}`), e.fps && o.push(`${e.fps}fps`), e.frameCount && o.push(`${e.frameCount} frames`), e.durationSeconds && o.push(`${e.durationSeconds.toFixed(2)}s`), o.join(" · ");
  }
  return E(t) ? "⚠ Director connected, no playblast recorded yet — showing the live viewport." : "";
}
function Q(e, t) {
  return e?.outdated ? "2" : e ? "" : E(t) ? "1" : "";
}
class X {
  constructor(t, {
    delay: o = 250,
    endpoint: r = "/majoor/omnicam/monitor/live_preflight",
    onSnapshot: i = () => {
    },
    onError: a = () => {
    }
  } = {}) {
    this.api = t, this.delay = o, this.endpoint = r, this.onSnapshot = i, this.onError = a, this.timer = null, this.abort = null, this.scheduledKey = "";
  }
  /** No-ops when this exact payload is already scheduled or was just sent. */
  schedule(t) {
    const o = JSON.stringify(t);
    o !== this.scheduledKey && (this.scheduledKey = o, clearTimeout(this.timer), this.timer = setTimeout(() => this.refresh(t), this.delay));
  }
  async refresh(t) {
    this.abort?.abort(), this.abort = new AbortController();
    try {
      const o = await this.api.fetchApi(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
        signal: this.abort.signal
      });
      if (!o.ok)
        throw new Error(await o.text?.() || `Monitor live preflight failed (${o.status})`);
      const r = await o.json();
      return this.onSnapshot(r), r;
    } catch (o) {
      return o?.name !== "AbortError" && this.onError(o), null;
    }
  }
  dispose() {
    clearTimeout(this.timer), this.timer = null, this.abort?.abort(), this.abort = null, this.scheduledKey = "";
  }
}
function x(e) {
  return String(e?.comfyClass || e?.constructor?.type || "");
}
function w(e, t) {
  const o = e?.inputs?.find((r) => r.name === t);
  return o?.link == null || !e?.graph ? null : M(e.graph, o.link);
}
function Z(e) {
  const t = w(e, "motion_scene"), o = w(e, "playblast_video");
  return {
    sceneConnected: !!t,
    sceneOrigin: t,
    sceneNodeClass: x(t),
    playblastConnected: !!o,
    playblastOrigin: o,
    playblastNodeClass: x(o)
  };
}
class tt {
  constructor(t, o, r = 250) {
    this.node = t, this.onChange = o, this.initialized = !1, this.last = "", this.timer = setInterval(() => this.poll(), r), this.poll();
  }
  poll() {
    const t = Z(this.node), o = JSON.stringify([
      t.sceneOrigin?.id ?? null,
      t.playblastOrigin?.id ?? null,
      t.playblastOrigin?.imageIndex ?? null
    ]);
    return this.initialized && o === this.last ? !1 : (this.initialized = !0, this.last = o, this.onChange(t), !0);
  }
  dispose() {
    clearInterval(this.timer), this.timer = null;
  }
}
async function et(e) {
  const t = await e.fetchApi("/majoor/omnicam/monitor/profiles");
  if (!t.ok) throw new Error(`Monitor profile catalog failed (${t.status})`);
  return t.json();
}
function ot(e, t) {
  const o = e.querySelector('[data-role="profile-catalogue"]');
  if (!o) return;
  const r = Array.isArray(t?.profiles) ? t.profiles : [], i = Array.isArray(t?.capabilities?.capabilities) ? t.capabilities.capabilities : [], a = new Map(i.map((n) => [String(n.adapter), n]));
  o.innerHTML = r.length ? r.map((n) => {
    const l = (n.capability || a.get(String(n.id)))?.state || "missing";
    return `<div class="oc-row"><span><strong>${s(n.display_name)}</strong><br><small>${s(n.semantic)} · ${s(n.frame_policy)}</small></span><span class="oc-state" data-state="${s(l)}">${s(l)}</span></div>`;
  }).join("") : '<div class="oc-empty">No Monitor profile is available.</div>';
}
const rt = `${N}
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
  .oc-monitor .oc-reference-source{padding:2px 2px 6px;font-size:11px;color:var(--oc-text-dim)}
  .oc-monitor .oc-reference-source[data-warn="1"]{color:#e8b34a}
  .oc-monitor .oc-reference-source[data-warn="2"]{color:#ef6a6a}
  .oc-monitor .oc-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);gap:9px;padding:9px;min-height:0}
  .oc-monitor .oc-column{display:flex;flex-direction:column;gap:9px;min-width:0}.oc-monitor .oc-player{position:relative;min-height:270px;background:#09090c;border-radius:8px;overflow:hidden}
  .oc-monitor video{display:block;width:100%;height:270px;object-fit:contain;background:#08080b}.oc-monitor .oc-player-empty{position:absolute;inset:0;display:grid;place-items:center;color:var(--oc-text-faint);pointer-events:none}
  .oc-monitor canvas[data-role="proxy-upstream-preview"]{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#08080b;filter:saturate(.7) brightness(.85)}
  .oc-monitor .oc-player-controls{display:flex;gap:6px;align-items:center;padding-top:7px}.oc-monitor .oc-player-controls input{flex:1}.oc-monitor .oc-player-controls output{min-width:62px;color:var(--oc-text-dim)}
  .oc-monitor .oc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.oc-monitor .oc-row{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid var(--oc-line-soft)}
  .oc-monitor .oc-row:last-child{border-bottom:0}.oc-monitor .oc-row strong{font-weight:600}.oc-monitor .oc-row small{color:var(--oc-text-dim)}
  .oc-monitor .oc-state{font-size:10px;font-weight:750}.oc-monitor .oc-state[data-state="ready"]{color:var(--oc-ok-text)}.oc-monitor .oc-state[data-state="warning"]{color:var(--oc-warn-text)}.oc-monitor .oc-state[data-state="blocked"]{color:var(--oc-danger-text)}.oc-monitor .oc-state[data-state="pass"]{color:var(--oc-ok-text)}.oc-monitor .oc-state[data-state="risk"]{color:var(--oc-text-dim)}
  .oc-monitor .oc-advanced>summary{cursor:pointer;list-style:none}.oc-monitor .oc-advanced>summary::-webkit-details-marker{display:none}
  .oc-monitor .oc-collapsible>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:6px;user-select:none}
  .oc-monitor .oc-collapsible>summary::-webkit-details-marker{display:none}
  .oc-monitor .oc-collapsible>summary::before{content:"\\25B8";color:var(--oc-text-faint);font-size:9px}
  .oc-monitor .oc-collapsible[open]>summary::before{content:"\\25BE"}
  .oc-monitor .oc-collapsible:not([open]){gap:0}
  .oc-monitor .oc-adapter-controls{display:grid;grid-template-columns:1fr 1fr;gap:6px}.oc-monitor .oc-adapter-controls label{display:flex;flex-direction:column;gap:3px;color:var(--oc-text-dim)}
  .oc-monitor .oc-adapter-controls .wide{grid-column:1/-1}.oc-monitor .oc-adapter-controls input,.oc-monitor .oc-adapter-controls select{width:100%;padding:5px}
  .oc-monitor .oc-preview-label{display:flex;gap:7px;align-items:center;margin-bottom:7px}.oc-monitor .oc-preview-label span{font-size:9px;font-weight:750;color:var(--oc-accent)}
  .oc-monitor canvas{display:block;width:100%;height:auto;max-height:260px;background:var(--oc-sunken);border-radius:6px}.oc-monitor .oc-frame-strip{display:flex;gap:4px;overflow:auto}.oc-monitor .oc-frame-strip span{min-width:32px;padding:6px 3px;text-align:center;background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:4px;color:var(--oc-text-dim)}
  .oc-monitor .oc-tabs{display:flex;gap:4px;overflow:auto}.oc-monitor .oc-tab[aria-selected="true"]{background:var(--oc-accent);border-color:var(--oc-accent);color:var(--oc-accent-ink)}
  .oc-monitor .oc-copy-row{display:flex;justify-content:flex-end}.oc-monitor pre{min-height:95px;max-height:190px;overflow:auto;margin:0;padding:8px;white-space:pre-wrap;word-break:break-word;background:var(--oc-sunken);border-radius:6px;color:var(--oc-text-dim)}
  @media(max-width:700px){.oc-monitor .oc-layout{grid-template-columns:1fr}.oc-monitor .oc-grid{grid-template-columns:1fr}}
`, it = [
  ["external_reference_video", "External / Generic Reference Video"],
  ["h3_api", "MiniMax H3 · Comfy API"],
  ["h3_native", "MiniMax H3 · Native"],
  ["ltx25_motion_track", "LTX 2.5 Motion Track"],
  ["wan_camera_native", "Wan Camera Native"],
  ["wan_move_native", "Wan Move Native"],
  ["wan_track_native", "Wan Track Native"],
  ["wanvideo_ati", "WanVideo ATI"]
];
function at() {
  return it.map(([e, t]) => `<option value="${e}">${t}</option>`).join("");
}
function nt() {
  return `<div class="majoor-omnicam oc-monitor">
    <style>${rt}</style>
    <header class="oc-header">${P("OmniCam Monitor")}
      <div class="oc-header-actions"><span class="oc-status-pill" data-role="monitor-status" data-state="OFFLINE"><i class="oc-status-dot"></i> WAITING</span></div>
    </header>
    <div class="oc-source" data-role="source-status">Connect a MotionScene and queue the workflow.</div>
    <main class="oc-layout">
      <section class="oc-column">
        <div class="oc-card" data-role="proxy-card"><div class="oc-section">Playblast</div><div class="oc-reference-source" data-role="reference-source" hidden></div><div class="oc-player"><video data-role="proxy-player" playsinline muted aria-label="OmniCam playblast playback"></video><div class="oc-player-empty">No playblast preview</div><canvas data-role="proxy-upstream-preview" hidden aria-label="Connected playblast preview"></canvas></div><div class="oc-player-controls"><button type="button" data-act="proxy-play" aria-label="Play or pause playblast">Play</button><input data-role="proxy-scrubber" type="range" min="0" max="0" value="0" aria-label="Playblast frame"><output data-role="proxy-frame">0 / 0</output><label><input data-role="proxy-loop" type="checkbox" checked> Loop</label><label><input data-role="proxy-mute" type="checkbox" checked> Mute</label></div></div>
        <div class="oc-card"><div class="oc-section">Profile preflight</div><div data-role="profile-preflight" class="oc-empty">Queue the workflow to validate the selected profile.</div></div>
      </section>
      <aside class="oc-column">
        <div class="oc-card"><div class="oc-section">Compilation target</div><div class="oc-adapter-controls">
          <label class="wide">Profile<select data-role="profile-select">${at()}</select></label>
          <label class="wide">Base prompt<textarea data-setting="base_prompt" rows="3"></textarea></label>
          <label>Width<input data-setting="target_width" type="number" min="64" max="4096" step="8"></label>
          <label>Height<input data-setting="target_height" type="number" min="64" max="4096" step="8"></label>
          <label>Duration (seconds)<input data-setting="duration_seconds" type="number" min="0" max="600" step="0.1" placeholder="auto (from shot)"></label>
          <label>FPS<input data-setting="target_fps" type="number" min="0" max="120" step="1" placeholder="auto (from shot)"></label>
        </div></div>
        <details class="oc-card oc-collapsible"><summary class="oc-section">Profiles</summary><div data-role="profile-catalogue" class="oc-empty">Loading the Monitor profile catalogue.</div></details>
        <details class="oc-card oc-collapsible"><summary class="oc-section">Installed capabilities</summary><div data-role="profile-capabilities" class="oc-empty">Capability report available after execution.</div></details>
        <div class="oc-card"><div class="oc-section">Execution output</div><div data-role="output-status" class="oc-empty">OUTPUT NOT EXECUTED</div></div>
      </aside>
    </main>
  </div>`;
}
function st(e = document) {
  const t = e.createElement("div");
  return t.innerHTML = nt(), t.firstElementChild;
}
const g = [
  "base_prompt",
  "target_profile",
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps"
], ct = /* @__PURE__ */ new Set([
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps"
]);
function T(e, t) {
  return e?.widgets?.find((o) => o.name === t);
}
function m(e) {
  return Object.fromEntries(g.map((t) => [t, T(e, t)?.value]));
}
function S(e, t, o) {
  if (!g.includes(t)) return !1;
  const r = T(e, t);
  return r ? (r.value = ct.has(t) ? Number(o) : o, r.callback?.(r.value), !0) : !1;
}
const lt = 250, dt = /* @__PURE__ */ new Set(["duration_seconds", "target_fps"]);
function pt(e) {
  for (const t of e.widgets || [])
    t.computeSize = () => [0, -4], t.draw = () => {
    }, t.hidden = !0, t.options = { ...t.options || {}, hideInVueNodes: !0 };
}
class ut {
  constructor(t) {
    this.node = t, this.root = st(), this.disposers = [], this.source = null, this.player = new z(
      this.root.querySelector('[data-role="proxy-player"]'),
      {
        onFrame: (o) => this.showFrame(o),
        onMetadata: ({ frameCount: o }) => this.setFrameCount(o)
      }
    ), this.hasExecutedOnce = !1, this._liveUnavailableText = "", this.refreshController = new X(u, {
      onSnapshot: (o) => this.liveSnapshotReceived(o),
      onError: (o) => this.liveRefreshFailed(o)
    }), this.bindControls(), this.syncControlsFromWidgets(), this.loadProfileInfo(), this.watcher = new tt(t, (o) => this.sourceChanged(o)), this.liveTimer = setInterval(() => this.liveTick(), lt);
  }
  async loadProfileInfo() {
    const t = this.root.querySelector('[data-role="profile-catalogue"]');
    try {
      const o = await et(u);
      ot(this.root, o);
    } catch (o) {
      t && (t.textContent = "Monitor profile information unavailable."), console.warn("OmniCam: Monitor profile catalog unavailable", o);
    }
  }
  listen(t, o, r) {
    t && (t.addEventListener(o, r), this.disposers.push(() => t.removeEventListener(o, r)));
  }
  bindControls() {
    this.listen(this.root, "wheel", I(this.root)), this.listen(this.root.querySelector('[data-act="proxy-play"]'), "click", () => this.player.toggle()), this.listen(this.root.querySelector('[data-role="proxy-scrubber"]'), "input", (t) => this.player.scrub(t.target.value)), this.listen(this.root.querySelector('[data-role="proxy-loop"]'), "change", (t) => this.player.setLoop(t.target.checked)), this.listen(this.root.querySelector('[data-role="proxy-mute"]'), "change", (t) => this.player.setMuted(t.target.checked)), this.listen(this.root.querySelector('[data-role="profile-select"]'), "change", (t) => {
      S(this.node, "target_profile", t.target.value), this.settingsChanged();
    });
    for (const t of this.root.querySelectorAll("[data-setting]"))
      this.listen(t, "change", () => {
        S(this.node, t.dataset.setting, t.value), this.settingsChanged();
      });
  }
  /**
   * A Monitor setting changed. A live-able Director means the next poll tick
   * (at most ``LIVE_POLL_INTERVAL_MS`` away) replaces the panel with a fresh
   * preview of the new settings, so "OUTDATED" would be true for a fraction
   * of a second and then wrong. Only mark outdated when there is no live
   * preview coming to correct it -- an executed result with nothing to
   * refresh it really has gone stale.
   */
  settingsChanged() {
    h(this.source?.sceneOrigin) ? this.liveTick() : this.markOutdated();
  }
  syncControlsFromWidgets() {
    const t = m(this.node), o = this.root.querySelector('[data-role="profile-select"]');
    t.target_profile != null && (o.value = String(t.target_profile));
    for (const r of g) {
      if (r === "target_profile") continue;
      const i = this.root.querySelector(`[data-setting="${r}"]`);
      !i || t[r] == null || (dt.has(r) && Number(t[r]) <= 0 ? i.value = "" : i.value = t[r]);
    }
    this.reflectInheritedShot();
  }
  /**
   * Fill the placeholder of any "auto" (left-blank) duration / fps field with
   * the value the compile will actually inherit from the connected Director,
   * so the number is visible without being typed. Only a Director exposes its
   * shot client-side; a third-party MotionScene still compiles correctly (the
   * backend inherits from the scene) but cannot be previewed here.
   */
  reflectInheritedShot() {
    const t = this.source?.sceneOrigin, o = h(t) ? C(t) : null, r = {
      duration_seconds: o ? `${o.duration_seconds} (from Director)` : "auto (from shot)",
      target_fps: o ? `${o.fps} (from Director)` : "auto (from shot)"
    };
    for (const [i, a] of Object.entries(r)) {
      const n = this.root.querySelector(`[data-setting="${i}"]`);
      n && (n.placeholder = a);
    }
  }
  markOutdated() {
    this.root.querySelector('[data-role="output-status"]').textContent = "OUTPUT OUTDATED";
  }
  sourceChanged(t) {
    this.source = t;
    const o = this.root.querySelector('[data-role="source-status"]');
    o.textContent = t.sceneConnected ? `${t.sceneNodeClass || "MotionScene"} connected${t.playblastConnected ? ` · playblast: ${t.playblastNodeClass || "connected"}` : " · no playblast"}` : "Connect a MotionScene and queue the workflow.";
    const r = this.root.querySelector('[data-role="monitor-status"]');
    r.dataset.state = t.sceneConnected ? "CONNECTED" : "OFFLINE", r.lastChild.textContent = t.sceneConnected ? " CONNECTED" : " WAITING", this.reflectInheritedShot(), this.refreshPlayblastPreview(), this.liveTick();
  }
  /**
   * Read the connected Director's current widgets and, if anything actually
   * changed, schedule a debounced live preflight request. Runs on a timer
   * (LIVE_POLL_INTERVAL_MS) rather than on a widget "change" event: LiteGraph
   * widgets do not all fire one, and a camera dragged in the 3D viewport
   * never touches a DOM input at all.
   */
  liveTick() {
    this.refreshPlayblastPreview(), this.reflectInheritedShot();
    const t = this.source?.sceneOrigin;
    if (!h(t)) {
      this.showLiveUnavailable();
      return;
    }
    const o = B(t, m(this.node));
    this.refreshController.schedule(o);
  }
  liveSnapshotReceived(t) {
    v(this.root, t, { live: !0 });
  }
  liveRefreshFailed(t) {
    console.warn("OmniCam: Monitor live preflight failed", t);
  }
  /**
   * Honest placeholder for the two cases a live preview cannot cover: nothing
   * connected yet, or a MotionScene from something other than a Director --
   * a third-party node whose state only exists once the graph has run.
   * Never overwrites an actual execution result; that stands until another
   * execution, or a live-able connection, replaces it.
   */
  showLiveUnavailable() {
    if (this.hasExecutedOnce) return;
    const o = !!this.source?.sceneConnected ? "CONNECTED — waiting for upstream execution. Queue the workflow once to see a preflight." : "Queue the workflow to validate the selected profile.";
    o !== this._liveUnavailableText && (this._liveUnavailableText = o, this.root.querySelector('[data-role="profile-preflight"]').innerHTML = `<div class="oc-empty">${o}</div>`);
  }
  refreshPlayblastPreview() {
    const t = this.root.querySelector('[data-role="proxy-upstream-preview"]'), o = this.root.querySelector(".oc-player-empty"), r = this.source?.playblastOrigin, i = Y(u, r);
    if (this.updateReferenceSourceLabel(r, i), i) {
      t.hidden = !0, o.hidden = !0, this.player.setSource(i.url, {
        fps: i.fps,
        frameCount: i.frameCount
      });
      return;
    }
    const a = L(r);
    if (!a) {
      t.hidden = !0, o.hidden = !1, this.player.setSource("");
      return;
    }
    const c = typeof HTMLVideoElement < "u" && a instanceof HTMLVideoElement ? String(a.currentSrc || a.src || "") : "";
    if (c) {
      t.hidden = !0, o.hidden = !0, this.player.setSource(c);
      return;
    }
    this.player.setSource(""), $(a, t, 640).then((l) => {
      t.hidden = !l, o.hidden = l;
    });
  }
  updateReferenceSourceLabel(t, o) {
    const r = this.root.querySelector('[data-role="reference-source"]');
    if (!r) return;
    const i = J(o, t);
    r.textContent = i, r.hidden = !i, r.dataset.warn = Q(o, t);
  }
  setFrameCount(t) {
    const o = this.root.querySelector('[data-role="proxy-scrubber"]');
    o.max = Math.max(0, Number(t || 1) - 1);
  }
  showFrame(t) {
    const o = Math.max(0, Number(this.player.frameCount || 1) - 1);
    this.root.querySelector('[data-role="proxy-scrubber"]').value = t, this.root.querySelector('[data-role="proxy-frame"]').textContent = `${t} / ${o}`;
  }
  executed(t) {
    this.hasExecutedOnce = !0;
    const o = v(this.root, t);
    o.targetProfile && m(this.node).target_profile !== o.targetProfile && this.markOutdated();
  }
  dispose() {
    clearInterval(this.liveTimer), j(), this.refreshController?.dispose(), this.watcher?.dispose(), this.player.dispose();
    for (const t of this.disposers.splice(0)) t();
  }
}
function vt(e) {
  if (e.__majoorOmniCamMonitor) return;
  pt(e);
  const t = new ut(e);
  e.__majoorOmniCamMonitor = t;
  const o = () => Math.max(620, t.root.scrollHeight || 0);
  e.addDOMWidget("majoor_omnicam_monitor", "omnicam", t.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 620,
    getHeight: o,
    getMaxHeight: o
  });
  const r = e.onRemoved;
  e.onRemoved = function() {
    t.dispose(), r?.apply(this, arguments);
  };
  const i = e.onExecuted;
  e.onExecuted = function(c) {
    i?.apply(this, arguments), t.executed(c);
  };
  const a = e.onConfigure;
  e.onConfigure = function() {
    a?.apply(this, arguments), t.syncControlsFromWidgets();
  };
  const n = e.onConnectionsChange;
  e.onConnectionsChange = function() {
    n?.apply(this, arguments), t.watcher?.poll(), t.refreshPlayblastPreview(), setTimeout(() => t.refreshPlayblastPreview(), 400);
  };
}
export {
  vt as attachMonitor
};
