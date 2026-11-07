const express = require("express");
const cors = require("cors");
const path = require("path");
const { loadState, saveState } = require("./state");

const app = express();
const PORT = process.env.PORT || 3847;
const CLIENT_DIST = path.join(__dirname, "..", "client", "dist");

app.use(cors());
app.use(express.json({ limit: "4mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/state", (_req, res) => {
  res.json(loadState());
});

app.put("/api/state", (req, res) => {
  try {
    const lastSaved = saveState(req.body);
    const state = loadState();
    res.json({ ok: true, lastSaved, subjectProgress: state.subjectProgress });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use(express.static(CLIENT_DIST));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  const index = path.join(CLIENT_DIST, "index.html");
  res.sendFile(index, (err) => {
    if (err) res.status(404).send("App not built yet. Run: npm run build");
  });
});

app.listen(PORT, () => {
  console.log(`Interview Tracker running at http://localhost:${PORT}`);
});
