import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { PodcastEpisode, Media, Author } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

async function getEpisode(slug: string): Promise<PodcastEpisode | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'podcast-episodes',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    depth: 2,
    limit: 1,
  })
  return result.docs[0] || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const episode = await getEpisode(slug)
  if (!episode) return {}
  return {
    title: episode.title,
    description: episode.description || undefined,
  }
}

export default async function EpisodePage({ params }: Props) {
  const { slug } = await params
  const episode = await getEpisode(slug)
  if (!episode) notFound()

  const image = episode.featuredImage as Media | null | undefined
  const guest = episode.guest as Author | null | undefined
  const guestHeadshot = guest?.headshot as Media | null | undefined

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <header>
        <Link
          href="/podcast"
          className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          &larr; All Episodes
        </Link>
        <p className="mt-4 text-sm font-medium text-accent">
          Season {episode.season} &middot; Episode {episode.episodeNumber}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{episode.title}</h1>

        {episode.publishDate && (
          <time className="mt-3 block text-sm text-text-muted" dateTime={episode.publishDate}>
            {new Date(episode.publishDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        )}
      </header>

      {/* Featured image */}
      {image?.url && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-lg">
          <Image
            src={image.sizes?.hero?.url || image.url}
            alt={image.alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* Audio embed */}
      {episode.audioUrl && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
            Listen
          </p>
          <audio controls className="w-full" preload="metadata">
            <source src={episode.audioUrl} />
            <a href={episode.audioUrl} className="text-accent hover:text-accent-hover">
              Download episode
            </a>
          </audio>
        </div>
      )}

      {/* Guest */}
      {guest && (
        <div className="mt-8 flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
          {guestHeadshot?.url && (
            <Image
              src={guestHeadshot.sizes?.thumbnail?.url || guestHeadshot.url}
              alt={guestHeadshot.alt}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-medium text-brand">{guest.name}</p>
            {guest.role && <p className="text-xs text-text-muted">{guest.role}</p>}
          </div>
        </div>
      )}

      {/* Description */}
      {episode.description && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">About This Episode</h2>
          <p className="mt-2 text-text-muted leading-relaxed">{episode.description}</p>
        </div>
      )}

      {/* Show Notes */}
      {episode.showNotes && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold">Show Notes</h2>
          <div className="prose mt-4 max-w-none">
            <RichText data={episode.showNotes} />
          </div>
        </div>
      )}

      {/* Transcript */}
      {episode.transcript && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold">Transcript</h2>
          <div className="prose mt-4 max-w-none">
            <RichText data={episode.transcript} />
          </div>
        </div>
      )}
    </article>
  )
}
