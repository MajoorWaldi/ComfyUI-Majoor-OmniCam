import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { defineConfig } from "vite";

// Test-server config: serves the repo as-is (harness + committed bundles) and
// stubs the ComfyUI host modules at /scripts/* for Director mount tests.
//
// web/omnicam.js is only a stub importing "../majoor-omnicam-chunks/omnicam.js";
// in production omnicam/routes_chunks.py mounts web-chunks/ at that URL, so the
// resolver below stands in for that mount. Keep the three in sync.
const serveComfyStubs = {
  name: "omnicam-comfy-stubs",
  // Resolve the bundle's "../../scripts/*" imports to our stub modules before
  // Vite's import analysis rejects them as missing files. The importer is
  // either the web/ stub or one of the real chunks in web-chunks/.
  resolveId(source, importer) {
    const chunk = source.match(/(?:^|\/)majoor-omnicam-chunks\/(.+)$/);
    if (chunk) return resolve("web-chunks", chunk[1]);
    if (importer && /[/\\](web|web-chunks)[/\\][^/\\]+\.js$/.test(importer) && source.startsWith("../../scripts/")) {
      return `\0omnicam-stub:${source.split("/").pop()}`;
    }
    return null;
  },
  load(id) {
    if (id.startsWith("\0omnicam-stub:")) {
      return readFile(new URL(`./tests/frontend/stubs/${id.slice("\0omnicam-stub:".length)}`, import.meta.url), "utf8");
    }
    return null;
  },
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === "/scripts/app.js" || req.url === "/scripts/api.js") {
        const name = req.url.endsWith("app.js") ? "app.js" : "api.js";
        const code = await readFile(new URL(`./tests/frontend/stubs/${name}`, import.meta.url), "utf8");
        res.setHeader("content-type", "text/javascript");
        res.end(code);
        return;
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [serveComfyStubs],
  // The committed bundles are pre-built ES modules; serve them untransformed.
  optimizeDeps: { noDiscovery: true },
});
