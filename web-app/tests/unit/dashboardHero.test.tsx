// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { DashboardHero } from '../../src/modules/dashboard/components/DashboardHero/DashboardHero'

describe('DashboardHero Component & Replaced Hero Background Banner', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('verifies the newly attached 3D tax hero background image exists in public/images', () => {
    const publicImagePath = path.resolve(__dirname, '../../public/images/dashboard-tax-hero.png')
    const assetImagePath = path.resolve(__dirname, '../../public/assets/images/dashboard-tax-hero.png')

    expect(fs.existsSync(publicImagePath)).toBe(true)
    expect(fs.existsSync(assetImagePath)).toBe(true)

    const stats = fs.statSync(publicImagePath)
    expect(stats.size).toBeGreaterThan(100000)

    // Confirm it matches the newly supplied image (MD5 f8e1f1379a397cd123ec463504a194fb)
    const publicImageBuf = fs.readFileSync(publicImagePath)
    const publicImageHash = crypto.createHash('md5').update(publicImageBuf).digest('hex')
    expect(publicImageHash).toBe('f8e1f1379a397cd123ec463504a194fb')
  })

  it('verifies that the reference screenshot with baked-in text is NOT used as the production asset', () => {
    const publicImagePath = path.resolve(__dirname, '../../public/images/dashboard-tax-hero.png')
    const publicImageBuf = fs.readFileSync(publicImagePath)
    const publicImageHash = crypto.createHash('md5').update(publicImageBuf).digest('hex')

    // MD5 of the mockup screenshot with baked-in text (bea06cb4)
    const referenceScreenshotHash = '15d34a47a155ef7d9c1da7cc4274bf83'
    expect(publicImageHash).not.toBe(referenceScreenshotHash)
  })

  it('renders dynamic greeting based on user name without hardcoding Sagarika', () => {
    render(<DashboardHero userName="Vikram Malhotra" />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Vikram/i)
    expect(screen.queryByText(/Sagarika/i)).not.toBeInTheDocument()

    // Test with another user name
    cleanup()
    render(<DashboardHero userName="Priya Patel" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Priya/i)
  })

  it('adapts greeting dynamically based on time of day (morning, afternoon, evening)', () => {
    // 9 AM -> Good morning
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 28, 9, 0, 0))
    const { rerender } = render(<DashboardHero userName="Sagarika Jena" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Good morning, Sagarika/i)

    // 2 PM -> Good afternoon
    vi.setSystemTime(new Date(2026, 9, 28, 14, 0, 0))
    rerender(<DashboardHero userName="Sagarika Jena" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Good afternoon, Sagarika/i)

    // 8 PM -> Good evening
    vi.setSystemTime(new Date(2026, 9, 28, 20, 0, 0))
    rerender(<DashboardHero userName="Sagarika Jena" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Good evening, Sagarika/i)
  })

  it('renders subtitle question and left orange accent line', () => {
    const { container } = render(<DashboardHero userName="Sagarika Jena" />)

    expect(screen.getByText('What can we help you with today?')).toBeInTheDocument()
    const leftLine = container.querySelector('.dashboard-hero__welcome-line')
    expect(leftLine).toBeInTheDocument()
  })

  it('renders right-side slogan, compliance badge, and right orange accent line matching goal image', () => {
    const { container } = render(<DashboardHero userName="Sagarika Jena" />)

    // Check slogan renders with clean text
    const quote = container.querySelector('.dashboard-hero__quote-text')
    expect(quote).toBeInTheDocument()
    expect(quote?.textContent?.replace(/\s+/g, ' ')).toContain('Simplifying Taxes for a Brighter Tomorrow')

    // Check compliance badge
    expect(screen.getByText(/100% Compliant • Secure/i)).toBeInTheDocument()

    // Check right orange line
    const rightLine = container.querySelector('.dashboard-hero__quote-line')
    expect(rightLine).toBeInTheDocument()
  })

  it('confirms the new image is used as continuous background without duplicate img elements', () => {
    const { container } = render(<DashboardHero userName="Sagarika Jena" />)

    // Confirm no duplicate <img> element exists in the banner
    const duplicateImgs = container.querySelectorAll('img')
    expect(duplicateImgs).toHaveLength(0)

    // Confirm the banner container exists
    const heroSection = container.querySelector('.dashboard-hero')
    expect(heroSection).toBeInTheDocument()
  })

  it('verifies CSS applies /images/dashboard-tax-hero.png across the complete hero banner with cover sizing', () => {
    const cssPath = path.resolve(
      __dirname,
      '../../src/modules/dashboard/components/DashboardHero/DashboardHero.css'
    )
    const cssContent = fs.readFileSync(cssPath, 'utf8')

    expect(cssContent).toContain('/images/dashboard-tax-hero.png')
    expect(cssContent).toContain('background-size: cover')
    expect(cssContent).toContain('background-position: center')
    expect(cssContent).toContain('.dashboard-hero__welcome-line')
    expect(cssContent).toContain('.dashboard-hero__quote-line')
    expect(cssContent).toContain('@media (max-width: 768px)')
  })
})
