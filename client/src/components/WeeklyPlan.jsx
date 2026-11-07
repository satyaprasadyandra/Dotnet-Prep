const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function parseCell(text) {
  if (!text) return { dayNum: "", subject: "", topic: "", practice: "", dsa: "" };
  const lines = text.replace(/^☐\s*/, "").split("\n");
  const header = lines[0] || "";
  const dayMatch = header.match(/D(\d+)/);
  const subjectMatch = header.match(/\|\s*(.+)$/);
  let topic = "";
  let practice = "";
  let dsa = "";
  for (const line of lines.slice(1)) {
    if (line.startsWith("Topic:")) topic = line.replace("Topic:", "").trim();
    else if (line.startsWith("Practice:")) practice = line.replace("Practice:", "").trim();
    else if (line.startsWith("DSA:")) dsa = line.replace("DSA:", "").trim();
  }
  return {
    dayNum: dayMatch ? dayMatch[1] : "",
    subject: subjectMatch ? subjectMatch[1].trim() : header,
    topic,
    practice,
    dsa,
  };
}

export function WeeklyPlan({ weeklyPlan, updateState }) {
  const toggleDay = (weekNum, day) => {
    updateState((prev) => ({
      ...prev,
      weeklyPlan: prev.weeklyPlan.map((w) =>
        w.week === weekNum
          ? { ...w, days: { ...w.days, [day]: { ...w.days[day], completed: !w.days[day].completed } } }
          : w
      ),
    }));
  };

  return (
    <div className="panel">
      <h2>Weekly Plan</h2>
      <p className="subtitle">Subject + topic + practice assigned to each day</p>
      <div className="weekly-grid">
        {weeklyPlan.map((w) => (
          <div key={w.week} className="week-block">
            <h3>Week {w.week}</h3>
            <div className="week-days">
              {DAYS.map((day) => {
                const cell = w.days[day];
                const parsed = parseCell(cell.text);
                return (
                  <div key={day} className={`day-card ${cell.completed ? "done" : ""}`}>
                    <div className="day-card-header">
                      <strong>{day}</strong>
                      {parsed.dayNum && <span className="badge">D{parsed.dayNum}</span>}
                      <label className="tick">
                        <input
                          type="checkbox"
                          checked={!!cell.completed}
                          onChange={() => toggleDay(w.week, day)}
                        />
                        Done
                      </label>
                    </div>
                    <div className="day-card-subject">{parsed.subject}</div>
                    {parsed.topic && <div className="day-card-topic">{parsed.topic}</div>}
                    {parsed.practice && <div className="day-card-practice">{parsed.practice}</div>}
                    {parsed.dsa && <div className="day-card-dsa">DSA: {parsed.dsa}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
