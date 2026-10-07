import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import './GSTFormSection.css'

export interface GSTFormSectionProps {
  id: string
  icon: ReactNode
  title: string
  subtitle?: string
  /** Field names inside this section — a section holding an error is always shown open */
  fields?: readonly string[]
  errors?: Record<string, string>
  collapsible?: boolean
  children: ReactNode
}

export const GSTFormSection = ({
  id,
  icon,
  title,
  subtitle,
  fields = [],
  errors = {},
  collapsible = false,
  children,
}: GSTFormSectionProps) => {
  const [expanded, setExpanded] = useState(true)
  const hasError = fields.some((field) => Boolean(errors[field]))
  const isOpen = !collapsible || expanded || hasError
  const titleId = `${id}-title`
  const bodyId = `${id}-body`

  const toggle = () => setExpanded((prev) => !prev)

  return (
    <section id={id} className="gst-section" aria-labelledby={titleId}>
      <header className={`gst-section__header ${isOpen ? 'gst-section__header--open' : ''}`}>
        <span className="gst-section__icon" aria-hidden="true">{icon}</span>
        <div className="gst-section__titles">
          <h2 id={titleId} className="gst-section__title">{title}</h2>
          {subtitle && <p className="gst-section__subtitle">{subtitle}</p>}
        </div>
        {collapsible && (
          <button
            type="button"
            className="gst-section__toggle"
            onClick={toggle}
            aria-expanded={isOpen}
            aria-controls={bodyId}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title}`}
          >
            <ChevronDown className={`gst-section__chevron ${isOpen ? 'gst-section__chevron--open' : ''}`} />
          </button>
        )}
      </header>
      <div id={bodyId} className="gst-section__body" hidden={!isOpen}>
        {children}
      </div>
    </section>
  )
}

export default GSTFormSection
