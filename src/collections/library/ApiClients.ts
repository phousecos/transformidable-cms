import type { CollectionConfig } from 'payload'
import { isLoggedIn } from '../../access/checkRole.ts'

// Connected systems (KADE) that read the J. Lynne library through the API.
// They sign in with an API key only (`Authorization: api-clients API-Key
// <key>`), never with a password, and can't open the admin. Collections grant
// them access explicitly (Assets and Asset Files, read-only); everywhere else
// they are treated as anonymous. Kept apart from `users` so that a client can
// never pick up a person's access by accident.
export const ApiClients: CollectionConfig = {
  slug: 'api-clients',
  labels: { singular: 'API Client', plural: 'API Clients' },
  admin: {
    useAsTitle: 'name',
    group: 'J. Lynne Library',
    description: 'Read-only API keys for connected systems such as KADE. Tick "Enable API Key" and save to issue one.',
  },
  auth: {
    useAPIKey: true,
    disableLocalStrategy: true,
  },
  access: {
    create: isLoggedIn,
    read: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
