// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <section className="text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold">
          {t("home.heroTitle")}
        </h1>
        <p className="mt-3 text-gray-600">
          {t("home.heroSubtitle")}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to="/onboarding" className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm">
            {t("scholarships")}
          </Link>
          <Link to="/resources" className="px-5 py-3 rounded-xl border text-sm">
            {t("resources")}
          </Link>
          <Link to="/help" className="px-5 py-3 rounded-xl border text-sm">
            {t("help")}
          </Link>
        </div>
      </section>

      <section className="mt-12 grid sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-semibold mb-1">{t("home.cards.matcher.title")}</h3>
          <p className="text-sm text-gray-600">{t("home.cards.matcher.desc")}</p>
        </div>
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-semibold mb-1">{t("home.cards.books.title")}</h3>
          <p className="text-sm text-gray-600">{t("home.cards.books.desc")}</p>
        </div>
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-semibold mb-1">{t("home.cards.ui.title")}</h3>
          <p className="text-sm text-gray-600">{t("home.cards.ui.desc")}</p>
        </div>
      </section>
    </div>
  );
}
