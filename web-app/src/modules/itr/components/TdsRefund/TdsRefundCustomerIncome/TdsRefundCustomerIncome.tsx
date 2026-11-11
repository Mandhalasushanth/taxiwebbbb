import React, { useState, useEffect } from "react";
import { useAuthStore } from "@store/index";
import { authStorage } from "@core/auth";
import { StepActionBar } from "@shared/components";
import {
  validatePan,
  validateMobileNumber,
  validateName,
  validateEmail,
  validateDob,
} from "@shared/utils/validationUtils";
import {
  EMPTY_BANK,
  EMPTY_BUSINESS,
  syncProfileWithAuthUser,
  type TdsTaxpayerProfile,
} from "@modules/itr/utils/tdsRefund.constants";
import type {
  TdsBankDetails,
  TdsBusinessDetails,
  TdsIncomeTaxData,
} from "@modules/itr/types/tdsRefund.types";
import { TdsRefundProgressTracker } from "../TdsRefundOverview";
import { getResolvedProfile } from "./tdsCustomerIncome.helpers";
import { TdsPersonalDetailsCard } from "./TdsPersonalDetailsCard";
import { TdsBankDetailsCard } from "./TdsBankDetailsCard";
import { TdsBusinessDetailsCard } from "./TdsBusinessDetailsCard";
import {
  getBusinessDetailsErrors,
  isBusinessDetailsValid,
  validateBusinessField,
  validateIfscCode,
  validateAccountNumber,
  validateConfirmAccountNumber,
  validateAccountHolder,
} from "./tdsBusinessValidation";
import "./TdsRefundCustomerIncome.css";
import "./TdsRefundCustomerIncome.part2.css";
import "./TdsRefundFieldError.css";
import { errorTracker } from '@core/errors'

export type { TdsBankDetails, TdsIncomeTaxData };
export { TdsRefundProgressionSidebar } from "./TdsRefundSidePanels";

export interface TdsRefundCustomerIncomeProps {
  onBack: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  /** Opened with "Edit" from the review: the main button reads "Update & Review" */
  isEditMode?: boolean;
  currentStep?: number;
  initialProfile?: TdsTaxpayerProfile;
  onProfileChange?: (profile: TdsTaxpayerProfile) => void;
  initialBankDetails?: TdsBankDetails;
  onBankChange?: (details: TdsBankDetails) => void;
  initialBusinessDetails?: TdsBusinessDetails;
  onBusinessChange?: (details: TdsBusinessDetails) => void;
  initialTaxData?: TdsIncomeTaxData;
  onTaxChange?: (data: TdsIncomeTaxData) => void;
}

export type TdsRefundStepCustomerIncomeProps = TdsRefundCustomerIncomeProps;

export const TdsRefundCustomerIncome: React.FC<
  TdsRefundCustomerIncomeProps
> = ({
  onBack,
  onNext,
  onSaveDraft,
  isEditMode = false,
  currentStep = 1,
  initialProfile,
  onProfileChange,
  initialBankDetails,
  onBankChange,
  initialBusinessDetails,
  onBusinessChange,
}) => {
  const authUser = useAuthStore((state) => state.user) || authStorage.getUser();
  const [profile, setProfile] = useState<TdsTaxpayerProfile>(() =>
    getResolvedProfile(initialProfile, authUser),
  );
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bankDetails, setBankDetails] = useState<TdsBankDetails>(
    initialBankDetails || { ...EMPTY_BANK },
  );
  const [businessDetails, setBusinessDetails] = useState<TdsBusinessDetails>(
    initialBusinessDetails || { ...EMPTY_BUSINESS },
  );
  const [businessErrors, setBusinessErrors] = useState<Record<string, string>>({});

  // Touch tracking to know when a field has been visited or interacted with
  const [businessTouched, setBusinessTouched] = useState<Record<string, boolean>>({});
  const [bankTouched, setBankTouched] = useState<Record<string, boolean>>({});
  const [personalTouched, setPersonalTouched] = useState<Record<string, boolean>>({});

  // Auto-fetch and sync personal details if authUser is loaded or updated
  useEffect(() => {
    try {
      if (!authUser) return;
      const timer = setTimeout(() => {
        setProfile((prev) => {
          const { profile: nextProfile, hasChanges } = syncProfileWithAuthUser(
            prev,
            authUser,
          );
          if (hasChanges) {
            onProfileChange?.(nextProfile);
            return nextProfile;
          }
          return prev;
        });
      }, 0);
      return () => clearTimeout(timer);
    } catch (err) {
      errorTracker.captureException(err, { tags: { area: 'tds-personal-sync' } });
    }
  }, [authUser, onProfileChange]);

  // Auto-fill account holder with taxpayer full name if empty
  useEffect(() => {
    try {
      const holderName = profile.fullName || authUser?.fullName || "";
      if (holderName && !bankDetails.accountHolder) {
        const timer = setTimeout(() => {
          setBankDetails((prev) => {
            if (!prev.accountHolder) {
              const next = { ...prev, accountHolder: holderName };
              onBankChange?.(next);
              return next;
            }
            return prev;
          });
        }, 0);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      errorTracker.captureException(err, { tags: { area: 'tds-account-holder' } });
    }
  }, [
    profile.fullName,
    authUser?.fullName,
    bankDetails.accountHolder,
    onBankChange,
  ]);

  /* ------------------- Personal Details Validation ------------------- */
  const validatePersonalField = (field: string, currentProfile: TdsTaxpayerProfile): string | null => {
    switch (field) {
      case 'fullName':
        if (!currentProfile.fullName?.trim()) return 'Name is required';
        return validateName(currentProfile.fullName);
      case 'pan':
        if (!currentProfile.pan?.trim()) return 'PAN is required';
        return validatePan(currentProfile.pan);
      case 'mobile':
        if (!currentProfile.mobile?.trim()) return null;
        return validateMobileNumber(currentProfile.mobile.replace(/\D/g, '').replace(/^91/, ''));
      case 'aadhaar':
        if (!currentProfile.aadhaar?.trim()) return null;
        return currentProfile.aadhaar.replace(/\D/g, '').length === 12 ? null : 'Enter a valid 12-digit Aadhaar number';
      case 'email':
        if (!currentProfile.email?.trim()) return null;
        return validateEmail(currentProfile.email);
      case 'dob':
        if (!currentProfile.dob?.trim()) return null;
        return validateDob(currentProfile.dob, { label: 'Date of birth', minAge: 18 });
      default:
        return null;
    }
  };

  const handlePersonalBlur = (field: string) => {
    setPersonalTouched((prev) => ({ ...prev, [field]: true }));
    const err = validatePersonalField(field, profile);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const handleProfileChange = (updated: Partial<TdsTaxpayerProfile>) => {
    if (error) setError(null);
    const next = { ...profile, ...updated };
    setProfile(next);
    onProfileChange?.(next);

    const changedKey = Object.keys(updated)[0];
    if (changedKey) {
      const isTouched = personalTouched[changedKey];
      const hasExistingError = Boolean(fieldErrors[changedKey]);
      if (changedKey === 'dob' || isTouched || hasExistingError) {
        const err = validatePersonalField(changedKey, next);
        setFieldErrors((prev) => {
          const nextErrs = { ...prev };
          if (err) nextErrs[changedKey] = err;
          else delete nextErrs[changedKey];
          return nextErrs;
        });
      }
    }
  };

  /* ------------------- Business Details Validation ------------------- */
  const handleBusinessBlur = (field: keyof TdsBusinessDetails) => {
    setBusinessTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateBusinessField(field, businessDetails);
    setBusinessErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const handleBusinessChange = (updated: Partial<TdsBusinessDetails>) => {
    if (error) setError(null);
    const next = { ...businessDetails, ...updated };
    setBusinessDetails(next);
    onBusinessChange?.(next);

    const changedField = Object.keys(updated)[0] as keyof TdsBusinessDetails | undefined;
    if (changedField) {
      const val = (next[changedField] as string) || '';
      const isTouched = businessTouched[changedField];
      const hasExistingError = Boolean(businessErrors[changedField]);

      let shouldValidateLive = isTouched || hasExistingError;

      // Key milestone typing triggers:
      if (changedField === 'legalName') {
        if (/\d/.test(val)) {
          setBusinessErrors((prev) => ({
            ...prev,
            legalName: 'Legal name cannot contain numbers',
          }));
          return;
        } else if (businessErrors.legalName === 'Legal name cannot contain numbers') {
          if (!isTouched) {
            setBusinessErrors((prev) => {
              const nextErrs = { ...prev };
              delete nextErrs.legalName;
              return nextErrs;
            });
            return;
          }
        }
      }
      if (changedField === 'pan' && val.length === 10) shouldValidateLive = true;
      if (changedField === 'aadhaar' && val.replace(/\D/g, '').length === 12) shouldValidateLive = true;
      if (changedField === 'mobile' && val.replace(/\D/g, '').length === 10) shouldValidateLive = true;

      if (shouldValidateLive) {
        const err = validateBusinessField(changedField, next);
        setBusinessErrors((prev) => {
          const updatedErrs = { ...prev };
          if (err) updatedErrs[changedField] = err;
          else delete updatedErrs[changedField];
          return updatedErrs;
        });
      }
    }
  };

  /* ------------------- Bank Details Validation ------------------- */
  const validateBankField = (field: string, currentBank: TdsBankDetails): string | null => {
    switch (field) {
      case 'accountHolder':
        return validateAccountHolder(currentBank.accountHolder);
      case 'accountNumber':
        return validateAccountNumber(currentBank.accountNumber);
      case 'confirmAccountNumber':
        return validateConfirmAccountNumber(currentBank.confirmAccountNumber, currentBank.accountNumber);
      case 'ifsc':
        return validateIfscCode(currentBank.ifsc);
      default:
        return null;
    }
  };

  const handleBankBlur = (field: string) => {
    setBankTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateBankField(field, bankDetails);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];

      if (field === 'accountNumber' && bankDetails.confirmAccountNumber) {
        const confirmErr = validateConfirmAccountNumber(bankDetails.confirmAccountNumber, bankDetails.accountNumber);
        if (confirmErr) next.confirmAccountNumber = confirmErr;
        else delete next.confirmAccountNumber;
      }
      return next;
    });
  };

  const handleBankChange = (updated: Partial<TdsBankDetails>) => {
    if (error) setError(null);
    const next = { ...bankDetails, ...updated };
    setBankDetails(next);
    onBankChange?.(next);

    const changedField = Object.keys(updated)[0];
    if (changedField) {
      const isTouched = bankTouched[changedField];
      const hasExistingError = Boolean(fieldErrors[changedField]);
      let shouldValidateLive = isTouched || hasExistingError;

      if (changedField === 'confirmAccountNumber') {
        const val = (next.confirmAccountNumber || '').trim();
        const acc = next.accountNumber.trim();
        if (val.length === acc.length && val.length >= 9) {
          shouldValidateLive = true;
        }
      }

      if (shouldValidateLive) {
        const err = validateBankField(changedField, next);
        setFieldErrors((prev) => {
          const updatedErrs = { ...prev };
          if (err) updatedErrs[changedField] = err;
          else delete updatedErrs[changedField];
          return updatedErrs;
        });
      }
    }
  };

  const handleIfscChange = (rawVal: string) => {
    if (error) setError(null);
    const formatted = rawVal
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 11);

    const next = { ...bankDetails, ifsc: formatted };
    setBankDetails(next);
    onBankChange?.(next);

    const isTouched = bankTouched.ifsc;
    const hasExistingError = Boolean(fieldErrors.ifsc);

    if (formatted.length === 11) {
      const err = validateIfscCode(formatted);
      setFieldErrors((prev) => {
        const updatedErrs = { ...prev };
        if (err) updatedErrs.ifsc = err;
        else delete updatedErrs.ifsc;
        return updatedErrs;
      });
    } else if (isTouched || hasExistingError) {
      const err = formatted ? "IFSC code must be exactly 11 characters" : "IFSC code is required";
      setFieldErrors((prev) => {
        const updatedErrs = { ...prev };
        if (err) updatedErrs.ifsc = err;
        else delete updatedErrs.ifsc;
        return updatedErrs;
      });
    }
  };

  /* ------------------- Continue / Submission ------------------- */
  const handleContinue = (e?: React.FormEvent) => {
    try {
      if (e) e.preventDefault();
      setError(null);

      // Mark all fields touched
      setBusinessTouched({ legalName: true, pan: true, aadhaar: true, mobile: true });
      setBankTouched({ accountHolder: true, accountNumber: true, confirmAccountNumber: true, ifsc: true });
      setPersonalTouched({ fullName: true, pan: true });

      const errs: Record<string, string> = {};

      if (!profile.fullName?.trim()) {
        errs.fullName = "Name is required";
      } else {
        const err = validateName(profile.fullName);
        if (err) errs.fullName = err;
      }

      if (!profile.pan?.trim()) {
        errs.pan = "PAN is required";
      } else {
        const err = validatePan(profile.pan);
        if (err) errs.pan = err;
      }

      if (profile.mobile?.trim()) {
        let cleanMobile = profile.mobile.replace(/\D/g, "").trim();
        if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) {
          cleanMobile = cleanMobile.slice(2);
        }
        const err = validateMobileNumber(cleanMobile);
        if (err) errs.mobile = err;
      }

      if (profile.aadhaar?.trim()) {
        const cleanAadhaar = profile.aadhaar.replace(/\D/g, "");
        if (cleanAadhaar.length > 0 && cleanAadhaar.length !== 12) {
          errs.aadhaar = "Enter a valid 12-digit Aadhaar number";
        }
      }

      if (profile.email?.trim()) {
        const err = validateEmail(profile.email);
        if (err) errs.email = err;
      }

      if (profile.dob?.trim()) {
        const err = validateDob(profile.dob, { label: 'Date of birth', minAge: 18 });
        if (err) errs.dob = err;
      }

      const holderErr = validateAccountHolder(bankDetails.accountHolder);
      if (holderErr) errs.accountHolder = holderErr;

      const acctErr = validateAccountNumber(bankDetails.accountNumber);
      if (acctErr) errs.accountNumber = acctErr;

      const confirmErr = validateConfirmAccountNumber(bankDetails.confirmAccountNumber, bankDetails.accountNumber);
      if (confirmErr) errs.confirmAccountNumber = confirmErr;

      const ifscErr = validateIfscCode(bankDetails.ifsc);
      if (ifscErr) errs.ifsc = ifscErr;

      const bizErrs = getBusinessDetailsErrors(businessDetails);
      setBusinessErrors(bizErrs);
      setFieldErrors(errs);

      if (Object.keys(errs).length > 0 || Object.keys(bizErrs).length > 0) {
        setError(Object.values(bizErrs)[0] || Object.values(errs)[0]);
        if (errs.fullName || errs.pan) {
          setIsEditingPersonal(true);
        }
        return;
      }

      onNext();
    } catch {
      onNext();
    }
  };

  const isProfileValid = Boolean(
    profile.fullName?.trim() &&
    profile.pan?.trim() &&
    profile.pan.trim().length === 10,
  );
  const isBankValid = Boolean(
    bankDetails.accountHolder?.trim() &&
    bankDetails.accountNumber?.trim() &&
    bankDetails.accountNumber.trim().length >= 9 &&
    bankDetails.accountNumber.trim().length <= 18 &&
    bankDetails.confirmAccountNumber?.trim() &&
    bankDetails.accountNumber.trim() === bankDetails.confirmAccountNumber.trim() &&
    validateIfscCode(bankDetails.ifsc) === null
  );
  const isFormValid = Boolean(
    isProfileValid &&
    isBusinessDetailsValid(businessDetails) &&
    isBankValid
  );

  const handleContinueRef = React.useRef(handleContinue);
  React.useEffect(() => {
    handleContinueRef.current = handleContinue;
  });

  React.useEffect(() => {
    const handleAttempt = () => {
      handleContinueRef.current();
    };
    window.addEventListener("step-action-bar:submit-attempt", handleAttempt);
    return () =>
      window.removeEventListener(
        "step-action-bar:submit-attempt",
        handleAttempt,
      );
  }, []);

  return (
    <div className="tds-step1-page">
      <TdsRefundProgressTracker currentStep={currentStep} />
      <div className="tds-step1-layout">
        <form className="tds-step1-main" onSubmit={handleContinue}>
          <TdsPersonalDetailsCard
            profile={profile}
            fieldErrors={fieldErrors}
            isEditingPersonal={isEditingPersonal}
            setIsEditingPersonal={setIsEditingPersonal}
            handleProfileChange={handleProfileChange}
            onBlur={handlePersonalBlur}
          />

          <TdsBusinessDetailsCard
            businessDetails={businessDetails}
            fieldErrors={businessErrors}
            handleBusinessChange={handleBusinessChange}
            onBlur={handleBusinessBlur}
          />

          <TdsBankDetailsCard
            bankDetails={bankDetails}
            fieldErrors={fieldErrors}
            handleBankChange={handleBankChange}
            handleIfscChange={handleIfscChange}
            onBlur={handleBankBlur}
          />
        </form>
      </div>
      <StepActionBar
        onBack={onBack}
        onNext={handleContinue}
        onSaveDraft={onSaveDraft}
        isEditMode={isEditMode}
        nextLabel="Continue"
        nextDisabled={!isFormValid}
      />
    </div>
  );
};

export const TdsRefundStepCustomerIncome = TdsRefundCustomerIncome;
export default TdsRefundCustomerIncome;
