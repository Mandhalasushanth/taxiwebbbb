const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export const formatCurrency = (amount: number | null | undefined): string =>
  amount === null || amount === undefined || Number.isNaN(amount) ? '-' : formatter.format(amount)

/** Formats whole number or amount without unnecessary decimals, e.g. 1499 -> "₹1,499" */
export const formatINR = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`

/** Compact Indian notation: 12,50,000 -> "12.5L". */
export const formatCompactINR = (amount: number): string => {
  const abs = Math.abs(amount)
  if (abs >= 1_00_00_000) return `${(amount / 1_00_00_000).toFixed(2)}Cr`
  if (abs >= 1_00_000) return `${(amount / 1_00_000).toFixed(2)}L`
  if (abs >= 1_000) return `${(amount / 1_000).toFixed(1)}K`
  return String(amount)
}
