import { cameraBasis as u, mul as o, add as p } from "./omnicam-core.js";
const K = { t: "translate", r: "rotate", s: "scale" }, E = /* @__PURE__ */ new Set(["w", "a", "s", "d", "q", "e"]);
function g(e) {
  return !(e instanceof HTMLElement) || ["INPUT", "SELECT", "TEXTAREA"].includes(e.tagName) || e.isContentEditable || !!e.closest?.('[contenteditable="true"],span.property_value') || e.tagName === "BUTTON" && !1;
}
function k(e, r) {
  const i = r.composedPath?.()[0] || r.target;
  if (!(i instanceof HTMLElement) || ["INPUT", "SELECT", "TEXTAREA"].includes(i.tagName) || i.isContentEditable || i.closest?.('[contenteditable="true"],span.property_value') || i.tagName === "BUTTON" && (r.code === "Space" || r.key === "Enter")) return !1;
  if (e.contextMenu.onKey(r)) return !0;
  const t = r.key.toLowerCase(), a = () => {
    r.preventDefault(), r.stopPropagation();
  };
  if ((r.ctrlKey || r.metaKey) && t === "z")
    return a(), r.repeat || (r.shiftKey ? e.redo() : e.undo()), !0;
  if ((r.ctrlKey || r.metaKey) && t === "y")
    return a(), r.repeat || e.redo(), !0;
  if ((r.ctrlKey || r.metaKey) && t === "c")
    return a(), e.copyKeyframe(), !0;
  if ((r.ctrlKey || r.metaKey) && t === "v")
    return a(), e.pasteKeyframe(), !0;
  if (r.ctrlKey || r.metaKey || r.altKey) return !1;
  if (e.selectedObject() && K[t])
    return a(), r.repeat || e.setTransformMode(K[t]), !0;
  if (t === "i")
    return a(), r.repeat || e.insertKeyframe(), !0;
  if (r.code === "Space")
    return a(), r.repeat || e.togglePlay(), !0;
  if (t === "f")
    return a(), r.repeat || e.frameTarget(), !0;
  if (r.key === "Delete" || r.key === "Backspace")
    return a(), r.repeat || e.deleteKeyframe(), !0;
  if (r.key === "ArrowLeft")
    return a(), e.setFrame(e.frame - 1), !0;
  if (r.key === "ArrowRight")
    return a(), e.setFrame(e.frame + 1), !0;
  if (t === ",")
    return a(), e.goToAdjacentKey(-1), !0;
  if (t === ".")
    return a(), e.goToAdjacentKey(1), !0;
  if (r.key === "Home")
    return a(), e.selectKeyframe(e.timelineKeyframes()[0]), !0;
  if (r.key === "End") {
    a();
    const d = e.timelineKeyframes();
    return e.selectKeyframe(d[d.length - 1]), !0;
  }
  if (!E.has(t)) return !1;
  a();
  const c = e.viewportCamera(), l = e.state.view_mode !== "camera", { right: n, up: m, forward: y } = u(c), s = (r.shiftKey ? 0.6 : 0.18) * e.cameraSpeed;
  let f = [0, 0, 0];
  return t === "w" && (f = o(y, s)), t === "s" && (f = o(y, -s)), t === "d" && (f = o(n, s)), t === "a" && (f = o(n, -s)), t === "e" && (f = o(m, s)), t === "q" && (f = o(m, -s)), l || e.beginCameraEdit(), c.position = p(c.position, f), c.target = p(c.target, f), l ? (e.serialize(), e.render()) : (e.commitCameraEdit(), e.finishCameraEdit()), !0;
}
export {
  k as dispatchDirectorKey,
  g as isEditableTarget
};
