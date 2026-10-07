/**
 * Files picked during GST registration, kept in memory and in IndexedDB so "View Document"
 * can render the real file even after a page reload. Files are never copied into
 * localStorage / sessionStorage (identity documents must not sit in plain browser storage).
 */
const DB_NAME = 'taxedge_gst_docs_db'
const DB_VERSION = 1
const STORE_NAME = 'docs'

/** Keys earlier versions used to copy files into browser storage as base64 */
const LEGACY_STORAGE_PREFIXES = ['gst_file_', 'gst_name_', 'gst_type_']

const files = new Map<string, File>()

const hasIndexedDb = (): boolean => typeof window !== 'undefined' && Boolean(window.indexedDB)

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('IndexedDB not supported'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/** Runs one write against the store; storage is a convenience, so failures are ignored */
const writeStore = (write: (store: IDBObjectStore) => void): void => {
  if (!hasIndexedDb()) return
  openDB()
    .then((db) => write(db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME)))
    .catch(() => {
      // The in-memory copy still works for this session
    })
}

/** Removes base64 copies of documents left in browser storage by earlier versions */
const removeLegacyStorageCopies = (): void => {
  try {
    ;[localStorage, sessionStorage].forEach((storage) =>
      Object.keys(storage)
        .filter((key) => LEGACY_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix)))
        .forEach((key) => storage.removeItem(key)),
    )
  } catch {
    // Storage may be unavailable (private mode); nothing to clean then
  }
}

// Load files saved in IndexedDB into memory on startup
if (typeof window !== 'undefined') {
  removeLegacyStorageCopies()
  if (hasIndexedDb()) {
    openDB()
      .then((db) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).openCursor()
        request.onsuccess = () => {
          const cursor = request.result
          if (!cursor) return
          if (cursor.value instanceof File) files.set(String(cursor.key), cursor.value)
          cursor.continue()
        }
      })
      .catch(() => {
        // Safe fallback to the in-memory map
      })
  }
}

export const gstUploadedFiles = {
  get(docId: string): File | undefined {
    return files.get(docId)
  },
  set(docId: string, file: File): void {
    files.set(docId, file)
    writeStore((store) => store.put(file, docId))
  },
  remove(docId: string): void {
    files.delete(docId)
    writeStore((store) => store.delete(docId))
  },
  /** After submit or "Discard & Exit" */
  clear(): void {
    files.clear()
    writeStore((store) => store.clear())
  },
}
