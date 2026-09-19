import { t } from "../i18n.js";
import { escapeHtml } from "./html.js";
import { MONITOR_STYLES } from "./styles.js";
import { brandMarkup } from "../template/brand.js";

export const PROFILE_OPTIONS = [
  ["external_reference_video", t("External / Generic Reference Video")],
  ["h3_api", "MiniMax H3 · Comfy API"],
  ["h3_native", "MiniMax H3 · Native"],
  ["h3_scene_coverage", "MiniMax H3 · Scene Coverage"],
  ["ltx25_motion_track", "LTX 2.5 Motion Track"],
  ["seedance25_reference", "ByteDance Seedance 2.5 Reference"],
  ["wan_camera_native", "Wan Camera Native"],
  ["wan_move_native", "Wan Move Native"],
  ["wan_track_native", "Wan Track Native"],
  ["wanvideo_ati", "WanVideo ATI"],
];

export const GUIDE_STYLE_OPTIONS = [
  ["auto", t("Auto")],
  ["motion_proxy", t("Motion Proxy")],
  ["clay", t("Clay / White Model")],
  ["depth_rich", t("Depth Rich")],
  ["beauty_reference", t("Beauty Reference")],
  ["passthrough", t("Passthrough")],
  ["diagnostic", t("Diagnostic")],
];

function guideStyleOptions() {
  return GUIDE_STYLE_OPTIONS
    .map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`)
    .join("");
}

function profileOptions() {
  return PROFILE_OPTIONS
    .map(([value, label]) => `<option value="${value}">${escapeHtml(t(label))}</option>`)
    .join("");
}

export function monitorMarkup() {
  return `<div class="majoor-omnicam oc-monitor">
    <style>${MONITOR_STYLES}</style>
    <header class="oc-header">${brandMarkup("OmniCam Monitor")}
      <div class="oc-header-actions"><span class="oc-status-pill" data-role="monitor-status" data-state="OFFLINE"><i class="oc-status-dot"></i> ${escapeHtml(t("WAITING"))}</span></div>
    </header>
    <div class="oc-source" data-role="source-status">${escapeHtml(t("Connect a MotionScene and queue the workflow."))}</div>
    <main class="oc-layout">
      <section class="oc-column">
        <div class="oc-card"><div class="oc-prompt-head"><span class="oc-section">${escapeHtml(t("Compiled Prompt"))}</span><button type="button" class="icon-button" data-act="copy-compiled-prompt" title="${escapeHtml(t("Copy"))}"><i class="pi pi-copy"></i></button></div><div data-role="compiled-prompt" class="oc-prompt-text oc-empty" data-empty="1">${escapeHtml(t("Queue the workflow, or edit the connected Director live, to compile a prompt."))}</div></div>
        <div class="oc-card" data-role="proxy-card"><div class="oc-section">${escapeHtml(t("Playblast"))}</div><div class="oc-reference-source" data-role="reference-source" hidden></div><div class="oc-player"><video data-role="proxy-player" playsinline muted aria-label="${escapeHtml(t("OmniCam playblast playback"))}"></video><div class="oc-player-empty">${escapeHtml(t("No playblast preview"))}</div><canvas data-role="proxy-upstream-preview" hidden aria-label="${escapeHtml(t("Connected playblast preview"))}"></canvas></div><div class="oc-player-controls"><button type="button" data-act="proxy-play" aria-label="${escapeHtml(t("Play or pause playblast"))}">${escapeHtml(t("Play"))}</button><input data-role="proxy-scrubber" type="range" min="0" max="0" value="0" aria-label="${escapeHtml(t("Playblast frame"))}"><output data-role="proxy-frame">0 / 0</output><label><input data-role="proxy-loop" type="checkbox" checked> ${escapeHtml(t("Loop"))}</label><label><input data-role="proxy-mute" type="checkbox" checked> ${escapeHtml(t("Mute"))}</label></div></div>
        <div class="oc-card"><div class="oc-section">${escapeHtml(t("Profile preflight"))}</div><div data-role="profile-preflight" class="oc-empty">${escapeHtml(t("Queue the workflow to validate the selected profile."))}</div></div>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${escapeHtml(t("Compilation Diff"))}</summary><div data-role="profile-diff" class="oc-empty">${escapeHtml(t("No mapping-quality diagnostics yet."))}</div></details>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${escapeHtml(t("Guide Health"))}</summary><div data-role="profile-health" class="oc-empty">${escapeHtml(t("No guide-health warnings yet."))}</div></details>
      </section>
      <aside class="oc-column">
        <div class="oc-card"><div class="oc-section">${escapeHtml(t("Compilation target"))}</div><div class="oc-adapter-controls">
          <label class="wide">${escapeHtml(t("Profile"))}<select data-role="profile-select">${profileOptions()}</select></label>
          <div class="oc-hint" data-role="h3-setup-hint" hidden>${escapeHtml(t("Connect a Motion Scene and Playblast Video output to this Monitor node to compile with an H3 profile."))}</div>
          <label class="wide">${escapeHtml(t("Base prompt"))}<textarea data-setting="base_prompt" rows="3"></textarea></label>
          <label>${escapeHtml(t("Width"))}<input data-setting="target_width" type="number" min="64" max="4096" step="8"></label>
          <label>${escapeHtml(t("Height"))}<input data-setting="target_height" type="number" min="64" max="4096" step="8"></label>
          <label>${escapeHtml(t("Duration (seconds)"))}<input data-setting="duration_seconds" type="number" min="0" max="600" step="0.1" placeholder="${escapeHtml(t("auto (from shot)"))}"></label>
          <label>${escapeHtml(t("FPS"))}<input data-setting="target_fps" type="number" min="0" max="120" step="1" placeholder="${escapeHtml(t("auto (from shot)"))}"></label>
          <label>${escapeHtml(t("Guide reference index"))}<input data-setting="guide_reference_index" type="number" min="1" max="10" step="1"></label>
          <label>${escapeHtml(t("Guide style"))}<select data-setting="guide_style">${guideStyleOptions()}</select></label>
        </div></div>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${escapeHtml(t("Reference Role Matrix"))}</summary>
          <div class="oc-hint">${escapeHtml(t("Declare references OmniCam does not own the media for (an identity image, an action video...). Compiled into the prompt alongside the OmniCam guide."))}</div>
          <div data-role="reference-matrix-rows" class="oc-empty">${escapeHtml(t("No additional references declared."))}</div>
          <button type="button" class="oc-add-reference" data-act="reference-matrix-add">${escapeHtml(t("Add reference"))}</button>
          <textarea data-setting="reference_plan_json" hidden></textarea>
        </details>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${escapeHtml(t("Profiles"))}</summary><div data-role="profile-catalogue" class="oc-empty">${escapeHtml(t("Loading the Monitor profile catalogue."))}</div></details>
        <details class="oc-card oc-collapsible"><summary class="oc-section">${escapeHtml(t("Installed capabilities"))}</summary><div data-role="profile-capabilities" class="oc-empty">${escapeHtml(t("Capability report available after execution."))}</div></details>
        <div class="oc-card"><div class="oc-section">${escapeHtml(t("Execution output"))}</div><div data-role="output-status" class="oc-empty">${escapeHtml(t("OUTPUT NOT EXECUTED"))}</div></div>
      </aside>
    </main>
  </div>`;
}

export function buildMonitorRoot(doc = document) {
  const wrapper = doc.createElement("div");
  wrapper.innerHTML = monitorMarkup();
  return wrapper.firstElementChild;
}
