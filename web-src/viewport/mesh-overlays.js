// Wireframe and vertex overlays for scene meshes.
//
// A skinned model deforms on the GPU, so a LineSegments/Points copy of its
// geometry stays frozen in the bind pose ("T-pose at the origin") while the
// animation plays. These builders return overlays that follow the animation:
//   - wireframe: a SkinnedMesh bound to the same skeleton, so the vertex shader
//     skins it exactly like the model it traces;
//   - vertices: the points shader has no skinning stage, so the positions are
//     re-skinned on the CPU each frame from SkinnedMesh.getVertexPosition().

const HELPER_COLOR = 0x38bdf8;

// Ceiling on CPU-skinned points per mesh. Above it the overlay samples every
// Nth vertex instead: a moving subset reads as the animated mesh, where the
// full set would cost a per-frame walk over hundreds of thousands of vertices.
export const SKINNED_POINT_BUDGET = 12000;

function isSkinned(mesh) {
  return Boolean(mesh.isSkinnedMesh && mesh.skeleton);
}

/** Copy `source`'s local transform so an overlay added to its parent lines up. */
function matchTransform(overlay, source) {
  overlay.position.copy(source.position);
  overlay.quaternion.copy(source.quaternion);
  overlay.scale.copy(source.scale);
}

function tagOverlay(overlay) {
  overlay.frustumCulled = false;
  // Helpers must never win a pick over the mesh they are drawn on top of.
  overlay.raycast = () => {};
  overlay.userData.omnicamHelper = true;
  return overlay;
}

/**
 * Wireframe overlay for one mesh. Returns `{ overlay, parent }`: skinned
 * overlays must be siblings of the mesh (a SkinnedMesh child would inherit the
 * mesh transform twice), plain ones stay children as before.
 */
export function wireframeOverlay(THREE, mesh) {
  if (isSkinned(mesh)) {
    // The geometry is cloned because rebuild() disposes helpers outright, and a
    // shared clone would take the model's buffers down with it.
    const overlay = new THREE.SkinnedMesh(mesh.geometry.clone(), new THREE.MeshBasicMaterial({
      color: HELPER_COLOR,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }));
    overlay.bindMode = mesh.bindMode;
    overlay.bind(mesh.skeleton, mesh.bindMatrix);
    matchTransform(overlay, mesh);
    return { overlay: tagOverlay(overlay), parent: mesh.parent || mesh };
  }
  const overlay = new THREE.LineSegments(
    new THREE.WireframeGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: HELPER_COLOR, opacity: 0.45, transparent: true }),
  );
  return { overlay: tagOverlay(overlay), parent: mesh };
}

/** Vertex-point overlay for one mesh, following the skinned pose when there is one. */
export function vertexOverlay(THREE, mesh) {
  const material = new THREE.PointsMaterial({ color: HELPER_COLOR, size: 0.05, sizeAttenuation: true });
  if (!isSkinned(mesh)) {
    const overlay = new THREE.Points(mesh.geometry, material);
    return { overlay: tagOverlay(overlay), parent: mesh };
  }

  const total = mesh.geometry.getAttribute("position")?.count || 0;
  const stride = Math.max(1, Math.ceil(total / SKINNED_POINT_BUDGET));
  const count = Math.ceil(total / stride);
  const positions = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const overlay = new THREE.Points(geometry, material);
  matchTransform(overlay, mesh);

  // getVertexPosition() returns the skinned position in the mesh's own local
  // space, which is where this overlay lives too, so the values go straight in.
  const vertex = new THREE.Vector3();
  const attribute = geometry.getAttribute("position");
  overlay.onBeforeRender = () => {
    for (let index = 0; index < count; index++) {
      mesh.getVertexPosition(index * stride, vertex);
      attribute.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
    attribute.needsUpdate = true;
  };
  return { overlay: tagOverlay(overlay), parent: mesh.parent || mesh };
}

/**
 * A copy of `mesh` pinned to its world matrix, for a group that lives in world
 * space (the selection group). Skinned meshes come back bound to the source
 * skeleton so the highlight deforms with the animation instead of ghosting the
 * bind pose next to the moving model.
 */
export function worldOverlay(THREE, mesh, material) {
  const overlay = isSkinned(mesh)
    ? new THREE.SkinnedMesh(mesh.geometry.clone(), material)
    : new THREE.Mesh(mesh.geometry.clone(), material);
  if (isSkinned(mesh)) {
    overlay.bindMode = mesh.bindMode;
    overlay.bind(mesh.skeleton, mesh.bindMatrix);
  }
  // Same world matrix as the source, so the shared skeleton resolves identically.
  overlay.matrixAutoUpdate = false;
  overlay.matrix.copy(mesh.matrixWorld);
  overlay.frustumCulled = false;
  return overlay;
}

/**
 * Attach the requested overlays to every mesh under `root`.
 *
 * The meshes are collected before anything is added: a skinned overlay is a
 * mesh in its own right, so building them during the traversal would have
 * traverse() walk into overlays and build overlays for those in turn.
 */
export function attachMeshOverlays(THREE, root, { wireframe = false, vertices = false } = {}) {
  if (!wireframe && !vertices) return;
  const meshes = [];
  root.traverse((child) => {
    if (child.isMesh && child.geometry && !child.userData.omnicamHelper) meshes.push(child);
  });
  for (const mesh of meshes) {
    if (wireframe) {
      const { overlay, parent } = wireframeOverlay(THREE, mesh);
      parent.add(overlay);
    }
    if (vertices) {
      const { overlay, parent } = vertexOverlay(THREE, mesh);
      parent.add(overlay);
    }
  }
}
