// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { localStore } from '../../src/core/storage/localStorage'
import { purgeStaleStorage } from '../../src/core/storage/storageCleanup'

const DRAFTS_KEY = 'taxedge.applicationDrafts'

describe('purgeStaleStorage', () => {
  beforeEach(() => localStore.clear())

  it('removes unscoped legacy loan keys and retired-service auto-saves', () => {
    localStore.set('taxedge_loan_business_loan', { a: 1 })
    localStore.set('taxedge_loan_app_home_loan', { a: 1 })
    localStore.set('taxedge_loan_step_home_loan', 3)
    localStore.set('taxedge_itr_draft_usr_9123498765_tax-notice-assistance', { formData: {} })

    const removed = purgeStaleStorage()

    expect(removed).toHaveLength(4)
    expect(localStore.get('taxedge_loan_business_loan')).toBeNull()
    expect(localStore.get('taxedge_loan_step_home_loan')).toBeNull()
  })

  it('keeps current, user-scoped data', () => {
    localStore.set('taxedge_loan_app_usr_9123498765_home_loan', { a: 1 })
    localStore.set('taxedge_loan_app_stf_001_latest', { a: 1 })
    localStore.set('taxedge_itr_draft_usr_9123498765_tds-refund', { formData: {} })
    localStore.set('taxedge.user', { id: 'usr_9123498765' })

    expect(purgeStaleStorage()).toEqual([])
    expect(localStore.get('taxedge_loan_app_usr_9123498765_home_loan')).not.toBeNull()
    expect(localStore.get('taxedge.user')).not.toBeNull()
  })

  it('drops ownerless drafts and drafts of retired services from the dashboard list', () => {
    localStore.set(DRAFTS_KEY, [
      { serviceId: 'tds-refund', userId: 'usr_1' },
      { serviceId: 'gst-registration' },
      { serviceId: 'tax-notice-assistance', userId: 'usr_1' },
    ])

    purgeStaleStorage()

    expect(localStore.get(DRAFTS_KEY)).toEqual([{ serviceId: 'tds-refund', userId: 'usr_1' }])
  })
})
