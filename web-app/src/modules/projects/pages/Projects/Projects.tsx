import React from 'react'
import { Card, EmptyState } from '@shared/components'
import './Projects.css'

export const ProjectsPage: React.FC = () => {
  return (
    <div className="projects-page">
      <header className="projects-page__header">
        <h1 className="projects-page__title">Projects</h1>
        <p className="projects-page__subtitle">Project reports, funding and compliance management.</p>
      </header>

      <Card title="Project Services" subtitle="Project finance, DPR and funding advisory.">
        <EmptyState
          title="Coming Soon"
          description="Project reports, DPR preparation and project funding services will be available here soon."
        />
      </Card>
    </div>
  )
}

export default ProjectsPage

