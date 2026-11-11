import React from 'react'
import './GSTFilingStepper.css'

interface Step {
  id: number
  label: string
}

interface GSTFilingStepperProps {
  currentStep?: number
  onStepClick?: (step: number) => void
  isNilReturn?: boolean
}

const STEPS: Step[] = [
  { id: 1, label: 'Filing Period' },
  { id: 2, label: 'Documents' },
  { id: 3, label: 'Review' },
]

export const GSTFilingStepper: React.FC<GSTFilingStepperProps> = ({
  currentStep = 1,
  onStepClick: _onStepClick,
  isNilReturn: _isNilReturn = false,
}) => {
  const steps = STEPS

  return (
    <nav className="gst-filing-stepper" aria-label="Filing Progress">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep
        const isActive = step.id === currentStep
        const isLast = index === steps.length - 1
        const displayNumber = index + 1

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
          <div
            key={step.id}
            className="gst-filing-stepper__item"
            aria-current={isActive ? 'step' : undefined}
          >
            {!isLast && (
              <div
                className={`gst-filing-stepper__line ${
                  isCompleted ? 'gst-filing-stepper__line--completed' : ''
                }`}
                aria-hidden="true"
              />
            )}
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
                displayNumber
              )}
            </div>
            <span className={`gst-filing-stepper__label ${labelClass}`}>{step.label}</span>
          </div>
        )
      })}
    </nav>
  )
}

export default GSTFilingStepper
