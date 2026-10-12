import { useCallback, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { classNames } from '@shared/utils'
import type { MarketingFaq } from '../../types/marketing.types'
import './FaqAccordion.css'

export interface FaqAccordionProps {
  items: MarketingFaq[]
  /** Item expanded on first render; defaults to the first question */
  defaultOpenId?: string | null
}

interface FaqItemProps {
  item: MarketingFaq
  isOpen: boolean
  onToggle: (id: string) => void
}

const FaqItem = ({ item, isOpen, onToggle }: FaqItemProps) => {
  const buttonId = `${item.id}-button`
  const panelId = `${item.id}-panel`

  return (
    <div className={classNames('mk-faq__item', isOpen && 'mk-faq__item--open')}>
      <h3 className="mk-faq__heading">
        <button
          id={buttonId}
          type="button"
          className="mk-faq__trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(item.id)}
        >
          <span>{item.question}</span>
          <ChevronDown className="mk-faq__chevron" aria-hidden="true" />
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={buttonId} className="mk-faq__panel" hidden={!isOpen}>
        <p className="mk-faq__answer">{item.answer}</p>
      </div>
    </div>
  )
}

/** Accessible single-open accordion */
export const FaqAccordion = ({ items, defaultOpenId }: FaqAccordionProps) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId === undefined ? items[0]?.id ?? null : defaultOpenId)

  const handleToggle = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id))
  }, [])

  return (
    <div className="mk-faq">
      {items.map((item) => (
        <FaqItem key={item.id} item={item} isOpen={openId === item.id} onToggle={handleToggle} />
      ))}
    </div>
  )
}
