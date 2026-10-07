import type { FC, SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement>

export const PanCardIcon: FC<IconProps> = ({
  width = 22,
  height = 22,
  className,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="10" r="2.5" />
    <line x1="14" y1="9" x2="18" y2="9" />
    <line x1="14" y1="13" x2="17" y2="13" />
    <line x1="6" y1="16" x2="18" y2="16" />
  </svg>
)

export const AadhaarCardIcon: FC<IconProps> = ({
  width = 22,
  height = 22,
  className,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M9.5 3.5a3.5 3.5 0 0 1 5 0" />
    <path d="M7 6.5a7 7 0 0 1 10 0" />
    <path d="M4.5 10.5a10.5 10.5 0 0 1 15 0" />
    <path d="M4 14.5c0 1.5.3 3 .8 4" />
    <path d="M6.5 12a7.5 7.5 0 0 1 11 0v3" />
    <path d="M9 13.5a4 4 0 0 1 6 0v4" />
    <path d="M11.5 15a1.5 1.5 0 0 1 1 0v4.5" />
    <path d="M6.5 18c.5 1.8 1.5 3 2.5 3.5" />
    <path d="M17.5 17.5c-.5 1.8-1.5 3-2.5 3.5" />
  </svg>
)

export const BusinessRegIcon: FC<IconProps> = ({
  width = 22,
  height = 22,
  className,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

export const AddressProofIcon: FC<IconProps> = ({
  width = 22,
  height = 22,
  className,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

export const BankProofIcon: FC<IconProps> = ({
  width = 22,
  height = 22,
  className,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <line x1="3" y1="21" x2="21" y2="21" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <polyline points="5 6 12 3 19 6" />
    <line x1="4" y1="10" x2="4" y2="21" />
    <line x1="20" y1="10" x2="20" y2="21" />
    <line x1="8" y1="14" x2="8" y2="17" />
    <line x1="12" y1="14" x2="12" y2="17" />
    <line x1="16" y1="14" x2="16" y2="17" />
  </svg>
)

export const PhotoIcon: FC<IconProps> = ({
  width = 22,
  height = 22,
  className,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export const CameraButtonIcon: FC<IconProps> = ({
  width = 17,
  height = 17,
  className,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

export const CloudUploadIcon: FC<IconProps> = ({
  width = 17,
  height = 17,
  className,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
)

export const CheckCircleIcon: FC<IconProps> = ({
  width = 14,
  height = 14,
  className,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)



export const ViewEyeIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const ReplaceRotateIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
    <polyline points="21 3 21 8 16 8" />
    <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
    <polyline points="3 21 3 16 8 16" />
  </svg>
)

export const DeleteTrashIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

export const DocChecklistIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <polyline points="8.5 9 10 10.5 13 7.5" />
    <line x1="14.5" y1="9" x2="16" y2="9" />
    <polyline points="8.5 15 10 16.5 13 13.5" />
    <line x1="14.5" y1="15" x2="16" y2="15" />
  </svg>
)

export const DocPlaceholderIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
)

export const EditPencilIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    <line x1="15" y1="5" x2="19" y2="9" />
  </svg>
)

export const UserSignatoryIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export const AlertCircleIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

export const SecurityShieldIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)
