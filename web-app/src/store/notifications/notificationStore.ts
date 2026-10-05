import { create } from 'zustand'

export interface AppNotification {
  id: string
  title: string
  message: string
  timestamp: string
  type?: 'application' | 'document' | 'payment' | 'system'
  read?: boolean
  createdAt: number
}

import { localStore } from '@core/storage'

const NOTIFICATIONS_STORAGE_KEY = 'taxedge.notifications'

const loadStoredNotifications = (): AppNotification[] => {
  return localStore.get<AppNotification[]>(NOTIFICATIONS_STORAGE_KEY) || []
}

const saveStoredNotifications = (notifications: AppNotification[]) => {
  localStore.set(NOTIFICATIONS_STORAGE_KEY, notifications)
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('taxedge:notifications-updated'))
    } catch {
      // Safe fallback
    }
  }
}

interface NotificationState {
  notifications: AppNotification[]
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => void
  removeNotification: (id: string) => void
  clearAll: () => void
  markAllAsRead: () => void
  markAsRead: (id: string) => void
  reloadFromStorage: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: loadStoredNotifications(),

  addNotification: (item) => {
    const newNotification: AppNotification = {
      id: item.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: item.createdAt || Date.now(),
      ...item,
    }
    set((state) => {
      const updated = [newNotification, ...state.notifications]
      saveStoredNotifications(updated)
      return { notifications: updated }
    })
  },

  removeNotification: (id) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id)
      saveStoredNotifications(updated)
      return { notifications: updated }
    })
  },

  clearAll: () => {
    saveStoredNotifications([])
    set({ notifications: [] })
  },

  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }))
      saveStoredNotifications(updated)
      return { notifications: updated }
    })
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      saveStoredNotifications(updated)
      return { notifications: updated }
    })
  },

  reloadFromStorage: () => {
    set({ notifications: loadStoredNotifications() })
  },
}))

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === NOTIFICATIONS_STORAGE_KEY) {
      useNotificationStore.getState().reloadFromStorage()
    }
  })
  window.addEventListener('taxedge:notifications-updated', () => {
    useNotificationStore.getState().reloadFromStorage()
  })
}
