import type { FC } from 'react'
import { GST_FEES } from '@modules/gst/constants/gstBusiness.constants'
import { PaymentCheckout } from '@shared/components'
import type { GSTStepPaymentProps } from '@modules/gst/types/gstPayment.types'
import './GSTStepPayment.css'

export type { GSTStepPaymentProps, PaymentResult } from '@modules/gst/types/gstPayment.types'

export const GSTStepPayment: FC<GSTStepPaymentProps> = ({
  amount = GST_FEES.registration,
  serviceId = 'gst-registration',
  applicationRef = '',
  serviceTitle = 'GST Registration Filing',
  applicantName = 'Applicant',
  onBack,
  onSuccess,
}) => {
  return (
    <div className="gst-step-payment-page" data-testid="gst-step-payment">
      <PaymentCheckout
        amount={amount}
        serviceId={serviceId}
        serviceTitle={serviceTitle}
        applicationRef={applicationRef}
        applicantName={applicantName}
        onBack={onBack}
        enablePromoCode={true}
        onSuccess={(res) => {
          // PaymentCheckout only reports verified payments; never forward anything else
          if (res.status !== 'SUCCESS' || !res.verified) return
          onSuccess({
            transactionId: res.paymentId,
            receiptNumber: res.receiptNumber || `REC-${Date.now().toString().slice(-6)}`,
            method: res.method.toUpperCase(),
            dateText: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            applicationRef: res.applicationRef,
            amount: res.amount,
            verified: res.verified,
            orderId: res.orderId,
          })
        }}
      />
    </div>
  )
}

export default GSTStepPayment
