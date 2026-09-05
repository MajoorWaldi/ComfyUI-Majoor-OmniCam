import { length, sub } from "../director/core.js";

// The one place that decides what a viewport pointer gesture means. Everything
// else in the viewport only asks "is this navigation?" (so picking, the
// marquee and the gizmos can stand down) and "which of orbit/pan/dolly?".
//
// Alt is an ALIAS here, never the only way in. Real Maya gates every camera
// gesture behind it (Alt+left tumbles, Alt+middle tracks, Alt+right dollies)
// and that is honoured below -- but Alt never reaches the page in a number of
// real setups: a Linux window manager that claims Alt+drag to move windows, a
// desktop shell that opens its menu bar on Alt, a keyboard whose right Alt is
// AltGr (it reports Ctrl+Alt, not Alt). A viewport whose only orbit lives
// behind Alt is simply not navigable there, so every gesture has at least two
// independent bindings and none of the primary ones needs Alt:
//
//   orbit  middle drag          | Alt+left   | Ctrl+left over empty space
//   pan    Shift+middle         | Alt+middle | Alt+Shift+left, Ctrl+Shift+left
//   dolly  Ctrl+middle, wheel   | Alt+right (Maya) | Alt+Ctrl+left
//
// The middle-button family is Blender's, needs no modifier at all, and is what
// the timeline and curve editor in this same node already use to pan -- so it
// is the profile-independent baseline. The Ctrl+left fallbacks exist for
// hardware with no middle button, and only ever fire over empty space: the
// marquee declines Ctrl (multi-select is Ctrl+*click*, which still picks),
// which is what leaves that drag free. Alt+right stays Maya-only, since
// Blender binds no camera gesture to the secondary button.
const ORBIT = "orbit", PAN = "pan", DOLLY = "dolly";

function gestureMode(profile, event, { includeCtrlFallback }) {
  const ctrl = Boolean(event.ctrlKey || event.metaKey);
  if (event.button === 1) {
    if (ctrl) return DOLLY;
    // Alt+middle is Maya's track gesture and must stay a pan; plain middle is
    // Blender's orbit. Both are canonical, and they do not collide.
    if (event.shiftKey || event.altKey) return PAN;
    return ORBIT;
  }
  if (event.button === 2) return event.altKey && profile === "maya" ? DOLLY : null;
  if (event.button !== 0) return null;
  // Left button: Alt is the canonical modifier, Ctrl the fallback for the
  // setups that never receive Alt. Ctrl alone is only navigation once picking
  // has declined the drag, which is why it is gated behind includeCtrlFallback.
  if (event.altKey) {
    if (ctrl) return DOLLY;
    return event.shiftKey ? PAN : ORBIT;
  }
  if (ctrl && includeCtrlFallback) return event.shiftKey ? PAN : ORBIT;
  return null;
}

/**
 * The camera gesture `event` requests, or null when it is not navigation.
 * Called at the point where picking and the marquee have already declined, so
 * the Ctrl+left fallbacks are live here.
 *
 * An orthographic view has no orbit to give, so it tumbles as a pan instead --
 * the same substitution Maya's own orthographic views make.
 */
export function navigationGesture(ui, event, camera) {
  const profile = ui.state.navigation_profile === "blender" ? "blender" : "maya";
  const mode = gestureMode(profile, event, { includeCtrlFallback: true });
  if (mode === ORBIT && camera?.camera_type === "orthographic") return PAN;
  return mode;
}

/**
 * Whether `event` is an unambiguous navigation gesture -- one that must take
 * priority over picking, the marquee and the gizmo handles.
 *
 * Ctrl+left is deliberately absent: Ctrl+click adds to and removes from the
 * selection, so it has to reach the picker first and only becomes navigation
 * (via navigationGesture) once nothing was hit. Fly mode claims every button
 * for looking around, so it is navigation throughout.
 */
export function isNavigationGesture(ui, event) {
  if (ui.isNavigatingFly) return true;
  const profile = ui.state.navigation_profile === "blender" ? "blender" : "maya";
  return gestureMode(profile, event, { includeCtrlFallback: false }) !== null;
}

export function wheelPixels(event, height) {
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? Math.max(1, height) : 1;
  return Number.isFinite(event.deltaY) ? event.deltaY * unit : 0;
}

export function worldPerPixel(camera, height) {
  const span = camera.camera_type === "orthographic"
    ? 10 / Math.max(0.01, camera.zoom || 1)
    : 2 * length(sub(camera.position, camera.target)) * Math.tan((camera.fov || 35) * Math.PI / 360);
  return span / Math.max(1, height);
}

export function releaseViewportPointer(ui) {
  const id = ui.activePointerId;
  // Clear before release: lostpointercapture can be delivered reentrantly.
  ui.activePointerId = null;
  if (id != null && ui.interactionElement.hasPointerCapture?.(id)) ui.interactionElement.releasePointerCapture(id);
  ui.pointerHit = false;
  ui.canvas.classList.remove("dragging");
  if (ui.interactionElement.style) ui.interactionElement.style.cursor = "default";
}
