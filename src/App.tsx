// src/App.tsx
import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "./components/LanguageSwitcher";
import VoiceAssistant from "./components/VoiceAssistant";
import ProfileMenu from "./components/ProfileMenu";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm px-3 py-1.5 rounded-full transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-white/40 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center px-4 py-3 gap-4">
          {/* Logo */}
          <NavLink to="/" className="font-semibold text-lg tracking-tight">
            {t("appName", "EduBetter")}
          </NavLink>

          {/* Center nav links */}
          <nav className="flex-1 flex items-center justify-center gap-2">
            <NavLink to="/" className={linkClass}>
              {t("homeLabel", "Home")}
            </NavLink>

            <NavLink to="/resources" className={linkClass}>
              {t("resources", "Resources")}
            </NavLink>

            <NavLink to="/onboarding" className={linkClass}>
              {t("scholarships", "Scholarships")}
            </NavLink>

            <NavLink to="/classroom" className={linkClass}>
              {t("classroom", "Classroom")}
            </NavLink>

            <NavLink to="/exam-dates" className={linkClass}>
              {t("examDatesLabel", "Exam Dates")}
            </NavLink>

            <NavLink to="/help" className={linkClass}>
              {t("help", "Help")}
            </NavLink>
          </nav>

          {/* Right side: auth + language */}
          <div className="flex items-center gap-3">
            {user ? (
              // When logged in: show avatar/profile menu
              <ProfileMenu />
            ) : (
              // When logged out: show Login / Sign up
              <div className="flex items-center gap-2 text-xs">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-full border border-transparent text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-full border border-indigo-200 bg-white text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Language in the far-right corner */}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {t("appName", "EduBetter")} — Built at
        Bridging The Gap Hackathon
      </footer>

      {/* Floating voice assistant bubble */}
      <VoiceAssistant />
    </div>
  );
}
