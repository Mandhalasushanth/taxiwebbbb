import React from 'react'
import './GSTFilingStepper.css'

interface Step {
  id: number
  label: string
}

interface GSTFilingStepperProps {
  currentStep?: number
  onStepClick?: (step: number) => void
}

const STEPS: Step[] = [
  { id: 1, label: 'Filing Period' },
  { id: 2, label: 'Documents' },
  { id: 3, label: 'Review' },
]

export const GSTFilingStepper: React.FC<GSTFilingStepperProps> = ({
  currentStep = 1,
  onStepClick,
}) => {
  return (
    <nav className="gst-filing-stepper" aria-label="Filing Progress">
      {STEPS.map((step, index) => {
        const isCompleted = step.id < currentStep
        const isActive = step.id === currentStep
        const isLast = index === STEPS.length - 1

        let badgeClass = 'gst-filing-stepper__badge--pending'
        let labelClass = 'gst-filing-stepper__label--pending'

        if (isCompleted) {
          badgeClass = 'gst-filing-stepper__badge--completed'
          labelClass = 'gst-filing-stepper__label--completed'
        } else if (isActive) {
          badgeClass = 'gst-filing-stepper__badge--active'
          labelClass = 'gst-filing-stepper__label--active'
        }

        return (
          <React.Fragment key={step.id}>
            <div
              className={`gst-filing-stepper__item ${isCompleted && onStepClick ? 'clickable' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              onClick={() => {
                if (isCompleted && onStepClick) {
                  onStepClick(step.id)
                }
              }}
            >
              <div className={`gst-filing-stepper__badge ${badgeClass}`}>
                {isCompleted ? (
                  <svg
                    className="gst-filing-stepper__check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span className={`gst-filing-stepper__label ${labelClass}`}>{step.label}</span>
            </div>
            {!isLast && (
              <div
                className={`gst-filing-stepper__line ${
                  isCompleted ? 'gst-filing-stepper__line--completed' : ''
                }`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
