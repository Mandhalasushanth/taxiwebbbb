import React from 'react'
import { Smartphone, CreditCard, Building2 } from 'lucide-react'
import type { PaymentMethodType } from './payment.types'

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType
  onSelectMethod: (method: PaymentMethodType) => void
}

interface MethodOption {
  id: PaymentMethodType
  title: string
  subtitle: string
  icon: React.ReactNode
}

const METHODS: MethodOption[] = [
  {
    id: 'upi',
    title: 'UPI',
    subtitle: 'Pay via any UPI app',
    icon: <Smartphone size={20} />,
  },
  {
    id: 'debit',
    title: 'Debit Card',
    subtitle: 'Visa / Mastercard / RuPay',
    icon: <CreditCard size={20} />,
  },
  {
    id: 'credit',
    title: 'Credit Card',
    subtitle: 'Visa / Mastercard / Amex',
    icon: <CreditCard size={20} />,
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    subtitle: 'All major banks',
    icon: <Building2 size={20} />,
  },
]

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  // Normalize if 'card' was passed
  const activeId = selectedMethod === 'card' ? 'debit' : selectedMethod

  return (
    <div className="payment-methods-card" data-testid="payment-methods-card">
      <h3 className="payment-section-title">Choose Payment Method</h3>

      <div className="payment-methods-grid">
        {METHODS.map((m) => {
          const isSelected = activeId === m.id
          return (
            <button
              key={m.id}
              type="button"
              className={`payment-method-card ${isSelected ? 'payment-method-card--active' : ''}`}
              onClick={() => onSelectMethod(m.id)}
              data-testid={`payment-method-${m.id}`}
            >
              <div className="payment-method-icon-box">
                {m.icon}
              </div>

              <div className="payment-method-info">
                <span className="payment-method-title">{m.title}</span>
                <span className="payment-method-sub">{m.subtitle}</span>
              </div>

              <div className="payment-method-radio">
                <span className={`payment-radio-circle ${isSelected ? 'payment-radio-circle--checked' : ''}`}>
                  {isSelected && <span className="payment-radio-dot" />}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
