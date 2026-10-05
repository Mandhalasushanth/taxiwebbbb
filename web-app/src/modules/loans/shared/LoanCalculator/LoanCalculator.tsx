import React, { useState, useEffect } from 'react'
import './LoanCalculator.css'

interface LoanCalculatorProps {
  initialAmount?: number
  initialTenure?: number
  initialRate?: number
  onCalculate?: (emi: number, totalInterest: number, totalPayment: number) => void
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  initialAmount = 5000000,
  initialTenure = 20,
  initialRate = 8.5,
  onCalculate
}) => {
  const [amount, setAmount] = useState(initialAmount)
  const [tenure, setTenure] = useState(initialTenure)
  const [rate, setRate] = useState(initialRate)
  
  const [emi, setEmi] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)

  useEffect(() => {
    const p = amount
    const r = rate / 12 / 100
    const n = tenure * 12
    const isValid = p > 0 && r > 0 && n > 0

    const calculateValues = () => {
      const calculatedEmi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      const calculatedTotalPayment = calculatedEmi * n
      const calculatedTotalInterest = calculatedTotalPayment - p
      const roundedEmi = Math.round(calculatedEmi)
      const roundedPayment = Math.round(calculatedTotalPayment)
      const roundedInterest = Math.round(calculatedTotalInterest)

      setEmi(roundedEmi)
      setTotalPayment(roundedPayment)
      setTotalInterest(roundedInterest)
      onCalculate?.(roundedEmi, roundedInterest, roundedPayment)
    }

    const resetValues = () => {
      setEmi(0)
      setTotalPayment(0)
      setTotalInterest(0)
    }

    isValid ? calculateValues() : resetValues()
  }, [amount, tenure, rate, onCalculate])

  return (
    <div className="loan-calc-container">
      <h3 className="loan-calc-title">EMI Calculator</h3>
      
      <div className="loan-calc-inputs">
        <div className="loan-calc-group">
          <label>Loan Amount (₹)</label>
          <input type="range" min="100000" max="50000000" step="100000" value={amount} onChange={e => setAmount(Number(e.target.value))} />
          <div className="loan-calc-val">₹{amount.toLocaleString('en-IN')}</div>
        </div>

        <div className="loan-calc-group">
          <label>Tenure (Years)</label>
          <input type="range" min="1" max="30" step="1" value={tenure} onChange={e => setTenure(Number(e.target.value))} />
          <div className="loan-calc-val">{tenure} Years</div>
        </div>

        <div className="loan-calc-group">
          <label>Interest Rate (% p.a.)</label>
          <input type="range" min="5" max="20" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))} />
          <div className="loan-calc-val">{rate}%</div>
        </div>
      </div>

      <div className="loan-calc-results">
        <div className="loan-calc-result-box">
          <span className="loan-calc-label">Monthly EMI</span>
          <span className="loan-calc-value highlight">₹{emi.toLocaleString('en-IN')}</span>
        </div>
        <div className="loan-calc-result-box">
          <span className="loan-calc-label">Total Interest</span>
          <span className="loan-calc-value">₹{totalInterest.toLocaleString('en-IN')}</span>
        </div>
        <div className="loan-calc-result-box">
          <span className="loan-calc-label">Total Payment</span>
          <span className="loan-calc-value">₹{totalPayment.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}

export default LoanCalculator
