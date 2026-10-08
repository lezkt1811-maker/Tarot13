"""Build index.html from src/app-template.html.

Inlines, verbatim:
  - src/secure-shuffle.js   (the ONLY card-randomization code; also used by tests/)
  - data/cards.json         (the 78 cards)
  - src/card-back-small.jpg (card back image)

Usage:  python3 tools/build.py [extra-output-path]
"""
import base64, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
t = (ROOT / 'src/app-template.html').read_text()
shuffle_js = (ROOT / 'src/secure-shuffle.js').read_text()
rows = json.loads((ROOT / 'data/cards.json').read_text())
assert len(rows) == 78, 'deck must contain exactly 78 cards'

cards = [{k: r[k] for k in ("arcana", "number", "card", "correspondence", "keywords", "theme", "core_meaning")} for r in rows]
for c in cards:
    c['correspondence'] = re.sub('⛎(?!︎)', '⛎︎', c['correspondence'])
back = base64.b64encode((ROOT / 'src/card-back-small.jpg').read_bytes()).decode()

assert t.count('/*__SECURE_SHUFFLE__*/') == 1
page = (t.replace('/*__SECURE_SHUFFLE__*/', shuffle_js)
         .replace('"__BACK__"', json.dumps("data:image/jpeg;base64," + back))
         .replace('__CARDS__', json.dumps(cards, ensure_ascii=False)))

head = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        '<link rel="icon" href="favicon.ico" sizes="any">\n<link rel="icon" type="image/svg+xml" href="icons/icon.svg">\n'
        '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n<link rel="manifest" href="manifest.json">\n'
        '<meta name="theme-color" content="#000000">\n')
(ROOT / 'index.html').write_text(head + page.replace('</style>', '</style>\n</head><body>', 1) + '\n</body></html>')
if len(sys.argv) > 1:
    Path(sys.argv[1]).write_text(page)   # body-only copy for the claude.ai artifact
print('built index.html')
