import type { Word } from "./types";
import wordsData from "./words.json";

// JSONデータを読み込み、Word 型としてキャスト
export const WORDS: Word[] = wordsData as Word[];

// データ内の末尾のID、もしくは要素数を動的に TOTAL とする
export const TOTAL = WORDS.length > 0 ? WORDS[WORDS.length - 1].id : 0;

export function getWordById(id: number): Word | undefined {
  if (id < 1 || id > TOTAL) return undefined;
  // idは1始まりを想定。もしIDが単純な連番でなかった場合の安全策
  return WORDS.find((w) => w.id === id) || undefined;
}

export const WORD_ID_MIN = 1;
export const WORD_ID_MAX = TOTAL;
