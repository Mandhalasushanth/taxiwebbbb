import React from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { getEntityStructureLabel, getProposedCompanyName, type TrackingStepItem } from '../../types/incorporation.types'
import { useIncorporationFlow } from '../../hooks'
import './ApplicationTracking.css'

type TrackingStep = TrackingStepItem

const stepsData: TrackingStep[] = [

  {
    id: 1,
    title: 'Draft Creation',
    desc: 'Application initiated by user',
    dateText: '18 Sep 2026',
    status: 'completed',
    statusLabel: 'Completed',
  },
  {
    id: 2,
    title: 'KYC & Document Verification',
    desc: 'Reviewing PAN, Aadhaar & Office Proofs',
    dateText: '18 Sep 2026',
    status: 'completed',
    statusLabel: 'Completed',
  },
  {
    id: 3,
    title: 'Under Review',
    desc: 'TaxEdge compliance expert validation',
    dateText: 'In Progress',
    status: 'active',
    statusLabel: 'Active Step',
  },
  {
    id: 4,
    title: 'Name Reservation (RUN / SPICe+ Part A)',
    desc: 'Filing preferred names with MCA CRC',
    dateText: 'Pending',
    status: 'upcoming',
    statusLabel: 'Upcoming',
  },
  {
    id: 5,
    title: 'DSC & DIN Processing',
    desc: 'Digital signature token generation',
    dateText: 'Pending',
    status: 'upcoming',
    statusLabel: 'Upcoming',
  },
  {
    id: 6,
    title: 'Ready for SPICe+ Part B Filing',
    desc: 'Final incorporation payload compilation',
    dateText: 'Pending',
    status: 'upcoming',
    statusLabel: 'Upcoming',
  },
  {
    id: 7,
    title: 'Submitted to MCA Portal',
    desc: 'Form e-MoA, e-AoA & AGILE-PRO-S filed',
    dateText: 'Pending',
    status: 'upcoming',
    statusLabel: 'Upcoming',
  },
  {
    id: 8,
    title: 'Government Approval & COI',
    desc: 'Certificate of Incorporation & CIN Issuance',
    dateText: 'Pending',
    status: 'upcoming',
    statusLabel: 'Upcoming',
  },
]

export const ApplicationTracking: React.FC = () => {
  const navigate = useNavigate()
  const { formData } = useIncorporationFlow()

  const companyType = formData.companyType || 'pvt_ltd'
  const entityStructure = getEntityStructureLabel(companyType)
  const companyName = getProposedCompanyName(companyType, formData.companyDetails?.firstPreferredName)
  const applicationId = formData.applicationId || 'INC-2026-89421'


  const dateStr = formData.applicationDate || '2026-09-18'

  return (
    <div className="app-track-page">
      {/* Top Progress Tracker */}
      <div className="app-track-stepbar">
        <span className="app-track-stepbar__badge">Step 10 of 11</span>
        <span className="app-track-stepbar__text">Application Tracking</span>
        <div className="app-track-stepbar__line">
          <div className="app-track-stepbar__line-fill" />
        </div>
      </div>

      {/* Header */}
      <div className="app-track-header">
        <h1 className="app-track-header__title">Application Tracking</h1>
        <p className="app-track-header__subtitle">
          Live progress tracker for your MCA company incorporation application.
        </p>
      </div>

      {/* Navy Application Summary Card */}
      <section className="app-track-summary-card">
        <div className="app-track-summary-card__id">Application ID: {applicationId}</div>
        <div className="app-track-summary-card__company">Company: {companyName}</div>
        <div className="app-track-summary-card__meta">{`Type: ${entityStructure} · Date: ${dateStr}`}</div>
      </section>

      {/* Stepper Timeline */}
      <div className="app-track-timeline">
        {stepsData.map((step, idx) => (
          <div key={step.id} className="timeline-step">
            <div className="timeline-step__indicator">
              <div className={`timeline-step__node timeline-step__node--${step.status}`}>
                {step.status === 'completed' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {step.status === 'active' && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15 14" />
                  </svg>
                )}
              </div>
              {idx < stepsData.length - 1 && (
                <div
                  className={`timeline-step__line ${
                    step.status === 'completed' ? 'timeline-step__line--completed' : ''
                  }`}
                />
              )}
            </div>

            <div className={`timeline-step__card ${step.status === 'active' ? 'timeline-step__card--active' : ''}`}>
              <div className="timeline-step__header">
                <h3 className="timeline-step__title">{step.title}</h3>
                <span className="timeline-step__desc">{step.desc}</span>
              </div>
              <div className="timeline-step__footer">
                <span className="timeline-step__date">{step.dateText}</span>
                <span className={`timeline-step__status timeline-step__status--${step.status}`}>
                  {step.status === 'completed' && '✓ '}
                  {step.status === 'active' && '• '}
                  {step.statusLabel}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Buttons */}
      <div className="app-track-actions">
        <button
          type="button"
          className="app-track-btn-back"
          onClick={() => navigate(routePaths.incorporation.feesPayment)}
        >
          &larr; Back
        </button>
        <button
          type="button"
          className="app-track-btn-receipt"
          onClick={() => navigate(routePaths.incorporation.receipt)}
        >
          View / Download Receipt &rarr;
        </button>
      </div>
    </div>
  )
}
export default ApplicationTracking
