import type { RangePreset, SelectionStrategy, TestQuestionMode } from "./types";

export type HomeLaunchTest = {
  preset: RangePreset;
  testMode: TestQuestionMode;
  strategy: SelectionStrategy;
};

export type HomeLaunchCards = {
  preset: RangePreset;
  randomOrder: boolean;
};
