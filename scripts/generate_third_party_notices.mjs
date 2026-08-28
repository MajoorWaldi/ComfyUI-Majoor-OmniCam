// Regenerates THIRD_PARTY_NOTICES.md from the dependencies actually bundled
// into web/omnicam.js, and fails when it is out of date.
//
// This matters because the bundle is redistributed: three.js is MIT (attribution
// required) and mediabunny is MPL-2.0, whose section 3.2 requires telling
// recipients how to obtain the source of the covered files. Shipping only
// OmniCam's own MIT licence does not discharge either obligation.
//
//   node scripts/generate_third_party_notices.mjs          # verify
//   node scripts/generate_third_party_notices.mjs --write  # regenerate

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const NOTICES = join(ROOT, "THIRD_PARTY_NOTICES.md");

const SOURCES = {
  three: "https://github.com/mrdoob/three.js",
  mediabunny: "https://github.com/Vanilagy/mediabunny",
};

async function licenceText(dependency) {
  const directory = join(ROOT, "node_modules", dependency);
  const entries = await readdir(directory);
  const file = entries.find((entry) => /^licen[cs]e/i.test(entry));
  if (!file) throw new Error(`${dependency} ships no licence file`);
  return (await readFile(join(directory, file), "utf8")).trim();
}

const manifest = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
const sections = [];
for (const [dependency, range] of Object.entries(manifest.dependencies || {})) {
  const meta = JSON.parse(await readFile(join(ROOT, "node_modules", dependency, "package.json"), "utf8"));
  const text = await licenceText(dependency);
  sections.push([
    `## ${dependency} ${meta.version}`,
    "",
    `- Declared range: \`${range}\``,
    `- Licence: ${meta.license}`,
    `- Source: ${SOURCES[dependency] || meta.homepage || "see the package registry"}`,
    ...(meta.license === "MPL-2.0"
      ? ["", "Mozilla Public License 2.0, section 3.2: the source form of the files covered",
         "by this licence is available at the address above, and may also be obtained from",
         "the npm registry with `npm pack " + dependency + "@" + meta.version + "`."]
      : []),
    "",
    "```text",
    text,
    "```",
    "",
  ].join("\n"));
}

const document = [
  "# Third-party notices",
  "",
  "`web/omnicam.js` is a bundle: it contains the code of the dependencies below,",
  "redistributed under their own licences. OmniCam's own licence is in `LICENSE`",
  "and covers only OmniCam's code.",
  "",
  "Regenerate with `node scripts/generate_third_party_notices.mjs --write`.",
  "",
  ...sections,
].join("\n");

if (process.argv.includes("--write")) {
  await writeFile(NOTICES, document, "utf8");
  console.log(`Wrote ${Object.keys(manifest.dependencies || {}).length} notices to THIRD_PARTY_NOTICES.md`);
} else {
  const existing = await readFile(NOTICES, "utf8").catch(() => null);
  if (existing !== document) {
    console.error("THIRD_PARTY_NOTICES.md is missing or stale.");
    console.error("Run: node scripts/generate_third_party_notices.mjs --write");
    process.exit(1);
  }
  console.log(`Third-party notices up to date (${Object.keys(manifest.dependencies || {}).length} bundled dependencies).`);
}
