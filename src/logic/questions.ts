import type { SessionQuestion, TestQuestionMode, Word } from "../types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(pool: Word[], target: Word, count: number, pickField: "word" | "meaning"): string[] {
  const others = pool.filter((w) => w.id !== target.id);
  const shuffled = shuffle(others);
  const out: string[] = [];
  for (const w of shuffled) {
    if (out.length >= count) break;
    const val = pickField === "word" ? w.word : w.meaning;
    if (!out.includes(val)) out.push(val);
  }
  while (out.length < count && others.length > 0) {
    out.push(`(dummy ${out.length})`);
  }
  return out.slice(0, count);
}

export function buildSessionQuestion(
  word: Word,
  mode: TestQuestionMode,
  rangePool: Word[],
): SessionQuestion {
  if (mode === "ja-en-input") {
    return { word, mode };
  }

  if (mode === "ja-en-mcq") {
    const correct = word.word;
    const distractors = pickDistractors(rangePool, word, 3, "word");
    const choices = shuffle([correct, ...distractors]);
    const correctIndex = choices.indexOf(correct);
    return { word, mode, choices, correctIndex };
  }

  // en-ja-mcq
  const correct = word.meaning;
  const distractors = pickDistractors(rangePool, word, 3, "meaning");
  const choices = shuffle([correct, ...distractors]);
  const correctIndex = choices.indexOf(correct);
  return { word, mode, choices, correctIndex };
}

export function normalizeInputAnswer(s: string): string {
  return s.trim().toLowerCase();
}

export function checkInputCorrect(input: string, expected: string): boolean {
  return normalizeInputAnswer(input) === normalizeInputAnswer(expected);
}
