// ComfyUI supplies these CSS variables on the page and updates them on theme change.
// Fallbacks keep the standalone editor/test harness usable without a Comfy host.
export const HOST_THEME_VARS = `
  --oc-bg-app: var(--bg-color, #0B1018);
  --oc-bg-panel: var(--comfy-menu-bg, #111827);
  --oc-bg-control: var(--comfy-input-bg, #151D2A);
  --oc-bg-sunken: var(--comfy-input-bg, #080C14);
  --oc-border-default: var(--border-color, #263143);
  --oc-border-subtle: var(--border-color, #1B2433);
  --oc-text-primary: var(--input-text, #E9EDF5);
  --oc-text-secondary: var(--input-text, #8F9AAF);
  --oc-text-muted: var(--input-text, #98A3B8);
`;
