import { localStore } from './localStorage'

const APPLICATION_DRAFTS_KEY = 'taxedge.applicationDrafts'
const CLEAN_SLATE_RESET_FLAG = 'taxedge.clean_slate_reset_v1'

/** Services that are switched off; any draft saved for them can never be resumed. */
export const RETIRED_DRAFT_SERVICE_IDS: readonly string[] = ['tax-notice-assistance', 'previous-year-itr']

/**
 * Keys written by older builds that nothing reads any more:
 * - loan drafts saved before keys were scoped to the signed-in user (taxedge_loan_<type>,
 *   taxedge_loan_app_<type>, taxedge_loan_step_<type>); scoped keys carry "usr_" / "stf_" / "guest_"
 * - auto-saved drafts of retired services (taxedge_<namespace>_draft_<user>_<serviceId>)
 */
const LEGACY_KEY_PATTERNS: readonly RegExp[] = [
  /^taxedge_loan_step_/,
  /^taxedge_loan_app_(?!usr_|stf_|guest_)/,
  /^taxedge_loan_(?!app_|step_)[a-z_-]+$/,
  new RegExp(`^taxedge_[a-z]+_draft_.+_(${RETIRED_DRAFT_SERVICE_IDS.join('|')})$`),
]

interface StoredDraft {
  serviceId?: string
  userId?: string
}

const browserKeys = (): string[] => {
  try {
    return typeof window !== 'undefined' && window.localStorage ? Object.keys(window.localStorage) : []
  } catch {
    return []
  }
}

/** Drafts with no owner (saved before drafts were per-user) or for a retired service are dropped. */
const isKeptDraft = (draft: StoredDraft): boolean =>
  Boolean(draft.userId) && !RETIRED_DRAFT_SERVICE_IDS.includes(draft.serviceId || '')

/**
 * Completely wipes all application, draft, deadline, and notification data from localStorage.
 */
export const clearAllApplicationStorage = (): void => {
  localStore.remove('taxedge.userApplications')
  localStore.remove('taxedge.applicationDrafts')
  localStore.remove('taxedge.userDeadlines')
  localStore.remove('taxedge.notifications')
  localStore.remove('taxedge_gst_applications')
  localStore.remove('taxedge_gst_returns')
  localStore.remove('taxedge_gst_amendments')
  localStore.remove('taxedge_gst_certificates')
  localStore.remove('taxedge_gst_cancellations')

  const allKeys = browserKeys()
  for (const k of allKeys) {
    if (
      k.startsWith('taxedge_loan_') ||
      k.startsWith('taxedge_gst_') ||
      k.includes('_draft_') ||
      k.startsWith('taxedge.draft_')
    ) {
      localStore.remove(k)
    }
  }

  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('taxedge:applications-updated'))
    } catch {
      // Safe fallback
    }
  }
}

/**
 * One pass over browser storage at start-up that removes stale and mock data.
 * Returns the removed keys (useful for tests); never throws.
 */
export const purgeStaleStorage = (): string[] => {
  try {
    // 1. One-time auto-wipe of previous accumulated test/mock applications
    if (!localStore.get(CLEAN_SLATE_RESET_FLAG)) {
      clearAllApplicationStorage()
      localStore.set(CLEAN_SLATE_RESET_FLAG, true)
    }

    const staleKeys = browserKeys().filter((key) => LEGACY_KEY_PATTERNS.some((pattern) => pattern.test(key)))
    staleKeys.map((key) => localStore.remove(key))

    const drafts = localStore.get<StoredDraft[]>(APPLICATION_DRAFTS_KEY)
    const keptDrafts = Array.isArray(drafts) ? drafts.filter(isKeptDraft) : null
    if (drafts && keptDrafts && keptDrafts.length !== drafts.length) {
      localStore.set(APPLICATION_DRAFTS_KEY, keptDrafts)
    }
    return staleKeys
  } catch {
    return []
  }
}

if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__taxedge_clear_applications__ = clearAllApplicationStorage
}
