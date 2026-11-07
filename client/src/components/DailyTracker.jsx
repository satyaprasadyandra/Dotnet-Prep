import { STATUS_OPTIONS } from "../api";

export function DailyTracker({ dailyTracker, updateState }) {
  const updateDay = (dayNum, field, value) => {
    updateState((prev) => ({
      ...prev,
      dailyTracker: prev.dailyTracker.map((d) =>
        d.day === dayNum ? { ...d, [field]: value } : d
      ),
    }));
  };

  const toggleCheck = (dayNum, field) => {
    updateState((prev) => ({
      ...prev,
      dailyTracker: prev.dailyTracker.map((d) =>
        d.day === dayNum ? { ...d, [field]: !d[field] } : d
      ),
    }));
  };

  return (
    <div className="panel">
      <h2>Daily Topic Tracker</h2>
      <p className="subtitle">182 days — status, checklist, and notes persist automatically</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Week</th>
              <th>Phase</th>
              <th>DSA</th>
              <th>Main Subject / Topic</th>
              <th>2nd Subject / Topic</th>
              <th>Checklist</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {dailyTracker.map((d) => (
              <tr key={d.day} className={d.status === "Completed" ? "row-done" : ""}>
                <td className="num">D{d.day}</td>
                <td>W{d.week}</td>
                <td className="phase">{d.phase}</td>
                <td>
                  <div className="cell-title">{d.dsaTopic}</div>
                  <div className="cell-sub">{d.dsaPractice}</div>
                </td>
                <td>
                  <div className="cell-title">{d.mainSubject}: {d.mainTopic}</div>
                  <div className="cell-sub">{d.mainPractice}</div>
                </td>
                <td>
                  <div className="cell-title">{d.secondSubject}: {d.secondTopic}</div>
                  <div className="cell-sub">{d.secondPractice}</div>
                </td>
                <td className="checklist-col">
                  <label><input type="checkbox" checked={!!d.learnDone} onChange={() => toggleCheck(d.day, "learnDone")} /> Learn</label>
                  <label><input type="checkbox" checked={!!d.practiceDone} onChange={() => toggleCheck(d.day, "practiceDone")} /> Practice</label>
                  <label><input type="checkbox" checked={!!d.reviseDone} onChange={() => toggleCheck(d.day, "reviseDone")} /> Revise</label>
                </td>
                <td>
                  <select value={d.status} onChange={(e) => updateDay(d.day, "status", e.target.value)}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <textarea
                    rows={2}
                    value={d.notes || ""}
                    placeholder="Notes..."
                    onChange={(e) => updateDay(d.day, "notes", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
