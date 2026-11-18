import React, { useEffect, useRef, useState } from "react";
import "./DeleteAccountModal.css";

export const ACCOUNT_DELETION_STORAGE_KEY = "taxedge_account_deletion_scheduled";

export const DELETION_REASONS = [
  "I no longer need this service",
  "Privacy & security concerns",
  "Too complex / hard to use",
  "Switching to another service",
  "Other reasons",
] as const;

export const calculate60DaysDeletionDate = (baseDate = new Date()): string => {
  const target = new Date(baseDate.getTime());
  target.setDate(target.getDate() + 60);
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export interface DeleteAccountModalProps {
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

const TrashIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ef4444"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#475569"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const WarningTriangleIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 2.5L1.5 20.5C1.1 21.2 1.6 22 2.4 22H21.6C22.4 22 22.9 21.2 22.5 20.5L12 2.5Z"
      fill="#dc2626"
    />
    <path
      d="M12 8.5V13.5"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="17" r="1.25" fill="#ffffff" />
  </svg>
);

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  isDeleting: externalIsDeleting = false,
  onClose,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState<boolean>(false);
  const [internalIsDeleting, setInternalIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDeleting = externalIsDeleting || internalIsDeleting;
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const popupCancelBtnRef = useRef<HTMLButtonElement>(null);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedReason(null);
      setExplanation("");
      setIsConfirmed(false);
      setIsConfirmPopupOpen(false);
      setInternalIsDeleting(false);
      setErrorMessage(null);
      return;
    }
    cancelBtnRef.current?.focus();
  }, [isOpen]);

  // Focus popup cancel button when popup opens
  useEffect(() => {
    if (isConfirmPopupOpen) {
      popupCancelBtnRef.current?.focus();
    }
  }, [isConfirmPopupOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        if (isConfirmPopupOpen) {
          setIsConfirmPopupOpen(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, isConfirmPopupOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectReason = (reason: string) => {
    setSelectedReason(reason);
    setExplanation(reason);
  };

  const handleExplanationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value.slice(0, 300);
    setExplanation(value);
  };

  // Both conditions required
  const canProceedToDelete =
    Boolean(selectedReason && selectedReason.trim().length > 0) && isConfirmed;

  const handleOpenConfirmPopup = () => {
    if (!canProceedToDelete || isDeleting) return;
    setErrorMessage(null);
    setIsConfirmPopupOpen(true);
  };

  const handleCloseConfirmPopup = () => {
    if (isDeleting) return;
    setIsConfirmPopupOpen(false);
  };

  const handleDeleteForever = async () => {
    if (isDeleting) return;
    setInternalIsDeleting(true);
    setErrorMessage(null);

    try {
      const scheduledDate = calculate60DaysDeletionDate();
      const payload = {
        scheduledDate,
        reason: selectedReason,
        explanation,
        requestedAt: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem(
          ACCOUNT_DELETION_STORAGE_KEY,
          JSON.stringify(payload)
        );
      } catch (storageErr) {
        console.warn("Unable to save to sessionStorage:", storageErr);
      }

      await onConfirm();
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Failed to schedule account deletion. Please try again."
      );
      setInternalIsDeleting(false);
    }
  };

  return (
    <div
      className="delete-account-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-modal-title"
      onClick={() => {
        if (!isDeleting && !isConfirmPopupOpen) onClose();
      }}
      data-testid="delete-account-modal-overlay"
    >
      <div
        className="delete-account-modal-card"
        onClick={(e) => e.stopPropagation()}
        data-testid="delete-account-modal-card"
      >
        {/* Header */}
        <div className="delete-account-modal__header">
          <div className="delete-account-modal__header-left">
            <div className="delete-account-modal__icon-badge">
              <TrashIcon />
            </div>
            <h3
              id="delete-account-modal-title"
              className="delete-account-modal-title"
            >
              Delete Account
            </h3>
          </div>
        </div>

        {/* Reason Section */}
        <div className="delete-account-modal__reason-section">
          <div className="delete-account-modal__reason-header">
            <span className="delete-account-modal__reason-title">
              Why are you deleting your account?
              <span
                className="required-star delete-account-modal__required-star"
                aria-label="required"
                data-testid="delete-account-required-star"
              >
                *
              </span>
            </span>
          </div>

          <div
            className="delete-account-modal__reason-chips"
            role="radiogroup"
            aria-label="Reason for deleting account"
          >
            {/* Row 1: 2 reasons */}
            <div className="delete-account-modal__reason-row">
              {DELETION_REASONS.slice(0, 2).map((reason, rowIdx) => {
                const index = rowIdx;
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`delete-account-modal__reason-chip ${
                      isSelected
                        ? "delete-account-modal__reason-chip--selected"
                        : ""
                    }`}
                    onClick={() => handleSelectReason(reason)}
                    disabled={isDeleting}
                    data-testid={`delete-account-reason-${index}`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>

            {/* Row 2: 3 reasons */}
            <div className="delete-account-modal__reason-row">
              {DELETION_REASONS.slice(2).map((reason, rowIdx) => {
                const index = rowIdx + 2;
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`delete-account-modal__reason-chip ${
                      isSelected
                        ? "delete-account-modal__reason-chip--selected"
                        : ""
                    }`}
                    onClick={() => handleSelectReason(reason)}
                    disabled={isDeleting}
                    data-testid={`delete-account-reason-${index}`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Explanation Text Area */}
        <div className="delete-account-modal__textarea-wrapper">
          <textarea
            className="delete-account-modal__textarea"
            placeholder="Tell us more about your reason (optional additional details)..."
            value={explanation}
            onChange={handleExplanationChange}
            maxLength={300}
            rows={2}
            disabled={isDeleting}
            data-testid="delete-account-explanation-textarea"
            aria-label="Additional details"
          />
          <div
            className="delete-account-modal__char-counter"
            data-testid="delete-account-char-counter"
          >
            {explanation.length}/300
          </div>
        </div>

        {/* Permanent Action Warning Box */}
        <div
          className="delete-account-modal__alert-box"
          data-testid="delete-account-warning-box"
        >
          <div className="delete-account-modal__alert-title-row">
            <WarningTriangleIcon />
            <span className="delete-account-modal__alert-title">
              Permanent Action – 60-Day Grace Period
            </span>
          </div>
          <p className="delete-account-modal__alert-subtitle">
            Your data will be retained for 60 days before permanent erasure:
          </p>
          <ul className="delete-account-modal__alert-bullets">
            <li>
              All profile records, application tracking, and filings will be
              permanently erased.
            </li>
            <li>
              Your registered mobile number will be blocked from logging in
              during this period.
            </li>
            <li>
              All KYC, PAN, and Aadhaar associations will be permanently
              unlinked.
            </li>
            <li>
              Active mobile authentication sessions will be immediately
              revoked.
            </li>
          </ul>
        </div>

        {/* Checkbox confirmation */}
        <label className="delete-account-modal__checkbox-container">
          <input
            type="checkbox"
            className="delete-account-modal__checkbox-input"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            disabled={isDeleting}
            data-testid="delete-account-understand-checkbox"
          />
          <span
            className={`delete-account-modal__checkbox-custom ${
              isConfirmed
                ? "delete-account-modal__checkbox-custom--checked"
                : ""
            }`}
            aria-hidden="true"
          >
            {isConfirmed && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 12 12"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="2 6 4.5 9 10 3" />
              </svg>
            )}
          </span>
          <span className="delete-account-modal__checkbox-text">
            I understand that my account will be permanently deleted after 60
            days, and my mobile number will be blocked.
          </span>
        </label>

        {/* Main Action buttons */}
        <div className="delete-account-modal-actions">
          <button
            ref={cancelBtnRef}
            type="button"
            className="delete-account-modal-cancel-btn"
            onClick={onClose}
            disabled={isDeleting}
            data-testid="delete-account-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            className={`delete-account-modal-confirm-btn ${
              !canProceedToDelete
                ? "delete-account-modal-confirm-btn--disabled"
                : ""
            }`}
            onClick={handleOpenConfirmPopup}
            disabled={!canProceedToDelete || isDeleting}
            data-testid="delete-account-confirm-btn"
            aria-disabled={!canProceedToDelete || isDeleting}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* First Confirmation Popup: Confirm Account Deletion */}
      {isConfirmPopupOpen && (
        <div
          className="delete-account-confirm-popup-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-deletion-title"
          aria-describedby="confirm-deletion-message"
          onClick={handleCloseConfirmPopup}
          data-testid="confirm-deletion-popup-overlay"
        >
          <div
            className="delete-account-confirm-popup-card"
            onClick={(e) => e.stopPropagation()}
            data-testid="confirm-deletion-popup-card"
          >
            <div className="delete-account-confirm-popup__header">
              <h4
                id="confirm-deletion-title"
                className="delete-account-confirm-popup__title"
              >
                Confirm Account Deletion
              </h4>
              <button
                type="button"
                className="delete-account-confirm-popup__close-btn"
                onClick={handleCloseConfirmPopup}
                disabled={isDeleting}
                aria-label="Close confirmation"
                data-testid="confirm-deletion-close-btn"
              >
                <CloseIcon />
              </button>
            </div>

            <p
              id="confirm-deletion-message"
              className="delete-account-confirm-popup__message"
            >
              Your account and data will be scheduled for permanent deletion in
              60 days. Your mobile number will be blocked from logging in
              during this period. Are you sure you want to proceed?
            </p>

            {errorMessage && (
              <div
                className="delete-account-confirm-popup__error"
                role="alert"
                data-testid="confirm-deletion-error"
              >
                {errorMessage}
              </div>
            )}

            <div className="delete-account-confirm-popup__actions">
              <button
                ref={popupCancelBtnRef}
                type="button"
                className="delete-account-confirm-popup__cancel-btn"
                onClick={handleCloseConfirmPopup}
                disabled={isDeleting}
                data-testid="confirm-deletion-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-account-confirm-popup__delete-btn"
                onClick={handleDeleteForever}
                disabled={isDeleting}
                data-testid="confirm-deletion-forever-btn"
              >
                {isDeleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccountModal;
