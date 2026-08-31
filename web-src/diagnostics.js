// Setup diagnostic: fetch adapter capabilities and render the Output-menu badge.

import { api } from "../../scripts/api.js";
import { t } from "./i18n.js";
import { fetchOmniCamCapabilities } from "./shared/capabilities.js";
import { setupBadgeModel } from "./shared/setup-diagnostic.js";

export async function refreshSetupDiagnostic(ui) {
  const badge = ui.root.querySelector('[data-role="setup-badge"]');
  const issuesBox = ui.root.querySelector('[data-role="setup-issues"]');
  if (!badge || !issuesBox) return;
  let payload;
  try {
    payload = await fetchOmniCamCapabilities(api);
  } catch {
    return; // diagnostic is best-effort; never break the editor
  }
  ui.adapterCapabilities = payload;
  const issues = payload.diagnostic?.issues || [];
  const badgeModel = setupBadgeModel(issues);
  badge.hidden = false;
  if (!issues.length) {
    badge.className = `setup-badge ${badgeModel.tone}`;
    badge.textContent = t("Core ready");
    issuesBox.innerHTML = "";
    return;
  }
  badge.className = `setup-badge ${badgeModel.tone}`;
  badge.textContent = issues.length === 1
    ? t("1 optional adapter issue")
    : t("{count} optional adapter issues").replace("{count}", String(issues.length));
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
