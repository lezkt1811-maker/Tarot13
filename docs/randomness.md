# Tarot 13 — How the shuffle works (audit guide)

The Tarot 13 app is a **true random shuffler**. Cards are chosen by an unbiased, cryptographically secure shuffle first. The reading is written afterwards and cannot change which cards were dealt.

## The rules

- The deck always contains exactly **78 cards**. The app refuses to run otherwise.
- Every shuffle is a standard **Fisher–Yates shuffle of all 78 cards**, driven by the browser's cryptographic random number generator, `crypto.getRandomValues()`.
- Every card has an equal **1/78 chance of every position**. All 78! orderings are equally likely.
- A spread shuffles the full deck **once**, then deals the requested number of cards **from the top, without replacement**. Cards are never generated one at a time.
- Each new reading starts from a **new shuffle**. If you draw without pressing a shuffle button, the app shuffles all 78 cards once automatically first.
- The five shuffle styles (Riffle, Overhand, Wash, Three-Pile Cut, 13-Pile Deal) are **animations only**. Each runs the same secure shuffle.

**Nothing influences which cards appear:** there is no card weighting, no favoring or avoiding of cards, no memory of recent or past readings, no use of your question, the spread, astrology, zodiac signs, Ophiuchus or celestial correspondences, no AI selection, no seed or predictable sequence, and no re-shuffling until a "desired" combination appears.

## Where the randomization happens

All card-randomization code lives in one short file, [`src/secure-shuffle.js`](../src/secure-shuffle.js). The build step (`tools/build.py`) copies it verbatim into `index.html`, and the test suite runs the same file.

| What | `src/secure-shuffle.js` | `index.html` |
|---|---|---|
| `secureRandomInt(n)`: unbiased integer from `crypto.getRandomValues`, with rejection sampling to remove modulo bias | line 36 | line 320 |
| The secure random draw itself (`getRandomValues`) | line 42 | line 326 |
| `secureShuffle(deck)`: Fisher–Yates over the whole deck | line 47 | line 331 |
| The swap index `j = secureRandomInt(i + 1)` | line 50 | line 334 |
| `dealFromTop(deck, n)`: deal without replacement | line 57 | line 341 |

How the app uses it (in `index.html`, from [`src/app-template.html`](../src/app-template.html)):

| What | `index.html` |
|---|---|
| `fresh()`: a new deck of the 78 cards, flagged as needing a shuffle | line 358 |
| `shuffleWholeDeck()`: calls `secureShuffle` and checks that 78 unique cards remain | line 364 |
| Shuffle buttons: every style calls the same `shuffleWholeDeck()` | line 412 |
| `drawSpread()`: **1. randomize** (auto-shuffle if needed) → **2. deal** → **3. interpret** | lines 553–560 |

Line numbers are for the current build. Search for the function names if they shift.

The only other use of randomness in the page is `Math.random()` in the background glitter animation. It is labeled *visual only* in the code and never touches the cards. The shuffle animations themselves use no randomness at all.

## The code

```js
function secureRandomInt(n) {
  const limit = Math.floor(0x100000000 / n) * n;   // largest multiple of n that fits in 2^32
  const buf = new Uint32Array(1);
  let x;
  do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);  // reject the biased tail
  return x % n;
}

function secureShuffle(deck) {
  const a = deck.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);              // 0 <= j <= i, uniform
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}
```

## Verify it yourself

```
node tests/shuffle.test.js
```

The test runs 200,000 shuffles of the real shuffle code and checks that every shuffle keeps 78 unique cards, that spreads never repeat a card, and that every card lands in every position equally often (chi-square test on the full 78 × 78 table). Latest result:

```
Random source: crypto.getRandomValues (cryptographically secure)
Shuffles: 200,000

PASS  every shuffle contains exactly 78 unique cards
PASS  dealt spreads never repeat a card (20,000 thirteen-card spreads)
PASS  card-by-position uniformity: chi² = 6127.6 (df 5929, limit 6271.2 at p = 0.001)
PASS  first card dealt is uniform: chi² = 90.2 (limit 121.2); each card seen 2428–2696 times, expected 2564
PASS  secureRandomInt(77) is uniform: chi² = 72.1 (limit 119.9)

All checks passed.
```

Your numbers will differ every run, because the shuffle is truly random.

## After the cards are dealt

Only then does the reading happen. The upright-only reader looks at the dealt cards, their positions and your question to decide which aspect of each card comes forward. It has no way to change, add or remove cards.
