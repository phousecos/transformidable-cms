import React from "react";
import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Transformidable",
  description: "Where Technology Meets Leadership",
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
