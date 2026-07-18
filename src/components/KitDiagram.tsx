// Schematic SVG diagrams referenced by Basics/Worship lessons (lesson.diagram).
// Simple, theme-aware line art — instructional, not photorealistic.

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <figure className="diagram">
      <svg viewBox="0 0 340 260" role="img" aria-label={label} className="diagram__svg">
        {children}
      </svg>
    </figure>
  )
}

// Bird's-eye view of a worship-friendly 5-piece setup around the player.
function Kit() {
  const piece = (cx: number, cy: number, rx: number, ry: number, txt: string) => (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="dg-drum" />
      <text x={cx} y={cy + 4} className="dg-lbl" textAnchor="middle">
        {txt}
      </text>
    </g>
  )
  const cym = (cx: number, cy: number, r: number, txt: string) => (
    <g>
      <circle cx={cx} cy={cy} r={r} className="dg-cym" />
      <text x={cx} y={cy + 4} className="dg-lbl" textAnchor="middle">
        {txt}
      </text>
    </g>
  )
  return (
    <Frame label="Bird's-eye view of a five-piece drum kit around the player">
      {/* player / throne */}
      <circle cx={170} cy={232} r={16} className="dg-throne" />
      <text x={170} y={236} className="dg-lbl" textAnchor="middle">
        You
      </text>
      {/* snare in front of the player */}
      {piece(170, 178, 26, 20, 'Snare')}
      {/* kick straight ahead */}
      {piece(170, 122, 30, 22, 'Kick')}
      {/* rack toms over the kick */}
      {piece(138, 92, 20, 15, 'T1')}
      {piece(196, 90, 22, 16, 'T2')}
      {/* floor tom to the right */}
      {piece(258, 150, 26, 20, 'Floor')}
      {/* hi-hat to the left */}
      {cym(96, 150, 22, 'Hats')}
      {/* crash upper-left, ride upper-right */}
      {cym(96, 74, 26, 'Crash')}
      {cym(262, 88, 28, 'Ride')}
    </Frame>
  )
}

// Matched grip: stick balanced across the hand, fulcrum near the butt third.
function GripMatched() {
  return (
    <Frame label="Matched grip with the fulcrum about a third from the butt of the stick">
      <line x1={40} y1={150} x2={300} y2={110} className="dg-stick" />
      {/* butt end */}
      <circle cx={40} cy={150} r={7} className="dg-tip" />
      <text x={40} y={176} className="dg-lbl" textAnchor="middle">
        Butt
      </text>
      {/* tip end */}
      <circle cx={300} cy={110} r={5} className="dg-tip" />
      <text x={300} y={98} className="dg-lbl" textAnchor="middle">
        Tip
      </text>
      {/* fulcrum ~1/3 from butt */}
      <circle cx={112} cy={139} r={16} className="dg-accent-ring" />
      <text x={112} y={186} className="dg-lbl" textAnchor="middle">
        Fulcrum (~⅓)
      </text>
      <text x={200} y={200} className="dg-note" textAnchor="middle">
        Thumb + index pinch here · other fingers wrap loosely
      </text>
    </Frame>
  )
}

// Close-up of the fulcrum pivot: thumb pad against the side of the index finger.
function GripFulcrum() {
  return (
    <Frame label="Fulcrum close-up: the stick pivots between the thumb pad and index finger">
      <line x1={50} y1={130} x2={300} y2={130} className="dg-stick" />
      <circle cx={300} cy={130} r={5} className="dg-tip" />
      {/* thumb */}
      <path d="M150 96 q20 20 20 34" className="dg-finger" />
      <text x={150} y={88} className="dg-lbl" textAnchor="middle">
        Thumb
      </text>
      {/* index */}
      <path d="M150 164 q22 -18 24 -34" className="dg-finger" />
      <text x={150} y={182} className="dg-lbl" textAnchor="middle">
        Index
      </text>
      <circle cx={166} cy={130} r={13} className="dg-accent-ring" />
      <text x={210} y={112} className="dg-note" textAnchor="middle">
        Pivot point — let the stick rock
      </text>
    </Frame>
  )
}

// The stroke: drop, strike, and let it rebound back up.
function StrokeMotion() {
  return (
    <Frame label="The drum stroke: drop, strike, and let the stick rebound">
      <line x1={60} y1={200} x2={280} y2={200} className="dg-surface" />
      <text x={170} y={222} className="dg-lbl" textAnchor="middle">
        Drum head
      </text>
      {/* up position */}
      <line x1={90} y1={200} x2={70} y2={70} className="dg-stick" />
      <text x={64} y={60} className="dg-lbl" textAnchor="middle">
        Up
      </text>
      {/* down / strike */}
      <line x1={170} y1={200} x2={175} y2={120} className="dg-stick dg-stick--strike" />
      <text x={175} y={110} className="dg-lbl" textAnchor="middle">
        Strike
      </text>
      {/* rebound arrow */}
      <path d="M175 118 q60 -40 95 -58" className="dg-arrow" markerEnd="url(#arrow)" />
      <text x={252} y={78} className="dg-note" textAnchor="middle">
        Let it bounce
      </text>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 z" className="dg-arrowhead" />
        </marker>
      </defs>
    </Frame>
  )
}

// Subdivision ruler: one beat split into quarter / eighth / sixteenth.
function Counting() {
  const cols = ['1', 'e', '&', 'a', '2', 'e', '&', 'a', '3', 'e', '&', 'a', '4', 'e', '&', 'a']
  const x0 = 20
  const w = 300 / cols.length
  return (
    <Frame label="Counting subdivisions: quarters, eighths and sixteenths across four beats">
      <line x1={x0} y1={150} x2={x0 + 300} y2={150} className="dg-surface" />
      {cols.map((c, i) => {
        const x = x0 + i * w + w / 2
        const beat = i % 4 === 0
        const eighth = i % 2 === 0
        return (
          <g key={i}>
            <line
              x1={x}
              y1={150}
              x2={x}
              y2={beat ? 108 : eighth ? 124 : 136}
              className={beat ? 'dg-tick dg-tick--beat' : 'dg-tick'}
            />
            <text
              x={x}
              y={170}
              className={beat ? 'dg-lbl dg-lbl--beat' : 'dg-lbl'}
              textAnchor="middle"
            >
              {c}
            </text>
          </g>
        )
      })}
      <text x={x0 + 150} y={96} className="dg-note" textAnchor="middle">
        Tall = beat (1 2 3 4) · mid = &amp; (eighths) · short = e a (sixteenths)
      </text>
    </Frame>
  )
}

export function KitDiagram({ name }: { name: string }) {
  switch (name) {
    case 'kit':
      return <Kit />
    case 'grip-matched':
      return <GripMatched />
    case 'grip-fulcrum':
      return <GripFulcrum />
    case 'stroke-motion':
      return <StrokeMotion />
    case 'counting':
      return <Counting />
    default:
      return null
  }
}
