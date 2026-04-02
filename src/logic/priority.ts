import type { LearningEntry } from "../types";

const MS_PER_DAY = 86_400_000;

/**
 * priority = (4 - level) * 3 + min(days_since_last_review, 7) + wrongCount * 2
 * 未学習（lastReviewed null）は「放置」とみなし days 成分を 7 とする
 */
export function computePriority(entry: LearningEntry | undefined, now: number): number {
  const level = entry?.level ?? 0;
  const wrongCount = entry?.wrongCount ?? 0;
  let days = 7;
  if (entry?.lastReviewed != null) {
    days = Math.min(7, Math.floor((now - entry.lastReviewed) / MS_PER_DAY));
  }
  const levelBonus = level === 0 ? 10 : 0;
  return (4 - level) * 3 + days + wrongCount * 2 + levelBonus;
}

export function clipLevel(level: number): number {
  return Math.max(0, Math.min(4, level));
}
