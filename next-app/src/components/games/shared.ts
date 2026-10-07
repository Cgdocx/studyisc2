'use client';

import { useCallback, useEffect, useRef } from 'react';

export { useIsClient } from '@/lib/client';

export function shuffled<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function now(): number {
  return Date.now();
}

export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

export function useLater(): (fn: () => void, ms: number) => void {
  const ids = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const set = ids.current;
    return () => { set.forEach(clearTimeout); set.clear(); };
  }, []);
  return useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => { ids.current.delete(id); fn(); }, ms);
    ids.current.add(id);
  }, []);
}

export function readStored(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function writeStored(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {}
}
