// Provider capabilities loader and selector population.
//
// Reads capabilities once from /majoor/omnicam/reconstruction/capabilities.
// Never triggers a reconstruction run to probe.

export async function loadReconstructionCapabilities(
  client,
  { selectElement = null, statusElement = null } = {}
) {
  const caps = await client.capabilities();
  const providers = Array.isArray(caps?.providers) ? caps.providers : [];
  const recommended = caps?.recommended_provider || (providers[0]?.provider_id ?? "");

  if (selectElement) {
    if (typeof selectElement.replaceChildren === "function") {
      selectElement.replaceChildren();
    } else if (Array.isArray(selectElement.options)) {
      selectElement.options.length = 0;
    }

    for (const p of providers) {
      let opt;
      if (typeof document !== "undefined" && typeof document.createElement === "function") {
        opt = document.createElement("option");
      } else {
        opt = { value: "", textContent: "", disabled: false };
      }
      opt.value = p.provider_id;
      opt.textContent = p.available
        ? (p.name || p.provider_id)
        : `${p.name || p.provider_id} (Unavailable)`;
      opt.disabled = !p.available;

      if (typeof selectElement.appendChild === "function") {
        selectElement.appendChild(opt);
      } else if (Array.isArray(selectElement.options)) {
        selectElement.options.push(opt);
      }
    }

    if (recommended) {
      selectElement.value = recommended;
    }
  }

  const activeProviderId = selectElement?.value || recommended;
  const activeProvider = providers.find((p) => p.provider_id === activeProviderId);

  if (statusElement) {
    if (activeProvider && !activeProvider.available) {
      statusElement.textContent = activeProvider.reason || "Provider unavailable";
      statusElement.hidden = false;
    } else {
      statusElement.textContent = "";
      statusElement.hidden = true;
    }
  }

  return {
    capabilities: caps,
    recommended,
    providers,
  };
}
