import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function App() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm px-2 py-1 rounded ${
      isActive ? "font-medium text-blue-600" : "text-gray-700 hover:text-black"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-10">
        <NavLink to="/" className="font-semibold text-lg">
          {t("appName")}
        </NavLink>

        <nav className="flex items-center gap-3">
          <NavLink to="/" className={linkClass}>
            {t("homeLabel")}
          </NavLink>
          <NavLink to="/resources" className={linkClass}>
            {t("resources")}
          </NavLink>
          <NavLink to="/onboarding" className={linkClass}>
            {t("scholarships")}
          </NavLink>
          <NavLink to="/help" className={linkClass}>
            {t("help")}
          </NavLink>
          <LanguageSwitcher />
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {t("appName")} — Built at Bridging The Gap Hackathon
      </footer>
    </div>
  );
}
