import { useState, useEffect, useRef } from "react";
import { useI18n } from "./i18n/index.jsx";

/* ---------- Nana's palette ---------- */
const C = {
  oat: "#FBF6EC",
  card: "#FFFDF9",
  rose: "#D4718C",
  roseDark: "#B25571",
  sage: "#7E9B76",
  sageDark: "#5F7C58",
  butter: "#E9B44C",
  espresso: "#3E2F25",
  line: "#E4D5C3",
  skin: "#F6D7BD",
  hair: "#CFC6C0",
  cheek: "#F2AAB2",
};

/* ---------- helpers ---------- */
/* Turn a free-typed list into numbers.
   Commas mean three different things depending on who is typing: "32, 36" is a
   list, "91,5" is 91.5 to a European knitter, and "1,100" is a thousands mark.
   A comma before a space always breaks the list, so split on those first, then
   work out what any comma left inside a single number is doing. */
const parseList = (t) => {
  const out = [];
  String(t || "")
    .replace(/,(?=\s)/g, " ")
    .split(/[;\s]+/)
    .filter(Boolean)
    .forEach((token) => {
      const commas = (token.match(/,/g) || []).length;
      let parts;
      if (commas >= 2) {
        parts = token.split(","); // "32,36,40" typed without spaces
      } else if (commas === 1) {
        parts = [
          /,\d{3}(?!\d)/.test(token)
            ? token.replace(",", "") // "1,100" -> 1100
            : token.replace(",", "."), // "91,5"  -> 91.5
        ];
      } else {
        parts = [token];
      }
      parts.forEach((p) => {
        const n = parseFloat(p.replace(/[^0-9.]/g, ""));
        if (isFinite(n) && n > 0) out.push(n);
      });
    });
  return out;
};

const r1 = (n) => Math.round(n * 10) / 10;

/* Unit conversion, used when someone flips the in/cm switch after typing.
   Gauge is deliberately left alone: patterns quote "per 4 in" and "per 10 cm"
   as the same swatch, and the maths only ever uses gauge as a ratio anyway. */
const convertOne = (value, f) => {
  const n = parseFloat(String(value).replace(",", "."));
  return isFinite(n) && n > 0 ? String(r1(f(n))) : value;
};

const convertList = (text, f) => {
  const nums = parseList(text);
  return nums.length ? nums.map((n) => r1(f(n))).join(", ") : text;
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

  const [results, setResults] = useState(null);
  const [proverb, setProverb] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const resultsRef = useRef(null);

  const inch = units === "in";
  const lenU = inch ? "in" : "cm";
  const yarnU = inch ? "yds" : "m";
  const gaugeLabel = t("label.gaugeLabel", { inch });
  const rowGaugeLabel = t("label.rowGaugeLabel", { inch });
  /* The swatch both gauges are quoted over: 4 in, or 10 cm. */
  const swatchSpan = inch ? 4 : 10;

  /* Flipping units has to carry the numbers over, or a 38 in bust silently
     becomes a 38 cm one and Nana confidently recommends the wrong size. */
  const switchUnits = (next) => {
    if (next === units) return;
    const toMetric = next === "cm";
    const len = (n) => (toMetric ? n * 2.54 : n / 2.54);
    const yarn = (n) => (toMetric ? n * 0.9144 : n / 0.9144);
    setSizesText(convertList(sizesText, len));
    setYardsText(convertList(yardsText, yarn));
    setBust(convertOne(bust, len));
    setPerSkein(convertOne(perSkein, yarn));
    setResults(null); // old advice is in the old units
    setUnits(next);
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

  /* load Nana's notebook if it exists (stored only in this browser) */
  useEffect(() => {
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

  const forgetMe = () => {
    try {
      localStorage.removeItem("nana-notebook");
    } catch (e) {
      /* ignore */
    }
    setSaveMsg(t("save.forgotten"));
  };

  const askNana = () => {
    const pg = parseFloat(patternGauge);
    const ug = parseFloat(myGauge);
    const b = parseFloat(bust);
    const sizes = parseList(sizesText);
    const yards = parseList(yardsText);
    const per = parseFloat(perSkein);
    const cnt = parseFloat(skeins);
    const ease = easeOptions[easeIdx].v;
    const closeGap = inch ? 1 : 2.5;

    if (!sizes.length || !isFinite(b) || b <= 0) {
      setResults({ error: t("result.error") });
      return;
    }

    const target = b + ease;
    const haveUserGauge = isFinite(ug) && ug > 0 && isFinite(pg) && pg > 0;

    /* pick the best size */
    const fitOf = (s) => (haveUserGauge ? (s * pg) / ug : s);
    let bestIdx = 0;
    sizes.forEach((s, i) => {
      if (Math.abs(fitOf(s) - target) < Math.abs(fitOf(sizes[bestIdx]) - target)) bestIdx = i;
    });
    const best = sizes[bestIdx];

    /* is a neighbor size nearly as good? */
    let runnerUp = null;
    sizes.forEach((s, i) => {
      if (i === bestIdx) return;
      const d = Math.abs(fitOf(s) - target) - Math.abs(fitOf(best) - target);
      if (d >= 0 && d <= closeGap) {
        if (runnerUp === null || Math.abs(s - best) < Math.abs(runnerUp - best)) runnerUp = s;
      }
    });

    let sizeMsg = t("result.size.main", {
      best,
      lenU,
      b,
      easeLabel: easeOptions[easeIdx].label.toLowerCase(),
      target: r1(target),
    });
    if (runnerUp !== null) {
      sizeMsg += t("result.size.runnerUp", { runnerUp });
    }

    /* yarn check */
    let yarnMsg = "";
    let yarnTone = "ok";
    if (!yards.length) {
      yarnMsg = t("result.yarn.needSizes");
      yarnTone = "ask";
    } else if (yards.length <= bestIdx) {
      yarnMsg = t("result.yarn.listShort");
      yarnTone = "warn";
    } else if (!isFinite(per) || per <= 0 || !isFinite(cnt) || cnt <= 0) {
      yarnMsg = t("result.yarn.askBasket", { need: yards[bestIdx], yarnU });
      yarnTone = "ask";
    } else {
      const need = yards[bestIdx];
      const buffered = Math.ceil(need * 1.1);
      const have = per * cnt;
      if (have >= buffered) {
        yarnMsg = t("result.yarn.allSet", { have: r1(have), best, need, buffered, yarnU });
      } else if (have >= need) {
        yarnMsg = t("result.yarn.justCovers", { have: r1(have), need, buffered, yarnU });
        yarnTone = "warn";
      } else {
        const short = buffered - have;
        const moreSkeins = Math.ceil(short / per);
        yarnMsg = t("result.yarn.short", {
          have: r1(have),
          need,
          buffered,
          shortAmt: Math.ceil(short),
          moreSkeins,
          yarnU,
        });
        yarnTone = "warn";
      }
      if (yards.length !== sizes.length) {
        yarnMsg += t("result.yarn.mismatch");
      }
    }

    /* gauge check */
    let gaugeMsg = "";
    let gaugeTone = "ok";
    if (!isFinite(pg) || pg <= 0) {
      gaugeMsg = t("result.gauge.askPattern", { gaugeLabel });
      gaugeTone = "ask";
    } else if (!isFinite(ug) || ug <= 0) {
      gaugeMsg = t("result.gauge.askYours", { gaugeLabel });
      gaugeTone = "ask";
    } else if (Math.abs(ug - pg) < 0.25) {
      gaugeMsg = t("result.gauge.match", { ug, pg, gaugeLabel, best });
    } else {
      const actual = r1((best * pg) / ug);
      const tighter = ug > pg;
      gaugeMsg = t("result.gauge.off", {
        tighter,
        ug,
        pg,
        gaugeLabel,
        best,
        actual,
        lenU,
        craft,
      });
      gaugeTone = "warn";
    }

    /* length check
       Stitch gauge only ever answers "how wide". Row gauge is what decides
       whether a body or a sleeve ends up the length the pattern intended, and
       it is the gauge knitters most often skip swatching for. */
    const prg = parseFloat(patternRowGauge);
    const urg = parseFloat(myRowGauge);
    let rowMsg = "";
    let rowTone = "ok";
    if (!isFinite(prg) || prg <= 0) {
      rowMsg = t("result.row.askPattern", { rowGaugeLabel });
      rowTone = "ask";
    } else if (!isFinite(urg) || urg <= 0) {
      rowMsg = t("result.row.askYours", { rowGaugeLabel });
      rowTone = "ask";
    } else if (Math.abs(urg - prg) < 0.25) {
      rowMsg = t("result.row.match", { urg, prg, rowGaugeLabel });
    } else {
      /* Per 100 rows, because patterns quote row counts, not inches. */
      const intended = r1((100 / prg) * swatchSpan);
      const yours = r1((100 / urg) * swatchSpan);
      const needed = Math.round((100 * urg) / prg);
      const tighter = urg > prg;
      rowMsg = t("result.row.off", {
        tighter,
        urg,
        prg,
        rowGaugeLabel,
        yours,
        intended,
        lenU,
        needed,
      });
      rowTone = "warn";
    }

    setProverb(proverbs[Math.floor(Math.random() * proverbs.length)]);
    setResults({ sizeMsg, yarnMsg, yarnTone, gaugeMsg, gaugeTone, rowMsg, rowTone });
    setTimeout(() => {
      if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  /* ---------- shared field styles ---------- */
  const labelStyle = {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#8A755F",
  };
  const inputStyle = {
    background: "#FFFFFF",
    border: `2px solid ${C.line}`,
    borderRadius: 12,
    color: C.espresso,
    fontFamily: "'Nunito', sans-serif",
  };

  const Toggle = ({ value, current, set, children }) => (
    <button
      type="button"
      onClick={() => set(value)}
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
        input::placeholder, textarea::placeholder { color: #B9A68F; }
        summary { cursor: pointer; }
      `}</style>

      {/* header */}
      <header className="max-w-2xl mx-auto px-5 pt-8 pb-2">
        {/* language switch */}
        <div className="flex justify-end mb-2">
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
              className="nk-focus px-3 py-1 text-xs font-bold transition-colors"
              style={{
                fontFamily: "'Nunito', sans-serif",
                background: lang === "en" ? C.sage : "transparent",
                color: lang === "en" ? "#FFF" : C.sageDark,
              }}
            >
              {t("lang.en")}
            </button>
            <button
              type="button"
              onClick={() => setLang("es")}
              aria-pressed={lang === "es"}
              aria-label={t("lang.switchToEs")}
              className="nk-focus px-3 py-1 text-xs font-bold transition-colors"
              style={{
                fontFamily: "'Nunito', sans-serif",
                background: lang === "es" ? C.sage : "transparent",
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
        <div className="flex flex-wrap items-center gap-2">
          <Toggle value="knit" current={craft} set={setCraft}>{t("toggle.knitting")}</Toggle>
          <Toggle value="crochet" current={craft} set={setCraft}>{t("toggle.crochet")}</Toggle>
          <span className="mx-1" style={{ color: C.line }}>|</span>
          <Toggle value="in" current={units} set={switchUnits}>{t("toggle.inYds")}</Toggle>
          <Toggle value="cm" current={units} set={switchUnits}>{t("toggle.cmM")}</Toggle>
        </div>

        {/* card: pattern */}
        <section className="rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
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
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span style={labelStyle}>{t("field.yarnNeeded", { yarnU })}</span>
              <input style={inputStyle} className="px-3 py-2.5 text-sm" value={yardsText} onChange={(e) => setYardsText(e.target.value)} placeholder={ph.yards} />
            </label>
          </div>
        </section>

        {/* card: you */}
        <section className="rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
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
        </section>

        {/* card: yarn basket */}
        <section className="rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
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
          type="button"
          onClick={askNana}
          className="nk-focus w-full py-4 rounded-2xl text-xl transition-transform active:scale-[0.99]"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, background: C.rose, color: "#FFF", boxShadow: `0 4px 0 ${C.roseDark}` }}
        >
          {t("button.ask")}
        </button>

        {/* remember me */}
        <div className="flex flex-wrap items-center gap-3 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <button type="button" onClick={rememberMe} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.sageDark }}>
            {t("remember.save")}
          </button>
          <button type="button" onClick={forgetMe} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: "#A08B74" }}>
            {t("remember.forget")}
          </button>
          {saveMsg && <span style={{ color: "#8A755F" }}>{saveMsg}</span>}
        </div>

        {/* results */}
        <div ref={resultsRef} aria-live="polite">
          {results && results.error && (
            <div className="rounded-2xl p-5 nk-pop flex gap-4 items-start" style={{ background: "#FDF0E4", border: `2px dashed ${C.butter}` }}>
              <div className="shrink-0"><Nana size={64} bob={false} label={t("nana.alt")} /></div>
              <p className="text-sm leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif" }}>{results.error}</p>
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
              <AdviceCard color={C.rose} title={t("advice.size")}>{results.sizeMsg}</AdviceCard>
              <AdviceCard color={C.butter} title={t("advice.yarn")} tone={results.yarnTone === "warn" ? "warn" : "ok"}>{results.yarnMsg}</AdviceCard>
              <AdviceCard color={C.sage} title={t("advice.tension")} tone={results.gaugeTone === "warn" ? "warn" : "ok"}>{results.gaugeMsg}</AdviceCard>
              <AdviceCard color={C.sageDark} title={t("advice.length")} tone={results.rowTone === "warn" ? "warn" : "ok"}>{results.rowMsg}</AdviceCard>
            </div>
          )}
        </div>

        {/* how the math works */}
        <details className="rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
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
      <footer className="max-w-2xl mx-auto px-5 pb-10 pt-2 text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="flex justify-center gap-2 mb-3" aria-hidden="true">
          <GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} />
        </div>
        <p className="text-xs" style={{ color: "#8A755F" }}>
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
