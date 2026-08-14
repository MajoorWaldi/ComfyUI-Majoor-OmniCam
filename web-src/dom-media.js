// DOM media decoding, managed uploads and upstream reference restoration.
// The ComfyUI api object is injected via configureDomMedia so this module
// stays bundle-local (no cross-root imports that break Vite rebasing).

import { annotatedAssetUrl, clamp } from "./omnicam-core.js";
import { uploadManagedFile } from "./omnicam-media.js";
import { t } from "./omnicam-i18n.js";

let comfyApi = null;

export function configureDomMedia({ api }) {
  comfyApi = api;
}

export async function loadMediaUrl(ui, object, url) {
  if (!object || !url) return;
  const path = String(object.asset || url).toLowerCase();
  if (/\.(mp4|webm|mov)(?:\s|$)/.test(path)) {
    const video = document.createElement("video");
    video.src = url;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    await new Promise((resolve) => {
      video.addEventListener("loadeddata", resolve, { once: true });
      video.addEventListener("error", resolve, { once: true });
    });
    ui.cardMediaById.set(object.id, video);
    if (object.id === "subject") ui.cardMedia = video;
  } else {
    const image = new Image();
    image.src = url;
    await image.decode().catch(() => {});
    ui.cardMediaById.set(object.id, image);
    if (object.id === "subject") ui.cardMedia = image;
  }
  ui.render();
}

export function restoreAssets(ui) {
  for (const object of ui.state.objects) {
    if (!object.asset) continue;
    const url = annotatedAssetUrl(object.asset);
    if (object.type === "glb" || object.type === "model") ui.modelUrlsById.set(object.id, url);
    else if (object.type === "card" && !ui.cardMediaById.has(object.id)) ui.loadMediaUrl(object, url);
  }
}

export function onModelLoaded(ui, model) {
  ui.modelInfoById.set(model.id, model);
  const object = ui.state.objects.find((item) => item.id === model.id);
  if (object?.animation_index) ui.webgl?.selectAnimation(model.id, object.animation_index);
  if (model.id === ui.selectedObjectId) ui.refreshInspector();
  if (!model.meshes && !model.points && model.bones) ui.setStatus(t(`${model.format.toUpperCase()} animation only: ${model.bones} bones, no mesh · skeleton preview`));
  else ui.setStatus(t(`${model.format.toUpperCase()} loaded: ${model.meshes} mesh${model.meshes === 1 ? "" : "es"}, ${model.vertices} vertices`));
}

export async function loadModelFile(ui, file) {
  if (!file) return;
  const format = file.name.split(".").pop()?.toLowerCase();
  if (!["glb", "obj", "fbx", "stl", "ply"].includes(format)) return ui.setStatus(t("Supported scenes: GLB, OBJ, FBX, STL, PLY. Convert ABC first."));
  const id = `model_${Date.now().toString(36)}`;
  const object = {
    id,
    type: "model",
    format,
    name: file.name.replace(/\.[^.]+$/i, ""),
    position: [0, 0, -2],
    rotation: [0, 0, 0],
    size: [1, 1, 1],
    material_mode: "textured",
    keyframes: [],
    enabled: true,
    asset: "",
  };
  ui.state.objects.push(object);
  ui.selectedEntity = "object";
  ui.selectedObjectId = id;
  ui.selectedKeyFrame = null;
  const url = ui.objectUrls.replace(id, file);
  ui.modelUrlsById.set(id, url);
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t(`Uploading ${format.toUpperCase()}...`));
  try {
    const data = await uploadManagedFile(comfyApi, { route: "/majoor/omnicam/upload_model", field: "asset", file });
    object.asset = data.path;
    ui.serialize();
    const modelInfo = ui.modelInfoById.get(id);
    if (modelInfo) ui.onModelLoaded(modelInfo);
    else ui.setStatus(t(`${format.toUpperCase()}: ${data.name}`));
  } catch (error) {
    console.error(error);
    ui.setStatus(t(`${format.toUpperCase()} loaded locally; backend upload failed`));
  }
}

export async function loadCardFile(ui, file) {
  if (!file) return;
  const object = ui.selectedObject()?.type === "card" ? ui.selectedObject() : ui.state.objects.find((item) => item.id === "subject");
  ui.cardUrl = ui.objectUrls.replace(object.id, file);
  if (file.type.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = ui.cardUrl;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    await video.play().catch(() => {});
    ui.cardMediaById.set(object.id, video);
    if (object.id === "subject") ui.cardMedia = video;
  } else {
    const image = new Image();
    image.src = ui.cardUrl;
    await image.decode().catch(() => {});
    ui.cardMediaById.set(object.id, image);
    if (object.id === "subject") ui.cardMedia = image;
  }
  ui.render();
  ui.setStatus(t("Uploading card…"));
  try {
    const data = await uploadManagedFile(comfyApi, { route: "/majoor/omnicam/upload_asset", field: "asset", file });
    object.asset = data.path;
    if (object.id === "subject") {
      ui.state.card_asset = data.path;
      if (ui.cardWidget) ui.cardWidget.value = data.path;
    }
    ui.serialize();
    ui.setStatus(t(`Card: ${data.name}`));
  } catch (error) {
    console.error(error);
    ui.setStatus(t("Card loaded locally; backend upload failed"));
  }
}

export function loadExecutionPreview(ui, message) {
  ui.executionReferences = Array.isArray(message?.images) ? message.images : [];
  const select = ui.root.querySelector('[data-role="reference-select"]');
  select.innerHTML = "";
  ui.executionReferences.forEach((result, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = result.filename || t(`Upstream ${index + 1}`);
    select.appendChild(option);
  });
  if (!ui.executionReferences.length) {
    const option = document.createElement("option");
    option.value = "0";
    option.textContent = t("No upstream reference");
    select.appendChild(option);
    return;
  }
  ui.state.reference_index = clamp(ui.state.reference_index || 0, 0, ui.executionReferences.length - 1);
  select.value = String(ui.state.reference_index);
  ui.serialize();
  ui.loadSelectedReference();
}

export function loadSelectedReference(ui) {
  const result = ui.executionReferences[ui.state.reference_index];
  if (!result) return;
  const image = new Image();
  image.onload = () => {
    ui.cardMedia = image;
    ui.cardMediaById.set("subject", image);
    ui.render();
    ui.setStatus(t("Upstream media refreshed"));
  };
  image.src = comfyApi.apiURL(`/view?${new URLSearchParams(result).toString()}`);
}
