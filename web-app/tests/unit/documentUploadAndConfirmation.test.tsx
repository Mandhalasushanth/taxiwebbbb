// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { UploadDocument } from '@shared/components'
import {
  DOCUMENT_UPLOAD_RULE,
  MAX_UPLOAD_SIZE_MB,
  MAX_UPLOAD_SIZE_BYTES,
  validateUploadFile,
  uploadHintFor,
} from '@shared/upload'

afterEach(() => {
  cleanup()
})

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46] // %PDF

function createMockPdf(name: string, sizeInBytes: number): File {
  const header = new Uint8Array(PDF_MAGIC)
  const remainingSize = Math.max(0, sizeInBytes - header.length)
  const blob = new Blob([header, new Uint8Array(remainingSize)], { type: 'application/pdf' })
  return new File([blob], name, { type: 'application/pdf' })
}

describe('Document Upload Size Limit & Delete Confirmation Modal', () => {
  it('enforces 10 MB maximum file size constant and hint', () => {
    expect(MAX_UPLOAD_SIZE_MB).toBe(10)
    expect(MAX_UPLOAD_SIZE_BYTES).toBe(10 * 1024 * 1024)
    expect(DOCUMENT_UPLOAD_RULE.maxBytes).toBe(10 * 1024 * 1024)
    expect(uploadHintFor(DOCUMENT_UPLOAD_RULE)).toContain('max 10 MB')
  })

  it('accepts files under or equal to 10 MB and rejects files exceeding 10 MB', async () => {
    const validFile = createMockPdf('statement_8mb.pdf', 8 * 1024 * 1024)
    const exact10MbFile = createMockPdf('statement_10mb.pdf', 10 * 1024 * 1024)
    const tooLargeFile = createMockPdf('statement_12mb.pdf', 12 * 1024 * 1024)

    expect(await validateUploadFile(validFile, DOCUMENT_UPLOAD_RULE)).toBeNull()
    expect(await validateUploadFile(exact10MbFile, DOCUMENT_UPLOAD_RULE)).toBeNull()

    const error = await validateUploadFile(tooLargeFile, DOCUMENT_UPLOAD_RULE)
    expect(error).toMatch(/too large/i)
    expect(error).toMatch(/10(\.0)?\s*MB/i)
  })

  it('displays the confirmation popup modal when user clicks delete on an uploaded document', () => {
    const onRemove = vi.fn()
    render(
      <UploadDocument
        id="pan-card"
        title="PAN Card"
        isUploaded={true}
        fileName="my_pan.pdf"
        onRemove={onRemove}
      />
    )

    // Initially modal is not visible
    expect(screen.queryByTestId('confirm-delete-doc-modal')).toBeNull()

    // Click delete button
    const deleteBtn = screen.getByTestId('delete-doc-pan-card')
    fireEvent.click(deleteBtn)

    // Modal is now open
    expect(screen.getByTestId('confirm-delete-doc-modal')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Delete Document/i })).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to remove/i)).toBeInTheDocument()
    expect(screen.getAllByText(/my_pan\.pdf/i).length).toBeGreaterThan(0)

    // onRemove has NOT been triggered yet
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('cancels deletion when user clicks Cancel or presses Escape', () => {
    const onRemove = vi.fn()
    render(
      <UploadDocument
        id="aadhaar-card"
        title="Aadhaar Card"
        isUploaded={true}
        fileName="aadhaar_front.pdf"
        onRemove={onRemove}
      />
    )

    const deleteBtn = screen.getByTestId('delete-doc-aadhaar-card')
    fireEvent.click(deleteBtn)

    expect(screen.getByTestId('confirm-delete-doc-modal')).toBeInTheDocument()

    // Click cancel button in modal
    const cancelBtn = screen.getByTestId('cancel-delete-doc-modal')
    fireEvent.click(cancelBtn)

    // Modal closed and onRemove not called
    expect(screen.queryByTestId('confirm-delete-doc-modal')).toBeNull()
    expect(onRemove).not.toHaveBeenCalled()

    // Reopen and test Escape key
    fireEvent.click(deleteBtn)
    expect(screen.getByTestId('confirm-delete-doc-modal')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('confirm-delete-doc-modal')).toBeNull()
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('confirms deletion when user clicks Delete in the confirmation modal', () => {
    const onRemove = vi.fn()
    render(
      <UploadDocument
        id="bank-proof"
        title="Bank Proof"
        isUploaded={true}
        fileName="cancelled_cheque.pdf"
        onRemove={onRemove}
      />
    )

    const deleteBtn = screen.getByTestId('delete-doc-bank-proof')
    fireEvent.click(deleteBtn)

    // Confirm deletion
    const confirmBtn = screen.getByTestId('confirm-delete-doc-modal')
    fireEvent.click(confirmBtn)

    // Modal closed and onRemove called with document id
    expect(screen.queryByTestId('confirm-delete-doc-modal')).toBeNull()
    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith('bank-proof')
  })
})
