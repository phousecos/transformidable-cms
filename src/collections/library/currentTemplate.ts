import type { Endpoint, Where } from 'payload'

import {
  AUDIENCE_OPTIONS,
  MESSAGE_TRACK_OPTIONS,
  SECTOR_EDITION_OPTIONS,
  SEQUENCE_OPTIONS,
  STEP_OPTIONS,
} from './messageOptions.ts'

const codes = (options: { value: string }[]) => options.map((o) => o.value)

/**
 * GET /api/message-templates/current?sequence=cohort&step=week-2&track=T2&sectorEdition=credit-union&audience=all
 *
 * The current Final template for a step, for KADE. When nothing matches exactly it
 * falls back in this order: the sector edition to "all", then the audience to "all",
 * then the track to "any", and says which fallbacks it used. "Current" is the latest
 * versionDate, then the most recently updated. Answers 404 when nothing is Final.
 */
export const currentTemplate: Endpoint = {
  path: '/current',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const param = (name: string, fallback?: string) => req.searchParams.get(name) || fallback || ''
    const sequence = param('sequence')
    const step = param('step')
    const track = param('track', 'any')
    const sectorEdition = param('sectorEdition', 'all')
    const audience = param('audience', 'all')
    const invalid = [
      !codes(SEQUENCE_OPTIONS).includes(sequence) && `sequence must be one of ${codes(SEQUENCE_OPTIONS).join(', ')}`,
      !codes(STEP_OPTIONS).includes(step) && `step must be one of ${codes(STEP_OPTIONS).join(', ')}`,
      !codes(MESSAGE_TRACK_OPTIONS).includes(track) && `track must be one of ${codes(MESSAGE_TRACK_OPTIONS).join(', ')}`,
      !codes(SECTOR_EDITION_OPTIONS).includes(sectorEdition) &&
        `sectorEdition must be one of ${codes(SECTOR_EDITION_OPTIONS).join(', ')}`,
      !codes(AUDIENCE_OPTIONS).includes(audience) && `audience must be one of ${codes(AUDIENCE_OPTIONS).join(', ')}`,
    ].filter(Boolean)
    if (invalid.length) return Response.json({ error: invalid.join('; ') }, { status: 400 })

    // Every Final candidate in one query; ranked below by how little falls back.
    const where: Where = {
      and: [
        { status: { equals: 'final' } },
        { sequence: { equals: sequence } },
        { step: { equals: step } },
        { track: { in: [...new Set([track, 'any'])] } },
        { sectorEdition: { in: [...new Set([sectorEdition, 'all'])] } },
        { audience: { in: [...new Set([audience, 'all'])] } },
      ],
    }
    const { docs } = await req.payload.find({
      collection: 'message-templates',
      where,
      sort: ['-versionDate', '-updatedAt'],
      limit: 100,
      depth: 0,
      overrideAccess: false,
      user: req.user,
      req,
    })

    // Track weighs most, then audience, then sector edition; ties keep the sort order.
    const misses = (d: (typeof docs)[number]) =>
      (d.track !== track ? 4 : 0) + (d.audience !== audience ? 2 : 0) + (d.sectorEdition !== sectorEdition ? 1 : 0)
    const template = docs.reduce<(typeof docs)[number] | undefined>((best, d) => (!best || misses(d) < misses(best) ? d : best), undefined)
    if (!template) {
      return Response.json({ error: `No Final ${sequence} ${step} template for ${track}` }, { status: 404 })
    }

    return Response.json({
      template: {
        id: template.id,
        name: template.name,
        subject: template.subject,
        body: template.body,
        version: template.version ?? null,
        versionDate: template.versionDate ?? null,
        sequence: template.sequence,
        step: template.step,
        track: template.track,
        sectorEdition: template.sectorEdition,
        audience: template.audience,
        updatedAt: template.updatedAt,
      },
      fallback: {
        track: template.track !== track,
        audience: template.audience !== audience,
        sectorEdition: template.sectorEdition !== sectorEdition,
      },
    })
  },
}
