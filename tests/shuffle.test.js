/*
 * Tarot 13 — shuffle audit test.  Run with:  node tests/shuffle.test.js
 *
 * Uses the exact same src/secure-shuffle.js that is built into index.html.
 * Checks:
 *   1. every shuffle keeps exactly 78 unique cards
 *   2. a dealt spread never repeats a card
 *   3. every card lands in every position equally often
 *      (chi-square test on the full 78 x 78 card-by-position table)
 *   4. the first card dealt is uniform across all 78 cards
 *   5. secureRandomInt is uniform for a range that does not divide 2^32
 */
const { secureShuffle, dealFromTop, secureRandomInt, RNG_SOURCE } = require('../src/secure-shuffle.js');

const N = 78, RUNS = Number(process.env.RUNS || 200000);
let failures = 0;
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failures++; };

// chi-square critical value (p = 0.001) via Wilson–Hilferty approximation
function chiCrit(df, z = 3.090) { return df * Math.pow(1 - 2 / (9 * df) + z * Math.sqrt(2 / (9 * df)), 3); }

console.log(`Random source: ${RNG_SOURCE}`);
console.log(`Shuffles: ${RUNS.toLocaleString()}\n`);

const base = Array.from({ length: N }, (_, i) => i);
const table = Array.from({ length: N }, () => new Uint32Array(N));   // table[card][position]
let allValid = true, spreadsValid = true;

for (let r = 0; r < RUNS; r++) {
  const d = secureShuffle(base);
  if (d.length !== N || new Set(d).size !== N) allValid = false;
  for (let pos = 0; pos < N; pos++) table[d[pos]][pos]++;
  if (r < 20000) { const hand = dealFromTop(d, 13); if (new Set(hand).size !== 13) spreadsValid = false; }
}
check(allValid, 'every shuffle contains exactly 78 unique cards');
check(spreadsValid, 'dealt spreads never repeat a card (20,000 thirteen-card spreads)');

// 3. full card x position uniformity
const expected = RUNS / N;
let chi = 0;
for (let c = 0; c < N; c++) for (let p = 0; p < N; p++) chi += (table[c][p] - expected) ** 2 / expected;
const df = (N - 1) * (N - 1), crit = chiCrit(df);
check(chi < crit, `card-by-position uniformity: chi² = ${chi.toFixed(1)} (df ${df}, limit ${crit.toFixed(1)} at p = 0.001)`);

// 4. top card uniformity
let chiTop = 0;
for (let c = 0; c < N; c++) chiTop += (table[c][0] - expected) ** 2 / expected;
const critTop = chiCrit(N - 1);
const tops = Array.from({ length: N }, (_, c) => table[c][0]);
check(chiTop < critTop, `first card dealt is uniform: chi² = ${chiTop.toFixed(1)} (limit ${critTop.toFixed(1)}); each card seen ${Math.min(...tops)}–${Math.max(...tops)} times, expected ${expected.toFixed(0)}`);

// 5. integer generator, with a range that doesn't divide 2^32 evenly
const K = 77, M = 770000, counts = new Uint32Array(K);
for (let i = 0; i < M; i++) counts[secureRandomInt(K)]++;
let chiInt = 0; const e = M / K;
for (const v of counts) chiInt += (v - e) ** 2 / e;
check(chiInt < chiCrit(K - 1), `secureRandomInt(77) is uniform: chi² = ${chiInt.toFixed(1)} (limit ${chiCrit(K - 1).toFixed(1)})`);

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);
