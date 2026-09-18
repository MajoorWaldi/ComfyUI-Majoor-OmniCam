import { O as l, v as a } from "./chunk-yjHTInyb.js";
import { a as p } from "./chunk-QPu3m5tU.js";
const s = "MajoorOmniCamDirector";
function f(t) {
  return String(t?.comfyClass || t?.constructor?.type || "");
}
function o(t, e) {
  return t?.widgets?.find((n) => n.name === e)?.value;
}
function m(t) {
  return String(o(t, "state_json") ?? "{}");
}
function h(t) {
  try {
    const e = JSON.parse(t);
    return e && typeof e == "object" ? e : {};
  } catch {
    return {};
  }
}
function b(t, e) {
  const n = t?.motion_scene_fingerprint;
  return n ? n !== p(e) : !1;
}
function S(t, e) {
  if (f(e) !== s) return null;
  const n = String(o(e, "recording_path") || "");
  if (!n) return null;
  const d = l(t, n);
  if (!d) return null;
  const u = m(e), i = h(u), r = i?.metadata?.playblast && typeof i.metadata.playblast == "object" ? i.metadata.playblast : {};
  return {
    kind: "director_playblast",
    url: d,
    fps: Number(r.fps) || void 0,
    frameCount: Number(r.frame_count) || void 0,
    width: Number(r.width) || void 0,
    height: Number(r.height) || void 0,
    durationSeconds: Number(r.duration_seconds) || void 0,
    encoder: typeof r.encoder == "string" ? r.encoder : void 0,
    outdated: b(r, u)
  };
}
function c(t) {
  return f(t) === s && !o(t, "recording_path");
}
function _(t, e) {
  if (t) {
    const n = [t.outdated ? a("⚠ Playblast outdated (re-record before compiling)") : a("● Director playblast")];
    return t.width && t.height && n.push(`${t.width}x${t.height}`), t.fps && n.push(`${t.fps}fps`), t.frameCount && n.push(a("{count} frames", { count: t.frameCount })), t.durationSeconds && n.push(`${t.durationSeconds.toFixed(2)}s`), n.join(" · ");
  }
  return c(e) ? a("⚠ Director connected, no playblast recorded yet — showing the live viewport.") : "";
}
function w(t, e) {
  return t?.outdated ? "2" : t ? "" : c(e) ? "1" : "";
}
export {
  _ as a,
  S as d,
  w as r
};
