// Setup diagnostic: fetch adapter capabilities and render the Output-menu badge.

import { api } from "../../scripts/api.js";
import { t } from "./omnicam-i18n.js";

export async function refreshSetupDiagnostic(ui) {
  const badge = ui.root.querySelector('[data-role="setup-badge"]');
  const issuesBox = ui.root.querySelector('[data-role="setup-issues"]');
  if (!badge || !issuesBox) return;
  let payload;
  try {
    const response = await api.fetchApi("/majoor/omnicam/capabilities");
    if (!response.ok) return;
    payload = await response.json();
  } catch {
    return; // diagnostic is best-effort; never break the editor
  }
  ui.adapterCapabilities = payload;
  const issues = payload.diagnostic?.issues || [];
  badge.hidden = false;
  if (!issues.length) {
    badge.className = "setup-badge ok";
    badge.textContent = t("Adapters ready");
    issuesBox.innerHTML = "";
    return;
  }
  const hasError = issues.some((issue) => issue.severity === "error");
  badge.className = `setup-badge ${hasError ? "error" : "warn"}`;
  badge.textContent = t(`${issues.length} adapter${issues.length === 1 ? "" : "s"} missing`);
  issuesBox.innerHTML = "";
  for (const issue of issues) {
    const line = document.createElement("div");
    line.className = "setup-issue";
    const label = document.createElement("span");
    label.textContent = `• ${issue.message} `;
    line.appendChild(label);
    if (issue.docs) {
      const link = document.createElement("a");
      link.href = issue.docs;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = t("Setup docs");
      line.appendChild(link);
    }
    issuesBox.appendChild(line);
  }
}
