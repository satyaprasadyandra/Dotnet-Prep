export function Dashboard({ startHere, dailyTracker, topicMaster }) {
  const completedDays = dailyTracker.filter((d) => d.status === "Completed").length;
  const completedTopics = topicMaster.filter((t) => t.status === "Completed").length;
  const inProgressDays = dailyTracker.filter((d) => d.status === "In Progress").length;

  return (
    <div className="panel">
      <h2>182-Day Master Plan</h2>
      <p className="subtitle">Product Company .NET Interview Preparation</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{completedDays}</span>
          <span className="stat-label">Days Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{inProgressDays}</span>
          <span className="stat-label">Days In Progress</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{completedTopics}</span>
          <span className="stat-label">Topics Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{topicMaster.length}</span>
          <span className="stat-label">Total Topics</span>
        </div>
      </div>

      <div className="info-grid">
        {Object.entries(startHere || {}).map(([key, value]) => (
          <div key={key} className="info-row">
            <strong>{key}</strong>
            <span>{value}</span>
          </div>
        ))}
      </div>

      <div className="how-to">
        <h3>How to use this app</h3>
        <ol>
          <li>Use <strong>Daily Tracker</strong> to mark each day&apos;s status, checklist, and notes.</li>
          <li>Use <strong>Topic Master</strong> to track all 284 topics individually.</li>
          <li>Use <strong>Weekly Plan</strong> and <strong>Physical Tracker</strong> for week-level check-offs.</li>
          <li><strong>Subject Progress</strong> updates automatically from your topic completions.</li>
          <li>All changes are saved automatically — close and reopen anytime.</li>
        </ol>
      </div>
    </div>
  );
}
