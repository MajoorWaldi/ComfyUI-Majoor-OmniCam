import { v as i, z as W } from "./chunk-Cg3_Iw1A.js";
import { l as U, S as F, b as z, p as V, u as B, d as G } from "./chunk-DbDvB9Ll.js";
import "../../scripts/app.js";
import { api as m } from "../../scripts/api.js";
import { e as a, a as L, d as K, b as J, r as Q } from "./chunk-DfmZyiNh.js";
import { M as Y, E as X } from "./chunk-CbqXtcpr.js";
function g(t) {
  return Array.isArray(t) && t.length === 1 ? t[0] : t;
}
function Z(t) {
  const e = t?.ui && typeof t.ui == "object" ? t.ui : t || {}, o = Array.isArray(e.preflight) && e.preflight.length === 1 && Array.isArray(e.preflight[0]) ? e.preflight[0] : e.preflight, r = g(e.capabilities), n = g(e.target_profile), s = g(e.final_prompt);
  return {
    targetProfile: typeof n == "string" ? n : "",
    finalPrompt: typeof s == "string" ? s : "",
    preflight: Array.isArray(o) ? o : [],
    capabilities: r && typeof r == "object" ? r : { capabilities: [] }
  };
}
function A(t) {
  return !Array.isArray(t.suggestions) || !t.suggestions.length ? "" : `<ul class="oc-suggestions">${t.suggestions.map((e) => `<li>${a(e)}</li>`).join("")}</ul>`;
}
function C(t) {
  const e = L(t.state), o = t.message ? `<br><small>${a(t.message)}</small>` : "", r = t.recoverable ? ` <span class="oc-recoverable">${a(i("recoverable"))}</span>` : "";
  return `<div class="oc-row"${t.code ? ` data-code="${a(t.code)}"` : ""}><span><strong>${a(t.label || t.id)}</strong>${r}${o}${A(t)}</span><span class="oc-state" data-state="${e}">${a(t.state || "UNKNOWN")}</span></div>`;
}
function ee(t) {
  const e = t.message ? `<br><small>${a(t.message)}</small>` : "";
  return `<div class="oc-row"><span><strong>${a(t.label || t.id)}</strong>${e}${A(t)}</span><span class="oc-mapping-quality" data-quality="${a(t.mapping_quality)}">${a(t.mapping_quality)}</span></div>`;
}
function E(t) {
  return String(t.id || "").startsWith("guide_health_");
}
function te(t, e, o = !1) {
  const r = o ? t ? i("LIVE — WOULD BLOCK") : i("LIVE PREVIEW") : t ? i("NO OUTPUT") : i("OUTPUT GENERATED");
  return e ? `${r} · ${e}` : r;
}
function T(t, e, { live: o = !1 } = {}) {
  const r = Z(e), n = r.preflight.filter((d) => d.mapping_quality), s = r.preflight.filter(E), c = r.preflight.filter((d) => !d.mapping_quality && !E(d)), l = t.querySelector('[data-role="compiled-prompt"]');
  l && (r.finalPrompt ? (l.textContent = r.finalPrompt, l.classList.remove("oc-empty"), l.dataset.empty = "0") : (l.textContent = i("Queue the workflow, or edit the connected Director live, to compile a prompt."), l.classList.add("oc-empty"), l.dataset.empty = "1"));
  const p = t.querySelector('[data-role="profile-preflight"]');
  p.innerHTML = c.length ? c.map(C).join("") : `<div class="oc-empty">${a(i("No preflight checks returned."))}</div>`;
  const w = t.querySelector('[data-role="profile-diff"]');
  w && (w.innerHTML = n.length ? n.map(ee).join("") : `<div class="oc-empty">${a(i("No mapping-quality diagnostics for this compile."))}</div>`);
  const _ = t.querySelector('[data-role="profile-health"]');
  _ && (_.innerHTML = s.length ? s.map(C).join("") : `<div class="oc-empty">${a(i("No guide-health warnings."))}</div>`);
  const S = Array.isArray(r.capabilities.capabilities) ? r.capabilities.capabilities : [], H = t.querySelector('[data-role="profile-capabilities"]');
  H.innerHTML = S.length ? S.map((d) => `<div class="oc-row"><span>${a(d.display || d.adapter)}</span><span class="oc-state" data-state="${L(d.state)}">${a(d.state)}</span></div>`).join("") : `<div class="oc-empty">${a(i("No optional downstream capability detected."))}</div>`;
  const f = r.preflight.some((d) => String(d.state).toUpperCase() === i("BLOCKED")), $ = t.querySelector('[data-role="monitor-status"]');
  return $.dataset.state = f ? i("BLOCKED") : i("READY"), $.lastChild.textContent = f ? " " + i("BLOCKED") : " " + i("READY"), t.querySelector('[data-role="output-status"]').textContent = te(f, r.targetProfile, o), r;
}
const oe = "MajoorOmniCamDirector";
function re(t) {
  return String(t?.comfyClass || t?.constructor?.type || "");
}
function u(t, e, o) {
  const r = t?.widgets?.find((n) => n.name === e);
  return r && r.value !== void 0 ? r.value : o;
}
function y(t) {
  return re(t) === oe;
}
function j(t) {
  return {
    state_json: String(u(t, "state_json", "{}")),
    recording_path: String(u(t, "recording_path", "")),
    card_asset: String(u(t, "card_asset", "")),
    width: Number(u(t, "width", 1280)),
    height: Number(u(t, "height", 720)),
    fps: Number(u(t, "fps", 24)),
    duration_seconds: Number(u(t, "duration_seconds", 5)),
    render_mode: String(u(t, "render_mode", "omni_ref"))
  };
}
function ie(t) {
  return {
    target_profile: String(t?.target_profile ?? ""),
    base_prompt: String(t?.base_prompt ?? ""),
    target_width: Number(t?.target_width ?? 832),
    target_height: Number(t?.target_height ?? 480),
    // 0 tells the backend to inherit the connected shot's duration / fps.
    duration_seconds: Number(t?.duration_seconds ?? 0),
    target_fps: Number(t?.target_fps ?? 0),
    guide_reference_index: Number(t?.guide_reference_index ?? 0),
    guide_style: String(t?.guide_style ?? ""),
    reference_plan_json: String(t?.reference_plan_json ?? "")
  };
}
function ae(t, e) {
  return {
    director: j(t),
    monitor: ie(e)
  };
}
class ne extends Y {
  constructor(e, { fps: o = 24, durationFrames: r = 1, onFrame: n = () => {
  } } = {}) {
    super(e, { fps: o, durationFrames: r, onFrame: n, loop: !0, muted: !0 });
  }
}
class se {
  constructor(e, {
    delay: o = 250,
    endpoint: r = "/majoor/omnicam/monitor/live_preflight",
    onSnapshot: n = () => {
    },
    onError: s = () => {
    }
  } = {}) {
    this.api = e, this.delay = o, this.endpoint = r, this.onSnapshot = n, this.onError = s, this.timer = null, this.abort = null, this.scheduledKey = "", this.disposed = !1, this.generation = 0;
  }
  /** No-ops when this exact payload is already scheduled or was just sent. */
  schedule(e) {
    if (this.disposed) return;
    const o = JSON.stringify(e);
    o !== this.scheduledKey && (this.scheduledKey = o, clearTimeout(this.timer), this.timer = setTimeout(() => this.refresh(e), this.delay));
  }
  async refresh(e) {
    if (this.disposed) return null;
    this.abort?.abort(), this.abort = new AbortController();
    const o = ++this.generation;
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
      return this.disposed || o !== this.generation ? null : (this.onSnapshot(n), n);
    } catch (r) {
      return !this.disposed && o === this.generation && r?.name !== "AbortError" && this.onError(r), null;
    }
  }
  dispose() {
    this.disposed = !0, this.generation += 1, clearTimeout(this.timer), this.timer = null, this.abort?.abort(), this.abort = null, this.scheduledKey = "";
  }
}
function M(t) {
  return String(t?.comfyClass || t?.constructor?.type || "");
}
function O(t, e) {
  const o = t?.inputs?.find((r) => r.name === e);
  return o?.link == null || !t?.graph ? null : U(t.graph, o.link);
}
function ce(t) {
  const e = O(t, "motion_scene"), o = O(t, "playblast_video");
  return {
    sceneConnected: !!e,
    sceneOrigin: e,
    sceneNodeClass: M(e),
    playblastConnected: !!o,
    playblastOrigin: o,
    playblastNodeClass: M(o)
  };
}
class le {
  constructor(e, o, r = 250) {
    this.node = e, this.onChange = o, this.initialized = !1, this.last = "", this.timer = setInterval(() => this.poll(), r), this.poll();
  }
  poll() {
    const e = ce(this.node), o = JSON.stringify([
      e.sceneOrigin?.id ?? null,
      e.playblastOrigin?.id ?? null,
      e.playblastOrigin?.imageIndex ?? null
    ]);
    return this.initialized && o === this.last ? !1 : (this.initialized = !0, this.last = o, this.onChange(e), !0);
  }
  dispose() {
    clearInterval(this.timer), this.timer = null;
  }
}
async function de(t) {
  const e = await t.fetchApi("/majoor/omnicam/monitor/profiles");
  if (!e.ok) throw new Error(`Monitor profile catalog failed (${e.status})`);
  return e.json();
}
function pe(t, e) {
  const o = t.querySelector('[data-role="profile-catalogue"]');
  if (!o) return;
  const r = Array.isArray(e?.profiles) ? e.profiles : [], n = Array.isArray(e?.capabilities?.capabilities) ? e.capabilities.capabilities : [], s = new Map(n.map((c) => [String(c.adapter), c]));
  o.innerHTML = r.length ? r.map((c) => {
    const p = (c.capability || s.get(String(c.id)))?.state || "missing";
    return `<div class="oc-row"><span><strong>${a(c.display_name)}</strong><br><small>${a(c.semantic)} · ${a(c.frame_policy)}</small></span><span class="oc-state" data-state="${a(p)}">${a(p)}</span></div>`;
  }).join("") : `<div class="oc-empty">${a(i("No Monitor profile is available."))}</div>`;
}
const k = "majoor.omnicam.monitor.preflight", ue = 1;
function me(t, e, o) {
  const r = (n) => {
    const s = n?.detail;
    !s || Number(s.schema_version) !== ue || s.kind === "blocked_preflight" && String(s.node) === String(e.id) && (!s.output || o.disposed || o.blockedPreflight(s.output));
  };
  return t.addEventListener(k, r), () => {
    t.removeEventListener?.(k, r);
  };
}
const N = [
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
], P = ["image", "video", "audio"];
function R(t, e) {
  const o = new Set(Array.isArray(e) ? e : []);
  return t.map((r) => `<option value="${r}"${o.has(r) ? " selected" : ""}>${a(r)}</option>`).join("");
}
function he(t) {
  const e = P.includes(t.media_type) ? t.media_type : "image";
  return `<div class="oc-reference-row" data-role="reference-row">
    <input type="text" data-field="id" placeholder="${a(i("id"))}" value="${a(t.id || "")}">
    <select data-field="media_type">${P.map((o) => `<option value="${o}"${e === o ? " selected" : ""}>${a(o)}</option>`).join("")}</select>
    <input type="number" min="1" max="30" data-field="slot_hint" placeholder="1" value="${t.slot_hint || ""}">
    <select data-field="roles" multiple size="4" title="${a(i("Roles this reference is declared for"))}">${R(N, t.roles)}</select>
    <select data-field="ignore" multiple size="4" title="${a(i("Roles this reference explicitly does not carry"))}">${R(N, t.ignore)}</select>
    <button type="button" class="oc-remove-reference" data-act="reference-row-remove" aria-label="${a(i("Remove reference"))}">✕</button>
  </div>`;
}
function q(t, e) {
  const o = t.querySelector('[data-role="reference-matrix-rows"]');
  o && (o.innerHTML = e.length ? e.map(he).join("") : `<div class="oc-empty">${a(i("No additional references declared."))}</div>`);
}
function I(t) {
  return t ? [...t.selectedOptions].map((e) => e.value) : [];
}
function v(t) {
  return [...t.querySelectorAll('[data-role="reference-row"]')].map((e) => {
    const o = e.querySelector('[data-field="id"]')?.value.trim() || "", r = e.querySelector('[data-field="media_type"]')?.value || "image", n = e.querySelector('[data-field="slot_hint"]')?.value || "", s = I(e.querySelector('[data-field="roles"]')), c = I(e.querySelector('[data-field="ignore"]')), l = { id: o, media_type: r, roles: s };
    return n && (l.slot_hint = Number(n)), c.length && (l.ignore = c), l;
  }).filter((e) => e.id);
}
function fe(t) {
  const e = String(t || "").trim();
  if (!e) return [];
  try {
    const o = JSON.parse(e);
    return Array.isArray(o) ? o : [];
  } catch {
    return [];
  }
}
const ge = `${F}
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
  .oc-monitor .oc-prompt-head{display:flex;justify-content:space-between;align-items:center;gap:8px}
  .oc-monitor .oc-prompt-text{white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;line-height:1.5;max-height:220px;overflow:auto;padding:8px;background:var(--oc-sunken);border-radius:6px;margin-top:6px}
  .oc-monitor .icon-button{padding:3px 6px}
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
`, ye = [
  ["external_reference_video", i("External / Generic Reference Video")],
  ["h3_api", "MiniMax H3 · Comfy API"],
  ["h3_native", "MiniMax H3 · Native"],
  ["h3_scene_coverage", "MiniMax H3 · Scene Coverage"],
  ["ltx25_motion_track", "LTX 2.5 Motion Track"],
  ["seedance25_reference", "ByteDance Seedance 2.5 Reference"],
  ["wan_camera_native", "Wan Camera Native"],
  ["wan_move_native", "Wan Move Native"],
  ["wan_track_native", "Wan Track Native"],
  ["wanvideo_ati", "WanVideo ATI"]
], ve = [
  ["auto", i("Auto")],
  ["motion_proxy", i("Motion Proxy")],
  ["clay", i("Clay / White Model")],
  ["depth_rich", i("Depth Rich")],
  ["beauty_reference", i("Beauty Reference")],
  ["passthrough", i("Passthrough")],
  ["diagnostic", i("Diagnostic")]
];
function be() {
  return ve.map(([t, e]) => `<option value="${t}">${a(e)}</option>`).join("");
}
function xe() {
  return ye.map(([t, e]) => `<option value="${t}">${a(i(e))}</option>`).join("");
}
function we() {
  return `<div class="majoor-omnicam oc-monitor">
    <style>${ge}</style>
    <header class="oc-header">${z("OmniCam Monitor")}
      <div class="oc-header-actions"><span class="oc-status-pill" data-role="monitor-status" data-state="OFFLINE"><i class="oc-status-dot"></i> ${a(i("WAITING"))}</span></div>
    </header>
    <div class="oc-source" data-role="source-status">${a(i("Connect a MotionScene and queue the workflow."))}</div>
    <main class="oc-layout">
      <section class="oc-column">
        <div class="oc-card"><div class="oc-prompt-head"><span class="oc-section">${a(i("Compiled Prompt"))}</span><button type="button" class="icon-button" data-act="copy-compiled-prompt" title="${a(i("Copy"))}"><i class="pi pi-copy"></i></button></div><div data-role="compiled-prompt" class="oc-prompt-text oc-empty" data-empty="1">${a(i("Queue the workflow, or edit the connected Director live, to compile a prompt."))}</div></div>
        <div class="oc-card" data-role="proxy-card"><div class="oc-section">${a(i("Playblast"))}</div><div class="oc-reference-source" data-role="reference-source" hidden></div><div class="oc-player"><video data-role="proxy-player" playsinline muted aria-label="${a(i("OmniCam playblast playback"))}"></video><div class="oc-player-empty">${a(i("No playblast preview"))}</div><canvas data-role="proxy-upstream-preview" hidden aria-label="${a(i("Connected playblast preview"))}"></canvas></div><div class="oc-player-controls"><button type="button" data-act="proxy-play" aria-label="${a(i("Play or pause playblast"))}">${a(i("Play"))}</button><input data-role="proxy-scrubber" type="range" min="0" max="0" value="0" aria-label="${a(i("Playblast frame"))}"><output data-role="proxy-frame">0 / 0</output><label><input data-role="proxy-loop" type="checkbox" checked> ${a(i("Loop"))}</label><label><input data-role="proxy-mute" type="checkbox" checked> ${a(i("Mute"))}</label></div></div>
        <div class="oc-card"><div class="oc-section">${a(i("Profile preflight"))}</div><div data-role="profile-preflight" class="oc-empty">${a(i("Queue the workflow to validate the selected profile."))}</div></div>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(i("Compilation Diff"))}</summary><div data-role="profile-diff" class="oc-empty">${a(i("No mapping-quality diagnostics yet."))}</div></details>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(i("Guide Health"))}</summary><div data-role="profile-health" class="oc-empty">${a(i("No guide-health warnings yet."))}</div></details>
      </section>
      <aside class="oc-column">
        <div class="oc-card"><div class="oc-section">${a(i("Compilation target"))}</div><div class="oc-adapter-controls">
          <label class="wide">${a(i("Profile"))}<select data-role="profile-select">${xe()}</select></label>
          <div class="oc-hint" data-role="h3-setup-hint" hidden>${a(i("Connect a Motion Scene and Playblast Video output to this Monitor node to compile with an H3 profile."))}</div>
          <label class="wide">${a(i("Base prompt"))}<textarea data-setting="base_prompt" rows="3"></textarea></label>
          <label>${a(i("Width"))}<input data-setting="target_width" type="number" min="64" max="4096" step="8"></label>
          <label>${a(i("Height"))}<input data-setting="target_height" type="number" min="64" max="4096" step="8"></label>
          <label>${a(i("Duration (seconds)"))}<input data-setting="duration_seconds" type="number" min="0" max="600" step="0.1" placeholder="${a(i("auto (from shot)"))}"></label>
          <label>${a(i("FPS"))}<input data-setting="target_fps" type="number" min="0" max="120" step="1" placeholder="${a(i("auto (from shot)"))}"></label>
          <label>${a(i("Guide reference index"))}<input data-setting="guide_reference_index" type="number" min="1" max="10" step="1"></label>
          <label>${a(i("Guide style"))}<select data-setting="guide_style">${be()}</select></label>
        </div></div>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(i("Reference Role Matrix"))}</summary>
          <div class="oc-hint">${a(i("Declare references OmniCam does not own the media for (an identity image, an action video...). Compiled into the prompt alongside the OmniCam guide."))}</div>
          <div data-role="reference-matrix-rows" class="oc-empty">${a(i("No additional references declared."))}</div>
          <button type="button" class="oc-add-reference" data-act="reference-matrix-add">${a(i("Add reference"))}</button>
          <textarea data-setting="reference_plan_json" hidden></textarea>
        </details>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(i("Profiles"))}</summary><div data-role="profile-catalogue" class="oc-empty">${a(i("Loading the Monitor profile catalogue."))}</div></details>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${a(i("Installed capabilities"))}</summary><div data-role="profile-capabilities" class="oc-empty">${a(i("Capability report available after execution."))}</div></details>
        <div class="oc-card"><div class="oc-section">${a(i("Execution output"))}</div><div data-role="output-status" class="oc-empty">${a(i("OUTPUT NOT EXECUTED"))}</div></div>
      </aside>
    </main>
  </div>`;
}
function _e(t = document) {
  const e = t.createElement("div");
  return e.innerHTML = we(), e.firstElementChild;
}
const h = [
  "base_prompt",
  "target_profile",
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps",
  "guide_reference_index",
  "guide_style",
  "reference_plan_json"
];
function Se(t) {
  for (const e of t.widgets || [])
    h.includes(e.name) && (e.computeSize = () => [0, -4], e.draw = () => {
    }, e.hidden = !0, e.options = { ...e.options || {}, hideInVueNodes: !0 });
}
const $e = /* @__PURE__ */ new Set([
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps",
  "guide_reference_index"
]);
function D(t, e) {
  return t?.widgets?.find((o) => o.name === e);
}
function b(t) {
  return Object.fromEntries(h.map((e) => [e, D(t, e)?.value]));
}
function x(t, e, o) {
  if (!h.includes(e)) return !1;
  const r = D(t, e);
  return r ? (r.value = $e.has(e) ? Number(o) : o, r.callback?.(r.value), !0) : !1;
}
function Ce(t) {
  return String(t || "").startsWith("h3_");
}
const Ee = 250, Te = /* @__PURE__ */ new Set(["duration_seconds", "target_fps"]);
function Me(t) {
  Se(t);
}
class Oe {
  constructor(e) {
    this.node = e, this.root = _e(), this.events = new X(), this.source = null, this.player = new ne(
      this.root.querySelector('[data-role="proxy-player"]'),
      {
        onFrame: (o) => this.showFrame(o),
        onMetadata: ({ frameCount: o }) => this.setFrameCount(o)
      }
    ), this.hasExecutedOnce = !1, this._liveUnavailableText = "", this.disposed = !1, this.connectionRefreshTimer = null, this.refreshController = new se(m, {
      onSnapshot: (o) => this.liveSnapshotReceived(o),
      onError: (o) => this.liveRefreshFailed(o)
    }), this.bindControls(), this.syncControlsFromWidgets(), this.loadProfileInfo(), this.watcher = new le(e, (o) => this.sourceChanged(o)), this.liveTimer = setInterval(() => this.liveTick(), Ee);
  }
  async loadProfileInfo() {
    const e = this.root.querySelector('[data-role="profile-catalogue"]');
    try {
      const o = await de(m);
      if (this.disposed) return;
      pe(this.root, o);
    } catch (o) {
      e && (e.textContent = i("Monitor profile information unavailable.")), console.warn("OmniCam: Monitor profile catalog unavailable", o);
    }
  }
  bindControls() {
    this.events.on(this.root, "wheel", V(this.root)), this.events.on(this.root.querySelector('[data-act="copy-compiled-prompt"]'), "click", (o) => this.copyCompiledPrompt(o.currentTarget)), this.events.on(this.root.querySelector('[data-act="proxy-play"]'), "click", () => this.player.toggle()), this.events.on(this.root.querySelector('[data-role="proxy-scrubber"]'), "input", (o) => this.player.scrub(o.target.value)), this.events.on(this.root.querySelector('[data-role="proxy-loop"]'), "change", (o) => this.player.setLoop(o.target.checked)), this.events.on(this.root.querySelector('[data-role="proxy-mute"]'), "change", (o) => this.player.setMuted(o.target.checked)), this.events.on(this.root.querySelector('[data-role="profile-select"]'), "change", (o) => {
      x(this.node, "target_profile", o.target.value), this.updateH3SetupHint(o.target.value), this.settingsChanged();
    });
    for (const o of this.root.querySelectorAll("[data-setting]"))
      this.events.on(o, "change", () => {
        x(this.node, o.dataset.setting, o.value), this.settingsChanged();
      });
    this.events.on(this.root.querySelector('[data-act="reference-matrix-add"]'), "click", () => {
      const o = v(this.root);
      o.push({ id: `reference_${o.length + 1}`, media_type: "image", roles: [] }), this.syncReferenceMatrix(o);
    });
    const e = this.root.querySelector('[data-role="reference-matrix-rows"]');
    this.events.on(e, "click", (o) => {
      const r = o.target.closest('[data-act="reference-row-remove"]');
      if (!r) return;
      const n = r.closest('[data-role="reference-row"]'), c = [...this.root.querySelectorAll('[data-role="reference-row"]')].indexOf(n), l = v(this.root);
      c >= 0 && l.splice(c, 1), this.syncReferenceMatrix(l);
    }), this.events.on(e, "change", (o) => {
      o.target.closest('[data-role="reference-row"]') && this.commitReferenceMatrix(v(this.root));
    });
  }
  /** Repaints the matrix rows from `specs`, then commits. Only for add/remove. */
  syncReferenceMatrix(e) {
    q(this.root, e), this.commitReferenceMatrix(e);
  }
  /** Serializes `specs` into the hidden reference_plan_json widget and
   * schedules a fresh preflight, without touching the rendered rows. */
  commitReferenceMatrix(e) {
    x(this.node, "reference_plan_json", JSON.stringify(e)), this.settingsChanged();
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
    y(this.source?.sceneOrigin) ? this.liveTick() : this.markOutdated();
  }
  updateH3SetupHint(e) {
    const o = this.root.querySelector('[data-role="h3-setup-hint"]');
    o && (o.hidden = !Ce(e));
  }
  syncControlsFromWidgets() {
    const e = b(this.node), o = this.root.querySelector('[data-role="profile-select"]');
    e.target_profile != null && (o.value = String(e.target_profile)), this.updateH3SetupHint(o.value);
    for (const r of h) {
      if (r === "target_profile") continue;
      const n = this.root.querySelector(`[data-setting="${r}"]`);
      !n || e[r] == null || (Te.has(r) && Number(e[r]) <= 0 ? n.value = "" : n.value = e[r]);
    }
    q(this.root, fe(e.reference_plan_json)), this.reflectInheritedShot();
  }
  /**
   * Fill the placeholder of any "auto" (left-blank) duration / fps field with
   * the value the compile will actually inherit from the connected Director,
   * so the number is visible without being typed. Only a Director exposes its
   * shot client-side; a third-party MotionScene still compiles correctly (the
   * backend inherits from the scene) but cannot be previewed here.
   */
  reflectInheritedShot() {
    const e = this.source?.sceneOrigin, o = y(e) ? j(e) : null, r = {
      duration_seconds: o ? i("{value} (from Director)", { value: o.duration_seconds }) : i("auto (from shot)"),
      target_fps: o ? i("{value} (from Director)", { value: o.fps }) : i("auto (from shot)")
    };
    for (const [n, s] of Object.entries(r)) {
      const c = this.root.querySelector(`[data-setting="${n}"]`);
      c && (c.placeholder = s);
    }
  }
  markOutdated() {
    this.root.querySelector('[data-role="output-status"]').textContent = i("OUTPUT OUTDATED");
  }
  async copyCompiledPrompt(e) {
    const o = this.root.querySelector('[data-role="compiled-prompt"]');
    if (!o || o.dataset.empty === "1") return;
    try {
      await navigator.clipboard.writeText(o.textContent);
    } catch {
      return;
    }
    if (!e) return;
    const r = e.querySelector("i"), n = r ? r.className : "";
    e.title = i("Copied"), r && (r.className = "pi pi-check"), setTimeout(() => {
      e.title = i("Copy"), r && (r.className = n);
    }, 1200);
  }
  sourceChanged(e) {
    if (this.disposed) return;
    this.source = e;
    const o = this.root.querySelector('[data-role="source-status"]');
    o.textContent = e.sceneConnected ? i("{source} connected · {playblast}", {
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
    if (!y(e)) {
      this.showLiveUnavailable();
      return;
    }
    const o = ae(e, b(this.node)), r = o.director, n = `${r.state_json}\0${JSON.stringify(o.monitor)}\0${r.recording_path}\0${r.card_asset}\0${r.width}x${r.height}@${r.fps}/${r.duration_seconds}:${r.render_mode}`;
    n !== this._liveKey && (this._liveKey = n, this.refreshController.schedule(o));
  }
  liveSnapshotReceived(e) {
    this.disposed || T(this.root, e, { live: !0 });
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
    const o = !!this.source?.sceneConnected ? i("CONNECTED — waiting for upstream execution. Queue the workflow once to see a preflight.") : i("Queue the workflow to validate the selected profile.");
    o !== this._liveUnavailableText && (this._liveUnavailableText = o, this.root.querySelector('[data-role="profile-preflight"]').innerHTML = `<div class="oc-empty">${o}</div>`);
  }
  refreshPlayblastPreview() {
    if (this.disposed) return;
    const e = this.root.querySelector('[data-role="proxy-upstream-preview"]'), o = this.root.querySelector(".oc-player-empty"), r = this.source?.playblastOrigin, n = K(m, r);
    if (this.updateReferenceSourceLabel(r, n), n) {
      e.hidden = !0, o.hidden = !0, this.player.setSource(n.url, {
        fps: n.fps,
        frameCount: n.frameCount
      });
      return;
    }
    const s = B(r);
    if (!s) {
      e.hidden = !0, o.hidden = !1, this.player.setSource("");
      return;
    }
    const l = typeof HTMLVideoElement < "u" && s instanceof HTMLVideoElement ? String(s.currentSrc || s.src || "") : "";
    if (l) {
      e.hidden = !0, o.hidden = !0, this.player.setSource(l);
      return;
    }
    this.player.setSource(""), G(s, e, 640).then((p) => {
      this.disposed || (e.hidden = !p, o.hidden = p);
    });
  }
  updateReferenceSourceLabel(e, o) {
    const r = this.root.querySelector('[data-role="reference-source"]');
    if (!r) return;
    const n = J(o, e);
    r.textContent = n, r.hidden = !n, r.dataset.warn = Q(o, e);
  }
  setFrameCount(e) {
    const o = this.root.querySelector('[data-role="proxy-scrubber"]');
    o.max = Math.max(0, Number(e || 1) - 1);
  }
  showFrame(e) {
    const o = Math.max(0, Number(this.player.frameCount || 1) - 1);
    this.root.querySelector('[data-role="proxy-scrubber"]').value = e, this.root.querySelector('[data-role="proxy-frame"]').textContent = `${e} / ${o}`;
  }
  renderResult(e, { executed: o = !1 } = {}) {
    o && (this.hasExecutedOnce = !0);
    const r = T(this.root, e);
    r.targetProfile && b(this.node).target_profile !== r.targetProfile && this.markOutdated();
  }
  executed(e) {
    this.renderResult(e, { executed: !0 });
  }
  blockedPreflight(e) {
    this.hasExecutedOnce = !0, this.renderResult(e);
  }
  dispose() {
    this.disposed || (this.disposed = !0, clearInterval(this.liveTimer), clearTimeout(this.connectionRefreshTimer), W(), this.refreshController?.dispose(), this.watcher?.dispose(), this.player.dispose(), this.events.dispose());
  }
}
function Le(t) {
  if (t.__majoorOmniCamMonitor) return;
  Me(t);
  const e = new Oe(t), o = me(m, t, e);
  e.events.add(o), t.__majoorOmniCamMonitor = e;
  const r = () => Math.max(620, e.root.scrollHeight || 0);
  t.addDOMWidget("majoor_omnicam_monitor", "omnicam", e.root, {
    serialize: !1,
    hideOnZoom: !1,
    getMinHeight: () => 620,
    getHeight: r,
    getMaxHeight: r
  });
  const n = t.onRemoved;
  t.onRemoved = function() {
    e.dispose(), n?.apply(this, arguments);
  };
  const s = t.onExecuted;
  t.onExecuted = function(p) {
    s?.apply(this, arguments), e.executed(p);
  };
  const c = t.onConfigure;
  t.onConfigure = function() {
    c?.apply(this, arguments), e.syncControlsFromWidgets();
  };
  const l = t.onConnectionsChange;
  t.onConnectionsChange = function() {
    l?.apply(this, arguments), !e.disposed && (e.watcher?.poll(), e.refreshPlayblastPreview(), clearTimeout(e.connectionRefreshTimer), e.connectionRefreshTimer = setTimeout(() => {
      e.connectionRefreshTimer = null, e.refreshPlayblastPreview();
    }, 400));
  };
}
export {
  Le as attachMonitor
};
