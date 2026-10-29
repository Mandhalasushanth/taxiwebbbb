// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'
import { ScrollToTop, resetScrollToTop } from '@shared/components'

describe('ScrollToTop component & resetScrollToTop utility', () => {
  beforeEach(() => {
    // Provide safe mocks for jsdom
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('resets window, documentElement, body, and container scroll tops', () => {
    document.documentElement.scrollTop = 500
    document.body.scrollTop = 400

    const container = document.createElement('div')
    container.className = 'shell__content'
    container.scrollTop = 300
    document.body.appendChild(container)

    resetScrollToTop(false)

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
    expect(document.documentElement.scrollTop).toBe(0)
    expect(document.body.scrollTop).toBe(0)
    expect(container.scrollTop).toBe(0)

    document.body.removeChild(container)
  })

  it('scrolls into view when hash element exists and allowHashScroll is true', () => {
    const el = document.createElement('div')
    el.id = 'faq'
    el.scrollIntoView = vi.fn()
    document.body.appendChild(el)

    window.location.hash = '#faq'
    resetScrollToTop(true)

    expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })

    window.location.hash = ''
    document.body.removeChild(el)
  })

  it('renders children when wrapped around content', () => {
    render(
      <MemoryRouter>
        <ScrollToTop>
          <div data-testid="child-element">Child Content</div>
        </ScrollToTop>
      </MemoryRouter>
    )

    expect(screen.getByTestId('child-element')).toBeDefined()
    expect(screen.getByText('Child Content')).toBeDefined()
  })

  it('automatically resets scroll to top when route changes', async () => {
    render(
      <MemoryRouter initialEntries={['/applications']}>
        <ScrollToTop />
        <nav>
          <Link to="/applications/track/GST-FIL-2026-31583" data-testid="track-link">
            Track GST
          </Link>
        </nav>
        <Routes>
          <Route path="/applications" element={<div>Applications List</div>} />
          <Route path="/applications/track/:id" element={<div>Track Application View</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Applications List')).toBeDefined()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })

    // Simulate clicking link to navigate to track page
    const link = screen.getByTestId('track-link')
    await act(async () => {
      link.click()
    })

    expect(screen.getByText('Track Application View')).toBeDefined()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })
})

