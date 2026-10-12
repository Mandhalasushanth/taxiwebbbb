/** Profile kind: all customer types use the individual profile form */
export type ProfileKind = 'individual'

export const getProfileKind = (_type?: string | null): ProfileKind => 'individual'
