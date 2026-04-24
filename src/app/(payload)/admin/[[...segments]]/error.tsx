'use client'

// Generic error boundary for the admin route group. We deliberately do not
// surface error.message or stack to the rendered page — Payload error messages
// can leak query state, internal paths, and user-record hints to anyone who
// reaches an admin error (the login page is part of /admin and is reachable
// pre-auth). Real diagnostics are still in server logs and via the digest.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Something went wrong</h1>
      <p>The admin encountered an unexpected error. Please try again.</p>
      {error.digest && (
        <p style={{ color: '#666', fontSize: '0.85rem' }}>Reference: {error.digest}</p>
      )}
      <button
        onClick={reset}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  )
}
