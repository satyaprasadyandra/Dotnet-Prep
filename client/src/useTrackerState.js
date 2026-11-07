import { useCallback, useEffect, useRef, useState } from "react";
import { fetchState, saveState } from "./api";

export function useTrackerState() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const stateRef = useRef(null);
  const pendingSaveCount = useRef(0);

  useEffect(() => {
    let active = true;
    fetchState()
      .then((data) => {
        if (!active) return;
        stateRef.current = data;
        setState(data);
        setLastSaved(data.lastSaved);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateState = useCallback((updater, options = {}) => {
    const previous = stateRef.current;
    if (!previous) return Promise.resolve(null);

    const next = typeof updater === "function" ? updater(previous) : updater;
    stateRef.current = next;
    setState(next);
    pendingSaveCount.current += 1;
    setSaving(true);

    return saveState(next, { immediate: options.immediate })
      .then((res) => {
        setLastSaved(res.lastSaved);
        if (res.subjectProgress) {
          const current = stateRef.current;
          if (current) {
            const updated = { ...current, subjectProgress: res.subjectProgress };
            stateRef.current = updated;
            setState(updated);
          }
        }
        setError(null);
        return res;
      })
      .catch((e) => {
        if (typeof options.rollback === "function") {
          const restored = options.rollback(stateRef.current, previous);
          if (restored) {
            stateRef.current = restored;
            setState(restored);
          }
        }
        setError(e.message);
        return null;
      })
      .finally(() => {
        pendingSaveCount.current -= 1;
        if (pendingSaveCount.current === 0) setSaving(false);
      });
  }, []);

  return { state, loading, error, saving, lastSaved, updateState };
}
