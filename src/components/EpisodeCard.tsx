import Link from 'next/link'
import Image from 'next/image'
import type { PodcastEpisode, Media, Author } from '@/payload-types'

export function EpisodeCard({ episode }: { episode: PodcastEpisode }) {
  const image = episode.featuredImage as Media | null | undefined
  const guest = episode.guest as Author | null | undefined

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      {image?.url && (
        <Link href={`/podcast/${episode.slug}`} className="relative aspect-video overflow-hidden">
          <Image
            src={image.sizes?.card?.url || image.url}
            alt={image.alt}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/podcast/${episode.slug}`}>
          <h3 className="text-lg font-semibold leading-snug text-brand group-hover:text-accent transition-colors">
            {episode.title}
          </h3>
        </Link>
        <p className="mt-1 text-xs font-medium text-accent">
          Season {episode.season} &middot; Episode {episode.episodeNumber}
        </p>
        {episode.description && (
          <p className="mt-2 line-clamp-3 text-sm text-text-muted">{episode.description}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-text-muted">
          {guest?.name && <span>with {guest.name}</span>}
          {guest?.name && episode.publishDate && <span>&middot;</span>}
          {episode.publishDate && (
            <time dateTime={episode.publishDate}>
              {new Date(episode.publishDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          )}
        </div>
      </div>
    </article>
  )
}
