function p(r) {
  if (!r)
    throw new Error("Assertion failed.");
}
const gi = (r) => {
  const e = (r % 360 + 360) % 360;
  if (e === 0 || e === 90 || e === 180 || e === 270)
    return e;
  throw new Error(`Invalid rotation ${r}.`);
}, ne = (r) => r && r[r.length - 1], vt = (r) => r >= 0 && r < 2 ** 32, R = (r) => {
  let e = 0;
  for (; r.readBits(1) === 0 && e < 32; )
    e++;
  if (e >= 32)
    throw new Error("Invalid exponential-Golomb code.");
  return (1 << e) - 1 + r.readBits(e);
}, ht = (r) => {
  const e = R(r);
  return (e & 1) === 0 ? -(e >> 1) : e + 1 >> 1;
}, Al = (r, e, t, i) => {
  for (let s = e; s < t; s++) {
    const n = Math.floor(s / 8);
    let a = r[n];
    const o = 7 - (s & 7);
    a &= ~(1 << o), a |= (i & 1 << t - s - 1) >> t - s - 1 << o, r[n] = a;
  }
}, te = (r) => r.constructor === Uint8Array ? r : ArrayBuffer.isView(r) ? new Uint8Array(r.buffer, r.byteOffset, r.byteLength) : new Uint8Array(r), q = (r) => r.constructor === DataView ? r : ArrayBuffer.isView(r) ? new DataView(r.buffer, r.byteOffset, r.byteLength) : new DataView(r), ve = /* @__PURE__ */ new TextDecoder(), Y = /* @__PURE__ */ new TextEncoder(), st = (r) => {
  for (let e = 0; e < r.length; e++)
    if (r.charCodeAt(e) > 255)
      return !1;
  return !0;
}, bn = (r) => Object.fromEntries(Object.entries(r).map(([e, t]) => [t, e])), $t = {
  bt709: 1,
  // ITU-R BT.709
  bt470bg: 5,
  // ITU-R BT.470BG
  smpte170m: 6,
  // ITU-R BT.601 525 - SMPTE 170M
  bt2020: 9,
  // ITU-R BT.202
  smpte432: 12
  // SMPTE EG 432-1
}, _r = /* @__PURE__ */ bn($t), Gt = {
  bt709: 1,
  // ITU-R BT.709
  smpte170m: 6,
  // SMPTE 170M
  linear: 8,
  // Linear transfer characteristics
  "iec61966-2-1": 13,
  // IEC 61966-2-1
  pq: 16,
  // Rec. ITU-R BT.2100-2 perceptual quantization (PQ) system
  hlg: 18
  // Rec. ITU-R BT.2100-2 hybrid loggamma (HLG) system
}, Ir = /* @__PURE__ */ bn(Gt), Xt = {
  rgb: 0,
  // Identity
  bt709: 1,
  // ITU-R BT.709
  bt470bg: 5,
  // ITU-R BT.470BG
  smpte170m: 6,
  // SMPTE 170M
  "bt2020-ncl": 9
  // ITU-R BT.2020-2 (non-constant luminance)
}, Er = /* @__PURE__ */ bn(Xt), Ao = (r) => !!r && !!r.primaries && !!r.transfer && !!r.matrix && r.fullRange !== void 0, ki = (r) => r instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && r instanceof SharedArrayBuffer || ArrayBuffer.isView(r);
class Yt {
  constructor() {
    this.currentPromise = Promise.resolve(), this.pending = 0;
  }
  async acquire() {
    let e;
    const t = new Promise((s) => {
      let n = !1;
      e = () => {
        n || (s(), this.pending--, n = !0);
      };
    }), i = this.currentPromise;
    return this.currentPromise = t, this.pending++, await i, e;
  }
}
const xl = /^[0-9a-fA-F]+$/, Hi = (r) => [...r].map((e) => e.toString(16).padStart(2, "0")).join(""), Pl = (r) => {
  p(r.length % 2 === 0);
  const e = new Uint8Array(r.length / 2);
  for (let t = 0; t < r.length; t += 2)
    e[t / 2] = parseInt(r.slice(t, t + 2), 16);
  return e;
}, Jn = (r) => (r = r >> 1 & 1431655765 | (r & 1431655765) << 1, r = r >> 2 & 858993459 | (r & 858993459) << 2, r = r >> 4 & 252645135 | (r & 252645135) << 4, r = r >> 8 & 16711935 | (r & 16711935) << 8, r = r >> 16 & 65535 | (r & 65535) << 16, r >>> 0), ar = (r, e, t) => {
  let i = 0, s = r.length - 1, n = -1;
  for (; i <= s; ) {
    const a = i + s >> 1, o = t(r[a]);
    o === e ? (n = a, s = a - 1) : o < e ? i = a + 1 : s = a - 1;
  }
  return n;
}, $ = (r, e, t) => {
  let i = 0, s = r.length - 1, n = -1;
  for (; i <= s; ) {
    const a = i + (s - i + 1) / 2 | 0;
    t(r[a]) <= e ? (n = a, i = a + 1) : s = a - 1;
  }
  return n;
}, ea = (r, e, t) => {
  const i = $(r, t(e), t);
  r.splice(i + 1, 0, e);
}, ee = () => {
  let r, e;
  return { promise: new Promise((i, s) => {
    r = i, e = s;
  }), resolve: r, reject: e };
}, vr = (r, e) => {
  const t = r.indexOf(e);
  t !== -1 && r.splice(t, 1);
}, xo = (r, e) => {
  for (let t = r.length - 1; t >= 0; t--)
    if (e(r[t]))
      return r[t];
}, jr = (r, e) => {
  for (let t = r.length - 1; t >= 0; t--)
    if (e(r[t]))
      return t;
  return -1;
}, Cl = async function* (r) {
  Symbol.iterator in r ? yield* r[Symbol.iterator]() : yield* r[Symbol.asyncIterator]();
}, _l = (r) => {
  if (!(Symbol.iterator in r) && !(Symbol.asyncIterator in r))
    throw new TypeError("Argument must be an iterable or async iterable.");
}, pe = (r) => {
  throw new Error(`Unexpected value: ${r}`);
}, Kr = (r, e, t) => {
  const i = r.getUint8(e), s = r.getUint8(e + 1), n = r.getUint8(e + 2);
  return t ? i | s << 8 | n << 16 : i << 16 | s << 8 | n;
}, Il = (r, e, t) => Kr(r, e, t) << 8 >> 8, Qr = (r, e, t, i) => {
  t = t >>> 0, t = t & 16777215, i ? (r.setUint8(e, t & 255), r.setUint8(e + 1, t >>> 8 & 255), r.setUint8(e + 2, t >>> 16 & 255)) : (r.setUint8(e, t >>> 16 & 255), r.setUint8(e + 1, t >>> 8 & 255), r.setUint8(e + 2, t & 255));
}, El = (r, e, t, i) => {
  t = le(t, -8388608, 8388607), t < 0 && (t = t + 16777216 & 16777215), Qr(r, e, t, i);
}, vl = (r, e, t, i) => {
  r.setUint32(e + 0, t, !0), r.setInt32(e + 4, Math.floor(t / 2 ** 32), !0);
}, Fr = (r, e) => ({
  async next() {
    const t = await r.next();
    return t.done ? { value: void 0, done: !0 } : { value: e(t.value), done: !1 };
  },
  return() {
    return r.return();
  },
  throw(t) {
    return r.throw(t);
  },
  [Symbol.asyncIterator]() {
    return this;
  }
}), le = (r, e, t) => Math.max(e, Math.min(t, r)), Fl = (r, e, t) => r + (e - r) * t, ke = "und", ji = (r) => {
  const e = Math.round(r);
  return Math.abs(r / e - 1) < 10 * Number.EPSILON ? e : r;
}, Vs = (r, e) => Math.round(r / e) * e, wi = (r, e) => Math.round(r * e) / e, ls = (r, e) => Math.floor(r / e) * e, ta = (r, e) => Math.floor(r * e) / e, Bl = (r) => {
  let e = 0;
  for (; r; )
    e++, r >>= 1;
  return e;
}, Rl = /^[a-z]{3}$/, Ki = (r) => Rl.test(r), Ct = 1e6 * (1 + Number.EPSILON), ia = (r, e) => {
  const t = { ...r, ...e };
  if (r.headers || e.headers) {
    const i = r.headers ? Ws(r.headers) : {}, s = e.headers ? Ws(e.headers) : {}, n = { ...i };
    Object.entries(s).forEach(([a, o]) => {
      const c = Object.keys(n).find((l) => l.toLowerCase() === a.toLowerCase());
      c && delete n[c], n[a] = o;
    }), t.headers = n;
  }
  return t;
}, Ws = (r) => {
  if (r instanceof Headers) {
    const e = {};
    return r.forEach((t, i) => {
      e[i] = t;
    }), e;
  }
  if (Array.isArray(r)) {
    const e = {};
    return r.forEach(([t, i]) => {
      e[t] = i;
    }), e;
  }
  return r;
}, ra = async (r, e, t, i, s) => {
  let n = 0;
  for (; ; )
    try {
      return await r(e, t);
    } catch (a) {
      if (s())
        throw a;
      n++;
      const o = i(n, a, e);
      if (o === null)
        throw a;
      if (D._error("Retrying failed fetch. Error:", a), !Number.isFinite(o) || o < 0)
        throw new TypeError("Retry delay must be a non-negative finite number.");
      if (o > 0 && await $i(1e3 * o), s())
        throw a;
    }
}, Ml = (r, e) => {
  const t = r < 0 ? -1 : 1;
  r = Math.abs(r);
  let i = 0, s = 1, n = 1, a = 0, o = r;
  for (; ; ) {
    const c = Math.floor(o), l = c * n + i, u = c * a + s;
    if (u > e)
      return {
        num: t * n,
        den: a
      };
    if (i = n, s = a, n = l, a = u, o = 1 / (o - c), !isFinite(o))
      break;
  }
  return {
    num: t * n,
    den: a
  };
};
class $r {
  constructor() {
    this.currentPromise = Promise.resolve();
  }
  call(e) {
    return this.currentPromise = this.currentPromise.then(e);
  }
}
let us = null;
const di = () => us !== null ? us : us = !!(typeof navigator < "u" && // eslint-disable-next-line @typescript-eslint/no-deprecated
(navigator.vendor?.match(/apple/i) || /AppleWebKit/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) || /\b(iPad|iPhone|iPod)\b/.test(navigator.userAgent)));
let ds = null;
const Br = () => ds !== null ? ds : ds = typeof navigator < "u" && navigator.userAgent?.includes("Firefox");
let fs = null;
const Ls = () => fs !== null ? fs : fs = !!(typeof navigator < "u" && (navigator.vendor?.includes("Google Inc") || /Chrome/.test(navigator.userAgent)));
let hs = null;
const zl = () => {
  if (hs !== null)
    return hs;
  if (typeof navigator > "u")
    return null;
  const r = /\bChrome\/(\d+)/.exec(navigator.userAgent);
  return r ? hs = Number(r[1]) : null;
}, ii = (r, e) => r !== -1 ? r : e, qs = (r, e, t, i) => r <= i && t <= e, Ti = function* (r) {
  for (const e in r) {
    const t = r[e];
    t !== void 0 && (yield { key: e, value: t });
  }
}, Dl = (r) => {
  switch (r.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/gif":
      return ".gif";
    case "image/webp":
      return ".webp";
    case "image/bmp":
      return ".bmp";
    case "image/svg+xml":
      return ".svg";
    case "image/tiff":
      return ".tiff";
    case "image/avif":
      return ".avif";
    case "image/x-icon":
    case "image/vnd.microsoft.icon":
      return ".ico";
    default:
      return null;
  }
}, Rr = (r) => {
  const e = atob(r), t = new Uint8Array(e.length);
  for (let i = 0; i < e.length; i++)
    t[i] = e.charCodeAt(i);
  return t;
}, Ol = (r) => {
  let e = "";
  for (let t = 0; t < r.length; t++)
    e += String.fromCharCode(r[t]);
  return btoa(e);
}, Po = (r, e) => {
  if (r.length !== e.length)
    return !1;
  for (let t = 0; t < r.length; t++)
    if (r[t] !== e[t])
      return !1;
  return !0;
}, kn = () => {
  Symbol.dispose ??= /* @__PURE__ */ Symbol("Symbol.dispose");
}, Si = (r) => typeof r == "number" && !Number.isNaN(r), Ae = (r, e) => {
  if (e.includes("://"))
    return e;
  if (r.includes("://")) {
    const o = r.indexOf("?");
    o !== -1 && (r = r.slice(0, o));
  }
  let t;
  if (e.startsWith("/")) {
    const o = r.indexOf("://");
    if (o === -1)
      t = e;
    else {
      const c = r.indexOf("/", o + 3);
      c === -1 ? t = r + e : t = r.slice(0, c) + e;
    }
  } else {
    const o = r.lastIndexOf("/");
    o === -1 ? t = e : t = r.slice(0, o + 1) + e;
  }
  let i = "";
  const s = t.indexOf("://");
  if (s !== -1) {
    const o = t.indexOf("/", s + 3);
    o !== -1 && (i = t.slice(0, o), t = t.slice(o));
  }
  const n = t.split("/"), a = [];
  for (const o of n)
    o === ".." ? a.pop() : o !== "." && a.push(o);
  return i + a.join("/");
}, Ui = (r, e) => {
  let t = 0;
  for (let i = 0; i < r.length; i++)
    e(r[i]) && t++;
  return t;
}, Tn = (r, e) => {
  let t = -1, i = 1 / 0;
  for (let s = 0; s < r.length; s++) {
    const n = e(r[s]);
    n < i && (i = n, t = s);
  }
  return t;
}, Ul = (r, e) => {
  let t = -1, i = -1 / 0;
  for (let s = 0; s < r.length; s++) {
    const n = e(r[s]);
    n > i && (i = n, t = s);
  }
  return t;
}, Qi = (r) => {
  p(Number.isInteger(r.num)), p(Number.isInteger(r.den)), p(r.den !== 0);
  let e = Math.abs(r.num), t = Math.abs(r.den);
  for (; t !== 0; ) {
    const s = e % t;
    e = t, t = s;
  }
  const i = e || 1;
  return {
    num: r.num / i,
    den: r.den / i
  };
}, ms = (r, e) => {
  if (typeof r != "object" || !r)
    throw new TypeError(`${e} must be an object.`);
  if (!Number.isInteger(r.left) || r.left < 0)
    throw new TypeError(`${e}.left must be a non-negative integer.`);
  if (!Number.isInteger(r.top) || r.top < 0)
    throw new TypeError(`${e}.top must be a non-negative integer.`);
  if (!Number.isInteger(r.width) || r.width < 0)
    throw new TypeError(`${e}.width must be a non-negative integer.`);
  if (!Number.isInteger(r.height) || r.height < 0)
    throw new TypeError(`${e}.height must be a non-negative integer.`);
};
let Ci, Nl = 1;
const sa = /* @__PURE__ */ new Map(), Sn = /* @__PURE__ */ new Map(), Co = () => typeof window > "u", Vl = () => {
  const r = /* @__PURE__ */ new Map(), e = /* @__PURE__ */ new Map();
  self.onmessage = (t) => {
    const i = t.data;
    switch (i.type) {
      case "set-timeout":
        {
          const s = setTimeout(() => {
            r.delete(i.timerId), self.postMessage({ type: "fire", timerId: i.timerId });
          }, i.delay);
          r.set(i.timerId, s);
        }
        break;
      case "set-interval":
        {
          const s = setInterval(() => {
            self.postMessage({ type: "fire", timerId: i.timerId });
          }, i.delay);
          e.set(i.timerId, s);
        }
        break;
      case "clear-timeout":
        {
          const s = r.get(i.timerId);
          s !== void 0 && (clearTimeout(s), r.delete(i.timerId));
        }
        break;
      case "clear-interval":
        {
          const s = e.get(i.timerId);
          s !== void 0 && (clearInterval(s), e.delete(i.timerId));
        }
        break;
    }
  };
}, _o = () => {
  if (Ci)
    return Ci;
  const r = `(${Vl.toString()})();`, e = URL.createObjectURL(new Blob([r], { type: "text/javascript" }));
  return Ci = new Worker(e), URL.revokeObjectURL(e), Ci.onmessage = (t) => {
    const i = t.data, s = sa.get(i.timerId);
    if (s) {
      sa.delete(i.timerId), s();
      return;
    }
    const n = Sn.get(i.timerId);
    n && n();
  }, Ci;
}, Wl = (r, e) => {
  if (Co())
    return { id: setInterval(r, e) };
  const t = Nl++;
  return Sn.set(t, () => {
    r();
  }), _o().postMessage({
    type: "set-interval",
    timerId: t,
    delay: e
  }), { id: t };
}, Ll = (r) => {
  if (Co()) {
    clearInterval(r.id);
    return;
  }
  p(typeof r.id == "number"), Sn.delete(r.id), _o().postMessage({
    type: "clear-interval",
    timerId: r.id
  });
}, $i = (r) => new Promise((e) => setTimeout(e, r)), fi = (r) => Array.isArray(r) ? r : [r];
class or {
  constructor() {
    this._listeners = /* @__PURE__ */ new Map();
  }
  /** Registers a listener for the given event. Returns a function that, when called, removes the listener again. */
  on(e, t, i) {
    this._listeners.has(e) || this._listeners.set(e, /* @__PURE__ */ new Set());
    const s = { fn: t, once: i?.once ?? !1 };
    return this._listeners.get(e).add(s), () => {
      this._listeners.get(e)?.delete(s);
    };
  }
  /** @internal */
  _emit(...e) {
    const [t, i] = e, s = this._listeners.get(t);
    if (s)
      for (const n of s) {
        try {
          n.fn(i);
        } catch (a) {
          console.error(a);
        }
        n.once && s.delete(n);
      }
  }
}
const Jt = (r) => Math.ceil(r / 2) * 2;
class ym {
  constructor(e) {
    this._queue = [], this._errored = !1, this.parallelism = e;
  }
  /** Whether any function has errored. The runner is effectively bricked if this is `true`, by design. */
  get errored() {
    return this._errored;
  }
  /** The number of tasks currently running. */
  get inFlightCount() {
    return this._queue.length;
  }
  /**
   * Schedules an async function to be run. If the maximum allowed level of parallelism has not yet been reached,
   * the function will be executed immediately and `run()` will resolve immediately. Otherwise, the function will be
   * called as soon as any currently-running function finishes, and `run()` will only resolve then.
   *
   * Throws if the runner is errored.
   */
  async run(e) {
    for (this._errored && await Promise.race(this._queue); this._queue.length >= this.parallelism; )
      await Promise.race(this._queue);
    const t = e();
    this._queue.push(t), t.then(() => vr(this._queue, t)).catch(() => this._errored = !0);
  }
  /** Waits for all currently running functions to finish. Throws if the runner is errored. */
  async flush() {
    await Promise.all(this._queue);
  }
}
const Io = (r) => r !== null && typeof r == "object" && Object.getPrototypeOf(r) === Object.prototype && Object.values(r).every((e) => typeof e == "string");
var Je;
(function(r) {
  r[r.Silent = 0] = "Silent", r[r.Errors = 1] = "Errors", r[r.Warnings = 2] = "Warnings", r[r.Info = 3] = "Info";
})(Je || (Je = {}));
class D {
  constructor() {
  }
  /** The current log level. Defaults to {@link LogLevel.Info}. */
  static get level() {
    return D._level;
  }
  static set level(e) {
    if (e !== Je.Silent && e !== Je.Errors && e !== Je.Warnings && e !== Je.Info)
      throw new TypeError("Invalid log level. Use one of the values of the LogLevel enum.");
    D._level = e;
  }
  /** @internal */
  static get _emitter() {
    return D._emitterInstance ??= new or();
  }
  /** Registers a listener for a log event. Returns a function that, when called, removes the listener again. */
  static on(e, t, i) {
    return D._emitter.on(e, t, i);
  }
  /** @internal */
  static _error(...e) {
    D._emitter._emit("error", e), D._level >= Je.Errors && console.error(...e);
  }
  /** @internal */
  static _warn(...e) {
    D._emitter._emit("warn", e), D._level >= Je.Warnings && console.warn(...e);
  }
  /** @internal */
  static _info(...e) {
    D._emitter._emit("info", e), D._level >= Je.Info && console.info(...e);
  }
}
D._level = Je.Info;
D._emitterInstance = null;
class hi {
  /** Creates a new {@link RichImageData}. */
  constructor(e, t) {
    if (this.data = e, this.mimeType = t, !(e instanceof Uint8Array))
      throw new TypeError("data must be a Uint8Array.");
    if (typeof t != "string")
      throw new TypeError("mimeType must be a string.");
  }
}
class An {
  /** Creates a new {@link AttachedFile}. */
  constructor(e, t, i, s) {
    if (this.data = e, this.mimeType = t, this.name = i, this.description = s, !(e instanceof Uint8Array))
      throw new TypeError("data must be a Uint8Array.");
    if (t !== void 0 && typeof t != "string")
      throw new TypeError("mimeType, when provided, must be a string.");
    if (i !== void 0 && typeof i != "string")
      throw new TypeError("name, when provided, must be a string.");
    if (s !== void 0 && typeof s != "string")
      throw new TypeError("description, when provided, must be a string.");
  }
}
const Hs = (r) => {
  if (!r || typeof r != "object")
    throw new TypeError("tags must be an object.");
  if (r.title !== void 0 && typeof r.title != "string")
    throw new TypeError("tags.title, when provided, must be a string.");
  if (r.description !== void 0 && typeof r.description != "string")
    throw new TypeError("tags.description, when provided, must be a string.");
  if (r.artist !== void 0 && typeof r.artist != "string")
    throw new TypeError("tags.artist, when provided, must be a string.");
  if (r.album !== void 0 && typeof r.album != "string")
    throw new TypeError("tags.album, when provided, must be a string.");
  if (r.albumArtist !== void 0 && typeof r.albumArtist != "string")
    throw new TypeError("tags.albumArtist, when provided, must be a string.");
  if (r.trackNumber !== void 0 && (!Number.isInteger(r.trackNumber) || r.trackNumber <= 0))
    throw new TypeError("tags.trackNumber, when provided, must be a positive integer.");
  if (r.tracksTotal !== void 0 && (!Number.isInteger(r.tracksTotal) || r.tracksTotal <= 0))
    throw new TypeError("tags.tracksTotal, when provided, must be a positive integer.");
  if (r.discNumber !== void 0 && (!Number.isInteger(r.discNumber) || r.discNumber <= 0))
    throw new TypeError("tags.discNumber, when provided, must be a positive integer.");
  if (r.discsTotal !== void 0 && (!Number.isInteger(r.discsTotal) || r.discsTotal <= 0))
    throw new TypeError("tags.discsTotal, when provided, must be a positive integer.");
  if (r.genre !== void 0 && typeof r.genre != "string")
    throw new TypeError("tags.genre, when provided, must be a string.");
  if (r.date !== void 0 && (!(r.date instanceof Date) || Number.isNaN(r.date.getTime())))
    throw new TypeError("tags.date, when provided, must be a valid Date.");
  if (r.lyrics !== void 0 && typeof r.lyrics != "string")
    throw new TypeError("tags.lyrics, when provided, must be a string.");
  if (r.images !== void 0) {
    if (!Array.isArray(r.images))
      throw new TypeError("tags.images, when provided, must be an array.");
    for (const e of r.images) {
      if (!e || typeof e != "object")
        throw new TypeError("Each image in tags.images must be an object.");
      if (!(e.data instanceof Uint8Array))
        throw new TypeError("Each image.data must be a Uint8Array.");
      if (typeof e.mimeType != "string")
        throw new TypeError("Each image.mimeType must be a string.");
      if (!["coverFront", "coverBack", "unknown"].includes(e.kind))
        throw new TypeError("Each image.kind must be 'coverFront', 'coverBack', or 'unknown'.");
    }
  }
  if (r.comment !== void 0 && typeof r.comment != "string")
    throw new TypeError("tags.comment, when provided, must be a string.");
  if (r.raw !== void 0) {
    if (!r.raw || typeof r.raw != "object")
      throw new TypeError("tags.raw, when provided, must be an object.");
    for (const e of Object.values(r.raw))
      if (e !== null && typeof e != "string" && !(e instanceof Uint8Array) && !(e instanceof hi) && !(e instanceof An) && !Io(e))
        throw new TypeError("Each value in tags.raw must be a string, Uint8Array, RichImageData, AttachedFile, Record<string, string>, or null.");
  }
}, Gi = (r) => r.title === void 0 && r.description === void 0 && r.artist === void 0 && r.album === void 0 && r.albumArtist === void 0 && r.trackNumber === void 0 && r.tracksTotal === void 0 && r.discNumber === void 0 && r.discsTotal === void 0 && r.genre === void 0 && r.date === void 0 && r.lyrics === void 0 && (!r.images || r.images.length === 0) && r.comment === void 0 && (r.raw === void 0 || Object.keys(r.raw).length === 0), yt = {
  default: !0,
  primary: !0,
  forced: !1,
  original: !1,
  commentary: !1,
  hearingImpaired: !1,
  visuallyImpaired: !1
}, ql = (r) => {
  if (!r || typeof r != "object")
    throw new TypeError("disposition must be an object.");
  if (r.default !== void 0 && typeof r.default != "boolean")
    throw new TypeError("disposition.default must be a boolean.");
  if (r.primary !== void 0 && typeof r.primary != "boolean")
    throw new TypeError("disposition.primary must be a boolean.");
  if (r.forced !== void 0 && typeof r.forced != "boolean")
    throw new TypeError("disposition.forced must be a boolean.");
  if (r.original !== void 0 && typeof r.original != "boolean")
    throw new TypeError("disposition.original must be a boolean.");
  if (r.commentary !== void 0 && typeof r.commentary != "boolean")
    throw new TypeError("disposition.commentary must be a boolean.");
  if (r.hearingImpaired !== void 0 && typeof r.hearingImpaired != "boolean")
    throw new TypeError("disposition.hearingImpaired must be a boolean.");
  if (r.visuallyImpaired !== void 0 && typeof r.visuallyImpaired != "boolean")
    throw new TypeError("disposition.visuallyImpaired must be a boolean.");
};
class j {
  constructor(e) {
    this.bytes = e, this.pos = 0;
  }
  seekToByte(e) {
    this.pos = 8 * e;
  }
  readBit() {
    const e = Math.floor(this.pos / 8), t = this.bytes[e] ?? 0, i = 7 - (this.pos & 7), s = (t & 1 << i) >> i;
    return this.pos++, s;
  }
  readBits(e) {
    if (e === 1)
      return this.readBit();
    let t = 0;
    for (let i = 0; i < e; i++)
      t <<= 1, t |= this.readBit();
    return t;
  }
  writeBits(e, t) {
    const i = this.pos + e;
    for (let s = this.pos; s < i; s++) {
      const n = Math.floor(s / 8);
      let a = this.bytes[n];
      const o = 7 - (s & 7);
      a &= ~(1 << o), a |= (t & 1 << i - s - 1) >> i - s - 1 << o, this.bytes[n] = a;
    }
    this.pos = i;
  }
  readAlignedByte() {
    if (this.pos % 8 !== 0)
      throw new Error("Bitstream is not byte-aligned.");
    const e = this.pos / 8, t = this.bytes[e] ?? 0;
    return this.pos += 8, t;
  }
  skipBits(e) {
    this.pos += e;
  }
  getBitsLeft() {
    return this.bytes.length * 8 - this.pos;
  }
  clone() {
    const e = new j(this.bytes);
    return e.pos = this.pos, e;
  }
}
const Ft = [
  96e3,
  88200,
  64e3,
  48e3,
  44100,
  32e3,
  24e3,
  22050,
  16e3,
  12e3,
  11025,
  8e3,
  7350
], Ai = [-1, 1, 2, 3, 4, 5, 6, 8], cr = (r) => {
  if (!r || r.byteLength < 2)
    throw new TypeError("AAC description must be at least 2 bytes long.");
  const e = new j(r);
  let t = e.readBits(5);
  t === 31 && (t = 32 + e.readBits(6));
  const i = e.readBits(4);
  let s = null;
  i === 15 ? s = e.readBits(24) : i < Ft.length && (s = Ft[i]);
  const n = e.readBits(4);
  let a = null;
  return n >= 1 && n <= 7 && (a = Ai[n]), {
    objectType: t,
    frequencyIndex: i,
    sampleRate: s,
    channelConfiguration: n,
    numberOfChannels: a
  };
}, xn = (r) => {
  let e = Ft.indexOf(r.sampleRate), t = null;
  e === -1 && (e = 15, t = r.sampleRate);
  const i = Ai.indexOf(r.numberOfChannels);
  if (i === -1)
    throw new TypeError(`Unsupported number of channels: ${r.numberOfChannels}`);
  let s = 13;
  r.objectType >= 32 && (s += 6), e === 15 && (s += 24);
  const n = Math.ceil(s / 8), a = new Uint8Array(n), o = new j(a);
  return r.objectType < 32 ? o.writeBits(5, r.objectType) : (o.writeBits(5, 31), o.writeBits(6, r.objectType - 32)), o.writeBits(4, e), e === 15 && o.writeBits(24, t), o.writeBits(4, i), a;
}, Eo = (r) => {
  const e = new Uint8Array(7), t = new j(e), { objectType: i, frequencyIndex: s, channelConfiguration: n } = r, a = i - 1;
  return t.writeBits(12, 4095), t.writeBits(1, 0), t.writeBits(2, 0), t.writeBits(1, 1), t.writeBits(2, a), t.writeBits(4, s), t.writeBits(1, 0), t.writeBits(3, n), t.writeBits(1, 0), t.writeBits(1, 0), t.writeBits(1, 0), t.writeBits(1, 0), t.skipBits(13), t.writeBits(11, 2047), t.writeBits(2, 0), { header: e, bitstream: t };
}, vo = (r, e) => {
  r.pos = 30, r.writeBits(13, e);
};
const de = [
  "avc",
  "hevc",
  "vp9",
  "av1",
  "vp8",
  "prores"
], ge = [
  "pcm-s16",
  // We don't prefix 'le' so we're compatible with the WebCodecs-registered PCM codec strings
  "pcm-s16be",
  "pcm-s24",
  "pcm-s24be",
  "pcm-s32",
  "pcm-s32be",
  "pcm-f32",
  "pcm-f32be",
  "pcm-f64",
  "pcm-f64be",
  "pcm-u8",
  "pcm-s8",
  "ulaw",
  "alaw"
], Ht = [
  "aac",
  "opus",
  "mp3",
  "vorbis",
  "flac",
  "ac3",
  "eac3"
], we = [
  ...Ht,
  ...ge
], tt = [
  "webvtt"
], Mr = [
  { maxMacroblocks: 99, maxBitrate: 64e3, maxDpbMbs: 396, level: 10 },
  // Level 1
  { maxMacroblocks: 396, maxBitrate: 192e3, maxDpbMbs: 900, level: 11 },
  // Level 1.1
  { maxMacroblocks: 396, maxBitrate: 384e3, maxDpbMbs: 2376, level: 12 },
  // Level 1.2
  { maxMacroblocks: 396, maxBitrate: 768e3, maxDpbMbs: 2376, level: 13 },
  // Level 1.3
  { maxMacroblocks: 396, maxBitrate: 2e6, maxDpbMbs: 2376, level: 20 },
  // Level 2
  { maxMacroblocks: 792, maxBitrate: 4e6, maxDpbMbs: 4752, level: 21 },
  // Level 2.1
  { maxMacroblocks: 1620, maxBitrate: 4e6, maxDpbMbs: 8100, level: 22 },
  // Level 2.2
  { maxMacroblocks: 1620, maxBitrate: 1e7, maxDpbMbs: 8100, level: 30 },
  // Level 3
  { maxMacroblocks: 3600, maxBitrate: 14e6, maxDpbMbs: 18e3, level: 31 },
  // Level 3.1
  { maxMacroblocks: 5120, maxBitrate: 2e7, maxDpbMbs: 20480, level: 32 },
  // Level 3.2
  { maxMacroblocks: 8192, maxBitrate: 2e7, maxDpbMbs: 32768, level: 40 },
  // Level 4
  { maxMacroblocks: 8192, maxBitrate: 5e7, maxDpbMbs: 32768, level: 41 },
  // Level 4.1
  { maxMacroblocks: 8704, maxBitrate: 5e7, maxDpbMbs: 34816, level: 42 },
  // Level 4.2
  { maxMacroblocks: 22080, maxBitrate: 135e6, maxDpbMbs: 110400, level: 50 },
  // Level 5
  { maxMacroblocks: 36864, maxBitrate: 24e7, maxDpbMbs: 184320, level: 51 },
  // Level 5.1
  { maxMacroblocks: 36864, maxBitrate: 24e7, maxDpbMbs: 184320, level: 52 },
  // Level 5.2
  { maxMacroblocks: 139264, maxBitrate: 24e7, maxDpbMbs: 696320, level: 60 },
  // Level 6
  { maxMacroblocks: 139264, maxBitrate: 48e7, maxDpbMbs: 696320, level: 61 },
  // Level 6.1
  { maxMacroblocks: 139264, maxBitrate: 8e8, maxDpbMbs: 696320, level: 62 }
  // Level 6.2
], na = [
  { maxPictureSize: 36864, maxBitrate: 128e3, tier: "L", level: 30 },
  // Level 1 (Low Tier)
  { maxPictureSize: 122880, maxBitrate: 15e5, tier: "L", level: 60 },
  // Level 2 (Low Tier)
  { maxPictureSize: 245760, maxBitrate: 3e6, tier: "L", level: 63 },
  // Level 2.1 (Low Tier)
  { maxPictureSize: 552960, maxBitrate: 6e6, tier: "L", level: 90 },
  // Level 3 (Low Tier)
  { maxPictureSize: 983040, maxBitrate: 1e7, tier: "L", level: 93 },
  // Level 3.1 (Low Tier)
  { maxPictureSize: 2228224, maxBitrate: 12e6, tier: "L", level: 120 },
  // Level 4 (Low Tier)
  { maxPictureSize: 2228224, maxBitrate: 3e7, tier: "H", level: 120 },
  // Level 4 (High Tier)
  { maxPictureSize: 2228224, maxBitrate: 2e7, tier: "L", level: 123 },
  // Level 4.1 (Low Tier)
  { maxPictureSize: 2228224, maxBitrate: 5e7, tier: "H", level: 123 },
  // Level 4.1 (High Tier)
  { maxPictureSize: 8912896, maxBitrate: 25e6, tier: "L", level: 150 },
  // Level 5 (Low Tier)
  { maxPictureSize: 8912896, maxBitrate: 1e8, tier: "H", level: 150 },
  // Level 5 (High Tier)
  { maxPictureSize: 8912896, maxBitrate: 4e7, tier: "L", level: 153 },
  // Level 5.1 (Low Tier)
  { maxPictureSize: 8912896, maxBitrate: 16e7, tier: "H", level: 153 },
  // Level 5.1 (High Tier)
  { maxPictureSize: 8912896, maxBitrate: 6e7, tier: "L", level: 156 },
  // Level 5.2 (Low Tier)
  { maxPictureSize: 8912896, maxBitrate: 24e7, tier: "H", level: 156 },
  // Level 5.2 (High Tier)
  { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "L", level: 180 },
  // Level 6 (Low Tier)
  { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 180 },
  // Level 6 (High Tier)
  { maxPictureSize: 35651584, maxBitrate: 12e7, tier: "L", level: 183 },
  // Level 6.1 (Low Tier)
  { maxPictureSize: 35651584, maxBitrate: 48e7, tier: "H", level: 183 },
  // Level 6.1 (High Tier)
  { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "L", level: 186 },
  // Level 6.2 (Low Tier)
  { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 186 }
  // Level 6.2 (High Tier)
], _t = [
  { maxPictureSize: 36864, maxBitrate: 2e5, level: 10 },
  // Level 1
  { maxPictureSize: 73728, maxBitrate: 8e5, level: 11 },
  // Level 1.1
  { maxPictureSize: 122880, maxBitrate: 18e5, level: 20 },
  // Level 2
  { maxPictureSize: 245760, maxBitrate: 36e5, level: 21 },
  // Level 2.1
  { maxPictureSize: 552960, maxBitrate: 72e5, level: 30 },
  // Level 3
  { maxPictureSize: 983040, maxBitrate: 12e6, level: 31 },
  // Level 3.1
  { maxPictureSize: 2228224, maxBitrate: 18e6, level: 40 },
  // Level 4
  { maxPictureSize: 2228224, maxBitrate: 3e7, level: 41 },
  // Level 4.1
  { maxPictureSize: 8912896, maxBitrate: 6e7, level: 50 },
  // Level 5
  { maxPictureSize: 8912896, maxBitrate: 12e7, level: 51 },
  // Level 5.1
  { maxPictureSize: 8912896, maxBitrate: 18e7, level: 52 },
  // Level 5.2
  { maxPictureSize: 35651584, maxBitrate: 18e7, level: 60 },
  // Level 6
  { maxPictureSize: 35651584, maxBitrate: 24e7, level: 61 },
  // Level 6.1
  { maxPictureSize: 35651584, maxBitrate: 48e7, level: 62 }
  // Level 6.2
], aa = [
  { maxPictureSize: 147456, maxBitrate: 15e5, tier: "M", level: 0 },
  // Level 2.0 (Main Tier)
  { maxPictureSize: 278784, maxBitrate: 3e6, tier: "M", level: 1 },
  // Level 2.1 (Main Tier)
  { maxPictureSize: 665856, maxBitrate: 6e6, tier: "M", level: 4 },
  // Level 3.0 (Main Tier)
  { maxPictureSize: 1065024, maxBitrate: 1e7, tier: "M", level: 5 },
  // Level 3.1 (Main Tier)
  { maxPictureSize: 2359296, maxBitrate: 12e6, tier: "M", level: 8 },
  // Level 4.0 (Main Tier)
  { maxPictureSize: 2359296, maxBitrate: 3e7, tier: "H", level: 8 },
  // Level 4.0 (High Tier)
  { maxPictureSize: 2359296, maxBitrate: 2e7, tier: "M", level: 9 },
  // Level 4.1 (Main Tier)
  { maxPictureSize: 2359296, maxBitrate: 5e7, tier: "H", level: 9 },
  // Level 4.1 (High Tier)
  { maxPictureSize: 8912896, maxBitrate: 3e7, tier: "M", level: 12 },
  // Level 5.0 (Main Tier)
  { maxPictureSize: 8912896, maxBitrate: 1e8, tier: "H", level: 12 },
  // Level 5.0 (High Tier)
  { maxPictureSize: 8912896, maxBitrate: 4e7, tier: "M", level: 13 },
  // Level 5.1 (Main Tier)
  { maxPictureSize: 8912896, maxBitrate: 16e7, tier: "H", level: 13 },
  // Level 5.1 (High Tier)
  { maxPictureSize: 8912896, maxBitrate: 6e7, tier: "M", level: 14 },
  // Level 5.2 (Main Tier)
  { maxPictureSize: 8912896, maxBitrate: 24e7, tier: "H", level: 14 },
  // Level 5.2 (High Tier)
  { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "M", level: 15 },
  // Level 5.3 (Main Tier)
  { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 15 },
  // Level 5.3 (High Tier)
  { maxPictureSize: 35651584, maxBitrate: 6e7, tier: "M", level: 16 },
  // Level 6.0 (Main Tier)
  { maxPictureSize: 35651584, maxBitrate: 24e7, tier: "H", level: 16 },
  // Level 6.0 (High Tier)
  { maxPictureSize: 35651584, maxBitrate: 1e8, tier: "M", level: 17 },
  // Level 6.1 (Main Tier)
  { maxPictureSize: 35651584, maxBitrate: 48e7, tier: "H", level: 17 },
  // Level 6.1 (High Tier)
  { maxPictureSize: 35651584, maxBitrate: 16e7, tier: "M", level: 18 },
  // Level 6.2 (Main Tier)
  { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 18 },
  // Level 6.2 (High Tier)
  { maxPictureSize: 35651584, maxBitrate: 16e7, tier: "M", level: 19 },
  // Level 6.3 (Main Tier)
  { maxPictureSize: 35651584, maxBitrate: 8e8, tier: "H", level: 19 }
  // Level 6.3 (High Tier)
], oa = ".01.01.01.01.00", ca = ".0.110.01.01.01.0", jt = [
  "ap4x",
  // ProRes 4444 XQ
  "ap4h",
  // ProRes 4444
  "apch",
  // ProRes 422 High Quality
  "apcn",
  // ProRes 422 Standard Definition
  "apcs",
  // ProRes 422 LT
  "apco"
  // ProRes 422 Proxy
], Hl = [
  { fourCc: "apco", bitrate: 45e6, alpha: !1 },
  // 422 Proxy
  { fourCc: "apcs", bitrate: 102e6, alpha: !1 },
  // 422 LT
  { fourCc: "apcn", bitrate: 147e6, alpha: !1 },
  // 422 Standard
  { fourCc: "apch", bitrate: 22e7, alpha: !1 },
  // 422 HQ
  { fourCc: "ap4h", bitrate: 33e7, alpha: !0 },
  // 4444
  { fourCc: "ap4x", bitrate: 5e8, alpha: !0 }
  // 4444 XQ
], Fo = (r, e, t, i, s) => {
  if (r === "avc") {
    const a = Math.ceil(e / 16) * Math.ceil(t / 16), o = Mr.find((f) => a <= f.maxMacroblocks && i <= f.maxBitrate) ?? ne(Mr), c = o ? o.level : 0, l = "64".padStart(2, "0"), u = "00", d = c.toString(16).padStart(2, "0");
    return `avc1.${l}${u}${d}`;
  } else if (r === "hevc") {
    const c = e * t, l = na.find((d) => c <= d.maxPictureSize && i <= d.maxBitrate) ?? ne(na);
    return `hev1.1.6.${l.tier}${l.level}.B0`;
  } else {
    if (r === "vp8")
      return "vp8";
    if (r === "vp9") {
      const a = e * t;
      return `vp09.00.${(_t.find((l) => a <= l.maxPictureSize && i <= l.maxBitrate) ?? ne(_t)).level.toString().padStart(2, "0")}.08`;
    } else if (r === "av1") {
      const a = e * t, o = aa.find((u) => a <= u.maxPictureSize && i <= u.maxBitrate) ?? ne(aa);
      return `av01.0.${o.level.toString().padStart(2, "0")}${o.tier}.08`;
    } else if (r === "prores") {
      const a = Math.pow(e * t / 2073600, 0.95), o = Hl.filter((u) => u.alpha === s);
      let c = o[0].fourCc, l = 1 / 0;
      for (const { fourCc: u, bitrate: d } of o) {
        const f = Math.abs(d * a - i);
        f < l && (l = f, c = u);
      }
      return c;
    } else
      pe(r);
  }
  throw new TypeError(`Unhandled codec '${String(r)}'.`);
}, jl = (r) => {
  const e = r.split("."), t = Number(e[1]), i = Number(e[2]), s = Number(e[3]), n = e[4] ? Number(e[4]) : 1;
  return [
    1,
    1,
    t,
    2,
    1,
    i,
    3,
    1,
    s,
    4,
    1,
    n
  ];
}, Bo = (r) => {
  const e = r.split("."), s = (1 << 7) + 1, n = Number(e[1]), a = e[2], o = Number(a.slice(0, -1)), c = (n << 5) + o, l = a.slice(-1) === "H" ? 1 : 0, d = Number(e[3]) === 8 ? 0 : 1, f = 0, h = e[4] ? Number(e[4]) : 0, g = e[5] ? Number(e[5][0]) : 1, m = e[5] ? Number(e[5][1]) : 1, w = e[5] ? Number(e[5][2]) : 0, y = (l << 7) + (d << 6) + (f << 5) + (h << 4) + (g << 3) + (m << 2) + w;
  return [s, c, y, 0];
}, Pn = (r) => {
  const { codec: e, codecDescription: t, colorSpace: i, avcCodecInfo: s, hevcCodecInfo: n, vp9CodecInfo: a, av1CodecInfo: o, proresFormat: c } = r;
  if (e === "avc") {
    if (p(r.avcType !== null), s) {
      const l = new Uint8Array([
        s.avcProfileIndication,
        s.profileCompatibility,
        s.avcLevelIndication
      ]);
      return `avc${r.avcType}.${Hi(l)}`;
    }
    if (!t || t.byteLength < 4)
      throw new TypeError("AVC decoder description is not provided or is not at least 4 bytes long.");
    return `avc${r.avcType}.${Hi(t.subarray(1, 4))}`;
  } else if (e === "hevc") {
    let l, u, d, f, h, g;
    if (n)
      l = n.generalProfileSpace, u = n.generalProfileIdc, d = Jn(n.generalProfileCompatibilityFlags), f = n.generalTierFlag, h = n.generalLevelIdc, g = [...n.generalConstraintIndicatorFlags];
    else {
      if (!t || t.byteLength < 23)
        throw new TypeError("HEVC decoder description is not provided or is not at least 23 bytes long.");
      const w = q(t), y = w.getUint8(1);
      l = y >> 6 & 3, u = y & 31, d = Jn(w.getUint32(2)), f = y >> 5 & 1, h = w.getUint8(12), g = [];
      for (let b = 0; b < 6; b++)
        g.push(w.getUint8(6 + b));
    }
    let m = "hev1.";
    for (m += ["", "A", "B", "C"][l] + u, m += ".", m += d.toString(16).toUpperCase(), m += ".", m += f === 0 ? "L" : "H", m += h; g.length > 0 && g[g.length - 1] === 0; )
      g.pop();
    return g.length > 0 && (m += ".", m += g.map((w) => w.toString(16).toUpperCase()).join(".")), m;
  } else {
    if (e === "vp8")
      return "vp8";
    if (e === "vp9") {
      if (!a) {
        const b = r.width * r.height;
        let k = ne(_t).level;
        for (const S of _t)
          if (b <= S.maxPictureSize) {
            k = S.level;
            break;
          }
        return `vp09.00.${k.toString().padStart(2, "0")}.08`;
      }
      const l = a.profile.toString().padStart(2, "0"), u = a.level.toString().padStart(2, "0"), d = a.bitDepth.toString().padStart(2, "0"), f = a.chromaSubsampling.toString().padStart(2, "0"), h = a.colourPrimaries.toString().padStart(2, "0"), g = a.transferCharacteristics.toString().padStart(2, "0"), m = a.matrixCoefficients.toString().padStart(2, "0"), w = a.videoFullRangeFlag.toString().padStart(2, "0");
      let y = `vp09.${l}.${u}.${d}.${f}`;
      return y += `.${h}.${g}.${m}.${w}`, y.endsWith(oa) && (y = y.slice(0, -oa.length)), y;
    } else if (e === "av1") {
      if (!o) {
        const S = r.width * r.height;
        let T = ne(_t).level;
        for (const A of _t)
          if (S <= A.maxPictureSize) {
            T = A.level;
            break;
          }
        return `av01.0.${T.toString().padStart(2, "0")}M.08`;
      }
      const l = o.profile, u = o.level.toString().padStart(2, "0"), d = o.tier ? "H" : "M", f = o.bitDepth.toString().padStart(2, "0"), h = o.monochrome ? "1" : "0", g = 100 * o.chromaSubsamplingX + 10 * o.chromaSubsamplingY + 1 * (o.chromaSubsamplingX && o.chromaSubsamplingY ? o.chromaSamplePosition : 0), m = i?.primaries ? $t[i.primaries] : 1, w = i?.transfer ? Gt[i.transfer] : 1, y = i?.matrix ? Xt[i.matrix] : 1, b = i?.fullRange ? 1 : 0;
      let k = `av01.${l}.${u}${d}.${f}`;
      return k += `.${h}.${g.toString().padStart(3, "0")}`, k += `.${m.toString().padStart(2, "0")}`, k += `.${w.toString().padStart(2, "0")}`, k += `.${y.toString().padStart(2, "0")}`, k += `.${b}`, k.endsWith(ca) && (k = k.slice(0, -ca.length)), k;
    } else {
      if (e === "prores")
        return c ?? "apch";
      e !== null && pe(e);
    }
  }
  throw new TypeError(`Unhandled codec '${e}'.`);
}, Ro = (r, e, t) => {
  if (r === "aac")
    return e >= 2 && t <= 24e3 ? "mp4a.40.29" : t <= 24e3 ? "mp4a.40.5" : "mp4a.40.2";
  if (r === "mp3")
    return "mp3";
  if (r === "opus")
    return "opus";
  if (r === "vorbis")
    return "vorbis";
  if (r === "flac")
    return "flac";
  if (r === "ac3")
    return "ac-3";
  if (r === "eac3")
    return "ec-3";
  if (ge.includes(r))
    return r;
  throw new TypeError(`Unhandled codec '${r}'.`);
}, Cn = (r) => {
  const { codec: e, codecDescription: t, aacCodecInfo: i } = r;
  if (e === "aac") {
    if (!i)
      throw new TypeError("AAC codec info must be provided.");
    if (i.isMpeg2)
      return "mp4a.67";
    {
      let s;
      return i.objectType !== null ? s = i.objectType : s = cr(t).objectType, `mp4a.40.${s}`;
    }
  } else {
    if (e === "mp3")
      return "mp3";
    if (e === "opus")
      return "opus";
    if (e === "vorbis")
      return "vorbis";
    if (e === "flac")
      return "flac";
    if (e === "ac3")
      return "ac-3";
    if (e === "eac3")
      return "ec-3";
    if (e && ge.includes(e))
      return e;
  }
  throw new TypeError(`Unhandled codec '${e}'.`);
}, Kl = (r) => {
}, Ql = (r) => {
  switch (r.codec) {
    case "flac": {
      const e = Rr("ZkxhQ4AAACIQABAAAAYtACWtCsRC8AANRBhVFucAcYu5ASE2m1Dxv8tw");
      return r.sampleRate >= 1 << 20 || r.numberOfChannels > 8 ? !1 : (e[18] = r.sampleRate >>> 12, e[19] = r.sampleRate >>> 4, e[20] = (r.sampleRate & 15) << 4 | r.numberOfChannels - 1 << 1, e);
    }
    case "vorbis": {
      const e = Rr("Ah7/AgF2b3JiaXMAAAAAAoC7AAAAAAAAgLUBAAAAAAC4AQN2b3JiaXMNAAAATGF2ZjU4Ljc2LjEwMAgAAAAMAAAAbGFuZ3VhZ2U9dW5kGQAAAGhhbmRsZXJfbmFtZT1Tb3VuZEhhbmRsZXIWAAAAdmVuZG9yX2lkPVswXVswXVswXVswXSAAAABlbmNvZGVyPUxhdmM1OC4xMzQuMTAwIGxpYnZvcmJpcxAAAABtYWpvcl9icmFuZD1pc29tEQAAAG1pbm9yX3ZlcnNpb249NTEyIgAAAGNvbXBhdGlibGVfYnJhbmRzPWlzb21pc28yYXZjMW1wNDEmAAAAREVTQ1JJUFRJT049TWFkZSB3aXRoIFJlbW90aW9uIDQuMC4yNzgBBXZvcmJpcyVCQ1YBAEAAACRzGCpGpXMWhBAaQlAZ4xxCzmvsGUJMEYIcMkxbyyVzkCGkoEKIWyiB0JBVAABAAACHQXgUhIpBCCGEJT1YkoMnPQghhIg5eBSEaUEIIYQQQgghhBBCCCGERTlokoMnQQgdhOMwOAyD5Tj4HIRFOVgQgydB6CCED0K4moOsOQghhCQ1SFCDBjnoHITCLCiKgsQwuBaEBDUojILkMMjUgwtCiJqDSTX4GoRnQXgWhGlBCCGEJEFIkIMGQcgYhEZBWJKDBjm4FITLQagahCo5CB+EIDRkFQCQAACgoiiKoigKEBqyCgDIAAAQQFEUx3EcyZEcybEcCwgNWQUAAAEACAAAoEiKpEiO5EiSJFmSJVmSJVmS5omqLMuyLMuyLMsyEBqyCgBIAABQUQxFcRQHCA1ZBQBkAAAIoDiKpViKpWiK54iOCISGrAIAgAAABAAAEDRDUzxHlETPVFXXtm3btm3btm3btm3btm1blmUZCA1ZBQBAAAAQ0mlmqQaIMAMZBkJDVgEACAAAgBGKMMSA0JBVAABAAACAGEoOogmtOd+c46BZDppKsTkdnEi1eZKbirk555xzzsnmnDHOOeecopxZDJoJrTnnnMSgWQqaCa0555wnsXnQmiqtOeeccc7pYJwRxjnnnCateZCajbU555wFrWmOmkuxOeecSLl5UptLtTnnnHPOOeecc84555zqxekcnBPOOeecqL25lpvQxTnnnE/G6d6cEM4555xzzjnnnHPOOeecIDRkFQAABABAEIaNYdwpCNLnaCBGEWIaMulB9+gwCRqDnELq0ehopJQ6CCWVcVJKJwgNWQUAAAIAQAghhRRSSCGFFFJIIYUUYoghhhhyyimnoIJKKqmooowyyyyzzDLLLLPMOuyssw47DDHEEEMrrcRSU2011lhr7jnnmoO0VlprrbVSSimllFIKQkNWAQAgAAAEQgYZZJBRSCGFFGKIKaeccgoqqIDQkFUAACAAgAAAAABP8hzRER3RER3RER3RER3R8RzPESVREiVREi3TMjXTU0VVdWXXlnVZt31b2IVd933d933d+HVhWJZlWZZlWZZlWZZlWZZlWZYgNGQVAAACAAAghBBCSCGFFFJIKcYYc8w56CSUEAgNWQUAAAIACAAAAHAUR3EcyZEcSbIkS9IkzdIsT/M0TxM9URRF0zRV0RVdUTdtUTZl0zVdUzZdVVZtV5ZtW7Z125dl2/d93/d93/d93/d93/d9XQdCQ1YBABIAADqSIymSIimS4ziOJElAaMgqAEAGAEAAAIriKI7jOJIkSZIlaZJneZaomZrpmZ4qqkBoyCoAABAAQAAAAAAAAIqmeIqpeIqoeI7oiJJomZaoqZoryqbsuq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq4LhIasAgAkAAB0JEdyJEdSJEVSJEdygNCQVQCADACAAAAcwzEkRXIsy9I0T/M0TxM90RM901NFV3SB0JBVAAAgAIAAAAAAAAAMybAUy9EcTRIl1VItVVMt1VJF1VNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVN0zRNEwgNWQkAkAEAkBBTLS3GmgmLJGLSaqugYwxS7KWxSCpntbfKMYUYtV4ah5RREHupJGOKQcwtpNApJq3WVEKFFKSYYyoVUg5SIDRkhQAQmgHgcBxAsixAsiwAAAAAAAAAkDQN0DwPsDQPAAAAAAAAACRNAyxPAzTPAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABA0jRA8zxA8zwAAAAAAAAA0DwP8DwR8EQRAAAAAAAAACzPAzTRAzxRBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABA0jRA8zxA8zwAAAAAAAAAsDwP8EQR0DwRAAAAAAAAACzPAzxRBDzRAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAEOAAABBgIRQasiIAiBMAcEgSJAmSBM0DSJYFTYOmwTQBkmVB06BpME0AAAAAAAAAAAAAJE2DpkHTIIoASdOgadA0iCIAAAAAAAAAAAAAkqZB06BpEEWApGnQNGgaRBEAAAAAAAAAAAAAzzQhihBFmCbAM02IIkQRpgkAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAGHAAAAgwoQwUGrIiAIgTAHA4imUBAIDjOJYFAACO41gWAABYliWKAABgWZooAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAYcAAACDChDBQashIAiAIAcCiKZQHHsSzgOJYFJMmyAJYF0DyApgFEEQAIAAAocAAACLBBU2JxgEJDVgIAUQAABsWxLE0TRZKkaZoniiRJ0zxPFGma53meacLzPM80IYqiaJoQRVE0TZimaaoqME1VFQAAUOAAABBgg6bE4gCFhqwEAEICAByKYlma5nmeJ4qmqZokSdM8TxRF0TRNU1VJkqZ5niiKommapqqyLE3zPFEURdNUVVWFpnmeKIqiaaqq6sLzPE8URdE0VdV14XmeJ4qiaJqq6roQRVE0TdNUTVV1XSCKpmmaqqqqrgtETxRNU1Vd13WB54miaaqqq7ouEE3TVFVVdV1ZBpimaaqq68oyQFVV1XVdV5YBqqqqruu6sgxQVdd1XVmWZQCu67qyLMsCAAAOHAAAAoygk4wqi7DRhAsPQKEhKwKAKAAAwBimFFPKMCYhpBAaxiSEFEImJaXSUqogpFJSKRWEVEoqJaOUUmopVRBSKamUCkIqJZVSAADYgQMA2IGFUGjISgAgDwCAMEYpxhhzTiKkFGPOOScRUoox55yTSjHmnHPOSSkZc8w556SUzjnnnHNSSuacc845KaVzzjnnnJRSSuecc05KKSWEzkEnpZTSOeecEwAAVOAAABBgo8jmBCNBhYasBABSAQAMjmNZmuZ5omialiRpmud5niiapiZJmuZ5nieKqsnzPE8URdE0VZXneZ4oiqJpqirXFUXTNE1VVV2yLIqmaZqq6rowTdNUVdd1XZimaaqq67oubFtVVdV1ZRm2raqq6rqyDFzXdWXZloEsu67s2rIAAPAEBwCgAhtWRzgpGgssNGQlAJABAEAYg5BCCCFlEEIKIYSUUggJAAAYcAAACDChDBQashIASAUAAIyx1lprrbXWQGettdZaa62AzFprrbXWWmuttdZaa6211lJrrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmstpZRSSimllFJKKaWUUkoppZRSSgUA+lU4APg/2LA6wknRWGChISsBgHAAAMAYpRhzDEIppVQIMeacdFRai7FCiDHnJKTUWmzFc85BKCGV1mIsnnMOQikpxVZjUSmEUlJKLbZYi0qho5JSSq3VWIwxqaTWWoutxmKMSSm01FqLMRYjbE2ptdhqq7EYY2sqLbQYY4zFCF9kbC2m2moNxggjWywt1VprMMYY3VuLpbaaizE++NpSLDHWXAAAd4MDAESCjTOsJJ0VjgYXGrISAAgJACAQUooxxhhzzjnnpFKMOeaccw5CCKFUijHGnHMOQgghlIwx5pxzEEIIIYRSSsaccxBCCCGEkFLqnHMQQgghhBBKKZ1zDkIIIYQQQimlgxBCCCGEEEoopaQUQgghhBBCCKmklEIIIYRSQighlZRSCCGEEEIpJaSUUgohhFJCCKGElFJKKYUQQgillJJSSimlEkoJJYQSUikppRRKCCGUUkpKKaVUSgmhhBJKKSWllFJKIYQQSikFAAAcOAAABBhBJxlVFmGjCRcegEJDVgIAZAAAkKKUUiktRYIipRikGEtGFXNQWoqocgxSzalSziDmJJaIMYSUk1Qy5hRCDELqHHVMKQYtlRhCxhik2HJLoXMOAAAAQQCAgJAAAAMEBTMAwOAA4XMQdAIERxsAgCBEZohEw0JweFAJEBFTAUBigkIuAFRYXKRdXECXAS7o4q4DIQQhCEEsDqCABByccMMTb3jCDU7QKSp1IAAAAAAADADwAACQXAAREdHMYWRobHB0eHyAhIiMkAgAAAAAABcAfAAAJCVAREQ0cxgZGhscHR4fICEiIyQBAIAAAgAAAAAggAAEBAQAAAAAAAIAAAAEBA=="), t = q(e);
      return t.setUint8(15, r.numberOfChannels), t.setUint32(16, r.sampleRate, !0), e;
    }
    default:
      return;
  }
}, xi = 48e3, Mo = /^pcm-([usf])(\d+)(be)?$/, Qe = (r) => {
  if (p(ge.includes(r)), r === "ulaw")
    return { dataType: "ulaw", sampleSize: 1, littleEndian: !0, silentValue: 255 };
  if (r === "alaw")
    return { dataType: "alaw", sampleSize: 1, littleEndian: !0, silentValue: 213 };
  const e = Mo.exec(r);
  p(e);
  let t;
  e[1] === "u" ? t = "unsigned" : e[1] === "s" ? t = "signed" : t = "float";
  const i = Number(e[2]) / 8, s = e[3] !== "be", n = r === "pcm-u8" ? 2 ** 7 : 0;
  return { dataType: t, sampleSize: i, littleEndian: s, silentValue: n };
}, je = (r) => r.startsWith("avc1") || r.startsWith("avc3") ? "avc" : r.startsWith("hev1") || r.startsWith("hvc1") ? "hevc" : r === "vp8" ? "vp8" : r.startsWith("vp09") ? "vp9" : r.startsWith("av01") ? "av1" : jt.includes(r) ? "prores" : r === "mp3" || r === "mp4a.69" || r === "mp4a.6B" || r === "mp4a.6b" || r === "mp4a.40.34" ? "mp3" : r.startsWith("mp4a.40.") || r === "mp4a.67" ? "aac" : r === "opus" ? "opus" : r === "vorbis" ? "vorbis" : r === "flac" ? "flac" : r === "ac-3" || r === "ac3" ? "ac3" : r === "ec-3" || r === "eac3" ? "eac3" : r === "ulaw" ? "ulaw" : r === "alaw" ? "alaw" : Mo.test(r) ? r : r === "webvtt" ? "webvtt" : null, $l = (r) => r === "avc" ? {
  avc: {
    format: "avc"
    // Ensure the format is not Annex B
  }
} : r === "hevc" ? {
  hevc: {
    format: "hevc"
    // Ensure the format is not Annex B
  }
} : {}, Gl = (r) => r === "aac" ? {
  aac: {
    format: "aac"
    // Ensure the format is not ADTS
  }
} : r === "opus" ? {
  opus: {
    format: "opus"
  }
} : {}, Xl = ["avc1", "avc3", "hev1", "hvc1", "vp8", "vp09", "av01", ...jt], Yl = /^(avc1|avc3)\.[0-9a-fA-F]{6}$/, Zl = /^(hev1|hvc1)\.(?:[ABC]?\d+)\.[0-9a-fA-F]{1,8}\.[LH]\d+(?:\.[0-9a-fA-F]{1,2}){0,6}$/, Jl = /^vp09(?:\.\d{2}){3}(?:(?:\.\d{2}){5})?$/, eu = /^av01\.\d\.\d{2}[MH]\.\d{2}(?:\.\d\.\d{3}\.\d{2}\.\d{2}\.\d{2}\.\d)?$/, lr = (r, e) => {
  if (!r)
    throw new TypeError("Video chunk metadata must be provided.");
  if (typeof r != "object")
    throw new TypeError("Video chunk metadata must be an object.");
  if (!r.decoderConfig)
    throw new TypeError("Video chunk metadata must include a decoder configuration.");
  if (typeof r.decoderConfig != "object")
    throw new TypeError("Video chunk metadata decoder configuration must be an object.");
  if (typeof r.decoderConfig.codec != "string")
    throw new TypeError("Video chunk metadata decoder configuration must specify a codec string.");
  if (!Xl.some((t) => r.decoderConfig.codec.startsWith(t)))
    throw new TypeError("Video chunk metadata decoder configuration codec string must be a valid video codec string as specified in the Mediabunny Codec Registry.");
  if (!Number.isInteger(r.decoderConfig.codedWidth) || r.decoderConfig.codedWidth <= 0)
    throw new TypeError("Video chunk metadata decoder configuration must specify a valid codedWidth (positive integer).");
  if (!Number.isInteger(r.decoderConfig.codedHeight) || r.decoderConfig.codedHeight <= 0)
    throw new TypeError("Video chunk metadata decoder configuration must specify a valid codedHeight (positive integer).");
  if (r.decoderConfig.displayAspectWidth !== void 0 && (!Number.isInteger(r.decoderConfig.displayAspectWidth) || r.decoderConfig.displayAspectWidth <= 0))
    throw new TypeError("Video chunk metadata decoder configuration displayAspectWidth, when defined, must be a positive integer.");
  if (r.decoderConfig.displayAspectHeight !== void 0 && (!Number.isInteger(r.decoderConfig.displayAspectHeight) || r.decoderConfig.displayAspectHeight <= 0))
    throw new TypeError("Video chunk metadata decoder configuration displayAspectHeight, when defined, must be a positive integer.");
  if (r.decoderConfig.displayAspectWidth !== void 0 != (r.decoderConfig.displayAspectHeight !== void 0))
    throw new TypeError("Video chunk metadata decoder configuration must specify both displayAspectWidth and displayAspectHeight, or neither.");
  if (r.decoderConfig.description !== void 0 && !ki(r.decoderConfig.description))
    throw new TypeError("Video chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an ArrayBuffer view.");
  if (r.decoderConfig.colorSpace !== void 0) {
    const { colorSpace: t } = r.decoderConfig;
    if (typeof t != "object")
      throw new TypeError("Video chunk metadata decoder configuration colorSpace, when provided, must be an object.");
    const i = Object.keys($t);
    if (t.primaries != null && !i.includes(t.primaries))
      throw new TypeError(`Video chunk metadata decoder configuration colorSpace primaries, when defined, must be one of ${i.join(", ")}.`);
    const s = Object.keys(Gt);
    if (t.transfer != null && !s.includes(t.transfer))
      throw new TypeError(`Video chunk metadata decoder configuration colorSpace transfer, when defined, must be one of ${s.join(", ")}.`);
    const n = Object.keys(Xt);
    if (t.matrix != null && !n.includes(t.matrix))
      throw new TypeError(`Video chunk metadata decoder configuration colorSpace matrix, when defined, must be one of ${n.join(", ")}.`);
    if (t.fullRange != null && typeof t.fullRange != "boolean")
      throw new TypeError("Video chunk metadata decoder configuration colorSpace fullRange, when defined, must be a boolean.");
  }
  if (r.decoderConfig.codec.startsWith("avc1") || r.decoderConfig.codec.startsWith("avc3")) {
    if (!Yl.test(r.decoderConfig.codec))
      throw new TypeError("Video chunk metadata decoder configuration codec string for AVC must be a valid AVC codec string as specified in Section 3.4 of RFC 6381.");
  } else if (r.decoderConfig.codec.startsWith("hev1") || r.decoderConfig.codec.startsWith("hvc1")) {
    if (!Zl.test(r.decoderConfig.codec))
      throw new TypeError("Video chunk metadata decoder configuration codec string for HEVC must be a valid HEVC codec string as specified in Section E.3 of ISO 14496-15.");
  } else if (r.decoderConfig.codec.startsWith("vp8")) {
    if (r.decoderConfig.codec !== "vp8")
      throw new TypeError('Video chunk metadata decoder configuration codec string for VP8 must be "vp8".');
  } else if (r.decoderConfig.codec.startsWith("vp09")) {
    if (!Jl.test(r.decoderConfig.codec))
      throw new TypeError('Video chunk metadata decoder configuration codec string for VP9 must be a valid VP9 codec string as specified in Section "Codecs Parameter String" of https://www.webmproject.org/vp9/mp4/.');
  } else if (r.decoderConfig.codec.startsWith("av01")) {
    if (!eu.test(r.decoderConfig.codec))
      throw new TypeError('Video chunk metadata decoder configuration codec string for AV1 must be a valid AV1 codec string as specified in Section "Codecs Parameter String" of https://aomediacodec.github.io/av1-isobmff/.');
  } else if (jt.some((t) => r.decoderConfig.codec.startsWith(t)) && !jt.some((t) => r.decoderConfig.codec === t))
    throw new TypeError(`Video chunk metadata decoder configuration codec string for ProRes must be one of the valid ProRes four-character codes: ${jt.join(", ")}.`);
  if (e !== null && je(r.decoderConfig.codec) !== e)
    throw new TypeError(`Video chunk metadata decoder configuration codec string '${r.decoderConfig.codec}' does not fit to the track codec '${e}'.`);
}, tu = [
  "mp4a",
  "mp3",
  "opus",
  "vorbis",
  "flac",
  "ulaw",
  "alaw",
  "pcm",
  "ac-3",
  "ec-3"
], $e = (r, e) => {
  if (!r)
    throw new TypeError("Audio chunk metadata must be provided.");
  if (typeof r != "object")
    throw new TypeError("Audio chunk metadata must be an object.");
  if (!r.decoderConfig)
    throw new TypeError("Audio chunk metadata must include a decoder configuration.");
  if (typeof r.decoderConfig != "object")
    throw new TypeError("Audio chunk metadata decoder configuration must be an object.");
  if (typeof r.decoderConfig.codec != "string")
    throw new TypeError("Audio chunk metadata decoder configuration must specify a codec string.");
  if (!tu.some((t) => r.decoderConfig.codec.startsWith(t)))
    throw new TypeError("Audio chunk metadata decoder configuration codec string must be a valid audio codec string as specified in the Mediabunny Codec Registry.");
  if (!Number.isInteger(r.decoderConfig.sampleRate) || r.decoderConfig.sampleRate <= 0)
    throw new TypeError("Audio chunk metadata decoder configuration must specify a valid sampleRate (positive integer).");
  if (!Number.isInteger(r.decoderConfig.numberOfChannels) || r.decoderConfig.numberOfChannels <= 0)
    throw new TypeError("Audio chunk metadata decoder configuration must specify a valid numberOfChannels (positive integer).");
  if (r.decoderConfig.description !== void 0 && !ki(r.decoderConfig.description))
    throw new TypeError("Audio chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an ArrayBuffer view.");
  if (r.decoderConfig.codec.startsWith("mp4a") && r.decoderConfig.codec !== "mp4a.69" && r.decoderConfig.codec !== "mp4a.6B" && r.decoderConfig.codec !== "mp4a.6b") {
    if (!["mp4a.40.2", "mp4a.40.02", "mp4a.40.5", "mp4a.40.05", "mp4a.40.29", "mp4a.67"].includes(r.decoderConfig.codec))
      throw new TypeError("Audio chunk metadata decoder configuration codec string for AAC must be a valid AAC codec string as specified in https://www.w3.org/TR/webcodecs-aac-codec-registration/.");
  } else if (r.decoderConfig.codec.startsWith("mp3") || r.decoderConfig.codec.startsWith("mp4a")) {
    if (r.decoderConfig.codec !== "mp3" && r.decoderConfig.codec !== "mp4a.69" && r.decoderConfig.codec !== "mp4a.6B" && r.decoderConfig.codec !== "mp4a.6b")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for MP3 must be "mp3", "mp4a.69" or "mp4a.6B".');
  } else if (r.decoderConfig.codec.startsWith("opus")) {
    if (r.decoderConfig.codec !== "opus")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for Opus must be "opus".');
    if (r.decoderConfig.description && r.decoderConfig.description.byteLength < 18)
      throw new TypeError("Audio chunk metadata decoder configuration description, when specified, is expected to be an Identification Header as specified in Section 5.1 of RFC 7845.");
  } else if (r.decoderConfig.codec.startsWith("vorbis")) {
    if (r.decoderConfig.codec !== "vorbis")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for Vorbis must be "vorbis".');
    if (!r.decoderConfig.description)
      throw new TypeError("Audio chunk metadata decoder configuration for Vorbis must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-vorbis-codec-registration/.");
  } else if (r.decoderConfig.codec.startsWith("flac")) {
    if (r.decoderConfig.codec !== "flac")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for FLAC must be "flac".');
    if (!r.decoderConfig.description || r.decoderConfig.description.byteLength < 42)
      throw new TypeError("Audio chunk metadata decoder configuration for FLAC must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-flac-codec-registration/.");
  } else if (r.decoderConfig.codec.startsWith("ac-3") || r.decoderConfig.codec.startsWith("ac3")) {
    if (r.decoderConfig.codec !== "ac-3")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for AC-3 must be "ac-3".');
  } else if (r.decoderConfig.codec.startsWith("ec-3") || r.decoderConfig.codec.startsWith("eac3")) {
    if (r.decoderConfig.codec !== "ec-3")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for EC-3 must be "ec-3".');
  } else if ((r.decoderConfig.codec.startsWith("pcm") || r.decoderConfig.codec.startsWith("ulaw") || r.decoderConfig.codec.startsWith("alaw")) && !ge.includes(r.decoderConfig.codec))
    throw new TypeError(`Audio chunk metadata decoder configuration codec string for PCM must be one of the supported PCM codecs (${ge.join(", ")}).`);
  if (e !== null && je(r.decoderConfig.codec) !== e)
    throw new TypeError(`Audio chunk metadata decoder configuration codec string '${r.decoderConfig.codec}' does not fit to the track codec '${e}'.`);
}, zo = (r) => {
  if (!r)
    throw new TypeError("Subtitle metadata must be provided.");
  if (typeof r != "object")
    throw new TypeError("Subtitle metadata must be an object.");
  if (!r.config)
    throw new TypeError("Subtitle metadata must include a config object.");
  if (typeof r.config != "object")
    throw new TypeError("Subtitle metadata config must be an object.");
  if (typeof r.config.description != "string")
    throw new TypeError("Subtitle metadata config description must be a string.");
};
const Kt = 4, Do = [44100, 48e3, 32e3], js = [
  // lowSamplingFrequency === 0
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  // layer = 0
  -1,
  32,
  40,
  48,
  56,
  64,
  80,
  96,
  112,
  128,
  160,
  192,
  224,
  256,
  320,
  -1,
  // layer 1
  -1,
  32,
  48,
  56,
  64,
  80,
  96,
  112,
  128,
  160,
  192,
  224,
  256,
  320,
  384,
  -1,
  // layer = 2
  -1,
  32,
  64,
  96,
  128,
  160,
  192,
  224,
  256,
  288,
  320,
  352,
  384,
  416,
  448,
  -1,
  // layer = 3
  // lowSamplingFrequency === 1
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  // layer = 0
  -1,
  8,
  16,
  24,
  32,
  40,
  48,
  56,
  64,
  80,
  96,
  112,
  128,
  144,
  160,
  -1,
  // layer = 1
  -1,
  8,
  16,
  24,
  32,
  40,
  48,
  56,
  64,
  80,
  96,
  112,
  128,
  144,
  160,
  -1,
  // layer = 2
  -1,
  32,
  48,
  56,
  64,
  80,
  96,
  112,
  128,
  144,
  160,
  176,
  192,
  224,
  256,
  -1
  // layer = 3
], Gr = 1483304551, _n = 1231971951, Ks = (r, e, t, i, s) => e === 0 ? 0 : e === 1 ? Math.floor(144 * t / (i << r)) + s : e === 2 ? Math.floor(144 * t / i) + s : (Math.floor(12 * t / i) + s) * 4, iu = (r, e, t, i) => e === 0 ? 0 : e === 1 ? 144 * t / (i << r) : e === 2 ? 144 * t / i : 12 * t / i * 4, Xr = (r, e) => r === 3 ? e === 3 ? 21 : 36 : e === 3 ? 13 : 21, Xi = (r, e) => {
  const t = r >>> 24, i = r >>> 16 & 255, s = r >>> 8 & 255, n = r & 255;
  if (t !== 255 && i !== 255 && s !== 255 && n !== 255)
    return {
      header: null,
      bytesAdvanced: 4
    };
  if (t !== 255)
    return { header: null, bytesAdvanced: 1 };
  if ((i & 224) !== 224)
    return { header: null, bytesAdvanced: 1 };
  let a = 0, o = 0;
  i & 16 ? a = i & 8 ? 0 : 1 : (a = 1, o = 1);
  const c = i >> 3 & 3, l = i >> 1 & 3, u = s >> 4 & 15, d = (s >> 2 & 3) % 3, f = s >> 1 & 1, h = n >> 6 & 3, g = n >> 4 & 3, m = n >> 3 & 1, w = n >> 2 & 1, y = n & 3, b = js[a * 16 * 4 + l * 16 + u];
  if (b === -1)
    return { header: null, bytesAdvanced: 1 };
  const k = b * 1e3, S = Do[d] >> a + o, T = Ks(a, l, k, S, f);
  if (e !== null && e < T)
    return { header: null, bytesAdvanced: 1 };
  let A;
  return c === 3 ? A = l === 3 ? 384 : 1152 : l === 3 ? A = 384 : l === 2 ? A = 1152 : A = 576, {
    header: {
      totalSize: T,
      mpegVersionId: c,
      lowSamplingFrequency: a,
      layer: l,
      bitrate: k,
      frequencyIndex: d,
      sampleRate: S,
      channel: h,
      modeExtension: g,
      copyright: m,
      original: w,
      emphasis: y,
      audioSamplesInFrame: A
    },
    bytesAdvanced: 1
  };
}, ru = (r) => {
  let e = 127, t = 0, i = r;
  for (; (e ^ 2147483647) !== 0; )
    t = i & ~e, t <<= 1, t |= i & e, e = (e + 1 << 8) - 1, i = t;
  return t;
}, Qs = (r) => {
  let e = 2130706432, t = 0;
  for (; e !== 0; )
    t >>= 1, t |= r & e, e >>= 8;
  return t;
};
var Qt;
(function(r) {
  r[r.FrameCount = 1] = "FrameCount", r[r.FileSize = 2] = "FileSize", r[r.Toc = 4] = "Toc";
})(Qt || (Qt = {}));
const Yi = (r) => r === 3 ? 1 : 2;
const Yr = [48e3, 44100, 32e3], Oo = [24e3, 22050, 16e3];
var me;
(function(r) {
  r[r.NON_IDR_SLICE = 1] = "NON_IDR_SLICE", r[r.SLICE_DPA = 2] = "SLICE_DPA", r[r.SLICE_DPB = 3] = "SLICE_DPB", r[r.SLICE_DPC = 4] = "SLICE_DPC", r[r.IDR = 5] = "IDR", r[r.SEI = 6] = "SEI", r[r.SPS = 7] = "SPS", r[r.PPS = 8] = "PPS", r[r.AUD = 9] = "AUD", r[r.SPS_EXT = 13] = "SPS_EXT";
})(me || (me = {}));
var se;
(function(r) {
  r[r.RASL_N = 8] = "RASL_N", r[r.RASL_R = 9] = "RASL_R", r[r.BLA_W_LP = 16] = "BLA_W_LP", r[r.RSV_IRAP_VCL23 = 23] = "RSV_IRAP_VCL23", r[r.VPS_NUT = 32] = "VPS_NUT", r[r.SPS_NUT = 33] = "SPS_NUT", r[r.PPS_NUT = 34] = "PPS_NUT", r[r.AUD_NUT = 35] = "AUD_NUT", r[r.PREFIX_SEI_NUT = 39] = "PREFIX_SEI_NUT", r[r.SUFFIX_SEI_NUT = 40] = "SUFFIX_SEI_NUT";
})(se || (se = {}));
const Pi = function* (r) {
  let e = 0, t = -1;
  for (; e < r.length - 2; ) {
    const i = r.indexOf(0, e);
    if (i === -1 || i >= r.length - 2)
      break;
    e = i;
    let s = 0;
    if (e + 3 < r.length && r[e + 1] === 0 && r[e + 2] === 0 && r[e + 3] === 1 ? s = 4 : r[e + 1] === 0 && r[e + 2] === 1 && (s = 3), s === 0) {
      e++;
      continue;
    }
    t !== -1 && e > t && (yield {
      offset: t,
      length: e - t
    }), t = e + s, e = t;
  }
  t !== -1 && t < r.length && (yield {
    offset: t,
    length: r.length - t
  });
}, In = function* (r, e) {
  let t = 0;
  const i = new DataView(r.buffer, r.byteOffset, r.byteLength);
  for (; t + e <= r.length; ) {
    let s;
    e === 1 ? s = i.getUint8(t) : e === 2 ? s = i.getUint16(t, !1) : e === 3 ? s = Kr(i, t, !1) : (p(e === 4), s = i.getUint32(t, !1)), t += e, yield {
      offset: t,
      length: s
    }, t += s;
  }
}, Uo = (r, e) => {
  if (e.description) {
    const s = (te(e.description)[4] & 3) + 1;
    return In(r, s);
  } else
    return Pi(r);
}, yi = (r) => r & 31, Zr = (r) => {
  const e = [], t = r.length;
  for (let i = 0; i < t; i++)
    i + 2 < t && r[i] === 0 && r[i + 1] === 0 && r[i + 2] === 3 ? (e.push(0, 0), i += 2) : e.push(r[i]);
  return new Uint8Array(e);
}, ps = new Uint8Array([0, 0, 0, 1]), zr = (r) => {
  const e = r.reduce((s, n) => s + ps.byteLength + n.byteLength, 0), t = new Uint8Array(e);
  let i = 0;
  for (const s of r)
    t.set(ps, i), i += ps.byteLength, t.set(s, i), i += s.byteLength;
  return t;
}, En = (r, e) => {
  const t = r.reduce((n, a) => n + e + a.byteLength, 0), i = new Uint8Array(t);
  let s = 0;
  for (const n of r) {
    const a = new DataView(i.buffer, i.byteOffset, i.byteLength);
    switch (e) {
      case 1:
        a.setUint8(s, n.byteLength);
        break;
      case 2:
        a.setUint16(s, n.byteLength, !1);
        break;
      case 3:
        Qr(a, s, n.byteLength, !1);
        break;
      case 4:
        a.setUint32(s, n.byteLength, !1);
        break;
    }
    s += e, i.set(n, s), s += n.byteLength;
  }
  return i;
}, su = (r, e) => {
  if (e.description) {
    const s = (te(e.description)[4] & 3) + 1;
    return En(r, s);
  } else
    return zr(r);
}, vn = (r) => {
  try {
    const e = [], t = [], i = [];
    for (const o of Pi(r)) {
      const c = r.subarray(o.offset, o.offset + o.length), l = yi(c[0]);
      l === me.SPS ? e.push(c) : l === me.PPS ? t.push(c) : l === me.SPS_EXT && i.push(c);
    }
    if (e.length === 0 || t.length === 0)
      return null;
    const s = e[0], n = Fn(s);
    p(n !== null);
    const a = n.profileIdc === 100 || n.profileIdc === 110 || n.profileIdc === 122 || n.profileIdc === 144;
    return {
      configurationVersion: 1,
      avcProfileIndication: n.profileIdc,
      profileCompatibility: n.constraintFlags,
      avcLevelIndication: n.levelIdc,
      lengthSizeMinusOne: 3,
      // Typically 4 bytes for length field
      sequenceParameterSets: e,
      pictureParameterSets: t,
      chromaFormat: a ? n.chromaFormatIdc : null,
      bitDepthLumaMinus8: a ? n.bitDepthLumaMinus8 : null,
      bitDepthChromaMinus8: a ? n.bitDepthChromaMinus8 : null,
      sequenceParameterSetExt: a ? i : null
    };
  } catch (e) {
    return D._error("Error building AVC Decoder Configuration Record:", e), null;
  }
}, nu = (r) => {
  const e = [];
  e.push(r.configurationVersion), e.push(r.avcProfileIndication), e.push(r.profileCompatibility), e.push(r.avcLevelIndication), e.push(252 | r.lengthSizeMinusOne & 3), e.push(224 | r.sequenceParameterSets.length & 31);
  for (const t of r.sequenceParameterSets) {
    const i = t.byteLength;
    e.push(i >> 8), e.push(i & 255);
    for (let s = 0; s < i; s++)
      e.push(t[s]);
  }
  e.push(r.pictureParameterSets.length);
  for (const t of r.pictureParameterSets) {
    const i = t.byteLength;
    e.push(i >> 8), e.push(i & 255);
    for (let s = 0; s < i; s++)
      e.push(t[s]);
  }
  if (r.avcProfileIndication === 100 || r.avcProfileIndication === 110 || r.avcProfileIndication === 122 || r.avcProfileIndication === 144) {
    p(r.chromaFormat !== null), p(r.bitDepthLumaMinus8 !== null), p(r.bitDepthChromaMinus8 !== null), p(r.sequenceParameterSetExt !== null), e.push(252 | r.chromaFormat & 3), e.push(248 | r.bitDepthLumaMinus8 & 7), e.push(248 | r.bitDepthChromaMinus8 & 7), e.push(r.sequenceParameterSetExt.length);
    for (const t of r.sequenceParameterSetExt) {
      const i = t.byteLength;
      e.push(i >> 8), e.push(i & 255);
      for (let s = 0; s < i; s++)
        e.push(t[s]);
    }
  }
  return new Uint8Array(e);
}, No = (r) => {
  try {
    const e = q(r);
    let t = 0;
    const i = e.getUint8(t++), s = e.getUint8(t++), n = e.getUint8(t++), a = e.getUint8(t++), o = e.getUint8(t++) & 3, c = e.getUint8(t++) & 31, l = [];
    for (let h = 0; h < c; h++) {
      const g = e.getUint16(t, !1);
      t += 2, l.push(r.subarray(t, t + g)), t += g;
    }
    const u = e.getUint8(t++), d = [];
    for (let h = 0; h < u; h++) {
      const g = e.getUint16(t, !1);
      t += 2, d.push(r.subarray(t, t + g)), t += g;
    }
    const f = {
      configurationVersion: i,
      avcProfileIndication: s,
      profileCompatibility: n,
      avcLevelIndication: a,
      lengthSizeMinusOne: o,
      sequenceParameterSets: l,
      pictureParameterSets: d,
      chromaFormat: null,
      bitDepthLumaMinus8: null,
      bitDepthChromaMinus8: null,
      sequenceParameterSetExt: null
    };
    if ((s === 100 || s === 110 || s === 122 || s === 144) && t + 4 <= r.length) {
      const h = e.getUint8(t++) & 3, g = e.getUint8(t++) & 7, m = e.getUint8(t++) & 7, w = e.getUint8(t++);
      f.chromaFormat = h, f.bitDepthLumaMinus8 = g, f.bitDepthChromaMinus8 = m;
      const y = [];
      for (let b = 0; b < w; b++) {
        const k = e.getUint16(t, !1);
        t += 2, y.push(r.subarray(t, t + k)), t += k;
      }
      f.sequenceParameterSetExt = y;
    }
    return f;
  } catch (e) {
    return D._error("Error deserializing AVC Decoder Configuration Record:", e), null;
  }
}, Vo = {
  1: { num: 1, den: 1 },
  2: { num: 12, den: 11 },
  3: { num: 10, den: 11 },
  4: { num: 16, den: 11 },
  5: { num: 40, den: 33 },
  6: { num: 24, den: 11 },
  7: { num: 20, den: 11 },
  8: { num: 32, den: 11 },
  9: { num: 80, den: 33 },
  10: { num: 18, den: 11 },
  11: { num: 15, den: 11 },
  12: { num: 64, den: 33 },
  13: { num: 160, den: 99 },
  14: { num: 4, den: 3 },
  15: { num: 3, den: 2 },
  16: { num: 2, den: 1 }
}, Fn = (r) => {
  try {
    const e = new j(Zr(r));
    if (e.skipBits(1), e.skipBits(2), e.readBits(5) !== 7)
      return null;
    const i = e.readAlignedByte(), s = e.readAlignedByte(), n = e.readAlignedByte();
    R(e);
    let a = 1, o = 0, c = 0, l = 0;
    if ((i === 100 || i === 110 || i === 122 || i === 244 || i === 44 || i === 83 || i === 86 || i === 118 || i === 128) && (a = R(e), a === 3 && (l = e.readBits(1)), o = R(e), c = R(e), e.skipBits(1), e.readBits(1))) {
      for (let v = 0; v < (a !== 3 ? 8 : 12); v++)
        if (e.readBits(1)) {
          const W = v < 6 ? 16 : 64;
          let O = 8, z = 8;
          for (let Q = 0; Q < W; Q++) {
            if (z !== 0) {
              const J = ht(e);
              z = (O + J + 256) % 256;
            }
            O = z === 0 ? O : z;
          }
        }
    }
    R(e);
    const u = R(e);
    if (u === 0)
      R(e);
    else if (u === 1) {
      e.skipBits(1), ht(e), ht(e);
      const E = R(e);
      for (let v = 0; v < E; v++)
        ht(e);
    }
    R(e), e.skipBits(1);
    const d = R(e), f = R(e), h = 16 * (d + 1), g = 16 * (f + 1);
    let m = h, w = g;
    const y = e.readBits(1);
    if (y || e.skipBits(1), e.skipBits(1), e.readBits(1)) {
      const E = R(e), v = R(e), M = R(e), W = R(e);
      let O, z;
      if ((l === 0 ? a : 0) === 0)
        O = 1, z = 2 - y;
      else {
        const J = a === 3 ? 1 : 2, Te = a === 1 ? 2 : 1;
        O = J, z = Te * (2 - y);
      }
      m -= O * (E + v), w -= z * (M + W);
    }
    let k = 2, S = 2, T = 2, A = 0, C = { num: 1, den: 1 }, _ = null, x = null;
    if (e.readBits(1)) {
      if (e.readBits(1)) {
        const Te = e.readBits(8);
        if (Te === 255)
          C = {
            num: e.readBits(16),
            den: e.readBits(16)
          };
        else {
          const Me = Vo[Te];
          Me && (C = Me);
        }
      }
      e.readBits(1) && e.skipBits(1), e.readBits(1) && (e.skipBits(3), A = e.readBits(1), e.readBits(1) && (k = e.readBits(8), S = e.readBits(8), T = e.readBits(8))), e.readBits(1) && (R(e), R(e)), e.readBits(1) && (e.skipBits(32), e.skipBits(32), e.skipBits(1));
      const z = e.readBits(1);
      z && la(e);
      const Q = e.readBits(1);
      Q && la(e), (z || Q) && e.skipBits(1), e.skipBits(1), e.readBits(1) && (e.skipBits(1), R(e), R(e), R(e), R(e), _ = R(e), x = R(e));
    }
    if (_ === null) {
      p(x === null);
      const E = s & 16;
      if ((i === 44 || i === 86 || i === 100 || i === 110 || i === 122 || i === 244) && E)
        _ = 0, x = 0;
      else {
        const v = d + 1, M = f + 1, W = (2 - y) * M, O = Mr.find((Q) => Q.level >= n) ?? ne(Mr), z = Math.min(Math.floor(O.maxDpbMbs / (v * W)), 16);
        _ = z, x = z;
      }
    }
    return p(x !== null), {
      profileIdc: i,
      constraintFlags: s,
      levelIdc: n,
      frameMbsOnlyFlag: y,
      chromaFormatIdc: a,
      bitDepthLumaMinus8: o,
      bitDepthChromaMinus8: c,
      codedWidth: h,
      codedHeight: g,
      displayWidth: m,
      displayHeight: w,
      pixelAspectRatio: C,
      colourPrimaries: k,
      matrixCoefficients: T,
      transferCharacteristics: S,
      fullRangeFlag: A,
      numReorderFrames: _,
      maxDecFrameBuffering: x
    };
  } catch (e) {
    return D._error("Error parsing AVC SPS:", e), null;
  }
}, la = (r) => {
  const e = R(r);
  r.skipBits(4), r.skipBits(4);
  for (let t = 0; t <= e; t++)
    R(r), R(r), r.skipBits(1);
  r.skipBits(5), r.skipBits(5), r.skipBits(5), r.skipBits(5);
}, au = (r, e) => {
  if (e.description) {
    const s = (te(e.description)[21] & 3) + 1;
    return En(r, s);
  } else
    return zr(r);
}, Dr = (r, e) => {
  if (e.description) {
    const s = (te(e.description)[21] & 3) + 1;
    return In(r, s);
  } else
    return Pi(r);
}, Bt = (r) => r >> 1 & 63, Wo = (r) => {
  try {
    const e = new j(Zr(r));
    e.skipBits(16), e.readBits(4);
    const t = e.readBits(3), i = e.readBits(1), { general_profile_space: s, general_tier_flag: n, general_profile_idc: a, general_profile_compatibility_flags: o, general_constraint_indicator_flags: c, general_level_idc: l } = ou(e, t);
    R(e);
    const u = R(e);
    let d = 0;
    u === 3 && (d = e.readBits(1));
    const f = R(e), h = R(e);
    let g = f, m = h;
    if (e.readBits(1)) {
      const v = R(e), M = R(e), W = R(e), O = R(e);
      let z = 1, Q = 1;
      const J = d === 0 ? u : 0;
      J === 1 ? (z = 2, Q = 2) : J === 2 && (z = 2, Q = 1), g -= (v + M) * z, m -= (W + O) * Q;
    }
    const w = R(e), y = R(e);
    R(e);
    const k = e.readBits(1) ? 0 : t;
    let S = 0;
    for (let v = k; v <= t; v++)
      R(e), S = R(e), R(e);
    R(e), R(e), R(e), R(e), R(e), R(e), e.readBits(1) && e.readBits(1) && cu(e), e.skipBits(1), e.skipBits(1), e.readBits(1) && (e.skipBits(4), e.skipBits(4), R(e), R(e), e.skipBits(1));
    const T = R(e);
    if (lu(e, T), e.readBits(1)) {
      const v = R(e);
      for (let M = 0; M < v; M++)
        R(e), e.skipBits(1);
    }
    e.skipBits(1), e.skipBits(1);
    let A = 2, C = 2, _ = 2, x = 0, I = 0, E = { num: 1, den: 1 };
    if (e.readBits(1)) {
      const v = du(e, t);
      E = v.pixelAspectRatio, A = v.colourPrimaries, C = v.transferCharacteristics, _ = v.matrixCoefficients, x = v.fullRangeFlag, I = v.minSpatialSegmentationIdc;
    }
    return {
      displayWidth: g,
      displayHeight: m,
      pixelAspectRatio: E,
      colourPrimaries: A,
      transferCharacteristics: C,
      matrixCoefficients: _,
      fullRangeFlag: x,
      maxDecFrameBuffering: S + 1,
      spsMaxSubLayersMinus1: t,
      spsTemporalIdNestingFlag: i,
      generalProfileSpace: s,
      generalTierFlag: n,
      generalProfileIdc: a,
      generalProfileCompatibilityFlags: o,
      generalConstraintIndicatorFlags: c,
      generalLevelIdc: l,
      chromaFormatIdc: u,
      bitDepthLumaMinus8: w,
      bitDepthChromaMinus8: y,
      minSpatialSegmentationIdc: I
    };
  } catch (e) {
    return D._error("Error parsing HEVC SPS:", e), null;
  }
}, Bn = (r) => {
  try {
    const e = [], t = [], i = [], s = [];
    for (const l of Pi(r)) {
      const u = r.subarray(l.offset, l.offset + l.length), d = Bt(u[0]);
      d === se.VPS_NUT ? e.push(u) : d === se.SPS_NUT ? t.push(u) : d === se.PPS_NUT ? i.push(u) : (d === se.PREFIX_SEI_NUT || d === se.SUFFIX_SEI_NUT) && s.push(u);
    }
    if (t.length === 0 || i.length === 0)
      return null;
    const n = Wo(t[0]);
    if (!n)
      return null;
    let a = 0;
    if (i.length > 0) {
      const l = i[0], u = new j(Zr(l));
      u.skipBits(16), R(u), R(u), u.skipBits(1), u.skipBits(1), u.skipBits(3), u.skipBits(1), u.skipBits(1), R(u), R(u), ht(u), u.skipBits(1), u.skipBits(1), u.readBits(1) && R(u), ht(u), ht(u), u.skipBits(1), u.skipBits(1), u.skipBits(1), u.skipBits(1);
      const d = u.readBits(1), f = u.readBits(1);
      !d && !f ? a = 0 : d && !f ? a = 2 : !d && f ? a = 3 : a = 0;
    }
    const o = [
      ...e.length ? [
        {
          arrayCompleteness: 1,
          nalUnitType: se.VPS_NUT,
          nalUnits: e
        }
      ] : [],
      ...t.length ? [
        {
          arrayCompleteness: 1,
          nalUnitType: se.SPS_NUT,
          nalUnits: t
        }
      ] : [],
      ...i.length ? [
        {
          arrayCompleteness: 1,
          nalUnitType: se.PPS_NUT,
          nalUnits: i
        }
      ] : [],
      ...s.length ? [
        {
          arrayCompleteness: 1,
          nalUnitType: Bt(s[0][0]),
          nalUnits: s
        }
      ] : []
    ];
    return {
      configurationVersion: 1,
      generalProfileSpace: n.generalProfileSpace,
      generalTierFlag: n.generalTierFlag,
      generalProfileIdc: n.generalProfileIdc,
      generalProfileCompatibilityFlags: n.generalProfileCompatibilityFlags,
      generalConstraintIndicatorFlags: n.generalConstraintIndicatorFlags,
      generalLevelIdc: n.generalLevelIdc,
      minSpatialSegmentationIdc: n.minSpatialSegmentationIdc,
      parallelismType: a,
      chromaFormatIdc: n.chromaFormatIdc,
      bitDepthLumaMinus8: n.bitDepthLumaMinus8,
      bitDepthChromaMinus8: n.bitDepthChromaMinus8,
      avgFrameRate: 0,
      constantFrameRate: 0,
      numTemporalLayers: n.spsMaxSubLayersMinus1 + 1,
      temporalIdNested: n.spsTemporalIdNestingFlag,
      lengthSizeMinusOne: 3,
      arrays: o
    };
  } catch (e) {
    return D._error("Error building HEVC Decoder Configuration Record:", e), null;
  }
}, ou = (r, e) => {
  const t = r.readBits(2), i = r.readBits(1), s = r.readBits(5);
  let n = 0;
  for (let u = 0; u < 32; u++)
    n = n << 1 | r.readBits(1);
  const a = new Uint8Array(6);
  for (let u = 0; u < 6; u++)
    a[u] = r.readBits(8);
  const o = r.readBits(8), c = [], l = [];
  for (let u = 0; u < e; u++)
    c.push(r.readBits(1)), l.push(r.readBits(1));
  if (e > 0)
    for (let u = e; u < 8; u++)
      r.skipBits(2);
  for (let u = 0; u < e; u++)
    c[u] && r.skipBits(88), l[u] && r.skipBits(8);
  return {
    general_profile_space: t,
    general_tier_flag: i,
    general_profile_idc: s,
    general_profile_compatibility_flags: n,
    general_constraint_indicator_flags: a,
    general_level_idc: o
  };
}, cu = (r) => {
  for (let e = 0; e < 4; e++)
    for (let t = 0; t < (e === 3 ? 2 : 6); t++)
      if (!r.readBits(1))
        R(r);
      else {
        const s = Math.min(64, 1 << 4 + (e << 1));
        e > 1 && ht(r);
        for (let n = 0; n < s; n++)
          ht(r);
      }
}, lu = (r, e) => {
  const t = [];
  for (let i = 0; i < e; i++)
    t[i] = uu(r, i, e, t);
}, uu = (r, e, t, i) => {
  let s = 0, n = 0, a = 0;
  if (e !== 0 && (n = r.readBits(1)), n) {
    if (e === t) {
      const c = R(r);
      a = e - (c + 1);
    } else
      a = e - 1;
    r.readBits(1), R(r);
    const o = i[a] ?? 0;
    for (let c = 0; c <= o; c++)
      r.readBits(1) || r.readBits(1);
    s = i[a];
  } else {
    const o = R(r), c = R(r);
    for (let l = 0; l < o; l++)
      R(r), r.readBits(1);
    for (let l = 0; l < c; l++)
      R(r), r.readBits(1);
    s = o + c;
  }
  return s;
}, du = (r, e) => {
  let t = 2, i = 2, s = 2, n = 0, a = 0, o = { num: 1, den: 1 };
  if (r.readBits(1)) {
    const c = r.readBits(8);
    if (c === 255)
      o = {
        num: r.readBits(16),
        den: r.readBits(16)
      };
    else {
      const l = Vo[c];
      l && (o = l);
    }
  }
  return r.readBits(1) && r.readBits(1), r.readBits(1) && (r.readBits(3), n = r.readBits(1), r.readBits(1) && (t = r.readBits(8), i = r.readBits(8), s = r.readBits(8))), r.readBits(1) && (R(r), R(r)), r.readBits(1), r.readBits(1), r.readBits(1), r.readBits(1) && (R(r), R(r), R(r), R(r)), r.readBits(1) && (r.readBits(32), r.readBits(32), r.readBits(1) && R(r), r.readBits(1) && fu(r, !0, e)), r.readBits(1) && (r.readBits(1), r.readBits(1), r.readBits(1), a = R(r), R(r), R(r), R(r), R(r)), {
    pixelAspectRatio: o,
    colourPrimaries: t,
    transferCharacteristics: i,
    matrixCoefficients: s,
    fullRangeFlag: n,
    minSpatialSegmentationIdc: a
  };
}, fu = (r, e, t) => {
  let i = !1, s = !1, n = !1;
  i = r.readBits(1) === 1, s = r.readBits(1) === 1, (i || s) && (n = r.readBits(1) === 1, n && (r.readBits(8), r.readBits(5), r.readBits(1), r.readBits(5)), r.readBits(4), r.readBits(4), n && r.readBits(4), r.readBits(5), r.readBits(5), r.readBits(5));
  for (let a = 0; a <= t; a++) {
    const o = r.readBits(1) === 1;
    let c = !0;
    o || (c = r.readBits(1) === 1);
    let l = !1;
    c ? R(r) : l = r.readBits(1) === 1;
    let u = 1;
    l || (u = R(r) + 1), i && ua(r, u, n), s && ua(r, u, n);
  }
}, ua = (r, e, t) => {
  for (let i = 0; i < e; i++)
    R(r), R(r), t && (R(r), R(r)), r.readBits(1);
}, hu = (r) => {
  const e = [];
  e.push(r.configurationVersion), e.push((r.generalProfileSpace & 3) << 6 | (r.generalTierFlag & 1) << 5 | r.generalProfileIdc & 31), e.push(r.generalProfileCompatibilityFlags >>> 24 & 255), e.push(r.generalProfileCompatibilityFlags >>> 16 & 255), e.push(r.generalProfileCompatibilityFlags >>> 8 & 255), e.push(r.generalProfileCompatibilityFlags & 255), e.push(...r.generalConstraintIndicatorFlags), e.push(r.generalLevelIdc & 255), e.push(240 | r.minSpatialSegmentationIdc >> 8 & 15), e.push(r.minSpatialSegmentationIdc & 255), e.push(252 | r.parallelismType & 3), e.push(252 | r.chromaFormatIdc & 3), e.push(248 | r.bitDepthLumaMinus8 & 7), e.push(248 | r.bitDepthChromaMinus8 & 7), e.push(r.avgFrameRate >> 8 & 255), e.push(r.avgFrameRate & 255), e.push((r.constantFrameRate & 3) << 6 | (r.numTemporalLayers & 7) << 3 | (r.temporalIdNested & 1) << 2 | r.lengthSizeMinusOne & 3), e.push(r.arrays.length & 255);
  for (const t of r.arrays) {
    e.push((t.arrayCompleteness & 1) << 7 | 0 | t.nalUnitType & 63), e.push(t.nalUnits.length >> 8 & 255), e.push(t.nalUnits.length & 255);
    for (const i of t.nalUnits) {
      e.push(i.length >> 8 & 255), e.push(i.length & 255);
      for (let s = 0; s < i.length; s++)
        e.push(i[s]);
    }
  }
  return new Uint8Array(e);
}, mu = (r) => {
  try {
    const e = q(r);
    let t = 0;
    const i = e.getUint8(t++), s = e.getUint8(t++), n = s >> 6 & 3, a = s >> 5 & 1, o = s & 31, c = e.getUint32(t, !1);
    t += 4;
    const l = r.subarray(t, t + 6);
    t += 6;
    const u = e.getUint8(t++), d = (e.getUint8(t++) & 15) << 8 | e.getUint8(t++), f = e.getUint8(t++) & 3, h = e.getUint8(t++) & 3, g = e.getUint8(t++) & 7, m = e.getUint8(t++) & 7, w = e.getUint16(t, !1);
    t += 2;
    const y = e.getUint8(t++), b = y >> 6 & 3, k = y >> 3 & 7, S = y >> 2 & 1, T = y & 3, A = e.getUint8(t++), C = [];
    for (let _ = 0; _ < A; _++) {
      const x = e.getUint8(t++), I = x >> 7 & 1, E = x & 63, v = e.getUint16(t, !1);
      t += 2;
      const M = [];
      for (let W = 0; W < v; W++) {
        const O = e.getUint16(t, !1);
        t += 2, M.push(r.subarray(t, t + O)), t += O;
      }
      C.push({
        arrayCompleteness: I,
        nalUnitType: E,
        nalUnits: M
      });
    }
    return {
      configurationVersion: i,
      generalProfileSpace: n,
      generalTierFlag: a,
      generalProfileIdc: o,
      generalProfileCompatibilityFlags: c,
      generalConstraintIndicatorFlags: l,
      generalLevelIdc: u,
      minSpatialSegmentationIdc: d,
      parallelismType: f,
      chromaFormatIdc: h,
      bitDepthLumaMinus8: g,
      bitDepthChromaMinus8: m,
      avgFrameRate: w,
      constantFrameRate: b,
      numTemporalLayers: k,
      temporalIdNested: S,
      lengthSizeMinusOne: T,
      arrays: C
    };
  } catch (e) {
    return D._error("Error deserializing HEVC Decoder Configuration Record:", e), null;
  }
};
var xe;
(function(r) {
  r[r.audAllowed = 0] = "audAllowed", r[r.beforeFirstVcl = 1] = "beforeFirstVcl", r[r.afterFirstVcl = 2] = "afterFirstVcl", r[r.eoBitstreamAllowed = 3] = "eoBitstreamAllowed", r[r.noMoreDataAllowed = 4] = "noMoreDataAllowed";
})(xe || (xe = {}));
const pu = (r, e) => {
  const t = /* @__PURE__ */ new Set();
  let i = xe.audAllowed;
  for (const n of Dr(r, e)) {
    if (i === xe.noMoreDataAllowed) {
      t.add(n.offset);
      continue;
    }
    const a = Bt(r[n.offset]);
    if (i === xe.eoBitstreamAllowed && a !== 37) {
      t.add(n.offset);
      continue;
    }
    let o = !1;
    a === 35 ? i > xe.audAllowed ? o = !0 : i = xe.beforeFirstVcl : a <= 31 ? i > xe.afterFirstVcl ? o = !0 : i = xe.afterFirstVcl : a === 36 ? i !== xe.afterFirstVcl ? o = !0 : i = xe.eoBitstreamAllowed : a === 37 ? i < xe.afterFirstVcl ? o = !0 : i = xe.noMoreDataAllowed : a === 32 || a === 33 || a === 34 || a === 39 || a >= 41 && a <= 44 || a >= 48 && a <= 55 ? i > xe.beforeFirstVcl ? o = !0 : i = xe.beforeFirstVcl : (a === 38 || a === 40 || a >= 45 && a <= 47 || a >= 56 && a <= 63) && i < xe.afterFirstVcl && (o = !0), o && t.add(n.offset);
  }
  if (t.size === 0)
    return null;
  const s = [];
  for (const n of Dr(r, e))
    t.has(n.offset) || s.push(r.subarray(n.offset, n.offset + n.length));
  return au(s, e);
}, Lo = (r) => {
  const e = new j(r);
  if (e.readBits(2) !== 2)
    return null;
  const i = e.readBits(1), n = (e.readBits(1) << 1) + i;
  if (n === 3 && e.skipBits(1), e.readBits(1) === 1 || e.readBits(1) !== 0 || (e.skipBits(2), e.readBits(24) !== 4817730))
    return null;
  let l = 8;
  n >= 2 && (l = e.readBits(1) ? 12 : 10);
  const u = e.readBits(3);
  let d = 0, f = 0;
  if (u !== 7)
    if (f = e.readBits(1), n === 1 || n === 3) {
      const C = e.readBits(1), _ = e.readBits(1);
      d = !C && !_ ? 3 : C && !_ ? 2 : 1, e.skipBits(1);
    } else
      d = 1;
  else
    d = 3, f = 1;
  const h = e.readBits(16), g = e.readBits(16), m = h + 1, w = g + 1, y = m * w;
  let b = ne(_t).level;
  for (const A of _t)
    if (y <= A.maxPictureSize) {
      b = A.level;
      break;
    }
  return {
    profile: n,
    level: b,
    bitDepth: l,
    chromaSubsampling: d,
    videoFullRangeFlag: f,
    colourPrimaries: u === 2 ? 1 : u === 1 ? 6 : 2,
    transferCharacteristics: u === 2 ? 1 : u === 1 ? 6 : 2,
    matrixCoefficients: u === 7 ? 0 : u === 2 ? 1 : u === 1 ? 6 : 2
  };
}, qo = function* (r) {
  const e = new j(r), t = () => {
    let i = 0;
    for (let s = 0; s < 8; s++) {
      const n = e.readAlignedByte();
      if (i |= (n & 127) << s * 7, !(n & 128))
        break;
      if (s === 7 && n & 128)
        return null;
    }
    return i >= 2 ** 32 - 1 ? null : i;
  };
  for (; e.getBitsLeft() >= 8; ) {
    e.skipBits(1);
    const i = e.readBits(4), s = e.readBits(1), n = e.readBits(1);
    e.skipBits(1), s && e.skipBits(8);
    let a;
    if (n) {
      const o = t();
      if (o === null)
        return;
      a = o;
    } else
      a = Math.floor(e.getBitsLeft() / 8);
    p(e.pos % 8 === 0), yield {
      type: i,
      data: r.subarray(e.pos / 8, e.pos / 8 + a)
    }, e.skipBits(a * 8);
  }
}, Ho = (r) => {
  for (const { type: e, data: t } of qo(r)) {
    if (e !== 1)
      continue;
    const i = new j(t), s = i.readBits(3);
    i.readBits(1);
    const n = i.readBits(1);
    let a = 0, o = 0, c = 0;
    if (n)
      a = i.readBits(5);
    else {
      if (i.readBits(1) && (i.skipBits(32), i.skipBits(32), i.readBits(1)))
        return null;
      const T = i.readBits(1);
      T && (c = i.readBits(5), i.skipBits(32), i.skipBits(5), i.skipBits(5));
      const A = i.readBits(5);
      for (let C = 0; C <= A; C++) {
        i.skipBits(12);
        const _ = i.readBits(5);
        if (C === 0 && (a = _), _ > 7) {
          const I = i.readBits(1);
          C === 0 && (o = I);
        }
        if (T && i.readBits(1)) {
          const E = c + 1;
          i.skipBits(E), i.skipBits(E), i.skipBits(1);
        }
        i.readBits(1) && i.skipBits(4);
      }
    }
    const l = i.readBits(4), u = i.readBits(4), d = l + 1;
    i.skipBits(d);
    const f = u + 1;
    i.skipBits(f);
    let h = 0;
    if (n ? h = 0 : h = i.readBits(1), h && (i.skipBits(4), i.skipBits(3)), i.skipBits(1), i.skipBits(1), i.skipBits(1), !n) {
      i.skipBits(1), i.skipBits(1), i.skipBits(1), i.skipBits(1);
      const S = i.readBits(1);
      S && (i.skipBits(1), i.skipBits(1));
      const T = i.readBits(1);
      let A = 0;
      T ? A = 2 : A = i.readBits(1), A > 0 && (i.readBits(1) || i.skipBits(1)), S && i.skipBits(3);
    }
    i.skipBits(1), i.skipBits(1), i.skipBits(1);
    const g = i.readBits(1);
    let m = 8;
    s === 2 && g ? m = i.readBits(1) ? 12 : 10 : s <= 2 && (m = g ? 10 : 8);
    let w = 0;
    s !== 1 && (w = i.readBits(1));
    let y = 1, b = 1, k = 0;
    return w || (s === 0 ? (y = 1, b = 1) : s === 1 ? (y = 0, b = 0) : m === 12 && (y = i.readBits(1), y && (b = i.readBits(1))), y && b && (k = i.readBits(2))), {
      profile: s,
      level: a,
      tier: o,
      bitDepth: m,
      monochrome: w,
      chromaSubsamplingX: y,
      chromaSubsamplingY: b,
      chromaSamplePosition: k
    };
  }
  return null;
}, Jr = (r) => {
  const e = q(r), t = e.getUint8(9), i = e.getUint16(10, !0), s = e.getUint32(12, !0), n = e.getInt16(16, !0), a = e.getUint8(18);
  let o = null;
  return a && (o = r.subarray(19, 21 + t)), {
    outputChannelCount: t,
    preSkip: i,
    inputSampleRate: s,
    outputGain: n,
    channelMappingFamily: a,
    channelMappingTable: o
  };
}, gu = [
  480,
  960,
  1920,
  2880,
  480,
  960,
  1920,
  2880,
  480,
  960,
  1920,
  2880,
  480,
  960,
  480,
  960,
  120,
  240,
  480,
  960,
  120,
  240,
  480,
  960,
  120,
  240,
  480,
  960,
  120,
  240,
  480,
  960
], wu = (r) => {
  const e = r[0] >> 3, t = r[0] & 3;
  let i;
  return t === 0 ? i = 1 : t === 1 || t === 2 ? i = 2 : i = r[1] & 63, {
    durationInSamples: gu[e] * i
  };
}, jo = (r) => {
  if (r.length < 7)
    throw new Error("Setup header is too short.");
  if (r[0] !== 5)
    throw new Error("Wrong packet type in Setup header.");
  if (String.fromCharCode(...r.slice(1, 7)) !== "vorbis")
    throw new Error("Invalid packet signature in Setup header.");
  const t = r.length, i = new Uint8Array(t);
  for (let d = 0; d < t; d++)
    i[d] = r[t - 1 - d];
  const s = new j(i);
  let n = 0;
  for (; s.getBitsLeft() > 97; )
    if (s.readBits(1) === 1) {
      n = s.pos;
      break;
    }
  if (n === 0)
    throw new Error("Invalid Setup header: framing bit not found.");
  let a = 0, o = !1, c = 0;
  for (; s.getBitsLeft() >= 97; ) {
    const d = s.pos, f = s.readBits(8), h = s.readBits(16), g = s.readBits(16);
    if (f > 63 || h !== 0 || g !== 0) {
      s.pos = d;
      break;
    }
    if (s.skipBits(1), a++, a > 64)
      break;
    s.clone().readBits(6) + 1 === a && (o = !0, c = a);
  }
  if (!o)
    throw new Error("Invalid Setup header: mode header not found.");
  if (c > 63)
    throw new Error(`Unsupported mode count: ${c}.`);
  const l = c;
  s.pos = 0, s.skipBits(n);
  const u = Array(l).fill(0);
  for (let d = l - 1; d >= 0; d--)
    s.skipBits(40), u[d] = s.readBits(1);
  return { modeBlockflags: u };
}, es = (r, e, t) => {
  switch (r) {
    case "avc": {
      for (const i of Uo(t, e)) {
        const s = t[i.offset], n = yi(s);
        if (n >= me.NON_IDR_SLICE && n <= me.SLICE_DPC)
          return "delta";
        if (n === me.IDR)
          return "key";
        if (n === me.SEI && (!Ls() || zl() >= 144)) {
          const a = t.subarray(i.offset, i.offset + i.length), o = Zr(a);
          let c = 1;
          do {
            let l = 0;
            for (; ; ) {
              const f = o[c++];
              if (f === void 0 || (l += f, f < 255))
                break;
            }
            let u = 0;
            for (; ; ) {
              const f = o[c++];
              if (f === void 0 || (u += f, f < 255))
                break;
            }
            if (l === 6) {
              const f = new j(o);
              f.pos = 8 * c;
              const h = R(f), g = f.readBits(1);
              if (h === 0 && g === 1)
                return "key";
            }
            c += u;
          } while (c < o.length - 1);
        }
      }
      return "delta";
    }
    case "hevc": {
      for (const i of Dr(t, e)) {
        const s = Bt(t[i.offset]);
        if (s < se.BLA_W_LP)
          return "delta";
        if (s <= se.RSV_IRAP_VCL23)
          return "key";
      }
      return "delta";
    }
    case "vp8":
      return (t[0] & 1) === 0 ? "key" : "delta";
    case "vp9": {
      const i = new j(t);
      if (i.readBits(2) !== 2)
        return null;
      const s = i.readBits(1);
      return (i.readBits(1) << 1) + s === 3 && i.skipBits(1), i.readBits(1) ? null : i.readBits(1) === 0 ? "key" : "delta";
    }
    case "av1": {
      let i = !1;
      for (const { type: s, data: n } of qo(t))
        if (s === 1) {
          const a = new j(n);
          a.skipBits(4), i = !!a.readBits(1);
        } else if (s === 3 || s === 6 || s === 7) {
          if (i)
            return "key";
          const a = new j(n);
          return a.readBits(1) ? null : a.readBits(2) === 0 ? "key" : "delta";
        }
      return null;
    }
    case "prores":
      return "key";
    default:
      pe(r), p(!1);
  }
};
var mt;
(function(r) {
  r[r.STREAMINFO = 0] = "STREAMINFO", r[r.VORBIS_COMMENT = 4] = "VORBIS_COMMENT", r[r.PICTURE = 6] = "PICTURE";
})(mt || (mt = {}));
const $s = (r, e) => {
  const t = q(r);
  let i = 0;
  const s = t.getUint32(i, !0);
  i += 4;
  const n = ve.decode(r.subarray(i, i + s));
  i += s, s > 0 && (e.raw ??= {}, e.raw.vendor ??= n);
  const a = t.getUint32(i, !0);
  i += 4;
  for (let o = 0; o < a; o++) {
    const c = t.getUint32(i, !0);
    i += 4;
    const l = ve.decode(r.subarray(i, i + c));
    i += c;
    const u = l.indexOf("=");
    if (u === -1)
      continue;
    const d = l.slice(0, u).toUpperCase(), f = l.slice(u + 1);
    switch (e.raw ??= {}, e.raw[d] ??= f, d) {
      case "TITLE":
        e.title ??= f;
        break;
      case "DESCRIPTION":
        e.description ??= f;
        break;
      case "ARTIST":
        e.artist ??= f;
        break;
      case "ALBUM":
        e.album ??= f;
        break;
      case "ALBUMARTIST":
        e.albumArtist ??= f;
        break;
      case "COMMENT":
        e.comment ??= f;
        break;
      case "LYRICS":
        e.lyrics ??= f;
        break;
      case "TRACKNUMBER":
        {
          const h = f.split("/"), g = Number.parseInt(h[0], 10), m = h[1] && Number.parseInt(h[1], 10);
          Number.isInteger(g) && g > 0 && (e.trackNumber ??= g), m && Number.isInteger(m) && m > 0 && (e.tracksTotal ??= m);
        }
        break;
      case "TRACKTOTAL":
        {
          const h = Number.parseInt(f, 10);
          Number.isInteger(h) && h > 0 && (e.tracksTotal ??= h);
        }
        break;
      case "DISCNUMBER":
        {
          const h = f.split("/"), g = Number.parseInt(h[0], 10), m = h[1] && Number.parseInt(h[1], 10);
          Number.isInteger(g) && g > 0 && (e.discNumber ??= g), m && Number.isInteger(m) && m > 0 && (e.discsTotal ??= m);
        }
        break;
      case "DISCTOTAL":
        {
          const h = Number.parseInt(f, 10);
          Number.isInteger(h) && h > 0 && (e.discsTotal ??= h);
        }
        break;
      case "DATE":
        {
          const h = new Date(f);
          Number.isNaN(h.getTime()) || (e.date ??= h);
        }
        break;
      case "GENRE":
        e.genre ??= f;
        break;
      case "METADATA_BLOCK_PICTURE":
        {
          const h = Rr(f), g = q(h), m = g.getUint32(0, !1), w = g.getUint32(4, !1), y = String.fromCharCode(...h.subarray(8, 8 + w)), b = g.getUint32(8 + w, !1), k = ve.decode(h.subarray(12 + w, 12 + w + b)), S = g.getUint32(w + b + 28), T = h.subarray(w + b + 32, w + b + 32 + S);
          e.images ??= [], e.images.push({
            data: T,
            mimeType: y,
            kind: m === 3 ? "coverFront" : m === 4 ? "coverBack" : "unknown",
            name: void 0,
            description: k || void 0
          });
        }
        break;
    }
  }
}, Gs = (r, e, t) => {
  const i = [
    r
  ], n = Y.encode("Mediabunny");
  let a = new Uint8Array(4 + n.length), o = new DataView(a.buffer);
  o.setUint32(0, n.length, !0), a.set(n, 4), i.push(a);
  const c = /* @__PURE__ */ new Set(), l = (g, m) => {
    const w = `${g}=${m}`, y = Y.encode(w);
    a = new Uint8Array(4 + y.length), o = new DataView(a.buffer), o.setUint32(0, y.length, !0), a.set(y, 4), i.push(a), c.add(g);
  };
  for (const { key: g, value: m } of Ti(e))
    switch (g) {
      case "title":
        l("TITLE", m);
        break;
      case "description":
        l("DESCRIPTION", m);
        break;
      case "artist":
        l("ARTIST", m);
        break;
      case "album":
        l("ALBUM", m);
        break;
      case "albumArtist":
        l("ALBUMARTIST", m);
        break;
      case "genre":
        l("GENRE", m);
        break;
      case "date":
        {
          const w = e.raw?.DATE ?? e.raw?.date;
          w && typeof w == "string" ? l("DATE", w) : l("DATE", m.toISOString().slice(0, 10));
        }
        break;
      case "comment":
        l("COMMENT", m);
        break;
      case "lyrics":
        l("LYRICS", m);
        break;
      case "trackNumber":
        l("TRACKNUMBER", m.toString());
        break;
      case "tracksTotal":
        l("TRACKTOTAL", m.toString());
        break;
      case "discNumber":
        l("DISCNUMBER", m.toString());
        break;
      case "discsTotal":
        l("DISCTOTAL", m.toString());
        break;
      case "images":
        {
          if (!t)
            break;
          for (const w of m) {
            const y = w.kind === "coverFront" ? 3 : w.kind === "coverBack" ? 4 : 0, b = new Uint8Array(w.mimeType.length);
            for (let C = 0; C < w.mimeType.length; C++)
              b[C] = w.mimeType.charCodeAt(C);
            const k = Y.encode(w.description ?? ""), S = new Uint8Array(8 + b.length + 4 + k.length + 16 + 4 + w.data.length), T = q(S);
            T.setUint32(0, y, !1), T.setUint32(4, b.length, !1), S.set(b, 8), T.setUint32(8 + b.length, k.length, !1), S.set(k, 12 + b.length), T.setUint32(28 + b.length + k.length, w.data.length, !1), S.set(w.data, 32 + b.length + k.length);
            const A = Ol(S);
            l("METADATA_BLOCK_PICTURE", A);
          }
        }
        break;
      case "raw":
        break;
      default:
        pe(g);
    }
  if (e.raw)
    for (const g in e.raw) {
      const m = e.raw[g] ?? e.raw[g.toLowerCase()];
      g === "vendor" || m == null || c.has(g) || typeof m == "string" && l(g, m);
    }
  const u = new Uint8Array(4);
  q(u).setUint32(0, c.size, !0), i.splice(2, 0, u);
  const d = i.reduce((g, m) => g + m.length, 0), f = new Uint8Array(d);
  let h = 0;
  for (const g of i)
    f.set(g, h), h += g.length;
  return f;
}, Rn = [2, 1, 2, 3, 3, 4, 4, 5], Ko = (r) => {
  if (r.length < 7 || r[0] !== 11 || r[1] !== 119)
    return null;
  const e = new j(r);
  e.skipBits(16), e.skipBits(16);
  const t = e.readBits(2);
  if (t === 3)
    return null;
  const i = e.readBits(6), s = e.readBits(5);
  if (s > 8)
    return null;
  const n = e.readBits(3), a = e.readBits(3);
  (a & 1) !== 0 && a !== 1 && e.skipBits(2), (a & 4) !== 0 && e.skipBits(2), a === 2 && e.skipBits(2);
  const o = e.readBits(1), c = Math.floor(i / 2);
  return { fscod: t, bsid: s, bsmod: n, acmod: a, lfeon: o, bitRateCode: c };
}, yu = [
  // frmsizecod, [48kHz, 44.1kHz, 32kHz] in bytes
  128,
  138,
  192,
  128,
  140,
  192,
  160,
  174,
  240,
  160,
  176,
  240,
  192,
  208,
  288,
  192,
  210,
  288,
  224,
  242,
  336,
  224,
  244,
  336,
  256,
  278,
  384,
  256,
  280,
  384,
  320,
  348,
  480,
  320,
  350,
  480,
  384,
  416,
  288 * 2,
  384,
  418,
  288 * 2,
  448,
  486,
  336 * 2,
  448,
  488,
  336 * 2,
  256 * 2,
  278 * 2,
  384 * 2,
  256 * 2,
  279 * 2,
  384 * 2,
  320 * 2,
  348 * 2,
  480 * 2,
  320 * 2,
  349 * 2,
  480 * 2,
  384 * 2,
  417 * 2,
  576 * 2,
  384 * 2,
  418 * 2,
  576 * 2,
  448 * 2,
  487 * 2,
  672 * 2,
  448 * 2,
  488 * 2,
  672 * 2,
  512 * 2,
  557 * 2,
  768 * 2,
  512 * 2,
  558 * 2,
  768 * 2,
  640 * 2,
  696 * 2,
  960 * 2,
  640 * 2,
  697 * 2,
  960 * 2,
  768 * 2,
  835 * 2,
  1152 * 2,
  768 * 2,
  836 * 2,
  1152 * 2,
  896 * 2,
  975 * 2,
  1344 * 2,
  896 * 2,
  976 * 2,
  1344 * 2,
  1024 * 2,
  1114 * 2,
  1536 * 2,
  1024 * 2,
  1115 * 2,
  1536 * 2,
  1152 * 2,
  1253 * 2,
  1728 * 2,
  1152 * 2,
  1254 * 2,
  1728 * 2,
  1280 * 2,
  1393 * 2,
  1920 * 2,
  1280 * 2,
  1394 * 2,
  1920 * 2
], bu = 1536, mr = new Uint8Array([5, 4, 65, 67, 45, 51]), pr = new Uint8Array([5, 4, 69, 65, 67, 51]), Qo = [1, 2, 3, 6], $o = (r) => {
  if (r.length < 6 || r[0] !== 11 || r[1] !== 119)
    return null;
  const e = new j(r);
  e.skipBits(16);
  const t = e.readBits(2);
  if (e.skipBits(3), t !== 0 && t !== 2)
    return null;
  const i = e.readBits(11), s = e.readBits(2);
  let n = 0, a;
  s === 3 ? (n = e.readBits(2), a = 3) : a = e.readBits(2);
  const o = e.readBits(3), c = e.readBits(1), l = e.readBits(5);
  if (l < 11 || l > 16)
    return null;
  const u = Qo[a];
  let d;
  return s < 3 ? d = Yr[s] / 1e3 : d = Oo[n] / 1e3, {
    dataRate: Math.round((i + 1) * d / (u * 16)),
    substreams: [{
      fscod: s,
      fscod2: n,
      bsid: l,
      bsmod: 0,
      acmod: o,
      lfeon: c,
      numDepSub: 0,
      chanLoc: 0
    }]
  };
}, ku = (r) => {
  if (r.length < 2)
    return null;
  const e = new j(r), t = e.readBits(13), i = e.readBits(3), s = [];
  for (let n = 0; n <= i && !(Math.ceil(e.pos / 8) + 3 > r.length); n++) {
    const a = e.readBits(2), o = e.readBits(5);
    e.skipBits(1), e.skipBits(1);
    const c = e.readBits(3), l = e.readBits(3), u = e.readBits(1);
    e.skipBits(3);
    const d = e.readBits(4);
    let f = 0;
    d > 0 ? f = e.readBits(9) : e.skipBits(1), s.push({
      fscod: a,
      fscod2: null,
      bsid: o,
      bsmod: c,
      acmod: l,
      lfeon: u,
      numDepSub: d,
      chanLoc: f
    });
  }
  return s.length === 0 ? null : { dataRate: t, substreams: s };
}, Go = (r) => {
  const e = r.substreams[0];
  return p(e), e.fscod < 3 ? Yr[e.fscod] : e.fscod2 !== null && e.fscod2 < 3 ? Oo[e.fscod2] : null;
}, Xo = (r) => {
  const e = r.substreams[0];
  p(e);
  let t = Rn[e.acmod] + e.lfeon;
  if (e.numDepSub > 0) {
    const i = [2, 2, 1, 1, 2, 2, 2, 1, 1];
    for (let s = 0; s < 9; s++)
      e.chanLoc & 1 << 8 - s && (t += i[s]);
  }
  return t;
};
class bt {
  constructor(e) {
    this.input = e;
  }
  dispose() {
  }
}
const Re = /* @__PURE__ */ new Uint8Array(0);
class Z {
  /** Creates a new {@link EncodedPacket} from raw bytes and timing information. */
  constructor(e, t, i, s, n = -1, a, o) {
    if (this.data = e, this.type = t, this.timestamp = i, this.duration = s, this.sequenceNumber = n, e === Re && a === void 0)
      throw new Error("Internal error: byteLength must be explicitly provided when constructing metadata-only packets.");
    if (a === void 0 && (a = e.byteLength), !(e instanceof Uint8Array))
      throw new TypeError("data must be a Uint8Array.");
    if (t !== "key" && t !== "delta")
      throw new TypeError('type must be either "key" or "delta".');
    if (!Number.isFinite(i))
      throw new TypeError("timestamp must be a number.");
    if (!Number.isFinite(s) || s < 0)
      throw new TypeError("duration must be a non-negative number.");
    if (!Number.isFinite(n))
      throw new TypeError("sequenceNumber must be a number.");
    if (!Number.isInteger(a) || a < 0)
      throw new TypeError("byteLength must be a non-negative integer.");
    if (o !== void 0 && (typeof o != "object" || !o))
      throw new TypeError("sideData, when provided, must be an object.");
    if (o?.alpha !== void 0 && !(o.alpha instanceof Uint8Array))
      throw new TypeError("sideData.alpha, when provided, must be a Uint8Array.");
    if (o?.alphaByteLength !== void 0 && (!Number.isInteger(o.alphaByteLength) || o.alphaByteLength < 0))
      throw new TypeError("sideData.alphaByteLength, when provided, must be a non-negative integer.");
    this.byteLength = a, this.sideData = o ?? {}, this.sideData.alpha && this.sideData.alphaByteLength === void 0 && (this.sideData.alphaByteLength = this.sideData.alpha.byteLength);
  }
  /**
   * If this packet is a metadata-only packet. Metadata-only packets don't contain their packet data. They are the
   * result of retrieving packets with {@link PacketRetrievalOptions.metadataOnly} set to `true`.
   */
  get isMetadataOnly() {
    return this.data === Re;
  }
  /** The timestamp of this packet in microseconds. */
  get microsecondTimestamp() {
    return Math.trunc(Ct * this.timestamp);
  }
  /** The duration of this packet in microseconds. */
  get microsecondDuration() {
    return Math.trunc(Ct * this.duration);
  }
  /** Converts this packet to an
   * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the
   * WebCodecs API. */
  toEncodedVideoChunk() {
    if (this.isMetadataOnly)
      throw new TypeError("Metadata-only packets cannot be converted to a video chunk.");
    if (typeof EncodedVideoChunk > "u")
      throw new Error("Your browser does not support EncodedVideoChunk.");
    return new EncodedVideoChunk({
      data: this.data,
      type: this.type,
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration
    });
  }
  /**
   * Converts this packet to an
   * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) for use with the
   * WebCodecs API, using the alpha side data instead of the color data. Throws if no alpha side data is defined.
   */
  alphaToEncodedVideoChunk(e = this.type) {
    if (!this.sideData.alpha)
      throw new TypeError("This packet does not contain alpha side data.");
    if (this.isMetadataOnly)
      throw new TypeError("Metadata-only packets cannot be converted to a video chunk.");
    if (typeof EncodedVideoChunk > "u")
      throw new Error("Your browser does not support EncodedVideoChunk.");
    return new EncodedVideoChunk({
      data: this.sideData.alpha,
      type: e,
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration
    });
  }
  /** Converts this packet to an
   * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk) for use with the
   * WebCodecs API. */
  toEncodedAudioChunk() {
    if (this.isMetadataOnly)
      throw new TypeError("Metadata-only packets cannot be converted to an audio chunk.");
    if (typeof EncodedAudioChunk > "u")
      throw new Error("Your browser does not support EncodedAudioChunk.");
    return new EncodedAudioChunk({
      data: this.data,
      type: this.type,
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration
    });
  }
  /**
   * Creates an {@link EncodedPacket} from an
   * [`EncodedVideoChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedVideoChunk) or
   * [`EncodedAudioChunk`](https://developer.mozilla.org/en-US/docs/Web/API/EncodedAudioChunk). This method is useful
   * for converting chunks from the WebCodecs API to `EncodedPacket` instances.
   */
  static fromEncodedChunk(e, t) {
    if (!(e instanceof EncodedVideoChunk || e instanceof EncodedAudioChunk))
      throw new TypeError("chunk must be an EncodedVideoChunk or EncodedAudioChunk.");
    const i = new Uint8Array(e.byteLength);
    return e.copyTo(i), new Z(i, e.type, e.timestamp / 1e6, (e.duration ?? 0) / 1e6, void 0, void 0, t);
  }
  /** Clones this packet while optionally modifying the new packet's data. */
  clone(e) {
    if (e !== void 0 && (typeof e != "object" || e === null))
      throw new TypeError("options, when provided, must be an object.");
    if (e?.data !== void 0 && !(e.data instanceof Uint8Array))
      throw new TypeError("options.data, when provided, must be a Uint8Array.");
    if (e?.type !== void 0 && e.type !== "key" && e.type !== "delta")
      throw new TypeError('options.type, when provided, must be either "key" or "delta".');
    if (e?.timestamp !== void 0 && !Number.isFinite(e.timestamp))
      throw new TypeError("options.timestamp, when provided, must be a number.");
    if (e?.duration !== void 0 && !Number.isFinite(e.duration))
      throw new TypeError("options.duration, when provided, must be a number.");
    if (e?.sequenceNumber !== void 0 && !Number.isFinite(e.sequenceNumber))
      throw new TypeError("options.sequenceNumber, when provided, must be a number.");
    if (e?.sideData !== void 0 && (typeof e.sideData != "object" || e.sideData === null))
      throw new TypeError("options.sideData, when provided, must be an object.");
    return new Z(e?.data ?? this.data, e?.type ?? this.type, e?.timestamp ?? this.timestamp, e?.duration ?? this.duration, e?.sequenceNumber ?? this.sequenceNumber, this.byteLength, e?.sideData ?? this.sideData);
  }
}
const Yo = (r) => {
  let t = (r.hasVideo ? "video/" : r.hasAudio ? "audio/" : "application/") + (r.isQuickTime ? "quicktime" : "mp4");
  if (r.codecStrings.length > 0) {
    const i = [...new Set(r.codecStrings)];
    t += `; codecs="${i.join(", ")}"`;
  }
  return t;
}, Zo = (r) => {
  const e = q(r);
  let t = 0;
  const i = e.getUint8(t);
  t += 1, t += 3;
  const s = Hi(r.subarray(t, t + 16));
  t += 16;
  let n = null;
  if (i > 0) {
    const o = e.getUint32(t);
    if (t += 4, o > 0) {
      n = [];
      for (let c = 0; c < o; c++)
        n.push(Hi(r.subarray(t, t + 16))), t += 16;
    }
  }
  const a = e.getUint32(t);
  return t += 4, {
    systemId: s,
    keyIds: n,
    data: r.slice(t, t + a)
  };
}, Jo = (r, e) => r.systemId === e.systemId && Po(r.data, e.data);
const ut = 8, Vt = 16, xt = (r) => {
  let e = B(r);
  const t = oe(r, 4);
  let i = 8;
  e === 1 && (e = ze(r), i = 16);
  const n = e - i;
  return n < 0 ? null : { name: t, totalSize: e, headerSize: i, contentSize: n };
}, Rt = (r) => Lt(r) / 65536, gs = (r) => Lt(r) / 1073741824, ws = (r) => {
  let e = 0;
  for (let t = 0; t < 4; t++) {
    e <<= 7;
    const i = U(r);
    if (e |= i & 127, (i & 128) === 0)
      break;
  }
  return e;
}, Xe = (r) => {
  let e = ue(r);
  return r.skip(2), e = Math.min(e, r.remainingLength), ve.decode(N(r, e));
}, Tu = (r) => {
  const e = xt(r);
  if (!e || e.name !== "data" || r.remainingLength < 8)
    return null;
  const t = B(r);
  r.skip(4);
  const i = N(r, e.contentSize - 8);
  switch (t) {
    case 1:
      return ve.decode(i);
    // UTF-8
    case 2:
      return new TextDecoder("utf-16be").decode(i);
    // UTF-16-BE
    case 13:
      return new hi(i, "image/jpeg");
    case 14:
      return new hi(i, "image/png");
    case 27:
      return new hi(i, "image/bmp");
    default:
      return i;
  }
};
const et = 16, nt = new Uint32Array(256), ri = new Uint32Array(256), si = new Uint32Array(256), ni = new Uint32Array(256), ai = new Uint32Array(256), Se = new Uint32Array(256), ec = new Uint32Array(10);
let tc = !1;
const Su = () => {
  const r = new Uint8Array(256), e = new Uint8Array(256), t = new Uint8Array(256);
  for (let n = 0, a = 1; n < 256; n++)
    t[n] = a, e[a] = n, a = a ^ a << 1 ^ (a & 128 ? 283 : 0);
  const i = (n, a) => n && a ? t[(e[n] + e[a]) % 255] : 0;
  r[0] = 99;
  for (let n = 1; n < 256; n++) {
    const a = t[255 - e[n]];
    let o = a ^ a << 1 ^ a << 2 ^ a << 3 ^ a << 4;
    o = o >>> 8 ^ o & 255 ^ 99, r[n] = o;
  }
  for (let n = 0; n < 256; n++) {
    const a = r[n], o = r.indexOf(n);
    nt[n] = a << 24 | a << 16 | a << 8 | a, Se[n] = o << 24 | o << 16 | o << 8 | o;
    const c = i(o, 14), l = i(o, 9), u = i(o, 13), d = i(o, 11), f = c << 24 | l << 16 | u << 8 | d;
    ri[n] = f, si[n] = f >>> 8 | f << 24, ni[n] = f >>> 16 | f << 16, ai[n] = f >>> 24 | f << 8;
  }
  let s = 1;
  for (let n = 0; n < 10; n++)
    ec[n] = s << 24, s = s << 1 ^ (s & 128 ? 283 : 0);
  tc = !0;
};
class ic {
  constructor() {
    this.roundkey = new Uint32Array(44), this.iv = new Uint32Array(et / Uint32Array.BYTES_PER_ELEMENT), this.in = new Uint8Array(et), this.out = new Uint8Array(et), this.inView = new DataView(this.in.buffer), this.outView = new DataView(this.out.buffer);
  }
  init({ key: e, iv: t }) {
    p(e.byteLength === 16), p(t.byteLength === 16), tc || Su();
    const i = new DataView(e.buffer, e.byteOffset, e.byteLength), s = new DataView(t.buffer, t.byteOffset, t.byteLength);
    this.roundkey[0] = i.getUint32(0, !1), this.roundkey[1] = i.getUint32(4, !1), this.roundkey[2] = i.getUint32(8, !1), this.roundkey[3] = i.getUint32(12, !1), this.iv[0] = s.getUint32(0, !1), this.iv[1] = s.getUint32(4, !1), this.iv[2] = s.getUint32(8, !1), this.iv[3] = s.getUint32(12, !1);
    for (let n = 4; n < 44; n += 4) {
      const a = this.roundkey[n - 1];
      this.roundkey[n] = this.roundkey[n - 4] ^ nt[a >>> 16 & 255] & 4278190080 ^ nt[a >>> 8 & 255] & 16711680 ^ nt[a >>> 0 & 255] & 65280 ^ nt[a >>> 24 & 255] & 255 ^ ec[n / 4 - 1], this.roundkey[n + 1] = this.roundkey[n - 3] ^ this.roundkey[n], this.roundkey[n + 2] = this.roundkey[n - 2] ^ this.roundkey[n + 1], this.roundkey[n + 3] = this.roundkey[n - 1] ^ this.roundkey[n + 2];
    }
    for (let n = 0, a = 40; n < a; n += 4, a -= 4)
      for (let o = 0; o < 4; o++) {
        const c = this.roundkey[n + o];
        this.roundkey[n + o] = this.roundkey[a + o], this.roundkey[a + o] = c;
      }
    for (let n = 4; n < 40; n += 4)
      for (let a = 0; a < 4; a++) {
        const o = this.roundkey[n + a];
        this.roundkey[n + a] = ri[nt[o >>> 24 & 255] & 255] ^ si[nt[o >>> 16 & 255] & 255] ^ ni[nt[o >>> 8 & 255] & 255] ^ ai[nt[o >>> 0 & 255] & 255];
      }
  }
  decrypt() {
    let e = this.inView.getUint32(0, !1) ^ this.roundkey[0], t = this.inView.getUint32(4, !1) ^ this.roundkey[1], i = this.inView.getUint32(8, !1) ^ this.roundkey[2], s = this.inView.getUint32(12, !1) ^ this.roundkey[3];
    const n = this.inView.getUint32(0, !1), a = this.inView.getUint32(4, !1), o = this.inView.getUint32(8, !1), c = this.inView.getUint32(12, !1);
    let l, u, d, f;
    for (let y = 1; y < 10; y++) {
      const b = y * 4;
      l = ri[e >>> 24] ^ si[s >>> 16 & 255] ^ ni[i >>> 8 & 255] ^ ai[t & 255] ^ this.roundkey[b], u = ri[t >>> 24] ^ si[e >>> 16 & 255] ^ ni[s >>> 8 & 255] ^ ai[i & 255] ^ this.roundkey[b + 1], d = ri[i >>> 24] ^ si[t >>> 16 & 255] ^ ni[e >>> 8 & 255] ^ ai[s & 255] ^ this.roundkey[b + 2], f = ri[s >>> 24] ^ si[i >>> 16 & 255] ^ ni[t >>> 8 & 255] ^ ai[e & 255] ^ this.roundkey[b + 3], e = l, t = u, i = d, s = f;
    }
    const h = Se[e >>> 24 & 255] & 4278190080 ^ Se[s >>> 16 & 255] & 16711680 ^ Se[i >>> 8 & 255] & 65280 ^ Se[t >>> 0 & 255] & 255 ^ this.roundkey[40], g = Se[t >>> 24 & 255] & 4278190080 ^ Se[e >>> 16 & 255] & 16711680 ^ Se[s >>> 8 & 255] & 65280 ^ Se[i >>> 0 & 255] & 255 ^ this.roundkey[41], m = Se[i >>> 24 & 255] & 4278190080 ^ Se[t >>> 16 & 255] & 16711680 ^ Se[e >>> 8 & 255] & 65280 ^ Se[s >>> 0 & 255] & 255 ^ this.roundkey[42], w = Se[s >>> 24 & 255] & 4278190080 ^ Se[i >>> 16 & 255] & 16711680 ^ Se[t >>> 8 & 255] & 65280 ^ Se[e >>> 0 & 255] & 255 ^ this.roundkey[43];
    this.outView.setUint32(0, h ^ this.iv[0], !1), this.outView.setUint32(4, g ^ this.iv[1], !1), this.outView.setUint32(8, m ^ this.iv[2], !1), this.outView.setUint32(12, w ^ this.iv[3], !1), this.iv[0] = n, this.iv[1] = a, this.iv[2] = o, this.iv[3] = c;
  }
}
const Au = (r, e, t) => {
  let i = !1, s = 0;
  const n = 2 ** 16, a = 16, o = new ic();
  return new ReadableStream({
    pull: async (c) => {
      i || (o.init(await e()), i = !0);
      const l = n + a;
      let u = r.requestSliceRange(s, 0, l);
      if (u instanceof Promise && (u = await u), !u || u.length === 0)
        throw new Error("Invalid ciphertext.");
      const d = u.length;
      if (d % 16 !== 0)
        throw new Error("Invalid ciphertext.");
      const f = d === l ? d - a : d, h = N(u, f), g = new Uint8Array(f);
      for (let m = 0; m < f; m += 16)
        o.in.set(h.subarray(m, m + 16)), o.decrypt(), g.set(o.out, m);
      if (f < d)
        c.enqueue(g), s += f;
      else {
        const m = g[f - 1];
        if (m === 0 || m > 16)
          throw new Error("Invalid PKCS#7 padding. Incorrect key or corrupted data.");
        const w = g.subarray(0, f - m);
        c.enqueue(w), c.close(), t();
      }
    },
    cancel: () => {
      t();
    }
  });
};
class Mn extends bt {
  constructor(e) {
    super(e), this.moovSlice = null, this.currentTrack = null, this.tracks = [], this.metadataPromise = null, this.movieTimescale = -1, this.movieDurationInTimescale = -1, this.isQuickTime = !1, this.metadataTags = {}, this.currentMetadataKeys = null, this.isFragmented = !1, this.fragmentTrackDefaults = [], this.psshBoxes = [], this.currentFragment = null, this.lastReadFragment = null, this.decryptionKeyCache = /* @__PURE__ */ new Map(), this.reader = e._reader;
  }
  async getTrackBackings() {
    return await this.readMetadata(), this.tracks.map((e) => e.trackBacking);
  }
  async getMimeType() {
    await this.readMetadata();
    const e = await this.getTrackBackings(), t = await Promise.all(e.map((i) => i.getDecoderConfig().then((s) => s?.codec ?? null)));
    return Yo({
      isQuickTime: this.isQuickTime,
      hasVideo: this.tracks.some((i) => i.info?.type === "video"),
      hasAudio: this.tracks.some((i) => i.info?.type === "audio"),
      codecStrings: t.filter(Boolean)
    });
  }
  async getMetadataTags() {
    return await this.readMetadata(), this.metadataTags;
  }
  readMetadata() {
    return this.metadataPromise ??= (async () => {
      let e = 0, t = !1, i = !1;
      for (; ; ) {
        let s = this.reader.requestSliceRange(e, ut, Vt);
        if (s instanceof Promise && (s = await s), !s)
          break;
        const n = e, a = xt(s);
        if (!a)
          break;
        if (a.name === "ftyp" || a.name === "styp") {
          const o = oe(s, 4);
          this.isQuickTime = o === "qt  ";
        } else if (a.name === "moov") {
          let o = this.reader.requestSlice(s.filePos, a.contentSize);
          if (o instanceof Promise && (o = await o), !o)
            break;
          this.moovSlice = o, this.readContiguousBoxes(this.moovSlice);
          for (const c of this.tracks) {
            const l = c.editListPreviousSegmentDurations / this.movieTimescale;
            c.editListOffset -= Math.round(l * c.timescale);
          }
          t = this.isFragmented && this.reader.fileSize !== null && this.reader.fileSize > n + a.totalSize, i = !0;
          break;
        } else if (a.name === "moof") {
          if (!this.input._initInput)
            throw new Error('"moof" box encountered with no "moov" box present; this file is likely a Segment as described in ISO/IEC 14496-12 Section 8.16. A separate init file that contains a "moov" box is required to read this file, please provide it using InputOptions.initInput.');
          await this.copyMetadataFromInitInput(this.input._initInput), t = !1, i = !0;
          break;
        }
        e = n + a.totalSize;
      }
      if (!i && this.input._initInput && await this.copyMetadataFromInitInput(this.input._initInput), t) {
        p(this.reader.fileSize !== null);
        let s = this.reader.requestSlice(this.reader.fileSize - 4, 4);
        s instanceof Promise && (s = await s), p(s);
        const n = B(s), a = this.reader.fileSize - n;
        if (a >= 0 && a <= this.reader.fileSize - Vt) {
          let o = this.reader.requestSliceRange(a, ut, Vt);
          if (o instanceof Promise && (o = await o), o) {
            const c = xt(o);
            if (c && c.name === "mfra") {
              let l = this.reader.requestSlice(o.filePos, c.contentSize);
              l instanceof Promise && (l = await l), l && this.readContiguousBoxes(l);
            }
          }
        }
      }
    })();
  }
  async copyMetadataFromInitInput(e) {
    const t = await e._getDemuxer();
    if (t.constructor !== Mn)
      throw new Error("Init input must match the input's format.");
    await t.readMetadata(), this.movieTimescale = t.movieTimescale, this.movieDurationInTimescale = t.movieDurationInTimescale, this.metadataTags = t.metadataTags, this.isFragmented = !0, this.fragmentTrackDefaults = t.fragmentTrackDefaults, this.psshBoxes = t.psshBoxes;
    for (const i of t.tracks) {
      const s = {
        id: i.id,
        demuxer: this,
        trackBacking: null,
        disposition: i.disposition,
        timescale: i.timescale,
        durationInMediaTimescale: i.durationInMediaTimescale,
        durationInMovieTimescale: i.durationInMovieTimescale,
        rotation: i.rotation,
        internalCodecId: i.internalCodecId,
        name: i.name,
        languageCode: i.languageCode,
        sampleTableByteOffset: null,
        sampleTable: null,
        fragmentLookupTable: [],
        currentFragmentState: null,
        fragmentPositionCache: [],
        editListPreviousSegmentDurations: i.editListPreviousSegmentDurations,
        editListOffset: i.editListOffset,
        encryptionInfo: i.encryptionInfo,
        encryptionAuxInfo: null,
        frmaCodecString: null,
        info: i.info
      };
      if (i.trackBacking) {
        if (p(s.info), s.info.type === "video" && s.info.width !== -1) {
          const n = s;
          s.trackBacking = new da(n), this.tracks.push(s);
        } else if (s.info.type === "audio" && s.info.numberOfChannels !== -1) {
          const n = s;
          s.trackBacking = new fa(n), this.tracks.push(s);
        }
      }
    }
  }
  getSampleTableForTrack(e) {
    if (e.sampleTable)
      return e.sampleTable;
    const t = {
      sampleTimingEntries: [],
      sampleCompositionTimeOffsets: [],
      sampleSizes: [],
      keySampleIndices: null,
      chunkOffsets: [],
      sampleToChunk: [],
      presentationTimestamps: null,
      presentationTimestampIndexMap: null
    };
    if (e.sampleTable = t, e.sampleTableByteOffset === null)
      return t;
    p(this.moovSlice);
    const i = this.moovSlice.slice(e.sampleTableByteOffset);
    if (this.currentTrack = e, this.traverseBox(i), this.currentTrack = null, e.info?.type === "audio" && e.info.codec && ge.includes(e.info.codec) && t.sampleCompositionTimeOffsets.length === 0) {
      p(e.info?.type === "audio");
      const n = Qe(e.info.codec), a = [], o = [];
      for (let c = 0; c < t.sampleToChunk.length; c++) {
        const l = t.sampleToChunk[c], u = t.sampleToChunk[c + 1], d = (u ? u.startChunkIndex : t.chunkOffsets.length) - l.startChunkIndex;
        for (let f = 0; f < d; f++) {
          const h = l.startSampleIndex + f * l.samplesPerChunk, g = h + l.samplesPerChunk, m = $(t.sampleTimingEntries, h, (_) => _.startIndex), w = t.sampleTimingEntries[m], y = $(t.sampleTimingEntries, g, (_) => _.startIndex), b = t.sampleTimingEntries[y], k = w.startDecodeTimestamp + (h - w.startIndex) * w.delta, T = b.startDecodeTimestamp + (g - b.startIndex) * b.delta - k, A = ne(a);
          A && A.delta === T ? A.count++ : a.push({
            startIndex: l.startChunkIndex + f,
            startDecodeTimestamp: k,
            count: 1,
            delta: T
          });
          const C = l.samplesPerChunk * n.sampleSize * e.info.numberOfChannels;
          o.push(C);
        }
        l.startSampleIndex = l.startChunkIndex, l.samplesPerChunk = 1;
      }
      t.sampleTimingEntries = a, t.sampleSizes = o;
    }
    if (t.sampleCompositionTimeOffsets.length > 0) {
      t.presentationTimestamps = [];
      for (const n of t.sampleTimingEntries)
        for (let a = 0; a < n.count; a++)
          t.presentationTimestamps.push({
            presentationTimestamp: n.startDecodeTimestamp + a * n.delta,
            sampleIndex: n.startIndex + a
          });
      for (const n of t.sampleCompositionTimeOffsets)
        for (let a = 0; a < n.count; a++) {
          const o = n.startIndex + a, c = t.presentationTimestamps[o];
          c && (c.presentationTimestamp += n.offset);
        }
      t.presentationTimestamps.sort((n, a) => n.presentationTimestamp - a.presentationTimestamp), t.presentationTimestampIndexMap = Array(t.presentationTimestamps.length).fill(-1);
      for (let n = 0; n < t.presentationTimestamps.length; n++)
        t.presentationTimestampIndexMap[t.presentationTimestamps[n].sampleIndex] = n;
    }
    return t;
  }
  async readFragment(e) {
    if (this.lastReadFragment?.moofOffset === e)
      return this.lastReadFragment;
    let t = this.reader.requestSliceRange(e, ut, Vt);
    t instanceof Promise && (t = await t), p(t);
    const i = xt(t);
    p(i?.name === "moof");
    let s = this.reader.requestSlice(e, i.totalSize);
    s instanceof Promise && (s = await s), p(s), this.traverseBox(s);
    const n = this.lastReadFragment;
    p(n && n.moofOffset === e);
    for (const [, a] of n.trackData) {
      const o = a.track, { fragmentPositionCache: c } = o;
      if (!a.startTimestampIsFinal) {
        const u = o.fragmentLookupTable.find((d) => d.moofOffset === n.moofOffset);
        if (u)
          ys(a, u.timestamp);
        else {
          const d = $(c, n.moofOffset - 1, (f) => f.moofOffset);
          if (d !== -1) {
            const f = c[d];
            ys(a, f.endTimestamp);
          }
        }
        a.startTimestampIsFinal = !0;
      }
      const l = $(c, a.startTimestamp, (u) => u.startTimestamp);
      if ((l === -1 || c[l].moofOffset !== n.moofOffset) && c.splice(l + 1, 0, {
        moofOffset: n.moofOffset,
        startTimestamp: a.startTimestamp,
        endTimestamp: a.endTimestamp
      }), a.encryptionAuxInfo && o.encryptionInfo) {
        const u = await sc(this.reader, o.encryptionInfo, a.encryptionAuxInfo);
        for (let d = 0; d < Math.min(a.samples.length, u.length); d++) {
          const f = u[d];
          a.samples[d].encryption = f;
        }
      }
    }
    return n;
  }
  readContiguousBoxes(e) {
    const t = e.filePos;
    for (; e.filePos - t <= e.length - ut && this.traverseBox(e); )
      ;
  }
  // eslint-disable-next-line @stylistic/generator-star-spacing
  *iterateContiguousBoxes(e) {
    const t = e.filePos;
    for (; e.filePos - t <= e.length - ut; ) {
      const i = e.filePos, s = xt(e);
      if (!s)
        break;
      yield { boxInfo: s, slice: e }, e.filePos = i + s.totalSize;
    }
  }
  traverseBox(e) {
    const t = e.filePos, i = xt(e);
    if (!i)
      return !1;
    const s = e.filePos, n = t + i.totalSize;
    switch (i.name) {
      case "mdia":
      case "minf":
      case "dinf":
      case "mfra":
      case "edts":
      case "sinf":
      case "schi":
        this.readContiguousBoxes(e.slice(s, i.contentSize));
        break;
      case "mvhd":
        {
          const a = U(e);
          e.skip(3), a === 1 ? (e.skip(16), this.movieTimescale = B(e), this.movieDurationInTimescale = ze(e)) : (e.skip(8), this.movieTimescale = B(e), this.movieDurationInTimescale = B(e));
        }
        break;
      case "trak":
        {
          const a = {
            id: -1,
            demuxer: this,
            trackBacking: null,
            disposition: {
              ...yt,
              primary: !1
            },
            info: null,
            timescale: -1,
            durationInMovieTimescale: -1,
            durationInMediaTimescale: -1,
            rotation: 0,
            internalCodecId: null,
            name: null,
            languageCode: ke,
            sampleTableByteOffset: -1,
            sampleTable: null,
            fragmentLookupTable: [],
            currentFragmentState: null,
            fragmentPositionCache: [],
            editListPreviousSegmentDurations: 0,
            editListOffset: 0,
            encryptionInfo: null,
            encryptionAuxInfo: null,
            frmaCodecString: null
          };
          if (this.currentTrack = a, this.readContiguousBoxes(e.slice(s, i.contentSize)), a.id !== -1 && a.timescale !== -1 && a.info !== null) {
            if (a.info.type === "video" && a.info.width !== -1) {
              const o = a;
              a.trackBacking = new da(o), this.tracks.push(a);
            } else if (a.info.type === "audio" && a.info.numberOfChannels !== -1) {
              const o = a;
              a.trackBacking = new fa(o), this.tracks.push(a);
            }
          }
          this.currentTrack = null;
        }
        break;
      case "tkhd":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          const o = U(e), l = !!(at(e) & 1);
          if (a.disposition.default = l, o === 0)
            e.skip(8), a.id = B(e), e.skip(4), a.durationInMovieTimescale = B(e);
          else if (o === 1)
            e.skip(16), a.id = B(e), e.skip(4), a.durationInMovieTimescale = ze(e);
          else
            throw new Error(`Incorrect track header version ${o}.`);
          e.skip(16);
          const u = [
            Rt(e),
            Rt(e),
            gs(e),
            Rt(e),
            Rt(e),
            gs(e),
            Rt(e),
            Rt(e),
            gs(e)
          ], d = gi(Vs(_u(u), 90));
          p(d === 0 || d === 90 || d === 180 || d === 270), a.rotation = d;
        }
        break;
      case "elst":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          const o = U(e);
          e.skip(3);
          let c = !1, l = 0;
          const u = B(e);
          for (let d = 0; d < u; d++) {
            const f = o === 1 ? ze(e) : B(e), h = o === 1 ? df(e) : Lt(e), g = Rt(e);
            if (f !== 0) {
              if (c) {
                D._warn("Unsupported edit list: multiple edits are not currently supported. Only using first edit.");
                break;
              }
              if (h === -1) {
                l += f;
                continue;
              }
              if (g !== 1) {
                D._warn("Unsupported edit list entry: media rate must be 1.");
                break;
              }
              a.editListPreviousSegmentDurations = l, a.editListOffset = h, c = !0;
            }
          }
        }
        break;
      case "mdhd":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          const o = U(e);
          e.skip(3), o === 0 ? (e.skip(8), a.timescale = B(e), a.durationInMediaTimescale = B(e)) : o === 1 && (e.skip(16), a.timescale = B(e), a.durationInMediaTimescale = ze(e));
          let c = ue(e);
          if (c > 0) {
            a.languageCode = "";
            for (let l = 0; l < 3; l++)
              a.languageCode = String.fromCharCode(96 + (c & 31)) + a.languageCode, c >>= 5;
            Ki(a.languageCode) || (a.languageCode = ke);
          }
        }
        break;
      case "hdlr":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          e.skip(8);
          const o = oe(e, 4);
          o === "vide" ? a.info = {
            type: "video",
            width: -1,
            height: -1,
            squarePixelWidth: -1,
            squarePixelHeight: -1,
            codec: null,
            codecDescription: null,
            colorSpace: null,
            avcType: null,
            avcCodecInfo: null,
            hevcCodecInfo: null,
            vp9CodecInfo: null,
            av1CodecInfo: null,
            proresFormat: null
          } : o === "soun" && (a.info = {
            type: "audio",
            numberOfChannels: -1,
            sampleRate: -1,
            codec: null,
            codecDescription: null,
            aacCodecInfo: null,
            pcmLittleEndian: !1,
            pcmSampleSize: null
          });
        }
        break;
      case "stbl":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          a.sampleTableByteOffset = t, this.readContiguousBoxes(e.slice(s, i.contentSize));
        }
        break;
      case "stsd":
        {
          const a = this.currentTrack;
          if (!a || a.info === null || a.sampleTable)
            break;
          const o = U(e);
          e.skip(3);
          const c = B(e);
          for (let l = 0; l < c; l++) {
            const u = e.filePos, d = xt(e);
            if (!d)
              break;
            a.internalCodecId = d.name;
            const f = d.name.toLowerCase();
            if (a.info.type === "video") {
              e.skip(24), a.info.width = ue(e), a.info.height = ue(e), a.info.squarePixelWidth = a.info.width, a.info.squarePixelHeight = a.info.height, e.skip(50), a.frmaCodecString = null, this.readContiguousBoxes(e.slice(e.filePos, u + d.totalSize - e.filePos));
              const h = f === "encv" ? a.frmaCodecString : f;
              a.frmaCodecString = null, h === "avc1" || h === "avc3" ? (a.info.codec = "avc", a.info.avcType = h === "avc1" ? 1 : 3) : h === "hvc1" || h === "hev1" ? a.info.codec = "hevc" : h === "vp08" ? a.info.codec = "vp8" : h === "vp09" ? a.info.codec = "vp9" : h === "av01" ? a.info.codec = "av1" : jt.includes(f) ? (a.info.codec = "prores", a.info.proresFormat = f) : h === null ? D._warn("Unknown encrypted video codec due to missing frma box.") : D._warn(`Unsupported video codec (sample entry type '${d.name}').`);
            } else {
              e.skip(8);
              const h = ue(e);
              e.skip(6);
              let g = ue(e), m = ue(e);
              e.skip(4);
              let w = B(e) / 65536, y = null;
              o === 0 && h > 0 && (h === 1 ? (e.skip(4), m = 8 * B(e), e.skip(8)) : h === 2 && (e.skip(4), w = tl(e), g = B(e), e.skip(4), m = B(e), y = B(e), e.skip(8))), a.info.numberOfChannels = g, a.info.sampleRate = w, a.frmaCodecString = null, this.readContiguousBoxes(e.slice(e.filePos, u + d.totalSize - e.filePos));
              const b = f === "enca" ? a.frmaCodecString : f;
              if (a.frmaCodecString = null, b !== "mp4a") if (b === "opus")
                a.info.codec = "opus", a.info.sampleRate = xi;
              else if (b === "flac")
                a.info.codec = "flac";
              else if (b === "ulaw")
                a.info.codec = "ulaw";
              else if (b === "alaw")
                a.info.codec = "alaw";
              else if (b === "ac-3")
                a.info.codec = "ac3";
              else if (b === "ec-3")
                a.info.codec = "eac3";
              else if (b === "twos")
                m === 8 ? a.info.codec = "pcm-s8" : m === 16 ? a.info.codec = a.info.pcmLittleEndian ? "pcm-s16" : "pcm-s16be" : (D._warn(`Unsupported sample size ${m} for codec 'twos'.`), a.info.codec = null);
              else if (b === "sowt")
                m === 8 ? a.info.codec = "pcm-s8" : m === 16 ? a.info.codec = "pcm-s16" : (D._warn(`Unsupported sample size ${m} for codec 'sowt'.`), a.info.codec = null);
              else if (b === "raw ")
                a.info.codec = "pcm-u8";
              else if (b === "in24")
                a.info.codec = a.info.pcmLittleEndian ? "pcm-s24" : "pcm-s24be";
              else if (b === "in32")
                a.info.codec = a.info.pcmLittleEndian ? "pcm-s32" : "pcm-s32be";
              else if (b === "fl32")
                a.info.codec = a.info.pcmLittleEndian ? "pcm-f32" : "pcm-f32be";
              else if (b === "fl64")
                a.info.codec = a.info.pcmLittleEndian ? "pcm-f64" : "pcm-f64be";
              else if (b === "ipcm") {
                const k = a.info.pcmSampleSize;
                a.info.pcmLittleEndian ? k === 16 ? a.info.codec = "pcm-s16" : k === 24 ? a.info.codec = "pcm-s24" : k === 32 ? a.info.codec = "pcm-s32" : (D._warn(`Invalid ipcm sample size ${k}.`), a.info.codec = null) : k === 16 ? a.info.codec = "pcm-s16be" : k === 24 ? a.info.codec = "pcm-s24be" : k === 32 ? a.info.codec = "pcm-s32be" : (D._warn(`Invalid ipcm sample size ${k}.`), a.info.codec = null);
              } else if (b === "fpcm") {
                const k = a.info.pcmSampleSize;
                a.info.pcmLittleEndian ? k === 32 ? a.info.codec = "pcm-f32" : k === 64 ? a.info.codec = "pcm-f64" : (D._warn(`Invalid fpcm sample size ${k}.`), a.info.codec = null) : k === 32 ? a.info.codec = "pcm-f32be" : k === 64 ? a.info.codec = "pcm-f64be" : (D._warn(`Invalid fpcm sample size ${k}.`), a.info.codec = null);
              } else if (b === "lpcm" && y !== null) {
                const k = m + 7 >> 3, S = !!(y & 1), T = !!(y & 2), A = y & 4 ? -1 : 0;
                m > 0 && m <= 64 && (S ? m === 32 && (a.info.codec = T ? "pcm-f32be" : "pcm-f32") : A & 1 << k - 1 ? k === 1 ? a.info.codec = "pcm-s8" : k === 2 ? a.info.codec = T ? "pcm-s16be" : "pcm-s16" : k === 3 ? a.info.codec = T ? "pcm-s24be" : "pcm-s24" : k === 4 && (a.info.codec = T ? "pcm-s32be" : "pcm-s32") : k === 1 && (a.info.codec = "pcm-u8")), a.info.codec === null && D._warn("Unsupported PCM format.");
              } else b === null ? D._warn("Unknown encrypted audio codec due to missing frma box.") : D._warn(`Unsupported audio codec (sample entry type '${d.name}').`);
            }
            e.filePos = u + d.totalSize;
          }
        }
        break;
      case "frma":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          const c = oe(e, 4).toLowerCase();
          a.frmaCodecString = c;
        }
        break;
      case "schm":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          e.skip(4);
          const o = oe(e, 4);
          o === "cenc" || o === "cens" || o === "cbcs" ? a.encryptionInfo = {
            scheme: o,
            defaultKid: null,
            defaultIsProtected: null,
            defaultPerSampleIvSize: null,
            defaultConstantIv: null,
            defaultCryptByteBlock: null,
            defaultSkipByteBlock: null
          } : D._warn(`Unsupported encryption scheme '${o}'.`);
        }
        break;
      case "tenc":
        {
          const a = this.currentTrack;
          if (!a || !a.encryptionInfo)
            break;
          const o = U(e);
          e.skip(3), e.skip(1);
          const c = U(e);
          if (o > 0 ? (a.encryptionInfo.defaultCryptByteBlock = c >> 4, a.encryptionInfo.defaultSkipByteBlock = c & 15) : (a.encryptionInfo.defaultCryptByteBlock = 0, a.encryptionInfo.defaultSkipByteBlock = 0), a.encryptionInfo.defaultIsProtected = U(e) !== 0, a.encryptionInfo.defaultPerSampleIvSize = U(e), a.encryptionInfo.defaultKid = Hi(N(e, 16)), a.encryptionInfo.defaultIsProtected && a.encryptionInfo.defaultPerSampleIvSize === 0) {
            const l = U(e), u = new Uint8Array(16);
            u.set(N(e, l), 0), a.encryptionInfo.defaultConstantIv = u;
          }
        }
        break;
      case "avcC":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info), a.info.codecDescription = N(e, i.contentSize);
        }
        break;
      case "hvcC":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info), a.info.codecDescription = N(e, i.contentSize);
        }
        break;
      case "vpcC":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info?.type === "video"), e.skip(4);
          const o = U(e), c = U(e), l = U(e), u = l >> 4, d = l >> 1 & 7, f = l & 1, h = U(e), g = U(e), m = U(e);
          a.info.vp9CodecInfo = {
            profile: o,
            level: c,
            bitDepth: u,
            chromaSubsampling: d,
            videoFullRangeFlag: f,
            colourPrimaries: h,
            transferCharacteristics: g,
            matrixCoefficients: m
          };
        }
        break;
      case "av1C":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info?.type === "video"), e.skip(1);
          const o = U(e), c = o >> 5, l = o & 31, u = U(e), d = u >> 7, f = u >> 6 & 1, h = u >> 5 & 1, g = u >> 4 & 1, m = u >> 3 & 1, w = u >> 2 & 1, y = u & 3, b = c === 2 && f ? h ? 12 : 10 : f ? 10 : 8;
          a.info.av1CodecInfo = {
            profile: c,
            level: l,
            tier: d,
            bitDepth: b,
            monochrome: g,
            chromaSubsamplingX: m,
            chromaSubsamplingY: w,
            chromaSamplePosition: y
          };
        }
        break;
      case "colr":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info?.type === "video");
          const o = oe(e, 4);
          if (o !== "nclx" && o !== "nclc")
            break;
          const c = ue(e), l = ue(e), u = ue(e);
          let d;
          o === "nclx" && (d = !!(U(e) & 128)), a.info.colorSpace = {
            primaries: _r[c],
            transfer: Ir[l],
            matrix: Er[u],
            fullRange: d
          };
        }
        break;
      case "pasp":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info?.type === "video");
          const o = B(e), c = B(e);
          o > 0 && c > 0 && (o > c ? a.info.squarePixelWidth = Math.round(a.info.width * o / c) : a.info.squarePixelHeight = Math.round(a.info.height * c / o));
        }
        break;
      case "wave":
        this.readContiguousBoxes(e.slice(s, i.contentSize));
        break;
      case "esds":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info?.type === "audio"), e.skip(4);
          const o = U(e);
          p(o === 3), ws(e), e.skip(2);
          const c = U(e), l = (c & 128) !== 0, u = (c & 64) !== 0, d = (c & 32) !== 0;
          if (l && e.skip(2), u) {
            const w = U(e);
            e.skip(w);
          }
          d && e.skip(2);
          const f = U(e);
          p(f === 4);
          const h = ws(e), g = e.filePos, m = U(e);
          if (m === 64 || m === 103 ? (a.info.codec = "aac", a.info.aacCodecInfo = {
            isMpeg2: m === 103,
            objectType: null
          }) : m === 105 || m === 107 ? a.info.codec = "mp3" : m === 221 ? a.info.codec = "vorbis" : D._warn(`Unsupported audio codec (objectTypeIndication ${m}) - discarding track.`), e.skip(12), h > e.filePos - g) {
            const w = U(e);
            p(w === 5);
            const y = ws(e);
            if (a.info.codecDescription = N(e, y), a.info.codec === "aac") {
              const b = cr(a.info.codecDescription);
              b.numberOfChannels !== null && (a.info.numberOfChannels = b.numberOfChannels), b.sampleRate !== null && (a.info.sampleRate = b.sampleRate);
            }
          }
        }
        break;
      case "enda":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info?.type === "audio"), a.info.pcmLittleEndian = !!(ue(e) & 255);
        }
        break;
      case "pcmC":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info?.type === "audio"), e.skip(4);
          const o = U(e);
          a.info.pcmLittleEndian = !!(o & 1), a.info.pcmSampleSize = U(e);
        }
        break;
      case "dOps":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info?.type === "audio"), e.skip(1);
          const o = U(e), c = ue(e), l = B(e), u = mn(e), d = U(e);
          let f;
          d !== 0 ? f = N(e, 2 + o) : f = new Uint8Array(0);
          const h = new Uint8Array(19 + f.byteLength), g = new DataView(h.buffer);
          g.setUint32(0, 1332770163, !1), g.setUint32(4, 1214603620, !1), g.setUint8(8, 1), g.setUint8(9, o), g.setUint16(10, c, !0), g.setUint32(12, l, !0), g.setInt16(16, u, !0), g.setUint8(18, d), h.set(f, 19), a.info.codecDescription = h, a.info.numberOfChannels = o;
        }
        break;
      case "dfLa":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info?.type === "audio"), e.skip(4);
          const o = 127, c = 128, l = e.filePos;
          for (; e.filePos < n; ) {
            const g = U(e), m = at(e);
            if ((g & o) === mt.STREAMINFO) {
              e.skip(10);
              const y = B(e), b = y >>> 12, k = (y >> 9 & 7) + 1;
              a.info.sampleRate = b, a.info.numberOfChannels = k, e.skip(20);
            } else
              e.skip(m);
            if (g & c)
              break;
          }
          const u = e.filePos;
          e.filePos = l;
          const d = N(e, u - l), f = new Uint8Array(4 + d.byteLength);
          new DataView(f.buffer).setUint32(0, 1716281667, !1), f.set(d, 4), a.info.codecDescription = f;
        }
        break;
      case "dac3":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info?.type === "audio");
          const o = N(e, 3), c = new j(o), l = c.readBits(2);
          c.skipBits(8);
          const u = c.readBits(3), d = c.readBits(1);
          l < 3 && (a.info.sampleRate = Yr[l]), a.info.numberOfChannels = Rn[u] + d;
        }
        break;
      case "dec3":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.info?.type === "audio");
          const o = N(e, i.contentSize), c = ku(o);
          if (!c) {
            D._warn("Invalid dec3 box contents, ignoring.");
            break;
          }
          const l = Go(c);
          l !== null && (a.info.sampleRate = l), a.info.numberOfChannels = Xo(c);
        }
        break;
      case "stts":
        {
          const a = this.currentTrack;
          if (!a || !a.sampleTable)
            break;
          e.skip(4);
          const o = B(e);
          let c = 0, l = 0;
          for (let u = 0; u < o; u++) {
            const d = B(e), f = B(e);
            a.sampleTable.sampleTimingEntries.push({
              startIndex: c,
              startDecodeTimestamp: l,
              count: d,
              delta: f
            }), c += d, l += d * f;
          }
        }
        break;
      case "ctts":
        {
          const a = this.currentTrack;
          if (!a || !a.sampleTable)
            break;
          e.skip(4);
          const o = B(e);
          let c = 0;
          for (let l = 0; l < o; l++) {
            const u = B(e), d = Lt(e);
            a.sampleTable.sampleCompositionTimeOffsets.push({
              startIndex: c,
              count: u,
              offset: d
            }), c += u;
          }
        }
        break;
      case "stsz":
        {
          const a = this.currentTrack;
          if (!a || !a.sampleTable)
            break;
          e.skip(4);
          const o = B(e), c = B(e);
          if (o === 0)
            for (let l = 0; l < c; l++) {
              const u = B(e);
              a.sampleTable.sampleSizes.push(u);
            }
          else
            a.sampleTable.sampleSizes.push(o);
        }
        break;
      case "stz2":
        {
          const a = this.currentTrack;
          if (!a || !a.sampleTable)
            break;
          e.skip(4), e.skip(3);
          const o = U(e), c = B(e), l = N(e, Math.ceil(c * o / 8)), u = new j(l);
          for (let d = 0; d < c; d++) {
            const f = u.readBits(o);
            a.sampleTable.sampleSizes.push(f);
          }
        }
        break;
      case "stss":
        {
          const a = this.currentTrack;
          if (!a || !a.sampleTable)
            break;
          e.skip(4), a.sampleTable.keySampleIndices = [];
          const o = B(e);
          for (let c = 0; c < o; c++) {
            const l = B(e) - 1;
            a.sampleTable.keySampleIndices.push(l);
          }
          a.sampleTable.keySampleIndices[0] !== 0 && a.sampleTable.keySampleIndices.unshift(0);
        }
        break;
      case "stsc":
        {
          const a = this.currentTrack;
          if (!a || !a.sampleTable)
            break;
          e.skip(4);
          const o = B(e);
          for (let l = 0; l < o; l++) {
            const u = B(e) - 1, d = B(e), f = B(e);
            a.sampleTable.sampleToChunk.push({
              startSampleIndex: -1,
              startChunkIndex: u,
              samplesPerChunk: d,
              sampleDescriptionIndex: f
            });
          }
          let c = 0;
          for (let l = 0; l < a.sampleTable.sampleToChunk.length; l++)
            if (a.sampleTable.sampleToChunk[l].startSampleIndex = c, l < a.sampleTable.sampleToChunk.length - 1) {
              const d = a.sampleTable.sampleToChunk[l + 1].startChunkIndex - a.sampleTable.sampleToChunk[l].startChunkIndex;
              c += d * a.sampleTable.sampleToChunk[l].samplesPerChunk;
            }
        }
        break;
      case "stco":
        {
          const a = this.currentTrack;
          if (!a || !a.sampleTable)
            break;
          e.skip(4);
          const o = B(e);
          for (let c = 0; c < o; c++) {
            const l = B(e);
            a.sampleTable.chunkOffsets.push(l);
          }
        }
        break;
      case "co64":
        {
          const a = this.currentTrack;
          if (!a || !a.sampleTable)
            break;
          e.skip(4);
          const o = B(e);
          for (let c = 0; c < o; c++) {
            const l = ze(e);
            a.sampleTable.chunkOffsets.push(l);
          }
        }
        break;
      case "mvex":
        this.isFragmented = !0, this.readContiguousBoxes(e.slice(s, i.contentSize));
        break;
      case "mehd":
        {
          const a = U(e);
          e.skip(3);
          const o = a === 1 ? ze(e) : B(e);
          this.movieDurationInTimescale = o;
        }
        break;
      case "trex":
        {
          e.skip(4);
          const a = B(e), o = B(e), c = B(e), l = B(e), u = B(e);
          this.fragmentTrackDefaults.push({
            trackId: a,
            defaultSampleDescriptionIndex: o,
            defaultSampleDuration: c,
            defaultSampleSize: l,
            defaultSampleFlags: u
          });
        }
        break;
      case "tfra":
        {
          const a = U(e);
          e.skip(3);
          const o = B(e), c = this.tracks.find((b) => b.id === o);
          if (!c)
            break;
          const l = B(e), u = (l & 48) >> 4, d = (l & 12) >> 2, f = l & 3, h = [U, ue, at, B], g = h[u], m = h[d], w = h[f], y = B(e);
          for (let b = 0; b < y; b++) {
            const k = a === 1 ? ze(e) : B(e), S = a === 1 ? ze(e) : B(e);
            g(e), m(e), w(e), c.fragmentLookupTable.push({
              timestamp: k,
              moofOffset: S
            });
          }
          c.fragmentLookupTable.sort((b, k) => b.timestamp - k.timestamp);
          for (let b = 0; b < c.fragmentLookupTable.length - 1; b++) {
            const k = c.fragmentLookupTable[b], S = c.fragmentLookupTable[b + 1];
            k.timestamp === S.timestamp && (c.fragmentLookupTable.splice(b + 1, 1), b--);
          }
        }
        break;
      case "moof":
        this.currentFragment = {
          moofOffset: t,
          moofSize: i.totalSize,
          implicitBaseDataOffset: t,
          trackData: /* @__PURE__ */ new Map(),
          psshBoxes: []
        }, this.readContiguousBoxes(e.slice(s, i.contentSize)), this.lastReadFragment = this.currentFragment, this.currentFragment = null;
        break;
      case "traf":
        if (p(this.currentFragment), this.readContiguousBoxes(e.slice(s, i.contentSize)), this.currentTrack) {
          const a = this.currentFragment.trackData.get(this.currentTrack.id);
          e: if (a) {
            if (a.samples.length === 0) {
              this.currentFragment.trackData.delete(this.currentTrack.id);
              break e;
            }
            a.presentationTimestamps = a.samples.map((u, d) => ({ presentationTimestamp: u.presentationTimestamp, sampleIndex: d })).sort((u, d) => u.presentationTimestamp - d.presentationTimestamp);
            for (let u = 0; u < a.presentationTimestamps.length; u++) {
              const d = a.presentationTimestamps[u], f = a.samples[d.sampleIndex];
              if (a.firstKeyFrameTimestamp === null && f.isKeyFrame && (a.firstKeyFrameTimestamp = f.presentationTimestamp), u < a.presentationTimestamps.length - 1) {
                const g = a.presentationTimestamps[u + 1].presentationTimestamp - d.presentationTimestamp;
                f.duration = g;
              }
            }
            const o = a.samples[a.presentationTimestamps[0].sampleIndex], c = a.samples[ne(a.presentationTimestamps).sampleIndex];
            a.startTimestamp = o.presentationTimestamp, a.endTimestamp = c.presentationTimestamp + c.duration;
            const { currentFragmentState: l } = this.currentTrack;
            p(l), l.startTimestamp !== null && (ys(a, l.startTimestamp), a.startTimestampIsFinal = !0), l.encryptionAuxInfo && !a.samples[0].encryption && (a.encryptionAuxInfo = l.encryptionAuxInfo);
          }
          this.currentTrack.currentFragmentState = null, this.currentTrack = null;
        }
        break;
      case "pssh":
        {
          if (this.input._formatOptions.isobmff?._suppressPsshParsing)
            break;
          const a = Zo(N(e, i.contentSize));
          this.currentFragment ? this.currentFragment.psshBoxes.push(a) : this.currentTrack || this.psshBoxes.push(a);
        }
        break;
      case "tfhd":
        {
          p(this.currentFragment), e.skip(1);
          const a = at(e), o = !!(a & 1), c = !!(a & 2), l = !!(a & 8), u = !!(a & 16), d = !!(a & 32), f = !!(a & 65536), h = !!(a & 131072), g = B(e), m = this.tracks.find((y) => y.id === g);
          if (!m)
            break;
          const w = this.fragmentTrackDefaults.find((y) => y.trackId === g);
          this.currentTrack = m, m.currentFragmentState = {
            baseDataOffset: this.currentFragment.implicitBaseDataOffset,
            sampleDescriptionIndex: w?.defaultSampleDescriptionIndex ?? null,
            defaultSampleDuration: w?.defaultSampleDuration ?? null,
            defaultSampleSize: w?.defaultSampleSize ?? null,
            defaultSampleFlags: w?.defaultSampleFlags ?? null,
            startTimestamp: null,
            encryptionAuxInfo: null
          }, o ? m.currentFragmentState.baseDataOffset = ze(e) : h && (m.currentFragmentState.baseDataOffset = this.currentFragment.moofOffset), c && (m.currentFragmentState.sampleDescriptionIndex = B(e)), l && (m.currentFragmentState.defaultSampleDuration = B(e)), u && (m.currentFragmentState.defaultSampleSize = B(e)), d && (m.currentFragmentState.defaultSampleFlags = B(e)), f && (m.currentFragmentState.defaultSampleDuration = 0);
        }
        break;
      case "tfdt":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(a.currentFragmentState);
          const o = U(e);
          e.skip(3);
          const c = o === 0 ? B(e) : ze(e);
          a.currentFragmentState.startTimestamp = c;
        }
        break;
      case "trun":
        {
          const a = this.currentTrack;
          if (!a)
            break;
          p(this.currentFragment), p(a.currentFragmentState);
          const o = U(e), c = at(e), l = !!(c & 1), u = !!(c & 4), d = !!(c & 256), f = !!(c & 512), h = !!(c & 1024), g = !!(c & 2048), m = B(e);
          let w = null;
          l && (w = Lt(e));
          let y = null;
          u && (y = B(e));
          let b;
          this.currentFragment.trackData.has(a.id) ? (b = this.currentFragment.trackData.get(a.id), w !== null && (b.currentOffset = a.currentFragmentState.baseDataOffset + w)) : (b = {
            track: a,
            currentTimestamp: 0,
            currentOffset: a.currentFragmentState.baseDataOffset + (w ?? 0),
            startTimestamp: 0,
            endTimestamp: 0,
            firstKeyFrameTimestamp: null,
            samples: [],
            presentationTimestamps: [],
            startTimestampIsFinal: !1,
            encryptionAuxInfo: null
          }, this.currentFragment.trackData.set(a.id, b));
          for (let k = 0; k < m; k++) {
            let S;
            d ? S = B(e) : (p(a.currentFragmentState.defaultSampleDuration !== null), S = a.currentFragmentState.defaultSampleDuration);
            let T;
            f ? T = B(e) : (p(a.currentFragmentState.defaultSampleSize !== null), T = a.currentFragmentState.defaultSampleSize);
            let A;
            h ? A = B(e) : (p(a.currentFragmentState.defaultSampleFlags !== null), A = a.currentFragmentState.defaultSampleFlags), k === 0 && y !== null && (A = y);
            let C = 0;
            g && (o === 0 ? C = B(e) : C = Lt(e));
            const _ = !(A & 65536);
            b.samples.push({
              presentationTimestamp: b.currentTimestamp + C,
              duration: S,
              byteOffset: b.currentOffset,
              byteSize: T,
              isKeyFrame: _,
              encryption: null
            }), b.currentOffset += T, b.currentTimestamp += S;
          }
          this.currentFragment.implicitBaseDataOffset = b.currentOffset;
        }
        break;
      case "saiz":
        {
          const a = this.currentTrack;
          if (!a || !a.encryptionInfo)
            break;
          if (e.skip(1), at(e) & 1) {
            const f = oe(e, 4), h = B(e);
            if (f !== a.encryptionInfo.scheme || h !== 0)
              break;
          }
          const c = U(e), l = B(e);
          let u = null;
          c === 0 && l > 0 && (u = N(e, l));
          const d = ma(a);
          d.defaultSampleInfoSize = c, d.sampleSizes = u, d.sampleCount = l;
        }
        break;
      case "saio":
        {
          const a = this.currentTrack;
          if (!a || !a.encryptionInfo)
            break;
          const o = U(e);
          if (at(e) & 1) {
            const f = oe(e, 4), h = B(e);
            if (f !== a.encryptionInfo.scheme || h !== 0)
              break;
          }
          const l = B(e);
          if (l === 0)
            break;
          l > 1 && D._warn("Multiple saio entries are not supported; using the first offset only.");
          let u = o === 0 ? B(e) : Number(ze(e));
          this.currentFragment && (u += this.currentFragment.moofOffset);
          const d = ma(a);
          d.offset = u;
        }
        break;
      case "senc":
        {
          const a = this.currentTrack;
          if (!a || !a.encryptionInfo)
            break;
          p(this.currentFragment);
          const o = this.currentFragment.trackData.get(a.id);
          if (!o)
            break;
          e.skip(1);
          const l = !!(at(e) & 2), u = B(e), d = a.encryptionInfo.defaultPerSampleIvSize;
          p(d !== null);
          for (let f = 0; f < Math.min(u, o.samples.length); f++) {
            const h = new Uint8Array(16);
            d > 0 ? h.set(N(e, d), 0) : h.set(a.encryptionInfo.defaultConstantIv, 0);
            let g = null;
            if (l) {
              const w = ue(e);
              g = [];
              for (let y = 0; y < w; y++) {
                const b = ue(e), k = B(e);
                g.push({ clearLen: b, protectedLen: k });
              }
            }
            const m = o.samples[f];
            m.encryption = { iv: h, subsamples: g };
          }
        }
        break;
      // Metadata section
      // https://exiftool.org/TagNames/QuickTime.html
      // https://mp4workshop.com/about
      case "udta":
        {
          const a = this.iterateContiguousBoxes(e.slice(s, i.contentSize));
          for (const { boxInfo: o, slice: c } of a) {
            if (o.name !== "meta" && !this.currentTrack) {
              const l = c.filePos;
              this.metadataTags.raw ??= {}, o.name[0] === "©" ? this.metadataTags.raw[o.name] ??= Xe(c) : this.metadataTags.raw[o.name] ??= N(c, o.contentSize), c.filePos = l;
            }
            switch (o.name) {
              case "meta":
                c.skip(-o.headerSize), this.traverseBox(c);
                break;
              case "©nam":
              case "name":
                this.currentTrack ? this.currentTrack.name = ve.decode(N(c, o.contentSize)) : this.metadataTags.title ??= Xe(c);
                break;
              case "©des":
                this.currentTrack || (this.metadataTags.description ??= Xe(c));
                break;
              case "©ART":
                this.currentTrack || (this.metadataTags.artist ??= Xe(c));
                break;
              case "©alb":
                this.currentTrack || (this.metadataTags.album ??= Xe(c));
                break;
              case "albr":
                this.currentTrack || (this.metadataTags.albumArtist ??= Xe(c));
                break;
              case "©gen":
                this.currentTrack || (this.metadataTags.genre ??= Xe(c));
                break;
              case "©day":
                if (!this.currentTrack) {
                  const l = new Date(Xe(c));
                  Number.isNaN(l.getTime()) || (this.metadataTags.date ??= l);
                }
                break;
              case "©cmt":
                this.currentTrack || (this.metadataTags.comment ??= Xe(c));
                break;
              case "©lyr":
                this.currentTrack || (this.metadataTags.lyrics ??= Xe(c));
                break;
            }
          }
        }
        break;
      case "meta":
        {
          if (this.currentTrack)
            break;
          const o = B(e) !== 0;
          this.currentMetadataKeys = /* @__PURE__ */ new Map(), o ? this.readContiguousBoxes(e.slice(s, i.contentSize)) : this.readContiguousBoxes(e.slice(s + 4, i.contentSize - 4)), this.currentMetadataKeys = null;
        }
        break;
      case "keys":
        {
          if (!this.currentMetadataKeys)
            break;
          e.skip(4);
          const a = B(e);
          for (let o = 0; o < a; o++) {
            const c = B(e);
            e.skip(4);
            const l = ve.decode(N(e, c - 8));
            this.currentMetadataKeys.set(o + 1, l);
          }
        }
        break;
      case "ilst":
        {
          if (!this.currentMetadataKeys)
            break;
          const a = this.iterateContiguousBoxes(e.slice(s, i.contentSize));
          for (const { boxInfo: o, slice: c } of a) {
            let l = o.name;
            const u = (l.charCodeAt(0) << 24) + (l.charCodeAt(1) << 16) + (l.charCodeAt(2) << 8) + l.charCodeAt(3);
            this.currentMetadataKeys.has(u) && (l = this.currentMetadataKeys.get(u));
            const d = Tu(c);
            switch (this.metadataTags.raw ??= {}, this.metadataTags.raw[l] ??= d, l) {
              case "©nam":
              case "titl":
              case "com.apple.quicktime.title":
              case "title":
                typeof d == "string" && (this.metadataTags.title ??= d);
                break;
              case "©des":
              case "desc":
              case "dscp":
              case "com.apple.quicktime.description":
              case "description":
                typeof d == "string" && (this.metadataTags.description ??= d);
                break;
              case "©ART":
              case "com.apple.quicktime.artist":
              case "artist":
                typeof d == "string" && (this.metadataTags.artist ??= d);
                break;
              case "©alb":
              case "albm":
              case "com.apple.quicktime.album":
              case "album":
                typeof d == "string" && (this.metadataTags.album ??= d);
                break;
              case "aART":
              case "album_artist":
                typeof d == "string" && (this.metadataTags.albumArtist ??= d);
                break;
              case "©cmt":
              case "com.apple.quicktime.comment":
              case "comment":
                typeof d == "string" && (this.metadataTags.comment ??= d);
                break;
              case "©gen":
              case "gnre":
              case "com.apple.quicktime.genre":
              case "genre":
                typeof d == "string" && (this.metadataTags.genre ??= d);
                break;
              case "©lyr":
              case "lyrics":
                typeof d == "string" && (this.metadataTags.lyrics ??= d);
                break;
              case "©day":
              case "rldt":
              case "com.apple.quicktime.creationdate":
              case "date":
                if (typeof d == "string") {
                  const f = new Date(d);
                  Number.isNaN(f.getTime()) || (this.metadataTags.date ??= f);
                }
                break;
              case "covr":
              case "com.apple.quicktime.artwork":
                d instanceof hi ? (this.metadataTags.images ??= [], this.metadataTags.images.push({
                  data: d.data,
                  kind: "coverFront",
                  mimeType: d.mimeType
                })) : d instanceof Uint8Array && (this.metadataTags.images ??= [], this.metadataTags.images.push({
                  data: d,
                  kind: "coverFront",
                  mimeType: "image/*"
                }));
                break;
              case "track":
                if (typeof d == "string") {
                  const f = d.split("/"), h = Number.parseInt(f[0], 10), g = f[1] && Number.parseInt(f[1], 10);
                  Number.isInteger(h) && h > 0 && (this.metadataTags.trackNumber ??= h), g && Number.isInteger(g) && g > 0 && (this.metadataTags.tracksTotal ??= g);
                }
                break;
              case "trkn":
                if (d instanceof Uint8Array && d.length >= 6) {
                  const f = q(d), h = f.getUint16(2, !1), g = f.getUint16(4, !1);
                  h > 0 && (this.metadataTags.trackNumber ??= h), g > 0 && (this.metadataTags.tracksTotal ??= g);
                }
                break;
              case "disc":
              case "disk":
                if (d instanceof Uint8Array && d.length >= 6) {
                  const f = q(d), h = f.getUint16(2, !1), g = f.getUint16(4, !1);
                  h > 0 && (this.metadataTags.discNumber ??= h), g > 0 && (this.metadataTags.discsTotal ??= g);
                }
                break;
            }
          }
        }
        break;
    }
    return e.filePos = n, !0;
  }
}
class rc {
  constructor(e) {
    this.internalTrack = e, this.packetToSampleIndex = /* @__PURE__ */ new WeakMap(), this.packetToFragmentLocation = /* @__PURE__ */ new WeakMap();
  }
  getId() {
    return this.internalTrack.id;
  }
  getNumber() {
    const e = this.internalTrack.demuxer, t = this.internalTrack.trackBacking.getType();
    let i = 0;
    for (const s of e.tracks)
      if (s.trackBacking.getType() === t && i++, s === this.internalTrack)
        break;
    return i;
  }
  getCodec() {
    throw new Error("Not implemented on base class.");
  }
  getInternalCodecId() {
    return this.internalTrack.internalCodecId;
  }
  getName() {
    return this.internalTrack.name;
  }
  getLanguageCode() {
    return this.internalTrack.languageCode;
  }
  getTimeResolution() {
    return this.internalTrack.timescale;
  }
  isRelativeToUnixEpoch() {
    return !1;
  }
  getUnixTimeForTimestamp() {
    return null;
  }
  getDisposition() {
    return this.internalTrack.disposition;
  }
  getPairingMask() {
    return 1n;
  }
  getBitrate() {
    return null;
  }
  getAverageBitrate() {
    return null;
  }
  async getDurationFromMetadata() {
    const e = this.internalTrack;
    return e.durationInMediaTimescale <= 0 ? null : (p(e.trackBacking), ((await e.trackBacking.getFirstPacket({ metadataOnly: !0 }))?.timestamp ?? 0) + e.durationInMediaTimescale / e.timescale);
  }
  async getLiveRefreshInterval() {
    return null;
  }
  async getFirstPacket(e) {
    const t = await this.fetchPacketForSampleIndex(0, e);
    return t || !this.internalTrack.demuxer.isFragmented ? t : this.performFragmentedLookup(
      null,
      (i) => i.trackData.get(this.internalTrack.id) ? {
        sampleIndex: 0,
        correctSampleFound: !0
      } : {
        sampleIndex: -1,
        correctSampleFound: !1
      },
      -1 / 0,
      // Use -Infinity as a search timestamp to avoid using the lookup entries
      1 / 0,
      e
    );
  }
  mapTimestampIntoTimescale(e) {
    return ji(e * this.internalTrack.timescale) + this.internalTrack.editListOffset;
  }
  async getPacket(e, t) {
    const i = this.mapTimestampIntoTimescale(e), s = this.internalTrack.demuxer.getSampleTableForTrack(this.internalTrack), n = Xs(s, i), a = await this.fetchPacketForSampleIndex(n, t);
    return !ha(s) || !this.internalTrack.demuxer.isFragmented ? a : this.performFragmentedLookup(null, (o) => {
      const c = o.trackData.get(this.internalTrack.id);
      if (!c)
        return { sampleIndex: -1, correctSampleFound: !1 };
      const l = $(c.presentationTimestamps, i, (f) => f.presentationTimestamp), u = l !== -1 ? c.presentationTimestamps[l].sampleIndex : -1, d = l !== -1 && i < c.endTimestamp;
      return { sampleIndex: u, correctSampleFound: d };
    }, i, i, t);
  }
  async getNextPacket(e, t) {
    const i = this.packetToSampleIndex.get(e);
    if (i !== void 0)
      return this.fetchPacketForSampleIndex(i + 1, t);
    const s = this.packetToFragmentLocation.get(e);
    if (s === void 0)
      throw new Error("Packet was not created from this track.");
    return this.performFragmentedLookup(
      s.fragment,
      (n) => {
        if (n === s.fragment) {
          const a = n.trackData.get(this.internalTrack.id);
          if (s.sampleIndex + 1 < a.samples.length)
            return {
              sampleIndex: s.sampleIndex + 1,
              correctSampleFound: !0
            };
        } else if (n.trackData.get(this.internalTrack.id))
          return {
            sampleIndex: 0,
            correctSampleFound: !0
          };
        return {
          sampleIndex: -1,
          correctSampleFound: !1
        };
      },
      -1 / 0,
      // Use -Infinity as a search timestamp to avoid using the lookup entries
      1 / 0,
      t
    );
  }
  async getKeyPacket(e, t) {
    const i = this.mapTimestampIntoTimescale(e), s = this.internalTrack.demuxer.getSampleTableForTrack(this.internalTrack), n = xu(s, i), a = await this.fetchPacketForSampleIndex(n, t);
    return !ha(s) || !this.internalTrack.demuxer.isFragmented ? a : this.performFragmentedLookup(null, (o) => {
      const c = o.trackData.get(this.internalTrack.id);
      if (!c)
        return { sampleIndex: -1, correctSampleFound: !1 };
      const l = jr(c.presentationTimestamps, (f) => c.samples[f.sampleIndex].isKeyFrame && f.presentationTimestamp <= i), u = l !== -1 ? c.presentationTimestamps[l].sampleIndex : -1, d = l !== -1 && i < c.endTimestamp;
      return { sampleIndex: u, correctSampleFound: d };
    }, i, i, t);
  }
  async getNextKeyPacket(e, t) {
    const i = this.packetToSampleIndex.get(e);
    if (i !== void 0) {
      const n = this.internalTrack.demuxer.getSampleTableForTrack(this.internalTrack), a = Cu(n, i);
      return this.fetchPacketForSampleIndex(a, t);
    }
    const s = this.packetToFragmentLocation.get(e);
    if (s === void 0)
      throw new Error("Packet was not created from this track.");
    return this.performFragmentedLookup(
      s.fragment,
      (n) => {
        if (n === s.fragment) {
          const o = n.trackData.get(this.internalTrack.id).samples.findIndex((c, l) => c.isKeyFrame && l > s.sampleIndex);
          if (o !== -1)
            return {
              sampleIndex: o,
              correctSampleFound: !0
            };
        } else {
          const a = n.trackData.get(this.internalTrack.id);
          if (a && a.firstKeyFrameTimestamp !== null) {
            const o = a.samples.findIndex((c) => c.isKeyFrame);
            return p(o !== -1), {
              sampleIndex: o,
              correctSampleFound: !0
            };
          }
        }
        return {
          sampleIndex: -1,
          correctSampleFound: !1
        };
      },
      -1 / 0,
      // Use -Infinity as a search timestamp to avoid using the lookup entries
      1 / 0,
      t
    );
  }
  async fetchPacketForSampleIndex(e, t) {
    if (e === -1)
      return null;
    const i = this.internalTrack.demuxer.getSampleTableForTrack(this.internalTrack), s = Pu(i, e);
    if (!s)
      return null;
    let n;
    if (t.metadataOnly)
      n = Re;
    else {
      let l = this.internalTrack.demuxer.reader.requestSlice(s.sampleOffset, s.sampleSize);
      if (l instanceof Promise && (l = await l), !l)
        return null;
      if (n = N(l, s.sampleSize), this.internalTrack.encryptionAuxInfo) {
        p(this.internalTrack.encryptionInfo);
        const u = await sc(this.internalTrack.demuxer.reader, this.internalTrack.encryptionInfo, this.internalTrack.encryptionAuxInfo);
        e < u.length && (n = await pa(this.internalTrack, u[e], n, null));
      }
    }
    const a = (s.presentationTimestamp - this.internalTrack.editListOffset) / this.internalTrack.timescale, o = s.duration / this.internalTrack.timescale, c = new Z(n, s.isKeyFrame ? "key" : "delta", a, o, e, s.sampleSize);
    return this.packetToSampleIndex.set(c, e), c;
  }
  async fetchPacketInFragment(e, t, i) {
    if (t === -1)
      return null;
    const n = e.trackData.get(this.internalTrack.id).samples[t];
    p(n);
    let a;
    if (i.metadataOnly)
      a = Re;
    else {
      let u = this.internalTrack.demuxer.reader.requestSlice(n.byteOffset, n.byteSize);
      if (u instanceof Promise && (u = await u), !u)
        return null;
      a = N(u, n.byteSize), n.encryption && (a = await pa(this.internalTrack, n.encryption, a, e));
    }
    const o = (n.presentationTimestamp - this.internalTrack.editListOffset) / this.internalTrack.timescale, c = n.duration / this.internalTrack.timescale, l = new Z(a, n.isKeyFrame ? "key" : "delta", o, c, e.moofOffset + t, n.byteSize);
    return this.packetToFragmentLocation.set(l, { fragment: e, sampleIndex: t }), l;
  }
  /** Looks for a packet in the fragments while trying to load as few fragments as possible to retrieve it. */
  async performFragmentedLookup(e, t, i, s, n) {
    const a = this.internalTrack.demuxer;
    let o = null, c = null, l = -1;
    if (e) {
      const { sampleIndex: w, correctSampleFound: y } = t(e);
      if (y)
        return this.fetchPacketInFragment(e, w, n);
      w !== -1 && (c = e, l = w);
    }
    const u = $(this.internalTrack.fragmentLookupTable, i, (w) => w.timestamp), d = u !== -1 ? this.internalTrack.fragmentLookupTable[u] : null, f = $(this.internalTrack.fragmentPositionCache, i, (w) => w.startTimestamp), h = f !== -1 ? this.internalTrack.fragmentPositionCache[f] : null, g = Math.max(d?.moofOffset ?? 0, h?.moofOffset ?? 0) || null;
    let m;
    for (e ? g === null || e.moofOffset >= g ? (m = e.moofOffset + e.moofSize, o = e) : m = g : m = g ?? 0; ; ) {
      if (o) {
        const k = o.trackData.get(this.internalTrack.id);
        if (k && k.startTimestamp > s)
          break;
      }
      let w = a.reader.requestSliceRange(m, ut, Vt);
      if (w instanceof Promise && (w = await w), !w)
        break;
      const y = m, b = xt(w);
      if (!b)
        break;
      if (b.name === "moof") {
        o = await a.readFragment(y);
        const { sampleIndex: k, correctSampleFound: S } = t(o);
        if (S)
          return this.fetchPacketInFragment(o, k, n);
        k !== -1 && (c = o, l = k);
      }
      m = y + b.totalSize;
    }
    if (d && (!c || c.moofOffset < d.moofOffset)) {
      const w = this.internalTrack.fragmentLookupTable[u - 1];
      p(!w || w.timestamp < d.timestamp);
      const y = w?.timestamp ?? -1 / 0;
      return this.performFragmentedLookup(null, t, y, s, n);
    }
    return c ? this.fetchPacketInFragment(c, l, n) : null;
  }
}
class da extends rc {
  constructor(e) {
    super(e), this.decoderConfigPromise = null, this.internalTrack = e;
  }
  getType() {
    return "video";
  }
  getCodec() {
    return this.internalTrack.info.codec;
  }
  getCodedWidth() {
    return this.internalTrack.info.width;
  }
  getCodedHeight() {
    return this.internalTrack.info.height;
  }
  getSquarePixelWidth() {
    return this.internalTrack.info.squarePixelWidth;
  }
  getSquarePixelHeight() {
    return this.internalTrack.info.squarePixelHeight;
  }
  getRotation() {
    return this.internalTrack.rotation;
  }
  async getColorSpace() {
    return {
      primaries: this.internalTrack.info.colorSpace?.primaries,
      transfer: this.internalTrack.info.colorSpace?.transfer,
      matrix: this.internalTrack.info.colorSpace?.matrix,
      fullRange: this.internalTrack.info.colorSpace?.fullRange
    };
  }
  async canBeTransparent() {
    return this.internalTrack.info.codec === "prores" && (this.internalTrack.info.proresFormat === "ap4h" || this.internalTrack.info.proresFormat === "ap4x");
  }
  async getDecoderConfig() {
    return this.internalTrack.info.codec ? this.decoderConfigPromise ??= (async () => {
      if (this.internalTrack.info.codec === "vp9" && !this.internalTrack.info.vp9CodecInfo) {
        const t = await this.getFirstPacket({});
        this.internalTrack.info.vp9CodecInfo = t && Lo(t.data);
      } else if (this.internalTrack.info.codec === "av1" && !this.internalTrack.info.av1CodecInfo) {
        const t = await this.getFirstPacket({});
        this.internalTrack.info.av1CodecInfo = t && Ho(t.data);
      }
      const e = {
        codec: Pn(this.internalTrack.info),
        codedWidth: this.internalTrack.info.width,
        codedHeight: this.internalTrack.info.height,
        description: this.internalTrack.info.codecDescription ?? void 0,
        colorSpace: this.internalTrack.info.colorSpace ?? void 0
      };
      return (this.internalTrack.info.width !== this.internalTrack.info.squarePixelWidth || this.internalTrack.info.height !== this.internalTrack.info.squarePixelHeight) && (e.displayAspectWidth = this.internalTrack.info.squarePixelWidth, e.displayAspectHeight = this.internalTrack.info.squarePixelHeight), e;
    })() : null;
  }
}
class fa extends rc {
  constructor(e) {
    super(e), this.decoderConfig = null, this.internalTrack = e;
  }
  getType() {
    return "audio";
  }
  getCodec() {
    return this.internalTrack.info.codec;
  }
  getNumberOfChannels() {
    return this.internalTrack.info.numberOfChannels;
  }
  getSampleRate() {
    return this.internalTrack.info.sampleRate;
  }
  async getDecoderConfig() {
    return this.internalTrack.info.codec ? this.decoderConfig ??= {
      codec: Cn(this.internalTrack.info),
      numberOfChannels: this.internalTrack.info.numberOfChannels,
      sampleRate: this.internalTrack.info.sampleRate,
      description: this.internalTrack.info.codecDescription ?? void 0
    } : null;
  }
}
const Xs = (r, e) => {
  if (r.presentationTimestamps) {
    const t = $(r.presentationTimestamps, e, (i) => i.presentationTimestamp);
    return t === -1 ? -1 : r.presentationTimestamps[t].sampleIndex;
  } else {
    const t = $(r.sampleTimingEntries, e, (s) => s.startDecodeTimestamp);
    if (t === -1)
      return -1;
    const i = r.sampleTimingEntries[t];
    return i.startIndex + Math.min(Math.floor((e - i.startDecodeTimestamp) / i.delta), i.count - 1);
  }
}, xu = (r, e) => {
  if (!r.keySampleIndices)
    return Xs(r, e);
  if (r.presentationTimestamps) {
    const t = $(r.presentationTimestamps, e, (i) => i.presentationTimestamp);
    if (t === -1)
      return -1;
    for (let i = t; i >= 0; i--) {
      const s = r.presentationTimestamps[i].sampleIndex;
      if (ar(r.keySampleIndices, s, (a) => a) !== -1)
        return s;
    }
    return -1;
  } else {
    const t = Xs(r, e), i = $(r.keySampleIndices, t, (s) => s);
    return r.keySampleIndices[i] ?? -1;
  }
}, Pu = (r, e) => {
  const t = $(r.sampleTimingEntries, e, (y) => y.startIndex), i = r.sampleTimingEntries[t];
  if (!i || i.startIndex + i.count <= e)
    return null;
  let n = i.startDecodeTimestamp + (e - i.startIndex) * i.delta;
  const a = $(r.sampleCompositionTimeOffsets, e, (y) => y.startIndex), o = r.sampleCompositionTimeOffsets[a];
  o && e - o.startIndex < o.count && (n += o.offset);
  const c = r.sampleSizes[Math.min(e, r.sampleSizes.length - 1)], l = $(r.sampleToChunk, e, (y) => y.startSampleIndex), u = r.sampleToChunk[l];
  p(u);
  const d = u.startChunkIndex + Math.floor((e - u.startSampleIndex) / u.samplesPerChunk), f = r.chunkOffsets[d], h = u.startSampleIndex + (d - u.startChunkIndex) * u.samplesPerChunk;
  let g = 0, m = f;
  if (r.sampleSizes.length === 1)
    m += c * (e - h), g += c * u.samplesPerChunk;
  else
    for (let y = h; y < h + u.samplesPerChunk; y++) {
      const b = r.sampleSizes[y];
      y < e && (m += b), g += b;
    }
  let w = i.delta;
  if (r.presentationTimestamps) {
    const y = r.presentationTimestampIndexMap[e];
    p(y !== void 0), y < r.presentationTimestamps.length - 1 && (w = r.presentationTimestamps[y + 1].presentationTimestamp - n);
  }
  return {
    presentationTimestamp: n,
    duration: w,
    sampleOffset: m,
    sampleSize: c,
    chunkOffset: f,
    chunkSize: g,
    isKeyFrame: r.keySampleIndices ? ar(r.keySampleIndices, e, (y) => y) !== -1 : !0
  };
}, Cu = (r, e) => {
  if (!r.keySampleIndices)
    return e + 1;
  const t = $(r.keySampleIndices, e, (i) => i);
  return r.keySampleIndices[t + 1] ?? -1;
}, ys = (r, e) => {
  r.startTimestamp += e, r.endTimestamp += e;
  for (const t of r.samples)
    t.presentationTimestamp += e;
  for (const t of r.presentationTimestamps)
    t.presentationTimestamp += e;
}, _u = (r) => {
  const [e, t] = r, i = Math.atan2(t, e);
  return Number.isFinite(i) ? i * (180 / Math.PI) : 0;
}, ha = (r) => r.sampleSizes.length === 0, ma = (r) => r.currentFragmentState ? r.currentFragmentState.encryptionAuxInfo ??= {
  defaultSampleInfoSize: 0,
  sampleSizes: null,
  sampleCount: 0,
  offset: null,
  resolved: null
} : r.encryptionAuxInfo ??= {
  defaultSampleInfoSize: 0,
  sampleSizes: null,
  sampleCount: 0,
  offset: null,
  resolved: null
}, sc = async (r, e, t) => {
  if (t.resolved)
    return t.resolved;
  if (t.offset === null || t.sampleCount === 0)
    throw new Error("Incomplete saiz/saio info; cannot resolve encryption data.");
  let i = 0;
  if (t.defaultSampleInfoSize > 0)
    i = t.defaultSampleInfoSize * t.sampleCount;
  else {
    p(t.sampleSizes);
    for (let o = 0; o < t.sampleCount; o++)
      i += t.sampleSizes[o];
  }
  let s = r.requestSlice(t.offset, i);
  if (s instanceof Promise && (s = await s), !s)
    throw new Error("Failed to read auxiliary encryption info.");
  const n = e.defaultPerSampleIvSize;
  p(n !== null);
  const a = [];
  for (let o = 0; o < t.sampleCount; o++) {
    const c = t.defaultSampleInfoSize > 0 ? t.defaultSampleInfoSize : t.sampleSizes[o], l = new Uint8Array(16);
    n > 0 ? l.set(N(s, n), 0) : l.set(e.defaultConstantIv, 0);
    let u = null;
    if (c > n) {
      const d = ue(s);
      u = [];
      for (let f = 0; f < d; f++) {
        const h = ue(s), g = B(s);
        u.push({ clearLen: h, protectedLen: g });
      }
    }
    a.push({ iv: l, subsamples: u });
  }
  return t.resolved = a, a;
}, pa = async (r, e, t, i) => {
  p(r.encryptionInfo);
  const s = r.encryptionInfo;
  p(s.defaultKid !== null);
  const n = s.defaultKid;
  let a;
  const o = r.demuxer.decryptionKeyCache.get(n);
  if (o)
    a = await o;
  else {
    if (!r.demuxer.input._formatOptions.isobmff?.resolveKeyId)
      throw new Error("Encrypted media samples encountered. To decrypt them, please provide a callback for InputOptions.formatOptions.isobmff.resolveKeyId.");
    const c = (async () => {
      let l = r.demuxer.psshBoxes;
      if (i) {
        l = [
          ...l,
          ...i.psshBoxes
        ].filter((d) => d.keyIds === null || d.keyIds.includes(n));
        for (let d = 0; d < l.length - 1; d++)
          for (let f = d + 1; f < l.length; f++)
            Jo(l[d], l[f]) && (l.splice(f, 1), f--);
      }
      const u = await r.demuxer.input._formatOptions.isobmff.resolveKeyId({ keyId: n, psshBoxes: l });
      if (!(typeof u == "string" && u.length === 32 && xl.test(u) || u instanceof Uint8Array && u.byteLength === 16))
        throw new TypeError("resolveKeyId must return a 32-character hex string or a 16-byte Uint8Array containing the decryption key.");
      return u instanceof Uint8Array ? u : Pl(u);
    })();
    r.demuxer.decryptionKeyCache.set(n, c), a = await c;
  }
  return s.scheme === "cenc" || s.scheme === "cens" ? Iu(a, s, e, t) : Eu(a, s, e, t);
}, Iu = async (r, e, t, i) => {
  const s = new Uint8Array(16);
  s.set(t.iv, 0);
  const n = await crypto.subtle.importKey("raw", r, { name: "AES-CTR" }, !1, ["decrypt"]), a = async (g) => {
    const m = await crypto.subtle.decrypt({ name: "AES-CTR", counter: s, length: 64 }, n, g);
    return new Uint8Array(m);
  };
  if (!t.subsamples)
    return a(i);
  p(e.defaultCryptByteBlock !== null && e.defaultSkipByteBlock !== null);
  const o = nc(t.subsamples, e.defaultCryptByteBlock, e.defaultSkipByteBlock);
  let c = 0;
  for (const g of o)
    for (const m of g.perSubsample)
      c += m.length;
  const l = new Uint8Array(c);
  let u = 0;
  for (const g of o)
    for (const m of g.perSubsample)
      l.set(i.subarray(m.offset, m.offset + m.length), u), u += m.length;
  const d = await a(l), f = new Uint8Array(i);
  let h = 0;
  for (const g of o)
    for (const m of g.perSubsample)
      f.set(d.subarray(h, h + m.length), m.offset), h += m.length;
  return f;
}, Eu = (r, e, t, i) => {
  const s = new ic();
  s.init({ key: r, iv: t.iv });
  const n = e.defaultCryptByteBlock, a = e.defaultSkipByteBlock;
  if (p(n !== null && a !== null), !t.subsamples) {
    const u = new Uint8Array(i), d = Math.floor(i.length / 16);
    for (let f = 0; f < d; f++) {
      const h = f * 16;
      s.in.set(i.subarray(h, h + 16)), s.decrypt(), u.set(s.out, h);
    }
    return u;
  }
  if (n === 0 && a === 0)
    throw new Error("cbcs with subsamples requires pattern encryption.");
  const o = new Uint8Array(i), c = nc(t.subsamples, n, a), l = new DataView(t.iv.buffer, t.iv.byteOffset, 16);
  for (const u of c) {
    s.iv[0] = l.getUint32(0, !1), s.iv[1] = l.getUint32(4, !1), s.iv[2] = l.getUint32(8, !1), s.iv[3] = l.getUint32(12, !1);
    for (const d of u.perSubsample) {
      const f = d.length / 16;
      for (let h = 0; h < f; h++) {
        const g = d.offset + h * 16;
        s.in.set(i.subarray(g, g + 16)), s.decrypt(), o.set(s.out, g);
      }
    }
  }
  return o;
}, nc = (r, e, t) => {
  const i = [], s = e !== 0 || t !== 0;
  let n = 0;
  for (const a of r) {
    n += a.clearLen;
    const o = [];
    if (!s)
      a.protectedLen > 0 && o.push({ offset: n, length: a.protectedLen }), n += a.protectedLen;
    else {
      let c = a.protectedLen, l = n;
      for (; c > 0 && !(c < 16 * e); ) {
        const u = 16 * e;
        o.push({ offset: l, length: u }), l += u, c -= u;
        const d = Math.min(16 * t, c);
        l += d, c -= d;
      }
      n += a.protectedLen;
    }
    i.push({ perSubsample: o });
  }
  return i;
};
class Ys {
  constructor(e) {
    this.value = e;
  }
}
class Zs {
  constructor(e) {
    this.value = e;
  }
}
class ac {
  constructor(e) {
    this.value = e;
  }
}
class St {
  constructor(e) {
    this.value = e;
  }
}
var P;
(function(r) {
  r[r.EBML = 440786851] = "EBML", r[r.EBMLVersion = 17030] = "EBMLVersion", r[r.EBMLReadVersion = 17143] = "EBMLReadVersion", r[r.EBMLMaxIDLength = 17138] = "EBMLMaxIDLength", r[r.EBMLMaxSizeLength = 17139] = "EBMLMaxSizeLength", r[r.DocType = 17026] = "DocType", r[r.DocTypeVersion = 17031] = "DocTypeVersion", r[r.DocTypeReadVersion = 17029] = "DocTypeReadVersion", r[r.Void = 236] = "Void", r[r.Segment = 408125543] = "Segment", r[r.SeekHead = 290298740] = "SeekHead", r[r.Seek = 19899] = "Seek", r[r.SeekID = 21419] = "SeekID", r[r.SeekPosition = 21420] = "SeekPosition", r[r.Duration = 17545] = "Duration", r[r.Info = 357149030] = "Info", r[r.TimestampScale = 2807729] = "TimestampScale", r[r.MuxingApp = 19840] = "MuxingApp", r[r.WritingApp = 22337] = "WritingApp", r[r.Tracks = 374648427] = "Tracks", r[r.TrackEntry = 174] = "TrackEntry", r[r.TrackNumber = 215] = "TrackNumber", r[r.TrackUID = 29637] = "TrackUID", r[r.TrackType = 131] = "TrackType", r[r.FlagEnabled = 185] = "FlagEnabled", r[r.FlagDefault = 136] = "FlagDefault", r[r.FlagForced = 21930] = "FlagForced", r[r.FlagOriginal = 21934] = "FlagOriginal", r[r.FlagHearingImpaired = 21931] = "FlagHearingImpaired", r[r.FlagVisualImpaired = 21932] = "FlagVisualImpaired", r[r.FlagCommentary = 21935] = "FlagCommentary", r[r.FlagLacing = 156] = "FlagLacing", r[r.Name = 21358] = "Name", r[r.Language = 2274716] = "Language", r[r.LanguageBCP47 = 2274717] = "LanguageBCP47", r[r.CodecID = 134] = "CodecID", r[r.CodecPrivate = 25506] = "CodecPrivate", r[r.CodecDelay = 22186] = "CodecDelay", r[r.SeekPreRoll = 22203] = "SeekPreRoll", r[r.DefaultDuration = 2352003] = "DefaultDuration", r[r.Video = 224] = "Video", r[r.PixelWidth = 176] = "PixelWidth", r[r.PixelHeight = 186] = "PixelHeight", r[r.DisplayWidth = 21680] = "DisplayWidth", r[r.DisplayHeight = 21690] = "DisplayHeight", r[r.DisplayUnit = 21682] = "DisplayUnit", r[r.AlphaMode = 21440] = "AlphaMode", r[r.Audio = 225] = "Audio", r[r.SamplingFrequency = 181] = "SamplingFrequency", r[r.Channels = 159] = "Channels", r[r.BitDepth = 25188] = "BitDepth", r[r.SimpleBlock = 163] = "SimpleBlock", r[r.BlockGroup = 160] = "BlockGroup", r[r.Block = 161] = "Block", r[r.BlockAdditions = 30113] = "BlockAdditions", r[r.BlockMore = 166] = "BlockMore", r[r.BlockAdditional = 165] = "BlockAdditional", r[r.BlockAddID = 238] = "BlockAddID", r[r.BlockDuration = 155] = "BlockDuration", r[r.ReferenceBlock = 251] = "ReferenceBlock", r[r.Cluster = 524531317] = "Cluster", r[r.Timestamp = 231] = "Timestamp", r[r.Cues = 475249515] = "Cues", r[r.CuePoint = 187] = "CuePoint", r[r.CueTime = 179] = "CueTime", r[r.CueTrackPositions = 183] = "CueTrackPositions", r[r.CueTrack = 247] = "CueTrack", r[r.CueClusterPosition = 241] = "CueClusterPosition", r[r.Colour = 21936] = "Colour", r[r.MatrixCoefficients = 21937] = "MatrixCoefficients", r[r.TransferCharacteristics = 21946] = "TransferCharacteristics", r[r.Primaries = 21947] = "Primaries", r[r.Range = 21945] = "Range", r[r.Projection = 30320] = "Projection", r[r.ProjectionType = 30321] = "ProjectionType", r[r.ProjectionPoseRoll = 30325] = "ProjectionPoseRoll", r[r.Attachments = 423732329] = "Attachments", r[r.AttachedFile = 24999] = "AttachedFile", r[r.FileDescription = 18046] = "FileDescription", r[r.FileName = 18030] = "FileName", r[r.FileMediaType = 18016] = "FileMediaType", r[r.FileData = 18012] = "FileData", r[r.FileUID = 18094] = "FileUID", r[r.Chapters = 272869232] = "Chapters", r[r.Tags = 307544935] = "Tags", r[r.Tag = 29555] = "Tag", r[r.Targets = 25536] = "Targets", r[r.TargetTypeValue = 26826] = "TargetTypeValue", r[r.TargetType = 25546] = "TargetType", r[r.TagTrackUID = 25541] = "TagTrackUID", r[r.TagEditionUID = 25545] = "TagEditionUID", r[r.TagChapterUID = 25540] = "TagChapterUID", r[r.TagAttachmentUID = 25542] = "TagAttachmentUID", r[r.SimpleTag = 26568] = "SimpleTag", r[r.TagName = 17827] = "TagName", r[r.TagLanguage = 17530] = "TagLanguage", r[r.TagString = 17543] = "TagString", r[r.TagBinary = 17541] = "TagBinary", r[r.ContentEncodings = 28032] = "ContentEncodings", r[r.ContentEncoding = 25152] = "ContentEncoding", r[r.ContentEncodingOrder = 20529] = "ContentEncodingOrder", r[r.ContentEncodingScope = 20530] = "ContentEncodingScope", r[r.ContentCompression = 20532] = "ContentCompression", r[r.ContentCompAlgo = 16980] = "ContentCompAlgo", r[r.ContentCompSettings = 16981] = "ContentCompSettings", r[r.ContentEncryption = 20533] = "ContentEncryption";
})(P || (P = {}));
const vu = [
  P.EBML,
  P.Segment
], Zi = [
  P.SeekHead,
  P.Info,
  P.Cluster,
  P.Tracks,
  P.Cues,
  P.Attachments,
  P.Chapters,
  P.Tags
], xr = [
  ...vu,
  ...Zi
], ga = (r) => r < 256 ? 1 : r < 65536 ? 2 : r < 1 << 24 ? 3 : r < 2 ** 32 ? 4 : r < 2 ** 40 ? 5 : 6, wa = (r) => r < 1n << 8n ? 1 : r < 1n << 16n ? 2 : r < 1n << 24n ? 3 : r < 1n << 32n ? 4 : r < 1n << 40n ? 5 : r < 1n << 48n ? 6 : r < 1n << 56n ? 7 : 8, ya = (r) => r >= -64 && r < 64 ? 1 : r >= -8192 && r < 8192 ? 2 : r >= -1048576 && r < 1 << 20 ? 3 : r >= -134217728 && r < 1 << 27 ? 4 : r >= -17179869184 && r < 2 ** 34 ? 5 : 6, Fu = (r) => {
  if (r < 127)
    return 1;
  if (r < 16383)
    return 2;
  if (r < (1 << 21) - 1)
    return 3;
  if (r < (1 << 28) - 1)
    return 4;
  if (r < 2 ** 35 - 1)
    return 5;
  if (r < 2 ** 42 - 1)
    return 6;
  throw new Error("EBML varint size not supported " + r);
};
class Bu {
  constructor(e) {
    this.writer = e, this.helper = new Uint8Array(8), this.helperView = new DataView(this.helper.buffer), this.offsets = /* @__PURE__ */ new WeakMap(), this.dataOffsets = /* @__PURE__ */ new WeakMap();
  }
  writeByte(e) {
    this.helperView.setUint8(0, e), this.writer.write(this.helper.subarray(0, 1));
  }
  writeFloat32(e) {
    this.helperView.setFloat32(0, e, !1), this.writer.write(this.helper.subarray(0, 4));
  }
  writeFloat64(e) {
    this.helperView.setFloat64(0, e, !1), this.writer.write(this.helper);
  }
  writeUnsignedInt(e, t = ga(e)) {
    let i = 0;
    switch (t) {
      case 6:
        this.helperView.setUint8(i++, e / 2 ** 40 | 0);
      // eslint-disable-next-line no-fallthrough
      case 5:
        this.helperView.setUint8(i++, e / 2 ** 32 | 0);
      // eslint-disable-next-line no-fallthrough
      case 4:
        this.helperView.setUint8(i++, e >> 24);
      // eslint-disable-next-line no-fallthrough
      case 3:
        this.helperView.setUint8(i++, e >> 16);
      // eslint-disable-next-line no-fallthrough
      case 2:
        this.helperView.setUint8(i++, e >> 8);
      // eslint-disable-next-line no-fallthrough
      case 1:
        this.helperView.setUint8(i++, e);
        break;
      default:
        throw new Error("Bad unsigned int size " + t);
    }
    this.writer.write(this.helper.subarray(0, i));
  }
  writeUnsignedBigInt(e, t = wa(e)) {
    let i = 0;
    for (let s = t - 1; s >= 0; s--)
      this.helperView.setUint8(i++, Number(e >> BigInt(s * 8) & 0xffn));
    this.writer.write(this.helper.subarray(0, i));
  }
  writeSignedInt(e, t = ya(e)) {
    e < 0 && (e += 2 ** (t * 8)), this.writeUnsignedInt(e, t);
  }
  writeVarInt(e, t = Fu(e)) {
    let i = 0;
    switch (t) {
      case 1:
        this.helperView.setUint8(i++, 128 | e);
        break;
      case 2:
        this.helperView.setUint8(i++, 64 | e >> 8), this.helperView.setUint8(i++, e);
        break;
      case 3:
        this.helperView.setUint8(i++, 32 | e >> 16), this.helperView.setUint8(i++, e >> 8), this.helperView.setUint8(i++, e);
        break;
      case 4:
        this.helperView.setUint8(i++, 16 | e >> 24), this.helperView.setUint8(i++, e >> 16), this.helperView.setUint8(i++, e >> 8), this.helperView.setUint8(i++, e);
        break;
      case 5:
        this.helperView.setUint8(i++, 8 | e / 2 ** 32 & 7), this.helperView.setUint8(i++, e >> 24), this.helperView.setUint8(i++, e >> 16), this.helperView.setUint8(i++, e >> 8), this.helperView.setUint8(i++, e);
        break;
      case 6:
        this.helperView.setUint8(i++, 4 | e / 2 ** 40 & 3), this.helperView.setUint8(i++, e / 2 ** 32 | 0), this.helperView.setUint8(i++, e >> 24), this.helperView.setUint8(i++, e >> 16), this.helperView.setUint8(i++, e >> 8), this.helperView.setUint8(i++, e);
        break;
      default:
        throw new Error("Bad EBML varint size " + t);
    }
    this.writer.write(this.helper.subarray(0, i));
  }
  writeAsciiString(e) {
    this.writer.write(new Uint8Array(e.split("").map((t) => t.charCodeAt(0))));
  }
  writeEBML(e) {
    if (e !== null)
      if (e instanceof Uint8Array)
        this.writer.write(e);
      else if (Array.isArray(e))
        for (const t of e)
          this.writeEBML(t);
      else if (this.offsets.set(e, this.writer.getPos()), this.writeUnsignedInt(e.id), Array.isArray(e.data)) {
        const t = this.writer.getPos(), i = e.size === -1 ? 1 : e.size ?? 4;
        e.size === -1 ? this.writeByte(255) : this.writer.seek(this.writer.getPos() + i);
        const s = this.writer.getPos();
        if (this.dataOffsets.set(e, s), this.writeEBML(e.data), e.size !== -1) {
          const n = this.writer.getPos() - s, a = this.writer.getPos();
          this.writer.seek(t), this.writeVarInt(n, i), this.writer.seek(a);
        }
      } else if (typeof e.data == "number") {
        const t = e.size ?? ga(e.data);
        this.writeVarInt(t), this.writeUnsignedInt(e.data, t);
      } else if (typeof e.data == "bigint") {
        const t = e.size ?? wa(e.data);
        this.writeVarInt(t), this.writeUnsignedBigInt(e.data, t);
      } else if (typeof e.data == "string")
        this.writeVarInt(e.data.length), this.writeAsciiString(e.data);
      else if (e.data instanceof Uint8Array)
        this.writeVarInt(e.data.byteLength, e.size), this.writer.write(e.data);
      else if (e.data instanceof Ys)
        this.writeVarInt(4), this.writeFloat32(e.data.value);
      else if (e.data instanceof Zs)
        this.writeVarInt(8), this.writeFloat64(e.data.value);
      else if (e.data instanceof ac) {
        const t = e.size ?? ya(e.data.value);
        this.writeVarInt(t), this.writeSignedInt(e.data.value, t);
      } else if (e.data instanceof St) {
        const t = Y.encode(e.data.value);
        this.writeVarInt(t.length), this.writer.write(t);
      } else
        pe(e.data);
  }
}
const Js = 8, De = 2, dt = 2 * Js, oc = (r) => {
  if (r.remainingLength < 1)
    return null;
  const e = U(r);
  if (r.skip(-1), e === 0)
    return null;
  let t = 1, i = 128;
  for (; (e & i) === 0; )
    t++, i >>= 1;
  return r.remainingLength < t ? null : t;
}, Ni = (r) => {
  if (r.remainingLength < 1)
    return null;
  const e = U(r);
  if (e === 0)
    return null;
  let t = 1, i = 128;
  for (; (e & i) === 0; )
    t++, i >>= 1;
  if (r.remainingLength < t - 1)
    return null;
  let s = e & i - 1;
  for (let n = 1; n < t; n++)
    s *= 256, s += U(r);
  return s;
}, K = (r, e) => {
  if (e < 1 || e > 8)
    throw new Error("Bad unsigned int size " + e);
  let t = 0;
  for (let i = 0; i < e; i++)
    t *= 256, t += U(r);
  return t;
}, Ru = (r, e) => {
  if (e < 1)
    throw new Error("Bad unsigned int size " + e);
  let t = 0n;
  for (let i = 0; i < e; i++)
    t <<= 8n, t += BigInt(U(r));
  return t;
}, zn = (r) => {
  const e = oc(r);
  return e === null || r.remainingLength < e ? null : K(r, e);
}, cc = (r) => {
  if (r.remainingLength < 1)
    return null;
  if (U(r) === 255)
    return;
  r.skip(-1);
  const t = Ni(r);
  if (t === null)
    return null;
  if (t !== 72057594037927940)
    return t;
}, ct = (r) => {
  p(r.remainingLength >= De);
  const e = zn(r);
  if (e === null)
    return null;
  const t = cc(r);
  return t === null ? null : { id: e, size: t };
}, oi = (r, e) => {
  const t = N(r, e);
  let i = 0;
  for (; i < e && t[i] !== 0; )
    i += 1;
  return String.fromCharCode(...t.subarray(0, i));
}, _i = (r, e) => {
  const t = N(r, e);
  let i = 0;
  for (; i < e && t[i] !== 0; )
    i += 1;
  return ve.decode(t.subarray(0, i));
}, bs = (r, e) => {
  if (e === 0)
    return 0;
  if (e !== 4 && e !== 8)
    throw new Error("Bad float size " + e);
  return e === 4 ? hf(r) : tl(r);
}, en = async (r, e, t, i) => {
  const s = new Set(t);
  let n = e;
  for (; i === null || n < i; ) {
    let a = r.requestSliceRange(n, De, dt);
    if (a instanceof Promise && (a = await a), !a)
      break;
    const o = ct(a);
    if (!o)
      break;
    if (s.has(o.id))
      return { pos: n, found: !0 };
    At(o.size), n = a.filePos + o.size;
  }
  return { pos: i !== null && i > n ? i : n, found: !1 };
}, lc = async (r, e, t, i) => {
  const n = new Set(t);
  let a = e;
  for (; a < i; ) {
    let o = r.requestSliceRange(a, 0, Math.min(65536, i - a));
    if (o instanceof Promise && (o = await o), !o || o.length < Js)
      break;
    for (let c = 0; c < o.length - Js; c++) {
      o.filePos = a;
      const l = zn(o);
      if (l !== null && n.has(l))
        return a;
      a++;
    }
  }
  return null;
}, Ee = {
  avc: "V_MPEG4/ISO/AVC",
  hevc: "V_MPEGH/ISO/HEVC",
  vp8: "V_VP8",
  vp9: "V_VP9",
  av1: "V_AV1",
  prores: "V_PRORES",
  aac: "A_AAC",
  mp3: "A_MPEG/L3",
  opus: "A_OPUS",
  vorbis: "A_VORBIS",
  flac: "A_FLAC",
  ac3: "A_AC3",
  eac3: "A_EAC3",
  "pcm-u8": "A_PCM/INT/LIT",
  "pcm-s16": "A_PCM/INT/LIT",
  "pcm-s16be": "A_PCM/INT/BIG",
  "pcm-s24": "A_PCM/INT/LIT",
  "pcm-s24be": "A_PCM/INT/BIG",
  "pcm-s32": "A_PCM/INT/LIT",
  "pcm-s32be": "A_PCM/INT/BIG",
  "pcm-f32": "A_PCM/FLOAT/IEEE",
  "pcm-f64": "A_PCM/FLOAT/IEEE",
  webvtt: "S_TEXT/WEBVTT"
};
function At(r) {
  if (r === void 0)
    throw new Error("Undefined element size is used in a place where it is not supported.");
}
const uc = (r) => {
  let t = (r.hasVideo ? "video/" : r.hasAudio ? "audio/" : "application/") + (r.isWebM ? "webm" : "x-matroska");
  if (r.codecStrings.length > 0) {
    const i = [...new Set(r.codecStrings.filter(Boolean))];
    t += `; codecs="${i.join(", ")}"`;
  }
  return t;
};
var ot;
(function(r) {
  r[r.None = 0] = "None", r[r.Xiph = 1] = "Xiph", r[r.FixedSize = 2] = "FixedSize", r[r.Ebml = 3] = "Ebml";
})(ot || (ot = {}));
var Or;
(function(r) {
  r[r.Block = 1] = "Block", r[r.Private = 2] = "Private", r[r.Next = 4] = "Next";
})(Or || (Or = {}));
var Wi;
(function(r) {
  r[r.Zlib = 0] = "Zlib", r[r.Bzlib = 1] = "Bzlib", r[r.lzo1x = 2] = "lzo1x", r[r.HeaderStripping = 3] = "HeaderStripping";
})(Wi || (Wi = {}));
const ks = [
  { id: P.SeekHead, flag: "seekHeadSeen" },
  { id: P.Info, flag: "infoSeen" },
  { id: P.Tracks, flag: "tracksSeen" },
  { id: P.Cues, flag: "cuesSeen" }
], dc = 10 * 2 ** 20;
class Mu extends bt {
  constructor(e) {
    super(e), this.readMetadataPromise = null, this.segments = [], this.currentSegment = null, this.currentTrack = null, this.currentCluster = null, this.currentBlock = null, this.currentBlockAdditional = null, this.currentCueTime = null, this.currentDecodingInstruction = null, this.currentTagTargetIsMovie = !0, this.currentSimpleTagName = null, this.currentAttachedFile = null, this.isWebM = !1, this.reader = e._reader;
  }
  async getTrackBackings() {
    return await this.readMetadata(), this.segments.flatMap((e) => e.tracks.map((t) => t.trackBacking));
  }
  async getMimeType() {
    await this.readMetadata();
    const e = await this.getTrackBackings(), t = await Promise.all(e.map((i) => i.getDecoderConfig().then((s) => s?.codec ?? null)));
    return uc({
      isWebM: this.isWebM,
      hasVideo: this.segments.some((i) => i.tracks.some((s) => s.info?.type === "video")),
      hasAudio: this.segments.some((i) => i.tracks.some((s) => s.info?.type === "audio")),
      codecStrings: t.filter(Boolean)
    });
  }
  async getMetadataTags() {
    await this.readMetadata();
    for (const t of this.segments)
      t.metadataTagsCollected || (this.reader.fileSize !== null && await this.loadSegmentMetadata(t), t.metadataTagsCollected = !0);
    let e = {};
    for (const t of this.segments)
      e = { ...e, ...t.metadataTags };
    return e;
  }
  readMetadata() {
    return this.readMetadataPromise ??= (async () => {
      let e = 0;
      for (; ; ) {
        let t = this.reader.requestSliceRange(e, De, dt);
        if (t instanceof Promise && (t = await t), !t)
          break;
        const i = ct(t);
        if (!i)
          break;
        const s = i.id;
        let n = i.size;
        const a = t.filePos;
        if (s === P.EBML) {
          At(n);
          let o = this.reader.requestSlice(a, n);
          if (o instanceof Promise && (o = await o), !o)
            break;
          this.readContiguousElements(o);
        } else if (s === P.Segment) {
          if (await this.readSegment(a, n), n === void 0 || this.reader.fileSize === null)
            break;
        } else if (s === P.Cluster) {
          if (this.reader.fileSize === null)
            break;
          n === void 0 && (n = (await en(this.reader, a, xr, this.reader.fileSize)).pos - a);
          const o = ne(this.segments);
          o && (o.elementEndPos = a + n);
        }
        At(n), e = a + n;
      }
    })();
  }
  async readSegment(e, t) {
    this.currentSegment = {
      seekHeadSeen: !1,
      infoSeen: !1,
      tracksSeen: !1,
      cuesSeen: !1,
      tagsSeen: !1,
      attachmentsSeen: !1,
      timestampScale: -1,
      timestampFactor: -1,
      duration: -1,
      seekEntries: [],
      tracks: [],
      cuePoints: [],
      dataStartPos: e,
      elementEndPos: t === void 0 ? null : e + t,
      clusterSeekStartPos: e,
      lastReadCluster: null,
      metadataTags: {},
      metadataTagsCollected: !1
    }, this.segments.push(this.currentSegment);
    let i = e;
    for (; this.currentSegment.elementEndPos === null || i < this.currentSegment.elementEndPos; ) {
      let o = this.reader.requestSliceRange(i, De, dt);
      if (o instanceof Promise && (o = await o), !o)
        break;
      const c = i, l = ct(o);
      if (!l || !Zi.includes(l.id) && l.id !== P.Void) {
        const g = await lc(this.reader, c, Zi, Math.min(this.currentSegment.elementEndPos ?? 1 / 0, c + dc));
        if (g) {
          i = g;
          continue;
        } else
          break;
      }
      const { id: u, size: d } = l, f = o.filePos, h = ks.findIndex((g) => g.id === u);
      if (h !== -1) {
        const g = ks[h].flag;
        this.currentSegment[g] = !0, At(d);
        let m = this.reader.requestSlice(f, d);
        m instanceof Promise && (m = await m), m && this.readContiguousElements(m);
      } else if (u === P.Tags || u === P.Attachments) {
        u === P.Tags ? this.currentSegment.tagsSeen = !0 : this.currentSegment.attachmentsSeen = !0, At(d);
        let g = this.reader.requestSlice(f, d);
        g instanceof Promise && (g = await g), g && this.readContiguousElements(g);
      } else if (u === P.Cluster) {
        this.currentSegment.clusterSeekStartPos = c;
        break;
      }
      if (d === void 0)
        break;
      i = f + d;
    }
    if (this.currentSegment.seekEntries.sort((o, c) => o.segmentPosition - c.segmentPosition), this.reader.fileSize !== null)
      for (const o of this.currentSegment.seekEntries) {
        const c = ks.find((g) => g.id === o.id);
        if (!c || this.currentSegment[c.flag])
          continue;
        let l = this.reader.requestSliceRange(e + o.segmentPosition, De, dt);
        if (l instanceof Promise && (l = await l), !l)
          continue;
        const u = ct(l);
        if (!u)
          continue;
        const { id: d, size: f } = u;
        if (d !== c.id)
          continue;
        At(f), this.currentSegment[c.flag] = !0;
        let h = this.reader.requestSlice(l.filePos, f);
        h instanceof Promise && (h = await h), h && this.readContiguousElements(h);
      }
    this.currentSegment.timestampScale === -1 && (this.currentSegment.timestampScale = 1e6, this.currentSegment.timestampFactor = 1e9 / 1e6);
    for (const o of this.currentSegment.tracks)
      o.defaultDurationNs !== null && (o.defaultDuration = this.currentSegment.timestampFactor * o.defaultDurationNs / 1e9);
    const s = new Map(this.currentSegment.tracks.map((o) => [o.id, o]));
    for (const o of this.currentSegment.cuePoints) {
      const c = s.get(o.trackId);
      c && c.cuePoints.push(o);
    }
    for (const o of this.currentSegment.tracks) {
      o.cuePoints.sort((c, l) => c.time - l.time);
      for (let c = 0; c < o.cuePoints.length - 1; c++) {
        const l = o.cuePoints[c], u = o.cuePoints[c + 1];
        l.time === u.time && (o.cuePoints.splice(c + 1, 1), c--);
      }
    }
    let n = null, a = -1 / 0;
    for (const o of this.currentSegment.tracks)
      o.cuePoints.length > a && (a = o.cuePoints.length, n = o);
    for (const o of this.currentSegment.tracks)
      o.cuePoints.length === 0 && (o.cuePoints = n.cuePoints);
    this.currentSegment = null;
  }
  async readCluster(e, t) {
    if (t.lastReadCluster?.elementStartPos === e)
      return t.lastReadCluster;
    let i = this.reader.requestSliceRange(e, De, dt);
    i instanceof Promise && (i = await i), p(i);
    const s = e, n = ct(i);
    p(n);
    const a = n.id;
    p(a === P.Cluster);
    let o = n.size;
    const c = i.filePos;
    o === void 0 && (o = (await en(this.reader, c, xr, t.elementEndPos)).pos - c);
    let l = this.reader.requestSlice(c, o);
    l instanceof Promise && (l = await l);
    const u = {
      segment: t,
      elementStartPos: s,
      elementEndPos: c + o,
      dataStartPos: c,
      timestamp: -1,
      trackData: /* @__PURE__ */ new Map()
    };
    if (this.currentCluster = u, l) {
      const d = this.readContiguousElements(l, xr);
      u.elementEndPos = d;
    }
    for (const [, d] of u.trackData) {
      const f = d.track;
      p(d.blocks.length > 0);
      let h = !1;
      for (let y = 0; y < d.blocks.length; y++) {
        const b = d.blocks[y];
        b.timestamp += u.timestamp, h ||= b.lacing !== ot.None;
      }
      d.presentationTimestamps = d.blocks.map((y, b) => ({ timestamp: y.timestamp, blockIndex: b })).sort((y, b) => y.timestamp - b.timestamp);
      for (let y = 0; y < d.presentationTimestamps.length; y++) {
        const b = d.presentationTimestamps[y], k = d.blocks[b.blockIndex];
        if (d.firstKeyFrameTimestamp === null && k.isKeyFrame && (d.firstKeyFrameTimestamp = k.timestamp), y < d.presentationTimestamps.length - 1) {
          const S = d.presentationTimestamps[y + 1];
          k.duration = S.timestamp - k.timestamp;
        } else k.duration === 0 && f.defaultDuration != null && k.lacing === ot.None && (k.duration = f.defaultDuration);
      }
      h && (this.expandLacedBlocks(d.blocks, f), d.presentationTimestamps = d.blocks.map((y, b) => ({ timestamp: y.timestamp, blockIndex: b })).sort((y, b) => y.timestamp - b.timestamp));
      const g = d.blocks[d.presentationTimestamps[0].blockIndex], m = d.blocks[ne(d.presentationTimestamps).blockIndex];
      d.startTimestamp = g.timestamp, d.endTimestamp = m.timestamp + m.duration;
      const w = $(f.clusterPositionCache, d.startTimestamp, (y) => y.startTimestamp);
      (w === -1 || f.clusterPositionCache[w].elementStartPos !== s) && f.clusterPositionCache.splice(w + 1, 0, {
        elementStartPos: u.elementStartPos,
        startTimestamp: d.startTimestamp
      });
    }
    return t.lastReadCluster = u, u;
  }
  getTrackDataInCluster(e, t) {
    let i = e.trackData.get(t);
    if (!i) {
      const s = e.segment.tracks.find((n) => n.id === t);
      if (!s)
        return null;
      i = {
        track: s,
        startTimestamp: 0,
        endTimestamp: 0,
        firstKeyFrameTimestamp: null,
        blocks: [],
        presentationTimestamps: []
      }, e.trackData.set(t, i);
    }
    return i;
  }
  expandLacedBlocks(e, t) {
    for (let i = 0; i < e.length; i++) {
      const s = e[i];
      if (s.lacing === ot.None)
        continue;
      s.decoded || (s.data = this.decodeBlockData(t, s.data), s.decoded = !0);
      const n = Ce.tempFromBytes(s.data), a = [], o = U(n) + 1;
      switch (s.lacing) {
        case ot.Xiph:
          {
            let l = 0;
            for (let u = 0; u < o - 1; u++) {
              let d = 0;
              for (; n.bufferPos < n.length; ) {
                const f = U(n);
                if (d += f, f < 255) {
                  a.push(d), l += d;
                  break;
                }
              }
            }
            a.push(n.length - (n.bufferPos + l));
          }
          break;
        case ot.FixedSize:
          {
            const l = n.length - 1, u = Math.floor(l / o);
            for (let d = 0; d < o; d++)
              a.push(u);
          }
          break;
        case ot.Ebml:
          {
            const l = Ni(n);
            p(l !== null);
            let u = l;
            a.push(u);
            let d = u;
            for (let f = 1; f < o - 1; f++) {
              const h = n.bufferPos, g = Ni(n);
              p(g !== null);
              const m = g, y = (1 << (n.bufferPos - h) * 7 - 1) - 1, b = m - y;
              u += b, a.push(u), d += u;
            }
            a.push(n.length - (n.bufferPos + d));
          }
          break;
        default:
          p(!1);
      }
      p(a.length === o), e.splice(i, 1);
      const c = s.duration || o * (t.defaultDuration ?? 0);
      for (let l = 0; l < o; l++) {
        const u = a[l], d = N(n, u), f = s.timestamp + c * l / o, h = c / o;
        e.splice(i + l, 0, {
          timestamp: f,
          duration: h,
          isKeyFrame: s.isKeyFrame,
          data: d,
          lacing: ot.None,
          decoded: !0,
          postProcessed: !1,
          mainAdditional: s.mainAdditional
        });
      }
      i += o, i--;
    }
  }
  async loadSegmentMetadata(e) {
    for (const t of e.seekEntries) {
      if (!(t.id === P.Tags && !e.tagsSeen)) {
        if (!(t.id === P.Attachments && !e.attachmentsSeen)) continue;
      }
      let i = this.reader.requestSliceRange(e.dataStartPos + t.segmentPosition, De, dt);
      if (i instanceof Promise && (i = await i), !i)
        continue;
      const s = ct(i);
      if (!s || s.id !== t.id)
        continue;
      const { size: n } = s;
      At(n), p(!this.currentSegment), this.currentSegment = e;
      let a = this.reader.requestSlice(i.filePos, n);
      a instanceof Promise && (a = await a), a && this.readContiguousElements(a), this.currentSegment = null, t.id === P.Tags ? e.tagsSeen = !0 : t.id === P.Attachments && (e.attachmentsSeen = !0);
    }
  }
  readContiguousElements(e, t) {
    for (; e.remainingLength >= De; ) {
      const i = e.filePos;
      if (!this.traverseElement(e, t))
        return i;
    }
    return e.filePos;
  }
  traverseElement(e, t) {
    const i = ct(e);
    if (!i || t && t.includes(i.id))
      return !1;
    const { id: s, size: n } = i, a = e.filePos;
    switch (At(n), s) {
      case P.DocType:
        this.isWebM = oi(e, n) === "webm";
        break;
      case P.Seek:
        {
          if (!this.currentSegment)
            break;
          const o = { id: -1, segmentPosition: -1 };
          this.currentSegment.seekEntries.push(o), this.readContiguousElements(e.slice(a, n)), (o.id === -1 || o.segmentPosition === -1) && this.currentSegment.seekEntries.pop();
        }
        break;
      case P.SeekID:
        {
          const o = this.currentSegment?.seekEntries[this.currentSegment.seekEntries.length - 1];
          if (!o)
            break;
          o.id = K(e, n);
        }
        break;
      case P.SeekPosition:
        {
          const o = this.currentSegment?.seekEntries[this.currentSegment.seekEntries.length - 1];
          if (!o)
            break;
          o.segmentPosition = K(e, n);
        }
        break;
      case P.TimestampScale:
        {
          if (!this.currentSegment)
            break;
          this.currentSegment.timestampScale = K(e, n), this.currentSegment.timestampFactor = 1e9 / this.currentSegment.timestampScale;
        }
        break;
      case P.Duration:
        {
          if (!this.currentSegment)
            break;
          this.currentSegment.duration = bs(e, n);
        }
        break;
      case P.TrackEntry:
        {
          if (!this.currentSegment || (this.currentTrack = {
            id: -1,
            segment: this.currentSegment,
            demuxer: this,
            clusterPositionCache: [],
            cuePoints: [],
            disposition: {
              ...yt,
              primary: !1
            },
            trackBacking: null,
            codecId: null,
            codecPrivate: null,
            defaultDuration: null,
            defaultDurationNs: null,
            name: null,
            languageCode: "eng",
            // The default in Matroska
            hasLanguageBcp47: !1,
            decodingInstructions: [],
            info: null
          }, this.readContiguousElements(e.slice(a, n)), !this.currentTrack))
            break;
          if (this.currentTrack.decodingInstructions.some((o) => o.data?.type !== "decompress" || o.scope !== Or.Block || o.data.algorithm !== Wi.HeaderStripping) && (D._warn(`Track #${this.currentTrack.id} has an unsupported content encoding; dropping.`), this.currentTrack = null), this.currentTrack && this.currentTrack.id !== -1 && this.currentTrack.codecId && this.currentTrack.info) {
            const o = this.currentTrack.codecId.indexOf("/"), c = o === -1 ? this.currentTrack.codecId : this.currentTrack.codecId.slice(0, o);
            if (this.currentTrack.info.type === "video" && this.currentTrack.info.width !== -1 && this.currentTrack.info.height !== -1) {
              if (this.currentTrack.info.squarePixelWidth = this.currentTrack.info.width, this.currentTrack.info.squarePixelHeight = this.currentTrack.info.height, this.currentTrack.info.displayWidth !== null && this.currentTrack.info.displayHeight !== null) {
                const u = this.currentTrack.info.displayWidth * this.currentTrack.info.height, d = this.currentTrack.info.displayHeight * this.currentTrack.info.width;
                u > 0 && d > 0 && (u > d ? this.currentTrack.info.squarePixelWidth = Math.round(this.currentTrack.info.width * u / d) : this.currentTrack.info.squarePixelHeight = Math.round(this.currentTrack.info.height * d / u));
              }
              if (this.currentTrack.codecId === Ee.avc)
                this.currentTrack.info.codec = "avc", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate;
              else if (this.currentTrack.codecId === Ee.hevc)
                this.currentTrack.info.codec = "hevc", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate;
              else if (c === Ee.vp8)
                this.currentTrack.info.codec = "vp8";
              else if (c === Ee.vp9)
                this.currentTrack.info.codec = "vp9";
              else if (c === Ee.av1)
                this.currentTrack.info.codec = "av1";
              else if (c === Ee.prores) {
                const u = this.currentTrack.codecPrivate ? ve.decode(this.currentTrack.codecPrivate) : "";
                jt.includes(u) && (this.currentTrack.info.codec = "prores", this.currentTrack.info.proresFormat = u);
              }
              const l = this.currentTrack;
              this.currentTrack.trackBacking = new zu(l), this.currentSegment.tracks.push(this.currentTrack);
            } else if (this.currentTrack.info.type === "audio") {
              c === Ee.aac ? (this.currentTrack.info.codec = "aac", this.currentTrack.info.aacCodecInfo = {
                isMpeg2: this.currentTrack.codecId.includes("MPEG2"),
                objectType: null
              }, this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate) : this.currentTrack.codecId === Ee.mp3 ? this.currentTrack.info.codec = "mp3" : c === Ee.opus ? (this.currentTrack.info.codec = "opus", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate, this.currentTrack.info.sampleRate = xi) : c === Ee.vorbis ? (this.currentTrack.info.codec = "vorbis", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate) : c === Ee.flac ? (this.currentTrack.info.codec = "flac", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate) : c === Ee.ac3 ? (this.currentTrack.info.codec = "ac3", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate) : c === Ee.eac3 ? (this.currentTrack.info.codec = "eac3", this.currentTrack.info.codecDescription = this.currentTrack.codecPrivate) : this.currentTrack.codecId === "A_PCM/INT/LIT" ? this.currentTrack.info.bitDepth === 8 ? this.currentTrack.info.codec = "pcm-u8" : this.currentTrack.info.bitDepth === 16 ? this.currentTrack.info.codec = "pcm-s16" : this.currentTrack.info.bitDepth === 24 ? this.currentTrack.info.codec = "pcm-s24" : this.currentTrack.info.bitDepth === 32 && (this.currentTrack.info.codec = "pcm-s32") : this.currentTrack.codecId === "A_PCM/INT/BIG" ? this.currentTrack.info.bitDepth === 8 ? this.currentTrack.info.codec = "pcm-u8" : this.currentTrack.info.bitDepth === 16 ? this.currentTrack.info.codec = "pcm-s16be" : this.currentTrack.info.bitDepth === 24 ? this.currentTrack.info.codec = "pcm-s24be" : this.currentTrack.info.bitDepth === 32 && (this.currentTrack.info.codec = "pcm-s32be") : this.currentTrack.codecId === "A_PCM/FLOAT/IEEE" && (this.currentTrack.info.bitDepth === 32 ? this.currentTrack.info.codec = "pcm-f32" : this.currentTrack.info.bitDepth === 64 && (this.currentTrack.info.codec = "pcm-f64"));
              const l = this.currentTrack;
              this.currentTrack.trackBacking = new Du(l), this.currentSegment.tracks.push(this.currentTrack);
            }
          }
          this.currentTrack = null;
        }
        break;
      case P.TrackNumber:
        {
          if (!this.currentTrack)
            break;
          this.currentTrack.id = K(e, n);
        }
        break;
      case P.TrackType:
        {
          if (!this.currentTrack)
            break;
          const o = K(e, n);
          o === 1 ? this.currentTrack.info = {
            type: "video",
            width: -1,
            height: -1,
            displayWidth: null,
            displayHeight: null,
            displayUnit: null,
            squarePixelWidth: -1,
            squarePixelHeight: -1,
            rotation: 0,
            codec: null,
            codecDescription: null,
            colorSpace: null,
            alphaMode: !1,
            proresFormat: null
          } : o === 2 && (this.currentTrack.info = {
            type: "audio",
            numberOfChannels: 1,
            // Default value
            sampleRate: 8e3,
            // Default value
            bitDepth: -1,
            codec: null,
            codecDescription: null,
            aacCodecInfo: null
          });
        }
        break;
      case P.FlagEnabled:
        {
          if (!this.currentTrack)
            break;
          K(e, n) || (this.currentTrack = null);
        }
        break;
      case P.FlagDefault:
        {
          if (!this.currentTrack)
            break;
          this.currentTrack.disposition.default = !!K(e, n);
        }
        break;
      case P.FlagForced:
        {
          if (!this.currentTrack)
            break;
          this.currentTrack.disposition.forced = !!K(e, n);
        }
        break;
      case P.FlagOriginal:
        {
          if (!this.currentTrack)
            break;
          this.currentTrack.disposition.original = !!K(e, n);
        }
        break;
      case P.FlagHearingImpaired:
        {
          if (!this.currentTrack)
            break;
          this.currentTrack.disposition.hearingImpaired = !!K(e, n);
        }
        break;
      case P.FlagVisualImpaired:
        {
          if (!this.currentTrack)
            break;
          this.currentTrack.disposition.visuallyImpaired = !!K(e, n);
        }
        break;
      case P.FlagCommentary:
        {
          if (!this.currentTrack)
            break;
          this.currentTrack.disposition.commentary = !!K(e, n);
        }
        break;
      case P.CodecID:
        {
          if (!this.currentTrack)
            break;
          this.currentTrack.codecId = oi(e, n);
        }
        break;
      case P.CodecPrivate:
        {
          if (!this.currentTrack)
            break;
          this.currentTrack.codecPrivate = N(e, n);
        }
        break;
      case P.DefaultDuration:
        {
          if (!this.currentTrack)
            break;
          this.currentTrack.defaultDurationNs = K(e, n);
        }
        break;
      case P.Name:
        {
          if (!this.currentTrack)
            break;
          this.currentTrack.name = _i(e, n);
        }
        break;
      case P.Language:
        {
          if (!this.currentTrack || this.currentTrack.hasLanguageBcp47)
            break;
          this.currentTrack.languageCode = oi(e, n), Ki(this.currentTrack.languageCode) || (this.currentTrack.languageCode = ke);
        }
        break;
      case P.LanguageBCP47:
        {
          if (!this.currentTrack)
            break;
          const c = oi(e, n).split("-")[0];
          c ? this.currentTrack.languageCode = c : this.currentTrack.languageCode = ke, this.currentTrack.hasLanguageBcp47 = !0;
        }
        break;
      case P.Video:
        {
          if (this.currentTrack?.info?.type !== "video")
            break;
          this.readContiguousElements(e.slice(a, n));
        }
        break;
      case P.PixelWidth:
        {
          if (this.currentTrack?.info?.type !== "video")
            break;
          this.currentTrack.info.width = K(e, n);
        }
        break;
      case P.PixelHeight:
        {
          if (this.currentTrack?.info?.type !== "video")
            break;
          this.currentTrack.info.height = K(e, n);
        }
        break;
      case P.DisplayWidth:
        {
          if (this.currentTrack?.info?.type !== "video")
            break;
          this.currentTrack.info.displayWidth = K(e, n);
        }
        break;
      case P.DisplayHeight:
        {
          if (this.currentTrack?.info?.type !== "video")
            break;
          this.currentTrack.info.displayHeight = K(e, n);
        }
        break;
      case P.DisplayUnit:
        {
          if (this.currentTrack?.info?.type !== "video")
            break;
          this.currentTrack.info.displayUnit = K(e, n);
        }
        break;
      case P.AlphaMode:
        {
          if (this.currentTrack?.info?.type !== "video")
            break;
          this.currentTrack.info.alphaMode = K(e, n) === 1;
        }
        break;
      case P.Colour:
        {
          if (this.currentTrack?.info?.type !== "video")
            break;
          this.currentTrack.info.colorSpace = {}, this.readContiguousElements(e.slice(a, n));
        }
        break;
      case P.MatrixCoefficients:
        {
          if (this.currentTrack?.info?.type !== "video" || !this.currentTrack.info.colorSpace)
            break;
          const o = K(e, n), c = Er[o] ?? null;
          this.currentTrack.info.colorSpace.matrix = c;
        }
        break;
      case P.Range:
        {
          if (this.currentTrack?.info?.type !== "video" || !this.currentTrack.info.colorSpace)
            break;
          this.currentTrack.info.colorSpace.fullRange = K(e, n) === 2;
        }
        break;
      case P.TransferCharacteristics:
        {
          if (this.currentTrack?.info?.type !== "video" || !this.currentTrack.info.colorSpace)
            break;
          const o = K(e, n), c = Ir[o] ?? null;
          this.currentTrack.info.colorSpace.transfer = c;
        }
        break;
      case P.Primaries:
        {
          if (this.currentTrack?.info?.type !== "video" || !this.currentTrack.info.colorSpace)
            break;
          const o = K(e, n), c = _r[o] ?? null;
          this.currentTrack.info.colorSpace.primaries = c;
        }
        break;
      case P.Projection:
        {
          if (this.currentTrack?.info?.type !== "video")
            break;
          this.readContiguousElements(e.slice(a, n));
        }
        break;
      case P.ProjectionPoseRoll:
        {
          if (this.currentTrack?.info?.type !== "video")
            break;
          const c = -bs(e, n);
          try {
            this.currentTrack.info.rotation = gi(c);
          } catch {
          }
        }
        break;
      case P.Audio:
        {
          if (this.currentTrack?.info?.type !== "audio")
            break;
          this.readContiguousElements(e.slice(a, n));
        }
        break;
      case P.SamplingFrequency:
        {
          if (this.currentTrack?.info?.type !== "audio")
            break;
          this.currentTrack.info.sampleRate = bs(e, n);
        }
        break;
      case P.Channels:
        {
          if (this.currentTrack?.info?.type !== "audio")
            break;
          this.currentTrack.info.numberOfChannels = K(e, n);
        }
        break;
      case P.BitDepth:
        {
          if (this.currentTrack?.info?.type !== "audio")
            break;
          this.currentTrack.info.bitDepth = K(e, n);
        }
        break;
      case P.CuePoint:
        {
          if (!this.currentSegment)
            break;
          this.readContiguousElements(e.slice(a, n)), this.currentCueTime = null;
        }
        break;
      case P.CueTime:
        this.currentCueTime = K(e, n);
        break;
      case P.CueTrackPositions:
        {
          if (this.currentCueTime === null)
            break;
          p(this.currentSegment);
          const o = { time: this.currentCueTime, trackId: -1, clusterPosition: -1 };
          this.currentSegment.cuePoints.push(o), this.readContiguousElements(e.slice(a, n)), (o.trackId === -1 || o.clusterPosition === -1) && this.currentSegment.cuePoints.pop();
        }
        break;
      case P.CueTrack:
        {
          const o = this.currentSegment?.cuePoints[this.currentSegment.cuePoints.length - 1];
          if (!o)
            break;
          o.trackId = K(e, n);
        }
        break;
      case P.CueClusterPosition:
        {
          const o = this.currentSegment?.cuePoints[this.currentSegment.cuePoints.length - 1];
          if (!o)
            break;
          p(this.currentSegment), o.clusterPosition = this.currentSegment.dataStartPos + K(e, n);
        }
        break;
      case P.Timestamp:
        {
          if (!this.currentCluster)
            break;
          this.currentCluster.timestamp = K(e, n);
        }
        break;
      case P.SimpleBlock:
        {
          if (!this.currentCluster)
            break;
          const o = Ni(e);
          if (o === null)
            break;
          const c = this.getTrackDataInCluster(this.currentCluster, o);
          if (!c)
            break;
          const l = mn(e), u = U(e), d = u >> 1 & 3;
          let f = !!(u & 128);
          c.track.info?.type === "audio" && c.track.info.codec && (f = !0);
          const h = N(e, n - (e.filePos - a)), g = c.track.decodingInstructions.length > 0;
          c.blocks.push({
            timestamp: l,
            // We'll add the cluster's timestamp to this later
            duration: 0,
            // Will set later
            isKeyFrame: f,
            data: h,
            lacing: d,
            decoded: !g,
            postProcessed: !1,
            mainAdditional: null
          });
        }
        break;
      case P.BlockGroup:
        {
          if (!this.currentCluster)
            break;
          this.readContiguousElements(e.slice(a, n)), this.currentBlock = null;
        }
        break;
      case P.Block:
        {
          if (!this.currentCluster)
            break;
          const o = Ni(e);
          if (o === null)
            break;
          const c = this.getTrackDataInCluster(this.currentCluster, o);
          if (!c)
            break;
          const l = mn(e), d = U(e) >> 1 & 3, f = N(e, n - (e.filePos - a)), h = c.track.decodingInstructions.length > 0;
          this.currentBlock = {
            timestamp: l,
            // We'll add the cluster's timestamp to this later
            duration: 0,
            // Will set later
            isKeyFrame: !0,
            data: f,
            lacing: d,
            decoded: !h,
            postProcessed: !1,
            mainAdditional: null
          }, c.blocks.push(this.currentBlock);
        }
        break;
      case P.BlockAdditions:
        this.readContiguousElements(e.slice(a, n));
        break;
      case P.BlockMore:
        {
          if (!this.currentBlock)
            break;
          this.currentBlockAdditional = {
            addId: 1,
            data: null
          }, this.readContiguousElements(e.slice(a, n)), this.currentBlockAdditional.data && this.currentBlockAdditional.addId === 1 && (this.currentBlock.mainAdditional = this.currentBlockAdditional.data), this.currentBlockAdditional = null;
        }
        break;
      case P.BlockAdditional:
        {
          if (!this.currentBlockAdditional)
            break;
          this.currentBlockAdditional.data = N(e, n);
        }
        break;
      case P.BlockAddID:
        {
          if (!this.currentBlockAdditional)
            break;
          this.currentBlockAdditional.addId = K(e, n);
        }
        break;
      case P.BlockDuration:
        {
          if (!this.currentBlock)
            break;
          this.currentBlock.duration = K(e, n);
        }
        break;
      case P.ReferenceBlock:
        {
          if (!this.currentBlock)
            break;
          this.currentBlock.isKeyFrame = !1;
        }
        break;
      case P.Tag:
        this.currentTagTargetIsMovie = !0, this.readContiguousElements(e.slice(a, n));
        break;
      case P.Targets:
        this.readContiguousElements(e.slice(a, n));
        break;
      case P.TargetTypeValue:
        K(e, n) !== 50 && (this.currentTagTargetIsMovie = !1);
        break;
      case P.TagTrackUID:
      case P.TagEditionUID:
      case P.TagChapterUID:
      case P.TagAttachmentUID:
        this.currentTagTargetIsMovie = !1;
        break;
      case P.SimpleTag:
        {
          if (!this.currentTagTargetIsMovie)
            break;
          this.currentSimpleTagName = null, this.readContiguousElements(e.slice(a, n));
        }
        break;
      case P.TagName:
        this.currentSimpleTagName = _i(e, n);
        break;
      case P.TagString:
        {
          if (!this.currentSimpleTagName)
            break;
          const o = _i(e, n);
          this.processTagValue(this.currentSimpleTagName, o);
        }
        break;
      case P.TagBinary:
        {
          if (!this.currentSimpleTagName)
            break;
          const o = N(e, n);
          this.processTagValue(this.currentSimpleTagName, o);
        }
        break;
      case P.AttachedFile:
        {
          if (!this.currentSegment)
            break;
          this.currentAttachedFile = {
            fileUid: null,
            fileName: null,
            fileMediaType: null,
            fileData: null,
            fileDescription: null
          }, this.readContiguousElements(e.slice(a, n));
          const o = this.currentSegment.metadataTags;
          if (this.currentAttachedFile.fileUid && this.currentAttachedFile.fileData && (o.raw ??= {}, o.raw[this.currentAttachedFile.fileUid.toString()] = new An(this.currentAttachedFile.fileData, this.currentAttachedFile.fileMediaType ?? void 0, this.currentAttachedFile.fileName ?? void 0, this.currentAttachedFile.fileDescription ?? void 0)), this.currentAttachedFile.fileMediaType?.startsWith("image/") && this.currentAttachedFile.fileData) {
            const c = this.currentAttachedFile.fileName;
            let l = "unknown";
            if (c) {
              const u = c.toLowerCase();
              u.startsWith("cover.") ? l = "coverFront" : u.startsWith("back.") && (l = "coverBack");
            }
            o.images ??= [], o.images.push({
              data: this.currentAttachedFile.fileData,
              mimeType: this.currentAttachedFile.fileMediaType,
              kind: l,
              name: this.currentAttachedFile.fileName ?? void 0,
              description: this.currentAttachedFile.fileDescription ?? void 0
            });
          }
          this.currentAttachedFile = null;
        }
        break;
      case P.FileUID:
        {
          if (!this.currentAttachedFile)
            break;
          this.currentAttachedFile.fileUid = Ru(e, n);
        }
        break;
      case P.FileName:
        {
          if (!this.currentAttachedFile)
            break;
          this.currentAttachedFile.fileName = _i(e, n);
        }
        break;
      case P.FileMediaType:
        {
          if (!this.currentAttachedFile)
            break;
          this.currentAttachedFile.fileMediaType = oi(e, n);
        }
        break;
      case P.FileData:
        {
          if (!this.currentAttachedFile)
            break;
          this.currentAttachedFile.fileData = N(e, n);
        }
        break;
      case P.FileDescription:
        {
          if (!this.currentAttachedFile)
            break;
          this.currentAttachedFile.fileDescription = _i(e, n);
        }
        break;
      case P.ContentEncodings:
        {
          if (!this.currentTrack)
            break;
          this.readContiguousElements(e.slice(a, n)), this.currentTrack.decodingInstructions.sort((o, c) => c.order - o.order);
        }
        break;
      case P.ContentEncoding:
        this.currentDecodingInstruction = {
          order: 0,
          scope: Or.Block,
          data: null
        }, this.readContiguousElements(e.slice(a, n)), this.currentDecodingInstruction.data && this.currentTrack.decodingInstructions.push(this.currentDecodingInstruction), this.currentDecodingInstruction = null;
        break;
      case P.ContentEncodingOrder:
        {
          if (!this.currentDecodingInstruction)
            break;
          this.currentDecodingInstruction.order = K(e, n);
        }
        break;
      case P.ContentEncodingScope:
        {
          if (!this.currentDecodingInstruction)
            break;
          this.currentDecodingInstruction.scope = K(e, n);
        }
        break;
      case P.ContentCompression:
        {
          if (!this.currentDecodingInstruction)
            break;
          this.currentDecodingInstruction.data = {
            type: "decompress",
            algorithm: Wi.Zlib,
            settings: null
          }, this.readContiguousElements(e.slice(a, n));
        }
        break;
      case P.ContentCompAlgo:
        {
          if (this.currentDecodingInstruction?.data?.type !== "decompress")
            break;
          this.currentDecodingInstruction.data.algorithm = K(e, n);
        }
        break;
      case P.ContentCompSettings:
        {
          if (this.currentDecodingInstruction?.data?.type !== "decompress")
            break;
          this.currentDecodingInstruction.data.settings = N(e, n);
        }
        break;
      case P.ContentEncryption:
        {
          if (!this.currentDecodingInstruction)
            break;
          this.currentDecodingInstruction.data = {
            type: "decrypt"
          };
        }
        break;
    }
    return e.filePos = a + n, !0;
  }
  decodeBlockData(e, t) {
    p(e.decodingInstructions.length > 0);
    let i = t;
    for (const s of e.decodingInstructions)
      switch (p(s.data), s.data.type) {
        case "decompress":
          switch (s.data.algorithm) {
            case Wi.HeaderStripping:
              if (s.data.settings && s.data.settings.length > 0) {
                const n = s.data.settings, a = new Uint8Array(n.length + i.length);
                a.set(n, 0), a.set(i, n.length), i = a;
              }
              break;
          }
          break;
      }
    return i;
  }
  processTagValue(e, t) {
    if (!this.currentSegment?.metadataTags)
      return;
    const i = this.currentSegment.metadataTags;
    if (i.raw ??= {}, i.raw[e] ??= t, typeof t == "string")
      switch (e.toLowerCase()) {
        case "title":
          i.title ??= t;
          break;
        case "description":
          i.description ??= t;
          break;
        case "artist":
          i.artist ??= t;
          break;
        case "album":
          i.album ??= t;
          break;
        case "album_artist":
          i.albumArtist ??= t;
          break;
        case "genre":
          i.genre ??= t;
          break;
        case "comment":
          i.comment ??= t;
          break;
        case "lyrics":
          i.lyrics ??= t;
          break;
        case "date":
          {
            const s = new Date(t);
            Number.isNaN(s.getTime()) || (i.date ??= s);
          }
          break;
        case "track_number":
        case "part_number":
          {
            const s = t.split("/"), n = Number.parseInt(s[0], 10), a = s[1] && Number.parseInt(s[1], 10);
            Number.isInteger(n) && n > 0 && (i.trackNumber ??= n), a && Number.isInteger(a) && a > 0 && (i.tracksTotal ??= a);
          }
          break;
        case "disc_number":
        case "disc":
          {
            const s = t.split("/"), n = Number.parseInt(s[0], 10), a = s[1] && Number.parseInt(s[1], 10);
            Number.isInteger(n) && n > 0 && (i.discNumber ??= n), a && Number.isInteger(a) && a > 0 && (i.discsTotal ??= a);
          }
          break;
      }
  }
}
class fc {
  constructor(e) {
    this.internalTrack = e, this.packetToClusterLocation = /* @__PURE__ */ new WeakMap();
  }
  getId() {
    return this.internalTrack.id;
  }
  getNumber() {
    const e = this.internalTrack.demuxer, t = this.internalTrack.trackBacking.getType();
    let i = 0;
    for (const s of e.segments)
      for (const n of s.tracks)
        if (n.trackBacking.getType() === t && i++, n === this.internalTrack)
          break;
    return i;
  }
  getCodec() {
    throw new Error("Not implemented on base class.");
  }
  getInternalCodecId() {
    return this.internalTrack.codecId;
  }
  getName() {
    return this.internalTrack.name;
  }
  getLanguageCode() {
    return this.internalTrack.languageCode;
  }
  getTimeResolution() {
    return this.internalTrack.segment.timestampFactor;
  }
  isRelativeToUnixEpoch() {
    return !1;
  }
  getUnixTimeForTimestamp() {
    return null;
  }
  getDisposition() {
    return this.internalTrack.disposition;
  }
  getPairingMask() {
    return 1n;
  }
  getBitrate() {
    return null;
  }
  getAverageBitrate() {
    return null;
  }
  async getDurationFromMetadata() {
    const e = this.internalTrack.segment;
    if (e.duration <= 0)
      return null;
    let t = e.duration / e.timestampFactor;
    const i = await this.getFirstPacket({ metadataOnly: !0 });
    return t += i?.timestamp ?? 0, t;
  }
  async getLiveRefreshInterval() {
    return null;
  }
  async getFirstPacket(e) {
    return this.performClusterLookup(
      null,
      (t) => t.trackData.get(this.internalTrack.id) ? {
        blockIndex: 0,
        correctBlockFound: !0
      } : {
        blockIndex: -1,
        correctBlockFound: !1
      },
      -1 / 0,
      // Use -Infinity as a search timestamp to avoid using the cues
      1 / 0,
      e
    );
  }
  intoTimescale(e) {
    return ji(e * this.internalTrack.segment.timestampFactor);
  }
  async getPacket(e, t) {
    const i = this.intoTimescale(e);
    return this.performClusterLookup(null, (s) => {
      const n = s.trackData.get(this.internalTrack.id);
      if (!n)
        return { blockIndex: -1, correctBlockFound: !1 };
      const a = $(n.presentationTimestamps, i, (l) => l.timestamp), o = a !== -1 ? n.presentationTimestamps[a].blockIndex : -1, c = a !== -1 && i < n.endTimestamp;
      return { blockIndex: o, correctBlockFound: c };
    }, i, i, t);
  }
  async getNextPacket(e, t) {
    const i = this.packetToClusterLocation.get(e);
    if (i === void 0)
      throw new Error("Packet was not created from this track.");
    return this.performClusterLookup(
      i.cluster,
      (s) => {
        if (s === i.cluster) {
          const n = s.trackData.get(this.internalTrack.id);
          if (i.blockIndex + 1 < n.blocks.length)
            return {
              blockIndex: i.blockIndex + 1,
              correctBlockFound: !0
            };
        } else if (s.trackData.get(this.internalTrack.id))
          return {
            blockIndex: 0,
            correctBlockFound: !0
          };
        return {
          blockIndex: -1,
          correctBlockFound: !1
        };
      },
      -1 / 0,
      // Use -Infinity as a search timestamp to avoid using the cues
      1 / 0,
      t
    );
  }
  async getKeyPacket(e, t) {
    const i = this.intoTimescale(e);
    return this.performClusterLookup(null, (s) => {
      const n = s.trackData.get(this.internalTrack.id);
      if (!n)
        return { blockIndex: -1, correctBlockFound: !1 };
      const a = jr(n.presentationTimestamps, (l) => n.blocks[l.blockIndex].isKeyFrame && l.timestamp <= i), o = a !== -1 ? n.presentationTimestamps[a].blockIndex : -1, c = a !== -1 && i < n.endTimestamp;
      return { blockIndex: o, correctBlockFound: c };
    }, i, i, t);
  }
  async getNextKeyPacket(e, t) {
    const i = this.packetToClusterLocation.get(e);
    if (i === void 0)
      throw new Error("Packet was not created from this track.");
    return this.performClusterLookup(
      i.cluster,
      (s) => {
        if (s === i.cluster) {
          const a = s.trackData.get(this.internalTrack.id).blocks.findIndex((o, c) => o.isKeyFrame && c > i.blockIndex);
          if (a !== -1)
            return {
              blockIndex: a,
              correctBlockFound: !0
            };
        } else {
          const n = s.trackData.get(this.internalTrack.id);
          if (n && n.firstKeyFrameTimestamp !== null) {
            const a = n.blocks.findIndex((o) => o.isKeyFrame);
            return p(a !== -1), {
              blockIndex: a,
              correctBlockFound: !0
            };
          }
        }
        return {
          blockIndex: -1,
          correctBlockFound: !1
        };
      },
      -1 / 0,
      // Use -Infinity as a search timestamp to avoid using the cues
      1 / 0,
      t
    );
  }
  async fetchPacketInCluster(e, t, i) {
    if (t === -1)
      return null;
    const n = e.trackData.get(this.internalTrack.id).blocks[t];
    if (p(n), n.decoded || (n.data = this.internalTrack.demuxer.decodeBlockData(this.internalTrack, n.data), n.decoded = !0), !n.postProcessed) {
      if (this.internalTrack.info?.codec === "prores" && !(n.data.length >= 8 && n.data[4] === 105 && n.data[5] === 99 && n.data[6] === 112 && n.data[7] === 102)) {
        const f = new Uint8Array(n.data.length + 8);
        q(f).setUint32(0, f.length, !1), f[4] = 105, f[5] = 99, f[6] = 112, f[7] = 102, f.set(n.data, 8), n.data = f;
      }
      n.postProcessed = !0;
    }
    const a = i.metadataOnly ? Re : n.data, o = n.timestamp / this.internalTrack.segment.timestampFactor, c = n.duration / this.internalTrack.segment.timestampFactor, l = {};
    n.mainAdditional && this.internalTrack.info?.type === "video" && this.internalTrack.info.alphaMode && (l.alpha = i.metadataOnly ? Re : n.mainAdditional, l.alphaByteLength = n.mainAdditional.byteLength);
    const u = new Z(a, n.isKeyFrame ? "key" : "delta", o, c, e.dataStartPos + t, n.data.byteLength, l);
    return this.packetToClusterLocation.set(u, { cluster: e, blockIndex: t }), u;
  }
  /** Looks for a packet in the clusters while trying to load as few clusters as possible to retrieve it. */
  async performClusterLookup(e, t, i, s, n) {
    const { demuxer: a, segment: o } = this.internalTrack;
    let c = null, l = null, u = -1;
    if (e) {
      const { blockIndex: y, correctBlockFound: b } = t(e);
      if (b)
        return this.fetchPacketInCluster(e, y, n);
      y !== -1 && (l = e, u = y);
    }
    const d = $(this.internalTrack.cuePoints, i, (y) => y.time), f = d !== -1 ? this.internalTrack.cuePoints[d] : null, h = $(this.internalTrack.clusterPositionCache, i, (y) => y.startTimestamp), g = h !== -1 ? this.internalTrack.clusterPositionCache[h] : null, m = Math.max(f?.clusterPosition ?? 0, g?.elementStartPos ?? 0) || null;
    let w;
    for (e ? m === null || e.elementStartPos >= m ? (w = e.elementEndPos, c = e) : w = m : w = m ?? o.clusterSeekStartPos; o.elementEndPos === null || w <= o.elementEndPos - De; ) {
      if (c) {
        const _ = c.trackData.get(this.internalTrack.id);
        if (_ && _.startTimestamp > s)
          break;
      }
      let y = a.reader.requestSliceRange(w, De, dt);
      if (y instanceof Promise && (y = await y), !y)
        break;
      const b = w, k = ct(y);
      if (!k || !Zi.includes(k.id) && k.id !== P.Void) {
        const _ = await lc(a.reader, b, Zi, Math.min(o.elementEndPos ?? 1 / 0, b + dc));
        if (_) {
          w = _;
          continue;
        } else
          break;
      }
      const S = k.id;
      let T = k.size;
      const A = y.filePos;
      if (S === P.Cluster) {
        c = await a.readCluster(b, o), T = c.elementEndPos - A;
        const { blockIndex: _, correctBlockFound: x } = t(c);
        if (x)
          return this.fetchPacketInCluster(c, _, n);
        _ !== -1 && (l = c, u = _);
      }
      T === void 0 && (p(S !== P.Cluster), T = (await en(a.reader, A, xr, o.elementEndPos)).pos - A);
      const C = A + T;
      if (o.elementEndPos === null) {
        let _ = a.reader.requestSliceRange(C, De, dt);
        if (_ instanceof Promise && (_ = await _), !_)
          break;
        if (zn(_) === P.Segment) {
          o.elementEndPos = C;
          break;
        }
      }
      w = C;
    }
    if (f && (!l || l.elementStartPos < f.clusterPosition)) {
      const y = this.internalTrack.cuePoints[d - 1];
      p(!y || y.time < f.time);
      const b = y?.time ?? -1 / 0;
      return this.performClusterLookup(null, t, b, s, n);
    }
    return l ? this.fetchPacketInCluster(l, u, n) : null;
  }
}
class zu extends fc {
  constructor(e) {
    super(e), this.decoderConfigPromise = null, this.internalTrack = e;
  }
  getType() {
    return "video";
  }
  getCodec() {
    return this.internalTrack.info.codec;
  }
  getCodedWidth() {
    return this.internalTrack.info.width;
  }
  getCodedHeight() {
    return this.internalTrack.info.height;
  }
  getSquarePixelWidth() {
    return this.internalTrack.info.squarePixelWidth;
  }
  getSquarePixelHeight() {
    return this.internalTrack.info.squarePixelHeight;
  }
  getRotation() {
    return this.internalTrack.info.rotation;
  }
  async getColorSpace() {
    return {
      primaries: this.internalTrack.info.colorSpace?.primaries,
      transfer: this.internalTrack.info.colorSpace?.transfer,
      matrix: this.internalTrack.info.colorSpace?.matrix,
      fullRange: this.internalTrack.info.colorSpace?.fullRange
    };
  }
  async canBeTransparent() {
    return this.internalTrack.info.alphaMode || this.internalTrack.info.codec === "prores" && (this.internalTrack.info.proresFormat === "ap4h" || this.internalTrack.info.proresFormat === "ap4x");
  }
  async getDecoderConfig() {
    return this.internalTrack.info.codec ? this.decoderConfigPromise ??= (async () => {
      let e = null;
      (this.internalTrack.info.codec === "vp9" || this.internalTrack.info.codec === "av1" || this.internalTrack.info.codec === "avc" && !this.internalTrack.info.codecDescription || this.internalTrack.info.codec === "hevc" && !this.internalTrack.info.codecDescription) && (e = await this.getFirstPacket({}));
      const i = {
        codec: Pn({
          width: this.internalTrack.info.width,
          height: this.internalTrack.info.height,
          codec: this.internalTrack.info.codec,
          codecDescription: this.internalTrack.info.codecDescription,
          colorSpace: this.internalTrack.info.colorSpace,
          avcType: 1,
          // We don't know better (or do we?) so just assume 'avc1'
          avcCodecInfo: this.internalTrack.info.codec === "avc" && e ? vn(e.data) : null,
          hevcCodecInfo: this.internalTrack.info.codec === "hevc" && e ? Bn(e.data) : null,
          vp9CodecInfo: this.internalTrack.info.codec === "vp9" && e ? Lo(e.data) : null,
          av1CodecInfo: this.internalTrack.info.codec === "av1" && e ? Ho(e.data) : null,
          proresFormat: this.internalTrack.info.proresFormat
        }),
        codedWidth: this.internalTrack.info.width,
        codedHeight: this.internalTrack.info.height,
        description: this.internalTrack.info.codecDescription ?? void 0,
        colorSpace: this.internalTrack.info.colorSpace ?? void 0
      };
      return (this.internalTrack.info.width !== this.internalTrack.info.squarePixelWidth || this.internalTrack.info.height !== this.internalTrack.info.squarePixelHeight) && (i.displayAspectWidth = this.internalTrack.info.squarePixelWidth, i.displayAspectHeight = this.internalTrack.info.squarePixelHeight), i;
    })() : null;
  }
}
class Du extends fc {
  constructor(e) {
    super(e), this.decoderConfig = null, this.internalTrack = e;
  }
  getType() {
    return "audio";
  }
  getCodec() {
    return this.internalTrack.info.codec;
  }
  getNumberOfChannels() {
    return this.internalTrack.info.numberOfChannels;
  }
  getSampleRate() {
    return this.internalTrack.info.sampleRate;
  }
  async getDecoderConfig() {
    return this.internalTrack.info.codec ? this.decoderConfig ??= {
      codec: Cn({
        codec: this.internalTrack.info.codec,
        codecDescription: this.internalTrack.info.codecDescription,
        aacCodecInfo: this.internalTrack.info.aacCodecInfo
      }),
      numberOfChannels: this.internalTrack.info.numberOfChannels,
      sampleRate: this.internalTrack.info.sampleRate,
      description: this.internalTrack.info.codecDescription ?? void 0
    } : null;
  }
}
const tn = async (r, e, t, i = null) => {
  let n = e;
  for (; t === null || n < t; ) {
    const a = t !== null ? Math.min(65536, t - n) : 65536;
    let o = r.requestSliceRange(n, Kt, a);
    if (o instanceof Promise && (o = await o), !o || o.length < Kt)
      break;
    for (; o.remainingLength >= Kt; ) {
      const c = o.filePos, l = B(o), u = r.fileSize !== null ? r.fileSize - n : null, d = Xi(l, u);
      if (d.header && (!i || // This condition helps us recover malformed streams
      // https://stackoverflow.com/a/20884944
      d.header.sampleRate === i.sampleRate && d.header.mpegVersionId === i.mpegVersionId && d.header.layer === i.layer && Yi(d.header.channel) === Yi(i.channel)))
        return { header: d.header, startPos: n };
      o.filePos = c + d.bytesAdvanced, n = o.filePos;
    }
  }
  return null;
};
class Ou extends bt {
  constructor(e) {
    super(e), this.metadataPromise = null, this.firstFrameHeader = null, this.firstFrameHeaderPos = null, this.xingFrameHeader = null, this.xingFrameHeaderPos = null, this.loadedSamples = [], this.metadataTags = null, this.xingData = null, this.trackBackings = [], this.readingMutex = new Yt(), this.lastSampleLoaded = !1, this.lastLoadedPos = 0, this.nextTimestampInSamples = 0, this.reader = e._reader;
  }
  async readMetadata() {
    return this.metadataPromise ??= (async () => {
      for (; !this.firstFrameHeader && !this.lastSampleLoaded; )
        await this.advanceReader();
      if (!this.firstFrameHeader && this.xingFrameHeader && (this.firstFrameHeader = this.xingFrameHeader, this.firstFrameHeaderPos = this.xingFrameHeaderPos), !this.firstFrameHeader)
        throw new Error("No valid MP3 frame found.");
      this.trackBackings = [new Uu(this)];
    })();
  }
  async advanceReader() {
    if (this.lastLoadedPos === 0)
      for (; ; ) {
        let o = this.reader.requestSlice(this.lastLoadedPos, Ne);
        if (o instanceof Promise && (o = await o), !o) {
          this.lastSampleLoaded = !0;
          return;
        }
        const c = wt(o);
        if (!c)
          break;
        this.lastLoadedPos = o.filePos + c.size;
      }
    const e = await tn(this.reader, this.lastLoadedPos, this.reader.fileSize, this.firstFrameHeader);
    if (!e) {
      this.lastSampleLoaded = !0;
      return;
    }
    const t = e.header;
    this.lastLoadedPos = e.startPos + t.totalSize - 1;
    const i = Xr(t.mpegVersionId, t.channel);
    let s = this.reader.requestSlice(e.startPos + i, 4);
    if (s instanceof Promise && (s = await s), s) {
      const o = B(s);
      if (o === Gr || o === _n) {
        if (this.xingFrameHeader || (this.xingFrameHeader = t, this.xingFrameHeaderPos = e.startPos), !this.xingData) {
          let l = this.reader.requestSlice(e.startPos + i + 4, 12);
          if (l instanceof Promise && (l = await l), l) {
            const u = N(l, 12), d = q(u), f = d.getUint32(0, !1);
            this.xingData = {
              frameCount: f & Qt.FrameCount ? d.getUint32(4, !1) : null,
              fileSize: f & Qt.FileSize ? d.getUint32(8, !1) : null
            };
          }
        }
        return;
      }
    }
    this.firstFrameHeader || (this.firstFrameHeader = t, this.firstFrameHeaderPos = e.startPos);
    const n = t.audioSamplesInFrame / this.firstFrameHeader.sampleRate, a = {
      timestamp: this.nextTimestampInSamples / this.firstFrameHeader.sampleRate,
      duration: n,
      dataStart: e.startPos,
      dataSize: t.totalSize
    };
    this.loadedSamples.push(a), this.nextTimestampInSamples += t.audioSamplesInFrame;
  }
  async getMimeType() {
    return "audio/mpeg";
  }
  async getTrackBackings() {
    return await this.readMetadata(), this.trackBackings;
  }
  async getMetadataTags() {
    const e = await this.readingMutex.acquire();
    try {
      if (await this.readMetadata(), this.metadataTags)
        return this.metadataTags;
      this.metadataTags = {};
      let t = 0, i = !1;
      for (; ; ) {
        let s = this.reader.requestSlice(t, Ne);
        if (s instanceof Promise && (s = await s), !s)
          break;
        const n = wt(s);
        if (!n)
          break;
        i = !0;
        let a = this.reader.requestSlice(s.filePos, n.size);
        if (a instanceof Promise && (a = await a), !a)
          break;
        as(a, n, this.metadataTags), t = s.filePos + n.size;
      }
      if (!i && this.reader.fileSize !== null && this.reader.fileSize >= Cr) {
        let s = this.reader.requestSlice(this.reader.fileSize - Cr, Cr);
        s instanceof Promise && (s = await s), p(s), oe(s, 3) === "TAG" && mf(s, this.metadataTags);
      }
      return this.metadataTags;
    } finally {
      e();
    }
  }
}
class Uu {
  constructor(e) {
    this.demuxer = e;
  }
  getType() {
    return "audio";
  }
  getId() {
    return 1;
  }
  getNumber() {
    return 1;
  }
  getTimeResolution() {
    return p(this.demuxer.firstFrameHeader), this.demuxer.firstFrameHeader.sampleRate / this.demuxer.firstFrameHeader.audioSamplesInFrame;
  }
  isRelativeToUnixEpoch() {
    return !1;
  }
  getUnixTimeForTimestamp() {
    return null;
  }
  getPairingMask() {
    return 1n;
  }
  getBitrate() {
    return null;
  }
  getAverageBitrate() {
    return null;
  }
  async getDurationFromMetadata() {
    const e = this.demuxer;
    if (p(e.firstFrameHeader !== null), p(e.firstFrameHeaderPos !== null), e.xingData) {
      if (e.xingData.frameCount !== null)
        return e.xingData.frameCount * e.firstFrameHeader.audioSamplesInFrame / e.firstFrameHeader.sampleRate;
    } else if (e.reader.fileSize !== null) {
      const t = iu(e.firstFrameHeader.lowSamplingFrequency, e.firstFrameHeader.layer, e.firstFrameHeader.bitrate, e.firstFrameHeader.sampleRate), i = (e.reader.fileSize - e.firstFrameHeaderPos) / t;
      return Math.round(i) * e.firstFrameHeader.audioSamplesInFrame / e.firstFrameHeader.sampleRate;
    }
    return null;
  }
  async getLiveRefreshInterval() {
    return null;
  }
  getName() {
    return null;
  }
  getLanguageCode() {
    return ke;
  }
  getCodec() {
    return "mp3";
  }
  getInternalCodecId() {
    return null;
  }
  getNumberOfChannels() {
    return p(this.demuxer.firstFrameHeader), Yi(this.demuxer.firstFrameHeader.channel);
  }
  getSampleRate() {
    return p(this.demuxer.firstFrameHeader), this.demuxer.firstFrameHeader.sampleRate;
  }
  getDisposition() {
    return {
      ...yt
    };
  }
  async getDecoderConfig() {
    return p(this.demuxer.firstFrameHeader), {
      codec: "mp3",
      numberOfChannels: Yi(this.demuxer.firstFrameHeader.channel),
      sampleRate: this.demuxer.firstFrameHeader.sampleRate
    };
  }
  async getPacketAtIndex(e, t) {
    if (e === -1)
      return null;
    const i = this.demuxer.loadedSamples[e];
    if (!i)
      return null;
    let s;
    if (t.metadataOnly)
      s = Re;
    else {
      let n = this.demuxer.reader.requestSlice(i.dataStart, i.dataSize);
      if (n instanceof Promise && (n = await n), !n)
        return null;
      s = N(n, i.dataSize);
    }
    return new Z(s, "key", i.timestamp, i.duration, e, i.dataSize);
  }
  getFirstPacket(e) {
    return this.getPacketAtIndex(0, e);
  }
  async getNextPacket(e, t) {
    const i = await this.demuxer.readingMutex.acquire();
    try {
      const s = ar(this.demuxer.loadedSamples, e.timestamp, (a) => a.timestamp);
      if (s === -1)
        throw new Error("Packet was not created from this track.");
      const n = s + 1;
      for (; n >= this.demuxer.loadedSamples.length && !this.demuxer.lastSampleLoaded; )
        await this.demuxer.advanceReader();
      return this.getPacketAtIndex(n, t);
    } finally {
      i();
    }
  }
  async getPacket(e, t) {
    const i = await this.demuxer.readingMutex.acquire();
    try {
      for (; ; ) {
        const s = $(this.demuxer.loadedSamples, e, (n) => n.timestamp);
        if (s === -1 && this.demuxer.loadedSamples.length > 0)
          return null;
        if (this.demuxer.lastSampleLoaded)
          return this.getPacketAtIndex(s, t);
        if (s >= 0 && s + 1 < this.demuxer.loadedSamples.length)
          return this.getPacketAtIndex(s, t);
        await this.demuxer.advanceReader();
      }
    } finally {
      i();
    }
  }
  getKeyPacket(e, t) {
    return this.getPacket(e, t);
  }
  getNextKeyPacket(e, t) {
    return this.getNextPacket(e, t);
  }
}
const Dn = 1399285583, Nu = 79764919, hc = new Uint32Array(256);
for (let r = 0; r < 256; r++) {
  let e = r << 24;
  for (let t = 0; t < 8; t++)
    e = e & 2147483648 ? e << 1 ^ Nu : e << 1;
  hc[r] = e >>> 0 & 4294967295;
}
const mc = (r) => {
  const e = q(r), t = e.getUint32(22, !0);
  e.setUint32(22, 0, !0);
  let i = 0;
  for (let s = 0; s < r.length; s++) {
    const n = r[s];
    i = (i << 8 ^ hc[i >>> 24 ^ n]) >>> 0;
  }
  return e.setUint32(22, t, !0), i;
}, pc = (r, e, t) => {
  let i = 0, s = null;
  if (r.length > 0)
    if (e.codec === "vorbis") {
      p(e.vorbisInfo);
      const n = e.vorbisInfo.modeBlockflags.length, o = (1 << Bl(n - 1)) - 1 << 1, c = (r[0] & o) >> 1;
      if (c >= e.vorbisInfo.modeBlockflags.length)
        throw new Error("Invalid mode number.");
      let l = t;
      const u = e.vorbisInfo.modeBlockflags[c];
      if (s = e.vorbisInfo.blocksizes[u], u === 1) {
        const d = (o | 1) + 1, f = r[0] & d ? 1 : 0;
        l = e.vorbisInfo.blocksizes[f];
      }
      i = l !== null ? l + s >> 2 : 0;
    } else e.codec === "opus" && (i = wu(r).durationInSamples);
  return {
    durationInSamples: i,
    vorbisBlockSize: s
  };
}, gc = (r) => {
  let e = "audio/ogg";
  if (r.codecStrings) {
    const t = [...new Set(r.codecStrings)];
    e += `; codecs="${t.join(", ")}"`;
  }
  return e;
};
const Wt = 27, mi = 282, wc = mi + 65025, Li = (r) => {
  const e = r.filePos;
  if (li(r) !== Dn)
    return null;
  r.skip(1);
  const i = U(r), s = ff(r), n = li(r), a = li(r), o = li(r), c = U(r), l = new Uint8Array(c);
  for (let h = 0; h < c; h++)
    l[h] = U(r);
  const u = 27 + c, d = l.reduce((h, g) => h + g, 0), f = u + d;
  return {
    headerStartPos: e,
    totalSize: f,
    dataStartPos: e + u,
    dataSize: d,
    headerType: i,
    granulePosition: s,
    serialNumber: n,
    sequenceNumber: a,
    checksum: o,
    lacingValues: l
  };
}, Vu = (r, e) => {
  for (; r.filePos < e - 3; ) {
    const t = li(r), i = t & 255, s = t >>> 8 & 255, n = t >>> 16 & 255, a = t >>> 24 & 255, o = 79;
    if (!(i !== o && s !== o && n !== o && a !== o)) {
      if (r.skip(-4), t === Dn)
        return !0;
      r.skip(1);
    }
  }
  return !1;
};
class Wu extends bt {
  constructor(e) {
    super(e), this.metadataPromise = null, this.bitstreams = [], this.trackBackings = [], this.metadataTags = {}, this.reader = e._reader;
  }
  async readMetadata() {
    return this.metadataPromise ??= (async () => {
      let e = 0;
      for (; ; ) {
        let t = this.reader.requestSliceRange(e, Wt, mi);
        if (t instanceof Promise && (t = await t), !t)
          break;
        const i = Li(t);
        if (!i || !!!(i.headerType & 2))
          break;
        this.bitstreams.push({
          serialNumber: i.serialNumber,
          bosPage: i,
          description: null,
          numberOfChannels: -1,
          sampleRate: -1,
          codecInfo: {
            codec: null,
            vorbisInfo: null,
            opusInfo: null
          },
          lastMetadataPacket: null
        }), e = i.headerStartPos + i.totalSize;
      }
      for (const t of this.bitstreams) {
        const i = await this.readPacket(t.bosPage, 0);
        i && (// Check for Vorbis
        i.data.byteLength >= 7 && i.data[0] === 1 && i.data[1] === 118 && i.data[2] === 111 && i.data[3] === 114 && i.data[4] === 98 && i.data[5] === 105 && i.data[6] === 115 ? await this.readVorbisMetadata(i, t) : (
          // Check for Opus
          i.data.byteLength >= 8 && i.data[0] === 79 && i.data[1] === 112 && i.data[2] === 117 && i.data[3] === 115 && i.data[4] === 72 && i.data[5] === 101 && i.data[6] === 97 && i.data[7] === 100 && await this.readOpusMetadata(i, t)
        ), t.codecInfo.codec !== null && this.trackBackings.push(new Lu(t, this)));
      }
    })();
  }
  async readVorbisMetadata(e, t) {
    let i = await this.findNextPacketStart(e);
    if (!i)
      return;
    const s = await this.readPacket(i.startPage, i.startSegmentIndex);
    if (!s || (i = await this.findNextPacketStart(s), !i))
      return;
    const n = await this.readPacket(i.startPage, i.startSegmentIndex);
    if (!n || s.data[0] !== 3 || n.data[0] !== 5)
      return;
    const a = [], o = (d) => {
      for (; a.push(Math.min(255, d)), !(d < 255); )
        d -= 255;
    };
    o(e.data.length), o(s.data.length);
    const c = new Uint8Array(1 + a.length + e.data.length + s.data.length + n.data.length);
    c[0] = 2, c.set(a, 1), c.set(e.data, 1 + a.length), c.set(s.data, 1 + a.length + e.data.length), c.set(n.data, 1 + a.length + e.data.length + s.data.length), t.codecInfo.codec = "vorbis", t.description = c, t.lastMetadataPacket = n;
    const l = q(e.data);
    t.numberOfChannels = l.getUint8(11), t.sampleRate = l.getUint32(12, !0);
    const u = l.getUint8(28);
    t.codecInfo.vorbisInfo = {
      blocksizes: [
        1 << (u & 15),
        1 << (u >> 4)
      ],
      modeBlockflags: jo(n.data).modeBlockflags
    }, $s(s.data.subarray(7), this.metadataTags);
  }
  async readOpusMetadata(e, t) {
    const i = await this.findNextPacketStart(e);
    if (!i)
      return;
    const s = await this.readPacket(i.startPage, i.startSegmentIndex);
    if (!s)
      return;
    t.codecInfo.codec = "opus", t.description = e.data, t.lastMetadataPacket = s;
    const n = Jr(e.data);
    t.numberOfChannels = n.outputChannelCount, t.sampleRate = xi, t.codecInfo.opusInfo = {
      preSkip: n.preSkip
    }, $s(s.data.subarray(8), this.metadataTags);
  }
  async readPacket(e, t) {
    p(t < e.lacingValues.length);
    let i = 0;
    for (let d = 0; d < t; d++)
      i += e.lacingValues[d];
    let s = e, n = i, a = t;
    const o = [];
    e: for (; ; ) {
      let d = this.reader.requestSlice(s.dataStartPos, s.dataSize);
      d instanceof Promise && (d = await d), p(d);
      const f = N(d, s.dataSize);
      for (; ; ) {
        if (a === s.lacingValues.length) {
          o.push(f.subarray(i, n));
          break;
        }
        const g = s.lacingValues[a];
        if (n += g, g < 255) {
          o.push(f.subarray(i, n));
          break e;
        }
        a++;
      }
      let h = s.headerStartPos + s.totalSize;
      for (; ; ) {
        let g = this.reader.requestSliceRange(h, Wt, mi);
        if (g instanceof Promise && (g = await g), !g)
          return null;
        const m = Li(g);
        if (!m)
          return null;
        if (s = m, s.serialNumber === e.serialNumber)
          break;
        h = s.headerStartPos + s.totalSize;
      }
      i = 0, n = 0, a = 0;
    }
    const c = o.reduce((d, f) => d + f.length, 0);
    if (c === 0)
      return null;
    const l = new Uint8Array(c);
    let u = 0;
    for (let d = 0; d < o.length; d++) {
      const f = o[d];
      l.set(f, u), u += f.length;
    }
    return {
      data: l,
      endPage: s,
      endSegmentIndex: a
    };
  }
  async findNextPacketStart(e) {
    if (e.endSegmentIndex < e.endPage.lacingValues.length - 1)
      return { startPage: e.endPage, startSegmentIndex: e.endSegmentIndex + 1 };
    if (!!(e.endPage.headerType & 4))
      return null;
    let i = e.endPage.headerStartPos + e.endPage.totalSize;
    for (; ; ) {
      let s = this.reader.requestSliceRange(i, Wt, mi);
      if (s instanceof Promise && (s = await s), !s)
        return null;
      const n = Li(s);
      if (!n)
        return null;
      if (n.serialNumber === e.endPage.serialNumber)
        return { startPage: n, startSegmentIndex: 0 };
      i = n.headerStartPos + n.totalSize;
    }
  }
  async getMimeType() {
    await this.readMetadata();
    const e = await Promise.all(this.trackBackings.map((t) => t.getDecoderConfig().then((i) => i?.codec ?? null)));
    return gc({
      codecStrings: e.filter(Boolean)
    });
  }
  async getTrackBackings() {
    return await this.readMetadata(), this.trackBackings;
  }
  async getMetadataTags() {
    return await this.readMetadata(), this.metadataTags;
  }
}
class Lu {
  constructor(e, t) {
    this.bitstream = e, this.demuxer = t, this.encodedPacketToMetadata = /* @__PURE__ */ new WeakMap(), this.sequentialScanCache = [], this.sequentialScanMutex = new Yt(), this.internalSampleRate = e.codecInfo.codec === "opus" ? xi : e.sampleRate;
  }
  getType() {
    return "audio";
  }
  getId() {
    return this.bitstream.serialNumber;
  }
  getNumber() {
    const e = this.demuxer.trackBackings.findIndex((t) => t.bitstream === this.bitstream);
    return p(e !== -1), e + 1;
  }
  getNumberOfChannels() {
    return this.bitstream.numberOfChannels;
  }
  getSampleRate() {
    return this.bitstream.sampleRate;
  }
  getTimeResolution() {
    return this.bitstream.sampleRate;
  }
  isRelativeToUnixEpoch() {
    return !1;
  }
  getUnixTimeForTimestamp() {
    return null;
  }
  getPairingMask() {
    return 1n;
  }
  getBitrate() {
    return null;
  }
  getAverageBitrate() {
    return null;
  }
  async getDurationFromMetadata() {
    return null;
  }
  async getLiveRefreshInterval() {
    return null;
  }
  getCodec() {
    return this.bitstream.codecInfo.codec;
  }
  getInternalCodecId() {
    return null;
  }
  async getDecoderConfig() {
    return p(this.bitstream.codecInfo.codec), {
      codec: this.bitstream.codecInfo.codec,
      numberOfChannels: this.bitstream.numberOfChannels,
      sampleRate: this.bitstream.sampleRate,
      description: this.bitstream.description ?? void 0
    };
  }
  getName() {
    return null;
  }
  getLanguageCode() {
    return ke;
  }
  getDisposition() {
    return {
      ...yt,
      primary: !1
    };
  }
  granulePositionToTimestampInSamples(e) {
    return this.bitstream.codecInfo.codec === "opus" ? (p(this.bitstream.codecInfo.opusInfo), e - this.bitstream.codecInfo.opusInfo.preSkip) : e;
  }
  createEncodedPacketFromOggPacket(e, t, i) {
    if (!e)
      return null;
    const { durationInSamples: s, vorbisBlockSize: n } = pc(e.data, this.bitstream.codecInfo, t.vorbisLastBlocksize), a = new Z(i.metadataOnly ? Re : e.data, "key", Math.max(0, t.timestampInSamples) / this.internalSampleRate, s / this.internalSampleRate, e.endPage.headerStartPos + e.endSegmentIndex, e.data.byteLength);
    return this.encodedPacketToMetadata.set(a, {
      packet: e,
      timestampInSamples: t.timestampInSamples,
      durationInSamples: s,
      vorbisLastBlockSize: t.vorbisLastBlocksize,
      vorbisBlockSize: n
    }), a;
  }
  async getFirstPacket(e) {
    p(this.bitstream.lastMetadataPacket);
    const t = await this.demuxer.findNextPacketStart(this.bitstream.lastMetadataPacket);
    if (!t)
      return null;
    let i = 0;
    this.bitstream.codecInfo.codec === "opus" && (p(this.bitstream.codecInfo.opusInfo), i -= this.bitstream.codecInfo.opusInfo.preSkip);
    const s = await this.demuxer.readPacket(t.startPage, t.startSegmentIndex);
    return this.createEncodedPacketFromOggPacket(s, {
      timestampInSamples: i,
      vorbisLastBlocksize: null
    }, e);
  }
  async getNextPacket(e, t) {
    const i = this.encodedPacketToMetadata.get(e);
    if (!i)
      throw new Error("Packet was not created from this track.");
    const s = await this.demuxer.findNextPacketStart(i.packet);
    if (!s)
      return null;
    const n = i.timestampInSamples + i.durationInSamples, a = await this.demuxer.readPacket(s.startPage, s.startSegmentIndex);
    return this.createEncodedPacketFromOggPacket(a, {
      timestampInSamples: n,
      vorbisLastBlocksize: i.vorbisBlockSize
    }, t);
  }
  async getPacket(e, t) {
    if (this.demuxer.reader.fileSize === null)
      return this.getPacketSequential(e, t);
    const i = ji(e * this.internalSampleRate);
    if (i === 0)
      return this.getFirstPacket(t);
    if (i < 0)
      return null;
    p(this.bitstream.lastMetadataPacket);
    const s = await this.demuxer.findNextPacketStart(this.bitstream.lastMetadataPacket);
    if (!s)
      return null;
    let n = s.startPage, a = this.demuxer.reader.fileSize;
    const o = [n];
    e: for (; n.headerStartPos + n.totalSize < a; ) {
      const b = n.headerStartPos, k = Math.floor((b + a) / 2);
      let S = k;
      for (; ; ) {
        const T = Math.min(S + wc, a - Wt);
        let A = this.demuxer.reader.requestSlice(S, T - S);
        if (A instanceof Promise && (A = await A), p(A), !Vu(A, T)) {
          a = k + Wt;
          continue e;
        }
        let _ = this.demuxer.reader.requestSliceRange(A.filePos, Wt, mi);
        _ instanceof Promise && (_ = await _), p(_);
        const x = Li(_);
        p(x);
        let I = !1;
        if (x.serialNumber === this.bitstream.serialNumber)
          I = !0;
        else {
          let v = this.demuxer.reader.requestSlice(x.headerStartPos, x.totalSize);
          v instanceof Promise && (v = await v), p(v);
          const M = N(v, x.totalSize);
          I = mc(M) === x.checksum;
        }
        if (!I) {
          S = x.headerStartPos + 4;
          continue;
        }
        if (I && x.serialNumber !== this.bitstream.serialNumber) {
          S = x.headerStartPos + x.totalSize;
          continue;
        }
        if (x.granulePosition === -1) {
          S = x.headerStartPos + x.totalSize;
          continue;
        }
        this.granulePositionToTimestampInSamples(x.granulePosition) > i ? a = x.headerStartPos : (n = x, o.push(x));
        continue e;
      }
    }
    let c = s.startPage;
    for (const b of o) {
      if (b.granulePosition === n.granulePosition)
        break;
      (!c || b.headerStartPos > c.headerStartPos) && (c = b);
    }
    let l = c;
    const u = [l];
    for (; !(l.serialNumber === this.bitstream.serialNumber && l.granulePosition === n.granulePosition); ) {
      const b = l.headerStartPos + l.totalSize;
      let k = this.demuxer.reader.requestSliceRange(b, Wt, mi);
      k instanceof Promise && (k = await k), p(k);
      const S = Li(k);
      p(S), l = S, l.serialNumber === this.bitstream.serialNumber && u.push(l);
    }
    p(l.granulePosition !== -1);
    let d = null, f, h, g = l, m = 0;
    if (l.headerStartPos === s.startPage.headerStartPos)
      f = this.granulePositionToTimestampInSamples(0), h = !0, d = 0;
    else {
      f = 0, h = !1;
      for (let S = l.lacingValues.length - 1; S >= 0; S--)
        if (l.lacingValues[S] < 255) {
          d = S + 1;
          break;
        }
      if (d === null)
        throw new Error("Invalid page with granule position: no packets end on this page.");
      m = d - 1;
      const b = {
        data: Re,
        endPage: g,
        endSegmentIndex: m
      };
      if (await this.demuxer.findNextPacketStart(b)) {
        const S = ka(u, l, d);
        p(S);
        const T = ba(u, S.page, S.segmentIndex);
        T && (l = T.page, d = T.segmentIndex);
      } else
        for (; ; ) {
          const S = ka(u, l, d);
          if (!S)
            break;
          const T = ba(u, S.page, S.segmentIndex);
          if (!T)
            break;
          if (l = T.page, d = T.segmentIndex, S.page.headerStartPos !== g.headerStartPos) {
            g = S.page, m = S.segmentIndex;
            break;
          }
        }
    }
    let w = null, y = null;
    for (; l !== null; ) {
      p(d !== null);
      const b = await this.demuxer.readPacket(l, d);
      if (!b)
        break;
      if (!(l.headerStartPos === s.startPage.headerStartPos && d < s.startSegmentIndex)) {
        let T = this.createEncodedPacketFromOggPacket(b, {
          timestampInSamples: f,
          vorbisLastBlocksize: y?.vorbisBlockSize ?? null
        }, t);
        p(T);
        let A = this.encodedPacketToMetadata.get(T);
        if (p(A), !h && b.endPage.headerStartPos === g.headerStartPos && b.endSegmentIndex === m ? (f = this.granulePositionToTimestampInSamples(l.granulePosition), h = !0, T = this.createEncodedPacketFromOggPacket(b, {
          timestampInSamples: f - A.durationInSamples,
          vorbisLastBlocksize: y?.vorbisBlockSize ?? null
        }, t), p(T), A = this.encodedPacketToMetadata.get(T), p(A)) : f += A.durationInSamples, w = T, y = A, h && // Next timestamp will be too late
        (Math.max(f, 0) > i || Math.max(A.timestampInSamples, 0) === i))
          break;
      }
      const S = await this.demuxer.findNextPacketStart(b);
      if (!S)
        break;
      l = S.startPage, d = S.startSegmentIndex;
    }
    return w;
  }
  // A slower but simpler and sequential algorithm for finding a packet in a file
  async getPacketSequential(e, t) {
    const i = await this.sequentialScanMutex.acquire();
    try {
      const s = ji(e * this.internalSampleRate);
      e = s / this.internalSampleRate;
      const n = $(this.sequentialScanCache, s, (c) => c.timestampInSamples);
      let a;
      if (n !== -1) {
        const c = this.sequentialScanCache[n];
        a = this.createEncodedPacketFromOggPacket(c.packet, {
          timestampInSamples: c.timestampInSamples,
          vorbisLastBlocksize: c.vorbisLastBlockSize
        }, t);
      } else
        a = await this.getFirstPacket(t);
      let o = 0;
      for (; a && a.timestamp < e; ) {
        const c = await this.getNextPacket(a, t);
        if (!c || c.timestamp > e)
          break;
        if (a = c, o++, o === 100) {
          o = 0;
          const l = this.encodedPacketToMetadata.get(a);
          p(l), this.sequentialScanCache.length > 0 && p(ne(this.sequentialScanCache).timestampInSamples <= l.timestampInSamples), this.sequentialScanCache.push(l);
        }
      }
      return a;
    } finally {
      i();
    }
  }
  getKeyPacket(e, t) {
    return this.getPacket(e, t);
  }
  getNextKeyPacket(e, t) {
    return this.getNextPacket(e, t);
  }
}
const ba = (r, e, t) => {
  let i = e, s = t;
  e: for (; ; ) {
    for (s--, s; s >= 0; s--)
      if (i.lacingValues[s] < 255) {
        s++;
        break e;
      }
    if (p(s === -1), !(i.headerType & 1)) {
      s = 0;
      break;
    }
    const a = xo(r, (o) => o.headerStartPos < i.headerStartPos);
    if (!a)
      return null;
    i = a, s = i.lacingValues.length;
  }
  if (p(s !== -1), s === i.lacingValues.length) {
    const n = r[r.indexOf(i) + 1];
    p(n), i = n, s = 0;
  }
  return { page: i, segmentIndex: s };
}, ka = (r, e, t) => {
  if (t > 0)
    return { page: e, segmentIndex: t - 1 };
  const i = xo(r, (s) => s.headerStartPos < e.headerStartPos);
  return i ? { page: i, segmentIndex: i.lacingValues.length - 1 } : null;
};
var he;
(function(r) {
  r[r.PCM = 1] = "PCM", r[r.IEEE_FLOAT = 3] = "IEEE_FLOAT", r[r.ALAW = 6] = "ALAW", r[r.MULAW = 7] = "MULAW", r[r.EXTENSIBLE = 65534] = "EXTENSIBLE";
})(he || (he = {}));
class qu extends bt {
  constructor(e) {
    super(e), this.metadataPromise = null, this.dataStart = -1, this.dataSize = -1, this.audioInfo = null, this.trackBackings = [], this.lastKnownPacketIndex = 0, this.metadataTags = {}, this.reader = e._reader;
  }
  async readMetadata() {
    return this.metadataPromise ??= (async () => {
      let e = this.reader.requestSlice(0, 12);
      e instanceof Promise && (e = await e), p(e);
      const t = oe(e, 4), i = t !== "RIFX", s = t === "RF64", n = It(e, i);
      let a = s ? this.reader.fileSize : Math.min(n + 8, this.reader.fileSize ?? 1 / 0);
      if (oe(e, 4) !== "WAVE")
        throw new Error("Invalid WAVE file - wrong format");
      let c = 0, l = null, u = e.filePos;
      for (; a === null || u < a; ) {
        let f = this.reader.requestSlice(u, 8);
        if (f instanceof Promise && (f = await f), !f)
          break;
        const h = oe(f, 4), g = It(f, i), m = f.filePos;
        if (s && c === 0 && h !== "ds64")
          throw new Error('Invalid RF64 file: First chunk must be "ds64".');
        if (h === "fmt ")
          await this.parseFmtChunk(m, g, i);
        else if (h === "data") {
          if (l ??= g, this.dataStart = f.filePos, this.dataSize = Math.min(l, (a ?? 1 / 0) - this.dataStart), this.reader.fileSize === null)
            break;
        } else if (h === "ds64") {
          let w = this.reader.requestSlice(m, g);
          if (w instanceof Promise && (w = await w), !w)
            break;
          const y = Ja(w, i);
          l = Ja(w, i), a = Math.min(y + 8, this.reader.fileSize ?? 1 / 0);
        } else h === "LIST" ? await this.parseListChunk(m, g, i) : (h === "ID3 " || h === "id3 ") && await this.parseId3Chunk(m, g);
        u = m + g + (g & 1), c++;
      }
      if (!this.audioInfo)
        throw new Error('Invalid WAVE file - missing "fmt " chunk');
      if (this.dataStart === -1)
        throw new Error('Invalid WAVE file - missing "data" chunk');
      const d = this.audioInfo.blockSizeInBytes;
      this.dataSize = Math.floor(this.dataSize / d) * d, this.trackBackings.push(new Hu(this));
    })();
  }
  async parseFmtChunk(e, t, i) {
    let s = this.reader.requestSlice(e, t);
    if (s instanceof Promise && (s = await s), !s)
      return;
    let n = Mi(s, i);
    const a = Mi(s, i), o = It(s, i);
    s.skip(4);
    const c = Mi(s, i);
    let l;
    if (t === 14 ? l = 8 : l = Mi(s, i), t >= 18 && n !== 357) {
      const u = Mi(s, i), d = t - 18;
      if (Math.min(d, u) >= 22 && n === he.EXTENSIBLE) {
        s.skip(6);
        const h = N(s, 16);
        n = h[0] | h[1] << 8;
      }
    }
    if ((n === he.MULAW || n === he.ALAW) && (l = 8), n !== he.PCM && n !== he.IEEE_FLOAT && n !== he.ALAW && n !== he.MULAW)
      throw new Error(`Unsupported WAVE codec (format tag ${n}). Only integer/float PCM, A-law, and μ-law are supported.`);
    if (n === he.PCM && ![8, 16, 24, 32].includes(l))
      throw new Error(`Unsupported WAVE PCM bit depth (${l}). Only 8, 16, 24, and 32 bits are supported.`);
    if (n === he.IEEE_FLOAT && ![32, 64].includes(l))
      throw new Error(`Unsupported WAVE float bit depth (${l}). Only 32 and 64 bits are supported.`);
    this.audioInfo = {
      format: n,
      numberOfChannels: a,
      sampleRate: o,
      sampleSizeInBytes: Math.ceil(l / 8),
      blockSizeInBytes: c
    };
  }
  async parseListChunk(e, t, i) {
    let s = this.reader.requestSlice(e, t);
    if (s instanceof Promise && (s = await s), !s)
      return;
    const n = oe(s, 4);
    if (n !== "INFO" && n !== "INF0")
      return;
    let a = s.filePos;
    for (; a <= e + t - 8; ) {
      s.filePos = a;
      const o = oe(s, 4), c = It(s, i), l = N(s, c);
      let u = 0;
      for (let f = 0; f < l.length && l[f] !== 0; f++)
        u++;
      const d = String.fromCharCode(...l.subarray(0, u));
      switch (this.metadataTags.raw ??= {}, this.metadataTags.raw[o] = d, o) {
        case "INAM":
        case "TITL":
          this.metadataTags.title ??= d;
          break;
        case "TIT3":
          this.metadataTags.description ??= d;
          break;
        case "IART":
          this.metadataTags.artist ??= d;
          break;
        case "IPRD":
          this.metadataTags.album ??= d;
          break;
        case "IPRT":
        case "ITRK":
        case "TRCK":
          {
            const f = d.split("/"), h = Number.parseInt(f[0], 10), g = f[1] && Number.parseInt(f[1], 10);
            Number.isInteger(h) && h > 0 && (this.metadataTags.trackNumber ??= h), g && Number.isInteger(g) && g > 0 && (this.metadataTags.tracksTotal ??= g);
          }
          break;
        case "ICRD":
        case "IDIT":
          {
            const f = new Date(d);
            Number.isNaN(f.getTime()) || (this.metadataTags.date ??= f);
          }
          break;
        case "YEAR":
          {
            const f = Number.parseInt(d, 10);
            Number.isInteger(f) && f > 0 && (this.metadataTags.date ??= new Date(f, 0, 1));
          }
          break;
        case "IGNR":
        case "GENR":
          this.metadataTags.genre ??= d;
          break;
        case "ICMT":
        case "CMNT":
        case "COMM":
          this.metadataTags.comment ??= d;
          break;
      }
      a += 8 + c + (c & 1);
    }
  }
  async parseId3Chunk(e, t) {
    let i = this.reader.requestSlice(e, t);
    if (i instanceof Promise && (i = await i), !i)
      return;
    const s = wt(i);
    if (s) {
      const n = t - Ne;
      if (s.size = Math.min(s.size, n), s.size > 0) {
        const a = i.slice(e + Ne, s.size);
        as(a, s, this.metadataTags);
      }
    }
  }
  getCodec() {
    if (p(this.audioInfo), this.audioInfo.format === he.MULAW)
      return "ulaw";
    if (this.audioInfo.format === he.ALAW)
      return "alaw";
    if (this.audioInfo.format === he.PCM) {
      if (this.audioInfo.sampleSizeInBytes === 1)
        return "pcm-u8";
      if (this.audioInfo.sampleSizeInBytes === 2)
        return "pcm-s16";
      if (this.audioInfo.sampleSizeInBytes === 3)
        return "pcm-s24";
      if (this.audioInfo.sampleSizeInBytes === 4)
        return "pcm-s32";
    }
    if (this.audioInfo.format === he.IEEE_FLOAT) {
      if (this.audioInfo.sampleSizeInBytes === 4)
        return "pcm-f32";
      if (this.audioInfo.sampleSizeInBytes === 8)
        return "pcm-f64";
    }
    p(!1);
  }
  async getMimeType() {
    return "audio/wav";
  }
  async getTrackBackings() {
    return await this.readMetadata(), this.trackBackings;
  }
  async getMetadataTags() {
    return await this.readMetadata(), this.metadataTags;
  }
}
const ei = 2048;
class Hu {
  constructor(e) {
    this.demuxer = e;
  }
  getType() {
    return "audio";
  }
  getId() {
    return 1;
  }
  getNumber() {
    return 1;
  }
  getCodec() {
    return this.demuxer.getCodec();
  }
  getInternalCodecId() {
    return p(this.demuxer.audioInfo), this.demuxer.audioInfo.format;
  }
  async getDecoderConfig() {
    const e = this.demuxer.getCodec();
    return e ? (p(this.demuxer.audioInfo), {
      codec: e,
      numberOfChannels: this.demuxer.audioInfo.numberOfChannels,
      sampleRate: this.demuxer.audioInfo.sampleRate
    }) : null;
  }
  getNumberOfChannels() {
    return p(this.demuxer.audioInfo), this.demuxer.audioInfo.numberOfChannels;
  }
  getSampleRate() {
    return p(this.demuxer.audioInfo), this.demuxer.audioInfo.sampleRate;
  }
  getTimeResolution() {
    return p(this.demuxer.audioInfo), this.demuxer.audioInfo.sampleRate;
  }
  isRelativeToUnixEpoch() {
    return !1;
  }
  getUnixTimeForTimestamp() {
    return null;
  }
  getPairingMask() {
    return 1n;
  }
  getBitrate() {
    return null;
  }
  getAverageBitrate() {
    return null;
  }
  async getDurationFromMetadata() {
    return p(this.demuxer.dataSize !== -1), this.demuxer.dataSize / this.demuxer.audioInfo.blockSizeInBytes / this.demuxer.audioInfo.sampleRate;
  }
  async getLiveRefreshInterval() {
    return null;
  }
  getName() {
    return null;
  }
  getLanguageCode() {
    return ke;
  }
  getDisposition() {
    return {
      ...yt
    };
  }
  async getPacketAtIndex(e, t) {
    p(e >= 0), p(this.demuxer.audioInfo);
    const i = e * ei * this.demuxer.audioInfo.blockSizeInBytes;
    if (i >= this.demuxer.dataSize)
      return null;
    const s = Math.min(ei * this.demuxer.audioInfo.blockSizeInBytes, this.demuxer.dataSize - i);
    if (this.demuxer.reader.fileSize === null) {
      let c = this.demuxer.reader.requestSlice(this.demuxer.dataStart + i, s);
      if (c instanceof Promise && (c = await c), !c)
        return null;
    }
    let n;
    if (t.metadataOnly)
      n = Re;
    else {
      let c = this.demuxer.reader.requestSlice(this.demuxer.dataStart + i, s);
      c instanceof Promise && (c = await c), p(c), n = N(c, s);
    }
    const a = e * ei / this.demuxer.audioInfo.sampleRate, o = s / this.demuxer.audioInfo.blockSizeInBytes / this.demuxer.audioInfo.sampleRate;
    return this.demuxer.lastKnownPacketIndex = Math.max(e, this.demuxer.lastKnownPacketIndex), new Z(n, "key", a, o, e, s);
  }
  getFirstPacket(e) {
    return this.getPacketAtIndex(0, e);
  }
  async getPacket(e, t) {
    p(this.demuxer.audioInfo);
    const i = Math.floor(Math.min(e * this.demuxer.audioInfo.sampleRate / ei, (this.demuxer.dataSize - 1) / (ei * this.demuxer.audioInfo.blockSizeInBytes)));
    if (i < 0)
      return null;
    const s = await this.getPacketAtIndex(i, t);
    if (s)
      return s;
    if (i === 0)
      return null;
    p(this.demuxer.reader.fileSize === null);
    let n = await this.getPacketAtIndex(this.demuxer.lastKnownPacketIndex, t);
    for (; n; ) {
      const a = await this.getNextPacket(n, t);
      if (!a)
        break;
      n = a;
    }
    return n;
  }
  getNextPacket(e, t) {
    p(this.demuxer.audioInfo);
    const i = Math.round(e.timestamp * this.demuxer.audioInfo.sampleRate / ei);
    return this.getPacketAtIndex(i + 1, t);
  }
  getKeyPacket(e, t) {
    return this.getPacket(e, t);
  }
  getNextKeyPacket(e, t) {
    return this.getNextPacket(e, t);
  }
}
const Ji = 7, Et = 9, gt = (r) => {
  const e = r.filePos, t = N(r, 9), i = new j(t);
  if (i.readBits(12) !== 4095 || (i.skipBits(1), i.readBits(2) !== 0))
    return null;
  const a = i.readBits(1), o = i.readBits(2) + 1, c = i.readBits(4);
  if (c === 15)
    return null;
  i.skipBits(1);
  const l = i.readBits(3);
  if (l === 0)
    throw new Error("ADTS frames with channel configuration 0 are not supported.");
  i.skipBits(1), i.skipBits(1), i.skipBits(1), i.skipBits(1);
  const u = i.readBits(13);
  i.skipBits(11);
  const d = i.readBits(2) + 1;
  if (d !== 1)
    throw new Error("ADTS frames with more than one AAC frame are not supported.");
  let f = null;
  return a === 1 ? r.filePos -= 2 : f = i.readBits(16), {
    objectType: o,
    samplingFrequencyIndex: c,
    channelConfiguration: l,
    frameLength: u,
    numberOfAacFrames: d,
    crcCheck: f,
    startPos: e
  };
};
const Ur = 1024;
class ju extends bt {
  constructor(e) {
    super(e), this.metadataPromise = null, this.firstFrameHeader = null, this.loadedSamples = [], this.metadataTags = null, this.trackBackings = [], this.readingMutex = new Yt(), this.lastSampleLoaded = !1, this.lastLoadedPos = 0, this.nextTimestampInSamples = 0, this.reader = e._reader;
  }
  async readMetadata() {
    return this.metadataPromise ??= (async () => {
      for (; !this.firstFrameHeader && !this.lastSampleLoaded; )
        await this.advanceReader();
      p(this.firstFrameHeader), this.trackBackings = [new Ku(this)];
    })();
  }
  async advanceReader() {
    if (this.lastLoadedPos === 0)
      for (; ; ) {
        let a = this.reader.requestSlice(this.lastLoadedPos, Ne);
        if (a instanceof Promise && (a = await a), !a) {
          this.lastSampleLoaded = !0;
          return;
        }
        const o = wt(a);
        if (!o)
          break;
        this.lastLoadedPos = a.filePos + o.size;
      }
    let e = this.reader.requestSliceRange(this.lastLoadedPos, Ji, Et);
    if (e instanceof Promise && (e = await e), !e) {
      this.lastSampleLoaded = !0;
      return;
    }
    const t = gt(e);
    if (!t) {
      this.lastSampleLoaded = !0;
      return;
    }
    if (this.reader.fileSize !== null && t.startPos + t.frameLength > this.reader.fileSize) {
      this.lastSampleLoaded = !0;
      return;
    }
    this.firstFrameHeader || (this.firstFrameHeader = t);
    const i = Ft[t.samplingFrequencyIndex];
    p(i !== void 0);
    const s = Ur / i, n = {
      timestamp: this.nextTimestampInSamples / i,
      duration: s,
      dataStart: t.startPos,
      dataSize: t.frameLength
    };
    this.loadedSamples.push(n), this.nextTimestampInSamples += Ur, this.lastLoadedPos = t.startPos + t.frameLength;
  }
  async getMimeType() {
    return "audio/aac";
  }
  async getTrackBackings() {
    return await this.readMetadata(), this.trackBackings;
  }
  async getMetadataTags() {
    const e = await this.readingMutex.acquire();
    try {
      if (await this.readMetadata(), this.metadataTags)
        return this.metadataTags;
      this.metadataTags = {};
      let t = 0;
      for (; ; ) {
        let i = this.reader.requestSlice(t, Ne);
        if (i instanceof Promise && (i = await i), !i)
          break;
        const s = wt(i);
        if (!s)
          break;
        let n = this.reader.requestSlice(i.filePos, s.size);
        if (n instanceof Promise && (n = await n), !n)
          break;
        as(n, s, this.metadataTags), t = i.filePos + s.size;
      }
      return this.metadataTags;
    } finally {
      e();
    }
  }
}
class Ku {
  constructor(e) {
    this.demuxer = e;
  }
  getType() {
    return "audio";
  }
  getId() {
    return 1;
  }
  getNumber() {
    return 1;
  }
  getTimeResolution() {
    return this.getSampleRate() / Ur;
  }
  isRelativeToUnixEpoch() {
    return !1;
  }
  getUnixTimeForTimestamp() {
    return null;
  }
  getPairingMask() {
    return 1n;
  }
  getBitrate() {
    return null;
  }
  getAverageBitrate() {
    return null;
  }
  async getDurationFromMetadata() {
    return null;
  }
  async getLiveRefreshInterval() {
    return null;
  }
  getName() {
    return null;
  }
  getLanguageCode() {
    return ke;
  }
  getCodec() {
    return "aac";
  }
  getInternalCodecId() {
    return p(this.demuxer.firstFrameHeader), this.demuxer.firstFrameHeader.objectType;
  }
  getNumberOfChannels() {
    p(this.demuxer.firstFrameHeader);
    const e = Ai[this.demuxer.firstFrameHeader.channelConfiguration];
    return p(e !== void 0), e;
  }
  getSampleRate() {
    p(this.demuxer.firstFrameHeader);
    const e = Ft[this.demuxer.firstFrameHeader.samplingFrequencyIndex];
    return p(e !== void 0), e;
  }
  getDisposition() {
    return {
      ...yt
    };
  }
  async getDecoderConfig() {
    return p(this.demuxer.firstFrameHeader), {
      codec: `mp4a.40.${this.demuxer.firstFrameHeader.objectType}`,
      numberOfChannels: this.getNumberOfChannels(),
      sampleRate: this.getSampleRate()
    };
  }
  async getPacketAtIndex(e, t) {
    if (e === -1)
      return null;
    const i = this.demuxer.loadedSamples[e];
    if (!i)
      return null;
    let s;
    if (t.metadataOnly)
      s = Re;
    else {
      let n = this.demuxer.reader.requestSlice(i.dataStart, i.dataSize);
      if (n instanceof Promise && (n = await n), !n)
        return null;
      s = N(n, i.dataSize);
    }
    return new Z(s, "key", i.timestamp, i.duration, e, i.dataSize);
  }
  getFirstPacket(e) {
    return this.getPacketAtIndex(0, e);
  }
  async getNextPacket(e, t) {
    const i = await this.demuxer.readingMutex.acquire();
    try {
      const s = ar(this.demuxer.loadedSamples, e.timestamp, (a) => a.timestamp);
      if (s === -1)
        throw new Error("Packet was not created from this track.");
      const n = s + 1;
      for (; n >= this.demuxer.loadedSamples.length && !this.demuxer.lastSampleLoaded; )
        await this.demuxer.advanceReader();
      return this.getPacketAtIndex(n, t);
    } finally {
      i();
    }
  }
  async getPacket(e, t) {
    const i = await this.demuxer.readingMutex.acquire();
    try {
      for (; ; ) {
        const s = $(this.demuxer.loadedSamples, e, (n) => n.timestamp);
        if (s === -1 && this.demuxer.loadedSamples.length > 0)
          return null;
        if (this.demuxer.lastSampleLoaded)
          return this.getPacketAtIndex(s, t);
        if (s >= 0 && s + 1 < this.demuxer.loadedSamples.length)
          return this.getPacketAtIndex(s, t);
        await this.demuxer.advanceReader();
      }
    } finally {
      i();
    }
  }
  getKeyPacket(e, t) {
    return this.getPacket(e, t);
  }
  getNextKeyPacket(e, t) {
    return this.getNextPacket(e, t);
  }
}
const yc = (r) => r === 0 ? null : r === 1 ? 192 : r >= 2 && r <= 5 ? 144 * 2 ** r : r === 6 ? "uncommon-u8" : r === 7 ? "uncommon-u16" : r >= 8 && r <= 15 ? 2 ** r : null, Qu = (r, e) => {
  switch (r) {
    case 0:
      return e;
    case 1:
      return 88200;
    case 2:
      return 176400;
    case 3:
      return 192e3;
    case 4:
      return 8e3;
    case 5:
      return 16e3;
    case 6:
      return 22050;
    case 7:
      return 24e3;
    case 8:
      return 32e3;
    case 9:
      return 44100;
    case 10:
      return 48e3;
    case 11:
      return 96e3;
    case 12:
      return "uncommon-u8";
    case 13:
      return "uncommon-u16";
    case 14:
      return "uncommon-u16-10";
    default:
      return null;
  }
}, bc = (r) => {
  let e = 0;
  const t = new j(N(r, 1));
  for (; t.readBits(1) === 1; )
    e++;
  if (e === 0)
    return t.readBits(7);
  const i = [], s = e - 1, n = new j(N(r, s)), a = 8 - e - 1;
  for (let c = 0; c < a; c++)
    i.unshift(t.readBits(1));
  for (let c = 0; c < s; c++)
    for (let l = 0; l < 8; l++) {
      const u = n.readBits(1);
      l < 2 || i.unshift(u);
    }
  return i.reduce((c, l, u) => c | l << u, 0);
}, kc = (r, e) => {
  if (e === "uncommon-u16")
    return ue(r) + 1;
  if (e === "uncommon-u8")
    return U(r) + 1;
  if (typeof e == "number")
    return e;
  pe(e), p(!1);
}, $u = (r, e) => e === "uncommon-u16" ? ue(r) : e === "uncommon-u16-10" ? ue(r) * 10 : e === "uncommon-u8" ? U(r) : typeof e == "number" ? e : null, Gu = (r) => {
  let t = 0;
  for (const i of r) {
    t ^= i;
    for (let s = 0; s < 8; s++)
      (t & 128) !== 0 ? t = t << 1 ^ 7 : t <<= 1, t &= 255;
  }
  return t;
};
class Xu extends bt {
  constructor(e) {
    super(e), this.loadedSamples = [], this.metadataPromise = null, this.trackBacking = null, this.metadataTags = {}, this.audioInfo = null, this.lastLoadedPos = null, this.blockingBit = null, this.readingMutex = new Yt(), this.lastSampleLoaded = !1, this.reader = e._reader;
  }
  async getMetadataTags() {
    return await this.readMetadata(), this.metadataTags;
  }
  async getTrackBackings() {
    return await this.readMetadata(), p(this.trackBacking), [this.trackBacking];
  }
  async getMimeType() {
    return "audio/flac";
  }
  async readMetadata() {
    return this.metadataPromise ??= (async () => {
      let e = 0;
      for (; ; ) {
        let t = this.reader.requestSlice(e, Ne);
        if (t instanceof Promise && (t = await t), !t) {
          this.lastSampleLoaded = !0;
          return;
        }
        const i = wt(t);
        if (!i)
          break;
        let s = this.reader.requestSlice(t.filePos, i.size);
        s instanceof Promise && (s = await s), p(s), as(s, i, this.metadataTags), e = t.filePos + i.size;
      }
      for (e += 4; this.reader.fileSize === null || e < this.reader.fileSize; ) {
        let t = this.reader.requestSlice(e, 4);
        if (t instanceof Promise && (t = await t), e += 4, t === null)
          throw new Error(`Metadata block at position ${e} is too small! Corrupted file.`);
        p(t);
        const i = U(t), s = at(t), n = (i & 128) !== 0;
        switch (i & 127) {
          case mt.STREAMINFO: {
            let o = this.reader.requestSlice(e, s);
            if (o instanceof Promise && (o = await o), p(o), o === null)
              throw new Error(`StreamInfo block at position ${e} is too small! Corrupted file.`);
            const c = N(o, 34), l = new j(c), u = l.readBits(16), d = l.readBits(16), f = l.readBits(24), h = l.readBits(24), g = l.readBits(20), m = l.readBits(3) + 1;
            l.readBits(5);
            const w = l.readBits(36);
            l.skipBits(128);
            const y = new Uint8Array(42);
            y.set(new Uint8Array([102, 76, 97, 67]), 0), y.set(new Uint8Array([128, 0, 0, 34]), 4), y.set(c, 8), this.audioInfo = {
              numberOfChannels: m,
              sampleRate: g,
              totalSamples: w,
              minimumBlockSize: u,
              maximumBlockSize: d,
              minimumFrameSize: f,
              maximumFrameSize: h,
              description: y
            }, this.trackBacking = new Yu(this);
            break;
          }
          case mt.VORBIS_COMMENT: {
            let o = this.reader.requestSlice(e, s);
            o instanceof Promise && (o = await o), p(o), $s(N(o, s), this.metadataTags);
            break;
          }
          case mt.PICTURE: {
            let o = this.reader.requestSlice(e, s);
            o instanceof Promise && (o = await o), p(o);
            const c = B(o), l = B(o), u = ve.decode(N(o, l)), d = B(o), f = ve.decode(N(o, d));
            o.skip(16);
            const h = B(o), g = N(o, h);
            this.metadataTags.images ??= [], this.metadataTags.images.push({
              data: g,
              mimeType: u,
              // https://www.rfc-editor.org/rfc/rfc9639.html#table13
              kind: c === 3 ? "coverFront" : c === 4 ? "coverBack" : "unknown",
              description: f
            });
            break;
          }
        }
        if (e += s, n) {
          this.lastLoadedPos = e;
          break;
        }
      }
      if (!this.audioInfo)
        throw new Error("Missing STREAMINFO metadata block! Corrupted FLAC file.");
    })();
  }
  async readNextFlacFrame({ startPos: e, isFirstPacket: t }) {
    p(this.audioInfo);
    const i = 6, s = 16, n = 10, a = this.audioInfo.maximumBlockSize * this.audioInfo.numberOfChannels * 4 + s + 2, o = this.audioInfo.minimumFrameSize || n, l = (this.audioInfo.maximumFrameSize || a) + s, u = await this.reader.requestSliceRange(e, s, l);
    if (!u)
      return null;
    const d = this.readFlacFrameHeader({
      slice: u,
      isFirstPacket: t
    });
    if (!d)
      return null;
    for (u.filePos = e + o; ; ) {
      if (u.filePos > u.end - i)
        return {
          num: d.num,
          blockSize: d.blockSize,
          sampleRate: d.sampleRate,
          size: u.end - e,
          isLastFrame: !0
        };
      if (U(u) === 255) {
        const h = u.filePos, g = U(u), m = this.blockingBit === 1 ? 249 : 248;
        if (g !== m) {
          u.filePos = h;
          continue;
        }
        u.skip(-2);
        const w = u.filePos - e, y = this.readFlacFrameHeader({
          slice: u,
          isFirstPacket: !1
        });
        if (!y) {
          u.filePos = h;
          continue;
        }
        if (this.blockingBit === 0) {
          if (y.num - d.num !== 1) {
            u.filePos = h;
            continue;
          }
        } else if (y.num - d.num !== d.blockSize) {
          u.filePos = h;
          continue;
        }
        return {
          num: d.num,
          blockSize: d.blockSize,
          sampleRate: d.sampleRate,
          size: w,
          isLastFrame: !1
        };
      }
    }
  }
  readFlacFrameHeader({ slice: e, isFirstPacket: t }) {
    const i = e.filePos, s = N(e, 4), n = new j(s);
    if (n.readBits(15) !== 32764)
      return null;
    if (this.blockingBit === null) {
      p(t);
      const w = n.readBits(1);
      this.blockingBit = w;
    } else if (this.blockingBit === 1) {
      if (p(!t), n.readBits(1) !== 1)
        return null;
    } else if (this.blockingBit === 0) {
      if (p(!t), n.readBits(1) !== 0)
        return null;
    } else
      throw new Error("Invalid blocking bit");
    const o = yc(n.readBits(4));
    if (!o)
      return null;
    p(this.audioInfo);
    const c = Qu(n.readBits(4), this.audioInfo.sampleRate);
    if (!c || (n.readBits(4), n.readBits(3), n.readBits(1) !== 0))
      return null;
    const u = bc(e), d = kc(e, o), f = $u(e, c);
    if (f === null || f !== this.audioInfo.sampleRate)
      return null;
    const h = e.filePos - i, g = U(e);
    e.skip(-h), e.skip(-1);
    const m = Gu(N(e, h));
    return g !== m ? null : { num: u, blockSize: d, sampleRate: f };
  }
  async advanceReader() {
    await this.readMetadata(), p(this.lastLoadedPos !== null), p(this.audioInfo);
    const e = this.lastLoadedPos, t = await this.readNextFlacFrame({
      startPos: e,
      isFirstPacket: this.loadedSamples.length === 0
    });
    if (!t) {
      this.lastSampleLoaded = !0;
      return;
    }
    const i = this.loadedSamples[this.loadedSamples.length - 1], n = {
      blockOffset: i ? i.blockOffset + i.blockSize : 0,
      blockSize: t.blockSize,
      byteOffset: e,
      byteSize: t.size
    };
    if (this.lastLoadedPos = this.lastLoadedPos + t.size, this.loadedSamples.push(n), t.isLastFrame) {
      this.lastSampleLoaded = !0;
      return;
    }
  }
}
class Yu {
  constructor(e) {
    this.demuxer = e;
  }
  getType() {
    return "audio";
  }
  getId() {
    return 1;
  }
  getNumber() {
    return 1;
  }
  getCodec() {
    return "flac";
  }
  getInternalCodecId() {
    return null;
  }
  getNumberOfChannels() {
    return p(this.demuxer.audioInfo), this.demuxer.audioInfo.numberOfChannels;
  }
  getSampleRate() {
    return p(this.demuxer.audioInfo), this.demuxer.audioInfo.sampleRate;
  }
  getName() {
    return null;
  }
  getLanguageCode() {
    return ke;
  }
  getTimeResolution() {
    return p(this.demuxer.audioInfo), this.demuxer.audioInfo.sampleRate;
  }
  isRelativeToUnixEpoch() {
    return !1;
  }
  getUnixTimeForTimestamp() {
    return null;
  }
  getPairingMask() {
    return 1n;
  }
  getBitrate() {
    return null;
  }
  getAverageBitrate() {
    return null;
  }
  async getDurationFromMetadata() {
    return p(this.demuxer.audioInfo), this.demuxer.audioInfo.totalSamples === 0 ? null : this.demuxer.audioInfo.totalSamples / this.demuxer.audioInfo.sampleRate;
  }
  async getLiveRefreshInterval() {
    return null;
  }
  getDisposition() {
    return {
      ...yt
    };
  }
  async getDecoderConfig() {
    return p(this.demuxer.audioInfo), {
      codec: "flac",
      numberOfChannels: this.demuxer.audioInfo.numberOfChannels,
      sampleRate: this.demuxer.audioInfo.sampleRate,
      description: this.demuxer.audioInfo.description
    };
  }
  async getPacket(e, t) {
    if (p(this.demuxer.audioInfo), e < 0)
      return null;
    const i = await this.demuxer.readingMutex.acquire();
    try {
      for (; ; ) {
        const s = $(this.demuxer.loadedSamples, e, (c) => c.blockOffset / this.demuxer.audioInfo.sampleRate);
        if (s === -1) {
          await this.demuxer.advanceReader();
          continue;
        }
        const n = this.demuxer.loadedSamples[s], a = n.blockOffset / this.demuxer.audioInfo.sampleRate, o = n.blockSize / this.demuxer.audioInfo.sampleRate;
        if (a + o <= e) {
          if (this.demuxer.lastSampleLoaded)
            return this.getPacketAtIndex(this.demuxer.loadedSamples.length - 1, t);
          await this.demuxer.advanceReader();
          continue;
        }
        return this.getPacketAtIndex(s, t);
      }
    } finally {
      i();
    }
  }
  async getNextPacket(e, t) {
    const i = await this.demuxer.readingMutex.acquire();
    try {
      const s = e.sequenceNumber + 1;
      if (this.demuxer.lastSampleLoaded && s >= this.demuxer.loadedSamples.length)
        return null;
      for (; s >= this.demuxer.loadedSamples.length && !this.demuxer.lastSampleLoaded; )
        await this.demuxer.advanceReader();
      return this.getPacketAtIndex(s, t);
    } finally {
      i();
    }
  }
  getKeyPacket(e, t) {
    return this.getPacket(e, t);
  }
  getNextKeyPacket(e, t) {
    return this.getNextPacket(e, t);
  }
  async getPacketAtIndex(e, t) {
    const i = this.demuxer.loadedSamples[e];
    if (!i)
      return null;
    let s;
    if (t.metadataOnly)
      s = Re;
    else {
      let o = this.demuxer.reader.requestSlice(i.byteOffset, i.byteSize);
      if (o instanceof Promise && (o = await o), !o)
        return null;
      s = N(o, i.byteSize);
    }
    p(this.demuxer.audioInfo);
    const n = i.blockOffset / this.demuxer.audioInfo.sampleRate, a = i.blockSize / this.demuxer.audioInfo.sampleRate;
    return new Z(s, "key", n, a, e, i.byteSize);
  }
  async getFirstPacket(e) {
    for (; this.demuxer.loadedSamples.length === 0 && !this.demuxer.lastSampleLoaded; )
      await this.demuxer.advanceReader();
    return this.getPacketAtIndex(0, e);
  }
}
const qe = 9e4, _e = 188, Tc = (r) => {
  let e = "video/MP2T";
  const t = [...new Set(r.filter(Boolean))];
  return t.length > 0 && (e += `; codecs="${t.join(", ")}"`), e;
};
const Sc = "PES packet is missing PTS where it was expected. PES packets without PTS are not currently supported. If you think this file should be supported, please report it.", Ta = /* @__PURE__ */ new Set();
class Zu extends bt {
  constructor(e) {
    super(e), this.metadataPromise = null, this.elementaryStreams = [], this.trackBackingEntries = [], this.packetOffset = 0, this.packetStride = -1, this.sectionEndPositions = [], this.seekChunkSize = 5 * 1024 * 1024, this.minReferencePointByteDistance = -1, this.reader = e._reader;
  }
  async readMetadata() {
    return this.metadataPromise ??= (async () => {
      const e = _e + 16 + 1;
      let t = this.reader.requestSlice(0, e);
      t instanceof Promise && (t = await t), p(t);
      const i = N(t, e);
      if (i[0] === 71 && i[_e] === 71)
        this.packetOffset = 0, this.packetStride = _e;
      else if (i[0] === 71 && i[_e + 16] === 71)
        this.packetOffset = 0, this.packetStride = _e + 16;
      else if (i[4] === 71 && i[4 + _e + 4] === 71)
        this.packetOffset = 4, this.packetStride = _e + 4;
      else
        throw new Error("Unreachable.");
      const s = 256;
      this.minReferencePointByteDistance = s * this.packetStride;
      let n = this.packetOffset, a = null, o = !1, c = !1;
      for (; ; ) {
        const l = await this.readPacketHeader(n);
        if (!l)
          break;
        if (l.payloadUnitStartIndicator === 0) {
          n += this.packetStride;
          continue;
        }
        if (c && !this.elementaryStreams.some((m) => m.pid === l.pid)) {
          n += this.packetStride;
          continue;
        }
        const u = await this.readSection(n, !0, !c);
        if (!u)
          break;
        const d = 3, f = 32;
        let h = !1;
        if (!c && u.pid !== 0 && !(u.payload[0] === 0 && u.payload[1] === 0 && u.payload[2] === 1)) {
          const w = new j(u.payload), y = w.readAlignedByte();
          w.skipBits(8 * y), h = w.readBits(8) === 2;
        }
        if (u.pid === 0 && !o) {
          const m = new j(u.payload), w = m.readAlignedByte();
          m.skipBits(8 * w), m.skipBits(14);
          const y = m.readBits(10);
          for (m.skipBits(40); 8 * (y + d) - m.pos > f; ) {
            const b = m.readBits(16);
            m.skipBits(3);
            const k = m.readBits(13);
            if (b !== 0) {
              if (a !== null)
                throw new Error("Only files with a single program are supported.");
              a = k;
            }
          }
          if (a === null)
            throw new Error("Program Association Table must link to a Program Map Table.");
          o = !0;
        } else if ((u.pid === a || h) && !c) {
          const m = new j(u.payload), w = m.readAlignedByte();
          m.skipBits(8 * w), m.skipBits(12);
          const y = m.readBits(12);
          m.skipBits(43), m.readBits(13), m.skipBits(6);
          const b = m.readBits(10);
          for (m.skipBits(8 * b); 8 * (y + d) - m.pos > f; ) {
            const k = m.readBits(8);
            m.skipBits(3);
            const S = m.readBits(13);
            m.skipBits(6);
            const T = m.readBits(10), A = m.pos + 8 * T;
            let C = !1, _ = !1;
            for (; m.pos < A; ) {
              const I = m.readBits(8), E = m.readBits(8);
              I === 106 ? C = !0 : (I === 122 || I === 204) && (_ = !0), m.skipBits(8 * E);
            }
            let x = null;
            switch (k) {
              case 27:
              case 36:
                x = {
                  type: "video",
                  codec: k === 27 ? "avc" : "hevc",
                  decoderConfig: null,
                  avcCodecInfo: null,
                  hevcCodecInfo: null,
                  colorSpace: {
                    primaries: null,
                    transfer: null,
                    matrix: null,
                    fullRange: null
                  },
                  width: -1,
                  height: -1,
                  squarePixelWidth: -1,
                  squarePixelHeight: -1,
                  reorderSize: -1
                };
                break;
              case 3:
              case 4:
              case 15:
              case 129:
              case 135:
                {
                  let I;
                  if (k === 3 || k === 4)
                    I = "mp3";
                  else if (k === 15)
                    I = "aac";
                  else if (k === 129)
                    I = "ac3";
                  else if (k === 135)
                    I = "eac3";
                  else
                    throw new Error("Unreachable.");
                  x = {
                    type: "audio",
                    codec: I,
                    decoderConfig: null,
                    aacCodecInfo: null,
                    numberOfChannels: -1,
                    sampleRate: -1
                  };
                }
                break;
              case 6:
                _ ? x = {
                  type: "audio",
                  codec: "eac3",
                  decoderConfig: null,
                  aacCodecInfo: null,
                  numberOfChannels: -1,
                  sampleRate: -1
                } : C && (x = {
                  type: "audio",
                  codec: "ac3",
                  decoderConfig: null,
                  aacCodecInfo: null,
                  numberOfChannels: -1,
                  sampleRate: -1
                });
                break;
              default:
                Ta.has(k) || (D._warn(`Note: MPEG-TS streams with stream_type 0x${k.toString(16)} are not currently supported.`), Ta.add(k));
            }
            x && this.elementaryStreams.push({
              demuxer: this,
              pid: S,
              streamType: k,
              initialized: !1,
              firstSection: null,
              canBeTrustedWithKeyPackets: !1,
              info: x,
              referencePesPackets: []
            });
          }
          c = !0;
        } else {
          const m = this.elementaryStreams.find((w) => w.pid === u.pid);
          e: if (m && !m.initialized) {
            const w = ci(u, !0);
            if (!w)
              throw new Error(`Couldn't read first PES packet for Elementary Stream with PID ${m.pid}`);
            if (m.firstSection = u, m.canBeTrustedWithKeyPackets = u.randomAccessIndicator === 1, this.input._initInput) {
              const k = (await this.input._initInput._getDemuxer()).elementaryStreams.find((S) => S.pid === u.pid && S.info.codec === m.info.codec);
              if (k) {
                m.info = k.info, m.initialized = !0;
                break e;
              }
            }
            const y = new Vi(m, w);
            if (m.info.type === "video") {
              for (; ; ) {
                const b = y;
                if (b.suppliedPacket = null, await y.markNextPacket(), m.info.codec === "avc") {
                  if (!y.suppliedPacket)
                    throw new Error("Invalid AVC video stream; could not extract AVCDecoderConfigurationRecord from any packet.");
                  if (m.info.avcCodecInfo = vn(y.suppliedPacket.data), !m.info.avcCodecInfo)
                    continue;
                  const k = m.info.avcCodecInfo.sequenceParameterSets[0];
                  p(k);
                  const S = Fn(k);
                  m.info.width = S.displayWidth, m.info.height = S.displayHeight;
                  const T = S.pixelAspectRatio.num, A = S.pixelAspectRatio.den;
                  T > 0 && A > 0 && (T > A ? (m.info.squarePixelWidth = Math.round(m.info.width * T / A), m.info.squarePixelHeight = m.info.height) : (m.info.squarePixelWidth = m.info.width, m.info.squarePixelHeight = Math.round(m.info.height * A / T))), m.info.colorSpace = {
                    primaries: _r[S.colourPrimaries],
                    transfer: Ir[S.transferCharacteristics],
                    matrix: Er[S.matrixCoefficients],
                    fullRange: !!S.fullRangeFlag
                  }, m.info.reorderSize = S.maxDecFrameBuffering;
                  break;
                } else if (m.info.codec === "hevc") {
                  if (!y.suppliedPacket)
                    throw new Error("Invalid HEVC video stream; could not extract HVCDecoderConfigurationRecord from first packet.");
                  if (m.info.hevcCodecInfo = Bn(y.suppliedPacket.data), !m.info.hevcCodecInfo)
                    continue;
                  const S = m.info.hevcCodecInfo.arrays.find((A) => A.nalUnitType === se.SPS_NUT).nalUnits[0];
                  p(S);
                  const T = Wo(S);
                  m.info.width = T.displayWidth, m.info.height = T.displayHeight, T.pixelAspectRatio.num > T.pixelAspectRatio.den ? (m.info.squarePixelWidth = Math.round(m.info.width * T.pixelAspectRatio.num / T.pixelAspectRatio.den), m.info.squarePixelHeight = m.info.height) : (m.info.squarePixelWidth = m.info.width, m.info.squarePixelHeight = Math.round(m.info.height * T.pixelAspectRatio.den / T.pixelAspectRatio.num)), m.info.colorSpace = {
                    primaries: _r[T.colourPrimaries],
                    transfer: Ir[T.transferCharacteristics],
                    matrix: Er[T.matrixCoefficients],
                    fullRange: !!T.fullRangeFlag
                  }, m.info.reorderSize = T.maxDecFrameBuffering;
                  break;
                } else
                  throw new Error("Unhandled.");
              }
              m.info.decoderConfig = {
                codec: Pn({
                  width: m.info.width,
                  height: m.info.height,
                  codec: m.info.codec,
                  codecDescription: null,
                  colorSpace: m.info.colorSpace,
                  avcType: 1,
                  avcCodecInfo: m.info.avcCodecInfo,
                  hevcCodecInfo: m.info.hevcCodecInfo,
                  vp9CodecInfo: null,
                  av1CodecInfo: null,
                  proresFormat: null
                }),
                codedWidth: m.info.width,
                codedHeight: m.info.height,
                colorSpace: m.info.colorSpace
              }, (m.info.width !== m.info.squarePixelWidth || m.info.height !== m.info.squarePixelHeight) && (m.info.decoderConfig.displayAspectWidth = m.info.squarePixelWidth, m.info.decoderConfig.displayAspectHeight = m.info.squarePixelHeight), m.initialized = !0;
            } else {
              if (await y.markNextPacket(), !y.suppliedPacket)
                throw new Error(`Couldn't parse first media packet for Elementary Stream with PID ${m.pid}`);
              if (m.info.codec === "aac") {
                const b = Ce.tempFromBytes(y.suppliedPacket.data), k = gt(b);
                if (!k)
                  throw new Error("Invalid AAC audio stream; could not read ADTS frame header from first packet.");
                m.info.aacCodecInfo = {
                  isMpeg2: !1,
                  objectType: k.objectType
                }, m.info.numberOfChannels = Ai[k.channelConfiguration], m.info.sampleRate = Ft[k.samplingFrequencyIndex];
              } else if (m.info.codec === "mp3") {
                const b = B(Ce.tempFromBytes(y.suppliedPacket.data)), k = Xi(b, y.suppliedPacket.data.byteLength);
                if (!k.header)
                  throw new Error("Invalid MP3 audio stream; could not read frame header from first packet.");
                m.info.numberOfChannels = Yi(k.header.channel), m.info.sampleRate = k.header.sampleRate;
              } else if (m.info.codec === "ac3") {
                const b = Ko(y.suppliedPacket.data);
                if (!b)
                  throw new Error("Invalid AC-3 audio stream; could not read sync frame from first packet.");
                if (b.fscod === 3)
                  throw new Error("Invalid AC-3 audio stream; reserved sample rate code found in first packet.");
                m.info.numberOfChannels = Rn[b.acmod] + b.lfeon, m.info.sampleRate = Yr[b.fscod];
              } else if (m.info.codec === "eac3") {
                const b = $o(y.suppliedPacket.data);
                if (!b)
                  throw new Error("Invalid E-AC-3 audio stream; could not read sync frame from first packet.");
                const k = Go(b);
                if (k === null)
                  throw new Error("Invalid E-AC-3 audio stream; reserved sample rate code found in first packet.");
                m.info.numberOfChannels = Xo(b), m.info.sampleRate = k;
              } else
                throw new Error("Unhandled.");
              m.info.decoderConfig = {
                codec: Cn({
                  codec: m.info.codec,
                  codecDescription: null,
                  aacCodecInfo: m.info.aacCodecInfo
                }),
                numberOfChannels: m.info.numberOfChannels,
                sampleRate: m.info.sampleRate
              }, m.initialized = !0;
            }
          }
        }
        if (c && this.elementaryStreams.every((m) => m.initialized))
          break;
        n += this.packetStride;
      }
      if (!c)
        throw o ? new Error("No Program Map Table found in the file.") : new Error("No Program Association Table found in the file.");
      for (const l of this.elementaryStreams)
        l.initialized && (l.info.type === "video" ? this.trackBackingEntries.push(new Ju(l)) : this.trackBackingEntries.push(new ed(l)));
    })();
  }
  async getTrackBackings() {
    return await this.readMetadata(), this.trackBackingEntries;
  }
  async getMetadataTags() {
    return {};
  }
  async getMimeType() {
    await this.readMetadata();
    const e = await Promise.all(this.trackBackingEntries.map((t) => t.getDecoderConfig().then((i) => i?.codec ?? null)));
    return Tc(e);
  }
  async readSection(e, t, i = !1) {
    let s = e, n = e;
    const a = [];
    let o = 0, c = null, l = !0, u = 0;
    for (; ; ) {
      const f = await this.readPacket(n);
      if (n += this.packetStride, !f)
        break;
      if (c) {
        if (f.pid !== c.pid) {
          if (i)
            break;
          continue;
        }
        if (f.payloadUnitStartIndicator === 1)
          break;
      } else {
        if (f.payloadUnitStartIndicator === 0)
          break;
        c = f;
      }
      const h = !!(f.adaptationFieldControl & 2), g = !!(f.adaptationFieldControl & 1);
      let m = 0;
      if (h && (m = 1 + f.body[0], f === c && m > 1 && (u = f.body[1] >> 6 & 1)), g && (m === 0 ? (a.push(f.body), o += f.body.byteLength) : (a.push(f.body.subarray(m)), o += f.body.byteLength - m)), s = n, !t && o >= 64) {
        l = !1;
        break;
      }
      if (ar(this.sectionEndPositions, s, (y) => y) !== -1) {
        l = !1;
        break;
      }
    }
    if (l) {
      const f = $(this.sectionEndPositions, s, (h) => h);
      this.sectionEndPositions.splice(f + 1, 0, s);
    }
    if (!c)
      return null;
    let d;
    if (a.length === 1)
      d = a[0];
    else {
      const f = a.reduce((g, m) => g + m.length, 0);
      d = new Uint8Array(f);
      let h = 0;
      for (const g of a)
        d.set(g, h), h += g.length;
    }
    return {
      startPos: e,
      endPos: t ? s : null,
      pid: c.pid,
      payload: d,
      randomAccessIndicator: u
    };
  }
  async readPacketHeader(e) {
    let t = this.reader.requestSlice(e, 4);
    if (t instanceof Promise && (t = await t), !t)
      return null;
    if (U(t) !== 71)
      throw new Error("Invalid TS packet sync byte. Likely an internal bug, please report this file.");
    const s = ue(t), n = s >> 14 & 1, a = s & 8191, c = U(t) >> 4 & 3;
    return {
      payloadUnitStartIndicator: n,
      pid: a,
      adaptationFieldControl: c
    };
  }
  async readPacket(e) {
    let t = this.reader.requestSlice(e, _e);
    if (t instanceof Promise && (t = await t), !t)
      return null;
    const i = N(t, _e);
    if (i[0] !== 71)
      throw new Error("Invalid TS packet sync byte. Likely an internal bug, please report this file.");
    const n = (i[1] << 8) + i[2], a = n >> 14 & 1, o = n & 8191, l = i[3] >> 4 & 3;
    return {
      payloadUnitStartIndicator: a,
      pid: o,
      adaptationFieldControl: l,
      body: i.subarray(4)
    };
  }
}
const Dt = (r, e) => {
  if (r.payload.byteLength < 3)
    return null;
  const t = new j(r.payload);
  if (t.readBits(24) !== 1)
    return null;
  const s = t.readBits(8);
  if (t.skipBits(16), s === 188 || s === 190 || s === 191 || s === 240 || s === 241 || s === 255 || s === 242 || s === 248)
    return null;
  t.skipBits(8);
  const n = t.readBits(2);
  t.skipBits(14);
  let a = null;
  if (n === 2 || n === 3)
    a = 0, t.skipBits(4), a += t.readBits(3) * (1 << 30), t.skipBits(1), a += t.readBits(15) * 32768, t.skipBits(1), a += t.readBits(15);
  else if (e)
    throw new Error(Sc);
  return {
    sectionStartPos: r.startPos,
    sectionEndPos: r.endPos,
    pts: a,
    randomAccessIndicator: r.randomAccessIndicator
  };
}, ci = (r, e) => {
  p(r.endPos !== null);
  const t = Dt(r, e);
  if (!t)
    return null;
  const i = new j(r.payload);
  i.skipBits(32);
  const s = i.readBits(16), n = 6;
  i.skipBits(16);
  const a = i.readBits(8), o = i.pos + 8 * a;
  i.pos = o;
  const c = o / 8;
  p(Number.isInteger(c));
  const l = r.payload.subarray(
    c,
    // "A value of 0 indicates that the PES packet length is neither specified nor bounded and is allowed only in
    // PES packets whose payload consists of bytes from a video elementary stream contained in
    // transport stream packets."
    s > 0 ? n + s : r.payload.byteLength
  );
  return {
    ...t,
    data: l
  };
};
class ts {
  constructor(e) {
    this.elementaryStream = e, this.packetBuffers = /* @__PURE__ */ new WeakMap(), this.packetSectionStarts = /* @__PURE__ */ new WeakMap();
  }
  getId() {
    return this.elementaryStream.pid;
  }
  getNumber() {
    const e = this.elementaryStream.demuxer, t = this.elementaryStream.info.type;
    let i = 0;
    for (const s of e.trackBackingEntries)
      if (s.getType() === t && i++, p(s instanceof ts), s.elementaryStream === this.elementaryStream)
        break;
    return i;
  }
  getCodec() {
    throw new Error("Not implemented on base class.");
  }
  getInternalCodecId() {
    return this.elementaryStream.streamType;
  }
  getName() {
    return null;
  }
  getLanguageCode() {
    return ke;
  }
  getDisposition() {
    return {
      ...yt,
      primary: !1
    };
  }
  getTimeResolution() {
    return qe;
  }
  isRelativeToUnixEpoch() {
    return !1;
  }
  getUnixTimeForTimestamp() {
    return null;
  }
  getPairingMask() {
    return 1n;
  }
  getBitrate() {
    return null;
  }
  getAverageBitrate() {
    return null;
  }
  async getDurationFromMetadata() {
    return null;
  }
  async getLiveRefreshInterval() {
    return null;
  }
  createEncodedPacket(e, t, i) {
    let s;
    return this.allPacketsAreKeyPackets() ? s = "key" : s = e.randomAccessIndicator === 1 ? "key" : "delta", new Z(i.metadataOnly ? Re : e.data, s, e.pts / qe, Math.max(t / qe, 0), e.sequenceNumber, e.data.byteLength);
  }
  async getFirstPacket(e) {
    const t = this.elementaryStream.firstSection;
    p(t);
    const i = ci(t, !0);
    p(i);
    const s = new Vi(this.elementaryStream, i), n = new Ts(this, s), a = await n.readNext();
    if (!a)
      return null;
    const o = this.createEncodedPacket(a.packet, a.duration, e);
    return this.packetBuffers.set(o, n), this.packetSectionStarts.set(o, a.packet.sectionStartPos), o;
  }
  async getNextPacket(e, t) {
    let i = this.packetBuffers.get(e);
    if (i) {
      const u = await i.readNext();
      if (!u)
        return null;
      this.packetBuffers.delete(e);
      const d = this.createEncodedPacket(u.packet, u.duration, t);
      return this.packetBuffers.set(d, i), this.packetSectionStarts.set(d, u.packet.sectionStartPos), d;
    }
    const s = this.packetSectionStarts.get(e);
    if (s === void 0)
      throw new Error("Packet was not created from this track.");
    const a = await this.elementaryStream.demuxer.readSection(s, !0);
    p(a);
    const o = ci(a, !0);
    p(o);
    const c = new Vi(this.elementaryStream, o);
    i = new Ts(this, c);
    const l = e.sequenceNumber;
    for (; ; ) {
      const u = await i.readNext();
      if (!u)
        return null;
      if (u.packet.sequenceNumber > l) {
        const d = this.createEncodedPacket(u.packet, u.duration, t);
        return this.packetBuffers.set(d, i), this.packetSectionStarts.set(d, u.packet.sectionStartPos), d;
      }
    }
  }
  async getNextKeyPacket(e, t) {
    let i = e;
    for (; ; ) {
      if (i = await this.getNextPacket(i, t), !i)
        return null;
      if (i.type === "key")
        return i;
    }
  }
  getPacket(e, t) {
    return this.doPacketLookup(e, !1, t);
  }
  getKeyPacket(e, t) {
    return this.doPacketLookup(e, !0, t);
  }
  /**
   * Searches for the packet with the largest timestamp not larger than `timestamp` in the file, using a combination
   * of chunk-based binary search and linear refinement. The reason the coarse search is done in large chunks is to
   * make it more performant for small files and over high-latency readers such as the network.
   */
  async doPacketLookup(e, t, i) {
    const s = ji(e * qe), n = this.elementaryStream.demuxer, { reader: a, seekChunkSize: o } = n, c = this.elementaryStream.pid, l = async (S, T, A) => {
      let C = S;
      for (; C < T; ) {
        const _ = await n.readPacketHeader(C);
        if (!_)
          return null;
        if (_.pid === c && _.payloadUnitStartIndicator === 1) {
          const x = await n.readSection(C, A);
          if (!x)
            return null;
          const I = Dt(x, !1);
          if (I && I.pts !== null)
            return {
              pesPacketHeader: I,
              section: x
            };
        }
        C += n.packetStride;
      }
      return null;
    }, u = this.elementaryStream.firstSection;
    p(u);
    const d = Dt(u, !0);
    if (p(d), s < d.pts)
      return null;
    let f;
    const h = this.elementaryStream.referencePesPackets, g = $(h, s, (S) => S.pts), m = g !== -1 ? h[g] : null;
    if (m && s - m.pts < qe / 2)
      f = m.sectionStartPos;
    else {
      let S = 0;
      if (a.fileSize !== null) {
        const T = Math.ceil(a.fileSize / o);
        if (T > 1) {
          let A = 0, C = T - 1;
          for (S = A; A <= C; ) {
            const _ = Math.floor((A + C) / 2), x = ls(_ * o, n.packetStride) + d.sectionStartPos, I = x + o, E = await l(x, I, !1);
            if (!E) {
              C = _ - 1;
              continue;
            }
            E.pesPacketHeader.pts <= s ? (S = _, A = _ + 1) : C = _ - 1;
          }
        }
      }
      f = ls(S * o, n.packetStride) + d.sectionStartPos;
    }
    let y = (await l(f, a.fileSize ?? 1 / 0, !1))?.pesPacketHeader ?? null;
    y || (y = d);
    const b = this.getReorderSize(), k = async (S, T) => {
      const A = await n.readSection(S, !0);
      p(A);
      const C = ci(A, !0);
      p(C);
      const _ = new Vi(this.elementaryStream, C), x = new Ts(this, _);
      for (; !((ne(x.presentationOrderPackets)?.pts ?? -1 / 0) >= s || !await x.readNextPacket()); )
        ;
      const I = jr(x.presentationOrderPackets, T);
      if (I === -1)
        return null;
      const E = x.presentationOrderPackets[I], v = I === 0 ? 0 : E.pts - x.presentationOrderPackets[I - 1].pts;
      for (; x.decodeOrderPackets[0] !== E; )
        x.decodeOrderPackets.shift();
      x.lastDuration = v;
      const M = await x.readNext();
      p(M);
      const W = this.createEncodedPacket(M.packet, M.duration, i);
      return this.packetBuffers.set(W, x), this.packetSectionStarts.set(W, M.packet.sectionStartPos), W;
    };
    if (!t || this.allPacketsAreKeyPackets()) {
      e: for (; ; ) {
        let S = y.sectionStartPos + n.packetStride;
        for (; ; ) {
          const T = await n.readPacketHeader(S);
          if (!T)
            break e;
          if (T.pid === c && T.payloadUnitStartIndicator === 1) {
            const A = await n.readSection(S, !1);
            if (A) {
              const C = Dt(A, !1);
              if (C && C.pts !== null) {
                if (C.pts > s)
                  break e;
                y = C, rn(this.elementaryStream, y);
                break;
              }
            }
          }
          S += n.packetStride;
        }
      }
      e: for (let S = 0; S < b + 1; S++) {
        let T = y.sectionStartPos - n.packetStride;
        for (; T >= n.packetOffset; ) {
          const A = await n.readPacketHeader(T);
          if (!A)
            break e;
          if (A.pid === c && A.payloadUnitStartIndicator === 1) {
            const C = await n.readSection(T, !1);
            if (C) {
              const _ = Dt(C, !1);
              if (_ && _.pts !== null) {
                y = _;
                break;
              }
            }
          }
          T -= n.packetStride;
        }
      }
      return k(y.sectionStartPos, (S) => S.pts <= s);
    } else {
      let S = f, T = null;
      const A = !this.elementaryStream.canBeTrustedWithKeyPackets;
      for (; ; ) {
        let C = null;
        const _ = S <= d.sectionStartPos;
        let x, I = null;
        if (_)
          x = d, I = u;
        else {
          const M = await l(S, a.fileSize ?? 1 / 0, A);
          x = M?.pesPacketHeader ?? null, I = M?.section ?? null;
        }
        let E = !1, v = 0;
        e: for (; x && !(T !== null && x.sectionStartPos >= T); ) {
          if (x.pts <= s) {
            let W;
            if (this.elementaryStream.canBeTrustedWithKeyPackets)
              W = x.randomAccessIndicator === 1;
            else {
              p(I);
              const O = ci(I, !0);
              p(O);
              const z = new Vi(this.elementaryStream, O);
              await z.markNextPacket(), W = z.suppliedPacket?.randomAccessIndicator === 1;
            }
            W && (C = x);
          }
          if (x.pts > s && (E = !0), E && (v++, v > b))
            break;
          let M = x.sectionStartPos + n.packetStride;
          for (; ; ) {
            const W = await n.readPacketHeader(M);
            if (!W)
              break e;
            if (W.pid === c && W.payloadUnitStartIndicator === 1) {
              const O = await n.readSection(M, A);
              if (O) {
                const z = Dt(O, !1);
                if (z && z.pts !== null) {
                  x = z, I = O, rn(this.elementaryStream, x);
                  break;
                }
              }
            }
            M += n.packetStride;
          }
        }
        if (C) {
          let M = C;
          if (v === 0)
            e: for (let O = 0; O < b; O++) {
              let z = M.sectionStartPos - n.packetStride;
              for (; z >= n.packetOffset; ) {
                const Q = await n.readPacketHeader(z);
                if (!Q)
                  break e;
                if (Q.pid === c && Q.payloadUnitStartIndicator === 1) {
                  const J = await n.readSection(z, A);
                  if (J) {
                    const Te = Dt(J, !1);
                    if (Te && Te.pts !== null) {
                      M = Te;
                      break;
                    }
                  }
                }
                z -= n.packetStride;
              }
            }
          const W = await k(M.sectionStartPos, (O) => O.pts <= s && O.randomAccessIndicator === 1);
          return p(W), W;
        }
        if (_)
          return null;
        T = S, S = Math.max(ls(S - d.sectionStartPos - o, n.packetStride) + d.sectionStartPos, d.sectionStartPos);
      }
    }
  }
}
class Ju extends ts {
  getType() {
    return "video";
  }
  getCodec() {
    return this.elementaryStream.info.codec;
  }
  getCodedWidth() {
    return this.elementaryStream.info.width;
  }
  getCodedHeight() {
    return this.elementaryStream.info.height;
  }
  getSquarePixelWidth() {
    return this.elementaryStream.info.squarePixelWidth;
  }
  getSquarePixelHeight() {
    return this.elementaryStream.info.squarePixelHeight;
  }
  getRotation() {
    return 0;
  }
  async getColorSpace() {
    return this.elementaryStream.info.colorSpace;
  }
  async canBeTransparent() {
    return !1;
  }
  async getDecoderConfig() {
    return p(this.elementaryStream.info.decoderConfig), this.elementaryStream.info.decoderConfig;
  }
  allPacketsAreKeyPackets() {
    return !1;
  }
  getReorderSize() {
    return this.elementaryStream.info.reorderSize;
  }
}
class ed extends ts {
  getType() {
    return "audio";
  }
  getCodec() {
    return this.elementaryStream.info.codec;
  }
  getNumberOfChannels() {
    return this.elementaryStream.info.numberOfChannels;
  }
  getSampleRate() {
    return this.elementaryStream.info.sampleRate;
  }
  async getDecoderConfig() {
    return p(this.elementaryStream.info.decoderConfig), this.elementaryStream.info.decoderConfig;
  }
  allPacketsAreKeyPackets() {
    return !0;
  }
  getReorderSize() {
    return 0;
  }
}
const rn = (r, e) => {
  const t = r.referencePesPackets, i = $(t, e.sectionStartPos, (s) => s.sectionStartPos);
  if (i >= 0) {
    const s = t[i];
    if (e.pts <= s.pts)
      return !1;
    const n = r.demuxer.minReferencePointByteDistance;
    if (e.sectionStartPos - s.sectionStartPos < n)
      return !1;
    if (i < t.length - 1) {
      const a = t[i + 1];
      if (a.pts < e.pts || a.sectionStartPos - e.sectionStartPos < n)
        return !1;
    }
  }
  return t.splice(i + 1, 0, e), !0;
};
class Vi {
  constructor(e, t) {
    this.currentPos = 0, this.pesPackets = [], this.currentPesPacketIndex = 0, this.currentPesPacketPos = 0, this.endPos = 0, this.lastSuppliedPesPacket = null, this.nextPts = null, this.suppliedPacket = null, this.elementaryStream = e, this.pid = e.pid, this.demuxer = e.demuxer, this.startingPesPacket = t;
  }
  ensureBuffered(e) {
    const t = this.endPos - this.currentPos;
    return t >= e ? e : this.bufferData(e - t).then(() => Math.min(this.endPos - this.currentPos, e));
  }
  getCurrentPesPacket() {
    const e = this.pesPackets[this.currentPesPacketIndex];
    return p(e), e;
  }
  async bufferData(e) {
    const t = this.endPos + e;
    for (; this.endPos < t; ) {
      let i;
      if (this.pesPackets.length === 0)
        i = this.startingPesPacket;
      else {
        let s = ne(this.pesPackets).sectionEndPos;
        for (p(s !== null); ; ) {
          const n = await this.demuxer.readPacketHeader(s);
          if (!n)
            return;
          if (n.pid === this.pid) {
            const a = await this.demuxer.readSection(s, !0);
            if (!a)
              return;
            const o = ci(a, !1);
            if (o) {
              i = o;
              break;
            }
          }
          s += this.demuxer.packetStride;
        }
      }
      this.pesPackets.push(i), this.endPos += i.data.byteLength;
    }
  }
  readBytes(e) {
    const t = this.getCurrentPesPacket(), i = this.currentPos - this.currentPesPacketPos, s = i + e;
    if (this.currentPos += e, s <= t.data.byteLength)
      return t.data.subarray(i, s);
    const n = new Uint8Array(e);
    n.set(t.data.subarray(i));
    let a = t.data.byteLength - i;
    for (; ; ) {
      this.advanceCurrentPacket();
      const o = this.getCurrentPesPacket(), c = e - a;
      if (c <= o.data.byteLength) {
        n.set(o.data.subarray(0, c), a);
        break;
      }
      n.set(o.data, a), a += o.data.byteLength;
    }
    return n;
  }
  readU8() {
    let e = this.getCurrentPesPacket();
    const t = this.currentPos - this.currentPesPacketPos;
    return this.currentPos++, t < e.data.byteLength ? e.data[t] : (this.advanceCurrentPacket(), e = this.getCurrentPesPacket(), e.data[0]);
  }
  seekTo(e) {
    if (e !== this.currentPos) {
      if (e < this.currentPos)
        for (; e < this.currentPesPacketPos; ) {
          this.currentPesPacketIndex--;
          const t = this.getCurrentPesPacket();
          this.currentPesPacketPos -= t.data.byteLength;
        }
      else
        for (; ; ) {
          const t = this.getCurrentPesPacket(), i = this.currentPesPacketPos + t.data.byteLength;
          if (e < i)
            break;
          this.currentPesPacketPos += t.data.byteLength, this.currentPesPacketIndex++;
        }
      this.currentPos = e;
    }
  }
  skip(e) {
    this.seekTo(this.currentPos + e);
  }
  advanceCurrentPacket() {
    this.currentPesPacketPos += this.getCurrentPesPacket().data.byteLength, this.currentPesPacketIndex++;
  }
  async markNextPacket() {
    p(!this.suppliedPacket);
    const e = this.elementaryStream;
    if (e.info.type === "video") {
      const t = e.info.codec, i = 1024;
      if (t !== "avc" && t !== "hevc")
        throw new Error("Unhandled.");
      const s = t === "avc" ? 1 : 2;
      let n = null, a = !1, o = 0;
      for (; ; ) {
        let c = this.ensureBuffered(i);
        if (c instanceof Promise && (c = await c), c === 0)
          break;
        const l = this.currentPos, u = this.readBytes(c), d = u.byteLength;
        let f = 0;
        for (; f < d; ) {
          const h = u.indexOf(0, f);
          if (h === -1 || h >= d)
            break;
          f = h;
          const g = l + f;
          if (f + 3 >= d) {
            this.seekTo(g);
            break;
          }
          const m = u[f + 1], w = u[f + 2], y = u[f + 3];
          let b = 0;
          if (m === 0 && w === 0 && y === 1 ? b = 4 : m === 0 && w === 1 && (b = 3), b === 0) {
            f++;
            continue;
          }
          const k = g;
          n ??= k;
          const S = f + b, T = S + s, A = 6;
          if (T + (t === "avc" ? A : 1) > d) {
            this.seekTo(g);
            break;
          }
          const _ = u[S];
          let x, I, E;
          if (t === "avc")
            x = yi(_), I = x === me.NON_IDR_SLICE || x === me.SLICE_DPA || x === me.IDR, E = x === me.SEI || x === me.SPS || x === me.PPS || x === me.AUD;
          else {
            if (x = Bt(_), ((_ & 1) << 5 | u[S + 1] >> 3) > 0) {
              f += b;
              continue;
            }
            I = x <= se.RASL_R || x >= se.BLA_W_LP && x <= 21, E = x >= se.VPS_NUT && x <= 37 || x === se.PREFIX_SEI_NUT || x >= 41 && x <= 44 || x >= 48 && x <= 55;
          }
          let v = !1;
          if (I) {
            let M;
            if (t === "avc") {
              const W = u.subarray(T, T + A), O = R(new j(W));
              M = !a || O <= o, o = O;
            } else
              M = u[T] >> 7 === 1;
            M && (a ? v = !0 : a = !0);
          } else E && a && (v = !0);
          if (v) {
            const M = k - n;
            return this.seekTo(n), this.supplyPacket(M, 0);
          }
          f += b;
        }
        if (c < i)
          break;
      }
      if (n !== null && this.endPos > n) {
        const c = this.endPos - n;
        return this.seekTo(n), this.supplyPacket(c, 0);
      }
    } else {
      const t = e.info.codec, i = 128;
      for (; ; ) {
        let s = this.ensureBuffered(i);
        s instanceof Promise && (s = await s);
        const n = this.currentPos;
        for (; this.currentPos - n < s; ) {
          const a = this.readU8();
          if (t === "aac") {
            if (a !== 255)
              continue;
            this.skip(-1);
            const o = this.currentPos;
            let c = this.ensureBuffered(Et);
            if (c instanceof Promise && (c = await c), c < Et)
              return;
            const l = this.readBytes(Et), u = gt(Ce.tempFromBytes(l));
            if (u) {
              this.seekTo(o);
              let d = this.ensureBuffered(u.frameLength);
              return d instanceof Promise && (d = await d), this.supplyPacket(d, Math.round(Ur * qe / e.info.sampleRate));
            } else
              this.seekTo(o + 1);
          } else if (t === "mp3") {
            if (a !== 255)
              continue;
            this.skip(-1);
            const o = this.currentPos;
            let c = this.ensureBuffered(Kt);
            if (c instanceof Promise && (c = await c), c < Kt)
              return;
            const l = this.readBytes(Kt), u = q(l).getUint32(0), d = Xi(u, null);
            if (d.header) {
              this.seekTo(o);
              let f = this.ensureBuffered(d.header.totalSize);
              f instanceof Promise && (f = await f);
              const h = d.header.audioSamplesInFrame * qe / e.info.sampleRate;
              return this.supplyPacket(f, Math.round(h));
            } else
              this.seekTo(o + 1);
          } else if (t === "ac3") {
            if (a !== 11)
              continue;
            this.skip(-1);
            const o = this.currentPos;
            let c = this.ensureBuffered(5);
            if (c instanceof Promise && (c = await c), c < 5)
              return;
            const l = this.readBytes(5);
            if (l[0] !== 11 || l[1] !== 119) {
              this.seekTo(o + 1);
              continue;
            }
            const u = l[4] >> 6, d = l[4] & 63;
            if (u === 3 || d > 37) {
              this.seekTo(o + 1);
              continue;
            }
            const f = yu[3 * d + u];
            p(f !== void 0), this.seekTo(o), c = this.ensureBuffered(f), c instanceof Promise && (c = await c);
            const h = Math.round(bu * qe / e.info.sampleRate);
            return this.supplyPacket(c, h);
          } else if (t === "eac3") {
            if (a !== 11)
              continue;
            this.skip(-1);
            const o = this.currentPos;
            let c = this.ensureBuffered(5);
            if (c instanceof Promise && (c = await c), c < 5)
              return;
            const l = this.readBytes(5);
            if (l[0] !== 11 || l[1] !== 119) {
              this.seekTo(o + 1);
              continue;
            }
            const d = (((l[2] & 7) << 8 | l[3]) + 1) * 2, h = l[4] >> 6 === 3 ? 3 : l[4] >> 4 & 3, g = Qo[h];
            this.seekTo(o), c = this.ensureBuffered(d), c instanceof Promise && (c = await c);
            const m = g * 256, w = Math.round(m * qe / e.info.sampleRate);
            return this.supplyPacket(c, w);
          } else
            throw new Error("Unhandled.");
        }
        if (s < i)
          break;
      }
    }
  }
  /** Supplies the context with a new encoded packet, beginning at the current position. */
  supplyPacket(e, t) {
    const i = this.getCurrentPesPacket();
    let s;
    if (this.lastSuppliedPesPacket === i)
      p(this.nextPts !== null), s = this.nextPts;
    else {
      if (i.pts === null)
        throw new Error(Sc);
      s = i.pts, rn(this.elementaryStream, i);
    }
    this.lastSuppliedPesPacket = i, this.nextPts = s + t;
    const n = i.sectionStartPos, a = n + (this.currentPos - this.currentPesPacketPos), o = this.readBytes(e);
    let c = i.randomAccessIndicator;
    if (c === 0 && !this.elementaryStream.canBeTrustedWithKeyPackets) {
      if (this.elementaryStream.info.type === "audio")
        c = 1;
      else if (this.elementaryStream.info.decoderConfig) {
        const l = es(this.elementaryStream.info.codec, this.elementaryStream.info.decoderConfig, o) === "key";
        c = Number(l);
      }
    }
    this.suppliedPacket = {
      pts: s,
      data: o,
      sequenceNumber: a,
      sectionStartPos: n,
      randomAccessIndicator: c
    }, this.pesPackets.splice(0, this.currentPesPacketIndex), this.currentPesPacketIndex = 0;
  }
}
class Ts {
  constructor(e, t) {
    this.decodeOrderPackets = [], this.reorderBuffer = [], this.presentationOrderPackets = [], this.reachedEnd = !1, this.lastDuration = 0, this.backing = e, this.context = t, this.reorderSize = e.getReorderSize(), p(this.reorderSize >= 0);
  }
  async readNext() {
    if (this.decodeOrderPackets.length === 0 && !await this.readNextPacket())
      return null;
    await this.ensureCurrentPacketHasNext();
    const e = this.decodeOrderPackets[0], t = this.presentationOrderPackets.indexOf(e);
    p(t !== -1);
    let i;
    for (t === this.presentationOrderPackets.length - 1 ? i = this.lastDuration : (i = this.presentationOrderPackets[t + 1].pts - e.pts, this.lastDuration = i), this.decodeOrderPackets.shift(); this.presentationOrderPackets.length > 0; ) {
      const s = this.presentationOrderPackets[0];
      if (this.decodeOrderPackets.includes(s))
        break;
      this.presentationOrderPackets.shift();
    }
    return { packet: e, duration: i };
  }
  async readNextPacket() {
    if (this.reachedEnd)
      return !1;
    let e;
    return this.context.suppliedPacket ? e = this.context.suppliedPacket : (await this.context.markNextPacket(), e = this.context.suppliedPacket), this.context.suppliedPacket = null, e ? (this.decodeOrderPackets.push(e), this.processPacketThroughReorderBuffer(e), !0) : (this.reachedEnd = !0, this.flushReorderBuffer(), !1);
  }
  async ensureCurrentPacketHasNext() {
    const e = this.decodeOrderPackets[0];
    for (p(e); ; ) {
      const t = this.presentationOrderPackets.indexOf(e);
      if (t !== -1 && t <= this.presentationOrderPackets.length - 2 || !await this.readNextPacket())
        break;
    }
  }
  processPacketThroughReorderBuffer(e) {
    if (this.reorderBuffer.push(e), this.reorderBuffer.length > this.reorderSize) {
      let t = 0;
      for (let s = 1; s < this.reorderBuffer.length; s++)
        this.reorderBuffer[s].pts < this.reorderBuffer[t].pts && (t = s);
      const i = this.reorderBuffer[t];
      this.presentationOrderPackets.push(i), this.reorderBuffer.splice(t, 1);
    }
  }
  flushReorderBuffer() {
    this.reorderBuffer.sort((e, t) => e.pts - t.pts), this.presentationOrderPackets.push(...this.reorderBuffer), this.reorderBuffer.length = 0;
  }
}
const pi = "application/vnd.apple.mpegurl", Sa = "#EXT-X-STREAM-INF:", Aa = "#EXT-X-I-FRAME-STREAM-INF:", xa = "#EXT-X-MEDIA:", sn = "#EXTINF:", Pa = "#EXT-X-MAP:", Ca = "#EXT-X-KEY:", _a = "#EXT-X-MEDIA-SEQUENCE:", Ia = "#EXT-X-BYTERANGE:", Ea = "#EXT-X-PROGRAM-DATE-TIME:", td = "#EXT-X-DISCONTINUITY", va = "#EXT-X-TARGETDURATION:", id = "#EXT-X-ENDLIST", Fa = "#EXT-X-PLAYLIST-TYPE:", rd = "#EXT-X-I-FRAMES-ONLY", Ac = (r) => r.length === 0 || r.startsWith("#") && !r.startsWith("#EXT");
class qi {
  constructor(e) {
    this._attributes = {};
    let t = "", i = "", s = !1, n = !1;
    for (let a = 0; a < e.length; a++) {
      const o = e[a];
      o === '"' ? n = !n : o === "=" && !s && !n ? s = !0 : o === "," && !n ? (t && (this._attributes[t.trim().toLowerCase()] = i), t = "", i = "", s = !1) : s ? i += o : t += o;
    }
    t && (this._attributes[t.trim().toLowerCase()] = i);
  }
  get(e) {
    return this._attributes[e.toLowerCase()] ?? null;
  }
  getAsNumber(e) {
    const t = this.get(e);
    if (t === null)
      return null;
    const i = Number(t);
    return Number.isFinite(i) ? i : null;
  }
  merge(e) {
    Object.assign(this._attributes, e._attributes);
  }
}
class sd {
  constructor(e, t, i) {
    this.nextInputCacheAge = 0, this.inputCache = [], this.trackBackingsPromise = null, this.firstSegment = null, this.firstSegmentFirstTimestamps = /* @__PURE__ */ new WeakMap(), this.firstTimestampCache = /* @__PURE__ */ new WeakMap(), this.input = e, this.path = t, this.trackDeclarations = i;
  }
  async getDurationFromMetadata(e) {
    const t = await this.getSegmentAt(1 / 0, {
      skipLiveWait: e.skipLiveWait
    });
    return t ? t.timestamp + t.duration : null;
  }
  async getUnixTimeForTimestamp(e) {
    let t = await this.getSegmentAt(e, {});
    if (t ??= await this.getFirstSegment({}), !t || t.unixEpochTimestamp === null)
      return null;
    const i = e - t.timestamp;
    return t.unixEpochTimestamp + i;
  }
  async getTrackBackings() {
    return this.trackBackingsPromise ??= (async () => {
      const e = [];
      if (this.trackDeclarations) {
        for (const t of this.trackDeclarations)
          if (t.type === "video") {
            const i = Ui(e, (s) => s.getType() === "video") + 1;
            e.push(new Ba(this, t, i));
          } else if (t.type === "audio") {
            const i = Ui(e, (s) => s.getType() === "audio") + 1;
            e.push(new Ra(this, t, i));
          }
      } else {
        if (this.firstSegment = await this.getFirstSegment({}), !this.firstSegment)
          return [];
        const i = await this.getInputForSegment(this.firstSegment).getTracks();
        for (const s of i)
          if (s.type === "video") {
            const n = Ui(e, (a) => a.getType() === "video") + 1;
            e.push(new Ba(this, {
              id: e.length + 1,
              type: "video"
            }, n));
          } else if (s.type === "audio") {
            const n = Ui(e, (a) => a.getType() === "audio") + 1;
            e.push(new Ra(this, {
              id: e.length + 1,
              type: "audio"
            }, n));
          }
      }
      return e;
    })();
  }
  // This operation is done a lot and can be semi-expensive, so it's good to have a cache for it
  async getFirstTimestampForInput(e) {
    const t = this.firstTimestampCache.get(e);
    if (t !== void 0)
      return t;
    const i = await e.getFirstTimestamp();
    return this.firstTimestampCache.set(e, i), i;
  }
  async getMediaOffset(e, t) {
    const i = e.firstSegment ?? e;
    let s;
    if (this.firstSegmentFirstTimestamps.has(i))
      s = this.firstSegmentFirstTimestamps.get(i);
    else {
      const l = this.getInputForSegment(i);
      s = await this.getFirstTimestampForInput(l), this.firstSegmentFirstTimestamps.set(i, s);
    }
    if (i === e)
      return i.timestamp - s;
    const n = await this.getFirstTimestampForInput(t), a = e.timestamp - i.timestamp, c = n - s - a;
    return Math.abs(c) <= Math.min(0.25, a) ? i.timestamp - s : e.timestamp - n;
  }
  dispose() {
    for (const e of this.inputCache)
      e.input.dispose();
    this.inputCache.length = 0;
  }
}
class xc {
  constructor(e, t, i) {
    this.packetInfos = /* @__PURE__ */ new WeakMap(), this.hydrationPromise = null, this.firstInputTrack = null, this.firstSegment = null, this.segmentedInput = e, this.decl = t, this.number = i;
  }
  hydrate() {
    return this.hydrationPromise ??= (async () => {
      if (this.segmentedInput.firstSegment ??= await this.segmentedInput.getFirstSegment({}), !this.segmentedInput.firstSegment)
        throw new Error("Missing first segment, can't retrieve track.");
      let e = this.segmentedInput.firstSegment, t = null;
      for (; e && (t = (await this.segmentedInput.getInputForSegment(e).getTracks()).find((n) => n.type === this.decl.type && n.number === this.number) ?? null, !t); )
        e = await this.segmentedInput.getNextSegment(e, {});
      if (!t)
        throw new Error("No matching track found in underlying media data.");
      this.firstInputTrack = t, this.firstSegment = e;
    })();
  }
  getId() {
    return this.decl.id;
  }
  getType() {
    return this.decl.type;
  }
  getNumber() {
    return this.number;
  }
  /** If the backing track is already present, delegate synchronously; otherwise, hydrate first. */
  delegate(e) {
    return this.firstInputTrack ? e() : this.hydrate().then(e);
  }
  async getDecoderConfig() {
    return this.delegate(() => this.firstInputTrack._backing.getDecoderConfig());
  }
  getHasOnlyKeyPackets() {
    return this.delegate(() => this.firstInputTrack._backing.getHasOnlyKeyPackets?.() ?? null);
  }
  getPairingMask() {
    return 1n;
  }
  getCodec() {
    return this.delegate(() => this.firstInputTrack._backing.getCodec());
  }
  getInternalCodecId() {
    return this.delegate(() => this.firstInputTrack._backing.getInternalCodecId());
  }
  getDisposition() {
    return this.delegate(() => this.firstInputTrack._backing.getDisposition());
  }
  getLanguageCode() {
    return this.delegate(() => this.firstInputTrack._backing.getLanguageCode());
  }
  getName() {
    return this.delegate(() => this.firstInputTrack._backing.getName());
  }
  getTimeResolution() {
    return this.delegate(() => this.firstInputTrack._backing.getTimeResolution());
  }
  async isRelativeToUnixEpoch() {
    return await this.hydrate(), p(this.segmentedInput.firstSegment), this.segmentedInput.firstSegment.unixEpochTimestamp === this.segmentedInput.firstSegment.timestamp;
  }
  getUnixTimeForTimestamp(e) {
    return this.segmentedInput.getUnixTimeForTimestamp(e);
  }
  getBitrate() {
    return this.delegate(() => this.firstInputTrack._backing.getBitrate());
  }
  getAverageBitrate() {
    return this.delegate(() => this.firstInputTrack._backing.getAverageBitrate());
  }
  getDurationFromMetadata(e) {
    return this.segmentedInput.getDurationFromMetadata(e);
  }
  getLiveRefreshInterval() {
    return this.segmentedInput.getLiveRefreshInterval();
  }
  async createAdjustedPacket(e, t, i) {
    p(e.sequenceNumber >= 0), p(this.segmentedInput.firstSegment);
    const s = await this.segmentedInput.getMediaOffset(t, i.input), n = t.timestamp - this.segmentedInput.firstSegment.timestamp, a = e.clone({
      timestamp: wi(e.timestamp + s, await i.getTimeResolution()),
      // The 1e8 assumes a max of 100 MB per second, highly unlikely to be hit, so this should guarantee
      // monotonically increasing sequence numbers across segments.
      sequenceNumber: Math.floor(1e8 * n) + e.sequenceNumber
    });
    return this.packetInfos.set(a, {
      segment: t,
      track: i,
      sourcePacket: e
    }), a;
  }
  async getFirstPacket(e) {
    await this.hydrate(), p(this.firstInputTrack), p(this.firstSegment);
    let t = this.firstInputTrack, i = this.firstSegment;
    for (; ; ) {
      if (t) {
        const a = await t._backing.getFirstPacket(e);
        if (a)
          return this.createAdjustedPacket(a, i, t);
      }
      if (i = await this.segmentedInput.getNextSegment(i, {
        skipLiveWait: e.skipLiveWait
      }), !i)
        break;
      t = (await this.segmentedInput.getInputForSegment(i).getTracks()).find((a) => a.type === this.firstInputTrack.type && a.number === this.firstInputTrack.number) ?? null;
    }
    return null;
  }
  getNextPacket(e, t) {
    return this._getNextInternal(e, t, !1);
  }
  getNextKeyPacket(e, t) {
    return this._getNextInternal(e, t, !0);
  }
  async _getNextInternal(e, t, i) {
    const s = this.packetInfos.get(e);
    if (!s)
      throw new Error("Packet was not created from this track.");
    const n = i ? await s.track._backing.getNextKeyPacket(s.sourcePacket, t) : await s.track._backing.getNextPacket(s.sourcePacket, t);
    if (n)
      return this.createAdjustedPacket(n, s.segment, s.track);
    let a = s.segment;
    for (; ; ) {
      const o = await this.segmentedInput.getNextSegment(a, {
        skipLiveWait: t.skipLiveWait
      });
      if (!o)
        return null;
      const u = (await this.segmentedInput.getInputForSegment(o).getTracks()).find((f) => f.type === s.track.type && f.number === s.track.number);
      if (!u) {
        a = o;
        continue;
      }
      const d = await u._backing.getFirstPacket(t);
      return d ? this.createAdjustedPacket(d, o, u) : null;
    }
  }
  getPacket(e, t) {
    return this._getPacketInternal(e, t, !1);
  }
  getKeyPacket(e, t) {
    return this._getPacketInternal(e, t, !0);
  }
  async _getPacketInternal(e, t, i) {
    let s = await this.segmentedInput.getSegmentAt(e, {
      skipLiveWait: t.skipLiveWait
    });
    if (!s)
      return null;
    for (await this.hydrate(); s; ) {
      const n = this.segmentedInput.getInputForSegment(s), o = (await n.getTracks()).find((d) => d.type === this.firstInputTrack.type && d.number === this.firstInputTrack.number);
      if (!o) {
        s = await this.segmentedInput.getPreviousSegment(s, {
          skipLiveWait: t.skipLiveWait
        });
        continue;
      }
      const c = await this.segmentedInput.getMediaOffset(s, n), l = e - c, u = i ? await o._backing.getKeyPacket(l, t) : await o._backing.getPacket(l, t);
      if (!u) {
        s = await this.segmentedInput.getPreviousSegment(s, {
          skipLiveWait: t.skipLiveWait
        });
        continue;
      }
      return this.createAdjustedPacket(u, s, o);
    }
    return null;
  }
}
class Ba extends xc {
  getType() {
    return "video";
  }
  getCodec() {
    return this.delegate(() => this.firstInputTrack._backing.getCodec());
  }
  getCodedWidth() {
    return this.delegate(() => this.firstInputTrack._backing.getCodedWidth());
  }
  getCodedHeight() {
    return this.delegate(() => this.firstInputTrack._backing.getCodedHeight());
  }
  getSquarePixelWidth() {
    return this.delegate(() => this.firstInputTrack._backing.getSquarePixelWidth());
  }
  getSquarePixelHeight() {
    return this.delegate(() => this.firstInputTrack._backing.getSquarePixelHeight());
  }
  getRotation() {
    return this.delegate(() => this.firstInputTrack._backing.getRotation());
  }
  async getColorSpace() {
    return this.delegate(() => this.firstInputTrack._backing.getColorSpace());
  }
  async canBeTransparent() {
    return this.delegate(() => this.firstInputTrack._backing.canBeTransparent());
  }
  async getDecoderConfig() {
    return this.delegate(() => this.firstInputTrack._backing.getDecoderConfig());
  }
}
class Ra extends xc {
  getType() {
    return "audio";
  }
  getCodec() {
    return this.delegate(() => this.firstInputTrack._backing.getCodec());
  }
  getNumberOfChannels() {
    return this.delegate(() => this.firstInputTrack._backing.getNumberOfChannels());
  }
  getSampleRate() {
    return this.delegate(() => this.firstInputTrack._backing.getSampleRate());
  }
  async getDecoderConfig() {
    return this.delegate(() => this.firstInputTrack._backing.getDecoderConfig());
  }
}
const Nr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: "Module" }));
kn();
const Ma = typeof Nr < "u" ? Nr : void 0, Pc = 0, Cc = 1 / 0;
let nn = null;
typeof FinalizationRegistry < "u" && (nn = new FinalizationRegistry((r) => {
  r();
}));
class Oe extends or {
  constructor() {
    super(), this._disposed = !1, this._refCount = 0, this._usedForHls = !1, this._refFinalizationRegistry = null, this._sizePromise = null, this.onread = null, typeof FinalizationRegistry < "u" && (this._refFinalizationRegistry = new FinalizationRegistry((e) => {
      e._decrementRefCount();
    }));
  }
  /**
   * Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call
   * will retrieve the size.
   *
   * Returns null if the source is unsized.
   */
  async getSizeOrNull() {
    if (this._disposed)
      throw new Pe();
    return this._sizePromise ??= (async () => {
      let e = this._getFileSize();
      return e !== void 0 || (await this._read(0, 1, Pc, Cc), e = this._getFileSize(), p(e !== void 0)), e;
    })();
  }
  /**
   * Resolves with the total size of the file in bytes. This function is memoized, meaning only the first call
   * will retrieve the size.
   *
   * Throws an error if the source is unsized.
   */
  async getSize() {
    if (this._disposed)
      throw new Pe();
    const e = await this.getSizeOrNull();
    if (e === null)
      throw new Error("Cannot determine the size of an unsized source.");
    return e;
  }
  /**
   * Returns a new {@link RangedSource} that maps data onto this source using the given offset and length. If a length
   * is not provided, the ranged source spans until the end of this source's data.
   *
   * Useful for reading files that are embedded within larger files.
   */
  slice(e, t) {
    if (!Number.isInteger(e) || e < 0)
      throw new TypeError("offset must be a non-negative integer.");
    if (t !== void 0 && (!Number.isInteger(t) || t < 0))
      throw new TypeError("length, when provided, must be a non-negative integer.");
    return new ud(this, e, t);
  }
  /** @internal */
  _dispatchRead(e, t) {
    this.onread?.(e, t), this._emit("read", { start: e, end: t });
  }
  /**
   * Creates a new `SourceRef` pointing to this source. You are expected to call `.free()` on said `SourceRef` when
   * you're done with it.
   */
  ref() {
    return new On(this);
  }
  /** @internal */
  _incrementRefCount() {
    this._refCount++;
  }
  /** @internal */
  _decrementRefCount() {
    this._refCount--, this._refCount === 0 && (this._dispose(), this._disposed = !0);
  }
}
class On {
  /** @internal */
  constructor(e) {
    if (this._freed = !1, e._disposed)
      throw new Error("Cannot ref a disposed source.");
    e._incrementRefCount(), e._refFinalizationRegistry?.register(this, e, this), this._source = e;
  }
  /** The {@link Source} this ref references. Accessing this field throws an error after having freed the ref. */
  get source() {
    if (!this._source)
      throw new Error("Can't get source; ref has already been freed.");
    return this._source;
  }
  /** Whether or not this reference has been freed via {@link SourceRef.free}. */
  get freed() {
    return this._freed;
  }
  /**
   * Frees the ref, decrementing the source's internal reference count. If the source's internal reference count
   * reaches zero, it gets disposed. To catch bugs, this method throws if the ref is already freed.
   */
  free() {
    if (this._freed)
      throw new Error("Illegal operation: double free on SourceRef.");
    const e = this.source;
    p(e._refCount > 0), e._decrementRefCount(), e._refFinalizationRegistry?.unregister(this), this._freed = !0, this._source = null;
  }
  /**
   * Calls {@link SourceRef.free}.
   */
  [Symbol.dispose]() {
    this.freed || this.free();
  }
}
class Zt extends Oe {
  constructor(e, t) {
    if (typeof e != "string")
      throw new TypeError("rootPath must be a string.");
    if (typeof t != "function")
      throw new TypeError("requestHandler must be a function.");
    super(), this.rootPath = e, this.requestHandler = t;
  }
  /** @internal */
  _resolveRequest(e) {
    const t = this.requestHandler(e), i = (s) => {
      if (!(s instanceof Oe || s instanceof On))
        throw new TypeError("requestHandler must return or resolve to a Source or SourceRef.");
      const n = s instanceof Oe ? s.ref() : s;
      return n.source._usedForHls ||= this._usedForHls, n;
    };
    return t instanceof Promise ? t.then(i) : i(t);
  }
}
const za = (r, e) => r.path === e.path;
class nd extends Zt {
  constructor() {
    super(...arguments), this._root = null, this._rootRequest = null;
  }
  /** @internal */
  _read(e, t, i, s) {
    if (!this._root) {
      if (!this._rootRequest) {
        const n = this._resolveRequest({ path: this.rootPath, isRoot: !0 }), a = (o) => {
          const c = o instanceof Oe ? o.ref() : o;
          return this._root = c, this._rootRequest = null, c;
        };
        n instanceof Promise ? this._rootRequest = n.then(a) : (a(n), p(this._root));
      }
      if (this._rootRequest)
        return this._rootRequest.then((n) => n.source._read(e, t, i, s));
    }
    return this._root.source._read(e, t, i, s);
  }
  /** @internal */
  _getFileSize() {
    if (this._root)
      return this._root.source._getFileSize();
  }
  /** @internal */
  _dispose() {
    this._root ? this._root.free() : this._rootRequest && this._rootRequest.then((e) => e.free());
  }
}
class bm extends Oe {
  /**
   * Creates a new {@link BufferSource} backed by the specified `ArrayBuffer`, `SharedArrayBuffer`,
   * or `ArrayBufferView`.
   */
  constructor(e) {
    if (!(e instanceof ArrayBuffer) && !(typeof SharedArrayBuffer < "u" && e instanceof SharedArrayBuffer) && !ArrayBuffer.isView(e))
      throw new TypeError("buffer must be an ArrayBuffer, SharedArrayBuffer, or ArrayBufferView.");
    super(), this._onreadCalled = !1, this._bytes = te(e), this._view = q(e);
  }
  /** @internal */
  _getFileSize() {
    return this._bytes.byteLength;
  }
  /** @internal */
  _read() {
    return this._onreadCalled || (this._dispatchRead(0, this._bytes.byteLength), this._onreadCalled = !0), {
      bytes: this._bytes,
      view: this._view,
      offset: 0
    };
  }
  /** @internal */
  _dispose() {
  }
}
class km extends Oe {
  /**
   * Creates a new {@link BlobSource} backed by the specified
   * [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
   */
  constructor(e, t = {}) {
    if (!(e instanceof Blob))
      throw new TypeError("blob must be a Blob.");
    if (!t || typeof t != "object")
      throw new TypeError("options must be an object.");
    if (t.maxCacheSize !== void 0 && (!Si(t.maxCacheSize) || t.maxCacheSize < 0))
      throw new TypeError("options.maxCacheSize, when provided, must be a non-negative number.");
    if (t.useStreamReader !== void 0 && typeof t.useStreamReader != "boolean")
      throw new TypeError("options.useStreamReader, when provided, must be a boolean.");
    super(), this._readers = /* @__PURE__ */ new WeakMap(), this._blob = e, this._options = t, this._orchestrator = new Nn({
      maxCacheSize: t.maxCacheSize ?? 8 * 2 ** 20,
      maxWorkerCount: 4,
      runWorker: this._runWorker.bind(this),
      prefetchProfile: Un.fileSystem
    }), this._orchestrator.fileSize = e.size;
  }
  /** @internal */
  _getFileSize() {
    return this._orchestrator.fileSize;
  }
  /** @internal */
  _read(e, t, i, s) {
    return this._orchestrator.read(e, t, i, s);
  }
  /** @internal */
  async _runWorker(e) {
    p(e.strictTarget);
    let t = this._readers.get(e);
    for (t === void 0 && ("stream" in this._blob && !di() && this._options.useStreamReader !== !1 ? t = this._blob.slice(e.currentPos).stream().getReader() : t = null, this._readers.set(e, t)); e.currentPos < e.targetPos && !e.aborted; )
      if (t) {
        const { done: i, value: s } = await t.read();
        if (i)
          throw this._orchestrator.onWorkerFinished(e), new Error("Blob reader stopped unexpectedly before all requested data was read.");
        if (e.aborted)
          break;
        this._dispatchRead(e.currentPos, e.currentPos + s.length), this._orchestrator.supplyWorkerData(e, s);
      } else {
        const i = await this._blob.slice(e.currentPos, e.targetPos).arrayBuffer();
        if (e.aborted)
          break;
        this._dispatchRead(e.currentPos, e.currentPos + i.byteLength), this._orchestrator.supplyWorkerData(e, new Uint8Array(i));
      }
    this._orchestrator.signalWorkerStoppedRunning(e), e.aborted && await t?.cancel();
  }
  /** @internal */
  _dispose() {
    this._orchestrator.dispose();
  }
}
const ad = 0.5 * 2 ** 20, od = ((r, e, t) => {
  if (e instanceof Error && (e.message.includes("Failed to fetch") || e.message.includes("Load failed") || e.message.includes("NetworkError when attempting to fetch resource")) && typeof window < "u") {
    let s = null;
    try {
      typeof window < "u" && typeof window.location < "u" && (s = new URL(t instanceof Request ? t.url : t, window.location.href).origin);
    } catch {
    }
    if ((typeof navigator < "u" && typeof navigator.onLine == "boolean" ? navigator.onLine : !0) && s !== null && s !== window.location.origin)
      return D._warn("Request will not be retried because a CORS error was suspected due to different origins. You can modify this behavior by providing your own function for the 'getRetryDelay' option."), null;
  }
  return Math.min(2 ** (r - 2), 16);
}), Da = /* @__PURE__ */ new Set();
class _c extends Zt {
  /**
   * Creates a new {@link UrlSource} backed by the resource at the specified URL.
   *
   * When passing a `Request` instance, note that its `signal` will be overridden by Mediabunny; if you want to cancel
   * ongoing requests, use {@link Input.dispose}.
   */
  constructor(e, t = {}) {
    if (typeof e != "string" && !(e instanceof URL) && !(typeof Request < "u" && e instanceof Request))
      throw new TypeError("url must be a string, URL or Request.");
    if (!t || typeof t != "object")
      throw new TypeError("options must be an object.");
    if (t.requestInit !== void 0 && (!t.requestInit || typeof t.requestInit != "object"))
      throw new TypeError("options.requestInit, when provided, must be an object.");
    if (t.getRetryDelay !== void 0 && typeof t.getRetryDelay != "function")
      throw new TypeError("options.getRetryDelay, when provided, must be a function.");
    if (t.maxCacheSize !== void 0 && (!Si(t.maxCacheSize) || t.maxCacheSize < 0))
      throw new TypeError("options.maxCacheSize, when provided, must be a non-negative number.");
    if (t.parallelism !== void 0 && (!Number.isInteger(t.parallelism) || t.parallelism < 1))
      throw new TypeError("options.parallelism, when provided, must be a positive number.");
    if (t.fetchFn !== void 0 && typeof t.fetchFn != "function")
      throw new TypeError("options.fetchFn, when provided, must be a function.");
    const i = e instanceof Request ? e.url : e instanceof URL ? e.href : e;
    super(i, (a) => new _c(a.path, this._options)), this._offset = 0, this._length = null, this._fileSizeDetermined = !1, this._sequentialBacking = null, this._url = e, this._options = t, this._getRetryDelay = t.getRetryDelay ?? od, this._requestInit = { ...t.requestInit };
    let s = null;
    if (t.requestInit?.headers) {
      const a = { ...Ws(t.requestInit.headers) }, o = Object.keys(a).find((c) => c.toLowerCase() === "range");
      o !== void 0 && (s = a[o], delete a[o], this._requestInit.headers = a);
    }
    if (e instanceof Request) {
      const a = e.headers.get("Range");
      if (a !== null) {
        s ??= a;
        const o = new Request(e);
        o.headers.delete("Range"), this._url = o;
      }
    }
    if (s !== null) {
      const a = ld(s);
      a && (this._offset = a.offset, this._length = a.length);
    }
    const n = 2;
    this._orchestrator = new Nn({
      maxCacheSize: t.maxCacheSize ?? 64 * 2 ** 20,
      maxWorkerCount: t.parallelism ?? n,
      runWorker: this._runWorker.bind(this),
      prefetchProfile: Un.network
    });
  }
  /** @internal */
  _getFileSize() {
    if (!this._fileSizeDetermined)
      return this._length !== null ? this._length : void 0;
    const e = this._sequentialBacking ? this._sequentialBacking._endIndex : this._orchestrator.fileSize;
    return e === null ? this._length !== null ? this._length : null : le(e - this._offset, 0, this._length ?? 1 / 0);
  }
  /** @internal */
  _read(e, t, i, s) {
    if (this._length !== null && t > this._length)
      return null;
    const n = this._offset, a = this._sequentialBacking ? this._sequentialBacking._read(n + e, n + t) : this._orchestrator.read(n + e, n + t, Math.max(n + i, n), n + Math.min(s, this._length ?? 1 / 0)), o = (c) => c ? (c.offset -= this._offset, c) : null;
    return a instanceof Promise ? a.then(o) : o(a);
  }
  /** @internal */
  async _runWorker(e) {
    for (; ; ) {
      const t = new AbortController(), i = await ra(this._options.fetchFn ?? fetch, this._url, ia(this._requestInit, {
        headers: {
          // Always sending a range request is a good way to probe if the server supports them
          Range: `bytes=${e.currentPos}-`
        },
        signal: t.signal
      }), this._getRetryDelay, () => this._disposed);
      if (!i.ok)
        throw new Error(`Error fetching ${String(this._url)}: ${i.status} ${i.statusText}`);
      i.redirected && (this.rootPath = i.url);
      e: if (this._orchestrator.fileSize === null) {
        const n = i.headers.get("Content-Range");
        if (n) {
          const o = /\/(\d+)/.exec(n);
          if (o) {
            this._orchestrator.supplyFileSize(Number(o[1]));
            break e;
          }
        }
        const a = i.headers.get("Content-Length");
        if (a) {
          const o = i.status === 206 ? e.currentPos : 0;
          this._orchestrator.supplyFileSize(o + Number(a));
        }
      }
      if (this._fileSizeDetermined = !0, !i.body)
        throw new Error("Missing HTTP response body stream. The used fetch function must provide the response body as a ReadableStream.");
      if (i.status !== 206) {
        if (this._sequentialBacking) {
          i.body.cancel();
          return;
        }
        if (!this._usedForHls) {
          const n = new URL(this._url instanceof Request ? this._url.url : this._url, typeof window < "u" ? window.location.href : void 0);
          n.origin !== "null" && !(n.pathname.endsWith(".m3u8") || n.pathname.endsWith(".m3u")) && (Da.has(n.origin) || (D._warn(`HTTP server (origin ${n.origin}) did not respond to a range request with 206 Partial Content, meaning the resource will now be streamed sequentially, with old data being evicted from the cache. Reads into evicted regions will throw. To enable efficient media file streaming across a network, please make sure your server supports range requests. Alternatively, set maxCacheSize to Infinity in the UrlSource options to keep the entire resource in memory.`), Da.add(n.origin)));
        }
        this._transitionToSequentialMode(i.body);
        return;
      }
      const s = i.body.getReader();
      for (; ; ) {
        if (e.currentPos >= e.targetPos || e.aborted) {
          t.abort(), this._orchestrator.signalWorkerStoppedRunning(e);
          return;
        }
        let n;
        try {
          n = await s.read();
        } catch (c) {
          if (this._disposed)
            throw c;
          const l = this._getRetryDelay(1, c, this._url);
          if (l !== null) {
            D._error("Error while reading response stream. Attempting to resume.", c), await $i(1e3 * l);
            break;
          } else
            throw c;
        }
        if (e.aborted)
          continue;
        const { done: a, value: o } = n;
        if (a) {
          if (e.currentPos >= e.targetPos) {
            this._orchestrator.onWorkerFinished(e);
            return;
          }
          if (e.strictTarget)
            break;
          this._orchestrator.onWorkerFinished(e);
          return;
        }
        this._dispatchRead(e.currentPos, e.currentPos + o.length), this._orchestrator.supplyWorkerData(e, o);
      }
    }
  }
  /** @internal */
  _transitionToSequentialMode(e) {
    let t = e.getReader(), i = 0, s = 0;
    const n = new ReadableStream({
      pull: async (c) => {
        for (; ; ) {
          let l;
          try {
            l = await t.read();
          } catch (d) {
            if (this._disposed)
              throw d;
            const f = this._getRetryDelay(1, d, this._url);
            if (f === null)
              throw d;
            D._error("Error while reading response stream. Attempting to resume.", d), await $i(1e3 * f);
            const h = await ra(this._options.fetchFn ?? fetch, this._url, ia(this._requestInit, {
              headers: {
                // Who knows, maybe the server honors range requests this time
                Range: `bytes=${i}-`
              }
            }), this._getRetryDelay, () => this._disposed);
            if (!h.ok)
              throw new Error(
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                `Error fetching ${String(this._url)}: ${h.status} ${h.statusText}`
              );
            if (!h.body)
              throw new Error("Missing HTTP response body stream. The used fetch function must provide the response body as a ReadableStream.");
            t = h.body.getReader(), s = h.status === 206 ? 0 : i;
            continue;
          }
          if (l.done) {
            c.close();
            return;
          }
          let u = l.value;
          if (s > 0) {
            const d = Math.min(s, u.length);
            s -= d, u = u.subarray(d);
          }
          if (u.length !== 0) {
            i += u.length, c.enqueue(u);
            return;
          }
        }
      },
      cancel: () => t.cancel()
    }), a = new vc(n, {
      maxCacheSize: this._orchestrator.options.maxCacheSize
    });
    a._endIndex = this._orchestrator.fileSize, a._cacheMissErrorMessage = "Attempted to read data from an already-evicted part of the cache. Because the HTTP server did not honor the range request, data can only be read sequentially, with old data being evicted from the cache. To fix this issue, either ensure your server responds to range requests with 206 Partial Content, or set maxCacheSize to Infinity in the UrlSource options. Note that the latter will store the entire file in the cache if needed, no matter how large.", a.on("read", ({ start: c, end: l }) => this._dispatchRead(c, l)), this._sequentialBacking = a;
    const o = /* @__PURE__ */ new Set();
    for (const c of this._orchestrator.workers) {
      for (const l of c.pendingSlices)
        o.add(l);
      c.aborted = !0, c.pendingSlices.length = 0;
    }
    for (const c of this._orchestrator.queuedReads)
      for (const l of c.pendingSlices)
        o.add(l);
    this._orchestrator.workers.length = 0, this._orchestrator.queuedReads.length = 0;
    for (const c of o) {
      const l = a._read(c.start, c.start + c.bytes.length);
      l instanceof Promise ? l.then((u) => {
        u ? (p(u.offset === c.start), c.resolve(u.bytes)) : c.resolve(null);
      }, (u) => c.reject(u)) : (p(l === null), c.resolve(null));
    }
  }
  /** @internal */
  _dispose() {
    this._orchestrator.dispose(), this._sequentialBacking && (this._sequentialBacking._disposed = !0, this._sequentialBacking._dispose());
  }
}
const cd = /^bytes=(\d+)-(\d*)$/, ld = (r) => {
  const e = cd.exec(r.trim());
  if (!e)
    return null;
  const t = Number(e[1]), i = e[2] === "" ? null : Number(e[2]);
  return i !== null && i < t ? null : {
    offset: t,
    length: i !== null ? i - t + 1 : null
  };
};
class Ic extends Zt {
  /** Creates a new {@link FilePathSource} backed by the file at the specified file path. */
  constructor(e, t = {}) {
    if (typeof e != "string")
      throw new TypeError("filePath must be a string.");
    if (!t || typeof t != "object")
      throw new TypeError("options must be an object.");
    if (t.maxCacheSize !== void 0 && (!Si(t.maxCacheSize) || t.maxCacheSize < 0))
      throw new TypeError("options.maxCacheSize, when provided, must be a non-negative number.");
    if (!Ma.fs)
      throw new Error("FilePathSource is only available in server-side environments (Node.js, Bun, Deno).");
    super(e, (i) => new Ic(i.path, t)), this._fileHandle = null, this._customSource = new Ec({
      getSize: async () => {
        const i = await Ma.fs.open(e, "r");
        return this._fileHandle = i, nn?.register(this, () => {
          i.close();
        }, this), (await i.stat()).size;
      },
      read: async (i, s) => {
        p(this._fileHandle);
        const n = new Uint8Array(s - i);
        return await this._fileHandle.read(n, 0, s - i, i), n;
      },
      maxCacheSize: t.maxCacheSize,
      prefetchProfile: "fileSystem"
    });
  }
  /** @internal */
  _read(e, t, i, s) {
    return this._customSource._read(e, t, i, s);
  }
  /** @internal */
  _getFileSize() {
    return this._customSource._getFileSize();
  }
  /** @internal */
  _dispose() {
    this._customSource._dispose(), this._fileHandle && (this._fileHandle.close(), this._fileHandle = null, nn?.unregister(this));
  }
}
class Ec extends Oe {
  /** Creates a new {@link CustomSource} whose behavior is specified by `options`.  */
  constructor(e) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (typeof e.getSize != "function")
      throw new TypeError("options.getSize must be a function.");
    if (typeof e.read != "function")
      throw new TypeError("options.read must be a function.");
    if (e.dispose !== void 0 && typeof e.dispose != "function")
      throw new TypeError("options.dispose, when provided, must be a function.");
    if (e.maxCacheSize !== void 0 && (!Si(e.maxCacheSize) || e.maxCacheSize < 0))
      throw new TypeError("options.maxCacheSize, when provided, must be a non-negative number.");
    if (e.prefetchProfile && !["none", "fileSystem", "network"].includes(e.prefetchProfile))
      throw new TypeError("options.prefetchProfile, when provided, must be one of 'none', 'fileSystem' or 'network'.");
    super(), this._options = e, this._orchestrator = new Nn({
      maxCacheSize: e.maxCacheSize ?? 8 * 2 ** 20,
      maxWorkerCount: 2,
      // Fixed for now, *should* be fine
      prefetchProfile: Un[e.prefetchProfile ?? "none"],
      runWorker: this._runWorker.bind(this)
    });
  }
  /** @internal */
  _getFileSize() {
    return this._orchestrator.fileSize ?? void 0;
  }
  /** @internal */
  _read(e, t, i, s) {
    if (this._orchestrator.fileSize !== null)
      return this._orchestrator.read(e, t, i, s);
    const n = this._options.getSize();
    if (n instanceof Promise)
      return n.then((a) => {
        if (!Number.isInteger(a) || a < 0)
          throw new TypeError("options.getSize must return or resolve to a non-negative integer.");
        return this._orchestrator.fileSize = a, this._orchestrator.read(e, t, i, s);
      });
    if (!Number.isInteger(n) || n < 0)
      throw new TypeError("options.getSize must return or resolve to a non-negative integer.");
    return this._orchestrator.fileSize = n, this._orchestrator.read(e, t, i, s);
  }
  /** @internal */
  async _runWorker(e) {
    for (; e.currentPos < e.targetPos && !e.aborted; ) {
      const t = e.currentPos, i = e.targetPos;
      let s = this._options.read(e.currentPos, i);
      if (s instanceof Promise && (s = await s), e.aborted)
        break;
      if (s instanceof Uint8Array) {
        if (s = te(s), s.length !== i - e.currentPos)
          throw new Error(`options.read returned a Uint8Array with unexpected length: Requested ${i - e.currentPos} bytes, but got ${s.length}.`);
        this._dispatchRead(e.currentPos, e.currentPos + s.length), this._orchestrator.supplyWorkerData(e, s);
      } else if (s instanceof ReadableStream) {
        const n = s.getReader();
        for (; e.currentPos < i && !e.aborted; ) {
          const { done: a, value: o } = await n.read();
          if (a) {
            if (e.currentPos < i)
              throw new Error(`ReadableStream returned by options.read ended before supplying enough data. Requested ${i - t} bytes, but got ${e.currentPos - t}`);
            break;
          }
          if (!(o instanceof Uint8Array))
            throw new TypeError("ReadableStream returned by options.read must yield Uint8Array chunks.");
          if (e.aborted)
            break;
          const c = te(o);
          this._dispatchRead(e.currentPos, e.currentPos + c.length), this._orchestrator.supplyWorkerData(e, c);
        }
      } else
        throw new TypeError("options.read must return or resolve to a Uint8Array or a ReadableStream.");
    }
    this._orchestrator.signalWorkerStoppedRunning(e);
  }
  /** @internal */
  _dispose() {
    this._orchestrator.dispose(), this._options.dispose?.();
  }
}
const Tm = Ec;
class vc extends Oe {
  /** Creates a new {@link ReadableStreamSource} backed by the specified `ReadableStream<Uint8Array>`. */
  constructor(e, t = {}) {
    if (!(e instanceof ReadableStream))
      throw new TypeError("stream must be a ReadableStream.");
    if (!t || typeof t != "object")
      throw new TypeError("options must be an object.");
    if (t.maxCacheSize !== void 0 && (!Si(t.maxCacheSize) || t.maxCacheSize < 0))
      throw new TypeError("options.maxCacheSize, when provided, must be a non-negative number.");
    super(), this._reader = null, this._cache = [], this._pendingSlices = [], this._currentIndex = 0, this._targetIndex = 0, this._maxRequestedIndex = 0, this._endIndex = null, this._pulling = !1, this._cacheMissErrorMessage = "Attempted to read data from an already-evicted part of the cache. With ReadableStreamSource, you must access the data more sequentially or increase the size of its cache.", this._stream = e, this._maxCacheSize = t.maxCacheSize ?? 32 * 2 ** 20;
  }
  /** @internal */
  _getFileSize() {
    return this._endIndex;
  }
  /** @internal */
  _read(e, t) {
    if (this._endIndex !== null && t > this._endIndex)
      return null;
    this._maxRequestedIndex = Math.max(this._maxRequestedIndex, t);
    const i = $(this._cache, e, (u) => u.start), s = i !== -1 ? this._cache[i] : null;
    if (s && s.start <= e && t <= s.end)
      return {
        bytes: s.bytes,
        view: s.view,
        offset: s.start
      };
    let n = e;
    const a = new Uint8Array(t - e);
    if (i !== -1)
      for (let u = i; u < this._cache.length; u++) {
        const d = this._cache[u];
        if (d.start >= t)
          break;
        const f = Math.max(e, d.start);
        f > n && this._throwDueToCacheMiss();
        const h = Math.min(t, d.end);
        f < h && (a.set(d.bytes.subarray(f - d.start, h - d.start), f - e), n = h);
      }
    if (n === t)
      return {
        bytes: a,
        view: q(a),
        offset: e
      };
    this._currentIndex > n && this._throwDueToCacheMiss();
    const { promise: o, resolve: c, reject: l } = ee();
    return this._pendingSlices.push({
      start: e,
      end: t,
      bytes: a,
      resolve: c,
      reject: l
    }), this._targetIndex = Math.max(this._targetIndex, t), this._pulling || (this._pulling = !0, this._pull().catch((u) => {
      if (this._pulling = !1, this._pendingSlices.length > 0)
        this._pendingSlices.forEach((d) => d.reject(u)), this._pendingSlices.length = 0;
      else
        throw u;
    })), o;
  }
  /** @internal */
  _throwDueToCacheMiss() {
    throw new Error(this._cacheMissErrorMessage);
  }
  /** @internal */
  async _pull() {
    for (this._reader ??= this._stream.getReader(); this._currentIndex < this._targetIndex && !this._disposed; ) {
      const { done: e, value: t } = await this._reader.read();
      if (e) {
        for (const n of this._pendingSlices)
          n.resolve(null);
        this._pendingSlices.length = 0, this._endIndex = this._currentIndex;
        break;
      }
      const i = this._currentIndex, s = this._currentIndex + t.byteLength;
      this._dispatchRead(i, s);
      for (let n = 0; n < this._pendingSlices.length; n++) {
        const a = this._pendingSlices[n], o = Math.max(i, a.start), c = Math.min(s, a.end);
        o < c && (a.bytes.set(t.subarray(o - i, c - i), o - a.start), c === a.end && (a.resolve({
          bytes: a.bytes,
          view: q(a.bytes),
          offset: a.start
        }), this._pendingSlices.splice(n, 1), n--));
      }
      for (this._cache.push({
        start: i,
        end: s,
        bytes: t,
        view: q(t),
        age: 0
        // Unused
      }); this._cache.length > 0; ) {
        const n = this._cache[0];
        if (this._maxRequestedIndex - n.end <= this._maxCacheSize)
          break;
        this._cache.shift();
      }
      this._currentIndex += t.byteLength;
    }
    this._pulling = !1;
  }
  /** @internal */
  _dispose() {
    for (const e of this._pendingSlices)
      e.reject(new Pe());
    this._pendingSlices.length = 0, this._cache.length = 0, this._reader?.cancel();
  }
}
const Un = {
  none: (r, e) => ({ start: r, end: e }),
  fileSystem: (r, e) => (r = Math.floor((r - 65536) / 65536) * 65536, e = Math.ceil((e + 65536) / 65536) * 65536, { start: r, end: e }),
  network: (r, e, t) => {
    r = Math.max(0, Math.floor((r - 65536) / 65536) * 65536);
    for (const s of t) {
      const a = Math.max((s.startPos + s.targetPos) / 2, s.targetPos - 8388608);
      if (qs(r, e, a, s.targetPos)) {
        const o = s.targetPos - s.startPos, c = Math.ceil((o + 1) / 8388608) * 8388608, l = 2 ** Math.ceil(Math.log2(o + 1)), u = Math.min(l, c);
        e = Math.max(e, s.startPos + u);
      }
    }
    return e = Math.max(e, r + ad), {
      start: r,
      end: e
    };
  }
};
class Nn {
  constructor(e) {
    this.options = e, this.fileSize = null, this.nextAge = 0, this.workers = [], this.cache = [], this.currentCacheSize = 0, this.disposed = !1, this.queuedReads = [];
  }
  read(e, t, i, s) {
    p(!this.disposed);
    const n = this.options.prefetchProfile(e, t, this.workers), a = Math.max(n.start, i), o = Math.min(n.end, this.fileSize ?? 1 / 0, s);
    p(a <= e && t <= o);
    let c = null;
    const l = $(this.cache, e, (T) => T.start), u = l !== -1 ? this.cache[l] : null;
    u && u.start <= e && t <= u.end && (u.age = this.nextAge++, c = {
      bytes: u.bytes,
      view: u.view,
      offset: u.start
    });
    const d = $(this.cache, a, (T) => T.start), f = c ? null : new Uint8Array(t - e);
    let h = 0, g = a;
    const m = [];
    if (d !== -1) {
      for (let T = d; T < this.cache.length; T++) {
        const A = this.cache[T];
        if (A.start >= o)
          break;
        if (A.end <= a)
          continue;
        const C = Math.max(a, A.start), _ = Math.min(o, A.end);
        if (p(C <= _), g < C && m.push({ start: g, end: C }), g = _, f) {
          const x = Math.max(e, A.start), I = Math.min(t, A.end);
          if (x < I) {
            const E = x - e;
            f.set(A.bytes.subarray(x - A.start, I - A.start), E), E === h && (h = I - e);
          }
        }
        A.age = this.nextAge++;
      }
      g < o && m.push({ start: g, end: o });
    } else
      m.push({ start: a, end: o });
    if (f && h >= f.length && (c = {
      bytes: f,
      view: q(f),
      offset: e
    }), m.length === 0)
      return p(c), c;
    const { promise: w, resolve: y, reject: b } = ee(), k = [];
    for (const T of m) {
      const A = Math.max(e, T.start), C = Math.min(t, T.end);
      A === T.start && C === T.end ? k.push(T) : A < C && k.push({ start: A, end: C });
    }
    const S = f && {
      start: e,
      bytes: f,
      holes: k,
      resolve: y,
      reject: b
    };
    e: for (const T of m) {
      for (const _ of this.workers)
        if (this.checkHoleAgainstWorker(_, T, S ? [S] : [])) {
          this.checkQueuedReadsAgainstWorker(_);
          continue e;
        }
      const A = T.end < o || this.fileSize !== null, C = this.createWorker(T.start, T.end, A);
      if (C)
        S && (C.pendingSlices = [S]), this.runWorker(C);
      else {
        let _ = $(this.queuedReads, T.start, (I) => I.hole.start), x = _ !== -1 ? this.queuedReads[_] : null;
        for (x && T.start <= x.hole.end ? (x.hole.end = Math.max(x.hole.end, T.end), x.strictTarget &&= A, S && x.pendingSlices.push(S)) : (_++, x = {
          hole: {
            // Clone the hole because it might be mutated later
            start: T.start,
            end: T.end
          },
          strictTarget: A,
          pendingSlices: S ? [S] : [],
          age: this.nextAge++
        }, this.queuedReads.splice(_, 0, x)); _ + 1 < this.queuedReads.length; ) {
          const I = this.queuedReads[_ + 1];
          if (I.hole.start > x.hole.end)
            break;
          x.hole.end = Math.max(x.hole.end, I.hole.end), x.pendingSlices.push(...I.pendingSlices), x.strictTarget &&= I.strictTarget, x.age = Math.min(x.age, I.age), this.queuedReads.splice(_ + 1, 1);
        }
      }
    }
    return c ? w.catch((T) => {
      if (!this.disposed)
        throw T;
    }) : (p(f), c = w.then((T) => T && {
      bytes: T,
      view: q(T),
      offset: e
    })), c;
  }
  checkHoleAgainstWorker(e, t, i) {
    if (qs(t.start - 131072, t.start, e.currentPos, e.targetPos)) {
      e.targetPos = Math.max(e.targetPos, t.end);
      for (let n = 0; n < i.length; n++) {
        const a = i[n];
        e.pendingSlices.includes(a) || e.pendingSlices.push(a);
      }
      return e.running || this.runWorker(e), !0;
    }
    return !1;
  }
  checkQueuedReadsAgainstWorker(e) {
    let t = !1;
    for (let i = 0; i < this.queuedReads.length; i++) {
      const s = this.queuedReads[i];
      if (this.checkHoleAgainstWorker(e, s.hole, s.pendingSlices))
        this.queuedReads.splice(i, 1), i--, t = !0;
      else if (t)
        break;
    }
  }
  createWorker(e, t, i) {
    if (this.workers.length >= this.options.maxWorkerCount) {
      let n = null, a = null;
      for (let o = 0; o < this.workers.length; o++) {
        const c = this.workers[o];
        !c.running && c.pendingSlices.length === 0 && (!n || c.age < n.age) && (a = o, n = c);
      }
      if (n)
        p(a !== null), p(n.pendingSlices.length === 0), this.workers.splice(a, 1);
      else
        return null;
    }
    const s = {
      startPos: e,
      currentPos: e,
      targetPos: t,
      strictTarget: i,
      running: !1,
      // Due to async shenanigans, it can happen that workers are started after disposal. In this case, instead of
      // simply not creating the worker, we allow it to run but immediately label it as aborted, so it can then
      // shut itself down.
      aborted: this.disposed,
      pendingSlices: [],
      age: this.nextAge++
    };
    return this.workers.push(s), s;
  }
  runWorker(e) {
    p(!e.running), p(e.currentPos < e.targetPos), e.running = !0, e.age = this.nextAge++, this.options.runWorker(e).catch((t) => {
      if (e.running = !1, e.pendingSlices.length > 0)
        e.pendingSlices.forEach((i) => i.reject(t)), e.pendingSlices.length = 0;
      else if (!e.aborted && !this.disposed)
        throw t;
    }).finally(() => {
      if (!e.running && this.queuedReads.length > 0) {
        let t = 0;
        for (let n = 1; n < this.queuedReads.length; n++)
          this.queuedReads[n].age < this.queuedReads[t].age && (t = n);
        const i = this.queuedReads[t], s = this.createWorker(i.hole.start, i.hole.end, i.strictTarget);
        if (!s)
          return;
        this.queuedReads.splice(t, 1), s.pendingSlices = i.pendingSlices, this.runWorker(s);
      }
    });
  }
  /** Called by a worker when it has read some data. */
  supplyWorkerData(e, t) {
    p(!e.aborted);
    const i = e.currentPos, s = i + t.length;
    this.insertIntoCache({
      start: i,
      end: s,
      bytes: t,
      view: q(t),
      age: this.nextAge++
    }), e.currentPos += t.length, e.currentPos > e.targetPos && (e.targetPos = e.currentPos, this.checkQueuedReadsAgainstWorker(e));
    for (let n = 0; n < e.pendingSlices.length; n++) {
      const a = e.pendingSlices[n], o = Math.max(i, a.start), c = Math.min(s, a.start + a.bytes.length);
      o < c && a.bytes.set(t.subarray(o - i, c - i), o - a.start);
      for (let l = 0; l < a.holes.length; l++) {
        const u = a.holes[l];
        i <= u.start && s > u.start && (u.start = s), u.end <= u.start && (a.holes.splice(l, 1), l--);
      }
      a.holes.length === 0 && (a.resolve(a.bytes), e.pendingSlices.splice(n, 1), n--);
    }
    for (let n = 0; n < this.workers.length; n++) {
      const a = this.workers[n];
      e === a || a.running || qs(i, s, a.currentPos, a.targetPos) && (this.workers.splice(n, 1), n--);
    }
  }
  supplyFileSize(e) {
    p(this.fileSize === null), this.fileSize = e;
    for (const t of this.workers) {
      t.targetPos = Math.min(t.targetPos, e), t.strictTarget = !0;
      for (let i = 0; i < t.pendingSlices.length; i++) {
        const s = t.pendingSlices[i];
        for (const n of s.holes)
          if (n.end > e) {
            s.resolve(null), t.pendingSlices.splice(i, 1), i--;
            break;
          }
      }
    }
    for (let t = 0; t < this.queuedReads.length; t++) {
      const i = this.queuedReads[t];
      if (i.hole.start >= e) {
        for (const s of i.pendingSlices)
          s.resolve(null);
        this.queuedReads.splice(t, 1), t--;
      } else if (i.hole.end > e) {
        i.hole.end = e, i.strictTarget = !0;
        for (let s = 0; s < i.pendingSlices.length; s++) {
          const n = i.pendingSlices[s];
          n.start >= e && (n.resolve(null), i.pendingSlices.splice(s, 1), s--);
        }
      }
    }
  }
  signalWorkerStoppedRunning(e) {
    e.running = !1, e.aborted || (e.pendingSlices.length = 0);
  }
  /** Called when a worker reaches the end of the underlying data and must be cleaned up. */
  onWorkerFinished(e) {
    const t = this.workers.indexOf(e);
    p(t !== -1), e.running = !1, this.workers.splice(t, 1), this.fileSize === null && this.supplyFileSize(e.currentPos);
    for (const i of e.pendingSlices)
      i.resolve(null);
  }
  insertIntoCache(e) {
    if (this.options.maxCacheSize === 0)
      return;
    let t = $(this.cache, e.start, (i) => i.start) + 1;
    if (t > 0) {
      const i = this.cache[t - 1];
      if (i.end >= e.end)
        return;
      if (i.end > e.start) {
        const s = new Uint8Array(e.end - i.start);
        s.set(i.bytes, 0), s.set(e.bytes, e.start - i.start), this.currentCacheSize += e.end - i.end, i.bytes = s, i.view = q(s), i.end = e.end, t--, e = i;
      } else
        this.cache.splice(t, 0, e), this.currentCacheSize += e.bytes.length;
    } else
      this.cache.splice(t, 0, e), this.currentCacheSize += e.bytes.length;
    for (let i = t + 1; i < this.cache.length; i++) {
      const s = this.cache[i];
      if (e.end <= s.start)
        break;
      if (e.end >= s.end) {
        this.cache.splice(i, 1), this.currentCacheSize -= s.bytes.length, i--;
        continue;
      }
      const n = new Uint8Array(s.end - e.start);
      n.set(e.bytes, 0), n.set(s.bytes, s.start - e.start), this.currentCacheSize -= e.end - s.start, e.bytes = n, e.view = q(n), e.end = s.end, this.cache.splice(i, 1);
      break;
    }
    for (; this.currentCacheSize > this.options.maxCacheSize; ) {
      let i = 0, s = this.cache[0];
      for (let n = 1; n < this.cache.length; n++) {
        const a = this.cache[n];
        a.age < s.age && (i = n, s = a);
      }
      if (this.currentCacheSize - s.bytes.length <= this.options.maxCacheSize)
        break;
      this.cache.splice(i, 1), this.currentCacheSize -= s.bytes.length;
    }
  }
  dispose() {
    for (const e of this.workers) {
      for (const t of e.pendingSlices)
        t.reject(new Pe());
      e.pendingSlices.length = 0, e.aborted = !0;
    }
    for (const e of this.queuedReads)
      for (const t of e.pendingSlices)
        t.reject(new Pe());
    this.workers.length = 0, this.cache.length = 0, this.queuedReads.length = 0, this.disposed = !0;
  }
}
class ud extends Oe {
  /** @internal */
  constructor(e, t, i) {
    if (super(), this._ref = null, e._disposed)
      throw new Error("Cannot create a slice of a disposed source.");
    this._baseSource = e, this._offset = t, this._length = i ?? null;
  }
  /** @internal */
  _getFileSize() {
    const e = this._baseSource._getFileSize();
    return e === void 0 ? this._length !== null ? this._length : void 0 : e === null ? this._length !== null ? this._length : null : le(e - this._offset, 0, this._length ?? 1 / 0);
  }
  /** @internal */
  _read(e, t, i, s) {
    if (this._length !== null && t > this._length)
      return null;
    const n = this._baseSource._read(this._offset + e, this._offset + t, this._offset + i, this._offset + s), a = (o) => o ? (o.offset -= this._offset, o) : null;
    return n instanceof Promise ? n.then(a) : a(n);
  }
  /** @internal */
  _dispose() {
    this._ref?.free();
  }
  ref() {
    return this._ref ??= this._baseSource.ref(), super.ref();
  }
}
var Oa = function(r, e, t) {
  if (e != null) {
    if (typeof e != "object" && typeof e != "function") throw new TypeError("Object expected.");
    var i, s;
    if (t) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      i = e[Symbol.asyncDispose];
    }
    if (i === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      i = e[Symbol.dispose], t && (s = i);
    }
    if (typeof i != "function") throw new TypeError("Object not disposable.");
    s && (i = function() {
      try {
        s.call(this);
      } catch (n) {
        return Promise.reject(n);
      }
    }), r.stack.push({ value: e, dispose: i, async: t });
  } else t && r.stack.push({ async: !0 });
  return e;
}, Ua = /* @__PURE__ */ (function(r) {
  return function(e) {
    function t(a) {
      e.error = e.hasError ? new r(a, e.error, "An error was suppressed during disposal.") : a, e.hasError = !0;
    }
    var i, s = 0;
    function n() {
      for (; i = e.stack.pop(); )
        try {
          if (!i.async && s === 1) return s = 0, e.stack.push(i), Promise.resolve().then(n);
          if (i.dispose) {
            var a = i.dispose.call(i.value);
            if (i.async) return s |= 2, Promise.resolve(a).then(n, function(o) {
              return t(o), n();
            });
          } else s |= 1;
        } catch (o) {
          t(o);
        }
      if (s === 1) return e.hasError ? Promise.reject(e.error) : Promise.resolve();
      if (e.hasError) throw e.error;
    }
    return n();
  };
})(typeof SuppressedError == "function" ? SuppressedError : function(r, e, t) {
  var i = new Error(t);
  return i.name = "SuppressedError", i.error = r, i.suppressed = e, i;
});
const dd = /^0[xX][0-9a-fA-F]+$/, fd = /^data:.*;base64,/i;
class Na extends sd {
  constructor(e, t, i, s) {
    super(e.input, t, i), this.segments = [], this.nextLines = null, this.currentUpdateSegmentsPromise = null, this.streamHasEnded = !1, this.lastSegmentUpdateTime = -1 / 0, this.refreshInterval = 5, this.rootPath = t, this.demuxer = e, this.nextLines = s;
  }
  runUpdateSegments() {
    return this.currentUpdateSegmentsPromise ??= (async () => {
      try {
        const e = this.getRemainingWaitTimeMs();
        e > 0 && await $i(e), this.lastSegmentUpdateTime = performance.now(), await this.updateSegments();
      } finally {
        this.currentUpdateSegmentsPromise = null;
      }
    })();
  }
  getRemainingWaitTimeMs() {
    const e = performance.now() - this.lastSegmentUpdateTime, t = Math.max(0, 1e3 * this.refreshInterval - e);
    return t <= 50 ? 0 : t;
  }
  /**
   * Reads and parses the segment info from the playlist file. When called more than one, it updates the existing
   * segments by appending the new ones. Existing segments are never removed.
   */
  async updateSegments() {
    let e = this.nextLines;
    if (this.nextLines = null, !e) {
      const k = { stack: [], error: void 0, hasError: !1 };
      try {
        const S = Oa(k, await this.demuxer.input._getSourceUncached({ path: this.rootPath, isRoot: !1 }), !1), A = await new Pr(S.source).requestEntireFile();
        p(A), e = il(A, A.length, { ignore: Ac }), S.source instanceof Zt && (this.rootPath = S.source.rootPath);
      } catch (S) {
        k.error = S, k.hasError = !0;
      } finally {
        Ua(k);
      }
    }
    const t = this.input._formatOptions.hls?.offsetTimestampsByDateTime !== !1;
    let i = !1, s = 0, n = null, a = null, o = null, c = 0, l = null, u = null, d = null, f = null, h = null, g = null, m = !1, w = ne(this.segments) ?? null;
    const y = (k) => {
      const S = k.indexOf("@"), T = Number(S === -1 ? k : k.slice(0, S));
      if (!Number.isInteger(T) || T < 0)
        throw new Error(`Invalid #EXT-X-BYTERANGE length '${k}'.`);
      let A = null;
      if (S !== -1 && (A = Number(k.slice(S + 1)), !Number.isInteger(A) || A < 0))
        throw new Error(`Invalid #EXT-X-BYTERANGE offset '${k}'.`);
      return { length: T, offset: A };
    }, b = (k) => {
      c = k, w && (p(w.sequenceNumber !== null), w.sequenceNumber < k && (s = w.timestamp + w.duration, l = w.firstSegment, u = w.initSegment, h = w.lastProgramDateTimeSeconds, n = w.unixEpochTimestamp !== null ? w.unixEpochTimestamp + w.duration : null, w = null));
    };
    for (let k = 0; k < e.length; k++) {
      const S = e[k];
      if (!i) {
        if (S !== "#EXTM3U")
          throw new Error("Invalid M3U8 file; expected first line to be #EXTM3U.");
        i = !0;
        continue;
      }
      if (!S.startsWith("#")) {
        if (!w) {
          if (a === null)
            throw new Error("Invalid M3U8 file; a segment must be preceded by an #EXTINF tag.");
          let T = o;
          if (T && T.method === "AES-128" && !T.iv) {
            const x = new Uint8Array(et), I = q(x);
            I.setUint32(8, Math.floor(c / 2 ** 32)), I.setUint32(12, c), T = { ...T, iv: x };
          }
          const C = {
            path: Ae(this.rootPath, S),
            offset: f?.offset ?? 0,
            length: f?.length ?? null
          }, _ = {
            timestamp: s,
            unixEpochTimestamp: n,
            firstSegment: l,
            sequenceNumber: c,
            location: C,
            duration: a,
            encryption: T,
            initSegment: u,
            lastProgramDateTimeSeconds: h
          };
          l ??= _, s += a, n !== null && (n += a), this.segments.push(_);
        }
        a = null, f === null ? d = null : f = null, b(c + 1);
      }
      if (S.startsWith(sn)) {
        if (w) {
          m = !0;
          continue;
        }
        m || (h === null && c > 0 && g !== null && (s = c * g), m = !0);
        const T = S.slice(sn.length), A = T.indexOf(","), C = A === -1 ? T : T.slice(0, A), _ = Number(C);
        if (!Number.isFinite(_) || _ < 0)
          throw new Error(`Invalid #EXTINF tag duration '${C}'.`);
        a = _;
      } else if (S.startsWith(Pa)) {
        const T = new qi(S.slice(Pa.length)), A = T.get("uri");
        if (!A)
          throw new Error("Invalid #EXT-X-MAP tag; missing URI attribute.");
        const C = T.get("byterange");
        let _ = null;
        if (C !== null && (_ = y(C)), _ && _.offset === null)
          throw new Error("Invalid #EXT-X-MAP tag; BYTERANGE attribute must have a specified offset.");
        if (!w) {
          const I = {
            path: Ae(this.rootPath, A),
            offset: _?.offset ?? 0,
            length: _?.length ?? null
          };
          if (o?.method === "AES-128" && !o.iv)
            throw new Error("IV attribute must be set on #EXT-X-KEY tag preceding the #EXT-X-MAP tag.");
          u = {
            timestamp: s,
            unixEpochTimestamp: n,
            firstSegment: null,
            sequenceNumber: null,
            location: I,
            duration: 0,
            encryption: o,
            initSegment: null,
            lastProgramDateTimeSeconds: h
          };
        }
        a = null, f === null ? d = null : f = null;
      } else if (S.startsWith(Ca)) {
        const T = new qi(S.slice(Ca.length)), A = T.get("method");
        if (A === "NONE")
          o = null;
        else if (A === "AES-128") {
          const C = T.get("uri");
          if (!C)
            throw new Error("Invalid #EXT-X-KEY: AES-128 requires a URI attribute.");
          let _ = null;
          const x = T.get("iv");
          if (x) {
            if (!dd.test(x))
              throw new Error(`Unsupported IV format '${x}'.`);
            let E = x.slice(2);
            E = E.padStart(et * 2, "0"), _ = new Uint8Array(et);
            for (let v = 0; v < et; v++) {
              const M = -et * 2 + v;
              _[v] = parseInt(E.slice(M, M + 2), 16);
            }
          }
          const I = T.get("keyformat") ?? "identity";
          if (I !== "identity")
            throw new Error("For AES-128 encryption, only the 'identity' KEYFORMAT is currently supported. If you think other formats should be supported, please raise an issue.");
          o = {
            method: "AES-128",
            keyUri: Ae(this.rootPath, C),
            iv: _,
            keyFormat: I
          };
        } else if (A === "SAMPLE-AES" || A === "SAMPLE-AES-CTR") {
          const C = T.get("uri");
          if (!C)
            throw new Error(`Invalid #EXT-X-KEY: ${A} requires a URI attribute.`);
          if ((T.get("keyformat") ?? "identity") === "identity")
            throw new Error("For SAMPLE-AES and SAMPLE-AES-CTR encryption, the 'identity' KEYFORMAT is not supported. If you think this format should be supported, please raise an issue.");
          let x = null;
          if (fd.test(C)) {
            const I = C.indexOf(","), E = Rr(C.slice(I + 1));
            if (E.length >= 8 && E[4] === 112 && E[5] === 115 && E[6] === 115 && E[7] === 104) {
              const v = q(E).getUint32(0);
              x = Zo(E.subarray(8, Math.min(v, E.length)));
            }
          }
          o = {
            method: A,
            psshBox: x
          };
        } else
          throw new Error(`Unsupported encryption method '${A}'. If you think this method should be supported, please raise an issue.`);
      } else if (S.startsWith(_a)) {
        const T = S.slice(_a.length), A = Number(T);
        if (!Number.isInteger(A) || A < 0)
          throw new Error(`Invalid EXT-X-MEDIA-SEQUENCE value '${T}'.`);
        b(A);
      } else if (S.startsWith(Ia)) {
        const T = y(S.slice(Ia.length));
        if (T.offset === null) {
          if (d === null)
            throw new Error("Invalid M3U8 file; #EXT-X-BYTERANGE without offset requires a previous byte range.");
          T.offset = d;
        }
        f = T, d = T.offset + T.length;
      } else if (S.startsWith(Ea)) {
        if (w)
          continue;
        const T = S.slice(Ea.length), A = Date.parse(T);
        if (!Number.isFinite(A))
          continue;
        const C = A / 1e3;
        if (h === C)
          continue;
        if (h === null && this.segments.length > 0) {
          const _ = ne(this.segments), x = _.timestamp + _.duration, I = C - x;
          for (const E of this.segments)
            E.unixEpochTimestamp = E.timestamp + I, t && (E.timestamp = E.unixEpochTimestamp);
        }
        h = C, n = C, t && (s = C);
      } else if (S === td)
        l = null;
      else if (S.startsWith(va)) {
        const T = S.slice(va.length), A = Number(T);
        if (!Number.isFinite(A) || A < 0)
          throw new Error(`Invalid EXT-X-TARGETDURATION value '${T}'.`);
        this.refreshInterval = A, g = A;
      } else if (S === id) {
        this.streamHasEnded = !0;
        break;
      } else S.startsWith(Fa) && S.slice(Fa.length).toLowerCase() === "vod" && (this.streamHasEnded = !0);
    }
    if (!i)
      throw new Error("Invalid M3U8 file; no #EXTM3U header.");
  }
  async getFirstSegment() {
    return this.segments.length === 0 && await this.runUpdateSegments(), this.segments[0] ?? null;
  }
  async getSegmentAt(e, t) {
    this.segments.length === 0 && await this.runUpdateSegments();
    let i = !!t.skipLiveWait && this.getRemainingWaitTimeMs() > 0;
    for (; ; ) {
      const s = $(this.segments, e, (a) => a.timestamp);
      if (s === -1)
        return null;
      if (s < this.segments.length - 1 || this.streamHasEnded || i)
        return this.segments[s];
      const n = this.segments[s];
      if (e < n.timestamp + n.duration)
        return n;
      await this.runUpdateSegments(), t.skipLiveWait && (i = !0);
    }
  }
  async getNextSegment(e, t) {
    const i = this.segments.indexOf(e);
    p(i !== -1);
    const s = i + 1;
    let n = !!t.skipLiveWait && this.getRemainingWaitTimeMs() > 0;
    for (; ; ) {
      if (s < this.segments.length)
        return this.segments[s];
      if (this.streamHasEnded || n)
        return null;
      await this.runUpdateSegments(), t.skipLiveWait && (n = !0);
    }
  }
  async getPreviousSegment(e) {
    const t = this.segments.indexOf(e);
    return p(t !== -1), this.segments[t - 1] ?? null;
  }
  getInputForSegment(e) {
    const t = e, i = this.inputCache.find((c) => c.segment === t);
    if (i)
      return i.age = this.nextInputCacheAge++, i.input;
    let s = null;
    (t.initSegment || t.firstSegment) && (s = this.getInputForSegment(t.initSegment ?? t.firstSegment));
    const n = {
      ...this.input._formatOptions,
      isobmff: {
        ...this.input._formatOptions.isobmff,
        // Intercept calls to resolveKeyId to inject our psshBox knowledge into it
        resolveKeyId: this.input._formatOptions.isobmff?.resolveKeyId && ((c) => {
          if (!t.encryption || !(t.encryption.method === "SAMPLE-AES" || t.encryption.method === "SAMPLE-AES-CTR") || !t.encryption.psshBox)
            return this.input._formatOptions.isobmff.resolveKeyId(c);
          let l = c.psshBoxes;
          const { psshBox: u } = t.encryption;
          return (u.keyIds === null || u.keyIds.includes(c.keyId)) && !l.some((d) => Jo(d, u)) && (l = [...l, u]), this.input._formatOptions.isobmff.resolveKeyId({ ...c, psshBoxes: l });
        })
      }
    }, a = new ns({
      source: new nd(t.location.path, async (c) => {
        p(c.isRoot);
        const l = {
          ...c,
          isRoot: !1
        };
        let u;
        const d = t.location.offset > 0 || t.location.length !== null;
        if (!t.encryption || t.encryption.method === "SAMPLE-AES" || t.encryption.method === "SAMPLE-AES-CTR") {
          if (u = await this.input._getSourceCached(l), d) {
            const h = u.source.slice(t.location.offset, t.location.length ?? void 0).ref();
            u.free(), u = h;
          }
        } else if (t.encryption.method === "AES-128") {
          const f = t.encryption;
          p(f.iv);
          let h = await this.input._getSourceCached(l);
          if (d) {
            const y = h.source.slice(t.location.offset, t.location.length ?? void 0).ref();
            h.free(), h = y;
          }
          const g = new Pr(h.source), m = Au(g, async () => {
            const w = { stack: [], error: void 0, hasError: !1 };
            try {
              const y = Oa(w, await this.input._getSourceCached({ path: f.keyUri, isRoot: !1 }, lf), !1), k = await new Pr(y.source).requestSlice(0, et);
              if (!k)
                throw new Error("Invalid AES-128 key; expected at least 16 bytes of data.");
              return { key: N(k, et), iv: f.iv };
            } catch (y) {
              w.error = y, w.hasError = !0;
            } finally {
              Ua(w);
            }
          }, () => {
            h.free();
          });
          u = new vc(m).ref();
        } else
          p(!1);
        return u;
      }),
      // Do not allow recursive HLS. Cool on paper, but allows for nasty infinite-depth request trees.
      formats: this.input._formats.filter((c) => !(c instanceof Dc)),
      initInput: s ?? void 0,
      formatOptions: n
    });
    if (a._onFormatDetermined = (c) => {
      if ((t.encryption?.method === "SAMPLE-AES" || t.encryption?.method === "SAMPLE-AES-CTR") && !c._isIsobmff)
        throw new Error("The SAMPLE-AES and SAMPLE-AES-CTR encryption methods are currently only supported for ISOBMFF files.");
    }, this.inputCache.push({
      segment: t,
      input: a,
      age: this.nextInputCacheAge++
    }), this.inputCache.length > 4) {
      const c = Tn(this.inputCache, (l) => l.age);
      p(c !== -1), this.inputCache.splice(c, 1);
    }
    return a;
  }
  async getLiveRefreshInterval() {
    return this.getRemainingWaitTimeMs() === 0 && await this.runUpdateSegments(), this.streamHasEnded ? null : this.refreshInterval;
  }
}
class hd extends bt {
  constructor(e) {
    super(e), this.metadataPromise = null, this.trackBackings = null, this.internalTracks = null, this.segmentedInputs = [], this.hasMasterPlaylist = !0;
  }
  readMetadata() {
    return this.metadataPromise ??= (async () => {
      p(this.input._rootSource instanceof Zt);
      const e = await this.input._reader.requestEntireFile();
      p(e);
      const t = il(e, e.length, { ignore: Ac }), { rootPath: i } = this.input._rootSource, s = [], n = [];
      for (let d = 1; d < t.length; d++) {
        const f = t[d];
        if (f.startsWith(Sa)) {
          const h = d, g = t[++d];
          if (g === void 0)
            throw new Error("Incorrect M3U8 file; a line must follow the #EXT-X-STREAM-INF tag.");
          const m = Ae(i, g), w = new qi(f.slice(Sa.length));
          if (w.getAsNumber("bandwidth") === null)
            throw new Error("Invalid M3U8 file; #EXT-X-STREAM-INF tag requires a BANDWIDTH attribute with a valid numerical value.");
          s.push({
            fullPath: m,
            attributes: w,
            lineNumber: h,
            hasOnlyKeyPackets: !1
          });
        } else if (f.startsWith(Aa)) {
          const h = new qi(f.slice(Aa.length)), g = h.get("uri");
          if (g === null)
            throw new Error("Invalid M3U8 file; #EXT-X-I-FRAME-STREAM-INF tag requires a URI attribute.");
          if (h.getAsNumber("bandwidth") === null)
            throw new Error("Invalid M3U8 file; #EXT-X-I-FRAME-STREAM-INF tag requires a BANDWIDTH attribute with a valid numerical value.");
          const w = Ae(i, g);
          s.push({
            fullPath: w,
            attributes: h,
            lineNumber: d,
            hasOnlyKeyPackets: !0
          });
        } else if (f.startsWith(xa)) {
          const h = new qi(f.slice(xa.length));
          if (h.get("type") === null)
            throw new Error("Invalid M3U8 file; #EXT-X-MEDIA tag requires a TYPE attribute.");
          if (h.get("group-id") === null)
            throw new Error("Invalid M3U8 file; #EXT-X-MEDIA tag requires a GROUP-ID attribute.");
          let w = null;
          const y = h.get("uri");
          y !== null && (w = Ae(i, y)), n.push({ fullPath: w, attributes: h, lineNumber: d });
        } else if (f !== rd) {
          if (f.startsWith(sn)) {
            const h = new Na(this, i, null, t);
            this.segmentedInputs = [h], this.hasMasterPlaylist = !1, this.trackBackings = await h.getTrackBackings();
            return;
          }
        }
      }
      const a = [
        ...new Set(n.filter((d) => d.attributes.get("type").toLowerCase() === "video").map((d) => d.attributes.get("group-id")))
      ], o = [
        ...new Set(n.filter((d) => d.attributes.get("type").toLowerCase() === "audio").map((d) => d.attributes.get("group-id")))
      ], c = await Promise.all(s.map(async (d, f) => {
        const h = [], g = d.attributes.get("codecs");
        let m;
        if (g)
          m = g.split(",").map((x) => x.trim());
        else {
          const I = await this.getSegmentedInputForPath(d.fullPath).getTrackBackings(), E = await Promise.all(I.map(async (v) => ({ track: v, codec: await v.getCodec() })));
          m = await Promise.all(E.filter((v) => v.codec !== null).map((v) => v.track.getDecoderConfig().then((M) => M.codec)));
        }
        const w = d.attributes.get("video"), y = d.attributes.get("audio"), b = m.some((x) => de.includes(je(x))), k = m.some((x) => we.includes(je(x)));
        if (w !== null && !b) {
          if (!a.includes(w))
            throw new Error(`Invalid M3U8 file; variant stream references video group "${w}" which is not defined in any #EXT-X-MEDIA tags.`);
          const x = n.find((I) => {
            const E = I.attributes.get("group-id"), v = I.attributes.get("type");
            return E === w && v.toLowerCase() === "video";
          });
          e: if (x) {
            const I = x.attributes.get("uri");
            if (I === null)
              break e;
            const E = Ae(i, I), W = (await this.getSegmentedInputForPath(E).getTrackBackings()).find((z) => z.getType() === "video");
            if (!W || await W.getCodec() === null)
              break e;
            const O = await W.getDecoderConfig().then((z) => z?.codec ?? null);
            p(O !== null), m.push(O);
          }
        }
        if (y !== null && !k) {
          if (!o.includes(y))
            throw new Error(`Invalid M3U8 file; variant stream references audio group "${y}" which is not defined in any #EXT-X-MEDIA tags.`);
          const x = n.find((I) => {
            const E = I.attributes.get("group-id"), v = I.attributes.get("type");
            return E === y && v.toLowerCase() === "audio";
          });
          e: if (x) {
            const I = x.attributes.get("uri");
            if (I === null)
              break e;
            const E = Ae(i, I), W = (await this.getSegmentedInputForPath(E).getTrackBackings()).find((z) => z.getType() === "audio");
            if (!W || await W.getCodec() === null)
              break e;
            const O = await W.getDecoderConfig().then((z) => z?.codec ?? null);
            p(O !== null), m.push(O);
          }
        }
        m = [...new Set(m)];
        let S = null, T = null;
        const A = d.attributes.getAsNumber("bandwidth");
        p(A !== null);
        const C = d.attributes.getAsNumber("average-bandwidth"), _ = d.attributes.get("name");
        for (const x of m) {
          const I = je(x);
          if (I !== null) {
            if (de.includes(I)) {
              if (S !== null)
                throw new Error("Unsupported M3U8 file; multiple video codecs found in the CODECS attribute of a variant stream.");
              S = x;
              const E = d.attributes.get("video");
              if (E === null) {
                const v = d.attributes.get("resolution");
                let M = null, W = null;
                if (v) {
                  const O = v.match(/^(\d+)x(\d+)$/);
                  O && (M = Number(O[1]), W = Number(O[2]));
                }
                h.push({
                  id: -1,
                  demuxer: this,
                  backingTrack: null,
                  default: !0,
                  autoselect: !0,
                  languageCode: ke,
                  lineNumber: d.lineNumber,
                  fullPath: d.fullPath,
                  fullCodecString: S,
                  pairingMask: 1n << BigInt(f),
                  peakBitrate: A,
                  averageBitrate: C,
                  name: _,
                  hasOnlyKeyPackets: d.hasOnlyKeyPackets,
                  info: {
                    type: "video",
                    width: M,
                    height: W
                  }
                });
              } else {
                if (!a.includes(E))
                  throw new Error(`Invalid M3U8 file; variant stream references video group "${E}" which is not defined in any #EXT-X-MEDIA tags.`);
                for (const v of n) {
                  const M = v.attributes.get("group-id"), W = v.attributes.get("type");
                  if (M !== E || W.toLowerCase() !== "video")
                    continue;
                  const O = v.attributes.get("resolution") ?? d.attributes.get("resolution");
                  let z = null, Q = null;
                  if (O) {
                    const J = O.match(/^(\d+)x(\d+)$/);
                    J && (z = Number(J[1]), Q = Number(J[2]));
                  }
                  h.push({
                    id: -1,
                    demuxer: this,
                    backingTrack: null,
                    default: gr(v.attributes),
                    // Autoselect is inferred to be true if the default is true
                    autoselect: gr(v.attributes) || Va(v.attributes),
                    languageCode: Wa(v.attributes.get("language")),
                    lineNumber: v.lineNumber,
                    fullPath: v.fullPath ?? d.fullPath,
                    fullCodecString: S,
                    pairingMask: 1n << BigInt(f),
                    peakBitrate: null,
                    averageBitrate: null,
                    name: v.attributes.get("name"),
                    hasOnlyKeyPackets: d.hasOnlyKeyPackets,
                    info: {
                      type: "video",
                      width: z,
                      height: Q
                    }
                  });
                }
              }
            } else if (we.includes(I)) {
              if (T !== null)
                throw new Error("Unsupported M3U8 file; multiple audio codecs found in the CODECS attribute of a variant stream.");
              T = x;
              const E = d.attributes.get("audio");
              if (E === null) {
                const v = d.attributes.get("channels"), M = v !== null ? Number(v.split("/")[0]) : null;
                h.push({
                  id: -1,
                  demuxer: this,
                  backingTrack: null,
                  default: !0,
                  autoselect: !0,
                  languageCode: ke,
                  lineNumber: d.lineNumber,
                  fullPath: d.fullPath,
                  fullCodecString: T,
                  pairingMask: 1n << BigInt(f),
                  peakBitrate: A,
                  averageBitrate: C,
                  name: _,
                  hasOnlyKeyPackets: d.hasOnlyKeyPackets,
                  info: {
                    type: "audio",
                    numberOfChannels: M !== null && Number.isInteger(M) && M > 0 ? M : null
                  }
                });
              } else {
                if (!o.includes(E))
                  throw new Error(`Invalid M3U8 file; variant stream references audio group "${E}" which is not defined in any #EXT-X-MEDIA tags.`);
                for (const v of n) {
                  const M = v.attributes.get("group-id"), W = v.attributes.get("type");
                  if (M !== E || W.toLowerCase() !== "audio")
                    continue;
                  const O = v.attributes.get("channels") ?? d.attributes.get("channels"), z = O !== null ? Number(O.split("/")[0]) : null;
                  h.push({
                    id: -1,
                    demuxer: this,
                    backingTrack: null,
                    default: gr(v.attributes),
                    // Autoselect is inferred to be true if the default is true
                    autoselect: gr(v.attributes) || Va(v.attributes),
                    languageCode: Wa(v.attributes.get("language")),
                    lineNumber: v.lineNumber,
                    fullPath: v.fullPath ?? d.fullPath,
                    fullCodecString: T,
                    pairingMask: 1n << BigInt(f),
                    peakBitrate: null,
                    averageBitrate: null,
                    name: v.attributes.get("name"),
                    hasOnlyKeyPackets: d.hasOnlyKeyPackets,
                    info: {
                      type: "audio",
                      numberOfChannels: z !== null && Number.isInteger(z) && z > 0 ? z : null
                    }
                  });
                }
              }
            }
          }
        }
        return h;
      })), l = [], u = (d) => {
        const f = l.find((h) => h.fullPath === d.fullPath && h.info.type === d.info.type);
        f ? (f.pairingMask |= d.pairingMask, f.default ||= d.default, f.autoselect ||= d.autoselect, f.lineNumber = Math.min(f.lineNumber, d.lineNumber), d.peakBitrate !== null && (f.peakBitrate = Math.max(f.peakBitrate ?? -1 / 0, d.peakBitrate)), d.averageBitrate !== null && (f.averageBitrate = Math.max(f.averageBitrate ?? -1 / 0, d.averageBitrate)), f.languageCode === ke && (f.languageCode = d.languageCode)) : (d.id = l.length + 1, l.push(d));
      };
      for (const d of c)
        for (const f of d)
          u(f);
      l.sort((d, f) => d.lineNumber - f.lineNumber), this.trackBackings = [];
      for (const d of l)
        d.info.type === "video" ? this.trackBackings.push(new Bc(d)) : this.trackBackings.push(new Rc(d));
      this.internalTracks = l;
    })();
  }
  async getTrackBackings() {
    return await this.readMetadata(), p(this.trackBackings), this.trackBackings;
  }
  getSegmentedInputForPath(e) {
    let t = this.segmentedInputs.find((s) => s.path === e);
    if (t)
      return t;
    let i = null;
    return this.internalTracks && (i = this.internalTracks.filter((n) => n.fullPath === e).map((n) => ({
      id: n.id,
      type: n.info.type
    }))), t = new Na(this, e, i, null), this.segmentedInputs.push(t), t;
  }
  async getMetadataTags() {
    return {};
  }
  async getMimeType() {
    return pi;
  }
  dispose() {
    if (this.segmentedInputs) {
      for (const e of this.segmentedInputs)
        e.dispose();
      this.segmentedInputs.length = 0;
    }
  }
}
class Fc {
  constructor(e) {
    this.internalTrack = e, this.hydrationPromise = null;
  }
  hydrate() {
    return this.hydrationPromise ??= (async () => {
      const e = this.internalTrack.demuxer.getSegmentedInputForPath(this.internalTrack.fullPath);
      let t = null;
      const s = (await e.getTrackBackings()).filter((n) => n.getType() === this.getType());
      if (s.length === 1)
        t = s[0];
      else if (this instanceof Bc) {
        for (const n of s)
          if (await n.getCodec() === this.getCodec()) {
            t = n;
            break;
          }
      } else {
        p(this instanceof Rc);
        for (const n of s)
          if (await n.getCodec() === this.getCodec()) {
            t = n;
            break;
          }
      }
      if (!t)
        throw new Error("Could not find matching track in underlying media data.");
      this.internalTrack.backingTrack = t;
    })();
  }
  /** If the backing track is already present, delegate synchronously; otherwise, hydrate first. */
  delegate(e) {
    return this.internalTrack.backingTrack ? e() : this.hydrate().then(e);
  }
  getCodec() {
    throw new Error("Not implemented on base class.");
  }
  getDisposition() {
    return {
      ...yt,
      // Meanings are swapped in HLS: "Default" means that a track is the primary track.
      default: this.internalTrack.autoselect,
      primary: this.internalTrack.default
    };
  }
  getId() {
    return this.internalTrack.id;
  }
  getPairingMask() {
    return this.internalTrack.pairingMask;
  }
  getInternalCodecId() {
    return null;
  }
  getLanguageCode() {
    return this.internalTrack.languageCode;
  }
  getName() {
    return this.internalTrack.name;
  }
  getNumber() {
    p(this.internalTrack.demuxer.internalTracks);
    const e = this.internalTrack.info.type;
    let t = 0;
    for (const i of this.internalTrack.demuxer.internalTracks)
      if (i.info.type === e && t++, i === this.internalTrack)
        break;
    return t;
  }
  getTimeResolution() {
    return this.delegate(() => this.internalTrack.backingTrack.getTimeResolution());
  }
  isRelativeToUnixEpoch() {
    return this.delegate(() => this.internalTrack.backingTrack.isRelativeToUnixEpoch());
  }
  getUnixTimeForTimestamp(e) {
    return this.delegate(() => this.internalTrack.backingTrack.getUnixTimeForTimestamp(e));
  }
  getBitrate() {
    return this.internalTrack.peakBitrate;
  }
  getAverageBitrate() {
    return this.internalTrack.averageBitrate;
  }
  async getDurationFromMetadata(e) {
    return await this.hydrate(), this.internalTrack.backingTrack.getDurationFromMetadata(e);
  }
  async getLiveRefreshInterval() {
    return await this.hydrate(), this.internalTrack.backingTrack.getLiveRefreshInterval();
  }
  getHasOnlyKeyPackets() {
    return this.internalTrack.hasOnlyKeyPackets || null;
  }
  async getFirstPacket(e) {
    return await this.hydrate(), this.internalTrack.backingTrack.getFirstPacket(e);
  }
  async getPacket(e, t) {
    return await this.hydrate(), this.internalTrack.backingTrack.getPacket(e, t);
  }
  async getKeyPacket(e, t) {
    return await this.hydrate(), this.internalTrack.backingTrack.getKeyPacket(e, t);
  }
  async getNextPacket(e, t) {
    return await this.hydrate(), this.internalTrack.backingTrack.getNextPacket(e, t);
  }
  async getNextKeyPacket(e, t) {
    return await this.hydrate(), this.internalTrack.backingTrack.getNextKeyPacket(e, t);
  }
}
class Bc extends Fc {
  constructor(e) {
    super(e);
  }
  get backingVideoTrack() {
    return this.internalTrack.backingTrack;
  }
  getType() {
    return "video";
  }
  getCodec() {
    return je(this.internalTrack.fullCodecString);
  }
  getCodedWidth() {
    return this.delegate(() => this.backingVideoTrack.getCodedWidth());
  }
  getCodedHeight() {
    return this.delegate(() => this.backingVideoTrack.getCodedHeight());
  }
  getSquarePixelWidth() {
    return this.delegate(() => this.backingVideoTrack.getSquarePixelWidth());
  }
  getSquarePixelHeight() {
    return this.delegate(() => this.backingVideoTrack.getSquarePixelHeight());
  }
  getMetadataDisplayWidth() {
    return this.backingVideoTrack ? null : this.internalTrack.info.width;
  }
  getMetadataDisplayHeight() {
    return this.backingVideoTrack ? null : this.internalTrack.info.height;
  }
  getRotation() {
    return this.delegate(() => this.backingVideoTrack.getRotation());
  }
  async getColorSpace() {
    return await this.hydrate(), this.backingVideoTrack.getColorSpace();
  }
  async canBeTransparent() {
    return await this.hydrate(), this.backingVideoTrack.canBeTransparent();
  }
  getMetadataCodecParameterString() {
    return this.backingVideoTrack ? null : this.internalTrack.fullCodecString;
  }
  async getDecoderConfig() {
    return await this.hydrate(), this.backingVideoTrack.getDecoderConfig();
  }
}
class Rc extends Fc {
  constructor(e) {
    super(e);
  }
  get backingAudioTrack() {
    return this.internalTrack.backingTrack;
  }
  getType() {
    return "audio";
  }
  getCodec() {
    return je(this.internalTrack.fullCodecString);
  }
  getNumberOfChannels() {
    return this.internalTrack.info.numberOfChannels !== null ? this.internalTrack.info.numberOfChannels : this.delegate(() => this.backingAudioTrack.getNumberOfChannels());
  }
  getSampleRate() {
    return this.delegate(() => this.backingAudioTrack.getSampleRate());
  }
  getMetadataCodecParameterString() {
    return this.backingAudioTrack ? null : this.internalTrack.fullCodecString;
  }
  async getDecoderConfig() {
    return await this.hydrate(), this.backingAudioTrack.getDecoderConfig();
  }
}
const gr = (r) => {
  const e = r.get("default");
  if (e === null)
    return !1;
  const t = e.toUpperCase();
  if (t === "YES")
    return !0;
  if (t === "NO")
    return !1;
  throw new Error(`Invalid M3U8 file; #EXT-X-MEDIA DEFAULT attribute must be YES or NO, got "${e}".`);
}, Va = (r) => {
  const e = r.get("autoselect");
  if (e === null)
    return !1;
  const t = e.toUpperCase();
  if (t === "YES")
    return !0;
  if (t === "NO")
    return !1;
  throw new Error(`Invalid M3U8 file; #EXT-X-MEDIA AUTOSELECT attribute must be YES or NO, got "${e}".`);
}, Wa = (r) => {
  if (r === null)
    return ke;
  const e = r.split("-")[0];
  return e || ke;
};
class rt {
  constructor() {
    this._isIsobmff = !1;
  }
}
class Mc extends rt {
  constructor() {
    super(...arguments), this._isIsobmff = !0;
  }
  /** @internal */
  async _getMajorBrand(e) {
    let t = e._reader.requestSlice(0, 12);
    if (t instanceof Promise && (t = await t), !t)
      return null;
    t.skip(4);
    const i = oe(t, 4);
    return i !== "ftyp" && i !== "styp" ? null : oe(t, 4);
  }
  /** @internal */
  _createDemuxer(e) {
    return new Mn(e);
  }
}
class md extends Mc {
  /** @internal */
  async _canReadInput(e) {
    const t = await this._getMajorBrand(e);
    if (t !== null)
      return t !== "qt  ";
    let i = e._reader.requestSlice(4, 4);
    if (i instanceof Promise && (i = await i), !i)
      return !1;
    const s = oe(i, 4);
    return s === "moof" || s === "sidx";
  }
  get name() {
    return "MP4";
  }
  get mimeType() {
    return "video/mp4";
  }
}
class pd extends Mc {
  /** @internal */
  async _canReadInput(e) {
    return await this._getMajorBrand(e) === "qt  ";
  }
  get name() {
    return "QuickTime File Format";
  }
  get mimeType() {
    return "video/quicktime";
  }
}
class zc extends rt {
  /** @internal */
  async isSupportedEBMLOfDocType(e, t) {
    let i = e._reader.requestSlice(0, dt);
    if (i instanceof Promise && (i = await i), !i)
      return !1;
    const s = oc(i);
    if (s === null || s < 1 || s > 8 || K(i, s) !== P.EBML)
      return !1;
    const a = cc(i);
    if (typeof a != "number")
      return !1;
    let o = e._reader.requestSlice(i.filePos, a);
    if (o instanceof Promise && (o = await o), !o)
      return !1;
    const c = i.filePos;
    for (; o.filePos <= c + a - De; ) {
      const l = ct(o);
      if (!l)
        break;
      const { id: u, size: d } = l, f = o.filePos;
      if (d === void 0)
        return !1;
      switch (u) {
        case P.EBMLVersion:
          if (K(o, d) !== 1)
            return !1;
          break;
        case P.EBMLReadVersion:
          if (K(o, d) !== 1)
            return !1;
          break;
        case P.DocType:
          if (oi(o, d) !== t)
            return !1;
          break;
        case P.DocTypeVersion:
          if (K(o, d) > 4)
            return !1;
          break;
      }
      o.filePos = f + d;
    }
    return !0;
  }
  /** @internal */
  _canReadInput(e) {
    return this.isSupportedEBMLOfDocType(e, "matroska");
  }
  /** @internal */
  _createDemuxer(e) {
    return new Mu(e);
  }
  get name() {
    return "Matroska";
  }
  get mimeType() {
    return "video/x-matroska";
  }
}
class gd extends zc {
  /** @internal */
  _canReadInput(e) {
    return this.isSupportedEBMLOfDocType(e, "webm");
  }
  get name() {
    return "WebM";
  }
  get mimeType() {
    return "video/webm";
  }
}
class wd extends rt {
  /** @internal */
  async _canReadInput(e) {
    let t = 0;
    for (; ; ) {
      let d = e._reader.requestSlice(t, Ne);
      if (d instanceof Promise && (d = await d), !d)
        break;
      const f = wt(d);
      if (!f)
        break;
      t = d.filePos + f.size;
    }
    const i = await tn(e._reader, t, t + 4096);
    if (!i)
      return !1;
    const s = i.header, n = Xr(s.mpegVersionId, s.channel);
    let a = e._reader.requestSlice(i.startPos + n, 4);
    if (a instanceof Promise && (a = await a), !a)
      return !1;
    const o = B(a);
    if (o === Gr || o === _n)
      return !0;
    t = i.startPos + i.header.totalSize;
    const l = await tn(e._reader, t, t + Kt);
    if (!l)
      return !1;
    const u = l.header;
    return !(s.channel !== u.channel || s.sampleRate !== u.sampleRate);
  }
  /** @internal */
  _createDemuxer(e) {
    return new Ou(e);
  }
  get name() {
    return "MP3";
  }
  get mimeType() {
    return "audio/mpeg";
  }
}
class yd extends rt {
  /** @internal */
  async _canReadInput(e) {
    let t = e._reader.requestSlice(0, 12);
    if (t instanceof Promise && (t = await t), !t)
      return !1;
    const i = oe(t, 4);
    return i !== "RIFF" && i !== "RIFX" && i !== "RF64" ? !1 : (t.skip(4), oe(t, 4) === "WAVE");
  }
  /** @internal */
  _createDemuxer(e) {
    return new qu(e);
  }
  get name() {
    return "WAVE";
  }
  get mimeType() {
    return "audio/wav";
  }
}
class bd extends rt {
  /** @internal */
  async _canReadInput(e) {
    let t = e._reader.requestSlice(0, 4);
    return t instanceof Promise && (t = await t), t ? oe(t, 4) === "OggS" : !1;
  }
  /** @internal */
  _createDemuxer(e) {
    return new Wu(e);
  }
  get name() {
    return "Ogg";
  }
  get mimeType() {
    return "application/ogg";
  }
}
class kd extends rt {
  /** @internal */
  async _canReadInput(e) {
    let t = 0;
    for (; ; ) {
      let s = e._reader.requestSlice(t, Ne);
      if (s instanceof Promise && (s = await s), !s)
        break;
      const n = wt(s);
      if (!n)
        break;
      t = s.filePos + n.size;
    }
    let i = e._reader.requestSlice(t, 4);
    return i instanceof Promise && (i = await i), i ? oe(i, 4) === "fLaC" : !1;
  }
  get name() {
    return "FLAC";
  }
  get mimeType() {
    return "audio/flac";
  }
  /** @internal */
  _createDemuxer(e) {
    return new Xu(e);
  }
}
class Td extends rt {
  /** @internal */
  async _canReadInput(e) {
    let t = 0;
    for (; ; ) {
      let a = e._reader.requestSlice(t, Ne);
      if (a instanceof Promise && (a = await a), !a)
        break;
      const o = wt(a);
      if (!o)
        break;
      t = a.filePos + o.size;
    }
    let i = e._reader.requestSliceRange(t, Ji, Et);
    if (i instanceof Promise && (i = await i), !i)
      return !1;
    const s = gt(i);
    if (!s || (t += s.frameLength, i = e._reader.requestSliceRange(t, Ji, Et), i instanceof Promise && (i = await i), !i))
      return !1;
    const n = gt(i);
    return n ? s.objectType === n.objectType && s.samplingFrequencyIndex === n.samplingFrequencyIndex && s.channelConfiguration === n.channelConfiguration : !1;
  }
  /** @internal */
  _createDemuxer(e) {
    return new ju(e);
  }
  get name() {
    return "ADTS";
  }
  get mimeType() {
    return "audio/aac";
  }
}
class Sd extends rt {
  /** @internal */
  async _canReadInput(e) {
    const t = _e + 16 + 1;
    let i = e._reader.requestSlice(0, t);
    if (i instanceof Promise && (i = await i), !i)
      return !1;
    const s = N(i, t);
    return s[0] === 71 && s[_e] === 71 || s[0] === 71 && s[_e + 16] === 71 ? !0 : s[4] === 71 && s[4 + _e + 4] === 71;
  }
  /** @internal */
  _createDemuxer(e) {
    return new Zu(e);
  }
  get name() {
    return "MPEG Transport Stream";
  }
  get mimeType() {
    return "video/MP2T";
  }
}
class Dc extends rt {
  /** @internal */
  async _canReadInput(e) {
    let t = e._reader.requestSlice(0, 7);
    if (t instanceof Promise && (t = await t), !t || !(oe(t, 7) === "#EXTM3U"))
      return !1;
    if (!(e._rootSource instanceof Zt))
      throw new TypeError("HLS inputs require `InputOptions.source` to be a PathedSource or a ref to one.");
    return e._rootSource._usedForHls = !0, !0;
  }
  /** @internal */
  _createDemuxer(e) {
    return new hd(e);
  }
  get name() {
    return "HTTP Live Streaming (HLS)";
  }
  get mimeType() {
    return pi;
  }
}
const Oc = /* @__PURE__ */ new md(), Uc = /* @__PURE__ */ new pd(), Ad = /* @__PURE__ */ new zc(), xd = /* @__PURE__ */ new gd(), Nc = /* @__PURE__ */ new wd(), Pd = /* @__PURE__ */ new yd(), Cd = /* @__PURE__ */ new bd(), Vc = /* @__PURE__ */ new Td(), _d = /* @__PURE__ */ new kd(), Wc = /* @__PURE__ */ new Sd(), Lc = /* @__PURE__ */ new Dc(), Sm = [Lc, Oc, Uc, Ad, xd, Pd, Cd, _d, Nc, Vc, Wc], Am = [Lc, Oc, Uc, Nc, Vc, Wc], Id = (r, e) => {
  if (!r || typeof r != "object")
    throw new TypeError(`${e}, when provided, must be an object.`);
  if (r.isobmff !== void 0) {
    if (!r.isobmff || typeof r.isobmff != "object")
      throw new TypeError(`${e}.isobmff, when provided, must be an object.`);
    if (r.isobmff.resolveKeyId !== void 0 && typeof r.isobmff.resolveKeyId != "function")
      throw new TypeError(`${e}.isobmff.resolveKeyId, when provided, must be a function.`);
  }
  if (r.hls !== void 0) {
    if (!r.hls || typeof r.hls != "object")
      throw new TypeError(`${e}.hls, when provided, must be an object.`);
    if (r.hls.offsetTimestampsByDateTime !== void 0 && typeof r.hls.offsetTimestampsByDateTime != "boolean")
      throw new TypeError(`${e}.hls.offsetTimestampsByDateTime, when provided, must be a boolean.`);
  }
};
const an = /* @__PURE__ */ new Map(), on = /* @__PURE__ */ new Map(), Ed = (r, e) => {
  if (!e || typeof e != "object")
    throw new TypeError("options must be an object.");
  if (e.codec !== void 0 && typeof e.codec != "string")
    throw new TypeError("options.codec, when provided, must be a string.");
  if (e.codec !== void 0 && je(e.codec) !== r)
    throw new TypeError(`options.codec, when provided, must match the specified codec (${r}).`);
  if (e.codedWidth !== void 0 && (!Number.isInteger(e.codedWidth) || e.codedWidth <= 0))
    throw new TypeError("options.codedWidth, when provided, must be a positive integer.");
  if (e.codedHeight !== void 0 && (!Number.isInteger(e.codedHeight) || e.codedHeight <= 0))
    throw new TypeError("options.codedHeight, when provided, must be a positive integer.");
  if (e.displayAspectWidth !== void 0 && (!Number.isInteger(e.displayAspectWidth) || e.displayAspectWidth <= 0))
    throw new TypeError("options.displayAspectWidth, when provided, must be a positive integer.");
  if (e.displayAspectHeight !== void 0 && (!Number.isInteger(e.displayAspectHeight) || e.displayAspectHeight <= 0))
    throw new TypeError("options.displayAspectHeight, when provided, must be a positive integer.");
  if (e.description !== void 0 && !ki(e.description))
    throw new TypeError("options.description, when provided, must be a buffer source.");
  if (e.hardwareAcceleration !== void 0 && !["no-preference", "prefer-hardware", "prefer-software"].includes(e.hardwareAcceleration))
    throw new TypeError("options.hardwareAcceleration, when provided, must be 'no-preference', 'prefer-hardware' or 'prefer-software'.");
  if (e.optimizeForLatency !== void 0 && typeof e.optimizeForLatency != "boolean")
    throw new TypeError("options.optimizeForLatency, when provided, must be a boolean.");
}, vd = (r, e) => {
  if (!e || typeof e != "object")
    throw new TypeError("options must be an object.");
  if (e.codec !== void 0 && typeof e.codec != "string")
    throw new TypeError("options.codec, when provided, must be a string.");
  if (e.codec !== void 0 && je(e.codec) !== r)
    throw new TypeError(`options.codec, when provided, must match the specified codec (${r}).`);
  if (e.numberOfChannels !== void 0 && (!Number.isInteger(e.numberOfChannels) || e.numberOfChannels <= 0))
    throw new TypeError("options.numberOfChannels, when provided, must be a positive integer.");
  if (e.sampleRate !== void 0 && (!Number.isInteger(e.sampleRate) || e.sampleRate <= 0))
    throw new TypeError("options.sampleRate, when provided, must be a positive integer.");
  if (e.description !== void 0 && !ki(e.description))
    throw new TypeError("options.description, when provided, must be a buffer source.");
}, xm = (r) => de.includes(r) ? qc(r) : we.includes(r) ? Hc(r) : !1, qc = async (r, e = {}) => {
  if (!de.includes(r))
    return !1;
  Ed(r, e);
  const t = {
    ...e,
    codedWidth: e.codedWidth ?? 1280,
    codedHeight: e.codedHeight ?? 720,
    codec: e.codec ?? Fo(r, 1280, 720, 1e6, !1)
  };
  t.description ??= Kl();
  const i = JSON.stringify(t), s = an.get(i);
  if (s)
    return s;
  const n = (async () => ir.some((o) => o.supports(r, t)) ? !0 : typeof VideoDecoder > "u" ? !1 : (await VideoDecoder.isConfigSupported(t)).supported === !0)();
  return an.set(i, n), n;
}, Hc = async (r, e = {}) => {
  if (!we.includes(r))
    return !1;
  vd(r, e);
  const t = {
    ...e,
    numberOfChannels: e.numberOfChannels ?? 2,
    sampleRate: e.sampleRate ?? 48e3,
    codec: e.codec ?? Ro(r, 2, 48e3)
  };
  if (t.description === void 0) {
    const a = Ql(t);
    if (a === !1)
      return !1;
    t.description = a;
  }
  const i = JSON.stringify(t), s = on.get(i);
  if (s)
    return s;
  const n = (async () => rr.some((o) => o.supports(r, t)) || ge.includes(r) ? !0 : typeof AudioDecoder > "u" ? !1 : (await AudioDecoder.isConfigSupported(t)).supported === !0)();
  return on.set(i, n), n;
}, Pm = async () => {
  const [r, e] = await Promise.all([
    Fd(),
    Bd()
  ]);
  return [...r, ...e];
}, Fd = async (r = de, e) => {
  const t = await Promise.all(r.map((i) => qc(i, e)));
  return r.filter((i, s) => t[s]);
}, Bd = async (r = we, e) => {
  const t = await Promise.all(r.map((i) => Hc(i, e)));
  return r.filter((i, s) => t[s]);
};
var Rd = function(r, e, t) {
  if (e != null) {
    if (typeof e != "object" && typeof e != "function") throw new TypeError("Object expected.");
    var i, s;
    if (t) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      i = e[Symbol.asyncDispose];
    }
    if (i === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      i = e[Symbol.dispose], t && (s = i);
    }
    if (typeof i != "function") throw new TypeError("Object not disposable.");
    s && (i = function() {
      try {
        s.call(this);
      } catch (n) {
        return Promise.reject(n);
      }
    }), r.stack.push({ value: e, dispose: i, async: t });
  } else t && r.stack.push({ async: !0 });
  return e;
}, Md = /* @__PURE__ */ (function(r) {
  return function(e) {
    function t(a) {
      e.error = e.hasError ? new r(a, e.error, "An error was suppressed during disposal.") : a, e.hasError = !0;
    }
    var i, s = 0;
    function n() {
      for (; i = e.stack.pop(); )
        try {
          if (!i.async && s === 1) return s = 0, e.stack.push(i), Promise.resolve().then(n);
          if (i.dispose) {
            var a = i.dispose.call(i.value);
            if (i.async) return s |= 2, Promise.resolve(a).then(n, function(o) {
              return t(o), n();
            });
          } else s |= 1;
        } catch (o) {
          t(o);
        }
      if (s === 1) return e.hasError ? Promise.reject(e.error) : Promise.resolve();
      if (e.hasError) throw e.error;
    }
    return n();
  };
})(typeof SuppressedError == "function" ? SuppressedError : function(r, e, t) {
  var i = new Error(t);
  return i.name = "SuppressedError", i.error = r, i.suppressed = e, i;
});
kn();
let La = -1 / 0, qa = -1 / 0, er = null;
typeof FinalizationRegistry < "u" && (er = new FinalizationRegistry((r) => {
  const e = performance.now();
  r.type === "video" ? (e - La >= 1e3 && (D._error("A VideoSample was garbage collected without first being closed. For proper resource management, make sure to call close() on all your VideoSamples as soon as you're done using them."), La = e), typeof VideoFrame < "u" && r.data instanceof VideoFrame && r.data.close()) : (e - qa >= 1e3 && (D._error("An AudioSample was garbage collected without first being closed. For proper resource management, make sure to call close() on all your AudioSamples as soon as you're done using them."), qa = e), typeof AudioData < "u" && r.data instanceof AudioData && r.data.close());
}));
class Mt {
  constructor() {
    this._referenceCount = 0, this._lastAllocationBuffer = null;
  }
}
const cn = [
  // 4:2:0 Y, U, V
  "I420",
  "I420P10",
  "I420P12",
  // 4:2:0 Y, U, V, A
  "I420A",
  "I420AP10",
  "I420AP12",
  // 4:2:2 Y, U, V
  "I422",
  "I422P10",
  "I422P12",
  // 4:2:2 Y, U, V, A
  "I422A",
  "I422AP10",
  "I422AP12",
  // 4:4:4 Y, U, V
  "I444",
  "I444P10",
  "I444P12",
  // 4:4:4 Y, U, V, A
  "I444A",
  "I444AP10",
  "I444AP12",
  // 4:2:0 Y, UV
  "NV12",
  // 4:4:4 RGBA
  "RGBA",
  // 4:4:4 RGBX (opaque)
  "RGBX",
  // 4:4:4 BGRA
  "BGRA",
  // 4:4:4 BGRX (opaque)
  "BGRX"
], zd = new Set(cn);
class be {
  /** The width of the frame in pixels. */
  get codedWidth() {
    return this.visibleRect.width;
  }
  /** The height of the frame in pixels. */
  get codedHeight() {
    return this.visibleRect.height;
  }
  /** The display width of the frame in pixels, after aspect ratio adjustment and rotation. */
  get displayWidth() {
    return this.rotation % 180 === 0 ? this.squarePixelWidth : this.squarePixelHeight;
  }
  /** The display height of the frame in pixels, after aspect ratio adjustment and rotation. */
  get displayHeight() {
    return this.rotation % 180 === 0 ? this.squarePixelHeight : this.squarePixelWidth;
  }
  /** The presentation timestamp of the frame in microseconds. */
  get microsecondTimestamp() {
    return Math.trunc(Ct * this.timestamp);
  }
  /** The duration of the frame in microseconds. */
  get microsecondDuration() {
    return Math.trunc(Ct * this.duration);
  }
  /**
   * Whether this sample uses a pixel format that can hold transparency data. Note that this doesn't necessarily mean
   * that the sample is transparent.
   */
  get hasAlpha() {
    return this.format && this.format.includes("A");
  }
  constructor(e, t) {
    if (this._closed = !1, e instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && e instanceof SharedArrayBuffer || ArrayBuffer.isView(e)) {
      if (!t || typeof t != "object")
        throw new TypeError("init must be an object.");
      if (t.format === void 0 || !zd.has(t.format))
        throw new TypeError("init.format must be one of: " + cn.join(", "));
      if (!Number.isInteger(t.codedWidth) || t.codedWidth <= 0)
        throw new TypeError("init.codedWidth must be a positive integer.");
      if (!Number.isInteger(t.codedHeight) || t.codedHeight <= 0)
        throw new TypeError("init.codedHeight must be a positive integer.");
      if (t.rotation !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
        throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if (!Number.isFinite(t.timestamp))
        throw new TypeError("init.timestamp must be a number.");
      if (t.duration !== void 0 && (!Number.isFinite(t.duration) || t.duration < 0))
        throw new TypeError("init.duration, when provided, must be a non-negative number.");
      if (t.layout !== void 0) {
        if (!Array.isArray(t.layout))
          throw new TypeError("init.layout, when provided, must be an array.");
        for (const n of t.layout) {
          if (!n || typeof n != "object" || Array.isArray(n))
            throw new TypeError("Each entry in init.layout must be an object.");
          if (!Number.isInteger(n.offset) || n.offset < 0)
            throw new TypeError("plane.offset must be a non-negative integer.");
          if (!Number.isInteger(n.stride) || n.stride < 0)
            throw new TypeError("plane.stride must be a non-negative integer.");
        }
      }
      if (t.visibleRect !== void 0 && ms(t.visibleRect, "init.visibleRect"), t.displayWidth !== void 0 && (!Number.isInteger(t.displayWidth) || t.displayWidth <= 0))
        throw new TypeError("init.displayWidth, when provided, must be a positive integer.");
      if (t.displayHeight !== void 0 && (!Number.isInteger(t.displayHeight) || t.displayHeight <= 0))
        throw new TypeError("init.displayHeight, when provided, must be a positive integer.");
      if (t.displayWidth !== void 0 != (t.displayHeight !== void 0))
        throw new TypeError("init.displayWidth and init.displayHeight must be either both provided or both omitted.");
      this.format = t.format, this.rotation = t.rotation ?? 0, this.timestamp = t.timestamp, this.duration = t.duration ?? 0;
      const i = t.layout ?? Od(t.format, t.codedWidth, t.codedHeight);
      let s = t.colorSpace ?? null;
      s === null && (this.format === "RGBA" || this.format === "RGBX" || this.format === "BGRA" || this.format === "BGRX" ? s = {
        primaries: "bt709",
        transfer: "iec61966-2-1",
        matrix: "rgb",
        fullRange: !0
      } : s = {
        primaries: "bt709",
        transfer: "bt709",
        matrix: "bt709",
        fullRange: !1
      }), this.visibleRect = {
        left: t.visibleRect?.left ?? 0,
        top: t.visibleRect?.top ?? 0,
        width: t.visibleRect?.width ?? t.codedWidth,
        height: t.visibleRect?.height ?? t.codedHeight
      }, t.displayWidth !== void 0 ? (this.squarePixelWidth = this.rotation % 180 === 0 ? t.displayWidth : t.displayHeight, this.squarePixelHeight = this.rotation % 180 === 0 ? t.displayHeight : t.displayWidth) : (this.squarePixelWidth = this.visibleRect.width, this.squarePixelHeight = this.visibleRect.height), this._data = t._doNotCopy ? te(e) : te(e).slice(), this._layout = i, this.colorSpace = new Ss(s);
    } else if (typeof VideoFrame < "u" && e instanceof VideoFrame) {
      if (t?.rotation !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
        throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if (t?.timestamp !== void 0 && !Number.isFinite(t?.timestamp))
        throw new TypeError("init.timestamp, when provided, must be a number.");
      if (t?.duration !== void 0 && (!Number.isFinite(t.duration) || t.duration < 0))
        throw new TypeError("init.duration, when provided, must be a non-negative number.");
      t?.visibleRect !== void 0 && ms(t.visibleRect, "init.visibleRect"), this._data = e, this._layout = null, this.format = e.format, this.visibleRect = {
        left: e.visibleRect?.x ?? 0,
        top: e.visibleRect?.y ?? 0,
        width: e.visibleRect?.width ?? e.codedWidth,
        height: e.visibleRect?.height ?? e.codedHeight
      }, this.rotation = t?.rotation ?? 0, this.squarePixelWidth = e.displayWidth, this.squarePixelHeight = e.displayHeight, this.timestamp = t?.timestamp ?? e.timestamp / 1e6, this.duration = t?.duration ?? (e.duration ?? 0) / 1e6, this.colorSpace = new Ss(e.colorSpace);
    } else if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof SVGImageElement < "u" && e instanceof SVGImageElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap || typeof HTMLVideoElement < "u" && e instanceof HTMLVideoElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas) {
      if (!t || typeof t != "object")
        throw new TypeError("init must be an object.");
      if (t.rotation !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
        throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if (!Number.isFinite(t.timestamp))
        throw new TypeError("init.timestamp must be a number.");
      if (t.duration !== void 0 && (!Number.isFinite(t.duration) || t.duration < 0))
        throw new TypeError("init.duration, when provided, must be a non-negative number.");
      if (t.visibleRect !== void 0 && ms(t.visibleRect, "init.visibleRect"), typeof VideoFrame < "u")
        return new be(new VideoFrame(e, {
          timestamp: Math.trunc(t.timestamp * Ct),
          // Drag 0 to undefined
          duration: Math.trunc((t.duration ?? 0) * Ct) || void 0,
          // WebCodecs wants DOMRectInit
          visibleRect: t.visibleRect && {
            x: t.visibleRect.left,
            y: t.visibleRect.top,
            width: t.visibleRect.width,
            height: t.visibleRect.height
          }
        }), t);
      let i = 0, s = 0;
      if ("naturalWidth" in e ? (i = e.naturalWidth, s = e.naturalHeight) : "videoWidth" in e ? (i = e.videoWidth, s = e.videoHeight) : "width" in e && (i = Number(e.width), s = Number(e.height)), !i || !s)
        throw new TypeError("Could not determine dimensions.");
      const n = t.visibleRect ?? { left: 0, top: 0, width: i, height: s }, a = new OffscreenCanvas(n.width, n.height), o = a.getContext("2d", {
        alpha: Br(),
        // Firefox has VideoFrame glitches with opaque canvases
        willReadFrequently: !0
      });
      if (!o)
        throw new Error("OffscreenCanvas must have support for the '2d' context in order to create a VideoSample from this data.");
      o.drawImage(e, -n.left, -n.top), this._data = a, this._layout = null, this.format = "RGBX", this.visibleRect = { left: 0, top: 0, width: n.width, height: n.height }, this.squarePixelWidth = n.width, this.squarePixelHeight = n.height, this.rotation = t.rotation ?? 0, this.timestamp = t.timestamp, this.duration = t.duration ?? 0, this.colorSpace = new Ss({
        matrix: "rgb",
        primaries: "bt709",
        transfer: "iec61966-2-1",
        fullRange: !0
      });
    } else if (e instanceof Mt) {
      if (!t || typeof t != "object")
        throw new TypeError("init must be an object.");
      if (t.rotation !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
        throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if (!Number.isFinite(t.timestamp))
        throw new TypeError("init.timestamp must be a number.");
      if (t.duration !== void 0 && (!Number.isFinite(t.duration) || t.duration < 0))
        throw new TypeError("init.duration, when provided, must be a non-negative number.");
      if (this._data = e, e._referenceCount++, this.format = e.getFormat(), this.format !== null && !cn.includes(this.format))
        throw new TypeError("getFormat() must return a VideoSamplePixelFormat or null.");
      if (this.visibleRect = {
        left: 0,
        top: 0,
        width: e.getCodedWidth(),
        height: e.getCodedHeight()
      }, !Number.isInteger(this.visibleRect.width) || this.visibleRect.width <= 0)
        throw new TypeError("getCodedWidth() must return a positive integer.");
      if (!Number.isInteger(this.visibleRect.height) || this.visibleRect.height <= 0)
        throw new TypeError("getCodedHeight() must return a positive integer.");
      if (this.squarePixelWidth = e.getSquarePixelWidth(), !Number.isInteger(this.squarePixelWidth) || this.squarePixelWidth <= 0)
        throw new TypeError("getSquarePixelWidth() must return a positive integer.");
      if (this.squarePixelHeight = e.getSquarePixelHeight(), !Number.isInteger(this.squarePixelHeight) || this.squarePixelHeight <= 0)
        throw new TypeError("getSquarePixelHeight() must return a positive integer.");
      this.rotation = t.rotation ?? 0, this.timestamp = t.timestamp, this.duration = t.duration ?? 0, this.colorSpace = e.getColorSpace();
    } else
      throw new TypeError("Invalid data type: Must be a BufferSource, CanvasImageSource, or VideoSampleResource.");
    this.encodeOptions = t?.encodeOptions ?? {}, this.pixelAspectRatio = Qi({
      num: this.squarePixelWidth * this.codedHeight,
      den: this.squarePixelHeight * this.codedWidth
    }), er?.register(this, { type: "video", data: this._data }, this);
  }
  /** Clones this video sample. */
  clone() {
    if (this._closed)
      throw new Error("VideoSample is closed.");
    return p(this._data !== null), this._data instanceof Mt ? new be(this._data, {
      timestamp: this.timestamp,
      duration: this.duration,
      rotation: this.rotation,
      encodeOptions: this.encodeOptions
    }) : Ei(this._data) ? new be(this._data.clone(), {
      timestamp: this.timestamp,
      duration: this.duration,
      rotation: this.rotation,
      encodeOptions: this.encodeOptions
    }) : this._data instanceof Uint8Array ? (p(this._layout), new be(this._data, {
      format: this.format,
      layout: this._layout,
      codedWidth: this.codedWidth,
      codedHeight: this.codedHeight,
      timestamp: this.timestamp,
      duration: this.duration,
      colorSpace: this.colorSpace,
      rotation: this.rotation,
      visibleRect: this.visibleRect,
      displayWidth: this.displayWidth,
      displayHeight: this.displayHeight,
      encodeOptions: this.encodeOptions,
      // It's already been copied, if we copy it again we make the clone unnecessarily expensive
      _doNotCopy: !0
    })) : new be(this._data, {
      format: this.format,
      codedWidth: this.codedWidth,
      codedHeight: this.codedHeight,
      timestamp: this.timestamp,
      duration: this.duration,
      colorSpace: this.colorSpace,
      rotation: this.rotation,
      visibleRect: this.visibleRect,
      displayWidth: this.displayWidth,
      displayHeight: this.displayHeight,
      encodeOptions: this.encodeOptions
    });
  }
  /**
   * Closes this video sample, releasing held resources. Video samples should be closed as soon as they are not
   * needed anymore.
   */
  close() {
    this._closed || (er?.unregister(this), this._data instanceof Mt ? (this._data._referenceCount--, this._data._referenceCount === 0 && this._data.close()) : Ei(this._data) ? this._data.close() : this._data = null, this._closed = !0);
  }
  /**
   * Returns the number of bytes required to hold this video sample's pixel data.
   */
  allocationSize(e = {}) {
    if (Ka(e), this._closed)
      throw new Error("VideoSample is closed.");
    if ((e.format ?? this.format) == null)
      throw new Error("Cannot get allocation size when format is null.");
    return Ei(this._data) ? this._data.allocationSize(e) : Qa(this, e).allocationSize;
  }
  /**
   * Copies this video sample's pixel data to an ArrayBuffer or ArrayBufferView.
   * @returns The byte layout of the planes of the copied data.
   */
  async copyTo(e, t = {}) {
    if (!ki(e))
      throw new TypeError("destination must be an ArrayBuffer or an ArrayBuffer view.");
    if (Ka(t), this._closed)
      throw new Error("VideoSample is closed.");
    if ((t.format ?? this.format) == null)
      throw new Error("Cannot copy video sample data when format is null.");
    if (p(this._data !== null), Ei(this._data))
      return this._data.copyTo(e, t);
    if (t.format && !["RGBA", "RGBX", "BGRA", "BGRX"].includes(this.format) && ["RGBA", "RGBX", "BGRA", "BGRX"].includes(t.format))
      if (this._data instanceof Mt) {
        const l = { stack: [], error: void 0, hasError: !1 };
        try {
          const u = Rd(l, await this._data.toRgbSample({
            timestamp: this.timestamp,
            duration: this.duration,
            rotation: this.rotation
          }, t.colorSpace ?? "srgb"), !1);
          if (!(u instanceof be))
            throw new TypeError("toRgbSample() must return a VideoSample.");
          if (!["RGBA", "RGBX", "BGRA", "BGRX"].includes(u.format))
            throw new Error(`Sample returned by toRgbSample was expected to have an RGB format, got '${u.format}' instead.`);
          return await u.copyTo(e, t);
        } catch (u) {
          l.error = u, l.hasError = !0;
        } finally {
          Md(l);
        }
      } else {
        if (typeof VideoFrame > "u")
          throw new Error("For this sample, converting from a non-RGB to an RGB format requires VideoFrame to be defined.");
        const l = this.toVideoFrame(), u = await l.copyTo(e, t);
        return l.close(), u;
      }
    const i = Qa(this, t);
    p(this.format);
    const s = te(e);
    if (s.byteLength < i.allocationSize)
      throw new TypeError(`Destination buffer too small. Required: ${i.allocationSize}, Available: ${s.byteLength}`);
    const n = is(this.format);
    let a;
    if (this._data instanceof Mt) {
      let l = this._data.getDataPlanes();
      if (l instanceof Promise && (l = await l), !Array.isArray(l) || l.some((u) => !(u.data instanceof Uint8Array) || !Number.isInteger(u.stride) || u.stride < 0))
        throw new TypeError('getDataPlanes() must return an array of objects with a Uint8Array "data" property and a non-negative integer "stride" property.');
      a = l;
    } else if (this._data instanceof Uint8Array)
      p(this._layout), p(this._layout.length === n.length), a = this._layout.map((l, u) => {
        const d = Math.ceil(this.codedHeight / n[u].heightDivisor);
        return {
          data: this._data.subarray(l.offset, l.offset + l.stride * d),
          stride: l.stride
        };
      });
    else {
      const u = this._data.getContext("2d");
      p(u);
      const d = u.getImageData(0, 0, this.codedWidth, this.codedHeight);
      a = [{
        data: te(d.data),
        stride: 4 * this.codedWidth
      }];
    }
    const o = [], c = n.length;
    for (let l = 0; l < c; l++) {
      const u = i.computedLayouts[l], d = a[l].stride, f = a[l].data;
      let h = u.sourceTop * d;
      h += u.sourceLeftBytes;
      let g = u.destinationOffset;
      const m = u.sourceWidthBytes, w = {
        offset: g,
        stride: u.destinationStride
      };
      for (let y = 0; y < u.sourceHeight; y++) {
        if (h + m > f.byteLength)
          throw new Error("Source buffer OOB read.");
        if (g + m > s.byteLength)
          throw new Error("Destination buffer OOB write.");
        const b = f.subarray(h, h + m);
        s.set(b, g), h += d, g += u.destinationStride;
      }
      o.push(w);
    }
    if (t.format !== void 0) {
      const l = this.format.startsWith("RGB") !== t.format.startsWith("RGB"), u = this.format.includes("X") && t.format.includes("A");
      if (l || u)
        for (let d = 0; d < i.allocationSize; d += 4) {
          if (l) {
            const f = s[d], h = s[d + 2];
            s[d] = h, s[d + 2] = f;
          }
          u && (s[d + 3] = 255);
        }
    }
    return o;
  }
  /**
   * Converts this video sample to a VideoFrame for use with the WebCodecs API. The VideoFrame returned by this
   * method *must* be closed separately from this video sample.
   */
  toVideoFrame() {
    if (this._closed)
      throw new Error("VideoSample is closed.");
    if (p(this._data !== null), this._data instanceof Mt) {
      if (this.format === null)
        throw new Error("Cannot convert a VideoSampleResource-backed VideoSample to VideoFrame if format is null.");
      const e = this._data.getDataPlanes();
      if (e instanceof Promise)
        throw new Error("Cannot convert a VideoSampleResource-backed VideoSample to VideoFrame if getDataPlanes() returns a promise.");
      const t = e.reduce((a, o) => a + o.data.byteLength, 0), i = new Uint8Array(t);
      let s = 0;
      const n = [];
      for (const a of e)
        i.set(a.data, s), n.push(s), s += a.data.byteLength;
      return new VideoFrame(i, {
        format: this.format,
        layout: e.map((a, o) => ({
          offset: n[o],
          stride: a.stride
        })),
        codedWidth: this.codedWidth,
        codedHeight: this.codedHeight,
        timestamp: this.microsecondTimestamp,
        duration: this.microsecondDuration,
        colorSpace: this.colorSpace,
        visibleRect: this.visibleRect,
        displayWidth: this.squarePixelWidth,
        // Not display* since we're not passing rotation
        displayHeight: this.squarePixelHeight
      });
    } else return Ei(this._data) ? new VideoFrame(this._data, {
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration || void 0
      // Drag 0 duration to undefined, glitches some codecs
    }) : this._data instanceof Uint8Array ? (p(this._layout), new VideoFrame(this._data, {
      format: this.format,
      codedWidth: this.codedWidth,
      // This is technically wrong! codedWidth is a lie technically. But, since
      codedHeight: this.codedHeight,
      // we pass the layout (which contains the true coded width), we're good.
      layout: this._layout,
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration || void 0,
      colorSpace: this.colorSpace,
      visibleRect: this.visibleRect,
      displayWidth: this.squarePixelWidth,
      // Not display* since we're not passing rotation
      displayHeight: this.squarePixelHeight
    })) : new VideoFrame(this._data, {
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration || void 0
    });
  }
  draw(e, t, i, s, n, a, o, c, l) {
    let u = 0, d = 0, f = this.displayWidth, h = this.displayHeight, g = 0, m = 0, w = this.displayWidth, y = this.displayHeight;
    if (a !== void 0 ? (u = t, d = i, f = s, h = n, g = a, m = o, c !== void 0 ? (w = c, y = l) : (w = f, y = h)) : (g = t, m = i, s !== void 0 && (w = s, y = n)), !(typeof CanvasRenderingContext2D < "u" && e instanceof CanvasRenderingContext2D || typeof OffscreenCanvasRenderingContext2D < "u" && e instanceof OffscreenCanvasRenderingContext2D))
      throw new TypeError("context must be a CanvasRenderingContext2D or OffscreenCanvasRenderingContext2D.");
    if (!Number.isFinite(u))
      throw new TypeError("sx must be a number.");
    if (!Number.isFinite(d))
      throw new TypeError("sy must be a number.");
    if (!Number.isFinite(f) || f < 0)
      throw new TypeError("sWidth must be a non-negative number.");
    if (!Number.isFinite(h) || h < 0)
      throw new TypeError("sHeight must be a non-negative number.");
    if (!Number.isFinite(g))
      throw new TypeError("dx must be a number.");
    if (!Number.isFinite(m))
      throw new TypeError("dy must be a number.");
    if (!Number.isFinite(w) || w < 0)
      throw new TypeError("dWidth must be a non-negative number.");
    if (!Number.isFinite(y) || y < 0)
      throw new TypeError("dHeight must be a non-negative number.");
    if (this._closed)
      throw new Error("VideoSample is closed.");
    ({ sx: u, sy: d, sWidth: f, sHeight: h } = this._rotateSourceRegion(u, d, f, h, this.rotation));
    const b = this.toCanvasImageSource();
    e.save();
    const k = g + w / 2, S = m + y / 2;
    e.translate(k, S), e.rotate(this.rotation * Math.PI / 180);
    const T = this.rotation % 180 === 0 ? 1 : w / y;
    e.scale(1 / T, T), e.drawImage(b, u, d, f, h, -w / 2, -y / 2, w, y), e.restore();
  }
  /**
   * Draws the sample in the middle of the canvas corresponding to the context with the specified fit behavior.
   */
  drawWithFit(e, t) {
    if (!(typeof CanvasRenderingContext2D < "u" && e instanceof CanvasRenderingContext2D || typeof OffscreenCanvasRenderingContext2D < "u" && e instanceof OffscreenCanvasRenderingContext2D))
      throw new TypeError("context must be a CanvasRenderingContext2D or OffscreenCanvasRenderingContext2D.");
    if (!t || typeof t != "object")
      throw new TypeError("options must be an object.");
    if (!["fill", "contain", "cover"].includes(t.fit))
      throw new TypeError("options.fit must be 'fill', 'contain', or 'cover'.");
    if (t.rotation !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
      throw new TypeError("options.rotation, when provided, must be 0, 90, 180, or 270.");
    t.crop !== void 0 && tr(t.crop, "options.");
    const i = e.canvas.width, s = e.canvas.height, n = t.rotation ?? this.rotation, [a, o] = n % 180 === 0 ? [this.squarePixelWidth, this.squarePixelHeight] : [this.squarePixelHeight, this.squarePixelWidth];
    let c = t.crop;
    c && (c = Vr(c, a, o));
    let l, u, d, f;
    const { sx: h, sy: g, sWidth: m, sHeight: w } = this._rotateSourceRegion(t.crop?.left ?? 0, t.crop?.top ?? 0, t.crop?.width ?? a, t.crop?.height ?? o, n);
    if (t.fit === "fill")
      l = 0, u = 0, d = i, f = s;
    else {
      const [b, k] = t.crop ? [t.crop.width, t.crop.height] : [a, o], S = t.fit === "contain" ? Math.min(i / b, s / k) : Math.max(i / b, s / k);
      d = b * S, f = k * S, l = (i - d) / 2, u = (s - f) / 2;
    }
    e.save();
    const y = n % 180 === 0 ? 1 : d / f;
    e.translate(i / 2, s / 2), e.rotate(n * Math.PI / 180), e.scale(1 / y, y), e.translate(-i / 2, -s / 2), e.drawImage(this.toCanvasImageSource(), h, g, m, w, l, u, d, f), e.restore();
  }
  /** @internal */
  _rotateSourceRegion(e, t, i, s, n) {
    return n === 90 ? [e, t, i, s] = [
      t,
      this.squarePixelHeight - e - i,
      s,
      i
    ] : n === 180 ? [e, t] = [
      this.squarePixelWidth - e - i,
      this.squarePixelHeight - t - s
    ] : n === 270 && ([e, t, i, s] = [
      this.squarePixelWidth - t - s,
      e,
      s,
      i
    ]), { sx: e, sy: t, sWidth: i, sHeight: s };
  }
  /**
   * Draws the sample onto the target canvas with fit behavior, manually mipmapping on strong downscales for quality.
   * @internal
   */
  _drawWithFitAndMipmapping(e, t, i) {
    const s = e.width, n = e.height, [a, o] = i.rotation % 180 === 0 ? [this.squarePixelWidth, this.squarePixelHeight] : [this.squarePixelHeight, this.squarePixelWidth], c = i.crop ? i.crop.width : a, l = i.crop ? i.crop.height : o;
    let u = 0;
    2 * s < c && 2 * n < l && (u = Math.floor(Math.log2(Math.min(c / s, l / n))));
    const d = s * 2 ** u, f = n * 2 ** u, { canvas: h, context: g, isNew: m } = u > 0 ? ja(d, f) : { canvas: e, context: t, isNew: i.targetIsFresh };
    g.imageSmoothingQuality = "high", i.fillBlack ? (g.fillStyle = "black", g.fillRect(0, 0, d, f)) : m || g.clearRect(0, 0, d, f), this.drawWithFit(g, {
      fit: i.fit,
      rotation: i.rotation,
      crop: i.crop
    }), g.globalCompositeOperation = "copy";
    for (let w = u; w > 1; w--) {
      const y = s * 2 ** w, b = n * 2 ** w;
      g.drawImage(h, 0, 0, y, b, 0, 0, y / 2, b / 2);
    }
    g.globalCompositeOperation = "source-over", u > 0 && (t.imageSmoothingQuality = "high", t.globalCompositeOperation = "copy", t.drawImage(h, 0, 0, 2 * s, 2 * n, 0, 0, s, n), t.globalCompositeOperation = "source-over");
  }
  /**
   * Converts this video sample to a
   * [`CanvasImageSource`](https://udn.realityripple.com/docs/Web/API/CanvasImageSource) for drawing to a canvas.
   *
   * You must use the value returned by this method immediately, as any VideoFrame created internally may
   * automatically be closed in the next microtask.
   */
  toCanvasImageSource() {
    if (this._closed)
      throw new Error("VideoSample is closed.");
    if (p(this._data !== null), this._data instanceof Mt || this._data instanceof Uint8Array) {
      const e = this.toVideoFrame();
      return queueMicrotask(() => e.close()), e;
    } else
      return this._data;
  }
  /**
   * Transform this video sample to a new video sample given the options. Can be used to resize, rotate, and crop
   * the sample.
   *
   * In non-browser environments, this method will not work by default. To make it work, register a custom
   * transformer function via {@link registerVideoSampleTransformer}.
   */
  async transform(e) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.width !== void 0 && (!Number.isInteger(e.width) || e.width <= 0))
      throw new TypeError("options.width, when provided, must be a positive integer.");
    if (e.height !== void 0 && (!Number.isInteger(e.height) || e.height <= 0))
      throw new TypeError("options.height, when provided, must be a positive integer.");
    if (e.roundDimensionsTo !== void 0 && (!Number.isInteger(e.roundDimensionsTo) || e.roundDimensionsTo <= 0))
      throw new TypeError("options.roundDimensionsTo, when provided, must be a positive integer.");
    if (e.fit !== void 0 && !["fill", "contain", "cover"].includes(e.fit))
      throw new TypeError('options.fit, when provided, must be one of "fill", "contain", or "cover".');
    if (e.width !== void 0 && e.height !== void 0 && e.fit === void 0)
      throw new TypeError("When both options.width and options.height are provided, options.fit must also be provided.");
    if (e.rotate !== void 0 && ![0, 90, 180, 270].includes(e.rotate))
      throw new TypeError("options.rotate, when provided, must be 0, 90, 180 or 270.");
    if (e.crop !== void 0 && tr(e.crop, "options."), e.alpha !== void 0 && !["keep", "discard"].includes(e.alpha))
      throw new TypeError("options.alpha, when provided, must be 'keep' or 'discard'.");
    const t = gi(this.rotation + (e.rotate ?? 0)), [i, s] = t % 180 === 0 ? [this.squarePixelWidth, this.squarePixelHeight] : [this.squarePixelHeight, this.squarePixelWidth];
    let n = e.crop;
    n && (n = Vr(n, i, s));
    const a = n ? n.width : i, o = n ? n.height : s, c = a / o;
    let l, u;
    e.width !== void 0 && e.height === void 0 ? (l = e.width, u = l / c) : e.width === void 0 && e.height !== void 0 ? (u = e.height, l = u * c) : e.width !== void 0 && e.height !== void 0 ? (l = e.width, u = e.height) : (l = a, u = o), l = Vs(l, e.roundDimensionsTo ?? 1), u = Vs(u, e.roundDimensionsTo ?? 1);
    const d = {
      width: l,
      height: u,
      fit: e.fit ?? "fill",
      rotation: t,
      crop: n ?? {
        left: 0,
        top: 0,
        width: i,
        height: s
      },
      alpha: e.alpha ?? "keep"
    };
    for (const m of ln) {
      let w = m(this, d);
      if (w instanceof Promise && (w = await w), w !== null)
        return w;
    }
    const { canvas: f, context: h, isNew: g } = ja(d.width, d.height);
    return this._drawWithFitAndMipmapping(f, h, {
      fit: d.fit,
      rotation: d.rotation,
      crop: d.crop,
      targetIsFresh: g,
      fillBlack: d.alpha === "discard"
    }), new be(f, {
      timestamp: this.timestamp,
      duration: this.duration,
      rotation: 0
      // Any previous rotation is now baked in
    });
  }
  /** Sets the rotation metadata of this video sample. */
  setRotation(e) {
    if (![0, 90, 180, 270].includes(e))
      throw new TypeError("newRotation must be 0, 90, 180, or 270.");
    this.rotation = e;
  }
  /** Sets the presentation timestamp of this video sample, in seconds. */
  setTimestamp(e) {
    if (!Number.isFinite(e))
      throw new TypeError("newTimestamp must be a number.");
    this.timestamp = e;
  }
  /** Sets the duration of this video sample, in seconds. */
  setDuration(e) {
    if (!Number.isFinite(e) || e < 0)
      throw new TypeError("newDuration must be a non-negative number.");
    this.duration = e;
  }
  /** Sets the encode options used when this sample is passed to an encoder. */
  setEncodeOptions(e) {
    if (!e || typeof e != "object")
      throw new TypeError("newEncodeOptions must be an object.");
    this.encodeOptions = e;
  }
  /** Calls `.close()`. */
  [Symbol.dispose]() {
    this.close();
  }
}
const ln = [], Cm = (r) => {
  ln.includes(r) || ln.push(r);
}, Dd = 3, Ii = [];
let Ha = 0;
const ja = (r, e) => {
  for (const s of Ii)
    if (s.canvas.width === r && s.canvas.height === e)
      return s.age = Ha++, { canvas: s.canvas, context: s.context, isNew: !1 };
  let t;
  if (typeof OffscreenCanvas < "u")
    t = new OffscreenCanvas(r, e);
  else {
    if (typeof window > "u" || typeof document > "u")
      throw new Error("Cannot transform VideoSamples in this environment. Either run in an environment with OffscreenCanvas or HTMLCanvasElement, or supply a custom VideoSample transformer using registerVideoSampleTransformer().");
    t = document.createElement("canvas"), t.width = r, t.height = e;
  }
  const i = t.getContext("2d", {
    alpha: !0,
    willReadFrequently: !1
  });
  if (!i)
    throw new Error("The '2d' canvas context is required to transform VideoSamples. Register a custom transformer using registerVideoSampleTransformer to work around this limitation.");
  return Ii.length >= Dd && Ii.splice(Tn(Ii, (s) => s.age), 1), Ii.push({
    canvas: t,
    context: i,
    age: Ha++
  }), { canvas: t, context: i, isNew: !0 };
};
class Ss {
  /** Creates a new VideoSampleColorSpace. */
  constructor(e) {
    if (e !== void 0) {
      if (!e || typeof e != "object")
        throw new TypeError("init.colorSpace, when provided, must be an object.");
      const t = Object.keys($t);
      if (e.primaries != null && !t.includes(e.primaries))
        throw new TypeError(`init.colorSpace.primaries, when provided, must be one of ${t.join(", ")}.`);
      const i = Object.keys(Gt);
      if (e.transfer != null && !i.includes(e.transfer))
        throw new TypeError(`init.colorSpace.transfer, when provided, must be one of ${i.join(", ")}.`);
      const s = Object.keys(Xt);
      if (e.matrix != null && !s.includes(e.matrix))
        throw new TypeError(`init.colorSpace.matrix, when provided, must be one of ${s.join(", ")}.`);
      if (e.fullRange != null && typeof e.fullRange != "boolean")
        throw new TypeError("init.colorSpace.fullRange, when provided, must be a boolean.");
    }
    this.primaries = e?.primaries ?? null, this.transfer = e?.transfer ?? null, this.matrix = e?.matrix ?? null, this.fullRange = e?.fullRange ?? null;
  }
  /** Serializes the color space to a JSON object. */
  toJSON() {
    return {
      primaries: this.primaries,
      transfer: this.transfer,
      matrix: this.matrix,
      fullRange: this.fullRange
    };
  }
}
const Ei = (r) => typeof VideoFrame < "u" && r instanceof VideoFrame, Vr = (r, e, t) => {
  const i = Math.min(r.left, e), s = Math.min(r.top, t), n = Math.min(r.width, e - i), a = Math.min(r.height, t - s);
  return p(n >= 0), p(a >= 0), { left: i, top: s, width: n, height: a };
}, tr = (r, e) => {
  if (!r || typeof r != "object")
    throw new TypeError(e + "crop, when provided, must be an object.");
  if (!Number.isInteger(r.left) || r.left < 0)
    throw new TypeError(e + "crop.left must be a non-negative integer.");
  if (!Number.isInteger(r.top) || r.top < 0)
    throw new TypeError(e + "crop.top must be a non-negative integer.");
  if (!Number.isInteger(r.width) || r.width < 0)
    throw new TypeError(e + "crop.width must be a non-negative integer.");
  if (!Number.isInteger(r.height) || r.height < 0)
    throw new TypeError(e + "crop.height must be a non-negative integer.");
}, Ka = (r) => {
  if (!r || typeof r != "object")
    throw new TypeError("options must be an object.");
  if (r.colorSpace !== void 0 && !["display-p3", "srgb"].includes(r.colorSpace))
    throw new TypeError("options.colorSpace, when provided, must be 'display-p3' or 'srgb'.");
  if (r.format !== void 0 && typeof r.format != "string")
    throw new TypeError("options.format, when provided, must be a string.");
  if (r.layout !== void 0) {
    if (!Array.isArray(r.layout))
      throw new TypeError("options.layout, when provided, must be an array.");
    for (const e of r.layout) {
      if (!e || typeof e != "object")
        throw new TypeError("Each entry in options.layout must be an object.");
      if (!Number.isInteger(e.offset) || e.offset < 0)
        throw new TypeError("plane.offset must be a non-negative integer.");
      if (!Number.isInteger(e.stride) || e.stride < 0)
        throw new TypeError("plane.stride must be a non-negative integer.");
    }
  }
  if (r.rect !== void 0) {
    if (!r.rect || typeof r.rect != "object")
      throw new TypeError("options.rect, when provided, must be an object.");
    if (r.rect.x !== void 0 && (!Number.isInteger(r.rect.x) || r.rect.x < 0))
      throw new TypeError("options.rect.x, when provided, must be a non-negative integer.");
    if (r.rect.y !== void 0 && (!Number.isInteger(r.rect.y) || r.rect.y < 0))
      throw new TypeError("options.rect.y, when provided, must be a non-negative integer.");
    if (r.rect.width !== void 0 && (!Number.isInteger(r.rect.width) || r.rect.width < 0))
      throw new TypeError("options.rect.width, when provided, must be a non-negative integer.");
    if (r.rect.height !== void 0 && (!Number.isInteger(r.rect.height) || r.rect.height < 0))
      throw new TypeError("options.rect.height, when provided, must be a non-negative integer.");
  }
}, Od = (r, e, t) => {
  const i = is(r), s = [];
  let n = 0;
  for (const a of i) {
    const o = Math.ceil(e / a.widthDivisor), c = Math.ceil(t / a.heightDivisor), l = o * a.sampleBytes, u = l * c;
    s.push({
      offset: n,
      stride: l
    }), n += u;
  }
  return s;
}, is = (r) => {
  const e = (t, i, s, n, a) => {
    const o = [
      { sampleBytes: t, widthDivisor: 1, heightDivisor: 1 },
      { sampleBytes: i, widthDivisor: s, heightDivisor: n },
      { sampleBytes: i, widthDivisor: s, heightDivisor: n }
    ];
    return a && o.push({ sampleBytes: t, widthDivisor: 1, heightDivisor: 1 }), o;
  };
  switch (r) {
    case "I420":
      return e(1, 1, 2, 2, !1);
    case "I420P10":
    case "I420P12":
      return e(2, 2, 2, 2, !1);
    case "I420A":
      return e(1, 1, 2, 2, !0);
    case "I420AP10":
    case "I420AP12":
      return e(2, 2, 2, 2, !0);
    case "I422":
      return e(1, 1, 2, 1, !1);
    case "I422P10":
    case "I422P12":
      return e(2, 2, 2, 1, !1);
    case "I422A":
      return e(1, 1, 2, 1, !0);
    case "I422AP10":
    case "I422AP12":
      return e(2, 2, 2, 1, !0);
    case "I444":
      return e(1, 1, 1, 1, !1);
    case "I444P10":
    case "I444P12":
      return e(2, 2, 1, 1, !1);
    case "I444A":
      return e(1, 1, 1, 1, !0);
    case "I444AP10":
    case "I444AP12":
      return e(2, 2, 1, 1, !0);
    case "NV12":
      return [
        { sampleBytes: 1, widthDivisor: 1, heightDivisor: 1 },
        { sampleBytes: 2, widthDivisor: 2, heightDivisor: 2 }
        // Interleaved U and V
      ];
    case "RGBA":
    case "RGBX":
    case "BGRA":
    case "BGRX":
      return [
        { sampleBytes: 4, widthDivisor: 1, heightDivisor: 1 }
      ];
    default:
      pe(r), p(!1);
  }
}, Qa = (r, e) => {
  const t = {
    left: 0,
    top: 0,
    width: r.codedWidth,
    height: r.codedHeight
  }, i = e.rect, s = Ud(t, i, r.codedWidth, r.codedHeight, r.format), n = e.layout;
  let a;
  if (!e.format || e.format === r.format)
    a = r.format;
  else if (["RGBA", "RGBX", "BGRA", "BGRX"].includes(e.format))
    a = e.format;
  else
    throw new Error("NotSupportedError: Invalid destination format.");
  return Vd(s, a, n);
}, Ud = (r, e, t, i, s) => {
  const n = { ...r };
  if (e !== void 0) {
    if (e.width === 0 || e.height === 0)
      throw new TypeError("visibleRect dimensions cannot be zero.");
    if ((e.x || 0) + (e.width || 0) > t)
      throw new TypeError("visibleRect exceeds codedWidth.");
    if ((e.y || 0) + (e.height || 0) > i)
      throw new TypeError("visibleRect exceeds codedHeight.");
    n.x = e.x || 0, n.y = e.y || 0, n.width = e.width || 0, n.height = e.height || 0;
  }
  if (!Nd(s, n))
    throw new TypeError("visibleRect alignment is invalid for the format.");
  return n;
}, Nd = (r, e) => {
  if (r === null)
    return !0;
  const t = is(r);
  for (let i = 0; i < t.length; i++) {
    const s = t[i], n = s.widthDivisor, a = s.heightDivisor;
    if ((e.x || 0) % n !== 0 || (e.y || 0) % a !== 0)
      return !1;
  }
  return !0;
}, Vd = (r, e, t) => {
  const i = is(e), s = i.length;
  if (t !== void 0 && t.length !== s)
    throw new TypeError(`Layout must have ${s} planes.`);
  let n = 0;
  const a = [], o = [];
  for (let c = 0; c < s; c++) {
    const l = i[c], u = l.sampleBytes, d = l.widthDivisor, f = l.heightDivisor, h = {
      destinationOffset: 0,
      destinationStride: 0,
      sourceTop: 0,
      sourceHeight: 0,
      sourceLeftBytes: 0,
      sourceWidthBytes: 0
    };
    if (h.sourceTop = Math.ceil(Math.trunc(r.y || 0) / f), h.sourceHeight = Math.ceil(Math.trunc(r.height || 0) / f), h.sourceLeftBytes = Math.floor(Math.trunc(r.x || 0) / d) * u, h.sourceWidthBytes = Math.floor(Math.trunc(r.width || 0) / d) * u, t !== void 0) {
      const w = t[c];
      if (w.stride < h.sourceWidthBytes)
        throw new TypeError(`Stride for plane ${c} is too small.`);
      h.destinationOffset = w.offset, h.destinationStride = w.stride;
    } else
      h.destinationOffset = n, h.destinationStride = h.sourceWidthBytes;
    const m = h.destinationStride * h.sourceHeight + h.destinationOffset;
    if (m > 4294967295)
      throw new TypeError("Allocation size exceeds limit.");
    o.push(m), n = Math.max(n, m);
    for (let w = 0; w < c; w++) {
      const y = a[w];
      if (!(o[c] <= y.destinationOffset || o[w] <= h.destinationOffset))
        throw new TypeError("Planes overlap.");
    }
    a.push(h);
  }
  return {
    allocationSize: n,
    computedLayouts: a
  };
}, wr = /* @__PURE__ */ new Set(["f32", "f32-planar", "s16", "s16-planar", "s32", "s32-planar", "u8", "u8-planar"]);
class vi {
  constructor() {
    this._referenceCount = 0;
  }
}
class fe {
  /** The presentation timestamp of the sample in microseconds. */
  get microsecondTimestamp() {
    return Math.trunc(Ct * this.timestamp);
  }
  /** The duration of the sample in microseconds. */
  get microsecondDuration() {
    return Math.trunc(Ct * this.duration);
  }
  constructor(e) {
    if (this._closed = !1, Fi(e)) {
      if (e.format === null)
        throw new TypeError("AudioData with null format is not supported.");
      this._data = e, this.format = e.format, this.sampleRate = e.sampleRate, this.numberOfFrames = e.numberOfFrames, this.numberOfChannels = e.numberOfChannels, this.timestamp = e.timestamp / 1e6, this.duration = e.numberOfFrames / e.sampleRate;
    } else if (e instanceof vi) {
      if (this._data = e, e._referenceCount++, this.format = e.getFormat(), !wr.has(this.format))
        throw new TypeError("getFormat() must return an AudioSampleFormat.");
      if (this.sampleRate = e.getSampleRate(), !Number.isInteger(this.sampleRate) || this.sampleRate <= 0)
        throw new TypeError("getSampleRate() must return a positive integer.");
      if (this.numberOfFrames = e.getNumberOfFrames(), !Number.isInteger(this.numberOfFrames) || this.numberOfFrames < 0)
        throw new TypeError("getNumberOfFrames() must return a non-negative integer.");
      if (this.numberOfChannels = e.getNumberOfChannels(), !Number.isInteger(this.numberOfChannels) || this.numberOfChannels <= 0)
        throw new TypeError("getNumberOfChannels() must return a positive integer.");
      if (this.timestamp = e.getTimestamp(), !Number.isFinite(this.timestamp))
        throw new TypeError("getTimestamp() must return a finite number.");
      this.duration = this.numberOfFrames / this.sampleRate;
    } else {
      if (!e || typeof e != "object")
        throw new TypeError("Invalid AudioDataInit: must be an object.");
      if (!wr.has(e.format))
        throw new TypeError("Invalid AudioDataInit: invalid format.");
      if (!Number.isFinite(e.sampleRate) || e.sampleRate <= 0)
        throw new TypeError("Invalid AudioDataInit: sampleRate must be > 0.");
      if (!Number.isInteger(e.numberOfChannels) || e.numberOfChannels === 0)
        throw new TypeError("Invalid AudioDataInit: numberOfChannels must be an integer > 0.");
      if (!Number.isFinite(e?.timestamp))
        throw new TypeError("init.timestamp must be a number.");
      const t = e.data.byteLength / (lt(e.format) * e.numberOfChannels);
      if (!Number.isInteger(t))
        throw new TypeError("Invalid AudioDataInit: data size is not a multiple of frame size.");
      this.format = e.format, this.sampleRate = e.sampleRate, this.numberOfFrames = t, this.numberOfChannels = e.numberOfChannels, this.timestamp = e.timestamp, this.duration = t / e.sampleRate;
      let i;
      if (e.data instanceof ArrayBuffer)
        i = new Uint8Array(e.data);
      else if (ArrayBuffer.isView(e.data))
        i = new Uint8Array(e.data.buffer, e.data.byteOffset, e.data.byteLength);
      else
        throw new TypeError("Invalid AudioDataInit: data is not a BufferSource.");
      const s = this.numberOfFrames * this.numberOfChannels * lt(this.format);
      if (i.byteLength < s)
        throw new TypeError("Invalid AudioDataInit: insufficient data size.");
      this._data = i;
    }
    er?.register(this, { type: "audio", data: this._data }, this);
  }
  /** Returns the number of bytes required to hold the audio sample's data as specified by the given options. */
  allocationSize(e) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (!Number.isInteger(e.planeIndex) || e.planeIndex < 0)
      throw new TypeError("planeIndex must be a non-negative integer.");
    if (e.format !== void 0 && !wr.has(e.format))
      throw new TypeError("Invalid format.");
    if (e.frameOffset !== void 0 && (!Number.isInteger(e.frameOffset) || e.frameOffset < 0))
      throw new TypeError("frameOffset must be a non-negative integer.");
    if (e.frameCount !== void 0 && (!Number.isInteger(e.frameCount) || e.frameCount < 0))
      throw new TypeError("frameCount must be a non-negative integer.");
    if (this._closed)
      throw new Error("AudioSample is closed.");
    const t = e.format ?? this.format, i = e.frameOffset ?? 0;
    if (i >= this.numberOfFrames)
      throw new RangeError("frameOffset out of range");
    const s = e.frameCount !== void 0 ? e.frameCount : this.numberOfFrames - i;
    if (s > this.numberOfFrames - i)
      throw new RangeError("frameCount out of range");
    const n = lt(t), a = Ut(t);
    if (a && e.planeIndex >= this.numberOfChannels)
      throw new RangeError("planeIndex out of range");
    if (!a && e.planeIndex !== 0)
      throw new RangeError("planeIndex out of range");
    return (a ? s : s * this.numberOfChannels) * n;
  }
  /** Copies the audio sample's data to an ArrayBuffer or ArrayBufferView as specified by the given options. */
  copyTo(e, t) {
    if (!ki(e))
      throw new TypeError("destination must be an ArrayBuffer or an ArrayBuffer view.");
    if (!t || typeof t != "object")
      throw new TypeError("options must be an object.");
    if (!Number.isInteger(t.planeIndex) || t.planeIndex < 0)
      throw new TypeError("planeIndex must be a non-negative integer.");
    if (t.format !== void 0 && !wr.has(t.format))
      throw new TypeError("Invalid format.");
    if (t.frameOffset !== void 0 && (!Number.isInteger(t.frameOffset) || t.frameOffset < 0))
      throw new TypeError("frameOffset must be a non-negative integer.");
    if (t.frameCount !== void 0 && (!Number.isInteger(t.frameCount) || t.frameCount < 0))
      throw new TypeError("frameCount must be a non-negative integer.");
    if (this._closed)
      throw new Error("AudioSample is closed.");
    const { format: i, frameCount: s, frameOffset: n } = t;
    let { planeIndex: a } = t;
    const o = this.format, c = i ?? this.format;
    if (!c)
      throw new Error("Destination format not determined");
    const l = this.numberOfFrames, u = this.numberOfChannels, d = n ?? 0;
    if (d >= l)
      throw new RangeError("frameOffset out of range");
    const f = s !== void 0 ? s : l - d;
    if (f > l - d)
      throw new RangeError("frameCount out of range");
    const h = lt(c), g = Ut(c);
    if (g && a >= u)
      throw new RangeError("planeIndex out of range");
    if (!g && a !== 0)
      throw new RangeError("planeIndex out of range");
    const w = (g ? f : f * u) * h;
    if (e.byteLength < w)
      throw new RangeError("Destination buffer is too small");
    const y = q(e), b = Kc(c);
    if (Fi(this._data))
      di() && u > 2 && c !== o ? Ld(this._data, y, o, c, u, a, d, f) : this._data.copyTo(e, {
        planeIndex: a,
        frameOffset: d,
        frameCount: f,
        format: c
      });
    else {
      const k = jc(o), S = lt(o), T = Ut(o);
      let A;
      if (this._data instanceof vi) {
        const _ = (x) => {
          const I = this._data.getDataPlane(x);
          if (!(I instanceof Uint8Array))
            throw new TypeError("getDataPlane() must return a Uint8Array.");
          const E = l * S * (T ? 1 : u);
          if (I.byteLength !== E)
            throw new TypeError(`Data plane ${x} has invalid size. Expected exactly ${E} bytes, got ${I.byteLength} bytes.`);
          return I;
        };
        if (T)
          if (g)
            A = _(a), a = 0;
          else {
            A = new Uint8Array(l * S * u);
            for (let x = 0; x < u; x++) {
              const I = _(x);
              A.set(I, x * l * S);
            }
          }
        else
          A = _(0);
      } else
        A = this._data;
      const C = q(A);
      for (let _ = 0; _ < f; _++)
        if (g) {
          const x = _ * h;
          let I;
          T ? I = (a * l + (_ + d)) * S : I = ((_ + d) * u + a) * S;
          const E = k(C, I);
          b(y, x, E);
        } else
          for (let x = 0; x < u; x++) {
            const E = (_ * u + x) * h;
            let v;
            T ? v = (x * l + (_ + d)) * S : v = ((_ + d) * u + x) * S;
            const M = k(C, v);
            b(y, E, M);
          }
    }
  }
  /** Clones this audio sample. */
  clone() {
    if (this._closed)
      throw new Error("AudioSample is closed.");
    if (this._data instanceof vi) {
      const e = new fe(this._data);
      return e.setTimestamp(this.timestamp), e;
    } else if (Fi(this._data)) {
      const e = new fe(this._data.clone());
      return e.setTimestamp(this.timestamp), e;
    } else
      return new fe({
        format: this.format,
        sampleRate: this.sampleRate,
        numberOfFrames: this.numberOfFrames,
        numberOfChannels: this.numberOfChannels,
        timestamp: this.timestamp,
        data: this._data
      });
  }
  /**
   * Returns a new {@link AudioSample} containing only the frames in the range [startSample, endSample). Both bounds
   * must lie within this sample's range of frames. The returned sample's timestamp is shifted to match the start of
   * the trimmed section.
   */
  trim(e, t = this.numberOfFrames) {
    if (!Number.isInteger(e) || e < 0)
      throw new TypeError("startSample must be a non-negative integer.");
    if (!Number.isInteger(t) || t < 0)
      throw new TypeError("endSample must be a non-negative integer.");
    if (e > this.numberOfFrames)
      throw new RangeError("startSample out of range.");
    if (t > this.numberOfFrames)
      throw new RangeError("endSample out of range.");
    if (t < e)
      throw new RangeError("endSample must not be less than startSample.");
    if (this._closed)
      throw new Error("AudioSample is closed.");
    const i = t - e, s = lt(this.format);
    let n;
    if (Ut(this.format)) {
      const a = i * s;
      if (n = new Uint8Array(a * this.numberOfChannels), i > 0)
        for (let o = 0; o < this.numberOfChannels; o++)
          this.copyTo(n.subarray(o * a, (o + 1) * a), {
            planeIndex: o,
            format: this.format,
            frameOffset: e,
            frameCount: i
          });
    } else
      n = new Uint8Array(i * this.numberOfChannels * s), i > 0 && this.copyTo(n, {
        planeIndex: 0,
        format: this.format,
        frameOffset: e,
        frameCount: i
      });
    return new fe({
      data: n,
      format: this.format,
      sampleRate: this.sampleRate,
      numberOfChannels: this.numberOfChannels,
      timestamp: this.timestamp + e / this.sampleRate
    });
  }
  /**
   * Closes this audio sample, releasing held resources. Audio samples should be closed as soon as they are not
   * needed anymore.
   */
  close() {
    this._closed || (er?.unregister(this), this._data instanceof vi ? (this._data._referenceCount--, this._data._referenceCount === 0 && this._data.close()) : Fi(this._data) ? this._data.close() : this._data = new Uint8Array(0), this._closed = !0);
  }
  /**
   * Converts this audio sample to an AudioData for use with the WebCodecs API. The AudioData returned by this
   * method *must* be closed separately from this audio sample.
   */
  toAudioData() {
    if (this._closed)
      throw new Error("AudioSample is closed.");
    return this._data instanceof vi ? this._createAudioDataFromData() : Fi(this._data) ? this._data.timestamp === this.microsecondTimestamp ? this._data.clone() : this._createAudioDataFromData() : new AudioData({
      format: this.format,
      sampleRate: this.sampleRate,
      numberOfFrames: this.numberOfFrames,
      numberOfChannels: this.numberOfChannels,
      timestamp: this.microsecondTimestamp,
      data: this._data.buffer instanceof ArrayBuffer ? this._data.buffer : this._data.slice()
      // In the case of SharedArrayBuffer, convert to ArrayBuffer
    });
  }
  /** @internal */
  _createAudioDataFromData() {
    if (Ut(this.format)) {
      const e = this.allocationSize({ planeIndex: 0, format: this.format }), t = new ArrayBuffer(e * this.numberOfChannels);
      for (let i = 0; i < this.numberOfChannels; i++)
        this.copyTo(new Uint8Array(t, i * e, e), { planeIndex: i, format: this.format });
      return new AudioData({
        format: this.format,
        sampleRate: this.sampleRate,
        numberOfFrames: this.numberOfFrames,
        numberOfChannels: this.numberOfChannels,
        timestamp: this.microsecondTimestamp,
        data: t
      });
    } else {
      const e = new ArrayBuffer(this.allocationSize({ planeIndex: 0, format: this.format }));
      return this.copyTo(e, { planeIndex: 0, format: this.format }), new AudioData({
        format: this.format,
        sampleRate: this.sampleRate,
        numberOfFrames: this.numberOfFrames,
        numberOfChannels: this.numberOfChannels,
        timestamp: this.microsecondTimestamp,
        data: e
      });
    }
  }
  /** Convert this audio sample to an AudioBuffer for use with the Web Audio API. */
  toAudioBuffer() {
    if (this._closed)
      throw new Error("AudioSample is closed.");
    const e = new AudioBuffer({
      numberOfChannels: this.numberOfChannels,
      length: this.numberOfFrames,
      sampleRate: this.sampleRate
    }), t = new Float32Array(this.allocationSize({ planeIndex: 0, format: "f32-planar" }) / 4);
    for (let i = 0; i < this.numberOfChannels; i++)
      this.copyTo(t, { planeIndex: i, format: "f32-planar" }), e.copyToChannel(t, i);
    return e;
  }
  /** Sets the presentation timestamp of this audio sample, in seconds. */
  setTimestamp(e) {
    if (!Number.isFinite(e))
      throw new TypeError("newTimestamp must be a number.");
    this.timestamp = e;
  }
  /** Calls `.close()`. */
  [Symbol.dispose]() {
    this.close();
  }
  /** @internal */
  static *_fromAudioBuffer(e, t) {
    if (!(e instanceof AudioBuffer))
      throw new TypeError("audioBuffer must be an AudioBuffer.");
    const i = 48e3 * 5, s = e.numberOfChannels, n = e.sampleRate, a = e.length, o = Math.floor(i / s);
    let c = 0, l = a;
    for (; l > 0; ) {
      const u = Math.min(o, l), d = new Float32Array(s * u);
      for (let f = 0; f < s; f++)
        e.copyFromChannel(d.subarray(f * u, (f + 1) * u), f, c);
      yield new fe({
        format: "f32-planar",
        sampleRate: n,
        numberOfFrames: u,
        numberOfChannels: s,
        timestamp: t + c / n,
        data: d
      }), c += u, l -= u;
    }
  }
  /**
   * Creates AudioSamples from an AudioBuffer, starting at the given timestamp in seconds. Typically creates exactly
   * one sample, but may create multiple if the AudioBuffer is exceedingly large.
   */
  static fromAudioBuffer(e, t) {
    if (!(e instanceof AudioBuffer))
      throw new TypeError("audioBuffer must be an AudioBuffer.");
    const i = 48e3 * 5, s = e.numberOfChannels, n = e.sampleRate, a = e.length, o = Math.floor(i / s);
    let c = 0, l = a;
    const u = [];
    for (; l > 0; ) {
      const d = Math.min(o, l), f = new Float32Array(s * d);
      for (let g = 0; g < s; g++)
        e.copyFromChannel(f.subarray(g * d, (g + 1) * d), g, c);
      const h = new fe({
        format: "f32-planar",
        sampleRate: n,
        numberOfFrames: d,
        numberOfChannels: s,
        timestamp: t + c / n,
        data: f
      });
      u.push(h), c += d, l -= d;
    }
    return u;
  }
}
const lt = (r) => {
  switch (r) {
    case "u8":
    case "u8-planar":
      return 1;
    case "s16":
    case "s16-planar":
      return 2;
    case "s32":
    case "s32-planar":
      return 4;
    case "f32":
    case "f32-planar":
      return 4;
    default:
      throw new Error("Unknown AudioSampleFormat");
  }
}, Ut = (r) => {
  switch (r) {
    case "u8-planar":
    case "s16-planar":
    case "s32-planar":
    case "f32-planar":
      return !0;
    default:
      return !1;
  }
}, jc = (r) => {
  switch (r) {
    case "u8":
    case "u8-planar":
      return (e, t) => (e.getUint8(t) - 128) / 128;
    case "s16":
    case "s16-planar":
      return (e, t) => e.getInt16(t, !0) / 32768;
    case "s32":
    case "s32-planar":
      return (e, t) => e.getInt32(t, !0) / 2147483648;
    case "f32":
    case "f32-planar":
      return (e, t) => e.getFloat32(t, !0);
  }
}, Kc = (r) => {
  switch (r) {
    case "u8":
    case "u8-planar":
      return (e, t, i) => e.setUint8(t, le((i + 1) * 127.5, 0, 255));
    case "s16":
    case "s16-planar":
      return (e, t, i) => e.setInt16(t, le(Math.round(i * 32767), -32768, 32767), !0);
    case "s32":
    case "s32-planar":
      return (e, t, i) => e.setInt32(t, le(Math.round(i * 2147483647), -2147483648, 2147483647), !0);
    case "f32":
    case "f32-planar":
      return (e, t, i) => e.setFloat32(t, i, !0);
  }
}, Fi = (r) => typeof AudioData < "u" && r instanceof AudioData, Wd = (r) => {
  switch (r) {
    case "u8-planar":
      return "u8";
    case "s16-planar":
      return "s16";
    case "s32-planar":
      return "s32";
    case "f32-planar":
      return "f32";
    default:
      return r;
  }
}, Ld = (r, e, t, i, s, n, a, o) => {
  const c = jc(t), l = Kc(i), u = lt(t), d = lt(i), f = Ut(t);
  if (Ut(i))
    if (f) {
      const g = new ArrayBuffer(o * u), m = q(g);
      r.copyTo(g, {
        planeIndex: n,
        frameOffset: a,
        frameCount: o,
        format: t
      });
      for (let w = 0; w < o; w++) {
        const y = w * u, b = w * d, k = c(m, y);
        l(e, b, k);
      }
    } else {
      const g = new ArrayBuffer(o * s * u), m = q(g);
      r.copyTo(g, {
        planeIndex: 0,
        frameOffset: a,
        frameCount: o,
        format: t
      });
      for (let w = 0; w < o; w++) {
        const y = (w * s + n) * u, b = w * d, k = c(m, y);
        l(e, b, k);
      }
    }
  else if (f) {
    const g = o * u, m = new ArrayBuffer(g), w = q(m);
    for (let y = 0; y < s; y++) {
      r.copyTo(m, {
        planeIndex: y,
        frameOffset: a,
        frameCount: o,
        format: t
      });
      for (let b = 0; b < o; b++) {
        const k = b * u, S = (b * s + y) * d, T = c(w, k);
        l(e, S, T);
      }
    }
  } else {
    const g = new ArrayBuffer(o * s * u), m = q(g);
    r.copyTo(g, {
      planeIndex: 0,
      frameOffset: a,
      frameCount: o,
      format: t
    });
    for (let w = 0; w < o; w++)
      for (let y = 0; y < s; y++) {
        const b = w * s + y, k = b * u, S = b * d, T = c(m, k);
        l(e, S, T);
      }
  }
}, qd = (r, e) => {
  const t = r.allocationSize({ format: e, planeIndex: 0 }), i = new ArrayBuffer(t);
  return r.copyTo(i, { format: e, planeIndex: 0 }), new fe({
    data: i,
    format: e,
    numberOfChannels: r.numberOfChannels,
    sampleRate: r.sampleRate,
    timestamp: r.timestamp,
    duration: r.duration
  });
};
const un = /* @__PURE__ */ new Map(), dn = /* @__PURE__ */ new Map(), Vn = (r) => {
  if (!r || typeof r != "object")
    throw new TypeError("Encoding config must be an object.");
  if (!de.includes(r.codec))
    throw new TypeError(`Invalid video codec '${r.codec}'. Must be one of: ${de.join(", ")}.`);
  const e = r.bitrate;
  if (r.quality === void 0 && e === void 0)
    throw new TypeError("config.quality must be provided.");
  if (r.quality !== void 0 && e !== void 0)
    throw new TypeError("config.quality and config.bitrate cannot both be provided.");
  if (r.quality !== void 0 && !(r.quality instanceof ce))
    throw new TypeError("config.quality, when provided, must be a Quality.");
  if (e !== void 0 && !(e instanceof ce) && (!Number.isInteger(e) || e <= 0))
    throw new TypeError("config.bitrate, when provided, must be a positive integer or a quality.");
  if (r.keyFrameInterval !== void 0 && (!Number.isFinite(r.keyFrameInterval) || r.keyFrameInterval < 0))
    throw new TypeError("config.keyFrameInterval, when provided, must be a non-negative number.");
  if (r.sizeChangeBehavior !== void 0 && !["deny", "passThrough", "fill", "contain", "cover"].includes(r.sizeChangeBehavior))
    throw new TypeError("config.sizeChangeBehavior, when provided, must be 'deny', 'passThrough', 'fill', 'contain' or 'cover'.");
  if (r.transform !== void 0) {
    if (typeof r.transform != "object" || !r.transform)
      throw new TypeError("config.transform, when provided, must be an object.");
    if (r.transform.width !== void 0 && (!Number.isInteger(r.transform.width) || r.transform.width <= 0))
      throw new TypeError("config.transform.width, when provided, must be a positive integer.");
    if (r.transform.height !== void 0 && (!Number.isInteger(r.transform.height) || r.transform.height <= 0))
      throw new TypeError("config.transform.height, when provided, must be a positive integer.");
    if (r.transform.fit !== void 0 && !["fill", "contain", "cover"].includes(r.transform.fit))
      throw new TypeError('config.transform.fit, when provided, must be one of "fill", "contain", or "cover".');
    if (r.transform.width !== void 0 && r.transform.height !== void 0 && r.transform.fit === void 0 && !["fill", "contain", "cover"].includes(r.sizeChangeBehavior))
      throw new TypeError("When both config.transform.width and config.transform.height are provided, config.transform.fit must also be provided.");
    if (r.transform.fit !== void 0 && ["fill", "contain", "cover"].includes(r.sizeChangeBehavior) && r.transform.fit !== r.sizeChangeBehavior)
      throw new TypeError("config.transform.fit, when provided, cannot differ from config.sizeChangeBehavior when config.sizeChangeBehavior is 'fill', 'contain' or 'cover', as sizeChangeBehavior already determines the fitting algorithm.");
    if (r.transform.rotate !== void 0 && ![0, 90, 180, 270].includes(r.transform.rotate))
      throw new TypeError("config.transform.rotate, when provided, must be 0, 90, 180 or 270.");
    if (r.transform.crop !== void 0 && tr(r.transform.crop, "config.transform."), r.transform.process !== void 0 && typeof r.transform.process != "function")
      throw new TypeError("config.transform.process, when provided, must be a function.");
    if (r.transform.frameRate !== void 0 && (!Number.isFinite(r.transform.frameRate) || r.transform.frameRate <= 0))
      throw new TypeError("config.transform.frameRate, when provided, must be a finite positive number.");
    if (r.transform.force !== void 0 && typeof r.transform.force != "boolean")
      throw new TypeError("config.transform.force, when provided, must be a boolean.");
  }
  if (r.onEncodedPacket !== void 0 && typeof r.onEncodedPacket != "function")
    throw new TypeError("config.onEncodedPacket, when provided, must be a function.");
  if (r.onEncoderConfig !== void 0 && typeof r.onEncoderConfig != "function")
    throw new TypeError("config.onEncoderConfig, when provided, must be a function.");
  if (r.onEncodedSample !== void 0 && typeof r.onEncodedSample != "function")
    throw new TypeError("config.onEncodedSample, when provided, must be a function.");
  Qc(r.codec, r);
}, Qc = (r, e) => {
  if (!e || typeof e != "object")
    throw new TypeError("Encoding options must be an object.");
  if (e.alpha !== void 0 && !["discard", "keep"].includes(e.alpha))
    throw new TypeError("options.alpha, when provided, must be 'discard' or 'keep'.");
  const t = e.bitrateMode;
  if (t !== void 0 && !["constant", "variable"].includes(t))
    throw new TypeError("bitrateMode, when provided, must be 'constant' or 'variable'.");
  if (e.latencyMode !== void 0 && !["quality", "realtime"].includes(e.latencyMode))
    throw new TypeError("latencyMode, when provided, must be 'quality' or 'realtime'.");
  if (e.fullCodecString !== void 0 && typeof e.fullCodecString != "string")
    throw new TypeError("fullCodecString, when provided, must be a string.");
  if (e.fullCodecString !== void 0 && je(e.fullCodecString) !== r)
    throw new TypeError(`fullCodecString, when provided, must be a string that matches the specified codec (${r}).`);
  if (e.hardwareAcceleration !== void 0 && !["no-preference", "prefer-hardware", "prefer-software"].includes(e.hardwareAcceleration))
    throw new TypeError("hardwareAcceleration, when provided, must be 'no-preference', 'prefer-hardware' or 'prefer-software'.");
  if (e.scalabilityMode !== void 0 && typeof e.scalabilityMode != "string")
    throw new TypeError("scalabilityMode, when provided, must be a string.");
  if (e.contentHint !== void 0 && typeof e.contentHint != "string")
    throw new TypeError("contentHint, when provided, must be a string.");
}, $c = (r) => {
  const e = r.bitrateMode, t = r.quality._toVideoRateControl(r.codec, r.width, r.height, e), i = (n, a, o) => ({
    codec: r.fullCodecString ?? Fo(r.codec, r.width, r.height, o, r.alpha === "keep"),
    width: r.width,
    height: r.height,
    displayWidth: r.squarePixelWidth,
    displayHeight: r.squarePixelHeight,
    bitrate: n,
    bitrateMode: a,
    alpha: r.alpha ?? "discard",
    framerate: r.framerate,
    latencyMode: r.latencyMode,
    hardwareAcceleration: r.hardwareAcceleration,
    scalabilityMode: r.scalabilityMode,
    contentHint: r.contentHint,
    ...$l(r.codec)
  }), s = [];
  return t.quantizer !== null && s.push({
    config: i(void 0, "quantizer", t.bitrate),
    quantizer: t.quantizer
  }), t.bitrateMode !== "quantizer" && s.push({
    config: i(t.bitrate, t.bitrateMode, t.bitrate),
    quantizer: null
  }), p(s.length > 0), s;
}, Wn = (r) => {
  if (!r || typeof r != "object")
    throw new TypeError("Encoding config must be an object.");
  if (!we.includes(r.codec))
    throw new TypeError(`Invalid audio codec '${r.codec}'. Must be one of: ${we.join(", ")}.`);
  const e = r.bitrate;
  if (r.quality === void 0 && e === void 0 && !(ge.includes(r.codec) || r.codec === "flac"))
    throw new TypeError("config.quality must be provided for compressed audio codecs.");
  if (r.quality !== void 0 && e !== void 0)
    throw new TypeError("config.quality and config.bitrate cannot both be provided.");
  if (r.quality !== void 0 && !(r.quality instanceof ce))
    throw new TypeError("config.quality, when provided, must be a Quality.");
  if (e !== void 0 && !(e instanceof ce) && (!Number.isInteger(e) || e <= 0))
    throw new TypeError("config.bitrate, when provided, must be a positive integer or a quality.");
  if (r.transform !== void 0) {
    if (typeof r.transform != "object" || !r.transform)
      throw new TypeError("config.transform, when provided, must be an object.");
    if (r.transform.numberOfChannels !== void 0 && (!Number.isInteger(r.transform.numberOfChannels) || r.transform.numberOfChannels <= 0))
      throw new TypeError("config.transform.numberOfChannels, when provided, must be a positive integer.");
    if (r.transform.sampleRate !== void 0 && (!Number.isInteger(r.transform.sampleRate) || r.transform.sampleRate <= 0))
      throw new TypeError("config.transform.sampleRate, when provided, must be a positive integer.");
    if (r.transform.sampleFormat !== void 0 && !["u8", "s16", "s32", "f32"].includes(r.transform.sampleFormat))
      throw new TypeError("config.transform.sampleFormat, when provided, must be one of: u8, s16, s32, f32.");
    if (r.transform.process !== void 0 && typeof r.transform.process != "function")
      throw new TypeError("config.transform.process, when provided, must be a function.");
  }
  if (r.onEncodedPacket !== void 0 && typeof r.onEncodedPacket != "function")
    throw new TypeError("config.onEncodedPacket, when provided, must be a function.");
  if (r.onEncoderConfig !== void 0 && typeof r.onEncoderConfig != "function")
    throw new TypeError("config.onEncoderConfig, when provided, must be a function.");
  if (r.onEncodedSample !== void 0 && typeof r.onEncodedSample != "function")
    throw new TypeError("config.onEncodedSample, when provided, must be a function.");
  Gc(r.codec, r);
}, Gc = (r, e) => {
  if (!e || typeof e != "object")
    throw new TypeError("Encoding options must be an object.");
  const t = e.bitrateMode;
  if (t !== void 0 && !["constant", "variable"].includes(t))
    throw new TypeError("bitrateMode, when provided, must be 'constant' or 'variable'.");
  if (e.fullCodecString !== void 0 && typeof e.fullCodecString != "string")
    throw new TypeError("fullCodecString, when provided, must be a string.");
  if (e.fullCodecString !== void 0 && je(e.fullCodecString) !== r)
    throw new TypeError(`fullCodecString, when provided, must be a string that matches the specified codec (${r}).`);
}, Xc = (r) => {
  const e = r.bitrateMode;
  return {
    codec: r.fullCodecString ?? Ro(r.codec, r.numberOfChannels, r.sampleRate),
    numberOfChannels: r.numberOfChannels,
    sampleRate: r.sampleRate,
    bitrate: r.quality?._toAudioBitrate(r.codec),
    bitrateMode: r.quality?._bitrateMode ?? e,
    ...Gl(r.codec)
  };
};
class ce {
  constructor(e) {
    if ((typeof e == "number" || typeof e == "string") && (e = { quality: e }), !e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.bitrateMode !== void 0 && !["constant", "variable"].includes(e.bitrateMode))
      throw new TypeError("options.bitrateMode, when provided, must be 'constant' or 'variable'.");
    if ("quality" in e) {
      if (typeof e.quality == "string" ? !(e.quality in $a) : typeof e.quality != "number" || Number.isNaN(e.quality))
        throw new TypeError("options.quality must be a number, or one of 'very-low', 'low', 'medium', 'high' or 'very-high'.");
      if (e.preferBitrate !== void 0 && typeof e.preferBitrate != "boolean")
        throw new TypeError("options.preferBitrate, when provided, must be a boolean.");
      if ("bitrate" in e || "quantizer" in e)
        throw new TypeError("options.quality cannot be combined with options.bitrate or options.quantizer.");
      this._quality = typeof e.quality == "string" ? $a[e.quality] : e.quality, this._preferBitrate = e.preferBitrate ?? !1, this._bitrate = void 0, this._quantizer = void 0;
    } else {
      if (e.bitrate !== void 0 && (!Number.isInteger(e.bitrate) || e.bitrate <= 0))
        throw new TypeError("options.bitrate, when provided, must be a positive integer.");
      if (e.quantizer !== void 0 && (!Number.isInteger(e.quantizer) || e.quantizer < 0))
        throw new TypeError("options.quantizer, when provided, must be a non-negative integer.");
      if (e.bitrate === void 0 && e.quantizer === void 0)
        throw new TypeError("At least one of options.bitrate or options.quantizer must be set.");
      if ("preferBitrate" in e)
        throw new TypeError("options.preferBitrate can only be combined with options.quality.");
      this._quality = void 0, this._preferBitrate = !1, this._bitrate = e.bitrate, this._quantizer = e.quantizer;
    }
    this._bitrateMode = e.bitrateMode;
  }
  /**
   * Determines the rate control methods usable for the given codec.
   * @internal
   */
  _toVideoRateControl(e, t, i, s) {
    const n = Hd[e];
    let a = null, o = this._bitrateMode ?? s ?? "variable";
    if (this._quantizer !== void 0) {
      if (n)
        if (this._quantizer < n.min || this._quantizer > n.max) {
          if (this._bitrate === void 0)
            throw new Error(`Quantizer ${this._quantizer} is out of range for codec '${e}'; must be between ${n.min} and ${n.max}.`);
        } else
          a = this._quantizer, this._bitrate === void 0 && (o = "quantizer");
      else if (this._bitrate === void 0)
        throw new Error(`Codec '${e}' does not support quantizer-based encoding. Provide a bitrate in the Quality to define a fallback.`);
    } else this._bitrate === void 0 && n && !this._preferBitrate && (p(this._quality !== void 0), a = le(Math.round(Fl(n.worst, n.best, this._quality)), n.min, n.max));
    let c;
    if (this._bitrate !== void 0)
      c = this._bitrate;
    else {
      let l = this._quality;
      l === void 0 && (p(a !== null && n), l = le((a - n.worst) / (n.best - n.worst), 0, 1)), c = Ga(e, t, i, As(l));
    }
    return { quantizer: a, bitrate: c, bitrateMode: o };
  }
  /** @internal */
  _toVideoBitrate(e, t, i) {
    return this._bitrate !== void 0 ? this._bitrate : (p(this._quality !== void 0), Ga(e, t, i, As(this._quality)));
  }
  /** @internal */
  _toAudioBitrate(e) {
    if (ge.includes(e) || e === "flac")
      return;
    if (this._bitrate !== void 0)
      return this._bitrate;
    if (this._quality === void 0)
      throw new Error("This Quality defines neither a quality level nor a bitrate and therefore cannot be used for audio encoding.");
    const t = As(this._quality), s = {
      aac: 128e3,
      // 128kbps base for AAC
      opus: 64e3,
      // 64kbps base for Opus
      mp3: 16e4,
      // 160kbps base for MP3
      vorbis: 64e3,
      // 64kbps base for Vorbis
      ac3: 384e3,
      // 384kbps base for AC-3
      eac3: 192e3
      // 192kbps base for E-AC-3
    }[e];
    if (!s)
      throw new Error(`Unhandled codec: ${e}`);
    let n = s * t;
    return e === "aac" ? n = [96e3, 128e3, 16e4, 192e3].reduce((o, c) => Math.abs(c - n) < Math.abs(o - n) ? c : o) : e === "opus" || e === "vorbis" ? n = Math.max(6e3, n) : e === "mp3" && (n = [
      8e3,
      16e3,
      24e3,
      32e3,
      4e4,
      48e3,
      64e3,
      8e4,
      96e3,
      112e3,
      128e3,
      16e4,
      192e3,
      224e3,
      256e3,
      32e4
    ].reduce((o, c) => Math.abs(c - n) < Math.abs(o - n) ? c : o)), Math.round(n / 1e3) * 1e3;
  }
}
const $a = {
  "very-low": 0,
  low: 0.25,
  medium: 0.5,
  high: 0.75,
  "very-high": 1
}, Hd = {
  avc: { min: 0, max: 51, worst: 41, best: 16 },
  hevc: { min: 0, max: 51, worst: 41, best: 16 },
  vp9: { min: 0, max: 63, worst: 52, best: 20 },
  av1: { min: 0, max: 255, worst: 208, best: 80 }
}, As = (r) => 0.3 * Math.exp(2.5538 * r), Ga = (r, e, t, i) => {
  const s = e * t, n = 1920 * 1080, a = 3e6, o = Math.pow(s / n, 0.95), c = a * o, l = {
    avc: 1,
    // H.264/AVC (baseline)
    hevc: 0.6,
    // H.265/HEVC (~40% more efficient than AVC)
    vp9: 0.6,
    // Similar to HEVC
    av1: 0.4,
    // ~60% more efficient than AVC
    vp8: 1.2,
    // Slightly less efficient than AVC
    prores: 22e7 / a
    // Apple ProRes white paper claims 220 Mbps for 1080p 422 HQ @30Hz
  }, d = c * l[r] * i;
  return Math.ceil(d / 1e3) * 1e3;
}, Yc = (r, e) => {
  if (r === "avc")
    return { avc: { quantizer: e } };
  if (r === "hevc")
    return { hevc: { quantizer: e } };
  if (r === "vp9")
    return { vp9: { quantizer: e } };
  if (r === "av1")
    return { av1: { quantizer: e } };
  p(!1);
}, _m = /* @__PURE__ */ new ce("very-low"), Im = /* @__PURE__ */ new ce("low"), Em = /* @__PURE__ */ new ce("medium"), vm = /* @__PURE__ */ new ce("high"), Fm = /* @__PURE__ */ new ce("very-high"), Bm = (r) => {
  if (de.includes(r))
    return Ln(r);
  if (we.includes(r))
    return qn(r);
  if (tt.includes(r))
    return Hn(r);
  throw new TypeError(`Unknown codec '${r}'.`);
}, Ln = async (r, e = {}) => {
  const {
    width: t = 1280,
    height: i = 720,
    quality: s,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    bitrate: n,
    ...a
  } = e;
  if (!de.includes(r))
    return !1;
  if (!Number.isInteger(t) || t <= 0)
    throw new TypeError("width must be a positive integer.");
  if (!Number.isInteger(i) || i <= 0)
    throw new TypeError("height must be a positive integer.");
  if (s !== void 0 && !(s instanceof ce))
    throw new TypeError("quality, when provided, must be a Quality.");
  if (s !== void 0 && n !== void 0)
    throw new TypeError("quality and bitrate cannot both be provided.");
  if (n !== void 0 && !(n instanceof ce) && (!Number.isInteger(n) || n <= 0))
    throw new TypeError("bitrate must be a positive integer or a quality.");
  Qc(r, a);
  const o = bi(s, n) ?? new ce({ bitrate: 1e6 });
  let c;
  try {
    c = $c({
      codec: r,
      width: t,
      height: i,
      quality: o,
      framerate: void 0,
      ...a,
      alpha: "discard"
      // Since we handle alpha ourselves
    });
  } catch {
    return !1;
  }
  const l = JSON.stringify(c), u = un.get(l);
  if (u)
    return u;
  const d = (async () => {
    for (const { config: h } of c)
      if (Wr.some((g) => g.supports(r, h)))
        return !0;
    if (typeof VideoEncoder > "u" || (t % 2 === 1 || i % 2 === 1) && (r === "avc" || r === "hevc"))
      return !1;
    for (const { config: h, quantizer: g } of c) {
      try {
        if (!(await VideoEncoder.isConfigSupported(h)).supported)
          continue;
      } catch {
        continue;
      }
      if (!Br() || await new Promise(async (w) => {
        try {
          const y = new VideoEncoder({
            output: () => {
            },
            error: () => w(!1)
          });
          y.configure(h);
          const b = new Uint8Array(t * i * 4), k = new VideoFrame(b, {
            format: "RGBA",
            codedWidth: t,
            codedHeight: i,
            timestamp: 0
          });
          y.encode(k, g !== null ? Yc(r, g) : void 0), k.close(), await y.flush(), w(!0);
        } catch {
          w(!1);
        }
      }))
        return !0;
    }
    return !1;
  })();
  return un.set(l, d), d;
}, qn = async (r, e = {}) => {
  const {
    numberOfChannels: t = 2,
    sampleRate: i = 48e3,
    quality: s,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    bitrate: n,
    ...a
  } = e;
  if (!we.includes(r))
    return !1;
  if (!Number.isInteger(t) || t <= 0)
    throw new TypeError("numberOfChannels must be a positive integer.");
  if (!Number.isInteger(i) || i <= 0)
    throw new TypeError("sampleRate must be a positive integer.");
  if (s !== void 0 && !(s instanceof ce))
    throw new TypeError("quality, when provided, must be a Quality.");
  if (s !== void 0 && n !== void 0)
    throw new TypeError("quality and bitrate cannot both be provided.");
  if (n !== void 0 && !(n instanceof ce) && (!Number.isInteger(n) || n <= 0))
    throw new TypeError("bitrate must be a positive integer.");
  Gc(r, a);
  const o = bi(s, n) ?? new ce({ bitrate: 128e3 }), c = Xc({
    codec: r,
    numberOfChannels: t,
    sampleRate: i,
    quality: o,
    ...a
  }), l = JSON.stringify(c), u = dn.get(l);
  if (u)
    return u;
  const d = (async () => {
    if (Lr.some((f) => f.supports(r, c)) || ge.includes(r))
      return !0;
    if (typeof AudioEncoder > "u")
      return !1;
    try {
      return (await AudioEncoder.isConfigSupported(c)).supported === !0;
    } catch {
      return !1;
    }
  })();
  return dn.set(l, d), d;
}, bi = (r, e) => {
  if (r !== void 0)
    return r;
  if (e !== void 0)
    return e instanceof ce ? e : new ce({ bitrate: e });
}, Hn = async (r) => !!tt.includes(r), Rm = async () => {
  const [r, e, t] = await Promise.all([
    jd(),
    fn(),
    Kd()
  ]);
  return [...r, ...e, ...t];
}, jd = async (r = de, e) => {
  const t = await Promise.all(r.map((i) => Ln(i, e)));
  return r.filter((i, s) => t[s]);
}, fn = async (r = we, e) => {
  const t = await Promise.all(r.map((i) => qn(i, e)));
  return r.filter((i, s) => t[s]);
}, Kd = async (r = tt) => {
  const e = await Promise.all(r.map(Hn));
  return r.filter((t, i) => e[i]);
}, Qd = async (r, e) => {
  for (const t of r)
    if (await Ln(t, e))
      return t;
  return null;
}, Mm = async (r, e) => {
  for (const t of r)
    if (await qn(t, e))
      return t;
  return null;
}, zm = async (r) => {
  for (const e of r)
    if (await Hn(e))
      return e;
  return null;
};
class $d {
  /** Returns true if and only if the decoder can decode the given codec configuration. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static supports(e, t) {
    return !1;
  }
}
class Gd {
  /** Returns true if and only if the decoder can decode the given codec configuration. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static supports(e, t) {
    return !1;
  }
}
class Xd {
  /** Returns true if and only if the encoder can encode the given codec configuration. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static supports(e, t) {
    return !1;
  }
}
class Yd {
  /** Returns true if and only if the encoder can encode the given codec configuration. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static supports(e, t) {
    return !1;
  }
}
const ir = [], rr = [], Wr = [], Lr = [], Dm = (r) => {
  if (r.prototype instanceof $d) {
    const e = r;
    if (ir.includes(e)) {
      D._warn("Video decoder already registered.");
      return;
    }
    ir.push(e), an.clear();
  } else if (r.prototype instanceof Gd) {
    const e = r;
    if (rr.includes(e)) {
      D._warn("Audio decoder already registered.");
      return;
    }
    rr.push(e), on.clear();
  } else
    throw new TypeError("Decoder must be a CustomVideoDecoder or CustomAudioDecoder.");
}, Om = (r) => {
  if (r.prototype instanceof Xd) {
    const e = r;
    if (Wr.includes(e)) {
      D._warn("Video encoder already registered.");
      return;
    }
    Wr.push(e), un.clear();
  } else if (r.prototype instanceof Yd) {
    const e = r;
    if (Lr.includes(e)) {
      D._warn("Audio encoder already registered.");
      return;
    }
    Lr.push(e), dn.clear();
  } else
    throw new TypeError("Encoder must be a CustomVideoEncoder or CustomAudioEncoder.");
};
const Zd = (r) => {
  let i = r, s = 4096, n = 0, a = 12, o = 0;
  for (i < 0 && (i = -i, n = 128), i += 33, i > 8191 && (i = 8191); (i & s) !== s && a >= 5; )
    s >>= 1, a--;
  return o = i >> a - 4 & 15, ~(n | a - 5 << 4 | o) & 255;
}, Jd = (r) => {
  let t = 0, i = 0, s = ~r;
  s & 128 && (s &= -129, t = -1), i = ((s & 240) >> 4) + 5;
  const n = (1 << i | (s & 15) << i - 4 | 1 << i - 5) - 33;
  return t === 0 ? n : -n;
}, ef = (r) => {
  let t = 2048, i = 0, s = 11, n = 0, a = r;
  for (a < 0 && (a = -a, i = 128), a > 4095 && (a = 4095); (a & t) !== t && s >= 5; )
    t >>= 1, s--;
  return n = a >> (s === 4 ? 1 : s - 4) & 15, (i | s - 4 << 4 | n) ^ 85;
}, tf = (r) => {
  let e = 0, t = 0, i = r ^ 85;
  i & 128 && (i &= -129, e = -1), t = ((i & 240) >> 4) + 4;
  let s = 0;
  return t !== 4 ? s = 1 << t | (i & 15) << t - 4 | 1 << t - 5 : s = i << 1 | 1, e === 0 ? s : -s;
};
const zt = (r) => {
  if (!r || typeof r != "object")
    throw new TypeError("options must be an object.");
  if (r.metadataOnly !== void 0 && typeof r.metadataOnly != "boolean")
    throw new TypeError("options.metadataOnly, when defined, must be a boolean.");
  if (r.verifyKeyPackets !== void 0 && typeof r.verifyKeyPackets != "boolean")
    throw new TypeError("options.verifyKeyPackets, when defined, must be a boolean.");
  if (r.verifyKeyPackets && r.metadataOnly)
    throw new TypeError("options.verifyKeyPackets and options.metadataOnly cannot be enabled together.");
  if (r.skipLiveWait !== void 0 && typeof r.skipLiveWait != "boolean")
    throw new TypeError("options.skipLiveWait, when defined, must be a boolean.");
}, pt = (r) => {
  if (!Si(r))
    throw new TypeError("timestamp must be a number.");
}, xs = (r, e, t) => t.verifyKeyPackets ? e.then(async (i) => {
  if (!i || i.type === "delta")
    return i;
  const s = await r.determinePacketType(i);
  return s && (i.type = s), i;
}) : e;
class sr {
  /** Creates a new {@link EncodedPacketSink} for the given {@link InputTrack}. */
  constructor(e) {
    if (!(e instanceof ur))
      throw new TypeError("track must be an InputTrack.");
    this._track = e;
  }
  /**
   * Retrieves the track's first packet (in decode order), or null if it has no packets. The first packet is very
   * likely to be a key packet, but it doesn't have to be.
   */
  async getFirstPacket(e = {}) {
    if (zt(e), this._track.input._disposed)
      throw new Pe();
    return xs(this._track, this._track._backing.getFirstPacket(e), e);
  }
  /** Retrieves the track's first key packet (in decode order), or null if it has no key packets. */
  async getFirstKeyPacket(e = {}) {
    zt(e);
    const t = await this.getFirstPacket(e);
    return t ? t.type === "key" ? t : this.getNextKeyPacket(t, e) : null;
  }
  /**
   * Retrieves the packet corresponding to the given timestamp, in seconds. More specifically, returns the last packet
   * (in presentation order) with a start timestamp less than or equal to the given timestamp. This method can be
   * used to retrieve a track's last packet using `getPacket(Infinity)`. The method returns null if the timestamp
   * is before the first packet in the track.
   *
   * @param timestamp - The timestamp used for retrieval, in seconds.
   */
  async getPacket(e, t = {}) {
    if (pt(e), zt(t), this._track.input._disposed)
      throw new Pe();
    return xs(this._track, this._track._backing.getPacket(e, t), t);
  }
  /**
   * Retrieves the packet following the given packet (in decode order), or null if the given packet is the
   * last packet.
   */
  async getNextPacket(e, t = {}) {
    if (!(e instanceof Z))
      throw new TypeError("packet must be an EncodedPacket.");
    if (zt(t), this._track.input._disposed)
      throw new Pe();
    return xs(this._track, this._track._backing.getNextPacket(e, t), t);
  }
  /**
   * Retrieves the key packet corresponding to the given timestamp, in seconds. More specifically, returns the last
   * key packet (in presentation order) with a start timestamp less than or equal to the given timestamp. A key packet
   * is a packet that doesn't require previous packets to be decoded. This method can be used to retrieve a track's
   * last key packet using `getKeyPacket(Infinity)`. The method returns null if the timestamp is before the first
   * key packet in the track.
   *
   * To ensure that the returned packet is guaranteed to be a real key frame, enable `options.verifyKeyPackets`.
   *
   * @param timestamp - The timestamp used for retrieval, in seconds.
   */
  async getKeyPacket(e, t = {}) {
    if (pt(e), zt(t), this._track.input._disposed)
      throw new Pe();
    if (!t.verifyKeyPackets)
      return this._track._backing.getKeyPacket(e, t);
    const i = await this._track._backing.getKeyPacket(e, t);
    return i && (p(i.type === "key"), await this._track.determinePacketType(i) === "delta" ? this.getKeyPacket(i.timestamp - 1 / await this._track.getTimeResolution(), t) : i);
  }
  /**
   * Retrieves the key packet following the given packet (in decode order), or null if the given packet is the last
   * key packet.
   *
   * To ensure that the returned packet is guaranteed to be a real key frame, enable `options.verifyKeyPackets`.
   */
  async getNextKeyPacket(e, t = {}) {
    if (!(e instanceof Z))
      throw new TypeError("packet must be an EncodedPacket.");
    if (zt(t), this._track.input._disposed)
      throw new Pe();
    if (!t.verifyKeyPackets)
      return this._track._backing.getNextKeyPacket(e, t);
    const i = await this._track._backing.getNextKeyPacket(e, t);
    return i && (p(i.type === "key"), await this._track.determinePacketType(i) === "delta" ? this.getNextKeyPacket(i, t) : i);
  }
  /**
   * Creates an async iterator that yields the packets in this track in decode order. To enable fast iteration, this
   * method will intelligently preload packets based on the speed of the consumer.
   *
   * @param startPacket - (optional) The packet from which iteration should begin. This packet will also be yielded.
   * @param endPacket - (optional) The packet at which iteration should end. This packet will _not_ be yielded.
   */
  packets(e, t, i = {}) {
    if (e !== void 0 && !(e instanceof Z))
      throw new TypeError("startPacket must be an EncodedPacket.");
    if (e !== void 0 && e.isMetadataOnly && !i?.metadataOnly)
      throw new TypeError("startPacket can only be metadata-only if options.metadataOnly is enabled.");
    if (t !== void 0 && !(t instanceof Z))
      throw new TypeError("endPacket must be an EncodedPacket.");
    if (zt(i), this._track.input._disposed)
      throw new Pe();
    const s = [];
    let { promise: n, resolve: a } = ee(), { promise: o, resolve: c } = ee(), l = !1, u = !1, d = null, f = !1;
    const h = [], g = () => Math.max(2, h.length);
    (async () => {
      let w = e ?? await this.getFirstPacket(i);
      for (; w && !u && !this._track.input._disposed && !(t && w.sequenceNumber >= t?.sequenceNumber); ) {
        if (s.length > g()) {
          ({ promise: o, resolve: c } = ee()), await o;
          continue;
        }
        s.push(w), a(), { promise: n, resolve: a } = ee(), w = await this.getNextPacket(w, i);
      }
      l = !0, a();
    })().catch((w) => {
      f || (d = w, f = !0, a());
    });
    const m = this._track;
    return {
      async next() {
        for (; ; ) {
          if (m.input._disposed)
            throw new Pe();
          if (u)
            return { value: void 0, done: !0 };
          if (f)
            throw d;
          if (s.length > 0) {
            const w = s.shift(), y = performance.now();
            for (h.push(y); h.length > 0 && y - h[0] >= 1e3; )
              h.shift();
            return c(), { value: w, done: !1 };
          } else {
            if (l)
              return { value: void 0, done: !0 };
            await n;
          }
        }
      },
      async return() {
        return u = !0, c(), a(), { value: void 0, done: !0 };
      },
      async throw(w) {
        throw w;
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
}
class jn {
  constructor(e, t) {
    this.onSample = e, this.onError = t;
  }
}
class Zc {
  /** @internal */
  mediaSamplesInRange(e = -1 / 0, t = 1 / 0, i) {
    pt(e), pt(t);
    const s = [];
    let n = !1, a = null, { promise: o, resolve: c } = ee(), { promise: l, resolve: u } = ee(), d = !1, f = !1, h = !1, g = null, m = null, w = !1;
    const y = {
      ...i,
      verifyKeyPackets: !0,
      metadataOnly: !1
    };
    (async () => {
      g = await this._createDecoder((x) => {
        if (u(), x.timestamp >= t && (f = !0), f) {
          x.close();
          return;
        }
        a && (x.timestamp > e ? (s.push(a), n = !0) : a.close()), x.timestamp >= e && (s.push(x), n = !0), a = n ? null : x, s.length > 0 && (c(), { promise: o, resolve: c } = ee());
      }, (x) => {
        w || (m = x, w = !0, c());
      });
      const S = this._createPacketSink(), T = await S.getKeyPacket(e, y) ?? await S.getFirstKeyPacket(y);
      let A = T;
      const _ = S.packets(T ?? void 0, void 0, y);
      for (await _.next(); A && !f && !this._track.input._disposed; ) {
        const x = Xa(s.length);
        if (s.length + g.getDecodeQueueSize() > x) {
          ({ promise: l, resolve: u } = ee()), await l;
          continue;
        }
        g.decode(A);
        const I = await _.next();
        if (I.done)
          break;
        A = I.value;
      }
      await _.return(), !h && !this._track.input._disposed && await g.flush(), !n && a && s.push(a), d = !0, c();
    })().catch((S) => {
      w || (m = S, w = !0, c());
    }).finally(() => {
      g?.close();
    });
    const b = this._track, k = () => {
      a?.close();
      for (const S of s)
        S.close();
    };
    return {
      async next() {
        for (; ; ) {
          if (b.input._disposed)
            throw k(), new Pe();
          if (h)
            return { value: void 0, done: !0 };
          if (w)
            throw k(), m;
          if (s.length > 0) {
            const S = s.shift();
            return u(), { value: S, done: !1 };
          } else if (!d)
            await o;
          else
            return { value: void 0, done: !0 };
        }
      },
      async return() {
        return h = !0, f = !0, u(), c(), k(), { value: void 0, done: !0 };
      },
      async throw(S) {
        throw S;
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
  /** @internal */
  mediaSamplesAtTimestamps(e, t) {
    _l(e);
    const i = Cl(e), s = [], n = [];
    let { promise: a, resolve: o } = ee(), { promise: c, resolve: l } = ee(), u = !1, d = !1, f = null, h = null, g = !1;
    const m = (k) => {
      n.push(k), o(), { promise: a, resolve: o } = ee();
    }, w = {
      ...t,
      verifyKeyPackets: !0,
      metadataOnly: !1
    };
    (async () => {
      f = await this._createDecoder((x) => {
        if (l(), d) {
          x.close();
          return;
        }
        let I = 0;
        for (; s.length > 0 && x.timestamp - s[0] > -1e-10; )
          I++, s.shift();
        if (I > 0)
          for (let E = 0; E < I; E++)
            m(E < I - 1 ? x.clone() : x);
        else
          x.close();
      }, (x) => {
        g || (h = x, g = !0, o());
      });
      const k = this._createPacketSink();
      let S = null, T = null, A = -1;
      const C = async () => {
        p(T), p(f);
        let x = T;
        for (f.decode(x); x.sequenceNumber < A; ) {
          const I = Xa(n.length);
          for (; n.length + f.getDecodeQueueSize() > I && !d; )
            ({ promise: c, resolve: l } = ee()), await c;
          if (d)
            break;
          const E = await k.getNextPacket(x, w);
          p(E), f.decode(E), x = E;
        }
        A = -1;
      }, _ = async () => {
        p(f), await f.flush();
        for (let x = 0; x < s.length; x++)
          m(null);
        s.length = 0;
      };
      for await (const x of i) {
        if (pt(x), d || this._track.input._disposed)
          break;
        const I = await k.getPacket(x, w), E = I && await k.getKeyPacket(x, w);
        if (!E) {
          A !== -1 && (await C(), await _()), m(null), S = null;
          continue;
        }
        S && (E.sequenceNumber !== T.sequenceNumber || I.timestamp < S.timestamp) && (await C(), await _()), s.push(I.timestamp), A = Math.max(I.sequenceNumber, A), S = I, T = E;
      }
      !d && !this._track.input._disposed && (A !== -1 && await C(), await _()), u = !0, o();
    })().catch((k) => {
      g || (h = k, g = !0, o());
    }).finally(() => {
      f?.close();
    });
    const y = this._track, b = () => {
      for (const k of n)
        k?.close();
    };
    return {
      async next() {
        for (; ; ) {
          if (y.input._disposed)
            throw b(), new Pe();
          if (d)
            return { value: void 0, done: !0 };
          if (g)
            throw b(), h;
          if (n.length > 0) {
            const k = n.shift();
            return p(k !== void 0), l(), { value: k, done: !1 };
          } else if (!u)
            await a;
          else
            return { value: void 0, done: !0 };
        }
      },
      async return() {
        return d = !0, l(), o(), b(), { value: void 0, done: !0 };
      },
      async throw(k) {
        throw k;
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
}
const Xa = (r) => r === 0 ? 40 : 8;
class rf extends jn {
  constructor(e, t, i, s, n, a) {
    super(e, t), this.codec = i, this.decoderConfig = s, this.rotation = n, this.timeResolution = a, this.decoder = null, this.customDecoder = null, this.customDecoderCallSerializer = new $r(), this.customDecoderQueueSize = 0, this.inputTimestamps = [], this.sampleQueue = [], this.currentPacketIndex = 0, this.raslSkipped = !1, this.alphaDecoder = null, this.alphaHadKeyframe = !1, this.colorQueue = [], this.alphaQueue = [], this.merger = null, this.decodedAlphaChunkCount = 0, this.alphaDecoderQueueSize = 0, this.nullAlphaFrameQueue = [], this.currentAlphaPacketIndex = 0, this.alphaRaslSkipped = !1, this.finalSamples = [], this.mergeAlphaPromises = [];
    const o = ir.find((c) => c.supports(i, s));
    if (o)
      this.customDecoder = new o(), this.customDecoder.codec = i, this.customDecoder.config = s, this.customDecoder.onSample = (c) => {
        if (!(c instanceof be))
          throw new TypeError("The argument passed to onSample must be a VideoSample.");
        this.finalizeAndEmitSample(c);
      }, this.customDecoder.onError = (c) => {
        t(c);
      }, this.customDecoderCallSerializer.call(() => this.customDecoder.init()).catch((c) => t(c));
    else {
      const c = (u) => {
        if (this.alphaQueue.length > 0) {
          const d = this.alphaQueue.shift();
          p(d !== void 0), this.mergeAlpha(u, d);
        } else
          this.colorQueue.push(u);
      };
      if (i === "avc" && this.decoderConfig.description && Ls()) {
        const u = No(te(this.decoderConfig.description));
        if (u && u.sequenceParameterSets.length > 0) {
          const d = Fn(u.sequenceParameterSets[0]);
          d && d.frameMbsOnlyFlag === 0 && (this.decoderConfig = {
            ...this.decoderConfig,
            hardwareAcceleration: "prefer-software"
          });
        }
      }
      const l = new Error("Decoding error").stack;
      this.decoder = new VideoDecoder({
        output: (u) => {
          try {
            c(u);
          } catch (d) {
            this.onError(d);
          }
        },
        error: (u) => {
          u.stack = l, this.onError(u);
        }
      }), this.decoder.configure(this.decoderConfig);
    }
  }
  getDecodeQueueSize() {
    return this.customDecoder ? this.customDecoderQueueSize : (p(this.decoder), Math.max(this.decoder.decodeQueueSize, this.alphaDecoder?.decodeQueueSize ?? 0));
  }
  decode(e) {
    if (this.codec === "hevc" && this.currentPacketIndex > 0 && !this.raslSkipped) {
      if (this.hasHevcRaslPicture(e.data))
        return;
      this.raslSkipped = !0;
    }
    if (this.customDecoder)
      this.customDecoderQueueSize++, this.customDecoderCallSerializer.call(() => this.customDecoder.decode(e)).catch((t) => this.onError(t)).finally(() => this.customDecoderQueueSize--);
    else {
      if (p(this.decoder), di() || ea(this.inputTimestamps, e.timestamp, (t) => t), Ls() && this.currentPacketIndex === 0) {
        if (this.codec === "avc") {
          const t = [];
          let i = !1;
          for (const n of Uo(e.data, this.decoderConfig)) {
            const a = yi(e.data[n.offset]);
            if (i ||= a >= 1 && a <= 5, a === me.AUD) {
              if (i)
                break;
              t.length = 0;
            }
            a >= 20 && a <= 31 || t.push(e.data.subarray(n.offset, n.offset + n.length));
          }
          const s = su(t, this.decoderConfig);
          e = new Z(s, e.type, e.timestamp, e.duration);
        } else if (this.codec === "hevc") {
          const t = pu(e.data, this.decoderConfig);
          t && (e = new Z(t, e.type, e.timestamp, e.duration));
        }
      }
      this.decoder.decode(e.toEncodedVideoChunk()), this.decodeAlphaData(e);
    }
    this.currentPacketIndex++;
  }
  decodeAlphaData(e) {
    if (!e.sideData.alpha) {
      this.pushNullAlphaFrame();
      return;
    }
    if (this.merger || (this.merger = new sf()), !this.alphaDecoder) {
      const i = (n) => {
        if (this.colorQueue.length > 0) {
          const a = this.colorQueue.shift();
          p(a !== void 0), this.mergeAlpha(a, n);
        } else
          this.alphaQueue.push(n);
        for (this.decodedAlphaChunkCount++; this.nullAlphaFrameQueue.length > 0 && this.nullAlphaFrameQueue[0] === this.decodedAlphaChunkCount; )
          if (this.nullAlphaFrameQueue.shift(), this.colorQueue.length > 0) {
            const a = this.colorQueue.shift();
            p(a !== void 0), this.mergeAlpha(a, null);
          } else
            this.alphaQueue.push(null);
        this.alphaDecoderQueueSize--;
      }, s = new Error("Decoding error").stack;
      this.alphaDecoder = new VideoDecoder({
        output: (n) => {
          try {
            i(n);
          } catch (a) {
            this.onError(a);
          }
        },
        error: (n) => {
          n.stack = s, this.onError(n);
        }
      }), this.alphaDecoder.configure(this.decoderConfig);
    }
    const t = es(this.codec, this.decoderConfig, e.sideData.alpha);
    if (this.alphaHadKeyframe || (this.alphaHadKeyframe = t === "key"), this.alphaHadKeyframe) {
      if (this.codec === "hevc" && this.currentAlphaPacketIndex > 0 && !this.alphaRaslSkipped) {
        if (this.hasHevcRaslPicture(e.sideData.alpha)) {
          this.pushNullAlphaFrame();
          return;
        }
        this.alphaRaslSkipped = !0;
      }
      this.currentAlphaPacketIndex++, this.alphaDecoder.decode(e.alphaToEncodedVideoChunk(t ?? e.type)), this.alphaDecoderQueueSize++;
    } else
      this.pushNullAlphaFrame();
  }
  pushNullAlphaFrame() {
    this.alphaDecoderQueueSize === 0 ? this.alphaQueue.push(null) : this.nullAlphaFrameQueue.push(this.decodedAlphaChunkCount + this.alphaDecoderQueueSize);
  }
  /**
   * If we're using HEVC, we need to make sure to skip any RASL slices that follow a non-IDR key frame such as
   * CRA_NUT. This is because RASL slices cannot be decoded without data before the CRA_NUT. Browsers behave
   * differently here: Chromium drops the packets, Safari throws a decoder error. Either way, it's not good
   * and causes bugs upstream. So, let's take the dropping into our own hands.
   */
  hasHevcRaslPicture(e) {
    for (const t of Dr(e, this.decoderConfig)) {
      const i = Bt(e[t.offset]);
      if (i === se.RASL_N || i === se.RASL_R)
        return !0;
    }
    return !1;
  }
  /** Handler for the WebCodecs VideoDecoder for ironing out browser differences. */
  sampleHandler(e) {
    if (di()) {
      if (this.sampleQueue.length > 0 && e.timestamp >= ne(this.sampleQueue).timestamp) {
        for (const t of this.sampleQueue)
          this.finalizeAndEmitSample(t);
        this.sampleQueue.length = 0;
      }
      ea(this.sampleQueue, e, (t) => t.timestamp);
    } else {
      const t = this.inputTimestamps.shift();
      p(t !== void 0), e.setTimestamp(t), this.finalizeAndEmitSample(e);
    }
  }
  finalizeAndEmitSample(e) {
    e.setTimestamp(Math.round(e.timestamp * this.timeResolution) / this.timeResolution), e.setDuration(Math.round(e.duration * this.timeResolution) / this.timeResolution), e.setRotation(this.rotation), this.onSample(e);
  }
  async mergeAlpha(e, t) {
    const i = ee();
    this.mergeAlphaPromises.push(i.promise);
    const s = { sample: null };
    this.finalSamples.push(s);
    try {
      if (!t)
        s.sample = new be(e);
      else {
        p(this.merger);
        const n = await this.merger.merge(e, t);
        s.sample = new be(n);
      }
      for (; this.finalSamples.length > 0 && this.finalSamples[0].sample !== null; ) {
        const n = this.finalSamples.shift();
        this.sampleHandler(n.sample);
      }
    } catch (n) {
      vr(this.finalSamples, s), this.onError(n);
    } finally {
      vr(this.mergeAlphaPromises, i.promise), i.resolve();
    }
  }
  async flush() {
    if (this.customDecoder ? await this.customDecoderCallSerializer.call(() => this.customDecoder.flush()) : (p(this.decoder), await Promise.all([
      this.decoder.flush(),
      this.alphaDecoder?.flush()
    ]), await Promise.all(this.mergeAlphaPromises), this.colorQueue.forEach((e) => e.close()), this.colorQueue.length = 0, this.alphaQueue.forEach((e) => e?.close()), this.alphaQueue.length = 0, this.alphaHadKeyframe = !1, this.decodedAlphaChunkCount = 0, this.alphaDecoderQueueSize = 0, this.nullAlphaFrameQueue.length = 0, this.currentAlphaPacketIndex = 0, this.alphaRaslSkipped = !1), di()) {
      for (const e of this.sampleQueue)
        this.finalizeAndEmitSample(e);
      this.sampleQueue.length = 0;
    }
    this.currentPacketIndex = 0, this.raslSkipped = !1;
  }
  close() {
    this.customDecoder ? this.customDecoderCallSerializer.call(() => this.customDecoder.close()) : (p(this.decoder), this.decoder.close(), this.alphaDecoder?.close(), this.colorQueue.forEach((e) => e.close()), this.colorQueue.length = 0, this.alphaQueue.forEach((e) => e?.close()), this.alphaQueue.length = 0, this.merger?.close());
    for (const e of this.sampleQueue)
      e.close();
    this.sampleQueue.length = 0;
  }
}
let Ps = null;
class sf {
  constructor() {
    this.workers = [], this.nextWorkerIndex = 0, this.pendingRequests = /* @__PURE__ */ new Map(), this.nextRequestId = 0;
  }
  merge(e, t) {
    if (this.workers.length === 0) {
      if (!Ps) {
        const o = new Blob([`(${nf.toString()})()`], { type: "application/javascript" });
        Ps = URL.createObjectURL(o);
      }
      const a = le(navigator.hardwareConcurrency, 1, 4);
      for (let o = 0; o < a; o++) {
        const c = new Worker(Ps);
        c.addEventListener("message", (l) => {
          const u = l.data, d = this.pendingRequests.get(u.id);
          d && (this.pendingRequests.delete(u.id), "error" in u ? d.reject(new Error(u.error)) : d.resolve(u.frame));
        }), c.addEventListener("error", (l) => {
          const u = new Error(l.message || "Color/alpha merge worker error.");
          for (const d of this.pendingRequests.values())
            d.reject(u);
          this.pendingRequests.clear();
        }), this.workers.push(c);
      }
    }
    const i = this.nextRequestId++, s = ee();
    this.pendingRequests.set(i, s);
    const n = this.workers[this.nextWorkerIndex];
    return this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length, n.postMessage({ id: i, color: e, alpha: t }, { transfer: [e, t] }), s.promise;
  }
  close() {
    for (const t of this.workers)
      t.terminate();
    this.workers.length = 0;
    const e = new Error("Color/alpha merger closed.");
    for (const t of this.pendingRequests.values())
      t.reject(e);
    this.pendingRequests.clear();
  }
}
const nf = () => {
  let r = null, e = null, t = Promise.resolve();
  self.addEventListener("message", (c) => {
    const { id: l, color: u, alpha: d } = c.data;
    t = t.then(async () => {
      try {
        const f = await i(u, d);
        self.postMessage({ id: l, frame: f }, { transfer: [f] });
      } catch (f) {
        self.postMessage({ id: l, error: f.message });
      } finally {
        u.close(), d.close();
      }
    });
  });
  const i = async (c, l) => {
    const u = c.format, d = l.format;
    if (!u || !d)
      throw new Error("CPU color/alpha merging requires a known VideoFrame format.");
    const f = u.includes("P10"), h = u.includes("P12"), g = d.includes("P10"), m = d.includes("P12");
    if (g !== f || m !== h)
      throw new Error(`CPU color/alpha merging requires the alpha frame to have the same bit depth as the color frame (color: '${u}', alpha: '${d}').`);
    if (u === "RGBX" || u === "RGBA" || u === "BGRX" || u === "BGRA")
      return await s(c, l, u);
    if (u === "I420" || u === "I420P10" || u === "I420P12" || u === "I422" || u === "I422P10" || u === "I422P12" || u === "I444" || u === "I444P10" || u === "I444P12")
      return await n(c, l, u);
    if (u === "NV12")
      return await a(c, l);
    throw new Error(`CPU color/alpha merging does not support format '${u}'.`);
  }, s = async (c, l, u) => {
    const d = c.visibleRect?.width ?? c.codedWidth, f = c.visibleRect?.height ?? c.codedHeight, h = d * f, g = new Uint8Array(h * 4);
    await c.copyTo(g);
    const m = await o(l, d, f, 1);
    for (let b = 0, k = 3; b < h; b++, k += 4)
      g[k] = m[b];
    const y = {
      format: u === "RGBX" || u === "RGBA" ? "RGBA" : "BGRA",
      codedWidth: d,
      codedHeight: f,
      timestamp: c.timestamp,
      duration: c.duration ?? void 0,
      transfer: [g.buffer]
    };
    return new VideoFrame(g, y);
  }, n = async (c, l, u) => {
    const d = c.visibleRect?.width ?? c.codedWidth, f = c.visibleRect?.height ?? c.codedHeight, h = u.includes("P10"), g = u.includes("P12"), m = h || g ? 2 : 1;
    let w, y;
    u.startsWith("I420") ? (w = Math.ceil(d / 2), y = Math.ceil(f / 2)) : u.startsWith("I422") ? (w = Math.ceil(d / 2), y = f) : (w = d, y = f);
    const b = d * f, k = w * y, S = b * m, T = k * m, A = b * m, C = S + 2 * T + A, _ = new Uint8Array(C);
    await c.copyTo(_);
    const x = await o(l, d, f, m), I = S + 2 * T;
    _.set(x, I);
    const v = {
      format: u.slice(0, 4) + "A" + u.slice(4),
      codedWidth: d,
      codedHeight: f,
      timestamp: c.timestamp,
      duration: c.duration ?? void 0,
      transfer: [_.buffer]
    };
    return new VideoFrame(_, v);
  }, a = async (c, l) => {
    const u = c.visibleRect?.width ?? c.codedWidth, d = c.visibleRect?.height ?? c.codedHeight, f = u * d, h = Math.ceil(u / 2), g = Math.ceil(d / 2), m = h * g, w = c.allocationSize();
    (!e || e.byteLength !== w) && (e = new Uint8Array(w)), await c.copyTo(e);
    const y = new Uint8Array(f + 2 * m + f);
    y.set(e.subarray(0, f), 0);
    const b = f, k = f + m, S = f;
    for (let C = 0; C < m; C++)
      y[b + C] = e[S + C * 2], y[k + C] = e[S + C * 2 + 1];
    const T = await o(l, u, d, 1);
    y.set(T, f + 2 * m);
    const A = {
      format: "I420A",
      codedWidth: u,
      codedHeight: d,
      timestamp: c.timestamp,
      duration: c.duration ?? void 0,
      transfer: [y.buffer]
    };
    return new VideoFrame(y, A);
  }, o = async (c, l, u, d) => {
    const f = c.allocationSize();
    (!r || r.byteLength !== f) && (r = new Uint8Array(f)), await c.copyTo(r);
    const h = c.format;
    if (h === "RGBA" || h === "BGRA" || h === "RGBX" || h === "BGRX") {
      const g = h === "RGBA" || h === "RGBX" ? 0 : 2, m = l * u;
      for (let w = 0; w < m; w++)
        r[w] = r[w * 4 + g];
      return r.subarray(0, m);
    } else
      return r.subarray(0, l * u * d);
  };
}, Jc = (r) => {
  if (!r || typeof r != "object")
    throw new TypeError("decoderOptions must be an object.");
  if (r.hardwareAcceleration !== void 0 && !["no-preference", "prefer-hardware", "prefer-software"].includes(r.hardwareAcceleration))
    throw new TypeError("decoderOptions.hardwareAcceleration, when provided, must be 'no-preference', 'prefer-hardware' or 'prefer-software'.");
  if (r.optimizeForLatency !== void 0 && typeof r.optimizeForLatency != "boolean")
    throw new TypeError("decoderOptions.optimizeForLatency, when provided, must be a boolean.");
};
class hn extends Zc {
  /** Creates a new {@link VideoSampleSink} for the given {@link InputVideoTrack}. */
  constructor(e, t = {}) {
    if (!(e instanceof rs))
      throw new TypeError("videoTrack must be an InputVideoTrack.");
    Jc(t), super(), this._track = e, this._decoderOptions = t;
  }
  /** @internal */
  async _createDecoder(e, t) {
    if (!await this._track.canDecode())
      throw new Error("This video track cannot be decoded by this browser. Make sure to check decodability before using a track.");
    const i = await this._track.getCodec(), s = await this._track.getRotation();
    let n = await this._track.getDecoderConfig();
    const a = await this._track.getTimeResolution();
    return p(i && n), n = {
      ...n,
      hardwareAcceleration: this._decoderOptions.hardwareAcceleration,
      optimizeForLatency: this._decoderOptions.optimizeForLatency
    }, new rf(e, t, i, n, s, a);
  }
  /** @internal */
  _createPacketSink() {
    return new sr(this._track);
  }
  /**
   * Retrieves the video sample (frame) corresponding to the given timestamp, in seconds. More specifically, returns
   * the last video sample (in presentation order) with a start timestamp less than or equal to the given timestamp.
   * Returns null if the timestamp is before the track's first timestamp.
   *
   * @param timestamp - The timestamp used for retrieval, in seconds.
   * @param options - Options used for the underlying packet retrieval.
   */
  async getSample(e, t = {}) {
    pt(e);
    for await (const i of this.mediaSamplesAtTimestamps([e], t))
      return i;
    throw new Error("Internal error: Iterator returned nothing.");
  }
  /**
   * Creates an async iterator that yields the video samples (frames) of this track in presentation order. This method
   * will intelligently pre-decode a few frames ahead to enable fast iteration.
   *
   * @param startTimestamp - The timestamp in seconds at which to start yielding samples (inclusive).
   * @param endTimestamp - The timestamp in seconds at which to stop yielding samples (exclusive).
   * @param options - Options used for the underlying packet retrieval.
   */
  samples(e, t, i = {}) {
    return this.mediaSamplesInRange(e, t, i);
  }
  /**
   * Creates an async iterator that yields a video sample (frame) for each timestamp in the argument. This method
   * uses an optimized decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most
   * once, and is therefore more efficient than manually getting the sample for every timestamp. The iterator may
   * yield null if no frame is available for a given timestamp.
   *
   * This method is good for sparse access of media data. If you want primarily sequential media access, prefer
   * {@link VideoSampleSink.samples} instead.
   *
   * @param timestamps - An iterable or async iterable of timestamps in seconds.
   * @param options - Options used for the underlying packet retrieval.
   */
  samplesAtTimestamps(e, t = {}) {
    return this.mediaSamplesAtTimestamps(e, t);
  }
}
class Um {
  /** Creates a new {@link CanvasSink} for the given {@link InputVideoTrack}. */
  constructor(e, t = {}) {
    if (this._rotation = 0, this._initPromise = null, this._nextCanvasIndex = 0, !(e instanceof rs))
      throw new TypeError("videoTrack must be an InputVideoTrack.");
    if (t && typeof t != "object")
      throw new TypeError("options must be an object.");
    if (t.alpha !== void 0 && typeof t.alpha != "boolean")
      throw new TypeError("options.alpha, when provided, must be a boolean.");
    if (t.width !== void 0 && (!Number.isInteger(t.width) || t.width <= 0))
      throw new TypeError("options.width, when defined, must be a positive integer.");
    if (t.height !== void 0 && (!Number.isInteger(t.height) || t.height <= 0))
      throw new TypeError("options.height, when defined, must be a positive integer.");
    if (t.fit !== void 0 && !["fill", "contain", "cover"].includes(t.fit))
      throw new TypeError('options.fit, when provided, must be one of "fill", "contain", or "cover".');
    if (t.width !== void 0 && t.height !== void 0 && t.fit === void 0)
      throw new TypeError("When both options.width and options.height are provided, options.fit must also be provided.");
    if (t.rotation !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
      throw new TypeError("options.rotation, when provided, must be 0, 90, 180 or 270.");
    if (t.crop !== void 0 && tr(t.crop, "options."), t.poolSize !== void 0 && (typeof t.poolSize != "number" || !Number.isInteger(t.poolSize) || t.poolSize < 0))
      throw new TypeError("poolSize must be a non-negative integer.");
    t.decoderOptions !== void 0 && Jc(t.decoderOptions), this._videoTrack = e, this._alpha = t.alpha ?? !1, this._options = t, this._fit = t.fit ?? "fill", this._videoSampleSink = new hn(e, t.decoderOptions), this._canvasPool = Array.from({ length: t.poolSize ?? 0 }, () => null);
  }
  /** @internal */
  _ensureInit() {
    return this._initPromise ??= (async () => {
      const e = this._options, t = this._videoTrack, i = e.rotation ?? await t.getRotation(), s = await t.getSquarePixelWidth(), n = await t.getSquarePixelHeight(), [a, o] = i % 180 === 0 ? [s, n] : [n, s];
      let c = e.crop;
      c && (c = Vr(c, a, o));
      let [l, u] = c ? [c.width, c.height] : [a, o];
      const d = l / u;
      e.width !== void 0 && e.height === void 0 ? (l = e.width, u = Math.round(l / d)) : e.width === void 0 && e.height !== void 0 ? (u = e.height, l = Math.round(u * d)) : e.width !== void 0 && e.height !== void 0 && (l = e.width, u = e.height), this._width = l, this._height = u, this._rotation = i, this._crop = c;
    })();
  }
  /** @internal */
  _videoSampleToWrappedCanvas(e) {
    const t = this._width, i = this._height;
    let s = this._canvasPool[this._nextCanvasIndex], n = !1;
    s || (typeof document < "u" ? (s = document.createElement("canvas"), s.width = t, s.height = i) : s = new OffscreenCanvas(t, i), this._canvasPool.length > 0 && (this._canvasPool[this._nextCanvasIndex] = s), n = !0), this._canvasPool.length > 0 && (this._nextCanvasIndex = (this._nextCanvasIndex + 1) % this._canvasPool.length);
    const a = s.getContext("2d", {
      alpha: this._alpha || Br()
      // Firefox has VideoFrame glitches with opaque canvases
    });
    p(a), e._drawWithFitAndMipmapping(s, a, {
      fit: this._fit,
      rotation: this._rotation,
      crop: this._crop,
      targetIsFresh: n,
      fillBlack: !this._alpha && Br()
    });
    const o = {
      canvas: s,
      timestamp: e.timestamp,
      duration: e.duration
    };
    return e.close(), o;
  }
  /**
   * Retrieves a canvas with the video frame corresponding to the given timestamp, in seconds. More specifically,
   * returns the last video frame (in presentation order) with a start timestamp less than or equal to the given
   * timestamp. Returns null if the timestamp is before the track's first timestamp.
   *
   * @param timestamp - The timestamp used for retrieval, in seconds.
   * @param options - Options used for the underlying packet retrieval.
   */
  async getCanvas(e, t) {
    pt(e), await this._ensureInit();
    const i = await this._videoSampleSink.getSample(e, t);
    return i && this._videoSampleToWrappedCanvas(i);
  }
  /**
   * Creates an async iterator that yields canvases with the video frames of this track in presentation order. This
   * method will intelligently pre-decode a few frames ahead to enable fast iteration.
   *
   * @param startTimestamp - The timestamp in seconds at which to start yielding canvases (inclusive).
   * @param endTimestamp - The timestamp in seconds at which to stop yielding canvases (exclusive).
   * @param options - Options used for the underlying packet retrieval.
   */
  async *canvases(e, t, i) {
    await this._ensureInit(), yield* Fr(this._videoSampleSink.samples(e, t, i), (s) => this._videoSampleToWrappedCanvas(s));
  }
  /**
   * Creates an async iterator that yields a canvas for each timestamp in the argument. This method uses an optimized
   * decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most once, and is
   * therefore more efficient than manually getting the canvas for every timestamp. The iterator may yield null if
   * no frame is available for a given timestamp.
   *
   * This method is good for sparse access of media data. If you want primarily sequential media access, prefer
   * {@link CanvasSink.canvases} instead.
   *
   * @param timestamps - An iterable or async iterable of timestamps in seconds.
   * @param options - Options used for the underlying packet retrieval.
   */
  async *canvasesAtTimestamps(e, t) {
    await this._ensureInit(), yield* Fr(this._videoSampleSink.samplesAtTimestamps(e, t), (i) => i && this._videoSampleToWrappedCanvas(i));
  }
}
class af extends jn {
  constructor(e, t, i, s) {
    super(e, t), this.decoder = null, this.customDecoder = null, this.customDecoderCallSerializer = new $r(), this.customDecoderQueueSize = 0, this.currentTimestamp = null, this.expectedFirstTimestamp = null, this.timestampOffset = 0;
    const n = (o) => {
      let c = o.timestamp;
      this.expectedFirstTimestamp && this.currentTimestamp === null && (this.timestampOffset = this.expectedFirstTimestamp - c), c += this.timestampOffset, (this.currentTimestamp === null || Math.abs(c - this.currentTimestamp) >= o.duration) && (this.currentTimestamp = c);
      const l = this.currentTimestamp;
      if (this.currentTimestamp += o.duration, o.numberOfFrames === 0) {
        o.close();
        return;
      }
      const u = s.sampleRate;
      o.setTimestamp(Math.round(l * u) / u), e(o);
    }, a = rr.find((o) => o.supports(i, s));
    if (a)
      this.customDecoder = new a(), this.customDecoder.codec = i, this.customDecoder.config = s, this.customDecoder.onSample = (o) => {
        if (!(o instanceof fe))
          throw new TypeError("The argument passed to onSample must be an AudioSample.");
        n(o);
      }, this.customDecoder.onError = (o) => {
        t(o);
      }, this.customDecoderCallSerializer.call(() => this.customDecoder.init()).catch((o) => t(o));
    else {
      const o = new Error("Decoding error").stack;
      this.decoder = new AudioDecoder({
        output: (c) => {
          try {
            n(new fe(c));
          } catch (l) {
            this.onError(l);
          }
        },
        error: (c) => {
          c.stack = o, this.onError(c);
        }
      }), this.decoder.configure(s);
    }
  }
  getDecodeQueueSize() {
    return this.customDecoder ? this.customDecoderQueueSize : (p(this.decoder), this.decoder.decodeQueueSize);
  }
  decode(e) {
    this.customDecoder ? (this.customDecoderQueueSize++, this.customDecoderCallSerializer.call(() => this.customDecoder.decode(e)).catch((t) => this.onError(t)).finally(() => this.customDecoderQueueSize--)) : (p(this.decoder), this.expectedFirstTimestamp ??= e.timestamp, this.decoder.decode(e.toEncodedAudioChunk()));
  }
  async flush() {
    this.customDecoder ? await this.customDecoderCallSerializer.call(() => this.customDecoder.flush()) : (p(this.decoder), await this.decoder.flush()), this.currentTimestamp = null, this.expectedFirstTimestamp = null, this.timestampOffset = 0;
  }
  close() {
    this.customDecoder ? this.customDecoderCallSerializer.call(() => this.customDecoder.close()) : (p(this.decoder), this.decoder.close());
  }
}
class of extends jn {
  constructor(e, t, i) {
    super(e, t), this.decoderConfig = i, this.currentTimestamp = null, p(ge.includes(i.codec)), this.codec = i.codec;
    const { dataType: s, sampleSize: n, littleEndian: a } = Qe(this.codec);
    switch (this.inputSampleSize = n, n) {
      case 1:
        s === "unsigned" ? this.readInputValue = (o, c) => o.getUint8(c) - 2 ** 7 : s === "signed" ? this.readInputValue = (o, c) => o.getInt8(c) : s === "ulaw" ? this.readInputValue = (o, c) => Jd(o.getUint8(c)) : s === "alaw" ? this.readInputValue = (o, c) => tf(o.getUint8(c)) : p(!1);
        break;
      case 2:
        s === "unsigned" ? this.readInputValue = (o, c) => o.getUint16(c, a) - 2 ** 15 : s === "signed" ? this.readInputValue = (o, c) => o.getInt16(c, a) : p(!1);
        break;
      case 3:
        s === "unsigned" ? this.readInputValue = (o, c) => Kr(o, c, a) - 2 ** 23 : s === "signed" ? this.readInputValue = (o, c) => Il(o, c, a) : p(!1);
        break;
      case 4:
        s === "unsigned" ? this.readInputValue = (o, c) => o.getUint32(c, a) - 2 ** 31 : s === "signed" ? this.readInputValue = (o, c) => o.getInt32(c, a) : s === "float" ? this.readInputValue = (o, c) => o.getFloat32(c, a) : p(!1);
        break;
      case 8:
        s === "float" ? this.readInputValue = (o, c) => o.getFloat64(c, a) : p(!1);
        break;
      default:
        pe(n), p(!1);
    }
    switch (n) {
      case 1:
        s === "ulaw" || s === "alaw" ? (this.outputSampleSize = 2, this.outputFormat = "s16", this.writeOutputValue = (o, c, l) => o.setInt16(c, l, !0)) : (this.outputSampleSize = 1, this.outputFormat = "u8", this.writeOutputValue = (o, c, l) => o.setUint8(c, l + 2 ** 7));
        break;
      case 2:
        this.outputSampleSize = 2, this.outputFormat = "s16", this.writeOutputValue = (o, c, l) => o.setInt16(c, l, !0);
        break;
      case 3:
        this.outputSampleSize = 4, this.outputFormat = "s32", this.writeOutputValue = (o, c, l) => o.setInt32(c, l << 8, !0);
        break;
      case 4:
        this.outputSampleSize = 4, s === "float" ? (this.outputFormat = "f32", this.writeOutputValue = (o, c, l) => o.setFloat32(c, l, !0)) : (this.outputFormat = "s32", this.writeOutputValue = (o, c, l) => o.setInt32(c, l, !0));
        break;
      case 8:
        this.outputSampleSize = 4, this.outputFormat = "f32", this.writeOutputValue = (o, c, l) => o.setFloat32(c, l, !0);
        break;
      default:
        pe(n), p(!1);
    }
  }
  getDecodeQueueSize() {
    return 0;
  }
  decode(e) {
    const t = q(e.data), i = e.byteLength / this.decoderConfig.numberOfChannels / this.inputSampleSize, s = i * this.decoderConfig.numberOfChannels * this.outputSampleSize, n = new ArrayBuffer(s), a = new DataView(n);
    for (let u = 0; u < i * this.decoderConfig.numberOfChannels; u++) {
      const d = u * this.inputSampleSize, f = u * this.outputSampleSize, h = this.readInputValue(t, d);
      this.writeOutputValue(a, f, h);
    }
    const o = i / this.decoderConfig.sampleRate;
    (this.currentTimestamp === null || Math.abs(e.timestamp - this.currentTimestamp) >= o) && (this.currentTimestamp = e.timestamp);
    const c = this.currentTimestamp;
    this.currentTimestamp += o;
    const l = new fe({
      format: this.outputFormat,
      data: n,
      numberOfChannels: this.decoderConfig.numberOfChannels,
      sampleRate: this.decoderConfig.sampleRate,
      numberOfFrames: i,
      timestamp: c
    });
    this.onSample(l);
  }
  async flush() {
  }
  close() {
  }
}
class el extends Zc {
  /** Creates a new {@link AudioSampleSink} for the given {@link InputAudioTrack}. */
  constructor(e) {
    if (!(e instanceof ss))
      throw new TypeError("audioTrack must be an InputAudioTrack.");
    super(), this._track = e;
  }
  /** @internal */
  async _createDecoder(e, t) {
    if (!await this._track.canDecode())
      throw new Error("This audio track cannot be decoded by this browser. Make sure to check decodability before using a track.");
    const i = await this._track.getCodec(), s = await this._track.getDecoderConfig();
    return p(i && s), ge.includes(s.codec) ? new of(e, t, s) : new af(e, t, i, s);
  }
  /** @internal */
  _createPacketSink() {
    return new sr(this._track);
  }
  /**
   * Retrieves the audio sample corresponding to the given timestamp, in seconds. More specifically, returns
   * the last audio sample (in presentation order) with a start timestamp less than or equal to the given timestamp.
   * Returns null if the timestamp is before the track's first timestamp.
   *
   * @param timestamp - The timestamp used for retrieval, in seconds.
   * @param options - Options used for the underlying packet retrieval.
   */
  async getSample(e, t = {}) {
    pt(e);
    for await (const i of this.mediaSamplesAtTimestamps([e], t))
      return i;
    throw new Error("Internal error: Iterator returned nothing.");
  }
  /**
   * Creates an async iterator that yields the audio samples of this track in presentation order. This method
   * will intelligently pre-decode a few samples ahead to enable fast iteration.
   *
   * @param startTimestamp - The timestamp in seconds at which to start yielding samples (inclusive).
   * @param endTimestamp - The timestamp in seconds at which to stop yielding samples (exclusive).
   * @param options - Options used for the underlying packet retrieval.
   */
  samples(e, t, i = {}) {
    return this.mediaSamplesInRange(e, t, i);
  }
  /**
   * Creates an async iterator that yields an audio sample for each timestamp in the argument. This method
   * uses an optimized decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most
   * once, and is therefore more efficient than manually getting the sample for every timestamp. The iterator may
   * yield null if no sample is available for a given timestamp.
   *
   * This method is good for sparse access of media data. If you want primarily sequential media access, prefer
   * {@link AudioSampleSink.samples} instead.
   *
   * @param timestamps - An iterable or async iterable of timestamps in seconds.
   * @param options - Options used for the underlying packet retrieval.
   */
  samplesAtTimestamps(e, t = {}) {
    return this.mediaSamplesAtTimestamps(e, t);
  }
}
class Nm {
  /** Creates a new {@link AudioBufferSink} for the given {@link InputAudioTrack}. */
  constructor(e) {
    if (!(e instanceof ss))
      throw new TypeError("audioTrack must be an InputAudioTrack.");
    this._audioSampleSink = new el(e);
  }
  /** @internal */
  _audioSampleToWrappedArrayBuffer(e) {
    const t = {
      buffer: e.toAudioBuffer(),
      timestamp: e.timestamp,
      duration: e.duration
    };
    return e.close(), t;
  }
  /**
   * Retrieves the audio buffer corresponding to the given timestamp, in seconds. More specifically, returns
   * the last audio buffer (in presentation order) with a start timestamp less than or equal to the given timestamp.
   * Returns null if the timestamp is before the track's first timestamp.
   *
   * @param timestamp - The timestamp used for retrieval, in seconds.
   * @param options - Options used for the underlying packet retrieval.
   */
  async getBuffer(e, t) {
    pt(e);
    const i = await this._audioSampleSink.getSample(e, t);
    return i && this._audioSampleToWrappedArrayBuffer(i);
  }
  /**
   * Creates an async iterator that yields audio buffers of this track in presentation order. This method
   * will intelligently pre-decode a few buffers ahead to enable fast iteration.
   *
   * @param startTimestamp - The timestamp in seconds at which to start yielding buffers (inclusive).
   * @param endTimestamp - The timestamp in seconds at which to stop yielding buffers (exclusive).
   * @param options - Options used for the underlying packet retrieval.
   */
  buffers(e, t, i) {
    return Fr(this._audioSampleSink.samples(e, t, i), (s) => this._audioSampleToWrappedArrayBuffer(s));
  }
  /**
   * Creates an async iterator that yields an audio buffer for each timestamp in the argument. This method
   * uses an optimized decoding pipeline if these timestamps are monotonically sorted, decoding each packet at most
   * once, and is therefore more efficient than manually getting the buffer for every timestamp. The iterator may
   * yield null if no buffer is available for a given timestamp.
   *
   * @param timestamps - An iterable or async iterable of timestamps in seconds.
   * @param options - Options used for the underlying packet retrieval.
   */
  buffersAtTimestamps(e, t) {
    return Fr(this._audioSampleSink.samplesAtTimestamps(e, t), (i) => i && this._audioSampleToWrappedArrayBuffer(i));
  }
}
class ur {
  /** @internal */
  constructor(e, t) {
    this.input = e, this._backing = t;
  }
  /** Returns true if and only if this track is a video track. */
  isVideoTrack() {
    return this instanceof rs;
  }
  /** Returns true if and only if this track is an audio track. */
  isAudioTrack() {
    return this instanceof ss;
  }
  /** The unique ID of this track in the input file. */
  get id() {
    return this._backing.getId();
  }
  /**
   * The 1-based index of this track among all tracks of the same type in the input file. For example, the first
   * video track has number 1, the second video track has number 2, and so on. The index refers to the order in
   * which the tracks are returned by {@link Input.getTracks}.
   */
  get number() {
    return this._backing.getNumber();
  }
  /**
   * Returns the identifier of the codec used internally by the container. It is not homogenized by Mediabunny
   * and depends entirely on the container format.
   *
   * This method can be used to determine the codec of a track in case Mediabunny doesn't know that codec.
   *
   * - For ISOBMFF files, this resolves to the name of the Sample Description Box (e.g. `'avc1'`).
   * - For Matroska files, this resolves to the value of the `CodecID` element.
   * - For WAVE files, this resolves to the value of the format tag in the `'fmt '` chunk.
   * - For ADTS files, this resolves to the `MPEG-4 Audio Object Type`.
   * - For MPEG-TS files, this resolves to the `streamType` value from the Program Map Table.
   * - In all other cases, this resolves to `null`.
   */
  async getInternalCodecId() {
    return this._backing.getInternalCodecId();
  }
  /**
   * See {@link InputTrack.getInternalCodecId}.
   * @deprecated Use {@link InputTrack.getInternalCodecId} instead.
   */
  get internalCodecId() {
    return ie(this._backing.getInternalCodecId(), "internalCodecId", "getInternalCodecId");
  }
  /**
   * Returns the ISO 639-2/T language code for this track. If the language is unknown, this resolves to `'und'`
   * (undetermined).
   */
  async getLanguageCode() {
    return this._backing.getLanguageCode();
  }
  /**
   * The ISO 639-2/T language code for this track. If the language is unknown, this field is `'und'` (undetermined).
   * @deprecated Use {@link InputTrack.getLanguageCode} instead.
   */
  get languageCode() {
    return ie(this._backing.getLanguageCode(), "languageCode", "getLanguageCode");
  }
  /** Returns the user-defined name for this track. */
  async getName() {
    return this._backing.getName();
  }
  /**
   * A user-defined name for this track.
   * @deprecated Use {@link InputTrack.getName} instead.
   */
  get name() {
    return ie(this._backing.getName(), "name", "getName");
  }
  /**
   * Returns a positive number x such that all timestamps and durations of all packets of this track are
   * integer multiples of 1/x.
   */
  async getTimeResolution() {
    return this._backing.getTimeResolution();
  }
  /**
   * A positive number x such that all timestamps and durations of all packets of this track are
   * integer multiples of 1/x.
   * @deprecated Use {@link InputTrack.getTimeResolution} instead.
   */
  get timeResolution() {
    return ie(this._backing.getTimeResolution(), "timeResolution", "getTimeResolution");
  }
  /**
   * Returns whether the timestamps of this track are relative to the Unix epoch (January 1, 1970 00:00:00 UTC).
   * When `true`, each timestamp maps to a definitive point in time.
   */
  async isRelativeToUnixEpoch() {
    return this._backing.isRelativeToUnixEpoch();
  }
  /**
   * Returns the Unix time (in seconds since January 1, 1970 00:00:00 UTC) that the given track timestamp (in seconds)
   * maps to, or `null` if there is no such mapping. This provides a piecewise-continuous mapping from this track's
   * timestamp space into wall-clock time. Such mapping exists, for example, for HLS playlists with
   * `#EXT-X-PROGRAM-DATE-TIME` tags present.
   *
   * This mapping can be available even when {@link InputTrack.isRelativeToUnixEpoch} is `false`, for example for HLS
   * streams with program date time information but with {@link HlsInputFormatOptions.offsetTimestampsByDateTime}
   * set to `false`.
   */
  async getUnixTimeForTimestamp(e) {
    return this._backing.getUnixTimeForTimestamp(e);
  }
  /**
   * Whether the track's timestamps can be mapped to Unix wall clock time via
   * {@link InputTrack.getUnixTimeForTimestamp}.
   */
  async hasUnixTimeMapping() {
    return await this._backing.getUnixTimeForTimestamp(await this.getFirstTimestamp()) !== null;
  }
  /** Returns the track's disposition, i.e. information about its intended usage. */
  async getDisposition() {
    return this._backing.getDisposition();
  }
  /**
   * The track's disposition, i.e. information about its intended usage.
   * @deprecated Use {@link InputTrack.getDisposition} instead.
   */
  get disposition() {
    return ie(this._backing.getDisposition(), "disposition", "getDisposition");
  }
  /**
   * Returns the peak bitrate of the track in bits per second, as specified in the track's metadata. This might not
   * match the actual media data's bitrate.
   */
  async getBitrate() {
    return this._backing.getBitrate();
  }
  /**
   * Returns the average bitrate of the track in bits per second, as specified in the track's metadata. This might
   * not match the actual media data's bitrate.
   */
  async getAverageBitrate() {
    return this._backing.getAverageBitrate();
  }
  /**
   * Returns the start timestamp of the first packet of this track, in seconds. While often near zero, this value
   * may be positive or even negative. A negative starting timestamp means the track's timing has been offset. Samples
   * with a negative timestamp should not be presented.
   */
  async getFirstTimestamp() {
    return (await this._backing.getFirstPacket({ metadataOnly: !0 }))?.timestamp ?? 0;
  }
  /**
   * Returns the end timestamp of the last packet of this track, in seconds.
   *
   * By default, when the underlying media is live, this method will only resolve once the live stream ends. If you
   * want to query the current end timestamp of the stream, set {@link PacketRetrievalOptions.skipLiveWait} to `true`
   * in the options.
   */
  async computeDuration(e) {
    const t = await this._backing.getPacket(1 / 0, { metadataOnly: !0, ...e }), i = (t?.timestamp ?? 0) + (t?.duration ?? 0);
    return wi(i, await this.getTimeResolution());
  }
  /**
   * Gets the duration (end timestamp) in seconds of this track from metadata stored in the file. This value may be
   * approximate or diverge from the actual, precise duration returned by `.computeDuration()`, but compared to that
   * method, this method is cheaper. When the duration cannot be determined from the file metadata, `null`
   * is returned.
   *
   * By default, when the underlying media is live, this method will only resolve once the live stream
   * ends. If you want to query the current duration of the media, set
   * {@link DurationMetadataRequestOptions.skipLiveWait} to `true` in the options.
   */
  async getDurationFromMetadata(e = {}) {
    return this._backing.getDurationFromMetadata(e);
  }
  /**
   * Computes aggregate packet statistics for this track, such as average packet rate or bitrate.
   *
   * @param targetPacketCount - This optional parameter sets a target for how many packets this method must have
   * looked at before it can return early; this means, you can use it to aggregate only a subset (prefix) of all
   * packets. This is very useful for getting a great estimate of video frame rate without having to scan through the
   * entire file.
   *
   * By default, when the underlying media is live and `targetPacketCount` is not set, this method will only resolve
   * once the live stream ends. If you want to query the current packet statistics of the stream, set
   * {@link PacketRetrievalOptions.skipLiveWait} to `true` in the options.
   */
  async computePacketStats(e = 1 / 0, t) {
    const i = new sr(this);
    let s = 1 / 0, n = -1 / 0, a = 0, o = 0;
    for await (const c of i.packets(void 0, void 0, { metadataOnly: !0, ...t })) {
      if (a >= e && c.timestamp >= n)
        break;
      s = Math.min(s, c.timestamp), n = Math.max(n, c.timestamp + c.duration), a++, o += c.byteLength;
    }
    return {
      packetCount: a,
      averagePacketRate: a ? Number((a / (n - s)).toPrecision(16)) : 0,
      averageBitrate: a ? Number((8 * o / (n - s)).toPrecision(16)) : 0
    };
  }
  /**
   * Whether or not this track is currently live, meaning the media's end is still unknown.
   *
   * The value returned by this method may change over time as the track stops being live. To keep track of the
   * track's live status, poll this method at the track's refresh interval
   * via {@link InputTrack.getLiveRefreshInterval}.
   */
  async isLive() {
    return await this._backing.getLiveRefreshInterval() !== null;
  }
  /**
   * Returns the track's live refresh interval in seconds, or `null` if the track is not live. This interval describes
   * the time it takes, on average, for new live media data to become available.
   */
  async getLiveRefreshInterval() {
    return this._backing.getLiveRefreshInterval();
  }
  /**
   * Returns `true` if this track can be paired with the given track. Two tracks being pairable means they can be
   * presented (displayed) together.
   *
   * Returns `false` if `other` equals `this`.
   */
  canBePairedWith(e) {
    if (!(e instanceof ur))
      throw new TypeError("other must be an InputTrack.");
    return this.input !== e.input || this === e ? !1 : (this._backing.getPairingMask() & e._backing.getPairingMask()) !== 0n;
  }
  /**
   * Gets the list of other tracks that can be paired with this track. An optional query can be provided to narrow
   * down the results.
   */
  async getPairableTracks(e) {
    return this.input.getTracks(Nt({
      filter: (t) => t.canBePairedWith(this)
    }, e));
  }
  /**
   * Gets the list of other video tracks that can be paired with this track. An optional query can be provided to
   * narrow down the results.
   */
  async getPairableVideoTracks(e) {
    return this.input.getVideoTracks(Nt({
      filter: (t) => t.canBePairedWith(this)
    }, e));
  }
  /**
   * Gets the list of other audio tracks that can be paired with this track. An optional query can be provided to
   * narrow down the results.
   */
  async getPairableAudioTracks(e) {
    return this.input.getAudioTracks(Nt({
      filter: (t) => t.canBePairedWith(this)
    }, e));
  }
  /** Returns the primary track that can be paired with this track, optionally steered by the provided query. */
  async getPrimaryPairableVideoTrack(e) {
    return this.input.getPrimaryVideoTrack(Nt({
      filter: (t) => t.canBePairedWith(this)
    }, e));
  }
  /** Returns the primary track that can be paired with this track, optionally steered by the provided query. */
  async getPrimaryPairableAudioTrack(e) {
    return this.input.getPrimaryAudioTrack(Nt({
      filter: (t) => t.canBePairedWith(this)
    }, e));
  }
  /** Returns `true` if there is another track that can be paired with this track. */
  async hasPairableTrack(e) {
    e &&= Cs(e);
    const t = await this.input.getTracks();
    for (const i of t)
      if (this.canBePairedWith(i) && (!e || await e(i)))
        return !0;
    return !1;
  }
  /** Returns `true` if there is a video track that can be paired with this track. */
  hasPairableVideoTrack(e) {
    return e &&= Cs(e), this.hasPairableTrack(async (t) => t.isVideoTrack() && (!e || await e(t)));
  }
  /** Returns `true` if there is an audio track that can be paired with this track. */
  hasPairableAudioTrack(e) {
    return e &&= Cs(e), this.hasPairableTrack(async (t) => t.isAudioTrack() && (!e || await e(t)));
  }
}
const ie = (r, e, t) => {
  if (r instanceof Promise)
    throw new Error(`'${e}' is deprecated and not available synchronously for this track. Use the preferred '${t}()' instead.`);
  return r;
}, Cs = (r) => {
  if (r !== void 0 && typeof r != "function")
    throw new TypeError("predicate, when provided, must be a function.");
  return r ? (e) => {
    const t = (s) => {
      if (typeof s != "boolean")
        throw new TypeError("predicate must return or resolve to a boolean value.");
      return s;
    }, i = r(e);
    return i instanceof Promise ? i.then(t) : t(i);
  } : void 0;
};
class rs extends ur {
  /** @internal */
  constructor(e, t) {
    super(e, t), this._pixelAspectRatioCache = null, this._backing = t;
  }
  get type() {
    return "video";
  }
  /** The codec of the track's packets. */
  async getCodec() {
    return this._backing.getCodec();
  }
  /**
   * The codec of the track's packets.
   * @deprecated Use {@link InputVideoTrack.getCodec} instead.
   */
  get codec() {
    return ie(this._backing.getCodec(), "codec", "getCodec");
  }
  async hasOnlyKeyPackets() {
    return await this._backing.getHasOnlyKeyPackets?.() ?? await this._backing.getCodec() === "prores";
  }
  /** Returns the width in pixels of the track's coded samples, before any transformations or rotations. */
  async getCodedWidth() {
    return this._backing.getCodedWidth();
  }
  /**
   * The width in pixels of the track's coded samples, before any transformations or rotations.
   * @deprecated Use {@link InputVideoTrack.getCodedWidth} instead.
   */
  get codedWidth() {
    return ie(this._backing.getCodedWidth(), "codedWidth", "getCodedWidth");
  }
  /** Returns the height in pixels of the track's coded samples, before any transformations or rotations. */
  async getCodedHeight() {
    return this._backing.getCodedHeight();
  }
  /**
   * The height in pixels of the track's coded samples, before any transformations or rotations.
   * @deprecated Use {@link InputVideoTrack.getCodedHeight} instead.
   */
  get codedHeight() {
    return ie(this._backing.getCodedHeight(), "codedHeight", "getCodedHeight");
  }
  /** Returns the angle in degrees by which the track's frames should be rotated (clockwise). */
  async getRotation() {
    return this._backing.getRotation();
  }
  /**
   * The angle in degrees by which the track's frames should be rotated (clockwise).
   * @deprecated Use {@link InputVideoTrack.getRotation} instead.
   */
  get rotation() {
    return ie(this._backing.getRotation(), "rotation", "getRotation");
  }
  /**
   * Returns the width of the track's frames in square pixels, adjusted for pixel aspect ratio but before rotation.
   */
  async getSquarePixelWidth() {
    return this._backing.getSquarePixelWidth();
  }
  /**
   * The width of the track's frames in square pixels, adjusted for pixel aspect ratio but before rotation.
   * @deprecated Use {@link InputVideoTrack.getSquarePixelWidth} instead.
   */
  get squarePixelWidth() {
    return ie(this._backing.getSquarePixelWidth(), "squarePixelWidth", "getSquarePixelWidth");
  }
  /**
   * Returns the height of the track's frames in square pixels, adjusted for pixel aspect ratio but before rotation.
   */
  async getSquarePixelHeight() {
    return this._backing.getSquarePixelHeight();
  }
  /**
   * The height of the track's frames in square pixels, adjusted for pixel aspect ratio but before rotation.
   * @deprecated Use {@link InputVideoTrack.getSquarePixelHeight} instead.
   */
  get squarePixelHeight() {
    return ie(this._backing.getSquarePixelHeight(), "squarePixelHeight", "getSquarePixelHeight");
  }
  /**
   * Returns the pixel aspect ratio of the track's frames as a rational number in its reduced form. Most videos use
   * square pixels (1:1).
   */
  async getPixelAspectRatio() {
    return this._pixelAspectRatioCache ??= Qi({
      num: await this.getSquarePixelWidth() * await this.getCodedHeight(),
      den: await this.getSquarePixelHeight() * await this.getCodedWidth()
    });
  }
  /**
   * The pixel aspect ratio of the track's frames, as a rational number in its reduced form. Most videos use
   * square pixels (1:1).
   * @deprecated Use {@link InputVideoTrack.getPixelAspectRatio} instead.
   */
  get pixelAspectRatio() {
    return this._pixelAspectRatioCache ??= Qi({
      num: ie(this._backing.getSquarePixelWidth(), "pixelAspectRatio", "getPixelAspectRatio") * ie(this._backing.getCodedHeight(), "pixelAspectRatio", "getPixelAspectRatio"),
      den: ie(this._backing.getSquarePixelHeight(), "pixelAspectRatio", "getPixelAspectRatio") * ie(this._backing.getCodedWidth(), "pixelAspectRatio", "getPixelAspectRatio")
    });
  }
  /** Returns the display width of the track's frames in pixels, after aspect ratio adjustment and rotation. */
  async getDisplayWidth() {
    const e = await this._backing.getMetadataDisplayWidth?.();
    return e ?? (await this.getRotation() % 180 === 0 ? this.getSquarePixelWidth() : this.getSquarePixelHeight());
  }
  /**
   * The display width of the track's frames in pixels, after aspect ratio adjustment and rotation.
   * @deprecated Use {@link InputVideoTrack.getDisplayWidth} instead.
   */
  get displayWidth() {
    const e = this._backing.getMetadataDisplayWidth?.();
    if (e !== void 0) {
      const s = ie(e, "displayWidth", "getDisplayWidth");
      if (s !== null)
        return s;
    }
    const i = ie(this._backing.getRotation(), "displayWidth", "getDisplayWidth") % 180 === 0 ? this._backing.getSquarePixelWidth() : this._backing.getSquarePixelHeight();
    return ie(i, "displayWidth", "getDisplayWidth");
  }
  /** Returns the display height of the track's frames in pixels, after aspect ratio adjustment and rotation. */
  async getDisplayHeight() {
    const e = await this._backing.getMetadataDisplayHeight?.();
    return e ?? (await this.getRotation() % 180 === 0 ? this.getSquarePixelHeight() : this.getSquarePixelWidth());
  }
  /**
   * The display height of the track's frames in pixels, after aspect ratio adjustment and rotation.
   * @deprecated Use {@link InputVideoTrack.getDisplayHeight} instead.
   */
  get displayHeight() {
    const e = this._backing.getMetadataDisplayHeight?.();
    if (e !== void 0) {
      const s = ie(e, "displayHeight", "getDisplayHeight");
      if (s !== null)
        return s;
    }
    const i = ie(this._backing.getRotation(), "displayHeight", "getDisplayHeight") % 180 === 0 ? this._backing.getSquarePixelHeight() : this._backing.getSquarePixelWidth();
    return ie(i, "displayHeight", "getDisplayHeight");
  }
  /** Returns the color space of the track's samples. */
  async getColorSpace() {
    return this._backing.getColorSpace();
  }
  /** If this method returns true, the track's samples use a high dynamic range (HDR). */
  async hasHighDynamicRange() {
    const e = await this._backing.getColorSpace();
    return e.primaries === "bt2020" || e.primaries === "smpte432" || e.transfer === "pq" || e.transfer === "hlg" || e.matrix === "bt2020-ncl";
  }
  /** Checks if this track may contain transparent samples with alpha data. */
  async canBeTransparent() {
    return this._backing.canBeTransparent();
  }
  /**
   * Returns the [decoder configuration](https://www.w3.org/TR/webcodecs/#video-decoder-config) for decoding the
   * track's packets using a [`VideoDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/VideoDecoder). Returns
   * null if the track's codec is unknown.
   */
  async getDecoderConfig() {
    return this._backing.getDecoderConfig();
  }
  async getCodecParameterString() {
    const e = await this._backing.getMetadataCodecParameterString?.();
    return e ?? (await this._backing.getDecoderConfig())?.codec ?? null;
  }
  async canDecode() {
    try {
      const e = await this._backing.getDecoderConfig();
      if (!e)
        return !1;
      const t = await this._backing.getCodec();
      return p(t !== null), ir.some((s) => s.supports(t, e)) ? !0 : typeof VideoDecoder > "u" ? !1 : (await VideoDecoder.isConfigSupported(e)).supported === !0;
    } catch (e) {
      return D._error("Error during decodability check:", e), !1;
    }
  }
  async determinePacketType(e) {
    if (!(e instanceof Z))
      throw new TypeError("packet must be an EncodedPacket.");
    if (e.isMetadataOnly)
      throw new TypeError("packet must not be metadata-only to determine its type.");
    const t = await this.getCodec();
    if (t === null)
      return null;
    const i = await this.getDecoderConfig();
    return p(i), es(t, i, e.data);
  }
}
class ss extends ur {
  /** @internal */
  constructor(e, t) {
    super(e, t), this._backing = t;
  }
  get type() {
    return "audio";
  }
  /** The codec of the track's packets. */
  async getCodec() {
    return this._backing.getCodec();
  }
  /**
   * The codec of the track's packets.
   * @deprecated Use {@link InputAudioTrack.getCodec} instead.
   */
  get codec() {
    return ie(this._backing.getCodec(), "codec", "getCodec");
  }
  async hasOnlyKeyPackets() {
    return await this._backing.getHasOnlyKeyPackets?.() ?? !0;
  }
  /** Returns the number of audio channels in the track. */
  async getNumberOfChannels() {
    return this._backing.getNumberOfChannels();
  }
  /**
   * The number of audio channels in the track.
   * @deprecated Use {@link InputAudioTrack.getNumberOfChannels} instead.
   */
  get numberOfChannels() {
    return ie(this._backing.getNumberOfChannels(), "numberOfChannels", "getNumberOfChannels");
  }
  /** Returns the track's audio sample rate in hertz. */
  async getSampleRate() {
    return this._backing.getSampleRate();
  }
  /**
   * The track's audio sample rate in hertz.
   * @deprecated Use {@link InputAudioTrack.getSampleRate} instead.
   */
  get sampleRate() {
    return ie(this._backing.getSampleRate(), "sampleRate", "getSampleRate");
  }
  /**
   * Returns the [decoder configuration](https://www.w3.org/TR/webcodecs/#audio-decoder-config) for decoding the
   * track's packets using an [`AudioDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/AudioDecoder). Returns
   * null if the track's codec is unknown.
   */
  async getDecoderConfig() {
    return this._backing.getDecoderConfig();
  }
  async getCodecParameterString() {
    const e = await this._backing.getMetadataCodecParameterString?.();
    return e ?? (await this._backing.getDecoderConfig())?.codec ?? null;
  }
  async canDecode() {
    try {
      const e = await this._backing.getDecoderConfig();
      if (!e)
        return !1;
      const t = await this._backing.getCodec();
      return p(t !== null), rr.some((i) => i.supports(t, e)) || e.codec.startsWith("pcm-") ? !0 : typeof AudioDecoder > "u" ? !1 : (await AudioDecoder.isConfigSupported(e)).supported === !0;
    } catch (e) {
      return D._error("Error during decodability check:", e), !1;
    }
  }
  async determinePacketType(e) {
    if (!(e instanceof Z))
      throw new TypeError("packet must be an EncodedPacket.");
    return await this.getCodec() === null ? null : "key";
  }
}
const Vm = (r) => r ?? 1 / 0, Ya = (r) => -(r ?? -1 / 0), Bi = (r) => -r, Ri = (r) => {
  if (typeof r != "object" || !r)
    throw new TypeError("query must be an object.");
  if (r.filter !== void 0 && typeof r.filter != "function")
    throw new TypeError("query.filter, when provided, must be a function.");
  if (r.sortBy !== void 0 && typeof r.sortBy != "function")
    throw new TypeError("query.sortBy, when provided, must be a function.");
  return {
    filter: r.filter ? (e) => {
      const t = (s) => {
        if (typeof s != "boolean")
          throw new TypeError("query.filter must return or resolve to a boolean.");
        return s;
      }, i = r.filter(e);
      return i instanceof Promise ? i.then(t) : t(i);
    } : void 0,
    sortBy: r.sortBy ? (e) => {
      const t = (s) => {
        if (typeof s != "number" && (!Array.isArray(s) || !s.every((n) => typeof n == "number")))
          throw new TypeError("query.sortBy must return or resolve to a number or an array of numbers.");
        return s;
      }, i = r.sortBy(e);
      return i instanceof Promise ? i.then(t) : t(i);
    } : void 0
  };
}, Nt = (r, e) => ({
  filter: r?.filter || e?.filter ? (t) => {
    const i = r?.filter?.(t) ?? !0, s = (n) => n === !1 ? !1 : e?.filter?.(t) ?? !0;
    return i instanceof Promise ? i.then(s) : s(i);
  } : void 0,
  sortBy: r?.sortBy || e?.sortBy ? (t) => {
    const i = r?.sortBy?.(t) ?? [], s = e?.sortBy?.(t) ?? [], n = (a, o) => [
      ...Array.isArray(a) ? a : [a],
      ...Array.isArray(o) ? o : [o]
    ];
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([a, o]) => n(a, o)) : n(i, s);
  } : void 0
}), _s = async (r, e) => {
  let t = r;
  if (e?.filter) {
    const a = r.map((c) => e.filter(c));
    if (a.some((c) => c instanceof Promise)) {
      const c = await Promise.all(a);
      t = r.filter((l, u) => c[u]);
    } else
      t = r.filter((c, l) => a[l]);
  }
  if (!e?.sortBy)
    return t;
  const i = t.map((a) => e.sortBy(a)), n = i.some((a) => a instanceof Promise) ? await Promise.all(i) : i;
  return t.map((a, o) => ({ track: a, sortValue: n[o] })).sort((a, o) => {
    const c = Array.isArray(a.sortValue) ? a.sortValue : [a.sortValue], l = Array.isArray(o.sortValue) ? o.sortValue : [o.sortValue], u = Math.max(c.length, l.length);
    for (let d = 0; d < u; d++) {
      const f = c[d] ?? 0, h = l[d] ?? 0;
      if (f !== h)
        return f - h;
    }
    return 0;
  }).map((a) => a.track);
};
kn();
const cf = 1, lf = 2;
class ns extends or {
  /** True if the input has been disposed. */
  get disposed() {
    return this._disposed;
  }
  /**
   * Creates a new input file from the specified options. No reading operations will be performed until methods are
   * called on this instance.
   */
  constructor(e) {
    if (super(), this._demuxerPromise = null, this._format = null, this._trackBackingsCache = null, this._backingToTrack = /* @__PURE__ */ new Map(), this._disposed = !1, this._nextSourceCacheAge = 0, this._sourceRefs = [], this._sourceCache = [], this._sourceCachePromises = [], this._onFormatDetermined = null, !e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (!Array.isArray(e.formats) || e.formats.some((t) => !(t instanceof rt)))
      throw new TypeError("options.formats must be an array of InputFormat.");
    if (!(e.source instanceof Oe || e.source instanceof On))
      throw new TypeError("options.source must be a Source or SourceRef.");
    if (e.source instanceof Oe && e.source._disposed)
      throw new TypeError("options.source must not be a disposed Source.");
    if (e.initInput !== void 0 && !(e.initInput instanceof ns))
      throw new TypeError("options.initInput, when provided, must be an Input.");
    e.formatOptions !== void 0 && Id(e.formatOptions, "formatOptions"), this._formats = e.formats, this._initInput = e.initInput ?? null, this._formatOptions = e.formatOptions ?? {}, e.source instanceof Oe ? this._rootRef = e.source.ref() : this._rootRef = e.source, this._sourceRefs.push(this._rootRef);
  }
  /** @internal */
  get _rootSource() {
    return this._rootRef.source;
  }
  /** @internal */
  async _getSourceUncached(e) {
    p(this._rootSource instanceof Zt);
    const t = await this._rootSource._resolveRequest(e);
    return this._emit("source", { source: t.source, request: e, isRoot: e.isRoot }), t;
  }
  /** @internal */
  _getSourceCached(e, t = cf) {
    const i = this._sourceCache.find((a) => a.cacheGroup === t && za(a.request, e));
    if (i)
      return i.age++, Promise.resolve(i.sourceRef.source.ref());
    const s = this._sourceCachePromises.find((a) => a.cacheGroup === t && za(a.request, e));
    if (s)
      return s.promise.then((a) => a.sourceRef.source.ref());
    const n = (async () => {
      const a = await this._getSourceUncached(e);
      if (Ui(this._sourceCache, (d) => d.cacheGroup === t && d.sourceRef.source._refCount === 1) >= 4) {
        const d = Tn(this._sourceCache, (h) => h.cacheGroup === t && h.sourceRef.source._refCount === 1 ? h.age : 1 / 0);
        p(d !== -1);
        const f = this._sourceCache[d];
        this._sourceCache.splice(d, 1), f.sourceRef.free(), vr(this._sourceRefs, f.sourceRef);
      }
      this._sourceRefs.push(a);
      const l = this._sourceCachePromises.findIndex((d) => d.request === e);
      return p(l !== -1), this._sourceCachePromises.splice(l, 1), {
        request: e,
        sourceRef: a,
        age: this._nextSourceCacheAge++,
        cacheGroup: t
      };
    })();
    return this._sourceCachePromises.push({
      request: e,
      cacheGroup: t,
      promise: n
    }), n.then((a) => {
      const o = a.sourceRef.source.ref();
      return this._sourceCache.push(a), o;
    });
  }
  /** @internal */
  _getDemuxer() {
    return this._demuxerPromise ??= (async () => {
      this._reader = new Pr(this._rootSource), this._emit("source", { source: this._rootSource, request: null, isRoot: !0 });
      for (const e of this._formats)
        if (await e._canReadInput(this))
          return this._format = e, this._onFormatDetermined?.(e), e._createDemuxer(this);
      throw new Za();
    })();
  }
  /**
   * Returns the source from which this input file reads data for the root path.
   */
  get source() {
    return this._rootSource;
  }
  /**
   * Returns the format of the input file. You can compare this result directly to the {@link InputFormat} singletons
   * or use `instanceof` checks for subset-aware logic (for example, `format instanceof MatroskaInputFormat` is true
   * for both MKV and WebM).
   */
  async getFormat() {
    return await this._getDemuxer(), p(this._format), this._format;
  }
  /** Returns `true` if the format of the input file is known and the file can be read, `false` otherwise. */
  async canRead() {
    try {
      return await this._getDemuxer(), !0;
    } catch (e) {
      if (e instanceof Za)
        return !1;
      throw e;
    }
  }
  /**
   * Returns the timestamp at which the input file starts. More precisely, returns the smallest starting timestamp
   * among all tracks.
   *
   * Optionally, you can pass in the list of tracks for which you want to compute the starting timestamp.
   *
   * Note that this method is potentially expensive for inputs with many tracks (such as HLS manifests), since it
   * probes every track.
   */
  async getFirstTimestamp(e) {
    e ??= await this.getTracks();
    const t = e.filter((n) => n !== null);
    if (t.length === 0)
      return 0;
    const i = await Promise.all(t.map((n) => n._backing.getFirstPacket({ metadataOnly: !0 }))), s = Math.min(...i.map((n) => n?.timestamp ?? 1 / 0));
    return s === 1 / 0 ? 0 : s;
  }
  /**
   * Computes the duration of the input file, in seconds. More precisely, returns the largest end timestamp among
   * all tracks.
   *
   * Optionally, you can pass in the list of tracks for which you want to compute the duration.
   *
   * This method can be potentially expensive depending on the underlying file format, because it returns the most
   * accurate duration possible and must check all tracks. Use {@link Input.getDurationFromMetadata} for a faster but
   * less accurate estimate of duration.
   *
   * By default, when any track in the underlying media is live, this method will only resolve once the live stream
   * ends. If you want to query the current duration of the media, set {@link PacketRetrievalOptions.skipLiveWait}
   * to `true` in the options.
   */
  async computeDuration(e, t) {
    e ??= await this.getTracks();
    const i = e.filter((n) => n !== null);
    if (i.length === 0)
      return 0;
    const s = await Promise.all(i.map((n) => n.computeDuration(t)));
    return Math.max(...s);
  }
  /**
   * Gets the duration (end timestamp) in seconds of the input file from metadata stored in the file. This value may
   * be approximate or diverge from the actual, precise duration returned by `.computeDuration()`, but compared to
   * that method, this method is cheaper. When the duration cannot be determined from the file metadata, `null`
   * is returned.
   *
   * Optionally, you can pass in the list of tracks for which you want to get the duration from metadata.
   *
   * By default, when the underlying media is live, this method will only resolve once the live stream
   * ends. If you want to query the current duration of the media, set
   * {@link DurationMetadataRequestOptions.skipLiveWait} to `true` in the options.
   */
  async getDurationFromMetadata(e, t) {
    e ??= await this.getTracks();
    const i = e.filter((a) => a !== null), n = (await Promise.all(i.map((a) => a.getDurationFromMetadata(t)))).filter((a) => a !== null);
    return n.length === 0 ? null : Math.max(...n);
  }
  /**
   * Returns the list of all tracks of this input file in the order in which they appear in the file. An optional
   * query can be provided.
   */
  async getTracks(e) {
    e &&= Ri(e);
    const i = (await this._getTrackBackings()).map((s) => this._wrapBackingAsTrack(s));
    return _s(i, e);
  }
  /** Returns the list of all video tracks of this input file. An optional query can be provided. */
  async getVideoTracks(e) {
    e &&= Ri(e);
    const i = (await this.getTracks()).filter((s) => s.isVideoTrack());
    return _s(i, e);
  }
  /** Returns the list of all audio tracks of this input file. An optional query can be provided. */
  async getAudioTracks(e) {
    e &&= Ri(e);
    const i = (await this.getTracks()).filter((s) => s.isAudioTrack());
    return _s(i, e);
  }
  /**
   * Returns the primary video track of this input file, or null if there are no video tracks.
   *
   * Multiple factors determine which track is considered primary, including its position in the file, disposition,
   * bitrate (higher bitrate is preferred), and if it can be paired with an audio track.
   */
  async getPrimaryVideoTrack(e) {
    e &&= Ri(e);
    const t = Nt(e, {
      sortBy: async (s) => [
        Bi((await s.getDisposition()).default),
        Bi(await s.hasPairableAudioTrack()),
        Bi(!await s.hasOnlyKeyPackets()),
        Ya(await s.getBitrate())
      ]
    });
    return (await this.getVideoTracks(t))[0] ?? null;
  }
  /**
   * Returns the primary audio track of this input file, or null if there are no audio tracks.
   *
   * Multiple factors determine which track is considered primary, including its position in the file, disposition,
   * bitrate (higher bitrate is preferred), and if it can be paired with the primary video track.
   */
  async getPrimaryAudioTrack(e) {
    e &&= Ri(e);
    const t = await this.getPrimaryVideoTrack(), i = Nt(e, {
      sortBy: async (n) => [
        Bi(!t || n.canBePairedWith(t)),
        Bi((await n.getDisposition()).default),
        Ya(await n.getBitrate())
      ]
    });
    return (await this.getAudioTracks(i))[0] ?? null;
  }
  /** @internal */
  async _getTrackBackings() {
    const e = await this._getDemuxer();
    return this._trackBackingsCache ??= await e.getTrackBackings();
  }
  /** @internal */
  _wrapBackingAsTrack(e) {
    const t = this._backingToTrack.get(e);
    if (t)
      return t;
    const s = e.getType() === "video" ? new rs(this, e) : new ss(this, e);
    return this._backingToTrack.set(e, s), s;
  }
  /** Returns the full MIME type of this input file, including track codecs. */
  async getMimeType() {
    return (await this._getDemuxer()).getMimeType();
  }
  /**
   * Returns descriptive metadata tags about the media file, such as title, author, date, cover art, or other
   * attached files.
   */
  async getMetadataTags() {
    return (await this._getDemuxer()).getMetadataTags();
  }
  /**
   * Disposes this input and frees connected resources. When an input is disposed, ongoing read operations will be
   * canceled, all future read operations will fail, any open decoders will be closed, and all ongoing media sink
   * operations will be canceled. Disallowed and canceled operations will throw an {@link InputDisposedError}.
   *
   * You are expected not to use an input after disposing it. While some operations may still work, it is not
   * specified and may change in any future update.
   */
  dispose() {
    if (!this._disposed) {
      this._disposed = !0;
      for (const e of this._sourceRefs)
        e.free();
      this._sourceRefs.length = 0, this._demuxerPromise && this._demuxerPromise.then((e) => e.dispose()).catch(() => {
      });
    }
  }
  /**
   * Calls `.dispose()` on the input, implementing the `Disposable` interface for use with
   * JavaScript Explicit Resource Management features.
   */
  [Symbol.dispose]() {
    this.dispose();
  }
}
class Za extends Error {
  /** Creates a new {@link UnsupportedInputFormatError}. */
  constructor(e = "Input has an unsupported or unrecognizable format.") {
    super(e), this.name = "UnsupportedInputFormatError";
  }
}
class Pe extends Error {
  /** Creates a new {@link InputDisposedError}. */
  constructor(e = "Input has been disposed.") {
    super(e), this.name = "InputDisposedError";
  }
}
class Pr {
  constructor(e) {
    this.source = e;
  }
  get fileSize() {
    const e = this.source._getFileSize();
    if (e === void 0)
      throw new Error("Reading file size too early; read required first.");
    return e;
  }
  get fileSizeNonStrict() {
    return this.source._getFileSize() ?? null;
  }
  requestSlice(e, t) {
    if (this.source._disposed)
      throw new Pe();
    if (e < 0 || this.fileSizeNonStrict !== null && e + t > this.fileSizeNonStrict)
      return null;
    if (t === 0) {
      const n = new Uint8Array(0);
      return new Ce(n, q(n), 0, e, e);
    }
    const i = e + t, s = this.source._read(e, i, Pc, Cc);
    return s instanceof Promise ? s.then((n) => n ? new Ce(n.bytes, n.view, n.offset, e, i) : null) : s ? new Ce(s.bytes, s.view, s.offset, e, i) : null;
  }
  requestSliceRange(e, t, i) {
    if (this.source._disposed)
      throw new Pe();
    if (e < 0)
      return null;
    if (this.fileSizeNonStrict !== null)
      return this.requestSlice(e, le(this.fileSizeNonStrict - e, t, i));
    {
      const s = this.requestSlice(e, i), n = (a) => a || (p(this.fileSizeNonStrict !== null), this.requestSlice(e, le(this.fileSizeNonStrict - e, t, i)));
      return s instanceof Promise ? s.then(n) : n(s);
    }
  }
  requestEntireFile() {
    if (this.fileSizeNonStrict !== null)
      return this.requestSlice(0, this.fileSizeNonStrict);
    const e = 1024;
    return (async () => {
      const t = [];
      let i = 0;
      for (; ; ) {
        if (t.length === 1 && this.fileSizeNonStrict !== null)
          return this.requestSlice(0, this.fileSizeNonStrict);
        let a = this.requestSliceRange(i, 0, e);
        if (a instanceof Promise && (a = await a), !a || a.length === 0)
          break;
        const o = N(a, a.length);
        t.push(o), i += a.length;
      }
      const s = new Uint8Array(i);
      let n = 0;
      for (const a of t)
        s.set(a, n), n += a.length;
      return new Ce(s, q(s), 0, 0, i);
    })();
  }
}
class Ce {
  constructor(e, t, i, s, n) {
    this.bytes = e, this.view = t, this.offset = i, this.start = s, this.end = n, this.bufferPos = s - i;
  }
  static tempFromBytes(e) {
    return new Ce(e, q(e), 0, 0, e.length);
  }
  get length() {
    return this.end - this.start;
  }
  get filePos() {
    return this.offset + this.bufferPos;
  }
  set filePos(e) {
    this.bufferPos = e - this.offset;
  }
  /** The number of bytes left from the current pos to the end of the slice. */
  get remainingLength() {
    return Math.max(this.end - this.filePos, 0);
  }
  skip(e) {
    this.bufferPos += e;
  }
  /** Creates a new subslice of this slice whose byte range must be contained within this slice. */
  slice(e, t = this.end - e) {
    if (e < this.start || e + t > this.end)
      throw new RangeError("Slicing outside of original slice.");
    return new Ce(this.bytes, this.view, this.offset, e, e + t);
  }
}
const Fe = (r, e) => {
  if (r.filePos < r.start || r.filePos + e > r.end)
    throw new RangeError(`Tried reading [${r.filePos}, ${r.filePos + e}), but slice is [${r.start}, ${r.end}). This is likely an internal error, please report it alongside the file that caused it.`);
}, N = (r, e) => {
  Fe(r, e);
  const t = r.bytes.subarray(r.bufferPos, r.bufferPos + e);
  return r.bufferPos += e, t;
}, U = (r) => (Fe(r, 1), r.view.getUint8(r.bufferPos++)), Mi = (r, e) => {
  Fe(r, 2);
  const t = r.view.getUint16(r.bufferPos, e);
  return r.bufferPos += 2, t;
}, ue = (r) => {
  Fe(r, 2);
  const e = r.view.getUint16(r.bufferPos, !1);
  return r.bufferPos += 2, e;
}, at = (r) => {
  Fe(r, 3);
  const e = Kr(r.view, r.bufferPos, !1);
  return r.bufferPos += 3, e;
}, mn = (r) => {
  Fe(r, 2);
  const e = r.view.getInt16(r.bufferPos, !1);
  return r.bufferPos += 2, e;
}, It = (r, e) => {
  Fe(r, 4);
  const t = r.view.getUint32(r.bufferPos, e);
  return r.bufferPos += 4, t;
}, B = (r) => {
  Fe(r, 4);
  const e = r.view.getUint32(r.bufferPos, !1);
  return r.bufferPos += 4, e;
}, li = (r) => {
  Fe(r, 4);
  const e = r.view.getUint32(r.bufferPos, !0);
  return r.bufferPos += 4, e;
}, Lt = (r) => {
  Fe(r, 4);
  const e = r.view.getInt32(r.bufferPos, !1);
  return r.bufferPos += 4, e;
}, uf = (r) => {
  Fe(r, 4);
  const e = r.view.getInt32(r.bufferPos, !0);
  return r.bufferPos += 4, e;
}, Ja = (r, e) => {
  let t, i;
  return e ? (t = It(r, !0), i = It(r, !0)) : (i = It(r, !1), t = It(r, !1)), i * 4294967296 + t;
}, ze = (r) => {
  const e = B(r), t = B(r);
  return e * 4294967296 + t;
}, df = (r) => {
  const e = Lt(r), t = B(r);
  return e * 4294967296 + t;
}, ff = (r) => {
  const e = li(r);
  return uf(r) * 4294967296 + e;
}, hf = (r) => {
  Fe(r, 4);
  const e = r.view.getFloat32(r.bufferPos, !1);
  return r.bufferPos += 4, e;
}, tl = (r) => {
  Fe(r, 8);
  const e = r.view.getFloat64(r.bufferPos, !1);
  return r.bufferPos += 8, e;
}, oe = (r, e) => {
  Fe(r, e);
  let t = "";
  for (let i = 0; i < e; i++)
    t += String.fromCharCode(r.bytes[r.bufferPos++]);
  return t;
}, il = (r, e, t) => ve.decode(N(r, e)).split(`
`).map((n) => n.trim()).filter((n) => n.length > 0 && !t?.ignore?.(n));
var qt;
(function(r) {
  r[r.Unsynchronisation = 128] = "Unsynchronisation", r[r.ExtendedHeader = 64] = "ExtendedHeader", r[r.ExperimentalIndicator = 32] = "ExperimentalIndicator", r[r.Footer = 16] = "Footer";
})(qt || (qt = {}));
var ye;
(function(r) {
  r[r.ISO_8859_1 = 0] = "ISO_8859_1", r[r.UTF_16_WITH_BOM = 1] = "UTF_16_WITH_BOM", r[r.UTF_16_BE_NO_BOM = 2] = "UTF_16_BE_NO_BOM", r[r.UTF_8 = 3] = "UTF_8";
})(ye || (ye = {}));
const Cr = 128, Ne = 10, ui = [
  "Blues",
  "Classic rock",
  "Country",
  "Dance",
  "Disco",
  "Funk",
  "Grunge",
  "Hip-hop",
  "Jazz",
  "Metal",
  "New age",
  "Oldies",
  "Other",
  "Pop",
  "Rhythm and blues",
  "Rap",
  "Reggae",
  "Rock",
  "Techno",
  "Industrial",
  "Alternative",
  "Ska",
  "Death metal",
  "Pranks",
  "Soundtrack",
  "Euro-techno",
  "Ambient",
  "Trip-hop",
  "Vocal",
  "Jazz & funk",
  "Fusion",
  "Trance",
  "Classical",
  "Instrumental",
  "Acid",
  "House",
  "Game",
  "Sound clip",
  "Gospel",
  "Noise",
  "Alternative rock",
  "Bass",
  "Soul",
  "Punk",
  "Space",
  "Meditative",
  "Instrumental pop",
  "Instrumental rock",
  "Ethnic",
  "Gothic",
  "Darkwave",
  "Techno-industrial",
  "Electronic",
  "Pop-folk",
  "Eurodance",
  "Dream",
  "Southern rock",
  "Comedy",
  "Cult",
  "Gangsta",
  "Top 40",
  "Christian rap",
  "Pop/funk",
  "Jungle music",
  "Native US",
  "Cabaret",
  "New wave",
  "Psychedelic",
  "Rave",
  "Showtunes",
  "Trailer",
  "Lo-fi",
  "Tribal",
  "Acid punk",
  "Acid jazz",
  "Polka",
  "Retro",
  "Musical",
  "Rock 'n' roll",
  "Hard rock",
  "Folk",
  "Folk rock",
  "National folk",
  "Swing",
  "Fast fusion",
  "Bebop",
  "Latin",
  "Revival",
  "Celtic",
  "Bluegrass",
  "Avantgarde",
  "Gothic rock",
  "Progressive rock",
  "Psychedelic rock",
  "Symphonic rock",
  "Slow rock",
  "Big band",
  "Chorus",
  "Easy listening",
  "Acoustic",
  "Humour",
  "Speech",
  "Chanson",
  "Opera",
  "Chamber music",
  "Sonata",
  "Symphony",
  "Booty bass",
  "Primus",
  "Porn groove",
  "Satire",
  "Slow jam",
  "Club",
  "Tango",
  "Samba",
  "Folklore",
  "Ballad",
  "Power ballad",
  "Rhythmic Soul",
  "Freestyle",
  "Duet",
  "Punk rock",
  "Drum solo",
  "A cappella",
  "Euro-house",
  "Dance hall",
  "Goa music",
  "Drum & bass",
  "Club-house",
  "Hardcore techno",
  "Terror",
  "Indie",
  "Britpop",
  "Negerpunk",
  "Polsk punk",
  "Beat",
  "Christian gangsta rap",
  "Heavy metal",
  "Black metal",
  "Crossover",
  "Contemporary Christian",
  "Christian rock",
  "Merengue",
  "Salsa",
  "Thrash metal",
  "Anime",
  "Jpop",
  "Synthpop",
  "Christmas",
  "Art rock",
  "Baroque",
  "Bhangra",
  "Big beat",
  "Breakbeat",
  "Chillout",
  "Downtempo",
  "Dub",
  "EBM",
  "Eclectic",
  "Electro",
  "Electroclash",
  "Emo",
  "Experimental",
  "Garage",
  "Global",
  "IDM",
  "Illbient",
  "Industro-Goth",
  "Jam Band",
  "Krautrock",
  "Leftfield",
  "Lounge",
  "Math rock",
  "New romantic",
  "Nu-breakz",
  "Post-punk",
  "Post-rock",
  "Psytrance",
  "Shoegaze",
  "Space rock",
  "Trop rock",
  "World music",
  "Neoclassical",
  "Audiobook",
  "Audio theatre",
  "Neue Deutsche Welle",
  "Podcast",
  "Indie rock",
  "G-Funk",
  "Dubstep",
  "Garage rock",
  "Psybient"
], mf = (r, e) => {
  const t = r.filePos;
  e.raw ??= {}, e.raw.TAG ??= N(r, Cr - 3), r.filePos = t;
  const i = ti(r, 30);
  i && (e.title ??= i);
  const s = ti(r, 30);
  s && (e.artist ??= s);
  const n = ti(r, 30);
  n && (e.album ??= n);
  const a = ti(r, 4), o = Number.parseInt(a, 10);
  Number.isInteger(o) && o > 0 && (e.date ??= new Date(String(o)));
  const c = N(r, 30);
  let l;
  if (c[28] === 0 && c[29] !== 0) {
    const d = c[29];
    d > 0 && (e.trackNumber ??= d), r.skip(-30), l = ti(r, 28), r.skip(2);
  } else
    r.skip(-30), l = ti(r, 30);
  l && (e.comment ??= l);
  const u = U(r);
  u < ui.length && (e.genre ??= ui[u]);
}, ti = (r, e) => {
  const t = N(r, e), i = ii(t.indexOf(0), t.length), s = t.subarray(0, i);
  let n = "";
  for (let a = 0; a < s.length; a++)
    n += String.fromCharCode(s[a]);
  return n.trimEnd();
}, wt = (r) => {
  const e = r.filePos, t = oe(r, 3), i = U(r), s = U(r), n = U(r), a = B(r);
  if (t !== "ID3" || i === 255 || s === 255 || (a & 2155905152) !== 0)
    return r.filePos = e, null;
  let o = Qs(a);
  return n & qt.Footer && (o += Ne), { majorVersion: i, revision: s, flags: n, size: o };
}, as = (r, e, t) => {
  if (![2, 3, 4].includes(e.majorVersion)) {
    D._warn(`Unsupported ID3v2 major version: ${e.majorVersion}`);
    return;
  }
  const i = e.flags & qt.Footer ? e.size - Ne : e.size, s = N(r, i), n = new pf(e, s);
  if (e.flags & qt.Unsynchronisation && e.majorVersion === 3 && n.ununsynchronizeAll(), e.flags & qt.ExtendedHeader) {
    const a = n.readU32();
    e.majorVersion === 3 ? n.pos += a : n.pos += a - 4;
  }
  for (; n.pos <= n.bytes.length - n.frameHeaderSize(); ) {
    const a = n.readId3V2Frame();
    if (!a)
      break;
    const o = n.pos, c = n.pos + a.size;
    let l = !1, u = !1, d = !1;
    if (e.majorVersion === 3 ? (l = !!(a.flags & 64), u = !!(a.flags & 128)) : e.majorVersion === 4 && (l = !!(a.flags & 4), u = !!(a.flags & 8), d = !!(a.flags & 2) || !!(e.flags & qt.Unsynchronisation)), l) {
      D._warn(`Skipping encrypted ID3v2 frame ${a.id}`), n.pos = c;
      continue;
    }
    if (u) {
      D._warn(`Skipping compressed ID3v2 frame ${a.id}`), n.pos = c;
      continue;
    }
    if (d && n.ununsynchronizeRegion(n.pos, c), t.raw ??= {}, a.id === "TXXX") {
      const f = t.raw.TXXX ??= {}, h = n.readId3V2TextEncoding(), g = n.readId3V2Text(h, c), m = n.readId3V2Text(h, c);
      f[g] ??= m;
    } else a.id[0] === "T" ? t.raw[a.id] ??= n.readId3V2EncodingAndText(c) : t.raw[a.id] ??= n.readBytes(a.size);
    switch (n.pos = o, a.id) {
      case "TIT2":
      case "TT2":
        t.title ??= n.readId3V2EncodingAndText(c);
        break;
      case "TIT3":
      case "TT3":
        t.description ??= n.readId3V2EncodingAndText(c);
        break;
      case "TPE1":
      case "TP1":
        t.artist ??= n.readId3V2EncodingAndText(c);
        break;
      case "TALB":
      case "TAL":
        t.album ??= n.readId3V2EncodingAndText(c);
        break;
      case "TPE2":
      case "TP2":
        t.albumArtist ??= n.readId3V2EncodingAndText(c);
        break;
      case "TRCK":
      case "TRK":
        {
          const h = n.readId3V2EncodingAndText(c).split("/"), g = Number.parseInt(h[0], 10), m = h[1] && Number.parseInt(h[1], 10);
          Number.isInteger(g) && g > 0 && (t.trackNumber ??= g), m && Number.isInteger(m) && m > 0 && (t.tracksTotal ??= m);
        }
        break;
      case "TPOS":
      case "TPA":
        {
          const h = n.readId3V2EncodingAndText(c).split("/"), g = Number.parseInt(h[0], 10), m = h[1] && Number.parseInt(h[1], 10);
          Number.isInteger(g) && g > 0 && (t.discNumber ??= g), m && Number.isInteger(m) && m > 0 && (t.discsTotal ??= m);
        }
        break;
      case "TCON":
      case "TCO":
        {
          const f = n.readId3V2EncodingAndText(c);
          let h = /^\((\d+)\)/.exec(f);
          if (h) {
            const g = Number.parseInt(h[1]);
            if (ui[g] !== void 0) {
              t.genre ??= ui[g];
              break;
            }
          }
          if (h = /^\d+$/.exec(f), h) {
            const g = Number.parseInt(h[0]);
            if (ui[g] !== void 0) {
              t.genre ??= ui[g];
              break;
            }
          }
          t.genre ??= f;
        }
        break;
      case "TDRC":
      case "TDAT":
        {
          const f = n.readId3V2EncodingAndText(c), h = new Date(f);
          Number.isNaN(h.getTime()) || (t.date ??= h);
        }
        break;
      case "TYER":
      case "TYE":
        {
          const f = n.readId3V2EncodingAndText(c), h = Number.parseInt(f, 10);
          Number.isInteger(h) && (t.date ??= new Date(String(h)));
        }
        break;
      case "USLT":
      case "ULT":
        {
          const f = n.readU8();
          n.pos += 3, n.readId3V2Text(f, c), t.lyrics ??= n.readId3V2Text(f, c);
        }
        break;
      case "COMM":
      case "COM":
        {
          const f = n.readU8();
          n.pos += 3, n.readId3V2Text(f, c), t.comment ??= n.readId3V2Text(f, c);
        }
        break;
      case "APIC":
      case "PIC":
        {
          const f = n.readId3V2TextEncoding();
          let h;
          if (e.majorVersion === 2) {
            const y = n.readAscii(3);
            h = y === "PNG" ? "image/png" : y === "JPG" ? "image/jpeg" : "image/*";
          } else
            h = n.readId3V2Text(f, c);
          const g = n.readU8(), m = n.readId3V2Text(f, c).trimEnd(), w = c - n.pos;
          if (w >= 0) {
            const y = n.readBytes(w);
            t.images || (t.images = []), t.images.push({
              data: y,
              mimeType: h,
              kind: g === 3 ? "coverFront" : g === 4 ? "coverBack" : "unknown",
              description: m
            });
          }
        }
        break;
      default:
        n.pos += a.size;
        break;
    }
    n.pos = c;
  }
};
class pf {
  constructor(e, t) {
    this.header = e, this.bytes = t, this.pos = 0, this.view = new DataView(t.buffer, t.byteOffset, t.byteLength);
  }
  frameHeaderSize() {
    return this.header.majorVersion === 2 ? 6 : 10;
  }
  ununsynchronizeAll() {
    const e = [];
    for (let t = 0; t < this.bytes.length; t++) {
      const i = this.bytes[t];
      e.push(i), i === 255 && t !== this.bytes.length - 1 && this.bytes[t] === 0 && t++;
    }
    this.bytes = new Uint8Array(e), this.view = new DataView(this.bytes.buffer);
  }
  ununsynchronizeRegion(e, t) {
    const i = [];
    for (let a = e; a < t; a++) {
      const o = this.bytes[a];
      i.push(o), o === 255 && a !== t - 1 && this.bytes[a + 1] === 0 && a++;
    }
    const s = this.bytes.subarray(0, e), n = this.bytes.subarray(t);
    this.bytes = new Uint8Array(s.length + i.length + n.length), this.bytes.set(s, 0), this.bytes.set(i, s.length), this.bytes.set(n, s.length + i.length), this.view = new DataView(this.bytes.buffer);
  }
  readBytes(e) {
    const t = this.bytes.subarray(this.pos, this.pos + e);
    return this.pos += e, t;
  }
  readU8() {
    const e = this.view.getUint8(this.pos);
    return this.pos += 1, e;
  }
  readU16() {
    const e = this.view.getUint16(this.pos, !1);
    return this.pos += 2, e;
  }
  readU24() {
    const e = this.view.getUint16(this.pos, !1), t = this.view.getUint8(this.pos + 2);
    return this.pos += 3, e * 256 + t;
  }
  readU32() {
    const e = this.view.getUint32(this.pos, !1);
    return this.pos += 4, e;
  }
  readAscii(e) {
    let t = "";
    for (let i = 0; i < e; i++)
      t += String.fromCharCode(this.view.getUint8(this.pos + i));
    return this.pos += e, t;
  }
  readId3V2Frame() {
    if (this.header.majorVersion === 2) {
      const e = this.readAscii(3);
      if (e === "\0\0\0")
        return null;
      const t = this.readU24();
      return { id: e, size: t, flags: 0 };
    } else {
      const e = this.readAscii(4);
      if (e === "\0\0\0\0")
        return null;
      const t = this.readU32();
      let i = this.header.majorVersion === 4 ? Qs(t) : t;
      const s = this.readU16(), n = this.pos, a = (o) => {
        const c = this.pos + o;
        if (c > this.bytes.length)
          return !1;
        if (c <= this.bytes.length - this.frameHeaderSize()) {
          this.pos += o;
          const l = this.readAscii(4);
          if (l !== "\0\0\0\0" && !/[0-9A-Z]{4}/.test(l))
            return !1;
        }
        return !0;
      };
      if (!a(i)) {
        const o = this.header.majorVersion === 4 ? t : Qs(t);
        a(o) && (i = o);
      }
      return this.pos = n, { id: e, size: i, flags: s };
    }
  }
  readId3V2TextEncoding() {
    const e = this.readU8();
    if (e > 3)
      throw new Error(`Unsupported text encoding: ${e}`);
    return e;
  }
  readId3V2Text(e, t) {
    const i = this.pos, s = this.readBytes(t - this.pos);
    switch (e) {
      case ye.ISO_8859_1: {
        let n = "";
        for (let a = 0; a < s.length; a++) {
          const o = s[a];
          if (o === 0) {
            this.pos = i + a + 1;
            break;
          }
          n += String.fromCharCode(o);
        }
        return n;
      }
      case ye.UTF_16_WITH_BOM:
        if (s[0] === 255 && s[1] === 254) {
          const n = new TextDecoder("utf-16le"), a = ii(s.findIndex((o, c) => o === 0 && s[c + 1] === 0 && c % 2 === 0), s.length);
          return this.pos = i + Math.min(a + 2, s.length), n.decode(s.subarray(2, a));
        } else if (s[0] === 254 && s[1] === 255) {
          const n = new TextDecoder("utf-16be"), a = ii(s.findIndex((o, c) => o === 0 && s[c + 1] === 0 && c % 2 === 0), s.length);
          return this.pos = i + Math.min(a + 2, s.length), n.decode(s.subarray(2, a));
        } else {
          const n = ii(s.findIndex((a) => a === 0), s.length);
          return this.pos = i + Math.min(n + 1, s.length), ve.decode(s.subarray(0, n));
        }
      case ye.UTF_16_BE_NO_BOM: {
        const n = new TextDecoder("utf-16be"), a = ii(s.findIndex((o, c) => o === 0 && s[c + 1] === 0 && c % 2 === 0), s.length);
        return this.pos = i + Math.min(a + 2, s.length), n.decode(s.subarray(0, a));
      }
      case ye.UTF_8: {
        const n = ii(s.findIndex((a) => a === 0), s.length);
        return this.pos = i + Math.min(n + 1, s.length), ve.decode(s.subarray(0, n));
      }
    }
  }
  readId3V2EncodingAndText(e) {
    if (this.pos >= e)
      return "";
    const t = this.readId3V2TextEncoding();
    return this.readId3V2Text(t, e);
  }
}
class Kn {
  constructor(e) {
    this.helper = new Uint8Array(8), this.helperView = q(this.helper), this.writer = e;
  }
  writeId3V2Tag(e) {
    const t = this.writer.getPos();
    this.writeAscii("ID3"), this.writeU8(4), this.writeU8(0), this.writeU8(0), this.writeSynchsafeU32(0);
    const i = this.writer.getPos(), s = /* @__PURE__ */ new Set();
    for (const { key: o, value: c } of Ti(e))
      switch (o) {
        case "title":
          this.writeId3V2TextFrame("TIT2", c), s.add("TIT2");
          break;
        case "description":
          this.writeId3V2TextFrame("TIT3", c), s.add("TIT3");
          break;
        case "artist":
          this.writeId3V2TextFrame("TPE1", c), s.add("TPE1");
          break;
        case "album":
          this.writeId3V2TextFrame("TALB", c), s.add("TALB");
          break;
        case "albumArtist":
          this.writeId3V2TextFrame("TPE2", c), s.add("TPE2");
          break;
        case "trackNumber":
          {
            const l = e.tracksTotal !== void 0 ? `${c}/${e.tracksTotal}` : c.toString();
            this.writeId3V2TextFrame("TRCK", l), s.add("TRCK");
          }
          break;
        case "discNumber":
          {
            const l = e.discsTotal !== void 0 ? `${c}/${e.discsTotal}` : c.toString();
            this.writeId3V2TextFrame("TPOS", l), s.add("TPOS");
          }
          break;
        case "genre":
          this.writeId3V2TextFrame("TCON", c), s.add("TCON");
          break;
        case "date":
          this.writeId3V2TextFrame("TDRC", c.toISOString().slice(0, 10)), s.add("TDRC");
          break;
        case "lyrics":
          this.writeId3V2LyricsFrame(c), s.add("USLT");
          break;
        case "comment":
          this.writeId3V2CommentFrame(c), s.add("COMM");
          break;
        case "images":
          {
            const l = { coverFront: 3, coverBack: 4, unknown: 0 };
            for (const u of c) {
              const d = l[u.kind] ?? 0, f = u.description ?? "";
              this.writeId3V2ApicFrame(u.mimeType, d, f, u.data);
            }
          }
          break;
        case "tracksTotal":
        case "discsTotal":
          break;
        case "raw":
          break;
        default:
          pe(o);
      }
    if (e.raw)
      for (const o in e.raw) {
        const c = e.raw[o];
        if (c == null || o.length !== 4 || s.has(o))
          continue;
        let l;
        if (typeof c == "string")
          if (st(c)) {
            l = new Uint8Array(c.length + 2), l[0] = ye.ISO_8859_1;
            for (let d = 0; d < c.length; d++)
              l[d + 1] = c.charCodeAt(d);
          } else {
            const d = Y.encode(c);
            l = new Uint8Array(d.byteLength + 2), l[0] = ye.UTF_8, l.set(d, 1);
          }
        else if (c instanceof Uint8Array)
          l = c;
        else if (o === "TXXX" && Io(c)) {
          for (const u in c) {
            const d = c[u], f = st(u) && st(d), h = f ? null : Y.encode(u), g = f ? null : Y.encode(d), m = f ? u.length : h.byteLength, w = f ? d.length : g.byteLength, y = 1 + m + 1 + w + 1;
            this.writeAscii("TXXX"), this.writeSynchsafeU32(y), this.writeU16(0), this.writeU8(f ? ye.ISO_8859_1 : ye.UTF_8), f ? (this.writeIsoString(u), this.writeIsoString(d)) : (this.writer.write(h), this.writeU8(0), this.writer.write(g), this.writeU8(0));
          }
          continue;
        } else
          continue;
        this.writeAscii(o), this.writeSynchsafeU32(l.byteLength), this.writeU16(0), this.writer.write(l);
      }
    const n = this.writer.getPos(), a = n - i;
    return this.writer.seek(t + 6), this.writeSynchsafeU32(a), this.writer.seek(n), a + 10;
  }
  writeU8(e) {
    this.helper[0] = e, this.writer.write(this.helper.subarray(0, 1));
  }
  writeU16(e) {
    this.helperView.setUint16(0, e, !1), this.writer.write(this.helper.subarray(0, 2));
  }
  writeU32(e) {
    this.helperView.setUint32(0, e, !1), this.writer.write(this.helper.subarray(0, 4));
  }
  writeAscii(e) {
    for (let t = 0; t < e.length; t++)
      this.helper[t] = e.charCodeAt(t);
    this.writer.write(this.helper.subarray(0, e.length));
  }
  writeSynchsafeU32(e) {
    this.writeU32(ru(e));
  }
  writeIsoString(e) {
    const t = new Uint8Array(e.length + 1);
    for (let i = 0; i < e.length; i++)
      t[i] = e.charCodeAt(i);
    this.writer.write(t);
  }
  writeUtf8String(e) {
    const t = Y.encode(e);
    this.writer.write(t), this.writeU8(0);
  }
  writeId3V2TextFrame(e, t) {
    const i = st(t), n = 1 + (i ? t.length : Y.encode(t).byteLength) + 1;
    this.writeAscii(e), this.writeSynchsafeU32(n), this.writeU16(0), this.writeU8(i ? ye.ISO_8859_1 : ye.UTF_8), i ? this.writeIsoString(t) : this.writeUtf8String(t);
  }
  writeId3V2LyricsFrame(e) {
    const t = st(e), i = "", s = 4 + i.length + 1 + e.length + 1;
    this.writeAscii("USLT"), this.writeSynchsafeU32(s), this.writeU16(0), this.writeU8(t ? ye.ISO_8859_1 : ye.UTF_8), this.writeAscii("und"), t ? (this.writeIsoString(i), this.writeIsoString(e)) : (this.writeUtf8String(i), this.writeUtf8String(e));
  }
  writeId3V2CommentFrame(e) {
    const t = st(e), i = t ? e.length : Y.encode(e).byteLength, s = "", n = 4 + s.length + 1 + i + 1;
    this.writeAscii("COMM"), this.writeSynchsafeU32(n), this.writeU16(0), this.writeU8(t ? ye.ISO_8859_1 : ye.UTF_8), this.writeU8(117), this.writeU8(110), this.writeU8(100), t ? (this.writeIsoString(s), this.writeIsoString(e)) : (this.writeUtf8String(s), this.writeUtf8String(e));
  }
  writeId3V2ApicFrame(e, t, i, s) {
    const n = st(e) && st(i), a = n ? i.length : Y.encode(i).byteLength, o = 1 + e.length + 1 + 1 + a + 1 + s.byteLength;
    this.writeAscii("APIC"), this.writeSynchsafeU32(o), this.writeU16(0), this.writeU8(n ? ye.ISO_8859_1 : ye.UTF_8), n ? this.writeIsoString(e) : this.writeUtf8String(e), this.writeU8(t), n ? this.writeIsoString(i) : this.writeUtf8String(i), this.writer.write(s);
  }
}
class kt {
  constructor(e) {
    this.mutex = new Yt(), this.trackTimestampInfo = /* @__PURE__ */ new WeakMap(), this.output = e;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTrackClose(e) {
  }
  validateTimestamp(e, t, i) {
    if (t < 0)
      throw new Error(`Timestamps must be non-negative (got ${t}s).`);
    let s = this.trackTimestampInfo.get(e);
    if (s) {
      if (i && (s.maxTimestampBeforeLastKeyPacket = s.maxTimestamp), s.maxTimestampBeforeLastKeyPacket !== null && t < s.maxTimestampBeforeLastKeyPacket)
        throw new Error(`Timestamps cannot be smaller than the largest timestamp of the previous GOP (a GOP begins with a key packet and ends right before the next key packet). Got ${t}s, but largest timestamp is ${s.maxTimestampBeforeLastKeyPacket}s.`);
      s.maxTimestamp = Math.max(s.maxTimestamp, t);
    } else {
      if (!i)
        throw new Error("First packet must be a key packet.");
      s = {
        maxTimestamp: t,
        maxTimestampBeforeLastKeyPacket: null
      }, this.trackTimestampInfo.set(e, s);
    }
  }
}
class gf extends kt {
  constructor(e, t) {
    super(e), this.header = null, this.headerBitstream = null, this.inputIsAdts = null, this.format = t;
  }
  async start() {
    const e = await this.mutex.acquire();
    this.writer = await this.output._getRootWriter(!0), Gi(this.output._metadataTags) || new Kn(this.writer).writeId3V2Tag(this.output._metadataTags), e();
  }
  async getMimeType() {
    return "audio/aac";
  }
  async addEncodedVideoPacket() {
    throw new Error("ADTS does not support video.");
  }
  async addEncodedAudioPacket(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      if (this.validateTimestamp(e, t.timestamp, t.type === "key"), this.inputIsAdts === null) {
        $e(i, e.source._codec);
        const n = i?.decoderConfig?.description;
        if (this.inputIsAdts = !n, !this.inputIsAdts) {
          const a = cr(te(n)), o = Eo(a);
          this.header = o.header, this.headerBitstream = o.bitstream;
        }
      }
      if (this.inputIsAdts) {
        const n = this.writer.getPos();
        this.writer.write(t.data), this.format._options.onFrame && this.format._options.onFrame(t.data, n);
      } else {
        p(this.header);
        const n = t.data.byteLength + this.header.byteLength;
        vo(this.headerBitstream, n);
        const a = this.writer.getPos();
        if (this.writer.write(this.header), this.writer.write(t.data), this.format._options.onFrame) {
          const o = new Uint8Array(n);
          o.set(this.header, 0), o.set(t.data, this.header.byteLength), this.format._options.onFrame(o, a);
        }
      }
      await this.writer.flush();
    } finally {
      s();
    }
  }
  async addSubtitleCue() {
    throw new Error("ADTS does not support subtitles.");
  }
  async finalize() {
    const e = await this.mutex.acquire();
    if (this.inputIsAdts === null)
      throw new Error("Cannot finalize an empty ADTS file: not a single packet was added.");
    e();
  }
}
const eo = /* @__PURE__ */ new Uint8Array([102, 76, 97, 67]), wf = 38, yf = 34;
class bf extends kt {
  constructor(e, t) {
    super(e), this.metadataWritten = !1, this.blockSizes = [], this.frameSizes = [], this.sampleRate = null, this.channels = null, this.bitsPerSample = null, this.format = t;
  }
  async start() {
    const e = await this.mutex.acquire();
    this.writer = await this.output._getRootWriter(!!this.format._options.appendOnly), this.writer.write(eo);
    const t = this.output.tracks[0];
    p(t?.isAudioTrack()), t.metadata.decoderConfig && ($e({ decoderConfig: t.metadata.decoderConfig }, t.source._codec), this.applyDecoderConfig(t.metadata.decoderConfig)), e();
  }
  applyDecoderConfig(e) {
    p(e.description), this.sampleRate = e.sampleRate, this.channels = e.numberOfChannels;
    const t = new j(te(e.description));
    t.skipBits(167), this.bitsPerSample = t.readBits(5) + 1, this.format._options.appendOnly && this.writeHeader({
      // https://www.rfc-editor.org/rfc/rfc9639.html#name-streaminfo
      // Per RFC 9639, min/max block sizes can be looser than
      // actual values, so we use the full valid range (16–65535).
      // "The actual max block size MAY be smaller than what's
      // listed, and the actual min (excluding last block) MAY be
      // larger. This is because the encoder has to write these
      // fields before receiving any input audio data and cannot
      // know beforehand what block sizes it will use."
      minimumBlockSize: 16,
      maximumBlockSize: 65535,
      // https://www.rfc-editor.org/rfc/rfc9639.html#name-streaminfo
      // "A value of 0 signifies that the value is not known."
      minimumFrameSize: 0,
      maximumFrameSize: 0,
      sampleRate: this.sampleRate,
      channels: this.channels,
      bitsPerSample: this.bitsPerSample,
      totalSamples: 0
    });
  }
  writeHeader({ bitsPerSample: e, minimumBlockSize: t, maximumBlockSize: i, minimumFrameSize: s, maximumFrameSize: n, sampleRate: a, channels: o, totalSamples: c }) {
    p(this.writer.getPos() === 4);
    const l = !Gi(this.output._metadataTags), u = new j(new Uint8Array(4));
    u.writeBits(1, +!l), u.writeBits(7, mt.STREAMINFO), u.writeBits(24, yf), this.writer.write(u.bytes);
    const d = new j(new Uint8Array(18));
    if (d.writeBits(16, t), d.writeBits(16, i), d.writeBits(24, s), d.writeBits(24, n), d.writeBits(20, a), d.writeBits(3, o - 1), d.writeBits(5, e - 1), c >= 2 ** 32)
      throw new Error("This muxer only supports writing up to 2 ** 32 samples");
    d.writeBits(4, 0), d.writeBits(32, c), this.writer.write(d.bytes), this.writer.write(new Uint8Array(16));
  }
  writePictureBlock(e) {
    const t = 32 + e.mimeType.length + (e.description?.length ?? 0) + e.data.length, i = new Uint8Array(t);
    let s = 0;
    const n = q(i);
    n.setUint32(s, e.kind === "coverFront" ? 3 : e.kind === "coverBack" ? 4 : 0), s += 4, n.setUint32(s, e.mimeType.length), s += 4, i.set(Y.encode(e.mimeType), 8), s += e.mimeType.length, n.setUint32(s, e.description?.length ?? 0), s += 4, i.set(Y.encode(e.description ?? ""), s), s += e.description?.length ?? 0, s += 16, n.setUint32(s, e.data.length), s += 4, i.set(e.data, s), s += e.data.length, p(s === t);
    const a = new j(new Uint8Array(4));
    a.writeBits(1, 0), a.writeBits(7, mt.PICTURE), a.writeBits(24, t), this.writer.write(a.bytes), this.writer.write(i);
  }
  writeVorbisCommentAndPictureBlock() {
    if (this.format._options.appendOnly || this.writer.seek(wf + eo.byteLength), Gi(this.output._metadataTags)) {
      this.metadataWritten = !0;
      return;
    }
    const e = this.output._metadataTags.images ?? [];
    for (const s of e)
      this.writePictureBlock(s);
    const t = Gs(new Uint8Array(0), this.output._metadataTags, !1), i = new j(new Uint8Array(4));
    i.writeBits(1, 1), i.writeBits(7, mt.VORBIS_COMMENT), i.writeBits(24, t.length), this.writer.write(i.bytes), this.writer.write(t), this.metadataWritten = !0;
  }
  async getMimeType() {
    return "audio/flac";
  }
  async addEncodedVideoPacket() {
    throw new Error("FLAC does not support video.");
  }
  async addEncodedAudioPacket(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      this.validateTimestamp(e, t.timestamp, t.type === "key"), this.sampleRate === null && ($e(i, e.source._codec), p(i), p(i.decoderConfig), this.applyDecoderConfig(i.decoderConfig)), this.metadataWritten || this.writeVorbisCommentAndPictureBlock();
      const n = Ce.tempFromBytes(t.data);
      n.skip(2);
      const a = N(n, 2), o = new j(a), c = yc(o.readBits(4));
      if (c === null)
        throw new Error("Invalid FLAC frame: Invalid block size.");
      bc(n);
      const l = kc(n, c);
      this.format._options.appendOnly || (this.blockSizes.push(l), this.frameSizes.push(t.data.length));
      const u = this.writer.getPos();
      this.writer.write(t.data), this.format._options.onFrame && this.format._options.onFrame(t.data, u), await this.writer.flush();
    } finally {
      s();
    }
  }
  addSubtitleCue() {
    throw new Error("FLAC does not support subtitles.");
  }
  async finalize() {
    const e = await this.mutex.acquire();
    if (this.sampleRate === null)
      throw new Error("Cannot finalize an empty FLAC file: no packets were added and the track specified no decoderConfig in its metadata, so there's no telling what the file should look like.");
    if (this.metadataWritten || this.writeVorbisCommentAndPictureBlock(), !this.format._options.appendOnly) {
      let t = 1 / 0, i = 0, s = 1 / 0, n = 0, a = 0;
      for (let o = 0; o < this.blockSizes.length; o++)
        s = Math.min(s, this.frameSizes[o]), n = Math.max(n, this.frameSizes[o]), i = Math.max(i, this.blockSizes[o]), a += this.blockSizes[o], o !== this.blockSizes.length - 1 && (t = Math.min(t, this.blockSizes[o]));
      this.blockSizes.length === 0 && (t = 16, i = 65535, s = 0, n = 0), p(this.channels !== null), p(this.bitsPerSample !== null), this.writer.seek(4), this.writeHeader({
        minimumBlockSize: t,
        maximumBlockSize: i,
        minimumFrameSize: s,
        maximumFrameSize: n,
        sampleRate: this.sampleRate,
        channels: this.channels,
        bitsPerSample: this.bitsPerSample,
        totalSamples: a
      });
    }
    e();
  }
}
const zi = /(?:(.+?)\n)?((?:\d{2}:)?\d{2}:\d{2}.\d{3})\s+-->\s+((?:\d{2}:)?\d{2}:\d{2}.\d{3})/g, kf = /^WEBVTT(.|\n)*?\n{2}/, qr = /<(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})>/g;
class Tf {
  constructor(e) {
    this.preambleText = null, this.preambleEmitted = !1, this.options = e;
  }
  parse(e) {
    e = e.replaceAll(`\r
`, `
`).replaceAll("\r", `
`), zi.lastIndex = 0;
    let t;
    if (!this.preambleText) {
      if (!kf.test(e))
        throw new Error("WebVTT preamble incorrect.");
      t = zi.exec(e);
      const i = e.slice(0, t?.index ?? e.length).trimEnd();
      if (!i)
        throw new Error("No WebVTT preamble provided.");
      this.preambleText = i, t && (e = e.slice(t.index), zi.lastIndex = 0);
    }
    for (; t = zi.exec(e); ) {
      const i = e.slice(0, t.index), s = t[1], n = t.index + t[0].length, a = e.indexOf(`
`, n) + 1, o = e.slice(n, a).trim();
      let c = e.indexOf(`

`, n);
      c === -1 && (c = e.length);
      const l = pn(t[2]), d = pn(t[3]) - l, f = e.slice(a, c).trim();
      e = e.slice(c).trimStart(), zi.lastIndex = 0;
      const h = {
        timestamp: l / 1e3,
        duration: d / 1e3,
        text: f,
        identifier: s,
        settings: o,
        notes: i
      }, g = {};
      this.preambleEmitted || (g.config = {
        description: this.preambleText
      }, this.preambleEmitted = !0), this.options.output(h, g);
    }
  }
}
const Sf = /(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})/, pn = (r) => {
  const e = Sf.exec(r);
  if (!e)
    throw new Error("Expected match.");
  return 3600 * 1e3 * Number(e[1] || "0") + 60 * 1e3 * Number(e[2]) + 1e3 * Number(e[3]) + Number(e[4]);
}, rl = (r) => {
  const e = Math.floor(r / 36e5), t = Math.floor(r % (3600 * 1e3) / (60 * 1e3)), i = Math.floor(r % (60 * 1e3) / 1e3), s = r % 1e3;
  return e.toString().padStart(2, "0") + ":" + t.toString().padStart(2, "0") + ":" + i.toString().padStart(2, "0") + "." + s.toString().padStart(3, "0");
};
class yr {
  constructor(e) {
    this.writer = e, this.helper = new Uint8Array(8), this.helperView = new DataView(this.helper.buffer), this.offsets = /* @__PURE__ */ new WeakMap();
  }
  writeU32(e) {
    this.helperView.setUint32(0, e, !1), this.writer.write(this.helper.subarray(0, 4));
  }
  writeU64(e) {
    this.helperView.setUint32(0, Math.floor(e / 2 ** 32), !1), this.helperView.setUint32(4, e, !1), this.writer.write(this.helper.subarray(0, 8));
  }
  writeAscii(e) {
    for (let t = 0; t < e.length; t++)
      this.helperView.setUint8(t % 8, e.charCodeAt(t)), t % 8 === 7 && this.writer.write(this.helper);
    e.length % 8 !== 0 && this.writer.write(this.helper.subarray(0, e.length % 8));
  }
  writeBox(e) {
    if (this.offsets.set(e, this.writer.getPos()), e.contents && !e.children)
      this.writeBoxHeader(e, e.size ?? e.contents.byteLength + 8), this.writer.write(e.contents);
    else {
      const t = this.writer.getPos();
      if (this.writeBoxHeader(e, 0), e.contents && this.writer.write(e.contents), e.children)
        for (const n of e.children)
          n && this.writeBox(n);
      const i = this.writer.getPos(), s = e.size ?? i - t;
      this.writer.seek(t), this.writeBoxHeader(e, s), this.writer.seek(i);
    }
  }
  writeBoxHeader(e, t) {
    this.writeU32(e.largeSize ? 1 : t), this.writeAscii(e.type), e.largeSize && this.writeU64(t);
  }
  measureBoxHeader(e) {
    return 8 + (e.largeSize ? 8 : 0);
  }
  patchBox(e) {
    const t = this.offsets.get(e);
    p(t !== void 0);
    const i = this.writer.getPos();
    this.writer.seek(t), this.writeBox(e), this.writer.seek(i);
  }
  measureBox(e) {
    if (e.contents && !e.children)
      return this.measureBoxHeader(e) + e.contents.byteLength;
    {
      let t = this.measureBoxHeader(e);
      if (e.contents && (t += e.contents.byteLength), e.children)
        for (const i of e.children)
          i && (t += this.measureBox(i));
      return t;
    }
  }
}
const H = /* @__PURE__ */ new Uint8Array(8), Ve = /* @__PURE__ */ new DataView(H.buffer), ae = (r) => [(r % 256 + 256) % 256], L = (r) => (Ve.setUint16(0, r, !1), [H[0], H[1]]), Qn = (r) => (Ve.setInt16(0, r, !1), [H[0], H[1]]), sl = (r) => (Ve.setUint32(0, r, !1), [H[1], H[2], H[3]]), F = (r) => (Ve.setUint32(0, r, !1), [H[0], H[1], H[2], H[3]]), ft = (r) => (Ve.setInt32(0, r, !1), [H[0], H[1], H[2], H[3]]), it = (r) => (Ve.setUint32(0, Math.floor(r / 2 ** 32), !1), Ve.setUint32(4, r, !1), [H[0], H[1], H[2], H[3], H[4], H[5], H[6], H[7]]), Af = (r) => (Ve.setInt32(0, Math.floor(r / 2 ** 32), !1), Ve.setUint32(4, r, !1), [H[0], H[1], H[2], H[3], H[4], H[5], H[6], H[7]]), nl = (r) => (Ve.setInt16(0, 2 ** 8 * r, !1), [H[0], H[1]]), Le = (r) => (Ve.setInt32(0, 2 ** 16 * r, !1), [H[0], H[1], H[2], H[3]]), Is = (r) => (Ve.setInt32(0, 2 ** 30 * r, !1), [H[0], H[1], H[2], H[3]]), Es = (r, e) => {
  const t = [];
  let i = r;
  do {
    let s = i & 127;
    i >>= 7, t.length > 0 && (s |= 128), t.push(s);
  } while (i > 0 || e);
  return t.reverse();
}, X = (r, e = !1) => {
  const t = Array(r.length).fill(null).map((i, s) => r.charCodeAt(s));
  return e && t.push(0), t;
}, al = (r) => {
  const e = r * (Math.PI / 180), t = Math.round(Math.cos(e)), i = Math.round(Math.sin(e));
  return [
    t,
    i,
    0,
    -i,
    t,
    0,
    0,
    0,
    1
  ];
}, ol = /* @__PURE__ */ al(0), cl = (r) => [
  Le(r[0]),
  Le(r[1]),
  Is(r[2]),
  Le(r[3]),
  Le(r[4]),
  Is(r[5]),
  Le(r[6]),
  Le(r[7]),
  Is(r[8])
], V = (r, e, t) => ({
  type: r,
  contents: e && new Uint8Array(e.flat(10)),
  children: t
}), G = (r, e, t, i, s) => V(r, [ae(e), sl(t), i ?? []], s), xf = (r) => r.isQuickTime ? V("ftyp", [
  X("qt  "),
  // Major brand
  F(512),
  // Minor version
  // Compatible brands
  X("qt  ")
]) : r.fragmented ? r.cmaf ? V("ftyp", [
  X("iso5"),
  // Major brand
  F(512),
  // Minor version
  // Compatible brands
  X("iso5"),
  X("iso6"),
  X("mp41"),
  X("cmfc"),
  X("dash")
]) : V("ftyp", [
  X("iso5"),
  // Major brand
  F(512),
  // Minor version
  // Compatible brands
  X("iso5"),
  X("iso6"),
  X("mp41")
]) : V("ftyp", [
  X("isom"),
  // Major brand
  F(512),
  // Minor version
  // Compatible brands
  X("isom"),
  r.holdsAvc ? X("avc1") : [],
  X("mp41")
]), to = () => V("styp", [
  X("iso5"),
  // Major brand
  F(0),
  // Minor version
  // Compatible brands
  X("iso5"),
  X("iso6"),
  X("mp41"),
  X("cmfc"),
  X("dash")
]), io = (r, e) => {
  let t = r.maxWrittenEndTimestamp - r.minWrittenTimestamp;
  return Number.isFinite(t) || (t = 0), G("sidx", 1, 0, [
    F(1),
    // Reference ID
    F(Ke),
    // Timescale
    it(re(r.minWrittenTimestamp, Ke)),
    // Earliest presentation time
    it(0),
    // First offset
    L(0),
    // Reserved
    L(1),
    // Reference count
    F(e & 2147483647),
    // Reference type (0) + referenced size
    F(re(t, Ke)),
    // Subsegment duration
    F(0)
    // Starts with SAP + SAP type + SAP delta time (no information provided)
  ]);
}, br = (r) => ({ type: "mdat", largeSize: r }), Pf = (r) => ({ type: "free", size: r }), Di = (r) => V("moov", void 0, [
  Cf(r.creationTime, r.trackDatas),
  ...r.trackDatas.map((e) => _f(e, r.creationTime)),
  r.isFragmented ? fh(r.trackDatas) : null,
  Ph(r)
]), Cf = (r, e) => {
  const t = Math.max(0, ...e.map((a) => re(os(a), Ke) + re(a.startTimestampOffset ?? 0, Ke))), i = Math.max(0, ...e.map((a) => a.track.id)) + 1, s = !vt(r) || !vt(t), n = s ? it : F;
  return G("mvhd", +s, 0, [
    n(r),
    // Creation time
    n(r),
    // Modification time
    F(Ke),
    // Timescale
    n(t),
    // Duration
    Le(1),
    // Preferred rate
    nl(1),
    // Preferred volume
    Array(10).fill(0),
    // Reserved
    cl(ol),
    // Matrix
    Array(24).fill(0),
    // Pre-defined
    F(i)
    // Next track ID
  ]);
}, os = (r) => {
  if (r.samples.length === 0)
    return 0;
  let e = 1 / 0, t = -1 / 0;
  for (let i = 0; i < r.samples.length; i++) {
    const s = r.samples[i];
    s.timestamp < e && (e = s.timestamp), s.timestamp + s.duration > t && (t = s.timestamp + s.duration);
  }
  return e === 1 / 0 ? 0 : t - e;
}, _f = (r, e) => {
  const t = Uh(r), i = r.startTimestampOffset !== null && r.startTimestampOffset > 0;
  return V("trak", void 0, [
    If(r, e),
    i ? Ef(r, r.startTimestampOffset) : null,
    vf(r, e),
    t.name !== void 0 ? V("udta", void 0, [
      V("name", [
        ...Y.encode(t.name)
      ])
    ]) : null
  ]);
}, If = (r, e) => {
  const t = re(os(r), Ke) + re(r.startTimestampOffset ?? 0, Ke), i = !vt(e) || !vt(t), s = i ? it : F;
  let n;
  if (r.type === "video") {
    const c = r.track.metadata.rotation;
    n = al(c ?? 0);
  } else
    n = ol;
  let a = 2;
  r.track.metadata.disposition?.default !== !1 && (a |= 1);
  const o = r.type === "video" ? 0 : r.type === "audio" ? 1 : r.type === "subtitle" ? 2 : pe(r);
  return G("tkhd", +i, a, [
    s(e),
    // Creation time
    s(e),
    // Modification time
    F(r.track.id),
    // Track ID
    F(0),
    // Reserved
    s(t),
    // Duration
    Array(8).fill(0),
    // Reserved
    L(0),
    // Layer
    L(o),
    // Alternate group
    nl(r.type === "audio" ? 1 : 0),
    // Volume
    L(0),
    // Reserved
    cl(n),
    // Matrix
    Le(r.type === "video" ? r.info.width : 0),
    // Track width
    Le(r.type === "video" ? r.info.height : 0)
    // Track height
  ]);
}, Ef = (r, e) => {
  const t = re(e, Ke), i = re(os(r), Ke), s = !vt(t) || !vt(i), n = s ? it : F, a = s ? Af : ft;
  return V("edts", void 0, [
    G("elst", s ? 1 : 0, 0, [
      F(2),
      // Entry count
      // #1
      n(t),
      // Segment duration
      a(-1),
      // Media time
      Le(1),
      // Media rate
      // #2
      n(i),
      // Segment duration
      a(0),
      // Media time
      Le(1)
      // Media rate
    ])
  ]);
}, vf = (r, e) => V("mdia", void 0, [
  Ff(r, e),
  $n(!0, Bf[r.type], Rf[r.type]),
  Mf(r)
]), Ff = (r, e) => {
  const t = re(os(r), r.timescale), i = !vt(e) || !vt(t), s = i ? it : F;
  return G("mdhd", +i, 0, [
    s(e),
    // Creation time
    s(e),
    // Modification time
    F(r.timescale),
    // Timescale
    s(t),
    // Duration
    L(fl(r.track.metadata.languageCode ?? ke)),
    // Language
    L(0)
    // Quality
  ]);
}, Bf = {
  video: "vide",
  audio: "soun",
  subtitle: "text"
}, Rf = {
  video: "MediabunnyVideoHandler",
  audio: "MediabunnySoundHandler",
  subtitle: "MediabunnyTextHandler"
}, $n = (r, e, t, i = "\0\0\0\0") => G("hdlr", 0, 0, [
  r ? X("mhlr") : F(0),
  // Component type
  X(e),
  // Component subtype
  X(i),
  // Component manufacturer
  F(0),
  // Component flags
  F(0),
  // Component flags mask
  X(t, !0)
  // Component name
]), Mf = (r) => V("minf", void 0, [
  Uf[r.type](),
  Nf(),
  Lf(r)
]), zf = () => G("vmhd", 0, 1, [
  L(0),
  // Graphics mode
  L(0),
  // Opcolor R
  L(0),
  // Opcolor G
  L(0)
  // Opcolor B
]), Df = () => G("smhd", 0, 0, [
  L(0),
  // Balance
  L(0)
  // Reserved
]), Of = () => G("nmhd", 0, 0), Uf = {
  video: zf,
  audio: Df,
  subtitle: Of
}, Nf = () => V("dinf", void 0, [
  Vf()
]), Vf = () => G("dref", 0, 0, [
  F(1)
  // Entry count
], [
  Wf()
]), Wf = () => G("url ", 0, 1), Lf = (r) => {
  const e = r.compositionTimeOffsetTable.length > 1 || r.compositionTimeOffsetTable.some((t) => t.sampleCompositionTimeOffset !== 0);
  return V("stbl", void 0, [
    qf(r),
    nh(r),
    e ? uh(r) : null,
    e ? dh(r) : null,
    oh(r),
    ch(r),
    lh(r),
    ah(r)
  ]);
}, qf = (r) => {
  let e;
  if (r.type === "video")
    e = Hf(Eh(r.track.source._codec, r.info.decoderConfig.codec), r);
  else if (r.type === "audio") {
    const t = dl(r.track.source._codec, r.muxer.isQuickTime);
    p(t), e = Xf(t, r);
  } else r.type === "subtitle" && (e = rh(Bh[r.track.source._codec], r));
  return p(e), G("stsd", 0, 0, [
    F(1)
    // Entry count
  ], [
    e
  ]);
}, Hf = (r, e) => V(r, [
  Array(6).fill(0),
  // Reserved
  L(1),
  // Data reference index
  L(0),
  // Pre-defined
  L(0),
  // Reserved
  Array(12).fill(0),
  // Pre-defined
  L(e.info.width),
  // Width
  L(e.info.height),
  // Height
  F(4718592),
  // Horizontal resolution
  F(4718592),
  // Vertical resolution
  F(0),
  // Reserved
  L(1),
  // Frame count
  // Compressor name
  ae(10),
  // Weird Pascal-style string
  X("Mediabunny"),
  Array(21).fill(0),
  L(e.info.hasAlphaChannel ? 32 : 24),
  // Depth
  Qn(65535)
  // Pre-defined
], [
  vh[e.track.source._codec]?.(e) ?? null,
  jf(e),
  Ao(e.info.decoderConfig.colorSpace) ? Kf(e) : null
]), jf = (r) => r.info.pixelAspectRatio.num === r.info.pixelAspectRatio.den ? null : V("pasp", [
  F(r.info.pixelAspectRatio.num),
  F(r.info.pixelAspectRatio.den)
]), Kf = (r) => V("colr", [
  X(r.muxer.isQuickTime ? "nclc" : "nclx"),
  // Colour type
  L($t[r.info.decoderConfig.colorSpace.primaries]),
  // Colour primaries
  L(Gt[r.info.decoderConfig.colorSpace.transfer]),
  // Transfer characteristics
  L(Xt[r.info.decoderConfig.colorSpace.matrix]),
  // Matrix coefficients
  r.muxer.isQuickTime ? [] : ae((r.info.decoderConfig.colorSpace.fullRange ? 1 : 0) << 7)
  // Full range flag
]), Qf = (r) => r.info.decoderConfig && V("avcC", [
  // For AVC, description is an AVCDecoderConfigurationRecord, so nothing else to do here
  ...te(r.info.decoderConfig.description)
]), $f = (r) => r.info.decoderConfig && V("hvcC", [
  // For HEVC, description is an HEVCDecoderConfigurationRecord, so nothing else to do here
  ...te(r.info.decoderConfig.description)
]), ro = (r) => {
  if (!r.info.decoderConfig)
    return null;
  const e = r.info.decoderConfig, t = e.codec.split("."), i = Number(t[1]), s = Number(t[2]), n = Number(t[3]), a = t[4] ? Number(t[4]) : 1, o = t[8] ? Number(t[8]) : Number(e.colorSpace?.fullRange ?? 0), c = (n << 4) + (a << 1) + o, l = t[5] ? Number(t[5]) : e.colorSpace?.primaries ? $t[e.colorSpace.primaries] : 2, u = t[6] ? Number(t[6]) : e.colorSpace?.transfer ? Gt[e.colorSpace.transfer] : 2, d = t[7] ? Number(t[7]) : e.colorSpace?.matrix ? Xt[e.colorSpace.matrix] : 2;
  return G("vpcC", 1, 0, [
    ae(i),
    // Profile
    ae(s),
    // Level
    ae(c),
    // Bit depth, chroma subsampling, full range
    ae(l),
    // Colour primaries
    ae(u),
    // Transfer characteristics
    ae(d),
    // Matrix coefficients
    L(0)
    // Codec initialization data size
  ]);
}, Gf = (r) => V("av1C", Bo(r.info.decoderConfig.codec)), Xf = (r, e) => {
  let t = 0, i, s = 16;
  const n = ge.includes(e.track.source._codec);
  if (n) {
    const a = e.track.source._codec, { sampleSize: o } = Qe(a);
    s = 8 * o, s > 16 && (t = 1);
  }
  if (e.muxer.isQuickTime && (t = 1), t === 0)
    i = [
      Array(6).fill(0),
      // Reserved
      L(1),
      // Data reference index
      L(t),
      // Version
      L(0),
      // Revision level
      F(0),
      // Vendor
      L(e.info.numberOfChannels),
      // Number of channels
      L(s),
      // Sample size (bits)
      L(0),
      // Compression ID
      L(0),
      // Packet size
      L(e.info.sampleRate < 2 ** 16 ? e.info.sampleRate : 0),
      // Sample rate (upper)
      L(0)
      // Sample rate (lower)
    ];
  else {
    const a = n ? 0 : -2;
    i = [
      Array(6).fill(0),
      // Reserved
      L(1),
      // Data reference index
      L(t),
      // Version
      L(0),
      // Revision level
      F(0),
      // Vendor
      L(e.info.numberOfChannels),
      // Number of channels
      L(Math.min(s, 16)),
      // Sample size (bits)
      Qn(a),
      // Compression ID
      L(0),
      // Packet size
      L(e.info.sampleRate < 2 ** 16 ? e.info.sampleRate : 0),
      // Sample rate (upper)
      L(0),
      // Sample rate (lower)
      n ? [
        F(1),
        // Samples per packet (must be 1 for uncompressed formats)
        F(s / 8),
        // Bytes per packet
        F(e.info.numberOfChannels * s / 8)
        // Bytes per frame
      ] : [
        F(0),
        // Samples per packet (don't bother, still works with 0)
        F(0),
        // Bytes per packet (variable)
        F(0)
        // Bytes per frame (variable)
      ],
      F(2)
      // Bytes per sample (constant in FFmpeg)
    ];
  }
  return V(r, i, [
    Fh(e.track.source._codec, e.muxer.isQuickTime)?.(e) ?? null
  ]);
}, vs = (r) => {
  let e;
  switch (r.track.source._codec) {
    case "aac":
      e = 64;
      break;
    case "mp3":
      e = 107;
      break;
    case "vorbis":
      e = 221;
      break;
    default:
      throw new Error(`Unhandled audio codec: ${r.track.source._codec}`);
  }
  let t = [
    ...ae(e),
    // Object type indication
    ...ae(21),
    // stream type(6bits)=5 audio, flags(2bits)=1
    ...sl(0),
    // 24bit buffer size
    ...F(0),
    // max bitrate
    ...F(0)
    // avg bitrate
  ];
  if (r.info.decoderConfig.description) {
    const i = te(r.info.decoderConfig.description);
    t = [
      ...t,
      ...ae(5),
      // TAG(5) = DecoderSpecificInfo
      ...Es(i.byteLength),
      ...i
    ];
  }
  return t = [
    ...L(1),
    // ES_ID = 1
    ...ae(0),
    // flags etc = 0
    ...ae(4),
    // TAG(4) = ES Descriptor
    ...Es(t.length),
    ...t,
    ...ae(6),
    // TAG(6)
    ...ae(1),
    // length
    ...ae(2)
    // data
  ], t = [
    ...ae(3),
    // TAG(3) = Object Descriptor
    ...Es(t.length),
    ...t
  ], G("esds", 0, 0, t);
}, Tt = (r) => V("wave", void 0, [
  Yf(r),
  Zf(r),
  V("\0\0\0\0")
  // NULL tag at the end
]), Yf = (r) => V("frma", [
  X(dl(r.track.source._codec, r.muxer.isQuickTime))
]), Zf = (r) => {
  const { littleEndian: e } = Qe(r.track.source._codec);
  return V("enda", [
    L(+e)
  ]);
}, Jf = (r) => {
  let e = r.info.numberOfChannels, t = 3840, i = r.info.sampleRate, s = 0, n = 0, a = new Uint8Array(0);
  const o = r.info.decoderConfig?.description;
  if (o) {
    p(o.byteLength >= 18);
    const c = te(o), l = Jr(c);
    e = l.outputChannelCount, t = l.preSkip, i = l.inputSampleRate, s = l.outputGain, n = l.channelMappingFamily, l.channelMappingTable && (a = l.channelMappingTable);
  }
  return V("dOps", [
    ae(0),
    // Version
    ae(e),
    // OutputChannelCount
    L(t),
    // PreSkip
    F(i),
    // InputSampleRate
    Qn(s),
    // OutputGain
    ae(n),
    // ChannelMappingFamily
    ...a
  ]);
}, eh = (r) => {
  const e = r.info.decoderConfig?.description;
  p(e);
  const t = te(e);
  return G("dfLa", 0, 0, [
    ...t.subarray(4)
  ]);
}, Ye = (r) => {
  const { littleEndian: e, sampleSize: t } = Qe(r.track.source._codec), i = +e;
  return G("pcmC", 0, 0, [
    ae(i),
    ae(8 * t)
  ]);
}, th = (r) => {
  p(r.info.primingPacket);
  const e = Ko(r.info.primingPacket.data);
  if (!e)
    throw new Error("Couldn't extract AC-3 frame info from the audio packet. Ensure the packets contain valid AC-3 sync frames (as specified in ETSI TS 102 366).");
  const t = new Uint8Array(3), i = new j(t);
  return i.writeBits(2, e.fscod), i.writeBits(5, e.bsid), i.writeBits(3, e.bsmod), i.writeBits(3, e.acmod), i.writeBits(1, e.lfeon), i.writeBits(5, e.bitRateCode), i.writeBits(5, 0), V("dac3", [...t]);
}, ih = (r) => {
  p(r.info.primingPacket);
  const e = $o(r.info.primingPacket.data);
  if (!e)
    throw new Error("Couldn't extract E-AC-3 frame info from the audio packet. Ensure the packets contain valid E-AC-3 sync frames (as specified in ETSI TS 102 366).");
  let t = 16;
  for (const a of e.substreams)
    t += 23, a.numDepSub > 0 ? t += 9 : t += 1;
  const i = Math.ceil(t / 8), s = new Uint8Array(i), n = new j(s);
  n.writeBits(13, e.dataRate), n.writeBits(3, e.substreams.length - 1);
  for (const a of e.substreams)
    n.writeBits(2, a.fscod), n.writeBits(5, a.bsid), n.writeBits(1, 0), n.writeBits(1, 0), n.writeBits(3, a.bsmod), n.writeBits(3, a.acmod), n.writeBits(1, a.lfeon), n.writeBits(3, 0), n.writeBits(4, a.numDepSub), a.numDepSub > 0 ? n.writeBits(9, a.chanLoc) : n.writeBits(1, 0);
  return V("dec3", [...s]);
}, rh = (r, e) => V(r, [
  Array(6).fill(0),
  // Reserved
  L(1)
  // Data reference index
], [
  Rh[e.track.source._codec](e)
]), sh = (r) => V("vttC", [
  ...Y.encode(r.info.config.description)
]), nh = (r) => G("stts", 0, 0, [
  F(r.timeToSampleTable.length),
  // Number of entries
  r.timeToSampleTable.map((e) => [
    F(e.sampleCount),
    // Sample count
    F(e.sampleDelta)
    // Sample duration
  ])
]), ah = (r) => {
  if (r.samples.every((t) => t.type === "key"))
    return null;
  const e = [...r.samples.entries()].filter(([, t]) => t.type === "key");
  return G("stss", 0, 0, [
    F(e.length),
    // Number of entries
    e.map(([t]) => F(t + 1))
    // Sync sample table
  ]);
}, oh = (r) => G("stsc", 0, 0, [
  F(r.compactlyCodedChunkTable.length),
  // Number of entries
  r.compactlyCodedChunkTable.map((e) => [
    F(e.firstChunk),
    // First chunk
    F(e.samplesPerChunk),
    // Samples per chunk
    F(1)
    // Sample description index
  ])
]), ch = (r) => {
  if (r.type === "audio" && r.info.requiresPcmTransformation) {
    const { sampleSize: e } = Qe(r.track.source._codec);
    return G("stsz", 0, 0, [
      F(e * r.info.numberOfChannels),
      // Sample size
      F(r.samples.reduce((t, i) => t + re(i.duration, r.timescale), 0))
    ]);
  }
  return G("stsz", 0, 0, [
    F(0),
    // Sample size (0 means non-constant size)
    F(r.samples.length),
    // Number of entries
    r.samples.map((e) => F(e.size))
    // Sample size table
  ]);
}, lh = (r) => r.finalizedChunks.length > 0 && ne(r.finalizedChunks).offset >= 2 ** 32 ? G("co64", 0, 0, [
  F(r.finalizedChunks.length),
  // Number of entries
  r.finalizedChunks.map((e) => it(e.offset))
  // Chunk offset table
]) : G("stco", 0, 0, [
  F(r.finalizedChunks.length),
  // Number of entries
  r.finalizedChunks.map((e) => F(e.offset))
  // Chunk offset table
]), uh = (r) => G("ctts", 1, 0, [
  F(r.compositionTimeOffsetTable.length),
  // Number of entries
  r.compositionTimeOffsetTable.map((e) => [
    F(e.sampleCount),
    // Sample count
    ft(e.sampleCompositionTimeOffset)
    // Sample offset
  ])
]), dh = (r) => {
  let e = 1 / 0, t = -1 / 0, i = 1 / 0, s = -1 / 0;
  p(r.compositionTimeOffsetTable.length > 0), p(r.samples.length > 0);
  for (let a = 0; a < r.compositionTimeOffsetTable.length; a++) {
    const o = r.compositionTimeOffsetTable[a];
    e = Math.min(e, o.sampleCompositionTimeOffset), t = Math.max(t, o.sampleCompositionTimeOffset);
  }
  for (let a = 0; a < r.samples.length; a++) {
    const o = r.samples[a];
    i = Math.min(i, re(o.timestamp, r.timescale)), s = Math.max(s, re(o.timestamp + o.duration, r.timescale));
  }
  const n = Math.max(-e, 0);
  return s >= 2 ** 31 ? null : G("cslg", 0, 0, [
    ft(n),
    // Composition to DTS shift
    ft(e),
    // Least decode to display delta
    ft(t),
    // Greatest decode to display delta
    ft(i),
    // Composition start time
    ft(s)
    // Composition end time
  ]);
}, fh = (r) => V("mvex", void 0, r.map(hh)), hh = (r) => G("trex", 0, 0, [
  F(r.track.id),
  // Track ID
  F(1),
  // Default sample description index
  F(0),
  // Default sample duration
  F(0),
  // Default sample size
  F(0)
  // Default sample flags
]), so = (r, e) => V("moof", void 0, [
  mh(r),
  ...e.map(ph)
]), mh = (r) => G("mfhd", 0, 0, [
  F(r)
  // Sequence number
]), ll = (r) => {
  let e = 0, t = 0;
  const i = 0, s = 0, n = r.type === "delta";
  return t |= +n, n ? e |= 1 : e |= 2, e << 24 | t << 16 | i << 8 | s;
}, ph = (r) => V("traf", void 0, [
  gh(r),
  wh(r),
  yh(r)
]), gh = (r) => {
  p(r.currentChunk);
  let e = 0;
  e |= 8, e |= 16, e |= 32, e |= 131072;
  const t = r.currentChunk.samples[1] ?? r.currentChunk.samples[0], i = {
    duration: t.timescaleUnitsToNextSample,
    size: t.size,
    flags: ll(t)
  };
  return G("tfhd", 0, e, [
    F(r.track.id),
    // Track ID
    F(i.duration),
    // Default sample duration
    F(i.size),
    // Default sample size
    F(i.flags)
    // Default sample flags
  ]);
}, wh = (r) => (p(r.currentChunk), G("tfdt", 1, 0, [
  it(re(r.currentChunk.startTimestamp, r.timescale))
  // Base Media Decode Time
])), yh = (r) => {
  p(r.currentChunk);
  const e = r.currentChunk.samples.map((m) => m.timescaleUnitsToNextSample), t = r.currentChunk.samples.map((m) => m.size), i = r.currentChunk.samples.map(ll), s = r.currentChunk.samples.map((m) => re(m.timestamp - m.decodeTimestamp, r.timescale)), n = new Set(e), a = new Set(t), o = new Set(i), c = new Set(s), l = o.size === 2 && i[0] !== i[1], u = n.size > 1, d = a.size > 1, f = !l && o.size > 1, h = c.size > 1 || [...c].some((m) => m !== 0);
  let g = 0;
  return g |= 1, g |= 4 * +l, g |= 256 * +u, g |= 512 * +d, g |= 1024 * +f, g |= 2048 * +h, G("trun", 1, g, [
    F(r.currentChunk.samples.length),
    // Sample count
    F(r.currentChunk.offset - r.currentChunk.moofOffset || 0),
    // Data offset
    l ? F(i[0]) : [],
    r.currentChunk.samples.map((m, w) => [
      u ? F(e[w]) : [],
      // Sample duration
      d ? F(t[w]) : [],
      // Sample size
      f ? F(i[w]) : [],
      // Sample flags
      // Sample composition time offsets
      h ? ft(s[w]) : []
    ])
  ]);
}, bh = (r) => V("mfra", void 0, [
  ...r.map(kh),
  Th()
]), kh = (r) => G("tfra", 1, 0, [
  F(r.track.id),
  // Track ID
  F(63),
  // This specifies that traf number, trun number and sample number are 32-bit ints
  F(r.finalizedChunks.length),
  // Number of entries
  r.finalizedChunks.map((t) => [
    it(re(t.samples[0].timestamp, r.timescale)),
    // Time (in presentation time)
    it(t.moofOffset),
    // moof offset
    F(t.trafIndex + 1),
    // traf number
    F(1),
    // trun number
    F(1)
    // Sample number
  ])
]), Th = () => G("mfro", 0, 0, [
  // This value needs to be overwritten manually from the outside, where the actual size of the enclosing mfra box
  // is known
  F(0)
  // Size
]), Sh = () => V("vtte"), Ah = (r, e, t, i, s) => V("vttc", void 0, [
  s !== null ? V("vsid", [ft(s)]) : null,
  t !== null ? V("iden", [...Y.encode(t)]) : null,
  e !== null ? V("ctim", [...Y.encode(rl(e))]) : null,
  i !== null ? V("sttg", [...Y.encode(i)]) : null,
  V("payl", [...Y.encode(r)])
]), xh = (r) => V("vtta", [...Y.encode(r)]), Ph = (r) => {
  const e = [], t = r.format._options.metadataFormat ?? "auto", i = r.output._metadataTags;
  if (t === "mdir" || t === "auto" && !r.isQuickTime) {
    const s = _h(i);
    s && e.push(s);
  } else if (t === "mdta") {
    const s = Ih(i);
    s && e.push(s);
  } else (t === "udta" || t === "auto" && r.isQuickTime) && Ch(e, r.output._metadataTags);
  return e.length === 0 ? null : V("udta", void 0, e);
}, Ch = (r, e) => {
  for (const { key: t, value: i } of Ti(e))
    switch (t) {
      case "title":
        r.push(Ze("©nam", i));
        break;
      case "description":
        r.push(Ze("©des", i));
        break;
      case "artist":
        r.push(Ze("©ART", i));
        break;
      case "album":
        r.push(Ze("©alb", i));
        break;
      case "albumArtist":
        r.push(Ze("albr", i));
        break;
      case "genre":
        r.push(Ze("©gen", i));
        break;
      case "date":
        r.push(Ze("©day", i.toISOString().slice(0, 10)));
        break;
      case "comment":
        r.push(Ze("©cmt", i));
        break;
      case "lyrics":
        r.push(Ze("©lyr", i));
        break;
      case "raw":
        break;
      case "discNumber":
      case "discsTotal":
      case "trackNumber":
      case "tracksTotal":
      case "images":
        break;
      default:
        pe(t);
    }
  if (e.raw)
    for (const t in e.raw) {
      const i = e.raw[t];
      i == null || t.length !== 4 || r.some((s) => s.type === t) || (typeof i == "string" ? r.push(Ze(t, i)) : i instanceof Uint8Array && r.push(V(t, Array.from(i))));
    }
}, Ze = (r, e) => {
  const t = Y.encode(e);
  return V(r, [
    L(t.length),
    L(fl("und")),
    Array.from(t)
  ]);
}, no = {
  "image/jpeg": 13,
  "image/png": 14,
  "image/bmp": 27
}, ul = (r, e) => {
  const t = [];
  for (const { key: i, value: s } of Ti(r))
    switch (i) {
      case "title":
        t.push({ key: e ? "title" : "©nam", value: We(s) });
        break;
      case "description":
        t.push({ key: e ? "description" : "©des", value: We(s) });
        break;
      case "artist":
        t.push({ key: e ? "artist" : "©ART", value: We(s) });
        break;
      case "album":
        t.push({ key: e ? "album" : "©alb", value: We(s) });
        break;
      case "albumArtist":
        t.push({ key: e ? "album_artist" : "aART", value: We(s) });
        break;
      case "comment":
        t.push({ key: e ? "comment" : "©cmt", value: We(s) });
        break;
      case "genre":
        t.push({ key: e ? "genre" : "©gen", value: We(s) });
        break;
      case "lyrics":
        t.push({ key: e ? "lyrics" : "©lyr", value: We(s) });
        break;
      case "date":
        t.push({
          key: e ? "date" : "©day",
          value: We(s.toISOString().slice(0, 10))
        });
        break;
      case "images":
        for (const n of s)
          n.kind === "coverFront" && t.push({ key: "covr", value: V("data", [
            F(no[n.mimeType] ?? 0),
            // Type indicator
            F(0),
            // Locale indicator
            Array.from(n.data)
            // Kinda slow, hopefully temp
          ]) });
        break;
      case "trackNumber":
        if (e) {
          const n = r.tracksTotal !== void 0 ? `${s}/${r.tracksTotal}` : s.toString();
          t.push({ key: "track", value: We(n) });
        } else
          t.push({ key: "trkn", value: V("data", [
            F(0),
            // 8 bytes empty
            F(0),
            L(0),
            // Empty
            L(s),
            L(r.tracksTotal ?? 0),
            L(0)
            // Empty
          ]) });
        break;
      case "discNumber":
        e || t.push({ key: "disc", value: V("data", [
          F(0),
          // 8 bytes empty
          F(0),
          L(0),
          // Empty
          L(s),
          L(r.discsTotal ?? 0),
          L(0)
          // Empty
        ]) });
        break;
      case "tracksTotal":
      case "discsTotal":
        break;
      case "raw":
        break;
      default:
        pe(i);
    }
  if (r.raw)
    for (const i in r.raw) {
      const s = r.raw[i];
      s == null || !e && i.length !== 4 || t.some((n) => n.key === i) || (typeof s == "string" ? t.push({ key: i, value: We(s) }) : s instanceof Uint8Array ? t.push({ key: i, value: V("data", [
        F(0),
        // Type indicator
        F(0),
        // Locale indicator
        Array.from(s)
      ]) }) : s instanceof hi && t.push({ key: i, value: V("data", [
        F(no[s.mimeType] ?? 0),
        // Type indicator
        F(0),
        // Locale indicator
        Array.from(s.data)
        // Kinda slow, hopefully temp
      ]) }));
    }
  return t;
}, _h = (r) => {
  const e = ul(r, !1);
  return e.length === 0 ? null : G("meta", 0, 0, void 0, [
    $n(!1, "mdir", "", "appl"),
    // mdir handler
    V("ilst", void 0, e.map((t) => V(t.key, void 0, [t.value])))
    // Item list without keys box
  ]);
}, Ih = (r) => {
  const e = ul(r, !0);
  return e.length === 0 ? null : V("meta", void 0, [
    $n(!1, "mdta", ""),
    // mdta handler
    G("keys", 0, 0, [
      F(e.length)
    ], e.map((t) => V("mdta", [
      ...Y.encode(t.key)
    ]))),
    V("ilst", void 0, e.map((t, i) => {
      const s = String.fromCharCode(...F(i + 1));
      return V(s, void 0, [t.value]);
    }))
  ]);
}, We = (r) => V("data", [
  F(1),
  // Type indicator (UTF-8)
  F(0),
  // Locale indicator
  ...Y.encode(r)
]), Eh = (r, e) => {
  switch (r) {
    case "avc":
      return e.startsWith("avc3") ? "avc3" : "avc1";
    case "hevc":
      return "hvc1";
    case "vp8":
      return "vp08";
    case "vp9":
      return "vp09";
    case "av1":
      return "av01";
    case "prores":
      return e;
  }
}, vh = {
  avc: Qf,
  hevc: $f,
  vp8: ro,
  vp9: ro,
  av1: Gf,
  prores: null
}, dl = (r, e) => {
  switch (r) {
    case "aac":
      return "mp4a";
    case "mp3":
      return "mp4a";
    case "opus":
      return "Opus";
    case "vorbis":
      return "mp4a";
    case "flac":
      return "fLaC";
    case "ulaw":
      return "ulaw";
    case "alaw":
      return "alaw";
    case "pcm-u8":
      return "raw ";
    case "pcm-s8":
      return "sowt";
    case "ac3":
      return "ac-3";
    case "eac3":
      return "ec-3";
  }
  if (e)
    switch (r) {
      case "pcm-s16":
        return "sowt";
      case "pcm-s16be":
        return "twos";
      case "pcm-s24":
        return "in24";
      case "pcm-s24be":
        return "in24";
      case "pcm-s32":
        return "in32";
      case "pcm-s32be":
        return "in32";
      case "pcm-f32":
        return "fl32";
      case "pcm-f32be":
        return "fl32";
      case "pcm-f64":
        return "fl64";
      case "pcm-f64be":
        return "fl64";
    }
  else
    switch (r) {
      case "pcm-s16":
        return "ipcm";
      case "pcm-s16be":
        return "ipcm";
      case "pcm-s24":
        return "ipcm";
      case "pcm-s24be":
        return "ipcm";
      case "pcm-s32":
        return "ipcm";
      case "pcm-s32be":
        return "ipcm";
      case "pcm-f32":
        return "fpcm";
      case "pcm-f32be":
        return "fpcm";
      case "pcm-f64":
        return "fpcm";
      case "pcm-f64be":
        return "fpcm";
    }
}, Fh = (r, e) => {
  switch (r) {
    case "aac":
      return vs;
    case "mp3":
      return vs;
    case "opus":
      return Jf;
    case "vorbis":
      return vs;
    case "flac":
      return eh;
    case "ac3":
      return th;
    case "eac3":
      return ih;
  }
  if (e)
    switch (r) {
      case "pcm-s24":
        return Tt;
      case "pcm-s24be":
        return Tt;
      case "pcm-s32":
        return Tt;
      case "pcm-s32be":
        return Tt;
      case "pcm-f32":
        return Tt;
      case "pcm-f32be":
        return Tt;
      case "pcm-f64":
        return Tt;
      case "pcm-f64be":
        return Tt;
    }
  else
    switch (r) {
      case "pcm-s16":
        return Ye;
      case "pcm-s16be":
        return Ye;
      case "pcm-s24":
        return Ye;
      case "pcm-s24be":
        return Ye;
      case "pcm-s32":
        return Ye;
      case "pcm-s32be":
        return Ye;
      case "pcm-f32":
        return Ye;
      case "pcm-f32be":
        return Ye;
      case "pcm-f64":
        return Ye;
      case "pcm-f64be":
        return Ye;
    }
  return null;
}, Bh = {
  webvtt: "wvtt"
}, Rh = {
  webvtt: sh
}, fl = (r) => {
  p(r.length === 3);
  let e = 0;
  for (let t = 0; t < 3; t++)
    e <<= 5, e += r.charCodeAt(t) - 96;
  return e;
};
class nr {
  constructor(e, t) {
    if (this.finalized = !1, this.started = !1, this.pos = 0, this.trackedWrites = null, this.trackedStart = -1, this.trackedEnd = -1, e._writerAcquired)
      throw new Error("Can't have multiple Writers for the same Target.");
    this.target = e, e._setMonotonicity(t), e._writerAcquired = !0;
  }
  start() {
    p(!this.started), this.target._start(), this.started = !0;
  }
  /** Writes the given data to the target, at the current position. */
  write(e) {
    p(this.started && !this.finalized), this.maybeTrackWrites(e), this.target._write(e, this.pos), this.pos += e.byteLength;
  }
  /** Sets the current position for future writes to a new one. */
  seek(e) {
    this.pos = e;
  }
  /** Returns the current position. */
  getPos() {
    return this.pos;
  }
  /** Signals to the writer that it may be time to flush. */
  async flush() {
    return p(this.started && !this.finalized), this.target._flush();
  }
  /** Called after muxing has finished. */
  async finalize() {
    p(this.started && !this.finalized), await this.target._finalize(), this.finalized = !0;
  }
  maybeTrackWrites(e) {
    if (!this.trackedWrites)
      return;
    let t = this.getPos();
    if (t < this.trackedStart) {
      if (t + e.byteLength <= this.trackedStart)
        return;
      e = e.subarray(this.trackedStart - t), t = 0;
    }
    const i = t + e.byteLength - this.trackedStart;
    let s = this.trackedWrites.byteLength;
    for (; s < i; )
      s *= 2;
    if (s !== this.trackedWrites.byteLength) {
      const n = new Uint8Array(s);
      n.set(this.trackedWrites, 0), this.trackedWrites = n;
    }
    this.trackedWrites.set(e, t - this.trackedStart), this.trackedEnd = Math.max(this.trackedEnd, t + e.byteLength);
  }
  startTrackingWrites() {
    this.trackedWrites = new Uint8Array(2 ** 10), this.trackedStart = this.getPos(), this.trackedEnd = this.trackedStart;
  }
  stopTrackingWrites() {
    if (!this.trackedWrites)
      throw new Error("Internal error: Can't get tracked writes since nothing was tracked.");
    const t = {
      data: this.trackedWrites.subarray(0, this.trackedEnd - this.trackedStart),
      start: this.trackedStart,
      end: this.trackedEnd
    };
    return this.trackedWrites = null, t;
  }
}
const ao = typeof Nr < "u" ? Nr : void 0;
class Be extends or {
  constructor() {
    super(...arguments), this._writerAcquired = !1, this._monotonicity = null, this.onwrite = null;
  }
  /** @internal */
  _setMonotonicity(e) {
    this._monotonicity !== !1 && (this._monotonicity = e);
  }
  /** @internal */
  _dispatchWrite(e, t) {
    this.onwrite?.(e, t), this._emit("write", { start: e, end: t });
  }
  /**
   * Returns a new {@link RangedTarget} that writes data to this target using the given offset.
   *
   * Useful for writing a file into a section of a larger file.
   */
  slice(e) {
    if (!Number.isInteger(e) || e < 0)
      throw new TypeError("offset must be a non-negative integer.");
    return new Dh(this, e);
  }
}
const Fs = 2 ** 16, Bs = 2 ** 32;
class Rs extends Be {
  /** Creates a new {@link BufferTarget}. The buffer holding the data will be created and managed internally. */
  constructor(e = {}) {
    if (super(), this.buffer = null, this._maxPos = 0, !e || typeof e != "object")
      throw new TypeError("BufferTarget options, when provided, must be an object.");
    if (e.onFinalize !== void 0 && typeof e.onFinalize != "function")
      throw new TypeError("options.onFinalize, when provided, must be a function.");
    if (this._options = e, this._supportsResize = "resize" in new ArrayBuffer(0), this._supportsResize)
      try {
        this._buffer = new ArrayBuffer(Fs, { maxByteLength: Bs });
      } catch {
        this._buffer = new ArrayBuffer(Fs), this._supportsResize = !1;
      }
    else
      this._buffer = new ArrayBuffer(Fs);
    this._bytes = new Uint8Array(this._buffer);
  }
  /** @internal */
  _ensureSize(e) {
    let t = this._buffer.byteLength;
    for (; t < e; )
      t *= 2;
    if (t !== this._buffer.byteLength) {
      if (t > Bs)
        throw new Error(`ArrayBuffer exceeded maximum size of ${Bs} bytes. Please consider using another target.`);
      if (this._supportsResize)
        this._buffer.resize(t);
      else {
        const i = new ArrayBuffer(t), s = new Uint8Array(i);
        s.set(this._bytes, 0), this._buffer = i, this._bytes = s;
      }
    }
  }
  /** @internal */
  _start() {
  }
  /** @internal */
  _write(e, t) {
    this._ensureSize(t + e.byteLength), this._bytes.set(e, t), this._maxPos = Math.max(this._maxPos, t + e.byteLength), this._dispatchWrite(t, t + e.byteLength);
  }
  /** @internal */
  async _flush() {
  }
  /** @internal */
  async _finalize() {
    this.buffer = this._buffer.slice(0, this._maxPos), this._options.onFinalize && await this._options.onFinalize(this.buffer), this._emit("finalized");
  }
  /** @internal */
  async _close() {
  }
  /** @internal */
  _getSlice(e, t) {
    return this._bytes.slice(e, t);
  }
}
const Mh = 2 ** 24, zh = 2;
class hl extends Be {
  /** Creates a new {@link StreamTarget} which writes to the specified `writable`. */
  constructor(e, t = {}) {
    if (super(), this._sections = [], this._lastWriteEnd = 0, this._lastFlushEnd = 0, this._streamWriter = null, this._writeError = null, this._chunks = [], !(e instanceof WritableStream))
      throw new TypeError("StreamTarget requires a WritableStream instance.");
    if (t != null && typeof t != "object")
      throw new TypeError("StreamTarget options, when provided, must be an object.");
    if (t.chunked !== void 0 && typeof t.chunked != "boolean")
      throw new TypeError("options.chunked, when provided, must be a boolean.");
    if (t.chunkSize !== void 0 && (!Number.isInteger(t.chunkSize) || t.chunkSize < 1024))
      throw new TypeError("options.chunkSize, when provided, must be an integer and not smaller than 1024.");
    this._writable = e, this._options = t, this._chunked = t.chunked ?? !1, this._chunkSize = t.chunkSize ?? Mh;
  }
  /** @internal */
  _start() {
    this._streamWriter = this._writable.getWriter();
  }
  /** @internal */
  _write(e, t) {
    if (t > this._lastWriteEnd) {
      const i = t - this._lastWriteEnd;
      this._write(new Uint8Array(i), this._lastWriteEnd);
    }
    this._sections.push({
      data: e.slice(),
      start: t
    }), this._lastWriteEnd = Math.max(this._lastWriteEnd, t + e.byteLength), this._dispatchWrite(t, t + e.byteLength);
  }
  /** @internal */
  async _flush() {
    if (this._writeError !== null)
      throw this._writeError;
    if (p(this._streamWriter), this._sections.length === 0)
      return;
    const e = [], t = [...this._sections].sort((i, s) => i.start - s.start);
    e.push({
      start: t[0].start,
      size: t[0].data.byteLength
    });
    for (let i = 1; i < t.length; i++) {
      const s = e[e.length - 1], n = t[i];
      n.start <= s.start + s.size ? s.size = Math.max(s.size, n.start + n.data.byteLength - s.start) : e.push({
        start: n.start,
        size: n.data.byteLength
      });
    }
    for (const i of e) {
      i.data = new Uint8Array(i.size);
      for (const s of this._sections)
        i.start <= s.start && s.start < i.start + i.size && i.data.set(s.data, s.start - i.start);
      if (this._streamWriter.desiredSize !== null && this._streamWriter.desiredSize <= 0 && await this._streamWriter.ready, this._chunked)
        this._writeDataIntoChunks(i.data, i.start), this._tryToFlushChunks();
      else {
        if (this._monotonicity === !0 && i.start !== this._lastFlushEnd)
          throw new Error("Internal error: Monotonicity violation.");
        this._streamWriter.write({
          type: "write",
          data: i.data,
          position: i.start
        }).catch((s) => {
          this._writeError ??= s;
        }), this._lastFlushEnd = i.start + i.data.byteLength;
      }
    }
    this._sections.length = 0;
  }
  /** @internal */
  _writeDataIntoChunks(e, t) {
    let i = this._chunks.findIndex((c) => c.start <= t && t < c.start + this._chunkSize);
    i === -1 && (i = this._createChunk(t));
    const s = this._chunks[i], n = t - s.start, a = e.subarray(0, Math.min(this._chunkSize - n, e.byteLength));
    s.data.set(a, n);
    const o = {
      start: n,
      end: n + a.byteLength
    };
    if (this._insertSectionIntoChunk(s, o), s.written[0].start === 0 && s.written[0].end === this._chunkSize && (s.shouldFlush = !0), this._chunks.length > zh) {
      for (let c = 0; c < this._chunks.length - 1; c++)
        this._chunks[c].shouldFlush = !0;
      this._tryToFlushChunks();
    }
    a.byteLength < e.byteLength && this._writeDataIntoChunks(e.subarray(a.byteLength), t + a.byteLength);
  }
  /** @internal */
  _insertSectionIntoChunk(e, t) {
    let i = 0, s = e.written.length - 1, n = -1;
    for (; i <= s; ) {
      const a = Math.floor(i + (s - i + 1) / 2);
      e.written[a].start <= t.start ? (i = a + 1, n = a) : s = a - 1;
    }
    for (e.written.splice(n + 1, 0, t), (n === -1 || e.written[n].end < t.start) && n++; n < e.written.length - 1 && e.written[n].end >= e.written[n + 1].start; )
      e.written[n].end = Math.max(e.written[n].end, e.written[n + 1].end), e.written.splice(n + 1, 1);
  }
  /** @internal */
  _createChunk(e) {
    const i = {
      start: Math.floor(e / this._chunkSize) * this._chunkSize,
      data: new Uint8Array(this._chunkSize),
      written: [],
      shouldFlush: !1
    };
    return this._chunks.push(i), this._chunks.sort((s, n) => s.start - n.start), this._chunks.indexOf(i);
  }
  /** @internal */
  _tryToFlushChunks(e = !1) {
    p(this._streamWriter);
    for (let t = 0; t < this._chunks.length; t++) {
      const i = this._chunks[t];
      if (!(!i.shouldFlush && !e)) {
        for (const s of i.written) {
          const n = i.start + s.start;
          if (this._monotonicity === !0 && n !== this._lastFlushEnd)
            throw new Error("Internal error: Monotonicity violation.");
          const a = s.start !== 0 || s.end !== i.data.byteLength;
          let o;
          a && di() ? o = i.data.slice(s.start, s.end) : o = i.data.subarray(s.start, s.end), this._streamWriter.write({
            type: "write",
            data: o,
            position: n
          }).catch((c) => {
            this._writeError ??= c;
          }), this._lastFlushEnd = i.start + s.end;
        }
        this._chunks.splice(t--, 1);
      }
    }
  }
  /** @internal */
  async _finalize() {
    if (this._chunked && this._tryToFlushChunks(!0), this._writeError !== null)
      throw this._writeError;
    p(this._streamWriter), await this._streamWriter.ready, await this._streamWriter.close(), this._emit("finalized");
  }
  /** @internal */
  async _close() {
    return this._streamWriter?.close();
  }
}
class Wm extends Be {
  constructor(e) {
    super(), this._writer = null, this._nextWritePos = 0, this._writable = e, this._streamTarget = new hl(new WritableStream({
      start: () => {
        this._writer = this._writable.getWriter();
      },
      write: (t) => {
        if (this._monotonicity !== !0)
          throw new Error("AppendOnlyStreamTarget requires that data be written monotonically (always appended to the end). You must use a format that guarantees this behavior.");
        return p(t.position === this._nextWritePos), this._nextWritePos += t.data.byteLength, p(this._writer), this._writer.write(t.data);
      },
      close: () => this._writer?.close()
    }));
  }
  /** @internal */
  _start() {
    this._streamTarget._start();
  }
  /** @internal */
  _write(e, t) {
    this._streamTarget._write(e, t);
  }
  /** @internal */
  _flush() {
    return this._streamTarget._flush();
  }
  /** @internal */
  _finalize() {
    return this._streamTarget._finalize();
  }
  /** @internal */
  _close() {
    return this._streamTarget._close();
  }
  /** @internal */
  _setMonotonicity(e) {
    super._setMonotonicity(e), this._streamTarget._setMonotonicity(e);
  }
}
class Lm extends Be {
  /** Creates a new {@link FilePathTarget} that writes to the file at the specified file path. */
  constructor(e, t = {}) {
    if (typeof e != "string")
      throw new TypeError("filePath must be a string.");
    if (!t || typeof t != "object")
      throw new TypeError("options must be an object.");
    if (!ao.fs)
      throw new Error("FilePathTarget is only available in server-side environments (Node.js, Bun, Deno).");
    super(), this._fileHandle = null;
    const i = new WritableStream({
      start: async () => {
        this._fileHandle = await ao.fs.open(e, "w");
      },
      write: async (s) => {
        p(this._fileHandle), await this._fileHandle.write(s.data, 0, s.data.byteLength, s.position);
      },
      close: async () => {
        this._fileHandle && (await this._fileHandle.close(), this._fileHandle = null);
      }
    });
    this._streamTarget = new hl(i, {
      chunked: !0,
      ...t
    });
  }
  /** @internal */
  _start() {
    this._streamTarget._start();
  }
  /** @internal */
  _write(e, t) {
    this._streamTarget._write(e, t), this._dispatchWrite(t, t + e.byteLength);
  }
  /** @internal */
  async _flush() {
    return this._streamTarget._flush();
  }
  /** @internal */
  async _finalize() {
    await this._streamTarget._finalize(), this._emit("finalized");
  }
  /** @internal */
  async _close() {
    return this._streamTarget._close();
  }
  /** @internal */
  _setMonotonicity(e) {
    super._setMonotonicity(e), this._streamTarget._setMonotonicity(e);
  }
}
class ml extends Be {
  /** @internal */
  _start() {
  }
  /** @internal */
  _write(e, t) {
    this._dispatchWrite(t, t + e.byteLength);
  }
  /** @internal */
  async _flush() {
  }
  /** @internal */
  async _finalize() {
    this._emit("finalized");
  }
  /** @internal */
  async _close() {
  }
}
class Dh extends Be {
  /** @internal */
  constructor(e, t) {
    super(), this._baseTarget = e, this._offset = t;
  }
  /** @internal */
  _start() {
  }
  /** @internal */
  _write(e, t) {
    this._baseTarget._write(e, this._offset + t), this._dispatchWrite(t, t + e.byteLength);
  }
  /** @internal */
  _flush() {
    return this._baseTarget._flush();
  }
  /** @internal */
  async _finalize() {
    this._emit("finalized");
  }
  /** @internal */
  async _close() {
  }
  /** @internal */
  _setMonotonicity(e) {
    super._setMonotonicity(e), this._baseTarget._setMonotonicity(e);
  }
}
class Pt {
  /** Creates a new {@link PathedTarget} from a root path and a callback. */
  constructor(e, t) {
    if (this.rootPath = e, this.getTarget = t, typeof e != "string")
      throw new TypeError("rootPath must be a string.");
    if (typeof t != "function")
      throw new TypeError("getTarget must be a function.");
  }
}
const Ke = 57600, Oh = 2082844800, Uh = (r) => {
  const e = {}, t = r.track;
  return t.metadata.name !== void 0 && (e.name = t.metadata.name), e;
}, re = (r, e, t = !0) => {
  const i = r * e;
  return t ? Math.round(i) : i;
};
class Nh extends kt {
  constructor(e, t) {
    super(e), this.writer = null, this.boxWriter = null, this.initWriter = null, this.initBoxWriter = null, this.auxTarget = new Rs(), this.auxWriter = new nr(this.auxTarget, !1), this.auxBoxWriter = new yr(this.auxWriter), this.mdat = null, this.ftypSize = null, this.trackDatas = [], this.allTracksKnown = ee(), this.creationTime = Math.floor(Date.now() / 1e3) + Oh, this.finalizedChunks = [], this.wroteFragmentedHeader = !1, this.nextFragmentNumber = 1, this.maxWrittenTimestamp = -1 / 0, this.minWrittenTimestamp = 1 / 0, this.maxWrittenEndTimestamp = -1 / 0, this.segmentHeaderSize = null, this.format = t, this.formatOptions = { ...t._options }, this.isQuickTime = t instanceof kl, this.isCmaf = t instanceof wo, this.minimumFragmentDuration = this.formatOptions.minimumFragmentDuration ?? (t instanceof wo ? 1 / 0 : 1), this.auxWriter.start();
  }
  async start() {
    const e = await this.mutex.acquire();
    if (this.isCmaf ? (this.fastStart = "fragmented", this.isFragmented = !0) : (this.writer = await this.output._getRootWriter((i) => this.formatOptions.fastStart !== void 0 ? this.formatOptions.fastStart === "fragmented" : i instanceof Rs), this.boxWriter = new yr(this.writer), this.fastStart = this.formatOptions.fastStart ?? (this.writer.target instanceof Rs ? "in-memory" : !1), this.isFragmented = this.fastStart === "fragmented"), this.isCmaf) {
      if (!this.output._hasInitTarget())
        throw new Error("CMAF outputs require the initTarget field in OutputOptions to be set; the init segment will be written to it.");
      const i = await this.output._getInitTarget(), s = new nr(i, !0);
      s.start(), this.initWriter = s, this.initBoxWriter = new yr(s);
    }
    const t = this.output.tracks.some((i) => i.isVideoTrack() && i.source._codec === "avc");
    {
      const i = this.initBoxWriter ?? this.boxWriter;
      if (p(i), this.formatOptions.onFtyp && i.writer.startTrackingWrites(), i.writeBox(xf({
        isQuickTime: this.isQuickTime,
        holdsAvc: t,
        fragmented: this.isFragmented,
        cmaf: this.isCmaf
      })), this.formatOptions.onFtyp) {
        const { data: s, start: n } = i.writer.stopTrackingWrites();
        this.formatOptions.onFtyp(s, n);
      }
      this.ftypSize = i.writer.getPos(), this.isCmaf && await this.initWriter.flush();
    }
    if (this.fastStart !== "in-memory") if (this.fastStart === "reserve") {
      for (const i of this.output.tracks)
        if (i.metadata.maximumPacketCount === void 0)
          throw new Error("All tracks must specify maximumPacketCount in their metadata when using fastStart: 'reserve'.");
    } else this.isFragmented || (p(this.writer), p(this.boxWriter), this.formatOptions.onMdat && this.writer.startTrackingWrites(), this.mdat = br(!0), this.boxWriter.writeBox(this.mdat));
    await this.writer?.flush();
    for (const i of this.output.tracks)
      i.isVideoTrack() && i.metadata.decoderConfig ? this.getVideoTrackData(i, i.metadata.primingPacket ?? null, { decoderConfig: i.metadata.decoderConfig }) : i.isAudioTrack() && i.metadata.decoderConfig && this.getAudioTrackData(i, i.metadata.primingPacket ?? null, { decoderConfig: i.metadata.decoderConfig });
    e();
  }
  allTracksAreKnown() {
    for (const e of this.output.tracks)
      if (!e.source._closed && !this.trackDatas.some((t) => t.track === e))
        return !1;
    return !0;
  }
  async getMimeType() {
    await this.allTracksKnown.promise;
    const e = this.trackDatas.map((t) => t.type === "video" || t.type === "audio" ? t.info.decoderConfig.codec : {
      webvtt: "wvtt"
    }[t.track.source._codec]);
    return Yo({
      isQuickTime: this.isQuickTime,
      hasVideo: this.trackDatas.some((t) => t.type === "video"),
      hasAudio: this.trackDatas.some((t) => t.type === "audio"),
      codecStrings: e
    });
  }
  getVideoTrackData(e, t, i) {
    const s = this.trackDatas.find((h) => h.track === e);
    if (s)
      return s;
    lr(i, e.source._codec), p(i), p(i.decoderConfig);
    const n = { ...i.decoderConfig };
    p(n.codedWidth !== void 0), p(n.codedHeight !== void 0);
    let a = !1;
    if (e.source._codec === "avc" && !n.description) {
      if (!t)
        throw new Error("No AVC description provided; you must therefore provide a priming packet.");
      const h = vn(t.data);
      if (!h)
        throw new Error("Couldn't extract an AVCDecoderConfigurationRecord from the AVC packet. Make sure the packets are in Annex B format (as specified in ITU-T-REC-H.264) when not providing a description, or provide a description (must be an AVCDecoderConfigurationRecord as specified in ISO 14496-15) and ensure the packets are in AVCC format.");
      n.description = nu(h), a = !0;
    } else if (e.source._codec === "hevc" && !n.description) {
      if (!t)
        throw new Error("No HEVC description provided; you must therefore provide a priming packet.");
      const h = Bn(t.data);
      if (!h)
        throw new Error("Couldn't extract an HEVCDecoderConfigurationRecord from the HEVC packet. Make sure the packets are in Annex B format (as specified in ITU-T-REC-H.265) when not providing a description, or provide a description (must be an HEVCDecoderConfigurationRecord as specified in ISO 14496-15) and ensure the packets are in HEVC format.");
      n.description = hu(h), a = !0;
    }
    const o = Ml(1 / (e.metadata.frameRate ?? Ke), 1e6).den, c = n.displayAspectWidth, l = n.displayAspectHeight, u = c === void 0 || l === void 0 ? { num: 1, den: 1 } : Qi({
      num: c * n.codedHeight,
      den: l * n.codedWidth
    }), d = n.codec === "ap4h" || n.codec === "ap4x", f = {
      muxer: this,
      track: e,
      type: "video",
      info: {
        width: n.codedWidth,
        height: n.codedHeight,
        pixelAspectRatio: u,
        decoderConfig: n,
        requiresAnnexBTransformation: a,
        hasAlphaChannel: d
      },
      timescale: o,
      samples: [],
      sampleQueue: [],
      timestampProcessingQueue: [],
      timeToSampleTable: [],
      compositionTimeOffsetTable: [],
      lastTimescaleUnits: null,
      lastSample: null,
      startTimestampOffset: null,
      finalizedChunks: [],
      currentChunk: null,
      compactlyCodedChunkTable: [],
      closed: !1
    };
    return this.trackDatas.push(f), this.trackDatas.sort((h, g) => h.track.id - g.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), f;
  }
  getAudioTrackData(e, t, i) {
    const s = this.trackDatas.find((c) => c.track === e);
    if (s)
      return s;
    $e(i, e.source._codec), p(i), p(i.decoderConfig);
    const n = { ...i.decoderConfig };
    let a = !1;
    if (e.source._codec === "aac" && !n.description) {
      if (!t)
        throw new Error("No AAC description provided; you must therefore provide a priming packet.");
      const c = gt(Ce.tempFromBytes(t.data));
      if (!c)
        throw new Error("Couldn't parse ADTS header from the AAC packet. Make sure the packets are in ADTS format (as specified in ISO 13818-7) when not providing a description, or provide a description (must be an AudioSpecificConfig as specified in ISO 14496-3) and ensure the packets are raw AAC data.");
      const l = Ft[c.samplingFrequencyIndex], u = Ai[c.channelConfiguration];
      if (l === void 0 || u === void 0)
        throw new Error("Invalid ADTS frame header.");
      n.description = xn({
        objectType: c.objectType,
        sampleRate: l,
        numberOfChannels: u
      }), a = !0;
    }
    if ((e.source._codec === "ac3" || e.source._codec === "eac3") && !t)
      throw new Error("AC-3/E-AC-3 require a priming packet.");
    const o = {
      muxer: this,
      track: e,
      type: "audio",
      info: {
        numberOfChannels: i.decoderConfig.numberOfChannels,
        sampleRate: i.decoderConfig.sampleRate,
        decoderConfig: n,
        requiresPcmTransformation: !this.isFragmented && ge.includes(e.source._codec),
        expectedNextPcmPacketTimestamp: null,
        requiresAdtsStripping: a,
        primingPacket: t
      },
      timescale: n.sampleRate,
      samples: [],
      sampleQueue: [],
      timestampProcessingQueue: [],
      timeToSampleTable: [],
      compositionTimeOffsetTable: [],
      lastTimescaleUnits: null,
      lastSample: null,
      startTimestampOffset: null,
      finalizedChunks: [],
      currentChunk: null,
      compactlyCodedChunkTable: [],
      closed: !1
    };
    return this.trackDatas.push(o), this.trackDatas.sort((c, l) => c.track.id - l.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), o;
  }
  getSubtitleTrackData(e, t) {
    const i = this.trackDatas.find((n) => n.track === e);
    if (i)
      return i;
    zo(t), p(t), p(t.config);
    const s = {
      muxer: this,
      track: e,
      type: "subtitle",
      info: {
        config: t.config
      },
      timescale: 1e3,
      // Reasonable
      samples: [],
      sampleQueue: [],
      timestampProcessingQueue: [],
      timeToSampleTable: [],
      compositionTimeOffsetTable: [],
      lastTimescaleUnits: null,
      lastSample: null,
      startTimestampOffset: null,
      finalizedChunks: [],
      currentChunk: null,
      compactlyCodedChunkTable: [],
      closed: !1,
      lastCueEndTimestamp: 0,
      cueQueue: [],
      nextSourceId: 0,
      cueToSourceId: /* @__PURE__ */ new WeakMap()
    };
    return this.trackDatas.push(s), this.trackDatas.sort((n, a) => n.track.id - a.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), s;
  }
  async addEncodedVideoPacket(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      const n = this.getVideoTrackData(e, t, i);
      let a = t.data;
      if (n.info.requiresAnnexBTransformation) {
        const c = [...Pi(a)].map((l) => a.subarray(l.offset, l.offset + l.length));
        if (c.length === 0)
          throw new Error("Failed to transform packet data. Make sure all packets are provided in Annex B format, as specified in ITU-T-REC-H.264 and ITU-T-REC-H.265.");
        a = En(c, 4);
      }
      this.validateTimestamp(n.track, t.timestamp, t.type === "key");
      const o = this.createSampleForTrack(n, a, t.timestamp, t.duration, t.type);
      await this.registerSample(n, o);
    } finally {
      s();
    }
  }
  async addEncodedAudioPacket(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      const n = this.getAudioTrackData(e, t, i);
      let a = t.data;
      if (n.info.requiresAdtsStripping) {
        const u = gt(Ce.tempFromBytes(a));
        if (!u)
          throw new Error("Expected ADTS frame, didn't get one.");
        const d = u.crcCheck === null ? Ji : Et;
        a = a.subarray(d);
      }
      this.validateTimestamp(n.track, t.timestamp, t.type === "key");
      let o = t.timestamp, c = t.duration;
      if (n.info.requiresPcmTransformation) {
        const d = Qe(n.info.decoderConfig.codec).sampleSize * n.info.numberOfChannels;
        if (c = a.byteLength / d / n.info.sampleRate, n.info.expectedNextPcmPacketTimestamp !== null) {
          const f = o - n.info.expectedNextPcmPacketTimestamp;
          if (f < 0.01)
            o = n.info.expectedNextPcmPacketTimestamp;
          else {
            const h = await this.padWithSilence(n, n.info.expectedNextPcmPacketTimestamp, f);
            o = n.info.expectedNextPcmPacketTimestamp + h;
          }
        }
        n.info.expectedNextPcmPacketTimestamp = o + c;
      }
      const l = this.createSampleForTrack(n, a, o, c, t.type);
      await this.registerSample(n, l);
    } finally {
      s();
    }
  }
  async padWithSilence(e, t, i) {
    const s = re(i, e.timescale);
    if (i = s / e.timescale, s > 0) {
      const { sampleSize: n, silentValue: a } = Qe(e.info.decoderConfig.codec), o = s * e.info.numberOfChannels, c = new Uint8Array(n * o).fill(a), l = this.createSampleForTrack(e, new Uint8Array(c.buffer), t, i, "key");
      await this.registerSample(e, l);
    }
    return i;
  }
  async addSubtitleCue(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      const n = this.getSubtitleTrackData(e, i);
      this.validateTimestamp(n.track, t.timestamp, !0), e.source._codec === "webvtt" && (n.cueQueue.push(t), await this.processWebVTTCues(n, t.timestamp));
    } finally {
      s();
    }
  }
  async processWebVTTCues(e, t) {
    for (; e.cueQueue.length > 0; ) {
      const i = /* @__PURE__ */ new Set([]);
      for (const l of e.cueQueue)
        p(l.timestamp <= t), p(e.lastCueEndTimestamp <= l.timestamp + l.duration), i.add(Math.max(l.timestamp, e.lastCueEndTimestamp)), i.add(l.timestamp + l.duration);
      const s = [...i].sort((l, u) => l - u), n = s[0], a = s[1] ?? n;
      if (t < a)
        break;
      if (e.lastCueEndTimestamp < n) {
        this.auxWriter.seek(0);
        const l = Sh();
        this.auxBoxWriter.writeBox(l);
        const u = this.auxTarget._getSlice(0, this.auxWriter.getPos()), d = this.createSampleForTrack(e, u, e.lastCueEndTimestamp, n - e.lastCueEndTimestamp, "key");
        await this.registerSample(e, d), e.lastCueEndTimestamp = n;
      }
      this.auxWriter.seek(0);
      for (let l = 0; l < e.cueQueue.length; l++) {
        const u = e.cueQueue[l];
        if (u.timestamp >= a)
          break;
        qr.lastIndex = 0;
        const d = qr.test(u.text), f = u.timestamp + u.duration;
        let h = e.cueToSourceId.get(u);
        if (h === void 0 && a < f && (h = e.nextSourceId++, e.cueToSourceId.set(u, h)), u.notes) {
          const m = xh(u.notes);
          this.auxBoxWriter.writeBox(m);
        }
        const g = Ah(u.text, d ? n : null, u.identifier ?? null, u.settings ?? null, h ?? null);
        this.auxBoxWriter.writeBox(g), f === a && e.cueQueue.splice(l--, 1);
      }
      const o = this.auxTarget._getSlice(0, this.auxWriter.getPos()), c = this.createSampleForTrack(e, o, n, a - n, "key");
      await this.registerSample(e, c), e.lastCueEndTimestamp = a;
    }
  }
  createSampleForTrack(e, t, i, s, n) {
    return {
      timestamp: i,
      decodeTimestamp: i,
      // This may be refined later
      duration: s,
      data: t,
      size: t.byteLength,
      type: n,
      timescaleUnitsToNextSample: re(s, e.timescale)
      // Will be refined
    };
  }
  processTimestamps(e, t) {
    if (e.timestampProcessingQueue.length === 0)
      return;
    if (e.type === "audio" && e.info.requiresPcmTransformation) {
      this.isFragmented || (e.startTimestampOffset ??= e.timestampProcessingQueue[0].timestamp);
      let s = 0;
      for (let n = 0; n < e.timestampProcessingQueue.length; n++) {
        const a = e.timestampProcessingQueue[n], o = re(a.duration, e.timescale);
        s += o;
      }
      if (e.timeToSampleTable.length === 0)
        e.timeToSampleTable.push({
          sampleCount: s,
          sampleDelta: 1
        });
      else {
        const n = ne(e.timeToSampleTable);
        n.sampleCount += s;
      }
      e.timestampProcessingQueue.length = 0;
      return;
    }
    const i = e.timestampProcessingQueue.map((s) => s.timestamp).sort((s, n) => s - n);
    this.isFragmented || (e.startTimestampOffset ??= i[0]);
    for (let s = 0; s < e.timestampProcessingQueue.length; s++) {
      const n = e.timestampProcessingQueue[s];
      n.decodeTimestamp = i[s];
      const a = re(n.timestamp - n.decodeTimestamp, e.timescale), o = re(n.duration, e.timescale);
      if (e.lastTimescaleUnits !== null) {
        p(e.lastSample);
        const c = re(n.decodeTimestamp, e.timescale, !1), l = Math.round(c - e.lastTimescaleUnits);
        if (p(l >= 0), e.lastTimescaleUnits += l, e.lastSample.timescaleUnitsToNextSample = l, !this.isFragmented) {
          let u = ne(e.timeToSampleTable);
          if (p(u), u.sampleCount === 1) {
            u.sampleDelta = l;
            const f = e.timeToSampleTable[e.timeToSampleTable.length - 2];
            f && f.sampleDelta === l && (f.sampleCount++, e.timeToSampleTable.pop(), u = f);
          } else u.sampleDelta !== l && (u.sampleCount--, e.timeToSampleTable.push(u = {
            sampleCount: 1,
            sampleDelta: l
          }));
          u.sampleDelta === o ? u.sampleCount++ : e.timeToSampleTable.push({
            sampleCount: 1,
            sampleDelta: o
          });
          const d = ne(e.compositionTimeOffsetTable);
          p(d), d.sampleCompositionTimeOffset === a ? d.sampleCount++ : e.compositionTimeOffsetTable.push({
            sampleCount: 1,
            sampleCompositionTimeOffset: a
          });
        }
      } else
        e.lastTimescaleUnits = re(n.decodeTimestamp, e.timescale, !1), this.isFragmented || (e.timeToSampleTable.push({
          sampleCount: 1,
          sampleDelta: o
        }), e.compositionTimeOffsetTable.push({
          sampleCount: 1,
          sampleCompositionTimeOffset: a
        }));
      e.lastSample = n;
    }
    if (e.timestampProcessingQueue.length = 0, p(e.lastSample), p(e.lastTimescaleUnits !== null), t !== void 0 && e.lastSample.timescaleUnitsToNextSample === 0) {
      p(t.type === "key");
      const s = re(t.timestamp, e.timescale, !1), n = Math.round(s - e.lastTimescaleUnits);
      e.lastSample.timescaleUnitsToNextSample = n;
    }
  }
  async registerSample(e, t) {
    t.type === "key" && this.processTimestamps(e, t), e.timestampProcessingQueue.push(t), this.isFragmented ? (e.sampleQueue.push(t), await this.interleaveSamples()) : this.fastStart === "reserve" ? await this.registerSampleFastStartReserve(e, t) : await this.addSampleToTrack(e, t);
  }
  async addSampleToTrack(e, t) {
    if (!this.isFragmented && (e.samples.push(t), this.fastStart === "reserve")) {
      const s = e.track.metadata.maximumPacketCount;
      if (p(s !== void 0), e.samples.length > s)
        throw new Error(`Track #${e.track.id} has already reached the maximum packet count (${s}). Either add less packets or increase the maximum packet count.`);
    }
    let i = !1;
    if (!e.currentChunk)
      i = !0;
    else {
      e.currentChunk.startTimestamp = Math.min(e.currentChunk.startTimestamp, t.timestamp);
      const s = t.timestamp - e.currentChunk.startTimestamp;
      if (this.isFragmented) {
        const n = this.trackDatas.every((a) => {
          if (e === a)
            return t.type === "key";
          const o = a.sampleQueue[0];
          return o ? o.type === "key" : a.closed;
        });
        s >= this.minimumFragmentDuration && n && t.timestamp > this.maxWrittenTimestamp && (i = !0, await this.finalizeFragment());
      } else
        i = s >= 0.5;
    }
    i && (e.currentChunk && await this.finalizeCurrentChunk(e), e.currentChunk = {
      startTimestamp: t.timestamp,
      samples: [],
      offset: null,
      moofOffset: null,
      trafIndex: null
    }), p(e.currentChunk), e.currentChunk.samples.push(t), this.isFragmented && (this.maxWrittenTimestamp = Math.max(this.maxWrittenTimestamp, t.timestamp), this.maxWrittenEndTimestamp = Math.max(this.maxWrittenEndTimestamp, t.timestamp + t.duration), this.minWrittenTimestamp = Math.min(this.minWrittenTimestamp, t.timestamp));
  }
  async finalizeCurrentChunk(e) {
    if (p(!this.isFragmented), p(this.writer), !e.currentChunk)
      return;
    e.finalizedChunks.push(e.currentChunk), this.finalizedChunks.push(e.currentChunk);
    let t = e.currentChunk.samples.length;
    if (e.type === "audio" && e.info.requiresPcmTransformation && (t = e.currentChunk.samples.reduce((i, s) => i + re(s.duration, e.timescale), 0)), (e.compactlyCodedChunkTable.length === 0 || ne(e.compactlyCodedChunkTable).samplesPerChunk !== t) && e.compactlyCodedChunkTable.push({
      firstChunk: e.finalizedChunks.length,
      // 1-indexed
      samplesPerChunk: t
    }), this.fastStart === "in-memory") {
      e.currentChunk.offset = 0;
      return;
    }
    e.currentChunk.offset = this.writer.getPos();
    for (const i of e.currentChunk.samples)
      p(i.data), this.writer.write(i.data), i.data = null;
    await this.writer.flush();
  }
  async interleaveSamples(e = !1) {
    if (p(this.isFragmented), !(!e && !this.allTracksAreKnown()))
      e: for (; ; ) {
        let t = null, i = 1 / 0;
        for (const n of this.trackDatas) {
          if (!e && n.sampleQueue.length === 0 && !n.closed)
            break e;
          n.sampleQueue.length > 0 && n.sampleQueue[0].timestamp < i && (t = n, i = n.sampleQueue[0].timestamp);
        }
        if (!t)
          break;
        const s = t.sampleQueue.shift();
        await this.addSampleToTrack(t, s);
      }
  }
  async finalizeFragment(e = !this.isCmaf) {
    if (p(this.isFragmented), !this.wroteFragmentedHeader) {
      this.wroteFragmentedHeader = !0;
      const h = this.initBoxWriter ?? this.boxWriter;
      p(h), this.formatOptions.onMoov && h.writer.startTrackingWrites(), this.ensureOneEnabledTrack();
      const g = Di(this);
      if (h.writeBox(g), this.formatOptions.onMoov) {
        const { data: m, start: w } = h.writer.stopTrackingWrites();
        this.formatOptions.onMoov(m, w);
      }
      if (this.isCmaf) {
        p(this.initWriter), await this.initWriter.flush(), await this.initWriter.finalize(), this.writer = await this.output._getRootWriter(!0), this.boxWriter = new yr(this.writer);
        const m = this.boxWriter.measureBox(to()), w = this.boxWriter.measureBox(io(this, 0));
        this.segmentHeaderSize = m + w, this.writer.seek(this.segmentHeaderSize);
      }
    }
    p(this.writer), p(this.boxWriter);
    const t = this.trackDatas.filter((h) => h.currentChunk);
    if (t.length === 0) {
      e && await this.writer.flush();
      return;
    }
    const i = this.nextFragmentNumber++, s = so(i, t), n = this.writer.getPos(), a = n + this.boxWriter.measureBox(s);
    let o = a + ut, c = 1 / 0;
    for (let h = 0; h < t.length; h++) {
      const g = t[h];
      g.currentChunk.offset = o, g.currentChunk.moofOffset = n, g.currentChunk.trafIndex = h;
      for (const m of g.currentChunk.samples)
        o += m.size;
      c = Math.min(c, g.currentChunk.startTimestamp);
    }
    const l = o - a, u = l >= 2 ** 32;
    if (u)
      for (const h of t)
        h.currentChunk.offset += Vt - ut;
    this.formatOptions.onMoof && this.writer.startTrackingWrites();
    const d = so(i, t);
    if (this.boxWriter.writeBox(d), this.formatOptions.onMoof) {
      const { data: h, start: g } = this.writer.stopTrackingWrites();
      this.formatOptions.onMoof(h, g, c);
    }
    p(this.writer.getPos() === a), this.formatOptions.onMdat && this.writer.startTrackingWrites();
    const f = br(u);
    f.size = l, this.boxWriter.writeBox(f), this.writer.seek(a + (u ? Vt : ut));
    for (const h of t)
      for (const g of h.currentChunk.samples)
        this.writer.write(g.data), g.data = null;
    if (this.formatOptions.onMdat) {
      const { data: h, start: g } = this.writer.stopTrackingWrites();
      this.formatOptions.onMdat(h, g);
    }
    for (const h of t)
      h.finalizedChunks.push(h.currentChunk), this.finalizedChunks.push(h.currentChunk), h.currentChunk = null;
    e && await this.writer.flush();
  }
  async registerSampleFastStartReserve(e, t) {
    this.allTracksAreKnown() ? (this.mdat || await this.createFastStartReserveMdat(), await this.addSampleToTrack(e, t)) : e.sampleQueue.push(t);
  }
  async createFastStartReserveMdat() {
    p(this.writer), p(this.boxWriter), this.ensureOneEnabledTrack();
    const e = Di(this), i = this.boxWriter.measureBox(e) + this.computeSampleTableSizeUpperBound() + 4096;
    p(this.ftypSize !== null), this.writer.seek(this.ftypSize + i), this.formatOptions.onMdat && this.writer.startTrackingWrites(), this.mdat = br(!0), this.boxWriter.writeBox(this.mdat);
    for (const s of this.trackDatas) {
      for (const n of s.sampleQueue)
        await this.addSampleToTrack(s, n);
      s.sampleQueue.length = 0;
    }
  }
  computeSampleTableSizeUpperBound() {
    p(this.fastStart === "reserve");
    let e = 0;
    for (const t of this.trackDatas) {
      const i = t.track.metadata.maximumPacketCount;
      p(i !== void 0), e += 8 * Math.ceil(2 / 3 * i), e += 4 * i, e += 8 * Math.ceil(2 / 3 * i), e += 12 * Math.ceil(2 / 3 * i), e += 4 * i, e += 8 * i;
    }
    return e;
  }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async onTrackClose(e) {
    const t = await this.mutex.acquire(), i = this.trackDatas.find((s) => s.track === e);
    i && (i.closed = !0, i.type === "subtitle" && e.source._codec === "webvtt" && await this.processWebVTTCues(i, 1 / 0), this.processTimestamps(i)), this.allTracksAreKnown() && this.allTracksKnown.resolve(), this.isFragmented && await this.interleaveSamples(), t();
  }
  ensureOneEnabledTrack() {
    for (const e of ["video", "audio", "subtitle"]) {
      const t = this.trackDatas.filter((s) => s.type === e);
      if (t.length === 0)
        continue;
      if (!t.some((s) => s.track.metadata.disposition?.default !== !1)) {
        const s = t[0];
        s.track.metadata.disposition = {
          ...s.track.metadata.disposition,
          default: !0
        };
      }
    }
  }
  /** Internal function for external callers who want to full control fragment boundaries. */
  async forceFragmentFinalization() {
    p(this.isFragmented);
    const e = await this.mutex.acquire();
    try {
      for (const t of this.trackDatas)
        t.type === "subtitle" && t.track.source._codec === "webvtt" && await this.processWebVTTCues(t, 1 / 0), this.processTimestamps(t);
      await this.interleaveSamples(!0), await this.finalizeFragment();
    } finally {
      e();
    }
  }
  /** Finalizes the file, making it ready for use. Must be called after all video and audio chunks have been added. */
  async finalize() {
    const e = await this.mutex.acquire();
    this.allTracksKnown.resolve(), this.ensureOneEnabledTrack(), !this.mdat && this.fastStart === "reserve" && await this.createFastStartReserveMdat();
    for (const t of this.trackDatas)
      t.closed = !0, t.type === "subtitle" && t.track.source._codec === "webvtt" && await this.processWebVTTCues(t, 1 / 0), this.processTimestamps(t);
    if (this.isFragmented)
      await this.interleaveSamples(!0), await this.finalizeFragment(!1);
    else
      for (const t of this.trackDatas)
        if (await this.finalizeCurrentChunk(t), t.startTimestampOffset !== null)
          for (let i = 0; i < t.samples.length; i++) {
            const s = t.samples[i];
            s.timestamp -= t.startTimestampOffset, s.decodeTimestamp -= t.startTimestampOffset;
          }
    if (p(this.writer), p(this.boxWriter), this.fastStart === "in-memory") {
      this.mdat = br(!1);
      let t;
      for (let s = 0; s < 2; s++) {
        const n = Di(this), a = this.boxWriter.measureBox(n);
        t = this.boxWriter.measureBox(this.mdat);
        let o = this.writer.getPos() + a + t;
        for (const c of this.finalizedChunks) {
          c.offset = o;
          for (const { data: l } of c.samples)
            p(l), o += l.byteLength, t += l.byteLength;
        }
        if (o < 2 ** 32)
          break;
        t >= 2 ** 32 && (this.mdat.largeSize = !0);
      }
      this.formatOptions.onMoov && this.writer.startTrackingWrites();
      const i = Di(this);
      if (this.boxWriter.writeBox(i), this.formatOptions.onMoov) {
        const { data: s, start: n } = this.writer.stopTrackingWrites();
        this.formatOptions.onMoov(s, n);
      }
      this.formatOptions.onMdat && this.writer.startTrackingWrites(), this.mdat.size = t, this.boxWriter.writeBox(this.mdat);
      for (const s of this.finalizedChunks)
        for (const n of s.samples)
          p(n.data), this.writer.write(n.data), n.data = null;
      if (this.formatOptions.onMdat) {
        const { data: s, start: n } = this.writer.stopTrackingWrites();
        this.formatOptions.onMdat(s, n);
      }
    } else if (this.isFragmented)
      if (this.isCmaf) {
        const t = this.segmentHeaderSize !== null ? this.writer.getPos() - this.segmentHeaderSize : 0;
        this.writer.seek(0), this.boxWriter.writeBox(to()), this.boxWriter.writeBox(io(this, t));
      } else {
        const t = this.writer.getPos(), i = bh(this.trackDatas);
        this.boxWriter.writeBox(i);
        const s = this.writer.getPos() - t;
        this.writer.seek(this.writer.getPos() - 4), this.boxWriter.writeU32(s);
      }
    else {
      p(this.mdat);
      const t = this.boxWriter.offsets.get(this.mdat);
      p(t !== void 0);
      const i = this.writer.getPos() - t;
      if (this.mdat.size = i, this.mdat.largeSize = i >= 2 ** 32, this.boxWriter.patchBox(this.mdat), this.formatOptions.onMdat) {
        const { data: n, start: a } = this.writer.stopTrackingWrites();
        this.formatOptions.onMdat(n, a);
      }
      const s = Di(this);
      if (this.fastStart === "reserve") {
        p(this.ftypSize !== null), this.writer.seek(this.ftypSize), this.formatOptions.onMoov && this.writer.startTrackingWrites(), this.boxWriter.writeBox(s);
        const n = this.boxWriter.offsets.get(this.mdat) - this.writer.getPos();
        this.boxWriter.writeBox(Pf(n));
      } else
        this.formatOptions.onMoov && this.writer.startTrackingWrites(), this.boxWriter.writeBox(s);
      if (this.formatOptions.onMoov) {
        const { data: n, start: a } = this.writer.stopTrackingWrites();
        this.formatOptions.onMoov(n, a);
      }
    }
    e();
  }
}
const Vh = -32768, Wh = 2 ** 15 - 1, oo = "Mediabunny", co = 6, lo = 5, Lh = {
  video: 1,
  audio: 2,
  subtitle: 17
};
class qh extends kt {
  constructor(e, t) {
    super(e), this.trackDatas = [], this.allTracksKnown = ee(), this.segment = null, this.segmentInfo = null, this.seekHead = null, this.tracksElement = null, this.tagsElement = null, this.attachmentsElement = null, this.segmentDuration = null, this.cues = null, this.currentCluster = null, this.currentClusterStartMsTimestamp = null, this.currentClusterMaxMsTimestamp = null, this.trackDatasInCurrentCluster = /* @__PURE__ */ new Map(), this.startTimestamp = 1 / 0, this.endTimestamp = -1 / 0, this.format = t;
  }
  async start() {
    const e = await this.mutex.acquire();
    this.writer = await this.output._getRootWriter(!!this.format._options.appendOnly), this.ebmlWriter = new Bu(this.writer), this.writeEBMLHeader(), this.createSegmentInfo(), this.createCues(), await this.writer.flush();
    for (const t of this.output.tracks)
      t.isVideoTrack() && t.metadata.decoderConfig ? this.getVideoTrackData(t, t.metadata.primingPacket ?? null, { decoderConfig: t.metadata.decoderConfig }) : t.isAudioTrack() && t.metadata.decoderConfig && this.getAudioTrackData(t, t.metadata.primingPacket ?? null, { decoderConfig: t.metadata.decoderConfig });
    e();
  }
  writeEBMLHeader() {
    this.format._options.onEbmlHeader && this.writer.startTrackingWrites();
    const e = { id: P.EBML, data: [
      { id: P.EBMLVersion, data: 1 },
      { id: P.EBMLReadVersion, data: 1 },
      { id: P.EBMLMaxIDLength, data: 4 },
      { id: P.EBMLMaxSizeLength, data: 8 },
      { id: P.DocType, data: this.format instanceof bo ? "webm" : "matroska" },
      { id: P.DocTypeVersion, data: 2 },
      { id: P.DocTypeReadVersion, data: 2 }
    ] };
    if (this.ebmlWriter.writeEBML(e), this.format._options.onEbmlHeader) {
      const { data: t, start: i } = this.writer.stopTrackingWrites();
      this.format._options.onEbmlHeader(t, i);
    }
  }
  /**
   * Creates a SeekHead element which is positioned near the start of the file and allows the media player to seek to
   * relevant sections more easily. Since we don't know the positions of those sections yet, we'll set them later.
   */
  maybeCreateSeekHead(e) {
    if (this.format._options.appendOnly)
      return;
    const t = new Uint8Array([28, 83, 187, 107]), i = new Uint8Array([21, 73, 169, 102]), s = new Uint8Array([22, 84, 174, 107]), n = new Uint8Array([25, 65, 164, 105]), a = new Uint8Array([18, 84, 195, 103]), o = { id: P.SeekHead, data: [
      { id: P.Seek, data: [
        { id: P.SeekID, data: t },
        {
          id: P.SeekPosition,
          size: 5,
          data: e ? this.ebmlWriter.offsets.get(this.cues) - this.segmentDataOffset : 0
        }
      ] },
      { id: P.Seek, data: [
        { id: P.SeekID, data: i },
        {
          id: P.SeekPosition,
          size: 5,
          data: e ? this.ebmlWriter.offsets.get(this.segmentInfo) - this.segmentDataOffset : 0
        }
      ] },
      { id: P.Seek, data: [
        { id: P.SeekID, data: s },
        {
          id: P.SeekPosition,
          size: 5,
          data: e ? this.ebmlWriter.offsets.get(this.tracksElement) - this.segmentDataOffset : 0
        }
      ] },
      this.attachmentsElement ? { id: P.Seek, data: [
        { id: P.SeekID, data: n },
        {
          id: P.SeekPosition,
          size: 5,
          data: e ? this.ebmlWriter.offsets.get(this.attachmentsElement) - this.segmentDataOffset : 0
        }
      ] } : null,
      this.tagsElement ? { id: P.Seek, data: [
        { id: P.SeekID, data: a },
        {
          id: P.SeekPosition,
          size: 5,
          data: e ? this.ebmlWriter.offsets.get(this.tagsElement) - this.segmentDataOffset : 0
        }
      ] } : null
    ] };
    this.seekHead = o;
  }
  createSegmentInfo() {
    const e = { id: P.Duration, data: new Zs(0) };
    this.segmentDuration = e;
    const t = { id: P.Info, data: [
      { id: P.TimestampScale, data: 1e6 },
      { id: P.MuxingApp, data: oo },
      { id: P.WritingApp, data: oo },
      this.format._options.appendOnly ? null : e
    ] };
    this.segmentInfo = t;
  }
  createTracks() {
    const e = { id: P.Tracks, data: [] };
    this.tracksElement = e;
    for (const t of this.trackDatas) {
      const i = Ee[t.track.source._codec];
      p(i);
      let s = 0;
      if (t.type === "audio" && t.track.source._codec === "opus") {
        s = 1e6 * 80;
        const n = t.info.decoderConfig.description;
        if (n) {
          const a = te(n), o = Jr(a);
          s = Math.round(1e9 * (o.preSkip / xi));
        }
      }
      e.data.push({ id: P.TrackEntry, data: [
        { id: P.TrackNumber, data: t.track.id },
        { id: P.TrackUID, data: t.track.id },
        { id: P.TrackType, data: Lh[t.type] },
        t.track.metadata.disposition?.default === !1 ? { id: P.FlagDefault, data: 0 } : null,
        t.track.metadata.disposition?.forced ? { id: P.FlagForced, data: 1 } : null,
        t.track.metadata.disposition?.hearingImpaired ? { id: P.FlagHearingImpaired, data: 1 } : null,
        t.track.metadata.disposition?.visuallyImpaired ? { id: P.FlagVisualImpaired, data: 1 } : null,
        t.track.metadata.disposition?.original ? { id: P.FlagOriginal, data: 1 } : null,
        t.track.metadata.disposition?.commentary ? { id: P.FlagCommentary, data: 1 } : null,
        { id: P.FlagLacing, data: 0 },
        { id: P.Language, data: t.track.metadata.languageCode ?? ke },
        { id: P.CodecID, data: i },
        t.codecPrivate ? { id: P.CodecPrivate, data: te(t.codecPrivate) } : null,
        { id: P.CodecDelay, data: 0 },
        { id: P.SeekPreRoll, data: s },
        t.track.metadata.name !== void 0 ? { id: P.Name, data: new St(t.track.metadata.name) } : null,
        t.type === "video" ? this.videoSpecificTrackInfo(t) : null,
        t.type === "audio" ? this.audioSpecificTrackInfo(t) : null,
        t.type === "subtitle" ? this.subtitleSpecificTrackInfo(t) : null
      ] });
    }
  }
  videoSpecificTrackInfo(e) {
    const { frameRate: t, rotation: i } = e.track.metadata, s = [
      t ? {
        id: P.DefaultDuration,
        data: 1e9 / t
      } : null
    ], n = i ? gi(-i) : 0, a = !!e.info.aspectRatio && e.info.aspectRatio.num * e.info.height !== e.info.aspectRatio.den * e.info.width, o = e.info.decoderConfig.colorSpace, c = { id: P.Video, data: [
      { id: P.PixelWidth, data: e.info.width },
      { id: P.PixelHeight, data: e.info.height },
      a ? { id: P.DisplayWidth, data: e.info.aspectRatio.num } : null,
      a ? { id: P.DisplayHeight, data: e.info.aspectRatio.den } : null,
      a ? { id: P.DisplayUnit, data: 3 } : null,
      // 3 = display aspect ratio
      e.info.alphaMode ? { id: P.AlphaMode, data: 1 } : null,
      Ao(o) ? {
        id: P.Colour,
        data: [
          {
            id: P.MatrixCoefficients,
            data: Xt[o.matrix]
          },
          {
            id: P.TransferCharacteristics,
            data: Gt[o.transfer]
          },
          {
            id: P.Primaries,
            data: $t[o.primaries]
          },
          {
            id: P.Range,
            data: o.fullRange ? 2 : 1
          }
        ]
      } : null,
      n ? {
        id: P.Projection,
        data: [
          {
            id: P.ProjectionType,
            data: 0
            // rectangular
          },
          {
            id: P.ProjectionPoseRoll,
            data: new Ys((n + 180) % 360 - 180)
            // [0, 270] -> [-180, 90]
          }
        ]
      } : null
    ] };
    return s.push(c), s;
  }
  audioSpecificTrackInfo(e) {
    const t = ge.includes(e.track.source._codec) ? Qe(e.track.source._codec) : null;
    return [
      { id: P.Audio, data: [
        { id: P.SamplingFrequency, data: new Ys(e.info.sampleRate) },
        { id: P.Channels, data: e.info.numberOfChannels },
        t ? { id: P.BitDepth, data: 8 * t.sampleSize } : null
      ] }
    ];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subtitleSpecificTrackInfo(e) {
    return [];
  }
  maybeCreateTags() {
    const e = [], t = (n, a) => {
      e.push({ id: P.SimpleTag, data: [
        { id: P.TagName, data: new St(n) },
        typeof a == "string" ? { id: P.TagString, data: new St(a) } : { id: P.TagBinary, data: a }
      ] });
    }, i = this.output._metadataTags, s = /* @__PURE__ */ new Set();
    for (const { key: n, value: a } of Ti(i))
      switch (n) {
        case "title":
          t("TITLE", a), s.add("TITLE");
          break;
        case "description":
          t("DESCRIPTION", a), s.add("DESCRIPTION");
          break;
        case "artist":
          t("ARTIST", a), s.add("ARTIST");
          break;
        case "album":
          t("ALBUM", a), s.add("ALBUM");
          break;
        case "albumArtist":
          t("ALBUM_ARTIST", a), s.add("ALBUM_ARTIST");
          break;
        case "genre":
          t("GENRE", a), s.add("GENRE");
          break;
        case "comment":
          t("COMMENT", a), s.add("COMMENT");
          break;
        case "lyrics":
          t("LYRICS", a), s.add("LYRICS");
          break;
        case "date":
          t("DATE", a.toISOString().slice(0, 10)), s.add("DATE");
          break;
        case "trackNumber":
          {
            const o = i.tracksTotal !== void 0 ? `${a}/${i.tracksTotal}` : a.toString();
            t("PART_NUMBER", o), s.add("PART_NUMBER");
          }
          break;
        case "discNumber":
          {
            const o = i.discsTotal !== void 0 ? `${a}/${i.discsTotal}` : a.toString();
            t("DISC", o), s.add("DISC");
          }
          break;
        case "tracksTotal":
        case "discsTotal":
          break;
        case "images":
        case "raw":
          break;
        default:
          pe(n);
      }
    if (i.raw)
      for (const n in i.raw) {
        const a = i.raw[n];
        a == null || s.has(n) || (typeof a == "string" || a instanceof Uint8Array) && t(n, a);
      }
    e.length !== 0 && (this.tagsElement = {
      id: P.Tags,
      data: [{ id: P.Tag, data: [
        { id: P.Targets, data: [
          { id: P.TargetTypeValue, data: 50 },
          { id: P.TargetType, data: "MOVIE" }
        ] },
        ...e
      ] }]
    });
  }
  maybeCreateAttachments() {
    const e = this.output._metadataTags, t = [], i = /* @__PURE__ */ new Set(), s = e.images ?? [];
    for (const n of s) {
      let a = n.name;
      a === void 0 && (a = (n.kind === "coverFront" ? "cover" : n.kind === "coverBack" ? "back" : "image") + (Dl(n.mimeType) ?? ""));
      let o;
      for (; ; ) {
        o = 0n;
        for (let c = 0; c < 8; c++)
          o <<= 8n, o |= BigInt(Math.floor(Math.random() * 256));
        if (o !== 0n && !i.has(o))
          break;
      }
      i.add(o), t.push({
        id: P.AttachedFile,
        data: [
          n.description !== void 0 ? { id: P.FileDescription, data: new St(n.description) } : null,
          { id: P.FileName, data: new St(a) },
          { id: P.FileMediaType, data: n.mimeType },
          { id: P.FileData, data: n.data },
          { id: P.FileUID, data: o }
        ]
      });
    }
    for (const [n, a] of Object.entries(e.raw ?? {}))
      !(a instanceof An) || !/^\d+$/.test(n) || s.find((c) => c.mimeType === a.mimeType && Po(c.data, a.data)) || t.push({
        id: P.AttachedFile,
        data: [
          a.description !== void 0 ? { id: P.FileDescription, data: new St(a.description) } : null,
          { id: P.FileName, data: new St(a.name ?? "") },
          { id: P.FileMediaType, data: a.mimeType ?? "" },
          { id: P.FileData, data: a.data },
          { id: P.FileUID, data: BigInt(n) }
        ]
      });
    t.length !== 0 && (this.attachmentsElement = { id: P.Attachments, data: t });
  }
  createSegment() {
    this.createTracks(), this.maybeCreateTags(), this.maybeCreateAttachments(), this.maybeCreateSeekHead(!1);
    const e = {
      id: P.Segment,
      size: this.format._options.appendOnly ? -1 : co,
      data: [
        this.seekHead,
        // null if append-only
        this.segmentInfo,
        this.tracksElement,
        // Matroska spec says put this at the end of the file, but I think placing it before the first cluster
        // makes more sense, and FFmpeg agrees (argumentum ad ffmpegum fallacy)
        this.attachmentsElement,
        this.tagsElement
      ]
    };
    if (this.segment = e, this.format._options.onSegmentHeader && this.writer.startTrackingWrites(), this.ebmlWriter.writeEBML(e), this.format._options.onSegmentHeader) {
      const { data: t, start: i } = this.writer.stopTrackingWrites();
      this.format._options.onSegmentHeader(t, i);
    }
  }
  createCues() {
    this.cues = { id: P.Cues, data: [] };
  }
  get segmentDataOffset() {
    return p(this.segment), this.ebmlWriter.dataOffsets.get(this.segment);
  }
  allTracksAreKnown() {
    for (const e of this.output.tracks)
      if (!e.source._closed && !this.trackDatas.some((t) => t.track === e))
        return !1;
    return !0;
  }
  async getMimeType() {
    await this.allTracksKnown.promise;
    const e = this.trackDatas.map((t) => t.type === "video" || t.type === "audio" ? t.info.decoderConfig.codec : {
      webvtt: "wvtt"
    }[t.track.source._codec]);
    return uc({
      isWebM: this.format instanceof bo,
      hasVideo: this.trackDatas.some((t) => t.type === "video"),
      hasAudio: this.trackDatas.some((t) => t.type === "audio"),
      codecStrings: e
    });
  }
  getVideoTrackData(e, t, i) {
    const s = this.trackDatas.find((l) => l.track === e);
    if (s)
      return s;
    lr(i, e.source._codec), p(i), p(i.decoderConfig), p(i.decoderConfig.codedWidth !== void 0), p(i.decoderConfig.codedHeight !== void 0);
    const n = i.decoderConfig.displayAspectWidth, a = i.decoderConfig.displayAspectHeight, o = n === void 0 || a === void 0 ? null : Qi({
      num: n,
      den: a
    }), c = {
      track: e,
      type: "video",
      info: {
        width: i.decoderConfig.codedWidth,
        height: i.decoderConfig.codedHeight,
        aspectRatio: o,
        decoderConfig: i.decoderConfig,
        alphaMode: t ? !!t.sideData.alpha : null
      },
      chunkQueue: [],
      lastWrittenMsTimestamp: null,
      codecPrivate: i.decoderConfig.description ?? null,
      closed: !1
    };
    return e.source._codec === "vp9" ? c.codecPrivate = new Uint8Array(jl(c.info.decoderConfig.codec)) : e.source._codec === "av1" ? c.codecPrivate = new Uint8Array(Bo(c.info.decoderConfig.codec)) : e.source._codec === "prores" && (c.codecPrivate = Y.encode(i.decoderConfig.codec)), this.trackDatas.push(c), this.trackDatas.sort((l, u) => l.track.id - u.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), c;
  }
  getAudioTrackData(e, t, i) {
    const s = this.trackDatas.find((c) => c.track === e);
    if (s)
      return s;
    $e(i, e.source._codec), p(i), p(i.decoderConfig);
    const n = { ...i.decoderConfig };
    let a = !1;
    if (e.source._codec === "aac" && !n.description) {
      if (!t)
        throw new Error("No AAC description provided; you must therefore provide a priming packet.");
      const c = gt(Ce.tempFromBytes(t.data));
      if (!c)
        throw new Error("Couldn't parse ADTS header from the AAC packet. Make sure the packets are in ADTS format (as specified in ISO 13818-7) when not providing a description, or provide a description (must be an AudioSpecificConfig as specified in ISO 14496-3) and ensure the packets are raw AAC data.");
      const l = Ft[c.samplingFrequencyIndex], u = Ai[c.channelConfiguration];
      if (l === void 0 || u === void 0)
        throw new Error("Invalid ADTS frame header.");
      n.description = xn({
        objectType: c.objectType,
        sampleRate: l,
        numberOfChannels: u
      }), a = !0;
    }
    const o = {
      track: e,
      type: "audio",
      info: {
        numberOfChannels: i.decoderConfig.numberOfChannels,
        sampleRate: i.decoderConfig.sampleRate,
        decoderConfig: n,
        requiresAdtsStripping: a
      },
      chunkQueue: [],
      lastWrittenMsTimestamp: null,
      codecPrivate: n.description ?? null,
      closed: !1
    };
    return this.trackDatas.push(o), this.trackDatas.sort((c, l) => c.track.id - l.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), o;
  }
  getSubtitleTrackData(e, t) {
    const i = this.trackDatas.find((n) => n.track === e);
    if (i)
      return i;
    zo(t), p(t), p(t.config);
    const s = {
      track: e,
      type: "subtitle",
      info: {
        config: t.config
      },
      chunkQueue: [],
      lastWrittenMsTimestamp: null,
      codecPrivate: Y.encode(t.config.description),
      closed: !1
    };
    return this.trackDatas.push(s), this.trackDatas.sort((n, a) => n.track.id - a.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), s;
  }
  async addEncodedVideoPacket(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      const n = this.getVideoTrackData(e, t, i);
      n.info.alphaMode ??= !!t.sideData.alpha;
      let a = t.data;
      if (e.source._codec === "prores") {
        if (a.byteLength < 8)
          throw new Error("ProRes packet too small, expected at least 8 bytes.");
        a = a.subarray(8);
      }
      const o = t.type === "key";
      this.validateTimestamp(n.track, t.timestamp, o);
      let c = t.timestamp, l = t.duration;
      e.metadata.frameRate !== void 0 && (c = wi(c, e.metadata.frameRate), l = wi(l, e.metadata.frameRate));
      const u = n.info.alphaMode ? t.sideData.alpha ?? null : null, d = this.createInternalChunk(a, c, l, t.type, u);
      e.source._codec === "vp9" && this.fixVP9ColorSpace(n, d), n.chunkQueue.push(d), await this.interleaveChunks();
    } finally {
      s();
    }
  }
  async addEncodedAudioPacket(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      const n = this.getAudioTrackData(e, t, i);
      let a = t.data;
      if (n.info.requiresAdtsStripping) {
        const l = gt(Ce.tempFromBytes(a));
        if (!l)
          throw new Error("Expected ADTS frame, didn't get one.");
        const u = l.crcCheck === null ? Ji : Et;
        a = a.subarray(u);
      }
      const o = t.type === "key";
      this.validateTimestamp(n.track, t.timestamp, o);
      const c = this.createInternalChunk(a, t.timestamp, t.duration, t.type);
      n.chunkQueue.push(c), await this.interleaveChunks();
    } finally {
      s();
    }
  }
  async addSubtitleCue(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      const n = this.getSubtitleTrackData(e, i);
      this.validateTimestamp(n.track, t.timestamp, !0);
      let a = t.text;
      const o = Math.round(t.timestamp * 1e3);
      qr.lastIndex = 0, a = a.replace(qr, (d) => {
        const h = pn(d.slice(1, -1)) - o;
        return `<${rl(h)}>`;
      });
      const c = Y.encode(a), l = `${t.settings ?? ""}
${t.identifier ?? ""}
${t.notes ?? ""}`, u = this.createInternalChunk(c, t.timestamp, t.duration, "key", l.trim() ? Y.encode(l) : null);
      n.chunkQueue.push(u), await this.interleaveChunks();
    } finally {
      s();
    }
  }
  async interleaveChunks(e = !1) {
    if (!(!e && !this.allTracksAreKnown())) {
      e: for (; ; ) {
        let t = null, i = 1 / 0;
        for (const n of this.trackDatas) {
          if (!e && n.chunkQueue.length === 0 && !n.closed)
            break e;
          n.chunkQueue.length > 0 && n.chunkQueue[0].timestamp < i && (t = n, i = n.chunkQueue[0].timestamp);
        }
        if (!t)
          break;
        const s = t.chunkQueue.shift();
        this.writeBlock(t, s);
      }
      e || await this.writer.flush();
    }
  }
  /**
   * Due to [a bug in Chromium](https://bugs.chromium.org/p/chromium/issues/detail?id=1377842), VP9 streams often
   * lack color space information. This method patches in that information.
   */
  fixVP9ColorSpace(e, t) {
    if (t.type !== "key" || !e.info.decoderConfig.colorSpace || !e.info.decoderConfig.colorSpace.matrix)
      return;
    const i = new j(t.data);
    i.skipBits(2);
    const s = i.readBits(1), a = (i.readBits(1) << 1) + s;
    if (a === 3 && i.skipBits(1), i.readBits(1) || i.readBits(1) !== 0 || (i.skipBits(2), i.readBits(24) !== 4817730))
      return;
    a >= 2 && i.skipBits(1);
    const u = {
      rgb: 7,
      bt709: 2,
      bt470bg: 1,
      smpte170m: 3
    }[e.info.decoderConfig.colorSpace.matrix];
    Al(t.data, i.pos, i.pos + 3, u);
  }
  /** Converts a read-only external chunk into an internal one for easier use. */
  createInternalChunk(e, t, i, s, n = null) {
    return {
      data: e,
      type: s,
      timestamp: t,
      duration: i,
      additions: n
    };
  }
  /** Writes a block containing media data to the file. */
  writeBlock(e, t) {
    this.segment || this.createSegment();
    const i = Math.round(1e3 * t.timestamp), s = this.trackDatas.every((d) => {
      if (e === d)
        return t.type === "key";
      const f = d.chunkQueue[0];
      return f ? f.type === "key" : d.closed;
    });
    let n = !1;
    if (!this.currentCluster)
      n = !0;
    else {
      p(this.currentClusterStartMsTimestamp !== null), p(this.currentClusterMaxMsTimestamp !== null);
      const d = i - this.currentClusterStartMsTimestamp;
      n = s && i > this.currentClusterMaxMsTimestamp && d >= 1e3 * (this.format._options.minimumClusterDuration ?? 1) || d > Wh;
    }
    n && this.createNewCluster(i);
    const a = i - this.currentClusterStartMsTimestamp;
    if (a < Vh)
      return;
    const o = new Uint8Array(4), c = new DataView(o.buffer);
    c.setUint8(0, 128 | e.track.id), c.setInt16(1, a, !1);
    const l = Math.round(1e3 * t.duration);
    if (!!t.additions || e.type === "subtitle") {
      const d = { id: P.BlockGroup, data: [
        { id: P.Block, data: [
          o,
          t.data
        ] },
        t.type === "delta" ? {
          id: P.ReferenceBlock,
          data: new ac(e.lastWrittenMsTimestamp - i)
        } : null,
        t.additions ? { id: P.BlockAdditions, data: [
          { id: P.BlockMore, data: [
            { id: P.BlockAddID, data: 1 },
            // Some players expect BlockAddID to come first
            { id: P.BlockAdditional, data: t.additions }
          ] }
        ] } : null,
        l > 0 ? { id: P.BlockDuration, data: l } : null
      ] };
      this.ebmlWriter.writeEBML(d);
    } else {
      c.setUint8(3, +(t.type === "key") << 7);
      const d = { id: P.SimpleBlock, data: [
        o,
        t.data
      ] };
      this.ebmlWriter.writeEBML(d);
    }
    this.startTimestamp = Math.min(this.startTimestamp, i), this.endTimestamp = Math.max(this.endTimestamp, i + l), e.lastWrittenMsTimestamp = i, this.trackDatasInCurrentCluster.has(e) || this.trackDatasInCurrentCluster.set(e, {
      firstMsTimestamp: i
    }), this.currentClusterMaxMsTimestamp = Math.max(this.currentClusterMaxMsTimestamp, i);
  }
  /** Creates a new Cluster element to contain media chunks. */
  createNewCluster(e) {
    this.currentCluster && this.finalizeCurrentCluster(), this.format._options.onCluster && this.writer.startTrackingWrites(), this.currentCluster = {
      id: P.Cluster,
      size: this.format._options.appendOnly ? -1 : lo,
      data: [
        { id: P.Timestamp, data: e }
      ]
    }, this.ebmlWriter.writeEBML(this.currentCluster), this.currentClusterStartMsTimestamp = e, this.currentClusterMaxMsTimestamp = e, this.trackDatasInCurrentCluster.clear();
  }
  finalizeCurrentCluster() {
    if (p(this.currentCluster), !this.format._options.appendOnly) {
      const s = this.writer.getPos() - this.ebmlWriter.dataOffsets.get(this.currentCluster), n = this.writer.getPos();
      this.writer.seek(this.ebmlWriter.offsets.get(this.currentCluster) + 4), this.ebmlWriter.writeVarInt(s, lo), this.writer.seek(n);
    }
    if (this.format._options.onCluster) {
      p(this.currentClusterStartMsTimestamp !== null);
      const { data: s, start: n } = this.writer.stopTrackingWrites();
      this.format._options.onCluster(s, n, this.currentClusterStartMsTimestamp / 1e3);
    }
    const e = this.ebmlWriter.offsets.get(this.currentCluster) - this.segmentDataOffset, t = /* @__PURE__ */ new Map();
    for (const [s, { firstMsTimestamp: n }] of this.trackDatasInCurrentCluster)
      t.has(n) || t.set(n, []), t.get(n).push(s);
    const i = [...t.entries()].sort((s, n) => s[0] - n[0]);
    for (const [s, n] of i)
      p(this.cues), this.cues.data.push({ id: P.CuePoint, data: [
        { id: P.CueTime, data: s },
        // Create CueTrackPositions for each track that starts at this timestamp
        ...n.map((a) => ({ id: P.CueTrackPositions, data: [
          { id: P.CueTrack, data: a.track.id },
          { id: P.CueClusterPosition, data: e }
        ] }))
      ] });
  }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async onTrackClose(e) {
    const t = await this.mutex.acquire(), i = this.trackDatas.find((s) => s.track === e);
    i && (i.closed = !0), this.allTracksAreKnown() && this.allTracksKnown.resolve(), await this.interleaveChunks(), t();
  }
  /** Finalizes the file, making it ready for use. Must be called after all media chunks have been added. */
  async finalize() {
    const e = await this.mutex.acquire();
    this.allTracksKnown.resolve();
    for (const t of this.trackDatas)
      t.closed = !0;
    if (this.segment || this.createSegment(), await this.interleaveChunks(!0), this.currentCluster && this.finalizeCurrentCluster(), p(this.cues), this.ebmlWriter.writeEBML(this.cues), !this.format._options.appendOnly) {
      const t = this.writer.getPos() - this.segmentDataOffset;
      this.writer.seek(this.ebmlWriter.offsets.get(this.segment) + 4), this.ebmlWriter.writeVarInt(t, co);
      const i = this.startTimestamp === 1 / 0 ? 0 : this.endTimestamp - this.startTimestamp;
      this.segmentDuration.data = new Zs(i), this.writer.seek(this.ebmlWriter.offsets.get(this.segmentDuration)), this.ebmlWriter.writeEBML(this.segmentDuration), p(this.seekHead), this.writer.seek(this.ebmlWriter.offsets.get(this.seekHead)), this.maybeCreateSeekHead(!0), this.ebmlWriter.writeEBML(this.seekHead);
    }
    e();
  }
}
class Hh {
  constructor(e) {
    this.writer = e, this.helper = new Uint8Array(8), this.helperView = new DataView(this.helper.buffer);
  }
  writeU32(e) {
    this.helperView.setUint32(0, e, !1), this.writer.write(this.helper.subarray(0, 4));
  }
  writeXingFrame(e) {
    const t = this.writer.getPos(), i = 255, s = 224 | e.mpegVersionId << 3 | e.layer << 1;
    let n;
    e.mpegVersionId & 2 ? n = e.mpegVersionId & 1 ? 0 : 1 : n = 1;
    const a = 0, o = 155;
    let c = -1;
    const l = n * 16 * 4 + e.layer * 16;
    for (let w = 0; w < 16; w++) {
      const y = js[l + w];
      if (Ks(n, e.layer, 1e3 * y, e.sampleRate, a) >= o) {
        c = w;
        break;
      }
    }
    if (c === -1)
      throw new Error("No suitable bitrate found.");
    const u = c << 4 | e.frequencyIndex << 2 | a << 1, d = e.channel << 6 | e.modeExtension << 4 | e.copyright << 3 | e.original << 2 | e.emphasis;
    this.helper[0] = i, this.helper[1] = s, this.helper[2] = u, this.helper[3] = d, this.writer.write(this.helper.subarray(0, 4));
    const f = Xr(e.mpegVersionId, e.channel);
    this.writer.seek(t + f), this.writeU32(Gr);
    let h = 0;
    e.frameCount !== null && (h |= Qt.FrameCount), e.fileSize !== null && (h |= Qt.FileSize), e.toc !== null && (h |= Qt.Toc), this.writeU32(h), this.writeU32(e.frameCount ?? 0), this.writeU32(e.fileSize ?? 0), this.writer.write(e.toc ?? new Uint8Array(100));
    const g = js[l + c], m = Ks(n, e.layer, 1e3 * g, e.sampleRate, a);
    this.writer.write(new Uint8Array(t + m - this.writer.getPos()));
  }
}
class jh extends kt {
  constructor(e, t) {
    super(e), this.xingFrameData = null, this.frameCount = 0, this.framePositions = [], this.xingFramePos = null, this.format = t;
  }
  async start() {
    const e = await this.mutex.acquire();
    this.writer = await this.output._getRootWriter(this.format._options.xingHeader === !1), this.mp3Writer = new Hh(this.writer), Gi(this.output._metadataTags) || new Kn(this.writer).writeId3V2Tag(this.output._metadataTags), e();
  }
  async getMimeType() {
    return "audio/mpeg";
  }
  async addEncodedVideoPacket() {
    throw new Error("MP3 does not support video.");
  }
  async addEncodedAudioPacket(e, t) {
    const i = await this.mutex.acquire();
    try {
      const s = this.format._options.xingHeader !== !1;
      if (!this.xingFrameData && s) {
        const n = q(t.data);
        if (n.byteLength < 4)
          throw new Error("Invalid MP3 header in sample.");
        const a = n.getUint32(0, !1), o = Xi(a, null).header;
        if (!o)
          throw new Error("Invalid MP3 header in sample.");
        const c = Xr(o.mpegVersionId, o.channel);
        if (n.byteLength >= c + 4) {
          const l = n.getUint32(c, !1);
          if (l === Gr || l === _n)
            return;
        }
        this.xingFrameData = {
          mpegVersionId: o.mpegVersionId,
          layer: o.layer,
          frequencyIndex: o.frequencyIndex,
          sampleRate: o.sampleRate,
          channel: o.channel,
          modeExtension: o.modeExtension,
          copyright: o.copyright,
          original: o.original,
          emphasis: o.emphasis,
          frameCount: null,
          fileSize: null,
          toc: null
        }, this.xingFramePos = this.writer.getPos(), this.mp3Writer.writeXingFrame(this.xingFrameData), this.frameCount++;
      }
      this.validateTimestamp(e, t.timestamp, t.type === "key"), s && this.framePositions.push(this.writer.getPos()), this.writer.write(t.data), this.frameCount++, await this.writer.flush();
    } finally {
      i();
    }
  }
  async addSubtitleCue() {
    throw new Error("MP3 does not support subtitles.");
  }
  async finalize() {
    const e = await this.mutex.acquire();
    if (!this.xingFrameData && this.format._options.xingHeader === !1)
      throw new Error("Cannot finalize an empty MP3 file: not a single packet was added and the Xing header is disabled, so there's no frame we could write.");
    if (!this.xingFrameData) {
      const s = this.output.tracks[0];
      p(s?.isAudioTrack());
      const n = s.metadata.primingPacket;
      if (n) {
        const a = q(n.data);
        if (a.byteLength < 4)
          throw new Error("Invalid MP3 header in priming packet.");
        const o = a.getUint32(0, !1), c = Xi(o, null).header;
        if (!c)
          throw new Error("Invalid MP3 header in priming packet.");
        this.xingFrameData = {
          mpegVersionId: c.mpegVersionId,
          layer: c.layer,
          frequencyIndex: c.frequencyIndex,
          sampleRate: c.sampleRate,
          channel: c.channel,
          modeExtension: c.modeExtension,
          copyright: c.copyright,
          original: c.original,
          emphasis: c.emphasis,
          frameCount: null,
          fileSize: null,
          toc: null
        };
      } else if (s.metadata.decoderConfig) {
        const { sampleRate: a, numberOfChannels: o } = s.metadata.decoderConfig, c = [3, 2, 0];
        let l = null, u = -1;
        for (let d = 0; d < c.length; d++)
          if (u = Do.indexOf(a << d), u !== -1) {
            l = c[d];
            break;
          }
        if (l === null)
          throw new Error(`${a} Hz is not a valid MP3 sample rate.`);
        this.xingFrameData = {
          mpegVersionId: l,
          layer: 1,
          // Layer III
          frequencyIndex: u,
          sampleRate: a,
          channel: o === 1 ? 3 : 0,
          // 3 = single channel, 0 = stereo
          modeExtension: 0,
          copyright: 0,
          original: 0,
          emphasis: 0,
          frameCount: null,
          fileSize: null,
          toc: null
        };
      } else
        throw new Error("Cannot finalize an empty MP3 file: no packets were added and the track specified neither a decoderConfig nor a primingPacket in its metadata, so there's no telling what the file should look like.");
      this.xingFramePos = this.writer.getPos(), this.mp3Writer.writeXingFrame(this.xingFrameData), this.frameCount++;
    }
    p(this.xingFramePos !== null);
    const i = this.writer.getPos() - this.xingFramePos;
    if (this.writer.seek(this.xingFramePos), this.framePositions.length > 0) {
      const s = new Uint8Array(100);
      for (let n = 0; n < 100; n++) {
        const a = Math.floor(this.framePositions.length * (n / 100)), o = this.framePositions[a] - this.xingFramePos;
        s[n] = 256 * (o / i);
      }
      this.xingFrameData.toc = s;
    }
    if (this.xingFrameData.frameCount = this.frameCount, this.xingFrameData.fileSize = i, this.format._options.onXingFrame && this.writer.startTrackingWrites(), this.mp3Writer.writeXingFrame(this.xingFrameData), this.format._options.onXingFrame) {
      const { data: s, start: n } = this.writer.stopTrackingWrites();
      this.format._options.onXingFrame(s, n);
    }
    e();
  }
}
const Kh = 8192;
class Qh extends kt {
  constructor(e, t) {
    super(e), this.trackDatas = [], this.bosPagesWritten = !1, this.allTracksKnown = ee(), this.pageBytes = new Uint8Array(wc), this.pageView = new DataView(this.pageBytes.buffer), this.format = t;
  }
  async start() {
    const e = await this.mutex.acquire();
    this.writer = await this.output._getRootWriter(!0);
    for (const t of this.output.tracks)
      p(t.isAudioTrack()), t.metadata.decoderConfig && this.getTrackData(t, { decoderConfig: t.metadata.decoderConfig });
    e();
  }
  async getMimeType() {
    return await this.allTracksKnown.promise, gc({
      codecStrings: this.trackDatas.map((e) => e.codecInfo.codec)
    });
  }
  addEncodedVideoPacket() {
    throw new Error("Video tracks are not supported.");
  }
  getTrackData(e, t) {
    const i = this.trackDatas.find((a) => a.track === e);
    if (i)
      return i;
    let s;
    do
      s = Math.floor(2 ** 32 * Math.random());
    while (this.trackDatas.some((a) => a.serialNumber === s));
    p(e.source._codec === "vorbis" || e.source._codec === "opus"), $e(t, e.source._codec), p(t), p(t.decoderConfig);
    const n = {
      track: e,
      serialNumber: s,
      internalSampleRate: e.source._codec === "opus" ? xi : t.decoderConfig.sampleRate,
      codecInfo: {
        codec: e.source._codec,
        vorbisInfo: null,
        opusInfo: null
      },
      vorbisLastBlocksize: null,
      packetQueue: [],
      currentTimestampInSamples: 0,
      pagesWritten: 0,
      currentGranulePosition: 0,
      currentLacingValues: [],
      currentPageData: [],
      currentPageSize: 27,
      currentPageStartsWithFreshPacket: !0,
      currentPageStartTimestampInSamples: 0,
      closed: !1
    };
    return this.queueHeaderPackets(n, t), this.trackDatas.push(n), this.allTracksAreKnown() && this.allTracksKnown.resolve(), n;
  }
  queueHeaderPackets(e, t) {
    if (p(t.decoderConfig), e.track.source._codec === "vorbis") {
      p(t.decoderConfig.description);
      const i = te(t.decoderConfig.description);
      if (i[0] !== 2)
        throw new TypeError("First byte of Vorbis decoder description must be 2.");
      let s = 1;
      const n = () => {
        let m = 0;
        for (; ; ) {
          const w = i[s++];
          if (w === void 0)
            throw new TypeError("Vorbis decoder description is too short.");
          if (m += w, w < 255)
            return m;
        }
      }, a = n(), o = n();
      if (i.length - s <= 0)
        throw new TypeError("Vorbis decoder description is too short.");
      const l = i.subarray(s, s += a);
      s += o;
      const u = i.subarray(s), d = new Uint8Array(7);
      d[0] = 3, d[1] = 118, d[2] = 111, d[3] = 114, d[4] = 98, d[5] = 105, d[6] = 115;
      const f = Gs(d, this.output._metadataTags, !0);
      e.packetQueue.push({
        data: l,
        timestampInSamples: 0,
        durationInSamples: 0,
        forcePageFlush: !0
      }, {
        data: f,
        timestampInSamples: 0,
        durationInSamples: 0,
        forcePageFlush: !1
      }, {
        data: u,
        timestampInSamples: 0,
        durationInSamples: 0,
        forcePageFlush: !0
        // The last header packet must flush the page
      });
      const g = q(l).getUint8(28);
      e.codecInfo.vorbisInfo = {
        blocksizes: [
          1 << (g & 15),
          1 << (g >> 4)
        ],
        modeBlockflags: jo(u).modeBlockflags
      };
    } else if (e.track.source._codec === "opus") {
      if (!t.decoderConfig.description)
        throw new TypeError("For Ogg, Opus decoder description is required.");
      const i = te(t.decoderConfig.description), s = new Uint8Array(8), n = q(s);
      n.setUint32(0, 1332770163, !1), n.setUint32(4, 1415669619, !1);
      const a = Gs(s, this.output._metadataTags, !0);
      e.packetQueue.push({
        data: i,
        timestampInSamples: 0,
        durationInSamples: 0,
        forcePageFlush: !0
      }, {
        data: a,
        timestampInSamples: 0,
        durationInSamples: 0,
        forcePageFlush: !0
        // The last header packet must flush the page
      }), e.codecInfo.opusInfo = {
        preSkip: Jr(i).preSkip
      };
    }
  }
  async addEncodedAudioPacket(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      const n = this.getTrackData(e, i);
      this.validateTimestamp(n.track, t.timestamp, t.type === "key");
      const a = n.currentTimestampInSamples, { durationInSamples: o, vorbisBlockSize: c } = pc(t.data, n.codecInfo, n.vorbisLastBlocksize);
      n.currentTimestampInSamples += o, n.vorbisLastBlocksize = c, n.packetQueue.push({
        data: t.data,
        timestampInSamples: a,
        durationInSamples: o,
        forcePageFlush: !1
      }), await this.interleavePages();
    } finally {
      s();
    }
  }
  addSubtitleCue() {
    throw new Error("Subtitle tracks are not supported.");
  }
  allTracksAreKnown() {
    for (const e of this.output.tracks)
      if (!e.source._closed && !this.trackDatas.some((t) => t.track === e))
        return !1;
    return !0;
  }
  async interleavePages(e = !1) {
    if (!this.bosPagesWritten) {
      if (!this.allTracksAreKnown() && !e)
        return;
      for (const t of this.trackDatas)
        for (; t.packetQueue.length > 0; ) {
          const i = t.packetQueue.shift();
          if (this.writePacket(t, i, !1), i.forcePageFlush)
            break;
        }
      this.bosPagesWritten = !0;
    }
    e: for (; ; ) {
      let t = null, i = 1 / 0;
      for (const a of this.trackDatas) {
        if (!e && a.packetQueue.length <= 1 && !a.closed)
          break e;
        a.packetQueue.length > 0 && a.packetQueue[0].timestampInSamples < i && (t = a, i = a.packetQueue[0].timestampInSamples);
      }
      if (!t)
        break;
      const s = t.packetQueue.shift(), n = t.packetQueue.length === 0;
      this.writePacket(t, s, n);
    }
    e || await this.writer.flush();
  }
  writePacket(e, t, i) {
    const s = t.timestampInSamples + t.durationInSamples;
    if (this.format._options.maximumPageDuration !== void 0) {
      const l = this.format._options.maximumPageDuration * e.internalSampleRate;
      e.currentLacingValues.length > 0 && s - e.currentPageStartTimestampInSamples > l && this.writePage(e, !1);
    }
    let n = t.data.length, a = 0, o = 0;
    for (; ; ) {
      e.currentLacingValues.length === 0 && a > 0 && (e.currentPageStartsWithFreshPacket = !1);
      const l = Math.min(255, n);
      e.currentLacingValues.push(l), e.currentPageSize++, o += l;
      const u = n < 255;
      if (e.currentLacingValues.length === 255) {
        const d = t.data.subarray(a, o);
        if (a = o, e.currentPageData.push(d), e.currentPageSize += d.length, this.writePage(e, i && u), u)
          return;
      }
      if (u)
        break;
      n -= 255;
    }
    const c = t.data.subarray(a);
    e.currentPageData.push(c), e.currentPageSize += c.length, e.currentGranulePosition = s, (e.currentPageSize >= Kh || t.forcePageFlush) && this.writePage(e, i);
  }
  writePage(e, t) {
    this.pageView.setUint32(0, Dn, !0), this.pageView.setUint8(4, 0);
    let i = 0;
    e.currentPageStartsWithFreshPacket || (i |= 1), e.pagesWritten === 0 && (i |= 2), t && (i |= 4), this.pageView.setUint8(5, i);
    const s = e.currentLacingValues.every((c) => c === 255) ? -1 : e.currentGranulePosition;
    vl(this.pageView, 6, s), this.pageView.setUint32(14, e.serialNumber, !0), this.pageView.setUint32(18, e.pagesWritten, !0), this.pageView.setUint32(22, 0, !0), this.pageView.setUint8(26, e.currentLacingValues.length), this.pageBytes.set(e.currentLacingValues, 27);
    let n = 27 + e.currentLacingValues.length;
    for (const c of e.currentPageData)
      this.pageBytes.set(c, n), n += c.length;
    const a = this.pageBytes.subarray(0, n), o = mc(a);
    if (this.pageView.setUint32(22, o, !0), e.pagesWritten++, e.currentLacingValues.length = 0, e.currentPageData.length = 0, e.currentPageSize = 27, e.currentPageStartsWithFreshPacket = !0, e.currentPageStartTimestampInSamples = e.currentGranulePosition, this.format._options.onPage && this.writer.startTrackingWrites(), this.writer.write(a), this.format._options.onPage) {
      const { data: c, start: l } = this.writer.stopTrackingWrites();
      this.format._options.onPage(c, l, e.track.source);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async onTrackClose(e) {
    const t = await this.mutex.acquire(), i = this.trackDatas.find((s) => s.track === e);
    i && (i.closed = !0), this.allTracksAreKnown() && this.allTracksKnown.resolve(), await this.interleavePages(), t();
  }
  async finalize() {
    const e = await this.mutex.acquire();
    this.allTracksKnown.resolve();
    for (const t of this.trackDatas)
      t.closed = !0;
    await this.interleavePages(!0);
    for (const t of this.trackDatas)
      t.currentLacingValues.length > 0 && this.writePage(t, !0);
    e();
  }
}
const $h = 0, pl = 4096, uo = 256, Gh = 224, fo = 192, ho = new Uint8Array([9, 240]), mo = new Uint8Array([70, 1]);
class Xh extends kt {
  constructor(e, t) {
    super(e), this.trackDatas = [], this.tablesWritten = !1, this.continuityCounters = /* @__PURE__ */ new Map(), this.packetBuffer = new Uint8Array(_e), this.packetView = q(this.packetBuffer), this.allTracksKnown = ee(), this.videoTrackIndex = 0, this.audioTrackIndex = 0, this.adaptationFieldBuffer = new Uint8Array(184), this.payloadBuffer = new Uint8Array(184), this.format = t;
  }
  async start() {
    const e = await this.mutex.acquire();
    this.writer = await this.output._getRootWriter(!0), e();
  }
  async getMimeType() {
    return await this.allTracksKnown.promise, Tc(this.trackDatas.map((e) => e.codecString));
  }
  getVideoTrackData(e, t) {
    const i = this.trackDatas.find((l) => l.track === e);
    if (i)
      return i;
    lr(t, e.source._codec), p(t?.decoderConfig);
    const s = e.source._codec;
    p(s === "avc" || s === "hevc");
    const n = s === "avc" ? 27 : 36, a = uo + this.trackDatas.length, o = Gh + this.videoTrackIndex++, c = {
      track: e,
      pid: a,
      streamType: n,
      streamId: o,
      codecString: t.decoderConfig.codec,
      timestampProcessingQueue: [],
      packetQueue: [],
      inputIsAnnexB: null,
      inputIsAdts: null,
      avcDecoderConfig: null,
      hevcDecoderConfig: null,
      adtsHeader: null,
      adtsHeaderBitstream: null,
      firstPacketWritten: !1,
      closed: !1
    };
    return this.trackDatas.push(c), this.allTracksAreKnown() && this.allTracksKnown.resolve(), c;
  }
  getAudioTrackData(e, t) {
    const i = this.trackDatas.find((l) => l.track === e);
    if (i)
      return i;
    $e(t, e.source._codec), p(t?.decoderConfig);
    const s = e.source._codec;
    p(s === "aac" || s === "mp3" || s === "ac3" || s === "eac3");
    let n, a;
    switch (s) {
      case "aac":
        n = 15, a = fo + this.audioTrackIndex++;
        break;
      case "mp3":
        n = 3, a = fo + this.audioTrackIndex++;
        break;
      case "ac3":
        n = 129, a = 189;
        break;
      case "eac3":
        n = 135, a = 189;
        break;
    }
    const o = uo + this.trackDatas.length, c = {
      track: e,
      pid: o,
      streamType: n,
      streamId: a,
      codecString: t.decoderConfig.codec,
      timestampProcessingQueue: [],
      packetQueue: [],
      inputIsAnnexB: null,
      inputIsAdts: null,
      avcDecoderConfig: null,
      hevcDecoderConfig: null,
      adtsHeader: null,
      adtsHeaderBitstream: null,
      firstPacketWritten: !1,
      closed: !1
    };
    return this.trackDatas.push(c), this.allTracksAreKnown() && this.allTracksKnown.resolve(), c;
  }
  async addEncodedVideoPacket(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      const n = this.getVideoTrackData(e, i);
      this.validateTimestamp(n.track, t.timestamp, t.type === "key");
      const a = this.prepareVideoPacket(n, t, i);
      t.type === "key" && await this.flushTimestampQueue(n), n.timestampProcessingQueue.push({
        data: a,
        presentationTimestamp: t.timestamp,
        decodeTimestamp: null,
        isKeyframe: t.type === "key"
      });
    } finally {
      s();
    }
  }
  async addEncodedAudioPacket(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      const n = this.getAudioTrackData(e, i);
      this.validateTimestamp(n.track, t.timestamp, t.type === "key");
      const a = this.prepareAudioPacket(n, t, i);
      t.type === "key" && await this.flushTimestampQueue(n), n.timestampProcessingQueue.push({
        data: a,
        presentationTimestamp: t.timestamp,
        decodeTimestamp: null,
        isKeyframe: t.type === "key"
      });
    } finally {
      s();
    }
  }
  async addSubtitleCue() {
    throw new Error("MPEG-TS does not support subtitles.");
  }
  prepareVideoPacket(e, t, i) {
    const s = e.track.source._codec;
    if (e.inputIsAnnexB === null) {
      const n = i?.decoderConfig?.description;
      if (e.inputIsAnnexB = !n, !e.inputIsAnnexB) {
        const a = te(n);
        s === "avc" ? e.avcDecoderConfig = No(a) : e.hevcDecoderConfig = mu(a);
      }
    }
    return e.inputIsAnnexB ? this.prepareAnnexBVideoPacket(t.data, s) : this.prepareLengthPrefixedVideoPacket(e, t, s);
  }
  prepareAnnexBVideoPacket(e, t) {
    const i = [];
    for (const n of Pi(e)) {
      const a = e.subarray(n.offset, n.offset + n.length);
      (t === "avc" ? yi(a[0]) === me.AUD : Bt(a[0]) === se.AUD_NUT) || i.push(a);
    }
    const s = t === "avc" ? ho : mo;
    return i.unshift(s), zr(i);
  }
  prepareLengthPrefixedVideoPacket(e, t, i) {
    const s = t.data, n = i === "avc" ? e.avcDecoderConfig.lengthSizeMinusOne + 1 : e.hevcDecoderConfig.lengthSizeMinusOne + 1, a = [];
    for (const c of In(s, n)) {
      const l = s.subarray(c.offset, c.offset + c.length);
      (i === "avc" ? yi(l[0]) === me.AUD : Bt(l[0]) === se.AUD_NUT) || a.push(l);
    }
    if (t.type === "key")
      if (i === "avc") {
        const c = e.avcDecoderConfig;
        for (const l of c.pictureParameterSets)
          a.unshift(l);
        for (const l of c.sequenceParameterSets)
          a.unshift(l);
      } else {
        const c = e.hevcDecoderConfig;
        for (const l of c.arrays)
          if (l.nalUnitType === se.PPS_NUT)
            for (const u of l.nalUnits)
              a.unshift(u);
        for (const l of c.arrays)
          if (l.nalUnitType === se.SPS_NUT)
            for (const u of l.nalUnits)
              a.unshift(u);
        for (const l of c.arrays)
          if (l.nalUnitType === se.VPS_NUT)
            for (const u of l.nalUnits)
              a.unshift(u);
      }
    const o = i === "avc" ? ho : mo;
    return a.unshift(o), zr(a);
  }
  prepareAudioPacket(e, t, i) {
    const s = e.track.source._codec;
    if (s === "mp3" || s === "ac3" || s === "eac3")
      return t.data;
    if (e.inputIsAdts === null) {
      const c = i?.decoderConfig?.description;
      if (e.inputIsAdts = !c, !e.inputIsAdts) {
        const l = cr(te(c)), u = Eo(l);
        e.adtsHeader = u.header, e.adtsHeaderBitstream = u.bitstream;
      }
    }
    if (e.inputIsAdts)
      return t.data;
    p(e.adtsHeader), p(e.adtsHeaderBitstream);
    const n = e.adtsHeader, a = t.data.byteLength + n.byteLength;
    vo(e.adtsHeaderBitstream, a);
    const o = new Uint8Array(a);
    return o.set(n, 0), o.set(t.data, n.byteLength), o;
  }
  allTracksAreKnown() {
    for (const e of this.output.tracks)
      if (!e.source._closed && !this.trackDatas.some((t) => t.track === e))
        return !1;
    return !0;
  }
  async flushTimestampQueue(e, t = !0) {
    if (e.timestampProcessingQueue.length === 0)
      return;
    const i = e.timestampProcessingQueue.map((s) => s.presentationTimestamp).sort((s, n) => s - n);
    for (let s = 0; s < e.timestampProcessingQueue.length; s++) {
      const n = e.timestampProcessingQueue[s];
      n.decodeTimestamp = i[s], e.packetQueue.push(n);
    }
    e.timestampProcessingQueue.length = 0, t && await this.interleavePackets();
  }
  async interleavePackets(e = !1) {
    if (!this.tablesWritten) {
      if (!this.allTracksAreKnown() && !e)
        return;
      this.writeTables();
    }
    e: for (; ; ) {
      let t = null, i = 1 / 0;
      for (const n of this.trackDatas) {
        if (!e && n.packetQueue.length === 0 && !n.closed)
          break e;
        n.packetQueue.length > 0 && n.packetQueue[0].presentationTimestamp < i && (t = n, i = n.packetQueue[0].presentationTimestamp);
      }
      if (!t)
        break;
      const s = t.packetQueue.shift();
      this.writePesPacket(t, s);
    }
    e || await this.writer.flush();
  }
  writeTables() {
    p(!this.tablesWritten), this.writePsiSection($h, Ot), this.writePsiSection(pl, Zh(this.trackDatas)), this.tablesWritten = !0;
  }
  writePsiSection(e, t) {
    let i = 0, s = !0;
    for (; i < t.length; ) {
      const a = 184 - (s ? 1 : 0), o = t.length - i, c = Math.min(a, o);
      let l;
      s ? (l = this.payloadBuffer.subarray(0, 1 + c), l[0] = 0, l.set(t.subarray(i, i + c), 1)) : l = t.subarray(i, i + c), this.writeTsPacket(e, s, null, l), i += c, s = !1;
    }
  }
  writePesPacket(e, t) {
    const i = e.track.type === "video", s = i ? 10 : 5, n = new Uint8Array(9 + s), a = q(n), o = new j(n.subarray(9));
    Qr(a, 0, 1, !1), n[3] = e.streamId;
    const c = e.track.type === "video" ? 0 : Math.min(8 + t.data.length, 65535);
    a.setUint16(4, c, !1), a.setUint8(6, 132), a.setUint8(7, i ? 192 : 128), a.setUint8(8, s);
    const l = Math.round(t.presentationTimestamp * qe);
    if (o.pos = 0, o.writeBits(4, i ? 3 : 2), o.writeBits(3, l >>> 30 & 7), o.writeBits(1, 1), o.writeBits(15, l >>> 15 & 32767), o.writeBits(1, 1), o.writeBits(15, l & 32767), o.writeBits(1, 1), i) {
      p(t.decodeTimestamp !== null);
      const h = Math.round(t.decodeTimestamp * qe);
      o.writeBits(4, 1), o.writeBits(3, h >>> 30 & 7), o.writeBits(1, 1), o.writeBits(15, h >>> 15 & 32767), o.writeBits(1, 1), o.writeBits(15, h & 32767), o.writeBits(1, 1);
    }
    const u = n.length + t.data.length;
    let d = 0, f = !0;
    for (; d < u; ) {
      const h = f, g = u - d, m = f && t.isKeyframe, w = f && !e.firstPacketWritten, y = Math.max(0, 184 - g);
      let b;
      m || w ? b = Math.max(2, y) : b = y;
      let k = null;
      if (b > 0) {
        const x = this.adaptationFieldBuffer;
        b === 1 ? x[0] = 0 : (x[0] = b - 1, x[1] = Number(w) << 7 | Number(m) << 6, x.fill(255, 2, b)), k = x.subarray(0, b);
      }
      const S = Math.min(184 - b, g), T = this.payloadBuffer.subarray(0, S);
      let A = 0;
      if (d < n.length) {
        const x = Math.min(n.length - d, S);
        T.set(n.subarray(d, d + x), 0), A = x;
      }
      const C = Math.max(0, d - n.length), _ = C + (S - A);
      A < S && T.set(t.data.subarray(C, _), A), this.writeTsPacket(e.pid, h, k, T), d += S, f = !1;
    }
    e.firstPacketWritten = !0;
  }
  writeTsPacket(e, t, i, s) {
    const n = this.continuityCounters.get(e) ?? 0, a = s.length > 0, o = i ? a ? 3 : 2 : a ? 1 : 0;
    this.packetBuffer[0] = 71, this.packetView.setUint16(1, (t ? 16384 : 0) | e & 8191, !1), this.packetBuffer[3] = o << 4 | n & 15, a && this.continuityCounters.set(e, n + 1 & 15);
    let c = 4;
    i && (this.packetBuffer.set(i, c), c += i.length), this.packetBuffer.set(s, c), c += s.length, c < _e && this.packetBuffer.fill(255, c);
    const l = this.writer.getPos();
    this.writer.write(this.packetBuffer), this.format._options.onPacket && this.format._options.onPacket(this.packetBuffer.slice(), l);
  }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async onTrackClose(e) {
    const t = await this.mutex.acquire(), i = this.trackDatas.find((s) => s.track === e);
    i && (i.closed = !0, await this.flushTimestampQueue(i, !1)), this.allTracksAreKnown() && this.allTracksKnown.resolve(), await this.interleavePackets(), t();
  }
  async finalize() {
    const e = await this.mutex.acquire();
    this.allTracksKnown.resolve();
    for (const t of this.trackDatas)
      t.closed = !0, await this.flushTimestampQueue(t, !1);
    await this.interleavePackets(!0), e();
  }
}
const Yh = 79764919, gl = new Uint32Array(256);
for (let r = 0; r < 256; r++) {
  let e = r << 24;
  for (let t = 0; t < 8; t++)
    e = e & 2147483648 ? e << 1 ^ Yh : e << 1;
  gl[r] = e >>> 0 & 4294967295;
}
const wl = (r) => {
  let e = 4294967295;
  for (let t = 0; t < r.length; t++) {
    const i = r[t];
    e = (e << 8 ^ gl[e >>> 24 ^ i]) >>> 0;
  }
  return e;
}, Ot = new Uint8Array(16);
{
  const r = q(Ot);
  Ot[0] = 0, r.setUint16(1, 45069, !1), r.setUint16(3, 1, !1), Ot[5] = 193, Ot[6] = 0, Ot[7] = 0, r.setUint16(8, 1, !1), r.setUint16(10, 57344 | pl & 8191, !1), r.setUint32(12, wl(Ot.subarray(0, 12)), !1);
}
const Zh = (r) => {
  let e = 0;
  for (const c of r)
    e += 5, c.streamType === 129 ? e += mr.length : c.streamType === 135 && (e += pr.length);
  const t = 9 + e + 4, i = new Uint8Array(3 + t - 4), s = q(i);
  i[0] = 2, s.setUint16(1, 45056 | t & 4095, !1), s.setUint16(3, 1, !1), i[5] = 193, i[6] = 0, i[7] = 0, s.setUint16(8, 65535, !1), s.setUint16(10, 61440, !1);
  let n = 12;
  for (const c of r)
    i[n++] = c.streamType, s.setUint16(n, 57344 | c.pid & 8191, !1), n += 2, c.streamType === 129 ? (s.setUint16(n, 61440 | mr.length, !1), n += 2, i.set(mr, n), n += mr.length) : c.streamType === 135 ? (s.setUint16(n, 61440 | pr.length, !1), n += 2, i.set(pr, n), n += pr.length) : (s.setUint16(n, 61440, !1), n += 2);
  const a = wl(i), o = new Uint8Array(i.length + 4);
  return o.set(i, 0), q(o).setUint32(i.length, a, !1), o;
};
class Jh {
  constructor(e) {
    this.writer = e, this.helper = new Uint8Array(8), this.helperView = new DataView(this.helper.buffer);
  }
  writeU16(e) {
    this.helperView.setUint16(0, e, !0), this.writer.write(this.helper.subarray(0, 2));
  }
  writeU32(e) {
    this.helperView.setUint32(0, e, !0), this.writer.write(this.helper.subarray(0, 4));
  }
  writeU64(e) {
    this.helperView.setUint32(0, e, !0), this.helperView.setUint32(4, Math.floor(e / 2 ** 32), !0), this.writer.write(this.helper);
  }
  writeAscii(e) {
    this.writer.write(new TextEncoder().encode(e));
  }
}
class em extends kt {
  constructor(e, t) {
    super(e), this.headerWritten = !1, this.dataSize = 0, this.sampleRate = null, this.sampleCount = 0, this.riffSizePos = null, this.dataSizePos = null, this.ds64RiffSizePos = null, this.ds64DataSizePos = null, this.ds64SampleCountPos = null, this.format = t, this.isRf64 = !!t._options.large;
  }
  async start() {
    const e = await this.mutex.acquire();
    this.writer = await this.output._getRootWriter(!1), this.riffWriter = new Jh(this.writer);
    const t = this.output.tracks[0];
    p(t?.isAudioTrack()), t.metadata.decoderConfig && ($e({ decoderConfig: t.metadata.decoderConfig }, t.source._codec), this.writeHeader(t, t.metadata.decoderConfig), this.sampleRate = t.metadata.decoderConfig.sampleRate, this.headerWritten = !0), e();
  }
  async getMimeType() {
    return "audio/wav";
  }
  async addEncodedVideoPacket() {
    throw new Error("WAVE does not support video.");
  }
  async addEncodedAudioPacket(e, t, i) {
    const s = await this.mutex.acquire();
    try {
      if (this.headerWritten || ($e(i, e.source._codec), p(i), p(i.decoderConfig), this.writeHeader(e, i.decoderConfig), this.sampleRate = i.decoderConfig.sampleRate, this.headerWritten = !0), this.validateTimestamp(e, t.timestamp, t.type === "key"), !this.isRf64 && this.writer.getPos() + t.data.byteLength >= 2 ** 32)
        throw new Error("Adding more audio data would exceed the maximum RIFF size of 4 GiB. To write larger files, use RF64 by setting `large: true` in the WavOutputFormatOptions.");
      this.writer.write(t.data), this.dataSize += t.data.byteLength, this.sampleCount += Math.round(t.duration * this.sampleRate), await this.writer.flush();
    } finally {
      s();
    }
  }
  async addSubtitleCue() {
    throw new Error("WAVE does not support subtitles.");
  }
  writeHeader(e, t) {
    this.format._options.onHeader && this.writer.startTrackingWrites();
    let i;
    const s = e.source._codec, n = Qe(s);
    n.dataType === "ulaw" ? i = he.MULAW : n.dataType === "alaw" ? i = he.ALAW : n.dataType === "float" ? i = he.IEEE_FLOAT : i = he.PCM;
    const a = t.numberOfChannels, o = t.sampleRate, c = n.sampleSize * a;
    if (this.riffWriter.writeAscii(this.isRf64 ? "RF64" : "RIFF"), this.isRf64 ? this.riffWriter.writeU32(4294967295) : (this.riffSizePos = this.writer.getPos(), this.riffWriter.writeU32(0)), this.riffWriter.writeAscii("WAVE"), this.isRf64 && (this.riffWriter.writeAscii("ds64"), this.riffWriter.writeU32(28), this.ds64RiffSizePos = this.writer.getPos(), this.riffWriter.writeU64(0), this.ds64DataSizePos = this.writer.getPos(), this.riffWriter.writeU64(0), this.ds64SampleCountPos = this.writer.getPos(), this.riffWriter.writeU64(0), this.riffWriter.writeU32(0)), this.riffWriter.writeAscii("fmt "), this.riffWriter.writeU32(16), this.riffWriter.writeU16(i), this.riffWriter.writeU16(a), this.riffWriter.writeU32(o), this.riffWriter.writeU32(o * c), this.riffWriter.writeU16(c), this.riffWriter.writeU16(8 * n.sampleSize), !Gi(this.output._metadataTags)) {
      const l = this.format._options.metadataFormat ?? "info";
      l === "info" ? this.writeInfoChunk(this.output._metadataTags) : l === "id3" ? this.writeId3Chunk(this.output._metadataTags) : pe(l);
    }
    if (this.riffWriter.writeAscii("data"), this.isRf64 ? this.riffWriter.writeU32(4294967295) : (this.dataSizePos = this.writer.getPos(), this.riffWriter.writeU32(0)), this.format._options.onHeader) {
      const { data: l, start: u } = this.writer.stopTrackingWrites();
      this.format._options.onHeader(l, u);
    }
  }
  writeInfoChunk(e) {
    const t = this.writer.getPos();
    this.riffWriter.writeAscii("LIST"), this.riffWriter.writeU32(0), this.riffWriter.writeAscii("INFO");
    const i = /* @__PURE__ */ new Set(), s = (o, c) => {
      if (!st(c)) {
        D._warn(`Didn't write tag '${o}' because '${c}' is not ISO 8859-1-compatible.`);
        return;
      }
      const l = c.length + 1, u = new Uint8Array(l);
      for (let d = 0; d < c.length; d++)
        u[d] = c.charCodeAt(d);
      this.riffWriter.writeAscii(o), this.riffWriter.writeU32(l), this.writer.write(u), l & 1 && this.writer.write(new Uint8Array(1)), i.add(o);
    };
    for (const { key: o, value: c } of Ti(e))
      switch (o) {
        case "title":
          s("INAM", c), i.add("INAM");
          break;
        case "artist":
          s("IART", c), i.add("IART");
          break;
        case "album":
          s("IPRD", c), i.add("IPRD");
          break;
        case "trackNumber":
          {
            const l = e.tracksTotal !== void 0 ? `${c}/${e.tracksTotal}` : c.toString();
            s("ITRK", l), i.add("ITRK");
          }
          break;
        case "genre":
          s("IGNR", c), i.add("IGNR");
          break;
        case "date":
          s("ICRD", c.toISOString().slice(0, 10)), i.add("ICRD");
          break;
        case "comment":
          s("ICMT", c), i.add("ICMT");
          break;
        case "albumArtist":
        case "discNumber":
        case "tracksTotal":
        case "discsTotal":
        case "description":
        case "lyrics":
        case "images":
          break;
        case "raw":
          break;
        default:
          pe(o);
      }
    if (e.raw)
      for (const o in e.raw) {
        const c = e.raw[o];
        c == null || o.length !== 4 || i.has(o) || typeof c == "string" && s(o, c);
      }
    const n = this.writer.getPos(), a = n - t - 8;
    this.writer.seek(t + 4), this.riffWriter.writeU32(a), this.writer.seek(n), a & 1 && this.writer.write(new Uint8Array(1));
  }
  writeId3Chunk(e) {
    const t = this.writer.getPos();
    this.riffWriter.writeAscii("ID3 "), this.riffWriter.writeU32(0);
    const s = new Kn(this.writer).writeId3V2Tag(e), n = this.writer.getPos();
    this.writer.seek(t + 4), this.riffWriter.writeU32(s), this.writer.seek(n), s & 1 && this.writer.write(new Uint8Array(1));
  }
  async finalize() {
    const e = await this.mutex.acquire();
    if (!this.headerWritten)
      throw new Error("Cannot finalize an empty WAVE file: no packets were added and the track specified no decoderConfig in its metadata, so there's no telling what the file should look like.");
    const t = this.writer.getPos();
    this.isRf64 ? (p(this.ds64RiffSizePos !== null), this.writer.seek(this.ds64RiffSizePos), this.riffWriter.writeU64(t - 8), p(this.ds64DataSizePos !== null), this.writer.seek(this.ds64DataSizePos), this.riffWriter.writeU64(this.dataSize), p(this.ds64SampleCountPos !== null), this.writer.seek(this.ds64SampleCountPos), this.riffWriter.writeU64(this.sampleCount)) : (p(this.riffSizePos !== null), this.writer.seek(this.riffSizePos), this.riffWriter.writeU32(t - 8), p(this.dataSizePos !== null), this.writer.seek(this.dataSizePos), this.riffWriter.writeU32(this.dataSize)), e();
  }
}
class tm {
  constructor(e) {
    this.sourceSampleRate = null, this.sourceNumberOfChannels = null, this.startTime = null, this.bufferStartFrame = 0, this.maxWrittenFrame = null, this.targetSampleRate = e.targetSampleRate, this.targetNumberOfChannels = e.targetNumberOfChannels, this.onSample = e.onSample, this.bufferSizeInFrames = Math.floor(this.targetSampleRate * 5), this.bufferSizeInSamples = this.bufferSizeInFrames * this.targetNumberOfChannels, this.outputBuffer = new Float32Array(this.bufferSizeInSamples);
  }
  /**
   * Sets up the channel mixer to handle up/downmixing in the case where input and output channel counts don't match.
   */
  doChannelMixerSetup() {
    p(this.sourceNumberOfChannels !== null);
    const e = this.sourceNumberOfChannels, t = this.targetNumberOfChannels;
    e === 1 && t === 2 ? this.channelMixer = (i, s) => i[s * e] : e === 1 && t === 4 ? this.channelMixer = (i, s, n) => i[s * e] * +(n < 2) : e === 1 && t === 6 ? this.channelMixer = (i, s, n) => i[s * e] * +(n === 2) : e === 2 && t === 1 ? this.channelMixer = (i, s) => {
      const n = s * e;
      return 0.5 * (i[n] + i[n + 1]);
    } : e === 2 && t === 4 ? this.channelMixer = (i, s, n) => i[s * e + n] * +(n < 2) : e === 2 && t === 6 ? this.channelMixer = (i, s, n) => i[s * e + n] * +(n < 2) : e === 4 && t === 1 ? this.channelMixer = (i, s) => {
      const n = s * e;
      return 0.25 * (i[n] + i[n + 1] + i[n + 2] + i[n + 3]);
    } : e === 4 && t === 2 ? this.channelMixer = (i, s, n) => {
      const a = s * e;
      return 0.5 * (i[a + n] + i[a + n + 2]);
    } : e === 4 && t === 6 ? this.channelMixer = (i, s, n) => {
      const a = s * e;
      return n < 2 ? i[a + n] : n === 2 || n === 3 ? 0 : i[a + n - 2];
    } : e === 6 && t === 1 ? this.channelMixer = (i, s) => {
      const n = s * e;
      return Math.SQRT1_2 * (i[n] + i[n + 1]) + i[n + 2] + 0.5 * (i[n + 4] + i[n + 5]);
    } : e === 6 && t === 2 ? this.channelMixer = (i, s, n) => {
      const a = s * e;
      return i[a + n] + Math.SQRT1_2 * (i[a + 2] + i[a + n + 4]);
    } : e === 6 && t === 4 ? this.channelMixer = (i, s, n) => {
      const a = s * e;
      return n < 2 ? i[a + n] + Math.SQRT1_2 * i[a + 2] : i[a + n + 2];
    } : this.channelMixer = (i, s, n) => n < e ? i[s * e + n] : 0;
  }
  ensureTempBufferSize(e) {
    let t = this.tempSourceBuffer.length;
    for (; t < e; )
      t *= 2;
    if (t !== this.tempSourceBuffer.length) {
      const i = new Float32Array(t);
      i.set(this.tempSourceBuffer), this.tempSourceBuffer = i;
    }
  }
  async add(e) {
    this.sourceSampleRate === null && (this.sourceSampleRate = e.sampleRate, this.sourceNumberOfChannels = e.numberOfChannels, this.startTime = e.timestamp, this.tempSourceBuffer = new Float32Array(this.sourceSampleRate * this.sourceNumberOfChannels), this.doChannelMixerSetup()), p(this.startTime !== null);
    const t = e.numberOfFrames * e.numberOfChannels;
    this.ensureTempBufferSize(t);
    const i = e.allocationSize({ planeIndex: 0, format: "f32" }), s = new Float32Array(this.tempSourceBuffer.buffer, 0, i / 4);
    e.copyTo(s, { planeIndex: 0, format: "f32" });
    const n = e.timestamp - this.startTime, a = n + e.duration, o = Math.floor((n - 1 / this.sourceSampleRate) * this.targetSampleRate) + 1, c = Math.ceil(a * this.targetSampleRate);
    for (let l = o; l < c; l++) {
      if (l < this.bufferStartFrame)
        continue;
      for (; l >= this.bufferStartFrame + this.bufferSizeInFrames; )
        await this.finalizeCurrentBuffer(), this.bufferStartFrame += this.bufferSizeInFrames;
      const u = l - this.bufferStartFrame;
      p(u < this.bufferSizeInFrames);
      const h = (l / this.targetSampleRate - n) * this.sourceSampleRate, g = Math.floor(h), m = Math.ceil(h), w = h - g;
      for (let y = 0; y < this.targetNumberOfChannels; y++) {
        let b = 0, k = 0;
        g >= 0 && g < e.numberOfFrames && (b = this.channelMixer(s, g, y)), m >= 0 && m < e.numberOfFrames && (k = this.channelMixer(s, m, y));
        const S = b + w * (k - b), T = u * this.targetNumberOfChannels + y;
        this.outputBuffer[T] += S;
      }
      this.maxWrittenFrame === null ? this.maxWrittenFrame = u : this.maxWrittenFrame = Math.max(this.maxWrittenFrame, u);
    }
  }
  async finalizeCurrentBuffer() {
    if (this.maxWrittenFrame === null)
      return;
    p(this.startTime !== null);
    const e = (this.maxWrittenFrame + 1) * this.targetNumberOfChannels, t = new Float32Array(e);
    t.set(this.outputBuffer.subarray(0, e));
    const i = new fe({
      format: "f32",
      sampleRate: this.targetSampleRate,
      numberOfChannels: this.targetNumberOfChannels,
      timestamp: this.startTime + this.bufferStartFrame / this.targetSampleRate,
      data: t
    });
    await this.onSample(i), this.outputBuffer.fill(0), this.maxWrittenFrame = null;
  }
  finalize() {
    return this.finalizeCurrentBuffer();
  }
}
var im = function(r, e, t) {
  if (e != null) {
    if (typeof e != "object" && typeof e != "function") throw new TypeError("Object expected.");
    var i, s;
    if (t) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      i = e[Symbol.asyncDispose];
    }
    if (i === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      i = e[Symbol.dispose], t && (s = i);
    }
    if (typeof i != "function") throw new TypeError("Object not disposable.");
    s && (i = function() {
      try {
        s.call(this);
      } catch (n) {
        return Promise.reject(n);
      }
    }), r.stack.push({ value: e, dispose: i, async: t });
  } else t && r.stack.push({ async: !0 });
  return e;
}, rm = /* @__PURE__ */ (function(r) {
  return function(e) {
    function t(a) {
      e.error = e.hasError ? new r(a, e.error, "An error was suppressed during disposal.") : a, e.hasError = !0;
    }
    var i, s = 0;
    function n() {
      for (; i = e.stack.pop(); )
        try {
          if (!i.async && s === 1) return s = 0, e.stack.push(i), Promise.resolve().then(n);
          if (i.dispose) {
            var a = i.dispose.call(i.value);
            if (i.async) return s |= 2, Promise.resolve(a).then(n, function(o) {
              return t(o), n();
            });
          } else s |= 1;
        } catch (o) {
          t(o);
        }
      if (s === 1) return e.hasError ? Promise.reject(e.error) : Promise.resolve();
      if (e.hasError) throw e.error;
    }
    return n();
  };
})(typeof SuppressedError == "function" ? SuppressedError : function(r, e, t) {
  var i = new Error(t);
  return i.name = "SuppressedError", i.error = r, i.suppressed = e, i;
});
class Gn {
  constructor() {
    this._connectedTrack = null, this._closingPromise = null, this._closed = !1;
  }
  /** @internal */
  _ensureValidAdd() {
    if (!this._connectedTrack)
      throw new Error("Source is not connected to an output track.");
    if (this._connectedTrack.output.state === "canceled")
      throw new Error("Output has been canceled.");
    if (this._connectedTrack.output.state === "finalizing" || this._connectedTrack.output.state === "finalized")
      throw new Error("Output has been finalized.");
    if (this._connectedTrack.output.state === "pending")
      throw new Error("Output has not started.");
    if (this._closed)
      throw new Error("Source is closed.");
  }
  /** @internal */
  async _start() {
  }
  /** @internal */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async _flushAndClose(e) {
  }
  /**
   * Closes this source. This prevents future samples from being added and signals to the output file that no further
   * samples will come in for this track. Calling `.close()` is optional but recommended after adding the
   * last sample - for improved performance and reduced memory usage.
   */
  close() {
    if (this._closingPromise)
      return;
    const e = this._connectedTrack;
    if (!e)
      throw new Error("Cannot call close without connecting the source to an output track.");
    if (e.output.state === "pending")
      throw new Error("Cannot call close before output has been started.");
    this._closingPromise = (async () => {
      await this._flushAndClose(!1), this._closed = !0, !(e.output.state === "finalizing" || e.output.state === "finalized") && e.output._muxer.onTrackClose(e);
    })();
  }
  /** @internal */
  async _flushOrWaitForOngoingClose(e) {
    return this._closingPromise ??= (async () => {
      await this._flushAndClose(e), this._closed = !0;
    })();
  }
}
class dr extends Gn {
  /** Internal constructor. */
  constructor(e) {
    if (super(), this._connectedTrack = null, !de.includes(e))
      throw new TypeError(`Invalid video codec '${e}'. Must be one of: ${de.join(", ")}.`);
    this._codec = e;
  }
}
const gn = (r, e) => {
  if (r.metadata.hasOnlyKeyPackets && e.type !== "key")
    throw new Error("Cannot add non-key packets to a hasOnlyKeyPackets video track.");
};
class wn extends dr {
  /** Creates a new {@link EncodedVideoPacketSource} whose packets are encoded using `codec`. */
  constructor(e) {
    super(e);
  }
  /**
   * Adds an encoded packet to the output video track. Packets must be added in *decode order*, while a packet's
   * timestamp must be its *presentation timestamp*. B-frames are handled automatically.
   *
   * @param meta - Additional metadata from the encoder. You should pass this for the first call, including a valid
   * decoder config.
   *
   * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
   * to respect writer and encoder backpressure.
   */
  add(e, t) {
    if (!(e instanceof Z))
      throw new TypeError("packet must be an EncodedPacket.");
    if (e.isMetadataOnly)
      throw new TypeError("Metadata-only packets cannot be added.");
    if (t !== void 0 && (!t || typeof t != "object"))
      throw new TypeError("meta, when provided, must be an object.");
    return this._ensureValidAdd(), gn(this._connectedTrack, e), this._connectedTrack.output._muxer.addEncodedVideoPacket(this._connectedTrack, e, t);
  }
}
class Xn {
  setError(e) {
    this.errorSet || (this.error = e, this.errorSet = !0);
  }
  constructor(e, t) {
    this.source = e, this.encodingConfig = t, this.ensureEncoderPromise = null, this.encoderInitialized = !1, this.encoder = null, this.muxer = null, this.lastMultipleOfKeyFrameInterval = -1, this.emittedEncoderPackets = 0, this.codedWidth = null, this.codedHeight = null, this.outputWidth = null, this.outputHeight = null, this.frameRateLastSample = null, this.frameRateLastTimestamp = null, this.frameRateLastEndTimestamp = null, this.preciseTimings = [], this.customEncoder = null, this.customEncoderCallSerializer = new $r(), this.customEncoderQueueSize = 0, this.defaultEncodeOptions = {}, this.alphaEncoder = null, this.splitter = null, this.splitterCreationFailed = !1, this.alphaFrameQueue = [], this.error = null, this.errorSet = !1, this.lastMuxerPromise = Promise.resolve(), this.closed = !1;
  }
  async add(e, t, i) {
    const s = e;
    try {
      this.checkForEncoderError(), this.source._ensureValidAdd();
      const n = this.encodingConfig, a = n.sizeChangeBehavior ?? "deny";
      let o = !1;
      if (this.codedWidth !== null && this.codedHeight !== null) {
        if ((e.codedWidth !== this.codedWidth || e.codedHeight !== this.codedHeight) && (o = !0, a === "deny"))
          throw new Error(`Video sample size must remain constant. Expected ${this.codedWidth}x${this.codedHeight}, got ${e.codedWidth}x${e.codedHeight}. To allow the sample size to change over time, set \`sizeChangeBehavior\` to a value other than 'deny' in the encoding options.`);
      } else
        this.codedWidth = e.codedWidth, this.codedHeight = e.codedHeight;
      if (n.transform?.width !== void 0 || n.transform?.height !== void 0 || n.transform?.rotate !== void 0 || n.transform?.crop !== void 0 || n.transform?.force === !0 || o && a !== "passThrough") {
        let d = n.transform?.width, f = n.transform?.height, h = n.transform?.fit ?? "fill";
        o && a !== "passThrough" && (p(this.outputWidth), p(this.outputHeight), p(a !== "deny"), d = this.outputWidth, f = this.outputHeight, h = a);
        const g = await e.transform({
          width: d,
          height: f,
          roundDimensionsTo: 2,
          crop: n.transform?.crop,
          rotate: n.transform?.rotate,
          fit: h,
          alpha: n.alpha
        });
        (this.outputWidth === null || this.outputHeight === null) && (this.outputWidth = g.displayWidth, this.outputHeight = g.displayHeight), t && e.close(), e = g, t = !0;
      } else
        (this.outputWidth === null || this.outputHeight === null) && (this.outputWidth = e.codedWidth, this.outputHeight = e.codedHeight);
      const u = n.transform?.frameRate;
      if (u !== void 0) {
        const d = e.timestamp + e.duration, f = ta(e.timestamp, u);
        if (this.frameRateLastSample !== null)
          if (f <= this.frameRateLastTimestamp) {
            this.frameRateLastSample.close(), this.frameRateLastSample = e.clone(), this.frameRateLastEndTimestamp = d;
            return;
          } else
            await this.padFrameRate(f, i);
        e === s && (e = e.clone(), t = !0), e.setTimestamp(f), e.setDuration(1 / u), this.frameRateLastSample?.close(), this.frameRateLastSample = e.clone(), this.frameRateLastTimestamp = f, this.frameRateLastEndTimestamp = d;
      }
      await this.processAndEncode(e, i);
    } finally {
      t && e.close();
    }
  }
  /**
   * Runs the process function (if any) and encodes the resulting samples.
   */
  async processAndEncode(e, t) {
    const i = this.encodingConfig;
    let s;
    if (i.transform?.process) {
      let n = i.transform.process(e);
      if (n instanceof Promise && (n = await n), n === null)
        return;
      Array.isArray(n) || (n = [n]);
      const a = [];
      try {
        for (const o of n)
          o instanceof be ? a.push(o) : typeof VideoFrame < "u" && o instanceof VideoFrame ? a.push(new be(o)) : a.push(new be(o, {
            timestamp: e.timestamp,
            duration: e.duration
          }));
      } catch (o) {
        for (const c of a)
          c !== e && c.close();
        for (const c of n)
          (c instanceof be && c !== e || typeof VideoFrame < "u" && c instanceof VideoFrame) && c.close();
        throw o;
      }
      s = a;
    } else
      s = [e];
    try {
      for (const n of s) {
        if (this.encoderInitialized || (this.ensureEncoderPromise || this.ensureEncoder(n), this.encoderInitialized || await this.ensureEncoderPromise), p(this.encoderInitialized), this.closed)
          break;
        const a = this.encodingConfig.keyFrameInterval ?? 2, o = Math.floor(n.timestamp / a), c = {
          ...this.defaultEncodeOptions,
          ...n.encodeOptions,
          ...t
        }, l = {
          ...c,
          keyFrame: c.keyFrame !== void 0 ? c.keyFrame : a === 0 || o !== this.lastMultipleOfKeyFrameInterval
        };
        if (this.lastMultipleOfKeyFrameInterval = o, this.encodingConfig.onEncodedSample?.(n), this.customEncoder) {
          this.customEncoderQueueSize++;
          const u = n.clone(), d = this.customEncoderCallSerializer.call(() => this.customEncoder.encode(u, l)).catch((f) => this.setError(f)).finally(() => {
            this.customEncoderQueueSize--, u.close();
          });
          this.customEncoderQueueSize >= 4 && await d;
        } else {
          p(this.encoder);
          const u = n.toVideoFrame(), d = $(this.preciseTimings, u.timestamp, (h) => h.microsecondTimestamp), f = d !== -1 ? this.preciseTimings[d] : null;
          if (f && f.microsecondTimestamp === u.timestamp ? (f.timestamp !== n.timestamp && (f.timestampIsValid = !1), f.duration !== n.duration && (f.durationIsValid = !1)) : (this.preciseTimings.splice(d + 1, 0, {
            microsecondTimestamp: u.timestamp,
            timestamp: n.timestamp,
            duration: n.duration,
            timestampIsValid: !0,
            durationIsValid: !0
          }), this.preciseTimings.length > 128 && this.preciseTimings.shift()), this.alphaEncoder)
            if (!!u.format && !u.format.includes("A") || this.splitterCreationFailed) {
              this.alphaFrameQueue.push(null);
              try {
                this.encoder.encode(u, l);
              } finally {
                u.close();
              }
            } else {
              this.splitter || (this.splitter = new sm());
              const { colorFrame: g, alphaFrame: m } = await this.splitter.split(u);
              this.alphaFrameQueue.push(m);
              try {
                this.encoder.encode(g, l);
              } finally {
                g.close();
              }
            }
          else
            try {
              this.encoder.encode(u, l);
            } finally {
              u.close();
            }
          this.encoder.encodeQueueSize >= 4 && await new Promise((h) => this.encoder.addEventListener("dequeue", h, { once: !0 }));
        }
        await this.lastMuxerPromise;
      }
    } finally {
      for (const n of s)
        n !== e && n.close();
    }
  }
  /** Repeats the last frame rate sample to fill the gap up to the given timestamp. */
  async padFrameRate(e, t) {
    const i = this.encodingConfig.transform.frameRate;
    p(this.frameRateLastSample);
    const s = Math.round((e - this.frameRateLastTimestamp) * i);
    for (let n = 1; n < s; n++) {
      const a = { stack: [], error: void 0, hasError: !1 };
      try {
        const o = im(a, this.frameRateLastSample.clone(), !1);
        o.setTimestamp(this.frameRateLastTimestamp + n / i), o.setDuration(1 / i), await this.processAndEncode(o, t);
      } catch (o) {
        a.error = o, a.hasError = !0;
      } finally {
        rm(a);
      }
    }
  }
  ensureEncoder(e) {
    this.ensureEncoderPromise = (async () => {
      const t = bi(this.encodingConfig.quality, this.encodingConfig.bitrate);
      p(t !== void 0);
      const i = $c({
        ...this.encodingConfig,
        quality: t,
        width: e.codedWidth,
        height: e.codedHeight,
        squarePixelWidth: e.squarePixelWidth,
        squarePixelHeight: e.squarePixelHeight,
        framerate: this.source._connectedTrack?.metadata.frameRate
      });
      let s = null, n;
      for (const o of i) {
        const c = o.config;
        if (this.encodingConfig.onEncoderConfig?.(c), n = Wr.find((u) => u.supports(this.encodingConfig.codec, c)), n) {
          s = o;
          break;
        }
        if (typeof VideoEncoder > "u")
          continue;
        if (c.alpha = "discard", this.encodingConfig.alpha === "keep" && (c.latencyMode = "quality"), (c.width % 2 === 1 || c.height % 2 === 1) && (this.encodingConfig.codec === "avc" || this.encodingConfig.codec === "hevc"))
          throw new Error(`The dimensions ${c.width}x${c.height} are not supported for codec '${this.encodingConfig.codec}'; both width and height must be even numbers. Make sure to round your dimensions to the nearest even number.`);
        try {
          if ((await VideoEncoder.isConfigSupported(c)).supported) {
            s = o;
            break;
          }
        } catch {
        }
      }
      if (!s) {
        if (typeof VideoEncoder > "u")
          throw new Error("VideoEncoder is not supported by this browser.");
        const o = i[0].config, c = i.map(({ config: l, quantizer: u }) => u !== null ? `quantizer ${u}` : `${l.bitrate} bps`);
        throw new Error(`This specific encoder configuration (${o.codec}, ${c.join(" / ")}, ${o.width}x${o.height}, hardware acceleration: ${o.hardwareAcceleration ?? "no-preference"}) is not supported by this browser. Consider using another codec or changing your video parameters.`);
      }
      const a = s.config;
      if (s.quantizer !== null && (this.defaultEncodeOptions = Yc(this.encodingConfig.codec, s.quantizer)), n)
        this.customEncoder = new n(), this.customEncoder.codec = this.encodingConfig.codec, this.customEncoder.config = a, this.customEncoder.onPacket = (o, c) => {
          if (!(o instanceof Z))
            throw new TypeError("The first argument passed to onPacket must be an EncodedPacket.");
          if (c !== void 0 && (!c || typeof c != "object"))
            throw new TypeError("The second argument passed to onPacket must be an object or undefined.");
          gn(this.source._connectedTrack, o), this.encodingConfig.onEncodedPacket?.(o, c), this.lastMuxerPromise = this.muxer.addEncodedVideoPacket(this.source._connectedTrack, o, c).catch((l) => {
            this.setError(l);
          });
        }, this.customEncoder.onError = (o) => {
          this.setError(o);
        }, await this.customEncoder.init();
      else {
        const o = [], c = [];
        let l = 0, u = 0;
        const d = (h, g, m) => {
          const w = {};
          if (g) {
            const T = new Uint8Array(g.byteLength);
            g.copyTo(T), w.alpha = T;
          }
          let y = Z.fromEncodedChunk(h, w);
          const b = $(this.preciseTimings, h.timestamp, (T) => T.microsecondTimestamp), k = b !== -1 ? this.preciseTimings[b] : null;
          let S = null;
          this.emittedEncoderPackets === 0 && y.type === "delta" && m?.decoderConfig && (S = es(this.encodingConfig.codec, m.decoderConfig, y.data)), (k && k.microsecondTimestamp === h.timestamp || S !== null) && (y = y.clone({
            timestamp: k?.timestampIsValid ? k.timestamp : void 0,
            duration: k?.durationIsValid ? k.duration : void 0,
            type: S ?? void 0
          })), gn(this.source._connectedTrack, y), this.encodingConfig.onEncodedPacket?.(y, m), this.lastMuxerPromise = this.muxer.addEncodedVideoPacket(this.source._connectedTrack, y, m).catch((T) => {
            this.setError(T);
          }), this.emittedEncoderPackets++;
        }, f = new Error("Encoding error").stack;
        if (this.encoder = new VideoEncoder({
          output: (h, g) => {
            if (!this.alphaEncoder) {
              d(h, null, g);
              return;
            }
            const m = this.alphaFrameQueue.shift();
            p(m !== void 0), m ? (this.alphaEncoder.encode(m, {
              ...this.defaultEncodeOptions,
              // Crucial: The alpha frame is forced to be a key frame whenever the color frame
              // also is. Without this, playback can glitch and even crash in some browsers.
              // This is the reason why the two encoders are wired in series and not in parallel.
              keyFrame: h.type === "key"
            }), u++, m.close(), o.push({ chunk: h, meta: g })) : u === 0 ? d(h, null, g) : (c.push(l + u), o.push({ chunk: h, meta: g }));
          },
          error: (h) => {
            h.stack = f, this.setError(h);
          }
        }), this.encoder.configure(a), this.encodingConfig.alpha === "keep") {
          const h = new Error("Encoding error").stack;
          this.alphaEncoder = new VideoEncoder({
            // We ignore the alpha chunk's metadata
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            output: (g, m) => {
              u--;
              const w = o.shift();
              for (p(w !== void 0), d(w.chunk, g, w.meta), l++; c.length > 0 && c[0] === l; ) {
                c.shift();
                const y = o.shift();
                p(y !== void 0), d(y.chunk, null, y.meta);
              }
            },
            error: (g) => {
              g.stack = h, this.setError(g);
            }
          }), this.alphaEncoder.configure(a);
        }
      }
      p(this.source._connectedTrack), this.muxer = this.source._connectedTrack.output._muxer, this.encoderInitialized = !0;
    })();
  }
  async flushAndClose(e) {
    try {
      if (!e && (this.checkForEncoderError(), this.frameRateLastSample)) {
        const t = this.encodingConfig.transform.frameRate, i = ta(this.frameRateLastEndTimestamp, t);
        await this.padFrameRate(i);
      }
      this.closed = !0, e || (this.customEncoder ? this.customEncoderCallSerializer.call(() => this.customEncoder.flush()) : this.encoder && (await this.encoder.flush(), await this.alphaEncoder?.flush(), await $i(25)));
    } finally {
      this.closed = !0, this.frameRateLastSample?.close(), this.frameRateLastSample = null, this.customEncoder ? await this.customEncoderCallSerializer.call(() => this.customEncoder.close()).catch((t) => this.setError(t)) : this.encoder && (this.encoder.state !== "closed" && this.encoder.close(), this.alphaEncoder && this.alphaEncoder.state !== "closed" && this.alphaEncoder.close(), this.alphaFrameQueue.forEach((t) => t?.close()), this.alphaFrameQueue.length = 0, this.splitter?.close());
    }
    e || this.checkForEncoderError();
  }
  getQueueSize() {
    return this.customEncoder ? this.customEncoderQueueSize : this.encoder?.encodeQueueSize ?? 0;
  }
  checkForEncoderError() {
    if (this.errorSet)
      throw this.error;
  }
}
let Ms = null;
class sm {
  constructor() {
    this.worker = null, this.pendingRequests = /* @__PURE__ */ new Map(), this.nextRequestId = 0;
  }
  split(e) {
    if (!this.worker) {
      if (!Ms) {
        const s = new Blob([`(${nm.toString()})()`], { type: "application/javascript" });
        Ms = URL.createObjectURL(s);
      }
      this.worker = new Worker(Ms), this.worker.addEventListener("message", (s) => {
        const n = s.data, a = this.pendingRequests.get(n.id);
        a && (this.pendingRequests.delete(n.id), "error" in n ? a.reject(new Error(n.error)) : a.resolve({ colorFrame: n.colorFrame, alphaFrame: n.alphaFrame }));
      }), this.worker.addEventListener("error", (s) => {
        const n = new Error(s.message || "Color/alpha splitter worker error.");
        for (const a of this.pendingRequests.values())
          a.reject(n);
        this.pendingRequests.clear();
      });
    }
    const t = this.nextRequestId++, i = ee();
    return this.pendingRequests.set(t, i), this.worker.postMessage({ id: t, sourceFrame: e }, { transfer: [e] }), i.promise;
  }
  close() {
    this.worker?.terminate(), this.worker = null;
    const e = new Error("Color/alpha splitter closed.");
    for (const t of this.pendingRequests.values())
      t.reject(e);
    this.pendingRequests.clear();
  }
}
const nm = () => {
  let r = null, e = Promise.resolve();
  self.addEventListener("message", (n) => {
    const { id: a, sourceFrame: o } = n.data;
    e = e.then(async () => {
      try {
        const { colorFrame: c, alphaFrame: l } = await t(o);
        self.postMessage({ id: a, colorFrame: c, alphaFrame: l }, { transfer: [c, l] });
      } catch (c) {
        self.postMessage({ id: a, error: c.message });
      } finally {
        o.close();
      }
    });
  });
  const t = async (n) => {
    const a = n.format;
    if (!a)
      throw new Error("CPU color/alpha splitting requires a known VideoFrame format.");
    const o = n.allocationSize();
    if ((!r || r.byteLength !== o) && (r = new Uint8Array(o)), await n.copyTo(r), a === "RGBA" || a === "BGRA")
      return i(r, a, n);
    if (a === "I420A" || a === "I420AP10" || a === "I420AP12" || a === "I422A" || a === "I422AP10" || a === "I422AP12" || a === "I444A" || a === "I444AP10" || a === "I444AP12")
      return s(r, a, n);
    throw new Error(`CPU color/alpha splitting does not support format '${a}'.`);
  }, i = (n, a, o) => {
    const c = o.visibleRect?.width ?? o.codedWidth, l = o.visibleRect?.height ?? o.codedHeight, u = c * l, d = Math.ceil(c / 2), f = Math.ceil(l / 2), h = u + d * f * 2, g = new Uint8Array(h);
    for (let b = 0, k = 3; b < u; b++, k += 4)
      g[b] = n[k];
    g.fill(128, u);
    const m = new VideoFrame(n, {
      format: a === "RGBA" ? "RGBX" : "BGRX",
      codedWidth: c,
      codedHeight: l,
      timestamp: o.timestamp,
      duration: o.duration ?? void 0
      // No transfer!
    }), w = {
      format: "I420",
      codedWidth: c,
      codedHeight: l,
      timestamp: o.timestamp,
      duration: o.duration ?? void 0,
      transfer: [g.buffer]
    }, y = new VideoFrame(g, w);
    return { colorFrame: m, alphaFrame: y };
  }, s = (n, a, o) => {
    const c = o.visibleRect?.width ?? o.codedWidth, l = o.visibleRect?.height ?? o.codedHeight, u = a.includes("P10"), d = a.includes("P12"), f = u || d ? 2 : 1;
    let h, g;
    a.startsWith("I420") ? (h = Math.ceil(c / 2), g = Math.ceil(l / 2)) : a.startsWith("I422") ? (h = Math.ceil(c / 2), g = l) : (h = c, g = l);
    const m = c * l, w = h * g, y = m * f, b = w * f, k = m * f, S = y + b * 2, T = a.replace("A", ""), A = Math.ceil(c / 2), C = Math.ceil(l / 2), _ = A * C, x = _ * f, I = k + 2 * x, E = new Uint8Array(I), v = S;
    E.set(n.subarray(v, v + k), 0);
    const M = k, W = u ? 512 : d ? 2048 : 128;
    f === 1 ? E.fill(W, M) : new Uint16Array(E.buffer, M, 2 * _).fill(W);
    const O = u ? "I420P10" : d ? "I420P12" : "I420", z = new VideoFrame(n.subarray(0, S), {
      format: T,
      codedWidth: c,
      codedHeight: l,
      timestamp: o.timestamp,
      duration: o.duration ?? void 0
    }), Q = {
      format: O,
      codedWidth: c,
      codedHeight: l,
      timestamp: o.timestamp,
      duration: o.duration ?? void 0,
      transfer: [E.buffer]
    }, J = new VideoFrame(E, Q);
    return { colorFrame: z, alphaFrame: J };
  };
};
class po extends dr {
  /**
   * Creates a new {@link VideoSampleSource} whose samples are encoded according to the specified
   * {@link VideoEncodingConfig}.
   */
  constructor(e) {
    Vn(e), super(e.codec), this._encoder = new Xn(this, e);
  }
  /**
   * Encodes a video sample (frame) and then adds it to the output.
   *
   * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
   * to respect writer and encoder backpressure.
   */
  add(e, t) {
    if (!(e instanceof be))
      throw new TypeError("videoSample must be a VideoSample.");
    return this._encoder.add(e, !1, t);
  }
  /** @internal */
  _flushAndClose(e) {
    return this._encoder.flushAndClose(e);
  }
}
class qm extends dr {
  /**
   * Creates a new {@link CanvasSource} from a canvas element or `OffscreenCanvas` whose samples are encoded
   * according to the specified {@link VideoEncodingConfig}.
   */
  constructor(e, t) {
    if (!(typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement) && !(typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas))
      throw new TypeError("canvas must be an HTMLCanvasElement or OffscreenCanvas.");
    Vn(t), super(t.codec), this._encoder = new Xn(this, t), this._canvas = e;
  }
  /**
   * Captures the current canvas state as a video sample (frame), encodes it and adds it to the output.
   *
   * @param timestamp - The timestamp of the sample, in seconds.
   * @param duration - The duration of the sample, in seconds.
   *
   * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
   * to respect writer and encoder backpressure.
   */
  add(e, t = 0, i) {
    if (!Number.isFinite(e) || e < 0)
      throw new TypeError("timestamp must be a non-negative number.");
    if (!Number.isFinite(t) || t < 0)
      throw new TypeError("duration must be a non-negative number.");
    const s = new be(this._canvas, { timestamp: e, duration: t });
    return this._encoder.add(s, !0, i);
  }
  /** @internal */
  _flushAndClose(e) {
    return this._encoder.flushAndClose(e);
  }
}
class Hm extends dr {
  /** A promise that rejects upon any error within this source. This promise never resolves. */
  get errorPromise() {
    return this._errorPromiseAccessed = !0, this._promiseWithResolvers.promise;
  }
  /** Whether this source is currently paused as a result of calling `.pause()`. */
  get paused() {
    return this._paused;
  }
  /**
   * Creates a new {@link MediaStreamVideoTrackSource} from a
   * [`MediaStreamVideoTrack`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack), which will pull
   * video samples from the stream in real time and encode them according to {@link VideoEncodingConfig}.
   */
  constructor(e, t, i = {}) {
    if (!(e instanceof MediaStreamTrack) || e.kind !== "video")
      throw new TypeError("track must be a video MediaStreamTrack.");
    if (Vn(t), typeof i != "object" || !i)
      throw new TypeError("options must be an object.");
    if (i.frameRate != null && (typeof i.frameRate != "number" || i.frameRate <= 0))
      throw new TypeError("options.frameRate, when provided, must be either a positive number or null.");
    if (i.timestampBase !== void 0 && i.timestampBase !== "synced-zero" && i.timestampBase !== "zero" && i.timestampBase !== "unix")
      throw new TypeError("options.timestampBase, when provided, must be one of 'synced-zero', 'zero', or 'unix'.");
    t = {
      ...t,
      latencyMode: "realtime"
    }, super(t.codec), this._abortController = null, this._workerTrackId = null, this._workerListener = null, this._promiseWithResolvers = ee(), this._errorPromiseAccessed = !1, this._paused = !1, this._lastVideoFrame = null, this._timerHandle = null, this._videoElement = null, this._options = i, this._encoder = new Xn(this, t), this._track = e;
  }
  /** @internal */
  async _start() {
    this._errorPromiseAccessed || D._warn("Make sure not to ignore the `errorPromise` field on MediaStreamVideoTrackSource, so that any internal errors get bubbled up properly.");
    const e = this._options.frameRate !== void 0 ? this._options.frameRate : this._track.getSettings().frameRate ?? null;
    this._abortController = new AbortController();
    let t = null, i = null, s = 0, n = !1, a = null, o = 0;
    const c = () => {
      if (p(e !== null), !this._lastVideoFrame)
        return;
      p(i !== null), p(t !== null);
      const d = performance.now();
      for (; d - i > 1e3 / e; ) {
        i += 1e3 / e;
        const f = t + s / e, h = new VideoFrame(this._videoElement ?? this._lastVideoFrame, {
          timestamp: 1e6 * f,
          duration: 1e6 / e
        });
        u(h, d);
      }
    };
    e !== null && (this._timerHandle = Wl(c, 4));
    const l = (d) => {
      if (e === null)
        u(d);
      else {
        const f = performance.now();
        this._lastVideoFrame ? (c(), this._lastVideoFrame?.close(), this._lastVideoFrame = d) : (u(d.clone(), f), i = f, this._lastVideoFrame = d);
      }
    }, u = (d, f = performance.now()) => {
      if (n) {
        d.close();
        return;
      }
      s++;
      const h = d.timestamp / 1e6;
      if (this._paused) {
        if (t !== null) {
          if (a !== null && this._options.timestampBase !== "unix") {
            const w = h - a;
            o -= w;
          }
          a = h;
        }
        d.close();
        return;
      }
      if (t === null) {
        t = h;
        let m;
        const w = this._options.timestampBase ?? "synced-zero";
        if (w === "unix")
          m = Date.now() / 1e3;
        else if (w === "zero")
          m = 0;
        else {
          const y = this._connectedTrack.output;
          y._firstMediaStreamTimestamp === null ? (y._firstMediaStreamTimestamp = f / 1e3, m = 0) : m = f / 1e3 - y._firstMediaStreamTimestamp;
        }
        o = m - t;
      }
      if (a = h, this._encoder.getQueueSize() >= 8) {
        d.close();
        return;
      }
      const g = new be(d, {
        timestamp: h + o
      });
      this._encoder.add(g, !0).catch((m) => {
        n = !0, this._abortController?.abort(), this._promiseWithResolvers.reject(m), this._workerTrackId !== null && Ds({
          type: "stopTrack",
          trackId: this._workerTrackId
        });
      });
    };
    if (typeof MediaStreamTrackProcessor < "u") {
      const d = new MediaStreamTrackProcessor({ track: this._track }), f = new WritableStream({ write: l });
      d.readable.pipeTo(f, {
        signal: this._abortController.signal
      }).catch((h) => {
        h instanceof DOMException && h.name === "AbortError" || this._promiseWithResolvers.reject(h);
      });
    } else if (await um())
      this._workerTrackId = cm++, Ds({
        type: "videoTrack",
        trackId: this._workerTrackId,
        track: this._track
      }), this._workerListener = (f) => {
        const h = f.data;
        h.type === "videoFrame" && h.trackId === this._workerTrackId ? l(h.videoFrame) : h.type === "error" && h.trackId === this._workerTrackId && this._promiseWithResolvers.reject(h.error);
      }, He.addEventListener("message", this._workerListener);
    else if (e !== null) {
      const f = document.createElement("video");
      f.style.position = "fixed", f.style.left = "-10000px", f.style.top = "-10000px", f.style.width = "1px", f.style.height = "1px", f.style.opacity = "0", f.style.pointerEvents = "none", f.muted = !0, f.srcObject = new MediaStream([this._track]), document.body.appendChild(f), this._videoElement = f, f.addEventListener("loadeddata", () => {
        if (n || !this._videoElement)
          return;
        const h = new VideoFrame(f, {
          timestamp: 1e3 * performance.now()
        });
        l(h), h.close();
      }, { once: !0 }), f.play().catch((h) => {
        n = !0, this._promiseWithResolvers.reject(h);
      });
    } else
      throw new Error("When no explicit frame rate is set, MediaStreamTrackProcessor is required; but it's not supported by this browser.");
  }
  /**
   * Pauses the capture of video frames - any video frames emitted by the underlying media stream will be ignored
   * while paused. This does *not* close the underlying `MediaStreamVideoTrack`, it just ignores its output.
   */
  pause() {
    this._paused = !0;
  }
  /** Resumes the capture of video frames after being paused. */
  resume() {
    this._paused = !1;
  }
  /** @internal */
  async _flushAndClose(e) {
    this._abortController && (this._abortController.abort(), this._abortController = null), this._timerHandle && Ll(this._timerHandle), this._lastVideoFrame?.close(), this._videoElement && (this._videoElement.srcObject = null, this._videoElement.remove(), this._videoElement = null), this._workerTrackId !== null && (p(this._workerListener), Ds({
      type: "stopTrack",
      trackId: this._workerTrackId
    }), await new Promise((t) => {
      const i = (s) => {
        const n = s.data;
        n.type === "trackStopped" && n.trackId === this._workerTrackId && (p(this._workerListener), He.removeEventListener("message", this._workerListener), He.removeEventListener("message", i), t());
      };
      He.addEventListener("message", i);
    })), await this._encoder.flushAndClose(e);
  }
}
class fr extends Gn {
  /** Internal constructor. */
  constructor(e) {
    if (super(), this._connectedTrack = null, !we.includes(e))
      throw new TypeError(`Invalid audio codec '${e}'. Must be one of: ${we.join(", ")}.`);
    this._codec = e;
  }
}
class yn extends fr {
  /** Creates a new {@link EncodedAudioPacketSource} whose packets are encoded using `codec`. */
  constructor(e) {
    super(e);
  }
  /**
   * Adds an encoded packet to the output audio track. Packets must be added in *decode order*.
   *
   * @param meta - Additional metadata from the encoder. You should pass this for the first call, including a valid
   * decoder config.
   *
   * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
   * to respect writer and encoder backpressure.
   */
  add(e, t) {
    if (!(e instanceof Z))
      throw new TypeError("packet must be an EncodedPacket.");
    if (e.isMetadataOnly)
      throw new TypeError("Metadata-only packets cannot be added.");
    if (t !== void 0 && (!t || typeof t != "object"))
      throw new TypeError("meta, when provided, must be an object.");
    return this._ensureValidAdd(), this._connectedTrack.output._muxer.addEncodedAudioPacket(this._connectedTrack, e, t);
  }
}
class Yn {
  setError(e) {
    this.errorSet || (this.error = e, this.errorSet = !0);
  }
  constructor(e, t) {
    this.source = e, this.encodingConfig = t, this.ensureEncoderPromise = null, this.encoderInitialized = !1, this.encoder = null, this.muxer = null, this.lastNumberOfChannels = null, this.lastSampleRate = null, this.isPcmEncoder = !1, this.outputSampleSize = null, this.writeOutputValue = null, this.customEncoder = null, this.customEncoderCallSerializer = new $r(), this.customEncoderQueueSize = 0, this.lastEndSampleIndex = null, this.resampler = null, this.error = null, this.errorSet = !1, this.lastMuxerPromise = Promise.resolve(), this.closed = !1;
  }
  async add(e, t) {
    try {
      if (this.checkForEncoderError(), this.source._ensureValidAdd(), this.lastNumberOfChannels !== null && this.lastSampleRate !== null) {
        if (e.numberOfChannels !== this.lastNumberOfChannels || e.sampleRate !== this.lastSampleRate)
          throw new Error(`Audio parameters must remain constant. Expected ${this.lastNumberOfChannels} channels at ${this.lastSampleRate} Hz, got ${e.numberOfChannels} channels at ${e.sampleRate} Hz.`);
      } else
        this.lastNumberOfChannels = e.numberOfChannels, this.lastSampleRate = e.sampleRate;
      const i = this.encodingConfig;
      i.transform?.numberOfChannels !== void 0 || i.transform?.sampleRate !== void 0 ? (this.resampler || (this.resampler = new tm({
        targetNumberOfChannels: i.transform.numberOfChannels ?? e.numberOfChannels,
        targetSampleRate: i.transform.sampleRate ?? e.sampleRate,
        onSample: async (n) => {
          await this.processAndEncode(n, !0);
        }
      })), await this.resampler.add(e)) : await this.processAndEncode(e, t);
    } finally {
      t && e.close();
    }
  }
  /**
   * Runs the process function (if any) and encodes the resulting samples.
   */
  async processAndEncode(e, t) {
    const i = this.encodingConfig;
    if (i.transform?.sampleFormat !== void 0 && Wd(e.format) !== i.transform.sampleFormat) {
      const s = qd(e, i.transform.sampleFormat);
      t && e.close(), e = s, t = !0;
    }
    if (i.transform?.process)
      try {
        let s = i.transform.process(e);
        if (s instanceof Promise && (s = await s), s === null)
          return;
        Array.isArray(s) || (s = [s]);
        try {
          for (const n of s)
            if (!(n instanceof fe))
              throw new TypeError("The audio process function must return an AudioSample, null, or an array of AudioSamples.");
          for (const n of s)
            await this.encodeSample(n, !0);
        } finally {
          for (const n of s)
            n instanceof fe && n.close();
        }
      } finally {
        t && e.close();
      }
    else
      await this.encodeSample(e, t);
  }
  /**
   * Encodes a single audio sample, handling encoder init, gap padding, and backpressure.
   */
  async encodeSample(e, t) {
    try {
      if (this.encoderInitialized || (this.ensureEncoderPromise || this.ensureEncoder(e), this.encoderInitialized || await this.ensureEncoderPromise), p(this.encoderInitialized), this.closed)
        return;
      {
        const i = Math.round(e.timestamp * e.sampleRate), s = Math.round((e.timestamp + e.duration) * e.sampleRate);
        if (this.lastEndSampleIndex === null)
          this.lastEndSampleIndex = s;
        else {
          const n = i - this.lastEndSampleIndex;
          if (n >= 64) {
            const a = new fe({
              data: new Float32Array(n * e.numberOfChannels),
              format: "f32-planar",
              sampleRate: e.sampleRate,
              numberOfChannels: e.numberOfChannels,
              numberOfFrames: n,
              timestamp: this.lastEndSampleIndex / e.sampleRate
            });
            await this.encodeSample(a, !0);
          }
          this.lastEndSampleIndex += e.numberOfFrames;
        }
      }
      if (this.encodingConfig.onEncodedSample?.(e), this.customEncoder) {
        this.customEncoderQueueSize++;
        const i = e.clone(), s = this.customEncoderCallSerializer.call(() => this.customEncoder.encode(i)).catch((n) => this.setError(n)).finally(() => {
          this.customEncoderQueueSize--, i.close();
        });
        this.customEncoderQueueSize >= 4 && await s, await this.lastMuxerPromise;
      } else if (this.isPcmEncoder)
        await this.doPcmEncoding(e, t);
      else {
        p(this.encoder);
        const i = e.toAudioData();
        this.encoder.encode(i), i.close(), t && e.close(), this.encoder.encodeQueueSize >= 4 && await new Promise((s) => this.encoder.addEventListener("dequeue", s, { once: !0 })), await this.lastMuxerPromise;
      }
    } finally {
      t && e.close();
    }
  }
  async doPcmEncoding(e, t) {
    p(this.outputSampleSize), p(this.writeOutputValue);
    const { numberOfChannels: i, numberOfFrames: s, sampleRate: n, timestamp: a } = e, o = 2048, c = [];
    for (let f = 0; f < s; f += o) {
      const h = Math.min(o, e.numberOfFrames - f), g = h * i * this.outputSampleSize, m = new ArrayBuffer(g), w = new DataView(m);
      c.push({ frameCount: h, view: w });
    }
    const l = e.allocationSize({ planeIndex: 0, format: "f32-planar" }), u = new Float32Array(l / Float32Array.BYTES_PER_ELEMENT);
    for (let f = 0; f < i; f++) {
      e.copyTo(u, { planeIndex: f, format: "f32-planar" });
      for (let h = 0; h < c.length; h++) {
        const { frameCount: g, view: m } = c[h];
        for (let w = 0; w < g; w++)
          this.writeOutputValue(m, (w * i + f) * this.outputSampleSize, u[h * o + w]);
      }
    }
    t && e.close();
    const d = {
      decoderConfig: {
        codec: this.encodingConfig.codec,
        numberOfChannels: i,
        sampleRate: n
      }
    };
    for (let f = 0; f < c.length; f++) {
      const { frameCount: h, view: g } = c[f], m = g.buffer, w = f * o, y = new Z(new Uint8Array(m), "key", a + w / n, h / n);
      this.encodingConfig.onEncodedPacket?.(y, d), await this.muxer.addEncodedAudioPacket(this.source._connectedTrack, y, d);
    }
  }
  ensureEncoder(e) {
    this.ensureEncoderPromise = (async () => {
      const { numberOfChannels: t, sampleRate: i } = e, s = bi(this.encodingConfig.quality, this.encodingConfig.bitrate), n = Xc({
        numberOfChannels: t,
        sampleRate: i,
        ...this.encodingConfig,
        quality: s
      });
      this.encodingConfig.onEncoderConfig?.(n);
      const a = Lr.find((o) => o.supports(this.encodingConfig.codec, n));
      if (a)
        this.customEncoder = new a(), this.customEncoder.codec = this.encodingConfig.codec, this.customEncoder.config = n, this.customEncoder.onPacket = (o, c) => {
          if (!(o instanceof Z))
            throw new TypeError("The first argument passed to onPacket must be an EncodedPacket.");
          if (c !== void 0 && (!c || typeof c != "object"))
            throw new TypeError("The second argument passed to onPacket must be an object or undefined.");
          this.encodingConfig.onEncodedPacket?.(o, c), this.lastMuxerPromise = this.muxer.addEncodedAudioPacket(this.source._connectedTrack, o, c).catch((l) => {
            this.setError(l);
          });
        }, this.customEncoder.onError = (o) => {
          this.setError(o);
        }, await this.customEncoder.init();
      else if (ge.includes(this.encodingConfig.codec))
        this.initPcmEncoder();
      else {
        if (typeof AudioEncoder > "u")
          throw new Error("AudioEncoder is not supported by this browser.");
        let o;
        try {
          o = (await AudioEncoder.isConfigSupported(n)).supported ?? !1;
        } catch {
          o = !1;
        }
        if (!o)
          throw new Error(`This specific encoder configuration (${n.codec}, ${n.bitrate} bps, ${n.numberOfChannels} channels, ${n.sampleRate} Hz) is not supported by this browser. Consider using another codec or changing your audio parameters.`);
        const c = new Error("Encoding error").stack;
        this.encoder = new AudioEncoder({
          output: (l, u) => {
            if (this.encodingConfig.codec === "aac" && u?.decoderConfig) {
              let f = !1;
              if (!u.decoderConfig.description || u.decoderConfig.description.byteLength < 2 ? f = !0 : f = cr(te(u.decoderConfig.description)).objectType === 0, f) {
                const h = Number(ne(n.codec.split(".")));
                u.decoderConfig.description = xn({
                  objectType: h,
                  numberOfChannels: u.decoderConfig.numberOfChannels,
                  sampleRate: u.decoderConfig.sampleRate
                });
              }
            }
            let d = Z.fromEncodedChunk(l);
            d = d.clone({
              timestamp: wi(d.timestamp, n.sampleRate),
              duration: l.duration != null ? wi(d.duration, n.sampleRate) : void 0
            }), this.encodingConfig.onEncodedPacket?.(d, u), this.lastMuxerPromise = this.muxer.addEncodedAudioPacket(this.source._connectedTrack, d, u).catch((f) => {
              this.setError(f);
            });
          },
          error: (l) => {
            l.stack = c, this.setError(l);
          }
        }), this.encoder.configure(n);
      }
      p(this.source._connectedTrack), this.muxer = this.source._connectedTrack.output._muxer, this.encoderInitialized = !0;
    })();
  }
  initPcmEncoder() {
    this.isPcmEncoder = !0;
    const e = this.encodingConfig.codec, { dataType: t, sampleSize: i, littleEndian: s } = Qe(e);
    switch (this.outputSampleSize = i, i) {
      case 1:
        t === "unsigned" ? this.writeOutputValue = (n, a, o) => n.setUint8(a, le((o + 1) * 127.5, 0, 255)) : t === "signed" ? this.writeOutputValue = (n, a, o) => {
          n.setInt8(a, le(Math.round(o * 128), -128, 127));
        } : t === "ulaw" ? this.writeOutputValue = (n, a, o) => {
          const c = le(Math.floor(o * 32767), -32768, 32767);
          n.setUint8(a, Zd(c));
        } : t === "alaw" ? this.writeOutputValue = (n, a, o) => {
          const c = le(Math.floor(o * 32767), -32768, 32767);
          n.setUint8(a, ef(c));
        } : p(!1);
        break;
      case 2:
        t === "unsigned" ? this.writeOutputValue = (n, a, o) => n.setUint16(a, le((o + 1) * 32767.5, 0, 65535), s) : t === "signed" ? this.writeOutputValue = (n, a, o) => n.setInt16(a, le(Math.round(o * 32767), -32768, 32767), s) : p(!1);
        break;
      case 3:
        t === "unsigned" ? this.writeOutputValue = (n, a, o) => Qr(n, a, le((o + 1) * 83886075e-1, 0, 16777215), s) : t === "signed" ? this.writeOutputValue = (n, a, o) => El(n, a, le(Math.round(o * 8388607), -8388608, 8388607), s) : p(!1);
        break;
      case 4:
        t === "unsigned" ? this.writeOutputValue = (n, a, o) => n.setUint32(a, le((o + 1) * 21474836475e-1, 0, 4294967295), s) : t === "signed" ? this.writeOutputValue = (n, a, o) => n.setInt32(a, le(Math.round(o * 2147483647), -2147483648, 2147483647), s) : t === "float" ? this.writeOutputValue = (n, a, o) => n.setFloat32(a, o, s) : p(!1);
        break;
      case 8:
        t === "float" ? this.writeOutputValue = (n, a, o) => n.setFloat64(a, o, s) : p(!1);
        break;
      default:
        pe(i), p(!1);
    }
  }
  async flushAndClose(e) {
    try {
      e || (this.checkForEncoderError(), this.resampler && await this.resampler.finalize()), this.closed = !0, e || (this.customEncoder ? this.customEncoderCallSerializer.call(() => this.customEncoder.flush()) : this.encoder && await this.encoder.flush());
    } finally {
      this.closed = !0, this.resampler = null, this.customEncoder ? await this.customEncoderCallSerializer.call(() => this.customEncoder.close()).catch((t) => this.setError(t)) : this.encoder && this.encoder.state !== "closed" && this.encoder.close();
    }
    e || this.checkForEncoderError();
  }
  getQueueSize() {
    return this.customEncoder ? this.customEncoderQueueSize : this.isPcmEncoder ? 0 : this.encoder?.encodeQueueSize ?? 0;
  }
  checkForEncoderError() {
    if (this.errorSet)
      throw this.error;
  }
}
class am extends fr {
  /**
   * Creates a new {@link AudioSampleSource} whose samples are encoded according to the specified
   * {@link AudioEncodingConfig}.
   */
  constructor(e) {
    Wn(e), super(e.codec), this._encoder = new Yn(this, e);
  }
  /**
   * Encodes an audio sample and then adds it to the output.
   *
   * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
   * to respect writer and encoder backpressure.
   */
  add(e) {
    if (!(e instanceof fe))
      throw new TypeError("audioSample must be an AudioSample.");
    return this._encoder.add(e, !1);
  }
  /** @internal */
  _flushAndClose(e) {
    return this._encoder.flushAndClose(e);
  }
}
class jm extends fr {
  /**
   * Creates a new {@link AudioBufferSource} whose `AudioBuffer` instances are encoded according to the specified
   * {@link AudioEncodingConfig}.
   */
  constructor(e) {
    Wn(e), super(e.codec), this._accumulatedTime = 0, this._encoder = new Yn(this, e);
  }
  /**
   * Converts an AudioBuffer to audio samples, encodes them and adds them to the output. The first AudioBuffer will
   * be played at timestamp 0, and any subsequent AudioBuffer will have a timestamp equal to the total duration of
   * all previous AudioBuffers.
   *
   * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
   * to respect writer and encoder backpressure.
   */
  async add(e) {
    if (!(e instanceof AudioBuffer))
      throw new TypeError("audioBuffer must be an AudioBuffer.");
    const t = fe._fromAudioBuffer(e, this._accumulatedTime);
    this._accumulatedTime += e.duration;
    for (const i of t)
      await this._encoder.add(i, !0);
  }
  /** @internal */
  _flushAndClose(e) {
    return this._encoder.flushAndClose(e);
  }
}
class Km extends fr {
  /** A promise that rejects upon any error within this source. This promise never resolves. */
  get errorPromise() {
    return this._errorPromiseAccessed = !0, this._promiseWithResolvers.promise;
  }
  /** Whether this source is currently paused as a result of calling `.pause()`. */
  get paused() {
    return this._paused;
  }
  /**
   * Creates a new {@link MediaStreamAudioTrackSource} from a `MediaStreamAudioTrack`, which will pull audio samples
   * from the stream in real time and encode them according to {@link AudioEncodingConfig}.
   */
  constructor(e, t, i = {}) {
    if (!(e instanceof MediaStreamTrack) || e.kind !== "audio")
      throw new TypeError("track must be an audio MediaStreamTrack.");
    if (Wn(t), typeof i != "object" || !i)
      throw new TypeError("options must be an object.");
    if (i.timestampBase !== void 0 && i.timestampBase !== "synced-zero" && i.timestampBase !== "zero" && i.timestampBase !== "unix")
      throw new TypeError("options.timestampBase, when provided, must be one of 'synced-zero', 'zero', or 'unix'.");
    super(t.codec), this._abortController = null, this._audioContext = null, this._scriptProcessorNode = null, this._promiseWithResolvers = ee(), this._errorPromiseAccessed = !1, this._paused = !1, this._options = i, this._encoder = new Yn(this, t), this._track = e;
  }
  /** @internal */
  async _start() {
    this._errorPromiseAccessed || D._warn("Make sure not to ignore the `errorPromise` field on MediaStreamAudioTrackSource, so that any internal errors get bubbled up properly."), this._abortController = new AbortController();
    let e = null, t = !1, i = null, s = 0;
    const n = (a) => {
      if (t) {
        a.close();
        return;
      }
      const o = a.timestamp;
      if (this._paused) {
        if (e !== null) {
          if (i !== null && this._options.timestampBase !== "unix") {
            const l = o - i;
            s -= l;
          }
          i = o;
        }
        a.close();
        return;
      }
      if (e === null) {
        e = a.timestamp;
        let c;
        const l = this._options.timestampBase ?? "synced-zero";
        if (l === "unix")
          c = Date.now() / 1e3;
        else if (l === "zero")
          c = 0;
        else {
          const u = this._connectedTrack.output;
          u._firstMediaStreamTimestamp === null ? (u._firstMediaStreamTimestamp = performance.now() / 1e3, c = 0) : c = performance.now() / 1e3 - u._firstMediaStreamTimestamp;
        }
        s = c - e;
      }
      if (i = o, this._encoder.getQueueSize() >= 8) {
        a.close();
        return;
      }
      a.setTimestamp(o + s), this._encoder.add(a, !0).catch((c) => {
        t = !0, this._abortController?.abort(), this._promiseWithResolvers.reject(c), this._audioContext?.suspend();
      });
    };
    if (typeof MediaStreamTrackProcessor < "u") {
      const a = new MediaStreamTrackProcessor({ track: this._track }), o = new WritableStream({
        write: (c) => n(new fe(c))
      });
      a.readable.pipeTo(o, {
        signal: this._abortController.signal
      }).catch((c) => {
        c instanceof DOMException && c.name === "AbortError" || this._promiseWithResolvers.reject(c);
      });
    } else {
      const a = window.AudioContext || window.webkitAudioContext;
      this._audioContext = new a({ sampleRate: this._track.getSettings().sampleRate });
      const o = this._audioContext.createMediaStreamSource(new MediaStream([this._track]));
      this._scriptProcessorNode = this._audioContext.createScriptProcessor(4096), this._audioContext.state === "suspended" && await this._audioContext.resume(), o.connect(this._scriptProcessorNode), this._scriptProcessorNode.connect(this._audioContext.destination);
      let c = 0;
      this._scriptProcessorNode.onaudioprocess = (l) => {
        const u = fe._fromAudioBuffer(l.inputBuffer, c);
        c += l.inputBuffer.duration;
        for (const d of u)
          n(d);
      };
    }
  }
  /**
   * Pauses the capture of audio data - any audio data emitted by the underlying media stream will be ignored
   * while paused. This does *not* close the underlying `MediaStreamAudioTrack`, it just ignores its output.
   */
  pause() {
    this._paused = !0;
  }
  /** Resumes the capture of audio data after being paused. */
  resume() {
    this._paused = !1;
  }
  /** @internal */
  async _flushAndClose(e) {
    this._abortController && (this._abortController.abort(), this._abortController = null), this._audioContext && (p(this._scriptProcessorNode), this._scriptProcessorNode.disconnect(), await this._audioContext.suspend()), await this._encoder.flushAndClose(e);
  }
}
const om = () => {
  const r = (i, s) => {
    s ? self.postMessage(i, { transfer: s }) : self.postMessage(i);
  };
  r({
    type: "support",
    supported: typeof MediaStreamTrackProcessor < "u"
  });
  const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map();
  self.addEventListener("message", (i) => {
    const s = i.data;
    switch (s.type) {
      case "videoTrack":
        {
          t.set(s.trackId, s.track);
          const n = new MediaStreamTrackProcessor({ track: s.track }), a = new WritableStream({
            write: (c) => {
              if (!t.has(s.trackId)) {
                c.close();
                return;
              }
              r({
                type: "videoFrame",
                trackId: s.trackId,
                videoFrame: c
              }, [c]);
            }
          }), o = new AbortController();
          e.set(s.trackId, o), n.readable.pipeTo(a, {
            signal: o.signal
          }).catch((c) => {
            c instanceof DOMException && c.name === "AbortError" || r({
              type: "error",
              trackId: s.trackId,
              error: c
            });
          });
        }
        break;
      case "stopTrack":
        {
          const n = e.get(s.trackId);
          n && (n.abort(), e.delete(s.trackId)), t.get(s.trackId)?.stop(), t.delete(s.trackId), r({
            type: "trackStopped",
            trackId: s.trackId
          });
        }
        break;
      default:
        pe(s);
    }
  });
};
let cm = 0, He = null;
const lm = () => {
  const r = new Blob([`(${om.toString()})()`], { type: "application/javascript" }), e = URL.createObjectURL(r);
  He = new Worker(e);
};
let zs = null;
const um = async () => zs !== null ? zs : (He || lm(), new Promise((r) => {
  p(He);
  const e = (t) => {
    const i = t.data;
    i.type === "support" && (zs = i.supported, He.removeEventListener("message", e), r(i.supported));
  };
  He.addEventListener("message", e);
})), Ds = (r, e) => {
  p(He), He.postMessage(r);
};
class yl extends Gn {
  /** Internal constructor. */
  constructor(e) {
    if (super(), this._connectedTrack = null, !tt.includes(e))
      throw new TypeError(`Invalid subtitle codec '${e}'. Must be one of: ${tt.join(", ")}.`);
    this._codec = e;
  }
}
class Qm extends yl {
  /** Creates a new {@link TextSubtitleSource} where added text chunks are in the specified `codec`. */
  constructor(e) {
    super(e), this._error = null, this._errorSet = !1, this._lastMuxerPromise = Promise.resolve(), this._parser = new Tf({
      codec: e,
      output: (t, i) => {
        this._lastMuxerPromise = this._connectedTrack.output._muxer.addSubtitleCue(this._connectedTrack, t, i).catch((s) => {
          this._setError(s);
        });
      }
    });
  }
  /**
   * Parses the subtitle text according to the specified codec and adds it to the output track. You don't have to
   * add the entire subtitle file at once here; you can provide it in chunks.
   *
   * @returns A Promise that resolves once the output is ready to receive more samples. You should await this Promise
   * to respect writer and encoder backpressure.
   */
  add(e) {
    if (typeof e != "string")
      throw new TypeError("text must be a string.");
    return this._checkForError(), this._ensureValidAdd(), this._parser.parse(e), this._lastMuxerPromise;
  }
  /** @internal */
  _setError(e) {
    this._errorSet || (this._error = e, this._errorSet = !0);
  }
  /** @internal */
  _checkForError() {
    if (this._errorSet)
      throw this._error;
  }
  /** @internal */
  async _flushAndClose(e) {
    e || this._checkForError();
  }
}
class dm extends kt {
  constructor(e, t) {
    if (!(e._target instanceof Pt))
      throw new TypeError("HLS outputs require `OutputOptions.target` to be a PathedTarget.");
    super(e), this.trackDatas = [], this.isRelativeToUnixEpoch = !1, this.numWrittenMasterPlaylists = 0, this.playlists = [], this.playlistDeclarations = [], this.format = t, this.targetSegmentDuration = t._options.targetDuration ?? 2, this.singleFilePerPlaylist = t._options.singleFilePerPlaylist ?? !1, this.isLive = t._options.live ?? !1, this.maxLiveSegmentCount = t._options.maxLiveSegmentCount ?? 1 / 0, this.globalTargetDuration = this.targetSegmentDuration, this.getPlaylistPath = t._options.getPlaylistPath ?? (({ n: i }) => `playlist-${i}.m3u8`), this.getSegmentPath = t._options.getSegmentPath ?? ((i) => i.isSingleFile ? `segments-${i.playlist.n}${i.format.fileExtension}` : `segment-${i.playlist.n}-${i.n}${i.format.fileExtension}`), this.getInitPath = t._options.getInitPath ?? ((i) => `init-${i.n}${i.segmentFormat.fileExtension}`);
  }
  async start() {
    const e = await this.mutex.acquire(), t = this.output.tracks.some((w) => w.metadata.isRelativeToUnixEpoch), i = this.output.tracks.some((w) => !w.metadata.isRelativeToUnixEpoch);
    if (t && i)
      throw new Error("All tracks must agree on `relativeToUnixEpoch`: some tracks are relative to the Unix epoch and some are not.");
    this.isRelativeToUnixEpoch = t;
    const s = /* @__PURE__ */ new Map(), n = [];
    let a = !1, o = !1, c = !1;
    for (const w of this.output.tracks) {
      w.type === "video" && (a = !0);
      const y = /* @__PURE__ */ new Map();
      for (const b of this.output.tracks) {
        if (w === b || !w.canBePairedWith(b))
          continue;
        if (w.type === b.type) {
          o || (D._warn(`Illegal pairing of two ${w.type} tracks detected, which is not possible in HLS; treating them as unpaired.`), o = !0);
          continue;
        }
        if (w.isVideoTrack() && w.metadata.hasOnlyKeyPackets || b.isVideoTrack() && b.metadata.hasOnlyKeyPackets) {
          c || (D._warn("A key-packets-only video track is pairable with another track, which is not possible in HLS; treating them as unpaired."), c = !0);
          continue;
        }
        let k = y.get(b.source._codec);
        k || y.set(b.source._codec, k = []), k.push(b);
      }
      for (const [, b] of y) {
        const k = b.map((A) => A.id).join("-");
        n.find((A) => A.key === k) || n.push({
          name: b[0].type + "-" + (n.length + 1),
          key: k,
          tracks: b,
          needsEmit: !1,
          firstNoUri: !1
        });
        let T = s.get(w);
        T || s.set(w, T = []), T.push(k);
      }
    }
    const l = a ? "video" : "audio", u = [], d = [], f = [];
    for (const w of this.output.tracks) {
      const y = s.get(w);
      if (y) {
        if (p(y.length > 0), w.type !== l)
          continue;
        for (const b of y) {
          const k = n.find((S) => S.key === b);
          if (p(k), y.length === 1 && k.tracks.length === 1) {
            const S = s.get(k.tracks[0]);
            if (p(S !== void 0), S.length === 1) {
              const T = n.find((A) => A.key === S[0]);
              if (T.tracks.length === 1) {
                p(T.tracks[0] === w), u.push({
                  tracks: [w, k.tracks[0]],
                  linkedGroup: null
                });
                continue;
              }
            }
          }
          u.push({
            tracks: [w],
            linkedGroup: k
          }), k.needsEmit = !0;
        }
      } else
        w.type === "video" ? d.push(w) : w.type === "audio" && f.push(w);
    }
    const h = ({ metadata: w }) => {
      let y = "";
      return y += `${w.languageCode ?? ke}-`, y += `${w.name ?? ""}-`, y += `${w.disposition?.default ?? !0}-`, y += `${w.disposition?.primary ?? !1}-`, y += `${w.disposition?.forced ?? !1}-`, y;
    };
    if (d.length > 0)
      if (new Set(d.map(h)).size > 1) {
        const y = {
          key: d.map((b) => b.id).join("-"),
          name: "video-" + (n.length + 1),
          tracks: d,
          needsEmit: !0,
          firstNoUri: !0
        };
        n.push(y), u.push({
          tracks: [d[0]],
          linkedGroup: y
        });
      } else
        for (const y of d)
          u.push({
            tracks: [y],
            linkedGroup: null
          });
    if (f.length > 0)
      if (new Set(f.map(h)).size > 1) {
        const y = {
          key: f.map((b) => b.id).join("-"),
          name: "audio-" + (n.length + 1),
          tracks: f,
          needsEmit: !0,
          firstNoUri: !0
        };
        n.push(y), u.push({
          tracks: [f[0]],
          linkedGroup: y
        });
      } else
        for (const y of f)
          u.push({
            tracks: [y],
            linkedGroup: null
          });
    const g = (w) => {
      const y = [];
      let b = 0, k = 0, S = !1, T = null, A = -1 / 0;
      for (const C of w)
        C.isVideoTrack() ? (b++, S ||= (C.metadata.rotation ?? 0) !== 0) : C.isAudioTrack() && k++, y.push(C.source._codec);
      for (const C of fi(this.format._options.segmentFormat)) {
        const _ = C.getSupportedCodecs(), x = C.getSupportedTrackCounts();
        if (y.some((E) => !_.includes(E)) || b < x.video.min || b > x.video.max || k < x.audio.min || k > x.audio.max)
          continue;
        let I = 0;
        S && C.supportsVideoRotationMetadata && I++, I > A && (T = C, A = I);
      }
      return p(T), T;
    }, m = async (w) => {
      if (w.some((T) => this.playlists.some((A) => A.tracks.includes(T))))
        throw new Error("Internal error: track is already registered in a playlist.");
      const y = g(w), b = this.playlists.length + 1, k = await this.getPlaylistPath({
        n: b,
        tracks: w,
        segmentFormat: y
      });
      fm(k);
      const S = {
        id: this.playlists.length + 1,
        path: k,
        tracks: w,
        segmentFormat: y,
        currentSegmentStartTimestamp: null,
        currentSegmentStartTimestampIsFixed: !1,
        nextSegmentId: 1,
        initSegment: null,
        writtenSegments: [],
        peakBitrate: null,
        averageBitrate: null,
        mediaSequence: 0,
        done: !1,
        singleFile: null,
        mutex: new Yt()
      };
      return this.playlists.push(S), S;
    };
    for (const w of n)
      if (w.needsEmit)
        for (let y = 0; y < w.tracks.length; y++) {
          const b = w.tracks[y];
          let k = this.playlists.find((S) => S.tracks[0].id === b.id);
          k ??= await m([b]), this.playlistDeclarations.push({
            playlist: k,
            groupId: w.name,
            noUri: w.firstNoUri && y === 0,
            references: []
          });
        }
    for (const w of u) {
      let y = this.playlists.find((b) => b.tracks[0].id === w.tracks[0].id);
      y ??= await m(w.tracks), this.playlistDeclarations.push({
        playlist: y,
        groupId: null,
        noUri: !1,
        references: w.linkedGroup ? this.playlistDeclarations.filter((b) => b.groupId === w.linkedGroup.name) : []
      });
    }
    for (const w of this.output.tracks)
      w.isVideoTrack() && w.metadata.decoderConfig ? this.getVideoTrackData(w, w.metadata.primingPacket ?? null, { decoderConfig: w.metadata.decoderConfig }) : w.isAudioTrack() && w.metadata.decoderConfig && this.getAudioTrackData(w, w.metadata.primingPacket ?? null, { decoderConfig: w.metadata.decoderConfig });
    e();
  }
  async getMimeType() {
    return pi;
  }
  allTracksAreKnown(e) {
    for (const t of e.tracks)
      if (!t.source._closed && !this.trackDatas.some((i) => i.track === t))
        return !1;
    return !0;
  }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async onTrackClose(e) {
    const t = this.trackDatas.find((n) => n.track === e);
    t && (t.closed = !0);
    const i = this.playlists.find((n) => n.tracks.includes(e));
    p(i);
    const s = await i.mutex.acquire();
    try {
      await this.advancePlaylist(i);
    } finally {
      s();
    }
  }
  getVideoTrackData(e, t, i) {
    let s = this.trackDatas.find((a) => a.track === e);
    if (s)
      return s;
    lr(i, e.source._codec), p(i), p(i?.decoderConfig);
    const n = this.playlists.filter((a) => a.tracks.includes(e));
    return p(n.length === 1), s = {
      track: e,
      packets: [],
      playlist: n[0],
      closed: !1,
      info: {
        type: "video",
        decoderConfig: i.decoderConfig,
        primingPacket: t
      }
    }, this.trackDatas.push(s), s;
  }
  getAudioTrackData(e, t, i) {
    let s = this.trackDatas.find((a) => a.track === e);
    if (s)
      return s;
    $e(i, e.source._codec), p(i), p(i?.decoderConfig);
    const n = this.playlists.filter((a) => a.tracks.includes(e));
    return p(n.length === 1), s = {
      track: e,
      packets: [],
      playlist: n[0],
      closed: !1,
      info: {
        type: "audio",
        decoderConfig: i.decoderConfig,
        primingPacket: t
      }
    }, this.trackDatas.push(s), s;
  }
  async addEncodedVideoPacket(e, t, i) {
    const s = this.getVideoTrackData(e, t, i), n = s.playlist, a = await n.mutex.acquire();
    try {
      this.validateTimestamp(e, t.timestamp, t.type === "key"), s.packets.push(t), n.currentSegmentStartTimestamp === null ? n.currentSegmentStartTimestamp = t.timestamp : n.currentSegmentStartTimestampIsFixed || (n.currentSegmentStartTimestamp = Math.min(n.currentSegmentStartTimestamp, t.timestamp)), await this.advancePlaylist(n);
    } finally {
      a();
    }
  }
  async addEncodedAudioPacket(e, t, i) {
    const s = this.getAudioTrackData(e, t, i), n = s.playlist, a = await n.mutex.acquire();
    try {
      this.validateTimestamp(e, t.timestamp, t.type === "key"), s.packets.push(t), n.currentSegmentStartTimestamp === null ? n.currentSegmentStartTimestamp = t.timestamp : n.currentSegmentStartTimestampIsFixed || (n.currentSegmentStartTimestamp = Math.min(n.currentSegmentStartTimestamp, t.timestamp)), await this.advancePlaylist(n);
    } finally {
      a();
    }
  }
  async addSubtitleCue(e, t, i) {
    throw new Error("Unreachable.");
  }
  async advancePlaylist(e) {
    if (p(!e.done), !this.allTracksAreKnown(e))
      return;
    const t = this.trackDatas.filter((n) => e.tracks.includes(n.track));
    if (e.currentSegmentStartTimestamp === null) {
      t.every((n) => n.closed) && await this.onPlaylistDone(e);
      return;
    }
    const i = t.find((n) => n.info.type === "video"), s = t.find((n) => n.info.type === "audio");
    for (; ; ) {
      const n = e.currentSegmentStartTimestamp + this.targetSegmentDuration;
      let a = 0, o = 0;
      if (i && (!i.closed || i.packets.length > 0)) {
        const T = i.packets.every((_) => _.timestamp < n);
        let A = null, C = null;
        if (T) {
          if (!i.closed)
            return;
        } else
          for (let _ = 0; _ < i.packets.length; _++) {
            const x = i.packets[_];
            if (A !== null && x.timestamp > n)
              break;
            _ > 0 && x.type === "key" && (A = x, C = _);
          }
        if (C !== null) {
          if (a = C, s) {
            const _ = s.packets.findIndex((x) => x.timestamp >= A.timestamp);
            if (_ !== -1)
              o = _;
            else if (s.closed)
              o = s.packets.length;
            else
              return;
          }
        } else {
          if (!i.closed)
            return;
          a = i.packets.length;
          const _ = Ul(i.packets, (I) => I.timestamp), x = i.packets[_];
          if (p(x), s)
            if (x.timestamp < n) {
              const I = s.packets.findIndex((E) => E.timestamp >= n);
              if (I !== -1)
                o = I;
              else if (s.closed)
                o = s.packets.length;
              else
                return;
            } else {
              const I = s.packets.findIndex((E) => E.timestamp > x.timestamp);
              if (I !== -1)
                o = I;
              else if (s.closed)
                o = s.packets.length;
              else
                return;
            }
        }
      } else if (s && (!s.closed || s.packets.length > 0))
        if (s.packets.every((A) => A.timestamp < n))
          if (s.closed)
            o = s.packets.length;
          else
            return;
        else {
          const A = jr(s.packets, (C) => C.timestamp <= n);
          o = Math.max(A, 1);
        }
      if (a === 0 && o === 0) {
        t.every((A) => A.closed) && await this.onPlaylistDone(e);
        return;
      }
      let c = null, l, u;
      p(this.output._target instanceof Pt);
      const d = this.output._target;
      if (this.singleFilePerPlaylist)
        if (e.singleFile === null) {
          const T = {
            n: e.nextSegmentId,
            format: e.segmentFormat,
            isSingleFile: !0,
            playlist: kr(e)
          };
          l = await this.getSegmentPath(T), go(l), u = Ae(Ae(d.rootPath, e.path), l);
          const A = await this.output._getTarget({
            path: u,
            isRoot: !1,
            mimeType: e.segmentFormat.mimeType
          });
          let C = null;
          if (e.segmentFormat._isFragmentedIsobmff()) {
            C = {
              output: new Hr({
                format: e.segmentFormat,
                target: A
              }),
              videoSource: null,
              audioSource: null,
              firstMoofPosition: null,
              currentFileSize: 0
            }, A.on("write", ({ end: I }) => {
              C.currentFileSize = Math.max(C.currentFileSize, I);
            });
            const _ = C.output._muxer;
            _.minimumFragmentDuration = 1 / 0;
            const x = _.formatOptions.onMoof;
            _.formatOptions.onMoof = (I, E, v) => {
              C.firstMoofPosition = E, x?.(I, E, v), _.formatOptions.onMoof = x;
            }, i && (C.videoSource = new wn(i.track.source._codec), C.output.addVideoTrack(C.videoSource, {
              ...i.track.metadata,
              decoderConfig: i.info.decoderConfig,
              primingPacket: i.info.primingPacket ?? void 0
            })), s && (C.audioSource = new yn(s.track.source._codec), C.output.addAudioTrack(C.audioSource, {
              ...s.track.metadata,
              decoderConfig: s.info.decoderConfig,
              primingPacket: s.info.primingPacket ?? void 0
            })), await C.output.start();
          } else
            A._start();
          e.singleFile = {
            target: A,
            path: l,
            nextOffset: 0,
            info: T,
            fragmentedIsobmffOutput: C
          };
        } else
          l = e.singleFile.path, u = Ae(Ae(d.rootPath, e.path), l);
      else
        c = {
          n: e.nextSegmentId,
          format: e.segmentFormat,
          isSingleFile: !1,
          playlist: kr(e)
        }, l = await this.getSegmentPath(c), go(l), u = Ae(Ae(d.rootPath, e.path), l), e.nextSegmentId++;
      let f = 0, h = null, g = -1 / 0, m = null, w = null, y = null;
      try {
        if (e.singleFile?.fragmentedIsobmffOutput ? (m = e.singleFile.fragmentedIsobmffOutput.output, w = e.singleFile.fragmentedIsobmffOutput.videoSource, y = e.singleFile.fragmentedIsobmffOutput.audioSource) : (m = new Hr({
          format: e.segmentFormat,
          target: new Pt(u, async (T) => {
            const A = {
              ...T,
              isRoot: !1
            };
            if (T.isRoot)
              if (e.singleFile) {
                const C = e.singleFile.target.slice(e.singleFile.nextOffset);
                return C.on("write", ({ end: _ }) => f = Math.max(f, _)), C;
              } else {
                const C = await this.output._getTarget(A);
                return h = C, C.on("write", ({ end: _ }) => f = Math.max(f, _)), C;
              }
            return this.output._getTarget(A);
          }),
          initTarget: async () => {
            if (e.initSegment)
              return new ml();
            if (e.singleFile) {
              e.initSegment = {
                path: e.singleFile.path,
                duration: 0,
                timestamp: 0,
                byteSize: 0,
                byteOffset: 0,
                info: null
              };
              const T = e.singleFile.target.slice(e.singleFile.nextOffset);
              return T.on("write", ({ end: A }) => {
                e.initSegment.byteSize = Math.max(e.initSegment.byteSize, A);
              }), T.on("finalized", () => {
                e.singleFile.nextOffset = e.initSegment.byteSize;
              }), T;
            } else {
              const T = kr(e), A = await this.getInitPath(T);
              hm(A), e.initSegment = {
                path: A,
                duration: 0,
                timestamp: 0,
                byteSize: 0,
                byteOffset: null,
                info: null
              };
              const C = Ae(Ae(d.rootPath, e.path), A), _ = await this.output._getTarget({
                path: C,
                isRoot: !1,
                mimeType: e.segmentFormat.mimeType
              });
              return _.on("write", ({ end: x }) => {
                e.initSegment.byteSize = Math.max(e.initSegment.byteSize, x);
              }), _.on("finalized", () => {
                this.format._options.onInit?.(_, T);
              }), _;
            }
          }
        }), i && (w = new wn(i.track.source._codec), m.addVideoTrack(w, {
          ...i.track.metadata,
          decoderConfig: i.info.decoderConfig,
          primingPacket: i.info.primingPacket ?? void 0
        })), s && (y = new yn(s.track.source._codec), m.addAudioTrack(y, {
          ...s.track.metadata,
          decoderConfig: s.info.decoderConfig,
          primingPacket: s.info.primingPacket ?? void 0
        })), await m.start()), i) {
          p(w);
          const T = { decoderConfig: i.info.decoderConfig };
          for (let A = 0; A < a; A++) {
            const C = i.packets[A];
            await w.add(C, T), g = Math.max(g, C.timestamp + C.duration);
          }
        }
        if (s) {
          p(y);
          const T = { decoderConfig: s.info.decoderConfig };
          for (let A = 0; A < o; A++) {
            const C = s.packets[A];
            await y.add(C, T), g = Math.max(g, C.timestamp + C.duration);
          }
        }
        e.singleFile?.fragmentedIsobmffOutput ? (await e.singleFile.fragmentedIsobmffOutput.output._muxer.forceFragmentFinalization(), e.singleFile.fragmentedIsobmffOutput.firstMoofPosition !== null && !e.initSegment && (e.initSegment = {
          path: e.singleFile.path,
          duration: 0,
          timestamp: 0,
          byteSize: e.singleFile.fragmentedIsobmffOutput.firstMoofPosition,
          byteOffset: 0,
          info: null
        }, e.singleFile.nextOffset = e.singleFile.fragmentedIsobmffOutput.firstMoofPosition), f = e.singleFile.fragmentedIsobmffOutput.currentFileSize - e.singleFile.nextOffset) : await m.finalize();
      } catch (T) {
        throw await m?.cancel(), T;
      }
      c && (p(h), this.format._options.onSegment?.(h, c)), a > 0 && (p(i), i.packets.splice(0, a)), o > 0 && (p(s), s.packets.splice(0, o));
      let b = 1 / 0;
      i && i.packets.length > 0 && (b = i.packets[0].timestamp), s && s.packets.length > 0 && (b = Math.min(b, s.packets[0].timestamp));
      const k = b < 1 / 0 ? b : g;
      p(Number.isFinite(k));
      const S = k - e.currentSegmentStartTimestamp;
      if (p(S >= 0), e.writtenSegments.push({
        path: l,
        duration: S,
        timestamp: e.currentSegmentStartTimestamp,
        byteSize: f,
        byteOffset: e.singleFile ? e.singleFile.nextOffset : null,
        info: c ?? null
      }), this.globalTargetDuration = Math.max(this.globalTargetDuration, S), e.currentSegmentStartTimestamp = k, e.currentSegmentStartTimestampIsFixed = !0, e.singleFile && (e.singleFile.nextOffset += f), this.isLive) {
        for (; e.writtenSegments.length > this.maxLiveSegmentCount; ) {
          const T = e.writtenSegments.shift();
          e.mediaSequence++, this.singleFilePerPlaylist || (p(T.info), this.format._options.onSegmentPopped?.(T.path, T.info));
        }
        await this.writePlaylist(e), await this.tryWriteMasterPlaylist();
      }
    }
  }
  async onPlaylistDone(e) {
    p(!e.done), e.done = !0, e.singleFile && (e.singleFile.fragmentedIsobmffOutput ? await e.singleFile.fragmentedIsobmffOutput.output.finalize() : (await e.singleFile.target._flush(), await e.singleFile.target._finalize()), this.format._options.onSegment?.(e.singleFile.target, e.singleFile.info)), await this.writePlaylist(e), this.isLive && e.writtenSegments.length === 0 && await this.tryWriteMasterPlaylist();
  }
  updatePlaylistBitrates(e) {
    const t = e.writtenSegments;
    let i = 0, s = 0, n = 0;
    for (let a = 0; a < t.length; a++) {
      n += t[a].duration;
      let o = 0, c = 0;
      for (let l = a; l < t.length && (o += t[l].byteSize, c += t[l].duration, c >= 0.5 * this.globalTargetDuration && c <= 1.5 * this.globalTargetDuration && (i = Math.max(i, 8 * o / c)), !(c > 1.5 * this.globalTargetDuration)); l++)
        ;
    }
    if (i === 0)
      for (const a of t) {
        const o = a.duration || 1;
        i = Math.max(i, 8 * a.byteSize / o);
      }
    for (const a of t)
      s += 8 * a.byteSize;
    e.peakBitrate = i, e.averageBitrate = s / (n || 1);
  }
  async writePlaylist(e) {
    p(this.output._target instanceof Pt);
    const t = this.output._target;
    this.updatePlaylistBitrates(e);
    let i = !1;
    for (const d of e.writtenSegments)
      i ||= d.byteOffset !== null;
    const s = e.tracks[0].isVideoTrack() && e.tracks[0].metadata.hasOnlyKeyPackets;
    let n = 3;
    (s || i) && (n = 4), e.initSegment && (n = 5), e.initSegment && !s && (n = 6);
    const a = this.isLive ? this.targetSegmentDuration : this.globalTargetDuration, o = Ae(t.rootPath, e.path), c = `#EXTM3U
#EXT-X-VERSION:${n}
` + (this.isLive ? "" : `#EXT-X-PLAYLIST-TYPE:VOD
`) + `#EXT-X-TARGETDURATION:${Math.ceil(a)}
` + (Number.isFinite(this.maxLiveSegmentCount) ? `#EXT-X-MEDIA-SEQUENCE:${e.mediaSequence}
` : "") + `#EXT-X-INDEPENDENT-SEGMENTS
` + (s ? `#EXT-X-I-FRAMES-ONLY
` : "") + (e.initSegment ? `#EXT-X-MAP:URI="${e.initSegment.path}"` + (e.initSegment.byteOffset !== null ? `,BYTERANGE="${e.initSegment.byteSize}@${e.initSegment.byteOffset}"` : "") + `
` : "") + `
` + e.writtenSegments.map((d) => `#EXTINF:${+d.duration.toFixed(12)},
` + (this.isRelativeToUnixEpoch ? `#EXT-X-PROGRAM-DATE-TIME:${new Date(1e3 * d.timestamp).toISOString()}
` : "") + (d.byteOffset !== null ? `#EXT-X-BYTERANGE:${d.byteSize}@${d.byteOffset}
` : "") + `${d.path}
`).join("") + (e.done ? (e.writtenSegments.length > 0 ? `
` : "") + `#EXT-X-ENDLIST
` : "");
    this.format._options.onPlaylist?.(c, kr(e));
    const l = await this.output._getTarget({
      path: o,
      isRoot: !1,
      mimeType: pi
    }), u = new nr(l, !0);
    u.start(), u.write(Y.encode(c)), await u.flush(), await u.finalize();
  }
  async writeMasterPlaylist() {
    p(this.output._target instanceof Pt);
    const e = this.output._target;
    let t = `#EXTM3U
`, i = !1, s = null, n = 0, a = !1;
    for (const c of this.playlistDeclarations)
      if (c.groupId === null) {
        const l = c.playlist.tracks[0].isVideoTrack() && c.playlist.tracks[0].metadata.hasOnlyKeyPackets, u = [];
        for (const w of c.playlist.tracks) {
          const b = this.trackDatas.find((k) => k.track === w)?.info.decoderConfig.codec ?? w.source._codec;
          u.push(b);
        }
        let d = 0, f = 0;
        if (c.references.length > 0) {
          const y = c.references[0].playlist.tracks[0], k = this.trackDatas.find((S) => S.track === y)?.info.decoderConfig.codec ?? y.source._codec;
          u.push(k);
          for (const S of c.references)
            p(S.playlist.peakBitrate !== null), d = Math.max(d, S.playlist.peakBitrate), f = Math.max(f, S.playlist.averageBitrate ?? 0);
        }
        p(c.playlist.peakBitrate !== null);
        const h = c.playlist.peakBitrate + d, g = (c.playlist.averageBitrate ?? 0) + f;
        i || (t += `
`, i = !0), l ? t += "#EXT-X-I-FRAME-STREAM-INF:" : t += "#EXT-X-STREAM-INF:", t += `BANDWIDTH=${Math.ceil(h)}`, g > 0 && (t += `,AVERAGE-BANDWIDTH=${Math.ceil(g)}`), t += `,CODECS="${u.join(",")}"`;
        const m = c.playlist.tracks.find((w) => w.isVideoTrack());
        if (m?.isVideoTrack()) {
          const y = this.trackDatas.find((b) => b.track === m)?.info.decoderConfig;
          if (y) {
            let b = y.displayAspectWidth ?? y.codedWidth, k = y.displayAspectHeight ?? y.codedHeight;
            b !== void 0 && k !== void 0 && (m.metadata.rotation !== void 0 && m.metadata.rotation % 180 === 90 && ([b, k] = [k, b]), t += `,RESOLUTION=${b}x${k}`);
          }
          !l && m.metadata.frameRate !== void 0 && (t += `,FRAME-RATE=${+m.metadata.frameRate.toFixed(3)}`);
        }
        if (!l) {
          const w = /* @__PURE__ */ new Map();
          for (const y of c.references) {
            p(y.groupId !== null);
            const b = y.playlist.tracks[0].type;
            w.set(b, y.groupId);
          }
          for (const [y, b] of w)
            t += `,${y.toUpperCase()}="${b}"`;
        }
        l ? (t += `,URI="${c.playlist.path}"`, t += `
`) : (t += `
`, t += `${c.playlist.path}
`);
      } else {
        p(c.playlist.tracks.length === 1);
        const l = c.playlist.tracks[0], u = l.type;
        let d = l.metadata.name ?? null;
        const f = l.metadata.languageCode, h = l.metadata.disposition;
        (s === null || c.groupId !== s) && (n = 0, t += `
`, a = !1), s = c.groupId, n++, t += `#EXT-X-MEDIA:TYPE=${u.toUpperCase()},GROUP-ID="${c.groupId}"`, d !== null && /[\n\r"]/.test(d) && (D._warn("Dropping track name since it includes a line feed, carriage return, or double quote character, which are not allowed in HLS playlist attributes."), d = null), d ??= `${f ?? c.groupId}-${n}`, t += `,NAME="${d}"`, f !== void 0 && (t += `,LANGUAGE="${f}"`);
        const g = h?.primary ?? !1, m = h?.default ?? !0, w = h?.forced ?? !1;
        if (g && !a && (t += ",DEFAULT=YES", a = !0), (g || m) && (t += ",AUTOSELECT=YES"), w && (t += ",FORCED=YES"), u === "audio") {
          const b = this.trackDatas.find((k) => k.track === l)?.info.decoderConfig;
          b && (t += `,CHANNELS="${b.numberOfChannels}"`);
        }
        c.noUri || (t += `,URI="${c.playlist.path}"`), t += `
`;
      }
    this.format._options.onMaster?.(t);
    const o = await this.mutex.acquire();
    try {
      let c;
      if (this.numWrittenMasterPlaylists === 0)
        c = await this.output._getRootWriter(!0);
      else {
        const l = await this.output._getTarget({
          path: e.rootPath,
          isRoot: !0,
          mimeType: pi
        });
        c = new nr(l, !0), c.start();
      }
      c.write(Y.encode(t)), await c.flush(), await c.finalize(), this.numWrittenMasterPlaylists++;
    } finally {
      o();
    }
  }
  async tryWriteMasterPlaylist() {
    p(this.isLive);
    for (const e of this.playlists)
      if (e.writtenSegments.length === 0 && !e.done)
        return;
    await this.writeMasterPlaylist();
  }
  async finalize() {
    (await Promise.all(this.playlists.map((t) => t.mutex.acquire()))).forEach((t) => t());
    for (const t of this.trackDatas)
      t.closed = !0;
    await Promise.all(this.playlists.map((t) => t.done ? Promise.resolve() : this.advancePlaylist(t))), this.isLive || await this.writeMasterPlaylist();
  }
}
const fm = (r) => {
  if (typeof r != "string")
    throw new TypeError("options.getPlaylistPath must return or resolve to a string");
  if (/[\n\r"]/.test(r))
    throw new TypeError("Playlist paths cannot contain line feed, carriage return, or double quote characters.");
}, go = (r) => {
  if (typeof r != "string")
    throw new TypeError("options.getSegmentPath must return or resolve to a string");
  if (/[\n\r"]/.test(r))
    throw new TypeError("Segment paths cannot contain line feed or carriage return characters.");
}, hm = (r) => {
  if (typeof r != "string")
    throw new TypeError("options.getInitPath must return or resolve to a string");
  if (/[\n\r"]/.test(r))
    throw new TypeError("Init paths cannot contain line feed, carriage return, or double quote characters.");
}, kr = (r) => ({
  n: r.id,
  tracks: r.tracks,
  segmentFormat: r.segmentFormat
});
class Ue {
  /** Returns a list of video codecs that this output format can contain. */
  getSupportedVideoCodecs() {
    return this.getSupportedCodecs().filter((e) => de.includes(e));
  }
  /** Returns a list of audio codecs that this output format can contain. */
  getSupportedAudioCodecs() {
    return this.getSupportedCodecs().filter((e) => we.includes(e));
  }
  /** Returns a list of subtitle codecs that this output format can contain. */
  getSupportedSubtitleCodecs() {
    return this.getSupportedCodecs().filter((e) => tt.includes(e));
  }
  /** @internal */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _codecUnsupportedHint(e) {
    return "";
  }
  /** @internal */
  _isFragmentedIsobmff() {
    return !1;
  }
}
class Zn extends Ue {
  /** Internal constructor. */
  constructor(e = {}) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.fastStart !== void 0 && ![!1, "in-memory", "reserve", "fragmented"].includes(e.fastStart))
      throw new TypeError("options.fastStart, when provided, must be false, 'in-memory', 'reserve', or 'fragmented'.");
    if (e.minimumFragmentDuration !== void 0 && (!Number.isFinite(e.minimumFragmentDuration) || e.minimumFragmentDuration < 0))
      throw new TypeError("options.minimumFragmentDuration, when provided, must be a non-negative number.");
    if (e.onFtyp !== void 0 && typeof e.onFtyp != "function")
      throw new TypeError("options.onFtyp, when provided, must be a function.");
    if (e.onMoov !== void 0 && typeof e.onMoov != "function")
      throw new TypeError("options.onMoov, when provided, must be a function.");
    if (e.onMdat !== void 0 && typeof e.onMdat != "function")
      throw new TypeError("options.onMdat, when provided, must be a function.");
    if (e.onMoof !== void 0 && typeof e.onMoof != "function")
      throw new TypeError("options.onMoof, when provided, must be a function.");
    if (e.metadataFormat !== void 0 && !["mdir", "mdta", "udta", "auto"].includes(e.metadataFormat))
      throw new TypeError("options.metadataFormat, when provided, must be either 'auto', 'mdir', 'mdta', or 'udta'.");
    super(), this._options = e;
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 4294967295 },
      audio: { min: 0, max: 4294967295 },
      subtitle: { min: 0, max: 4294967295 },
      total: { min: 0, max: 4294967295 }
    };
  }
  get supportsVideoRotationMetadata() {
    return !0;
  }
  get supportsTimestampedMediaData() {
    return !0;
  }
  /** @internal */
  _createMuxer(e) {
    return new Nh(e, this);
  }
  /** @internal */
  _isFragmentedIsobmff() {
    return this._options.fastStart === "fragmented";
  }
}
class bl extends Zn {
  /** Creates a new {@link Mp4OutputFormat} configured with the specified `options`. */
  constructor(e) {
    super(e);
  }
  /** @internal */
  get _name() {
    return "MP4";
  }
  get fileExtension() {
    return ".mp4";
  }
  get mimeType() {
    return "video/mp4";
  }
  getSupportedCodecs() {
    return [
      ...de,
      ...Ht,
      // These are supported via ISO/IEC 23003-5:
      "pcm-s16",
      "pcm-s16be",
      "pcm-s24",
      "pcm-s24be",
      "pcm-s32",
      "pcm-s32be",
      "pcm-f32",
      "pcm-f32be",
      "pcm-f64",
      "pcm-f64be",
      ...tt
    ];
  }
  /** @internal */
  _codecUnsupportedHint(e) {
    return new kl().getSupportedCodecs().includes(e) ? " Switching to MOV will grant support for this codec." : "";
  }
}
class wo extends Zn {
  /** Creates a new {@link CmafOutputFormat} configured with the specified `options`. */
  constructor(e) {
    super(e);
  }
  /** @internal */
  get _name() {
    return "CMAF";
  }
  get fileExtension() {
    return ".m4s";
  }
  get mimeType() {
    return "video/mp4";
  }
  getSupportedCodecs() {
    return [
      ...de,
      ...Ht,
      // These are supported via ISO/IEC 23003-5:
      "pcm-s16",
      "pcm-s16be",
      "pcm-s24",
      "pcm-s24be",
      "pcm-s32",
      "pcm-s32be",
      "pcm-f32",
      "pcm-f32be",
      "pcm-f64",
      "pcm-f64be",
      ...tt
    ];
  }
}
class kl extends Zn {
  /** Creates a new {@link MovOutputFormat} configured with the specified `options`. */
  constructor(e) {
    super(e);
  }
  /** @internal */
  get _name() {
    return "MOV";
  }
  get fileExtension() {
    return ".mov";
  }
  get mimeType() {
    return "video/quicktime";
  }
  getSupportedCodecs() {
    return [
      ...de,
      ...we
    ];
  }
  /** @internal */
  _codecUnsupportedHint(e) {
    return new bl().getSupportedCodecs().includes(e) ? " Switching to MP4 will grant support for this codec." : "";
  }
}
class yo extends Ue {
  /** Creates a new {@link MkvOutputFormat} configured with the specified `options`. */
  constructor(e = {}) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.appendOnly !== void 0 && typeof e.appendOnly != "boolean")
      throw new TypeError("options.appendOnly, when provided, must be a boolean.");
    if (e.minimumClusterDuration !== void 0 && (!Number.isFinite(e.minimumClusterDuration) || e.minimumClusterDuration < 0))
      throw new TypeError("options.minimumClusterDuration, when provided, must be a non-negative number.");
    if (e.onEbmlHeader !== void 0 && typeof e.onEbmlHeader != "function")
      throw new TypeError("options.onEbmlHeader, when provided, must be a function.");
    if (e.onSegmentHeader !== void 0 && typeof e.onSegmentHeader != "function")
      throw new TypeError("options.onHeader, when provided, must be a function.");
    if (e.onCluster !== void 0 && typeof e.onCluster != "function")
      throw new TypeError("options.onCluster, when provided, must be a function.");
    super(), this._options = e;
  }
  /** @internal */
  _createMuxer(e) {
    return new qh(e, this);
  }
  /** @internal */
  get _name() {
    return "Matroska";
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 127 },
      audio: { min: 0, max: 127 },
      subtitle: { min: 0, max: 127 },
      total: { min: 0, max: 127 }
    };
  }
  get fileExtension() {
    return ".mkv";
  }
  get mimeType() {
    return "video/x-matroska";
  }
  getSupportedCodecs() {
    return [
      ...de,
      ...Ht,
      ...ge.filter((e) => !["pcm-s8", "pcm-f32be", "pcm-f64be", "ulaw", "alaw"].includes(e)),
      ...tt
    ];
  }
  get supportsVideoRotationMetadata() {
    return !1;
  }
  get supportsTimestampedMediaData() {
    return !0;
  }
}
class bo extends yo {
  /** Creates a new {@link WebMOutputFormat} configured with the specified `options`. */
  constructor(e) {
    super(e);
  }
  getSupportedCodecs() {
    return [
      ...de.filter((e) => ["vp8", "vp9", "av1"].includes(e)),
      ...we.filter((e) => ["opus", "vorbis"].includes(e)),
      ...tt
    ];
  }
  /** @internal */
  get _name() {
    return "WebM";
  }
  get fileExtension() {
    return ".webm";
  }
  get mimeType() {
    return "video/webm";
  }
  /** @internal */
  _codecUnsupportedHint(e) {
    return new yo().getSupportedCodecs().includes(e) ? " Switching to MKV will grant support for this codec." : "";
  }
}
class $m extends Ue {
  /** Creates a new {@link Mp3OutputFormat} configured with the specified `options`. */
  constructor(e = {}) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.xingHeader !== void 0 && typeof e.xingHeader != "boolean")
      throw new TypeError("options.xingHeader, when provided, must be a boolean.");
    if (e.onXingFrame !== void 0 && typeof e.onXingFrame != "function")
      throw new TypeError("options.onXingFrame, when provided, must be a function.");
    super(), this._options = e;
  }
  /** @internal */
  _createMuxer(e) {
    return new jh(e, this);
  }
  /** @internal */
  get _name() {
    return "MP3";
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 0 },
      audio: { min: 1, max: 1 },
      subtitle: { min: 0, max: 0 },
      total: { min: 1, max: 1 }
    };
  }
  get fileExtension() {
    return ".mp3";
  }
  get mimeType() {
    return "audio/mpeg";
  }
  getSupportedCodecs() {
    return ["mp3"];
  }
  get supportsVideoRotationMetadata() {
    return !1;
  }
  get supportsTimestampedMediaData() {
    return !1;
  }
}
class Gm extends Ue {
  /** Creates a new {@link WavOutputFormat} configured with the specified `options`. */
  constructor(e = {}) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.large !== void 0 && typeof e.large != "boolean")
      throw new TypeError("options.large, when provided, must be a boolean.");
    if (e.metadataFormat !== void 0 && !["info", "id3"].includes(e.metadataFormat))
      throw new TypeError("options.metadataFormat, when provided, must be either 'info' or 'id3'.");
    if (e.onHeader !== void 0 && typeof e.onHeader != "function")
      throw new TypeError("options.onHeader, when provided, must be a function.");
    super(), this._options = e;
  }
  /** @internal */
  _createMuxer(e) {
    return new em(e, this);
  }
  /** @internal */
  get _name() {
    return "WAVE";
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 0 },
      audio: { min: 1, max: 1 },
      subtitle: { min: 0, max: 0 },
      total: { min: 1, max: 1 }
    };
  }
  get fileExtension() {
    return ".wav";
  }
  get mimeType() {
    return "audio/wav";
  }
  getSupportedCodecs() {
    return [
      ...ge.filter((e) => ["pcm-s16", "pcm-s24", "pcm-s32", "pcm-f32", "pcm-f64", "pcm-u8", "ulaw", "alaw"].includes(e))
    ];
  }
  get supportsVideoRotationMetadata() {
    return !1;
  }
  get supportsTimestampedMediaData() {
    return !1;
  }
}
class Xm extends Ue {
  /** Creates a new {@link OggOutputFormat} configured with the specified `options`. */
  constructor(e = {}) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.maximumPageDuration !== void 0 && (!Number.isFinite(e.maximumPageDuration) || e.maximumPageDuration <= 0))
      throw new TypeError("options.maximumPageDuration, when provided, must be a positive number.");
    if (e.onPage !== void 0 && typeof e.onPage != "function")
      throw new TypeError("options.onPage, when provided, must be a function.");
    super(), this._options = e;
  }
  /** @internal */
  _createMuxer(e) {
    return new Qh(e, this);
  }
  /** @internal */
  get _name() {
    return "Ogg";
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 0 },
      audio: { min: 0, max: 4294967296 },
      subtitle: { min: 0, max: 0 },
      total: { min: 0, max: 4294967296 }
    };
  }
  get fileExtension() {
    return ".ogg";
  }
  get mimeType() {
    return "application/ogg";
  }
  getSupportedCodecs() {
    return [
      ...we.filter((e) => ["vorbis", "opus"].includes(e))
    ];
  }
  get supportsVideoRotationMetadata() {
    return !1;
  }
  get supportsTimestampedMediaData() {
    return !1;
  }
}
class Ym extends Ue {
  /** Creates a new {@link AdtsOutputFormat} configured with the specified `options`. */
  constructor(e = {}) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.onFrame !== void 0 && typeof e.onFrame != "function")
      throw new TypeError("options.onFrame, when provided, must be a function.");
    super(), this._options = e;
  }
  /** @internal */
  _createMuxer(e) {
    return new gf(e, this);
  }
  /** @internal */
  get _name() {
    return "ADTS";
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 0 },
      audio: { min: 1, max: 1 },
      subtitle: { min: 0, max: 0 },
      total: { min: 1, max: 1 }
    };
  }
  get fileExtension() {
    return ".aac";
  }
  get mimeType() {
    return "audio/aac";
  }
  getSupportedCodecs() {
    return ["aac"];
  }
  get supportsVideoRotationMetadata() {
    return !1;
  }
  get supportsTimestampedMediaData() {
    return !1;
  }
}
class Zm extends Ue {
  /** Creates a new {@link FlacOutputFormat} configured with the specified `options`. */
  constructor(e = {}) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.appendOnly !== void 0 && typeof e.appendOnly != "boolean")
      throw new TypeError("options.appendOnly, when provided, must be a boolean.");
    super(), this._options = e;
  }
  /** @internal */
  _createMuxer(e) {
    return new bf(e, this);
  }
  /** @internal */
  get _name() {
    return "FLAC";
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 0 },
      audio: { min: 1, max: 1 },
      subtitle: { min: 0, max: 0 },
      total: { min: 1, max: 1 }
    };
  }
  get fileExtension() {
    return ".flac";
  }
  get mimeType() {
    return "audio/flac";
  }
  getSupportedCodecs() {
    return ["flac"];
  }
  get supportsVideoRotationMetadata() {
    return !1;
  }
  get supportsTimestampedMediaData() {
    return !1;
  }
}
class Jm extends Ue {
  /** Creates a new {@link MpegTsOutputFormat} configured with the specified `options`. */
  constructor(e = {}) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.onPacket !== void 0 && typeof e.onPacket != "function")
      throw new TypeError("options.onPacket, when provided, must be a function.");
    super(), this._options = e;
  }
  /** @internal */
  _createMuxer(e) {
    return new Xh(e, this);
  }
  /** @internal */
  get _name() {
    return "MPEG-TS";
  }
  getSupportedTrackCounts() {
    return {
      video: { min: 0, max: 16 },
      audio: { min: 0, max: 32 },
      subtitle: { min: 0, max: 0 },
      total: { min: 0, max: 48 }
    };
  }
  get fileExtension() {
    return ".ts";
  }
  get mimeType() {
    return "video/MP2T";
  }
  getSupportedCodecs() {
    return [
      ...de.filter((e) => ["avc", "hevc"].includes(e)),
      ...we.filter((e) => ["aac", "mp3", "ac3", "eac3"].includes(e))
    ];
  }
  get supportsVideoRotationMetadata() {
    return !1;
  }
  get supportsTimestampedMediaData() {
    return !0;
  }
}
class ep extends Ue {
  /** Creates a new {@link HlsOutputFormat} configured with the specified `options`. */
  constructor(e) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (!(e.segmentFormat instanceof Ue) && (!Array.isArray(e.segmentFormat) || e.segmentFormat.length === 0 || !e.segmentFormat.every((t) => t instanceof Ue)))
      throw new TypeError("options.segmentFormat must be an OutputFormat or a non-empty array of OutputFormat instances.");
    if (e.targetDuration !== void 0 && (typeof e.targetDuration != "number" || e.targetDuration <= 0))
      throw new TypeError("options.targetDuration, when provided, must be a positive number.");
    if (e.singleFilePerPlaylist !== void 0 && typeof e.singleFilePerPlaylist != "boolean")
      throw new TypeError("options.singleFilePerPlaylist, when provided, must be a boolean.");
    if (e.live !== void 0 && typeof e.live != "boolean")
      throw new TypeError("options.live, when provided, must be a boolean.");
    if (e.maxLiveSegmentCount !== void 0 && (typeof e.maxLiveSegmentCount != "number" || e.maxLiveSegmentCount < 1 || Number.isFinite(e.maxLiveSegmentCount) && !Number.isInteger(e.maxLiveSegmentCount)))
      throw new TypeError("options.maxLiveSegmentCount, when provided, must be a positive integer or Infinity.");
    if (e.getPlaylistPath !== void 0 && typeof e.getPlaylistPath != "function")
      throw new TypeError("options.getPlaylistPath, when provided, must be a function.");
    if (e.getSegmentPath !== void 0 && typeof e.getSegmentPath != "function")
      throw new TypeError("options.getSegmentPath, when provided, must be a function.");
    if (e.getInitPath !== void 0 && typeof e.getInitPath != "function")
      throw new TypeError("options.getInitPath, when provided, must be a function.");
    if (e.onMaster !== void 0 && typeof e.onMaster != "function")
      throw new TypeError("options.onMaster, when provided, must be a function.");
    if (e.onPlaylist !== void 0 && typeof e.onPlaylist != "function")
      throw new TypeError("options.onPlaylist, when provided, must be a function.");
    if (e.onSegment !== void 0 && typeof e.onSegment != "function")
      throw new TypeError("options.onSegment, when provided, must be a function.");
    if (e.onInit !== void 0 && typeof e.onInit != "function")
      throw new TypeError("options.onInit, when provided, must be a function.");
    if (e.onSegmentPopped !== void 0 && typeof e.onSegmentPopped != "function")
      throw new TypeError("options.onSegmentPopped, when provided, must be a function.");
    super(), this._options = e;
  }
  /** @internal */
  _createMuxer(e) {
    return new dm(e, this);
  }
  /** @internal */
  get _name() {
    return "HTTP Live Streaming (HLS)";
  }
  get fileExtension() {
    return ".m3u8";
  }
  get mimeType() {
    return pi;
  }
  getSupportedCodecs() {
    return [...new Set(fi(this._options.segmentFormat).flatMap((t) => t.getSupportedCodecs()))];
  }
  getSupportedTrackCounts() {
    let e = !1, t = !1, i = !1;
    for (const s of fi(this._options.segmentFormat)) {
      const n = s.getSupportedTrackCounts();
      e ||= n.video.max > 0, t ||= n.audio.max > 0, i ||= n.subtitle.max > 0;
    }
    return {
      video: { min: 0, max: e ? 1 / 0 : 0 },
      audio: { min: 0, max: t ? 1 / 0 : 0 },
      subtitle: { min: 0, max: 0 },
      // Currently disabled
      total: { min: 0, max: 1 / 0 }
    };
  }
  get supportsVideoRotationMetadata() {
    return fi(this._options.segmentFormat).some((e) => e.supportsVideoRotationMetadata);
  }
  get supportsTimestampedMediaData() {
    return !0;
  }
  /** @internal */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _codecUnsupportedHint(e) {
    return " Using different segment formats may grant support for this codec.";
  }
}
const ko = ["video", "audio", "subtitle"];
class hr {
  /** @internal */
  constructor(e, t, i, s, n) {
    this.id = e, this.output = t, this.type = i, this.source = s, this.metadata = n;
  }
  /** Returns true if and only if this track is a video track. */
  isVideoTrack() {
    return this.type === "video";
  }
  /** Returns true if and only if this track is an audio track. */
  isAudioTrack() {
    return this.type === "audio";
  }
  /** Returns true if and only if this track is a subtitle track. */
  isSubtitleTrack() {
    return this.type === "subtitle";
  }
  /**
   * Returns true if and only if this track can be paired with the given other track. Pairability can be set using
   * the {@link BaseTrackMetadata.group} option.
   */
  canBePairedWith(e) {
    if (!(e instanceof hr))
      throw new TypeError("other must be an OutputTrack.");
    if (this === e)
      return !1;
    const t = fi(this.metadata.group), i = fi(e.metadata.group);
    for (const s of t)
      if (this.type !== e.type && i.some((o) => s === o) || i.some((o) => s._pairedGroups.has(o)))
        return !0;
    return !1;
  }
}
class mm extends hr {
  /** @internal */
  constructor(e, t, i, s) {
    super(e, t, "video", i, s);
  }
}
class pm extends hr {
  /** @internal */
  constructor(e, t, i, s) {
    super(e, t, "audio", i, s);
  }
}
class gm extends hr {
  /** @internal */
  constructor(e, t, i, s) {
    super(e, t, "subtitle", i, s);
  }
}
class Ge {
  /** Creates a new {@link OutputTrackGroup}. */
  constructor() {
    this._pairedGroups = /* @__PURE__ */ new Set();
  }
  /**
   * Marks this group as being pairable with another group, symmetrically. Output tracks where each track is assigned
   * to one half of a group pairing are then considered pairable.
   *
   * You cannot pair a group with itself.
   */
  pairWith(e) {
    if (!(e instanceof Ge))
      throw new TypeError("other must be an OutputTrackGroup.");
    if (this === e)
      throw new TypeError("Cannot pair a group with itself.");
    this._pairedGroups.add(e), e._pairedGroups.add(this);
  }
}
const Os = (r) => {
  if (!r || typeof r != "object")
    throw new TypeError("metadata must be an object.");
  if (r.languageCode !== void 0 && !Ki(r.languageCode))
    throw new TypeError("metadata.languageCode, when provided, must be a three-letter, ISO 639-2/T language code.");
  if (r.name !== void 0 && typeof r.name != "string")
    throw new TypeError("metadata.name, when provided, must be a string.");
  if (r.disposition !== void 0 && ql(r.disposition), r.maximumPacketCount !== void 0 && (!Number.isInteger(r.maximumPacketCount) || r.maximumPacketCount < 0))
    throw new TypeError("metadata.maximumPacketCount, when provided, must be a non-negative integer.");
  if (r.group !== void 0 && !(r.group instanceof Ge) && (!Array.isArray(r.group) || r.group.some((e) => !(e instanceof Ge))))
    throw new TypeError("metadata.group, when provided, must be an OutputTrackGroup instance or an array of OutputTrackGroup instances.");
};
class Hr extends or {
  /**
   * The target to which the root file will be written. Throws when using {@link PathedTarget} with an async callback;
   * prefer the `'target'` event for those cases.
   */
  get target() {
    const e = "Output.target cannot be used when using PathedTarget with an async callback. Use the 'target' event instead.";
    if (this._rootTargetPromise)
      throw new TypeError(e);
    const t = this._getRootTarget();
    if (t instanceof Promise)
      throw new TypeError(e);
    return t;
  }
  /**
   * Creates a new instance of {@link Output} which can then be used to create a new media file according to the
   * specified {@link OutputOptions}.
   */
  constructor(e) {
    if (super(), this.state = "pending", this.defaultTrackGroup = new Ge(), this.tracks = [], this._onFinalize = null, this._unfinalizedTargets = /* @__PURE__ */ new Set(), this._rootWriterPromise = null, this._startPromise = null, this._cancelPromise = null, this._finalizePromise = null, this._mutex = new Yt(), this._metadataTags = {}, this._rootTarget = null, this._rootTargetPromise = null, this._firstMediaStreamTimestamp = null, !e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (!(e.format instanceof Ue))
      throw new TypeError("options.format must be an OutputFormat.");
    if (!(e.target instanceof Be || e.target instanceof Pt))
      throw new TypeError("options.target must be a Target or a PathedTarget.");
    if (e.target instanceof Be && this._rememberTarget(e.target), e.initTarget !== void 0 && !(e.initTarget instanceof Be) && typeof e.initTarget != "function")
      throw new Error("options.initTarget, when provided, must be a Target or a function that returns or resolves to a Target.");
    if (e.onFinalize !== void 0 && typeof e.onFinalize != "function")
      throw new TypeError("options.onFinalize, when provided, must be a function.");
    this.format = e.format, this._target = e.target, this._onFinalize = e.onFinalize ?? null, this._initTarget = e.initTarget ?? null, this._initTarget instanceof Be && this._rememberTarget(this._initTarget), this._muxer = e.format._createMuxer(this);
  }
  /** @internal */
  _getTargetValidated(e) {
    p(this._target instanceof Pt);
    const t = this._target.getTarget(e), i = (s) => {
      if (!(s instanceof Be))
        throw new TypeError("getTarget must return a Target.");
      return s;
    };
    return t instanceof Promise ? t.then(i) : i(t);
  }
  /** @internal */
  async _getTarget(e) {
    p(this._target instanceof Pt);
    const t = await this._getTargetValidated(e);
    return this._emit("target", { target: t, request: e, isRoot: e.isRoot }), this.state === "canceled" ? await t._close() : this._rememberTarget(t), t;
  }
  /** @internal */
  _rememberTarget(e) {
    this._unfinalizedTargets.add(e), e.on("finalized", () => this._unfinalizedTargets.delete(e), { once: !0 });
  }
  /** @internal */
  async _getInitTarget() {
    if (p(this._initTarget !== null), this._initTarget instanceof Be)
      return this._initTarget;
    const e = await this._initTarget();
    return this.state === "canceled" ? await e._close() : this._rememberTarget(e), e;
  }
  /** @internal */
  _hasInitTarget() {
    return this._initTarget !== null;
  }
  /** @internal */
  _getRootTarget() {
    if (this._rootTarget)
      return this._rootTarget;
    if (this._rootTargetPromise)
      return this._rootTargetPromise;
    if (this._target instanceof Be)
      return this._emit("target", { target: this._target, request: null, isRoot: !0 }), this._rootTarget = this._target, this._target;
    const e = {
      path: this._target.rootPath,
      isRoot: !0,
      mimeType: this.format.mimeType
    }, t = this._getTargetValidated(e), i = (s) => (this.state === "canceled" ? s._close() : this._rememberTarget(s), this._emit("target", { target: s, request: e, isRoot: !0 }), this._rootTarget = s, s);
    return t instanceof Promise ? this._rootTargetPromise = t.then(i) : i(t);
  }
  /** @internal */
  _getRootWriter(e) {
    return this._rootWriterPromise ??= (async () => {
      const t = await this._getRootTarget(), i = new nr(t, typeof e == "boolean" ? e : e(t));
      return i.start(), i;
    })();
  }
  /** Adds a video track to the output with the given source. Can only be called before the output is started. */
  addVideoTrack(e, t = {}) {
    if (!(e instanceof dr))
      throw new TypeError("source must be a VideoSource.");
    if (Os(t), t.rotation !== void 0 && ![0, 90, 180, 270].includes(t.rotation))
      throw new TypeError(`Invalid video rotation: ${t.rotation}. Has to be 0, 90, 180 or 270.`);
    if (!this.format.supportsVideoRotationMetadata && t.rotation)
      throw new Error(`${this.format._name} does not support video rotation metadata.`);
    if (t.frameRate !== void 0 && (!Number.isFinite(t.frameRate) || t.frameRate <= 0))
      throw new TypeError(`Invalid video frame rate: ${t.frameRate}. Must be a positive number.`);
    if (t.decoderConfig !== void 0 && lr({ decoderConfig: t.decoderConfig }, e._codec), t.primingPacket !== void 0) {
      if (!(t.primingPacket instanceof Z))
        throw new TypeError("metadata.primingPacket, when provided, must be an EncodedPacket.");
      if (t.decoderConfig === void 0)
        throw new TypeError("metadata.primingPacket can only be provided alongside metadata.decoderConfig.");
    }
    const i = { ...t };
    return i.group ??= this.defaultTrackGroup, this._addTrack(new mm(this.tracks.length + 1, this, e, i));
  }
  /** Adds an audio track to the output with the given source. Can only be called before the output is started. */
  addAudioTrack(e, t = {}) {
    if (!(e instanceof fr))
      throw new TypeError("source must be an AudioSource.");
    if (Os(t), t.decoderConfig !== void 0 && $e({ decoderConfig: t.decoderConfig }, e._codec), t.primingPacket !== void 0) {
      if (!(t.primingPacket instanceof Z))
        throw new TypeError("metadata.primingPacket, when provided, must be an EncodedPacket.");
      if (t.decoderConfig === void 0)
        throw new TypeError("metadata.primingPacket can only be provided alongside metadata.decoderConfig.");
    }
    const i = { ...t };
    return i.group ??= this.defaultTrackGroup, this._addTrack(new pm(this.tracks.length + 1, this, e, i));
  }
  /** Adds a subtitle track to the output with the given source. Can only be called before the output is started. */
  addSubtitleTrack(e, t = {}) {
    if (!(e instanceof yl))
      throw new TypeError("source must be a SubtitleSource.");
    Os(t);
    const i = { ...t };
    return i.group ??= this.defaultTrackGroup, this._addTrack(new gm(this.tracks.length + 1, this, e, i));
  }
  /**
   * Sets descriptive metadata tags about the media file, such as title, author, date, or cover art. When called
   * multiple times, only the metadata from the last call will be used.
   *
   * Can only be called before the output is started.
   */
  setMetadataTags(e) {
    if (Hs(e), this.state !== "pending")
      throw new Error("Cannot set metadata tags after output has been started or canceled.");
    this._metadataTags = e;
  }
  /** @internal */
  _addTrack(e) {
    if (this.state !== "pending")
      throw new Error("Cannot add track after output has been started or canceled.");
    if (e.source._connectedTrack)
      throw new Error("Source is already used for a track.");
    const t = this.format.getSupportedTrackCounts(), i = this.tracks.reduce((a, o) => a + (o.type === e.type ? 1 : 0), 0), s = t[e.type].max;
    if (i === s)
      throw new Error(s === 0 ? `${this.format._name} does not support ${e.type} tracks.` : `${this.format._name} does not support more than ${s} ${e.type} track${s === 1 ? "" : "s"}.`);
    const n = t.total.max;
    if (this.tracks.length === n)
      throw new Error(`${this.format._name} does not support more than ${n} tracks${n === 1 ? "" : "s"} in total.`);
    if (e.isVideoTrack()) {
      const a = this.format.getSupportedVideoCodecs();
      if (a.length === 0)
        throw new Error(`${this.format._name} does not support video tracks.` + this.format._codecUnsupportedHint(e.source._codec));
      if (!a.includes(e.source._codec))
        throw new Error(`Codec '${e.source._codec}' cannot be contained within ${this.format._name}. Supported video codecs are: ${a.map((o) => `'${o}'`).join(", ")}.` + this.format._codecUnsupportedHint(e.source._codec));
    } else if (e.isAudioTrack()) {
      const a = this.format.getSupportedAudioCodecs();
      if (a.length === 0)
        throw new Error(`${this.format._name} does not support audio tracks.` + this.format._codecUnsupportedHint(e.source._codec));
      if (!a.includes(e.source._codec))
        throw new Error(`Codec '${e.source._codec}' cannot be contained within ${this.format._name}. Supported audio codecs are: ${a.map((o) => `'${o}'`).join(", ")}.` + this.format._codecUnsupportedHint(e.source._codec));
    } else if (e.isSubtitleTrack()) {
      const a = this.format.getSupportedSubtitleCodecs();
      if (a.length === 0)
        throw new Error(`${this.format._name} does not support subtitle tracks.` + this.format._codecUnsupportedHint(e.source._codec));
      if (!a.includes(e.source._codec))
        throw new Error(`Codec '${e.source._codec}' cannot be contained within ${this.format._name}. Supported subtitle codecs are: ${a.map((o) => `'${o}'`).join(", ")}.` + this.format._codecUnsupportedHint(e.source._codec));
    }
    return this.tracks.push(e), e.source._connectedTrack = e, e;
  }
  /**
   * Whether the output has enough tracks (of the correct type) to be started, based on the requirements of the output
   * format.
   */
  hasEnoughTracks() {
    const e = this.format.getSupportedTrackCounts();
    for (const i of ko) {
      const s = this.tracks.reduce((a, o) => a + (o.type === i ? 1 : 0), 0), n = e[i].min;
      if (s < n)
        return !1;
    }
    const t = e.total.min;
    return !(this.tracks.length < t);
  }
  /**
   * Starts the creation of the output file. This method should be called after all tracks have been added. Only after
   * the output has started can media samples be added to the tracks.
   *
   * @returns A promise that resolves when the output has successfully started and is ready to receive media samples.
   */
  async start() {
    const e = this.format.getSupportedTrackCounts();
    for (const i of ko) {
      const s = this.tracks.reduce((a, o) => a + (o.type === i ? 1 : 0), 0), n = e[i].min;
      if (s < n)
        throw new Error(n === e[i].max ? `${this.format._name} requires exactly ${n} ${i} track${n === 1 ? "" : "s"}.` : `${this.format._name} requires at least ${n} ${i} track${n === 1 ? "" : "s"}.`);
    }
    const t = e.total.min;
    if (this.tracks.length < t)
      throw new Error(t === e.total.max ? `${this.format._name} requires exactly ${t} track${t === 1 ? "" : "s"}.` : `${this.format._name} requires at least ${t} track${t === 1 ? "" : "s"}.`);
    if (this.state === "canceled")
      throw new Error("Output has been canceled.");
    return this._startPromise ? (D._warn("Output has already been started."), this._startPromise) : this._startPromise = (async () => {
      this.state = "started";
      const i = this._mutex.acquire();
      try {
        await this._muxer.start();
        const s = this.tracks.map((n) => n.source._start());
        await Promise.all(s);
      } finally {
        (await i)();
      }
    })();
  }
  /**
   * Resolves with the full MIME type of the output file, including track codecs.
   *
   * The returned promise will resolve only once the precise codec strings of all tracks are known.
   */
  getMimeType() {
    return this._muxer.getMimeType();
  }
  /**
   * Cancels the creation of the output file, releasing internal resources like encoders and preventing further
   * samples from being added.
   *
   * @returns A promise that resolves once all internal resources have been released.
   */
  async cancel() {
    if (this._cancelPromise)
      return D._warn("Output has already been canceled."), this._cancelPromise;
    if (this.state === "finalizing" || this.state === "finalized") {
      this.state === "finalized" && D._warn("Output has already been finalized.");
      return;
    }
    return this._cancelPromise = (async () => {
      this.state = "canceled";
      const e = await this._mutex.acquire();
      try {
        const t = this.tracks.map((i) => i.source._flushOrWaitForOngoingClose(!0));
        await Promise.all(t), await Promise.all([...this._unfinalizedTargets].map((i) => i._close())), this._unfinalizedTargets.clear();
      } finally {
        e();
      }
    })();
  }
  /**
   * Finalizes the output file. This method must be called after all media samples across all tracks have been added.
   * Once the Promise returned by this method completes, the output file is ready.
   */
  async finalize() {
    if (this.state === "pending")
      throw new Error("Cannot finalize before starting.");
    if (this.state === "canceled")
      throw new Error("Cannot finalize after canceling.");
    return this._finalizePromise ? (D._warn("Output has already been finalized."), this._finalizePromise) : this._finalizePromise = (async () => {
      this.state = "finalizing";
      const e = await this._mutex.acquire();
      try {
        const t = this.tracks.map((i) => i.source._flushOrWaitForOngoingClose(!1));
        if (await Promise.all(t), await this._muxer.finalize(), this._rootWriterPromise) {
          const i = await this._rootWriterPromise;
          i.finalized || (await i.flush(), await i.finalize());
        }
        this._onFinalize && await this._onFinalize(), this.state = "finalized";
      } finally {
        await Promise.all([...this._unfinalizedTargets].map((t) => t._close().catch(() => {
        }))), this._unfinalizedTargets.clear(), e();
      }
    })();
  }
}
var Oi = function(r, e, t) {
  if (e != null) {
    if (typeof e != "object" && typeof e != "function") throw new TypeError("Object expected.");
    var i, s;
    if (t) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      i = e[Symbol.asyncDispose];
    }
    if (i === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      i = e[Symbol.dispose], t && (s = i);
    }
    if (typeof i != "function") throw new TypeError("Object not disposable.");
    s && (i = function() {
      try {
        s.call(this);
      } catch (n) {
        return Promise.reject(n);
      }
    }), r.stack.push({ value: e, dispose: i, async: t });
  } else t && r.stack.push({ async: !0 });
  return e;
}, Tr = /* @__PURE__ */ (function(r) {
  return function(e) {
    function t(a) {
      e.error = e.hasError ? new r(a, e.error, "An error was suppressed during disposal.") : a, e.hasError = !0;
    }
    var i, s = 0;
    function n() {
      for (; i = e.stack.pop(); )
        try {
          if (!i.async && s === 1) return s = 0, e.stack.push(i), Promise.resolve().then(n);
          if (i.dispose) {
            var a = i.dispose.call(i.value);
            if (i.async) return s |= 2, Promise.resolve(a).then(n, function(o) {
              return t(o), n();
            });
          } else s |= 1;
        } catch (o) {
          t(o);
        }
      if (s === 1) return e.hasError ? Promise.reject(e.error) : Promise.resolve();
      if (e.hasError) throw e.error;
    }
    return n();
  };
})(typeof SuppressedError == "function" ? SuppressedError : function(r, e, t) {
  var i = new Error(t);
  return i.name = "SuppressedError", i.error = r, i.suppressed = e, i;
});
const Sr = (r) => {
  if (!r || typeof r != "object")
    throw new TypeError("options.video, when provided, must be an object.");
  if (r?.discard !== void 0 && typeof r.discard != "boolean")
    throw new TypeError("options.video.discard, when provided, must be a boolean.");
  if (r?.forceTranscode !== void 0 && typeof r.forceTranscode != "boolean")
    throw new TypeError("options.video.forceTranscode, when provided, must be a boolean.");
  if (r?.codec !== void 0 && !de.includes(r.codec))
    throw new TypeError(`options.video.codec, when provided, must be one of: ${de.join(", ")}.`);
  const e = r?.bitrate;
  if (r?.quality !== void 0 && !(r.quality instanceof ce))
    throw new TypeError("options.video.quality, when provided, must be a Quality.");
  if (r?.quality !== void 0 && e !== void 0)
    throw new TypeError("options.video.quality and options.video.bitrate cannot both be provided.");
  if (e !== void 0 && !(e instanceof ce) && (!Number.isInteger(e) || e <= 0))
    throw new TypeError("options.video.bitrate, when provided, must be a positive integer or a quality.");
  if (r?.width !== void 0 && (!Number.isInteger(r.width) || r.width <= 0))
    throw new TypeError("options.video.width, when provided, must be a positive integer.");
  if (r?.height !== void 0 && (!Number.isInteger(r.height) || r.height <= 0))
    throw new TypeError("options.video.height, when provided, must be a positive integer.");
  if (r?.fit !== void 0 && !["fill", "contain", "cover"].includes(r.fit))
    throw new TypeError("options.video.fit, when provided, must be one of 'fill', 'contain', or 'cover'.");
  if (r?.width !== void 0 && r.height !== void 0 && r.fit === void 0)
    throw new TypeError("When both options.video.width and options.video.height are provided, options.video.fit must also be provided.");
  if (r?.rotate !== void 0 && ![0, 90, 180, 270].includes(r.rotate))
    throw new TypeError("options.video.rotate, when provided, must be 0, 90, 180 or 270.");
  if (r?.allowRotationMetadata !== void 0 && typeof r.allowRotationMetadata != "boolean")
    throw new TypeError("options.video.allowRotationMetadata, when provided, must be a boolean.");
  if (r?.crop !== void 0 && tr(r.crop, "options.video."), r?.frameRate !== void 0 && (!Number.isFinite(r.frameRate) || r.frameRate <= 0))
    throw new TypeError("options.video.frameRate, when provided, must be a finite positive number.");
  if (r?.alpha !== void 0 && !["discard", "keep"].includes(r.alpha))
    throw new TypeError("options.video.alpha, when provided, must be either 'discard' or 'keep'.");
  if (r?.keyFrameInterval !== void 0 && (!Number.isFinite(r.keyFrameInterval) || r.keyFrameInterval < 0))
    throw new TypeError("options.video.keyFrameInterval, when provided, must be a non-negative number.");
  if (r?.process !== void 0 && typeof r.process != "function")
    throw new TypeError("options.video.process, when provided, must be a function.");
  if (r?.processedWidth !== void 0 && (!Number.isInteger(r.processedWidth) || r.processedWidth <= 0))
    throw new TypeError("options.video.processedWidth, when provided, must be a positive integer.");
  if (r?.processedHeight !== void 0 && (!Number.isInteger(r.processedHeight) || r.processedHeight <= 0))
    throw new TypeError("options.video.processedHeight, when provided, must be a positive integer.");
  if (r?.hardwareAcceleration !== void 0 && !["no-preference", "prefer-hardware", "prefer-software"].includes(r.hardwareAcceleration))
    throw new TypeError("options.video.hardwareAcceleration, when provided, must be 'no-preference', 'prefer-hardware' or 'prefer-software'.");
  if (r?.group !== void 0 && !(r.group instanceof Ge || Array.isArray(r.group) && r.group.every((t) => t instanceof Ge)))
    throw new TypeError("options.video.group, when provided, must be an OutputTrackGroup or an array of OutputTrackGroups.");
}, Ar = (r) => {
  if (!r || typeof r != "object")
    throw new TypeError("options.audio, when provided, must be an object.");
  if (r?.discard !== void 0 && typeof r.discard != "boolean")
    throw new TypeError("options.audio.discard, when provided, must be a boolean.");
  if (r?.forceTranscode !== void 0 && typeof r.forceTranscode != "boolean")
    throw new TypeError("options.audio.forceTranscode, when provided, must be a boolean.");
  if (r?.codec !== void 0 && !we.includes(r.codec))
    throw new TypeError(`options.audio.codec, when provided, must be one of: ${we.join(", ")}.`);
  const e = r?.bitrate;
  if (r?.quality !== void 0 && !(r.quality instanceof ce))
    throw new TypeError("options.audio.quality, when provided, must be a Quality.");
  if (r?.quality !== void 0 && e !== void 0)
    throw new TypeError("options.audio.quality and options.audio.bitrate cannot both be provided.");
  if (e !== void 0 && !(e instanceof ce) && (!Number.isInteger(e) || e <= 0))
    throw new TypeError("options.audio.bitrate, when provided, must be a positive integer or a quality.");
  if (r?.numberOfChannels !== void 0 && (!Number.isInteger(r.numberOfChannels) || r.numberOfChannels <= 0))
    throw new TypeError("options.audio.numberOfChannels, when provided, must be a positive integer.");
  if (r?.sampleRate !== void 0 && (!Number.isInteger(r.sampleRate) || r.sampleRate <= 0))
    throw new TypeError("options.audio.sampleRate, when provided, must be a positive integer.");
  if (r?.sampleFormat !== void 0 && !["u8", "s16", "s32", "f32"].includes(r.sampleFormat))
    throw new TypeError("options.audio.sampleFormat, when provided, must be one of: u8, s16, s32, f32.");
  if (r?.process !== void 0 && typeof r.process != "function")
    throw new TypeError("options.audio.process, when provided, must be a function.");
  if (r?.processedNumberOfChannels !== void 0 && (!Number.isInteger(r.processedNumberOfChannels) || r.processedNumberOfChannels <= 0))
    throw new TypeError("options.audio.processedNumberOfChannels, when provided, must be a positive integer.");
  if (r?.processedSampleRate !== void 0 && (!Number.isInteger(r.processedSampleRate) || r.processedSampleRate <= 0))
    throw new TypeError("options.audio.processedSampleRate, when provided, must be a positive integer.");
  if (r?.group !== void 0 && !(r.group instanceof Ge || Array.isArray(r.group) && r.group.every((t) => t instanceof Ge)))
    throw new TypeError("options.audio.group, when provided, must be an OutputTrackGroup or an array of OutputTrackGroups.");
}, Us = 2, Ns = 48e3;
class Tl {
  /** Initializes a new conversion process without starting the conversion. */
  static async init(e) {
    const t = new Tl(e);
    return await t._init(), t;
  }
  /** Creates a new Conversion instance (duh). */
  constructor(e) {
    if (this.state = "idle", this._nextOutputTrackId = 0, this._outputTrackIds = [], this._outputOwnTrackGroups = [], this._trackPumps = [], this._composable = !1, this._executed = !1, this._executionUntil = 1 / 0, this._pauseRequested = !1, this._synchronizer = new wm(this), this._totalDuration = null, this._maxTimestamps = /* @__PURE__ */ new Map(), this.onProgress = void 0, this._computeProgress = !1, this._lastProgress = 0, this.isValid = !1, this.utilizedTracks = [], this.discardedTracks = [], !e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (!(e.input instanceof ns))
      throw new TypeError("options.input must be an Input.");
    if (!(e.output instanceof Hr))
      throw new TypeError("options.output must be an Output.");
    if (e.tracks !== void 0 && e.tracks !== "all" && e.tracks !== "primary")
      throw new TypeError("options.tracks, when provided, must be either 'all' or 'primary'.");
    if (e.composable !== void 0 && typeof e.composable != "boolean")
      throw new TypeError("options.composable, when provided, must be a boolean.");
    const t = e.composable ?? !1;
    if (t) {
      if (e.tags !== void 0)
        throw new TypeError("options.tags cannot be set by a composable conversion; set metadata directly on the output instead.");
      if (e.output.state !== "pending")
        throw new TypeError("options.output must not have been started yet.");
    } else if (e.output.tracks.length > 0 || Object.keys(e.output._metadataTags).length > 0 || e.output.state !== "pending")
      throw new TypeError("options.output must be fresh: no tracks or metadata tags added and not started.");
    if (e.video !== void 0 && typeof e.video != "function")
      if (Array.isArray(e.video))
        for (const i of e.video)
          Sr(i);
      else
        Sr(e.video);
    if (e.audio !== void 0 && typeof e.audio != "function")
      if (Array.isArray(e.audio))
        for (const i of e.audio)
          Ar(i);
      else
        Ar(e.audio);
    if (e.trim !== void 0 && (!e.trim || typeof e.trim != "object"))
      throw new TypeError("options.trim, when provided, must be an object.");
    if (e.trim?.start !== void 0 && !Number.isFinite(e.trim.start))
      throw new TypeError("options.trim.start, when provided, must be a finite number.");
    if (e.trim?.end !== void 0 && !Number.isFinite(e.trim.end))
      throw new TypeError("options.trim.end, when provided, must be a finite number.");
    if (e.trim?.start !== void 0 && e.trim.end !== void 0 && e.trim.start >= e.trim.end)
      throw new TypeError("options.trim.start must be less than options.trim.end.");
    if (e.tags !== void 0 && (typeof e.tags != "object" || !e.tags) && typeof e.tags != "function")
      throw new TypeError("options.tags, when provided, must be an object or a function.");
    if (typeof e.tags == "object" && Hs(e.tags), e.showWarnings !== void 0 && typeof e.showWarnings != "boolean")
      throw new TypeError("options.showWarnings, when provided, must be a boolean.");
    this._options = e, this._composable = t, this.input = e.input, this.output = e.output;
  }
  /** @internal */
  async _init() {
    const e = await this.input.getFormat();
    let t, i = this._options.tracks;
    if (i === void 0 && (i = e.name.includes("(HLS)") ? "primary" : "all"), i === "all")
      t = await this.input.getTracks();
    else if (i === "primary") {
      const l = await this.input.getPrimaryVideoTrack(), u = await this.input.getPrimaryAudioTrack();
      t = [l, u].filter((d) => d !== null);
    } else
      pe(i), p(!1);
    const s = this.output.format.getSupportedTrackCounts();
    let n = 1, a = 1;
    const o = [], c = [];
    for (const l of t) {
      let u;
      if (l.isVideoTrack())
        if (this._options.video)
          if (typeof this._options.video == "function") {
            const h = await this._options.video(l, n) ?? {};
            if (Array.isArray(h))
              for (const g of h)
                Sr(g);
            else
              Sr(h);
            u = Array.isArray(h) ? h : [h], n++;
          } else
            u = Array.isArray(this._options.video) ? this._options.video : [this._options.video];
        else
          u = [{}];
      else if (l.isAudioTrack())
        if (this._options.audio)
          if (typeof this._options.audio == "function") {
            const h = await this._options.audio(l, a) ?? {};
            if (Array.isArray(h))
              for (const g of h)
                Ar(g);
            else
              Ar(h);
            u = Array.isArray(h) ? h : [h], a++;
          } else
            u = Array.isArray(this._options.audio) ? this._options.audio : [this._options.audio];
        else
          u = [{}];
      else
        p(!1);
      const d = u.filter((h) => h.discard);
      for (const h of d)
        this.discardedTracks.push({
          track: l,
          reason: "discarded_by_user",
          trackOptions: h
        });
      if (u.length === d.length) {
        u.length === 0 && this.discardedTracks.push({
          track: l,
          reason: "discarded_by_user",
          trackOptions: {}
        });
        continue;
      }
      const f = u.filter((h) => !h.discard);
      o.push(l), c.push(f);
    }
    this._options.trim?.start !== void 0 ? this._startTimestamp = this._options.trim.start : this._startTimestamp = Math.max(
      await this.input.getFirstTimestamp(o),
      // Samples can also have negative timestamps, but the meaning typically is "don't present me", so let's
      // cut those out by default.
      0
    ), this._endTimestamp = Math.max(this._options.trim?.end ?? 1 / 0, this._startTimestamp);
    for (let l = 0; l < o.length; l++) {
      const u = o[l], d = c[l];
      for (const f of d) {
        if (this.output.tracks.length === s.total.max) {
          this.discardedTracks.push({
            track: u,
            reason: "max_track_count_reached",
            trackOptions: f
          });
          continue;
        }
        if (this.output.tracks.reduce((m, w) => m + (w.type === u.type ? 1 : 0), 0) === s[u.type].max) {
          this.discardedTracks.push({
            track: u,
            reason: "max_track_count_of_type_reached",
            trackOptions: f
          });
          continue;
        }
        const g = this._nextOutputTrackId++;
        u.isVideoTrack() ? await this._processVideoTrack(u, f, g) : u.isAudioTrack() ? await this._processAudioTrack(u, f, g) : p(!1);
      }
    }
    for (let l = 0; l < this.utilizedTracks.length - 1; l++)
      for (let u = l + 1; u < this.utilizedTracks.length; u++) {
        const d = this.utilizedTracks[l], f = this.utilizedTracks[u], h = this._outputOwnTrackGroups[l], g = this._outputOwnTrackGroups[u];
        p(h !== void 0), p(g !== void 0), h && g && d.canBePairedWith(f) && h.pairWith(g);
      }
    if (!this._composable) {
      const l = await this.input.getMetadataTags();
      let u;
      if (this._options.tags) {
        const h = typeof this._options.tags == "function" ? await this._options.tags(l) : this._options.tags;
        Hs(h), u = h;
      } else
        u = l;
      const d = e.mimeType === this.output.format.mimeType, f = l.raw === u.raw;
      l.raw && f && !d && delete u.raw, this.output.setMetadataTags(u);
    }
    if (this._composable ? this.isValid = !0 : this.isValid = this.output.hasEnoughTracks() && this.output.tracks.length > 0, this._options.showWarnings ?? !0) {
      const l = [], u = this.discardedTracks.filter((d) => d.reason !== "discarded_by_user");
      u.length > 0 && l.push("Some tracks had to be discarded from the conversion:", u), this.isValid || (l.length > 0 && l.push(`

`), l.push(this._getInvalidityExplanation().join(""))), l.length > 0 && D._warn(...l);
    }
  }
  /** @internal */
  _getInvalidityExplanation() {
    const e = [];
    if (this.discardedTracks.length === 0)
      e.push("Due to missing tracks, this conversion cannot be executed.");
    else {
      const t = this.discardedTracks.every((i) => i.reason === "discarded_by_user" || i.reason === "no_encodable_target_codec") && this.discardedTracks.some((i) => i.reason === "no_encodable_target_codec");
      if (e.push("Due to discarded tracks, this conversion cannot be executed."), t) {
        const i = this.discardedTracks.flatMap((n) => {
          if (n.reason === "discarded_by_user")
            return [];
          let a;
          return n.track.type === "video" ? a = this.output.format.getSupportedVideoCodecs() : n.track.type === "audio" ? a = this.output.format.getSupportedAudioCodecs() : a = this.output.format.getSupportedSubtitleCodecs(), a.filter((o) => !n.trackOptions.codec || o === n.trackOptions.codec);
        }), s = [...new Set(i)];
        s.length === 1 ? e.push(`
Tracks were discarded because your environment is not able to encode '${s[0]}' with the provided parameters.`) : e.push(`
Tracks were discarded because your environment is not able to encode any of the codecs ${s.map((n) => `'${n}'`).join(", ")} with the provided parameters.`), s.includes("mp3") && e.push(`
The @mediabunny/mp3-encoder extension package provides support for encoding MP3.`), s.includes("aac") && e.push(`
The @mediabunny/aac-encoder extension package provides support for encoding AAC.`), (s.includes("ac3") || s.includes("eac3")) && e.push(`
The @mediabunny/ac3 extension package provides support for encoding and decoding AC-3/E-AC-3.`), s.includes("flac") && e.push(`
The @mediabunny/flac-encoder extension package provides support for encoding FLAC.`);
      } else
        e.push(`
Check the discardedTracks field for more info.`);
    }
    return e;
  }
  /**
   * Executes the conversion process and resolves when the conversion is complete. When
   * {@link ConversionExecuteOptions.until} is provided, the conversion will be suspended once that output timestamp
   * is reached and can be resumed with another call to `execute`. An ongoing execution may also be suspended via
   * {@link ConversionExecuteOptions.pauseSignal}.
   *
   * Execution will throw if `isValid` is `false`.
   */
  async execute(e = {}) {
    if (!e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.until !== void 0 && (typeof e.until != "number" || Number.isNaN(e.until)))
      throw new TypeError("options.until, when provided, must be a number.");
    if (e.pauseSignal !== void 0 && !(e.pauseSignal instanceof AbortSignal))
      throw new TypeError("options.pauseSignal, when provided, must be an AbortSignal.");
    if (!this.isValid)
      throw new Error(`Cannot execute this conversion because its output configuration is invalid. Make sure to always check the isValid field before executing a conversion.
` + this._getInvalidityExplanation().join(""));
    if (this.state === "executing")
      throw new Error("Cannot call execute() while a previous call to execute() is still running.");
    if (this.state === "canceled")
      throw new To();
    if (this.state === "done")
      return;
    if (this._composable && this.output.state === "pending")
      throw new Error("A composable conversion requires the output to be started. Call start() on the output before executing the conversion.");
    this.state = "executing", this._executionUntil = e.until ?? 1 / 0, this._pauseRequested = e.pauseSignal?.aborted ?? !1;
    const t = () => {
      this.state === "executing" && (this._pauseRequested = !0, this._synchronizer.resolveAll());
    };
    e.pauseSignal?.addEventListener("abort", t);
    for (const s of this._trackPumps)
      s.done || (s.resolvers = ee());
    if (this._executed)
      for (const s of this._trackPumps)
        s.wake?.();
    else {
      this._executed = !0;
      for (const s of this._outputTrackIds)
        this._synchronizer.declareTrack(s);
      if (this.onProgress) {
        const n = [...new Set(this.utilizedTracks)].map(async (o) => await o.isLive() ? 1 / 0 : await o.getDurationFromMetadata() ?? await o.computeDuration()), a = Math.max(0, ...await Promise.all(n));
        this._computeProgress = !0, this._totalDuration = Math.min(a - this._startTimestamp, this._endTimestamp - this._startTimestamp);
        for (const o of this._outputTrackIds)
          this._maxTimestamps.set(o, 0);
        this.onProgress?.(0, 0);
      }
      this._composable || await this.output.start();
      for (const s of this._trackPumps)
        s.start();
    }
    try {
      await Promise.all(this._trackPumps.map((s) => s.resolvers.promise));
    } catch (s) {
      throw this.state !== "canceled" && this.cancel(), s;
    } finally {
      e.pauseSignal?.removeEventListener("abort", t);
    }
    if (this.state === "canceled")
      throw new To();
    const i = this._trackPumps.every((s) => s.done);
    if (this.state = i ? "done" : "idle", i && (this._composable || await this.output.finalize(), this._computeProgress)) {
      const s = Math.min(...this._maxTimestamps.values());
      this.onProgress?.(1, s);
    }
  }
  /**
   * Cancels the conversion process, causing any ongoing `execute` call to throw a `ConversionCanceledError`.
   * Does nothing if the conversion is already complete.
   */
  async cancel() {
    if (this.state !== "done") {
      if (this.state === "canceled") {
        D._warn("Conversion already canceled.");
        return;
      }
      this.state = "canceled";
      for (const e of this._trackPumps)
        e.wake?.();
      this._synchronizer.resolveAll(), this._composable || await this.output.cancel();
    }
  }
  /** @internal */
  async _processVideoTrack(e, t, i) {
    const s = await e.getCodec();
    if (!s) {
      this.discardedTracks.push({
        track: e,
        reason: "unknown_source_codec",
        trackOptions: t
      });
      return;
    }
    let n;
    const a = await e.getRotation(), o = gi(a + (t.rotate ?? 0));
    let c = o;
    const l = this.output.format.supportsVideoRotationMetadata && (t.allowRotationMetadata ?? !0), u = await e.getSquarePixelWidth(), d = await e.getSquarePixelHeight(), [f, h] = o % 180 === 0 ? [u, d] : [d, u];
    let g = t.crop;
    g && (g = Vr(g, f, h));
    const [m, w] = g ? [g.width, g.height] : [f, h];
    let y = m, b = w;
    const k = y / b;
    t.width !== void 0 && t.height === void 0 ? (y = Jt(t.width), b = Jt(Math.round(y / k))) : t.width === void 0 && t.height !== void 0 ? (b = Jt(t.height), y = Jt(Math.round(b * k))) : t.width !== void 0 && t.height !== void 0 && (y = Jt(t.width), b = Jt(t.height));
    const S = await e.getFirstTimestamp();
    let T = this.output.format.getSupportedVideoCodecs();
    const A = !!t.forceTranscode || S < this._startTimestamp || !!t.frameRate || t.keyFrameInterval !== void 0 || t.process !== void 0 || t.quality !== void 0 || t.bitrate !== void 0 || !T.includes(s) || t.codec && t.codec !== s || y !== m || b !== w || o !== 0 && !l || !!g, C = t.alpha ?? "discard";
    if (A) {
      if (!await e.canDecode()) {
        this.discardedTracks.push({
          track: e,
          reason: "undecodable_source_codec",
          trackOptions: t
        });
        return;
      }
      t.codec && (T = T.filter((Q) => Q === t.codec));
      const E = bi(t.quality, t.bitrate) ?? new ce("high"), v = await Qd(T, {
        width: t.process && t.processedWidth ? t.processedWidth : y,
        height: t.process && t.processedHeight ? t.processedHeight : b,
        quality: E
      });
      if (!v) {
        this.discardedTracks.push({
          track: e,
          reason: "no_encodable_target_codec",
          trackOptions: t
        });
        return;
      }
      const M = {
        codec: v,
        quality: E,
        keyFrameInterval: t.keyFrameInterval,
        sizeChangeBehavior: t.fit ?? "passThrough",
        alpha: C,
        hardwareAcceleration: t.hardwareAcceleration,
        transform: {}
      };
      p(M.transform);
      let W = y !== m || b !== w || o !== 0 && (!l || t.process !== void 0) || !!g || u !== await e.getCodedWidth() || d !== await e.getCodedHeight();
      if (!W) {
        const Q = { stack: [], error: void 0, hasError: !1 };
        try {
          const J = new Hr({
            format: new bl(),
            // Supports all video codecs
            target: new ml()
          }), Te = new po(M);
          J.addVideoTrack(Te), await J.start();
          const Me = new hn(e), Ie = Oi(Q, await Me.getSample(S), !1);
          if (Ie)
            try {
              await Te.add(Ie), Ie.close(), await J.finalize();
            } catch (cs) {
              D._warn("An error occurred when probing encoder support. Falling back to rerender path.", cs), J.cancel(), W = !0, M.transform.force = !0;
            }
          else
            await J.cancel();
        } catch (J) {
          Q.error = J, Q.hasError = !0;
        } finally {
          Tr(Q);
        }
      }
      t.frameRate && (M.transform.frameRate = t.frameRate), t.process && (M.transform.process = t.process), W && (c = 0, M.transform.width = y, M.transform.height = b, M.transform.fit = t.fit ?? "fill", M.transform.rotate = gi(o - a), M.transform.crop = g, M.transform.alpha = C);
      let O = null;
      M.onEncodedSample = (Q) => {
        O = Q.timestamp;
      };
      const z = new po(M);
      n = z, this._registerTrackPump(async (Q) => {
        const J = new hn(e);
        for await (const Te of J.samples(this._startTimestamp, this._endTimestamp)) {
          const Me = { stack: [], error: void 0, hasError: !1 };
          try {
            const Ie = Oi(Me, Te, !1);
            if (this.state === "canceled")
              break;
            const cs = Math.max(Ie.timestamp - this._startTimestamp, 0);
            Ie.setTimestamp(cs), this._reportProgress(i, Ie.timestamp + Ie.duration), await z.add(Ie), Ie.close(), O !== null && (this._synchronizer.shouldWait(i, O) && await this._synchronizer.wait(O), await this._checkpoint(Q, O));
          } catch (Ie) {
            Me.error = Ie, Me.hasError = !0;
          } finally {
            Tr(Me);
          }
        }
        z.close(), this._synchronizer.closeTrack(i);
      });
    } else {
      const I = new wn(s);
      n = I, this._registerTrackPump(async (E) => {
        const v = new sr(e), W = { decoderConfig: await e.getDecoderConfig() ?? void 0 };
        for await (const O of v.packets(void 0, void 0, { verifyKeyPackets: !0 })) {
          if (this.state === "canceled" || O.timestamp >= this._endTimestamp)
            break;
          const z = O.clone({
            timestamp: O.timestamp - this._startTimestamp,
            sideData: C === "discard" ? {} : O.sideData
          });
          p(z.timestamp >= 0), this._reportProgress(i, z.timestamp + z.duration), await I.add(z, W), this._synchronizer.shouldWait(i, z.timestamp) && await this._synchronizer.wait(z.timestamp), await this._checkpoint(E, z.timestamp);
        }
        I.close(), this._synchronizer.closeTrack(i);
      });
    }
    let _ = null;
    !t.group && !this._composable && (_ = new Ge());
    const x = await e.getLanguageCode();
    this.output.addVideoTrack(n, {
      frameRate: t.frameRate,
      // TODO: This condition can be removed when all demuxers properly homogenize to BCP47 in v2
      languageCode: Ki(x) ? x : void 0,
      name: await e.getName() ?? void 0,
      disposition: await e.getDisposition(),
      rotation: c,
      group: _ ?? t.group
    }), this.utilizedTracks.push(e), this._outputTrackIds.push(i), this._outputOwnTrackGroups.push(_);
  }
  /** @internal */
  async _processAudioTrack(e, t, i) {
    const s = await e.getCodec();
    if (!s) {
      this.discardedTracks.push({
        track: e,
        reason: "unknown_source_codec",
        trackOptions: t
      });
      return;
    }
    let n;
    const a = await e.getNumberOfChannels(), o = await e.getSampleRate(), c = await e.getFirstTimestamp();
    let l = t.numberOfChannels ?? a, u = t.sampleRate ?? o;
    const d = c < this._startTimestamp;
    let f = c > this._startTimestamp && !this.output.format.supportsTimestampedMediaData, h = this.output.format.getSupportedAudioCodecs();
    if (!t.forceTranscode && !t.quality && !t.bitrate && l === a && u === o && !d && !f && h.includes(s) && (!t.codec || t.codec === s) && !t.process && t.sampleFormat === void 0) {
      const w = new yn(s);
      n = w, this._registerTrackPump(async (y) => {
        const b = new sr(e), S = { decoderConfig: await e.getDecoderConfig() ?? void 0 };
        for await (const T of b.packets()) {
          if (this.state === "canceled" || T.timestamp >= this._endTimestamp)
            break;
          const A = T.clone({
            timestamp: T.timestamp - this._startTimestamp
          });
          p(A.timestamp >= 0), this._reportProgress(i, A.timestamp + A.duration), await w.add(A, S), this._synchronizer.shouldWait(i, A.timestamp) && await this._synchronizer.wait(A.timestamp), await this._checkpoint(y, A.timestamp);
        }
        w.close(), this._synchronizer.closeTrack(i);
      });
    } else {
      if (!await e.canDecode()) {
        this.discardedTracks.push({
          track: e,
          reason: "undecodable_source_codec",
          trackOptions: t
        });
        return;
      }
      let y = null;
      t.codec && (h = h.filter((C) => C === t.codec));
      const b = bi(t.quality, t.bitrate) ?? new ce("high"), k = await fn(h, {
        numberOfChannels: t.process && t.processedNumberOfChannels ? t.processedNumberOfChannels : l,
        sampleRate: t.process && t.processedSampleRate ? t.processedSampleRate : u,
        quality: b
      });
      if (!k.some((C) => Ht.includes(C)) && h.some((C) => Ht.includes(C)) && (l !== Us || u !== Ns)) {
        const _ = (await fn(h, {
          numberOfChannels: Us,
          sampleRate: Ns,
          quality: b
        })).find((x) => Ht.includes(x));
        _ && (y = _, l = Us, u = Ns);
      } else
        y = k[0] ?? null;
      if (y === null) {
        this.discardedTracks.push({
          track: e,
          reason: "no_encodable_target_codec",
          trackOptions: t
        });
        return;
      }
      const S = {
        codec: y,
        quality: b,
        transform: {
          sampleFormat: t.sampleFormat,
          process: t.process
        }
      };
      p(S.transform), l !== a && (S.transform.numberOfChannels = l), u !== o && (S.transform.sampleRate = u);
      let T = null;
      S.onEncodedSample = (C) => {
        T = C.timestamp;
      };
      const A = new am(S);
      n = A, this._registerTrackPump(async (C) => {
        const _ = new el(e);
        for await (const x of _.samples(this._startTimestamp, this._endTimestamp)) {
          const I = { stack: [], error: void 0, hasError: !1 };
          try {
            const E = Oi(I, x, !1);
            if (this.state === "canceled")
              break;
            if (f) {
              const z = { stack: [], error: void 0, hasError: !1 };
              try {
                const Q = c - this._startTimestamp, J = Math.round(Q * o), Te = lt(E.format), Me = new Uint8Array(Te * J * a);
                (E.format === "u8" || E.format === "u8-planar") && Me.fill(2 ** 7);
                const Ie = Oi(z, new fe({
                  data: Me,
                  // Use the same format the decoder is spitting out. This avoids feeding changing sample
                  // formats to the audio encoder.
                  format: E.format,
                  numberOfChannels: a,
                  sampleRate: o,
                  timestamp: 0
                }), !1);
                await this._registerAudioSample(C, Ie, A, i, () => T), f = !1;
              } catch (Q) {
                z.error = Q, z.hasError = !0;
              } finally {
                Tr(z);
              }
            }
            let v = 0, M = E.numberOfFrames;
            E.timestamp < this._startTimestamp && (v = Math.round((this._startTimestamp - E.timestamp) * E.sampleRate)), E.timestamp + E.duration > this._endTimestamp && (M = Math.round((this._endTimestamp - E.timestamp) * E.sampleRate));
            let W;
            if (v > 0 || M < E.numberOfFrames) {
              const z = E.trim(v, M);
              if (E.close(), W = z, z.numberOfFrames === 0) {
                z.close();
                continue;
              }
            } else
              W = E;
            const O = Oi(I, W, !1);
            O.setTimestamp(O.timestamp - this._startTimestamp), await this._registerAudioSample(C, O, A, i, () => T);
          } catch (E) {
            I.error = E, I.hasError = !0;
          } finally {
            Tr(I);
          }
        }
        A.close(), this._synchronizer.closeTrack(i);
      });
    }
    let g = null;
    !t.group && !this._composable && (g = new Ge());
    const m = await e.getLanguageCode();
    this.output.addAudioTrack(n, {
      // TODO: This condition can be removed when all demuxers properly homogenize to BCP47 in v2
      languageCode: Ki(m) ? m : void 0,
      name: await e.getName() ?? void 0,
      disposition: await e.getDisposition(),
      group: g ?? t.group
    }), this.utilizedTracks.push(e), this._outputTrackIds.push(i), this._outputOwnTrackGroups.push(g);
  }
  /** @internal */
  async _registerAudioSample(e, t, i, s, n) {
    this._reportProgress(s, t.timestamp + t.duration), await i.add(t), t.close();
    const a = n();
    a !== null && (this._synchronizer.shouldWait(s, a) && await this._synchronizer.wait(a), await this._checkpoint(e, a));
  }
  /** @internal */
  _registerTrackPump(e) {
    const t = {
      done: !1,
      resolvers: ee(),
      wake: null,
      start: () => {
        e(t).then(() => {
          t.done = !0, t.resolvers.resolve();
        }, (i) => {
          t.resolvers.reject(i);
        });
      }
    };
    this._trackPumps.push(t);
  }
  /** @internal */
  async _checkpoint(e, t) {
    for (; this.state !== "canceled" && (t >= this._executionUntil || this._pauseRequested); ) {
      e.resolvers.resolve();
      const { promise: i, resolve: s } = ee();
      e.wake = s, await i;
    }
  }
  /** @internal */
  _reportProgress(e, t) {
    if (!this._computeProgress)
      return;
    p(this._totalDuration !== null), this._maxTimestamps.set(e, Math.max(t, this._maxTimestamps.get(e)));
    const i = Math.min(...this._maxTimestamps.values()), s = le(i / this._totalDuration, 0, 1);
    s !== this._lastProgress && (this._lastProgress = s, this.onProgress?.(s, i));
  }
}
class To extends Error {
  /** Creates a new {@link ConversionCanceledError}. */
  constructor(e = "Conversion has been canceled.") {
    super(e), this.name = "ConversionCanceledError";
  }
}
const So = 1;
class wm {
  constructor(e) {
    this.maxTimestamps = /* @__PURE__ */ new Map(), this.resolvers = [], this.conversion = e;
  }
  declareTrack(e) {
    this.maxTimestamps.set(e, 0);
  }
  shouldWait(e, t) {
    const i = this.maxTimestamps.get(e);
    p(i !== void 0), this.maxTimestamps.set(e, Math.max(t, i));
    const s = this.computeMinAndMaybeResolve();
    return this.conversion.state === "canceled" || this.conversion._pauseRequested || t >= this.conversion._executionUntil ? !1 : t - s > So;
  }
  wait(e) {
    const { promise: t, resolve: i } = ee();
    return this.resolvers.push({
      timestamp: e,
      resolve: i
    }), t;
  }
  closeTrack(e) {
    this.maxTimestamps.delete(e), this.computeMinAndMaybeResolve();
  }
  resolveAll() {
    for (const e of this.resolvers)
      e.resolve();
    this.resolvers.length = 0;
  }
  computeMinAndMaybeResolve() {
    let e = 1 / 0;
    for (const [, t] of this.maxTimestamps)
      e = Math.min(e, t);
    for (let t = 0; t < this.resolvers.length; t++) {
      const i = this.resolvers[t];
      i.timestamp - e < So && (i.resolve(), this.resolvers.splice(t, 1), t--);
    }
    return e;
  }
}
const Sl = /* @__PURE__ */ Symbol.for("mediabunny loaded");
globalThis[Sl] && D._error(`[WARNING]
Mediabunny was loaded twice. This will likely cause Mediabunny not to work correctly. Check if multiple dependencies are importing different versions of Mediabunny, or if something is being bundled incorrectly.`);
globalThis[Sl] = !0;
export {
  Vc as ADTS,
  Sm as ALL_FORMATS,
  ko as ALL_TRACK_TYPES,
  we as AUDIO_CODECS,
  Td as AdtsInputFormat,
  Ym as AdtsOutputFormat,
  Wm as AppendOnlyStreamTarget,
  An as AttachedFile,
  Nm as AudioBufferSink,
  jm as AudioBufferSource,
  fe as AudioSample,
  vi as AudioSampleResource,
  el as AudioSampleSink,
  am as AudioSampleSource,
  fr as AudioSource,
  Zc as BaseMediaSampleSink,
  km as BlobSource,
  bm as BufferSource,
  Rs as BufferTarget,
  Um as CanvasSink,
  qm as CanvasSource,
  wo as CmafOutputFormat,
  ym as ConcurrentRunner,
  Tl as Conversion,
  To as ConversionCanceledError,
  Gd as CustomAudioDecoder,
  Yd as CustomAudioEncoder,
  nd as CustomPathedSource,
  Ec as CustomSource,
  $d as CustomVideoDecoder,
  Xd as CustomVideoEncoder,
  yn as EncodedAudioPacketSource,
  Z as EncodedPacket,
  sr as EncodedPacketSink,
  wn as EncodedVideoPacketSource,
  or as EventEmitter,
  _d as FLAC,
  Ic as FilePathSource,
  Lm as FilePathTarget,
  kd as FlacInputFormat,
  Zm as FlacOutputFormat,
  Lc as HLS,
  Am as HLS_FORMATS,
  Dc as HlsInputFormat,
  ep as HlsOutputFormat,
  ns as Input,
  ss as InputAudioTrack,
  Pe as InputDisposedError,
  rt as InputFormat,
  ur as InputTrack,
  rs as InputVideoTrack,
  Mc as IsobmffInputFormat,
  Zn as IsobmffOutputFormat,
  Je as LogLevel,
  D as Logging,
  Ad as MATROSKA,
  Nc as MP3,
  Oc as MP4,
  Wc as MPEG_TS,
  zc as MatroskaInputFormat,
  Gn as MediaSource,
  Km as MediaStreamAudioTrackSource,
  Hm as MediaStreamVideoTrackSource,
  yo as MkvOutputFormat,
  kl as MovOutputFormat,
  wd as Mp3InputFormat,
  $m as Mp3OutputFormat,
  md as Mp4InputFormat,
  bl as Mp4OutputFormat,
  Sd as MpegTsInputFormat,
  Jm as MpegTsOutputFormat,
  Ht as NON_PCM_AUDIO_CODECS,
  ml as NullTarget,
  Cd as OGG,
  bd as OggInputFormat,
  Xm as OggOutputFormat,
  Hr as Output,
  pm as OutputAudioTrack,
  Ue as OutputFormat,
  gm as OutputSubtitleTrack,
  hr as OutputTrack,
  Ge as OutputTrackGroup,
  mm as OutputVideoTrack,
  ge as PCM_AUDIO_CODECS,
  Zt as PathedSource,
  Pt as PathedTarget,
  Uc as QTFF,
  vm as QUALITY_HIGH,
  Im as QUALITY_LOW,
  Em as QUALITY_MEDIUM,
  Fm as QUALITY_VERY_HIGH,
  _m as QUALITY_VERY_LOW,
  ce as Quality,
  pd as QuickTimeInputFormat,
  ud as RangedSource,
  Dh as RangedTarget,
  vc as ReadableStreamSource,
  hi as RichImageData,
  tt as SUBTITLE_CODECS,
  Oe as Source,
  On as SourceRef,
  Tm as StreamSource,
  hl as StreamTarget,
  yl as SubtitleSource,
  Be as Target,
  Qm as TextSubtitleSource,
  Za as UnsupportedInputFormatError,
  _c as UrlSource,
  de as VIDEO_CODECS,
  cn as VIDEO_SAMPLE_PIXEL_FORMATS,
  be as VideoSample,
  Ss as VideoSampleColorSpace,
  Mt as VideoSampleResource,
  hn as VideoSampleSink,
  po as VideoSampleSource,
  dr as VideoSource,
  Pd as WAVE,
  xd as WEBM,
  Gm as WavOutputFormat,
  yd as WaveInputFormat,
  gd as WebMInputFormat,
  bo as WebMOutputFormat,
  Vm as asc,
  xm as canDecode,
  Hc as canDecodeAudio,
  qc as canDecodeVideo,
  Bm as canEncode,
  qn as canEncodeAudio,
  Hn as canEncodeSubtitles,
  Ln as canEncodeVideo,
  Ya as desc,
  Bd as getDecodableAudioCodecs,
  Pm as getDecodableCodecs,
  Fd as getDecodableVideoCodecs,
  fn as getEncodableAudioCodecs,
  Rm as getEncodableCodecs,
  Kd as getEncodableSubtitleCodecs,
  jd as getEncodableVideoCodecs,
  Mm as getFirstEncodableAudioCodec,
  zm as getFirstEncodableSubtitleCodec,
  Qd as getFirstEncodableVideoCodec,
  Bi as prefer,
  Dm as registerDecoder,
  Om as registerEncoder,
  Cm as registerVideoSampleTransformer
};
