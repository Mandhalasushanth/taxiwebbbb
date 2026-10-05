import React from "react";
import { Wallet, ChevronDown, Calendar, Target, TrendingUp } from 'lucide-react';
import {
  formatCurrencyString,
  handleNumericKeyDown,
} from '@modules/loans/utils/loanInputFormatters'

export interface LoanRequirementsSectionProps {
  requiredLoanAmount: string;
  preferredTenureMonths: string;
  purposeOfLoan: string;
  revenueOrTurnover: string;
  onChange: (fields: {
    requiredLoanAmount?: string;
    preferredTenureMonths?: string;
    purposeOfLoan?: string;
    revenueOrTurnover?: string;
  }) => void;
  errors?: Record<string, string>;
}

/**
 * 2-Column form inputs section for Loan Requirements (Loop-free)
 * Clean component using Lucide React icons
 */
export const LoanRequirementsSection: React.FC<
  LoanRequirementsSectionProps
> = ({
  requiredLoanAmount,
  preferredTenureMonths,
  purposeOfLoan,
  revenueOrTurnover,
  onChange,
  errors = {},
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ requiredLoanAmount: e.target.value });
  };

  const handleTenureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ preferredTenureMonths: e.target.value });
  };

  const handlePurposeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ purposeOfLoan: e.target.value });
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ revenueOrTurnover: formatCurrencyString(e.target.value) });
  };

  return (
    <div className="loan-requirements-grid">
      {/* 1. Required Loan Amount */}
      <div className="input-field-card">
        <div className="input-field-header">
          <div className="form-section-icon-box">
            <Wallet size={20} aria-hidden="true" />
          </div>
          <label htmlFor="requiredLoanAmount" className="form-section-title">
            Required Loan Amount (₹) <span className="text-required">*</span>
          </label>
        </div>

        <div className="select-container">
          <select
            id="requiredLoanAmount"
            className={`custom-form-select ${errors.requiredLoanAmount ? "custom-form-input--error" : ""}`}
            value={requiredLoanAmount}
            onChange={handleAmountChange}
            aria-label="Required Loan Amount"
          >
            <option value="">Select loan amount</option>
            <option value="500000">₹5,00,000</option>
            <option value="1000000">₹10,00,000 </option>
            <option value="2500000">₹25,00,000</option>
            <option value="2500000-5000000">₹25,00,000 - ₹50,00,000</option>
            <option value="5000000">₹50,00,000</option>
            <option value="10000000">₹1,00,00,000</option>
          </select>
          <div className="select-chevron-icon" aria-hidden="true">
            <ChevronDown size={18} aria-hidden="true" />
          </div>
        </div>
        {errors.requiredLoanAmount && (
          <span className="field-error-text">{errors.requiredLoanAmount}</span>
        )}
      </div>

      {/* 2. Preferred Tenure (Months) */}
      <div className="input-field-card">
        <div className="input-field-header">
          <div className="form-section-icon-box">
            <Calendar size={20} aria-hidden="true" />
          </div>
          <label htmlFor="preferredTenureMonths" className="form-section-title">
            Preferred Tenure (Months) <span className="text-required">*</span>
          </label>
        </div>

        <div className="select-container">
          <select
            id="preferredTenureMonths"
            className={`custom-form-select ${errors.preferredTenureMonths ? "custom-form-input--error" : ""}`}
            value={preferredTenureMonths}
            onChange={handleTenureChange}
            aria-label="Preferred Tenure"
          >
            <option value="">Select tenure</option>
            <option value="12">12 Months (1 Year)</option>
            <option value="24">24 Months (2 Years)</option>
            <option value="36">36 Months (3 Years)</option>
            <option value="48">48 Months (4 Years)</option>
            <option value="60">60 Months (5 Years)</option>
            <option value="84">84 Months (7 Years)</option>
            <option value="120">120 Months (10 Years)</option>
            <option value="240">240 Months (20 Years)</option>
          </select>
          <div className="select-chevron-icon" aria-hidden="true">
            <ChevronDown size={18} aria-hidden="true" />
          </div>
        </div>
        {errors.preferredTenureMonths && (
          <span className="field-error-text">
            {errors.preferredTenureMonths}
          </span>
        )}
      </div>

      {/* 3. Purpose of Loan */}
      <div className="input-field-card">
        <div className="input-field-header">
          <div className="form-section-icon-box">
            <Target size={20} aria-hidden="true" />
          </div>
          <label htmlFor="purposeOfLoan" className="form-section-title">
            Purpose of Loan <span className="text-required">*</span>
          </label>
        </div>

        <div className="select-container">
          <select
            id="purposeOfLoan"
            className={`custom-form-select ${errors.purposeOfLoan ? "custom-form-input--error" : ""}`}
            value={purposeOfLoan}
            onChange={handlePurposeChange}
            aria-label="Purpose of Loan"
          >
            <option value="">Select your loan type</option>
            <option value="Working Capital">
              Working Capital &amp; Inventory
            </option>
            <option value="working-capital">
              Working Capital &amp; Inventory
            </option>
            <option value="Business Expansion">
              Home purchase &amp; construction
            </option>
            <option value="Machinery Equipment">
              Machinery &amp; Equipment Purchase
            </option>
            <option value="Home Renovation">
              Home Extension or Renovation
            </option>
            <option value="Vehicle Purchase">Vehicle purchase</option>
            <option value="Debt Consolidation">Debt Consolidation</option>
            <option value="Personal / Medical Emergency">
              Personal / Medical Emergency
            </option>
          </select>
          <div className="select-chevron-icon" aria-hidden="true">
            <ChevronDown size={18} aria-hidden="true" />
          </div>
        </div>
        {errors.purposeOfLoan && (
          <span className="field-error-text">{errors.purposeOfLoan}</span>
        )}
      </div>

      {/* 4. Monthly / Annual Revenue / Turnover */}
      <div className="input-field-card">
        <div className="input-field-header">
          <div className="form-section-icon-box">
            <TrendingUp size={20} aria-hidden="true" />
          </div>
          <label htmlFor="revenueOrTurnover" className="form-section-title">
            Monthly / Annual Revenue / Turnover (₹){" "}
            <span className="text-required">*</span>
          </label>
        </div>

        <input
          id="revenueOrTurnover"
          type="text"
          className={`custom-form-input ${errors.revenueOrTurnover ? "custom-form-input--error" : ""}`}
          placeholder="Enter revenue or turnover"
          value={revenueOrTurnover}
          onChange={handleRevenueChange}
          onKeyDown={handleNumericKeyDown}
          aria-label="Monthly or Annual Revenue"
        />
        {errors.revenueOrTurnover && (
          <span className="field-error-text">{errors.revenueOrTurnover}</span>
        )}
      </div>
    </div>
  );
};

export default LoanRequirementsSection;
