import { useEffect, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { routePaths } from '@core/config'
import './QuickServices.css'

export interface QuickServiceItem {
  id: string
  label: string
  description: string
  to: string
  iconImg: string
}

const QUICK_SERVICE_LIST: QuickServiceItem[] = [
  {
    id: 'incorporation',
    label: 'Incorporation',
    description: 'Company & LLP Registration',
    to: routePaths.incorporation.root,
    iconImg: '/assets/images/services/icon-incorporation.png',
  },
  {
    id: 'gst',
    label: 'GST',
    description: 'Registration, Filing & Returns',
    to: routePaths.gst.root,
    iconImg: '/assets/images/services/icon-gst.png',
  },
  {
    id: 'itr',
    label: 'ITR',
    description: 'File Returns & TDS Refund',
    to: routePaths.itr.root,
    iconImg: '/assets/images/services/icon-itr.png',
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'CMA Data & Project Reports',
    to: '#quick-services',
    iconImg: '/assets/images/services/icon-projects.png',
  },
  {
    id: 'loans',
    label: 'Loans',
    description: 'Business & Personal Credit',
    to: routePaths.loans,
    iconImg: '/assets/images/services/icon-loans.png',
  },
  {
    id: 'insurance',
    label: 'Insurance',
    description: 'Health, Life & Business Cover',
    to: routePaths.insurance,
    iconImg: '/assets/images/services/icon-insurance.png',
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Trade License & Compliance',
    to: routePaths.business.root,
    iconImg: '/assets/images/services/icon-business.png',
  },
  {
    id: 'more',
    label: 'More Services',
    description: 'Explore All 40+ Solutions',
    to: '#quick-services',
    iconImg: '/assets/images/services/icon-more-services.png',
  },
]

export interface QuickServicesProps {
  services?: QuickServiceItem[]
}

export const QuickServices = ({ services = QUICK_SERVICE_LIST }: QuickServicesProps) => {
  const navigate = useNavigate()
  const { hash } = useLocation()

  const scrollToServices = () =>
    document.getElementById(routePaths.dashboardServicesAnchor)?.scrollIntoView({ behavior: 'smooth' })

  // Arriving via /dashboard#quick-services (sidebar "Projects", "Browse Services") lands on this grid
  useEffect(() => {
    if (hash === `#${routePaths.dashboardServicesAnchor}`) scrollToServices()
  }, [hash])

  const handleServiceClick = (e: MouseEvent, targetUrl: string) => {
    e.preventDefault()
    if (targetUrl.startsWith('#')) {
      scrollToServices()
      return
    }
    navigate(targetUrl)
  }

  return (
    <section className="quick-services" id={routePaths.dashboardServicesAnchor}>
      {/* Section Header */}
      <div className="quick-services__header">
        <div className="quick-services__header-left">
          <h2 className="quick-services__title">Services</h2>
          <p className="quick-services__subtitle">Select a service to get started immediately</p>
        </div>
      </div>

      {/* 8 Centered Cards Grid */}
      <div className="quick-services__grid">
        {services.map((service) => (
          <a
            className="quick-service"
            key={service.id}
            href={service.to}
            onClick={(e) => handleServiceClick(e, service.to)}
          >
            <div className="quick-service__icon-wrap">
              <img
                src={service.iconImg}
                alt={`${service.label} icon`}
                className="quick-service__icon-img"
                loading="eager"
              />
            </div>

            <h3 className="quick-service__label">{service.label}</h3>
          </a>
        ))}
      </div>
    </section>
  )
}

export default QuickServices



