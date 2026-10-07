import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { CalendarDays, Check, Briefcase, FileText, Calculator } from 'lucide-react'
import './PreviousYearItr.css'
import './PreviousYearItr.part2.css'

export interface AssessmentYearOptionItem {
  id: string
  ay: string
  subtitle: string
  status: 'Eligible' | 'Closed'
  isEligible: boolean
}

export interface PreviousItrStepItem {
  stepNumber: number
  title: string
  description: string
  tag: string
  icon: 'briefcase' | 'document' | 'calculator'
}

export const PREVIOUS_AY_OPTIONS: AssessmentYearOptionItem[] = [
  {
    id: 'ay-2025-26',
    ay: 'AY 2025–26',
    subtitle: 'Belated return filing period has ended.',
    status: 'Closed',
    isEligible: false,
  },
  {
    id: 'ay-2024-25',
    ay: 'AY 2024–25',
    subtitle: 'Updated Return (ITR-U) can be filed until 31 March 2027.',
    status: 'Eligible',
    isEligible: true,
  },
  {
    id: 'ay-2023-24',
    ay: 'AY 2023–24',
    subtitle: 'Updated Return (ITR-U) can be filed until 31 March 2026.',
    status: 'Eligible',
    isEligible: true,
  },
  {
    id: 'ay-2022-23',
    ay: 'AY 2022–23',
    subtitle: 'Filing window has closed.',
    status: 'Closed',
    isEligible: false,
  },
]

export const PREVIOUS_ITR_STEPS: PreviousItrStepItem[] = [
  {
    stepNumber: 1,
    title: 'Step 1 – Income Type',
    description:
      'Choose your income category such as Salaried, Business, Professional, Freelancer, Capital Gains, Rental Income, or Multiple Sources.',
    tag: 'Same as ITR Filing',
    icon: 'briefcase',
  },
  {
    stepNumber: 2,
    title: 'Step 2 – Income Details',
    description:
      'Enter PAN, Aadhaar, assessment year, and all relevant income information based on your selected category.',
    tag: 'Same as ITR Filing',
    icon: 'document',
  },
  {
    stepNumber: 3,
    title: 'Step 3 – Deductions',
    description:
      'Provide investment details, insurance, home loan interest, education loan interest, and any additional deductions.',
    tag: 'Same as ITR Filing',
    icon: 'calculator',
  },
]

export const PreviousYearHeroIllustration: React.FC = () => (
  <div className="prev-itr-hero-graphic" aria-hidden="true">
    <svg
      width="188"
      height="136"
      viewBox="0 0 188 136"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="prev-itr-hero-svg"
    >
      {/* Background radial soft glows */}
      <circle cx="140" cy="55" r="55" fill="rgba(37, 99, 235, 0.2)" />
      <circle cx="95" cy="75" r="45" fill="rgba(249, 115, 22, 0.12)" />

      {/* Sparkles */}
      <path
        d="M 38 32 Q 40 37 45 39 Q 40 41 38 46 Q 36 41 31 39 Q 36 37 38 32 Z"
        fill="#93c5fd"
        opacity="0.75"
      />
      <path
        d="M 172 70 Q 173 74 177 75 Q 173 76 172 80 Q 171 76 167 75 Q 171 74 172 70 Z"
        fill="#fdba74"
        opacity="0.8"
      />

      {/* Document Sheet Behind Calendar */}
      <g transform="rotate(7 132 52)">
        <rect x="104" y="14" width="62" height="78" rx="8" fill="#f8fafc" />
        <rect x="112" y="26" width="34" height="4" rx="2" fill="#cbd5e1" />
        <rect x="112" y="35" width="46" height="4" rx="2" fill="#e2e8f0" />
        <rect x="112" y="44" width="42" height="4" rx="2" fill="#e2e8f0" />
        <rect x="112" y="53" width="32" height="4" rx="2" fill="#e2e8f0" />
      </g>

      {/* Calendar Base Shadow */}
      <ellipse cx="90" cy="116" rx="46" ry="7" fill="#02142d" opacity="0.45" />

      {/* Calendar Body */}
      <rect
        x="46"
        y="24"
        width="88"
        height="84"
        rx="12"
        fill="#ffffff"
        filter="drop-shadow(0px 8px 18px rgba(0,0,0,0.28))"
      />

      {/* Calendar Header (Orange) */}
      <path
        d="M 46 36 C 46 29.37 51.37 24 58 24 L 122 24 C 128.63 24 134 29.37 134 36 L 134 46 L 46 46 Z"
        fill="url(#prev-hero-cal-grad)"
      />

      {/* Binder Rings */}
      <rect x="64" y="16" width="6" height="15" rx="3" fill="#cbd5e1" />
      <rect x="65" y="18" width="4" height="11" rx="2" fill="#ffffff" />

      <rect x="110" y="16" width="6" height="15" rx="3" fill="#cbd5e1" />
      <rect x="111" y="18" width="4" height="11" rx="2" fill="#ffffff" />

      {/* Calendar Grid (Orange rounded squares) */}
      <rect x="58" y="56" width="12" height="10" rx="2.5" fill="#f97316" />
      <rect x="76" y="56" width="12" height="10" rx="2.5" fill="#f97316" />
      <rect x="94" y="56" width="12" height="10" rx="2.5" fill="#f97316" />
      <rect x="112" y="56" width="12" height="10" rx="2.5" fill="#f97316" />

      <rect x="58" y="72" width="12" height="10" rx="2.5" fill="#f97316" />
      <rect x="76" y="72" width="12" height="10" rx="2.5" fill="#f97316" />
      <rect x="94" y="72" width="12" height="10" rx="2.5" fill="#f97316" />
      <rect x="112" y="72" width="12" height="10" rx="2.5" fill="#fed7aa" opacity="0.6" />

      <rect x="58" y="88" width="12" height="10" rx="2.5" fill="#f97316" />
      <rect x="76" y="88" width="12" height="10" rx="2.5" fill="#f97316" />

      {/* Blue Analog Clock Badge */}
      <g transform="translate(122, 78)">
        <circle cx="19" cy="19" r="19" fill="url(#prev-hero-clock-grad)" filter="drop-shadow(0px 4px 10px rgba(0,0,0,0.32))" />
        <circle cx="19" cy="19" r="15" fill="#2563eb" />
        <line x1="19" y1="19" x2="19" y2="9" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="19" y1="19" x2="26" y2="22" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="19" cy="19" r="2" fill="#ffffff" />
      </g>

      <defs>
        <linearGradient id="prev-hero-cal-grad" x1="46" y1="24" x2="134" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="prev-hero-clock-grad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
    </svg>
  </div>
)

export const PreviousYearItr: React.FC = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState<1 | 2>(1)
  const [selectedAy, setSelectedAy] = useState<string>('AY 2023–24')

  const normalizeAy = (val: string) => val.replace(/[–—]/g, '-')

  const selectedItem =
    PREVIOUS_AY_OPTIONS.find((opt) => normalizeAy(opt.ay) === normalizeAy(selectedAy)) ??
    PREVIOUS_AY_OPTIONS[2]

  const handleSelectAy = (opt: AssessmentYearOptionItem) => {
    if (opt.isEligible) {
      setSelectedAy(opt.ay)
    }
  }

  const handlePage1Continue = () => {
    if (!selectedItem?.isEligible) return
    setPage(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePage2Continue = () => {
    navigate(routePaths.itr.itrFiling, {
      state: { assessmentYear: selectedAy },
    })
  }

  const renderStepIcon = (icon: PreviousItrStepItem['icon']) => {
    switch (icon) {
      case 'briefcase':
        return <Briefcase className="prev-itr-icon--orange" size={24} />
      case 'document':
        return <FileText className="prev-itr-icon--orange" size={24} />
      case 'calculator':
        return <Calculator className="prev-itr-icon--orange" size={24} />
    }
  }

  return (
    <div className="prev-itr-page-container" data-testid="previous-year-itr-page">
      {page === 1 ? (
        /* ======================================================================
           PAGE 1: CHOOSE ASSESSMENT YEAR VIEW
           ====================================================================== */
        <>
          {/* 1. Dark Navy Hero Section */}
          <section className="prev-itr-hero-card" aria-labelledby="prev-itr-hero-heading">
            <div className="prev-itr-hero-content">
              <h1 id="prev-itr-hero-heading" className="prev-itr-hero-title">
                Previous Year ITR
              </h1>
              <p className="prev-itr-hero-subtitle">
                Select the assessment year you want to file.
              </p>
            </div>
            <PreviousYearHeroIllustration />
          </section>

          {/* 2. Choose Assessment Year Header Card */}
          <section className="prev-itr-choose-card">
            <div className="prev-itr-choose-icon-wrap" aria-hidden="true">
              <CalendarDays className="prev-itr-icon--orange" size={24} />
            </div>
            <div className="prev-itr-choose-text">
              <h2 className="prev-itr-choose-title">Choose Assessment Year</h2>
              <p className="prev-itr-choose-desc">
                Only assessment years that are eligible for filing are shown below.
              </p>
            </div>
          </section>

          {/* 3. Assessment Year Selection Cards */}
          <div
            className="prev-itr-ay-list"
            role="radiogroup"
            aria-label="Assessment Year Selection"
          >
            {PREVIOUS_AY_OPTIONS.map((opt) => {
              const isSelected =
                opt.isEligible && normalizeAy(selectedAy) === normalizeAy(opt.ay)

              const cardState = !opt.isEligible ? 'closed' : isSelected ? 'selected' : 'eligible'

              return (
                <div
                  key={opt.id}
                  className={`prev-itr-ay-card prev-itr-ay-card--${cardState}`}
                  onClick={() => handleSelectAy(opt)}
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={!opt.isEligible}
                  tabIndex={opt.isEligible ? 0 : -1}
                  onKeyDown={(e) => {
                    if (opt.isEligible && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      handleSelectAy(opt)
                    }
                  }}
                  data-testid={`prev-itr-card-${opt.id}`}
                >
                  <div className="prev-itr-ay-card-left">
                    <div className={`prev-itr-ay-icon-wrap prev-itr-ay-icon-wrap--${cardState}`}>
                      <CalendarDays size={22} />
                    </div>
                    <div className="prev-itr-ay-info">
                      <h3 className="prev-itr-ay-title">{opt.ay}</h3>
                      <p className="prev-itr-ay-subtitle">{opt.subtitle}</p>
                    </div>
                  </div>

                  <div className="prev-itr-ay-card-right">
                    {cardState === 'closed' && (
                      <span className="prev-itr-badge prev-itr-badge--closed">Closed</span>
                    )}
                    {cardState === 'eligible' && (
                      <span className="prev-itr-badge prev-itr-badge--eligible">Eligible</span>
                    )}
                    {cardState === 'selected' && (
                      <>
                        <span className="prev-itr-badge prev-itr-badge--selected">Selected</span>
                        <div className="prev-itr-check-circle" aria-label="Selected checkmark">
                          <Check size={16} strokeWidth={3} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 4. Eligibility Information Card */}
          <section className="prev-itr-info-card">
            <div className="prev-itr-info-icon-circle" aria-hidden="true">
              i
            </div>
            <div className="prev-itr-info-text">
              <h3 className="prev-itr-info-title">Eligibility Information</h3>
              <p className="prev-itr-info-desc">
                Assessment years are displayed based on current Income Tax Department filing rules. Closed years cannot be selected.
              </p>
            </div>
          </section>

          {/* 5. Full-width Continue Button */}
          <button
            type="button"
            className="prev-itr-continue-cta"
            onClick={handlePage1Continue}
            disabled={!selectedItem?.isEligible}
            data-testid="prev-itr-continue-btn"
          >
            Continue →
          </button>
        </>
      ) : (
        /* ======================================================================
           PAGE 2: FILING OVERVIEW VIEW (Matches Target Reference)
           ====================================================================== */
        <>
          {/* 1. Dark Navy Hero Section with Dynamic Assessment Year Subtitle */}
          <section className="prev-itr-hero-card" aria-labelledby="prev-itr-overview-heading">
            <div className="prev-itr-hero-content">
              <h1 id="prev-itr-overview-heading" className="prev-itr-hero-title">
                Previous Year ITR
              </h1>
              <p className="prev-itr-hero-subtitle">{selectedAy} Filing</p>
            </div>
            <PreviousYearHeroIllustration />
          </section>

          {/* 2. Dynamic Filing Badge */}
          <div className="prev-itr-filing-badge" data-testid="prev-itr-filing-badge">
            <span className="prev-itr-filing-badge-dot">•</span> Belated Return • {selectedAy}
          </div>

          {/* 3. Main Heading & Subtitle */}
          <div className="prev-itr-intro-wrap">
            <h2 className="prev-itr-intro-title">Same Questions, Different Assessment Year</h2>
            <p className="prev-itr-intro-desc">
              Your personal details, income information, and deductions are collected exactly like the regular ITR filing process. Only the assessment year changes.
            </p>
          </div>

          {/* 4. Three Step Cards in ONE ROW on Desktop */}
          <div className="prev-itr-steps-row" data-testid="prev-itr-steps-row">
            {PREVIOUS_ITR_STEPS.map((step) => (
              <div key={step.stepNumber} className="prev-itr-step-card">
                <div className="prev-itr-step-card-header">
                  <div className="prev-itr-step-card-icon-wrap" aria-hidden="true">
                    {renderStepIcon(step.icon)}
                  </div>
                  <span className="prev-itr-step-card-badge">{step.tag}</span>
                </div>
                <h3 className="prev-itr-step-card-title">{step.title}</h3>
                <p className="prev-itr-step-card-desc">{step.description}</p>
              </div>
            ))}
          </div>

          {/* 5. Information Card: No Need to Rebuild */}
          <section className="prev-itr-info-card">
            <div className="prev-itr-info-icon-circle" aria-hidden="true">
              i
            </div>
            <div className="prev-itr-info-text">
              <h3 className="prev-itr-info-title">No Need to Rebuild</h3>
              <p className="prev-itr-info-desc">
                The Previous Year ITR workflow reuses the same forms as the regular ITR filing process. Only the filing year and return type are different.
              </p>
            </div>
          </section>

          {/* 6. Full-width Continue Button */}
          <button
            type="button"
            className="prev-itr-continue-cta"
            onClick={handlePage2Continue}
            data-testid="prev-itr-overview-continue-btn"
          >
            Continue →
          </button>
        </>
      )}
    </div>
  )
}

export default PreviousYearItr
