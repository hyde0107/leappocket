import type { RangePreset } from "../types";
import { hundredBlocks, PART_RANGES } from "./ranges";

export type RangeTilePreset = {
  type: "preset";
  id: string;
  preset: RangePreset;
  label: string;
  hint: string;
};

export type RangeTileCustom = {
  type: "custom";
  id: string;
  label: string;
  hint: string;
};

export type RangeTileDef = RangeTilePreset | RangeTileCustom;

export function getRangeTileList(): RangeTileDef[] {
  return [
    {
      type: "preset",
      id: "full",
      preset: { kind: "full" as const },
      label: "全体",
      hint: "1–2300語",
    },
    ...([1, 2, 3, 4] as const).map((part) => {
      const pr = PART_RANGES[part];
      return {
        type: "preset" as const,
        id: `part-${part}`,
        preset: { kind: "part" as const, part },
        label: `Part ${part}`,
        hint: `${pr.start}–${pr.end}`,
      };
    }),
    {
      type: "preset",
      id: "part-alpha",
      preset: { kind: "part" as const, part: "alpha" as const },
      label: "+α",
      hint: `${PART_RANGES.alpha.start}–${PART_RANGES.alpha.end}`,
    },
    ...hundredBlocks().map((b) => ({
      type: "preset" as const,
      id: `blk-${b.start}`,
      preset: { kind: "block" as const, startId: b.start, endId: b.end },
      label: b.label,
      hint: `${b.end - b.start + 1}語`,
    })),
    {
      type: "custom",
      id: "custom",
      label: "カスタム範囲",
      hint: "開始・終了IDを指定",
    },
  ];
}

export type PartSummaryRow = {
  id: string;
  label: string;
  preset: RangePreset;
};

export function getPartSummaryRows(): PartSummaryRow[] {
  return [
    ...([1, 2, 3, 4] as const).map((part) => ({
      id: `part-${part}`,
      label: `Part ${part}`,
      preset: { kind: "part" as const, part },
    })),
    {
      id: "alpha",
      label: "+α",
      preset: { kind: "part" as const, part: "alpha" as const },
    },
  ];
}
