import type { TestResultItem } from "../types";

type Props = {
  results: TestResultItem[];
  onHome: () => void;
  onRetry: () => void;
};

export function ResultScreen({ results, onHome, onRetry }: Props) {
  const total = results.length;
  const correctN = results.filter((r) => r.correct).length;
  const rate = total === 0 ? 0 : (correctN / total) * 100;
  const wrongItems = results.filter((r) => !r.correct);

  return (
    <div className="page narrow result-page">
      <nav className="ios-navbar">
        <div className="ios-navbar__left">
          <button type="button" className="ios-back-button" onClick={onHome}>
            <span className="ios-back-button__icon">‹</span>
            ホーム
          </button>
        </div>
        <div className="ios-navbar__center">
          <h1 className="ios-navbar-title">テスト結果</h1>
        </div>
      </nav>

      <section className="panel result-score-panel">
        <p className="result-score-label">正答率</p>
        <p className="big-stat">
          <span className="correct-count">{correctN}</span>
          <span className="stat-slash">/</span>
          <span className="total-count">{total}</span>
          <span className="stat-percent">({rate.toFixed(0)}%)</span>
        </p>
      </section>

      <div className="result-actions">
        <button type="button" className="btn primary hero-cta" onClick={onRetry}>
          <span className="hero-cta__label">もう一度挑戦する</span>
        </button>
        <button type="button" className="btn ghost-btn wide-btn" onClick={onHome}>
          ホームに戻る
        </button>
      </div>

      <section className="panel">
        <h2 className="section-title">レベルの変化</h2>
        <div className="result-list">
          {results.map((r, i) => {
            const isUp = r.levelAfter > r.levelBefore;
            const isDown = r.levelAfter < r.levelBefore;
            return (
              <div key={`${r.word.id}-${i}-${r.mode}`} className="result-item">
                <div className="result-item-main">
                  <span className="word-text">
                    {r.mode === "en-ja-mcq" ? r.word.word : r.word.meaning}
                  </span>
                  <p className="word-sub">
                    {r.mode === "en-ja-mcq" ? r.word.meaning : r.word.word}
                  </p>
                </div>

                <div className="level-change-box">
                  <div className={`level-pill lv-${r.levelBefore}`}>
                    Lv{r.levelBefore}
                  </div>
                  <span className="level-arrow">→</span>
                  <div
                    className={`level-pill lv-${r.levelAfter} ${
                      isUp ? "level-up" : isDown ? "level-down" : ""
                    }`}
                  >
                    Lv{r.levelAfter}
                    {isUp && <span className="lv-icon">📈</span>}
                    {isDown && <span className="lv-icon">📉</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {wrongItems.length > 0 && (
        <section className="panel">
          <h2 className="section-title text-danger">復習が必要な単語</h2>
          <div className="wrong-list">
            {wrongItems.map((r) => (
              <div key={`wrong-${r.word.id}`} className="wrong-item">
                <span className="wrong-word">{r.word.word}</span>
                <span className="wrong-meaning">{r.word.meaning}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
