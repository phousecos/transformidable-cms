import React from 'react'
import './globals.css'

export const metadata = {
  title: 'Transformidable',
  description: 'Where Technology Meets Leadership',
}

function Header() {
  return (
    <header style={{
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-white)',
      padding: '1.25rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <a href="/" style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1.5rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: 'var(--color-text)',
      }}>
        Transformidable
      </a>
      <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        <a href="/" style={{ color: 'var(--color-text-muted)' }}>Home</a>
        <a href="/issues/1" style={{ color: 'var(--color-text-muted)' }}>Current Issue</a>
        <a href="/reading-room" style={{ color: 'var(--color-text-muted)' }}>Reading Room</a>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      padding: '2rem',
      textAlign: 'center',
      fontSize: '0.8rem',
      color: 'var(--color-text-muted)',
      background: 'var(--color-white)',
    }}>
      © {new Date().getFullYear()} Transformidable — Powerhouse Companies
    </footer>
  )
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ minHeight: '80vh' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
