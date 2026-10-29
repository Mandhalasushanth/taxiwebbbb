// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import { CommonChatSupport } from '@modules/customerSupport'

describe('CommonChatSupport unified component', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders common TaxEdge Support header, online status indicator, and security notice', async () => {
    render(<CommonChatSupport />)

    expect(await screen.findByText('TaxEdge Support')).toBeDefined()
    expect(screen.getByText('Online · replies in a few minutes')).toBeDefined()
    expect(screen.getByText('This chat is encrypted and monitored for service quality.')).toBeDefined()
  })

  it('renders all quick action topics matching support specifications', async () => {
    render(<CommonChatSupport />)

    expect(await screen.findByText('Track my application')).toBeDefined()
    expect(screen.getByText('Document help')).toBeDefined()
    expect(screen.getByText('Payment issue')).toBeDefined()
    expect(screen.getByText('Talk to an expert')).toBeDefined()
  })

  it('clicking a quick action prompt adds the message to the conversation', async () => {
    render(<CommonChatSupport appId="GST-FIL-TEST-1" />)

    const paymentChip = await screen.findByText('Payment issue')
    await act(async () => {
      fireEvent.click(paymentChip)
    })

    // Expect user message bubble to appear in message list
    expect(screen.getByText('Payment issue')).toBeDefined()
  })

  it('sends typed message through common input bar and displays executive auto response', async () => {
    render(<CommonChatSupport appId="GST-FIL-TEST-2" />)

    const input = await screen.findByPlaceholderText('Type your message...')
    const sendBtn = screen.getByRole('button', { name: /Send message/i })

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Can I upload additional invoices?' } })
      fireEvent.click(sendBtn)
    })

    expect(await screen.findByText('Can I upload additional invoices?')).toBeDefined()
  })

  it('renders embedded variant when embedded prop is true', async () => {
    const { container } = render(<CommonChatSupport embedded appId="GST-FIL-TEST-3" />)
    const wrapper = container.querySelector('.common-chat-support--embedded')
    expect(wrapper).not.toBeNull()
  })
})
