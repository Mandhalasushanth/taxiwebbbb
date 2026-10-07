import React, { useState, useEffect } from "react";
import { useAuthStore } from "@store/index";
import { authStorage } from "@core/auth";
import { StepActionBar } from "@shared/components";
import {
  validatePan,
  validateMobileNumber,
  validateIfsc,
  validateBankAccNumber,
  validateName,
  validateEmail,
} from "@shared/utils/validationUtils";
import {
  EMPTY_BANK,
  EMPTY_TAX,
  fetchIfscDetails,
  syncProfileWithAuthUser,
  type TdsTaxpayerProfile,
} from "@modules/itr/utils/tdsRefund.constants";
import type {
  TdsBankDetails,
  TdsIncomeTaxData,
} from "@modules/itr/types/tdsRefund.types";
import { TdsRefundProgressTracker } from "../TdsRefundOverview";
import { TdsRefundPrelimBanner } from "./TdsRefundSidePanels";
import { getResolvedProfile, parseAmount } from "./tdsCustomerIncome.helpers";
import { TdsPersonalDetailsCard } from "./TdsPersonalDetailsCard";
import { TdsBankDetailsCard } from "./TdsBankDetailsCard";
import { TdsIncomeCards } from "./TdsIncomeCards";
import "./TdsRefundCustomerIncome.css";
import "./TdsRefundCustomerIncome.part2.css";
import "./TdsRefundFieldError.css";
import { errorTracker } from '@core/errors'

export type { TdsBankDetails, TdsIncomeTaxData };
export { TdsRefundPrelimBanner, TdsRefundProgressionSidebar } from "./TdsRefundSidePanels";

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
  initialTaxData,
  onTaxChange,
}) => {
  const authUser = useAuthStore((state) => state.user) || authStorage.getUser();
  const [profile, setProfile] = useState<TdsTaxpayerProfile>(() =>
    getResolvedProfile(initialProfile, authUser),
  );
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isFetchingIfsc, setIsFetchingIfsc] = useState(false);
  const [bankDetails, setBankDetails] = useState<TdsBankDetails>(
    initialBankDetails || { ...EMPTY_BANK },
  );
  const [taxData, setTaxData] = useState<TdsIncomeTaxData>(
    initialTaxData || { ...EMPTY_TAX },
  );

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

  const handleProfileChange = (updated: Partial<TdsTaxpayerProfile>) => {
    if (error) setError(null);
    const next = { ...profile, ...updated };
    setProfile(next);
    onProfileChange?.(next);
    const changedKey = Object.keys(updated)[0];
    if (changedKey && fieldErrors[changedKey]) {
      setFieldErrors((prev) => ({ ...prev, [changedKey]: "" }));
    }
  };

  const handleBankChange = (updated: Partial<TdsBankDetails>) => {
    if (error) setError(null);
    const next = { ...bankDetails, ...updated };
    setBankDetails(next);
    onBankChange?.(next);
    const changedKey = Object.keys(updated)[0];
    if (changedKey && fieldErrors[changedKey]) {
      setFieldErrors((prev) => ({ ...prev, [changedKey]: "" }));
    }
  };

  const handleTaxChange = (updated: Partial<TdsIncomeTaxData>) => {
    const next = { ...taxData, ...updated };
    setTaxData(next);
    onTaxChange?.(next);
    const changedKey = Object.keys(updated)[0];
    if (changedKey && fieldErrors[changedKey]) {
      setFieldErrors((prev) => ({ ...prev, [changedKey]: "" }));
    }
  };

  const handleIfscChange = async (rawVal: string) => {
    try {
      const formatted = rawVal
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 11);
      handleBankChange({ ifsc: formatted });
      if (formatted.length === 11) {
        setIsFetchingIfsc(true);
        try {
          const match = await fetchIfscDetails(formatted);
          if (match)
            handleBankChange({
              ifsc: formatted,
              bankName: match.bankName,
              branch: match.branch,
            });
        } finally {
          setIsFetchingIfsc(false);
        }
      } else if (formatted === "") {
        handleBankChange({ ifsc: "", bankName: "", branch: "" });
      }
    } catch {
      setIsFetchingIfsc(false);
    }
  };

  const handleContinue = (e?: React.FormEvent) => {
    try {
      if (e) e.preventDefault();
      setError(null);
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

      if (!bankDetails.accountHolder?.trim()) {
        errs.accountHolder = "Account holder name is required";
      }

      const acct = bankDetails.accountNumber?.trim() || "";
      const confirmAcct = bankDetails.confirmAccountNumber?.trim() || "";
      const ifsc = bankDetails.ifsc?.trim() || "";

      if (!acct) {
        errs.accountNumber = "Bank account number is required";
      } else {
        const err = validateBankAccNumber(acct);
        if (err) errs.accountNumber = err;
      }

      if (!confirmAcct) {
        errs.confirmAccountNumber = "Bank account number is required";
      } else if (acct !== confirmAcct) {
        errs.confirmAccountNumber = "Account numbers do not match";
      }

      if (!ifsc) {
        errs.ifsc = "IFSC code is required";
      } else {
        const err = validateIfsc(ifsc);
        if (err) errs.ifsc = err;
      }

      if (!taxData.salaryIncome?.trim() || parseAmount(taxData.salaryIncome) <= 0) {
        errs.salaryIncome = "Salaried Gross Income is required";
      }

      if (parseAmount(taxData.totalTdsDeducted) <= 0) {
        errs.totalTdsDeducted = "Total TDS Deducted is required";
      }

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setError(Object.values(errs)[0]);
        if (errs.fullName || errs.pan) {
          setIsEditingPersonal(true);
        }
        return;
      }

      setFieldErrors({});
      onNext();
    } catch {
      onNext();
    }
  };

  const totalTaxCredits =
    parseAmount(taxData.totalTdsDeducted) +
    parseAmount(taxData.tcsAmount) +
    parseAmount(taxData.advanceTax) +
    parseAmount(taxData.selfAssessmentTax);
  const computedRefundTotal =
    totalTaxCredits > 0
      ? `₹${totalTaxCredits.toLocaleString("en-IN")}`
      : profile.preliminaryRefund || "₹0";

  const isProfileValid = Boolean(
    profile.fullName?.trim() &&
    profile.pan?.trim() &&
    profile.pan.trim().length === 10,
  );
  const isFormValid = Boolean(
    isProfileValid &&
    bankDetails.accountHolder?.trim() &&
    bankDetails.accountNumber?.trim() &&
    bankDetails.accountNumber.trim().length >= 10 &&
    bankDetails.accountNumber.trim().length <= 15 &&
    bankDetails.confirmAccountNumber?.trim() &&
    bankDetails.accountNumber.trim() ===
      bankDetails.confirmAccountNumber.trim() &&
    bankDetails.ifsc?.trim().length === 11 &&
    taxData.salaryIncome?.trim() &&
    parseAmount(taxData.salaryIncome) > 0 &&
    parseAmount(taxData.totalTdsDeducted) > 0,
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
      <TdsRefundPrelimBanner
        assessmentYear={profile.assessmentYear || "AY 2026-27"}
        refundAmount={computedRefundTotal}
      />
      <div className="tds-step1-layout">
        <form className="tds-step1-main" onSubmit={handleContinue}>
          <TdsPersonalDetailsCard
            profile={profile}
            fieldErrors={fieldErrors}
            isEditingPersonal={isEditingPersonal}
            setIsEditingPersonal={setIsEditingPersonal}
            handleProfileChange={handleProfileChange}
          />

          <TdsBankDetailsCard
            bankDetails={bankDetails}
            fieldErrors={fieldErrors}
            isFetchingIfsc={isFetchingIfsc}
            handleBankChange={handleBankChange}
            handleIfscChange={handleIfscChange}
          />

          <TdsIncomeCards
            taxData={taxData}
            fieldErrors={fieldErrors}
            handleTaxChange={handleTaxChange}
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
