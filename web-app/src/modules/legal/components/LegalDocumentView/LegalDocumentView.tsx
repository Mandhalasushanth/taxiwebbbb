import React from 'react'
import { appConfig } from '@core/config'
import type { LegalDocumentContent, LegalSection } from '../../content/legalContent'
import './LegalDocumentView.css'

export interface LegalDocumentViewProps {
  document: LegalDocumentContent
  /** Hide the H1 when the surrounding dialog already shows the title */
  showTitle?: boolean
  /** Whether this is displayed as a full standalone webpage */
  isFullPage?: boolean
}

const formatEffectiveDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(appConfig.defaultLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

/** Converts email addresses and links in text into clickable anchor elements */
const renderTextWithLinks = (text: string): React.ReactNode => {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  const parts = text.split(emailRegex)

  if (parts.length === 1) {
    return text
  }

  return parts.map((part, index) => {
    if (emailRegex.test(part)) {
      return (
        <a key={index} href={`mailto:${part}`} className="legal-doc__link">
          {part}
        </a>
      )
    }
    return part
  })
}

const renderSection = (section: LegalSection) => (
  <section className="legal-doc__section" key={section.heading}>
    <h2 className="legal-doc__heading">{section.heading}</h2>
    {section.paragraphs.map((text, idx) => (
      <p
        className={`legal-doc__paragraph ${text.startsWith('• ') ? 'legal-doc__paragraph--bullet' : ''}`}
        key={idx}
      >
        {renderTextWithLinks(text)}
      </p>
    ))}
  </section>
)

/** Renders a legal policy (Terms / Privacy) for both the full webpage and the consent dialog. */
export const LegalDocumentView = ({
  document,
  showTitle = true,
  isFullPage = false,
}: LegalDocumentViewProps) => (
  <article className={`legal-doc ${isFullPage ? 'legal-doc--full-page' : ''}`} aria-label={document.title}>
    {showTitle && <h1 className="legal-doc__title">{document.title}</h1>}

    {/* Highlighted Lead / Intro Box (as shown in reference designs) */}
    <div className="legal-doc__intro-box" data-testid="legal-doc-intro-box">
      <p className="legal-doc__intro-box-text">
        {renderTextWithLinks(document.intro)}
      </p>
    </div>

    {/* Introduction Section */}
    <section className="legal-doc__intro-section">
      <h2 className="legal-doc__intro-heading">Introduction</h2>
      <p className="legal-doc__paragraph">
        Please review the following terms and guidelines carefully before accessing our platform or initiating any service engagement with {appConfig.name}.
      </p>
    </section>

    {/* Numbered Sections */}
    <div className="legal-doc__sections">
      {document.sections.map(renderSection)}
    </div>

    {/* Bottom Section */}
    {isFullPage && (
      <footer className="legal-doc__bottom">
        <div className="legal-doc__divider" />
        <p className="legal-doc__last-updated">
          Last updated: {formatEffectiveDate(document.effectiveDate)}
        </p>
        <p className="legal-doc__bottom-text">
          These {document.title} govern your relationship with {appConfig.name}. If you have any questions or require further assistance, please contact our support team at{' '}
          <a href={`mailto:${appConfig.supportEmail}`} className="legal-doc__link">
            {appConfig.supportEmail}
          </a>.
        </p>
      </footer>
    )}
  </article>
)

export default LegalDocumentView
