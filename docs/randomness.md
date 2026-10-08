# Tarot 13 — How the shuffle works (audit guide)

The Tarot 13 app is a **true random shuffler** with **five different shuffle styles**. Cards are chosen by secure randomness first; the reading is written afterwards and cannot change which cards were dealt.

## The rules

- The deck always contains exactly **78 cards**. The app refuses to run otherwise.
- Every random choice comes from the browser's cryptographic random number generator, `crypto.getRandomValues()`, through one unbiased function, `secureRandomInt`.
- **Each shuffle style moves the cards in its own way:**

  | Style | What it does to the deck |
  |---|---|
  | **Riffle** | Cuts near the middle, then interleaves the two halves as the cards fall (three riffles) |
  | **Overhand** | Takes packets of 1–8 cards off the top and drops each on top of the other hand's pile |
  | **Wash** | Swirls every card across the table and gathers them: a complete mix |
  | **Three-Pile Cut** | Cuts at two random points into three piles and restacks them in a random order |
  | **13-Pile Deal** | Deals the cards one by one into 13 piles and gathers the piles in a random order |

- **Every style also includes a full Fisher–Yates shuffle of all 78 cards.** That is what guarantees the deck ends up completely random: whichever style you use, every card has an equal **1/78 chance of every position**.
- A spread deals the requested number of cards **from the top of the shuffled deck, without replacement**. Cards are never generated one at a time.
- Each new reading needs a **new shuffle**. If you draw without shuffling, the app shuffles all 78 cards once automatically first.

**Nothing influences which cards appear:** no card weighting, no favoring or avoiding cards, no memory of recent or past readings, no use of your question, the spread, astrology, zodiac signs, Ophiuchus or celestial correspondences, no AI selection, no seed or predictable sequence, and no re-shuffling until a "desired" combination appears.

## Where the randomization happens

All card-randomization code is in one file, [`src/secure-shuffle.js`](../src/secure-shuffle.js). The build step (`tools/build.py`) copies it word for word into `index.html`, and the test runs the same file.

| What | `src/secure-shuffle.js` | `index.html` |
|---|---|---|
| `secureRandomInt(n)`: unbiased integer from `crypto.getRandomValues` (rejection sampling removes modulo bias) | line 40 | line 325 |
| `secureShuffle(deck)`: Fisher–Yates over the whole deck | line 51 | line 336 |
| `riffleMoves`: the riffle | line 73 | line 358 |
| `overhandMoves`: the overhand | line 88 | line 373 |
| `washMoves`: the wash | line 100 | line 385 |
| `threePileCutMoves`: the three-pile cut | line 106 | line 391 |
| `thirteenPileMoves`: the 13-pile deal | line 116 | line 401 |
| `shuffleInStyle(deck, style)`: Fisher–Yates mix, then the style's own moves | line 131 | line 416 |
| `dealFromTop(deck, n)`: deal without replacement | line 138 | line 423 |

How the app uses it (`index.html`, built from [`src/app-template.html`](../src/app-template.html)):

| What | `index.html` |
|---|---|
| `shuffleWholeDeck(style)`: runs the style (or a plain Fisher–Yates for an automatic shuffle) and checks 78 unique cards remain | line 447 |
| Shuffle buttons: `shuffleWholeDeck(m)` with the button's style | line 495 |
| `drawSpread()`: **1. randomize** (auto-shuffle if needed) → **2. deal** → **3. interpret** | lines 636–643 |

Line numbers are for the current build. Search for the function names if they shift.

The only other randomness in the page is `Math.random()` in the background glitter animation. It is labeled *visual only* in the code and never touches the cards. The shuffle animations use no randomness.

## Verify it yourself

```
node tests/shuffle.test.js
```

Latest result:

```
Random source: crypto.getRandomValues (cryptographically secure)
Shuffles: 100,000

PASS  every shuffle contains exactly 78 unique cards
PASS  dealt spreads never repeat a card (20,000 thirteen-card spreads)
PASS  card-by-position uniformity: chi² = 5915.6 (df 5929, limit 6271.2 at p = 0.001)
PASS  first card dealt is uniform: chi² = 69.3 (limit 121.2); each card seen 1174–1351 times, expected 1282
PASS  secureRandomInt(77) is uniform: chi² = 82.7 (limit 119.9)

Shuffle styles (60,000 shuffles each):
PASS  riffle   78 unique cards; uniform: chi² = 6098.5 (limit 6271.2)
PASS  overhand 78 unique cards; uniform: chi² = 6027.6 (limit 6271.2)
PASS  wash     78 unique cards; uniform: chi² = 6112.6 (limit 6271.2)
PASS  cut      78 unique cards; uniform: chi² = 6101.9 (limit 6271.2)
PASS  pile     78 unique cards; uniform: chi² = 6033.0 (limit 6271.2)

Style mechanics on an unshuffled deck (one pass of each style's own moves):
  riffle   cards still next to their original neighbour: 9.7 of 77
  overhand cards still next to their original neighbour: 60.2 of 77
  wash     cards still next to their original neighbour: 1.0 of 77
  cut      cards still next to their original neighbour: 75.7 of 77
  pile     cards still next to their original neighbour: 0.0 of 77
PASS  the five styles move cards in measurably different ways

All checks passed.
```

The last block shows the styles really are different: started from an unshuffled deck, a cut keeps almost every card beside its neighbour, an overhand keeps most, a riffle breaks most pairs, and the wash and 13-pile deal break nearly all. Your numbers will differ on every run, because the shuffle is truly random.

## After the cards are dealt

Only then does the reading happen. The upright-only reader looks at the dealt cards, their positions and your question to decide which aspect of each card comes forward. It has no way to change, add or remove cards.
