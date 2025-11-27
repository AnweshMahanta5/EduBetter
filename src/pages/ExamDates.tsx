import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type BoardId = "CBSE" | "ICSE" | "STATE";

interface ExamDate {
  id: string;
  board: BoardId;
  stateCode?: string;
  class: number;
  subject: string;
  examDate: string;        // can be ISO date or text like "2024 exam period (see timetable)"
  startTime?: string;
  endTime?: string;
  officialUrl?: string;
  lastUpdated: string;
}

// Labels for state codes used in examDates.json
const STATE_LABELS: Record<string, string> = {
  JH: "Jharkhand",
  MH: "Maharashtra",
  UP: "Uttar Pradesh",
  BR: "Bihar",
  RJ: "Rajasthan",
  GJ: "Gujarat",
  TN: "Tamil Nadu",
  KA: "Karnataka",
  KL: "Kerala",
  WB: "West Bengal",
  OR: "Odisha",
  TS: "Telangana",
  AP: "Andhra Pradesh",
  MP: "Madhya Pradesh",
  HR: "Haryana",
  PB: "Punjab",
  CG: "Chhattisgarh",
  AS: "Assam",
  UK: "Uttarakhand"
};

const ExamDates: React.FC = () => {
  const { t } = useTranslation();

  const [data, setData] = useState<ExamDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [board, setBoard] = useState<BoardId | "ALL">("ALL");
  const [stateCode, setStateCode] = useState<string>("ALL");
  const [klass, setKlass] = useState<number | "ALL">("ALL");
  const [subject, setSubject] = useState<string>("");

  useEffect(() => {
    const url =
      import.meta.env.VITE_EXAM_DATES_API || "/data/examDates.json";

    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: ExamDate[]) => {
        setData(Array.isArray(json) ? json : []);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load exam dates", err);
        setError("failed");
      })
      .finally(() => setLoading(false));
  }, []);

  // Derive list of available state codes from data itself
  const stateOptions = useMemo(() => {
    const codes = Array.from(
      new Set(
        data
          .filter((x) => x.board === "STATE" && x.stateCode)
          .map((x) => x.stateCode as string)
      )
    );
    return codes.sort();
  }, [data]);

  const filtered = useMemo(
    () =>
      data.filter((x) => {
        if (board !== "ALL" && x.board !== board) return false;
        if (board === "STATE" && stateCode !== "ALL" && x.stateCode !== stateCode)
          return false;
        if (klass !== "ALL" && x.class !== klass) return false;
        if (subject && !x.subject.toLowerCase().includes(subject.toLowerCase()))
          return false;
        return true;
      }),
    [data, board, stateCode, klass, subject]
  );

  if (loading) return <p className="p-4">Loading exam dates...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">
        {t("examDates.title")}
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        Filter board exam dates by board, state, class, and subject.
      </p>

      {error && (
        <p className="mb-4 text-sm text-red-600">
          Could not load exam dates right now. Please try again later.
        </p>
      )}

      {/* Filters */}
      <div className="grid sm:grid-cols-4 gap-3 mb-6">
        {/* Board filter */}
        <select
          className="border p-2 rounded"
          value={board}
          onChange={(e) => {
            const val = e.target.value as BoardId | "ALL";
            setBoard(val);
            // reset state filter when leaving STATE board
            if (val !== "STATE") setStateCode("ALL");
          }}
        >
          <option value="ALL">All Boards</option>
          <option value="CBSE">CBSE</option>
          <option value="ICSE">ICSE / ISC</option>
          <option value="STATE">State Boards</option>
        </select>

        {/* State filter – only when board = STATE */}
        {board === "STATE" && (
          <select
            className="border p-2 rounded"
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
          >
            <option value="ALL">All States</option>
            {stateOptions.map((code) => (
              <option key={code} value={code}>
                {STATE_LABELS[code] ?? code}
              </option>
            ))}
          </select>
        )}

        {/* Class filter */}
        <select
          className="border p-2 rounded"
          value={klass}
          onChange={(e) =>
            setKlass(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
          }
        >
          <option value="ALL">Class (All)</option>
          <option value="10">Class 10</option>
          <option value="12">Class 12</option>
        </select>

        {/* Subject search */}
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="Search subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      {/* Table / no-results */}
      {!error && filtered.length === 0 ? (
        <p className="text-sm text-gray-600">
          No exam dates found for the selected filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border">Date</th>
                <th className="px-3 py-2 border">Board</th>
                <th className="px-3 py-2 border">Class</th>
                <th className="px-3 py-2 border">Subject</th>
                <th className="px-3 py-2 border">Time</th>
                <th className="px-3 py-2 border">State</th>
                <th className="px-3 py-2 border">Notice</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => {
                // Allow either ISO dates or free text
                let displayDate = x.examDate;
                const parsed = new Date(x.examDate);
                if (!isNaN(parsed.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(x.examDate)) {
                  displayDate = parsed.toLocaleDateString();
                }

                const stateLabel =
                  x.stateCode && STATE_LABELS[x.stateCode]
                    ? STATE_LABELS[x.stateCode]
                    : x.stateCode ?? (x.board === "STATE" ? "-" : "—");

                return (
                  <tr key={x.id} className="border">
                    <td className="px-3 py-2 border">{displayDate}</td>
                    <td className="px-3 py-2 border">{x.board}</td>
                    <td className="px-3 py-2 border">{x.class}</td>
                    <td className="px-3 py-2 border">{x.subject}</td>
                    <td className="px-3 py-2 border">
                      {x.startTime ? `${x.startTime} - ${x.endTime ?? ""}` : "-"}
                    </td>
                    <td className="px-3 py-2 border">{stateLabel}</td>
                    <td className="px-3 py-2 border">
                      {x.officialUrl ? (
                        <a
                          href={x.officialUrl}
                          className="text-blue-600 underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExamDates;
