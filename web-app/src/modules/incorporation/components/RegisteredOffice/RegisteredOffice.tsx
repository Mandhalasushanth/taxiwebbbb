import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import { DocumentCard, StepActionBar } from '@shared/components'
import { filterDigits, filterMobile, isValidMobile, isValidPincode, isValidEmail } from '../../utils/validation'
import { useIncorporationFlow } from '../../hooks'
import './RegisteredOffice.css'

interface OfficeDocItem {
  id: string
  title: string
  subtitle?: string
  isRequired: boolean
  isUploaded: boolean
  fileName?: string
}

export const RegisteredOffice: React.FC = () => {
  const navigate = useNavigate()
  const { formData, updateFormData } = useIncorporationFlow()

  const addressData = formData.registeredOffice?.addressData || {
    addressLine1: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    ownershipStatus: '',
    email: '',
    mobile: '',
  }

  const docs = formData.registeredOffice?.docs || [
    {
      id: 'doc-1',
      title: 'Office Address Proof / Utility Bill',
      subtitle: 'Utility bill should be recent (not older than 2 months).',
      isRequired: true,
      isUploaded: false,
    },
    {
      id: 'doc-2',
      title: 'Ownership / Rent / Lease Document',
      subtitle: 'Rent agreement or ownership deed.',
      isRequired: true,
      isUploaded: false,
    },
    {
      id: 'doc-3',
      title: 'Owner NOC',
      subtitle: 'Required only for rented/leased/third-party premises.',
      isRequired: true,
      isUploaded: false,
    },
  ]

  const [errors, setErrors] = useState<Record<string, string>>({})

  const ownershipOptions = ['Rented', 'Owned', 'Leased']

  const handleInputChange = (field: string, val: string) => {
    setErrors((prev) => ({ ...prev, [field]: '' }))
    let finalVal = val
    if (field === 'pincode') finalVal = filterDigits(val, 6)
    if (field === 'mobile') finalVal = filterMobile(val)
    
    updateFormData({
      registeredOffice: { ...formData.registeredOffice, docs, addressData: { ...addressData, [field]: finalVal } }
    })
  }

  const handleUploadDoc = (id: string, file: File) => {
    setErrors((prev) => ({ ...prev, docs: '' }))
    const newDocs = docs.map((d: OfficeDocItem) => (d.id === id ? { ...d, isUploaded: true, fileName: file.name } : d))
    updateFormData({
      registeredOffice: { ...formData.registeredOffice, addressData, docs: newDocs }
    })
  }

  const handleRemoveDoc = (id: string) => {
    const newDocs = docs.map((d: OfficeDocItem) => (d.id === id ? { ...d, isUploaded: false, fileName: undefined } : d))
    updateFormData({
      registeredOffice: { ...formData.registeredOffice, addressData, docs: newDocs }
    })
  }

  const handleContinue = () => {
    const newErrors: Record<string, string> = {}
    if (!(addressData.addressLine1 || '').trim()) newErrors.addressLine1 = 'Building / premises address is required'
    if (!(addressData.city || '').trim()) newErrors.city = 'City is required'
    if (!(addressData.district || '').trim()) newErrors.district = 'District is required'
    if (!(addressData.state || '').trim()) newErrors.state = 'State is required'
    if (!(addressData.pincode || '').trim()) {
      newErrors.pincode = 'PIN code is required'
    } else if (!isValidPincode(addressData.pincode)) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code'
    }
    if (!addressData.ownershipStatus) newErrors.ownershipStatus = 'Premises ownership status is required'
    if (!(addressData.email || '').trim()) {
      newErrors.email = 'Email address is required'
    } else if (!isValidEmail(addressData.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!(addressData.mobile || '').trim()) {
      newErrors.mobile = 'Mobile number is required'
    } else if (!isValidMobile(addressData.mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit Indian mobile number'
    }
    docs.forEach((d: OfficeDocItem) => {
      if (d.isRequired && !d.isUploaded) {
        newErrors[d.id] = `${d.title} is required`
      }
    })
    const unuploadedDoc = docs.find((d: OfficeDocItem) => d.isRequired && !d.isUploaded)
    if (unuploadedDoc) {
      newErrors.docs = `Please upload mandatory document: ${unuploadedDoc.title}`
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    navigate(routePaths.incorporation.promoterDetails)
  }

  const renderInput = (
    label: string,
    field: keyof typeof addressData & string,
    placeholder: string,
    type = 'text'
  ) => (
    <div className="reg-office-group">
      <label className="reg-office-label">{label}<span className="reg-office-required"> *</span></label>
      <input
        type={type}
        className={`reg-office-input ${errors[field] ? 'reg-office-input--error' : ''}`}
        placeholder={placeholder}
        value={addressData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
      />
      {errors[field] && <span className="reg-office-field-error">{errors[field]}</span>}
    </div>
  )

  return (
    <div className="reg-office-page">
      {/* Step Progress Tracker */}
      <div className="reg-office-stepbar">
        <span className="reg-office-stepbar__badge">Step 3 of 11</span>
        <div className="reg-office-stepbar__line">
          <div className="reg-office-stepbar__line-fill" />
        </div>
      </div>

      {/* Page Header */}
      <header className="reg-office-header">
        <h1 className="reg-office-header__title">Registered Office Details</h1>
        <p className="reg-office-header__subtitle">
          Provide official communication address for MCA, ROC, and statutory authorities.
        </p>
      </header>

      {/* Address Form Section */}
      <section className="reg-office-section">
        {renderInput('Building / Premises Address Line', 'addressLine1', 'Enter building / premises address')}

        <div className="reg-office-row-2">
          {renderInput('City', 'city', 'Enter city')}
          {renderInput('District', 'district', 'Enter district')}
        </div>

        <div className="reg-office-row-2">
          {renderInput('State', 'state', 'Enter state')}
          {renderInput('PIN Code', 'pincode', 'Enter 6-digit PIN code')}
        </div>

        <div className="reg-office-group">
          <label className="reg-office-label">
            Premises Ownership Status<span className="reg-office-required"> *</span>
          </label>
          <div className={`reg-office-chips ${errors.ownershipStatus ? 'reg-office-chips--error' : ''}`}>
            {ownershipOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`reg-office-chip ${addressData.ownershipStatus === opt ? 'reg-office-chip--active' : ''}`}
                onClick={() => handleInputChange('ownershipStatus', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          {errors.ownershipStatus && <span className="reg-office-field-error">{errors.ownershipStatus}</span>}
        </div>

        <div className="reg-office-info-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            Proof of address (Electricity Bill / Rent Agreement) is mandatory. If premises are rented, leased, or owned by a Director or third party, a No Objection Certificate (NOC) from the owner is strictly required.
          </span>
        </div>

        <div className="reg-office-row-2">
          {renderInput('Company Email', 'email', 'Enter company email address', 'email')}
          {renderInput('Mobile', 'mobile', 'Enter 10-digit mobile number', 'tel')}
        </div>
      </section>

      {/* Section: Mandatory Documents */}
      <section className="reg-office-section">
        <h2 className="reg-office-section__title">Mandatory Documents</h2>

        <div className="reg-office-docs-list">
          {docs.map((doc: OfficeDocItem) => (
            <div key={doc.id} className="reg-office-doc-item-wrapper">
              <DocumentCard
                id={doc.id}
                title={doc.title}
                subtitle={doc.subtitle}
                isRequired={doc.isRequired}
                isUploaded={doc.isUploaded}
                fileName={doc.fileName}
                className={errors[doc.id] ? 'loan-doc-item--error doc-card--error' : ''}
                onUpload={(_, file) => handleUploadDoc(doc.id, file)}
                onRemove={() => handleRemoveDoc(doc.id)}
              />
              {errors[doc.id] && <span className="reg-office-field-error">{errors[doc.id]}</span>}
            </div>
          ))}
        </div>
        {errors.docs && <span className="reg-office-field-error reg-office-field-error--spaced">{errors.docs}</span>}
      </section>

      {/* Footer Navigation */}
      <StepActionBar
        onBack={() => navigate(routePaths.incorporation.companyDetails)}
        onNext={handleContinue}
        onSaveDraft={() => navigate(routePaths.dashboard)}
        nextLabel="Continue"
      />
    </div>
  )
}

export default RegisteredOffice
