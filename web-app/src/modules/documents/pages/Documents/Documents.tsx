import { useState, useRef } from 'react'
import { Badge, Card, EmptyState, Loader } from '@shared/components'
import { STATUS_LABELS, STATUS_TONES } from '@shared/constants'
import { formatDate } from '@shared/utils'
import { useAppStore } from '@store/index'
import { FileInput } from '@shared/upload'

import { useDocuments } from '../../hooks/useDocuments'
import type { DocumentsItem } from '../../types/documents.types'
import './Documents.css'

export const Documents = () => {
  const { data, isLoading, error } = useDocuments()
  const [customDocs, setCustomDocs] = useState<DocumentsItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pushToast = useAppStore((state) => state.pushToast)

  /** An allowed file (PDF, Excel, JPG or PNG up to 15 MB) */
  const handleFileUpload = (file: File) => {

    const newDoc: DocumentsItem = {
      id: `doc-${Date.now()}`,
      title: file.name,
      reference: `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setCustomDocs((prev) => [newDoc, ...prev])
    pushToast(`"${file.name}" uploaded successfully!`, 'success')
  }

  const allDocuments = [...customDocs, ...(data ?? [])]

  return (
    <div className="documents-page">
      <FileInput
        ref={fileInputRef}
        className="documents-file-input"
        onFileSelected={handleFileUpload}
        aria-hidden="true"
        tabIndex={-1}
      />

      <header className="documents-page__header">
        <div className="documents-page__header-text">
          <h1 className="documents-page__title">Documents Vault</h1>
          <p className="documents-page__subtitle">Upload once, reuse across every filing and application.</p>
        </div>
        <button
          type="button"
          className="documents-page__upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload document
        </button>
      </header>

      {isLoading && <Loader label="Loading Documents" />}
      {error && <EmptyState title="Could not load Documents" description={error} />}

      {!isLoading && !error && (
        <Card title="Stored documents" subtitle="Official identity, financial and statutory files linked to your TaxEdge account">
          {allDocuments.length === 0 ? (
            <EmptyState
              title="No Documents Stored"
              description="Upload identity, financial, or statutory files to store them securely in your vault."
            />
          ) : (
            <ul className="documents-page__list">
              {allDocuments.map((item) => (
                <li className="documents-page__row" key={item.id}>
                  <div>
                    <p className="documents-page__row-title">{item.title}</p>
                    <p className="documents-page__row-meta">
                      {item.reference} · {formatDate(item.updatedAt)}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONES[item.status]}>{STATUS_LABELS[item.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}

export default Documents
