// Thin fetch client for the OmniCam Agent v1 provider configuration routes
// (design spec section 13). Used by the Settings credential UI and the
// Director Agent panel; never touches ui.state or a MotionScene.
//
// The credential itself only ever flows one way, from a password input
// straight into setCredential()'s request body -- never read back, never
// logged, never routed through ComfyUI's own setting store.

function providerPath(providerId, suffix) {
  return `/majoor/omnicam/agent/v1/providers/${encodeURIComponent(providerId)}${suffix}`;
}

async function requestJson(api, method, path, body) {
  const response = await api.fetchApi(path, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let parsed = null;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  if (response.ok === false) {
    const code = parsed?.error?.code || `HTTP_${response.status || 0}`;
    const message = parsed?.error?.message || `OmniCam Agent provider request failed (${response.status})`;
    const error = new Error(message);
    error.code = code;
    error.status = response.status || 0;
    throw error;
  }

  return parsed ?? {};
}

export async function listProviders(api) {
  const result = await requestJson(api, "GET", "/majoor/omnicam/agent/v1/providers");
  return result.providers || [];
}

export async function getProviderStatus(api, providerId) {
  return requestJson(api, "GET", providerPath(providerId, "/status"));
}

export async function setProviderCredential(api, providerId, secret) {
  try {
    return await requestJson(api, "PUT", providerPath(providerId, "/credential"), { secret });
  } finally {
    // The caller's own input element should already have been cleared before
    // this resolves; this reference is dropped regardless of outcome so a
    // failed request cannot leave the secret sitting in a retained closure.
    secret = null; // eslint-disable-line no-param-reassign
  }
}

export async function deleteProviderCredential(api, providerId) {
  return requestJson(api, "DELETE", providerPath(providerId, "/credential"));
}

export async function testProvider(api, providerId, config) {
  return requestJson(api, "POST", providerPath(providerId, "/test"), config || {});
}

export async function listProviderModels(api, providerId, config) {
  const result = await requestJson(api, "POST", providerPath(providerId, "/models"), config || {});
  return result.models || [];
}
