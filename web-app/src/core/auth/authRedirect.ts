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

const FORBIDDEN_REDIRECT_PREFIXES = ['/auth', '/login'] as const

export const POST_LOGIN_REDIRECT_KEY = 'taxedge_post_login_redirect'

/** Safely store the intended return destination in sessionStorage for backup */
export const savePostLoginRedirect = (target: string): void => {
  try {
    if (typeof window !== 'undefined' && isSafeRedirect(target) && target !== routePaths.dashboard) {
      sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, target)
    }
  } catch {
    /* Ignore storage errors */
  }
}

/** Retrieve any saved post-login redirect destination from sessionStorage */
export const getSavedPostLoginRedirect = (): string | null => {
  try {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)
      if (stored && isSafeRedirect(stored) && stored !== routePaths.dashboard) {
        return stored
      }
    }
  } catch {
    /* Ignore storage errors */
  }
  return null
}

/** Clear saved post-login redirect destination from sessionStorage */
export const clearSavedPostLoginRedirect = (): void => {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
    }
  } catch {
    /* Ignore storage errors */
  }
}

/** Only same-app, non-auth paths are allowed — blocks open redirects like //evil.com. */
export const isSafeRedirect = (path: unknown): path is string =>
  typeof path === 'string' &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.startsWith('/\\') &&
  !FORBIDDEN_REDIRECT_PREFIXES.some((prefix) => path.startsWith(prefix))

/** Login URL that remembers the page the user was trying to open. */
export const buildLoginPath = ({ pathname, search = '', hash = '' }: LocationLike): string => {
  const target = `${pathname}${search}${hash}`
  if (!isSafeRedirect(target) || pathname === routePaths.dashboard) {
    clearSavedPostLoginRedirect()
    return routePaths.auth.login
  }
  savePostLoginRedirect(target)
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

/** Where to send the user after a successful sign-in: ?redirect=, then router state, then session backup, then fallback. */
export const resolvePostLoginPath = (search: string, state: unknown, fallback: string): string => {
  const fromQuery = new URLSearchParams(search).get(REDIRECT_PARAM)
  const routerState = (state ?? {}) as RedirectState
  const savedTarget = getSavedPostLoginRedirect()
  const candidates = [fromQuery, routerState.returnTo, routerState.from, savedTarget]
  const resolved = candidates.find(isSafeRedirect) ?? fallback
  clearSavedPostLoginRedirect()
  return resolved
}
