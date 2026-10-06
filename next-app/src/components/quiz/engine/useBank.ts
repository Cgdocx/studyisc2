'use client';

import { useEffect, useState } from 'react';
import { BASE_PATH } from '@/lib/site';

export function useBank<T>(dataFile: string): { data: T | null; error: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(`${BASE_PATH}/data/${dataFile}`)
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<T>; })
      .then(d => { if (alive) setData(d); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [dataFile]);
  return { data, error };
}
