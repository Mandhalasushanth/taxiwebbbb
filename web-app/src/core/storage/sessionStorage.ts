/** Safe, JSON-aware wrapper around window.sessionStorage with memory fallback. */
const memoryStore = new Map<string, string>()

const isStorageAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined' && window.sessionStorage !== null
  } catch {
    return false
  }
}

export const sessionStore = {
  get<T>(key: string): T | null {
    if (isStorageAvailable()) {
      try {
        const item = window.sessionStorage.getItem(key)
        if (item !== null) {
          return JSON.parse(item) as T
        }
      } catch {
        // Fallback to memoryStore
      }
    }
    const memRaw = memoryStore.get(key)
    if (!memRaw) return null
    try {
      return JSON.parse(memRaw) as T
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T): void {
    const serialized = JSON.stringify(value)
    if (isStorageAvailable()) {
      try {
        window.sessionStorage.setItem(key, serialized)
      } catch {
        // Fallback to memoryStore
      }
    }
    memoryStore.set(key, serialized)
  },

  remove(key: string): void {
    if (isStorageAvailable()) {
      try {
        window.sessionStorage.removeItem(key)
      } catch {
        // Fallback to memoryStore
      }
    }
    memoryStore.delete(key)
  },

  clear(): void {
    if (isStorageAvailable()) {
      try {
        window.sessionStorage.clear()
      } catch {
        // Fallback to memoryStore
      }
    }
    memoryStore.clear()
  },
}
