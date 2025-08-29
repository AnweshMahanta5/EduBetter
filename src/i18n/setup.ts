// src/i18n/setup.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import all locale JSONs (make sure these files exist)
import en from "../locales/en/common.json";
import hi from "../locales/hi/common.json";
import bn from "../locales/bn/common.json";
import te from "../locales/te/common.json";
import mr from "../locales/mr/common.json";
import ta from "../locales/ta/common.json";
import gu from "../locales/gu/common.json";
import kn from "../locales/kn/common.json";
import ml from "../locales/ml/common.json";
import pa from "../locales/pa/common.json";
import or_ from "../locales/or/common.json";  // "or" is a TS reserved keyword in some contexts, so alias it
import as from "../locales/as/common.json";
import ur from "../locales/ur/common.json";

const resources = {
  en: { common: en },
  hi: { common: hi },
  bn: { common: bn },
  te: { common: te },
  mr: { common: mr },
  ta: { common: ta },
  gu: { common: gu },
  kn: { common: kn },
  ml: { common: ml },
  pa: { common: pa },
  or: { common: or_ },
  as: { common: as },
  ur: { common: ur }
};

// Pick initial language:
// 1) try your stored app pref (edb_lang),
// 2) fallback to i18next stored pref,
// 3) else use the browser's language, then fallback to 'en'
const initial =
  localStorage.getItem("edb_lang") ||
  localStorage.getItem("i18nextLng") ||
  (navigator.language || "en").split("-")[0] ||
  "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initial,
    fallbackLng: "en",
    supportedLngs: Object.keys(resources),
    nonExplicitSupportedLngs: true, // "hi-IN" -> "hi"
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    returnNull: false
  });

export default i18n;
