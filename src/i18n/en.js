/* English strings for Nana Knows.
   Values are either plain strings or functions that take an interpolation
   object. Nana Purl's name is never translated. Unit abbreviations (in, cm,
   yds, m) are language-neutral and stay in the component; only the words
   around them live here. Numbers keep a period decimal so they survive the
   comma-aware parseList. */
export default {
  meta: {
    title: "Nana Knows · What size to make, and will your yarn stretch?",
    description:
      "Tell Nana Purl about your pattern, your yarn, and yourself. Free sizing, yardage, and gauge advice for knitters and crocheters. No account, nothing collected.",
  },

  lang: {
    toggleLabel: "Language",
    en: "EN",
    es: "ES",
    switchToEs: "Cambiar a español",
    switchToEn: "Switch to English",
  },

  nana: {
    alt: "Nana Purl, a smiling grandma holding a ball of yarn",
  },

  header: {
    tagline:
      "Tell Nana Purl about your pattern, your yarn, and yourself. She will tell you what size to make, whether your stash will stretch, and what your gauge is up to.",
    badge: "Free forever · No account · Knit and crochet welcome",
  },

  toggle: {
    knitting: "Knitting",
    crochet: "Crochet",
    inYds: "in / yds",
    cmM: "cm / m",
  },

  label: {
    gaugeLabel: ({ inch }) => (inch ? "stitches per 4 in" : "stitches per 10 cm"),
    rowGaugeLabel: ({ inch }) => (inch ? "rows per 4 in" : "rows per 10 cm"),
  },

  card: {
    pattern: "The pattern",
    you: "You, dear",
    basket: "Your yarn basket",
  },

  field: {
    patternGauge: ({ gaugeLabel }) => `Pattern gauge (${gaugeLabel})`,
    patternRowGauge: ({ rowGaugeLabel }) => `Pattern row gauge, optional (${rowGaugeLabel})`,
    finishedSizes: ({ lenU }) => `Finished sizes, smallest to largest (${lenU})`,
    yarnNeeded: ({ yarnU }) => `Yarn needed per size, same order (${yarnU})`,
    bust: ({ lenU }) => `Your bust / chest (${lenU})`,
    fit: "How do you like it to fit?",
    swatchGauge: ({ gaugeLabel }) => `Your swatch gauge, optional (${gaugeLabel})`,
    swatchRowGauge: ({ rowGaugeLabel }) => `Your swatch row gauge, optional (${rowGaugeLabel})`,
    perSkein: ({ yarnU }) => `${yarnU} per skein`,
    skeinsYouHave: "Skeins you have",
  },

  ease: {
    labels: ({ inch }) => [
      `Snug (${inch ? "-2 in" : "-5 cm"})`,
      "Right on the body (0)",
      `Classic comfy (${inch ? "+2 in" : "+5 cm"})`,
      `Relaxed (${inch ? "+4 in" : "+10 cm"})`,
      `Oversized (${inch ? "+6 in" : "+15 cm"})`,
    ],
  },

  ph: ({ inch }) => ({
    gauge: "e.g. 18",
    rowGauge: "e.g. 24",
    myRowGauge: "e.g. 26",
    sizes: inch ? "e.g. 32, 36, 40, 44, 48, 52" : "e.g. 81, 91, 102, 112, 122, 132",
    yards: inch
      ? "e.g. 900, 1000, 1100, 1250, 1400, 1550"
      : "e.g. 825, 915, 1005, 1145, 1280, 1420",
    bust: inch ? "e.g. 38" : "e.g. 96",
    myGauge: "e.g. 19",
    perSkein: inch ? "e.g. 220" : "e.g. 200",
    skeins: "e.g. 5",
  }),

  button: { ask: "Ask Nana" },

  remember: {
    save: "Nana, remember my numbers",
    forget: "Forget me",
  },

  copy: {
    button: "Copy Nana's advice",
    print: "Print",
    heading: "Nana Knows — her advice for this project",
    done: "Copied. Paste it into your Ravelry notes or wherever you like.",
    failed:
      "Nana could not reach the clipboard, dear. Select the cards and copy them by hand instead.",
  },

  share: {
    button: "Copy a link to these numbers",
    copied:
      "Link copied. Send it to a friend and Nana will greet them with the very same numbers.",
    failed: "Nana put the link in your address bar, dear. Copy it from there to share.",
    loaded: "Nana opened this from a shared link.",
    note: "That link carries your numbers. Share it only with folks you would tell them to.",
  },

  measure: {
    summary: "How do I measure myself?",
    intro:
      "Your bust or chest is the number every other number leans on, dear. Slip off your bulky layers, pop a soft tape measure around the fullest part, and follow along.",
    alt: "A soft measuring tape wrapped around the fullest part of the bust, level all the way round",
    steps: [
      "Wear the bra or layer you plan to wear under the finished piece, so the fit matches real life.",
      "Wrap the tape around the fullest part of your bust, usually right across the nipple line.",
      "Keep the tape level, snug but not squeezing, and parallel to the floor all the way round.",
      "Breathe out gently and read the number where the tape meets, without pulling it tight.",
      "Take it twice. If the two readings differ, use the larger one and trust it.",
    ],
    tip: "No helper and no full-length mirror? Measure a sweater that already fits you well, laid flat, and double the width across the chest.",
  },

  save: {
    remembered: "Nana remembered you from last time.",
    written: "Written in Nana's notebook. Saved just for you, in this browser.",
    notHandy:
      "Nana's notebook is not handy right now, dear. Your numbers still work for this visit.",
    forgotten: "Nana tore out the page. All forgotten.",
  },

  advice: {
    size: "The right size",
    yarn: "Your yarn basket",
    tension: "Your tension",
    length: "Your length",
  },

  result: {
    error:
      "Before Nana can advise, she needs two things: the finished sizes your pattern offers, and your own measurement. Fill those in and ask again, dear.",
    intro: ({ proverb }) => `"${proverb}" Here is what Nana thinks, dear:`,

    size: {
      main: ({ best, lenU, b, easeLabel, target }) =>
        `Make the size ${best}, the one with a finished measurement of ${best} ${lenU}. You measure ${b} ${lenU} and chose ${easeLabel}, so you are aiming for about ${target} ${lenU} around.`,
      runnerUp: ({ runnerUp }) =>
        ` The size ${runnerUp} is a close call too. When torn between two, go smaller for stretchy, clingy fabrics and larger for drape and layering.`,
    },

    yarn: {
      needSizes: "Add the yardage each size calls for, and Nana will count your skeins for you.",
      listShort:
        "Your sizes list is longer than your yardage list, so Nana cannot see the yardage for your size. Double check those two lists match up, dear.",
      askBasket: ({ need, yarnU }) =>
        `That size calls for about ${need} ${yarnU}. Tell Nana what is in your basket (${yarnU} per skein and how many) and she will check if it is enough.`,
      allSet: ({ have, best, need, buffered, yarnU }) =>
        `You have ${have} ${yarnU} and the size ${best} calls for about ${need} ${yarnU}. Even with Nana's 10% just-in-case cushion (${buffered} ${yarnU}), you are all set. Cast on with a clear conscience.`,
      justCovers: ({ have, need, buffered, yarnU }) =>
        `You have ${have} ${yarnU} and the pattern asks for ${need} ${yarnU}. That covers it, but only just. Nana likes a 10% cushion (${buffered} ${yarnU}), so one more skein would help her sleep at night.`,
      short: ({ have, need, buffered, shortAmt, moreSkeins, yarnU }) =>
        `Oh dear. You have ${have} ${yarnU} but this size wants ${need} ${yarnU} (${buffered} with a safe cushion). Pick up about ${shortAmt} more ${yarnU}, roughly ${moreSkeins} more ${moreSkeins === 1 ? "skein" : "skeins"}, before you start.`,
      mismatch:
        " P.S. Your sizes and yardage lists are different lengths, so give them a quick once-over.",
    },

    gauge: {
      askPattern: ({ gaugeLabel }) =>
        `Pop the pattern's gauge in (${gaugeLabel}) and Nana can tell you how your own tension changes things.`,
      askYours: ({ gaugeLabel }) =>
        `Work a little swatch and tell Nana your ${gaugeLabel}. It is the difference between a sweater and a surprise.`,
      match: ({ ug, pg, gaugeLabel, best }) =>
        `Your tension matches the pattern beautifully (${ug} vs ${pg} ${gaugeLabel}). Follow the size ${best} numbers as written. Lovely hands, dear.`,
      off: ({ tighter, ug, pg, gaugeLabel, best, actual, lenU, craft }) => {
        const tool = craft === "knit" ? "needle" : "hook";
        return `Your stitches are a touch ${tighter ? "tighter" : "looser"} than the pattern's (${ug} vs ${pg} ${gaugeLabel}), so the size ${best} instructions would come out near ${actual} ${lenU} in your hands. Nana already picked your size with that in mind. If you would rather match the pattern exactly, try a ${tighter ? "larger" : "smaller"} ${tool} and swatch again.`;
      },
    },

    row: {
      askPattern: ({ rowGaugeLabel }) =>
        `Pop in the pattern's row gauge (${rowGaugeLabel}) and Nana can check your lengths as well as your widths. It is the one most of us skip, dear.`,
      askYours: ({ rowGaugeLabel }) =>
        `Count the rows in your swatch too (${rowGaugeLabel}) and Nana will tell you how long the pattern's rows will really come out.`,
      match: ({ urg, prg, rowGaugeLabel }) =>
        `Your rows match the pattern too (${urg} vs ${prg} ${rowGaugeLabel}). Work the lengths as written and they will come out right.`,
      off: ({ tighter, urg, prg, rowGaugeLabel, yours, intended, lenU, needed }) =>
        `Your rows are ${tighter ? "tighter" : "looser"} than the pattern's (${urg} vs ${prg} ${rowGaugeLabel}). Where it says work 100 rows, you would reach about ${yours} ${lenU} instead of ${intended} ${lenU} — so work about ${needed} rows to arrive at the same length. Measure your body and sleeves as you go rather than trusting the row count alone, and you will be fine.`,
    },
  },

  proverbs: {
    knit: [
      "Measure twice, cast on once.",
      "There is no such thing as too much yarn, only too little shelf.",
      "Swatches are like biscuits. Always make one more.",
      "A cup of tea makes the math sweeter.",
      "Frogging builds character, dear.",
    ],
    crochet: [
      "Chain, chain, then check again.",
      "There is no such thing as too much yarn, only too little shelf.",
      "Swatches are like biscuits. Always make one more.",
      "A cup of tea makes the math sweeter.",
      "One more row never hurt anybody.",
    ],
  },

  math: {
    summary: "How does Nana figure it out?",
    size:
      "your body measurement plus your chosen ease gives a target. Nana picks the pattern size whose finished measurement lands closest to it. If you gave her your own gauge, she first adjusts each size to how it would really come out in your hands.",
    yarn:
      "she reads the yardage for your size, adds a 10% cushion because running out at the second sleeve is heartbreak, and compares it with skeins times yardage in your basket.",
    tension:
      "finished width is stitch count divided by gauge. If your gauge differs from the pattern's, the same instructions produce a different size, so she does that arithmetic for you.",
    length:
      "stitch gauge only ever decides how wide a thing comes out. Row gauge decides how long. Nana works out how far the pattern's row counts would actually take you, and how many rows you would need instead to land at the length it intended.",
    labels: {
      size: "Size:",
      yarn: "Yarn:",
      tension: "Tension:",
      length: "Length:",
    },
  },

  footer: {
    privacy:
      "Nana Knows is free forever. Your numbers stay in your own notebook, never sold, never shared. Made with love and leftover yarn.",
    learnNext: "Tell Nana what to learn next",
  },
};
