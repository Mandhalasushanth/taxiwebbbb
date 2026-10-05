import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { buildProfileCompletionPath } from '@core/auth'
import { useAuthStore } from '@store/index'
import { CompleteProfileModal } from '@shared/components'
import { companyRegistrationData } from '../../data/companyRegistrationData'
import type { CompanyRegistrationTab } from '../../types/incorporation.types'
import './CompanyRegistration.css'

export const CompanyRegistration: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<CompanyRegistrationTab>('overview')
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleApplyClick = () => {
    if (!user?.isProfileComplete) {
      setIsProfileModalOpen(true)
    } else {
      navigate(routePaths.incorporation.selectType)
    }
  }

  const handleConfirmProfile = () => {
    setIsProfileModalOpen(false)
    navigate(buildProfileCompletionPath(routePaths.incorporation.selectType), {
      state: { returnTo: routePaths.incorporation.selectType, mobile: user?.mobile },
    })
  }

  return (
    <div className="company-reg-page">
      {/* Top Header Card */}
      <section className="company-reg-header">
        <div className="company-reg-header__left">
          <div className="company-reg-header__icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="30" height="30">
              {/* Left shorter building */}
              <rect x="3" y="9" width="8" height="12" rx="1.5" />
              <line x1="5.5" y1="12" x2="6.5" y2="12" strokeWidth="2" />
              <line x1="8.5" y1="12" x2="9.5" y2="12" strokeWidth="2" />
              <line x1="5.5" y1="15" x2="6.5" y2="15" strokeWidth="2" />
              <line x1="8.5" y1="15" x2="9.5" y2="15" strokeWidth="2" />
              <line x1="5.5" y1="18" x2="6.5" y2="18" strokeWidth="2" />
              <line x1="8.5" y1="18" x2="9.5" y2="18" strokeWidth="2" />

              {/* Right taller building */}
              <rect x="13" y="4" width="8" height="17" rx="1.5" />
              <line x1="15.5" y1="7.5" x2="16.5" y2="7.5" strokeWidth="2" />
              <line x1="18.5" y1="7.5" x2="19.5" y2="7.5" strokeWidth="2" />
              <line x1="15.5" y1="11" x2="16.5" y2="11" strokeWidth="2" />
              <line x1="18.5" y1="11" x2="19.5" y2="11" strokeWidth="2" />
              <line x1="15.5" y1="14.5" x2="16.5" y2="14.5" strokeWidth="2" />
              <line x1="18.5" y1="14.5" x2="19.5" y2="14.5" strokeWidth="2" />
              <line x1="15.5" y1="18" x2="16.5" y2="18" strokeWidth="2" />
              <line x1="18.5" y1="18" x2="19.5" y2="18" strokeWidth="2" />
            </svg>
          </div>
          <div className="company-reg-header__titles">
            <div className="company-reg-header__title-row">
              <h1 className="company-reg-header__title">{companyRegistrationData.title}</h1>
              <span className="company-reg-header__badge">{companyRegistrationData.category}</span>
            </div>
            <p className="company-reg-header__desc">{companyRegistrationData.description}</p>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <nav className="company-reg-tabs-bar" aria-label="Company registration details">
        <button
          type="button"
          className={`company-reg-tab ${activeTab === 'overview' ? 'company-reg-tab--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`company-reg-tab ${activeTab === 'documents' ? 'company-reg-tab--active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
        <button
          type="button"
          className={`company-reg-tab ${activeTab === 'benefits' ? 'company-reg-tab--active' : ''}`}
          onClick={() => setActiveTab('benefits')}
        >
          Benefits
        </button>
      </nav>

      {/* Content Card */}
      <main className="company-reg-card">
        {activeTab === 'overview' && (
          <div>
            <h2 className="company-reg-card__title">{companyRegistrationData.overview.heading}</h2>
            <p className="company-reg-card__body">{companyRegistrationData.overview.content}</p>

            <div className="company-reg-highlights">
              <div className="company-reg-highlight-box">
                <span className="company-reg-highlight-box__icon">🏛️</span>
                <div>
                  <h3 className="company-reg-highlight-box__title">MCA & ROC Certified</h3>
                  <p className="company-reg-highlight-box__desc">Direct SPICe+ Part A & B filing on official government portals.</p>
                </div>
              </div>
              <div className="company-reg-highlight-box">
                <span className="company-reg-highlight-box__icon">👨‍💼</span>
                <div>
                  <h3 className="company-reg-highlight-box__title">Chartered Accountant Support</h3>
                  <p className="company-reg-highlight-box__desc">Dedicated CA/CS verifies credentials, drafts e-MoA & e-AoA.</p>
                </div>
              </div>
              <div className="company-reg-highlight-box">
                <span className="company-reg-highlight-box__icon">⚡</span>
                <div>
                  <h3 className="company-reg-highlight-box__title">Fast 7-Day Turnaround</h3>
                  <p className="company-reg-highlight-box__desc">Quick Certificate of Incorporation (COI) issuance with PAN & TAN.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h2 className="company-reg-card__title">{companyRegistrationData.documents.heading}</h2>
            <p className="company-reg-card__subtitle">{companyRegistrationData.documents.subheading}</p>
            <div className="company-reg-grid">
              {companyRegistrationData.documents.items.map((doc, idx) => (
                <div key={idx} className="company-reg-grid-item">
                  <span className="company-reg-grid-item__icon--check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="company-reg-grid-item__text">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div>
            <h2 className="company-reg-card__title">{companyRegistrationData.benefits.heading}</h2>
            <p className="company-reg-card__subtitle">{companyRegistrationData.benefits.subheading}</p>
            <div className="company-reg-grid">
              {companyRegistrationData.benefits.items.map((benefit, idx) => (
                <div key={idx} className="company-reg-grid-item">
                  <span className="company-reg-grid-item__icon--sparkle">
                    <svg viewBox="0 0 24 24" fill="#ea580c" width="20" height="20">
                      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                    </svg>
                  </span>
                  <span className="company-reg-grid-item__text">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom CTA Banner */}
      <section className="company-reg-bottom-cta">
        <div>
          <h2 className="company-reg-bottom-cta__title">Ready to launch your company?</h2>
          <p className="company-reg-bottom-cta__desc">Get your Certificate of Incorporation, PAN, TAN & Bank Account setup swiftly.</p>
        </div>
        <button type="button" className="company-reg-bottom-cta__btn" onClick={handleApplyClick}>
          Apply Now &rarr;
        </button>
      </section>

      {/* Profile Completion Modal */}
      {isProfileModalOpen && (
        <CompleteProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onCompleteProfile={handleConfirmProfile}
        />
      )}
    </div>
  )
}

export default CompanyRegistration
