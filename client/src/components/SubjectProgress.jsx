import { useMemo, useState } from "react";
import { STATUS_OPTIONS } from "../api";

function statusClass(status) {
  if (status === "Completed") return "status-badge done";
  if (status === "In Progress") return "status-badge wip";
  return "status-badge pending";
}

function computeTopicCoverage(topic) {
  const statusScore =
    topic.status === "Completed" ? 100 : topic.status === "In Progress" ? 50 : 0;
  const practiceScore = topic.practiceCompleted ? 100 : 0;
  const qaList = topic.interviewQA || [];
  let qaScore = 0;
  if (qaList.length > 0) {
    const filled = qaList.filter((q) => q.question?.trim() && q.answer?.trim()).length;
    qaScore = Math.round((filled / qaList.length) * 100);
  }
  const overall =
    qaList.length > 0
      ? Math.round((statusScore + practiceScore + qaScore) / 3)
      : Math.round((statusScore + practiceScore) / 2);
  return { overall, statusScore, practiceScore, qaScore, qaCount: qaList.length };
}

function coverageClass(pct) {
  if (pct >= 100) return "coverage-full";
  if (pct >= 50) return "coverage-mid";
  if (pct > 0) return "coverage-low";
  return "coverage-none";
}

function SubjectSection({ subject, topicMaster, updateState, isOpen, onToggle }) {
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  const topics = useMemo(
    () =>
      topicMaster
        .filter((t) => t.subject === subject.subject)
        .sort((a, b) => a.plannedDay - b.plannedDay),
    [topicMaster, subject.subject]
  );

  const topicsWithCoverage = useMemo(
    () => topics.map((t) => ({ ...t, coverage: computeTopicCoverage(t) })),
    [topics]
  );

  const subjectCoverage = useMemo(() => {
    if (!topicsWithCoverage.length) return 0;
    const sum = topicsWithCoverage.reduce((n, t) => n + t.coverage.overall, 0);
    return Math.round(sum / topicsWithCoverage.length);
  }, [topicsWithCoverage]);

  const expandAllTopics = (e) => {
    e.stopPropagation();
    setExpandedTopics(new Set(topics.map((t) => t.id)));
  };

  const collapseAllTopics = (e) => {
    e.stopPropagation();
    setExpandedTopics(new Set());
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const patchTopic = (id, patch) => {
    updateState((prev) => ({
      ...prev,
      topicMaster: prev.topicMaster.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  };

  const addQA = (topicId) => {
    updateState((prev) => ({
      ...prev,
      topicMaster: prev.topicMaster.map((t) =>
        t.id === topicId
          ? {
              ...t,
              interviewQA: [
                ...(t.interviewQA || []),
                { id: crypto.randomUUID(), question: "", answer: "" },
              ],
            }
          : t
      ),
    }));
    setExpandedTopics((prev) => new Set(prev).add(topicId));
  };

  const updateQA = (topicId, qaId, field, value) => {
    updateState((prev) => ({
      ...prev,
      topicMaster: prev.topicMaster.map((t) =>
        t.id === topicId
          ? {
              ...t,
              interviewQA: (t.interviewQA || []).map((qa) =>
                qa.id === qaId ? { ...qa, [field]: value } : qa
              ),
            }
          : t
      ),
    }));
  };

  const deleteQA = (topicId, qaId) => {
    updateState((prev) => ({
      ...prev,
      topicMaster: prev.topicMaster.map((t) =>
        t.id === topicId
          ? { ...t, interviewQA: (t.interviewQA || []).filter((qa) => qa.id !== qaId) }
          : t
      ),
    }));
  };

  return (
    <div className={`subject-section ${isOpen ? "subject-open" : ""}`}>
      <button type="button" className="subject-section-header" onClick={onToggle}>
        <div className="subject-section-title">
          <span className="chevron">{isOpen ? "▼" : "▶"}</span>
          <h3>{subject.subject}</h3>
          <span className="topic-count-badge">{subject.totalTopics} topics</span>
          <span className={`coverage-pill ${coverageClass(subjectCoverage)}`}>
            {subjectCoverage}% coverage
          </span>
        </div>
        <div className="subject-section-metrics">
          <span className="metric done">{subject.completed} done</span>
          <span className="metric wip">{subject.inProgress} in progress</span>
          <span className="metric">{subject.pending} pending</span>
          <span className="metric practice">
            {subject.practiceCompleted}/{subject.totalTopics} practice
          </span>
          <span className="pct">{subject.percentComplete}%</span>
        </div>
      </button>

      {isOpen && (
        <div className="subject-section-body">
          <div className="subject-toolbar">
            <span className="toolbar-label">
              {topics.length} topics · avg {subjectCoverage}% coverage
            </span>
            <div className="toolbar-actions">
              <button type="button" className="btn-toolbar" onClick={expandAllTopics}>
                Expand all topics
              </button>
              <button
                type="button"
                className="btn-toolbar"
                onClick={collapseAllTopics}
                disabled={expandedTopics.size === 0}
              >
                Collapse all topics
              </button>
            </div>
          </div>

          <div className="subject-dual-bars">
            <div>
              <div className="bar-label">Topic completion ({subject.percentComplete}%)</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${subject.percentComplete}%` }} />
              </div>
            </div>
            <div>
              <div className="bar-label">Coding / practice ({subject.practicePercent}%)</div>
              <div className="progress-bar practice-bar">
                <div
                  className="progress-fill practice-fill"
                  style={{ width: `${subject.practicePercent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="bar-label">Overall coverage ({subjectCoverage}%)</div>
              <div className="progress-bar coverage-bar">
                <div
                  className={`progress-fill coverage-fill ${coverageClass(subjectCoverage)}`}
                  style={{ width: `${subjectCoverage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="topic-track-list">
            {topicsWithCoverage.map((t) => {
              const isExpanded = expandedTopics.has(t.id);
              const qaList = t.interviewQA || [];
              const { overall, statusScore, practiceScore, qaScore, qaCount } = t.coverage;
              return (
                <div
                  key={t.id}
                  className={`topic-track-item ${t.status === "Completed" ? "topic-done" : ""}`}
                >
                  <div className="topic-track-row">
                    <button
                      type="button"
                      className="topic-expand-btn"
                      onClick={() => toggleTopic(t.id)}
                      title={isExpanded ? "Collapse topic details" : "Expand topic details"}
                    >
                      {isExpanded ? "−" : "+"}
                    </button>
                    <div className="topic-track-info">
                      <div className="topic-track-name">
                        <span className="num">D{t.plannedDay}</span> {t.topic}
                      </div>
                      <div className="topic-track-practice">{t.practiceRequirement}</div>
                      <div className="topic-coverage-inline">
                        <div className="topic-coverage-bar">
                          <div
                            className={`progress-fill coverage-fill ${coverageClass(overall)}`}
                            style={{ width: `${overall}%` }}
                          />
                        </div>
                        <span className={`coverage-pill small ${coverageClass(overall)}`}>
                          {overall}%
                        </span>
                      </div>
                    </div>
                    <span className={statusClass(t.status)}>{t.status}</span>
                    <label className="practice-check" title="Mark coding/practice as completed">
                      <input
                        type="checkbox"
                        checked={!!t.practiceCompleted}
                        onChange={(e) => patchTopic(t.id, { practiceCompleted: e.target.checked })}
                      />
                      Practice done
                    </label>
                    <select
                      className="topic-status-select"
                      value={t.status}
                      onChange={(e) => {
                        const status = e.target.value;
                        patchTopic(t.id, {
                          status,
                          completedDay:
                            status === "Completed" && !t.completedDay ? t.plannedDay : t.completedDay,
                        });
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {qaList.length > 0 && (
                      <span className="qa-count-badge">{qaList.length} Q&A</span>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="topic-detail-panel">
                      <div className="topic-coverage-breakdown">
                        <h4>Topic coverage breakdown</h4>
                        <div className="coverage-breakdown-grid">
                          <div className="coverage-breakdown-item">
                            <span className="breakdown-label">Status</span>
                            <div className="progress-bar mini">
                              <div
                                className="progress-fill"
                                style={{ width: `${statusScore}%` }}
                              />
                            </div>
                            <span className="breakdown-pct">{statusScore}%</span>
                          </div>
                          <div className="coverage-breakdown-item">
                            <span className="breakdown-label">Practice</span>
                            <div className="progress-bar mini practice-bar">
                              <div
                                className="progress-fill practice-fill"
                                style={{ width: `${practiceScore}%` }}
                              />
                            </div>
                            <span className="breakdown-pct">{practiceScore}%</span>
                          </div>
                          <div className="coverage-breakdown-item">
                            <span className="breakdown-label">
                              Q&A {qaCount > 0 ? `(${qaCount})` : ""}
                            </span>
                            <div className="progress-bar mini qa-bar">
                              <div
                                className="progress-fill qa-fill"
                                style={{ width: `${qaScore}%` }}
                              />
                            </div>
                            <span className="breakdown-pct">{qaCount > 0 ? `${qaScore}%` : "—"}</span>
                          </div>
                          <div className="coverage-breakdown-item overall-item">
                            <span className="breakdown-label">Overall</span>
                            <div className="progress-bar mini coverage-bar">
                              <div
                                className={`progress-fill coverage-fill ${coverageClass(overall)}`}
                                style={{ width: `${overall}%` }}
                              />
                            </div>
                            <span className={`breakdown-pct strong ${coverageClass(overall)}`}>
                              {overall}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="topic-qa-panel">
                        <div className="topic-qa-header">
                          <h4>Interview Questions & Answers</h4>
                          <button type="button" className="btn-add-qa" onClick={() => addQA(t.id)}>
                            + Add Q&A
                          </button>
                        </div>
                        {qaList.length === 0 ? (
                          <p className="qa-empty">
                            No Q&A yet. Click &quot;Add Q&A&quot; to record interview questions for
                            this topic.
                          </p>
                        ) : (
                          <div className="qa-cards">
                            {qaList.map((qa, idx) => (
                              <div key={qa.id} className="qa-card">
                                <div className="qa-card-header">
                                  <span className="qa-num">Q{idx + 1}</span>
                                  <button
                                    type="button"
                                    className="btn-delete-qa"
                                    onClick={() => deleteQA(t.id, qa.id)}
                                  >
                                    Remove
                                  </button>
                                </div>
                                <label>
                                  Question
                                  <textarea
                                    rows={2}
                                    value={qa.question}
                                    placeholder="e.g. Explain value types vs reference types..."
                                    onChange={(e) => updateQA(t.id, qa.id, "question", e.target.value)}
                                  />
                                </label>
                                <label>
                                  Answer
                                  <textarea
                                    rows={4}
                                    value={qa.answer}
                                    placeholder="Write your answer in your own words..."
                                    onChange={(e) => updateQA(t.id, qa.id, "answer", e.target.value)}
                                  />
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function SubjectProgress({ subjectProgress, topicMaster, updateState }) {
  const [openSubjects, setOpenSubjects] = useState(() => new Set());

  const totals = useMemo(() => {
    const all = subjectProgress || [];
    return {
      subjects: all.length,
      topics: all.reduce((n, s) => n + s.totalTopics, 0),
      completed: all.reduce((n, s) => n + s.completed, 0),
      pending: all.reduce((n, s) => n + s.pending, 0),
      practiceDone: all.reduce((n, s) => n + s.practiceCompleted, 0),
    };
  }, [subjectProgress]);

  const toggleSubject = (subjectName) => {
    setOpenSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectName)) next.delete(subjectName);
      else next.add(subjectName);
      return next;
    });
  };

  const expandAllSubjects = () => {
    setOpenSubjects(new Set((subjectProgress || []).map((s) => s.subject)));
  };

  const collapseAllSubjects = () => {
    setOpenSubjects(new Set());
  };

  return (
    <div className="panel">
      <h2>Subject Progress</h2>
      <p className="subtitle">
        Click a subject to expand all its topics with percentage-wise coverage per topic
      </p>

      <div className="stats-grid subject-summary-grid">
        <div className="stat-card">
          <span className="stat-value">{totals.subjects}</span>
          <span className="stat-label">Subjects</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totals.topics}</span>
          <span className="stat-label">Total Topics</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totals.completed}</span>
          <span className="stat-label">Topics Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totals.pending}</span>
          <span className="stat-label">Topics Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totals.practiceDone}</span>
          <span className="stat-label">Practice Done</span>
        </div>
      </div>

      <div className="progress-cards compact-summary">
        {(subjectProgress || []).map((s) => (
          <div
            key={s.subject}
            className="progress-card mini-card clickable-card"
            role="button"
            tabIndex={0}
            onClick={() => toggleSubject(s.subject)}
            onKeyDown={(e) => e.key === "Enter" && toggleSubject(s.subject)}
          >
            <div className="progress-header">
              <h3>{s.subject}</h3>
              <span className="topic-count-inline">{s.totalTopics} topics</span>
            </div>
            <div className="mini-stats">
              <span className="done">{s.completed} completed</span>
              <span>{s.pending} pending</span>
              <span className="practice">{s.practiceCompleted} practice done</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${s.percentComplete}%` }} />
            </div>
            <div className="progress-range">Days {s.firstPlannedDay} – {s.lastPlannedDay}</div>
          </div>
        ))}
      </div>

      <div className="section-toolbar">
        <h3 className="section-divider">Topic-wise tracking by subject</h3>
        <div className="toolbar-actions">
          <button type="button" className="btn-toolbar" onClick={expandAllSubjects}>
            Expand all subjects
          </button>
          <button
            type="button"
            className="btn-toolbar"
            onClick={collapseAllSubjects}
            disabled={openSubjects.size === 0}
          >
            Collapse all subjects
          </button>
        </div>
      </div>
      <p className="subtitle section-hint">
        Each topic shows overall coverage % (status + practice + Q&A). Use Expand/Collapse all inside
        a subject for topic details.
      </p>

      <div className="subject-sections">
        {(subjectProgress || []).map((s) => (
          <SubjectSection
            key={s.subject}
            subject={s}
            topicMaster={topicMaster}
            updateState={updateState}
            isOpen={openSubjects.has(s.subject)}
            onToggle={() => toggleSubject(s.subject)}
          />
        ))}
      </div>
    </div>
  );
}
