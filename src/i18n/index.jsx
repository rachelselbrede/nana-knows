import { createContext, useContext, useEffect, useState, useCallback } from "react";
import en from "./en.js";
import es from "./es.js";

const DICTS = { en, es };
const STORAGE_KEY = "nana-lang";

const I18nContext = createContext(null);

/* Walk a dotted key path through a dictionary object. */
const lookup = (dict, key) =>
  key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), dict);

/* Work out which language to show on first paint. URL wins (so shared
   ?lang=es links keep their language), then a saved choice, then the
   browser's own preference. Anything starting with "es" is Spanish. */
function detectLang() {
  if (typeof window === "undefined") return "en";
  try {
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    if (urlLang && DICTS[urlLang]) return urlLang;
  } catch (e) {
    /* malformed URL, fall through */
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTS[saved]) return saved;
  } catch (e) {
    /* storage blocked, fall through */
  }
  const nav = (navigator.language || "en").toLowerCase();
  return nav.startsWith("es") ? "es" : "en";
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  /* t(key, params): plain strings pass through; functions get the params.
     Missing Spanish keys fall back to English, then to the raw key. */
  const t = useCallback(
    (key, params) => {
      const val = lookup(DICTS[lang], key) ?? lookup(en, key) ?? key;
      return typeof val === "function" ? val(params || {}) : val;
    },
    [lang]
  );

  const setLang = useCallback((next) => {
    if (!DICTS[next]) return;
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* storage blocked; the choice still holds for this visit */
    }
    /* Reflect the choice in the URL so a copied link carries the language. */
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      window.history.replaceState({}, "", url);
    } catch (e) {
      /* history unavailable; not worth failing over */
    }
  }, []);

  /* Keep the document itself in step with the language: the <html lang>
     attribute for screen readers, the title, and the meta description. */
  useEffect(() => {
    const dict = DICTS[lang];
    document.documentElement.lang = lang;
    document.title = (lookup(dict, "meta.title") ?? lookup(en, "meta.title"));
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        lookup(dict, "meta.description") ?? lookup(en, "meta.description")
      );
    }
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
