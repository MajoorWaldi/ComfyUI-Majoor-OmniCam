import { clamp as I, annotatedAssetUrl as C } from "./omnicam-core.js";
import { uploadManagedFile as U } from "./omnicam-media.js";
import { t as n } from "./omnicam-i18n.js";
let b = null;
function B({ api: e }) {
  b = e;
}
async function $(e, t, s) {
  if (!t || !s) return;
  const a = String(t.asset || s).toLowerCase();
  if (/\.(mp4|webm|mov)(?:\s|$)/.test(a)) {
    const o = document.createElement("video");
    o.src = s, o.loop = !0, o.muted = !0, o.playsInline = !0, await new Promise((c) => {
      o.addEventListener("loadeddata", c, { once: !0 }), o.addEventListener("error", c, { once: !0 });
    }), e.cardMediaById.set(t.id, o), t.id === "subject" && (e.cardMedia = o);
  } else {
    const o = new Image();
    o.src = s, await o.decode().catch(() => {
    }), e.cardMediaById.set(t.id, o), t.id === "subject" && (e.cardMedia = o);
  }
  e.render();
}
function x(e) {
  for (const t of e.state.objects) {
    if (!t.asset) continue;
    const s = C(t.asset);
    t.type === "glb" || t.type === "model" ? e.modelUrlsById.set(t.id, s) : t.type === "card" && !e.cardMediaById.has(t.id) && e.loadMediaUrl(t, s);
  }
}
function k(e, t) {
  e.modelInfoById.set(t.id, t);
  const s = e.state.objects.find((a) => a.id === t.id);
  if (t.error) {
    s && (s.load_error = t.error), e.setStatus(`⚠️ ${t.error}`), e.refreshObjects(), t.id === e.selectedObjectId && e.refreshInspector();
    return;
  }
  s && (s.load_error = null), s?.animation_index && e.webgl?.selectAnimation(t.id, s.animation_index), t.id === e.selectedObjectId && e.refreshInspector(), !t.meshes && !t.points && t.bones ? e.setStatus(n(`${t.format.toUpperCase()} animation only: ${t.bones} bones, no mesh · skeleton preview`)) : e.setStatus(n(`${t.format.toUpperCase()} loaded: ${t.meshes} mesh${t.meshes === 1 ? "" : "es"}, ${t.vertices} vertices`));
}
async function R(e, t) {
  if (!t) return;
  const s = t.name.split(".").pop()?.toLowerCase();
  if (!["glb", "obj", "fbx", "stl", "ply"].includes(s)) return e.setStatus(n("Supported scenes: GLB, OBJ, FBX, STL, PLY. Convert ABC first."));
  const a = `model_${Date.now().toString(36)}`, o = {
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
  e.state.objects.push(o), e.selectedEntity = "object", e.selectedObjectId = a, e.selectedKeyFrame = null;
  const c = e.objectUrls.replace(a, t);
  e.modelUrlsById.set(a, c), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(n(`Uploading ${s.toUpperCase()}...`));
  try {
    const S = await U(b, { route: "/majoor/omnicam/upload_model", field: "asset", file: t });
    o.asset = S.path, e.serialize();
    const w = e.modelInfoById.get(a);
    w ? e.onModelLoaded(w) : e.setStatus(n(`${s.toUpperCase()}: ${S.name}`));
  } catch (S) {
    console.error(S), e.setStatus(n(`${s.toUpperCase()} loaded locally; backend upload failed`));
  }
}
async function A(e, t) {
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
  e.render(), e.setStatus(n("Uploading card…"));
  try {
    const a = await U(b, { route: "/majoor/omnicam/upload_asset", field: "asset", file: t });
    s.asset = a.path, s.id === "subject" && (e.state.card_asset = a.path, e.cardWidget && (e.cardWidget.value = a.path)), e.serialize(), e.setStatus(n(`Card: ${a.name}`));
  } catch (a) {
    console.error(a), e.setStatus(n("Card loaded locally; backend upload failed"));
  }
}
function O(e, t) {
  e.executionReferences = Array.isArray(t?.images) ? t.images : [];
  const s = e.root.querySelector('[data-role="reference-select"]');
  if (s.innerHTML = "", e.executionReferences.forEach((a, o) => {
    const c = document.createElement("option");
    c.value = String(o), c.textContent = a.filename || n(`Upstream ${o + 1}`), s.appendChild(c);
  }), !e.executionReferences.length) {
    const a = document.createElement("option");
    a.value = "0", a.textContent = n("No upstream reference"), s.appendChild(a);
    return;
  }
  e.state.reference_index = I(e.state.reference_index || 0, 0, e.executionReferences.length - 1), s.value = String(e.state.reference_index), e.serialize(), e.loadSelectedReference();
}
function E(e) {
  const t = e.executionReferences[e.state.reference_index];
  if (!t) return;
  const s = new Image();
  s.onload = () => {
    e.cardMedia = s, e.cardMediaById.set("subject", s), e.render(), e.setStatus(n("Upstream media refreshed"));
  }, s.src = b.apiURL(`/view?${new URLSearchParams(t).toString()}`);
}
async function z(e) {
  if (!e.node) return;
  const t = e.node.graph;
  if (!t) return;
  let s = !1;
  const a = e.node.inputs || [];
  let o = !1, c = !1;
  const S = /* @__PURE__ */ new Set();
  for (const d of a) {
    const m = String(d.name || "").toLowerCase();
    if (d.link == null) continue;
    const j = t.links ? t.links[d.link] : null;
    if (!j) continue;
    const p = t.getNodeById(j.origin_id);
    if (p) {
      if (m === "image" || m === "video") {
        o = !0;
        const i = p.widgets?.find(
          (r) => ["image", "image_path", "upload", "file", "filename", "video", "video_path"].includes(String(r.name).toLowerCase())
        );
        if (i && i.value) {
          const r = String(i.value), g = /\.(mp4|webm|mov)(?:\s|$)/i.test(r), y = p.widgets?.find((f) => String(f.name).toLowerCase() === "subfolder")?.value || "", h = new URLSearchParams({ filename: r, type: "input" });
          y && h.set("subfolder", String(y));
          const u = b ? b.apiURL(`/view?${h.toString()}`) : `/view?${h.toString()}`, l = e.state.objects.find((f) => f.id === "subject");
          l && (l.asset = r, await $(e, l, u), e.upstreamImageConnected = !0, s = !0, e.setStatus(n(`Upstream ${g ? "video" : "image"}: ${r}`)));
        } else if (p.imgs?.length) {
          const r = p.imgs[0];
          r && (e.cardMediaById.set("subject", r), e.cardMedia = r, e.upstreamImageConnected = !0, s = !0, e.render(), e.setStatus(n("Upstream image preview synced")));
        }
      }
      if (m === "audio") {
        c = !0;
        const i = p.widgets?.find(
          (r) => ["audio", "audio_path", "audio_file", "file", "filename"].includes(String(r.name).toLowerCase())
        );
        if (i && i.value) {
          const r = String(i.value), g = p.widgets?.find((u) => String(u.name).toLowerCase() === "subfolder")?.value || "", y = new URLSearchParams({ filename: r, type: "input" });
          g && y.set("subfolder", String(g));
          const h = b ? b.apiURL(`/view?${y.toString()}`) : `/view?${y.toString()}`;
          try {
            const u = await fetch(h);
            if (u.ok) {
              const l = await u.blob(), f = new File([l], r, { type: l.type || "audio/wav" });
              await e.loadAudioFile(f), e.upstreamAudioConnected = !0, s = !0, e.setStatus(n(`Upstream audio: ${r}`));
            }
          } catch (u) {
            console.warn("Failed to fetch upstream audio:", u);
          }
        }
      }
      if (m === "scene_3d" || m === "model" || m === "mesh") {
        const i = p.widgets?.find(
          (r) => ["model_file", "model", "file", "filename", "filepath", "mesh", "scene", "3d_file"].includes(String(r.name).toLowerCase())
        );
        if (i && i.value) {
          const r = String(i.value), g = r.split(".").pop()?.toLowerCase();
          if (["glb", "gltf", "obj", "fbx", "stl", "ply"].includes(g)) {
            const y = p.widgets?.find((v) => String(v.name).toLowerCase() === "subfolder")?.value || "", h = new URLSearchParams({ filename: r, type: "input" });
            y && h.set("subfolder", String(y));
            const u = b ? b.apiURL(`/view?${h.toString()}`) : `/view?${h.toString()}`, l = `upstream_scene_${p.id}`;
            S.add(l);
            let f = e.state.objects.find((v) => v.id === l);
            f ? (f.asset = r, f.format = g === "gltf" ? "glb" : g) : (f = {
              id: l,
              type: "model",
              format: g === "gltf" ? "glb" : g,
              name: `Upstream: ${r.replace(/\.[^.]+$/i, "")}`,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              size: [1, 1, 1],
              material_mode: "textured",
              keyframes: [],
              enabled: !0,
              asset: r
            }, e.state.objects.push(f)), e.modelUrlsById.set(l, u), e.serialize(), e.refreshObjects(), e.render(), s = !0, e.setStatus(n(`Upstream 3D model: ${r}`));
          }
        }
      }
    }
  }
  if (!o && e.upstreamImageConnected) {
    e.cardMedia = null, e.cardMediaById.delete("subject");
    const d = e.state.objects.find((m) => m.id === "subject");
    d && (d.asset = ""), e.upstreamImageConnected = !1, s = !0, e.setStatus(n("Upstream image disconnected · card reset"));
  }
  if (!c && e.upstreamAudioConnected) {
    if (e.audioSource) {
      try {
        e.audioSource.stop();
      } catch {
      }
      e.audioSource = null;
    }
    e.audioBuffer = null, e.audioWaveformPeaks = null, e.upstreamAudioConnected = !1, e.refreshKeys(), s = !0, e.setStatus(n("Upstream audio disconnected · audio track cleared"));
  }
  const w = e.state.objects.filter(
    (d) => d.id.startsWith("upstream_scene_") && !S.has(d.id)
  );
  if (w.length > 0) {
    for (const d of w)
      e.modelUrlsById.delete(d.id), e.modelInfoById.delete(d.id), e.webgl?.removeModel(d.id);
    e.state.objects = e.state.objects.filter(
      (d) => !w.some((m) => m.id === d.id)
    ), e.refreshObjects(), s = !0, e.setStatus(n("Upstream 3D scene disconnected · model removed"));
  }
  s && (e.serialize(), e.render());
}
export {
  B as configureDomMedia,
  A as loadCardFile,
  O as loadExecutionPreview,
  $ as loadMediaUrl,
  R as loadModelFile,
  E as loadSelectedReference,
  k as onModelLoaded,
  x as restoreAssets,
  z as syncUpstreamInputs
};
