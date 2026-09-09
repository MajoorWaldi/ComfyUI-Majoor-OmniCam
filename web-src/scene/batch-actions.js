// Batch operations and selection helpers for scene objects in OmniCam Director.

import { add } from "../director/core.js";
import { setCardMedia } from "../dom-media.js";
import { t } from "../i18n.js";
import { duplicateObject } from "./objects.js";

/**
 * Duplicates all selected objects under a single undo checkpoint.
 * If only a single object is selected, falls back to `duplicateObject`.
 */
export function duplicateSelectedObjects(ui) {
  const ids = [...(ui.selectedObjectIds?.size ? ui.selectedObjectIds : [ui.selectedObjectId])]
    .filter((id) => id && ui.state.objects.some((o) => o.id === id));
  if (!ids.length) return [];
  if (ids.length === 1) {
    duplicateObject(ui, ids[0]);
    return ui.selectedObjectId ? [ui.selectedObjectId] : [];
  }

  ui.checkpoint("Duplicate objects");
  const newIds = [];
  ids.forEach((id, index) => {
    const source = ui.state.objects.find((item) => item.id === id);
    if (!source) return;
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = `${source.type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    copy.name = `${source.name || source.type} Copy`;
    const offset = 0.35 + index * 0.15;
    copy.position = add(copy.position || [0, 0, 0], [offset, 0, offset]);

    if ((copy.type === "model" || copy.type === "glb") && ui.modelUrlsById.has(source.id)) {
      ui.modelUrlsById.set(copy.id, ui.modelUrlsById.get(source.id));
    } else if (copy.type === "card" && ui.cardMediaById.has(source.id)) {
      setCardMedia(ui, copy.id, ui.cardMediaById.get(source.id), false, copy.asset || ui.cardMediaAssetById?.get?.(source.id) || "");
    }

    ui.state.objects.push(copy);
    newIds.push(copy.id);
  });

  if (newIds.length) {
    ui.selectedEntity = "object";
    ui.selectedObjectIds = new Set(newIds);
    ui.selectedObjectId = newIds[newIds.length - 1];
    ui.serialize();
    ui.refreshObjects();
    ui.refreshKeys();
    ui.refreshInspector();
    ui.render();
    ui.setStatus(t("Duplicated {count} objects").replace("{count}", String(newIds.length)));
  }
  return newIds;
}

/**
 * Toggle visibility for all selected objects.
 * If targetVisibility is boolean, forces that state; otherwise toggles the primary object's inverse.
 */
export function toggleSelectedObjects(ui, targetVisibility = null) {
  const ids = [...(ui.selectedObjectIds?.size ? ui.selectedObjectIds : [ui.selectedObjectId])]
    .filter((id) => id && ui.state.objects.some((o) => o.id === id));
  if (!ids.length) return;

  const primary = ui.state.objects.find((o) => o.id === (ui.selectedObjectId || ids[0]));
  const nextVisible = typeof targetVisibility === "boolean" ? targetVisibility : !(primary?.visible ?? true);

  ui.checkpoint("Toggle objects visibility");
  for (const id of ids) {
    const obj = ui.state.objects.find((o) => o.id === id);
    if (obj) obj.visible = nextVisible;
  }

  ui.serialize();
  ui.refreshObjects();
  ui.render();
  ui.setStatus(
    nextVisible
      ? t("Show {count} objects").replace("{count}", String(ids.length))
      : t("Hide {count} objects").replace("{count}", String(ids.length))
  );
}

/**
 * Toggle lock state for all selected objects.
 */
export function lockSelectedObjects(ui, targetLocked = null) {
  const ids = [...(ui.selectedObjectIds?.size ? ui.selectedObjectIds : [ui.selectedObjectId])]
    .filter((id) => id && ui.state.objects.some((o) => o.id === id));
  if (!ids.length) return;

  const primary = ui.state.objects.find((o) => o.id === (ui.selectedObjectId || ids[0]));
  const nextLocked = typeof targetLocked === "boolean" ? targetLocked : !(primary?.locked ?? false);

  ui.checkpoint("Lock objects");
  for (const id of ids) {
    const obj = ui.state.objects.find((o) => o.id === id);
    if (obj) obj.locked = nextLocked;
  }

  ui.serialize();
  ui.refreshObjects();
  ui.refreshInspector();
  ui.render();
  ui.setStatus(
    nextLocked
      ? t("Locked {count} objects").replace("{count}", String(ids.length))
      : t("Unlocked {count} objects").replace("{count}", String(ids.length))
  );
}

/**
 * Select all objects in the scene.
 */
export function selectAllObjects(ui) {
  const validObjects = (ui.state.objects || []).filter((o) => o.id);
  if (!validObjects.length) return;

  ui.finishCameraEdit?.();
  ui.selectedEntity = "object";
  ui.selectedObjectIds = new Set(validObjects.map((o) => o.id));
  ui.selectedObjectId = validObjects[validObjects.length - 1].id;
  ui.outlinerAnchorId = ui.selectedObjectId;
  ui.selectedKeyFrame = null;
  ui.editingKeyFrame = null;

  ui.refreshObjects();
  ui.refreshKeys();
  ui.refreshInspector();
  ui.render();
  ui.setStatus(t("Selected all {count} objects").replace("{count}", String(validObjects.length)));
}

/**
 * Deselect all objects and return to camera entity.
 */
export function deselectAll(ui) {
  ui.selectedObjectIds?.clear?.();
  ui.selectedObjectId = null;
  ui.selectedEntity = "camera";
  ui.outlinerAnchorId = null;
  ui.selectedKeyFrame = ui.state.keyframes.find((key) => key.frame === ui.frame)?.frame ?? null;
  ui.editingKeyFrame = null;

  ui.refreshObjects();
  ui.refreshKeys();
  ui.refreshInspector();
  ui.render();
  ui.setStatus(t("Selection cleared"));
}

/**
 * Invert current object selection.
 */
export function invertSelection(ui) {
  const current = ui.selectedObjectIds || new Set(ui.selectedObjectId ? [ui.selectedObjectId] : []);
  const inverted = (ui.state.objects || [])
    .map((o) => o.id)
    .filter((id) => id && !current.has(id));

  if (!inverted.length) {
    deselectAll(ui);
    return;
  }

  ui.finishCameraEdit?.();
  ui.selectedEntity = "object";
  ui.selectedObjectIds = new Set(inverted);
  ui.selectedObjectId = inverted[inverted.length - 1];
  ui.outlinerAnchorId = ui.selectedObjectId;

  ui.refreshObjects();
  ui.refreshKeys();
  ui.refreshInspector();
  ui.render();
  ui.setStatus(t("Inverted selection ({count} objects)").replace("{count}", String(inverted.length)));
}
