import { v as i, bn as w } from "./chunk-GvJ-GQpX.js";
import { l as _, u as S, d as f } from "./chunk-eq1tqQ9i.js";
import "../../scripts/app.js";
import { api as p } from "../../scripts/api.js";
import { b as C, h as k, w as b, i as M, m as h, M as O, r as v } from "./chunk-C0ioVhpL.js";
import { M as $, E as T } from "./chunk-CbqXtcpr.js";
import { d as E, a as P, r as N } from "./chunk-BsSpV03O.js";
import { e as a } from "./chunk-CcMjp6yC.js";
import { S as I, b as L, p as q } from "./chunk-DCP1XR2t.js";
const R = "MajoorOmniCamDirector";
function W(o) {
  return String(o?.comfyClass || o?.constructor?.type || "");
}
function l(o, e, t) {
  const r = o?.widgets?.find((n) => n.name === e);
  return r && r.value !== void 0 ? r.value : t;
}
function m(o) {
  return W(o) === R;
}
function x(o) {
  return {
    state_json: String(l(o, "state_json", "{}")),
    recording_path: String(l(o, "recording_path", "")),
    card_asset: String(l(o, "card_asset", "")),
    width: Number(l(o, "width", 1280)),
    height: Number(l(o, "height", 720)),
    fps: Number(l(o, "fps", 24)),
    duration_seconds: Number(l(o, "duration_seconds", 5)),
    render_mode: String(l(o, "render_mode", "omni_ref"))
  };
}
function j(o) {
  return {
    target_profile: String(o?.target_profile ?? ""),
    base_prompt: String(o?.base_prompt ?? ""),
    target_width: Number(o?.target_width ?? 832),
    target_height: Number(o?.target_height ?? 480),
    // 0 tells the backend to inherit the connected shot's duration / fps.
    duration_seconds: Number(o?.duration_seconds ?? 0),
    target_fps: Number(o?.target_fps ?? 0)
  };
}
function A(o, e) {
  return {
    director: x(o),
    monitor: j(e)
  };
}
class H extends $ {
  constructor(e, { fps: t = 24, durationFrames: r = 1, onFrame: n = () => {
  } } = {}) {
    super(e, { fps: t, durationFrames: r, onFrame: n, loop: !0, muted: !0 });
  }
}
class D {
  constructor(e, {
    delay: t = 250,
    endpoint: r = "/majoor/omnicam/monitor/live_preflight",
    onSnapshot: n = () => {
    },
    onError: c = () => {
    }
  } = {}) {
    this.api = e, this.delay = t, this.endpoint = r, this.onSnapshot = n, this.onError = c, this.timer = null, this.abort = null, this.scheduledKey = "", this.disposed = !1, this.generation = 0;
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
      const r = await this.api.fetchApi(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
        signal: this.abort.signal
      });
      if (!r.ok)
        throw new Error(await r.text?.() || `Monitor live preflight failed (${r.status})`);
      const n = await r.json();
      return this.disposed || t !== this.generation ? null : (this.onSnapshot(n), n);
    } catch (r) {
      return !this.disposed && t === this.generation && r?.name !== "AbortError" && this.onError(r), null;
    }
  }
  dispose() {
    this.disposed = !0, this.generation += 1, clearTimeout(this.timer), this.timer = null, this.abort?.abort(), this.abort = null, this.scheduledKey = "";
  }
}
function g(o) {
  return String(o?.comfyClass || o?.constructor?.type || "");
}
function y(o, e) {
  const t = o?.inputs?.find((r) => r.name === e);
  return t?.link == null || !o?.graph ? null : _(o.graph, t.link);
}
function F(o) {
  const e = y(o, "motion_scene"), t = y(o, "playblast_video");
  return {
    sceneConnected: !!e,
    sceneOrigin: e,
    sceneNodeClass: g(e),
    playblastConnected: !!t,
    playblastOrigin: t,
    playblastNodeClass: g(t)
  };
}
class U {
  constructor(e, t, r = 250) {
    this.node = e, this.onChange = t, this.initialized = !1, this.last = "", this.timer = setInterval(() => this.poll(), r), this.poll();
  }
  poll() {
    const e = F(this.node), t = JSON.stringify([
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
async function V(o) {
  const e = await o.fetchApi("/majoor/omnicam/monitor/profiles");
  if (!e.ok) throw new Error(`Monitor profile catalog failed (${e.status})`);
  return e.json();
}
function B(o, e) {
  const t = o.querySelector('[data-role="profile-catalogue"]');
  if (!t) return;
  const r = Array.isArray(e?.profiles) ? e.profiles : [], n = Array.isArray(e?.capabilities?.capabilities) ? e.capabilities.capabilities : [], c = new Map(n.map((s) => [String(s.adapter), s]));
  t.innerHTML = r.length ? r.map((s) => {
    const d = (s.capability || c.get(String(s.id)))?.state || "missing";
    return `<div class="oc-row"><span><strong>${a(s.display_name)}</strong><br><small>${a(s.semantic)} · ${a(s.frame_policy)}</small></span><span class="oc-state" data-state="${a(d)}">${a(d)}</span></div>`;
  }).join("") : `<div class="oc-empty">${a(i("No Monitor profile is available."))}</div>`;
}
const z = `${I}
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
`, K = [
  ["external_reference_video", i("External / Generic Reference Video")],
  ["h3_api", "MiniMax H3 · Comfy API"],
  ["h3_native", "MiniMax H3 · Native"],
  ["h3_scene_coverage", "MiniMax H3 · Scene Coverage"],
  ["ltx25_motion_track", "LTX 2.5 Motion Track"],
  ["wan_camera_native", "Wan Camera Native"],
  ["wan_move_native", "Wan Move Native"],
  ["wan_track_native", "Wan Track Native"],
  ["wanvideo_ati", "WanVideo ATI"]
];
function G() {
  return K.map(([o, e]) => `<option value="${o}">${a(i(e))}</option>`).join("");
}
function J() {
  return `<div class="majoor-omnicam oc-monitor">
    <style>${z}</style>
    <header class="oc-header">${L("OmniCam Monitor")}
      <div class="oc-header-actions"><span class="oc-status-pill" data-role="monitor-status" data-state="OFFLINE"><i class="oc-status-dot"></i> ${a(i("WAITING"))}</span></div>
    </header>
    <div class="oc-source" data-role="source-status">${a(i("Connect a MotionScene and queue the workflow."))}</div>
    <main class="oc-layout">
      <section class="oc-column">
        <div class="oc-card" data-role="proxy-card"><div class="oc-section">${a(i("Playblast"))}</div><div class="oc-reference-source" data-role="reference-source" hidden></div><div class="oc-player"><video data-role="proxy-player" playsinline muted aria-label="${a(i("OmniCam playblast playback"))}"></video><div class="oc-player-empty">${a(i("No playblast preview"))}</div><canvas data-role="proxy-upstream-preview" hidden aria-label="${a(i("Connected playblast preview"))}"></canvas></div><div class="oc-player-controls"><button type="button" data-act="proxy-play" aria-label="${a(i("Play or pause playblast"))}">${a(i("Play"))}</button><input data-role="proxy-scrubber" type="range" min="0" max="0" value="0" aria-label="${a(i("Playblast frame"))}"><output data-role="proxy-frame">0 / 0</output><label><input data-role="proxy-loop" type="checkbox" checked> ${a(i("Loop"))}</label><label><input data-role="proxy-mute" type="checkbox" checked> ${a(i("Mute"))}</label></div></div>
        <div class="oc-card"><div class="oc-section">${a(i("Profile preflight"))}</div><div data-role="profile-preflight" class="oc-empty">${a(i("Queue the workflow to validate the selected profile."))}</div></div>
      </section>
      <aside class="oc-column">
        <div class="oc-card"><div class="oc-section">${a(i("Compilation target"))}</div><div class="oc-adapter-controls">
          <label class="wide">${a(i("Profile"))}<select data-role="profile-select">${G()}</select></label>
          <div class="oc-hint" data-role="h3-setup-hint" hidden>${a(i("Connect a Motion Scene and Playblast Video output to this Monitor node to compile with an H3 profile."))}</div>
          <label class="wide">${a(i("Base prompt"))}<textarea data-setting="base_prompt" rows="3"></textarea></label>
          <label>${a(i("Width"))}<input data-setting="target_width" type="number" min="64" max="4096" step="8"></label>
          <label>${a(i("Height"))}<input data-setting="target_height" type="number" min="64" max="4096" step="8"></label>
          <label>${a(i("Duration (seconds)"))}<input data-setting="duration_seconds" type="number" min="0" max="600" step="0.1" placeholder="${a(i("auto (from shot)"))}"></label>
          <label>${a(i("FPS"))}<input data-setting="target_fps" type="number" min="0" max="120" step="1" placeholder="${a(i("auto (from shot)"))}"></label>
        </div></div>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(i("Profiles"))}</summary><div data-role="profile-catalogue" class="oc-empty">${a(i("Loading the Monitor profile catalogue."))}</div></details>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(i("Installed capabilities"))}</summary><div data-role="profile-capabilities" class="oc-empty">${a(i("Capability report available after execution."))}</div></details>
        <div class="oc-card"><div class="oc-section">${a(i("Execution output"))}</div><div data-role="output-status" class="oc-empty">${a(i("OUTPUT NOT EXECUTED"))}</div></div>
      </aside>
    </main>
  </div>`;
}
function Q(o = document) {
  const e = o.createElement("div");
  return e.innerHTML = J(), e.firstElementChild;
}
const X = 250, Y = /* @__PURE__ */ new Set(["duration_seconds", "target_fps"]);
function Z(o) {
  k(o);
}
class ee {
  constructor(e) {
    this.node = e, this.root = Q(), this.events = new T(), this.source = null, this.player = new H(
      this.root.querySelector('[data-role="proxy-player"]'),
      {
        onFrame: (t) => this.showFrame(t),
        onMetadata: ({ frameCount: t }) => this.setFrameCount(t)
      }
    ), this.hasExecutedOnce = !1, this._liveUnavailableText = "", this.disposed = !1, this.connectionRefreshTimer = null, this.refreshController = new D(p, {
      onSnapshot: (t) => this.liveSnapshotReceived(t),
      onError: (t) => this.liveRefreshFailed(t)
    }), this.bindControls(), this.syncControlsFromWidgets(), this.loadProfileInfo(), this.watcher = new U(e, (t) => this.sourceChanged(t)), this.liveTimer = setInterval(() => this.liveTick(), X);
  }
  async loadProfileInfo() {
    const e = this.root.querySelector('[data-role="profile-catalogue"]');
    try {
      const t = await V(p);
      if (this.disposed) return;
      B(this.root, t);
    } catch (t) {
      e && (e.textContent = i("Monitor profile information unavailable.")), console.warn("OmniCam: Monitor profile catalog unavailable", t);
    }
  }
  bindControls() {
    this.events.on(this.root, "wheel", q(this.root)), this.events.on(this.root.querySelector('[data-act="proxy-play"]'), "click", () => this.player.toggle()), this.events.on(this.root.querySelector('[data-role="proxy-scrubber"]'), "input", (e) => this.player.scrub(e.target.value)), this.events.on(this.root.querySelector('[data-role="proxy-loop"]'), "change", (e) => this.player.setLoop(e.target.checked)), this.events.on(this.root.querySelector('[data-role="proxy-mute"]'), "change", (e) => this.player.setMuted(e.target.checked)), this.events.on(this.root.querySelector('[data-role="profile-select"]'), "change", (e) => {
      b(this.node, "target_profile", e.target.value), this.updateH3SetupHint(e.target.value), this.settingsChanged();
    });
    for (const e of this.root.querySelectorAll("[data-setting]"))
      this.events.on(e, "change", () => {
        b(this.node, e.dataset.setting, e.value), this.settingsChanged();
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
    m(this.source?.sceneOrigin) ? this.liveTick() : this.markOutdated();
  }
  updateH3SetupHint(e) {
    const t = this.root.querySelector('[data-role="h3-setup-hint"]');
    t && (t.hidden = !M(e));
  }
  syncControlsFromWidgets() {
    const e = h(this.node), t = this.root.querySelector('[data-role="profile-select"]');
    e.target_profile != null && (t.value = String(e.target_profile)), this.updateH3SetupHint(t.value);
    for (const r of O) {
      if (r === "target_profile") continue;
      const n = this.root.querySelector(`[data-setting="${r}"]`);
      !n || e[r] == null || (Y.has(r) && Number(e[r]) <= 0 ? n.value = "" : n.value = e[r]);
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
    const e = this.source?.sceneOrigin, t = m(e) ? x(e) : null, r = {
      duration_seconds: t ? i("{value} (from Director)", { value: t.duration_seconds }) : i("auto (from shot)"),
      target_fps: t ? i("{value} (from Director)", { value: t.fps }) : i("auto (from shot)")
    };
    for (const [n, c] of Object.entries(r)) {
      const s = this.root.querySelector(`[data-setting="${n}"]`);
      s && (s.placeholder = c);
    }
  }
  markOutdated() {
    this.root.querySelector('[data-role="output-status"]').textContent = i("OUTPUT OUTDATED");
  }
  sourceChanged(e) {
    if (this.disposed) return;
    this.source = e;
    const t = this.root.querySelector('[data-role="source-status"]');
    t.textContent = e.sceneConnected ? i("{source} connected · {playblast}", {
      source: e.sceneNodeClass || "MotionScene",
      playblast: e.playblastConnected ? i("Playblast: {name}", { name: e.playblastNodeClass || i("CONNECTED") }) : i("No playblast")
    }) : i("Connect a MotionScene and queue the workflow.");
    const r = this.root.querySelector('[data-role="monitor-status"]');
    r.dataset.state = e.sceneConnected ? i("CONNECTED") : "OFFLINE", r.lastChild.textContent = e.sceneConnected ? " " + i("CONNECTED") : " " + i("WAITING"), this.reflectInheritedShot(), this.refreshPlayblastPreview(), this.liveTick();
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
    if (!m(e)) {
      this.showLiveUnavailable();
      return;
    }
    const t = A(e, h(this.node)), r = t.director, n = `${r.state_json}\0${JSON.stringify(t.monitor)}\0${r.recording_path}\0${r.card_asset}\0${r.width}x${r.height}@${r.fps}/${r.duration_seconds}:${r.render_mode}`;
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
    const t = !!this.source?.sceneConnected ? i("CONNECTED — waiting for upstream execution. Queue the workflow once to see a preflight.") : i("Queue the workflow to validate the selected profile.");
    t !== this._liveUnavailableText && (this._liveUnavailableText = t, this.root.querySelector('[data-role="profile-preflight"]').innerHTML = `<div class="oc-empty">${t}</div>`);
  }
  refreshPlayblastPreview() {
    if (this.disposed) return;
    const e = this.root.querySelector('[data-role="proxy-upstream-preview"]'), t = this.root.querySelector(".oc-player-empty"), r = this.source?.playblastOrigin, n = E(p, r);
    if (this.updateReferenceSourceLabel(r, n), n) {
      e.hidden = !0, t.hidden = !0, this.player.setSource(n.url, {
        fps: n.fps,
        frameCount: n.frameCount
      });
      return;
    }
    const c = S(r);
    if (!c) {
      e.hidden = !0, t.hidden = !1, this.player.setSource("");
      return;
    }
    const u = typeof HTMLVideoElement < "u" && c instanceof HTMLVideoElement ? String(c.currentSrc || c.src || "") : "";
    if (u) {
      e.hidden = !0, t.hidden = !0, this.player.setSource(u);
      return;
    }
    this.player.setSource(""), f(c, e, 640).then((d) => {
      this.disposed || (e.hidden = !d, t.hidden = d);
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
    const r = document.createElement("canvas");
    return await f(t, r, 240) ? r.toDataURL("image/webp", 0.7) : null;
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
    const r = this.root.querySelector('[data-role="reference-source"]');
    if (!r) return;
    const n = P(t, e);
    r.textContent = n, r.hidden = !n, r.dataset.warn = N(t, e);
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
    const r = v(this.root, e);
    r.targetProfile && h(this.node).target_profile !== r.targetProfile && this.markOutdated();
  }
  executed(e) {
    this.renderResult(e, { executed: !0 });
  }
  blockedPreflight(e) {
    this.hasExecutedOnce = !0, this.renderResult(e);
  }
  dispose() {
    this.disposed || (this.disposed = !0, clearInterval(this.liveTimer), clearTimeout(this.connectionRefreshTimer), w(), this.refreshController?.dispose(), this.watcher?.dispose(), this.player.dispose(), this.events.dispose());
  }
}
function de(o) {
  if (o.__majoorOmniCamMonitorWorkbench && !o.__majoorOmniCamMonitorWorkbench.disposed)
    return o.__majoorOmniCamMonitorWorkbench;
  Z(o);
  const e = new ee(o);
  o.__majoorOmniCamMonitorWorkbench = e;
  const t = o.__majoorOmniCamMonitorRuntime;
  return t ? t.restore(e) : e.events.add(C(p, o, e)), e;
}
function pe(o) {
  o && (o.node?.__majoorOmniCamMonitorWorkbench === o && (o.node.__majoorOmniCamMonitorWorkbench = null), o.dispose());
}
export {
  pe as closeMonitorWorkbench,
  de as openMonitorWorkbench
};
