import { t } from "./omnicam-i18n.js";
import { DIRECTOR_STYLES } from "./template/styles.js";
export { DIRECTOR_STYLES } from "./template/styles.js";

export function buildRoot() {
  const root = document.createElement("div");
  root.className = "majoor-omnicam";
  root.innerHTML = `
    <style>${DIRECTOR_STYLES}</style>
    <div class="top">
      <details class="toolbar-menu" data-menu="scene"><summary><i class="pi pi-box"></i> ${t("Scene")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
        <div class="menu-title">${t("Upstream Sync & Imports")}</div>
        <button data-act="sync-inputs" class="primary" style="margin-bottom:4px"><i class="pi pi-sync"></i> ${t("Sync Upstream Inputs")}</button>
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
        <div class="menu-divider"></div>
        <button data-act="clear-caches" class="primary" style="margin-top:2px"><i class="pi pi-trash"></i> ${t("Clear Caches & Clean")}</button>
      </div></details>
      <input data-role="file" type="file" accept="image/*,video/*" style="display:none !important" hidden><input data-role="model-file" type="file" accept=".glb,.obj,.fbx,.stl,.ply" style="display:none !important" hidden><input data-role="audio-file" type="file" accept="audio/*,.wav,.mp3,.ogg,.flac" style="display:none !important" hidden><input data-role="viewport-bg-file" type="file" accept="image/*" style="display:none !important" hidden><input data-role="viewport-bg-seq-file" type="file" accept="image/*" multiple style="display:none !important" hidden>
      <details class="toolbar-menu" data-menu="camera"><summary><i class="pi pi-video"></i> <span data-role="camera-summary">${t("Camera 1 · Key F0")}</span> <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
        <div class="menu-title">${t("Animated cameras")}</div><div class="camera-menu-list" data-role="camera-menu-list"></div><button data-act="add-camera"><i class="pi pi-plus"></i> ${t("Add Camera")}</button><div class="menu-divider"></div>
        <div class="menu-title">${t("Targeting")}</div>
        <button data-act="aim-at-object" class="primary"><i class="pi pi-compass"></i> ${t("Aim at Target Subject")}</button>
        <button data-act="focus-target"><i class="pi pi-crosshairs"></i> ${t("Frame Camera Target")}</button>
        <div class="menu-divider"></div>
        <label>${t("FOV")} <input data-role="fov" type="number" min="5" max="150" step="1" value="35"></label><label>${t("Roll")} <input data-role="roll" type="number" min="-180" max="180" step="1" value="0"></label><label>${t("Move speed")} <input data-role="speed" type="number" min="0.05" max="5" step="0.05" value="1"></label>
        <label>${t("Projection")} <select data-role="camera-type"><option value="perspective">${t("Perspective")}</option><option value="orthographic">${t("Orthographic")}</option></select></label><label>${t("New key interpolation")} <select data-role="interp"><option value="ease">${t("Ease")}</option><option value="smooth">${t("Smooth")}</option><option value="bezier">${t("Bezier")}</option><option value="linear">${t("Linear")}</option><option value="ease_in">${t("Ease In")}</option><option value="ease_out">${t("Ease Out")}</option></select></label>
        <div class="menu-divider"></div><div class="menu-title">${t("Motion Presets & Shake")}</div>
        <button data-preset="orbit_360"><i class="pi pi-compass"></i> ${t("Orbit 360°")}</button><button data-preset="push_in"><i class="pi pi-arrow-down-left"></i> ${t("Push In")}</button><button data-preset="pull_out"><i class="pi pi-arrow-up-right"></i> ${t("Pull Out")}</button><button data-preset="dolly_zoom"><i class="pi pi-sync"></i> ${t("Dolly Zoom (Vertigo)")}</button><button data-shake="handheld_subtle"><i class="pi pi-sliders-h"></i> ${t("Handheld Shake")}</button><button data-shake="turbulence"><i class="pi pi-bolt"></i> ${t("Turbulence Shake")}</button>
        <div class="menu-divider"></div><button data-act="reset-camera"><i class="pi pi-refresh"></i> ${t("Reset Camera")}</button>
      </div></details>
      <details class="toolbar-menu" data-menu="show"><summary><i class="pi pi-eye"></i> ${t("Show")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel">
        <label><span><i class="pi pi-th-large"></i> ${t("Guides")}</span><input data-role="guides" type="checkbox" checked></label>
        <label><span><i class="pi pi-table"></i> ${t("Playblast Grid")}</span><input data-role="playblast-grid" type="checkbox"></label>
        <label><span><i class="pi pi-share-alt"></i> ${t("Wireframe / Edges")}</span><input data-role="show-wireframe" type="checkbox"></label>
        <label><span><i class="pi pi-circle"></i> ${t("Mesh Vertices")}</span><input data-role="show-vertices" type="checkbox"></label>
        <label><span><i class="pi pi-tag"></i> ${t("Burn-in")}</span><input data-role="burn-in" type="checkbox"></label>
        <label><span><i class="pi pi-chart-line"></i> ${t("Speed map")}</span><input data-role="speed-heatmap" type="checkbox"></label>
        <div class="menu-divider"></div>
        <label>${t("Select mode")} <select data-role="select-mode"><option value="object" selected>${t("Object (4)")}</option><option value="vertex">${t("Vertex (1)")}</option><option value="edge">${t("Edge (2)")}</option><option value="face">${t("Face (3)")}</option></select></label>
        <label>${t("Proxy mode")} <select data-role="mode"><option value="omni_ref">${t("Omni Ref")}</option><option value="card_grid">${t("Card + Grid")}</option><option value="graybox">${t("Graybox")}</option><option value="grid">${t("Grid")}</option><option value="point_field">${t("Point Field")}</option><option value="wireframe">${t("Wireframe")}</option></select></label>
        <label>${t("Point density")} <select data-role="point-density"><option value="none">${t("None (0)")}</option><option value="sparse">${t("Sparse (300)")}</option><option value="balanced" selected>${t("Balanced (800)")}</option><option value="dense">${t("Dense (1800)")}</option><option value="ultra">${t("Ultra (3500)")}</option></select></label>
        <label>${t("Point color")} <input data-role="point-color" type="color" value="#cbd5e1" style="width:48px;height:24px;padding:0;cursor:pointer;background:transparent;border:1px solid #555"></label>
        <label>${t("Point spread")} <select data-role="point-spread"><option value="all_views" selected>${t("All Views (Full 3D)")}</option><option value="ground_focus">${t("Ground + Low Angle")}</option><option value="dome">${t("Spherical Dome")}</option></select></label>
        <label>${t("Card fit")} <select data-role="card-fit"><option value="contain">${t("Fit")}</option><option value="cover">${t("Fill")}</option><option value="stretch">${t("Stretch")}</option></select></label>
        <div class="menu-divider"></div><div class="menu-title">${t("Environment & Background")}</div>
        <label>${t("BG Color")} <input data-role="viewport-bg-color" type="color" value="#121212" style="width:48px;height:24px;padding:0;cursor:pointer;background:transparent;border:1px solid #555"></label>
        <div style="display:flex;gap:4px">
          <button data-act="upload-viewport-bg" style="flex:1"><i class="pi pi-image"></i> ${t("BG Image")}</button>
          <button data-act="upload-viewport-bg-seq" style="flex:1"><i class="pi pi-images"></i> ${t("BG Sequence")}</button>
          <button data-act="clear-viewport-bg" style="width:28px;padding:0" title="${t("Clear Background")}"><i class="pi pi-trash"></i></button>
        </div>
        <div class="menu-divider"></div><div class="menu-title">${t("Previews")}</div><label>${t("Layout")} <select data-role="preview-layout"><option value="auto">${t("Auto strip")}</option><option value="1">${t("Single")}</option><option value="2">${t("Side by side")}</option><option value="4">${t("Quad")}</option></select></label><label><span><i class="pi pi-shield"></i> ${t("Safe areas")}</span><input data-role="safe-areas" type="checkbox"></label><label><span><i class="pi pi-frame"></i> ${t("Resolution gate")}</span><input data-role="resolution-gate" type="checkbox"></label><label>${t("Aspect")} <select data-role="aspect-ratio"><option value="auto">${t("Auto")}</option><option value="16:9">16:9</option><option value="4:3">4:3</option><option value="1:1">1:1</option><option value="9:16">9:16</option><option value="2.39:1">2.39:1</option></select></label>
        <label>${t("Interface")} <select data-role="ui-density"><option value="basic">${t("Basic")}</option><option value="animation">${t("Animation")}</option><option value="advanced" selected>${t("Advanced")}</option></select></label>
      </div></details>
      <details class="toolbar-menu" data-menu="output"><summary><i class="pi pi-send"></i> ${t("Output")} <i class="pi pi-chevron-down"></i></summary><div class="menu-panel right">
        <label>${t("Playblast camera")} <select data-role="playblast-camera"></select></label><label>${t("H3 preset")} <select data-role="proxy-preset"><option value="balanced">${t("Balanced")}</option><option value="parallax">${t("Parallax")}</option><option value="subject">${t("Subject")}</option><option value="debug">${t("Debug")}</option></select></label><label>${t("Encoder")} <select data-role="encoder"><option value="auto">${t("WebCodecs")}</option><option value="realtime">${t("Realtime fallback")}</option></select></label>
        <button data-act="h3-setup" class="primary" style="margin-top:4px" title="${t("Create the H3 reference nodes")}"><i class="pi pi-bolt"></i> ${t("H3 Setup")}</button>
        <div class="menu-divider"></div><div class="setup-badge" data-role="setup-badge" hidden></div><div data-role="setup-issues"></div>
      </div></details>
      <button data-act="clear-caches" title="${t("Clear WebGL textures, temporary files and memory caches")}" style="display:inline-flex;align-items:center;gap:4px;padding:3px 7px;font-size:11px"><i class="pi pi-trash"></i> ${t("Clean")}</button>
      <span class="status" data-role="status">${t("Ready")}</span>
    </div>
    <div class="viewport-wrap">
      <canvas tabindex="0"></canvas>
      
      <!-- Prominent Tally / Live Recording Status Banner -->
      <div class="viewport-tally-banner" data-role="tally-banner" hidden>
        <span class="tally-dot"></span>
        <span class="tally-text" data-role="tally-text">REC KEY @ F0</span>
      </div>
      
      <!-- Ergonomic Viewport Quick Bar -->
      <div class="viewport-quick-bar">
        <select data-role="view-mode" title="${t("View mode: Camera (Numpad 0), Perspective (Numpad 1), Top (7), Side (3)")}">
          <option value="camera">${t("Camera View")}</option>
          <option value="perspective">${t("Perspective")}</option>
          <option value="top">${t("Top View")}</option>
          <option value="right">${t("Right Side")}</option>
          <option value="left">${t("Left Side")}</option>
          <option value="bottom">${t("Bottom View")}</option>
        </select>
        <span class="quick-divider"></span>
        <button class="icon-button" data-act="focus-target" title="${t("Frame Subject Target (F)")}"><i class="pi pi-search"></i></button>
        <button class="icon-button" data-act="toggle-camera-view" title="${t("Toggle Camera Previews Strip")}"><i class="pi pi-video"></i></button>
        <span class="quick-divider"></span>
        <button class="icon-button active" data-select-mode="object" title="${t("Object Select Mode (4)")}"><i class="pi pi-box" style="font-size:10px"></i></button>
        <button class="icon-button" data-select-mode="vertex" title="${t("Vertex Select Mode (1)")}"><i class="pi pi-circle" style="font-size:10px"></i></button>
        <button class="icon-button" data-select-mode="edge" title="${t("Edge Select Mode (2)")}"><i class="pi pi-minus" style="font-size:10px"></i></button>
        <button class="icon-button" data-select-mode="face" title="${t("Face / Polygon Select Mode (3)")}"><i class="pi pi-stop" style="font-size:10px"></i></button>
        <span class="quick-divider"></span>
        <button class="icon-button active" data-transform-mode="translate" title="${t("Translate / Move (W)")}">W</button>
        <button class="icon-button" data-transform-mode="rotate" title="${t("Rotate (E)")}">E</button>
        <button class="icon-button" data-transform-mode="scale" title="${t("Scale (R)")}">R</button>
        <button class="icon-button" data-act="clear-selection" title="${t("Select Tool (Q)")}">Q</button>
        <span class="quick-divider"></span>
        <button class="primary" data-act="record" title="${t("Record proxy playblast")}"><i class="pi pi-video"></i> ${t("Playblast")}</button>
        <button class="icon-button" data-act="toggle-inspector" title="${t("Toggle Inspector Panel (N)")}"><i class="pi pi-sliders-h"></i></button>
      </div>

      <!-- Modern Glassmorphic HUD -->
      <div class="hud" data-role="hud"></div>

      <!-- Tabbed 3D Inspector Drawer -->
      <div class="viewport-inspector" data-role="viewport-inspector">
        <div class="inspector-tabs">
          <button class="inspector-tab active" data-tab="scene"><i class="pi pi-box"></i> ${t("Scene")}</button>
          <button class="inspector-tab" data-tab="camera"><i class="pi pi-video"></i> ${t("Camera")}</button>
          <button class="inspector-tab" data-tab="display"><i class="pi pi-eye"></i> ${t("Display")}</button>
        </div>

        <!-- TAB 1: Scene & Objects -->
        <div class="inspector-tab-content" data-tab-panel="scene">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <div class="menu-title" style="margin:0">${t("Outliner")}</div>
            <button data-act="load-model" class="icon-button" style="width:20px;height:20px;min-width:20px;border-radius:4px" title="${t("Import 3D Model (+)")}"><i class="pi pi-plus" style="font-size:10px"></i></button>
          </div>
          <div style="display:flex;gap:3px;margin-bottom:6px;overflow-x:auto">
            <button data-object-type="ground" style="font-size:10px;padding:2px 5px" title="${t("Add Ground (+)")}"><i class="pi pi-minus"></i> ${t("Ground")}</button>
            <button data-object-type="cube" style="font-size:10px;padding:2px 5px" title="${t("Add Cube (+)")}"><i class="pi pi-stop"></i> ${t("Cube")}</button>
            <button data-object-type="sphere" style="font-size:10px;padding:2px 5px" title="${t("Add Sphere (+)")}"><i class="pi pi-circle"></i> ${t("Sphere")}</button>
            <button data-object-type="human" style="font-size:10px;padding:2px 5px" title="${t("Add Human (+)")}"><i class="pi pi-user"></i> ${t("Human")}</button>
            <button data-object-type="null" style="font-size:10px;padding:2px 5px" title="${t("Add Null (+)")}"><i class="pi pi-plus"></i> ${t("Null")}</button>
          </div>
          <div class="scene-tree" data-role="objects"></div>
          
          <div class="entity-panel" data-role="object-panel">
            <div class="menu-title" data-role="selected-name">${t("Object Transform")}</div>
            <div class="transform-tools">
              <button data-transform-mode="translate" title="${t("Translate (W)")}">W</button>
              <button data-transform-mode="rotate" title="${t("Rotate (E)")}">E</button>
              <button data-transform-mode="scale" title="${t("Scale (R)")}">R</button>
              <select data-role="gizmo-space" title="${t("Transform space")}"><option value="world">${t("World")}</option><option value="local">${t("Local")}</option></select>
            </div>
            <div class="animation-row" style="display:flex;align-items:center;gap:6px"><i class="pi pi-palette"></i><select data-role="object-material" style="flex:1" title="${t("Viewport material")}"><option value="textured">${t("Textures")}</option><option value="checker">${t("Checker")}</option><option value="neutral">${t("Neutral")}</option><option value="wireframe">${t("Wireframe")}</option></select><input data-role="object-color" type="color" value="#8c929b" title="${t("Object Color")}" style="width:28px;height:24px;padding:0;cursor:pointer;background:transparent;border:1px solid #555;border-radius:4px"></div>
            <div class="animation-row"><i class="pi pi-sitemap"></i><select data-role="object-parent" title="${t("Parent object")}"><option value="">${t("No parent")}</option></select></div>
            <div class="viewport-grid" style="margin-top:6px">
              <label><span><strong class="axis-badge axis-x">X</strong> ${t("Pos")}</span><input data-role="object-x" type="number" step="0.1"></label>
              <label><span><strong class="axis-badge axis-y">Y</strong> ${t("Pos")}</span><input data-role="object-y" type="number" step="0.1"></label>
              <label><span><strong class="axis-badge axis-z">Z</strong> ${t("Pos")}</span><input data-role="object-z" type="number" step="0.1"></label>
              <label><span><strong class="axis-badge axis-x">X</strong> ${t("Rot")}</span><input data-role="object-rx" type="number" step="1"></label>
              <label><span><strong class="axis-badge axis-y">Y</strong> ${t("Rot")}</span><input data-role="object-ry" type="number" step="1"></label>
              <label><span><strong class="axis-badge axis-z">Z</strong> ${t("Rot")}</span><input data-role="object-rz" type="number" step="1"></label>
              <label><span><strong class="axis-badge axis-x">X</strong> ${t("Scale")}</span><input data-role="object-sx" type="number" min="0.01" step="0.1"></label>
              <label><span><strong class="axis-badge axis-y">Y</strong> ${t("Scale")}</span><input data-role="object-sy" type="number" min="0.01" step="0.1"></label>
              <label><span><strong class="axis-badge axis-z">Z</strong> ${t("Scale")}</span><input data-role="object-sz" type="number" min="0.01" step="0.1"></label>
            </div>
            <div class="animation-row" data-role="animation-row" hidden><i class="pi pi-play-circle"></i><select data-role="animation-select" title="${t("Animation clip")}"></select></div>
          </div>
          <div class="animation-row" style="margin-top:8px"><i class="pi pi-images"></i><select data-role="reference-select" title="${t("Upstream reference")}"><option value="0">${t("Upstream 1")}</option></select></div>
        </div>

        <!-- TAB 2: Camera & Optic -->
        <div class="inspector-tab-content" data-tab-panel="camera" hidden>
          <div class="menu-title">${t("Active Camera")}</div>
          <div class="animation-row" style="margin-bottom:5px;display:flex;align-items:center;gap:6px">
            <i class="pi pi-video"></i>
            <select data-role="active-camera-select" style="flex:1" title="${t("Switch Active Camera")}"></select>
            <input data-role="camera-color" type="color" value="#4aa3ef" title="${t("Camera Color")}" style="width:28px;height:24px;padding:0;cursor:pointer;background:transparent;border:1px solid #555;border-radius:4px">
          </div>
          <div style="display:flex;gap:4px;margin-bottom:8px">
            <button data-act="add-camera" class="icon-button" style="flex:1;font-size:11px" title="${t("Create camera from current view")}"><i class="pi pi-plus"></i> ${t("Add Camera")}</button>
            <button data-act="reset-camera" class="icon-button" style="font-size:11px;padding:0 6px" title="${t("Reset active camera")}"><i class="pi pi-refresh"></i></button>
          </div>

          <div class="menu-title">${t("Look-At Tracking Constraint")}</div>
          <div class="animation-row" style="margin-bottom:5px">
            <i class="pi pi-crosshairs"></i>
            <select data-role="camera-target-object" title="${t("Track / Follow Moving Target Object")}">
              <option value="">${t("Manual Target (No Tracking)")}</option>
            </select>
          </div>
          <div style="display:flex;gap:4px;margin-bottom:8px">
            <button data-act="aim-at-object" class="primary" style="flex:1" title="${t("Aim & Follow object along timeline")}"><i class="pi pi-compass"></i> ${t("Aim & Follow")}</button>
            <button data-act="bake-aim-keys" style="padding:0 6px" title="${t("Bake live target tracking to camera keyframes")}"><i class="pi pi-check-square"></i> ${t("Bake")}</button>
          </div>

          <div class="menu-title">${t("Camera Transform & Lens")}</div>
          <div style="display:flex;gap:4px;margin-bottom:6px">
            <label style="flex:1;font-size:11px">${t("Type")} <select data-role="camera-type"><option value="perspective">${t("Perspective")}</option><option value="orthographic">${t("Orthographic")}</option></select></label>
            <label style="flex:1;font-size:11px">${t("Speed")} <input data-role="speed" type="number" min="0.05" max="5" step="0.05" value="1"></label>
          </div>
          <div class="viewport-grid">
            <label><span><strong class="axis-badge axis-x">X</strong> ${t("Pos")}</span><input data-role="camera-px" type="number" step="0.1"></label>
            <label><span><strong class="axis-badge axis-y">Y</strong> ${t("Pos")}</span><input data-role="camera-py" type="number" step="0.1"></label>
            <label><span><strong class="axis-badge axis-z">Z</strong> ${t("Pos")}</span><input data-role="camera-pz" type="number" step="0.1"></label>
            <label><span><strong class="axis-badge axis-x">X</strong> ${t("Tgt")}</span><input data-role="camera-tx" type="number" step="0.1"></label>
            <label><span><strong class="axis-badge axis-y">Y</strong> ${t("Tgt")}</span><input data-role="camera-ty" type="number" step="0.1"></label>
            <label><span><strong class="axis-badge axis-z">Z</strong> ${t("Tgt")}</span><input data-role="camera-tz" type="number" step="0.1"></label>
            <label><span>${t("FOV")}</span><input data-role="camera-fov" type="number" min="5" max="150" step="0.1"></label>
            <label><span>${t("Roll")}</span><input data-role="camera-roll" type="number" min="-180" max="180" step="0.1"></label>
            <label><span>${t("Near")}</span><input data-role="camera-near" type="number" min="0.0001" step="0.001"></label>
            <label><span>${t("Far")}</span><input data-role="camera-far" type="number" min="0.0002" step="1"></label>
          </div>
          
          <div class="menu-title" style="margin-top:8px">${t("Cinema Lens (35mm Equiv.)")}</div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:3px;margin-top:4px">
            <button data-lens="14" style="font-size:10px;padding:2px" title="${t("14mm Ultra-Wide")}"><i class="pi pi-eye"></i> 14mm</button>
            <button data-lens="24" style="font-size:10px;padding:2px" title="${t("24mm Cinematic Wide")}"><i class="pi pi-eye"></i> 24mm</button>
            <button data-lens="35" style="font-size:10px;padding:2px" title="${t("35mm Normal Wide")}"><i class="pi pi-eye"></i> 35mm</button>
            <button data-lens="50" style="font-size:10px;padding:2px" title="${t("50mm Standard Human Eye")}"><i class="pi pi-eye"></i> 50mm</button>
            <button data-lens="85" style="font-size:10px;padding:2px" title="${t("85mm Portrait Compression")}"><i class="pi pi-eye"></i> 85mm</button>
            <button data-lens="135" style="font-size:10px;padding:2px" title="${t("135mm Telephoto")}"><i class="pi pi-eye"></i> 135mm</button>
          </div>

          <div class="menu-title" style="margin-top:8px">${t("Blocking Scene Sets (Parallax / Occlusion)")}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:4px">
            <button data-blocking-scene="foreground_reveal" style="font-size:10px;padding:3px" title="${t("Foreground pillar sweep reveal")}"><i class="pi pi-objects-column"></i> ${t("FG Reveal")}</button>
            <button data-blocking-scene="doorway_pass" style="font-size:10px;padding:3px" title="${t("Push-in through doorway opening")}"><i class="pi pi-sign-in"></i> ${t("Doorway Pass")}</button>
            <button data-blocking-scene="over_the_shoulder" style="font-size:10px;padding:3px" title="${t("Over the shoulder frame")}"><i class="pi pi-user"></i> ${t("OTS Frame")}</button>
            <button data-blocking-scene="perspective_corridor" style="font-size:10px;padding:3px" title="${t("Perspective depth colonnade")}"><i class="pi pi-arrows-v"></i> ${t("Corridor")}</button>
            <button data-blocking-scene="tabletop_orbit" style="font-size:10px;padding:3px;grid-column:span 2" title="${t("Product pedestal 360 orbit")}"><i class="pi pi-sync"></i> ${t("Tabletop 360° Orbit")}</button>
          </div>

          <div class="menu-title" style="margin-top:8px">${t("Motion Presets")}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:4px">
            <button data-preset="orbit_360" style="font-size:10px;padding:3px"><i class="pi pi-compass"></i> ${t("Orbit 360°")}</button>
            <button data-preset="push_in" style="font-size:10px;padding:3px"><i class="pi pi-arrow-down-left"></i> ${t("Push In")}</button>
            <button data-preset="pull_out" style="font-size:10px;padding:3px"><i class="pi pi-arrow-up-right"></i> ${t("Pull Out")}</button>
            <button data-preset="dolly_zoom" style="font-size:10px;padding:3px"><i class="pi pi-sync"></i> ${t("Dolly Zoom")}</button>
          </div>

          <div class="menu-title" style="margin-top:8px">${t("Camera Shakes")}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:4px">
            <button data-shake="handheld" style="font-size:10px;padding:3px"><i class="pi pi-wave-pulse"></i> ${t("Handheld")}</button>
            <button data-shake="subtle" style="font-size:10px;padding:3px"><i class="pi pi-circle"></i> ${t("Subtle")}</button>
            <button data-shake="turbulence" style="font-size:10px;padding:3px"><i class="pi pi-bolt"></i> ${t("Turbulence")}</button>
            <button data-shake="crash" style="font-size:10px;padding:3px"><i class="pi pi-exclamation-triangle"></i> ${t("Crash")}</button>
          </div>
        </div>

        <!-- TAB 3: Display & Guides -->
        <div class="inspector-tab-content" data-tab-panel="display" hidden>
          <div class="menu-title">${t("Composition Guides & Mini-Map")}</div>
          <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px">
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-compass"></i> ${t("2D Radar Mini-Map")}</span><input data-role="show-radar" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-th-large"></i> ${t("Rule of Thirds")}</span><input data-role="guides" type="checkbox" checked></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-share-alt"></i> ${t("Wireframe / Edges")}</span><input data-role="show-wireframe" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-circle"></i> ${t("Mesh Vertices")}</span><input data-role="show-vertices" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span>${t("Selection Mode")}</span><select data-role="select-mode" style="font-size:11px"><option value="object">${t("Object (4)")}</option><option value="vertex">${t("Vertex (1)")}</option><option value="edge">${t("Edge (2)")}</option><option value="face">${t("Face (3)")}</option></select></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-shield"></i> ${t("Safe Areas (90%/80%)")}</span><input data-role="safe-areas" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-frame"></i> ${t("Resolution Gate")}</span><input data-role="resolution-gate" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span>${t("Aspect Ratio")}</span><select data-role="aspect-ratio" style="font-size:11px"><option value="auto">${t("Auto")}</option><option value="16:9">16:9</option><option value="4:3">4:3</option><option value="1:1">1:1</option><option value="9:16">9:16</option><option value="2.39:1">2.39:1</option></select></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-table"></i> ${t("Floor Grid")}</span><input data-role="playblast-grid" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-tag"></i> ${t("Burn-in Data")}</span><input data-role="burn-in" type="checkbox"></label>
            <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb"><span><i class="pi pi-chart-line"></i> ${t("Speed Map")}</span><input data-role="speed-heatmap" type="checkbox"></label>
          </div>
          <div class="menu-divider" style="margin:8px 0"></div>
          <div class="menu-title">${t("Environment & Background")}</div>
          <label style="display:flex;justify-content:space-between;align-items:center;color:#bbb;margin-top:4px">
            <span>${t("BG Color")}</span>
            <input data-role="viewport-bg-color" type="color" value="#121212" style="width:44px;height:22px;padding:0;cursor:pointer;background:transparent;border:1px solid #555">
          </label>
          <div style="display:flex;gap:3px;margin-top:6px">
            <button data-act="upload-viewport-bg" style="flex:1;font-size:10px"><i class="pi pi-image"></i> ${t("Image")}</button>
            <button data-act="upload-viewport-bg-seq" style="flex:1;font-size:10px"><i class="pi pi-images"></i> ${t("Sequence")}</button>
            <button data-act="clear-viewport-bg" style="width:24px;padding:0" title="${t("Clear Background")}"><i class="pi pi-trash"></i></button>
          </div>
        </div>
      </div>
    </div>
    <div class="camera-view-row" data-role="camera-view-row"><div class="camera-preview-strip" data-role="camera-previews"></div><button class="camera-strip-close" data-act="toggle-camera-view" title="${t("Hide camera previews")}"><i class="pi pi-times"></i></button></div>
    <div class="timeline">
      <div class="row timeline-toolbar">
        <!-- Transport Cluster -->
        <div class="timeline-group" title="${t("Playback Transport")}">
          <button class="icon-button" data-act="key-first" title="${t("First Frame (Home)")}" aria-label="${t("Go to first frame")}"><i class="pi pi-step-backward-alt"></i></button>
          <button class="icon-button" data-act="previous-key" title="${t("Previous Keyframe (, / Up Arrow)")}" aria-label="${t("Previous keyframe")}"><i class="pi pi-fast-backward"></i></button>
          <button class="icon-button" data-act="previous-frame" title="${t("Previous Frame (Left Arrow)")}" aria-label="${t("Previous frame")}"><i class="pi pi-step-backward"></i></button>
          <button class="icon-button primary-play" data-act="play" title="${t("Play / Stop (Space)")}" aria-label="${t("Play timeline")}"><i class="pi pi-play"></i></button>
          <button class="icon-button" data-act="next-frame" title="${t("Next Frame (Right Arrow)")}" aria-label="${t("Next frame")}"><i class="pi pi-step-forward"></i></button>
          <button class="icon-button" data-act="next-key" title="${t("Next Keyframe (. / Down Arrow)")}" aria-label="${t("Next keyframe")}"><i class="pi pi-fast-forward"></i></button>
          <button class="icon-button" data-act="key-last" title="${t("Last Frame (End)")}" aria-label="${t("Go to last frame")}"><i class="pi pi-step-forward-alt"></i></button>
          <button class="icon-button" data-act="loop" title="${t("Toggle Loop Playback")}" aria-label="${t("Loop playback")}" aria-pressed="false"><i class="pi pi-replay"></i></button>
        </div>

        <!-- Keyframing Cluster -->
        <div class="timeline-group" title="${t("Keyframe Tools")}">
          <button class="icon-button primary-key" data-act="key" title="${t("Insert / Update Keyframe at Playhead (I)")}" aria-label="${t("Insert or update key")}"><i class="pi pi-key"></i></button>
          <button class="icon-button auto-key-btn" data-act="auto-key" title="${t("Auto-Key: Records moves live while scrubbing/navigating")}" aria-label="${t("Toggle Auto Key")}" aria-pressed="false"><i class="pi pi-circle-fill" style="color:#ef4444;font-size:11px"></i></button>
          <button class="icon-button" data-act="delete-key" title="${t("Delete Selected Keyframe (Del / Backspace)")}" aria-label="${t("Delete selected key")}"><i class="pi pi-trash"></i></button>
          <button class="icon-button" data-act="copy-key" title="${t("Copy Keyframe (Ctrl+C)")}" aria-label="${t("Copy selected key")}"><i class="pi pi-copy"></i></button>
          <button class="icon-button" data-act="paste-key" title="${t("Paste Keyframe at Playhead (Ctrl+V)")}" aria-label="${t("Paste key at playhead")}"><i class="pi pi-clipboard"></i></button>
        </div>

        <!-- Time & Scrub Cluster -->
        <div class="timeline-group" style="flex:1;min-width:240px">
          <span class="timeline-badge" style="font-weight:700;color:#f2d06b">F</span>
          <input data-role="frame" type="number" min="0" value="0" style="width:52px;text-align:center;font-weight:700">
          <input data-role="scrub" type="range" min="0" max="119" value="0" style="flex:1">
          <span data-role="time" class="time-display" title="${t("Click to toggle Time / Timecode")}" style="cursor:pointer;font-family:monospace;font-size:11px;padding:2px 4px;background:#131318;border-radius:3px">00:00.000</span>
        </div>

        <!-- Range, Snapping & Settings Cluster -->
        <div class="timeline-group">
          <label style="font-size:10px">${t("Dur")} <input data-role="duration-seconds" type="number" min="0.25" max="120" step="0.25" value="5" style="width:42px"></label>
          <label style="font-size:10px">${t("FPS")} <input data-role="timeline-fps" type="number" min="1" max="120" step="1" value="24" style="width:38px"></label>
          <button class="icon-button" data-act="range-start" title="${t("Set In Point at Playhead ([)")}" style="font-weight:700;font-size:11px">[</button>
          <button class="icon-button" data-act="range-end" title="${t("Set Out Point at Playhead (])")}" style="font-weight:700;font-size:11px">]</button>
          <button class="icon-button" data-act="range-clear" title="${t("Clear Playback Range")}" style="font-size:10px"><i class="pi pi-times"></i></button>
          <button class="icon-button" data-act="toggle-snap" title="${t("Toggle Snapping")}" aria-pressed="true"><i class="pi pi-thumbtack"></i></button>
          <label style="font-size:10px">${t("Snap")} <input data-role="snap-frames" type="number" min="1" max="24" step="1" value="1" style="width:34px"></label>
          <button class="icon-button" data-act="fit-timeline" title="${t("Fit Timeline to View (F)")}"><i class="pi pi-arrows-alt"></i></button>
        </div>
        <span class="timeline-summary" data-role="timeline-summary">${t("1 key")}</span>
      </div>
      <div class="keys" data-role="keys" tabindex="0" aria-label="${t("Camera keyframe timeline")}"></div>
      <details class="curve-editor" open><summary title="${t("Open or close the animation curve editor")}"><i class="pi pi-chart-line"></i><strong data-role="curve-title">${t("Camera Curve Editor")}</strong><span class="hint">${t("MMB/Alt-drag: Pan · Scroll: Zoom · Box Select: Drag · Drag Point: Retime/Value · Right-click: Menu")}</span></summary><div class="curve-toolbar"><select data-role="curve-group" title="${t("Choose the animated channels displayed in the graph")}"><option value="position">${t("Position XYZ")}</option><option value="target">${t("Target XYZ")}</option><option value="lens">${t("FOV / Roll / Zoom")}</option></select><button class="curve-mode active" data-channel-filter="all" title="${t("Show all curves in group")}">${t("All")}</button><button class="curve-mode" data-channel-filter="0" title="${t("Solo channel 1")}"><span class="ch-dot" style="background:#ef5350"></span>${t("X")}</button><button class="curve-mode" data-channel-filter="1" title="${t("Solo channel 2")}"><span class="ch-dot" style="background:#53d86a"></span>${t("Y")}</button><button class="curve-mode" data-channel-filter="2" title="${t("Solo channel 3")}"><span class="ch-dot" style="background:#4aa3ef"></span>${t("Z")}</button><span class="toolbar-divider"></span><button class="curve-mode" data-curve-mode="linear" title="${t("Straight interpolation after the selected key")}">${t("Linear")}</button><button class="curve-mode" data-curve-mode="smooth" title="${t("Smooth interpolation after the selected key")}">${t("Smooth")}</button><button class="curve-mode" data-curve-mode="bezier" title="${t("Bézier easing after the selected key")}">${t("Bezier")}</button><button class="curve-mode" data-curve-mode="ease_in" title="${t("Ease into motion after the selected key")}">${t("Ease In")}</button><button class="curve-mode" data-curve-mode="ease_out" title="${t("Ease out of motion after the selected key")}">${t("Ease Out")}</button><button class="curve-mode" data-curve-mode="ease" title="${t("Ease in and out after the selected key")}">${t("Ease In/Out")}</button><button class="curve-mode active" data-act="curve-handles" title="${t("Show or hide Bézier tangent handles")}" aria-pressed="true"><i class="pi pi-share-alt"></i> ${t("Handles")}</button><span class="toolbar-divider"></span><span class="hint">${t("Tangents")}</span><button class="curve-mode" data-tangent-mode="auto" title="${t("Automatic smooth tangents")}">${t("Auto")}</button><button class="curve-mode" data-tangent-mode="vector" title="${t("Straight (vector) tangents")}">${t("Vector")}</button><button class="curve-mode" data-tangent-mode="free" title="${t("Independent broken tangent handles")}">${t("Free")}</button><button class="curve-mode" data-tangent-mode="aligned" title="${t("Mirrored collinear tangent handles")}">${t("Aligned")}</button><button class="curve-mode" data-tangent-mode="flat" title="${t("Horizontal flat tangent handles")}">${t("Flat")}</button><span class="toolbar-divider"></span><button class="curve-mode" data-act="curve-zoom-in" title="${t("Zoom in curve editor (Mouse wheel)")}"><i class="pi pi-search-plus"></i></button><button class="curve-mode" data-act="curve-zoom-out" title="${t("Zoom out curve editor")}"><i class="pi pi-search-minus"></i></button><button class="curve-mode" data-act="curve-fit" title="${t("Fit curves to view")}"><i class="pi pi-arrows-alt"></i> ${t("Fit")}</button></div><canvas class="curve-canvas" data-role="curve-canvas" title="${t("Drag a key point vertically or drag tangent handles on either side. Scroll to zoom. Right-click for curve actions.")}"></canvas></details>
      <details class="compact-panel key-editor" data-role="key-editor" data-empty="false" open><summary><i class="pi pi-key"></i><strong data-role="selected-key-label">${t("Key @ 0")}</strong><span class="hint">${t("yellow selected · red editing")}</span></summary><div class="panel-body">
        <div class="key-editor-header">
          <button class="icon-button" data-act="update-key" title="${t("Update key from current 3D view")}" aria-label="${t("Update key from current view")}"><i class="pi pi-refresh"></i></button>
          <button class="icon-button" data-act="view-key" title="${t("Jump Playhead & View to Key")}" aria-label="${t("Load selected key view")}"><i class="pi pi-eye"></i></button>
          <div class="key-interp-buttons" style="margin-left:auto">
            <button type="button" class="key-interp-btn active" data-interp="ease" title="${t("Ease In & Out (Default smooth transition)")}">Ease</button>
            <button type="button" class="key-interp-btn" data-interp="smooth" title="${t("Smooth Catmull-Rom spline")}">Smooth</button>
            <button type="button" class="key-interp-btn" data-interp="bezier" title="${t("Bézier curve with editable handles")}">Bezier</button>
            <button type="button" class="key-interp-btn" data-interp="linear" title="${t("Linear constant-velocity line")}">Linear</button>
            <button type="button" class="key-interp-btn" data-interp="ease_in" title="${t("Ease In (Slow start)")}">Ease In</button>
            <button type="button" class="key-interp-btn" data-interp="ease_out" title="${t("Ease Out (Slow stop)")}">Ease Out</button>
            <button type="button" class="key-interp-btn" data-interp="hold" title="${t("Hold / Step (Freeze until next key)")}">Hold</button>
          </div>
        </div>
        <div class="key-editor-grid">
          <label>${t("Frame")} <input data-role="key-frame" type="number" min="0" value="0"></label>
          <label>${t("Interpolation")} <select data-role="key-interp"><option value="ease">${t("Ease")}</option><option value="smooth">${t("Smooth")}</option><option value="bezier">${t("Bezier")}</option><option value="linear">${t("Linear")}</option><option value="ease_in">${t("Ease In")}</option><option value="ease_out">${t("Ease Out")}</option><option value="hold">${t("Hold")}</option></select></label>
          <label>${t("Pos X")} <input data-role="key-px" type="number" step="0.1"></label><label>${t("Pos Y")} <input data-role="key-py" type="number" step="0.1"></label><label>${t("Pos Z")} <input data-role="key-pz" type="number" step="0.1"></label>
          <label>${t("Target X")} <input data-role="key-tx" type="number" step="0.1"></label><label>${t("Target Y")} <input data-role="key-ty" type="number" step="0.1"></label><label>${t("Target Z")} <input data-role="key-tz" type="number" step="0.1"></label>
          <label>${t("FOV")} <input data-role="key-fov" type="number" min="5" max="150" step="0.1"></label><label>${t("Roll")} <input data-role="key-roll" type="number" min="-180" max="180" step="0.1"></label><label>${t("Zoom")} <input data-role="key-zoom" type="number" min="0.01" step="0.05"></label><label>${t("Near Clip")} <input data-role="key-near" type="number" min="0.0001" step="0.001"></label><label>${t("Far Clip")} <input data-role="key-far" type="number" min="0.0002" step="1"></label>
          <label>${t("Camera")} <select data-role="key-camera-type"><option value="perspective">${t("Perspective")}</option><option value="orthographic">${t("Orthographic")}</option></select></label>
        </div></div></details>
    </div>
    <details class="help"><summary>${t("OmniCam help")}</summary><p>${t("Compose a frame, press I, scrub, move the camera and press I again. Space previews the move; Playblast records the neutral motion reference.")}</p><p>${t("The proxy communicates camera motion, not final appearance. Use H3 Setup for Omni Reference, Wan Native Camera for core Plücker conditioning, or the pinned ATI/LTX adapters for their supported workflows.")}</p></details>`;
  const contextMenu = document.createElement("div");
  contextMenu.className = "context-menu";
  contextMenu.dataset.role = "context-menu";
  contextMenu.setAttribute("role", "menu");
  contextMenu.hidden = true;
  root.appendChild(contextMenu);
  return root;
}
