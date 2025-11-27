import { useParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import data from "../data/schemes.json";
import { createICS } from "../lib/ics";
import EligibilityDialog from "../components/EligibilityDialog";

type Scheme = {
  id: string;
  title: string;
  states: string[];
  boards?: string[];
  grades: { min: number; max: number };
  income_max?: number;
  categories_any?: string[];
  minority_only?: boolean;
  disability_min_pct?: number;
  deadline?: string;
  benefit?: string;
  requires?: string[];
  links?: { apply?: string; official?: string };
  summary?: Record<string, string>;
  source?: string;
  last_updated?: string;
};

function toTitle(s: string) {
  return s
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

export default function ScholarshipDetail() {
  const { id } = useParams();

  const item: Scheme | undefined = useMemo(() => {
    const list = (data as unknown as Scheme[]) || [];
    return list.find((x) => x.id === id);
  }, [id]);

  const [eligOpen, setEligOpen] = useState(false);

  if (!item) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-white rounded-2xl border p-6">
          <h1 className="text-xl font-semibold mb-2">Scholarship not found</h1>
          <p className="opacity-80 mb-4">
            The scholarship you’re looking for doesn’t exist or was removed.
          </p>
          <Link to="/scholarships" className="inline-block px-4 py-2 rounded bg-blue-600 text-white">
            Back to scholarships
          </Link>
        </div>
      </div>
    );
  }

  // Create .ics download
  const downloadICS = () => {
    const blob = new Blob([createICS(item)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyUrl = item.links?.apply || item.links?.official || "";
  const hasApply = !!applyUrl;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-2xl border p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{item.title}</h1>
            {item.benefit && <p className="text-sm opacity-80 mt-1">{item.benefit}</p>}
          </div>
          {item.deadline && (
            <div className="shrink-0 text-right">
              <div className="text-xs opacity-70">Deadline</div>
              <div className="text-sm font-medium">{item.deadline}</div>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="text-xs opacity-70 flex flex-wrap gap-x-4 gap-y-1">
          {item.source && <span>Source: {item.source}</span>}
          {item.last_updated && <span>Updated: {item.last_updated}</span>}
        </div>

        {/* Eligibility summary */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border p-3">
            <div className="text-xs opacity-70 mb-1">Who is this for?</div>
            <ul className="list-disc ps-5 text-sm">
              <li>Classes {item.grades?.min ?? "?"}–{item.grades?.max ?? "?"}</li>
              <li>Boards: {item.boards?.join(", ") || "Any"}</li>
              <li>
                States: {item.states?.includes("IN-*") ? "All India" : item.states?.join(", ") || "—"}
              </li>
              {typeof item.income_max === "number" && (
                <li>Income cap: ₹{item.income_max.toLocaleString()}</li>
              )}
              {item.categories_any?.length ? (
                <li>Categories: {item.categories_any.join(", ")}</li>
              ) : null}
              {typeof item.disability_min_pct === "number" && (
                <li>Minimum disability: {item.disability_min_pct}%</li>
              )}
              {item.minority_only && <li>Minority students only</li>}
            </ul>
          </div>

          <div className="rounded-xl border p-3">
            <div className="text-xs opacity-70 mb-1">Documents required</div>
            {item.requires?.length ? (
              <ul className="list-disc ps-5 text-sm">
                {item.requires.map((r) => (
                  <li key={r}>{toTitle(r)}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm opacity-70">Not specified</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <a
            className={`px-3 py-2 rounded ${hasApply ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
            href={hasApply ? applyUrl : undefined}
            target={hasApply ? "_blank" : undefined}
            rel={hasApply ? "noreferrer" : undefined}
            onClick={(e) => { if (!hasApply) e.preventDefault(); }}
          >
            Apply
          </a>

          <button onClick={() => setEligOpen(true)} className="px-3 py-2 rounded border">
            Check detailed eligibility
          </button>

          <button onClick={downloadICS} className="px-3 py-2 rounded border">
            Add deadline to calendar
          </button>

          <Link to="/scholarships" className="px-3 py-2 rounded border">
            Back to list
          </Link>

          {/* ✅ New Home button */}
          <Link to="/" className="px-3 py-2 rounded border">
            Home
          </Link>
        </div>
      </div>

      {/* Eligibility dialog */}
      <EligibilityDialog
        open={eligOpen}
        onClose={() => setEligOpen(false)}
        scheme={{
          id: item.id,
          title: item.title,
          income_max: item.income_max,
          categories_any: item.categories_any,
          minority_only: item.minority_only,
          disability_min_pct: item.disability_min_pct,
        }}
      />
    </div>
  );
}
