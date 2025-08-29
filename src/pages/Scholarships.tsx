import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import schemes from "../data/schemes.json";

type Profile = { class: number; board: string; state: string };

export default function Scholarships() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  // Load profile saved by Onboarding (supports both old & new storage)
  useEffect(() => {
    // Try the combined profile first
    const p = localStorage.getItem("edb_profile");
    if (p) {
      try {
        const parsed = JSON.parse(p) as Profile;
        if (
          parsed &&
          Number.isFinite(parsed.class) &&
          parsed.board &&
          parsed.state
        ) {
          setProfile(parsed);
          return;
        }
      } catch {
        // fall through to separate keys
      }
    }

    // Fall back to separate keys (new onboarding)
    const c = Number(localStorage.getItem("edb_class"));
    const b = localStorage.getItem("edb_board");
    const s = localStorage.getItem("edb_state");
    if (
      Number.isFinite(c) &&
      c >= 1 &&
      c <= 12 &&
      typeof b === "string" &&
      typeof s === "string"
    ) {
      setProfile({ class: c, board: b, state: s });
      // also persist the combined version for consistency
      localStorage.setItem(
        "edb_profile",
        JSON.stringify({ class: c, board: b, state: s })
      );
      return;
    }

    // Nothing found → go to details form
    navigate("/onboarding", { replace: true });
  }, [navigate]);

  // Compute matches
  const matches = useMemo(() => {
    if (!profile) return [];
    const list = schemes as any[];
    return list.filter((s) => {
      const stateOk =
        s.states?.includes("IN-*") || s.states?.includes(profile.state);
      const boardOk =
        !s.boards || s.boards.includes("Any") || s.boards.includes(profile.board);
      const gradeOk =
        profile.class >= s.grades.min && profile.class <= s.grades.max;
      return !!(stateOk && boardOk && gradeOk);
    });
  }, [profile]);

  if (!profile) return null; // brief empty render while redirecting/loading

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">{t("scholarships")}</h1>
        <button
          onClick={() => navigate("/onboarding")}
          className="px-3 py-2 rounded border text-sm"
          title={t("changeDetails")}
        >
          {t("changeDetails")}
        </button>
      </div>

      <p className="text-sm opacity-80 mt-2">
        {t("showingFor")}{" "}
        <strong>
          {t("class")} {profile.class}
        </strong>
        ,{" "}
        <strong>
          {t("board")}: {profile.board}
        </strong>
        ,{" "}
        <strong>
          {t("state")}: {profile.state}
        </strong>
        .
      </p>

      <div className="mt-4 grid gap-3">
        {matches.length === 0 && (
          <div className="bg-white rounded-2xl border p-6 text-sm opacity-80">
            {t("noMatches")}
          </div>
        )}

        {matches.map((s: any) => (
          <Link
            key={s.id}
            to={`/scholarship/${s.id}`}
            className="block bg-white rounded-2xl border p-4 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                {s.benefit && (
                  <p className="text-sm opacity-80">{s.benefit}</p>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {t("class")} {s.grades.min}–{s.grades.max} •{" "}
                  {s.states?.includes("IN-*") ? t("allIndia") : s.states?.join(", ")}
                </p>
              </div>
              {s.deadline && (
                <div className="text-right">
                  <div className="text-[11px] opacity-70">{t("deadline")}</div>
                  <div className="text-sm font-medium">{s.deadline}</div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
