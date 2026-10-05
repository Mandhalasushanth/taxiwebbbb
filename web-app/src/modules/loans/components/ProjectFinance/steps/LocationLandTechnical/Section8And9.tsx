import React from 'react'
import { Users, FileText } from 'lucide-react'
import type { ProjectFinanceData, PlantMachineryItem, RawMaterialItem } from '@modules/loans/types/projectFinance.types'
import {
  MACHINERY_CATEGORY_OPTIONS,
  RAW_MATERIAL_SOURCE_OPTIONS,
  RAW_MATERIAL_UNIT_OPTIONS,
} from './locationLandTechnicalConstants'

export interface Section8And9Props {
  data: ProjectFinanceData
  onChange: (fields: Partial<ProjectFinanceData>) => void
  isMachineryOpen: boolean
  onToggleMachinery: () => void
  isRawMaterialOpen: boolean
  onToggleRawMaterial: () => void
  onOpenPicker?: (picker: string) => void
}

export const Section8And9: React.FC<Section8And9Props> = ({
  data,
  onChange,
  isMachineryOpen,
  onToggleMachinery,
  isRawMaterialOpen,
  onToggleRawMaterial,
}) => {
  const machineryList: PlantMachineryItem[] = data.plantMachineryList && data.plantMachineryList.length > 0
    ? data.plantMachineryList
    : [
        {
          id: '1',
          machineryName: '',
          category: '',
          manufacturerSupplier: '',
          quantity: '',
          unitCost: '',
          totalCost: '',
        },
      ]

  const rawMaterials: RawMaterialItem[] = data.rawMaterialList && data.rawMaterialList.length > 0
    ? data.rawMaterialList
    : [
        {
          id: '1',
          mainRawMaterial: '',
          source: '',
          supplier: '',
          annualRequirement: '',
          unit: '',
          hasSupplyAgreement: false,
        },
      ]

  const handleAddMachinery = () => {
    const newItem: PlantMachineryItem = {
      id: `machinery_${Date.now()}`,
      machineryName: '',
      category: '',
      manufacturerSupplier: '',
      quantity: '',
      unitCost: '',
      totalCost: '',
    }
    onChange({ plantMachineryList: [...machineryList, newItem] })
  }

  const handleUpdateMachinery = (index: number, fields: Partial<PlantMachineryItem>) => {
    const updated = machineryList.map((item, idx) => {
      if (idx !== index) return item
      const merged = { ...item, ...fields }
      const qty = parseFloat(merged.quantity || '0') || 0
      const cost = parseFloat(merged.unitCost || '0') || 0
      merged.totalCost = qty && cost ? (qty * cost).toFixed(2) : ''
      return merged
    })
    onChange({ plantMachineryList: updated })
  }

  const handleRemoveMachinery = (index: number) => {
    if (machineryList.length <= 1) return
    onChange({ plantMachineryList: machineryList.filter((_, idx) => idx !== index) })
  }

  const handleAddRawMaterial = () => {
    const newItem: RawMaterialItem = {
      id: `raw_${Date.now()}`,
      mainRawMaterial: '',
      source: '',
      supplier: '',
      annualRequirement: '',
      unit: '',
      hasSupplyAgreement: false,
    }
    onChange({ rawMaterialList: [...rawMaterials, newItem] })
  }

  const handleUpdateRawMaterial = (index: number, fields: Partial<RawMaterialItem>) => {
    const updated = rawMaterials.map((item, idx) => (idx === index ? { ...item, ...fields } : item))
    onChange({ rawMaterialList: updated })
  }

  const handleRemoveRawMaterial = (index: number) => {
    if (rawMaterials.length <= 1) return
    onChange({ rawMaterialList: rawMaterials.filter((_, idx) => idx !== index) })
  }

  return (
    <>
      {/* 8. Plant & Machinery */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleMachinery}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <Users size={20} />
            </div>
            <h3 className="pf-collapsible-title">8. Plant & Machinery</h3>
          </div>
          <button
            type="button"
            className="pf-btn-add-parcel"
            onClick={(e) => {
              e.stopPropagation()
              handleAddMachinery()
            }}
          >
            + Add Machinery
          </button>
        </div>

        {isMachineryOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-parcels-list">
              {machineryList.map((item, idx) => (
                <div key={item.id} className="pf-parcel-card">
                  <div className="pf-parcel-card__header">
                    <h4 className="pf-parcel-card__title">Machinery {idx + 1}</h4>
                    {machineryList.length > 1 && (
                      <button
                        type="button"
                        className="pf-parcel-btn-remove"
                        onClick={() => handleRemoveMachinery(idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`machineryName_${idx}`} className="pf-field-label">Machinery Name <span className="pf-req">*</span></label>
                    <input
                      id={`machineryName_${idx}`}
                      type="text"
                      className="pf-custom-input"
                      placeholder="Enter machinery name"
                      value={item.machineryName || ''}
                      onChange={(e) => handleUpdateMachinery(idx, { machineryName: e.target.value })}
                    />
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`machineryCategory_${idx}`} className="pf-field-label">Category <span className="pf-req">*</span></label>
                    <select
                      id={`machineryCategory_${idx}`}
                      className="pf-custom-select"
                      value={item.category || ''}
                      onChange={(e) => handleUpdateMachinery(idx, { category: e.target.value })}
                    >
                      <option value="" disabled>Select category</option>
                      {MACHINERY_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`machinerySupplier_${idx}`} className="pf-field-label">Manufacturer / Supplier <span className="pf-req">*</span></label>
                    <input
                      id={`machinerySupplier_${idx}`}
                      type="text"
                      className="pf-custom-input"
                      placeholder="Enter manufacturer / supplier"
                      value={item.manufacturerSupplier || ''}
                      onChange={(e) => handleUpdateMachinery(idx, { manufacturerSupplier: e.target.value })}
                    />
                  </div>

                  <div className="pf-grid-3">
                    <div className="pf-field-group">
                      <label htmlFor={`machineryQty_${idx}`} className="pf-field-label">Quantity <span className="pf-req">*</span></label>
                      <input
                        id={`machineryQty_${idx}`}
                        type="text"
                        className="pf-custom-input"
                        placeholder="Enter quantity"
                        value={item.quantity || ''}
                        onChange={(e) => handleUpdateMachinery(idx, { quantity: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>

                    <div className="pf-field-group">
                      <label htmlFor={`machineryUnitCost_${idx}`} className="pf-field-label">Unit Cost (₹) <span className="pf-req">*</span></label>
                      <input
                        id={`machineryUnitCost_${idx}`}
                        type="text"
                        className="pf-custom-input"
                        placeholder="Enter unit cost"
                        value={item.unitCost || ''}
                        onChange={(e) => handleUpdateMachinery(idx, { unitCost: e.target.value.replace(/[^\d.]/g, '') })}
                      />
                    </div>

                    <div className="pf-field-group">
                      <label htmlFor={`machineryTotalCost_${idx}`} className="pf-field-label">Total Cost (₹)</label>
                      <input
                        id={`machineryTotalCost_${idx}`}
                        type="text"
                        className="pf-custom-input pf-custom-input--disabled"
                        placeholder="Auto"
                        value={item.totalCost || ''}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 9. Raw Material / Inputs */}
      <div className="pf-collapsible-card">
        <div className="pf-collapsible-header" onClick={onToggleRawMaterial}>
          <div className="pf-collapsible-header__left">
            <div className="pf-section-icon-tile">
              <FileText size={20} />
            </div>
            <h3 className="pf-collapsible-title">9. Raw Material / Inputs</h3>
          </div>
          <button
            type="button"
            className="pf-btn-add-parcel"
            onClick={(e) => {
              e.stopPropagation()
              handleAddRawMaterial()
            }}
          >
            + Add Material
          </button>
        </div>

        {isRawMaterialOpen && (
          <div className="pf-collapsible-body">
            <div className="pf-parcels-list">
              {rawMaterials.map((item, idx) => (
                <div key={item.id} className="pf-parcel-card">
                  <div className="pf-parcel-card__header">
                    <h4 className="pf-parcel-card__title">Material {idx + 1}</h4>
                    {rawMaterials.length > 1 && (
                      <button
                        type="button"
                        className="pf-parcel-btn-remove"
                        onClick={() => handleRemoveRawMaterial(idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="pf-field-group">
                    <label htmlFor={`materialName_${idx}`} className="pf-field-label">Main Raw Material <span className="pf-req">*</span></label>
                    <input
                      id={`materialName_${idx}`}
                      type="text"
                      className="pf-custom-input"
                      placeholder="Enter material name"
                      value={item.mainRawMaterial || ''}
                      onChange={(e) => handleUpdateRawMaterial(idx, { mainRawMaterial: e.target.value })}
                    />
                  </div>

                  <div className="pf-grid-2">
                    <div className="pf-field-group">
                      <label htmlFor={`rawSource_${idx}`} className="pf-field-label">Source <span className="pf-req">*</span></label>
                      <select
                        id={`rawSource_${idx}`}
                        className="pf-custom-select"
                        value={item.source || ''}
                        onChange={(e) => handleUpdateRawMaterial(idx, { source: e.target.value })}
                      >
                        <option value="" disabled>Select source</option>
                        {RAW_MATERIAL_SOURCE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="pf-field-group">
                      <label htmlFor={`rawSupplier_${idx}`} className="pf-field-label">Supplier <span className="pf-req">*</span></label>
                      <input
                        id={`rawSupplier_${idx}`}
                        type="text"
                        className="pf-custom-input"
                        placeholder="Enter supplier"
                        value={item.supplier || ''}
                        onChange={(e) => handleUpdateRawMaterial(idx, { supplier: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pf-grid-2">
                    <div className="pf-field-group">
                      <label htmlFor={`rawAnnualReq_${idx}`} className="pf-field-label">Annual Requirement <span className="pf-req">*</span></label>
                      <input
                        id={`rawAnnualReq_${idx}`}
                        type="text"
                        className="pf-custom-input"
                        placeholder="Enter quantity"
                        value={item.annualRequirement || ''}
                        onChange={(e) => handleUpdateRawMaterial(idx, { annualRequirement: e.target.value.replace(/[^\d.]/g, '') })}
                      />
                    </div>

                    <div className="pf-field-group">
                      <label htmlFor={`rawUnit_${idx}`} className="pf-field-label">Unit <span className="pf-req">*</span></label>
                      <select
                        id={`rawUnit_${idx}`}
                        className="pf-custom-select"
                        value={item.unit || ''}
                        onChange={(e) => handleUpdateRawMaterial(idx, { unit: e.target.value })}
                      >
                        <option value="" disabled>Select unit</option>
                        {RAW_MATERIAL_UNIT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pf-field-group">
                    <label className="pf-field-label">Supply Agreement?</label>
                    <div className="pf-radio-group">
                      <label className="pf-radio-label">
                        <input
                          type="radio"
                          name={`raw_supply_agree_${item.id || idx}`}
                          className="pf-radio-input"
                          checked={item.hasSupplyAgreement === true}
                          onChange={() => handleUpdateRawMaterial(idx, { hasSupplyAgreement: true })}
                        />
                        <div className="pf-radio-custom">
                          <div className="pf-radio-custom-dot" />
                        </div>
                        <span>Yes</span>
                      </label>
                      <label className="pf-radio-label">
                        <input
                          type="radio"
                          name={`raw_supply_agree_${item.id || idx}`}
                          className="pf-radio-input"
                          checked={item.hasSupplyAgreement === false}
                          onChange={() => handleUpdateRawMaterial(idx, { hasSupplyAgreement: false })}
                        />
                        <div className="pf-radio-custom">
                          <div className="pf-radio-custom-dot" />
                        </div>
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
