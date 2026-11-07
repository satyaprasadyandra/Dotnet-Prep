import { useState } from "react";
import { useTrackerState } from "./useTrackerState";
import { Dashboard } from "./components/Dashboard";
import { DailyTracker } from "./components/DailyTracker";
import { TopicMaster } from "./components/TopicMaster";
import { WeeklyPlan } from "./components/WeeklyPlan";
import { PhysicalTracker } from "./components/PhysicalTracker";
import { SubjectProgress } from "./components/SubjectProgress";
import { CourseMap } from "./components/CourseMap";
import { Milestones } from "./components/Milestones";
import "./App.css";

const TABS = [
  { id: "dashboard", label: "Start Here" },
  { id: "daily", label: "Daily Tracker" },
  { id: "topics", label: "Topic Master" },
  { id: "weekly", label: "Weekly Plan" },
  { id: "physical", label: "Physical Tracker" },
  { id: "subjects", label: "Subject Progress" },
  { id: "courses", label: "Course Map" },
  { id: "milestones", label: "Milestones" },
];

function App() {
  const [tab, setTab] = useState("dashboard");
  const { state, loading, error, saving, lastSaved, updateState } = useTrackerState();

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loader" />
        <p>Loading your interview tracker...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="app error-screen">
        <h1>Could not load tracker</h1>
        <p>{error || "Unknown error"}</p>
        <p>Make sure the server is running. Double-click the desktop shortcut or run <code>npm start</code>.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">.NET</div>
          <div>
            <h1>Interview Tracker</h1>
            <p>182-Day Product Company Plan</p>
          </div>
        </div>
        <div className="save-status">
          {saving ? "Saving..." : lastSaved ? `Saved ${new Date(lastSaved).toLocaleString()}` : "Ready"}
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === "dashboard" && (
          <Dashboard
            startHere={state.startHere}
            dailyTracker={state.dailyTracker}
            topicMaster={state.topicMaster}
          />
        )}
        {tab === "daily" && <DailyTracker dailyTracker={state.dailyTracker} updateState={updateState} />}
        {tab === "topics" && <TopicMaster topicMaster={state.topicMaster} updateState={updateState} />}
        {tab === "weekly" && <WeeklyPlan weeklyPlan={state.weeklyPlan} updateState={updateState} />}
        {tab === "physical" && <PhysicalTracker physicalTracker={state.physicalTracker} updateState={updateState} />}
        {tab === "subjects" && (
          <SubjectProgress
            subjectProgress={state.subjectProgress}
            topicMaster={state.topicMaster}
            updateState={updateState}
          />
        )}
        {tab === "courses" && <CourseMap courseMap={state.courseMap} updateState={updateState} />}
        {tab === "milestones" && <Milestones milestones={state.milestones} updateState={updateState} />}
      </main>
    </div>
  );
}

export default App;
