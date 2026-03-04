import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { EpisodeCard } from '@/components/EpisodeCard'

export const metadata: Metadata = {
  title: 'Podcast',
  description: 'Listen to all published podcast episodes from Transformidable.',
}

export default async function PodcastPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const payload = await getPayloadClient()

  const episodes = await payload.find({
    collection: 'podcast-episodes',
    where: { status: { equals: 'published' } },
    sort: '-publishDate',
    limit: 12,
    page,
    depth: 2,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Podcast</h1>
      <p className="mt-2 text-text-muted">
        Conversations on leadership, business, and personal growth.
      </p>

      {episodes.docs.length > 0 ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {episodes.docs.map((episode) => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-text-muted">No episodes published yet.</p>
      )}

      {/* Pagination */}
      {episodes.totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-4">
          {episodes.hasPrevPage && (
            <a
              href={`/podcast?page=${page - 1}`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              &larr; Previous
            </a>
          )}
          <span className="text-sm text-text-muted">
            Page {episodes.page} of {episodes.totalPages}
          </span>
          {episodes.hasNextPage && (
            <a
              href={`/podcast?page=${page + 1}`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Next &rarr;
            </a>
          )}
        </nav>
      )}
    </div>
  )
}
