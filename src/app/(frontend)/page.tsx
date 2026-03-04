import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { ArticleCard } from '@/components/ArticleCard'
import { EpisodeCard } from '@/components/EpisodeCard'

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [articles, episodes] = await Promise.all([
    payload.find({
      collection: 'articles',
      where: { status: { equals: 'published' } },
      sort: '-publishDate',
      limit: 6,
      depth: 2,
    }),
    payload.find({
      collection: 'podcast-episodes',
      where: { status: { equals: 'published' } },
      sort: '-publishDate',
      limit: 3,
      depth: 2,
    }),
  ])

  return (
    <>
      {/* Hero */}
      <section className="bg-brand py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Transformidable
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Articles, podcasts, and insights from the Transformidable media ecosystem.
          </p>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest Articles</h2>
          <Link
            href="/articles"
            className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            View all &rarr;
          </Link>
        </div>
        {articles.docs.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.docs.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted">No articles published yet.</p>
        )}
      </section>

      {/* Latest Podcast Episodes */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Latest Episodes</h2>
            <Link
              href="/podcast"
              className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
          {episodes.docs.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {episodes.docs.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          ) : (
            <p className="text-text-muted">No episodes published yet.</p>
          )}
        </div>
      </section>
    </>
  )
}
