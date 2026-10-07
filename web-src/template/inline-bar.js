// Compact camera controls shown only while the Director is mounted inline in
// its node (`data-inline` on the root, see director/inline-view.js). Every
// control here is a second copy of a hook the full editor already binds with
// querySelectorAll -- path display, Look At target, Quick Camera angles -- so
// the inline view adds no behaviour of its own.

import { t } from "../i18n.js";

const QUICK_ANGLES = [
  ["front", "Front"],
  ["front_left_three_quarter", "Front 3/4 L"],
  ["front_right_three_quarter", "Front 3/4 R"],
  ["left_profile", "Profile L"],
  ["right_profile", "Profile R"],
  ["back", "Back"],
  ["top", "Top"],
  ["low", "Low"],
];

export function inlineBarMarkup() {
  const angles = QUICK_ANGLES
    .map(([preset, label]) => `<button type="button" data-camera-preset="${preset}">${t(label)}</button>`)
    .join("");
  return `
    <div class="oc-inline-bar" role="toolbar" aria-label="${t("Quick camera controls")}">
      <details class="oc-inline-angles" data-role="quick-camera">
        <summary title="${t("Quick Camera")}"><i class="pi pi-video"></i> ${t("Angle")}</summary>
        <div class="oc-inline-angle-grid">${angles}</div>
      </details>
      <label class="oc-inline-aim" title="${t("Track / Follow Moving Target Object")}">
        <i class="pi pi-bullseye"></i>
        <select data-role="camera-target-object" aria-label="${t("Look At")}">
          <option value="">${t("Manual Target (No Tracking)")}</option>
        </select>
      </label>
      <label class="oc-inline-toggle" title="${t("Camera Paths")}">
        <input type="checkbox" data-role="show-camera-paths" checked> ${t("Path")}
      </label>
    </div>`;
}
