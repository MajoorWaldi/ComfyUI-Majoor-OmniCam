// The FK Pose editor (design spec section 25): an "Edit Pose" mode that shows
// the canonical-joint overlay, lets one joint be picked and rotated on X/Y/Z,
// and writes every change through the Semantic Director API
// (character.set_joint_rotation / character.set_pose). Presets are
// source-rig-independent and come from /library/poses; a custom pose is saved
// back there. Pose editing and an active motion clip are mutually exclusive
// (section 27) -- Edit Pose is disabled while a clip is set.

import { eulerFromQuaternion, quaternionFromEuler } from "../../director/core.js";
import { promptText } from "../../director/ui-services.js";
import { t } from "../../i18n.js";
import { createAssetLibraryApi } from "../api.js";
import { evaluatePose, sanitizePose } from "./pose-state.js";
import { createRigOverlay } from "./rig-overlay.js";

const SLUG = /[^a-z0-9_-]+/g;

export function createPoseEditor(ui, options = {}) {
  const root = ui.root;
  const api = options.apiClient || createAssetLibraryApi({
    fetchApi: (path, init) => (ui.api || ui.app?.api).fetchApi(path, init),
  });
  const panel = root.querySelector('[data-role="pose-editor"]');
  if (!panel) return { sync() {}, update() {}, dispose() {} };

  const presetSelect = panel.querySelector('[data-role="pose-preset"]');
  const editBtn = panel.querySelector('[data-pose-act="edit"]');
  const jointRow = panel.querySelector('[data-role="pose-joint-row"]');
  const jointName = panel.querySelector('[data-role="pose-joint-name"]');
  const rotInputs = ["x", "y", "z"].map((axis) => panel.querySelector(`[data-role="pose-rot-${axis}"]`));

  let objectId = null;
  let editing = false;
  let presetsById = new Map();

  const object = () => ui.state?.objects?.find((item) => item.id === objectId) || null;
  const boneMap = () => (ui.rigMapper?.boneMap && Object.keys(ui.rigMapper.boneMap).length ? ui.rigMapper.boneMap : null);
  const selectedJoint = () =>
    ui.subSelection?.type === "character_joint" && ui.subSelection.objectId === objectId
      ? ui.subSelection.jointId
      : null;

  function presetEntry(raw) {
    const clean = sanitizePose({ ...raw, preset_id: raw.id });
    return { id: raw.id, name: raw.name || raw.id, root_offset: clean.root_offset, joints: clean.joints };
  }

  function evaluatedJoints(character) {
    const preset = presetsById.get(character?.pose?.preset_id) || null;
    return evaluatePose({ preset, overrides: character?.pose }).joints;
  }

  function applyToViewport() {
    const obj = object();
    if (!obj?.character || !boneMap()) return;
    ui.webgl?.applyCharacterPose?.(objectId, boneMap(), editing || obj.character.pose?.joints
      ? evaluatedJoints(obj.character) : {});
  }

  function renderJointControls() {
    const joint = selectedJoint();
    const show = editing && Boolean(joint);
    if (jointRow) jointRow.hidden = !show;
    if (!show) return;
    if (jointName) jointName.textContent = joint;
    const obj = object();
    const quat = evaluatedJoints(obj?.character)[joint] || [0, 0, 0, 1];
    const euler = eulerFromQuaternion(quat);
    rotInputs.forEach((input, index) => {
      if (input && document.activeElement !== input) input.value = String(Math.round(euler[index] * 100) / 100);
    });
  }

  function render() {
    const obj = object();
    const hasMotion = Boolean(obj?.character?.motion);
    if (editBtn) {
      editBtn.classList.toggle("active", editing);
      editBtn.disabled = hasMotion;
      editBtn.title = hasMotion ? t("Clear the motion clip to edit the pose") : t("Toggle FK pose editing");
    }
    if (presetSelect) {
      const options = [["neutral", t("Standing Neutral")]]
        .concat([...presetsById.values()].filter((p) => p.id !== "neutral").map((p) => [p.id, p.name || p.id]));
      const signature = options.map((o) => o.join(":")).join("|");
      if (presetSelect.dataset.sig !== signature) {
        presetSelect.dataset.sig = signature;
        presetSelect.replaceChildren(...options.map(([value, label]) => {
          const opt = document.createElement("option");
          opt.value = value;
          opt.textContent = label;
          return opt;
        }));
      }
      if (document.activeElement !== presetSelect) presetSelect.value = obj?.character?.pose?.preset_id || "neutral";
    }
    renderJointControls();
    applyToViewport();
  }

  async function loadPresets() {
    try {
      const result = await api.listPoses();
      presetsById = new Map((result.poses || []).filter((p) => p?.id).map((p) => [p.id, presetEntry(p)]));
    } catch {
      presetsById = new Map();
    }
    if (!presetsById.has("neutral")) presetsById.set("neutral", presetEntry({ id: "neutral", name: "Standing Neutral" }));
    render();
  }

  function setJointRotation() {
    const joint = selectedJoint();
    if (!joint) return;
    const euler = rotInputs.map((input) => Number(input?.value) || 0);
    const rotation = quaternionFromEuler(euler);
    const result = ui.directorApi?.execute({
      version: 1,
      id: `tx_pose_${Date.now().toString(36)}`,
      description: "Pose joint",
      operations: [{ type: "character.set_joint_rotation", objectId, joint, rotation }],
    });
    if (result && !result.ok) ui.setStatus?.(result.error?.message || t("Could not set the joint"));
    render();
  }

  function choosePreset() {
    const presetId = presetSelect?.value || "neutral";
    const preset = presetsById.get(presetId) || sanitizePose({ preset_id: presetId });
    ui.directorApi?.execute({
      version: 1,
      id: `tx_preset_${Date.now().toString(36)}`,
      description: "Pose preset",
      operations: [{ type: "character.set_pose", objectId, pose: { preset_id: presetId, root_offset: preset.root_offset, joints: {} } }],
    });
    render();
  }

  async function savePose() {
    const obj = object();
    if (!obj?.character) return;
    const name = (await promptText(ui, t("Save Pose"), t("Pose name"), ""))?.trim();
    if (!name || ui.disposed) return;
    const id = name.toLowerCase().replace(SLUG, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "pose";
    try {
      const result = await api.savePose({
        id, name, profile: "omnicam_humanoid_v1",
        root_offset: obj.character.pose?.root_offset || [0, 0, 0],
        joints: evaluatedJoints(obj.character),
      });
      presetsById.set(result.pose.id, presetEntry(result.pose));
      ui.setStatus?.(t("Pose saved: {name}").replace("{name}", name));
      render();
    } catch (error) {
      ui.setStatus?.(error.message || t("Could not save the pose"));
    }
  }

  function toggleEdit() {
    const obj = object();
    if (!obj?.character || obj.character.motion) return;
    editing = !editing;
    if (!editing && ui.subSelection?.type === "character_joint") ui.subSelection = null;
    render();
    ui.rigOverlay?.update?.();
  }

  function pickJoint(jointId) {
    if (!editing) return;
    ui.subSelection = { type: "character_joint", objectId, jointId };
    render();
    ui.rigOverlay?.update?.();
  }

  const overlay = createRigOverlay(ui, {
    onPick: pickJoint,
    isActive: () => (editing && objectId && boneMap()
      ? { objectId, boneMap: boneMap(), selectedJoint: selectedJoint() }
      : null),
  });
  ui.rigOverlay = overlay;

  function sync() {
    const selected = ui.selectedObject?.();
    const show = selected?.asset_kind === "character";
    panel.hidden = !show;
    if (!show) {
      if (editing) editing = false;
      objectId = null;
      overlay.update();
      return;
    }
    if (selected.id !== objectId) {
      objectId = selected.id;
      editing = false;
      if (ui.subSelection?.type === "character_joint") ui.subSelection = null;
      if (!presetsById.size) loadPresets();
    }
    render();
    overlay.update();
  }

  presetSelect?.addEventListener("change", choosePreset);
  editBtn?.addEventListener("click", toggleEdit);
  panel.querySelector('[data-pose-act="save"]')?.addEventListener("click", savePose);
  for (const input of rotInputs) {
    input?.addEventListener("change", setJointRotation);
    input?.addEventListener("input", setJointRotation);
  }
  loadPresets();

  return {
    sync,
    update() {
      overlay.update();
      applyToViewport();
    },
    get editing() {
      return editing;
    },
    dispose() {
      overlay.dispose();
      presetSelect?.removeEventListener("change", choosePreset);
      editBtn?.removeEventListener("click", toggleEdit);
      for (const input of rotInputs) {
        input?.removeEventListener("change", setJointRotation);
        input?.removeEventListener("input", setJointRotation);
      }
    },
  };
}
