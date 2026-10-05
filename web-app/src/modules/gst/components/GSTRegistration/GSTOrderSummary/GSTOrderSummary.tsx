import './GSTOrderSummary.css'

export interface GSTOrderSummaryProps {
  step: number
  verifiedCount?: number
  inProgressCount?: number
  rejectedCount?: number
  notStartedCount?: number
}

export const GSTOrderSummary = ({
  step,
  verifiedCount = 3,
  inProgressCount = 1,
  rejectedCount = 1,
  notStartedCount = 3,
}: GSTOrderSummaryProps) => {
  return (
    <aside className="gst-order-summary-sidebar">
      {/* Step 3 only: Upload Progress Card */}
      {step === 3 && (
        <div className="gst-order-card">
          <h3 className="gst-order-card__title">Upload progress</h3>
          <div className="gst-order-card__table">
            <div className="gst-order-card__row">
              <span className="gst-order-card__label">Verified</span>
              <span className="gst-order-card__value gst-order-card__value--verified">
                {verifiedCount}
              </span>
            </div>
            <div className="gst-order-card__row">
              <span className="gst-order-card__label">In progress</span>
              <span className="gst-order-card__value gst-order-card__value--progress">
                {inProgressCount}
              </span>
            </div>
            <div className="gst-order-card__row">
              <span className="gst-order-card__label">Rejected</span>
              <span className="gst-order-card__value gst-order-card__value--rejected">
                {rejectedCount}
              </span>
            </div>
            <div className="gst-order-card__row">
              <span className="gst-order-card__label">Not started</span>
              <span className="gst-order-card__value">{notStartedCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 1 & 2: Order Summary Card */}
      {step !== 3 && (
        <div className="gst-order-card">
          <h3 className="gst-order-card__title">Order summary</h3>

          <div className="gst-order-card__table">
            <div className="gst-order-card__row">
              <span className="gst-order-card__label">GST Registration</span>
              <span className="gst-order-card__value">₹5,000</span>
            </div>

            <div className="gst-order-card__row">
              <span className="gst-order-card__label">GST @ 18%</span>
              <span className="gst-order-card__value">₹900</span>
            </div>

            <div className="gst-order-card__divider" />

            <div className="gst-order-card__row gst-order-card__row--total">
              <span className="gst-order-card__total-label">Total payable</span>
              <span className="gst-order-card__total-amount">₹5,900</span>
            </div>
          </div>

          <div className="gst-order-card__delivery">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="gst-order-card__clock-icon"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>7–12 working days</span>
          </div>
        </div>
      )}

      {/* Step 1: Why We Ask */}
      {step === 1 && (
        <div className="gst-order-callout">
          <h4 className="gst-order-callout__title">Why we ask</h4>
          <p className="gst-order-callout__body">
            The department matches your legal name against the PAN database. A mismatch is
            the single most common cause of a registration query.
          </p>
        </div>
      )}

      {/* Step 3: Encrypted at Rest */}
      {step === 3 && (
        <div className="gst-order-callout gst-order-callout--security">
          <div className="gst-order-callout__header">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="gst-order-callout__shield-icon"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h4 className="gst-order-callout__title">Encrypted at rest</h4>
          </div>
          <p className="gst-order-callout__body">
            Only Rohit Kulkarni, your assigned GST executive, can open these files. Every
            view is logged.
          </p>
        </div>
      )}
    </aside>
  )
}
