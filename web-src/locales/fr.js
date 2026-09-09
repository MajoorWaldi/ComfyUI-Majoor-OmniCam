// French catalogue for the OmniCam Director UI.
//
// Keys are the English source strings passed to t(). Industry-standard terms
// that French CG/VFX crews use in English (playblast, keyframe handles, Bézier,
// FOV, gizmo, transform) are kept as-is on purpose.
//
// `npm run check:locales` fails if a key here no longer exists in the source.
import { FR_BASE } from "./fr/base.js";
import { FR_EDITOR } from "./fr/editor.js";

export const FR = {
  ...FR_BASE,
  ...FR_EDITOR,
};

export default FR;
