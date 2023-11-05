import { useSyncExternalStore } from 'react';

/**
 * Tiny persisted store backed by localStorage, synced across tabs.
 * Falls back to in-memory state when storage is unavailable (private mode).
 */
export function createPersistedStore(key, initialState) {
  let state = read();
  const listeners = new Set();

  function read() {
    try {
      const raw = localStorage.getItem(key);
      return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
    } catch {
      return initialState;
    }
  }

  function emit() {
    listeners.forEach((l) => l());
  }

  function setState(updater) {
    const next = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
    if (next === state) return;
    state = next;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* storage unavailable – keep in memory */
    }
    emit();
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === key) {
        state = read();
        emit();
      }
    });
  }

  function useStore(selector = (s) => s) {
    return useSyncExternalStore(subscribe, () => selector(state), () => selector(initialState));
  }

  return { getState: () => state, setState, subscribe, useStore };
}
