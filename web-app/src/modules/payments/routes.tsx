import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

import { routePaths } from '@core/config'

const Payments = lazy(() => import('./pages/Payments/Payments'))
const Receipt = lazy(() => import('./pages/Receipt/Receipt'))
const PaymentCheckoutPage = lazy(() => import('./pages/PaymentCheckout/PaymentCheckoutPage'))

export const paymentsRoutes: RouteObject[] = [
  { path: routePaths.payments, element: <Payments /> },
  { path: routePaths.paymentCheckout(), element: <PaymentCheckoutPage /> },
  { path: routePaths.paymentCheckoutDirect, element: <PaymentCheckoutPage /> },
  { path: routePaths.paymentReceiptDirect, element: <Receipt /> },
  { path: routePaths.paymentReceipt(), element: <Receipt /> },
]
