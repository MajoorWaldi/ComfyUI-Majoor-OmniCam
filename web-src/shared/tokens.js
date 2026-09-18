// Shared Design System Tokens for OmniCam Suite (Director, Extractor, Monitor)
// Canonical baseline preserved for Extractor/Monitor; DCC extensions for Director

export const TOKENS = Object.freeze({
  // Canonical Baseline Surfaces & Chrome (tested by monitor-style-parity)
  bgApp: "#0B1018",
  bgPanel: "#111827",
  bgControl: "#151D2A",
  bgSunken: "#080C14",
  borderDefault: "#263143",
  borderSubtle: "#1B2433",

  // Typography
  textPrimary: "#E9EDF5",
  textSecondary: "#8F9AAF",
  textMuted: "#98A3B8",

  // States
  accent: "#5B7CFF",
  accentSoft: "rgba(91, 124, 255, 0.16)",
  accentHover: "#728FFF",
  accentInk: "#ffffff",
  success: "#42D7A1",
  successSoft: "rgba(66, 215, 161, 0.16)",
  warning: "#F3B34C",
  warningSoft: "rgba(243, 179, 76, 0.16)",
  error: "#ED6B73",
  errorSoft: "rgba(237, 107, 115, 0.16)",

  // DCC Studio Palette Extensions (Dark Neutral Zinc/Slate, Zero Blue Tint)
  dccBgWorkspace: "#121214",
  dccBgPanel: "#18181b",
  dccBgControl: "#222226",
  dccBgSunken: "#0d0d0f",
  dccBorder: "#2e2e34",
  dccBorderSubtle: "#232328",
  dccAccent: "#2563eb",
  dccAccentHover: "#3b82f6",

  // Universal 3D DCC Axes (Red X, Green Y, Blue Z)
  axisX: "#ef4444",
  axisY: "#22c55e",
  axisZ: "#3b82f6",

  // Animation Channel Key States (Maya / Blender standard)
  keyActive: "#eab308",
  keyPassive: "#22c55e",
  keyModified: "#f97316",
  keyNone: "#52525b",

  // Semantic Type Colors (Outliner, Timeline Keyframes, Gizmos)
  typeCamera: "#5B7CFF",
  typeLookAt: "#F3B34C",
  typeLens: "#A78BFA",
  typeRoll: "#F472B6",
  typeCuts: "#56B6C2",
  typeTrackPoints: "#42D7A1",
  typeGeometry: "#94A3B8",
  typeLight: "#F3B34C",
  typePointCloud: "#818CF8",
  typeReferenceCard: "#38BDF8",
  typeGroundPlane: "#475569",
  typeError: "#ED6B73",
});

export const CSS_TOKEN_VARS = `
  --oc-bg-app: ${TOKENS.bgApp};
  --oc-bg-panel: ${TOKENS.bgPanel};
  --oc-bg-control: ${TOKENS.bgControl};
  --oc-bg-sunken: ${TOKENS.bgSunken};
  --oc-border-default: ${TOKENS.borderDefault};
  --oc-border-subtle: ${TOKENS.borderSubtle};

  --oc-text-primary: ${TOKENS.textPrimary};
  --oc-text-secondary: ${TOKENS.textSecondary};
  --oc-text-muted: ${TOKENS.textMuted};

  --oc-accent: ${TOKENS.accent};
  --oc-accent-soft: ${TOKENS.accentSoft};
  --oc-accent-hover: ${TOKENS.accentHover};
  --oc-accent-ink: ${TOKENS.accentInk};
  --oc-success: ${TOKENS.success};
  --oc-success-soft: ${TOKENS.successSoft};
  --oc-warning: ${TOKENS.warning};
  --oc-warning-soft: ${TOKENS.warningSoft};
  --oc-error: ${TOKENS.error};
  --oc-error-soft: ${TOKENS.errorSoft};

  --oc-axis-x: ${TOKENS.axisX};
  --oc-axis-y: ${TOKENS.axisY};
  --oc-axis-z: ${TOKENS.axisZ};
  --oc-key-active: ${TOKENS.keyActive};
  --oc-key-passive: ${TOKENS.keyPassive};
  --oc-key-modified: ${TOKENS.keyModified};
  --oc-key-none: ${TOKENS.keyNone};

  --oc-type-camera: ${TOKENS.typeCamera};
  --oc-type-lookat: ${TOKENS.typeLookAt};
  --oc-type-lens: ${TOKENS.typeLens};
  --oc-type-roll: ${TOKENS.typeRoll};
  --oc-type-cuts: ${TOKENS.typeCuts};
  --oc-type-trackpoints: ${TOKENS.typeTrackPoints};
  --oc-type-geometry: ${TOKENS.typeGeometry};
  --oc-type-light: ${TOKENS.typeLight};
  --oc-type-pointcloud: ${TOKENS.typePointCloud};
  --oc-type-referencecard: ${TOKENS.typeReferenceCard};
  --oc-type-groundplane: ${TOKENS.typeGroundPlane};
  --oc-type-error: ${TOKENS.typeError};

  /* Compatibility aliases mapping old vars to new unified tokens */
  --oc-bg: var(--oc-bg-app);
  --oc-panel: var(--oc-bg-panel);
  --oc-panel-2: var(--oc-bg-control);
  --oc-sunken: var(--oc-bg-sunken);
  --oc-line: var(--oc-border-default);
  --oc-line-soft: var(--oc-border-subtle);
  --oc-text: var(--oc-text-primary);
  --oc-text-dim: var(--oc-text-secondary);
  --oc-text-faint: var(--oc-text-muted);
  --oc-ok: var(--oc-success);
  --oc-ok-bg: var(--oc-success-soft);
  --oc-ok-line: var(--oc-success);
  --oc-ok-text: var(--oc-success);
  --oc-warn: var(--oc-warning);
  --oc-warn-bg: var(--oc-warning-soft);
  --oc-warn-line: var(--oc-warning);
  --oc-warn-text: var(--oc-warning);
  --oc-danger: var(--oc-error);
  --oc-danger-bg: var(--oc-error-soft);
  --oc-danger-line: var(--oc-error);
  --oc-danger-text: var(--oc-error);
`;
