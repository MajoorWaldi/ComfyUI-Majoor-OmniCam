import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { BufferTarget, CanvasSource, Output, Quality, WebMOutputFormat, canEncodeVideo } from "mediabunny";

const neutral = new THREE.MeshStandardMaterial({ color: 0x8c929b, roughness: 0.9, metalness: 0 });
const wire = new THREE.MeshBasicMaterial({ color: 0xaeb5c0, wireframe: true });

function checkerMaterial() {
  const data = new Uint8Array([
    38, 42, 48, 255, 190, 195, 202, 255,
    190, 195, 202, 255, 38, 42, 48, 255,
  ]);
  const texture = new THREE.DataTexture(data, 2, 2, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(8, 8); texture.colorSpace = THREE.SRGBColorSpace; texture.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, metalness: 0 });
}

function objectMaterial(object, mode) {
  if (mode === "wireframe" || object.material_mode === "wireframe") return wire.clone();
  if (object.material_mode === "checker") return checkerMaterial();
  return neutral.clone();
}

function applyModelMaterial(root, mode) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    if (!child.userData.omnicamOriginalMaterial) child.userData.omnicamOriginalMaterial = child.material;
    if (child.userData.omnicamOverrideMaterial) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) { material?.map?.dispose?.(); material?.dispose?.(); }
      child.userData.omnicamOverrideMaterial = false;
    }
    if (mode === "textured") child.material = child.userData.omnicamOriginalMaterial;
    else { child.material = mode === "checker" ? checkerMaterial() : mode === "wireframe" ? wire.clone() : neutral.clone(); child.userData.omnicamOverrideMaterial = true; }
  });
}

function disposeObject(object, includeModels = false) {
  object.traverse((child) => {
    if (child.userData.omnicamModelResource && !includeModels) return;
    child.geometry?.dispose?.();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      material?.map?.dispose?.();
      material?.dispose?.();
    }
  });
}

function textureFor(media) {
  if (!media) return null;
  const texture = media instanceof HTMLVideoElement ? new THREE.VideoTexture(media) : new THREE.Texture(media);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function cardMesh(object, media, fit) {
  const [width, height] = object.size || [2, 3];
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: 0x161a22, side: THREE.DoubleSide })));
  const texture = textureFor(media);
  if (!texture) return group;

  const sourceWidth = media.videoWidth || media.naturalWidth || media.width || width;
  const sourceHeight = media.videoHeight || media.naturalHeight || media.height || height;
  const sourceAspect = sourceWidth / Math.max(1, sourceHeight);
  const cardAspect = width / Math.max(0.01, height);
  let imageWidth = width;
  let imageHeight = height;
  if (fit === "contain") {
    if (sourceAspect > cardAspect) imageHeight = width / sourceAspect;
    else imageWidth = height * sourceAspect;
  } else if (fit === "cover") {
    if (sourceAspect > cardAspect) {
      texture.repeat.x = cardAspect / sourceAspect;
      texture.offset.x = (1 - texture.repeat.x) * 0.5;
    } else {
      texture.repeat.y = sourceAspect / cardAspect;
      texture.offset.y = (1 - texture.repeat.y) * 0.5;
    }
  }
  const image = new THREE.Mesh(new THREE.PlaneGeometry(imageWidth, imageHeight), new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture, side: THREE.DoubleSide }));
  image.position.z = 0.002;
  group.add(image);
  return group;
}

export class OmniWebGLViewport {
  constructor(invalidate = () => {}, onModelLoaded = () => {}) {
    this.canvas = document.createElement("canvas");
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x121212);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x30343b, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(5, 8, 4); this.scene.add(key);
    this.content = new THREE.Group(); this.scene.add(this.content);
    this.path = new THREE.Group(); this.scene.add(this.path);
    this.perspective = new THREE.PerspectiveCamera(35, 16 / 9, 0.01, 10000);
    this.orthographic = new THREE.OrthographicCamera(-5, 5, 2.8125, -2.8125, 0.01, 10000);
    this.sceneKey = "";
    this.mediaSignature = "";
    this.disposed = false;
    this.invalidate = invalidate;
    this.onModelLoaded = onModelLoaded;
    this.modelUrls = new Map();
    this.models = new Map();
    this.modelLoads = new Map();
    this.objectNodes = new Map();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.activeCamera = this.perspective;
  }

  async loadModel(id, url, format = "glb") {
    const signature = `${format}:${url}`;
    if (!url || this.modelLoads.get(id) === signature) return;
    this.modelLoads.set(id, signature);
    try {
      let scene;
      let animations = [];
      if (format === "obj") scene = await new OBJLoader().loadAsync(url);
      else if (format === "fbx") {
        scene = await new FBXLoader().loadAsync(url);
        animations = scene.animations || [];
      }
      else if (format === "stl") scene = new THREE.Mesh(await new STLLoader().loadAsync(url), neutral.clone());
      else if (format === "ply") {
        const geometry = await new PLYLoader().loadAsync(url);
        if (geometry.index) {
          if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
          scene = new THREE.Mesh(geometry, neutral.clone());
        } else scene = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xaeb5c0, size: 0.025 }));
      } else {
        const gltf = await new GLTFLoader().loadAsync(url);
        scene = gltf.scene;
        animations = gltf.animations || [];
      }
      if (this.disposed || this.modelLoads.get(id) !== signature) {
        disposeObject(scene, true);
        return;
      }
      const previous = this.models.get(id);
      if (previous) disposeObject(previous.scene, true);
      scene.traverse((child) => { child.userData.omnicamModelResource = true; });
      let meshes = 0, points = 0, bones = 0, vertices = 0;
      scene.traverse((child) => {
        if (child.isMesh) { meshes += 1; vertices += child.geometry?.getAttribute?.("position")?.count || 0; }
        if (child.isPoints) points += 1;
        if (child.isBone) bones += 1;
      });
      const content = new THREE.Group();
      content.add(scene);
      if (!meshes && !points && bones) {
        const helper = new THREE.SkeletonHelper(scene);
        helper.material.depthTest = false;
        helper.material.opacity = 0.9;
        helper.material.transparent = true;
        helper.renderOrder = 10;
        helper.userData.omnicamModelResource = true;
        content.add(helper);
      }
      content.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(content);
      const boundsSize = bounds.getSize(new THREE.Vector3());
      const maximumDimension = Math.max(boundsSize.x, boundsSize.y, boundsSize.z);
      const normalizationScale = Number.isFinite(maximumDimension) && maximumDimension > 1e-6 ? 2.5 / maximumDimension : 1;
      const boundsCenter = bounds.getCenter(new THREE.Vector3());
      content.scale.setScalar(normalizationScale);
      content.position.set(-boundsCenter.x * normalizationScale, -bounds.min.y * normalizationScale, -boundsCenter.z * normalizationScale);
      const container = new THREE.Group();
      container.add(content);
      const mixer = animations.length ? new THREE.AnimationMixer(scene) : null;
      if (mixer) mixer.clipAction(animations[0]).play();
      const model = { url, format, scene: container, mixer, clips: animations, selectedClip: 0, duration: animations[0]?.duration || 0, meshes, points, bones, vertices, animations: animations.length, normalizationScale };
      this.models.set(id, model);
      this.onModelLoaded({ id, format, meshes, points, bones, vertices, animations: animations.length, animationNames: animations.map((clip, index) => clip.name || `Clip ${index + 1}`), duration: model.duration, normalizationScale });
      this.sceneKey = "";
      this.invalidate();
    } catch (error) {
      if (this.modelLoads.get(id) === signature) this.modelLoads.delete(id);
      console.warn(`OmniCam could not load ${format.toUpperCase()} ${id}`, error);
    }
  }

  removeModel(id) {
    const model = this.models.get(id);
    if (model) disposeObject(model.scene, true);
    this.models.delete(id); this.modelLoads.delete(id); this.sceneKey = "";
  }

  selectAnimation(id, index) {
    const model = this.models.get(id);
    if (!model?.mixer || !model.clips.length) return;
    model.selectedClip = Math.max(0, Math.min(model.clips.length - 1, Number(index) || 0));
    model.duration = model.clips[model.selectedClip].duration || 0;
    model.mixer.stopAllAction();
    model.mixer.clipAction(model.clips[model.selectedClip]).play();
    this.invalidate();
  }

  rebuild(state, mediaById, modelUrlsById) {
    disposeObject(this.content); this.content.clear();
    this.objectNodes.clear();
    const mode = state.render_mode;
    const grid = new THREE.GridHelper(120, 120, 0x777777, 0x3b3b3b);
    grid.userData.omnicamCaptureGuide = true;
    this.content.add(grid);
    if (["omni_ref", "point_field"].includes(mode)) {
      const points = [];
      for (let index = 0; index < 160; index++) {
        const angle = index * 2.3999632297, radius = 1.5 + (index % 13) * 0.38;
        points.push(Math.cos(angle) * radius, 0.15 + ((index * 0.618) % 1) * 4, Math.sin(angle) * radius);
      }
      const pointGeometry = new THREE.BufferGeometry(); pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
      this.content.add(new THREE.Points(pointGeometry, new THREE.PointsMaterial({ color: 0x9ca8ba, size: 0.055, sizeAttenuation: true })));
    }
    if (["grid", "point_field"].includes(mode)) return;
    for (const object of state.objects) {
      if (object.enabled === false) continue;
      const size = object.size || [1, 1, 1]; let mesh;
      if (object.type === "glb" || object.type === "model") {
        const url = modelUrlsById.get(object.id);
        const model = this.models.get(object.id);
        const format = object.format || (object.type === "glb" ? "glb" : "");
        if (url && (model?.url !== url || model?.format !== format)) this.loadModel(object.id, url, format);
        if (model?.url === url) { mesh = model.scene; applyModelMaterial(mesh, object.material_mode || "textured"); }
        else mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2] || 1), wire.clone());
      } else if (object.type === "sphere") mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), objectMaterial(object, mode));
      else if (object.type === "ground") mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), objectMaterial(object, mode));
      else if (object.type === "card") {
        mesh = object.material_mode && object.material_mode !== "textured" ? new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), objectMaterial(object, mode)) : cardMesh(object, mediaById.get(object.id), state.card_fit || "contain");
      } else if (object.type === "null") {
        const axes = new THREE.AxesHelper(0.5); axes.position.fromArray(object.position || [0, 0, 0]); axes.userData.omnicamId = object.id; this.objectNodes.set(object.id, axes); this.content.add(axes); continue;
      } else {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), objectMaterial(object, mode));
      }
      mesh.position.fromArray(object.position || [0, 0, 0]);
      mesh.rotation.set(...(object.rotation || [0, 0, 0]).map(THREE.MathUtils.degToRad));
      if (object.type !== "card") mesh.scale.fromArray(size);
      mesh.userData.omnicamId = object.id; this.objectNodes.set(object.id, mesh); this.content.add(mesh);
    }
  }

  rebuildPath(state) {
    disposeObject(this.path); this.path.clear();
    if (state.keyframes.length < 2) return;
    const curve = new THREE.CatmullRomCurve3(state.keyframes.map((key) => new THREE.Vector3().fromArray(key.camera.position)));
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(Math.max(24, state.keyframes.length * 16)));
    this.path.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x7694d1 })));
    for (const key of state.keyframes) {
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: 0xf2d06b }));
      marker.position.fromArray(key.camera.position); this.path.add(marker);
      const position = new THREE.Vector3().fromArray(key.camera.position);
      const target = new THREE.Vector3().fromArray(key.camera.target || [0, 0, 0]);
      const forward = target.clone().sub(position).normalize();
      let right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
      if (right.lengthSq() < 1e-8) right.set(1, 0, 0); else right.normalize();
      const up = new THREE.Vector3().crossVectors(right, forward).normalize();
      const distance = THREE.MathUtils.clamp(position.distanceTo(target) * 0.08, 0.25, 0.8);
      const halfHeight = key.camera.camera_type === "orthographic" ? distance * 0.55 : distance * Math.tan(THREE.MathUtils.degToRad(key.camera.fov || 35) * 0.5);
      const halfWidth = halfHeight * (state.width || 16) / Math.max(1, state.height || 9);
      const center = position.clone().addScaledVector(forward, distance);
      const corners = [
        center.clone().addScaledVector(right, -halfWidth).addScaledVector(up, -halfHeight),
        center.clone().addScaledVector(right, halfWidth).addScaledVector(up, -halfHeight),
        center.clone().addScaledVector(right, halfWidth).addScaledVector(up, halfHeight),
        center.clone().addScaledVector(right, -halfWidth).addScaledVector(up, halfHeight),
      ];
      const segments = [];
      for (const corner of corners) segments.push(position, corner);
      for (let index = 0; index < 4; index++) segments.push(corners[index], corners[(index + 1) % 4]);
      const frustum = new THREE.BufferGeometry().setFromPoints(segments);
      this.path.add(new THREE.LineSegments(frustum, new THREE.LineBasicMaterial({ color: 0x4d638f })));
    }
  }

  configureCamera(cameraState, aspect) {
    let camera;
    if (cameraState.camera_type === "orthographic") {
      camera = this.orthographic; const halfHeight = 5 / Math.max(0.01, cameraState.zoom || 1); camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect; camera.top = halfHeight; camera.bottom = -halfHeight; camera.near = cameraState.near; camera.far = cameraState.far; camera.updateProjectionMatrix();
    } else {
      camera = this.perspective; camera.fov = cameraState.fov; camera.aspect = aspect; camera.near = cameraState.near; camera.far = cameraState.far; camera.updateProjectionMatrix();
    }
    camera.position.fromArray(cameraState.position); camera.up.fromArray(cameraState.up || [0, 1, 0]); camera.lookAt(new THREE.Vector3().fromArray(cameraState.target)); camera.rotateZ(-THREE.MathUtils.degToRad(cameraState.roll || 0));
    return camera;
  }

  pick(x, y, width, height) {
    if (!this.activeCamera) return null;
    this.pointer.set(x / Math.max(1, width) * 2 - 1, 1 - y / Math.max(1, height) * 2);
    this.raycaster.setFromCamera(this.pointer, this.activeCamera);
    for (const hit of this.raycaster.intersectObjects(this.content.children, true)) {
      let object = hit.object;
      while (object && !object.userData.omnicamId) object = object.parent;
      if (object?.userData.omnicamId) return object.userData.omnicamId;
    }
    return null;
  }

  render(state, cameraState, mediaById, width, height, modelUrlsById = new Map(), frame = 0, cleanCapture = false) {
    if (this.disposed) return;
    if (this.canvas.width !== width || this.canvas.height !== height) this.renderer.setSize(width, height, false);
    const sceneKey = JSON.stringify([state.render_mode, state.card_fit, state.objects.map((object) => { const { position, rotation, keyframes, size, ...shape } = object; if (object.type === "card") shape.size = size; return shape; })]);
    const mediaSignature = [...mediaById.entries()].map(([id, media]) => `${id}:${media?.src || ""}`).join("|");
    const modelSignature = [...modelUrlsById.entries()].map(([id, url]) => `${id}:${url}`).join("|");
    if (sceneKey !== this.sceneKey || mediaSignature !== this.mediaSignature || modelSignature !== this.modelSignature) {
      this.sceneKey = sceneKey; this.mediaSignature = mediaSignature; this.modelSignature = modelSignature; this.rebuild(state, mediaById, modelUrlsById);
    }
    for (const model of this.models.values()) {
      if (model.mixer && model.duration > 0) model.mixer.setTime((frame / Math.max(1, state.fps || 24)) % model.duration);
    }
    for (const object of state.objects) {
      const node = this.objectNodes.get(object.id); if (!node) continue;
      node.position.fromArray(object.position || [0, 0, 0]); node.rotation.set(...(object.rotation || [0, 0, 0]).map(THREE.MathUtils.degToRad));
      if (object.type !== "card" && object.type !== "null") node.scale.fromArray(object.size || [1, 1, 1]);
    }
    this.path.visible = !cleanCapture;
    const editorGrid = ["omni_ref", "card_grid", "graybox", "grid", "wireframe"].includes(state.render_mode);
    this.content.traverse((object) => { if (object.userData.omnicamCaptureGuide) object.visible = cleanCapture ? Boolean(state.playblast_grid) : editorGrid; });
    const pathKey = JSON.stringify(state.keyframes); if (pathKey !== this.pathKey) { this.pathKey = pathKey; this.rebuildPath(state); }
    this.content.visible = true;
    const aspect = width / Math.max(1, height), drawing = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const camera = this.configureCamera(cameraState, aspect); this.activeCamera = camera;
    this.renderer.setScissorTest(false); this.renderer.setViewport(0, 0, drawing.x, drawing.y); this.renderer.render(this.scene, camera);
  }

  dispose() {
    if (this.disposed) return; this.disposed = true;
    disposeObject(this.content); disposeObject(this.path);
    for (const model of this.models.values()) disposeObject(model.scene, true);
    this.models.clear(); this.modelLoads.clear();
    this.renderer.dispose(); this.renderer.forceContextLoss(); this.canvas.width = 1; this.canvas.height = 1;
  }
}

export async function supportsDeterministicEncoding(width, height) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const codec of ["vp9", "vp8"]) if (await canEncodeVideo(codec, { width, height })) return codec;
  return null;
}

export async function encodeDeterministicPlayblast(canvas, frameCount, fps, renderFrame) {
  const codec = await supportsDeterministicEncoding(canvas.width, canvas.height);
  if (!codec) throw new Error("No supported WebCodecs WebM encoder");
  const output = new Output({ format: new WebMOutputFormat(), target: new BufferTarget() });
  const source = new CanvasSource(canvas, { codec, quality: new Quality("high"), keyFrameInterval: 1 });
  output.addVideoTrack(source, { frameRate: fps });
  await output.start();
  try {
    const duration = 1 / fps;
    for (let frame = 0; frame < frameCount; frame++) {
      await renderFrame(frame);
      await source.add(frame * duration, duration, { keyFrame: frame % fps === 0 });
    }
    await output.finalize();
  } catch (error) {
    if (output.state !== "finalized") await output.cancel().catch(() => {});
    throw error;
  }
  return new Blob([output.target.buffer], { type: await output.getMimeType() });
}
