import React from 'react'
import './TdsRefundStepTracker.css'

export interface TdsRefundStepTrackerProps {
  currentStep: number
}

const STEPS = [
  { num: 1, label: 'Customer & Income' },
  { num: 2, label: 'Upload Documents' },
  { num: 3, label: 'CA Verification' },
  { num: 4, label: 'Refund Filing' },
  { num: 5, label: 'Refund Credited' },
]

export const TdsRefundStepTracker: React.FC<TdsRefundStepTrackerProps> = ({ currentStep }) => {
  return (
    <div className="tds-stepper-wrapper">
      <nav className="tds-stepper-track" aria-label="Step progress" data-testid="tds-stepper-track">
        {STEPS.map((s, idx) => {
          const isDotCompleted = s.num < currentStep
          const isDotActive = s.num === currentStep
          const isLast = idx === STEPS.length - 1
          const dotClass = isDotCompleted
            ? 'tds-stepper-dot tds-stepper-dot--completed'
            : isDotActive
            ? 'tds-stepper-dot tds-stepper-dot--active'
            : 'tds-stepper-dot tds-stepper-dot--inactive'
          const lineClass = isDotCompleted
            ? 'tds-stepper-line tds-stepper-line--completed'
            : 'tds-stepper-line'
          return (
            <React.Fragment key={s.num}>
              <div className="tds-stepper-step-item">
                <div
                  className={dotClass}
                  data-testid={`tds-step-${s.num}`}
                  title={`Step ${s.num}: ${s.label}`}
                >
                  {isDotCompleted ? (
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`tds-stepper-label ${
                    isDotActive ? 'tds-stepper-label--active' : ''
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {!isLast && (
                <div className={lineClass} data-testid={`tds-line-${s.num}`} />
              )}
            </React.Fragment>
          )
        })}
      </nav>
    </div>
  )
}

export default TdsRefundStepTracker
