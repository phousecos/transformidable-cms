import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Transformidable',
    template: '%s | Transformidable',
  },
  description:
    'Articles, podcasts, and insights from the Transformidable media ecosystem.',
}

function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-brand">
          Transformidable
        </Link>
        <ul className="flex items-center gap-6 text-sm font-medium">
          <li>
            <Link href="/articles" className="text-text-muted hover:text-brand transition-colors">
              Articles
            </Link>
          </li>
          <li>
            <Link href="/podcast" className="text-text-muted hover:text-brand transition-colors">
              Podcast
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Transformidable Media. All rights reserved.
          </p>
          <ul className="flex gap-6 text-sm text-text-muted">
            <li>
              <a href="https://jerribland.com" className="hover:text-brand transition-colors">
                Jerri Bland
              </a>
            </li>
            <li>
              <a href="https://unlimitedpowerhouse.com" className="hover:text-brand transition-colors">
                Unlimited Powerhouse
              </a>
            </li>
            <li>
              <a href="https://agentpmo.com" className="hover:text-brand transition-colors">
                AgentPMO
              </a>
            </li>
            <li>
              <a href="https://prept.com" className="hover:text-brand transition-colors">
                Prept
              </a>
            </li>
            <li>
              <a href="https://lumynr.com" className="hover:text-brand transition-colors">
                Lumynr
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-surface font-sans text-text antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
