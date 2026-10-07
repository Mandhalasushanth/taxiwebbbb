import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '@store/index'
import { FileInput } from '@shared/upload'
import type { PendingTask } from '../../types/dashboard.types'
import './PendingOnYou.css'

export interface PendingOnYouProps {
  tasks?: PendingTask[]
}

const ICONS: Record<string, React.ReactNode> = {
  danger: (
    <svg className="pending-card__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  success: (
    <svg className="pending-card__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  muted: (
    <svg className="pending-card__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
}

export const PendingOnYou = ({ tasks = [] }: PendingOnYouProps) => {
  const [uploadedOverrides, setUploadedOverrides] = useState<Record<string, Partial<PendingTask>>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeTaskIdRef = useRef<string | null>(null)
  const pushToast = useAppStore((state) => state.pushToast)

  if (!tasks.length) return null

  const taskList = tasks.map((t) => ({
    ...t,
    ...(uploadedOverrides[t.id] ?? {}),
  }))

  const handleUploadClick = (taskId: string) => {
    activeTaskIdRef.current = taskId
    fileInputRef.current?.click()
  }

  /** An allowed file (PDF, Excel, JPG or PNG up to 15 MB) for the task being completed */
  const handleFileChange = (file: File) => {
    if (!activeTaskIdRef.current) return

    const targetId = activeTaskIdRef.current
    setUploadedOverrides((prev) => ({
      ...prev,
      [targetId]: {
        statusLabel: 'Uploaded',
        statusTone: 'success',
        iconTone: 'success',
        meta: `Uploaded: ${file.name} · Under review`,
        actionLabel: 'View',
      },
    }))

    pushToast(`Document "${file.name}" uploaded successfully!`, 'success')
    activeTaskIdRef.current = null
  }

  return (
    <section className="pending-section" aria-labelledby="pending-heading">
      <FileInput
        ref={fileInputRef}
        className="pending-file-input"
        onFileSelected={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="pending-section__header">
        <h2 className="pending-section__title" id="pending-heading">Pending on you</h2>
        <p className="pending-section__subtitle">Clear these to keep your filings on schedule.</p>
      </div>

      <div className="pending-section__list">
        {taskList.map((t) => {
          const isUpload = t.actionLabel.toLowerCase() === 'upload'

          return (
            <div className="pending-card" key={t.id}>
              <div className="pending-card__left">
                <span className={`pending-card__icon pending-card__icon--${t.iconTone}`} aria-hidden="true">
                  {ICONS[t.iconTone] || ICONS.muted}
                </span>
                <div className="pending-card__info">
                  <h3 className="pending-card__title">{t.title}</h3>
                  <p className="pending-card__meta">{t.meta}</p>
                </div>
              </div>

              <div className="pending-card__right">
                <span className={`pending-card__badge pending-card__badge--${t.statusTone}`}>
                  <span className="pending-card__badge-dot" aria-hidden="true">●</span>
                  {t.statusLabel}
                </span>

                {isUpload ? (
                  <button
                    type="button"
                    className="pending-card__btn pending-card__btn--upload"
                    onClick={() => handleUploadClick(t.id)}
                    aria-label={`Upload document for ${t.title}`}
                  >
                    Upload
                  </button>
                ) : (
                  <Link
                    className={`pending-card__btn pending-card__btn--${t.actionLabel.toLowerCase()}`}
                    to={t.actionTo}
                  >
                    {t.actionLabel}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
