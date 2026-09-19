export const MONITOR_WIDGETS = [
  "base_prompt",
  "target_profile",
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps",
  "guide_reference_index",
  "guide_style",
  "reference_plan_json",
];

export function hideMonitorParameters(node) {
  for (const item of node.widgets || []) {
    if (!MONITOR_WIDGETS.includes(item.name)) continue;
    item.computeSize = () => [0, -4];
    item.draw = () => {};
    item.hidden = true;
    item.options = { ...(item.options || {}), hideInVueNodes: true };
  }
}

const NUMERIC_WIDGETS = new Set([
  "target_width", "target_height", "duration_seconds", "target_fps", "guide_reference_index",
]);

function widget(node, name) {
  return node?.widgets?.find((item) => item.name === name);
}

export function monitorWidgetValues(node) {
  return Object.fromEntries(MONITOR_WIDGETS.map((name) => [name, widget(node, name)?.value]));
}

export function writeMonitorWidget(node, name, value) {
  if (!MONITOR_WIDGETS.includes(name)) return false;
  const item = widget(node, name);
  if (!item) return false;
  item.value = NUMERIC_WIDGETS.has(name) ? Number(value) : value;
  item.callback?.(item.value);
  return true;
}

// The H3-Setup guidance (moved here from Director's header menu, Director
// modal audit Lot 2) only makes sense for the h3_* profile family.
export function isH3Profile(profile) {
  return String(profile || "").startsWith("h3_");
}
