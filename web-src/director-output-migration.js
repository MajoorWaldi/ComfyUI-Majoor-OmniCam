// Workflow migration for the compact four-output Director contract.

const DIRECTOR_CLASS = "MajoorOmniCamDirector";
const OUTPUTS = [
  ["camera_track", "MAJOOR_OMNICAM_TRACK"],
  ["proxy_video", "VIDEO"],
  ["audio", "AUDIO"],
  ["shot_collection", "MAJOOR_OMNICAM_SHOT_COLLECTION"],
];

function linkFields(link) {
  return Array.isArray(link)
    ? { id: link[0], originId: link[1], originSlot: link[2], targetId: link[3], targetSlot: link[4] }
    : { id: link?.id, originId: link?.origin_id ?? link?.originId, originSlot: link?.origin_slot ?? link?.originSlot, targetId: link?.target_id ?? link?.targetId, targetSlot: link?.target_slot ?? link?.targetSlot };
}

function setOriginSlot(link, slot) {
  if (Array.isArray(link)) link[2] = slot;
  else if ("origin_slot" in link) link.origin_slot = slot;
  else link.originSlot = slot;
}

export function migrateDirectorOutputs(graphData) {
  if (!Array.isArray(graphData?.nodes) || !Array.isArray(graphData?.links)) return graphData;
  const nodesById = new Map(graphData.nodes.map((node) => [node.id, node]));
  const removedLinkIds = new Set();

  for (const node of graphData.nodes) {
    if (node?.type !== DIRECTOR_CLASS || !Array.isArray(node.outputs)) continue;
    const oldNames = node.outputs.map((output) => String(output?.name || ""));
    const newIndexByName = new Map(OUTPUTS.map(([name], index) => [name, index]));
    const linksByOutput = OUTPUTS.map(() => []);

    for (const link of graphData.links) {
      const fields = linkFields(link);
      if (fields.originId !== node.id) continue;
      const oldName = oldNames[fields.originSlot];
      const newSlot = newIndexByName.get(oldName);
      if (newSlot == null) {
        removedLinkIds.add(fields.id);
        const targetInput = nodesById.get(fields.targetId)?.inputs?.[fields.targetSlot];
        if (targetInput?.link === fields.id) targetInput.link = null;
      } else {
        setOriginSlot(link, newSlot);
        linksByOutput[newSlot].push(fields.id);
      }
    }
    node.outputs = OUTPUTS.map(([name, type], index) => ({
      name,
      type,
      links: linksByOutput[index].length ? linksByOutput[index] : null,
      slot_index: index,
    }));
  }
  graphData.links = graphData.links.filter((link) => !removedLinkIds.has(linkFields(link).id));
  return graphData;
}
