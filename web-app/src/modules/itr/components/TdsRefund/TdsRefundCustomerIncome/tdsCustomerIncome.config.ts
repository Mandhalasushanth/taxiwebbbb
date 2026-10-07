import type { TdsIncomeTaxData } from "@modules/itr/types/tdsRefund.types";

/** Field and toggle configuration for the TDS Refund customer & income step */
export interface CategoryToggleConfig {
  key:
    | "rentalIncome"
    | "capitalGains"
    | "businessIncome"
    | "homeLoanInterest"
    | "taxDeductions";
  title: string;
  subtitle: string;
  twoColumn?: boolean;
  fields: Array<{
    id: string;
    label: string;
    key: keyof TdsIncomeTaxData;
    placeholder: string;
  }>;
}

export const CATEGORY_TOGGLE_CONFIGS: CategoryToggleConfig[] = [
  {
    key: "rentalIncome",
    title: "Rental Income",
    subtitle: "House property rent",
    fields: [
      {
        id: "tds-annual-rent",
        label: "Annual Rent Received (₹)",
        key: "annualRent",
        placeholder: "Enter rental income",
      },
      {
        id: "tds-property-taxes",
        label: "Property Taxes Paid (₹)",
        key: "propertyTaxes",
        placeholder: "Enter municipal taxes",
      },
    ],
  },
  {
    key: "capitalGains",
    title: "Capital Gains",
    subtitle: "Stocks / MF / Property",
    twoColumn: true,
    fields: [
      {
        id: "tds-stcg",
        label: "Short-Term Gains (₹)",
        key: "stcg",
        placeholder: "Enter STCG",
      },
      {
        id: "tds-ltcg",
        label: "Long-Term Gains (₹)",
        key: "ltcg",
        placeholder: "Enter LTCG",
      },
    ],
  },
  {
    key: "businessIncome",
    title: "Business / Profession",
    subtitle: "Freelance or business income",
    twoColumn: true,
    fields: [
      {
        id: "tds-turnover",
        label: "Turnover (₹)",
        key: "turnover",
        placeholder: "Enter turnover",
      },
      {
        id: "tds-net-profit",
        label: "Net Profit (₹)",
        key: "netProfit",
        placeholder: "Enter profit",
      },
    ],
  },
  {
    key: "homeLoanInterest",
    title: "Home Loan Interest",
    subtitle: "Self-occupied house property",
    fields: [
      {
        id: "tds-interest-paid",
        label: "Interest Paid (Sec 24b) (₹)",
        key: "homeLoanInterestAmount",
        placeholder: "Enter interest paid",
      },
    ],
  },
  {
    key: "taxDeductions",
    title: "Tax Deductions",
    subtitle: "Section 80C, 80D, 80G",
    twoColumn: true,
    fields: [
      {
        id: "tds-deduction-80c",
        label: "80C (PPF, ELSS, LIC) (₹)",
        key: "deduction80C",
        placeholder: "Up to ₹1.5L",
      },
      {
        id: "tds-deduction-80d",
        label: "80D (Health Ins.) (₹)",
        key: "deduction80D",
        placeholder: "Up to ₹75k",
      },
    ],
  },
];

export const SALARY_INCOME_FIELD = {
  id: "tds-salary-income",
  label: "Salaried Gross Income (₹)",
  key: "salaryIncome" as keyof TdsIncomeTaxData,
  placeholder: "Enter your salary income",
  required: true,
};

export const OTHER_INCOME_FIELDS: Array<{
  id: string;
  label: string;
  key: keyof TdsIncomeTaxData;
  placeholder: string;
  required?: boolean;
}> = [
  {
    id: "tds-other-income",
    label: "Other Income (₹)",
    key: "otherIncome",
    placeholder: "Enter other income",
  },
  {
    id: "tds-interest-income",
    label: "Interest Income (₹)",
    key: "interestIncome",
    placeholder: "Enter interest income",
  },
];

export const TAXES_PAID_FIELDS: Array<{
  id: string;
  label: string;
  key: keyof TdsIncomeTaxData;
  placeholder: string;
  required?: boolean;
}> = [
  {
    id: "tds-total-tds",
    label: "Total TDS Deducted (₹)",
    key: "totalTdsDeducted",
    placeholder: "Enter TDS Amount",
    required: true,
  },
  {
    id: "tds-tcs-amount",
    label: "TCS Amount (₹)",
    key: "tcsAmount",
    placeholder: "Enter TCS Amount",
  },
  {
    id: "tds-advance-tax",
    label: "Advance Tax (₹)",
    key: "advanceTax",
    placeholder: "Enter Advance Tax",
  },
  {
    id: "tds-self-tax",
    label: "Self-Assessment Tax (₹)",
    key: "selfAssessmentTax",
    placeholder: "Enter Self Assessment Tax",
  },
];
