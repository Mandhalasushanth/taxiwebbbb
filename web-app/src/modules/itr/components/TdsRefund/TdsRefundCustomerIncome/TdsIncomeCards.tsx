import React from "react";
import { Calculator, ShieldCheck } from "lucide-react";
import type { TdsIncomeTaxData } from "@modules/itr/types/tdsRefund.types";
import {
  CATEGORY_TOGGLE_CONFIGS,
  OTHER_INCOME_FIELDS,
  SALARY_INCOME_FIELD,
  TAXES_PAID_FIELDS,
} from "./tdsCustomerIncome.config";
import { getCategoryClearUpdates } from "./tdsCustomerIncome.helpers";

interface TdsIncomeCardsProps {
  taxData: TdsIncomeTaxData;
  fieldErrors: Record<string, string>;
  handleTaxChange: (updated: Partial<TdsIncomeTaxData>) => void;
}

/** Income details and taxes-paid cards */
export const TdsIncomeCards: React.FC<TdsIncomeCardsProps> = ({
  taxData,
  fieldErrors,
  handleTaxChange,
}) => {
  const renderTaxFieldInput = (field: {
    id: string;
    label: string;
    key: keyof TdsIncomeTaxData;
    placeholder: string;
    required?: boolean;
  }) => (
    <div key={field.id} className="tds-form-group">
      <label htmlFor={field.id} className="tds-label">
        {field.label}{" "}
        {field.required && <span className="tds-required">*</span>}
      </label>
      <input
        id={field.id}
        type="text"
        className={`tds-input ${fieldErrors[field.key] ? "has-error" : ""}`}
        placeholder={field.placeholder}
        value={(taxData[field.key] as string) || ""}
        onChange={(e) =>
          handleTaxChange({
            [field.key]: e.target.value,
          } as Partial<TdsIncomeTaxData>)
        }
        required={field.required}
      />
      {fieldErrors[field.key] && (
        <span
          className="tds-field-error"
        >
          {fieldErrors[field.key]}
        </span>
      )}
    </div>
  );

  return (
    <>
      <div className="tds-card" data-testid="tds-card-income">
        <div className="tds-card-header">
          <div className="tds-card-title-wrap">
            <div
              className="tds-card-icon-box tds-card-icon-box--calc"
              aria-hidden="true"
            >
              <Calculator size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="tds-card-title">
                Income &amp; Tax Information
              </h2>
              <span className="tds-card-subtitle">
                Tax calculation breakdown and additional earnings
              </span>
            </div>
          </div>
        </div>
        <div className="tds-income-form">
          <div className="tds-form-group">
            <label className="tds-label">
              Income Tax Regime <span className="tds-required">*</span>
            </label>
            <div className="tds-taxRegime-grid">
              <button
                type="button"
                className={`tds-taxRegime-card ${taxData.taxRegime === "new" ? "tds-taxRegime-card--active" : ""}`}
                onClick={() => handleTaxChange({ taxRegime: "new" })}
                data-testid="taxRegime-new"
              >
                <div className="tds-taxRegime-title">New Tax Regime</div>
                <div className="tds-taxRegime-sub">
                  Default (Lower tax slabs, standard deduction)
                </div>
              </button>
              <button
                type="button"
                className={`tds-taxRegime-card ${taxData.taxRegime === "old" ? "tds-taxRegime-card--active" : ""}`}
                onClick={() => handleTaxChange({ taxRegime: "old" })}
                data-testid="taxRegime-old"
              >
                <div className="tds-taxRegime-title">Old Tax Regime</div>
                <div className="tds-taxRegime-sub">
                  With 80C, 80D, HRA &amp; Home Loan deductions
                </div>
              </button>
            </div>
          </div>
          {renderTaxFieldInput(SALARY_INCOME_FIELD)}
          <div className="tds-form-grid-2">
            {OTHER_INCOME_FIELDS.map(renderTaxFieldInput)}
          </div>
          <div className="tds-form-group">
            <label className="tds-label">
              Additional Income Streams &amp; Deductions
            </label>
            <div className="tds-toggles-list">
              {CATEGORY_TOGGLE_CONFIGS.map((cfg) => {
                const activeVal =
                  taxData[cfg.key] === "yes" ? "yes" : "no";
                return (
                  <div
                    key={cfg.key}
                    className="tds-toggle-card"
                    data-testid={`toggle-row-${cfg.key}`}
                  >
                    <div className="tds-toggle-header">
                      <div className="tds-toggle-info">
                        <span className="tds-toggle-title">
                          {cfg.title}
                        </span>
                        <span className="tds-toggle-subtitle">
                          {cfg.subtitle}
                        </span>
                      </div>
                      <div className="tds-yes-no-group">
                        {(["yes", "no"] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            className={`tds-yes-no-btn tds-yes-no-btn--${opt} ${activeVal === opt ? "tds-yes-no-btn--active" : ""}`}
                            onClick={() => {
                              if (opt === "no") {
                                handleTaxChange(
                                  getCategoryClearUpdates(cfg.key),
                                );
                              } else {
                                handleTaxChange({
                                  [cfg.key]: "yes",
                                } as Partial<TdsIncomeTaxData>);
                              }
                            }}
                          >
                            {opt === "yes" ? "Yes" : "No"}
                          </button>
                        ))}
                      </div>
                    </div>
                    {activeVal === "yes" && (
                      <div
                        className={`tds-toggle-subfields ${cfg.twoColumn ? "tds-form-grid-2" : ""}`}
                      >
                        {cfg.fields.map(renderTaxFieldInput)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="tds-card" data-testid="tds-card-taxes-paid">
        <div className="tds-card-header">
          <div className="tds-card-title-wrap">
            <div
              className="tds-card-icon-box tds-card-icon-box--shield"
              aria-hidden="true"
            >
              <ShieldCheck size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="tds-card-title">TDS & Taxes Paid</h2>
            </div>
          </div>
        </div>
        <div className="tds-income-form">
          <div className="tds-form-grid-2">
            {TAXES_PAID_FIELDS.map(renderTaxFieldInput)}
          </div>
        </div>
      </div>
    </>
  );
};
