import { resolve } from "node:path";

import { createServer } from "vite";

export default async function startTestServer() {
  const server = await createServer({
    configFile: resolve(import.meta.dirname, "../../vite.test.config.mjs"),
    server: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: true,
    },
  });
  await server.listen();
  return () => server.close();
}
