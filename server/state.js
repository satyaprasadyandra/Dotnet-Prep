const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const SEED_PATH = path.join(DATA_DIR, "seed.json");
const STATE_PATH = path.join(DATA_DIR, "tracker-state.json");

function readJson(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function deepMerge(base, patch) {
  if (Array.isArray(patch)) return patch;
  if (patch && typeof patch === "object" && base && typeof base === "object" && !Array.isArray(base)) {
    const out = { ...base };
    for (const key of Object.keys(patch)) {
      out[key] = deepMerge(base[key], patch[key]);
    }
    return out;
  }
  return patch !== undefined ? patch : base;
}

function normalizeTopic(topic) {
  return {
    ...topic,
    practiceCompleted: !!topic.practiceCompleted,
    interviewQA: Array.isArray(topic.interviewQA) ? topic.interviewQA : [],
  };
}

function normalizeTopics(topics) {
  return (topics || []).map(normalizeTopic);
}

function computeSubjectProgress(topicMaster) {
  const bySubject = {};
  for (const t of topicMaster) {
    if (!bySubject[t.subject]) {
      bySubject[t.subject] = {
        subject: t.subject,
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        practiceCompleted: 0,
        practicePending: 0,
        days: [],
        topics: [],
      };
    }
    const s = bySubject[t.subject];
    s.total += 1;
    s.days.push(t.plannedDay);
    s.topics.push({
      id: t.id,
      topic: t.topic,
      status: t.status,
      plannedDay: t.plannedDay,
      practiceRequirement: t.practiceRequirement,
      practiceCompleted: !!t.practiceCompleted,
      qaCount: (t.interviewQA || []).length,
    });
    if (t.status === "Completed") s.completed += 1;
    else if (t.status === "In Progress") s.inProgress += 1;
    else s.pending += 1;
    if (t.practiceCompleted) s.practiceCompleted += 1;
    else s.practicePending += 1;
  }
  return Object.values(bySubject)
    .map((s) => ({
      subject: s.subject,
      totalTopics: s.total,
      completed: s.completed,
      inProgress: s.inProgress,
      pending: s.pending,
      practiceCompleted: s.practiceCompleted,
      practicePending: s.practicePending,
      percentComplete: s.total ? Math.round((s.completed / s.total) * 100) : 0,
      practicePercent: s.total ? Math.round((s.practiceCompleted / s.total) * 100) : 0,
      firstPlannedDay: Math.min(...s.days),
      lastPlannedDay: Math.max(...s.days),
      topics: s.topics.sort((a, b) => a.plannedDay - b.plannedDay),
    }))
    .sort((a, b) => a.firstPlannedDay - b.firstPlannedDay);
}

const DEFAULT_HOME_SHORTCUTS = [
  {
    id: "udemy",
    label: "Udemy",
    url: "https://www.udemy.com/home/my-courses/",
    color: "#A435F0",
  },
  {
    id: "dsa",
    label: "DSA",
    url: "https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet",
    color: "#2563eb",
  },
  {
    id: "sql",
    label: "SQL",
    url: "https://sqlbolt.com/lesson/introduction",
    color: "#0ea5e9",
  },
];

function normalizeHomeShortcuts(list) {
  if (!Array.isArray(list) || list.length === 0) return DEFAULT_HOME_SHORTCUTS;
  return list
    .filter((item) => item && item.label && item.url)
    .map((item) => ({
      id: item.id || randomUUID(),
      label: String(item.label).trim(),
      url: String(item.url).trim(),
      color: item.color || "#512bd4",
    }));
}

function loadState() {
  const seed = readJson(SEED_PATH, {});
  const saved = readJson(STATE_PATH, {});
  const merged = deepMerge(seed, saved);
  merged.topicMaster = normalizeTopics(merged.topicMaster);
  merged.subjectProgress = computeSubjectProgress(merged.topicMaster || []);
  merged.homeShortcuts = normalizeHomeShortcuts(
    saved.homeShortcuts || seed.homeShortcuts
  );
  merged.lastSaved = saved.lastSaved || null;
  return merged;
}

function saveState(state) {
  const payload = {
    dailyTracker: state.dailyTracker,
    topicMaster: normalizeTopics(state.topicMaster),
    weeklyPlan: state.weeklyPlan,
    physicalTracker: state.physicalTracker,
    courseMap: state.courseMap,
    milestones: state.milestones,
    homeShortcuts: normalizeHomeShortcuts(state.homeShortcuts),
    lastSaved: new Date().toISOString(),
  };
  writeJson(STATE_PATH, payload);
  return payload.lastSaved;
}

module.exports = { loadState, saveState, SEED_PATH, STATE_PATH, computeSubjectProgress };
