import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { buildProfileCompletionPath } from '@core/auth'
import { useAuthStore } from '@store/index'
import { CompleteProfileModal } from '@shared/components'
import { useBusiness } from '../../hooks/useBusiness'
import type {
  BusinessCategory,
  BusinessServiceItem,
  BusinessComplianceItem,
  BusinessApplication,
} from '../../types/business.types'
import './Business.css'

export const BusinessPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredServices,
    stats,
    applications,
    complianceCalendar,
    handleApply,
  } = useBusiness()

  const onApplyClick = (serviceId: string) => {
    if (!user?.isProfileComplete) {
      setIsProfileModalOpen(true)
    } else {
      handleApply(serviceId)
    }
  }

  const handleConfirmProfile = () => {
    setIsProfileModalOpen(false)
    navigate(buildProfileCompletionPath(routePaths.business.root), {
      state: { returnTo: routePaths.business.root, mobile: user?.mobile },
    })
  }

  const categories: { id: BusinessCategory; label: string }[] = [
    { id: 'all', label: 'All Services' },
    { id: 'registrations', label: 'Govt Registrations' },
    { id: 'licenses', label: 'Operational Licenses' },
    { id: 'ip', label: 'Intellectual Property' },
    { id: 'compliance', label: 'ROC & Annual Filings' },
  ]

  return (
    <div className="biz-page">
      {/* 1. Hero Section */}
      <section className="biz-hero">
        <div className="biz-hero__badge">
          <span>🛡️</span> All-in-One Business Operations & Compliance
        </div>
        <h1 className="biz-hero__title">Business Licenses & Regulatory Services</h1>
        <p className="biz-hero__subtitle">
          Manage MSME Udyam, FSSAI, Import Export Code, Trademarks, Professional Tax, and ROC annual
          compliances with expert CA/CS guidance.
        </p>

        <div className="biz-hero__search-card">
          <div className="biz-hero__search-row">
            <input
              type="text"
              placeholder="Search licenses, filings, certifications (e.g. FSSAI, Trademark, MSME)..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="biz-hero__input"
            />
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Grid */}
      <section className="biz-stats-grid">
        <div className="biz-stat-card">
          <div className="biz-stat-card__icon biz-stat-card__icon--green">📋</div>
          <div>
            <div className="biz-stat-card__value">{stats.activeLicensesManaged}+</div>
            <div className="biz-stat-card__label">Active Licenses Managed</div>
          </div>
        </div>
        <div className="biz-stat-card">
          <div className="biz-stat-card__icon biz-stat-card__icon--blue">🏭</div>
          <div>
            <div className="biz-stat-card__value">{stats.msmeRegistrationsIssued}+</div>
            <div className="biz-stat-card__label">MSME Registrations Issued</div>
          </div>
        </div>
        <div className="biz-stat-card">
          <div className="biz-stat-card__icon biz-stat-card__icon--amber">📅</div>
          <div>
            <div className="biz-stat-card__value">{stats.annualCompliancesFiled}+</div>
            <div className="biz-stat-card__label">Annual Compliances Filed</div>
          </div>
        </div>
        <div className="biz-stat-card">
          <div className="biz-stat-card__icon biz-stat-card__icon--purple">⭐</div>
          <div>
            <div className="biz-stat-card__value">{stats.expertConsultationRating}</div>
            <div className="biz-stat-card__label">Client Satisfaction Rating</div>
          </div>
        </div>
      </section>

      {/* 3. Category Filter Navigation */}
      <div className="biz-filter-bar">
        <div className="biz-pills">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`biz-pill ${selectedCategory === cat.id ? 'biz-pill--active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Services Grid */}
      <section className="biz-services-grid">
        {filteredServices.map((service: BusinessServiceItem) => (
          <div key={service.id} className="biz-service-card">
            {service.badge && (
              <span className="biz-service-card__badge">{service.badge}</span>
            )}
            <div className="biz-service-card__icon">{service.icon}</div>
            <h3 className="biz-service-card__title">{service.title}</h3>
            <p className="biz-service-card__desc">{service.description}</p>

            <div className="biz-service-card__section-label">Key Highlights</div>
            <ul className="biz-service-card__features">
              {service.features.map((feature: string, idx: number) => (
                <li key={idx} className="biz-service-card__feature">
                  <span className="biz-service-card__feature-icon">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="biz-service-card__section-label">Required Documents</div>
            <div className="biz-service-card__docs">
              {service.documentsRequired.map((doc: string, idx: number) => (
                <span key={idx} className="biz-service-card__doc-chip">
                  {doc}
                </span>
              ))}
            </div>

            <div className="biz-service-card__footer">
              <div className="biz-service-card__fee-wrap">
                <span className="biz-service-card__price">{service.price}</span>
                <span className="biz-service-card__turnaround">⏱️ {service.turnaroundTime}</span>
              </div>
              <button
                className="biz-service-card__btn-apply"
                onClick={() => onApplyClick(service.id)}
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* 5. Statutory Compliance Calendar */}
      <section className="biz-calendar-section">
        <div className="biz-section-header">
          <div>
            <h2 className="biz-section-header__title">Statutory Compliance Calendar</h2>
            <p className="biz-section-header__subtitle">
              Avoid penalties with automated notifications and timely filings handled by TaxEdge experts
            </p>
          </div>
        </div>

        <div className="biz-compliance-grid">
          {complianceCalendar.map((item: BusinessComplianceItem) => (
            <div key={item.id} className="biz-compliance-card">
              <span className="biz-compliance-card__due">Due: {item.dueDate}</span>
              <h4 className="biz-compliance-card__title">{item.title}</h4>
              <span className="biz-compliance-card__freq">Frequency: {item.frequency}</span>
              <span className="biz-compliance-card__penalty">⚠️ {item.penaltyDetails}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Active Applications Tracker */}
      <section className="biz-tracker-section">
        <div className="biz-section-header">
          <div>
            <h2 className="biz-section-header__title">Active License & Registration Trackers</h2>
            <p className="biz-section-header__subtitle">
              Monitor real-time progress of submitted government applications
            </p>
          </div>
        </div>

        <div className="biz-table-container">
          <table className="biz-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Service Name</th>
                <th>Entity Name</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Turnaround</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="biz-table__empty-cell">
                    No active license or registration applications yet. Choose a service above to apply.
                  </td>
                </tr>
              ) : (
                applications.map((app: BusinessApplication) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.referenceNumber}</strong>
                    </td>
                    <td>{app.serviceName}</td>
                    <td>{app.businessName}</td>
                    <td>{app.appliedOn}</td>
                    <td>
                      <span className={`biz-status-badge biz-status-badge--${app.status.toLowerCase()}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{app.estimatedApproval}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CompleteProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onCompleteProfile={handleConfirmProfile}
      />
    </div>
  )
}

export default BusinessPage
