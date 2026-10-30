import React from 'react'

interface PaymentUpiFormProps {
  upiId: string
  selectedApp: string
  error?: string | null
  onUpiIdChange: (id: string) => void
  onSelectApp: (app: string) => void
}

const UPI_APPS = [
  { name: 'PhonePe', handle: '@ybl' },
  { name: 'GPay', handle: '@okaxis' },
  { name: 'Paytm', handle: '@paytm' },
  { name: 'BHIM', handle: '@upi' },
]

export const PaymentUpiForm: React.FC<PaymentUpiFormProps> = ({
  upiId,
  selectedApp,
  error,
  onUpiIdChange,
  onSelectApp,
}) => {
  const handlePillClick = (appName: string, handle: string) => {
    onSelectApp(appName)
    const rawBase = upiId.includes('@') ? upiId.split('@')[0] : upiId
    const base = rawBase?.trim() || 'user'
    onUpiIdChange(`${base}${handle}`)
  }

  return (
    <div className="payment-upi-subcard" data-testid="payment-upi-form">
      <div className="payment-upi-field-group">
        <label htmlFor="upi-id-input" className="payment-upi-label">
          Enter UPI ID / VPA
        </label>
        <input
          id="upi-id-input"
          type="text"
          className={`payment-upi-input ${error ? 'payment-upi-input--error' : ''}`}
          placeholder="username@bank"
          value={upiId}
          onChange={(e) => onUpiIdChange(e.target.value.trim().toLowerCase())}
          data-testid="upi-id-input"
          autoComplete="off"
        />
        {error && <span className="payment-field-error" role="alert">{error}</span>}
      </div>

      <div className="payment-upi-pills-row">
        {UPI_APPS.map((app) => {
          const isSelected = selectedApp === app.name || upiId.endsWith(app.handle)
          return (
            <button
              key={app.name}
              type="button"
              className={`payment-upi-pill ${isSelected ? 'payment-upi-pill--active' : ''}`}
              onClick={() => handlePillClick(app.name, app.handle)}
            >
              {app.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
