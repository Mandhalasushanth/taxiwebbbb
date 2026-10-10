import React, { useRef } from "react";
import { Briefcase, Upload, X } from "lucide-react";
import { FileInput, formatUploadSize } from "@shared/upload";
import { formatAadhaar, formatMobile, formatPan } from "@shared/utils/formatUtils";
import type { TdsBusinessDetails, UploadedFileMeta } from "@modules/itr/types/tdsRefund.types";
import "./TdsBusinessDetailsCard.css";

type BusinessDocKey = "panDoc" | "aadhaarDoc";

interface TdsBusinessDetailsCardProps {
  businessDetails: TdsBusinessDetails;
  fieldErrors: Record<string, string>;
  handleBusinessChange: (updated: Partial<TdsBusinessDetails>) => void;
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
  doc?: UploadedFileMeta;
  onValueChange: (raw: string) => void;
  onDocChange: (doc: UploadedFileMeta | undefined) => void;
}

const toFileMeta = (file: File): UploadedFileMeta => ({
  id: `${file.name}-${file.lastModified}`,
  name: file.name,
  size: formatUploadSize(file.size),
  file,
  uploadedAt: new Date().toISOString(),
});

/** Text input with an inline "Upload" button for the matching document. */
const UploadField: React.FC<UploadFieldProps> = ({
  id, label, placeholder, value, error, inputMode, maxLength, isUpper, doc, onValueChange, onDocChange,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="tds-form-group">
      <label htmlFor={id} className="tds-label">
        {label} <span className="tds-required">*</span>
      </label>
      <div className="tds-upload-field">
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          maxLength={maxLength}
          className={`tds-input tds-upload-field__input ${isUpper ? "tds-input--upper" : ""} ${error ? "has-error" : ""}`}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          required
        />
        <button
          type="button"
          className="tds-upload-field__btn"
          onClick={() => fileRef.current?.click()}
          aria-label={`Upload ${label}`}
        >
          <Upload size={16} strokeWidth={2.4} aria-hidden="true" />
          <span>{doc ? "Replace" : "Upload"}</span>
        </button>
        <FileInput
          ref={fileRef}
          className="tds-upload-field__file"
          onFileSelected={(file) => onDocChange(toFileMeta(file))}
        />
      </div>
      {error && <span className="tds-field-error">{error}</span>}
      {doc && (
        <span className="tds-upload-field__chip">
          <span className="tds-upload-field__chip-name">{doc.name}</span>
          <span className="tds-upload-field__chip-size">{doc.size}</span>
          <button
            type="button"
            className="tds-upload-field__chip-remove"
            onClick={() => onDocChange(undefined)}
            aria-label={`Remove ${doc.name}`}
          >
            <X size={14} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </span>
      )}
    </div>
  );
};

/** Business identity of the claimant: legal name, business PAN, Aadhaar and mobile. */
export const TdsBusinessDetailsCard: React.FC<TdsBusinessDetailsCardProps> = ({
  businessDetails,
  fieldErrors,
  handleBusinessChange,
}) => {
  const setDoc = (key: BusinessDocKey) => (doc: UploadedFileMeta | undefined) =>
    handleBusinessChange({ [key]: doc } as Partial<TdsBusinessDetails>);

  return (
    <div className="tds-card" data-testid="tds-card-business">
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
          <input
            id="tds-business-name"
            type="text"
            maxLength={150}
            className={`tds-input ${fieldErrors.legalName ? "has-error" : ""}`}
            value={businessDetails.legalName}
            onChange={(e) => handleBusinessChange({ legalName: e.target.value })}
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
            placeholder="Enter Business PAN (e.g. ABCDE1234F)"
            value={businessDetails.pan}
            error={fieldErrors.pan}
            maxLength={10}
            isUpper
            doc={businessDetails.panDoc}
            onValueChange={(raw) => handleBusinessChange({ pan: formatPan(raw) })}
            onDocChange={setDoc("panDoc")}
          />
          <UploadField
            id="tds-business-aadhaar"
            label="Aadhaar Card Number"
            placeholder="Enter 12-digit Aadhaar number"
            value={businessDetails.aadhaar}
            error={fieldErrors.aadhaar}
            inputMode="numeric"
            maxLength={14}
            doc={businessDetails.aadhaarDoc}
            onValueChange={(raw) => handleBusinessChange({ aadhaar: formatAadhaar(raw) })}
            onDocChange={setDoc("aadhaarDoc")}
          />
        </div>

        <div className="tds-form-group">
          <label htmlFor="tds-business-mobile" className="tds-label">
            Mobile Number <span className="tds-required">*</span>
          </label>
          <input
            id="tds-business-mobile"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            className={`tds-input ${fieldErrors.mobile ? "has-error" : ""}`}
            value={businessDetails.mobile}
            onChange={(e) => handleBusinessChange({ mobile: formatMobile(e.target.value) })}
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
