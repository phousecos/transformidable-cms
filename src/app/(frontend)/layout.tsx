import React from "react";
import Script from "next/script";
import "./globals.css";

// Canonical public site URL. Set NEXT_PUBLIC_SITE_URL in the environment to the
// production domain so absolute URLs (OpenGraph, sitemap, canonicals) are right.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://transformidablethinking.com";

const SITE_TITLE = "Transformidable | Evidence for Better Transformation Governance";
const SITE_DESCRIPTION =
  "Independent research on how governance, leadership, and institutional decision-making shape whether organizational transformation succeeds or fails.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TITLE,
    // Child pages set a bare title (e.g. "Case Files") and this appends the brand.
    template: "%s | Transformidable",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Transformidable",
  keywords: [
    "transformation governance",
    "governance research",
    "organizational transformation",
    "institutional resilience",
    "leadership",
    "governance case files",
  ],
  authors: [{ name: "Transformidable" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Transformidable",
    url: siteUrl,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Transformidable" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32-new.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192-new.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon-new.png",
  },
};

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script id="impact-verification" strategy="afterInteractive">
          {`(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7237205-9a8c-4554-8285-fab54129af9a1.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');`}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
