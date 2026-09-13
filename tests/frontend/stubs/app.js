// Minimal ComfyUI app stub for Director mount tests.
const extensions = [];
// A spec can seed this before navigation via page.addInitScript() (runs
// before any page module evaluates, this one included) to control a setting
// value from mount -- e.g. { "MajoorOmniCam.Agent.Enabled": false }.
const settingValues = { ...(globalThis.__omnicamPresetSettings || {}) };
export const app = {
  extensionManager: {
    dialog: null,
    setting: {
      get: (id) => settingValues[id],
      set: (id, value) => { settingValues[id] = value; },
    },
  },
  graph: null,
  registerExtension(extension) {
    extensions.push(extension);
    window.__omnicamExtensions = extensions;
    window.__omnicamExtension = extension;
    // The compiled bundle's chunks reach this same source file through a
    // different resolved specifier than a spec's own `import("/scripts/app.js")`
    // (see vite.test.config.mjs's serveComfyStubs plugin) -- each resolution
    // creates its own separate module instance, with its own separate
    // `settingValues`. Capturing `app` HERE, inside the method the running
    // bundle actually calls, guarantees this is that real instance (unlike
    // capturing it at module-eval time, which could just as easily grab an
    // unused sibling instance evaluated first for an unrelated reason).
    window.__omnicamLiveApp = app;
  },
};
export const ComfyApp = { app };
