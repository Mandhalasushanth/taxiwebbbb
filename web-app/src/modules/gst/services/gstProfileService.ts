import { authStorage } from '@core/auth'
import { localStore } from '@core/storage/localStorage'
import type { GstBusinessFormData } from '@modules/gst/types/gstBusiness.types'

/** Business details known for the signed-in user, used to prefill and display GST screens */
export interface GstBusinessProfile {
  gstin: string
  legalName: string
  tradeName: string
  pan: string
  address: string
  city: string
  state: string
  pinCode: string
  bankName: string
  accountNumber: string
  ifscCode: string
  signatoryName: string
  signatoryDesignation: string
  mobile: string
  email: string
}

/** Shown wherever a profile value is not yet known */
export const GST_NOT_AVAILABLE = '—'

const EMPTY_PROFILE: GstBusinessProfile = {
  gstin: '',
  legalName: '',
  tradeName: '',
  pan: '',
  address: '',
  city: '',
  state: '',
  pinCode: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  signatoryName: '',
  signatoryDesignation: '',
  mobile: '',
  email: '',
}

const profileKey = (): string => `taxedge_gst_profile_${authStorage.getUser()?.id || 'guest'}`

const readStoredProfile = (): Partial<GstBusinessProfile> => {
  try {
    return localStore.get<Partial<GstBusinessProfile>>(profileKey()) || {}
  } catch {
    return {}
  }
}

const joinParts = (parts: (string | undefined)[], separator = ', '): string =>
  parts.map((p) => (p || '').trim()).filter(Boolean).join(separator)

export const gstProfileService = {
  /** Stored GST details merged with the signed-in user's account profile */
  get(): GstBusinessProfile {
    const user = authStorage.getUser()
    const stored = readStoredProfile()
    return {
      ...EMPTY_PROFILE,
      legalName: user?.businessName || '',
      tradeName: user?.businessName || '',
      pan: user?.pan || '',
      address: user?.address || joinParts([user?.addressLine1, user?.areaLocality]),
      city: user?.city || '',
      state: user?.state || '',
      pinCode: user?.pincode || '',
      signatoryName: user?.fullName || '',
      mobile: user?.mobile || '',
      email: user?.email || '',
      ...Object.fromEntries(Object.entries(stored).filter(([, v]) => Boolean(v))),
    }
  },

  /** Merges new details into the stored profile (empty values never overwrite existing ones) */
  update(patch: Partial<GstBusinessProfile>): void {
    const next = {
      ...readStoredProfile(),
      ...Object.fromEntries(Object.entries(patch).filter(([, v]) => Boolean(v))),
    }
    localStore.set(profileKey(), next)
  },

  /** Saves the business details submitted in a GST registration */
  saveFromRegistration(data: GstBusinessFormData): void {
    gstProfileService.update({
      legalName: data.legalName,
      tradeName: data.tradeName,
      // The GSTIN is issued against the business PAN; older drafts may only have the signatory PAN
      pan: data.businessPan || data.signatoryPan,
      address: data.businessAddress,
      city: data.city,
      state: data.state,
      pinCode: data.pinCode,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      signatoryName: data.signatoryName,
      signatoryDesignation: data.designation,
      mobile: data.signatoryMobile,
      email: data.signatoryEmail,
    })
  },
}

/* ---------- Display helpers ---------- */

export const orNotAvailable = (value?: string): string => (value && value.trim()) || GST_NOT_AVAILABLE

export const formatProfileAddress = (p: GstBusinessProfile): string =>
  orNotAvailable(joinParts([p.address, p.city, joinParts([p.state, p.pinCode], ' - ')]))

export const formatProfileBank = (p: GstBusinessProfile): string =>
  orNotAvailable(
    joinParts(
      [p.bankName, p.accountNumber ? `A/C **** ${p.accountNumber.slice(-4)}` : '', p.ifscCode],
      ' · '
    )
  )

export const formatProfileSignatory = (p: GstBusinessProfile): string =>
  orNotAvailable(p.signatoryDesignation ? `${p.signatoryName} (${p.signatoryDesignation})` : p.signatoryName)

export const formatProfileContact = (p: GstBusinessProfile): string =>
  orNotAvailable(joinParts([p.mobile ? `+91 ${p.mobile}` : '', p.email], ' · '))

export const formatProfileBusinessName = (p: GstBusinessProfile): string =>
  orNotAvailable(
    p.tradeName && p.tradeName !== p.legalName ? `${p.legalName} (Trade Name: ${p.tradeName})` : p.legalName || p.tradeName
  )
