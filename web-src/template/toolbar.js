// Director top toolbar: four dropdown tabs plus the always-visible output row.
//
// Each tab is a <details class="toolbar-menu">, which is what closeMenus() and
// the outside-click handler in event-bindings/editor-global.js key off.

import { t } from "../i18n.js";

function sceneTab() {
  return `
    <details class="toolbar-menu" data-menu="scene"><summary><i class="pi pi-box"></i> ${t("Viewport")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${t("Upstream Sync & Imports")}</div>
      <button data-act="sync-inputs" class="primary"><i class="pi pi-sync"></i> ${t("Sync Upstream Inputs")}</button>
      <button data-act="load-card"><i class="pi pi-image"></i> ${t("Set Subject Card")}</button>
      <button data-act="add-card"><i class="pi pi-images"></i> ${t("Add Media Card")}</button>
      <button data-act="load-model"><i class="pi pi-box"></i> ${t("Import 3D Scene")}</button>
      <button data-act="load-audio"><i class="pi pi-volume-up"></i> ${t("Load Audio Track")}</button>
      <span class="hint">${t("GLB, OBJ, FBX, STL, PLY. Audio WAV/MP3/OGG.")}</span>
      <div class="menu-divider"></div><div class="menu-title">${t("Objects & Primitives")}</div>
      <button data-object-type="ground"><i class="pi pi-minus"></i> ${t("Ground Plane")}</button>
      <button data-object-type="cube"><i class="pi pi-stop"></i> ${t("Cube")}</button>
      <button data-object-type="sphere"><i class="pi pi-circle"></i> ${t("Sphere")}</button>
      <button data-object-type="human"><i class="pi pi-user"></i> ${t("Human Proxy")}</button>
      <button data-object-type="null"><i class="pi pi-plus"></i> ${t("Null Locator")}</button>
      <div class="menu-section" data-density-min="animation">
        <div class="menu-divider"></div><div class="menu-title">${t("Camera Interchange")}</div>
        <button data-act="import-camera"><i class="pi pi-download"></i> ${t("Import Camera…")}</button>
        <span class="hint">${t("glTF, GLB, FBX, .chan or an OmniCam JSON track.")}</span>
        <label>${t("Export format")} <select data-role="export-format"></select></label>
        <button data-act="export-camera"><i class="pi pi-upload"></i> ${t("Export Camera")}</button>
        <span class="hint" data-role="export-note"></span>
        <input data-role="camera-file" type="file" accept=".gltf,.glb,.fbx,.chan,.json" hidden>
      </div>
      <div class="menu-section" data-density-min="advanced">
        <div class="menu-divider"></div><div class="menu-title">${t("Blocking Scene Sets (Parallax / Occlusion)")}</div>
        <div class="menu-grid">
          <button data-blocking-scene="foreground_reveal" title="${t("Foreground pillar sweep reveal")}">${t("FG Reveal")}</button>
          <button data-blocking-scene="doorway_pass" title="${t("Push-in through doorway opening")}">${t("Doorway Pass")}</button>
          <button data-blocking-scene="over_the_shoulder" title="${t("Over the shoulder frame")}">${t("OTS Frame")}</button>
          <button data-blocking-scene="perspective_corridor" title="${t("Perspective depth colonnade")}">${t("Corridor")}</button>
          <button data-blocking-scene="tabletop_orbit" class="span-2" title="${t("Product pedestal 360 orbit")}">${t("Tabletop 360° Orbit")}</button>
        </div>
      </div>
    </div></details>`;
}

function camerasTab() {
  return `
    <details class="toolbar-menu" data-menu="camera"><summary><i class="pi pi-video"></i> <span data-role="camera-summary">${t("Cameras")}</span> <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${t("Animated cameras")}</div>
      <div class="camera-menu-list" data-role="camera-menu-list"></div>
      <button data-act="add-camera"><i class="pi pi-plus"></i> ${t("Add Camera")}</button>
      <div class="menu-divider"></div><div class="menu-title">${t("Targeting")}</div>
      <button data-act="aim-at-object" class="primary"><i class="pi pi-compass"></i> ${t("Aim at Target Subject")}</button>
      <button data-act="focus-target"><i class="pi pi-expand"></i> ${t("Frame Camera Target")}</button>
      <div class="menu-section" data-density-min="animation">
        <button data-act="bake-aim-keys"><i class="pi pi-check-square"></i> ${t("Bake")}</button>
        <button data-act="bake-aim-per-frame" title="${t("One camera key per frame, so an exported track matches the viewport exactly")}"><i class="pi pi-list-check"></i> ${t("Bake Per Frame")}</button>
      </div>
      <div class="menu-divider"></div><div class="menu-title">${t("Motion Presets & Shake")}</div>
      <div class="menu-grid">
        <button data-preset="orbit_360">${t("Orbit 360°")}</button>
        <button data-preset="push_in">${t("Push In")}</button>
        <button data-preset="pull_out">${t("Pull Out")}</button>
        <button data-preset="dolly_zoom">${t("Dolly Zoom (Vertigo)")}</button>
        <button data-shake="handheld_subtle">${t("Handheld Shake")}</button>
        <button data-shake="turbulence">${t("Turbulence Shake")}</button>
        <button data-shake="handheld">${t("Handheld")}</button>
        <button data-shake="subtle">${t("Subtle")}</button>
        <button data-shake="crash">${t("Crash")}</button>
      </div>
      <div class="menu-divider"></div>
      <label>${t("New key interpolation")} <select data-role="interp">
        <option value="ease">${t("Ease")}</option><option value="smooth">${t("Smooth")}</option>
        <option value="bezier">${t("Bezier")}</option><option value="linear">${t("Linear")}</option>
        <option value="ease_in">${t("Ease In")}</option><option value="ease_out">${t("Ease Out")}</option>
      </select></label>
      <button data-act="reset-camera"><i class="pi pi-refresh"></i> ${t("Reset Camera")}</button>
    </div></details>`;
}

function viewTab() {
  return `
    <details class="toolbar-menu" data-menu="view"><summary><i class="pi pi-compass"></i> ${t("View")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${t("Navigation & Selection")}</div>
      <label title="${t("Middle drag orbits, Shift+middle pans, Ctrl+middle dollies -- no Alt needed anywhere. Alt+left/middle/right are aliases for orbit/pan/dolly; with no middle button, Ctrl+drag over empty space orbits and Ctrl+Shift+drag pans. The profile only decides whether Alt+right dollies (Maya) or does nothing (Blender).")}">${t("Navigation profile")} <select data-role="navigation-profile"><option value="maya">Maya</option><option value="blender">Blender</option></select></label>
      <div class="menu-section" data-density-min="advanced">
        <label>${t("Select mode")} <select data-role="select-mode">
          <option value="object" selected>${t("Object (4)")}</option>
          <option value="vertex">${t("Vertex (1)")}</option>
          <option value="edge">${t("Edge (2)")}</option>
          <option value="face">${t("Face (3)")}</option>
        </select></label>
        <label title="${t("Applies to Move only. Scale and Rotate always use the object's own axes, as Maya's manipulators do: a size triple and an XYZ euler only exist in the object's own frame, so a world-axis scale would shear it and a world-axis rotation cannot be expressed at all.")}">${t("Transform space")} <select data-role="gizmo-space"><option value="world">${t("World")}</option><option value="local">${t("Local")}</option></select></label>
        <label>${t("Spatial snapping")} <select data-role="spatial-snap-mode"><option value="none">${t("No Snap")}</option><option value="grid">${t("Grid")}</option><option value="vertex">${t("Vertex")}</option></select></label>
        <label>${t("Spatial grid size")} <input data-role="spatial-grid-size" type="number" min="0.01" max="100" step="0.01" value="0.5"></label>
      </div>
      <label>${t("Move speed")} <input data-role="speed" type="number" min="0.05" max="5" step="0.05" value="1"></label>
      <div class="menu-divider"></div><div class="menu-title">${t("Proxy Reference")}</div>
      <label>${t("Point density")} <select data-role="point-density">
        <option value="none">${t("None (0)")}</option><option value="sparse">${t("Sparse (300)")}</option>
        <option value="balanced" selected>${t("Balanced (800)")}</option><option value="dense">${t("Dense (1800)")}</option>
        <option value="ultra">${t("Ultra (3500)")}</option>
      </select></label>
      <label>${t("Point spread")} <select data-role="point-spread">
        <option value="all_views" selected>${t("All Views (Full 3D)")}</option>
        <option value="ground_focus">${t("Ground + Low Angle")}</option>
        <option value="dome">${t("Spherical Dome")}</option>
      </select></label>
      <label>${t("Point color")} <input data-role="point-color" type="color" value="#cbd5e1"></label>
      <label>${t("Card fit")} <select data-role="card-fit"><option value="contain">${t("Fit")}</option><option value="cover">${t("Fill")}</option><option value="stretch">${t("Stretch")}</option></select></label>
      <label>${t("Interface")} <select data-role="ui-density"><option value="basic">${t("Basic")}</option><option value="animation">${t("Animation")}</option><option value="advanced" selected>${t("Advanced")}</option></select></label>
    </div></details>`;
}

function displayTab() {
  return `
    <details class="toolbar-menu" data-menu="display"><summary><i class="pi pi-eye"></i> ${t("Display")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
      <div class="menu-title">${t("Composition Guides & Mini-Map")}</div>
      <label><span>${t("Rule of Thirds")}</span><input data-role="guides" type="checkbox" checked></label>
      <div class="menu-section" data-density-min="advanced">
        <label><span>${t("2D Radar Mini-Map")}</span><input data-role="show-radar" type="checkbox"></label>
      </div>
      <label><span>${t("Safe Areas (90%/80%)")}</span><input data-role="safe-areas" type="checkbox"></label>
      <div class="menu-section" data-density-min="animation">
        <label title="${t("Mask the viewport down to the node's output width x height")}"><span>${t("Resolution Gate")}</span><input data-role="resolution-gate" type="checkbox"></label>
        <label>${t("Aspect Ratio")} <select data-role="aspect-ratio">
          <option value="auto">${t("Auto (node output)")}</option><option value="16:9">16:9</option><option value="4:3">4:3</option>
          <option value="1:1">1:1</option><option value="9:16">9:16</option><option value="2.39:1">2.39:1</option>
        </select></label>
      </div>
      <div class="menu-divider"></div><div class="menu-title">${t("Scene Display")}</div>
      <label><span>${t("Floor Grid")}</span><input data-role="show-grid" type="checkbox" checked></label>
      <label><span>${t("Camera Paths")}</span><input data-role="show-camera-paths" type="checkbox" checked></label>
      <label><span>${t("Camera Gizmos (body / frustum)")}</span><input data-role="show-camera-gizmos" type="checkbox" checked></label>
      <label><span>${t("Look-At Targets")}</span><input data-role="show-look-at" type="checkbox" checked></label>
      <label><span>${t("Helper Axes (nulls)")}</span><input data-role="show-helper-axes" type="checkbox" checked></label>
      <label><span>${t("Keep the grid in the playblast")}</span><input data-role="playblast-grid" type="checkbox"></label>
      <label>${t("Reconstruction Appearance")} <select data-role="reconstruction-appearance">
        <option value="neutral">${t("Neutral")}</option>
        <option value="source_texture">${t("Source Texture")}</option>
      </select></label>
      <div class="menu-section" data-density-min="advanced">
        <label title="${t("Resolution of the recorded playblast video")}">${t("Playblast Resolution")} <select data-role="playblast-resolution">
          <option value="viewport">${t("Viewport (fast)")}</option>
          <option value="half">${t("½ x node output")}</option>
          <option value="output">${t("Match node output")}</option>
          <option value="double">${t("2x node output (sharp)")}</option>
        </select></label>
      </div>
      <div class="menu-section" data-density-min="advanced">
        <label><span>${t("Wireframe / Edges")}</span><input data-role="show-wireframe" type="checkbox"></label>
        <label><span>${t("Mesh Vertices")}</span><input data-role="show-vertices" type="checkbox"></label>
        <label><span>${t("Burn-in Data")}</span><input data-role="burn-in" type="checkbox"></label>
        <label><span>${t("Speed Map")}</span><input data-role="speed-heatmap" type="checkbox"></label>
      </div>
      <div class="menu-divider"></div><div class="menu-title">${t("Environment & Background")}</div>
      <label>${t("BG Color")} <input data-role="viewport-bg-color" type="color" value="#121212"></label>
      <button data-act="reset-bg-color" title="${t("Restore the studio sky")}"><i class="pi pi-undo"></i> ${t("Reset BG Color")}</button>
      <div class="menu-row" data-density-min="advanced">
        <button data-act="upload-viewport-bg"><i class="pi pi-image"></i> ${t("BG Image")}</button>
        <button data-act="upload-viewport-bg-seq"><i class="pi pi-images"></i> ${t("BG Sequence")}</button>
        <button data-act="clear-viewport-bg" class="icon-button" title="${t("Clear Background")}"><i class="pi pi-trash"></i></button>
      </div>
      <div class="menu-divider"></div><div class="menu-title">${t("Previews")}</div>
      <label>${t("Layout")} <select data-role="preview-layout">
        <option value="auto">${t("Auto strip")}</option><option value="1">${t("Single")}</option>
        <option value="2">${t("Side by side")}</option><option value="4">${t("Quad")}</option>
      </select></label>
    </div></details>`;
}

export function toolbarMarkup() {
  return `
    <div class="top">
      ${sceneTab()}
      ${camerasTab()}
      ${viewTab()}
      ${displayTab()}
      <input data-role="file" type="file" accept="image/*,video/*" hidden>
      <input data-role="model-file" type="file" accept=".glb,.obj,.fbx,.stl,.ply" hidden>
      <input data-role="audio-file" type="file" accept="audio/*,.wav,.mp3,.ogg,.flac" hidden>
      <input data-role="viewport-bg-file" type="file" accept="image/*" hidden>
      <input data-role="viewport-bg-seq-file" type="file" accept="image/*" multiple hidden>
      <span class="oc-toolbar-spacer"></span>
      <button class="oc-playblast" data-act="record" title="${t("Record proxy playblast")}"><span class="oc-playblast-dot"></span>${t("Playblast")}</button>
      <button class="icon-button oc-strip-toggle" data-act="toggle-camera-view" title="${t("Toggle Camera Previews Strip")}"><i class="pi pi-video"></i></button>
      <select class="oc-render-mode" data-role="mode" title="${t("Proxy mode")}">
        <option value="omni_ref">${t("Omni Ref")}</option>
        <option value="card_grid">${t("Card + Grid")}</option>
        <option value="graybox">${t("Graybox")}</option>
        <option value="grid">${t("Grid")}</option>
        <option value="point_field">${t("Point Field")}</option>
        <option value="wireframe">${t("Wireframe")}</option>
        <option value="beauty">${t("Beauty (lit)")}</option>
      </select>
    </div>`;
}
