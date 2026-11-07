export function CourseMap({ courseMap, updateState }) {
  const updateCourse = (index, field, value) => {
    updateState((prev) => ({
      ...prev,
      courseMap: prev.courseMap.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }));
  };

  return (
    <div className="panel">
      <h2>Course Map</h2>
      <p className="subtitle">Udemy courses — what to study and what to skip</p>
      <div className="course-cards">
        {courseMap.map((c, i) => (
          <div key={c.course} className="course-card">
            <h3>{c.course}</h3>
            <label>
              Progress
              <input
                value={c.currentProgress}
                onChange={(e) => updateCourse(i, "currentProgress", e.target.value)}
                placeholder="e.g. 29%"
              />
            </label>
            <div className="course-section">
              <strong>Use for</strong>
              <p>{c.useFor}</p>
            </div>
            <div className="course-section">
              <strong>How to use</strong>
              <p>{c.howToUse}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
