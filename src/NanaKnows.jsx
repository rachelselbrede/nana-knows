import { useState, useEffect, useRef } from "react";
import { useI18n } from "./i18n/index.jsx";
import {
  parseNumberList,
  parseList,
  parseOne,
  convertOne,
  convertList,
  inchesToCm,
  cmToInches,
  yardsToMetres,
  metresToYards,
  gaugePer4inToPer10cm,
  gaugePer10cmToPer4in,
  swatchToGauge,
  gramsToSkeins,
  r1,
} from "./lib/parse.js";
import { adviseSize, adviseYarn, adviseGauge, adviseRows, sizeTable } from "./lib/advice.js";

/* ---------- Nana's palette ---------- */
const C = {
  oat: "#FBF6EC",
  card: "#FFFDF9",
  rose: "#D4718C",
  roseDark: "#AF546F",
  sage: "#7E9B76",
  sageDark: "#5C7956",
  butter: "#E9B44C",
  espresso: "#3E2F25",
  line: "#E4D5C3",
  skin: "#F6D7BD",
  hair: "#CFC6C0",
  cheek: "#F2AAB2",
};

/* Parsing, unit conversion and all of Nana's arithmetic now live in src/lib,
   where they are pure and covered by tests. See src/lib/parse.js for why the
   comma is such hard work, and src/lib/advice.js for the sizing maths. */

/* The project fields Nana can carry in a shared link, keyed short to keep
   URLs tidy. Everything stays client-side: the link itself is the storage. */
const SHARE_TEXT_KEYS = {
  pg: "patternGauge",
  prg: "patternRowGauge",
  s: "sizesText",
  y: "yardsText",
  b: "bust",
  mg: "myGauge",
  mrg: "myRowGauge",
  ps: "perSkein",
  sk: "skeins",
};

/* Only these params mean "someone shared a project". Anything else — a
   ?fbclid=, a ?utm_source= stuck on by whichever platform relayed the link —
   must not be allowed to talk Nana out of opening her notebook. */
const SHARE_KEYS = new Set(["u", "c", "e", ...Object.keys(SHARE_TEXT_KEYS)]);

/* A shared link is untrusted text. React escapes it, so the risk was never
   injection — it was a 50 kB ?b= value pasted into a field and rendered. A
   dozen sizes with spaces run to about 70 characters; nothing honest is
   longer than this. */
const MAX_PARAM = 120;

const hasSharedParams = () => {
  try {
    const p = new URLSearchParams(window.location.search);
    return [...p.keys()].some((k) => SHARE_KEYS.has(k));
  } catch (e) {
    return false;
  }
};

/* ---------- tiny granny square icon ---------- */
function GrannySquare({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="4" fill={C.butter} />
      <rect x="5" y="5" width="14" height="14" rx="3" fill={C.sage} />
      <rect x="9" y="9" width="6" height="6" rx="2" fill={C.rose} />
      <circle cx="12" cy="12" r="1.4" fill={C.card} />
    </svg>
  );
}

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

function MeasureBust({ size = 132, label }) {
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

/* ---------- Nana Purl herself ----------
   No default for `label` on purpose: every call site passes t("nana.alt"), and
   a hardcoded English fallback would let a future call site quietly ship an
   English aria-label to a Spanish screen reader instead of failing in review. */
function Nana({ size = 150, bob = true, label }) {
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

/* ---------- advice card ---------- */
function AdviceCard({ color, title, children, tone }) {
  return (
    <div
      className="rounded-2xl overflow-hidden nk-pop"
      style={{ background: C.card, border: `2px dashed ${C.line}` }}
    >
      <div style={{ height: 8, background: color }} />
      <div className="p-4 sm:p-5">
        <h3
          className="mb-2 text-base font-bold"
          style={{ fontFamily: "'Fraunces', serif", color: C.espresso }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: tone === "warn" ? C.roseDark : "#5C4B3E" }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

/* ---------- shared small pieces ----------
   These live at module scope on purpose. Defined inside the component they
   would be a brand-new component type every render, so React would tear down
   and rebuild their DOM instead of updating it — which threw keyboard focus
   off the craft and unit toggles the moment they were pressed. */

/* aria-pressed matters here: the only other clue that you are in crochet
   rather than knitting mode is the pink fill, which a screen reader cannot
   see and a colour-blind visitor may not distinguish. */
const Toggle = ({ value, current, set, children }) => (
  <button
    type="button"
    onClick={() => set(value)}
    aria-pressed={current === value}
    className="nk-focus px-3 py-1.5 text-sm font-bold rounded-full transition-colors"
    style={{
      fontFamily: "'Nunito', sans-serif",
      background: current === value ? C.rose : "transparent",
      color: current === value ? "#FFF" : C.roseDark,
      border: `2px solid ${current === value ? C.rose : C.line}`,
    }}
  >
    {children}
  </button>
);

/* Show the knitter what Nana made of her typing. Commas and dashes are
   genuinely ambiguous — "32,36" could be two sizes or one odd decimal — and
   no heuristic gets every case. Echoing the reading back turns a wrong guess
   into something visible and correctable, which is worth more than a cleverer
   guess would be. The span stays in the tree even when quiet, so the status
   region exists before it has anything to announce, and the input points at it
   with aria-describedby instead of swallowing it into its own label. */
const ParseEcho = ({ id, text, t }) => {
  const { values, issues } = parseNumberList(text);
  const quiet = values.length === 0 || (values.length === 1 && issues.length === 0);
  return (
    <span id={id} role="status" className="text-xs" style={{ color: C.sageDark }}>
      {quiet
        ? ""
        : t("echo.read", { list: values.join(", ") }) +
          issues.map((i) => t(`echo.${i}`)).join("")}
    </span>
  );
};

/* ---------- the app ---------- */
export default function NanaKnows() {
  const { t, lang, setLang } = useI18n();
  /* Spanish visitors start in metric; the unit toggle still works either way,
     and a saved notebook (below) overrides this default. */
  const [units, setUnits] = useState(lang === "es" ? "cm" : "in");
  const [craft, setCraft] = useState("knit");

  const [patternGauge, setPatternGauge] = useState("");
  const [patternRowGauge, setPatternRowGauge] = useState("");
  const [sizesText, setSizesText] = useState("");
  const [yardsText, setYardsText] = useState("");

  const [bust, setBust] = useState("");
  const [easeIdx, setEaseIdx] = useState(2);
  const [myGauge, setMyGauge] = useState("");
  const [myRowGauge, setMyRowGauge] = useState("");

  /* The swatch helper's scratch fields. Never saved, never shared: they are
     the working-out, and the two gauge fields above are the answer. */
  const [swatchSts, setSwatchSts] = useState("");
  const [swatchAcross, setSwatchAcross] = useState("");
  const [swatchRows, setSwatchRows] = useState("");
  const [swatchTall, setSwatchTall] = useState("");
  const [swatchUsed, setSwatchUsed] = useState(false);
  /* The weighing helper's scratch, likewise. */
  const [weighSkein, setWeighSkein] = useState("");
  const [weighHave, setWeighHave] = useState("");
  const [weighUsed, setWeighUsed] = useState(false);

  const [perSkein, setPerSkein] = useState("");
  const [skeins, setSkeins] = useState("");

  /* `results` holds numbers and decision kinds, never finished sentences. The
     wording is produced during render, so switching language or craft after
     asking re-words Nana's advice instead of stranding it in the old one. */
  const [results, setResults] = useState(null);
  const [proverbIdx, setProverbIdx] = useState(0);
  const [saveMsg, setSaveMsg] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [pendingAutoRun, setPendingAutoRun] = useState(false);
  /* Counts asks, so the status line is re-inserted — and so re-announced —
     even when two asks in a row produce the very same sentence. */
  const [askCount, setAskCount] = useState(0);
  const resultsRef = useRef(null);
  const headingRef = useRef(null);

  const inch = units === "in";
  const lenU = inch ? "in" : "cm";
  const yarnU = inch ? "yds" : "m";
  const gaugeLabel = t("label.gaugeLabel", { inch });
  const rowGaugeLabel = t("label.rowGaugeLabel", { inch });
  /* The swatch both gauges are quoted over: 4 in, or 10 cm. */
  const swatchSpan = inch ? 4 : 10;

  /* Flipping units has to carry the numbers over, or a 38 in bust silently
     becomes a 38 cm one and Nana confidently recommends the wrong size.
     Gauge moves too: the label changes from "per 4 in" to "per 10 cm", and
     those are not the same swatch (4 in is 10.16 cm), so the number owes the
     knitter the same courtesy as every other field. */
  const switchUnits = (next) => {
    if (next === units) return;
    const toMetric = next === "cm";
    const len = toMetric ? inchesToCm : cmToInches;
    const yarn = toMetric ? yardsToMetres : metresToYards;
    const gauge = toMetric ? gaugePer4inToPer10cm : gaugePer10cmToPer4in;
    setSizesText(convertList(sizesText, len));
    setYardsText(convertList(yardsText, yarn));
    setBust(convertOne(bust, len));
    setPerSkein(convertOne(perSkein, yarn));
    setPatternGauge(convertOne(patternGauge, gauge));
    setMyGauge(convertOne(myGauge, gauge));
    setPatternRowGauge(convertOne(patternRowGauge, gauge));
    setMyRowGauge(convertOne(myRowGauge, gauge));
    /* The helper's widths are lengths; its counts are just counts. */
    setSwatchAcross(convertOne(swatchAcross, len));
    setSwatchTall(convertOne(swatchTall, len));
    setResults(null); // old advice is in the old units
    setUnits(next);
    /* Say so. Eight fields just changed and the advice vanished; to a screen
       reader, and to anyone glancing away, that was silence. */
    setSaveMsg(next === "cm" ? "save.redoneCm" : "save.redoneIn");
  };

  const ph = t("ph", { inch });

  /* Labels come from the dictionary; the ease values stay here since they are
     arithmetic, not text. */
  const easeValues = inch ? [-2, 0, 2, 4, 6] : [-5, 0, 5, 10, 15];
  const easeOptions = t("ease.labels", { inch }).map((label, i) => ({
    label,
    v: easeValues[i],
  }));

  const proverbs = t(craft === "knit" ? "proverbs.knit" : "proverbs.crochet");

  /* load Nana's notebook if it exists (stored only in this browser).
     A shared link takes precedence, so skip the saved notebook when one is
     present rather than mixing someone else's numbers with your own.

     Nothing in the notebook is taken on trust: it may have been written by an
     older version of the app, or by a hand in the browser console. An easeIdx
     of 7 would send askNana past the end of the ease list and kill the button;
     a units value that is neither "in" nor "cm" would leave the toggle
     unselected and run conversions from a nonsense baseline. The shared-link
     loader below has always validated; this now matches it. */
  useEffect(() => {
    if (hasSharedParams()) return;
    try {
      const saved = localStorage.getItem("nana-notebook");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.units === "in" || d.units === "cm") setUnits(d.units);
        if (d.craft === "knit" || d.craft === "crochet") setCraft(d.craft);
        if (d.bust) setBust(String(d.bust));
        if (Number.isInteger(d.easeIdx) && d.easeIdx >= 0 && d.easeIdx <= 4) {
          setEaseIdx(d.easeIdx);
        }
        if (d.myGauge) setMyGauge(String(d.myGauge));
        if (d.myRowGauge) setMyRowGauge(String(d.myRowGauge));
        if (d.perSkein) setPerSkein(String(d.perSkein));
        if (d.skeins) setSkeins(String(d.skeins));
        setSaveMsg("save.remembered");
      }
    } catch (e) {
      /* nothing saved yet, and that is fine */
    }
  }, []);

  /* Fill the form from a shared link, if one brought us here. When it carries
     enough to compute (sizes + measurement), ask Nana straight away so the
     visitor lands on her advice. */
  useEffect(() => {
    try {
      if (!hasSharedParams()) return;
      const p = new URLSearchParams(window.location.search);
      if (p.get("u")) setUnits(p.get("u") === "cm" ? "cm" : "in");
      if (p.get("c")) setCraft(p.get("c") === "crochet" ? "crochet" : "knit");
      if (p.get("e") != null && p.get("e") !== "") {
        const e = Number(p.get("e"));
        if (Number.isInteger(e) && e >= 0 && e <= 4) setEaseIdx(e);
      }
      const setter = {
        patternGauge: setPatternGauge,
        patternRowGauge: setPatternRowGauge,
        sizesText: setSizesText,
        yardsText: setYardsText,
        bust: setBust,
        myGauge: setMyGauge,
        myRowGauge: setMyRowGauge,
        perSkein: setPerSkein,
        skeins: setSkeins,
      };
      Object.entries(SHARE_TEXT_KEYS).forEach(([key, field]) => {
        const v = p.get(key);
        if (v != null && v !== "") setter[field](v.slice(0, MAX_PARAM));
      });
      if (p.get("s") && p.get("b")) setPendingAutoRun(true);
    } catch (e) {
      /* malformed link; leave the form blank */
    }
  }, []);

  const rememberMe = () => {
    try {
      localStorage.setItem(
        "nana-notebook",
        JSON.stringify({ units, craft, bust, easeIdx, myGauge, myRowGauge, perSkein, skeins })
      );
      setSaveMsg("save.written");
    } catch (e) {
      setSaveMsg("save.notHandy");
    }
  };

  /* Build a link that carries the current inputs. Always includes the
     language: it used to be copied from the URL, which only has ?lang once the
     toggle has been clicked — so a Spanish speaker whose language came from
     her browser shared links that opened in English. The i18n hook knows the
     real answer however it was chosen. Units and craft ride along too, so
     numbers are never misread, and empty fields are skipped. */
  const buildShareUrl = () => {
    const url = new URL(window.location.href);
    const fresh = new URLSearchParams();
    fresh.set("lang", lang);
    fresh.set("u", units);
    fresh.set("c", craft);
    if (easeIdx !== 2) fresh.set("e", String(easeIdx));
    const values = {
      pg: patternGauge,
      prg: patternRowGauge,
      s: sizesText,
      y: yardsText,
      b: bust,
      mg: myGauge,
      mrg: myRowGauge,
      ps: perSkein,
      sk: skeins,
    };
    Object.entries(values).forEach(([k, v]) => {
      if (v != null && String(v).trim() !== "") fresh.set(k, v);
    });
    url.search = fresh.toString();
    return url.toString();
  };

  const shareLink = async () => {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setSaveMsg("share.copied");
    } catch (e) {
      /* No clipboard access: drop the link in the address bar to copy by hand. */
      try {
        window.history.replaceState({}, "", url);
      } catch (_) {
        /* ignore */
      }
      setSaveMsg("share.failed");
    }
  };

  const forgetMe = () => {
    try {
      localStorage.removeItem("nana-notebook");
    } catch (e) {
      /* ignore */
    }
    setSaveMsg("save.forgotten");
  };

  /* Turn the four advice cards into plain text Nana's visitor can paste into a
     Ravelry project note. Built from the same messages shown on screen. */
  const copyAdvice = async () => {
    if (!results || results.error) return;
    const text = [
      t("copy.heading"),
      "",
      /* The dictionary owns the quotation marks: Spanish advice gets its
         guillemets in the pasted text, same as on screen. */
      proverb ? t("copy.proverb", { proverb }) : "",
      "",
      t("advice.size"),
      sizeText(),
      "",
      t("advice.yarn"),
      yarnText(),
      "",
      t("advice.tension"),
      gaugeText(),
      "",
      t("advice.length"),
      rowText(),
      /* The table travels too, one size per line, so the whole decision goes
         into the project notes and not just the winner. */
      ...(results.table
        ? ["", t("table.title"), ...results.table.rows.map(tableLine)]
        : []),
    ]
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg("copy.done");
    } catch (e) {
      setCopyMsg("copy.failed");
    }
  };

  const printAdvice = () => window.print();

  const askNana = () => {
    /* parseOne, not parseFloat: a metric knitter's "91,5" is ninety-one and a
       half, and parseFloat would stop at the comma and read ninety-one. */
    const b = parseOne(bust);
    const sizes = parseList(sizesText);
    const yards = parseList(yardsText);
    const ease = easeOptions[easeIdx].v;
    const closeGap = inch ? 1 : 2.5;

    const size = adviseSize({
      sizes,
      bust: b,
      ease,
      patternGauge,
      myGauge,
      closeGap,
    });

    const jump = () => {
      if (!resultsRef.current) return;
      /* Move focus to the results heading as well as scrolling there: a
         screen reader then announces that one line and reads the cards
         beneath it at the reader's own pace. The status line above has already
         said, in one sentence, that there is an answer. Both targets take
         tabIndex={-1} and draw no ring, so nothing changes visually. */
      (headingRef.current || resultsRef.current).focus({ preventScroll: true });
      const gentle = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultsRef.current.scrollIntoView({
        behavior: gentle ? "auto" : "smooth",
        block: "start",
      });
    };
    /* Whichever way the answer goes — advice or "Nana needs two things" — say
       so through the status line and take the reader there. */
    const announce = () => {
      setAskCount((n) => n + 1);
      setTimeout(jump, 60);
    };

    if (!size) {
      setResults({ error: true });
      announce();
      return;
    }

    /* Everything the advice was worked out from is kept alongside it, so that
       editing a field afterwards does not quietly rewrite advice already on
       screen. Only the wording is left to render time. */
    setProverbIdx(Math.floor(Math.random() * proverbs.length));
    setResults({
      error: false,
      inch,
      bust: b,
      easeIdx,
      size,
      yarn: adviseYarn({ yards, sizes, bestIdx: size.bestIdx, perSkein, skeins, patternGauge, myGauge }),
      gauge: adviseGauge({ patternGauge, myGauge, best: size.best }),
      row: adviseRows({ patternRowGauge, myRowGauge, swatchSpan }),
      /* Null when there is only one size — nothing to compare. The best and
         runner-up rows come from the size answer above, never re-derived, so
         the table cannot highlight a different size than the card recommends. */
      table: sizeTable({
        sizes,
        yards,
        bust: b,
        ease,
        patternGauge,
        myGauge,
        perSkein,
        skeins,
        bestIdx: size.bestIdx,
        runnerUp: size.runnerUp,
      }),
    });

    announce();
  };

  /* ---------- turning Nana's findings into Nana's words ----------
     These run during render, which is what lets a language or craft switch
     re-word advice that has already been given. */
  const proverb = proverbs[proverbIdx % proverbs.length];

  /* Language and craft are pure wording, so advice already on screen should
     follow a switch. Units are not: the numbers in `results` were worked out in
     whichever system was showing when Nana was asked, and 40 in is not 40 cm.
     So the cards keep the units they were measured in, even after the toggle
     converts the fields above them. */
  const said = () => {
    const wasInch = results.inch;
    return {
      lenU: wasInch ? "in" : "cm",
      yarnU: wasInch ? "yds" : "m",
      gaugeLabel: t("label.gaugeLabel", { inch: wasInch }),
      rowGaugeLabel: t("label.rowGaugeLabel", { inch: wasInch }),
    };
  };

  const sizeText = () => {
    const s = results.size;
    const u = said();
    const easeLabel = t("ease.labels", { inch: results.inch })[results.easeIdx].toLowerCase();
    const base = s.gaugeAdjusted && s.actual !== s.best
      ? t("result.size.mainAdjusted", {
          best: s.best,
          actual: s.actual,
          lenU: u.lenU,
          b: results.bust,
          easeLabel,
          target: s.target,
        })
      : t("result.size.main", {
          best: s.best,
          lenU: u.lenU,
          b: results.bust,
          easeLabel,
          target: s.target,
        });
    return s.runnerUp !== null
      ? base + t("result.size.runnerUp", { runnerUp: s.runnerUp })
      : base;
  };

  const yarnText = () => {
    const y = results.yarn;
    const yarnU = said().yarnU;
    const body = t(`result.yarn.${y.kind}`, { ...y, best: results.size.best, yarnU });
    /* Postscripts in a fixed order: the gauge working first, because it
       explains the figure just quoted, then the list-length nag. */
    return (
      body +
      (y.gaugeAdjusted ? t("result.yarn.adjusted", { ...y, yarnU }) : "") +
      (y.mismatch ? t("result.yarn.mismatch") : "")
    );
  };

  const gaugeText = () => {
    const u = said();
    return t(`result.gauge.${results.gauge.kind}`, {
      ...results.gauge,
      gaugeLabel: u.gaugeLabel,
      lenU: u.lenU,
      craft,
    });
  };

  const rowText = () => {
    const u = said();
    return t(`result.row.${results.row.kind}`, {
      ...results.row,
      rowGaugeLabel: u.rowGaugeLabel,
      lenU: u.lenU,
    });
  };

  /* The aim column reads best signed: "+1.2" is roomier than asked for,
     "-0.8" snugger. String(-0) is "0" in JavaScript, so a hair under the aim
     that rounds away never prints as a puzzling "-0". */
  const signed = (n) => (n > 0 ? `+${n}` : String(n));

  const tableNote = () =>
    t("table.note", {
      gaugeAdjusted: results.table.gaugeAdjusted,
      hasVerdicts: results.table.hasVerdicts,
      yarnAdjusted: results.table.yarnAdjusted,
    });

  /* One table row as a line of plain text, for the Ravelry copy below. */
  const tableLine = (r) => {
    const u = said();
    const head =
      `${r.size} ${u.lenU}` +
      (results.table.gaugeAdjusted ? ` → ${r.actual} ${u.lenU}` : "");
    const rest = [
      r.need !== null ? `${r.need} ${u.yarnU}` : "",
      r.stash ? t(`table.${r.stash}`, { shortAmt: r.shortAmt, yarnU: u.yarnU }) : "",
    ].filter(Boolean);
    const badge = r.best
      ? ` — ${t("table.pick")}`
      : r.runnerUp
        ? ` — ${t("table.closeCall")}`
        : "";
    return [head, ...rest].join(" · ") + badge;
  };

  /* ---------- the swatch helper ----------
     Live arithmetic, but nothing lands in the gauge fields until the knitter
     says so: a half-typed width would otherwise overwrite a gauge she had
     entered by hand. `swatchUsed` is a flag, not a sentence, so the
     confirmation re-words itself on a language switch like everything else. */
  const swatchStsGauge = swatchToGauge(swatchSts, swatchAcross, swatchSpan);
  const swatchRowsGauge = swatchToGauge(swatchRows, swatchTall, swatchSpan);
  const swatchReady = swatchStsGauge !== null || swatchRowsGauge !== null;
  const applySwatch = () => {
    if (!swatchReady) return;
    if (swatchStsGauge !== null) setMyGauge(String(swatchStsGauge));
    if (swatchRowsGauge !== null) setMyRowGauge(String(swatchRowsGauge));
    setSwatchUsed(true);
  };
  /* Typing in a helper again means its confirmation no longer describes what
     is in the field above; retire it rather than let it lie. */
  const scratchEdit = (set, retire) => (e) => {
    set(e.target.value);
    retire(false);
  };
  /* Helper inputs sit inside the big form, so Enter would ask Nana with a
     number she has not been handed yet. Apply instead. */
  const applyOnEnter = (apply) => (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    apply();
  };
  const editSwatch = (set) => scratchEdit(set, setSwatchUsed);
  const onSwatchKey = applyOnEnter(applySwatch);

  /* ---------- the weighing helper ----------
     Grams over grams-per-skein is skeins, which drops into the field the yarn
     card already reads, so nothing downstream has to know about grams. The
     yardage shown alongside is worked from the rounded skeins figure, so it is
     exactly what the card will go on to use. */
  const weighSkeins = gramsToSkeins(weighHave, weighSkein);
  const weighPer = parseOne(perSkein);
  const weighYards = weighSkeins !== null && weighPer !== null ? r1(weighSkeins * weighPer) : null;
  const applyWeigh = () => {
    if (weighSkeins === null) return;
    setSkeins(String(weighSkeins));
    setWeighUsed(true);
  };
  const editWeigh = (set) => scratchEdit(set, setWeighUsed);
  const onWeighKey = applyOnEnter(applyWeigh);

  /* A shared link filled the form; run Nana once the inputs have settled. */
  useEffect(() => {
    if (!pendingAutoRun) return;
    setPendingAutoRun(false);
    askNana();
    setSaveMsg("share.loaded");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutoRun]);

  /* ---------- shared field styles ---------- */
  const labelStyle = {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#826E5A",
  };
  const inputStyle = {
    background: "#FFFFFF",
    border: `2px solid ${C.line}`,
    borderRadius: 12,
    color: C.espresso,
    fontFamily: "'Nunito', sans-serif",
  };
  /* Table headers wear the label colour but not the uppercase letter-spacing:
     five spaced-out columns of capitals wrap into tall stacks on a phone. */
  const thStyle = {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    fontSize: 12,
    color: "#826E5A",
  };

  return (
    <div style={{ background: C.oat, minHeight: "100vh", color: C.espresso }}>
      <style>{`
        .nk-bob { animation: nkbob 4s ease-in-out infinite; }
        @keyframes nkbob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .nk-pop { animation: nkpop .4s ease-out both; }
        @keyframes nkpop { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .nk-bob, .nk-pop { animation: none; } }
        .nk-link {
          text-decoration: underline; text-decoration-thickness: 2px;
          text-underline-offset: 3px; text-decoration-color: ${C.line};
          transition: color .15s ease, text-decoration-color .15s ease;
        }
        .nk-link:hover { color: ${C.rose}; text-decoration-color: ${C.rose}; }
        /* The butter ring alone is 1.76:1 against the oat background — nearly
           invisible to exactly the eyes that lean on it. An espresso ring
           underneath lifts the pair well past the 3:1 that WCAG asks of focus
           indicators, and it only ever draws for keyboard focus. */
        .nk-focus:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
          outline: 3px solid ${C.butter}; outline-offset: 2px;
          box-shadow: 0 0 0 2px ${C.espresso};
        }
        /* The results container takes focus programmatically so a screen
           reader starts where the answer starts. That focus is for the reading
           order, not the eye — without this, the browser draws its default
           ring around all four cards. */
        .nk-results:focus, .nk-results:focus-visible,
        .nk-results-head:focus, .nk-results-head:focus-visible { outline: none; box-shadow: none; }
        .nk-edge {
          height: 13px;
          background-image: radial-gradient(circle at 10px 0px, ${C.rose} 9px, transparent 10px);
          background-size: 20px 13px;
          background-repeat: repeat-x;
        }
        input::placeholder, textarea::placeholder { color: #817464; }
        summary { cursor: pointer; }
        /* Print just Nana's advice, so it can go in a project bag. The form,
           toggles, buttons and footer drop away; the header keeps her face. */
        @media print {
          .nk-noprint { display: none !important; }
          body { background: #FFFFFF !important; }
          .nk-results, .nk-results * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .nk-pop { animation: none !important; }
        }
      `}</style>

      {/* header */}
      <header className="max-w-2xl mx-auto px-5 pt-8 pb-2">
        {/* language switch */}
        <div className="nk-noprint flex justify-end mb-2">
          <div
            role="group"
            aria-label={t("lang.toggleLabel")}
            className="inline-flex rounded-full overflow-hidden"
            style={{ border: `2px solid ${C.line}` }}
          >
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              aria-label={t("lang.switchToEn")}
              lang="en"
              className="nk-focus px-3 py-1 text-xs font-bold transition-colors"
              style={{
                fontFamily: "'Nunito', sans-serif",
                background: lang === "en" ? C.sageDark : "transparent",
                color: lang === "en" ? "#FFF" : C.sageDark,
              }}
            >
              {t("lang.en")}
            </button>
            {/* lang="es": the label stays Spanish whichever language the page is
                in, so say so, or a screen reader reads it with an English
                accent. The English button is marked the same way. */}
            <button
              type="button"
              onClick={() => setLang("es")}
              aria-pressed={lang === "es"}
              aria-label={t("lang.switchToEs")}
              lang="es"
              className="nk-focus px-3 py-1 text-xs font-bold transition-colors"
              style={{
                fontFamily: "'Nunito', sans-serif",
                background: lang === "es" ? C.sageDark : "transparent",
                color: lang === "es" ? "#FFF" : C.sageDark,
              }}
            >
              {t("lang.es")}
            </button>
          </div>
        </div>
        <div className="flex items-end gap-4 sm:gap-6">
          <div className="shrink-0">
            <Nana size={140} label={t("nana.alt")} />
          </div>
          <div className="pb-2">
            <h1
              className="leading-none"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "clamp(34px, 8vw, 52px)" }}
            >
              Nana Knows
            </h1>
            <p className="mt-2 text-sm sm:text-base" style={{ fontFamily: "'Nunito', sans-serif", color: "#6B5847" }}>
              {t("header.tagline")}
            </p>
            <p className="mt-2 text-xs font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: C.sageDark }}>
              {t("header.badge")}
            </p>
          </div>
        </div>
      </header>
      <div className="nk-edge" aria-hidden="true" />

      <main className="max-w-2xl mx-auto px-5 py-7 flex flex-col gap-5">
        {/* toggles */}
        <div className="nk-noprint flex flex-wrap items-center gap-2">
          <div role="group" aria-label={t("toggle.craftLabel")} className="flex gap-2">
            <Toggle value="knit" current={craft} set={setCraft}>{t("toggle.knitting")}</Toggle>
            <Toggle value="crochet" current={craft} set={setCraft}>{t("toggle.crochet")}</Toggle>
          </div>
          <span className="mx-1" aria-hidden="true" style={{ color: C.line }}>|</span>
          <div role="group" aria-label={t("toggle.unitsLabel")} className="flex gap-2">
            <Toggle value="in" current={units} set={switchUnits}>{t("toggle.inYds")}</Toggle>
            <Toggle value="cm" current={units} set={switchUnits}>{t("toggle.cmM")}</Toggle>
          </div>
        </div>

        {/* Everything from here to the Ask button is one form, so that pressing
            Enter in any field asks Nana, as a visitor would expect. */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            askNana();
          }}
          className="flex flex-col gap-5"
        >

          {/* card: pattern */}
          <section className="nk-noprint rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
            <div className="flex items-center gap-2 mb-4">
              <GrannySquare />
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22 }}>{t("card.pattern")}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>{t("field.patternGauge", { gaugeLabel })}</span>
                <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={patternGauge} onChange={(e) => setPatternGauge(e.target.value)} placeholder={ph.gauge} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>{t("field.patternRowGauge", { rowGaugeLabel })}</span>
                <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={patternRowGauge} onChange={(e) => setPatternRowGauge(e.target.value)} placeholder={ph.rowGauge} />
              </label>
              {/* The two list fields use htmlFor rather than wrapping, so the
                  echo sits outside the label: folded inside, its whole running
                  text becomes part of the input's accessible name and mutates
                  on every keystroke. aria-describedby is the right channel.
                  No inputMode here — the iOS decimal pad has no comma key, and
                  these fields are exactly where commas get typed. */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="nk-sizes" style={labelStyle}>{t("field.finishedSizes", { lenU })}</label>
                <input id="nk-sizes" aria-describedby="nk-sizes-echo" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="go" style={inputStyle} className="px-3 py-2.5 text-sm" value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder={ph.sizes} />
                <ParseEcho id="nk-sizes-echo" text={sizesText} t={t} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="nk-yards" style={labelStyle}>{t("field.yarnNeeded", { yarnU })}</label>
                <input id="nk-yards" aria-describedby="nk-yards-echo" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="go" style={inputStyle} className="px-3 py-2.5 text-sm" value={yardsText} onChange={(e) => setYardsText(e.target.value)} placeholder={ph.yards} />
                <ParseEcho id="nk-yards-echo" text={yardsText} t={t} />
              </div>
            </div>
          </section>

          {/* card: you */}
          <section className="nk-noprint rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
            <div className="flex items-center gap-2 mb-4">
              <GrannySquare />
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22 }}>{t("card.you")}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>{t("field.bust", { lenU })}</span>
                <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={bust} onChange={(e) => setBust(e.target.value)} placeholder={ph.bust} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>{t("field.fit")}</span>
                <select style={inputStyle} className="mt-auto px-3 py-2.5 text-sm nk-focus" value={easeIdx} onChange={(e) => setEaseIdx(Number(e.target.value))}>
                  {easeOptions.map((o, i) => (
                    <option key={i} value={i}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>{t("field.swatchGauge", { gaugeLabel })}</span>
                <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={myGauge} onChange={(e) => setMyGauge(e.target.value)} placeholder={ph.myGauge} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>{t("field.swatchRowGauge", { rowGaugeLabel })}</span>
                <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={myRowGauge} onChange={(e) => setMyRowGauge(e.target.value)} placeholder={ph.myRowGauge} />
              </label>
            </div>

            {/* the swatch helper */}
            <details className="mt-4 rounded-xl" style={{ background: C.oat, border: `1.5px dashed ${C.line}` }}>
              <summary className="cursor-pointer px-4 py-3 text-sm nk-focus" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: C.sageDark }}>
                {t("swatch.summary")}
              </summary>
              <div className="px-4 pb-4 text-sm" style={{ color: C.espresso }}>
                <p className="mb-3">{t("swatch.intro", { spanLabel: `${swatchSpan} ${lenU}` })}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <label className="flex flex-col gap-1.5">
                    <span style={labelStyle}>{t("swatch.stitches")}</span>
                    <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={swatchSts} onChange={editSwatch(setSwatchSts)} onKeyDown={onSwatchKey} placeholder={ph.swatchStitches} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span style={labelStyle}>{t("swatch.across", { lenU })}</span>
                    <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={swatchAcross} onChange={editSwatch(setSwatchAcross)} onKeyDown={onSwatchKey} placeholder={ph.swatchAcross} />
                  </label>
                  {/* Always in the DOM, so the live region exists before it has
                      anything to announce. */}
                  <p className="col-span-2 text-xs" role="status" style={{ color: C.sageDark, minHeight: "1.2em" }}>
                    {swatchStsGauge !== null ? t("swatch.stitchesOut", { gauge: swatchStsGauge, gaugeLabel }) : ""}
                  </p>
                  <label className="flex flex-col gap-1.5">
                    <span style={labelStyle}>{t("swatch.rows")}</span>
                    <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={swatchRows} onChange={editSwatch(setSwatchRows)} onKeyDown={onSwatchKey} placeholder={ph.swatchRows} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span style={labelStyle}>{t("swatch.tall", { lenU })}</span>
                    <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={swatchTall} onChange={editSwatch(setSwatchTall)} onKeyDown={onSwatchKey} placeholder={ph.swatchTall} />
                  </label>
                  <p className="col-span-2 text-xs" role="status" style={{ color: C.sageDark, minHeight: "1.2em" }}>
                    {swatchRowsGauge !== null ? t("swatch.rowsOut", { gauge: swatchRowsGauge, rowGaugeLabel }) : ""}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={applySwatch}
                    disabled={!swatchReady}
                    className="nk-focus px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: C.sageDark, color: "#FFFFFF", fontFamily: "'Nunito', sans-serif" }}
                  >
                    {t("swatch.use")}
                  </button>
                  <span role="status" className="text-xs" style={{ color: "#826E5A" }}>{swatchUsed ? t("swatch.used") : ""}</span>
                </div>
                <p className="mt-3 text-xs" style={{ color: C.sageDark }}>{t("swatch.tip")}</p>
              </div>
            </details>

            <details className="mt-4 rounded-xl" style={{ background: C.oat, border: `1.5px dashed ${C.line}` }}>
              <summary className="cursor-pointer px-4 py-3 text-sm nk-focus" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: C.sageDark }}>
                {t("measure.summary")}
              </summary>
              <div className="px-4 pb-4 flex flex-col sm:flex-row gap-4 items-start">
                <div className="shrink-0 mx-auto sm:mx-0">
                  <MeasureBust label={t("measure.alt")} />
                </div>
                <div className="text-sm" style={{ color: C.espresso }}>
                  <p className="mb-2">{t("measure.intro")}</p>
                  <ol className="list-decimal pl-5 flex flex-col gap-1.5">
                    {t("measure.steps").map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                  <p className="mt-3" style={{ color: C.sageDark }}>{t("measure.tip")}</p>
                </div>
              </div>
            </details>
          </section>

          {/* card: yarn basket */}
          <section className="nk-noprint rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
            <div className="flex items-center gap-2 mb-4">
              <GrannySquare />
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22 }}>{t("card.basket")}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>{t("field.perSkein", { yarnU })}</span>
                <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="px-3 py-2.5 text-sm" value={perSkein} onChange={(e) => setPerSkein(e.target.value)} placeholder={ph.perSkein} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>{t("field.skeinsYouHave")}</span>
                <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="px-3 py-2.5 text-sm" value={skeins} onChange={(e) => setSkeins(e.target.value)} placeholder={ph.skeins} />
              </label>
            </div>

            {/* the weighing helper */}
            <details className="mt-4 rounded-xl" style={{ background: C.oat, border: `1.5px dashed ${C.line}` }}>
              <summary className="cursor-pointer px-4 py-3 text-sm nk-focus" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: C.sageDark }}>
                {t("weigh.summary")}
              </summary>
              <div className="px-4 pb-4 text-sm" style={{ color: C.espresso }}>
                <p className="mb-3">{t("weigh.intro")}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <label className="flex flex-col gap-1.5">
                    <span style={labelStyle}>{t("weigh.skeinWeighs")}</span>
                    <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={weighSkein} onChange={editWeigh(setWeighSkein)} onKeyDown={onWeighKey} placeholder={ph.weighSkein} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span style={labelStyle}>{t("weigh.haveWeighs")}</span>
                    <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={weighHave} onChange={editWeigh(setWeighHave)} onKeyDown={onWeighKey} placeholder={ph.weighHave} />
                  </label>
                  <p className="col-span-2 text-xs" role="status" style={{ color: C.sageDark, minHeight: "1.2em" }}>
                    {weighSkeins !== null ? t("weigh.out", { skeins: weighSkeins, yards: weighYards, yarnU }) : ""}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={applyWeigh}
                    disabled={weighSkeins === null}
                    className="nk-focus px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: C.sageDark, color: "#FFFFFF", fontFamily: "'Nunito', sans-serif" }}
                  >
                    {t("weigh.use")}
                  </button>
                  <span role="status" className="text-xs" style={{ color: "#826E5A" }}>{weighUsed ? t("weigh.used") : ""}</span>
                </div>
                <p className="mt-3 text-xs" style={{ color: C.sageDark }}>{t("weigh.tip")}</p>
              </div>
            </details>
          </section>

          {/* ask button */}
          <button
            type="submit"
            className="nk-noprint nk-focus w-full py-4 rounded-2xl text-xl transition-transform active:scale-[0.99]"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, background: C.rose, color: "#FFF", boxShadow: `0 4px 0 ${C.roseDark}` }}
          >
            {t("button.ask")}
          </button>
        </form>

        {/* remember me */}
        <div className="nk-noprint flex flex-wrap items-center gap-3 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <button type="button" onClick={rememberMe} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.sageDark }}>
            {t("remember.save")}
          </button>
          <button type="button" onClick={forgetMe} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: "#7F6F5C" }}>
            {t("remember.forget")}
          </button>
          <button type="button" onClick={shareLink} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.roseDark }}>
            {t("share.button")}
          </button>
          {/* Always in the tree so the live region exists before the first
              message lands — a region that appears with its text is skipped by
              some screen readers. The span holds a key, not a sentence, so the
              little confirmations follow a language switch like the advice
              cards do. */}
          <span role="status" style={{ color: "#826E5A" }}>{saveMsg ? t(saveMsg) : ""}</span>
        </div>
        <p className="nk-noprint text-xs -mt-2" style={{ fontFamily: "'Nunito', sans-serif", color: "#7F6F5C" }}>
          {t("share.note")}
        </p>

        {/* results. The live region is a single sentence, kept in the DOM from
            the start so it exists before it has anything to say; the cards
            themselves are not live, and are read from the focused heading at
            the reader's own pace instead of in one breath. The inner span is
            keyed by ask, so an identical answer is still re-announced. */}
        <p role="status" className="sr-only">
          {results && (
            <span key={askCount}>
              {results.error ? t("result.error") : t("status.answer", { best: results.size.best })}
            </span>
          )}
        </p>
        <div ref={resultsRef} tabIndex={-1} className="nk-results">
          {results && results.error && (
            <div className="rounded-2xl p-5 nk-pop flex gap-4 items-start" style={{ background: "#FDF0E4", border: `2px dashed ${C.butter}` }}>
              <div className="shrink-0"><Nana size={64} bob={false} label={t("nana.alt")} /></div>
              <p ref={headingRef} tabIndex={-1} className="nk-results-head text-sm leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif" }}>{t("result.error")}</p>
            </div>
          )}
          {results && !results.error && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 nk-pop">
                <div className="shrink-0 mt-1"><Nana size={72} bob={false} label={t("nana.alt")} /></div>
                <div className="relative rounded-2xl px-4 py-3" style={{ background: "#F3E7EC", border: `2px solid ${C.rose}` }}>
                  {/* A heading, so the answer has a landmark for a screen reader
                      to land on; styled as the speech-bubble line it always was. */}
                  <h2 ref={headingRef} tabIndex={-1} className="nk-results-head text-sm italic" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 400, color: C.roseDark }}>
                    {t("result.intro", { proverb })}
                  </h2>
                </div>
              </div>
              <AdviceCard color={C.rose} title={t("advice.size")}>{sizeText()}</AdviceCard>
              <AdviceCard color={C.butter} title={t("advice.yarn")} tone={results.yarn.tone === "warn" ? "warn" : "ok"}>{yarnText()}</AdviceCard>
              <AdviceCard color={C.sage} title={t("advice.tension")} tone={results.gauge.tone === "warn" ? "warn" : "ok"}>{gaugeText()}</AdviceCard>
              <AdviceCard color={C.sageDark} title={t("advice.length")} tone={results.row.tone === "warn" ? "warn" : "ok"}>{rowText()}</AdviceCard>

              {/* Every size side by side. Columns only appear when there is
                  something honest to put in them: "comes out" needs both
                  gauges, yarn needs a yardage list, the basket verdict needs
                  a stocked basket. Units come from said(), so the table keeps
                  the system it was asked in, like the cards above it. */}
              {results.table && (
                <div className="rounded-2xl overflow-hidden nk-pop" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
                  <div style={{ height: 8, background: C.rose }} />
                  <div className="p-4 sm:p-5">
                    <h3 className="mb-3 text-base font-bold" style={{ fontFamily: "'Fraunces', serif", color: C.espresso }}>
                      {t("table.title")}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" style={{ borderCollapse: "collapse", fontVariantNumeric: "tabular-nums" }}>
                        <caption className="sr-only">{t("table.caption")}</caption>
                        <thead>
                          <tr>
                            <th scope="col" className="py-2 pr-3 text-left align-bottom" style={thStyle}>
                              {t("table.size", { lenU: said().lenU })}
                            </th>
                            {results.table.gaugeAdjusted && (
                              <th scope="col" className="py-2 px-3 text-right align-bottom" style={thStyle}>
                                {t("table.comesOut", { lenU: said().lenU })}
                              </th>
                            )}
                            <th scope="col" className="py-2 px-3 text-right align-bottom" style={thStyle}>
                              {t("table.vsAim", { target: results.table.target, lenU: said().lenU })}
                            </th>
                            {results.table.hasYards && (
                              <th scope="col" className="py-2 px-3 text-right align-bottom" style={thStyle}>
                                {t("table.yarn", { yarnU: said().yarnU })}
                              </th>
                            )}
                            {results.table.hasVerdicts && (
                              <th scope="col" className="py-2 pl-3 text-right align-bottom" style={thStyle}>
                                {t("table.basket")}
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {results.table.rows.map((r, i) => (
                            <tr key={i} style={{ borderTop: `1.5px dashed ${C.line}`, background: r.best ? "#F3E7EC" : "transparent" }}>
                              {/* The pick is marked with words, not colour alone:
                                  the tinted row means nothing to a screen reader
                                  or in a greyscale print. */}
                              <th scope="row" className="py-2 pr-3 text-left align-top">
                                <span className="font-bold" style={{ color: C.espresso }}>{r.size}</span>
                                {r.best && (
                                  <span className="block text-[11px] font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: C.roseDark }}>
                                    {t("table.pick")}
                                  </span>
                                )}
                                {r.runnerUp && (
                                  <span className="block text-[11px] font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: C.sageDark }}>
                                    {t("table.closeCall")}
                                  </span>
                                )}
                              </th>
                              {results.table.gaugeAdjusted && (
                                <td className="py-2 px-3 text-right align-top" style={{ color: "#5C4B3E" }}>{r.actual}</td>
                              )}
                              <td className="py-2 px-3 text-right align-top" style={{ color: "#5C4B3E" }}>{signed(r.diff)}</td>
                              {results.table.hasYards && (
                                <td className="py-2 px-3 text-right align-top" style={{ color: "#5C4B3E" }}>
                                  {r.need !== null ? r.need : "—"}
                                </td>
                              )}
                              {results.table.hasVerdicts && (
                                <td
                                  className="py-2 pl-3 text-right align-top whitespace-nowrap font-bold"
                                  style={{ fontFamily: "'Nunito', sans-serif", color: r.stash === "plenty" ? C.sageDark : C.roseDark }}
                                >
                                  {r.stash ? t(`table.${r.stash}`, { shortAmt: r.shortAmt, yarnU: said().yarnU }) : "—"}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {(results.table.gaugeAdjusted || results.table.hasVerdicts) && (
                      <p className="mt-3 text-xs" style={{ fontFamily: "'Nunito', sans-serif", color: "#826E5A" }}>
                        {tableNote()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="nk-noprint flex flex-wrap items-center gap-3 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
                <button type="button" onClick={copyAdvice} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.sageDark }}>
                  {t("copy.button")}
                </button>
                <button type="button" onClick={printAdvice} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.roseDark }}>
                  {t("copy.print")}
                </button>
                <span role="status" style={{ color: "#826E5A" }}>{copyMsg ? t(copyMsg) : ""}</span>
              </div>
            </div>
          )}
        </div>

        {/* how the math works */}
        <details className="nk-noprint rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
          <summary className="nk-focus font-bold" style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>
            {t("math.summary")}
          </summary>
          <div className="mt-3 text-sm leading-relaxed flex flex-col gap-2" style={{ fontFamily: "'Nunito', sans-serif", color: "#5C4B3E" }}>
            <p><strong>{t("math.labels.size")}</strong> {t("math.size")}</p>
            <p><strong>{t("math.labels.yarn")}</strong> {t("math.yarn")}</p>
            <p><strong>{t("math.labels.tension")}</strong> {t("math.tension")}</p>
            <p><strong>{t("math.labels.length")}</strong> {t("math.length")}</p>
          </div>
        </details>
      </main>

      {/* footer */}
      <footer className="nk-noprint max-w-2xl mx-auto px-5 pb-10 pt-2 text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="flex justify-center gap-2 mb-3" aria-hidden="true">
          <GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} />
        </div>
        <p className="text-xs" style={{ color: "#826E5A" }}>
          {t("footer.privacy")}
        </p>
        <p className="text-xs mt-3">
          <a
            href="https://github.com/rachelselbrede/nana-knows/issues"
            target="_blank"
            rel="noreferrer noopener"
            className="nk-focus nk-link font-bold rounded"
            style={{ color: C.roseDark }}
          >
            {t("footer.learnNext")}
            <span className="sr-only"> {t("footer.newTab")}</span>
          </a>
        </p>
      </footer>
    </div>
  );
}
