import React from 'react'
import { FileText, Info } from 'lucide-react'

/**
 * Header banner for Step 4 Document Verification
 * Strictly loop-free and uses external CSS only
 */
export const DocumentVerificationHeader: React.FC = () => {
  return (
    <div className="doc-verification-header">
      <div className="doc-verification-header__left">
        <div className="doc-verification-icon-tile" aria-hidden="true">
          <FileText size={22} />
        </div>
        <div className="doc-verification-header__text">
          <h2 className="doc-verification-title">Document Verification</h2>
          <p className="doc-verification-subtitle">
            Upload the required documents based on your business profile and loan purpose.
          </p>
        </div>
      </div>

      <div className="doc-verification-info-badge">
        <Info
          size={18}
          className="doc-verification-info-icon"
          aria-hidden="true"
        />
        <div className="doc-verification-info-text">
          <span className="doc-verification-info-line1">Accepted formats: PDF, JPG, PNG</span>
          <span className="doc-verification-info-line2">Max file size: 5 MB per file</span>
        </div>
      </div>
    </div>
  )
}

export default DocumentVerificationHeader
