import { x as p, v as i } from "./chunk-Cg3_Iw1A.js";
import { a as m } from "./chunk-Bu3EGLOJ.js";
function w(t) {
  return String(t ?? "").replace(/[&<>"']/g, (e) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[e]);
}
const u = {
  verified: "pass",
  detected_unverified: "warning",
  incompatible: "blocked",
  missing: "blocked"
};
function _(t) {
  const e = String(t || "").toLowerCase();
  return e in u ? u[e] : ["ready", "warning", "blocked", "risk", "pass", "connected", "unknown"].includes(e) ? e : "unknown";
}
const c = "MajoorOmniCamDirector";
function f(t) {
  return String(t?.comfyClass || t?.constructor?.type || "");
}
function o(t, e) {
  return t?.widgets?.find((n) => n.name === e)?.value;
}
function b(t) {
  return String(o(t, "state_json") ?? "{}");
}
function g(t) {
  try {
    const e = JSON.parse(t);
    return e && typeof e == "object" ? e : {};
  } catch {
    return {};
  }
}
function h(t, e) {
  const n = t?.motion_scene_fingerprint;
  return n ? n !== m(e) : !1;
}
function C(t, e) {
  if (f(e) !== c) return null;
  const n = String(o(e, "recording_path") || "");
  if (!n) return null;
  const d = p(t, n);
  if (!d) return null;
  const s = b(e), a = g(s), r = a?.metadata?.playblast && typeof a.metadata.playblast == "object" ? a.metadata.playblast : {};
  return {
    kind: "director_playblast",
    url: d,
    fps: Number(r.fps) || void 0,
    frameCount: Number(r.frame_count) || void 0,
    width: Number(r.width) || void 0,
    height: Number(r.height) || void 0,
    durationSeconds: Number(r.duration_seconds) || void 0,
    encoder: typeof r.encoder == "string" ? r.encoder : void 0,
    outdated: h(r, s)
  };
}
function l(t) {
  return f(t) === c && !o(t, "recording_path");
}
function k(t, e) {
  if (t) {
    const n = [t.outdated ? i("⚠ Playblast outdated (re-record before compiling)") : i("● Director playblast")];
    return t.width && t.height && n.push(`${t.width}x${t.height}`), t.fps && n.push(`${t.fps}fps`), t.frameCount && n.push(i("{count} frames", { count: t.frameCount })), t.durationSeconds && n.push(`${t.durationSeconds.toFixed(2)}s`), n.join(" · ");
  }
  return l(e) ? i("⚠ Director connected, no playblast recorded yet — showing the live viewport.") : "";
}
function v(t, e) {
  return t?.outdated ? "2" : t ? "" : l(e) ? "1" : "";
}
export {
  _ as a,
  k as b,
  C as d,
  w as e,
  v as r
};
