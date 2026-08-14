import { api as p } from "../../scripts/api.js";
import { t as c } from "./omnicam-i18n.js";
async function f(a) {
  const t = a.root.querySelector('[data-role="setup-badge"]'), r = a.root.querySelector('[data-role="setup-issues"]');
  if (!t || !r) return;
  let i;
  try {
    const e = await p.fetchApi("/majoor/omnicam/capabilities");
    if (!e.ok) return;
    i = await e.json();
  } catch {
    return;
  }
  a.adapterCapabilities = i;
  const s = i.diagnostic?.issues || [];
  if (t.hidden = !1, !s.length) {
    t.className = "setup-badge ok", t.textContent = c("Adapters ready"), r.innerHTML = "";
    return;
  }
  const l = s.some((e) => e.severity === "error");
  t.className = `setup-badge ${l ? "error" : "warn"}`, t.textContent = c(`${s.length} adapter${s.length === 1 ? "" : "s"} missing`), r.innerHTML = "";
  for (const e of s) {
    const o = document.createElement("div");
    o.className = "setup-issue";
    const d = document.createElement("span");
    if (d.textContent = `• ${e.message} `, o.appendChild(d), e.docs) {
      const n = document.createElement("a");
      n.href = e.docs, n.target = "_blank", n.rel = "noopener noreferrer", n.textContent = c("Setup docs"), o.appendChild(n);
    }
    r.appendChild(o);
  }
}
export {
  f as refreshSetupDiagnostic
};
