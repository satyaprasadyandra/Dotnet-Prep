import { useMemo, useState } from "react";
import { STATUS_OPTIONS } from "../api";

export function TopicMaster({ topicMaster, updateState }) {
  const [filter, setFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const subjects = useMemo(
    () => ["All", ...new Set(topicMaster.map((t) => t.subject))],
    [topicMaster]
  );

  const filtered = topicMaster.filter((t) => {
    const matchSubject = subjectFilter === "All" || t.subject === subjectFilter;
    const q = filter.toLowerCase();
    const matchText = !q || t.topic.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
    return matchSubject && matchText;
  });

  const updateTopic = (id, field, value) => {
    updateState((prev) => ({
      ...prev,
      topicMaster: prev.topicMaster.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    }));
  };

  return (
    <div className="panel">
      <h2>Topic Master</h2>
      <p className="subtitle">{topicMaster.length} topics across all subjects</p>

      <div className="filters">
        <input
          type="search"
          placeholder="Search topics..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Topic</th>
              <th>Day</th>
              <th>Week</th>
              <th>Phase</th>
              <th>Practice</th>
              <th>Status</th>
              <th>Practice Done</th>
              <th>Completed Day</th>
              <th>Q&A</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className={t.status === "Completed" ? "row-done" : ""}>
                <td className="num">{t.id}</td>
                <td>{t.subject}</td>
                <td>{t.topic}</td>
                <td>D{t.plannedDay}</td>
                <td>W{t.week}</td>
                <td className="phase">{t.phase}</td>
                <td className="cell-sub">{t.practiceRequirement}</td>
                <td>
                  <select
                    value={t.status}
                    onChange={(e) => {
                      const status = e.target.value;
                      updateState((prev) => ({
                        ...prev,
                        topicMaster: prev.topicMaster.map((item) =>
                          item.id === t.id
                            ? {
                                ...item,
                                status,
                                completedDay:
                                  status === "Completed" && !item.completedDay
                                    ? item.plannedDay
                                    : item.completedDay,
                              }
                            : item
                        ),
                      }));
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!t.practiceCompleted}
                    title="Coding/practice completed"
                    onChange={(e) => updateTopic(t.id, "practiceCompleted", e.target.checked)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    max={182}
                    value={t.completedDay ?? ""}
                    placeholder="—"
                    onChange={(e) =>
                      updateTopic(t.id, "completedDay", e.target.value ? Number(e.target.value) : null)
                    }
                  />
                </td>
                <td className="num">{(t.interviewQA || []).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
