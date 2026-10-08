# Tarot 13 — working notes

## Layout
- `src/secure-shuffle.js` — the only card-randomization code. Edit it here, never in `index.html`.
- `src/app-template.html` — app markup/CSS/JS template. Contains placeholders `/*__SECURE_SHUFFLE__*/`, `"__BACK__"`, `__CARDS__`.
- `index.html` — **generated**. Do not hand-edit; run the build.
- `data/cards.json` — source of truth for the 78 cards (`cards.csv` and the `.xlsx` are companions).
- `tests/shuffle.test.js` — shuffle audit (uniformity, no repeats, five styles).
- `docs/` — Deck Bible, spreads, randomness. `design/` — style guide.

## Commands
- Build `index.html`: `python3 tools/build.py`
- Shuffle tests (full, ~several minutes): `node tests/shuffle.test.js`
- Quick shuffle tests: `RUNS=20000 STYLE_RUNS=6000 node tests/shuffle.test.js` (~20 s)
- Syntax check the shuffle module: `node --check src/secure-shuffle.js`

## Rules
- After changing `src/` or `data/cards.json`, rebuild and commit the regenerated `index.html` together with the source change. `git status` should show no drift after a rebuild.
- Run the shuffle tests after any change to `src/secure-shuffle.js`.
- Keep the deck at exactly 78 cards (the build asserts this).
- Reversals are not part of the design: readings are upright-only.
