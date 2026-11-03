import React, { useEffect, useRef, useState } from "react";
import {
  DOCUMENT_UPLOAD_RULE,
  FileInput,
  uploadedFileStore,
  viewUploadedDocument,
  type UploadRule,
} from "@shared/upload";
import { assertGstUploadCriteria, GstUploadException } from "@modules/gst/utils/gstUploadValidator";
import "./uploadDocument.css";

export interface UploadDocumentProps {
  id: string;
  title: string;
  subtitle?: string;
  desc?: string;
  isRequired?: boolean;
  badge?: React.ReactNode;
  uploadIcon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  isUploaded?: boolean;
  fileName?: string;
  fileSize?: string;
  file?: File;
  icon?: React.ReactNode;
  /** Allowed files (default: PDF, Excel, JPG or PNG up to 15 MB — the application-wide rule) */
  rule?: UploadRule;
  uploadLabel?: string;
  /** Inline validation error message displayed directly below subtitle */
  error?: string;
  onUpload?: (id: string, file: File) => void;
  /** A picked file broke the upload rule */
  onUploadError?: (id: string, message: string) => void;
  onRemove?: (id: string) => void;
  onView?: (doc: {
    id: string;
    title: string;
    fileName?: string;
    file?: File;
  }) => void;
  onReplace?: (id: string) => void;
  isNotApplicable?: boolean;
  onToggleNotApplicable?: (id: string) => void;
  onUploadClick?: (e: React.MouseEvent) => boolean | void;
  ariaLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export type DocumentCardProps = UploadDocumentProps;

/** Optional per-card icon colours passed by the caller */
const buildIconStyle = (iconBg?: string, iconColor?: string): React.CSSProperties | undefined => {
  const style: React.CSSProperties = {
    ...(iconBg ? { backgroundColor: iconBg } : {}),
    ...(iconColor ? { color: iconColor } : {}),
  };
  return Object.keys(style).length > 0 ? style : undefined;
};

export const UploadDocument: React.FC<UploadDocumentProps> = ({
  id,
  title,
  subtitle,
  desc,
  isRequired = false,
  badge,
  uploadIcon,
  iconBg,
  iconColor,
  isUploaded = false,
  fileName,
  fileSize,
  file,
  icon,
  rule = DOCUMENT_UPLOAD_RULE,
  uploadLabel = "Upload",
  error,
  onUpload,
  onUploadError,
  onRemove,
  onView,
  onReplace,
  onUploadClick,
  ariaLabel,
  isNotApplicable = false,
  onToggleNotApplicable,
  children,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localFile, setLocalFile] = useState<File | undefined>(file);
  const [internalError, setInternalError] = useState<string | undefined>(undefined);

  // The active error shows internal validation failure or caller-provided error
  const activeError = error !== undefined ? error : internalError;

  // When an error is present (such as during a failed file replace), do not show
  // the previous document or marked uploaded status. Only show the error warning and upload button.
  const effectiveIsUploaded = Boolean(isUploaded && !activeError);

  // Remember a file passed in by the parent so "View Document" can open it later
  useEffect(() => {
    if (file) uploadedFileStore.remember(id, file);
  }, [file, id]);

  /** Runs only for files that passed the upload rule */
  const handleFileSelected = (selectedFile: File) => {
    try {
      assertGstUploadCriteria(selectedFile, rule);
      setInternalError(undefined);
      setLocalFile(selectedFile);
      uploadedFileStore.remember(id, selectedFile);
      onUpload?.(id, selectedFile);
    } catch (err) {
      const errorMsg =
        err instanceof GstUploadException
          ? err.message
          : err instanceof Error
          ? err.message
          : "Invalid file";
      // Clear previous document when replacement fails validation
      setLocalFile(undefined);
      uploadedFileStore.forget(id, fileName);
      onRemove?.(id);
      setInternalError(errorMsg);
      onUploadError?.(id, errorMsg);
    }
  };

  /** Captures file rejection from FileInput and renders inline under the card (no toast / side popup) */
  const handleFileInputError = (message: string) => {
    // Clear previous document when replacement fails validation
    setLocalFile(undefined);
    uploadedFileStore.forget(id, fileName);
    onRemove?.(id);
    setInternalError(message);
    onUploadError?.(id, message);
  };

  const handleView = () => {
    const activeFile = file || localFile || uploadedFileStore.get(id, fileName);
    if (onView) {
      onView({ id, title, fileName, file: activeFile });
      return;
    }
    viewUploadedDocument({ id, title, fileName, file: activeFile });
  };

  /** Lets the parent block the picker (e.g. profile incomplete) before it opens */
  const openPicker = (e: React.MouseEvent) => {
    if (onUploadClick?.(e) === false) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleReplaceClick = (e: React.MouseEvent) => {
    if (onUploadClick?.(e) === false) return;
    onReplace?.(id);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleUploadBtnClick = openPicker;

  const handleDeleteClick = () => {
    setInternalError(undefined);
    setLocalFile(undefined);
    uploadedFileStore.forget(id, fileName);
    onRemove?.(id);
  };

  const handleToggleNotApplicable = () => onToggleNotApplicable?.(id);

  const effectiveSubtitle = subtitle || desc;
  const iconStyle = buildIconStyle(iconBg, iconColor);

  return (
    <div
      id={id}
      data-doc-id={id}
      className={`supporting-doc-item ${effectiveIsUploaded ? "supporting-doc-item--uploaded" : ""} ${className}`}
      data-testid={`doc-card-${id}`}
    >
      <FileInput
        ref={fileInputRef}
        rule={rule}
        id={`file-input-${id}`}
        className="supporting-doc-item__file-input"
        onFileSelected={handleFileSelected}
        onFileError={handleFileInputError}
        aria-label={`Choose file for ${title}`}
      />

      {/* Main Card Content */}
      <div className="supporting-doc-item__main">
        <div className="supporting-doc-item__left">
          <div
            className="supporting-doc-item__icon-box"
            style={iconStyle}
            aria-hidden="true"
          >
            {icon || (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            )}
          </div>

          <div className="supporting-doc-item__meta">
            <div className="supporting-doc-item__title-row">
              <span className="supporting-doc-item__title">
                {title}
                {isRequired && (
                  <span className="supporting-doc-item__required"> *</span>
                )}
              </span>
              {badge}
            </div>
            {effectiveSubtitle && (
              <span className="supporting-doc-item__subtitle">
                {effectiveSubtitle}
              </span>
            )}
            {activeError && (
              <p className="supporting-doc-item__error" role="alert">
                {activeError}
              </p>
            )}
            {effectiveIsUploaded && (
              <span className="supporting-doc-item__filename">
                {fileName || file?.name || "Document uploaded"}{" "}
                {fileSize ? `(${fileSize})` : ""}
              </span>
            )}
            {children}
          </div>
        </div>

        {/* Right side status / button */}
        {effectiveIsUploaded ? (
          <div className="supporting-doc-item__uploaded-badge">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Uploaded</span>
          </div>
        ) : isNotApplicable ? (
          <div className="supporting-doc-item__na-wrap">
            <span className="supporting-doc-item__na-badge">
              Not Applicable
            </span>
            {onToggleNotApplicable && (
              <button
                type="button"
                className="supporting-doc-item__na-undo"
                onClick={handleToggleNotApplicable}
              >
                Change
              </button>
            )}
          </div>
        ) : (
          <div className="supporting-doc-item__btn-group">
            <button
              type="button"
              className="supporting-doc-item__upload-btn"
              onClick={handleUploadBtnClick}
              aria-label={ariaLabel || `Upload ${title}`}
              data-testid={`upload-btn-${id}`}
            >
              {uploadIcon || (
                <svg
                  className="supporting-doc-item__cloud-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                  <polyline points="9 14 12 11 15 14" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                </svg>
              )}
              <span>{uploadLabel}</span>
            </button>
            {onToggleNotApplicable && !isRequired && (
              <button
                type="button"
                className="supporting-doc-item__na-btn"
                onClick={handleToggleNotApplicable}
              >
                Not Applicable
              </button>
            )}
          </div>
        )}
      </div>

      {/* Uploaded Actions Footer Bar: View Document | Replace | Trash */}
      {effectiveIsUploaded && (
        <>
          <div className="supporting-doc-item__divider" />
          <div className="supporting-doc-item__bottom-bar">
            <button
              type="button"
              className="supporting-doc-item__action-link supporting-doc-item__action-link--view"
              onClick={handleView}
              data-testid={`view-doc-${id}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>View Document</span>
            </button>

            <span
              className="supporting-doc-item__divider-vertical"
              aria-hidden="true"
            />

            <button
              type="button"
              className="supporting-doc-item__action-link supporting-doc-item__action-link--replace"
              onClick={handleReplaceClick}
              data-testid={`replace-doc-${id}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              <span>Replace</span>
            </button>

            <span
              className="supporting-doc-item__divider-vertical"
              aria-hidden="true"
            />

            {/* Dedicated class (not the legacy __trash-btn) so other modules' styles cannot collapse it */}
            <button
              type="button"
              className="supporting-doc-item__action-link supporting-doc-item__delete-btn"
              onClick={handleDeleteClick}
              title={`Delete ${fileName || "document"}`}
              aria-label={`Delete ${title}${fileName ? ` (${fileName})` : ""}`}
              data-testid={`delete-doc-${id}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              <span className="supporting-doc-item__delete-label">Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Aliases for backward and cross-import compatibility
export const uploadDocument = UploadDocument;
export const DocumentCard = UploadDocument;

export default UploadDocument;
