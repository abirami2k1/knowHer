/**
 * A very small IndexedDB wrapper — one store, four operations. A library would
 * cost more bytes than it saves here, and this is the only place the raw API
 * is touched.
 *
 * What lives here is health data on her own device. It is never sent anywhere
 * but the knowHer API, and `clearOfflineData()` empties it on sign-out, because
 * a phone can be shared.
 */

const DB_NAME = 'knowher';
const DB_VERSION = 1;
/** Pending day writes, keyed by calendar date so re-editing a day replaces it. */
export const QUEUED_LOGS = 'queued-logs';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUEUED_LOGS)) {
        db.createObjectStore(QUEUED_LOGS, { keyPath: 'date' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('could not open the offline store'));
  });
}

function run<T>(
  store: string,
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(store, mode);
        const request = work(transaction.objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('offline store write failed'));
        transaction.oncomplete = () => db.close();
      }),
  );
}

export function put<T>(store: string, value: T): Promise<unknown> {
  return run(store, 'readwrite', (s) => s.put(value));
}

export function getAll<T>(store: string): Promise<T[]> {
  return run<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>);
}

export function remove(store: string, key: IDBValidKey): Promise<unknown> {
  return run(store, 'readwrite', (s) => s.delete(key));
}

export function clearStore(store: string): Promise<unknown> {
  return run(store, 'readwrite', (s) => s.clear());
}
