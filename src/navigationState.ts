import type { HomeLaunchCards, HomeLaunchTest } from "./sessionLaunch";
import type { TestResultItem } from "./types";

export type TestRouteState = { launch: HomeLaunchTest };
export type ResultsRouteState = { results: TestResultItem[]; launch: HomeLaunchTest };
export type CardsRouteState = { launch: HomeLaunchCards };
