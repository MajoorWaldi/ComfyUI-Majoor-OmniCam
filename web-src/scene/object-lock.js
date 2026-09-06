// The single object-lock toggle.
//
// A leaf module on purpose: the outliner rows, the inspector button and the
// viewport bindings all reach for this, and objects.js re-exports outliner.js,
// so hanging it off either one would close an import cycle.

export function toggleObjectLock(ui, object) {
  if (!object) return;
  ui.checkpoint?.("Toggle object lock");
  object.locked = !object.locked;
  ui.serialize?.();
  ui.refreshObjects?.();
  ui.refreshInspector?.();
  ui.render?.();
}
