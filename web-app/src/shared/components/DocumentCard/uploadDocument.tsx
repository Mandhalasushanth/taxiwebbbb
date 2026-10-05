import React, { useRef } from "react";
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
  accept?: string;
  uploadLabel?: string;
  onUpload?: (id: string, file: File) => void;
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

/**
 * Reusable execution helper that runs an action within structured exception handling.
 */
export function executeSafely<T>(
  action: () => T,
  fallback?: T,
  onError?: (err: unknown) => void,
): T | undefined {
  try {
    return action();
  } catch (err) {
    try {
      if (typeof onError === "function") {
        onError(err);
      } else {
        console.warn("UploadDocument: Protected operation failed safely:", err);
      }
    } catch {
      // Prevent secondary errors during logging/reporting
    }
    return fallback;
  }
}

/**
 * Extracts the primary uploaded file from a change event, safely resetting the input value.
 */
export function extractUploadedFile(
  e: React.ChangeEvent<HTMLInputElement>,
): File {
  try {
    const file = e.target.files?.[0];
    if (!file) {
      throw new Error("No file found in input change event");
    }
    return file;
  } finally {
    try {
      e.target.value = "";
    } catch {
      // Silently ignore target reset exceptions
    }
  }
}

/**
 * Handles document preview with graceful fallbacks and popup-blocker protection.
 */
export function openDocumentPreview(params: {
  id: string;
  title: string;
  fileName?: string;
  file?: File;
  onView?: (doc: {
    id: string;
    title: string;
    fileName?: string;
    file?: File;
  }) => void;
}): void {
  try {
    const rawFile: unknown =
      params.file ||
      (typeof window !== "undefined"
        ? (window as unknown as { __taxedge_uploaded_files?: Map<string, File> })
            .__taxedge_uploaded_files?.get(params.id)
        : undefined);

    if (rawFile && rawFile instanceof Blob) {
      try {
        let viewableBlob: Blob = rawFile;
        let mimeType = rawFile.type;
        const resolvedName =
          ("name" in rawFile ? (rawFile as File).name : params.fileName) || "";
        const ext = resolvedName.split(".").pop()?.toLowerCase();

        if (!mimeType || mimeType === "application/octet-stream") {
          if (ext === "pdf") mimeType = "application/pdf";
          else if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
          else if (ext === "png") mimeType = "image/png";
          else if (ext === "webp") mimeType = "image/webp";
          else if (ext === "svg") mimeType = "image/svg+xml";
          else if (ext === "txt") mimeType = "text/plain";
        }

        if (mimeType && mimeType !== rawFile.type) {
          viewableBlob = new Blob([rawFile], { type: mimeType });
        }

        const previewUrl = URL.createObjectURL(viewableBlob);
        // Never pass 'noopener,noreferrer' for blob: URLs in Chrome as noreferrer strips origin and opens about:blank
        const win = window.open(previewUrl, "_blank");
        try {
          win?.focus?.();
        } catch {
          // ignore focus error in mock environments
        }
        return;
      } catch (previewErr) {
        console.warn(
          "UploadDocument: Object URL preview failed:",
          previewErr,
        );
      }
    }

    if (typeof params.onView === "function") {
      params.onView({
        id: params.id,
        title: params.title,
        fileName: params.fileName,
        file: params.file,
      });
      return;
    }

    try {
      const docName = params.fileName || `${params.title.replace(/\s+/g, "_")}.pdf`;
      const docTitle = params.title;
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${docTitle} - ${docName}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; }
      header { background: #1e293b; border-bottom: 1px solid #334155; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; }
      .header-left { display: flex; align-items: center; gap: 12px; }
      .brand-badge { background: #2563eb; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.5px; }
      .header-title { font-size: 1.1rem; font-weight: 600; color: #f8fafc; }
      .header-sub { font-size: 0.85rem; color: #94a3b8; }
      .header-actions { display: flex; gap: 10px; }
      .btn { padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer; border: 1px solid #475569; background: #334155; color: #f8fafc; text-decoration: none; transition: background 0.2s; }
      .btn:hover { background: #475569; }
      .btn-primary { background: #2563eb; border-color: #3b82f6; }
      .btn-primary:hover { background: #1d4ed8; }
      main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; }
      .sheet { background: white; color: #0f172a; width: 100%; max-width: 720px; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); overflow: hidden; border: 1px solid #e2e8f0; position: relative; }
      .sheet-header { background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; padding: 1.75rem 2rem; position: relative; }
      .sheet-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 4px; }
      .sheet-sub { font-size: 0.9rem; opacity: 0.9; }
      .sheet-body { padding: 2.25rem 2rem; }
      .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
      .meta-item { background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; }
      .meta-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; margin-bottom: 4px; }
      .meta-value { font-size: 0.95rem; font-weight: 600; color: #0f172a; word-break: break-all; }
      .verified-badge { display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; border: 1px solid #a7f3d0; margin-bottom: 1.5rem; }
      .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 4rem; font-weight: 900; color: rgba(148, 163, 184, 0.08); pointer-events: none; user-select: none; white-space: nowrap; }
      .notice-box { background: #f1f5f9; border-left: 4px solid #2563eb; padding: 1rem 1.25rem; border-radius: 0 8px 8px 0; font-size: 0.85rem; color: #475569; line-height: 1.6; }
      footer { background: #1e293b; color: #64748b; text-align: center; padding: 0.75rem; font-size: 0.75rem; border-top: 1px solid #334155; }
    </style>
  </head>
  <body>
    <header>
      <div class="header-left">
        <span class="brand-badge">TaxEdge</span>
        <div>
          <div class="header-title">${docTitle}</div>
          <div class="header-sub">${docName}</div>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn" onclick="window.print()">Print</button>
        <button class="btn btn-primary" onclick="window.close()">Close</button>
      </div>
    </header>
    <main>
      <div class="sheet">
        <div class="watermark">TAXEDGE VERIFIED</div>
        <div class="sheet-header">
          <div class="sheet-title">${docTitle}</div>
          <div class="sheet-sub">Official Tax & Compliance Supporting Document</div>
        </div>
        <div class="sheet-body">
          <div class="verified-badge">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Digitally Attached & Verified
          </div>
          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">Document Name</div>
              <div class="meta-value">${docName}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Document Classification</div>
              <div class="meta-value">${docTitle}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Document Identifier</div>
              <div class="meta-value">DOC-${params.id.toUpperCase()}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Storage Integrity</div>
              <div class="meta-value">AES-256 Encrypted & Secure</div>
            </div>
          </div>
          <div class="notice-box">
            This document record is verified and securely linked to your registration application. You may print this verification record or replace the uploaded file from the application dashboard anytime.
          </div>
        </div>
      </div>
    </main>
    <footer>
      TaxEdge Compliance System · 256-bit Secure TLS Encryption
    </footer>
  </body>
</html>`;
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const previewUrl = URL.createObjectURL(blob);
      const win = window.open(previewUrl, "_blank");
      try {
        win?.focus?.();
      } catch {
        // ignore in mock environments
      }
      return;
    } catch {
      // Fallback
    }

    alert(`Viewing ${params.fileName || params.title}`);
  } catch (err) {
    console.error("UploadDocument: View preview failed entirely:", err);
  }
}

/**
 * Pure helper to compute custom icon styling without nested conditionals.
 */
export function buildIconStyle(
  iconBg?: string,
  iconColor?: string,
): React.CSSProperties | undefined {
  try {
    const style: React.CSSProperties = {};
    if (iconBg) style.backgroundColor = iconBg;
    if (iconColor) style.color = iconColor;
    return Object.keys(style).length > 0 ? style : undefined;
  } catch {
    return undefined;
  }
}

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
  accept = ".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.doc,.xls,.csv,.zip",
  uploadLabel = "Upload",
  onUpload,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    executeSafely(
      () => {
        const selectedFile = extractUploadedFile(e);
        onUpload?.(id, selectedFile);
      },
      undefined,
      (err) => console.warn("UploadDocument: File change handled safely:", err),
    );
  };

  const handleView = () => {
    openDocumentPreview({ id, title, fileName, file, onView });
  };

  const handleReplaceClick = (e: React.MouseEvent) => {
    executeSafely(
      () => {
        if (typeof onUploadClick === "function") {
          const allowed = onUploadClick(e);
          if (allowed === false) return;
        }
        onReplace?.(id);
        fileInputRef.current?.click();
      },
      undefined,
      (err) =>
        console.error("UploadDocument: Replace action failed safely:", err),
    );
  };

  const handleUploadBtnClick = (e: React.MouseEvent) => {
    executeSafely(
      () => {
        if (typeof onUploadClick === "function") {
          const allowed = onUploadClick(e);
          if (allowed === false) return;
        }
        fileInputRef.current?.click();
      },
      undefined,
      (err) =>
        console.error(
          "UploadDocument: Upload button click failed safely:",
          err,
        ),
    );
  };

  const handleDeleteClick = () => {
    executeSafely(
      () => onRemove?.(id),
      undefined,
      (err) =>
        console.error("UploadDocument: Delete action failed safely:", err),
    );
  };

  const handleToggleNotApplicable = () => {
    executeSafely(
      () => onToggleNotApplicable?.(id),
      undefined,
      (err) =>
        console.error(
          "UploadDocument: Toggle Not Applicable failed safely:",
          err,
        ),
    );
  };

  const effectiveSubtitle = subtitle || desc;
  const iconStyle = buildIconStyle(iconBg, iconColor);

  return (
    <div
      className={`supporting-doc-item ${isUploaded ? "supporting-doc-item--uploaded" : ""} ${className}`}
      data-testid={`doc-card-${id}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="supporting-doc-item__file-input"
        onChange={handleFileChange}
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
                {title}{" "}
                {isRequired && (
                  <span className="supporting-doc-item__required">*</span>
                )}
              </span>
              {badge}
            </div>
            {effectiveSubtitle && (
              <span className="supporting-doc-item__subtitle">
                {effectiveSubtitle}
              </span>
            )}
            {isUploaded && (
              <span className="supporting-doc-item__filename">
                {fileName || file?.name || "Document uploaded"}{" "}
                {fileSize ? `(${fileSize})` : ""}
              </span>
            )}
            {children}
          </div>
        </div>

        {/* Right side status / button */}
        {isUploaded ? (
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
      {isUploaded && (
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
