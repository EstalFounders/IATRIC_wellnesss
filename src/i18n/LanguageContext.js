import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { translations } from "./translations";

const STORAGE_KEY = "app_lang";

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  // Read the saved choice on mount (client only) to avoid SSR mismatch.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "hi" || saved === "en") setLangState(saved);
    } catch (err) {
      // ignore storage errors (private mode etc.)
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (err) {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key, fallback) => {
      const dict = translations[lang] || {};
      const english = translations.en || {};
      if (dict[key] !== undefined) return dict[key];
      if (english[key] !== undefined) return english[key];
      return fallback !== undefined ? fallback : key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;
