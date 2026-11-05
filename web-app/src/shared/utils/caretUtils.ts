/**
 * Caret preservation utilities for controlled inputs that perform uppercase
 * or regex formatting on change.
 */

/**
 * Calculates the appropriate cursor/caret position after an input value
 * has been formatted or transformed (e.g. toUpperCase, masking, character filtering).
 *
 * @param rawValue The value in the DOM right after the user typed or deleted, before formatting.
 * @param caret The caret position in rawValue before formatting was applied.
 * @param formattedValue The formatted value produced by the formatter/state.
 */
export function calculateNextCaretPosition(
  rawValue: string,
  caret: number,
  formattedValue: string
): number {
  if (caret <= 0) return 0
  if (rawValue === formattedValue) return caret

  // Case 1: 1-to-1 character transformation (e.g. toUpperCase, toLowerCase)
  // When length is unchanged, the caret position should be preserved exactly.
  if (rawValue.length === formattedValue.length) {
    return Math.min(caret, formattedValue.length)
  }

  // If the user was typing at the very end of the input, stay at the end of formatted value
  if (caret >= rawValue.length) {
    return formattedValue.length
  }

  // Case 2: General character alignment between rawValue and formattedValue
  let rawIdx = 0
  let fmtIdx = 0

  while (rawIdx < caret && fmtIdx < formattedValue.length) {
    const rChar = rawValue[rawIdx].toLowerCase()
    const fChar = formattedValue[fmtIdx].toLowerCase()

    if (rChar === fChar) {
      rawIdx++
      fmtIdx++
    } else {
      // Check if formattedValue has an inserted character (mask delimiter like '-', ' ', '/', etc.)
      let matchedAhead = false
      for (let lookahead = 1; lookahead <= 3; lookahead++) {
        if (
          fmtIdx + lookahead < formattedValue.length &&
          formattedValue[fmtIdx + lookahead].toLowerCase() === rChar
        ) {
          fmtIdx += lookahead + 1
          rawIdx++
          matchedAhead = true
          break
        }
      }

      if (!matchedAhead) {
        // Character in rawValue was stripped/collapsed by the formatter (e.g. extra space, filtered character)
        rawIdx++
      }
    }
  }

  return Math.min(fmtIdx, formattedValue.length)
}

