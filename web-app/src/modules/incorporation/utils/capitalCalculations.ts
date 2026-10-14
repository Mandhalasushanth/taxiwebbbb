/**
 * Capital and Shareholding Dynamic Calculation Utilities
 * Implements mathematical models and validations for MCA company incorporation.
 */

export interface AuthorisedSharesResult {
  shares: number | null
  exactShares: number
  isDivisible: boolean
  displayShares: string
  errorMessage?: string
}

export interface ShareholderCalculation {
  id: number
  shares: number
  amount: number
  displayAmount: string
  percentage: number
  percentageFormatted: string
}

export interface CapitalCalculationSummary {
  authorisedCapital: number
  faceValue: number
  authorisedShares: number | null
  displayAuthorisedShares: string
  isAuthorisedDivisible: boolean
  authorisedSharesError?: string
  totalSubscribedShares: number
  subscribedCapital: number
  displaySubscribedCapital: string
  capitalCheckPassed: boolean
  allocationCheckPassed: boolean
  isAllPassed: boolean
  shareholders: ShareholderCalculation[]
}

/**
 * Dynamically calculates authorised shares from user-entered authorised capital and face value.
 * Formula: authorisedShares = authorisedCapital / faceValuePerShare
 *
 * Rules:
 * - If either input is empty, non-positive, or invalid: returns '-- shares' and shares: null.
 * - Division by zero is strictly guarded if face value is 0.
 * - If the result is not a whole number: flags isDivisible as false, provides validation error message,
 *   and retains the exact decimal share count without silently rounding.
 */
export const calculateAuthorisedShares = (
  authorisedCapital: number | string,
  faceValue: number | string
): AuthorisedSharesResult => {
  const capStr = String(authorisedCapital ?? '').replace(/,/g, '').trim()
  const fvStr = String(faceValue ?? '').replace(/,/g, '').trim()

  if (!capStr || !fvStr) {
    return {
      shares: null,
      exactShares: 0,
      isDivisible: true,
      displayShares: '-- shares',
    }
  }

  const cap = Number(capStr)
  const fv = Number(fvStr)

  if (isNaN(cap) || isNaN(fv) || cap <= 0 || fv <= 0) {
    const error =
      !isNaN(fv) && fv <= 0
        ? 'Face value must be greater than 0'
        : !isNaN(cap) && cap <= 0
          ? 'Authorised capital must be greater than 0'
          : undefined

    return {
      shares: null,
      exactShares: 0,
      isDivisible: true,
      displayShares: '-- shares',
      errorMessage: error,
    }
  }

  // Prevents division by zero (guarded by fv <= 0 check above)
  const exactShares = cap / fv
  const remainder = cap % fv
  const isDivisible = remainder === 0

  if (!isDivisible) {
    return {
      shares: exactShares,
      exactShares,
      isDivisible: false,
      displayShares: `${exactShares.toLocaleString('en-IN', { maximumFractionDigits: 4 })} shares`,
      errorMessage: 'Authorised capital must be a multiple of face value per share',
    }
  }

  return {
    shares: exactShares,
    exactShares,
    isDivisible: true,
    displayShares: `${exactShares.toLocaleString('en-IN')} shares`,
  }
}

/**
 * Calculates a single shareholder's subscribed amount from their allocated shares and face value.
 */
export const calculateShareholderAmount = (
  shares: number | string,
  faceValue: number | string
): number => {
  const sStr = String(shares ?? '').replace(/,/g, '').trim()
  const fvStr = String(faceValue ?? '').replace(/,/g, '').trim()

  const s = Number(sStr) || 0
  const fv = Number(fvStr) || 0

  return s > 0 && fv > 0 ? s * fv : 0
}

/**
 * Calculates aggregate subscribed capital across all allocated shares using the active face value.
 * Formula: subscribedCapital = totalAllocatedShares * faceValuePerShare.
 * Does not substitute authorised capital.
 * Returns 0 when no shares have been entered.
 */
export const calculateSubscribedCapital = (
  totalAllocatedShares: number | string,
  faceValue: number | string
): number => {
  const totalStr = String(totalAllocatedShares ?? '').replace(/,/g, '').trim()
  const fvStr = String(faceValue ?? '').replace(/,/g, '').trim()

  const total = Number(totalStr) || 0
  const fv = Number(fvStr) || 0

  return total > 0 && fv > 0 ? total * fv : 0
}

/**
 * Calculates equity ownership percentage relative to total subscribed/relevant shares.
 */
export const calculateOwnershipPercentage = (
  shareholderShares: number | string,
  totalRelevantShares: number | string
): { percentage: number; formatted: string } => {
  const s = Number(String(shareholderShares ?? '').replace(/,/g, '').trim()) || 0
  const total = Number(String(totalRelevantShares ?? '').replace(/,/g, '').trim()) || 0

  if (s <= 0 || total <= 0) {
    return { percentage: 0, formatted: '--' }
  }

  const rawPercent = (s / total) * 100
  const formatted = Number.isInteger(rawPercent)
    ? `${rawPercent}%`
    : `${Number(rawPercent.toFixed(2))}%`

  return { percentage: rawPercent, formatted }
}

/**
 * Computes full capital & shareholding derivation dynamically from source inputs.
 */
export const computeCapitalSummary = (
  authorisedCapitalInput: number | string,
  faceValueInput: number | string,
  directorSharesMap: Record<number, number | string>,
  directorIds: number[]
): CapitalCalculationSummary => {
  const capStr = String(authorisedCapitalInput ?? '').replace(/,/g, '').trim()
  const fvStr = String(faceValueInput ?? '').replace(/,/g, '').trim()

  const authorisedCapital = Number(capStr) || 0
  const faceValue = Number(fvStr) || 0

  const authResult = calculateAuthorisedShares(authorisedCapitalInput, faceValueInput)

  let totalSubscribedShares = 0
  directorIds.forEach((id) => {
    const s = Number(String(directorSharesMap[id] ?? '').replace(/,/g, '').trim()) || 0
    totalSubscribedShares += s
  })

  const subscribedCapital = calculateSubscribedCapital(totalSubscribedShares, faceValueInput)

  // Subscribed Capital displays ₹0 initially, or formatted ₹ amount when positive
  const displaySubscribedCapital =
    totalSubscribedShares === 0 || faceValue <= 0
      ? '₹0'
      : `₹${subscribedCapital.toLocaleString('en-IN')}`

  const shareholders: ShareholderCalculation[] = directorIds.map((id) => {
    const shares = Number(String(directorSharesMap[id] ?? '').replace(/,/g, '').trim()) || 0
    const amount = calculateShareholderAmount(shares, faceValueInput)
    const displayAmount =
      shares === 0 || faceValue <= 0
        ? '₹0'
        : `₹${amount.toLocaleString('en-IN')}`

    const { percentage, formatted: percentageFormatted } = calculateOwnershipPercentage(
      shares,
      totalSubscribedShares
    )
    return {
      id,
      shares,
      amount,
      displayAmount,
      percentage,
      percentageFormatted,
    }
  })

  const capitalCheckPassed =
    authorisedCapital > 0 && subscribedCapital > 0 && subscribedCapital <= authorisedCapital

  const allocationCheckPassed =
    totalSubscribedShares > 0 &&
    (authResult.shares !== null && authResult.shares > 0
      ? totalSubscribedShares <= authResult.shares
      : true)

  const isAllPassed =
    capitalCheckPassed &&
    allocationCheckPassed &&
    authResult.isDivisible &&
    authResult.shares !== null

  return {
    authorisedCapital,
    faceValue,
    authorisedShares: authResult.shares,
    displayAuthorisedShares: authResult.displayShares,
    isAuthorisedDivisible: authResult.isDivisible,
    authorisedSharesError: authResult.errorMessage,
    totalSubscribedShares,
    subscribedCapital,
    displaySubscribedCapital,
    capitalCheckPassed,
    allocationCheckPassed,
    isAllPassed,
    shareholders,
  }
}
