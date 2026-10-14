import { CANONICAL_INDIAN_STATES_AND_UTS } from "@shared/services/indianStates";

export const CONSTITUTION_OF_BUSINESS_OPTIONS = [
  "Proprietorship",
  "Partnership Firm",
  "Limited Liability Partnership (LLP)",
  "Private Limited Company",
  "Public Limited Company",
  "HUF",
  "Society / Trust / Club",
];

export const NATURE_OF_BUSINESS_OPTIONS = [
  "Trader",
  "Manufacturer",
  "Service Provider",
  "Wholesaler / Distributor",
  "Retailer",
  "Exporter / Importer",
  "Contractor / Freelancer",
];

export const REASON_FOR_REGISTRATION_OPTIONS = [
  "Crossed turnover threshold",
  "Voluntary registration",
  "Inter-state supply",
  "E-commerce operator / seller",
  "Casual taxable person",
  "Input Service Distributor",
];

export const COMPOSITION_SCHEME_OPTIONS = [
  "No - regular scheme",
  "Yes - composition scheme",
];

export const PLACE_OF_BUSINESS_OPTIONS = [
  "Principal Place of Business",
  "Additional Place of Business",
];

export const INDIAN_STATES_AND_UTS = CANONICAL_INDIAN_STATES_AND_UTS;

/** GST state codes (first two digits of a GSTIN) */
export const GST_STATE_CODES: Record<string, string> = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra and Nagar Haveli and Daman and Diu",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
  "97": "Other Territory",
  "99": "Centre Jurisdiction",
};

/** State name for a GSTIN, from its first two digits */
export const stateFromGstin = (gstin: string): string =>
  GST_STATE_CODES[gstin.slice(0, 2)] || "";

export const BANK_ACCOUNT_TYPE_OPTIONS = [
  "Current",
  "Savings",
  "Cash Credit / OD",
] as const;
