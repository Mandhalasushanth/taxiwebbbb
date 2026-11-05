import { describe, it, expect } from 'vitest'
import { calculateNextCaretPosition } from '../../src/shared/utils/caretUtils'
import {
  formatRegistrationField,
  formatNameInput,
  formatAddressInput,
  formatCityInput,
  formatEmailInput,
} from '../../src/modules/authentication/utils/registrationFormatters'
import { INITIAL_REGISTRATION_VALUES } from '../../src/modules/authentication/validation/registrationValidation'

describe('calculateNextCaretPosition spacebar and typing behavior', () => {
  it('preserves caret at end when typing single space', () => {
    // "John " -> "John "
    const caret = calculateNextCaretPosition('John ', 5, 'John ')
    expect(caret).toBe(5)
  })

  it('keeps caret after the space when typing 2nd consecutive space at end', () => {
    // User types 2nd space: rawValue is "John  ", caret is 6, formatted collapses to "John "
    const caret = calculateNextCaretPosition('John  ', 6, 'John ')
    expect(caret).toBe(5)
  })

  it('keeps caret after the space when typing 3rd consecutive space at end', () => {
    const caret = calculateNextCaretPosition('John   ', 7, 'John ')
    expect(caret).toBe(5)
  })

  it('preserves caret after single space when typing between words', () => {
    // "John  Doe", caret 6 -> "John Doe" (caret should stay at 5 after "John ")
    const caret = calculateNextCaretPosition('John  Doe', 6, 'John Doe')
    expect(caret).toBe(5)
  })

  it('preserves caret at start when leading spaces are stripped', () => {
    // " " -> ""
    expect(calculateNextCaretPosition(' ', 1, '')).toBe(0)
    // "  " -> ""
    expect(calculateNextCaretPosition('  ', 2, '')).toBe(0)
    // " John" -> "John"
    expect(calculateNextCaretPosition(' John', 1, 'John')).toBe(0)
  })

  it('preserves caret position when filtering out invalid characters in the middle', () => {
    // "Jo1hn", caret 3 -> "John", caret 2
    expect(calculateNextCaretPosition('Jo1hn', 3, 'John')).toBe(2)
  })

  it('correctly handles date mask insertion', () => {
    // "123", caret 3 -> "12-3", caret 4
    expect(calculateNextCaretPosition('123', 3, '12-3')).toBe(4)
  })

  it('keeps caret at correct position when spaces are stripped from email', () => {
    // User tries to type space after "hygbjhb" -> "hygbjhb ", caret 8 -> "hygbjhb", caret should stay at 7
    expect(calculateNextCaretPosition('hygbjhb ', 8, 'hygbjhb')).toBe(7)
    // Space typed in middle of email: "john @example.com", caret 5 -> "john@example.com", caret should stay at 4
    expect(calculateNextCaretPosition('john @example.com', 5, 'john@example.com')).toBe(4)
  })
})

describe('Registration Form Field Formatters Single Space Enforcement', () => {
  it('collapses multiple consecutive spaces to a single space in full name', () => {
    expect(formatNameInput('John    Doe', '', INITIAL_REGISTRATION_VALUES)).toBe('John Doe')
  })

  it('prevents leading spaces in full name', () => {
    expect(formatNameInput('   John Doe', '', INITIAL_REGISTRATION_VALUES)).toBe('John Doe')
  })

  it('collapses multiple consecutive spaces to a single space in addressLine1', () => {
    const res = formatRegistrationField('addressLine1', 'rghjk      werty', INITIAL_REGISTRATION_VALUES)
    expect(res).toBe('rghjk werty')
  })

  it('prevents leading spaces in addressLine1', () => {
    const res = formatRegistrationField('addressLine1', '   Flat 101', INITIAL_REGISTRATION_VALUES)
    expect(res).toBe('Flat 101')
  })

  it('collapses multiple consecutive spaces in city', () => {
    const res = formatRegistrationField('city', 'nbhb  jhuj   jjhufghj', INITIAL_REGISTRATION_VALUES)
    expect(res).toBe('nbhb jhuj jjhufghj')
  })

  it('prevents leading spaces in city', () => {
    const res = formatRegistrationField('city', '   Mumbai', INITIAL_REGISTRATION_VALUES)
    expect(res).toBe('Mumbai')
  })

  it('removes spaces from email entirely', () => {
    const res = formatRegistrationField('email', 'john . doe @ example . com', INITIAL_REGISTRATION_VALUES)
    expect(res).toBe('john.doe@example.com')
  })

  it('filters out disallowed special characters and collapses consecutive punctuation in addressLine1', () => {
    // Strips @, !, $, %, ^, &, *, etc.
    const res1 = formatRegistrationField(
      'addressLine1',
      'rgg regrg rgr rgerg@@@@@@@@@@@@@@@@@@@@@@@@@@@',
      INITIAL_REGISTRATION_VALUES,
    )
    expect(res1).toBe('rgg regrg rgr rgerg')

    const res2 = formatRegistrationField(
      'addressLine1',
      'Flat 101,,,,,,, Street 5------Near Park',
      INITIAL_REGISTRATION_VALUES,
    )
    expect(res2).toBe('Flat 101, Street 5-Near Park')

    const res3 = formatRegistrationField(
      'addressLine1',
      'erg@@@@!!!!@@@@####$$$$$%%%%%^^^^^^&&&&****(((((()))__::"""???>>?//.',
      INITIAL_REGISTRATION_VALUES,
    )
    expect(res3).toBe('erg#')
  })

  it('collapses consecutive dots and hyphens in city', () => {
    const res = formatRegistrationField('city', 'ghjkj--........----------', INITIAL_REGISTRATION_VALUES)
    expect(res).toBe('ghjkj-')

    const res2 = formatRegistrationField('city', '..---New Delhi', INITIAL_REGISTRATION_VALUES)
    expect(res2).toBe('New Delhi')
  })

  it('allows single hyphen and slash for house numbers (e.g. 3/345-45) while rejecting consecutive ones', () => {
    // Single / and - are fully preserved
    const res1 = formatRegistrationField('addressLine1', '3/345-45', INITIAL_REGISTRATION_VALUES)
    expect(res1).toBe('3/345-45')

    const res2 = formatRegistrationField('addressLine1', 'Plot No. 12/A, Street-4', INITIAL_REGISTRATION_VALUES)
    expect(res2).toBe('Plot No. 12/A, Street-4')

    // Consecutive // and -- are collapsed
    const res3 = formatRegistrationField('addressLine1', '3//345--45', INITIAL_REGISTRATION_VALUES)
    expect(res3).toBe('3/345-45')

    // Mixed consecutive /- is collapsed
    const res4 = formatRegistrationField('addressLine1', '3/-45', INITIAL_REGISTRATION_VALUES)
    expect(res4).toBe('3/45')
  })
})

