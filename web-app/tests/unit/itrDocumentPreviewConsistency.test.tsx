// @vitest-environment jsdom
import React from 'react'
import { pickFiles, uploadTestFile } from './helpers/uploadTestFiles'
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
    const dummyFile = uploadTestFile('GST_Compliance.pdf')

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

  it('ITR Filing: uploading and viewing document opens blob URL identically to TDS Refund', async () => {
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

    const sampleFile = uploadTestFile('Form16_FY2024.pdf')
    const fileInput = screen.getByTestId('doc-card-form16').querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeDefined()

    await pickFiles(fileInput, [sampleFile])

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
    const noticeFile = uploadTestFile('Notice_143_1.pdf')

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
    const supportFile = uploadTestFile('Bank_Statement.pdf')

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
    const revisionFile = uploadTestFile('Revised_Proof.pdf')

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

  it('UploadDocument component preserves local file and opens blob URL even if parent lacks file prop', async () => {
    render(
      <MemoryRouter>
        <UploadDocument id="generic-doc" title="Owner NOC" isUploaded={true} fileName="Previous_Year_ITR_Change_Report.pdf" />
      </MemoryRouter>
    )

    const fileInput = screen.getByTestId('doc-card-generic-doc').querySelector('input[type="file"]') as HTMLInputElement
    await pickFiles(fileInput, [uploadTestFile('Previous_Year_ITR_Change_Report.pdf')])

    fireEvent.click(screen.getByTestId('view-doc-generic-doc'))

    expect(window.open).toHaveBeenCalled()
    expect(openedUrls[0]).toMatch(/^blob:http:\/\/localhost:5173\//)
  })

  it('upload pickers list only PDF, Excel, JPG and PNG and reject anything else that is picked', async () => {
    const onUpload = vi.fn()
    render(
      <MemoryRouter>
        <UploadDocument id="rule-doc" title="Rule check" onUpload={onUpload} />
      </MemoryRouter>
    )
    const fileInput = screen.getByTestId('doc-card-rule-doc').querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput.accept).toContain('.pdf')
    expect(fileInput.accept).toContain('.xlsx')
    expect(fileInput.accept).toContain('.png')
    expect(fileInput.accept).not.toContain('.docx')

    await pickFiles(fileInput, [new File(['word'], 'notes.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })])
    expect(onUpload).not.toHaveBeenCalled()

    await pickFiles(fileInput, [uploadTestFile('statement.xlsx')])
    expect(onUpload).toHaveBeenCalledWith('rule-doc', expect.objectContaining({ name: 'statement.xlsx' }))
  })

  it('shared viewUploadedDocument opens a remembered file as a blob URL', async () => {
    const { viewUploadedDocument, uploadedFileStore } = await import('../../src/shared/upload')
    uploadedFileStore.remember('direct-test', uploadTestFile('Direct_View_Test.pdf'))

    expect(viewUploadedDocument({ id: 'direct-test', title: 'Test Document', fileName: 'Direct_View_Test.pdf' })).toBe(true)
    expect(window.open).toHaveBeenCalled()
    expect(openedUrls[0]).toMatch(/^blob:http:\/\/localhost:5173\//)
  })

  it('with no file available it never opens a placeholder page', async () => {
    const { viewUploadedDocument } = await import('../../src/shared/upload')
    expect(viewUploadedDocument({ id: 'missing-doc', title: 'Missing', fileName: 'Never_Uploaded.pdf' })).toBe(false)
    expect(window.open).not.toHaveBeenCalled()
  })
})
