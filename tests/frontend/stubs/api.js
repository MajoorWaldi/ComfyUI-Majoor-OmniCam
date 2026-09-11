// Minimal ComfyUI api stub for Director mount tests.
//
// Each OmniCam route has its own response shape; a single canned reply broke
// silently the moment a second route (motion_profiles) started being fetched
// at mount, because it received a payload built for a different endpoint.
// A complete OMNICAM_HUMANOID_V1 map, so the RIGGED badge / Rig Mapper status
// resolve to "rigged" in the browser specs.
const HUMANOID_JOINTS = [
  "root", "pelvis", "spine", "chest", "neck", "head",
  "clavicle_l", "upper_arm_l", "lower_arm_l", "hand_l",
  "clavicle_r", "upper_arm_r", "lower_arm_r", "hand_r",
  "upper_leg_l", "lower_leg_l", "foot_l", "toe_l",
  "upper_leg_r", "lower_leg_r", "foot_r", "toe_r",
];
const COMPLETE_BONE_MAP = Object.fromEntries(HUMANOID_JOINTS.map((j) => [j, `Bone_${j}`]));

const HUMAN_NEUTRAL_ROW = {
  version: 2, id: "omnicam.character.human_neutral_01", name: "Human Neutral 01",
  kind: "character", category: "characters", file: "characters/human_neutral_01.glb",
  format: "glb", base_size: [0.62, 1.78, 0.4], fit: "upright",
  tags: ["human", "adult", "neutral"], thumbnail: "",
  animations: [{ id: "idle", name: "Idle", clip: "Idle", tags: [] }],
  license: { spdx: "CC0-1.0" }, source: "default",
  rig: { profile: "omnicam_humanoid_v1", root_bone: "Bone_root", forward_axis: "-Z", up_axis: "+Y", bone_map: COMPLETE_BONE_MAP },
};

const RESPONSES = {
  "/majoor/omnicam/capabilities": { capabilities: [], diagnostic: { issues: [] } },
  "/majoor/omnicam/library/omnicam.character.human_neutral_01": { asset: HUMAN_NEUTRAL_ROW },
  "/majoor/omnicam/library/poses": {
    poses: [
      { id: "neutral", name: "Standing Neutral", profile: "omnicam_humanoid_v1", root_offset: [0, 0, 0], joints: {}, builtin: true },
      { id: "t_pose", name: "T Pose", profile: "omnicam_humanoid_v1", root_offset: [0, 0, 0], joints: { upper_arm_r: [0, 0, 0.7071, 0.7071] }, builtin: false },
    ],
  },
  "/majoor/omnicam/motion_profiles": {
    default: "generic",
    warn_ratio: 0.85,
    profiles: [{
      id: "generic", display_name: "Generic", adapter: null,
      limits: {
        max_speed: 10.0, max_angular_speed: 150.0, max_acceleration: 50.0,
        max_jerk: 500.0, max_fov_change: 30.0, allow_framing_loss: false,
      },
    }],
  },
  "/majoor/omnicam/exchange_formats": { export: [], import: [], notes: {} },
  "/majoor/omnicam/library": {
    format: "majoor.omnicam.library.v2",
    items: [
      HUMAN_NEUTRAL_ROW,
      {
        version: 2, id: "omnicam.prop.crate_01", name: "Crate 01", kind: "prop",
        category: "props", file: "props/crate_01.glb", format: "glb",
        base_size: [0.6, 0.6, 0.6], fit: "stretch", tags: ["crate", "box"], thumbnail: "",
        animations: [], license: { spdx: "CC0-1.0" }, source: "default",
      },
    ],
    total: 2, offset: 2, limit: 60, kinds: { character: 1, prop: 1 },
  },
  "/majoor/omnicam/reconstruction/capabilities": {
    feature: "scene_reconstruction",
    version: 2,
    providers: [
      {
        provider_id: "fake_provider",
        available: true,
        modes: ["depth_mesh", "blockout", "hybrid"],
        source_kinds: ["single_image"],
        reason: null,
      },
    ],
    segmentation: [
      { provider_id: "comfy_sam3", available: true, reason: "", checkpoints: ["sam3.1_multiplex_fp16.safetensors"] },
    ],
    completion: [
      {
        provider_id: "sam3d_objects",
        available: false,
        reason:
          "SAM3D Objects needs Linux + an NVIDIA GPU with >=32 GB VRAM. Blockout and Scan work without it.",
      },
    ],
    recommended_provider: "fake_provider",
  },
};

const listeners = new Map();

function bodyFor(url) {
  const path = String(url).split("?")[0];
  return RESPONSES[path] ?? {};
}

export const api = {
  clientId: "stub_client_1",
  apiURL: (path) => path,
  fetchApi: async (url, options = {}) => {
    const rawPath = String(url).split("?")[0];

    if (api.customFetch) {
      const custom = await api.customFetch(rawPath, options);
      if (custom !== undefined) return custom;
    }

    return { ok: true, status: 200, json: async () => bodyFor(rawPath) };
  },
  addEventListener(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
  },
  removeEventListener(event, handler) {
    listeners.get(event)?.delete(handler);
  },
  dispatchEvent(event, detail) {
    const set = listeners.get(event);
    if (!set) return;
    const evt = { type: event, detail };
    for (const fn of set) fn(evt);
  },
};
