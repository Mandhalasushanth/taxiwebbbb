import React from 'react'
import type { ApplicationCategory } from '../types/applications.types'
import { APPLICATION_CATEGORIES } from '../constants/applications.constants'
import {
  AllIcon,
  GstDocIcon,
  ItrDocIcon,
  LoansIcon,
  CompanyIcon,
  BusinessIcon,
  InsuranceIcon,
} from './ApplicationIcons'

interface ApplicationCategoryTabsProps {
  activeCategory: ApplicationCategory
  onSelectCategory: (category: ApplicationCategory) => void
  categoryCounts: Record<ApplicationCategory, number>
}

export const ApplicationCategoryTabs: React.FC<ApplicationCategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const renderIcon = (cat: ApplicationCategory) => {
    switch (cat) {
      case 'All':
        return <AllIcon />
      case 'GST':
        return <GstDocIcon />
      case 'ITR':
        return <ItrDocIcon />
      case 'Loans':
        return <LoansIcon />
      case 'Company Registration':
        return <CompanyIcon />
      case 'Business':
        return <BusinessIcon />
      case 'Insurance':
        return <InsuranceIcon />
      default:
        return <AllIcon />
    }
  }

  return (
    <div className="app-cat-tabs-container">
      <nav className="app-cat-tabs" aria-label="Application Categories">
        {APPLICATION_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id
          const count = categoryCounts[cat.id] ?? 0

          return (
            <button
              key={cat.id}
              type="button"
              className={`app-cat-tab-btn ${isActive ? 'app-cat-tab-btn--active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
              aria-selected={isActive}
              aria-label={`Category ${cat.label}`}
            >
              <div className="app-cat-tab-icon-wrap">
                {renderIcon(cat.id)}
              </div>
              <span className="app-cat-tab-label">{cat.label}</span>
              {count > 0 && (
                <span className="app-cat-tab-count">{count}</span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
