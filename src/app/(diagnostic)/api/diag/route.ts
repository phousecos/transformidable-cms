import { getPayload } from 'payload'
import config from '@payload-config'
import { headers, cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {}

  try {
    // 1. Initialize Payload
    const payload = await getPayload({ config })
    results.payloadInit = 'OK'
    results.payloadVersion = (payload as any).version || 'unknown'

    // 2. Count users
    const userCount = await payload.count({
      collection: 'users',
      overrideAccess: true,
    })
    results.userCount = userCount.totalDocs

    // 3. Check findOne (what RootPage uses for dbHasUser)
    const firstUser = await payload.db.findOne({
      collection: 'users',
      req: {} as any,
    })
    results.findOneResult = firstUser
    results.findOneType = typeof firstUser
    results.dbHasUser = !!firstUser

    // 4. Check auth state from cookies
    const cookieStore = await cookies()
    const payloadToken = cookieStore.get('payload-token')
    results.hasPayloadToken = !!payloadToken
    results.payloadTokenValue = payloadToken ? payloadToken.value.substring(0, 10) + '...' : null

    // 5. Check what admin views are registered
    results.adminViews = Object.keys((payload.config.admin as any)?.views || {})
    results.collections = payload.config.collections.map((c: any) => c.slug)
    results.userSlug = payload.config.admin?.user

    // 6. Check auth config
    const userCollection = payload.config.collections.find((c: any) => c.slug === 'users')
    results.authConfig = {
      disableLocalStrategy: (userCollection?.auth as any)?.disableLocalStrategy ?? false,
      useAPIKey: (userCollection?.auth as any)?.useAPIKey ?? false,
    }

    // 7. Check serverURL
    results.serverURL = payload.config.serverURL
    results.adminRoute = (payload.config.routes as any)?.admin || '/admin'

  } catch (error: any) {
    results.error = error.message
    results.stack = error.stack?.split('\n').slice(0, 5)
  }

  return Response.json(results, {
    headers: { 'Content-Type': 'application/json' },
  })
}
