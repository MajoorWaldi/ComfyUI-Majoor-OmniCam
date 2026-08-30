// Shared OmniCam identity used by the Director and Monitor headers.

const MARK = `<svg class="oc-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle class="oc-mark-ring" cx="16" cy="16" r="10"/><circle class="oc-mark-core" cx="16" cy="16" r="3.5"/></svg>`;

export function brandMarkup(title) {
  return `<div class="oc-heading"><span class="oc-brand">${MARK}</span><span class="oc-title">${title}</span></div>`;
}
