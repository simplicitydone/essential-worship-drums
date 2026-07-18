# EWD Data Contract

The shape the content-authoring workflow produces and the seed script consumes.
All prose is **bilingual**: `*` = English (primary), `*Kr` = Korean (secondary).

## GrooveGrid timing model

A **pattern** (groove / fill / worship demo / song template) is a loop:

- `beats` — quarter-note beats in the loop (usually 4; 6/8 ballad uses 2).
- `subdivision` — steps per beat: `2` eighths, `3` triplet/compound, `4` sixteenths.
- `totalSteps = beats * subdivision`. Every lane array **must** have this length.
- step duration seconds = `(60 / bpm) / subdivision`.

### Kit lanes (fixed ids, top→bottom render order)
`CR` crash · `RD` ride · `OH` open hi-hat · `HH` closed hi-hat · `T1` high tom ·
`T2` mid tom · `FT` floor tom · `SN` snare · `KK` kick.
A pattern lists only the lanes it uses in `lanes`, and provides a same-length
array per used lane in `grid`.

### Cell values
`0` rest · `1` hit · `2` accent (louder) · `3` ghost note (very soft, snare).
Open vs closed hat = use the `OH` vs `HH` lane (not a value).

### Anchor example (basic 8-beat, beats=4, subdivision=2 → 8 steps)
```
count: "1 & 2 & 3 & 4 &"
HH: [1,1,1,1,1,1,1,1]
SN: [0,0,1,0,0,0,1,0]   // backbeat on 2 and 4
KK: [1,0,0,0,1,0,0,0]   // on 1 and 3
```

## Objects

- **lesson** (Basics + Worship prose): `id, section('basics'|'worship'), title,
  titleKr, order, body, bodyKr, keyPoints[], keyPointsKr[], diagram(named SVG|null),
  patternRef(pattern id|null)`.
- **pattern**: `id, section('grooves'|'fills'|'worship'|'songs'), name, nameKr,
  tier('Basic'|'Advanced'), bpm, beats, subdivision, lanes[], grid{lane:int[]},
  count, sticking(string[]|null), description, descriptionKr, howTo`.
- **rudiment**: `id, name, nameKr, sticking(('R'|'L'|'r'|'l')[]), notation,
  description, descriptionKr, application`.
- **quiz item**: `question, questionKr, answer, answerKr`.
- **glossary item**: `term, termKr, definition, definitionKr`.

Named diagrams the frontend can render: `grip-matched`, `grip-fulcrum`,
`stroke-motion`, `kit`, `counting`, `null`.
