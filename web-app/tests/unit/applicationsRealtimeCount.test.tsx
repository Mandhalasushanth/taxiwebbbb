// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useApplicationsCount } from '../../src/modules/applications/hooks/useApplicationsCount'
import { userStorage } from '../../src/core/storage/userStorage'
import { authStorage } from '../../src/core/auth'

describe('useApplicationsCount real-time hook', () => {
  beforeEach(() => {
    userStorage.clearUserApplications()
    authStorage.setUser({
      id: 'usr_test_count',
      fullName: 'Sagarika Jena',
      mobile: '9876543210',
      isProfileComplete: true,
      role: 'CUSTOMER',
      email: 'sagarika@example.com',
    })
  })

  afterEach(() => {
    userStorage.clearUserApplications()
    authStorage.clear()
  })

  it('initially returns 0 when no applications exist', () => {
    const { result } = renderHook(() => useApplicationsCount())
    expect(result.current).toBe(0)
  })

  it('returns exact total application count when applications exist in userStorage', () => {
    for (let i = 1; i <= 22; i++) {
      userStorage.saveUserApplication({
        id: `app_${i}`,
        code: `GST-2026-${String(i).padStart(5, '0')}`,
        title: `GST Application ${i}`,
        meta: `State · India`,
        statusLabel: i <= 3 ? 'Completed' : 'Under Verification',
        statusTone: 'info',
        progress: 50,
        icon: '📄',
        to: `/applications/track/GST-2026-${String(i).padStart(5, '0')}`,
      })
    }

    const { result } = renderHook(() => useApplicationsCount())
    // Must return all 22 applications, matching the My Applications page
    expect(result.current).toBe(22)
  })

  it('updates count in real time when a new application is saved', () => {
    const { result } = renderHook(() => useApplicationsCount())
    expect(result.current).toBe(0)

    act(() => {
      userStorage.saveUserApplication({
        id: 'app_new_1',
        code: 'ITR-2026-99001',
        title: 'ITR Filing',
        meta: 'AY 2026-27 · ₹50,000',
        statusLabel: 'Submitted',
        statusTone: 'info',
        progress: 30,
        icon: '📊',
        to: '/applications/track/ITR-2026-99001',
      })
    })

    // Immediately updates to 1 without needing reload
    expect(result.current).toBe(1)

    act(() => {
      userStorage.saveUserApplication({
        id: 'app_new_2',
        code: 'LOAN-2026-99002',
        title: 'Personal Loan',
        meta: 'Salaried · ₹5,00,000',
        statusLabel: 'Documents Received',
        statusTone: 'info',
        progress: 40,
        icon: '💰',
        to: '/applications/track/LOAN-2026-99002',
      })
    })

    // Immediately updates to 2
    expect(result.current).toBe(2)
  })

  it('updates count in real time when userStorage is cleared', () => {
    userStorage.saveUserApplication({
      id: 'app_temp',
      code: 'GST-2026-88001',
      title: 'GST Return',
      meta: 'Q1',
      statusLabel: 'Submitted',
      statusTone: 'info',
      progress: 20,
      icon: '📄',
      to: '/applications/track/GST-2026-88001',
    })

    const { result } = renderHook(() => useApplicationsCount())
    expect(result.current).toBe(1)

    act(() => {
      userStorage.clearUserApplications()
    })

    expect(result.current).toBe(0)
  })
})
