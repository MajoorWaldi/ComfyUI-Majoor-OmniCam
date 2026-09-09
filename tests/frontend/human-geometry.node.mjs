// Unit tests for low-poly human geometry and primitive object additions.

import test from "node:test";
import assert from "node:assert/strict";

import * as THREE from "../../web-src/three-runtime.js";
import { createLowPolyHumanGeometry } from "../../web-src/viewport/human-geometry.js";
import { leftPanelMarkup } from "../../web-src/template/left-panel.js";

test("createLowPolyHumanGeometry builds a valid non-empty BufferGeometry", () => {
  const geom = createLowPolyHumanGeometry(THREE);
  assert.ok(geom, "geometry should exist");
  assert.ok(geom.attributes.position, "position attribute should exist");
  assert.ok(geom.attributes.normal, "normal attribute should exist");

  const posCount = geom.attributes.position.count;
  const normCount = geom.attributes.normal.count;
  assert.ok(posCount > 100, `geometry should have sufficient low-poly vertices, got ${posCount}`);
  assert.equal(posCount, normCount, "normal count should match position count");

  geom.computeBoundingBox();
  const box = geom.boundingBox;
  assert.ok(box, "bounding box should be computed");

  // Feet should be grounded at y ~= 0
  assert.ok(box.min.y >= -0.01 && box.min.y <= 0.05, `feet should be at y ~ 0, got ${box.min.y}`);
  // Head top should be around y ~= 0.95 - 1.05
  assert.ok(box.max.y >= 0.90 && box.max.y <= 1.05, `head top should be around 1.0, got ${box.max.y}`);
  // Width (X) should be roughly symmetric around 0
  assert.ok(Math.abs(box.min.x + box.max.x) < 0.05, "should be roughly symmetric along X");
  // Total span should be human-proportioned
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  assert.ok(width > 0.3 && width < 0.8, `proportional width expected, got ${width}`);
  assert.ok(height > 0.85 && height < 1.05, `proportional height expected, got ${height}`);
});

test("left panel add-object menu replaces Ground with Card and includes Cylinder and Torus", () => {
  const html = leftPanelMarkup();
  // Must contain new primitives
  assert.match(html, /data-object-type="card"/, "Card button is present");
  assert.match(html, /data-object-type="cube"/, "Cube button is present");
  assert.match(html, /data-object-type="sphere"/, "Sphere button is present");
  assert.match(html, /data-object-type="cylinder"/, "Cylinder button is present");
  assert.match(html, /data-object-type="torus"/, "Torus button is present");
  assert.match(html, /data-object-type="human"/, "Human button is present");
  assert.match(html, /data-object-type="null"/, "Null button is present");

  // Ground is replaced by Card in the quick bar
  assert.doesNotMatch(html, /data-object-type="ground"/, "Ground button is replaced by Card");
});
