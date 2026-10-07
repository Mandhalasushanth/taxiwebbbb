import { SaveDraftButton } from '@shared/saveDraft'
import { UpdateAndReviewButton } from '@shared/edit'
import { GST_FILE_MESSAGES } from '@modules/gst/utils/gstFile'
import { collectGstErrors } from '@modules/gst/validation/gstFieldRules'
import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { gstFieldRules as rules } from '@modules/gst/validation/gstFieldRules'
import GSTAmendmentAddressFields from './GSTAmendmentAddressFields'
import { GSTProofUpload } from '@modules/gst/shared/GSTProofUpload'
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
  currentDetails: _currentDetails,
  initialDetails,
  initialFile,
  initialFileName,
  initialFileSize,
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
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null)
  const [removedInitialFile, setRemovedInitialFile] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialDetails) {
      if (initialDetails.address !== undefined) setAddress(initialDetails.address)
      if (initialDetails.city !== undefined) setCity(initialDetails.city)
      if (initialDetails.district !== undefined) setDistrict(initialDetails.district)
      if (initialDetails.state !== undefined) setStateUt(initialDetails.state)
      if (initialDetails.pinCode !== undefined) setPinCode(initialDetails.pinCode)
      if (initialDetails.natureOfPremises !== undefined) setNatureOfPremises(initialDetails.natureOfPremises)
    }
  }, [initialDetails])

  useEffect(() => {
    if (initialFile !== undefined) {
      setSelectedFile(initialFile)
      if (initialFile) setRemovedInitialFile(false)
    }
  }, [initialFile])

  const effectiveFileName = !removedInitialFile ? (selectedFile?.name || initialFileName) : selectedFile?.name

  const handlePinCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    if (val.length <= 6) {
      setPinCode(val)
      if (errors.pinCode) setErrors((prev) => ({ ...prev, pinCode: '' }))
    }
  }

  // Type, size and content are already checked by the shared upload rule
  const handleFileChange = (file: File) => {
    setSelectedFile(file)
    setRemovedInitialFile(false)
    setErrors((prev) => ({ ...prev, file: '' }))
  }

  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    const newErrors = collectGstErrors({
      address: rules.address('Business address')(address),
      city: rules.placeName('City')(city),
      district: isAdditionalPlace ? undefined : rules.placeName('District')(district),
      stateUt: isAdditionalPlace || stateUt ? undefined : 'Please select state / UT.',
      pinCode: rules.pinCode(pinCode),
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

  return (
    <div className="gst-amend-detail-container">
      {/* Header Row */}
      <div className="gst-amend-detail-header-row">
        <div className="gst-amend-detail-header">
          <div className="gst-amend-title-with-icon">
            {isAdditionalPlace && (
              <div className="gst-amend-title-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
            )}
            <div>
              <h1 className="gst-amend-detail-title">{title}</h1>
            </div>
          </div>
        </div>

        {isAdditionalPlace && (
          <div className="gst-amend-additional-notice-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="gst-amend-notice-icon">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              You are updating an additional place of business. This is an extra business location apart from your principal place of business.
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmitForm} noValidate>
        <div className="gst-amend-detail-grid">
          <main className="gst-amend-detail-main">
            {/* New details */}
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
                if (errors.address) setErrors((prev) => ({ ...prev, address: '' }))
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
                if (errors.city) setErrors((prev) => ({ ...prev, city: '' }))
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
                if (errors.district) setErrors((prev) => ({ ...prev, district: '' }))
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
                if (errors.stateUt) setErrors((prev) => ({ ...prev, stateUt: '' }))
                onChange?.({
                  newValue: `${address.trim()}, ${city.trim()}, ${district.trim()}, ${val} - ${pinCode} (${natureOfPremises})`,
                  file: selectedFile,
                  fileName: effectiveFileName,
                  fileSizeText: initialFileSize,
                  addressDetails: { address: address.trim(), city: city.trim(), district: district.trim(), state: val, pinCode: pinCode.trim(), natureOfPremises },
                })
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

            {/* Supporting proof */}
            <GSTProofUpload
              selectedFile={selectedFile}
              existingFileName={!selectedFile ? effectiveFileName : undefined}
              existingFileSize={initialFileSize}
              error={errors.file}
              onFileSelect={handleFileChange}
              onRemoveFile={() => {
                setSelectedFile(null)
                setRemovedInitialFile(true)
              }}
            />
          </main>
        </div>

        {/* Bottom Actions Row */}
        <div className="gst-amend-detail-actions-row">
          <button type="button" onClick={onBack} className="gst-amend-back-pill-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <div className="form-actions-group">
            {onSaveDraft && (
              <SaveDraftButton
                onClick={() => {
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
                }}
              />
            )}
            {isEditMode ? (
              <UpdateAndReviewButton
                type="submit"
                isSubmitting={isSubmitting}
              />
            ) : (
              <button type="submit" disabled={isSubmitting} className="gst-amend-submit-orange-btn">
                {isSubmitting ? 'Submitting...' : 'Review Changes'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default GSTAmendmentAddressForm
