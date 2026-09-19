// Reference Role Matrix editor: a repeatable-row UI for declaring references
// OmniCam does not own the media for (doc section 13 / P2). Serializes to the
// hidden `reference_plan_json` textarea; index.js's existing [data-setting]
// wiring (bindControls()/syncControlsFromWidgets()) picks up that textarea
// exactly like any other Monitor setting once its value is written.
//
// Kept DOM-read/DOM-write as pure functions, separate from index.js's event
// wiring, so the round-trip (render specs -> DOM -> read back specs) is
// testable without a live MonitorUI instance.

import { t } from "../i18n.js";
import { escapeHtml } from "./html.js";

// Mirrors omnicam/guides/model.py's REFERENCE_ROLES -- kept in sync by hand,
// the same way PROFILE_OPTIONS mirrors the backend's profile registry.
export const REFERENCE_ROLES = [
  "camera_motion", "camera_framing", "camera_pacing", "composition",
  "spatial_layout", "blocking", "subject_trajectory", "subject_action",
  "identity", "design", "materials", "lighting", "color", "atmosphere",
  "audio_voice", "audio_rhythm",
];

const MEDIA_TYPES = ["image", "video", "audio"];

function optionsMarkup(values, selected) {
  const selectedSet = new Set(Array.isArray(selected) ? selected : []);
  return values
    .map((value) => `<option value="${value}"${selectedSet.has(value) ? " selected" : ""}>${escapeHtml(value)}</option>`)
    .join("");
}

function rowMarkup(spec) {
  const mediaType = MEDIA_TYPES.includes(spec.media_type) ? spec.media_type : "image";
  return `<div class="oc-reference-row" data-role="reference-row">
    <input type="text" data-field="id" placeholder="${escapeHtml(t("id"))}" value="${escapeHtml(spec.id || "")}">
    <select data-field="media_type">${MEDIA_TYPES.map((value) => `<option value="${value}"${mediaType === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}</select>
    <input type="number" min="1" max="30" data-field="slot_hint" placeholder="1" value="${spec.slot_hint || ""}">
    <select data-field="roles" multiple size="4" title="${escapeHtml(t("Roles this reference is declared for"))}">${optionsMarkup(REFERENCE_ROLES, spec.roles)}</select>
    <select data-field="ignore" multiple size="4" title="${escapeHtml(t("Roles this reference explicitly does not carry"))}">${optionsMarkup(REFERENCE_ROLES, spec.ignore)}</select>
    <button type="button" class="oc-remove-reference" data-act="reference-row-remove" aria-label="${escapeHtml(t("Remove reference"))}">✕</button>
  </div>`;
}

/** Repaints every row from `specs`. Only call this on add/remove -- rewriting
 * the DOM mid-edit would drop whatever the user is typing/selecting. */
export function renderReferenceMatrix(root, specs) {
  const container = root.querySelector('[data-role="reference-matrix-rows"]');
  if (!container) return;
  container.innerHTML = specs.length
    ? specs.map(rowMarkup).join("")
    : `<div class="oc-empty">${escapeHtml(t("No additional references declared."))}</div>`;
}

function selectedValues(select) {
  return select ? [...select.selectedOptions].map((option) => option.value) : [];
}

/** Reads the matrix rows currently in the DOM back into plain objects,
 * shaped for `JSON.stringify` into `reference_plan_json`. Rows with a blank
 * id are dropped -- an in-progress, not-yet-named row is not a valid entry. */
export function readReferenceMatrix(root) {
  return [...root.querySelectorAll('[data-role="reference-row"]')]
    .map((row) => {
      const id = row.querySelector('[data-field="id"]')?.value.trim() || "";
      const mediaType = row.querySelector('[data-field="media_type"]')?.value || "image";
      const slotHintRaw = row.querySelector('[data-field="slot_hint"]')?.value || "";
      const roles = selectedValues(row.querySelector('[data-field="roles"]'));
      const ignore = selectedValues(row.querySelector('[data-field="ignore"]'));
      const entry = { id, media_type: mediaType, roles };
      if (slotHintRaw) entry.slot_hint = Number(slotHintRaw);
      if (ignore.length) entry.ignore = ignore;
      return entry;
    })
    .filter((entry) => entry.id);
}

/** Parses the `reference_plan_json` widget value back into a specs array for
 * rendering. Never throws -- a malformed plan (surfaced separately as a
 * BLOCKED preflight check) just renders as no rows rather than crashing
 * the panel. */
export function referencePlanToSpecs(rawJson) {
  const text = String(rawJson || "").trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
