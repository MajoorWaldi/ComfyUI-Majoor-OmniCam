import * as THREE from "./three-runtime.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { BufferTarget, CanvasSource, Output, Quality, WebMOutputFormat, canEncodeVideo } from "mediabunny";

import { generatePointField, sampleCamera, sampleObjectTransform } from "./director/core.js";
import { createResourceMethods } from "./viewport/resources.js";
import { createSceneMethods } from "./viewport/scene.js";
import { createCameraPickingMethods } from "./viewport/camera-picking.js";
import { createRenderMethods } from "./viewport/render.js";
import { DEFAULT_QUALITY, applyQuality, createStudio, setStudioEnabled } from "./viewport/studio.js";

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
  if (mode === "wireframe" || object.material_mode === "wireframe") {
    const mat = wire.clone();
    if (object.color) mat.color = new THREE.Color(object.color);
    return mat;
  }
  if (object.material_mode === "checker") return checkerMaterial();
  const mat = neutral.clone();
  if (object.color) mat.color = new THREE.Color(object.color);
  return mat;
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
  const basePlane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: 0x161a22, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
  basePlane.frustumCulled = false;
  group.add(basePlane);
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
  const image = new THREE.Mesh(
    new THREE.PlaneGeometry(imageWidth, imageHeight),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.01,
      depthWrite: true,
    })
  );
  image.frustumCulled = false;
  image.position.z = 0.002;
  group.add(image);
  group.frustumCulled = false;
  return group;
}

export class OmniWebGLViewport {
  constructor(invalidate = () => {}, onModelLoaded = () => {}) {
    this.canvas = document.createElement("canvas");
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      // Off on purpose: three.js shadow mapping does not account for the
      // logarithmic depth encoding, so leaving this on silently produced no
      // shadows at all. A shot-layout scene spans a few units to a few hundred,
      // which the standard 24-bit depth buffer handles; the canonical near/far
      // stay exactly as authored so the viewport and the adapters still agree.
      logarithmicDepthBuffer: false,
    });
    // render() receives backing-store pixels from the host canvas, so Three.js must not apply DPR again.
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x121212);
    // Flat rig kept for the neutral proxy render; the studio group below is what
    // the editor actually looks at.
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x30343b, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(5, 8, 4); this.scene.add(key);
    this.flatLights = [this.scene.children.at(-2), key];
    this.studio = createStudio(THREE, this.renderer, DEFAULT_QUALITY);
    this.scene.add(this.studio.group);
    this.studioEnabled = true;
    setStudioEnabled(THREE, this.scene, this.renderer, this.studio, true);
    this.content = new THREE.Group(); this.scene.add(this.content);
    this.path = new THREE.Group(); this.scene.add(this.path);
    this.liveCameras = new THREE.Group(); this.scene.add(this.liveCameras);
    this.selectionGroup = new THREE.Group(); this.scene.add(this.selectionGroup);
    this.selectionKey = "";
    this.perspective = new THREE.PerspectiveCamera(35, 16 / 9, 0.01, 10000);
    this.orthographic = new THREE.OrthographicCamera(-5, 5, 2.8125, -2.8125, 0.01, 10000);
    this.sceneKey = "";
    this.mediaSignature = "";
    this.bgImageUrl = "";
    this.bgTexture = null;
    this.bgTextureCache = new Map();
    this.bgTextureLoads = new Map();
    this.bgLoadGeneration = 0;
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
      scene.traverse((child) => {
        child.userData.omnicamModelResource = true;
        child.frustumCulled = false;
        if (child.isMesh) {
          child.frustumCulled = false;
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            for (const mat of mats) {
              mat.side = THREE.DoubleSide;
            }
          }
        }
        if (child.isPoints) child.frustumCulled = false;
        if (child.isSkinnedMesh) {
          child.frustumCulled = false;
          child.computeBoundingBox?.();
          child.computeBoundingSphere?.();
        }
      });
      let meshes = 0, points = 0, bones = 0, vertices = 0;
      scene.traverse((child) => {
        if (child.isMesh) { meshes += 1; vertices += child.geometry?.getAttribute?.("position")?.count || 0; }
        if (child.isPoints) points += 1;
        if (child.isBone) bones += 1;
      });
      const content = new THREE.Group();
      content.frustumCulled = false;
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
      container.frustumCulled = false;
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
      const isLegacyFBX = error?.message?.includes("FBX version not supported") || error?.message?.includes("6100") || error?.message?.includes("6000");
      const errorMessage = isLegacyFBX
        ? "FBX Version 6.1 (Legacy) non supportée — Exportez en FBX 2014+ (7.4) ou GLB"
        : (error?.message || "Erreur de format 3D");
      this.onModelLoaded({ id, format, error: errorMessage, isLegacyFBX });
    }
  }

}
const viewportDependencies = { THREE, FBXLoader, GLTFLoader, OBJLoader, PLYLoader, STLLoader, neutral, wire, checkerMaterial, objectMaterial, applyModelMaterial, disposeObject, textureFor, cardMesh, generatePointField, sampleCamera, sampleObjectTransform };
Object.assign(
  OmniWebGLViewport.prototype,
  createResourceMethods(viewportDependencies),
  createSceneMethods(viewportDependencies),
  createCameraPickingMethods(viewportDependencies),
  createRenderMethods(viewportDependencies),
);

export async function supportsDeterministicEncoding(width, height) {
  if (!globalThis.VideoEncoder || !globalThis.VideoFrame) return null;
  for (const codec of ["vp9", "vp8"]) {
    try {
      if (await withTimeout(canEncodeVideo(codec, { width, height }), 5_000, `Checking ${codec} support`)) return codec;
    } catch (_) {
      // A codec probe is optional; try the next codec or realtime fallback.
    }
  }
  return null;
}

function withTimeout(promise, timeoutMs, operation) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${operation} timed out`)), timeoutMs); }),
  ]).finally(() => clearTimeout(timer));
}

export async function encodeDeterministicPlayblast(canvas, frameCount, fps, renderFrame, signal) {
  const codec = await supportsDeterministicEncoding(canvas.width, canvas.height);
  if (!codec) throw new Error("No supported WebCodecs WebM encoder");
  const output = new Output({ format: new WebMOutputFormat(), target: new BufferTarget() });
  const source = new CanvasSource(canvas, { codec, quality: new Quality("high"), keyFrameInterval: 1 });
  output.addVideoTrack(source, { frameRate: fps });
  await withTimeout(output.start(), 10_000, "Starting deterministic encoder");
  try {
    const duration = 1 / fps;
    for (let frame = 0; frame < frameCount; frame++) {
      if (signal?.aborted) throw new DOMException("Playblast cancelled", "AbortError");
      await renderFrame(frame);
      await withTimeout(source.add(frame * duration, duration, { keyFrame: frame % fps === 0 }), 10_000, `Encoding frame ${frame + 1}`);
    }
    await withTimeout(output.finalize(), 20_000, "Finalizing deterministic playblast");
  } catch (error) {
    if (output.state !== "finalized") await output.cancel().catch(() => {});
    throw error;
  }
  return new Blob([output.target.buffer], { type: await output.getMimeType() });
}
