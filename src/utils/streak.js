import { getDateKey } from './date';

export function calculateStreak(sessions = [], now = new Date()) {
  const completedDays = new Set(sessions.map((session) => getDateKey(session.date)).filter(Boolean));
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayKey = getDateKey(today);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = getDateKey(yesterday);

  if (!completedDays.has(todayKey) && !completedDays.has(yesterdayKey)) return 0;
  let cursor = completedDays.has(todayKey) ? today : yesterday;
  let streak = 0;
  while (completedDays.has(getDateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor);
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
