import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-32 text-center">
      <h1 className="text-6xl font-bold text-brand">404</h1>
      <p className="mt-4 text-lg text-text-muted">The page you're looking for doesn't exist.</p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
