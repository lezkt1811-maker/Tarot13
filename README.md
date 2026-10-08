# ✦ Tarot 13 ✦

**A neon + gold celestial tarot deck.** 78 cards mapped to the night sky (planets, zodiac signs, and constellations), drawn as glowing star maps on deep black with gold filigree.

> Mockup preview: open [`mockups/index.html`](mockups/index.html), or turn on GitHub Pages to view it online.

---

## The deck at a glance

| Part | Cards | Sky mapping |
|---|---|---|
| **Major Arcana** | 22 | The 10 planets/luminaries and the 12 zodiac constellations |
| **Pips (Ace–9)** | 36 | Extra-zodiacal constellations (e.g. Five of Cups = **Ophiuchus**, the 13th sign) |
| **Tens** | 4 | Raw elemental force: Fire, Water, Air, Earth |
| **Court cards** | 16 | Princess = season · Prince = mutable sign · Queen = fixed sign · King = cardinal sign |

### Suits
| Suit | Element | Neon glow |
|---|---|---|
| Wands | Fire | Magenta `#FF2ED1` |
| Cups | Water | Cyan `#22D3EE` |
| Swords | Air | Electric blue `#2563FF` |
| Pentacles | Earth | Violet `#A855F7` (with gold coins) |
| Major Arcana | Spirit | Full blue→magenta gradient + gold glyph |

The full card-by-card list is in [`data/cards.csv`](data/cards.csv), [`data/cards.json`](data/cards.json), and the editable spreadsheet [`data/Tarot-13_Master_List.xlsx`](data/Tarot-13_Master_List.xlsx).

---

## Repository layout

```
art/
  backs/       card-back designs (card-back-v1.webp)
  major/       22 Major Arcana finals
  wands/  cups/  swords/  pentacles/   pip cards Ace–10
  courts/      16 court cards
data/          master card list (CSV, JSON, XLSX)
design/        style guide: palette, frame, typography
mockups/       early HTML/SVG mockups (The Fool + card back)
```

### File naming
Use lowercase with dashes, zero-padded so files sort in deck order:

- Majors: `art/major/00-the-fool.png`, `art/major/13-death.png`, `art/major/21-the-world.png`
- Pips: `art/cups/05-five-of-cups.png`
- Courts: `art/courts/wands-queen.png`

---

## Progress

- [x] Framework and 78-card correspondence list
- [x] Style direction (BlueNeon palette + gold)
- [x] Card back v1
- [x] The Fool mockup
- [ ] Final card frame template
- [ ] 22 Major Arcana
- [ ] 40 pips
- [ ] 16 courts
- [ ] Guidebook text
- [ ] Print-ready files (300 DPI + bleed)

## Open questions
- **Swords courts:** sources list Queen = Libra and King = Aquarius, which breaks the fixed/cardinal pattern of the other suits. These may be swapped. Verify against the guidebook.
- **Nine of Pentacles:** lists Pegasus/Equuleus, but Pegasus is also the Ace of Cups.
- **Card back v1:** fix the stray ♀ and duplicated Sagittarius glyph in the zodiac ring.

---

## Credits & rights
The astrological correspondence framework follows the tradition used in *Celestial Tarot* (Kay Steventon & Brian Clark, U.S. Games Systems). **All artwork, card designs, and text in this repository are original to Tarot 13.**

© 2026 lezkt1811-maker. All rights reserved. Artwork may not be reproduced or sold without permission.
