import React from 'react'
import { routePaths } from '@core/config'

// Custom SVGs mapping to the mobile design

const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconCard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
)

const IconHeadphones = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
)

const IconDoc = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const IconShieldCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const IconRefund = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
)

const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const IconTrash = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

/** Sticky app header + section nav height, used to offset scroll-spy and jump-to-section. */
export const PROFILE_NAV_SCROLL_OFFSET = 136

export interface ProfileSectionData {
  title: string
  items: {
    id: string
    label: string
    to?: string
    target?: string
    rel?: string
    icon: React.ReactNode
    iconBg?: string
    iconBgClass: string
  }[]
}

export const profileSectionsConfig: ProfileSectionData[] = [
  {
    title: 'Account',
    items: [
      {
        id: 'personal',
        label: 'Personal Information',
        to: routePaths.profilePersonal,
        icon: <IconUser />,
        iconBgClass: 'profile-menu-item__icon-wrapper--purple',
      },
      {
        id: 'kyc',
        label: 'KYC Details',
        to: routePaths.profileKyc,
        icon: <IconCard />,
        iconBgClass: 'profile-menu-item__icon-wrapper--blue',
      },
    ],
  },
  {
    title: 'Customer Support',
    items: [
      {
        id: 'support',
        label: 'Customer Support',
        to: routePaths.support,
        icon: <IconHeadphones />,
        iconBgClass: 'profile-menu-item__icon-wrapper--cyan',
      },
      {
        id: 'terms',
        label: 'Terms & Conditions',
        to: routePaths.legal.terms,
        icon: <IconDoc />,
        iconBgClass: 'profile-menu-item__icon-wrapper--slate',
      },
      {
        id: 'policy',
        label: 'Privacy Policy',
        to: routePaths.legal.privacy,
        icon: <IconShieldCheck />,
        iconBgClass: 'profile-menu-item__icon-wrapper--green',
      },
      {
        id: 'refund-policy',
        label: 'Refund & Cancellation Policy',
        to: routePaths.legal.refund,
        icon: <IconRefund />,
        iconBgClass: 'profile-menu-item__icon-wrapper--orange',
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        id: 'passcode',
        label: 'Change Passcode',
        icon: <IconLock />,
        iconBgClass: 'profile-menu-item__icon-wrapper--blue',
      },
      {
        id: 'delete-account',
        label: 'Delete Account',
        icon: <IconTrash />,
        iconBgClass: 'profile-menu-item__icon-wrapper--red',
      },
    ],
  },
]

export default profileSectionsConfig
