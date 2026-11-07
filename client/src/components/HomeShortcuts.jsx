import { useState } from "react";

function faviconUrl(url) {
  try {
    const host = new URL(url).hostname;
    return "https://www.google.com/s2/favicons?domain=" + host + "&sz=64";
  } catch {
    return "";
  }
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "https://" + trimmed;
}

export function HomeShortcuts({ shortcuts, updateState }) {
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState("#512bd4");
  const [error, setError] = useState("");
  const [savingShortcut, setSavingShortcut] = useState(false);

  const items = Array.isArray(shortcuts) ? shortcuts : [];

  const persist = (next) =>
    updateState((prev) => ({ ...prev, homeShortcuts: next }), {
      immediate: true,
      rollback: (current, previous) => ({
        ...(current || previous),
        homeShortcuts: items,
      }),
    });

  const addShortcut = async (e) => {
    e.preventDefault();
    const name = label.trim();
    const href = normalizeUrl(url);
    if (!name || !href) {
      setError("Enter both a name and a website URL.");
      return;
    }
    try {
      new URL(href);
    } catch {
      setError("Enter a valid URL, for example https://leetcode.com");
      return;
    }

    setSavingShortcut(true);
    setError("");
    const saved = await persist([
      ...items,
      { id: crypto.randomUUID(), label: name, url: href, color },
    ]);
    setSavingShortcut(false);
    if (!saved) {
      setError("Could not save this icon. Check that the app server is running, then try again.");
      return;
    }

    setLabel("");
    setUrl("");
    setColor("#512bd4");
    setShowForm(false);
  };

  const removeShortcut = async (id) => {
    setError("");
    const saved = await persist(items.filter((item) => item.id !== id));
    if (!saved) setError("Could not save that change. Check that the app server is running.");
  };

  return (
    <section className="home-shortcuts">
      <div className="home-shortcuts-header">
        <div>
          <h3>Quick links</h3>
          <p>Open your study sites in one click. Add more anytime.</p>
        </div>
        <button type="button" className="btn-add-qa" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add icon"}
        </button>
      </div>

      <div className="shortcut-grid">
        {items.map((item) => (
          <div key={item.id} className="shortcut-tile-wrap">
            <a
              className="shortcut-tile"
              href={item.url}
              target="_blank"
              rel="noreferrer"
              title={item.url}
            >
              <span className="shortcut-icon" style={{ background: item.color || "#512bd4" }}>
                <img
                  src={faviconUrl(item.url)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="shortcut-letter">{item.label.slice(0, 2).toUpperCase()}</span>
              </span>
              <span className="shortcut-label">{item.label}</span>
            </a>
            <button
              type="button"
              className="shortcut-remove"
              title={"Remove " + item.label}
              onClick={() => removeShortcut(item.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <form className="shortcut-form" onSubmit={addShortcut}>
          <label>
            Icon name
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. LeetCode"
              maxLength={24}
            />
          </label>
          <label>
            Website URL
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://leetcode.com"
            />
          </label>
          <label className="shortcut-color-field">
            Color
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
          <button type="submit" className="btn-add-qa" disabled={savingShortcut}>
            {savingShortcut ? "Saving..." : "Save icon"}
          </button>
        </form>
      )}
      {error && <p className="shortcut-error" role="alert">{error}</p>}
    </section>
  );
}
