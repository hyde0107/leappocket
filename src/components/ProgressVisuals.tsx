import type { RangeProgress } from "../logic/progress";

/** 未習 / 苦手 / 習得 の積み上げバー（比率が一目で分かる） */
export function StackedLevelBar({
  distribution,
  count,
  className = "",
  thick = false,
}: {
  distribution: RangeProgress["distribution"];
  count: number;
  className?: string;
  thick?: boolean;
}) {
  if (count === 0) {
    return <div className={`stack-bar empty ${className}`} />;
  }
  const u = distribution[0];
  const w = distribution[1] + distribution[2];
  const ok = distribution[3] + distribution[4];
  const pu = (u / count) * 100;
  const pw = (w / count) * 100;
  const pok = (ok / count) * 100;
  return (
    <div
      className={`stack-bar ${thick ? "stack-bar--thick" : ""} ${className}`}
      role="img"
      aria-label={`未習${pu.toFixed(0)}パーセント、苦手${pw.toFixed(0)}パーセント、習得${pok.toFixed(0)}パーセント`}
    >
      {pu > 0 && (
        <span className="stack-seg stack-seg--unlearned" style={{ width: `${pu}%` }} />
      )}
      {pw > 0 && (
        <span className="stack-seg stack-seg--weak" style={{ width: `${pw}%` }} />
      )}
      {pok > 0 && (
        <span className="stack-seg stack-seg--learned" style={{ width: `${pok}%` }} />
      )}
    </div>
  );
}

export function ProgressRing({
  percent,
  sublabel,
  size = "lg",
}: {
  percent: number;
  sublabel: string;
  size?: "lg" | "md";
}) {
  const p = Math.min(100, Math.max(0, percent));
  const r = size === "lg" ? 52 : 38;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;
  const dim = size === "lg" ? 120 : 92;
  return (
    <div className={`prog-ring-wrap prog-ring-wrap--${size}`} aria-hidden>
      <svg className="prog-ring-svg" viewBox={`0 0 ${dim} ${dim}`}>
        <circle className="prog-ring-bg" cx={dim / 2} cy={dim / 2} r={r} />
        <circle
          className="prog-ring-fg"
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
        />
      </svg>
      <div className="prog-ring-label">
        <span className="prog-ring-pct">{p.toFixed(0)}%</span>
        <span className="prog-ring-sub">{sublabel}</span>
      </div>
    </div>
  );
}

export function GradientProgressTrack({ percent }: { percent: number }) {
  const p = Math.min(100, Math.max(0, percent));
  return (
    <div className="grad-track" role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin={0} aria-valuemax={100}>
      <div className="grad-track-fill" style={{ width: `${p}%` }} />
    </div>
  );
}

/** 1行：ラベル + 積み上げ + パーセント（パート別など） */
export function RangeProgressRow({
  label,
  sub,
  stats,
}: {
  label: string;
  sub?: string;
  stats: RangeProgress;
}) {
  const pct = stats.count === 0 ? 0 : stats.progressPercent;
  return (
    <div className="range-prow">
      <div className="range-prow-head">
        <span className="range-prow-title">{label}</span>
        {sub && <span className="range-prow-sub muted">{sub}</span>}
        <span className="range-prow-pct">{pct.toFixed(0)}%</span>
      </div>
      <StackedLevelBar distribution={stats.distribution} count={stats.count} />
      <div className="range-prow-meta small muted">
        <span>Lv均 {stats.count ? stats.avgLevel.toFixed(2) : "—"}</span>
        <span>未習 {stats.unlearned}</span>
        <span>苦手 {stats.distribution[0] + stats.distribution[1] + stats.distribution[2]}</span>
        <span>習得 {stats.distribution[3] + stats.distribution[4]}</span>
      </div>
    </div>
  );
}

/** 範囲タイル内：コンパクトな積み上げ + % */
export function TileProgressFoot({
  stats,
}: {
  stats: RangeProgress;
}) {
  if (stats.count === 0) return null;
  const pct = stats.progressPercent;
  return (
    <div className="tile-prog-foot">
      <StackedLevelBar distribution={stats.distribution} count={stats.count} />
      <span className="tile-prog-pct">{pct.toFixed(0)}%</span>
    </div>
  );
}
