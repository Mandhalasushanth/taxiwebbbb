import { localStore } from './localStorage'

const APPLICATION_DRAFTS_KEY = 'taxedge.applicationDrafts'

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
 * One pass over browser storage at start-up that removes stale data left by earlier versions.
 * Returns the removed keys (useful for tests); never throws.
 */
export const purgeStaleStorage = (): string[] => {
  try {
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
