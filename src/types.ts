export type Word = {
  id: number;
  word: string;
  meaning: string;
};

/** 動的学習データ（単語IDキー） */
export type LearningEntry = {
  id: number;
  level: number;
  lastReviewed: number | null;
  wrongCount: number;
};

export type TestQuestionMode = "ja-en-mcq" | "en-ja-mcq" | "ja-en-input";

export type SelectionStrategy = "priority" | "random";

export type RangePreset =
  | { kind: "part"; part: 1 | 2 | 3 | 4 | "alpha" }
  | { kind: "block"; startId: number; endId: number }
  | { kind: "full" }
  | { kind: "custom"; startId: number; endId: number };

export type SessionQuestion = {
  word: Word;
  mode: TestQuestionMode;
  choices?: string[];
  correctIndex?: number;
};

export type TestResultItem = {
  word: Word;
  mode: TestQuestionMode;
  correct: boolean;
  levelBefore: number;
  levelAfter: number;
};
