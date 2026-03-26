import React from "react";
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
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
