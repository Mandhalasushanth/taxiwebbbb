// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { receiptService } from './receiptService'
import { authStorage } from '@core/auth'
import { userStorage } from '@core/storage/userStorage'

describe('receiptService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('generates tax receipt using unified Customer ID logic (incomplete profile)', async () => {
    vi.spyOn(authStorage, 'getUser').mockReturnValue({
      id: 'usr_abc_999',
      fullName: 'User (9876543210)',
      mobile: '9876543210',
      isProfileComplete: false,
    } as any)

    vi.spyOn(userStorage, 'getUserApplications').mockReturnValue([
      {
        id: 'app-gst-1',
        code: 'GST-2026-00045',
        title: 'GST Registration',
        finalizedCharges: {
          total: 2950,
          serviceFee: 2500,
          govFees: 0,
          gst: 450,
          finalizedAt: 'today',
          finalizedBy: 'Staff',
        },
      } as any,
    ])

    const receipt = await receiptService.getReceipt('GST-2026-00045')

    expect(receipt).toBeDefined()
    expect(receipt.invoiceDetails.customerId).toBe('TX-543210')
    expect(receipt.companyName).toBe('TaxEdge Fin Solutions')
    expect(receipt.companyGstin).toContain('GSTIN')
    expect(receipt.lineItems[0].title).toBe('GST Registration Filing')
    expect(receipt.taxBreakdown.totalPaid).toBe('₹2,950')
  })

  it('generates tax receipt using permanent Customer ID for completed profile', async () => {
    vi.spyOn(authStorage, 'getUser').mockReturnValue({
      id: 'usr_650681',
      fullName: 'Rahul Sharma',
      mobile: '9876543210',
      isProfileComplete: true,
    } as any)

    vi.spyOn(userStorage, 'getUserApplications').mockReturnValue([])

    const receipt = await receiptService.getReceipt('GST-2026-10001')

    expect(receipt).toBeDefined()
    expect(receipt.invoiceDetails.customerId).toBe('TX-650681')
    expect(receipt.billedTo.name).toBe('Rahul Sharma')
  })
})
