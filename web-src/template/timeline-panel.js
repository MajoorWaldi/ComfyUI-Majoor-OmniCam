// Lower half of the Director: camera preview, transport, dope sheet, graph editor.

import { t } from "../omnicam-i18n.js";
import { DOPE_CHANNELS } from "../dope-sheet.js";

function previewPanel() {
  return `
    <div class="oc-preview camera-view-row" data-role="camera-view-row">
      <div class="oc-preview-head">
        <span data-role="preview-title">${t("Camera")}</span>
        <button class="camera-strip-close" data-act="toggle-camera-view" title="${t("Hide camera previews")}"><i class="pi pi-times"></i></button>
      </div>
      <div class="camera-preview-strip" data-role="camera-previews"></div>
    </div>`;
}

function transportBar() {
  return `
    <div class="row timeline-toolbar oc-transport">
      <div class="timeline-group" title="${t("Playback Transport")}">
        <button class="icon-button" data-act="key-first" title="${t("First Frame (Home)")}" aria-label="${t("Go to first frame")}"><i class="pi pi-step-backward-alt"></i></button>
        <button class="icon-button" data-act="previous-key" title="${t("Previous Keyframe (, / Up Arrow)")}" aria-label="${t("Previous keyframe")}"><i class="pi pi-fast-backward"></i></button>
        <button class="icon-button" data-act="previous-frame" title="${t("Previous Frame (Left Arrow)")}" aria-label="${t("Previous frame")}"><i class="pi pi-step-backward"></i></button>
        <button class="icon-button primary-play oc-play" data-act="play" title="${t("Play / Stop (Space)")}" aria-label="${t("Play timeline")}"><i class="pi pi-play"></i></button>
        <button class="icon-button" data-act="next-frame" title="${t("Next Frame (Right Arrow)")}" aria-label="${t("Next frame")}"><i class="pi pi-step-forward"></i></button>
        <button class="icon-button" data-act="next-key" title="${t("Next Keyframe (. / Down Arrow)")}" aria-label="${t("Next keyframe")}"><i class="pi pi-fast-forward"></i></button>
        <button class="icon-button" data-act="key-last" title="${t("Last Frame (End)")}" aria-label="${t("Go to last frame")}"><i class="pi pi-step-forward-alt"></i></button>
        <button class="icon-button" data-act="loop" title="${t("Toggle Loop Playback")}" aria-label="${t("Loop playback")}" aria-pressed="false"><i class="pi pi-replay"></i></button>
      </div>

      <span class="oc-frame-counter">
        <input data-role="frame" type="number" min="0" value="0" aria-label="${t("Frame")}">
        <span class="oc-frame-total" data-role="frame-total">/ 120</span>
      </span>
      <button class="oc-timecode" data-role="time" data-act="toggle-timecode" title="${t("Click to toggle Time / Timecode")}">00:00.000</button>

      <span class="oc-transport-spacer"></span>

      <div class="timeline-group" title="${t("Keyframe Tools")}">
        <button class="icon-button primary-key oc-key" data-act="key" title="${t("Insert / Update Keyframe at Playhead (I)")}" aria-label="${t("Insert or update key")}"><span class="oc-diamond"></span> ${t("Key")}</button>
        <button class="icon-button auto-key-btn" data-act="auto-key" title="${t("Auto-Key: Records moves live while scrubbing/navigating")}" aria-label="${t("Toggle Auto Key")}" aria-pressed="false"><i class="pi pi-circle-fill"></i></button>
      </div>
      <button class="icon-button" data-act="toggle-graph" title="${t("Open or close the animation curve editor")}"><i class="pi pi-chart-line"></i></button>
      <label class="oc-fps">${t("FPS")} <input data-role="timeline-fps" type="number" min="1" max="120" step="1" value="24"></label>

      <details class="toolbar-menu oc-overflow" data-menu="timeline">
        <summary title="${t("Timeline options")}"><i class="pi pi-ellipsis-h"></i></summary>
        <div class="menu-panel right">
          <div class="menu-title">${t("Range & Duration")}</div>
          <label>${t("Dur")} <input data-role="duration-seconds" type="number" min="0.25" max="120" step="0.25" value="5"></label>
          <div class="menu-row">
            <button data-act="range-start" title="${t("Set In Point at Playhead ([)")}">[</button>
            <button data-act="range-end" title="${t("Set Out Point at Playhead (])")}">]</button>
            <button data-act="range-clear" title="${t("Clear Playback Range")}"><i class="pi pi-times"></i></button>
          </div>
          <div class="menu-divider"></div><div class="menu-title">${t("Snapping")}</div>
          <div class="menu-row">
            <button data-act="toggle-snap" title="${t("Toggle Snapping")}" aria-pressed="true"><i class="pi pi-thumbtack"></i> ${t("Snap")}</button>
            <input data-role="snap-frames" type="number" min="1" max="24" step="1" value="1">
          </div>
          <div class="menu-divider"></div>
          <button data-act="fit-timeline" title="${t("Fit Timeline to View (F)")}"><i class="pi pi-arrows-alt"></i> ${t("Fit Timeline to View (F)")}</button>
          <span class="timeline-summary" data-role="timeline-summary">${t("1 key")}</span>
        </div>
      </details>
    </div>`;
}

function dopeSheet() {
  const labels = DOPE_CHANNELS.map((channel) => `
          <label class="oc-dope-label" style="--channel-color:${channel.color}">
            <input type="checkbox" data-dope-channel="${channel.id}" checked>
            <span>${t(channel.label)}</span>
          </label>`).join("");
  return `
    <div class="oc-dope">
      <div class="oc-dope-body">
        <div class="oc-dope-labels">${labels}</div>
        <div class="oc-dope-tracks" data-role="dope-tracks">
          <div class="oc-ruler" data-role="ruler" title="${t("Drag to scrub the timeline")}"></div>
          <div class="keys" data-role="keys" tabindex="0" aria-label="${t("Camera keyframe timeline")}"></div>
          <div class="oc-dope-rows" data-role="dope-rows"></div>
          <span class="oc-playhead-line" data-role="dope-playhead"></span>
        </div>
      </div>
      <input class="oc-scrub oc-sr-only" data-role="scrub" type="range" min="0" max="119" value="0" aria-label="${t("Scrub the timeline")}">
    </div>`;
}

function graphEditor() {
  return `
    <details class="curve-editor oc-graph" open>
      <summary>
        <span class="oc-graph-tabs" data-role="graph-tabs">
          <button class="oc-graph-tab active" data-graph-tab="curves" aria-pressed="true" title="${t("Edit animation curves")}"><strong>${t("Graph Editor")}</strong></button>
          <button class="oc-graph-tab" data-graph-tab="dope" aria-pressed="false" title="${t("Per-channel keyframe sheet")}">${t("Dope Sheet")}</button>
        </span>
        <span class="hint">${t("MMB/Alt-drag: Pan · Scroll: Zoom · Box Select: Drag · Drag Point: Retime/Value · Right-click: Menu")}</span>
      </summary>
      <div class="curve-toolbar oc-graph-toolbar">
        <select data-role="curve-group" title="${t("Choose the animated channels displayed in the graph")}">
          <option value="camera">${t("Camera (Position, Focal, Roll)")}</option>
          <option value="position">${t("Position XYZ")}</option>
          <option value="target">${t("Target XYZ")}</option>
          <option value="lens">${t("FOV / Roll / Zoom")}</option>
        </select>
        <span class="oc-graph-spacer"></span>
        <div class="oc-graph-modes" data-role="curve-modes">
          <button class="curve-mode" data-tangent-mode="auto" title="${t("Automatic smooth tangents")}">${t("Auto")}</button>
          <button class="curve-mode" data-curve-mode="smooth" title="${t("Smooth interpolation after the selected key")}">${t("Smooth")}</button>
          <button class="curve-mode" data-curve-mode="linear" title="${t("Straight interpolation after the selected key")}">${t("Linear")}</button>
        </div>
        <button class="curve-mode" data-act="curve-zoom-in" title="${t("Zoom in curve editor (Mouse wheel)")}"><i class="pi pi-search-plus"></i></button>
        <button class="curve-mode" data-act="curve-zoom-out" title="${t("Zoom out curve editor")}"><i class="pi pi-search-minus"></i></button>
        <button class="curve-mode" data-act="curve-fit" title="${t("Fit curves to view")}"><i class="pi pi-arrows-alt"></i></button>
        <button class="curve-mode active" data-act="curve-handles" title="${t("Show or hide Bézier tangent handles")}" aria-pressed="true"><i class="pi pi-share-alt"></i></button>
        <details class="toolbar-menu oc-overflow" data-menu="curve">
          <summary title="${t("Interpolation & tangents")}"><i class="pi pi-ellipsis-h"></i></summary>
          <div class="menu-panel right">
            <div class="menu-title">${t("Interpolation")}</div>
            <div class="menu-grid">
              <button class="curve-mode" data-curve-mode="bezier">${t("Bezier")}</button>
              <button class="curve-mode" data-curve-mode="ease">${t("Ease In/Out")}</button>
              <button class="curve-mode" data-curve-mode="ease_in">${t("Ease In")}</button>
              <button class="curve-mode" data-curve-mode="ease_out">${t("Ease Out")}</button>
              <button class="curve-mode" data-curve-mode="hold">${t("Hold / Step")}</button>
            </div>
            <div class="menu-divider"></div><div class="menu-title">${t("Tangents")}</div>
            <div class="menu-grid">
              <button class="curve-mode" data-tangent-mode="vector">${t("Vector")}</button>
              <button class="curve-mode" data-tangent-mode="free">${t("Free")}</button>
              <button class="curve-mode" data-tangent-mode="aligned">${t("Aligned")}</button>
              <button class="curve-mode" data-tangent-mode="flat">${t("Flat")}</button>
            </div>
          </div>
        </details>
      </div>
      <div class="oc-graph-body">
        <div class="oc-graph-legend" data-role="curve-legend"></div>
        <div class="oc-graph-stage">
          <canvas class="curve-canvas" data-role="curve-canvas" title="${t("Drag a key point vertically or drag tangent handles on either side. Scroll to zoom. Right-click for curve actions.")}"></canvas>
          <div class="oc-gdope" data-role="graph-dope" hidden></div>
        </div>
      </div>
    </details>`;
}

export function timelinePanelMarkup() {
  return `
    <div class="oc-lower">
      ${previewPanel()}
      <div class="timeline oc-timeline">
        ${transportBar()}
        ${dopeSheet()}
      </div>
    </div>
    ${graphEditor()}`;
}
