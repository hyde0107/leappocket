import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { LearningProvider } from "./LearningContext";
import { recordPracticeToday } from "./streakStorage";
import { HomeDashboard } from "./components/HomeDashboard";
import { RangeSelectScreen } from "./components/RangeSelectScreen";
import { TestScreen } from "./components/TestScreen";
import { ResultScreen } from "./components/ResultScreen";
import { CardView } from "./components/CardView";
import type { CardsRouteState, ResultsRouteState, TestRouteState } from "./navigationState";

/** 1画面＝1レイヤー */
function Screen({ children }: { children: React.ReactNode }) {
  return <div className="screen-layer">{children}</div>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function HomePage() {
  return (
    <Screen>
      <HomeDashboard />
    </Screen>
  );
}

function RangeSelectPage() {
  const navigate = useNavigate();
  return (
    <Screen>
      <RangeSelectScreen
        onBack={() => navigate("/", { replace: true })}
        onTest={(p) =>
          navigate("/test", { state: { launch: p } satisfies TestRouteState })
        }
        onCards={(p) =>
          navigate("/cards", { state: { launch: p } satisfies CardsRouteState })
        }
      />
    </Screen>
  );
}

function TestPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const launch = (state as Partial<TestRouteState> | null)?.launch;

  if (!launch) {
    return <Navigate to="/" replace />;
  }

  return (
    <Screen>
      <TestScreen
        launch={launch}
        onFinish={(r) => {
          recordPracticeToday();
          navigate("/results", {
            state: { results: r, launch } satisfies ResultsRouteState,
            replace: true,
          });
        }}
        onCancel={() => navigate("/ranges", { replace: true })}
      />
    </Screen>
  );
}

function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const stateInfo = state as Partial<ResultsRouteState> | null;
  const results = stateInfo?.results;
  const launch = stateInfo?.launch;

  if (results === undefined || !launch) {
    return <Navigate to="/" replace />;
  }

  return (
    <Screen>
      <ResultScreen
        results={results}
        onHome={() => navigate("/", { replace: true })}
        onRetry={() =>
          navigate("/test", {
            state: { launch } satisfies TestRouteState,
            replace: true,
          })
        }
      />
    </Screen>
  );
}

function CardsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const launch = (state as Partial<CardsRouteState> | null)?.launch;

  if (!launch) {
    return <Navigate to="/" replace />;
  }

  return (
    <Screen>
      <CardView launch={launch} onExit={() => navigate("/ranges", { replace: true })} />
    </Screen>
  );
}

export default function App() {
  return (
    <LearningProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ranges" element={<RangeSelectPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LearningProvider>
  );
}
