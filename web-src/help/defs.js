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
      body: "Extracts a relative 6DoF camera trajectory from one continuous video shot using visual odometry (DPVO when installed, OpenCV/SIFT otherwise). The validated solve remains an internal camera primitive and is wrapped in a one-camera MotionScene for the Director.\n\nThe video must be a single continuous shot - hard cuts are reported in the output, not stitched across.",
    },
    {
      heading: "Key inputs",
      defs: [
        ["video", "One continuous shot to solve."],
        ["method", "`auto` prefers DPVO when installed and falls back to OpenCV/SIFT."],
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
  tagline: "Validate a camera track, preview it, and route it to whichever AI-video camera adapter your workflow needs.",
  sections: [
    {
      heading: "What it does",
      body: "The Monitor is the single exit point from OmniCam into the rest of your graph. It checks a camera_track is well-formed, previews it, and converts it into the format the chosen adapter expects - all in one node, so you no longer need to pick a separate legacy adapter node per target model.",
    },
    {
      heading: "Choosing an adapter",
      defs: [
        ["h3", "Video-reference family. Camera reference video + cinematic prompt, `Video 1` dialect (MiniMax H3 Omni Reference, Kling, Luma, HunyuanVideo, Wan and other prompt-driven pipelines)."],
        ["h3_native", "Video-reference family. Reference frames + prompt, `<Video 1>` dialect (MiniMaxH3ReferenceToVideo); length must be 17n+5."],
        ["wan_native", "Camera-conditioning family. A true digital camera: extrinsics/intrinsics to a native Wan camera embedding (Plücker-style). The fidelity reference; length must be 4n+1."],
        ["wan_tracks_native", "Trajectory family. Projected 2D trajectories for the native WanTrackToVideo node."],
        ["wan_ati", "Trajectory family. Projected 2D trajectories for WanVideoATITracks (Wan 2.1 ATI, WanVideoWrapper)."],
        ["ltx_motion_track", "Trajectory family. Projected 2D trajectories for LTXVDrawTracks / IC-LoRA Motion Track; length must be 8n+1."],
        ["ltx", "Proxy-guide family (legacy). Sampled proxy frames as an LTX camera guide; does not carry the authored camera."],
      ],
    },
    {
      heading: "Outputs",
      body: "Every output for every adapter is exposed on the node at once; only the ones relevant to your chosen `adapter` are populated, so you only wire up what you actually need. This includes `reference_video`, `camera_prompt`, `cinematic_prompt`, `final_prompt`, `camera_data_json`, `wan_camera`, `tracks`, `adapter_width/height/length`, `guide_frames` and `adapter_profile_json`.",
    },
  ],
  footer: "This node replaces the older single-target adapter nodes (H3 Adapter, Wan Native Camera, LTX Camera Guide, WanVideoWrapper ATI) - use it for new workflows.",
});

registerNodeHelp("MajoorOmniCamH3Adapter", {
  title: "OmniCam → Universal Reference & AI Prompts",
  tagline: "Deprecated compatibility node - kept for existing workflows. New workflows should use OmniCam Monitor.",
  sections: [
    {
      heading: "What it does",
      body: "Turns a camera_track into a proxy reference video plus model-tailored cinematic prompts for MiniMax H3 Omni Reference, Kling, Luma Dream Machine, HunyuanVideo, Wan 2.1 and generic Universal pipelines.",
    },
    {
      heading: "Key inputs",
      defs: [
        ["prompt_style", "Which model's prompt phrasing to generate: `h3`, `universal`, `kling`, `luma`, `hunyuan` or `wan`."],
        ["video_ref_token", "The placeholder token your prompt style expects for the reference video, e.g. `<Video 1>`."],
      ],
    },
  ],
  footer: "Prefer OmniCam Monitor with adapter = h3 in new workflows - same output, one fewer node type to maintain.",
});

registerNodeHelp("MajoorOmniCamWanNativeCamera", {
  title: "OmniCam → Wan Native Camera",
  tagline: "Deprecated compatibility node - kept for existing workflows. New workflows should use OmniCam Monitor.",
  sections: [
    {
      heading: "What it does",
      body: "Converts a camera_track to a native Wan camera embedding at a given width, height and frame length.",
    },
    {
      heading: "Inputs",
      defs: [
        ["width / height", "Output resolution the embedding is generated for."],
        ["length", "Number of frames the embedding covers."],
      ],
    },
  ],
  footer: "Prefer OmniCam Monitor with adapter = wan_native in new workflows.",
});

registerNodeHelp("MajoorOmniCamLTXCameraGuide", {
  title: "OmniCam → LTX Camera Guide",
  tagline: "Deprecated compatibility node - kept for existing workflows. New workflows should use OmniCam Monitor.",
  sections: [
    {
      heading: "What it does",
      body: "Decodes proxy VIDEO frames from a camera_track into an LTX camera guide, with control over frame range, sampling and resize.",
    },
    {
      heading: "Key inputs",
      defs: [
        ["start_frame / end_frame", "Frame range to sample from the proxy video (0 means the full range)."],
        ["sampling_mode", "`contiguous` samples a run of consecutive frames; `uniform` spreads samples evenly across the range."],
        ["resize_width / resize_height", "Resize the guide frames; 0 keeps the source size."],
      ],
    },
  ],
  footer: "Prefer OmniCam Monitor with adapter = ltx in new workflows.",
});

registerNodeHelp("MajoorOmniCamWanVideoWrapperATI", {
  title: "OmniCam → WanVideoWrapper ATI",
  tagline: "Deprecated compatibility node - kept for existing workflows. New workflows should use OmniCam Monitor.",
  sections: [
    {
      heading: "What it does",
      body: "Produces the exact `tracks` STRING consumed by WanVideoATITracks in WanVideoWrapper, from a camera_track.",
    },
    {
      heading: "Important",
      body: "WanVideoATITracks normalises coordinates with its own width and height. Wire this node's `width` and `height` outputs into WanVideoATITracks as well - if they are left mismatched, every trajectory is silently offset and rescaled.",
    },
  ],
  footer: "Prefer OmniCam Monitor with adapter = wan_tracks_native in new workflows.",
});
