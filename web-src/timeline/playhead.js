// The lower deck draws one logical playhead in four places: the triangle head
// on the ruler, the line crossing the dope sheet lanes, and one line per lane
// in the graph editor's Dope Sheet tab.
//
// They are updated together so a scrub never leaves one of them behind, and
// they all read their position from timelinePercentForFrame() -- the previous
// fast path recomputed it as frame/lastFrame, which put the playhead in the
// wrong place on any zoomed or panned timeline.

import { timelinePercentForFrame } from "../timeline-interaction.js";

function place(element, percent) {
  const visible = percent >= -1 && percent <= 101;
  element.style.display = visible ? "" : "none";
  if (visible) element.style.left = `${percent}%`;
}

export function updatePlayhead(ui) {
  const percent = timelinePercentForFrame(ui, ui.frame);
  for (const selector of [".oc-playhead-head", '[data-role="dope-playhead"]', ".oc-gdope-playhead", ".oc-sequence-playhead"]) {
    for (const element of ui.root.querySelectorAll(selector)) place(element, percent);
  }
}
