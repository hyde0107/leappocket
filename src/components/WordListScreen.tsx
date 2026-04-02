import { useMemo } from "react";
import type { RangePreset } from "../types";
import { WORDS } from "../words";
import { presetToIdRange, wordsInRange } from "../logic/ranges";
import { useLearning } from "../LearningContext";

type Props = {
  preset: RangePreset;
  onBack: () => void;
};

export function WordListScreen({ preset, onBack }: Props) {
  const { getEntry } = useLearning();

  const words = useMemo(() => {
    const { start, end } = presetToIdRange(preset);
    return wordsInRange(WORDS, start, end);
  }, [preset]);

  const rangeTitle = useMemo(() => {
    if (preset.kind === "full") return "全体";
    if (preset.kind === "part") return preset.part === "alpha" ? "+α" : `Part ${preset.part}`;
    if (preset.kind === "block") return `${preset.startId}–${preset.endId}`;
    return "カスタム範囲";
  }, [preset]);

  return (
    <div className="page word-list-page">
      <nav className="ios-navbar">
        <div className="ios-navbar__left">
          <button type="button" className="ios-back-button" onClick={onBack}>
            <span className="ios-back-button__icon">‹</span>
            戻る
          </button>
        </div>
        <div className="ios-navbar__center">
          <h1 className="ios-navbar-title">{rangeTitle} の単語一覧</h1>
        </div>
      </nav>

      <section className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="word-list-container">
          {words.map((w) => {
            const level = getEntry(w.id)?.level ?? 0;
            let levelClass = "lv0";
            if (level > 0 && level <= 2) levelClass = "lv12";
            if (level >= 3) levelClass = "lv34";

            return (
              <div key={w.id} className={`word-list-row ${levelClass}`}>
                <div className="word-list-main">
                  <span className="word-list-en">{w.word}</span>
                  <span className="word-list-ja">{w.meaning}</span>
                </div>
                <div className="word-list-side">
                  <span className={`level-tag ${levelClass}`}>Lv {level}</span>
                  <span className="id-tag">#{w.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
