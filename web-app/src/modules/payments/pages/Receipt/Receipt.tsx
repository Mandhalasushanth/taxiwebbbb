import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { routePaths } from '@core/config'
import { EmptyState, Loader } from '@shared/components'
import { useSafeBack } from '@shared/hooks'
import { useAppStore } from '@store/index'
import { receiptService } from '../../services/receiptService'
import type { TaxReceipt } from '../../types/payments.types'
import { ReceiptActions } from '../../components/ReceiptActions/ReceiptActions'
import { ReceiptCard } from '../../components/ReceiptCard/ReceiptCard'
import './Receipt.css'

export const Receipt = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const pushToast = useAppStore((state) => state.pushToast)

  const [receipt, setReceipt] = useState<TaxReceipt | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const receiptRef = id || searchParams.get('id') || searchParams.get('appRef') || undefined

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    receiptService
      .getReceipt(receiptRef)
      .then((data) => {
        if (isMounted) {
          setReceipt(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [receiptRef])

  const handleBack = useSafeBack(routePaths.payments)

  const handleDownloadPdf = () => {
    pushToast('Preparing Tax Invoice PDF for download...', 'info')
    window.print()
  }

  if (isLoading) return <Loader label="Loading tax invoice..." />
  if (!receipt) return <EmptyState title="Receipt not found" />

  return (
    <div className="receipt-view-page">
      {/* Breadcrumb Navigation */}
      <nav className="receipt-view-page__breadcrumb" aria-label="Breadcrumb">
        <span className="receipt-view-page__breadcrumb-muted">My Account</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="receipt-view-page__breadcrumb-arrow"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <Link to={routePaths.payments} className="receipt-view-page__breadcrumb-link">
          Payment
        </Link>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="receipt-view-page__breadcrumb-arrow"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="receipt-view-page__breadcrumb-current">Receipt</span>
      </nav>

      {/* Main Receipt Card */}
      <main className="receipt-view-page__content">
        <ReceiptCard receipt={receipt} />
      </main>

      {/* Bottom Action Bar */}
      <ReceiptActions
        onBack={handleBack}
        onDownloadPdf={handleDownloadPdf}
      />
    </div>
  )
}

export default Receipt
