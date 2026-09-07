// Text-only capability badges for reconstruction provider options. Every string
// here is inserted with textContent, never innerHTML.

export function providerBadge(cap) {
  if (!cap) return { text: "Unknown", tone: "muted", title: "" };
  if (cap.available) {
    return { text: "Ready", tone: "ok", title: cap.reason || "" };
  }
  return { text: "Unavailable", tone: "warn", title: cap.reason || "Not available on this system" };
}

// VGGT-Omega must always read as research / non-commercial.
export function vggtOmegaBadge(cap) {
  const meta = cap?.metadata || {};
  return {
    text: "VGGT-Ω — Research / noncommercial",
    tone: "warn",
    title:
      meta.license_label ||
      "FAIR Noncommercial Research License — never auto-selected",
  };
}

export function sam3dBadge(cap) {
  if (cap?.available) return { text: "SAM3D ready", tone: "ok", title: cap.reason || "" };
  return {
    text: "SAM3D unavailable",
    tone: "muted",
    title:
      cap?.reason ||
      "SAM 3D Objects needs Linux + an NVIDIA GPU with ≥32 GB VRAM. Blockout and Scan work without it.",
  };
}

// Apply a badge to a DOM element without any HTML injection.
export function paintBadge(el, badge) {
  if (!el) return;
  el.textContent = badge.text;
  el.dataset.tone = badge.tone;
  if (badge.title) el.title = badge.title;
  else el.removeAttribute("title");
}
