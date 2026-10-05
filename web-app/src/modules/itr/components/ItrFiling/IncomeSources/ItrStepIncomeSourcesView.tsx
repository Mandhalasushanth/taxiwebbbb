import React from 'react'
import { StepActionBar } from '@shared/components'
import { ItrStepHeaderStepper } from '../ItrStepHeaderStepper'
import './ItrStepIncomeSourcesView.css'
import {
  ALL_SOURCES,
  type SalaryDetails,
  type HousePropertyDetails,
  type BusinessDetails,
  type CapitalGainsDetails,
  type OtherSourcesDetails,
} from '../itrFiling.constants'
import {
  ItrSalaryIncomeCard,
  ItrHousePropertyCard,
  ItrBusinessIncomeCard,
  ItrCapitalGainsCard,
  ItrOtherSourcesCard,
} from './ItrIncomeSourceCards'

export type {
  SalaryDetails,
  HousePropertyDetails,
  BusinessDetails,
  CapitalGainsDetails,
  OtherSourcesDetails,
}

export interface ItrStepIncomeSourcesViewProps {
  onBack: () => void
  onNext: () => void
  onSaveDraft?: () => void
  salaryDetails: SalaryDetails
  onSalaryDetailsChange: (details: SalaryDetails) => void
  housePropertyDetails: HousePropertyDetails
  onHousePropertyDetailsChange: (details: HousePropertyDetails) => void
  businessDetails: BusinessDetails
  onBusinessDetailsChange: (details: BusinessDetails) => void
  capitalGainsDetails: CapitalGainsDetails
  onCapitalGainsDetailsChange: (details: CapitalGainsDetails) => void
  otherSourcesDetails: OtherSourcesDetails
  onOtherSourcesDetailsChange: (details: OtherSourcesDetails) => void
  selectedSources: string[]
  onSourcesChange: (sources: string[]) => void
}

export const ItrStepIncomeSourcesView: React.FC<ItrStepIncomeSourcesViewProps> = ({
  onBack,
  onNext,
  onSaveDraft,
  salaryDetails,
  onSalaryDetailsChange,
  housePropertyDetails,
  onHousePropertyDetailsChange,
  businessDetails,
  onBusinessDetailsChange,
  capitalGainsDetails,
  onCapitalGainsDetailsChange,
  otherSourcesDetails,
  onOtherSourcesDetailsChange,
  selectedSources,
  onSourcesChange,
}) => {
  const toggleSource = (id: string) => {
    if (selectedSources.includes(id)) {
      onSourcesChange(selectedSources.filter((s) => s !== id))
    } else {
      onSourcesChange([...selectedSources, id])
    }
  }


  const isStep2Valid = Boolean(
    selectedSources.length > 0 &&
    (!selectedSources.includes('salary') ||
      Boolean(salaryDetails.grossSalary?.trim() || salaryDetails.employerName?.trim())) &&
    (!selectedSources.includes('house_property') ||
      (housePropertyDetails.propertyType === 'self_occupied' ||
        Boolean(housePropertyDetails.annualRentReceived?.trim()))) &&
    (!selectedSources.includes('business') ||
      Boolean(businessDetails.grossTurnover?.trim() || businessDetails.declaredNetProfit?.trim())) &&
    (!selectedSources.includes('capital_gains') ||
      Boolean(
        capitalGainsDetails.stcg?.trim() ||
        capitalGainsDetails.ltcg?.trim() ||
        capitalGainsDetails.assetTypes.length > 0
      )) &&
    (!selectedSources.includes('other_sources') ||
      Boolean(
        otherSourcesDetails.interestIncome?.trim() ||
        otherSourcesDetails.dividendIncome?.trim() ||
        otherSourcesDetails.otherIncome?.trim()
      ))
  )

  return (
    <div className="itr-step-view-container">
      {/* 5-Step Progress Stepper */}
      <ItrStepHeaderStepper currentStepId={2} />


      {/* Income Sources Selector */}
      <div className="itr-step-card">
        <div className="itr-sources-header">
          <h2 className="itr-sources-title">Income Sources & Activity</h2>
          <p className="itr-sources-subtitle">
            Select all sources of income you earned this year. Fields will adjust automatically.
          </p>
          <span className="itr-sources-label">Select your income sources:</span>
        </div>

        <div className="itr-pills-row" role="group" aria-label="Income sources selection">
          {ALL_SOURCES.map((src) => {
            const isSelected = selectedSources.includes(src.id)
            return (
              <button
                key={src.id}
                type="button"
                className={`itr-source-pill ${isSelected ? 'itr-source-pill--active' : ''}`}
                onClick={() => toggleSource(src.id)}
                aria-pressed={isSelected}
              >
                {isSelected ? (
                  <span className="itr-pill-icon-active" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                ) : (
                  <span className="itr-pill-icon-add" aria-hidden="true">+</span>
                )}
                <span>{src.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Income Source Cards (Rendered dynamically in the order selected by the user) */}
      {selectedSources.map((sourceId) => {
        switch (sourceId) {
          case 'salary':
            return (
              <ItrSalaryIncomeCard
                key="salary"
                salaryDetails={salaryDetails}
                onSalaryDetailsChange={onSalaryDetailsChange}
                onToggle={() => toggleSource('salary')}
              />
            )
          case 'house_property':
            return (
              <ItrHousePropertyCard
                key="house_property"
                housePropertyDetails={housePropertyDetails}
                onHousePropertyDetailsChange={onHousePropertyDetailsChange}
                onToggle={() => toggleSource('house_property')}
              />
            )
          case 'business':
            return (
              <ItrBusinessIncomeCard
                key="business"
                businessDetails={businessDetails}
                onBusinessDetailsChange={onBusinessDetailsChange}
                onToggle={() => toggleSource('business')}
              />
            )
          case 'capital_gains':
            return (
              <ItrCapitalGainsCard
                key="capital_gains"
                capitalGainsDetails={capitalGainsDetails}
                onCapitalGainsDetailsChange={onCapitalGainsDetailsChange}
                onToggle={() => toggleSource('capital_gains')}
              />
            )
          case 'other_sources':
            return (
              <ItrOtherSourcesCard
                key="other_sources"
                otherSourcesDetails={otherSourcesDetails}
                onOtherSourcesDetailsChange={onOtherSourcesDetailsChange}
                onToggle={() => toggleSource('other_sources')}
              />
            )
          default:
            return null
        }
      })}

      {/* Navigation */}
      <StepActionBar
        onBack={onBack}
        onNext={onNext}
        onSaveDraft={onSaveDraft}
        backLabel="Back"
        nextLabel="Continue"
        nextDisabled={!isStep2Valid}
      />
    </div>
  )
}

export default ItrStepIncomeSourcesView
