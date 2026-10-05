import React from 'react'
import type { ItrTaxCalculationResult } from '../itrTaxCalculator'

export interface ItrRegimeCompareTableProps {
  calculation: ItrTaxCalculationResult
}

export const ItrRegimeCompareTable: React.FC<ItrRegimeCompareTableProps> = ({
  calculation,
}) => {
  const formatInr = (num: number): string => num.toLocaleString('en-IN')

  return (
    <div className="itr-step-card">
      <div className="itr-compare-header">
        <div className="itr-compare-title-wrap">
          <span className="itr-compare-icon" aria-hidden="true">🔄</span>
          <h2 className="itr-compare-title">Compare Tax Regimes</h2>
        </div>
        <span className="itr-badge-ay">AY 2026-2027</span>
      </div>

      <p className="itr-compare-desc">
        Compare your estimated tax computation between the New and Old Tax Regimes for AY 2026-2027 before finalizing your selection.
      </p>

      <div className="itr-table-container">
        <table className="itr-compare-table" aria-label="Tax Regime Comparison Table">
          <thead>
            <tr>
              <th scope="col">TAX PARAMETER</th>
              <th scope="col" className="itr-table-col-right">NEW REGIME</th>
              <th scope="col" className="itr-table-col-right">OLD REGIME</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gross Total Income</td>
              <td className="itr-table-col-right">₹ {formatInr(calculation.newRegime.grossTotalIncome)}</td>
              <td className="itr-table-col-right">₹ {formatInr(calculation.oldRegime.grossTotalIncome)}</td>
            </tr>
            <tr>
              <td>Standard Deduction</td>
              <td className="itr-table-col-right">
                - ₹ {formatInr(calculation.newRegime.totalDeductions)}
              </td>
              <td className="itr-table-col-right">
                - ₹ {formatInr(calculation.oldRegime.grossTotalIncome > 0 && calculation.salaryIncome > 0 ? Math.min(calculation.salaryIncome, 50000) : 0)}
              </td>
            </tr>
            <tr>
              <td>Chapter VI-A Deductions</td>
              <td className="itr-table-col-right itr-text-not-applicable">Not Applicable</td>
              <td className="itr-table-col-right">- ₹ {formatInr(calculation.totalChapterVIDeductions)}</td>
            </tr>
            <tr>
              <td>Net Taxable Income</td>
              <td className="itr-table-col-right">₹ {formatInr(calculation.newRegime.taxableIncome)}</td>
              <td className="itr-table-col-right">₹ {formatInr(calculation.oldRegime.taxableIncome)}</td>
            </tr>
            <tr>
              <td>Estimated Tax Liability</td>
              <td className="itr-table-col-right">₹ {formatInr(calculation.newRegime.taxPayable)}</td>
              <td className="itr-table-col-right">₹ {formatInr(calculation.oldRegime.taxPayable)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
