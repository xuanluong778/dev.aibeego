const assert = require('node:assert/strict');
const { vietnamWorkDate, workWeekRange, matchesWorkDeadline } = require('../apps/web/src/lib/work-board-filters.ts');
// Vietnam is already the next day while UTC is still the previous date.
const sunday = new Date('2026-11-14T20:00:00Z');
assert.equal(vietnamWorkDate(sunday), '2026-11-15');
assert.deepEqual(workWeekRange(sunday), { start: '2026-11-09', end: '2026-11-15' });
assert.equal(matchesWorkDeadline({ deadline: '2026-11-14', columnKey: 'IN_PROGRESS' }, 'overdue', sunday), true);
assert.equal(matchesWorkDeadline({ deadline: '2026-11-14', columnKey: 'DONE' }, 'overdue', sunday), false);
assert.equal(matchesWorkDeadline({ deadline: '2026-11-15' }, 'overdue', sunday), false);
assert.equal(matchesWorkDeadline({ deadline: '2026-11-09' }, 'this_week', sunday), true);
assert.equal(matchesWorkDeadline({ deadline: '2026-11-16' }, 'this_week', sunday), false);
assert.equal(matchesWorkDeadline({ deadline: null }, 'has_deadline', sunday), false);
assert.deepEqual(workWeekRange(new Date('2026-11-15T18:00:00Z')), { start: '2026-11-16', end: '2026-11-22' });
console.log('PASS 9 deadline/timezone/week-boundary checks using production code');
