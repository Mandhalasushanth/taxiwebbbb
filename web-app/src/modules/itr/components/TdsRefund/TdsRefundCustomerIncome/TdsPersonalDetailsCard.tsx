import React, { useState } from "react";
import { User, Pencil, Check } from "lucide-react";
import { formatMobile } from "@shared/utils/validationUtils";
import type { TdsTaxpayerProfile } from "@modules/itr/utils/tdsRefund.constants";
import { DobDatePickerModal } from "@modules/authentication/components/DobDatePickerModal/DobDatePickerModal";
import {
  formatDob,
  formatMaskedAadhaar,
  formatMaskedPan,
  formatMobileDisplay,
  renderAddressDisplay,
} from "./tdsCustomerIncome.helpers";

interface TdsPersonalDetailsCardProps {
  profile: TdsTaxpayerProfile;
  fieldErrors: Record<string, string>;
  isEditingPersonal: boolean;
  setIsEditingPersonal: React.Dispatch<React.SetStateAction<boolean>>;
  handleProfileChange: (updated: Partial<TdsTaxpayerProfile>) => void;
}

/** Taxpayer personal details: read-only summary with an inline edit form */
export const TdsPersonalDetailsCard: React.FC<TdsPersonalDetailsCardProps> = ({
  profile,
  fieldErrors,
  isEditingPersonal,
  setIsEditingPersonal,
  handleProfileChange,
}) => {
  const [isDobPickerOpen, setIsDobPickerOpen] = useState(false);
  return (
  <div className="tds-card" data-testid="tds-card-personal">
    <div className="tds-card-header">
      <div className="tds-card-title-wrap">
        <div
          className="tds-card-icon-box tds-card-icon-box--user"
          aria-hidden="true"
        >
          <User size={20} strokeWidth={2.2} />
        </div>
        <h2 className="tds-card-title">Personal Information</h2>
      </div>
      <button
        type="button"
        className="tds-card-edit-btn"
        onClick={() => setIsEditingPersonal((prev) => !prev)}
        data-testid="tds-personal-edit-btn"
      >
        {isEditingPersonal ? (
          <>
            <Check size={14} strokeWidth={2.5} />
            <span>Done</span>
          </>
        ) : (
          <>
            <Pencil size={14} strokeWidth={2.4} />
            <span>Edit</span>
          </>
        )}
      </button>
    </div>

    {!isEditingPersonal ? (
      <div className="tds-personal-list" data-testid="tds-personal-summary-list">
        <div className="tds-personal-row">
          <span className="tds-personal-label">Full Name</span>
          <span className="tds-personal-val">{profile.fullName || profile.name || "Sagu"}</span>
        </div>
        <div className="tds-personal-row">
          <span className="tds-personal-label">PAN</span>
          <span className="tds-personal-val tds-personal-val--mono">
            {formatMaskedPan(profile.pan || "ABCDE5478Q")}
          </span>
        </div>
        <div className="tds-personal-row">
          <span className="tds-personal-label">Aadhaar</span>
          <span className="tds-personal-val tds-personal-val--mono">
            {formatMaskedAadhaar(profile.aadhaar || "123456783690")}
          </span>
        </div>
        <div className="tds-personal-row">
          <span className="tds-personal-label">Date of Birth</span>
          <span className="tds-personal-val">
            {formatDob(profile.dob || "2000-01-29")}
          </span>
        </div>
        <div className="tds-personal-row">
          <span className="tds-personal-label">Mobile</span>
          <span className="tds-personal-val">
            {formatMobileDisplay(profile.mobile || "+91 70081 38785")}
          </span>
        </div>
        <div className="tds-personal-row">
          <span className="tds-personal-label">Email</span>
          <span className="tds-personal-val">{profile.email || "sagu@gmail.com"}</span>
        </div>
        <div className="tds-personal-row">
          <span className="tds-personal-label">Address</span>
          <div className="tds-personal-val tds-personal-address">
            {renderAddressDisplay(profile.address || "Nlr\nNellore, Assam - 523142")}
          </div>
        </div>
      </div>
    ) : (
      <div className="tds-personal-grid">
        <div className="tds-form-group">
          <label htmlFor="tds-profile-fullname" className="tds-label">
            Full Name <span className="tds-required">*</span>
          </label>
          <input
            id="tds-profile-fullname"
            type="text"
            className={`tds-input ${fieldErrors.fullName ? "has-error" : ""}`}
            value={profile.fullName}
            onChange={(e) =>
              handleProfileChange({
                fullName: e.target.value,
                name: e.target.value,
              })
            }
            placeholder="Enter your name"
            required
          />
          {fieldErrors.fullName && (
            <span
              className="tds-field-error"
            >
              {fieldErrors.fullName}
            </span>
          )}
        </div>
        <div className="tds-form-group">
          <label htmlFor="tds-profile-pan" className="tds-label">
            PAN Number <span className="tds-required">*</span>
          </label>
          <input
            id="tds-profile-pan"
            type="text"
            className={`tds-input tds-input--upper ${fieldErrors.pan ? "has-error" : ""}`}
            value={profile.pan}
            onChange={(e) =>
              handleProfileChange({ pan: e.target.value.toUpperCase() })
            }
            placeholder="Enter your PAN"
            maxLength={10}
            required
          />
          {fieldErrors.pan && (
            <span
              className="tds-field-error"
            >
              {fieldErrors.pan}
            </span>
          )}
        </div>
        <div className="tds-form-group">
          <label htmlFor="tds-profile-aadhaar" className="tds-label">
            Aadhaar Number
          </label>
          <input
            id="tds-profile-aadhaar"
            type="text"
            className={`tds-input ${fieldErrors.aadhaar ? "has-error" : ""}`}
            value={profile.aadhaar}
            onChange={(e) =>
              handleProfileChange({
                aadhaar: e.target.value.replace(/\D/g, "").slice(0, 12),
              })
            }
            placeholder="Enter your Aadhaar number"
            maxLength={12}
          />
          {fieldErrors.aadhaar && (
            <span
              className="tds-field-error"
            >
              {fieldErrors.aadhaar}
            </span>
          )}
        </div>
        <div className="tds-form-group" style={{ position: "relative" }}>
          <label htmlFor="tds-profile-dob" className="tds-label">
            Date of Birth
          </label>
          <input
            id="tds-profile-dob"
            type="text"
            readOnly
            placeholder="DD-MM-YYYY"
            className="tds-input"
            style={{ cursor: "pointer" }}
            value={profile.dob ? (profile.dob.includes("-") && profile.dob.length === 10 ? profile.dob.split("-").reverse().join("-") : profile.dob) : ""}
            onClick={() => setIsDobPickerOpen((prev) => !prev)}
          />
          <DobDatePickerModal
            isOpen={isDobPickerOpen}
            title="Date of Birth"
            format="YYYY-MM-DD"
            value={profile.dob}
            maxDate={new Date()}
            onApply={(val) => handleProfileChange({ dob: val })}
            onClose={() => setIsDobPickerOpen(false)}
          />
        </div>
        <div className="tds-form-group">
          <label htmlFor="tds-profile-mobile" className="tds-label">
            Mobile Number
          </label>
          <input
            id="tds-profile-mobile"
            type="tel"
            className={`tds-input ${fieldErrors.mobile ? "has-error" : ""}`}
            value={profile.mobile}
            onChange={(e) =>
              handleProfileChange({
                mobile: formatMobile(e.target.value),
              })
            }
            placeholder="Enter your mobile number"
          />
          {fieldErrors.mobile && (
            <span
              className="tds-field-error"
            >
              {fieldErrors.mobile}
            </span>
          )}
        </div>
        <div className="tds-form-group">
          <label htmlFor="tds-profile-email" className="tds-label">
            Email Address
          </label>
          <input
            id="tds-profile-email"
            type="email"
            className={`tds-input ${fieldErrors.email ? "has-error" : ""}`}
            value={profile.email}
            onChange={(e) =>
              handleProfileChange({ email: e.target.value })
            }
            placeholder="Enter your email address"
          />
          {fieldErrors.email && (
            <span
              className="tds-field-error"
            >
              {fieldErrors.email}
            </span>
          )}
        </div>
        <div className="tds-form-group tds-form-group--full">
          <label htmlFor="tds-profile-address" className="tds-label">
            Address
          </label>
          <input
            id="tds-profile-address"
            type="text"
            className="tds-input"
            value={profile.address}
            onChange={(e) =>
              handleProfileChange({ address: e.target.value })
            }
            placeholder="Enter your address"
          />
        </div>
      </div>
    )}
  </div>
  )
}
