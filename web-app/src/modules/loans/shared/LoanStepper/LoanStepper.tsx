import React from 'react'
import './LoanStepper.css'

interface LoanStepperProps {
  steps: { label: string; id: string | number }[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export const LoanStepper: React.FC<LoanStepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="loan-stepper-container">
      {steps.map((step, index) => {
        const isCompleted = currentStep > index
        const isActive = currentStep === index
        const isClickable = onStepClick && (isCompleted || isActive)
        return (
          <div key={step.id} className={`loan-stepper-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
            <div 
              className={`loan-stepper-circle ${isClickable ? 'loan-stepper-circle--clickable' : ''}`}
              onClick={() => isClickable && onStepClick(index)}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            <div className="loan-stepper-label">{step.label}</div>
            {index < steps.length - 1 && <div className="loan-stepper-line" />}
          </div>
        )
      })}
    </div>
  )
}

export default LoanStepper
