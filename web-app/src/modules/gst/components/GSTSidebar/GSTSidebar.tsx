import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routePaths } from '@core/config'
import './GSTSidebar.css'

export interface GSTSidebarProps {
  step?: number
}

interface FaqItem {
  id: string
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What is GST registration?',
    answer:
      'GST registration is a mandatory process where a business registers under the Goods and Services Tax framework, receiving a unique 15-digit GSTIN to legally collect and remit tax.',
  },
  {
    id: 'faq-2',
    question: 'Who is required to register for GST?',
    answer:
      'Any business with annual aggregate turnover exceeding ₹40 Lakhs for goods (₹20 Lakhs for special states) or ₹20 Lakhs for services, inter-state suppliers, and e-commerce sellers.',
  },
  {
    id: 'faq-3',
    question: 'What documents are needed?',
    answer:
      'PAN card of business/signatory, Aadhaar card, proof of business address (electricity bill/rent agreement), cancelled cheque/bank statement, and passport photo.',
  },
  {
    id: 'faq-4',
    question: 'How long does the process take?',
    answer:
      'After application submission and Aadhaar authentication, GST verification usually takes 3 to 7 working days for the GSTIN certificate to be issued.',
  },
]

export const GSTSidebar = ({ step: _step }: GSTSidebarProps) => {
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id))
  }

  return (
    <aside className="gst-reg-sidebar-wrapper" aria-label="Help & Information Sidebar">
      {/* 1. Slogan & Illustration Promo Card */}
      <div className="gst-sidebar-promo-card">
        <div className="gst-sidebar-promo-card__illustration">
          <div className="gst-promo-graphic">
            {/* 3D-styled GST Doc & Calculator Graphic */}
            <div className="gst-promo-sheet">
              <div className="gst-promo-sheet__badge">GST</div>
              <div className="gst-promo-sheet__line">
                <span className="gst-promo-check">✓</span>
                <span className="gst-promo-bar"></span>
              </div>
              <div className="gst-promo-sheet__line">
                <span className="gst-promo-check">✓</span>
                <span className="gst-promo-bar"></span>
              </div>
              <div className="gst-promo-sheet__line">
                <span className="gst-promo-check">✓</span>
                <span className="gst-promo-bar"></span>
              </div>
              <div className="gst-promo-verified-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="gst-promo-verified-icon">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <div className="gst-promo-calc">
              <div className="gst-promo-calc__screen"></div>
              <div className="gst-promo-calc__grid">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
              </div>
            </div>

            <div className="gst-promo-plant">
              <div className="gst-promo-plant__leaf gst-promo-plant__leaf--1"></div>
              <div className="gst-promo-plant__leaf gst-promo-plant__leaf--2"></div>
              <div className="gst-promo-plant__pot"></div>
            </div>
          </div>
        </div>

        <div className="gst-sidebar-promo-card__content">
          <p className="gst-sidebar-promo-card__quote">
            Simplifying<br />
            Taxes for a<br />
            Brighter Tomorrow
          </p>
        </div>
      </div>

      {/* 2. Need Help? Card */}
      <div className="gst-sidebar-help-card">
        <div className="gst-sidebar-help-card__icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gst-sidebar-bulb-icon">
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
          </svg>
        </div>

        <div className="gst-sidebar-help-card__content">
          <h3 className="gst-sidebar-help-card__title">Need Help?</h3>
          <p className="gst-sidebar-help-card__text">
            Our experts are here to assist you with your GST registration.
          </p>
          <Link to={routePaths.support} className="gst-sidebar-help-card__link">
            <span>Chat with us</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>

      {/* 3. Frequently Asked Questions Card */}
      <div className="gst-sidebar-faq-card">
        <h3 className="gst-sidebar-faq-card__title">Frequently Asked Questions</h3>

        <div className="gst-sidebar-faq-list">
          {FAQ_ITEMS.map((faq) => {
            const isOpen = openFaq === faq.id
            return (
              <div key={faq.id} className={`gst-faq-item ${isOpen ? 'gst-faq-item--open' : ''}`}>
                <button
                  type="button"
                  className="gst-faq-question-btn"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span className="gst-faq-question-text">{faq.question}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="gst-faq-chevron"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="gst-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default GSTSidebar
