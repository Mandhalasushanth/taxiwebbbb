import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CUSTOMER_TYPE_OPTIONS } from '@modules/customerType/data/customerTypeOptions'
import { CustomerTypeCard } from '@modules/customerType/components/CustomerTypeCard/CustomerTypeCard'
import type { CustomerTypeId } from '@modules/customerType/types/customerType.types'
import { useAuthStore } from '@store/index'
import { registrationDraftStore } from '../../services/registrationDraftStore'
import { RegistrationForm } from '../RegistrationForm/RegistrationForm'
import './RegistrationCard.css'

export const RegistrationCard: React.FC = () => {
  const location = useLocation()
  const locationState = location.state as { customerType?: CustomerTypeId; returnTo?: string; mobile?: string } | null
  const userMobile = useAuthStore((state) => state.user?.mobile) ?? ''

  const [step, setStep] = useState<1 | 2>(() => (locationState?.customerType ? 2 : 1))
  const [selectedCustomerType, setSelectedCustomerType] = useState<CustomerTypeId | null>(
    () =>
      locationState?.customerType ||
      (registrationDraftStore.load(userMobile)?.customerType as CustomerTypeId | undefined) ||
      'individual'
  )
  const [error] = useState<string | null>(null)

  const handleSelectCustomerType = (id: CustomerTypeId) => {
    setSelectedCustomerType(id)
    registrationDraftStore.saveCustomerType(userMobile, id)
  }

  const handleProceedToStep2 = () => {
    if (!selectedCustomerType) return
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="reg-card">
      {step === 1 ? (
        <>
          <header className="reg-card__header">
            <h2 className="reg-card__title">What describes you best?</h2>
            <p className="reg-card__subtitle">
              Select your customer or entity type. Your tax checklists and filing forms will adapt automatically.
            </p>
          </header>

          {error && (
            <div className="reg-card__error-banner" role="alert">
              <span>{error}</span>
            </div>
          )}

          <div className="reg-card__customer-type-grid" role="radiogroup" aria-label="Customer Type Selection">
            {CUSTOMER_TYPE_OPTIONS.map((option) => (
              <CustomerTypeCard
                key={option.id}
                id={option.id}
                title={option.title}
                description={option.description}
                icon={option.icon}
                isSelected={selectedCustomerType === option.id}
                onSelect={handleSelectCustomerType}
              />
            ))}
          </div>

          <footer className="reg-card__step1-footer">
            <button
              type="button"
              className={`reg-card__submit-btn ${
                selectedCustomerType
                  ? 'reg-card__submit-btn--active'
                  : 'reg-card__submit-btn--disabled'
              }`}
              disabled={!selectedCustomerType}
              onClick={handleProceedToStep2}
            >
              <span>Continue</span>
            </button>
          </footer>
        </>
      ) : (
        <>
          <div className="reg-card__step-nav">
            <button
              type="button"
              className="reg-card__back-btn"
              onClick={() => {
                setStep(1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="reg-card__back-icon">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          </div>

          <header className="reg-card__header">
            <h2 className="reg-card__title">Create Account</h2>
          </header>

          <RegistrationForm customerType={selectedCustomerType || 'individual'} />
        </>
      )}
    </div>
  )
}

export default RegistrationCard
