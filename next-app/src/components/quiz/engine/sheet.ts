import type { TrackerConfig } from '@/lib/banks';

const TEXT = 'text/plain;charset=utf-8';

function post(url: string, body: string, contentType = TEXT): Promise<Response> {
  return fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': contentType }, body });
}

export function postToSheet(tracker: TrackerConfig, body: string): Promise<void> {
  if (tracker.transport === 'beacon') {
    let queued = false;
    if (navigator.sendBeacon) {
      try {
        queued = navigator.sendBeacon(tracker.url, new Blob([body], { type: TEXT }));
      } catch {
        queued = false;
      }
    }
    if (!queued) post(tracker.url, body).catch(() => undefined);
    return Promise.resolve();
  }
  if (tracker.transport === 'fetch-retry-json') {
    return post(tracker.url, body).then(
      () => undefined,
      () => post(tracker.url, body, 'application/json').then(() => undefined, () => undefined),
    );
  }
  return post(tracker.url, body).then(() => undefined);
}
