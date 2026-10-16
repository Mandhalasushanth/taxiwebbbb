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
  onStepClick,
  isNilReturn = false,
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

        const isClickable = isCompleted && onStepClick && !(isNilReturn && step.id === 2)

        return (
          <React.Fragment key={step.id}>
            <div
              className={`gst-filing-stepper__item ${isClickable ? 'clickable' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              onClick={() => {
                if (isClickable && onStepClick) {
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
                  displayNumber
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

export default GSTFilingStepper
