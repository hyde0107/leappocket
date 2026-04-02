import type { LearningEntry } from "./types";

const STORAGE_KEY = "leap-pocket-learning-v1";

export type LearningMap = Record<number, LearningEntry>;

export function loadLearning(): LearningMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LearningMap;
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function saveLearning(map: LearningMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getOrCreateEntry(map: LearningMap, id: number): LearningEntry {
  const existing = map[id];
  if (existing) return { ...existing, id };
  return { id, level: 0, lastReviewed: null, wrongCount: 0 };
}
