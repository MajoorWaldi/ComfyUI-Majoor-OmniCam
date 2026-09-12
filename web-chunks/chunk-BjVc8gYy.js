import { a as o, T as Y, bu as z, bv as w } from "./chunk-JGGPE6jr.js";
const Q = "/majoor/omnicam/agent/v1/plan", W = "/majoor/omnicam/agent/v1/apply-plan";
async function D(e, n, i, { signal: s } = {}) {
  const a = await e.fetchApi(n, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(i),
    signal: s
  });
  let d = null;
  try {
    d = await a.json();
  } catch {
    d = null;
  }
  if (a.ok === !1) {
    const b = d?.error?.code || `HTTP_${a.status || 0}`, f = d?.error?.message || `OmniCam Agent plan request failed (${a.status})`, m = new Error(f);
    throw m.code = b, m.status = a.status || 0, m;
  }
  return d ?? {};
}
async function X(e, { sessionId: n, instruction: i, provider: s }, a) {
  return D(e, Q, {
    session_id: n,
    instruction: i,
    provider: s
  }, a);
}
async function Z(e, n, i) {
  return D(e, W, { plan_id: n }, i);
}
function A(e, n) {
  return `/majoor/omnicam/agent/v1/providers/${encodeURIComponent(e)}${n}`;
}
async function S(e, n, i, s) {
  const a = await e.fetchApi(i, {
    method: n,
    headers: s === void 0 ? void 0 : { "Content-Type": "application/json" },
    body: s === void 0 ? void 0 : JSON.stringify(s)
  });
  let d = null;
  try {
    d = await a.json();
  } catch {
    d = null;
  }
  if (a.ok === !1) {
    const b = d?.error?.code || `HTTP_${a.status || 0}`, f = d?.error?.message || `OmniCam Agent provider request failed (${a.status})`, m = new Error(f);
    throw m.code = b, m.status = a.status || 0, m;
  }
  return d ?? {};
}
async function ee(e, n) {
  return S(e, "GET", A(n, "/status"));
}
async function te(e, n, i) {
  try {
    return await S(e, "PUT", A(n, "/credential"), { secret: i });
  } finally {
    i = null;
  }
}
async function ne(e, n) {
  return S(e, "DELETE", A(n, "/credential"));
}
async function re(e, n, i) {
  return S(e, "POST", A(n, "/test"), i || {});
}
async function ie(e, n, i) {
  return (await S(e, "POST", A(n, "/models"), i || {})).models || [];
}
const ae = {
  ollama: "Ollama",
  openai: "OpenAI",
  openai_compatible: "OpenAI-compatible",
  anthropic: "Anthropic"
};
function L(e) {
  return String(e ?? "").replace(/[&<>"']/g, (n) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[n]);
}
function oe(e) {
  if (!e || !e.closest) return null;
  const n = e.closest("[data-agent-act]");
  return n ? { action: n.dataset.agentAct } : null;
}
function se(e) {
  return !e || !e.length ? `<li class="oc-asset-empty">${o("No visible changes")}</li>` : e.map((n) => `<li>${L(n.entity)} · ${L(n.field)}</li>`).join("");
}
function U(e, n) {
  const i = Array.isArray(e) ? [...e] : [];
  return n && !i.includes(n) && i.unshift(n), i.length ? i.map((s) => `<option value="${L(s)}"${s === n ? " selected" : ""}>${L(s)}</option>`).join("") : `<option value="">${o("No models found")}</option>`;
}
function ce(e, n = {}) {
  const i = e.root, s = n.api || e.api || e.app?.api, a = (t) => i.querySelector(`[data-role="${t}"]`), d = a("agent-panel"), b = a("agent-hint"), f = a("agent-describe"), m = a("agent-plan"), g = a("agent-model-select"), x = a("agent-provider-label"), _ = a("agent-credential-status"), $ = a("agent-credential-form"), C = a("agent-credential-input"), k = i.querySelector('[data-agent-act="preview"]'), j = i.querySelector('[data-agent-act="apply"]'), H = i.querySelector('[data-agent-act="cancel"]');
  let p = "idle", l = null, P = null, c = !1;
  function u(t) {
    b && (b.textContent = t || "");
  }
  function O() {
    const t = w();
    if (x) {
      const h = ae[t.provider] || t.provider;
      x.textContent = `${h} · ${t.model || o("(no model set)")}`;
    }
    const r = p === "planning" || p === "applying";
    k && (k.disabled = r), j && (j.disabled = !l || r || l.truncated || p === "stale"), H && (H.disabled = !l), f && (f.disabled = r), m && (m.innerHTML = l ? se(l.changes) : ""), p === "planning" ? u(o("Planning...")) : p === "applying" ? u(o("Applying...")) : p === "stale" ? u(o("The Director changed after this preview. Generate a new preview.")) : p === "preview_ready" && u(l?.description || "");
  }
  function v(t) {
    p = t, O();
  }
  async function I() {
    if (c || !_) return;
    const t = w();
    try {
      const r = await ee(s, t.provider);
      if (c) return;
      r.configured ? _.textContent = r.source === "environment" ? o("Configured by server environment") : o("Configured") : _.textContent = o("Not configured");
    } catch {
      c || (_.textContent = o("Status unavailable"));
    }
  }
  async function E() {
    if (c || !g) return;
    const t = w();
    g.disabled = !0, g.innerHTML = `<option value="">${o("Loading models...")}</option>`;
    try {
      const r = await ie(s, t.provider, { base_url: t.baseUrl });
      if (c) return;
      g.innerHTML = U(r, t.model);
    } catch {
      if (c) return;
      g.innerHTML = U([], t.model);
    } finally {
      c || (g.disabled = !1);
    }
  }
  function N() {
    !g || !g.value || (Y(z, g.value), O());
  }
  async function G() {
    if (p === "planning" || p === "applying") return;
    const t = String(f?.value || "").trim();
    if (!t) return;
    const r = e.agentBridge?.sessionId;
    if (!r) {
      v("error"), u(o("Agent session is not ready yet."));
      return;
    }
    P?.abort?.();
    const h = typeof AbortController == "function" ? new AbortController() : null;
    P = h, l = null, v("planning");
    const T = w();
    try {
      const y = await X(s, {
        sessionId: r,
        instruction: t,
        provider: {
          id: T.provider,
          model: T.model,
          base_url: T.baseUrl,
          max_output_tokens: T.maxOutputTokens,
          max_planner_steps: T.maxPlannerSteps,
          timeout_seconds: T.requestTimeoutSeconds
        }
      }, { signal: h?.signal });
      if (c || P !== h) return;
      if (y.finished) {
        l = null, v("idle"), u(y.message || o("The Agent finished without a change."));
        return;
      }
      l = {
        planId: y.plan_id,
        description: y.description,
        changes: y.changes || [],
        truncated: !!y.truncated
      }, v(l.truncated ? "error" : "preview_ready"), l.truncated && u(o("Preview was truncated; Apply is disabled for safety."));
    } catch (y) {
      if (c || y?.name === "AbortError") return;
      l = null, v("error"), u(y?.message || o("Preview failed"));
    }
  }
  async function R() {
    if (!l || p === "applying" || l.truncated) return;
    const t = l.planId;
    v("applying");
    try {
      if (await Z(s, t), c) return;
      l = null, v("idle"), u(o("Applied."));
    } catch (r) {
      if (c) return;
      if (r?.code === "STALE_PLAN") {
        l = null, v("stale");
        return;
      }
      v("error"), u(r?.message || o("Apply failed"));
    }
  }
  function J() {
    P?.abort?.(), l = null, v("idle"), u("");
  }
  function q(t) {
    $ && ($.hidden = !t), t ? C?.focus?.() : C && (C.value = "");
  }
  async function F() {
    const t = w(), r = C?.value || "";
    if (C && (C.value = ""), !r) {
      q(!1);
      return;
    }
    try {
      await te(s, t.provider, r);
    } catch (h) {
      c || u(h?.message || o("Could not save the credential"));
    } finally {
      q(!1), await I(), await E();
    }
  }
  async function K() {
    const t = w();
    try {
      await ne(s, t.provider);
    } catch (r) {
      c || u(r?.message || o("Could not remove the credential"));
    } finally {
      await I(), await E();
    }
  }
  async function V() {
    const t = w();
    u(o("Testing..."));
    try {
      const r = await re(s, t.provider, {
        model: t.model,
        base_url: t.baseUrl,
        timeout_seconds: t.requestTimeoutSeconds
      });
      if (c) return;
      u(r.ok ? o("Connection OK") : r.error?.message || o("Connection failed"));
    } catch (r) {
      c || u(r?.message || o("Connection failed"));
    }
  }
  function B() {
    f && (f.style.height = "auto", f.style.height = `${f.scrollHeight}px`);
  }
  function M(t) {
    const r = oe(t.target);
    if (r) {
      if (r.action === "preview") return void G();
      if (r.action === "apply") return void R();
      if (r.action === "cancel") return J();
      if (r.action === "credential-replace") return q($?.hidden !== !1);
      if (r.action === "credential-remove") return void K();
      if (r.action === "credential-test") return void V();
      if (r.action === "credential-save") return void F();
      if (r.action === "model-refresh") return void E();
    }
  }
  return d?.addEventListener("click", M), g?.addEventListener("change", N), f?.addEventListener("input", B), O(), I(), E(), {
    get state() {
      return p;
    },
    dispose() {
      c = !0, P?.abort?.(), d?.removeEventListener("click", M), g?.removeEventListener("change", N), f?.removeEventListener("input", B);
    }
  };
}
export {
  ce as createDirectorAgentPanel,
  U as modelSelectMarkup,
  se as planChangesMarkup,
  oe as resolveAgentIntent
};
