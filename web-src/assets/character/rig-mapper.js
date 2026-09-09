// The Rig Mapper (design spec section 23): a canonical-joint -> runtime-bone
// grid for the selected Character. Auto Map runs the shared auto-mapper on the
// loaded model's bones; Save writes the mapping to the *catalog* row (the
// catalog owns source-bone mapping, scene state never does -- spec section 22).

import { t } from "../../i18n.js";
import { createAssetLibraryApi } from "../api.js";
import {
  OMNICAM_HUMANOID_V1,
  REQUIRED_JOINTS,
  autoMapBones,
  missingRequiredJoints,
  rigIsComplete,
} from "./rig-profile.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function jointRowsMarkup(boneNames, boneMap) {
  const options = (selected) =>
    [`<option value="">${t("— unmapped —")}</option>`]
      .concat(
        boneNames.map(
          (name) => `<option value="${escapeHtml(name)}"${name === selected ? " selected" : ""}>${escapeHtml(name)}</option>`,
        ),
      )
      .join("");
  return REQUIRED_JOINTS.map((joint) => {
    const mapped = boneMap[joint] || "";
    const ok = mapped && boneNames.includes(mapped);
    return `<label class="oc-rig-row${ok ? " ok" : ""}" data-joint="${joint}">
      <span class="oc-rig-joint">${joint}</span>
      <select data-rig-joint="${joint}">${options(mapped)}</select>
      <span class="oc-rig-tick">${ok ? "✓" : ""}</span>
    </label>`;
  }).join("");
}

export function createRigMapper(ui, options = {}) {
  const root = ui.root;
  const api = options.apiClient || createAssetLibraryApi({
    fetchApi: (path, init) => (ui.api || ui.app?.api).fetchApi(path, init),
  });
  const panel = root.querySelector('[data-role="rig-mapper"]');
  if (!panel) return { sync() {}, dispose() {} };

  const grid = panel.querySelector('[data-role="rig-mapper-grid"]');
  const status = panel.querySelector('[data-role="rig-mapper-status"]');
  let objectId = null;
  let working = {};

  const currentObject = () =>
    ui.state?.objects?.find((item) => item.id === objectId) || null;
  const boneNames = () => ui.webgl?.getModelBoneNames?.(objectId) || [];

  function renderStatus() {
    if (!status) return;
    const missing = missingRequiredJoints(working);
    if (rigIsComplete(working)) {
      status.textContent = t("Humanoid v1 ✓ — all 22 joints mapped");
      status.dataset.state = "ok";
    } else {
      status.textContent = t("Incomplete — {n} joint(s) unmapped").replace("{n}", missing.length);
      status.dataset.state = "warn";
    }
  }

  function render() {
    if (grid) grid.innerHTML = jointRowsMarkup(boneNames(), working);
    renderStatus();
  }

  function sync() {
    const object = ui.selectedObject?.();
    const show = object?.asset_kind === "character";
    panel.hidden = !show;
    if (!show) {
      objectId = null;
      return;
    }
    if (object.id === objectId) return;
    objectId = object.id;
    panel.open = true;
    working = {};
    // Seed from the catalog row's saved mapping when the asset has one.
    if (object.asset_id) {
      api.get(object.asset_id).then((row) => {
        if (objectId !== object.id) return;
        working = { ...(row?.asset?.rig?.bone_map || {}) };
        render();
      }).catch(() => render());
    } else {
      render();
    }
  }

  function onGridChange(event) {
    const select = event.target.closest("[data-rig-joint]");
    if (!select) return;
    const joint = select.dataset.rigJoint;
    if (select.value) working[joint] = select.value;
    else delete working[joint];
    render();
  }

  function onClick(event) {
    const action = event.target.closest("[data-rig-act]")?.dataset.rigAct;
    if (action === "auto") {
      working = autoMapBones(boneNames());
      render();
    } else if (action === "validate") {
      render();
      ui.setStatus?.(rigIsComplete(working)
        ? t("Rig is complete")
        : t("Rig still missing: {list}").replace("{list}", missingRequiredJoints(working).join(", ")));
    } else if (action === "save") {
      save();
    }
  }

  async function save() {
    const object = currentObject();
    if (!object?.asset_id) {
      ui.setStatus?.(t("Instantiate this asset from the Asset Browser before mapping its rig"));
      return;
    }
    try {
      const result = await api.patch(object.asset_id, {
        rig: { profile: OMNICAM_HUMANOID_V1, bone_map: working },
      });
      object.character = {
        ...(object.character || {}),
        rig_profile: rigIsComplete(working) ? OMNICAM_HUMANOID_V1 : null,
      };
      ui.assetBrowser?.store?.upsert?.(result.asset);
      ui.checkpoint?.("Save rig mapping");
      ui.serialize?.();
      ui.refreshObjects?.();
      ui.refreshInspector?.();
      ui.setStatus?.(t("Rig mapping saved"));
    } catch (error) {
      ui.setStatus?.(error.message || t("Could not save the rig mapping"));
    }
  }

  grid?.addEventListener("change", onGridChange);
  panel.addEventListener("click", onClick);
  sync();

  return {
    sync,
    get boneMap() {
      return { ...working };
    },
    dispose() {
      grid?.removeEventListener("change", onGridChange);
      panel.removeEventListener("click", onClick);
    },
  };
}
