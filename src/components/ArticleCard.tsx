import Link from 'next/link'
import Image from 'next/image'
import type { Article, Media, Author } from '@/payload-types'

export function ArticleCard({ article }: { article: Article }) {
  const image = article.featuredImage as Media | null | undefined
  const author = article.author as Author | null | undefined

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      {image?.url && (
        <Link href={`/articles/${article.slug}`} className="relative aspect-video overflow-hidden">
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
        <Link href={`/articles/${article.slug}`}>
          <h3 className="text-lg font-semibold leading-snug text-brand group-hover:text-accent transition-colors">
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm text-text-muted">{article.excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-text-muted">
          {author?.name && <span>{author.name}</span>}
          {author?.name && article.publishDate && <span>&middot;</span>}
          {article.publishDate && (
            <time dateTime={article.publishDate}>
              {new Date(article.publishDate).toLocaleDateString('en-US', {
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
