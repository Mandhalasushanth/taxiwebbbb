import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader } from '@shared/components'
import { useApplications } from '../../hooks/useApplications'
import type {
  ApplicationCategory,
  ApplicationOverviewFilter,
  ApplicationOverviewStats,
} from '../../types/applications.types'
import { ApplicationCategoryTabs } from '../../components/ApplicationCategoryTabs'
import { ApplicationOverviewCards } from '../../components/ApplicationOverviewCards'
import { ApplicationCard } from '../../components/ApplicationCard'
import {
  normalizeApplicationStatus,
  matchesStatusFilter,
} from '../../utils/applicationStatusUtils'
import './Applications.css'
import './Applications.part2.css'

const VALID_CATEGORIES: ApplicationCategory[] = [
  'All',
  'GST',
  'ITR',
  'Loans',
  'Company Registration',
  'Business',
  'Insurance',
]

export const Applications: React.FC = () => {
  const { data, isLoading } = useApplications()
  const allApplications = useMemo(() => data ?? [], [data])

  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const [activeCategory, setActiveCategory] = useState<ApplicationCategory>(() => {
    if (categoryParam && VALID_CATEGORIES.includes(categoryParam as ApplicationCategory)) {
      return categoryParam as ApplicationCategory
    }
    return 'All'
  })

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat && VALID_CATEGORIES.includes(cat as ApplicationCategory)) {
      setActiveCategory(cat as ApplicationCategory)
    }
  }, [searchParams])

  const [activeOverviewFilter, setActiveOverviewFilter] = useState<ApplicationOverviewFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Compute category counts
  const categoryCounts = useMemo(() => {
    return allApplications.reduce<Record<ApplicationCategory, number>>(
      (acc, item) => {
        if (acc[item.category] !== undefined) {
          acc[item.category] += 1
        }
        acc.All += 1
        return acc
      },
      {
        All: 0,
        GST: 0,
        ITR: 0,
        Loans: 0,
        'Company Registration': 0,
        Business: 0,
        Insurance: 0,
      }
    )
  }, [allApplications])

  // Compute stats for overview cards based on active category
  const stats = useMemo<ApplicationOverviewStats>(() => {
    const relevant = activeCategory === 'All'
      ? allApplications
      : allApplications.filter((item) => item.category === activeCategory)

    return {
      total: relevant.length,
      inProgress: relevant.filter(
        (item) => normalizeApplicationStatus(item.status, item.statusLabel) === 'IN_PROGRESS'
      ).length,
      completed: relevant.filter(
        (item) => normalizeApplicationStatus(item.status, item.statusLabel) === 'COMPLETED'
      ).length,
      underVerification: relevant.filter(
        (item) => normalizeApplicationStatus(item.status, item.statusLabel) === 'UNDER_VERIFICATION'
      ).length,
    }
  }, [allApplications, activeCategory])

  // Filter applications by category, overview status, and search query
  const filteredApplications = useMemo(() => {
    return allApplications.filter((item) => {
      // Category filter
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false
      }

      // Overview status filter matching mobile app logic
      if (!matchesStatusFilter(item.status, activeOverviewFilter, item.statusLabel)) {
        return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesRef = item.reference.toLowerCase().includes(query)
        const matchesTitle = item.title.toLowerCase().includes(query)
        const matchesTag = item.tag ? item.tag.toLowerCase().includes(query) : false
        if (!matchesRef && !matchesTitle && !matchesTag) {
          return false
        }
      }

      return true
    })
  }, [allApplications, activeCategory, activeOverviewFilter, searchQuery])

  const handleResetFilters = () => {
    setActiveCategory('All')
    setActiveOverviewFilter('ALL')
    setSearchQuery('')
  }

  return (
    <div className="applications-web-container">
      {/* Desktop Web Header */}
      <header className="applications-web-header">
        <div className="applications-web-header__left">
          <h1 className="applications-web-header__title">My Applications</h1>
          <p className="applications-web-header__subtitle">Track all your service applications</p>
        </div>
      </header>

      {/* 1st: Application Overview Metric Cards */}
      <ApplicationOverviewCards
        stats={stats}
        activeFilter={activeOverviewFilter}
        onSelectFilter={setActiveOverviewFilter}
      />

      {/* 2nd: Category Navigation Tabs */}
      <ApplicationCategoryTabs
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat)
          setActiveOverviewFilter('ALL')
        }}
        categoryCounts={categoryCounts}
      />

      {/* Recent Applications Section */}
      <section className="app-list-section" aria-labelledby="recent-apps-heading">
        <div className="app-list-section__header">
          <div className="app-list-section__title-group">
            <h2 id="recent-apps-heading" className="app-section-title">Recent Applications</h2>
            <span className="app-list-count-badge">{filteredApplications.length}</span>
          </div>

          {/* Search bar on desktop */}
          <div className="app-list-search-wrap">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="app-search-icon"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="app-search-input"
              placeholder="Search by ID or service name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search applications"
            />
            {searchQuery && (
              <button
                type="button"
                className="app-search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="app-list-loading">
            <Loader label="Loading applications..." />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredApplications.length === 0 && (
          <div className="app-empty-card">
            <div className="app-empty-card__icon">📂</div>
            <h3 className="app-empty-card__title">No Applications Found</h3>
            <p className="app-empty-card__desc">
              {searchQuery || activeCategory !== 'All' || activeOverviewFilter !== 'ALL'
                ? 'No service applications match your selected filter criteria.'
                : 'You have not submitted any service applications yet.'}
            </p>
            {(searchQuery || activeCategory !== 'All' || activeOverviewFilter !== 'ALL') && (
              <button
                type="button"
                className="app-empty-card__reset-btn"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}

        {/* Applications List */}
        {!isLoading && filteredApplications.length > 0 && (
          <div className="app-cards-list">
            {filteredApplications.map((item) => (
              <ApplicationCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Applications
