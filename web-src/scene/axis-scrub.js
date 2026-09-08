// Interactive mouse scrubbing on vector axis labels and quick-reset buttons.
//
// Enables Maya/Blender-style horizontal dragging on X/Y/Z labels to increment
// or decrement numeric inputs smoothly, with single grouped undo checkpoints.

import { t } from "../i18n.js";

const DEFAULT_SENSITIVITY = 0.05;
const SHIFT_SENSITIVITY = 0.005;
const CTRL_SENSITIVITY = 0.5;

/**
 * Attach horizontal pointer scrubbing to all .oc-axis containers or .oc-axis-tag badges.
 *
 * @param {object} ui - Director UI controller
 * @param {AbortSignal} [signal] - Optional abort signal
 */
export function setupAxisScrubbing(ui, signal) {
  const root = ui.root;
  if (!root) return;

  const onPointerDown = (event) => {
    // Only left-click initiates scrub
    if (event.button !== 0) return;

    // Do not scrub if clicking directly inside an input
    if (event.target.tagName === "INPUT" || event.target.tagName === "SELECT") return;

    const axisLabel = event.target.closest(".oc-axis");
    if (!axisLabel) return;

    const input = axisLabel.querySelector("input[type=number]");
    if (!input || input.disabled || input.readOnly) return;

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startVal = parseFloat(input.value) || 0;
    const stepAttr = parseFloat(input.getAttribute("step")) || 0.1;
    const minAttr = input.hasAttribute("min") ? parseFloat(input.getAttribute("min")) : -Infinity;
    const maxAttr = input.hasAttribute("max") ? parseFloat(input.getAttribute("max")) : Infinity;

    let hasMoved = false;
    let initialSnapshotTaken = false;

    // Set dragging cursor and capture
    axisLabel.classList.add("scrubbing");
    document.body.style.cursor = "ew-resize";
    if (axisLabel.setPointerCapture) {
      try { axisLabel.setPointerCapture(event.pointerId); } catch {}
    }

    const onPointerMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - startX;
      if (Math.abs(deltaX) > 2) {
        hasMoved = true;
      }
      if (!hasMoved) return;

      if (!initialSnapshotTaken) {
        ui.checkpoint?.("Scrub axis");
        initialSnapshotTaken = true;
      }

      let multiplier = DEFAULT_SENSITIVITY;
      if (moveEvt.shiftKey) multiplier = SHIFT_SENSITIVITY;
      else if (moveEvt.ctrlKey || moveEvt.metaKey) multiplier = CTRL_SENSITIVITY;

      const rawStep = stepAttr * multiplier * 20;
      let nextVal = startVal + deltaX * rawStep;

      // Clamp to min/max
      nextVal = Math.max(minAttr, Math.min(maxAttr, nextVal));

      // Format based on step precision
      const decimals = stepAttr >= 1 ? 0 : stepAttr >= 0.1 ? 1 : 2;
      input.value = nextVal.toFixed(decimals);

      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const onPointerUp = (upEvt) => {
      axisLabel.classList.remove("scrubbing");
      document.body.style.cursor = "";
      axisLabel.removeEventListener("pointermove", onPointerMove);
      axisLabel.removeEventListener("pointerup", onPointerUp);
      axisLabel.removeEventListener("pointercancel", onPointerUp);
      if (axisLabel.releasePointerCapture) {
        try { axisLabel.releasePointerCapture(upEvt.pointerId); } catch {}
      }

      if (hasMoved) {
        ui.serialize?.();
        ui.render?.();
      }
    };

    axisLabel.addEventListener("pointermove", onPointerMove);
    axisLabel.addEventListener("pointerup", onPointerUp);
    axisLabel.addEventListener("pointercancel", onPointerUp);
  };

  root.addEventListener("pointerdown", onPointerDown, { signal });
}

/**
 * Attach reset handlers to [data-act="reset-vector"] buttons.
 *
 * @param {object} ui - Director UI controller
 * @param {AbortSignal} [signal] - Optional abort signal
 */
export function setupAxisResetButtons(ui, signal) {
  const root = ui.root;
  if (!root) return;

  root.addEventListener("click", (event) => {
    const btn = event.target.closest('[data-act="reset-vector"]');
    if (!btn) return;

    event.preventDefault();
    event.stopPropagation();

    const target = btn.dataset.target;
    const row = btn.closest(".oc-vec-row");
    if (!row) return;

    const inputs = [...row.querySelectorAll("input[type=number]")];
    if (!inputs.length) return;

    ui.checkpoint?.(t("Reset {target}").replace("{target}", target || "vector"));

    let defaultValues = [0, 0, 0];
    if (target === "position" || target === "pos") {
      defaultValues = [0, 1.5, 0];
    } else if (target === "camera-pos") {
      defaultValues = [6, 4, 6];
    } else if (target === "camera-target" || target === "target") {
      defaultValues = [0, 1.5, 0];
    } else if (target === "scale") {
      defaultValues = [1, 1, 1];
    } else if (target === "rotation" || target === "rot") {
      defaultValues = [0, 0, 0];
    }

    inputs.forEach((input, idx) => {
      const val = defaultValues[idx] !== undefined ? defaultValues[idx] : 0;
      input.value = String(val);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    ui.serialize?.();
    ui.render?.();
    ui.setStatus?.(t("Reset {target}").replace("{target}", target || "vector"));
  }, { signal });
}
