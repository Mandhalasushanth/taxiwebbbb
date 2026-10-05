import React from 'react'

export interface TimelineStage {
  id: number
  title: string
  status: 'completed' | 'active' | 'upcoming'
  icon: React.ReactNode
}

export const REVISED_ITR_STAGES: TimelineStage[] = [
  {
    id: 1,
    title: 'Application Received',
    status: 'completed',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Payment Completed',
    status: 'completed',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'CA Verification',
    status: 'active',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Revised ITR Preparation',
    status: 'upcoming',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Filing',
    status: 'upcoming',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
  },
  {
    id: 6,
    title: 'Income Tax Processing',
    status: 'upcoming',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  },
]

export const RevisedItrTimelineCard: React.FC = () => {
  return (
    <section className="step6-card step6-timeline-card">
      <div className="step6-timeline-header">
        <h3 className="step6-card-heading">Revised ITR Timeline</h3>
        <span className="step6-stage-badge">Stage 3 of 6</span>
      </div>

      {/* Horizontal Timeline Stages */}
      <div className="step6-stepper-scroll">
        <div className="step6-stepper-row">
          {REVISED_ITR_STAGES.map((stage, index) => {
            const isLast = index === REVISED_ITR_STAGES.length - 1
            return (
              <div key={stage.id} className="step6-stepper-item-wrap">
                <div className={`step6-stepper-node status-${stage.status}`}>
                  <div className="step6-node-icon-circle">
                    {stage.icon}
                  </div>
                  <span className="step6-node-title">{stage.title}</span>
                </div>

                {!isLast && (
                  <div
                    className={`step6-stepper-connector connector-${
                      stage.status === 'completed'
                        ? REVISED_ITR_STAGES[index + 1].status === 'completed' || REVISED_ITR_STAGES[index + 1].status === 'active'
                          ? 'completed'
                          : 'active-transition'
                        : 'upcoming'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Inset Callout Note */}
      <div className="step6-current-stage-callout">
        <div className="step6-callout-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div className="step6-callout-text">
          <h4 className="step6-callout-title">Current Stage 3: CA Verification</h4>
          <p className="step6-callout-desc">
            Certified CA verifying original filing and revised declaration.
          </p>
        </div>
      </div>
    </section>
  )
}
