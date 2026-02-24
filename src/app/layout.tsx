import React from 'react'

export const metadata = {
  title: 'Transformidable CMS',
  description: 'Content Management System for the Transformidable Ecosystem',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
