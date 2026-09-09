// Pure client-side filtering for the Asset Browser grid.
//
// Mirrors omnicam/assets/catalog.py `_matches` so a loaded page can be narrowed
// without another round trip. No DOM, no i18n -- the panel maps tab ids to
// labels itself.

export const KIND_TABS = Object.freeze(["all", "character", "prop", "environment", "vehicle"]);

export function normalizeFilter(raw = {}) {
  const kind = String(raw.kind || "all").toLowerCase();
  return {
    kind: KIND_TABS.includes(kind) ? kind : "all",
    tag: String(raw.tag || "").trim().toLowerCase(),
    search: String(raw.search || "").trim().toLowerCase(),
  };
}

function haystackHit(definition, needle) {
  if (!needle) return true;
  const id = String(definition.id || "").toLowerCase();
  const name = String(definition.name || "").toLowerCase();
  if (id.includes(needle) || name.includes(needle)) return true;
  const kind = String(definition.kind || "").toLowerCase();
  const category = String(definition.category || "").toLowerCase();
  if (kind.includes(needle) || category.includes(needle)) return true;
  return (definition.tags || []).some((tag) => String(tag).toLowerCase().includes(needle));
}

export function matchesFilter(definition, filter) {
  const normalized = normalizeFilter(filter);
  if (normalized.kind !== "all" && String(definition.kind).toLowerCase() !== normalized.kind) {
    return false;
  }
  if (normalized.tag && !(definition.tags || []).map((t) => String(t).toLowerCase()).includes(normalized.tag)) {
    return false;
  }
  return haystackHit(definition, normalized.search);
}

export function filterDefinitions(definitions, filter) {
  const normalized = normalizeFilter(filter);
  return (definitions || []).filter((definition) => matchesFilter(definition, normalized));
}

/** Every distinct tag across a set of definitions, sorted, for a tag picker. */
export function collectTags(definitions) {
  const seen = new Set();
  for (const definition of definitions || []) {
    for (const tag of definition.tags || []) seen.add(String(tag).toLowerCase());
  }
  return [...seen].sort();
}
