import React from 'react'
import './GSTCancellationStepper.css'

export interface CancellationStepItem {
  id: number
  label: string
}

const CANCELLATION_STEPS: CancellationStepItem[] = [
  { id: 1, label: 'Cancellation Details' },
  { id: 2, label: 'Review & Submit' },
]

export interface GSTCancellationStepperProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

export const GSTCancellationStepper: React.FC<GSTCancellationStepperProps> = ({
  currentStep,
  onStepClick,
}) => {
  return (
    <nav className="gst-canc-stepper" aria-label="Cancellation Progress">
      <div className="gst-canc-stepper__track">
        {CANCELLATION_STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isLast = index === CANCELLATION_STEPS.length - 1

          return (
            <div key={step.id} className="gst-canc-stepper__item-wrapper">
              <button
                type="button"
                className={`gst-canc-stepper__step ${
                  isCurrent
                    ? 'gst-canc-stepper__step--current'
                    : isCompleted
                      ? 'gst-canc-stepper__step--completed'
                      : 'gst-canc-stepper__step--pending'
                }`}
                onClick={() => onStepClick && isCompleted && onStepClick(step.id)}
                disabled={!isCompleted && !isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="gst-canc-stepper__circle">
                  {isCompleted ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="gst-canc-stepper__check-icon"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </span>
                <span className="gst-canc-stepper__label">{step.label}</span>
              </button>

              {!isLast && (
                <div
                  className={`gst-canc-stepper__line ${
                    isCompleted ? 'gst-canc-stepper__line--completed' : ''
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

export default GSTCancellationStepper
