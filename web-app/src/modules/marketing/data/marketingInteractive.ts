import { routePaths } from '@core/config'
import type {
  ComplianceDeadlineRule,
  MarketingIconName,
  MarketingPersona,
  MarketingSectionCopy,
} from '../types/marketing.types'

/** Words cycled by the hero typewriter after "Tax, GST & Business Compliance," */
export const HERO_ROTATING_WORDS = ['Simplified.', 'Automated.', 'Stress-free.', 'On Time.'] as const

/** Floating status cards layered over the hero illustration */
export const HERO_FLOATING_CARDS = [
  { id: 'float-refund', icon: 'badge-check', title: 'Refund credited', value: '₹12,450', position: 'top' },
  { id: 'float-gst', icon: 'file-check', title: 'GSTR-3B filed', value: 'On time', position: 'bottom' },
] as const satisfies ReadonlyArray<{
  id: string
  icon: MarketingIconName
  title: string
  value: string
  position: 'top' | 'bottom'
}>

export const DEADLINES_COPY = {
  eyebrow: 'Never miss a due date',
  title: 'Upcoming compliance deadlines',
  nextLabel: 'Next deadline in',
  ctaLabel: 'File before the deadline',
  ctaTo: routePaths.auth.register,
  /** How many upcoming deadlines are listed next to the countdown */
  listSize: 3,
} as const

/**
 * Recurring statutory due dates. Months are 1–12; a rule with `months` repeats in those
 * months only, otherwise it repeats every month. Dates are computed from today, never stored.
 */
export const COMPLIANCE_DEADLINE_RULES: ComplianceDeadlineRule[] = [
  { id: 'tds-deposit', title: 'TDS / TCS payment', category: 'TDS', day: 7 },
  { id: 'gstr-1', title: 'GSTR-1 filing (monthly)', category: 'GST', day: 11 },
  { id: 'gstr-3b', title: 'GSTR-3B filing & tax payment', category: 'GST', day: 20 },
  { id: 'advance-tax', title: 'Advance tax instalment', category: 'Income Tax', day: 15, months: [3, 6, 9, 12] },
  { id: 'itr-non-audit', title: 'ITR filing (non-audit cases)', category: 'Income Tax', day: 31, months: [7] },
  { id: 'itr-audit', title: 'ITR filing (audit cases)', category: 'Income Tax', day: 31, months: [10] },
]

export const PERSONA_SECTION: MarketingSectionCopy = {
  eyebrow: 'Find your fit',
  title: 'What describes you best?',
  subtitle: 'Pick your profile and we’ll show the services people like you use most.',
}

export const MARKETING_PERSONAS: MarketingPersona[] = [
  {
    id: 'salaried',
    label: 'Salaried',
    icon: 'users',
    headline: 'Maximise your refund, stress free',
    description: 'Import Form 16, claim every deduction and track your refund — filed by experts in a day.',
    serviceIds: ['itr', 'insurance', 'loans'],
    cta: { label: 'File my ITR', to: routePaths.auth.register },
  },
  {
    id: 'business',
    label: 'Business Owner',
    icon: 'trending-up',
    headline: 'Stay GST compliant every month',
    description: 'Registration, monthly returns, reconciliations and working capital — handled in one place.',
    serviceIds: ['gst', 'loans', 'business'],
    cta: { label: 'Start with GST', to: routePaths.auth.register },
  },
  {
    id: 'startup',
    label: 'Startup Founder',
    icon: 'zap',
    headline: 'Launch your company the right way',
    description: 'Incorporate a Pvt Ltd or LLP, get GST and stay on top of compliance from day one.',
    serviceIds: ['incorporation', 'gst', 'projects'],
    cta: { label: 'Incorporate now', to: routePaths.auth.register },
  },
  {
    id: 'freelancer',
    label: 'Freelancer',
    icon: 'badge-check',
    headline: 'Professional income, simplified',
    description: 'Presumptive taxation, advance tax reminders and GST when you cross the threshold.',
    serviceIds: ['itr', 'gst', 'insurance'],
    cta: { label: 'Get started', to: routePaths.auth.register },
  },
]
