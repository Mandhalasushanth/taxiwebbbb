// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UploadDocument } from '../../src/shared/components'
import { ItrDocumentsChecklistView } from '../../src/modules/itr/components/ItrFiling/DocumentsChecklist/ItrDocumentsChecklistView'
import { NoticeDocument } from '../../src/modules/itr/components/TaxNoticeAssistance/NoticeInformation/NoticeDocument'
import { SupportingDocuments } from '../../src/modules/itr/components/TaxNoticeAssistance/SupportingDocuments/SupportingDocuments'
import { Step4DocumentUpload } from '../../src/modules/itr/components/RevisedItr/DocumentUpload/Step4DocumentUpload'
import { TdsRefundDocuments } from '../../src/modules/itr/components/TdsRefund/TdsRefundDocuments/TdsRefundDocuments'

describe('ITR Modules Document Preview Consistency', () => {
  let createdObjectUrls: string[] = []
  let openedUrls: string[] = []

  beforeEach(() => {
    createdObjectUrls = []
    openedUrls = []

    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob: Blob | MediaSource) => {
      const url = `blob:http://localhost:5173/mock-${Math.random().toString(36).substring(2, 9)}`
      createdObjectUrls.push(url)
      return url
    })

    vi.spyOn(window, 'open').mockImplementation((url?: string | URL) => {
      if (typeof url === 'string') {
        openedUrls.push(url)
      }
      return {
        focus: vi.fn(),
      } as unknown as Window
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('TdsRefund: clicking View Document opens blob URL in new window', () => {
    const dummyFile = new File(['tds-doc-data'], 'GST_Compliance.pdf', { type: 'application/pdf' })

    render(
      <MemoryRouter>
        <TdsRefundDocuments
          initialUploads={{
            pan: { name: 'GST_Compliance.pdf', size: '1.2 MB', file: dummyFile },
          }}
        />
      </MemoryRouter>
    )

    const viewBtn = screen.getByTestId('view-doc-pan')
    expect(viewBtn).toBeDefined()
    fireEvent.click(viewBtn)

    expect(window.open).toHaveBeenCalled()
    expect(openedUrls[0]).toMatch(/^blob:http:\/\/localhost:5173\//)
  })

  it('ITR Filing: uploading and viewing document opens blob URL identically to TDS Refund', () => {
    let uploadedDocsState: any = {}
    const handleUploadDoc = vi.fn((docId, docInfo) => {
      uploadedDocsState = { [docId]: docInfo }
    })

    const { rerender } = render(
      <MemoryRouter>
        <ItrDocumentsChecklistView
          uploadedDocs={uploadedDocsState}
          onUploadDoc={handleUploadDoc}
          onRemoveDoc={vi.fn()}
          onContinue={vi.fn()}
        />
      </MemoryRouter>
    )

    const sampleFile = new File(['itr-file-bytes'], 'Form16_FY2024.pdf', { type: 'application/pdf' })
    const fileInput = screen.getByTestId('doc-card-form16').querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeDefined()

    fireEvent.change(fileInput, { target: { files: [sampleFile] } })

    expect(handleUploadDoc).toHaveBeenCalled()
    expect(handleUploadDoc.mock.calls[0][1].file).toBe(sampleFile)

    rerender(
      <MemoryRouter>
        <ItrDocumentsChecklistView
          uploadedDocs={uploadedDocsState}
          onUploadDoc={handleUploadDoc}
          onRemoveDoc={vi.fn()}
          onContinue={vi.fn()}
        />
      </MemoryRouter>
    )

    const viewBtn = screen.getByTestId('view-doc-form16')
    fireEvent.click(viewBtn)

    expect(window.open).toHaveBeenCalled()
    expect(openedUrls[0]).toMatch(/^blob:http:\/\/localhost:5173\//)
  })

  it('Tax Notice Assistance (NoticeDocument Step 2): viewing uploaded notice file opens blob URL', () => {
    const noticeFile = new File(['notice-bytes'], 'Notice_143_1.pdf', { type: 'application/pdf' })

    render(
      <MemoryRouter>
        <NoticeDocument
          formData={{
            pan: 'ABCDE1234F',
            assessmentYear: 'AY 2026-27',
            noticeType: 'Section 143(1)(a)',
            noticeDate: '2026-05-01',
            noticeReference: 'REF-1234',
            responseDueDate: '2026-06-01',
            explanation: 'Discrepancy explained',
            documentFile: noticeFile,
            documentFileName: 'Notice_143_1.pdf',
            documentFileSize: '1.5 MB',
          }}
          onChange={vi.fn()}
          onBack={vi.fn()}
          onNext={vi.fn()}
          onSaveDraftAndExit={vi.fn()}
        />
      </MemoryRouter>
    )

    const viewBtn = screen.getByTestId('view-doc-notice-doc')
    expect(viewBtn).toBeDefined()
    fireEvent.click(viewBtn)

    expect(window.open).toHaveBeenCalled()
    expect(openedUrls[0]).toMatch(/^blob:http:\/\/localhost:5173\//)
  })

  it('Tax Notice Assistance (SupportingDocuments Step 4): viewing supporting doc opens blob URL', () => {
    const supportFile = new File(['supporting-data'], 'Bank_Statement.pdf', { type: 'application/pdf' })

    render(
      <MemoryRouter>
        <SupportingDocuments
          formData={{
            pan: 'ABCDE1234F',
            assessmentYear: 'AY 2026-27',
            noticeType: 'Section 143(1)(a)',
            noticeDate: '2026-05-01',
            noticeReference: 'REF-1234',
            responseDueDate: '2026-06-01',
            explanation: 'Explanation',
            documentFile: null,
            documentFileName: '',
            documentFileSize: '',
            supportingDocuments: {
              'bank-statements': {
                fileName: 'Bank_Statement.pdf',
                fileSize: '2.1 MB',
                file: supportFile,
              },
            },
          }}
          onChange={vi.fn()}
          onNext={vi.fn()}
          onBack={vi.fn()}
          onSaveDraftAndExit={vi.fn()}
        />
      </MemoryRouter>
    )

    const viewBtn = screen.getByTestId('view-doc-bank-statements')
    expect(viewBtn).toBeDefined()
    fireEvent.click(viewBtn)

    expect(window.open).toHaveBeenCalled()
    expect(openedUrls[0]).toMatch(/^blob:http:\/\/localhost:5173\//)
  })

  it('Revised ITR: viewing uploaded revision document opens blob URL', () => {
    const revisionFile = new File(['revised-data'], 'Revised_Proof.pdf', { type: 'application/pdf' })

    render(
      <MemoryRouter>
        <Step4DocumentUpload
          requiredSlots={[
            {
              id: 'pan',
              title: 'PAN Card',
              subtitle: 'Front copy',
              isRequired: true,
              iconBg: '#eff6ff',
              iconColor: '#2563eb',
            },
          ]}
          additionalSlots={[]}
          uploadedDocuments={{
            pan: {
              id: 'pan',
              fileName: 'Revised_Proof.pdf',
              fileSize: '1.8 MB',
              uploadedAt: '10:00 AM',
              file: revisionFile,
            },
          }}
          onUpload={vi.fn()}
          onRemove={vi.fn()}
        />
      </MemoryRouter>
    )

    const viewBtn = screen.getByTestId('view-doc-pan')
    expect(viewBtn).toBeDefined()
    fireEvent.click(viewBtn)

    expect(window.open).toHaveBeenCalled()
    expect(openedUrls[0]).toMatch(/^blob:http:\/\/localhost:5173\//)
  })

  it('UploadDocument component preserves local file and opens blob URL even if parent lacks file prop', () => {
    render(
      <MemoryRouter>
        <UploadDocument
          id="generic-doc"
          title="Owner NOC"
          isUploaded={true}
          fileName="Previous_Year_ITR_Change_Report.docx"
        />
      </MemoryRouter>
    )

    const fileInput = screen.getByTestId('doc-card-generic-doc').querySelector('input[type="file"]') as HTMLInputElement
    const uploadedFile = new File(['test doc content'], 'Previous_Year_ITR_Change_Report.docx', {
      type: 'application/pdf',
    })

    fireEvent.change(fileInput, { target: { files: [uploadedFile] } })

    const viewBtn = screen.getByTestId('view-doc-generic-doc')
    expect(viewBtn).toBeDefined()
    fireEvent.click(viewBtn)

    expect(window.open).toHaveBeenCalled()
    expect(openedUrls[0]).toMatch(/^blob:http:\/\/localhost:5173\//)
  })

  it('ITR shared viewItrDocument utility directly opens blob URL in new window', async () => {
    const { viewItrDocument, cacheItrUploadedFile } = await import('../../src/modules/itr/shared')
    const testFile = new File(['shared-content'], 'Direct_View_Test.pdf', { type: 'application/pdf' })

    cacheItrUploadedFile('direct-test', testFile)
    viewItrDocument({ id: 'direct-test', title: 'Test Document', fileName: 'Direct_View_Test.pdf' })

    expect(window.open).toHaveBeenCalled()
    expect(openedUrls[0]).toMatch(/^blob:http:\/\/localhost:5173\//)
  })

  it('ITRProofUpload shared component wires viewItrDocument and opens blob URL', async () => {
    const { ITRProofUpload } = await import('../../src/modules/itr/shared')
    const sampleProof = new File(['proof-bytes'], 'Proof_Document.pdf', { type: 'application/pdf' })

    render(
      <MemoryRouter>
        <ITRProofUpload
          title="Income Proof"
          selectedFile={sampleProof}
          onFileChange={vi.fn()}
          onRemoveFile={vi.fn()}
        />
      </MemoryRouter>
    )

    const viewBtn = screen.getByTestId('view-doc-itr-supporting-proof')
    expect(viewBtn).toBeDefined()
    fireEvent.click(viewBtn)

    expect(window.open).toHaveBeenCalled()
    expect(openedUrls[0]).toMatch(/^blob:http:\/\/localhost:5173\//)
  })
})
