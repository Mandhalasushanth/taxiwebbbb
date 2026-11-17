import React, { useRef, useState } from "react";
import { Briefcase, Upload, Eye, ArrowRightLeft, Trash2, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { FileInput, formatUploadSize } from "@shared/upload";
import { CaretInput, DeleteDocumentConfirmModal } from "@shared/components";
import { formatAadhaar, formatMobile, formatPan } from "@shared/utils/formatUtils";
import type { TdsBusinessDetails, UploadedFileMeta } from "@modules/itr/types/tdsRefund.types";
import { sanitizeBusinessLegalName } from "./tdsBusinessValidation";
import "./TdsBusinessDetailsCard.css";

type BusinessDocKey = "panDoc" | "aadhaarDoc";

interface TdsBusinessDetailsCardProps {
  businessDetails: TdsBusinessDetails;
  fieldErrors: Record<string, string>;
  handleBusinessChange: (updated: Partial<TdsBusinessDetails>) => void;
  onBlur?: (field: keyof TdsBusinessDetails) => void;
}

interface UploadFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength: number;
  isUpper?: boolean;
  isRequired?: boolean;
  doc?: UploadedFileMeta;
  onValueChange: (raw: string) => void;
  onBlur?: () => void;
  onDocChange: (doc: UploadedFileMeta | undefined) => void;
}

/** Text input with an inline upload & action controls for the matching document. */
const UploadField: React.FC<UploadFieldProps> = ({
  id,
  label,
  placeholder,
  value,
  error,
  inputMode,
  maxLength,
  isUpper,
  isRequired = true,
  doc,
  onValueChange,
  onBlur,
  onDocChange,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isUploading = Boolean(
    doc &&
      (doc.status === "uploading" ||
        (typeof doc.progress === "number" &&
          doc.progress < 100 &&
          doc.status !== "success" &&
          doc.status !== "uploaded"))
  );

  const isFailed = Boolean(
    doc && (doc.status === "failed" || doc.status === "error" || Boolean(doc.error))
  );

  const isSuccess = Boolean(
    doc &&
      !isFailed &&
      !isUploading &&
      (doc.status === "success" || doc.status === "uploaded" || Boolean(doc.file || doc.name))
  );

  const handleFileSelected = (file: File) => {
    // 1. Immediately set uploading state
    const uploadMeta: UploadedFileMeta = {
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      size: formatUploadSize(file.size),
      file,
      uploadedAt: new Date().toISOString(),
      status: "uploading",
      progress: 50,
    };
    onDocChange(uploadMeta);

    // 2. Mark upload successful
    const timer = setTimeout(() => {
      onDocChange({
        ...uploadMeta,
        status: "success",
        progress: 100,
      });
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleFileError = (message: string, file: File) => {
    onDocChange({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      size: formatUploadSize(file.size),
      file,
      uploadedAt: new Date().toISOString(),
      status: "failed",
      error: message || "File upload failed. Please try again.",
    });
  };

  const handleViewDoc = () => {
    if (!doc) return;
    if (doc.file) {
      const url = URL.createObjectURL(doc.file);
      window.open(url, "_blank");
    } else {
      const blob = new Blob([`Document Preview: ${doc.name}`], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    onDocChange(undefined);
  };

  const renderUploadActionArea = () => {
    if (isUploading) {
      return (
        <div className="tds-upload-field__actions-box">
          <span className="tds-upload-field__status tds-upload-field__status--uploading">
            <Loader2 size={13} className="tds-spinner-icon" />
            <span>Uploading...</span>
          </span>
        </div>
      );
    }

    if (isFailed) {
      return (
        <div className="tds-upload-field__actions-box">
          <span className="tds-upload-field__status tds-upload-field__status--failed">
            <AlertCircle size={13} />
            <span>Upload Failed</span>
          </span>
          <div className="tds-upload-field__btn-row">
            <button
              type="button"
              className="tds-upload-action-btn tds-upload-action-btn--replace"
              onClick={() => fileRef.current?.click()}
              title="Retry upload"
              aria-label={`Retry ${label} upload`}
            >
              <RefreshCw size={15} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              className="tds-upload-action-btn tds-upload-action-btn--delete"
              onClick={() => setIsDeleteModalOpen(true)}
              title="Remove failed file"
              aria-label={`Remove failed ${label} file`}
            >
              <Trash2 size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      );
    }

    if (isSuccess && doc) {
      return (
        <div className="tds-upload-field__actions-box">
          <span className="tds-upload-field__filename" title={doc.name}>
            {doc.name}
          </span>
          <div className="tds-upload-field__btn-row">
            <button
              type="button"
              className="tds-upload-action-btn tds-upload-action-btn--view"
              onClick={handleViewDoc}
              title="View document"
              aria-label={`View ${label} document`}
            >
              <Eye size={18} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="tds-upload-action-btn tds-upload-action-btn--replace"
              onClick={() => fileRef.current?.click()}
              title="Replace document"
              aria-label={`Replace ${label} document`}
            >
              <ArrowRightLeft size={16} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              className="tds-upload-action-btn tds-upload-action-btn--delete"
              onClick={() => setIsDeleteModalOpen(true)}
              title="Delete document"
              aria-label={`Delete ${label} document`}
            >
              <Trash2 size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        type="button"
        className="tds-upload-field__btn"
        onClick={() => fileRef.current?.click()}
        aria-label={`Upload ${label} (max 10 MB)`}
        title="Upload document (max 10 MB)"
      >
        <Upload size={16} strokeWidth={2.4} aria-hidden="true" />
        <span>Upload</span>
      </button>
    );
  };

  return (
    <div className="tds-form-group">
      <label htmlFor={id} className="tds-label">
        {label} {isRequired && <span className="tds-required">*</span>}
      </label>
      <div
        className={`tds-upload-field ${doc ? "tds-upload-field--has-doc" : ""} ${
          error ? "has-error" : ""
        }`}
      >
        <div className="tds-upload-field__input-wrap">
          <CaretInput
            id={id}
            type="text"
            inputMode={inputMode}
            maxLength={maxLength}
            className={`tds-upload-field__input ${isUpper ? "tds-input--upper" : ""}`}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            required={isRequired}
          />
        </div>

        {renderUploadActionArea()}

        <FileInput
          ref={fileRef}
          className="tds-upload-field__file"
          onFileSelected={handleFileSelected}
          onFileError={handleFileError}
        />
      </div>
      {error && <span className="tds-field-error">{error}</span>}

      <DeleteDocumentConfirmModal
        isOpen={isDeleteModalOpen}
        fileName={doc?.name}
        documentTitle={label}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

/** Business identity of the claimant: legal name, business PAN, Aadhaar and mobile. */
export const TdsBusinessDetailsCard: React.FC<TdsBusinessDetailsCardProps> = ({
  businessDetails,
  fieldErrors,
  handleBusinessChange,
  onBlur,
}) => {
  const setDoc = (key: BusinessDocKey) => (doc: UploadedFileMeta | undefined) =>
    handleBusinessChange({ [key]: doc } as Partial<TdsBusinessDetails>);

  return (
    <div className="tds-card" id="tds-card-business" data-section="tds-card-business" data-testid="tds-card-business">
      <div className="tds-card-header">
        <div className="tds-card-title-wrap">
          <div className="tds-card-icon-box tds-card-icon-box--calc" aria-hidden="true">
            <Briefcase size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="tds-card-title">Business Details</h2>
            <span className="tds-card-subtitle">As registered with the Income Tax Department</span>
          </div>
        </div>
      </div>
      <div className="tds-bank-form">
        <div className="tds-form-group">
          <label htmlFor="tds-business-name" className="tds-label">
            Legal Name of Business (as per PAN) <span className="tds-required">*</span>
          </label>
          <CaretInput
            id="tds-business-name"
            type="text"
            maxLength={150}
            className={`tds-input ${fieldErrors.legalName ? "has-error" : ""}`}
            value={businessDetails.legalName}
            onChange={(e) => {
              const sanitized = sanitizeBusinessLegalName(e.target.value);
              handleBusinessChange({ legalName: sanitized });
            }}
            onBlur={() => {
              const trimmed = businessDetails.legalName.trim();
              if (trimmed !== businessDetails.legalName) {
                handleBusinessChange({ legalName: trimmed });
              }
              onBlur?.("legalName");
            }}
            placeholder="Enter legal name of business"
            aria-invalid={Boolean(fieldErrors.legalName)}
            required
          />
          {fieldErrors.legalName && <span className="tds-field-error">{fieldErrors.legalName}</span>}
        </div>

        <div className="tds-form-grid-2">
          <UploadField
            id="tds-business-pan"
            label="Business PAN"
            placeholder="Enter Business PAN (e.g. ABCPH5478H)"
            value={businessDetails.pan}
            error={fieldErrors.pan || fieldErrors.panDoc}
            maxLength={10}
            isUpper
            isRequired={true}
            doc={businessDetails.panDoc}
            onValueChange={(raw) => handleBusinessChange({ pan: formatPan(raw) })}
            onBlur={() => onBlur?.("pan")}
            onDocChange={(doc) => {
              setDoc("panDoc")(doc);
              onBlur?.("panDoc");
            }}
          />
          <UploadField
            id="tds-business-aadhaar"
            label="Aadhaar Card"
            placeholder="Enter 12-digit Aadhaar number"
            value={businessDetails.aadhaar}
            error={fieldErrors.aadhaar || fieldErrors.aadhaarDoc}
            inputMode="numeric"
            maxLength={14}
            isRequired={false}
            doc={businessDetails.aadhaarDoc}
            onValueChange={(raw) => handleBusinessChange({ aadhaar: formatAadhaar(raw) })}
            onBlur={() => onBlur?.("aadhaar")}
            onDocChange={(doc) => {
              setDoc("aadhaarDoc")(doc);
              onBlur?.("aadhaarDoc");
            }}
          />
        </div>

        <div className="tds-form-group">
          <label htmlFor="tds-business-mobile" className="tds-label">
            Mobile Number <span className="tds-required">*</span>
          </label>
          <CaretInput
            id="tds-business-mobile"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            className={`tds-input ${fieldErrors.mobile ? "has-error" : ""}`}
            value={businessDetails.mobile}
            onChange={(e) => handleBusinessChange({ mobile: formatMobile(e.target.value) })}
            onBlur={() => onBlur?.("mobile")}
            placeholder="Enter 10-digit Mobile Number"
            aria-invalid={Boolean(fieldErrors.mobile)}
            required
          />
          {fieldErrors.mobile && <span className="tds-field-error">{fieldErrors.mobile}</span>}
        </div>
      </div>
    </div>
  );
};
