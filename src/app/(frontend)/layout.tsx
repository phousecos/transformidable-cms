import React from "react";
import "./globals.css";

export const metadata = {
  title: "Transformidable",
  description: "Where Technology Meets Leadership",
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
