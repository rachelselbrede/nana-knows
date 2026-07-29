import { useState, useEffect, useRef } from "react";

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
const parseList = (t) =>
  String(t || "")
    .split(/[^0-9.]+/)
    .map(parseFloat)
    .filter((n) => isFinite(n) && n > 0);

const r1 = (n) => Math.round(n * 10) / 10;

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
function Nana({ size = 150, bob = true }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 210"
      role="img"
      aria-label="Nana Purl, a smiling grandma holding a ball of yarn"
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
  const [units, setUnits] = useState("in");
  const [craft, setCraft] = useState("knit");

  const [patternGauge, setPatternGauge] = useState("");
  const [sizesText, setSizesText] = useState("");
  const [yardsText, setYardsText] = useState("");

  const [bust, setBust] = useState("");
  const [easeIdx, setEaseIdx] = useState(2);
  const [myGauge, setMyGauge] = useState("");

  const [perSkein, setPerSkein] = useState("");
  const [skeins, setSkeins] = useState("");

  const [results, setResults] = useState(null);
  const [proverb, setProverb] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const resultsRef = useRef(null);

  const inch = units === "in";
  const lenU = inch ? "in" : "cm";
  const yarnU = inch ? "yds" : "m";
  const gaugeLabel = inch ? "stitches per 4 in" : "stitches per 10 cm";
  const tool = craft === "knit" ? "needle" : "hook";

  const easeOptions = [
    { label: `Snug (${inch ? "-2 in" : "-5 cm"})`, v: inch ? -2 : -5 },
    { label: "Right on the body (0)", v: 0 },
    { label: `Classic comfy (${inch ? "+2 in" : "+5 cm"})`, v: inch ? 2 : 5 },
    { label: `Relaxed (${inch ? "+4 in" : "+10 cm"})`, v: inch ? 4 : 10 },
    { label: `Oversized (${inch ? "+6 in" : "+15 cm"})`, v: inch ? 6 : 15 },
  ];

  const proverbs =
    craft === "knit"
      ? [
          "Measure twice, cast on once.",
          "There is no such thing as too much yarn, only too little shelf.",
          "Swatches are like biscuits. Always make one more.",
          "A cup of tea makes the math sweeter.",
          "Frogging builds character, dear.",
        ]
      : [
          "Chain, chain, then check again.",
          "There is no such thing as too much yarn, only too little shelf.",
          "Swatches are like biscuits. Always make one more.",
          "A cup of tea makes the math sweeter.",
          "One more row never hurt anybody.",
        ];

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
        if (d.perSkein) setPerSkein(d.perSkein);
        if (d.skeins) setSkeins(d.skeins);
        setSaveMsg("Nana remembered you from last time.");
      }
    } catch (e) {
      /* nothing saved yet, and that is fine */
    }
  }, []);

  const rememberMe = () => {
    try {
      localStorage.setItem(
        "nana-notebook",
        JSON.stringify({ units, craft, bust, easeIdx, myGauge, perSkein, skeins })
      );
      setSaveMsg("Written in Nana's notebook. Saved just for you, in this browser.");
    } catch (e) {
      setSaveMsg("Nana's notebook is not handy right now, dear. Your numbers still work for this visit.");
    }
  };

  const forgetMe = () => {
    try {
      localStorage.removeItem("nana-notebook");
    } catch (e) {
      /* ignore */
    }
    setSaveMsg("Nana tore out the page. All forgotten.");
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
      setResults({
        error:
          "Before Nana can advise, she needs two things: the finished sizes your pattern offers, and your own measurement. Fill those in and ask again, dear.",
      });
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

    let sizeMsg = `Make the size ${best}, the one with a finished measurement of ${best} ${lenU}. You measure ${b} ${lenU} and chose ${easeOptions[easeIdx].label.toLowerCase()}, so you are aiming for about ${r1(target)} ${lenU} around.`;
    if (runnerUp !== null) {
      sizeMsg += ` The size ${runnerUp} is a close call too. When torn between two, go smaller for stretchy, clingy fabrics and larger for drape and layering.`;
    }

    /* yarn check */
    let yarnMsg = "";
    let yarnTone = "ok";
    if (!yards.length) {
      yarnMsg = "Add the yardage each size calls for, and Nana will count your skeins for you.";
      yarnTone = "ask";
    } else if (yards.length <= bestIdx) {
      yarnMsg =
        "Your sizes list is longer than your yardage list, so Nana cannot see the yardage for your size. Double check those two lists match up, dear.";
      yarnTone = "warn";
    } else if (!isFinite(per) || per <= 0 || !isFinite(cnt) || cnt <= 0) {
      yarnMsg = `That size calls for about ${yards[bestIdx]} ${yarnU}. Tell Nana what is in your basket (${yarnU} per skein and how many) and she will check if it is enough.`;
      yarnTone = "ask";
    } else {
      const need = yards[bestIdx];
      const buffered = Math.ceil(need * 1.1);
      const have = per * cnt;
      if (have >= buffered) {
        yarnMsg = `You have ${r1(have)} ${yarnU} and the size ${best} calls for about ${need} ${yarnU}. Even with Nana's 10% just-in-case cushion (${buffered} ${yarnU}), you are all set. Cast on with a clear conscience.`;
      } else if (have >= need) {
        yarnMsg = `You have ${r1(have)} ${yarnU} and the pattern asks for ${need} ${yarnU}. That covers it, but only just. Nana likes a 10% cushion (${buffered} ${yarnU}), so one more skein would help her sleep at night.`;
        yarnTone = "warn";
      } else {
        const short = buffered - have;
        const moreSkeins = Math.ceil(short / per);
        yarnMsg = `Oh dear. You have ${r1(have)} ${yarnU} but this size wants ${need} ${yarnU} (${buffered} with a safe cushion). Pick up about ${Math.ceil(short)} more ${yarnU}, roughly ${moreSkeins} more ${moreSkeins === 1 ? "skein" : "skeins"}, before you start.`;
        yarnTone = "warn";
      }
      if (yards.length !== sizes.length) {
        yarnMsg += " P.S. Your sizes and yardage lists are different lengths, so give them a quick once-over.";
      }
    }

    /* gauge check */
    let gaugeMsg = "";
    let gaugeTone = "ok";
    if (!isFinite(pg) || pg <= 0) {
      gaugeMsg = `Pop the pattern's gauge in (${gaugeLabel}) and Nana can tell you how your own tension changes things.`;
      gaugeTone = "ask";
    } else if (!isFinite(ug) || ug <= 0) {
      gaugeMsg = `Work a little swatch and tell Nana your ${gaugeLabel}. It is the difference between a sweater and a surprise.`;
      gaugeTone = "ask";
    } else if (Math.abs(ug - pg) < 0.25) {
      gaugeMsg = `Your tension matches the pattern beautifully (${ug} vs ${pg} ${gaugeLabel}). Follow the size ${best} numbers as written. Lovely hands, dear.`;
    } else {
      const actual = r1((best * pg) / ug);
      const tighter = ug > pg;
      gaugeMsg = `Your stitches are a touch ${tighter ? "tighter" : "looser"} than the pattern's (${ug} vs ${pg} ${gaugeLabel}), so the size ${best} instructions would come out near ${actual} ${lenU} in your hands. Nana already picked your size with that in mind. If you would rather match the pattern exactly, try a ${tighter ? "larger" : "smaller"} ${tool} and swatch again.`;
      gaugeTone = "warn";
    }

    setProverb(proverbs[Math.floor(Math.random() * proverbs.length)]);
    setResults({ sizeMsg, yarnMsg, yarnTone, gaugeMsg, gaugeTone });
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
        <div className="flex items-end gap-4 sm:gap-6">
          <div className="shrink-0">
            <Nana size={140} />
          </div>
          <div className="pb-2">
            <h1
              className="leading-none"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "clamp(34px, 8vw, 52px)" }}
            >
              Nana Knows
            </h1>
            <p className="mt-2 text-sm sm:text-base" style={{ fontFamily: "'Nunito', sans-serif", color: "#6B5847" }}>
              Tell Nana Purl about your pattern, your yarn, and yourself. She will tell you what size to make, whether your stash will stretch, and what your gauge is up to.
            </p>
            <p className="mt-2 text-xs font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: C.sageDark }}>
              Free forever · No account · Knit and crochet welcome
            </p>
          </div>
        </div>
      </header>
      <div className="nk-edge" aria-hidden="true" />

      <main className="max-w-2xl mx-auto px-5 py-7 flex flex-col gap-5">
        {/* toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <Toggle value="knit" current={craft} set={setCraft}>Knitting</Toggle>
          <Toggle value="crochet" current={craft} set={setCraft}>Crochet</Toggle>
          <span className="mx-1" style={{ color: C.line }}>|</span>
          <Toggle value="in" current={units} set={setUnits}>in / yds</Toggle>
          <Toggle value="cm" current={units} set={setUnits}>cm / m</Toggle>
        </div>

        {/* card: pattern */}
        <section className="rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
          <div className="flex items-center gap-2 mb-4">
            <GrannySquare />
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22 }}>The pattern</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>Pattern gauge ({gaugeLabel})</span>
              <input inputMode="decimal" style={inputStyle} className="px-3 py-2.5 text-sm" value={patternGauge} onChange={(e) => setPatternGauge(e.target.value)} placeholder="e.g. 18" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>Finished sizes, smallest to largest ({lenU})</span>
              <input style={inputStyle} className="px-3 py-2.5 text-sm" value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder="e.g. 32, 36, 40, 44, 48, 52" />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span style={labelStyle}>Yarn needed per size, same order ({yarnU})</span>
              <input style={inputStyle} className="px-3 py-2.5 text-sm" value={yardsText} onChange={(e) => setYardsText(e.target.value)} placeholder="e.g. 900, 1000, 1100, 1250, 1400, 1550" />
            </label>
          </div>
        </section>

        {/* card: you */}
        <section className="rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
          <div className="flex items-center gap-2 mb-4">
            <GrannySquare />
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22 }}>You, dear</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>Your bust / chest ({lenU})</span>
              <input inputMode="decimal" style={inputStyle} className="px-3 py-2.5 text-sm" value={bust} onChange={(e) => setBust(e.target.value)} placeholder="e.g. 38" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>How do you like it to fit?</span>
              <select style={inputStyle} className="px-3 py-2.5 text-sm nk-focus" value={easeIdx} onChange={(e) => setEaseIdx(Number(e.target.value))}>
                {easeOptions.map((o, i) => (
                  <option key={i} value={i}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>Your swatch gauge, optional ({gaugeLabel})</span>
              <input inputMode="decimal" style={inputStyle} className="px-3 py-2.5 text-sm" value={myGauge} onChange={(e) => setMyGauge(e.target.value)} placeholder="e.g. 19" />
            </label>
          </div>
        </section>

        {/* card: yarn basket */}
        <section className="rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
          <div className="flex items-center gap-2 mb-4">
            <GrannySquare />
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22 }}>Your yarn basket</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>{yarnU} per skein</span>
              <input inputMode="decimal" style={inputStyle} className="px-3 py-2.5 text-sm" value={perSkein} onChange={(e) => setPerSkein(e.target.value)} placeholder="e.g. 220" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>Skeins you have</span>
              <input inputMode="decimal" style={inputStyle} className="px-3 py-2.5 text-sm" value={skeins} onChange={(e) => setSkeins(e.target.value)} placeholder="e.g. 5" />
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
          Ask Nana
        </button>

        {/* remember me */}
        <div className="flex flex-wrap items-center gap-3 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <button type="button" onClick={rememberMe} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.sageDark }}>
            Nana, remember my numbers
          </button>
          <button type="button" onClick={forgetMe} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: "#A08B74" }}>
            Forget me
          </button>
          {saveMsg && <span style={{ color: "#8A755F" }}>{saveMsg}</span>}
        </div>

        {/* results */}
        <div ref={resultsRef} aria-live="polite">
          {results && results.error && (
            <div className="rounded-2xl p-5 nk-pop flex gap-4 items-start" style={{ background: "#FDF0E4", border: `2px dashed ${C.butter}` }}>
              <div className="shrink-0"><Nana size={64} bob={false} /></div>
              <p className="text-sm leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif" }}>{results.error}</p>
            </div>
          )}
          {results && !results.error && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 nk-pop">
                <div className="shrink-0 mt-1"><Nana size={72} bob={false} /></div>
                <div className="relative rounded-2xl px-4 py-3" style={{ background: "#F3E7EC", border: `2px solid ${C.rose}` }}>
                  <p className="text-sm italic" style={{ fontFamily: "'Nunito', sans-serif", color: C.roseDark }}>
                    "{proverb}" Here is what Nana thinks, dear:
                  </p>
                </div>
              </div>
              <AdviceCard color={C.rose} title="The right size">{results.sizeMsg}</AdviceCard>
              <AdviceCard color={C.butter} title="Your yarn basket" tone={results.yarnTone === "warn" ? "warn" : "ok"}>{results.yarnMsg}</AdviceCard>
              <AdviceCard color={C.sage} title="Your tension" tone={results.gaugeTone === "warn" ? "warn" : "ok"}>{results.gaugeMsg}</AdviceCard>
            </div>
          )}
        </div>

        {/* how the math works */}
        <details className="rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
          <summary className="nk-focus font-bold" style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>
            How does Nana figure it out?
          </summary>
          <div className="mt-3 text-sm leading-relaxed flex flex-col gap-2" style={{ fontFamily: "'Nunito', sans-serif", color: "#5C4B3E" }}>
            <p><strong>Size:</strong> your body measurement plus your chosen ease gives a target. Nana picks the pattern size whose finished measurement lands closest to it. If you gave her your own gauge, she first adjusts each size to how it would really come out in your hands.</p>
            <p><strong>Yarn:</strong> she reads the yardage for your size, adds a 10% cushion because running out at the second sleeve is heartbreak, and compares it with skeins times yardage in your basket.</p>
            <p><strong>Tension:</strong> finished width is stitch count divided by gauge. If your gauge differs from the pattern's, the same instructions produce a different size, so she does that arithmetic for you.</p>
          </div>
        </details>
      </main>

      {/* footer */}
      <footer className="max-w-2xl mx-auto px-5 pb-10 pt-2 text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="flex justify-center gap-2 mb-3" aria-hidden="true">
          <GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} />
        </div>
        <p className="text-xs" style={{ color: "#8A755F" }}>
          Nana Knows is free forever. Your numbers stay in your own notebook, never sold, never shared. Made with love and leftover yarn.
        </p>
      </footer>
    </div>
  );
}
