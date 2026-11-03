/**
 * Files picked during GST flows (Registration, Filing, Compliance, Amendment),
 * kept in memory and in IndexedDB so "View Document" and draft restores can render
 * the real file even after a page reload. Files are never copied into
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
          if (cursor.value instanceof File) {
            files.set(String(cursor.key), cursor.value)
          } else if (cursor.value instanceof Blob) {
            const reconstructed = new File([cursor.value], (cursor.value as any).name || 'document', {
              type: cursor.value.type,
            })
            files.set(String(cursor.key), reconstructed)
          }
          cursor.continue()
        }
      })
      .catch(() => {
        // Safe fallback to the in-memory map
      })
  }
}

export const gstUploadedFiles = {
  get(docId?: string): File | undefined {
    if (!docId) return undefined
    return files.get(docId) ?? files.get(docId.toLowerCase())
  },
  find(query: { id?: string; fileName?: string; title?: string }): File | undefined {
    // 1. Direct key lookups
    if (query.id && files.has(query.id)) return files.get(query.id)
    if (query.fileName && files.has(query.fileName)) return files.get(query.fileName)
    if (query.title && files.has(query.title)) return files.get(query.title)

    // 2. Case-insensitive key lookups
    if (query.id) {
      const lower = query.id.toLowerCase()
      for (const [k, f] of files.entries()) {
        if (k.toLowerCase() === lower) return f
      }
    }
    if (query.fileName) {
      const lowerName = query.fileName.toLowerCase()
      for (const [k, f] of files.entries()) {
        if (k.toLowerCase() === lowerName || f.name.toLowerCase() === lowerName) return f
      }
    }

    // 3. Normalized / prefix-stripped lookups (e.g. filing_sales-invoices vs sales-invoices)
    if (query.id) {
      const cleanId = query.id.replace(/^filing_/, '').toLowerCase()
      for (const [k, f] of files.entries()) {
        if (k.replace(/^filing_/, '').toLowerCase() === cleanId) return f
      }
    }

    // 4. Title / keyword matches
    const titleLower = (query.title || '').toLowerCase()
    if (titleLower) {
      // Photo slot matches
      if (titleLower.includes('photo') || query.id === 'photo') {
        for (const [k, f] of files.entries()) {
          if (k.toLowerCase().includes('photo') || f.name.toLowerCase().includes('photo') || f.type.startsWith('image/')) {
            return f
          }
        }
      }
      // Amendment slot matches
      if (titleLower.includes('amendment') || titleLower.includes('authorization') || titleLower.includes('supporting') || query.id === 'd1' || query.id === 'd2') {
        if (files.has('amendment_file')) return files.get('amendment_file')
      }
      // PAN / Aadhaar / Bank / Invoices slot matches
      for (const [k, f] of files.entries()) {
        const kLow = k.toLowerCase()
        const fLow = f.name.toLowerCase()
        if (titleLower.includes('pan') && (kLow.includes('pan') || fLow.includes('pan'))) return f
        if (titleLower.includes('aadhaar') && (kLow.includes('aadhaar') || fLow.includes('aadhaar'))) return f
        if (titleLower.includes('bank') && (kLow.includes('bank') || fLow.includes('bank') || fLow.includes('cheque'))) return f
        if (titleLower.includes('sales') && (kLow.includes('sales') || fLow.includes('sales') || fLow.includes('invoice'))) return f
        if (titleLower.includes('purchase') && (kLow.includes('purchase') || fLow.includes('purchase'))) return f
        if (titleLower.includes('address') && (kLow.includes('address') || fLow.includes('address') || fLow.includes('premises'))) return f
      }
    }

    // 5. If there's only 1 uploaded file in memory, and query is for amendment or single-doc flow
    if (files.size === 1) {
      const single = files.values().next().value
      if (single) return single
    }

    return undefined
  },
  async getAsync(docId: string): Promise<File | undefined> {
    const memory = files.get(docId) ?? files.get(docId.toLowerCase())
    if (memory) return memory
    if (!hasIndexedDb()) return undefined
    try {
      const db = await openDB()
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const req = tx.objectStore(STORE_NAME).get(docId)
        req.onsuccess = () => {
          const val = req.result
          if (val instanceof File) {
            files.set(docId, val)
            resolve(val)
          } else if (val instanceof Blob) {
            const reconstructed = new File([val], (val as any).name || 'document', { type: val.type })
            files.set(docId, reconstructed)
            resolve(reconstructed)
          } else {
            resolve(undefined)
          }
        }
        req.onerror = () => resolve(undefined)
      })
    } catch {
      return undefined
    }
  },
  async resolveFileAsync(query: { id?: string; fileName?: string; title?: string }): Promise<File | undefined> {
    const memMatch = this.find(query)
    if (memMatch) return memMatch
    if (!hasIndexedDb()) return undefined
    try {
      const db = await openDB()
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const req = tx.objectStore(STORE_NAME).openCursor()
        req.onsuccess = () => {
          const cursor = req.result
          if (!cursor) {
            resolve(this.find(query))
            return
          }
          const val = cursor.value
          if (val instanceof File) {
            files.set(String(cursor.key), val)
          } else if (val instanceof Blob) {
            files.set(String(cursor.key), new File([val], (val as any).name || 'document', { type: val.type }))
          }
          cursor.continue()
        }
        req.onerror = () => resolve(this.find(query))
      })
    } catch {
      return undefined
    }
  },
  set(docId: string, file: File): void {
    files.set(docId, file)
    files.set(docId.toLowerCase(), file)
    if (file.name) {
      files.set(file.name, file)
      files.set(file.name.toLowerCase(), file)
    }
    writeStore((store) => {
      store.put(file, docId)
      if (file.name) store.put(file, file.name)
    })
  },
  getAll(): Map<string, File> {
    return files
  },
  remove(docId: string): void {
    files.delete(docId)
    files.delete(docId.toLowerCase())
    writeStore((store) => store.delete(docId))
  },
  /** Only when user explicitly discards all drafts/uploads */
  clear(): void {
    files.clear()
    writeStore((store) => store.clear())
  },
}
