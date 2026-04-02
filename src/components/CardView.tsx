import { useCallback, useMemo, useState } from "react";
import type { HomeLaunchCards } from "../sessionLaunch";
import { WORDS } from "../words";
import { presetToIdRange, wordsInRange } from "../logic/ranges";
import { useLearning } from "../LearningContext";
import { recordPracticeToday } from "../streakStorage";

type Props = {
  launch: HomeLaunchCards;
  onExit: () => void;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function CardView({ launch, onExit }: Props) {
  const { applyCardRemember, applyCardForgot } = useLearning();
  const { start, end } = presetToIdRange(launch.preset);
  const list = useMemo(() => {
    const w = wordsInRange(WORDS, start, end);
    return launch.randomOrder ? shuffle(w) : w;
  }, [start, end, launch.randomOrder]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const w = list[index];
  const total = list.length;

  const next = useCallback(() => {
    setFlipped(false);
    setIndex((i) => (i + 1 < total ? i + 1 : 0));
  }, [total]);

  const onRemember = useCallback(() => {
    if (!w) return;
    recordPracticeToday();
    applyCardRemember(w.id);
    next();
  }, [w, applyCardRemember, next]);

  const onForgot = useCallback(() => {
    if (!w) return;
    recordPracticeToday();
    applyCardForgot(w.id);
    next();
  }, [w, applyCardForgot, next]);

  if (total === 0) {
    return (
      <div className="page narrow">
        <p>この範囲に単語がありません。</p>
        <button type="button" className="btn" onClick={onExit}>
          戻る
        </button>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <nav className="ios-navbar">
        <div className="ios-navbar__left">
          <button type="button" className="ios-back-button" onClick={onExit}>
            <span className="ios-back-button__icon">‹</span>
            ホーム
          </button>
        </div>
        <div className="ios-navbar__center">
          <span className="badge">
            {index + 1} / {total}
          </span>
        </div>
      </nav>

      <div
        className="card-surface"
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <p className="muted small">タップで裏返し</p>
        {!flipped ? (
          <>
            <p className="card-label">英語</p>
            <p className="card-main en">{w.word}</p>
          </>
        ) : (
          <>
            <p className="card-label">日本語</p>
            <p className="card-main ja">{w.meaning}</p>
          </>
        )}
      </div>

      <div className="card-actions">
        <button type="button" className="btn danger" onClick={onForgot}>
          忘れた（Lv−1）
        </button>
        <button type="button" className="btn success" onClick={onRemember}>
          覚えた（Lv+1）
        </button>
      </div>
    </div>
  );
}
