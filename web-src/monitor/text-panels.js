function textFor(snapshot, role) {
  const text = snapshot?.text || {};
  if (role === "camera-data") return JSON.stringify(text.camera_data || {}, null, 2);
  return String(text[role.replaceAll("-", "_")] || "");
}

async function copyText(value) {
  if (globalThis.navigator?.clipboard?.writeText) return globalThis.navigator.clipboard.writeText(value);
  const area = document.createElement("textarea"); area.value = value; area.style.position = "fixed"; area.style.opacity = "0"; document.body.appendChild(area); area.select(); document.execCommand?.("copy"); area.remove();
}

export function bindTextPanels(root) {
  let active = "cinematography"; let snapshot = null; let resetTimer = null; const roles = ["cinematography", "camera-prompt", "final-prompt", "camera-data"];
  const select = (role) => { active = role; for (const name of roles) root.querySelector(`[data-role="${name}"]`).hidden = name !== role; for (const tab of root.querySelectorAll("[data-tab]")) tab.setAttribute("aria-selected", String(tab.dataset.tab === role)); root.querySelector('[data-act="copy-text"]').textContent = role === "camera-data" ? "COPY JSON" : "COPY"; };
  for (const tab of root.querySelectorAll("[data-tab]")) tab.addEventListener("click", () => select(tab.dataset.tab));
  const copy = async () => { const button = root.querySelector('[data-act="copy-text"]'); await copyText(textFor(snapshot, active)); button.textContent = "COPIED"; clearTimeout(resetTimer); resetTimer = setTimeout(() => { button.textContent = active === "camera-data" ? "COPY JSON" : "COPY"; }, 1200); }; root.querySelector('[data-act="copy-text"]').addEventListener("click", copy);
  return { render(value) { snapshot = value; for (const role of roles) root.querySelector(`[data-role="${role}"]`).textContent = textFor(snapshot, role); }, dispose() { clearTimeout(resetTimer); root.querySelector('[data-act="copy-text"]').removeEventListener("click", copy); } };
}
