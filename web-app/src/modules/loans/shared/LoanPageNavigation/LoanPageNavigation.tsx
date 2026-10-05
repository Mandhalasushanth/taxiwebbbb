import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './LoanPageNavigation.css'

export interface LoanPageNavigationProps {
  title: string
  subtitle?: string
  category?: string
  backTo?: string
  onBack?: () => void
  showBack?: boolean
  extraRight?: React.ReactNode
}

export const LoanPageNavigation: React.FC<LoanPageNavigationProps> = ({
  title,
  subtitle,
  category,
  backTo = '/loans',
  onBack,
  showBack = false,
  extraRight,
}) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backTo) {
      navigate(backTo)
    } else {
      navigate(-1)
    }
  }

  const hasExtraHeaderContent = showBack || category || subtitle

  return (
    <header className="loan-page-nav">
      {hasExtraHeaderContent ? (
        <div className="loan-page-nav__left">
          {showBack && (
            <button
              type="button"
              className="loan-page-nav__back-btn"
              onClick={handleBack}
              aria-label="Back"
            >
              <ArrowLeft
                size={20}
                aria-hidden="true"
              />
            </button>
          )}
          <div className="loan-page-nav__titles">
            {category && <span className="loan-page-nav__category">{category}</span>}
            <h1 className="loan-page-nav__title">{title}</h1>
            {subtitle && <p className="loan-page-nav__subtitle">{subtitle}</p>}
          </div>
        </div>
      ) : (
        <h1 className="loan-page-nav__title">{title}</h1>
      )}

      {extraRight && <div className="loan-page-nav__right">{extraRight}</div>}
    </header>
  )
}

export default LoanPageNavigation
