'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: 'red' }}>Admin Error</h1>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '1rem' }}>
        {error.message}
      </pre>
      {error.digest && <p>Digest: {error.digest}</p>}
      <button onClick={reset}>Try again</button>
    </div>
  )
}
