// A tiny cache of the Director's *fixed* controls -- the ones that exist for
// the whole life of the node and are written on every frame. setFrame() used
// to re-run ten querySelectorAll() sweeps per scrubbed frame just to find them.
//
// Dynamic lists (outliner rows, keyframe buttons, camera preview tiles) are
// deliberately NOT cached: their invalidation is explicit and a stale entry
// there would be a bug, not a micro-optimisation.

function all(root, role) {
  return [...root.querySelectorAll(`[data-role="${role}"]`)];
}

export function buildDirectorDomCache(root) {
  return {
    status: root.querySelector('[data-role="status"]'),
    time: root.querySelector('[data-role="time"]'),
    frames: all(root, "frame"),
    scrubs: all(root, "scrub"),
    cameraFov: all(root, "camera-fov"),
    cameraRoll: all(root, "camera-roll"),
    cameraFocal: all(root, "camera-focal"),
    viewportZoom: all(root, "viewport-zoom"),
    cameraType: all(root, "camera-type"),
    cameraNear: all(root, "camera-near"),
    cameraFar: all(root, "camera-far"),
  };
}
