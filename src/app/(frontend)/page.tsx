// @ts-nocheck
import React from 'react'
import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })

  // Fetch the latest published issue
  const issuesResult = await payload.find({
    collection: 'issues',
    where: { status: { equals: 'published' } },
    sort: '-issueNumber',
    limit: 1,
  })
  const latestIssue = issuesResult.docs[0] as Record<string, any> | undefined

  // Fetch site settings
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' }) as Record<string, any>
  const founderLetter = siteSettings.founderLetter as { title?: string; isVisible?: boolean } | undefined

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'var(--color-card-bg)',
        padding: '5rem 2rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '3.5rem',
          fontWeight: 400,
          letterSpacing: '-0.02em',
          marginBottom: '0.75rem',
        }}>
          {(siteSettings.publicationName as string) || 'Transformidable'}
        </h1>
        {siteSettings.tagline && (
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.2rem',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
          }}>
            {siteSettings.tagline as string}
          </p>
        )}
      </section>

      {/* Current Issue CTA */}
      {latestIssue && (
        <section style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '3rem 2rem',
          textAlign: 'center',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <p style={{
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '0.75rem',
          }}>
            Current Issue
          </p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.8rem',
            fontWeight: 400,
            marginBottom: '0.5rem',
          }}>
            {latestIssue.title as string}
          </h2>
          {latestIssue.themeTagline && (
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              color: 'var(--color-text-muted)',
              marginBottom: '1.5rem',
            }}>
              {latestIssue.themeTagline as string}
            </p>
          )}
          <a
            href={`/issues/${latestIssue.issueNumber}`}
            style={{
              display: 'inline-block',
              background: 'var(--color-text)',
              color: 'var(--color-white)',
              padding: '0.7rem 2rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            Read Issue {latestIssue.issueNumber as number} →
          </a>
        </section>
      )}

      {/* Founder Letter teaser */}
      {founderLetter?.isVisible && founderLetter.title && (
        <section style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '3rem 2rem',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.2rem',
            fontStyle: 'italic',
            color: 'var(--color-text-muted)',
          }}>
            {founderLetter.title}
          </p>
        </section>
      )}
    </div>
  )
}
