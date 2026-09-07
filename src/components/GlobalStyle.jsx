import { C } from "../palette.js";

/* ---------- the stylesheet ----------
   The few rules Tailwind cannot express — the bob, the pop, the focus ring,
   the scalloped edge, and what happens in print — written once at the top
   of the page. Colours come from the palette so they cannot drift. */
export function GlobalStyle() {
  return (
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
  );
}
