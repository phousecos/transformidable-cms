import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Article, Media, Author } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

async function getArticle(slug: string): Promise<Article | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'articles',
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
  const article = await getArticle(slug)
  if (!article) return {}
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const image = article.featuredImage as Media | null | undefined
  const author = article.author as Author | null | undefined
  const authorHeadshot = author?.headshot as Media | null | undefined

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <header>
        <Link
          href="/articles"
          className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          &larr; All Articles
        </Link>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>

        {/* Author & date */}
        <div className="mt-6 flex items-center gap-4">
          {authorHeadshot?.url && (
            <Image
              src={authorHeadshot.sizes?.thumbnail?.url || authorHeadshot.url}
              alt={authorHeadshot.alt}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          )}
          <div className="text-sm">
            {author?.name && <p className="font-medium text-brand">{author.name}</p>}
            {article.publishDate && (
              <time className="text-text-muted" dateTime={article.publishDate}>
                {new Date(article.publishDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            )}
          </div>
        </div>
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

      {/* Body */}
      <div className="prose prose-lg mt-10 max-w-none">
        <RichText data={article.body} />
      </div>
    </article>
  )
}
