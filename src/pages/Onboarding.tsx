import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ---- All Indian States & Union Territories ----
type Region = { code: string; name: string };

const STATES_UTS: Region[] = [
  // States (28)
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UK", name: "Uttarakhand" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "WB", name: "West Bengal" },
  // Union Territories (8)
  { code: "AN", name: "Andaman & Nicobar Islands (UT)" },
  { code: "CH", name: "Chandigarh (UT)" },
  { code: "DN", name: "Dadra & Nagar Haveli and Daman & Diu (UT)" },
  { code: "DL", name: "Delhi (UT)" },
  { code: "JK", name: "Jammu & Kashmir (UT)" },
  { code: "LA", name: "Ladakh (UT)" },
  { code: "LD", name: "Lakshadweep (UT)" },
  { code: "PY", name: "Puducherry (UT)" }
];

const BOARDS = [
  { id: "CBSE", labelKey: "cbse" },
  { id: "ICSE", labelKey: "icse" },
  { id: "STATE", labelKey: "stateBoard" }
];

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Load persisted values (if any)
  const initialClass = useMemo<number>(() => {
    const v = Number(localStorage.getItem("edb_class"));
    return Number.isFinite(v) && v >= 1 && v <= 12 ? v : 9;
  }, []);
  const initialBoard = (localStorage.getItem("edb_board") as "CBSE" | "ICSE" | "STATE") || "STATE";
  const initialState = localStorage.getItem("edb_state") || "JH";

  const [klass, setKlass] = useState<number>(initialClass);
  const [board, setBoard] = useState<"CBSE" | "ICSE" | "STATE">(initialBoard);
  const [stateCode, setStateCode] = useState<string>(initialState);

  useEffect(() => {
    localStorage.setItem("edb_class", String(klass));
    localStorage.setItem("edb_board", board);
    localStorage.setItem("edb_state", stateCode);
  }, [klass, board, stateCode]);

  function onContinue(e: React.FormEvent) {
    e.preventDefault();
    // also persist a combined profile for pages that read it
    localStorage.setItem("edb_profile", JSON.stringify({ class: klass, board, state: stateCode }));
    navigate("/scholarships");
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold">{t("onboarding.title")}</h1>

        <form className="mt-5 flex flex-col gap-4" onSubmit={onContinue}>
          {/* Class */}
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-80">{t("onboarding.classLabel")}</span>
            <select
              value={klass}
              onChange={(e) => setKlass(Number(e.target.value))}
              className="border rounded px-3 py-2"
              required
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          {/* Board */}
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-80">{t("onboarding.boardLabel")}</span>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value as any)}
              className="border rounded px-3 py-2"
              required
            >
              {BOARDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {t(b.labelKey)}
                </option>
              ))}
            </select>
          </label>

          {/* State / UT */}
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-80">{t("onboarding.stateLabel")}</span>
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="border rounded px-3 py-2"
              required
            >
              {STATES_UTS.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </label>

          <button type="submit" className="mt-2 px-4 py-3 rounded-xl bg-blue-600 text-white">
            {t("onboarding.continue")}
          </button>
        </form>
      </div>
    </div>
  );
}
