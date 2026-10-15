import type { FC } from 'react'

interface GSTReviewDeclarationProps {
  checked: boolean
  onChange: (checked: boolean) => void
  hasError: boolean
}

export const GSTReviewDeclaration: FC<GSTReviewDeclarationProps> = ({
  checked,
  onChange,
  hasError,
}) => {
  return (
    <div
      className={`gst-review-declaration-box ${
        hasError ? 'gst-review-declaration-box--error' : ''
      }`}
    >
      <label className="gst-review-declaration-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="gst-review-declaration-checkbox"
          aria-invalid={hasError}
        />
        <span className="gst-review-declaration-text">
          I hereby declare that the information provided is true and accurate to the best of my
          knowledge. I authorise <strong>TaxEdge Fin Solutions</strong> to file this application on
          my behalf.
        </span>
      </label>

      {hasError && (
        <div className="gst-review-declaration-error" role="alert">
          * Please accept the declaration before submitting your application.
        </div>
      )}
    </div>
  )
}
