// Detecting text that was written as UTF-8 and then read back as Latin-1/CP1252.
//
// That mistake always produces a *pair* of characters: a lead in U+00C2..U+00F4
// (the first UTF-8 byte) followed by a continuation that came from a 0x80-0xBF
// byte. CP1252 remaps 0x80-0x9F to punctuation, so those forms are listed too.
//
// The earlier rule matched a lone lead character, which flagged every
// legitimate "â", "à" or "ç". "câblez" is French, not mojibake -- and that false
// positive failed the whole frontend CI job.

/** Characters a 0x80-0xBF byte can decode to under Latin-1 or CP1252. */
const CONTINUATION =
  "- -¿" +
  "ŒœŠšŸŽžƒˆ˜" +
  "–—‘’‚“”„" +
  "†‡•…‰‹›€™";

export const MOJIBAKE_PATTERN = new RegExp(
  // a lead+continuation pair, a stray replacement character, or a C1 control
  `[\\u00c2-\\u00f4][${CONTINUATION}]|\\ufffd|[\\u0080-\\u009f]`,
  "u",
);

/** True when `text` contains a sequence that can only be a decoding mistake. */
export function looksLikeMojibake(text) {
  return MOJIBAKE_PATTERN.test(String(text));
}

/** Produce the mojibake a given string turns into. Used by the tests. */
export function toMojibake(text) {
  return Buffer.from(text, "utf8").toString("latin1");
}
