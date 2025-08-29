import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import cbse from "../data/resources/cbse.json";
import icse from "../data/resources/icse.json";
import statesIndex from "../data/resources/state/index.json";

type Subject = { title: string; url: string };
type ClassBlock = { class: number; languages: { en: Subject[]; hi: Subject[] } };
type BoardData = ClassBlock[];

// Auto-load every state JSON via Vite (typed)
const stateModules = import.meta.glob("../data/resources/state/*.json", {
  eager: true,
}) as Record<string, { default: BoardData }>;

// Build STATE_MAP: { "JH": [...], "MH": [...], ... } excluding index.json
const STATE_MAP: Record<string, BoardData> = Object.fromEntries(
  Object.entries(stateModules)
    .filter(([p]) => !/[/\\]index\.json$/i.test(p))
    .map(([p, mod]) => {
      const code = p.split(/[/\\]/).pop()!.replace(/\.json$/i, "").toUpperCase();
      return [code, mod.default];
    })
);

export default function ResourcesBoard() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const boardId = (params.boardId || "CBSE").toUpperCase(); // CBSE | ICSE | STATE

  // ✅ Content language (books) — independent from UI language
  const contentLangInitial =
    (localStorage.getItem("edb_resources_lang") as "en" | "hi" | null) ||
    ((i18n.language?.split("-")[0] as "en" | "hi") || "en"); // just for initial default
  const [contentLang, setContentLang] = useState<"en" | "hi">(contentLangInitial);

  function setBooksLang(code: "en" | "hi") {
    setContentLang(code);
    localStorage.setItem("edb_resources_lang", code);
    // NOTE: Do NOT call i18n.changeLanguage here.
  }

  // State selection (persist)
  const [stateCode, setStateCode] = useState<string>(
    localStorage.getItem("edb_state") || "JH"
  );
  function onChangeState(code: string) {
    setStateCode(code);
    localStorage.setItem("edb_state", code);
  }

  // Class filter
  const [klass, setKlass] = useState<number | "all">("all");

  // Pick data per board
  const data: BoardData = useMemo(() => {
    if (boardId === "CBSE") return cbse as BoardData;
    if (boardId === "ICSE") return icse as BoardData;
    if (boardId === "STATE") return (STATE_MAP[stateCode] || []) as BoardData;
    return cbse as BoardData;
  }, [boardId, stateCode]);

  const classes = useMemo(
    () => data.map((d) => d.class).sort((a, b) => a - b),
    [data]
  );

  const filtered = useMemo(
    () => (klass === "all" ? data : data.filter((d) => d.class === klass)),
    [data, klass]
  );

  const boardLabel =
    boardId === "CBSE" ? t("cbse") : boardId === "ICSE" ? t("icse") : t("stateBoard");

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header / Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">
          {t("resources")} — {boardLabel}
        </h1>

        <div className="flex items-center gap-2">
          {boardId === "STATE" && (
            <>
              <label className="text-sm">{t("state")}</label>
              <select
                value={stateCode}
                onChange={(e) => onChangeState(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                {(statesIndex as any).states.map((s: any) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <label className="text-sm ms-2">{t("class")}</label>
          <select
            value={klass}
            onChange={(e) =>
              setKlass(e.target.value === "all" ? "all" : parseInt(e.target.value))
            }
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* 🔤 Books language (local only) */}
          <div className="ms-2 border rounded overflow-hidden">
            <button
              onClick={() => setBooksLang("en")}
              className={`px-3 py-1 text-sm ${
                contentLang === "en" ? "bg-blue-600 text-white" : "bg-white"
              }`}
              aria-pressed={contentLang === "en"}
            >
              {t("english")}
            </button>
            <button
              onClick={() => setBooksLang("hi")}
              className={`px-3 py-1 text-sm ${
                contentLang === "hi" ? "bg-blue-600 text-white" : "bg-white"
              }`}
              aria-pressed={contentLang === "hi"}
            >
              {t("hindi")}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 grid gap-4">
        {filtered.length === 0 && (
          <div className="bg-white border rounded-2xl p-6">
            <p className="opacity-80">{t("comingSoon")}</p>
          </div>
        )}

        {filtered.map((block) => (
          <div key={block.class} className="bg-white rounded-2xl border p-4">
            <h3 className="font-semibold">
              {t("class")} {block.class}
            </h3>
            <ul className="list-disc ps-6 text-sm mt-2">
              {(block.languages as any)[contentLang]?.map((it: Subject) => (
                <li key={it.title}>
                  {it.title} —{" "}
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {t("open")}
                  </a>
                </li>
              )) || null}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
