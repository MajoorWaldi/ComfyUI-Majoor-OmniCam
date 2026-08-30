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
};

function bodyFor(url) {
  const path = String(url).split("?")[0];
  return RESPONSES[path] ?? {};
}

export const api = {
  apiURL: (path) => path,
  fetchApi: async (url) => ({ ok: true, json: async () => bodyFor(url) }),
  addEventListener() {},
  removeEventListener() {},
};
