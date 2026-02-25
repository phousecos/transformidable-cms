/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap.js'

export const maxDuration = 60

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = async ({ params, searchParams }: Args) => {
  try {
    const result = await RootPage({ config, params, searchParams, importMap })
    return (
      <>
        {result}
        <div data-debug-rootpage="rendered" style={{ display: 'none' }} />
      </>
    )
  } catch (error: unknown) {
    // Re-throw Next.js internal errors (redirect, notFound)
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof (error as { digest: unknown }).digest === 'string'
    ) {
      throw error
    }
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : ''
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui', color: 'red', background: 'white' }}>
        <h1>RootPage Error</h1>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '1rem' }}>
          {message}
        </pre>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px', color: '#666' }}>
          {stack}
        </pre>
      </div>
    )
  }
}

export default Page
