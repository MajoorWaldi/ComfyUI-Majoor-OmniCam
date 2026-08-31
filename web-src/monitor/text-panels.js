/**
 * One prompt, and diagnostics behind a disclosure.
 *
 * Four peer tabs -- Cinematography, Camera Prompt, Final Prompt, Camera Data --
 * read as four equally important results, when only one of them is the thing
 * that leaves the node. Worse, `cinematography` was never folded into
 * `final_prompt` at all, so the panel advertised a result the graph ignored.
 */

const DIAGNOSTIC_ROLES = ["camera-prompt", "cinematography", "camera-data"];

function textFor(snapshot, role) {
  const text = snapshot?.text || {};
  if (role === "camera-data") {
    return JSON.stringify({ contract: text.contract || {}, ...(text.camera_data || {}) }, null, 2);
  }
  return String(text[role.replaceAll("-", "_")] || "");
}

function promptNote(snapshot) {
  const text = snapshot?.text || {};
  const budget = text.contract?.max_prompt_characters;
  const length = String(text.final_prompt || "").length;
  if (!budget) return `${length} chars`;
  return `${length} / ${budget} chars`;
}

async function copyText(value) {
  try {
    if (globalThis.navigator?.clipboard?.writeText) return await globalThis.navigator.clipboard.writeText(value);
    const area = document.createElement("textarea");
    area.value = value; area.style.position = "fixed"; area.style.opacity = "0";
    document.body.appendChild(area); area.select(); document.execCommand?.("copy"); area.remove();
  } catch (error) {
    console.warn("OmniCam clipboard copy failed:", error);
  }
}

export function bindTextPanels(root) {
  let active = "camera-prompt";
  let snapshot = null;
  let resetTimer = null;

  const select = (role) => {
    active = role;
    for (const name of DIAGNOSTIC_ROLES) {
      const pane = root.querySelector(`[data-role="${name}"]`);
      if (pane) pane.hidden = name !== role;
    }
    for (const tab of root.querySelectorAll("[data-tab]")) {
      tab.setAttribute("aria-selected", String(tab.dataset.tab === role));
    }
  };
  for (const tab of root.querySelectorAll("[data-tab]")) {
    tab.addEventListener("click", () => select(tab.dataset.tab));
  }

  const button = root.querySelector('[data-act="copy-text"]');
  // COPY always means the prompt that actually leaves the node.
  const copy = async () => {
    await copyText(String(snapshot?.text?.final_prompt || ""));
    button.textContent = "COPIED";
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { button.textContent = "COPY"; }, 1200);
  };
  button.addEventListener("click", copy);

  return {
    render(value) {
      snapshot = value;
      root.querySelector('[data-role="final-prompt"]').textContent = textFor(snapshot, "final-prompt");
      const note = root.querySelector('[data-role="prompt-note"]');
      if (note) note.textContent = promptNote(snapshot);
      for (const role of DIAGNOSTIC_ROLES) {
        const pane = root.querySelector(`[data-role="${role}"]`);
        if (pane) pane.textContent = textFor(snapshot, role);
      }
    },
    dispose() {
      clearTimeout(resetTimer);
      button.removeEventListener("click", copy);
    },
  };
}
