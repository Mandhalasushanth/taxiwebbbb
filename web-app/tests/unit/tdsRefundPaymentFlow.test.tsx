// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userStorage } from '../../src/core/storage/userStorage'
import { buildUserDashboardSummary } from '../../src/modules/dashboard/services/dashboardService'
import { getApplicationTrackerData } from '../../src/modules/applications/data/applicationTrackerData'
import { formatCurrency } from '../../src/shared/utils'
import { TdsRefundProgressTracker } from '../../src/modules/itr/components/TdsRefund/TdsRefundOverview'

describe('TDS Refund Payment Flow & Manager Charge Finalization', () => {
  beforeEach(() => {
    userStorage.clearUserApplications()
  })

  it('1. submits TDS application without upfront payment and marks as Under CA Review with Charges Pending', () => {
    const tdsRef = 'TDS-2026-11223'
    userStorage.saveUserApplication({
      id: 'app-tds-1',
      code: tdsRef,
      title: 'TDS Refund',
      meta: 'Sagarika Jena · ₹25,000',
      statusLabel: 'Under CA Review',
      statusTone: 'info',
      progress: 25,
      icon: '💰',
      to: `/applications/track/${tdsRef}`,
      chargesFinalized: false,
      paymentStatus: 'Charges Pending',
    })

    const apps = userStorage.getUserApplications()
    expect(apps).toHaveLength(1)
    expect(apps[0].code).toBe(tdsRef)
    expect(apps[0].statusLabel).toBe('Under CA Review')
    expect(apps[0].chargesFinalized).toBe(false)
    expect(apps[0].paymentStatus).toBe('Charges Pending')
  })

  it('2. excludes unfinalized TDS application from Dashboard Payment Due', () => {
    const tdsRef = 'TDS-2026-11224'
    userStorage.saveUserApplication({
      id: 'app-tds-2',
      code: tdsRef,
      title: 'TDS Refund',
      meta: 'Sagarika Jena · ₹15,000',
      statusLabel: 'Under CA Review',
      statusTone: 'info',
      progress: 25,
      icon: '💰',
      to: `/applications/track/${tdsRef}`,
      chargesFinalized: false,
      paymentStatus: 'Charges Pending',
    })

    const summary = buildUserDashboardSummary()
    const paymentStat = summary.stats.find((s) => s.id === 'payment-due')

    // Payment due should be formatCurrency(0) and 0 pending payment tasks
    expect(paymentStat?.value).toBe(formatCurrency(0))
    expect(paymentStat?.tone).toBe('success')
    expect(summary.brief.paymentDue).toBe(formatCurrency(0))
    expect(summary.pendingTasks).toHaveLength(0)
  })

  it('3. tracker displays Charges Pending and prevents payment before charges are finalized', () => {
    const tdsRef = 'TDS-2026-11225'
    userStorage.saveUserApplication({
      id: 'app-tds-3',
      code: tdsRef,
      title: 'TDS Refund',
      meta: 'Sagarika Jena · ₹18,000',
      statusLabel: 'Under CA Review',
      statusTone: 'info',
      progress: 25,
      icon: '💰',
      to: `/applications/track/${tdsRef}`,
      chargesFinalized: false,
      paymentStatus: 'Charges Pending',
    })

    const trackerData = getApplicationTrackerData(tdsRef)
    expect(trackerData).not.toBeNull()
    expect(trackerData?.paymentSummary.paymentStatus).toBe('Charges Pending')
    expect(trackerData?.paymentSummary.totalAmount).toBe('Charges Pending')
    expect(trackerData?.paymentSummary.serviceFee).toBe('Pending CA Review')
    expect(trackerData?.chargesFinalized).toBe(false)
  })

  it('4. manager finalizes individual charges and calculates total correctly (Service + Govt + GST)', () => {
    const tdsRef = 'TDS-2026-11226'
    userStorage.saveUserApplication({
      id: 'app-tds-4',
      code: tdsRef,
      title: 'TDS Refund',
      meta: 'Sagarika Jena · ₹30,000',
      statusLabel: 'Under CA Review',
      statusTone: 'info',
      progress: 25,
      icon: '💰',
      to: `/applications/track/${tdsRef}`,
      chargesFinalized: false,
      paymentStatus: 'Charges Pending',
    })

    // Manager finalizes charges: Service Fee 847, Govt Fee 0, GST 152 => Total 999
    const updated = userStorage.finalizeApplicationCharges(tdsRef, {
      serviceFee: 847,
      govFees: 0,
      gst: 152,
      total: 999,
      finalizedAt: new Date().toISOString(),
      finalizedBy: 'Priya Nair (Manager)',
    })

    expect(updated).not.toBeNull()
    expect(updated?.chargesFinalized).toBe(true)
    expect(updated?.paymentStatus).toBe('Pending')
    expect(updated?.statusLabel).toBe('Payment Due')
    expect(updated?.finalizedCharges?.total).toBe(999)
    expect(updated?.finalizedCharges?.finalizedBy).toBe('Priya Nair (Manager)')
  })

  it('5. different TDS applications can have different finalized charge amounts', () => {
    const appA = 'TDS-2026-APP-A'
    const appB = 'TDS-2026-APP-B'

    userStorage.saveUserApplication({
      id: 'app-a',
      code: appA,
      title: 'TDS Refund',
      meta: 'User A · ₹10,000',
      statusLabel: 'Under CA Review',
      statusTone: 'info',
      progress: 25,
      icon: '💰',
      to: `/applications/track/${appA}`,
      chargesFinalized: false,
      paymentStatus: 'Charges Pending',
    })

    userStorage.saveUserApplication({
      id: 'app-b',
      code: appB,
      title: 'TDS Refund',
      meta: 'User B · ₹50,000',
      statusLabel: 'Under CA Review',
      statusTone: 'info',
      progress: 25,
      icon: '💰',
      to: `/applications/track/${appB}`,
      chargesFinalized: false,
      paymentStatus: 'Charges Pending',
    })

    // App A finalized with ₹999
    userStorage.finalizeApplicationCharges(appA, {
      serviceFee: 847,
      govFees: 0,
      gst: 152,
      total: 999,
      finalizedAt: new Date().toISOString(),
      finalizedBy: 'Priya Nair (Manager)',
    })

    // App B finalized with ₹1,999 (complex business return)
    userStorage.finalizeApplicationCharges(appB, {
      serviceFee: 1694,
      govFees: 0,
      gst: 305,
      total: 1999,
      finalizedAt: new Date().toISOString(),
      finalizedBy: 'Priya Nair (Manager)',
    })

    const trackerA = getApplicationTrackerData(appA)
    const trackerB = getApplicationTrackerData(appB)

    expect(trackerA?.paymentSummary.totalAmount).toBe('₹999')
    expect(trackerB?.paymentSummary.totalAmount).toBe('₹1,999')
  })

  it('6. dashboard Payment Due accurately reflects finalized pending amounts and adds task with payments link', async () => {
    const tdsRef = 'TDS-2026-11227'
    userStorage.saveUserApplication({
      id: 'app-tds-6',
      code: tdsRef,
      title: 'TDS Refund',
      meta: 'Sagarika Jena · ₹40,000',
      statusLabel: 'Under CA Review',
      statusTone: 'info',
      progress: 25,
      icon: '💰',
      to: `/applications/track/${tdsRef}`,
      chargesFinalized: false,
      paymentStatus: 'Charges Pending',
    })

    // Before finalization: Payment Due is formatCurrency(0)
    let summary = buildUserDashboardSummary()
    expect(summary.brief.paymentDue).toBe(formatCurrency(0))

    // Finalize charges: 999
    userStorage.finalizeApplicationCharges(tdsRef, {
      serviceFee: 847,
      govFees: 0,
      gst: 152,
      total: 999,
      finalizedAt: new Date().toISOString(),
      finalizedBy: 'Priya Nair (Manager)',
    })

    // After finalization: Payment Due reflects formatCurrency(999)
    summary = buildUserDashboardSummary()
    expect(summary.brief.paymentDue).toBe(formatCurrency(999))
    const paymentStat = summary.stats.find((s) => s.id === 'payment-due')
    expect(paymentStat?.value).toBe(formatCurrency(999))
    expect(paymentStat?.tone).toBe('danger')

    // Task points directly to the application tracker payments tab
    expect(summary.pendingTasks).toHaveLength(1)
    expect(summary.pendingTasks[0].actionTo).toBe(`/applications/track/${tdsRef}?tab=payments`)
  })

  it('7. recording payment transitions status to Paid, excludes from dashboard, and saves transaction id', async () => {
    const tdsRef = 'TDS-2026-11228'
    userStorage.saveUserApplication({
      id: 'app-tds-7',
      code: tdsRef,
      title: 'TDS Refund',
      meta: 'Sagarika Jena · ₹20,000',
      statusLabel: 'Under CA Review',
      statusTone: 'info',
      progress: 25,
      icon: '💰',
      to: `/applications/track/${tdsRef}`,
      chargesFinalized: false,
      paymentStatus: 'Charges Pending',
    })

    userStorage.finalizeApplicationCharges(tdsRef, {
      serviceFee: 847,
      govFees: 0,
      gst: 152,
      total: 999,
      finalizedAt: new Date().toISOString(),
      finalizedBy: 'Priya Nair (Manager)',
    })

    // Record payment
    const paidApp = userStorage.recordApplicationPayment(tdsRef, {
      transactionId: 'TXN-987654',
      paidAmount: 999,
      paymentMethod: 'UPI',
    })

    expect(paidApp?.paymentStatus).toBe('Paid')
    expect(paidApp?.transactionId).toBe('TXN-987654')

    // Tracker shows Paid status and transaction ID
    const tracker = getApplicationTrackerData(tdsRef)
    expect(tracker?.paymentSummary.paymentStatus).toBe('Paid')
    expect(tracker?.paymentSummary.transactionId).toBe('TXN-987654')

    // Dashboard Payment Due returns to formatCurrency(0)
    const summary = buildUserDashboardSummary()
    expect(summary.brief.paymentDue).toBe(formatCurrency(0))
    expect(summary.pendingTasks).toHaveLength(0)
  })

  it('8. preserves other services (GST, general ITR) payment behavior intact', async () => {
    // GST Application
    userStorage.saveUserApplication({
      id: 'gst-101',
      code: 'GST-2026-88899',
      title: 'GST Registration',
      meta: 'Apex Corp · Karnataka',
      statusLabel: 'Submitted',
      statusTone: 'info',
      progress: 20,
      icon: '📄',
      to: '/applications/track/GST-2026-88899',
    })

    // ITR Application
    userStorage.saveUserApplication({
      id: 'itr-101',
      code: 'ITR-2026-88899',
      title: 'ITR Filing - ITR-1 (Sahaj)',
      meta: 'Sagarika · Salary',
      statusLabel: 'Submitted',
      statusTone: 'info',
      progress: 20,
      icon: '📊',
      to: '/applications/track/ITR-2026-88899',
    })

    const gstTracker = getApplicationTrackerData('GST-2026-88899')
    const itrTracker = getApplicationTrackerData('ITR-2026-88899')

    expect(gstTracker?.category).toBe('GST')
    expect(itrTracker?.category).toBe('ITR')
    expect(gstTracker?.title).toBe('GST Registration')
    expect(itrTracker?.title).toContain('ITR-1')
  })

  it('9. renders exactly 3 steps in the TDS refund progress tracker and excludes step 4', () => {
    render(<TdsRefundProgressTracker currentStep={3} />)

    // Step 1, 2, and 3 must exist
    expect(screen.getByTestId('tds-step-1')).toBeInTheDocument()
    expect(screen.getByTestId('tds-step-2')).toBeInTheDocument()
    expect(screen.getByTestId('tds-step-3')).toBeInTheDocument()

    // Step labels
    expect(screen.getByText('Application Details')).toBeInTheDocument()
    expect(screen.getByText('Review & Submit')).toBeInTheDocument()
    expect(screen.getByText('Application Status')).toBeInTheDocument()

    // Step 4 must NOT exist
    expect(screen.queryByTestId('tds-step-4')).toBeNull()
    expect(screen.queryByText('Refund Credited')).toBeNull()
  })
})
