import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: { entry: "web-src/viewport.js", formats: ["es"], fileName: () => "omnicam-webgl.js" },
    outDir: "web",
    sourcemap: false,
    minify: "esbuild",
  },
});
