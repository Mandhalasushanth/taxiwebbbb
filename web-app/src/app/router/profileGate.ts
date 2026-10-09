import { routePaths } from '@core/config'

/**
 * Pages a signed-in customer may open before completing their profile.
 * Service landing pages are browsable (each service click shows the profile prompt);
 * everything below them (e.g. /gst/registration, /loans/home-loan) is gated.
 */
const PROFILE_FREE_EXACT_PATHS: readonly string[] = [
  routePaths.dashboard,
  routePaths.gst.root,
  routePaths.itr.root,
  routePaths.loans,
  routePaths.insurance,
  routePaths.incorporation.root,
  routePaths.incorporation.selectType,
  routePaths.business.root,
  routePaths.services,
  routePaths.allServices,
]

/** Account areas that hold no service data entry, including their sub-pages. */
const PROFILE_FREE_SECTIONS: readonly string[] = [
  routePaths.profile,
  routePaths.notifications,
  routePaths.support,
  routePaths.applications,
  routePaths.documents,
  routePaths.payments,
]

const normalize = (pathname: string): string =>
  pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname

export const isProfileFreePath = (pathname: string): boolean => {
  const path = normalize(pathname)
  return (
    PROFILE_FREE_EXACT_PATHS.includes(path) ||
    PROFILE_FREE_SECTIONS.some((section) => path === section || path.startsWith(`${section}/`))
  )
}

/** Router state that makes the dashboard open the "Complete Your Profile" prompt. */
export interface ProfilePromptState {
  openProfileModal: true
  returnTo: string
}

export const buildProfilePromptState = (pathname: string, search = ''): ProfilePromptState => ({
  openProfileModal: true,
  returnTo: `${pathname}${search}`,
})
