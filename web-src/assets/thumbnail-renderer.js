// One shared offscreen three.js renderer that turns a catalog model into a
// small studio-lit preview (design spec section 19). Everything is injected --
// THREE plus the loader classes the viewport already owns -- so this module
// never pulls three.js into the eager bundle and stays out of node unit tests.
//
// Contract: `render(url, format)` resolves to a data URL, or null on any
// failure (a missing file must degrade to a glyph card, never throw).

const DEFAULT_SIZE = 256;

export function createThumbnailRenderer(deps = {}) {
  const { THREE, GLTFLoader, FBXLoader, size = DEFAULT_SIZE } = deps;
  if (!THREE || !GLTFLoader) {
    return { render: async () => null, dispose() {} };
  }

  let renderer = null;
  let scene = null;
  let camera = null;

  const ensure = () => {
    if (renderer) return;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(size, size, false);
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 4);
    const fill = new THREE.HemisphereLight(0xdfe7ff, 0x20242c, 1.1);
    scene.add(key, fill);
    camera = new THREE.PerspectiveCamera(35, 1, 0.01, 500);
  };

  const frame = (object3d) => {
    const box = new THREE.Box3().setFromObject(object3d);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const extent = box.getSize(new THREE.Vector3());
    const radius = Math.max(extent.length() / 2, 1e-3);
    const distance = radius / Math.sin((camera.fov * Math.PI) / 360);
    camera.position.set(center.x + distance * 0.7, center.y + distance * 0.55, center.z + distance);
    camera.near = distance / 100;
    camera.far = distance * 10;
    camera.updateProjectionMatrix();
    camera.lookAt(center);
  };

  const loadModel = (url, format) =>
    new Promise((resolve, reject) => {
      const Loader = format === "fbx" && FBXLoader ? FBXLoader : GLTFLoader;
      new Loader().load(
        url,
        (result) => resolve(result.scene || result),
        undefined,
        (error) => reject(error),
      );
    });

  return {
    async render(url, format = "glb") {
      if (!url) return null;
      try {
        ensure();
        const model = await loadModel(url, format);
        scene.add(model);
        frame(model);
        renderer.render(scene, camera);
        const dataUrl = renderer.domElement.toDataURL("image/webp", 0.82);
        scene.remove(model);
        model.traverse?.((child) => {
          child.geometry?.dispose?.();
          const material = child.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose?.());
          else material?.dispose?.();
        });
        return dataUrl;
      } catch {
        return null;
      }
    },
    dispose() {
      renderer?.dispose?.();
      renderer = scene = camera = null;
    },
  };
}
