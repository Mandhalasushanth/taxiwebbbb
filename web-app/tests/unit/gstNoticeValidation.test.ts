import { describe, it, expect } from 'vitest'
import { gstFieldRules } from '@modules/gst/validation/gstFieldRules'
import { gstInput, GST_MAX_LENGTH } from '@modules/gst/utils/gstInputFormatters'

describe('GST Notice Number Validation & Input Formatter', () => {
  describe('gstInput.noticeNumber', () => {
    it('caps the length at 20 characters', () => {
      const longInput = 'GTFGHJHGFGH945656776587687698798798'
      const formatted = gstInput.noticeNumber(longInput)
      expect(formatted.length).toBe(20)
      expect(formatted).toBe('GTFGHJHGFGH945656776')
    })

    it('uppercases and filters special characters except hyphens and slashes', () => {
      expect(gstInput.noticeNumber('za27-0124/00123z')).toBe('ZA27-0124/00123Z')
      expect(gstInput.noticeNumber('za27@0124#00123$z')).toBe('ZA27012400123Z')
    })

    it('matches GST_MAX_LENGTH.noticeNumber of 20', () => {
      expect(GST_MAX_LENGTH.noticeNumber).toBe(20)
    })
  })

  describe('gstFieldRules.noticeNumber', () => {
    it('accepts valid 15-character GST portal Reference Numbers (RFN)', () => {
      expect(gstFieldRules.noticeNumber('ZA270124000123Z')).toBeUndefined()
      expect(gstFieldRules.noticeNumber('ZD0701230005423')).toBeUndefined()
      expect(gstFieldRules.noticeNumber('AD270422001234M')).toBeUndefined()
    })

    it('accepts valid 20-digit CBIC Document Identification Numbers (DIN)', () => {
      expect(gstFieldRules.noticeNumber('2024041234567890ABCD')).toBeUndefined()
      expect(gstFieldRules.noticeNumber('CBIC-20240412345678')).toBeUndefined()
    })

    it('accepts valid SCN notice references with separators', () => {
      expect(gstFieldRules.noticeNumber('DRC01-27-24-000123')).toBeUndefined()
      expect(gstFieldRules.noticeNumber('ASMT10/27/2024/001')).toBeUndefined()
    })

    it('rejects empty input', () => {
      expect(gstFieldRules.noticeNumber('')).toBe('Notice number is required')
      expect(gstFieldRules.noticeNumber('   ')).toBe('Notice number is required')
    })

    it('rejects input shorter than 15 characters', () => {
      expect(gstFieldRules.noticeNumber('ZA270124')).toBe(
        'Notice number must be at least 15 characters (e.g. ZA270124000123Z)'
      )
    })

    it('rejects input exceeding 20 characters', () => {
      expect(gstFieldRules.noticeNumber('GTFGHJHGFGH945656776587687698798798')).toBe(
        'Notice number cannot exceed 20 characters'
      )
    })

    it('rejects all-letters input without digits', () => {
      expect(gstFieldRules.noticeNumber('GTFGHJHGFGHABCDE')).toBe(
        'Enter a valid alphanumeric notice number (e.g. ZA270124000123Z or CBIC DIN)'
      )
    })

    it('rejects all-digits input without letters', () => {
      expect(gstFieldRules.noticeNumber('123456789012345')).toBe(
        'Enter a valid alphanumeric notice number (e.g. ZA270124000123Z or CBIC DIN)'
      )
    })

    it('rejects repetitive character sequences', () => {
      expect(gstFieldRules.noticeNumber('AAAAA1234567890')).toBe(
        'Notice number contains invalid repetitive characters'
      )
    })
  })
})
