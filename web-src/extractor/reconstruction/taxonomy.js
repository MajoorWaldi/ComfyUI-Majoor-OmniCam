// Default interior blockout taxonomy. Mirrors
// omnicam/reconstruction/segmentation/taxonomy.py DEFAULT_BLOCKOUT_LABELS.

export const DEFAULT_BLOCKOUT_LABELS = [
  "person",
  "chair",
  "armchair",
  "sofa",
  "table",
  "desk",
  "bed",
  "cabinet",
  "shelf",
  "counter",
  "door",
  "window",
  "television",
  "monitor",
  "lamp",
  "plant",
  "bottle",
  "box",
  "suitcase",
  "car",
];

// De-duplicate (case-insensitively), preserving order; empty list -> defaults.
export function resolveSemanticLabels(labels) {
  if (!labels || labels.length === 0) return [...DEFAULT_BLOCKOUT_LABELS];
  const seen = new Set();
  const out = [];
  for (const raw of labels) {
    const label = String(raw).trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out.length ? out : [...DEFAULT_BLOCKOUT_LABELS];
}

export function labelsToText(labels) {
  return resolveSemanticLabels(labels).join(", ");
}

export function textToLabels(text) {
  return String(text || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
