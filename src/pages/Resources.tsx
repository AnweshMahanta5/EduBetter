import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Resources() {
  const { t } = useTranslation();

  const cards = [
    { id: "cbse",  title: t("cbse"),       desc: "Class 1–12 • English & Hindi", emoji: "🏫" },
    { id: "icse",  title: t("icse"),       desc: "Class 1–12 • English & Hindi", emoji: "📗" },
    { id: "state", title: t("stateBoard"), desc: "Choose your state • Class 1–12", emoji: "🗺️" }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">{t("resources")}</h1>
      <p className="opacity-80 mb-6">{t("resourcesSubtitle")}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border p-5 flex flex-col gap-3">
            <div className="text-3xl">{c.emoji}</div>
            <h3 className="font-semibold">{c.title}</h3>
            <p className="text-sm opacity-80">{c.desc}</p>
            <div>
              <Link
                to={`/resources/board/${c.id.toUpperCase()}`}
                className="inline-block px-3 py-2 rounded bg-blue-600 text-white text-sm"
              >
                {t("open")}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

