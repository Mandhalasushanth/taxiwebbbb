import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { routePaths } from '@core/config'

export interface CurrentNavInfo {
  sectionTitle: string
  label: string
}

interface DashboardBreadcrumbProps {
  currentNav: CurrentNavInfo
}

export const DashboardBreadcrumb: React.FC<DashboardBreadcrumbProps> = ({ currentNav }) => {
  const location = useLocation()
  const path = location.pathname

  if (
    path === routePaths.gst.filing ||
    path === routePaths.gst.filePeriod ||
    path === routePaths.gst.fileUpload ||
    path === routePaths.gst.fileReview ||
    path === routePaths.gst.filePayment ||
    path === routePaths.gst.fileSuccess ||
    path === routePaths.gst.fileReceipt
  ) {
    const stepLabel =
      path === routePaths.gst.fileUpload
        ? 'Documents'
        : path === routePaths.gst.fileReview
          ? 'Review'
          : path === routePaths.gst.filePayment
            ? 'Payment'
            : path === routePaths.gst.fileSuccess
              ? 'Confirmation'
              : path === routePaths.gst.fileReceipt
                ? 'Receipt'
                : 'Period'

    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <Link to={routePaths.gst.root}>GST</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        <Link to={routePaths.gst.filing}>Filing</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        <span className="shell__breadcrumb-current">{stepLabel}</span>
      </nav>
    )
  }

  if (path === routePaths.gst.registration || path.startsWith('/gst/registration')) {
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <Link to={routePaths.gst.root}>GST</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        <span className="shell__breadcrumb-current">Registration</span>
      </nav>
    )
  }

  if (path === routePaths.gst.returns) {
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <Link to={routePaths.gst.root}>GST</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        <span className="shell__breadcrumb-current">Returns</span>
      </nav>
    )
  }

  if (path.startsWith('/gst/') && path.endsWith('/track')) {
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <Link to={routePaths.gst.root}>GST</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        <span className="shell__breadcrumb-current">Track Application</span>
      </nav>
    )
  }

  if (path === routePaths.gst.amendment) {
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <Link to={routePaths.gst.root}>GST</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        <span className="shell__breadcrumb-current">Amendment</span>
      </nav>
    )
  }

  if (path === routePaths.gst.certificate) {
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <Link to={routePaths.gst.root}>GST</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        <span className="shell__breadcrumb-current">Certificate</span>
      </nav>
    )
  }

  if (
    path === routePaths.gst.compliance ||
    path === routePaths.gst.complianceSubmitted ||
    path.startsWith(routePaths.gst.compliance)
  ) {
    const isSubmitted = path === routePaths.gst.complianceSubmitted || location.search.includes('submitted')
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <Link to={routePaths.gst.root}>GST</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        {isSubmitted ? (
          <>
            <Link to={routePaths.gst.compliance}>Compliance</Link>
            <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
            <span className="shell__breadcrumb-current">Submitted</span>
          </>
        ) : (
          <span className="shell__breadcrumb-current">Compliance</span>
        )}
      </nav>
    )
  }

  if (
    path === routePaths.gst.cancellation ||
    path === routePaths.gst.cancellationSubmitted ||
    path.startsWith(routePaths.gst.cancellation)
  ) {
    const isSubmitted = path === routePaths.gst.cancellationSubmitted || location.search.includes('submitted')
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <Link to={routePaths.gst.root}>GST</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        {isSubmitted ? (
          <>
            <Link to={routePaths.gst.cancellation}>Cancellation</Link>
            <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
            <span className="shell__breadcrumb-current">Submitted</span>
          </>
        ) : (
          <span className="shell__breadcrumb-current">Cancellation</span>
        )}
      </nav>
    )
  }

  if (path === routePaths.gst.root) {
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <span className="shell__breadcrumb-current">GST</span>
      </nav>
    )
  }

  if (path.startsWith('/itr/')) {
    const itrLabel =
      path === routePaths.itr.fileItr
        ? 'File ITR'
        : path === routePaths.itr.itrFiling
          ? 'ITR Filing'
            : path === routePaths.itr.tdsRefund
              ? 'TDS Refund'
              : path === routePaths.itr.previousYearItr
                ? 'Previous Year ITR'
                : path === routePaths.itr.revisedItr
                  ? 'Revised ITR'
                  : path === routePaths.itr.taxNoticeAssistance
                    ? 'Notice Assistance'
                    : path === routePaths.itr.tdsRefundEstimator
                      ? 'TDS Refund Estimator'
                      : path === routePaths.itr.taxComputation
                        ? 'Tax Computation'
                        : 'Filing'

    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <Link to={routePaths.itr.root}>ITR &amp; TDS</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        <span className="shell__breadcrumb-current">{itrLabel}</span>
      </nav>
    )
  }

  if (path === routePaths.itr.root) {
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <span className="shell__breadcrumb-current">ITR &amp; TDS</span>
      </nav>
    )
  }

  if (path.startsWith('/applications')) {
    const isTracker = path.includes('/track') || path !== routePaths.applications
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <Link to={routePaths.dashboard}>Home</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        {isTracker ? (
          <>
            <Link to={routePaths.applications}>Applications</Link>
            <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
            <span className="shell__breadcrumb-current">Track Application</span>
          </>
        ) : (
          <span className="shell__breadcrumb-current">Applications</span>
        )}
      </nav>
    )
  }

  if (currentNav.sectionTitle === 'Services') {
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <Link to={routePaths.dashboard}>Services</Link>
        <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
        <span className="shell__breadcrumb-current">{currentNav.label}</span>
      </nav>
    )
  }

  if (currentNav.label === 'Dashboard' || path === routePaths.dashboard) {
    return (
      <nav className="shell__breadcrumb" aria-label="Breadcrumb">
        <span className="shell__breadcrumb-current">Dashboard</span>
      </nav>
    )
  }

  return (
    <nav className="shell__breadcrumb" aria-label="Breadcrumb">
      <Link to={routePaths.dashboard}>Home</Link>
      <span className="shell__breadcrumb-sep" aria-hidden="true">→</span>
      <span className="shell__breadcrumb-current">{currentNav.label}</span>
    </nav>
  )
}
