import { routePaths } from '../config/routePaths'

export const REDIRECT_PARAM = 'redirect'

interface LocationLike {
  pathname: string
  search?: string
  hash?: string
}

interface RedirectState {
  returnTo?: string
  from?: string
}

const AUTH_PATH_PREFIX = '/auth'

/** Only same-app, non-auth paths are allowed — blocks open redirects like //evil.com. */
export const isSafeRedirect = (path: unknown): path is string =>
  typeof path === 'string' &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.startsWith('/\\') &&
  !path.startsWith(AUTH_PATH_PREFIX)

/** Login URL that remembers the page the user was trying to open. */
export const buildLoginPath = ({ pathname, search = '', hash = '' }: LocationLike): string => {
  const target = `${pathname}${search}${hash}`
  if (!isSafeRedirect(target) || pathname === routePaths.dashboard) return routePaths.auth.login
  return `${routePaths.auth.login}?${REDIRECT_PARAM}=${encodeURIComponent(target)}`
}

/**
 * Complete-Profile URL that remembers the service the user started (e.g. /gst/registration),
 * so finishing the profile continues that workflow instead of landing on the dashboard.
 */
export const buildProfileCompletionPath = (returnTo?: string | null): string =>
  isSafeRedirect(returnTo)
    ? `${routePaths.auth.register}?${REDIRECT_PARAM}=${encodeURIComponent(returnTo)}`
    : routePaths.auth.register

/** Where to send the user after a successful sign-in: ?redirect=, then router state, then fallback. */
export const resolvePostLoginPath = (search: string, state: unknown, fallback: string): string => {
  const fromQuery = new URLSearchParams(search).get(REDIRECT_PARAM)
  const routerState = (state ?? {}) as RedirectState
  const candidates = [fromQuery, routerState.returnTo, routerState.from]
  return candidates.find(isSafeRedirect) ?? fallback
}
