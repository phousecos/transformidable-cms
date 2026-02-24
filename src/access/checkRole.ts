import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor' | 'brandContributor' | 'sponsorManager'

/**
 * Check if a user has one of the specified roles.
 * Uses loose typing to work with Payload's UntypedUser.
 */
export const checkRole = (allRoles: Role[], user: Record<string, unknown> | null): boolean => {
  if (!user) return false
  return allRoles.some((role) => user.role === role)
}

export const isAdmin: Access = ({ req: { user } }) => checkRole(['admin'], user)

export const isAdminOrEditor: Access = ({ req: { user } }) =>
  checkRole(['admin', 'editor'], user)

export const isAdminOrEditorOrContributor: Access = ({ req: { user } }) =>
  checkRole(['admin', 'editor', 'brandContributor'], user)

export const isSponsorManagerOrAdmin: Access = ({ req: { user } }) =>
  checkRole(['admin', 'sponsorManager'], user)

export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)

export const isAdminFieldAccess: FieldAccess = ({ req: { user } }) => checkRole(['admin'], user)

export const isAdminOrEditorFieldAccess: FieldAccess = ({ req: { user } }) =>
  checkRole(['admin', 'editor'], user)
