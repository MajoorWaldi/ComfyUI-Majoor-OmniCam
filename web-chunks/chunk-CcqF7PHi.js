function w(t) {
  if (!t)
    throw new Error("Assertion failed.");
}
const ot = (t) => {
  const e = (t % 360 + 360) % 360;
  if (e === 0 || e === 90 || e === 180 || e === 270)
    return e;
  throw new Error(`Invalid rotation ${t}.`);
}, X = (t) => t && t[t.length - 1], Ot = (t) => {
  let e = 0;
  for (; t.readBits(1) === 0 && e < 32; )
    e++;
  if (e >= 32)
    throw new Error("Invalid exponential-Golomb code.");
  return (1 << e) - 1 + t.readBits(e);
}, Bt = (t, e, i, r) => {
  for (let n = e; n < i; n++) {
    const s = Math.floor(n / 8);
    let o = t[s];
    const a = 7 - (n & 7);
    o &= ~(1 << a), o |= (r & 1 << i - n - 1) >> i - n - 1 << a, t[s] = o;
  }
}, R = (t) => t.constructor === Uint8Array ? t : ArrayBuffer.isView(t) ? new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : new Uint8Array(t), at = (t) => t.constructor === DataView ? t : ArrayBuffer.isView(t) ? new DataView(t.buffer, t.byteOffset, t.byteLength) : new DataView(t), N = /* @__PURE__ */ new TextEncoder(), me = {
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
}, pe = {
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
}, we = {
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
}, Ht = (t) => !!t && !!t.primaries && !!t.transfer && !!t.matrix && t.fullRange !== void 0, ge = (t) => t instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && t instanceof SharedArrayBuffer || ArrayBuffer.isView(t);
class ct {
  constructor() {
    this.currentPromise = Promise.resolve(), this.pending = 0;
  }
  async acquire() {
    let e;
    const i = new Promise((n) => {
      let s = !1;
      e = () => {
        s || (n(), this.pending--, s = !0);
      };
    }), r = this.currentPromise;
    return this.currentPromise = i, this.pending++, await r, e;
  }
}
const ke = (t, e, i) => {
  let r = 0, n = t.length - 1, s = -1;
  for (; r <= n; ) {
    const o = r + (n - r + 1) / 2 | 0;
    i(t[o]) <= e ? (s = o, r = o + 1) : n = o - 1;
  }
  return s;
}, dt = () => {
  let t, e;
  return { promise: new Promise((r, n) => {
    t = r, e = n;
  }), resolve: t, reject: e };
}, G = (t) => {
  throw new Error(`Unexpected value: ${t}`);
}, Mt = (t, e, i) => {
  const r = t.getUint8(e), n = t.getUint8(e + 1), s = t.getUint8(e + 2);
  return r << 16 | n << 8 | s;
}, Se = (t, e, i) => Math.max(e, Math.min(i, t)), Nt = (t, e, i) => t + (e - t) * i, qt = "und", xe = (t, e) => Math.round(t / e) * e, Pe = (t, e) => Math.round(t * e) / e, Ae = (t, e) => Math.floor(t * e) / e, Ut = /^[a-z]{3}$/, jt = (t) => Ut.test(t), I = 1e6 * (1 + Number.EPSILON);
class $t {
  constructor() {
    this.currentPromise = Promise.resolve();
  }
  call(e) {
    return this.currentPromise = this.currentPromise.then(e);
  }
}
let Z = null;
const ht = () => Z !== null ? Z : Z = typeof navigator < "u" && navigator.userAgent?.includes("Firefox");
let J = null;
const Gt = () => J !== null ? J : J = !!(typeof navigator < "u" && (navigator.vendor?.includes("Google Inc") || /Chrome/.test(navigator.userAgent)));
let ee = null;
const Qt = () => {
  if (ee !== null)
    return ee;
  if (typeof navigator > "u")
    return null;
  const t = /\bChrome\/(\d+)/.exec(navigator.userAgent);
  return t ? ee = Number(t[1]) : null;
}, Xt = function* (t) {
  for (const e in t) {
    const i = t[e];
    i !== void 0 && (yield { key: e, value: i });
  }
}, Kt = (t) => {
  switch (t.toLowerCase()) {
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
}, Lt = (t, e) => {
  if (t.length !== e.length)
    return !1;
  for (let i = 0; i < t.length; i++)
    if (t[i] !== e[i])
      return !1;
  return !0;
}, Yt = () => {
  Symbol.dispose ??= /* @__PURE__ */ Symbol("Symbol.dispose");
}, Zt = (t, e) => {
  let i = -1, r = 1 / 0;
  for (let n = 0; n < t.length; n++) {
    const s = e(t[n]);
    s < r && (r = s, i = n);
  }
  return i;
}, ut = (t) => {
  w(Number.isInteger(t.num)), w(Number.isInteger(t.den)), w(t.den !== 0);
  let e = Math.abs(t.num), i = Math.abs(t.den);
  for (; i !== 0; ) {
    const n = e % i;
    e = i, i = n;
  }
  const r = e || 1;
  return {
    num: t.num / r,
    den: t.den / r
  };
}, te = (t, e) => {
  if (typeof t != "object" || !t)
    throw new TypeError(`${e} must be an object.`);
  if (!Number.isInteger(t.left) || t.left < 0)
    throw new TypeError(`${e}.left must be a non-negative integer.`);
  if (!Number.isInteger(t.top) || t.top < 0)
    throw new TypeError(`${e}.top must be a non-negative integer.`);
  if (!Number.isInteger(t.width) || t.width < 0)
    throw new TypeError(`${e}.width must be a non-negative integer.`);
  if (!Number.isInteger(t.height) || t.height < 0)
    throw new TypeError(`${e}.height must be a non-negative integer.`);
}, Jt = (t) => new Promise((e) => setTimeout(e, t)), Re = (t) => Array.isArray(t) ? t : [t];
class ye {
  constructor() {
    this._listeners = /* @__PURE__ */ new Map();
  }
  /** Registers a listener for the given event. Returns a function that, when called, removes the listener again. */
  on(e, i, r) {
    this._listeners.has(e) || this._listeners.set(e, /* @__PURE__ */ new Set());
    const n = { fn: i, once: r?.once ?? !1 };
    return this._listeners.get(e).add(n), () => {
      this._listeners.get(e)?.delete(n);
    };
  }
  /** @internal */
  _emit(...e) {
    const [i, r] = e, n = this._listeners.get(i);
    if (n)
      for (const s of n) {
        try {
          s.fn(r);
        } catch (o) {
          console.error(o);
        }
        s.once && n.delete(s);
      }
  }
}
const ei = (t) => t !== null && typeof t == "object" && Object.getPrototypeOf(t) === Object.prototype && Object.values(t).every((e) => typeof e == "string");
var S;
(function(t) {
  t[t.Silent = 0] = "Silent", t[t.Errors = 1] = "Errors", t[t.Warnings = 2] = "Warnings", t[t.Info = 3] = "Info";
})(S || (S = {}));
class E {
  constructor() {
  }
  /** The current log level. Defaults to {@link LogLevel.Info}. */
  static get level() {
    return E._level;
  }
  static set level(e) {
    if (e !== S.Silent && e !== S.Errors && e !== S.Warnings && e !== S.Info)
      throw new TypeError("Invalid log level. Use one of the values of the LogLevel enum.");
    E._level = e;
  }
  /** @internal */
  static get _emitter() {
    return E._emitterInstance ??= new ye();
  }
  /** Registers a listener for a log event. Returns a function that, when called, removes the listener again. */
  static on(e, i, r) {
    return E._emitter.on(e, i, r);
  }
  /** @internal */
  static _error(...e) {
    E._emitter._emit("error", e), E._level >= S.Errors && console.error(...e);
  }
  /** @internal */
  static _warn(...e) {
    E._emitter._emit("warn", e), E._level >= S.Warnings && console.warn(...e);
  }
  /** @internal */
  static _info(...e) {
    E._emitter._emit("info", e), E._level >= S.Info && console.info(...e);
  }
}
E._level = S.Info;
E._emitterInstance = null;
class ti {
  /** Creates a new {@link RichImageData}. */
  constructor(e, i) {
    if (this.data = e, this.mimeType = i, !(e instanceof Uint8Array))
      throw new TypeError("data must be a Uint8Array.");
    if (typeof i != "string")
      throw new TypeError("mimeType must be a string.");
  }
}
class lt {
  /** Creates a new {@link AttachedFile}. */
  constructor(e, i, r, n) {
    if (this.data = e, this.mimeType = i, this.name = r, this.description = n, !(e instanceof Uint8Array))
      throw new TypeError("data must be a Uint8Array.");
    if (i !== void 0 && typeof i != "string")
      throw new TypeError("mimeType, when provided, must be a string.");
    if (r !== void 0 && typeof r != "string")
      throw new TypeError("name, when provided, must be a string.");
    if (n !== void 0 && typeof n != "string")
      throw new TypeError("description, when provided, must be a string.");
  }
}
const ii = (t) => {
  if (!t || typeof t != "object")
    throw new TypeError("tags must be an object.");
  if (t.title !== void 0 && typeof t.title != "string")
    throw new TypeError("tags.title, when provided, must be a string.");
  if (t.description !== void 0 && typeof t.description != "string")
    throw new TypeError("tags.description, when provided, must be a string.");
  if (t.artist !== void 0 && typeof t.artist != "string")
    throw new TypeError("tags.artist, when provided, must be a string.");
  if (t.album !== void 0 && typeof t.album != "string")
    throw new TypeError("tags.album, when provided, must be a string.");
  if (t.albumArtist !== void 0 && typeof t.albumArtist != "string")
    throw new TypeError("tags.albumArtist, when provided, must be a string.");
  if (t.trackNumber !== void 0 && (!Number.isInteger(t.trackNumber) || t.trackNumber <= 0))
    throw new TypeError("tags.trackNumber, when provided, must be a positive integer.");
  if (t.tracksTotal !== void 0 && (!Number.isInteger(t.tracksTotal) || t.tracksTotal <= 0))
    throw new TypeError("tags.tracksTotal, when provided, must be a positive integer.");
  if (t.discNumber !== void 0 && (!Number.isInteger(t.discNumber) || t.discNumber <= 0))
    throw new TypeError("tags.discNumber, when provided, must be a positive integer.");
  if (t.discsTotal !== void 0 && (!Number.isInteger(t.discsTotal) || t.discsTotal <= 0))
    throw new TypeError("tags.discsTotal, when provided, must be a positive integer.");
  if (t.genre !== void 0 && typeof t.genre != "string")
    throw new TypeError("tags.genre, when provided, must be a string.");
  if (t.date !== void 0 && (!(t.date instanceof Date) || Number.isNaN(t.date.getTime())))
    throw new TypeError("tags.date, when provided, must be a valid Date.");
  if (t.lyrics !== void 0 && typeof t.lyrics != "string")
    throw new TypeError("tags.lyrics, when provided, must be a string.");
  if (t.images !== void 0) {
    if (!Array.isArray(t.images))
      throw new TypeError("tags.images, when provided, must be an array.");
    for (const e of t.images) {
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
  if (t.comment !== void 0 && typeof t.comment != "string")
    throw new TypeError("tags.comment, when provided, must be a string.");
  if (t.raw !== void 0) {
    if (!t.raw || typeof t.raw != "object")
      throw new TypeError("tags.raw, when provided, must be an object.");
    for (const e of Object.values(t.raw))
      if (e !== null && typeof e != "string" && !(e instanceof Uint8Array) && !(e instanceof ti) && !(e instanceof lt) && !ei(e))
        throw new TypeError("Each value in tags.raw must be a string, Uint8Array, RichImageData, AttachedFile, Record<string, string>, or null.");
  }
}, ri = (t) => {
  if (!t || typeof t != "object")
    throw new TypeError("disposition must be an object.");
  if (t.default !== void 0 && typeof t.default != "boolean")
    throw new TypeError("disposition.default must be a boolean.");
  if (t.primary !== void 0 && typeof t.primary != "boolean")
    throw new TypeError("disposition.primary must be a boolean.");
  if (t.forced !== void 0 && typeof t.forced != "boolean")
    throw new TypeError("disposition.forced must be a boolean.");
  if (t.original !== void 0 && typeof t.original != "boolean")
    throw new TypeError("disposition.original must be a boolean.");
  if (t.commentary !== void 0 && typeof t.commentary != "boolean")
    throw new TypeError("disposition.commentary must be a boolean.");
  if (t.hearingImpaired !== void 0 && typeof t.hearingImpaired != "boolean")
    throw new TypeError("disposition.hearingImpaired must be a boolean.");
  if (t.visuallyImpaired !== void 0 && typeof t.visuallyImpaired != "boolean")
    throw new TypeError("disposition.visuallyImpaired must be a boolean.");
};
class x {
  constructor(e) {
    this.bytes = e, this.pos = 0;
  }
  seekToByte(e) {
    this.pos = 8 * e;
  }
  readBit() {
    const e = Math.floor(this.pos / 8), i = this.bytes[e] ?? 0, r = 7 - (this.pos & 7), n = (i & 1 << r) >> r;
    return this.pos++, n;
  }
  readBits(e) {
    if (e === 1)
      return this.readBit();
    let i = 0;
    for (let r = 0; r < e; r++)
      i <<= 1, i |= this.readBit();
    return i;
  }
  writeBits(e, i) {
    const r = this.pos + e;
    for (let n = this.pos; n < r; n++) {
      const s = Math.floor(n / 8);
      let o = this.bytes[s];
      const a = 7 - (n & 7);
      o &= ~(1 << a), o |= (i & 1 << r - n - 1) >> r - n - 1 << a, this.bytes[s] = o;
    }
    this.pos = r;
  }
  readAlignedByte() {
    if (this.pos % 8 !== 0)
      throw new Error("Bitstream is not byte-aligned.");
    const e = this.pos / 8, i = this.bytes[e] ?? 0;
    return this.pos += 8, i;
  }
  skipBits(e) {
    this.pos += e;
  }
  getBitsLeft() {
    return this.bytes.length * 8 - this.pos;
  }
  clone() {
    const e = new x(this.bytes);
    return e.pos = this.pos, e;
  }
}
const ft = [
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
], mt = [-1, 1, 2, 3, 4, 5, 6, 8], ni = (t) => {
  let e = ft.indexOf(t.sampleRate), i = null;
  e === -1 && (e = 15, i = t.sampleRate);
  const r = mt.indexOf(t.numberOfChannels);
  if (r === -1)
    throw new TypeError(`Unsupported number of channels: ${t.numberOfChannels}`);
  let n = 13;
  t.objectType >= 32 && (n += 6), e === 15 && (n += 24);
  const s = Math.ceil(n / 8), o = new Uint8Array(s), a = new x(o);
  return t.objectType < 32 ? a.writeBits(5, t.objectType) : (a.writeBits(5, 31), a.writeBits(6, t.objectType - 32)), a.writeBits(4, e), e === 15 && a.writeBits(24, i), a.writeBits(4, r), o;
};
const V = [
  "avc",
  "hevc",
  "vp9",
  "av1",
  "vp8",
  "prores"
], W = [
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
], pt = [
  "aac",
  "opus",
  "mp3",
  "vorbis",
  "flac",
  "ac3",
  "eac3"
], K = [
  ...pt,
  ...W
], U = [
  "webvtt"
], Ve = [
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
], De = [
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
], Fe = [
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
], We = [
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
], q = [
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
], si = [
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
], oi = (t, e, i, r, n) => {
  if (t === "avc") {
    const o = Math.ceil(e / 16) * Math.ceil(i / 16), a = Ve.find((f) => o <= f.maxMacroblocks && r <= f.maxBitrate) ?? X(Ve), c = a ? a.level : 0, d = "64".padStart(2, "0"), h = "00", l = c.toString(16).padStart(2, "0");
    return `avc1.${d}${h}${l}`;
  } else if (t === "hevc") {
    const c = e * i, d = De.find((l) => c <= l.maxPictureSize && r <= l.maxBitrate) ?? X(De);
    return `hev1.1.6.${d.tier}${d.level}.B0`;
  } else {
    if (t === "vp8")
      return "vp8";
    if (t === "vp9") {
      const o = e * i;
      return `vp09.00.${(Fe.find((d) => o <= d.maxPictureSize && r <= d.maxBitrate) ?? X(Fe)).level.toString().padStart(2, "0")}.08`;
    } else if (t === "av1") {
      const o = e * i, a = We.find((h) => o <= h.maxPictureSize && r <= h.maxBitrate) ?? X(We);
      return `av01.0.${a.level.toString().padStart(2, "0")}${a.tier}.08`;
    } else if (t === "prores") {
      const o = Math.pow(e * i / 2073600, 0.95), a = si.filter((h) => h.alpha === n);
      let c = a[0].fourCc, d = 1 / 0;
      for (const { fourCc: h, bitrate: l } of a) {
        const f = Math.abs(l * o - r);
        f < d && (d = f, c = h);
      }
      return c;
    } else
      G(t);
  }
  throw new TypeError(`Unhandled codec '${String(t)}'.`);
}, ai = (t) => {
  const e = t.split("."), i = Number(e[1]), r = Number(e[2]), n = Number(e[3]), s = e[4] ? Number(e[4]) : 1;
  return [
    1,
    1,
    i,
    2,
    1,
    r,
    3,
    1,
    n,
    4,
    1,
    s
  ];
}, ci = (t) => {
  const e = t.split("."), n = (1 << 7) + 1, s = Number(e[1]), o = e[2], a = Number(o.slice(0, -1)), c = (s << 5) + a, d = o.slice(-1) === "H" ? 1 : 0, l = Number(e[3]) === 8 ? 0 : 1, f = 0, m = e[4] ? Number(e[4]) : 0, p = e[5] ? Number(e[5][0]) : 1, b = e[5] ? Number(e[5][1]) : 1, g = e[5] ? Number(e[5][2]) : 0, y = (d << 7) + (l << 6) + (f << 5) + (m << 4) + (p << 3) + (b << 2) + g;
  return [n, c, y, 0];
}, di = 48e3, wt = /^pcm-([usf])(\d+)(be)?$/, hi = (t) => {
  if (w(W.includes(t)), t === "ulaw")
    return { dataType: "ulaw", sampleSize: 1, littleEndian: !0, silentValue: 255 };
  if (t === "alaw")
    return { dataType: "alaw", sampleSize: 1, littleEndian: !0, silentValue: 213 };
  const e = wt.exec(t);
  w(e);
  let i;
  e[1] === "u" ? i = "unsigned" : e[1] === "s" ? i = "signed" : i = "float";
  const r = Number(e[2]) / 8, n = e[3] !== "be", s = t === "pcm-u8" ? 2 ** 7 : 0;
  return { dataType: i, sampleSize: r, littleEndian: n, silentValue: s };
}, be = (t) => t.startsWith("avc1") || t.startsWith("avc3") ? "avc" : t.startsWith("hev1") || t.startsWith("hvc1") ? "hevc" : t === "vp8" ? "vp8" : t.startsWith("vp09") ? "vp9" : t.startsWith("av01") ? "av1" : q.includes(t) ? "prores" : t === "mp3" || t === "mp4a.69" || t === "mp4a.6B" || t === "mp4a.6b" || t === "mp4a.40.34" ? "mp3" : t.startsWith("mp4a.40.") || t === "mp4a.67" ? "aac" : t === "opus" ? "opus" : t === "vorbis" ? "vorbis" : t === "flac" ? "flac" : t === "ac-3" || t === "ac3" ? "ac3" : t === "ec-3" || t === "eac3" ? "eac3" : t === "ulaw" ? "ulaw" : t === "alaw" ? "alaw" : wt.test(t) ? t : t === "webvtt" ? "webvtt" : null, ui = (t) => t === "avc" ? {
  avc: {
    format: "avc"
    // Ensure the format is not Annex B
  }
} : t === "hevc" ? {
  hevc: {
    format: "hevc"
    // Ensure the format is not Annex B
  }
} : {}, li = ["avc1", "avc3", "hev1", "hvc1", "vp8", "vp09", "av01", ...q], fi = /^(avc1|avc3)\.[0-9a-fA-F]{6}$/, mi = /^(hev1|hvc1)\.(?:[ABC]?\d+)\.[0-9a-fA-F]{1,8}\.[LH]\d+(?:\.[0-9a-fA-F]{1,2}){0,6}$/, pi = /^vp09(?:\.\d{2}){3}(?:(?:\.\d{2}){5})?$/, wi = /^av01\.\d\.\d{2}[MH]\.\d{2}(?:\.\d\.\d{3}\.\d{2}\.\d{2}\.\d{2}\.\d)?$/, gt = (t, e) => {
  if (!t)
    throw new TypeError("Video chunk metadata must be provided.");
  if (typeof t != "object")
    throw new TypeError("Video chunk metadata must be an object.");
  if (!t.decoderConfig)
    throw new TypeError("Video chunk metadata must include a decoder configuration.");
  if (typeof t.decoderConfig != "object")
    throw new TypeError("Video chunk metadata decoder configuration must be an object.");
  if (typeof t.decoderConfig.codec != "string")
    throw new TypeError("Video chunk metadata decoder configuration must specify a codec string.");
  if (!li.some((i) => t.decoderConfig.codec.startsWith(i)))
    throw new TypeError("Video chunk metadata decoder configuration codec string must be a valid video codec string as specified in the Mediabunny Codec Registry.");
  if (!Number.isInteger(t.decoderConfig.codedWidth) || t.decoderConfig.codedWidth <= 0)
    throw new TypeError("Video chunk metadata decoder configuration must specify a valid codedWidth (positive integer).");
  if (!Number.isInteger(t.decoderConfig.codedHeight) || t.decoderConfig.codedHeight <= 0)
    throw new TypeError("Video chunk metadata decoder configuration must specify a valid codedHeight (positive integer).");
  if (t.decoderConfig.displayAspectWidth !== void 0 && (!Number.isInteger(t.decoderConfig.displayAspectWidth) || t.decoderConfig.displayAspectWidth <= 0))
    throw new TypeError("Video chunk metadata decoder configuration displayAspectWidth, when defined, must be a positive integer.");
  if (t.decoderConfig.displayAspectHeight !== void 0 && (!Number.isInteger(t.decoderConfig.displayAspectHeight) || t.decoderConfig.displayAspectHeight <= 0))
    throw new TypeError("Video chunk metadata decoder configuration displayAspectHeight, when defined, must be a positive integer.");
  if (t.decoderConfig.displayAspectWidth !== void 0 != (t.decoderConfig.displayAspectHeight !== void 0))
    throw new TypeError("Video chunk metadata decoder configuration must specify both displayAspectWidth and displayAspectHeight, or neither.");
  if (t.decoderConfig.description !== void 0 && !ge(t.decoderConfig.description))
    throw new TypeError("Video chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an ArrayBuffer view.");
  if (t.decoderConfig.colorSpace !== void 0) {
    const { colorSpace: i } = t.decoderConfig;
    if (typeof i != "object")
      throw new TypeError("Video chunk metadata decoder configuration colorSpace, when provided, must be an object.");
    const r = Object.keys(me);
    if (i.primaries != null && !r.includes(i.primaries))
      throw new TypeError(`Video chunk metadata decoder configuration colorSpace primaries, when defined, must be one of ${r.join(", ")}.`);
    const n = Object.keys(pe);
    if (i.transfer != null && !n.includes(i.transfer))
      throw new TypeError(`Video chunk metadata decoder configuration colorSpace transfer, when defined, must be one of ${n.join(", ")}.`);
    const s = Object.keys(we);
    if (i.matrix != null && !s.includes(i.matrix))
      throw new TypeError(`Video chunk metadata decoder configuration colorSpace matrix, when defined, must be one of ${s.join(", ")}.`);
    if (i.fullRange != null && typeof i.fullRange != "boolean")
      throw new TypeError("Video chunk metadata decoder configuration colorSpace fullRange, when defined, must be a boolean.");
  }
  if (t.decoderConfig.codec.startsWith("avc1") || t.decoderConfig.codec.startsWith("avc3")) {
    if (!fi.test(t.decoderConfig.codec))
      throw new TypeError("Video chunk metadata decoder configuration codec string for AVC must be a valid AVC codec string as specified in Section 3.4 of RFC 6381.");
  } else if (t.decoderConfig.codec.startsWith("hev1") || t.decoderConfig.codec.startsWith("hvc1")) {
    if (!mi.test(t.decoderConfig.codec))
      throw new TypeError("Video chunk metadata decoder configuration codec string for HEVC must be a valid HEVC codec string as specified in Section E.3 of ISO 14496-15.");
  } else if (t.decoderConfig.codec.startsWith("vp8")) {
    if (t.decoderConfig.codec !== "vp8")
      throw new TypeError('Video chunk metadata decoder configuration codec string for VP8 must be "vp8".');
  } else if (t.decoderConfig.codec.startsWith("vp09")) {
    if (!pi.test(t.decoderConfig.codec))
      throw new TypeError('Video chunk metadata decoder configuration codec string for VP9 must be a valid VP9 codec string as specified in Section "Codecs Parameter String" of https://www.webmproject.org/vp9/mp4/.');
  } else if (t.decoderConfig.codec.startsWith("av01")) {
    if (!wi.test(t.decoderConfig.codec))
      throw new TypeError('Video chunk metadata decoder configuration codec string for AV1 must be a valid AV1 codec string as specified in Section "Codecs Parameter String" of https://aomediacodec.github.io/av1-isobmff/.');
  } else if (q.some((i) => t.decoderConfig.codec.startsWith(i)) && !q.some((i) => t.decoderConfig.codec === i))
    throw new TypeError(`Video chunk metadata decoder configuration codec string for ProRes must be one of the valid ProRes four-character codes: ${q.join(", ")}.`);
  if (e !== null && be(t.decoderConfig.codec) !== e)
    throw new TypeError(`Video chunk metadata decoder configuration codec string '${t.decoderConfig.codec}' does not fit to the track codec '${e}'.`);
}, gi = [
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
], yt = (t, e) => {
  if (!t)
    throw new TypeError("Audio chunk metadata must be provided.");
  if (typeof t != "object")
    throw new TypeError("Audio chunk metadata must be an object.");
  if (!t.decoderConfig)
    throw new TypeError("Audio chunk metadata must include a decoder configuration.");
  if (typeof t.decoderConfig != "object")
    throw new TypeError("Audio chunk metadata decoder configuration must be an object.");
  if (typeof t.decoderConfig.codec != "string")
    throw new TypeError("Audio chunk metadata decoder configuration must specify a codec string.");
  if (!gi.some((i) => t.decoderConfig.codec.startsWith(i)))
    throw new TypeError("Audio chunk metadata decoder configuration codec string must be a valid audio codec string as specified in the Mediabunny Codec Registry.");
  if (!Number.isInteger(t.decoderConfig.sampleRate) || t.decoderConfig.sampleRate <= 0)
    throw new TypeError("Audio chunk metadata decoder configuration must specify a valid sampleRate (positive integer).");
  if (!Number.isInteger(t.decoderConfig.numberOfChannels) || t.decoderConfig.numberOfChannels <= 0)
    throw new TypeError("Audio chunk metadata decoder configuration must specify a valid numberOfChannels (positive integer).");
  if (t.decoderConfig.description !== void 0 && !ge(t.decoderConfig.description))
    throw new TypeError("Audio chunk metadata decoder configuration description, when defined, must be an ArrayBuffer or an ArrayBuffer view.");
  if (t.decoderConfig.codec.startsWith("mp4a") && t.decoderConfig.codec !== "mp4a.69" && t.decoderConfig.codec !== "mp4a.6B" && t.decoderConfig.codec !== "mp4a.6b") {
    if (!["mp4a.40.2", "mp4a.40.02", "mp4a.40.5", "mp4a.40.05", "mp4a.40.29", "mp4a.67"].includes(t.decoderConfig.codec))
      throw new TypeError("Audio chunk metadata decoder configuration codec string for AAC must be a valid AAC codec string as specified in https://www.w3.org/TR/webcodecs-aac-codec-registration/.");
  } else if (t.decoderConfig.codec.startsWith("mp3") || t.decoderConfig.codec.startsWith("mp4a")) {
    if (t.decoderConfig.codec !== "mp3" && t.decoderConfig.codec !== "mp4a.69" && t.decoderConfig.codec !== "mp4a.6B" && t.decoderConfig.codec !== "mp4a.6b")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for MP3 must be "mp3", "mp4a.69" or "mp4a.6B".');
  } else if (t.decoderConfig.codec.startsWith("opus")) {
    if (t.decoderConfig.codec !== "opus")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for Opus must be "opus".');
    if (t.decoderConfig.description && t.decoderConfig.description.byteLength < 18)
      throw new TypeError("Audio chunk metadata decoder configuration description, when specified, is expected to be an Identification Header as specified in Section 5.1 of RFC 7845.");
  } else if (t.decoderConfig.codec.startsWith("vorbis")) {
    if (t.decoderConfig.codec !== "vorbis")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for Vorbis must be "vorbis".');
    if (!t.decoderConfig.description)
      throw new TypeError("Audio chunk metadata decoder configuration for Vorbis must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-vorbis-codec-registration/.");
  } else if (t.decoderConfig.codec.startsWith("flac")) {
    if (t.decoderConfig.codec !== "flac")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for FLAC must be "flac".');
    if (!t.decoderConfig.description || t.decoderConfig.description.byteLength < 42)
      throw new TypeError("Audio chunk metadata decoder configuration for FLAC must include a description, which is expected to adhere to the format described in https://www.w3.org/TR/webcodecs-flac-codec-registration/.");
  } else if (t.decoderConfig.codec.startsWith("ac-3") || t.decoderConfig.codec.startsWith("ac3")) {
    if (t.decoderConfig.codec !== "ac-3")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for AC-3 must be "ac-3".');
  } else if (t.decoderConfig.codec.startsWith("ec-3") || t.decoderConfig.codec.startsWith("eac3")) {
    if (t.decoderConfig.codec !== "ec-3")
      throw new TypeError('Audio chunk metadata decoder configuration codec string for EC-3 must be "ec-3".');
  } else if ((t.decoderConfig.codec.startsWith("pcm") || t.decoderConfig.codec.startsWith("ulaw") || t.decoderConfig.codec.startsWith("alaw")) && !W.includes(t.decoderConfig.codec))
    throw new TypeError(`Audio chunk metadata decoder configuration codec string for PCM must be one of the supported PCM codecs (${W.join(", ")}).`);
  if (e !== null && be(t.decoderConfig.codec) !== e)
    throw new TypeError(`Audio chunk metadata decoder configuration codec string '${t.decoderConfig.codec}' does not fit to the track codec '${e}'.`);
}, yi = (t) => {
  if (!t)
    throw new TypeError("Subtitle metadata must be provided.");
  if (typeof t != "object")
    throw new TypeError("Subtitle metadata must be an object.");
  if (!t.config)
    throw new TypeError("Subtitle metadata must include a config object.");
  if (typeof t.config != "object")
    throw new TypeError("Subtitle metadata config must be an object.");
  if (typeof t.config.description != "string")
    throw new TypeError("Subtitle metadata config description must be a string.");
};
var O;
(function(t) {
  t[t.NON_IDR_SLICE = 1] = "NON_IDR_SLICE", t[t.SLICE_DPA = 2] = "SLICE_DPA", t[t.SLICE_DPB = 3] = "SLICE_DPB", t[t.SLICE_DPC = 4] = "SLICE_DPC", t[t.IDR = 5] = "IDR", t[t.SEI = 6] = "SEI", t[t.SPS = 7] = "SPS", t[t.PPS = 8] = "PPS", t[t.AUD = 9] = "AUD", t[t.SPS_EXT = 13] = "SPS_EXT";
})(O || (O = {}));
var L;
(function(t) {
  t[t.RASL_N = 8] = "RASL_N", t[t.RASL_R = 9] = "RASL_R", t[t.BLA_W_LP = 16] = "BLA_W_LP", t[t.RSV_IRAP_VCL23 = 23] = "RSV_IRAP_VCL23", t[t.VPS_NUT = 32] = "VPS_NUT", t[t.SPS_NUT = 33] = "SPS_NUT", t[t.PPS_NUT = 34] = "PPS_NUT", t[t.AUD_NUT = 35] = "AUD_NUT", t[t.PREFIX_SEI_NUT = 39] = "PREFIX_SEI_NUT", t[t.SUFFIX_SEI_NUT = 40] = "SUFFIX_SEI_NUT";
})(L || (L = {}));
const bt = function* (t) {
  let e = 0, i = -1;
  for (; e < t.length - 2; ) {
    const r = t.indexOf(0, e);
    if (r === -1 || r >= t.length - 2)
      break;
    e = r;
    let n = 0;
    if (e + 3 < t.length && t[e + 1] === 0 && t[e + 2] === 0 && t[e + 3] === 1 ? n = 4 : t[e + 1] === 0 && t[e + 2] === 1 && (n = 3), n === 0) {
      e++;
      continue;
    }
    i !== -1 && e > i && (yield {
      offset: i,
      length: e - i
    }), i = e + n, e = i;
  }
  i !== -1 && i < t.length && (yield {
    offset: i,
    length: t.length - i
  });
}, Tt = function* (t, e) {
  let i = 0;
  const r = new DataView(t.buffer, t.byteOffset, t.byteLength);
  for (; i + e <= t.length; ) {
    let n;
    e === 1 ? n = r.getUint8(i) : e === 2 ? n = r.getUint16(i, !1) : e === 3 ? n = Mt(r, i) : (w(e === 4), n = r.getUint32(i, !1)), i += e, yield {
      offset: i,
      length: n
    }, i += n;
  }
}, bi = (t, e) => {
  if (e.description) {
    const n = (R(e.description)[4] & 3) + 1;
    return Tt(t, n);
  } else
    return bt(t);
}, Ti = (t) => t & 31, Ci = (t) => {
  const e = [], i = t.length;
  for (let r = 0; r < i; r++)
    r + 2 < i && t[r] === 0 && t[r + 1] === 0 && t[r + 2] === 3 ? (e.push(0, 0), r += 2) : e.push(t[r]);
  return new Uint8Array(e);
}, Ei = (t, e) => {
  if (e.description) {
    const n = (R(e.description)[21] & 3) + 1;
    return Tt(t, n);
  } else
    return bt(t);
}, vi = (t) => t >> 1 & 63;
var ze;
(function(t) {
  t[t.audAllowed = 0] = "audAllowed", t[t.beforeFirstVcl = 1] = "beforeFirstVcl", t[t.afterFirstVcl = 2] = "afterFirstVcl", t[t.eoBitstreamAllowed = 3] = "eoBitstreamAllowed", t[t.noMoreDataAllowed = 4] = "noMoreDataAllowed";
})(ze || (ze = {}));
const _i = function* (t) {
  const e = new x(t), i = () => {
    let r = 0;
    for (let n = 0; n < 8; n++) {
      const s = e.readAlignedByte();
      if (r |= (s & 127) << n * 7, !(s & 128))
        break;
      if (n === 7 && s & 128)
        return null;
    }
    return r >= 2 ** 32 - 1 ? null : r;
  };
  for (; e.getBitsLeft() >= 8; ) {
    e.skipBits(1);
    const r = e.readBits(4), n = e.readBits(1), s = e.readBits(1);
    e.skipBits(1), n && e.skipBits(8);
    let o;
    if (s) {
      const a = i();
      if (a === null)
        return;
      o = a;
    } else
      o = Math.floor(e.getBitsLeft() / 8);
    w(e.pos % 8 === 0), yield {
      type: r,
      data: t.subarray(e.pos / 8, e.pos / 8 + o)
    }, e.skipBits(o * 8);
  }
}, ki = (t) => {
  const e = at(t), i = e.getUint8(9), r = e.getUint16(10, !0), n = e.getUint32(12, !0), s = e.getInt16(16, !0), o = e.getUint8(18);
  let a = null;
  return o && (a = t.subarray(19, 21 + i)), {
    outputChannelCount: i,
    preSkip: r,
    inputSampleRate: n,
    outputGain: s,
    channelMappingFamily: o,
    channelMappingTable: a
  };
}, Si = (t, e, i) => {
  switch (t) {
    case "avc": {
      for (const r of bi(i, e)) {
        const n = i[r.offset], s = Ti(n);
        if (s >= O.NON_IDR_SLICE && s <= O.SLICE_DPC)
          return "delta";
        if (s === O.IDR)
          return "key";
        if (s === O.SEI && (!Gt() || Qt() >= 144)) {
          const o = i.subarray(r.offset, r.offset + r.length), a = Ci(o);
          let c = 1;
          do {
            let d = 0;
            for (; ; ) {
              const f = a[c++];
              if (f === void 0 || (d += f, f < 255))
                break;
            }
            let h = 0;
            for (; ; ) {
              const f = a[c++];
              if (f === void 0 || (h += f, f < 255))
                break;
            }
            if (d === 6) {
              const f = new x(a);
              f.pos = 8 * c;
              const m = Ot(f), p = f.readBits(1);
              if (m === 0 && p === 1)
                return "key";
            }
            c += h;
          } while (c < a.length - 1);
        }
      }
      return "delta";
    }
    case "hevc": {
      for (const r of Ei(i, e)) {
        const n = vi(i[r.offset]);
        if (n < L.BLA_W_LP)
          return "delta";
        if (n <= L.RSV_IRAP_VCL23)
          return "key";
      }
      return "delta";
    }
    case "vp8":
      return (i[0] & 1) === 0 ? "key" : "delta";
    case "vp9": {
      const r = new x(i);
      if (r.readBits(2) !== 2)
        return null;
      const n = r.readBits(1);
      return (r.readBits(1) << 1) + n === 3 && r.skipBits(1), r.readBits(1) ? null : r.readBits(1) === 0 ? "key" : "delta";
    }
    case "av1": {
      let r = !1;
      for (const { type: n, data: s } of _i(i))
        if (n === 1) {
          const o = new x(s);
          o.skipBits(4), r = !!o.readBits(1);
        } else if (n === 3 || n === 6 || n === 7) {
          if (r)
            return "key";
          const o = new x(s);
          return o.readBits(1) ? null : o.readBits(2) === 0 ? "key" : "delta";
        }
      return null;
    }
    case "prores":
      return "key";
    default:
      G(t), w(!1);
  }
};
var Ie;
(function(t) {
  t[t.STREAMINFO = 0] = "STREAMINFO", t[t.VORBIS_COMMENT = 4] = "VORBIS_COMMENT", t[t.PICTURE = 6] = "PICTURE";
})(Ie || (Ie = {}));
const Oe = /* @__PURE__ */ new Uint8Array(0);
class z {
  /** Creates a new {@link EncodedPacket} from raw bytes and timing information. */
  constructor(e, i, r, n, s = -1, o, a) {
    if (this.data = e, this.type = i, this.timestamp = r, this.duration = n, this.sequenceNumber = s, e === Oe && o === void 0)
      throw new Error("Internal error: byteLength must be explicitly provided when constructing metadata-only packets.");
    if (o === void 0 && (o = e.byteLength), !(e instanceof Uint8Array))
      throw new TypeError("data must be a Uint8Array.");
    if (i !== "key" && i !== "delta")
      throw new TypeError('type must be either "key" or "delta".');
    if (!Number.isFinite(r))
      throw new TypeError("timestamp must be a number.");
    if (!Number.isFinite(n) || n < 0)
      throw new TypeError("duration must be a non-negative number.");
    if (!Number.isFinite(s))
      throw new TypeError("sequenceNumber must be a number.");
    if (!Number.isInteger(o) || o < 0)
      throw new TypeError("byteLength must be a non-negative integer.");
    if (a !== void 0 && (typeof a != "object" || !a))
      throw new TypeError("sideData, when provided, must be an object.");
    if (a?.alpha !== void 0 && !(a.alpha instanceof Uint8Array))
      throw new TypeError("sideData.alpha, when provided, must be a Uint8Array.");
    if (a?.alphaByteLength !== void 0 && (!Number.isInteger(a.alphaByteLength) || a.alphaByteLength < 0))
      throw new TypeError("sideData.alphaByteLength, when provided, must be a non-negative integer.");
    this.byteLength = o, this.sideData = a ?? {}, this.sideData.alpha && this.sideData.alphaByteLength === void 0 && (this.sideData.alphaByteLength = this.sideData.alpha.byteLength);
  }
  /**
   * If this packet is a metadata-only packet. Metadata-only packets don't contain their packet data. They are the
   * result of retrieving packets with {@link PacketRetrievalOptions.metadataOnly} set to `true`.
   */
  get isMetadataOnly() {
    return this.data === Oe;
  }
  /** The timestamp of this packet in microseconds. */
  get microsecondTimestamp() {
    return Math.trunc(I * this.timestamp);
  }
  /** The duration of this packet in microseconds. */
  get microsecondDuration() {
    return Math.trunc(I * this.duration);
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
  static fromEncodedChunk(e, i) {
    if (!(e instanceof EncodedVideoChunk || e instanceof EncodedAudioChunk))
      throw new TypeError("chunk must be an EncodedVideoChunk or EncodedAudioChunk.");
    const r = new Uint8Array(e.byteLength);
    return e.copyTo(r), new z(r, e.type, e.timestamp / 1e6, (e.duration ?? 0) / 1e6, void 0, void 0, i);
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
    return new z(e?.data ?? this.data, e?.type ?? this.type, e?.timestamp ?? this.timestamp, e?.duration ?? this.duration, e?.sequenceNumber ?? this.sequenceNumber, this.byteLength, e?.sideData ?? this.sideData);
  }
}
class de {
  constructor(e) {
    this.value = e;
  }
}
class he {
  constructor(e) {
    this.value = e;
  }
}
class Ct {
  constructor(e) {
    this.value = e;
  }
}
class A {
  constructor(e) {
    this.value = e;
  }
}
var u;
(function(t) {
  t[t.EBML = 440786851] = "EBML", t[t.EBMLVersion = 17030] = "EBMLVersion", t[t.EBMLReadVersion = 17143] = "EBMLReadVersion", t[t.EBMLMaxIDLength = 17138] = "EBMLMaxIDLength", t[t.EBMLMaxSizeLength = 17139] = "EBMLMaxSizeLength", t[t.DocType = 17026] = "DocType", t[t.DocTypeVersion = 17031] = "DocTypeVersion", t[t.DocTypeReadVersion = 17029] = "DocTypeReadVersion", t[t.Void = 236] = "Void", t[t.Segment = 408125543] = "Segment", t[t.SeekHead = 290298740] = "SeekHead", t[t.Seek = 19899] = "Seek", t[t.SeekID = 21419] = "SeekID", t[t.SeekPosition = 21420] = "SeekPosition", t[t.Duration = 17545] = "Duration", t[t.Info = 357149030] = "Info", t[t.TimestampScale = 2807729] = "TimestampScale", t[t.MuxingApp = 19840] = "MuxingApp", t[t.WritingApp = 22337] = "WritingApp", t[t.Tracks = 374648427] = "Tracks", t[t.TrackEntry = 174] = "TrackEntry", t[t.TrackNumber = 215] = "TrackNumber", t[t.TrackUID = 29637] = "TrackUID", t[t.TrackType = 131] = "TrackType", t[t.FlagEnabled = 185] = "FlagEnabled", t[t.FlagDefault = 136] = "FlagDefault", t[t.FlagForced = 21930] = "FlagForced", t[t.FlagOriginal = 21934] = "FlagOriginal", t[t.FlagHearingImpaired = 21931] = "FlagHearingImpaired", t[t.FlagVisualImpaired = 21932] = "FlagVisualImpaired", t[t.FlagCommentary = 21935] = "FlagCommentary", t[t.FlagLacing = 156] = "FlagLacing", t[t.Name = 21358] = "Name", t[t.Language = 2274716] = "Language", t[t.LanguageBCP47 = 2274717] = "LanguageBCP47", t[t.CodecID = 134] = "CodecID", t[t.CodecPrivate = 25506] = "CodecPrivate", t[t.CodecDelay = 22186] = "CodecDelay", t[t.SeekPreRoll = 22203] = "SeekPreRoll", t[t.DefaultDuration = 2352003] = "DefaultDuration", t[t.Video = 224] = "Video", t[t.PixelWidth = 176] = "PixelWidth", t[t.PixelHeight = 186] = "PixelHeight", t[t.DisplayWidth = 21680] = "DisplayWidth", t[t.DisplayHeight = 21690] = "DisplayHeight", t[t.DisplayUnit = 21682] = "DisplayUnit", t[t.AlphaMode = 21440] = "AlphaMode", t[t.Audio = 225] = "Audio", t[t.SamplingFrequency = 181] = "SamplingFrequency", t[t.Channels = 159] = "Channels", t[t.BitDepth = 25188] = "BitDepth", t[t.SimpleBlock = 163] = "SimpleBlock", t[t.BlockGroup = 160] = "BlockGroup", t[t.Block = 161] = "Block", t[t.BlockAdditions = 30113] = "BlockAdditions", t[t.BlockMore = 166] = "BlockMore", t[t.BlockAdditional = 165] = "BlockAdditional", t[t.BlockAddID = 238] = "BlockAddID", t[t.BlockDuration = 155] = "BlockDuration", t[t.ReferenceBlock = 251] = "ReferenceBlock", t[t.Cluster = 524531317] = "Cluster", t[t.Timestamp = 231] = "Timestamp", t[t.Cues = 475249515] = "Cues", t[t.CuePoint = 187] = "CuePoint", t[t.CueTime = 179] = "CueTime", t[t.CueTrackPositions = 183] = "CueTrackPositions", t[t.CueTrack = 247] = "CueTrack", t[t.CueClusterPosition = 241] = "CueClusterPosition", t[t.Colour = 21936] = "Colour", t[t.MatrixCoefficients = 21937] = "MatrixCoefficients", t[t.TransferCharacteristics = 21946] = "TransferCharacteristics", t[t.Primaries = 21947] = "Primaries", t[t.Range = 21945] = "Range", t[t.Projection = 30320] = "Projection", t[t.ProjectionType = 30321] = "ProjectionType", t[t.ProjectionPoseRoll = 30325] = "ProjectionPoseRoll", t[t.Attachments = 423732329] = "Attachments", t[t.AttachedFile = 24999] = "AttachedFile", t[t.FileDescription = 18046] = "FileDescription", t[t.FileName = 18030] = "FileName", t[t.FileMediaType = 18016] = "FileMediaType", t[t.FileData = 18012] = "FileData", t[t.FileUID = 18094] = "FileUID", t[t.Chapters = 272869232] = "Chapters", t[t.Tags = 307544935] = "Tags", t[t.Tag = 29555] = "Tag", t[t.Targets = 25536] = "Targets", t[t.TargetTypeValue = 26826] = "TargetTypeValue", t[t.TargetType = 25546] = "TargetType", t[t.TagTrackUID = 25541] = "TagTrackUID", t[t.TagEditionUID = 25545] = "TagEditionUID", t[t.TagChapterUID = 25540] = "TagChapterUID", t[t.TagAttachmentUID = 25542] = "TagAttachmentUID", t[t.SimpleTag = 26568] = "SimpleTag", t[t.TagName = 17827] = "TagName", t[t.TagLanguage = 17530] = "TagLanguage", t[t.TagString = 17543] = "TagString", t[t.TagBinary = 17541] = "TagBinary", t[t.ContentEncodings = 28032] = "ContentEncodings", t[t.ContentEncoding = 25152] = "ContentEncoding", t[t.ContentEncodingOrder = 20529] = "ContentEncodingOrder", t[t.ContentEncodingScope = 20530] = "ContentEncodingScope", t[t.ContentCompression = 20532] = "ContentCompression", t[t.ContentCompAlgo = 16980] = "ContentCompAlgo", t[t.ContentCompSettings = 16981] = "ContentCompSettings", t[t.ContentEncryption = 20533] = "ContentEncryption";
})(u || (u = {}));
u.EBML, u.Segment;
u.SeekHead, u.Info, u.Cluster, u.Tracks, u.Cues, u.Attachments, u.Chapters, u.Tags;
const Be = (t) => t < 256 ? 1 : t < 65536 ? 2 : t < 1 << 24 ? 3 : t < 2 ** 32 ? 4 : t < 2 ** 40 ? 5 : 6, He = (t) => t < 1n << 8n ? 1 : t < 1n << 16n ? 2 : t < 1n << 24n ? 3 : t < 1n << 32n ? 4 : t < 1n << 40n ? 5 : t < 1n << 48n ? 6 : t < 1n << 56n ? 7 : 8, Me = (t) => t >= -64 && t < 64 ? 1 : t >= -8192 && t < 8192 ? 2 : t >= -1048576 && t < 1 << 20 ? 3 : t >= -134217728 && t < 1 << 27 ? 4 : t >= -17179869184 && t < 2 ** 34 ? 5 : 6, xi = (t) => {
  if (t < 127)
    return 1;
  if (t < 16383)
    return 2;
  if (t < (1 << 21) - 1)
    return 3;
  if (t < (1 << 28) - 1)
    return 4;
  if (t < 2 ** 35 - 1)
    return 5;
  if (t < 2 ** 42 - 1)
    return 6;
  throw new Error("EBML varint size not supported " + t);
};
class Pi {
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
  writeUnsignedInt(e, i = Be(e)) {
    let r = 0;
    switch (i) {
      case 6:
        this.helperView.setUint8(r++, e / 2 ** 40 | 0);
      // eslint-disable-next-line no-fallthrough
      case 5:
        this.helperView.setUint8(r++, e / 2 ** 32 | 0);
      // eslint-disable-next-line no-fallthrough
      case 4:
        this.helperView.setUint8(r++, e >> 24);
      // eslint-disable-next-line no-fallthrough
      case 3:
        this.helperView.setUint8(r++, e >> 16);
      // eslint-disable-next-line no-fallthrough
      case 2:
        this.helperView.setUint8(r++, e >> 8);
      // eslint-disable-next-line no-fallthrough
      case 1:
        this.helperView.setUint8(r++, e);
        break;
      default:
        throw new Error("Bad unsigned int size " + i);
    }
    this.writer.write(this.helper.subarray(0, r));
  }
  writeUnsignedBigInt(e, i = He(e)) {
    let r = 0;
    for (let n = i - 1; n >= 0; n--)
      this.helperView.setUint8(r++, Number(e >> BigInt(n * 8) & 0xffn));
    this.writer.write(this.helper.subarray(0, r));
  }
  writeSignedInt(e, i = Me(e)) {
    e < 0 && (e += 2 ** (i * 8)), this.writeUnsignedInt(e, i);
  }
  writeVarInt(e, i = xi(e)) {
    let r = 0;
    switch (i) {
      case 1:
        this.helperView.setUint8(r++, 128 | e);
        break;
      case 2:
        this.helperView.setUint8(r++, 64 | e >> 8), this.helperView.setUint8(r++, e);
        break;
      case 3:
        this.helperView.setUint8(r++, 32 | e >> 16), this.helperView.setUint8(r++, e >> 8), this.helperView.setUint8(r++, e);
        break;
      case 4:
        this.helperView.setUint8(r++, 16 | e >> 24), this.helperView.setUint8(r++, e >> 16), this.helperView.setUint8(r++, e >> 8), this.helperView.setUint8(r++, e);
        break;
      case 5:
        this.helperView.setUint8(r++, 8 | e / 2 ** 32 & 7), this.helperView.setUint8(r++, e >> 24), this.helperView.setUint8(r++, e >> 16), this.helperView.setUint8(r++, e >> 8), this.helperView.setUint8(r++, e);
        break;
      case 6:
        this.helperView.setUint8(r++, 4 | e / 2 ** 40 & 3), this.helperView.setUint8(r++, e / 2 ** 32 | 0), this.helperView.setUint8(r++, e >> 24), this.helperView.setUint8(r++, e >> 16), this.helperView.setUint8(r++, e >> 8), this.helperView.setUint8(r++, e);
        break;
      default:
        throw new Error("Bad EBML varint size " + i);
    }
    this.writer.write(this.helper.subarray(0, r));
  }
  writeAsciiString(e) {
    this.writer.write(new Uint8Array(e.split("").map((i) => i.charCodeAt(0))));
  }
  writeEBML(e) {
    if (e !== null)
      if (e instanceof Uint8Array)
        this.writer.write(e);
      else if (Array.isArray(e))
        for (const i of e)
          this.writeEBML(i);
      else if (this.offsets.set(e, this.writer.getPos()), this.writeUnsignedInt(e.id), Array.isArray(e.data)) {
        const i = this.writer.getPos(), r = e.size === -1 ? 1 : e.size ?? 4;
        e.size === -1 ? this.writeByte(255) : this.writer.seek(this.writer.getPos() + r);
        const n = this.writer.getPos();
        if (this.dataOffsets.set(e, n), this.writeEBML(e.data), e.size !== -1) {
          const s = this.writer.getPos() - n, o = this.writer.getPos();
          this.writer.seek(i), this.writeVarInt(s, r), this.writer.seek(o);
        }
      } else if (typeof e.data == "number") {
        const i = e.size ?? Be(e.data);
        this.writeVarInt(i), this.writeUnsignedInt(e.data, i);
      } else if (typeof e.data == "bigint") {
        const i = e.size ?? He(e.data);
        this.writeVarInt(i), this.writeUnsignedBigInt(e.data, i);
      } else if (typeof e.data == "string")
        this.writeVarInt(e.data.length), this.writeAsciiString(e.data);
      else if (e.data instanceof Uint8Array)
        this.writeVarInt(e.data.byteLength, e.size), this.writer.write(e.data);
      else if (e.data instanceof de)
        this.writeVarInt(4), this.writeFloat32(e.data.value);
      else if (e.data instanceof he)
        this.writeVarInt(8), this.writeFloat64(e.data.value);
      else if (e.data instanceof Ct) {
        const i = e.size ?? Me(e.data.value);
        this.writeVarInt(i), this.writeSignedInt(e.data.value, i);
      } else if (e.data instanceof A) {
        const i = N.encode(e.data.value);
        this.writeVarInt(i.length), this.writer.write(i);
      } else
        G(e.data);
  }
}
const Ai = {
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
const Ri = (t) => {
  let i = (t.hasVideo ? "video/" : t.hasAudio ? "audio/" : "application/") + (t.isWebM ? "webm" : "x-matroska");
  if (t.codecStrings.length > 0) {
    const r = [...new Set(t.codecStrings.filter(Boolean))];
    i += `; codecs="${r.join(", ")}"`;
  }
  return i;
};
const Vi = 7, Di = 9, Ne = (t) => {
  const e = t.filePos, i = $i(t, 9), r = new x(i);
  if (r.readBits(12) !== 4095 || (r.skipBits(1), r.readBits(2) !== 0))
    return null;
  const o = r.readBits(1), a = r.readBits(2) + 1, c = r.readBits(4);
  if (c === 15)
    return null;
  r.skipBits(1);
  const d = r.readBits(3);
  if (d === 0)
    throw new Error("ADTS frames with channel configuration 0 are not supported.");
  r.skipBits(1), r.skipBits(1), r.skipBits(1), r.skipBits(1);
  const h = r.readBits(13);
  r.skipBits(11);
  const l = r.readBits(2) + 1;
  if (l !== 1)
    throw new Error("ADTS frames with more than one AAC frame are not supported.");
  let f = null;
  return o === 1 ? t.filePos -= 2 : f = r.readBits(16), {
    objectType: a,
    samplingFrequencyIndex: c,
    channelConfiguration: d,
    frameLength: h,
    numberOfAacFrames: l,
    crcCheck: f,
    startPos: e
  };
};
var Fi = function(t, e, i) {
  if (e != null) {
    if (typeof e != "object" && typeof e != "function") throw new TypeError("Object expected.");
    var r, n;
    if (i) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      r = e[Symbol.asyncDispose];
    }
    if (r === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      r = e[Symbol.dispose], i && (n = r);
    }
    if (typeof r != "function") throw new TypeError("Object not disposable.");
    n && (r = function() {
      try {
        n.call(this);
      } catch (s) {
        return Promise.reject(s);
      }
    }), t.stack.push({ value: e, dispose: r, async: i });
  } else i && t.stack.push({ async: !0 });
  return e;
}, Wi = /* @__PURE__ */ (function(t) {
  return function(e) {
    function i(o) {
      e.error = e.hasError ? new t(o, e.error, "An error was suppressed during disposal.") : o, e.hasError = !0;
    }
    var r, n = 0;
    function s() {
      for (; r = e.stack.pop(); )
        try {
          if (!r.async && n === 1) return n = 0, e.stack.push(r), Promise.resolve().then(s);
          if (r.dispose) {
            var o = r.dispose.call(r.value);
            if (r.async) return n |= 2, Promise.resolve(o).then(s, function(a) {
              return i(a), s();
            });
          } else n |= 1;
        } catch (a) {
          i(a);
        }
      if (n === 1) return e.hasError ? Promise.reject(e.error) : Promise.resolve();
      if (e.hasError) throw e.error;
    }
    return s();
  };
})(typeof SuppressedError == "function" ? SuppressedError : function(t, e, i) {
  var r = new Error(i);
  return r.name = "SuppressedError", r.error = t, r.suppressed = e, r;
});
Yt();
let qe = -1 / 0, Ue = -1 / 0, ue = null;
typeof FinalizationRegistry < "u" && (ue = new FinalizationRegistry((t) => {
  const e = performance.now();
  t.type === "video" ? (e - qe >= 1e3 && (E._error("A VideoSample was garbage collected without first being closed. For proper resource management, make sure to call close() on all your VideoSamples as soon as you're done using them."), qe = e), typeof VideoFrame < "u" && t.data instanceof VideoFrame && t.data.close()) : (e - Ue >= 1e3 && (E._error("An AudioSample was garbage collected without first being closed. For proper resource management, make sure to call close() on all your AudioSamples as soon as you're done using them."), Ue = e), typeof AudioData < "u" && t.data instanceof AudioData && t.data.close());
}));
class D {
  constructor() {
    this._referenceCount = 0, this._lastAllocationBuffer = null;
  }
}
const le = [
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
], zi = new Set(le);
class v {
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
    return Math.trunc(I * this.timestamp);
  }
  /** The duration of the frame in microseconds. */
  get microsecondDuration() {
    return Math.trunc(I * this.duration);
  }
  /**
   * Whether this sample uses a pixel format that can hold transparency data. Note that this doesn't necessarily mean
   * that the sample is transparent.
   */
  get hasAlpha() {
    return this.format && this.format.includes("A");
  }
  constructor(e, i) {
    if (this._closed = !1, e instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && e instanceof SharedArrayBuffer || ArrayBuffer.isView(e)) {
      if (!i || typeof i != "object")
        throw new TypeError("init must be an object.");
      if (i.format === void 0 || !zi.has(i.format))
        throw new TypeError("init.format must be one of: " + le.join(", "));
      if (!Number.isInteger(i.codedWidth) || i.codedWidth <= 0)
        throw new TypeError("init.codedWidth must be a positive integer.");
      if (!Number.isInteger(i.codedHeight) || i.codedHeight <= 0)
        throw new TypeError("init.codedHeight must be a positive integer.");
      if (i.rotation !== void 0 && ![0, 90, 180, 270].includes(i.rotation))
        throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if (!Number.isFinite(i.timestamp))
        throw new TypeError("init.timestamp must be a number.");
      if (i.duration !== void 0 && (!Number.isFinite(i.duration) || i.duration < 0))
        throw new TypeError("init.duration, when provided, must be a non-negative number.");
      if (i.layout !== void 0) {
        if (!Array.isArray(i.layout))
          throw new TypeError("init.layout, when provided, must be an array.");
        for (const s of i.layout) {
          if (!s || typeof s != "object" || Array.isArray(s))
            throw new TypeError("Each entry in init.layout must be an object.");
          if (!Number.isInteger(s.offset) || s.offset < 0)
            throw new TypeError("plane.offset must be a non-negative integer.");
          if (!Number.isInteger(s.stride) || s.stride < 0)
            throw new TypeError("plane.stride must be a non-negative integer.");
        }
      }
      if (i.visibleRect !== void 0 && te(i.visibleRect, "init.visibleRect"), i.displayWidth !== void 0 && (!Number.isInteger(i.displayWidth) || i.displayWidth <= 0))
        throw new TypeError("init.displayWidth, when provided, must be a positive integer.");
      if (i.displayHeight !== void 0 && (!Number.isInteger(i.displayHeight) || i.displayHeight <= 0))
        throw new TypeError("init.displayHeight, when provided, must be a positive integer.");
      if (i.displayWidth !== void 0 != (i.displayHeight !== void 0))
        throw new TypeError("init.displayWidth and init.displayHeight must be either both provided or both omitted.");
      this.format = i.format, this.rotation = i.rotation ?? 0, this.timestamp = i.timestamp, this.duration = i.duration ?? 0;
      const r = i.layout ?? Bi(i.format, i.codedWidth, i.codedHeight);
      let n = i.colorSpace ?? null;
      n === null && (this.format === "RGBA" || this.format === "RGBX" || this.format === "BGRA" || this.format === "BGRX" ? n = {
        primaries: "bt709",
        transfer: "iec61966-2-1",
        matrix: "rgb",
        fullRange: !0
      } : n = {
        primaries: "bt709",
        transfer: "bt709",
        matrix: "bt709",
        fullRange: !1
      }), this.visibleRect = {
        left: i.visibleRect?.left ?? 0,
        top: i.visibleRect?.top ?? 0,
        width: i.visibleRect?.width ?? i.codedWidth,
        height: i.visibleRect?.height ?? i.codedHeight
      }, i.displayWidth !== void 0 ? (this.squarePixelWidth = this.rotation % 180 === 0 ? i.displayWidth : i.displayHeight, this.squarePixelHeight = this.rotation % 180 === 0 ? i.displayHeight : i.displayWidth) : (this.squarePixelWidth = this.visibleRect.width, this.squarePixelHeight = this.visibleRect.height), this._data = i._doNotCopy ? R(e) : R(e).slice(), this._layout = r, this.colorSpace = new ie(n);
    } else if (typeof VideoFrame < "u" && e instanceof VideoFrame) {
      if (i?.rotation !== void 0 && ![0, 90, 180, 270].includes(i.rotation))
        throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if (i?.timestamp !== void 0 && !Number.isFinite(i?.timestamp))
        throw new TypeError("init.timestamp, when provided, must be a number.");
      if (i?.duration !== void 0 && (!Number.isFinite(i.duration) || i.duration < 0))
        throw new TypeError("init.duration, when provided, must be a non-negative number.");
      i?.visibleRect !== void 0 && te(i.visibleRect, "init.visibleRect"), this._data = e, this._layout = null, this.format = e.format, this.visibleRect = {
        left: e.visibleRect?.x ?? 0,
        top: e.visibleRect?.y ?? 0,
        width: e.visibleRect?.width ?? e.codedWidth,
        height: e.visibleRect?.height ?? e.codedHeight
      }, this.rotation = i?.rotation ?? 0, this.squarePixelWidth = e.displayWidth, this.squarePixelHeight = e.displayHeight, this.timestamp = i?.timestamp ?? e.timestamp / 1e6, this.duration = i?.duration ?? (e.duration ?? 0) / 1e6, this.colorSpace = new ie(e.colorSpace);
    } else if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof SVGImageElement < "u" && e instanceof SVGImageElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap || typeof HTMLVideoElement < "u" && e instanceof HTMLVideoElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas) {
      if (!i || typeof i != "object")
        throw new TypeError("init must be an object.");
      if (i.rotation !== void 0 && ![0, 90, 180, 270].includes(i.rotation))
        throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if (!Number.isFinite(i.timestamp))
        throw new TypeError("init.timestamp must be a number.");
      if (i.duration !== void 0 && (!Number.isFinite(i.duration) || i.duration < 0))
        throw new TypeError("init.duration, when provided, must be a non-negative number.");
      if (i.visibleRect !== void 0 && te(i.visibleRect, "init.visibleRect"), typeof VideoFrame < "u")
        return new v(new VideoFrame(e, {
          timestamp: Math.trunc(i.timestamp * I),
          // Drag 0 to undefined
          duration: Math.trunc((i.duration ?? 0) * I) || void 0,
          // WebCodecs wants DOMRectInit
          visibleRect: i.visibleRect && {
            x: i.visibleRect.left,
            y: i.visibleRect.top,
            width: i.visibleRect.width,
            height: i.visibleRect.height
          }
        }), i);
      let r = 0, n = 0;
      if ("naturalWidth" in e ? (r = e.naturalWidth, n = e.naturalHeight) : "videoWidth" in e ? (r = e.videoWidth, n = e.videoHeight) : "width" in e && (r = Number(e.width), n = Number(e.height)), !r || !n)
        throw new TypeError("Could not determine dimensions.");
      const s = i.visibleRect ?? { left: 0, top: 0, width: r, height: n }, o = new OffscreenCanvas(s.width, s.height), a = o.getContext("2d", {
        alpha: ht(),
        // Firefox has VideoFrame glitches with opaque canvases
        willReadFrequently: !0
      });
      if (!a)
        throw new Error("OffscreenCanvas must have support for the '2d' context in order to create a VideoSample from this data.");
      a.drawImage(e, -s.left, -s.top), this._data = o, this._layout = null, this.format = "RGBX", this.visibleRect = { left: 0, top: 0, width: s.width, height: s.height }, this.squarePixelWidth = s.width, this.squarePixelHeight = s.height, this.rotation = i.rotation ?? 0, this.timestamp = i.timestamp, this.duration = i.duration ?? 0, this.colorSpace = new ie({
        matrix: "rgb",
        primaries: "bt709",
        transfer: "iec61966-2-1",
        fullRange: !0
      });
    } else if (e instanceof D) {
      if (!i || typeof i != "object")
        throw new TypeError("init must be an object.");
      if (i.rotation !== void 0 && ![0, 90, 180, 270].includes(i.rotation))
        throw new TypeError("init.rotation, when provided, must be 0, 90, 180, or 270.");
      if (!Number.isFinite(i.timestamp))
        throw new TypeError("init.timestamp must be a number.");
      if (i.duration !== void 0 && (!Number.isFinite(i.duration) || i.duration < 0))
        throw new TypeError("init.duration, when provided, must be a non-negative number.");
      if (this._data = e, e._referenceCount++, this.format = e.getFormat(), this.format !== null && !le.includes(this.format))
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
      this.rotation = i.rotation ?? 0, this.timestamp = i.timestamp, this.duration = i.duration ?? 0, this.colorSpace = e.getColorSpace();
    } else
      throw new TypeError("Invalid data type: Must be a BufferSource, CanvasImageSource, or VideoSampleResource.");
    this.encodeOptions = i?.encodeOptions ?? {}, this.pixelAspectRatio = ut({
      num: this.squarePixelWidth * this.codedHeight,
      den: this.squarePixelHeight * this.codedWidth
    }), ue?.register(this, { type: "video", data: this._data }, this);
  }
  /** Clones this video sample. */
  clone() {
    if (this._closed)
      throw new Error("VideoSample is closed.");
    return w(this._data !== null), this._data instanceof D ? new v(this._data, {
      timestamp: this.timestamp,
      duration: this.duration,
      rotation: this.rotation,
      encodeOptions: this.encodeOptions
    }) : M(this._data) ? new v(this._data.clone(), {
      timestamp: this.timestamp,
      duration: this.duration,
      rotation: this.rotation,
      encodeOptions: this.encodeOptions
    }) : this._data instanceof Uint8Array ? (w(this._layout), new v(this._data, {
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
    })) : new v(this._data, {
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
    this._closed || (ue?.unregister(this), this._data instanceof D ? (this._data._referenceCount--, this._data._referenceCount === 0 && this._data.close()) : M(this._data) ? this._data.close() : this._data = null, this._closed = !0);
  }
  /**
   * Returns the number of bytes required to hold this video sample's pixel data.
   */
  allocationSize(e = {}) {
    if (Qe(e), this._closed)
      throw new Error("VideoSample is closed.");
    if ((e.format ?? this.format) == null)
      throw new Error("Cannot get allocation size when format is null.");
    return M(this._data) ? this._data.allocationSize(e) : Xe(this, e).allocationSize;
  }
  /**
   * Copies this video sample's pixel data to an ArrayBuffer or ArrayBufferView.
   * @returns The byte layout of the planes of the copied data.
   */
  async copyTo(e, i = {}) {
    if (!ge(e))
      throw new TypeError("destination must be an ArrayBuffer or an ArrayBuffer view.");
    if (Qe(i), this._closed)
      throw new Error("VideoSample is closed.");
    if ((i.format ?? this.format) == null)
      throw new Error("Cannot copy video sample data when format is null.");
    if (w(this._data !== null), M(this._data))
      return this._data.copyTo(e, i);
    if (i.format && !["RGBA", "RGBX", "BGRA", "BGRX"].includes(this.format) && ["RGBA", "RGBX", "BGRA", "BGRX"].includes(i.format))
      if (this._data instanceof D) {
        const d = { stack: [], error: void 0, hasError: !1 };
        try {
          const h = Fi(d, await this._data.toRgbSample({
            timestamp: this.timestamp,
            duration: this.duration,
            rotation: this.rotation
          }, i.colorSpace ?? "srgb"), !1);
          if (!(h instanceof v))
            throw new TypeError("toRgbSample() must return a VideoSample.");
          if (!["RGBA", "RGBX", "BGRA", "BGRX"].includes(h.format))
            throw new Error(`Sample returned by toRgbSample was expected to have an RGB format, got '${h.format}' instead.`);
          return await h.copyTo(e, i);
        } catch (h) {
          d.error = h, d.hasError = !0;
        } finally {
          Wi(d);
        }
      } else {
        if (typeof VideoFrame > "u")
          throw new Error("For this sample, converting from a non-RGB to an RGB format requires VideoFrame to be defined.");
        const d = this.toVideoFrame(), h = await d.copyTo(e, i);
        return d.close(), h;
      }
    const r = Xe(this, i);
    w(this.format);
    const n = R(e);
    if (n.byteLength < r.allocationSize)
      throw new TypeError(`Destination buffer too small. Required: ${r.allocationSize}, Available: ${n.byteLength}`);
    const s = Y(this.format);
    let o;
    if (this._data instanceof D) {
      let d = this._data.getDataPlanes();
      if (d instanceof Promise && (d = await d), !Array.isArray(d) || d.some((h) => !(h.data instanceof Uint8Array) || !Number.isInteger(h.stride) || h.stride < 0))
        throw new TypeError('getDataPlanes() must return an array of objects with a Uint8Array "data" property and a non-negative integer "stride" property.');
      o = d;
    } else if (this._data instanceof Uint8Array)
      w(this._layout), w(this._layout.length === s.length), o = this._layout.map((d, h) => {
        const l = Math.ceil(this.codedHeight / s[h].heightDivisor);
        return {
          data: this._data.subarray(d.offset, d.offset + d.stride * l),
          stride: d.stride
        };
      });
    else {
      const h = this._data.getContext("2d");
      w(h);
      const l = h.getImageData(0, 0, this.codedWidth, this.codedHeight);
      o = [{
        data: R(l.data),
        stride: 4 * this.codedWidth
      }];
    }
    const a = [], c = s.length;
    for (let d = 0; d < c; d++) {
      const h = r.computedLayouts[d], l = o[d].stride, f = o[d].data;
      let m = h.sourceTop * l;
      m += h.sourceLeftBytes;
      let p = h.destinationOffset;
      const b = h.sourceWidthBytes, g = {
        offset: p,
        stride: h.destinationStride
      };
      for (let y = 0; y < h.sourceHeight; y++) {
        if (m + b > f.byteLength)
          throw new Error("Source buffer OOB read.");
        if (p + b > n.byteLength)
          throw new Error("Destination buffer OOB write.");
        const C = f.subarray(m, m + b);
        n.set(C, p), m += l, p += h.destinationStride;
      }
      a.push(g);
    }
    if (i.format !== void 0) {
      const d = this.format.startsWith("RGB") !== i.format.startsWith("RGB"), h = this.format.includes("X") && i.format.includes("A");
      if (d || h)
        for (let l = 0; l < r.allocationSize; l += 4) {
          if (d) {
            const f = n[l], m = n[l + 2];
            n[l] = m, n[l + 2] = f;
          }
          h && (n[l + 3] = 255);
        }
    }
    return a;
  }
  /**
   * Converts this video sample to a VideoFrame for use with the WebCodecs API. The VideoFrame returned by this
   * method *must* be closed separately from this video sample.
   */
  toVideoFrame() {
    if (this._closed)
      throw new Error("VideoSample is closed.");
    if (w(this._data !== null), this._data instanceof D) {
      if (this.format === null)
        throw new Error("Cannot convert a VideoSampleResource-backed VideoSample to VideoFrame if format is null.");
      const e = this._data.getDataPlanes();
      if (e instanceof Promise)
        throw new Error("Cannot convert a VideoSampleResource-backed VideoSample to VideoFrame if getDataPlanes() returns a promise.");
      const i = e.reduce((o, a) => o + a.data.byteLength, 0), r = new Uint8Array(i);
      let n = 0;
      const s = [];
      for (const o of e)
        r.set(o.data, n), s.push(n), n += o.data.byteLength;
      return new VideoFrame(r, {
        format: this.format,
        layout: e.map((o, a) => ({
          offset: s[a],
          stride: o.stride
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
    } else return M(this._data) ? new VideoFrame(this._data, {
      timestamp: this.microsecondTimestamp,
      duration: this.microsecondDuration || void 0
      // Drag 0 duration to undefined, glitches some codecs
    }) : this._data instanceof Uint8Array ? (w(this._layout), new VideoFrame(this._data, {
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
  draw(e, i, r, n, s, o, a, c, d) {
    let h = 0, l = 0, f = this.displayWidth, m = this.displayHeight, p = 0, b = 0, g = this.displayWidth, y = this.displayHeight;
    if (o !== void 0 ? (h = i, l = r, f = n, m = s, p = o, b = a, c !== void 0 ? (g = c, y = d) : (g = f, y = m)) : (p = i, b = r, n !== void 0 && (g = n, y = s)), !(typeof CanvasRenderingContext2D < "u" && e instanceof CanvasRenderingContext2D || typeof OffscreenCanvasRenderingContext2D < "u" && e instanceof OffscreenCanvasRenderingContext2D))
      throw new TypeError("context must be a CanvasRenderingContext2D or OffscreenCanvasRenderingContext2D.");
    if (!Number.isFinite(h))
      throw new TypeError("sx must be a number.");
    if (!Number.isFinite(l))
      throw new TypeError("sy must be a number.");
    if (!Number.isFinite(f) || f < 0)
      throw new TypeError("sWidth must be a non-negative number.");
    if (!Number.isFinite(m) || m < 0)
      throw new TypeError("sHeight must be a non-negative number.");
    if (!Number.isFinite(p))
      throw new TypeError("dx must be a number.");
    if (!Number.isFinite(b))
      throw new TypeError("dy must be a number.");
    if (!Number.isFinite(g) || g < 0)
      throw new TypeError("dWidth must be a non-negative number.");
    if (!Number.isFinite(y) || y < 0)
      throw new TypeError("dHeight must be a non-negative number.");
    if (this._closed)
      throw new Error("VideoSample is closed.");
    ({ sx: h, sy: l, sWidth: f, sHeight: m } = this._rotateSourceRegion(h, l, f, m, this.rotation));
    const C = this.toCanvasImageSource();
    e.save();
    const T = p + g / 2, _ = b + y / 2;
    e.translate(T, _), e.rotate(this.rotation * Math.PI / 180);
    const k = this.rotation % 180 === 0 ? 1 : g / y;
    e.scale(1 / k, k), e.drawImage(C, h, l, f, m, -g / 2, -y / 2, g, y), e.restore();
  }
  /**
   * Draws the sample in the middle of the canvas corresponding to the context with the specified fit behavior.
   */
  drawWithFit(e, i) {
    if (!(typeof CanvasRenderingContext2D < "u" && e instanceof CanvasRenderingContext2D || typeof OffscreenCanvasRenderingContext2D < "u" && e instanceof OffscreenCanvasRenderingContext2D))
      throw new TypeError("context must be a CanvasRenderingContext2D or OffscreenCanvasRenderingContext2D.");
    if (!i || typeof i != "object")
      throw new TypeError("options must be an object.");
    if (!["fill", "contain", "cover"].includes(i.fit))
      throw new TypeError("options.fit must be 'fill', 'contain', or 'cover'.");
    if (i.rotation !== void 0 && ![0, 90, 180, 270].includes(i.rotation))
      throw new TypeError("options.rotation, when provided, must be 0, 90, 180, or 270.");
    i.crop !== void 0 && fe(i.crop, "options.");
    const r = e.canvas.width, n = e.canvas.height, s = i.rotation ?? this.rotation, [o, a] = s % 180 === 0 ? [this.squarePixelWidth, this.squarePixelHeight] : [this.squarePixelHeight, this.squarePixelWidth];
    let c = i.crop;
    c && (c = Ge(c, o, a));
    let d, h, l, f;
    const { sx: m, sy: p, sWidth: b, sHeight: g } = this._rotateSourceRegion(i.crop?.left ?? 0, i.crop?.top ?? 0, i.crop?.width ?? o, i.crop?.height ?? a, s);
    if (i.fit === "fill")
      d = 0, h = 0, l = r, f = n;
    else {
      const [C, T] = i.crop ? [i.crop.width, i.crop.height] : [o, a], _ = i.fit === "contain" ? Math.min(r / C, n / T) : Math.max(r / C, n / T);
      l = C * _, f = T * _, d = (r - l) / 2, h = (n - f) / 2;
    }
    e.save();
    const y = s % 180 === 0 ? 1 : l / f;
    e.translate(r / 2, n / 2), e.rotate(s * Math.PI / 180), e.scale(1 / y, y), e.translate(-r / 2, -n / 2), e.drawImage(this.toCanvasImageSource(), m, p, b, g, d, h, l, f), e.restore();
  }
  /** @internal */
  _rotateSourceRegion(e, i, r, n, s) {
    return s === 90 ? [e, i, r, n] = [
      i,
      this.squarePixelHeight - e - r,
      n,
      r
    ] : s === 180 ? [e, i] = [
      this.squarePixelWidth - e - r,
      this.squarePixelHeight - i - n
    ] : s === 270 && ([e, i, r, n] = [
      this.squarePixelWidth - i - n,
      e,
      n,
      r
    ]), { sx: e, sy: i, sWidth: r, sHeight: n };
  }
  /**
   * Draws the sample onto the target canvas with fit behavior, manually mipmapping on strong downscales for quality.
   * @internal
   */
  _drawWithFitAndMipmapping(e, i, r) {
    const n = e.width, s = e.height, [o, a] = r.rotation % 180 === 0 ? [this.squarePixelWidth, this.squarePixelHeight] : [this.squarePixelHeight, this.squarePixelWidth], c = r.crop ? r.crop.width : o, d = r.crop ? r.crop.height : a;
    let h = 0;
    2 * n < c && 2 * s < d && (h = Math.floor(Math.log2(Math.min(c / n, d / s))));
    const l = n * 2 ** h, f = s * 2 ** h, { canvas: m, context: p, isNew: b } = h > 0 ? $e(l, f) : { canvas: e, context: i, isNew: r.targetIsFresh };
    p.imageSmoothingQuality = "high", r.fillBlack ? (p.fillStyle = "black", p.fillRect(0, 0, l, f)) : b || p.clearRect(0, 0, l, f), this.drawWithFit(p, {
      fit: r.fit,
      rotation: r.rotation,
      crop: r.crop
    }), p.globalCompositeOperation = "copy";
    for (let g = h; g > 1; g--) {
      const y = n * 2 ** g, C = s * 2 ** g;
      p.drawImage(m, 0, 0, y, C, 0, 0, y / 2, C / 2);
    }
    p.globalCompositeOperation = "source-over", h > 0 && (i.imageSmoothingQuality = "high", i.globalCompositeOperation = "copy", i.drawImage(m, 0, 0, 2 * n, 2 * s, 0, 0, n, s), i.globalCompositeOperation = "source-over");
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
    if (w(this._data !== null), this._data instanceof D || this._data instanceof Uint8Array) {
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
    if (e.crop !== void 0 && fe(e.crop, "options."), e.alpha !== void 0 && !["keep", "discard"].includes(e.alpha))
      throw new TypeError("options.alpha, when provided, must be 'keep' or 'discard'.");
    const i = ot(this.rotation + (e.rotate ?? 0)), [r, n] = i % 180 === 0 ? [this.squarePixelWidth, this.squarePixelHeight] : [this.squarePixelHeight, this.squarePixelWidth];
    let s = e.crop;
    s && (s = Ge(s, r, n));
    const o = s ? s.width : r, a = s ? s.height : n, c = o / a;
    let d, h;
    e.width !== void 0 && e.height === void 0 ? (d = e.width, h = d / c) : e.width === void 0 && e.height !== void 0 ? (h = e.height, d = h * c) : e.width !== void 0 && e.height !== void 0 ? (d = e.width, h = e.height) : (d = o, h = a), d = xe(d, e.roundDimensionsTo ?? 1), h = xe(h, e.roundDimensionsTo ?? 1);
    const l = {
      width: d,
      height: h,
      fit: e.fit ?? "fill",
      rotation: i,
      crop: s ?? {
        left: 0,
        top: 0,
        width: r,
        height: n
      },
      alpha: e.alpha ?? "keep"
    };
    for (const b of Ii) {
      let g = b(this, l);
      if (g instanceof Promise && (g = await g), g !== null)
        return g;
    }
    const { canvas: f, context: m, isNew: p } = $e(l.width, l.height);
    return this._drawWithFitAndMipmapping(f, m, {
      fit: l.fit,
      rotation: l.rotation,
      crop: l.crop,
      targetIsFresh: p,
      fillBlack: l.alpha === "discard"
    }), new v(f, {
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
const Ii = [], Oi = 3, H = [];
let je = 0;
const $e = (t, e) => {
  for (const n of H)
    if (n.canvas.width === t && n.canvas.height === e)
      return n.age = je++, { canvas: n.canvas, context: n.context, isNew: !1 };
  let i;
  if (typeof OffscreenCanvas < "u")
    i = new OffscreenCanvas(t, e);
  else {
    if (typeof window > "u" || typeof document > "u")
      throw new Error("Cannot transform VideoSamples in this environment. Either run in an environment with OffscreenCanvas or HTMLCanvasElement, or supply a custom VideoSample transformer using registerVideoSampleTransformer().");
    i = document.createElement("canvas"), i.width = t, i.height = e;
  }
  const r = i.getContext("2d", {
    alpha: !0,
    willReadFrequently: !1
  });
  if (!r)
    throw new Error("The '2d' canvas context is required to transform VideoSamples. Register a custom transformer using registerVideoSampleTransformer to work around this limitation.");
  return H.length >= Oi && H.splice(Zt(H, (n) => n.age), 1), H.push({
    canvas: i,
    context: r,
    age: je++
  }), { canvas: i, context: r, isNew: !0 };
};
class ie {
  /** Creates a new VideoSampleColorSpace. */
  constructor(e) {
    if (e !== void 0) {
      if (!e || typeof e != "object")
        throw new TypeError("init.colorSpace, when provided, must be an object.");
      const i = Object.keys(me);
      if (e.primaries != null && !i.includes(e.primaries))
        throw new TypeError(`init.colorSpace.primaries, when provided, must be one of ${i.join(", ")}.`);
      const r = Object.keys(pe);
      if (e.transfer != null && !r.includes(e.transfer))
        throw new TypeError(`init.colorSpace.transfer, when provided, must be one of ${r.join(", ")}.`);
      const n = Object.keys(we);
      if (e.matrix != null && !n.includes(e.matrix))
        throw new TypeError(`init.colorSpace.matrix, when provided, must be one of ${n.join(", ")}.`);
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
const M = (t) => typeof VideoFrame < "u" && t instanceof VideoFrame, Ge = (t, e, i) => {
  const r = Math.min(t.left, e), n = Math.min(t.top, i), s = Math.min(t.width, e - r), o = Math.min(t.height, i - n);
  return w(s >= 0), w(o >= 0), { left: r, top: n, width: s, height: o };
}, fe = (t, e) => {
  if (!t || typeof t != "object")
    throw new TypeError(e + "crop, when provided, must be an object.");
  if (!Number.isInteger(t.left) || t.left < 0)
    throw new TypeError(e + "crop.left must be a non-negative integer.");
  if (!Number.isInteger(t.top) || t.top < 0)
    throw new TypeError(e + "crop.top must be a non-negative integer.");
  if (!Number.isInteger(t.width) || t.width < 0)
    throw new TypeError(e + "crop.width must be a non-negative integer.");
  if (!Number.isInteger(t.height) || t.height < 0)
    throw new TypeError(e + "crop.height must be a non-negative integer.");
}, Qe = (t) => {
  if (!t || typeof t != "object")
    throw new TypeError("options must be an object.");
  if (t.colorSpace !== void 0 && !["display-p3", "srgb"].includes(t.colorSpace))
    throw new TypeError("options.colorSpace, when provided, must be 'display-p3' or 'srgb'.");
  if (t.format !== void 0 && typeof t.format != "string")
    throw new TypeError("options.format, when provided, must be a string.");
  if (t.layout !== void 0) {
    if (!Array.isArray(t.layout))
      throw new TypeError("options.layout, when provided, must be an array.");
    for (const e of t.layout) {
      if (!e || typeof e != "object")
        throw new TypeError("Each entry in options.layout must be an object.");
      if (!Number.isInteger(e.offset) || e.offset < 0)
        throw new TypeError("plane.offset must be a non-negative integer.");
      if (!Number.isInteger(e.stride) || e.stride < 0)
        throw new TypeError("plane.stride must be a non-negative integer.");
    }
  }
  if (t.rect !== void 0) {
    if (!t.rect || typeof t.rect != "object")
      throw new TypeError("options.rect, when provided, must be an object.");
    if (t.rect.x !== void 0 && (!Number.isInteger(t.rect.x) || t.rect.x < 0))
      throw new TypeError("options.rect.x, when provided, must be a non-negative integer.");
    if (t.rect.y !== void 0 && (!Number.isInteger(t.rect.y) || t.rect.y < 0))
      throw new TypeError("options.rect.y, when provided, must be a non-negative integer.");
    if (t.rect.width !== void 0 && (!Number.isInteger(t.rect.width) || t.rect.width < 0))
      throw new TypeError("options.rect.width, when provided, must be a non-negative integer.");
    if (t.rect.height !== void 0 && (!Number.isInteger(t.rect.height) || t.rect.height < 0))
      throw new TypeError("options.rect.height, when provided, must be a non-negative integer.");
  }
}, Bi = (t, e, i) => {
  const r = Y(t), n = [];
  let s = 0;
  for (const o of r) {
    const a = Math.ceil(e / o.widthDivisor), c = Math.ceil(i / o.heightDivisor), d = a * o.sampleBytes, h = d * c;
    n.push({
      offset: s,
      stride: d
    }), s += h;
  }
  return n;
}, Y = (t) => {
  const e = (i, r, n, s, o) => {
    const a = [
      { sampleBytes: i, widthDivisor: 1, heightDivisor: 1 },
      { sampleBytes: r, widthDivisor: n, heightDivisor: s },
      { sampleBytes: r, widthDivisor: n, heightDivisor: s }
    ];
    return o && a.push({ sampleBytes: i, widthDivisor: 1, heightDivisor: 1 }), a;
  };
  switch (t) {
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
      G(t), w(!1);
  }
}, Xe = (t, e) => {
  const i = {
    left: 0,
    top: 0,
    width: t.codedWidth,
    height: t.codedHeight
  }, r = e.rect, n = Hi(i, r, t.codedWidth, t.codedHeight, t.format), s = e.layout;
  let o;
  if (!e.format || e.format === t.format)
    o = t.format;
  else if (["RGBA", "RGBX", "BGRA", "BGRX"].includes(e.format))
    o = e.format;
  else
    throw new Error("NotSupportedError: Invalid destination format.");
  return Ni(n, o, s);
}, Hi = (t, e, i, r, n) => {
  const s = { ...t };
  if (e !== void 0) {
    if (e.width === 0 || e.height === 0)
      throw new TypeError("visibleRect dimensions cannot be zero.");
    if ((e.x || 0) + (e.width || 0) > i)
      throw new TypeError("visibleRect exceeds codedWidth.");
    if ((e.y || 0) + (e.height || 0) > r)
      throw new TypeError("visibleRect exceeds codedHeight.");
    s.x = e.x || 0, s.y = e.y || 0, s.width = e.width || 0, s.height = e.height || 0;
  }
  if (!Mi(n, s))
    throw new TypeError("visibleRect alignment is invalid for the format.");
  return s;
}, Mi = (t, e) => {
  if (t === null)
    return !0;
  const i = Y(t);
  for (let r = 0; r < i.length; r++) {
    const n = i[r], s = n.widthDivisor, o = n.heightDivisor;
    if ((e.x || 0) % s !== 0 || (e.y || 0) % o !== 0)
      return !1;
  }
  return !0;
}, Ni = (t, e, i) => {
  const r = Y(e), n = r.length;
  if (i !== void 0 && i.length !== n)
    throw new TypeError(`Layout must have ${n} planes.`);
  let s = 0;
  const o = [], a = [];
  for (let c = 0; c < n; c++) {
    const d = r[c], h = d.sampleBytes, l = d.widthDivisor, f = d.heightDivisor, m = {
      destinationOffset: 0,
      destinationStride: 0,
      sourceTop: 0,
      sourceHeight: 0,
      sourceLeftBytes: 0,
      sourceWidthBytes: 0
    };
    if (m.sourceTop = Math.ceil(Math.trunc(t.y || 0) / f), m.sourceHeight = Math.ceil(Math.trunc(t.height || 0) / f), m.sourceLeftBytes = Math.floor(Math.trunc(t.x || 0) / l) * h, m.sourceWidthBytes = Math.floor(Math.trunc(t.width || 0) / l) * h, i !== void 0) {
      const g = i[c];
      if (g.stride < m.sourceWidthBytes)
        throw new TypeError(`Stride for plane ${c} is too small.`);
      m.destinationOffset = g.offset, m.destinationStride = g.stride;
    } else
      m.destinationOffset = s, m.destinationStride = m.sourceWidthBytes;
    const b = m.destinationStride * m.sourceHeight + m.destinationOffset;
    if (b > 4294967295)
      throw new TypeError("Allocation size exceeds limit.");
    a.push(b), s = Math.max(s, b);
    for (let g = 0; g < c; g++) {
      const y = o[g];
      if (!(a[c] <= y.destinationOffset || a[g] <= m.destinationOffset))
        throw new TypeError("Planes overlap.");
    }
    o.push(m);
  }
  return {
    allocationSize: s,
    computedLayouts: o
  };
};
const Ke = /* @__PURE__ */ new Map(), qi = (t) => {
  if (!t || typeof t != "object")
    throw new TypeError("Encoding config must be an object.");
  if (!V.includes(t.codec))
    throw new TypeError(`Invalid video codec '${t.codec}'. Must be one of: ${V.join(", ")}.`);
  const e = t.bitrate;
  if (t.quality === void 0 && e === void 0)
    throw new TypeError("config.quality must be provided.");
  if (t.quality !== void 0 && e !== void 0)
    throw new TypeError("config.quality and config.bitrate cannot both be provided.");
  if (t.quality !== void 0 && !(t.quality instanceof F))
    throw new TypeError("config.quality, when provided, must be a Quality.");
  if (e !== void 0 && !(e instanceof F) && (!Number.isInteger(e) || e <= 0))
    throw new TypeError("config.bitrate, when provided, must be a positive integer or a quality.");
  if (t.keyFrameInterval !== void 0 && (!Number.isFinite(t.keyFrameInterval) || t.keyFrameInterval < 0))
    throw new TypeError("config.keyFrameInterval, when provided, must be a non-negative number.");
  if (t.sizeChangeBehavior !== void 0 && !["deny", "passThrough", "fill", "contain", "cover"].includes(t.sizeChangeBehavior))
    throw new TypeError("config.sizeChangeBehavior, when provided, must be 'deny', 'passThrough', 'fill', 'contain' or 'cover'.");
  if (t.transform !== void 0) {
    if (typeof t.transform != "object" || !t.transform)
      throw new TypeError("config.transform, when provided, must be an object.");
    if (t.transform.width !== void 0 && (!Number.isInteger(t.transform.width) || t.transform.width <= 0))
      throw new TypeError("config.transform.width, when provided, must be a positive integer.");
    if (t.transform.height !== void 0 && (!Number.isInteger(t.transform.height) || t.transform.height <= 0))
      throw new TypeError("config.transform.height, when provided, must be a positive integer.");
    if (t.transform.fit !== void 0 && !["fill", "contain", "cover"].includes(t.transform.fit))
      throw new TypeError('config.transform.fit, when provided, must be one of "fill", "contain", or "cover".');
    if (t.transform.width !== void 0 && t.transform.height !== void 0 && t.transform.fit === void 0 && !["fill", "contain", "cover"].includes(t.sizeChangeBehavior))
      throw new TypeError("When both config.transform.width and config.transform.height are provided, config.transform.fit must also be provided.");
    if (t.transform.fit !== void 0 && ["fill", "contain", "cover"].includes(t.sizeChangeBehavior) && t.transform.fit !== t.sizeChangeBehavior)
      throw new TypeError("config.transform.fit, when provided, cannot differ from config.sizeChangeBehavior when config.sizeChangeBehavior is 'fill', 'contain' or 'cover', as sizeChangeBehavior already determines the fitting algorithm.");
    if (t.transform.rotate !== void 0 && ![0, 90, 180, 270].includes(t.transform.rotate))
      throw new TypeError("config.transform.rotate, when provided, must be 0, 90, 180 or 270.");
    if (t.transform.crop !== void 0 && fe(t.transform.crop, "config.transform."), t.transform.process !== void 0 && typeof t.transform.process != "function")
      throw new TypeError("config.transform.process, when provided, must be a function.");
    if (t.transform.frameRate !== void 0 && (!Number.isFinite(t.transform.frameRate) || t.transform.frameRate <= 0))
      throw new TypeError("config.transform.frameRate, when provided, must be a finite positive number.");
    if (t.transform.force !== void 0 && typeof t.transform.force != "boolean")
      throw new TypeError("config.transform.force, when provided, must be a boolean.");
  }
  if (t.onEncodedPacket !== void 0 && typeof t.onEncodedPacket != "function")
    throw new TypeError("config.onEncodedPacket, when provided, must be a function.");
  if (t.onEncoderConfig !== void 0 && typeof t.onEncoderConfig != "function")
    throw new TypeError("config.onEncoderConfig, when provided, must be a function.");
  if (t.onEncodedSample !== void 0 && typeof t.onEncodedSample != "function")
    throw new TypeError("config.onEncodedSample, when provided, must be a function.");
  Et(t.codec, t);
}, Et = (t, e) => {
  if (!e || typeof e != "object")
    throw new TypeError("Encoding options must be an object.");
  if (e.alpha !== void 0 && !["discard", "keep"].includes(e.alpha))
    throw new TypeError("options.alpha, when provided, must be 'discard' or 'keep'.");
  const i = e.bitrateMode;
  if (i !== void 0 && !["constant", "variable"].includes(i))
    throw new TypeError("bitrateMode, when provided, must be 'constant' or 'variable'.");
  if (e.latencyMode !== void 0 && !["quality", "realtime"].includes(e.latencyMode))
    throw new TypeError("latencyMode, when provided, must be 'quality' or 'realtime'.");
  if (e.fullCodecString !== void 0 && typeof e.fullCodecString != "string")
    throw new TypeError("fullCodecString, when provided, must be a string.");
  if (e.fullCodecString !== void 0 && be(e.fullCodecString) !== t)
    throw new TypeError(`fullCodecString, when provided, must be a string that matches the specified codec (${t}).`);
  if (e.hardwareAcceleration !== void 0 && !["no-preference", "prefer-hardware", "prefer-software"].includes(e.hardwareAcceleration))
    throw new TypeError("hardwareAcceleration, when provided, must be 'no-preference', 'prefer-hardware' or 'prefer-software'.");
  if (e.scalabilityMode !== void 0 && typeof e.scalabilityMode != "string")
    throw new TypeError("scalabilityMode, when provided, must be a string.");
  if (e.contentHint !== void 0 && typeof e.contentHint != "string")
    throw new TypeError("contentHint, when provided, must be a string.");
}, vt = (t) => {
  const e = t.bitrateMode, i = t.quality._toVideoRateControl(t.codec, t.width, t.height, e), r = (s, o, a) => ({
    codec: t.fullCodecString ?? oi(t.codec, t.width, t.height, a, t.alpha === "keep"),
    width: t.width,
    height: t.height,
    displayWidth: t.squarePixelWidth,
    displayHeight: t.squarePixelHeight,
    bitrate: s,
    bitrateMode: o,
    alpha: t.alpha ?? "discard",
    framerate: t.framerate,
    latencyMode: t.latencyMode,
    hardwareAcceleration: t.hardwareAcceleration,
    scalabilityMode: t.scalabilityMode,
    contentHint: t.contentHint,
    ...ui(t.codec)
  }), n = [];
  return i.quantizer !== null && n.push({
    config: r(void 0, "quantizer", i.bitrate),
    quantizer: i.quantizer
  }), i.bitrateMode !== "quantizer" && n.push({
    config: r(i.bitrate, i.bitrateMode, i.bitrate),
    quantizer: null
  }), w(n.length > 0), n;
};
class F {
  constructor(e) {
    if ((typeof e == "number" || typeof e == "string") && (e = { quality: e }), !e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (e.bitrateMode !== void 0 && !["constant", "variable"].includes(e.bitrateMode))
      throw new TypeError("options.bitrateMode, when provided, must be 'constant' or 'variable'.");
    if ("quality" in e) {
      if (typeof e.quality == "string" ? !(e.quality in Le) : typeof e.quality != "number" || Number.isNaN(e.quality))
        throw new TypeError("options.quality must be a number, or one of 'very-low', 'low', 'medium', 'high' or 'very-high'.");
      if (e.preferBitrate !== void 0 && typeof e.preferBitrate != "boolean")
        throw new TypeError("options.preferBitrate, when provided, must be a boolean.");
      if ("bitrate" in e || "quantizer" in e)
        throw new TypeError("options.quality cannot be combined with options.bitrate or options.quantizer.");
      this._quality = typeof e.quality == "string" ? Le[e.quality] : e.quality, this._preferBitrate = e.preferBitrate ?? !1, this._bitrate = void 0, this._quantizer = void 0;
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
  _toVideoRateControl(e, i, r, n) {
    const s = Ui[e];
    let o = null, a = this._bitrateMode ?? n ?? "variable";
    if (this._quantizer !== void 0) {
      if (s)
        if (this._quantizer < s.min || this._quantizer > s.max) {
          if (this._bitrate === void 0)
            throw new Error(`Quantizer ${this._quantizer} is out of range for codec '${e}'; must be between ${s.min} and ${s.max}.`);
        } else
          o = this._quantizer, this._bitrate === void 0 && (a = "quantizer");
      else if (this._bitrate === void 0)
        throw new Error(`Codec '${e}' does not support quantizer-based encoding. Provide a bitrate in the Quality to define a fallback.`);
    } else this._bitrate === void 0 && s && !this._preferBitrate && (w(this._quality !== void 0), o = Se(Math.round(Nt(s.worst, s.best, this._quality)), s.min, s.max));
    let c;
    if (this._bitrate !== void 0)
      c = this._bitrate;
    else {
      let d = this._quality;
      d === void 0 && (w(o !== null && s), d = Se((o - s.worst) / (s.best - s.worst), 0, 1)), c = Ye(e, i, r, re(d));
    }
    return { quantizer: o, bitrate: c, bitrateMode: a };
  }
  /** @internal */
  _toVideoBitrate(e, i, r) {
    return this._bitrate !== void 0 ? this._bitrate : (w(this._quality !== void 0), Ye(e, i, r, re(this._quality)));
  }
  /** @internal */
  _toAudioBitrate(e) {
    if (W.includes(e) || e === "flac")
      return;
    if (this._bitrate !== void 0)
      return this._bitrate;
    if (this._quality === void 0)
      throw new Error("This Quality defines neither a quality level nor a bitrate and therefore cannot be used for audio encoding.");
    const i = re(this._quality), n = {
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
    if (!n)
      throw new Error(`Unhandled codec: ${e}`);
    let s = n * i;
    return e === "aac" ? s = [96e3, 128e3, 16e4, 192e3].reduce((a, c) => Math.abs(c - s) < Math.abs(a - s) ? c : a) : e === "opus" || e === "vorbis" ? s = Math.max(6e3, s) : e === "mp3" && (s = [
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
    ].reduce((a, c) => Math.abs(c - s) < Math.abs(a - s) ? c : a)), Math.round(s / 1e3) * 1e3;
  }
}
const Le = {
  "very-low": 0,
  low: 0.25,
  medium: 0.5,
  high: 0.75,
  "very-high": 1
}, Ui = {
  avc: { min: 0, max: 51, worst: 41, best: 16 },
  hevc: { min: 0, max: 51, worst: 41, best: 16 },
  vp9: { min: 0, max: 63, worst: 52, best: 20 },
  av1: { min: 0, max: 255, worst: 208, best: 80 }
}, re = (t) => 0.3 * Math.exp(2.5538 * t), Ye = (t, e, i, r) => {
  const n = e * i, s = 1920 * 1080, o = 3e6, a = Math.pow(n / s, 0.95), c = o * a, d = {
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
    prores: 22e7 / o
    // Apple ProRes white paper claims 220 Mbps for 1080p 422 HQ @30Hz
  }, l = c * d[t] * r;
  return Math.ceil(l / 1e3) * 1e3;
}, _t = (t, e) => {
  if (t === "avc")
    return { avc: { quantizer: e } };
  if (t === "hevc")
    return { hevc: { quantizer: e } };
  if (t === "vp9")
    return { vp9: { quantizer: e } };
  if (t === "av1")
    return { av1: { quantizer: e } };
  w(!1);
}, fr = async (t, e = {}) => {
  const {
    width: i = 1280,
    height: r = 720,
    quality: n,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    bitrate: s,
    ...o
  } = e;
  if (!V.includes(t))
    return !1;
  if (!Number.isInteger(i) || i <= 0)
    throw new TypeError("width must be a positive integer.");
  if (!Number.isInteger(r) || r <= 0)
    throw new TypeError("height must be a positive integer.");
  if (n !== void 0 && !(n instanceof F))
    throw new TypeError("quality, when provided, must be a Quality.");
  if (n !== void 0 && s !== void 0)
    throw new TypeError("quality and bitrate cannot both be provided.");
  if (s !== void 0 && !(s instanceof F) && (!Number.isInteger(s) || s <= 0))
    throw new TypeError("bitrate must be a positive integer or a quality.");
  Et(t, o);
  const a = kt(n, s) ?? new F({ bitrate: 1e6 });
  let c;
  try {
    c = vt({
      codec: t,
      width: i,
      height: r,
      quality: a,
      framerate: void 0,
      ...o,
      alpha: "discard"
      // Since we handle alpha ourselves
    });
  } catch {
    return !1;
  }
  const d = JSON.stringify(c), h = Ke.get(d);
  if (h)
    return h;
  const l = (async () => {
    for (const { config: m } of c)
      if (St.some((p) => p.supports(t, m)))
        return !0;
    if (typeof VideoEncoder > "u" || (i % 2 === 1 || r % 2 === 1) && (t === "avc" || t === "hevc"))
      return !1;
    for (const { config: m, quantizer: p } of c) {
      try {
        if (!(await VideoEncoder.isConfigSupported(m)).supported)
          continue;
      } catch {
        continue;
      }
      if (!ht() || await new Promise(async (g) => {
        try {
          const y = new VideoEncoder({
            output: () => {
            },
            error: () => g(!1)
          });
          y.configure(m);
          const C = new Uint8Array(i * r * 4), T = new VideoFrame(C, {
            format: "RGBA",
            codedWidth: i,
            codedHeight: r,
            timestamp: 0
          });
          y.encode(T, p !== null ? _t(t, p) : void 0), T.close(), await y.flush(), g(!0);
        } catch {
          g(!1);
        }
      }))
        return !0;
    }
    return !1;
  })();
  return Ke.set(d, l), l;
}, kt = (t, e) => {
  if (t !== void 0)
    return t;
  if (e !== void 0)
    return e instanceof F ? e : new F({ bitrate: e });
};
const St = [];
class j {
  constructor(e, i, r, n, s) {
    this.bytes = e, this.view = i, this.offset = r, this.start = n, this.end = s, this.bufferPos = n - r;
  }
  static tempFromBytes(e) {
    return new j(e, at(e), 0, 0, e.length);
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
  slice(e, i = this.end - e) {
    if (e < this.start || e + i > this.end)
      throw new RangeError("Slicing outside of original slice.");
    return new j(this.bytes, this.view, this.offset, e, e + i);
  }
}
const ji = (t, e) => {
  if (t.filePos < t.start || t.filePos + e > t.end)
    throw new RangeError(`Tried reading [${t.filePos}, ${t.filePos + e}), but slice is [${t.start}, ${t.end}). This is likely an internal error, please report it alongside the file that caused it.`);
}, $i = (t, e) => {
  ji(t, e);
  const i = t.bytes.subarray(t.bufferPos, t.bufferPos + e);
  return t.bufferPos += e, i;
};
class Gi {
  constructor(e) {
    this.mutex = new ct(), this.trackTimestampInfo = /* @__PURE__ */ new WeakMap(), this.output = e;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onTrackClose(e) {
  }
  validateTimestamp(e, i, r) {
    if (i < 0)
      throw new Error(`Timestamps must be non-negative (got ${i}s).`);
    let n = this.trackTimestampInfo.get(e);
    if (n) {
      if (r && (n.maxTimestampBeforeLastKeyPacket = n.maxTimestamp), n.maxTimestampBeforeLastKeyPacket !== null && i < n.maxTimestampBeforeLastKeyPacket)
        throw new Error(`Timestamps cannot be smaller than the largest timestamp of the previous GOP (a GOP begins with a key packet and ends right before the next key packet). Got ${i}s, but largest timestamp is ${n.maxTimestampBeforeLastKeyPacket}s.`);
      n.maxTimestamp = Math.max(n.maxTimestamp, i);
    } else {
      if (!r)
        throw new Error("First packet must be a key packet.");
      n = {
        maxTimestamp: i,
        maxTimestampBeforeLastKeyPacket: null
      }, this.trackTimestampInfo.set(e, n);
    }
  }
}
const Ze = /<(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})>/g, Qi = /(?:(\d{2}):)?(\d{2}):(\d{2}).(\d{3})/, Xi = (t) => {
  const e = Qi.exec(t);
  if (!e)
    throw new Error("Expected match.");
  return 3600 * 1e3 * Number(e[1] || "0") + 60 * 1e3 * Number(e[2]) + 1e3 * Number(e[3]) + Number(e[4]);
}, Ki = (t) => {
  const e = Math.floor(t / 36e5), i = Math.floor(t % (3600 * 1e3) / (60 * 1e3)), r = Math.floor(t % (60 * 1e3) / 1e3), n = t % 1e3;
  return e.toString().padStart(2, "0") + ":" + i.toString().padStart(2, "0") + ":" + r.toString().padStart(2, "0") + "." + n.toString().padStart(3, "0");
};
class Li {
  constructor(e, i) {
    if (this.finalized = !1, this.started = !1, this.pos = 0, this.trackedWrites = null, this.trackedStart = -1, this.trackedEnd = -1, e._writerAcquired)
      throw new Error("Can't have multiple Writers for the same Target.");
    this.target = e, e._setMonotonicity(i), e._writerAcquired = !0;
  }
  start() {
    w(!this.started), this.target._start(), this.started = !0;
  }
  /** Writes the given data to the target, at the current position. */
  write(e) {
    w(this.started && !this.finalized), this.maybeTrackWrites(e), this.target._write(e, this.pos), this.pos += e.byteLength;
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
    return w(this.started && !this.finalized), this.target._flush();
  }
  /** Called after muxing has finished. */
  async finalize() {
    w(this.started && !this.finalized), await this.target._finalize(), this.finalized = !0;
  }
  maybeTrackWrites(e) {
    if (!this.trackedWrites)
      return;
    let i = this.getPos();
    if (i < this.trackedStart) {
      if (i + e.byteLength <= this.trackedStart)
        return;
      e = e.subarray(this.trackedStart - i), i = 0;
    }
    const r = i + e.byteLength - this.trackedStart;
    let n = this.trackedWrites.byteLength;
    for (; n < r; )
      n *= 2;
    if (n !== this.trackedWrites.byteLength) {
      const s = new Uint8Array(n);
      s.set(this.trackedWrites, 0), this.trackedWrites = s;
    }
    this.trackedWrites.set(e, i - this.trackedStart), this.trackedEnd = Math.max(this.trackedEnd, i + e.byteLength);
  }
  startTrackingWrites() {
    this.trackedWrites = new Uint8Array(2 ** 10), this.trackedStart = this.getPos(), this.trackedEnd = this.trackedStart;
  }
  stopTrackingWrites() {
    if (!this.trackedWrites)
      throw new Error("Internal error: Can't get tracked writes since nothing was tracked.");
    const i = {
      data: this.trackedWrites.subarray(0, this.trackedEnd - this.trackedStart),
      start: this.trackedStart,
      end: this.trackedEnd
    };
    return this.trackedWrites = null, i;
  }
}
class P extends ye {
  constructor() {
    super(...arguments), this._writerAcquired = !1, this._monotonicity = null, this.onwrite = null;
  }
  /** @internal */
  _setMonotonicity(e) {
    this._monotonicity !== !1 && (this._monotonicity = e);
  }
  /** @internal */
  _dispatchWrite(e, i) {
    this.onwrite?.(e, i), this._emit("write", { start: e, end: i });
  }
  /**
   * Returns a new {@link RangedTarget} that writes data to this target using the given offset.
   *
   * Useful for writing a file into a section of a larger file.
   */
  slice(e) {
    if (!Number.isInteger(e) || e < 0)
      throw new TypeError("offset must be a non-negative integer.");
    return new Yi(this, e);
  }
}
const ne = 2 ** 16, se = 2 ** 32;
class mr extends P {
  /** Creates a new {@link BufferTarget}. The buffer holding the data will be created and managed internally. */
  constructor(e = {}) {
    if (super(), this.buffer = null, this._maxPos = 0, !e || typeof e != "object")
      throw new TypeError("BufferTarget options, when provided, must be an object.");
    if (e.onFinalize !== void 0 && typeof e.onFinalize != "function")
      throw new TypeError("options.onFinalize, when provided, must be a function.");
    if (this._options = e, this._supportsResize = "resize" in new ArrayBuffer(0), this._supportsResize)
      try {
        this._buffer = new ArrayBuffer(ne, { maxByteLength: se });
      } catch {
        this._buffer = new ArrayBuffer(ne), this._supportsResize = !1;
      }
    else
      this._buffer = new ArrayBuffer(ne);
    this._bytes = new Uint8Array(this._buffer);
  }
  /** @internal */
  _ensureSize(e) {
    let i = this._buffer.byteLength;
    for (; i < e; )
      i *= 2;
    if (i !== this._buffer.byteLength) {
      if (i > se)
        throw new Error(`ArrayBuffer exceeded maximum size of ${se} bytes. Please consider using another target.`);
      if (this._supportsResize)
        this._buffer.resize(i);
      else {
        const r = new ArrayBuffer(i), n = new Uint8Array(r);
        n.set(this._bytes, 0), this._buffer = r, this._bytes = n;
      }
    }
  }
  /** @internal */
  _start() {
  }
  /** @internal */
  _write(e, i) {
    this._ensureSize(i + e.byteLength), this._bytes.set(e, i), this._maxPos = Math.max(this._maxPos, i + e.byteLength), this._dispatchWrite(i, i + e.byteLength);
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
  _getSlice(e, i) {
    return this._bytes.slice(e, i);
  }
}
class Yi extends P {
  /** @internal */
  constructor(e, i) {
    super(), this._baseTarget = e, this._offset = i;
  }
  /** @internal */
  _start() {
  }
  /** @internal */
  _write(e, i) {
    this._baseTarget._write(e, this._offset + i), this._dispatchWrite(i, i + e.byteLength);
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
class oe {
  /** Creates a new {@link PathedTarget} from a root path and a callback. */
  constructor(e, i) {
    if (this.rootPath = e, this.getTarget = i, typeof e != "string")
      throw new TypeError("rootPath must be a string.");
    if (typeof i != "function")
      throw new TypeError("getTarget must be a function.");
  }
}
const Zi = -32768, Ji = 2 ** 15 - 1, Je = "Mediabunny", et = 6, tt = 5, er = {
  video: 1,
  audio: 2,
  subtitle: 17
};
class tr extends Gi {
  constructor(e, i) {
    super(e), this.trackDatas = [], this.allTracksKnown = dt(), this.segment = null, this.segmentInfo = null, this.seekHead = null, this.tracksElement = null, this.tagsElement = null, this.attachmentsElement = null, this.segmentDuration = null, this.cues = null, this.currentCluster = null, this.currentClusterStartMsTimestamp = null, this.currentClusterMaxMsTimestamp = null, this.trackDatasInCurrentCluster = /* @__PURE__ */ new Map(), this.startTimestamp = 1 / 0, this.endTimestamp = -1 / 0, this.format = i;
  }
  async start() {
    const e = await this.mutex.acquire();
    this.writer = await this.output._getRootWriter(!!this.format._options.appendOnly), this.ebmlWriter = new Pi(this.writer), this.writeEBMLHeader(), this.createSegmentInfo(), this.createCues(), await this.writer.flush();
    for (const i of this.output.tracks)
      i.isVideoTrack() && i.metadata.decoderConfig ? this.getVideoTrackData(i, i.metadata.primingPacket ?? null, { decoderConfig: i.metadata.decoderConfig }) : i.isAudioTrack() && i.metadata.decoderConfig && this.getAudioTrackData(i, i.metadata.primingPacket ?? null, { decoderConfig: i.metadata.decoderConfig });
    e();
  }
  writeEBMLHeader() {
    this.format._options.onEbmlHeader && this.writer.startTrackingWrites();
    const e = { id: u.EBML, data: [
      { id: u.EBMLVersion, data: 1 },
      { id: u.EBMLReadVersion, data: 1 },
      { id: u.EBMLMaxIDLength, data: 4 },
      { id: u.EBMLMaxSizeLength, data: 8 },
      { id: u.DocType, data: this.format instanceof nt ? "webm" : "matroska" },
      { id: u.DocTypeVersion, data: 2 },
      { id: u.DocTypeReadVersion, data: 2 }
    ] };
    if (this.ebmlWriter.writeEBML(e), this.format._options.onEbmlHeader) {
      const { data: i, start: r } = this.writer.stopTrackingWrites();
      this.format._options.onEbmlHeader(i, r);
    }
  }
  /**
   * Creates a SeekHead element which is positioned near the start of the file and allows the media player to seek to
   * relevant sections more easily. Since we don't know the positions of those sections yet, we'll set them later.
   */
  maybeCreateSeekHead(e) {
    if (this.format._options.appendOnly)
      return;
    const i = new Uint8Array([28, 83, 187, 107]), r = new Uint8Array([21, 73, 169, 102]), n = new Uint8Array([22, 84, 174, 107]), s = new Uint8Array([25, 65, 164, 105]), o = new Uint8Array([18, 84, 195, 103]), a = { id: u.SeekHead, data: [
      { id: u.Seek, data: [
        { id: u.SeekID, data: i },
        {
          id: u.SeekPosition,
          size: 5,
          data: e ? this.ebmlWriter.offsets.get(this.cues) - this.segmentDataOffset : 0
        }
      ] },
      { id: u.Seek, data: [
        { id: u.SeekID, data: r },
        {
          id: u.SeekPosition,
          size: 5,
          data: e ? this.ebmlWriter.offsets.get(this.segmentInfo) - this.segmentDataOffset : 0
        }
      ] },
      { id: u.Seek, data: [
        { id: u.SeekID, data: n },
        {
          id: u.SeekPosition,
          size: 5,
          data: e ? this.ebmlWriter.offsets.get(this.tracksElement) - this.segmentDataOffset : 0
        }
      ] },
      this.attachmentsElement ? { id: u.Seek, data: [
        { id: u.SeekID, data: s },
        {
          id: u.SeekPosition,
          size: 5,
          data: e ? this.ebmlWriter.offsets.get(this.attachmentsElement) - this.segmentDataOffset : 0
        }
      ] } : null,
      this.tagsElement ? { id: u.Seek, data: [
        { id: u.SeekID, data: o },
        {
          id: u.SeekPosition,
          size: 5,
          data: e ? this.ebmlWriter.offsets.get(this.tagsElement) - this.segmentDataOffset : 0
        }
      ] } : null
    ] };
    this.seekHead = a;
  }
  createSegmentInfo() {
    const e = { id: u.Duration, data: new he(0) };
    this.segmentDuration = e;
    const i = { id: u.Info, data: [
      { id: u.TimestampScale, data: 1e6 },
      { id: u.MuxingApp, data: Je },
      { id: u.WritingApp, data: Je },
      this.format._options.appendOnly ? null : e
    ] };
    this.segmentInfo = i;
  }
  createTracks() {
    const e = { id: u.Tracks, data: [] };
    this.tracksElement = e;
    for (const i of this.trackDatas) {
      const r = Ai[i.track.source._codec];
      w(r);
      let n = 0;
      if (i.type === "audio" && i.track.source._codec === "opus") {
        n = 1e6 * 80;
        const s = i.info.decoderConfig.description;
        if (s) {
          const o = R(s), a = ki(o);
          n = Math.round(1e9 * (a.preSkip / di));
        }
      }
      e.data.push({ id: u.TrackEntry, data: [
        { id: u.TrackNumber, data: i.track.id },
        { id: u.TrackUID, data: i.track.id },
        { id: u.TrackType, data: er[i.type] },
        i.track.metadata.disposition?.default === !1 ? { id: u.FlagDefault, data: 0 } : null,
        i.track.metadata.disposition?.forced ? { id: u.FlagForced, data: 1 } : null,
        i.track.metadata.disposition?.hearingImpaired ? { id: u.FlagHearingImpaired, data: 1 } : null,
        i.track.metadata.disposition?.visuallyImpaired ? { id: u.FlagVisualImpaired, data: 1 } : null,
        i.track.metadata.disposition?.original ? { id: u.FlagOriginal, data: 1 } : null,
        i.track.metadata.disposition?.commentary ? { id: u.FlagCommentary, data: 1 } : null,
        { id: u.FlagLacing, data: 0 },
        { id: u.Language, data: i.track.metadata.languageCode ?? qt },
        { id: u.CodecID, data: r },
        i.codecPrivate ? { id: u.CodecPrivate, data: R(i.codecPrivate) } : null,
        { id: u.CodecDelay, data: 0 },
        { id: u.SeekPreRoll, data: n },
        i.track.metadata.name !== void 0 ? { id: u.Name, data: new A(i.track.metadata.name) } : null,
        i.type === "video" ? this.videoSpecificTrackInfo(i) : null,
        i.type === "audio" ? this.audioSpecificTrackInfo(i) : null,
        i.type === "subtitle" ? this.subtitleSpecificTrackInfo(i) : null
      ] });
    }
  }
  videoSpecificTrackInfo(e) {
    const { frameRate: i, rotation: r } = e.track.metadata, n = [
      i ? {
        id: u.DefaultDuration,
        data: 1e9 / i
      } : null
    ], s = r ? ot(-r) : 0, o = !!e.info.aspectRatio && e.info.aspectRatio.num * e.info.height !== e.info.aspectRatio.den * e.info.width, a = e.info.decoderConfig.colorSpace, c = { id: u.Video, data: [
      { id: u.PixelWidth, data: e.info.width },
      { id: u.PixelHeight, data: e.info.height },
      o ? { id: u.DisplayWidth, data: e.info.aspectRatio.num } : null,
      o ? { id: u.DisplayHeight, data: e.info.aspectRatio.den } : null,
      o ? { id: u.DisplayUnit, data: 3 } : null,
      // 3 = display aspect ratio
      e.info.alphaMode ? { id: u.AlphaMode, data: 1 } : null,
      Ht(a) ? {
        id: u.Colour,
        data: [
          {
            id: u.MatrixCoefficients,
            data: we[a.matrix]
          },
          {
            id: u.TransferCharacteristics,
            data: pe[a.transfer]
          },
          {
            id: u.Primaries,
            data: me[a.primaries]
          },
          {
            id: u.Range,
            data: a.fullRange ? 2 : 1
          }
        ]
      } : null,
      s ? {
        id: u.Projection,
        data: [
          {
            id: u.ProjectionType,
            data: 0
            // rectangular
          },
          {
            id: u.ProjectionPoseRoll,
            data: new de((s + 180) % 360 - 180)
            // [0, 270] -> [-180, 90]
          }
        ]
      } : null
    ] };
    return n.push(c), n;
  }
  audioSpecificTrackInfo(e) {
    const i = W.includes(e.track.source._codec) ? hi(e.track.source._codec) : null;
    return [
      { id: u.Audio, data: [
        { id: u.SamplingFrequency, data: new de(e.info.sampleRate) },
        { id: u.Channels, data: e.info.numberOfChannels },
        i ? { id: u.BitDepth, data: 8 * i.sampleSize } : null
      ] }
    ];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subtitleSpecificTrackInfo(e) {
    return [];
  }
  maybeCreateTags() {
    const e = [], i = (s, o) => {
      e.push({ id: u.SimpleTag, data: [
        { id: u.TagName, data: new A(s) },
        typeof o == "string" ? { id: u.TagString, data: new A(o) } : { id: u.TagBinary, data: o }
      ] });
    }, r = this.output._metadataTags, n = /* @__PURE__ */ new Set();
    for (const { key: s, value: o } of Xt(r))
      switch (s) {
        case "title":
          i("TITLE", o), n.add("TITLE");
          break;
        case "description":
          i("DESCRIPTION", o), n.add("DESCRIPTION");
          break;
        case "artist":
          i("ARTIST", o), n.add("ARTIST");
          break;
        case "album":
          i("ALBUM", o), n.add("ALBUM");
          break;
        case "albumArtist":
          i("ALBUM_ARTIST", o), n.add("ALBUM_ARTIST");
          break;
        case "genre":
          i("GENRE", o), n.add("GENRE");
          break;
        case "comment":
          i("COMMENT", o), n.add("COMMENT");
          break;
        case "lyrics":
          i("LYRICS", o), n.add("LYRICS");
          break;
        case "date":
          i("DATE", o.toISOString().slice(0, 10)), n.add("DATE");
          break;
        case "trackNumber":
          {
            const a = r.tracksTotal !== void 0 ? `${o}/${r.tracksTotal}` : o.toString();
            i("PART_NUMBER", a), n.add("PART_NUMBER");
          }
          break;
        case "discNumber":
          {
            const a = r.discsTotal !== void 0 ? `${o}/${r.discsTotal}` : o.toString();
            i("DISC", a), n.add("DISC");
          }
          break;
        case "tracksTotal":
        case "discsTotal":
          break;
        case "images":
        case "raw":
          break;
        default:
          G(s);
      }
    if (r.raw)
      for (const s in r.raw) {
        const o = r.raw[s];
        o == null || n.has(s) || (typeof o == "string" || o instanceof Uint8Array) && i(s, o);
      }
    e.length !== 0 && (this.tagsElement = {
      id: u.Tags,
      data: [{ id: u.Tag, data: [
        { id: u.Targets, data: [
          { id: u.TargetTypeValue, data: 50 },
          { id: u.TargetType, data: "MOVIE" }
        ] },
        ...e
      ] }]
    });
  }
  maybeCreateAttachments() {
    const e = this.output._metadataTags, i = [], r = /* @__PURE__ */ new Set(), n = e.images ?? [];
    for (const s of n) {
      let o = s.name;
      o === void 0 && (o = (s.kind === "coverFront" ? "cover" : s.kind === "coverBack" ? "back" : "image") + (Kt(s.mimeType) ?? ""));
      let a;
      for (; ; ) {
        a = 0n;
        for (let c = 0; c < 8; c++)
          a <<= 8n, a |= BigInt(Math.floor(Math.random() * 256));
        if (a !== 0n && !r.has(a))
          break;
      }
      r.add(a), i.push({
        id: u.AttachedFile,
        data: [
          s.description !== void 0 ? { id: u.FileDescription, data: new A(s.description) } : null,
          { id: u.FileName, data: new A(o) },
          { id: u.FileMediaType, data: s.mimeType },
          { id: u.FileData, data: s.data },
          { id: u.FileUID, data: a }
        ]
      });
    }
    for (const [s, o] of Object.entries(e.raw ?? {}))
      !(o instanceof lt) || !/^\d+$/.test(s) || n.find((c) => c.mimeType === o.mimeType && Lt(c.data, o.data)) || i.push({
        id: u.AttachedFile,
        data: [
          o.description !== void 0 ? { id: u.FileDescription, data: new A(o.description) } : null,
          { id: u.FileName, data: new A(o.name ?? "") },
          { id: u.FileMediaType, data: o.mimeType ?? "" },
          { id: u.FileData, data: o.data },
          { id: u.FileUID, data: BigInt(s) }
        ]
      });
    i.length !== 0 && (this.attachmentsElement = { id: u.Attachments, data: i });
  }
  createSegment() {
    this.createTracks(), this.maybeCreateTags(), this.maybeCreateAttachments(), this.maybeCreateSeekHead(!1);
    const e = {
      id: u.Segment,
      size: this.format._options.appendOnly ? -1 : et,
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
      const { data: i, start: r } = this.writer.stopTrackingWrites();
      this.format._options.onSegmentHeader(i, r);
    }
  }
  createCues() {
    this.cues = { id: u.Cues, data: [] };
  }
  get segmentDataOffset() {
    return w(this.segment), this.ebmlWriter.dataOffsets.get(this.segment);
  }
  allTracksAreKnown() {
    for (const e of this.output.tracks)
      if (!e.source._closed && !this.trackDatas.some((i) => i.track === e))
        return !1;
    return !0;
  }
  async getMimeType() {
    await this.allTracksKnown.promise;
    const e = this.trackDatas.map((i) => i.type === "video" || i.type === "audio" ? i.info.decoderConfig.codec : {
      webvtt: "wvtt"
    }[i.track.source._codec]);
    return Ri({
      isWebM: this.format instanceof nt,
      hasVideo: this.trackDatas.some((i) => i.type === "video"),
      hasAudio: this.trackDatas.some((i) => i.type === "audio"),
      codecStrings: e
    });
  }
  getVideoTrackData(e, i, r) {
    const n = this.trackDatas.find((d) => d.track === e);
    if (n)
      return n;
    gt(r, e.source._codec), w(r), w(r.decoderConfig), w(r.decoderConfig.codedWidth !== void 0), w(r.decoderConfig.codedHeight !== void 0);
    const s = r.decoderConfig.displayAspectWidth, o = r.decoderConfig.displayAspectHeight, a = s === void 0 || o === void 0 ? null : ut({
      num: s,
      den: o
    }), c = {
      track: e,
      type: "video",
      info: {
        width: r.decoderConfig.codedWidth,
        height: r.decoderConfig.codedHeight,
        aspectRatio: a,
        decoderConfig: r.decoderConfig,
        alphaMode: i ? !!i.sideData.alpha : null
      },
      chunkQueue: [],
      lastWrittenMsTimestamp: null,
      codecPrivate: r.decoderConfig.description ?? null,
      closed: !1
    };
    return e.source._codec === "vp9" ? c.codecPrivate = new Uint8Array(ai(c.info.decoderConfig.codec)) : e.source._codec === "av1" ? c.codecPrivate = new Uint8Array(ci(c.info.decoderConfig.codec)) : e.source._codec === "prores" && (c.codecPrivate = N.encode(r.decoderConfig.codec)), this.trackDatas.push(c), this.trackDatas.sort((d, h) => d.track.id - h.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), c;
  }
  getAudioTrackData(e, i, r) {
    const n = this.trackDatas.find((c) => c.track === e);
    if (n)
      return n;
    yt(r, e.source._codec), w(r), w(r.decoderConfig);
    const s = { ...r.decoderConfig };
    let o = !1;
    if (e.source._codec === "aac" && !s.description) {
      if (!i)
        throw new Error("No AAC description provided; you must therefore provide a priming packet.");
      const c = Ne(j.tempFromBytes(i.data));
      if (!c)
        throw new Error("Couldn't parse ADTS header from the AAC packet. Make sure the packets are in ADTS format (as specified in ISO 13818-7) when not providing a description, or provide a description (must be an AudioSpecificConfig as specified in ISO 14496-3) and ensure the packets are raw AAC data.");
      const d = ft[c.samplingFrequencyIndex], h = mt[c.channelConfiguration];
      if (d === void 0 || h === void 0)
        throw new Error("Invalid ADTS frame header.");
      s.description = ni({
        objectType: c.objectType,
        sampleRate: d,
        numberOfChannels: h
      }), o = !0;
    }
    const a = {
      track: e,
      type: "audio",
      info: {
        numberOfChannels: r.decoderConfig.numberOfChannels,
        sampleRate: r.decoderConfig.sampleRate,
        decoderConfig: s,
        requiresAdtsStripping: o
      },
      chunkQueue: [],
      lastWrittenMsTimestamp: null,
      codecPrivate: s.description ?? null,
      closed: !1
    };
    return this.trackDatas.push(a), this.trackDatas.sort((c, d) => c.track.id - d.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), a;
  }
  getSubtitleTrackData(e, i) {
    const r = this.trackDatas.find((s) => s.track === e);
    if (r)
      return r;
    yi(i), w(i), w(i.config);
    const n = {
      track: e,
      type: "subtitle",
      info: {
        config: i.config
      },
      chunkQueue: [],
      lastWrittenMsTimestamp: null,
      codecPrivate: N.encode(i.config.description),
      closed: !1
    };
    return this.trackDatas.push(n), this.trackDatas.sort((s, o) => s.track.id - o.track.id), this.allTracksAreKnown() && this.allTracksKnown.resolve(), n;
  }
  async addEncodedVideoPacket(e, i, r) {
    const n = await this.mutex.acquire();
    try {
      const s = this.getVideoTrackData(e, i, r);
      s.info.alphaMode ??= !!i.sideData.alpha;
      let o = i.data;
      if (e.source._codec === "prores") {
        if (o.byteLength < 8)
          throw new Error("ProRes packet too small, expected at least 8 bytes.");
        o = o.subarray(8);
      }
      const a = i.type === "key";
      this.validateTimestamp(s.track, i.timestamp, a);
      let c = i.timestamp, d = i.duration;
      e.metadata.frameRate !== void 0 && (c = Pe(c, e.metadata.frameRate), d = Pe(d, e.metadata.frameRate));
      const h = s.info.alphaMode ? i.sideData.alpha ?? null : null, l = this.createInternalChunk(o, c, d, i.type, h);
      e.source._codec === "vp9" && this.fixVP9ColorSpace(s, l), s.chunkQueue.push(l), await this.interleaveChunks();
    } finally {
      n();
    }
  }
  async addEncodedAudioPacket(e, i, r) {
    const n = await this.mutex.acquire();
    try {
      const s = this.getAudioTrackData(e, i, r);
      let o = i.data;
      if (s.info.requiresAdtsStripping) {
        const d = Ne(j.tempFromBytes(o));
        if (!d)
          throw new Error("Expected ADTS frame, didn't get one.");
        const h = d.crcCheck === null ? Vi : Di;
        o = o.subarray(h);
      }
      const a = i.type === "key";
      this.validateTimestamp(s.track, i.timestamp, a);
      const c = this.createInternalChunk(o, i.timestamp, i.duration, i.type);
      s.chunkQueue.push(c), await this.interleaveChunks();
    } finally {
      n();
    }
  }
  async addSubtitleCue(e, i, r) {
    const n = await this.mutex.acquire();
    try {
      const s = this.getSubtitleTrackData(e, r);
      this.validateTimestamp(s.track, i.timestamp, !0);
      let o = i.text;
      const a = Math.round(i.timestamp * 1e3);
      Ze.lastIndex = 0, o = o.replace(Ze, (l) => {
        const m = Xi(l.slice(1, -1)) - a;
        return `<${Ki(m)}>`;
      });
      const c = N.encode(o), d = `${i.settings ?? ""}
${i.identifier ?? ""}
${i.notes ?? ""}`, h = this.createInternalChunk(c, i.timestamp, i.duration, "key", d.trim() ? N.encode(d) : null);
      s.chunkQueue.push(h), await this.interleaveChunks();
    } finally {
      n();
    }
  }
  async interleaveChunks(e = !1) {
    if (!(!e && !this.allTracksAreKnown())) {
      e: for (; ; ) {
        let i = null, r = 1 / 0;
        for (const s of this.trackDatas) {
          if (!e && s.chunkQueue.length === 0 && !s.closed)
            break e;
          s.chunkQueue.length > 0 && s.chunkQueue[0].timestamp < r && (i = s, r = s.chunkQueue[0].timestamp);
        }
        if (!i)
          break;
        const n = i.chunkQueue.shift();
        this.writeBlock(i, n);
      }
      e || await this.writer.flush();
    }
  }
  /**
   * Due to [a bug in Chromium](https://bugs.chromium.org/p/chromium/issues/detail?id=1377842), VP9 streams often
   * lack color space information. This method patches in that information.
   */
  fixVP9ColorSpace(e, i) {
    if (i.type !== "key" || !e.info.decoderConfig.colorSpace || !e.info.decoderConfig.colorSpace.matrix)
      return;
    const r = new x(i.data);
    r.skipBits(2);
    const n = r.readBits(1), o = (r.readBits(1) << 1) + n;
    if (o === 3 && r.skipBits(1), r.readBits(1) || r.readBits(1) !== 0 || (r.skipBits(2), r.readBits(24) !== 4817730))
      return;
    o >= 2 && r.skipBits(1);
    const h = {
      rgb: 7,
      bt709: 2,
      bt470bg: 1,
      smpte170m: 3
    }[e.info.decoderConfig.colorSpace.matrix];
    Bt(i.data, r.pos, r.pos + 3, h);
  }
  /** Converts a read-only external chunk into an internal one for easier use. */
  createInternalChunk(e, i, r, n, s = null) {
    return {
      data: e,
      type: n,
      timestamp: i,
      duration: r,
      additions: s
    };
  }
  /** Writes a block containing media data to the file. */
  writeBlock(e, i) {
    this.segment || this.createSegment();
    const r = Math.round(1e3 * i.timestamp), n = this.trackDatas.every((l) => {
      if (e === l)
        return i.type === "key";
      const f = l.chunkQueue[0];
      return f ? f.type === "key" : l.closed;
    });
    let s = !1;
    if (!this.currentCluster)
      s = !0;
    else {
      w(this.currentClusterStartMsTimestamp !== null), w(this.currentClusterMaxMsTimestamp !== null);
      const l = r - this.currentClusterStartMsTimestamp;
      s = n && r > this.currentClusterMaxMsTimestamp && l >= 1e3 * (this.format._options.minimumClusterDuration ?? 1) || l > Ji;
    }
    s && this.createNewCluster(r);
    const o = r - this.currentClusterStartMsTimestamp;
    if (o < Zi)
      return;
    const a = new Uint8Array(4), c = new DataView(a.buffer);
    c.setUint8(0, 128 | e.track.id), c.setInt16(1, o, !1);
    const d = Math.round(1e3 * i.duration);
    if (!!i.additions || e.type === "subtitle") {
      const l = { id: u.BlockGroup, data: [
        { id: u.Block, data: [
          a,
          i.data
        ] },
        i.type === "delta" ? {
          id: u.ReferenceBlock,
          data: new Ct(e.lastWrittenMsTimestamp - r)
        } : null,
        i.additions ? { id: u.BlockAdditions, data: [
          { id: u.BlockMore, data: [
            { id: u.BlockAddID, data: 1 },
            // Some players expect BlockAddID to come first
            { id: u.BlockAdditional, data: i.additions }
          ] }
        ] } : null,
        d > 0 ? { id: u.BlockDuration, data: d } : null
      ] };
      this.ebmlWriter.writeEBML(l);
    } else {
      c.setUint8(3, +(i.type === "key") << 7);
      const l = { id: u.SimpleBlock, data: [
        a,
        i.data
      ] };
      this.ebmlWriter.writeEBML(l);
    }
    this.startTimestamp = Math.min(this.startTimestamp, r), this.endTimestamp = Math.max(this.endTimestamp, r + d), e.lastWrittenMsTimestamp = r, this.trackDatasInCurrentCluster.has(e) || this.trackDatasInCurrentCluster.set(e, {
      firstMsTimestamp: r
    }), this.currentClusterMaxMsTimestamp = Math.max(this.currentClusterMaxMsTimestamp, r);
  }
  /** Creates a new Cluster element to contain media chunks. */
  createNewCluster(e) {
    this.currentCluster && this.finalizeCurrentCluster(), this.format._options.onCluster && this.writer.startTrackingWrites(), this.currentCluster = {
      id: u.Cluster,
      size: this.format._options.appendOnly ? -1 : tt,
      data: [
        { id: u.Timestamp, data: e }
      ]
    }, this.ebmlWriter.writeEBML(this.currentCluster), this.currentClusterStartMsTimestamp = e, this.currentClusterMaxMsTimestamp = e, this.trackDatasInCurrentCluster.clear();
  }
  finalizeCurrentCluster() {
    if (w(this.currentCluster), !this.format._options.appendOnly) {
      const n = this.writer.getPos() - this.ebmlWriter.dataOffsets.get(this.currentCluster), s = this.writer.getPos();
      this.writer.seek(this.ebmlWriter.offsets.get(this.currentCluster) + 4), this.ebmlWriter.writeVarInt(n, tt), this.writer.seek(s);
    }
    if (this.format._options.onCluster) {
      w(this.currentClusterStartMsTimestamp !== null);
      const { data: n, start: s } = this.writer.stopTrackingWrites();
      this.format._options.onCluster(n, s, this.currentClusterStartMsTimestamp / 1e3);
    }
    const e = this.ebmlWriter.offsets.get(this.currentCluster) - this.segmentDataOffset, i = /* @__PURE__ */ new Map();
    for (const [n, { firstMsTimestamp: s }] of this.trackDatasInCurrentCluster)
      i.has(s) || i.set(s, []), i.get(s).push(n);
    const r = [...i.entries()].sort((n, s) => n[0] - s[0]);
    for (const [n, s] of r)
      w(this.cues), this.cues.data.push({ id: u.CuePoint, data: [
        { id: u.CueTime, data: n },
        // Create CueTrackPositions for each track that starts at this timestamp
        ...s.map((o) => ({ id: u.CueTrackPositions, data: [
          { id: u.CueTrack, data: o.track.id },
          { id: u.CueClusterPosition, data: e }
        ] }))
      ] });
  }
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async onTrackClose(e) {
    const i = await this.mutex.acquire(), r = this.trackDatas.find((n) => n.track === e);
    r && (r.closed = !0), this.allTracksAreKnown() && this.allTracksKnown.resolve(), await this.interleaveChunks(), i();
  }
  /** Finalizes the file, making it ready for use. Must be called after all media chunks have been added. */
  async finalize() {
    const e = await this.mutex.acquire();
    this.allTracksKnown.resolve();
    for (const i of this.trackDatas)
      i.closed = !0;
    if (this.segment || this.createSegment(), await this.interleaveChunks(!0), this.currentCluster && this.finalizeCurrentCluster(), w(this.cues), this.ebmlWriter.writeEBML(this.cues), !this.format._options.appendOnly) {
      const i = this.writer.getPos() - this.segmentDataOffset;
      this.writer.seek(this.ebmlWriter.offsets.get(this.segment) + 4), this.ebmlWriter.writeVarInt(i, et);
      const r = this.startTimestamp === 1 / 0 ? 0 : this.endTimestamp - this.startTimestamp;
      this.segmentDuration.data = new he(r), this.writer.seek(this.ebmlWriter.offsets.get(this.segmentDuration)), this.ebmlWriter.writeEBML(this.segmentDuration), w(this.seekHead), this.writer.seek(this.ebmlWriter.offsets.get(this.seekHead)), this.maybeCreateSeekHead(!0), this.ebmlWriter.writeEBML(this.seekHead);
    }
    e();
  }
}
var ir = function(t, e, i) {
  if (e != null) {
    if (typeof e != "object" && typeof e != "function") throw new TypeError("Object expected.");
    var r, n;
    if (i) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      r = e[Symbol.asyncDispose];
    }
    if (r === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      r = e[Symbol.dispose], i && (n = r);
    }
    if (typeof r != "function") throw new TypeError("Object not disposable.");
    n && (r = function() {
      try {
        n.call(this);
      } catch (s) {
        return Promise.reject(s);
      }
    }), t.stack.push({ value: e, dispose: r, async: i });
  } else i && t.stack.push({ async: !0 });
  return e;
}, rr = /* @__PURE__ */ (function(t) {
  return function(e) {
    function i(o) {
      e.error = e.hasError ? new t(o, e.error, "An error was suppressed during disposal.") : o, e.hasError = !0;
    }
    var r, n = 0;
    function s() {
      for (; r = e.stack.pop(); )
        try {
          if (!r.async && n === 1) return n = 0, e.stack.push(r), Promise.resolve().then(s);
          if (r.dispose) {
            var o = r.dispose.call(r.value);
            if (r.async) return n |= 2, Promise.resolve(o).then(s, function(a) {
              return i(a), s();
            });
          } else n |= 1;
        } catch (a) {
          i(a);
        }
      if (n === 1) return e.hasError ? Promise.reject(e.error) : Promise.resolve();
      if (e.hasError) throw e.error;
    }
    return s();
  };
})(typeof SuppressedError == "function" ? SuppressedError : function(t, e, i) {
  var r = new Error(i);
  return r.name = "SuppressedError", r.error = t, r.suppressed = e, r;
});
class Te {
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
class xt extends Te {
  /** Internal constructor. */
  constructor(e) {
    if (super(), this._connectedTrack = null, !V.includes(e))
      throw new TypeError(`Invalid video codec '${e}'. Must be one of: ${V.join(", ")}.`);
    this._codec = e;
  }
}
const it = (t, e) => {
  if (t.metadata.hasOnlyKeyPackets && e.type !== "key")
    throw new Error("Cannot add non-key packets to a hasOnlyKeyPackets video track.");
};
class nr {
  setError(e) {
    this.errorSet || (this.error = e, this.errorSet = !0);
  }
  constructor(e, i) {
    this.source = e, this.encodingConfig = i, this.ensureEncoderPromise = null, this.encoderInitialized = !1, this.encoder = null, this.muxer = null, this.lastMultipleOfKeyFrameInterval = -1, this.emittedEncoderPackets = 0, this.codedWidth = null, this.codedHeight = null, this.outputWidth = null, this.outputHeight = null, this.frameRateLastSample = null, this.frameRateLastTimestamp = null, this.frameRateLastEndTimestamp = null, this.preciseTimings = [], this.customEncoder = null, this.customEncoderCallSerializer = new $t(), this.customEncoderQueueSize = 0, this.defaultEncodeOptions = {}, this.alphaEncoder = null, this.splitter = null, this.splitterCreationFailed = !1, this.alphaFrameQueue = [], this.error = null, this.errorSet = !1, this.lastMuxerPromise = Promise.resolve(), this.closed = !1;
  }
  async add(e, i, r) {
    const n = e;
    try {
      this.checkForEncoderError(), this.source._ensureValidAdd();
      const s = this.encodingConfig, o = s.sizeChangeBehavior ?? "deny";
      let a = !1;
      if (this.codedWidth !== null && this.codedHeight !== null) {
        if ((e.codedWidth !== this.codedWidth || e.codedHeight !== this.codedHeight) && (a = !0, o === "deny"))
          throw new Error(`Video sample size must remain constant. Expected ${this.codedWidth}x${this.codedHeight}, got ${e.codedWidth}x${e.codedHeight}. To allow the sample size to change over time, set \`sizeChangeBehavior\` to a value other than 'deny' in the encoding options.`);
      } else
        this.codedWidth = e.codedWidth, this.codedHeight = e.codedHeight;
      if (s.transform?.width !== void 0 || s.transform?.height !== void 0 || s.transform?.rotate !== void 0 || s.transform?.crop !== void 0 || s.transform?.force === !0 || a && o !== "passThrough") {
        let l = s.transform?.width, f = s.transform?.height, m = s.transform?.fit ?? "fill";
        a && o !== "passThrough" && (w(this.outputWidth), w(this.outputHeight), w(o !== "deny"), l = this.outputWidth, f = this.outputHeight, m = o);
        const p = await e.transform({
          width: l,
          height: f,
          roundDimensionsTo: 2,
          crop: s.transform?.crop,
          rotate: s.transform?.rotate,
          fit: m,
          alpha: s.alpha
        });
        (this.outputWidth === null || this.outputHeight === null) && (this.outputWidth = p.displayWidth, this.outputHeight = p.displayHeight), i && e.close(), e = p, i = !0;
      } else
        (this.outputWidth === null || this.outputHeight === null) && (this.outputWidth = e.codedWidth, this.outputHeight = e.codedHeight);
      const h = s.transform?.frameRate;
      if (h !== void 0) {
        const l = e.timestamp + e.duration, f = Ae(e.timestamp, h);
        if (this.frameRateLastSample !== null)
          if (f <= this.frameRateLastTimestamp) {
            this.frameRateLastSample.close(), this.frameRateLastSample = e.clone(), this.frameRateLastEndTimestamp = l;
            return;
          } else
            await this.padFrameRate(f, r);
        e === n && (e = e.clone(), i = !0), e.setTimestamp(f), e.setDuration(1 / h), this.frameRateLastSample?.close(), this.frameRateLastSample = e.clone(), this.frameRateLastTimestamp = f, this.frameRateLastEndTimestamp = l;
      }
      await this.processAndEncode(e, r);
    } finally {
      i && e.close();
    }
  }
  /**
   * Runs the process function (if any) and encodes the resulting samples.
   */
  async processAndEncode(e, i) {
    const r = this.encodingConfig;
    let n;
    if (r.transform?.process) {
      let s = r.transform.process(e);
      if (s instanceof Promise && (s = await s), s === null)
        return;
      Array.isArray(s) || (s = [s]);
      const o = [];
      try {
        for (const a of s)
          a instanceof v ? o.push(a) : typeof VideoFrame < "u" && a instanceof VideoFrame ? o.push(new v(a)) : o.push(new v(a, {
            timestamp: e.timestamp,
            duration: e.duration
          }));
      } catch (a) {
        for (const c of o)
          c !== e && c.close();
        for (const c of s)
          (c instanceof v && c !== e || typeof VideoFrame < "u" && c instanceof VideoFrame) && c.close();
        throw a;
      }
      n = o;
    } else
      n = [e];
    try {
      for (const s of n) {
        if (this.encoderInitialized || (this.ensureEncoderPromise || this.ensureEncoder(s), this.encoderInitialized || await this.ensureEncoderPromise), w(this.encoderInitialized), this.closed)
          break;
        const o = this.encodingConfig.keyFrameInterval ?? 2, a = Math.floor(s.timestamp / o), c = {
          ...this.defaultEncodeOptions,
          ...s.encodeOptions,
          ...i
        }, d = {
          ...c,
          keyFrame: c.keyFrame !== void 0 ? c.keyFrame : o === 0 || a !== this.lastMultipleOfKeyFrameInterval
        };
        if (this.lastMultipleOfKeyFrameInterval = a, this.encodingConfig.onEncodedSample?.(s), this.customEncoder) {
          this.customEncoderQueueSize++;
          const h = s.clone(), l = this.customEncoderCallSerializer.call(() => this.customEncoder.encode(h, d)).catch((f) => this.setError(f)).finally(() => {
            this.customEncoderQueueSize--, h.close();
          });
          this.customEncoderQueueSize >= 4 && await l;
        } else {
          w(this.encoder);
          const h = s.toVideoFrame(), l = ke(this.preciseTimings, h.timestamp, (m) => m.microsecondTimestamp), f = l !== -1 ? this.preciseTimings[l] : null;
          if (f && f.microsecondTimestamp === h.timestamp ? (f.timestamp !== s.timestamp && (f.timestampIsValid = !1), f.duration !== s.duration && (f.durationIsValid = !1)) : (this.preciseTimings.splice(l + 1, 0, {
            microsecondTimestamp: h.timestamp,
            timestamp: s.timestamp,
            duration: s.duration,
            timestampIsValid: !0,
            durationIsValid: !0
          }), this.preciseTimings.length > 128 && this.preciseTimings.shift()), this.alphaEncoder)
            if (!!h.format && !h.format.includes("A") || this.splitterCreationFailed) {
              this.alphaFrameQueue.push(null);
              try {
                this.encoder.encode(h, d);
              } finally {
                h.close();
              }
            } else {
              this.splitter || (this.splitter = new sr());
              const { colorFrame: p, alphaFrame: b } = await this.splitter.split(h);
              this.alphaFrameQueue.push(b);
              try {
                this.encoder.encode(p, d);
              } finally {
                p.close();
              }
            }
          else
            try {
              this.encoder.encode(h, d);
            } finally {
              h.close();
            }
          this.encoder.encodeQueueSize >= 4 && await new Promise((m) => this.encoder.addEventListener("dequeue", m, { once: !0 }));
        }
        await this.lastMuxerPromise;
      }
    } finally {
      for (const s of n)
        s !== e && s.close();
    }
  }
  /** Repeats the last frame rate sample to fill the gap up to the given timestamp. */
  async padFrameRate(e, i) {
    const r = this.encodingConfig.transform.frameRate;
    w(this.frameRateLastSample);
    const n = Math.round((e - this.frameRateLastTimestamp) * r);
    for (let s = 1; s < n; s++) {
      const o = { stack: [], error: void 0, hasError: !1 };
      try {
        const a = ir(o, this.frameRateLastSample.clone(), !1);
        a.setTimestamp(this.frameRateLastTimestamp + s / r), a.setDuration(1 / r), await this.processAndEncode(a, i);
      } catch (a) {
        o.error = a, o.hasError = !0;
      } finally {
        rr(o);
      }
    }
  }
  ensureEncoder(e) {
    this.ensureEncoderPromise = (async () => {
      const i = kt(this.encodingConfig.quality, this.encodingConfig.bitrate);
      w(i !== void 0);
      const r = vt({
        ...this.encodingConfig,
        quality: i,
        width: e.codedWidth,
        height: e.codedHeight,
        squarePixelWidth: e.squarePixelWidth,
        squarePixelHeight: e.squarePixelHeight,
        framerate: this.source._connectedTrack?.metadata.frameRate
      });
      let n = null, s;
      for (const a of r) {
        const c = a.config;
        if (this.encodingConfig.onEncoderConfig?.(c), s = St.find((h) => h.supports(this.encodingConfig.codec, c)), s) {
          n = a;
          break;
        }
        if (typeof VideoEncoder > "u")
          continue;
        if (c.alpha = "discard", this.encodingConfig.alpha === "keep" && (c.latencyMode = "quality"), (c.width % 2 === 1 || c.height % 2 === 1) && (this.encodingConfig.codec === "avc" || this.encodingConfig.codec === "hevc"))
          throw new Error(`The dimensions ${c.width}x${c.height} are not supported for codec '${this.encodingConfig.codec}'; both width and height must be even numbers. Make sure to round your dimensions to the nearest even number.`);
        try {
          if ((await VideoEncoder.isConfigSupported(c)).supported) {
            n = a;
            break;
          }
        } catch {
        }
      }
      if (!n) {
        if (typeof VideoEncoder > "u")
          throw new Error("VideoEncoder is not supported by this browser.");
        const a = r[0].config, c = r.map(({ config: d, quantizer: h }) => h !== null ? `quantizer ${h}` : `${d.bitrate} bps`);
        throw new Error(`This specific encoder configuration (${a.codec}, ${c.join(" / ")}, ${a.width}x${a.height}, hardware acceleration: ${a.hardwareAcceleration ?? "no-preference"}) is not supported by this browser. Consider using another codec or changing your video parameters.`);
      }
      const o = n.config;
      if (n.quantizer !== null && (this.defaultEncodeOptions = _t(this.encodingConfig.codec, n.quantizer)), s)
        this.customEncoder = new s(), this.customEncoder.codec = this.encodingConfig.codec, this.customEncoder.config = o, this.customEncoder.onPacket = (a, c) => {
          if (!(a instanceof z))
            throw new TypeError("The first argument passed to onPacket must be an EncodedPacket.");
          if (c !== void 0 && (!c || typeof c != "object"))
            throw new TypeError("The second argument passed to onPacket must be an object or undefined.");
          it(this.source._connectedTrack, a), this.encodingConfig.onEncodedPacket?.(a, c), this.lastMuxerPromise = this.muxer.addEncodedVideoPacket(this.source._connectedTrack, a, c).catch((d) => {
            this.setError(d);
          });
        }, this.customEncoder.onError = (a) => {
          this.setError(a);
        }, await this.customEncoder.init();
      else {
        const a = [], c = [];
        let d = 0, h = 0;
        const l = (m, p, b) => {
          const g = {};
          if (p) {
            const k = new Uint8Array(p.byteLength);
            p.copyTo(k), g.alpha = k;
          }
          let y = z.fromEncodedChunk(m, g);
          const C = ke(this.preciseTimings, m.timestamp, (k) => k.microsecondTimestamp), T = C !== -1 ? this.preciseTimings[C] : null;
          let _ = null;
          this.emittedEncoderPackets === 0 && y.type === "delta" && b?.decoderConfig && (_ = Si(this.encodingConfig.codec, b.decoderConfig, y.data)), (T && T.microsecondTimestamp === m.timestamp || _ !== null) && (y = y.clone({
            timestamp: T?.timestampIsValid ? T.timestamp : void 0,
            duration: T?.durationIsValid ? T.duration : void 0,
            type: _ ?? void 0
          })), it(this.source._connectedTrack, y), this.encodingConfig.onEncodedPacket?.(y, b), this.lastMuxerPromise = this.muxer.addEncodedVideoPacket(this.source._connectedTrack, y, b).catch((k) => {
            this.setError(k);
          }), this.emittedEncoderPackets++;
        }, f = new Error("Encoding error").stack;
        if (this.encoder = new VideoEncoder({
          output: (m, p) => {
            if (!this.alphaEncoder) {
              l(m, null, p);
              return;
            }
            const b = this.alphaFrameQueue.shift();
            w(b !== void 0), b ? (this.alphaEncoder.encode(b, {
              ...this.defaultEncodeOptions,
              // Crucial: The alpha frame is forced to be a key frame whenever the color frame
              // also is. Without this, playback can glitch and even crash in some browsers.
              // This is the reason why the two encoders are wired in series and not in parallel.
              keyFrame: m.type === "key"
            }), h++, b.close(), a.push({ chunk: m, meta: p })) : h === 0 ? l(m, null, p) : (c.push(d + h), a.push({ chunk: m, meta: p }));
          },
          error: (m) => {
            m.stack = f, this.setError(m);
          }
        }), this.encoder.configure(o), this.encodingConfig.alpha === "keep") {
          const m = new Error("Encoding error").stack;
          this.alphaEncoder = new VideoEncoder({
            // We ignore the alpha chunk's metadata
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            output: (p, b) => {
              h--;
              const g = a.shift();
              for (w(g !== void 0), l(g.chunk, p, g.meta), d++; c.length > 0 && c[0] === d; ) {
                c.shift();
                const y = a.shift();
                w(y !== void 0), l(y.chunk, null, y.meta);
              }
            },
            error: (p) => {
              p.stack = m, this.setError(p);
            }
          }), this.alphaEncoder.configure(o);
        }
      }
      w(this.source._connectedTrack), this.muxer = this.source._connectedTrack.output._muxer, this.encoderInitialized = !0;
    })();
  }
  async flushAndClose(e) {
    try {
      if (!e && (this.checkForEncoderError(), this.frameRateLastSample)) {
        const i = this.encodingConfig.transform.frameRate, r = Ae(this.frameRateLastEndTimestamp, i);
        await this.padFrameRate(r);
      }
      this.closed = !0, e || (this.customEncoder ? this.customEncoderCallSerializer.call(() => this.customEncoder.flush()) : this.encoder && (await this.encoder.flush(), await this.alphaEncoder?.flush(), await Jt(25)));
    } finally {
      this.closed = !0, this.frameRateLastSample?.close(), this.frameRateLastSample = null, this.customEncoder ? await this.customEncoderCallSerializer.call(() => this.customEncoder.close()).catch((i) => this.setError(i)) : this.encoder && (this.encoder.state !== "closed" && this.encoder.close(), this.alphaEncoder && this.alphaEncoder.state !== "closed" && this.alphaEncoder.close(), this.alphaFrameQueue.forEach((i) => i?.close()), this.alphaFrameQueue.length = 0, this.splitter?.close());
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
let ae = null;
class sr {
  constructor() {
    this.worker = null, this.pendingRequests = /* @__PURE__ */ new Map(), this.nextRequestId = 0;
  }
  split(e) {
    if (!this.worker) {
      if (!ae) {
        const n = new Blob([`(${or.toString()})()`], { type: "application/javascript" });
        ae = URL.createObjectURL(n);
      }
      this.worker = new Worker(ae), this.worker.addEventListener("message", (n) => {
        const s = n.data, o = this.pendingRequests.get(s.id);
        o && (this.pendingRequests.delete(s.id), "error" in s ? o.reject(new Error(s.error)) : o.resolve({ colorFrame: s.colorFrame, alphaFrame: s.alphaFrame }));
      }), this.worker.addEventListener("error", (n) => {
        const s = new Error(n.message || "Color/alpha splitter worker error.");
        for (const o of this.pendingRequests.values())
          o.reject(s);
        this.pendingRequests.clear();
      });
    }
    const i = this.nextRequestId++, r = dt();
    return this.pendingRequests.set(i, r), this.worker.postMessage({ id: i, sourceFrame: e }, { transfer: [e] }), r.promise;
  }
  close() {
    this.worker?.terminate(), this.worker = null;
    const e = new Error("Color/alpha splitter closed.");
    for (const i of this.pendingRequests.values())
      i.reject(e);
    this.pendingRequests.clear();
  }
}
const or = () => {
  let t = null, e = Promise.resolve();
  self.addEventListener("message", (s) => {
    const { id: o, sourceFrame: a } = s.data;
    e = e.then(async () => {
      try {
        const { colorFrame: c, alphaFrame: d } = await i(a);
        self.postMessage({ id: o, colorFrame: c, alphaFrame: d }, { transfer: [c, d] });
      } catch (c) {
        self.postMessage({ id: o, error: c.message });
      } finally {
        a.close();
      }
    });
  });
  const i = async (s) => {
    const o = s.format;
    if (!o)
      throw new Error("CPU color/alpha splitting requires a known VideoFrame format.");
    const a = s.allocationSize();
    if ((!t || t.byteLength !== a) && (t = new Uint8Array(a)), await s.copyTo(t), o === "RGBA" || o === "BGRA")
      return r(t, o, s);
    if (o === "I420A" || o === "I420AP10" || o === "I420AP12" || o === "I422A" || o === "I422AP10" || o === "I422AP12" || o === "I444A" || o === "I444AP10" || o === "I444AP12")
      return n(t, o, s);
    throw new Error(`CPU color/alpha splitting does not support format '${o}'.`);
  }, r = (s, o, a) => {
    const c = a.visibleRect?.width ?? a.codedWidth, d = a.visibleRect?.height ?? a.codedHeight, h = c * d, l = Math.ceil(c / 2), f = Math.ceil(d / 2), m = h + l * f * 2, p = new Uint8Array(m);
    for (let C = 0, T = 3; C < h; C++, T += 4)
      p[C] = s[T];
    p.fill(128, h);
    const b = new VideoFrame(s, {
      format: o === "RGBA" ? "RGBX" : "BGRX",
      codedWidth: c,
      codedHeight: d,
      timestamp: a.timestamp,
      duration: a.duration ?? void 0
      // No transfer!
    }), g = {
      format: "I420",
      codedWidth: c,
      codedHeight: d,
      timestamp: a.timestamp,
      duration: a.duration ?? void 0,
      transfer: [p.buffer]
    }, y = new VideoFrame(p, g);
    return { colorFrame: b, alphaFrame: y };
  }, n = (s, o, a) => {
    const c = a.visibleRect?.width ?? a.codedWidth, d = a.visibleRect?.height ?? a.codedHeight, h = o.includes("P10"), l = o.includes("P12"), f = h || l ? 2 : 1;
    let m, p;
    o.startsWith("I420") ? (m = Math.ceil(c / 2), p = Math.ceil(d / 2)) : o.startsWith("I422") ? (m = Math.ceil(c / 2), p = d) : (m = c, p = d);
    const b = c * d, g = m * p, y = b * f, C = g * f, T = b * f, _ = y + C * 2, k = o.replace("A", ""), At = Math.ceil(c / 2), Rt = Math.ceil(d / 2), Ce = At * Rt, Vt = Ce * f, Dt = T + 2 * Vt, B = new Uint8Array(Dt), Ee = _;
    B.set(s.subarray(Ee, Ee + T), 0);
    const ve = T, _e = h ? 512 : l ? 2048 : 128;
    f === 1 ? B.fill(_e, ve) : new Uint16Array(B.buffer, ve, 2 * Ce).fill(_e);
    const Ft = h ? "I420P10" : l ? "I420P12" : "I420", Wt = new VideoFrame(s.subarray(0, _), {
      format: k,
      codedWidth: c,
      codedHeight: d,
      timestamp: a.timestamp,
      duration: a.duration ?? void 0
    }), zt = {
      format: Ft,
      codedWidth: c,
      codedHeight: d,
      timestamp: a.timestamp,
      duration: a.duration ?? void 0,
      transfer: [B.buffer]
    }, It = new VideoFrame(B, zt);
    return { colorFrame: Wt, alphaFrame: It };
  };
};
class pr extends xt {
  /**
   * Creates a new {@link CanvasSource} from a canvas element or `OffscreenCanvas` whose samples are encoded
   * according to the specified {@link VideoEncodingConfig}.
   */
  constructor(e, i) {
    if (!(typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement) && !(typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas))
      throw new TypeError("canvas must be an HTMLCanvasElement or OffscreenCanvas.");
    qi(i), super(i.codec), this._encoder = new nr(this, i), this._canvas = e;
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
  add(e, i = 0, r) {
    if (!Number.isFinite(e) || e < 0)
      throw new TypeError("timestamp must be a non-negative number.");
    if (!Number.isFinite(i) || i < 0)
      throw new TypeError("duration must be a non-negative number.");
    const n = new v(this._canvas, { timestamp: e, duration: i });
    return this._encoder.add(n, !0, r);
  }
  /** @internal */
  _flushAndClose(e) {
    return this._encoder.flushAndClose(e);
  }
}
class ar extends Te {
  /** Internal constructor. */
  constructor(e) {
    if (super(), this._connectedTrack = null, !K.includes(e))
      throw new TypeError(`Invalid audio codec '${e}'. Must be one of: ${K.join(", ")}.`);
    this._codec = e;
  }
}
class cr extends Te {
  /** Internal constructor. */
  constructor(e) {
    if (super(), this._connectedTrack = null, !U.includes(e))
      throw new TypeError(`Invalid subtitle codec '${e}'. Must be one of: ${U.join(", ")}.`);
    this._codec = e;
  }
}
class Pt {
  /** Returns a list of video codecs that this output format can contain. */
  getSupportedVideoCodecs() {
    return this.getSupportedCodecs().filter((e) => V.includes(e));
  }
  /** Returns a list of audio codecs that this output format can contain. */
  getSupportedAudioCodecs() {
    return this.getSupportedCodecs().filter((e) => K.includes(e));
  }
  /** Returns a list of subtitle codecs that this output format can contain. */
  getSupportedSubtitleCodecs() {
    return this.getSupportedCodecs().filter((e) => U.includes(e));
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
class rt extends Pt {
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
    return new tr(e, this);
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
      ...V,
      ...pt,
      ...W.filter((e) => !["pcm-s8", "pcm-f32be", "pcm-f64be", "ulaw", "alaw"].includes(e)),
      ...U
    ];
  }
  get supportsVideoRotationMetadata() {
    return !1;
  }
  get supportsTimestampedMediaData() {
    return !0;
  }
}
class nt extends rt {
  /** Creates a new {@link WebMOutputFormat} configured with the specified `options`. */
  constructor(e) {
    super(e);
  }
  getSupportedCodecs() {
    return [
      ...V.filter((e) => ["vp8", "vp9", "av1"].includes(e)),
      ...K.filter((e) => ["opus", "vorbis"].includes(e)),
      ...U
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
    return new rt().getSupportedCodecs().includes(e) ? " Switching to MKV will grant support for this codec." : "";
  }
}
const st = ["video", "audio", "subtitle"];
class Q {
  /** @internal */
  constructor(e, i, r, n, s) {
    this.id = e, this.output = i, this.type = r, this.source = n, this.metadata = s;
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
    if (!(e instanceof Q))
      throw new TypeError("other must be an OutputTrack.");
    if (this === e)
      return !1;
    const i = Re(this.metadata.group), r = Re(e.metadata.group);
    for (const n of i)
      if (this.type !== e.type && r.some((a) => n === a) || r.some((a) => n._pairedGroups.has(a)))
        return !0;
    return !1;
  }
}
class dr extends Q {
  /** @internal */
  constructor(e, i, r, n) {
    super(e, i, "video", r, n);
  }
}
class hr extends Q {
  /** @internal */
  constructor(e, i, r, n) {
    super(e, i, "audio", r, n);
  }
}
class ur extends Q {
  /** @internal */
  constructor(e, i, r, n) {
    super(e, i, "subtitle", r, n);
  }
}
class $ {
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
    if (!(e instanceof $))
      throw new TypeError("other must be an OutputTrackGroup.");
    if (this === e)
      throw new TypeError("Cannot pair a group with itself.");
    this._pairedGroups.add(e), e._pairedGroups.add(this);
  }
}
const ce = (t) => {
  if (!t || typeof t != "object")
    throw new TypeError("metadata must be an object.");
  if (t.languageCode !== void 0 && !jt(t.languageCode))
    throw new TypeError("metadata.languageCode, when provided, must be a three-letter, ISO 639-2/T language code.");
  if (t.name !== void 0 && typeof t.name != "string")
    throw new TypeError("metadata.name, when provided, must be a string.");
  if (t.disposition !== void 0 && ri(t.disposition), t.maximumPacketCount !== void 0 && (!Number.isInteger(t.maximumPacketCount) || t.maximumPacketCount < 0))
    throw new TypeError("metadata.maximumPacketCount, when provided, must be a non-negative integer.");
  if (t.group !== void 0 && !(t.group instanceof $) && (!Array.isArray(t.group) || t.group.some((e) => !(e instanceof $))))
    throw new TypeError("metadata.group, when provided, must be an OutputTrackGroup instance or an array of OutputTrackGroup instances.");
};
class wr extends ye {
  /**
   * The target to which the root file will be written. Throws when using {@link PathedTarget} with an async callback;
   * prefer the `'target'` event for those cases.
   */
  get target() {
    const e = "Output.target cannot be used when using PathedTarget with an async callback. Use the 'target' event instead.";
    if (this._rootTargetPromise)
      throw new TypeError(e);
    const i = this._getRootTarget();
    if (i instanceof Promise)
      throw new TypeError(e);
    return i;
  }
  /**
   * Creates a new instance of {@link Output} which can then be used to create a new media file according to the
   * specified {@link OutputOptions}.
   */
  constructor(e) {
    if (super(), this.state = "pending", this.defaultTrackGroup = new $(), this.tracks = [], this._onFinalize = null, this._unfinalizedTargets = /* @__PURE__ */ new Set(), this._rootWriterPromise = null, this._startPromise = null, this._cancelPromise = null, this._finalizePromise = null, this._mutex = new ct(), this._metadataTags = {}, this._rootTarget = null, this._rootTargetPromise = null, this._firstMediaStreamTimestamp = null, !e || typeof e != "object")
      throw new TypeError("options must be an object.");
    if (!(e.format instanceof Pt))
      throw new TypeError("options.format must be an OutputFormat.");
    if (!(e.target instanceof P || e.target instanceof oe))
      throw new TypeError("options.target must be a Target or a PathedTarget.");
    if (e.target instanceof P && this._rememberTarget(e.target), e.initTarget !== void 0 && !(e.initTarget instanceof P) && typeof e.initTarget != "function")
      throw new Error("options.initTarget, when provided, must be a Target or a function that returns or resolves to a Target.");
    if (e.onFinalize !== void 0 && typeof e.onFinalize != "function")
      throw new TypeError("options.onFinalize, when provided, must be a function.");
    this.format = e.format, this._target = e.target, this._onFinalize = e.onFinalize ?? null, this._initTarget = e.initTarget ?? null, this._initTarget instanceof P && this._rememberTarget(this._initTarget), this._muxer = e.format._createMuxer(this);
  }
  /** @internal */
  _getTargetValidated(e) {
    w(this._target instanceof oe);
    const i = this._target.getTarget(e), r = (n) => {
      if (!(n instanceof P))
        throw new TypeError("getTarget must return a Target.");
      return n;
    };
    return i instanceof Promise ? i.then(r) : r(i);
  }
  /** @internal */
  async _getTarget(e) {
    w(this._target instanceof oe);
    const i = await this._getTargetValidated(e);
    return this._emit("target", { target: i, request: e, isRoot: e.isRoot }), this.state === "canceled" ? await i._close() : this._rememberTarget(i), i;
  }
  /** @internal */
  _rememberTarget(e) {
    this._unfinalizedTargets.add(e), e.on("finalized", () => this._unfinalizedTargets.delete(e), { once: !0 });
  }
  /** @internal */
  async _getInitTarget() {
    if (w(this._initTarget !== null), this._initTarget instanceof P)
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
    if (this._target instanceof P)
      return this._emit("target", { target: this._target, request: null, isRoot: !0 }), this._rootTarget = this._target, this._target;
    const e = {
      path: this._target.rootPath,
      isRoot: !0,
      mimeType: this.format.mimeType
    }, i = this._getTargetValidated(e), r = (n) => (this.state === "canceled" ? n._close() : this._rememberTarget(n), this._emit("target", { target: n, request: e, isRoot: !0 }), this._rootTarget = n, n);
    return i instanceof Promise ? this._rootTargetPromise = i.then(r) : r(i);
  }
  /** @internal */
  _getRootWriter(e) {
    return this._rootWriterPromise ??= (async () => {
      const i = await this._getRootTarget(), r = new Li(i, typeof e == "boolean" ? e : e(i));
      return r.start(), r;
    })();
  }
  /** Adds a video track to the output with the given source. Can only be called before the output is started. */
  addVideoTrack(e, i = {}) {
    if (!(e instanceof xt))
      throw new TypeError("source must be a VideoSource.");
    if (ce(i), i.rotation !== void 0 && ![0, 90, 180, 270].includes(i.rotation))
      throw new TypeError(`Invalid video rotation: ${i.rotation}. Has to be 0, 90, 180 or 270.`);
    if (!this.format.supportsVideoRotationMetadata && i.rotation)
      throw new Error(`${this.format._name} does not support video rotation metadata.`);
    if (i.frameRate !== void 0 && (!Number.isFinite(i.frameRate) || i.frameRate <= 0))
      throw new TypeError(`Invalid video frame rate: ${i.frameRate}. Must be a positive number.`);
    if (i.decoderConfig !== void 0 && gt({ decoderConfig: i.decoderConfig }, e._codec), i.primingPacket !== void 0) {
      if (!(i.primingPacket instanceof z))
        throw new TypeError("metadata.primingPacket, when provided, must be an EncodedPacket.");
      if (i.decoderConfig === void 0)
        throw new TypeError("metadata.primingPacket can only be provided alongside metadata.decoderConfig.");
    }
    const r = { ...i };
    return r.group ??= this.defaultTrackGroup, this._addTrack(new dr(this.tracks.length + 1, this, e, r));
  }
  /** Adds an audio track to the output with the given source. Can only be called before the output is started. */
  addAudioTrack(e, i = {}) {
    if (!(e instanceof ar))
      throw new TypeError("source must be an AudioSource.");
    if (ce(i), i.decoderConfig !== void 0 && yt({ decoderConfig: i.decoderConfig }, e._codec), i.primingPacket !== void 0) {
      if (!(i.primingPacket instanceof z))
        throw new TypeError("metadata.primingPacket, when provided, must be an EncodedPacket.");
      if (i.decoderConfig === void 0)
        throw new TypeError("metadata.primingPacket can only be provided alongside metadata.decoderConfig.");
    }
    const r = { ...i };
    return r.group ??= this.defaultTrackGroup, this._addTrack(new hr(this.tracks.length + 1, this, e, r));
  }
  /** Adds a subtitle track to the output with the given source. Can only be called before the output is started. */
  addSubtitleTrack(e, i = {}) {
    if (!(e instanceof cr))
      throw new TypeError("source must be a SubtitleSource.");
    ce(i);
    const r = { ...i };
    return r.group ??= this.defaultTrackGroup, this._addTrack(new ur(this.tracks.length + 1, this, e, r));
  }
  /**
   * Sets descriptive metadata tags about the media file, such as title, author, date, or cover art. When called
   * multiple times, only the metadata from the last call will be used.
   *
   * Can only be called before the output is started.
   */
  setMetadataTags(e) {
    if (ii(e), this.state !== "pending")
      throw new Error("Cannot set metadata tags after output has been started or canceled.");
    this._metadataTags = e;
  }
  /** @internal */
  _addTrack(e) {
    if (this.state !== "pending")
      throw new Error("Cannot add track after output has been started or canceled.");
    if (e.source._connectedTrack)
      throw new Error("Source is already used for a track.");
    const i = this.format.getSupportedTrackCounts(), r = this.tracks.reduce((o, a) => o + (a.type === e.type ? 1 : 0), 0), n = i[e.type].max;
    if (r === n)
      throw new Error(n === 0 ? `${this.format._name} does not support ${e.type} tracks.` : `${this.format._name} does not support more than ${n} ${e.type} track${n === 1 ? "" : "s"}.`);
    const s = i.total.max;
    if (this.tracks.length === s)
      throw new Error(`${this.format._name} does not support more than ${s} tracks${s === 1 ? "" : "s"} in total.`);
    if (e.isVideoTrack()) {
      const o = this.format.getSupportedVideoCodecs();
      if (o.length === 0)
        throw new Error(`${this.format._name} does not support video tracks.` + this.format._codecUnsupportedHint(e.source._codec));
      if (!o.includes(e.source._codec))
        throw new Error(`Codec '${e.source._codec}' cannot be contained within ${this.format._name}. Supported video codecs are: ${o.map((a) => `'${a}'`).join(", ")}.` + this.format._codecUnsupportedHint(e.source._codec));
    } else if (e.isAudioTrack()) {
      const o = this.format.getSupportedAudioCodecs();
      if (o.length === 0)
        throw new Error(`${this.format._name} does not support audio tracks.` + this.format._codecUnsupportedHint(e.source._codec));
      if (!o.includes(e.source._codec))
        throw new Error(`Codec '${e.source._codec}' cannot be contained within ${this.format._name}. Supported audio codecs are: ${o.map((a) => `'${a}'`).join(", ")}.` + this.format._codecUnsupportedHint(e.source._codec));
    } else if (e.isSubtitleTrack()) {
      const o = this.format.getSupportedSubtitleCodecs();
      if (o.length === 0)
        throw new Error(`${this.format._name} does not support subtitle tracks.` + this.format._codecUnsupportedHint(e.source._codec));
      if (!o.includes(e.source._codec))
        throw new Error(`Codec '${e.source._codec}' cannot be contained within ${this.format._name}. Supported subtitle codecs are: ${o.map((a) => `'${a}'`).join(", ")}.` + this.format._codecUnsupportedHint(e.source._codec));
    }
    return this.tracks.push(e), e.source._connectedTrack = e, e;
  }
  /**
   * Whether the output has enough tracks (of the correct type) to be started, based on the requirements of the output
   * format.
   */
  hasEnoughTracks() {
    const e = this.format.getSupportedTrackCounts();
    for (const r of st) {
      const n = this.tracks.reduce((o, a) => o + (a.type === r ? 1 : 0), 0), s = e[r].min;
      if (n < s)
        return !1;
    }
    const i = e.total.min;
    return !(this.tracks.length < i);
  }
  /**
   * Starts the creation of the output file. This method should be called after all tracks have been added. Only after
   * the output has started can media samples be added to the tracks.
   *
   * @returns A promise that resolves when the output has successfully started and is ready to receive media samples.
   */
  async start() {
    const e = this.format.getSupportedTrackCounts();
    for (const r of st) {
      const n = this.tracks.reduce((o, a) => o + (a.type === r ? 1 : 0), 0), s = e[r].min;
      if (n < s)
        throw new Error(s === e[r].max ? `${this.format._name} requires exactly ${s} ${r} track${s === 1 ? "" : "s"}.` : `${this.format._name} requires at least ${s} ${r} track${s === 1 ? "" : "s"}.`);
    }
    const i = e.total.min;
    if (this.tracks.length < i)
      throw new Error(i === e.total.max ? `${this.format._name} requires exactly ${i} track${i === 1 ? "" : "s"}.` : `${this.format._name} requires at least ${i} track${i === 1 ? "" : "s"}.`);
    if (this.state === "canceled")
      throw new Error("Output has been canceled.");
    return this._startPromise ? (E._warn("Output has already been started."), this._startPromise) : this._startPromise = (async () => {
      this.state = "started";
      const r = this._mutex.acquire();
      try {
        await this._muxer.start();
        const n = this.tracks.map((s) => s.source._start());
        await Promise.all(n);
      } finally {
        (await r)();
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
      return E._warn("Output has already been canceled."), this._cancelPromise;
    if (this.state === "finalizing" || this.state === "finalized") {
      this.state === "finalized" && E._warn("Output has already been finalized.");
      return;
    }
    return this._cancelPromise = (async () => {
      this.state = "canceled";
      const e = await this._mutex.acquire();
      try {
        const i = this.tracks.map((r) => r.source._flushOrWaitForOngoingClose(!0));
        await Promise.all(i), await Promise.all([...this._unfinalizedTargets].map((r) => r._close())), this._unfinalizedTargets.clear();
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
    return this._finalizePromise ? (E._warn("Output has already been finalized."), this._finalizePromise) : this._finalizePromise = (async () => {
      this.state = "finalizing";
      const e = await this._mutex.acquire();
      try {
        const i = this.tracks.map((r) => r.source._flushOrWaitForOngoingClose(!1));
        if (await Promise.all(i), await this._muxer.finalize(), this._rootWriterPromise) {
          const r = await this._rootWriterPromise;
          r.finalized || (await r.flush(), await r.finalize());
        }
        this._onFinalize && await this._onFinalize(), this.state = "finalized";
      } finally {
        await Promise.all([...this._unfinalizedTargets].map((i) => i._close().catch(() => {
        }))), this._unfinalizedTargets.clear(), e();
      }
    })();
  }
}
export {
  mr as B,
  pr as C,
  wr as O,
  F as Q,
  nt as W,
  fr as c
};
