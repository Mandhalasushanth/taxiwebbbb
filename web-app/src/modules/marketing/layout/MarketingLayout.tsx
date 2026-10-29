import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Loader, ScrollToTop } from '@shared/components'
import { ScrollIndicators } from '../components/ScrollIndicators/ScrollIndicators'
import { useHashScroll } from '../hooks/useHashScroll'
import { MarketingFooter } from './MarketingFooter'
import { MarketingHeader } from './MarketingHeader'
import '../marketing.css'

const MAIN_CONTENT_ID = 'mk-main'

/** Public shell for the marketing site: sticky header, page content, footer. */
export const MarketingLayout = () => {
  useHashScroll()

  return (
    <div className="mk-site">
      <ScrollToTop />
      <a href={`#${MAIN_CONTENT_ID}`} className="mk-skip-link">
        Skip to content
      </a>
      <MarketingHeader />
      <main id={MAIN_CONTENT_ID} className="mk-main">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
      <MarketingFooter />
      <ScrollIndicators />
    </div>
  )
}

export default MarketingLayout
