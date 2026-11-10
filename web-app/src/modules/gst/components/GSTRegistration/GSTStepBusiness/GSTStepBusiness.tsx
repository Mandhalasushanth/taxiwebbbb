import { useState, type FormEvent, type ChangeEvent } from "react";
import { StepActionBar } from "@shared/components";
import { GSTBusinessDetails } from "../GSTBusinessDetails/GSTBusinessDetails";
import { GSTBankDetails } from "../GSTBankDetails/GSTBankDetails";
import { GSTAuthorisedSignatory } from "../GSTAuthorisedSignatory/GSTAuthorisedSignatory";
import {
  validateGstBusinessForm,
  validateGstBusinessField,
} from "@modules/gst/validation/gstStepBusiness.validator";
import { useGSTSectionFocus } from "@modules/gst/shared/useGSTSectionFocus";
import "./GSTStepBusiness.css";

import {
  type GstBusinessFormData,
  type BusinessFormData,
} from "@modules/gst/types/gstBusiness.types";
export type { GstBusinessFormData, BusinessFormData };

interface GSTStepBusinessProps {
  data: GstBusinessFormData;
  isEditMode?: boolean;
  /** Review section chosen with "Edit" — the matching card is scrolled into view */
  focusSection?: string | null;
  onChange: <K extends keyof GstBusinessFormData>(
    field: K,
    value: GstBusinessFormData[K],
  ) => void;
  onNext: () => void;
  onCancel?: () => void;
  onSaveDraft?: () => void;
}

const AADHAAR_CONSENT_TEXT =
  "I consent to Aadhaar authentication (e-KYC) for this GST registration.";

/** Review "Edit" section → the card that holds those fields */
const SECTION_ANCHORS: Record<string, string> = {
  business: "gst-business-details",
  "business-identity": "gst-business-identity",
  "business-scheme": "gst-registration-scheme",
  "business-address": "gst-principal-place",
  bank: "gst-bank-details",
  signatory: "gst-authorised-signatory",
};

export const GSTStepBusiness = ({
  data,
  isEditMode = false,
  focusSection = null,
  onChange,
  onNext,
  onCancel,
  onSaveDraft,
}: GSTStepBusinessProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Opened from a Review "Edit": smoothly scroll to the chosen card
  useGSTSectionFocus(focusSection, SECTION_ANCHORS);

  const clearErr = (k: string) => {
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const { [k]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleBlur = (field: keyof GstBusinessFormData) => {
    const err = validateGstBusinessField(field, data);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) {
        next[field] = err;
      } else {
        delete next[field];
      }

      // Check dependent cross-field errors on blur
      if (field === "constitution" && data.businessPan) {
        const panErr = validateGstBusinessField("businessPan", data);
        if (panErr) next.businessPan = panErr;
        else delete next.businessPan;
      }
      if (field === "accountNumber" && data.confirmAccountNumber) {
        const confErr = validateGstBusinessField("confirmAccountNumber", data);
        if (confErr) next.confirmAccountNumber = confErr;
        else delete next.confirmAccountNumber;
      }
      if (field === "state" && data.pinCode) {
        const pinErr = validateGstBusinessField("pinCode", data);
        if (pinErr) next.pinCode = pinErr;
        else delete next.pinCode;
      }
      if (field === "compositionScheme") {
        const natErr = validateGstBusinessField("natureOfBusiness", data);
        if (natErr) next.natureOfBusiness = natErr;
        else if (prev.natureOfBusiness?.includes("Composition Scheme"))
          delete next.natureOfBusiness;

        const reaErr = validateGstBusinessField("registrationReason", data);
        if (reaErr) next.registrationReason = reaErr;
        else if (prev.registrationReason?.includes("Composition Scheme"))
          delete next.registrationReason;
      }

      return next;
    });
  };

  const handleFieldChange = <K extends keyof GstBusinessFormData>(
    field: K,
    value: GstBusinessFormData[K],
  ) => {
    onChange(field, value);
    const nextData = { ...data, [field]: value };

    // Live validation for legalName: if user enters any number, show error immediately below the field
    if (field === "legalName") {
      const strVal = String(value ?? "");
      if (/\d/.test(strVal)) {
        setErrors((prev) => ({
          ...prev,
          legalName: "Legal name cannot contain numbers",
        }));
        return;
      } else if (errors.legalName === "Legal name cannot contain numbers") {
        setErrors((prev) => {
          const { legalName: _, ...rest } = prev;
          return rest;
        });
      }
    }

    // Live validation for designation: if user enters any number, show error immediately below the field
    if (field === "designation") {
      const strVal = String(value ?? "");
      if (/\d/.test(strVal)) {
        setErrors((prev) => ({
          ...prev,
          designation: "Designation must contain only letters",
        }));
        return;
      } else if (errors.designation === "Designation must contain only letters") {
        setErrors((prev) => {
          const { designation: _, ...rest } = prev;
          return rest;
        });
      }
    }

    // Live validation for commencementDate: immediate feedback if future or invalid date
    if (field === "commencementDate") {
      const dateErr = validateGstBusinessField("commencementDate", nextData);
      setErrors((prev) => {
        const next = { ...prev };
        if (dateErr) next.commencementDate = dateErr;
        else delete next.commencementDate;
        return next;
      });
    }

    // If this field currently has an error, re-evaluate live to clear as soon as valid
    if (errors[field]) {
      const err = validateGstBusinessField(field, nextData);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) {
          next[field] = err;
        } else {
          delete next[field];
        }
        return next;
      });
    }

    // Live cross-field corrections
    if (field === "constitution" && errors.businessPan) {
      const panErr = validateGstBusinessField("businessPan", nextData);
      setErrors((prev) => {
        const next = { ...prev };
        if (panErr) next.businessPan = panErr;
        else delete next.businessPan;
        return next;
      });
    }
    if (field === "accountNumber" && errors.confirmAccountNumber) {
      const confErr = validateGstBusinessField(
        "confirmAccountNumber",
        nextData,
      );
      setErrors((prev) => {
        const next = { ...prev };
        if (confErr) next.confirmAccountNumber = confErr;
        else delete next.confirmAccountNumber;
        return next;
      });
    }
    if (field === "state" && errors.pinCode) {
      const pinErr = validateGstBusinessField("pinCode", nextData);
      setErrors((prev) => {
        const next = { ...prev };
        if (pinErr) next.pinCode = pinErr;
        else delete next.pinCode;
        return next;
      });
    }
    if (field === "compositionScheme") {
      const natErr = validateGstBusinessField("natureOfBusiness", nextData);
      const reaErr = validateGstBusinessField("registrationReason", nextData);
      setErrors((prev) => {
        const next = { ...prev };
        if (natErr) next.natureOfBusiness = natErr;
        else if (prev.natureOfBusiness?.includes("Composition Scheme"))
          delete next.natureOfBusiness;
        if (reaErr) next.registrationReason = reaErr;
        else if (prev.registrationReason?.includes("Composition Scheme"))
          delete next.registrationReason;
        return next;
      });
    }
  };

  const handleConsentChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange("aadhaarConsent", e.target.checked);
    if (e.target.checked) {
      clearErr("aadhaarConsent");
    } else {
      setErrors((prev) => ({
        ...prev,
        aadhaarConsent:
          "Aadhaar authentication consent is mandatory to proceed",
      }));
    }
  };

  const scrollToField = (field: string) => {
    requestAnimationFrame(() => {
      const el = document.querySelector(`[name="${field}"], #${field}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const errs = validateGstBusinessForm(data);
    const firstErrorField = Object.keys(errs)[0];
    if (firstErrorField) {
      setErrors(errs);
      scrollToField(firstErrorField);
      return;
    }
    onNext();
  };

  const consentClass = [
    "gst-consent-card",
    data.aadhaarConsent ? "gst-consent-card--checked" : "",
    errors.aadhaarConsent ? "gst-consent-card--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form className="gst-step-business" onSubmit={handleSubmit} noValidate>
      <GSTBusinessDetails
        data={data}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        errors={errors}
        onClearError={clearErr}
      />
      <GSTBankDetails
        data={data}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        errors={errors}
        onClearError={clearErr}
      />
      <GSTAuthorisedSignatory
        data={data}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        errors={errors}
        onClearError={clearErr}
      />

      {/* Aadhaar Authentication Consent Card */}
      <div className={consentClass}>
        <label className="gst-consent-card__label" htmlFor="aadhaarConsent">
          <input
            type="checkbox"
            id="aadhaarConsent"
            name="aadhaarConsent"
            className="gst-consent-card__checkbox"
            checked={Boolean(data.aadhaarConsent)}
            onChange={handleConsentChange}
            aria-invalid={Boolean(errors.aadhaarConsent)}
            aria-describedby={
              errors.aadhaarConsent ? "aadhaarConsent-error" : undefined
            }
          />
          <span className="gst-consent-card__text">{AADHAAR_CONSENT_TEXT}</span>
        </label>
        {errors.aadhaarConsent && (
          <span
            id="aadhaarConsent-error"
            className="gst-consent-card__error"
            role="alert"
          >
            {errors.aadhaarConsent}
          </span>
        )}
      </div>

      <StepActionBar
        onBack={onCancel}
        onSaveDraft={onSaveDraft}
        onNext={handleSubmit}
        isEditMode={isEditMode}
      />
    </form>
  );
};

export default GSTStepBusiness;
