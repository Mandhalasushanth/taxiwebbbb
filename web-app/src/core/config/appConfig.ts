import { env } from './environment'

export const appConfig = {
  name: env.appName,
  supportEmail: 'support@taxedge.in',
  defaultLocale: 'en-IN',
  currency: 'INR',
  dateFormat: 'dd MMM yyyy',
  session: {
    idleTimeoutMs: env.sessionTimeoutMinutes * 60 * 1000,
    /** How often user activity is persisted (shared across tabs). */
    activityWriteThrottleMs: 15 * 1000,
    /** How often the idle state is checked. */
    idleCheckIntervalMs: 30 * 1000,
  },
} as const
