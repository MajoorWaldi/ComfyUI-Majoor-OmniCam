// Minimal ComfyUI api stub for Director mount tests.
//
// Each OmniCam route has its own response shape; a single canned reply broke
// silently the moment a second route (motion_profiles) started being fetched
// at mount, because it received a payload built for a different endpoint.
const RESPONSES = {
  "/majoor/omnicam/capabilities": { capabilities: [], diagnostic: { issues: [] } },
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
  "/majoor/omnicam/reconstruction/capabilities": {
    feature: "scene_reconstruction",
    version: 1,
    providers: [
      {
        provider_id: "fake_provider",
        available: true,
        modes: ["geometry", "layout"],
        source_kinds: ["single_image"],
        reason: null,
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

    if (rawPath === "/majoor/omnicam/reconstruction/jobs" && options.method === "POST") {
      const body = options.body ? JSON.parse(options.body) : {};
      const jobId = "fake_job_1";

      setTimeout(() => {
        api.dispatchEvent("omnicam.reconstruction.progress", {
          job_id: jobId,
          node_id: body.node_id,
          progress: 35,
          stage: "Extracting depth geometry",
          stage_progress: 35,
        });
      }, 50);

      setTimeout(() => {
        api.dispatchEvent("omnicam.reconstruction.progress", {
          job_id: jobId,
          node_id: body.node_id,
          progress: 70,
          stage: "Fitting ground plane",
          stage_progress: 70,
        });
      }, 120);

      setTimeout(() => {
        api.dispatchEvent("omnicam.reconstruction.progress", {
          job_id: jobId,
          node_id: body.node_id,
          progress: 95,
          stage: "Generating GLB mesh",
          stage_progress: 95,
        });
      }, 190);

      setTimeout(() => {
        api.dispatchEvent("omnicam.reconstruction.done", {
          job_id: jobId,
          node_id: body.node_id,
        });
      }, 260);

      return {
        ok: true,
        status: 200,
        json: async () => ({
          job_id: jobId,
          state: "PREPARING",
          progress: 0.05,
          band: "prep",
        }),
      };
    }

    if (rawPath.includes("/reconstruction/jobs/") && rawPath.endsWith("/result")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          job_id: "fake_job_1",
          state: "DONE",
          motion_scene: {
            version: 1,
            timeline: { duration_seconds: 5.0, authoring_fps: 24.0 },
            canvas: { width: 1280, height: 720 },
            cameras: [{
              id: "camera_1",
              name: "Camera 1",
              camera: { position: [0, 1.5, 3], target: [0, 1.5, 0], fov: 53.0 },
              keyframes: [{ frame: 0, camera: { position: [0, 1.5, 3], target: [0, 1.5, 0], fov: 53.0 } }],
            }],
            active_camera_id: "camera_1",
            playblast_camera_id: "camera_1",
            objects: [
              {
                id: "recon_environment",
                type: "glb",
                name: "Environment Proxy",
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                size: [1, 1, 1],
                material_mode: "textured",
                keyframes: [],
                enabled: true,
                locked: true,
                asset: "majoor_omnicam/reconstruction/abc123/environment.glb [input]",
                reconstruction: {
                  version: 1,
                  role: "environment",
                  provider: "fake_provider",
                  source_kind: "single_image",
                  confidence: 0.85,
                  geometry: { kind: "depth_mesh", triangle_count: 5000, textured: true },
                },
              },
              {
                id: "recon_ground",
                type: "ground",
                name: "Ground",
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                size: [10, 0.1, 10],
                material_mode: "checker",
                keyframes: [],
                enabled: true,
                locked: true,
                reconstruction: {
                  version: 1,
                  role: "ground",
                  provider: "fake_provider",
                  source_kind: "single_image",
                  confidence: 0.90,
                  plane: { normal: [0, 1, 0], offset: 0, inlier_ratio: 0.95 },
                },
              },
            ],
            motion_layers: [],
            cuts: [],
            metadata: {
              reconstruction: {
                provider: "fake_provider",
                mode: "geometry",
                warnings: ["Low texture contrast detected in corner."],
              },
            },
          },
          summary: {
            provider: "fake_provider",
            mode: "geometry",
            mesh_triangles: 5000,
            has_ground: true,
            ground_confidence: 0.90,
            has_camera: true,
            camera_fov: 53.0,
            aggregate_confidence: 0.88,
          },
          warnings: ["Low texture contrast detected in corner."],
        }),
      };
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
