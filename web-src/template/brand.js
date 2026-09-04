// Shared OmniCam identity used by the Director and Monitor headers.

// Concentric twin of web/assets/omnicam-icon.svg: navy disc, light ring, violet
// core. Same proportions as the registry icon and the on-canvas node mark.
const MARK = `<svg class="oc-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle class="oc-mark-disc" cx="16" cy="16" r="16"/><circle class="oc-mark-ring" cx="16" cy="16" r="7.6"/><circle class="oc-mark-core" cx="16" cy="16" r="5.8"/></svg>`;

export function brandMarkup(title) {
  return `<div class="oc-heading"><span class="oc-brand">${MARK}</span><span class="oc-title">${title}</span></div>`;
}
