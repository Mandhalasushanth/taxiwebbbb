/// <reference types="node" />
/**
 * Typed access to Vite environment variables.
 * Never read import.meta.env anywhere else in the app.
 */
const required = (key: string, value: string | undefined): string => {
  if (!value) {
    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key] as string
    }
    if (typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || process.env?.VITEST)) {
      return 'http://localhost:3000'
    }
    throw new Error(`[env] Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'TaxEdge',
  apiBaseUrl: required('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
  enableMocks: import.meta.env.VITE_ENABLE_MOCKS === 'true',
  /** Idle minutes before automatic sign-out (defaults to 30). */
  sessionTimeoutMinutes: Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 30,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const

export type Env = typeof env
