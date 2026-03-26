// @ts-nocheck
import React from 'react'
import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export default async function ReadingRoomPage() {
  const payload = await getPayload({ config })

  // Fetch all published books
  const booksResult = await payload.find({
    collection: 'books',
    where: { status: { equals: 'published' } },
    sort: '-published_date',
    depth: 1,
  })
  const books = booksResult.docs

  // Fetch the Transformidable Feature global
  let transformidableFeature: Record<string, unknown> | null = null
  try {
    transformidableFeature = await payload.findGlobal({ slug: 'transformidable-feature' }) as Record<string, unknown>
  } catch {
    // Global may not have data yet
  }

  // Find current Book Club selection
  const currentSelection = books.find((b: any) => b.is_current_selection)

  // Group books by section
  const sections: Record<string, { label: string; books: any[] }> = {
    book_club: { label: 'Illuminate Book Club', books: [] },
    career_leadership: { label: 'Career & Leadership', books: [] },
    pmo_technology: { label: 'PMO & Technology', books: [] },
    staff_picks: { label: 'Staff Picks', books: [] },
  }
  for (const book of books as any[]) {
    if (book.section && sections[book.section]) {
      sections[book.section].books.push(book)
    }
  }

  function getCoverUrl(book: any): string | null {
    if (!book.cover_image) return null
    if (typeof book.cover_image === 'object' && book.cover_image.url) return book.cover_image.url
    return null
  }

  function getBookLinks(book: any) {
    const links: { label: string; url: string }[] = []
    if (book.bookshop_url) links.push({ label: 'Bookshop.org', url: book.bookshop_url })
    if (book.amazon_url) links.push({ label: 'Amazon', url: book.amazon_url })
    if (book.payhip_url) links.push({ label: 'Buy Direct', url: book.payhip_url })
    return links
  }

  return (
    <div>
      {/* Page Header */}
      <section style={{
        background: 'var(--color-card-bg)',
        padding: '3rem 2rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.5rem',
          fontWeight: 400,
          marginBottom: '0.5rem',
        }}>
          The Reading Room
        </h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
          Curated reads for technology leaders, change-makers, and lifelong learners.
        </p>
      </section>

      {/* Transformidable Feature Strip */}
      {transformidableFeature && (transformidableFeature.tagline || transformidableFeature.cta_url) && (
        <section style={{
          background: 'var(--color-text)',
          color: 'var(--color-white)',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {transformidableFeature.cover_image && typeof transformidableFeature.cover_image === 'object' && (transformidableFeature.cover_image as any).url && (
              <img
                src={(transformidableFeature.cover_image as any).url}
                alt="Transformidable"
                style={{ height: '60px', width: 'auto' }}
              />
            )}
            <div>
              <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>Transformidable</strong>
              {transformidableFeature.tagline && (
                <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{transformidableFeature.tagline as string}</p>
              )}
              {transformidableFeature.launch_label && (
                <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.2rem' }}>{transformidableFeature.launch_label as string}</p>
              )}
            </div>
          </div>
          {transformidableFeature.cta_url && (
            <a
              href={transformidableFeature.cta_url as string}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-white)',
                padding: '0.6rem 1.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {(transformidableFeature.cta_label as string) || 'Pre-Order →'}
            </a>
          )}
        </section>
      )}

      {/* Current Book Club Selection Hero */}
      {currentSelection && (
        <section style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '3rem 2rem',
          display: 'flex',
          gap: '2.5rem',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {getCoverUrl(currentSelection) && (
            <img
              src={getCoverUrl(currentSelection)!}
              alt={currentSelection.title as string}
              style={{ width: '200px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
            />
          )}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <p style={{
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: '0.5rem',
            }}>
              Current Book Club Selection
            </p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.8rem',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '0.3rem',
            }}>
              {currentSelection.title as string}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              by {currentSelection.author as string}
            </p>
            {currentSelection.editorial_note && (
              <p style={{ fontFamily: 'var(--font-serif)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {currentSelection.editorial_note as string}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {getBookLinks(currentSelection).map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.5rem 1.2rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: link.label === 'Buy Direct' ? 'var(--color-accent)' : 'var(--color-text)',
                    color: 'var(--color-white)',
                    letterSpacing: '0.03em',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Book Sections */}
      {Object.entries(sections).map(([key, section]) => {
        if (section.books.length === 0) return null
        return (
          <section key={key} style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '2.5rem 2rem',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <h2 style={{
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: '1.5rem',
            }}>
              {section.label}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '2rem',
            }}>
              {section.books.map((book: any) => (
                <div key={book.id}>
                  {getCoverUrl(book) && (
                    <img
                      src={getCoverUrl(book)!}
                      alt={book.title}
                      style={{
                        width: '100%',
                        aspectRatio: '2/3',
                        objectFit: 'cover',
                        marginBottom: '0.75rem',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      }}
                    />
                  )}
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    marginBottom: '0.2rem',
                  }}>
                    {book.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {book.author}
                  </p>
                  {book.illuminate_badge && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '0.4rem',
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: 'var(--color-accent)',
                      color: 'var(--color-white)',
                      padding: '0.15rem 0.5rem',
                    }}>
                      Illuminate
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {/* Empty state */}
      {books.length === 0 && (
        <section style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: 'var(--color-text-muted)',
        }}>
          <p>The Reading Room is being curated. Check back soon.</p>
        </section>
      )}
    </div>
  )
}
