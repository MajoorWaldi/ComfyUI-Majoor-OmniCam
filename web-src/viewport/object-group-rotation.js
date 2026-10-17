// Group rotation must compose orientations, not add Euler components.
// Keep this helper free of WebGL dependencies: modal controls load eagerly.
import { add, sub, quaternionFromEuler, multiplyQuaternions, rotateQuaternion, eulerFromQuaternion } from "../director/core.js";

export function rotateObjectInGroup(transform, pivot, rotationDeg) {
  const delta = quaternionFromEuler(rotationDeg);
  const orientation = multiplyQuaternions(delta, quaternionFromEuler(transform.rotation));
  return {
    position: add(pivot, rotateQuaternion(sub(transform.position, pivot), delta)),
    rotation: eulerFromQuaternion(orientation),
  };
}
