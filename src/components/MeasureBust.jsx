import { C } from "../palette.js";

/* ---------- how-to-measure diagram ----------
   A flat-lay cabled sweater — crew neck, sleeves laid at an angle the way a
   sweater actually sits on a table, ribbed hem and cuffs — with a soft tape
   measure crossing the bust from side seam to side seam. The tape overhangs
   each edge a touch and ends in its metal tab, so it reads as wrapping round
   to the back rather than lying on top. Same flat, rounded art as Nana. */

/* One cable column: two strands weaving around each other, six crossings tall.
   Written as a loop because three hand-transcribed braids would be ninety
   coordinates nobody could ever safely retouch. Each curve segment ends going
   straight down, so the strands stay smooth where the segments meet. */
const cablePath = (cx) => {
  const L = cx - 3.5;
  const R = cx + 3.5;
  let a = `M ${L} 44`;
  let b = `M ${R} 44`;
  for (let y = 44; y < 116; y += 12) {
    const leftToRight = ((y - 44) / 12) % 2 === 0;
    const [from, to] = leftToRight ? [L, R] : [R, L];
    a += ` C ${from} ${y + 5}, ${to} ${y + 7}, ${to} ${y + 12}`;
    b += ` C ${to} ${y + 5}, ${from} ${y + 7}, ${from} ${y + 12}`;
  }
  return `${a} ${b}`;
};

export function MeasureBust({ size = 132, label }) {
  return (
    <svg
      width={size}
      height={size * 1.07}
      viewBox="0 0 140 150"
      role="img"
      aria-label={label}
    >
      {/* sweater body + sleeves, the sleeves curving gently steeper as they
          fall so they run long beside the body instead of stopping at the ribs */}
      <path
        d="M56 28 L38 34 Q12 62 5 106 L20 114 Q24 82 35 62 L35 134 L105 134 L105 62 Q116 82 120 114 L135 106 Q128 62 102 34 L84 28 Q70 40 56 28 Z"
        fill={C.sage}
        stroke={C.sageDark}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* three cable columns down the front; the tape lies over their middle */}
      <path
        d={[52, 70, 88].map(cablePath).join(" ")}
        fill="none"
        stroke={C.sageDark}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* ribbed crew neckline */}
      <path d="M56 28 Q70 40 84 28" fill="none" stroke={C.oat} strokeWidth="5" strokeLinecap="round" />
      <path d="M56 28 Q70 40 84 28" fill="none" stroke={C.sageDark} strokeWidth="1.5" strokeLinecap="round" />
      {/* ribbed hem */}
      <path d="M37 123 L103 123" stroke={C.sageDark} strokeWidth="2.5" strokeLinecap="round" />
      <g stroke={C.sageDark} strokeWidth="1.4" strokeLinecap="round" opacity="0.65">
        <line x1="45" y1="126.5" x2="45" y2="131.5" />
        <line x1="55" y1="126.5" x2="55" y2="131.5" />
        <line x1="65" y1="126.5" x2="65" y2="131.5" />
        <line x1="75" y1="126.5" x2="75" y2="131.5" />
        <line x1="85" y1="126.5" x2="85" y2="131.5" />
        <line x1="95" y1="126.5" x2="95" y2="131.5" />
      </g>
      {/* ribbed cuffs */}
      <path d="M6 100.5 L21 108.5" stroke={C.sageDark} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M134 100.5 L119 108.5" stroke={C.sageDark} strokeWidth="2.5" strokeLinecap="round" />

      {/* tape measure across the bust, side seam to side seam and a little past */}
      <path
        d="M32 68 Q70 76 108 68 L108 78 Q70 86 32 78 Z"
        fill={C.rose}
        stroke={C.roseDark}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* measurement ticks, following the tape's sag */}
      <g stroke={C.oat} strokeWidth="1.5" strokeLinecap="round">
        <line x1="42" y1="72.3" x2="42" y2="77.8" />
        <line x1="52" y1="73.6" x2="52" y2="79.1" />
        <line x1="62" y1="74.3" x2="62" y2="79.8" />
        <line x1="72" y1="74.5" x2="72" y2="80" />
        <line x1="82" y1="74.1" x2="82" y2="79.6" />
        <line x1="92" y1="73.2" x2="92" y2="78.7" />
      </g>
      {/* metal tab capping the tape's end, tilted to match its slope */}
      <rect x="102" y="67.5" width="8" height="11" rx="1.5" fill={C.roseDark} transform="rotate(-12 106 73)" />
    </svg>
  );
}
