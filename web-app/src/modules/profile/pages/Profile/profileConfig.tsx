import React from 'react'
import { routePaths } from '@core/config'

// Custom SVGs mapping to the screenshot design

const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
const IconCard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
const IconDoc = ({ color = '#6366f1' }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
const IconFolder = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
const IconBell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
const IconPalette = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.504 5.555-5.554C22 7.5 17.5 2 12 2z"></path></svg>
const IconLock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
const IconKeypad = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><path d="M8 9h.01"></path><path d="M12 9h.01"></path><path d="M16 9h.01"></path><path d="M8 13h.01"></path><path d="M12 13h.01"></path><path d="M16 13h.01"></path><path d="M12 17h.01"></path></svg>
const IconClock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
const IconShield = ({ color = '#f59e0b' }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
const IconChat = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
const IconStar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>

/** Sticky app header + section nav height, used to offset scroll-spy and jump-to-section. */
export const PROFILE_NAV_SCROLL_OFFSET = 136

export interface ProfileSectionData {
  title: string
  items: {
    id: string
    label: string
    to: string
    icon: React.ReactNode
    iconBg?: string
    iconBgClass: string
  }[]
}

export const profileSectionsConfig: ProfileSectionData[] = [
  {
    title: 'Account',
    items: [
      { id: 'personal', label: 'Personal Information', to: routePaths.profilePersonal, icon: <IconUser />, iconBgClass: 'profile-menu-item__icon-wrapper--purple' },
      { id: 'kyc', label: 'KYC Details', to: routePaths.profileKyc, icon: <IconCard />, iconBgClass: 'profile-menu-item__icon-wrapper--blue' },
      { id: 'gst', label: 'GST Details', to: routePaths.profile, icon: <IconDoc color="#6366f1" />, iconBgClass: 'profile-menu-item__icon-wrapper--indigo' },
      { id: 'itr', label: 'ITR History', to: routePaths.profile, icon: <IconDoc color="#f97316" />, iconBgClass: 'profile-menu-item__icon-wrapper--orange' },
      { id: 'loan', label: 'Loan History', to: routePaths.profile, icon: <IconBuilding />, iconBgClass: 'profile-menu-item__icon-wrapper--grey' },
    ]
  },
  {
    title: 'Services',
    items: [
      { id: 'apps', label: 'My Applications', to: routePaths.applications, icon: <IconFolder />, iconBgClass: 'profile-menu-item__icon-wrapper--amber' },
      { id: 'docs', label: 'My Documents', to: routePaths.documents, icon: <IconDoc color="#3b82f6" />, iconBgClass: 'profile-menu-item__icon-wrapper--blue' },
      { id: 'payments', label: 'Payments & Invoices', to: routePaths.payments, icon: <IconCard />, iconBgClass: 'profile-menu-item__icon-wrapper--teal' },
      { id: 'notifications', label: 'Notifications', to: routePaths.notifications, icon: <IconBell />, iconBgClass: 'profile-menu-item__icon-wrapper--orange' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: 'appearance', label: 'Appearance & Settings', to: routePaths.profile, icon: <IconPalette />, iconBgClass: 'profile-menu-item__icon-wrapper--orange' },
    ]
  },
  {
    title: 'Security',
    items: [
      { id: 'password', label: 'Change Password', to: routePaths.profile, icon: <IconLock />, iconBgClass: 'profile-menu-item__icon-wrapper--red' },
      { id: '2fa', label: 'Two-Factor Authentication', to: routePaths.profile, icon: <IconKeypad />, iconBgClass: 'profile-menu-item__icon-wrapper--purple' },
      { id: 'history', label: 'Login History', to: routePaths.profile, icon: <IconClock />, iconBgClass: 'profile-menu-item__icon-wrapper--grey' },
      { id: 'privacy', label: 'Privacy Settings', to: routePaths.profile, icon: <IconShield color="#f59e0b" />, iconBgClass: 'profile-menu-item__icon-wrapper--amber' },
    ]
  },
  {
    title: 'Support',
    items: [
      { id: 'support', label: 'Customer Support', to: routePaths.support, icon: <IconChat />, iconBgClass: 'profile-menu-item__icon-wrapper--blue' },
      { id: 'rate', label: 'Rate TaxEdge', to: routePaths.profile, icon: <IconStar />, iconBgClass: 'profile-menu-item__icon-wrapper--amber' },
      { id: 'terms', label: 'Terms & Conditions', to: routePaths.profile, icon: <IconDoc color="#64748b" />, iconBgClass: 'profile-menu-item__icon-wrapper--grey' },
      { id: 'policy', label: 'Privacy Policy', to: routePaths.profile, icon: <IconShield color="#14b8a6" />, iconBgClass: 'profile-menu-item__icon-wrapper--teal' },
    ]
  }
]
