
export default function Help(){
  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white rounded-2xl border p-6 flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Help & Support</h2>
        <p className="text-sm opacity-80">Questions about eligibility, documents, or deadlines?</p>
        <ul className="list-disc ps-6 text-sm">
          <li>FAQ: What is EWS? Where to get an income certificate?</li>
          <li>Contact: <a className="underline" href="mailto:support@edubetter.example">support@edubetter.example</a></li>
        </ul>
      </div>
    </div>
  )
}
