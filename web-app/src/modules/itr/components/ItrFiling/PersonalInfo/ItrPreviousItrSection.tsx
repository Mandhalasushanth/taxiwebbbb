import React, { useState } from 'react'
import {
  HistoryDocIcon,
  ChevronDownIcon,
  type PreviousItrInfo,
} from '../itrFiling.constants'
import './ItrPreviousItrSection.css'

export interface ItrPreviousItrSectionProps {
  previousItr: PreviousItrInfo
  onPreviousItrChange: (info: PreviousItrInfo) => void
}

export const ItrPreviousItrSection: React.FC<ItrPreviousItrSectionProps> = ({
  previousItr,
  onPreviousItrChange,
}) => {
  const [isPreviousItrOpen, setIsPreviousItrOpen] = useState(() =>
    Boolean(previousItr.hasPreviousReturn)
  )

  const handlePreviousItrToggle = (checked: boolean) => {
    const updated: PreviousItrInfo = {
      ...previousItr,
      hasPreviousReturn: checked,
      importSalary: checked ? (previousItr.importSalary ?? false) : false,
      importDeductions: checked ? (previousItr.importDeductions ?? false) : false,
      importLosses: checked ? (previousItr.importLosses ?? false) : false,
      importBankAccounts: checked ? (previousItr.importBankAccounts ?? false) : false,
    }
    onPreviousItrChange(updated)
  }

  const handleImportOptionToggle = (
    key: 'importSalary' | 'importDeductions' | 'importLosses' | 'importBankAccounts'
  ) => {
    const updated: PreviousItrInfo = {
      ...previousItr,
      [key]: !previousItr[key],
    }
    onPreviousItrChange(updated)
  }

  return (
    <section
      className="itr-info-card itr-info-card--full-width"
      aria-labelledby="prev-itr-heading"
    >
      <div className="itr-info-card__top">
        <div className="itr-info-card__title-row">
          <div className="itr-info-card__icon-wrap">
            <HistoryDocIcon size={20} />
          </div>
          <h2 id="prev-itr-heading" className="itr-info-card__title">
            Previous ITR Data
          </h2>
        </div>
        <div className="itr-card-header-actions">
          <span className="itr-badge-optional">Optional</span>
          <button
            type="button"
            className={`itr-btn-accordion-toggle ${isPreviousItrOpen ? 'itr-btn-accordion-toggle--open' : ''}`}
            onClick={() => setIsPreviousItrOpen(!isPreviousItrOpen)}
            aria-expanded={isPreviousItrOpen}
            aria-label="Toggle Previous ITR Data Details"
          >
            <ChevronDownIcon size={18} />
          </button>
        </div>
      </div>

      <p className="itr-info-card__desc">
        Optional — If you filed a return through TaxEdge previously, you can
        import carry-forward loss and deduction records.
      </p>

      {isPreviousItrOpen && (
        <div className="itr-prev-import-card">
          <div
            className="itr-prev-import-header"
            onClick={() => handlePreviousItrToggle(!previousItr.hasPreviousReturn)}
          >
            <span className="itr-prev-import-title">
              I have previously filed return details
            </span>
            <div
              className={`itr-prev-custom-checkbox ${previousItr.hasPreviousReturn ? 'itr-prev-custom-checkbox--checked' : ''}`}
              role="checkbox"
              aria-checked={previousItr.hasPreviousReturn}
            >
              {previousItr.hasPreviousReturn && (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>

          {previousItr.hasPreviousReturn && (
            <div className="itr-prev-import-body">
              <div className="itr-prev-import-subtitle">
                Select details to import:
              </div>

              <div className="itr-prev-import-options">
                <label className="itr-prev-option-item">
                  <input
                    type="checkbox"
                    checked={Boolean(previousItr.importSalary)}
                    onChange={() => handleImportOptionToggle('importSalary')}
                    className="itr-prev-option-checkbox"
                  />
                  <span className="itr-prev-option-label">
                    Salary &amp; employer details
                  </span>
                </label>

                <label className="itr-prev-option-item">
                  <input
                    type="checkbox"
                    checked={Boolean(previousItr.importDeductions)}
                    onChange={() => handleImportOptionToggle('importDeductions')}
                    className="itr-prev-option-checkbox"
                  />
                  <span className="itr-prev-option-label">
                    Deduction records (80C, 80D)
                  </span>
                </label>

                <label className="itr-prev-option-item">
                  <input
                    type="checkbox"
                    checked={Boolean(previousItr.importLosses)}
                    onChange={() => handleImportOptionToggle('importLosses')}
                    className="itr-prev-option-checkbox"
                  />
                  <span className="itr-prev-option-label">
                    Carried-forward business &amp; capital losses
                  </span>
                </label>

                <label className="itr-prev-option-item">
                  <input
                    type="checkbox"
                    checked={Boolean(previousItr.importBankAccounts)}
                    onChange={() => handleImportOptionToggle('importBankAccounts')}
                    className="itr-prev-option-checkbox"
                  />
                  <span className="itr-prev-option-label">
                    Bank account details
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
