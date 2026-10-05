// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { useNotificationStore } from '@store/notifications/notificationStore'
import NotificationsPage from '@modules/notifications/pages/NotificationsPage'
import { DashboardLayout } from '@app/layouts/DashboardLayout'

// Mock react-router-dom hooks if needed or use MemoryRouter
describe('Notifications and Notification Count', () => {
  beforeEach(() => {
    localStorage.clear()
    useNotificationStore.getState().clearAll()
  })

  afterEach(() => {
    cleanup()
  })

  it('initializes with 0 notifications and empty state', () => {
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Notifications')).toBeDefined()
    expect(screen.getByText('No notifications yet.')).toBeDefined()
    expect(screen.getByText(/When you submit an application, document, or payment/i)).toBeDefined()

    const clearBtn = screen.getByRole('button', { name: /clear all/i })
    expect(clearBtn).toBeDefined()
    expect((clearBtn as HTMLButtonElement).disabled).toBe(true)
  })

  it('adds notifications and displays them in the list and enables clear all button', () => {
    useNotificationStore.getState().addNotification({
      id: 'notif-1',
      title: 'GST Registration Submitted',
      message: 'Your request for GST Registration has been submitted successfully.',
      timestamp: 'Just now',
      type: 'application',
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('GST Registration Submitted')).toBeDefined()
    expect(screen.getByText('Your request for GST Registration has been submitted successfully.')).toBeDefined()

    const clearBtn = screen.getByRole('button', { name: /clear all/i })
    expect(clearBtn).toBeDefined()
    expect((clearBtn as HTMLButtonElement).disabled).toBe(false)
  })

  it('clears all notifications when Clear All button is clicked', () => {
    useNotificationStore.getState().addNotification({
      id: 'notif-1',
      title: 'ITR Filing Submitted',
      message: 'Your ITR has been filed.',
      timestamp: 'Just now',
    })
    useNotificationStore.getState().addNotification({
      id: 'notif-2',
      title: 'Business Loan Approved',
      message: 'Your loan application is approved.',
      timestamp: '1 hour ago',
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('ITR Filing Submitted')).toBeDefined()
    expect(screen.getByText('Business Loan Approved')).toBeDefined()

    const clearBtn = screen.getByRole('button', { name: /clear all/i })
    fireEvent.click(clearBtn)

    expect(screen.queryByText('ITR Filing Submitted')).toBeNull()
    expect(screen.queryByText('Business Loan Approved')).toBeNull()
    expect(screen.getByText('No notifications yet.')).toBeDefined()
    expect(useNotificationStore.getState().notifications.length).toBe(0)
  })

  it('allows dismissing individual notifications', () => {
    useNotificationStore.getState().addNotification({
      id: 'notif-1',
      title: 'Notification One',
      message: 'Message One',
      timestamp: 'Just now',
    })
    useNotificationStore.getState().addNotification({
      id: 'notif-2',
      title: 'Notification Two',
      message: 'Message Two',
      timestamp: 'Just now',
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    const dismissBtn = screen.getByRole('button', { name: /dismiss Notification One/i })
    fireEvent.click(dismissBtn)

    expect(screen.queryByText('Notification One')).toBeNull()
    expect(screen.getByText('Notification Two')).toBeDefined()
    expect(useNotificationStore.getState().notifications.length).toBe(1)
  })

  it('does not render any badge initially when count is 0 in DashboardLayout', () => {
    render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    )

    const bellLink = screen.getByTitle('Notifications')
    expect(bellLink).toBeDefined()
    const badge = bellLink.querySelector('.shell__badge-pill')
    expect(badge).toBeNull()

    // Sidebar Applications and Notifications should also not show 0
    expect(screen.queryByText('0')).toBeNull()
  })

  it('updates the bell icon badge when notifications are added and hides badge when cleared', () => {
    const { rerender } = render(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    )

    const bellLink = screen.getByTitle('Notifications')
    expect(bellLink.querySelector('.shell__badge-pill')).toBeNull()

    useNotificationStore.getState().addNotification({
      id: 'notif-100',
      title: 'Update Available',
      message: 'New features added.',
      timestamp: 'Today',
    })

    rerender(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    )

    expect(bellLink.querySelector('.shell__badge-pill')?.textContent).toBe('1')

    useNotificationStore.getState().clearAll()

    rerender(
      <MemoryRouter>
        <DashboardLayout />
      </MemoryRouter>
    )

    expect(bellLink.querySelector('.shell__badge-pill')).toBeNull()
    expect(screen.queryByText('0')).toBeNull()
  })
})
