import React from 'react'

/* Root layout is a pass-through because Payload's RootLayout
   (in the (payload) route group) renders its own <html> and <body>. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
