import type { Word } from "../types";
import { aggregateProgress } from "../logic/progress";

type Props = {
  title: string;
  words: Word[];
  getEntry: (id: number) => import("../types").LearningEntry | undefined;
};

export function ProgressPanel({ title, words, getEntry }: Props) {
  const p = aggregateProgress(words, getEntry);
  const n = p.count;
  const weakLe2 = p.weak;

  if (n === 0) {
    return (
      <section className="panel">
        <h3>{title}</h3>
        <p className="muted">この範囲に単語がありません。</p>
      </section>
    );
  }

  const pct = (c: number) => (n === 0 ? 0 : (c / n) * 100);

  return (
    <section className="panel">
      <h3>{title}</h3>
      <div className="metrics">
        <div>
          <span className="muted">平均レベル</span>
          <strong>{p.avgLevel.toFixed(2)}</strong>
        </div>
        <div>
          <span className="muted">未学習（Lv0）</span>
          <strong>{p.distribution[0]}</strong>
        </div>
        <div>
          <span className="muted">苦手</span>
          <strong>{weakLe2}</strong>
        </div>
      </div>

      <div className="progress-row">
        <span className="muted">進捗率</span>
        <span>{p.progressPercent.toFixed(1)}%</span>
      </div>
      <div className="bar track">
        <div className="bar fill progress" style={{ width: `${p.progressPercent}%` }} />
      </div>

      <p className="muted small">レベル分布（未学習 / 苦手 / 習得）</p>
      <div className="bar track dist">
        <div
          className="seg unlearned"
          style={{ width: `${pct(p.distribution[0])}%` }}
          title={`未学習 L0: ${p.distribution[0]}`}
        />
        <div
          className="seg weak"
          style={{ width: `${pct(p.distribution[1] + p.distribution[2])}%` }}
          title={`苦手 L1–2: ${p.distribution[1] + p.distribution[2]}`}
        />
        <div
          className="seg learned"
          style={{ width: `${pct(p.distribution[3] + p.distribution[4])}%` }}
          title={`習得 L3–4: ${p.distribution[3] + p.distribution[4]}`}
        />
      </div>
      <div className="legend small">
        <span>
          <i className="dot unlearned" /> 未学習
        </span>
        <span>
          <i className="dot weak" /> 苦手
        </span>
        <span>
          <i className="dot learned" /> 習得
        </span>
      </div>
    </section>
  );
}
