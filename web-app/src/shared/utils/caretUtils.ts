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

  // Case 2: Formatting characters like spaces, dashes, slashes, or currency symbols
  const formattingRegex = /[\s\-_/.,()+₹]/
  const hasFormattingChars = formattingRegex.test(formattedValue) || formattingRegex.test(rawValue)

  if (hasFormattingChars) {
    const rawBefore = rawValue.slice(0, caret)
    const rawCleanBefore = rawBefore.replace(/[\s\-_/.,()+₹]/g, '')
    const targetCleanCount = rawCleanBefore.length

    if (targetCleanCount === 0) {
      return 0
    }

    let cleanSeen = 0
    let formattedIndex = 0
    while (formattedIndex < formattedValue.length) {
      const ch = formattedValue[formattedIndex]
      if (!formattingRegex.test(ch)) {
        cleanSeen++
        if (cleanSeen === targetCleanCount) {
          return formattedIndex + 1
        }
      }
      formattedIndex++
    }
    return formattedValue.length
  }

  // Case 3: Character additions / deletions (e.g. stripping invalid characters or trimming)
  const lenDiff = formattedValue.length - rawValue.length
  const targetPos = caret + lenDiff
  return Math.max(0, Math.min(targetPos, formattedValue.length))
}

