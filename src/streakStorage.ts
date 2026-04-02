const KEY = "leap-pocket-streak-v1";

export type StreakState = {
  lastDate: string | null;
  streak: number;
  longest: number;
};

function todayKeyLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayBeforeYmd(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function loadStreak(): StreakState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { lastDate: null, streak: 0, longest: 0 };
    const p = JSON.parse(raw) as Partial<StreakState>;
    return {
      lastDate: typeof p.lastDate === "string" || p.lastDate === null ? p.lastDate ?? null : null,
      streak: typeof p.streak === "number" ? p.streak : 0,
      longest: typeof p.longest === "number" ? p.longest : 0,
    };
  } catch {
    return { lastDate: null, streak: 0, longest: 0 };
  }
}

export function clearStreak(): void {
  localStorage.removeItem(KEY);
}

function saveStreak(s: StreakState): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

/** 今日の学習を記録。同日2回目以降は連続日数は増えない。 */
export function recordPracticeToday(): StreakState {
  const today = todayKeyLocal();
  const cur = loadStreak();
  if (cur.lastDate === today) {
    return cur;
  }

  let streak: number;
  if (!cur.lastDate) {
    streak = 1;
  } else {
    const yday = dayBeforeYmd(today);
    streak = cur.lastDate === yday ? cur.streak + 1 : 1;
  }

  const longest = Math.max(cur.longest, streak);
  const next: StreakState = { lastDate: today, streak, longest };
  saveStreak(next);
  return next;
}
