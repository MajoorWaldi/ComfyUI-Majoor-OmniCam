import { defineConfig } from "vite";
import { readdir, unlink } from "node:fs/promises";
import { resolve } from "node:path";

const sourceAliases = {
  "omnicam-webgl": "viewport.js", "omnicam-core": "director/core.js",
  "omnicam-history": "director/history.js", "omnicam-ui": "director/ui-services.js",
  "omnicam-playblast": "director/playblast.js", "omnicam-media": "director/media.js",
  "omnicam-template": "template.js", "omnicam-i18n": "i18n.js",
  "omnicam-commands": "commands.js", "omnicam-state-sync": "state-sync.js",
  "omnicam-cameras": "cameras.js", "omnicam-record": "record.js",
  "omnicam-scene": "scene.js", "omnicam-timeline": "timeline.js",
  "omnicam-timeline-interaction": "timeline-interaction.js", "omnicam-curve-editor": "curve-editor.js",
  "omnicam-playback-transport": "playback-transport.js", "omnicam-motion-presets": "motion-presets.js",
  "omnicam-background-manager": "background-manager.js", "omnicam-viewport-overlays": "viewport-overlays.js",
  "omnicam-viewport-controls": "viewport-controls.js", "omnicam-event-bindings": "event-bindings.js",
  "omnicam-dom-media": "dom-media.js", "omnicam-diagnostics": "diagnostics.js",
};

function singlePublicBundle() {
  return {
    name: "omnicam-single-public-bundle",
    resolveId(id) {
      const match = id.match(/(?:^|\/)omnicam-[^/]+\.js$/);
      const key = match?.[0].split("/").at(-1).replace(/\.js$/, "");
      return key && sourceAliases[key] ? resolve("web-src", sourceAliases[key]) : null;
    },
    async closeBundle() {
      for (const file of await readdir("web")) {
        if (file.endsWith(".js") && file !== "omnicam.js") await unlink(resolve("web", file));
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [singlePublicBundle()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: { omnicam: "web-src/director.js" },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: (id) => id.startsWith("../../scripts/"),
      output: { inlineDynamicImports: true },
    },
    outDir: "web",
    // Development builds ship source maps for debugging; release artifacts stay compact.
    sourcemap: mode === "development" ? true : false,
    minify: mode === "development" ? false : "esbuild",
  },
}));
