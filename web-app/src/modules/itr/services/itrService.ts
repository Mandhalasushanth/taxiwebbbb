import { env } from '@core/config'
import { apiClient, apiEndpoints } from '@core/api'
import { userStorage } from '@core/storage/userStorage'
import type { ApiListResponse } from '@shared/types'
import type { ItrFilters, ItrItem, ItrServiceCard } from '../types/itr.types'

export const ITR_SERVICES_LIST: ItrServiceCard[] = [
  {
    id: 'service_itr_filing',
    title: 'ITR Filing',
    description: 'Income tax return for salaried, business and professional income.',
    pricing: '₹3,000 from',
    timeline: '3-5 working days',
    icon: 'bar',
    viewKey: 'itr-filing',
  },
  {
    id: 'service_tds_refund',
    title: 'TDS Refund',
    description: 'Claim excess TDS deducted, with a refund estimate up front.',
    pricing: '15% of refund',
    timeline: '20-45 days to credit',
    icon: 'rupee',
    viewKey: 'tds-refund',
  },
  // Disabled: Previous Year ITR / Tax Notice Assistance are not offered right now.
//   {
//     id: 'service_previous_year',
//     title: 'Previous Year ITR',
//     description: 'Belated or updated return for an earlier assessment year.',
//     pricing: '₹3,500 per year',
//     timeline: '5-7 working days',
//     icon: 'clock',
//     viewKey: 'previous-year-itr',
//   },
  {
    id: 'service_revised_itr',
    title: 'Revised ITR',
    description: 'Correct a return already filed for this assessment year.',
    pricing: '₹2,500 per return',
    timeline: '3-5 working days',
    icon: 'document',
    viewKey: 'revised-itr',
  },
  // Disabled: Previous Year ITR / Tax Notice Assistance are not offered right now.
//   {
//     id: 'service_tax_notice',
//     title: 'Tax Notice Assistance',
//     description: 'Reply to a 143(1), 139(9) or scrutiny notice with a CA.',
//     pricing: '₹5,500 from',
//     timeline: 'Within notice deadline',
//     icon: 'warning',
//     viewKey: 'tax-notice-assistance',
//   },
]

export const listItrApplications = async (filters?: ItrFilters): Promise<ItrItem[]> => {
  try {
    if (env.enableMocks) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const userApps = userStorage
        .getUserApplications()
        .filter((a) => a.title.toLowerCase().includes('itr'))
      return userApps.map((a) => ({
        id: a.id,
        reference: a.code || a.id,
        title: a.title,
        status: (a.statusLabel.toUpperCase().replace(/\s+/g, '_') as ItrItem['status']) || 'SUBMITTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    }
    const response = await apiClient.get<ApiListResponse<ItrItem>>(apiEndpoints.itr.list, {
      params: filters,
    })
    return response.data
  } catch {
    return []
  }
}

export const itrService = {
  list: listItrApplications,
}
