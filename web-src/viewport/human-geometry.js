// Procedural low-poly human mannequin geometry generator for OmniCam.
// Normalized height ~1.0 with feet standing at y = 0 so that scaling by
// size [0.7, 1.8, 0.4] produces an authentic 1.8m human standing on the floor.

let cachedHumanGeometry = null;

function mergeGeometries(THREE, geometries) {
  let totalVertices = 0;
  const nonIndexed = geometries.map((geom) => {
    const ni = geom.index ? geom.toNonIndexed() : geom;
    totalVertices += ni.attributes.position.count;
    return ni;
  });

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  let offset = 0;

  for (const geom of nonIndexed) {
    const pos = geom.attributes.position.array;
    const norm = geom.attributes.normal?.array;
    positions.set(pos, offset);
    if (norm) {
      normals.set(norm, offset);
    }
    offset += pos.length;
    if (geom !== geometries[nonIndexed.indexOf(geom)]) {
      geom.dispose();
    }
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  merged.computeVertexNormals();

  for (const geom of geometries) {
    geom.dispose();
  }

  return merged;
}

/**
 * Creates or retrieves a cached low-poly human mannequin BufferGeometry.
 * @param {object} THREE - The Three.js runtime object
 * @returns {THREE.BufferGeometry}
 */
export function createLowPolyHumanGeometry(THREE) {
  if (cachedHumanGeometry) {
    return cachedHumanGeometry.clone();
  }

  const parts = [];

  // Head (faceted sphere, scaled vertically)
  const head = new THREE.SphereGeometry(0.085, 8, 6);
  head.scale(0.9, 1.1, 0.95);
  head.translate(0, 0.88, 0);
  parts.push(head);

  // Neck (6-sided cylinder)
  const neck = new THREE.CylinderGeometry(0.035, 0.045, 0.06, 6);
  neck.translate(0, 0.78, 0);
  parts.push(neck);

  // Chest / upper torso (wedge-like 6-sided cylinder)
  const chest = new THREE.CylinderGeometry(0.16, 0.12, 0.22, 6);
  chest.scale(1.1, 1.0, 0.72);
  chest.translate(0, 0.66, 0);
  parts.push(chest);

  // Abdomen and pelvis (6-sided cylinder)
  const pelvis = new THREE.CylinderGeometry(0.12, 0.135, 0.16, 6);
  pelvis.scale(1.08, 1.0, 0.75);
  pelvis.translate(0, 0.49, 0);
  parts.push(pelvis);

  // Left & Right Upper Arms (rotated slightly outwards in A-pose)
  const armAngle = 0.18; // ~10.3 degrees
  const upperArmL = new THREE.CylinderGeometry(0.035, 0.03, 0.19, 6);
  upperArmL.rotateZ(armAngle);
  upperArmL.translate(-0.19, 0.63, 0);
  parts.push(upperArmL);

  const upperArmR = new THREE.CylinderGeometry(0.035, 0.03, 0.19, 6);
  upperArmR.rotateZ(-armAngle);
  upperArmR.translate(0.19, 0.63, 0);
  parts.push(upperArmR);

  // Left & Right Forearms
  const forearmL = new THREE.CylinderGeometry(0.03, 0.024, 0.17, 6);
  forearmL.rotateZ(armAngle * 0.7);
  forearmL.translate(-0.23, 0.46, 0.01);
  parts.push(forearmL);

  const forearmR = new THREE.CylinderGeometry(0.03, 0.024, 0.17, 6);
  forearmR.rotateZ(-armAngle * 0.7);
  forearmR.translate(0.23, 0.46, 0.01);
  parts.push(forearmR);

  // Left & Right Hands (stylized low-poly mittens)
  const handL = new THREE.BoxGeometry(0.036, 0.065, 0.028);
  handL.rotateZ(armAngle * 0.5);
  handL.translate(-0.25, 0.34, 0.02);
  parts.push(handL);

  const handR = new THREE.BoxGeometry(0.036, 0.065, 0.028);
  handR.rotateZ(-armAngle * 0.5);
  handR.translate(0.25, 0.34, 0.02);
  parts.push(handR);

  // Left & Right Thighs
  const thighL = new THREE.CylinderGeometry(0.055, 0.042, 0.22, 6);
  thighL.translate(-0.08, 0.33, 0);
  parts.push(thighL);

  const thighR = new THREE.CylinderGeometry(0.055, 0.042, 0.22, 6);
  thighR.translate(0.08, 0.33, 0);
  parts.push(thighR);

  // Left & Right Shins / Calves
  const shinL = new THREE.CylinderGeometry(0.042, 0.032, 0.20, 6);
  shinL.translate(-0.08, 0.13, 0);
  parts.push(shinL);

  const shinR = new THREE.CylinderGeometry(0.042, 0.032, 0.20, 6);
  shinR.translate(0.08, 0.13, 0);
  parts.push(shinR);

  // Left & Right Feet (grounded at y = 0, projecting forward in +Z)
  const footL = new THREE.BoxGeometry(0.055, 0.038, 0.11);
  footL.translate(-0.08, 0.019, 0.025);
  parts.push(footL);

  const footR = new THREE.BoxGeometry(0.055, 0.038, 0.11);
  footR.translate(0.08, 0.019, 0.025);
  parts.push(footR);

  cachedHumanGeometry = mergeGeometries(THREE, parts);
  return cachedHumanGeometry.clone();
}
