
type Profile = { class: number; board: string; state: string }
type Scheme = any

export default function match(profile:Profile, schemes:Scheme[]){
  const out:any[] = []
  for(const s of schemes){
    const stateOk = s.states?.includes('IN-*') || s.states?.includes(profile.state) || false
    const boardOk = !s.boards || s.boards.includes('Any') || s.boards.includes(profile.board)
    const gradeOk = profile.class >= s.grades.min && profile.class <= s.grades.max
    if(stateOk && boardOk && gradeOk){
      // baseline tag; could be 'Needs Info' if optional fields are missing
      const tag = 'Confirmed'
      out.push({ ...s, tag })
    }
  }
  // sort by deadline asc
  out.sort((a,b) => (a.deadline || '').localeCompare(b.deadline || ''))
  return out
}
