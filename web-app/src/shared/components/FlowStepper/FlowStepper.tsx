import React from 'react'
import type { FlowStepperProps, FlowStepStatus } from './FlowStepper.types'
import './FlowStepper.css'

const CheckSvgIcon: React.FC = () => (
  <svg
    className="flow-step-check-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const resolveStepStatus = (
  stepNumber: number,
  currentStep: number,
  completedUntilStep?: number,
): FlowStepStatus => {
  if (stepNumber === currentStep) {
    return 'active'
  }
  const effectiveCompletedMax =
    typeof completedUntilStep === 'number' ? completedUntilStep : currentStep - 1

  if (stepNumber <= effectiveCompletedMax) {
    return 'completed'
  }
  return 'upcoming'
}

export const FlowStepper: React.FC<FlowStepperProps> = ({
  steps,
  currentStep,
  onStepClick: _onStepClick,
  completedUntilStep,
  className = '',
  ariaLabel = 'Progress steps',
}) => {
  return (
    <nav
      className={`flow-stepper-container ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <div className="flow-stepper-track">
        {steps.map((step, index) => {
          const status = resolveStepStatus(step.stepNumber, currentStep, completedUntilStep)
          const displayLabel = step.shortLabel || step.title || `Step ${step.stepNumber}`
          const isLast = index === steps.length - 1
          const isLineCompleted = status === 'completed'

          return (
            <div key={step.stepNumber} className="flow-step-item-wrapper">
              {!isLast && (
                <div
                  className={`flow-step-line ${
                    isLineCompleted ? 'flow-step-line--completed' : ''
                  }`}
                  aria-hidden="true"
                />
              )}

              <div
                className={`flow-step-button flow-step-button--${status}`}
                aria-current={status === 'active' ? 'step' : undefined}
                aria-label={`${displayLabel} (${status})`}
              >
                <span className="flow-step-circle">
                  {status === 'completed' ? (
                    <CheckSvgIcon />
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </span>
                <span className="flow-step-label">{displayLabel}</span>
              </div>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
