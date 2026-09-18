// DCC 3D Drag-to-Scrub Numeric Controller
// Enables Blender/Maya/Houdini-style click-and-drag value scrubbing on numeric inputs.

/**
 * Attaches drag-to-scrub behavior to a container or input element.
 * @param {HTMLElement} element - Label or wrapper element with numeric input child, or the input itself.
 * @param {Object} options - Configuration options
 * @param {number} [options.step=0.1] - Base step per pixel moved
 * @param {number} [options.shiftMultiplier=0.1] - Multiplier when Shift is held
 * @param {number} [options.ctrlMultiplier=10] - Multiplier when Ctrl is held
 * @returns {Function} Cleanup function to remove listeners
 */
export function attachDragScrub(element, options = {}) {
  if (!element) return () => {};

  const input = element.tagName === "INPUT" ? element : element.querySelector("input[type='number']");
  if (!input) return () => {};

  const baseStep = options.step || parseFloat(input.step) || 0.1;
  const shiftMultiplier = options.shiftMultiplier ?? 0.1;
  const ctrlMultiplier = options.ctrlMultiplier ?? 10;

  let isDragging = false;
  let startX = 0;
  let startVal = 0;
  let hasMoved = false;

  const onMouseDown = (e) => {
    // Only primary mouse button (LMB)
    if (e.button !== 0) return;

    // If clicking directly into the input and it's already focused, let normal text selection happen
    if (e.target === input && document.activeElement === input) {
      return;
    }

    startX = e.clientX;
    startVal = parseFloat(input.value) || 0;
    hasMoved = false;

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    const deltaX = e.clientX - startX;
    if (!hasMoved && Math.abs(deltaX) < 3) {
      return;
    }

    if (!hasMoved) {
      hasMoved = true;
      isDragging = true;
      document.body.style.cursor = "ew-resize";
      input.blur(); // dismiss typing cursor during drag
    }

    e.preventDefault();

    let multiplier = 1;
    if (e.shiftKey) multiplier = shiftMultiplier;
    else if (e.ctrlKey || e.metaKey) multiplier = ctrlMultiplier;

    const change = deltaX * baseStep * multiplier;
    let newVal = startVal + change;

    // Precision rounding to avoid floating point jitter (e.g. 0.30000000000000004)
    const decimals = Math.max(1, (baseStep * multiplier).toString().split(".")[1]?.length || 1);
    newVal = parseFloat(newVal.toFixed(decimals));

    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    if (!isNaN(min)) newVal = Math.max(min, newVal);
    if (!isNaN(max)) newVal = Math.min(max, newVal);

    if (parseFloat(input.value) !== newVal) {
      input.value = newVal;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const onMouseUp = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);

    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = "";
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  element.addEventListener("mousedown", onMouseDown);

  return () => {
    element.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    if (isDragging) document.body.style.cursor = "";
  };
}

/**
 * Initializes drag-to-scrub on all .oc-axis and .oc-scrub-field elements in a container.
 * @param {HTMLElement} root - Container containing numeric field rows
 * @returns {Array<Function>} Array of disposers
 */
export function initAllDragScrubs(root) {
  if (!root) return [];
  const disposers = [];
  const targets = root.querySelectorAll(".oc-axis, .oc-scrub-field, .oc-field-row.is-scrub");
  for (const el of targets) {
    disposers.push(attachDragScrub(el));
  }
  return disposers;
}
