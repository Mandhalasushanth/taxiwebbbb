/**
 * Files picked during GST registration, kept in memory and persisted in IndexedDB
 * so "View Document" can always render the real file, even after a page reload.
 */
const DB_NAME = 'taxedge_gst_docs_db'
const DB_VERSION = 1
const STORE_NAME = 'docs'

const files = new Map<string, File>()

if (typeof window !== 'undefined') {
  ;(window as unknown as { __taxedge_uploaded_files?: Map<string, File> }).__taxedge_uploaded_files = files
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'))
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

// Hydrate memory map from IndexedDB on startup
if (typeof window !== 'undefined' && window.indexedDB) {
  openDB()
    .then((db) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.openCursor()
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          const docId = String(cursor.key)
          const storedName =
            (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`gst_name_${docId}`)) ||
            (typeof localStorage !== 'undefined' && localStorage.getItem(`gst_name_${docId}`)) ||
            `${docId}.pdf`
          const storedType =
            (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`gst_type_${docId}`)) ||
            (typeof localStorage !== 'undefined' && localStorage.getItem(`gst_type_${docId}`)) ||
            (cursor.value instanceof Blob ? cursor.value.type : 'application/pdf') ||
            'application/pdf'

          if (cursor.value instanceof File) {
            files.set(cursor.key as string, cursor.value)
          } else if (cursor.value instanceof Blob) {
            const file = new File([cursor.value], storedName, { type: storedType })
            files.set(cursor.key as string, file)
          }
          cursor.continue()
        }
      }
    })
    .catch(() => {
      // Safe fallback to in-memory map
    })
}

function dataUrlToFile(dataUrl: string, fileName: string, fallbackType = 'image/jpeg'): File {
  const parts = dataUrl.split(',')
  const mime = parts[0]?.match(/:(.*?);/)?.[1] || fallbackType
  const bstr = atob(parts[1] || '')
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], fileName, { type: mime })
}

function saveFileDataUrl(docId: string, file: File) {
  try {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      try {
        sessionStorage.setItem(`gst_file_${docId}`, dataUrl)
        sessionStorage.setItem(`gst_name_${docId}`, file.name)
        sessionStorage.setItem(`gst_type_${docId}`, file.type)
      } catch {
        // Safe to ignore if quota exceeded
      }
      try {
        localStorage.setItem(`gst_file_${docId}`, dataUrl)
        localStorage.setItem(`gst_name_${docId}`, file.name)
        localStorage.setItem(`gst_type_${docId}`, file.type)
      } catch {
        // Safe to ignore if quota exceeded
      }
    }
    reader.readAsDataURL(file)
  } catch {
    // Silently continue
  }
}

function removeStoredDataUrl(docId: string) {
  try {
    sessionStorage.removeItem(`gst_file_${docId}`)
    sessionStorage.removeItem(`gst_name_${docId}`)
    sessionStorage.removeItem(`gst_type_${docId}`)
    localStorage.removeItem(`gst_file_${docId}`)
    localStorage.removeItem(`gst_name_${docId}`)
    localStorage.removeItem(`gst_type_${docId}`)
  } catch {
    // Silently continue
  }
}

function getStoredFile(docId: string): File | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const dataUrl =
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`gst_file_${docId}`)) ||
      (typeof localStorage !== 'undefined' && localStorage.getItem(`gst_file_${docId}`))
    if (dataUrl) {
      const name =
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`gst_name_${docId}`)) ||
        (typeof localStorage !== 'undefined' && localStorage.getItem(`gst_name_${docId}`)) ||
        `${docId}.jpg`
      const type =
        (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`gst_type_${docId}`)) ||
        (typeof localStorage !== 'undefined' && localStorage.getItem(`gst_type_${docId}`)) ||
        'image/jpeg'
      const file = dataUrlToFile(dataUrl, name, type)
      files.set(docId, file)
      return file
    }
  } catch {
    // Silently ignore
  }
  return undefined
}

export const gstUploadedFiles = {
  get(docId: string): File | undefined {
    return files.get(docId) || getStoredFile(docId)
  },
  set(docId: string, file: File): void {
    files.set(docId, file)
    saveFileDataUrl(docId, file)
    if (typeof window !== 'undefined' && window.indexedDB) {
      openDB()
        .then((db) => {
          const tx = db.transaction(STORE_NAME, 'readwrite')
          tx.objectStore(STORE_NAME).put(file, docId)
        })
        .catch(() => {})
    }
  },
  remove(docId: string): void {
    files.delete(docId)
    removeStoredDataUrl(docId)
    if (typeof window !== 'undefined' && window.indexedDB) {
      openDB()
        .then((db) => {
          const tx = db.transaction(STORE_NAME, 'readwrite')
          tx.objectStore(STORE_NAME).delete(docId)
        })
        .catch(() => {})
    }
  },
  /** After submit or "Discard & Exit" */
  clear(): void {
    files.clear()
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(sessionStorage || {}).filter((k) => k.startsWith('gst_file_'))
        keys.forEach((k) => removeStoredDataUrl(k.replace('gst_file_', '')))
      } catch {}
      if (window.indexedDB) {
        openDB()
          .then((db) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            tx.objectStore(STORE_NAME).clear()
          })
          .catch(() => {})
      }
    }
  },
}
