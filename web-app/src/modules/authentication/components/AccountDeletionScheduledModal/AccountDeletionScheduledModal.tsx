import React, { useEffect, useRef } from "react";
import "./AccountDeletionScheduledModal.css";

export interface AccountDeletionScheduledModalProps {
  isOpen: boolean;
  scheduledDate: string;
  onDismiss: () => void;
}

const GreenCheckmarkIcon = () => (
  <div className="account-deletion-scheduled-modal__icon-wrap">
    <div className="account-deletion-scheduled-modal__icon-circle">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  </div>
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

export const AccountDeletionScheduledModal: React.FC<
  AccountDeletionScheduledModalProps
> = ({ isOpen, scheduledDate, onDismiss }) => {
  const okBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    okBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  return (
    <div
      className="account-deletion-scheduled-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-deletion-scheduled-title"
      aria-describedby="account-deletion-scheduled-desc"
      onClick={onDismiss}
      data-testid="deletion-scheduled-modal-overlay"
    >
      <div
        className="account-deletion-scheduled-modal-card"
        onClick={(e) => e.stopPropagation()}
        data-testid="deletion-scheduled-modal-card"
      >
        <button
          type="button"
          className="account-deletion-scheduled-modal__close-btn"
          onClick={onDismiss}
          aria-label="Close"
          data-testid="deletion-scheduled-close-btn"
        >
          <CloseIcon />
        </button>

        <div className="account-deletion-scheduled-modal__content">
          <GreenCheckmarkIcon />

          <h3
            id="account-deletion-scheduled-title"
            className="account-deletion-scheduled-modal__title"
          >
            Account Deletion Scheduled
          </h3>

          <p
            id="account-deletion-scheduled-desc"
            className="account-deletion-scheduled-modal__message"
          >
            Account deletion requested successfully. Your account and data will
            be permanently deleted after 60 days on{" "}
            <span
              className="account-deletion-scheduled-modal__date"
              data-testid="deletion-scheduled-date"
            >
              {scheduledDate}
            </span>
            . Your mobile number is blocked from logging in during this period.
          </p>

          <button
            ref={okBtnRef}
            type="button"
            className="account-deletion-scheduled-modal__ok-btn"
            onClick={onDismiss}
            data-testid="deletion-scheduled-ok-btn"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionScheduledModal;
