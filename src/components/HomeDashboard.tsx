import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WORDS } from "../words";
import { presetToIdRange, wordsInRange } from "../logic/ranges";
import { aggregateProgress } from "../logic/progress";
import { getPartSummaryRows } from "../logic/rangeTiles";
import {
  GradientProgressTrack,
  ProgressRing,
  RangeProgressRow,
  StackedLevelBar,
} from "./ProgressVisuals";
import { ProgressOverview } from "./ProgressOverview";
import { useLearning } from "../LearningContext";
import { loadStreak, clearStreak } from "../streakStorage";

export function HomeDashboard() {
  const navigate = useNavigate();
  const { getEntry, resetAll } = useLearning();
  const [streak, setStreak] = useState(() => loadStreak());

  useEffect(() => {
    const refresh = () => setStreak(loadStreak());
    refresh();
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const overall = useMemo(
    () => aggregateProgress(WORDS, getEntry),
    [getEntry],
  );

  const partRows = useMemo(() => {
    return getPartSummaryRows().map((row) => {
      const { start, end } = presetToIdRange(row.preset);
      const words = wordsInRange(WORDS, start, end);
      return {
        ...row,
        stats: aggregateProgress(words, getEntry),
      };
    });
  }, [getEntry]);

  return (
    <div className="page home-app">
      <header className="home-top">
        <div className="home-brand">
          <p className="home-eyebrow">ホーム</p>
          <h1 className="home-title">LEAP</h1>
        </div>
        <div className="streak-pill" title="学習した日が続くと増えます">
          <span className="streak-flame" aria-hidden>
            🔥
          </span>
          <span className="streak-num">{streak.streak}</span>
          <span className="streak-unit">日連続</span>
        </div>
      </header>

      <section className="home-hero-card">
        <div className="home-hero-card__shine" aria-hidden />
        <h2 className="visually-hidden">全体の進捗</h2>
        <div className="home-hero-row">
          <ProgressRing percent={overall.progressPercent} sublabel="習得率" />
          <div className="home-hero-metrics">
            <div className="home-metric">
              <span className="home-metric-val">{overall.avgLevel.toFixed(2)}</span>
              <span className="home-metric-lbl">平均Lv</span>
            </div>
            <div className="home-metric">
              <span className="home-metric-val">{overall.unlearned}</span>
              <span className="home-metric-lbl">未習</span>
            </div>
            <div className="home-metric">
              <span className="home-metric-val">
                {overall.weak}
              </span>
              <span className="home-metric-lbl">苦手</span>
            </div>
          </div>
        </div>

        <StackedLevelBar
          distribution={overall.distribution}
          count={overall.count}
          thick
          className="home-stack-bar"
        />
        <GradientProgressTrack percent={overall.progressPercent} />
        <div className="home-hero-legend small muted">
          <span>
            <i className="dot unlearned" />
            未習 {overall.distribution[0]}
          </span>
          <span>
            <i className="dot weak" />
            苦手 {overall.weak}
          </span>
          <span>
            <i className="dot learned" />
            習得 {overall.distribution[3] + overall.distribution[4]}
          </span>
        </div>

        <button
          type="button"
          className="btn hero-cta"
          onClick={() => navigate("/ranges")}
        >
          <span className="hero-cta__label">学習スタート</span>
          <span className="hero-cta__icon" aria-hidden>
            ▶
          </span>
        </button>
      </section>

      <section className="panel home-parts-panel">
        <h2 className="range-heading">パート別進捗</h2>
        <div className="range-prow-list">
          {partRows.map((row) => (
            <RangeProgressRow
              key={row.id}
              label={row.label}
              sub={`${presetToIdRange(row.preset).start}–${presetToIdRange(row.preset).end}`}
              stats={row.stats}
            />
          ))}
          <RangeProgressRow
            label="全体"
            sub="1–2300"
            stats={overall}
          />
        </div>
      </section>

      <details className="app-details">
        <summary className="app-details-summary">詳細データ</summary>
        <div className="app-details-body">
          <ProgressOverview getEntry={getEntry} />
          
          <div className="reset-section">
            <button 
              type="button" 
              className="btn danger ghost-btn full-width" 
              onClick={() => {
                if (window.confirm("これまでの学習記録をすべて消去します。よろしいですか？")) {
                  resetAll();
                  clearStreak();
                  window.location.reload();
                }
              }}
            >
              学習データをすべて消去する
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}
