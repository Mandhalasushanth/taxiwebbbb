import { errorTracker } from '@core/errors'

/** Browser localStorage wrapper with memory fallback and error protection. */
const memoryStore = new Map<string, string>()

const isStorageAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  } catch (err) {
    errorTracker.captureException(err, { extra: { context: 'isStorageAvailable' } })
    return false
  }
}

export const localStore = {
  get<T>(key: string): T | null {
    if (isStorageAvailable()) {
      try {
        const item = window.localStorage.getItem(key)
        if (item !== null) {
          return JSON.parse(item) as T
        }
      } catch (err) {
        errorTracker.captureException(err, { extra: { action: 'localStore.get', key } })
      }
    }
    const memRaw = memoryStore.get(key)
    if (!memRaw) return null
    try {
      return JSON.parse(memRaw) as T
    } catch (err) {
      errorTracker.captureException(err, { extra: { action: 'localStore.getMemory', key } })
      return null
    }
  },
  set<T>(key: string, value: T): void {
    const serialized = JSON.stringify(value)
    if (isStorageAvailable()) {
      try {
        window.localStorage.setItem(key, serialized)
      } catch (err) {
        errorTracker.captureException(err, { extra: { action: 'localStore.set', key } })
      }
    }
    memoryStore.set(key, serialized)
  },
  remove(key: string): void {
    if (isStorageAvailable()) {
      try {
        window.localStorage.removeItem(key)
      } catch (err) {
        errorTracker.captureException(err, { extra: { action: 'localStore.remove', key } })
      }
    }
    memoryStore.delete(key)
  },
  clear(): void {
    if (isStorageAvailable()) {
      try {
        window.localStorage.clear()
      } catch (err) {
        errorTracker.captureException(err, { extra: { action: 'localStore.clear' } })
      }
    }
    memoryStore.clear()
  },
}
