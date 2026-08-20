import { cameraBasis as g, mul as c, add as y } from "./omnicam-core.js";
const u = {
  w: "translate",
  g: "translate",
  e: "rotate",
  r: "rotate",
  s: "scale",
  t: "translate"
};
function w(e) {
  return !(e instanceof HTMLElement) || ["INPUT", "SELECT", "TEXTAREA"].includes(e.tagName) || e.isContentEditable || !!e.closest?.('[contenteditable="true"],span.property_value') || e.tagName === "BUTTON" && !1;
}
function N(e, r) {
  const d = r.composedPath?.()[0] || r.target;
  if (!(d instanceof HTMLElement) || ["INPUT", "SELECT", "TEXTAREA"].includes(d.tagName) || d.isContentEditable || d.closest?.('[contenteditable="true"],span.property_value') || d.tagName === "BUTTON" && (r.code === "Space" || r.key === "Enter")) return !1;
  if (e.contextMenu.onKey(r)) return !0;
  const a = r.key.toLowerCase(), s = r.code, t = () => {
    r.preventDefault(), r.stopPropagation();
  };
  if ((r.ctrlKey || r.metaKey) && a === "z")
    return t(), r.repeat || (r.shiftKey ? e.redo() : e.undo()), !0;
  if ((r.ctrlKey || r.metaKey) && a === "y")
    return t(), r.repeat || e.redo(), !0;
  if ((r.ctrlKey || r.metaKey) && a === "c")
    return t(), e.copyKeyframe(), !0;
  if ((r.ctrlKey || r.metaKey) && a === "v")
    return t(), e.pasteKeyframe(), !0;
  if (r.ctrlKey || r.metaKey || r.altKey) return !1;
  if (u[a] && !e.isNavigatingFly)
    return t(), r.repeat || e.setTransformMode(u[a]), !0;
  if (a === "q")
    return t(), e.selectedEntity = "camera", e.selectedObjectId = null, e.refreshObjects(), e.render(), !0;
  if (a === "i" || a === "k")
    return t(), r.repeat || e.insertKeyframe(), !0;
  if (s === "Space")
    return t(), r.repeat || e.togglePlay(), !0;
  if (a === "f")
    return t(), r.repeat || e.frameTarget(), !0;
  if (a === "n")
    return t(), r.repeat || e.toggleInspector(), !0;
  if (s === "Digit1" || !s.startsWith("Numpad") && a === "1")
    return t(), e.setSelectMode("vertex"), !0;
  if (s === "Digit2" || !s.startsWith("Numpad") && a === "2")
    return t(), e.setSelectMode("edge"), !0;
  if (s === "Digit3" || !s.startsWith("Numpad") && a === "3")
    return t(), e.setSelectMode("face"), !0;
  if (s === "Digit4" || !s.startsWith("Numpad") && a === "4")
    return t(), e.setSelectMode("object"), !0;
  if (s === "Numpad0")
    return t(), e.setViewMode("camera"), !0;
  if (s === "Numpad1")
    return t(), e.setViewMode("perspective"), !0;
  if (s === "Numpad3")
    return t(), e.setViewMode("right"), !0;
  if (s === "Numpad7")
    return t(), e.setViewMode("top"), !0;
  if (s === "Numpad9")
    return t(), e.setViewMode("bottom"), !0;
  if (s === "Numpad5")
    return t(), e.setViewMode(e.state.view_mode === "camera" ? "perspective" : "camera"), !0;
  if (r.key === "Delete" || r.key === "Backspace")
    return t(), r.repeat || e.deleteKeyframe(), !0;
  if (r.key === "ArrowUp" || r.shiftKey && r.key === "ArrowRight" || a === ".")
    return t(), e.goToAdjacentKey(1), !0;
  if (r.key === "ArrowDown" || r.shiftKey && r.key === "ArrowLeft" || a === ",")
    return t(), e.goToAdjacentKey(-1), !0;
  if (r.key === "ArrowLeft")
    return t(), e.setFrame(e.frame - 1), !0;
  if (r.key === "ArrowRight")
    return t(), e.setFrame(e.frame + 1), !0;
  if (r.key === "Home")
    return t(), e.selectKeyframe(e.timelineKeyframes()[0]), !0;
  if (r.key === "End") {
    t();
    const o = e.timelineKeyframes();
    return e.selectKeyframe(o[o.length - 1]), !0;
  }
  if (["w", "a", "s", "d", "q", "e"].includes(a) && e.isNavigatingFly) {
    t();
    const o = e.viewportCamera(), n = e.state.view_mode !== "camera", { right: m, up: l, forward: p } = g(o), i = (r.shiftKey ? 0.6 : 0.18) * e.cameraSpeed;
    let f = [0, 0, 0];
    return a === "w" && (f = c(p, i)), a === "s" && (f = c(p, -i)), a === "d" && (f = c(m, i)), a === "a" && (f = c(m, -i)), a === "e" && (f = c(l, i)), a === "q" && (f = c(l, -i)), n || e.beginCameraEdit(), o.position = y(o.position, f), o.target = y(o.target, f), n ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit()), !0;
  }
  return !1;
}
export {
  N as dispatchDirectorKey,
  w as isEditableTarget
};
