const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PhysicalTracker({ physicalTracker, updateState }) {
  const toggleDay = (weekNum, day) => {
    updateState((prev) => ({
      ...prev,
      physicalTracker: prev.physicalTracker.map((w) =>
        w.week === weekNum
          ? { ...w, days: { ...w.days, [day]: { completed: !w.days[day].completed } } }
          : w
      ),
    }));
  };

  return (
    <div className="panel">
      <h2>Physical Tracker</h2>
      <p className="subtitle">Print-style week grid — tick each day after completing minimum target</p>
      <div className="table-wrap">
        <table className="physical-table">
          <thead>
            <tr>
              <th>Week</th>
              {DAYS.map((d, i) => (
                <th key={d} title={d}>{DAY_SHORT[i]}</th>
              ))}
              <th>Weekly Focus</th>
            </tr>
          </thead>
          <tbody>
            {physicalTracker.map((w) => (
              <tr key={w.week}>
                <td className="num">W{w.week}</td>
                {DAYS.map((day) => (
                  <td key={day} className="tick-cell">
                    <label>
                      <input
                        type="checkbox"
                        checked={!!w.days[day]?.completed}
                        onChange={() => toggleDay(w.week, day)}
                      />
                      <span>{w.days[day]?.completed ? "✓" : "☐"}</span>
                    </label>
                  </td>
                ))}
                <td>{w.weeklyFocus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
