import React from 'react'
import { ITR_STEPS } from './itrFiling.constants'
import './ItrStepHeaderStepper.css'

export interface ItrStepHeaderStepperProps {
  currentStepId: number
}

export const ItrStepHeaderStepper: React.FC<ItrStepHeaderStepperProps> = ({ currentStepId }) => {
  return (
    <div className="itr-personal-header">
      <div className="itr-personal-title-group">
        <h1 className="itr-personal-title">ITR Filing</h1>
      </div>

      <div className="itr-stepper-track" aria-label="Step progress">
        {ITR_STEPS.map((s, idx) => {
          const isDotCompleted = s.id < currentStepId
          const isDotActive = s.id === currentStepId
          const isLast = idx === ITR_STEPS.length - 1
          const dotClass = isDotCompleted
            ? 'itr-stepper-dot itr-stepper-dot--completed'
            : isDotActive
            ? 'itr-stepper-dot itr-stepper-dot--active'
            : 'itr-stepper-dot itr-stepper-dot--inactive'
          const lineClass = isDotCompleted
            ? 'itr-stepper-line itr-stepper-line--completed'
            : 'itr-stepper-line'
          return (
            <div key={s.id} className="itr-stepper-step-item">
              {!isLast && <div className={lineClass} aria-hidden="true" />}
              <div className={dotClass} title={`Step ${s.id}: ${s.label}`}>
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
                  s.id
                )}
              </div>
              <span
                className={`itr-stepper-label ${
                  isDotActive
                    ? 'itr-stepper-label--active'
                    : isDotCompleted
                    ? 'itr-stepper-label--completed'
                    : ''
                }`}
              >
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
