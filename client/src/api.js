const API = import.meta.env.DEV ? "http://localhost:3847/api" : "/api";

let saveTimer = null;

export async function fetchState() {
  const res = await fetch(`${API}/state`);
  if (!res.ok) throw new Error("Failed to load tracker state");
  return res.json();
}

export function saveState(state) {
  return new Promise((resolve, reject) => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/state`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        });
        if (!res.ok) throw new Error("Failed to save");
        resolve(await res.json());
      } catch (err) {
        reject(err);
      }
    }, 400);
  });
}

export const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed"];
