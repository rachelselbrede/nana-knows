import { ART } from "../palette.js";

/* ---------- tiny granny square icon ---------- */
export function GrannySquare({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="4" fill={ART.butter} />
      <rect x="5" y="5" width="14" height="14" rx="3" fill={ART.sage} />
      <rect x="9" y="9" width="6" height="6" rx="2" fill={ART.rose} />
      <circle cx="12" cy="12" r="1.4" fill={ART.card} />
    </svg>
  );
}
