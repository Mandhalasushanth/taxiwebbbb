import React from 'react'
import { Home, Users, ChevronDown } from 'lucide-react'
import type { ProjectFinanceData } from '@modules/loans/types/projectFinance.types'

export interface OfficeAddressAndPromotersProps {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  isOfficeOpen: boolean
  onToggleOffice: () => void
  isPromotersOpen: boolean
  onTogglePromoters: () => void
  onOpenAddPromoter: () => void
  onRemovePromoter: (id: string, e: React.MouseEvent) => void
  errors?: Record<string, string>
}

export const OfficeAddressAndPromoters: React.FC<OfficeAddressAndPromotersProps> = ({
  data,
  onChange,
  isOfficeOpen,
  onToggleOffice,
  isPromotersOpen,
  onTogglePromoters,
  onOpenAddPromoter,
  onRemovePromoter,
  errors = {},
}) => {
  const promoters = data.promoters || []

  return (
    <>
      {/* 2. Registered Office Address Section */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleOffice}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile pf-section-icon-tile--orange">
              <Home size={20} />
            </div>
            <h3 className="pf-collapsible-title">Registered Office Address</h3>
          </div>
          <span className={`pf-chevron ${isOfficeOpen ? 'pf-chevron--open' : ''}`}>
            <ChevronDown size={18} />
          </span>
        </div>

        {isOfficeOpen && (
          <div className="pf-collapsible-body">
            {/* Address Line 1 */}
            <div className="pf-field-group">
              <label htmlFor="officeAddressLine1" className="pf-field-label">
                Address Line 1 <span className="pf-req">*</span>
              </label>
              <input
                id="officeAddressLine1"
                type="text"
                className={`pf-custom-input ${errors.officeAddressLine1 ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter address"
                value={data.officeAddressLine1 || ''}
                onChange={(e) => onChange({ officeAddressLine1: e.target.value })}
              />
              {errors.officeAddressLine1 && <span className="pf-field-error">{errors.officeAddressLine1}</span>}
            </div>

            {/* Address Line 2 */}
            <div className="pf-field-group">
              <label htmlFor="officeAddressLine2" className="pf-field-label">
                Address Line 2 (Optional)
              </label>
              <input
                id="officeAddressLine2"
                type="text"
                className="pf-custom-input"
                placeholder="Enter address (optional)"
                value={data.officeAddressLine2 || ''}
                onChange={(e) => onChange({ officeAddressLine2: e.target.value })}
              />
            </div>

            {/* State */}
            <div className="pf-field-group">
              <label htmlFor="officeState" className="pf-field-label">
                State <span className="pf-req">*</span>
              </label>
              <input
                id="officeState"
                type="text"
                className={`pf-custom-input ${errors.officeState ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter state"
                value={data.officeState || ''}
                onChange={(e) => onChange({ officeState: e.target.value })}
              />
              {errors.officeState && <span className="pf-field-error">{errors.officeState}</span>}
            </div>

            {/* District / City */}
            <div className="pf-field-group">
              <label htmlFor="officeDistrictCity" className="pf-field-label">
                District / City <span className="pf-req">*</span>
              </label>
              <input
                id="officeDistrictCity"
                type="text"
                className={`pf-custom-input ${errors.officeDistrictCity ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter district / city"
                value={data.officeDistrictCity || ''}
                onChange={(e) => onChange({ officeDistrictCity: e.target.value })}
              />
              {errors.officeDistrictCity && <span className="pf-field-error">{errors.officeDistrictCity}</span>}
            </div>

            {/* PIN Code */}
            <div className="pf-field-group">
              <label htmlFor="officePinCode" className="pf-field-label">
                PIN Code <span className="pf-req">*</span>
              </label>
              <input
                id="officePinCode"
                type="text"
                maxLength={6}
                inputMode="numeric"
                className={`pf-custom-input ${errors.officePinCode ? 'pf-custom-input--error' : ''}`}
                placeholder="Enter PIN code"
                value={data.officePinCode || ''}
                onChange={(e) => onChange({ officePinCode: e.target.value.replace(/\D/g, '') })}
              />
              {errors.officePinCode && <span className="pf-field-error">{errors.officePinCode}</span>}
            </div>
          </div>
        )}
      </div>

      {/* 3. Promoters / Sponsors Card Section */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onTogglePromoters}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile pf-section-icon-tile--orange">
              <Users size={20} />
            </div>
            <h3 className="pf-collapsible-title">Promoters / Sponsors</h3>
          </div>
          <span className={`pf-chevron ${isPromotersOpen ? 'pf-chevron--open' : ''}`}>
            <ChevronDown size={18} />
          </span>
        </div>

        {isPromotersOpen && (
          <div className="pf-collapsible-body">
            <p className="pf-section-subtext">Add the promoters / sponsors involved in this project.</p>

            <button
              type="button"
              className="pf-btn-add-promoter"
              onClick={onOpenAddPromoter}
            >
              <span className="pf-add-plus">+</span> Add Promoter / Sponsor
            </button>

            <div className="pf-promoter-cards-list">
              {promoters.map((p) => {
                const initials = p.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n.charAt(0))
                  .join('')
                  .toUpperCase() || 'PR'

                return (
                  <div key={p.id} className="pf-promoter-item-card">
                    <div className="pf-promoter-avatar">{initials}</div>
                    <div className="pf-promoter-info">
                      <span className="pf-promoter-name">{p.name}</span>
                      <span className="pf-promoter-cat">{p.category}</span>
                    </div>
                    <div className="pf-promoter-share-wrap">
                      <span className="pf-promoter-percent">{p.shareholdingPercent}%</span>
                      <button
                        type="button"
                        className="pf-promoter-remove-btn"
                        title="Remove promoter"
                        onClick={(e) => onRemovePromoter(p.id, e)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
