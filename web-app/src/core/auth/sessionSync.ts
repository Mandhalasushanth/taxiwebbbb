import { STORAGE_KEYS } from '../config/constants'
import { localStore } from '../storage/localStorage'

/** Why a session ended: explicit sign-out, idle timeout, or rejected by the server. */
export type SessionEndReason = 'logout' | 'timeout' | 'expired'

type RemoteLogoutHandler = (reason: SessionEndReason) => void

interface LogoutMessage {
  type: 'logout'
  reason: SessionEndReason
}

const CHANNEL_NAME = 'taxedge.auth'

const createChannel = (): BroadcastChannel | null => {
  try {
    return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME)
  } catch {
    return null
  }
}

const channel = createChannel()

const isLogoutMessage = (data: unknown): data is LogoutMessage =>
  Boolean(data && typeof data === 'object' && (data as LogoutMessage).type === 'logout')

const storedReason = (): SessionEndReason =>
  localStore.get<SessionEndReason>(STORAGE_KEYS.sessionEndReason) ?? 'logout'

/**
 * Cross-tab session signalling. BroadcastChannel is used where available; the
 * `storage` event on the access-token key is the fallback for older browsers.
 */
export const sessionSync = {
  broadcastLogout(reason: SessionEndReason): void {
    try {
      channel?.postMessage({ type: 'logout', reason } satisfies LogoutMessage)
    } catch {
      /* the storage event still reaches other tabs */
    }
  },

  onRemoteLogout(handler: RemoteLogoutHandler): () => void {
    if (typeof window === 'undefined') return () => undefined

    const handleMessage = (event: MessageEvent) => {
      if (isLogoutMessage(event.data)) handler(event.data.reason)
    }
    const handleStorage = (event: StorageEvent) => {
      const tokenRemoved = event.key === STORAGE_KEYS.accessToken && event.newValue === null
      const storageCleared = event.key === null
      if (tokenRemoved || storageCleared) handler(storedReason())
    }

    channel?.addEventListener('message', handleMessage)
    window.addEventListener('storage', handleStorage)
    return () => {
      channel?.removeEventListener('message', handleMessage)
      window.removeEventListener('storage', handleStorage)
    }
  },
}
