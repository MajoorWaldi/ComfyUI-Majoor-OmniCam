// Help content for every public OmniCam node, keyed by comfyClass.
//
// One entry, one place to edit. The selection-toolbar "?" button
// (web-src/help/toolbar.js) shows whichever entry matches the selected node.
// Content is plain English on purpose (see web-src/help/schema.js) rather than
// routed through t(): a paragraph-length reference does not carry across the
// FR catalogue the way short UI chrome strings do, and check:locales does not
// require it (missing translations only lower coverage, they never fail).

import { registerNodeHelp } from "./schema.js";

registerNodeHelp("MajoorOmniCamDirector", {
  title: "OmniCam Director",
  tagline: "Interactive motion-scene authoring: block cameras and tracks in a live 3D viewport and record a clean playblast.",
  sections: [
    {
      heading: "What it does",
      body: "The Director opens a full 3D viewport on the node's face. You place cameras and reference objects, pose the frame, draw or project motion tracks, and record keyframes as you scrub the timeline. The result is a model-independent OmniCam MotionScene plus an optional neutral-grey playblast video.",
    },
    {
      heading: "Basic workflow",
      bullets: [
        "Compose a frame in the viewport.",
        "Press `I` to insert a keyframe at the current time.",
        "Scrub the timeline, move the camera, press `I` again.",
        "Press `Space` to preview the move inside the viewport.",
        "Click `Playblast` to record the proxy reference video.",
      ],
    },
    {
      heading: "Output",
      defs: [
        ["motion_scene", "Cameras, objects, normalized motion layers, cuts and authoring timeline."],
        ["playblast_video", "Optional clean playblast used as a model-motion reference."],
        ["audio", "Associated audio, passed through without model-specific processing."],
      ],
    },
  ],
  footer: "An Extractor MotionScene can be connected to Director and imported as a new editable camera.",
});

registerNodeHelp("MajoorOmniCamExtractor", {
  title: "OmniCam Extractor",
  tagline: "Solve a real video's camera motion into a canonical OmniCam MotionScene, ready for Director.",
  sections: [
    {
      heading: "What it does",
      body: "Extracts a relative 6DoF camera trajectory from one continuous video shot: DPVO by default (deep visual odometry), or pycolmap / OpenCV as alternatives with different tradeoffs -- see `method` below. The validated solve remains an internal camera primitive and is wrapped in a one-camera MotionScene for the Director.\n\nThe video must be a single continuous shot - hard cuts are reported in the output, not stitched across.",
    },
    {
      heading: "Tracking without a queue",
      body: "The node's own face carries a matchmove panel: `TRACK` starts solving immediately, with no ComfyUI prompt queued and no model loaded. It works on a connected Load Video, a file picked through the panel, or a VIDEO already materialized by a previous execution -- never on an in-memory batch that has not run yet, which the panel says plainly rather than guessing.\n\nThe job moves PREPARING -> TRACKING -> SOLVING -> REFINING -> COMPLETED, with STOP cooperative rather than a kill: the solver is asked to stop between safe frames, so nothing force-destroys a CUDA context mid-solve. The VIDEO tab shows the footage with live solver points overlaid as it tracks; TRACK 3D shows the solved path, read-only.",
    },
    {
      heading: "Key inputs (queued execution)",
      defs: [
        ["video", "One continuous shot to solve."],
        ["method", "`dpvo` is the default and does not fall back -- it errors if DPVO is not installed. `auto` tries DPVO, then `pycolmap`, then `opencv_sift`, taking the first one actually installed. `pycolmap` runs Structure-from-Motion (bundle adjustment over the whole shot) rather than frame-to-frame odometry: slower, but it does not zero out translation on a low-parallax or rotation-only segment the way `opencv_sift` does. Installing it is one `pip install pycolmap` -- no compiler, unlike DPVO."],
        ["lens_mode", "How the lens is described: `auto`, an explicit field of view, or a focal length + sensor width."],
        ["motion_scale", "Monocular solves have no metric scale; this rescales the recovered translation to fit your scene."],
        ["simplify_keys", "Reduces the solved path to a sparser, easier-to-edit set of keyframes within the given tolerances."],
      ],
    },
    {
      heading: "Outputs",
      defs: [
        ["motion_scene", "A canonical one-camera OmniCam MotionScene containing the solved trajectory."],
        ["solver_coverage", "Share of sampled frames that produced a pose; not camera accuracy."],
        ["report", "Human-readable notes: detected cuts, tracking quality, warnings."],
      ],
    },
  ],
  footer: "Low Solver Coverage usually means low-texture footage, motion blur, or a shot the solver treated as multiple cuts - check report first.",
});

registerNodeHelp("MajoorOmniCamMonitor", {
  title: "OmniCam Monitor",
  tagline: "Compile a MotionScene for one video model, and report what the translation cannot carry.",
  sections: [
    {
      heading: "What it does",
      body: "Monitor is the single exit point from OmniCam into the rest of your graph. Pick a target profile; it resolves the frame grid that model needs, compiles the MotionScene into that model's representation, and runs a preflight. Which output carries the payload depends on the profile's semantic, not on the model.\n\nWhen the connected MotionScene comes straight from a Director, the preflight is live: it updates as you edit, with no queue and no model loaded, because the Director's own state is readable without running the graph. Any other source -- a third-party node, or nothing connected yet -- has no state to preview, and the panel says so rather than showing a stale or invented result; it fills in for real once you queue the workflow.",
    },
    {
      heading: "Choosing a profile",
      defs: [
        ["external_reference_video", "Reference video, unchanged. The default for a new Monitor: no frame grid, no fps conversion, no downstream node required. Passes the playblast straight through for a model with no dedicated profile -- Seedance, Kling, Veo, a private API. Never BLOCKED."],
        ["wan_camera_native", "Camera embedding. Real extrinsics and intrinsics into a native Wan camera embedding. The highest-fidelity path for camera motion; length resolves to 4n+1."],
        ["wan_move_native", "Screen tracks. Native TRACKS tensors for WanMoveTrackToVideo: track_path and track_visibility."],
        ["wan_track_native", "Screen tracks. Trajectory JSON for WanTrackToVideo, on the 121-sample source grid it resamples."],
        ["wanvideo_ati", "Screen tracks. Trajectory JSON for WanVideoATITracks (Wan 2.1 ATI, WanVideoWrapper); a fixed 121 samples."],
        ["ltx25_motion_track", "Screen tracks. Trajectory JSON for LTXVDrawTracks, then IC-LoRA Motion Track; length resolves to 8n+1."],
        ["h3_native", "Reference video. Playblast frames resampled to 24 fps plus a prompt, for MiniMaxH3ReferenceToVideo; length resolves to 17n+5."],
        ["h3_api", "Reference video. The playblast as a VIDEO plus a prompt, for MinimaxHailuo03ReferenceNode."],
      ],
    },
    {
      heading: "Outputs",
      body: "Every output is present on the node at once, but only the selected profile's are populated. Camera-embedding profiles fill `camera_embedding`; `wan_move_native` fills `native_tracks`; the other track profiles fill `tracks_json`; reference-video profiles fill `reference_video` or `reference_frames`. `final_prompt`, `target_width`, `target_height` and `target_length` are always filled.",
    },
    {
      heading: "Reading the preflight",
      bullets: [
        "BLOCKED stops the compile. It is never cosmetic.",
        "A multi-shot edit blocks camera and track profiles: one camera basis cannot describe an edit that cuts to a second camera. Reference-video profiles accept it, because the playblast carries the cuts, and swap the camera prompt for a neutral one.",
        "'Encodable trajectories' warns when a layer will not survive the JSON track format: hidden on the first sample means dropped, a visibility gap means cut at the gap.",
        "'Downstream contract' checks the node this profile targets. Missing or incompatible blocks; only the selected profile is binding.",
      ],
    },
    {
      heading: "Reference source",
      bullets: [
        "The player above the preflight shows the Director's actual recorded playblast, not its live edit viewport -- gizmos and helpers never appear in it.",
        "'Playblast outdated' means the scene changed after this file was recorded: cameras, objects or cuts moved, but the compile still sends the old footage until you re-record. Not shown for playblasts recorded before this check existed -- there is nothing to compare them against.",
      ],
    },
  ],
  footer: "Switching profile never changes the MotionScene, only which Monitor output you connect: the compiler is universal, the sockets are typed.",
});
