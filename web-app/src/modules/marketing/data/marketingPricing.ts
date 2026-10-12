import { routePaths } from '@core/config'
import { GST_FEES, PLATFORM_GST_RATE } from '@modules/gst/constants/gstBusiness.constants'
import type { MarketingSectionCopy, PricingBillingUnit, PricingCategory } from '../types/marketing.types'

/** GST fees come from the GST module so the site and the app always quote the same price. */

export const PRICING_SECTION: MarketingSectionCopy = {
  eyebrow: 'Pricing',
  title: 'Simple, transparent pricing',
  subtitle: 'Professional fees shown upfront. No hidden charges — pay only for what you need.',
}

export const PRICING_GST_NOTE = `All prices are professional fees in ₹ and exclude ${Math.round(
  PLATFORM_GST_RATE * 100,
)}% GST. Government fees, if any, are charged at actuals.`

export const PRICING_UNIT_LABELS: Record<PricingBillingUnit, string> = {
  'one-time': 'one-time',
  'per-return': 'per return',
  'per-period': 'per period',
  quote: 'custom quote',
}

export const PRICING_PLAN_CTA = { label: 'Get Started', to: routePaths.auth.register } as const
export const PRICING_QUOTE_CTA = { label: 'Request a Quote', to: routePaths.marketing.contact } as const

export const PRICING_CATEGORIES: PricingCategory[] = [
  {
    id: 'gst',
    label: 'GST',
    plans: [
      {
        id: 'gst-registration',
        name: 'GST Registration',
        description: 'New GSTIN for your business, filed by experts.',
        amount: GST_FEES.registration,
        unit: 'one-time',
        features: ['Document verification', 'Application filing', 'ARN tracking', 'GST certificate'],
      },
      {
        id: 'gst-filing',
        name: 'GST Return Filing',
        description: 'GSTR-1 and GSTR-3B prepared and filed on time.',
        amount: GST_FEES.filingCombo,
        unit: 'per-period',
        features: ['GSTR-1 & GSTR-3B', 'Input tax credit check', 'Deadline reminders', 'Filing receipt'],
        isPopular: true,
      },
      {
        id: 'gst-compliance',
        name: 'GST Compliance',
        description: 'Notice replies, amendments and ongoing compliance.',
        amount: GST_FEES.compliance,
        unit: 'one-time',
        features: ['Notice assessment', 'Expert drafting', 'Amendments support', 'Dedicated expert'],
      },
    ],
  },
  {
    id: 'itr',
    label: 'Income Tax',
    plans: [
      {
        id: 'itr-salaried',
        name: 'Salaried ITR',
        description: 'For salary, interest and one house property.',
        amount: 999,
        unit: 'per-return',
        features: ['Form 16 import', 'All deductions claimed', 'Refund tracking', 'e-Verification help'],
      },
      {
        id: 'itr-business',
        name: 'Business & Capital Gains',
        description: 'For business income, capital gains and multiple sources.',
        amount: 3000,
        unit: 'per-return',
        features: ['Profit & loss review', 'Capital gains computation', 'Expert review', 'Priority support'],
        isPopular: true,
      },
      {
        id: 'itr-notice',
        name: 'Tax Notice Assistance',
        description: 'Expert reply to income tax notices.',
        amount: 2499,
        unit: 'one-time',
        features: ['Notice analysis', 'Response drafting', 'Submission support', 'Follow-up tracking'],
      },
    ],
  },
  {
    id: 'company',
    label: 'Company',
    plans: [
      {
        id: 'company-pvt',
        name: 'Private Limited',
        description: 'Incorporate a Pvt Ltd company end to end.',
        amount: 4999,
        unit: 'one-time',
        features: ['Name approval', 'DSC & DIN', 'MoA & AoA drafting', 'PAN & TAN'],
        isPopular: true,
      },
      {
        id: 'company-llp',
        name: 'LLP Registration',
        description: 'Limited Liability Partnership with agreement drafting.',
        amount: 4999,
        unit: 'one-time',
        features: ['Name reservation', 'DSC & DPIN', 'LLP agreement', 'PAN & TAN'],
      },
      {
        id: 'company-custom',
        name: 'Loans & Insurance',
        description: 'Personalised finance and cover for your needs.',
        amount: null,
        unit: 'quote',
        features: ['Compare lenders & insurers', 'Eligibility check', 'Paperwork support', 'Dedicated advisor'],
      },
    ],
  },
]
