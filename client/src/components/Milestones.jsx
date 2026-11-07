import { STATUS_OPTIONS } from "../api";

export function Milestones({ milestones, updateState }) {
  const update = (index, field, value) => {
    updateState((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));
  };

  return (
    <div className="panel">
      <h2>Interview Milestones</h2>
      <p className="subtitle">Key checkpoints on your path to interview-ready</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Target Day</th>
              <th>Required Capability</th>
              <th>Practice</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m, i) => (
              <tr key={m.milestone} className={m.status === "Completed" ? "row-done" : ""}>
                <td><strong>{m.milestone}</strong></td>
                <td className="num">D{m.targetDay}</td>
                <td>{m.requiredCapability}</td>
                <td>{m.practice}</td>
                <td>
                  <select value={m.status} onChange={(e) => update(i, "status", e.target.value)}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <textarea
                    rows={2}
                    value={m.notes || ""}
                    placeholder="Notes..."
                    onChange={(e) => update(i, "notes", e.target.value)}
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
