import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CommonChatSupport } from '../../components'
import './CustomerSupport.css'

export const CustomerSupport = () => {
  const [searchParams] = useSearchParams()

  const appId = searchParams.get('appId') || undefined
  const executiveId = searchParams.get('executiveId') || undefined

  // Prevent double scrollbars by locking the body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="cs-mobile-view">
      <CommonChatSupport appId={appId} executiveId={executiveId} />
    </div>
  )
}

export default CustomerSupport
