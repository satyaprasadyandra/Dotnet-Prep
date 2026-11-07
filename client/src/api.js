const API = import.meta.env.DEV ? "http://localhost:3847/api" : "/api";

let saveTimer = null;
let pendingState = null;
let pendingWaiters = [];
let saveQueue = Promise.resolve();

export async function fetchState() {
  const res = await fetch(API + "/state");
  if (!res.ok) throw new Error("Failed to load tracker state");
  return res.json();
}

async function putState(state) {
  const res = await fetch(API + "/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error("Failed to save");
  return res.json();
}

function flushPendingSave() {
  if (saveTimer !== null) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (pendingState === null) return Promise.resolve(null);

  const stateToSave = pendingState;
  pendingState = null;
  const waiters = pendingWaiters;
  pendingWaiters = [];

  const request = saveQueue.then(() => putState(stateToSave));
  saveQueue = request.catch(() => {});
  request.then(
    (result) => waiters.forEach((waiter) => waiter.resolve(result)),
    (error) => waiters.forEach((waiter) => waiter.reject(error))
  );
  return request;
}

export function saveState(state, { immediate = false } = {}) {
  pendingState = state;
  const promise = new Promise((resolve, reject) => {
    pendingWaiters.push({ resolve, reject });
  });

  if (saveTimer !== null) clearTimeout(saveTimer);
  saveTimer = null;

  if (immediate) {
    flushPendingSave().catch(() => {});
  } else {
    saveTimer = setTimeout(() => {
      flushPendingSave().catch(() => {});
    }, 400);
  }
  return promise;
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    if (pendingState === null || typeof navigator === "undefined" || !navigator.sendBeacon) return;
    if (saveTimer !== null) clearTimeout(saveTimer);
    saveTimer = null;
    const body = new Blob([JSON.stringify(pendingState)], { type: "application/json" });
    navigator.sendBeacon(API + "/state", body);
  });
}

export const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed"];
