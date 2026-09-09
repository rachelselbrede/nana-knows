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
} from "./lib/parse.js";
import { adviseSize, adviseYarn, adviseGauge, adviseRows, sizeTable } from "./lib/advice.js";
import { readShareLink, buildShareUrl } from "./lib/share.js";
import { readNotebook, notebookInUnits, writeNotebook, clearNotebook } from "./lib/notebook.js";
import { adviceAsText } from "./lib/words.js";
import { C } from "./palette.js";
import { GlobalStyle } from "./components/GlobalStyle.jsx";
import { Header } from "./components/Header.jsx";
import { Toggles } from "./components/Toggles.jsx";
import { RememberRow } from "./components/RememberRow.jsx";
import { MathNote } from "./components/MathNote.jsx";
import { DesignersNote } from "./components/DesignersNote.jsx";
import { Footer } from "./components/Footer.jsx";
import { PatternCard } from "./components/PatternCard.jsx";
import { YouCard } from "./components/YouCard.jsx";
import { BasketCard } from "./components/BasketCard.jsx";
import { Results } from "./components/Results.jsx";

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

  /* Everything the cards draw and write, in two bags, so the cards can be
     ordinary components and the state can stay here where askNana, the
     link and the notebook all need it. */
  const fields = { patternGauge, patternRowGauge, sizesText, yardsText, bust, easeIdx, myGauge, myRowGauge, perSkein, skeins };
  const setters = {
    patternGauge: setPatternGauge,
    patternRowGauge: setPatternRowGauge,
    sizesText: setSizesText,
    yardsText: setYardsText,
    bust: setBust,
    easeIdx: setEaseIdx,
    myGauge: setMyGauge,
    myRowGauge: setMyRowGauge,
    perSkein: setPerSkein,
    skeins: setSkeins,
  };
  const labels = { inch, units, lenU, yarnU, gaugeLabel, rowGaugeLabel, swatchSpan };

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

    let remembered = false;
    if (notebook) {
      const nb = notebookInUnits(notebook, finalUnits);
      if (nb.easeIdx !== null) setEaseIdx(nb.easeIdx);
      Object.entries(nb.fields).forEach(([field, v]) => setters[field](v));
      remembered = Object.keys(nb.fields).length > 0;
    }

    if (!link) {
      if (notebook) setSaveMsg("save.remembered");
      return;
    }
    if (link.easeIdx !== null) setEaseIdx(link.easeIdx);
    Object.entries(link.fields).forEach(([field, v]) => setters[field](v));

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
      <GlobalStyle />

      <Header t={t} lang={lang} setLang={setLang} />

      <main className="max-w-2xl mx-auto px-5 py-7 flex flex-col gap-5">
        <Toggles t={t} craft={craft} setCraft={setCraft} units={units} switchUnits={switchUnits} />

        {/* Everything from here to the Ask button is one form, so that pressing
            Enter in any field asks Nana, as a visitor would expect. */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            askNana();
          }}
          className="flex flex-col gap-5"
        >

          <PatternCard t={t} fields={fields} setters={setters} labels={labels} ph={ph} />
          <YouCard t={t} fields={fields} setters={setters} labels={labels} ph={ph} easeOptions={easeOptions} />
          <BasketCard t={t} fields={fields} setters={setters} labels={labels} ph={ph} craft={craft} results={results} />

          {/* ask button */}
          <button
            type="submit"
            className="nk-noprint nk-focus w-full py-4 rounded-2xl text-xl transition-transform active:scale-[0.99]"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, background: C.rose, color: C.onAccent, boxShadow: `0 4px 0 ${C.roseDark}` }}
          >
            {t("button.ask")}
          </button>
        </form>

        <RememberRow t={t} rememberMe={rememberMe} forgetMe={forgetMe} shareLink={shareLink} saveMsg={saveMsg} />

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

        <MathNote t={t} />
        <DesignersNote t={t} />
      </main>

      <Footer t={t} />
    </div>
  );
}
