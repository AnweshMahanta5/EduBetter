// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  const featureCards = [
    {
      icon: "🎯",
      title: t("home.cardScholarshipTitle", "Smart scholarship matcher"),
      text: t(
        "home.cardScholarshipBody",
        "Fill a short form and instantly see scholarships that match your class, board, state and category."
      ),
    },
    {
      icon: "📘",
      title: t("home.cardBooksTitle", "Textbooks in your language"),
      text: t(
        "home.cardBooksBody",
        "Direct links to NCERT and board books in English, Hindi and other regional languages."
      ),
    },
    {
      icon: "⚡",
      title: t("home.cardLightweightTitle", "Fast & mobile-friendly"),
      text: t(
        "home.cardLightweightBody",
        "Minimal JavaScript and compressed data so everything loads smoothly even on slow connections."
      ),
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* 🌊 Wave + glow background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute top-0 w-full opacity-80"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#eef2ff"
            d="M0,128L80,144C160,160,320,192,480,208C640,224,800,224,960,192C1120,160,1280,96,1360,64L1440,32L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          ></path>
        </svg>

        <div className="absolute -top-20 -left-10 w-72 h-72 bg-indigo-200/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-5rem] right-[-3rem] w-96 h-96 bg-purple-200/40 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="px-4 py-10 md:py-14 max-w-6xl mx-auto animate-[fadeIn_0.7s_ease]">
        {/* 🌟 HERO */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-medium bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm">
            <span>🇮🇳</span>
            <span>
              {t(
                "home.heroBadge",
                "Helping Indian school students — CBSE · ICSE · State boards"
              )}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            {t("home.heroTitle", "EduBetter — Bridge the learning gap")}
          </h1>

          <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-600 leading-relaxed">
            {t(
              "home.heroSubtitle",
              "Find scholarships that fit you, access free textbooks, and stay updated on exam dates — all in one simple, fast website."
            )}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/onboarding"
              className="px-7 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              🎓 {t("home.ctaScholarships", "Find scholarships")}
            </Link>

            <Link
              to="/resources"
              className="px-7 py-3 rounded-full bg-white text-gray-900 text-sm font-medium border border-gray-300 shadow-sm hover:bg-gray-50 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              📚 {t("home.ctaResources", "Textbooks & resources")}
            </Link>

            <Link
              to="/exam-dates"
              className="px-7 py-3 rounded-full bg-white text-gray-800 text-sm font-medium border border-gray-200 hover:bg-gray-50 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              📅 {t("home.ctaExamDates", "Exam dates")}
            </Link>
          </div>

          <p className="text-[12px] text-gray-500 flex items-center justify-center gap-1">
            <span>🌐</span>
            <span>
              {t(
                "home.lowBandwidthNote",
                "Lightweight & optimized for slow networks — no heavy images, no ads."
              )}
            </span>
          </p>
        </section>

        {/* 🚀 FEATURE CARDS */}
        <section className="mt-12 grid gap-6 md:grid-cols-3">
          {featureCards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-indigo-200 transition-all duration-300"
            >
              <p className="text-4xl mb-2">{card.icon}</p>
              <h3 className="text-base font-semibold text-gray-900">
                {card.title}
              </h3>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                {card.text}
              </p>
            </div>
          ))}
        </section>

        {/* 🧡 WHY SECTION */}
        <section className="mt-14 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl py-8 px-6 shadow-sm">
          <h2 className="text-center text-lg font-semibold text-gray-900 mb-6">
            {t("home.whyTitle", "Why students love EduBetter")}
          </h2>

          <div className="grid gap-6 md:grid-cols-3 text-xs md:text-sm text-gray-700">
            <div className="space-y-1">
              <p className="font-semibold">
                ❤️ {t("home.whyPoint1Title", "Made for real life")}
              </p>
              <p className="text-gray-600">
                {t(
                  "home.whyPoint1Body",
                  "Focus on fees support, exam dates and books — not confusing menus or distractions."
                )}
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-semibold">
                📱 {t("home.whyPoint2Title", "Beautiful & simple")}
              </p>
              <p className="text-gray-600">
                {t(
                  "home.whyPoint2Body",
                  "Clean layout, large buttons and readable fonts that work well on small screens."
                )}
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-semibold">
                🔗 {t("home.whyPoint3Title", "Reliable links")}
              </p>
              <p className="text-gray-600">
                {t(
                  "home.whyPoint3Body",
                  "Whenever possible, links go straight to official portals or government PDFs."
                )}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
