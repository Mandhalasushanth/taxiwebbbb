import React, { useCallback } from 'react'
import { Outlet, useLocation, type Location } from 'react-router-dom'

import { routePaths } from '@core/config'
import { useDraftBlocker } from '@shared/hooks'
import { DraftConfirmModal } from '@shared/components'
import { userStorage } from '@core/storage/userStorage'
import { useAppStore } from '@store/index'
import { IncorporationProvider } from '../../hooks'

const WIZARD_ROUTES = [
  routePaths.incorporation.selectType,
  routePaths.incorporation.companyDetails,
  routePaths.incorporation.registeredOffice,
  routePaths.incorporation.promoterDetails,
  routePaths.incorporation.capitalDetails,
  routePaths.incorporation.documentsKyc,
  routePaths.incorporation.linkedRegistrations,
  routePaths.incorporation.reviewApplication,
  routePaths.incorporation.feesPayment,
] as const

const STEP_META: Record<string, { step: number; label: string }> = {
  [routePaths.incorporation.selectType]: { step: 1, label: 'Company Type' },
  [routePaths.incorporation.companyDetails]: { step: 2, label: 'Company Details' },
  [routePaths.incorporation.registeredOffice]: { step: 3, label: 'Registered Office' },
  [routePaths.incorporation.promoterDetails]: { step: 4, label: 'Promoter Details' },
  [routePaths.incorporation.capitalDetails]: { step: 5, label: 'Capital Details' },
  [routePaths.incorporation.documentsKyc]: { step: 6, label: 'Documents & KYC' },
  [routePaths.incorporation.linkedRegistrations]: { step: 7, label: 'Linked Registrations' },
  [routePaths.incorporation.reviewApplication]: { step: 8, label: 'Review Application' },
  [routePaths.incorporation.feesPayment]: { step: 9, label: 'Fees Payment' },
}

export const IncorporationWizardLayout: React.FC = () => {
  const location = useLocation()
  const pushToast = useAppStore((state) => state.pushToast)

  const isWizardStep = (WIZARD_ROUTES as readonly string[]).includes(location.pathname)

  const saveCurrentDraft = useCallback(() => {
    const meta = STEP_META[location.pathname] || { step: 1, label: 'Company Incorporation' }

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

    userStorage.saveDraft({
      serviceId: 'incorporation',
      serviceTitle: 'Company Incorporation',
      currentStep: meta.step,
      totalSteps: 9,
      stepLabel: meta.label,
      formData: {
        stepRoute: location.pathname,
        stepState: location.state || {},
      },
      savedAt: timeStr,
      savedTimestamp: Date.now(),
      resumeRoute: location.pathname,
    })
  }, [location.pathname, location.state])

  // Allow moving forward/backward between wizard steps or to submission success
  const isNavigationAllowed = useCallback(
    (nextLocation: Location) => {
      if (
        location.pathname === routePaths.incorporation.selectType &&
        nextLocation.pathname === routePaths.incorporation.root
      ) {
        return true
      }
      return (
        (WIZARD_ROUTES as readonly string[]).includes(nextLocation.pathname) ||
        nextLocation.pathname === routePaths.incorporation.submissionSuccess ||
        nextLocation.pathname === routePaths.incorporation.applicationTracking ||
        nextLocation.pathname === routePaths.incorporation.receipt
      )
    },
    [location.pathname]
  )


  const shouldBlock = isWizardStep && location.pathname !== routePaths.incorporation.selectType

  const {
    isModalOpen,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleKeepEditing,
  } = useDraftBlocker({
    shouldBlock,
    onSaveDraft: () => {
      saveCurrentDraft()
      pushToast('Incorporation draft saved', 'success')
    },
    onDiscardDraft: () => {
      userStorage.deleteDraft('incorporation')
      pushToast('Draft discarded', 'info')
    },
    defaultExitRoute: routePaths.dashboard,
    isNavigationAllowed,
  })

  return (
    <>
    <IncorporationProvider>
      <Outlet />
      <DraftConfirmModal
        isOpen={isModalOpen}
        serviceTitle="company incorporation"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onKeepEditing={handleKeepEditing}
      />
    </IncorporationProvider>
    </>
  )
}

export default IncorporationWizardLayout
