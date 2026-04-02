import { useCallback, useEffect, useMemo, useState } from "react";
import type { RangePreset, SelectionStrategy, TestQuestionMode } from "../types";
import { WORDS } from "../words";
import { PART_RANGES, presetToIdRange, wordsInRange } from "../logic/ranges";
import { aggregateProgress } from "../logic/progress";
import { getRangeTileList, type RangeTileDef } from "../logic/rangeTiles";
import { TileProgressFoot } from "./ProgressVisuals";
import type { HomeLaunchCards, HomeLaunchTest } from "../sessionLaunch";
import { useLearning } from "../LearningContext";

type Props = {
  onBack: () => void;
  onTest: (p: HomeLaunchTest) => void;
  onCards: (p: HomeLaunchCards) => void;
  onWordList: (preset: RangePreset) => void;
};

function tileMeta(preset: RangePreset): { label: string; hint: string } {
  if (preset.kind === "full") return { label: "全体", hint: "1–2300" };
  if (preset.kind === "part") {
    const pr = PART_RANGES[preset.part];
    const name = preset.part === "alpha" ? "+α" : `Part${preset.part}`;
    return { label: name, hint: `${pr.start}–${pr.end}` };
  }
  if (preset.kind === "block") return { label: `${preset.startId}–${preset.endId}`, hint: "100語" };
  return { label: "カスタム", hint: `${preset.startId}–${preset.endId}` };
}

function labelForPreset(preset: RangePreset): string {
  if (preset.kind === "full") return "全体（1–2300）";
  if (preset.kind === "part") {
    const pr = PART_RANGES[preset.part];
    return `${preset.part === "alpha" ? "+α" : `Part${preset.part}`}（${pr.start}–${pr.end}）`;
  }
  if (preset.kind === "block") return `100単位（${preset.startId}–${preset.endId}）`;
  return `カスタム（${preset.startId}–${preset.endId}）`;
}

export function RangeSelectScreen({ onBack, onTest, onCards, onWordList }: Props) {
  const { getEntry } = useLearning();
  const tiles = useMemo(() => getRangeTileList(), []);

  const tileStats = useMemo(() => {
    const map = new Map<string, ReturnType<typeof aggregateProgress>>();
    for (const t of tiles) {
      const preset: RangePreset =
        t.type === "custom"
          ? { kind: "custom", startId: 1, endId: 100 }
          : t.preset;
      const { start, end } = presetToIdRange(preset);
      const words = wordsInRange(WORDS, start, end);
      map.set(t.id, aggregateProgress(words, getEntry));
    }
    return map;
  }, [tiles, getEntry]);

  const [activeTile, setActiveTile] = useState<RangeTileDef | null>(null);
  const [customStart, setCustomStart] = useState(1);
  const [customEnd, setCustomEnd] = useState(100);
  const [testMode, setTestMode] = useState<TestQuestionMode>("ja-en-mcq");
  const [strategy, setStrategy] = useState<SelectionStrategy>("priority");
  const [cardRandom, setCardRandom] = useState(true);

  const modalPreset: RangePreset | null = useMemo(() => {
    if (!activeTile) return null;
    if (activeTile.type === "custom") {
      const a = Math.max(1, Math.min(2300, customStart));
      const b = Math.max(1, Math.min(2300, customEnd));
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      return { kind: "custom", startId: start, endId: end };
    }
    return activeTile.preset;
  }, [activeTile, customStart, customEnd]);

  const modalWords = useMemo(() => {
    if (!modalPreset) return [];
    const { start, end } = presetToIdRange(modalPreset);
    return wordsInRange(WORDS, start, end);
  }, [modalPreset]);

  const modalStats = useMemo(
    () => aggregateProgress(modalWords, getEntry),
    [modalWords, getEntry],
  );

  const closeModal = useCallback(() => setActiveTile(null), []);

  useEffect(() => {
    if (!activeTile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTile, closeModal]);

  const openTile = useCallback((t: RangeTileDef) => {
    setActiveTile(t);
    setTestMode("ja-en-mcq");
    setStrategy("priority");
    setCardRandom(true);
    if (t.type === "custom") {
      setCustomStart(1);
      setCustomEnd(100);
    }
  }, []);

  return (
    <div className="page home-app range-select-page">
      <nav className="ios-navbar">
        <div className="ios-navbar__left">
          <button type="button" className="ios-back-button" onClick={onBack}>
            <span className="ios-back-button__icon">‹</span>
            ホーム
          </button>
        </div>
        <div className="ios-navbar__center">
          <h1 className="ios-navbar-title">学習範囲の選択</h1>
        </div>
      </nav>

      <ul className="tile-list" role="list">
        {tiles.map((t) => {
          const st = tileStats.get(t.id);
          return (
            <li key={t.id} className="tile-row tile-row-wrap">
              <button
                type="button"
                className="tile-list-btn"
                onClick={() => {
                  const p: RangePreset = t.type === "custom" ? { kind: "custom", startId: 1, endId: 100 } : t.preset;
                  onWordList(p);
                }}
                title="単語レベル一覧を表示"
              >
                📋
              </button>
              <button
                type="button"
                className="range-tile range-tile--rich"
                onClick={() => openTile(t)}
              >
                <div className="range-tile-row">
                  <div className="range-tile-main">
                    <span className="range-tile-title">{t.label}</span>
                    <span className="range-tile-hint">{t.hint}</span>
                  </div>
                  <span className="range-tile-chev" aria-hidden>
                    ›
                  </span>
                </div>
                {st && <TileProgressFoot stats={st} />}
              </button>
            </li>
          );
        })}
      </ul>

      {activeTile && modalPreset && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="modal-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2 id="modal-title" className="modal-title">
                {activeTile.type === "custom"
                  ? "カスタム範囲"
                  : tileMeta(modalPreset).label}
              </h2>
              <button type="button" className="modal-close" onClick={closeModal} aria-label="閉じる">
                ×
              </button>
            </div>

            <p className="modal-sub muted">
              {labelForPreset(modalPreset)} ・ {modalWords.length} 語
            </p>

            <div className="modal-prog-block">
              <TileProgressFoot stats={modalStats} />
              <div className="modal-stats">
                <span>Lv均 {modalStats.count ? modalStats.avgLevel.toFixed(2) : "—"}</span>
                <span>未習 {modalStats.unlearned}</span>
                <span>苦手 {modalStats.weak}</span>
              </div>
            </div>

            {activeTile.type === "custom" && (
              <div className="modal-custom row gap">
                <div className="field grow">
                  <label>開始 ID</label>
                  <input
                    type="number"
                    min={1}
                    max={2300}
                    value={customStart}
                    onChange={(e) => setCustomStart(Number(e.target.value))}
                  />
                </div>
                <div className="field grow">
                  <label>終了 ID</label>
                  <input
                    type="number"
                    min={1}
                    max={2300}
                    value={customEnd}
                    onChange={(e) => setCustomEnd(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            <p className="modal-section-label">出題形式</p>
            <div className="ios-list">
              {(
                [
                  ["ja-en-mcq", "4択 (日→英)"],
                  ["en-ja-mcq", "4択 (英→日)"],
                  ["ja-en-input", "入力 (日→英)"],
                ] as const
              ).map(([v, lab]) => (
                <button
                  key={v}
                  type="button"
                  className="ios-list-item"
                  onClick={() => setTestMode(v)}
                >
                  <span className="ios-list-label">{lab}</span>
                  {testMode === v && <span className="ios-list-check">✓</span>}
                </button>
              ))}
            </div>

            <p className="modal-section-label">出題ロジック</p>
            <div className="ios-list">
              <button
                type="button"
                className="ios-list-item"
                onClick={() => setStrategy("priority")}
              >
                <span className="ios-list-label">優先度順</span>
                {strategy === "priority" && <span className="ios-list-check">✓</span>}
              </button>
              <button
                type="button"
                className="ios-list-item"
                onClick={() => setStrategy("random")}
              >
                <span className="ios-list-label">ランダム</span>
                {strategy === "random" && <span className="ios-list-check">✓</span>}
              </button>
            </div>

            <p className="modal-section-label">オプション</p>
            <div className="ios-list">
              <button
                type="button"
                className="ios-list-item"
                onClick={() => setCardRandom(!cardRandom)}
              >
                <span className="ios-list-label">カードをランダム順で表示</span>
                <div className={`ios-toggle ${cardRandom ? 'on' : ''}`}>
                  <div className="ios-toggle-knob" />
                </div>
              </button>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn primary modal-primary"
                disabled={modalWords.length === 0}
                onClick={() => {
                  onTest({ preset: modalPreset, testMode, strategy });
                  closeModal();
                }}
              >
                テスト（20問）
              </button>
              <button
                type="button"
                className="btn modal-secondary"
                disabled={modalWords.length === 0}
                onClick={() => {
                  onCards({ preset: modalPreset, randomOrder: cardRandom });
                  closeModal();
                }}
              >
                単語カード
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
