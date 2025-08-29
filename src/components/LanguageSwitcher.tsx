import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

type Lang = { code: string; label: string; native: string };

// Major Indian languages (and English). Add/remove as you localize.
const LANGS: Lang[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "ur", label: "Urdu", native: "اُردُو" },
  // Optional extras (uncomment when you add locale files):
  // { code: "ne", label: "Nepali", native: "नेपाली" },
  // { code: "sa", label: "Sanskrit", native: "संस्कृतम्" },
];

const RTL_LANGS = new Set<string>([
  "ur", // Urdu
  // "sd", // Sindhi (if you add it)
  // "ar", // Arabic (if you add it)
]);

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  // normalize to base code (e.g., "hi-IN" -> "hi")
  const base = (lng: string) => (lng || "en").split("-")[0];

  const [lng, setLng] = useState(base(i18n.language));

  // keep UI in sync with i18n events
  useEffect(() => {
    const handle = (newLng: string) => setLng(base(newLng));
    i18n.on("languageChanged", handle);
    return () => i18n.off("languageChanged", handle);
  }, [i18n]);

  // apply document direction for RTL languages (Urdu, etc.)
  useEffect(() => {
    const dir = RTL_LANGS.has(lng) ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
  }, [lng]);

  const current =
    LANGS.find((l) => l.code === lng) ||
    LANGS.find((l) => l.code === "en")!;

  function change(code: string) {
    i18n.changeLanguage(code);
    localStorage.setItem("i18nextLng", code);
    localStorage.setItem("edb_lang", code);
    setOpen(false);
    setLng(code);
  }

  return (
    <div className="relative">
      <button
        className="px-3 py-2 rounded border text-sm bg-white"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {t("language")}: {current.native}
      </button>

      {open && (
        <ul
          className="absolute right-0 mt-1 w-48 bg-white border rounded-xl shadow z-50 max-h-72 overflow-auto"
          role="listbox"
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                  l.code === current.code ? "font-medium" : ""
                }`}
                onClick={() => change(l.code)}
                role="option"
                aria-selected={l.code === current.code}
              >
                {l.label} — {l.native}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
