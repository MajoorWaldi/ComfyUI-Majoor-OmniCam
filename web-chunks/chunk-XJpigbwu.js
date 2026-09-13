import { a, V as k, bw as ne, bx as J, by as b } from "./chunk-CHJZYkt6.js";
const re = "/majoor/omnicam/agent/v1/plan", ie = "/majoor/omnicam/agent/v1/apply-plan";
async function K(e, t, i, { signal: o } = {}) {
  const s = await e.fetchApi(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(i),
    signal: o
  });
  let f = null;
  try {
    f = await s.json();
  } catch {
    f = null;
  }
  if (s.ok === !1) {
    const w = f?.error?.code || `HTTP_${s.status || 0}`, P = f?.error?.message || `OmniCam Agent plan request failed (${s.status})`, d = new Error(P);
    throw d.code = w, d.status = s.status || 0, d;
  }
  return f ?? {};
}
async function ae(e, { sessionId: t, instruction: i, provider: o }, s) {
  return K(e, re, {
    session_id: t,
    instruction: i,
    provider: o
  }, s);
}
async function oe(e, t, i) {
  return K(e, ie, { plan_id: t }, i);
}
function $(e, t) {
  return `/majoor/omnicam/agent/v1/providers/${encodeURIComponent(e)}${t}`;
}
async function S(e, t, i, o) {
  const s = await e.fetchApi(i, {
    method: t,
    headers: o === void 0 ? void 0 : { "Content-Type": "application/json" },
    body: o === void 0 ? void 0 : JSON.stringify(o)
  });
  let f = null;
  try {
    f = await s.json();
  } catch {
    f = null;
  }
  if (s.ok === !1) {
    const w = f?.error?.code || `HTTP_${s.status || 0}`, P = f?.error?.message || `OmniCam Agent provider request failed (${s.status})`, d = new Error(P);
    throw d.code = w, d.status = s.status || 0, d;
  }
  return f ?? {};
}
async function se(e) {
  return (await S(e, "GET", "/majoor/omnicam/agent/v1/providers")).providers || [];
}
async function le(e, t) {
  return S(e, "GET", $(t, "/status"));
}
async function ce(e, t, i) {
  try {
    return await S(e, "PUT", $(t, "/credential"), { secret: i });
  } finally {
    i = null;
  }
}
async function de(e, t) {
  return S(e, "DELETE", $(t, "/credential"));
}
async function ue(e, t, i) {
  return S(e, "POST", $(t, "/test"), i || {});
}
async function fe(e, t, i) {
  return (await S(e, "POST", $(t, "/models"), i || {})).models || [];
}
const pe = {
  ollama: "Ollama",
  openai: "OpenAI",
  openai_compatible: "OpenAI-compatible",
  anthropic: "Anthropic"
};
function A(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
}
function ge(e) {
  if (!e || !e.closest) return null;
  const t = e.closest("[data-agent-act]");
  return t ? { action: t.dataset.agentAct } : null;
}
function ve(e) {
  return !e || !e.length ? `<li class="oc-asset-empty">${a("No visible changes")}</li>` : e.map((t) => `<li>${A(t.entity)} · ${A(t.field)}</li>`).join("");
}
function F(e) {
  const t = String(e || "").trim();
  if (!t) return !0;
  let i;
  try {
    i = new URL(t).hostname;
  } catch {
    return !1;
  }
  return i === "127.0.0.1" || i === "localhost" || i === "::1" || i === "[::1]";
}
function me(e) {
  const t = a(
    "Your instruction and the semantic scene information requested by the planner are sent to the configured model provider. Media files are not sent by Agent v1."
  );
  return e.provider === "ollama" ? F(e.baseUrl) ? a("Planning stays on the configured local Ollama endpoint.") : t : e.provider === "openai_compatible" && F(e.baseUrl) ? a("Planning stays on the configured local endpoint.") : t;
}
function V(e, t) {
  const i = Array.isArray(e) ? e : [];
  return i.length ? i.map((o) => `<option value="${A(o.id)}"${o.id === t ? " selected" : ""}>${A(o.label)}</option>`).join("") : `<option value="">${a("No providers found")}</option>`;
}
function Y(e, t) {
  const i = Array.isArray(e) ? [...e] : [];
  return t && !i.includes(t) && i.unshift(t), i.length ? i.map((o) => `<option value="${A(o)}"${o === t ? " selected" : ""}>${A(o)}</option>`).join("") : `<option value="">${a("No models found")}</option>`;
}
function he(e, t = {}) {
  const i = e.root, o = t.api || e.api || e.app?.api, s = (n) => i.querySelector(`[data-role="${n}"]`), f = s("agent-panel"), w = s("agent-hint"), P = s("agent-privacy-note"), d = s("agent-describe"), j = s("agent-plan"), m = s("agent-provider-select"), v = s("agent-model-select"), H = s("agent-provider-label"), O = s("agent-credential-status"), x = s("agent-credential-form"), C = s("agent-credential-input"), M = i.querySelector('[data-agent-act="preview"]'), N = i.querySelector('[data-agent-act="apply"]'), U = i.querySelector('[data-agent-act="cancel"]');
  let p = "idle", c = null, L = null, l = !1;
  function u(n) {
    w && (w.textContent = n || "");
  }
  function E() {
    const n = b();
    if (H) {
      const g = pe[n.provider] || n.provider;
      H.textContent = `${g} · ${n.model || a("(no model set)")}`;
    }
    P && (P.textContent = me(n));
    const r = p === "planning" || p === "applying";
    M && (M.disabled = r), N && (N.disabled = !c || r || c.truncated || p === "stale"), U && (U.disabled = !c), d && (d.disabled = r), j && (j.innerHTML = c ? ve(c.changes) : ""), p === "planning" ? u(a("Planning...")) : p === "applying" ? u(a("Applying...")) : p === "stale" ? u(a("The Director changed after this preview. Generate a new preview.")) : p === "preview_ready" && u(c?.description || "");
  }
  function y(n) {
    p = n, E();
  }
  async function I() {
    if (l || !O) return;
    const n = b();
    try {
      const r = await le(o, n.provider);
      if (l) return;
      r.configured ? O.textContent = r.source === "environment" ? a("Configured by server environment") : a("Configured") : O.textContent = a("Not configured");
    } catch {
      l || (O.textContent = a("Status unavailable"));
    }
  }
  async function z() {
    if (l || !m) return;
    const n = b();
    m.disabled = !0;
    try {
      const r = await se(o);
      if (l) return;
      m.innerHTML = V(r, n.provider);
    } catch {
      if (l) return;
      m.innerHTML = V([], n.provider);
    } finally {
      l || (m.disabled = !1);
    }
  }
  async function _() {
    if (l || !v) return;
    const n = b();
    v.disabled = !0, v.innerHTML = `<option value="">${a("Loading models...")}</option>`;
    try {
      const r = await fe(o, n.provider, { base_url: n.baseUrl });
      if (l) return;
      let g = n.model;
      !g && r.length && (g = r[0], k(J(n.provider), g)), v.innerHTML = Y(r, g), E();
    } catch {
      if (l) return;
      v.innerHTML = Y([], n.model);
    } finally {
      l || (v.disabled = !1);
    }
  }
  function B() {
    !v || !v.value || (k(J(b().provider), v.value), E());
  }
  function R() {
    !m || !m.value || (k(ne, m.value), E(), I(), _());
  }
  async function Q() {
    if (p === "planning" || p === "applying") return;
    const n = String(d?.value || "").trim();
    if (!n) return;
    const r = e.agentBridge?.sessionId;
    if (!r) {
      y("error"), u(a("Agent session is not ready yet."));
      return;
    }
    L?.abort?.();
    const g = typeof AbortController == "function" ? new AbortController() : null;
    L = g, c = null, y("planning");
    const T = b();
    try {
      const h = await ae(o, {
        sessionId: r,
        instruction: n,
        provider: {
          id: T.provider,
          model: T.model,
          base_url: T.baseUrl,
          max_output_tokens: T.maxOutputTokens,
          max_planner_steps: T.maxPlannerSteps,
          timeout_seconds: T.requestTimeoutSeconds
        }
      }, { signal: g?.signal });
      if (l || L !== g) return;
      if (h.finished) {
        c = null, y("idle"), u(h.message || a("The Agent finished without a change."));
        return;
      }
      c = {
        planId: h.plan_id,
        description: h.description,
        changes: h.changes || [],
        truncated: !!h.truncated
      }, y(c.truncated ? "error" : "preview_ready"), c.truncated && u(a("Preview was truncated; Apply is disabled for safety."));
    } catch (h) {
      if (l || h?.name === "AbortError") return;
      c = null, y("error"), u(h?.message || a("Preview failed"));
    }
  }
  async function W() {
    if (!c || p === "applying" || c.truncated) return;
    const n = c.planId;
    y("applying");
    try {
      if (await oe(o, n), l) return;
      c = null, y("idle"), u(a("Applied."));
    } catch (r) {
      if (l) return;
      if (r?.code === "STALE_PLAN") {
        c = null, y("stale");
        return;
      }
      y("error"), u(r?.message || a("Apply failed"));
    }
  }
  function X() {
    L?.abort?.(), c = null, y("idle"), u("");
  }
  function q(n) {
    x && (x.hidden = !n), n ? C?.focus?.() : C && (C.value = "");
  }
  async function Z() {
    const n = b(), r = C?.value || "";
    if (C && (C.value = ""), !r) {
      q(!1);
      return;
    }
    try {
      await ce(o, n.provider, r);
    } catch (g) {
      l || u(g?.message || a("Could not save the credential"));
    } finally {
      q(!1), await I(), await _();
    }
  }
  async function ee() {
    const n = b();
    try {
      await de(o, n.provider);
    } catch (r) {
      l || u(r?.message || a("Could not remove the credential"));
    } finally {
      await I(), await _();
    }
  }
  async function te() {
    const n = b();
    u(a("Testing..."));
    try {
      const r = await ue(o, n.provider, {
        model: n.model,
        base_url: n.baseUrl,
        timeout_seconds: n.requestTimeoutSeconds
      });
      if (l) return;
      u(r.ok ? a("Connection OK") : r.error?.message || a("Connection failed"));
    } catch (r) {
      l || u(r?.message || a("Connection failed"));
    }
  }
  function D() {
    d && (d.style.height = "auto", d.style.height = `${d.scrollHeight}px`);
  }
  function G(n) {
    const r = ge(n.target);
    if (r) {
      if (r.action === "preview") return void Q();
      if (r.action === "apply") return void W();
      if (r.action === "cancel") return X();
      if (r.action === "credential-replace") return q(x?.hidden !== !1);
      if (r.action === "credential-remove") return void ee();
      if (r.action === "credential-test") return void te();
      if (r.action === "credential-save") return void Z();
      if (r.action === "model-refresh") return void _();
    }
  }
  return f?.addEventListener("click", G), m?.addEventListener("change", R), v?.addEventListener("change", B), d?.addEventListener("input", D), E(), z(), I(), _(), {
    get state() {
      return p;
    },
    dispose() {
      l = !0, L?.abort?.(), f?.removeEventListener("click", G), m?.removeEventListener("change", R), v?.removeEventListener("change", B), d?.removeEventListener("input", D);
    }
  };
}
export {
  he as createDirectorAgentPanel,
  F as isLoopbackBaseUrl,
  Y as modelSelectMarkup,
  ve as planChangesMarkup,
  me as providerPrivacyText,
  V as providerSelectMarkup,
  ge as resolveAgentIntent
};
