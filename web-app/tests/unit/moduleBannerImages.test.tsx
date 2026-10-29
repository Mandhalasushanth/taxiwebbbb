// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import fs from 'fs'
import path from 'path'
import { GSTHeroBanner } from '../../src/modules/gst/components/GSTDashboard/GSTHeroBanner/GSTHeroBanner'
import { renderHeroBanner } from '../../src/modules/itr/components/Itr/Itr'
import { LoanMarketplaceHeader } from '../../src/modules/loans/components/LoanMarketplace/LoanMarketplaceHeader'

describe('Module Banner Images & Layout Consistency', () => {
  afterEach(() => {
    cleanup()
  })

  it('confirms all three approved banner image files exist in the public/images folder', () => {
    const publicImagesDir = path.resolve(__dirname, '../../public/images')
    const gstImagePath = path.join(publicImagesDir, 'gst-banner.png')
    const itrImagePath = path.join(publicImagesDir, 'itr-banner.png')
    const loanImagePath = path.join(publicImagesDir, 'loan-banner.png')

    expect(fs.existsSync(gstImagePath)).toBe(true)
    expect(fs.existsSync(itrImagePath)).toBe(true)
    expect(fs.existsSync(loanImagePath)).toBe(true)

    // Verify non-empty files
    expect(fs.statSync(gstImagePath).size).toBeGreaterThan(10000)
    expect(fs.statSync(itrImagePath).size).toBeGreaterThan(10000)
    expect(fs.statSync(loanImagePath).size).toBeGreaterThan(10000)
  })

  it('verifies GST Hero Banner renders heading and description matching specification', () => {
    const { container } = render(<GSTHeroBanner />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Goods & Services Tax')
    expect(
      screen.getByText(/Registration through to annual compliance, handled by your dedicated GST executive/i)
    ).toBeInTheDocument()

    const bannerSection = container.querySelector('.gst-hero-banner')
    expect(bannerSection).toBeInTheDocument()

    // Verify CSS file references /images/gst-banner.png
    const cssPath = path.resolve(
      __dirname,
      '../../src/modules/gst/components/GSTDashboard/GSTHeroBanner/GSTHeroBanner.css'
    )
    const cssContent = fs.readFileSync(cssPath, 'utf8')
    expect(cssContent).toContain('/images/gst-banner.png')
    expect(cssContent).toContain('#01244d')
    expect(cssContent).toContain('min-height: 175px')
  })

  it('verifies ITR Hero Banner renders heading and description matching specification', () => {
    const { container } = render(renderHeroBanner())

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Returns, refunds and notices')
    expect(
      screen.getByText(/Filed by a CA, not a form wizard/i)
    ).toBeInTheDocument()

    const bannerSection = container.querySelector('.itr-hero-banner')
    expect(bannerSection).toBeInTheDocument()

    // Verify CSS file references /images/itr-banner.png
    const cssPath = path.resolve(__dirname, '../../src/modules/itr/components/Itr/Itr.css')
    const cssContent = fs.readFileSync(cssPath, 'utf8')
    expect(cssContent).toContain('/images/itr-banner.png')
    expect(cssContent).toContain('#01244d')
    expect(cssContent).toContain('min-height: 175px')
  })

  it('verifies Loan Marketplace Banner renders eyebrow and heading matching specification', () => {
    const { container } = render(<LoanMarketplaceHeader />)

    expect(screen.getByText('Capital & Financing')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Loan Marketplace & Assistance')

    const bannerSection = container.querySelector('.loan-marketplace__header-banner')
    expect(bannerSection).toBeInTheDocument()

    // Verify CSS file references /images/loan-banner.png
    const cssPath = path.resolve(
      __dirname,
      '../../src/modules/loans/components/LoanMarketplace/LoanMarketplace.css'
    )
    const cssContent = fs.readFileSync(cssPath, 'utf8')
    expect(cssContent).toContain('/images/loan-banner.png')
    expect(cssContent).toContain('#01244d')
    expect(cssContent).toContain('min-height: 175px')
  })
})
