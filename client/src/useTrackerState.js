import { useCallback, useEffect, useState } from "react";
import { fetchState, saveState } from "./api";

export function useTrackerState() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    fetchState()
      .then((data) => {
        setState(data);
        setLastSaved(data.lastSaved);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const updateState = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setSaving(true);
      saveState(next)
        .then((res) => {
          setLastSaved(res.lastSaved);
          if (res.subjectProgress) {
            setState((s) => ({ ...s, subjectProgress: res.subjectProgress }));
          }
        })
        .catch((e) => setError(e.message))
        .finally(() => setSaving(false));
      return next;
    });
  }, []);

  return { state, loading, error, saving, lastSaved, updateState };
}
