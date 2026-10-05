import { appConfig } from '@core/config'
import type { LegalDocumentContent, LegalSection } from '../../content/legalContent'
import './LegalDocumentView.css'

export interface LegalDocumentViewProps {
  document: LegalDocumentContent
  /** Hide the H1 when the surrounding dialog already shows the title */
  showTitle?: boolean
}

const formatEffectiveDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(appConfig.defaultLocale, { day: 'numeric', month: 'long', year: 'numeric' })

const renderSection = (section: LegalSection) => (
  <section className="legal-doc__section" key={section.heading}>
    <h2 className="legal-doc__heading">{section.heading}</h2>
    {section.paragraphs.map((text) => (
      <p className="legal-doc__paragraph" key={text}>{text}</p>
    ))}
  </section>
)

/** Renders a legal policy (Terms / Privacy) for both the public page and the consent dialog. */
export const LegalDocumentView = ({ document, showTitle = true }: LegalDocumentViewProps) => (
  <article className="legal-doc" aria-label={document.title}>
    {showTitle && <h1 className="legal-doc__title">{document.title}</h1>}
    <p className="legal-doc__meta">Effective {formatEffectiveDate(document.effectiveDate)}</p>
    <p className="legal-doc__paragraph">{document.intro}</p>
    {document.sections.map(renderSection)}
  </article>
)

export default LegalDocumentView
