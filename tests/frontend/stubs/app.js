// Minimal ComfyUI app stub for Director mount tests.
const extensions = [];
export const app = {
  extensionManager: { dialog: null },
  graph: null,
  registerExtension(extension) {
    extensions.push(extension);
    window.__omnicamExtension = extension;
  },
};
export const ComfyApp = { app };
