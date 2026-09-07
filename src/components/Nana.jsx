import { C } from "../palette.js";

/* ---------- Nana Purl herself ----------
   No default for `label` on purpose: every call site passes t("nana.alt"), and
   a hardcoded English fallback would let a future call site quietly ship an
   English aria-label to a Spanish screen reader instead of failing in review. */
export function Nana({ size = 150, bob = true, label }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 210"
      role="img"
      aria-label={label}
      className={bob ? "nk-bob" : ""}
    >
      {/* cardigan body */}
      <path
        d="M52 208 L52 152 Q52 122 100 122 Q148 122 148 152 L148 208 Z"
        fill={C.sage}
      />
      {/* collar */}
      <path d="M84 124 L100 146 L116 124 Q100 132 84 124 Z" fill={C.oat} />
      {/* buttons */}
      <circle cx="100" cy="154" r="3" fill={C.butter} />
      <circle cx="100" cy="168" r="3" fill={C.butter} />
      {/* bun */}
      <circle cx="100" cy="34" r="21" fill={C.hair} />
      <path
        d="M84 30 Q100 20 116 30"
        stroke="#B9AFA8"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* knitting needle through the bun */}
      <line x1="66" y1="20" x2="134" y2="36" stroke={C.butter} strokeWidth="4" strokeLinecap="round" />
      <circle cx="64" cy="19.5" r="4.5" fill={C.roseDark} />
      {/* hair */}
      <circle cx="100" cy="76" r="47" fill={C.hair} />
      {/* face */}
      <circle cx="100" cy="82" r="38" fill={C.skin} />
      {/* glasses */}
      <circle cx="83" cy="80" r="12.5" fill="none" stroke="#8A5A44" strokeWidth="3" />
      <circle cx="117" cy="80" r="12.5" fill="none" stroke="#8A5A44" strokeWidth="3" />
      <line x1="95.5" y1="80" x2="104.5" y2="80" stroke="#8A5A44" strokeWidth="3" />
      {/* eyes */}
      <circle cx="83" cy="81" r="3.4" fill={C.espresso} />
      <circle cx="117" cy="81" r="3.4" fill={C.espresso} />
      {/* cheeks */}
      <circle cx="68" cy="96" r="6" fill={C.cheek} opacity="0.8" />
      <circle cx="132" cy="96" r="6" fill={C.cheek} opacity="0.8" />
      {/* smile */}
      <path
        d="M88 101 Q100 111 112 101"
        stroke={C.espresso}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* arms */}
      <path
        d="M56 150 Q60 176 82 182"
        stroke={C.sageDark}
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M144 150 Q140 176 118 182"
        stroke={C.sageDark}
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      {/* yarn ball */}
      <circle cx="100" cy="180" r="21" fill={C.rose} />
      <path d="M81 174 Q100 166 119 174" stroke={C.roseDark} strokeWidth="2.5" fill="none" />
      <path d="M80 184 Q100 176 120 184" stroke={C.roseDark} strokeWidth="2.5" fill="none" />
      <path d="M84 192 Q100 186 116 192" stroke={C.roseDark} strokeWidth="2.5" fill="none" />
      {/* loose yarn tail */}
      <path
        d="M120 186 Q140 192 146 204"
        stroke={C.rose}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* hands */}
      <circle cx="82" cy="181" r="8.5" fill={C.skin} />
      <circle cx="118" cy="181" r="8.5" fill={C.skin} />
    </svg>
  );
}
