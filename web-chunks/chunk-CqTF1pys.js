import { v as a, ak as x, bU as ne, bV as J, bW as w } from "./chunk-0uEWtnIL.js";
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
    const P = f?.error?.code || `HTTP_${s.status || 0}`, T = f?.error?.message || `OmniCam Agent plan request failed (${s.status})`, d = new Error(T);
    throw d.code = P, d.status = s.status || 0, d;
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
    const P = f?.error?.code || `HTTP_${s.status || 0}`, T = f?.error?.message || `OmniCam Agent provider request failed (${s.status})`, d = new Error(T);
    throw d.code = P, d.status = s.status || 0, d;
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
async function pe(e, t, i) {
  return (await S(e, "POST", $(t, "/models"), i || {})).models || [];
}
const fe = {
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
  const i = e.root, o = t.api || e.api || e.app?.api, s = (n) => i.querySelector(`[data-role="${n}"]`), f = s("agent-panel"), P = s("agent-hint"), T = s("agent-privacy-note"), d = s("agent-describe"), j = s("agent-plan"), y = s("agent-provider-select"), m = s("agent-model-select"), U = s("agent-provider-label"), O = s("agent-credential-status"), k = s("agent-credential-form"), C = s("agent-credential-input"), H = i.querySelector('[data-agent-act="preview"]'), M = i.querySelector('[data-agent-act="apply"]'), N = i.querySelector('[data-agent-act="cancel"]');
  let g = "idle", c = null, L = null, l = !1;
  function u(n) {
    P && (P.textContent = n || "");
  }
  function E() {
    const n = w();
    if (U) {
      const p = fe[n.provider] || n.provider;
      U.textContent = `${p} · ${n.model || a("(no model set)")}`;
    }
    T && (T.textContent = me(n));
    const r = g === "planning" || g === "applying";
    if (H && (H.disabled = r), M && (M.disabled = !c || r || c.truncated || g === "stale"), N && (N.disabled = !c), d && (d.disabled = r), j && (j.innerHTML = c ? ve(c.changes) : ""), g === "planning") u(a("Planning..."));
    else if (g === "applying") u(a("Applying..."));
    else if (g === "stale") u(a("The Director changed after this preview. Generate a new preview."));
    else if (g === "preview_ready") {
      const p = c?.description || "", b = c?.warnings || [];
      u(b.length ? [p, ...b.map((v) => `⚠ ${v}`)].join(" ") : p);
    }
  }
  function h(n) {
    g = n, E();
  }
  async function I() {
    if (l || !O) return;
    const n = w();
    try {
      const r = await le(o, n.provider);
      if (l) return;
      r.configured ? O.textContent = a("Configured") : O.textContent = a("Not configured");
    } catch {
      l || (O.textContent = a("Status unavailable"));
    }
  }
  async function W() {
    if (l || !y) return;
    const n = w();
    y.disabled = !0;
    try {
      const r = await se(o);
      if (l) return;
      y.innerHTML = V(r, n.provider);
    } catch {
      if (l) return;
      y.innerHTML = V([], n.provider);
    } finally {
      l || (y.disabled = !1);
    }
  }
  async function _() {
    if (l || !m) return;
    const n = w();
    m.disabled = !0, m.innerHTML = `<option value="">${a("Loading models...")}</option>`;
    try {
      const r = await pe(o, n.provider, { base_url: n.baseUrl });
      if (l) return;
      let p = n.model;
      !p && r.length && (p = r[0], x(J(n.provider), p)), m.innerHTML = Y(r, p), E();
    } catch {
      if (l) return;
      m.innerHTML = Y([], n.model);
    } finally {
      l || (m.disabled = !1);
    }
  }
  function B() {
    !m || !m.value || (x(J(w().provider), m.value), E());
  }
  function R() {
    !y || !y.value || (x(ne, y.value), E(), I(), _());
  }
  async function z() {
    if (g === "planning" || g === "applying") return;
    const n = String(d?.value || "").trim();
    if (!n) return;
    const r = e.agentBridge?.sessionId;
    if (!r) {
      h("error"), u(a("Agent session is not ready yet."));
      return;
    }
    L?.abort?.();
    const p = typeof AbortController == "function" ? new AbortController() : null;
    L = p, c = null, h("planning");
    const b = w();
    try {
      const v = await ae(o, {
        sessionId: r,
        instruction: n,
        provider: {
          id: b.provider,
          model: b.model,
          base_url: b.baseUrl,
          max_output_tokens: b.maxOutputTokens,
          max_planner_steps: b.maxPlannerSteps,
          timeout_seconds: b.requestTimeoutSeconds
        }
      }, { signal: p?.signal });
      if (l || L !== p) return;
      if (v.finished) {
        c = null, h("idle"), u(v.message || a("The Agent finished without a change."));
        return;
      }
      c = {
        planId: v.plan_id,
        description: v.description,
        changes: v.changes || [],
        warnings: v.warnings || [],
        truncated: !!v.truncated
      }, h(c.truncated ? "error" : "preview_ready"), c.truncated && u(a("Preview was truncated; Apply is disabled for safety."));
    } catch (v) {
      if (l || v?.name === "AbortError") return;
      c = null, h("error"), u(v?.message || a("Preview failed"));
    }
  }
  async function Q() {
    if (!c || g === "applying" || c.truncated) return;
    const n = c.planId;
    h("applying");
    try {
      if (await oe(o, n), l) return;
      c = null, h("idle"), u(a("Applied."));
    } catch (r) {
      if (l) return;
      if (r?.code === "STALE_PLAN") {
        c = null, h("stale");
        return;
      }
      h("error"), u(r?.message || a("Apply failed"));
    }
  }
  function X() {
    L?.abort?.(), c = null, h("idle"), u("");
  }
  function q(n) {
    k && (k.hidden = !n), n ? C?.focus?.() : C && (C.value = "");
  }
  async function Z() {
    const n = w(), r = C?.value || "";
    if (C && (C.value = ""), !r) {
      q(!1);
      return;
    }
    try {
      await ce(o, n.provider, r);
    } catch (p) {
      l || u(p?.message || a("Could not save the credential"));
    } finally {
      q(!1), await I(), await _();
    }
  }
  async function ee() {
    const n = w();
    try {
      await de(o, n.provider);
    } catch (r) {
      l || u(r?.message || a("Could not remove the credential"));
    } finally {
      await I(), await _();
    }
  }
  async function te() {
    const n = w();
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
      if (r.action === "preview") return void z();
      if (r.action === "apply") return void Q();
      if (r.action === "cancel") return X();
      if (r.action === "credential-replace") return q(k?.hidden !== !1);
      if (r.action === "credential-remove") return void ee();
      if (r.action === "credential-test") return void te();
      if (r.action === "credential-save") return void Z();
      if (r.action === "model-refresh") return void _();
    }
  }
  return f?.addEventListener("click", G), y?.addEventListener("change", R), m?.addEventListener("change", B), d?.addEventListener("input", D), E(), W(), I(), _(), {
    get state() {
      return g;
    },
    dispose() {
      l = !0, L?.abort?.(), f?.removeEventListener("click", G), y?.removeEventListener("change", R), m?.removeEventListener("change", B), d?.removeEventListener("input", D);
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
