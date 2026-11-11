import React from "react";
import { Landmark } from "lucide-react";
import { ConfirmAccountNumberInput } from "@shared/components";
import type { TdsBankDetails } from "@modules/itr/types/tdsRefund.types";

interface TdsBankDetailsCardProps {
  bankDetails: TdsBankDetails;
  fieldErrors: Record<string, string>;
  handleBankChange: (updated: Partial<TdsBankDetails>) => void;
  handleIfscChange: (rawVal: string) => void;
  onBlur?: (field: string) => void;
}

/** Refund bank account: holder, account number (with confirmation) and manual bank/branch */
export const TdsBankDetailsCard: React.FC<TdsBankDetailsCardProps> = ({
  bankDetails,
  fieldErrors,
  handleBankChange,
  handleIfscChange,
  onBlur,
}) => (
  <div className="tds-card" id="tds-card-bank" data-section="tds-card-bank" data-testid="tds-card-bank">
    <div className="tds-card-header">
      <div className="tds-card-title-wrap">
        <div
          className="tds-card-icon-box tds-card-icon-box--bank"
          aria-hidden="true"
        >
          <Landmark size={20} strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="tds-card-title">Refund Bank Account</h2>
          <span className="tds-card-subtitle">
            Excess TDS will be credited directly to this account
          </span>
        </div>
      </div>
    </div>
    <div className="tds-bank-form">
      <div className="tds-form-group">
        <label htmlFor="tds-account-holder" className="tds-label">
          Account Holder Name <span className="tds-required">*</span>
        </label>
        <input
          id="tds-account-holder"
          type="text"
          className={`tds-input ${fieldErrors.accountHolder ? "has-error" : ""}`}
          value={bankDetails.accountHolder}
          onChange={(e) => {
            const cleaned = e.target.value
              .replace(/[^A-Za-z .'-]/g, '')
              .replace(/^[ .'-]+/g, '')
              .replace(/\s{2,}/g, ' ')
              .replace(/([.'-])\1+/g, '$1')
              .replace(/[.'-]\s*[.'-]+/g, (m) => m[0])
              .slice(0, 100)
            handleBankChange({ accountHolder: cleaned })
          }}
          onBlur={() => onBlur?.('accountHolder')}
          placeholder="Enter account holder name"
          required
        />
        {fieldErrors.accountHolder && (
          <span className="tds-field-error">
            {fieldErrors.accountHolder}
          </span>
        )}
      </div>
      <div className="tds-form-grid-2">
        <div className="tds-form-group">
          <label htmlFor="tds-account-number" className="tds-label">
            Bank Account Number <span className="tds-required">*</span>
          </label>
          <ConfirmAccountNumberInput
            id="tds-account-number"
            name="accountNumber"
            maxLength={18}
            className="tds-input"
            value={bankDetails.accountNumber}
            onChange={(val) =>
              handleBankChange({ accountNumber: val })
            }
            onBlur={() => onBlur?.('accountNumber')}
            placeholder="Enter your bank account number"
            hasError={Boolean(fieldErrors.accountNumber)}
            error={fieldErrors.accountNumber}
            ariaLabel="bank account number"
            required
          />
        </div>
        <div className="tds-form-group">
          <label htmlFor="tds-confirm-account" className="tds-label">
            Confirm Account Number{" "}
            <span className="tds-required">*</span>
          </label>
          <ConfirmAccountNumberInput
            id="tds-confirm-account"
            name="confirmAccountNumber"
            maxLength={18}
            className="tds-input"
            value={bankDetails.confirmAccountNumber}
            onChange={(val) =>
              handleBankChange({ confirmAccountNumber: val })
            }
            onBlur={() => onBlur?.('confirmAccountNumber')}
            placeholder="Enter your bank account number"
            hasError={Boolean(fieldErrors.confirmAccountNumber)}
            error={fieldErrors.confirmAccountNumber}
            required
          />
        </div>
      </div>
      <div className="tds-form-grid-3">
        <div className="tds-form-group">
          <label htmlFor="tds-ifsc" className="tds-label">
            IFSC Code <span className="tds-required">*</span>
          </label>
          <input
            id="tds-ifsc"
            type="text"
            className={`tds-input tds-input--upper ${fieldErrors.ifsc ? "has-error" : ""}`}
            value={bankDetails.ifsc}
            onChange={(e) => handleIfscChange(e.target.value)}
            onBlur={() => onBlur?.('ifsc')}
            placeholder="Enter your IFSC code"
            maxLength={11}
            required
          />
          {fieldErrors.ifsc && (
            <span className="tds-field-error">
              {fieldErrors.ifsc}
            </span>
          )}
        </div>
        <div className="tds-form-group">
          <label htmlFor="tds-bank-name" className="tds-label">
            Bank Name
          </label>
          <input
            id="tds-bank-name"
            type="text"
            className="tds-input"
            value={bankDetails.bankName}
            onChange={(e) => {
              const cleaned = e.target.value
                .replace(/[^A-Za-z\s.&'-]/g, '')
                .replace(/^[ \s.&'-]+/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/([.&'-])\1+/g, '$1')
                .replace(/[.&'-]\s*[.&'-]+/g, (m) => m[0])
                .slice(0, 100)
              handleBankChange({ bankName: cleaned })
            }}
            onBlur={() => onBlur?.('bankName')}
            placeholder="Enter your bank name"
          />
        </div>
        <div className="tds-form-group">
          <label htmlFor="tds-bank-branch" className="tds-label">
            Branch
          </label>
          <input
            id="tds-bank-branch"
            type="text"
            className="tds-input"
            value={bankDetails.branch}
            onChange={(e) => {
              const cleaned = e.target.value
                .replace(/[^A-Za-z0-9\s.,\/-]/g, '')
                .replace(/^[ \s.,\/-]+/g, '')
                .replace(/\s{2,}/g, ' ')
                .replace(/([.,\/-])\1+/g, '$1')
                .replace(/[.,\/-]\s*[.,\/-]+/g, (m) => m[0])
                .slice(0, 60)
              handleBankChange({ branch: cleaned })
            }}
            onBlur={() => onBlur?.('branch')}
            placeholder="Enter branch name"
          />
        </div>
      </div>
    </div>
  </div>
);
