import type { LearningEntry, Word } from "../types";

const MAX_LEVEL = 4;

export type RangeProgress = {
  count: number;
  sumLevel: number;
  avgLevel: number;
  unlearned: number;
  weak: number;
  /** レベル0〜4の件数 */
  distribution: [number, number, number, number, number];
  progressPercent: number;
};

export function aggregateProgress(
  words: Word[],
  getEntry: (id: number) => LearningEntry | undefined,
): RangeProgress {
  const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let sumLevel = 0;
  let unlearned = 0;
  let weak = 0;

  for (const w of words) {
    const e = getEntry(w.id);
    const level = e?.level ?? 0;
    sumLevel += level;
    distribution[level]++;
    if (level === 0) unlearned++;
    if (level <= 2) weak++;
  }

  const count = words.length;
  const avgLevel = count === 0 ? 0 : sumLevel / count;
  const progressPercent =
    count === 0 ? 0 : (sumLevel / (MAX_LEVEL * count)) * 100;

  return {
    count,
    sumLevel,
    avgLevel,
    unlearned,
    weak,
    distribution,
    progressPercent,
  };
}
