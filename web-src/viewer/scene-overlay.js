// A read-only overlay of a reconstructed MotionScene for the Extractor's 3D
// viewer. Same rules as the rest of `viewer/`: look-only, no gizmos, no
// mutation. It draws the deterministic blockout -- primitives + room slabs +
// retrieved GLB props + the source-camera frustum -- so a reconstruction can be
// eyeballed without opening the Director.

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import {
  Box3,
  BoxGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Vector3,
} from "../three-runtime.js";
import { disposeObject } from "./track-grid.js";
import { frustumLines } from "./track-frustums.js";

const DEG = Math.PI / 180;

// Per reconstruction role -- kept in step with the Director adoption defaults.
const ROLE_COLOR = {
  room: 0x5b6472,
  blockout_object: 0x8b7bd8,
  asset_proxy: 0x46a758,
  reference: 0x3a3f4a,
};
const DEFAULT_COLOR = 0x8b7bd8;

function primitiveGeometry(type, size) {
  const [w, h, d] = size.map((v) => Math.max(0.01, Math.abs(Number(v) || 0.01)));
  if (type === "sphere") return new SphereGeometry(Math.max(w, h, d) / 2, 16, 12);
  if (type === "human") return new CylinderGeometry(Math.max(w, d) / 2, Math.max(w, d) / 2, h, 12);
  // cube / ground / null / anything else -> a box of its bounding size.
  return new BoxGeometry(w, h, d);
}

export class SceneOverlay {
  constructor() {
    this.group = new Group();
    this.props = new Group(); // async GLB loads land here
    this.group.add(this.props);
    this._loader = null;
    this._loadToken = 0;
    this._box = new Box3();
  }

  loader() {
    this._loader ||= new GLTFLoader();
    return this._loader;
  }

  clear() {
    this._loadToken += 1; // abandon any in-flight GLB loads
    for (const child of [...this.group.children]) {
      if (child === this.props) continue;
      this.group.remove(child);
      disposeObject(child);
    }
    for (const child of [...this.props.children]) {
      this.props.remove(child);
      disposeObject(child);
    }
  }

  /**
   * @param motionScene the reconstruction result (MotionScene v1 dict).
   * @param resolveAssetUrl maps an annotated asset ref to a loadable URL.
   */
  setScene(motionScene, { resolveAssetUrl = (v) => v, onPropLoaded = () => {} } = {}) {
    this.clear();
    const objects = Array.isArray(motionScene?.objects) ? motionScene.objects : [];
    const token = this._loadToken;

    for (const object of objects) {
      if (!object || object.enabled === false || object.type === "null") continue;
      const role = object?.reconstruction?.role || "";
      const color = ROLE_COLOR[role] ?? DEFAULT_COLOR;
      const position = (object.position || [0, 0, 0]).map(Number);
      const rotation = (object.rotation || [0, 0, 0]).map(Number);
      const size = object.size || [1, 1, 1];

      if ((object.type === "glb" || object.type === "model") && object.asset) {
        this._loadProp(object, resolveAssetUrl(object.asset), token, onPropLoaded);
        continue;
      }

      const mesh = new Mesh(
        primitiveGeometry(object.type, size),
        new MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.9 }),
      );
      mesh.position.set(position[0], position[1], position[2]);
      mesh.rotation.set(rotation[0] * DEG, rotation[1] * DEG, rotation[2] * DEG);
      // A faint solid backing so a box reads as a volume, not just edges.
      const fill = new Mesh(
        mesh.geometry,
        new MeshBasicMaterial({ color, transparent: true, opacity: 0.06, side: DoubleSide, depthWrite: false }),
      );
      fill.position.copy(mesh.position);
      fill.rotation.copy(mesh.rotation);
      this.group.add(mesh, fill);
    }

    // Source camera frustum, from the first camera's first keyframe.
    const cam = motionScene?.cameras?.[0]?.track?.keyframes?.[0]?.camera
      || motionScene?.cameras?.[0]?.camera;
    if (cam?.position && cam?.target) {
      const aspect = Math.max(0.05, Number(motionScene?.canvas?.width || 16) / Math.max(1, Number(motionScene?.canvas?.height || 9)));
      const span = this.bounds().extent || 4;
      const lines = frustumLines(
        { position: cam.position.map(Number), target: cam.target.map(Number), fov: Number(cam.fov) || 50, roll: Number(cam.roll) || 0 },
        { color: 0xe5c07b, opacity: 0.7, scale: Math.max(0.1, span * 0.15), aspect },
      );
      this.group.add(lines);
    }
  }

  _loadProp(object, url, token, onLoaded = () => {}) {
    if (!url) return;
    const position = (object.position || [0, 0, 0]).map(Number);
    const rotation = (object.rotation || [0, 0, 0]).map(Number);
    const size = (object.size || [1, 1, 1]).map((v) => Math.max(1e-3, Number(v) || 1e-3));
    this.loader().load(
      url,
      (gltf) => {
        if (token !== this._loadToken) return; // superseded
        const node = gltf.scene || gltf.scenes?.[0];
        if (!node) return;
        node.position.set(position[0], position[1], position[2]);
        node.rotation.set(rotation[0] * DEG, rotation[1] * DEG, rotation[2] * DEG);
        node.scale.set(size[0], size[1], size[2]);
        this.props.add(node);
        onLoaded();
      },
      undefined,
      () => {}, // a missing prop is not fatal -- the box stays
    );
  }

  bounds() {
    this._box.makeEmpty();
    this._box.setFromObject(this.group);
    if (this._box.isEmpty()) return { centre: [0, 0, 0], extent: 0 };
    const centre = this._box.getCenter(new Vector3());
    const sizeVec = this._box.getSize(new Vector3());
    return {
      centre: [centre.x, centre.y, centre.z],
      extent: Math.max(1e-3, Math.hypot(sizeVec.x, sizeVec.y, sizeVec.z)),
    };
  }

  get hasContent() {
    return this.group.children.some((c) => c !== this.props) || this.props.children.length > 0;
  }

  dispose() {
    this.clear();
    disposeObject(this.group);
  }
}
