import { useEffect, useRef } from 'react'
import type { SupportAttachment, SupportConversation } from '../../types/customerSupport.types'
import { ChatMessageItem } from '../ChatMessageItem/ChatMessageItem'
import { ChatMessageInput } from '../ChatMessageInput/ChatMessageInput'
import { QuickPrompts } from '../QuickPrompts/QuickPrompts'
import './ChatWindow.css'

interface ChatWindowProps {
  conversation: SupportConversation | null
  isLoading?: boolean
  isSending?: boolean
  onSendMessage: (text: string, attachments?: SupportAttachment[]) => void
}

export const ChatWindow = ({
  conversation,
  isLoading = false,
  isSending = false,
  onSendMessage,
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  if (isLoading || !conversation) {
    return (
      <div className="cs-window cs-window--loading">
        <div className="cs-window__skeleton-header" />
        <div className="cs-window__skeleton-body" />
      </div>
    )
  }

  const { messages } = conversation

  return (
    <div className="cs-window">
      {/* Mobile-Style Header */}
      <header className="cs-window__mobile-header">
        <div className="cs-window__mobile-header-left">
          <div className="cs-window__header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
          </div>

          <div className="cs-window__header-text">
            <h2 className="cs-window__header-title">TaxEdge Support</h2>
            <p className="cs-window__header-subtitle">Online · replies in a few minutes</p>
          </div>
        </div>

        <div className="cs-window__mobile-header-right">
          <span className="cs-window__status-dot" role="img" aria-label="Online"></span>
        </div>
      </header>

      {/* Messages Thread */}
      <div className="cs-window__body">
        {/* Security Banner inside chat */}
        <div className="cs-window__security-banner">
          <svg viewBox="0 0 24 24" fill="currentColor" className="cs-window__security-icon" aria-hidden="true">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <span>This chat is encrypted and monitored for service quality.</span>
        </div>

        <div className="cs-window__messages-list">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Prompts Suggestions */}
      <QuickPrompts onSelectPrompt={(prompt) => onSendMessage(prompt)} />

      {/* Message Input Bar */}
      <footer className="cs-window__footer">
        <ChatMessageInput
          onSendMessage={onSendMessage}
          disabled={isSending}
          placeholder="Type your message..."
        />
      </footer>
    </div>
  )
}
