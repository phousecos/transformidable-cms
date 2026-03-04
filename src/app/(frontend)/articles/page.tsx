import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { ArticleCard } from '@/components/ArticleCard'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Browse all published articles from Transformidable.',
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const payload = await getPayloadClient()

  const articles = await payload.find({
    collection: 'articles',
    where: { status: { equals: 'published' } },
    sort: '-publishDate',
    limit: 12,
    page,
    depth: 2,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Articles</h1>
      <p className="mt-2 text-text-muted">
        Insights across branding, coaching, project management, and more.
      </p>

      {articles.docs.length > 0 ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.docs.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-text-muted">No articles published yet.</p>
      )}

      {/* Pagination */}
      {articles.totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-4">
          {articles.hasPrevPage && (
            <a
              href={`/articles?page=${page - 1}`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              &larr; Previous
            </a>
          )}
          <span className="text-sm text-text-muted">
            Page {articles.page} of {articles.totalPages}
          </span>
          {articles.hasNextPage && (
            <a
              href={`/articles?page=${page + 1}`}
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
