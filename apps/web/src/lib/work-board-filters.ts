export function vietnamWorkDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

/** Monday through Sunday, using the same Vietnam calendar as the API. */
export function workWeekRange(now = new Date()) {
  const day = new Date(`${vietnamWorkDate(now)}T00:00:00Z`);
  const offset = (day.getUTCDay() + 6) % 7;
  day.setUTCDate(day.getUTCDate() - offset);
  const start = day.toISOString().slice(0, 10);
  day.setUTCDate(day.getUTCDate() + 6);
  return { start, end: day.toISOString().slice(0, 10) };
}

export function matchesWorkDeadline(
  task: { deadline?: string | null; columnKey?: string },
  filter: string,
  now = new Date(),
) {
  const date = task.deadline?.slice(0, 10);
  if (filter === 'overdue') return !!date && task.columnKey !== 'DONE' && date < vietnamWorkDate(now);
  if (filter === 'this_week') {
    const { start, end } = workWeekRange(now);
    return !!date && date >= start && date <= end;
  }
  return filter === 'has_deadline' ? !!date : true;
}
