/**
 * Centralized Validation Rules for TaxEdge Application
 * SINGLE SOURCE OF TRUTH for all common field regex patterns and length restrictions.
 */

export const VALIDATION_RULES = {
  name: {
    pattern: /^[\p{L}\s.'-]+$/u,
    minLength: 2,
    maxLength: 100,
  },
  email: {
    pattern: /^(?!.*\.\.)[A-Z0-9_%+-]+(?:\.[A-Z0-9_%+-]+)*@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)*\.[A-Z]{2,}$/i,
    maxLength: 254,
    usernameMaxLength: 64,
  },
  mobile: {
    pattern: /^[6-9]\d{9}$/,
    minLength: 10,
    maxLength: 10,
  },
  pan: {
    pattern: /^[A-Z]{3}[ABCFGHJLPT][A-Z][0-9]{4}[A-Z]$/,
    minLength: 10,
    maxLength: 10,
  },
  aadhaar: {
    pattern: /^[2-9]\d{11}$/,
    minLength: 12,
    maxLength: 12,
  },
  gstin: {
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    minLength: 15,
    maxLength: 15,
  },
  address: {
    pattern: /^[\p{L}\p{N}]+(?:[ ,./#'-][\p{L}\p{N}]+)*$/u,
    minLength: 3,
    maxLength: 150,
  },
  city: {
    pattern: /^\p{L}+(?:[ .-]\p{L}+)*$/u,
    minLength: 2,
    maxLength: 100,
  },
  pincode: {
    pattern: /^[1-9]\d{5}$/,
    minLength: 6,
    maxLength: 6,
  },
  accountNumber: {
    pattern: /^\d{9,18}$/,
    minLength: 9,
    maxLength: 18,
  },
  ifsc: {
    pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    minLength: 11,
    maxLength: 11,
  },
} as const

export type ValidationRuleKey = keyof typeof VALIDATION_RULES

