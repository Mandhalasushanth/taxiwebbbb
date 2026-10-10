import { env, routePaths } from '@core/config'
import { AppError } from '@core/errors'
import { authStorage } from '@core/auth'
import { userStorage } from '@core/storage/userStorage'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@shared/types'

import { gstApi } from '@modules/gst/api/gstApi'
import type {
  GstAmendmentPayload,
  GstAmendmentRecord,
  GstApplication,
  GstCertificatePayload,
  GstCertificateRecord,
  GstListFilters,
  GstRegistrationPayload,
  GstReturn,
  GstReturnPayload,
} from '@modules/gst/types/gst.types'

/** Maps a display label like "Under Review" to a known status, defaulting to SUBMITTED */
const toApplicationStatus = (label: string): ApplicationStatus => {
  const key = label.toUpperCase().replace(/\s+/g, '_')
  return (APPLICATION_STATUSES as readonly string[]).includes(key) ? (key as ApplicationStatus) : 'SUBMITTED'
}

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const matchesFilters = (application: GstApplication, filters?: GstListFilters): boolean => {
  if (filters?.status && application.status !== filters.status) return false
  if (filters?.search) {
    const needle = filters.search.toLowerCase()
    return (
      application.legalName.toLowerCase().includes(needle) ||
      application.reference.toLowerCase().includes(needle) ||
      (application.gstin?.toLowerCase().includes(needle) ?? false)
    )
  }
  return true
}

export const gstService = {
  async listApplications(filters?: GstListFilters): Promise<GstApplication[]> {
    if (env.enableMocks) {
      await delay()
      const userApps = userStorage.getUserApplications().filter((a) => a.title.toLowerCase().includes('gst'))
      const userPan = authStorage.getUser()?.pan || ''
      const apps: GstApplication[] = userApps.map((a) => ({
        id: a.id,
        reference: a.code || a.id,
        legalName: a.meta.split('·')[0]?.trim() || 'GST Registration',
        businessType: 'proprietorship',
        state: a.meta.split('·')[1]?.trim() || 'India',
        pan: userPan,
        status: toApplicationStatus(a.statusLabel),
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      return apps.filter((application) => matchesFilters(application, filters))
    }
    const response = await gstApi.listApplications(filters)
    return response.data
  },

  async getApplication(id: string): Promise<GstApplication> {
    if (env.enableMocks) {
      await delay(200)
      const list = await this.listApplications()
      const found = list.find((application) => application.id === id || application.reference === id)
      if (!found) throw new AppError('That GST application no longer exists.', { kind: 'notFound' })
      return found
    }
    return gstApi.getApplication(id)
  },

  async register(payload: GstRegistrationPayload): Promise<GstApplication> {
    if (env.enableMocks) {
      await delay(500)
      const ref = `TE-GST-${Math.floor(Math.random() * 90000 + 10000)}`
      const id = `gst_${Date.now()}`
      const newApp: GstApplication = {
        id,
        reference: ref,
        legalName: payload.legalName,
        tradeName: payload.tradeName,
        businessType: payload.businessType,
        state: payload.state,
        pan: payload.pan,
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          { id: 't1', label: 'Application submitted', occurredAt: new Date().toISOString(), isComplete: true },
          { id: 't2', label: 'Documents verified', occurredAt: '', isComplete: false },
          { id: 't3', label: 'Officer review', occurredAt: '', isComplete: false },
          { id: 't4', label: 'GSTIN issued', occurredAt: '', isComplete: false },
        ],
      }
      userStorage.saveUserApplication({
        id,
        code: ref,
        title: 'GST Registration',
        meta: `${payload.legalName} · ${payload.state}`,
        statusLabel: 'Submitted',
        statusTone: 'info',
        progress: 25,
        icon: '📄',
        to: routePaths.applicationTrack(ref),
      })
      return newApp
    }
    return gstApi.register(payload)
  },

  async listReturns(): Promise<GstReturn[]> {
    if (env.enableMocks) {
      await delay()
      return []
    }
    const response = await gstApi.listReturns()
    return response.data
  },

  async fileReturn(payload: GstReturnPayload): Promise<GstReturn> {
    if (env.enableMocks) {
      await delay(600)
      return {
        id: `r_${Date.now()}`,
        gstin: payload.gstin,
        returnType: payload.returnType,
        period: payload.period,
        dueOn: new Date().toISOString(),
        taxPayable: payload.taxPayable,
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
    return gstApi.fileReturn(payload)
  },

  async submitAmendment(payload: GstAmendmentPayload): Promise<GstAmendmentRecord> {
    if (env.enableMocks) {
      await delay(600)
      return {
        id: `amend_${Date.now()}`,
        reference: `GST-AMD-${Math.floor(Math.random() * 90000 + 10000)}`,
        gstin: payload.gstin,
        fieldBeingChanged: payload.fieldBeingChanged,
        oldValue: payload.oldValue,
        newValue: payload.newValue,
        status: 'SUBMITTED',
        supportingDocument: payload.supportingDocumentName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
    return {
      id: `amend_${Date.now()}`,
      reference: `GST-AMD-${Math.floor(Math.random() * 90000 + 10000)}`,
      gstin: payload.gstin,
      fieldBeingChanged: payload.fieldBeingChanged,
      oldValue: payload.oldValue,
      newValue: payload.newValue,
      status: 'SUBMITTED',
      supportingDocument: payload.supportingDocumentName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  async submitCertificateRequest(payload: GstCertificatePayload): Promise<GstCertificateRecord> {
    if (env.enableMocks) {
      await delay(500)
      return {
        id: `cert_${Date.now()}`,
        reference: `GST-CRT-${Math.floor(Math.random() * 90000 + 10000)}`,
        gstin: payload.gstin,
        registeredContact: payload.registeredContact,
        requestType: payload.requestType,
        status: 'COMPLETED',
        downloadUrl: '/gst-certificate.pdf',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
    return {
      id: `cert_${Date.now()}`,
      reference: `GST-CRT-${Math.floor(Math.random() * 90000 + 10000)}`,
      gstin: payload.gstin,
      registeredContact: payload.registeredContact,
      requestType: payload.requestType,
      status: 'COMPLETED',
      downloadUrl: '/sample-gst-certificate.pdf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
}
