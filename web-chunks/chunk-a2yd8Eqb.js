let y = null;
function x(e, t) {
  let a = 0;
  const u = t.map((n) => {
    const o = n.index ? n.toNonIndexed() : n;
    return a += o.attributes.position.count, o;
  }), l = new Float32Array(a * 3), c = new Float32Array(a * 3);
  let r = 0;
  for (const n of u) {
    const o = n.attributes.position.array, i = n.attributes.normal?.array;
    l.set(o, r), i && c.set(i, r), r += o.length, n !== t[u.indexOf(n)] && n.dispose();
  }
  const s = new e.BufferGeometry();
  s.setAttribute("position", new e.Float32BufferAttribute(l, 3)), s.setAttribute("normal", new e.Float32BufferAttribute(c, 3)), s.computeVertexNormals();
  for (const n of t)
    n.dispose();
  return s;
}
function A(e) {
  if (y)
    return y.clone();
  const t = [], a = new e.SphereGeometry(0.085, 8, 6);
  a.scale(0.9, 1.1, 0.95), a.translate(0, 0.88, 0), t.push(a);
  const u = new e.CylinderGeometry(0.035, 0.045, 0.06, 6);
  u.translate(0, 0.78, 0), t.push(u);
  const l = new e.CylinderGeometry(0.16, 0.12, 0.22, 6);
  l.scale(1.1, 1, 0.72), l.translate(0, 0.66, 0), t.push(l);
  const c = new e.CylinderGeometry(0.12, 0.135, 0.16, 6);
  c.scale(1.08, 1, 0.75), c.translate(0, 0.49, 0), t.push(c);
  const r = 0.18, s = new e.CylinderGeometry(0.035, 0.03, 0.19, 6);
  s.rotateZ(r), s.translate(-0.19, 0.63, 0), t.push(s);
  const n = new e.CylinderGeometry(0.035, 0.03, 0.19, 6);
  n.rotateZ(-r), n.translate(0.19, 0.63, 0), t.push(n);
  const o = new e.CylinderGeometry(0.03, 0.024, 0.17, 6);
  o.rotateZ(r * 0.7), o.translate(-0.23, 0.46, 0.01), t.push(o);
  const i = new e.CylinderGeometry(0.03, 0.024, 0.17, 6);
  i.rotateZ(-r * 0.7), i.translate(0.23, 0.46, 0.01), t.push(i);
  const m = new e.BoxGeometry(0.036, 0.065, 0.028);
  m.rotateZ(r * 0.5), m.translate(-0.25, 0.34, 0.02), t.push(m);
  const p = new e.BoxGeometry(0.036, 0.065, 0.028);
  p.rotateZ(-r * 0.5), p.translate(0.25, 0.34, 0.02), t.push(p);
  const h = new e.CylinderGeometry(0.055, 0.042, 0.22, 6);
  h.translate(-0.08, 0.33, 0), t.push(h);
  const d = new e.CylinderGeometry(0.055, 0.042, 0.22, 6);
  d.translate(0.08, 0.33, 0), t.push(d);
  const f = new e.CylinderGeometry(0.042, 0.032, 0.2, 6);
  f.translate(-0.08, 0.13, 0), t.push(f);
  const w = new e.CylinderGeometry(0.042, 0.032, 0.2, 6);
  w.translate(0.08, 0.13, 0), t.push(w);
  const G = new e.BoxGeometry(0.055, 0.038, 0.11);
  G.translate(-0.08, 0.019, 0.025), t.push(G);
  const C = new e.BoxGeometry(0.055, 0.038, 0.11);
  return C.translate(0.08, 0.019, 0.025), t.push(C), y = x(e, t), y.clone();
}
export {
  A as c
};
