import stateData from "../data/stateBoards.json";
import { Link } from "react-router-dom";

type Board = { id:string; name:string; level?:string };
type Region = { region:string; code:string; cbse_majority?:boolean; boards: Board[] };

export default function StateBoards(){
  const regions: Region[] = (stateData as any).states_and_uts || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">State & UT Boards</h1>
      <p className="opacity-80 mb-6 text-sm">
        Pick your state/UT to view its school boards and resources.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((r) => (
          <div key={r.code} className="bg-white rounded-2xl border p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{r.region}</h3>
              {r.cbse_majority && (
                <span className="text-[11px] px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  CBSE majority
                </span>
              )}
            </div>

            {r.boards.length === 0 ? (
              <p className="text-sm opacity-70">Most schools follow CBSE here. Use NCERT/CBSE resources.</p>
            ) : (
              <ul className="text-sm list-disc ps-5">
                {r.boards.map((b) => (
                  <li key={b.id} className="my-1">
                    <div className="flex items-center justify-between gap-2">
                      <span>
                        <strong>{b.name}</strong> {b.level ? <em className="opacity-70">({b.level})</em> : null}
                      </span>
                      <Link
                        to={`/resources?board=${encodeURIComponent(boardIdToGeneric(b.id))}`}
                        className="text-blue-600 underline text-xs"
                      >
                        Open resources
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function boardIdToGeneric(id:string){
  // Map common state board IDs to your existing resource keys
  const map: Record<string,string> = {
    // national
    "CBSE":"NCERT","NCERT":"NCERT",
    // examples (adjust as you add per-board resources)
    "JAC":"JAC",
    "BSEOD":"BSEOD","CHSEOD":"BSEOD",
    "RBSE":"RBSE",
    "MSBSHSE":"MSBSHSE",
    "GSEB":"GSEB",
    "UPMSP":"UPMSP",
    "WBBSE":"WBBSE","WBCHSE":"WBBSE",
    "JKBOSE":"JKBOSE"
  };
  return map[id] || "NCERT"; // fallback
}
