import type { ImageryReading } from '../types';

/**
 * Ingatan pembacaan citra, tersimpan di browser.
 *
 * Pembacaan citra hanya bergantung pada LOKASI, bukan pada baris titik panas
 * yang kebetulan berada di situ. Jadi begitu sebuah petak tanah pernah dibaca,
 * hasilnya berlaku untuk berkas apa pun yang Anda impor kemudian. Berkas SiPongi+
 * harian sangat sering mengulang lokasi yang sama, sehingga impor kedua dan
 * seterusnya hampir seluruhnya terjawab dari ingatan ini.
 *
 * Satu hal yang perlu jelas namanya. Ini INGATAN, bukan pembelajaran. Mesinnya
 * tidak menjadi lebih pandai; ia hanya berhenti mengerjakan ulang hal yang sama.
 * Yang benar-benar menumpuk sebagai pengetahuan adalah koreksi manual Anda, dan
 * koreksi itu diberi kedudukan lebih tinggi: pembacaan mesin tidak pernah boleh
 * menimpanya, bahkan ketika algoritmanya diperbarui.
 */

const DB_NAME = 'sipongi-land-watch';
const STORE = 'imagery';
const DB_VERSION = 1;

/**
 * Versi algoritma pembacaan. Naikkan angka ini setiap kali ambang atau ukuran
 * pada classifier berubah, supaya pembacaan mesin yang lama dianggap kedaluwarsa.
 * Koreksi manusia tetap dipertahankan apa pun versinya.
 */
export const CLASSIFIER_VERSION = 2;

export interface CachedReading extends ImageryReading {
  savedAt: number;
  classifierVersion: number;
}

/** Kunci berdasarkan lokasi, dibulatkan ke sekitar 11 meter. */
export function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null);
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      // Mode privat pada sebagian browser menolak IndexedDB. Aplikasi tetap
      // berjalan tanpa ingatan, hanya lebih lambat.
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

export async function loadAll(): Promise<Map<string, CachedReading>> {
  const db = await openDb();
  const out = new Map<string, CachedReading>();
  if (!db) return out;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) return resolve(out);
        const value = cursor.value as CachedReading;
        // Pembacaan mesin dari versi algoritma lama dibuang; koreksi manusia
        // tidak pernah kedaluwarsa.
        if (value.reviewedByHuman || value.classifierVersion === CLASSIFIER_VERSION) {
          out.set(String(cursor.key), value);
        }
        cursor.continue();
      };
      req.onerror = () => resolve(out);
    } catch {
      resolve(out);
    }
  });
}

export async function save(lat: number, lng: number, reading: ImageryReading): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE, 'readwrite');
    const entry: CachedReading = { ...reading, savedAt: Date.now(), classifierVersion: CLASSIFIER_VERSION };
    tx.objectStore(STORE).put(entry, cacheKey(lat, lng));
  } catch {
    // Kuota penuh atau penyimpanan ditolak. Diabaikan, karena ingatan ini
    // sifatnya mempercepat, bukan menentukan kebenaran.
  }
}

export async function saveMany(entries: { lat: number; lng: number; reading: ImageryReading }[]): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const now = Date.now();
    for (const e of entries) {
      store.put({ ...e.reading, savedAt: now, classifierVersion: CLASSIFIER_VERSION }, cacheKey(e.lat, e.lng));
    }
  } catch {
    /* seperti di atas */
  }
}

export interface CacheStats {
  total: number;
  reviewed: number;
  approxBytes: number;
  oldest: number | null;
}

export async function stats(): Promise<CacheStats> {
  const all = await loadAll();
  let reviewed = 0;
  let bytes = 0;
  let oldest: number | null = null;
  for (const v of all.values()) {
    if (v.reviewedByHuman) reviewed++;
    bytes += (v.thumbnail?.length ?? 0) + 220;
    if (oldest === null || v.savedAt < oldest) oldest = v.savedAt;
  }
  return { total: all.size, reviewed, approxBytes: bytes, oldest };
}

/** Menghapus pembacaan mesin, dan secara sengaja menyisakan koreksi manusia. */
export async function clearMachineReadings(): Promise<number> {
  const db = await openDb();
  if (!db) return 0;
  const all = await loadAll();
  let removed = 0;
  try {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    for (const [key, value] of all) {
      if (!value.reviewedByHuman) {
        store.delete(key);
        removed++;
      }
    }
  } catch {
    return 0;
  }
  return removed;
}

/** Menghapus seluruh ingatan, termasuk koreksi manusia. Perlu konfirmasi. */
export async function clearAll(): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
  } catch {
    /* diabaikan */
  }
}
