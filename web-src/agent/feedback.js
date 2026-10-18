// Agent feedback has no estimated percentage: the provider returns whole actions.
export function updateAgentFeedback(root, { text = "", tone = "info", busy = false } = {}) {
  const hint = root.querySelector('[data-role="agent-hint"]');
  const progress = root.querySelector('[data-role="agent-progress"]');
  if (hint) {
    hint.textContent = text;
    hint.dataset.tone = tone;
  }
  if (!progress) return;
  progress.hidden = !busy && tone !== "success";
  progress.dataset.busy = String(busy);
  progress.dataset.tone = tone;
  progress.setAttribute("aria-label", text);
  if (busy) progress.removeAttribute("aria-valuenow");
  else progress.setAttribute("aria-valuenow", "100");
}
