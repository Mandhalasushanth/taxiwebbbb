/**
 * Auto-save storage namespace per module: drafts are kept under taxedge_<namespace>_draft_<user>_<service>.
 * The values are part of the stored keys — changing one would stop earlier drafts from resuming.
 */
export const DRAFT_NAMESPACES = {
  gst: 'gst',
  itr: 'itr',
  incorporation: 'incorporation',
  loan: 'loan',
} as const

export type DraftNamespace = (typeof DRAFT_NAMESPACES)[keyof typeof DRAFT_NAMESPACES]
