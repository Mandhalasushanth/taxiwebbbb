export { itrRoutes } from './routes'
export { useRevisedItr } from './hooks/useRevisedItr'
export { itrService } from './services/itrService'
export { revisedItrService } from './services/revisedItrService'
export type { ItrFilters, ItrItem } from './types/itr.types'
export type {
  AssessmentYear,
  RevisionReasonKey,
  RevisionReasonOption,
  FindOriginalReturnPayload,
  OriginalReturnDetails,
  IncomeCorrectionState,
  IncomeCorrectionOriginals,
  DocumentTypeId,
  UploadedDocument,
  DocumentSlotConfig,
  RevisedItrFormState,
  RevisedItrValidationErrors,
} from './types/revisedItr.types'
export {
  ItrAmountInput,
  formatIndianNumber,
  formatIndianCurrency,
  parseIndianNumber,
} from './components/ItrFiling/itrFiling.constants'
export type { ItrAmountInputProps } from './components/ItrFiling/itrFiling.constants'
