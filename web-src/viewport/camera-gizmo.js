// Solid camera body and look-at crosshair drawn along an animated camera path.
//
// The wireframe frustum alone reads as "some lines in space". A small shaded
// body with a lens cone tells you instantly which way the camera faces and
// where it sits, which is the whole point of a path preview.

/**
 * A camera body oriented along `forward`, sized relative to the frustum so it
 * stays legible whether the camera is 2 or 200 units from its target.
 *
 * @returns {object} a THREE.Group placed at `position`
 */
export function cameraBodyGizmo(THREE, { position, forward, up, color, scale = 1, active = true }) {
  const group = new THREE.Group();
  const opacity = active ? 0.95 : 0.5;
  const material = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, depthTest: false,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.42), material);
  body.renderOrder = 912;
  group.add(body);

  // Lens: a cone pointing down -Z, which is where the body's forward is.
  const lens = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.26, 20), material);
  lens.rotation.x = -Math.PI / 2;
  lens.position.z = -0.32;
  lens.renderOrder = 912;
  group.add(lens);

  group.scale.setScalar(scale);
  group.position.copy(position);
  // lookAt orients -Z toward the target, matching the lens direction above.
  group.up.copy(up);
  group.lookAt(position.clone().add(forward));
  return group;
}

/**
 * The orange look-at marker: a ring plus a cross, always facing the viewer's
 * camera so it never degenerates into a line.
 */
export function targetCrosshair(THREE, { position, color = 0xf2a93b, radius = 0.28, bold = false }) {
  const group = new THREE.Group();
  // The selected keyframe's look-at is drawn "in bold": a brighter colour, a
  // doubled ring and a filled centre dot, since WebGL ignores line width.
  const drawColor = bold ? 0xfff1a8 : color;
  const material = new THREE.LineBasicMaterial({ color: drawColor, transparent: true, opacity: bold ? 1 : 0.95, depthTest: false });

  const makeRing = (r) => {
    const circle = [];
    const segments = 48;
    for (let index = 0; index <= segments; index++) {
      const angle = (index / segments) * Math.PI * 2;
      circle.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
    }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(circle), material);
    line.renderOrder = 915;
    return line;
  };
  group.add(makeRing(radius));
  if (bold) {
    group.add(makeRing(radius * 1.18));
    const dot = new THREE.Mesh(
      new THREE.RingGeometry(0, radius * 0.3, 16),
      new THREE.MeshBasicMaterial({ color: drawColor, transparent: true, opacity: 1, depthTest: false }),
    );
    dot.renderOrder = 916;
    group.add(dot);
  }

  const arm = radius * 1.55;
  const cross = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-arm, 0, 0), new THREE.Vector3(-radius * 0.45, 0, 0),
      new THREE.Vector3(radius * 0.45, 0, 0), new THREE.Vector3(arm, 0, 0),
      new THREE.Vector3(0, -arm, 0), new THREE.Vector3(0, -radius * 0.45, 0),
      new THREE.Vector3(0, radius * 0.45, 0), new THREE.Vector3(0, arm, 0),
    ]),
    material,
  );
  cross.renderOrder = 915;
  group.add(cross);

  group.position.copy(position);
  group.userData.omnicamBillboard = true;
  return group;
}
