// Editing a waypoint gives the transform and curve handles visual priority.
export function keyEditDisplay(active, selectedFrame) {
  const editing = active && selectedFrame != null;
  return {
    editing,
    pointRadius: editing ? 0.065 : 0.17,
    pathOpacity: editing ? 0.45 : active ? 1 : 0.55,
    showGlow: active && !editing,
  };
}
