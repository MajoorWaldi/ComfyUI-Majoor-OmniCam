// The Motion section of the Character inspector (design spec section 27): pick
// an embedded clip, set its Director-frame window / speed / loop, and "Bake
// current frame to pose". Every change is written through the Semantic Director
// API (character.set_motion / character.clear_motion). Motion and pose editing
// are mutually exclusive -- committing a motion re-syncs the Pose editor, which
// disables Edit Pose.

import { t } from "../../i18n.js";
import { sanitizeMotion } from "./motion-state.js";

function optionEl(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function setValue(input, value) {
  if (input && document.activeElement !== input) input.value = String(value);
}

export function createMotionEditor(ui) {
  const panel = ui.root?.querySelector('[data-role="motion-editor"]');
  if (!panel) return { sync() {}, dispose() {} };

  const q = (role) => panel.querySelector(`[data-role="${role}"]`);
  const clipSel = q("motion-clip");
  const startEl = q("motion-start");
  const endEl = q("motion-end");
  const speedEl = q("motion-speed");
  const loopEl = q("motion-loop");
  const bakeBtn = panel.querySelector('[data-motion-act="bake"]');
  let objectId = null;

  const object = () => ui.state?.objects?.find((item) => item.id === objectId) || null;
  const clipNames = () => ui.modelInfoById?.get(objectId)?.animationNames || [];

  function readMotion() {
    const clip = clipSel?.value || "";
    if (!clip) return null;
    return sanitizeMotion({
      clip_id: clip,
      start_frame: Number(startEl?.value) || 0,
      end_frame: Number(endEl?.value) || 0,
      speed: Number(speedEl?.value) || 1,
      loop: loopEl?.checked !== false,
      offset_seconds: 0,
    });
  }

  function commit() {
    const motion = readMotion();
    const operation = motion
      ? { type: "character.set_motion", objectId, motion }
      : { type: "character.clear_motion", objectId };
    const result = ui.directorApi?.execute({
      version: 1,
      id: `tx_motion_${Date.now().toString(36)}`,
      description: "Character motion",
      operations: [operation],
    });
    if (result && !result.ok) ui.setStatus?.(result.error?.message || t("Could not set the motion"));
    ui.poseEditor?.sync?.();
    render();
  }

  function render() {
    const obj = object();
    const names = clipNames();
    const motion = obj?.character?.motion || null;

    if (clipSel) {
      const signature = names.join("|");
      if (clipSel.dataset.sig !== signature) {
        clipSel.dataset.sig = signature;
        clipSel.replaceChildren(
          optionEl("", names.length ? t("No motion (static)") : t("No clips in this model")),
          ...names.map((name) => optionEl(name, name)),
        );
      }
      if (document.activeElement !== clipSel) clipSel.value = motion?.clip_id || "";
      clipSel.disabled = !names.length;
    }

    setValue(startEl, motion?.start_frame ?? 0);
    setValue(endEl, motion?.end_frame ?? 0);
    setValue(speedEl, motion?.speed ?? 1);
    if (loopEl && document.activeElement !== loopEl) loopEl.checked = motion ? motion.loop !== false : true;

    const active = Boolean(motion);
    for (const el of [startEl, endEl, speedEl, loopEl]) if (el) el.disabled = !active;
    if (bakeBtn) bakeBtn.disabled = !active;
  }

  function bake() {
    const obj = object();
    const boneMap = ui.rigMapper?.boneMap;
    if (!obj?.character || !boneMap || !Object.keys(boneMap).length) {
      ui.setStatus?.(t("Map the rig before baking a pose"));
      return;
    }
    const joints = ui.characterRuntime?.sampleCanonicalPose?.(objectId, boneMap) || {};
    ui.directorApi?.execute({
      version: 1,
      id: `tx_bake_${Date.now().toString(36)}`,
      description: "Bake frame to pose",
      operations: [
        { type: "character.clear_motion", objectId },
        {
          type: "character.set_pose",
          objectId,
          pose: { preset_id: "neutral", root_offset: obj.character.pose?.root_offset || [0, 0, 0], joints },
        },
      ],
    });
    ui.setStatus?.(t("Baked current frame to pose"));
    render();
    ui.poseEditor?.sync?.();
  }

  function sync() {
    const selected = ui.selectedObject?.();
    const show = selected?.asset_kind === "character";
    panel.hidden = !show;
    if (!show) {
      objectId = null;
      return;
    }
    objectId = selected.id;
    render();
  }

  clipSel?.addEventListener("change", commit);
  for (const el of [startEl, endEl, speedEl, loopEl]) el?.addEventListener("change", commit);
  bakeBtn?.addEventListener("click", bake);

  return {
    sync,
    dispose() {
      clipSel?.removeEventListener("change", commit);
      for (const el of [startEl, endEl, speedEl, loopEl]) el?.removeEventListener("change", commit);
      bakeBtn?.removeEventListener("click", bake);
    },
  };
}
