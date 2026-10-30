import React from 'react'
import { Card, EmptyState } from '@shared/components'
import './Business.css'

export const BusinessPage: React.FC = () => {
  return (
    <div className="business-page">
      <header className="business-page__header">
        <h1 className="business-page__title">Business</h1>
        <p className="business-page__subtitle">Licenses, registrations and regulatory services.</p>
      </header>

      <Card title="Business Services" subtitle="Licenses, registrations and filings.">
        <EmptyState
          title="Coming Soon"
          description="Business licenses, registrations and compliance services will be available here soon."
        />
      </Card>
    </div>
  )
}

export default BusinessPage
