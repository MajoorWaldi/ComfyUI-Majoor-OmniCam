// Inspection-only camera controls for the track viewer.
//
// Orbit, pan and dolly, and nothing else. There is no picking, no dragging of
// anything in the scene, and no way to move a solved camera: the viewer exists
// to look at a solve, and every affordance that could be mistaken for editing
// is deliberately absent.
//
// The orbit state is plain spherical maths so the preset views can be asserted
// in a test -- "Top" pointing at the ground is not something to discover later.

export const VIEWS = ["perspective", "top", "front", "side"];

const VIEW_ANGLES = {
  perspective: { theta: Math.PI * 0.25, phi: Math.PI * 0.32 },
  // Just off the pole: exactly overhead makes the up vector ambiguous and the
  // view flips as soon as the user nudges it.
  top: { theta: 0, phi: 0.001 },
  front: { theta: 0, phi: Math.PI / 2 },
  side: { theta: Math.PI / 2, phi: Math.PI / 2 },
};

const MIN_PHI = 0.001;
const MAX_PHI = Math.PI - 0.001;

export class TrackControls {
  constructor(camera, { onChange = () => {} } = {}) {
    this.camera = camera;
    this.onChange = onChange;
    this.target = [0, 0, 0];
    this.distance = 6;
    this.theta = VIEW_ANGLES.perspective.theta;
    this.phi = VIEW_ANGLES.perspective.phi;
    this.drag = null;
    this.apply();
  }

  /** Place the camera from the current spherical state. */
  apply() {
    const sinPhi = Math.sin(this.phi);
    const position = [
      this.target[0] + this.distance * sinPhi * Math.sin(this.theta),
      this.target[1] + this.distance * Math.cos(this.phi),
      this.target[2] + this.distance * sinPhi * Math.cos(this.theta),
    ];
    this.camera?.position?.set?.(...position);
    this.camera?.lookAt?.(...this.target);
    this.onChange();
    return position;
  }

  setView(view) {
    const angles = VIEW_ANGLES[view] || VIEW_ANGLES.perspective;
    this.theta = angles.theta;
    this.phi = angles.phi;
    return this.apply();
  }

  /** Frame a bounding sphere: the "Fit Track" button. */
  fit({ centre = [0, 0, 0], extent = 1 } = {}) {
    this.target = centre.map(Number);
    const fov = Number(this.camera?.fov) || 50;
    // Half the extent has to fit inside half the vertical field, with headroom.
    this.distance = Math.max(0.2, (extent * 0.6) / Math.tan((fov * Math.PI) / 360) + extent * 0.15);
    return this.apply();
  }

  orbit(deltaX, deltaY) {
    this.theta -= deltaX * 0.005;
    this.phi = Math.max(MIN_PHI, Math.min(MAX_PHI, this.phi - deltaY * 0.005));
    return this.apply();
  }

  pan(deltaX, deltaY) {
    // Pan in the camera's own plane, scaled by distance so the world keeps up
    // with the pointer at any zoom.
    const scale = this.distance * 0.0015;
    const right = [Math.cos(this.theta), 0, -Math.sin(this.theta)];
    const up = [
      -Math.cos(this.phi) * Math.sin(this.theta),
      Math.sin(this.phi),
      -Math.cos(this.phi) * Math.cos(this.theta),
    ];
    this.target = this.target.map(
      (value, axis) => value - right[axis] * deltaX * scale + up[axis] * deltaY * scale,
    );
    return this.apply();
  }

  dolly(delta) {
    this.distance = Math.max(0.05, Math.min(1e6, this.distance * (1 + delta * 0.0015)));
    return this.apply();
  }

  // -- pointer plumbing --------------------------------------------------

  beginDrag(event) {
    this.drag = {
      x: event.clientX, y: event.clientY,
      mode: event.button === 1 || event.shiftKey ? "pan" : "orbit",
    };
  }

  moveDrag(event) {
    if (!this.drag) return false;
    const deltaX = event.clientX - this.drag.x;
    const deltaY = event.clientY - this.drag.y;
    this.drag.x = event.clientX;
    this.drag.y = event.clientY;
    if (this.drag.mode === "pan") this.pan(deltaX, deltaY);
    else this.orbit(deltaX, deltaY);
    return true;
  }

  endDrag() {
    this.drag = null;
  }

  wheel(event) {
    this.dolly(Number(event.deltaY) || 0);
  }
}
