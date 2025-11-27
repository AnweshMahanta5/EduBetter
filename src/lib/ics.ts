
export function createICS(item:any){
  const uid = `${item.id}@edubetter`
  const dtstamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z'
  const dt = (item.deadline || '2025-12-31') + 'T090000Z' // 09:00 UTC placeholder
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EduBetter//Scholarship Deadlines//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dt}`,
    `SUMMARY:Scholarship Deadline — ${escapeICS(item.title)}`,
    `DESCRIPTION:${escapeICS(item.benefit || '')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
}

function escapeICS(s:string){
  return String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')
}
