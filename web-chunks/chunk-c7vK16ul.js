import { a, V as D, bw as te, bx as ne, by as h } from "./chunk-CiXOvmY9.js";
const re = "/majoor/omnicam/agent/v1/plan", ie = "/majoor/omnicam/agent/v1/apply-plan";
async function Y(e, t, i, { signal: o } = {}) {
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
    const w = f?.error?.code || `HTTP_${s.status || 0}`, P = f?.error?.message || `OmniCam Agent plan request failed (${s.status})`, u = new Error(P);
    throw u.code = w, u.status = s.status || 0, u;
  }
  return f ?? {};
}
async function ae(e, { sessionId: t, instruction: i, provider: o }, s) {
  return Y(e, re, {
    session_id: t,
    instruction: i,
    provider: o
  }, s);
}
async function oe(e, t, i) {
  return Y(e, ie, { plan_id: t }, i);
}
function _(e, t) {
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
    const w = f?.error?.code || `HTTP_${s.status || 0}`, P = f?.error?.message || `OmniCam Agent provider request failed (${s.status})`, u = new Error(P);
    throw u.code = w, u.status = s.status || 0, u;
  }
  return f ?? {};
}
async function se(e) {
  return (await S(e, "GET", "/majoor/omnicam/agent/v1/providers")).providers || [];
}
async function le(e, t) {
  return S(e, "GET", _(t, "/status"));
}
async function ce(e, t, i) {
  try {
    return await S(e, "PUT", _(t, "/credential"), { secret: i });
  } finally {
    i = null;
  }
}
async function ue(e, t) {
  return S(e, "DELETE", _(t, "/credential"));
}
async function de(e, t, i) {
  return S(e, "POST", _(t, "/test"), i || {});
}
async function fe(e, t, i) {
  return (await S(e, "POST", _(t, "/models"), i || {})).models || [];
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
function J(e) {
  const t = String(e || "").trim();
  if (!t) return !0;
  let i;
  try {
    i = new URL(t).hostname;
  } catch {
    return !1;
  }
  return i === "127.0.0.1" || i === "localhost" || i === "::1" || i === "[::1]" || i === "0.0.0.0";
}
function me(e) {
  const t = a(
    "Your instruction and the semantic scene information requested by the planner are sent to the configured model provider. Media files are not sent by Agent v1."
  );
  return e.provider === "ollama" ? J(e.baseUrl) ? a("Planning stays on the configured local Ollama endpoint.") : t : e.provider === "openai_compatible" && J(e.baseUrl) ? a("Planning stays on the configured local endpoint.") : t;
}
function F(e, t) {
  const i = Array.isArray(e) ? e : [];
  return i.length ? i.map((o) => `<option value="${A(o.id)}"${o.id === t ? " selected" : ""}>${A(o.label)}</option>`).join("") : `<option value="">${a("No providers found")}</option>`;
}
function V(e, t) {
  const i = Array.isArray(e) ? [...e] : [];
  return t && !i.includes(t) && i.unshift(t), i.length ? i.map((o) => `<option value="${A(o)}"${o === t ? " selected" : ""}>${A(o)}</option>`).join("") : `<option value="">${a("No models found")}</option>`;
}
function he(e, t = {}) {
  const i = e.root, o = t.api || e.api || e.app?.api, s = (n) => i.querySelector(`[data-role="${n}"]`), f = s("agent-panel"), w = s("agent-hint"), P = s("agent-privacy-note"), u = s("agent-describe"), N = s("agent-plan"), v = s("agent-provider-select"), g = s("agent-model-select"), k = s("agent-provider-label"), $ = s("agent-credential-status"), x = s("agent-credential-form"), T = s("agent-credential-input"), j = i.querySelector('[data-agent-act="preview"]'), H = i.querySelector('[data-agent-act="apply"]'), M = i.querySelector('[data-agent-act="cancel"]');
  let p = "idle", c = null, E = null, l = !1;
  function d(n) {
    w && (w.textContent = n || "");
  }
  function O() {
    const n = h();
    if (k) {
      const b = pe[n.provider] || n.provider;
      k.textContent = `${b} · ${n.model || a("(no model set)")}`;
    }
    P && (P.textContent = me(n));
    const r = p === "planning" || p === "applying";
    j && (j.disabled = r), H && (H.disabled = !c || r || c.truncated || p === "stale"), M && (M.disabled = !c), u && (u.disabled = r), N && (N.innerHTML = c ? ve(c.changes) : ""), p === "planning" ? d(a("Planning...")) : p === "applying" ? d(a("Applying...")) : p === "stale" ? d(a("The Director changed after this preview. Generate a new preview.")) : p === "preview_ready" && d(c?.description || "");
  }
  function m(n) {
    p = n, O();
  }
  async function I() {
    if (l || !$) return;
    const n = h();
    try {
      const r = await le(o, n.provider);
      if (l) return;
      r.configured ? $.textContent = r.source === "environment" ? a("Configured by server environment") : a("Configured") : $.textContent = a("Not configured");
    } catch {
      l || ($.textContent = a("Status unavailable"));
    }
  }
  async function K() {
    if (l || !v) return;
    const n = h();
    v.disabled = !0;
    try {
      const r = await se(o);
      if (l) return;
      v.innerHTML = F(r, n.provider);
    } catch {
      if (l) return;
      v.innerHTML = F([], n.provider);
    } finally {
      l || (v.disabled = !1);
    }
  }
  async function L() {
    if (l || !g) return;
    const n = h();
    g.disabled = !0, g.innerHTML = `<option value="">${a("Loading models...")}</option>`;
    try {
      const r = await fe(o, n.provider, { base_url: n.baseUrl });
      if (l) return;
      g.innerHTML = V(r, n.model);
    } catch {
      if (l) return;
      g.innerHTML = V([], n.model);
    } finally {
      l || (g.disabled = !1);
    }
  }
  function U() {
    !g || !g.value || (D(ne, g.value), O());
  }
  function B() {
    !v || !v.value || (D(te, v.value), O(), I(), L());
  }
  async function z() {
    if (p === "planning" || p === "applying") return;
    const n = String(u?.value || "").trim();
    if (!n) return;
    const r = e.agentBridge?.sessionId;
    if (!r) {
      m("error"), d(a("Agent session is not ready yet."));
      return;
    }
    E?.abort?.();
    const b = typeof AbortController == "function" ? new AbortController() : null;
    E = b, c = null, m("planning");
    const C = h();
    try {
      const y = await ae(o, {
        sessionId: r,
        instruction: n,
        provider: {
          id: C.provider,
          model: C.model,
          base_url: C.baseUrl,
          max_output_tokens: C.maxOutputTokens,
          max_planner_steps: C.maxPlannerSteps,
          timeout_seconds: C.requestTimeoutSeconds
        }
      }, { signal: b?.signal });
      if (l || E !== b) return;
      if (y.finished) {
        c = null, m("idle"), d(y.message || a("The Agent finished without a change."));
        return;
      }
      c = {
        planId: y.plan_id,
        description: y.description,
        changes: y.changes || [],
        truncated: !!y.truncated
      }, m(c.truncated ? "error" : "preview_ready"), c.truncated && d(a("Preview was truncated; Apply is disabled for safety."));
    } catch (y) {
      if (l || y?.name === "AbortError") return;
      c = null, m("error"), d(y?.message || a("Preview failed"));
    }
  }
  async function Q() {
    if (!c || p === "applying" || c.truncated) return;
    const n = c.planId;
    m("applying");
    try {
      if (await oe(o, n), l) return;
      c = null, m("idle"), d(a("Applied."));
    } catch (r) {
      if (l) return;
      if (r?.code === "STALE_PLAN") {
        c = null, m("stale");
        return;
      }
      m("error"), d(r?.message || a("Apply failed"));
    }
  }
  function W() {
    E?.abort?.(), c = null, m("idle"), d("");
  }
  function q(n) {
    x && (x.hidden = !n), n ? T?.focus?.() : T && (T.value = "");
  }
  async function X() {
    const n = h(), r = T?.value || "";
    if (T && (T.value = ""), !r) {
      q(!1);
      return;
    }
    try {
      await ce(o, n.provider, r);
    } catch (b) {
      l || d(b?.message || a("Could not save the credential"));
    } finally {
      q(!1), await I(), await L();
    }
  }
  async function Z() {
    const n = h();
    try {
      await ue(o, n.provider);
    } catch (r) {
      l || d(r?.message || a("Could not remove the credential"));
    } finally {
      await I(), await L();
    }
  }
  async function ee() {
    const n = h();
    d(a("Testing..."));
    try {
      const r = await de(o, n.provider, {
        model: n.model,
        base_url: n.baseUrl,
        timeout_seconds: n.requestTimeoutSeconds
      });
      if (l) return;
      d(r.ok ? a("Connection OK") : r.error?.message || a("Connection failed"));
    } catch (r) {
      l || d(r?.message || a("Connection failed"));
    }
  }
  function G() {
    u && (u.style.height = "auto", u.style.height = `${u.scrollHeight}px`);
  }
  function R(n) {
    const r = ge(n.target);
    if (r) {
      if (r.action === "preview") return void z();
      if (r.action === "apply") return void Q();
      if (r.action === "cancel") return W();
      if (r.action === "credential-replace") return q(x?.hidden !== !1);
      if (r.action === "credential-remove") return void Z();
      if (r.action === "credential-test") return void ee();
      if (r.action === "credential-save") return void X();
      if (r.action === "model-refresh") return void L();
    }
  }
  return f?.addEventListener("click", R), v?.addEventListener("change", B), g?.addEventListener("change", U), u?.addEventListener("input", G), O(), K(), I(), L(), {
    get state() {
      return p;
    },
    dispose() {
      l = !0, E?.abort?.(), f?.removeEventListener("click", R), v?.removeEventListener("change", B), g?.removeEventListener("change", U), u?.removeEventListener("input", G);
    }
  };
}
export {
  he as createDirectorAgentPanel,
  J as isLoopbackBaseUrl,
  V as modelSelectMarkup,
  ve as planChangesMarkup,
  me as providerPrivacyText,
  F as providerSelectMarkup,
  ge as resolveAgentIntent
};
