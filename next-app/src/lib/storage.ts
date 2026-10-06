'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

const EVENT = 'studyhub-storage';

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

function readRaw(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function parseFlags(raw: string | null): Record<string, boolean> {
  try {
    const v: unknown = JSON.parse(raw || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function writeJson(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useStoredFlags(key: string): [Record<string, boolean> | null, (next: Record<string, boolean>) => void] {
  const raw = useSyncExternalStore(subscribe, () => readRaw(key) ?? '', () => null);
  const value = useMemo(() => (raw === null ? null : parseFlags(raw)), [raw]);
  const write = useCallback((next: Record<string, boolean>) => writeJson(key, next), [key]);
  return [value, write];
}
