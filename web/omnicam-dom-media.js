import { clamp as p, annotatedAssetUrl as f } from "./omnicam-core.js";
import { uploadManagedFile as i } from "./omnicam-media.js";
import { t as o } from "./omnicam-i18n.js";
let c = null;
function h({ api: e }) {
  c = e;
}
async function g(e, t, s) {
  if (!t || !s) return;
  const a = String(t.asset || s).toLowerCase();
  if (/\.(mp4|webm|mov)(?:\s|$)/.test(a)) {
    const r = document.createElement("video");
    r.src = s, r.loop = !0, r.muted = !0, r.playsInline = !0, await new Promise((n) => {
      r.addEventListener("loadeddata", n, { once: !0 }), r.addEventListener("error", n, { once: !0 });
    }), e.cardMediaById.set(t.id, r), t.id === "subject" && (e.cardMedia = r);
  } else {
    const r = new Image();
    r.src = s, await r.decode().catch(() => {
    }), e.cardMediaById.set(t.id, r), t.id === "subject" && (e.cardMedia = r);
  }
  e.render();
}
function j(e) {
  for (const t of e.state.objects) {
    if (!t.asset) continue;
    const s = f(t.asset);
    t.type === "glb" || t.type === "model" ? e.modelUrlsById.set(t.id, s) : t.type === "card" && !e.cardMediaById.has(t.id) && e.loadMediaUrl(t, s);
  }
}
function I(e, t) {
  e.modelInfoById.set(t.id, t);
  const s = e.state.objects.find((a) => a.id === t.id);
  s?.animation_index && e.webgl?.selectAnimation(t.id, s.animation_index), t.id === e.selectedObjectId && e.refreshInspector(), !t.meshes && !t.points && t.bones ? e.setStatus(o(`${t.format.toUpperCase()} animation only: ${t.bones} bones, no mesh · skeleton preview`)) : e.setStatus(o(`${t.format.toUpperCase()} loaded: ${t.meshes} mesh${t.meshes === 1 ? "" : "es"}, ${t.vertices} vertices`));
}
async function S(e, t) {
  if (!t) return;
  const s = t.name.split(".").pop()?.toLowerCase();
  if (!["glb", "obj", "fbx", "stl", "ply"].includes(s)) return e.setStatus(o("Supported scenes: GLB, OBJ, FBX, STL, PLY. Convert ABC first."));
  const a = `model_${Date.now().toString(36)}`, r = {
    id: a,
    type: "model",
    format: s,
    name: t.name.replace(/\.[^.]+$/i, ""),
    position: [0, 0, -2],
    rotation: [0, 0, 0],
    size: [1, 1, 1],
    material_mode: "textured",
    keyframes: [],
    enabled: !0,
    asset: ""
  };
  e.state.objects.push(r), e.selectedEntity = "object", e.selectedObjectId = a, e.selectedKeyFrame = null;
  const n = e.objectUrls.replace(a, t);
  e.modelUrlsById.set(a, n), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(o(`Uploading ${s.toUpperCase()}...`));
  try {
    const d = await i(c, { route: "/majoor/omnicam/upload_model", field: "asset", file: t });
    r.asset = d.path, e.serialize();
    const l = e.modelInfoById.get(a);
    l ? e.onModelLoaded(l) : e.setStatus(o(`${s.toUpperCase()}: ${d.name}`));
  } catch (d) {
    console.error(d), e.setStatus(o(`${s.toUpperCase()} loaded locally; backend upload failed`));
  }
}
async function U(e, t) {
  if (!t) return;
  const s = e.selectedObject()?.type === "card" ? e.selectedObject() : e.state.objects.find((a) => a.id === "subject");
  if (e.cardUrl = e.objectUrls.replace(s.id, t), t.type.startsWith("video/")) {
    const a = document.createElement("video");
    a.src = e.cardUrl, a.loop = !0, a.muted = !0, a.playsInline = !0, await a.play().catch(() => {
    }), e.cardMediaById.set(s.id, a), s.id === "subject" && (e.cardMedia = a);
  } else {
    const a = new Image();
    a.src = e.cardUrl, await a.decode().catch(() => {
    }), e.cardMediaById.set(s.id, a), s.id === "subject" && (e.cardMedia = a);
  }
  e.render(), e.setStatus(o("Uploading card…"));
  try {
    const a = await i(c, { route: "/majoor/omnicam/upload_asset", field: "asset", file: t });
    s.asset = a.path, s.id === "subject" && (e.state.card_asset = a.path, e.cardWidget && (e.cardWidget.value = a.path)), e.serialize(), e.setStatus(o(`Card: ${a.name}`));
  } catch (a) {
    console.error(a), e.setStatus(o("Card loaded locally; backend upload failed"));
  }
}
function w(e, t) {
  e.executionReferences = Array.isArray(t?.images) ? t.images : [];
  const s = e.root.querySelector('[data-role="reference-select"]');
  if (s.innerHTML = "", e.executionReferences.forEach((a, r) => {
    const n = document.createElement("option");
    n.value = String(r), n.textContent = a.filename || o(`Upstream ${r + 1}`), s.appendChild(n);
  }), !e.executionReferences.length) {
    const a = document.createElement("option");
    a.value = "0", a.textContent = o("No upstream reference"), s.appendChild(a);
    return;
  }
  e.state.reference_index = p(e.state.reference_index || 0, 0, e.executionReferences.length - 1), s.value = String(e.state.reference_index), e.serialize(), e.loadSelectedReference();
}
function M(e) {
  const t = e.executionReferences[e.state.reference_index];
  if (!t) return;
  const s = new Image();
  s.onload = () => {
    e.cardMedia = s, e.cardMediaById.set("subject", s), e.render(), e.setStatus(o("Upstream media refreshed"));
  }, s.src = c.apiURL(`/view?${new URLSearchParams(t).toString()}`);
}
export {
  h as configureDomMedia,
  U as loadCardFile,
  w as loadExecutionPreview,
  g as loadMediaUrl,
  S as loadModelFile,
  M as loadSelectedReference,
  I as onModelLoaded,
  j as restoreAssets
};
