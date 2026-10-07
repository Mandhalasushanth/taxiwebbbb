import {
  DEFAULT_TDS_TAXPAYER,
  syncProfileWithAuthUser,
  type TdsTaxpayerProfile,
} from "@modules/itr/utils/tdsRefund.constants";
import type { TdsIncomeTaxData } from "@modules/itr/types/tdsRefund.types";
import { authStorage } from "@core/auth";
import { errorTracker } from "@core/errors";
import type { CategoryToggleConfig } from "./tdsCustomerIncome.config";

/** Parsing, masking and display helpers for the TDS Refund customer & income step */
export const parseAmount = (val?: string) => {
  try {
    return Number((val || "").replace(/[^0-9.]/g, "") || 0);
  } catch {
    return 0;
  }
};

export const getCategoryClearUpdates = (
  key: CategoryToggleConfig["key"],
): Partial<TdsIncomeTaxData> => {
  if (key === "rentalIncome")
    return { rentalIncome: "no", annualRent: "", propertyTaxes: "" };
  if (key === "capitalGains") return { capitalGains: "no", stcg: "", ltcg: "" };
  if (key === "businessIncome")
    return { businessIncome: "no", turnover: "", netProfit: "" };
  if (key === "homeLoanInterest")
    return { homeLoanInterest: "no", homeLoanInterestAmount: "" };
  if (key === "taxDeductions")
    return { taxDeductions: "no", deduction80C: "", deduction80D: "" };
  return { [key]: "no" };
};

export const formatMaskedPan = (pan?: string) => {
  if (!pan) return "—";
  const clean = pan.toUpperCase().trim();
  if (clean.length === 10) {
    return `XXXXX${clean.slice(5)}`;
  }
  return clean;
};

export const formatMaskedAadhaar = (aadhaar?: string) => {
  if (!aadhaar) return "—";
  const digits = aadhaar.replace(/\D/g, "");
  if (digits.length >= 4) {
    const last4 = digits.slice(-4);
    return `XXXX XXXX ${last4}`;
  }
  return aadhaar;
};

export const formatDob = (dob?: string) => {
  if (!dob) return "—";
  if (dob.includes("-")) {
    const [y, m, d] = dob.split("-");
    if (y && m && d && y.length === 4) {
      return `${d}/${m}/${y}`;
    }
  }
  return dob;
};

export const formatMobileDisplay = (mobile?: string) => {
  if (!mobile) return "—";
  const clean = mobile.trim();
  const digits = clean.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (clean.startsWith("+91") && digits.length === 12) {
    const num = digits.slice(2);
    return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  }
  return clean;
};

export const renderAddressDisplay = (address?: string) => {
  if (!address) return <span>—</span>;
  if (address.includes("\n")) {
    const lines = address.split("\n");
    return (
      <div className="tds-personal-address">
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    );
  }
  if (address.includes(", ")) {
    const parts = address.split(", ");
    return (
      <div className="tds-personal-address">
        <div>{parts[0]}</div>
        <div>{parts.slice(1).join(", ")}</div>
      </div>
    );
  }
  return <span>{address}</span>;
};

export const getResolvedProfile = (
  initial?: TdsTaxpayerProfile,
  user?: ReturnType<typeof authStorage.getUser> | null,
): TdsTaxpayerProfile => {
  try {
    const base = initial || DEFAULT_TDS_TAXPAYER;
    return syncProfileWithAuthUser(base, user).profile;
  } catch (err) {
    errorTracker.captureException(err, { tags: { area: 'tds-profile-resolve' } });
    return initial || DEFAULT_TDS_TAXPAYER;
  }
};
