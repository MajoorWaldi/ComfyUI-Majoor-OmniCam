import test from "node:test";
import assert from "node:assert/strict";

import {
  ASSET_KIND_GLYPH,
  assetCardMarkup,
  assetGridMarkup,
  kindTabsMarkup,
  resolveCardIntent,
} from "../../web-src/assets/panel.js";
import { REQUIRED_JOINTS } from "../../web-src/assets/character/rig-profile.js";

// A complete OMNICAM_HUMANOID_V1 map -- only a complete rig earns the badge.
const COMPLETE_MAP = Object.fromEntries(REQUIRED_JOINTS.map((j) => [j, `Bone_${j}`]));

const CHAR = {
  id: "omnicam.character.human_01",
  name: "Human 01",
  kind: "character",
  rig: { bone_map: COMPLETE_MAP },
  tags: ["human"],
};
const PROP = { id: "omnicam.prop.chair", name: "Chair <x>", kind: "prop", tags: [] };

test("kind tabs render every tab, mark the active one and show counts", () => {
  const html = kindTabsMarkup("prop", { character: 3, prop: 7 });
  assert.ok(html.includes('data-asset-kind="all"'));
  assert.ok(html.includes('data-asset-kind="prop"'));
  assert.ok(/data-asset-kind="prop"[^>]*class="[^"]*active/.test(html) || /class="oc-asset-kind active" data-asset-kind="prop"/.test(html));
  assert.ok(html.includes(">7<"));
});

test("a fully-rigged character card carries the RIGGED badge and a user glyph fallback", () => {
  const html = assetCardMarkup(CHAR, {});
  assert.ok(html.includes("RIGGED"));
  assert.ok(html.includes(ASSET_KIND_GLYPH.character));
  assert.ok(html.includes('data-asset-id="omnicam.character.human_01"'));
});

test("an incompletely-mapped character shows no RIGGED badge (spec section 22)", () => {
  const html = assetCardMarkup({ ...CHAR, rig: { bone_map: { pelvis: "Hips" } } }, {});
  assert.ok(!html.includes("RIGGED"));
});

test("a card with a thumbnail uses <img>, and card text is HTML-escaped", () => {
  const withThumb = assetCardMarkup(PROP, { thumbUrl: "data:image/webp;base64,AA" });
  assert.ok(withThumb.includes("<img"));
  assert.ok(withThumb.includes("Chair &lt;x&gt;"));
  assert.ok(!withThumb.includes("Chair <x>"));
});

test("grid shows an empty state when nothing matches", () => {
  assert.ok(assetGridMarkup([], {}).includes("No assets match"));
  assert.equal((assetGridMarkup([CHAR, PROP], { selectedId: PROP.id }).match(/oc-asset-card/g) || []).length, 2);
  assert.ok(assetGridMarkup([PROP], { selectedId: PROP.id }).includes("oc-asset-card selected"));
});

// -- resolveCardIntent walks up a synthetic DOM ------------------------ #
function fakeEl(dataset, parent = null) {
  const node = {
    dataset,
    parentNode: parent,
    closest(selector) {
      const key = selector.match(/\[data-([a-z-]+)\]/)?.[1]?.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      let cursor = node;
      while (cursor) {
        if (key && cursor.dataset && key in cursor.dataset) return cursor;
        cursor = cursor.parentNode;
      }
      return null;
    },
  };
  return node;
}

test("resolveCardIntent classifies kind chips, view tabs, actions and cards", () => {
  assert.deepEqual(resolveCardIntent(fakeEl({ assetKind: "character" })), { action: "filter-kind", kind: "character" });
  assert.deepEqual(resolveCardIntent(fakeEl({ assetView: "assets" })), { action: "switch-view", view: "assets" });
  assert.deepEqual(resolveCardIntent(fakeEl({ assetAct: "asset-add" })), { action: "asset-add" });

  const icon = fakeEl({}, fakeEl({ assetId: "omnicam.prop.chair" }));
  assert.deepEqual(resolveCardIntent(icon), { action: "card", assetId: "omnicam.prop.chair" });
  assert.equal(resolveCardIntent(fakeEl({})), null);
  assert.equal(resolveCardIntent(null), null);
});
