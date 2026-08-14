import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  build: {
    emptyOutDir: false,
    lib: {
      entry: { omnicam: "web-src/director.js", "omnicam-webgl": "web-src/viewport.js", "omnicam-core": "web-src/director/core.js", "omnicam-history": "web-src/director/history.js", "omnicam-ui": "web-src/director/ui-services.js", "omnicam-playblast": "web-src/director/playblast.js", "omnicam-media": "web-src/director/media.js", "omnicam-template": "web-src/template.js", "omnicam-i18n": "web-src/i18n.js", "omnicam-commands": "web-src/commands.js", "omnicam-state-sync": "web-src/state-sync.js", "omnicam-cameras": "web-src/cameras.js", "omnicam-record": "web-src/record.js", "omnicam-scene": "web-src/scene.js", "omnicam-timeline": "web-src/timeline.js", "omnicam-viewport-controls": "web-src/viewport-controls.js", "omnicam-dom-media": "web-src/dom-media.js", "omnicam-diagnostics": "web-src/diagnostics.js" },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: (id) => id.startsWith("../../scripts/") || id.startsWith("./omnicam-"),
    },
    outDir: "web",
    // Development builds ship source maps for debugging; release artifacts stay compact.
    sourcemap: mode === "development" ? true : false,
    minify: mode === "development" ? false : "esbuild",
  },
}));
