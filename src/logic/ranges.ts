import { WORD_ID_MAX, WORD_ID_MIN } from "../words";
import type { RangePreset, Word } from "../types";

/** パート定義（仕様 6.2） */
export const PART_RANGES: Record<1 | 2 | 3 | 4 | "alpha", { start: number; end: number }> = {
  1: { start: 1, end: 400 },
  2: { start: 401, end: 1000 },
  3: { start: 1001, end: 1400 },
  4: { start: 1401, end: 2000 },
  alpha: { start: 2001, end: 2300 },
};

export function presetToIdRange(preset: RangePreset): { start: number; end: number } {
  switch (preset.kind) {
    case "full":
      return { start: WORD_ID_MIN, end: WORD_ID_MAX };
    case "custom":
      return clipRange(preset.startId, preset.endId);
    case "part":
      return { ...PART_RANGES[preset.part] };
    case "block": {
      const b = clipRange(preset.startId, preset.endId);
      return alignToHundredBlock(b.start, b.end);
    }
  }
}

function clipRange(a: number, b: number): { start: number; end: number } {
  const start = Math.max(WORD_ID_MIN, Math.min(a, b));
  const end = Math.min(WORD_ID_MAX, Math.max(a, b));
  return { start, end: Math.max(start, end) };
}

/** 100単位ブロック（例: 1–100）に揃える */
function alignToHundredBlock(start: number, end: number): { start: number; end: number } {
  const blockStart = Math.floor((start - 1) / 100) * 100 + 1;
  const blockEnd = Math.min(WORD_ID_MAX, Math.ceil(end / 100) * 100);
  return clipRange(blockStart, blockEnd);
}

/** 100単位ブロック一覧（1–100, 101–200, …） */
export function hundredBlocks(): { label: string; start: number; end: number }[] {
  const out: { label: string; start: number; end: number }[] = [];
  for (let s = 1; s <= WORD_ID_MAX; s += 100) {
    const e = Math.min(s + 99, WORD_ID_MAX);
    out.push({ label: `${s}–${e}`, start: s, end: e });
  }
  return out;
}

export function wordsInRange(words: Word[], start: number, end: number): Word[] {
  return words.filter((w) => w.id >= start && w.id <= end);
}
