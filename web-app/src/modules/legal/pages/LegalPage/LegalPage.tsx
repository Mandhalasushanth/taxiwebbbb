import { Link, Navigate, useParams } from 'react-router-dom'
import { appConfig, routePaths } from '@core/config'
import { getLegalDocument } from '../../content/legalContent'
import { LegalDocumentView } from '../../components/LegalDocumentView/LegalDocumentView'
import './LegalPage.css'

/** Public full-page view for /legal/:documentId (Terms of Service, Privacy Policy) */
export const LegalPage = () => {
  const { documentId } = useParams<{ documentId: string }>()
  const document = getLegalDocument(documentId)

  // Unknown policy slugs fall back to the Terms of Service rather than a dead end
  if (!document) return <Navigate to={routePaths.legal.terms} replace />

  return (
    <div className="legal-page">
      {/* Simple Header: Logo on left, thin light-gray bottom border */}
      <header className="legal-header">
        <div className="legal-header__inner">
          <Link
            to={routePaths.root}
            className="legal-header__brand"
            aria-label={`${appConfig.name} Home`}
          >
            <img
              src="/finsolz-icon.png"
              alt=""
              className="legal-header__brand-icon"
              width={32}
              height={32}
            />
            <span className="legal-header__brand-name">{appConfig.name}</span>
          </Link>
        </div>
      </header>

      {/* Main Content: Full-width webpage layout, left-aligned, pure white background */}
      <main className="legal-page__main">
        <div className="legal-page__container">
          <LegalDocumentView document={document} showTitle={true} isFullPage={true} />
        </div>
      </main>
    </div>
  )
}

export default LegalPage
