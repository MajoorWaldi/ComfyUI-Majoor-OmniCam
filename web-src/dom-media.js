// DOM media decoding, managed uploads and upstream reference restoration.
// The ComfyUI api object is injected via configureDomMedia so this module
// stays bundle-local (no cross-root imports that break Vite rebasing).

import { annotatedAssetUrl, clamp } from "./director/core.js";
import { syncExtractorCameraTrack } from "./extractor/director-link.js";
import { uploadManagedFile } from "./omnicam-media.js";
import { t } from "./i18n.js";
import { upstreamPreviewMedia } from "./shared/upstream-preview.js";
import { linkedOrigin } from "./graph-links.js";
import { adoptUpstreamMediaMetadata } from "./upstream-media-metadata.js";

let comfyApi = null;

export function configureDomMedia({ api }) {
  comfyApi = api;
}

export async function loadMediaUrl(ui, object, url, isCurrent = () => true, isVideo = null) {
  if (!object || !url) return;
  // A caller that already knows the real filename (before it became a `/view?`
  // query string with the extension no longer at the end) should say so
  // directly, rather than have this guess from a URL the check cannot match.
  const path = String(object.asset || url).toLowerCase();
  const asVideo = isVideo ?? /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/.test(path);
  if (asVideo) {
    const video = document.createElement("video");
    video.src = url;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    await new Promise((resolve) => {
      video.addEventListener("loadeddata", resolve, { once: true });
      video.addEventListener("error", resolve, { once: true });
    });
    if (!isCurrent()) { video.pause(); video.removeAttribute("src"); video.load(); return; }
    // Matches loadCardFile: an upstream card is meant to read as a live
    // texture, not a frozen first frame. Playback failing (autoplay policy,
    // a source with no video track) still leaves a usable still image.
    await video.play().catch(() => {});
    ui.cardMediaById.set(object.id, video);
    if (object.id === "subject") ui.cardMedia = video;
  } else {
    const image = new Image();
    image.src = url;
    await image.decode().catch(() => {});
    if (!isCurrent()) { image.src = ""; return; }
    ui.cardMediaById.set(object.id, image);
    if (object.id === "subject") ui.cardMedia = image;
  }
  ui.render();
  return ui.cardMediaById.get(object.id) || null;
}

async function describeUpstreamVideo(value, signal) {
  if (!comfyApi?.fetchApi || !/\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/i.test(value)) return null;
  const response = await comfyApi.fetchApi("/majoor/omnicam/extractor/source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: { kind: "annotated_input", value } }),
    signal,
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.info || null;
}

function upstreamAssetValue(value, subfolder = "") {
  const raw = String(value || "");
  const annotated = raw.match(/\s+\[(input|output|temp)\]$/);
  const path = annotated ? raw.slice(0, annotated.index) : raw;
  const type = annotated?.[1] || "input";
  const joined = subfolder && !path.includes("/") && !path.includes("\\") ? `${subfolder}/${path}` : path;
  return `${joined} [${type}]`;
}

export function restoreAssets(ui) {
  if (ui.state.viewport_bg_image) {
    const image = new Image();
    image.src = annotatedAssetUrl(ui.state.viewport_bg_image);
    image.decode().catch(() => {});
    ui.viewportBgImage = image;
  }
  ui.viewportBgSequenceImages = (ui.state.viewport_bg_sequence || []).map((asset) => {
    const image = new Image();
    image.src = annotatedAssetUrl(asset);
    image.decode().catch(() => {});
    return image;
  });
  for (const object of ui.state.objects) {
    if (!object.asset) {
      // A model with no managed asset was never uploaded successfully. Its blob
      // URL died with the previous page, so say so instead of leaving an empty
      // row the user cannot explain.
      if (object.type === "model" || object.type === "glb") {
        object.load_error = t("Not saved to the ComfyUI input folder: this model will be missing after a reload.");
      }
      continue;
    }
    const url = annotatedAssetUrl(object.asset);
    if (object.type === "glb" || object.type === "model") ui.modelUrlsById.set(object.id, url);
    else if (object.type === "card" && !ui.cardMediaById.has(object.id)) ui.loadMediaUrl(object, url);
  }
}

export function onModelLoaded(ui, model) {
  ui.modelInfoById.set(model.id, model);
  const object = ui.state.objects.find((item) => item.id === model.id);
  if (model.error) {
    if (object) object.load_error = model.error;
    ui.setStatus(`⚠️ ${model.error}`);
    ui.refreshObjects();
    if (model.id === ui.selectedObjectId) ui.refreshInspector();
    return;
  }
  if (object) object.load_error = null;
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
    position: [0, 0, 0],
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
  ui.selectedObjectIds = new Set([id]);
  ui.selectedKeyFrame = null;
  const url = ui.objectUrls.replace(id, file);
  ui.modelUrlsById.set(id, url);
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t("Uploading {format}…").replace("{format}", format.toUpperCase()));
  try {
    const data = await uploadManagedFile(comfyApi, { route: "/majoor/omnicam/upload_model", field: "asset", file });
    // Without a managed path the object cannot be restored: the blob URL dies
    // with the page, and restoreAssets() only revives objects that have an
    // asset. Treat a pathless response as a failed upload rather than leaving
    // a model that silently disappears on the next workflow load.
    if (!data?.path) throw new Error("upload returned no managed path");
    object.asset = data.path;
    object.load_error = null;
    ui.serialize();
    const modelInfo = ui.modelInfoById.get(id);
    if (modelInfo) ui.onModelLoaded(modelInfo);
    else ui.setStatus(t("{format} imported: {name}").replace("{format}", format.toUpperCase()).replace("{name}", data.name || object.name));
  } catch (error) {
    console.error("[OmniCam] model upload failed", error);
    object.load_error = t("Not saved to the ComfyUI input folder: this model will be missing after a reload.");
    ui.serialize();
    ui.refreshObjects();
    ui.setStatus(t("{format} shown locally, but the upload failed — it will not survive a reload.")
      .replace("{format}", format.toUpperCase()));
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

export async function syncUpstreamInputs(ui) {
  if (!ui.node) return;
  const graph = ui.node.graph;
  if (!graph) return;
  const syncId = (ui.upstreamSyncId || 0) + 1;
  ui.upstreamSyncId = syncId;
  ui.upstreamFetchController?.abort();
  const fetchController = new AbortController();
  ui.upstreamFetchController = fetchController;
  const isCurrent = () => !ui.disposed && ui.upstreamSyncId === syncId;

  let anyUpdated = false;
  const inputs = ui.node.inputs || [];

  let hasImageLink = false;
  let hasAudioLink = false;
  const activeUpstreamModelIds = new Set();

  for (const input of inputs) {
    const inputName = String(input.name || "").toLowerCase();
    if (input.link == null) continue;
    const originNode = linkedOrigin(graph, input.link);
    if (!originNode) continue;

    // 1. IMAGE or VIDEO Input
    if (inputName === "image" || inputName === "video") {
      hasImageLink = true;
      const imageWidget = originNode.widgets?.find((w) =>
        ["image", "image_path", "upload", "file", "filename", "video", "video_path"].includes(String(w.name).toLowerCase())
      );
      if (imageWidget && imageWidget.value) {
        const val = String(imageWidget.value);
        const isVideo = /\.(mp4|mov|webm|mkv|m4v|avi)(?:\s|$)/i.test(val);
        const subfolder = originNode.widgets?.find((w) => String(w.name).toLowerCase() === "subfolder")?.value || "";
        const url = annotatedAssetUrl(upstreamAssetValue(val, subfolder));
        const subject = ui.state.objects.find((o) => o.id === "subject");
        if (subject) {
          const media = await loadMediaUrl(ui, subject, url, isCurrent, isVideo);
          if (!isCurrent()) return;
          subject.asset = upstreamAssetValue(val, subfolder);
          let videoInfo = null;
          if (isVideo) {
            try { videoInfo = await describeUpstreamVideo(val, fetchController.signal); } catch (error) {
              if (error?.name === "AbortError") return;
              console.warn("Failed to describe upstream video:", error);
            }
          }
          if (isCurrent()) {
            adoptUpstreamMediaMetadata(ui, media, {
              fps: videoInfo?.fps,
              frameCount: isVideo ? videoInfo?.frame_count : 1,
            });
          }
          ui.upstreamImageConnected = true;
          anyUpdated = true;
          ui.setStatus(t(`Upstream ${isVideo ? "video" : "image"}: ${val}`));
        }
      } else {
        // No file-backed widget to read: fall back to whatever the origin
        // node has already rendered into its own DOM (a post-run thumbnail,
        // a widget's own preview) -- the same client-only trick Extractor
        // uses for a source it cannot resolve into a managed file either.
        const media = upstreamPreviewMedia(originNode);
        if (media) {
          // A borrowed video may already be paused for reasons that are the
          // origin node's own business; this only asks it to play again, it
          // never fails the sync if that request is refused.
          if (media instanceof HTMLVideoElement && media.paused) media.play().catch(() => {});
          ui.cardMediaById.set("subject", media);
          ui.cardMedia = media;
          adoptUpstreamMediaMetadata(ui, media, { frameCount: media instanceof HTMLVideoElement ? 0 : 1 });
          ui.upstreamImageConnected = true;
          anyUpdated = true;
          ui.render();
          ui.setStatus(media instanceof HTMLVideoElement ? t("Upstream video preview synced") : t("Upstream image preview synced"));
        }
      }
    }

    // 2. AUDIO Input
    if (inputName === "audio") {
      hasAudioLink = true;
      const audioWidget = originNode.widgets?.find((w) =>
        ["audio", "audio_path", "audio_file", "file", "filename"].includes(String(w.name).toLowerCase())
      );
      if (audioWidget && audioWidget.value) {
        const val = String(audioWidget.value);
        const subfolder = originNode.widgets?.find((w) => String(w.name).toLowerCase() === "subfolder")?.value || "";
        const url = annotatedAssetUrl(upstreamAssetValue(val, subfolder));
        try {
          const resp = await fetch(url, { signal: fetchController.signal });
          if (resp.ok) {
            const blob = await resp.blob();
            if (!isCurrent()) return;
            const file = new File([blob], val, { type: blob.type || "audio/wav" });
            await ui.loadAudioFile(file);
            ui.upstreamAudioConnected = true;
            anyUpdated = true;
            ui.setStatus(t(`Upstream audio: ${val}`));
          }
        } catch (err) {
          if (err?.name === "AbortError") return;
          console.warn("Failed to fetch upstream audio:", err);
        }
      }
    }

    // 3. 3D SCENE / MODEL Input
    if (inputName === "scene_3d" || inputName === "model" || inputName === "mesh") {
      const modelWidget = originNode.widgets?.find((w) =>
        ["model_file", "model", "file", "filename", "filepath", "mesh", "scene", "3d_file"].includes(String(w.name).toLowerCase())
      );
      if (modelWidget && modelWidget.value) {
        const val = String(modelWidget.value);
        const format = val.split(".").pop()?.toLowerCase();
        if (["glb", "gltf", "obj", "fbx", "stl", "ply"].includes(format)) {
          const subfolder = originNode.widgets?.find((w) => String(w.name).toLowerCase() === "subfolder")?.value || "";
          const url = annotatedAssetUrl(upstreamAssetValue(val, subfolder));
          const modelId = `upstream_scene_${originNode.id}`;
          activeUpstreamModelIds.add(modelId);
          let obj = ui.state.objects.find((o) => o.id === modelId);
          if (!obj) {
            obj = {
              id: modelId,
              type: "model",
              format: format === "gltf" ? "glb" : format,
              name: `Upstream: ${val.replace(/\.[^.]+$/i, "")}`,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              size: [1, 1, 1],
              material_mode: "textured",
              keyframes: [],
              enabled: true,
                  asset: upstreamAssetValue(val, subfolder),
            };
            ui.state.objects.push(obj);
          } else {
                obj.asset = upstreamAssetValue(val, subfolder);
            obj.format = format === "gltf" ? "glb" : format;
          }
          ui.modelUrlsById.set(modelId, url);
          ui.serialize();
          ui.refreshObjects();
          ui.render();
          anyUpdated = true;
          ui.setStatus(t(`Upstream 3D model: ${val}`));
        }
      }
    }
  }

  // Handle Disconnections / Removals
  // 1. Cleanup disconnected Image/Video
  if (!hasImageLink && ui.upstreamImageConnected) {
    ui.cardMedia = null;
    ui.cardMediaById.delete("subject");
    const subject = ui.state.objects.find((o) => o.id === "subject");
    if (subject) subject.asset = "";
    ui.upstreamImageConnected = false;
    anyUpdated = true;
    ui.setStatus(t("Upstream image disconnected · card reset"));
  }

  // 2. Cleanup disconnected Audio
  if (!hasAudioLink && ui.upstreamAudioConnected) {
    if (ui.audioSource) {
      try { ui.audioSource.stop(); } catch (_) {}
      ui.audioSource = null;
    }
    ui.audioBuffer = null;
    ui.audioWaveformPeaks = null;
    ui.upstreamAudioConnected = false;
    ui.refreshKeys();
    anyUpdated = true;
    ui.setStatus(t("Upstream audio disconnected · audio track cleared"));
  }

  // 3. Cleanup disconnected 3D Scenes / Models
  const deadUpstreamModels = ui.state.objects.filter(
    (o) => o.id.startsWith("upstream_scene_") && !activeUpstreamModelIds.has(o.id)
  );
  if (deadUpstreamModels.length > 0) {
    for (const deadObj of deadUpstreamModels) {
      ui.modelUrlsById.delete(deadObj.id);
      ui.modelInfoById.delete(deadObj.id);
      ui.webgl?.removeModel(deadObj.id);
    }
    ui.state.objects = ui.state.objects.filter(
      (o) => !deadUpstreamModels.some((d) => d.id === o.id)
    );
    ui.refreshObjects();
    anyUpdated = true;
    ui.setStatus(t("Upstream 3D scene disconnected · model removed"));
  }

  // The motion_scene cable is handled last and separately: it stages camera keys
  // rather than media, and it decides for itself whether anything changed.
  // A disconnected cable is deliberately a no-op -- the imported keys stay.
  if (syncExtractorCameraTrack(ui)) anyUpdated = true;

  if (anyUpdated) {
    ui.serialize();
    ui.render();
  }
}
