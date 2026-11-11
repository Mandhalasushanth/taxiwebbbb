import './SecurityNotice.css'

interface SecurityNoticeProps {
  title?: string
  body?: string
}

export const SecurityNotice = ({
  title = 'We will never ask for an OTP',
  body = 'No one from Finsolz will ask for your OTP, password or card PIN — on chat, on a call or on WhatsApp.',
}: SecurityNoticeProps) => {
  return (
    <div className="security-notice-card">
      <div className="security-notice-card__header">
        <div className="security-notice-card__icon-wrapper">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="security-notice-card__shield-icon"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <h4 className="security-notice-card__title">{title}</h4>
      </div>
      <p className="security-notice-card__body">{body}</p>
    </div>
  )
}
