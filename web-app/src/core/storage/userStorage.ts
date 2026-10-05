import { localStore } from './localStorage'
import { authStorage } from '@core/auth'
import type { RecentApplication, UpcomingDeadlineItem } from '@modules/dashboard/types/dashboard.types'
import { useNotificationStore } from '@store/notifications/notificationStore'

const USER_APPLICATIONS_KEY = 'taxedge.userApplications'
const APPLICATION_DRAFTS_KEY = 'taxedge.applicationDrafts'
const USER_DEADLINES_KEY = 'taxedge.userDeadlines'

export interface ApplicationDraft {
  serviceId: string
  serviceTitle: string
  currentStep: number
  totalSteps: number
  stepLabel?: string
  formData: Record<string, unknown>
  savedAt: string
  savedTimestamp: number
  resumeRoute: string
  userId?: string
}

export const userStorage = {
  getUserApplications(): RecentApplication[] {
    const raw = localStore.get<RecentApplication[]>(USER_APPLICATIONS_KEY) || []

    // Filter out dummy/mock placeholders (e.g. empty 'New Registration · India' default submissions or mock references)
    // and deduplicate by code/service so repeated submissions don't duplicate identical applications
    const seenCodes = new Set<string>()
    const cleaned = raw.filter((app) => {
      // Exclude placeholder submissions where no real user details were filled
      const isDummyMeta =
        !app.meta ||
        app.meta.trim() === '' ||
        app.meta === 'New Registration · India' ||
        app.meta === 'New Registration · ' ||
        app.meta.includes('94,53,14,162')

      const isMockId =
        app.id.startsWith('mock-') ||
        app.id.startsWith('default-') ||
        app.id.startsWith('sample-')

      // Exclude legacy hardcoded template mock codes from previous test runs
      const isMockCode =
        app.code === 'GST-2026-00118' ||
        app.code === 'TDS-2026-59303' ||
        app.code === 'AA29944099962' ||
        app.code === 'GST-2026-44191' ||
        app.code === 'ITR-2026-37226' ||
        app.code === 'ITR-2026-00074'

      if (isDummyMeta || isMockId || isMockCode) return false

      const key = app.code || app.id
      if (seenCodes.has(key)) return false

      seenCodes.add(key)
      return true
    })

    // If cleaned differs from raw (duplicates or mock items removed), sync back to local storage
    if (cleaned.length !== raw.length) {
      localStore.set(USER_APPLICATIONS_KEY, cleaned)
    }

    const user = authStorage.getUser()
    if (user) {
      return cleaned.filter((a) => !a.userId || a.userId === user.id)
    }

    return cleaned
  },

  saveUserApplication(app: RecentApplication): void {
    const raw = localStore.get<RecentApplication[]>(USER_APPLICATIONS_KEY) || []
    const user = authStorage.getUser()
    const appWithUser: RecentApplication = {
      ...app,
      userId: app.userId || user?.id,
    }
    const index = raw.findIndex((a) => a.id === app.id || (a.code && a.code === app.code))
    if (index >= 0) {
      raw[index] = { ...raw[index], ...appWithUser }
    } else {
      raw.unshift(appWithUser)
    }
    localStore.set(USER_APPLICATIONS_KEY, raw)

    try {
      useNotificationStore.getState().addNotification({
        title: `${app.title} Submitted`,
        message: `Your request for ${app.title} (ID: ${app.code || app.id}) has been ${app.statusLabel?.toLowerCase() || 'submitted'} successfully.`,
        timestamp: 'Just now',
        type: 'application',
      })
    } catch {
      // Safe fallback if called outside React/store initialization
    }
  },

  clearUserApplications(): void {
    localStore.remove(USER_APPLICATIONS_KEY)
  },

  /* Drafts Management */
  getAllDrafts(): ApplicationDraft[] {
    const all = localStore.get<ApplicationDraft[]>(APPLICATION_DRAFTS_KEY) || []
    const user = authStorage.getUser()
    if (!user) return []
    return all.filter((d) => d.userId === user.id || !d.userId)
  },

  getActiveDraft(): ApplicationDraft | null {
    const drafts = this.getAllDrafts()
    if (drafts.length === 0) {
      return null
    }
    // Sort by most recently saved
    return drafts.sort((a, b) => b.savedTimestamp - a.savedTimestamp)[0] || null
  },

  getDraft(serviceId: string): ApplicationDraft | null {
    const drafts = this.getAllDrafts()
    return drafts.find((d) => d.serviceId === serviceId) || null
  },

  saveDraft(draft: ApplicationDraft): void {
    const all = localStore.get<ApplicationDraft[]>(APPLICATION_DRAFTS_KEY) || []
    const user = authStorage.getUser()
    if (!user) return
    const draftWithUser = { ...draft, userId: user.id }
    
    const index = all.findIndex((d) => d.serviceId === draft.serviceId && (d.userId === user.id || !d.userId))
    if (index >= 0) {
      all[index] = draftWithUser
    } else {
      all.unshift(draftWithUser)
    }
    localStore.set(APPLICATION_DRAFTS_KEY, all)
  },

  deleteDraft(serviceId: string): void {
    const all = localStore.get<ApplicationDraft[]>(APPLICATION_DRAFTS_KEY) || []
    const user = authStorage.getUser()
    if (!user) return
    const filtered = all.filter((d) => !(d.serviceId === serviceId && (d.userId === user.id || !d.userId)))
    localStore.set(APPLICATION_DRAFTS_KEY, filtered)
  },

  clearAllDrafts(): void {
    const all = localStore.get<ApplicationDraft[]>(APPLICATION_DRAFTS_KEY) || []
    const user = authStorage.getUser()
    if (!user) return
    const filtered = all.filter((d) => d.userId !== user.id && d.userId !== undefined)
    localStore.set(APPLICATION_DRAFTS_KEY, filtered)
  },

  /* Deadlines Management */
  getUserDeadlines(): UpcomingDeadlineItem[] {
    return localStore.get<UpcomingDeadlineItem[]>(USER_DEADLINES_KEY) || []
  },

  saveUserDeadline(deadline: UpcomingDeadlineItem): void {
    const list = this.getUserDeadlines()
    const idx = list.findIndex((d) => d.id === deadline.id)
    if (idx >= 0) {
      list[idx] = deadline
    } else {
      list.push(deadline)
    }
    localStore.set(USER_DEADLINES_KEY, list)
  },

  clearUserDeadlines(): void {
    localStore.remove(USER_DEADLINES_KEY)
  },

  /**
   * Resets all user-entered data, drafts, applications, and deadlines across all modules.
   * Calling this returns the application to a brand-new user state.
   */
  clearAllUserData(): void {
    this.clearUserApplications()
    this.clearAllDrafts()
    this.clearUserDeadlines()
    try {
      useNotificationStore.getState().clearAll()
    } catch {
      // Safe fallback
    }
    localStore.remove(USER_APPLICATIONS_KEY)
    localStore.remove(APPLICATION_DRAFTS_KEY)
    localStore.remove(USER_DEADLINES_KEY)
    localStore.remove('taxedge.notifications')
  },
}

if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__taxedge_clear_user_data__ = () => userStorage.clearAllUserData()
}


