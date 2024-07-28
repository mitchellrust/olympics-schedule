'use server'

export async function fetchEventsAction(dateStr: string) : Promise<any[]>
{
  console.log(`fetching events for date ${dateStr}`);

  // Date in format YYY-MM-DD
  const res = await fetch(`https://sph-s-api.olympics.com/summer/schedules/api/ENG/schedule/day/${dateStr}`)

  if (!res.ok) {
    console.log(`failed to fetch events [${res.status}] [${res.statusText}]`);
    return [];
  }
  
  return (await res.json())["units"];
}