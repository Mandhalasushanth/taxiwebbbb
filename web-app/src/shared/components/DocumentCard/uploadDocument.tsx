import React, { useRef, useState, useEffect } from "react";
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
    const cacheMap =
      typeof window !== "undefined"
        ? (window as unknown as { __taxedge_uploaded_files?: Map<string, File> })
            .__taxedge_uploaded_files
        : undefined;

    const rawFile: unknown =
      params.file ||
      cacheMap?.get(params.id) ||
      (params.fileName ? cacheMap?.get(params.fileName) : undefined);

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
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #525659; color: #1e293b; min-height: 100vh; display: flex; flex-direction: column; }
      .toolbar { background: #323639; color: #f1f5f9; padding: 0.6rem 1.5rem; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: sticky; top: 0; z-index: 50; }
      .toolbar-title { font-size: 0.95rem; font-weight: 500; display: flex; align-items: center; gap: 8px; }
      .toolbar-badge { background: #2563eb; color: #fff; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
      .toolbar-actions { display: flex; gap: 8px; }
      .toolbar-btn { background: #475569; color: #f8fafc; border: 1px solid #64748b; padding: 4px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; transition: background 0.15s; }
      .toolbar-btn:hover { background: #64748b; }
      .toolbar-btn-primary { background: #2563eb; border-color: #3b82f6; }
      .toolbar-btn-primary:hover { background: #1d4ed8; }
      .viewer-main { flex: 1; display: flex; justify-content: center; padding: 2rem 1rem; overflow-y: auto; }
      .page-sheet { background: #ffffff; width: 100%; max-width: 820px; min-height: 1050px; box-shadow: 0 10px 35px rgba(0,0,0,0.4); border-radius: 2px; padding: 3.5rem 3rem; display: flex; flex-direction: column; position: relative; }
      .doc-top-bar { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 1.5rem; border-bottom: 2px solid #0f172a; margin-bottom: 2rem; }
      .doc-emblem { font-size: 1.1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
      .doc-emblem-sub { font-size: 0.8rem; color: #64748b; margin-top: 2px; }
      .doc-heading-block { text-align: right; }
      .doc-type-title { font-size: 1.35rem; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; }
      .doc-ref-text { font-size: 0.8rem; color: #64748b; margin-top: 4px; }
      .doc-body-section { flex: 1; }
      .doc-meta-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; font-size: 0.9rem; }
      .doc-meta-table th { background: #f8fafc; text-align: left; padding: 10px 14px; border: 1px solid #e2e8f0; color: #475569; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; width: 35%; }
      .doc-meta-table td { padding: 10px 14px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 500; }
      .doc-status-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; }
      .doc-status-badge { background: #16a34a; color: #ffffff; font-weight: 700; font-size: 0.75rem; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; }
      .doc-status-text { font-size: 0.85rem; color: #166534; font-weight: 500; }
      .doc-preview-content { border: 1px dashed #cbd5e1; border-radius: 8px; padding: 2rem; background: #fafafa; margin-bottom: 2rem; }
      .doc-preview-content h4 { font-size: 1rem; color: #1e293b; margin-bottom: 0.75rem; }
      .doc-preview-content p { font-size: 0.85rem; color: #475569; line-height: 1.6; margin-bottom: 0.5rem; }
      .doc-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 5rem; font-weight: 900; color: rgba(148, 163, 184, 0.08); pointer-events: none; user-select: none; }
      .doc-footer-bar { margin-top: auto; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; }
      @media print {
        body { background: white; }
        .toolbar { display: none; }
        .page-sheet { box-shadow: none; padding: 1rem; min-height: auto; }
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <div class="toolbar-title">
        <span class="toolbar-badge">Document</span>
        <span>${docName}</span>
      </div>
      <div class="toolbar-actions">
        <button class="toolbar-btn" onclick="window.print()">Print</button>
        <button class="toolbar-btn toolbar-btn-primary" onclick="window.close()">Close</button>
      </div>
    </div>
    <main class="viewer-main">
      <div class="page-sheet">
        <div class="doc-watermark">OFFICIAL COPY</div>
        <div class="doc-top-bar">
          <div>
            <div class="doc-emblem">TaxEdge Compliance Portal</div>
            <div class="doc-emblem-sub">Official Tax & Compliance Document Records</div>
          </div>
          <div class="doc-heading-block">
            <div class="doc-type-title">${docTitle}</div>
            <div class="doc-ref-text">Reference: ${docName}</div>
          </div>
        </div>
        <div class="doc-body-section">
          <div class="doc-status-banner">
            <span class="doc-status-badge">Attached</span>
            <span class="doc-status-text">Document attached to compliance filing and ready for assessment processing.</span>
          </div>
          <table class="doc-meta-table">
            <tbody>
              <tr>
                <th>Document Classification</th>
                <td>${docTitle}</td>
              </tr>
              <tr>
                <th>File Name</th>
                <td>${docName}</td>
              </tr>
              <tr>
                <th>Identifier</th>
                <td>DOC-${params.id.toUpperCase()}</td>
              </tr>
              <tr>
                <th>Security & Verification</th>
                <td>End-to-End Encrypted File Record</td>
              </tr>
            </tbody>
          </table>
          <div class="doc-preview-content">
            <h4>Document Filing Record</h4>
            <p>This document record represents the attached ${docTitle} file (${docName}) provided for submission and verification in this application.</p>
            <p>During live filing or CA verification, the document is accessible by assigned compliance officers for schedule matching and assessment validation.</p>
          </div>
        </div>
        <div class="doc-footer-bar">
          <span>TaxEdge Compliance Records</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </main>
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
  const [localFile, setLocalFile] = useState<File | undefined>(file);

  useEffect(() => {
    if (file) {
      setLocalFile(file);
      if (typeof window !== "undefined") {
        const win = window as unknown as {
          __taxedge_uploaded_files?: Map<string, File>;
        };
        if (!win.__taxedge_uploaded_files) {
          win.__taxedge_uploaded_files = new Map<string, File>();
        }
        win.__taxedge_uploaded_files.set(id, file);
        if (file.name) {
          win.__taxedge_uploaded_files.set(file.name, file);
        }
      }
    }
  }, [file, id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    executeSafely(
      () => {
        const selectedFile = extractUploadedFile(e);
        setLocalFile(selectedFile);
        if (typeof window !== "undefined") {
          const win = window as unknown as {
            __taxedge_uploaded_files?: Map<string, File>;
          };
          if (!win.__taxedge_uploaded_files) {
            win.__taxedge_uploaded_files = new Map<string, File>();
          }
          win.__taxedge_uploaded_files.set(id, selectedFile);
          if (selectedFile.name) {
            win.__taxedge_uploaded_files.set(selectedFile.name, selectedFile);
          }
        }
        onUpload?.(id, selectedFile);
      },
      undefined,
      (err) => console.warn("UploadDocument: File change handled safely:", err),
    );
  };

  const handleView = () => {
    const cachedFile =
      typeof window !== "undefined"
        ? (
            window as unknown as {
              __taxedge_uploaded_files?: Map<string, File>;
            }
          ).__taxedge_uploaded_files?.get(id) ||
          (fileName
            ? (
                window as unknown as {
                  __taxedge_uploaded_files?: Map<string, File>;
                }
              ).__taxedge_uploaded_files?.get(fileName)
            : undefined)
        : undefined;

    const activeFile = file || localFile || cachedFile;
    openDocumentPreview({ id, title, fileName, file: activeFile, onView });
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
      () => {
        setLocalFile(undefined);
        if (typeof window !== "undefined") {
          const win = window as unknown as {
            __taxedge_uploaded_files?: Map<string, File>;
          };
          win.__taxedge_uploaded_files?.delete(id);
          if (fileName) {
            win.__taxedge_uploaded_files?.delete(fileName);
          }
        }
        onRemove?.(id);
      },
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
