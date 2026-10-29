import { env } from '@core/config'

import { customerSupportApi } from '../api/customerSupportApi'
import {
  INITIAL_SUPPORT_CONVERSATIONS,
  SECURITY_NOTICE_CONTENT,
  SUPPORT_CONTACT_METHODS,
  SUPPORT_EXECUTIVES,
} from '../constants/customerSupport.constants'
import type {
  SendMessagePayload,
  SupportContactMethod,
  SupportConversation,
  SupportExecutive,
  SupportFilters,
  SupportItem,
  SupportMessage,
} from '../types/customerSupport.types'

import { userStorage } from '@core/storage/userStorage'

const conversationsStore: Record<string, SupportConversation> = {
  ...INITIAL_SUPPORT_CONVERSATIONS,
}

const mockTickets: SupportItem[] = []

const formatTimeNow = (): string => {
  const now = new Date()
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const isTestEnv = (): boolean => {
  return typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || Boolean(process.env?.VITEST))
}

export const customerSupportService = {
  async list(filters?: SupportFilters): Promise<SupportItem[]> {
    if (!env.enableMocks) {
      try {
        const response = await customerSupportApi.list(filters)
        if (response?.data) return response.data
      } catch {
        // Fall back to local mock in dev/test/offline mode
      }
    }

    if (!isTestEnv()) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    return mockTickets.filter((item) => {
      if (filters?.status && item.status !== filters.status) return false
      if (
        filters?.search &&
        !item.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !item.reference.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  },

  async getExecutives(): Promise<SupportExecutive[]> {
    if (!env.enableMocks) {
      try {
        const response = await customerSupportApi.getExecutives()
        if (response && response.length > 0) return response
      } catch {
        // Fall back to local mock in dev/test/offline mode
      }
    }

    if (!isTestEnv()) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    return SUPPORT_EXECUTIVES
  },

  async getConversation(
    appId?: string,
    executiveId?: string
  ): Promise<SupportConversation> {
    if (!env.enableMocks) {
      try {
        const response = await customerSupportApi.getConversation(appId || 'default')
        if (response) return response
      } catch {
        // Fall back to local mock in dev/test/offline mode
      }
    }

    if (!isTestEnv()) {
      await new Promise((resolve) => setTimeout(resolve, 80))
    }

    const userApps = userStorage.getUserApplications()
    const fallbackApp = userApps[0]
    const resolvedAppRef = appId || fallbackApp?.code || 'General Helpdesk'
    const resolvedServiceTitle = fallbackApp?.title || 'TaxEdge Client Advisory'

    const targetKey =
      (appId && conversationsStore[appId] ? appId : null) ||
      Object.keys(conversationsStore).find((key) => {
        const conv = conversationsStore[key]
        return executiveId ? conv.executive.id === executiveId : false
      }) ||
      resolvedAppRef

    if (conversationsStore[targetKey]) {
      return conversationsStore[targetKey]
    }

    const matchingExec =
      SUPPORT_EXECUTIVES.find((exec) => exec.id === executiveId) ||
      SUPPORT_EXECUTIVES[0]

    const newConversation: SupportConversation = {
      id: `conv_${appId || fallbackApp?.id || 'general'}`,
      applicationId: appId || fallbackApp?.id || 'general',
      applicationRef: resolvedAppRef,
      serviceName: matchingExec.department || resolvedServiceTitle,
      dateLabel: `${resolvedAppRef} · ${new Date().toLocaleDateString(
        'en-GB',
        { day: 'numeric', month: 'long', year: 'numeric' }
      )}`,
      executive: matchingExec,
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          conversationId: `conv_${appId || fallbackApp?.id || 'general'}`,
          senderId: matchingExec.id,
          senderType: 'executive',
          senderName: matchingExec.name,
          text: `Hello! I am ${matchingExec.name}, your assigned executive. How can I assist you with your tax or business operations today?`,
          timestamp: new Date().toISOString(),
          formattedTime: formatTimeNow(),
          status: 'read',
        },
      ],
    }

    conversationsStore[appId || targetKey] = newConversation
    return newConversation
  },

  async sendMessage(payload: SendMessagePayload): Promise<SupportMessage> {
    if (!env.enableMocks) {
      try {
        const response = await customerSupportApi.sendMessage(payload)
        if (response) return response
      } catch {
        // Fall back to local mock in dev/test/offline mode
      }
    }

    if (!isTestEnv()) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    const newMessage: SupportMessage = {
      id: `msg_${Date.now()}`,
      conversationId: payload.conversationId,
      senderId: 'user_current',
      senderType: 'user',
      senderName: 'You',
      text: payload.text,
      timestamp: new Date().toISOString(),
      formattedTime: formatTimeNow(),
      status: 'delivered',
      attachments: payload.attachments,
    }

    Object.keys(conversationsStore).forEach((key) => {
      const conv = conversationsStore[key]
      if (conv.id === payload.conversationId) {
        conversationsStore[key] = {
          ...conv,
          messages: [...conv.messages, newMessage],
        }
      }
    })

    return newMessage
  },

  getContactMethods(): SupportContactMethod[] {
    return SUPPORT_CONTACT_METHODS
  },

  getSecurityNotice() {
    return SECURITY_NOTICE_CONTENT
  },
}
