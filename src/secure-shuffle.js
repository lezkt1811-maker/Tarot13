/*
 * Tarot 13 — secure-shuffle.js
 * ------------------------------------------------------------------
 * THIS FILE IS THE ONLY CODE THAT DECIDES WHICH CARDS APPEAR.
 *
 * It is copied verbatim into index.html at build time (see
 * tools/build.py) and is the same file the test in tests/ runs.
 *
 * What it does:
 *   1. secureRandomInt(n)  -> an unbiased integer 0..n-1 from the
 *      platform's cryptographic random number generator
 *      (crypto.getRandomValues), using rejection sampling so no
 *      value is more likely than another (no modulo bias).
 *   2. secureShuffle(deck) -> a standard Fisher–Yates shuffle of the
 *      WHOLE deck. Every one of the 78! orderings is equally likely,
 *      so every card has an equal 1/78 chance of every position.
 *   3. dealFromTop(deck, n) -> the first n cards of the shuffled deck.
 *      Positions are distinct, so a spread never repeats a card
 *      (dealing without replacement).
 *
 * What it does NOT do: there are no weights, no seeds, no memory of
 * past readings, no knowledge of the question, the spread, astrology,
 * Ophiuchus or card meanings, and no re-shuffling until a "desired"
 * result appears. Cards are chosen first; interpretation happens
 * afterwards and cannot change which cards were dealt.
 */

const SECURE_RNG = (typeof globalThis !== 'undefined' && globalThis.crypto &&
                    typeof globalThis.crypto.getRandomValues === 'function')
  ? globalThis.crypto : null;

const RNG_SOURCE = SECURE_RNG ? 'crypto.getRandomValues (cryptographically secure)'
                              : 'UNAVAILABLE: this browser has no secure random generator';

/* Unbiased integer in [0, n) using rejection sampling on 32-bit values. */
function secureRandomInt(n) {
  if (!SECURE_RNG) throw new Error('No cryptographically secure random generator available');
  if (!Number.isInteger(n) || n < 1 || n > 0x100000000) throw new RangeError('n out of range');
  const limit = Math.floor(0x100000000 / n) * n;   // largest multiple of n that fits in 2^32
  const buf = new Uint32Array(1);
  let x;
  do { SECURE_RNG.getRandomValues(buf); x = buf[0]; } while (x >= limit);  // reject the biased tail
  return x % n;
}

/* Standard Fisher–Yates (Durstenfeld) shuffle. Returns a new array; the input is not modified. */
function secureShuffle(deck) {
  const a = deck.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);              // 0 <= j <= i, uniform
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

/* Deal n cards from the top of an already-shuffled deck (no replacement). */
function dealFromTop(deck, n) {
  if (n > deck.length) throw new RangeError('Not enough cards to deal');
  return deck.slice(0, n);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { secureRandomInt, secureShuffle, dealFromTop, RNG_SOURCE };
}
