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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="legal-page">
      {/* Simple Header: Logo on left, Print on right, thin light-gray bottom border */}
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

          <button
            type="button"
            className="legal-header__print-btn"
            onClick={handlePrint}
            aria-label="Print this document"
          >
            <svg
              className="legal-header__print-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span className="legal-header__print-text">Print</span>
          </button>
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
