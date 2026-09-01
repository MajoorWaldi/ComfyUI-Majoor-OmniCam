// LiteGraph moved graph.links to a Map.  Older ComfyUI builds still expose an
// indexed collection, so keep that compatibility at this one boundary.

export function graphLink(graph, linkRef) {
  if (!graph || linkRef == null) return null;
  if (typeof linkRef === "object") return linkRef;
  const links = graph.links;
  return links?.get?.(linkRef) ?? links?.[linkRef] ?? null;
}

export function linkedOrigin(graph, linkRef) {
  const link = graphLink(graph, linkRef);
  const originId = link?.origin_id ?? link?.originId;
  if (originId == null) return null;
  const node = graph?.getNodeById?.(originId);
  if (node) return node;
  return (graph?._nodes || graph?.nodes || []).find((candidate) => String(candidate?.id) === String(originId)) ?? null;
}
