// CharacterRigOverlay: pooled DOM dots over the WebGL canvas, one per *mapped
// canonical joint* of the character being pose-edited (design spec section
// 25). It shows only canonical joints -- never raw helper / twist / finger
// bones -- and clicking a dot sets the transient character_joint subSelection.
// Only drawn for the selected Character while Pose mode is on.

import { REQUIRED_JOINTS } from "./rig-profile.js";

export function createRigOverlay(ui, options = {}) {
  const host = options.container || ui.root?.querySelector(".viewport-wrap") || ui.root;
  const layer = document.createElement("div");
  layer.className = "oc-rig-overlay";
  host?.appendChild(layer);

  const pool = new Map(); // jointId -> button

  function dotFor(jointId) {
    let dot = pool.get(jointId);
    if (!dot) {
      dot = document.createElement("button");
      dot.type = "button";
      dot.className = "oc-rig-dot";
      dot.dataset.joint = jointId;
      dot.title = jointId;
      dot.addEventListener("click", (event) => {
        event.stopPropagation();
        options.onPick?.(jointId);
      });
      layer.appendChild(dot);
      pool.set(jointId, dot);
    }
    return dot;
  }

  function update() {
    const active = options.isActive?.();
    if (!active || !ui.webgl?.projectWorldToScreen) {
      layer.hidden = true;
      return;
    }
    layer.hidden = false;
    const { objectId, boneMap, selectedJoint } = active;
    const runtime = ui.characterRuntime;
    const shown = new Set();

    for (const joint of REQUIRED_JOINTS) {
      const boneName = boneMap?.[joint];
      if (!boneName) continue;
      const bone = runtime?.getJointWorldTransform?.(objectId, joint, boneMap)
        || ui.webgl.resolveModelBone?.(objectId, boneName);
      if (!bone?.world) continue;
      const screen = ui.webgl.projectWorldToScreen(bone.world);
      if (!screen || screen.behind) continue;
      const dot = dotFor(joint);
      dot.hidden = false;
      dot.classList.toggle("selected", joint === selectedJoint);
      dot.style.transform = `translate(-50%, -50%) translate(${Math.round(screen.x)}px, ${Math.round(screen.y)}px)`;
      shown.add(joint);
    }
    for (const [joint, dot] of pool) if (!shown.has(joint)) dot.hidden = true;
  }

  update();
  return {
    update,
    dispose() {
      layer.remove();
      pool.clear();
    },
  };
}
