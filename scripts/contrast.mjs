#!/usr/bin/env node
/* Every text role in both palettes against every background it sits on,
   scored the WCAG way. The palette says "measured, not guessed"; this is the
   measuring. Fails if any pairing is under 4.5:1. */
import { LIGHT, DARK, TEXT_ON } from "../src/palette.js";

const channel = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
};

let failures = 0;
for (const [name, palette] of [["light", LIGHT], ["dark", DARK]]) {
  console.log(`--- ${name} ---`);
  for (const [text, backgrounds] of Object.entries(TEXT_ON)) {
    const cells = backgrounds.map((bg) => {
      const r = ratio(palette[text], palette[bg]);
      if (r < 4.5) failures += 1;
      return `${bg} ${r.toFixed(2)}${r < 4.5 ? " ✗" : ""}`;
    });
    console.log(`${text.padEnd(12)} ${cells.join("   ")}`);
  }
}
console.log(failures ? `${failures} pairing(s) under 4.5:1` : "every text role clears 4.5:1 on every background it sits on");
process.exit(failures ? 1 : 0);
