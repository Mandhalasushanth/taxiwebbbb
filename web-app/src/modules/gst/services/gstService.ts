import { env, routePaths } from '@core/config'
import { AppError } from '@core/errors'
import { authStorage } from '@core/auth'
import { localStore } from '@core/storage/localStorage'
import { userStorage } from '@core/storage/userStorage'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@shared/types'

import { gstApi } from '@modules/gst/api/gstApi'
import type {
  GstAmendmentPayload,
  GstAmendmentRecord,
  GstApplication,
  GstCancellationPayload,
  GstCancellationRecord,
  GstCertificatePayload,
  GstCertificateRecord,
  GstListFilters,
  GstRegistrationPayload,
  GstReturn,
  GstReturnPayload,
} from '@modules/gst/types/gst.types'

const APPS_KEY = 'taxedge_gst_applications'
const RETURNS_KEY = 'taxedge_gst_returns'
const AMENDMENTS_KEY = 'taxedge_gst_amendments'
const CERTIFICATES_KEY = 'taxedge_gst_certificates'
const CANCELLATIONS_KEY = 'taxedge_gst_cancellations'

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
      await delay(200)
      const stored = localStore.get<GstApplication[]>(APPS_KEY) || []
      const userApps = userStorage.getUserApplications().filter((a) => a.title.toLowerCase().includes('gst'))
      const userPan = authStorage.getUser()?.pan || ''
      const mappedApps: GstApplication[] = userApps.map((a) => ({
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
      const unmerged = mappedApps.filter((m) => !stored.some((x) => x.id === m.id || x.reference === m.reference))
      const all = [...stored, ...unmerged]
      return all.filter((application) => matchesFilters(application, filters))
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
      await delay(400)
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
      const existing = localStore.get<GstApplication[]>(APPS_KEY) || []
      localStore.set(APPS_KEY, [newApp, ...existing])

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
      await delay(200)
      return localStore.get<GstReturn[]>(RETURNS_KEY) || []
    }
    const response = await gstApi.listReturns()
    return response.data
  },

  async fileReturn(payload: GstReturnPayload): Promise<GstReturn> {
    if (env.enableMocks) {
      await delay(500)
      const newReturn: GstReturn = {
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
      const existing = localStore.get<GstReturn[]>(RETURNS_KEY) || []
      localStore.set(RETURNS_KEY, [newReturn, ...existing])

      const ref = `GST-RET-${newReturn.id.slice(-6)}`
      userStorage.saveUserApplication({
        id: `app-gst-filing-${Date.now()}`,
        code: ref,
        title: `GST Return Filing (${payload.returnType})`,
        meta: `${payload.gstin} · Period: ${payload.period}`,
        statusLabel: 'Submitted',
        statusTone: 'info',
        progress: 25,
        icon: '📄',
        to: routePaths.gst.detail(ref),
      })
      return newReturn
    }
    return gstApi.fileReturn(payload)
  },

  async submitAmendment(payload: GstAmendmentPayload): Promise<GstAmendmentRecord> {
    const ref = `GST-AMD-${Math.floor(Math.random() * 90000 + 10000)}`
    const record: GstAmendmentRecord = {
      id: `amend_${Date.now()}`,
      reference: ref,
      gstin: payload.gstin,
      fieldBeingChanged: payload.fieldBeingChanged,
      oldValue: payload.oldValue,
      newValue: payload.newValue,
      status: 'SUBMITTED',
      supportingDocument: payload.supportingDocumentName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const existing = localStore.get<GstAmendmentRecord[]>(AMENDMENTS_KEY) || []
    localStore.set(AMENDMENTS_KEY, [record, ...existing])

    userStorage.saveUserApplication({
      id: `app-${record.id}`,
      code: ref,
      title: `GST Amendment — ${payload.fieldBeingChanged}`,
      meta: `${payload.gstin} · ${payload.newValue.slice(0, 30)}`,
      statusLabel: 'Submitted',
      statusTone: 'info',
      progress: 25,
      icon: '📄',
      to: routePaths.applicationTrack(ref),
    })

    if (env.enableMocks) {
      await delay(500)
    }
    return record
  },

  async submitCertificateRequest(payload: GstCertificatePayload): Promise<GstCertificateRecord> {
    const ref = `GST-CRT-${Math.floor(Math.random() * 90000 + 10000)}`
    const record: GstCertificateRecord = {
      id: `cert_${Date.now()}`,
      reference: ref,
      gstin: payload.gstin,
      registeredContact: payload.registeredContact,
      requestType: payload.requestType,
      status: 'COMPLETED',
      downloadUrl: '/gst-certificate.pdf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const existing = localStore.get<GstCertificateRecord[]>(CERTIFICATES_KEY) || []
    localStore.set(CERTIFICATES_KEY, [record, ...existing])

    userStorage.saveUserApplication({
      id: `app-${record.id}`,
      code: ref,
      title: 'GST Certificate (REG-06)',
      meta: `${payload.gstin} · Download Certificate`,
      statusLabel: 'Completed',
      statusTone: 'success',
      progress: 100,
      icon: '📜',
      to: routePaths.applicationTrack(ref),
    })

    if (env.enableMocks) {
      await delay(400)
    }
    return record
  },

  async submitCancellation(payload: GstCancellationPayload): Promise<GstCancellationRecord> {
    const ref = `GST-CAN-${Math.floor(Math.random() * 90000 + 10000)}`
    const record: GstCancellationRecord = {
      id: `canc_${Date.now()}`,
      reference: ref,
      gstin: payload.gstin,
      reason: payload.reason,
      cancellationDate: payload.cancellationDate,
      closingStockDetails: payload.closingStockDetails,
      pendingLiabilities: payload.pendingLiabilities,
      lastGstr3bFiled: payload.lastGstr3bFiled,
      status: 'SUBMITTED',
      supportingDocument: payload.supportingDocumentName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const existing = localStore.get<GstCancellationRecord[]>(CANCELLATIONS_KEY) || []
    localStore.set(CANCELLATIONS_KEY, [record, ...existing])

    userStorage.saveUserApplication({
      id: `app-${record.id}`,
      code: ref,
      title: 'GST Cancellation (REG-16)',
      meta: `${payload.gstin} · ${payload.reason}`,
      statusLabel: 'Submitted',
      statusTone: 'info',
      progress: 25,
      icon: '📄',
      to: routePaths.applicationTrack(ref),
    })

    if (env.enableMocks) {
      await delay(400)
    }
    return record
  },
}
