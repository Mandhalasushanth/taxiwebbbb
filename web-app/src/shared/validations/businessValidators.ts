/**
 * Centralized Business & Entity Validators
 * Single Source of Truth for Business Names, Trade Names, Constitutions, HSN/SAC, Bank & Signatory rules.
 */

import { parseDate } from "./dateValidator";
import { validatePan } from "./panValidator";
import type { BaseValidationOptions } from "./commonValidators";

/* -------------------------------------------------------------------------- */
/* Business Legal Name (as per PAN)                                           */
/* -------------------------------------------------------------------------- */

/**
 * Validates Legal Name of Business:
 * - Allowed: Unicode letters, numbers, and legitimate business punctuation (& , . - ' / ( ))
 * - Supports company suffixes: Private Limited, Pvt Ltd, Limited, LLP, Inc, etc.
 * - Rejects unsupported special characters (@, #, $, %, etc.)
 * - Rejects names containing only numbers or only special characters (must contain letters)
 * - Rejects excessive consecutive punctuation (.., ,, --, //)
 * - Rejects consecutive spaces
 * - Length: 2 to 150 characters
 */
export const validateBusinessLegalName = (
  value: string | undefined | null,
  options?: BaseValidationOptions | string,
): string | null => {
  const opts: BaseValidationOptions =
    typeof options === "string" ? { label: options } : options || {};
  const label = opts.label || "Legal Name of Business";
  const required = opts.required !== false;
  const raw = String(value ?? "").trim();

  if (!raw) {
    return required ? `${label} is required` : null;
  }

  // Legal name should not contain numbers
  if (/\d/.test(raw) || /\p{N}/u.test(raw)) {
    return "Legal name cannot contain numbers";
  }

  const min = opts.minLength ?? 2;
  const max = opts.maxLength ?? 150;

  if (raw.length < min) {
    return `${label} must be at least ${min} characters`;
  }
  if (raw.length > max) {
    return `${label} cannot exceed ${max} characters`;
  }

  // Must contain letters (cannot be only special characters)
  if (!/\p{L}/u.test(raw)) {
    return `${label} must contain letters`;
  }

  // Must start with a letter
  if (!/^[\p{L}]/u.test(raw)) {
    return `${label} must start with a letter`;
  }

  // Reject unsupported special characters (allowed: Unicode letters, spaces, and & , . - ' / ( ) )
  if (!/^[\p{L}\s&,.\-'/()]+$/u.test(raw)) {
    return `${label} contains invalid special characters`;
  }

  // Cannot end with trailing punctuation/symbols (allowed to end with a letter, dot or closing paren)
  if (/[&,\-'/(]$/.test(raw)) {
    return `${label} cannot end with invalid punctuation or symbols`;
  }

  // Balanced parentheses check
  let openParens = 0;
  for (const ch of raw) {
    if (ch === '(') openParens++;
    if (ch === ')') {
      openParens--;
      if (openParens < 0) return `${label} has unmatched parentheses`;
    }
  }
  if (openParens !== 0) {
    return `${label} has unmatched parentheses`;
  }

  // No empty parentheses () or ( )
  if (/\(\s*\)/.test(raw)) {
    return `${label} cannot contain empty parentheses`;
  }

  // Reject excessive consecutive punctuation (any consecutive symbols like )(&, &(&, .., --, //, etc.)
  if (/([,.\-'/&])\s*\1/.test(raw) || /([&,\-'/]\s*){2,}|[(&]{2,}|[)]{2,}|[()]{2,}/.test(raw)) {
    return `${label} should not contain consecutive punctuation`;
  }

  // Reject consecutive spaces
  if (/\s{2,}/.test(raw)) {
    return `${label} should not contain consecutive spaces`;
  }

  return null;
};

export const isValidBusinessLegalName = (value: string): boolean =>
  validateBusinessLegalName(value, { required: true }) === null;

/* -------------------------------------------------------------------------- */
/* Trade Name                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Validates Trade / Brand Name:
 * - Allowed: Unicode letters, numbers, single spaces, and punctuation (& , . - ' / ( ))
 * - Rejects unsupported special characters
 * - Rejects consecutive invalid punctuation
 * - Rejects values containing only special characters
 * - Length: 2 to 150 characters
 */
export const validateTradeName = (
  value: string | undefined | null,
  options?: BaseValidationOptions | string,
): string | null => {
  const opts: BaseValidationOptions =
    typeof options === "string" ? { label: options } : options || {};
  const label = opts.label || "Trade Name";
  const required = opts.required !== false;
  const raw = String(value ?? "").trim();

  if (!raw) {
    return required ? `${label} is required` : null;
  }

  const min = opts.minLength ?? 2;
  const max = opts.maxLength ?? 150;

  if (raw.length < min) {
    return `${label} must be at least ${min} characters`;
  }
  if (raw.length > max) {
    return `${label} cannot exceed ${max} characters`;
  }

  // Reject values containing only special characters
  if (!/[\p{L}\p{N}]/u.test(raw)) {
    return `${label} must contain letters or numbers`;
  }

  // Must start with letter or number
  if (!/^[\p{L}\p{N}]/u.test(raw)) {
    return `${label} must start with a letter or number`;
  }

  // Reject unsupported special characters
  if (!/^[\p{L}\p{N}\s&,.\-'/()]+$/u.test(raw)) {
    return `${label} contains invalid special characters`;
  }

  // Cannot end with trailing punctuation/symbols (allowed to end with letter, number, dot or closing paren)
  if (/[&,\-'/(]$/.test(raw)) {
    return `${label} cannot end with invalid punctuation or symbols`;
  }

  // Balanced parentheses check
  let openTradeParens = 0;
  for (const ch of raw) {
    if (ch === '(') openTradeParens++;
    if (ch === ')') {
      openTradeParens--;
      if (openTradeParens < 0) return `${label} has unmatched parentheses`;
    }
  }
  if (openTradeParens !== 0) {
    return `${label} has unmatched parentheses`;
  }

  // No empty parentheses () or ( )
  if (/\(\s*\)/.test(raw)) {
    return `${label} cannot contain empty parentheses`;
  }

  // Reject excessive consecutive punctuation
  if (/([,.\-'/&])\s*\1/.test(raw) || /([&,\-'/]\s*){2,}|[(&]{2,}|[)]{2,}|[()]{2,}/.test(raw)) {
    return `${label} should not contain consecutive punctuation`;
  }

  // Reject consecutive spaces
  if (/\s{2,}/.test(raw)) {
    return `${label} should not contain consecutive spaces`;
  }

  return null;
};

export const isValidTradeName = (value: string): boolean =>
  validateTradeName(value, { required: true }) === null;

/* -------------------------------------------------------------------------- */
/* Constitution of Business & PAN Category Matching                           */
/* -------------------------------------------------------------------------- */

export const CONSTITUTION_PAN_TYPES: Record<string, readonly string[]> = {
  Proprietorship: ["P"],
  "Partnership Firm": ["F"],
  Partnership: ["F"],
  "Limited Liability Partnership (LLP)": ["F"],
  "Private Limited Company": ["C"],
  "Public Limited Company": ["C"],
  HUF: ["H"],
  "Hindu Undivided Family (HUF)": ["H"],
  "Society / Trust / Club": ["A", "T", "B"],
  "Society / Club / Trust / AOP": ["A", "T", "B"],
  "AOP / BOI": ["A", "B"],
  "AOP/BOI": ["A", "B"],
  "Government Department": ["G"],
  "Foreign Company": ["C"],
  "Foreign company": ["C"],
  "One Person Company (OPC)": ["C"],
  "One person Company(OPC)": ["C"],
  "One person Company (OPC)": ["C"],
};

/**
 * Validates Business PAN using common PAN validation across all entity types:
 * - Checks format (5 letters, 4 digits, 1 letter)
 * - 4th character must be a valid entity category code (A, B, C, F, G, H, J, L, P, T)
 */
export const validateBusinessPan = (
  pan: string | undefined | null,
  _constitution?: string | undefined | null,
): string | null => {
  return validatePan(pan || "", { label: "Business PAN" });
};

/* -------------------------------------------------------------------------- */
/* Date of Commencement of Business                                           */
/* -------------------------------------------------------------------------- */

export const COMMENCEMENT_DATE_LIMITS = {
  maxYearsInPast: 100,
  maxDaysInFuture: 0,
} as const;

/**
 * Validates Date of Commencement of Business:
 * - Must be a valid calendar date
 * - Cannot be in the future
 * - Rejects impossible dates or dates older than 100 years
 */
export const validateCommencementDate = (
  date: string | undefined | null,
  today: Date = new Date(),
): string | null => {
  const raw = String(date ?? "").trim();
  if (!raw) {
    return "Date of commencement is required";
  }

  const parsed = parseDate(raw);
  if (!parsed) {
    return "Please select a valid date";
  }

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + COMMENCEMENT_DATE_LIMITS.maxDaysInFuture);
  const maxIso = maxDate.toISOString().slice(0, 10);
  const dateIso = parsed.toISOString().slice(0, 10);

  if (dateIso > maxIso) {
    return "Date of commencement cannot be in the future";
  }

  const minDate = new Date(today);
  minDate.setFullYear(
    minDate.getFullYear() - COMMENCEMENT_DATE_LIMITS.maxYearsInPast,
  );
  const minIso = minDate.toISOString().slice(0, 10);

  if (dateIso < minIso) {
    return `Commencement date cannot be more than ${COMMENCEMENT_DATE_LIMITS.maxYearsInPast} years in the past`;
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/* District                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Validates District Name:
 * - Unicode alphabets, single spaces, and hyphens
 * - Rejects numbers and unsupported special characters
 * - Rejects consecutive spaces or hyphens
 * - Length: 2 to 50 characters
 */
export const validateDistrict = (
  district: string | undefined | null,
  options?: BaseValidationOptions | string,
): string | null => {
  const opts: BaseValidationOptions =
    typeof options === "string" ? { label: options } : options || {};
  const label = opts.label || "District";
  const required = opts.required !== false;
  const raw = String(district ?? "");

  if (!raw.trim()) {
    return required ? `${label} is required` : null;
  }

  if (raw.startsWith(" ")) {
    return `${label} cannot start with a space`;
  }

  const trimmed = raw.trim();

  if (/^[ \-.'\s]+/.test(trimmed)) {
    return `${label} must start with a letter`;
  }

  if (/\s{2,}/.test(raw)) {
    return "Only one space is allowed between words";
  }

  if (/\d/.test(raw)) {
    return `${label} must contain only letters`;
  }

  if (/([\-.'])\1+/.test(raw) || /[\-.']\s*[\-.']+/.test(raw)) {
    return `${label} cannot contain consecutive dots or hyphens`;
  }

  const min = opts.minLength ?? 2;
  const max = opts.maxLength ?? 50;

  if (trimmed.length < min) {
    return `${label} must be at least ${min} characters`;
  }
  if (trimmed.length > max) {
    return `${label} cannot exceed ${max} characters`;
  }

  if (!/^[\p{L}\s.'-]+$/u.test(trimmed)) {
    return `${label} must contain only letters`;
  }

  if (/[\-.']$/.test(trimmed)) {
    return `${label} cannot end with a special character`;
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/* HSN / SAC Code                                                             */
/* -------------------------------------------------------------------------- */

export const HSN_SAC_LENGTHS = [4, 6, 8] as const;

/**
 * Validates HSN or SAC code:
 * - Digits only
 * - Exactly 4, 6, or 8 digits
 */
export const validateHsnSac = (
  code: string | undefined | null,
  options?: BaseValidationOptions | string,
): string | null => {
  const opts: BaseValidationOptions =
    typeof options === "string" ? { label: options } : options || {};
  const label = opts.label || "HSN / SAC code";
  const required = opts.required !== false;
  const raw = String(code ?? "").trim();

  if (!raw) {
    return required ? `${label} is required` : null;
  }

  if (!/^\d+$/.test(raw)) {
    return `${label} must contain digits only`;
  }

  if (!(HSN_SAC_LENGTHS as readonly number[]).includes(raw.length)) {
    return `${label} must be 4, 6 or 8 digits`;
  }

  if (raw.startsWith("00")) {
    return `${label} must start with a valid chapter (01-98 for HSN, 99 for SAC)`;
  }

  if (raw.startsWith("99")) {
    if (raw.length !== 6) {
      return "SAC code must be 6 digits";
    }
    return null;
  }

  return null;
};

export const isValidHsnSac = (code: string): boolean =>
  validateHsnSac(code, { required: true }) === null;

export interface HsnSacClassification {
  isValid: boolean;
  type: "HSN" | "SAC";
  category: "Goods" | "Services";
  digits: number;
  badgeText: string;
}

/**
 * Returns classification details (HSN Goods vs SAC Services) for valid HSN/SAC codes:
 * - HSN (Goods): Chapters 01 through 98, numeric lengths 4, 6, or 8 digits.
 * - SAC (Services): Always starts with 99, 6 digits uniformly.
 */
export const getHsnSacClassification = (
  code: string | undefined | null,
): HsnSacClassification | null => {
  const raw = String(code ?? "").trim();
  if (!/^\d+$/.test(raw)) return null;

  // SAC codes always start with 99 and are 6 digits uniformly
  if (raw.startsWith("99")) {
    if (raw.length === 6) {
      return {
        isValid: true,
        type: "SAC",
        category: "Services",
        digits: 6,
        badgeText: "✓ SAC (Services) — 6 digits",
      };
    }
    return null;
  }

  const length = raw.length;
  if (![4, 6, 8].includes(length)) return null;

  // HSN codes start with chapters 01 through 98 (Goods)
  const chapter = parseInt(raw.slice(0, 2), 10);
  if (chapter >= 1 && chapter <= 98) {
    return {
      isValid: true,
      type: "HSN",
      category: "Goods",
      digits: length,
      badgeText: `✓ HSN (Goods) — ${length} digits`,
    };
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/* Account Holder Name (Business or Individual)                               */
/* -------------------------------------------------------------------------- */

/**
 * Validates Account Holder Name:
 * - Allows alphabets, single spaces, & , . - '
 * - Rejects numbers, consecutive spaces, and consecutive punctuation
 * - Length: 2 to 100 characters
 */
export const validateAccountHolderName = (
  name: string | undefined | null,
  options?: BaseValidationOptions | string,
): string | null => {
  const opts: BaseValidationOptions =
    typeof options === "string" ? { label: options } : options || {};
  const label = opts.label || "Account holder name";
  const required = opts.required !== false;
  const raw = String(name ?? "");

  if (!raw.trim()) {
    return required ? `${label} is required` : null;
  }

  if (raw.startsWith(" ")) {
    return `${label} cannot start with a space`;
  }

  const trimmed = raw.trim();

  if (/^[ .'-]/.test(trimmed)) {
    return `${label} cannot start with a special character`;
  }

  if (/\s{2,}/.test(raw)) {
    return "Only one space is allowed between words";
  }

  if (trimmed.length < 2) {
    return `${label} must be at least 2 characters`;
  }
  if (trimmed.length > 100) {
    return `${label} cannot exceed 100 characters`;
  }

  if (!/\p{L}/u.test(trimmed)) {
    return `${label} must contain letters`;
  }

  if (/\d/.test(raw)) {
    return `${label} must contain only letters`;
  }

  if (/([.'-])\1+/.test(raw) || /[.'-]\s*[.'-]+/.test(raw)) {
    return `${label} cannot contain consecutive special characters`;
  }

  if (!/^[\p{L}\s.'-]+$/u.test(trimmed)) {
    return `${label} must contain only letters`;
  }

  if (/[.'-]$/.test(trimmed)) {
    return `${label} cannot end with a special character`;
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/* Bank Name                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Validates Bank Name:
 * - Allows letters, single spaces, and punctuation: . & - '
 * - Rejects numbers, consecutive spaces, and consecutive punctuation
 * - Length: 2 to 100 characters
 */
export const validateBankName = (
  bankName: string | undefined | null,
  options?: BaseValidationOptions | string,
): string | null => {
  const opts: BaseValidationOptions =
    typeof options === "string" ? { label: options } : options || {};
  const label = opts.label || "Bank name";
  const required = opts.required !== false;
  const raw = String(bankName ?? "");

  if (!raw.trim()) {
    return required ? `${label} is required` : null;
  }

  if (raw.startsWith(" ")) {
    return `${label} cannot start with a space`;
  }

  const trimmed = raw.trim();

  if (/^[ .&'-]/.test(trimmed)) {
    return `${label} cannot start with a special character`;
  }

  if (/\s{2,}/.test(raw)) {
    return "Only one space is allowed between words";
  }

  if (/\d/.test(raw)) {
    return `${label} must contain only letters`;
  }

  if (/([.&'-])\1+/.test(raw) || /[.&'-]\s*[.&'-]+/.test(raw)) {
    return `${label} cannot contain consecutive special characters`;
  }

  if (trimmed.length < 2) {
    return `${label} must be at least 2 characters`;
  }
  if (trimmed.length > 100) {
    return `${label} cannot exceed 100 characters`;
  }

  if (!/^[\p{L}\s.&'-]+$/u.test(trimmed)) {
    return `${label} must contain only letters`;
  }

  if (/[.&'-]$/.test(trimmed)) {
    return `${label} cannot end with a special character`;
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/* Confirm Account Number                                                     */
/* -------------------------------------------------------------------------- */

export const validateConfirmAccountNumber = (
  accountNumber?: string | null,
  confirmAccountNumber?: string | null,
): string | null => {
  const acc = (accountNumber || "").trim();
  const conf = (confirmAccountNumber || "").trim();

  if (!conf) {
    return "Confirm account number is required";
  }
  if (!/^\d+$/.test(conf)) {
    return "Confirm account number must contain digits only";
  }
  if (conf.length < 9 || conf.length > 18) {
    return "Enter a valid bank account number (9 to 18 digits)";
  }
  if (acc !== conf) {
    return "Account numbers do not match.";
  }
  return null;
};

/* -------------------------------------------------------------------------- */
/* Designation                                                                */
/* -------------------------------------------------------------------------- */

export const validateDesignation = (
  designation: string | undefined | null,
  options?: BaseValidationOptions | string,
): string | null => {
  const opts: BaseValidationOptions =
    typeof options === "string" ? { label: options } : options || {};
  const label = opts.label || "Designation";
  const required = opts.required !== false;
  const raw = String(designation ?? "");

  if (!raw.trim()) {
    return required ? `${label} is required` : null;
  }

  if (raw.startsWith(" ")) {
    return `${label} cannot start with a space`;
  }

  const trimmed = raw.trim();

  if (/^[ /.'-]/.test(trimmed)) {
    return `${label} cannot start with a special character`;
  }

  if (/\s{2,}/.test(raw)) {
    return "Only one space is allowed between words";
  }

  if (/\d/.test(raw)) {
    return `${label} must contain only letters`;
  }

  if (/([/.'-])\1+/.test(raw) || /[/.'-]\s*[/.'-]+/.test(raw)) {
    return `${label} cannot contain consecutive special characters`;
  }

  if (trimmed.length < 2) {
    return `${label} must be at least 2 characters`;
  }
  if (trimmed.length > 60) {
    return `${label} cannot exceed 60 characters`;
  }

  if (!/^[\p{L}\s/.'-]+$/u.test(trimmed)) {
    return `${label} must contain only letters`;
  }

  if (/[/.'-]$/.test(trimmed)) {
    return `${label} cannot end with a special character`;
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/* Branch                                                                     */
/* -------------------------------------------------------------------------- */

export const validateBranch = (
  branch: string | undefined | null,
  options?: BaseValidationOptions | string,
): string | null => {
  const opts: BaseValidationOptions =
    typeof options === "string" ? { label: options } : options || {};
  const label = opts.label || "Branch";
  const required = opts.required !== false;
  const raw = String(branch ?? "");

  if (!raw.trim()) {
    return required ? `${label} is required` : null;
  }

  if (raw.startsWith(" ")) {
    return `${label} cannot start with a space`;
  }

  const trimmed = raw.trim();

  if (/^[ .,\/-]/.test(trimmed)) {
    return `${label} cannot start with a special character`;
  }

  if (/\s{2,}/.test(raw)) {
    return "Only one space is allowed between words";
  }

  if (/([.,\/-])\1+/.test(raw) || /[.,\/-]\s*[.,\/-]+/.test(raw)) {
    return `${label} cannot contain consecutive special characters`;
  }

  if (trimmed.length < 2) {
    return `${label} must be at least 2 characters`;
  }
  if (trimmed.length > 60) {
    return `${label} cannot exceed 60 characters`;
  }

  // Must contain letters
  if (!/\p{L}/u.test(trimmed)) {
    return `${label} must contain letters`;
  }

  // Allowed characters: letters, numbers, spaces, and single .,/-
  if (!/^[\p{L}\p{N}\s.,\/-]+$/u.test(trimmed)) {
    return `${label} contains invalid special characters`;
  }

  if (/[.,\/-]$/.test(trimmed)) {
    return `${label} cannot end with a special character`;
  }

  return null;
};
