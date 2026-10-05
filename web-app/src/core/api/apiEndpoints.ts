/**
 * Every server path in one place, grouped by domain.
 * Modules import from here instead of hard-coding URL strings.
 */
export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    sendOtp: '/auth/otp/send',
    verifyOtp: '/auth/otp/verify',
    setPasscode: '/auth/passcode',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    profile: '/auth/profile',
  },
  dashboard: {
    summary: '/dashboard/summary',
    quickServices: '/dashboard/quick-services',
  },
  gst: {
    list: '/gst/applications',
    detail: (id: string) => `/gst/applications/${id}`,
    register: '/gst/applications',
    returns: '/gst/returns',
    returnDetail: (id: string) => `/gst/returns/${id}`,
  },
  itr: {
    list: '/itr/filings',
    detail: (id: string) => `/itr/filings/${id}`,
  },
  loans: {
    list: '/loans/applications',
    detail: (id: string) => `/loans/applications/${id}`,
    products: '/loans/products',
  },
  insurance: {
    list: '/insurance/policies',
    detail: (id: string) => `/insurance/policies/${id}`,
  },
  payments: {
    list: '/payments',
    createOrder: '/payments/orders',
    verify: '/payments/verify',
    validateCoupon: '/payments/coupons/validate',
  },
  documents: {
    list: '/documents',
    upload: '/documents',
    detail: (id: string) => `/documents/${id}`,
  },
  applications: {
    list: '/applications',
    detail: (id: string) => `/applications/${id}`,
  },
  profile: {
    me: '/profile',
    update: '/profile',
    changePasscode: '/profile/passcode',
  },
  chat: {
    threads: '/chat/threads',
    messages: (threadId: string) => `/chat/threads/${threadId}/messages`,
  },
  support: {
    tickets: '/support/tickets',
    ticketDetail: (id: string) => `/support/tickets/${id}`,
    faqs: '/support/faqs',
    executives: '/support/executives',
    conversation: (appId: string) => `/support/conversations/${appId}`,
    messages: (conversationId: string) => `/support/conversations/${conversationId}/messages`,
  },
  staff: {
    dashboard: '/staff/dashboard',
    applications: '/staff/applications',
    applicationDetail: (id: string) => `/staff/applications/${id}`,
    applicationAssign: (id: string) => `/staff/applications/${id}/assignment`,
    applicationStage: (id: string) => `/staff/applications/${id}/status`,
    applicationQuery: (id: string) => `/staff/applications/${id}/queries`,
    applicationNote: (id: string) => `/staff/applications/${id}/notes`,
    customers: '/staff/customers',
    customerDetail: (id: string) => `/staff/customers/${id}`,
    assignments: '/staff/assignments',
    documents: '/staff/documents',
    reports: '/staff/reports',
    members: '/staff/members',
    memberDetail: (id: string) => `/staff/members/${id}`,
    services: '/staff/services',
    pricing: '/staff/pricing',
    notifications: '/staff/notifications',
    settings: '/staff/settings',
  },
} as const
