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
 *   3. shuffleInStyle(deck, style) -> one of the five shuffle styles
 *      (riffle, overhand, wash, three-pile cut, 13-pile deal). Each
 *      performs its own moves with secure randomness, on top of a full
 *      Fisher–Yates mix, so every style is still completely random.
 *   4. dealFromTop(deck, n) -> the first n cards of the shuffled deck.
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

/* ------------------------------------------------------------------
 * THE FIVE SHUFFLE STYLES — each one moves the cards in its own way,
 * and every random choice it makes comes from secureRandomInt.
 *
 * Every style also includes a full Fisher–Yates mix (secureShuffle).
 * That is what guarantees the result is completely random: each card
 * keeps an equal 1/78 chance of every position no matter which style
 * you pick. The style's own moves are then performed on top, so each
 * style really handles the deck differently.
 * ------------------------------------------------------------------ */

/* Riffle: cut near the middle, then let cards fall from the two halves,
   interleaving them (Gilbert–Shannon–Reeds model). */
function riffleMoves(deck) {
  let cutAt = 0;
  for (let i = 0; i < deck.length; i++) cutAt += secureRandomInt(2);    // binomial cut near the middle
  let left = deck.slice(0, cutAt), right = deck.slice(cutAt);
  const out = [];
  while (left.length || right.length) {
    // a card drops from a half in proportion to how many cards it holds
    if (secureRandomInt(left.length + right.length) < left.length) out.push(left.shift());
    else out.push(right.shift());
  }
  return out;
}

/* Overhand: take small packets (1–8 cards) off the top and drop each
   one on top of the growing pile in the other hand. */
function overhandMoves(deck) {
  const src = deck.slice();
  let out = [];
  while (src.length) {
    const packet = src.splice(0, Math.min(src.length, 1 + secureRandomInt(8)));
    out = packet.concat(out);
  }
  return out;
}

/* Wash: the cards are swirled face-down across the table and gathered —
   a complete mix, which is exactly a Fisher–Yates shuffle. */
function washMoves(deck) {
  return secureShuffle(deck);
}

/* Three-pile cut: cut the deck at two random points into three piles,
   then restack the piles in a random order. */
function threePileCutMoves(deck) {
  const n = deck.length;
  const a = 1 + secureRandomInt(n - 2);              // first cut: 1..n-2
  const b = a + 1 + secureRandomInt(n - a - 1);      // second cut: a+1..n-1
  const piles = [deck.slice(0, a), deck.slice(a, b), deck.slice(b)];
  return secureShuffle([0, 1, 2]).flatMap(p => piles[p]);
}

/* 13-pile deal: deal the deck one card at a time into 13 piles,
   then gather the piles in a random order. */
function thirteenPileMoves(deck) {
  const piles = Array.from({ length: 13 }, () => []);
  deck.forEach((card, i) => piles[i % 13].unshift(card));
  return secureShuffle([...Array(13).keys()]).flatMap(p => piles[p]);
}

const STYLE_MOVES = {
  riffle: d => riffleMoves(riffleMoves(riffleMoves(d))),   // three riffles, like a real riffle shuffle
  overhand: overhandMoves,
  wash: washMoves,
  cut: threePileCutMoves,
  pile: thirteenPileMoves
};

/* Shuffle in a chosen style: a full Fisher–Yates mix plus that style's own moves. */
function shuffleInStyle(deck, style) {
  const moves = STYLE_MOVES[style];
  if (!moves) throw new Error('Unknown shuffle style: ' + style);
  return moves(secureShuffle(deck));
}

/* Deal n cards from the top of an already-shuffled deck (no replacement). */
function dealFromTop(deck, n) {
  if (n > deck.length) throw new RangeError('Not enough cards to deal');
  return deck.slice(0, n);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { secureRandomInt, secureShuffle, shuffleInStyle, STYLE_MOVES, dealFromTop, RNG_SOURCE };
}
