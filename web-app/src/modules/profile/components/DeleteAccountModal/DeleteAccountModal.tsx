import React, { useEffect, useRef, useState } from "react";
import "./DeleteAccountModal.css";

export interface DeleteAccountModalProps {
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
    stroke="#64748b"
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

const CrossCircleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="9" fill="#dc2626" />
    <path
      d="M7 7L13 13M13 7L7 13"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="9" fill="#10b981" />
    <path
      d="M6 10.5L8.5 13L14 7.5"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  isDeleting = false,
  onClose,
  onConfirm,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsConfirmed(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    cancelBtnRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="delete-account-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-modal-title"
      onClick={() => {
        if (!isDeleting) onClose();
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
          <button
            type="button"
            className="delete-account-modal__close-btn"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close"
            data-testid="delete-account-close-btn"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body */}
        <div className="delete-account-modal__body">
          {/* Permanent Action Warning Box */}
          <div className="delete-account-modal__alert-box">
            <div className="delete-account-modal__alert-title-row">
              <WarningTriangleIcon />
              <span className="delete-account-modal__alert-title">
                Permanent Action
              </span>
            </div>
            <p className="delete-account-modal__alert-text">
              Deleting your Finsolz account is irreversible. You will lose access
              to your application tracking and profile records.
            </p>
          </div>

          {/* Checklist of consequences */}
          <div className="delete-account-modal__list">
            <div className="delete-account-modal__list-item">
              <div className="delete-account-modal__list-icon">
                <CrossCircleIcon />
              </div>
              <span className="delete-account-modal__list-text">
                All profile data, PAN, and KYC details will be unlinked.
              </span>
            </div>

            <div className="delete-account-modal__list-item">
              <div className="delete-account-modal__list-icon">
                <CrossCircleIcon />
              </div>
              <span className="delete-account-modal__list-text">
                Your active mobile authentication session will be revoked.
              </span>
            </div>

            <div className="delete-account-modal__list-item">
              <div className="delete-account-modal__list-icon">
                <CheckCircleIcon />
              </div>
              <span className="delete-account-modal__list-text">
                Government filings already processed with authorities remain
                legally archived.
              </span>
            </div>
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
                isConfirmed ? "delete-account-modal__checkbox-custom--checked" : ""
              }`}
              aria-hidden="true"
            >
              {isConfirmed && (
                <svg
                  width="12"
                  height="12"
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
              I understand this will permanently delete my Finsolz account.
            </span>
          </label>

          {/* Action buttons */}
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
                !isConfirmed ? "delete-account-modal-confirm-btn--disabled" : ""
              }`}
              onClick={onConfirm}
              disabled={!isConfirmed || isDeleting}
              data-testid="delete-account-confirm-btn"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
