import { useMemo } from "react";
import { WORDS } from "../words";
import { hundredBlocks, presetToIdRange, wordsInRange } from "../logic/ranges";
import type { RangePreset } from "../types";
import { aggregateProgress } from "../logic/progress";

type Props = {
  getEntry: (id: number) => import("../types").LearningEntry | undefined;
};

const ROWS: { label: string; preset: RangePreset }[] = [
  { label: "全体", preset: { kind: "full" } },
  { label: "Part1", preset: { kind: "part", part: 1 } },
  { label: "Part2", preset: { kind: "part", part: 2 } },
  { label: "Part3", preset: { kind: "part", part: 3 } },
  { label: "Part4", preset: { kind: "part", part: 4 } },
  { label: "+α", preset: { kind: "part", part: "alpha" } },
];

export function ProgressOverview({ getEntry }: Props) {
  const rows = useMemo(() => {
    return ROWS.map(({ label, preset }) => {
      const { start, end } = presetToIdRange(preset);
      const words = wordsInRange(WORDS, start, end);
      const p = aggregateProgress(words, getEntry);
      return { label, count: p.count, p };
    });
  }, [getEntry]);

  const rows100 = useMemo(() => {
    return hundredBlocks().map((b) => {
      const words = wordsInRange(WORDS, b.start, b.end);
      const p = aggregateProgress(words, getEntry);
      return { label: b.label, count: p.count, p };
    });
  }, [getEntry]);

  return (
    <section className="panel">
      <h2>進捗一覧（パート・全体）</h2>
      <div className="table-wrap ios-table-container">
        <table className="ios-table">
          <thead>
            <tr>
              <th className="left">範囲</th>
              <th>語数</th>
              <th>平均Lv</th>
              <th>未学習</th>
              <th>苦手</th>
              <th className="right">進捗%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="left font-bold">{r.label}</td>
                <td>{r.count}</td>
                <td className="font-mono">{r.count ? r.p.avgLevel.toFixed(2) : "—"}</td>
                <td>{r.p.unlearned}</td>
                <td className={r.p.weak > 0 ? "text-warn" : ""}>
                  {r.p.weak}
                </td>
                <td className="right font-bold text-accent">{r.count ? `${r.p.progressPercent.toFixed(0)}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="details-block">
        <summary>100単位ブロック（1–100, 101–200, …）</summary>
        <div className="table-wrap scroll-tall">
          <table className="data-table">
            <thead>
              <tr>
                <th>範囲</th>
                <th>語数</th>
                <th>平均Lv</th>
                <th>未学習</th>
                <th>苦手</th>
                <th>進捗%</th>
              </tr>
            </thead>
            <tbody>
              {rows100.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{r.count}</td>
                  <td>{r.count ? r.p.avgLevel.toFixed(2) : "—"}</td>
                  <td>{r.p.unlearned}</td>
                  <td>{r.p.weak}</td>
                  <td>{r.count ? `${r.p.progressPercent.toFixed(1)}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="small muted">
        カスタム範囲の進捗はホーム上部の「進捗（カスタム…）」で表示されます。
      </p>
    </section>
  );
}
