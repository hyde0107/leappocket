import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LearningEntry } from "./types";
import { clipLevel } from "./logic/priority";
import { getOrCreateEntry, loadLearning, saveLearning, type LearningMap } from "./storage";

type Ctx = {
  map: LearningMap;
  getEntry: (id: number) => LearningEntry | undefined;
  applyTestResult: (id: number, correct: boolean) => void;
  applyCardRemember: (id: number) => void;
  applyCardForgot: (id: number) => void;
  resetAll: () => void;
};

const LearningContext = createContext<Ctx | null>(null);

function applyLevelDelta(prev: LearningEntry, delta: number, now: number, wrong: boolean): LearningEntry {
  const next: LearningEntry = {
    ...prev,
    level: clipLevel(prev.level + delta),
    lastReviewed: now,
    wrongCount: wrong ? prev.wrongCount + 1 : prev.wrongCount,
  };
  return next;
}

export function LearningProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<LearningMap>(() => loadLearning());

  const persist = useCallback((next: LearningMap) => {
    setMap(next);
    saveLearning(next);
  }, []);

  const getEntry = useCallback(
    (id: number) => {
      return map[id];
    },
    [map],
  );

  const applyTestResult = useCallback(
    (id: number, correct: boolean) => {
      const now = Date.now();
      setMap((prev) => {
        const base = getOrCreateEntry(prev, id);
        const nextEntry = correct
          ? applyLevelDelta(base, +1, now, false)
          : applyLevelDelta(base, -1, now, true);
        const next = { ...prev, [id]: nextEntry };
        saveLearning(next);
        return next;
      });
    },
    [],
  );

  const applyCardRemember = useCallback((id: number) => {
    const now = Date.now();
    setMap((prev) => {
      const base = getOrCreateEntry(prev, id);
      const nextEntry: LearningEntry = {
        ...base,
        level: clipLevel(base.level + 1),
        lastReviewed: now,
      };
      const next = { ...prev, [id]: nextEntry };
      saveLearning(next);
      return next;
    });
  }, []);

  const applyCardForgot = useCallback((id: number) => {
    const now = Date.now();
    setMap((prev) => {
      const base = getOrCreateEntry(prev, id);
      const nextEntry: LearningEntry = {
        ...base,
        level: clipLevel(base.level - 1),
        lastReviewed: now,
      };
      const next = { ...prev, [id]: nextEntry };
      saveLearning(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    persist({});
  }, [persist]);

  const value = useMemo(
    () => ({
      map,
      getEntry,
      applyTestResult,
      applyCardRemember,
      applyCardForgot,
      resetAll,
    }),
    [map, getEntry, applyTestResult, applyCardRemember, applyCardForgot, resetAll],
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning(): Ctx {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error("useLearning must be used within LearningProvider");
  return ctx;
}
