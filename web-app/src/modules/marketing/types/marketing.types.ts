/** Icon keys the marketing content may reference (resolved by MarketingIcon) */
export type MarketingIconName =
  | 'shield'
  | 'zap'
  | 'headset'
  | 'user-plus'
  | 'upload'
  | 'file-check'
  | 'activity'
  | 'badge-check'
  | 'clock'
  | 'users'
  | 'map-pin'
  | 'star'
  | 'phone'
  | 'mail'
  | 'message'
  | 'lock'
  | 'trending-up'
  | 'award'
  | 'target'
  | 'eye'
  | 'handshake'

export interface MarketingNavLink {
  id: string
  label: string
  to: string
}

export interface MarketingCta {
  label: string
  to: string
}

export interface MarketingService {
  id: string
  title: string
  description: string
  /** Icon image from /public/assets */
  iconSrc: string
  highlights: string[]
}

export interface MarketingFeature {
  id: string
  title: string
  description: string
  icon: MarketingIconName
}

export interface MarketingStep extends MarketingFeature {
  step: number
}

export interface MarketingStat {
  id: string
  value: number
  suffix: string
  label: string
}

export interface MarketingTestimonial {
  id: string
  quote: string
  name: string
  role: string
  city: string
  rating: number
}

export interface MarketingFaq {
  id: string
  question: string
  answer: string
}

export interface MarketingTrustBadge {
  id: string
  label: string
  description: string
  imageSrc: string
}

export interface MarketingHero {
  eyebrow: string
  title: string
  highlight: string
  subtitle: string
  primaryCta: MarketingCta
  secondaryCta: MarketingCta
  imageSrc: string
  imageAlt: string
  points: string[]
}

export interface MarketingSectionCopy {
  eyebrow: string
  title: string
  subtitle: string
}

export interface MarketingFooterGroup {
  id: string
  title: string
  links: MarketingNavLink[]
}

export interface MarketingContactChannel {
  id: string
  label: string
  value: string
  href?: string
  icon: MarketingIconName
}

export type PricingBillingUnit = 'one-time' | 'per-return' | 'per-period' | 'quote'

export interface PricingPlan {
  id: string
  name: string
  description: string
  /** Professional fee in ₹ before GST; null for quote-based plans */
  amount: number | null
  unit: PricingBillingUnit
  features: string[]
  isPopular?: boolean
}

export interface PricingCategory {
  id: string
  label: string
  plans: PricingPlan[]
}

export interface PageMeta {
  title: string
  description: string
}

export interface ComplianceDeadlineRule {
  id: string
  title: string
  category: string
  /** Day of month the filing is due (clamped to the month's last day) */
  day: number
  /** Months (1–12) the rule applies to; omitted = every month */
  months?: number[]
}

export interface ComplianceDeadline {
  id: string
  title: string
  category: string
  dueDate: Date
}

export interface MarketingPersona {
  id: string
  label: string
  icon: MarketingIconName
  headline: string
  description: string
  serviceIds: string[]
  cta: MarketingCta
}

/** Contact / enquiry form */
export interface EnquiryFormData {
  fullName: string
  email: string
  mobile: string
  service: string
  message: string
}

export type EnquiryField = keyof EnquiryFormData
export type EnquiryErrors = Partial<Record<EnquiryField, string>>

export interface EnquiryResponse {
  reference: string
}
