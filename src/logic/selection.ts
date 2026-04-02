import type { LearningEntry, Word } from "../types";
import { computePriority } from "./priority";

const SESSION_SIZE = 20;
const TOP_POOL_RATIO = 0.4;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  if (arr.length === 0) return [];
  if (arr.length >= n) return shuffle(arr).slice(0, n);
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    out.push(arr[Math.floor(Math.random() * arr.length)]!);
  }
  return out;
}

/**
 * ①対象範囲 ②priority ③降順ソート ④上位40%をプール ⑤その中からランダム20問
 * 対象が20未満のときは重複を許して20問に満たす
 */
export function selectWordsForSession(
  pool: Word[],
  getEntry: (id: number) => LearningEntry | undefined,
  now: number,
  strategy: "priority" | "random",
): Word[] {
  if (pool.length === 0) return [];
  if (strategy === "random") {
    return pickRandom(pool, SESSION_SIZE);
  }

  const scored = pool.map((w) => ({
    word: w,
    p: computePriority(getEntry(w.id), now),
  }));
  scored.sort((a, b) => b.p - a.p);

  const poolSize = Math.max(SESSION_SIZE, Math.ceil(scored.length * TOP_POOL_RATIO));
  const top = scored.slice(0, poolSize).map((s) => s.word);
  return pickRandom(top, SESSION_SIZE);
}

export const QUESTIONS_PER_SESSION = SESSION_SIZE;
