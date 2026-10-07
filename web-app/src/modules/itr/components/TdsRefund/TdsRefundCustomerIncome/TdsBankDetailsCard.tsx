import React from "react";
import { Landmark } from "lucide-react";
import { ConfirmAccountNumberInput } from "@shared/components";
import { TdsIcons } from "@modules/itr/utils/tdsRefund.constants";
import type { TdsBankDetails } from "@modules/itr/types/tdsRefund.types";

interface TdsBankDetailsCardProps {
  bankDetails: TdsBankDetails;
  fieldErrors: Record<string, string>;
  isFetchingIfsc: boolean;
  handleBankChange: (updated: Partial<TdsBankDetails>) => void;
  handleIfscChange: (rawVal: string) => Promise<void>;
}

/** Refund bank account: holder, account number (with confirmation) and IFSC lookup */
export const TdsBankDetailsCard: React.FC<TdsBankDetailsCardProps> = ({
  bankDetails,
  fieldErrors,
  isFetchingIfsc,
  handleBankChange,
  handleIfscChange,
}) => (
  <div className="tds-card" data-testid="tds-card-bank">
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
          onChange={(e) =>
            handleBankChange({ accountHolder: e.target.value })
          }
          placeholder="Enter account holder name"
          required
        />
        {fieldErrors.accountHolder && (
          <span
            className="tds-field-error"
          >
            {fieldErrors.accountHolder}
          </span>
        )}
      </div>
      <div className="tds-form-grid-2">
        <div className="tds-form-group">
          <label htmlFor="tds-account-number" className="tds-label">
            Bank Account Number <span className="tds-required">*</span>
          </label>
          <input
            id="tds-account-number"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={18}
            className={`tds-input ${fieldErrors.accountNumber ? "has-error" : ""}`}
            value={bankDetails.accountNumber}
            onChange={(e) =>
              handleBankChange({
                accountNumber: e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 18),
              })
            }
            placeholder="Enter your bank account number"
            required
          />
          {fieldErrors.accountNumber && (
            <span
              className="tds-field-error"
            >
              {fieldErrors.accountNumber}
            </span>
          )}
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
            placeholder="Enter your IFSC code"
            maxLength={11}
            required
          />
          {fieldErrors.ifsc && (
            <span
              className="tds-field-error"
            >
              {fieldErrors.ifsc}
            </span>
          )}
          {isFetchingIfsc && (
            <span className="tds-field-hint tds-field-hint--warning">
              Fetching bank details...
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
            onChange={(e) =>
              handleBankChange({ bankName: e.target.value })
            }
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
            onChange={(e) =>
              handleBankChange({ branch: e.target.value })
            }
            placeholder="Enter branch name"
          />
        </div>
      </div>
      {bankDetails.bankName && bankDetails.branch && (
        <div
          className="tds-bank-status-pill"
          data-testid="tds-bank-verified-pill"
        >
          <span className="tds-bank-status-icon">
            <TdsIcons.Checkmark />
          </span>
          <span className="tds-bank-status-text">
            {bankDetails.bankName} • {bankDetails.branch}
          </span>
        </div>
      )}
      <div className="tds-form-group">
        <span className="tds-label">Account Type</span>
        <div className="tds-type-pills">
          {(["savings", "current"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`tds-type-pill ${bankDetails.accountType === type ? "tds-type-pill--active" : ""}`}
              onClick={() => handleBankChange({ accountType: type })}
            >
              {type === "savings"
                ? "Savings Account"
                : "Current Account"}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);
