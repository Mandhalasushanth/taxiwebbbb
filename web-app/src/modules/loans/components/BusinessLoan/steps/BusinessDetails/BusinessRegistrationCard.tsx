import React, { useCallback } from "react";
import { Briefcase, ChevronDown, Award } from 'lucide-react';
import type {
  BusinessLoanFormData,
  UdyamOptionType,
} from '@modules/loans/types/businessLoan.types'
import { useDropdown } from '@modules/loans/hooks/useDropdown'
import { LoanDropdownOption } from '../LoanDropdownOption'
import {
  formatUdyamNumber,
  LOAN_FIELD_LIMITS,
} from '@modules/loans/utils/loanInputFormatters'

export interface BusinessRegistrationCardProps {
  data: BusinessLoanFormData;
  onChange: (fields: Partial<BusinessLoanFormData>) => void;
  errors?: Record<string, string>;
}

/**
 * Business Registration Card - Constitution & Udyam Registration Number (MSME)
 * Strictly loop-free and uses external CSS only.
 */
export const BusinessRegistrationCard: React.FC<
  BusinessRegistrationCardProps
> = ({ data, onChange, errors = {} }) => {
  const {
    isOpen: isConstitutionOpen,
    setIsOpen: setIsConstitutionOpen,
    dropdownRef: constitutionRef,
  } = useDropdown();

  const handleConstitutionSelect = useCallback(
    (val: string) => {
      onChange({ businessConstitution: val });
      setIsConstitutionOpen(false);
    },
    [onChange, setIsConstitutionOpen],
  );

  const handleUdyamToggle = useCallback(
    (choice: UdyamOptionType) => {
      onChange({ hasUdyam: choice });
    },
    [onChange],
  );

  return (
    <>
      {/* 1. Business Constitution / Type */}
      <div className="business-field-card" ref={constitutionRef}>
        <div className="business-field-header">
          <div className="business-field-header__left">
            <div className="business-icon-tile">
              <Briefcase size={20} aria-hidden="true" />
            </div>
            <label id="constitutionLabel" className="business-field-title">
              Business Constitution / Type{" "}
              <span className="text-required">*</span>
            </label>
          </div>
        </div>

        <div className="custom-dropdown-container">
          <button
            type="button"
            className={`custom-dropdown-trigger ${isConstitutionOpen ? "custom-dropdown-trigger--open" : ""} ${errors.businessConstitution ? "custom-dropdown-trigger--error" : ""}`}
            onClick={() => setIsConstitutionOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isConstitutionOpen}
            aria-labelledby="constitutionLabel"
            data-testid="business-constitution-dropdown"
          >
            <span
              className={
                data.businessConstitution
                  ? "custom-dropdown-value"
                  : "custom-dropdown-placeholder"
              }
            >
              {data.businessConstitution || "Select Business Type"}
            </span>
            <span
              className={`custom-dropdown-chevron ${isConstitutionOpen ? "custom-dropdown-chevron--open" : ""}`}
              aria-hidden="true"
            >
              <ChevronDown size={18} aria-hidden="true" />
            </span>
          </button>

          {isConstitutionOpen && (
            <div
              className="custom-dropdown-menu"
              role="listbox"
              aria-labelledby="constitutionLabel"
            >
              <LoanDropdownOption
                value="Proprietorship"
                label="Proprietorship"
                isSelected={data.businessConstitution === "Proprietorship"}
                onSelect={handleConstitutionSelect}
              />
              <LoanDropdownOption
                value="Partnership"
                label="Partnership"
                isSelected={data.businessConstitution === "Partnership"}
                onSelect={handleConstitutionSelect}
              />
              <LoanDropdownOption
                value="LLP"
                label="LLP"
                isSelected={data.businessConstitution === "LLP"}
                onSelect={handleConstitutionSelect}
              />
              <LoanDropdownOption
                value="Private Limited"
                label="Private Limited"
                isSelected={data.businessConstitution === "Private Limited"}
                onSelect={handleConstitutionSelect}
              />
              <LoanDropdownOption
                value="Public Limited"
                label="Public Limited"
                isSelected={data.businessConstitution === "Public Limited"}
                onSelect={handleConstitutionSelect}
              />
              <LoanDropdownOption
                value="Others"
                label="Others"
                isSelected={data.businessConstitution === "Others"}
                onSelect={handleConstitutionSelect}
              />
            </div>
          )}
        </div>
        {errors.businessConstitution && (
          <span className="field-error-text">
            {errors.businessConstitution}
          </span>
        )}
      </div>

      {/* 2. Udyam Registration Number (MSME) */}
      <div className="business-field-card udyam-card">
        <div className="udyam-header-row">
          <div className="udyam-header-left">
            <div className="business-icon-tile udyam-icon-tile">
              <Award size={20} aria-hidden="true" />
            </div>
            <div className="udyam-title-wrap">
              <span className="business-field-title">
                Udyam Registration Number (MSME)
                {data.hasUdyam === "yes" && (
                  <span className="text-required"> *</span>
                )}
              </span>
              <span
                className="udyam-info-tooltip"
                title="Select Yes if your business holds an active MSME / Udyam Certificate issued by the Ministry of MSME."
                aria-label="Udyam info"
              >
                ⓘ
              </span>
            </div>
          </div>

          <div
            className="udyam-toggle-pills"
            role="radiogroup"
            aria-label="Udyam Registration Available"
          >
            <button
              type="button"
              className={`udyam-pill-btn ${data.hasUdyam === "yes" ? "udyam-pill-btn--active" : ""}`}
              onClick={() => handleUdyamToggle("yes")}
              role="radio"
              aria-checked={data.hasUdyam === "yes"}
              data-testid="udyam-toggle-yes"
            >
              Yes
            </button>
            <button
              type="button"
              className={`udyam-pill-btn ${data.hasUdyam === "no" ? "udyam-pill-btn--active" : ""}`}
              onClick={() => handleUdyamToggle("no")}
              role="radio"
              aria-checked={data.hasUdyam === "no"}
              data-testid="udyam-toggle-no"
            >
              No
            </button>
          </div>
        </div>
        {errors.hasUdyam && (
          <span className="field-error-text">{errors.hasUdyam}</span>
        )}

        {data.hasUdyam === "yes" && (
          <div className="udyam-input-container">
            <input
              id="udyamRegistrationNumber"
              type="text"
              maxLength={LOAN_FIELD_LIMITS.UDYAM_MAX}
              className={`custom-form-input ${errors.udyamRegistrationNumber ? "custom-form-input--error" : ""}`}
              placeholder="e.g. UDYAM-MH-01-0001234"
              value={data.udyamRegistrationNumber || ""}
              onChange={(e) =>
                onChange({
                  udyamRegistrationNumber: formatUdyamNumber(e.target.value),
                })
              }
              aria-label="Udyam Registration Number"
            />
            <span className="input-field-subtext">
              Format: UDYAM-XX-00-0000000
            </span>
            {errors.udyamRegistrationNumber && (
              <span className="field-error-text">
                {errors.udyamRegistrationNumber}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BusinessRegistrationCard;
