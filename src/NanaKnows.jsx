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
} from "./lib/parse.js";
import { adviseSize, adviseYarn, adviseGauge, adviseRows } from "./lib/advice.js";

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
   A flat-lay sweater — crew neck, two sleeves, ribbed hem and cuffs —
   with a soft tape measure wrapped around the bust. The tape drapes past
   the sides so it reads as going around to the back, and it carries tick
   marks and a little metal end tab. Same flat, rounded art as Nana. */
function MeasureBust({ size = 132, label }) {
  return (
    <svg
      width={size}
      height={size * 1.07}
      viewBox="0 0 140 150"
      role="img"
      aria-label={label}
    >
      {/* sweater body + sleeves */}
      <path
        d="M58 24 L44 30 L10 72 L16 84 L40 66 L36 128 L36 138 L104 138 L104 128 L100 66 L124 84 L130 72 L96 30 L82 24 Q70 34 58 24 Z"
        fill={C.sage}
        stroke={C.sageDark}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* ribbed crew neckline */}
      <path d="M58 24 Q70 34 82 24" fill="none" stroke={C.oat} strokeWidth="5" strokeLinecap="round" />
      <path d="M58 24 Q70 34 82 24" fill="none" stroke={C.sageDark} strokeWidth="1.5" strokeLinecap="round" />
      {/* ribbed hem */}
      <path d="M36 129 L104 129" stroke={C.sageDark} strokeWidth="2.5" strokeLinecap="round" />
      <g stroke={C.sageDark} strokeWidth="1.4" strokeLinecap="round" opacity="0.65">
        <line x1="46" y1="130" x2="46" y2="137" />
        <line x1="58" y1="130" x2="58" y2="137" />
        <line x1="70" y1="130" x2="70" y2="137" />
        <line x1="82" y1="130" x2="82" y2="137" />
        <line x1="94" y1="130" x2="94" y2="137" />
      </g>
      {/* ribbed cuffs */}
      <path d="M10.5 72.5 L16.5 84" stroke={C.sageDark} strokeWidth="3" strokeLinecap="round" />
      <path d="M129.5 72.5 L123.5 84" stroke={C.sageDark} strokeWidth="3" strokeLinecap="round" />

      {/* tape measure wrapping the bust, within the chest of the sweater */}
      <path
        d="M44 74 Q70 82 96 74 L96 83 Q70 91 44 83 Z"
        fill={C.rose}
        stroke={C.roseDark}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* measurement ticks */}
      <g stroke={C.oat} strokeWidth="1.5" strokeLinecap="round">
        <line x1="50" y1="77" x2="50" y2="83" />
        <line x1="58" y1="78" x2="58" y2="84" />
        <line x1="66" y1="79" x2="66" y2="85" />
        <line x1="74" y1="79" x2="74" y2="85" />
        <line x1="82" y1="78" x2="82" y2="84" />
        <line x1="90" y1="77" x2="90" y2="83" />
      </g>
      {/* metal end tab where the tape meets */}
      <rect x="84" y="71" width="11" height="8" rx="2" fill={C.roseDark} transform="rotate(8 89 75)" />
    </svg>
  );
}

/* ---------- Nana Purl herself ---------- */
function Nana({ size = 150, bob = true, label = "Nana Purl, a smiling grandma holding a ball of yarn" }) {
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
  const resultsRef = useRef(null);

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
    setResults(null); // old advice is in the old units
    setUnits(next);
  };

  const ph = t("ph", { inch });

  /* Show the knitter what Nana made of her typing. Commas and dashes are
     genuinely ambiguous — "32,36" could be two sizes or one odd decimal — and
     no heuristic gets every case. Echoing the reading back turns a wrong guess
     into something visible and correctable, which is worth more than a cleverer
     guess would be. Only speaks up once there is something to say. */
  const ParseEcho = ({ text }) => {
    const { values, issues } = parseNumberList(text);
    if (values.length === 0) return null;
    if (values.length === 1 && issues.length === 0) return null;
    return (
      <span className="text-xs" style={{ color: C.sageDark }}>
        {t("echo.read", { list: values.join(", ") })}
        {issues.map((i) => t(`echo.${i}`)).join("")}
      </span>
    );
  };

  /* Labels come from the dictionary; the ease values stay here since they are
     arithmetic, not text. */
  const easeValues = inch ? [-2, 0, 2, 4, 6] : [-5, 0, 5, 10, 15];
  const easeOptions = t("ease.labels", { inch }).map((label, i) => ({
    label,
    v: easeValues[i],
  }));

  const proverbs = t(craft === "knit" ? "proverbs.knit" : "proverbs.crochet");

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

  /* Does the URL carry a shared project (anything beyond ?lang)? */
  const hasSharedParams = () => {
    try {
      const p = new URLSearchParams(window.location.search);
      return [...p.keys()].some((k) => k !== "lang");
    } catch (e) {
      return false;
    }
  };

  /* load Nana's notebook if it exists (stored only in this browser).
     A shared link takes precedence, so skip the saved notebook when one is
     present rather than mixing someone else's numbers with your own. */
  useEffect(() => {
    if (hasSharedParams()) return;
    try {
      const saved = localStorage.getItem("nana-notebook");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.units) setUnits(d.units);
        if (d.craft) setCraft(d.craft);
        if (d.bust) setBust(d.bust);
        if (typeof d.easeIdx === "number") setEaseIdx(d.easeIdx);
        if (d.myGauge) setMyGauge(d.myGauge);
        if (d.myRowGauge) setMyRowGauge(d.myRowGauge);
        if (d.perSkein) setPerSkein(d.perSkein);
        if (d.skeins) setSkeins(d.skeins);
        setSaveMsg(t("save.remembered"));
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
      const p = new URLSearchParams(window.location.search);
      if (![...p.keys()].some((k) => k !== "lang")) return;
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
        if (v != null && v !== "") setter[field](v);
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
      setSaveMsg(t("save.written"));
    } catch (e) {
      setSaveMsg(t("save.notHandy"));
    }
  };

  /* Build a link that carries the current inputs. Keeps ?lang, includes units
     and craft so numbers are never misread, and skips empty fields. */
  const buildShareUrl = () => {
    const url = new URL(window.location.href);
    const fresh = new URLSearchParams();
    const lang = url.searchParams.get("lang");
    if (lang) fresh.set("lang", lang);
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
      setSaveMsg(t("share.copied"));
    } catch (e) {
      /* No clipboard access: drop the link in the address bar to copy by hand. */
      try {
        window.history.replaceState({}, "", url);
      } catch (_) {
        /* ignore */
      }
      setSaveMsg(t("share.failed"));
    }
  };

  const forgetMe = () => {
    try {
      localStorage.removeItem("nana-notebook");
    } catch (e) {
      /* ignore */
    }
    setSaveMsg(t("save.forgotten"));
  };

  /* Turn the four advice cards into plain text Nana's visitor can paste into a
     Ravelry project note. Built from the same messages shown on screen. */
  const copyAdvice = async () => {
    if (!results || results.error) return;
    const text = [
      t("copy.heading"),
      "",
      proverb ? `“${proverb}”` : "",
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
    ]
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg(t("copy.done"));
    } catch (e) {
      setCopyMsg(t("copy.failed"));
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

    if (!size) {
      setResults({ error: true });
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
      yarn: adviseYarn({ yards, sizes, bestIdx: size.bestIdx, perSkein, skeins }),
      gauge: adviseGauge({ patternGauge, myGauge, best: size.best }),
      row: adviseRows({ patternRowGauge, myRowGauge, swatchSpan }),
    });

    const jump = () => {
      if (!resultsRef.current) return;
      const gentle = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultsRef.current.scrollIntoView({
        behavior: gentle ? "auto" : "smooth",
        block: "start",
      });
    };
    setTimeout(jump, 60);
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
    const body = t(`result.yarn.${y.kind}`, { ...y, best: results.size.best, yarnU: said().yarnU });
    return y.mismatch ? body + t("result.yarn.mismatch") : body;
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

  /* A shared link filled the form; run Nana once the inputs have settled. */
  useEffect(() => {
    if (!pendingAutoRun) return;
    setPendingAutoRun(false);
    askNana();
    setSaveMsg(t("share.loaded"));
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
        .nk-focus:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
          outline: 3px solid ${C.butter}; outline-offset: 2px;
        }
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
                <input inputMode="decimal" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={patternGauge} onChange={(e) => setPatternGauge(e.target.value)} placeholder={ph.gauge} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>{t("field.patternRowGauge", { rowGaugeLabel })}</span>
                <input inputMode="decimal" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={patternRowGauge} onChange={(e) => setPatternRowGauge(e.target.value)} placeholder={ph.rowGauge} />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span style={labelStyle}>{t("field.finishedSizes", { lenU })}</span>
                <input style={inputStyle} className="px-3 py-2.5 text-sm" value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder={ph.sizes} />
                <ParseEcho text={sizesText} />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span style={labelStyle}>{t("field.yarnNeeded", { yarnU })}</span>
                <input style={inputStyle} className="px-3 py-2.5 text-sm" value={yardsText} onChange={(e) => setYardsText(e.target.value)} placeholder={ph.yards} />
                <ParseEcho text={yardsText} />
              </label>
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
                <input inputMode="decimal" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={bust} onChange={(e) => setBust(e.target.value)} placeholder={ph.bust} />
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
                <input inputMode="decimal" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={myGauge} onChange={(e) => setMyGauge(e.target.value)} placeholder={ph.myGauge} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>{t("field.swatchRowGauge", { rowGaugeLabel })}</span>
                <input inputMode="decimal" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={myRowGauge} onChange={(e) => setMyRowGauge(e.target.value)} placeholder={ph.myRowGauge} />
              </label>
            </div>
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
                <input inputMode="decimal" style={inputStyle} className="px-3 py-2.5 text-sm" value={perSkein} onChange={(e) => setPerSkein(e.target.value)} placeholder={ph.perSkein} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span style={labelStyle}>{t("field.skeinsYouHave")}</span>
                <input inputMode="decimal" style={inputStyle} className="px-3 py-2.5 text-sm" value={skeins} onChange={(e) => setSkeins(e.target.value)} placeholder={ph.skeins} />
              </label>
            </div>
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
          {saveMsg && <span style={{ color: "#826E5A" }}>{saveMsg}</span>}
        </div>
        <p className="nk-noprint text-xs -mt-2" style={{ fontFamily: "'Nunito', sans-serif", color: "#7F6F5C" }}>
          {t("share.note")}
        </p>

        {/* results */}
        <div ref={resultsRef} className="nk-results" aria-live="polite">
          {results && results.error && (
            <div className="rounded-2xl p-5 nk-pop flex gap-4 items-start" style={{ background: "#FDF0E4", border: `2px dashed ${C.butter}` }}>
              <div className="shrink-0"><Nana size={64} bob={false} label={t("nana.alt")} /></div>
              <p className="text-sm leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif" }}>{t("result.error")}</p>
            </div>
          )}
          {results && !results.error && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 nk-pop">
                <div className="shrink-0 mt-1"><Nana size={72} bob={false} label={t("nana.alt")} /></div>
                <div className="relative rounded-2xl px-4 py-3" style={{ background: "#F3E7EC", border: `2px solid ${C.rose}` }}>
                  <p className="text-sm italic" style={{ fontFamily: "'Nunito', sans-serif", color: C.roseDark }}>
                    {t("result.intro", { proverb })}
                  </p>
                </div>
              </div>
              <AdviceCard color={C.rose} title={t("advice.size")}>{sizeText()}</AdviceCard>
              <AdviceCard color={C.butter} title={t("advice.yarn")} tone={results.yarn.tone === "warn" ? "warn" : "ok"}>{yarnText()}</AdviceCard>
              <AdviceCard color={C.sage} title={t("advice.tension")} tone={results.gauge.tone === "warn" ? "warn" : "ok"}>{gaugeText()}</AdviceCard>
              <AdviceCard color={C.sageDark} title={t("advice.length")} tone={results.row.tone === "warn" ? "warn" : "ok"}>{rowText()}</AdviceCard>
              <div className="nk-noprint flex flex-wrap items-center gap-3 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
                <button type="button" onClick={copyAdvice} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.sageDark }}>
                  {t("copy.button")}
                </button>
                <button type="button" onClick={printAdvice} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.roseDark }}>
                  {t("copy.print")}
                </button>
                {copyMsg && <span style={{ color: "#826E5A" }}>{copyMsg}</span>}
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
          </a>
        </p>
      </footer>
    </div>
  );
}
