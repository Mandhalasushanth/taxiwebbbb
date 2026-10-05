import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { StepActionBar } from '@shared/components'
import './PreviousYearItr.css'

export interface AssessmentYearOptionItem {
  id: string
  ay: string
  subtitle: string
  status: 'Eligible' | 'Closed'
  isEligible: boolean
}

export interface PreviousItrPreviewStep {
  stepNumber: number
  title: string
  description: string
  tag: string
  icon: string
}

export const PREVIOUS_AY_OPTIONS: AssessmentYearOptionItem[] = [
  { id: 'ay-2025-26', ay: 'AY 2025-26', subtitle: 'Belated return filing period has ended.', status: 'Closed', isEligible: false },
  { id: 'ay-2024-25', ay: 'AY 2024-25', subtitle: 'Updated Return (ITR-U) can be filed until 31 March 2027.', status: 'Eligible', isEligible: true },
  { id: 'ay-2023-24', ay: 'AY 2023-24', subtitle: 'Updated Return (ITR-U) can be filed until 31 March 2026.', status: 'Eligible', isEligible: true },
  { id: 'ay-2022-23', ay: 'AY 2022-23', subtitle: 'Filing window has closed.', status: 'Closed', isEligible: false },
]

export const PREVIOUS_ITR_PREVIEW_STEPS: PreviousItrPreviewStep[] = [
  {
    stepNumber: 1,
    title: 'Step 1 – Income Type',
    tag: 'Same as ITR Filing',
    icon: '👤',
    description: 'Choose your income category such as Salaried, Business, Professional, Freelancer, Capital Gains, Rental Income, or Multiple Sources.',
  },
  {
    stepNumber: 2,
    title: 'Step 2 – Income Details',
    tag: 'Same as ITR Filing',
    icon: '💰',
    description: 'Enter PAN, Aadhaar, assessment year, and all relevant income information based on your selected category.',
  },
  {
    stepNumber: 3,
    title: 'Step 3 – Deductions',
    tag: 'Same as ITR Filing',
    icon: '📄',
    description: 'Provide investment details, insurance, home loan interest, education loan interest, and any additional deductions.',
  },
]

const renderAyBadge = (isEligible: boolean, isSelected: boolean) => {
  const badgeMap: Record<string, React.ReactNode> = {
    closed: <span className="prev-itr-badge prev-itr-badge--closed">Closed</span>,
    selected: (
      <>
        <span className="prev-itr-badge prev-itr-badge--selected">Selected</span>
        <div className="prev-itr-check-circle" aria-hidden="true">✔</div>
      </>
    ),
    eligible: <span className="prev-itr-badge prev-itr-badge--eligible">Eligible</span>,
  }
  const key = !isEligible ? 'closed' : isSelected ? 'selected' : 'eligible'
  return badgeMap[key]
}

const renderAyCard = (
  opt: AssessmentYearOptionItem,
  selectedAy: string,
  onSelect: (item: AssessmentYearOptionItem) => void
) => {
  const isSelected = selectedAy === opt.ay && opt.isEligible
  const cardState = !opt.isEligible ? 'closed' : isSelected ? 'selected' : 'eligible'
  const cardClassMap: Record<string, string> = {
    closed: 'prev-itr-ay-card prev-itr-ay-card--closed',
    selected: 'prev-itr-ay-card prev-itr-ay-card--eligible prev-itr-ay-card--selected',
    eligible: 'prev-itr-ay-card prev-itr-ay-card--eligible',
  }

  return (
    <div
      key={opt.id}
      className={cardClassMap[cardState]}
      onClick={() => onSelect(opt)}
      role="radio"
      aria-checked={isSelected}
      tabIndex={opt.isEligible ? 0 : -1}
      onKeyDown={(e) => {
        if (opt.isEligible && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect(opt)
        }
      }}
    >
      <div className="prev-itr-ay-card-left">
        <div className="prev-itr-ay-icon-wrap">📋</div>
        <div className="prev-itr-ay-info">
          <strong className="prev-itr-ay-title">{opt.ay}</strong>
          <span className="prev-itr-ay-subtitle">{opt.subtitle}</span>
        </div>
      </div>
      <div className="prev-itr-ay-card-right">{renderAyBadge(opt.isEligible, isSelected)}</div>
    </div>
  )
}

const renderPreviewStepCard = (step: PreviousItrPreviewStep) => (
  <div key={step.stepNumber} className="prev-itr-step-card">
    <div className="prev-itr-step-card-header">
      <div className="prev-itr-step-card-left">
        <div className="prev-itr-step-card-icon-box">{step.icon}</div>
        <strong className="prev-itr-step-card-title">{step.title}</strong>
      </div>
      <span className="prev-itr-step-card-badge">{step.tag}</span>
    </div>
    <p className="prev-itr-step-card-desc">{step.description}</p>
  </div>
)

const renderYearSelectionView = (
  selectedAy: string,
  selectedItem: AssessmentYearOptionItem,
  onSelectAy: (opt: AssessmentYearOptionItem) => void,
  onContinue: () => void
) => (
  <div className="prev-itr-page1-grid">
    <div className="prev-itr-page1-main">
      <section className="prev-itr-hero-card">
        <div className="prev-itr-hero-icon-box">📅</div>
        <div className="prev-itr-hero-text-wrap">
          <h2 className="prev-itr-hero-title">Choose Assessment Year</h2>
          <p className="prev-itr-hero-desc">Only assessment years eligible for filing are shown below.</p>
        </div>
      </section>

      <div className="prev-itr-ay-list" role="radiogroup" aria-label="Assessment Year Selection">
        {PREVIOUS_AY_OPTIONS.map((opt) => renderAyCard(opt, selectedAy, onSelectAy))}
      </div>
    </div>

    <aside className="prev-itr-page1-sidebar">
      <div className="prev-itr-summary-card">
        <div className="prev-itr-summary-header">
          <span className="prev-itr-summary-title">Selected Filing Details</span>
          <span className="prev-itr-badge prev-itr-badge--selected">{selectedAy}</span>
        </div>
        <div className="prev-itr-summary-rows">
          <div className="prev-itr-summary-row"><span className="prev-itr-summary-label">Return Type</span><span className="prev-itr-summary-value">Updated Return (ITR-U)</span></div>
          <div className="prev-itr-summary-row"><span className="prev-itr-summary-label">Filing Status</span><span className="prev-itr-summary-value prev-itr-summary-value--green">Eligible for E-Filing</span></div>
          <div className="prev-itr-summary-row"><span className="prev-itr-summary-label">Validity Window</span><span className="prev-itr-summary-value">{selectedItem.subtitle.replace('Updated Return (ITR-U) can be filed ', '')}</span></div>
        </div>
        <button type="button" className="prev-itr-continue-btn" onClick={onContinue}>
          Continue
        </button>
      </div>

      <div className="prev-itr-info-box">
        <div className="prev-itr-info-icon-circle" aria-hidden="true">i</div>
        <div className="prev-itr-info-content">
          <h3 className="prev-itr-info-title">Eligibility Information</h3>
          <p className="prev-itr-info-desc">Assessment years are displayed based on current Income Tax Department rules. Closed years cannot be selected.</p>
        </div>
      </div>
    </aside>
  </div>
)

const renderFilingOverviewView = (
  selectedAy: string,
  onBack: () => void,
  onContinue: () => void
) => (
  <div className="prev-itr-page2-container">
    <div className="prev-itr-pill-tag">
      <span className="prev-itr-pill-dot">•</span> Belated Return • {selectedAy}
    </div>

    <div className="prev-itr-intro-group">
      <h2 className="prev-itr-intro-title">Same Questions, Different Assessment Year</h2>
      <p className="prev-itr-intro-desc">Your personal details, income information, and deductions are collected exactly like the regular ITR Filing process. Only the assessment year changes.</p>
    </div>

    <div className="prev-itr-step-cards-grid">
      {PREVIOUS_ITR_PREVIEW_STEPS.map(renderPreviewStepCard)}
    </div>

    <div className="prev-itr-info-box">
      <div className="prev-itr-info-icon-circle" aria-hidden="true">i</div>
      <div className="prev-itr-info-content">
        <h3 className="prev-itr-info-title">No Need to Rebuild</h3>
        <p className="prev-itr-info-desc">The Previous Year ITR workflow reuses the same forms as regular ITR Filing. Only the filing year and return type are different.</p>
      </div>
    </div>

    <StepActionBar
      onBack={onBack}
      onNext={onContinue}
      backLabel="Back"
      nextLabel="Continue"
      saveDraftLabel="Save Draft & Exit"
    />
  </div>
)

export const PreviousYearItr: React.FC = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState<1 | 2>(1)
  const [selectedAy, setSelectedAy] = useState<string>('AY 2024-25')

  const selectedItem = PREVIOUS_AY_OPTIONS.find((opt) => opt.ay === selectedAy) ?? PREVIOUS_AY_OPTIONS[1]

  const handleSelectAy = (opt: AssessmentYearOptionItem) => {
    try {
      if (opt.isEligible) {
        setSelectedAy(opt.ay)
      }
    } catch {
      setSelectedAy('AY 2024-25')
    }
  }

  const handlePage1Continue = () => {
    try {
      setPage(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setPage(2)
    }
  }

  const handlePage2Continue = () => {
    navigate(routePaths.itr.itrFiling)
  }

  const handleBack = () => {
    try {
      const backHandlers: Record<1 | 2, () => void> = {
        1: () => navigate(routePaths.itr.root),
        2: () => {
          setPage(1)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        },
      }
      backHandlers[page]()
    } catch {
      navigate(routePaths.itr.root)
    }
  }

  return (
    <div className="prev-itr-page-container">
      <header className="prev-itr-header">
        <div className="prev-itr-header-titles">
          <h1 className="prev-itr-header-title">Previous Year ITR</h1>
          <p className="prev-itr-header-subtitle">
            {page === 1 ? 'Select the assessment year you want to file.' : `${selectedAy} Filing Overview`}
          </p>
        </div>
      </header>

      {page === 1
        ? renderYearSelectionView(selectedAy, selectedItem, handleSelectAy, handlePage1Continue)
        : renderFilingOverviewView(selectedAy, handleBack, handlePage2Continue)}
    </div>
  )
}

export default PreviousYearItr
