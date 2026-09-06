// DOM view rendering for scene reconstruction.

import { t } from "../../i18n.js";
import { reconstructionActions } from "./state.js";

/** Progress travels as a 0..1 fraction throughout; only the view speaks percent. */
function percent(state) {
  return Math.round(Math.min(1, Math.max(0, state?.progress || 0)) * 100);
}

export function renderReconstructionView(root, state) {
  if (!root) return;

  const actions = reconstructionActions(state);

  const runBtn = root.querySelector('[data-role="reconstruction-run"]');
  if (runBtn) runBtn.disabled = !actions.canStart;

  const stopBtn = root.querySelector('[data-role="reconstruction-stop"]');
  if (stopBtn) stopBtn.disabled = !actions.canStop;

  const openBtn = root.querySelector('[data-role="reconstruction-open-director"]');
  if (openBtn) openBtn.disabled = !actions.canOpenDirector;

  const progressBar = root.querySelector('[data-role="reconstruction-progress"]');
  if (progressBar) {
    progressBar.style.width = `${percent(state)}%`;
  }

  const stageLabel = root.querySelector('[data-role="reconstruction-stage"]');
  if (stageLabel) {
    if (state?.error) {
      const msg = state.error?.message || state.error?.code || String(state.error);
      stageLabel.textContent = msg;
      stageLabel.dataset.state = "error";
    } else if (state?.stage) {
      stageLabel.textContent = `${state.stage} (${percent(state)}%)`;
      stageLabel.dataset.state = "active";
    } else if (state?.jobState && state.jobState !== "IDLE") {
      stageLabel.textContent = `${state.jobState} (${percent(state)}%)`;
      stageLabel.dataset.state = state.jobState === "DONE" ? "ok" : "active";
    } else {
      stageLabel.textContent = t("Ready to reconstruct");
      stageLabel.dataset.state = "idle";
    }
  }

  const summaryEl = root.querySelector('[data-role="reconstruction-summary"]');
  if (summaryEl) {
    if (state?.summary) {
      summaryEl.hidden = false;
      const s = state.summary;
      // Keys mirror the pipeline summary in omnicam/reconstruction/pipeline.py.
      const triVal = s.triangle_count != null ? s.triangle_count : s.mesh_triangles;
      const tri = triVal != null ? Number(triVal).toLocaleString() : null;
      const fovVal = s.camera_fov_x != null ? s.camera_fov_x : s.camera_fov;
      const fov = fovVal != null ? Number(fovVal).toFixed(1) : null;
      const ground = Number(s.ground_confidence) > 0 ? t("ground plane detected") : null;
      const parts = [];
      if (tri) parts.push(`${tri} ${t("triangles")}`);
      if (fov) parts.push(`FOV ${fov}°`);
      if (ground) parts.push(ground);
      summaryEl.textContent = parts.join(" • ");
    } else {
      summaryEl.hidden = true;
      summaryEl.textContent = "";
    }
  }

  const warningsEl = root.querySelector('[data-role="reconstruction-warnings"]');
  if (warningsEl) {
    const warnings = state?.warnings || [];
    if (warnings.length > 0) {
      warningsEl.hidden = false;
      warningsEl.replaceChildren();
      for (const w of warnings) {
        const item = document.createElement("div");
        item.className = "oc-warning-item";
        item.textContent = `⚠ ${w}`;
        warningsEl.appendChild(item);
      }
    } else {
      warningsEl.hidden = true;
      warningsEl.replaceChildren();
    }
  }
}
