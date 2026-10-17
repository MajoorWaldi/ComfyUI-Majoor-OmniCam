// TransformControls' radial ratio is singular at its center handle. Use a
// screen-space gesture there, independent of camera rays and object size.
export function installStableUniformScale(controls, domElement) {
  const down = controls.pointerDown, move = controls.pointerMove, up = controls.pointerUp;
  if (!down || !move || !up) return () => {};
  let gesture = null;
  controls.pointerDown = function (pointer) {
    const wasDragging = this.dragging;
    down.call(this, pointer);
    if (!wasDragging && this.dragging && this.mode === "scale" && this.axis === "XYZ" && pointer) {
      const rect = domElement.getBoundingClientRect();
      gesture = { x: pointer.x, y: pointer.y, width: rect.width, height: rect.height,
        object: this.object, scale: this.object.scale.clone() };
    }
  };
  controls.pointerMove = function (pointer) {
    if (!gesture || !this.dragging || this.mode !== "scale" || this.axis !== "XYZ" || this.object !== gesture.object) {
      return move.call(this, pointer);
    }
    if (!pointer || pointer.button !== -1) return;
    const pixels = ((pointer.x - gesture.x) * gesture.width + (pointer.y - gesture.y) * gesture.height) / 2;
    if (!Number.isFinite(pixels)) return;
    let factor = Math.exp(Math.max(-20, Math.min(20, pixels * 0.01)));
    if (this.scaleSnap) factor = Math.max(this.scaleSnap, Math.round(factor / this.scaleSnap) * this.scaleSnap);
    this.object.scale.copy(gesture.scale).multiplyScalar(factor);
    this.dispatchEvent({ type: "change" });
    this.dispatchEvent({ type: "objectChange" });
  };
  controls.pointerUp = function (pointer) {
    up.call(this, pointer);
    if (!this.dragging) gesture = null;
  };
  return () => {
    gesture = null;
    controls.pointerDown = down; controls.pointerMove = move; controls.pointerUp = up;
  };
}
