import { useEffect, useRef, type FC } from 'react'
import { AlertCircle } from 'lucide-react'
import './GSTStepErrorBanner.css'

export interface GSTStepErrorBannerProps {
  message: string | null
}

/** Red banner shown when "Continue" is pressed on a step that is not complete (same as the loans flows) */
export const GSTStepErrorBanner: FC<GSTStepErrorBannerProps> = ({ message }) => {
  const bannerRef = useRef<HTMLDivElement>(null)

  // Bring the message into view, since Continue sits at the bottom of a long step
  useEffect(() => {
    if (message) bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [message])

  if (!message) return null

  return (
    <div ref={bannerRef} className="gst-step-error-banner" role="alert">
      <AlertCircle className="gst-step-error-banner__icon" size={20} aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

export default GSTStepErrorBanner
