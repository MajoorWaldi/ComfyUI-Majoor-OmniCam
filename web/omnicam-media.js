class n {
  constructor(t = URL) {
    this.urlApi = t, this.urls = /* @__PURE__ */ new Map();
  }
  replace(t, e) {
    this.revoke(t);
    const r = typeof e == "string" ? e : this.urlApi.createObjectURL(e);
    return this.urls.set(t, r), r;
  }
  setManaged(t, e) {
    return this.revoke(t), this.urls.set(t, e), e;
  }
  get(t) {
    return this.urls.get(t);
  }
  revoke(t) {
    const e = this.urls.get(t);
    e?.startsWith?.("blob:") && this.urlApi.revokeObjectURL(e), this.urls.delete(t);
  }
  clear() {
    for (const t of [...this.urls.keys()]) this.revoke(t);
  }
}
async function a(i, { route: t, field: e = "file", file: r }) {
  if (!r) throw new TypeError("A file is required");
  const o = new FormData();
  o.append(e, r, r.name);
  const s = await i.fetchApi(t, { method: "POST", body: o });
  if (!s.ok) throw new Error(await s.text());
  return s.json();
}
export {
  n as ObjectUrlRegistry,
  a as uploadManagedFile
};
