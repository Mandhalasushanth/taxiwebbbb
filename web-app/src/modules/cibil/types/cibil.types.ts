/**
 * CIBIL Credit Score Types and Interfaces
 * Strictly defined according to official TransUnion CIBIL scoring standards (300 - 900).
 */

export type CibilScoreCategoryKey = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT'

export interface CibilScoreCategory {
  key: CibilScoreCategoryKey
  label: string
  color: string
  bgLight: string
  borderColor: string
}

export type CibilScreenState =
  | 'CONNECTING'
  | 'FETCHING'
  | 'SUCCESS'
  | 'FIRST_TIME'
  | 'NO_HISTORY'
  | 'ERROR'
  | 'REPORT_UNAVAILABLE'

export interface CibilInsightMetric {
  id: string
  title: string
  valueDisplay: string
  description: string
  status: 'positive' | 'attention' | 'neutral'
  indicatorColor: string
  iconName: 'wallet' | 'check-circle' | 'pie-chart' | 'clock' | 'search'
  cardTheme: 'green' | 'blue' | 'orange' | 'purple' | 'cyan'
}

export interface CibilAccountDetail {
  accountType: string
  institutionMasked: string
  currentBalance: string
  status: string
  sanctionedAmount?: string
  openedDate?: string
}

export interface CibilFullReportData {
  bureauName: string
  reportId: string
  generatedDate: string
  panMasked: string
  totalAccounts: number
  openAccounts: number
  closedAccounts: number
  totalEnquiriesLastYear: number
  accounts: CibilAccountDetail[]
}

export interface CibilScoreResponse {
  score: number
  minScore: number
  maxScore: number
  previousScore: number | null
  scoreDelta: number | null
  lastUpdatedDate: string
  nextReportDate?: string
  isFirstTimeCheck: boolean
  hasCreditHistory: boolean
  insights: CibilInsightMetric[]
  fullReportAvailable: boolean
  fullReport?: CibilFullReportData
}

/**
 * Official TransUnion CIBIL Score Category Mapper
 * 300 - 549: Poor
 * 550 - 649: Fair
 * 650 - 749: Good
 * 750 - 900: Excellent
 */
export function getCibilCategory(score: number): CibilScoreCategory {
  if (score < 550) {
    return {
      key: 'POOR',
      label: 'Poor',
      color: '#EF4444',
      bgLight: '#FEF2F2',
      borderColor: '#FECACA',
    }
  }
  if (score < 650) {
    return {
      key: 'FAIR',
      label: 'Fair',
      color: '#F97316',
      bgLight: '#FFF7ED',
      borderColor: '#FED7AA',
    }
  }
  if (score < 750) {
    return {
      key: 'GOOD',
      label: 'Good',
      color: '#EAB308',
      bgLight: '#FEFCE8',
      borderColor: '#FEF08A',
    }
  }
  return {
    key: 'EXCELLENT',
    label: 'EXCELLENT',
    color: '#16A34A',
    bgLight: '#F0FDF4',
    borderColor: '#BBF7D0',
  }
}
