// Thumbnail bookkeeping for the Asset Browser grid.
//
//  * PreviewCache -- a bounded LRU of asset id -> thumbnail URL/dataURL so a
//    card that scrolls back into view is instant and never re-rendered.
//  * PreviewQueue -- one render job at a time (design spec section 19); a
//    second request for the same key rides the first promise.
//
// Pure data structures: no three.js, no DOM. The renderer that actually turns
// a model into pixels is web-src/assets/thumbnail-renderer.js.

export function previewKey(definition) {
  if (!definition) return "";
  const fingerprint = definition.thumbnail || definition.file || "";
  return `${definition.id}::${fingerprint}::${definition.version ?? 2}`;
}

export function createPreviewCache({ max = 96 } = {}) {
  const entries = new Map(); // key -> url, iteration order == LRU order

  return {
    get size() {
      return entries.size;
    },
    has(key) {
      return entries.has(key);
    },
    get(key) {
      if (!entries.has(key)) return null;
      const url = entries.get(key);
      entries.delete(key);
      entries.set(key, url); // touch -> most-recently-used
      return url;
    },
    set(key, url) {
      if (!key || !url) return;
      if (entries.has(key)) entries.delete(key);
      entries.set(key, url);
      while (entries.size > max) {
        const oldest = entries.keys().next().value;
        entries.delete(oldest);
      }
    },
    delete(key) {
      return entries.delete(key);
    },
    clear() {
      entries.clear();
    },
    keys() {
      return [...entries.keys()];
    },
  };
}

export function createPreviewQueue() {
  const pending = new Map(); // key -> Promise
  let tail = Promise.resolve();
  let active = 0;

  return {
    get pendingCount() {
      return pending.size;
    },
    get active() {
      return active;
    },
    enqueue(key, jobFn) {
      if (pending.has(key)) return pending.get(key);
      const promise = tail.then(async () => {
        active += 1;
        try {
          return await jobFn();
        } finally {
          active -= 1;
          pending.delete(key);
        }
      });
      pending.set(key, promise);
      // keep the chain alive even if this job rejects
      tail = promise.catch(() => {});
      return promise;
    },
    clear() {
      pending.clear();
    },
  };
}
