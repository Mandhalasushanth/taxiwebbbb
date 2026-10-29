import React from 'react'
import { Modal } from '@shared/components'
import type { ApplicationDocumentItem } from '../ApplicationTrackerView'

export interface DocumentPreviewModalProps {
  previewDoc: ApplicationDocumentItem | null
  onClose: () => void
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  previewDoc,
  onClose,
}) => {
  if (!previewDoc) return null

  return (
    <Modal
      isOpen={Boolean(previewDoc)}
      onClose={onClose}
      title={previewDoc.name}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fee2e2', color: '#ef4444', display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{previewDoc.name}</h4>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{previewDoc.meta} · Uploaded on {previewDoc.date}</span>
          </div>
          <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
            Verified ✓
          </span>
        </div>

        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafaf9', color: '#64748b', textAlign: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ color: '#94a3b8', marginBottom: '12px' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h5 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>Document Record Attached</h5>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', maxWidth: '360px' }}>
            This file was submitted securely during application filing and verified by the CA processing team.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 20px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Close Preview
          </button>
        </div>
      </div>
    </Modal>
  )
}
