import { useState, useEffect, useRef } from "react";
import { useI18n } from "./i18n/index.jsx";
import {
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
import { adviseSize, adviseYarn, adviseGauge, adviseRows, sizeTable, adviseSubstitute, ballsFor } from "./lib/advice.js";
import { readShareLink, buildShareUrl } from "./lib/share.js";
import { readNotebook, notebookInUnits, writeNotebook, clearNotebook } from "./lib/notebook.js";
import { said, adviceAsText } from "./lib/words.js";
import { C } from "./palette.js";
import { GrannySquare } from "./components/GrannySquare.jsx";
import { MeasureBust } from "./components/MeasureBust.jsx";
import { Nana } from "./components/Nana.jsx";
import { Toggle } from "./components/Toggle.jsx";
import { ParseEcho } from "./components/ParseEcho.jsx";
import { Results } from "./components/Results.jsx";
import { labelStyle, inputStyle } from "./components/fieldStyles.js";

/* Parsing, unit conversion and all of Nana's arithmetic now live in src/lib,
   where they are pure and covered by tests. See src/lib/parse.js for why the
   comma is such hard work, and src/lib/advice.js for the sizing maths. */

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
  /* The substitution helper's one field: the gauge printed on a ball band. */
  const [bandGauge, setBandGauge] = useState("");

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
  /* What to say once a shared link has been answered: depends on whether the
     notebook chipped in, which is known at load time, not at answer time. */
  const loadedMsg = useRef("share.loaded");

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
    setBandGauge(convertOne(bandGauge, gauge));
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

  /* Where the first numbers come from, settled in one place because the two
     sources interact. A shared link wins whatever it carries. The notebook —
     the knitter's own measurements, saved in this browser — is opened as
     well, unless the link carries personal numbers of its own, in which case
     mixing hers with someone else's would be wrong. So a designer's link,
     which holds only the pattern, arrives with the knitter's bust, gauge and
     basket already filled in, and when that adds up to enough, Nana answers
     on the spot. The reading and validating of both sources lives in
     src/lib, where it is tested; this effect only decides who wins. */
  useEffect(() => {
    const link = readShareLink(window.location.search);
    let notebook = null;
    if (!link || !link.hasPersonal) {
      try {
        notebook = readNotebook(localStorage);
      } catch (e) {
        /* no storage at all, and that is fine */
      }
    }
    const finalUnits = (link && link.units) ?? (notebook && notebook.units) ?? null;
    if (finalUnits) setUnits(finalUnits);

    if (link && link.craft) setCraft(link.craft);
    else if (notebook && notebook.craft) setCraft(notebook.craft);

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
    let remembered = false;
    if (notebook) {
      const nb = notebookInUnits(notebook, finalUnits);
      if (nb.easeIdx !== null) setEaseIdx(nb.easeIdx);
      Object.entries(nb.fields).forEach(([field, v]) => setter[field](v));
      remembered = Object.keys(nb.fields).length > 0;
    }

    if (!link) {
      if (notebook) setSaveMsg("save.remembered");
      return;
    }
    if (link.easeIdx !== null) setEaseIdx(link.easeIdx);
    Object.entries(link.fields).forEach(([field, v]) => setter[field](v));

    /* Enough to answer: sizes from the link, a measurement from either. */
    const msg = remembered ? "share.loadedRemembered" : "share.loaded";
    if (link.fields.sizesText && (link.fields.bust || (notebook && notebook.fields.bust))) {
      loadedMsg.current = msg;
      setPendingAutoRun(true);
    } else {
      setSaveMsg(msg);
    }
  }, []);

  const rememberMe = () => {
    try {
      writeNotebook(localStorage, { units, craft, easeIdx, bust, myGauge, myRowGauge, perSkein, skeins });
      setSaveMsg("save.written");
    } catch (e) {
      setSaveMsg("save.notHandy");
    }
  };

  const shareLink = async () => {
    const url = buildShareUrl(window.location.href, {
      lang,
      units,
      craft,
      easeIdx,
      fields: { patternGauge, patternRowGauge, sizesText, yardsText, bust, myGauge, myRowGauge, perSkein, skeins },
    });
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
      clearNotebook(localStorage);
    } catch (e) {
      /* ignore */
    }
    setSaveMsg("save.forgotten");
  };

  /* Plain text for a Ravelry project note, built from the same words as the
     cards. Assembled in src/lib/words.js, next to the sentences themselves. */
  const copyAdvice = async () => {
    if (!results || results.error) return;
    const text = adviceAsText(t, results, craft, proverb);
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

  const proverb = proverbs[proverbIdx % proverbs.length];

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

  /* ---------- the substitution helper ----------
     Nothing to apply: it only advises, live, from the band gauge against the
     pattern's. The ball count comes from the yarn card's own cushioned need,
     so the two cannot disagree — and it can only be counted once Nana has
     been asked, because before that there is no size to count for. */
  const substitute = adviseSubstitute({ patternGauge, bandGauge });
  const substituteNeed = results && results.yarn && results.yarn.buffered ? results.yarn.buffered : null;
  const substituteBalls = ballsFor(substituteNeed, perSkein);
  const substituteBallsText = () => {
    if (substitute === null || substitute.kind === "askPattern") return "";
    if (substituteBalls !== null) {
      return t("substitute.balls", { balls: substituteBalls, best: results.size.best, buffered: substituteNeed, yarnU: said(t, results).yarnU });
    }
    if (substituteNeed === null) return t("substitute.askFirst");
    return t("substitute.needPerSkein", { yarnU });
  };

  /* A shared link filled the form; run Nana once the inputs have settled. */
  useEffect(() => {
    if (!pendingAutoRun) return;
    setPendingAutoRun(false);
    askNana();
    setSaveMsg(loadedMsg.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutoRun]);

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

            {/* the substitution helper */}
            <details className="mt-4 rounded-xl" style={{ background: C.oat, border: `1.5px dashed ${C.line}` }}>
              <summary className="cursor-pointer px-4 py-3 text-sm nk-focus" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: C.sageDark }}>
                {t("substitute.summary")}
              </summary>
              <div className="px-4 pb-4 text-sm" style={{ color: C.espresso }}>
                <p className="mb-3">{t("substitute.intro")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                  <label className="flex flex-col gap-1.5">
                    <span style={labelStyle}>{t("substitute.bandGauge", { gaugeLabel })}</span>
                    <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={bandGauge} onChange={(e) => setBandGauge(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} placeholder={ph.bandGauge} />
                  </label>
                </div>
                {/* Two live lines: the verdict, then the ball count. Warn-toned
                    verdicts wear the rose, like the cards. */}
                <p className="mt-2 text-sm" role="status" style={{ minHeight: "1.2em", color: substitute && substitute.tone === "warn" ? C.roseDark : C.sageDark }}>
                  {substitute ? t(`substitute.${substitute.kind}`, { ...substitute, gaugeLabel, craft }) : ""}
                </p>
                <p className="mt-1 text-xs" role="status" style={{ minHeight: "1.2em", color: C.sageDark }}>
                  {substituteBallsText()}
                </p>
                <p className="mt-3 text-xs" style={{ color: C.sageDark }}>{t("substitute.tip")}</p>
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

        <Results
          t={t}
          results={results}
          craft={craft}
          proverb={proverb}
          askCount={askCount}
          resultsRef={resultsRef}
          headingRef={headingRef}
          copyAdvice={copyAdvice}
          printAdvice={printAdvice}
          copyMsg={copyMsg}
        />

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

        {/* the one section written for designers, at the foot of the page */}
        <details className="nk-noprint rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
          <summary className="nk-focus font-bold" style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>
            {t("designers.summary")}
          </summary>
          <div className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif", color: "#5C4B3E" }}>
            <p>{t("designers.intro")}</p>
            <ol className="list-decimal pl-5 mt-2 flex flex-col gap-1.5">
              {t("designers.steps").map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <p className="mt-3" style={{ color: C.sageDark }}>{t("designers.note")}</p>
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
