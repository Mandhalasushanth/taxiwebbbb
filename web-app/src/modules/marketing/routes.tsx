import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

import { routePaths } from '@core/config'

// Lazy so signed-in users never download the marketing bundle (and vice versa)
const MarketingLayout = lazy(() => import('./layout/MarketingLayout'))
const HomePage = lazy(() => import('./pages/HomePage/HomePage'))
const PricingPage = lazy(() => import('./pages/PricingPage/PricingPage'))
const AboutPage = lazy(() => import('./pages/AboutPage/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage/ContactPage'))

/**
 * Public marketing site, reachable signed in or out.
 * "/" is an index route so it takes precedence over the dashboard's index redirect;
 * keep this group ahead of the guarded groups in routeConfig.
 */
export const marketingRoutes: RouteObject[] = [
  {
    path: routePaths.marketing.home,
    element: <MarketingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: routePaths.marketing.pricing, element: <PricingPage /> },
      { path: routePaths.marketing.about, element: <AboutPage /> },
      { path: routePaths.marketing.contact, element: <ContactPage /> },
    ],
  },
]
