import { v as r, bn as M } from "./chunk-1zyvhFxD.js";
import { l as O, u as E, d as g } from "./chunk-eq1tqQ9i.js";
import "../../scripts/app.js";
import { api as u } from "../../scripts/api.js";
import { b as T, h as N, w as m, i as P, m as h, M as R, r as v } from "./chunk-CqMc0pXz.js";
import { M as q, E as I } from "./chunk-CbqXtcpr.js";
import { d as j, a as L, r as A } from "./chunk-Bh6aKUwt.js";
import { e as a } from "./chunk-hCbwK_eG.js";
import { S as D, b as W, p as H } from "./chunk-CooaTp3H.js";
const U = "MajoorOmniCamDirector";
function F(o) {
  return String(o?.comfyClass || o?.constructor?.type || "");
}
function d(o, e, t) {
  const i = o?.widgets?.find((n) => n.name === e);
  return i && i.value !== void 0 ? i.value : t;
}
function f(o) {
  return F(o) === U;
}
function k(o) {
  return {
    state_json: String(d(o, "state_json", "{}")),
    recording_path: String(d(o, "recording_path", "")),
    card_asset: String(d(o, "card_asset", "")),
    width: Number(d(o, "width", 1280)),
    height: Number(d(o, "height", 720)),
    fps: Number(d(o, "fps", 24)),
    duration_seconds: Number(d(o, "duration_seconds", 5)),
    render_mode: String(d(o, "render_mode", "omni_ref"))
  };
}
function z(o) {
  return {
    target_profile: String(o?.target_profile ?? ""),
    base_prompt: String(o?.base_prompt ?? ""),
    target_width: Number(o?.target_width ?? 832),
    target_height: Number(o?.target_height ?? 480),
    // 0 tells the backend to inherit the connected shot's duration / fps.
    duration_seconds: Number(o?.duration_seconds ?? 0),
    target_fps: Number(o?.target_fps ?? 0),
    guide_reference_index: Number(o?.guide_reference_index ?? 0),
    guide_style: String(o?.guide_style ?? ""),
    reference_plan_json: String(o?.reference_plan_json ?? "")
  };
}
function V(o, e) {
  return {
    director: k(o),
    monitor: z(e)
  };
}
class B extends q {
  constructor(e, { fps: t = 24, durationFrames: i = 1, onFrame: n = () => {
  } } = {}) {
    super(e, { fps: t, durationFrames: i, onFrame: n, loop: !0, muted: !0 });
  }
}
class G {
  constructor(e, {
    delay: t = 250,
    endpoint: i = "/majoor/omnicam/monitor/live_preflight",
    onSnapshot: n = () => {
    },
    onError: c = () => {
    }
  } = {}) {
    this.api = e, this.delay = t, this.endpoint = i, this.onSnapshot = n, this.onError = c, this.timer = null, this.abort = null, this.scheduledKey = "", this.disposed = !1, this.generation = 0;
  }
  /** No-ops when this exact payload is already scheduled or was just sent. */
  schedule(e) {
    if (this.disposed) return;
    const t = JSON.stringify(e);
    t !== this.scheduledKey && (this.scheduledKey = t, clearTimeout(this.timer), this.timer = setTimeout(() => this.refresh(e), this.delay));
  }
  async refresh(e) {
    if (this.disposed) return null;
    this.abort?.abort(), this.abort = new AbortController();
    const t = ++this.generation;
    try {
      const i = await this.api.fetchApi(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
        signal: this.abort.signal
      });
      if (!i.ok)
        throw new Error(await i.text?.() || `Monitor live preflight failed (${i.status})`);
      const n = await i.json();
      return this.disposed || t !== this.generation ? null : (this.onSnapshot(n), n);
    } catch (i) {
      return !this.disposed && t === this.generation && i?.name !== "AbortError" && this.onError(i), null;
    }
  }
  dispose() {
    this.disposed = !0, this.generation += 1, clearTimeout(this.timer), this.timer = null, this.abort?.abort(), this.abort = null, this.scheduledKey = "";
  }
}
function b(o) {
  return String(o?.comfyClass || o?.constructor?.type || "");
}
function x(o, e) {
  const t = o?.inputs?.find((i) => i.name === e);
  return t?.link == null || !o?.graph ? null : O(o.graph, t.link);
}
function K(o) {
  const e = x(o, "motion_scene"), t = x(o, "playblast_video");
  return {
    sceneConnected: !!e,
    sceneOrigin: e,
    sceneNodeClass: b(e),
    playblastConnected: !!t,
    playblastOrigin: t,
    playblastNodeClass: b(t)
  };
}
class J {
  constructor(e, t, i = 250) {
    this.node = e, this.onChange = t, this.initialized = !1, this.last = "", this.timer = setInterval(() => this.poll(), i), this.poll();
  }
  poll() {
    const e = K(this.node), t = JSON.stringify([
      e.sceneOrigin?.id ?? null,
      e.playblastOrigin?.id ?? null,
      e.playblastOrigin?.imageIndex ?? null
    ]);
    return this.initialized && t === this.last ? !1 : (this.initialized = !0, this.last = t, this.onChange(e), !0);
  }
  dispose() {
    clearInterval(this.timer), this.timer = null;
  }
}
async function Y(o) {
  const e = await o.fetchApi("/majoor/omnicam/monitor/profiles");
  if (!e.ok) throw new Error(`Monitor profile catalog failed (${e.status})`);
  return e.json();
}
function Q(o, e) {
  const t = o.querySelector('[data-role="profile-catalogue"]');
  if (!t) return;
  const i = Array.isArray(e?.profiles) ? e.profiles : [], n = Array.isArray(e?.capabilities?.capabilities) ? e.capabilities.capabilities : [], c = new Map(n.map((s) => [String(s.adapter), s]));
  t.innerHTML = i.length ? i.map((s) => {
    const p = (s.capability || c.get(String(s.id)))?.state || "missing";
    return `<div class="oc-row"><span><strong>${a(s.display_name)}</strong><br><small>${a(s.semantic)} · ${a(s.frame_policy)}</small></span><span class="oc-state" data-state="${a(p)}">${a(p)}</span></div>`;
  }).join("") : `<div class="oc-empty">${a(r("No Monitor profile is available."))}</div>`;
}
const w = [
  "camera_motion",
  "camera_framing",
  "camera_pacing",
  "composition",
  "spatial_layout",
  "blocking",
  "subject_trajectory",
  "subject_action",
  "identity",
  "design",
  "materials",
  "lighting",
  "color",
  "atmosphere",
  "audio_voice",
  "audio_rhythm"
], _ = ["image", "video", "audio"];
function S(o, e) {
  const t = new Set(Array.isArray(e) ? e : []);
  return o.map((i) => `<option value="${i}"${t.has(i) ? " selected" : ""}>${a(i)}</option>`).join("");
}
function X(o) {
  const e = _.includes(o.media_type) ? o.media_type : "image";
  return `<div class="oc-reference-row" data-role="reference-row">
    <input type="text" data-field="id" placeholder="${a(r("id"))}" value="${a(o.id || "")}">
    <select data-field="media_type">${_.map((t) => `<option value="${t}"${e === t ? " selected" : ""}>${a(t)}</option>`).join("")}</select>
    <input type="number" min="1" max="30" data-field="slot_hint" placeholder="1" value="${o.slot_hint || ""}">
    <select data-field="roles" multiple size="4" title="${a(r("Roles this reference is declared for"))}">${S(w, o.roles)}</select>
    <select data-field="ignore" multiple size="4" title="${a(r("Roles this reference explicitly does not carry"))}">${S(w, o.ignore)}</select>
    <button type="button" class="oc-remove-reference" data-act="reference-row-remove" aria-label="${a(r("Remove reference"))}">✕</button>
  </div>`;
}
function C(o, e) {
  const t = o.querySelector('[data-role="reference-matrix-rows"]');
  t && (t.innerHTML = e.length ? e.map(X).join("") : `<div class="oc-empty">${a(r("No additional references declared."))}</div>`);
}
function $(o) {
  return o ? [...o.selectedOptions].map((e) => e.value) : [];
}
function y(o) {
  return [...o.querySelectorAll('[data-role="reference-row"]')].map((e) => {
    const t = e.querySelector('[data-field="id"]')?.value.trim() || "", i = e.querySelector('[data-field="media_type"]')?.value || "image", n = e.querySelector('[data-field="slot_hint"]')?.value || "", c = $(e.querySelector('[data-field="roles"]')), s = $(e.querySelector('[data-field="ignore"]')), l = { id: t, media_type: i, roles: c };
    return n && (l.slot_hint = Number(n)), s.length && (l.ignore = s), l;
  }).filter((e) => e.id);
}
function Z(o) {
  const e = String(o || "").trim();
  if (!e) return [];
  try {
    const t = JSON.parse(e);
    return Array.isArray(t) ? t : [];
  } catch {
    return [];
  }
}
const ee = `${D}
  .oc-monitor{width:100%;min-height:0;display:flex;flex-direction:column;overflow:auto;border:1px solid var(--oc-line);border-radius:var(--oc-radius);background:var(--oc-bg);container-type:inline-size}
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
  .oc-monitor .oc-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);gap:9px;padding:9px;min-height:0;flex:0 0 auto}
  .oc-monitor .oc-column{display:flex;flex-direction:column;gap:9px;min-width:0}.oc-monitor .oc-player{position:relative;min-height:270px;background:#09090c;border-radius:8px;overflow:hidden}
  .oc-monitor video{display:block;width:100%;height:270px;object-fit:contain;background:#08080b}.oc-monitor .oc-player-empty{position:absolute;inset:0;display:grid;place-items:center;color:var(--oc-text-faint);pointer-events:none}
  .oc-monitor canvas[data-role="proxy-upstream-preview"]{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#08080b;filter:saturate(.7) brightness(.85)}
  /* [hidden] must win over the position:absolute/display:grid rules above --
     an author stylesheet rule otherwise beats the UA's [hidden]{display:none},
     so setting canvas.hidden/emptyEl.hidden = true left both painted on top
     of the actual <video>, showing a solid near-black box over real playback. */
  .oc-monitor .oc-player-empty[hidden],.oc-monitor canvas[data-role="proxy-upstream-preview"][hidden]{display:none}
  .oc-monitor .oc-player-controls{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding-top:7px}.oc-monitor .oc-player-controls input{flex:1;min-width:0}.oc-monitor .oc-player-controls output{min-width:62px;color:var(--oc-text-dim)}
  .oc-monitor .oc-player-empty{color:#98A3B8}
  .oc-monitor .oc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.oc-monitor .oc-row{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid var(--oc-line-soft)}
  .oc-monitor .oc-row:last-child{border-bottom:0}.oc-monitor .oc-row strong{font-weight:600}.oc-monitor .oc-row small{color:var(--oc-text-dim)}
  .oc-monitor .oc-state{font-size:10px;font-weight:750}.oc-monitor .oc-state[data-state="ready"]{color:var(--oc-ok-text)}.oc-monitor .oc-state[data-state="warning"]{color:var(--oc-warn-text)}.oc-monitor .oc-state[data-state="blocked"]{color:var(--oc-danger-text)}.oc-monitor .oc-state[data-state="pass"]{color:var(--oc-ok-text)}.oc-monitor .oc-state[data-state="risk"]{color:var(--oc-text-dim)}
  .oc-monitor .oc-mapping-quality{font-size:10px;font-weight:750;color:var(--oc-text-dim);white-space:nowrap}
  .oc-monitor .oc-mapping-quality[data-quality="DIRECT"]{color:var(--oc-ok-text)}
  .oc-monitor .oc-mapping-quality[data-quality="CONDITIONAL"]{color:#86b6f2}
  .oc-monitor .oc-mapping-quality[data-quality="APPROXIMATED"]{color:var(--oc-warn-text)}
  .oc-monitor .oc-mapping-quality[data-quality="UNSUPPORTED"]{color:var(--oc-danger-text)}
  .oc-monitor .oc-suggestions{margin:3px 0 0;padding-left:15px;color:var(--oc-text-dim);font-size:11px}
  .oc-monitor .oc-recoverable{font-size:9px;font-weight:750;color:var(--oc-accent);border:1px solid var(--oc-accent);border-radius:4px;padding:0 4px}
  .oc-monitor .oc-reference-row{display:grid;grid-template-columns:1fr auto 56px 1fr 1fr auto;gap:5px;align-items:start;padding:6px 0;border-bottom:1px solid var(--oc-line-soft)}
  .oc-monitor .oc-reference-row:last-child{border-bottom:0}
  .oc-monitor .oc-reference-row input,.oc-monitor .oc-reference-row select{width:100%;padding:4px;font-size:11px}
  .oc-monitor .oc-remove-reference{padding:4px 7px}
  .oc-monitor .oc-add-reference{margin-top:7px}
  @container(max-width:700px){.oc-monitor .oc-reference-row{grid-template-columns:1fr}}
  .oc-monitor .oc-advanced>summary{cursor:pointer;list-style:none}.oc-monitor .oc-advanced>summary::-webkit-details-marker{display:none}
  .oc-monitor .oc-collapsible>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:6px;user-select:none}
  .oc-monitor .oc-collapsible>summary::-webkit-details-marker{display:none}
  .oc-monitor .oc-collapsible>summary::before{content:"\\25B8";color:var(--oc-text-faint);font-size:9px}
  .oc-monitor .oc-collapsible[open]>summary::before{content:"\\25BE"}
  .oc-monitor .oc-collapsible:not([open]){gap:0}
  .oc-monitor .oc-adapter-controls{display:grid;grid-template-columns:1fr 1fr;gap:6px}.oc-monitor .oc-adapter-controls label{display:flex;flex-direction:column;gap:3px;color:var(--oc-text-dim)}
  .oc-monitor .oc-adapter-controls .wide{grid-column:1/-1}.oc-monitor .oc-adapter-controls input,.oc-monitor .oc-adapter-controls select{width:100%;padding:5px}
  .oc-monitor .oc-hint{grid-column:1/-1;padding:6px 8px;border:1px solid var(--oc-line);border-radius:6px;background:var(--oc-sunken);color:var(--oc-text-dim);font-size:11px}
  .oc-monitor .oc-preview-label{display:flex;gap:7px;align-items:center;margin-bottom:7px}.oc-monitor .oc-preview-label span{font-size:9px;font-weight:750;color:var(--oc-accent)}
  .oc-monitor canvas{display:block;width:100%;height:auto;max-height:260px;background:var(--oc-sunken);border-radius:6px}.oc-monitor .oc-frame-strip{display:flex;gap:4px;overflow:auto}.oc-monitor .oc-frame-strip span{min-width:32px;padding:6px 3px;text-align:center;background:var(--oc-sunken);border:1px solid var(--oc-line);border-radius:4px;color:var(--oc-text-dim)}
  .oc-monitor .oc-tabs{display:flex;gap:4px;overflow:auto}.oc-monitor .oc-tab[aria-selected="true"]{background:var(--oc-accent);border-color:var(--oc-accent);color:var(--oc-accent-ink)}
  .oc-monitor .oc-copy-row{display:flex;justify-content:flex-end}.oc-monitor pre{min-height:95px;max-height:190px;overflow:auto;margin:0;padding:8px;white-space:pre-wrap;word-break:break-word;background:var(--oc-sunken);border-radius:6px;color:var(--oc-text-dim)}
  @container(max-width:700px){.oc-monitor .oc-layout{grid-template-columns:1fr}.oc-monitor .oc-grid{grid-template-columns:1fr}}
`, te = [
  ["external_reference_video", r("External / Generic Reference Video")],
  ["h3_api", "MiniMax H3 · Comfy API"],
  ["h3_native", "MiniMax H3 · Native"],
  ["h3_scene_coverage", "MiniMax H3 · Scene Coverage"],
  ["ltx25_motion_track", "LTX 2.5 Motion Track"],
  ["seedance25_reference", "ByteDance Seedance 2.5 Reference"],
  ["wan_camera_native", "Wan Camera Native"],
  ["wan_move_native", "Wan Move Native"],
  ["wan_track_native", "Wan Track Native"],
  ["wanvideo_ati", "WanVideo ATI"]
], oe = [
  ["auto", r("Auto")],
  ["motion_proxy", r("Motion Proxy")],
  ["clay", r("Clay / White Model")],
  ["depth_rich", r("Depth Rich")],
  ["beauty_reference", r("Beauty Reference")],
  ["passthrough", r("Passthrough")],
  ["diagnostic", r("Diagnostic")]
];
function re() {
  return oe.map(([o, e]) => `<option value="${o}">${a(e)}</option>`).join("");
}
function ie() {
  return te.map(([o, e]) => `<option value="${o}">${a(r(e))}</option>`).join("");
}
function ae() {
  return `<div class="majoor-omnicam oc-monitor">
    <style>${ee}</style>
    <header class="oc-header">${W("OmniCam Monitor")}
      <div class="oc-header-actions"><span class="oc-status-pill" data-role="monitor-status" data-state="OFFLINE"><i class="oc-status-dot"></i> ${a(r("WAITING"))}</span></div>
    </header>
    <div class="oc-source" data-role="source-status">${a(r("Connect a MotionScene and queue the workflow."))}</div>
    <main class="oc-layout">
      <section class="oc-column">
        <div class="oc-card" data-role="proxy-card"><div class="oc-section">${a(r("Playblast"))}</div><div class="oc-reference-source" data-role="reference-source" hidden></div><div class="oc-player"><video data-role="proxy-player" playsinline muted aria-label="${a(r("OmniCam playblast playback"))}"></video><div class="oc-player-empty">${a(r("No playblast preview"))}</div><canvas data-role="proxy-upstream-preview" hidden aria-label="${a(r("Connected playblast preview"))}"></canvas></div><div class="oc-player-controls"><button type="button" data-act="proxy-play" aria-label="${a(r("Play or pause playblast"))}">${a(r("Play"))}</button><input data-role="proxy-scrubber" type="range" min="0" max="0" value="0" aria-label="${a(r("Playblast frame"))}"><output data-role="proxy-frame">0 / 0</output><label><input data-role="proxy-loop" type="checkbox" checked> ${a(r("Loop"))}</label><label><input data-role="proxy-mute" type="checkbox" checked> ${a(r("Mute"))}</label></div></div>
        <div class="oc-card"><div class="oc-section">${a(r("Profile preflight"))}</div><div data-role="profile-preflight" class="oc-empty">${a(r("Queue the workflow to validate the selected profile."))}</div></div>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(r("Compilation Diff"))}</summary><div data-role="profile-diff" class="oc-empty">${a(r("No mapping-quality diagnostics yet."))}</div></details>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(r("Guide Health"))}</summary><div data-role="profile-health" class="oc-empty">${a(r("No guide-health warnings yet."))}</div></details>
      </section>
      <aside class="oc-column">
        <div class="oc-card"><div class="oc-section">${a(r("Compilation target"))}</div><div class="oc-adapter-controls">
          <label class="wide">${a(r("Profile"))}<select data-role="profile-select">${ie()}</select></label>
          <div class="oc-hint" data-role="h3-setup-hint" hidden>${a(r("Connect a Motion Scene and Playblast Video output to this Monitor node to compile with an H3 profile."))}</div>
          <label class="wide">${a(r("Base prompt"))}<textarea data-setting="base_prompt" rows="3"></textarea></label>
          <label>${a(r("Width"))}<input data-setting="target_width" type="number" min="64" max="4096" step="8"></label>
          <label>${a(r("Height"))}<input data-setting="target_height" type="number" min="64" max="4096" step="8"></label>
          <label>${a(r("Duration (seconds)"))}<input data-setting="duration_seconds" type="number" min="0" max="600" step="0.1" placeholder="${a(r("auto (from shot)"))}"></label>
          <label>${a(r("FPS"))}<input data-setting="target_fps" type="number" min="0" max="120" step="1" placeholder="${a(r("auto (from shot)"))}"></label>
          <label>${a(r("Guide reference index"))}<input data-setting="guide_reference_index" type="number" min="1" max="10" step="1"></label>
          <label>${a(r("Guide style"))}<select data-setting="guide_style">${re()}</select></label>
        </div></div>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(r("Reference Role Matrix"))}</summary>
          <div class="oc-hint">${a(r("Declare references OmniCam does not own the media for (an identity image, an action video...). Compiled into the prompt alongside the OmniCam guide."))}</div>
          <div data-role="reference-matrix-rows" class="oc-empty">${a(r("No additional references declared."))}</div>
          <button type="button" class="oc-add-reference" data-act="reference-matrix-add">${a(r("Add reference"))}</button>
          <textarea data-setting="reference_plan_json" hidden></textarea>
        </details>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(r("Profiles"))}</summary><div data-role="profile-catalogue" class="oc-empty">${a(r("Loading the Monitor profile catalogue."))}</div></details>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(r("Installed capabilities"))}</summary><div data-role="profile-capabilities" class="oc-empty">${a(r("Capability report available after execution."))}</div></details>
        <div class="oc-card"><div class="oc-section">${a(r("Execution output"))}</div><div data-role="output-status" class="oc-empty">${a(r("OUTPUT NOT EXECUTED"))}</div></div>
      </aside>
    </main>
  </div>`;
}
function ne(o = document) {
  const e = o.createElement("div");
  return e.innerHTML = ae(), e.firstElementChild;
}
const se = 250, ce = /* @__PURE__ */ new Set(["duration_seconds", "target_fps"]);
function le(o) {
  N(o);
}
class de {
  constructor(e) {
    this.node = e, this.root = ne(), this.events = new I(), this.source = null, this.player = new B(
      this.root.querySelector('[data-role="proxy-player"]'),
      {
        onFrame: (t) => this.showFrame(t),
        onMetadata: ({ frameCount: t }) => this.setFrameCount(t)
      }
    ), this.hasExecutedOnce = !1, this._liveUnavailableText = "", this.disposed = !1, this.connectionRefreshTimer = null, this.refreshController = new G(u, {
      onSnapshot: (t) => this.liveSnapshotReceived(t),
      onError: (t) => this.liveRefreshFailed(t)
    }), this.bindControls(), this.syncControlsFromWidgets(), this.loadProfileInfo(), this.watcher = new J(e, (t) => this.sourceChanged(t)), this.liveTimer = setInterval(() => this.liveTick(), se);
  }
  async loadProfileInfo() {
    const e = this.root.querySelector('[data-role="profile-catalogue"]');
    try {
      const t = await Y(u);
      if (this.disposed) return;
      Q(this.root, t);
    } catch (t) {
      e && (e.textContent = r("Monitor profile information unavailable.")), console.warn("OmniCam: Monitor profile catalog unavailable", t);
    }
  }
  bindControls() {
    this.events.on(this.root, "wheel", H(this.root)), this.events.on(this.root.querySelector('[data-act="proxy-play"]'), "click", () => this.player.toggle()), this.events.on(this.root.querySelector('[data-role="proxy-scrubber"]'), "input", (t) => this.player.scrub(t.target.value)), this.events.on(this.root.querySelector('[data-role="proxy-loop"]'), "change", (t) => this.player.setLoop(t.target.checked)), this.events.on(this.root.querySelector('[data-role="proxy-mute"]'), "change", (t) => this.player.setMuted(t.target.checked)), this.events.on(this.root.querySelector('[data-role="profile-select"]'), "change", (t) => {
      m(this.node, "target_profile", t.target.value), this.updateH3SetupHint(t.target.value), this.settingsChanged();
    });
    for (const t of this.root.querySelectorAll("[data-setting]"))
      this.events.on(t, "change", () => {
        m(this.node, t.dataset.setting, t.value), this.settingsChanged();
      });
    this.events.on(this.root.querySelector('[data-act="reference-matrix-add"]'), "click", () => {
      const t = y(this.root);
      t.push({ id: `reference_${t.length + 1}`, media_type: "image", roles: [] }), this.syncReferenceMatrix(t);
    });
    const e = this.root.querySelector('[data-role="reference-matrix-rows"]');
    this.events.on(e, "click", (t) => {
      const i = t.target.closest('[data-act="reference-row-remove"]');
      if (!i) return;
      const n = i.closest('[data-role="reference-row"]'), s = [...this.root.querySelectorAll('[data-role="reference-row"]')].indexOf(n), l = y(this.root);
      s >= 0 && l.splice(s, 1), this.syncReferenceMatrix(l);
    }), this.events.on(e, "change", (t) => {
      t.target.closest('[data-role="reference-row"]') && this.commitReferenceMatrix(y(this.root));
    });
  }
  /** Repaints the matrix rows from `specs`, then commits. Only for add/remove. */
  syncReferenceMatrix(e) {
    C(this.root, e), this.commitReferenceMatrix(e);
  }
  /** Serializes `specs` into the hidden reference_plan_json widget and
   * schedules a fresh preflight, without touching the rendered rows. */
  commitReferenceMatrix(e) {
    m(this.node, "reference_plan_json", JSON.stringify(e)), this.settingsChanged();
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
    f(this.source?.sceneOrigin) ? this.liveTick() : this.markOutdated();
  }
  updateH3SetupHint(e) {
    const t = this.root.querySelector('[data-role="h3-setup-hint"]');
    t && (t.hidden = !P(e));
  }
  syncControlsFromWidgets() {
    const e = h(this.node), t = this.root.querySelector('[data-role="profile-select"]');
    e.target_profile != null && (t.value = String(e.target_profile)), this.updateH3SetupHint(t.value);
    for (const i of R) {
      if (i === "target_profile") continue;
      const n = this.root.querySelector(`[data-setting="${i}"]`);
      !n || e[i] == null || (ce.has(i) && Number(e[i]) <= 0 ? n.value = "" : n.value = e[i]);
    }
    C(this.root, Z(e.reference_plan_json)), this.reflectInheritedShot();
  }
  /**
   * Fill the placeholder of any "auto" (left-blank) duration / fps field with
   * the value the compile will actually inherit from the connected Director,
   * so the number is visible without being typed. Only a Director exposes its
   * shot client-side; a third-party MotionScene still compiles correctly (the
   * backend inherits from the scene) but cannot be previewed here.
   */
  reflectInheritedShot() {
    const e = this.source?.sceneOrigin, t = f(e) ? k(e) : null, i = {
      duration_seconds: t ? r("{value} (from Director)", { value: t.duration_seconds }) : r("auto (from shot)"),
      target_fps: t ? r("{value} (from Director)", { value: t.fps }) : r("auto (from shot)")
    };
    for (const [n, c] of Object.entries(i)) {
      const s = this.root.querySelector(`[data-setting="${n}"]`);
      s && (s.placeholder = c);
    }
  }
  markOutdated() {
    this.root.querySelector('[data-role="output-status"]').textContent = r("OUTPUT OUTDATED");
  }
  sourceChanged(e) {
    if (this.disposed) return;
    this.source = e;
    const t = this.root.querySelector('[data-role="source-status"]');
    t.textContent = e.sceneConnected ? r("{source} connected · {playblast}", {
      source: e.sceneNodeClass || "MotionScene",
      playblast: e.playblastConnected ? r("Playblast: {name}", { name: e.playblastNodeClass || r("CONNECTED") }) : r("No playblast")
    }) : r("Connect a MotionScene and queue the workflow.");
    const i = this.root.querySelector('[data-role="monitor-status"]');
    i.dataset.state = e.sceneConnected ? r("CONNECTED") : "OFFLINE", i.lastChild.textContent = e.sceneConnected ? " " + r("CONNECTED") : " " + r("WAITING"), this.reflectInheritedShot(), this.refreshPlayblastPreview(), this.liveTick();
  }
  /**
   * Read the connected Director's current widgets and, if anything actually
   * changed, schedule a debounced live preflight request. Runs on a timer
   * (LIVE_POLL_INTERVAL_MS) rather than on a widget "change" event: LiteGraph
   * widgets do not all fire one, and a camera dragged in the 3D viewport
   * never touches a DOM input at all.
   */
  liveTick() {
    if (this.disposed) return;
    this.refreshPlayblastPreview(), this.reflectInheritedShot();
    const e = this.source?.sceneOrigin;
    if (!f(e)) {
      this.showLiveUnavailable();
      return;
    }
    const t = V(e, h(this.node)), i = t.director, n = `${i.state_json}\0${JSON.stringify(t.monitor)}\0${i.recording_path}\0${i.card_asset}\0${i.width}x${i.height}@${i.fps}/${i.duration_seconds}:${i.render_mode}`;
    n !== this._liveKey && (this._liveKey = n, this.refreshController.schedule(t));
  }
  liveSnapshotReceived(e) {
    this.disposed || v(this.root, e, { live: !0 });
  }
  liveRefreshFailed(e) {
    console.warn("OmniCam: Monitor live preflight failed", e);
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
    const t = !!this.source?.sceneConnected ? r("CONNECTED — waiting for upstream execution. Queue the workflow once to see a preflight.") : r("Queue the workflow to validate the selected profile.");
    t !== this._liveUnavailableText && (this._liveUnavailableText = t, this.root.querySelector('[data-role="profile-preflight"]').innerHTML = `<div class="oc-empty">${t}</div>`);
  }
  refreshPlayblastPreview() {
    if (this.disposed) return;
    const e = this.root.querySelector('[data-role="proxy-upstream-preview"]'), t = this.root.querySelector(".oc-player-empty"), i = this.source?.playblastOrigin, n = j(u, i);
    if (this.updateReferenceSourceLabel(i, n), n) {
      e.hidden = !0, t.hidden = !0, this.player.setSource(n.url, {
        fps: n.fps,
        frameCount: n.frameCount
      });
      return;
    }
    const c = E(i);
    if (!c) {
      e.hidden = !0, t.hidden = !1, this.player.setSource("");
      return;
    }
    const l = typeof HTMLVideoElement < "u" && c instanceof HTMLVideoElement ? String(c.currentSrc || c.src || "") : "";
    if (l) {
      e.hidden = !0, t.hidden = !0, this.player.setSource(l);
      return;
    }
    this.player.setSource(""), g(c, e, 640).then((p) => {
      this.disposed || (e.hidden = !p, t.hidden = p);
    });
  }
  /**
   * Best-effort downscaled still of whichever preview is currently showing:
   * the playblast <video> (this.player, MonitorPlayer/ManagedVideoPlayer) or
   * the `proxy-upstream-preview` canvas fallback -- mirroring the same
   * `canvas.hidden` check refreshPlayblastPreview() uses to decide which one
   * is visible. Called by monitor/shell.js only at workbench-close time.
   * Resolves null when neither has a usable frame yet.
   */
  async capturePreviewDataUrl() {
    const e = this.root.querySelector('[data-role="proxy-upstream-preview"]'), t = e && !e.hidden ? e : this.player?.video;
    if (!t) return null;
    const i = document.createElement("canvas");
    return await g(t, i, 240) ? i.toDataURL("image/webp", 0.7) : null;
  }
  /**
   * The URL of the playblast video currently loaded in `this.player`, but
   * only when the *video* path is actually what's showing -- same
   * `canvas.hidden` check refreshPlayblastPreview() uses to decide between
   * the player and the `proxy-upstream-preview` canvas fallback. "" (not
   * null) when there is no such video, so the caller (monitor/shell.js) knows
   * to fall back to a still-frame capture instead. Called by monitor/shell.js
   * only at workbench-close time.
   */
  currentPlayblastVideoUrl() {
    const e = this.root.querySelector('[data-role="proxy-upstream-preview"]');
    if (!e || !e.hidden) return "";
    const t = this.player?.video;
    return t && (t.currentSrc || t.src) || "";
  }
  updateReferenceSourceLabel(e, t) {
    const i = this.root.querySelector('[data-role="reference-source"]');
    if (!i) return;
    const n = L(t, e);
    i.textContent = n, i.hidden = !n, i.dataset.warn = A(t, e);
  }
  setFrameCount(e) {
    const t = this.root.querySelector('[data-role="proxy-scrubber"]');
    t.max = Math.max(0, Number(e || 1) - 1);
  }
  showFrame(e) {
    const t = Math.max(0, Number(this.player.frameCount || 1) - 1);
    this.root.querySelector('[data-role="proxy-scrubber"]').value = e, this.root.querySelector('[data-role="proxy-frame"]').textContent = `${e} / ${t}`;
  }
  renderResult(e, { executed: t = !1 } = {}) {
    t && (this.hasExecutedOnce = !0);
    const i = v(this.root, e);
    i.targetProfile && h(this.node).target_profile !== i.targetProfile && this.markOutdated();
  }
  executed(e) {
    this.renderResult(e, { executed: !0 });
  }
  blockedPreflight(e) {
    this.hasExecutedOnce = !0, this.renderResult(e);
  }
  dispose() {
    this.disposed || (this.disposed = !0, clearInterval(this.liveTimer), clearTimeout(this.connectionRefreshTimer), M(), this.refreshController?.dispose(), this.watcher?.dispose(), this.player.dispose(), this.events.dispose());
  }
}
function xe(o) {
  if (o.__majoorOmniCamMonitorWorkbench && !o.__majoorOmniCamMonitorWorkbench.disposed)
    return o.__majoorOmniCamMonitorWorkbench;
  le(o);
  const e = new de(o);
  o.__majoorOmniCamMonitorWorkbench = e;
  const t = o.__majoorOmniCamMonitorRuntime;
  return t ? t.restore(e) : e.events.add(T(u, o, e)), e;
}
function we(o) {
  o && (o.node?.__majoorOmniCamMonitorWorkbench === o && (o.node.__majoorOmniCamMonitorWorkbench = null), o.dispose());
}
export {
  we as closeMonitorWorkbench,
  xe as openMonitorWorkbench
};
