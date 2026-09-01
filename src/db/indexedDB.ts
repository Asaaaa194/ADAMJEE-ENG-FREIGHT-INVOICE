import { InvoiceRecord } from '../types';

const DB_NAME = 'FMB_Invoice_Database';
const STORE_NAME = 'invoices';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this browser.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'invNo' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('templateType', 'templateType', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

/**
 * Request persistent browser storage so Chrome / Edge never clears IndexedDB
 */
export async function requestPersistentStorage(): Promise<{
  persisted: boolean;
  quota?: number;
  usage?: number;
}> {
  if (typeof navigator === 'undefined' || !navigator.storage) {
    return { persisted: false };
  }

  let persisted = false;
  try {
    if (navigator.storage.persisted) {
      persisted = await navigator.storage.persisted();
    }
    if (!persisted && navigator.storage.persist) {
      persisted = await navigator.storage.persist();
    }
  } catch (err) {
    console.warn('Storage persistence request error:', err);
  }

  let quota: number | undefined;
  let usage: number | undefined;

  try {
    if (navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      quota = estimate.quota;
      usage = estimate.usage;
    }
  } catch (err) {
    console.warn('Storage estimate error:', err);
  }

  return { persisted, quota, usage };
}

/**
 * Save or update invoice record in IndexedDB
 */
export async function saveInvoiceRecord(invoice: InvoiceRecord): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const recordToSave = {
      ...invoice,
      updatedAt: new Date().toISOString(),
    };

    const request = store.put(recordToSave);

    request.onsuccess = () => {
      try {
        localStorage.setItem('fmb_last_active_inv', invoice.invNo);
      } catch {
        // ignore localStorage issues
      }
      resolve();
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a specific invoice by invNo
 */
export async function getInvoiceRecord(invNo: string): Promise<InvoiceRecord | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(invNo);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve all invoices from IndexedDB sorted by updatedAt descending
 */
export async function getAllInvoices(): Promise<InvoiceRecord[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results: InvoiceRecord[] = request.result || [];
      // sort latest updated first
      results.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      resolve(results);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete invoice record from IndexedDB
 */
export async function deleteInvoiceRecord(invNo: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(invNo);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Export all invoices as a JSON backup blob
 */
export async function exportInvoicesJSON(): Promise<string> {
  const all = await getAllInvoices();
  return JSON.stringify(
    {
      app: 'F.M BROTHERS Invoice Management System',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      database: DB_NAME,
      count: all.length,
      invoices: all,
    },
    null,
    2
  );
}

/**
 * Import invoices from JSON backup file
 */
export async function importInvoicesJSON(jsonString: string): Promise<number> {
  const parsed = JSON.parse(jsonString);
  const items: InvoiceRecord[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.invoices)
    ? parsed.invoices
    : [];

  if (!items.length) {
    throw new Error('No valid invoice records found in imported file.');
  }

  const db = await getDB();
  let count = 0;

  for (const inv of items) {
    if (inv && inv.invNo) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(inv);
        req.onsuccess = () => {
          count++;
          resolve();
        };
        req.onerror = () => reject(req.error);
      });
    }
  }

  return count;
}
