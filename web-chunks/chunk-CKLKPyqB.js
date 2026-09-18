const r = /* @__PURE__ */ new WeakMap();
function u(t) {
  let n = r.get(t);
  if (n) return n;
  n = /* @__PURE__ */ new Set(), r.set(t, n);
  const e = t.onConnectionChange;
  return t.onConnectionChange = function(o) {
    const c = e?.apply(this, arguments);
    for (const s of [...n])
      try {
        s(o);
      } catch (i) {
        console.warn("[OmniCam] graph connection watcher failed", i);
      }
    return c;
  }, n;
}
function a(t, n) {
  const e = t?.graph;
  if (!e || typeof n != "function") return () => {
  };
  const o = u(e);
  return o.add(n), () => o.delete(n);
}
export {
  a as w
};
