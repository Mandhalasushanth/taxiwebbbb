import { env, routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { applicationsApi } from '../api/applicationsApi'
import type { ApplicationsFilters, ApplicationsItem } from '../types/applications.types'

export const applicationsService = {
  async list(filters?: ApplicationsFilters): Promise<ApplicationsItem[]> {
    if (!env.enableMocks) {
      try {
        const response = await applicationsApi.list(filters)
        if (response.data && response.data.length > 0) {
          return response.data
        }
      } catch {
        // Backend API not reachable (dev/offline mode) — fall back to locally saved user applications
      }
    }

    const userApps = userStorage.getUserApplications()

    const mappedUserApps: ApplicationsItem[] = userApps.map((a) => {
      const lower = a.title.toLowerCase()
      const isItr = lower.includes('itr')
      const isLoan = lower.includes('loan')
      const isInsurance = lower.includes('insurance')
      const isCompany = lower.includes('incorporation') || lower.includes('company')
      const isBusiness = lower.includes('business')

      let cat: ApplicationsItem['category'] = 'GST'
      if (isItr) cat = 'ITR'
      else if (isLoan) cat = 'Loans'
      else if (isCompany) cat = 'Company Registration'
      else if (isBusiness) cat = 'Business'
      else if (isInsurance) cat = 'Insurance'

      return {
        id: a.id,
        reference: a.code,
        title: a.title,
        category: cat,
        status: (a.statusLabel.toUpperCase().replace(/\s+/g, '_')) || 'UNDER_VERIFICATION',
        statusLabel: a.statusLabel || 'Under Verification',
        date: 'Today',
        to: a.code ? routePaths.applicationTrack(a.code) : (a.to || `${routePaths.gst.registration}?step=status`),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    // Return ONLY user-filled applications — no mock or default applications
    if (filters?.category && filters.category !== 'All') {
      return mappedUserApps.filter((app) => app.category === filters.category)
    }

    return mappedUserApps
  },
}
