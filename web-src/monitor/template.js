import { MONITOR_STYLES } from "./styles.js";
import { brandMarkup } from "../template/brand.js";

export const PROFILE_OPTIONS = [
  ["external_reference_video", "External / Generic Reference Video"],
  ["h3_api", "MiniMax H3 · Comfy API"],
  ["h3_native", "MiniMax H3 · Native"],
  ["ltx25_motion_track", "LTX 2.5 Motion Track"],
  ["wan_camera_native", "Wan Camera Native"],
  ["wan_move_native", "Wan Move Native"],
  ["wan_track_native", "Wan Track Native"],
  ["wanvideo_ati", "WanVideo ATI"],
];

function profileOptions() {
  return PROFILE_OPTIONS
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");
}

export function monitorMarkup() {
  return `<div class="majoor-omnicam oc-monitor">
    <style>${MONITOR_STYLES}</style>
    <header class="oc-header">${brandMarkup("OmniCam Monitor")}
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
          <label class="wide">Profile<select data-role="profile-select">${profileOptions()}</select></label>
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

export function buildMonitorRoot(doc = document) {
  const wrapper = doc.createElement("div");
  wrapper.innerHTML = monitorMarkup();
  return wrapper.firstElementChild;
}
