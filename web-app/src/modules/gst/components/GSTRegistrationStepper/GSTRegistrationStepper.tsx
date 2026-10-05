import './GSTRegistrationStepper.css'

export interface StepItem {
  id: number
  label: string
}

export const REGISTRATION_STEPS: StepItem[] = [
  { id: 1, label: 'Business' },
  { id: 2, label: 'Documents' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Payment' },
]

interface GSTRegistrationStepperProps {
  currentStep: number
  onStepClick?: (step: number) => void
}

export const GSTRegistrationStepper = ({
  currentStep,
  onStepClick,
}: GSTRegistrationStepperProps) => {
  return (
    <nav className="gst-reg-stepper" aria-label="Registration Progress">
      <div className="gst-reg-stepper__track">
        {REGISTRATION_STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isLast = index === REGISTRATION_STEPS.length - 1

          return (
            <div key={step.id} className="gst-reg-stepper__item-wrapper">
              <button
                type="button"
                className={`gst-reg-stepper__step ${
                  isCurrent
                    ? 'gst-reg-stepper__step--current'
                    : isCompleted
                      ? 'gst-reg-stepper__step--completed'
                      : 'gst-reg-stepper__step--pending'
                }`}
                onClick={() => onStepClick && isCompleted && onStepClick(step.id)}
                disabled={!isCompleted && !isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="gst-reg-stepper__circle">
                  {isCompleted ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="gst-reg-stepper__check-icon"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </span>
                <span className="gst-reg-stepper__label">{step.label}</span>
              </button>

              {!isLast && (
                <div
                  className={`gst-reg-stepper__line ${
                    isCompleted ? 'gst-reg-stepper__line--completed' : ''
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

export default GSTRegistrationStepper
