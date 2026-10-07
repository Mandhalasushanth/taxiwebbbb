import React from 'react'
import { Outlet } from 'react-router-dom'
import { ServiceDraftModal } from '@shared/saveDraft'
import { IncorporationProvider, useIncorporationFlow } from '../../hooks'
import { INCORPORATION_SERVICE_TITLE } from '../../utils/incorporationDraft.constants'

/** Save / discard / keep-editing dialog for the wizard (opened by "Save Draft & Exit" or by leaving) */
const IncorporationDraftModal: React.FC = () => {
  const { draft } = useIncorporationFlow()
  return (
    <ServiceDraftModal draft={draft} serviceTitle={INCORPORATION_SERVICE_TITLE} />
  )
}

export const IncorporationWizardLayout: React.FC = () => (
  <IncorporationProvider>
    <Outlet />
    <IncorporationDraftModal />
  </IncorporationProvider>
)

export default IncorporationWizardLayout
