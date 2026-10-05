import { Link, Navigate, useParams } from 'react-router-dom'
import { appConfig, routePaths } from '@core/config'
import { getLegalDocument } from '../../content/legalContent'
import { LegalDocumentView } from '../../components/LegalDocumentView/LegalDocumentView'
import './LegalPage.css'

/** Public page for /legal/:documentId — reachable signed in or out. */
export const LegalPage = () => {
  const { documentId } = useParams<{ documentId: string }>()
  const document = getLegalDocument(documentId)

  // Unknown policy slugs fall back to the Terms of Service rather than a dead end
  if (!document) return <Navigate to={routePaths.legal.terms} replace />

  return (
    <div className="legal-page">
      <header className="legal-page__header">
        <Link to={routePaths.root} className="legal-page__brand">
          <img src="/assets/images/taxedge-brand-icon.png" alt="" className="legal-page__brand-icon" />
          <span>{appConfig.name}</span>
        </Link>
      </header>
      <main className="legal-page__content">
        <LegalDocumentView document={document} />
      </main>
    </div>
  )
}

export default LegalPage
