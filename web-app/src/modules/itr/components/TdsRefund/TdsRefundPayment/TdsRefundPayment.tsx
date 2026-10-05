import React from 'react'
import { PaymentCheckout } from '@shared/components'
import { TdsRefundStepTracker } from '../TdsRefundOverview'
import './TdsRefundPayment.css'

export interface TdsRefundPaymentProps {
  applicantName?: string
  applicationRef?: string
  onBack: () => void
  onNext: () => void
}

export const TdsRefundPayment: React.FC<TdsRefundPaymentProps> = ({
  applicantName = 'Taxpayer',
  applicationRef = 'TDS-REFUND',
  onBack,
  onNext,
}) => {
  return (
    <div className="tds-payment-page" data-testid="tds-refund-payment-page">
      {/* Stepper Track */}
      <div className="tds-payment-stepper-wrap">
        <TdsRefundStepTracker currentStep={4} />
      </div>

      <PaymentCheckout
        amount={5899}
        serviceTitle="TDS Refund CA E-filing"
        applicationRef={applicationRef}
        applicantName={applicantName}
        onBack={onBack}
        onSuccess={() => onNext()}
      />
    </div>
  )
}
