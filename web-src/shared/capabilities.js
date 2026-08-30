export async function fetchOmniCamCapabilities(client, { signal } = {}) {
  if (!client?.fetchApi) throw new TypeError("A ComfyUI API client is required");
  const response = await client.fetchApi("/majoor/omnicam/capabilities", { signal });
  if (!response.ok) throw new Error(`Capabilities request failed (${response.status || "unknown"})`);
  return response.json();
}
