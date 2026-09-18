const d = "omnicam_extractor_result_v2", u = "omnicam_extracted_motion_scene_json", f = "omnicam_extracted_track_fingerprint", l = "omnicam_extractor_source";
function m(e) {
  if (!e || e.version !== 1 || !Array.isArray(e.cameras)) return null;
  const t = String(e.playblast_camera_id || e.active_camera_id || ""), r = e.cameras.find((a) => String(a?.id || "") === t)?.track;
  return r && Array.isArray(r.keyframes) && r.keyframes.length ? r : null;
}
function v(e) {
  if (!e || !Array.isArray(e.keyframes) || !e.keyframes.length) return null;
  const t = Number(e.fps), n = Number(e.duration_frames);
  if (!(t > 0) || !(n > 0)) return null;
  const r = String(e.metadata?.extractor_fingerprint || "");
  return {
    version: 1,
    timeline: { duration_seconds: n / t, authoring_fps: t },
    canvas: { width: Number(e.width), height: Number(e.height) },
    cameras: [{ id: "extracted_camera", label: "Extracted Camera", enabled: !0, track: e }],
    active_camera_id: "extracted_camera",
    playblast_camera_id: "extracted_camera",
    objects: Array.isArray(e.objects) ? e.objects : [],
    motion_layers: [],
    cuts: [],
    metadata: { ...e.metadata || {}, source: "omnicam_extractor", extractor_fingerprint: r }
  };
}
function y(e) {
  const t = e?.text, n = Array.isArray(t) ? t[0] : t;
  if (typeof n != "string" || !n) return null;
  let r;
  try {
    r = JSON.parse(n);
  } catch {
    return null;
  }
  if (!r || r.kind !== d) return null;
  const a = r.mode === "scene_reconstruct" ? "scene_reconstruct" : "camera_track", c = r.motion_scene, s = {
    mode: a,
    motionScene: c,
    fingerprint: String(r.fingerprint || ""),
    solver_coverage: Number(r.solver_coverage) || 0,
    report: String(r.report || "")
  };
  if (a === "scene_reconstruct")
    return c ? {
      ...s,
      reconstruction: r.reconstruction || {},
      // The reconstruct source annotation is an object; keep it whole.
      source: r.source ?? ""
    } : null;
  const i = m(c);
  return i ? {
    ...s,
    track: i,
    source: String(r.source || ""),
    // The immutable raw solve, for live post-solve refinement without a
    // re-TRACK (POST /majoor/omnicam/extractor/refine). Held in session only.
    rawSolve: r.raw_solve && typeof r.raw_solve == "object" ? r.raw_solve : null
  } : null;
}
function g(e) {
  return e.computeSize = () => [0, -4], e.draw = () => {
  }, e.hidden = !0, e.options = { ...e.options || {}, hideInVueNodes: !0 }, e;
}
function o(e, t) {
  return e.widgets?.find((n) => n.name === t) || null;
}
function _(e) {
  const t = [];
  for (const n of [u, f]) {
    let r = o(e, n);
    if (!r) {
      if (r = e.addWidget?.("text", n, "", () => {
      }, { serialize: !0 }), !r) continue;
      g(r);
    }
    t.push(r);
  }
  return t;
}
function p(e) {
  const t = e?.widgets_values, n = e?.widgets;
  if (!Array.isArray(t) || !Array.isArray(n)) return 0;
  let r = 0;
  for (const a of [u, f, l]) {
    const c = n.findIndex((i) => i?.name === a);
    if (c < 0 || c >= t.length) continue;
    const s = t[c];
    typeof s != "string" || !s || n[c].value || (n[c].value = s, r += 1);
  }
  return r;
}
function h(e, t) {
  _(e);
  const n = o(e, u), r = o(e, f), a = String(r?.value || "") !== t.fingerprint;
  return n && (n.value = JSON.stringify(t.motionScene)), r && (r.value = t.fingerprint), a;
}
function S(e, t) {
  const n = o(e, l);
  if (!n || !t) return !1;
  const r = String(t), a = String(n.value || "") !== r;
  return n.value = r, a;
}
function x(e) {
  const t = String(o(e, f)?.value || ""), n = String(o(e, u)?.value || "");
  if (!t || !n) return null;
  let r;
  try {
    r = JSON.parse(n);
  } catch {
    return null;
  }
  const a = m(r);
  return a ? { motionScene: r, track: a, fingerprint: t } : null;
}
function b(e) {
  const t = e?.track?.metadata || {}, n = String(t.backend || "solver").toUpperCase(), r = Number(e?.track?.duration_frames) || 0, a = Array.isArray(e?.track?.keyframes) ? e.track.keyframes.length : 0, c = Math.round((Number(e?.solver_coverage ?? e?.confidence) || 0) * 100);
  return `${n} · ${r} f · ${a} keys · Solver Coverage ${c}%`;
}
export {
  f as F,
  l as S,
  u as a,
  x as b,
  h as c,
  S as d,
  _ as e,
  v as m,
  y as p,
  p as r,
  b as s
};
