import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import type { HomeLaunchTest } from "../sessionLaunch";
import type { TestResultItem } from "../types";
import { WORDS } from "../words";
import { presetToIdRange, wordsInRange } from "../logic/ranges";
import { selectWordsForSession } from "../logic/selection";
import { buildSessionQuestion, checkInputCorrect } from "../logic/questions";
import { clipLevel } from "../logic/priority";
import { useLearning } from "../LearningContext";

type Props = {
  launch: HomeLaunchTest;
  onFinish: (results: TestResultItem[]) => void;
  onCancel: () => void;
};

type FeedbackState = {
  correct: boolean;
  chosenIndex?: number;
  correctIndex?: number;
  correctAns?: string;
  item: TestResultItem;
} | null;

export function TestScreen({ launch, onFinish, onCancel }: Props) {
  const { getEntry, applyTestResult } = useLearning();
  const { start, end } = presetToIdRange(launch.preset);
  const rangePool = useMemo(() => wordsInRange(WORDS, start, end), [start, end]);

  const questions = useMemo(
    () => {
      const now = Date.now();
      // 元々の getEntry をラップせず、呼び出し時点の getEntry で単語を選択
      const picked = selectWordsForSession(
        rangePool,
        (id) => getEntry(id),
        now,
        launch.strategy,
      );
      return picked.map((w) =>
        buildSessionQuestion(w, launch.testMode, rangePool),
      );
    },
    // getEntry を依存関係から外すことで、テスト中の進捗更新による再計算を防ぐ
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rangePool, launch.testMode, launch.strategy, launch.preset],
  );

  const [index, setIndex] = useState(0);
  const [, setResults] = useState<TestResultItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const q = questions[index];
  const total = questions.length;
  const remaining = total - index;

  const handleNext = useCallback(() => {
    if (!feedback) return;
    setResults((prev) => {
      const next = [...prev, feedback.item];
      if (next.length === total) {
        onFinish(next);
      }
      return next;
    });
    setFeedback(null);
    setInputValue("");
    setIndex((i) => {
      if (i + 1 === total) return i;
      return i + 1;
    });
  }, [feedback, total, onFinish]);

  const submitMcq = useCallback(
    (choiceIndex: number) => {
      if (feedback || !q || (q.mode !== "ja-en-mcq" && q.mode !== "en-ja-mcq")) return;
      const levelBefore = getEntry(q.word.id)?.level ?? 0;
      const correct = choiceIndex === q.correctIndex;
      applyTestResult(q.word.id, correct);
      const levelAfter = correct
        ? clipLevel(levelBefore + 1)
        : clipLevel(levelBefore - 1);
      
      setFeedback({
        correct,
        chosenIndex: choiceIndex,
        correctIndex: q.correctIndex,
        item: {
          word: q.word,
          mode: q.mode,
          correct,
          levelBefore,
          levelAfter,
        }
      });
    },
    [q, feedback, getEntry, applyTestResult]
  );

  const submitInput = useCallback(() => {
    if (feedback || !q || q.mode !== "ja-en-input") return;
    if (!inputValue.trim()) return; // Prevent empty submission
    const levelBefore = getEntry(q.word.id)?.level ?? 0;
    const correct = checkInputCorrect(inputValue, q.word.word);
    applyTestResult(q.word.id, correct);
    const levelAfter = correct
      ? clipLevel(levelBefore + 1)
      : clipLevel(levelBefore - 1);
    
    setFeedback({
      correct,
      correctAns: q.word.word,
      item: {
        word: q.word,
        mode: q.mode,
        correct,
        levelBefore,
        levelAfter,
      }
    });
  }, [q, inputValue, feedback, getEntry, applyTestResult]);

  // Focus management
  useEffect(() => {
    if (feedback && nextBtnRef.current) {
      nextBtnRef.current.focus();
    } else if (!feedback && q?.mode === "ja-en-input" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [feedback, q]);

  // Global keydown for Enter to speed up Next (When wrong)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && feedback && !feedback.correct) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, handleNext]);

  // Auto-advance for correct answers
  useEffect(() => {
    if (feedback && feedback.correct) {
      const timer = setTimeout(() => {
        handleNext();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [feedback, handleNext]);

  if (total === 0) {
    return (
      <div className="page narrow">
        <p>この範囲に単語がありません。</p>
        <button type="button" className="btn" onClick={onCancel}>
          戻る
        </button>
      </div>
    );
  }

  const prompt =
    q.mode === "en-ja-mcq" ? (
      <p className="prompt en">{q.word.word}</p>
    ) : (
      <p className="prompt ja">{q.word.meaning}</p>
    );

  return (
    <div className="page narrow test-page">
      <nav className="ios-navbar">
        <div className="ios-navbar__left">
          <button type="button" className="ios-back-button" onClick={onCancel}>
            <span className="ios-back-button__icon">‹</span>
            ホーム
          </button>
        </div>
        <div className="ios-navbar__center">
          <span className="badge">
            残り {remaining} / {total}
          </span>
        </div>
      </nav>

      <h2 className="q-title">問題 {index + 1}</h2>
      {prompt}

      {(q.mode === "ja-en-mcq" || q.mode === "en-ja-mcq") && q.choices && (
        <div className="choices">
          {q.choices.map((c, i) => {
            let className = "choice";
            if (feedback) {
              if (i === feedback.correctIndex) {
                className += " correct-choice";
              } else if (i === feedback.chosenIndex && !feedback.correct) {
                className += " wrong-choice";
              }
            }
            return (
              <button
                key={`${c}-${i}`}
                type="button"
                className={className}
                onClick={() => submitMcq(i)}
                disabled={!!feedback}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {q.mode === "ja-en-input" && (
        <div className="input-block">
          <label className="muted small">英語を入力</label>
          <input
            ref={inputRef}
            className={`text-input ${feedback ? (feedback.correct ? 'input-correct' : 'input-wrong') : ''}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !feedback) submitInput();
            }}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={!!feedback}
          />
          {!feedback && (
            <button type="button" className="btn primary" onClick={submitInput}>
              解答する
            </button>
          )}
        </div>
      )}

      {feedback && !feedback.correct && (
        <div className="feedback-card animated-up danger">
          <h3 className="feedback-title">不正解…</h3>
          {feedback.correctAns && (
            <p className="feedback-answer">
              正解：<strong>{feedback.correctAns}</strong>
            </p>
          )}
          <button
            ref={nextBtnRef}
            type="button"
            className="btn feedback-next danger-btn"
            onClick={handleNext}
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
