import { useState, useRef, type KeyboardEvent } from 'react'
import { FileInput, formatUploadSize } from '@shared/upload'
import type { SupportAttachment } from '../../types/customerSupport.types'
import './ChatMessageInput.css'

interface ChatMessageInputProps {
  onSendMessage: (text: string, attachments?: SupportAttachment[]) => void
  disabled?: boolean
  placeholder?: string
}

export const ChatMessageInput = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your query or document request here...',
}: ChatMessageInputProps) => {
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<SupportAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || disabled) return
    onSendMessage(
      text,
      attachments.length > 0 ? attachments : undefined
    )
    setText('')
    setAttachments([])
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /** One allowed file (PDF, Excel, JPG or PNG up to 10 MB) picked in the attachment dialog */
  const handleFileChange = (file: File) => {
    const attachment: SupportAttachment = {
      id: `att_${Date.now()}_${file.name}`,
      name: file.name,
      size: formatUploadSize(file.size),
      type: file.type,
    }
    setAttachments((prev) => [...prev, attachment])
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="cs-input-bar">
      {attachments.length > 0 && (
        <div className="cs-input-bar__tray">
          {attachments.map((att) => (
            <div key={att.id} className="cs-input-bar__chip">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cs-input-bar__chip-icon"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="cs-input-bar__chip-label">{att.name}</span>
              <button
                type="button"
                className="cs-input-bar__chip-remove"
                onClick={() => handleRemoveAttachment(att.id)}
                aria-label="Remove attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="cs-input-bar__controls">
        <FileInput
          ref={fileInputRef}
          className="cs-input-bar__file-input"
          onFileSelected={handleFileChange}
          multiple
          aria-label="Attach file"
        />

        <button
          type="button"
          className="cs-input-bar__btn-attach"
          onClick={() => fileInputRef.current?.click()}
          title="Upload Form 16, GST invoice, PAN or notice"
          aria-label="Attach file"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cs-input-bar__attach-icon"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <div className="cs-input-bar__field-wrapper">
          <input
            type="text"
            className="cs-input-bar__input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            aria-label="Write a message"
          />
        </div>

        <button
          type="button"
          className={`cs-input-bar__btn-send ${
            text.trim() || attachments.length > 0 ? 'cs-input-bar__btn-send--active' : ''
          }`}
          onClick={handleSend}
          disabled={disabled || (!text.trim() && attachments.length === 0)}
          aria-label="Send message"
          title="Send message"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cs-input-bar__send-icon"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
