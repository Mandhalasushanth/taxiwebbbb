import { env, routePaths } from '@core/config'
import { userStorage } from '@core/storage/userStorage'
import { applicationsApi } from '../api/applicationsApi'
import type { ApplicationsFilters, ApplicationsItem } from '../types/applications.types'

export const applicationsService = {
  async list(filters?: ApplicationsFilters): Promise<ApplicationsItem[]> {
    if (env.enableMocks) {
      const userApps = userStorage.getUserApplications()

      const mappedUserApps: ApplicationsItem[] = userApps.map((a) => {
        const isItr = a.title.toLowerCase().includes('itr')
        const isLoan = a.title.toLowerCase().includes('loan')
        const isInsurance = a.title.toLowerCase().includes('insurance')
        let cat: ApplicationsItem['category'] = 'GST'
        if (isItr) cat = 'ITR'
        else if (isLoan) cat = 'Loans'
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
    }

    const response = await applicationsApi.list(filters)
    return response.data
  },
}
