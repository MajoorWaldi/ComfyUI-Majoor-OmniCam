export class ObjectUrlRegistry {
  constructor(urlApi = URL) { this.urlApi = urlApi; this.urls = new Map(); }
  replace(id, source) { this.revoke(id); const url = typeof source === "string" ? source : this.urlApi.createObjectURL(source); this.urls.set(id, url); return url; }
  setManaged(id, url) { this.revoke(id); this.urls.set(id, url); return url; }
  get(id) { return this.urls.get(id); }
  revoke(id) { const url = this.urls.get(id); if (url?.startsWith?.("blob:")) this.urlApi.revokeObjectURL(url); this.urls.delete(id); }
  clear() { for (const id of [...this.urls.keys()]) this.revoke(id); }
}

export async function uploadManagedFile(api, { route, field = "file", file }) {
  if (!file) throw new TypeError("A file is required"); const body = new FormData(); body.append(field, file, file.name);
  const response = await api.fetchApi(route, { method: "POST", body }); if (!response.ok) throw new Error(await response.text()); return response.json();
}
