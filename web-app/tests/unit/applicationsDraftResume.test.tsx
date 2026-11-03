// @vitest-environment jsdom
import { useEffect } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ApplicationCard } from '@modules/applications/components/ApplicationCard'
import { ApplicationTrackerView } from '@modules/applications/components/ApplicationTracker/ApplicationTrackerView'
import { getApplicationTrackerData } from '@modules/applications/data/applicationTrackerData'
import { userStorage } from '@core/storage/userStorage'
import { authStorage } from '@core/auth'
import { normalizeApplicationStatus } from '@modules/applications/utils/applicationStatusUtils'
import { resolveDraftResumeRoute, isDraftApplication } from '@modules/applications/utils/draftRouting'
import type { ApplicationsItem } from '@modules/applications/types/applications.types'

describe('Draft Applications Resume and Track Applications Separation', () => {
  const mockUser = { id: 'usr-resume-1', fullName: 'Rajesh Sharma', email: 'rajesh@example.com' }

  beforeEach(() => {
    localStorage.clear()
    authStorage.setUser(mockUser as any)
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  describe('ApplicationCard Behavior', () => {
    it('renders "Resume" for draft applications and navigates to service home page on click', () => {
      const draftItem: ApplicationsItem = {
        id: 'draft-gst-filing',
        reference: 'DRAFT-GST-FILING-7466',
        title: 'GST Filing',
        category: 'GST',
        status: 'DRAFT',
        statusLabel: 'Draft',
        date: 'Saved 3:10 PM',
        to: '/gst/filing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      let navigatedTo = ''
      const Wrapper = () => {
        return (
          <MemoryRouter initialEntries={['/applications']}>
            <ApplicationCard item={draftItem} />
            <TrackNav onChange={(path) => { navigatedTo = path }} />
          </MemoryRouter>
        )
      }

      render(<Wrapper />)

      // Card action text must be "Resume" not "Track"
      const resumeBtn = screen.getByText('Resume')
      expect(resumeBtn).toBeDefined()
      expect(screen.queryByText('Track')).toBeNull()

      // Clicking draft card navigates to draft service home page (/gst/filing)
      fireEvent.click(resumeBtn)
      expect(navigatedTo).toBe('/gst/filing')
    })

    it('renders "Track" for submitted applications and navigates to tracking details on click', () => {
      const submittedItem: ApplicationsItem = {
        id: 'app-gst-001',
        reference: 'GST-2026-91823',
        title: 'GST Registration',
        category: 'GST',
        status: 'UNDER_VERIFICATION',
        statusLabel: 'Under Verification',
        date: 'Today',
        to: '/applications/track/GST-2026-91823',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      let navigatedTo = ''
      const Wrapper = () => {
        return (
          <MemoryRouter initialEntries={['/applications']}>
            <ApplicationCard item={submittedItem} />
            <TrackNav onChange={(path) => { navigatedTo = path }} />
          </MemoryRouter>
        )
      }

      render(<Wrapper />)

      // Card action text must be "Track" not "Resume"
      const trackBtn = screen.getByText('Track')
      expect(trackBtn).toBeDefined()
      expect(screen.queryByText('Resume')).toBeNull()

      // Clicking submitted card navigates to tracking details (/applications/track/...)
      fireEvent.click(trackBtn)
      expect(navigatedTo).toBe('/applications/track/GST-2026-91823')
    })
  })

  describe('Draft Separation from Track Applications', () => {
    it('returns null for draft applications in getApplicationTrackerData and never generates fake timelines', () => {
      userStorage.saveDraft({
        serviceId: 'gst-filing',
        serviceTitle: 'GST Filing',
        currentStep: 1,
        totalSteps: 3,
        stepLabel: 'Filing Period',
        formData: {
          filingData: {
            frequency: 'Annual',
            financialYear: 'FY 2018-19',
            selectedMonth: 'FY 2018-19(Full Year Return)',
            gstin: '29ABCDE1234F1Z5',
            returnType: 'gstr1',
          },
        },
        savedAt: '3:10 PM',
        savedTimestamp: 1730000000000,
        resumeRoute: '/gst/filing',
      })

      // Draft ID or Draft reference must NOT return tracking data
      expect(getApplicationTrackerData('draft-gst-filing')).toBeNull()
      expect(getApplicationTrackerData('DRAFT-GST-FILING-7466')).toBeNull()
      expect(getApplicationTrackerData('draft-gst-registration')).toBeNull()
    })

    it('redirects directly to the draft service home page when attempting to access tracking route for a draft', () => {
      userStorage.saveDraft({
        serviceId: 'gst-filing',
        serviceTitle: 'GST Filing',
        currentStep: 1,
        totalSteps: 3,
        stepLabel: 'Filing Period',
        formData: {
          filingData: {
            frequency: 'Annual',
            financialYear: 'FY 2018-19',
            selectedMonth: 'FY 2018-19(Full Year Return)',
          },
        },
        savedAt: '3:10 PM',
        savedTimestamp: 1730000000000,
        resumeRoute: '/gst/filing',
      })

      let currentPath = '/applications/track/DRAFT-GST-FILING-7466'
      render(
        <MemoryRouter initialEntries={[currentPath]}>
          <Routes>
            <Route path="/applications/track/:id" element={<ApplicationTrackerView />} />
            <Route path="/gst/filing" element={<div data-testid="gst-filing-page">GST Filing Home</div>} />
          </Routes>
          <TrackNav onChange={(path) => { currentPath = path }} />
        </MemoryRouter>
      )

      // Must redirect to /gst/filing
      expect(currentPath).toBe('/gst/filing')
    })

    it('displays tracking data only for genuinely submitted applications', () => {
      userStorage.saveUserApplication({
        id: 'app-submitted-889',
        code: 'GST-REG-88231',
        title: 'GST Registration',
        meta: 'Acme Pvt Ltd · Maharashtra',
        statusLabel: 'Under Review',
        statusTone: 'warning',
        progress: 35,
        icon: '📄',
        to: '/applications/track/GST-REG-88231',
      })

      const trackerData = getApplicationTrackerData('GST-REG-88231')
      expect(trackerData).not.toBeNull()
      expect(trackerData?.appId).toBe('GST-REG-88231')
      expect(trackerData?.title).toBe('GST Registration')
      expect(trackerData?.timelineSteps.length).toBe(5)
    })
  })

  describe('Status Normalization and Categorization', () => {
    it('normalizes DRAFT status to DRAFT and does not classify drafts as IN_PROGRESS', () => {
      expect(normalizeApplicationStatus('DRAFT', 'Draft')).toBe('DRAFT')
      expect(normalizeApplicationStatus(undefined, 'Draft')).toBe('DRAFT')
      expect(normalizeApplicationStatus('DRAFT', undefined)).toBe('DRAFT')
      expect(normalizeApplicationStatus('In Progress', 'Processing')).toBe('IN_PROGRESS')
    })
  })

  describe('Dynamic Resume Route Resolution', () => {
    it('resolves correct destinations across all services', () => {
      expect(resolveDraftResumeRoute('gst-filing')).toBe('/gst/filing')
      expect(resolveDraftResumeRoute('gst-registration')).toBe('/gst/registration')
      expect(resolveDraftResumeRoute('gst-amendment')).toBe('/gst/amendment')
      expect(resolveDraftResumeRoute('gst-compliance')).toBe('/gst/compliance')
      expect(resolveDraftResumeRoute('gst-cancellation')).toBe('/gst/cancellation')
      expect(resolveDraftResumeRoute('itr-filing')).toBe('/itr/itr-filing')
      expect(resolveDraftResumeRoute('itr-revised')).toBe('/itr/revised-itr')
      expect(resolveDraftResumeRoute('itr-tds-refund')).toBe('/itr/tds-refund')
      expect(resolveDraftResumeRoute('incorporation')).toBe('/incorporation/company-details')
      expect(resolveDraftResumeRoute('home-loan')).toBe('/loans/home-loan')
      expect(resolveDraftResumeRoute('personal-loan')).toBe('/loans/personal-loan')
    })
  })
})

function TrackNav({ onChange }: { onChange: (path: string) => void }) {
  const location = useLocation()
  useEffect(() => {
    onChange(location.pathname)
  }, [location.pathname, onChange])
  return null
}
