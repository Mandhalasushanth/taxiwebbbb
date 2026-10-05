import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { StepActionBar } from '@shared/components'
import { useIncorporationFlow } from '../../hooks'
import './LinkedRegistrations.css'

interface RegistrationItem {
  id: string
  title: string
  description: string
  checked: boolean
}

export const LinkedRegistrations: React.FC = () => {
  const navigate = useNavigate()
  const { formData, updateFormData } = useIncorporationFlow()
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const registrations: RegistrationItem[] = formData.linkedRegistrations?.length > 0 ? formData.linkedRegistrations : [
      {
        id: 'pan',
        title: 'Company PAN Card Issuance',
        description: 'Automatic PAN allotment via SPICe+ Part B (Mandatory)',
        checked: false,
      },
      {
        id: 'tan',
        title: 'Company TAN Allotment',
        description: 'Tax Deduction Account Number for TDS compliance (Mandatory)',
        checked: false,
      },
      {
        id: 'gstin',
        title: 'GSTIN Registration (AGILE-PRO-S)',
        description: 'Goods & Services Tax registration',
        checked: false,
      },
      {
        id: 'epfo',
        title: 'EPFO Registration',
        description: 'Employees Provident Fund Organisation registration',
        checked: false,
      },
      {
        id: 'esic',
        title: 'ESIC Registration',
        description: 'Employees State Insurance Corporation registration',
        checked: false,
      },
      {
        id: 'ptax',
        title: 'Professional Tax Registration (P-Tax)',
        description: 'State Professional Tax registration',
        checked: false,
      },
      {
        id: 'bank-acc',
        title: 'Zero Balance Corporate Bank Account Opening',
        description: 'Pre-approved corporate account opening with partner banks',
        checked: false,
      },
    ]

  const toggleRegistration = (id: string) => {
    setErrors((prev) => ({ ...prev, [id]: '' }))
    const updated = registrations.map((item: RegistrationItem) =>
        item.id === id ? { ...item, checked: !item.checked } : item
    )
    updateFormData({ linkedRegistrations: updated })
  }

  const handleContinue = () => {
    const hasPan = registrations.find((r) => r.id === 'pan')?.checked
    const hasTan = registrations.find((r) => r.id === 'tan')?.checked

    const newErrors: Record<string, string> = {}
    if (!hasPan) newErrors.pan = 'Company PAN Card issuance is mandatory under SPICe+ Part B'
    if (!hasTan) newErrors.tan = 'Company TAN Allotment is mandatory under SPICe+ Part B'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    navigate(routePaths.incorporation.reviewApplication)
  }

  return (
    <div className="linked-reg-page">
      {/* Step Bar */}
      <div className="linked-reg-stepbar">
        <span className="linked-reg-stepbar__badge">Step 7 of 11</span>
        <span className="linked-reg-stepbar__text">Linked Mandatory & Optional Registrations</span>
        <div className="linked-reg-stepbar__line">
          <div className="linked-reg-stepbar__line-fill" />
        </div>
      </div>

      {/* Header */}
      <div className="linked-reg-header">
        <h1 className="linked-reg-header__title">Linked Mandatory & Optional Registrations</h1>
        <p className="linked-reg-header__subtitle">
          Select government Registrations bundled directly with SPICe+ AGILE-PRO-S filing.
        </p>
      </div>

      {/* List */}
      <div className="linked-reg-list">
        {registrations.map((item) => (
          <div key={item.id} className="linked-reg-item-wrap">
            <div
              className={`linked-reg-item ${item.checked ? 'linked-reg-item--checked' : ''} ${errors[item.id] ? 'linked-reg-item--error' : ''}`}
              onClick={() => toggleRegistration(item.id)}
              role="checkbox"
              aria-checked={item.checked}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleRegistration(item.id)
                }
              }}
            >
              <div className="linked-reg-item__content">
                <span className="linked-reg-item__title">{item.title}</span>
                <span className="linked-reg-item__desc">{item.description}</span>
              </div>
              <div className="linked-reg-item__checkbox">
                {item.checked && (
                  <svg
                    className="linked-reg-item__check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
            {errors[item.id] && <span className="linked-reg-field-error">{errors[item.id]}</span>}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <StepActionBar
        onBack={() => navigate(routePaths.incorporation.documentsKyc)}
        onNext={handleContinue}
        onSaveDraft={() => navigate(routePaths.dashboard)}
        nextLabel="Continue"
      />
    </div>
  )
}

export default LinkedRegistrations
