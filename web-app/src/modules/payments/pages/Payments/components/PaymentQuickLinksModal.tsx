import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, FileText, X, ExternalLink } from 'lucide-react'
import { routePaths } from '@core/config'
import type { PaymentItem } from '../Payments'

export interface PaymentQuickLinksModalProps {
  activeModal: 'history' | 'receipts' | null
  onClose: () => void
  paidApps: PaymentItem[]
  totalPaid: number
}

export const PaymentQuickLinksModal: React.FC<PaymentQuickLinksModalProps> = ({
  activeModal,
  onClose,
  paidApps,
  totalPaid,
}) => {
  if (!activeModal) return null

  return (
    <div className="payments-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="payments-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="payments-modal-title"
      >
        <div className="payments-modal-dialog__header">
          <div className="payments-modal-dialog__title-row">
            <div className="payments-modal-dialog__icon-circle">
              {activeModal === 'history' ? (
                <Clock size={20} className="text-sky-600" />
              ) : (
                <FileText size={20} className="text-sky-600" />
              )}
            </div>
            <h3 id="payments-modal-title" className="payments-modal-dialog__title">
              {activeModal === 'history' ? 'Payment History' : 'Invoices & Receipts'}
            </h3>
          </div>
          <button
            type="button"
            className="payments-modal-dialog__close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="payments-modal-dialog__body">
          {activeModal === 'history' ? (
            paidApps.length === 0 ? (
              <div className="payments-modal-dialog__empty-msg">
                <p>
                  You have no completed payments yet. Once you make a payment, your full transaction history will appear here.
                </p>
              </div>
            ) : (
              <div>
                <div className="payments-modal-dialog__summary-banner">
                  <span>
                    You have <strong>{paidApps.length}</strong> completed transaction{paidApps.length > 1 ? 's' : ''} totaling{' '}
                    <strong>₹{totalPaid.toLocaleString('en-IN')}</strong>.
                  </span>
                </div>
                <ul className="payments-modal-dialog__list">
                  {paidApps.map((app) => (
                    <li key={app.id} className="payments-modal-dialog__item">
                      <div>
                        <p className="payments-modal-dialog__item-title">{app.title}</p>
                        <p className="payments-modal-dialog__item-meta">
                          App #{app.code} • {app.paidAt || app.date}
                        </p>
                      </div>
                      <div className="payments-modal-dialog__item-right">
                        <span className="payments-modal-dialog__item-amount">
                          ₹{Number(app.amount).toLocaleString('en-IN')}
                        </span>
                        <span className="payments-modal-dialog__item-badge">Paid ✓</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : paidApps.length === 0 ? (
            <div className="payments-modal-dialog__empty-msg">
              <p>
                No invoices or payment receipts are available yet. Invoices are generated automatically upon successful payment.
              </p>
            </div>
          ) : (
            <div>
              <div className="payments-modal-dialog__summary-banner">
                <span>
                  <strong>{paidApps.length}</strong> tax invoice receipt{paidApps.length > 1 ? 's' : ''} available for download.
                </span>
              </div>
              <ul className="payments-modal-dialog__list">
                {paidApps.map((app) => (
                  <li key={app.id} className="payments-modal-dialog__item">
                    <div>
                      <p className="payments-modal-dialog__item-title">{app.title}</p>
                      <p className="payments-modal-dialog__item-meta">
                        Invoice for #{app.code} • ₹{Number(app.amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <Link
                      to={routePaths.paymentReceipt(app.code || app.id)}
                      className="payments-modal-dialog__action-btn"
                      onClick={onClose}
                    >
                      <span>View Invoice</span>
                      <ExternalLink size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="payments-modal-dialog__footer">
          <button
            type="button"
            className="payments-modal-dialog__dismiss-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

