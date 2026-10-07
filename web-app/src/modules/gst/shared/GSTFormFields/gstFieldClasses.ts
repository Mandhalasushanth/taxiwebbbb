export const fieldErrorId = (id: string) => `${id}-error`

export const fieldInputClass = (error?: string | null, extra = '') =>
  ['gst-field__input', extra, error ? 'gst-field__input--error' : ''].filter(Boolean).join(' ')
