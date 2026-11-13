import { GST_FILE_MESSAGES } from '@modules/gst/utils/gstFile'
import { collectGstErrors } from '@modules/gst/validation/gstFieldRules'
import React, { useState, type ChangeEvent, type FormEvent } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { gstFieldRules as rules } from '@modules/gst/validation/gstFieldRules'
import GSTAmendmentAddressFields from './GSTAmendmentAddressFields'
import { GSTProofUpload } from '@modules/gst/shared/GSTProofUpload'
import { useAmendmentFileState } from '../hooks/useAmendmentFileState'
import { GSTCurrentPortalCard } from './GSTCurrentPortalCard'
import { GSTAmendmentActionBar } from './GSTAmendmentActionBar'
import './GSTAmendmentDetailForm.css'

export interface AddressDetails {
  address: string
  city: string
  district?: string
  state?: string
  pinCode: string
  natureOfPremises?: string
}

interface GSTAmendmentAddressFormProps {
  title?: string
  currentDetails?: AddressDetails
  initialDetails?: AddressDetails
  initialFile?: File | null
  initialFileName?: string
  initialFileSize?: string
  proofs?: string[]
  isSubmitting?: boolean
  isEditMode?: boolean
  onBack: () => void
  onSaveDraft?: (data?: {
    newValue: string
    file: File | null
    fileName?: string
    fileSizeText?: string
    addressDetails?: AddressDetails
  }) => void
  onSubmit: (payload: {
    newValue: string
    file: File | null
    fileName?: string
    fileSizeText?: string
    addressDetails?: AddressDetails
  }) => void
  onChange?: (data: {
    newValue: string
    file: File | null
    fileName?: string
    fileSizeText?: string
    addressDetails?: AddressDetails
  }) => void
}

export const GSTAmendmentAddressForm: React.FC<GSTAmendmentAddressFormProps> = ({
  title = 'Principal Place of Business',
  currentDetails,
  initialDetails,
  initialFile,
  initialFileName,
  initialFileSize,
  proofs,
  isSubmitting = false,
  isEditMode = false,
  onBack,
  onSubmit,
  onSaveDraft,
  onChange,
}) => {
  const isAdditionalPlace = title === 'Additional Place of Business'

  const [address, setAddress] = useState(initialDetails?.address || '')
  const [city, setCity] = useState(initialDetails?.city || '')
  const [district, setDistrict] = useState(initialDetails?.district || '')
  const [stateUt, setStateUt] = useState(initialDetails?.state || '')
  const [pinCode, setPinCode] = useState(initialDetails?.pinCode || '')
  const [natureOfPremises, setNatureOfPremises] = useState(initialDetails?.natureOfPremises || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const {
    selectedFile,
    effectiveFileName,
    handleFileChange: onFileChange,
    handleFileRemove,
  } = useAmendmentFileState({
    initialFile,
    initialFileName,
    initialFileSize,
    onFileCleared: () => setErrors((prev) => ({ ...prev, file: '' })),
  })

  const handleFileChange = (file: File) => {
    onFileChange(file)
    setErrors((prev) => ({ ...prev, file: '' }))
  }

  const handlePinCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    if (val.length <= 6) {
      setPinCode(val)
      if (errors.pinCode) {
        const err = rules.pinCode(val, isAdditionalPlace ? undefined : stateUt)
        setErrors((prev) => ({ ...prev, pinCode: err || '' }))
      }
    }
  }

  const [prevDetails, setPrevDetails] = useState(initialDetails)
  if (prevDetails !== initialDetails) {
    setPrevDetails(initialDetails)
    if (initialDetails) {
      if (initialDetails.address !== undefined) setAddress(initialDetails.address)
      if (initialDetails.city !== undefined) setCity(initialDetails.city)
      if (initialDetails.district !== undefined) setDistrict(initialDetails.district)
      if (initialDetails.state !== undefined) setStateUt(initialDetails.state)
      if (initialDetails.pinCode !== undefined) setPinCode(initialDetails.pinCode)
      if (initialDetails.natureOfPremises !== undefined) setNatureOfPremises(initialDetails.natureOfPremises)
    }
  }

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    const newErrors = collectGstErrors({
      address: rules.address('Business address')(address),
      city: rules.placeName('City')(city),
      district: isAdditionalPlace ? undefined : rules.placeName('District')(district),
      stateUt: isAdditionalPlace || stateUt ? undefined : 'Please select state / UT.',
      pinCode: rules.pinCode(pinCode, isAdditionalPlace ? undefined : stateUt),
    })
    if (!natureOfPremises) newErrors.natureOfPremises = 'Please select nature of premises.'
    if (!selectedFile && !effectiveFileName) newErrors.file = GST_FILE_MESSAGES.proofRequired

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const formattedNewValue = isAdditionalPlace
      ? `${address.trim()}, ${city.trim()} - ${pinCode} (${natureOfPremises})`
      : `${address.trim()}, ${city.trim()}, ${district.trim()}, ${stateUt} - ${pinCode} (${natureOfPremises})`

    const addressDetailsData: AddressDetails = {
      address: address.trim(),
      city: city.trim(),
      district: district.trim(),
      state: stateUt,
      pinCode: pinCode.trim(),
      natureOfPremises,
    }

    setErrors({})
    onSubmit({
      newValue: formattedNewValue,
      file: selectedFile,
      fileName: effectiveFileName,
      fileSizeText: initialFileSize,
      addressDetails: addressDetailsData,
    })
  }

  const handleBackClick = () => {
    const hasEnteredData = Boolean(
      address.trim() ||
      city.trim() ||
      district.trim() ||
      pinCode.trim() ||
      stateUt ||
      natureOfPremises ||
      selectedFile ||
      effectiveFileName
    )
    if (hasEnteredData && onSaveDraft) {
      const formattedVal = isAdditionalPlace
        ? `${address.trim()}, ${city.trim()} - ${pinCode} (${natureOfPremises})`
        : `${address.trim()}, ${city.trim()}, ${district.trim()}, ${stateUt} - ${pinCode} (${natureOfPremises})`
      onSaveDraft({
        newValue: formattedVal,
        file: selectedFile,
        fileName: effectiveFileName,
        fileSizeText: initialFileSize,
        addressDetails: {
          address: address.trim(),
          city: city.trim(),
          district: district.trim(),
          state: stateUt,
          pinCode: pinCode.trim(),
          natureOfPremises,
        },
      })
    } else {
      onBack()
    }
  }

  return (
    <div className="gst-amend-detail-container">
      {/* Header */}
      <div className="gst-amend-detail-header">
        <h1 className="gst-amend-detail-title">{title}</h1>
        <p className="gst-amend-detail-subtitle">Core field amendment</p>
      </div>

      <form onSubmit={handleSubmitForm} noValidate>
        <div className="gst-amend-detail-grid">
          <main className="gst-amend-detail-main">
            {/* Card 1: Currently Registered on Portal */}
            <GSTCurrentPortalCard
              rows={
                isAdditionalPlace
                  ? [
                      {
                        label: 'Additional Address',
                        value:
                          currentDetails?.address && currentDetails.address !== 'None on record'
                            ? currentDetails.address
                            : '-',
                      },
                      {
                        label: 'City / PIN',
                        value:
                          currentDetails?.city && currentDetails?.pinCode && currentDetails.city !== '—' && currentDetails.pinCode !== '—'
                            ? `${currentDetails.city} / ${currentDetails.pinCode}`
                            : '---',
                      },
                    ]
                  : [
                      {
                        label: 'Address',
                        value: currentDetails?.address || '-',
                      },
                      {
                        label: 'City / State',
                        value:
                          currentDetails?.city && currentDetails?.state
                            ? `${currentDetails.city}, ${currentDetails.state}`
                            : '-, ---',
                      },
                    ]
              }
            />

            {/* New details */}
            <div id="gst-amend-details">
            <GSTAmendmentAddressFields
              isAdditionalPlace={isAdditionalPlace}
              address={address}
              city={city}
              district={district}
              stateUt={stateUt}
              pinCode={pinCode}
              natureOfPremises={natureOfPremises}
              errors={errors}
              onAddressChange={(val) => {
                const updated = gstInput.address(val)
                setAddress(updated)
                if (errors.address) {
                  const err = rules.address('Business address')(updated)
                  setErrors((prev) => ({ ...prev, address: err || '' }))
                }
                onChange?.({
                  newValue: isAdditionalPlace
                    ? `${updated.trim()}, ${city.trim()} - ${pinCode} (${natureOfPremises})`
                    : `${updated.trim()}, ${city.trim()}, ${district.trim()}, ${stateUt} - ${pinCode} (${natureOfPremises})`,
                  file: selectedFile,
                  fileName: effectiveFileName,
                  fileSizeText: initialFileSize,
                  addressDetails: { address: updated.trim(), city: city.trim(), district: district.trim(), state: stateUt, pinCode: pinCode.trim(), natureOfPremises },
                })
              }}
              onCityChange={(val) => {
                const updated = gstInput.letters(val, 50)
                setCity(updated)
                if (errors.city) {
                  const err = rules.placeName('City')(updated)
                  setErrors((prev) => ({ ...prev, city: err || '' }))
                }
                onChange?.({
                  newValue: isAdditionalPlace
                    ? `${address.trim()}, ${updated.trim()} - ${pinCode} (${natureOfPremises})`
                    : `${address.trim()}, ${updated.trim()}, ${district.trim()}, ${stateUt} - ${pinCode} (${natureOfPremises})`,
                  file: selectedFile,
                  fileName: effectiveFileName,
                  fileSizeText: initialFileSize,
                  addressDetails: { address: address.trim(), city: updated.trim(), district: district.trim(), state: stateUt, pinCode: pinCode.trim(), natureOfPremises },
                })
              }}
              onDistrictChange={(val) => {
                const updated = gstInput.letters(val, 50)
                setDistrict(updated)
                if (errors.district) {
                  const err = rules.placeName('District')(updated)
                  setErrors((prev) => ({ ...prev, district: err || '' }))
                }
                onChange?.({
                  newValue: `${address.trim()}, ${city.trim()}, ${updated.trim()}, ${stateUt} - ${pinCode} (${natureOfPremises})`,
                  file: selectedFile,
                  fileName: effectiveFileName,
                  fileSizeText: initialFileSize,
                  addressDetails: { address: address.trim(), city: city.trim(), district: updated.trim(), state: stateUt, pinCode: pinCode.trim(), natureOfPremises },
                })
              }}
              onStateUtChange={(val) => {
                setStateUt(val)
                if (errors.stateUt) {
                  const err = val ? undefined : 'Please select state / UT.'
                  setErrors((prev) => ({ ...prev, stateUt: err || '' }))
                }
                if (pinCode && !isAdditionalPlace) {
                  const pinErr = rules.pinCode(pinCode, val)
                  setErrors((prev) => ({ ...prev, pinCode: pinErr || '' }))
                }
                onChange?.({
                  newValue: `${address.trim()}, ${city.trim()}, ${district.trim()}, ${val} - ${pinCode} (${natureOfPremises})`,
                  file: selectedFile,
                  fileName: effectiveFileName,
                  fileSizeText: initialFileSize,
                  addressDetails: { address: address.trim(), city: city.trim(), district: district.trim(), state: val, pinCode: pinCode.trim(), natureOfPremises },
                })
              }}
              onAddressBlur={() => {
                const err = rules.address('Business address')(address)
                setErrors((prev) => ({ ...prev, address: err || '' }))
              }}
              onCityBlur={() => {
                const err = rules.placeName('City')(city)
                setErrors((prev) => ({ ...prev, city: err || '' }))
              }}
              onDistrictBlur={() => {
                if (isAdditionalPlace) return
                const err = rules.placeName('District')(district)
                setErrors((prev) => ({ ...prev, district: err || '' }))
              }}
              onStateUtBlur={() => {
                if (isAdditionalPlace) return
                const err = stateUt ? undefined : 'Please select state / UT.'
                setErrors((prev) => ({ ...prev, stateUt: err || '' }))
              }}
              onPinCodeBlur={() => {
                const err = rules.pinCode(pinCode, isAdditionalPlace ? undefined : stateUt)
                setErrors((prev) => ({ ...prev, pinCode: err || '' }))
              }}
              onPinCodeChange={(e) => {
                handlePinCodeChange(e)
                const val = e.target.value.replace(/[^0-9]/g, '')
                onChange?.({
                  newValue: isAdditionalPlace
                    ? `${address.trim()}, ${city.trim()} - ${val} (${natureOfPremises})`
                    : `${address.trim()}, ${city.trim()}, ${district.trim()}, ${stateUt} - ${val} (${natureOfPremises})`,
                  file: selectedFile,
                  fileName: effectiveFileName,
                  fileSizeText: initialFileSize,
                  addressDetails: { address: address.trim(), city: city.trim(), district: district.trim(), state: stateUt, pinCode: val, natureOfPremises },
                })
              }}
              onNatureOfPremisesChange={(val) => {
                setNatureOfPremises(val)
                if (errors.natureOfPremises) setErrors((prev) => ({ ...prev, natureOfPremises: '' }))
                onChange?.({
                  newValue: isAdditionalPlace
                    ? `${address.trim()}, ${city.trim()} - ${pinCode} (${val})`
                    : `${address.trim()}, ${city.trim()}, ${district.trim()}, ${stateUt} - ${pinCode} (${val})`,
                  file: selectedFile,
                  fileName: effectiveFileName,
                  fileSizeText: initialFileSize,
                  addressDetails: { address: address.trim(), city: city.trim(), district: district.trim(), state: stateUt, pinCode: pinCode.trim(), natureOfPremises: val },
                })
              }}
            />
            </div>

            {/* Supporting proof */}
            <div id="gst-amend-proof">
              <div className="gst-amend-section-heading">Supporting Proof</div>
              <GSTProofUpload
                selectedFile={selectedFile}
                existingFileName={!selectedFile ? effectiveFileName : undefined}
                existingFileSize={initialFileSize}
                error={errors.file}
                onFileSelect={handleFileChange}
                onRemoveFile={handleFileRemove}
              />
            </div>

            {/* Accepted proofs */}
            {proofs && proofs.length > 0 && (
              <div className="gst-amend-accepted-proofs-card">
                <div className="gst-amend-accepted-proofs-header">
                  <div className="gst-amend-accepted-proofs-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <span className="gst-amend-accepted-proofs-title">Accepted proofs</span>
                </div>
                <ul className="gst-amend-accepted-proofs-list">
                  {(isExpanded ? proofs : proofs.slice(0, 3)).map((proof, idx) => (
                    <li key={idx} className="gst-amend-accepted-proofs-item">
                      • {proof}
                    </li>
                  ))}
                </ul>
                {proofs.length > 3 && (
                  <button
                    type="button"
                    className="gst-amend-view-more-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? (
                      <>
                        View Less{' '}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </>
                    ) : (
                      <>
                        View More{' '}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Bottom Actions Row */}
        <GSTAmendmentActionBar
          onBack={handleBackClick}
          onSaveDraft={
            onSaveDraft
              ? () => {
                  const formattedVal = isAdditionalPlace
                    ? `${address.trim()}, ${city.trim()} - ${pinCode} (${natureOfPremises})`
                    : `${address.trim()}, ${city.trim()}, ${district.trim()}, ${stateUt} - ${pinCode} (${natureOfPremises})`
                  onSaveDraft({
                    newValue: formattedVal,
                    file: selectedFile,
                    fileName: effectiveFileName,
                    fileSizeText: initialFileSize,
                    addressDetails: {
                      address: address.trim(),
                      city: city.trim(),
                      district: district.trim(),
                      state: stateUt,
                      pinCode: pinCode.trim(),
                      natureOfPremises,
                    },
                  })
                }
              : undefined
          }
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
        />
      </form>
    </div>
  )
}

export default GSTAmendmentAddressForm
