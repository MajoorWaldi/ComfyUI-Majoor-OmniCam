// Provider capabilities loader and selector population.
//
// Reads capabilities once from /majoor/omnicam/reconstruction/capabilities
// Never triggers a reconstruction run to probe.

export async function loadReconstructionCapabilities(
  client,
  { selectElement = null, statusElement = null, checkpointSelectElement = null } = {}
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

  if (checkpointSelectElement) {
    if (typeof checkpointSelectElement.replaceChildren === "function") {
      checkpointSelectElement.replaceChildren();
    } else if (Array.isArray(checkpointSelectElement.options)) {
      checkpointSelectElement.options.length = 0;
    }

    const makeOption = (value, label) => {
      let opt;
      if (typeof document !== "undefined" && typeof document.createElement === "function") {
        opt = document.createElement("option");
      } else {
        opt = { value: "", textContent: "" };
      }
      opt.value = value;
      opt.textContent = label;
      return opt;
    };
    const addOption = (opt) => {
      if (typeof checkpointSelectElement.appendChild === "function") {
        checkpointSelectElement.appendChild(opt);
      } else if (Array.isArray(checkpointSelectElement.options)) {
        checkpointSelectElement.options.push(opt);
      }
    };

    // "Auto" always exists, even when the provider has no checkpoints list at
    // all (e.g. not comfy_moge) -- it just means "let the provider decide",
    // which is also the only option that ever worked before this selector.
    addOption(makeOption("auto", "Auto"));
    const checkpoints = Array.isArray(activeProvider?.metadata?.checkpoints)
      ? activeProvider.metadata.checkpoints
      : [];
    for (const name of checkpoints) {
      addOption(makeOption(name, name));
    }
    checkpointSelectElement.value = "auto";
  }

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
