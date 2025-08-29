import { Link } from "react-router-dom";

export default function ResourcesLanding(){
  const cards = [
    { id:"CBSE", title:"CBSE", desc:"Class 1–12 textbooks, English & Hindi", emoji:"🏫" },
    { id:"ICSE", title:"ICSE", desc:"Class 1–12 textbooks, English & Hindi", emoji:"📗" },
    { id:"STATE", title:"State Board", desc:"Select your state, Class 1–12", emoji:"🗺️" }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Resources</h1>
      <p className="opacity-80 mb-6">Pick a board to browse books by class, language, and subject.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border p-5 flex flex-col gap-3">
            <div className="text-3xl">{c.emoji}</div>
            <h3 className="font-semibold">{c.title}</h3>
            <p className="text-sm opacity-80">{c.desc}</p>
            <div>
              <Link
                to={c.id === "STATE" ? "/resources/board/STATE" : `/resources/board/${c.id}`}
                className="inline-block px-3 py-2 rounded bg-blue-600 text-white text-sm"
              >
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
