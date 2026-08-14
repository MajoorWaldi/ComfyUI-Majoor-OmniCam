const L = /* @__PURE__ */ new Map([["en", {}]]);
function c(t, n) {
  L.set(t, { ...L.get(t) || {}, ...n || {} });
}
let e = "en";
function i(t) {
  L.has(t) && (e = t);
}
function o() {
  return e;
}
function A(t) {
  return e === "en" ? t : L.get(e)?.[t] || t;
}
export {
  o as getLocale,
  c as registerLocale,
  i as setLocale,
  A as t
};
