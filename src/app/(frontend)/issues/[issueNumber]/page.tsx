import React from 'react'
import config from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type RichTextNode = {
  type: string
  text?: string
  children?: RichTextNode[]
}

function renderRichText(content: unknown): React.ReactNode {
  if (!content || typeof content !== 'object') return null
  const root = (content as { root?: { children?: RichTextNode[] } }).root
  if (!root?.children) return null

  return root.children.map((node, i) => {
    if (node.type === 'paragraph') {
      const text = node.children?.map((c) => c.text || '').join('') || ''
      if (!text) return <br key={i} />
      return <p key={i} style={{ marginBottom: '1rem' }}>{text}</p>
    }
    return null
  })
}

export default async function IssuePage({ params }: { params: Promise<{ issueNumber: string }> }): Promise<React.JSX.Element> {
  const { issueNumber } = await params
  const payload = await getPayload({ config })

  // Fetch the issue
  const issueResult = await payload.find({
    collection: 'issues',
    where: { issueNumber: { equals: Number(issueNumber) } },
    limit: 1,
  })

  const issue = issueResult.docs[0] as Record<string, any>
  if (!issue) notFound()

  // Fetch articles for this issue with populated verticals
  const articlesResult = await payload.find({
    collection: 'articles',
    where: {
      issue: { equals: issue.id },
      status: { equals: 'published' },
    },
    sort: 'displayOrder',
    depth: 1,
  })

  const articles = articlesResult.docs as Record<string, any>[]
  const editorLetter = issue.editorLetter as { title?: string; body?: unknown; signoff?: string } | undefined

  return (
    <div>
      {/* Issue Hero */}
      <section style={{
        background: 'var(--color-card-bg)',
        padding: '4rem 2rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '0.8rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          marginBottom: '0.75rem',
        }}>
          {(issue.title as string) || `Issue ${issue.issueNumber}`}
        </p>
        {issue.themeTagline && (
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            fontWeight: 400,
            maxWidth: '700px',
            margin: '0 auto 1rem',
            lineHeight: 1.2,
            fontStyle: 'italic',
          }}>
            {issue.themeTagline as string}
          </h1>
        )}
        {issue.themeSubheading && (
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
            {issue.themeSubheading as string}
          </p>
        )}
      </section>

      {/* Editor's Letter */}
      {editorLetter?.body && (
        <section style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '3rem 2rem',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            fontWeight: 400,
            marginBottom: '1.5rem',
          }}>
            {editorLetter.title || 'Letter from the Editor'}
          </h2>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', lineHeight: 1.8, color: '#333' }}>
            {renderRichText(editorLetter.body)}
          </div>
          {editorLetter.signoff && (
            <p style={{
              marginTop: '1.5rem',
              fontStyle: 'italic',
              color: 'var(--color-text-muted)',
            }}>
              {editorLetter.signoff}
            </p>
          )}
        </section>
      )}

      {/* In This Issue */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '3rem 2rem',
      }}>
        <h2 style={{
          fontSize: '0.8rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          marginBottom: '2.5rem',
        }}>
          In This Issue
        </h2>

        {/* Flagship article */}
        {articles.filter((a: any) => a.isFlagship).map((article: any) => {
          const vertical = article.vertical && typeof article.vertical === 'object' ? article.vertical : null
          return (
            <div key={article.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '2rem',
              paddingBottom: '2.5rem',
              marginBottom: '2.5rem',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '5rem',
                fontWeight: 300,
                color: 'var(--color-border)',
                lineHeight: 1,
              }}>
                {String(article.displayOrder || 1).padStart(2, '0')}
              </span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{
                    border: '1px solid var(--color-text)',
                    padding: '0.15rem 0.6rem',
                    fontSize: '0.65rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}>
                    Flagship
                  </span>
                  {vertical && (
                    <span style={{
                      fontSize: '0.7rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                    }}>
                      {vertical.name}
                    </span>
                  )}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: '0.5rem',
                }}>
                  <a href={`/articles/${article.slug}`}>{article.title}</a>
                </h3>
                {article.dek && (
                  <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px' }}>{article.dek}</p>
                )}
              </div>
            </div>
          )
        })}

        {/* Supporting articles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2.5rem',
        }}>
          {articles.filter((a: any) => !a.isFlagship).map((article: any) => {
            const vertical = article.vertical && typeof article.vertical === 'object' ? article.vertical : null
            return (
              <div key={article.id}>
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '3.5rem',
                  fontWeight: 300,
                  color: 'var(--color-border)',
                  lineHeight: 1,
                  display: 'block',
                  marginBottom: '0.5rem',
                }}>
                  {String(article.displayOrder || '').padStart(2, '0')}
                </span>
                {vertical && (
                  <p style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: '0.4rem',
                  }}>
                    {vertical.name}
                  </p>
                )}
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}>
                  <a href={`/articles/${article.slug}`}>{article.title}</a>
                </h3>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
