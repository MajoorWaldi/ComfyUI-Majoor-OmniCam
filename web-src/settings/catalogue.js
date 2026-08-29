// The ComfyUI settings catalogue: pure data, no runtime state.
//
// Registered through `app.registerExtension({ settings })`, which is the current
// API -- `app.ui.settings.addSetting()` is deprecated in the ComfyUI frontend.
//
// Every entry here is a *preference*: the value a newly created Director node
// starts from. A saved workflow always wins, because ComfyUI restores node
// widgets after nodeCreated() runs. The two exceptions are Language and Studio
// quality, which apply to already-open editors through their onChange.
//
// The settings dialog groups by the `category` path, so the third segment is
// the group heading a user actually sees.

const CATEGORY = ["OmniCam", "Director"];

export const SETTING_LOCALE = "MajoorOmniCam.Locale";

// Output & recording
export const SETTING_FPS = "MajoorOmniCam.Defaults.Fps";
export const SETTING_DURATION = "MajoorOmniCam.Defaults.DurationSeconds";
export const SETTING_WIDTH = "MajoorOmniCam.Defaults.Width";
export const SETTING_HEIGHT = "MajoorOmniCam.Defaults.Height";
export const SETTING_RENDER_MODE = "MajoorOmniCam.Defaults.RenderMode";
export const SETTING_ENCODER = "MajoorOmniCam.Defaults.Encoder";
export const SETTING_PLAYBLAST_RESOLUTION = "MajoorOmniCam.Defaults.PlayblastResolution";
export const SETTING_PLAYBLAST_GRID = "MajoorOmniCam.Defaults.PlayblastGrid";

// Proxy look
export const SETTING_POINT_DENSITY = "MajoorOmniCam.Proxy.PointDensity";
export const SETTING_POINT_SPREAD = "MajoorOmniCam.Proxy.PointSpread";
export const SETTING_POINT_COLOR = "MajoorOmniCam.Proxy.PointColor";
export const SETTING_CARD_FIT = "MajoorOmniCam.Proxy.CardFit";

// Viewport
export const SETTING_QUALITY = "MajoorOmniCam.Viewport.Quality";
export const SETTING_ADAPTIVE = "MajoorOmniCam.Viewport.Adaptive";
export const SETTING_BG_COLOR = "MajoorOmniCam.Viewport.BackgroundColor";

// Display toggles
export const SETTING_SHOW_GRID = "MajoorOmniCam.Display.Grid";
export const SETTING_SHOW_RADAR = "MajoorOmniCam.Display.Radar";
export const SETTING_SHOW_CAMERA_PATHS = "MajoorOmniCam.Display.CameraPaths";
export const SETTING_SHOW_CAMERA_GIZMOS = "MajoorOmniCam.Display.CameraGizmos";
export const SETTING_SHOW_LOOK_AT = "MajoorOmniCam.Display.LookAt";
export const SETTING_SHOW_HELPER_AXES = "MajoorOmniCam.Display.HelperAxes";
export const SETTING_SHOW_GIZMO = "MajoorOmniCam.Display.Gizmo";
export const SETTING_GUIDES = "MajoorOmniCam.Display.Guides";
export const SETTING_SAFE_AREAS = "MajoorOmniCam.Display.SafeAreas";
export const SETTING_RESOLUTION_GATE = "MajoorOmniCam.Display.ResolutionGate";
export const SETTING_ASPECT_RATIO = "MajoorOmniCam.Display.AspectRatio";
export const SETTING_BURN_IN = "MajoorOmniCam.Display.BurnIn";
export const SETTING_SPEED_HEATMAP = "MajoorOmniCam.Display.SpeedHeatmap";
export const SETTING_SHOW_WIREFRAME = "MajoorOmniCam.Display.Wireframe";
export const SETTING_SHOW_VERTICES = "MajoorOmniCam.Display.Vertices";

// Modelling / manipulation tools
export const SETTING_SELECT_MODE = "MajoorOmniCam.Tools.SelectMode";
export const SETTING_GIZMO_MODE = "MajoorOmniCam.Tools.GizmoMode";
export const SETTING_GIZMO_SPACE = "MajoorOmniCam.Tools.GizmoSpace";
export const SETTING_SNAP_MODE = "MajoorOmniCam.Tools.SpatialSnapMode";
export const SETTING_SNAP_GRID_SIZE = "MajoorOmniCam.Tools.SpatialGridSize";

// Navigation
export const SETTING_NAVIGATION_PROFILE = "MajoorOmniCam.Navigation.Profile";
export const SETTING_FLY_SPEED = "MajoorOmniCam.Navigation.FlySpeed";
export const SETTING_VIEW_MODE = "MajoorOmniCam.Navigation.ViewMode";

// Timeline
export const SETTING_SNAP_ENABLED = "MajoorOmniCam.Timeline.SnapEnabled";
export const SETTING_SNAP_FRAMES = "MajoorOmniCam.Timeline.SnapFrames";
export const SETTING_AUTO_KEY = "MajoorOmniCam.Timeline.AutoKey";
export const SETTING_TIMECODE_MODE = "MajoorOmniCam.Timeline.TimecodeMode";
export const SETTING_LOOP_PLAYBACK = "MajoorOmniCam.Timeline.LoopPlayback";

// Interface layout
export const SETTING_UI_DENSITY = "MajoorOmniCam.Interface.Density";
export const SETTING_PREVIEW_LAYOUT = "MajoorOmniCam.Interface.PreviewLayout";
export const SETTING_CAMERA_VIEW_VISIBLE = "MajoorOmniCam.Interface.CameraPreviews";

export const SETTING_UNDO_LIMIT = "MajoorOmniCam.History.Limit";

/** Shorthand for the many on/off preferences, which are otherwise identical. */
function toggle(id, group, name, tooltip, defaultValue) {
  return { id, category: [...CATEGORY, group], name, tooltip, type: "boolean", defaultValue };
}

function choice(id, group, name, tooltip, options, defaultValue) {
  return { id, category: [...CATEGORY, group], name, tooltip, type: "combo", options, defaultValue };
}

function slider(id, group, name, tooltip, attrs, defaultValue) {
  return { id, category: [...CATEGORY, group], name, tooltip, type: "slider", attrs, defaultValue };
}

/**
 * @param {object} handlers - `onLocaleChange` and `onQualityChange` are injected
 *   rather than imported, so this data module never depends on the runtime that
 *   consumes it.
 */
export function buildOmniCamSettings({ onLocaleChange, onQualityChange } = {}) {
  return [
    {
      id: SETTING_LOCALE,
      category: [...CATEGORY, "Language"],
      name: "Viewport language",
      tooltip: "Language of the OmniCam Director viewport. 'Follow ComfyUI' uses the ComfyUI locale.",
      type: "combo",
      options: [
        { text: "Follow ComfyUI", value: "auto" },
        { text: "English", value: "en" },
        { text: "Français", value: "fr" },
      ],
      defaultValue: "auto",
      onChange: () => onLocaleChange?.(),
    },

    slider(SETTING_FPS, "Defaults", "Default FPS",
      "Frame rate applied to newly created Director nodes.", { min: 1, max: 120, step: 1 }, 24),
    slider(SETTING_DURATION, "Defaults", "Default duration (seconds)",
      "Timeline duration applied to newly created Director nodes.", { min: 1, max: 120, step: 1 }, 5),
    slider(SETTING_WIDTH, "Defaults", "Default width",
      "Output width applied to newly created Director nodes.", { min: 64, max: 4096, step: 16 }, 1280),
    slider(SETTING_HEIGHT, "Defaults", "Default height",
      "Output height applied to newly created Director nodes.", { min: 64, max: 4096, step: 16 }, 720),
    choice(SETTING_RENDER_MODE, "Defaults", "Default proxy render mode",
      "Render mode applied to newly created Director nodes.",
      ["omni_ref", "graybox", "grid", "point_field", "wireframe", "card_grid", "beauty"], "omni_ref"),
    choice(SETTING_ENCODER, "Defaults", "Default playblast encoder",
      "WebCodecs is deterministic; realtime is the MediaRecorder fallback.", [
        { text: "WebCodecs (deterministic)", value: "auto" },
        { text: "Realtime fallback", value: "realtime" },
      ], "auto"),
    choice(SETTING_PLAYBLAST_RESOLUTION, "Defaults", "Default playblast resolution",
      "Drawing-buffer size of the recorded playblast. 'Match node output' locks it to the node's width x height.", [
        { text: "Viewport (fast)", value: "viewport" },
        { text: "Half of node output", value: "half" },
        { text: "Match node output", value: "output" },
        { text: "2x node output (sharp)", value: "double" },
      ], "viewport"),
    toggle(SETTING_PLAYBLAST_GRID, "Defaults", "Keep the grid in the playblast",
      "Records the floor grid into the playblast instead of hiding it for the capture.", false),

    choice(SETTING_POINT_DENSITY, "Proxy", "Default point density",
      "Point count of the omni-reference point field.",
      ["none", "sparse", "balanced", "dense", "ultra"], "balanced"),
    choice(SETTING_POINT_SPREAD, "Proxy", "Default point spread",
      "How the reference points are distributed around the scene.", [
        { text: "All views (full 3D)", value: "all_views" },
        { text: "Ground + low angle", value: "ground_focus" },
        { text: "Spherical dome", value: "dome" },
      ], "all_views"),
    { id: SETTING_POINT_COLOR, category: [...CATEGORY, "Proxy"], name: "Default point colour",
      tooltip: "Colour of the reference point field.", type: "color", defaultValue: "cbd5e1" },
    choice(SETTING_CARD_FIT, "Proxy", "Default card fit",
      "How media is fitted inside a subject card.", [
        { text: "Fit (contain)", value: "contain" },
        { text: "Fill (cover)", value: "cover" },
        { text: "Stretch", value: "stretch" },
      ], "contain"),

    {
      id: SETTING_QUALITY,
      category: [...CATEGORY, "Viewport"],
      name: "Studio quality",
      tooltip: "Image-based lighting and soft shadows in the editing viewport. Lower it on a modest GPU.",
      type: "combo",
      options: [
        { text: "Low (no shadows)", value: "low" },
        { text: "Balanced", value: "balanced" },
        { text: "High (2048px shadows)", value: "high" },
      ],
      defaultValue: "balanced",
      onChange: (value) => onQualityChange?.(value),
    },
    toggle(SETTING_ADAPTIVE, "Viewport", "Drop quality when the viewport stutters",
      "Steps the studio quality down automatically if navigation falls below ~40fps, and leaves it there for the session.", true),
    { id: SETTING_BG_COLOR, category: [...CATEGORY, "Viewport"], name: "Default background colour",
      tooltip: "Viewport background. Leave it at the default to keep the studio sky.",
      type: "color", defaultValue: "121212" },

    toggle(SETTING_SHOW_GRID, "Display", "Show grid by default",
      "Shows the viewport floor grid on newly created Director nodes.", true),
    toggle(SETTING_SHOW_RADAR, "Display", "Show camera mini-map by default",
      "Shows the radar mini-map on newly created Director nodes.", false),
    toggle(SETTING_SHOW_CAMERA_PATHS, "Display", "Show camera paths by default",
      "Shows camera trajectories on newly created Director nodes.", true),
    toggle(SETTING_SHOW_CAMERA_GIZMOS, "Display", "Show camera gizmos by default",
      "Shows camera bodies and frustums on newly created Director nodes.", true),
    toggle(SETTING_SHOW_LOOK_AT, "Display", "Show look-at targets by default",
      "Shows camera look-at lines and target crosshairs on newly created Director nodes.", true),
    toggle(SETTING_SHOW_HELPER_AXES, "Display", "Show helper axes by default",
      "Shows null-object axis helpers on newly created Director nodes.", true),
    toggle(SETTING_SHOW_GIZMO, "Display", "Show transform gizmo by default",
      "Shows transform and axis gizmos on newly created Director nodes.", true),
    toggle(SETTING_GUIDES, "Display", "Show rule-of-thirds guides by default",
      "Shows the rule-of-thirds grid and centre crosshair in camera view.", true),
    toggle(SETTING_SAFE_AREAS, "Display", "Show safe areas by default",
      "Shows the 90% action-safe and 80% title-safe rectangles.", false),
    toggle(SETTING_RESOLUTION_GATE, "Display", "Show resolution gate by default",
      "Masks the viewport down to the node's output width x height.", false),
    choice(SETTING_ASPECT_RATIO, "Display", "Default aspect ratio",
      "Framing ratio used by the resolution gate. 'Auto' follows the node output.",
      ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"], "auto"),
    toggle(SETTING_BURN_IN, "Display", "Show burn-in data by default",
      "Overlays frame, fps, FOV and render mode along the bottom of the viewport.", false),
    toggle(SETTING_SPEED_HEATMAP, "Display", "Show speed map by default",
      "Colours the camera path by travel speed.", false),
    toggle(SETTING_SHOW_WIREFRAME, "Display", "Show wireframe by default",
      "Draws mesh edges over scene objects. Skinned models follow their animation.", false),
    toggle(SETTING_SHOW_VERTICES, "Display", "Show mesh vertices by default",
      "Draws mesh vertices as points over scene objects.", false),

    choice(SETTING_SELECT_MODE, "Tools", "Default selection mode",
      "Component level the viewport selects at.",
      ["object", "vertex", "edge", "face"], "object"),
    choice(SETTING_GIZMO_MODE, "Tools", "Default transform mode",
      "Transform the gizmo starts in.",
      ["translate", "rotate", "scale"], "translate"),
    choice(SETTING_GIZMO_SPACE, "Tools", "Default gizmo space",
      "World-aligned axes, or the selected object's own orientation.",
      ["world", "local"], "world"),
    choice(SETTING_SNAP_MODE, "Tools", "Default spatial snapping",
      "Snap dragged transforms to a grid increment or to nearby vertices.", [
        { text: "Off", value: "none" },
        { text: "Grid", value: "grid" },
        { text: "Vertex", value: "vertex" },
      ], "none"),
    slider(SETTING_SNAP_GRID_SIZE, "Tools", "Default snap grid size",
      "Grid increment used by spatial grid snapping, in scene units.", { min: 0.01, max: 10, step: 0.01 }, 0.5),

    choice(SETTING_NAVIGATION_PROFILE, "Navigation", "Default navigation profile",
      "Viewport navigation profile applied to newly created Director nodes.", [
        { text: "Maya", value: "maya" },
        { text: "Blender", value: "blender" },
      ], "maya"),
    slider(SETTING_FLY_SPEED, "Navigation", "Default fly speed",
      "WASD / QE fly speed applied to newly created Director nodes.", { min: 0.05, max: 5, step: 0.05 }, 1),
    choice(SETTING_VIEW_MODE, "Navigation", "Default view",
      "View a newly created Director node opens in.",
      ["camera", "perspective", "front", "back", "top", "bottom", "right", "left"], "camera"),

    toggle(SETTING_SNAP_ENABLED, "Timeline", "Enable timeline snapping by default",
      "Snaps dragged keyframes to the frame increment below.", true),
    slider(SETTING_SNAP_FRAMES, "Timeline", "Default timeline snap",
      "Frame increment used by timeline snapping on newly created Director nodes.", { min: 1, max: 24, step: 1 }, 1),
    toggle(SETTING_AUTO_KEY, "Timeline", "Enable Auto Key by default",
      "Enables Auto Key on newly created Director nodes.", false),
    choice(SETTING_TIMECODE_MODE, "Timeline", "Default time display",
      "Elapsed time, or HH:MM:SS:FF timecode.", [
        { text: "Time (mm:ss.ms)", value: "time" },
        { text: "Timecode (hh:mm:ss:ff)", value: "timecode" },
      ], "time"),
    toggle(SETTING_LOOP_PLAYBACK, "Timeline", "Loop playback by default",
      "Restarts playback at the first frame instead of stopping at the last.", false),

    choice(SETTING_UI_DENSITY, "Interface", "Default interface density",
      "How much of the editor chrome is shown.", [
        { text: "Basic", value: "basic" },
        { text: "Animation", value: "animation" },
        { text: "Advanced", value: "advanced" },
      ], "advanced"),
    choice(SETTING_PREVIEW_LAYOUT, "Interface", "Default camera preview layout",
      "How the camera preview tiles are arranged.", [
        { text: "Auto strip", value: "auto" },
        { text: "Single", value: "1" },
        { text: "Side by side", value: "2" },
        { text: "Quad", value: "4" },
      ], "auto"),
    toggle(SETTING_CAMERA_VIEW_VISIBLE, "Interface", "Show camera previews by default",
      "Opens newly created Director nodes with the camera preview strip visible.", true),

    slider(SETTING_UNDO_LIMIT, "History", "Undo history limit",
      "Maximum number of Undo steps held by each Director editor.", { min: 10, max: 500, step: 10 }, 100),
  ];
}
