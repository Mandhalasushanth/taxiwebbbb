import React from 'react'
import { ChatWindow } from '../ChatWindow/ChatWindow'
import { useCustomerSupportChat } from '../../hooks/useCustomerSupportChat'
import './CommonChatSupport.css'

export interface CommonChatSupportProps {
  appId?: string
  executiveId?: string
  title?: string
  subtitle?: string
  placeholder?: string
  embedded?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * CommonChatSupport - Universal shared chat support component for TaxEdge.
 * Used identically across Support Chat (/support), Application Tracker tabs,
 * and anywhere customer support / CA advisory is needed.
 */
export const CommonChatSupport: React.FC<CommonChatSupportProps> = ({
  appId,
  executiveId,
  title = 'TaxEdge Support',
  subtitle = 'Online · replies in a few minutes',
  placeholder = 'Type your message...',
  embedded = false,
  className = '',
  style,
}) => {
  const {
    conversation,
    isLoading,
    isSending,
    sendMessage,
  } = useCustomerSupportChat(appId, executiveId)

  return (
    <div
      className={`common-chat-support ${embedded ? 'common-chat-support--embedded' : ''} ${className}`}
      style={style}
      data-testid="common-chat-support"
    >
      <ChatWindow
        conversation={conversation}
        isLoading={isLoading}
        isSending={isSending}
        onSendMessage={sendMessage}
        title={title}
        subtitle={subtitle}
        placeholder={placeholder}
      />
    </div>
  )
}

