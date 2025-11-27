import { useEffect, useMemo, useState } from "react";

type Scheme = {
  id: string;
  title: string;
  income_max?: number;
  categories_any?: string[]; // e.g., ["SC","ST","OBC","Minority","EWS"]
  minority_only?: boolean;
  disability_min_pct?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  scheme: Scheme;
};

export default function EligibilityDialog({ open, onClose, scheme }: Props) {
  const [category, setCategory] = useState<string>("");
  const [minority, setMinority] = useState<"yes" | "no" | "">("");
  const [orphan, setOrphan] = useState<"yes" | "no" | "">("");
  const [disability, setDisability] = useState<"yes" | "no" | "">("");
  const [disabilityPct, setDisabilityPct] = useState<number | "">("");
  const [income, setIncome] = useState<number | "">("");
  const [marks, setMarks] = useState<number | "">(""); // optional if your schemes need% cutoff

  // Prefill from localStorage (nice UX)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("edb_profile_extra") || "{}");
    if (saved.category) setCategory(saved.category);
    if (saved.minority) setMinority(saved.minority);
    if (saved.orphan) setOrphan(saved.orphan);
    if (saved.disability) setDisability(saved.disability);
    if (saved.disabilityPct !== undefined) setDisabilityPct(saved.disabilityPct);
    if (saved.income !== undefined) setIncome(saved.income);
    if (saved.marks !== undefined) setMarks(saved.marks);
  }, [open]);

  function saveProfile() {
    const payload = { category, minority, orphan, disability, disabilityPct, income, marks };
    localStorage.setItem("edb_profile_extra", JSON.stringify(payload));
  }

  const needs = useMemo(() => {
    // Decide what to ask prominently based on the scheme:
    return {
      askIncome: scheme.income_max !== undefined,
      askCategory: Array.isArray(scheme.categories_any) && scheme.categories_any.length > 0,
      askMinority: scheme.minority_only === true || (scheme.categories_any || []).includes("Minority"),
      askDisability: scheme.disability_min_pct !== undefined,
      askOrphan: true, // often common; keep simple toggle
      askMarks: false, // set true if you want to use % cutoff per scheme later
    };
  }, [scheme]);

  // Basic evaluation (extend as needed)
  const result = useMemo(() => {
    const notes: string[] = [];
    let pass = true;

    if (needs.askIncome) {
      if (income === "" || typeof income !== "number") {
        pass = false; notes.push("Provide family annual income.");
      } else if (scheme.income_max !== undefined && income > scheme.income_max) {
        pass = false; notes.push(`Income exceeds limit (₹${scheme.income_max.toLocaleString()}).`);
      }
    }

    if (needs.askCategory && scheme.categories_any?.length) {
      if (!category) { pass = false; notes.push("Choose a category."); }
      else if (!scheme.categories_any.includes(category)) {
        pass = false; notes.push(`Only for: ${scheme.categories_any.join(", ")}.`);
      }
    }

    if (needs.askMinority && minority !== "yes") {
      pass = false; notes.push("This scheme is for minority students.");
    }

    if (needs.askDisability && disability !== "yes") {
      pass = false; notes.push("This scheme requires disability certificate.");
    }
    if (needs.askDisability && disability === "yes" && scheme.disability_min_pct !== undefined) {
      if (disabilityPct === "" || typeof disabilityPct !== "number") {
        pass = false; notes.push("Provide disability percentage.");
      } else if (disabilityPct < scheme.disability_min_pct) {
        pass = false; notes.push(`Minimum disability: ${scheme.disability_min_pct}%.`);
      }
    }

    // Example if you add marks_min in the future:
    // if (needs.askMarks && typeof scheme.marks_min === "number") { ... }

    return { pass, notes };
  }, [needs, income, category, minority, disability, disabilityPct, scheme]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-lg rounded-2xl border shadow p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Check detailed eligibility</h2>
          <button onClick={onClose} aria-label="Close" className="text-sm opacity-70 hover:opacity-100">✕</button>
        </div>
        <p className="text-sm opacity-80 mb-4">{scheme.title}</p>

        <div className="grid gap-3">
          {needs.askCategory && (
            <label className="flex flex-col gap-1">
              <span className="text-sm">Category / Caste</span>
              <select value={category} onChange={(e)=>setCategory(e.target.value)} className="border rounded p-2">
                <option value="">Select category</option>
                {scheme.categories_any?.map(c => <option key={c} value={c}>{c}</option>)}
                {/* Add common ones too */}
                <option value="General">General</option>
                <option value="EWS">EWS</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="Minority">Minority</option>
              </select>
            </label>
          )}

          {needs.askIncome && (
            <label className="flex flex-col gap-1">
              <span className="text-sm">Annual Family Income (₹)</span>
              <input
                type="number"
                min={0}
                value={income}
                onChange={(e)=>setIncome(e.target.value === "" ? "" : Number(e.target.value))}
                className="border rounded p-2"
                placeholder="e.g., 200000"
              />
              {scheme.income_max !== undefined && (
                <span className="text-xs opacity-70">Income cap: ₹{scheme.income_max.toLocaleString()}</span>
              )}
            </label>
          )}

          {needs.askMinority && (
            <label className="flex flex-col gap-1">
              <span className="text-sm">Minority Status</span>
              <select value={minority} onChange={(e)=>setMinority(e.target.value as any)} className="border rounded p-2">
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          )}

          {needs.askDisability && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-sm">Disability</span>
                <select value={disability} onChange={(e)=>setDisability(e.target.value as any)} className="border rounded p-2">
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              {disability === "yes" && (
                <label className="flex flex-col gap-1">
                  <span className="text-sm">Disability Percentage (%)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={disabilityPct}
                    onChange={(e)=>setDisabilityPct(e.target.value === "" ? "" : Number(e.target.value))}
                    className="border rounded p-2"
                    placeholder="e.g., 40"
                  />
                </label>
              )}
            </>
          )}

          {/* Uncomment if you want marks check later
          <label className="flex flex-col gap-1">
            <span className="text-sm">Last Exam Percentage (%)</span>
            <input
              type="number" min={0} max={100}
              value={marks}
              onChange={(e)=>setMarks(e.target.value === '' ? '' : Number(e.target.value))}
              className="border rounded p-2" placeholder="e.g., 75"
            />
          </label>
          */}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            {result.pass ? (
              <div className="text-sm px-2 py-1 rounded bg-green-100 text-green-700">Eligible based on provided info ✅</div>
            ) : (
              <div className="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800">More info needed / Not eligible ⚠️</div>
            )}
            {result.notes.length > 0 && (
              <ul className="list-disc ps-5 text-xs mt-2">
                {result.notes.map((n,i)=><li key={i}>{n}</li>)}
              </ul>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={()=>{ saveProfile(); onClose(); }}
              className="px-3 py-2 rounded border"
            >Save & Close</button>
            <button
              onClick={()=>{ saveProfile(); }}
              className="px-3 py-2 rounded bg-blue-600 text-white"
            >Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
