export const MONITOR_WIDGETS = [
  "base_prompt",
  "target_profile",
  "target_width",
  "target_height",
  "duration_seconds",
  "target_fps",
];

const NUMERIC_WIDGETS = new Set([
  "target_width", "target_height", "duration_seconds", "target_fps",
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
