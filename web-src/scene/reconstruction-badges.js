// Confidence badges and reconstruction appearance controls for Director scene objects.

export function reconstructionBadge(object) {
  if (!object?.reconstruction) return null;

  const conf =
    object.reconstruction.confidence != null
      ? Number(object.reconstruction.confidence)
      : 1.0;

  // Thresholds mirror confidence_band() in omnicam/reconstruction/confidence.py
  // so a score never reads as one tier in the badge and another server-side.
  let band = "low";
  let label = "Low";
  if (conf >= 0.75) {
    band = "high";
    label = "High";
  } else if (conf >= 0.45) {
    band = "medium";
    label = "Medium";
  }

  const provider = object.reconstruction.provider || "Reconstructed";
  const pct = Math.round(conf * 100);
  const title = `${provider} • ${label} (${pct}%)`;

  return {
    label,
    band,
    title,
    confidence: conf,
  };
}

export function getReconstructionAppearance(state) {
  return state?.reconstruction_appearance || "neutral";
}

export function setReconstructionAppearance(ui, appearance) {
  if (!ui) return;
  if (!ui.state) ui.state = {};
  ui.state.reconstruction_appearance =
    appearance === "source_texture" ? "source_texture" : "neutral";
  ui.serialize?.();
  ui.render?.();
}

