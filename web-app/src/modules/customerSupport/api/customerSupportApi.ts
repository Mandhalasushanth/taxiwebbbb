import { apiClient } from '@core/api'
import type { ApiResponse } from '@shared/types'

import type {
  SendMessagePayload,
  SupportConversation,
  SupportExecutive,
  SupportFilters,
  SupportItem,
  SupportMessage,
} from '../types/customerSupport.types'

export const customerSupportApi = {
  list(filters?: SupportFilters): Promise<ApiResponse<SupportItem[]>> {
    return apiClient.get('/support', { params: filters })
  },

  getExecutives(): Promise<SupportExecutive[]> {
    return apiClient.get<{ data: SupportExecutive[] }>('/support/executives').then((res) => res.data)
  },

  getConversation(applicationId: string): Promise<SupportConversation> {
    return apiClient.get<{ data: SupportConversation }>(`/support/conversations/${applicationId}`).then((res) => res.data)
  },

  sendMessage(payload: SendMessagePayload): Promise<SupportMessage> {
    return apiClient.post<{ data: SupportMessage }>('/support/messages', payload).then((res) => res.data)
  },
}
