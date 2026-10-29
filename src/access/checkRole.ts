import type { Access, FieldAccess } from 'payload'

// People sign in through the `users` collection. Connected systems (KADE)
// authenticate as `api-clients` with an API key; they are signed in too, but
// get only the read access a collection grants them explicitly, so every
// "any logged-in user" check here must mean a person.
export const isStaffUser = (user: unknown): boolean =>
  Boolean(user) && (user as { collection?: string }).collection === 'users'

export const isApiClient = (user: unknown): boolean =>
  Boolean(user) && (user as { collection?: string }).collection === 'api-clients'

export const isLoggedIn: Access = ({ req: { user } }) => isStaffUser(user)

export const isLoggedInFieldAccess: FieldAccess = ({ req: { user } }) => isStaffUser(user)

export const isStaffOrApiClient: Access = ({ req: { user } }) => isStaffUser(user) || isApiClient(user)

// ── Legacy role helpers (kept for hidden collections that still reference them) ──

export type Role = 'admin' | 'editor' | 'brandContributor' | 'sponsorManager'

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

export const isAdminFieldAccess: FieldAccess = ({ req: { user } }) => checkRole(['admin'], user)

export const isAdminOrEditorFieldAccess: FieldAccess = ({ req: { user } }) =>
  checkRole(['admin', 'editor'], user)
