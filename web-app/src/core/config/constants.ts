/** Application-wide constants. Domain constants belong in their module. */
export const STORAGE_KEYS = {
  accessToken: 'taxedge.accessToken',
  refreshToken: 'taxedge.refreshToken',
  user: 'taxedge.user',
  theme: 'taxedge.theme',
  registeredUsers: 'taxedge.registeredUsers',
  lastActivity: 'taxedge.lastActivity',
  sessionEndReason: 'taxedge.sessionEndReason',
} as const

export const HTTP_STATUS = {
  ok: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  unprocessable: 422,
  serverError: 500,
} as const

export const DEFAULT_PAGE_SIZE = 10
export const REQUEST_TIMEOUT_MS = 30_000
