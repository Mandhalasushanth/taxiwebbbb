/**
 * India Post PIN code → State / UT mapping.
 * A PIN's first digits identify its postal circle; the longest matching prefix wins.
 * Border prefixes that serve more than one State / UT list all of them.
 * State names match the GST / registration state lists.
 */
const PIN_PREFIX_STATES: Record<string, readonly string[]> = {
  '11': ['Delhi'],
  '12': ['Haryana'],
  '13': ['Haryana'],
  '14': ['Punjab'],
  '15': ['Punjab'],
  '16': ['Punjab'],
  '160': ['Chandigarh', 'Punjab'],
  '17': ['Himachal Pradesh'],
  '18': ['Jammu and Kashmir'],
  '19': ['Jammu and Kashmir'],
  '194': ['Ladakh', 'Jammu and Kashmir'],
  '20': ['Uttar Pradesh'],
  '21': ['Uttar Pradesh'],
  '22': ['Uttar Pradesh'],
  '23': ['Uttar Pradesh'],
  '24': ['Uttar Pradesh', 'Uttarakhand'],
  '246': ['Uttarakhand'],
  '248': ['Uttarakhand'],
  '249': ['Uttarakhand'],
  '25': ['Uttar Pradesh'],
  '26': ['Uttar Pradesh', 'Uttarakhand'],
  '263': ['Uttarakhand'],
  '27': ['Uttar Pradesh'],
  '28': ['Uttar Pradesh'],
  '30': ['Rajasthan'],
  '31': ['Rajasthan'],
  '32': ['Rajasthan'],
  '33': ['Rajasthan'],
  '34': ['Rajasthan'],
  '36': ['Gujarat'],
  '362': ['Gujarat', 'Dadra and Nagar Haveli and Daman and Diu'],
  '37': ['Gujarat'],
  '38': ['Gujarat'],
  '39': ['Gujarat'],
  '396': ['Gujarat', 'Dadra and Nagar Haveli and Daman and Diu'],
  '40': ['Maharashtra'],
  '403': ['Goa'],
  '41': ['Maharashtra'],
  '42': ['Maharashtra'],
  '43': ['Maharashtra'],
  '44': ['Maharashtra'],
  '45': ['Madhya Pradesh'],
  '46': ['Madhya Pradesh'],
  '47': ['Madhya Pradesh'],
  '48': ['Madhya Pradesh'],
  '49': ['Chhattisgarh'],
  '50': ['Telangana'],
  '51': ['Andhra Pradesh'],
  '52': ['Andhra Pradesh'],
  '53': ['Andhra Pradesh'],
  '533': ['Andhra Pradesh', 'Puducherry'],
  '56': ['Karnataka'],
  '57': ['Karnataka'],
  '58': ['Karnataka'],
  '59': ['Karnataka'],
  '60': ['Tamil Nadu'],
  '605': ['Tamil Nadu', 'Puducherry'],
  '607': ['Tamil Nadu', 'Puducherry'],
  '609': ['Tamil Nadu', 'Puducherry'],
  '61': ['Tamil Nadu'],
  '62': ['Tamil Nadu'],
  '63': ['Tamil Nadu'],
  '64': ['Tamil Nadu'],
  '67': ['Kerala'],
  '673': ['Kerala', 'Puducherry'],
  '68': ['Kerala'],
  '682': ['Kerala', 'Lakshadweep'],
  '69': ['Kerala'],
  '70': ['West Bengal'],
  '71': ['West Bengal'],
  '72': ['West Bengal'],
  '73': ['West Bengal'],
  '737': ['Sikkim'],
  '74': ['West Bengal'],
  '744': ['Andaman and Nicobar Islands'],
  '75': ['Odisha'],
  '76': ['Odisha'],
  '77': ['Odisha'],
  '78': ['Assam'],
  '790': ['Arunachal Pradesh'],
  '791': ['Arunachal Pradesh'],
  '792': ['Arunachal Pradesh'],
  '793': ['Meghalaya'],
  '794': ['Meghalaya'],
  '795': ['Manipur'],
  '796': ['Mizoram'],
  '797': ['Nagaland'],
  '798': ['Nagaland'],
  '799': ['Tripura'],
  '80': ['Bihar'],
  '81': ['Bihar', 'Jharkhand'],
  '82': ['Bihar', 'Jharkhand'],
  '83': ['Jharkhand'],
  '84': ['Bihar'],
  '85': ['Bihar'],
}

const PREFIX_LENGTHS = [3, 2] as const

/** States / UTs served by a 6-digit PIN code (empty when the PIN is not a civil postal area). */
export const getStatesForPincode = (pincode: string): readonly string[] => {
  const digits = (pincode || '').replace(/\D/g, '')
  if (digits.length !== 6) return []
  const match = PREFIX_LENGTHS.map((length) => PIN_PREFIX_STATES[digits.slice(0, length)]).find(Boolean)
  return match ?? []
}

/**
 * Error when the PIN code does not belong to the selected State / UT, else null.
 * Returns null when either value is missing (the required-field rules report that).
 */
export const validatePincodeMatchesState = (pincode: string, state: string): string | null => {
  const digits = (pincode || '').replace(/\D/g, '')
  if (digits.length !== 6 || !state) return null
  const states = getStatesForPincode(digits)
  if (states.length === 0) return `PIN code ${digits} is not a valid business address PIN`
  return states.includes(state) ? null : `PIN code ${digits} belongs to ${states.join(' / ')}, not ${state}`
}
