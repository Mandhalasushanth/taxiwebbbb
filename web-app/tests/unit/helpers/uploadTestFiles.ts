/**
 * Files with genuine leading bytes, so they pass the application-wide upload rule
 * (extension, MIME type, size and file signature) the way real uploads do.
 */
const KINDS: Record<string, { type: string; signature: number[] }> = {
  pdf: { type: 'application/pdf', signature: [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37] },
  png: { type: 'image/png', signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  jpg: { type: 'image/jpeg', signature: [0xff, 0xd8, 0xff, 0xe0] },
  jpeg: { type: 'image/jpeg', signature: [0xff, 0xd8, 0xff, 0xe0] },
  xlsx: { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', signature: [0x50, 0x4b, 0x03, 0x04] },
  xls: { type: 'application/vnd.ms-excel', signature: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] },
}

/** A valid upload named `name` (its type is taken from the extension) */
export const uploadTestFile = (name: string, body = 'test document'): File => {
  const kind = KINDS[name.split('.').pop()?.toLowerCase() ?? '']
  if (!kind) throw new Error(`uploadTestFile: unsupported extension in "${name}"`)
  return new File([new Uint8Array(kind.signature), body], name, { type: kind.type })
}

/**
 * Picks files in a file input and waits until the upload rule has checked them
 * (validation reads each file's leading bytes, so it finishes asynchronously).
 */
export const pickFiles = async (input: HTMLElement, files: File[]): Promise<void> => {
  const { act, fireEvent } = await import('@testing-library/react')
  await act(async () => {
    fireEvent.change(input, { target: { files } })
    // Generous wait: file reads are slower when the whole suite runs in parallel
    await new Promise((resolve) => setTimeout(resolve, 150))
  })
}
