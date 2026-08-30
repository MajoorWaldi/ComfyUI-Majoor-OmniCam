import { MONITOR_STYLES } from "./styles.js";
import { brandMarkup } from "../template/brand.js";

export function monitorMarkup() {
  return `<div class="majoor-omnicam oc-monitor">
    <style>${MONITOR_STYLES}</style>
    <header class="oc-header">${brandMarkup("OmniCam Monitor")}
      <div class="oc-header-actions"><label class="oc-live"><input data-role="live-sync" type="checkbox" checked> Live</label><button type="button" data-act="monitor-refresh">Refresh</button><span class="oc-status-pill" data-role="monitor-status" data-state="OFFLINE"><i class="oc-status-dot"></i> OFFLINE</span></div>
    </header>
    <div class="oc-source" data-role="source-status">Connect an OmniCam Director camera track.</div>
    <main class="oc-layout">
      <section class="oc-column">
        <div class="oc-card"><div class="oc-section">Proxy monitor</div><div class="oc-player"><video data-role="proxy-player" playsinline muted aria-label="OmniCam proxy playback"></video><div class="oc-player-empty">No managed proxy connected</div><canvas data-role="proxy-upstream-preview" hidden aria-label="Connected proxy source, not yet a managed file"></canvas></div><div class="oc-player-controls"><button type="button" data-act="proxy-play" aria-label="Play or pause proxy">Play</button><input data-role="proxy-scrubber" type="range" min="0" max="0" value="0" aria-label="Proxy frame"><output data-role="proxy-frame">0 / 0</output><label><input data-role="proxy-loop" type="checkbox" checked> Loop</label><label><input data-role="proxy-mute" type="checkbox" checked> Mute</label></div><div data-role="camera-readout" class="oc-source">Camera data unavailable</div></div>
        <div class="oc-card"><div class="oc-section">Camera track</div><canvas data-role="monitor-track-timeline" width="760" height="106" aria-label="Read-only camera track timeline"></canvas></div>
        <div class="oc-grid"><div class="oc-card"><div class="oc-section">Camera health</div><div data-role="camera-health" class="oc-empty">Waiting for source</div></div><div class="oc-card"><div class="oc-section">Adapter preflight</div><div data-role="adapter-preflight" class="oc-empty">Waiting for source</div></div></div>
        <div class="oc-card"><div class="oc-section">Adapter preview</div><div data-role="adapter-preview" class="oc-empty">Waiting for snapshot</div></div>
      </section>
      <aside class="oc-column">
        <div class="oc-card"><div class="oc-section">Adapter</div><div class="oc-adapter-controls">
          <label class="wide">Profile<select data-role="adapter-select"><option value="h3">MiniMax H3 · Omni Reference</option><option value="wan_native">Wan Native Camera</option><option value="wan_ati">WanVideoWrapper · ATI</option><option value="wan_tracks_native">Wan Native Tracks</option><option value="ltx">LTX Guide Frames</option></select></label>
          <label>Width<input data-setting="width" type="number" min="64" max="4096" step="8"></label><label>Height<input data-setting="height" type="number" min="64" max="4096" step="8"></label>
          <label>Length<input data-setting="length" type="number" min="1" max="10000"></label><label>Points<input data-setting="point_count" type="number" min="4" max="128"></label>
          <label class="wide">Distribution<select data-setting="distribution"><option value="balanced">Balanced</option><option value="subject_focus">Subject focus</option><option value="ground_parallax">Ground parallax</option></select></label>
          <label class="wide">Base prompt<textarea data-setting="base_prompt" rows="3"></textarea></label>
          <label class="wide">Video reference token<input data-setting="video_ref_token" type="text"></label>
          <label>LTX max frames<input data-setting="ltx_max_frames" type="number" min="1" max="1000"></label><label>LTX sampling<select data-setting="ltx_sampling_mode"><option value="contiguous">Contiguous</option><option value="uniform">Uniform</option></select></label>
        </div><div data-role="adapter-details"></div></div>
        <div class="oc-card"><div class="oc-section">Prompt & data</div><div class="oc-tabs" role="tablist"><button class="oc-tab" data-tab="cinematography" aria-selected="true">Cinematography</button><button class="oc-tab" data-tab="camera-prompt" aria-selected="false">Camera Prompt</button><button class="oc-tab" data-tab="final-prompt" aria-selected="false">Final Prompt</button><button class="oc-tab" data-tab="camera-data" aria-selected="false">Camera Data</button></div><div class="oc-copy-row"><button type="button" data-act="copy-text">COPY</button></div><pre data-role="cinematography"></pre><pre data-role="camera-prompt" hidden></pre><pre data-role="final-prompt" hidden></pre><pre data-role="camera-data" hidden></pre></div>
        <div class="oc-card"><div class="oc-section">Execution output</div><div data-role="output-status" class="oc-empty">OUTPUT NOT EXECUTED</div></div>
      </aside>
    </main>
  </div>`;
}

export function buildMonitorRoot(doc = document) {
  const wrapper = doc.createElement("div"); wrapper.innerHTML = monitorMarkup(); return wrapper.firstElementChild;
}
