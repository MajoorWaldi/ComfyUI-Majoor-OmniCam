import { cameraBasis as u, mul as c, add as p } from "./omnicam-core.js";
const g = {
  w: "translate",
  g: "translate",
  e: "rotate",
  r: "rotate",
  s: "scale",
  t: "translate"
};
function N(e) {
  return !(e instanceof HTMLElement) || ["INPUT", "SELECT", "TEXTAREA"].includes(e.tagName) || e.isContentEditable || !!e.closest?.('[contenteditable="true"],span.property_value') || e.tagName === "BUTTON" && !1;
}
function w(e, t) {
  const l = t.composedPath?.()[0] || t.target;
  if (!(l instanceof HTMLElement) || ["INPUT", "SELECT", "TEXTAREA"].includes(l.tagName) || l.isContentEditable || l.closest?.('[contenteditable="true"],span.property_value') || l.tagName === "BUTTON" && (t.code === "Space" || t.key === "Enter")) return !1;
  if (e.contextMenu.onKey(t)) return !0;
  const a = t.key.toLowerCase(), s = t.code, r = () => {
    t.preventDefault(), t.stopPropagation();
  };
  if ((t.ctrlKey || t.metaKey) && a === "z")
    return r(), t.repeat || (t.shiftKey ? e.redo() : e.undo()), !0;
  if ((t.ctrlKey || t.metaKey) && a === "y")
    return r(), t.repeat || e.redo(), !0;
  if ((t.ctrlKey || t.metaKey) && a === "c")
    return r(), e.copyKeyframe(), !0;
  if ((t.ctrlKey || t.metaKey) && a === "v")
    return r(), e.pasteKeyframe(), !0;
  if (t.ctrlKey || t.metaKey || t.altKey) return !1;
  if (g[a] && !e.isNavigatingFly)
    return r(), t.repeat || e.setTransformMode(g[a]), !0;
  if (a === "q" && !e.isNavigatingFly)
    return r(), e.setSelectMode("object"), e.selectedEntity = "camera", e.selectedObjectId = null, e.selectedKeyFrame = null, e.subSelection = null, e.refreshObjects(), e.refreshKeys(), e.refreshInspector(), e.render(), e.setStatus(`Object Mode · ${e.activeCameraTrack().name}`), !0;
  if (a === "i" || a === "k")
    return r(), t.repeat || e.insertKeyframe(), !0;
  if (s === "Space")
    return r(), t.repeat || e.togglePlay(), !0;
  if (a === "f")
    return r(), t.repeat || e.frameTarget(), !0;
  if (a === "escape" && e.isNavigatingFly)
    return r(), e.isNavigatingFly = !1, e.setStatus("Fly Mode OFF"), !0;
  if (t.shiftKey && (s === "Backquote" || a === "~") || a === "c" && !t.shiftKey && !t.altKey && !t.ctrlKey)
    return r(), e.isNavigatingFly = !e.isNavigatingFly, e.setStatus(e.isNavigatingFly ? "Fly Mode ON · WASD/QE to fly, Drag to look, Esc/C to exit" : "Fly Mode OFF"), !0;
  if (a === "n")
    return r(), t.repeat || e.toggleInspector(), !0;
  if (s === "Digit1" || !s.startsWith("Numpad") && a === "1")
    return r(), e.setSelectMode("vertex"), !0;
  if (s === "Digit2" || !s.startsWith("Numpad") && a === "2")
    return r(), e.setSelectMode("edge"), !0;
  if (s === "Digit3" || !s.startsWith("Numpad") && a === "3")
    return r(), e.setSelectMode("face"), !0;
  if (s === "Digit4" || !s.startsWith("Numpad") && a === "4")
    return r(), e.setSelectMode("object"), !0;
  if (s === "Numpad0")
    return r(), e.setViewMode("camera"), !0;
  if (s === "Numpad1")
    return r(), e.setViewMode("perspective"), !0;
  if (s === "Numpad3")
    return r(), e.setViewMode("right"), !0;
  if (s === "Numpad7")
    return r(), e.setViewMode("top"), !0;
  if (s === "Numpad9")
    return r(), e.setViewMode("bottom"), !0;
  if (s === "Numpad5")
    return r(), e.setViewMode(e.state.view_mode === "camera" ? "perspective" : "camera"), !0;
  if (t.key === "Delete" || t.key === "Backspace")
    return r(), t.repeat || e.deleteKeyframe(), !0;
  if (t.key === "ArrowUp" || t.shiftKey && t.key === "ArrowRight" || a === ".")
    return r(), e.goToAdjacentKey(1), !0;
  if (t.key === "ArrowDown" || t.shiftKey && t.key === "ArrowLeft" || a === ",")
    return r(), e.goToAdjacentKey(-1), !0;
  if (t.key === "ArrowLeft")
    return r(), e.setFrame(e.frame - 1), !0;
  if (t.key === "ArrowRight")
    return r(), e.setFrame(e.frame + 1), !0;
  if (t.key === "Home")
    return r(), e.selectKeyframe(e.timelineKeyframes()[0]), !0;
  if (t.key === "End") {
    r();
    const o = e.timelineKeyframes();
    return e.selectKeyframe(o[o.length - 1]), !0;
  }
  if (["w", "a", "s", "d", "q", "e"].includes(a) && e.isNavigatingFly) {
    r();
    const o = e.viewportCamera(), n = e.state.view_mode !== "camera", { right: d, up: y, forward: m } = u(o), i = (t.shiftKey ? 0.6 : 0.18) * e.cameraSpeed;
    let f = [0, 0, 0];
    return a === "w" && (f = c(m, i)), a === "s" && (f = c(m, -i)), a === "d" && (f = c(d, i)), a === "a" && (f = c(d, -i)), a === "e" && (f = c(y, i)), a === "q" && (f = c(y, -i)), n || e.beginCameraEdit(), o.position = p(o.position, f), o.target = p(o.target, f), n ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit()), !0;
  }
  return !1;
}
export {
  w as dispatchDirectorKey,
  N as isEditableTarget
};
