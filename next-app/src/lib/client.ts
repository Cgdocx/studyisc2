'use client';

import { useState, useSyncExternalStore } from 'react';

const noSubscribe = () => () => {};

/** false while rendering on the server and during hydration, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

/**
 * Calls `restore` once, in the first client render after hydration, so state saved in
 * localStorage can be applied without a hydration mismatch. `restore` may call this
 * component's state setters: React applies updates made while rendering before it commits.
 */
export function useRestoreAfterHydration(restore: () => void): void {
  const isClient = useIsClient();
  const [restored, setRestored] = useState(false);
  if (isClient && !restored) {
    setRestored(true);
    restore();
  }
}
