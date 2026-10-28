import React, { useState } from 'react'
import { useAuthStore } from '@store/index'
import { authStorage, userRepository } from '@core/auth'
import { LogoutConfirmModal } from '@shared/components'
import { useLogoutConfirm } from '@modules/authentication'
import { PASSCODE_LENGTH, validateNewPasscode, validateConfirmPasscode } from '@modules/authentication/validation/passcodeValidation'
import './Settings.css'

const STORAGE_KEY_NOTIFICATIONS = 'taxedge_push_notifications_enabled'

// Icons

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
)

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const IconKey = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-1.5 1.5L14 9l-2-2-4 4 2 2-3 3-2-2L2 17l4 4 3-3-2-2 3-3 2 2 4-4-2-2 3.5-3.5"></path>
    <circle cx="17.5" cy="6.5" r="2.5"></circle>
  </svg>
)

const IconLogout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
)

const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
)

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

export const Settings = () => {
  const storeUser = useAuthStore((state) => state.user)
  const user = storeUser || authStorage.getUser()

  // Push notifications toggle state
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS)
      return stored !== null ? stored === 'true' : true
    } catch {
      return true
    }
  })

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Passcode modal state
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false)
  const [newPasscode, setNewPasscode] = useState('')
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [showDigits, setShowDigits] = useState(false)
  const [passcodeError, setPasscodeError] = useState<string | null>(null)
  const [isSavingPasscode, setIsSavingPasscode] = useState(false)
  const [passcodeSuccess, setPasscodeSuccess] = useState(false)

  // Logout confirm modal hook
  const logout = useLogoutConfirm()

  const handleToggleNotifications = () => {
    const nextState = !notificationsEnabled
    setNotificationsEnabled(nextState)
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, String(nextState))
    } catch {
      // Ignored in non-browser environments
    }
    showToast(nextState ? 'Push notifications enabled' : 'Push notifications disabled')
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 2800)
  }

  const handleOpenPasscodeModal = () => {
    setNewPasscode('')
    setConfirmPasscode('')
    setPasscodeError(null)
    setPasscodeSuccess(false)
    setIsPasscodeModalOpen(true)
  }

  const handleClosePasscodeModal = () => {
    if (isSavingPasscode) return
    setIsPasscodeModalOpen(false)
    setNewPasscode('')
    setConfirmPasscode('')
    setPasscodeError(null)
    setPasscodeSuccess(false)
  }

  const handleSavePasscode = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasscodeError(null)

    const mobile = user?.mobile || ''
    const errNew = validateNewPasscode(newPasscode, mobile)
    if (errNew) {
      setPasscodeError(errNew)
      return
    }

    const errConfirm = validateConfirmPasscode(newPasscode, confirmPasscode)
    if (errConfirm) {
      setPasscodeError(errConfirm)
      return
    }

    try {
      setIsSavingPasscode(true)
      if (mobile) {
        userRepository.savePasscodeState(mobile, newPasscode)
      }
      setPasscodeSuccess(true)
      showToast('Security passcode updated successfully')
      setTimeout(() => {
        handleClosePasscodeModal()
      }, 1500)
    } catch {
      setPasscodeError('Failed to save passcode. Please try again.')
    } finally {
      setIsSavingPasscode(false)
    }
  }

  return (
    <div className="settings-page" data-testid="settings-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="settings-toast" role="status" aria-live="polite">
          <IconCheck />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="settings-page__header">
        <h1 className="settings-page__title">Appearance &amp; Settings</h1>
        <p className="settings-page__subtitle">
          Manage your notification preferences and account security
        </p>
      </div>

      {/* Main Settings Content */}
      <div className="settings-page__content">
        {/* ==================== 1. PREFERENCES SECTION ==================== */}
        <section className="settings-section" aria-labelledby="preferences-title">
          <div className="settings-section__header-row">
            <span className="settings-section__header-icon settings-section__header-icon--blue">
              <IconBell />
            </span>
            <h2 id="preferences-title" className="settings-section__header-title">
              PREFERENCES
            </h2>
          </div>

          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row__label-group">
                <span className="settings-row__label">Push Notifications</span>
                <span className="settings-row__sublabel">
                  Filing alerts and deadline reminders
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notificationsEnabled}
                aria-label="Toggle push notifications"
                className={`settings-switch ${notificationsEnabled ? 'settings-switch--active' : ''}`}
                onClick={handleToggleNotifications}
              >
                <span className="settings-switch__thumb" />
              </button>
            </div>

            <div className="settings-card__footer-info">
              <IconInfo />
              <span>
                {notificationsEnabled
                  ? 'Push notifications are active. You will receive real-time alerts for upcoming tax deadlines, filing updates, and system notices.'
                  : 'Notifications are paused. You will not receive automatic alerts for upcoming deadlines.'}
              </span>
            </div>
          </div>
        </section>

        {/* ==================== 2. SECURITY SECTION ==================== */}
        <section className="settings-section" aria-labelledby="security-title">
          <div className="settings-section__header-row">
            <span className="settings-section__header-icon settings-section__header-icon--shield">
              <IconShield />
            </span>
            <h2 id="security-title" className="settings-section__header-title">
              SECURITY
            </h2>
          </div>

          <div className="settings-card">
            {/* Change Passcode Row */}
            <button
              type="button"
              className="settings-action-row"
              onClick={handleOpenPasscodeModal}
            >
              <div className="settings-action-row__icon-box settings-action-row__icon-box--purple">
                <IconKey />
              </div>
              <div className="settings-action-row__label-group">
                <span className="settings-action-row__label">Change Passcode</span>
                <span className="settings-action-row__sublabel">
                  Update your 6-digit security PIN
                </span>
              </div>
              <span className="settings-action-row__chevron">
                <IconChevronRight />
              </span>
            </button>

            <div className="settings-card__divider" />

            {/* Logout Row */}
            <button
              type="button"
              className="settings-action-row settings-action-row--danger"
              onClick={logout.requestLogout}
            >
              <div className="settings-action-row__icon-box settings-action-row__icon-box--red">
                <IconLogout />
              </div>
              <div className="settings-action-row__label-group">
                <span className="settings-action-row__label settings-action-row__label--danger">
                  Logout
                </span>
                <span className="settings-action-row__sublabel">
                  Sign out of your active session
                </span>
              </div>
              <span className="settings-action-row__chevron settings-action-row__chevron--danger">
                <IconLogout />
              </span>
            </button>
          </div>
        </section>

        {/* ==================== 3. APP INFORMATION ==================== */}
        <div className="settings-app-info">
          <span className="settings-app-info__title">TaxEdge Fin Solutions • v1.0.0</span>
          <span className="settings-app-info__meta">
            Encrypted connection • Bank-grade 256-bit SSL security
          </span>
        </div>
      </div>

      {/* Change Passcode Modal */}
      {isPasscodeModalOpen && (
        <div className="settings-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="passcode-modal-title">
          <div className="settings-modal">
            <div className="settings-modal__header">
              <div className="settings-modal__title-row">
                <div className="settings-modal__icon-badge">
                  <IconKey />
                </div>
                <div>
                  <h3 id="passcode-modal-title" className="settings-modal__title">Change Security Passcode</h3>
                  <p className="settings-modal__subtitle">Update your 6-digit security PIN</p>
                </div>
              </div>
              <button
                type="button"
                className="settings-modal__close-btn"
                onClick={handleClosePasscodeModal}
                disabled={isSavingPasscode}
                aria-label="Close dialog"
              >
                <IconClose />
              </button>
            </div>

            {passcodeSuccess ? (
              <div className="settings-modal__success-body">
                <div className="settings-modal__success-icon">
                  <IconCheck />
                </div>
                <h4 className="settings-modal__success-title">Passcode Updated</h4>
                <p className="settings-modal__success-subtitle">
                  Your new 6-digit PIN has been saved securely.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSavePasscode} className="settings-modal__form">
                <div className="settings-modal__field">
                  <div className="settings-modal__field-header">
                    <label htmlFor="new-passcode-input" className="settings-modal__label">
                      New 6-Digit Passcode
                    </label>
                    <button
                      type="button"
                      className="settings-modal__toggle-visibility"
                      onClick={() => setShowDigits((prev) => !prev)}
                    >
                      {showDigits ? 'Hide PIN' : 'Show PIN'}
                    </button>
                  </div>
                  <input
                    id="new-passcode-input"
                    type={showDigits ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={PASSCODE_LENGTH}
                    pattern="[0-9]*"
                    autoComplete="new-password"
                    value={newPasscode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setNewPasscode(val)
                      setPasscodeError(null)
                    }}
                    placeholder="Enter 6 digits"
                    className={`settings-modal__input ${passcodeError ? 'settings-modal__input--error' : ''}`}
                    autoFocus
                  />
                </div>

                <div className="settings-modal__field">
                  <label htmlFor="confirm-passcode-input" className="settings-modal__label">
                    Confirm New Passcode
                  </label>
                  <input
                    id="confirm-passcode-input"
                    type={showDigits ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={PASSCODE_LENGTH}
                    pattern="[0-9]*"
                    autoComplete="new-password"
                    value={confirmPasscode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      setConfirmPasscode(val)
                      setPasscodeError(null)
                    }}
                    placeholder="Re-enter 6 digits"
                    className={`settings-modal__input ${passcodeError ? 'settings-modal__input--error' : ''}`}
                  />
                </div>

                {passcodeError && (
                  <div className="settings-modal__error-box">
                    <span>{passcodeError}</span>
                  </div>
                )}

                <div className="settings-modal__hint-box">
                  <IconInfo />
                  <span>Choose 6 numbers that are easy for you to remember and hard for others to guess. Avoid repeating digits (e.g. 111111).</span>
                </div>

                <div className="settings-modal__actions">
                  <button
                    type="button"
                    className="settings-modal__btn-secondary"
                    onClick={handleClosePasscodeModal}
                    disabled={isSavingPasscode}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="settings-modal__btn-primary"
                    disabled={newPasscode.length !== PASSCODE_LENGTH || confirmPasscode.length !== PASSCODE_LENGTH || isSavingPasscode}
                  >
                    {isSavingPasscode ? 'Saving...' : 'Update Passcode'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={logout.isConfirmOpen}
        isLoggingOut={logout.isLoggingOut}
        onCancel={logout.cancelLogout}
        onConfirm={logout.confirmLogout}
      />
    </div>
  )
}

export default Settings
