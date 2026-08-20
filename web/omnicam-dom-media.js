import { clamp as M, annotatedAssetUrl as w } from "./omnicam-core.js";
import { uploadManagedFile as $ } from "./omnicam-media.js";
import { t as n } from "./omnicam-i18n.js";
let I = null;
function k({ api: e }) {
  I = e;
}
async function B(e, t, s, a = () => !0) {
  if (!t || !s) return;
  const d = String(t.asset || s).toLowerCase();
  if (/\.(mp4|webm|mov)(?:\s|$)/.test(d)) {
    const r = document.createElement("video");
    if (r.src = s, r.loop = !0, r.muted = !0, r.playsInline = !0, await new Promise((p) => {
      r.addEventListener("loadeddata", p, { once: !0 }), r.addEventListener("error", p, { once: !0 });
    }), !a()) {
      r.pause(), r.removeAttribute("src"), r.load();
      return;
    }
    e.cardMediaById.set(t.id, r), t.id === "subject" && (e.cardMedia = r);
  } else {
    const r = new Image();
    if (r.src = s, await r.decode().catch(() => {
    }), !a()) {
      r.src = "";
      return;
    }
    e.cardMediaById.set(t.id, r), t.id === "subject" && (e.cardMedia = r);
  }
  e.render();
}
function y(e, t = "") {
  const s = String(e || ""), a = s.match(/\s+\[(input|output|temp)\]$/), d = a ? s.slice(0, a.index) : s, r = a?.[1] || "input";
  return `${t && !d.includes("/") && !d.includes("\\") ? `${t}/${d}` : d} [${r}]`;
}
function O(e) {
  if (e.state.viewport_bg_image) {
    const t = new Image();
    t.src = w(e.state.viewport_bg_image), t.decode().catch(() => {
    }), e.viewportBgImage = t;
  }
  e.viewportBgSequenceImages = (e.state.viewport_bg_sequence || []).map((t) => {
    const s = new Image();
    return s.src = w(t), s.decode().catch(() => {
    }), s;
  });
  for (const t of e.state.objects) {
    if (!t.asset) continue;
    const s = w(t.asset);
    t.type === "glb" || t.type === "model" ? e.modelUrlsById.set(t.id, s) : t.type === "card" && !e.cardMediaById.has(t.id) && e.loadMediaUrl(t, s);
  }
}
function E(e, t) {
  e.modelInfoById.set(t.id, t);
  const s = e.state.objects.find((a) => a.id === t.id);
  if (t.error) {
    s && (s.load_error = t.error), e.setStatus(`⚠️ ${t.error}`), e.refreshObjects(), t.id === e.selectedObjectId && e.refreshInspector();
    return;
  }
  s && (s.load_error = null), s?.animation_index && e.webgl?.selectAnimation(t.id, s.animation_index), t.id === e.selectedObjectId && e.refreshInspector(), !t.meshes && !t.points && t.bones ? e.setStatus(n(`${t.format.toUpperCase()} animation only: ${t.bones} bones, no mesh · skeleton preview`)) : e.setStatus(n(`${t.format.toUpperCase()} loaded: ${t.meshes} mesh${t.meshes === 1 ? "" : "es"}, ${t.vertices} vertices`));
}
async function F(e, t) {
  if (!t) return;
  const s = t.name.split(".").pop()?.toLowerCase();
  if (!["glb", "obj", "fbx", "stl", "ply"].includes(s)) return e.setStatus(n("Supported scenes: GLB, OBJ, FBX, STL, PLY. Convert ABC first."));
  const a = `model_${Date.now().toString(36)}`, d = {
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
  e.state.objects.push(d), e.selectedEntity = "object", e.selectedObjectId = a, e.selectedKeyFrame = null;
  const r = e.objectUrls.replace(a, t);
  e.modelUrlsById.set(a, r), e.serialize(), e.refreshObjects(), e.refreshKeys(), e.render(), e.setStatus(n(`Uploading ${s.toUpperCase()}...`));
  try {
    const p = await $(I, { route: "/majoor/omnicam/upload_model", field: "asset", file: t });
    d.asset = p.path, e.serialize();
    const S = e.modelInfoById.get(a);
    S ? e.onModelLoaded(S) : e.setStatus(n(`${s.toUpperCase()}: ${p.name}`));
  } catch (p) {
    console.error(p), e.setStatus(n(`${s.toUpperCase()} loaded locally; backend upload failed`));
  }
}
async function R(e, t) {
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
    const a = await $(I, { route: "/majoor/omnicam/upload_asset", field: "asset", file: t });
    s.asset = a.path, s.id === "subject" && (e.state.card_asset = a.path, e.cardWidget && (e.cardWidget.value = a.path)), e.serialize(), e.setStatus(n(`Card: ${a.name}`));
  } catch (a) {
    console.error(a), e.setStatus(n("Card loaded locally; backend upload failed"));
  }
}
function z(e, t) {
  e.executionReferences = Array.isArray(t?.images) ? t.images : [];
  const s = e.root.querySelector('[data-role="reference-select"]');
  if (s.innerHTML = "", e.executionReferences.forEach((a, d) => {
    const r = document.createElement("option");
    r.value = String(d), r.textContent = a.filename || n(`Upstream ${d + 1}`), s.appendChild(r);
  }), !e.executionReferences.length) {
    const a = document.createElement("option");
    a.value = "0", a.textContent = n("No upstream reference"), s.appendChild(a);
    return;
  }
  e.state.reference_index = M(e.state.reference_index || 0, 0, e.executionReferences.length - 1), s.value = String(e.state.reference_index), e.serialize(), e.loadSelectedReference();
}
function W(e) {
  const t = e.executionReferences[e.state.reference_index];
  if (!t) return;
  const s = new Image();
  s.onload = () => {
    e.cardMedia = s, e.cardMediaById.set("subject", s), e.render(), e.setStatus(n("Upstream media refreshed"));
  }, s.src = I.apiURL(`/view?${new URLSearchParams(t).toString()}`);
}
async function P(e) {
  if (!e.node) return;
  const t = e.node.graph;
  if (!t) return;
  const s = (e.upstreamSyncId || 0) + 1;
  e.upstreamSyncId = s, e.upstreamFetchController?.abort();
  const a = new AbortController();
  e.upstreamFetchController = a;
  const d = () => !e.disposed && e.upstreamSyncId === s;
  let r = !1;
  const p = e.node.inputs || [];
  let S = !1, C = !1;
  const U = /* @__PURE__ */ new Set();
  for (const c of p) {
    const g = String(c.name || "").toLowerCase();
    if (c.link == null) continue;
    const _ = t.links ? t.links[c.link] : null;
    if (!_) continue;
    const u = t.getNodeById(_.origin_id);
    if (u) {
      if (g === "image" || g === "video") {
        S = !0;
        const i = u.widgets?.find(
          (o) => ["image", "image_path", "upload", "file", "filename", "video", "video_path"].includes(String(o.name).toLowerCase())
        );
        if (i && i.value) {
          const o = String(i.value), b = /\.(mp4|webm|mov)(?:\s|$)/i.test(o), h = u.widgets?.find((m) => String(m.name).toLowerCase() === "subfolder")?.value || "", l = w(y(o, h)), f = e.state.objects.find((m) => m.id === "subject");
          if (f) {
            if (await B(e, f, l, d), !d()) return;
            f.asset = y(o, h), e.upstreamImageConnected = !0, r = !0, e.setStatus(n(`Upstream ${b ? "video" : "image"}: ${o}`));
          }
        } else if (u.imgs?.length) {
          const o = u.imgs[0];
          o && (e.cardMediaById.set("subject", o), e.cardMedia = o, e.upstreamImageConnected = !0, r = !0, e.render(), e.setStatus(n("Upstream image preview synced")));
        }
      }
      if (g === "audio") {
        C = !0;
        const i = u.widgets?.find(
          (o) => ["audio", "audio_path", "audio_file", "file", "filename"].includes(String(o.name).toLowerCase())
        );
        if (i && i.value) {
          const o = String(i.value), b = u.widgets?.find((l) => String(l.name).toLowerCase() === "subfolder")?.value || "", h = w(y(o, b));
          try {
            const l = await fetch(h, { signal: a.signal });
            if (l.ok) {
              const f = await l.blob();
              if (!d()) return;
              const m = new File([f], o, { type: f.type || "audio/wav" });
              await e.loadAudioFile(m), e.upstreamAudioConnected = !0, r = !0, e.setStatus(n(`Upstream audio: ${o}`));
            }
          } catch (l) {
            if (l?.name === "AbortError") return;
            console.warn("Failed to fetch upstream audio:", l);
          }
        }
      }
      if (g === "scene_3d" || g === "model" || g === "mesh") {
        const i = u.widgets?.find(
          (o) => ["model_file", "model", "file", "filename", "filepath", "mesh", "scene", "3d_file"].includes(String(o.name).toLowerCase())
        );
        if (i && i.value) {
          const o = String(i.value), b = o.split(".").pop()?.toLowerCase();
          if (["glb", "gltf", "obj", "fbx", "stl", "ply"].includes(b)) {
            const h = u.widgets?.find((j) => String(j.name).toLowerCase() === "subfolder")?.value || "", l = w(y(o, h)), f = `upstream_scene_${u.id}`;
            U.add(f);
            let m = e.state.objects.find((j) => j.id === f);
            m ? (m.asset = y(o, h), m.format = b === "gltf" ? "glb" : b) : (m = {
              id: f,
              type: "model",
              format: b === "gltf" ? "glb" : b,
              name: `Upstream: ${o.replace(/\.[^.]+$/i, "")}`,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              size: [1, 1, 1],
              material_mode: "textured",
              keyframes: [],
              enabled: !0,
              asset: y(o, h)
            }, e.state.objects.push(m)), e.modelUrlsById.set(f, l), e.serialize(), e.refreshObjects(), e.render(), r = !0, e.setStatus(n(`Upstream 3D model: ${o}`));
          }
        }
      }
    }
  }
  if (!S && e.upstreamImageConnected) {
    e.cardMedia = null, e.cardMediaById.delete("subject");
    const c = e.state.objects.find((g) => g.id === "subject");
    c && (c.asset = ""), e.upstreamImageConnected = !1, r = !0, e.setStatus(n("Upstream image disconnected · card reset"));
  }
  if (!C && e.upstreamAudioConnected) {
    if (e.audioSource) {
      try {
        e.audioSource.stop();
      } catch {
      }
      e.audioSource = null;
    }
    e.audioBuffer = null, e.audioWaveformPeaks = null, e.upstreamAudioConnected = !1, e.refreshKeys(), r = !0, e.setStatus(n("Upstream audio disconnected · audio track cleared"));
  }
  const v = e.state.objects.filter(
    (c) => c.id.startsWith("upstream_scene_") && !U.has(c.id)
  );
  if (v.length > 0) {
    for (const c of v)
      e.modelUrlsById.delete(c.id), e.modelInfoById.delete(c.id), e.webgl?.removeModel(c.id);
    e.state.objects = e.state.objects.filter(
      (c) => !v.some((g) => g.id === c.id)
    ), e.refreshObjects(), r = !0, e.setStatus(n("Upstream 3D scene disconnected · model removed"));
  }
  r && (e.serialize(), e.render());
}
export {
  k as configureDomMedia,
  R as loadCardFile,
  z as loadExecutionPreview,
  B as loadMediaUrl,
  F as loadModelFile,
  W as loadSelectedReference,
  E as onModelLoaded,
  O as restoreAssets,
  P as syncUpstreamInputs
};
