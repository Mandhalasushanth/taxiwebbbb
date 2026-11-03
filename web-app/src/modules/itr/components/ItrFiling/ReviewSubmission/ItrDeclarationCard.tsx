import React from 'react'

export interface ItrDeclarationCardProps {
  isDeclared: boolean
  showError: boolean
  onChange: (declared: boolean) => void
}

export const ItrDeclarationCard: React.FC<ItrDeclarationCardProps> = ({
  isDeclared,
  showError,
  onChange,
}) => {
  return (
    <div
      className={`itr-step-card itr-rv2-declaration-card ${
        showError && !isDeclared ? 'itr-info-card--error' : ''
      }`}
    >
      <label className="itr-rv2-declaration-label">
        <input
          type="checkbox"
          checked={isDeclared}
          onChange={(e) => onChange(e.target.checked)}
          className="itr-rv2-declaration-check"
        />
        <span className="itr-rv2-declaration-text">
          I confirm that the income details, deductions, bank account, and documents provided are
          correct and complete to the best of my knowledge.
        </span>
      </label>
      {showError && !isDeclared && (
        <div className="itr-field-error" role="alert">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span>Please confirm the declaration before submitting for CA review.</span>
        </div>
      )}
    </div>
  )
}

