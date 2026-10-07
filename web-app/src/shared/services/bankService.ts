/**
 * Bank & IFSC Details Lookup Service
 *
 * Provides bank and branch auto-fetching from IFSC codes.
 * Currently uses a comprehensive sample master with dynamic branch resolution.
 * Built with future backend API integration in place: when backend APIs are connected,
 * it will query the API and gracefully fallback to sample data.
 */

export interface BankDetailsLookupResult {
  ifsc: string
  bankName: string
  branch: string
  city?: string
  state?: string
  source: 'api' | 'sample-dataset' | 'sample-generated'
}

/**
 * Known Indian Bank code prefixes mapped to official bank names.
 */
const SAMPLE_BANK_PREFIXES: Record<string, string> = {
  SBIN: 'State Bank of India',
  HDFC: 'HDFC Bank',
  ICIC: 'ICICI Bank',
  UTIB: 'Axis Bank',
  AXIS: 'Axis Bank',
  KKBK: 'Kotak Mahindra Bank',
  PUNB: 'Punjab National Bank',
  BARB: 'Bank of Baroda',
  CNRB: 'Canara Bank',
  UBIN: 'Union Bank of India',
  BKID: 'Bank of India',
  IOBA: 'Indian Overseas Bank',
  CBIN: 'Central Bank of India',
  IBKL: 'IDBI Bank',
  IDFB: 'IDFC FIRST Bank',
  YESB: 'Yes Bank',
  INDB: 'IndusInd Bank',
  FDRL: 'Federal Bank',
  BDBL: 'Bandhan Bank',
  SCBL: 'Standard Chartered Bank',
  HSBC: 'HSBC India',
  CITI: 'Citibank N.A.',
  MAHB: 'Bank of Maharashtra',
  PSIB: 'Punjab & Sind Bank',
  UCOB: 'UCO Bank',
  KVBL: 'Karur Vysya Bank',
  CSBK: 'CSB Bank',
  SIBL: 'South Indian Bank',
  TMBL: 'Tamilnad Mercantile Bank',
  RBLN: 'RBL Bank',
  AUBL: 'AU Small Finance Bank',
  ESFB: 'Equitas Small Finance Bank',
  UJJV: 'Ujjivan Small Finance Bank',
}

/**
 * Sample specific branches for popular / commonly tested IFSC codes.
 */
const SAMPLE_KNOWN_IFSC_MAP: Record<string, { bankName: string; branch: string; city: string; state: string }> = {
  HDFC0000412: { bankName: 'HDFC Bank', branch: 'Fort Branch - Mumbai', city: 'Mumbai', state: 'Maharashtra' },
  HDFC0001234: { bankName: 'HDFC Bank', branch: 'Connaught Place Branch', city: 'New Delhi', state: 'Delhi' },
  HDFC0000001: { bankName: 'HDFC Bank', branch: 'Worli Sandoz House', city: 'Mumbai', state: 'Maharashtra' },
  SBIN0000412: { bankName: 'State Bank of India', branch: 'Commercial Branch - MG Road', city: 'Bengaluru', state: 'Karnataka' },
  SBIN0001234: { bankName: 'State Bank of India', branch: 'Park Street Main Branch', city: 'Kolkata', state: 'West Bengal' },
  SBIN0000691: { bankName: 'State Bank of India', branch: 'Parliament Street Main Branch', city: 'New Delhi', state: 'Delhi' },
  ICIC0000001: { bankName: 'ICICI Bank', branch: 'Corporate Hub - BKC', city: 'Mumbai', state: 'Maharashtra' },
  ICIC0000412: { bankName: 'ICICI Bank', branch: 'Cyber City Branch', city: 'Gurugram', state: 'Haryana' },
  UTIB0000001: { bankName: 'Axis Bank', branch: 'Central Business District', city: 'Ahmedabad', state: 'Gujarat' },
  UTIB0000412: { bankName: 'Axis Bank', branch: 'Indiranagar Branch', city: 'Bengaluru', state: 'Karnataka' },
  KKBK0000123: { bankName: 'Kotak Mahindra Bank', branch: 'Nariman Point Branch', city: 'Mumbai', state: 'Maharashtra' },
  PUNB0012345: { bankName: 'Punjab National Bank', branch: 'Civil Lines Branch', city: 'Chandigarh', state: 'Chandigarh' },
  BARB0SAMPLE: { bankName: 'Bank of Baroda', branch: 'Alkapuri Branch', city: 'Vadodara', state: 'Gujarat' },
  CNRB0001234: { bankName: 'Canara Bank', branch: 'Town Hall Branch', city: 'Bengaluru', state: 'Karnataka' },
}

/**
 * Common sample branch areas for dynamic branch generation when IFSC is not in explicit lookup.
 */
const SAMPLE_BRANCH_AREAS = [
  'Main Branch',
  'Commercial Hub',
  'MG Road Branch',
  'City Centre',
  'Civil Lines',
  'Industrial Area',
  'Financial District',
  'Retail Hub',
  'Sector 18 Branch',
  'Central Market',
]

/**
 * Generates a realistic sample branch based on the IFSC code.
 */
function generateSampleBranch(_prefix: string, suffix: string): string {
  // Use numeric hash from suffix to deterministically pick a realistic branch name
  const num = parseInt(suffix.replace(/\D/g, '') || '1', 10)
  const area = SAMPLE_BRANCH_AREAS[num % SAMPLE_BRANCH_AREAS.length]
  const cleanSuffix = suffix.replace(/^0+/, '') || suffix
  return `${area} (#${cleanSuffix})`
}

/**
 * Synchronous lookup against sample dataset.
 * Returns realistic sample bank and branch for any valid 4+ letter prefix or 11-char IFSC code.
 */
export function lookupSampleBankByIfsc(rawIfsc: string): BankDetailsLookupResult | null {
  if (!rawIfsc) return null
  const ifsc = rawIfsc.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (ifsc.length < 4) return null

  // 1. Direct exact match in known sample dictionary
  if (SAMPLE_KNOWN_IFSC_MAP[ifsc]) {
    const known = SAMPLE_KNOWN_IFSC_MAP[ifsc]
    return {
      ifsc,
      bankName: known.bankName,
      branch: known.branch,
      city: known.city,
      state: known.state,
      source: 'sample-dataset',
    }
  }

  // 2. Prefix match
  const prefix = ifsc.slice(0, 4)
  const bankName = SAMPLE_BANK_PREFIXES[prefix] || `${prefix} Bank Ltd.`
  const suffix = ifsc.length > 4 ? ifsc.slice(4) : '000001'
  const branch = generateSampleBranch(prefix, suffix)

  return {
    ifsc,
    bankName,
    branch,
    source: 'sample-generated',
  }
}

/**
 * Asynchronous Bank Details Fetcher.
 * Prepares the frontend for future backend API integration while serving sample data now.
 *
 * Flow:
 * 1. If backend API is configured, calls the API endpoint.
 * 2. If API fails or backend is not connected, falls back to the rich sample dataset.
 */
export async function fetchBankDetailsByIfsc(rawIfsc: string): Promise<BankDetailsLookupResult | null> {
  const ifsc = rawIfsc.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (ifsc.length < 4) return null

  // Future API Hook (e.g. backend /api/banks/ifsc/:code or configured API gateway)
  try {
    const envApiUrl = import.meta.env.VITE_API_BASE_URL
    if (envApiUrl && envApiUrl !== 'mock' && !envApiUrl.includes('localhost:5173')) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2500)

      const response = await fetch(`${envApiUrl}/api/banks/ifsc/${ifsc}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data?.bankName && data?.branch) {
          return {
            ifsc,
            bankName: data.bankName,
            branch: data.branch,
            city: data.city,
            state: data.state,
            source: 'api',
          }
        }
      }
    }
  } catch {
    // Graceful fallback to sample data when backend is not connected
  }

  // Fallback to sample data
  return lookupSampleBankByIfsc(ifsc)
}
