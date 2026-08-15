/* Spanish (neutral Latin American) strings for Nana Knows.
   Same shape as en.js. Nana Purl keeps her name. She should sound like a warm
   abuela, not a machine. Knitting is "tejer (dos agujas)", crochet is
   "crochet / ganchillo". Unit abbreviations (in, cm, yds, m) stay as in the
   component. Numbers keep a period decimal so the comma-aware parser is happy. */
export default {
  meta: {
    title: "Nana Knows · ¿Qué talla tejer y te alcanzará la lana?",
    description:
      "Cuéntale a Nana Purl sobre tu patrón, tu lana y sobre ti. Consejos gratis de tallas, cantidad de lana y muestra para quienes tejen y hacen crochet. Sin cuenta, sin recopilar nada.",
  },

  lang: {
    toggleLabel: "Idioma",
    en: "EN",
    es: "ES",
    switchToEs: "Cambiar a español",
    switchToEn: "Switch to English",
  },

  nana: {
    alt: "Nana Purl, una abuelita sonriente con un ovillo de lana",
  },

  header: {
    tagline:
      "Cuéntale a Nana Purl sobre tu patrón, tu lana y sobre ti. Ella te dirá qué talla tejer, si tu lana va a alcanzar y qué anda haciendo tu muestra.",
    badge: "Gratis para siempre · Sin cuenta · Dos agujas y crochet bienvenidos",
  },

  toggle: {
    knitting: "Tejer (dos agujas)",
    crochet: "Crochet",
    inYds: "in / yds",
    cmM: "cm / m",
  },

  label: {
    gaugeLabel: ({ inch }) => (inch ? "puntos por 4 in" : "puntos por 10 cm"),
    rowGaugeLabel: ({ inch }) => (inch ? "filas por 4 in" : "filas por 10 cm"),
  },

  card: {
    pattern: "El patrón",
    you: "Tú, mi vida",
    basket: "Tu canasta de lana",
  },

  field: {
    patternGauge: ({ gaugeLabel }) => `Muestra del patrón (${gaugeLabel})`,
    patternRowGauge: ({ rowGaugeLabel }) => `Muestra de filas del patrón, opcional (${rowGaugeLabel})`,
    finishedSizes: ({ lenU }) => `Tallas terminadas, de la más chica a la más grande (${lenU})`,
    yarnNeeded: ({ yarnU }) => `Lana que pide cada talla, en el mismo orden (${yarnU})`,
    bust: ({ lenU }) => `Tu busto / pecho (${lenU})`,
    fit: "¿Cómo te gusta que quede?",
    swatchGauge: ({ gaugeLabel }) => `La muestra de tus manos, opcional (${gaugeLabel})`,
    swatchRowGauge: ({ rowGaugeLabel }) => `Las filas de tu muestra, opcional (${rowGaugeLabel})`,
    perSkein: ({ yarnU }) => `${yarnU} por madeja`,
    skeinsYouHave: "Madejas que tienes",
  },

  ease: {
    labels: ({ inch }) => [
      `Ajustado (${inch ? "-2 in" : "-5 cm"})`,
      "Justo al cuerpo (0)",
      `Cómodo de siempre (${inch ? "+2 in" : "+5 cm"})`,
      `Holgado (${inch ? "+4 in" : "+10 cm"})`,
      `Muy suelto (${inch ? "+6 in" : "+15 cm"})`,
    ],
  },

  ph: ({ inch }) => ({
    gauge: "p. ej. 18",
    rowGauge: "p. ej. 24",
    myRowGauge: "p. ej. 26",
    sizes: inch ? "p. ej. 32, 36, 40, 44, 48, 52" : "p. ej. 81, 91, 102, 112, 122, 132",
    yards: inch
      ? "p. ej. 900, 1000, 1100, 1250, 1400, 1550"
      : "p. ej. 825, 915, 1005, 1145, 1280, 1420",
    bust: inch ? "p. ej. 38" : "p. ej. 96",
    myGauge: "p. ej. 19",
    perSkein: inch ? "p. ej. 220" : "p. ej. 200",
    skeins: "p. ej. 5",
  }),

  button: { ask: "Pregúntale a Nana" },

  remember: {
    save: "Nana, recuerda mis números",
    forget: "Olvídame",
  },

  copy: {
    button: "Copiar el consejo de Nana",
    print: "Imprimir",
    heading: "Nana Knows — su consejo para este proyecto",
    done: "Copiado. Pégalo en tus notas de Ravelry o donde quieras.",
    failed:
      "Nana no pudo alcanzar el portapapeles, mi vida. Mejor selecciona las tarjetas y cópialas a mano.",
  },

  share: {
    button: "Copiar un enlace con estos números",
    copied:
      "Enlace copiado. Envíaselo a alguien y Nana lo recibirá con los mismísimos números.",
    failed:
      "Nana puso el enlace en tu barra de direcciones, mi vida. Cópialo de ahí para compartir.",
    loaded: "Nana abrió esto desde un enlace compartido.",
    note: "Ese enlace lleva tus números. Compártelo solo con quien tú le contarías.",
  },

  measure: {
    summary: "¿Cómo me mido?",
    intro:
      "Tu busto o pecho es el número en el que se apoyan todos los demás, mija. Quítate las capas gruesas, pasa una cinta métrica suave alrededor de la parte más ancha y sigue estos pasos.",
    alt: "Una cinta métrica suave alrededor de la parte más ancha del busto, nivelada en todo el contorno",
    steps: [
      "Usa el sostén o la prenda que llevarás debajo de la pieza terminada, para que el ajuste sea como en la vida real.",
      "Pasa la cinta por la parte más ancha del busto, normalmente a la altura de los pezones.",
      "Mantén la cinta nivelada, ajustada pero sin apretar, y paralela al piso en todo el contorno.",
      "Suelta el aire con calma y lee el número donde se junta la cinta, sin jalarla.",
      "Mídete dos veces. Si los números no coinciden, usa el mayor y confía en él.",
    ],
    tip: "¿No tienes quien te ayude ni un espejo de cuerpo entero? Mide un suéter que ya te quede bien, extendido en plano, y duplica el ancho del pecho.",
  },

  save: {
    remembered: "Nana te recordó de la vez pasada.",
    written: "Anotado en el cuaderno de Nana. Guardado solo para ti, en este navegador.",
    notHandy:
      "El cuaderno de Nana no está a la mano ahora, mi vida. Tus números siguen sirviendo para esta visita.",
    forgotten: "Nana arrancó la hoja. Todo olvidado.",
  },

  advice: {
    size: "La talla justa",
    yarn: "Tu canasta de lana",
    tension: "Tu tensión",
    length: "Tu largo",
  },

  result: {
    error:
      "Antes de aconsejarte, Nana necesita dos cosas: las tallas terminadas que ofrece tu patrón y tu propia medida. Complétalas y pregúntame de nuevo, mi vida.",
    intro: ({ proverb }) => `«${proverb}» Esto es lo que piensa Nana, mi cielo:`,

    size: {
      main: ({ best, lenU, b, easeLabel, target }) =>
        `Teje la talla ${best}, la que tiene una medida terminada de ${best} ${lenU}. Tú mides ${b} ${lenU} y elegiste ${easeLabel}, así que estás buscando unos ${target} ${lenU} de contorno.`,
      runnerUp: ({ runnerUp }) =>
        ` La talla ${runnerUp} también anda cerquita. Cuando dudes entre dos, ve más chica para telas elásticas y ceñidas, y más grande para caída y para poder abrigarte debajo.`,
    },

    yarn: {
      needSizes:
        "Agrega la cantidad de lana que pide cada talla y Nana te contará las madejas.",
      listShort:
        "Tu lista de tallas es más larga que la de lana, así que Nana no ve la cantidad para tu talla. Revisa que las dos listas coincidan, mi vida.",
      askBasket: ({ need, yarnU }) =>
        `Esa talla pide alrededor de ${need} ${yarnU}. Dile a Nana qué tienes en tu canasta (${yarnU} por madeja y cuántas) y ella revisará si alcanza.`,
      allSet: ({ have, best, need, buffered, yarnU }) =>
        `Tienes ${have} ${yarnU} y la talla ${best} pide alrededor de ${need} ${yarnU}. Incluso con el colchoncito del 10 % de Nana por si acaso (${buffered} ${yarnU}), te sobra. Monta los puntos con la conciencia tranquila.`,
      justCovers: ({ have, need, buffered, yarnU }) =>
        `Tienes ${have} ${yarnU} y el patrón pide ${need} ${yarnU}. Alcanza, pero por muy poco. A Nana le gusta un colchón del 10 % (${buffered} ${yarnU}), así que una madeja más la dejaría dormir tranquila.`,
      short: ({ have, need, buffered, shortAmt, moreSkeins, yarnU }) =>
        `Ay, mi vida. Tienes ${have} ${yarnU} pero esta talla quiere ${need} ${yarnU} (${buffered} con un colchón seguro). Consigue unos ${shortAmt} ${yarnU} más, más o menos ${moreSkeins} ${moreSkeins === 1 ? "madeja" : "madejas"} más, antes de empezar.`,
      mismatch:
        " P. D. Tu lista de tallas y la de lana tienen distinto largo, así que dales un vistacito.",
    },

    gauge: {
      askPattern: ({ gaugeLabel }) =>
        `Pon la muestra del patrón (${gaugeLabel}) y Nana te dirá cómo cambian las cosas con tu propia tensión.`,
      askYours: ({ gaugeLabel }) =>
        `Teje una muestrita y dile a Nana tus ${gaugeLabel}. Es la diferencia entre un suéter y una sorpresa.`,
      match: ({ ug, pg, gaugeLabel, best }) =>
        `Tu tensión coincide preciosa con la del patrón (${ug} contra ${pg} ${gaugeLabel}). Sigue los números de la talla ${best} tal como están. Qué manos tan lindas, mi vida.`,
      off: ({ tighter, ug, pg, gaugeLabel, best, actual, lenU, craft }) => {
        const knit = craft === "knit";
        const tool = knit ? "aguja" : "ganchillo";
        const article = knit ? "una" : "un";
        const bigger = knit ? "más grande" : "más grande";
        const smaller = knit ? "más pequeña" : "más pequeño";
        return `Tus puntos quedan un poquito ${tighter ? "más apretados" : "más flojos"} que los del patrón (${ug} contra ${pg} ${gaugeLabel}), así que las instrucciones de la talla ${best} te saldrían cerca de ${actual} ${lenU} en tus manos. Nana ya eligió tu talla teniendo eso en cuenta. Si prefieres calcar el patrón exacto, prueba con ${article} ${tool} ${tighter ? bigger : smaller} y vuelve a hacer la muestra.`;
      },
    },

    row: {
      askPattern: ({ rowGaugeLabel }) =>
        `Pon la muestra de filas del patrón (${rowGaugeLabel}) y Nana revisará tus largos igual que tus anchos. Es la que casi todas nos saltamos, mi vida.`,
      askYours: ({ rowGaugeLabel }) =>
        `Cuenta también las filas de tu muestra (${rowGaugeLabel}) y Nana te dirá qué tan largas van a salir de verdad las filas del patrón.`,
      match: ({ urg, prg, rowGaugeLabel }) =>
        `Tus filas también coinciden con el patrón (${urg} contra ${prg} ${rowGaugeLabel}). Teje los largos tal como están y saldrán bien.`,
      off: ({ tighter, urg, prg, rowGaugeLabel, yours, intended, lenU, needed }) =>
        `Tus filas quedan ${tighter ? "más apretadas" : "más flojas"} que las del patrón (${urg} contra ${prg} ${rowGaugeLabel}). Donde dice tejer 100 filas, tú llegarías a unos ${yours} ${lenU} en vez de ${intended} ${lenU}, así que teje unas ${needed} filas para llegar al mismo largo. Ve midiendo tu cuerpo y tus mangas mientras avanzas en lugar de confiar solo en la cuenta de filas, y quedarás de maravilla.`,
    },
  },

  proverbs: {
    knit: [
      "Mide dos veces, monta una sola.",
      "No existe demasiada lana, solo demasiado poco estante.",
      "Las muestras son como las galletas. Siempre haz una más.",
      "Una tacita de té endulza las cuentas.",
      "Deshacer y volver a empezar forma el carácter, mi vida.",
    ],
    crochet: [
      "Cadeneta, cadeneta, y vuelve a revisar.",
      "No existe demasiada lana, solo demasiado poco estante.",
      "Las muestras son como las galletas. Siempre haz una más.",
      "Una tacita de té endulza las cuentas.",
      "Una hilera más nunca le hizo daño a nadie.",
    ],
  },

  math: {
    summary: "¿Cómo lo calcula Nana?",
    size:
      "tu medida del cuerpo más la holgura que elegiste dan un objetivo. Nana elige la talla del patrón cuya medida terminada quede más cerca. Si le diste tu propia muestra, primero ajusta cada talla a cómo saldría de verdad en tus manos.",
    yarn:
      "lee la cantidad de lana de tu talla, le suma un colchón del 10 % porque quedarse sin lana en la segunda manga parte el alma, y lo compara con las madejas por su metraje en tu canasta.",
    tension:
      "el ancho terminado es la cantidad de puntos dividida entre la muestra. Si tu muestra difiere de la del patrón, las mismas instrucciones dan otra talla, así que ella te hace esa cuenta.",
    length:
      "la muestra de puntos solo decide qué tan ancho sale algo. La muestra de filas decide qué tan largo. Nana calcula hasta dónde te llevarían de verdad las filas del patrón, y cuántas filas necesitarías en cambio para llegar al largo que buscaba.",
    labels: {
      size: "Talla:",
      yarn: "Lana:",
      tension: "Tensión:",
      length: "Largo:",
    },
  },

  footer: {
    privacy:
      "Nana Knows es gratis para siempre. Tus números se quedan en tu propio cuaderno, nunca se venden, nunca se comparten. Hecho con cariño y lana sobrante.",
    learnNext: "Dile a Nana qué aprender después",
  },
};
