
import { Link } from 'react-router-dom'

export default function ScholarshipCard({ item }:{ item:any }){
  const tagClass = item.tag === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
  return (
    <div className="bg-white rounded-xl border p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{item.title}</h3>
        <span className={"text-xs px-2 py-1 rounded " + tagClass}>{item.tag}</span>
      </div>
      <div className="text-sm opacity-80">{item.benefit}</div>
      <div className="text-xs opacity-70">Deadline: {item.deadline}</div>
      <div className="text-xs opacity-70">Source: {item.source} • Updated: {item.last_updated}</div>
      <div className="flex gap-2 pt-2">
        <Link to={`/scholarship/${item.id}`} className="px-3 py-2 text-sm rounded bg-blue-600 text-white">View</Link>
        <a href={item.links?.apply || '#'} target="_blank" className="px-3 py-2 text-sm rounded border">Apply</a>
      </div>
    </div>
  )
}
