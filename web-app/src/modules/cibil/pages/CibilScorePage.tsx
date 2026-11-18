import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lightbulb, AlertTriangle, FileText, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@store/index'
import { authStorage } from '@core/auth'
import { routePaths } from '@core/config'
import { cibilService } from '../services/cibilService'
import type { CibilScoreResponse, CibilScreenState } from '../types/cibil.types'
import { CibilConnectionAnimation } from '../components/CibilConnectionAnimation/CibilConnectionAnimation'
import { CibilScoreGauge } from '../components/CibilScoreGauge/CibilScoreGauge'
import { CibilScoreDeltaCard } from '../components/CibilScoreDeltaCard/CibilScoreDeltaCard'
import { CibilInsightsSection } from '../components/CibilInsightsSection/CibilInsightsSection'
import { CibilReportModal } from '../components/CibilReportModal/CibilReportModal'
import { CibilRaiseIssueModal } from '../components/CibilRaiseIssueModal/CibilRaiseIssueModal'
import './CibilScorePage.css'

export const CibilScorePage: React.FC = () => {
  const navigate = useNavigate()
  const storeUser = useAuthStore((state) => state.user)
  const user = storeUser || authStorage.getUser()
  const displayName = user?.fullName || 'Member'

  // Application States: CONNECTING | FETCHING | SUCCESS | FIRST_TIME | NO_HISTORY | ERROR | REPORT_UNAVAILABLE
  const [screenState, setScreenState] = useState<CibilScreenState>('CONNECTING')
  const [connectionStage, setConnectionStage] = useState<'connecting' | 'fetching'>('connecting')
  const [scoreData, setScoreData] = useState<CibilScoreResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)

  const loadScore = useCallback(async (options?: { simulateError?: boolean }) => {
    try {
      setScreenState('CONNECTING')
      setConnectionStage('connecting')
      setErrorMessage('')

      // Stage 1: CIBIL to Finsolz Connection Animation (1.4s)
      await new Promise((resolve) => setTimeout(resolve, 1400))
      setConnectionStage('fetching')

      // Stage 2: Fetch score from provider/backend service
      const response = await cibilService.fetchCreditScore({
        ...options,
        user: user ? { fullName: user.fullName, pan: user.pan } : undefined,
      })
      setScoreData(response)

      if (!response.hasCreditHistory) {
        setScreenState('NO_HISTORY')
      } else if (response.isFirstTimeCheck) {
        setScreenState('FIRST_TIME')
      } else if (!response.fullReportAvailable) {
        setScreenState('REPORT_UNAVAILABLE')
      } else {
        setScreenState('SUCCESS')
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to establish handshake with credit bureau. Please verify your connection and retry.'
      )
      setScreenState('ERROR')
    }
  }, [])

  useEffect(() => {
    loadScore()
  }, [loadScore])

  // 1. Loading States: Connecting / Fetching
  if (screenState === 'CONNECTING' || screenState === 'FETCHING') {
    return <CibilConnectionAnimation stage={connectionStage} />
  }

  // 2. Error State
  if (screenState === 'ERROR') {
    return (
      <div className="cibil-page">
        <div className="cibil-state-card">
          <div className="cibil-state-icon-box cibil-state-icon-box--error">
            <AlertTriangle size={32} />
          </div>
          <h2 className="cibil-state-title">Bureau Handshake Failed</h2>
          <p className="cibil-state-desc">{errorMessage}</p>
          <button
            type="button"
            className="cibil-retry-btn"
            onClick={() => loadScore()}
          >
            <RefreshCw size={16} />
            <span>Retry Handshake</span>
          </button>
        </div>
      </div>
    )
  }

  // 3. No Credit History State
  if (screenState === 'NO_HISTORY') {
    return (
      <div className="cibil-page">
        <div className="cibil-state-card">
          <div className="cibil-state-icon-box cibil-state-icon-box--no-history">
            <FileText size={32} />
          </div>
          <h2 className="cibil-state-title">No Credit History Found</h2>
          <p className="cibil-state-desc">
            You do not have sufficient credit history recorded with TransUnion CIBIL
            yet. As you apply for loans or credit cards, your credit file will establish.
          </p>
          <button
            type="button"
            className="cibil-retry-btn"
            onClick={() => navigate(routePaths.dashboard)}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // 4. Success / First Time / Report Unavailable Dashboard States
  return (
    <div className="cibil-page" data-testid="cibil-dashboard">
      {scoreData && (
        <>
          {/* Section A: CIBIL Score Panel (Top Card) */}
          <div className="cibil-score-panel-card">
            {/* Left: Gauge */}
            <CibilScoreGauge
              score={scoreData.score}
              minScore={scoreData.minScore}
              maxScore={scoreData.maxScore}
            />

            {/* Divider */}
            <div className="cibil-score-panel-divider" aria-hidden="true" />

            {/* Right: Score Movement & Refresh Notice */}
            <CibilScoreDeltaCard
              scoreDelta={scoreData.scoreDelta}
              previousScore={scoreData.previousScore}
              nextReportDate={scoreData.nextReportDate}
              lastUpdatedDate={scoreData.lastUpdatedDate}
            />
          </div>

          {/* Section B: Credit Score Insights with right-aligned View Full Report button */}
          <CibilInsightsSection
            userName={displayName}
            insights={scoreData.insights}
            onViewReport={() => setIsReportModalOpen(true)}
          />

          {/* Section D: Educational Information Card */}
          <div className="cibil-educational-banner">
            <div className="cibil-educational-icon-wrap" aria-hidden="true">
              <Lightbulb size={20} />
            </div>
            <div className="cibil-educational-title">Do you know?</div>
            <div className="cibil-educational-sep" aria-hidden="true" />
            <p className="cibil-educational-desc">
              Regularly checking your Credit Score on Finsolz will not impact your score.
              It is treated as an informational check with the credit bureau.
            </p>
          </div>

          {/* Section E: Raise an Issue */}
          <div className="cibil-raise-issue-row">
            <span>Issue with your CIBIL Score?</span>
            <button
              type="button"
              className="cibil-raise-issue-btn"
              onClick={() => setIsIssueModalOpen(true)}
            >
              Raise an Issue
            </button>
          </div>
        </>
      )}

      {/* Full Report Modal */}
      <CibilReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportData={scoreData?.fullReport}
        isReportAvailable={scoreData?.fullReportAvailable ?? false}
      />

      {/* Raise Issue Dispute Modal */}
      <CibilRaiseIssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onNavigateSupport={() => navigate(routePaths.support)}
        onSubmitDispute={(payload) => cibilService.submitDispute(payload)}
      />
    </div>
  )
}
export default CibilScorePage
